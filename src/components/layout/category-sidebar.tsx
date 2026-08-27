"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Backpack,
  Footprints,
  Shirt,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  racket: Tag,
  shoe: Footprints,
  shirt: Shirt,
  bag: Backpack,
};

export function CategoryNav({
  categories,
  onNavigate,
  className,
}: {
  categories: Category[];
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  // Feedback otimista: marca o item NO CLIQUE, sem esperar a navegação
  // terminar — é o que dá a sensação de resposta imediata no menu. O pendente
  // é limpo durante o render quando a rota efetivamente muda.
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setPendingHref(null);
  }

  return (
    <nav aria-label="Categorias" className={className}>
      <ul className="space-y-0.5">
        {categories.map((category) => {
          const href = `/categoria/${category.slug}`;
          const active = pendingHref ? pendingHref === href : pathname === href;
          const Icon = ICONS[category.icon ?? ""] ?? Tag;
          return (
            <li key={category.id}>
              <Link
                href={href}
                onClick={() => {
                  setPendingHref(href);
                  onNavigate?.();
                }}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-700 text-white shadow-sm"
                    : "text-brand-100 hover:bg-brand-700/60 hover:text-white",
                )}
              >
                <Icon
                  className={cn(
                    "size-[18px] shrink-0",
                    active ? "text-accent-400" : "text-brand-300",
                  )}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{category.name}</span>
                {typeof category.productCount === "number" ? (
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                      active
                        ? "bg-white/20 text-white"
                        : "bg-brand-950/40 text-brand-200",
                    )}
                  >
                    {category.productCount}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 rounded-xl bg-brand-950/40 p-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-accent-400">
          <Sparkles className="size-4" aria-hidden="true" />
          Não sabe qual escolher?
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-brand-200">
          Manda uma mensagem contando seu nível de jogo. A gente indica a raquete certa
          — não a mais cara.
        </p>
        <Link
          href="/quem-somos"
          onClick={onNavigate}
          className="mt-3 inline-block text-[13px] font-semibold text-white underline underline-offset-4 hover:text-accent-400"
        >
          Conheça a loja
        </Link>
      </div>
    </nav>
  );
}

/** Sidebar fixa do desktop. Abaixo de lg vira drawer (ver MobileNav). */
export function CategorySidebar({ categories }: { categories: Category[] }) {
  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-[10.5rem] overflow-hidden rounded-xl bg-brand-800 p-3 shadow-card">
        <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-brand-300">
          Categorias
        </p>
        <CategoryNav categories={categories} />
      </div>
    </aside>
  );
}
