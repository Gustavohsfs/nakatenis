---
name: nakatenis-design-system
description: Use ao criar ou alterar qualquer componente de UI do NakaTenis — carrega tokens de cor, escala tipográfica, regras de contraste, anatomia de ProductCard e PriceBlock e breakpoints.
---

# Design system do NakaTenis

**Direção:** azul institucional na navegação (header, sidebar, footer, estados ativos), branco/neutro claro na área de conteúdo onde os produtos respiram. Contraste alto em preço e desconto — é o que o olho precisa achar primeiro.

## Tokens

Definidos em `@theme` no `src/app/globals.css` (Tailwind v4 — não existe `tailwind.config`). Use as classes utilitárias geradas, nunca hex solto no JSX.

| Classe | Hex | Uso |
|---|---|---|
| `brand-950` | `#06172C` | faixa de utilidades, header do admin |
| `brand-900` | `#0B2545` | header e footer |
| `brand-800` | `#0E3157` | sidebar de categorias |
| `brand-700` | `#12406E` | hover de nav, estado ativo |
| `brand-500` | `#1B6CA8` | botões primários, links |
| `brand-100` | `#E6F0F8` | fundos de destaque suave, chips |
| `accent-500` | `#F2A93B` | CTA secundário, badge "novo" |
| `success-600` | `#15803D` | badge de desconto, WhatsApp, economia |
| `danger-600` | `#B91C1C` | erros, remoção |
| `surface` | `#FFFFFF` | cards e área de conteúdo |
| `surface-alt` | `#F5F7FA` | fundo da página |
| `surface-sunken` | `#EEF2F7` | placeholder de imagem |
| `line` / `line-strong` | `#E2E8F0` / `#CBD5E1` | bordas |
| `ink` / `ink-soft` / `ink-muted` | `#0F172A` / `#334155` / `#64748B` | texto |

Sombras: `shadow-card`, `shadow-card-hover`, `shadow-elevated`, `shadow-nav`, `shadow-brand`, `shadow-accent`.

## Regras não negociáveis

- **Preço atual**: maior peso visual da página depois do título. **Preço antigo**: `line-through`, `text-ink-muted`, tamanho menor.
- **Badge de desconto**: `bg-success-600`, texto branco, formato `-51%`. Nunca inventar desconto — só quando `compareAtPrice > price`.
- **Contraste AA (4.5:1)**: `brand-500` sobre branco passa; `brand-500` sobre `brand-100` **não** passa para texto pequeno — usar `brand-900`.
- **Tipografia**: Inter (`--font-sans`), pesos 400/500/600/700. Uma família só.
- **Radius**: `rounded-lg` (8px) padrão, `rounded-xl` em cards, `rounded-2xl` em blocos hero.
- **Sombra**: card = `border border-line` + `shadow-card`. Nunca empilhar sombra forte com borda.
- **Mobile-first**. A sidebar de categorias vira drawer abaixo de `lg`.
- Todo ícone decorativo leva `aria-hidden="true"`; toda imagem leva `alt` (vazio se decorativa).
- Foco visível é global (`:focus-visible` no `globals.css`) — não remover `outline`.

## Componentes prontos (reuse antes de criar)

- `@/components/ui/button` — variantes `primary | accent | whatsapp | secondary | ghost | ghost-light | outline | danger | danger-soft | link`; tamanhos `sm | md | lg | icon | icon-sm`; `asChild` para envolver `<Link>`.
- `@/components/ui` — `Card*`, `Badge`, `Input`, `Textarea`, `Select`, `Label`, `Field`, `FieldError`, `FieldHint`, `Alert`, `Skeleton`, `Switch`, `SectionTitle`, `EmptyState`.
- `@/components/ui/drawer` — painel lateral acessível (Esc, trap de foco, trava de scroll).
- `@/components/ui/confirm-dialog` — confirmação de ação destrutiva.
- `@/components/product/price-block` — `PriceBlock` e `DiscountBadge`. **Todo preço da vitrine passa por aqui.**

## Anatomia do ProductCard

`aspect-square` de imagem sobre `surface-sunken` → badges no canto superior esquerdo (desconto, depois "Novo") → marca em caixa alta `brand-500` → título 2 linhas → descrição curta 2 linhas → `PriceBlock` → aviso de estoque baixo → `AddToCartButton` secundário. O card inteiro é clicável via `after:absolute after:inset-0` no link do título; ações internas precisam de `relative z-10`.

## Breakpoints testados

360px, 768px, 1440px. Grid de produtos: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`.
