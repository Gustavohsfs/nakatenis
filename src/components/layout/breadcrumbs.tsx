import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type Crumb = { name: string; path: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Você está aqui" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-1 text-[13px] text-ink-muted">
        <li className="flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-1 rounded transition-colors hover:text-brand-700"
          >
            <Home className="size-3.5" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Início</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.path} className="flex min-w-0 items-center gap-1">
              <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
              {last ? (
                <span className="truncate font-medium text-ink-soft" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="truncate transition-colors hover:text-brand-700"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
