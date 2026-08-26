import Image from "next/image";
import Link from "next/link";
import { ImageOff, Sparkles } from "lucide-react";
import type { Product } from "@/lib/data/types";
import { cn, isRecent } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { PriceBlock } from "./price-block";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

const PLACEHOLDER = "/brand/placeholder.svg";

export function ProductCard({
  product,
  priority = false,
  className,
  sizes = "(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
}: {
  product: Product;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const cover = product.images[0];
  const href = `/produto/${product.slug}`;
  const isNew = isRecent(product.createdAt);
  const lowStock = product.stock > 0 && product.stock <= 3;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover focus-within:border-brand-300",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-surface-sunken">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="block h-full w-full">
          {cover ? (
            <Image
              src={cover.url}
              alt=""
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-muted">
              <ImageOff className="size-8" aria-hidden="true" />
              <span className="text-xs">Sem imagem</span>
            </div>
          )}
        </Link>

        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <Badge variant="discount" size="sm" className="shadow-sm">
              -
              {Math.round(
                ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
              )}
              %
            </Badge>
          ) : null}
          {isNew ? (
            <Badge variant="new" size="sm" className="shadow-sm">
              <Sparkles className="size-3" aria-hidden="true" />
              Novo
            </Badge>
          ) : null}
        </div>

        {product.stock <= 0 ? (
          <div className="absolute inset-x-0 bottom-0 bg-brand-950/80 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-white">
            Sob consulta
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {product.brand ? (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-500">
            {product.brand}
          </p>
        ) : null}

        <h3 className="text-[15px] font-semibold leading-snug text-ink">
          <Link
            href={href}
            className="line-clamp-2 outline-none after:absolute after:inset-0 after:content-[''] hover:text-brand-700"
          >
            {product.title}
          </Link>
        </h3>

        <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
          {product.shortDescription}
        </p>

        <div className="mt-auto space-y-3 pt-1">
          <PriceBlock price={product.price} compareAtPrice={product.compareAtPrice} size="md" />

          {lowStock ? (
            <p className="text-[12px] font-semibold text-accent-700">
              Últimas {product.stock} unidades
            </p>
          ) : null}

          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              title: product.title,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              image: cover?.url ?? PLACEHOLDER,
            }}
            variant="secondary"
            size="sm"
            block
            className="relative z-10"
            label="Adicionar"
          />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  priorityCount = 0,
  className,
}: {
  products: Product[];
  priorityCount?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-5",
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
