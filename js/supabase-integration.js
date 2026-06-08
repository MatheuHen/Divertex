/**
 * supabase-integration.js
 * Cola Supabase ao app Divertex via window.DivertexApp.
 * Carregado como <script type="module"> DEPOIS de app.js.
 * Se Supabase não estiver configurado, tudo é no-op — o jogo funciona normalmente.
 *
 * PKCE callback (/auth/callback?code=xxx) é tratado EXPLICITAMENTE aqui.
 * detectSessionInUrl está desligado em supabase-client.js para evitar double-exchange.
 */

import { isReady, getClient } from './supabase-client.js';
import { onAuthStateChange, getProfile, getSession, signOut } from './auth-service.js';
import { saveSession, saveRound, submitGameStats } from './game-service.js';
import { renderAuthPanel, updateAuthPanel, renderAuthGate, renderPasswordResetGate, openProfileModal } from './auth-ui.js';
import { openFriendsPanel } from './friends-ui.js';
import { initRoomUI } from './room-ui.js';

// Flags lidas do script inline em index.html — capturam o estado da URL ANTES
// de qualquer módulo defer rodar. Scripts inline executam antes de <script type="module">.
const _RECOVERY_ON_LOAD = Boolean(window.__DIVERTEX_RECOVERY);
const _PKCE_ON_LOAD     = Boolean(window.__DIVERTEX_PKCE);

let currentSession   = null;
let currentSessionId = null;

// Bloqueia SIGNED_IN/INITIAL_SESSION(null) durante o exchange PKCE explícito.
let _pkceInProgress = false;
// Bloqueia SIGNED_IN/INITIAL_SESSION durante o fluxo de redefinição de senha.
let _recoveryMode = false;
// Garante que a sessão só seja "tratada" uma vez (evita corrida callback x evento).
let _sessionHandled = false;

// Perfil global — lido pelos minigames e pelo módulo de salas online.
window.DivertexUser = null;
// Exposto para o room-ui consultar a sessão atual sem reimportar o auth-service.
window.DivertexAuth = { getCurrentUser: () => window.DivertexUser };

function getApp() { return window.DivertexApp || null; }

function showAuthGate() {
  const gate = document.getElementById('authGate');
  if (gate) gate.removeAttribute('hidden');
  renderAuthGate();
}

function hideAuthGate() {
  const gate = document.getElementById('authGate');
  if (gate) gate.setAttribute('hidden', '');
  const menu = document.getElementById('screenMenu');
  if (menu) menu.classList.add('screen--active');
}

// Garante que o perfil exista. O trigger handle_new_user normalmente já o cria;
// isto é uma rede de segurança para contas antigas ou casos de borda.
async function _ensureProfile(user) {
  const sb = getClient();
  if (!sb) return null;
  const name = user.user_metadata?.full_name
    || user.user_metadata?.name
    || user.email?.split('@')[0]
    || 'Jogador';
  const { error } = await sb
    .from('profiles')
    .upsert({ id: user.id, display_name: name }, { onConflict: 'id', ignoreDuplicates: true });
  if (error) console.warn('[Divertex] ensure profile falhou:', error.message);
  return getProfile(user.id);
}

