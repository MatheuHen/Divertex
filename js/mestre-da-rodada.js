/**
 * mestre-da-rodada.js
 * Minigame "Mestre da Rodada" — cada rodada um jogador sorteia uma regra secreta.
 * Quem quebrar a regra perde 1 vida. Turno passa para o próximo.
 */

import { submitGameStats } from './game-service.js';

(function MestreDaRodada() {
  const $ = id => document.getElementById(id);

  const RULES = [
    'Proibido dizer as palavras "não", "sim", "ok" ou "tá". Quem disser perde 1 vida.',
    'Todos devem falar em voz de criança até a próxima rodada.',
    'Proibido apontar com o dedo. Só com o cotovelo ou com a cabeça.',
    'Toda frase deve terminar com "senhor/senhora Mestre".',
    'Proibido rir durante esta rodada. Quem rir perde 1 vida.',
    'Todo mundo deve responder qualquer pergunta com outra pergunta.',
    'Proibido cruzar os braços. Quem cruzar perde 1 vida.',
    'Todos devem falar apenas em sussurro durante esta rodada.',
    'Proibido usar o nome de ninguém do grupo. Use pronomes apenas.',
    'Toda frase deve começar com "Na opinião do Mestre...".',
    'Proibido tocar o rosto até a próxima rodada. Quem tocar perde 1 vida.',
    'Todo jogador deve ficar de pé durante esta rodada.',
    'Proibido usar verbos no passado. Fale apenas no presente.',
    'Toda resposta deve ser dada em 3 palavras exatas. Nem mais, nem menos.',
    'Proibido falar com vogais. Substitua por "bz" ou qualquer consoante.',
    'Todos devem concordar com tudo que o Mestre disser nesta rodada.',
    'Proibido sorrir durante as respostas desta rodada.',
    'Toda pergunta deve ser respondida com um exemplo pessoal.',
    'Os jogadores devem falar apenas sobre acontecimentos do passado nesta rodada.',
    'Proibido usar números ao falar. Substitua por "alguns" ou "muitos".',
    'Todo mundo deve bater palma antes de cada frase que disser.',
    'Proibido usar as palavras "mas", "porém" ou "entretanto".',
    'Todo jogador deve manter as mãos atrás das costas durante esta rodada.',
    'Proibido perguntar "por quê?". Qualquer forma desta pergunta = perde 1 vida.',
    'Todos devem falar como se estivessem narrando um documentário de natureza.',
  ];

  let state = {
    players: [],
    masterIdx: 0,
    roundNumber: 0,
    currentRule: '',
    ruleRevealed: false,
    ruleBreaker: null,
    gameStarted: false,
  };

  function livesHtml(n) {
    if (n <= 0) return '💀';
    return '❤️'.repeat(Math.min(n, 5)) + (n > 5 ? ` ×${n}` : '');
  }

  function activePlayers() {
    return state.players.filter(p => p.lives > 0);
  }

  function showPhase(id) {
    ['mrSetup', 'mrMaster', 'mrFinal'].forEach(p => {
      const el = $(p);
      if (el) el.setAttribute('hidden', '');
    });
    const target = $(id);
    if (target) target.removeAttribute('hidden');
  }

  function renderScoreboard() {
    const sb = $('mrScoreBoard');
    if (!sb) return;
    sb.innerHTML = state.players.map((p, i) => {
      const isMaster = i === state.masterIdx && p.lives > 0;
      const isEliminated = p.lives <= 0;
      return `<div class="mr-score-item ${isMaster ? 'mr-score-item--master' : ''} ${isEliminated ? 'mr-score-item--eliminated' : ''}">
        <span class="mr-score-name">${isMaster ? '👑 ' : ''}${esc(p.name)}</span>
        <span class="mr-score-lives">${livesHtml(p.lives)}</span>
      </div>`;
    }).join('');
  }

  function startRound() {
    const active = activePlayers();
    if (active.length <= 1) { endGame(active[0]); return; }

    state.roundNumber++;
    state.ruleRevealed = false;
    state.ruleBreaker = null;
    state.currentRule = RULES[Math.floor(Math.random() * RULES.length)];

    // Find next active master
    let tries = 0;
    while (state.players[state.masterIdx].lives <= 0 && tries < state.players.length) {
      state.masterIdx = (state.masterIdx + 1) % state.players.length;
      tries++;
    }

    const roundBadge = $('mrRoundBadge');
    const masterName = $('mrMasterName');
    const ruleReveal = $('mrRuleReveal');
    const ruleContent = $('mrRuleContent');
    const ruleText = $('mrRuleText');
    const voteSection = $('mrVoteSection');
    const nextRoundBtn = $('mrNextRoundBtn');

    if (roundBadge) roundBadge.textContent = `Rodada ${state.roundNumber}`;
    if (masterName) masterName.textContent = state.players[state.masterIdx].name;

    if (ruleReveal) {
      ruleReveal.style.cursor = 'pointer';
      ruleReveal.innerHTML = `<div class="mr-rule-hidden-hint">👆 Clique para revelar a regra secreta</div>`;
    }
    if (voteSection) voteSection.setAttribute('hidden', '');
    if (nextRoundBtn) nextRoundBtn.disabled = true;

    showPhase('mrMaster');
    renderScoreboard();
  }

  function revealRule() {
    if (state.ruleRevealed) return;
    state.ruleRevealed = true;

    const ruleReveal = $('mrRuleReveal');
    if (ruleReveal) {
      ruleReveal.style.cursor = 'default';
      ruleReveal.innerHTML = `
        <div id="mrRuleContent">
          <div class="mr-rule-type">📜 REGRA DA RODADA</div>
          <div class="mr-rule-text" id="mrRuleText">${esc(state.currentRule)}</div>
          <div class="mr-reveal-hint">Leia em voz alta para todos!</div>
        </div>
      `;
    }

    // Render vote grid for rule breaker selection
    const voteSection = $('mrVoteSection');
    const voteGrid = $('mrVoteGrid');

    if (voteSection) voteSection.removeAttribute('hidden');

    // Only non-master active players can be voted
    const master = state.players[state.masterIdx];
    const candidates = state.players.filter(p => p.lives > 0 && p.name !== master.name);

    if (voteGrid) {
      voteGrid.innerHTML = candidates.map(p => `
        <button class="mr-vote-btn" data-name="${esc(p.name)}" type="button">${esc(p.name)}</button>
      `).join('');

      voteGrid.querySelectorAll('.mr-vote-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          voteGrid.querySelectorAll('.mr-vote-btn').forEach(b => b.classList.remove('mr-vote-btn--voted'));
          btn.classList.add('mr-vote-btn--voted');
          state.ruleBreaker = btn.dataset.name;
          const nextBtn = $('mrNextRoundBtn');
          if (nextBtn) nextBtn.disabled = false;
        });
      });
    }

    renderScoreboard();
  }

  function endGame(winner) {
    showPhase('mrFinal');
    const w = $('mrFinalWinner');
    if (w) w.textContent = winner ? winner.name : 'Empate!';

    const scoresEl = $('mrFinalScores');
    if (scoresEl) {
      scoresEl.innerHTML = state.players
        .sort((a, b) => b.lives - a.lives)
        .map(p => `<div class="mr-score-item">
          <span class="mr-score-name">${esc(p.name)}</span>
          <span class="mr-score-lives">${livesHtml(p.lives)}</span>
        </div>`).join('');
    }

    if (window.DivertexUser && winner) {
      submitGameStats({
        wins: window.DivertexUser.name === winner.name ? 1 : 0,
        rounds: state.roundNumber,
        livesLost: state.players.reduce((a, p) => a + Math.max(0, 3 - p.lives), 0),
        streak: state.roundNumber,
        scoreDelta: state.roundNumber * 7 + 25,
      }).catch(() => {});
    }
  }

  function resetGame() {
    state = { players: [], masterIdx: 0, roundNumber: 0, currentRule: '', ruleRevealed: false, ruleBreaker: null, gameStarted: false };
    const list = $('mrPlayersList');
    if (list) list.innerHTML = '';
    const btn = $('mrStartBtn');
    if (btn) btn.disabled = true;
    showPhase('mrSetup');
  }

  function renderPlayerChips() {
    const list = $('mrPlayersList');
    if (!list) return;
    list.innerHTML = state.players.map((p, i) => `
      <div class="mr-chip">
        <span>${esc(p.name)}</span>
        <span class="mr-chip__remove" data-i="${i}">✕</span>
      </div>`).join('');
    list.querySelectorAll('.mr-chip__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        state.players.splice(Number(btn.dataset.i), 1);
        renderPlayerChips();
        updateStartBtn();
      });
    });
  }

  function updateStartBtn() {
    const btn = $('mrStartBtn');
    if (btn) btn.disabled = state.players.length < 3;
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function goToMenu() {
    document.getElementById('screenMestre')?.classList.remove('screen--active');
    document.getElementById('screenMenu')?.classList.add('screen--active');
  }

  function init() {
    $('mrBackMenuBtn')?.addEventListener('click', goToMenu);
    $('mrBackMenuFinalBtn')?.addEventListener('click', goToMenu);

    $('mrPlayerForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const input = $('mrNameInput');
      const name = input?.value?.trim();
      if (!name || state.players.length >= 12) return;
      if (state.players.some(p => p.name.toLowerCase() === name.toLowerCase())) { input.value = ''; return; }
      state.players.push({ name, lives: 3 });
      input.value = '';
      renderPlayerChips();
      updateStartBtn();
    });

    // Sala online: preenche o elenco compartilhado.
    window.addEventListener('divertex:roster', e => {
      if (e.detail?.game !== 'mestre') return;
      state.players = (e.detail.players || []).slice(0, 12).map(name => ({ name, lives: 3 }));
      renderPlayerChips();
      updateStartBtn();
    });

    $('mrStartBtn')?.addEventListener('click', () => {
      if (state.players.length < 3) return;
      state.gameStarted = true;
      state.masterIdx = 0;
      if (window.DivertexUser) {
        const i = state.players.findIndex(p => p.name === window.DivertexUser.name);
        if (i >= 0) state.masterIdx = i;
      }
      startRound();
    });

    // Reveal rule on click
    $('mrRuleReveal')?.addEventListener('click', () => {
      if (!state.ruleRevealed) revealRule();
    });

    $('mrNoOneBtn')?.addEventListener('click', () => {
      // No penalty, advance master
      state.masterIdx = (state.masterIdx + 1) % state.players.length;
      // Skip eliminated
      let tries = 0;
      while (state.players[state.masterIdx].lives <= 0 && tries < state.players.length) {
        state.masterIdx = (state.masterIdx + 1) % state.players.length;
        tries++;
      }
      const active = activePlayers();
      if (active.length <= 1) { endGame(active[0]); return; }
      startRound();
    });

    $('mrNextRoundBtn')?.addEventListener('click', () => {
      if (state.ruleBreaker) {
        const p = state.players.find(pl => pl.name === state.ruleBreaker);
        if (p) p.lives = Math.max(0, p.lives - 1);
      }
      // Advance master
      state.masterIdx = (state.masterIdx + 1) % state.players.length;
      let tries = 0;
      while (state.players[state.masterIdx].lives <= 0 && tries < state.players.length) {
        state.masterIdx = (state.masterIdx + 1) % state.players.length;
        tries++;
      }
      const active = activePlayers();
      if (active.length <= 1) { endGame(active[0]); return; }
      startRound();
    });

    $('mrPlayAgainBtn')?.addEventListener('click', () => {
      resetGame();
      if (window.DivertexUser) {
        state.players.push({ name: window.DivertexUser.name, lives: 3 });
        renderPlayerChips();
        updateStartBtn();
      }
    });

    $('openMestreBtn')?.addEventListener('click', () => {
      document.getElementById('screenMenu')?.classList.remove('screen--active');
      document.getElementById('screenMestre')?.classList.add('screen--active');
      showPhase('mrSetup');
      if (window.DivertexUser && state.players.length === 0) {
        state.players.push({ name: window.DivertexUser.name, lives: 3 });
        renderPlayerChips();
        updateStartBtn();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
