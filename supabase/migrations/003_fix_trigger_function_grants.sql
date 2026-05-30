-- Migration 003: Restaurar EXECUTE nas funções de trigger
-- Aplicada em: 2026-05-30
--
-- O REVOKE FROM PUBLIC da migration 002 removeu permissões que
-- supabase_auth_admin precisa para disparar os triggers de auth,
-- quebrando o login com "Database error querying schema".

-- handle_new_user: executado pelo trigger AFTER INSERT ON auth.users (GoTrue)
GRANT EXECUTE ON FUNCTION public.handle_new_user()
  TO supabase_auth_admin, service_role, postgres;

-- handle_new_profile: executado pelo trigger AFTER INSERT ON public.profiles
GRANT EXECUTE ON FUNCTION public.handle_new_profile()
  TO supabase_auth_admin, authenticated, service_role, postgres;

-- rls_auto_enable: event trigger — apenas postgres precisa
GRANT EXECUTE ON FUNCTION public.rls_auto_enable()
  TO postgres;

-- increment_player_stats: confirmar grant para authenticated
GRANT EXECUTE ON FUNCTION public.increment_player_stats(uuid,integer,integer,integer,integer,integer,integer)
  TO authenticated;
