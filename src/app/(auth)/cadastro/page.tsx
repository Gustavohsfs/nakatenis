import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/guards";
import { Card, CardContent } from "@/components/ui";
import { buildMetadata } from "@/lib/seo/metadata";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = buildMetadata({
  title: "Criar conta",
  description:
    "Crie sua conta NakaTenis para salvar endereços e agilizar o pedido pelo WhatsApp. Comprar não exige cadastro.",
  path: "/cadastro",
  noIndex: true,
});

export default async function SignUpPage({ searchParams }: PageProps<"/cadastro">) {
  const raw = (await searchParams) as { callbackUrl?: string };
  const user = await getSessionUser();

  const callbackUrl =
    raw.callbackUrl?.startsWith("/") && !raw.callbackUrl.startsWith("//")
      ? raw.callbackUrl
      : "/conta";

  if (user) redirect(callbackUrl);

  return (
    <div className="space-y-5 py-4">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Criar sua conta
        </h1>
        <p className="mx-auto max-w-lg text-[15px] text-ink-muted">
          Cadastro é opcional: serve para guardar seu endereço e não ter que digitá-lo a
          cada pedido no WhatsApp.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <SignUpForm callbackUrl={callbackUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
