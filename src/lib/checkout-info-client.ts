"use client";

import { useEffect, useState } from "react";
import type { DeliveryInfo } from "@/lib/whatsapp/build-message";

/**
 * Cliente de /api/me/checkout-info com cache de módulo: uma requisição por
 * carregamento de página, compartilhada por header, drawer, carrinho e PDP.
 * Login e logout navegam com reload completo, então o cache zera sozinho.
 */
export type CheckoutInfo = {
  user: { name: string; email: string; role: "USER" | "ADMIN" } | null;
  delivery: DeliveryInfo | null;
};

const EMPTY: CheckoutInfo = { user: null, delivery: null };

let cached: CheckoutInfo | null = null;
let inflight: Promise<CheckoutInfo> | null = null;

export function fetchCheckoutInfo(): Promise<CheckoutInfo> {
  if (cached) return Promise.resolve(cached);
  inflight ??= fetch("/api/me/checkout-info", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : EMPTY))
    .catch(() => EMPTY)
    .then((data: CheckoutInfo) => {
      cached = data;
      inflight = null;
      return data;
    });
  return inflight;
}

/** null = ainda carregando (o estado anônimo é o default visual). */
export function useCheckoutInfo(): CheckoutInfo | null {
  const [info, setInfo] = useState<CheckoutInfo | null>(cached);
  useEffect(() => {
    let active = true;
    void fetchCheckoutInfo().then((data) => {
      if (active) setInfo(data);
    });
    return () => {
      active = false;
    };
  }, []);
  return info;
}
