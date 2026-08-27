import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import Link from "next/link";
import { categoryRepo, productRepo } from "@/lib/data";
import {
  getCategoryBySlugCached,
  listCategoryPageCached,
} from "@/lib/data/cached";
import type { ProductSort } from "@/lib/data/types";
import { ProductGrid } from "@/components/product/product-card";
import { CatalogControls } from "@/components/product/catalog-controls";
import { Pagination } from "@/components/product/pagination";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EmptyState, Skeleton } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/lib/seo/JsonLd";
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/utils";

const PER_PAGE = 12;
const SORTS: ProductSort[] = ["relevance", "price-asc", "price-desc", "newest"];

type SearchParams = {
  pagina?: string;
  ordem?: string;
  min?: string;
  max?: string;
};

function parseParams(raw: SearchParams) {
  const page = Math.max(1, Number.parseInt(raw.pagina ?? "1", 10) || 1);
  const sort = (SORTS.includes(raw.ordem as ProductSort) ? raw.ordem : "relevance") as ProductSort;
  const minPrice = raw.min ? Number.parseInt(raw.min, 10) : undefined;
  const maxPrice = raw.max ? Number.parseInt(raw.max, 10) : undefined;
  return {
    page,
    sort,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
  };
}

function buildQuery(base: SearchParams, page: number) {
  const params = new URLSearchParams();
  if (base.ordem && base.ordem !== "relevance") params.set("ordem", base.ordem);
  if (base.min) params.set("min", base.min);
  if (base.max) params.set("max", base.max);
  if (page > 1) params.set("pagina", String(page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const raw = (await searchParams) as SearchParams;
  const category = await getCategoryBySlugCached(slug);
  if (!category) return buildMetadata({ title: "Categoria não encontrada", path: `/categoria/${slug}`, noIndex: true });

  const { page, sort, minPrice, maxPrice } = parseParams(raw);
  const basePath = `/categoria/${slug}`;
  // Mesmos argumentos da página → o cache() devolve a MESMA promessa: a
  // listagem é consultada uma única vez por requisição.
  const { totalPages } = await listCategoryPageCached(
    slug,
    page,
    PER_PAGE,
    sort,
    minPrice,
    maxPrice,
  );

  return buildMetadata({
    title: page > 1 ? `${category.name} — página ${page}` : category.name,
    description:
      category.description ??
      `Confira ${category.name.toLowerCase()} na NakaTenis. Pedido fechado pelo WhatsApp, com frete e pagamento combinados no atendimento.`,
    path: `${basePath}${buildQuery(raw, page)}`,
    prev: page > 1 ? absoluteUrl(`${basePath}${buildQuery(raw, page - 1)}`) : undefined,
    next:
      page < totalPages
        ? absoluteUrl(`${basePath}${buildQuery(raw, page + 1)}`)
        : undefined,
  });
}

export async function generateStaticParams() {
  const categories = await categoryRepo.list();
  return categories.map((category) => ({ slug: category.slug }));
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/categoria/[slug]">) {
  const { slug } = await params;
  const raw = (await searchParams) as SearchParams;
  const { page, sort, minPrice, maxPrice } = parseParams(raw);

  const category = await getCategoryBySlugCached(slug);
  if (!category || !category.isActive) notFound();

  const [result, priceRange] = await Promise.all([
    listCategoryPageCached(slug, page, PER_PAGE, sort, minPrice, maxPrice),
    productRepo.priceRange(slug),
  ]);

  const crumbs = [{ name: category.name, path: `/categoria/${slug}` }];

  return (
    <div className="space-y-6">
      <JsonLd
        data={[
          collectionPageJsonLd(category, `/categoria/${slug}`),
          breadcrumbJsonLd(crumbs),
          itemListJsonLd(result.items, `/categoria/${slug}`),
        ]}
      />

      <Breadcrumbs items={crumbs} />

      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {category.name}
        </h1>
        {category.description ? (
          <p className="max-w-3xl text-pretty text-[15px] leading-relaxed text-ink-muted">
            {category.description}
          </p>
        ) : null}
      </header>

      <Suspense fallback={<Skeleton className="h-14 w-full" />}>
        <CatalogControls total={result.total} priceRange={priceRange} />
      </Suspense>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<PackageSearch className="size-7" />}
          title="Nenhum produto nesta faixa de preço"
          description="Ajuste o filtro de preço ou veja a categoria inteira."
          action={
            <Button asChild>
              <Link href={`/categoria/${slug}`}>Ver todos de {category.name}</Link>
            </Button>
          }
        />
      ) : (
        <>
          <ProductGrid products={result.items} priorityCount={4} />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            buildHref={(target) => `/categoria/${slug}${buildQuery(raw, target)}`}
          />
        </>
      )}
    </div>
  );
}
