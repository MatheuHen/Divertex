/**
 * auth-ui.js
 * Renderiza o painel de autenticação e os modais de login/cadastro.
 * Opera via DOM — sem dependência de frameworks.
 */

import { signIn, signUp } from './auth-service.js';

// ---- Renderiza formulário completo no Auth Gate ----
export function renderAuthGate(defaultMode = 'login') {
  const card = document.getElementById('authGateCard');
  if (!card) return;
  _renderGateForm(card, defaultMode);
}

function _renderGateForm(card, mode) {
  const isLogin = mode === 'login';
  card.innerHTML = `
    <div class="authGate__tabs">
      <button class="authGate__tab ${isLogin ? 'authGate__tab--active' : ''}" id="gateTabLogin" type="button">Entrar</button>
      <button class="authGate__tab ${!isLogin ? 'authGate__tab--active' : ''}" id="gateTabSignup" type="button">Criar conta</button>
    </div>
    <div id="gateError" class="authError" hidden></div>
    ${!isLogin ? `
      <label class="field">
        <span class="field__label">Nome de exibição</span>
        <input id="gateName" class="input" type="text" placeholder="Como quer ser chamado?" maxlength="50" autocomplete="name" />
      </label>
    ` : ''}
    <label class="field">
      <span class="field__label">E-mail</span>
      <input id="gateEmail" class="input" type="email" placeholder="seu@email.com" autocomplete="email" />
    </label>
    <label class="field">
      <span class="field__label">Senha</span>
      <input id="gatePassword" class="input" type="password" placeholder="${isLogin ? 'Sua senha' : 'Mínimo 6 caracteres'}" autocomplete="${isLogin ? 'current-password' : 'new-password'}" />
    </label>
    <button id="gateSubmitBtn" class="btn btn--big" type="button" style="width:100%">
      ${isLogin ? 'Entrar' : 'Criar conta'}
    </button>
  `;

  document.getElementById('gateTabLogin')?.addEventListener('click', () => _renderGateForm(card, 'login'));
  document.getElementById('gateTabSignup')?.addEventListener('click', () => _renderGateForm(card, 'signup'));
  document.getElementById('gateSubmitBtn')?.addEventListener('click', () => _handleGateSubmit(mode));

  // Enter key
  card.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') _handleGateSubmit(mode); });
  });

  (document.getElementById(isLogin ? 'gateEmail' : 'gateName'))?.focus();
}

async function _handleGateSubmit(mode) {
  const btn = document.getElementById('gateSubmitBtn');
  const errEl = document.getElementById('gateError');
  const email = document.getElementById('gateEmail')?.value?.trim();
  const password = document.getElementById('gatePassword')?.value;

  if (!email || !password) { _showGateError(errEl, 'Preencha e-mail e senha.'); return; }

  btn.disabled = true;
  btn.textContent = 'Aguarde…';
  if (errEl) errEl.hidden = true;

  let result;
  if (mode === 'login') {
    result = await signIn({ email, password });
  } else {
    const name = document.getElementById('gateName')?.value?.trim();
    if (!name) { _showGateError(errEl, 'Informe seu nome.'); btn.disabled = false; btn.textContent = 'Criar conta'; return; }
    result = await signUp({ email, password, displayName: name });
  }

  if (result?.error) {
    _showGateError(errEl, result.error);
    btn.disabled = false;
    btn.textContent = mode === 'login' ? 'Entrar' : 'Criar conta';
    return;
  }

  if (mode === 'signup') {
    _showGateError(errEl, 'Conta criada! Verifique seu e-mail para ativar.', 'success');
    btn.textContent = 'Verifique seu e-mail';
  }
  // login success: supabase-integration.js vai esconder o gate via onAuthStateChange
}

function _showGateError(el, msg, type = 'error') {
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  el.className = `authError authError--${type}`;
}

// ---- Renderiza painel inicial (deslogado) ----
export function renderAuthPanel(sessionData) {
  const panel = document.getElementById('authPanel');
  if (!panel) return;

  if (!sessionData) {
    panel.innerHTML = `
      <div class="authBar authBar--guest">
        <button id="authOpenLoginBtn" class="btn btn--ghost btn--sm">Entrar</button>
        <button id="authOpenSignupBtn" class="btn btn--soft btn--sm">Criar conta</button>
      </div>
    `;
    document.getElementById('authOpenLoginBtn')?.addEventListener('click', () => showAuthModal('login'));
    document.getElementById('authOpenSignupBtn')?.addEventListener('click', () => showAuthModal('signup'));
  }
}

