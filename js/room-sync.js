/**
 * room-sync.js — Sincronização AO VIVO + jogo conjunto nas salas online.
 *
 * Modelo host-autoritativo (espelho ao vivo): o host conduz o jogo e cada
 * mudança da tela ativa é transmitida para todos os convidados, que veem
 * exatamente a mesma tela em tempo real. Funciona de forma uniforme em TODOS os
 * jogos porque sincroniza a própria interface, sem reescrever cada jogo.
 *
 * JOGO CONJUNTO (interativo): o convidado também JOGA — ao tocar num elemento da
 * tela espelhada, o toque é reenviado ao host (evento 'cmd' com o caminho do
 * elemento), o host executa o clique de verdade na sua própria árvore (lógica
 * autoritativa roda) e a tela atualizada volta espelhada para todos. Assim
 * qualquer um gira a roleta, sorteia, escolhe e avança turnos — em todos os
 * minigames, sem reescrever nenhum. Navegação (voltar ao menu) fica local.
 *
 * Exceção: telas em window.DivertexSelfSync (ex.: voto secreto do "Quem é Mais
 * Provável") cuidam da própria sync e não passam por aqui.
 */

import Room from './realtime-room.js';

// Telas que gerenciam a PRÓPRIA sincronização (ex.: voto secreto do "Quem é
// Mais Provável"). O host não as transmite como espelho e o convidado não as
// espelha — cada aparelho roda sua UI interativa. Os jogos registram/limpam
// seus ids aqui ao entrar/sair do modo online.
if (!window.DivertexSelfSync) window.DivertexSelfSync = new Set();

const GAME_SCREEN_IDS = new Set([
  'screenWheel', 'screenLikely', 'screenLetters', 'screenNumbers', 'screenNames',
  'screenVerdade', 'screenCartas', 'screenDuelo', 'screenMestre',
]);

let observer = null;
let throttle = null;
let lastHtml = '';
let lastScreen = '';
let spectating = false;

function activeGameScreen() {
  const el = document.querySelector('.screen.screen--active');
  return el && GAME_SCREEN_IDS.has(el.id) ? el : null;
}

// ─── Host: observa e transmite a tela ativa ─────────────────────────────────
function _broadcastNow() {
  if (!Room.isActive() || !Room.isHost()) return;
  const screen = activeGameScreen();
  // Tela auto-sincronizada: não espelha (o jogo cuida da própria sync). Trata
  // como "sem tela de jogo" para que convidados saiam do modo espectador.
  if (!screen || window.DivertexSelfSync.has(screen.id)) {
    if (lastScreen) { lastScreen = ''; lastHtml = ''; Room.syncEvent('dom-end', {}); }
    return;
  }
  const html = screen.innerHTML;
  if (screen.id === lastScreen && html === lastHtml) return;
  lastScreen = screen.id;
  lastHtml = html;
  Room.syncEvent('dom', { screen: screen.id, html });
}

function _scheduleBroadcast() {
  if (throttle) return;
  throttle = setTimeout(() => { throttle = null; _broadcastNow(); }, 110);
}

function _startHostObserver() {
  if (observer) return;
  observer = new MutationObserver(_scheduleBroadcast);
  observer.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
  // Heartbeat: reenvia o snapshot p/ quem entrar no meio da partida.
  setInterval(() => { lastHtml = ''; _broadcastNow(); }, 1500);
  // Efeito de giro: clique em botões de sorteio dispara FX em todos.
  document.addEventListener('pointerdown', (e) => {
    if (!Room.isActive() || !Room.isHost()) return;
    const t = e.target.closest('button, .btn');
    if (t && /spin|girar|sortear|draw/i.test(t.id || '')) Room.syncEvent('fx-spin', {});
  }, { passive: true });
}

// ─── Convidado: aplica o espelho da tela do host ────────────────────────────
function _enterSpectator() {
  if (spectating) return;
  spectating = true;
  document.body.classList.add('room-spectator');
  let bar = document.getElementById('roomSpectatorBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'roomSpectatorBar';
    bar.innerHTML = `<span class="roomSpectatorBar__txt">🎮 Jogando junto — toque para participar</span>
      <button id="roomSpectatorLeave" class="btn btn--ghost btn--sm" type="button">Sair</button>`;
    document.body.appendChild(bar);
    bar.querySelector('#roomSpectatorLeave').addEventListener('click', async () => {
      await Room.leave();
      _exitSpectator();
    });
  }
  bar.removeAttribute('hidden');
}

