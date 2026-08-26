import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-surface-alt px-6 py-20 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-brand-50 text-brand-500">
        <Compass className="size-8" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <p className="text-[13px] font-bold uppercase tracking-wider text-brand-500">
          Erro 404
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Essa página saiu de quadra
        </h1>
        <p className="max-w-md text-[15px] leading-relaxed text-ink-muted">
          O endereço não existe ou o produto saiu do catálogo. Volte para a vitrine e
          continue de onde parou.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" asChild>
          <Link href="/">Ir para a home</Link>
        </Button>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/categoria/raquetes">Ver raquetes</Link>
        </Button>
      </div>
    </div>
  );
}
