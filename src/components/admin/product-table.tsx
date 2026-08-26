"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { ExternalLink, ImageOff, Pencil, Search, Trash2 } from "lucide-react";
import { Badge, Card, EmptyState, Input, Select, Switch } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useUiStore } from "@/stores/ui-store";
import { formatBRL, getDiscount } from "@/lib/pricing";
import type { Category, Product } from "@/lib/data/types";
import { deleteProductAction, toggleProductActiveAction } from "@/app/admin/actions";

export function ProductTable({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useUiStore((s) => s.toast);
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const value = params.toString();
    router.push(value ? `${pathname}?${value}` : pathname);
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <form
            className="relative flex-1 sm:max-w-xs"
            onSubmit={(event) => {
              event.preventDefault();
              pushParams((params) => {
                if (query.trim()) params.set("q", query.trim());
                else params.delete("q");
              });
            }}
          >
            <label htmlFor="admin-busca" className="sr-only">
              Buscar produto
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <Input
              id="admin-busca"
              className="h-9 pl-9 text-[13px]"
              placeholder="Buscar por título, marca ou SKU"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>

          <Select
            className="h-9 w-44 text-[13px]"
            aria-label="Filtrar por categoria"
            value={searchParams.get("categoria") ?? ""}
            onChange={(event) =>
              pushParams((params) => {
                if (event.target.value) params.set("categoria", event.target.value);
                else params.delete("categoria");
              })
            }
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>

          <Select
            className="h-9 w-36 text-[13px]"
            aria-label="Filtrar por status"
            value={searchParams.get("status") ?? ""}
            onChange={(event) =>
              pushParams((params) => {
                if (event.target.value) params.set("status", event.target.value);
                else params.delete("status");
              })
            }
          >
            <option value="">Todos</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </Select>
        </div>

        {products.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Search className="size-7" />}
              title="Nenhum produto encontrado"
              description="Ajuste a busca ou os filtros acima."
              action={
                <Button variant="secondary" onClick={() => router.push(pathname)}>
                  Limpar filtros
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[54rem] text-sm">
              <caption className="sr-only">Produtos cadastrados</caption>
              <thead className="bg-surface-alt text-left text-[12px] uppercase tracking-wide text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold">
                    Produto
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">
                    Categoria
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                    Preço
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                    Estoque
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">
                    Ativo
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((product) => {
                  const discount = getDiscount(product.price, product.compareAtPrice);
                  return (
                    <tr key={product.id} className="hover:bg-surface-alt/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-sunken">
                            {product.images[0] ? (
                              <Image
                                src={product.images[0].url}
                                alt=""
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="grid h-full place-items-center text-ink-muted">
                                <ImageOff className="size-4" aria-hidden="true" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">
                              {product.title}
                            </p>
                            <p className="truncate text-[12.5px] text-ink-muted">
                              {product.brand ?? "sem marca"} · {product.sku ?? "sem SKU"}
                            </p>
                          </div>
                          {product.isFeatured ? (
                            <Badge variant="new" size="sm" className="shrink-0">
                              destaque
                            </Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {product.category.name}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-ink tabular-nums">
                          {formatBRL(product.price)}
                        </span>
                        {discount !== null ? (
                          <Badge variant="discount" size="sm" className="ml-2">
                            -{discount}%
                          </Badge>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span
                          className={
                            product.stock <= 0
                              ? "font-semibold text-danger-600"
                              : product.stock <= 3
                                ? "font-semibold text-accent-700"
                                : "text-ink-soft"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Switch
                          checked={product.isActive}
                          disabled={pending}
                          aria-label={`${product.isActive ? "Desativar" : "Ativar"} ${product.title}`}
                          onChange={(event) => {
                            const next = event.target.checked;
                            startTransition(async () => {
                              const result = await toggleProductActiveAction(
                                product.id,
                                next,
                              );
                              toast({
                                variant: result.ok ? "success" : "danger",
                                title: result.message ?? "Erro",
                              });
                              router.refresh();
                            });
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="icon-sm" asChild>
                            <Link
                              href={`/produto/${product.slug}`}
                              target="_blank"
                              aria-label={`Ver ${product.title} na loja`}
                            >
                              <ExternalLink />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon-sm" asChild>
                            <Link
                              href={`/admin/produtos/${product.id}/editar`}
                              aria-label={`Editar ${product.title}`}
                            >
                              <Pencil />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-danger-600 hover:bg-danger-50"
                            onClick={() => setConfirmDelete(product)}
                            aria-label={`Excluir ${product.title}`}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Excluir este produto?"
        description={
          confirmDelete ? (
            <>
              <strong>{confirmDelete.title}</strong> será removido do catálogo, junto com{" "}
              {confirmDelete.images.length} imagem(ns) no storage. Não dá para desfazer.
            </>
          ) : undefined
        }
        confirmLabel="Excluir produto"
        pending={pending}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          const target = confirmDelete;
          if (!target) return;
          startTransition(async () => {
            const result = await deleteProductAction(target.id);
            toast({
              variant: result.ok ? "success" : "danger",
              title: result.message ?? "Erro ao excluir",
            });
            setConfirmDelete(null);
            router.refresh();
          });
        }}
      />
    </>
  );
}
