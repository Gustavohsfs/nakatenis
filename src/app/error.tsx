"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Em produção o digest é o que liga este erro ao log do servidor.
    console.error("[nakatenis] erro na página:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 py-20 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-danger-50 text-danger-600">
        <TriangleAlert className="size-8" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Algo deu errado por aqui
        </h1>
        <p className="max-w-md text-[15px] leading-relaxed text-ink-muted">
          A página não carregou como deveria. Tente novamente — se persistir, fale com a
          loja pelo WhatsApp.
        </p>
        {error.digest ? (
          <p className="text-[12px] text-ink-muted">Código: {error.digest}</p>
        ) : null}
      </div>
      <Button size="lg" onClick={reset}>
        <RotateCcw aria-hidden="true" />
        Tentar novamente
      </Button>
    </div>
  );
}
