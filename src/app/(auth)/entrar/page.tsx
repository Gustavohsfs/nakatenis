import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { getSessionUser } from "@/lib/auth/guards";
import { Card, CardContent } from "@/components/ui";
import { buildMetadata } from "@/lib/seo/metadata";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = buildMetadata({
  title: "Entrar",
  description:
    "Acesse sua conta NakaTenis para salvar endereços e agilizar o pedido pelo WhatsApp.",
  path: "/entrar",
  noIndex: true,
});

export default async function SignInPage({ searchParams }: PageProps<"/entrar">) {
  const raw = (await searchParams) as { callbackUrl?: string; error?: string };
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
          Entrar na sua conta
        </h1>
        <p className="text-[15px] text-ink-muted">
          Login é opcional — serve para salvar seu endereço e agilizar o pedido.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <SignInForm callbackUrl={callbackUrl} errorFromUrl={raw.error} />
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-2 text-center text-[13.5px] text-ink-muted">
        <ShoppingBag className="size-4 shrink-0" aria-hidden="true" />
        Não precisa de conta para comprar.{" "}
        <Link href="/" className="font-semibold text-brand-500 underline-offset-4 hover:underline">
          Ver produtos
        </Link>
      </p>
    </div>
  );
}
