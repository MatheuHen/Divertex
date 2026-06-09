/**
 * room-ui.js — Interface das salas online.
 * Botão flutuante + painel (criar/entrar, convite, presença, chat, lançar jogo).
 * Sincroniza navegação: quando o host inicia um jogo, todos abrem a mesma tela
 * com o mesmo elenco de jogadores (evento divertex:roster).
 */

import Room from './realtime-room.js';
import { initRoomSync } from './room-sync.js';

// gameKey → id do botão de abertura no menu (reusa a lógica existente do app).
const GAME_OPEN_BTN = {
  wheel: 'openWheelBtn', likely: 'openLikelyBtn', letters: 'openLettersBtn',
  numbers: 'openNumbersBtn', names: 'openNamesBtn', verdade: 'openVerdadeBtn',
  cartas: 'openCartasBtn', duelo: 'openDueloBtn', mestre: 'openMestreBtn',
};
const GAMES = [
  { key: 'wheel',   icon: '🎡', name: 'Roleta de Vidas' },
  { key: 'likely',  icon: '🤔', name: 'Quem é Mais Provável' },
  { key: 'letters', icon: '🔤', name: 'Sorteador de Letras' },
  { key: 'verdade', icon: '🎭', name: 'Verdade ou Caos' },
  { key: 'cartas',  icon: '🃏', name: 'Cartas do Caos' },
  { key: 'duelo',   icon: '⚔️', name: 'Duelo de Coragem' },
  { key: 'mestre',  icon: '👑', name: 'Mestre da Rodada' },
  { key: 'names',   icon: '🎯', name: 'Sorteador de Nomes' },
  { key: 'numbers', icon: '🎰', name: 'Sorteador de Números' },
];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

let panelEl, fabEl, chatBody, membersEl;
let _pendingJoinCode = null;

export function initRoomUI() {
  _buildDom();
  _wireRoomEvents();
  initRoomSync();

  // Link de convite ?sala=CODE — guarda para entrar assim que logar.
  const params = new URLSearchParams(location.search);
  const sala = params.get('sala');
  if (sala) {
    _pendingJoinCode = sala.toUpperCase();
    history.replaceState({}, document.title, '/');
  }

  window.addEventListener('divertex:user', (e) => {
    const logged = Boolean(e.detail);
    fabEl?.toggleAttribute('hidden', !logged);
    if (logged && _pendingJoinCode) {
      const code = _pendingJoinCode; _pendingJoinCode = null;
      _openPanel(); _doJoin(code);
    }
  });
}

// ─── DOM ────────────────────────────────────────────────────────────────────
function _buildDom() {
  if (document.getElementById('roomFab')) return;

  fabEl = document.createElement('button');
  fabEl.id = 'roomFab';
  fabEl.className = 'roomFab';
  fabEl.type = 'button';
  fabEl.setAttribute('hidden', '');
  fabEl.innerHTML = `<span class="roomFab__icon">🎮</span><span class="roomFab__label">Jogar Online</span><span id="roomFabBadge" class="roomFab__badge" hidden>0</span>`;
  fabEl.addEventListener('click', () => { window.DivertexSFX?.click(); _openPanel(); });
  document.body.appendChild(fabEl);

  panelEl = document.createElement('div');
  panelEl.id = 'roomPanel';
  panelEl.className = 'roomPanel';
  panelEl.setAttribute('hidden', '');
  panelEl.innerHTML = `
    <div class="roomPanel__backdrop" data-close></div>
    <div class="roomPanel__sheet" role="dialog" aria-modal="true" aria-label="Salas online">
      <button class="roomPanel__close" data-close type="button" aria-label="Fechar">✕</button>
      <div id="roomView"></div>
    </div>`;
  panelEl.addEventListener('click', e => { if (e.target.dataset.close !== undefined) _closePanel(); });
  document.body.appendChild(panelEl);
}

function _openPanel() { panelEl.removeAttribute('hidden'); document.body.classList.add('roomPanel-open'); _render(); }
function _closePanel() { panelEl.setAttribute('hidden', ''); document.body.classList.remove('roomPanel-open'); }

