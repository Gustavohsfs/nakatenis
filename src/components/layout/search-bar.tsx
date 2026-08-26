"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function SearchBar({
  className,
  autoFocus = false,
  onSubmitted,
}: {
  className?: string;
  autoFocus?: boolean;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";
  const [value, setValue] = useState(queryFromUrl);
  const [lastQuery, setLastQuery] = useState(queryFromUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ao navegar entre páginas de busca, o campo acompanha a URL. Ajuste feito na
  // renderização em vez de num efeito, para não disparar render em cascata.
  if (queryFromUrl !== lastQuery) {
    setLastQuery(queryFromUrl);
    setValue(queryFromUrl);
  }

  return (
    <form
      role="search"
      className={cn("relative flex w-full items-center", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const query = value.trim();
        if (!query) {
          inputRef.current?.focus();
          return;
        }
        router.push(`/busca?q=${encodeURIComponent(query)}`);
        onSubmitted?.();
      }}
    >
      <label htmlFor="busca-global" className="sr-only">
        Buscar produtos
      </label>
      <Search
        className="pointer-events-none absolute left-3.5 size-[18px] text-ink-muted"
        aria-hidden="true"
      />
      <input
        id="busca-global"
        ref={inputRef}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar raquete, tênis, camiseta…"
        className="h-11 w-full rounded-lg border border-transparent bg-white pl-11 pr-20 text-sm text-ink shadow-[0_2px_8px_rgba(11,37,69,0.18)] outline-none transition-all placeholder:text-ink-muted/80 focus:border-accent-400 focus:ring-4 focus:ring-accent-500/25 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
          }}
          aria-label="Limpar busca"
          className="absolute right-[4.25rem] rounded-md p-1 text-ink-muted transition-colors hover:text-ink"
        >
          <X className="size-4" />
        </button>
      ) : null}
      <button
        type="submit"
        className="absolute right-1.5 h-8 rounded-md bg-brand-500 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-brand-600"
      >
        Buscar
      </button>
    </form>
  );
}
