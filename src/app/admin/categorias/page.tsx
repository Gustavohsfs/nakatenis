import { categoryRepo } from "@/lib/data";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata = { title: "Categorias" };

export default async function AdminCategoriesPage() {
  const categories = await categoryRepo.list({
    includeInactive: true,
    withCounts: true,
  });

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Categorias</h1>
        <p className="text-[15px] text-ink-muted">
          A ordem define a sidebar da loja. Categoria com produtos não pode ser excluída
          — mova os produtos antes.
        </p>
      </header>

      <CategoryManager categories={categories} />
    </div>
  );
}
