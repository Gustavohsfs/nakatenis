import type { Metadata } from "next";
import { absoluteUrl, siteUrl, truncate } from "@/lib/utils";

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "NakaTenis";
export const SITE_DESCRIPTION =
  "Loja de artigos esportivos para tênis e beach tennis: raquetes, calçados, roupas e acessórios. Atendimento e fechamento do pedido pelo WhatsApp.";
export const SITE_LOCALE = "pt_BR";

type BuildMetadataInput = {
  title: string;
  description?: string;
  path: string;
  images?: { url: string; alt?: string | null }[];
  type?: "website" | "article";
  noIndex?: boolean;
  /** Paginação lógica — §9.1 do brief. */
  prev?: string;
  next?: string;
};

export function buildMetadata({
  title,
  description,
  path,
  images,
  type = "website",
  noIndex,
  prev,
  next,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const desc = truncate(description ?? SITE_DESCRIPTION, 160);
  const ogImages = (images?.length ? images : [{ url: "/opengraph-image", alt: SITE_NAME }])
    .map((image) => ({
      url: image.url.startsWith("http") ? image.url : absoluteUrl(image.url),
      alt: image.alt ?? title,
    }));

  return {
    title,
    description: desc,
    alternates: {
      canonical: url,
      ...(prev || next
        ? { types: { ...(prev ? { prev } : {}), ...(next ? { next } : {}) } }
        : {}),
    },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description: desc,
      locale: SITE_LOCALE,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: ogImages.map((image) => image.url),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    ...(prev || next
      ? {
          other: {
            ...(prev ? { "link:prev": prev } : {}),
            ...(next ? { "link:next": next } : {}),
          },
        }
      : {}),
  };
}

export const metadataBase = new URL(siteUrl);
