/**
 * duelo-de-coragem.js
 * Minigame "Duelo de Coragem" — dois jogadores sorteados se enfrentam 1v1.
 * O grupo vota em quem perdeu. Perdedor perde 1 vida.
 */

import { submitGameStats } from './game-service.js';

(function DueloDeCorragem() {
  const $ = id => document.getElementById(id);

  const CHALLENGES = [
    'Pedra, papel e tesoura — melhor de 3. Comecem!',
    'Quem segurar a respiração por mais tempo sem trair vence.',
    'Desafio de olhar fixo — quem piscar primeiro perde.',
    'Cada um conta uma piada. O grupo vota na mais engraçada.',
    'Os dois imitam o mesmo animal. O grupo vota no mais convincente.',
    'Cada um diz uma palavra. Quem demorar mais de 3s para continuar a sequência perde.',
    'Os dois tentam equilibrar algo na cabeça. Quem durar menos perde.',
    'Cada um descreve o outro com 3 adjetivos. O grupo vota em quem foi mais criativo.',
    'Cara ou coroa generalizado: o grupo joga por ambos. Quem o grupo escolher, perde.',
    'Os dois tentam fazer a mesma careta o mais feia possível. O grupo escolhe o "vencedor".',
    'Braço de ferro mental: cada um diz um número. Quem disser o par impar errado perde.',
    'Os dois têm 20 segundos para convencer o grupo de algo impossível. Quem foi menos convincente perde.',
    'Cada um imita um personagem famoso sem falar. O grupo decide quem foi pior.',
    'Disputa de freestyle: cada um tem 30s para improvisar um rap/poesia. Voto do grupo.',
    'Os dois têm 30s para mostrar algo no celular que represente sua personalidade. Voto do grupo.',
    'Cada um conta o maior mico da própria vida. O grupo vota no mais vergonhoso (você escolheu!)',
    'Batalha de dança: 30s cada. Pode ser qualquer estilo. Voto do grupo.',
    'Quem conseguir ficar mais tempo em silêncio absoluto? Comecem após o sinal.',
    'Desafio de agilidade verbal: falem o alfabeto ao contrário. Quem errar ou demorar mais perde.',
    'Cada um faz uma previsão sobre o futuro do outro. O grupo vota na mais provável (criatividade conta).',
  ];

  let state = {
    players: [],
    roundNumber: 0,
    fighter1: null,
    fighter2: null,
    votes: {},
    voted: false,
    gameStarted: false,
  };

  function livesHtml(n) {
    if (n <= 0) return '💀';
    return '❤️'.repeat(Math.min(n, 5)) + (n > 5 ? ` ×${n}` : '');
  }

  function activePlayers() {
    return state.players.filter(p => p.lives > 0);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function showPhase(id) {
    ['dcSetup', 'dcDuel', 'dcFinal'].forEach(p => {
      const el = $(p);
      if (el) el.setAttribute('hidden', '');
    });
    const target = $(id);
    if (target) target.removeAttribute('hidden');
  }

  function renderScoreboard() {
    const sb = $('dcScoreBoard');
    if (!sb) return;
    sb.innerHTML = state.players.map(p => {
      const isEliminated = p.lives <= 0;
      return `<div class="dc-score-item ${isEliminated ? 'dc-score-item--eliminated' : ''}">
        <span class="dc-score-name">${esc(p.name)}</span>
        <span class="dc-score-lives">${livesHtml(p.lives)}</span>
      </div>`;
    }).join('');
  }

  function startDuel() {
    const active = activePlayers();
    if (active.length <= 1) { endGame(active[0]); return; }

    state.roundNumber++;
    const shuffled = shuffle(active);
    state.fighter1 = shuffled[0];
    state.fighter2 = shuffled[1];
    state.votes = {};
    state.voted = false;

    const challenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];

    // Update UI
    const roundBadge = $('dcRoundBadge');
    if (roundBadge) roundBadge.textContent = `Rodada ${state.roundNumber}`;

    const f1Name = $('dcFighter1Name');
    const f2Name = $('dcFighter2Name');
    const f1Lives = $('dcFighter1Lives');
    const f2Lives = $('dcFighter2Lives');
    if (f1Name) f1Name.textContent = state.fighter1.name;
    if (f2Name) f2Name.textContent = state.fighter2.name;
    if (f1Lives) f1Lives.textContent = livesHtml(state.fighter1.lives);
    if (f2Lives) f2Lives.textContent = livesHtml(state.fighter2.lives);

    const challengeBox = $('dcChallengeBox');
    if (challengeBox) challengeBox.textContent = challenge;

    // Setup vote row with all other players
    const voteSection = $('dcVoteSection');
    const voteRow = $('dcVoteRow');
    const revealBtn = $('dcRevealBtn');

    if (voteSection) voteSection.removeAttribute('hidden');
    if (revealBtn) revealBtn.disabled = true;

    const voters = state.players.filter(p => p.lives > 0);
    if (voteRow) {
      voteRow.innerHTML = `
        <button class="dc-vote-btn dc-vote-btn--left" data-id="${esc(state.fighter1.name)}" type="button">
          ${esc(state.fighter1.name)} perdeu
        </button>
        <button class="dc-vote-btn dc-vote-btn--right" data-id="${esc(state.fighter2.name)}" type="button">
          ${esc(state.fighter2.name)} perdeu
        </button>
      `;

      voteRow.querySelectorAll('.dc-vote-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const voterId = window.DivertexUser?.name || 'player';
          state.votes[voterId] = btn.dataset.id;

          // Highlight selected
          voteRow.querySelectorAll('.dc-vote-btn').forEach(b => b.classList.remove('dc-vote-btn--selected'));
          btn.classList.add('dc-vote-btn--selected');

          if (revealBtn) revealBtn.disabled = false;
        });
      });
    }

    showPhase('dcDuel');
    renderScoreboard();
  }

  function revealResult() {
    // Count votes — majority loses; default: fighter2 loses if tie
    const voteCounts = {};
    Object.values(state.votes).forEach(v => { voteCounts[v] = (voteCounts[v] || 0) + 1; });

    let loser = state.fighter2;
    let maxVotes = 0;
    for (const [name, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        loser = state.players.find(p => p.name === name) || loser;
      }
    }

    loser.lives = Math.max(0, loser.lives - 1);
    renderScoreboard();

    const active = activePlayers();
    if (active.length <= 1) {
      setTimeout(() => endGame(active[0]), 800);
    } else {
      setTimeout(() => startDuel(), 1200);
    }
  }

  function endGame(winner) {
    showPhase('dcFinal');
    const w = $('dcFinalWinner');
    if (w) w.textContent = winner ? winner.name : 'Empate!';

    const scoresEl = $('dcFinalScores');
    if (scoresEl) {
      scoresEl.innerHTML = state.players
        .sort((a, b) => b.lives - a.lives)
        .map(p => `<div class="dc-score-item">
          <span class="dc-score-name">${esc(p.name)}</span>
          <span class="dc-score-lives">${livesHtml(p.lives)}</span>
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
    state = { players: [], roundNumber: 0, fighter1: null, fighter2: null, votes: {}, voted: false, gameStarted: false };
    const list = $('dcPlayersList');
    if (list) list.innerHTML = '';
    const btn = $('dcStartBtn');
    if (btn) btn.disabled = true;
    showPhase('dcSetup');
  }

  function renderPlayerChips() {
    const list = $('dcPlayersList');
    if (!list) return;
    list.innerHTML = state.players.map((p, i) => `
      <div class="dc-chip">
        <span>${esc(p.name)}</span>
        <span class="dc-chip__remove" data-i="${i}">✕</span>
      </div>`).join('');
    list.querySelectorAll('.dc-chip__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        state.players.splice(Number(btn.dataset.i), 1);
        renderPlayerChips();
        updateStartBtn();
      });
    });
  }

  function updateStartBtn() {
    const btn = $('dcStartBtn');
    if (btn) btn.disabled = state.players.length < 3;
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function goToMenu() {
    document.getElementById('screenDuelo')?.classList.remove('screen--active');
    document.getElementById('screenMenu')?.classList.add('screen--active');
  }

  function init() {
    $('dcBackMenuBtn')?.addEventListener('click', goToMenu);
    $('dcBackMenuFinalBtn')?.addEventListener('click', goToMenu);

    $('dcPlayerForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const input = $('dcNameInput');
      const name = input?.value?.trim();
      if (!name || state.players.length >= 12) return;
      if (state.players.some(p => p.name.toLowerCase() === name.toLowerCase())) { input.value = ''; return; }
      state.players.push({ name, lives: 3 });
      input.value = '';
      renderPlayerChips();
      updateStartBtn();
    });

    $('dcStartBtn')?.addEventListener('click', () => {
      if (state.players.length < 3) return;
      state.gameStarted = true;
      startDuel();
    });

    $('dcRevealBtn')?.addEventListener('click', revealResult);

    $('dcPlayAgainBtn')?.addEventListener('click', () => {
      resetGame();
      if (window.DivertexUser) {
        state.players.push({ name: window.DivertexUser.name, lives: 3 });
        renderPlayerChips();
        updateStartBtn();
      }
    });

    $('openDueloBtn')?.addEventListener('click', () => {
      document.getElementById('screenMenu')?.classList.remove('screen--active');
      document.getElementById('screenDuelo')?.classList.add('screen--active');
      showPhase('dcSetup');
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
