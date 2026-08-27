import Link from "next/link";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { getPublicCategories } from "@/lib/data/cached";
import { whatsAppContactUrl, WHATSAPP_NUMBER } from "@/lib/whatsapp/build-message";
import { Logo } from "./logo";

export async function Footer() {
  const categories = await getPublicCategories();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-brand-900 text-brand-100">
      <div className="mx-auto max-w-[92rem] px-4 py-12 xl:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo href={null} />
            <p className="max-w-xs text-[13.5px] leading-relaxed text-brand-200">
              Artigos esportivos para tênis e beach tennis desde 2016, em Santa Fé do
              Sul. Vitrine online, atendimento de gente e pedido fechado no WhatsApp.
            </p>
            <a
              href="https://www.instagram.com/nakamuraflavio/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-[13px] font-medium text-white transition-colors hover:border-accent-400 hover:text-accent-400"
            >
              <InstagramGlyph />
              @nakamuraflavio
            </a>
          </div>

          <nav aria-labelledby="footer-categorias">
            <h2
              id="footer-categorias"
              className="text-[11px] font-bold uppercase tracking-wider text-brand-300"
            >
              Categorias
            </h2>
            <ul className="mt-4 space-y-2.5">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categoria/${category.slug}`}
                    className="text-[13.5px] text-brand-200 transition-colors hover:text-white"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-institucional">
            <h2
              id="footer-institucional"
              className="text-[11px] font-bold uppercase tracking-wider text-brand-300"
            >
              Institucional
            </h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/quem-somos"
                  className="text-[13.5px] text-brand-200 transition-colors hover:text-white"
                >
                  Quem somos
                </Link>
              </li>
              <li>
                <Link
                  href="/carrinho"
                  className="text-[13.5px] text-brand-200 transition-colors hover:text-white"
                >
                  Meu carrinho
                </Link>
              </li>
              <li>
                <Link
                  href="/entrar"
                  className="text-[13.5px] text-brand-200 transition-colors hover:text-white"
                >
                  Entrar
                </Link>
              </li>
              <li>
                <Link
                  href="/cadastro"
                  className="text-[13.5px] text-brand-200 transition-colors hover:text-white"
                >
                  Criar conta
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-brand-300">
              Contato
            </h2>
            <ul className="mt-4 space-y-3 text-[13.5px] text-brand-200">
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-300" aria-hidden="true" />
                <a
                  href={`tel:+${WHATSAPP_NUMBER}`}
                  className="transition-colors hover:text-white"
                >
                  (17) 99181-4042
                </a>
              </li>
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-300" aria-hidden="true" />
                Santa Fé do Sul — SP
              </li>
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-brand-300" aria-hidden="true" />
                Seg a sex, 9h às 18h30 · Sáb, 9h às 13h
              </li>
            </ul>

            <a
              href={whatsAppContactUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-success-600 px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(21,128,61,0.5)] transition-colors hover:bg-success-700"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[92rem] flex-col gap-2 px-4 py-5 text-[12.5px] text-brand-300 sm:flex-row sm:items-center sm:justify-between xl:px-6">
          <p>© {year} NakaTenis. Todos os direitos reservados.</p>
          <p>
            Este site é uma vitrine — o pagamento não é processado aqui, e sim combinado
            no WhatsApp.
          </p>
        </div>
      </div>
    </footer>
  );
}

/** Lucide removeu os ícones de marca — glifo do Instagram desenhado à mão. */
function InstagramGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
