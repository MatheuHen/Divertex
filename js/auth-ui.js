/**
 * auth-ui.js
 * Renderiza o painel de autenticação e os modais de login/cadastro.
 * Opera via DOM — sem dependência de frameworks.
 */

import { signIn, signUp, resetPassword, updatePassword } from './auth-service.js';

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
    ${isLogin ? `<p class="authSwitch"><a href="#" id="gateForgotLink">Esqueci minha senha</a></p>` : ''}
  `;

  document.getElementById('gateTabLogin')?.addEventListener('click', () => _renderGateForm(card, 'login'));
  document.getElementById('gateTabSignup')?.addEventListener('click', () => _renderGateForm(card, 'signup'));
  document.getElementById('gateSubmitBtn')?.addEventListener('click', () => _handleGateSubmit(mode));
  document.getElementById('gateForgotLink')?.addEventListener('click', e => { e.preventDefault(); _showForgotPassword(card); });

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

function _showForgotPassword(card) {
  card.innerHTML = `
    <div class="authGate__tabs">
      <button class="authGate__tab authGate__tab--active" type="button" disabled>Recuperar senha</button>
    </div>
    <div id="gateError" class="authError" hidden></div>
    <p style="color:var(--color-text-muted);font-size:.875rem;margin-bottom:1rem;">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
    <label class="field">
      <span class="field__label">E-mail</span>
      <input id="gateEmail" class="input" type="email" placeholder="seu@email.com" autocomplete="email" />
    </label>
    <button id="gateForgotSubmitBtn" class="btn btn--big" type="button" style="width:100%">Enviar link</button>
    <p class="authSwitch"><a href="#" id="gateBackToLoginLink">Voltar para o login</a></p>
  `;

  document.getElementById('gateForgotSubmitBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('gateForgotSubmitBtn');
    const errEl = document.getElementById('gateError');
    const email = document.getElementById('gateEmail')?.value?.trim();

    if (!email) { _showGateError(errEl, 'Informe seu e-mail.'); return; }

    btn.disabled = true;
    btn.textContent = 'Enviando…';
    if (errEl) errEl.hidden = true;

    const result = await resetPassword({ email });
    if (result?.error) {
      _showGateError(errEl, result.error);
      btn.disabled = false;
      btn.textContent = 'Enviar link';
    } else {
      _showGateError(errEl, 'Link enviado! Verifique seu e-mail.', 'success');
      btn.textContent = 'E-mail enviado';
    }
  });

  document.getElementById('gateEmail')?.addEventListener('keydown', async e => {
    if (e.key === 'Enter') document.getElementById('gateForgotSubmitBtn')?.click();
  });

  document.getElementById('gateBackToLoginLink')?.addEventListener('click', e => {
    e.preventDefault();
    _renderGateForm(card, 'login');
  });

  document.getElementById('gateEmail')?.focus();
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
      <button id="friendsOpenBtn" class="btn btn--soft btn--sm">👥 Amigos</button>
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

      ${isLogin ? `<p class="authSwitch"><a href="#" id="authForgotLink">Esqueci minha senha</a></p>` : ''}

      <button id="authModalClose" class="modal__closeX" type="button" aria-label="Fechar">✕</button>
    </div>
  `;

  document.body.appendChild(modal);

  // Eventos
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.getElementById('authModalClose')?.addEventListener('click', () => modal.remove());
  document.getElementById('authSwitchLink')?.addEventListener('click', e => { e.preventDefault(); modal.remove(); showAuthModal(isLogin ? 'signup' : 'login'); });
  document.getElementById('authSubmitBtn')?.addEventListener('click', () => handleSubmit(mode));
  document.getElementById('authForgotLink')?.addEventListener('click', e => { e.preventDefault(); _showModalForgotPassword(modal); });

  document.getElementById(isLogin ? 'authEmail' : 'authName')?.focus();
}

