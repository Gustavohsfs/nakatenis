import { uniqueSlug } from "@/lib/utils";
import type {
  CatalogStats,
  ListOpts,
  Paginated,
  Product,
  ProductFilters,
  ProductRepository,
  ProductSort,
} from "@/lib/data/types";
import { getPrisma } from "./client";
import { mapProduct, productInclude } from "./mappers";

const DEFAULT_PER_PAGE = 12;

type Where = Record<string, unknown>;

function orderBy(sort: ProductSort = "relevance") {
  switch (sort) {
    case "price-asc":
      return [{ price: "asc" as const }];
    case "price-desc":
      return [{ price: "desc" as const }];
    case "newest":
      return [{ createdAt: "desc" as const }];
    default:
      return [{ isFeatured: "desc" as const }, { createdAt: "desc" as const }];
  }
}

function buildWhere(filters: ProductFilters = {}): Where {
  const where: Where = {};
  if (!filters.includeInactive) where.isActive = true;
  if (filters.categorySlug) where.category = { slug: filters.categorySlug };
  if (filters.onlyFeatured) where.isFeatured = true;
  if (typeof filters.minPrice === "number" || typeof filters.maxPrice === "number") {
    where.price = {
      ...(typeof filters.minPrice === "number" ? { gte: filters.minPrice } : {}),
      ...(typeof filters.maxPrice === "number" ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.query) {
    // ILIKE sobre título + descrição curta + marca. Ver §7 do brief: só migrar
    // para tsvector/GIN se o catálogo passar de ~500 itens.
    const terms = filters.query.trim().split(/\s+/).filter(Boolean);
    where.AND = terms.map((term) => ({
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { shortDescription: { contains: term, mode: "insensitive" } },
        { brand: { contains: term, mode: "insensitive" } },
        { sku: { contains: term, mode: "insensitive" } },
      ],
    }));
  }
  return where;
}

async function paginateQuery(
  where: Where,
  opts: ListOpts,
): Promise<Paginated<Product>> {
  const prisma = getPrisma();
  const perPage = opts.perPage ?? DEFAULT_PER_PAGE;
  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, opts.page ?? 1), totalPages);
  const rows = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: orderBy(opts.sort),
    skip: (page - 1) * perPage,
    take: perPage,
  });
  return { items: rows.map(mapProduct), total, page, perPage, totalPages };
}

