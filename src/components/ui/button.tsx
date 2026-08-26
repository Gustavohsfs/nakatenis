import { Slot } from "@/components/ui/slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-500 text-white shadow-brand hover:bg-brand-600 focus-visible:outline-brand-700",
        accent:
          "bg-accent-500 text-brand-950 shadow-accent hover:bg-accent-400 focus-visible:outline-accent-700",
        whatsapp:
          "bg-success-600 text-white shadow-[0_8px_20px_-6px_rgba(21,128,61,0.5)] hover:bg-success-700",
        secondary:
          "border border-brand-200 bg-white text-brand-700 shadow-card hover:border-brand-300 hover:bg-brand-50",
        ghost: "text-brand-700 hover:bg-brand-50",
        "ghost-light": "text-white/85 hover:bg-white/10 hover:text-white",
        outline:
          "border border-line-strong bg-white text-ink-soft hover:border-ink-muted hover:bg-surface-alt",
        danger:
          "bg-danger-600 text-white shadow-[0_8px_20px_-6px_rgba(185,28,28,0.45)] hover:bg-danger-700",
        "danger-soft":
          "border border-danger-600/25 bg-danger-50 text-danger-700 hover:bg-danger-600 hover:text-white",
        link: "text-brand-500 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3.5 text-[13px] [&_svg]:size-4",
        md: "h-11 px-5 text-sm [&_svg]:size-[18px]",
        lg: "h-13 px-7 text-base [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-[18px]",
        "icon-sm": "size-8 rounded-md [&_svg]:size-4",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...(asChild ? {} : { type: type ?? "button" })}
      {...props}
    />
  );
}

export { buttonVariants };
