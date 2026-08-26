import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { categoryRepo, productRepo } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui";
import { ProductTable } from "@/components/admin/product-table";

export const metadata = { title: "Produtos" };

type SearchParams = { q?: string; categoria?: string; status?: string };

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/produtos">) {
  const raw = (await searchParams) as SearchParams;

  const [products, categories] = await Promise.all([
    productRepo.list({
      includeInactive: true,
      query: raw.q,
      categorySlug: raw.categoria,
      sort: "newest",
    }),
    categoryRepo.list({ includeInactive: true }),
  ]);

  const filtered =
    raw.status === "ativos"
      ? products.filter((p) => p.isActive)
      : raw.status === "inativos"
        ? products.filter((p) => !p.isActive)
        : products;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Produtos</h1>
          <p className="text-[15px] text-ink-muted">
            {filtered.length} {filtered.length === 1 ? "produto" : "produtos"} no
            catálogo.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus aria-hidden="true" />
            Novo produto
          </Link>
        </Button>
      </header>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <ProductTable products={filtered} categories={categories} />
      </Suspense>
    </div>
  );
}
