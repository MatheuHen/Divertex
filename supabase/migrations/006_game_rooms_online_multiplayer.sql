-- Migration 006: Salas online (multiplayer em tempo real)
-- Realtime (presence/broadcast) cuida do estado ao vivo; esta tabela valida o
-- código ao entrar e persiste host + jogo atual entre refreshes.

create table if not exists public.game_rooms (
  code        text        primary key,
  host_id     uuid        not null references public.profiles(id) on delete cascade,
  host_name   text        not null default 'Host',
  game        text,
  status      text        not null default 'lobby' check (status in ('lobby','playing','closed')),
  roster      jsonb       not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.game_rooms is 'Salas de jogo online. Estado ao vivo via Realtime; tabela valida código e persiste host/jogo.';

alter table public.game_rooms enable row level security;

-- Qualquer usuário autenticado pode LER uma sala (necessário para entrar pelo código)
drop policy if exists rooms_read_auth on public.game_rooms;
create policy rooms_read_auth   on public.game_rooms for select to authenticated using (true);

-- Apenas o host cria/atualiza/fecha a própria sala
drop policy if exists rooms_insert_host on public.game_rooms;
create policy rooms_insert_host on public.game_rooms for insert to authenticated with check (auth.uid() = host_id);

drop policy if exists rooms_update_host on public.game_rooms;
create policy rooms_update_host on public.game_rooms for update to authenticated using (auth.uid() = host_id) with check (auth.uid() = host_id);

drop policy if exists rooms_delete_host on public.game_rooms;
create policy rooms_delete_host on public.game_rooms for delete to authenticated using (auth.uid() = host_id);

create index if not exists idx_game_rooms_created on public.game_rooms(created_at desc);

-- Limpeza: remove salas com mais de 12h (chamável via cron/manual; idempotente)
create or replace function public.cleanup_stale_rooms()
returns void language sql security invoker set search_path = public as $$
  delete from public.game_rooms where updated_at < now() - interval '12 hours';
$$;
