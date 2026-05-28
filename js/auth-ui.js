/**
 * auth-ui.js
 * Renderiza o painel de autenticação e os modais de login/cadastro.
 * Opera via DOM — sem dependência de frameworks.
 */

import { signIn, signUp, signInWithGoogle } from './auth-service.js';

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
      <span class="authBar__name">${escHtml(name)}</span>
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

      <div class="authDivider">ou</div>

      <button id="authGoogleBtn" class="btn btn--ghost" type="button">
        <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right:6px;vertical-align:middle"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Continuar com Google
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
  document.getElementById('authGoogleBtn')?.addEventListener('click', handleGoogle);
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

async function handleGoogle() {
  const result = await signInWithGoogle();
  if (result?.error) {
    const errEl = document.getElementById('authError');
    if (errEl) showError(errEl, result.error);
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
