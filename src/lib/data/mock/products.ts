import { normalize, uniqueSlug } from "@/lib/utils";
import type {
  CatalogStats,
  Paginated,
  Product,
  ProductFilters,
  ProductRepository,
  ProductSort,
} from "@/lib/data/types";
import { db, nextId } from "./store";

const DEFAULT_PER_PAGE = 12;

function sortProducts(items: Product[], sort: ProductSort = "relevance") {
  const sorted = [...items];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "newest":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    default:
      // Relevância: destaques primeiro, depois com desconto, depois mais recentes.
      return sorted.sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        const aDiscount = a.compareAtPrice && a.compareAtPrice > a.price ? 1 : 0;
        const bDiscount = b.compareAtPrice && b.compareAtPrice > b.price ? 1 : 0;
        if (aDiscount !== bDiscount) return bDiscount - aDiscount;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }
}

function matchesQuery(product: Product, query: string) {
  const q = normalize(query);
  if (!q) return true;
  const terms = q.split(/\s+/).filter(Boolean);
  const haystack = normalize(
    [product.title, product.shortDescription, product.brand ?? "", product.category.name]
      .join(" ")
      .concat(" ", product.sku ?? ""),
  );
  return terms.every((term) => haystack.includes(term));
}

function applyFilters(filters: ProductFilters = {}) {
  let items = db.products;
  if (!filters.includeInactive) items = items.filter((p) => p.isActive);
  if (filters.categorySlug)
    items = items.filter((p) => p.category.slug === filters.categorySlug);
  if (filters.query) items = items.filter((p) => matchesQuery(p, filters.query!));
  if (typeof filters.minPrice === "number")
    items = items.filter((p) => p.price >= filters.minPrice!);
  if (typeof filters.maxPrice === "number")
    items = items.filter((p) => p.price <= filters.maxPrice!);
  if (filters.onlyFeatured) items = items.filter((p) => p.isFeatured);
  if (filters.onlyDiscounted)
    items = items.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
  return sortProducts(items, filters.sort);
}

function paginate<T>(items: T[], page = 1, perPage = DEFAULT_PER_PAGE): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total: items.length,
    page: safePage,
    perPage,
    totalPages,
  };
}

function categoryOf(categoryId: string) {
  const category = db.categories.find((c) => c.id === categoryId);
  if (!category) throw new Error(`Categoria não encontrada: ${categoryId}`);
  return { id: category.id, name: category.name, slug: category.slug };
}

export const mockProductRepo: ProductRepository = {
  async list(filters) {
    const items = applyFilters(filters);
    return filters?.limit ? items.slice(0, filters.limit) : items;
  },

  async getBySlug(slug) {
    return db.products.find((p) => p.slug === slug) ?? null;
  },

  async getById(id) {
    return db.products.find((p) => p.id === id) ?? null;
  },

  async listByCategory(categorySlug, opts = {}) {
    const items = applyFilters({
      categorySlug,
      sort: opts.sort,
      minPrice: opts.minPrice,
      maxPrice: opts.maxPrice,
      includeInactive: opts.includeInactive,
    });
    return paginate(items, opts.page, opts.perPage);
  },

  async search(query, opts = {}) {
    const items = applyFilters({
      query,
      sort: opts.sort,
      minPrice: opts.minPrice,
      maxPrice: opts.maxPrice,
      includeInactive: opts.includeInactive,
    });
    return paginate(items, opts.page, opts.perPage);
  },

  async related(productId, limit = 8) {
    const product = db.products.find((p) => p.id === productId);
    if (!product) return [];
    const sameCategory = db.products.filter(
      (p) => p.isActive && p.id !== productId && p.categoryId === product.categoryId,
    );
    const fill = db.products.filter(
      (p) => p.isActive && p.id !== productId && p.categoryId !== product.categoryId,
    );
    return sortProducts(sameCategory, "relevance")
      .concat(sortProducts(fill, "relevance"))
      .slice(0, limit);
  },

  async getManyByIds(ids) {
    const set = new Set(ids);
    return db.products.filter((p) => set.has(p.id));
  },

  async priceRange(categorySlug) {
    const items = db.products.filter(
      (p) => p.isActive && (!categorySlug || p.category.slug === categorySlug),
    );
    if (items.length === 0) return { min: 0, max: 0 };
    const prices = items.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  },

  async stats() {
    const byCategory = db.categories.map((category) => ({
      categoryId: category.id,
      name: category.name,
      slug: category.slug,
      count: db.products.filter((p) => p.categoryId === category.id).length,
    }));
    const stats: CatalogStats = {
      totalProducts: db.products.length,
      activeProducts: db.products.filter((p) => p.isActive).length,
      featuredProducts: db.products.filter((p) => p.isFeatured).length,
      withoutImage: db.products.filter((p) => p.images.length === 0).length,
      outOfStock: db.products.filter((p) => p.stock <= 0).length,
      discounted: db.products.filter(
        (p) => p.compareAtPrice && p.compareAtPrice > p.price,
      ).length,
      byCategory,
    };
    return stats;
  },

  async create(input) {
    const id = nextId("prd");
    const slug = uniqueSlug(
      input.slug?.trim() || input.title,
      db.products.map((p) => p.slug),
    );
    const nowIso = new Date().toISOString();
    const product: Product = {
      id,
      title: input.title,
      slug,
      shortDescription: input.shortDescription,
      description: input.description,
      price: input.price,
      compareAtPrice: input.compareAtPrice ?? null,
      paymentInfo: input.paymentInfo,
      brand: input.brand ?? null,
      sku: input.sku ?? null,
      stock: input.stock,
      isActive: input.isActive,
      isFeatured: input.isFeatured,
      categoryId: input.categoryId,
      category: categoryOf(input.categoryId),
      images: input.images.map((image, index) => ({
        id: `${id}_img_${index + 1}`,
        url: image.url,
        publicId: image.publicId,
        alt: image.alt ?? null,
        width: image.width ?? null,
        height: image.height ?? null,
        position: image.position,
      })),
      specs: input.specs,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    db.products.unshift(product);
    return product;
  },

  async update(id, input) {
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Produto não encontrado.");
    const current = db.products[index];
    const slug =
      input.slug !== undefined || input.title !== undefined
        ? uniqueSlug(
            input.slug?.trim() || input.title || current.title,
            db.products.filter((p) => p.id !== id).map((p) => p.slug),
          )
        : current.slug;

    const updated: Product = {
      ...current,
      ...input,
      slug,
      compareAtPrice:
        input.compareAtPrice === undefined
          ? current.compareAtPrice
          : (input.compareAtPrice ?? null),
      brand: input.brand === undefined ? current.brand : (input.brand ?? null),
      sku: input.sku === undefined ? current.sku : (input.sku ?? null),
      metaTitle:
        input.metaTitle === undefined ? current.metaTitle : (input.metaTitle ?? null),
      metaDescription:
        input.metaDescription === undefined
          ? current.metaDescription
          : (input.metaDescription ?? null),
      category: input.categoryId ? categoryOf(input.categoryId) : current.category,
      images: input.images
        ? input.images.map((image, i) => ({
            id: `${id}_img_${i + 1}`,
            url: image.url,
            publicId: image.publicId,
            alt: image.alt ?? null,
            width: image.width ?? null,
            height: image.height ?? null,
            position: image.position,
          }))
        : current.images,
      specs: input.specs ?? current.specs,
      updatedAt: new Date().toISOString(),
    };
    db.products[index] = updated;
    return updated;
  },

  async remove(id) {
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Produto não encontrado.");
    db.products.splice(index, 1);
  },
};
