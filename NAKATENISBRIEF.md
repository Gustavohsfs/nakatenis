# NakaTenis — Brief de Implementação

> Documento de referência para condução do projeto com Claude Code.
> Stack: **Next.js 16 (App Router) + TypeScript + Tailwind v4 + Prisma + PostgreSQL (Neon)**
> Metodologia: **SDD (Spec-Driven Development)** — cada fase gera spec → plano → implementação → verificação.

---

## 1. Contexto

E-commerce vitrine de artigos esportivos para **tênis e beach tennis**, chamado **NakaTenis**, operado por um lojista único (o amigo do Gustavo).

**Ponto arquitetural mais importante:** o site **não processa pagamento**. O checkout é um *handoff para o WhatsApp* — o carrinho vira uma mensagem formatada enviada para `+55 17 99181-4042`. Isso significa que:

- Não existe gateway, antifraude, split, webhook de pagamento, nem estado de pedido pago.
- "Formas de pagamento" é **texto livre informativo** cadastrado pelo admin no produto, não uma integração.
- O cadastro de usuário com endereço serve para **pré-preencher a mensagem do WhatsApp** e dar conveniência ao cliente recorrente — não é pré-requisito para comprar.

Consequência prática: **não bloquear compra atrás de login.** Usuário anônimo consegue navegar, montar carrinho e finalizar no WhatsApp. Login é opcional e agrega dados de entrega à mensagem. Se essa premissa mudar, ela muda a Fase 5 inteira.

---

## 2. Decisões técnicas fechadas

| Área | Decisão | Nota |
|---|---|---|
| Framework | Next.js 16, App Router, TypeScript strict | Server Components por padrão; `"use client"` só onde há interação |
| Estilo | Tailwind CSS v4 + shadcn/ui | Tokens de cor via CSS variables (ver §4) |
| Banco | **PostgreSQL no Neon** | Mesmo padrão do ghtpromo; independe do host |
| ORM | Prisma | Schema + migrations prontos desde a Fase 1, **conectado só na Fase 8** |
| Auth | **Auth.js (NextAuth v5)** + `@auth/prisma-adapter` | Credentials provider; sessão em cookie httpOnly; papel `USER`/`ADMIN` no token |
| Carrinho | **Zustand + middleware `persist`** | Ver §5.3 — justificativa da escolha sobre Context/Redux |
| Imagens | **Cloudinary** (assumido — sem preferência declarada) | Free tier, resize/WebP/AVIF automáticos, CDN, não ocupa disco do host. Trocar por disco local é uma implementação alternativa do mesmo `StorageAdapter` (§5.4) |
| Hospedagem | **VPS Node na Hostinger** (assumido — ainda em aberto) | Ver §11 e o alerta abaixo |
| Testes | Sem testes unitários (decisão do Gustavo). Smoke E2E opcional com Playwright em 4 fluxos críticos | Ver §10 |

### ⚠️ Alerta sobre a hospedagem

A hospedagem ficou em aberto e **essa é a única decisão que pode invalidar parte da arquitetura.**

- **VPS (Node/PM2 + Nginx):** tudo abaixo funciona como escrito. É o caminho assumido.
- **Hospedagem compartilhada (só arquivos estáticos):** **não suporta este projeto.** Sem Node no servidor não há Route Handlers, não há Auth.js, não há Prisma, não há upload de imagem e não há painel admin. Seria necessário `output: "export"` + um backend hospedado separadamente — o que reintroduz custo e complexidade maiores do que a VPS.

**Recomendação:** confirmar VPS antes de iniciar a Fase 0. Se for compartilhada, a alternativa honesta é hospedar o Next na Vercel (free tier resolve esse porte) e apontar o domínio da Hostinger via DNS — mais simples e mais barato que qualquer contorno.

---

## 3. Estrutura de pastas

