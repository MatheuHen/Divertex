/**
 * sound.js — motor de efeitos sonoros do Divertex (Web Audio, zero assets).
 * Sons sintetizados em tempo real. Exposto como window.DivertexSFX.
 * Mudo persistido em localStorage; respeita prefers-reduced-motion para haptics.
 */

const KEY = 'divertex.sound';
let _ctx = null;
let _muted = localStorage.getItem(KEY) === 'off';

function ctx() {
  if (!_ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    _ctx = new AC();
  }
  if (_ctx.state === 'suspended') _ctx.resume().catch(() => {});
  return _ctx;
}

// Um "bip" com envelope ADSR simples.
function tone({ freq = 440, dur = 0.12, type = 'sine', gain = 0.18, slideTo = null, delay = 0 }) {
  if (_muted) return;
  const ac = ctx();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function chord(freqs, opts = {}) { freqs.forEach((f, i) => tone({ ...opts, freq: f, delay: (opts.stagger || 0) * i })); }

function haptic(ms = 12) {
  if (_muted) return;
  if (navigator.vibrate) try { navigator.vibrate(ms); } catch { /* noop */ }
}

const SFX = {
  isMuted: () => _muted,
  toggle() { _muted = !_muted; localStorage.setItem(KEY, _muted ? 'off' : 'on'); if (!_muted) this.click(); return _muted; },
  setMuted(v) { _muted = Boolean(v); localStorage.setItem(KEY, _muted ? 'off' : 'on'); },

  click()  { tone({ freq: 520, dur: 0.06, type: 'triangle', gain: 0.10 }); haptic(8); },
  pop()    { tone({ freq: 680, dur: 0.09, type: 'sine', gain: 0.14, slideTo: 920 }); haptic(10); },
  tick()   { tone({ freq: 320, dur: 0.04, type: 'square', gain: 0.05 }); },
  toggleSnd(){ tone({ freq: 600, dur: 0.07, type: 'triangle', gain: 0.10, slideTo: 480 }); },

  spin()   { tone({ freq: 180, dur: 0.7, type: 'sawtooth', gain: 0.08, slideTo: 720 }); haptic(20); },
  success(){ chord([523, 659, 784], { dur: 0.22, type: 'triangle', gain: 0.14, stagger: 0.06 }); haptic([10, 30, 10]); },
  fail()   { tone({ freq: 300, dur: 0.32, type: 'sawtooth', gain: 0.14, slideTo: 120 }); haptic([20, 40]); },
  reveal() { chord([392, 587], { dur: 0.18, type: 'sine', gain: 0.14, stagger: 0.07 }); haptic(14); },
  win()    { chord([523, 659, 784, 1046], { dur: 0.4, type: 'triangle', gain: 0.16, stagger: 0.11 }); haptic([15, 40, 15, 60]); },

  join()    { chord([440, 660], { dur: 0.16, type: 'sine', gain: 0.12, stagger: 0.05 }); },
  leave()   { tone({ freq: 440, dur: 0.16, type: 'sine', gain: 0.10, slideTo: 280 }); },
  message() { tone({ freq: 880, dur: 0.08, type: 'sine', gain: 0.10 }); haptic(8); },
  start()   { chord([392, 523, 659], { dur: 0.26, type: 'triangle', gain: 0.15, stagger: 0.08 }); haptic([20, 30]); },
  error()   { tone({ freq: 200, dur: 0.25, type: 'square', gain: 0.10, slideTo: 140 }); },
};

window.DivertexSFX = SFX;

// ─── Camada universal de feedback sonoro ────────────────────────────────────
// Dá "tato" sonoro a todos os botões do app sem editar cada jogo.
document.addEventListener('pointerdown', (e) => {
  const t = e.target.closest('button, .btn, .diffPill, .diffBtn, .gameCard, .roomGameBtn, summary, .vc-choice-btn, .lk-vote-card, .cc-card');
  if (!t) return;
  const id = t.id || '';
  if (/spin|girar|sortear|draw|Spin|Draw/i.test(id)) { SFX.spin(); return; }
  if (t.classList.contains('btn--success') || /success|done|cumpriu|respondeu|conseguiu/i.test(id)) { SFX.success(); return; }
  if (t.classList.contains('btn--danger') || /fail|falhou|pulou|recus/i.test(id)) { SFX.fail(); return; }
  SFX.click();
}, { passive: true });

// Sons em momentos-chave dos jogos (eventos disparados pelo app).
window.addEventListener('divertex:win', () => SFX.win());
window.addEventListener('divertex:reveal', () => SFX.reveal());

// ─── Botão flutuante de mudo ────────────────────────────────────────────────
function _buildToggle() {
  if (document.getElementById('soundToggleFab')) return;
  const btn = document.createElement('button');
  btn.id = 'soundToggleFab';
  btn.className = 'soundToggleFab';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Ativar ou desativar som');
  const paint = () => { btn.textContent = _muted ? '🔇' : '🔊'; btn.classList.toggle('soundToggleFab--off', _muted); };
  paint();
  btn.addEventListener('click', () => { SFX.toggle(); paint(); });
  document.body.appendChild(btn);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _buildToggle);
else _buildToggle();

export default SFX;
