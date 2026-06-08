/**
 * room-sync.js — Sincronização AO VIVO de partidas nas salas online.
 *
 * Modelo host-autoritativo (espelho ao vivo): o host conduz o jogo e cada
 * mudança da tela ativa (votos, giros, revelações, placar, cartas, turnos) é
 * transmitida para todos os convidados, que veem exatamente a mesma tela em
 * tempo real (somente leitura). Funciona de forma uniforme em TODOS os jogos
 * porque sincroniza a própria interface, sem reescrever a lógica de cada jogo.
 *
 * Botões de giro disparam um efeito "girando" + som em todos os aparelhos.
 */

import Room from './realtime-room.js';

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
  if (!screen) {
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
    bar.innerHTML = `<span class="roomSpectatorBar__txt">👁 Você está vendo o jogo do host ao vivo</span>
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
    if (Room.isHost()) return; // host não espelha a si mesmo
    if (kind === 'dom') { _applyMirror(payload.screen, payload.html); }
    else if (kind === 'dom-end') { _exitSpectator(); }
    else if (kind === 'fx-spin') { window.DivertexSFX?.spin(); _flashSpin(); }
  });

  // Ao sair/encerrar a sala, garante saída do modo espectador.
  Room.on('closed', _exitSpectator);
  Room.on('status', () => { if (!Room.isActive() && spectating) _exitSpectator(); });
}

function _flashSpin() {
  const s = document.querySelector('.screen.screen--active');
  if (!s) return;
  s.classList.remove('room-spinflash'); void s.offsetWidth; s.classList.add('room-spinflash');
}

export default { initRoomSync };