```
nakatenis/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── brand/                    # logo, favicon, og-default.png
│   ├── robots.txt                # gerado dinamicamente na Fase 7
│   └── llms.txt                  # descoberta por IAs (§9.3)
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                        # home / vitrine
│   │   │   ├── categoria/[slug]/page.tsx       # listagem por categoria
│   │   │   ├── produto/[slug]/page.tsx         # PDP
│   │   │   ├── carrinho/page.tsx
│   │   │   ├── busca/page.tsx
│   │   │   └── quem-somos/page.tsx
│   │   ├── (auth)/
│   │   │   ├── entrar/page.tsx
│   │   │   └── cadastro/page.tsx
│   │   ├── (account)/conta/
│   │   │   ├── page.tsx                        # dados pessoais
│   │   │   └── endereco/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx                      # guard de role ADMIN
│   │   │   ├── page.tsx                        # dashboard
│   │   │   ├── produtos/
│   │   │   │   ├── page.tsx                    # listagem + busca
│   │   │   │   ├── novo/page.tsx
│   │   │   │   └── [id]/editar/page.tsx
│   │   │   ├── categorias/page.tsx
│   │   │   └── quem-somos/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── upload/route.ts
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                   # shadcn (não editar à mão sem motivo)
│   │   ├── layout/               # Header, Sidebar, Footer, MobileNav
│   │   ├── product/              # ProductCard, PriceBlock, Gallery, DiscountBadge
│   │   ├── cart/                 # CartDrawer, CartLineItem, CartSummary
│   │   └── admin/                # ProductForm, ImageUploader, CategorySelect
│   ├── lib/
│   │   ├── data/                 # ← camada de dados (§5.1)
│   │   │   ├── index.ts          # switch por DATA_SOURCE
│   │   │   ├── types.ts          # contratos (fonte da verdade)
│   │   │   ├── mock/
│   │   │   └── prisma/
│   │   ├── auth/                 # config Auth.js, guards, hash
│   │   ├── storage/              # StorageAdapter (Cloudinary | local)
│   │   ├── whatsapp/             # builder da mensagem de checkout
│   │   ├── seo/                  # metadata helpers + JSON-LD builders
│   │   ├── pricing.ts            # desconto, formatação BRL, parcelamento
│   │   └── utils.ts
│   ├── stores/
│   │   └── cart-store.ts
│   └── types/
├── .env.example
├── CLAUDE.md
└── .claude/skills/               # skills do projeto (§6.2)
```

---

## 4. Design system

**Direção:** azul institucional na navegação (header, sidebar, footer, estados ativos), branco/neutro claro na área de conteúdo onde os produtos respiram. Contraste alto em preço e desconto — é o que o olho precisa achar primeiro.

```css
/* globals.css — tokens */
:root {
  --brand-900: #0B2545;  /* header e footer */
  --brand-700: #12406E;  /* sidebar, hover de nav */
  --brand-500: #1B6CA8;  /* botões primários, links */
  --brand-100: #E6F0F8;  /* fundos de destaque suave, chips */

  --accent-500: #F2A93B; /* CTA secundário, badge "novo" */
  --success-600: #15803D;/* percentual de desconto, "frete grátis" */
  --danger-600:  #B91C1C;/* erros, remoção */

  --surface:     #FFFFFF;/* cards e área de conteúdo */
  --surface-alt: #F5F7FA;/* fundo da página */
  --border:      #E2E8F0;
  --text:        #0F172A;
  --text-muted:  #64748B;
}
```

**Regras não negociáveis**

- Preço atual: maior peso visual da página depois do título. Preço antigo: `line-through`, `--text-muted`, tamanho menor.
- Badge de desconto: fundo `--success-600`, texto branco, formato `-51%`.
- Contraste mínimo AA (4.5:1) para texto; azul `--brand-500` sobre branco passa, azul sobre `--brand-100` **não** para texto pequeno — usar `--brand-900`.
- Tipografia: Inter (ou Geist). Uma família só, pesos 400/500/600/700.
- Radius padrão `8px`, cards com `border` + sombra mínima (não empilhar sombra forte com borda).
- Mobile-first. A sidebar de categorias vira drawer abaixo de `lg`.

---

## 5. Arquitetura

### 5.1 Camada de dados — repository pattern com `DATA_SOURCE`

Convenção já usada no ghtpromo e no Carol Capas, e é o que permite construir toda a casca antes de tocar no banco.

```ts
// src/lib/data/types.ts — contrato único
export interface ProductRepository {
  list(filters?: ProductFilters): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  getById(id: string): Promise<Product | null>;
  listByCategory(categorySlug: string, opts?: ListOpts): Promise<Paginated<Product>>;
  search(query: string): Promise<Product[]>;
  create(input: ProductInput): Promise<Product>;
  update(id: string, input: Partial<ProductInput>): Promise<Product>;
  remove(id: string): Promise<void>;
}
```

```ts
// src/lib/data/index.ts
const source = process.env.DATA_SOURCE ?? "mock";
export const productRepo: ProductRepository =
  source === "prisma" ? prismaProductRepo : mockProductRepo;
```

