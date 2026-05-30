# CLAUDE_PROGRESS.md — Divertex

**Atualizado em:** 2026-05-30  
**Status geral:** PRODUÇÃO ATIVA ✅  
**URL pública:** https://divertex-kappa.vercel.app  
**GitHub:** https://github.com/MatheuHen/Divertex  

---

## 1. Arquivos do projeto e estado atual

| Arquivo | O que faz | Status |
|---------|-----------|--------|
| `index.html` | Markup completo: menu, tela de jogo, modais, todos os cards | ✅ |
| `app.js` | IIFE única com todo o motor do jogo (1 750+ linhas) | ✅ |
| `styles.css` | Temas neon/darklove/caos/casal/minimal, animações, responsivo | ✅ |
| `vite.config.js` | Root `.`, outDir `dist` | ✅ |
| `vercel.json` | buildCommand `npm run build`, outputDirectory `dist`, SPA rewrite | ✅ |
| `package.json` | vite@^6.4.2, @supabase/supabase-js@^2.39.3 | ✅ |
| `.gitignore` | Exclui node_modules/, dist/, .env* | ✅ |
| `.env.example` | Template público com placeholders | ✅ |
| `supabase/migrations/001_schema.sql` | Schema completo: 5 tabelas + VIEW + RLS + triggers + RPC | ✅ |
| `supabase/migrations/002_security_performance_hardening.sql` | View SECURITY INVOKER, REVOKE funções do anon, RLS com (select auth.uid()), split policy ALL | ✅ |
| `supabase/migrations/003_fix_trigger_function_grants.sql` | Restaura EXECUTE para supabase_auth_admin nos triggers (fix login quebrado) | ✅ |
| `supabase/migrations/004_fix_table_grants.sql` | GRANT DML completo para authenticated em todas as tabelas operacionais | ✅ |
| `js/supabase-client.js` | Cria cliente com fallback hardcoded (chave pública anon) | ✅ |
| `js/auth-service.js` | signUp, signIn, signOut, getSession, getProfile, onAuthStateChange + traduções pt-BR | ✅ |
| `js/auth-ui.js` | Modal login/cadastro, authBar logado/deslogado | ✅ |
| `js/game-service.js` | saveSession, loadSession, saveRound, submitGameStats | ✅ |
| `js/ranking-service.js` | getGlobalRanking, getFriendsRanking, getMyStats | ✅ |
| `js/friends-service.js` | sendFriendRequest, respondFriendRequest, listFriends, searchUsers | ✅ |
| `js/supabase-integration.js` | Cola Supabase ao app: ranking no init, hooks onRoundComplete/onWinner | ✅ |

---

## 2. O que está funcionando em produção (verificado com Playwright)

### Menu e navegação
- [x] Menu Divertex abre primeiro — nunca abre login forçado
- [x] 7 cards no menu: 1 principal + 6 modos ativos (zero "Em breve")
- [x] Cada card do menu abre o jogo com o modo pré-definido correto
- [x] Card Proibidona abre modal de confirmação 18+ antes de entrar
- [x] Voltar ao menu não quebra nenhum estado

### Roleta de Vidas — motor do jogo
- [x] 11 modos internos funcionando: Normal, Tempo, Desafio, Leve, Médio, Difícil, Pesadão, Proibidona 18+, Casal, Criativo, Personalizado
- [x] 10 roletas configuráveis: Jogadores, Vidas, Perguntas, Desafios, Tempo, Porcentagem, Número, Penalidade, Bônus, Personalizada
- [x] Giro bloqueia durante animação (sem duplo clique)
- [x] Vida não desconta duas vezes no mesmo giro (spinId guard)
- [x] Encerrar rodada não desconta vida
- [x] Falhou/Pulou aplica penalidade uma única vez
- [x] Eliminado sai da roleta imediatamente
- [x] Vencedor aparece com confete quando resta 1 jogador
- [x] Reset limpa todos os estados
- [x] Cronômetro para ao encerrar turno (Escape ou botão)
- [x] Botões: Cumpriu, Respondeu, Falhou, Pulou, Aplicar penalidade, Encerrar turno, Girar novamente
- [x] Botão "Ver manual" com regras de cada modo
- [x] Resultado da rodada mostra: jogador, modo, pergunta, desafio, tempo, porcentagem, número, penalidade, bônus — sem "Em breve"
- [x] Histórico de rodadas + exportação em .txt

