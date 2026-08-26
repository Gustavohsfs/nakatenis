import type { MetadataRoute } from "next";
import { aboutRepo, categoryRepo, productRepo } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, about] = await Promise.all([
    categoryRepo.list(),
    productRepo.list(),
    aboutRepo.get(),
  ]);

  const now = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/quem-somos"),
      lastModified: new Date(about.updatedAt),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...categories.map((category) => ({
      url: absoluteUrl(`/categoria/${category.slug}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/produto/${product.slug}`),
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
