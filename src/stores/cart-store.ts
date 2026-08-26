"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  /** centavos */
  price: number;
  /** centavos */
  compareAtPrice?: number | null;
  image: string;
  quantity: number;
};

export const MAX_QUANTITY = 99;

type CartState = {
  items: CartItem[];
  hasHydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  clear: () => void;
  /** Aplica preços/títulos frescos vindos do servidor e remove itens sumidos. */
  reconcile: (
    fresh: Record<
      string,
      { title: string; price: number; compareAtPrice: number | null; image: string; slug: string }
    >,
  ) => { priceChanged: string[]; removed: string[] };
  setHydrated: (value: boolean) => void;
};

function clampQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity)));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, ...item, quantity: clampQuantity(i.quantity + quantity) }
                  : i,
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: clampQuantity(quantity) }],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: clampQuantity(quantity) } : i,
          ),
        })),

      increment: (productId) => get().setQuantity(productId, (get().items.find((i) => i.productId === productId)?.quantity ?? 0) + 1),

      decrement: (productId) => {
        const current = get().items.find((i) => i.productId === productId);
        if (!current) return;
        // Quantidade nunca chega a 0: chegou em 1, o passo seguinte é remover.
        if (current.quantity <= 1) {
          get().removeItem(productId);
          return;
        }
        get().setQuantity(productId, current.quantity - 1);
      },

      clear: () => set({ items: [] }),

      reconcile: (fresh) => {
        const priceChanged: string[] = [];
        const removed: string[] = [];
        const items = get()
          .items.flatMap((item) => {
            const server = fresh[item.productId];
            if (!server) {
              removed.push(item.title);
              return [];
            }
            if (server.price !== item.price) priceChanged.push(server.title);
            return [
              {
                ...item,
                title: server.title,
                slug: server.slug,
                price: server.price,
                compareAtPrice: server.compareAtPrice,
                image: server.image,
              },
            ];
          });
        set({ items });
        return { priceChanged, removed };
      },

      setHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "nakatenis-cart",
      version: 1,
      // Sem skipHydration o servidor renderiza um carrinho vazio e o cliente
      // renderiza o carrinho salvo → mismatch de hidratação.
      skipHydration: true,
      partialize: (state) => ({ items: state.items }) as unknown as CartState,
      migrate: (persisted, version) => {
        // v0 guardava { items: [{ id, qty }] } — normaliza para o shape atual.
        if (version === 0 && persisted && typeof persisted === "object") {
          const legacy = persisted as { items?: unknown };
          if (Array.isArray(legacy.items)) {
            return {
              items: legacy.items.flatMap((raw) => {
                const item = raw as Partial<CartItem> & { id?: string; qty?: number };
                const productId = item.productId ?? item.id;
                if (!productId || typeof item.price !== "number") return [];
                return [
                  {
                    productId,
                    slug: item.slug ?? "",
                    title: item.title ?? "",
                    price: item.price,
                    compareAtPrice: item.compareAtPrice ?? null,
                    image: item.image ?? "",
                    quantity: clampQuantity(item.quantity ?? item.qty ?? 1),
                  },
                ];
              }),
            } as CartState;
          }
        }
        return persisted as CartState;
      },
    },
  ),
);

// ─── Seletores granulares ─────────────────────────────────────────────────────
// Cada componente assina só o pedaço que usa: mudar a quantidade não re-renderiza
// a página inteira, só o badge e a linha correspondente.

export const useCartItems = () => useCartStore((s) => s.items);
export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((total, i) => total + i.quantity, 0));
export const useCartSubtotal = () =>
  useCartStore((s) => s.items.reduce((total, i) => total + i.price * i.quantity, 0));
export const useCartSavings = () =>
  useCartStore((s) =>
    s.items.reduce((total, i) => {
      if (!i.compareAtPrice || i.compareAtPrice <= i.price) return total;
      return total + (i.compareAtPrice - i.price) * i.quantity;
    }, 0),
  );
export const useCartHydrated = () => useCartStore((s) => s.hasHydrated);
