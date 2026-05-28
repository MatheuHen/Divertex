import { getClient } from './supabase-client.js';

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

  if (error) return { error: error.message };
  return { user: data.user, session: data.session };
}

// ---- Login com e-mail/senha ----
export async function signIn({ email, password }) {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { user: data.user, session: data.session };
}

// ---- Login com Google ----
export async function signInWithGoogle() {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };

  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) return { error: error.message };
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

  if (error) return { error: error.message };
  return {};
}

// ---- Ouvinte de mudanças na sessão ----
export function onAuthStateChange(callback) {
  const sb = getClient();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}
