import Link from "next/link";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { userRepo } from "@/lib/data";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AccountNav } from "@/components/layout/account-nav";
import { Alert } from "@/components/ui";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatDate } from "@/lib/utils";
import { ProfileForm, PasswordForm } from "./profile-forms";

export const metadata: Metadata = buildMetadata({
  title: "Meus dados",
  path: "/conta",
  noIndex: true,
});

export default async function AccountPage() {
  const session = await requireUser("/conta");
  const user = await userRepo.getById(session.id);
  if (!user) return null;

  const hasAddress = user.addresses.length > 0;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ name: "Minha conta", path: "/conta" }]} />

      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Olá, {user.name.split(" ")[0]}
        </h1>
        <p className="text-[15px] text-ink-muted">
          Cliente desde {formatDate(user.createdAt)}.
        </p>
      </header>

      <div className="flex flex-col gap-6 sm:flex-row">
        <AccountNav />

        <div className="min-w-0 flex-1 space-y-5">
          {!hasAddress ? (
            <Alert variant="info">
              <p className="font-semibold">Você ainda não cadastrou um endereço</p>
              <p className="mt-1 text-[13.5px]">
                Com endereço salvo, ele entra automaticamente na mensagem do WhatsApp.{" "}
                <Link
                  href="/conta/endereco"
                  className="inline-flex items-center gap-1 font-semibold underline underline-offset-2"
                >
                  <MapPin className="size-3.5" aria-hidden="true" />
                  Cadastrar agora
                </Link>
              </p>
            </Alert>
          ) : null}

          <ProfileForm
            defaults={{
              name: user.name,
              email: user.email,
              phone: user.phone,
              cpf: user.cpf,
            }}
          />
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
