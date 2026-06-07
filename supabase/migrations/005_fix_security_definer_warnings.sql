-- Migration 005: Corrigir warnings SECURITY DEFINER no Supabase Security Advisor
-- Aplicada em: 2026-06-07
--
-- Warnings corrigidos:
--   1. "Signed-In Users Can Execute SECURITY DEFINER" — handle_new_profile()
--   2. "Signed-In Users Can Execute SECURITY DEFINER" — increment_player_stats()
--
-- O que NÃO é alterado:
--   - Nenhuma tabela, índice ou sequence
--   - Nenhum trigger (on_profile_created e on_auth_user_created permanecem ativos)
--   - Nenhuma policy RLS
--   - handle_new_profile continua SECURITY DEFINER (necessário para inserir em
--     player_stats dentro do trigger sem depender das policies do usuário chamador)
--   - Grants de supabase_auth_admin, service_role e postgres preservados

-- ── Fix 1: handle_new_profile() ─────────────────────────────────────────────
-- Problema: 'authenticated' tem EXECUTE nessa função de trigger, permitindo
--   chamada direta via RPC. Desnecessário e sinalizado pelo Security Advisor.
-- Fix: REVOKE EXECUTE de authenticated.
-- Por que é seguro: PostgreSQL não verifica EXECUTE privilege quando um trigger
--   dispara automaticamente — a verificação só ocorre em chamadas diretas.
--   O trigger on_profile_created (AFTER INSERT ON profiles) continua funcionando
--   normalmente. supabase_auth_admin, service_role e postgres mantêm seus grants.
REVOKE EXECUTE ON FUNCTION public.handle_new_profile() FROM authenticated;


-- ── Fix 2: increment_player_stats() ─────────────────────────────────────────
-- Problema: SECURITY DEFINER com EXECUTE para 'authenticated' — a função roda
--   com privilégios do owner (postgres), bypassando RLS. O Advisor classifica
--   isso como risco mesmo com a validação interna auth.uid() presente.
-- Fix: Recriar como SECURITY INVOKER.
--   Com SECURITY INVOKER, a função roda com os privilégios de quem a chama
--   (authenticated). As políticas RLS stats_insert_own e stats_update_own da
--   migration 002 já garantem que o usuário só altera seus próprios dados.
--   A verificação interna auth.uid() IS DISTINCT FROM p_user_id é mantida como
--   segunda linha de defesa. O frontend não precisa de nenhuma alteração.
CREATE OR REPLACE FUNCTION public.increment_player_stats(
  p_user_id        uuid,
  p_games          int  DEFAULT 0,
  p_wins           int  DEFAULT 0,
  p_rounds         int  DEFAULT 0,
  p_lives_lost     int  DEFAULT 0,
  p_streak         int  DEFAULT 0,
  p_score_delta    int  DEFAULT 0
) RETURNS void
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = public
AS $$
BEGIN
  -- Validação explícita: usuário só pode atualizar seus próprios stats.
  -- IS DISTINCT FROM lida corretamente com auth.uid() = NULL (usuário não logado).
  IF (SELECT auth.uid()) IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot modify stats of another user';
  END IF;

  INSERT INTO player_stats (
    user_id, total_games, total_wins, total_rounds,
    total_lives_lost, best_streak, score
  )
  VALUES (
    p_user_id, p_games, p_wins, p_rounds,
    p_lives_lost, p_streak, p_score_delta
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_games      = player_stats.total_games      + excluded.total_games,
    total_wins       = player_stats.total_wins       + excluded.total_wins,
    total_rounds     = player_stats.total_rounds     + excluded.total_rounds,
    total_lives_lost = player_stats.total_lives_lost + excluded.total_lives_lost,
    best_streak      = greatest(player_stats.best_streak, excluded.best_streak),
    score            = player_stats.score            + excluded.score,
    updated_at       = now();
END;
$$;

-- Garantir que authenticated pode chamar a função via RPC (comportamento preservado)
GRANT EXECUTE ON FUNCTION public.increment_player_stats(
  uuid, integer, integer, integer, integer, integer, integer
) TO authenticated;


-- ── Verificação pós-migração ─────────────────────────────────────────────────
-- Execute manualmente para confirmar o estado final:
--
-- SELECT grantee, routine_name, privilege_type
-- FROM information_schema.routine_privileges
-- WHERE routine_schema = 'public'
--   AND routine_name IN ('handle_new_profile', 'increment_player_stats')
-- ORDER BY routine_name, grantee;
--
-- Esperado:
--   handle_new_profile   → postgres, service_role, supabase_auth_admin  (sem authenticated)
--   increment_player_stats → authenticated, postgres
--
-- SELECT proname, prosecdef FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public' AND p.proname IN ('handle_new_profile','increment_player_stats');
--
-- Esperado:
--   handle_new_profile    → prosecdef = true   (SECURITY DEFINER — mantido)
--   increment_player_stats → prosecdef = false  (SECURITY INVOKER — corrigido)
