import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { categoryRepo } from "@/lib/data";
import {
  getCategoryBySlugCached,
  getCategoryProductsCached,
} from "@/lib/data/cached";
import { CategoryBrowser } from "@/components/product/category-browser";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Skeleton } from "@/components/ui";
import { JsonLd } from "@/lib/seo/JsonLd";
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * ISR: esta página NÃO lê searchParams no servidor — de propósito. É isso que
 * a deixa estática/prefetchável, e o clique no menu vira navegação instantânea
 * de cache. Ordenação, faixa de preço e paginação acontecem no cliente
 * (CategoryBrowser) sobre a lista completa, sincronizando a URL via history
 * API — zero ida ao servidor por interação.
 */
export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlugCached(slug);
  if (!category) {
    return buildMetadata({
      title: "Categoria não encontrada",
      path: `/categoria/${slug}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: category.name,
    description:
      category.description ??
      `Confira ${category.name.toLowerCase()} na NakaTenis. Pedido fechado pelo WhatsApp, com frete e pagamento combinados no atendimento.`,
    path: `/categoria/${slug}`,
  });
}

export async function generateStaticParams() {
  const categories = await categoryRepo.list();
  return categories.map((category) => ({ slug: category.slug }));
}

export default async function CategoryPage({
  params,
}: PageProps<"/categoria/[slug]">) {
  const { slug } = await params;

  const [category, products] = await Promise.all([
    getCategoryBySlugCached(slug),
    getCategoryProductsCached(slug),
  ]);
  if (!category || !category.isActive) notFound();

  // Só os campos que o card usa viajam para o cliente — descrição longa,
  // paymentInfo e specs ficam de fora do payload.
  const cardProducts = products.map((product) => ({
    ...product,
    description: "",
    paymentInfo: "",
    specs: [],
    images: product.images.slice(0, 1),
  }));

  const crumbs = [{ name: category.name, path: `/categoria/${slug}` }];

  return (
    <div className="space-y-6">
      <JsonLd
        data={[
          collectionPageJsonLd(category, `/categoria/${slug}`),
          breadcrumbJsonLd(crumbs),
          itemListJsonLd(products, `/categoria/${slug}`),
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

      {/* useSearchParams no cliente exige Suspense em página estática. */}
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-14 w-full" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[3/4] w-full rounded-xl" />
              ))}
            </div>
          </div>
        }
      >
        <CategoryBrowser
          products={cardProducts}
          categoryName={category.name}
          categorySlug={slug}
        />
      </Suspense>
    </div>
  );
}
