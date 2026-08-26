import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  AlertTriangle,
  BadgeCheck,
  CreditCard,
  MessageCircle,
  Package,
  QrCode,
  Truck,
} from "lucide-react";
import { productRepo } from "@/lib/data";
import { formatBRL, getInstallment, getSavings } from "@/lib/pricing";
import { Badge, Card, CardContent, CardHeader, CardTitle, SectionTitle } from "@/components/ui";
import { PriceBlock } from "@/components/product/price-block";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductActions } from "@/components/product/product-actions";
import { ProductCard } from "@/components/product/product-card";
import { ProductCarousel } from "@/components/product/product-carousel";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDeliveryInfo } from "@/components/layout/site-shell";
import { JsonLd } from "@/lib/seo/JsonLd";
import { breadcrumbJsonLd, faqJsonLd, productJsonLd } from "@/lib/seo/json-ld";
import { PRODUCT_FAQ } from "@/lib/seo/faq";
import { buildMetadata } from "@/lib/seo/metadata";
import { whatsAppContactUrl } from "@/lib/whatsapp/build-message";

export async function generateMetadata({
  params,
}: PageProps<"/produto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await productRepo.getBySlug(slug);
  if (!product) {
    return buildMetadata({
      title: "Produto não encontrado",
      path: `/produto/${slug}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: product.metaTitle ?? product.title,
    description: product.metaDescription ?? product.shortDescription,
    path: `/produto/${product.slug}`,
    type: "article",
    noIndex: !product.isActive,
    images: product.images.map((image) => ({
      url: image.url,
      alt: image.alt ?? product.title,
    })),
  });
}

export async function generateStaticParams() {
  const products = await productRepo.list();
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: PageProps<"/produto/[slug]">) {
  const { slug } = await params;
  const product = await productRepo.getBySlug(slug);
  if (!product) notFound();

  const [related, delivery] = await Promise.all([
    productRepo.related(product.id, 10),
    getDeliveryInfo(),
  ]);

  const savings = getSavings(product.price, product.compareAtPrice);
  const installment = getInstallment(product.price);
  const lowStock = product.stock > 0 && product.stock <= 3;

  const crumbs = [
    { name: product.category.name, path: `/categoria/${product.category.slug}` },
    { name: product.title, path: `/produto/${product.slug}` },
  ];

  return (
    <div className="space-y-10">
      <JsonLd
        data={[
          productJsonLd(product),
          breadcrumbJsonLd(crumbs),
          faqJsonLd([...PRODUCT_FAQ]),
        ]}
      />

      <Breadcrumbs items={crumbs} />

      {!product.isActive ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-accent-500/35 bg-accent-100 px-4 py-3 text-sm text-accent-700"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>
            Este produto está fora de linha e não aparece mais na vitrine. Consulte
            peças remanescentes pelo WhatsApp.
          </p>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] xl:gap-10">
        {/* ─── Coluna esquerda: galeria + conteúdo ────────────────────────── */}
        <div className="min-w-0 space-y-8">
          <ProductGallery images={product.images} title={product.title} />

          <section className="space-y-4">
            <SectionTitle title="Descrição" />
            <div className="prose-naka max-w-3xl text-[15px]">
              {product.description.split("\n\n").map((paragraph, index) => (
                <p key={index}>{renderInlineBold(paragraph)}</p>
              ))}
            </div>
          </section>

          {product.specs.length > 0 ? (
            <section className="space-y-4">
              <SectionTitle title="Especificações" />
              <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
                <table className="w-full text-sm">
                  <caption className="sr-only">
                    Especificações técnicas de {product.title}
                  </caption>
                  <tbody className="divide-y divide-line">
                    {product.specs.map((spec) => (
                      <tr key={spec.label} className="even:bg-surface-alt/60">
                        <th
                          scope="row"
                          className="w-2/5 px-4 py-3 text-left font-medium text-ink-muted"
                        >
                          {spec.label}
                        </th>
                        <td className="px-4 py-3 font-medium text-ink">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <SectionTitle title="Perguntas frequentes" />
            <div className="space-y-2.5">
              {PRODUCT_FAQ.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-xl border border-line bg-surface px-5 py-4 shadow-card open:border-brand-200"
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
        </div>

        {/* ─── Coluna direita: compra ─────────────────────────────────────── */}
        <div className="lg:sticky lg:top-[10.5rem] lg:h-fit">
          <div className="space-y-5 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
            <header className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                {product.brand ? (
                  <Badge variant="brand" size="sm">
                    {product.brand}
                  </Badge>
                ) : null}
                <Link
                  href={`/categoria/${product.category.slug}`}
                  className="text-[12px] font-medium text-brand-500 underline-offset-2 hover:underline"
                >
                  {product.category.name}
                </Link>
              </div>

              <h1 className="text-[22px] font-bold leading-tight tracking-tight text-ink sm:text-2xl">
                {product.title}
              </h1>

              <p className="text-[13.5px] leading-relaxed text-ink-muted">
                {product.shortDescription}
              </p>

              {product.sku ? (
                <p className="text-[12px] text-ink-muted">
                  SKU <span className="font-medium text-ink-soft">{product.sku}</span>
                </p>
              ) : null}
            </header>

            <div className="border-t border-line pt-5">
              <PriceBlock
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                size="lg"
                showSavings
              />

              <div className="mt-4 space-y-2 rounded-xl bg-surface-alt p-3.5">
                <p className="flex items-center gap-2 text-[13.5px] text-ink-soft">
                  <CreditCard className="size-4 shrink-0 text-brand-500" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold text-ink">
                      {installment.label}
                    </strong>{" "}
                    no cartão
                  </span>
                </p>
                <p className="flex items-center gap-2 text-[13.5px] text-ink-soft">
                  <QrCode className="size-4 shrink-0 text-success-600" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold text-success-600">
                      {formatBRL(product.price)}
                    </strong>{" "}
                    à vista no Pix
                  </span>
                </p>
                {savings ? (
                  <p className="flex items-center gap-2 text-[13.5px] text-ink-soft">
                    <BadgeCheck className="size-4 shrink-0 text-success-600" aria-hidden="true" />
                    Economia de{" "}
                    <strong className="font-semibold text-success-600">
                      {formatBRL(savings)}
                    </strong>
                  </p>
                ) : null}
              </div>
            </div>

            {lowStock ? (
              <p className="flex items-center gap-2 rounded-lg border border-accent-500/35 bg-accent-100 px-3 py-2.5 text-[13.5px] font-semibold text-accent-700">
                <Package className="size-4 shrink-0" aria-hidden="true" />
                Últimas {product.stock} unidades em estoque
              </p>
            ) : null}

            {product.stock <= 0 ? (
              <p className="flex items-center gap-2 rounded-lg border border-line bg-surface-alt px-3 py-2.5 text-[13.5px] text-ink-soft">
                <Package className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                Sem estoque no momento — consulte a previsão pelo WhatsApp.
              </p>
            ) : null}

            <ProductActions
              product={{
                productId: product.id,
                slug: product.slug,
                title: product.title,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                image: product.images[0]?.url ?? "/brand/placeholder.svg",
              }}
              delivery={delivery}
            />
          </div>

          <Card className="mt-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <CreditCard className="size-4 text-brand-500" aria-hidden="true" />
                Formas de pagamento e entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-[13.5px] leading-relaxed text-ink-soft">
              {product.paymentInfo.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </CardContent>
          </Card>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 shadow-card">
            <Truck className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />
            <p className="text-[13px] leading-relaxed text-ink-muted">
              Frete calculado no atendimento, conforme o CEP.{" "}
              <a
                href={whatsAppContactUrl(
                  `Olá! Quero saber o frete para o produto: ${product.title}`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-brand-500 underline-offset-2 hover:underline"
              >
                <MessageCircle className="size-3.5" aria-hidden="true" />
                Consultar frete
              </a>
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="space-y-5">
          <SectionTitle
            title="Produtos relacionados"
            description={`Outros itens de ${product.category.name.toLowerCase()}.`}
          />
          <ProductCarousel>
            {related.map((item) => (
              <ProductCard key={item.id} product={item} sizes="240px" />
            ))}
          </ProductCarousel>
        </section>
      ) : null}
    </div>
  );
}

/** Renderiza **negrito** vindo do texto do admin, sem interpretar HTML. */
function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}
