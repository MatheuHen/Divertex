# CLAUDE_PROGRESS.md

## Projeto: Divertex — Roleta de Vidas

### Status: BUILD VALIDADO — pronto para deploy

---

## Estado atual (2026-05-28)

- Build `npm run build` passou: ✅ 0 erros, 0 warnings, 773ms
- `dist/` gerado com todos os assets (HTML + JS + CSS bundlados)
- Vite atualizado para v6.4.2 (corrigiu vulnerabilidade esbuild)
- Supabase: estrutura local 100% pronta, sem remote tocado
- Vercel: `vercel.json` configurado, aguardando apenas variáveis e deploy real

---

## Etapas do jogo: todas concluídas ✅

Prompts 1–17 implementados (Supabase e Deploy incluídos localmente).
Etapas 15 e 16 pendentes apenas na parte remota (requerem autorização).

---

## Supabase — local ✅ / remoto ⏳

### O que está pronto
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

### Pendente (requer sua autorização)
1. Criar projeto no Supabase (supabase.com, free tier)
2. Rodar migration: Dashboard > SQL Editor > colar `001_schema.sql`
3. Ativar Google OAuth em Authentication > Providers (opcional)
4. Copiar URL + anon key para `.env.local`

---

## Vercel — config pronta ✅ / deploy real ⏳

### O que está pronto
| Arquivo | Conteúdo |
|---------|----------|
| `vercel.json` | buildCommand: `npm run build`, outputDirectory: `dist` |
| `package.json` | vite@^6.3.5 + @supabase/supabase-js@^2.39.3 |
| `vite.config.js` | root: `.`, outDir: `dist` |
| `.env.example` | Template com placeholders |
| `.gitignore` | Exclui node_modules/, dist/, .env* |
| `dist/` | Build gerado, 0 erros |

### Para fazer o deploy (requer sua autorização)
1. `git init && git add . && git commit -m "Divertex v1"`
2. Subir no GitHub
3. Importar na Vercel (vercel.com/new) — plano Hobby gratuito
4. Em Project Settings > Environment Variables, adicionar:
   - `VITE_SUPABASE_URL` = URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY` = anon key pública
5. Clicar Deploy — sem plano pago, sem billing

---

## Para rodar localmente com Supabase

```bash
cp .env.example .env.local
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm install
npm run dev        # http://localhost:5173
```

Sem Supabase configurado, o jogo funciona normalmente em modo local (auth desativada silenciosamente).

---

## Regras da sessão
- Não tocar em .env real, tokens, chaves, billing, contas, deploy remoto, Supabase remoto, migrations remotas, PATH, hooks globais
- Confirmar antes de --force, reset, clean, delete destrutivo
