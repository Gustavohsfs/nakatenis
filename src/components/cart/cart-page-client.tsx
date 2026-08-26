"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RefreshCw, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, Card, CardContent, EmptyState, Skeleton } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useCartHydrated,
  useCartItems,
  useCartSavings,
  useCartStore,
  useCartSubtotal,
} from "@/stores/cart-store";
import { formatBRL } from "@/lib/pricing";
import type { DeliveryInfo } from "@/lib/whatsapp/build-message";
import { fetchFreshCartProducts } from "@/app/(public)/carrinho/actions";
import { CartLineItem } from "./cart-line-item";
import { WhatsAppCheckoutButton } from "./whatsapp-checkout-button";

export function CartPageClient({
  delivery,
  isLoggedIn,
}: {
  delivery: DeliveryInfo | null;
  isLoggedIn: boolean;
}) {
  const hydrated = useCartHydrated();
  const items = useCartItems();
  const subtotal = useCartSubtotal();
  const savings = useCartSavings();
  const clear = useCartStore((s) => s.clear);

  const [confirmClear, setConfirmClear] = useState(false);
  const [notice, setNotice] = useState<{ priceChanged: string[]; removed: string[] } | null>(
    null,
  );
  // Começa como `true`: a checagem é a primeira coisa que acontece depois da
  // hidratação, e assim nenhum setState síncrono precisa rodar dentro do efeito.
  const [checking, setChecking] = useState(true);

  // Revalidação de preço e disponibilidade ao montar a página.
  useEffect(() => {
    if (!hydrated) return;
    const ids = useCartStore.getState().items.map((item) => item.productId);

    let cancelled = false;
    fetchFreshCartProducts(ids)
      .then((fresh) => {
        if (cancelled) return;
        const available = Object.fromEntries(
          Object.entries(fresh).filter(([, product]) => product.isActive),
        );
        const result = useCartStore.getState().reconcile(available);
        if (result.priceChanged.length > 0 || result.removed.length > 0) {
          setNotice(result);
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  if (!hydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="size-7" />}
        title="Seu carrinho está vazio"
        description="Escolha uma raquete, um calçado ou um acessório — o carrinho fica salvo mesmo se você fechar o navegador."
        action={
          <Button size="lg" asChild>
            <Link href="/">Ver produtos</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-4">
          {notice ? (
            <Alert variant="warning">
              <p className="font-semibold">Atualizamos seu carrinho</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[13.5px]">
                {notice.priceChanged.length > 0 ? (
                  <li>
                    Preço alterado desde a última visita:{" "}
                    {notice.priceChanged.join(", ")}.
                  </li>
                ) : null}
                {notice.removed.length > 0 ? (
                  <li>
                    Fora do catálogo e removido(s): {notice.removed.join(", ")}.
                  </li>
                ) : null}
              </ul>
            </Alert>
          ) : null}

          <Card>
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <h2 className="text-[15px] font-semibold text-ink">
                {items.length} {items.length === 1 ? "produto" : "produtos"}
              </h2>
              <div className="flex items-center gap-2">
                {checking ? (
                  <span className="flex items-center gap-1.5 text-[12.5px] text-ink-muted">
                    <RefreshCw className="size-3.5 animate-spin" aria-hidden="true" />
                    Conferindo preços…
                  </span>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmClear(true)}
                  className="text-danger-600 hover:bg-danger-50"
                >
                  <Trash2 aria-hidden="true" />
                  Limpar
                </Button>
              </div>
            </div>
            <ul className="divide-y divide-line px-5">
              {items.map((item) => (
                <CartLineItem key={item.productId} item={item} />
              ))}
            </ul>
          </Card>

          <Button variant="secondary" asChild>
            <Link href="/">← Continuar comprando</Link>
          </Button>
        </div>

        {/* Resumo lateral */}
        <Card className="lg:sticky lg:top-[10.5rem]">
          <CardContent className="space-y-4">
            <h2 className="text-[15px] font-semibold text-ink">Resumo do pedido</h2>

            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd className="font-medium text-ink tabular-nums">
                  {formatBRL(subtotal)}
                </dd>
              </div>
              {savings > 0 ? (
                <div className="flex items-center justify-between">
                  <dt className="text-ink-muted">Economia</dt>
                  <dd className="font-semibold text-success-600 tabular-nums">
                    −{formatBRL(savings)}
                  </dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <dt className="text-ink-muted">Frete</dt>
                <dd className="text-[13px] font-medium text-ink-soft">
                  combinado no WhatsApp
                </dd>
              </div>
            </dl>

            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <span className="text-sm font-medium text-ink-soft">Total</span>
              <span className="text-2xl font-bold text-ink tabular-nums">
                {formatBRL(subtotal)}
              </span>
            </div>

            <WhatsAppCheckoutButton block size="lg" delivery={delivery} />

            {delivery ? (
              <p className="rounded-lg bg-success-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-success-700">
                Seu endereço padrão vai junto na mensagem.
              </p>
            ) : isLoggedIn ? (
              <p className="rounded-lg bg-brand-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-brand-900">
                <Link href="/conta/endereco" className="font-semibold underline">
                  Cadastre um endereço
                </Link>{" "}
                para ele entrar automaticamente na mensagem.
              </p>
            ) : (
              <p className="rounded-lg bg-surface-alt px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-muted">
                Não precisa de conta para comprar.{" "}
                <Link href="/entrar" className="font-semibold text-brand-500 underline">
                  Entre
                </Link>{" "}
                se quiser enviar seu endereço junto.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Limpar o carrinho?"
        description="Todos os produtos serão removidos. Essa ação não pode ser desfeita."
        confirmLabel="Limpar carrinho"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clear();
          setConfirmClear(false);
        }}
      />
    </>
  );
}
