# CLAUDE_PROGRESS.md

## Projeto: Divertex — Roleta de Vidas

### Status: PRODUÇÃO ATIVA ✅

---

## Estado atual (2026-05-28)

- Build `npm run build`: ✅ 0 erros, 0 warnings
- Vite v6.4.2
- **Deploy live:** https://divertex-kappa.vercel.app
- **Supabase:** projeto remoto ativo, migration aplicada, env vars configuradas na Vercel
- **Bug corrigido:** `[hidden]{display:none!important}` — overlays bloqueavam cliques

---

## Etapas do jogo: todas concluídas ✅

Prompts 1–17 implementados e em produção.

---

## Supabase — ✅ ATIVO

### Projeto remoto
- **Região:** South America (São Paulo)
- **URL:** `https://kqiucdydlybotnocowdu.supabase.co` (pública)
- **Anon key:** configurada na Vercel como env var (não commitada)
- **Migration 001:** aplicada via SQL Editor

### O que está ativo
| Arquivo | Conteúdo |
|---------|----------|
| `supabase/migrations/001_schema.sql` | 5 tabelas + ranking_global VIEW + RLS + triggers + RPC |
| `js/supabase-client.js` | Cliente com graceful degradation (null se sem config) |
| `js/auth-service.js` | signUp, signIn, Google OAuth, signOut, getProfile, updateProfile |
| `js/game-service.js` | saveSession, loadSession, saveRound, submitGameStats |
| `js/ranking-service.js` | getGlobalRanking, getFriendsRanking, getMyStats |
| `js/friends-service.js` | sendFriendRequest, respondFriendRequest, listFriends, searchUsers |
| `js/supabase-integration.js` | Cola Supabase ao DivertexApp (hooks onRoundComplete, onWinner) |
| `js/auth-ui.js` | Painel login/cadastro/Google, modal de auth |

### Segurança / LGPD
- 5 tabelas com RLS habilitado, 11 policies
- Service role key nunca no front-end
- Ranking expõe somente display_name, avatar, stats (sem e-mail)
- `.env.local` no `.gitignore` — chaves reais nunca commitadas
- Env vars salvas apenas na Vercel (não no repo)

### Pendente (opcional)
- Ativar Google OAuth em Authentication > Providers

---

## Vercel — ✅ ATIVO

### Projeto
- **URL:** https://divertex-kappa.vercel.app
- **GitHub:** https://github.com/MatheuHen/Divertex
- **Plano:** Hobby (gratuito)
- **Auto-deploy:** sim — cada push em `main` dispara redeploy

### Env vars configuradas (via Vercel CLI, não commitadas)
- `VITE_SUPABASE_URL` ✅
- `VITE_SUPABASE_ANON_KEY` ✅

### Arquivos
| Arquivo | Conteúdo |
|---------|----------|
| `vercel.json` | buildCommand: `npm run build`, outputDirectory: `dist` |
| `package.json` | vite@^6.4.2 + @supabase/supabase-js@^2.39.3 |
| `vite.config.js` | root: `.`, outDir: `dist` |
| `.env.example` | Template com placeholders |
| `.gitignore` | Exclui node_modules/, dist/, .env* |

---

## Para rodar localmente com Supabase

```bash
cp .env.example .env.local
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (ver Vercel dashboard)
npm install
npm run dev        # http://localhost:5173
```

Sem Supabase configurado, o jogo funciona normalmente em modo local (auth desativada silenciosamente).

---

## Regras da sessão
- Não tocar em .env real, tokens, chaves, billing, contas, deploy remoto, Supabase remoto, migrations remotas, PATH, hooks globais
- Confirmar antes de --force, reset, clean, delete destrutivo
