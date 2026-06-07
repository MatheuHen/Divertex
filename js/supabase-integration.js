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
import { getGlobalRanking } from './ranking-service.js';
import { renderAuthPanel, updateAuthPanel, renderAuthGate, renderPasswordResetGate } from './auth-ui.js';
import { openFriendsPanel } from './friends-ui.js';

// Flags lidas do script inline em index.html — capturam o estado da URL ANTES
// de qualquer módulo defer rodar. Scripts inline executam antes de <script type="module">.
const _RECOVERY_ON_LOAD = Boolean(window.__DIVERTEX_RECOVERY);
const _PKCE_ON_LOAD     = Boolean(window.__DIVERTEX_PKCE);

let currentSession   = null;
let currentSessionId = null;

// Bloqueia SIGNED_IN/INITIAL_SESSION(null) de fechar ou reabrir o gate enquanto
// o exchange PKCE explícito está em andamento.
let _pkceInProgress = false;

// Bloqueia SIGNED_IN/INITIAL_SESSION enquanto o usuário está no fluxo de
// redefinição de senha — evita que o gate feche antes de salvar a nova senha.
let _recoveryMode = false;

// Garante que a sessão só seja "tratada" uma vez (evita corrida entre o
// callback PKCE explícito e o evento SIGNED_IN do onAuthStateChange).
let _sessionHandled = false;

// Perfil global — lido por likely-game.js e outros minigames
window.DivertexUser = null;

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

// Garante que o perfil exista. O trigger handle_new_user normalmente já o cria,
// mas isto é uma rede de segurança para contas antigas ou casos de borda.
async function _ensureProfile(user) {
  const sb = getClient();
  if (!sb) return null;
  const name = user.user_metadata?.full_name
    || user.user_metadata?.name
    || user.email?.split('@')[0]
    || 'Jogador';
  // RLS profiles_insert_own permite inserir quando auth.uid() = id.
  // O trigger on_profile_created cria player_stats automaticamente.
  const { error } = await sb
    .from('profiles')
    .upsert({ id: user.id, display_name: name }, { onConflict: 'id', ignoreDuplicates: true });
  if (error) console.warn('[AUTH] ensure profile upsert falhou:', error.message);
  return getProfile(user.id);
}

// Trata a sessão autenticada. Idempotente (guard _sessionHandled).
// IMPORTANTE: nunca é chamada de dentro do callback de onAuthStateChange sem
// setTimeout — chamadas async do Supabase dentro daquele callback travam o
// lock interno do GoTrue e congelam o app ("Verificando…" infinito).
async function _handleSession(session) {
  if (!session?.user) return;
  if (_sessionHandled) {
    console.log('[AUTH] sessão já tratada — ignorando duplicata');
    return;
  }
  _sessionHandled = true;
  currentSession = session;
  console.log('[AUTH] auth state set: authenticated');

  // 1) Estado mínimo definido IMEDIATAMENTE — não depende da rede.
  const fallbackName = session.user.user_metadata?.full_name
    || session.user.email?.split('@')[0]
    || 'Jogador';
  window.DivertexUser = {
    id: session.user.id,
    name: fallbackName,
    avatar: session.user.user_metadata?.avatar_url || null,
  };
  if (getApp()) getApp().currentUser = { id: session.user.id };
  console.log('[AUTH] DivertexUser set');

  // 2) Fecha o gate AGORA — entrar no app nunca pode depender da rede.
  hideAuthGate();
  _showFriendsBtn(true);
  console.log('[AUTH] overlay removed');

  // 3) Perfil + ranking de forma resiliente (não bloqueia a entrada).
  let profile = null;
  try {
    console.log('[AUTH] ensure profile started');
    profile = await getProfile(session.user.id);
    if (!profile) {
      console.warn('[AUTH] profile ausente — garantindo criação');
      profile = await _ensureProfile(session.user);
    }
    console.log('[AUTH] ensure profile success:', Boolean(profile));
  } catch (e) {
    console.error('[AUTH] ensure profile error:', e);
  }

  if (profile) {
    window.DivertexUser.name = profile.display_name || fallbackName;
    window.DivertexUser.avatar = profile.avatar_url || window.DivertexUser.avatar;
  }
  updateAuthPanel({ session, profile });

  try {
    await renderGlobalRanking();
  } catch (e) {
    console.error('[AUTH] ranking error:', e);
  }
  console.log('[AUTH] final state: ready');
}

