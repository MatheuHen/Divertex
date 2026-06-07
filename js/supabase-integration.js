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
import { onAuthStateChange, getProfile, signOut } from './auth-service.js';
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

async function _handleSession(session) {
  currentSession = session;
  const profile = await getProfile(session.user.id);
  updateAuthPanel({ session, profile });
  await renderGlobalRanking();
  hideAuthGate();
  window.DivertexUser = {
    id: session.user.id,
    name: profile?.display_name || session.user.email?.split('@')[0] || 'Jogador',
    avatar: profile?.avatar_url || null,
  };
  _showFriendsBtn(true);
  if (getApp()) getApp().currentUser = { id: session.user.id };
}

// ─────────────────────────────────────────────────────────────────────────────
// PKCE callback explícito — chamado quando a URL tem ?code=
// detectSessionInUrl está OFF: este é o único lugar que troca o code por sessão.
// ─────────────────────────────────────────────────────────────────────────────
async function _handlePkceCallback() {
  const card = document.getElementById('authGateCard');
  if (card) card.innerHTML = '<div class="authGate__loading">Verificando…</div>';

  console.log('[AUTH CALLBACK] iniciado');

  const code = new URLSearchParams(window.location.search).get('code');

  if (!code) {
    console.log('[AUTH CALLBACK] sem code na URL — mostrando login');
    _pkceInProgress = false;
    renderAuthGate();
    return;
  }

  console.log('[AUTH CALLBACK] code encontrado');

  // Timeout de segurança: se exchange travar, mostrar erro após 12s
  const failTimer = setTimeout(() => {
    console.warn('[AUTH CALLBACK] timeout atingido — mostrando erro');
    _pkceInProgress = false;
    if (!currentSession && !_recoveryMode) {
      _showCallbackError(card);
    }
  }, 12000);

  try {
    const sb = getClient();
    console.log('[AUTH CALLBACK] exchange iniciado');

    const { data, error } = await sb.auth.exchangeCodeForSession(code);
    clearTimeout(failTimer);

    console.log('[AUTH CALLBACK] exchange finalizado');

    // Limpa ?code= da URL imediatamente para evitar re-use se o usuário atualizar
    window.history.replaceState({}, document.title, window.location.pathname);

    if (error) {
      console.error('[AUTH CALLBACK] erro no exchange:', error.message);
      _pkceInProgress = false;
      if (!currentSession && !_recoveryMode) {
        _showCallbackError(card, error.message);
      }
      return;
    }

    // Aguarda um tick para que onAuthStateChange processe PASSWORD_RECOVERY
    // antes de decidirmos se isso é um login normal ou fluxo de recovery
    await new Promise(r => setTimeout(r, 150));

    _pkceInProgress = false;

    if (_recoveryMode) {
      // onAuthStateChange já disparou PASSWORD_RECOVERY e exibiu o form de nova senha
      console.log('[AUTH CALLBACK] modo recovery ativo — form de senha já exibido');
      return;
    }

    if (currentSession) {
      // onAuthStateChange já disparou SIGNED_IN e chamou _handleSession
      console.log('[AUTH CALLBACK] sessão tratada pelo listener — gate já fechado');
      return;
    }

    // Fallback direto: onAuthStateChange não disparou a tempo, usamos data.session
    if (data?.session) {
      console.log('[AUTH CALLBACK] sessão encontrada via data — inicializando');
      await _handleSession(data.session);
      console.log('[AUTH CALLBACK] redirecionando para menu');
    } else {
      console.log('[AUTH CALLBACK] sem sessão após exchange — mostrando login');
      renderAuthGate();
    }

  } catch (e) {
    clearTimeout(failTimer);
    _pkceInProgress = false;
    console.error('[AUTH CALLBACK] exceção:', e);
    if (!currentSession && !_recoveryMode) {
      _showCallbackError(card, e?.message);
    }
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
    window.location.href = window.location.origin;
  });
  document.getElementById('cbBackBtn')?.addEventListener('click', () => {
    renderAuthGate('login');
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Inicialização principal
// ─────────────────────────────────────────────────────────────────────────────
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

  onAuthStateChange(async (event, session) => {
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
      await _handleSession(session);
    } else {
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
