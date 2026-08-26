import { categoryRepo } from "@/lib/data";
import { ProductForm } from "@/components/admin/product-form";
import { Alert } from "@/components/ui";

export const metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  const categories = await categoryRepo.list({ includeInactive: true });

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Novo produto</h1>
        <p className="text-[15px] text-ink-muted">
          Ao salvar, o produto entra na categoria escolhida — na sidebar e na listagem —
          sem passo manual.
        </p>
      </header>

      {categories.length === 0 ? (
        <Alert variant="warning">
          Cadastre ao menos uma categoria antes de criar um produto.
        </Alert>
      ) : (
        <ProductForm categories={categories} />
      )}
    </div>
  );
}
