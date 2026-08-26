import { uniqueSlug } from "@/lib/utils";
import type { CategoryRepository } from "@/lib/data/types";
import { getPrisma } from "./client";
import { mapCategory } from "./mappers";

export const prismaCategoryRepo: CategoryRepository = {
  async list(opts = {}) {
    const rows = await getPrisma().category.findMany({
      where: opts.includeInactive ? {} : { isActive: true },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      ...(opts.withCounts
        ? {
            include: {
              _count: {
                select: {
                  products: opts.includeInactive ? true : { where: { isActive: true } },
                },
              },
            },
          }
        : {}),
    });
    return rows.map(mapCategory);
  },

  async getBySlug(slug) {
    const row = await getPrisma().category.findUnique({ where: { slug } });
    return row ? mapCategory(row) : null;
  },

  async getById(id) {
    const row = await getPrisma().category.findUnique({ where: { id } });
    return row ? mapCategory(row) : null;
  },

  async create(input) {
    const prisma = getPrisma();
    const existing = await prisma.category.findMany({ select: { slug: true } });
    const slug = uniqueSlug(
      input.slug?.trim() || input.name,
      existing.map((c) => c.slug),
    );
    const position = input.position ?? (await prisma.category.count());
    const row = await prisma.category.create({
      data: {
        name: input.name,
        slug,
        description: input.description ?? null,
        icon: input.icon ?? null,
        position,
        isActive: input.isActive ?? true,
      },
    });
    return mapCategory(row);
  },

  async update(id, input) {
    const prisma = getPrisma();
    let slug: string | undefined;
    if (input.slug !== undefined || input.name !== undefined) {
      const current = await prisma.category.findUniqueOrThrow({
        where: { id },
        select: { name: true },
      });
      const others = await prisma.category.findMany({
        where: { id: { not: id } },
        select: { slug: true },
      });
      slug = uniqueSlug(
        input.slug?.trim() || input.name || current.name,
        others.map((c) => c.slug),
      );
    }
    const row = await prisma.category.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(slug ? { slug } : {}),
        ...(input.description !== undefined
          ? { description: input.description ?? null }
          : {}),
        ...(input.icon !== undefined ? { icon: input.icon ?? null } : {}),
        ...(input.position !== undefined ? { position: input.position } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });
    return mapCategory(row);
  },

  async reorder(orderedIds) {
    const prisma = getPrisma();
    await prisma.$transaction(
      orderedIds.map((id, position) =>
        prisma.category.update({ where: { id }, data: { position } }),
      ),
    );
  },

  async remove(id) {
    const prisma = getPrisma();
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      throw new Error(
        "Esta categoria tem produtos vinculados. Mova os produtos antes de excluí-la.",
      );
    }
    await prisma.category.delete({ where: { id } });
  },
};
