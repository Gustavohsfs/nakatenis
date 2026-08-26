import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { categoryRepo, productRepo } from "@/lib/data";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/admin/produtos/[id]/editar">) {
  const { id } = await params;
  const product = await productRepo.getById(id);
  return { title: product ? `Editar ${product.title}` : "Produto não encontrado" };
}

export default async function EditProductPage({
  params,
}: PageProps<"/admin/produtos/[id]/editar">) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    productRepo.getById(id),
    categoryRepo.list({ includeInactive: true }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Editar produto
          </h1>
          <p className="text-[15px] text-ink-muted">
            Última alteração em {formatDate(product.updatedAt)}.
          </p>
        </div>
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/produto/${product.slug}`} target="_blank">
            <ExternalLink aria-hidden="true" />
            Ver na loja
          </Link>
        </Button>
      </header>

      <ProductForm categories={categories} product={product} />
    </div>
  );
}
