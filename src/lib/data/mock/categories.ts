import { uniqueSlug } from "@/lib/utils";
import type { Category, CategoryRepository } from "@/lib/data/types";
import { db, nextId } from "./store";

export const mockCategoryRepo: CategoryRepository = {
  async list(opts = {}) {
    const items = db.categories
      .filter((c) => opts.includeInactive || c.isActive)
      .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name, "pt-BR"));
    if (!opts.withCounts) return items.map((c) => ({ ...c }));
    return items.map((category) => ({
      ...category,
      productCount: db.products.filter(
        (p) => p.categoryId === category.id && (opts.includeInactive || p.isActive),
      ).length,
    }));
  },

  async getBySlug(slug) {
    return db.categories.find((c) => c.slug === slug) ?? null;
  },

  async getById(id) {
    return db.categories.find((c) => c.id === id) ?? null;
  },

  async create(input) {
    const slug = uniqueSlug(
      input.slug?.trim() || input.name,
      db.categories.map((c) => c.slug),
    );
    const category: Category = {
      id: nextId("cat"),
      name: input.name,
      slug,
      description: input.description ?? null,
      icon: input.icon ?? null,
      position: input.position ?? db.categories.length,
      isActive: input.isActive ?? true,
    };
    db.categories.push(category);
    return category;
  },

  async update(id, input) {
    const index = db.categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Categoria não encontrada.");
    const current = db.categories[index];
    const slug =
      input.slug !== undefined || input.name !== undefined
        ? uniqueSlug(
            input.slug?.trim() || input.name || current.name,
            db.categories.filter((c) => c.id !== id).map((c) => c.slug),
          )
        : current.slug;
    const updated: Category = {
      ...current,
      ...input,
      slug,
      description:
        input.description === undefined
          ? current.description
          : (input.description ?? null),
      icon: input.icon === undefined ? current.icon : (input.icon ?? null),
    };
    db.categories[index] = updated;
    // Produtos guardam uma cópia denormalizada da categoria.
    for (const product of db.products) {
      if (product.categoryId === id) {
        product.category = { id: updated.id, name: updated.name, slug: updated.slug };
      }
    }
    return updated;
  },

  async reorder(orderedIds) {
    orderedIds.forEach((id, position) => {
      const category = db.categories.find((c) => c.id === id);
      if (category) category.position = position;
    });
  },

  async remove(id) {
    const inUse = db.products.some((p) => p.categoryId === id);
    if (inUse) {
      throw new Error(
        "Esta categoria tem produtos vinculados. Mova os produtos antes de excluí-la.",
      );
    }
    const index = db.categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Categoria não encontrada.");
    db.categories.splice(index, 1);
  },
};
