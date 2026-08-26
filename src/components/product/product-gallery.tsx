"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import type { ProductImage } from "@/lib/data/types";
import { cn } from "@/lib/utils";

type Props = {
  images: ProductImage[];
  title: string;
};

/**
 * Galeria da PDP: thumbnails + imagem principal, zoom por hover no desktop
 * (transform-origin segue o cursor) e swipe horizontal no mobile.
 */
export function ProductGallery({ images, title }: Props) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface-sunken text-ink-muted">
        <ImageOff className="size-12" aria-hidden="true" />
        <p className="text-sm">Fotos deste produto em breve</p>
        <p className="max-w-[16rem] text-center text-[13px]">
          Peça imagens reais pelo WhatsApp — respondemos com foto do estoque.
        </p>
      </div>
    );
  }

  const current = images[active];

  function move(direction: 1 | -1) {
    setActive((index) => (index + direction + images.length) % images.length);
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 ? (
        <ul
          className="scrollbar-none flex gap-2 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-visible"
          aria-label="Miniaturas do produto"
        >
          {images.map((image, index) => (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Ver imagem ${index + 1} de ${images.length}`}
                aria-current={index === active}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-lg border-2 bg-surface-sunken transition-all sm:size-20",
                  index === active
                    ? "border-brand-500 shadow-brand"
                    : "border-line hover:border-brand-300",
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="relative flex-1">
        <div
          className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => {
            setZoom(false);
            setOrigin("50% 50%");
          }}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            setOrigin(`${x}% ${y}%`);
          }}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0].clientX;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null) return;
            const delta = event.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1);
            touchStartX.current = null;
          }}
        >
          <Image
            key={current.id}
            src={current.url}
            alt={current.alt ?? `${title} — imagem ${active + 1}`}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            priority={active === 0}
            className="object-cover transition-transform duration-300 ease-out"
            style={{
              transform: zoom ? "scale(1.9)" : "scale(1)",
              transformOrigin: origin,
            }}
          />

          <span className="pointer-events-none absolute bottom-3 right-3 hidden rounded-full bg-brand-950/70 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 lg:block">
            Passe o mouse para ampliar
          </span>
        </div>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Imagem anterior"
              className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-white/90 text-ink-soft shadow-card transition-colors hover:bg-white hover:text-brand-700"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Próxima imagem"
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-white/90 text-ink-soft shadow-card transition-colors hover:bg-white hover:text-brand-700"
            >
              <ChevronRight className="size-5" />
            </button>
            <p className="mt-2 text-center text-[13px] text-ink-muted sm:hidden">
              {active + 1} de {images.length}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
