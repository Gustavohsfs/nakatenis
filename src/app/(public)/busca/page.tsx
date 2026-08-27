import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { productRepo } from "@/lib/data";
import { getPublicCategories } from "@/lib/data/cached";
import type { Product, ProductSort } from "@/lib/data/types";
import { ProductGrid } from "@/components/product/product-card";
import { CatalogControls } from "@/components/product/catalog-controls";
import { Pagination } from "@/components/product/pagination";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EmptyState, Skeleton } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo/metadata";
import { normalize } from "@/lib/utils";

const PER_PAGE = 12;
const SORTS: ProductSort[] = ["relevance", "price-asc", "price-desc", "newest"];

type SearchParams = {
  q?: string;
  pagina?: string;
  ordem?: string;
  min?: string;
  max?: string;
};

export async function generateMetadata({
  searchParams,
}: PageProps<"/busca">): Promise<Metadata> {
  const raw = (await searchParams) as SearchParams;
  const query = (raw.q ?? "").trim();
  return buildMetadata({
    title: query ? `Busca por “${query}”` : "Busca",
    description: query
      ? `Resultados para “${query}” no catálogo da NakaTenis.`
      : "Busque raquetes, calçados, roupas e acessórios de tênis e beach tennis.",
    path: query ? `/busca?q=${encodeURIComponent(query)}` : "/busca",
    // Página de resultado não entra no índice: conteúdo duplicado da categoria.
    noIndex: true,
  });
}

export default async function SearchPage({ searchParams }: PageProps<"/busca">) {
  const raw = (await searchParams) as SearchParams;
  const query = (raw.q ?? "").trim();
  const page = Math.max(1, Number.parseInt(raw.pagina ?? "1", 10) || 1);
  const sort = (SORTS.includes(raw.ordem as ProductSort) ? raw.ordem : "relevance") as ProductSort;
  const minPrice = raw.min ? Number.parseInt(raw.min, 10) : undefined;
  const maxPrice = raw.max ? Number.parseInt(raw.max, 10) : undefined;

  const [result, categories, priceRange] = await Promise.all([
    query
      ? productRepo.search(query, { page, perPage: PER_PAGE, sort, minPrice, maxPrice })
      : Promise.resolve({
          items: [] as Product[],
          total: 0,
          page: 1,
          perPage: PER_PAGE,
          totalPages: 1,
        }),
    getPublicCategories(),
    productRepo.priceRange(),
  ]);

  function hrefFor(target: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (raw.ordem && raw.ordem !== "relevance") params.set("ordem", raw.ordem);
    if (raw.min) params.set("min", raw.min);
    if (raw.max) params.set("max", raw.max);
    if (target > 1) params.set("pagina", String(target));
    return `/busca?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ name: "Busca", path: "/busca" }]} />

      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {query ? (
            <>
              Resultados para{" "}
              <span className="text-brand-500">“{query}”</span>
            </>
          ) : (
            "O que você procura?"
          )}
        </h1>
        {query ? (
          <p className="text-[15px] text-ink-muted">
            {result.total === 0
              ? "Nenhum produto corresponde a essa busca."
              : `${result.total} ${result.total === 1 ? "produto encontrado" : "produtos encontrados"}.`}
          </p>
        ) : (
          <p className="text-[15px] text-ink-muted">
            Digite na barra de busca acima ou escolha uma categoria.
          </p>
        )}
      </header>

      {query && result.total > 0 ? (
        <Suspense fallback={<Skeleton className="h-14 w-full" />}>
          <CatalogControls total={result.total} priceRange={priceRange} />
        </Suspense>
      ) : null}

      {query && result.items.length > 0 ? (
        <>
          <ProductGrid products={result.items} priorityCount={4} />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            buildHref={hrefFor}
          />
        </>
      ) : (
        <EmptyState
          icon={<SearchX className="size-7" />}
          title={query ? "Nada encontrado por aqui" : "Comece pelas categorias"}
          description={
            query
              ? "Tente um termo mais curto — “raquete” em vez de “raquete de beach tennis de carbono”. Ou navegue pelas categorias abaixo."
              : "Escolha uma categoria para ver o catálogo completo."
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button key={category.id} variant="secondary" size="sm" asChild>
                  <Link href={`/categoria/${category.slug}`}>
                    {category.name}
                    <span className="text-ink-muted">
                      ({category.productCount ?? 0})
                    </span>
                  </Link>
                </Button>
              ))}
            </div>
          }
        />
      )}

      {query && result.items.length > 0 ? (
        <SearchHighlightNote query={query} items={result.items} />
      ) : null}
    </div>
  );
}

/** Explicita por que cada resultado apareceu — ajuda quando o match não é óbvio. */
function SearchHighlightNote({
  query,
  items,
}: {
  query: string;
  items: Product[];
}) {
  const normalized = normalize(query);
  const byBrand = items.filter((item) =>
    normalize(item.brand ?? "").includes(normalized),
  );
  if (byBrand.length === 0 || byBrand.length === items.length) return null;

  return (
    <p className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-[13.5px] text-brand-900">
      {byBrand.length} {byBrand.length === 1 ? "resultado" : "resultados"} correspondem à
      marca <strong>“{query}”</strong>. Os demais casam com o título ou a descrição.
    </p>
  );
}
