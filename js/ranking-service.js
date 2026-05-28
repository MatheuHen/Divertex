import { getClient } from './supabase-client.js';
import { getSession } from './auth-service.js';

// ---- Top 10 global (LGPD-safe: sem e-mail) ----
export async function getGlobalRanking(limit = 10) {
  const sb = getClient();
  if (!sb) return [];

  const { data } = await sb
    .from('ranking_global')
    .select('position, display_name, avatar_url, score, total_wins, total_games, best_streak')
    .limit(limit);

  return data || [];
}

// ---- Top 10 entre amigos ----
export async function getFriendsRanking(limit = 10) {
  const sb = getClient();
  if (!sb) return [];

  const session = await getSession();
  if (!session) return [];

  const userId = session.user.id;

  // Busca IDs dos amigos aceitos
  const { data: friends } = await sb
    .from('friendships')
    .select('requester_id, addressee_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  if (!friends?.length) return [];

  const friendIds = friends.map(f =>
    f.requester_id === userId ? f.addressee_id : f.requester_id
  );
  friendIds.push(userId);

  const { data } = await sb
    .from('ranking_global')
    .select('position, display_name, avatar_url, score, total_wins, total_games, best_streak')
    .in('id', friendIds)
    .limit(limit);

  return (data || []).sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, position: i + 1 }));
}

// ---- Stats do usuário logado ----
export async function getMyStats() {
  const sb = getClient();
  if (!sb) return null;

  const session = await getSession();
  if (!session) return null;

  const { data } = await sb
    .from('player_stats')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  return data || null;
}
