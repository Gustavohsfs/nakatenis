import { cn } from "@/lib/utils";
import { formatBRL, getDiscount, getInstallment, getSavings } from "@/lib/pricing";
import { Badge } from "@/components/ui";

/**
 * Anatomia do preço (regra não negociável do design system):
 *  - preço atual é o segundo maior peso visual da página, depois do título;
 *  - preço antigo vem riscado, menor e em --text-muted;
 *  - badge de desconto é fundo --success-600, texto branco, formato "-51%".
 */

export function DiscountBadge({
  price,
  compareAtPrice,
  className,
  size = "md",
}: {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
  size?: "sm" | "md";
}) {
  const discount = getDiscount(price, compareAtPrice);
  if (discount === null) return null;
  return (
    <Badge variant="discount" size={size} className={className}>
      -{discount}%
    </Badge>
  );
}

export function PriceBlock({
  price,
  compareAtPrice,
  size = "md",
  showInstallment = true,
  showSavings = false,
  className,
}: {
  price: number;
  compareAtPrice?: number | null;
  size?: "sm" | "md" | "lg";
  showInstallment?: boolean;
  showSavings?: boolean;
  className?: string;
}) {
  const discount = getDiscount(price, compareAtPrice);
  const savings = getSavings(price, compareAtPrice);
  const installment = getInstallment(price);

  const currentSize = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl sm:text-[2.75rem]",
  }[size];

  const oldSize = { sm: "text-[13px]", md: "text-sm", lg: "text-lg" }[size];

  return (
    <div className={cn("space-y-1", className)}>
      {discount !== null ? (
        <div className="flex items-center gap-2">
          <span className={cn("text-ink-muted line-through", oldSize)}>
            {formatBRL(compareAtPrice!)}
          </span>
          <DiscountBadge
            price={price}
            compareAtPrice={compareAtPrice}
            size={size === "lg" ? "md" : "sm"}
          />
        </div>
      ) : null}

      <p
        className={cn(
          "font-bold leading-none tracking-tight text-ink tabular-nums",
          currentSize,
        )}
      >
        {formatBRL(price)}
      </p>

      {showSavings && savings ? (
        <p className="text-sm font-medium text-success-600">
          Você economiza {formatBRL(savings)}
        </p>
      ) : null}

      {showInstallment ? (
        <p
          className={cn(
            "text-ink-muted",
            size === "lg" ? "text-[15px]" : "text-[13px]",
          )}
        >
          em <span className="font-semibold text-ink-soft">{installment.label}</span>
        </p>
      ) : null}
    </div>
  );
}
