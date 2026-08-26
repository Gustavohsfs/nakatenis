"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/conta", label: "Meus dados", icon: User },
  { href: "/conta/endereco", label: "Endereços", icon: MapPin },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Minha conta" className="w-full sm:w-56 sm:shrink-0">
      <ul className="flex gap-1 overflow-x-auto sm:flex-col sm:overflow-visible">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-500 text-white shadow-brand"
                    : "text-ink-soft hover:bg-brand-50 hover:text-brand-700",
                )}
              >
                <link.icon className="size-4" aria-hidden="true" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
