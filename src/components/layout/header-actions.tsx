"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  ShoppingCart,
  User as UserIcon,
  UserPlus,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useCartCount, useCartHydrated, useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export type HeaderUser = {
  name: string;
  email: string;
  role: "USER" | "ADMIN";
} | null;

/** Hidrata o carrinho persistido uma única vez, no cliente. */
export function CartHydrator() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
    useCartStore.getState().setHydrated(true);
  }, []);
  return null;
}

export function CartButton() {
  const count = useCartCount();
  const hydrated = useCartHydrated();
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);

  return (
    <button
      type="button"
      onClick={openCartDrawer}
      className="relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
      aria-label={
        hydrated && count > 0
          ? `Abrir carrinho — ${count} ${count === 1 ? "item" : "itens"}`
          : "Abrir carrinho"
      }
    >
      <span className="relative">
        <ShoppingCart className="size-[22px]" aria-hidden="true" />
        {/* Reserva do espaço do badge evita layout shift na hidratação. */}
        <span
          className={cn(
            "absolute -right-2 -top-2 grid min-w-5 place-items-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-brand-950 transition-opacity",
            hydrated && count > 0 ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={!hydrated || count === 0}
        >
          {count > 99 ? "99+" : count}
        </span>
      </span>
      <span className="hidden lg:inline">Carrinho</span>
    </button>
  );
}

const NOTICES = [
  {
    title: "Frete combinado na hora",
    body: "Fechou pelo WhatsApp, a gente calcula o frete e você aprova antes de pagar.",
  },
  {
    title: "Encordoamento no mesmo dia",
    body: "Traga a raquete até as 14h e retire encordoada no fim da tarde.",
  },
  {
    title: "Linha de beach tennis renovada",
    body: "Novas raquetes de carbono 12K disponíveis na categoria Raquetes.",
  },
];

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, () => setOpen(false));

  return (
    <div className="relative hidden sm:block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Avisos da loja"
        className="relative rounded-lg p-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Bell className="size-[22px]" aria-hidden="true" />
        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent-500 ring-2 ring-brand-900" />
      </button>

      {open ? (
        <div className="animate-fade-up absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-line bg-surface shadow-elevated">
          <div className="border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">Avisos da loja</p>
          </div>
          <ul className="divide-y divide-line">
            {NOTICES.map((notice) => (
              <li key={notice.title} className="px-4 py-3">
                <p className="text-[13px] font-semibold text-ink">{notice.title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">
                  {notice.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function AccountMenu({ user }: { user: HeaderUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, () => setOpen(false));

  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
      >
        <UserIcon className="size-[22px]" aria-hidden="true" />
        <span className="hidden max-w-28 truncate lg:inline">
          {user ? firstName : "Entrar"}
        </span>
        <ChevronDown className="hidden size-4 lg:inline" aria-hidden="true" />
      </button>

      {open ? (
        <div className="animate-fade-up absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-surface shadow-elevated">
          {user ? (
            <>
              <div className="border-b border-line bg-surface-alt px-4 py-3">
                <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                <p className="truncate text-[13px] text-ink-muted">{user.email}</p>
              </div>
              <nav className="p-1.5">
                <MenuLink href="/conta" icon={<UserIcon className="size-4" />}>
                  Meus dados
                </MenuLink>
                <MenuLink href="/conta/endereco" icon={<MapPin className="size-4" />}>
                  Endereços
                </MenuLink>
                {user.role === "ADMIN" ? (
                  <MenuLink
                    href="/admin"
                    icon={<LayoutDashboard className="size-4" />}
                  >
                    Painel do admin
                  </MenuLink>
                ) : null}
              </nav>
              <div className="border-t border-line p-1.5">
                <button
                  type="button"
                  onClick={() => void signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger-600 transition-colors hover:bg-danger-50"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sair
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="border-b border-line bg-surface-alt px-4 py-3">
                <p className="text-sm font-semibold text-ink">Bem-vindo!</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">
                  Criar conta é opcional — serve para salvar seu endereço e agilizar o
                  pedido no WhatsApp.
                </p>
              </div>
              <nav className="p-1.5">
                <MenuLink href="/entrar" icon={<LogIn className="size-4" />}>
                  Entrar
                </MenuLink>
                <MenuLink href="/cadastro" icon={<UserPlus className="size-4" />}>
                  Criar conta
                </MenuLink>
              </nav>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function MobileNavButton() {
  const setMobileNav = useUiStore((s) => s.setMobileNav);
  return (
    <button
      type="button"
      onClick={() => setMobileNav(true)}
      aria-label="Abrir menu de categorias"
      className="rounded-lg p-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
    >
      <Menu className="size-[22px]" aria-hidden="true" />
    </button>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700"
    >
      <span aria-hidden="true" className="text-brand-500">
        {icon}
      </span>
      {children}
    </Link>
  );
}

function useOutsideClose(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    function handlePointer(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [ref, onClose]);
}
