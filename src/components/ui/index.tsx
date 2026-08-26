import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-surface shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1 border-b border-line px-5 py-4", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-base font-semibold tracking-tight text-ink", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-ink-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t border-line px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md font-semibold leading-none",
  {
    variants: {
      variant: {
        discount: "bg-success-600 text-white",
        new: "bg-accent-500 text-brand-950",
        brand: "bg-brand-100 text-brand-900",
        neutral: "bg-surface-sunken text-ink-soft",
        danger: "bg-danger-50 text-danger-700 ring-1 ring-danger-600/20",
        success: "bg-success-50 text-success-700 ring-1 ring-success-600/20",
        outline: "border border-line bg-white text-ink-muted",
      },
      size: {
        sm: "px-1.5 py-1 text-[11px]",
        md: "px-2.5 py-1.5 text-xs",
      },
    },
    defaultVariants: { variant: "neutral", size: "md" },
  },
);

export function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

// ─── Input / Textarea / Select ────────────────────────────────────────────────

const fieldBase =
  "w-full rounded-lg border border-line bg-white text-sm text-ink shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] transition-colors placeholder:text-ink-muted/70 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/12 disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-ink-muted aria-[invalid=true]:border-danger-600 aria-[invalid=true]:ring-danger-600/12";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(fieldBase, "h-11 px-3.5", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea className={cn(fieldBase, "min-h-24 px-3.5 py-2.5", className)} {...props} />
  );
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(fieldBase, "h-11 cursor-pointer px-3 pr-9", className)}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm font-medium text-ink-soft", className)}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-[13px] font-medium text-danger-600">
      {children}
    </p>
  );
}

export function FieldHint({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-[13px] text-ink-muted">{children}</p>;
}

export function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

// ─── Alert ────────────────────────────────────────────────────────────────────

const alertVariants = cva("rounded-lg border px-4 py-3 text-sm", {
  variants: {
    variant: {
      info: "border-brand-200 bg-brand-50 text-brand-900",
      success: "border-success-600/25 bg-success-50 text-success-700",
      warning: "border-accent-500/35 bg-accent-100 text-accent-700",
      danger: "border-danger-600/25 bg-danger-50 text-danger-700",
    },
  },
  defaultVariants: { variant: "info" },
});

export function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("shimmer rounded-lg", className)} {...props} />;
}

// ─── Switch (checkbox estilizado) ─────────────────────────────────────────────

export function Switch({
  className,
  label,
  ...props
}: React.ComponentProps<"input"> & { label?: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5">
      <span className="relative inline-flex">
        <input type="checkbox" className={cn("peer sr-only", className)} {...props} />
        <span className="h-6 w-11 rounded-full bg-line-strong transition-colors peer-checked:bg-brand-500 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/25" />
        <span className="pointer-events-none absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </span>
      {label ? <span className="text-sm text-ink-soft">{label}</span> : null}
    </label>
  );
}

// ─── Divisores e títulos de seção ─────────────────────────────────────────────

export function SectionTitle({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3",
        className,
      )}
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
      {icon ? (
        <div className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
