import Link from "next/link";
import { Suspense } from "react";
import { MapPin, MessageCircle, Truck } from "lucide-react";
import { getPublicCategories } from "@/lib/data/cached";
import { getSessionUser } from "@/lib/auth/guards";
import { whatsAppContactUrl } from "@/lib/whatsapp/build-message";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";
import {
  AccountMenu,
  CartButton,
  MobileNavButton,
  NotificationsMenu,
} from "./header-actions";

/**
 * Faixa azul institucional (--brand-900) com busca central expansível,
 * avisos, carrinho e menu de conta. Abaixo, a trilha de categorias no desktop.
 */
export async function Header() {
  const [categories, user] = await Promise.all([
    getPublicCategories(),
    getSessionUser(),
  ]);

  return (
    <header className="sticky top-0 z-50 bg-brand-900 shadow-nav">
      {/* Faixa de utilidades */}
      <div className="hidden border-b border-white/10 bg-brand-950 lg:block">
        <div className="mx-auto flex h-9 max-w-[92rem] items-center justify-between gap-6 px-4 text-[12.5px] text-brand-200 xl:px-6">
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden="true" />
            Santa Fé do Sul/SP — retirada na loja ou envio para todo o Brasil
          </p>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Truck className="size-3.5" aria-hidden="true" />
              Frete combinado no atendimento
            </span>
            <a
              href={whatsAppContactUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-medium text-white transition-colors hover:text-accent-400"
            >
              <MessageCircle className="size-3.5" aria-hidden="true" />
              (17) 99181-4042
            </a>
          </div>
        </div>
      </div>

      {/* Barra principal */}
      <div className="mx-auto flex h-16 max-w-[92rem] items-center gap-3 px-4 xl:px-6">
        <MobileNavButton />
        <Logo />

        <div className="mx-auto hidden w-full max-w-2xl md:block">
          <Suspense fallback={<div className="h-11 rounded-lg bg-white/10" />}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-0.5 md:ml-0">
          <NotificationsMenu />
          <CartButton />
          <AccountMenu
            user={
              user
                ? {
                    name: user.name ?? "Minha conta",
                    email: user.email ?? "",
                    role: user.role,
                  }
                : null
            }
          />
        </div>
      </div>

      {/* Busca no mobile */}
      <div className="border-t border-white/10 px-4 pb-3 pt-2 md:hidden">
        <Suspense fallback={<div className="h-11 rounded-lg bg-white/10" />}>
          <SearchBar />
        </Suspense>
      </div>

      {/* Trilha de categorias — desktop */}
      <nav
        aria-label="Categorias"
        className="hidden border-t border-white/10 bg-brand-800 lg:block"
      >
        <ul className="mx-auto flex max-w-[92rem] items-center gap-1 px-4 xl:px-6">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/categoria/${category.slug}`}
                className="inline-flex h-11 items-center rounded-md px-3.5 text-[13.5px] font-medium text-brand-100 transition-colors hover:bg-brand-700 hover:text-white"
              >
                {category.name}
              </Link>
            </li>
          ))}
          <li className="ml-auto">
            <Link
              href="/quem-somos"
              className="inline-flex h-11 items-center rounded-md px-3.5 text-[13.5px] font-medium text-brand-200 transition-colors hover:bg-brand-700 hover:text-white"
            >
              Quem somos
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
