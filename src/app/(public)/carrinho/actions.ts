"use server";

import { productRepo } from "@/lib/data";

export type FreshCartProduct = {
  title: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  stock: number;
  isActive: boolean;
};

/**
 * Revalida o carrinho persistido contra o repositório.
 * Preço salvo no localStorage há duas semanas está desatualizado — e vira
 * reclamação no WhatsApp se ninguém avisar.
 */
export async function fetchFreshCartProducts(
  ids: string[],
): Promise<Record<string, FreshCartProduct>> {
  if (ids.length === 0) return {};
  const products = await productRepo.getManyByIds(ids.slice(0, 100));
  return Object.fromEntries(
    products.map((product) => [
      product.id,
      {
        title: product.title,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: product.images[0]?.url ?? "/brand/placeholder.svg",
        stock: product.stock,
        isActive: product.isActive,
      },
    ]),
  );
}
