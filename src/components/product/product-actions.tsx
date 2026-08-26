"use client";

import { Minus, MessageCircle, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { MAX_QUANTITY } from "@/stores/cart-store";
import { buildWhatsAppUrl, type DeliveryInfo } from "@/lib/whatsapp/build-message";

type Props = {
  product: {
    productId: string;
    slug: string;
    title: string;
    price: number;
    compareAtPrice: number | null;
    image: string;
  };
  delivery?: DeliveryInfo | null;
};

/**
 * Seletor de quantidade + as duas ações da PDP.
 * "Comprar agora" monta um carrinho efêmero de 1 item e vai direto ao WhatsApp,
 * SEM tocar no carrinho persistido (§5.5 do brief).
 */
export function ProductActions({ product, delivery }: Props) {
  const [quantity, setQuantity] = useState(1);

  function buyNow() {
    const url = buildWhatsAppUrl(
      [
        {
          slug: product.slug,
          title: product.title,
          price: product.price,
          quantity,
        },
      ],
      delivery,
    );
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span
          id="quantidade-label"
          className="text-sm font-medium text-ink-soft"
        >
          Quantidade
        </span>
        <div className="inline-flex items-center rounded-lg border border-line bg-white shadow-card">
          <Button
            variant="ghost"
            size="icon-sm"
            className="m-1"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Diminuir quantidade"
          >
            <Minus />
          </Button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_QUANTITY}
            value={quantity}
            aria-labelledby="quantidade-label"
            onChange={(event) => {
              const parsed = Number.parseInt(event.target.value, 10);
              setQuantity(
                Number.isNaN(parsed)
                  ? 1
                  : Math.min(MAX_QUANTITY, Math.max(1, parsed)),
              );
            }}
            className="w-12 border-x border-line bg-transparent py-2 text-center text-sm font-semibold text-ink tabular-nums outline-none [appearance:textfield] focus:bg-brand-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            className="m-1"
            onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
            disabled={quantity >= MAX_QUANTITY}
            aria-label="Aumentar quantidade"
          >
            <Plus />
          </Button>
        </div>
      </div>

      <Button variant="whatsapp" size="lg" block onClick={buyNow}>
        <MessageCircle aria-hidden="true" />
        Comprar agora pelo WhatsApp
      </Button>

      <AddToCartButton
        product={product}
        quantity={quantity}
        variant="secondary"
        size="lg"
        block
      />

      <p className="text-center text-[13px] text-ink-muted">
        O pedido é fechado no WhatsApp. Nada é cobrado pelo site.
      </p>
    </div>
  );
}
