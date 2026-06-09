import { getClient } from './supabase-client.js';

const AUTH_ERRORS = {
  'Invalid login credentials':                          'E-mail ou senha incorretos.',
  'Email not confirmed':                                'E-mail não confirmado. Verifique sua caixa de entrada.',
  'User already registered':                            'Este e-mail já está cadastrado.',
  'already registered':                                 'Este e-mail já está cadastrado.',
  'already been registered':                            'Este e-mail já está cadastrado.',
  'Password should be at least 6 characters':           'A senha deve ter pelo menos 8 caracteres.',
  'Password should be at least 8 characters':           'A senha deve ter pelo menos 8 caracteres.',
  'Password should contain':                            'A senha não atende aos requisitos de segurança.',
  'weak password':                                      'Senha muito fraca. Use letras e números.',
  'New password should be different from the old password': 'A nova senha deve ser diferente da atual.',
  'same as the old password':                           'A nova senha deve ser diferente da atual.',
  'Token has expired or is invalid':                    'Link expirado ou inválido. Solicite um novo.',
  'Auth session missing':                               'Sua sessão expirou. Faça login novamente.',
  'session_not_found':                                  'Sua sessão expirou. Faça login novamente.',
  'Email rate limit exceeded':                          'Muitas tentativas. Aguarde antes de tentar novamente.',
  'For security purposes, you can only request this':   'Aguarde alguns segundos antes de tentar novamente.',
  'request this after':                                 'Aguarde alguns segundos antes de tentar novamente.',
  'signup is disabled':                                 'Cadastro desativado no momento.',
  'Signups not allowed':                                'Cadastro desativado no momento.',
  'email address is invalid':                           'E-mail inválido.',
  'Unable to validate email address':                   'Digite um e-mail válido (ex.: nome@email.com).',
  'invalid format':                                     'Digite um e-mail válido (ex.: nome@email.com).',
  'Anonymous sign-ins are disabled':                    'Login anônimo não permitido.',
  'over_email_send_rate_limit':                         'Muitos e-mails enviados. Aguarde antes de tentar novamente.',
  'User not found':                                     'Conta não encontrada.',
  'Database error':                                     'Erro no servidor. Tente novamente em instantes.',
  'permission denied':                                  'Sem permissão para esta ação.',
  'duplicate key':                                      'Esse registro já existe.',
  'Failed to fetch':                                    'Sem conexão. Verifique sua internet e tente novamente.',
  'NetworkError':                                       'Sem conexão. Verifique sua internet e tente novamente.',
  'network request failed':                             'Sem conexão. Verifique sua internet e tente novamente.',
  'timeout':                                            'O servidor demorou a responder. Tente novamente.',
};

function translateError(msg) {
  if (!msg) return 'Ocorreu um erro. Tente novamente.';
  const m = String(msg);
  for (const [en, pt] of Object.entries(AUTH_ERRORS)) {
    if (m.toLowerCase().includes(en.toLowerCase())) return pt;
  }
  // Nunca expõe a mensagem técnica crua ao usuário — registra e mostra algo claro.
  console.warn('[Divertex] erro não mapeado:', m);
  return 'Não foi possível concluir. Verifique os dados e tente novamente.';
}

// Converte qualquer exceção (rede, inesperada) numa mensagem amigável.
function friendlyCatch(e) {
  return { error: translateError(e?.message || e?.error_description || e) };
}

// ─── Validadores client-side (mensagens claras antes de bater no servidor) ───
export function validateEmail(email) {
  const e = String(email || '').trim();
  if (!e) return 'Informe seu e-mail.';
  if (e.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) {
    return 'Digite um e-mail válido (ex.: nome@email.com).';
  }
  return null;
}

export function validatePassword(pw) {
  const p = String(pw || '');
  if (!p) return 'Informe uma senha.';
  if (p.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  if (p.length > 72) return 'A senha é longa demais (máx. 72 caracteres).';
  return null;
}

export function validateName(name) {
  const n = String(name || '').trim();
  if (!n) return 'Informe seu nome.';
  if (n.length < 2) return 'O nome deve ter pelo menos 2 caracteres.';
  if (n.length > 50) return 'O nome é longo demais (máx. 50 caracteres).';
  // Nome só com números/símbolos não é um nome — evita o "erro estranho" do servidor.
  if (!/[\p{L}]/u.test(n)) return 'O nome deve conter letras, não apenas números.';
  return null;
}

// ---- Cadastro ----
export async function signUp({ email, password, displayName }) {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };

  // Validação local: feedback instantâneo e claro antes de chamar o servidor.
  const vEmail = validateEmail(email);
  if (vEmail) return { error: vEmail };
  const vPass = validatePassword(password);
  if (vPass) return { error: vPass };
  const vName = validateName(displayName);
  if (vName) return { error: vName };

  try {
    const { data, error } = await sb.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: displayName.trim() },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) return { error: translateError(error.message) };

    // Supabase retorna sucesso com identities vazio quando o email já existe (email enumeration protection)
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { error: 'Este e-mail já está cadastrado. Tente fazer login.' };
    }

    return { user: data.user, session: data.session };
  } catch (e) {
    return friendlyCatch(e);
  }
}

