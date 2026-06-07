import { getClient } from './supabase-client.js';
import { getSession } from './auth-service.js';

// ---- Enviar solicitação de amizade ----
export async function sendFriendRequest(addresseeId) {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };

  const session = await getSession();
  if (!session) return { error: 'Não autenticado.' };

  const { error } = await sb.from('friendships').insert({
    requester_id: session.user.id,
    addressee_id: addresseeId,
    status: 'pending',
  });

  if (error) {
    if (error.code === '23505') return { error: 'Solicitação já enviada.' };
    return { error: error.message };
  }
  return {};
}

// ---- Responder solicitação ----
export async function respondFriendRequest(friendshipId, accept) {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };

  const session = await getSession();
  if (!session) return { error: 'Não autenticado.' };

  const { error } = await sb
    .from('friendships')
    .update({ status: accept ? 'accepted' : 'declined', updated_at: new Date().toISOString() })
    .eq('id', friendshipId)
    .eq('addressee_id', session.user.id);

  if (error) return { error: error.message };
  return {};
}

// ---- Cancelar/remover amizade ----
export async function removeFriend(friendshipId) {
  const sb = getClient();
  if (!sb) return;

  const session = await getSession();
  if (!session) return;

  await sb
    .from('friendships')
    .delete()
    .eq('id', friendshipId)
    .or(`requester_id.eq.${session.user.id},addressee_id.eq.${session.user.id}`);
}

// ---- Listar amigos aceitos ----
export async function listFriends() {
  const sb = getClient();
  if (!sb) return [];

  const session = await getSession();
  if (!session) return [];

  const userId = session.user.id;

  const { data } = await sb
    .from('friendships')
    .select(`
      id, status, created_at,
      requester:requester_id ( id, display_name, avatar_url ),
      addressee:addressee_id ( id, display_name, avatar_url )
    `)
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  if (!data) return [];

  return data.map(f => ({
    friendshipId: f.id,
    profile: f.requester?.id === userId ? f.addressee : f.requester,
    since: f.created_at,
  }));
}

// ---- Solicitações pendentes recebidas ----
export async function listPendingRequests() {
  const sb = getClient();
  if (!sb) return [];

  const session = await getSession();
  if (!session) return [];

  const { data } = await sb
    .from('friendships')
    .select(`
      id, created_at,
      requester:requester_id ( id, display_name, avatar_url )
    `)
    .eq('addressee_id', session.user.id)
    .eq('status', 'pending');

  return data || [];
}

// ---- Buscar usuário por nome (para enviar solicitação) ----
export async function searchUsers(query) {
  const sb = getClient();
  if (!sb || !query?.trim()) return [];

  const { data } = await sb
    .from('profiles')
    .select('id, display_name, avatar_url')
    .ilike('display_name', `%${query.trim()}%`)
    .limit(10);

  return data || [];
}