// Trata a sessão autenticada. Idempotente (guard _sessionHandled).
// IMPORTANTE: nunca é chamada de dentro do callback de onAuthStateChange sem
// setTimeout — chamadas async do Supabase dentro daquele callback travam o
// lock interno do GoTrue e congelam o app ("Verificando…" infinito).
async function _handleSession(session) {
  if (!session?.user) return;
  if (_sessionHandled) return;
  _sessionHandled = true;
  currentSession = session;

  // 1) Estado mínimo IMEDIATO — não depende da rede.
  const fallbackName = session.user.user_metadata?.full_name
    || session.user.email?.split('@')[0]
    || 'Jogador';
  window.DivertexUser = {
    id: session.user.id,
    name: fallbackName,
    avatar: session.user.user_metadata?.avatar_url || null,
  };
  if (getApp()) getApp().currentUser = { id: session.user.id };

  // 2) Fecha o gate AGORA — entrar nunca depende da rede.
  hideAuthGate();
  _showOnlineButtons(true);

  // 3) Perfil de forma resiliente (não bloqueia a entrada).
  let profile = null;
  try {
    profile = await getProfile(session.user.id);
    if (!profile) profile = await _ensureProfile(session.user);
  } catch (e) {
    console.error('[Divertex] erro ao carregar perfil:', e);
  }

  if (profile) {
    window.DivertexUser.name = profile.display_name || fallbackName;
    window.DivertexUser.avatar = profile.avatar_url || window.DivertexUser.avatar;
  }
  updateAuthPanel({ session, profile });
  window.dispatchEvent(new CustomEvent('divertex:user', { detail: window.DivertexUser }));
}

// ─── PKCE callback explícito (URL com ?code=) ───────────────────────────────
async function _handlePkceCallback() {
  const card = document.getElementById('authGateCard');
  if (card) card.innerHTML = '<div class="authGate__loading">Verificando…</div>';

  const code = new URLSearchParams(window.location.search).get('code');

  if (!code) {
    _pkceInProgress = false;
    window.history.replaceState({}, document.title, '/');
    if (!_sessionHandled) {
      const existing = await getSession().catch(() => null);
      if (existing) _handleSession(existing);
      else renderAuthGate();
    }
    return;
  }

  // Timeout de segurança (10s): se o exchange travar, mostra erro amigável.
  const failTimer = setTimeout(() => {
    _pkceInProgress = false;
    if (!_sessionHandled && !_recoveryMode) _showCallbackError(card);
  }, 10000);

  try {
    const sb = getClient();
    const { data, error } = await sb.auth.exchangeCodeForSession(code);
    clearTimeout(failTimer);
    window.history.replaceState({}, document.title, '/');

    if (error) {
      _pkceInProgress = false;
      console.error('[Divertex] exchange falhou:', error.message);
      if (!_sessionHandled && !_recoveryMode) _showCallbackError(card, error.message);
      return;
    }

    _pkceInProgress = false;
    if (_recoveryMode) return;

    if (data?.session) {
      _handleSession(data.session);
    } else {
      const session = await getSession().catch(() => null);
      if (session) _handleSession(session);
      else if (!_sessionHandled) renderAuthGate();
    }
  } catch (e) {
    clearTimeout(failTimer);
    _pkceInProgress = false;
    console.error('[Divertex] exceção no callback:', e);
    if (!_sessionHandled && !_recoveryMode) _showCallbackError(card, e?.message);
  }
}

function _showCallbackError(card, detail) {
  if (!card) { renderAuthGate(); return; }
  const safeDetail = detail
    ? `<br><small style="opacity:0.55;font-size:11px">${escapeHtml(detail)}</small>`
    : '';
  card.innerHTML = `
    <div class="authGate__recoverHead">
      <div class="authGate__recoverIcon">⚠️</div>
      <div class="authGate__recoverTitle">Erro ao finalizar login</div>
      <p class="authGate__recoverDesc">
        Não foi possível completar o login com Google.${safeDetail}
      </p>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px">
      <button id="cbRetryBtn" class="btn btn--big" type="button" style="width:100%">🔄 Tentar novamente</button>
      <button id="cbBackBtn" class="btn btn--ghost" type="button" style="width:100%">← Voltar para login</button>
    </div>
  `;
  document.getElementById('cbRetryBtn')?.addEventListener('click', () => {
    _pkceInProgress = false;
    window.location.href = window.location.origin;
  });
  document.getElementById('cbBackBtn')?.addEventListener('click', () => {
    _pkceInProgress = false;
    renderAuthGate('login');
  });
}

