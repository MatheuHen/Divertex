/**
 * friends-ui.js — Painel de amizades do Divertex
 * Requer window.DivertexUser exposto pelo supabase-integration.js
 */

import {
  sendFriendRequest,
  respondFriendRequest,
  removeFriend,
  listFriends,
  listPendingRequests,
  searchUsers,
} from './friends-service.js';

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function avatarHtml(profile) {
  if (profile?.avatar_url) {
    return `<img src="${esc(profile.avatar_url)}" class="fi-avatar" alt="${esc((profile.display_name || '?')[0])}" />`;
  }
  const initial = esc((profile?.display_name || '?')[0].toUpperCase());
  return `<div class="fi-avatar fi-avatar--fallback">${initial}</div>`;
}

export function openFriendsPanel() {
  if (!window.DivertexUser) {
    alert('Faça login para ver seus amigos.');
    return;
  }

  document.getElementById('friendsModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'friendsModal';
  modal.className = 'friends-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Painel de amigos');

  modal.innerHTML = `
    <div class="friends-modal__box">
      <div class="friends-modal__header">
        <div class="friends-modal__title">👥 Amigos</div>
        <button class="friends-modal__close" id="friendsModalClose" aria-label="Fechar">✕</button>
      </div>
      <div class="friends-tabs">
        <button class="friends-tab friends-tab--active" data-tab="friends">Amigos</button>
        <button class="friends-tab" data-tab="requests">Pedidos <span id="fiPendingBadge" class="fi-badge" hidden></span></button>
        <button class="friends-tab" data-tab="search">Buscar</button>
      </div>
      <div class="friends-body">
        <div id="fiTabFriends" class="fi-tab-content">
          <div class="fi-loading">Carregando…</div>
        </div>
        <div id="fiTabRequests" class="fi-tab-content" hidden>
          <div class="fi-loading">Carregando…</div>
        </div>
        <div id="fiTabSearch" class="fi-tab-content" hidden>
          <div class="fi-search-row">
            <input id="fiSearchInput" class="input" type="text" placeholder="Buscar por nome…" maxlength="30" />
            <button id="fiSearchBtn" class="btn btn--soft">Buscar</button>
          </div>
          <div id="fiSearchResults" class="fi-list"></div>
        </div>
      </div>
      <div id="fiStatus" class="fi-status" hidden></div>
    </div>
  `;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('friends-modal--open'));

  modal.addEventListener('click', e => { if (e.target === modal) _close(modal); });
  document.getElementById('friendsModalClose').addEventListener('click', () => _close(modal));

  document.addEventListener('keydown', function onEsc(e) {
    if (e.key === 'Escape') { _close(modal); document.removeEventListener('keydown', onEsc); }
  });

  modal.querySelectorAll('.friends-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.friends-tab').forEach(t => t.classList.remove('friends-tab--active'));
      btn.classList.add('friends-tab--active');
      const tabMap = { friends: 'fiTabFriends', requests: 'fiTabRequests', search: 'fiTabSearch' };
      modal.querySelectorAll('.fi-tab-content').forEach(c => c.setAttribute('hidden', ''));
      document.getElementById(tabMap[btn.dataset.tab])?.removeAttribute('hidden');
    });
  });

  const searchBtn = document.getElementById('fiSearchBtn');
  const searchInput = document.getElementById('fiSearchInput');
  searchBtn?.addEventListener('click', _doSearch);
  searchInput?.addEventListener('keydown', e => { if (e.key === 'Enter') _doSearch(); });

  _loadFriends();
  _loadRequests();
}

function _close(modal) {
  modal.classList.remove('friends-modal--open');
  modal.classList.add('friends-modal--closing');
  setTimeout(() => modal.remove(), 220);
}

function _showStatus(msg, type = 'info') {
  const el = document.getElementById('fiStatus');
  if (!el) return;
  el.textContent = msg;
  el.className = `fi-status fi-status--${type}`;
  el.removeAttribute('hidden');
  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => el.setAttribute('hidden', ''), 3000);
}

