/**
 * realtime-room.js — Salas online (multiplayer em tempo real) do Divertex.
 *
 * Usa Supabase Realtime:
 *   • presence  → lista de jogadores ao vivo (entra/sai)
 *   • broadcast → chat, navegação de jogo e eventos de partida
 * A tabela public.game_rooms valida o código ao entrar e persiste host/jogo.
 *
 * Exposto como window.DivertexRoom. Um EventTarget interno entrega eventos:
 *   'members' {detail:[{id,name,avatar,isHost}]}
 *   'chat'    {detail:{from,name,text,ts}}
 *   'game'    {detail:{game,by}}
 *   'event'   {detail:{kind,payload,from,name}}   (sincronização genérica de jogo)
 *   'status'  {detail:{active,code,isHost,game}}
 *   'closed'  {detail:{reason}}
 */

import { getClient } from './supabase-client.js';

const bus = new EventTarget();
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0/O/1/I
const CODE_LEN = 4;

const state = {
  active: false,
  code: null,
  isHost: false,
  game: null,
  channel: null,
  members: [],
};

function me() {
  const u = window.DivertexUser;
  return u ? { id: u.id, name: u.name || 'Jogador', avatar: u.avatar || null }
           : { id: 'anon-' + Math.random().toString(36).slice(2, 8), name: 'Jogador', avatar: null };
}

function genCode() {
  let c = '';
  for (let i = 0; i < CODE_LEN; i++) c += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return c;
}

function emit(type, detail) { bus.dispatchEvent(new CustomEvent(type, { detail })); }
function emitStatus() { emit('status', { active: state.active, code: state.code, isHost: state.isHost, game: state.game }); }

function _syncMembers() {
  if (!state.channel) return;
  const presence = state.channel.presenceState();
  const list = [];
  const seen = new Set();
  Object.values(presence).forEach(arr => arr.forEach(m => {
    if (seen.has(m.id)) return;
    seen.add(m.id);
    list.push({ id: m.id, name: m.name, avatar: m.avatar || null, isHost: Boolean(m.isHost) });
  }));
  list.sort((a, b) => (b.isHost - a.isHost) || a.name.localeCompare(b.name));
  state.members = list;
  emit('members', list);
}

async function _subscribe(code, asHost) {
  const sb = getClient();
  if (!sb) throw new Error('Supabase indisponível.');
  const self = me();

  const channel = sb.channel(`divertex:room:${code}`, {
    config: { presence: { key: self.id }, broadcast: { self: false } },
  });

  channel.on('presence', { event: 'sync' }, _syncMembers);
  channel.on('presence', { event: 'join' }, ({ newPresences }) => {
    _syncMembers();
    if (newPresences?.length) window.DivertexSFX?.join();
  });
  channel.on('presence', { event: 'leave' }, () => { _syncMembers(); window.DivertexSFX?.leave(); });

  channel.on('broadcast', { event: 'chat' }, ({ payload }) => emit('chat', payload));
  channel.on('broadcast', { event: 'game' }, ({ payload }) => {
    state.game = payload.game;
    emit('game', payload);
    emitStatus();
  });
  channel.on('broadcast', { event: 'event' }, ({ payload }) => emit('event', payload));
  channel.on('broadcast', { event: 'kick' }, ({ payload }) => emit('kicked', payload || {}));
  channel.on('broadcast', { event: 'closed' }, ({ payload }) => { _teardown(); emit('closed', payload || {}); });

  await new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error('Tempo esgotado ao conectar na sala.')), 9000);
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        clearTimeout(to);
        await channel.track({ id: self.id, name: self.name, avatar: self.avatar, isHost: asHost });
        resolve();
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        clearTimeout(to);
        reject(new Error('Falha ao conectar na sala.'));
      }
    });
  });

  state.channel = channel;
  state.code = code;
  state.isHost = asHost;
  state.active = true;
  _syncMembers();
  emitStatus();
}

