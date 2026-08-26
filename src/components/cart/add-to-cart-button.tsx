"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCartStore, type CartItem } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { formatBRL } from "@/lib/pricing";

type AddToCartButtonProps = Omit<ButtonProps, "onClick" | "children"> & {
  product: Omit<CartItem, "quantity">;
  quantity?: number;
  label?: string;
  openDrawer?: boolean;
};

export function AddToCartButton({
  product,
  quantity = 1,
  label = "Adicionar ao carrinho",
  openDrawer = true,
  ...buttonProps
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);
  const toast = useUiStore((s) => s.toast);
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    toast({
      variant: "success",
      title: "Adicionado ao carrinho",
      description: `${product.title} — ${formatBRL(product.price)}`,
    });
    if (openDrawer) openCartDrawer();
  }

  return (
    <Button {...buttonProps} onClick={handleClick}>
      {added ? (
        <>
          <Check aria-hidden="true" />
          Adicionado
        </>
      ) : (
        <>
          <ShoppingCart aria-hidden="true" />
          {label}
        </>
      )}
    </Button>
  );
}
