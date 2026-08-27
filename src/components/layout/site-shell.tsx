import { getPublicCategories } from "@/lib/data/cached";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Header } from "./header";
import { Footer } from "./footer";
import { MobileNav } from "./mobile-nav";
import { CategorySidebar } from "./category-sidebar";

/**
 * A moldura do site NÃO lê sessão nem cookies — de propósito. É isso que
 * permite cachear as páginas públicas na borda. Tudo que depende do usuário
 * (menu de conta, endereço na mensagem do WhatsApp) é buscado pelo navegador
 * em /api/me/checkout-info depois do load.
 */
export async function SiteShell({
  children,
  withSidebar = false,
  contentClassName,
}: {
  children: React.ReactNode;
  withSidebar?: boolean;
  contentClassName?: string;
}) {
  const categories = await getPublicCategories();

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
      <CartDrawer />
    </div>
  );
}