// ─── Render ───────────────────────────────────────────────────────────────────
function _render() {
  const view = document.getElementById('roomView');
  if (!view) return;
  if (Room.isActive()) _renderRoom(view);
  else _renderLobby(view);
}

function _renderLobby(view) {
  view.innerHTML = `
    <div class="roomHead">
      <div class="roomHead__icon">🎮</div>
      <div class="roomHead__title">Jogar Online</div>
      <div class="roomHead__sub">Crie uma sala e convide a galera — todos jogam juntos, cada um no seu celular.</div>
    </div>
    <div id="roomMsg" class="authError" hidden></div>
    <button id="roomCreateBtn" class="btn btn--big" type="button" style="width:100%">✨ Criar sala</button>
    <div class="authDivider"><span>ou entre numa sala</span></div>
    <div class="roomJoinRow">
      <input id="roomCodeInput" class="input roomCodeInput" type="text" maxlength="4" placeholder="CÓDIGO" inputmode="latin" autocapitalize="characters" />
      <button id="roomJoinBtn" class="btn" type="button">Entrar</button>
    </div>`;

  view.querySelector('#roomCreateBtn').addEventListener('click', _doCreate);
  const input = view.querySelector('#roomCodeInput');
  input.addEventListener('input', () => { input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') _doJoin(input.value); });
  view.querySelector('#roomJoinBtn').addEventListener('click', () => _doJoin(input.value));
}

function _renderRoom(view) {
  const isHost = Room.isHost();
  const code = Room.getCode();
  const link = Room.getInviteLink();
  view.innerHTML = `
    <div class="roomTop">
      <div>
        <div class="roomTop__label">Código da sala</div>
        <div class="roomCode" id="roomCodeBig">${esc(code)}</div>
      </div>
      <button id="roomLeaveBtn" class="btn btn--ghost btn--sm" type="button">${isHost ? 'Encerrar' : 'Sair'}</button>
    </div>

    <div class="roomInvite">
      <input class="input roomInvite__link" id="roomLink" value="${esc(link)}" readonly />
      <button id="roomCopyBtn" class="btn btn--soft btn--sm" type="button">📋 Copiar</button>
      <button id="roomShareBtn" class="btn btn--soft btn--sm" type="button">📤 Convidar</button>
    </div>

    <div class="roomSection__title">Jogadores na sala (<span id="roomCount">0</span>)</div>
    <div id="roomMembers" class="roomMembers"></div>

    ${isHost ? `
      <div class="roomSection__title">Escolha um jogo para todos</div>
      <div id="roomGamePicker" class="roomGamePicker"></div>
    ` : `
      <div class="roomWaiting" id="roomWaiting">⏳ Aguardando o host iniciar a partida…</div>
    `}

    <div class="roomSection__title">Chat</div>
    <div id="roomChat" class="roomChat"></div>
    <form id="roomChatForm" class="roomChatForm" autocomplete="off">
      <input id="roomChatInput" class="input" type="text" maxlength="280" placeholder="Mensagem para a sala…" />
      <button class="btn" type="submit" aria-label="Enviar">➤</button>
    </form>`;

  membersEl = view.querySelector('#roomMembers');
  chatBody = view.querySelector('#roomChat');
  _renderMembers(Room.getMembers());

  // Expulsar jogador (host): 1º clique pede confirmação, 2º confirma.
  membersEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-kick]');
    if (!btn || !Room.isHost()) return;
    const id = btn.dataset.kick;
    const member = Room.getMembers().find(x => x.id === id);
    if (btn.dataset.confirm === '1') {
      Room.kick(id);
      _toast(`${member?.name || 'Jogador'} foi removido da sala.`);
      window.DivertexSFX?.click?.();
    } else {
      btn.dataset.confirm = '1';
      btn.textContent = 'Remover?';
      btn.classList.add('roomMember__kick--confirm');
      setTimeout(() => { if (btn.isConnected) { btn.dataset.confirm = ''; btn.textContent = '✕'; btn.classList.remove('roomMember__kick--confirm'); } }, 3000);
    }
  });

  view.querySelector('#roomLeaveBtn').addEventListener('click', async () => {
    window.DivertexSFX?.leave();
    await Room.leave();
    _render();
  });
  view.querySelector('#roomCopyBtn').addEventListener('click', () => _copy(link));
  view.querySelector('#roomShareBtn').addEventListener('click', () => _share(code, link));

  if (isHost) {
    const picker = view.querySelector('#roomGamePicker');
    picker.innerHTML = GAMES.map(g =>
      `<button class="roomGameBtn" data-game="${g.key}" type="button"><span>${g.icon}</span>${esc(g.name)}</button>`
    ).join('');
    picker.querySelectorAll('.roomGameBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.DivertexSFX?.start();
        Room.startGame(btn.dataset.game);
      });
    });
  }

  const form = view.querySelector('#roomChatForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = view.querySelector('#roomChatInput');
    const text = input.value.trim();
    if (!text) return;
    Room.sendChat(text);
    input.value = '';
  });
}