Repositórios: `productRepo`, `categoryRepo`, `userRepo`, `aboutRepo`.

**Regra dura:** nenhum componente, página ou Server Action importa `PrismaClient` diretamente. Tudo passa pelo repositório. É isso que faz a Fase 8 ser uma troca de variável de ambiente em vez de uma refatoração.

### 5.2 Precificação e desconto

```ts
// src/lib/pricing.ts
// price       = valor atual (obrigatório)
// compareAtPrice = valor antigo (opcional)
export function getDiscount(price: number, compareAt?: number | null) {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
```

- Valores gravados em **centavos (`Int`)**. Nunca `Float` para dinheiro.
- Formatação sempre por `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`.
- Parcelamento exibido: `12x de R$ X sem juros` — cálculo `price / 12`, arredondado pra cima no último centavo.
- Se `compareAtPrice <= price`, o campo é ignorado silenciosamente na vitrine e sinalizado como aviso no formulário do admin.

### 5.3 Carrinho — por que Zustand e não Context/Redux

O pedido foi "contexto ou redux". A recomendação é **Zustand com `persist`**, e a razão é concreta:

- **Context** re-renderiza toda a árvore consumidora a cada mudança de quantidade, e persistência em `localStorage` vira `useEffect` manual com problema de hidratação SSR.
- **Redux Toolkit** resolve, mas traz store, slices, provider e `redux-persist` para gerenciar ~5 campos.
- **Zustand + persist** dá seletores granulares (só o badge do header re-renderiza quando muda a contagem), persistência em uma linha e `skipHydration` para resolver o mismatch de SSR corretamente.

```ts
// src/stores/cart-store.ts
type CartItem = {
  productId: string; slug: string; title: string;
  price: number; compareAtPrice?: number | null;
  image: string; quantity: number;
};
// ações: addItem, removeItem, setQuantity, increment, decrement, clear
// seletores: useCartCount(), useCartSubtotal(), useCartItems()
// persist: { name: "nakatenis-cart", version: 1, skipHydration: true }
```

**Cuidados obrigatórios:**
- Hidratar no cliente via `useEffect(() => useCartStore.persist.rehydrate(), [])`, e renderizar o badge só depois de `hasHydrated` — senão dá mismatch de SSR.
- `version` + `migrate` no persist, para não quebrar carrinhos salvos quando o shape mudar.
- Ao carregar o carrinho, revalidar preço e disponibilidade contra o servidor: preço salvo em `localStorage` há duas semanas está desatualizado e vira reclamação no WhatsApp.

### 5.4 Storage de imagem

```ts
// src/lib/storage/types.ts
export interface StorageAdapter {
  upload(file: File, folder: string): Promise<{ url: string; publicId: string; width: number; height: number }>;
  remove(publicId: string): Promise<void>;
}
```

Implementações: `cloudinary.ts` (padrão) e `local.ts` (disco da VPS + Nginx). Trocar é uma variável de ambiente `STORAGE_DRIVER`. Isso evita ficar preso ao Cloudinary caso o volume cresça.

### 5.5 Checkout via WhatsApp

```ts
// src/lib/whatsapp/build-message.ts
const WHATSAPP_NUMBER = "5517991814042";

// Template (encodeURIComponent no final):
// Olá! Tenho interesse nestes produtos da NakaTenis:
//
// 1. Raquete Beach Tennis Pro Carbon
//    Qtd: 2 — R$ 289,90 cada
//    https://nakatenis.com.br/produto/raquete-pro-carbon
//
// 2. Tênis Court Speed 41
//    Qtd: 1 — R$ 459,90
//    https://nakatenis.com.br/produto/tenis-court-speed
//
// Total: R$ 1.039,70
//
// Dados para entrega:
// Gustavo Henrique
// Rua 4, 2177 — Bairro — Cidade/SP — CEP 00000-000
```

