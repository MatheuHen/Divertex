import { getClient } from './supabase-client.js';

const AUTH_ERRORS = {
  'Invalid login credentials':                          'E-mail ou senha incorretos.',
  'Email not confirmed':                                'E-mail não confirmado. Verifique sua caixa de entrada.',
  'User already registered':                            'Este e-mail já está cadastrado.',
  'Password should be at least 6 characters':           'A senha deve ter pelo menos 8 caracteres.',
  'Password should be at least 8 characters':           'A senha deve ter pelo menos 8 caracteres.',
  'New password should be different from the old password': 'A nova senha deve ser diferente da atual.',
  'Token has expired or is invalid':                    'Link expirado ou inválido. Solicite um novo.',
  'Email rate limit exceeded':                          'Muitas tentativas. Aguarde antes de tentar novamente.',
  'For security purposes, you can only request this':   'Aguarde alguns segundos antes de tentar novamente.',
  'signup is disabled':                                 'Cadastro desativado no momento.',
  'email address is invalid':                           'E-mail inválido.',
  'Unable to validate email address: invalid format':   'Formato de e-mail inválido.',
  'Anonymous sign-ins are disabled':                    'Login anônimo não permitido.',
  'over_email_send_rate_limit':                         'Muitos e-mails enviados. Aguarde antes de tentar novamente.',
};

function translateError(msg) {
  if (!msg) return 'Ocorreu um erro. Tente novamente.';
  for (const [en, pt] of Object.entries(AUTH_ERRORS)) {
    if (msg.toLowerCase().includes(en.toLowerCase())) return pt;
  }
  return msg;
}

// ---- Cadastro ----
export async function signUp({ email, password, displayName }) {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };

  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: displayName },
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) return { error: translateError(error.message) };

  // Supabase retorna sucesso com identities vazio quando o email já existe (email enumeration protection)
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { error: 'Este e-mail já está cadastrado. Tente fazer login.' };
  }

  return { user: data.user, session: data.session };
}

// ---- Recuperar senha ----
export async function resetPassword({ email }) {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };

  // ?type=recovery marca o retorno como redefinição de senha. No fluxo PKCE o
  // link volta como ?code= (igual a um login normal) — sem esse marcador o app
  // não consegue distinguir recuperação de login e cai direto na home.
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/?type=recovery',
  });

  if (error) return { error: translateError(error.message) };
  return {};
}

// ---- Login com e-mail/senha ----
export async function signIn({ email, password }) {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: translateError(error.message) };
  return { user: data.user, session: data.session };
}

// ---- Login com Google ----
export async function signInWithGoogle() {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };

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
}

// ---- Logout ----
export async function signOut() {
  const sb = getClient();
  if (!sb) return;
  await sb.auth.signOut();
}

// ---- Sessão atual ----
export async function getSession() {
  const sb = getClient();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session;
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

  const session = await getSession();
  if (!session) return { error: 'Não autenticado.' };

  const updates = { display_name: displayName, updated_at: new Date().toISOString() };
  if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

  const { error } = await sb
    .from('profiles')
    .update(updates)
    .eq('id', session.user.id);

  if (error) return { error: translateError(error.message) };
  return {};
}

// ---- Upload de avatar (Supabase Storage, bucket 'avatars') ----
export async function uploadAvatar(file) {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };
  if (!file) return { error: 'Nenhum arquivo selecionado.' };
  if (file.size > 2 * 1024 * 1024) return { error: 'Imagem muito grande (máx. 2 MB).' };

  const session = await getSession();
  if (!session) return { error: 'Não autenticado.' };

  const ext = (file.name?.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const path = `${session.user.id}/avatar_${Date.now()}.${ext}`;

  const { error } = await sb.storage.from('avatars').upload(path, file, { upsert: true, cacheControl: '3600' });
  if (error) return { error: translateError(error.message) };

  const { data } = sb.storage.from('avatars').getPublicUrl(path);
  return { url: data.publicUrl };
}

// ---- Atualizar senha (usado após PASSWORD_RECOVERY) ----
export async function updatePassword(newPassword) {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };
  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) return { error: translateError(error.message) };
  return {};
}

// ---- Ouvinte de mudanças na sessão ----
// callback recebe (event, session)
export function onAuthStateChange(callback) {
  const sb = getClient();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange((event, session) => callback(event, session));
  return () => data.subscription.unsubscribe();
}
