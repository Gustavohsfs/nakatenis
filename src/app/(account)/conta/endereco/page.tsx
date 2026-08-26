import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guards";
import { userRepo } from "@/lib/data";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AccountNav } from "@/components/layout/account-nav";
import { buildMetadata } from "@/lib/seo/metadata";
import { AddressManager } from "./address-manager";

export const metadata: Metadata = buildMetadata({
  title: "Meus endereços",
  path: "/conta/endereco",
  noIndex: true,
});

export default async function AddressPage() {
  const session = await requireUser("/conta/endereco");
  const user = await userRepo.getById(session.id);
  if (!user) return null;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { name: "Minha conta", path: "/conta" },
          { name: "Endereços", path: "/conta/endereco" },
        ]}
      />

      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Meus endereços
        </h1>
        <p className="text-[15px] text-ink-muted">
          O endereço padrão é enviado junto na mensagem do WhatsApp.
        </p>
      </header>

      <div className="flex flex-col gap-6 sm:flex-row">
        <AccountNav />
        <div className="min-w-0 flex-1">
          <AddressManager addresses={user.addresses} />
        </div>
      </div>
    </div>
  );
}
