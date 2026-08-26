import { categoryRepo, userRepo } from "@/lib/data";
import { getSessionUser } from "@/lib/auth/guards";
import type { DeliveryInfo } from "@/lib/whatsapp/build-message";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Header } from "./header";
import { Footer } from "./footer";
import { MobileNav } from "./mobile-nav";
import { CategorySidebar } from "./category-sidebar";

/**
 * Monta os dados de entrega que entram na mensagem do WhatsApp.
 * Só existe com usuário logado E endereço cadastrado — caso contrário o bloco
 * é omitido inteiro da mensagem (§5.5 do brief).
 */
export async function getDeliveryInfo(): Promise<DeliveryInfo | null> {
  const session = await getSessionUser();
  if (!session) return null;
  const user = await userRepo.getById(session.id);
  if (!user) return null;
  const address = user.addresses.find((a) => a.isDefault) ?? user.addresses[0];
  if (!address) return null;
  return {
    name: user.name,
    phone: user.phone,
    address: {
      street: address.street,
      number: address.number,
      complement: address.complement,
      district: address.district,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
    },
  };
}

export async function SiteShell({
  children,
  withSidebar = false,
  contentClassName,
}: {
  children: React.ReactNode;
  withSidebar?: boolean;
  contentClassName?: string;
}) {
  const [categories, delivery] = await Promise.all([
    categoryRepo.list({ withCounts: true }),
    getDeliveryInfo(),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#conteudo" className="skip-link rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-elevated">
        Pular para o conteúdo
      </a>

      <Header />

      <div className="mx-auto flex w-full max-w-[92rem] flex-1 gap-6 px-4 py-6 xl:px-6">
        {withSidebar ? <CategorySidebar categories={categories} /> : null}
        <main id="conteudo" className={contentClassName ?? "min-w-0 flex-1"}>
          {children}
        </main>
      </div>

      <Footer />

      <MobileNav categories={categories} />
      <CartDrawer delivery={delivery} />
    </div>
  );
}
