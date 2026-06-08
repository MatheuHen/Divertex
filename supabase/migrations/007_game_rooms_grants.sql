-- Migration 007: Grants da tabela game_rooms
-- Este projeto gerencia grants explicitamente (ver migration 004). A tabela
-- game_rooms precisa de grants para o role authenticated. A RLS (migration 006)
-- continua restringindo o acesso por linha.

grant select, insert, update, delete on public.game_rooms to authenticated;
grant execute on function public.cleanup_stale_rooms() to authenticated;
