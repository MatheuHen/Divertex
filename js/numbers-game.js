// js/numbers-game.js — Sorteador de Números

(() => {
  const $ = id => document.getElementById(id);

  let state = {
    min: 1,
    max: 100,
    quantity: 0,    // 0 = unlimited
    noRepeat: true,
    mode: 'manual', // 'manual' | 'auto' | 'all'
    autoInterval: 3,
    drawn: [],
    pool: [],
    isAnimating: false,
    autoTimer: null,
  };

  // ─── Utils ──────────────────────────────────────────────────

  function buildPool() {
    const a = [];
    for (let i = state.min; i <= state.max; i++) a.push(i);
    return a;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function randInRange() {
    return Math.floor(Math.random() * (state.max - state.min + 1)) + state.min;
  }

  function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast toast--${type}`;
    t.textContent = msg;
    container.appendChild(t);
    requestAnimationFrame(() => t.classList.add('toast--show'));
    setTimeout(() => { t.classList.remove('toast--show'); setTimeout(() => t.remove(), 400); }, 3500);
  }

  // ─── Config ─────────────────────────────────────────────────

  function syncConfig() {
    const rawMin = parseInt($('ngMin')?.value) || 1;
    const rawMax = parseInt($('ngMax')?.value) || 100;
    state.min = Math.max(0, rawMin);
    state.max = Math.max(state.min + 1, rawMax);
    state.quantity = Math.max(0, parseInt($('ngQuantity')?.value) || 0);
    state.noRepeat = $('ngNoRepeat')?.checked ?? true;
    state.mode = $('ngMode')?.value || 'manual';
    state.autoInterval = Math.max(1, Math.min(30, parseInt($('ngAutoInterval')?.value) || 3));
  }

  function applyPreset(min, max) {
    if ($('ngMin')) $('ngMin').value = min;
    if ($('ngMax')) $('ngMax').value = max;
    syncConfig();
    document.querySelectorAll('.ng-preset-btn').forEach(b => b.classList.remove('ng-preset-btn--active'));
  }

  // ─── Reset ──────────────────────────────────────────────────

  function resetDraw() {
    stopAuto();
    syncConfig();
    state.drawn = [];
    state.pool = state.noRepeat ? shuffle(buildPool()) : [];
    state.isAnimating = false;
    const disp = $('ngDisplay');
    if (disp) { disp.textContent = '?'; disp.className = 'ng-display'; }
    renderHistory();
    updateUI();
  }

  // ─── Draw logic ─────────────────────────────────────────────

  function canDraw() {
    if (state.isAnimating) return false;
    if (state.quantity > 0 && state.drawn.length >= state.quantity) return false;
    if (state.noRepeat && state.pool.length === 0) return false;
    return true;
  }

  function pickNumber() {
    if (state.noRepeat) {
      if (state.pool.length === 0) return null;
      return state.pool.pop();
    }
    return randInRange();
  }

  function drawOne() {
    if (!canDraw()) return;
    const number = pickNumber();
    if (number === null) return;
    state.drawn.push(number);
    animateSlotMachine(number);
    renderHistory();
    updateUI();
  }

  function drawAll() {
    stopAuto();
    syncConfig();
    const rangeSize = state.max - state.min + 1;

    if (state.noRepeat && rangeSize > 10000) {
      showToast('Intervalo muito grande para sortear tudo de uma vez (máx 10.000 com sem-repetição).', 'error');
      return;
    }

    state.drawn = [];
    if (state.noRepeat) {
      const pool = shuffle(buildPool());
      const limit = state.quantity > 0 ? Math.min(state.quantity, pool.length) : pool.length;
      state.drawn = pool.slice(0, limit);
    } else {
      const limit = state.quantity > 0 ? Math.min(state.quantity, 500) : Math.min(rangeSize, 100);
      for (let i = 0; i < limit; i++) state.drawn.push(randInRange());
    }

    const last = state.drawn[state.drawn.length - 1];
    const disp = $('ngDisplay');
    if (disp) {
      disp.className = 'ng-display ng-display--lit';
      disp.textContent = last;
    }
    renderHistory();
    updateUI();
    showToast(`${state.drawn.length} número${state.drawn.length > 1 ? 's' : ''} sorteado${state.drawn.length > 1 ? 's' : ''}!`, 'success');
  }

  // ─── Slot-machine animation ──────────────────────────────────

  function animateSlotMachine(target) {
    state.isAnimating = true;
    const disp = $('ngDisplay');
    if (!disp) { state.isAnimating = false; return; }
    disp.className = 'ng-display ng-display--rolling';

    // Steps: interval in ms between each number flip (accelerate then brake)
    const steps = [40, 40, 50, 60, 70, 85, 100, 125, 155, 190, 230];
    let i = 0;

    function tick() {
      if (i >= steps.length) {
        disp.textContent = target;
        disp.className = 'ng-display ng-display--lit';
        state.isAnimating = false;
        updateUI();
        return;
      }
      disp.textContent = randInRange();
      setTimeout(tick, steps[i++]);
    }

    tick();
  }

  // ─── Auto mode ──────────────────────────────────────────────

  function startAuto() {
    if (state.autoTimer) return;
    syncConfig();
    state.pool = state.noRepeat ? shuffle(buildPool()) : [];
    state.drawn = [];
    renderHistory();

    const draw = () => {
      if (!canDraw()) { stopAuto(); showToast('Sorteio automático concluído!', 'success'); return; }
      drawOne();
    };

    draw();
    state.autoTimer = setInterval(draw, state.autoInterval * 1000);
    updateUI();
  }

  function stopAuto() {
    if (state.autoTimer) { clearInterval(state.autoTimer); state.autoTimer = null; }
    state.isAnimating = false;
    updateUI();
  }

  // ─── Render ─────────────────────────────────────────────────

  function renderHistory() {
    const grid = $('ngHistoryGrid');
    if (!grid) return;

    if (!state.drawn.length) {
      grid.innerHTML = '<div class="ng-history-empty">Nenhum número sorteado ainda</div>';
      return;
    }

    grid.innerHTML = state.drawn.map((n, i) => {
      const isLast = i === state.drawn.length - 1;
      return `<div class="ng-history-item${isLast ? ' ng-history-item--last' : ''}" title="Sorteio #${i + 1}">${n}</div>`;
    }).join('');

    grid.querySelector('.ng-history-item--last')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function updateUI() {
    const mode = $('ngMode')?.value || state.mode;
    const isAuto = !!state.autoTimer;
    const isAnimating = state.isAnimating;
    const drawnCount = state.drawn.length;
    const rangeSize = state.max - state.min + 1;
    const exhausted = state.noRepeat && state.pool.length === 0 && drawnCount > 0;

    // Mode-specific control panels
    const set = (id, visible) => { const el = $(id); if (el) el.style.display = visible ? '' : 'none'; };
    set('ngManualControls', mode === 'manual');
    set('ngAutoControls', mode === 'auto');
    set('ngAllControls', mode === 'all');
    set('ngAutoIntervalField', mode === 'auto');

    // Manual draw button
    const drawBtn = $('ngDrawBtn');
    if (drawBtn) {
      drawBtn.disabled = !canDraw();
      drawBtn.textContent = drawnCount === 0 ? '🎲 Sortear' : '🎲 Próximo';
    }

    // Auto buttons
    const autoStart = $('ngAutoStartBtn');
    const autoStop = $('ngAutoStopBtn');
    if (autoStart) { autoStart.style.display = isAuto ? 'none' : ''; autoStart.disabled = isAnimating; }
    if (autoStop) autoStop.style.display = isAuto ? '' : 'none';

    // Draw-all button
    const allBtn = $('ngDrawAllBtn');
    if (allBtn) allBtn.disabled = isAnimating || isAuto;

    // Copy button
    const copyBtn = $('ngCopyBtn');
    if (copyBtn) copyBtn.disabled = drawnCount === 0;

    // Exhausted banner
    set('ngExhausted', exhausted);

    // Progress
    const prog = $('ngProgress');
    if (prog) {
      const showProgress = state.quantity > 0 || (state.noRepeat && drawnCount > 0);
      prog.style.display = showProgress ? '' : 'none';
      if (showProgress) {
        const total = state.quantity > 0 ? state.quantity : rangeSize;
        const pct = Math.min(100, (drawnCount / total) * 100);
        const bar = prog.querySelector('.ng-progress-bar');
        const txt = prog.querySelector('.ng-progress-text');
        if (bar) bar.style.width = `${pct}%`;
        if (txt) txt.textContent = `${drawnCount} / ${total}`;
      }
    }

    // Count label
    const countEl = $('ngDrawnCount');
    if (countEl) countEl.textContent = drawnCount > 0 ? `${drawnCount} sorteado${drawnCount > 1 ? 's' : ''}` : '';
  }

  // ─── Copy ───────────────────────────────────────────────────

  function copyAll() {
    if (!state.drawn.length) return;
    const text = state.drawn.join(', ');
    navigator.clipboard?.writeText(text)
      .then(() => showToast('Números copiados para a área de transferência!', 'success'))
      .catch(() => showToast(`Números: ${text}`, 'info'));
  }

  // ─── Navigation ─────────────────────────────────────────────

  function goToMenu() {
    stopAuto();
    $('screenNumbers')?.classList.remove('screen--active');
    $('screenMenu')?.classList.add('screen--active');
  }

  // ─── Event listeners ────────────────────────────────────────

  document.querySelectorAll('.ng-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyPreset(parseInt(btn.dataset.min), parseInt(btn.dataset.max));
      document.querySelectorAll('.ng-preset-btn').forEach(b => b.classList.remove('ng-preset-btn--active'));
      btn.classList.add('ng-preset-btn--active');
    });
  });

  ['ngMin', 'ngMax', 'ngQuantity'].forEach(id => {
    $(id)?.addEventListener('change', () => { syncConfig(); updateUI(); });
  });

  $('ngNoRepeat')?.addEventListener('change', () => { syncConfig(); updateUI(); });

  $('ngMode')?.addEventListener('change', () => {
    stopAuto();
    syncConfig();
    updateUI();
  });

  $('ngDrawBtn')?.addEventListener('click', () => {
    syncConfig();
    if (state.drawn.length === 0) state.pool = state.noRepeat ? shuffle(buildPool()) : [];
    drawOne();
  });

  $('ngAutoStartBtn')?.addEventListener('click', startAuto);
  $('ngAutoStopBtn')?.addEventListener('click', stopAuto);
  $('ngDrawAllBtn')?.addEventListener('click', () => { syncConfig(); drawAll(); });
  $('ngResetBtn')?.addEventListener('click', resetDraw);
  $('ngCopyBtn')?.addEventListener('click', copyAll);
  $('ngBackMenuBtn')?.addEventListener('click', goToMenu);

  $('openNumbersBtn')?.addEventListener('click', () => {
    $('screenMenu')?.classList.remove('screen--active');
    $('screenNumbers')?.classList.add('screen--active');
    resetDraw();
  });

  // Init
  updateUI();
  renderHistory();
})();
