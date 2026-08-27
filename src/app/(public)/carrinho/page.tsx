import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CartPageClient } from "@/components/cart/cart-page-client";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Meu carrinho",
  description:
    "Revise os produtos escolhidos e finalize o pedido pelo WhatsApp. Frete e pagamento são combinados no atendimento.",
  path: "/carrinho",
  noIndex: true,
});

export default function CartPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ name: "Carrinho", path: "/carrinho" }]} />

      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Meu carrinho
        </h1>
        <p className="text-[15px] text-ink-muted">
          Confira os itens e finalize pelo WhatsApp. Nada é cobrado pelo site.
        </p>
      </header>

      <CartPageClient />
    </div>
  );
}