- Bloco "Dados para entrega" só entra se houver usuário logado **com endereço cadastrado**. Caso contrário, é omitido inteiro (não colocar placeholder vazio).
- Link final: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`.
- Abrir em `target="_blank" rel="noopener"`.
- Mesma função serve o botão "Comprar" da PDP (carrinho de 1 item efêmero, **sem** adicionar ao carrinho persistente) e o "Finalizar pedido" do carrinho.
- URL do produto sempre absoluta, montada a partir de `NEXT_PUBLIC_SITE_URL`.
- Atenção ao tamanho: o `wa.me` degrada acima de ~2.000 caracteres. Se o carrinho tiver mais de ~15 itens, truncar a lista e acrescentar `...e mais N itens — ver carrinho: <link>`.

---

## 6. Configuração do Claude Code

### 6.1 `CLAUDE.md` na raiz

Deve conter, em formato curto e imperativo: stack e versões; a regra "nenhum acesso a Prisma fora de `src/lib/data/prisma/`"; tokens de cor; convenção de dinheiro em centavos; Server Components por padrão; `pt-BR` em toda a UI e `en` no código; nunca commitar `.env`; sempre rodar `npm run lint && npx tsc --noEmit` antes de dar uma fase por concluída.

### 6.2 Skills do projeto (`.claude/skills/`)

Criar estas seis. Cada uma existe porque há uma decisão que se perde entre sessões:

| Skill | Quando dispara | O que carrega |
|---|---|---|
| `nakatenis-design-system` | qualquer componente de UI | tokens, escala tipográfica, regras de contraste, anatomia de `ProductCard` e `PriceBlock`, breakpoints |
| `nakatenis-data-layer` | criar/alterar acesso a dados | contrato dos repositórios, padrão `DATA_SOURCE`, como adicionar um método nos dois lados (mock + prisma) sem divergir |
| `nakatenis-prisma` | schema, migration, seed | convenções de nomes, dinheiro em centavos, `onDelete`, índices obrigatórios, comando de migration |
| `nakatenis-seo` | nova rota pública | `generateMetadata`, JSON-LD por tipo de página, canonical, OG, entrada no sitemap |
| `nakatenis-admin-forms` | telas do admin | react-hook-form + zod, upload de múltiplas imagens, estados de erro/loading, confirmação de exclusão |
| `nakatenis-deploy` | build, env, publicação | checklist de env vars, build standalone, PM2, Nginx, migration em produção |

### 6.3 Skills do Superpowers a usar por fase

- `brainstorming` — antes de cada fase, converter o item do brief em spec detalhada.
- `writing-plans` — transformar a spec em plano de implementação com arquivos nomeados.
- `subagent-driven-development` — Fases 3, 6 e 7, que têm trabalho paralelizável (várias páginas independentes).
- `systematic-debugging` — quando algo quebrar, em vez de tentativa e erro.
- `verification-before-completion` — obrigatório no fim de **toda** fase. Sem testes unitários, a verificação é a única rede.
- `receiving-code-review` / `requesting-code-review` — ao fim das Fases 4, 6 e 8, que concentram risco.

### 6.4 MCPs recomendados

- **context7** — docs atualizadas de Next 16, Auth.js v5 e Prisma. Auth.js v5 em especial tem muita informação desatualizada circulando; sem isso o agente escreve API v4.
- **shadcn** — instalar componentes sem copiar código à mão.
- **Playwright MCP** — validação visual das páginas durante o desenvolvimento (screenshot + leitura), não testes.
- **Neon MCP** (opcional) — criar branch de banco por fase a partir da Fase 8.

---

## 7. Modelo de dados

Escrever `prisma/schema.prisma` completo já na Fase 1 e gerar as migrations, mesmo sem conectar a aplicação.

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum Role { USER ADMIN }

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified DateTime?
  passwordHash  String?
  phone         String?
  cpf           String?   @unique
  role          Role      @default(USER)
  addresses     Address[]
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  @@index([role])
}

model Address {
  id           String  @id @default(cuid())
  userId       String
  user         User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  label        String? // "Casa", "Trabalho"
  recipient    String
  zipCode      String
  street       String
  number       String
  complement   String?
  district     String
  city         String
  state        String  @db.Char(2)
  isDefault    Boolean @default(false)
  createdAt    DateTime @default(now())
  @@index([userId])
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique          // Raquetes, Roupas, Sapatos, Acessórios
  slug        String    @unique
  description String?
  icon        String?
  position    Int       @default(0)      // ordem na sidebar
  isActive    Boolean   @default(true)
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  @@index([isActive, position])
}

model Product {
  id              String   @id @default(cuid())
  title           String
  slug            String   @unique
  shortDescription String  @db.VarChar(200)   // usado no card da listagem
  description     String   @db.Text           // rich text da PDP
  price           Int                          // centavos — valor atual
  compareAtPrice  Int?                         // centavos — valor antigo
  paymentInfo     String   @db.Text            // texto livre do admin
  brand           String?
  sku             String?  @unique
  stock           Int      @default(0)
  isActive        Boolean  @default(true)
  isFeatured      Boolean  @default(false)
  categoryId      String
  category        Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  images          ProductImage[]
  specs           Json?                        // [{ label, value }] — grade, peso, material
  metaTitle       String?
  metaDescription String?  @db.VarChar(160)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@index([categoryId, isActive])
  @@index([isFeatured, isActive])
  @@index([createdAt])
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  publicId  String                        // id no storage, para deletar
  alt       String?
  width     Int?
  height    Int?
  position  Int     @default(0)
  @@index([productId, position])
}

model AboutPage {
  id        String   @id @default("singleton")
  title     String
  content   String   @db.Text
  images    Json?                          // [{ url, publicId, alt, caption }]
  updatedAt DateTime @updatedAt
}

// + models Account, Session, VerificationToken do @auth/prisma-adapter
```