### Banco de conteúdo
- [x] 100+ perguntas por categoria: leve, médio, difícil, pesadão, proibidona (18+), casal, criativo
- [x] 40+ desafios por categoria em todos os modos
- [x] Penalidades e bônus padrão sorteados corretamente
- [x] Personalizado: editor livre com localStorage

### Visual e UX
- [x] 5 temas: Neon Arcade, Dark Love, Caos, Casal, Minimal
- [x] Animação de dano (shake + coração sumindo)
- [x] Confete ao vencer
- [x] Sons opcionais (giro, resultado)
- [x] Responsivo mobile (390px testado)
- [x] `[hidden]{display:none!important}` global — corrige overlay bloqueando cliques

### Supabase e Auth
- [x] Supabase conectado (chave pública hardcoded como fallback — nunca expõe service_role)
- [x] Ranking global carrega sem login (query pública via VIEW)
- [x] Cadastro por e-mail + senha funcionando (envia e-mail de confirmação)
- [x] Erros de auth traduzidos para pt-BR (invalid credentials, email inválido, senha curta etc.)
- [x] Validação de formulário antes de chamar Supabase
- [x] Modal fecha ao clicar fora ou no X
- [x] Salvar partida sem login → alerta explicativo
- [x] RLS em todas as 5 tabelas — sem exposição de dados privados

---

## 3. Deploy — Vercel

| Item | Valor |
|------|-------|
| Plano | Hobby (gratuito) |
| URL canônica | https://divertex-kappa.vercel.app |
| Alias auxiliar | https://divertex-kappa-tawny.vercel.app |
| GitHub repo | https://github.com/MatheuHen/Divertex (branch main) |
| Env vars configuradas | `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (criptografadas na Vercel, não commitadas) |
| Chave no bundle | Fallback hardcoded em `js/supabase-client.js` (chave pública — correto para frontend) |

**Atenção no deploy:** o auto-deploy do GitHub não garante as vars no Vite bundle. Procedimento correto:
```
npx vercel --prod
npx vercel alias divertex-kappa-tawny.vercel.app divertex-kappa.vercel.app
```

---

## 4. Supabase

| Item | Status |
|------|--------|
| Projeto | Ativo (free tier, São Paulo) |
| URL | `https://kqiucdydlybotnocowdu.supabase.co` (pública) |
| Migration 001 | ✅ Aplicada (2026-05-29) — profiles, player_stats, friendships, game_sessions, session_rounds + VIEW ranking_global |
| Migration 002 | ✅ Aplicada (2026-05-30) — segurança e performance (ver seção 12) |
| Migration 003 | ✅ Aplicada (2026-05-30) — fix grants de trigger functions (ver seção 12) |
| Migration 004 | ✅ Aplicada (2026-05-30) — fix GRANTs DML para authenticated (ver seção 12) |
| GRANTs | ✅ authenticated tem SELECT/INSERT/UPDATE/DELETE em todas as tabelas operacionais |
| RLS | ✅ Ativo em todas as 5 tabelas com (select auth.uid()) para performance |
| Confirmação de e-mail | Ativa (usuário precisa clicar no link para logar) |
| Ranking global | ✅ Carrega para todos via VIEW pública LGPD-safe (sem e-mail) |

---

## 5. Status de cada feature de auth

