// js/names-wheel.js — Sorteador de Nomes

(() => {
  const $ = id => document.getElementById(id);

  // ─── State ──────────────────────────────────────────────────

  let names = [];      // { name: string, id: number }
  let history = [];    // string[] newest-first
  let nameIdSeq = 0;
  let isSpinning = false;

  const wheel = { ctx: null, angle: 0, anim: null, dpr: 1 };

  // ─── Utils ──────────────────────────────────────────────────

  function normalizeAngle(rad) {
    const t = rad % (Math.PI * 2);
    return t < 0 ? t + Math.PI * 2 : t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function segmentColor(i, total) {
    const hue = (160 + (i * 360) / Math.max(1, total)) % 360;
    return `hsl(${hue} 82% 54%)`;
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

  // ─── Canvas ─────────────────────────────────────────────────

  function initCanvas() {
    const canvas = $('nwCanvas');
    if (!canvas || wheel.ctx) return;
    wheel.ctx = canvas.getContext('2d');
    ensureCanvasSize();
    renderWheel();
  }

  function ensureCanvasSize() {
    const canvas = $('nwCanvas');
    if (!canvas) return;
    const wrap = canvas.parentElement;
    const size = Math.max(260, Math.min((wrap?.clientWidth || 420) - 4, 500));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    wheel.dpr = dpr;
    canvas.width = Math.floor(size * dpr);
    canvas.height = Math.floor(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
  }

  // ─── Wheel rendering ────────────────────────────────────────

  function renderWheel() {
    if (!wheel.ctx) return;
    ensureCanvasSize();

    const ctx = wheel.ctx;
    const canvas = $('nwCanvas');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.46;
    const ring = Math.max(14, Math.floor(r * 0.08));
    const innerR = r - ring;

    ctx.save();
    ctx.translate(cx, cy);

    // Outer shadow ring
    ctx.beginPath();
    ctx.arc(0, 0, r + 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fill();

    // Gradient border
    const bgGrad = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
    bgGrad.addColorStop(0, 'rgba(255,255,255,0.18)');
    bgGrad.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.beginPath();
    ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    if (!names.length) {
      // Gradient fill
      const emptyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, innerR);
      emptyGrad.addColorStop(0, 'rgba(20,184,166,0.12)');
      emptyGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.beginPath();
      ctx.arc(0, 0, innerR, 0, Math.PI * 2);
      ctx.fillStyle = emptyGrad;
      ctx.fill();
      // Dashed border
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(20,184,166,0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, innerR - 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // Icon
      const iconFs = Math.floor(r * 0.22);
      ctx.font = `${iconFs}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎯', 0, -Math.floor(r * 0.12));
      // Text
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      const fs = Math.floor(r * 0.09);
      ctx.font = `800 ${fs}px system-ui`;
      ctx.fillText('Adicione nomes', 0, Math.floor(r * 0.08));
      const fs2 = Math.floor(r * 0.075);
      ctx.font = `600 ${fs2}px system-ui`;
      ctx.fillStyle = 'rgba(20,184,166,0.9)';
      ctx.fillText('e gire a roleta!', 0, Math.floor(r * 0.19));
      ctx.restore();
      return;
    }

    const n = names.length;
    const slice = (Math.PI * 2) / n;
    const start = wheel.angle;

    for (let i = 0; i < n; i++) {
      const a0 = start + i * slice;
      const a1 = a0 + slice;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, innerR, a0, a1);
      ctx.closePath();
      ctx.fillStyle = segmentColor(i, n);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 2 * wheel.dpr;
      ctx.stroke();

      const mid = a0 + slice / 2;
      const fs = Math.max(10, Math.floor(r * 0.065));
      ctx.save();
      ctx.rotate(mid);
      ctx.translate(innerR * 0.62, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = 'rgba(0,0,0,0.72)';
      ctx.font = `900 ${fs}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(names[i].name, 0, 0, innerR * 0.72);
      ctx.restore();
    }

    // Hub
    ctx.beginPath();
    ctx.arc(0, 0, ring, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, ring - 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fill();

    ctx.restore();
  }

  // ─── Spin ───────────────────────────────────────────────────

  function spinOnce() {
    if (isSpinning || names.length < 2) return;

    // Hide previous result
    $('nwResult')?.setAttribute('hidden', '');

    isSpinning = true;
    updateSpinBtn();

    const n = names.length;
    const slice = (Math.PI * 2) / n;
    const selectedIndex = Math.floor(Math.random() * n);

    const pointer = -Math.PI / 2;
    const centerRel = selectedIndex * slice + slice / 2;
    const targetAbs = pointer - centerRel;
    const baseDelta = normalizeAngle(targetAbs - wheel.angle);
    const extraSpins = 5 + Math.floor(Math.random() * 4);
    const delta = baseDelta + extraSpins * Math.PI * 2;

    const startAngle = wheel.angle;
    const endAngle = startAngle + delta;
    const duration = 4000 + Math.floor(Math.random() * 800);
    const startT = performance.now();

    if (wheel.anim) cancelAnimationFrame(wheel.anim);

    const frame = () => {
      const elapsed = performance.now() - startT;
      const p = Math.min(elapsed / duration, 1);
      wheel.angle = startAngle + (endAngle - startAngle) * easeOutCubic(p);
      renderWheel();

      if (p < 1) { wheel.anim = requestAnimationFrame(frame); return; }

      wheel.angle = normalizeAngle(endAngle);
      isSpinning = false;
      renderWheel();

      const winner = names[selectedIndex];
      if (winner) showResult(winner, selectedIndex);
      updateSpinBtn();
    };

    wheel.anim = requestAnimationFrame(frame);
  }

  // ─── Result ─────────────────────────────────────────────────

  function showResult(winner, idx) {
    history.unshift(winner.name);
    renderHistory();

    const result = $('nwResult');
    const nameEl = $('nwResultName');
    if (nameEl) nameEl.textContent = winner.name;

    const color = segmentColor(idx, names.length);
    if (nameEl) nameEl.style.color = color;

    const removeBtn = $('nwRemoveWinnerBtn');
    if (removeBtn) removeBtn.dataset.winnerId = winner.id;

    if (result) result.removeAttribute('hidden');
  }

  function removeWinnerAndClose(winnerId) {
    const id = parseInt(winnerId);
    const removed = names.find(n => n.id === id);
    names = names.filter(n => n.id !== id);
    renderNamesList();
    renderWheel();
    updateSpinBtn();
    if (removed) showToast(`${removed.name} removido da lista.`, 'info');
    $('nwResult')?.setAttribute('hidden', '');
  }

  // ─── Names list ─────────────────────────────────────────────

  function addName(name) {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (names.find(n => n.name.toLowerCase() === trimmed.toLowerCase())) return false;
    if (names.length >= 30) { showToast('Máximo de 30 nomes atingido.', 'error'); return false; }
    names.push({ name: trimmed, id: ++nameIdSeq });
    renderNamesList();
    renderWheel();
    updateSpinBtn();
    return true;
  }

  function addBulk(csv) {
    const parts = csv.split(',').map(s => s.trim()).filter(Boolean);
    let added = 0;
    parts.forEach(p => { if (addName(p)) added++; });
    if (added > 0) showToast(`${added} nome${added > 1 ? 's' : ''} adicionado${added > 1 ? 's' : ''}!`, 'success');
    return added;
  }

  function renderNamesList() {
    const list = $('nwNamesList');
    if (!list) return;
    if (!names.length) {
      list.innerHTML = '<div class="nw-names-empty">Nenhum nome adicionado ainda</div>';
      return;
    }
    list.innerHTML = names.map((n, i) => `
      <div class="nw-chip">
        <span class="nw-chip__dot" style="background:${segmentColor(i, names.length)}"></span>
        <span class="nw-chip__name">${n.name}</span>
        <button class="nw-chip__remove" data-id="${n.id}" aria-label="Remover ${n.name}" type="button">✕</button>
      </div>`).join('');
  }

  function renderHistory() {
    const el = $('nwHistory');
    if (!el) return;
    if (!history.length) {
      el.innerHTML = '<div class="nw-hist-empty">Nenhum sorteio ainda</div>';
      return;
    }
    el.innerHTML = history.map((name, i) => `
      <div class="nw-hist-item${i === 0 ? ' nw-hist-item--last' : ''}">
        <span class="nw-hist-pos">#${i + 1}</span>
        <span class="nw-hist-name">${name}</span>
        ${i === 0 ? '<span class="nw-hist-badge">último</span>' : ''}
      </div>`).join('');
  }

  function updateSpinBtn() {
    const btn = $('nwSpinBtn');
    if (!btn) return;
    btn.disabled = isSpinning || names.length < 2;
    btn.textContent = isSpinning ? '🌀 Girando…' : '🎯 Girar!';
  }

  // ─── Navigation ─────────────────────────────────────────────

  function goToMenu() {
    if (wheel.anim) { cancelAnimationFrame(wheel.anim); wheel.anim = null; }
    isSpinning = false;
    $('screenNames')?.classList.remove('screen--active');
    $('screenMenu')?.classList.add('screen--active');
  }

  // ─── Events ─────────────────────────────────────────────────

  $('nwNameForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('nwNameInput');
    const val = input.value;
    const added = val.includes(',') ? addBulk(val) : (addName(val) ? 1 : 0);
    if (added) { input.value = ''; input.focus(); }
  });

  $('nwNamesList')?.addEventListener('click', e => {
    const btn = e.target.closest('.nw-chip__remove');
    if (!btn) return;
    names = names.filter(n => n.id !== parseInt(btn.dataset.id));
    renderNamesList();
    renderWheel();
    updateSpinBtn();
  });

  $('nwClearBtn')?.addEventListener('click', () => {
    if (!names.length) return;
    names = [];
    renderNamesList();
    renderWheel();
    updateSpinBtn();
    $('nwResult')?.setAttribute('hidden', '');
    showToast('Lista limpa.', 'info');
  });

  $('nwSpinBtn')?.addEventListener('click', spinOnce);

  $('nwSpinAgainBtn')?.addEventListener('click', () => {
    $('nwResult')?.setAttribute('hidden', '');
    spinOnce();
  });

  $('nwRemoveWinnerBtn')?.addEventListener('click', e => {
    removeWinnerAndClose(e.currentTarget.dataset.winnerId);
  });

  $('nwBackMenuBtn')?.addEventListener('click', goToMenu);

  window.addEventListener('resize', () => {
    if ($('screenNames')?.classList.contains('screen--active')) {
      ensureCanvasSize();
      renderWheel();
    }
  });

  $('openNamesBtn')?.addEventListener('click', () => {
    $('screenMenu')?.classList.remove('screen--active');
    $('screenNames')?.classList.add('screen--active');

    // Auto-add logged-in user
    const user = window.DivertexUser;
    if (user && !names.find(n => n.name === user.name)) addName(user.name);

    requestAnimationFrame(() => {
      initCanvas();
      renderNamesList();
      renderHistory();
      updateSpinBtn();
    });
  });

  // Init
  renderNamesList();
  renderHistory();
  updateSpinBtn();
})();
