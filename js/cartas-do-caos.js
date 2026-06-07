/**
 * cartas-do-caos.js
 * Minigame "Cartas do Caos" — baralho de cartas que mudam as regras.
 * Cartas: Desafio, Regra, Pergunta, Penalidade, Bônus.
 */

import { submitGameStats } from './game-service.js';

(function CartasDoCaos() {
  const $ = id => document.getElementById(id);

  const CARDS = [
    // DESAFIO — cumprir ou perder 1 vida
    { type: 'desafio', icon: '🔥', text: 'Imite um animal por 20 segundos. O grupo decide se foi convincente.' },
    { type: 'desafio', icon: '🔥', text: 'Cante 30 segundos de uma música sem escolher qual. Improvise!' },
    { type: 'desafio', icon: '🔥', text: 'Faça 10 polichinelos enquanto grita o nome do jogo.' },
    { type: 'desafio', icon: '🔥', text: 'Fale tudo ao contrário por 2 turnos. Quem notar, você cumpriu.' },
    { type: 'desafio', icon: '🔥', text: 'Tente fazer alguém do grupo rir sem falar nada por 30 segundos.' },
    { type: 'desafio', icon: '🔥', text: 'Mande uma mensagem de voz aleatória para alguém fora do grupo.' },
    { type: 'desafio', icon: '🔥', text: 'Dance sem música por 30 segundos. Sem parar.' },
    { type: 'desafio', icon: '🔥', text: 'Escolha alguém do grupo e faça o elogio mais exagerado possível.' },
    { type: 'desafio', icon: '🔥', text: 'Descreva sua vida em apenas 3 palavras.' },
    { type: 'desafio', icon: '🔥', text: 'Tente equilibrar o celular na testa por 20 segundos.' },
    // REGRA — nova lei até a próxima carta de regra
    { type: 'regra', icon: '📜', text: 'Proibido dizer "sim" ou "não". Quem disser perde 1 vida.' },
    { type: 'regra', icon: '📜', text: 'Todos devem falar em voz altíssima até a próxima carta.' },
    { type: 'regra', icon: '📜', text: 'Proibido rir. Quem rir perde 1 vida até a próxima rodada.' },
    { type: 'regra', icon: '📜', text: 'Toda pergunta deve ser respondida com outra pergunta.' },
    { type: 'regra', icon: '📜', text: 'Ninguém pode chamar ninguém pelo nome real. Usem apelidos.' },
    { type: 'regra', icon: '📜', text: 'Proibido apontar com o dedo. Só com o cotovelo.' },
    { type: 'regra', icon: '📜', text: 'Todos devem terminar cada frase com "na minha humilde opinião".' },
    { type: 'regra', icon: '📜', text: 'Proibido cruzar os braços. Quem cruzar perde 1 vida.' },
    // PERGUNTA — responder ou perder 1 vida
    { type: 'pergunta', icon: '❓', text: 'Qual é a coisa mais ridícula que você já comprou por impulso?' },
    { type: 'pergunta', icon: '❓', text: 'Se você tivesse que escolher entre ser rico ou famoso, qual escolheria?' },
    { type: 'pergunta', icon: '❓', text: 'Qual é o seu maior medo que você nunca contou para ninguém?' },
    { type: 'pergunta', icon: '❓', text: 'O que você faria se soubesse que não poderia ser julgado?' },
    { type: 'pergunta', icon: '❓', text: 'Qual é a coisa mais estranha que você já comeu?' },
    { type: 'pergunta', icon: '❓', text: 'Se você só pudesse manter uma amizade deste grupo, quem escolheria?' },
    { type: 'pergunta', icon: '❓', text: 'Qual é o talento secreto que você tem mas nunca mostrou?' },
    { type: 'pergunta', icon: '❓', text: 'Se você pudesse mudar uma coisa no seu passado, o que seria?' },
    // PENALIDADE — efeito direto
    { type: 'penalidade', icon: '💀', text: 'O jogador atual perde 1 vida imediatamente. Sorte na próxima.' },
    { type: 'penalidade', icon: '💀', text: 'O jogador com mais vidas perde 1 vida. Empate: quem tirou a carta decide.' },
    { type: 'penalidade', icon: '💀', text: 'Todos os jogadores perdem 1 vida. Caos total.' },
    { type: 'penalidade', icon: '💀', text: 'O jogador à esquerda de quem tirou a carta perde 1 vida.' },
    // BÔNUS — ganhar vida
    { type: 'bonus', icon: '🌟', text: 'O jogador atual ganha +1 vida. Você estava com sorte hoje!' },
    { type: 'bonus', icon: '🌟', text: 'O jogador com menos vidas ganha +1 vida. Ressurreição!' },
    { type: 'bonus', icon: '🌟', text: 'Dê +1 vida para quem você quiser do grupo.' },
    { type: 'bonus', icon: '🌟', text: 'Todo o grupo ganha +1 vida. Momentinho de paz no caos.' },
  ];

  let state = {
    players: [],
    currentIdx: 0,
    roundNumber: 0,
    deck: [],
    currentCard: null,
    revealed: false,
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
    ['ccSetup', 'ccPlay', 'ccFinal'].forEach(p => {
      const el = $(p);
      if (el) el.setAttribute('hidden', '');
    });
    const target = $(id);
    if (target) target.removeAttribute('hidden');
  }

  function renderScoreboard() {
    const sb = $('ccScoreBoard');
    if (!sb) return;
    sb.innerHTML = state.players.map((p, i) => {
      const isCurrent = i === state.currentIdx && p.lives > 0;
      const isEliminated = p.lives <= 0;
      return `<div class="cc-score-item ${isCurrent ? 'cc-score-item--current' : ''} ${isEliminated ? 'cc-score-item--eliminated' : ''}">
        <span class="cc-score-name">${esc(p.name)}</span>
        <span class="cc-score-lives">${livesHtml(p.lives)}</span>
      </div>`;
    }).join('');
  }

  function advancePlayer() {
    const active = activePlayers();
    if (active.length <= 1) {
      endGame(active[0]);
      return;
    }
    let tries = 0;
    do {
      state.currentIdx = (state.currentIdx + 1) % state.players.length;
      tries++;
    } while (state.players[state.currentIdx].lives <= 0 && tries < state.players.length);
    state.roundNumber++;
  }

  function showNextCard() {
    if (state.deck.length === 0) {
      state.deck = shuffle(CARDS);
    }
    state.currentCard = state.deck.pop();
    state.revealed = false;

    const display = $('ccCardDisplay');
    const actions = $('ccActions');
    const roundBadge = $('ccRoundBadge');
    const currentPlayer = $('ccCurrentPlayer');

    if (roundBadge) roundBadge.textContent = `Rodada ${state.roundNumber}`;
    if (currentPlayer) currentPlayer.textContent = state.players[state.currentIdx].name;

    if (display) {
      display.className = 'cc-card cc-card--hidden';
      display.style.cursor = 'pointer';
      display.innerHTML = `
        <div class="cc-card__icon">🃏</div>
        <div class="cc-card__text">Clique para virar a carta</div>
      `;
    }
    if (actions) actions.setAttribute('hidden', '');

    renderScoreboard();
  }

  function revealCard() {
    if (state.revealed) return;
    state.revealed = true;

    const card = state.currentCard;
    const display = $('ccCardDisplay');
    const actions = $('ccActions');
    const doneBtn = $('ccDoneBtn');
    const failBtn = $('ccFailBtn');
    const bonusBtn = $('ccBonusBtn');

    if (!display || !card) return;

    display.style.cursor = 'default';
    display.className = `cc-card cc-card--${card.type}`;
    display.innerHTML = `
      <div class="cc-card__icon">${card.icon}</div>
      <div class="cc-card__type">${card.type.toUpperCase()}</div>
      <div class="cc-card__text">${esc(card.text)}</div>
    `;

    if (actions) actions.removeAttribute('hidden');

    // Show/hide appropriate buttons
    if (doneBtn) doneBtn.textContent = card.type === 'regra' ? '✓ Entendido' : '✓ Resolvido';
    if (failBtn) failBtn.style.display = (card.type === 'desafio' || card.type === 'pergunta') ? '' : 'none';
    if (bonusBtn) bonusBtn.style.display = card.type === 'bonus' ? '' : 'none';

    // Auto-apply direct penalty cards
    if (card.type === 'penalidade') {
      const p = state.players[state.currentIdx];
      p.lives = Math.max(0, p.lives - 1);
      renderScoreboard();
    }
    if (card.type === 'bonus') {
      // Bonus button gives the life
    }
  }

  function endGame(winner) {
    showPhase('ccFinal');
    const w = $('ccFinalWinner');
    if (w) w.textContent = winner ? winner.name : 'Empate!';

    const scoresEl = $('ccFinalScores');
    if (scoresEl) {
      scoresEl.innerHTML = state.players
        .sort((a, b) => b.lives - a.lives)
        .map(p => `<div class="cc-score-item">
          <span class="cc-score-name">${esc(p.name)}</span>
          <span class="cc-score-lives">${livesHtml(p.lives)}</span>
        </div>`).join('');
    }

    if (window.DivertexUser && winner) {
      submitGameStats({
        wins: window.DivertexUser.name === winner.name ? 1 : 0,
        rounds: state.roundNumber,
        livesLost: state.players.reduce((a, p) => a + Math.max(0, 3 - p.lives), 0),
        streak: 0,
        scoreDelta: state.roundNumber * 6 + 20,
      }).catch(() => {});
    }
  }

  function resetGame() {
    state = { players: [], currentIdx: 0, roundNumber: 0, deck: [], currentCard: null, revealed: false, gameStarted: false };
    const list = $('ccPlayersList');
    if (list) list.innerHTML = '';
    const btn = $('ccStartBtn');
    if (btn) btn.disabled = true;
    showPhase('ccSetup');
  }

  function renderPlayerChips() {
    const list = $('ccPlayersList');
    if (!list) return;
    list.innerHTML = state.players.map((p, i) => `
      <div class="cc-chip">
        <span>${esc(p.name)}</span>
        <span class="cc-chip__remove" data-i="${i}">✕</span>
      </div>`).join('');
    list.querySelectorAll('.cc-chip__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        state.players.splice(Number(btn.dataset.i), 1);
        renderPlayerChips();
        updateStartBtn();
      });
    });
  }

  function updateStartBtn() {
    const btn = $('ccStartBtn');
    if (btn) btn.disabled = state.players.length < 2;
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function goToMenu() {
    document.getElementById('screenCartas')?.classList.remove('screen--active');
    document.getElementById('screenMenu')?.classList.add('screen--active');
  }

  function init() {
    $('ccBackMenuBtn')?.addEventListener('click', goToMenu);
    $('ccBackMenuFinalBtn')?.addEventListener('click', goToMenu);

    $('ccPlayerForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const input = $('ccNameInput');
      const name = input?.value?.trim();
      if (!name || state.players.length >= 10) return;
      if (state.players.some(p => p.name.toLowerCase() === name.toLowerCase())) { input.value = ''; return; }
      state.players.push({ name, lives: 3 });
      input.value = '';
      renderPlayerChips();
      updateStartBtn();
    });

    $('ccStartBtn')?.addEventListener('click', () => {
      if (state.players.length < 2) return;
      state.deck = shuffle(CARDS);
      state.gameStarted = true;
      state.roundNumber = 1;
      state.currentIdx = 0;
      if (window.DivertexUser) {
        const i = state.players.findIndex(p => p.name === window.DivertexUser.name);
        if (i >= 0) state.currentIdx = i;
      }
      showPhase('ccPlay');
      showNextCard();
    });

    // Flip card on click
    $('ccCardDisplay')?.addEventListener('click', () => {
      if (!state.revealed) revealCard();
    });

    $('ccDoneBtn')?.addEventListener('click', () => {
      const active = activePlayers();
      if (active.length <= 1) { endGame(active[0]); return; }
      advancePlayer();
      if (activePlayers().length <= 1) { endGame(activePlayers()[0]); return; }
      showNextCard();
    });

    $('ccFailBtn')?.addEventListener('click', () => {
      const p = state.players[state.currentIdx];
      p.lives = Math.max(0, p.lives - 1);
      renderScoreboard();
      const active = activePlayers();
      if (active.length <= 1) { setTimeout(() => endGame(active[0]), 600); return; }
      advancePlayer();
      if (activePlayers().length <= 1) { setTimeout(() => endGame(activePlayers()[0]), 600); return; }
      showNextCard();
    });

    $('ccBonusBtn')?.addEventListener('click', () => {
      const p = state.players[state.currentIdx];
      p.lives++;
      renderScoreboard();
      advancePlayer();
      if (activePlayers().length <= 1) { endGame(activePlayers()[0]); return; }
      showNextCard();
    });

    $('ccPlayAgainBtn')?.addEventListener('click', () => {
      resetGame();
      if (window.DivertexUser) {
        state.players.push({ name: window.DivertexUser.name, lives: 3 });
        renderPlayerChips();
        updateStartBtn();
      }
    });

    $('openCartasBtn')?.addEventListener('click', () => {
      document.getElementById('screenMenu')?.classList.remove('screen--active');
      document.getElementById('screenCartas')?.classList.add('screen--active');
      showPhase('ccSetup');
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