function _renderMembers(list) {
  if (!membersEl) return;
  const countEl = document.getElementById('roomCount');
  if (countEl) countEl.textContent = list.length;
  const iAmHost = Room.isHost();
  membersEl.innerHTML = list.map(m => {
    const av = m.avatar ? `<img src="${esc(m.avatar)}" alt="" class="roomMember__av">`
                        : `<span class="roomMember__avFallback">${esc((m.name || 'J')[0].toUpperCase())}</span>`;
    const mine = window.DivertexUser && m.id === window.DivertexUser.id;
    // Só o host vê o botão de remover, e nunca em si mesmo nem em outro host.
    const kick = (iAmHost && !m.isHost && !mine)
      ? `<button class="roomMember__kick" data-kick="${esc(m.id)}" type="button" title="Remover da sala" aria-label="Remover ${esc(m.name)}">✕</button>`
      : '';
    return `<div class="roomMember">${av}<span class="roomMember__name">${esc(m.name)}${mine ? ' (você)' : ''}</span>${m.isHost ? '<span class="roomMember__host">host</span>' : ''}${kick}</div>`;
  }).join('') || '<div class="roomMember roomMember--empty">Ninguém ainda…</div>';
}

function _addChat({ name, text, from }) {
  if (!chatBody) return;
  const mine = window.DivertexUser && from === window.DivertexUser.id;
  const el = document.createElement('div');
  el.className = 'roomChat__msg' + (mine ? ' roomChat__msg--mine' : '');
  el.innerHTML = `<span class="roomChat__from">${esc(mine ? 'Você' : name)}</span><span class="roomChat__text">${esc(text)}</span>`;
  chatBody.appendChild(el);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// ─── Ações ────────────────────────────────────────────────────────────────────
async function _doCreate() {
  const btn = document.getElementById('roomCreateBtn');
  const msg = document.getElementById('roomMsg');
  if (btn) { btn.disabled = true; btn.textContent = 'Criando…'; }
  try {
    await Room.createRoom();
    window.DivertexSFX?.success();
    _render();
  } catch (e) {
    _showMsg(msg, e.message || 'Erro ao criar sala.');
    if (btn) { btn.disabled = false; btn.textContent = '✨ Criar sala'; }
  }
}

async function _doJoin(code) {
  const msg = document.getElementById('roomMsg');
  const btn = document.getElementById('roomJoinBtn');
  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  try {
    await Room.joinRoom(code);
    window.DivertexSFX?.success();
    _render();
    // Se a sala já está num jogo, entra direto.
    if (Room.getGame()) _navigateToGame(Room.getGame());
  } catch (e) {
    _showMsg(msg, e.message || 'Não foi possível entrar.');
    if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
  }
}

function _wireRoomEvents() {
  Room.on('members', (e) => {
    _renderMembers(e.detail);
    const badge = document.getElementById('roomFabBadge');
    if (badge) {
      const n = e.detail.length;
      badge.textContent = n;
      badge.toggleAttribute('hidden', !Room.isActive() || n <= 1);
    }
  });
  Room.on('chat', (e) => { _addChat(e.detail); if (!(window.DivertexUser && e.detail.from === window.DivertexUser.id)) window.DivertexSFX?.message(); });
  Room.on('game', (e) => { _navigateToGame(e.detail.game, e.detail.roster); });
  Room.on('kicked', (e) => _handleKicked(e.detail || {}));
  Room.on('closed', () => {
    _toast('A sala foi encerrada pelo host.');
    window.DivertexSFX?.error();
    _render();
  });
  Room.on('status', () => {
    const fab = document.getElementById('roomFab');
    if (fab) fab.classList.toggle('roomFab--active', Room.isActive());
  });
}

// Abre o jogo escolhido e injeta o elenco da sala nos jogos com lista de jogadores.
function _navigateToGame(gameKey, roster) {
  _closePanel();
  const btnId = GAME_OPEN_BTN[gameKey];
  const btn = btnId && document.getElementById(btnId);
  if (btn) btn.click();
  const names = (roster && roster.length ? roster : Room.getPlayers()).filter(Boolean);
  // pequena espera para a tela do jogo montar antes de injetar
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('divertex:roster', { detail: { game: gameKey, players: names } }));
  }, 120);
}