**Notas de modelagem**

- `onDelete: Restrict` em `Product.category`: apagar uma categoria com produtos deve falhar explicitamente, não órfãos silenciosos. O admin precisa mover os produtos antes.
- `AboutPage` com id fixo `"singleton"` — um `upsert`, sem risco de duplicar a página.
- `slug` gerado a partir do título com verificação de colisão (sufixo `-2`, `-3`).
- Busca: começar com `ILIKE` sobre `title` + `shortDescription`. Se o catálogo passar de ~500 itens, migrar para `tsvector` com índice GIN — não antecipar.
- **`stock` não bloqueia a compra** (o fechamento é humano, no WhatsApp). Serve para exibir "últimas unidades" e para o admin se organizar. Deixar isso explícito no `CLAUDE.md` evita que alguém implemente reserva de estoque sem necessidade.

---

## 8. Fases de implementação

Cada fase tem um comando de entrada sugerido, entregáveis e critérios de aceite. **Só avançar com todos os critérios verdes.**

---

### Fase 0 — Fundação (0,5 dia)

**Objetivo:** repositório pronto, sem nenhuma tela de produto ainda.

- `create-next-app` com TypeScript, Tailwind v4, ESLint, App Router, `src/`.
- Prettier + `eslint-config-next` + `@typescript-eslint` strict.
- shadcn/ui inicializado com os tokens de cor do §4 já mapeados.
- `CLAUDE.md` (§6.1) e as seis skills do §6.2 escritas.
- `.env.example` com **todas** as chaves (`DATABASE_URL`, `DATA_SOURCE`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `STORAGE_DRIVER`, `CLOUDINARY_*`).
- Git inicializado; `.git/info/exclude` cobrindo a camada de orquestração de IA, conforme a convenção do Gustavo.

**Aceite:** `npm run build` passa; `npx tsc --noEmit` limpo; skills lidas corretamente pelo Claude Code em um teste rápido.

---

### Fase 1 — Camada de dados e Prisma (1 dia)

**Objetivo:** contrato de dados definido e schema versionado — sem conectar banco.

- `src/lib/data/types.ts` com todos os contratos.
- `mock/` com ~24 produtos realistas cobrindo as 4 categorias, sendo pelo menos 8 com `compareAtPrice` (para exercitar o desconto), 1 sem imagem, 1 inativo, 1 com descrição longa.
- `prisma/schema.prisma` completo (§7) + `npx prisma migrate dev --name init` gerando a migration.
- `prisma/seed.ts` escrito, espelhando o mock.
- `src/lib/pricing.ts` e `src/lib/whatsapp/build-message.ts` implementados e conferidos manualmente com 3 casos cada.

**Aceite:** migration gerada e legível; `prisma validate` passa; trocar `DATA_SOURCE` não quebra tipagem (o repositório prisma pode lançar `NotImplemented` por enquanto, mas precisa satisfazer a interface).

---

### Fase 2 — Layout global (1 dia)

**Objetivo:** a moldura do site, navegável e responsiva.

- **Header superior** (referência: print do Mercado Livre): faixa azul `--brand-900`, logo à esquerda, input de busca central expansível, à direita ícone de notificações com badge, ícone de carrinho com contador e menu de conta.
- **Sidebar esquerda** com categorias vindas do `categoryRepo`, ordenadas por `position`, com estado ativo destacado. Drawer em mobile.
- **Footer** com institucional, categorias, contato e WhatsApp.
- Skeletons e `loading.tsx` por rota; `error.tsx` e `not-found.tsx` globais.

