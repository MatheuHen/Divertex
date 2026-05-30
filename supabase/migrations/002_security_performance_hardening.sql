-- Migration 002: Security & Performance hardening
-- Aplicada em: 2026-05-30

-- ── 1. ranking_global: SECURITY DEFINER → SECURITY INVOKER ──────
-- Ambas as tabelas base têm políticas SELECT com qual=true,
-- portanto SECURITY DEFINER é desnecessário e cria risco.
DROP VIEW IF EXISTS public.ranking_global;

CREATE VIEW public.ranking_global
  WITH (security_invoker = true)
  AS
  SELECT
    p.id,
    p.display_name,
    p.avatar_url,
    s.total_games,
    s.total_wins,
    s.total_rounds,
    s.score,
    s.best_streak,
    row_number() OVER (ORDER BY s.score DESC, s.total_wins DESC) AS "position"
  FROM public.profiles p
  JOIN public.player_stats s ON s.user_id = p.id
  ORDER BY s.score DESC, s.total_wins DESC
  LIMIT 100;

GRANT SELECT ON public.ranking_global TO anon, authenticated;

-- ── 2. Revogar EXECUTE de funções internas/trigger do PUBLIC ────
-- Funções trigger não devem ser expostas via REST API para anon.
REVOKE EXECUTE ON FUNCTION public.handle_new_user()    FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_profile() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()    FROM PUBLIC;

-- increment_player_stats: somente authenticated (já tem check interno,
-- mas defesa em profundidade).
REVOKE EXECUTE ON FUNCTION public.increment_player_stats(uuid,integer,integer,integer,integer,integer,integer) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.increment_player_stats(uuid,integer,integer,integer,integer,integer,integer) TO authenticated;

-- ── 3. RLS performance: auth.uid() → (select auth.uid()) ────────
-- Evita reavaliação por linha em todas as políticas afetadas.

-- profiles
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING ((select auth.uid()) = id);

-- player_stats: separar ALL em políticas distintas para eliminar
-- sobreposição permissiva SELECT (stats_read_any + stats_write_own).
DROP POLICY IF EXISTS stats_write_own ON public.player_stats;

CREATE POLICY stats_insert_own ON public.player_stats
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY stats_update_own ON public.player_stats
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY stats_delete_own ON public.player_stats
  FOR DELETE USING ((select auth.uid()) = user_id);

-- friendships
DROP POLICY IF EXISTS friendships_read_own ON public.friendships;
DROP POLICY IF EXISTS friendships_send     ON public.friendships;
DROP POLICY IF EXISTS friendships_respond  ON public.friendships;
DROP POLICY IF EXISTS friendships_cancel   ON public.friendships;

CREATE POLICY friendships_read_own ON public.friendships
  FOR SELECT USING (
    (select auth.uid()) = requester_id OR (select auth.uid()) = addressee_id
  );

CREATE POLICY friendships_send ON public.friendships
  FOR INSERT WITH CHECK ((select auth.uid()) = requester_id);

CREATE POLICY friendships_respond ON public.friendships
  FOR UPDATE USING ((select auth.uid()) = addressee_id);

CREATE POLICY friendships_cancel ON public.friendships
  FOR DELETE USING (
    (select auth.uid()) = requester_id OR (select auth.uid()) = addressee_id
  );

-- game_sessions
DROP POLICY IF EXISTS sessions_all_own ON public.game_sessions;

CREATE POLICY sessions_all_own ON public.game_sessions
  FOR ALL USING ((select auth.uid()) = owner_id);

-- session_rounds
DROP POLICY IF EXISTS rounds_all_via_session ON public.session_rounds;

CREATE POLICY rounds_all_via_session ON public.session_rounds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.game_sessions gs
      WHERE gs.id = session_rounds.session_id
        AND gs.owner_id = (select auth.uid())
    )
  );