async function _loadFriends() {
  const container = document.getElementById('fiTabFriends');
  if (!container) return;

  const friends = await listFriends();

  if (!friends.length) {
    container.innerHTML = '<div class="fi-empty">Nenhum amigo ainda.<br>Use "Buscar" para adicionar alguém!</div>';
    return;
  }

  container.innerHTML = friends.map(f => `
    <div class="fi-item" data-fid="${esc(f.friendshipId)}">
      ${avatarHtml(f.profile)}
      <div class="fi-item__info">
        <div class="fi-item__name">${esc(f.profile?.display_name || 'Jogador')}</div>
        <div class="fi-item__since">amigos desde ${new Date(f.since).toLocaleDateString('pt-BR')}</div>
      </div>
      <button class="btn btn--ghost btn--sm fi-remove-btn" data-fid="${esc(f.friendshipId)}">Remover</button>
    </div>
  `).join('');

  container.querySelectorAll('.fi-remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = '…';
      await removeFriend(btn.dataset.fid);
      _showStatus('Amigo removido.', 'info');
      _loadFriends();
    });
  });
}

async function _loadRequests() {
  const container = document.getElementById('fiTabRequests');
  const badge = document.getElementById('fiPendingBadge');
  if (!container) return;

  const requests = await listPendingRequests();

  if (badge) {
    if (requests.length > 0) {
      badge.textContent = requests.length;
      badge.removeAttribute('hidden');
    } else {
      badge.setAttribute('hidden', '');
    }
  }

  if (!requests.length) {
    container.innerHTML = '<div class="fi-empty">Nenhum pedido pendente.</div>';
    return;
  }

  container.innerHTML = requests.map(r => `
    <div class="fi-item" data-rid="${esc(r.id)}">
      ${avatarHtml(r.requester)}
      <div class="fi-item__info">
        <div class="fi-item__name">${esc(r.requester?.display_name || 'Jogador')}</div>
        <div class="fi-item__since">quer ser seu amigo</div>
      </div>
      <div class="fi-item__actions">
        <button class="btn btn--success btn--sm fi-accept-btn" data-rid="${esc(r.id)}">Aceitar</button>
        <button class="btn btn--ghost btn--sm fi-decline-btn" data-rid="${esc(r.id)}">Recusar</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.fi-accept-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = '…';
      const { error } = await respondFriendRequest(btn.dataset.rid, true);
      if (error) { _showStatus(error, 'error'); btn.disabled = false; btn.textContent = 'Aceitar'; return; }
      _showStatus('Amizade aceita! 🎉', 'success');
      _loadRequests();
      _loadFriends();
    });
  });

  container.querySelectorAll('.fi-decline-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = '…';
      await respondFriendRequest(btn.dataset.rid, false);
      _showStatus('Pedido recusado.', 'info');
      _loadRequests();
    });
  });
}

async function _doSearch() {
  const input = document.getElementById('fiSearchInput');
  const results = document.getElementById('fiSearchResults');
  if (!input || !results) return;
  const q = input.value.trim();
  if (!q) return;

  results.innerHTML = '<div class="fi-loading">Buscando…</div>';
  const users = await searchUsers(q);
  const myId = window.DivertexUser?.id;

  const filtered = users.filter(u => u.id !== myId);

  if (!filtered.length) {
    results.innerHTML = '<div class="fi-empty">Nenhum usuário encontrado.</div>';
    return;
  }

  results.innerHTML = filtered.map(u => `
    <div class="fi-item fi-item--appear" data-uid="${esc(u.id)}">
      ${avatarHtml(u)}
      <div class="fi-item__info">
        <div class="fi-item__name">${esc(u.display_name)}</div>
      </div>
      <button class="btn btn--soft btn--sm fi-add-btn" data-uid="${esc(u.id)}">+ Adicionar</button>
    </div>
  `).join('');

  results.querySelectorAll('.fi-add-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Enviando…';
      const { error } = await sendFriendRequest(btn.dataset.uid);
      if (error) {
        _showStatus(error, 'error');
        btn.disabled = false;
        btn.textContent = '+ Adicionar';
      } else {
        btn.textContent = '✓ Enviado';
        btn.classList.add('btn--ghost');
        _showStatus('Solicitação enviada! 🙌', 'success');
      }
    });
  });
}
