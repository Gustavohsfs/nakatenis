import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  ImageOff,
  Package,
  PackageX,
  Percent,
  Plus,
  Star,
} from "lucide-react";
import { categoryRepo, productRepo } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from "@/components/ui";
import { formatBRL } from "@/lib/pricing";

export const metadata = { title: "Visão geral" };

export default async function AdminDashboard() {
  const [stats, categories, withoutImage, lowStock] = await Promise.all([
    productRepo.stats(),
    categoryRepo.list({ includeInactive: true, withCounts: true }),
    productRepo.list({ includeInactive: true }),
    productRepo.list({ includeInactive: true }),
  ]);

  const missingImages = withoutImage.filter((p) => p.images.length === 0).slice(0, 5);
  const runningOut = lowStock
    .filter((p) => p.isActive && p.stock > 0 && p.stock <= 3)
    .slice(0, 5);

  const cards = [
    { label: "Produtos", value: stats.totalProducts, icon: Package, tone: "brand" },
    { label: "Ativos", value: stats.activeProducts, icon: Boxes, tone: "success" },
    { label: "Em destaque", value: stats.featuredProducts, icon: Star, tone: "accent" },
    { label: "Com desconto", value: stats.discounted, icon: Percent, tone: "brand" },
    { label: "Sem imagem", value: stats.withoutImage, icon: ImageOff, tone: "danger" },
    { label: "Sem estoque", value: stats.outOfStock, icon: PackageX, tone: "danger" },
  ] as const;

  const toneClass = {
    brand: "bg-brand-50 text-brand-600",
    success: "bg-success-50 text-success-600",
    accent: "bg-accent-100 text-accent-700",
    danger: "bg-danger-50 text-danger-600",
  } as const;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Visão geral</h1>
          <p className="text-[15px] text-ink-muted">
            O estado do catálogo em uma tela.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus aria-hidden="true" />
            Novo produto
          </Link>
        </Button>
      </header>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <li
            key={card.label}
            className="rounded-xl border border-line bg-surface p-4 shadow-card"
          >
            <span
              className={`grid size-9 place-items-center rounded-lg ${toneClass[card.tone]}`}
            >
              <card.icon className="size-[18px]" aria-hidden="true" />
            </span>
            <p className="mt-3 text-2xl font-bold tabular-nums text-ink">{card.value}</p>
            <p className="text-[13px] text-ink-muted">{card.label}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produtos por categoria</CardTitle>
            <CardDescription>
              A ordem aqui é a mesma da sidebar da loja.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map((category) => {
              const count =
                stats.byCategory.find((item) => item.categoryId === category.id)
                  ?.count ?? 0;
              const percent =
                stats.totalProducts > 0
                  ? Math.round((count / stats.totalProducts) * 100)
                  : 0;
              return (
                <div key={category.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-[13.5px]">
                    <Link
                      href={`/admin/produtos?categoria=${category.slug}`}
                      className="font-medium text-ink hover:text-brand-700"
                    >
                      {category.name}
                      {!category.isActive ? (
                        <Badge variant="neutral" size="sm" className="ml-2">
                          inativa
                        </Badge>
                      ) : null}
                    </Link>
                    <span className="tabular-nums text-ink-muted">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageOff className="size-4 text-danger-600" aria-hidden="true" />
                Produtos sem imagem
              </CardTitle>
              <CardDescription>
                Sem foto, o produto aparece com placeholder na vitrine.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {missingImages.length === 0 ? (
                <p className="text-[13.5px] text-ink-muted">
                  Todos os produtos têm imagem. 👌
                </p>
              ) : (
                <ul className="space-y-2">
                  {missingImages.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/admin/produtos/${product.id}/editar`}
                        className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-[13.5px] transition-colors hover:bg-surface-alt"
                      >
                        <span className="truncate font-medium text-ink">
                          {product.title}
                        </span>
                        <span className="shrink-0 text-brand-500">Adicionar foto →</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-accent-600" aria-hidden="true" />
                Estoque acabando
              </CardTitle>
              <CardDescription>3 unidades ou menos.</CardDescription>
            </CardHeader>
            <CardContent>
              {runningOut.length === 0 ? (
                <p className="text-[13.5px] text-ink-muted">
                  Nenhum produto na reserva.
                </p>
              ) : (
                <ul className="space-y-2">
                  {runningOut.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/admin/produtos/${product.id}/editar`}
                        className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-[13.5px] transition-colors hover:bg-surface-alt"
                      >
                        <span className="min-w-0 truncate font-medium text-ink">
                          {product.title}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="text-ink-muted tabular-nums">
                            {formatBRL(product.price)}
                          </span>
                          <Badge variant="danger" size="sm">
                            {product.stock} un.
                          </Badge>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