| Feature | Status | Detalhe |
|---------|--------|---------|
| Cadastro e-mail + senha | ✅ Funciona | Supabase envia e-mail de confirmação |
| Login e-mail + senha | ✅ Funciona | Requer e-mail confirmado |
| Perfil pós-login | ✅ Funciona | authBar mostra nome + botão Amigos + botão Sair; perfil exposto via `window.DivertexUser` |
| Salvar sessão de jogo | ✅ Código pronto | Requer usuário logado |
| Ranking pós-login | ✅ Atualiza automaticamente | |
| Profile auto-pull em minigames | ✅ Implementado (2026-05-29) | `window.DivertexUser` exposto globalmente; Quem é Mais Provável auto-adiciona o jogador logado |
| Stats ranking — Quem é Mais Provável | ✅ Implementado (2026-05-29) | `submitGameStats` chamado no `showFinal` com dados reais do jogo |
| Google OAuth | ❌ UI removida | Provider não ativado no Supabase (falta Client ID/Secret do Google Cloud) |
| **Amizades (UI)** | ✅ Implementado (2026-05-29) | Modal com 3 abas: Amigos / Pedidos / Buscar — botão 👥 Amigos aparece na authBar quando logado |
| Edição de perfil | ❌ Pendente | `updateProfile()` existe no service; falta formulário na UI |

---

## 6. Bugs corrigidos em produção

| Bug | Causa raiz | Fix aplicado |
|-----|-----------|--------------|
| Clique em "Jogar agora" bloqueado | `.modal{display:flex}` sobrescreve atributo `hidden` | `[hidden]{display:none!important}` global no CSS |
| VictoryOverlay bloqueava cliques | Mesmo padrão acima | Mesmo fix global |
| Ranking não aparecia sem login | `renderGlobalRanking()` só rodava dentro de `onAuthStateChange` | Chamada adicionada no `init()` |
| "Supabase não configurado" em produção | Vite não recebe vars do Vercel no auto-deploy do GitHub | Fallback hardcoded (chave pública) em `supabase-client.js` |
| Erros do Supabase em inglês | `error.message` raw do SDK | Mapa de tradução pt-BR em `auth-service.js` |
| Google OAuth chamava provider inativo | `signInWithGoogle()` sem provider configurado → erro 400 | Botão removido da UI; função mantida no service |
| "Em breve" aparecia no resultado da rodada | `|| "Em breve"` hardcoded em `renderRoundResult()` | Substituído por `|| "—"` |
| Cards do menu todos bloqueados | `gameCard--locked` + `disabled` em todos | Cards desbloqueados com `data-mode` + handler no `bindEvents()` |

---

## 7. O que falta do escopo do PDF e vamos implementar

O PDF (Divertex_Especificacao_Claude.pdf) listava 8 minigames no menu. Implementamos a Roleta de Vidas completa + 6 variantes dela + "Quem é Mais Provável". Os minigames abaixo ainda não existem:

| Minigame | Mecânica (conforme PDF) | Complexidade | Status |
|----------|------------------------|--------------|--------|
| **Quem é Mais Provável** | Grupo vota em quem é mais provável; mais votado perde vida | Média | ✅ Implementado (2026-05-28) |
| **Sorteador de Letras** | Sorteia N letras; cada jogador fala uma palavra da categoria dentro do timer; falhou = perde vida | Média | ✅ Implementado (2026-05-30) |
| **Sorteador de Números** | Sorteia números em faixa configurável; modos manual/automático/tudo; sem repetição; slot-machine animation | Baixa | ✅ Implementado (2026-05-30) |
| **Sorteador de Nomes** | Roleta canvas com nomes; easeOutCubic spin; remove vencedor ON/OFF; histórico; auto-add usuário logado | Média | ✅ Implementado (2026-05-30) |
| **Verdade ou Caos** | Perguntas diretas, desafios e escolhas perigosas — grupo decide o destino | Média | ❌ Pendente |
| **Cartas do Caos** | Baralho de cartas aleatórias que mudam as regras da partida a cada rodada | Alta | ❌ Pendente |
| **Duelo de Coragem** | Dois jogadores sorteados se enfrentam em desafios 1v1 | Média | ❌ Pendente |
| **Mestre da Rodada** | Um jogador vira "mestre" e cria regras temporárias que os outros devem obedecer | Alta | ❌ Pendente |

