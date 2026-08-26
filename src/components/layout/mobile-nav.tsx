"use client";

import Link from "next/link";
import { Home, Info, LogIn, MessageCircle, ShoppingCart } from "lucide-react";
import type { Category } from "@/lib/data/types";
import { useUiStore } from "@/stores/ui-store";
import { Drawer } from "@/components/ui/drawer";
import { whatsAppContactUrl } from "@/lib/whatsapp/build-message";
import { CategoryNav } from "./category-sidebar";

/** A sidebar de categorias vira drawer abaixo de lg. */
export function MobileNav({ categories }: { categories: Category[] }) {
  const open = useUiStore((s) => s.mobileNavOpen);
  const setMobileNav = useUiStore((s) => s.setMobileNav);
  const close = () => setMobileNav(false);

  return (
    <Drawer
      open={open}
      onClose={close}
      side="left"
      title="Categorias"
      description="Navegue pelo catálogo"
      className="bg-brand-900"
    >
      <div className="space-y-6 p-4">
        <CategoryNav categories={categories} onNavigate={close} />

        <div className="space-y-0.5 border-t border-white/10 pt-4">
          <MobileLink href="/" onClick={close} icon={<Home className="size-[18px]" />}>
            Início
          </MobileLink>
          <MobileLink
            href="/carrinho"
            onClick={close}
            icon={<ShoppingCart className="size-[18px]" />}
          >
            Meu carrinho
          </MobileLink>
          <MobileLink
            href="/quem-somos"
            onClick={close}
            icon={<Info className="size-[18px]" />}
          >
            Quem somos
          </MobileLink>
          <MobileLink
            href="/entrar"
            onClick={close}
            icon={<LogIn className="size-[18px]" />}
          >
            Entrar ou criar conta
          </MobileLink>
        </div>

        <a
          href={whatsAppContactUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg bg-success-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-success-700"
        >
          <MessageCircle className="size-[18px]" aria-hidden="true" />
          Falar no WhatsApp
        </a>
      </div>
    </Drawer>
  );
}

function MobileLink({
  href,
  icon,
  onClick,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-100 transition-colors hover:bg-brand-700/60 hover:text-white"
    >
      <span className="text-brand-300" aria-hidden="true">
        {icon}
      </span>
      {children}
    </Link>
  );
}
