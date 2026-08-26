---
name: nakatenis-data-layer
description: Use ao criar ou alterar qualquer acesso a dados no NakaTenis — carrega o contrato dos repositórios, o padrão DATA_SOURCE e como adicionar um método nos dois lados (mock + prisma) sem divergir.
---

# Camada de dados do NakaTenis

## Regra dura

**Nenhum componente, página ou Server Action importa `PrismaClient`.** Tudo passa pelos repositórios exportados por `src/lib/data`. Exceções: `src/lib/data/prisma/*` e `src/lib/auth/` (adapter do Auth.js).

## Estrutura

```
src/lib/data/
├── types.ts        ← contratos. Fonte da verdade.
├── index.ts        ← switch por DATA_SOURCE
├── mock/           ← catálogo em memória (dev offline)
│   ├── catalog.ts  ← os 25 produtos e as 4 categorias
│   ├── store.ts    ← estado mutável no globalThis (sobrevive ao HMR)
│   ├── products.ts categories.ts users.ts about.ts
└── prisma/
    ├── client.ts   ← singleton preguiçoso do PrismaClient
    ├── mappers.ts  ← linha do Prisma → tipo público
    └── products.ts categories.ts users.ts about.ts
```

Repositórios: `productRepo`, `categoryRepo`, `userRepo`, `aboutRepo`.

## Como adicionar um método

1. Declare a assinatura na interface certa em `types.ts`.
2. Implemente em `src/lib/data/mock/<repo>.ts`.
3. Implemente em `src/lib/data/prisma/<repo>.ts`.
4. `npx tsc --noEmit` — o TypeScript acusa se um dos lados ficou para trás.

Se a implementação Prisma ainda não for possível, lance `new Error("NotImplemented")` — mas **satisfaça a interface**, senão a troca de env quebra a tipagem.

## Convenções

- Datas circulam como **string ISO** nos tipos públicos (`createdAt: string`), convertidas nos mappers. Isso evita passar `Date` para Client Components.
- Dinheiro sempre em **centavos (`Int`)**.
- `list()` devolve só ativos por padrão; o admin passa `includeInactive: true`.
- Paginação: `Paginated<T>` com `items | total | page | perPage | totalPages`. `page` já vem clampado ao intervalo válido.
- `getManyByIds` existe para a revalidação do carrinho persistido — não substituir por N chamadas de `getById`.
- Slug único via `uniqueSlug(titulo, slugsExistentes)` de `@/lib/utils` (sufixo `-2`, `-3`).
- Listagens de produto sempre incluem `category` e `images` no mesmo `include` (`productInclude` em `mappers.ts`) — evita N+1.

## Trocar a fonte

```bash
DATA_SOURCE=mock    # padrão — em memória
DATA_SOURCE=prisma  # PostgreSQL
```

Se a troca exigir mexer em algum componente, **o contrato foi violado** em algum lugar. Corrija o repositório, não o componente.
