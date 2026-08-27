import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Backpack,
  Footprints,
  MessageCircle,
  Percent,
  Shirt,
  ShieldCheck,
  Tag,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { productRepo } from "@/lib/data";
import { getPublicCategories } from "@/lib/data/cached";
import { Button } from "@/components/ui/button";
import { Badge, SectionTitle } from "@/components/ui";
import { ProductCard, ProductGrid } from "@/components/product/product-card";
import { ProductCarousel } from "@/components/product/product-carousel";
import { JsonLd } from "@/lib/seo/JsonLd";
import { faqJsonLd, itemListJsonLd } from "@/lib/seo/json-ld";
import { HOME_FAQ } from "@/lib/seo/faq";
import { buildMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { whatsAppContactUrl } from "@/lib/whatsapp/build-message";

export const metadata: Metadata = buildMetadata({
  title: `${SITE_NAME} — Raquetes, calçados e roupas de tênis e beach tennis`,
  description:
    "Raquetes de tênis e beach tennis, calçados de quadra, saibro e areia, roupas dry-fit e acessórios. Loja em Santa Fé do Sul com pedido fechado pelo WhatsApp.",
  path: "/",
});

// ISR: home pronta em cache, revalidada a cada 60s (e purgada na hora pelo
// admin via revalidatePath). Nenhuma leitura de sessão neste arquivo.
export const revalidate = 60;

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  racket: Tag,
  shoe: Footprints,
  shirt: Shirt,
  bag: Backpack,
};

export default async function HomePage() {
  const [categories, featured, newest, discounted] = await Promise.all([
    getPublicCategories(),
    productRepo.list({ onlyFeatured: true, limit: 10 }),
    productRepo.list({ sort: "newest", limit: 8 }),
    productRepo.list({ onlyDiscounted: true, sort: "relevance", limit: 10 }),
  ]);

  return (
    <div className="space-y-12">
      <JsonLd
        data={[itemListJsonLd(featured, "/"), faqJsonLd([...HOME_FAQ])]}
      />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-brand-900 shadow-elevated">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_15%,rgba(27,108,168,0.55),transparent_60%),radial-gradient(80%_80%_at_10%_100%,rgba(242,169,59,0.22),transparent_60%)]"
        />
        <div className="relative grid gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div className="space-y-5">
            <Badge variant="new" size="sm" className="uppercase tracking-wide">
              Tênis e beach tennis
            </Badge>
            <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              A raquete certa para o seu jogo — não a mais cara da vitrine.
            </h1>
            <p className="max-w-xl text-pretty text-[15px] leading-relaxed text-brand-100 sm:text-base">
              Quase dez anos vendendo raquete, calçado, roupa e acessório para quem joga
              de verdade em Santa Fé do Sul. Você monta o carrinho aqui e a gente
              fecha no WhatsApp — com frete e pagamento combinados de gente para gente.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button size="lg" variant="accent" asChild>
                <Link href="/categoria/raquetes">
                  Ver raquetes
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost-light" asChild>
                <a
                  href={whatsAppContactUrl(
                    "Olá! Quero uma indicação de raquete. Meu nível de jogo é:",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle aria-hidden="true" />
                  Pedir indicação
                </a>
              </Button>
            </div>

            <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-3 text-[13px] text-brand-200">
              <li className="flex items-center gap-1.5">
                <Truck className="size-4 text-accent-400" aria-hidden="true" />
                Envio para todo o Brasil
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-accent-400" aria-hidden="true" />
                Garantia em todos os itens
              </li>
              <li className="flex items-center gap-1.5">
                <Percent className="size-4 text-accent-400" aria-hidden="true" />
                12x sem juros ou Pix
              </li>
            </ul>
          </div>

          {/* Atalhos das categorias */}
          <ul className="grid grid-cols-2 gap-3">
            {categories.map((category) => {
              const Icon = CATEGORY_ICONS[category.icon ?? ""] ?? Tag;
              return (
                <li key={category.id}>
                  <Link
                    href={`/categoria/${category.slug}`}
                    className="group flex h-full flex-col gap-2 rounded-xl border border-white/12 bg-white/8 p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-accent-400/60 hover:bg-white/14"
                  >
                    <span className="grid size-10 place-items-center rounded-lg bg-accent-500 text-brand-950">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-[15px] font-semibold text-white">
                      {category.name}
                    </span>
                    <span className="text-[12.5px] text-brand-200">
                      {category.productCount ?? 0}{" "}
                      {category.productCount === 1 ? "produto" : "produtos"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ─── Destaques ───────────────────────────────────────────────────── */}
      {featured.length > 0 ? (
        <section className="space-y-5">
          <SectionTitle
            title="Destaques da loja"
            description="Selecionados pelo Naka — o que sai da prateleira mais rápido."
            action={
              <Button variant="link" size="sm" asChild>
                <Link href="/categoria/raquetes">
                  Ver tudo
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            }
          />
          <ProductCarousel>
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} sizes="240px" />
            ))}
          </ProductCarousel>
        </section>
      ) : null}

      {/* ─── Ofertas ─────────────────────────────────────────────────────── */}
      {discounted.length > 0 ? (
        <section className="space-y-5 rounded-2xl bg-brand-50 p-5 sm:p-6">
          <SectionTitle
            title="Em promoção agora"
            description="Preço antigo riscado é preço que já foi praticado — sem inventar desconto."
            className="border-brand-200"
          />
          <ProductCarousel>
            {discounted.map((product) => (
              <ProductCard key={product.id} product={product} sizes="240px" />
            ))}
          </ProductCarousel>
        </section>
      ) : null}

      {/* ─── Novidades ───────────────────────────────────────────────────── */}
      <section className="space-y-5">
        <SectionTitle
          title="Chegou agora"
          description="Últimos produtos cadastrados na loja."
        />
        <ProductGrid products={newest} priorityCount={4} />
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="space-y-5">
        <SectionTitle
          title="Perguntas frequentes"
          description="O que mais perguntam antes de fechar o pedido."
        />
        <div className="grid gap-3 lg:grid-cols-2">
          {HOME_FAQ.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-line bg-surface px-5 py-4 shadow-card transition-colors open:border-brand-200"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink marker:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ─── CTA WhatsApp ────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-success-600/20 bg-success-50 p-6 sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              Ficou em dúvida entre dois modelos?
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
              Manda mensagem contando há quanto tempo você joga e onde costuma jogar. A
              indicação vem com o porquê — e sem empurrar a raquete mais cara.
            </p>
          </div>
          <Button variant="whatsapp" size="lg" asChild className="shrink-0">
            <a
              href={whatsAppContactUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle aria-hidden="true" />
              Falar com a loja
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
