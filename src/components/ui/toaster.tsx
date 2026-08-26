"use client";

import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const ICONS = {
  success: CheckCircle2,
  danger: AlertTriangle,
  info: Info,
} as const;

const STYLES = {
  success: "border-success-600/25 bg-white text-ink",
  danger: "border-danger-600/25 bg-white text-ink",
  info: "border-brand-200 bg-white text-ink",
} as const;

const ICON_STYLES = {
  success: "text-success-600",
  danger: "text-danger-600",
  info: "text-brand-500",
} as const;

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant];
        return (
          <div
            key={toast.id}
            className={cn(
              "animate-slide-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-elevated",
              STYLES[toast.variant],
            )}
          >
            <Icon className={cn("mt-0.5 size-5 shrink-0", ICON_STYLES[toast.variant])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description ? (
                <p className="mt-0.5 text-[13px] text-ink-muted">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded-md p-1 text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
              aria-label="Fechar aviso"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
