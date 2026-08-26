"use client";

import { create } from "zustand";

export type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: "success" | "danger" | "info";
};

type UiState = {
  cartDrawerOpen: boolean;
  mobileNavOpen: boolean;
  toasts: Toast[];
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  setMobileNav: (open: boolean) => void;
  toast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
};

export const useUiStore = create<UiState>()((set) => ({
  cartDrawerOpen: false,
  mobileNavOpen: false,
  toasts: [],

  openCartDrawer: () => set({ cartDrawerOpen: true }),
  closeCartDrawer: () => set({ cartDrawerOpen: false }),
  setMobileNav: (open) => set({ mobileNavOpen: open }),

  toast: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4500);
  },

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const useToast = () => useUiStore((s) => s.toast);