function _showModalForgotPassword(modal) {
  const box = modal.querySelector('.modal__box');
  if (!box) return;

  box.innerHTML = `
    <div class="modal__title">Recuperar senha</div>
    <div id="authError" class="authError" hidden></div>
    <p style="color:var(--color-text-muted);font-size:.875rem;margin-bottom:1rem;">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
    <label class="field">
      <span class="field__label">E-mail</span>
      <input id="authEmail" class="input" type="email" placeholder="seu@email.com" autocomplete="email" />
    </label>
    <button id="authForgotSubmitBtn" class="btn btn--big" type="button" style="width:100%">Enviar link</button>
    <p class="authSwitch"><a href="#" id="authBackToLoginLink">Voltar para o login</a></p>
    <button id="authModalClose" class="modal__closeX" type="button" aria-label="Fechar">✕</button>
  `;

  modal.querySelector('#authModalClose')?.addEventListener('click', () => modal.remove());
  modal.querySelector('#authBackToLoginLink')?.addEventListener('click', e => { e.preventDefault(); modal.remove(); showAuthModal('login'); });

  modal.querySelector('#authForgotSubmitBtn')?.addEventListener('click', async () => {
    const btn = modal.querySelector('#authForgotSubmitBtn');
    const errEl = modal.querySelector('#authError');
    const email = modal.querySelector('#authEmail')?.value?.trim();

    if (!email) { showError(errEl, 'Informe seu e-mail.'); return; }

    btn.disabled = true;
    btn.textContent = 'Enviando…';
    errEl.hidden = true;

    const result = await resetPassword({ email });
    if (result?.error) {
      showError(errEl, result.error);
      btn.disabled = false;
      btn.textContent = 'Enviar link';
    } else {
      showError(errEl, 'Link enviado! Verifique seu e-mail.', 'success');
      btn.textContent = 'E-mail enviado';
    }
  });

  modal.querySelector('#authEmail')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') modal.querySelector('#authForgotSubmitBtn')?.click();
  });

  modal.querySelector('#authEmail')?.focus();
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

// ---- Modal de redefinição de senha (após clicar no link do e-mail) ----
export function showPasswordResetModal() {
  let modal = document.getElementById('authModal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'authModal';
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  modal.innerHTML = `
    <div class="modal__box">
      <div class="modal__title">Criar nova senha</div>
      <div id="authError" class="authError" hidden></div>
      <label class="field">
        <span class="field__label">Nova senha</span>
        <input id="authNewPassword" class="input" type="password" placeholder="Mínimo 6 caracteres" autocomplete="new-password" />
      </label>
      <label class="field">
        <span class="field__label">Confirmar nova senha</span>
        <input id="authConfirmPassword" class="input" type="password" placeholder="Repita a senha" autocomplete="new-password" />
      </label>
      <button id="authResetSubmitBtn" class="btn btn--big" type="button" style="width:100%">Salvar nova senha</button>
    </div>
  `;

  document.body.appendChild(modal);

  async function submit() {
    const btn = modal.querySelector('#authResetSubmitBtn');
    const errEl = modal.querySelector('#authError');
    const newPass = modal.querySelector('#authNewPassword')?.value;
    const confirmPass = modal.querySelector('#authConfirmPassword')?.value;

    if (!newPass || newPass.length < 6) { showError(errEl, 'A senha deve ter pelo menos 6 caracteres.'); return; }
    if (newPass !== confirmPass) { showError(errEl, 'As senhas não coincidem.'); return; }

    btn.disabled = true;
    btn.textContent = 'Salvando…';
    errEl.hidden = true;

    const result = await updatePassword(newPass);
    if (result?.error) {
      showError(errEl, result.error);
      btn.disabled = false;
      btn.textContent = 'Salvar nova senha';
    } else {
      showError(errEl, 'Senha alterada com sucesso!', 'success');
      btn.textContent = 'Senha salva ✓';
      setTimeout(() => modal.remove(), 2000);
    }
  }

  modal.querySelector('#authResetSubmitBtn')?.addEventListener('click', submit);
  modal.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  });

  modal.querySelector('#authNewPassword')?.focus();
}

function escHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
