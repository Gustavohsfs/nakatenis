"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatBRL } from "@/lib/pricing";
import { useCartStore, MAX_QUANTITY, type CartItem } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  item,
  size = "md",
}: {
  item: CartItem;
  size?: "sm" | "md";
}) {
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const setQuantity = useCartStore((s) => s.setQuantity);

  const buttonSize = size === "sm" ? "size-7" : "size-8";

  return (
    <div className="inline-flex items-center rounded-lg border border-line bg-white">
      <button
        type="button"
        onClick={() => decrement(item.productId)}
        aria-label={
          item.quantity <= 1
            ? `Remover ${item.title} do carrinho`
            : `Diminuir quantidade de ${item.title}`
        }
        className={cn(
          buttonSize,
          "grid place-items-center rounded-l-lg text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink",
        )}
      >
        {item.quantity <= 1 ? (
          <Trash2 className="size-3.5" />
        ) : (
          <Minus className="size-3.5" />
        )}
      </button>
      <input
        type="number"
        min={1}
        max={MAX_QUANTITY}
        value={item.quantity}
        aria-label={`Quantidade de ${item.title}`}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10);
          if (Number.isNaN(parsed)) return;
          setQuantity(item.productId, parsed);
        }}
        className={cn(
          "w-10 border-x border-line bg-transparent text-center text-[13px] font-semibold text-ink tabular-nums outline-none [appearance:textfield] focus:bg-brand-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          size === "sm" ? "h-7" : "h-8",
        )}
      />
      <button
        type="button"
        onClick={() => increment(item.productId)}
        aria-label={`Aumentar quantidade de ${item.title}`}
        disabled={item.quantity >= MAX_QUANTITY}
        className={cn(
          buttonSize,
          "grid place-items-center rounded-r-lg text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink disabled:opacity-40",
        )}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export function CartLineItem({
  item,
  compact = false,
  onNavigate,
}: {
  item: CartItem;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const removeItem = useCartStore((s) => s.removeItem);
  const lineTotal = item.price * item.quantity;

  return (
    <li className="flex gap-3 py-4">
      <Link
        href={`/produto/${item.slug}`}
        onClick={onNavigate}
        className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-sunken"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={item.image || "/brand/placeholder.svg"}
          alt=""
          fill
          sizes="80px"
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/produto/${item.slug}`}
            onClick={onNavigate}
            className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink hover:text-brand-700"
          >
            {item.title}
          </Link>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            aria-label={`Remover ${item.title} do carrinho`}
            className="shrink-0 rounded-md p-1 text-ink-muted transition-colors hover:bg-danger-50 hover:text-danger-600"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <p className="text-[13px] text-ink-muted">
          {formatBRL(item.price)} cada
          {item.compareAtPrice && item.compareAtPrice > item.price ? (
            <span className="ml-2 text-ink-muted/80 line-through">
              {formatBRL(item.compareAtPrice)}
            </span>
          ) : null}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <QuantityStepper item={item} size={compact ? "sm" : "md"} />
          <span className="text-sm font-bold text-ink tabular-nums">
            {formatBRL(lineTotal)}
          </span>
        </div>
      </div>
    </li>
  );
}
