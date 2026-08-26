"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Carrossel horizontal com scroll nativo (swipe no mobile, setas no desktop).
 * Sem biblioteca: o scroll-snap do CSS já entrega o comportamento esperado.
 */
export function ProductCarousel({
  children,
  className,
  itemClassName = "w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.667rem)] lg:w-[calc(25%-0.75rem)] xl:w-[calc(20%-0.8rem)]",
}: {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  function updateEdges() {
    const el = trackRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function scrollBy(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className={cn("relative", className)}>
      <ul
        ref={trackRef}
        onScroll={updateEdges}
        className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1"
      >
        {children.map((child, index) => (
          <li key={index} className={cn("shrink-0 snap-start", itemClassName)}>
            {child}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Rolar para a esquerda"
        disabled={edges.start}
        className="absolute -left-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink-soft shadow-card-hover transition-all hover:text-brand-700 disabled:pointer-events-none disabled:opacity-0 lg:grid"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Rolar para a direita"
        disabled={edges.end}
        className="absolute -right-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink-soft shadow-card-hover transition-all hover:text-brand-700 disabled:pointer-events-none disabled:opacity-0 lg:grid"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