// ─── Inicialização principal ────────────────────────────────────────────────
async function init() {
  if (!isReady()) {
    console.log('[Divertex] Supabase não configurado — modo local ativo.');
    hideAuthGate();
    renderAuthPanel(null);
    return;
  }

  _recoveryMode = _RECOVERY_ON_LOAD;
  showAuthGate();

  if (_recoveryMode) {
    renderPasswordResetGate();
  } else if (_PKCE_ON_LOAD) {
    _pkceInProgress = true;
    _handlePkceCallback();
  }

  // ATENÇÃO: este callback NÃO pode ser async nem chamar funções async do
  // Supabase diretamente — o GoTrue segura um lock enquanto emite o evento e
  // um await aqui dentro causa deadlock ("Verificando…" infinito). Toda chamada
  // de rede roda via setTimeout, liberando o lock antes de executar.
  onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      _recoveryMode = true;
      _pkceInProgress = false;
      renderPasswordResetGate();
      return;
    }
    if (event === 'USER_UPDATED') _recoveryMode = false;
    if (_recoveryMode) return;
    if (_pkceInProgress && !session) return;

    currentSession = session;

    if (session) {
      _pkceInProgress = false;
      setTimeout(() => { _handleSession(session); }, 0); // fora do lock do GoTrue
    } else {
      _sessionHandled = false;
      updateAuthPanel(null);
      currentSessionId = null;
      window.DivertexUser = null;
      _showOnlineButtons(false);
      showAuthGate();
      if (getApp()) getApp().currentUser = null;
      window.dispatchEvent(new CustomEvent('divertex:user', { detail: null }));
    }
  });

  // Inicializa o módulo de salas online (lê window.DivertexUser quando logar).
  try { initRoomUI(); } catch (e) { console.error('[Divertex] room UI falhou:', e); }

  waitForApp();
}

function waitForApp() {
  if (window.DivertexApp) attachHooks();
  else setTimeout(waitForApp, 100);
}

function attachHooks() {
  const app = getApp();

  app.onRoundComplete = async (roundData) => {
    if (!currentSession || !currentSessionId) return;
    await saveRound(currentSessionId, roundData);
  };

  app.onWinner = async ({ winnerName, totalRounds, totalLivesLost }) => {
    if (!currentSession) return;
    const score = Math.max(0, totalRounds * 10 + 50 - totalLivesLost * 2);
    await submitGameStats({
      wins: 1, rounds: totalRounds, livesLost: totalLivesLost,
      streak: totalRounds, scoreDelta: score,
    });
  };

  const saveBtn = document.getElementById('saveSessionBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!currentSession) { alert('Faça login para salvar a partida.'); return; }
      const state = app.getState?.();
      if (!state) return;

      saveBtn.disabled = true;
      saveBtn.textContent = 'Salvando...';

      const result = await saveSession({
        sessionId: currentSessionId,
        name: `Partida ${new Date().toLocaleDateString('pt-BR')}`,
        gameMode: state.roundMode || 'normal',
        stateJson: { players: state.players, roundMode: state.roundMode, activeWheels: state.activeWheels },
      });

      if (result.sessionId) { currentSessionId = result.sessionId; saveBtn.textContent = 'Salvo ✓'; }
      else saveBtn.textContent = 'Erro ao salvar';

      setTimeout(() => { saveBtn.disabled = false; saveBtn.textContent = '💾 Salvar'; }, 2000);
    });
  }
}

// ── Botões dependentes de login (amigos, perfil, sala) ──────────────────────
function _showOnlineButtons(visible) {
  ['friendsOpenBtn', 'profileOpenBtn', 'roomOpenBtn'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (visible) el.removeAttribute('hidden');
    else el.setAttribute('hidden', '');
  });
}

document.addEventListener('click', e => {
  if (e.target.closest('#friendsOpenBtn')) openFriendsPanel();
  if (e.target.closest('#profileOpenBtn')) openProfileModal();
  if (e.target.closest('#authSignOutBtn')) signOut();
});

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

init();