// ---- Recuperar senha ----
export async function resetPassword({ email }) {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };

  const vEmail = validateEmail(email);
  if (vEmail) return { error: vEmail };

  try {
    // ?type=recovery marca o retorno como redefinição de senha. No fluxo PKCE o
    // link volta como ?code= (igual a um login normal) — sem esse marcador o app
    // não consegue distinguir recuperação de login e cai direto na home.
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/?type=recovery',
    });
    if (error) return { error: translateError(error.message) };
    return {};
  } catch (e) {
    return friendlyCatch(e);
  }
}

// ---- Login com e-mail/senha ----
export async function signIn({ email, password }) {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };

  const vEmail = validateEmail(email);
  if (vEmail) return { error: vEmail };
  if (!password) return { error: 'Informe sua senha.' };

  try {
    const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: translateError(error.message) };
    return { user: data.user, session: data.session };
  } catch (e) {
    return friendlyCatch(e);
  }
}

// ---- Login com Google ----
export async function signInWithGoogle() {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };

  try {
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Sem prompt:'consent' nem access_type:'offline': forçavam a tela de
        // permissões do Google a cada login e pediam um refresh token que o app
        // não usa. Sem eles, quem já autorizou entra direto.
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { error: translateError(error.message) };
    return {};
  } catch (e) {
    return friendlyCatch(e);
  }
}

// ---- Logout ----
export async function signOut() {
  const sb = getClient();
  if (!sb) return;
  try { await sb.auth.signOut(); } catch (e) { console.warn('[Divertex] signOut falhou:', e?.message); }
}

// ---- Sessão atual ----
export async function getSession() {
  const sb = getClient();
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getSession();
    return data.session;
  } catch (e) {
    console.warn('[Divertex] getSession falhou:', e?.message);
    return null;
  }
}

// ---- Perfil do usuário logado ----
export async function getProfile(userId) {
  const sb = getClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from('profiles')
    .select('id, display_name, avatar_url, created_at')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

// ---- Atualizar perfil ----
export async function updateProfile({ displayName, avatarUrl }) {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };

  const vName = validateName(displayName);
  if (vName) return { error: vName };

  const session = await getSession();
  if (!session) return { error: 'Sua sessão expirou. Faça login novamente.' };

  const updates = { display_name: displayName.trim(), updated_at: new Date().toISOString() };
  if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

  try {
    const { error } = await sb
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id);
    if (error) return { error: translateError(error.message) };
    return {};
  } catch (e) {
    return friendlyCatch(e);
  }
}

// ---- Upload de avatar (Supabase Storage, bucket 'avatars') ----
export async function uploadAvatar(file) {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };
  if (!file) return { error: 'Nenhum arquivo selecionado.' };
  if (!/^image\//.test(file.type || '')) return { error: 'Selecione um arquivo de imagem.' };
  if (file.size > 2 * 1024 * 1024) return { error: 'Imagem muito grande (máx. 2 MB).' };

  const session = await getSession();
  if (!session) return { error: 'Sua sessão expirou. Faça login novamente.' };

  const ext = (file.name?.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const path = `${session.user.id}/avatar_${Date.now()}.${ext}`;

  try {
    const { error } = await sb.storage.from('avatars').upload(path, file, { upsert: true, cacheControl: '3600' });
    if (error) return { error: translateError(error.message) };
    const { data } = sb.storage.from('avatars').getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (e) {
    return friendlyCatch(e);
  }
}

// ---- Atualizar senha (usado após PASSWORD_RECOVERY) ----
export async function updatePassword(newPassword) {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };
  const vPass = validatePassword(newPassword);
  if (vPass) return { error: vPass };
  try {
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) return { error: translateError(error.message) };
    return {};
  } catch (e) {
    return friendlyCatch(e);
  }
}

// ---- Ouvinte de mudanças na sessão ----
// callback recebe (event, session)
export function onAuthStateChange(callback) {
  const sb = getClient();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange((event, session) => callback(event, session));
  return () => data.subscription.unsubscribe();
}