// ---- Atualiza painel quando logado ----
export function updateAuthPanel(data) {
  const panel = document.getElementById('authPanel');
  if (!panel) return;

  if (!data) {
    renderAuthPanel(null);
    return;
  }

  const { profile } = data;
  const name = profile?.display_name || 'Jogador';
  const avatar = profile?.avatar_url
    ? `<img src="${escHtml(profile.avatar_url)}" alt="avatar" class="authBar__avatar">`
    : `<div class="authBar__avatarFallback">${escHtml(name[0].toUpperCase())}</div>`;

  panel.innerHTML = `
    <div class="authBar authBar--user">
      ${avatar}
      <span class="authBar__name">Olá, ${escHtml(name)}!</span>
      <button id="authSignOutBtn" class="btn btn--ghost btn--sm">Sair</button>
    </div>
  `;
}

// ---- Modal de login/cadastro ----
function showAuthModal(mode) {
  let modal = document.getElementById('authModal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'authModal';
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const isLogin = mode === 'login';

  modal.innerHTML = `
    <div class="modal__box">
      <div class="modal__title">${isLogin ? 'Entrar no Divertex' : 'Criar conta'}</div>

      <div id="authError" class="authError" hidden></div>

      ${!isLogin ? `
        <label class="field">
          <span class="field__label">Nome de exibição</span>
          <input id="authName" class="input" type="text" placeholder="Como quer ser chamado?" maxlength="50" autocomplete="name" />
        </label>
      ` : ''}

      <label class="field">
        <span class="field__label">E-mail</span>
        <input id="authEmail" class="input" type="email" placeholder="seu@email.com" autocomplete="email" />
      </label>

      <label class="field">
        <span class="field__label">Senha</span>
        <input id="authPassword" class="input" type="password" placeholder="${isLogin ? 'Sua senha' : 'Mínimo 6 caracteres'}" autocomplete="${isLogin ? 'current-password' : 'new-password'}" />
      </label>

      <button id="authSubmitBtn" class="btn btn--big" type="button">
        ${isLogin ? 'Entrar' : 'Criar conta'}
      </button>

      <p class="authSwitch">
        ${isLogin
          ? `Não tem conta? <a href="#" id="authSwitchLink">Criar conta</a>`
          : `Já tem conta? <a href="#" id="authSwitchLink">Entrar</a>`}
      </p>

      <button id="authModalClose" class="modal__closeX" type="button" aria-label="Fechar">✕</button>
    </div>
  `;

  document.body.appendChild(modal);

  // Eventos
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.getElementById('authModalClose')?.addEventListener('click', () => modal.remove());
  document.getElementById('authSwitchLink')?.addEventListener('click', e => { e.preventDefault(); modal.remove(); showAuthModal(isLogin ? 'signup' : 'login'); });
  document.getElementById('authSubmitBtn')?.addEventListener('click', () => handleSubmit(mode));

  document.getElementById(isLogin ? 'authEmail' : 'authName')?.focus();
}

async function handleSubmit(mode) {
  const btn = document.getElementById('authSubmitBtn');
  const errEl = document.getElementById('authError');
  const email = document.getElementById('authEmail')?.value?.trim();
  const password = document.getElementById('authPassword')?.value;

  if (!email || !password) {
    showError(errEl, 'Preencha e-mail e senha.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Aguarde...';
  errEl.hidden = true;

  let result;
  if (mode === 'login') {
    result = await signIn({ email, password });
  } else {
    const name = document.getElementById('authName')?.value?.trim();
    if (!name) { showError(errEl, 'Informe seu nome.'); btn.disabled = false; btn.textContent = 'Criar conta'; return; }
    result = await signUp({ email, password, displayName: name });
  }

  if (result?.error) {
    showError(errEl, result.error);
    btn.disabled = false;
    btn.textContent = mode === 'login' ? 'Entrar' : 'Criar conta';
    return;
  }

  if (mode === 'signup') {
    showError(errEl, 'Conta criada! Verifique seu e-mail para ativar.', 'success');
    btn.textContent = 'Verifique seu e-mail';
  } else {
    document.getElementById('authModal')?.remove();
  }
}


function showError(el, msg, type = 'error') {
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  el.className = `authError authError--${type}`;
}

function escHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
