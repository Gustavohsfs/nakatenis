import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Marca desenhada em SVG inline — sem request extra e sem layout shift
 * no header enquanto a fonte carrega.
 */
export function Logo({
  className,
  tone = "light",
  href = "/",
}: {
  className?: string;
  tone?: "light" | "dark";
  href?: string | null;
}) {
  const mark = (
    <span className={cn("flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 64 64"
        className="size-9 shrink-0 drop-shadow-sm"
        aria-hidden="true"
      >
        <rect
          width="64"
          height="64"
          rx="14"
          fill={tone === "light" ? "#ffffff" : "#0B2545"}
          fillOpacity={tone === "light" ? 0.12 : 1}
        />
        <circle cx="32" cy="32" r="17" fill="#F2A93B" />
        <path
          d="M17.6 23.4c7.6 1.6 12.2 7 13 17.6"
          fill="none"
          stroke="#0B2545"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M46.4 23.4c-7.6 1.6-12.2 7-13 17.6"
          fill="none"
          stroke="#0B2545"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={cn(
          "text-xl font-bold tracking-tight",
          tone === "light" ? "text-white" : "text-brand-900",
        )}
      >
        Naka
        <span className={tone === "light" ? "text-accent-400" : "text-brand-500"}>
          Tenis
        </span>
      </span>
    </span>
  );

  if (!href) return mark;

  return (
    <Link href={href} className="rounded-lg" aria-label="NakaTenis — página inicial">
      {mark}
    </Link>
  );
}
