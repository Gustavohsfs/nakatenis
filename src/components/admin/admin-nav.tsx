"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FolderTree,
  Info,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: FolderTree },
  { href: "/admin/quem-somos", label: "Quem somos", icon: Info },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Painel" className="lg:w-56 lg:shrink-0">
      <ul className="flex gap-1 overflow-x-auto pb-1 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible lg:pb-0">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-500 text-white shadow-brand"
                    : "text-ink-soft hover:bg-white hover:text-brand-700 hover:shadow-card",
                )}
              >
                <link.icon className="size-4" aria-hidden="true" />
                {link.label}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0 lg:mt-3">
          <Button size="sm" block asChild>
            <Link href="/admin/produtos/novo">
              <Plus aria-hidden="true" />
              Novo produto
            </Link>
          </Button>
        </li>
      </ul>
    </nav>
  );
}

export function AdminSignOut() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/" })}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-brand-200 transition-colors hover:bg-white/10 hover:text-white"
    >
      <LogOut className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">Sair</span>
    </button>
  );
}