export const prismaProductRepo: ProductRepository = {
  async list(filters = {}) {
    const rows = await getPrisma().product.findMany({
      where: buildWhere(filters),
      include: productInclude,
      orderBy: orderBy(filters.sort),
      ...(filters.limit ? { take: filters.limit } : {}),
    });
    const items = rows.map(mapProduct);
    if (filters.onlyDiscounted) {
      return items.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
    }
    return items;
  },

  async getBySlug(slug) {
    const row = await getPrisma().product.findUnique({
      where: { slug },
      include: productInclude,
    });
    return row ? mapProduct(row) : null;
  },

  async getById(id) {
    const row = await getPrisma().product.findUnique({
      where: { id },
      include: productInclude,
    });
    return row ? mapProduct(row) : null;
  },

  async listByCategory(categorySlug, opts = {}) {
    return paginateQuery(
      buildWhere({
        categorySlug,
        minPrice: opts.minPrice,
        maxPrice: opts.maxPrice,
        includeInactive: opts.includeInactive,
      }),
      opts,
    );
  },

  async search(query, opts = {}) {
    return paginateQuery(
      buildWhere({
        query,
        minPrice: opts.minPrice,
        maxPrice: opts.maxPrice,
        includeInactive: opts.includeInactive,
      }),
      opts,
    );
  },

  async related(productId, limit = 8) {
    const prisma = getPrisma();
    const current = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });
    if (!current) return [];
    const rows = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: productId },
        categoryId: current.categoryId,
      },
      include: productInclude,
      orderBy: orderBy("relevance"),
      take: limit,
    });
    return rows.map(mapProduct);
  },

  async getManyByIds(ids) {
    if (ids.length === 0) return [];
    const rows = await getPrisma().product.findMany({
      where: { id: { in: ids } },
      include: productInclude,
    });
    return rows.map(mapProduct);
  },

  async priceRange(categorySlug) {
    const result = await getPrisma().product.aggregate({
      where: {
        isActive: true,
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
      _min: { price: true },
      _max: { price: true },
    });
    return { min: result._min.price ?? 0, max: result._max.price ?? 0 };
  },

  async stats() {
    const prisma = getPrisma();
    const [
      totalProducts,
      activeProducts,
      featuredProducts,
      withoutImage,
      outOfStock,
      categories,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isFeatured: true, isActive: true } }),
      prisma.product.count({ where: { images: { none: {} } } }),
      prisma.product.count({ where: { stock: { lte: 0 } } }),
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { products: true } },
        },
        orderBy: { position: "asc" },
      }),
    ]);

    const discountedRows = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "Product"
      WHERE "compareAtPrice" IS NOT NULL AND "compareAtPrice" > "price"
    `;

    const stats: CatalogStats = {
      totalProducts,
      activeProducts,
      featuredProducts,
      withoutImage,
      outOfStock,
      discounted: Number(discountedRows[0]?.count ?? 0),
      byCategory: categories.map((c) => ({
        categoryId: c.id,
        name: c.name,
        slug: c.slug,
        count: c._count.products,
      })),
    };
    return stats;
  },

  async create(input) {
    const prisma = getPrisma();
    const existing = await prisma.product.findMany({ select: { slug: true } });
    const slug = uniqueSlug(
      input.slug?.trim() || input.title,
      existing.map((p) => p.slug),
    );
    const row = await prisma.product.create({
      data: {
        title: input.title,
        slug,
        shortDescription: input.shortDescription,
        description: input.description,
        price: input.price,
        compareAtPrice: input.compareAtPrice ?? null,
        paymentInfo: input.paymentInfo,
        brand: input.brand ?? null,
        sku: input.sku || null,
        stock: input.stock,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
        categoryId: input.categoryId,
        specs: input.specs,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        images: {
          create: input.images.map((image) => ({
            url: image.url,
            publicId: image.publicId,
            alt: image.alt ?? null,
            width: image.width ?? null,
            height: image.height ?? null,
            position: image.position,
          })),
        },
      },
      include: productInclude,
    });
    return mapProduct(row);
  },

  async update(id, input) {
    const prisma = getPrisma();
    let slug: string | undefined;
    if (input.slug !== undefined || input.title !== undefined) {
      const current = await prisma.product.findUniqueOrThrow({
        where: { id },
        select: { title: true },
      });
      const others = await prisma.product.findMany({
        where: { id: { not: id } },
        select: { slug: true },
      });
      slug = uniqueSlug(
        input.slug?.trim() || input.title || current.title,
        others.map((p) => p.slug),
      );
    }

    const row = await prisma.product.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(slug ? { slug } : {}),
        ...(input.shortDescription !== undefined
          ? { shortDescription: input.shortDescription }
          : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.compareAtPrice !== undefined
          ? { compareAtPrice: input.compareAtPrice ?? null }
          : {}),
        ...(input.paymentInfo !== undefined ? { paymentInfo: input.paymentInfo } : {}),
        ...(input.brand !== undefined ? { brand: input.brand ?? null } : {}),
        ...(input.sku !== undefined ? { sku: input.sku || null } : {}),
        ...(input.stock !== undefined ? { stock: input.stock } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.specs !== undefined ? { specs: input.specs } : {}),
        ...(input.metaTitle !== undefined ? { metaTitle: input.metaTitle ?? null } : {}),
        ...(input.metaDescription !== undefined
          ? { metaDescription: input.metaDescription ?? null }
          : {}),
        ...(input.images
          ? {
              images: {
                deleteMany: {},
                create: input.images.map((image) => ({
                  url: image.url,
                  publicId: image.publicId,
                  alt: image.alt ?? null,
                  width: image.width ?? null,
                  height: image.height ?? null,
                  position: image.position,
                })),
              },
            }
          : {}),
      },
      include: productInclude,
    });
    return mapProduct(row);
  },

  async remove(id) {
    // ProductImage tem onDelete: Cascade — as linhas somem junto.
    await getPrisma().product.delete({ where: { id } });
  },
};