**Aceite:** navegação por teclado funciona (tab order, foco visível); Lighthouse a11y ≥ 95 na home vazia; sem layout shift no header ao hidratar; testado em 360px, 768px e 1440px.

---

### Fase 3 — Catálogo (2 dias)

**Objetivo:** vitrine completa lendo do mock.

- **Home:** hero, faixa de destaques (`isFeatured`), grid de novidades, atalhos das 4 categorias.
- **`/categoria/[slug]`:** listagem em grid com título, descrição resumida, preço. Com desconto: preço antigo riscado, preço atual destacado e badge `-N%`. Ordenação (relevância, menor preço, maior preço, novidades), filtro de faixa de preço, paginação.
- **`/produto/[slug]` (a tela mais caprichada do projeto):**
  - Galeria com thumbnails, imagem principal, zoom em hover no desktop e swipe em mobile.
  - Título, marca, SKU, breadcrumb.
  - Bloco de preço: valor antigo riscado, valor atual grande, badge de desconto, economia em reais, parcelamento (`12x de R$ X sem juros`) e destaque do Pix.
  - `paymentInfo` renderizado em bloco próprio.
  - Descrição completa formatada + tabela de especificações (`specs`).
  - Seletor de quantidade; **"Comprar agora"** (→ WhatsApp direto) e **"Adicionar ao carrinho"** (secundário).
  - Aviso de estoque baixo quando `stock <= 3`.
  - Carrossel "produtos relacionados" da mesma categoria.
- **`/busca`** com destaque do termo e estado vazio útil (sugere categorias).

**Aceite:** todos os 24 mocks renderizam sem quebra, incluindo os casos-limite; o produto sem imagem mostra placeholder; nenhuma imagem sem `alt`; LCP < 2,5s em 3G simulado na PDP.

---

### Fase 4 — Carrinho e checkout WhatsApp (1 dia)

- Store Zustand com persist, hidratação segura (§5.3).
- `CartDrawer` abrindo pelo ícone do header + feedback ao adicionar.
- **`/carrinho`:** linha por item com imagem, título, preço unitário, stepper de quantidade, subtotal da linha e remover; resumo lateral com subtotal, economia total e **"Finalizar pedido pelo WhatsApp"**; estado vazio com CTA para a home; botão "limpar carrinho" com confirmação.
- Revalidação de preço contra o repositório ao montar a página, avisando o usuário se algo mudou.

**Aceite:** fechar e reabrir o navegador mantém o carrinho; a mensagem gerada abre corretamente no WhatsApp Web e no app mobile; carrinho com 20 itens não estoura o limite do `wa.me` (truncamento funciona); quantidade nunca fica em 0 ou negativa.

---

### Fase 5 — Autenticação e conta (1,5 dia)

- Auth.js v5 com Credentials provider, `bcrypt`/`argon2`, sessão JWT com `role`.
- `/cadastro`: nome, e-mail, senha, telefone e endereço completo (CEP com autopreenchimento via ViaCEP, com fallback manual se a API falhar).
- `/entrar` com mensagens de erro genéricas (nunca "e-mail não existe" — enumeração de usuários).
- `/conta`: editar dados e endereços, definir endereço padrão.
- Middleware protegendo `/conta/*` e `/admin/*`; `/admin/*` exige `role === "ADMIN"`.
- Rate limit no login e no cadastro.
- Ao logar, o endereço padrão passa a entrar na mensagem do WhatsApp.

**Aceite:** usuário anônimo continua conseguindo comprar do início ao fim; usuário comum recebe 404 (não 403) em `/admin`; senha nunca trafega ou aparece em log; sessão persiste após reload.

---

### Fase 6 — Painel admin (2 dias)

- `/admin` com layout próprio e resumo (nº de produtos, por categoria, produtos sem imagem).
- **`/admin/produtos`:** tabela com busca, filtro por categoria, toggle de ativo, editar e excluir com confirmação.
- **Formulário de produto** (novo/editar) com react-hook-form + zod:
  - título (slug gerado, editável), descrição curta (contador até 200), descrição completa (editor rich text simples);
  - **upload múltiplo de imagens** com drag-and-drop, preview, reordenação, definição da principal e remoção (removendo também do storage);
  - **valor atual** e **valor antigo** com máscara de moeda e preview ao vivo do percentual de desconto calculado;
  - **dropdown de categoria** alimentado pelo `categoryRepo` — é ele que joga o produto na categoria da sidebar automaticamente;
  - **formas de pagamento**: textarea livre, com valor padrão pré-preenchido (`Cartão em até 12x sem juros ou à vista no Pix`);
  - marca, SKU, estoque, specs (lista chave/valor), destaque, ativo, meta title/description.
