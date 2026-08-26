---
name: nakatenis-seo
description: Use ao criar uma rota pública nova no NakaTenis — carrega o padrão de generateMetadata, o JSON-LD por tipo de página, canonical, Open Graph e a entrada no sitemap.
---

# SEO e GEO no NakaTenis

## Checklist de rota pública nova

1. `generateMetadata` (ou `export const metadata`) usando `buildMetadata` de `@/lib/seo/metadata` — ele já cuida de canonical, Open Graph, Twitter Card e `metadataBase`.
2. JSON-LD apropriado via `<JsonLd data={...} />` de `@/lib/seo/JsonLd`.
3. Entrada em `src/app/sitemap.ts` se a rota for indexável.
4. `noIndex: true` em rotas de conta, carrinho, admin e resultado de busca.
5. Um único `<h1>` por página.
6. Conteúdo **renderizado no servidor**. Crawlers de IA em geral não executam JS — nada de texto essencial vindo só de Client Component.

## `buildMetadata`

```ts
export async function generateMetadata({ params }: PageProps<"/rota/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await repo.getBySlug(slug);
  if (!item) return buildMetadata({ title: "Não encontrado", path: `/rota/${slug}`, noIndex: true });
  return buildMetadata({
    title: item.metaTitle ?? item.title,     // template "%s | NakaTenis" vem do root layout
    description: item.metaDescription ?? item.shortDescription,
    path: `/rota/${item.slug}`,
    images: item.images.map((i) => ({ url: i.url, alt: i.alt })),
  });
}
```

Em rota paginada, passe `prev` / `next` com URLs absolutas (`absoluteUrl`).

## JSON-LD por tipo de página

| Página | Blocos |
|---|---|
| Todas (root layout) | `Store` (Organization) + `WebSite` com `SearchAction` |
| Home | `ItemList` dos destaques + `FAQPage` |
| Categoria | `CollectionPage` + `BreadcrumbList` + `ItemList` |
| PDP | `Product` (com `offers`: `price`, `priceCurrency: BRL`, `availability`, `url`, `priceValidUntil`) + `BreadcrumbList` + `FAQPage` |
| Quem somos | `AboutPage` + `BreadcrumbList` |

Builders prontos em `@/lib/seo/json-ld`.

**Nunca marcar `AggregateRating` ou `Review`.** Sem checkout no site não há como sustentar isso, e marcação falsa é penalizada pelo Google.

## Imagens

`next/image` com `sizes` correto. `priority` só na imagem principal da PDP e nos primeiros cards acima da dobra (`priorityCount` no `ProductGrid`). Todo `<Image>` precisa de `alt` — vazio (`alt=""`) quando for decorativa e o texto já estiver no link ao lado.

## GEO (descoberta por IAs)

- `public/llms.txt` descreve a loja, categorias, faixa de preço, região atendida e como comprar. **Atualize ao adicionar uma categoria.**
- Descrições de produto com **entidades explícitas** ("raquete de beach tennis em fibra de carbono 12K, 340 g, formato híbrido") em vez de marketing vago. É isso que faz o produto ser citável por um LLM.
- FAQ com `FAQPage` na home e na PDP — formato que modelos extraem bem.
- `quem-somos` com nome do dono, cidade, tempo de mercado e especialidade: ancoragem de entidade local.

## Verificação

- Rich Results Test valida `Product` e `BreadcrumbList` na PDP.
- `/sitemap.xml` lista todas as URLs públicas ativas.
- `/robots.txt` libera tudo exceto `/admin`, `/conta`, `/api` e `/busca`.