// ─────────────────────────────────────────────────────────────────────────────
// PKCE callback explícito — chamado quando a URL tem ?code=
// detectSessionInUrl está OFF: este é o único lugar que troca o code por sessão.
// ─────────────────────────────────────────────────────────────────────────────
async function _handlePkceCallback() {
  const card = document.getElementById('authGateCard');
  if (card) card.innerHTML = '<div class="authGate__loading">Verificando…</div>';

  console.log('[AUTH] callback detected; path:', window.location.pathname);

  const code = new URLSearchParams(window.location.search).get('code');

  // Sem code: pode ser /auth/callback acessado direto. Se já houver sessão, o
  // listener fecha o gate; senão mostramos o login.
  if (!code) {
    console.log('[AUTH] callback sem code');
    _pkceInProgress = false;
    window.history.replaceState({}, document.title, '/');
    if (!_sessionHandled) {
      const existing = await getSession().catch(() => null);
      if (existing) _handleSession(existing);
      else renderAuthGate();
    }
    return;
  }

  console.log('[AUTH] code found');

  // Timeout de segurança (10s): se o exchange travar, mostra erro amigável.
  const failTimer = setTimeout(() => {
    console.warn('[AUTH] timeout reached');
    _pkceInProgress = false;
    if (!_sessionHandled && !_recoveryMode) _showCallbackError(card);
  }, 10000);

  try {
    const sb = getClient();
    console.log('[AUTH] exchangeCodeForSession started');

    const { data, error } = await sb.auth.exchangeCodeForSession(code);
    clearTimeout(failTimer);

    // Limpa ?code= da URL imediatamente para evitar reuso ao atualizar.
    window.history.replaceState({}, document.title, '/');

    if (error) {
      console.error('[AUTH] exchangeCodeForSession error:', error.message);
      _pkceInProgress = false;
      if (!_sessionHandled && !_recoveryMode) _showCallbackError(card, error.message);
      return;
    }

    console.log('[AUTH] exchangeCodeForSession success');
    _pkceInProgress = false;

    // Recovery via PKCE: o listener disparou PASSWORD_RECOVERY e já mostrou o form.
    if (_recoveryMode) {
      console.log('[AUTH] modo recovery ativo — form de senha exibido');
      return;
    }

    // Trata a sessão diretamente (o guard _sessionHandled evita duplicar com o
    // evento SIGNED_IN que o listener também receberá).
    if (data?.session) {
      console.log('[AUTH] getSession result: sessão via exchange');
      _handleSession(data.session);
    } else {
      const session = await getSession().catch(() => null);
      console.log('[AUTH] getSession result:', Boolean(session));
      if (session) _handleSession(session);
      else if (!_sessionHandled) renderAuthGate();
    }
  } catch (e) {
    clearTimeout(failTimer);
    _pkceInProgress = false;
    console.error('[AUTH] callback exception:', e);
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
      <button id="cbRetryBtn" class="btn btn--big" type="button" style="width:100%">
        🔄 Tentar novamente
      </button>
      <button id="cbBackBtn" class="btn btn--ghost" type="button" style="width:100%">
        ← Voltar para login
      </button>
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

// ─────────────────────────────────────────────────────────────────────────────
// Inicialização principal
// ─────────────────────────────────────────────────────────────────────────────
async function init() {
  console.log('[AUTH] init started | path:', window.location.pathname,
    '| recovery:', _RECOVERY_ON_LOAD, '| pkce:', _PKCE_ON_LOAD);

  if (!isReady()) {
    console.log('[Divertex] Supabase não configurado — modo local ativo.');
    hideAuthGate();
    renderAuthPanel(null);
    return;
  }

  _recoveryMode = _RECOVERY_ON_LOAD;
  showAuthGate();

  if (_recoveryMode) {
    // Implicit flow (hash #type=recovery): mostrar form de nova senha imediatamente
    renderPasswordResetGate();
  } else if (_PKCE_ON_LOAD) {
    // PKCE callback (/auth/callback?code=xxx): exchange explícito
    // _pkceInProgress bloqueia onAuthStateChange(null) de sobrescrever "Verificando..."
    _pkceInProgress = true;
    _handlePkceCallback(); // não aguarda — corre em paralelo com onAuthStateChange
  } else {
    renderGlobalRanking();
  }

  // ATENÇÃO: este callback NÃO pode ser async nem chamar funções async do
  // Supabase diretamente. O GoTrue mantém um lock interno enquanto emite o
  // evento; um `await sb.from(...)` aqui dentro espera o mesmo lock e congela
  // o app ("Verificando…" infinito). Toda chamada de rede roda via setTimeout,
  // que devolve o controle e libera o lock antes de executar.
  onAuthStateChange((event, session) => {
    console.log('[AUTH] event:', event, '| hasSession:', Boolean(session));

    // PASSWORD_RECOVERY: link de recovery clicado (implicit ou PKCE)
    if (event === 'PASSWORD_RECOVERY') {
      _recoveryMode = true;
      _pkceInProgress = false;
      renderPasswordResetGate();
      return;
    }

    // USER_UPDATED: senha salva → sai do modo recovery e cai no fluxo normal
    if (event === 'USER_UPDATED') {
      _recoveryMode = false;
      // fall-through intencional
    }

    // Durante recovery, bloqueia SIGNED_IN/INITIAL_SESSION para não fechar o
    // formulário de nova senha prematuramente
    if (_recoveryMode) return;

    // Durante exchange PKCE explícito, bloqueia INITIAL_SESSION(null) de
    // sobrescrever "Verificando..." com o formulário de login vazio
    if (_pkceInProgress && !session) return;

    // ─── Fluxo normal ───
    currentSession = session;

    if (session) {
      _pkceInProgress = false; // exchange concluído via evento
      // Deferido para fora do lock do GoTrue (correção do deadlock).
      setTimeout(() => { _handleSession(session); }, 0);
    } else {
      _sessionHandled = false;
      updateAuthPanel(null);
      currentSessionId = null;
      window.DivertexUser = null;
      _showFriendsBtn(false);
      showAuthGate();
      if (getApp()) getApp().currentUser = null;
    }
  });

  waitForApp();
}

function waitForApp() {
  if (window.DivertexApp) {
    attachHooks();
  } else {
    setTimeout(waitForApp, 100);
  }
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
      wins: 1,
      rounds: totalRounds,
      livesLost: totalLivesLost,
      streak: totalRounds,
      scoreDelta: score,
    });
  };

  const saveBtn = document.getElementById('saveSessionBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!currentSession) {
        alert('Faça login para salvar a partida.');
        return;
      }
      const state = app.getState?.();
      if (!state) return;

      saveBtn.disabled = true;
      saveBtn.textContent = 'Salvando...';

      const result = await saveSession({
        sessionId: currentSessionId,
        name: `Partida ${new Date().toLocaleDateString('pt-BR')}`,
        gameMode: state.roundMode || 'normal',
        stateJson: {
          players: state.players,
          roundMode: state.roundMode,
          activeWheels: state.activeWheels,
        },
      });

      if (result.sessionId) {
        currentSessionId = result.sessionId;
        saveBtn.textContent = 'Salvo ✓';
      } else {
        saveBtn.textContent = 'Erro ao salvar';
      }
      setTimeout(() => {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Salvar partida';
      }, 2000);
    });
  }

  const signOutBtn = document.getElementById('authSignOutBtn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      await signOut();
    });
  }
}

// ── Botão de amigos ──────────────────────────────────────────────────────────
function _showFriendsBtn(visible) {
  const btn = document.getElementById('friendsOpenBtn');
  if (!btn) return;
  if (visible) btn.removeAttribute('hidden');
  else btn.setAttribute('hidden', '');
}

document.addEventListener('click', e => {
  if (e.target.closest('#friendsOpenBtn')) openFriendsPanel();
  if (e.target.closest('#authSignOutBtn')) signOut();
});

// ── Ranking global no menu ───────────────────────────────────────────────────
async function renderGlobalRanking() {
  const container = document.getElementById('rankingContainer');
  if (!container) return;

  const list = await getGlobalRanking(10);
  if (!list.length) {
    container.innerHTML = '<p class="rankingEmpty">Nenhum dado ainda.</p>';
    return;
  }

  const medals = ['🥇','🥈','🥉'];
  container.innerHTML = list.map((r, i) => `
    <div class="rankingItem">
      <span class="rankingItem__pos">${medals[i] || `#${r.position}`}</span>
      <span class="rankingItem__name">${escapeHtml(r.display_name)}</span>
      <span class="rankingItem__score">${r.score} pts</span>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

init();
