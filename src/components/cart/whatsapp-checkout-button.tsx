"use client";

import { MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { buildWhatsAppUrl, type DeliveryInfo } from "@/lib/whatsapp/build-message";

type Props = Omit<ButtonProps, "children" | "onClick"> & {
  delivery?: DeliveryInfo | null;
  label?: string;
};

/**
 * Converte o carrinho persistido na mensagem do WhatsApp.
 * A URL é montada no clique — assim reflete o carrinho no instante do envio.
 */
export function WhatsAppCheckoutButton({
  delivery,
  label = "Finalizar pedido pelo WhatsApp",
  ...buttonProps
}: Props) {
  const toast = useUiStore((s) => s.toast);

  function handleClick() {
    const items = useCartStore.getState().items;
    if (items.length === 0) {
      toast({
        variant: "info",
        title: "Seu carrinho está vazio",
        description: "Adicione produtos antes de finalizar o pedido.",
      });
      return;
    }
    const url = buildWhatsAppUrl(
      items.map((item) => ({
        slug: item.slug,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      })),
      delivery,
    );
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <Button variant="whatsapp" {...buttonProps} onClick={handleClick}>
      <MessageCircle aria-hidden="true" />
      {label}
    </Button>
  );
}