function _exitSpectator() {
  spectating = false;
  document.body.classList.remove('room-spectator');
  document.getElementById('roomSpectatorBar')?.setAttribute('hidden', '');
  // volta ao menu
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('screen--active'));
  document.getElementById('screenMenu')?.classList.add('screen--active');
}

function _applyMirror(screenId, html) {
  // Ignora espelho de telas auto-sincronizadas (caso chegue um evento atrasado).
  if (window.DivertexSelfSync.has(screenId)) return;
  const screen = document.getElementById(screenId);
  if (!screen) return;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('screen--active'));
  screen.classList.add('screen--active');
  // Só reescreve se mudou (evita resetar scroll/anim à toa).
  if (screen.innerHTML !== html) screen.innerHTML = html;
  _enterSpectator();
}

export function initRoomSync() {
  _startHostObserver();

  Room.on('event', (e) => {
    const { kind, payload } = e.detail || {};
    if (Room.isHost()) {
      // Host: executa os toques que os convidados enviaram (jogo conjunto).
      if (kind === 'cmd') _replayCmd(payload);
      return;
    }
    // Convidado: aplica o espelho da tela do host.
    if (kind === 'dom') { _applyMirror(payload.screen, payload.html); }
    else if (kind === 'dom-end') { _exitSpectator(); }
    else if (kind === 'fx-spin') { window.DivertexSFX?.spin(); _flashSpin(); }
  });

  // Convidado: encaminha toques na tela espelhada para o host (fase de captura,
  // para neutralizar qualquer handler local antes que dispare).
  document.addEventListener('click', _onGuestTap, true);

  // Ao sair/encerrar a sala, garante saída do modo espectador.
  Room.on('closed', _exitSpectator);
  Room.on('status', () => { if (!Room.isActive() && spectating) _exitSpectator(); });
}

// ─── Jogo conjunto: convidado encaminha toque, host executa ─────────────────

// Navegação/saída fica local (não controla o host). O convidado usa "Sair".
function _isNavControl(el) {
  return /backmenu|backtomenu|menubtn|leavebtn/i.test(el.id || '');
}

// Acha o elemento "clicável" a partir do alvo: botão, .btn, [data-name],
// [role=button] ou qualquer elemento com id e cursor de ponteiro (ex.: divs
// clicáveis como o "revelar regra" do Mestre da Rodada).
function _interactiveTarget(target, screen) {
  let el = target.closest('button, .btn, [role="button"], [data-name]');
  if (el && screen.contains(el)) return el;
  let n = target;
  while (n && n !== screen) {
    if (n.id && getComputedStyle(n).cursor === 'pointer') return n;
    n = n.parentElement;
  }
  return null;
}

// Caminho posicional (índices de elementos-filho) da raiz até o elemento.
// Como o espelho copia o innerHTML idêntico, o mesmo caminho resolve no host.
function _nodePath(root, el) {
  const path = [];
  let node = el;
  while (node && node !== root) {
    const parent = node.parentElement;
    if (!parent) return null;
    path.unshift(Array.prototype.indexOf.call(parent.children, node));
    node = parent;
  }
  return node === root ? path : null;
}

function _onGuestTap(e) {
  if (!spectating || Room.isHost()) return;
  const screen = document.querySelector('.screen.screen--active');
  if (!screen || !screen.contains(e.target)) return;
  const el = _interactiveTarget(e.target, screen);
  if (!el || _isNavControl(el)) return; // sem alvo útil ou é navegação → deixa local
  const path = _nodePath(screen, el);
  if (!path) return;
  // Bloqueia o handler local do convidado e manda o comando ao host.
  e.preventDefault();
  e.stopImmediatePropagation();
  Room.syncEvent('cmd', { screen: screen.id, path });
  _tapPulse(el);
}

// Host: resolve o caminho na própria árvore e dispara o clique real.
function _replayCmd({ screen: screenId, path }) {
  if (!Array.isArray(path)) return;
  const screen = document.getElementById(screenId);
  if (!screen || !screen.classList.contains('screen--active')) return;
  if (window.DivertexSelfSync.has(screenId)) return;
  let node = screen;
  for (const idx of path) { node = node && node.children && node.children[idx]; if (!node) return; }
  if (node && typeof node.click === 'function') node.click();
}

function _tapPulse(el) {
  el.classList.remove('room-tap'); void el.offsetWidth; el.classList.add('room-tap');
}

function _flashSpin() {
  const s = document.querySelector('.screen.screen--active');
  if (!s) return;
  s.classList.remove('room-spinflash'); void s.offsetWidth; s.classList.add('room-spinflash');
}

export default { initRoomSync };
