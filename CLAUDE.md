@AGENTS.md

# NakaTenis

E-commerce vitrine de artigos esportivos para tênis e beach tennis. **O site não processa pagamento**: o checkout é um handoff para o WhatsApp `+55 17 99181-4042`.

## Stack

- Next.js 16 (App Router, Turbopack) · React 19.2 · TypeScript strict
- Tailwind CSS v4 (tokens em `src/app/globals.css`, sem `tailwind.config`)
- Prisma 7 + PostgreSQL (driver adapter `@prisma/adapter-pg`)
- Auth.js v5 (`next-auth@beta`) — Credentials + JWT
- Zustand + `persist` para o carrinho
- Hospedagem: VPS Node (PM2 + Nginx) — `output: "standalone"`

## Regras duras

1. **Nenhum acesso a Prisma fora de `src/lib/data/prisma/` e `src/lib/auth/`.** Componentes, páginas e Server Actions usam só os repositórios de `src/lib/data`.
2. **Dinheiro sempre em centavos (`Int`).** Nunca `Float`. Formatação só via `formatBRL` (`src/lib/pricing.ts`).
3. **Server Components por padrão.** `"use client"` só onde há interação real.
4. **`pt-BR` em toda a UI, `en` no código** (nomes de variáveis, funções, tipos). Comentários em pt-BR.
5. **Nunca commitar `.env`.** Só `.env.example`.
6. **`stock` não bloqueia a compra.** O fechamento é humano, no WhatsApp. Serve para "últimas unidades" e organização do lojista — não implementar reserva de estoque.
7. **Não bloquear compra atrás de login.** Usuário anônimo navega, monta carrinho e finaliza no WhatsApp. Login é opcional e só acrescenta o endereço à mensagem.
8. **Imagem nunca é processada pelo nosso servidor.** O upload vai do browser direto para o Cloudinary (ticket assinado por `createUploadTicketAction`), e o resize/WebP/AVIF sai do CDN deles via `src/lib/images/loader.ts`. Não reintroduzir `/_next/image` nem processar imagem em Route Handler: o plano tem CPU/RAM compartilhadas.
9. Antes de dar qualquer fase por concluída: `npm run lint && npx tsc --noEmit && npm run build`.

## Tokens de cor (§ design system)

Definidos em `@theme` no `globals.css`. Use as classes utilitárias, nunca hex solto.

| Token | Uso |
|---|---|
| `brand-900` / `brand-950` | header, footer, faixa institucional |
| `brand-800` / `brand-700` | sidebar, hover de nav, estado ativo |
| `brand-500` | botões primários, links |
| `brand-100` / `brand-50` | fundos de destaque suave, chips |
| `accent-500` | CTA secundário, badge "novo" |
| `success-600` | badge de desconto, WhatsApp, economia |
| `danger-600` | erros, remoção |
| `surface` / `surface-alt` / `surface-sunken` | card / fundo da página / placeholder |
| `line` / `line-strong` | bordas |
| `ink` / `ink-soft` / `ink-muted` | texto |

Regras não negociáveis: preço atual é o segundo maior peso visual da página; preço antigo com `line-through` em `ink-muted`; badge de desconto `success-600` + texto branco no formato `-51%`; `brand-500` sobre `brand-100` **não** passa AA para texto pequeno — usar `brand-900`; radius padrão `rounded-lg` (8px); card = borda + sombra mínima, nunca sombra forte com borda.

## Comandos

```bash
npm run dev            # desenvolvimento (mock por padrão)
npm run build          # prisma generate + next build
npm run check          # eslint + tsc --noEmit
npm run db:migrate     # prisma migrate dev
npm run db:deploy      # prisma migrate deploy (produção)
npm run db:seed        # popula o banco espelhando o mock
npm run create-admin   # cria/promove o primeiro admin
npm run db:check       # sanidade do banco (usuários, categorias, contagens)
npm run gen:images     # regenera os SVGs de placeholder do mock
```

## Fonte de dados

`DATA_SOURCE=mock` (padrão) usa `src/lib/data/mock` — estado em memória, some ao reiniciar.
`DATA_SOURCE=prisma` usa PostgreSQL. Os dois lados implementam a mesma interface de `src/lib/data/types.ts`: **ao adicionar um método, implemente nos dois** ou a troca de env quebra.

Contas de demonstração (só no modo mock): `admin@nakatenis.com.br / admin123` e `cliente@nakatenis.com.br / cliente123`.

## Onde as coisas ficam

```
src/lib/data/        contratos + repositórios mock e prisma (única porta para dados)
src/lib/auth/        Auth.js, guards, schemas zod, hash, rate limit
src/lib/storage/     StorageAdapter (local | cloudinary) + upload direto assinado
src/lib/images/      loader do next/image — transformação vai para o CDN
src/lib/whatsapp/    builder da mensagem de checkout
src/lib/seo/         metadata helpers, JSON-LD, FAQ
src/lib/pricing.ts   desconto, BRL, parcelamento — dinheiro passa aqui
src/stores/          cart-store (Zustand + persist), ui-store (drawer, toasts)
src/proxy.ts         proxy do Next 16 (antigo middleware) — guard otimista
```
