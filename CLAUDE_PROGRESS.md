# CLAUDE_PROGRESS.md — Divertex

**Atualizado em:** 2026-05-29  
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
| Migration 001 | ✅ Aplicada via MCP (2026-05-29) — profiles, player_stats, friendships, game_sessions, session_rounds + VIEW ranking_global |
| GRANTs | ✅ `GRANT SELECT ON ranking_global, profiles, player_stats TO anon, authenticated` — ranking funciona sem login |
| RLS | Ativo em todas as 5 tabelas |
| Confirmação de e-mail | Ativa (usuário precisa clicar no link para logar) |
| Ranking global | ✅ Carrega para todos via VIEW pública LGPD-safe (sem e-mail) |

---

## 5. Status de cada feature de auth

| Feature | Status | Detalhe |
|---------|--------|---------|
| Cadastro e-mail + senha | ✅ Funciona | Supabase envia e-mail de confirmação |
| Login e-mail + senha | ✅ Funciona | Requer e-mail confirmado |
| Perfil pós-login | ✅ Código pronto | authBar mostra nome + botão Sair; criação de perfil via trigger no Supabase |
| Salvar sessão de jogo | ✅ Código pronto | Requer usuário logado |
| Ranking pós-login | ✅ Atualiza automaticamente | |
| Google OAuth | ❌ UI removida | Provider não ativado no Supabase (falta Client ID/Secret do Google Cloud) |
| Amizades (UI) | ❌ Pendente | Backend (`js/friends-service.js`) 100% pronto; falta tela no frontend |
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
| **UI de amizades** | Backend pronto (`js/friends-service.js`); falta tela: buscar usuário, enviar pedido, aceitar, listar amigos |
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

## 9. Próximo passo exato (sugerido)

**Opção A — UI de amizades** (complementa o sistema de ranking):
Criar painel de amigos: buscar por nome, enviar pedido, aceitar/recusar, ver ranking entre amigos. Backend (`js/friends-service.js`) 100% pronto.

**Opção B — Verdade ou Caos** (segundo minigame independente):
Perguntas diretas ao grupo com votação "Verdade" ou "Caos"; quem fugir paga.

**Opção C — Google OAuth** (melhora conversão de cadastro):
Ativar no Google Cloud Console + Supabase Dashboard + reativar botão na `auth-ui.js`.

---

## 9. Regras da sessão (não alterar sem confirmação)

- Nunca commitar `.env` real, tokens, service_role, secrets ou senha
- Nunca mexer em billing, plano pago, PATH global, hooks globais
- Confirmar antes de `--force`, `reset --hard`, `clean`, `delete` destrutivo
- `signInWithGoogle()` mantido em `auth-service.js` para quando Google OAuth for ativado
- Deploy sempre via: `npx vercel --prod` → `npx vercel alias divertex-kappa-tawny.vercel.app divertex-kappa.vercel.app`
