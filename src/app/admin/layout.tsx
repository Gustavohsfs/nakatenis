import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, MessageCircle } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { dataSource } from "@/lib/data";
import { storageDriver } from "@/lib/storage";
import { Logo } from "@/components/layout/logo";
import { AdminNav, AdminSignOut } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s | Painel NakaTenis" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Guard de verdade: usuário sem papel ADMIN recebe 404, não 403.
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-col bg-surface-alt">
      <header className="sticky top-0 z-40 bg-brand-950 shadow-nav">
        <div className="mx-auto flex h-16 max-w-[92rem] items-center gap-4 px-4 xl:px-6">
          <Logo href="/admin" />
          <span className="hidden rounded-md bg-accent-500 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-950 sm:inline">
            Painel
          </span>

          <div className="ml-auto flex items-center gap-1.5">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-brand-200 transition-colors hover:bg-white/10 hover:text-white sm:flex"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Ver a loja
            </Link>
            <span className="hidden max-w-40 truncate px-2 text-[13px] text-brand-200 md:inline">
              {admin.name ?? admin.email}
            </span>
            <AdminSignOut />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[92rem] flex-1 flex-col gap-6 px-4 py-6 lg:flex-row xl:px-6">
        <AdminNav />

        <main className="min-w-0 flex-1 space-y-6">
          {dataSource === "mock" ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-accent-500/35 bg-accent-100 px-4 py-2.5 text-[13px] text-accent-700">
              <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
              <strong className="font-semibold">Modo mock ativo.</strong>
              <span>
                As alterações ficam em memória e somem ao reiniciar o servidor. Storage:{" "}
                <code className="rounded bg-white/60 px-1 font-mono">
                  {storageDriver}
                </code>
                . Troque <code className="rounded bg-white/60 px-1 font-mono">DATA_SOURCE=prisma</code>{" "}
                no .env para persistir no banco.
              </span>
            </div>
          ) : null}

          {children}
        </main>
      </div>
    </div>
  );
}
