import { getClient } from './supabase-client.js';
import { getSession } from './auth-service.js';

// ---- Salvar/atualizar sessão de jogo ----
export async function saveSession({ sessionId = null, name, gameMode, stateJson, isFinished = false }) {
  const sb = getClient();
  if (!sb) return { error: 'Supabase não configurado.' };

  const session = await getSession();
  if (!session) return { error: 'Não autenticado. Faça login para salvar.' };

  const ownerId = session.user.id;

  try {
    if (sessionId) {
      const { data, error } = await sb
        .from('game_sessions')
        .update({ name, game_mode: gameMode, state_json: stateJson, is_finished: isFinished, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('owner_id', ownerId)
        .select('id')
        .single();
      if (error) return { error: 'Não foi possível salvar a partida.' };
      return { sessionId: data.id };
    }

    const { data, error } = await sb
      .from('game_sessions')
      .insert({ owner_id: ownerId, name: name || 'Partida', game_mode: gameMode || 'normal', state_json: stateJson || {} })
      .select('id')
      .single();

    if (error) return { error: 'Não foi possível salvar a partida.' };
    return { sessionId: data.id };
  } catch (e) {
    console.warn('[Divertex] saveSession falhou:', e?.message);
    return { error: 'Sem conexão. A partida não foi salva.' };
  }
}

// ---- Listar sessões salvas ----
export async function listSessions() {
  const sb = getClient();
  if (!sb) return [];

  const session = await getSession();
  if (!session) return [];

  try {
    const { data } = await sb
      .from('game_sessions')
      .select('id, name, game_mode, is_finished, created_at, updated_at')
      .eq('owner_id', session.user.id)
      .eq('is_finished', false)
      .order('updated_at', { ascending: false })
      .limit(20);
    return data || [];
  } catch (e) {
    console.warn('[Divertex] listSessions falhou:', e?.message);
    return [];
  }
}

// ---- Carregar sessão ----
export async function loadSession(sessionId) {
  const sb = getClient();
  if (!sb) return null;

  const session = await getSession();
  if (!session) return null;

  try {
    const { data, error } = await sb
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('owner_id', session.user.id)
      .single();
    if (error) return null;
    return data;
  } catch (e) {
    console.warn('[Divertex] loadSession falhou:', e?.message);
    return null;
  }
}

// ---- Salvar rodada no histórico ----
export async function saveRound(sessionId, roundData) {
  const sb = getClient();
  if (!sb || !sessionId || !roundData) return;

  try {
    await sb.from('session_rounds').insert({
      session_id:      sessionId,
      round_number:    roundData.round,
      player_name:     roundData.player,
      outcome:         roundData.outcome,
      mode:            roundData.mode,
      challenge:       roundData.challenge,
      question:        roundData.question,
      penalty_applied: Boolean(roundData.penaltyApplied),
    });
  } catch (e) {
    console.warn('[Divertex] saveRound falhou:', e?.message);
  }
}

// ---- Buscar histórico de rodadas ----
export async function getSessionRounds(sessionId) {
  const sb = getClient();
  if (!sb) return [];

  try {
    const { data } = await sb
      .from('session_rounds')
      .select('*')
      .eq('session_id', sessionId)
      .order('round_number');
    return data || [];
  } catch (e) {
    console.warn('[Divertex] getSessionRounds falhou:', e?.message);
    return [];
  }
}

// ---- Atualizar stats ao fim do jogo ----
export async function submitGameStats({ wins, rounds, livesLost, streak, scoreDelta }) {
  const sb = getClient();
  if (!sb) return;

  const session = await getSession();
  if (!session) return;

  try {
    await sb.rpc('increment_player_stats', {
      p_user_id:    session.user.id,
      p_games:      1,
      p_wins:       wins ? 1 : 0,
      p_rounds:     rounds || 0,
      p_lives_lost: livesLost || 0,
      p_streak:     streak || 0,
      p_score_delta: scoreDelta || 0,
    });
  } catch (e) {
    console.warn('[Divertex] submitGameStats falhou:', e?.message);
  }
}
