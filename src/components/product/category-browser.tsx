"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import type { Product, ProductSort } from "@/lib/data/types";
import { ProductGrid } from "@/components/product/product-card";
import { CatalogControls, type CatalogState } from "@/components/product/catalog-controls";
import { EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PER_PAGE = 12;
const SORTS: ProductSort[] = ["relevance", "price-asc", "price-desc", "newest"];

/**
 * Navegação da categoria 100% no cliente.
 *
 * A página recebe TODOS os produtos da categoria já prontos do cache (ISR) e
 * ordena/filtra/pagina aqui, sem nenhuma ida ao servidor — no porte deste
 * catálogo isso é instantâneo, e é o que faz o clique responder na hora mesmo
 * com a origem da Hostinger a ~400ms de distância.
 *
 * A URL continua sendo a fonte da verdade compartilhável: mudanças de estado
 * escrevem em history.pushState/replaceState, que o Next sincroniza com
 * useSearchParams sem requisição.
 */
export function CategoryBrowser({
  products,
  categoryName,
  categorySlug,
}: {
  products: Product[];
  categoryName: string;
  categorySlug: string;
}) {
  const searchParams = useSearchParams();

  const [state, setState] = useState<CatalogState>(() => readState(searchParams));
  const [page, setPage] = useState(() => readPage(searchParams));

  // Voltar/avançar do navegador: a URL mudou por fora, re-lê durante o render
  // (sem efeito, sem render em cascata) — mesmo padrão do search-bar.
  const paramsKey = searchParams.toString();
  const [lastParamsKey, setLastParamsKey] = useState(paramsKey);
  if (paramsKey !== lastParamsKey) {
    setLastParamsKey(paramsKey);
    setState(readState(searchParams));
    setPage(readPage(searchParams));
  }

  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const filtered = useMemo(() => {
    let items = products;
    if (state.min !== null) items = items.filter((p) => p.price >= state.min!);
    if (state.max !== null) items = items.filter((p) => p.price <= state.max!);
    return sortProducts(items, state.sort);
  }, [products, state]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const visible = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function writeUrl(next: CatalogState, nextPage: number, push: boolean) {
    const params = new URLSearchParams();
    if (next.sort !== "relevance") params.set("ordem", next.sort);
    if (next.min !== null) params.set("min", String(next.min));
    if (next.max !== null) params.set("max", String(next.max));
    if (nextPage > 1) params.set("pagina", String(nextPage));
    const query = params.toString();
    const url = query ? `/categoria/${categorySlug}?${query}` : `/categoria/${categorySlug}`;
    // history API nativa: o Next sincroniza useSearchParams sem ir ao servidor.
    if (push) window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }

  function handleControlsChange(next: CatalogState) {
    setState(next);
    setPage(1);
    writeUrl(next, 1, false);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    writeUrl(state, nextPage, true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-6">
      <CatalogControls
        total={filtered.length}
        priceRange={priceRange}
        value={state}
        onValueChange={handleControlsChange}
      />

      {visible.length === 0 ? (
        <EmptyState
          icon={<PackageSearch className="size-7" />}
          title="Nenhum produto nesta faixa de preço"
          description="Ajuste o filtro de preço ou veja a categoria inteira."
          action={
            <Button
              onClick={() =>
                handleControlsChange({ sort: state.sort, min: null, max: null })
              }
            >
              Ver todos de {categoryName}
            </Button>
          }
        />
      ) : (
        <>
          <ProductGrid products={visible} priorityCount={4} />
          <ClientPagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Rede de segurança para JS desligado: as âncoras de paginação existem
          no HTML via <noscript>, apontando para a mesma URL compartilhável. */}
      <noscript>
        {totalPages > 1 ? (
          <p>
            <Link href={`/categoria/${categorySlug}`}>Ver todos os produtos</Link>
          </p>
        ) : null}
      </noscript>
    </div>
  );
}

function readState(params: URLSearchParams | { get(name: string): string | null }): CatalogState {
  const sort = params.get("ordem") as ProductSort | null;
  const min = Number.parseInt(params.get("min") ?? "", 10);
  const max = Number.parseInt(params.get("max") ?? "", 10);
  return {
    sort: sort && SORTS.includes(sort) ? sort : "relevance",
    min: Number.isFinite(min) && min > 0 ? min : null,
    max: Number.isFinite(max) && max > 0 ? max : null,
  };
}

function readPage(params: { get(name: string): string | null }) {
  const page = Number.parseInt(params.get("pagina") ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

/** Mesma ordem de relevância dos repositórios — mantida em espelho. */
function sortProducts(items: Product[], sort: ProductSort) {
  const sorted = [...items];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "newest":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    default:
      return sorted.sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        const aDiscount = a.compareAtPrice && a.compareAtPrice > a.price ? 1 : 0;
        const bDiscount = b.compareAtPrice && b.compareAtPrice > b.price ? 1 : 0;
        if (aDiscount !== bDiscount) return bDiscount - aDiscount;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }
}

function ClientPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const items = pageWindow(page, totalPages);

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-1.5 pt-2">
      <PageButton
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Página anterior"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </PageButton>

      {items.map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} className="px-1 text-sm text-ink-muted" aria-hidden="true">
            …
          </span>
        ) : (
          <PageButton
            key={item}
            current={item === page}
            onClick={() => onPageChange(item)}
            aria-label={`Página ${item}`}
          >
            {item}
          </PageButton>
        ),
      )}

      <PageButton
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Próxima página"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </PageButton>
    </nav>
  );
}

function PageButton({
  current,
  disabled,
  children,
  ...props
}: {
  current?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={current ? "page" : undefined}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-[13.5px] font-medium tabular-nums transition-colors",
        current
          ? "border-brand-500 bg-brand-500 text-white shadow-brand"
          : "border-line bg-surface text-ink-soft hover:border-brand-300 hover:text-brand-700",
        disabled && "pointer-events-none opacity-40",
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function pageWindow(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const items: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) items.push("…");
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < totalPages - 1) items.push("…");
  items.push(totalPages);
  return items;
}
