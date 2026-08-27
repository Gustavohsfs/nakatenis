"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import {
  useCartHydrated,
  useCartItems,
  useCartSavings,
  useCartSubtotal,
} from "@/stores/cart-store";
import { formatBRL } from "@/lib/pricing";
import { CartLineItem } from "./cart-line-item";
import { WhatsAppCheckoutButton } from "./whatsapp-checkout-button";

export function CartDrawer() {
  const open = useUiStore((s) => s.cartDrawerOpen);
  const close = useUiStore((s) => s.closeCartDrawer);
  const items = useCartItems();
  const subtotal = useCartSubtotal();
  const savings = useCartSavings();
  const hydrated = useCartHydrated();

  const count = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Drawer
      open={open}
      onClose={close}
      title="Seu carrinho"
      description={
        hydrated
          ? count === 0
            ? "Nenhum item ainda"
            : `${count} ${count === 1 ? "item" : "itens"}`
          : undefined
      }
      footer={
        items.length > 0 ? (
          <div className="space-y-3">
            {savings > 0 ? (
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-ink-muted">Economia</span>
                <span className="font-semibold text-success-600">
                  {formatBRL(savings)}
                </span>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-soft">Subtotal</span>
              <span className="text-xl font-bold text-ink tabular-nums">
                {formatBRL(subtotal)}
              </span>
            </div>
            <WhatsAppCheckoutButton block size="lg" />
            <Button variant="outline" block asChild>
              <Link href="/carrinho" onClick={close}>
                Ver carrinho completo
              </Link>
            </Button>
            <p className="text-center text-[12px] text-ink-muted">
              Frete e pagamento são combinados no atendimento.
            </p>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="grid size-16 place-items-center rounded-full bg-brand-50 text-brand-500">
            <ShoppingBag className="size-7" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold text-ink">Seu carrinho está vazio</h3>
          <p className="max-w-xs text-[13.5px] text-ink-muted">
            Escolha uma raquete, um calçado ou um acessório e ele aparece aqui.
          </p>
          <Button className="mt-2" asChild>
            <Link href="/" onClick={close}>
              Ver produtos
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-line px-5">
          {items.map((item) => (
            <CartLineItem
              key={item.productId}
              item={item}
              compact
              onNavigate={close}
            />
          ))}
        </ul>
      )}
    </Drawer>
  );
}