### Quem é Mais Provável — detalhes da implementação

| Arquivo | O que faz |
|---------|-----------|
| `js/likely-game.js` | IIFE autônomo: banco de 60+ perguntas, 4 fases (setup/question/reveal/final), votação ao vivo, eliminação por vidas, placar |
| `index.html` | Novo card no menu (`#openLikelyBtn`) + seção `#screenLikely` com 4 fases |
| `styles.css` | ~200 linhas de CSS dedicado (prefixo `lk-`) — temas, animações, responsivo 640px |

**Fluxo do jogo:**
1. Setup: adicionar 2–8 jogadores, definir rodadas (3–20). Cada jogador começa com 3 ❤️.
2. Pergunta: todos votam clicando no nome de quem acham mais provável. Votos aparecem ao vivo.
3. Revelar: animação dramática do mais votado. Perde 1 vida. 0 vidas = eliminado.
4. Após todas as rodadas ou 1 sobrevivente: tela final com placar.

### Outras pendências do escopo

| Item | Situação |
|------|----------|
| **UI de amizades** | ✅ Implementado (2026-05-29) — `js/friends-ui.js` + botão 👥 na authBar |
| **Profile auto-pull** | ✅ Implementado — `window.DivertexUser` + Quem é Mais Provável auto-adiciona usuário logado |
| **Google OAuth** | Falta criar credenciais no Google Cloud Console e ativar provider no Supabase Dashboard |
| **Perfil editável** | `updateProfile()` existe; falta formulário com campo de nome e avatar |
| **Shield/Proteção de jogador** | Coluna `shield` existe no schema Supabase; nunca implementada na lógica do jogo |
| **Salas multijogador** | Tabela `game_rooms` existe no Supabase; sem uso no frontend — permitiria criar salas para amigos entrarem |
| **Roletas personalizadas salvas no Supabase** | Atualmente só salva no localStorage; schema `custom_wheels` existe mas não é usado |

---

## 8. O que foi implementado em 2026-05-29

| Feature | Detalhe |
|---------|---------|
| **Auth-first (login obrigatório)** | `#authGate` overlay `z-index:9900` — aparece antes de qualquer tela; `supabase-integration.js` oculta o gate só após auth |
| **Menu reestruturado** | Removidos 6 cards de dificuldade (eram modos da Roleta, não minigames separados). Ficaram: Roleta de Vidas + Quem é Mais Provável + 3 "Em breve" |
| **Difficulty picker visual** | Substitui o `<select>` por 10 botões pill com ícone. Select fica hidden para estado interno. Modo Tempo revela config de timer |
| **Personalizado como toggle** | Botão toggle (não mais modo isolado). Quando ON: ativa custom editor + mescla perguntas/desafios custom ao modo atual |
| **Mega UI** | Confetti burst + rain (220 partículas, círculos e retângulos), fanfare de vitória (Web Audio), shake no eliminado, animação entrada `victoryOverlay--show`, hover em cards e botões, `authGate` com orbes animados |
| **Sons melhorados** | `playSound("spin")`, `result`, `eliminate`, `win` (fanfare), `click` — todos via Web Audio API sem lib |
| **Banco corrigido** | Migration 001 aplicada via MCP — 5 tabelas + VIEW. GRANT ao anon/authenticated para o ranking carregar sem login |

## 9. Implementado em 2026-05-29 (sessão 2)

