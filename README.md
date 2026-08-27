# NakaTenis

Vitrine de artigos esportivos para **tênis e beach tennis**. O cliente monta o carrinho no site e o pedido é fechado no **WhatsApp** — o site não processa pagamento.

Next.js 16 · TypeScript · Tailwind v4 · Prisma 7 · Auth.js v5 · Zustand

---

## Começar

```bash
npm install
cp .env.example .env      # o padrão já sobe com o catálogo mock
npm run dev
```

Abre em <http://localhost:3000>. Sem banco, sem configuração: `DATA_SOURCE=mock` usa um catálogo em memória com 25 produtos.

Gere um `AUTH_SECRET` real antes de testar login:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

e cole em `AUTH_SECRET` **e** `NEXTAUTH_SECRET` no `.env`.

### Contas de demonstração (só no modo mock)

| E-mail | Senha | Papel |
|---|---|---|
| `admin@nakatenis.com.br` | `admin123` | ADMIN — acessa `/admin` |
| `cliente@nakatenis.com.br` | `cliente123` | USER — tem endereço cadastrado |

---

## Ligar o banco de verdade

1. Crie um Postgres (Neon, Supabase, RDS, ou local).
2. No `.env`:
   ```
   DATA_SOURCE="prisma"
   DATABASE_URL="postgresql://...-pooler.../neondb?sslmode=verify-full&channel_binding=require"
   DIRECT_URL="postgresql://.../neondb?sslmode=verify-full&channel_binding=require"
   ```
   `DIRECT_URL` é a mesma URL **sem** o `-pooler` — é ela que as migrations usam.
3. Rode:
   ```bash
   npm run db:deploy      # aplica a migration inicial já versionada
   npm run db:seed        # popula categorias, produtos e a página institucional
   npm run create-admin   # senha pedida no prompt, sem eco
   npm run db:check       # confere o que entrou
   ```

> Skills de agente para o Neon (opcional, para trabalhar o banco com IA):
> `npx skills add neondatabase/agent-skills -s neon -s neon-postgres -y`

Nenhum componente muda. O contrato dos repositórios (`src/lib/data/types.ts`) é o mesmo dos dois lados — é isso que torna a troca uma variável de ambiente em vez de uma refatoração.

---

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | desenvolvimento |
| `npm run build` | `prisma generate` + build de produção (standalone) |
| `npm run start` | serve o build |
| `npm run check` | ESLint + `tsc --noEmit` |
| `npm run format` | Prettier |
| `npm run db:migrate` | cria e aplica migration em dev |
| `npm run db:deploy` | aplica migrations em produção |
| `npm run db:seed` | popula o banco espelhando o catálogo mock |
| `npm run db:studio` | Prisma Studio |
| `npm run db:check` | sanidade do banco: usuários, categorias e contagens |
| `npm run create-admin` | cria/promove o primeiro administrador |
| `npm run gen:images` | regenera os SVGs de placeholder do catálogo mock |
| `npm run deploy` | sequência completa de deploy na VPS |

---

## Estrutura

```
prisma/            schema, migrations, seed
public/
  brand/           logo, ícone, placeholder
  mock/            ilustrações SVG do catálogo de desenvolvimento
  uploads/         imagens enviadas pelo painel (STORAGE_DRIVER=local)
  llms.txt         descoberta por IAs
scripts/           create-admin, gerador de placeholders
deploy/            nginx.conf e passo a passo da VPS
src/
  app/
    (public)/      home, categoria, produto, carrinho, busca, quem-somos
    (auth)/        entrar, cadastro
    (account)/     conta, endereços
    admin/         painel (dashboard, produtos, categorias, quem-somos)
    api/           auth, upload
    sitemap.ts robots.ts opengraph-image.tsx
  components/
    ui/ layout/ product/ cart/ admin/
  lib/
    data/          contratos + repositórios mock e prisma
    auth/          Auth.js, guards, schemas, hash, rate limit
    storage/       StorageAdapter (local | cloudinary)
    whatsapp/      builder da mensagem de checkout
    seo/           metadata, JSON-LD, FAQ
    pricing.ts     desconto, BRL, parcelamento
  stores/          carrinho (Zustand + persist) e UI
  proxy.ts         guard de rota (o antigo middleware, renomeado no Next 16)
```

---

## Imagens

Produção usa **Cloudinary**, com duas escolhas que valem entender:

1. **O upload vai do browser direto para o Cloudinary.** O servidor só assina (`createUploadTicketAction` → ticket com `public_id` sorteado e assinatura válida para um arquivo). O arquivo nunca passa pela aplicação, o que contorna o limite de body do host e o limite de **1 MB do body de Server Action** do Next — foto de produto estoura os dois, e o erro que aparece é confuso.
2. **O resize e a conversão para WebP/AVIF saem do CDN**, não do nosso servidor. `next.config.ts` usa `images.loader: "custom"` apontando para `src/lib/images/loader.ts`, que injeta `f_auto,q_auto,c_limit,w_<width>` na URL do Cloudinary. Sem isso, `/_next/image` faria o resize na nossa CPU — o oposto do motivo de usar Cloudinary num plano compartilhado.

`publicId` é gravado junto com a `url` no banco: sem ele não dá para apagar o asset quando o produto sai.

Em desenvolvimento, `STORAGE_DRIVER=local` grava em `public/uploads` e o upload volta a passar por `/api/upload` — o servidor responde `mode: "proxy"` e o cliente se adapta sozinho.

---

## Decisões que valem lembrar

- **Dinheiro em centavos (`Int`).** Nunca `Float`. Formatação só por `formatBRL`.
- **Nenhum acesso a Prisma fora de `src/lib/data/prisma/` e `src/lib/auth/`.**
- **Login não é pré-requisito para comprar.** Ele só acrescenta o endereço à mensagem do WhatsApp.
- **`stock` não bloqueia a compra** — o fechamento é humano. Serve para "últimas unidades".
- **Sem `AggregateRating`/`Review` no JSON-LD.** Sem checkout no site não há como sustentar, e marcação falsa é penalizada.
- **Carrinho revalida preço** contra o servidor ao abrir `/carrinho` e avisa o cliente se algo mudou.
- **`wa.me` degrada acima de ~2.000 caracteres** — a mensagem trunca a lista e acrescenta "…e mais N itens".

Detalhes e regras de contribuição em [`CLAUDE.md`](./CLAUDE.md) e nas skills em `.claude/skills/`.

---

## Deploy

VPS Node com PM2 + Nginx. Passo a passo em [`deploy/README.md`](./deploy/README.md).
