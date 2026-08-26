---
name: nakatenis-prisma
description: Use ao mexer em schema, migration ou seed do NakaTenis — carrega convenções de nome, dinheiro em centavos, onDelete, índices obrigatórios e os comandos de migration do Prisma 7.
---

# Prisma no NakaTenis

## Versão e configuração

Prisma **7** com o generator novo `prisma-client` (não `prisma-client-js`). A URL do banco fica em `prisma7.config.ts`, não no bloco `datasource`.

```
prisma/schema.prisma      modelos
prisma/migrations/        migrations versionadas
prisma/seed.ts            espelha src/lib/data/mock/catalog.ts
prisma7.config.ts         schema, migrations.path, migrations.seed, datasource.url
src/generated/prisma/     client gerado (gitignored — rode `npm run db:generate`)
```

O client exige um **driver adapter**: `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`. Ver `src/lib/data/prisma/client.ts` — é um singleton **preguiçoso**, para o modo mock nunca abrir conexão.

## Comandos

```bash
npm run db:migrate -- --name descricao_curta   # cria e aplica migration em dev
npm run db:deploy                              # aplica migrations em produção
npm run db:seed                                # popula espelhando o mock
npm run db:generate                            # regenera o client
npm run create-admin                           # primeiro admin (nunca no seed)
npx prisma validate                            # valida o schema
```

`DIRECT_URL` (conexão sem pooler) é usada para migrations; `DATABASE_URL` (pooled) para runtime.

## Convenções

- **Dinheiro em centavos (`Int`)**. Nunca `Float`, nunca `Decimal`.
- Modelos em `PascalCase` singular; campos em `camelCase`.
- `id String @id @default(cuid())`.
- `createdAt DateTime @default(now())` + `updatedAt DateTime @updatedAt` em tudo que o admin edita.
- Texto longo: `@db.Text`. Texto com limite de UI: `@db.VarChar(n)` (ex.: `shortDescription @db.VarChar(200)`, `metaDescription @db.VarChar(160)`).
- `AboutPage` usa id fixo `"singleton"` — sempre `upsert`, nunca `create`.

## `onDelete` — decidido, não improvise

| Relação | Regra | Porquê |
|---|---|---|
| `Product.category` | `Restrict` | apagar categoria com produtos deve falhar explicitamente; o admin move os produtos antes |
| `ProductImage.product` | `Cascade` | imagem não existe sem produto |
| `Address.user`, `Account.user`, `Session.user` | `Cascade` | dados pessoais somem com a conta |

## Índices obrigatórios

```prisma
@@index([categoryId, isActive])   // listagem por categoria
@@index([isFeatured, isActive])   // destaques da home
@@index([createdAt])              // ordenação por novidades
@@index([productId, position])    // galeria da PDP
@@index([isActive, position])     // sidebar de categorias
@@index([userId])                 // endereços, contas, sessões
@@index([role])                   // guard de admin
```

## Busca

Começa com `ILIKE` sobre `title` + `shortDescription` + `brand` + `sku` (`mode: "insensitive"`). **Só migrar para `tsvector` com índice GIN se o catálogo passar de ~500 itens.** Não antecipar.

## Depois de qualquer mudança no schema

1. `npx prisma validate`
2. `npm run db:migrate -- --name ...`
3. Atualize os mappers em `src/lib/data/prisma/mappers.ts` se o shape público mudou.
4. Atualize `src/lib/data/types.ts` e o repositório **mock** correspondente.
5. `npm run check`
