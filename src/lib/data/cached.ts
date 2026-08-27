import { cache } from "react";
import { categoryRepo, productRepo } from "./index";
import type { ProductSort } from "./types";

/**
 * Dedupe por requisição (React cache).
 *
 * Header, Footer, Shell e generateMetadata pedem os mesmos dados dentro do
 * MESMO render — sem isto, uma navegação para /categoria/[slug] fazia ~10
 * idas ao banco (3× categorias, 2× categoria, 2× listagem paginada…). Com o
 * cache() do React, cada consulta vira uma ida só, e o resultado morre junto
 * com a requisição: zero risco de servir dado velho.
 *
 * Os argumentos são primitivos de propósito: o cache() compara por identidade,
 * e um objeto de opções criado inline nunca bateria com o da chamada anterior.
 */
export const getPublicCategories = cache(() =>
  categoryRepo.list({ withCounts: true }),
);

export const getCategoryBySlugCached = cache((slug: string) =>
  categoryRepo.getBySlug(slug),
);

export const getProductBySlugCached = cache((slug: string) =>
  productRepo.getBySlug(slug),
);

export const listCategoryPageCached = cache(
  (
    slug: string,
    page: number,
    perPage: number,
    sort: ProductSort,
    minPrice?: number,
    maxPrice?: number,
  ) => productRepo.listByCategory(slug, { page, perPage, sort, minPrice, maxPrice }),
);
