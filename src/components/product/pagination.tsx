import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Paginação server-side: cada página é uma URL própria, indexável. */
export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-1.5 pt-2">
      <PageLink
        href={buildHref(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </PageLink>

      {pages.map((item, index) =>
        item === "…" ? (
          <span
            key={`gap-${index}`}
            className="px-1 text-sm text-ink-muted"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <PageLink
            key={item}
            href={buildHref(item)}
            current={item === page}
            aria-label={`Página ${item}`}
          >
            {item}
          </PageLink>
        ),
      )}

      <PageLink
        href={buildHref(page + 1)}
        disabled={page >= totalPages}
        aria-label="Próxima página"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  current,
  disabled,
  children,
  ...props
}: {
  href: string;
  current?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.ComponentProps<"a">) {
  const className = cn(
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-[13.5px] font-medium tabular-nums transition-colors",
    current
      ? "border-brand-500 bg-brand-500 text-white shadow-brand"
      : "border-line bg-surface text-ink-soft hover:border-brand-300 hover:text-brand-700",
    disabled && "pointer-events-none opacity-40",
  );

  if (disabled) {
    return (
      <span className={className} aria-disabled="true" {...props}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      aria-current={current ? "page" : undefined}
      {...props}
    >
      {children}
    </Link>
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
