import Image from "next/image";
import type { Metadata } from "next";
import { Clock, MapPin, MessageCircle, Trophy } from "lucide-react";
import { aboutRepo } from "@/lib/data";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/lib/seo/JsonLd";
import { aboutPageJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { truncate } from "@/lib/utils";
import { whatsAppContactUrl } from "@/lib/whatsapp/build-message";

export async function generateMetadata(): Promise<Metadata> {
  const about = await aboutRepo.get();
  return buildMetadata({
    title: about.title,
    description: truncate(about.content.replace(/[*\n]+/g, " ").trim(), 158),
    path: "/quem-somos",
    images: about.images.map((image) => ({ url: image.url, alt: image.alt })),
  });
}

const FACTS = [
  {
    icon: Trophy,
    title: "Desde 2016",
    body: "Quase dez anos atendendo jogadores de tênis e beach tennis.",
  },
  {
    icon: MapPin,
    title: "Santa Fé do Sul/SP",
    body: "Loja física com retirada no local e envio para todo o Brasil.",
  },
  {
    icon: Clock,
    title: "Encordoamento no dia",
    body: "Raquete entregue até as 14h volta encordoada no fim da tarde.",
  },
];

export default async function AboutPage() {
  const about = await aboutRepo.get();
  const crumbs = [{ name: about.title, path: "/quem-somos" }];

  return (
    <div className="space-y-8">
      <JsonLd
        data={[
          aboutPageJsonLd(
            about.title,
            truncate(about.content.replace(/[*\n]+/g, " ").trim(), 200),
          ),
          breadcrumbJsonLd(crumbs),
        ]}
      />

      <Breadcrumbs items={crumbs} />

      <header className="overflow-hidden rounded-2xl bg-brand-900 px-6 py-10 shadow-elevated sm:px-10 sm:py-12">
        <p className="text-[12px] font-bold uppercase tracking-wider text-accent-400">
          NakaTenis
        </p>
        <h1 className="mt-2 max-w-2xl text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          {about.title}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-brand-100">
          Loja de bairro que virou referência de quadra. Aqui a indicação vem com o
          porquê.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-3">
        {FACTS.map((fact) => (
          <li
            key={fact.title}
            className="rounded-xl border border-line bg-surface p-5 shadow-card"
          >
            <span className="grid size-10 place-items-center rounded-lg bg-brand-50 text-brand-500">
              <fact.icon className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-3 text-[15px] font-semibold text-ink">{fact.title}</h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-ink-muted">
              {fact.body}
            </p>
          </li>
        ))}
      </ul>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="prose-naka max-w-3xl text-[15px]">
          {about.content.split("\n\n").map((paragraph, index) => (
            <p key={index}>{renderInlineBold(paragraph)}</p>
          ))}
        </article>

        {about.images.length > 0 ? (
          <aside className="space-y-4">
            {about.images.map((image) => (
              <figure
                key={image.url}
                className="overflow-hidden rounded-xl border border-line bg-surface shadow-card"
              >
                <div className="relative aspect-[4/3] bg-surface-sunken">
                  <Image
                    src={image.url}
                    alt={image.alt ?? about.title}
                    fill
                    sizes="(min-width: 1024px) 20rem, 100vw"
                    className="object-cover"
                  />
                </div>
                {image.caption ? (
                  <figcaption className="px-4 py-3 text-[13px] leading-relaxed text-ink-muted">
                    {image.caption}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </aside>
        ) : null}
      </div>

      <section className="flex flex-col items-start gap-4 rounded-2xl border border-success-600/20 bg-success-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold tracking-tight text-ink">
            Quer conversar antes de comprar?
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
            É pelo WhatsApp que a gente confere tamanho, calcula frete e combina
            pagamento — de gente para gente.
          </p>
        </div>
        <Button variant="whatsapp" size="lg" asChild className="shrink-0">
          <a href={whatsAppContactUrl()} target="_blank" rel="noopener noreferrer">
            <MessageCircle aria-hidden="true" />
            Falar com a loja
          </a>
        </Button>
      </section>
    </div>
  );
}

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