- **`/admin/categorias`:** CRUD com reordenação por drag-and-drop (define a ordem da sidebar); bloquear exclusão de categoria com produtos, com mensagem clara.
- **`/admin/quem-somos`:** editar título, texto e galeria de fotos.

**Aceite:** criar um produto pelo admin faz ele aparecer na categoria correta da sidebar e na listagem, sem passo manual; excluir produto remove as imagens do storage; validação impede preço antigo menor ou igual ao atual; nenhuma rota de mutação aceita requisição sem sessão de admin (testar chamando a Server Action direto).

---

### Fase 7 — SEO, GEO e performance (1 dia)

Ver §9 para o detalhamento. Entregáveis: metadata dinâmica em todas as rotas, JSON-LD, `sitemap.ts`, `robots.ts`, `llms.txt`, OG images, otimização de imagem e revisão de acessibilidade.

**Aceite:** Rich Results Test valida `Product` e `BreadcrumbList` na PDP; sitemap lista todas as URLs públicas ativas; Lighthouse ≥ 90 em Performance, SEO e Best Practices, ≥ 95 em Accessibility; nenhum `<h1>` duplicado.

---

### Fase 8 — Integração Prisma real (1 dia)

- Provisionar Neon; `DATABASE_URL` e `DIRECT_URL` no `.env`.
- `npx prisma migrate deploy` + `npx prisma db seed`.
- Implementar `src/lib/data/prisma/*` cumprindo os contratos da Fase 1.
- Singleton do `PrismaClient` (evitar esgotar conexões em dev com hot reload).
- Trocar `DATA_SOURCE=prisma`; **manter o mock funcionando** — ele continua sendo o modo de desenvolvimento offline.
- Substituir a autenticação mock pelo `@auth/prisma-adapter`.
- Script de criação do primeiro admin (`npm run create-admin`), nunca um admin hardcoded no seed de produção.
- Revisar N+1 (`include` das imagens e da categoria nas listagens) e paginação por cursor onde couber.

**Aceite:** os mesmos fluxos da Fase 3 à 6 passam com `DATA_SOURCE=prisma`, sem alterar nenhum componente; nenhum import de `@prisma/client` fora de `src/lib/data/prisma/` e `src/lib/auth/`.

---

### Fase 9 — Deploy Hostinger (0,5 dia)

Ver §11.

---

## 9. SEO e descoberta por IAs

### 9.1 SEO técnico

- `generateMetadata` em todas as rotas públicas; title pattern `%s | NakaTenis`.
- Canonical em todas as páginas; paginação com `rel="prev/next"` lógico nos metadados.
- `sitemap.ts` dinâmico (home, quem-somos, categorias ativas, produtos ativos) com `lastModified`.
- `robots.ts` liberando tudo exceto `/admin`, `/conta` e `/api`.
- Open Graph e Twitter Card por produto, com imagem principal.
- URLs em português com slug legível: `/produto/raquete-beach-tennis-pro-carbon`.
- Imagens via `next/image` com `sizes` corretos, `priority` só na principal da PDP.

### 9.2 Dados estruturados (JSON-LD)

- **Todas as páginas:** `Organization` (nome, logo, `sameAs` das redes, `contactPoint` com o WhatsApp) e `WebSite` com `SearchAction`.
- **PDP:** `Product` com `name`, `image[]`, `description`, `sku`, `brand`, e `offers` (`price`, `priceCurrency: BRL`, `availability`, `url`, `priceValidUntil`) + `BreadcrumbList`.
- **Categoria:** `ItemList` com os produtos + `BreadcrumbList`.
- **Quem somos:** `AboutPage`.

Nota honesta: sem checkout no site, não há como sustentar `AggregateRating` ou `Review` — não inventar. Marcação falsa é penalizada pelo Google.

### 9.3 Descoberta por IAs (GEO)

