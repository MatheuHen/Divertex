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
    ${isLogin ? `
    <div class="authGate__forgotWrap">
      <a href="#" id="gateForgotLink" class="authGate__forgotBtn">🔑 Esqueci minha senha</a>
    </div>` : ''}
  `;

  document.getElementById('gateTabLogin')?.addEventListener('click', () => _renderGateForm(card, 'login'));
  document.getElementById('gateTabSignup')?.addEventListener('click', () => _renderGateForm(card, 'signup'));
  document.getElementById('gateSubmitBtn')?.addEventListener('click', () => _handleGateSubmit(mode));
  document.getElementById('gateForgotLink')?.addEventListener('click', e => { e.preventDefault(); _showForgotPassword(card); });

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
}

// ---- Tela de recuperação de senha dentro do gate ----
function _showForgotPassword(card) {
  card.innerHTML = `
    <button id="gateBackBtn" class="authGate__backBtn" type="button">← Voltar para o login</button>
    <div class="authGate__recoverHead">
      <div class="authGate__recoverIcon">🔑</div>
      <div class="authGate__recoverTitle">Recuperar senha</div>
      <p class="authGate__recoverDesc">Informe seu e-mail e enviaremos o link para criar uma nova senha.</p>
    </div>
    <div id="gateError" class="authError" hidden></div>
    <label class="field">
      <span class="field__label">E-mail</span>
      <input id="gateEmail" class="input" type="email" placeholder="seu@email.com" autocomplete="email" />
    </label>
    <button id="gateForgotSubmitBtn" class="btn btn--big" type="button" style="width:100%">Enviar link de recuperação</button>
  `;

  document.getElementById('gateBackBtn')?.addEventListener('click', () => _renderGateForm(card, 'login'));

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
      btn.textContent = 'Enviar link de recuperação';
    } else {
      _showGateError(errEl, 'Link enviado! Verifique sua caixa de e-mail.', 'success');
      btn.textContent = '✓ E-mail enviado';
    }
  });

  document.getElementById('gateEmail')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('gateForgotSubmitBtn')?.click();
  });

  document.getElementById('gateEmail')?.focus();
}

// ---- Tela de nova senha dentro do gate (chamada após PASSWORD_RECOVERY) ----
export function renderPasswordResetGate() {
  const gate = document.getElementById('authGate');
  if (gate) gate.removeAttribute('hidden');

  const tagline = document.querySelector('.authGate__tagline');
  if (tagline) tagline.textContent = 'Crie sua nova senha';

  const card = document.getElementById('authGateCard');
  if (!card) return;

  card.innerHTML = `
    <div class="authGate__recoverHead">
      <div class="authGate__recoverIcon">🔐</div>
      <div class="authGate__recoverTitle">Nova senha</div>
      <p class="authGate__recoverDesc">Escolha uma senha segura para sua conta.</p>
    </div>
    <div id="gateError" class="authError" hidden></div>
    <label class="field">
      <span class="field__label">Nova senha</span>
      <input id="gateNewPassword" class="input" type="password" placeholder="Mínimo 6 caracteres" autocomplete="new-password" />
    </label>
    <label class="field">
      <span class="field__label">Confirmar senha</span>
      <input id="gateConfirmPassword" class="input" type="password" placeholder="Repita a senha" autocomplete="new-password" />
    </label>
    <button id="gateResetSubmitBtn" class="btn btn--big" type="button" style="width:100%">Salvar nova senha</button>
  `;

  async function submit() {
    const btn = document.getElementById('gateResetSubmitBtn');
    const errEl = document.getElementById('gateError');
    const newPass = document.getElementById('gateNewPassword')?.value;
    const confirmPass = document.getElementById('gateConfirmPassword')?.value;

    if (!newPass || newPass.length < 6) { _showGateError(errEl, 'A senha deve ter pelo menos 6 caracteres.'); return; }
    if (newPass !== confirmPass) { _showGateError(errEl, 'As senhas não coincidem.'); return; }

    btn.disabled = true;
    btn.textContent = 'Salvando…';
    if (errEl) errEl.hidden = true;

    const result = await updatePassword(newPass);
    if (result?.error) {
      _showGateError(errEl, result.error);
      btn.disabled = false;
      btn.textContent = 'Salvar nova senha';
    } else {
      _showGateError(errEl, 'Senha alterada com sucesso!', 'success');
      btn.textContent = '✓ Senha salva';
      setTimeout(() => {
        if (tagline) tagline.textContent = 'Minigames para todo o grupo';
      }, 2000);
      // gate vai fechar via onAuthStateChange → SIGNED_IN
    }
  }

  document.getElementById('gateResetSubmitBtn')?.addEventListener('click', submit);
  card.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  });

  document.getElementById('gateNewPassword')?.focus();
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

// ---- Modal de login/cadastro (navbar) ----
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

  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.getElementById('authModalClose')?.addEventListener('click', () => modal.remove());
  document.getElementById('authSwitchLink')?.addEventListener('click', e => { e.preventDefault(); modal.remove(); showAuthModal(isLogin ? 'signup' : 'login'); });
  document.getElementById('authSubmitBtn')?.addEventListener('click', () => _handleModalSubmit(mode));
  document.getElementById('authForgotLink')?.addEventListener('click', e => { e.preventDefault(); _showModalForgotPassword(modal); });

  modal.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') _handleModalSubmit(mode); });
  });

  document.getElementById(isLogin ? 'authEmail' : 'authName')?.focus();
}

async function _handleModalSubmit(mode) {
  const btn = document.getElementById('authSubmitBtn');
  const errEl = document.getElementById('authError');
  const email = document.getElementById('authEmail')?.value?.trim();
  const password = document.getElementById('authPassword')?.value;

  if (!email || !password) { showError(errEl, 'Preencha e-mail e senha.'); return; }

  btn.disabled = true;
  btn.textContent = 'Aguarde…';
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

function _showModalForgotPassword(modal) {
  const box = modal.querySelector('.modal__box');
  if (!box) return;

  box.innerHTML = `
    <button id="authModalBackBtn" class="authModal__backBtn" type="button">← Voltar</button>
    <div class="modal__title">Recuperar senha</div>
    <p class="authModal__desc">Informe seu e-mail e enviaremos o link para criar uma nova senha.</p>
    <div id="authError" class="authError" hidden></div>
    <label class="field">
      <span class="field__label">E-mail</span>
      <input id="authEmail" class="input" type="email" placeholder="seu@email.com" autocomplete="email" />
    </label>
    <button id="authForgotSubmitBtn" class="btn btn--big" type="button" style="width:100%">Enviar link de recuperação</button>
    <button id="authModalClose" class="modal__closeX" type="button" aria-label="Fechar">✕</button>
  `;

  modal.querySelector('#authModalClose')?.addEventListener('click', () => modal.remove());
  modal.querySelector('#authModalBackBtn')?.addEventListener('click', () => { modal.remove(); showAuthModal('login'); });

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
      btn.textContent = 'Enviar link de recuperação';
    } else {
      showError(errEl, 'Link enviado! Verifique sua caixa de e-mail.', 'success');
      btn.textContent = '✓ E-mail enviado';
    }
  });

  modal.querySelector('#authEmail')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') modal.querySelector('#authForgotSubmitBtn')?.click();
  });

  modal.querySelector('#authEmail')?.focus();
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
