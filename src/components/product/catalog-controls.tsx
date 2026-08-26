"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, Label, Input } from "@/components/ui";
import { formatBRL, parseBRLToCents } from "@/lib/pricing";
import type { ProductSort } from "@/lib/data/types";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "relevance", label: "Relevância" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
  { value: "newest", label: "Novidades" },
];

export function CatalogControls({
  total,
  priceRange,
}: {
  total: number;
  priceRange: { min: number; max: number };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get("ordem") as ProductSort) ?? "relevance";
  const currentMin = searchParams.get("min");
  const currentMax = searchParams.get("max");

  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(currentMin ? formatBRL(Number(currentMin)) : "");
  const [max, setMax] = useState(currentMax ? formatBRL(Number(currentMax)) : "");
  const [lastRange, setLastRange] = useState(`${currentMin}|${currentMax}`);

  // Ajuste durante a renderização: os campos acompanham a URL quando o filtro
  // muda por navegação (voltar/avançar), sem efeito e sem render em cascata.
  const range = `${currentMin}|${currentMax}`;
  if (range !== lastRange) {
    setLastRange(range);
    setMin(currentMin ? formatBRL(Number(currentMin)) : "");
    setMax(currentMax ? formatBRL(Number(currentMax)) : "");
  }

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("pagina"); // qualquer mudança de filtro volta para a página 1
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const hasPriceFilter = Boolean(currentMin || currentMax);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-card">
        <p className="text-[13.5px] text-ink-muted">
          <strong className="font-semibold text-ink tabular-nums">{total}</strong>{" "}
          {total === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant={hasPriceFilter ? "primary" : "outline"}
            size="sm"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <SlidersHorizontal aria-hidden="true" />
            Faixa de preço
          </Button>

          <Label htmlFor="ordenacao" className="sr-only sm:not-sr-only sm:text-[13px]">
            Ordenar por
          </Label>
          <Select
            id="ordenacao"
            className="h-9 w-40 text-[13px]"
            value={currentSort}
            onChange={(event) =>
              pushParams((params) => {
                if (event.target.value === "relevance") params.delete("ordem");
                else params.set("ordem", event.target.value);
              })
            }
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {open ? (
        <form
          className="animate-fade-up flex flex-wrap items-end gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            pushParams((params) => {
              const minCents = parseBRLToCents(min);
              const maxCents = parseBRLToCents(max);
              if (minCents > 0) params.set("min", String(minCents));
              else params.delete("min");
              if (maxCents > 0) params.set("max", String(maxCents));
              else params.delete("max");
            });
            setOpen(false);
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="preco-min" className="text-[13px]">
              De
            </Label>
            <Input
              id="preco-min"
              inputMode="decimal"
              className="h-9 w-32 text-[13px]"
              placeholder={formatBRL(priceRange.min)}
              value={min}
              onChange={(event) => setMin(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="preco-max" className="text-[13px]">
              Até
            </Label>
            <Input
              id="preco-max"
              inputMode="decimal"
              className="h-9 w-32 text-[13px]"
              placeholder={formatBRL(priceRange.max)}
              value={max}
              onChange={(event) => setMax(event.target.value)}
            />
          </div>
          <Button type="submit" size="sm">
            Aplicar
          </Button>
          {hasPriceFilter ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setMin("");
                setMax("");
                pushParams((params) => {
                  params.delete("min");
                  params.delete("max");
                });
                setOpen(false);
              }}
            >
              <X aria-hidden="true" />
              Limpar
            </Button>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