- **`/llms.txt`** na raiz: o que é a NakaTenis, categorias, faixa de preço, região atendida, como comprar (WhatsApp), link do sitemap.
- Conteúdo em **texto renderizado no HTML** (Server Components), não injetado por JS — crawlers de IA em geral não executam JavaScript.
- Descrições de produto escritas com **entidades explícitas** ("raquete de beach tennis em fibra de carbono, 340g, formato híbrido") em vez de marketing vago. É isso que faz o produto ser citável por um LLM.
- FAQ na PDP e na home, com `FAQPage` JSON-LD — formato que modelos de linguagem extraem bem.
- `quem-somos` com nome do dono, cidade, tempo de mercado e especialidade — ancoragem de entidade local.

---

## 10. Qualidade sem testes unitários

Sem testes unitários, a rede de segurança precisa vir de outro lugar. Ao fim de cada fase, obrigatoriamente:

1. `npm run lint && npx tsc --noEmit` limpos.
2. `npm run build` sem warnings novos.
3. Checklist manual da fase executado no navegador (desktop + mobile).
4. Skill `verification-before-completion` rodada.

**Sugestão fora do escopo pedido:** quatro smoke tests com Playwright cobrindo *adicionar ao carrinho → persistir após reload → gerar link do WhatsApp*, *login → ver dados na mensagem*, *admin cria produto → aparece na categoria*, *acesso não-admin é bloqueado*. São ~150 linhas e cobrem exatamente onde uma regressão silenciosa mais dói. Fica a critério do Gustavo.

---

## 11. Deploy na Hostinger (VPS)

**Preparação já durante o desenvolvimento:**

- `next.config.ts` com `output: "standalone"`.
- `ecosystem.config.js` (PM2) versionado.
- `deploy/nginx.conf` de exemplo: reverse proxy para `localhost:3000`, gzip/brotli, cache de `/_next/static`, headers de segurança.
- `deploy/README.md` com o passo a passo.
- Scripts: `npm run deploy` (build + migrate deploy + pm2 reload).

**Passo a passo no servidor:**

1. Node 20+ LTS, `pm2 -g`, Nginx, Certbot.
2. Deploy key no GitHub; clonar em `/var/www/nakatenis`.
3. `.env.production` com permissão `600` (nunca no Git).
4. `npm ci && npx prisma migrate deploy && npm run build`.
5. `pm2 start ecosystem.config.js && pm2 save && pm2 startup`.
6. Nginx: server block para `nakatenis.com.br` e `www`, proxy para `:3000`.
7. `certbot --nginx` para HTTPS + redirect 80→443.
8. Firewall: liberar 80/443, fechar 3000 externamente.
9. Apontar o DNS do domínio na Hostinger para o IP da VPS.
10. Verificar `NEXT_PUBLIC_SITE_URL` com o domínio final — sitemap, canonical e links do WhatsApp dependem disso.

**Se acabar sendo hospedagem compartilhada:** ver o alerta do §2. A recomendação é Vercel + DNS na Hostinger.

---

## 12. Cronograma

| Fase | Escopo | Estimativa |
|---|---|---|
| 0 | Fundação | 0,5 dia |
| 1 | Dados + Prisma | 1 dia |
| 2 | Layout global | 1 dia |
| 3 | Catálogo | 2 dias |
| 4 | Carrinho + WhatsApp | 1 dia |
| 5 | Auth + conta | 1,5 dia |
| 6 | Admin | 2 dias |
| 7 | SEO/GEO | 1 dia |
| 8 | Prisma real | 1 dia |
| 9 | Deploy | 0,5 dia |
| | **Total** | **~11,5 dias** de trabalho efetivo |

---

## 13. Pontos em aberto para confirmar antes da Fase 0

1. **Hospedagem** — VPS ou compartilhada? Bloqueia a arquitetura (§2).
2. **Domínio** — `nakatenis.com.br` já está registrado?
3. **Marca** — existe logo? Se não, entra como sub-tarefa da Fase 0.
4. **Frete** — o site menciona frete em algum lugar ou isso é 100% combinado no WhatsApp? (Assumido: 100% no WhatsApp.)
5. **Notificações** — o ícone de sino do header: apenas visual por ora, ou precisa de conteúdo real (promoções, status de pedido)? (Assumido: visual, com dropdown de avisos cadastrados pelo admin em fase futura.)
6. **Variações de produto** — tênis tem numeração e roupa tem tamanho. Hoje o modelo trata isso como `specs` (informativo) e a escolha acontece no WhatsApp. Se o cliente precisar selecionar tamanho no site com estoque por tamanho, isso é um model `ProductVariant` a mais e mexe em Fase 1, 3, 4 e 6. **Vale decidir agora — é a mudança mais cara de fazer depois.**