| Feature | Detalhe |
|---------|---------|
| **UI de amizades** | `js/friends-ui.js` — modal com 3 abas (Amigos / Pedidos / Buscar). Botão 👥 aparece na authBar quando logado. Usa `friends-service.js` existente |
| **`window.DivertexUser`** | Exposto por `supabase-integration.js` após login: `{ id, name, avatar }`. Lido por todos os minigames |
| **Profile auto-pull** | Quem é Mais Provável auto-adiciona usuário logado; badge "você" na lista |
| **Stats — Quem é Mais Provável** | `submitGameStats` chamado em `showFinal` — wins/rounds/livesLost/score vão pro ranking |
| **Roleta de Recompensas** | Novo checkbox `wheelReward`. Quando ON + "Cumpriu ✓": abre mini wheel canvas com bônus editáveis. "+N vida" aplica vidas automaticamente. Lista salva em localStorage |
| **Toast system** | `toast(msg, type)` — notificações flutuantes (success/error/info). Substitui `alert()` |
| **Badge "Você"** | `renderPlayers()` detecta jogador logado e mostra badge. `addPlayer()` marca `isMe: true` |
| **SPA Hash Routing** | `showScreen()` atualiza URL hash. `popstate` listener: botão Voltar do browser funciona |
| **Remoção textarea brincadeiras** | `#challengesInput`, `updateChallengesBtn`, `shuffleChallengesBtn` removidos do HTML e do `app.js`. Desafios continuam via `CHALLENGES_BY_MODE` interno |
| **Transições de tela** | `screenSlideIn` animation em toda navegação |
| **Event delegation Sair** | `#authSignOutBtn` agora usa delegação — funciona mesmo após re-render da authBar |

---

## 10. Minigames pendentes — PRÓXIMO A IMPLEMENTAR (2026-05-30)

Sessão bateu o limite de tokens antes de concluir. O prompt completo foi escrito mas **não executado**. Retomar na próxima sessão.

### 10.1 Sorteador de Letras (`js/letters-game.js`)

**Conceito:** Sorteia N letras do alfabeto. Cada jogador tem que falar uma palavra/animal/frase com cada letra dentro do tempo. Falhou = perde vida. Último de pé vence.

**Config:**
- Quantidade de letras por rodada (1–10)
- Modo: Sequencial (uma letra por vez com timer) ou Simultâneo (todas de uma vez)
- Tempo por letra (segundos, configurável)
- Categoria: Livre / Palavra / Animal / Frase / Nome de pessoa
- Bônus ao conseguir: ON/OFF
- Sistema de vidas por jogador

**Fluxo:** Setup → Rodada (letras aparecem com animação flip) → Timer countdown → "Conseguiu ✓ / Não conseguiu ✗" → próximo jogador → Final

**Arquivos a criar:**
- `js/letters-game.js` — IIFE com prefixo DOM `lg-`
- Seção `#screenLetters` no `index.html`
- Card no menu com `#openLettersBtn`
- CSS com prefixo `lg-` (animação flip das letras, timer ring, scoreboard)

**Integração:** `window.DivertexUser` auto-add, `submitGameStats` no final

---

### 10.2 Sorteador de Números (`js/numbers-game.js`)

**Conceito:** Sorteia números em qualquer faixa configurável. Para rifas, jogos, loteria.

**Config:**
- Range: min e max (presets: 1–10, 1–100, 1–1.000, 1–10.000, ou customizado)
- Quantidade a sortear (0 = ilimitado)
- Modo: Manual (apertar botão) / Automático (intervalo em segundos) / Tudo de uma vez
- Sem repetição: ON/OFF

**Exibição:** Número grande com animação slot-machine (rolagem rápida que desacelera). Grid de histórico com highlight do último sorteado. Barra de progresso. Botão "Copiar todos".

**Arquivos a criar:**
- `js/numbers-game.js` — IIFE com prefixo DOM `ng-`
- Seção `#screenNumbers` no `index.html`
- Card no menu com `#openNumbersBtn`
- CSS com prefixo `ng-`

---

### 10.3 Sorteador de Nomes (`js/names-wheel.js`)

**Conceito:** Adiciona nomes → gera roleta canvas → sorteia um aleatoriamente. Para rifas, divisão de grupos, decidir quem vai primeiro.

**Config:**
- Adicionar nomes um a um (ou lista separada por vírgula)
- Remover vencedor após sortear: ON/OFF
- Histórico de sorteios

