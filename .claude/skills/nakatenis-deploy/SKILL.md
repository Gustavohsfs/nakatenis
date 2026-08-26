---
name: nakatenis-deploy
description: Use ao preparar build, variáveis de ambiente ou publicação do NakaTenis na VPS — carrega o checklist de env vars, build standalone, PM2, Nginx e migration em produção.
---

# Deploy do NakaTenis (VPS Node)

Passo a passo completo em `deploy/README.md`. Esta skill é o checklist.

## Env vars — todas obrigatórias em produção

| Variável | Nota |
|---|---|
| `DATA_SOURCE` | `prisma` em produção |
| `DATABASE_URL` | conexão **pooled** (Neon: host com `-pooler`) |
| `DIRECT_URL` | conexão **direta**, usada pelas migrations |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | mesmo valor; `openssl rand -base64 32` |
| `AUTH_URL` / `NEXTAUTH_URL` | `https://nakatenis.com.br` |
| `AUTH_TRUST_HOST` | `true` (atrás do Nginx) |
| `NEXT_PUBLIC_SITE_URL` | domínio final — **sitemap, canonical e links do WhatsApp dependem disso** |
| `NEXT_PUBLIC_SITE_NAME` | `NakaTenis` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `5517991814042` |
| `STORAGE_DRIVER` | `local` (disco da VPS) ou `cloudinary` |
| `LOCAL_UPLOAD_DIR` | `public/uploads` — precisa ser gravável pelo usuário do PM2 |
| `CLOUDINARY_*` | só se `STORAGE_DRIVER=cloudinary` |

`.env.production` com permissão `600`. **Nunca no Git.**

## Build

`next.config.ts` já tem `output: "standalone"`. `npm run build` roda `prisma generate` antes — sem isso o client não existe (`src/generated/prisma` é gitignored).

## Sequência de deploy

```bash
cd /var/www/nakatenis
git pull
npm ci
npx prisma generate
npx prisma migrate deploy      # NUNCA `migrate dev` em produção
npm run build
pm2 reload ecosystem.config.cjs --update-env
```

Ou `npm run deploy`, que faz exatamente isso.

## Armadilhas conhecidas

- **`output: standalone` não copia `public/` nem `.next/static`.** O `ecosystem.config.cjs` aponta para `.next/standalone/server.js` — copie `public` e `.next/static` para dentro de `.next/standalone` no deploy, ou (mais simples) rode `npm start` como faz o `ecosystem.config.cjs` deste projeto.
- **Uploads locais somem no deploy** se `public/uploads` estiver dentro do diretório versionado e você usar `git clean`. Monte-o como volume/symlink fora do repositório, ou use Cloudinary.
- **`NEXT_PUBLIC_*` é embutido no build.** Mudou o domínio? Rebuild, não basta reiniciar o PM2.
- Fechar a porta 3000 no firewall; só 80/443 abertos.
- `certbot --nginx` para HTTPS + redirect 80→443.

## Primeiro acesso ao painel

```bash
npm run create-admin -- --email=... --name="..." 
```

Pede a senha no prompt, sem eco. **Nunca criar admin no seed.**

## Verificação pós-deploy

1. `https://nakatenis.com.br` responde 200 e o header renderiza sem layout shift.
2. `/sitemap.xml` traz o domínio final (não localhost).
3. Um produto na PDP → "Comprar agora" abre `wa.me` com a mensagem correta.
4. `/admin` responde 404 para usuário comum e abre para o admin.
5. Upload de imagem no painel grava e aparece na vitrine.
