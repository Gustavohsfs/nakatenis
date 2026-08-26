import type { Category, Product } from "@/lib/data/types";
import { absoluteUrl, siteUrl } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp/build-message";
import { SITE_DESCRIPTION, SITE_NAME } from "./metadata";

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${siteUrl}#organization`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: siteUrl,
    logo: absoluteUrl("/brand/logo.svg"),
    image: absoluteUrl("/brand/logo.svg"),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Santa Fé do Sul",
      addressRegion: "SP",
      addressCountry: "BR",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: `+${WHATSAPP_NUMBER}`,
        availableLanguage: ["Portuguese"],
        areaServed: "BR",
      },
    ],
    sameAs: [
      `https://wa.me/${WHATSAPP_NUMBER}`,
      "https://www.instagram.com/nakamuraflavio/",
    ],
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}#website`,
    name: SITE_NAME,
    url: siteUrl,
    inLanguage: "pt-BR",
    publisher: { "@id": `${siteUrl}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/busca?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(product: Product): JsonLd {
  const url = absoluteUrl(`/produto/${product.slug}`);
  const priceValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90)
    .toISOString()
    .slice(0, 10);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription,
    url,
    sku: product.sku ?? product.id,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    category: product.category.name,
    image: product.images.length
      ? product.images.map((image) => absoluteUrl(image.url))
      : [absoluteUrl("/brand/placeholder.svg")],
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "BRL",
      price: (product.price / 100).toFixed(2),
      priceValidUntil,
      availability:
        product.isActive && product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${siteUrl}#organization` },
    },
    // Sem checkout no site não há como sustentar AggregateRating ou Review.
  };
}

export function itemListJsonLd(products: Product[], path: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: absoluteUrl(path),
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/produto/${product.slug}`),
      name: product.title,
    })),
  };
}

export function collectionPageJsonLd(category: Category, path: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description ?? SITE_DESCRIPTION,
    url: absoluteUrl(path),
    isPartOf: { "@id": `${siteUrl}#website` },
  };
}

export function aboutPageJsonLd(title: string, description: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: title,
    description,
    url: absoluteUrl("/quem-somos"),
    about: { "@id": `${siteUrl}#organization` },
    isPartOf: { "@id": `${siteUrl}#website` },
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
