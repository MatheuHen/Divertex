# CLAUDE_PROGRESS.md

## Projeto: Divertex — Roleta de Vidas

### Status: PRODUÇÃO ATIVA ✅

---

## Estado atual (2026-05-28)

- **Deploy live:** https://divertex-kappa.vercel.app
- **GitHub:** https://github.com/MatheuHen/Divertex
- **Supabase:** projeto ativo em São Paulo, migration aplicada
- **Auth:** e-mail + senha com confirmação de e-mail ativo
- **Google OAuth:** removido da UI por ora (provider não configurado no Supabase)

---

## Bugs corrigidos em produção

| Bug | Causa | Fix |
|-----|-------|-----|
| Clique em "Jogar agora" bloqueado | `.modal{display:flex}` sobrescreve `[hidden]` | `[hidden]{display:none!important}` global |
| Ranking não aparecia para visitantes | `renderGlobalRanking()` só rodava pós-login | Chamada adicionada no `init()` |
| Erros do Supabase em inglês | `error.message` raw do SDK | Mapa de tradução pt-BR em `auth-service.js` |
| Botão Google chamava provider desativado | `signInWithGoogle()` sem Supabase configurado | Botão e handler removidos da UI |

---

## Testes ao vivo (Playwright contra produção)

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Menu inicial | ✅ | Sem erros de console |
| Supabase conectado | ✅ | `GET /rest/v1/ranking_global` dispara no load |
| Ranking global | ✅ | Carrega sem login; mostra "Nenhum dado ainda." (banco vazio) |
| Modal login | ✅ | Sem botão Google, limpo |
| Validação campos vazios | ✅ | "Preencha e-mail e senha." |
| Login credenciais erradas | ✅ | "E-mail ou senha incorretos." (pt-BR) |
| E-mail inválido | ✅ | "Formato de e-mail inválido." |
| Senha curta | ✅ | "A senha deve ter pelo menos 6 caracteres." |
| Cadastro com e-mail real | ✅ | "Conta criada! Verifique seu e-mail para ativar." |
| Fechar modal (X / fora) | ✅ | Modal removido do DOM |
| Salvar partida sem login | ✅ | Alert "Faça login para salvar a partida." |
| 5 temas visuais | ✅ | neon, darklove, caos, casal, minimal |
| 11 modos de jogo | ✅ | normal, tempo, desafio, leve, médio, difícil… |
| Roleta com 4 jogadores | ✅ | Anima, card de resultado correto |
| Mobile 390px | ✅ | Layout responsivo |
| Perfil pós-login | ⚠️ | Requer conta confirmada; código pronto |
| Amizades | ⚠️ | Serviço pronto (`js/friends-service.js`), sem UI frontend ainda |
| Salvamento de sessão (logado) | ⚠️ | Requer conta confirmada; código pronto |

---

## Supabase — ✅ ATIVO

### Projeto
- **Região:** South America (São Paulo)
- **URL:** `https://kqiucdydlybotnocowdu.supabase.co`
- **Migration 001:** aplicada (5 tabelas + VIEW + RLS + triggers + RPC)
- **Confirmação de e-mail:** ativa (padrão do Supabase free tier)

### Serviços implementados
| Arquivo | Status |
|---------|--------|
| `js/supabase-client.js` | ✅ graceful degradation |
| `js/auth-service.js` | ✅ signUp, signIn, signOut + traduções pt-BR |
| `js/game-service.js` | ✅ saveSession, saveRound, submitGameStats |
| `js/ranking-service.js` | ✅ getGlobalRanking, getFriendsRanking, getMyStats |
| `js/friends-service.js` | ✅ backend pronto, sem UI |
| `js/supabase-integration.js` | ✅ hooks onRoundComplete, onWinner, ranking no init |
| `js/auth-ui.js` | ✅ modal login/cadastro, authBar logado/deslogado |

---

## Vercel — ✅ ATIVO

- **URL:** https://divertex-kappa.vercel.app
- **Plano:** Hobby (gratuito)
- **Env vars:** `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (via Vercel CLI, não commitadas)
- **Auto-deploy:** cada push em `main` — note: usar `vercel --prod && vercel alias divertex-kappa-tawny.vercel.app divertex-kappa.vercel.app` para garantir env vars no bundle

---

## Próximos passos opcionais

1. **UI de amizades** — tela para enviar/aceitar pedidos (backend pronto)
2. **Google OAuth** — configurar Client ID/Secret no Google Cloud + Supabase
3. **Testes pós-confirmação** — login, perfil, salvar sessão com conta real

---

## Regras da sessão
- Não tocar em .env real, tokens, chaves, billing, accounts, PATH, hooks globais
- Confirmar antes de --force, reset, clean, delete destrutivo
- `signInWithGoogle` em `auth-service.js` mantido para uso futuro
