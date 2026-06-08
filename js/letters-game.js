// js/letters-game.js — Sorteador de Letras
import { submitGameStats } from './game-service.js';

const LETTERS_POOL = 'ABCDEFGHIJLMNOPRSTUVZ'.split('');

const CATEGORY_LABELS = {
  livre: 'Qualquer palavra',
  animal: 'Nome de animal',
  frase: 'Frase completa',
  nome: 'Nome de pessoa',
  cidade: 'Nome de cidade',
};

(() => {
  const $ = id => document.getElementById(id);

  const LIVES = 3;
  let timerInterval = null;

  let state = {
    phase: 'setup',
    players: [],
    config: {
      lettersPerRound: 3,
      mode: 'sequential',
      timePerLetter: 15,
      category: 'livre',
      bonusOnSuccess: true,
    },
    currentPlayerIdx: 0,
    currentLetters: [],
    currentLetterIdx: 0,
    timeLeft: 0,
    roundStats: {},
  };

  // ─── Utils ──────────────────────────────────────────────────

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function activePlayers() {
    return state.players.filter(p => !p.eliminated);
  }

  function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast toast--${type}`;
    t.textContent = msg;
    container.appendChild(t);
    requestAnimationFrame(() => t.classList.add('toast--show'));
    setTimeout(() => { t.classList.remove('toast--show'); setTimeout(() => t.remove(), 400); }, 3000);
  }

  // ─── Phase control ──────────────────────────────────────────

  const phaseIds = ['lgSetup', 'lgTurn', 'lgFinal'];

  function showPhase(name) {
    phaseIds.forEach(id => $(id)?.setAttribute('hidden', ''));
    const map = { setup: 'lgSetup', turn: 'lgTurn', final: 'lgFinal' };
    $(map[name])?.removeAttribute('hidden');
    state.phase = name;
  }

  // ─── Navigation ─────────────────────────────────────────────

  function goToMenu() {
    clearTimer();
    $('screenLetters')?.classList.remove('screen--active');
    $('screenMenu')?.classList.add('screen--active');
    resetState();
    showPhase('setup');
    renderSetup();
  }

  function resetState() {
    state = {
      ...state,
      phase: 'setup',
      players: [],
      currentPlayerIdx: 0,
      currentLetters: [],
      currentLetterIdx: 0,
      timeLeft: 0,
      roundStats: {},
    };
  }

  // ─── Timer ──────────────────────────────────────────────────

  function clearTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  function startTimer(seconds, onTick, onExpire) {
    clearTimer();
    state.timeLeft = seconds;
    onTick(seconds);
    timerInterval = setInterval(() => {
      state.timeLeft--;
      onTick(state.timeLeft);
      if (state.timeLeft <= 0) {
        clearTimer();
        onExpire();
      }
    }, 1000);
  }

  function updateTimerRing(t, total) {
    const valEl = $('lgTimerValue');
    if (valEl) valEl.textContent = t;
    const ring = $('lgTimerRing');
    if (!ring) return;
    const r = 28;
    const circ = 2 * Math.PI * r;
    ring.style.strokeDasharray = circ;
    ring.style.strokeDashoffset = circ * (1 - Math.max(0, t / total));
    ring.style.stroke = t <= 5 ? '#ff4444' : 'var(--accent)';
  }

  // ─── Setup ──────────────────────────────────────────────────

  function renderSetup() {
    const list = $('lgPlayersList');
    if (!list) return;
    list.innerHTML = state.players.map((p, i) => `
      <div class="lg-chip${p.isMe ? ' lg-chip--me' : ''}">
        <span class="lg-chip__name">${p.name}${p.isMe ? ' <span class="lg-chip__you">você</span>' : ''}</span>
        <button class="lg-chip__remove" data-i="${i}" aria-label="Remover ${p.name}">✕</button>
      </div>`).join('');
    const startBtn = $('lgStartBtn');
    if (startBtn) startBtn.disabled = state.players.length < 2;
    _renderUserBanner();
  }

  function _renderUserBanner() {
    let banner = $('lgUserBanner');
    const user = window.DivertexUser;
    if (!user) { banner?.remove(); return; }
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'lgUserBanner';
      banner.className = 'lg-user-banner';
      $('lgPlayerForm')?.insertAdjacentElement('afterend', banner);
    }
    const alreadyAdded = state.players.some(p => p.isMe);
    banner.innerHTML = alreadyAdded
      ? `<span class="lg-user-banner__name">Jogando como <strong>${user.name}</strong> ✓</span>`
      : `<span class="lg-user-banner__name">Logado como <strong>${user.name}</strong></span>
         <button id="lgAddMeBtn" class="btn btn--soft btn--sm">+ Entrar no jogo</button>`;
    if (!alreadyAdded) {
      banner.querySelector('#lgAddMeBtn')?.addEventListener('click', () => {
        if (state.players.length >= 8) return;
        state.players.push({ name: user.name, lives: LIVES, eliminated: false, isMe: true });
        renderSetup();
      });
    }
  }

  // ─── Game start ─────────────────────────────────────────────

  function startGame() {
    if (state.players.length < 2) return;
    state.config.lettersPerRound = Math.max(1, Math.min(10, parseInt($('lgLettersCount').value) || 3));
    state.config.timePerLetter = Math.max(5, Math.min(60, parseInt($('lgTimePerLetter').value) || 15));
    state.config.category = $('lgCategory').value || 'livre';
    state.config.mode = $('lgMode').value || 'sequential';
    state.config.bonusOnSuccess = $('lgBonusToggle').checked;
    state.currentPlayerIdx = 0;
    state.roundStats = {};
    state.players.forEach(p => { p.lives = LIVES; p.eliminated = false; state.roundStats[p.name] = { successes: 0, failures: 0 }; });
    showPhase('turn');
    nextTurn();
  }

  // ─── Turn flow ──────────────────────────────────────────────

  function nextTurn() {
    clearTimer();
    const alive = activePlayers();
    if (alive.length <= 1) { showFinal(); return; }

    // Skip eliminated players
    let guard = 0;
    while (state.players[state.currentPlayerIdx]?.eliminated && guard < state.players.length) {
      state.currentPlayerIdx = (state.currentPlayerIdx + 1) % state.players.length;
      guard++;
    }

    state.currentLetters = shuffle(LETTERS_POOL).slice(0, state.config.lettersPerRound);
    state.currentLetterIdx = 0;

    renderTurnHeader();
    renderScoreBoard();

    if (state.config.mode === 'sequential') {
      renderSequentialLetter();
    } else {
      renderSimultaneous();
    }
  }

  function renderTurnHeader() {
    const player = state.players[state.currentPlayerIdx];
    const el = $('lgTurnPlayer');
    if (el) el.textContent = player.name;
    const livesEl = $('lgTurnLives');
    if (livesEl) livesEl.textContent = '❤️'.repeat(player.lives);
    const catEl = $('lgTurnCategory');
    if (catEl) catEl.textContent = CATEGORY_LABELS[state.config.category] || 'Livre';
    const modeEl = $('lgTurnMode');
    if (modeEl) modeEl.textContent = state.config.mode === 'sequential' ? '⏩ Sequencial' : '🔀 Simultâneo';
  }

  // ─── Sequential mode ────────────────────────────────────────

  function renderSequentialLetter() {
    const container = $('lgLettersDisplay');
    if (!container) return;

    const letter = state.currentLetters[state.currentLetterIdx];
    const current = state.currentLetterIdx + 1;
    const total = state.currentLetters.length;

    container.innerHTML = `
      <div class="lg-letter-progress">${current} de ${total}</div>
      <div class="lg-letter-card" id="lgLetterCard">
        <span class="lg-letter-char">${letter}</span>
      </div>
      <div class="lg-letter-hint">Fale: <strong>${CATEGORY_LABELS[state.config.category]}</strong> com <strong>${letter}</strong></div>
    `;

    requestAnimationFrame(() => {
      const card = $('lgLetterCard');
      if (card) { card.classList.add('lg-letter-flip--in'); }
    });

    $('lgTimerDisplay').style.display = '';
    $('lgLetterActions').style.display = '';
    $('lgSimActions').style.display = 'none';

    startTimer(
      state.config.timePerLetter,
      t => updateTimerRing(t, state.config.timePerLetter),
      () => handleLetterResult('fail')
    );
  }

  function handleLetterResult(result) {
    clearTimer();
    const player = state.players[state.currentPlayerIdx];

    if (result === 'success') {
      state.roundStats[player.name].successes++;
      if (state.config.bonusOnSuccess) {
        player.lives = Math.min(player.lives + 1, 10);
        showToast(`${player.name} ganhou +1 vida! ❤️`, 'success');
      }
    } else {
      state.roundStats[player.name].failures++;
      player.lives--;
      if (player.lives <= 0) {
        player.eliminated = true;
        showToast(`${player.name} foi eliminado! 💀`, 'error');
      } else {
        showToast(`${player.name} perdeu 1 vida! (${player.lives} restantes)`, 'info');
      }
    }

    state.currentLetterIdx++;
    if (player.eliminated || state.currentLetterIdx >= state.currentLetters.length) {
      advancePlayer();
    } else {
      renderSequentialLetter();
    }
  }

  // ─── Simultaneous mode ──────────────────────────────────────

  function renderSimultaneous() {
    const container = $('lgLettersDisplay');
    if (!container) return;

    container.innerHTML = `
      <div class="lg-letters-grid">
        ${state.currentLetters.map((l, i) => `
          <div class="lg-letter-card lg-letter-flip--in" style="animation-delay:${i * 80}ms">
            <span class="lg-letter-char">${l}</span>
          </div>`).join('')}
      </div>
      <div class="lg-letter-hint">Fale <strong>${CATEGORY_LABELS[state.config.category]}</strong> para cada letra</div>
    `;

    $('lgTimerDisplay').style.display = '';
    $('lgLetterActions').style.display = 'none';
    $('lgSimActions').style.display = '';

    const totalTime = state.config.timePerLetter * state.currentLetters.length;
    startTimer(
      totalTime,
      t => updateTimerRing(t, totalTime),
      () => handleSimResult('fail')
    );
  }

  function handleSimResult(result) {
    clearTimer();
    const player = state.players[state.currentPlayerIdx];

    if (result === 'success') {
      state.roundStats[player.name].successes += state.currentLetters.length;
      if (state.config.bonusOnSuccess) {
        player.lives = Math.min(player.lives + 1, 10);
        showToast(`${player.name} ganhou +1 vida! ❤️`, 'success');
      }
    } else {
      state.roundStats[player.name].failures++;
      player.lives--;
      if (player.lives <= 0) {
        player.eliminated = true;
        showToast(`${player.name} foi eliminado! 💀`, 'error');
      } else {
        showToast(`${player.name} perdeu 1 vida! (${player.lives} restantes)`, 'info');
      }
    }

    advancePlayer();
  }

  function advancePlayer() {
    const alive = activePlayers();
    if (alive.length <= 1) { showFinal(); return; }
    state.currentPlayerIdx = (state.currentPlayerIdx + 1) % state.players.length;
    let guard = 0;
    while (state.players[state.currentPlayerIdx]?.eliminated && guard < state.players.length) {
      state.currentPlayerIdx = (state.currentPlayerIdx + 1) % state.players.length;
      guard++;
    }
    nextTurn();
  }

  // ─── Scoreboard ─────────────────────────────────────────────

  function renderScoreBoard() {
    const el = $('lgScoreBoard');
    if (!el) return;
    el.innerHTML = state.players.map(p => `
      <div class="lg-score-row${p.eliminated ? ' lg-score-row--out' : ''}">
        <span class="lg-score-name">${p.name}${p.isMe ? ' <span class="lg-chip__you">você</span>' : ''}</span>
        <span class="lg-score-lives">${p.eliminated ? '💀' : '❤️'.repeat(p.lives)}</span>
      </div>`).join('');
  }

  // ─── Final ──────────────────────────────────────────────────

  function showFinal() {
    clearTimer();
    const alive = activePlayers();
    const winner = alive[0] || state.players.reduce((best, p) => p.lives > best.lives ? p : best, state.players[0]);

    const winnerEl = $('lgFinalWinner');
    if (winnerEl) winnerEl.textContent = winner.name;

    const scoresEl = $('lgFinalScores');
    if (scoresEl) {
      const sorted = [...state.players].sort((a, b) => {
        if (!a.eliminated && b.eliminated) return -1;
        if (a.eliminated && !b.eliminated) return 1;
        return b.lives - a.lives;
      });
      scoresEl.innerHTML = sorted.map((p, i) => {
        const stats = state.roundStats[p.name] || { successes: 0, failures: 0 };
        return `<div class="lg-final-score-row${p === winner ? ' lg-final-score-row--winner' : ''}">
          <span>${i === 0 ? '🏆 ' : ''}${p.name}${p.isMe ? ' <span class="lg-chip__you">você</span>' : ''}</span>
          <span>✓ ${stats.successes} ✗ ${stats.failures} ${p.eliminated ? '💀' : `❤️×${p.lives}`}</span>
        </div>`;
      }).join('');
    }

    showPhase('final');

    // Trigger confetti on the winner
    if (typeof window.triggerConfetti === 'function') window.triggerConfetti();

    const me = state.players.find(p => p.isMe);
    if (me) {
      const stats = state.roundStats[me.name] || { successes: 0, failures: 0 };
      submitGameStats({
        gameType: 'letters',
        isWinner: !me.eliminated,
        livesLost: LIVES - me.lives,
        rounds: stats.successes + stats.failures,
        score: me.eliminated ? 0 : Math.round((stats.successes / Math.max(1, stats.successes + stats.failures)) * 100),
      }).catch(() => {});
    }
  }

  // ─── Event listeners ────────────────────────────────────────

  $('lgPlayerForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('lgNameInput');
    const name = input.value.trim();
    if (!name || state.players.find(p => p.name === name) || state.players.length >= 8) return;
    state.players.push({ name, lives: LIVES, eliminated: false });
    input.value = '';
    input.focus();
    renderSetup();
  });

  $('lgPlayersList')?.addEventListener('click', e => {
    const btn = e.target.closest('.lg-chip__remove');
    if (!btn) return;
    state.players.splice(parseInt(btn.dataset.i), 1);
    renderSetup();
  });

  // Sala online: preenche o elenco compartilhado.
  window.addEventListener('divertex:roster', e => {
    if (e.detail?.game !== 'letters') return;
    state.players = (e.detail.players || []).slice(0, 8)
      .map(name => ({ name, lives: LIVES, eliminated: false }));
    renderSetup();
  });

  $('lgStartBtn')?.addEventListener('click', startGame);

  $('lgBackMenuBtn')?.addEventListener('click', goToMenu);
  $('lgBackMenuFinalBtn')?.addEventListener('click', goToMenu);

  $('lgPlayAgainBtn')?.addEventListener('click', () => {
    clearTimer();
    state.players.forEach(p => { p.lives = LIVES; p.eliminated = false; });
    state.roundStats = {};
    state.players.forEach(p => { state.roundStats[p.name] = { successes: 0, failures: 0 }; });
    state.currentPlayerIdx = 0;
    showPhase('turn');
    nextTurn();
  });

  $('lgSuccessBtn')?.addEventListener('click', () => { if (state.config.mode === 'sequential') handleLetterResult('success'); });
  $('lgFailBtn')?.addEventListener('click', () => { if (state.config.mode === 'sequential') handleLetterResult('fail'); });
  $('lgSimSuccessBtn')?.addEventListener('click', () => { if (state.config.mode === 'simultaneous') handleSimResult('success'); });
  $('lgSimFailBtn')?.addEventListener('click', () => { if (state.config.mode === 'simultaneous') handleSimResult('fail'); });

  // Open from menu card
  $('openLettersBtn')?.addEventListener('click', () => {
    $('screenMenu')?.classList.remove('screen--active');
    $('screenLetters')?.classList.add('screen--active');
    resetState();
    renderSetup();
    showPhase('setup');
  });

  // Initial render
  renderSetup();
})();