function _teardown() {
  if (state.channel) { try { getClient()?.removeChannel(state.channel); } catch { /* noop */ } }
  state.channel = null;
  state.active = false;
  state.code = null;
  state.isHost = false;
  state.game = null;
  state.members = [];
}

const DivertexRoom = {
  on: (type, cb) => { bus.addEventListener(type, cb); return () => bus.removeEventListener(type, cb); },

  isActive: () => state.active,
  isHost: () => state.isHost,
  getCode: () => state.code,
  getGame: () => state.game,
  getMembers: () => state.members.slice(),
  getPlayers: () => state.members.map(m => m.name),
  getInviteLink: () => state.code ? `${location.origin}/?sala=${state.code}` : null,

  async createRoom() {
    if (!window.DivertexUser) throw new Error('Faça login para criar uma sala.');
    const sb = getClient();
    const self = me();
    // Tenta códigos até achar um livre (colisão é raríssima).
    for (let attempt = 0; attempt < 6; attempt++) {
      const code = genCode();
      const { error } = await sb.from('game_rooms').insert({
        code, host_id: self.id, host_name: self.name, status: 'lobby',
      });
      if (!error) { await _subscribe(code, true); return code; }
      if (!/duplicate|already exists|unique/i.test(error.message || '')) throw new Error(error.message);
    }
    throw new Error('Não foi possível gerar um código de sala.');
  },

  async joinRoom(rawCode) {
    if (!window.DivertexUser) throw new Error('Faça login para entrar em uma sala.');
    const code = String(rawCode || '').trim().toUpperCase();
    if (code.length !== CODE_LEN) throw new Error('Código inválido.');
    const sb = getClient();
    const { data, error } = await sb.from('game_rooms').select('code, game, status').eq('code', code).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data || data.status === 'closed') throw new Error('Sala não encontrada ou encerrada.');
    await _subscribe(code, false);
    if (data.game) state.game = data.game;
    return code;
  },

  async leave() {
    const wasHost = state.isHost;
    const code = state.code;
    if (state.channel && wasHost) {
      try { await state.channel.send({ type: 'broadcast', event: 'closed', payload: { reason: 'host' } }); } catch { /* noop */ }
    }
    _teardown();
    if (wasHost && code) {
      try { await getClient().from('game_rooms').delete().eq('code', code); } catch { /* noop */ }
    }
    emitStatus();
  },

  sendChat(text) {
    const t = String(text || '').trim().slice(0, 280);
    if (!t || !state.channel) return;
    const self = me();
    const payload = { from: self.id, name: self.name, text: t, ts: Date.now() };
    state.channel.send({ type: 'broadcast', event: 'chat', payload });
    emit('chat', payload); // eco local (broadcast self:false não retorna)
  },

  async startGame(gameKey) {
    if (!state.isHost || !state.channel) return;
    state.game = gameKey;
    const self = me();
    const payload = { game: gameKey, by: self.name, roster: this.getPlayers() };
    state.channel.send({ type: 'broadcast', event: 'game', payload });
    emit('game', payload); // host também navega
    emitStatus();
    try { await getClient().from('game_rooms').update({ game: gameKey, status: 'playing' }).eq('code', state.code); } catch { /* noop */ }
  },

  // Sincronização genérica de partida (votos, resultados, turnos, etc.).
  syncEvent(kind, payload) {
    if (!state.channel) return;
    const self = me();
    try {
      state.channel.send({ type: 'broadcast', event: 'event', payload: { kind, payload, from: self.id, name: self.name } });
    } catch (e) { console.warn('[Divertex] syncEvent falhou:', e?.message); }
  },

  // Expulsa um jogador (apenas o host). O alvo recebe 'kicked' e sai da sala.
  async kick(memberId) {
    if (!state.isHost || !state.channel || !memberId) return;
    const self = me();
    try {
      await state.channel.send({ type: 'broadcast', event: 'kick', payload: { id: memberId, by: self.id } });
    } catch (e) { console.warn('[Divertex] kick falhou:', e?.message); }
  },
};

window.DivertexRoom = DivertexRoom;
export default DivertexRoom;