**Exibição:** Wheel canvas igual à Roleta de Vidas (mesmo padrão de `renderWheel()` e `spinOnce()`). Animação easeOutCubic. Overlay com nome vencedor.

**Arquivos a criar:**
- `js/names-wheel.js` — IIFE com prefixo DOM `nw-`
- Seção `#screenNames` no `index.html`
- Card no menu com `#openNamesBtn`
- CSS com prefixo `nw-`

**Integração:** `window.DivertexUser?.name` auto-adicionado na lista ao entrar

---

## 11. Próximo passo exato

**Todos os 3 minigames implementados e banco corrigido.** Próximo: novas features ou melhorias.

---

## 12. Correções do banco — 2026-05-30

Auditoria completa via Supabase MCP + teste Playwright com conta real. Todos os bugs encontrados foram corrigidos e commitados.

### Migration 002 — Segurança e Performance

| Item | Problema | Fix |
|------|----------|-----|
| `ranking_global` view | SECURITY DEFINER desnecessário (ERROR no advisor) | Recriada com `security_invoker = true` |
| `handle_new_user`, `handle_new_profile`, `rls_auto_enable` | Chamáveis por `anon` via `/rest/v1/rpc/` | `REVOKE EXECUTE FROM PUBLIC` |
| `increment_player_stats` | Chamável por `anon` (poderia manipular ranking) | `REVOKE FROM PUBLIC`, `GRANT TO authenticated` |
| 8 políticas RLS com `auth.uid()` | Re-avaliado por linha (lento em escala) | Substituído por `(select auth.uid())` |
| `player_stats` com 2 policies SELECT permissivas | `stats_read_any` + `stats_write_own` (ALL) sobrepostos | Split em `stats_insert_own`, `stats_update_own`, `stats_delete_own` |

### Migration 003 — Fix de trigger functions (login quebrado)

O `REVOKE FROM PUBLIC` da migration 002 removeu EXECUTE de `supabase_auth_admin` nos triggers de auth, quebrando o login com "Database error querying schema".

| Função | Roles que precisam de EXECUTE |
|--------|-------------------------------|
| `handle_new_user` | `supabase_auth_admin`, `service_role`, `postgres` |
| `handle_new_profile` | `supabase_auth_admin`, `authenticated`, `service_role`, `postgres` |
| `rls_auto_enable` | `postgres` |

### Migration 004 — GRANTs DML faltantes (bug pré-existente da migration 001)

A migration 001 só concedeu SELECT em `profiles` e `player_stats`. Sem os GRANTs de tabela, o PostgreSQL rejeita com `permission denied` antes de checar o RLS — causando 403 no salvar sessão, amizades e rounds.

| Tabela | Grants adicionados para `authenticated` |
|--------|----------------------------------------|
| `profiles` | INSERT, UPDATE |
| `player_stats` | INSERT, UPDATE, DELETE |
| `friendships` | SELECT, INSERT, UPDATE, DELETE |
| `game_sessions` | SELECT, INSERT, UPDATE, DELETE |
| `session_rounds` | SELECT, INSERT, UPDATE, DELETE |

### Resultado do teste após correções

13 features testadas com conta real (`teste2@divertex.com`), zero erros de console, sessão salva no banco confirmada via SQL.

### Pendente (requer Dashboard Supabase)

- Ativar proteção HaveIBeenPwned em Auth → Password → Leaked Password Protection

---

## 9. Regras da sessão (não alterar sem confirmação)

- Nunca commitar `.env` real, tokens, service_role, secrets ou senha
- Nunca mexer em billing, plano pago, PATH global, hooks globais
- Confirmar antes de `--force`, `reset --hard`, `clean`, `delete` destrutivo
- `signInWithGoogle()` mantido em `auth-service.js` para quando Google OAuth for ativado
- Deploy sempre via: `npx vercel --prod` → `npx vercel alias divertex-kappa-tawny.vercel.app divertex-kappa.vercel.app`
