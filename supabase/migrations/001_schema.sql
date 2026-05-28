-- ============================================================
-- Divertex — Migration 001: Schema completo
-- LGPD: coleta mínima, finalidade clara, RLS em tudo
-- ============================================================

-- ---- Extensões ----
create extension if not exists "uuid-ossp";

-- ============================================================
-- profiles — estende auth.users
-- ============================================================
create table if not exists profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  display_name  text        not null check (char_length(display_name) between 1 and 50),
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table profiles is 'Perfil público do usuário. Não armazena e-mail (disponível apenas via auth.users).';

alter table profiles enable row level security;

-- Qualquer um pode ver perfis (necessário para ranking e amizades)
create policy "profiles_read_any"   on profiles for select using (true);
-- Somente o dono pode atualizar o próprio perfil
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
-- Inserção só via trigger
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- Trigger: cria perfil automaticamente após cadastro
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- player_stats — estatísticas do jogador
-- ============================================================
create table if not exists player_stats (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references profiles(id) on delete cascade,
  total_games      int         not null default 0,
  total_wins       int         not null default 0,
  total_rounds     int         not null default 0,
  total_lives_lost int         not null default 0,
  best_streak      int         not null default 0,
  score            int         not null default 0,
  updated_at       timestamptz not null default now(),
  constraint player_stats_user_unique unique(user_id)
);

comment on table player_stats is 'Estatísticas de jogo. Expostas publicamente apenas via ranking_global view (sem e-mail).';

alter table player_stats enable row level security;

create policy "stats_read_any"    on player_stats for select using (true);
create policy "stats_write_own"   on player_stats for all    using (auth.uid() = user_id);

-- Trigger: cria stats automaticamente após criar perfil
create or replace function handle_new_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into player_stats (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created on profiles;
create trigger on_profile_created
  after insert on profiles
  for each row execute procedure handle_new_profile();

-- Função para incrementar stats com segurança (chamada pelo front-end via RPC)
create or replace function increment_player_stats(
  p_user_id        uuid,
  p_games          int  default 0,
  p_wins           int  default 0,
  p_rounds         int  default 0,
  p_lives_lost     int  default 0,
  p_streak         int  default 0,
  p_score_delta    int  default 0
) returns void language plpgsql security definer set search_path = public as $$
begin
  -- Apenas o próprio usuário pode incrementar seus stats
  if auth.uid() != p_user_id then raise exception 'Unauthorized'; end if;

  insert into player_stats (user_id, total_games, total_wins, total_rounds, total_lives_lost, best_streak, score)
  values (p_user_id, p_games, p_wins, p_rounds, p_lives_lost, p_streak, p_score_delta)
  on conflict (user_id) do update set
    total_games      = player_stats.total_games      + excluded.total_games,
    total_wins       = player_stats.total_wins       + excluded.total_wins,
    total_rounds     = player_stats.total_rounds     + excluded.total_rounds,
    total_lives_lost = player_stats.total_lives_lost + excluded.total_lives_lost,
    best_streak      = greatest(player_stats.best_streak, excluded.best_streak),
    score            = player_stats.score            + excluded.score,
    updated_at       = now();
end;
$$;

-- ============================================================
-- friendships — sistema de amizades
-- ============================================================
create table if not exists friendships (
  id           uuid        primary key default gen_random_uuid(),
  requester_id uuid        not null references profiles(id) on delete cascade,
  addressee_id uuid        not null references profiles(id) on delete cascade,
  status       text        not null default 'pending'
                           check (status in ('pending','accepted','declined','blocked')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint friendships_pair_unique unique (requester_id, addressee_id),
  constraint friendships_no_self     check  (requester_id != addressee_id)
);

comment on table friendships is 'Solicitações e vínculos de amizade entre usuários.';

alter table friendships enable row level security;

-- Cada usuário só vê suas próprias friendships
create policy "friendships_read_own"    on friendships for select using (auth.uid() in (requester_id, addressee_id));
create policy "friendships_send"        on friendships for insert with check (auth.uid() = requester_id);
create policy "friendships_respond"     on friendships for update using (auth.uid() = addressee_id);
create policy "friendships_cancel"      on friendships for delete using (auth.uid() in (requester_id, addressee_id));

-- ============================================================
-- game_sessions — partidas salvas
-- ============================================================
create table if not exists game_sessions (
  id          uuid        primary key default gen_random_uuid(),
  owner_id    uuid        not null references profiles(id) on delete cascade,
  name        text        not null default 'Partida',
  game_mode   text        not null default 'normal',
  state_json  jsonb       not null default '{}'::jsonb,
  is_finished boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table game_sessions is 'Sessões de jogo salvas. Permite continuar uma partida depois.';

alter table game_sessions enable row level security;

create policy "sessions_all_own" on game_sessions for all using (auth.uid() = owner_id);

-- ============================================================
-- session_rounds — histórico de rodadas por sessão
-- ============================================================
create table if not exists session_rounds (
  id              uuid        primary key default gen_random_uuid(),
  session_id      uuid        not null references game_sessions(id) on delete cascade,
  round_number    int         not null,
  player_name     text,
  outcome         text,
  mode            text,
  challenge       text,
  question        text,
  penalty_applied boolean     not null default false,
  created_at      timestamptz not null default now()
);

comment on table session_rounds is 'Histórico detalhado de cada rodada de uma sessão.';

alter table session_rounds enable row level security;

-- Apenas dono da sessão acessa as rodadas
create policy "rounds_all_via_session" on session_rounds for all using (
  exists (
    select 1 from game_sessions gs
    where gs.id = session_id and gs.owner_id = auth.uid()
  )
);

-- ============================================================
-- ranking_global — VIEW pública LGPD-safe (sem e-mail)
-- ============================================================
create or replace view ranking_global as
  select
    p.id,
    p.display_name,
    p.avatar_url,
    s.total_games,
    s.total_wins,
    s.total_rounds,
    s.score,
    s.best_streak,
    row_number() over (order by s.score desc, s.total_wins desc) as position
  from profiles p
  inner join player_stats s on s.user_id = p.id
  order by s.score desc, s.total_wins desc
  limit 100;

comment on view ranking_global is 'Ranking público (top 100). Não expõe e-mail — apenas display_name, avatar, stats.';

-- ============================================================
-- Índices para performance
-- ============================================================
create index if not exists idx_player_stats_score     on player_stats(score desc);
create index if not exists idx_player_stats_user_id   on player_stats(user_id);
create index if not exists idx_friendships_requester  on friendships(requester_id);
create index if not exists idx_friendships_addressee  on friendships(addressee_id);
create index if not exists idx_sessions_owner         on game_sessions(owner_id, created_at desc);
create index if not exists idx_rounds_session         on session_rounds(session_id, round_number);