// Jogador expulso: valida que veio do host, sai da sala, volta ao menu e avisa.
function _handleKicked({ id, by }) {
  const host = Room.getMembers().find(m => m.isHost);
  if (by && host && by !== host.id) return; // só o host pode expulsar
  if (!window.DivertexUser || id !== window.DivertexUser.id) return; // não fui eu
  try { Room.leave(); } catch { /* noop */ }
  _closePanel();
  _exitToMenu();
  _notifyKicked();
}

function _exitToMenu() {
  document.body.classList.remove('room-spectator');
  document.getElementById('roomSpectatorBar')?.setAttribute('hidden', '');
  window.DivertexSelfSync?.delete?.('screenLikely');
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('screen--active'));
  document.getElementById('screenMenu')?.classList.add('screen--active');
}

function _notifyKicked() {
  document.getElementById('kickNotice')?.remove();
  const m = document.createElement('div');
  m.id = 'kickNotice';
  m.className = 'modal';
  m.setAttribute('role', 'dialog');
  m.setAttribute('aria-modal', 'true');
  m.innerHTML = `
    <div class="modal__box" style="text-align:center">
      <div style="font-size:42px;line-height:1">🚪</div>
      <div class="modal__title">Removido da sala</div>
      <p style="margin:8px 0 18px;opacity:.85">Você foi removido da sala pelo host.</p>
      <button id="kickOkBtn" class="btn btn--big" type="button" style="width:100%">Entendi</button>
    </div>`;
  document.body.appendChild(m);
  const close = () => m.remove();
  m.querySelector('#kickOkBtn')?.addEventListener('click', close);
  m.addEventListener('click', e => { if (e.target === m) close(); });
  window.DivertexSFX?.error?.();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function _copy(text) {
  try { await navigator.clipboard.writeText(text); _toast('Link copiado!'); window.DivertexSFX?.pop(); }
  catch { _toast('Copie o link manualmente.'); }
}
async function _share(code, link) {
  const data = { title: 'Divertex', text: `Entra na minha sala do Divertex! Código ${code}`, url: link };
  if (navigator.share) { try { await navigator.share(data); return; } catch { /* cancelado */ } }
  _copy(link);
}
function _showMsg(el, text) { if (!el) return; el.textContent = text; el.hidden = false; el.className = 'authError authError--error'; window.DivertexSFX?.error(); }
function _toast(text) {
  const c = document.getElementById('toastContainer');
  if (!c) { return; }
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  c.appendChild(t);
  setTimeout(() => t.classList.add('toast--show'), 10);
  setTimeout(() => { t.classList.remove('toast--show'); setTimeout(() => t.remove(), 300); }, 2600);
}

export default { initRoomUI };
