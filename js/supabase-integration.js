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
import { renderAuthPanel, updateAuthPanel } from './auth-ui.js';

let currentSession = null;
let currentSessionId = null;

function getApp() { return window.DivertexApp || null; }

// ---- Inicializa quando DOM estiver pronto ----
async function init() {
  if (!isReady()) {
    console.log('[Divertex] Supabase não configurado — modo local ativo.');
    renderAuthPanel(null);
    return;
  }

  renderAuthPanel(null);

  // Carrega ranking público na inicialização (não requer login)
  renderGlobalRanking();

  // Ouve mudanças de auth
  onAuthStateChange(async (session) => {
    currentSession = session;

    if (session) {
      const profile = await getProfile(session.user.id);
      updateAuthPanel({ session, profile });
      await renderGlobalRanking();
    } else {
      updateAuthPanel(null);
      currentSessionId = null;
    }

    // Expõe sessão para o app
    if (getApp()) {
      getApp().currentUser = session ? { id: session.user.id } : null;
    }
  });

  // Hooks do DivertexApp
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

  // Após cada rodada: salva no Supabase se logado
  app.onRoundComplete = async (roundData) => {
    if (!currentSession || !currentSessionId) return;
    await saveRound(currentSessionId, roundData);
  };

  // Quando vence: submete stats
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

  // Botão salvar partida (injetado no HTML)
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

  // Botão sair
  const signOutBtn = document.getElementById('authSignOutBtn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      await signOut();
    });
  }
}

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
