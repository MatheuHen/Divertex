-- Migration 004: Corrigir GRANTs de tabela faltantes
-- Aplicada em: 2026-05-30
--
-- A migration 001 só concedeu SELECT em profiles/player_stats para anon e
-- authenticated. Faltavam os privilégios DML que o RLS precisa para funcionar.
-- Sem o GRANT de tabela, o PostgreSQL rejeita ANTES de checar o RLS,
-- retornando "permission denied for table" (HTTP 403).

-- profiles: INSERT (criar perfil via UI) e UPDATE (editar nome/avatar)
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- player_stats: INSERT/UPDATE/DELETE via RLS write_own
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_stats TO authenticated;

-- friendships: enviar pedido, aceitar, cancelar, listar
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;

-- game_sessions: salvar/carregar sessões próprias
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_sessions TO authenticated;

-- session_rounds: escrever rounds das sessões próprias
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_rounds TO authenticated;

-- anon NÃO recebe DML — apenas leitura pública já configurada
-- (profiles.SELECT e player_stats.SELECT existem da migration 001)
