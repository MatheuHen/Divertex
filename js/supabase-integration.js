/**
 * supabase-integration.js
 * Cola Supabase ao app Divertex via window.DivertexApp.
 * Carregado como <script type="module"> DEPOIS de app.js.
 * Se Supabase não estiver configurado, tudo é no-op — o jogo funciona normalmente.
 */

import { isReady } from './supabase-client.js';
import { onAuthStateChange, getProfile, signOut } from './auth-service.js';
import { saveSession, saveRound, submitGameStats } from './game-service.js';
import { getGlobalRanking } from './ranking-service.js';
import { renderAuthPanel, updateAuthPanel, renderAuthGate, renderPasswordResetGate } from './auth-ui.js';
import { openFriendsPanel } from './friends-ui.js';

// Flag lida do script inline em index.html — captura type=recovery ANTES
// de qualquer módulo defer rodar. Scripts inline executam antes de <script type="module">.
const _RECOVERY_ON_LOAD = Boolean(window.__DIVERTEX_RECOVERY);

let currentSession = null;
let currentSessionId = null;

// Flag que bloqueia SIGNED_IN/INITIAL_SESSION enquanto o usuário está no fluxo de
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

// ---- Inicializa quando DOM estiver pronto ----
async function init() {
  if (!isReady()) {
    console.log('[Divertex] Supabase não configurado — modo local ativo.');
    hideAuthGate();
    renderAuthPanel(null);
    return;
  }

  // Usar flag lida no carregamento do módulo (antes do Supabase processar a URL)
  _recoveryMode = _RECOVERY_ON_LOAD;

  showAuthGate();

  if (_recoveryMode) {
    // Mostra form de nova senha imediatamente, sem esperar onAuthStateChange
    renderPasswordResetGate();
  } else {
    renderGlobalRanking();
  }

  onAuthStateChange(async (event, session) => {
    // PASSWORD_RECOVERY: cobre PKCE (code-based) onde não detectamos pela hash
    if (event === 'PASSWORD_RECOVERY') {
      _recoveryMode = true;
      renderPasswordResetGate();
      return;
    }

    // USER_UPDATED: senha salva com sucesso → sai do modo recovery
    // e cai no fluxo normal abaixo para logar o usuário
    if (event === 'USER_UPDATED') {
      _recoveryMode = false;
      // fall-through intencional
    }

    // Enquanto em recovery mode, bloqueia SIGNED_IN e INITIAL_SESSION
    // para não fechar o formulário de nova senha prematuramente
    if (_recoveryMode) return;

    // ---- Fluxo normal de auth ----
    currentSession = session;

    if (session) {
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

// ---- Botão de amigos ----
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

// ---- Ranking global na tela de menu ----
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
