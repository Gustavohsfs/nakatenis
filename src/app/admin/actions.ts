"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { aboutRepo, categoryRepo, productRepo } from "@/lib/data";
import { storage } from "@/lib/storage";

export type AdminState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Id do registro criado — o formulário usa para redirecionar. */
  id?: string;
};

const specSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

const imageSchema = z.object({
  url: z.string().trim().min(1),
  publicId: z.string().trim(),
  alt: z.string().trim().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  position: z.number().int().min(0),
});

const productSchema = z
  .object({
    title: z.string().trim().min(3, "Informe um título com pelo menos 3 caracteres."),
    slug: z.string().trim().optional(),
    shortDescription: z
      .string()
      .trim()
      .min(10, "A descrição curta precisa de ao menos 10 caracteres.")
      .max(200, "A descrição curta tem no máximo 200 caracteres."),
    description: z.string().trim(),
    price: z.number().int().positive("Informe o valor atual."),
    compareAtPrice: z.number().int().nonnegative().nullable(),
    paymentInfo: z.string().trim().min(3, "Informe as formas de pagamento."),
    brand: z.string().trim().nullable(),
    sku: z.string().trim().nullable(),
    stock: z.number().int().min(0, "O estoque não pode ser negativo."),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    categoryId: z.string().trim().min(1, "Escolha uma categoria."),
    images: z.array(imageSchema),
    specs: z.array(specSchema),
    metaTitle: z.string().trim().nullable().optional(),
    metaDescription: z
      .string()
      .trim()
      .max(160, "A meta description tem no máximo 160 caracteres.")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => !data.compareAtPrice || data.compareAtPrice > data.price,
    {
      message: "O valor antigo precisa ser MAIOR que o valor atual.",
      path: ["compareAtPrice"],
    },
  );

export type ProductFormPayload = z.input<typeof productSchema>;

const categorySchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da categoria."),
  slug: z.string().trim().optional(),
  description: z.string().trim().nullable(),
  icon: z.string().trim().nullable(),
  isActive: z.boolean(),
});

const aboutSchema = z.object({
  title: z.string().trim().min(3, "Informe um título."),
  content: z.string().trim().min(20, "Escreva o texto da página."),
  images: z.array(
    z.object({
      url: z.string().trim().min(1),
      publicId: z.string().trim(),
      alt: z.string().trim().nullable(),
      caption: z.string().trim().nullable(),
    }),
  ),
});

function collect(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function revalidateCatalog(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/admin/produtos");
  if (slug) revalidatePath(`/produto/${slug}`);
}

// ─── Produtos ─────────────────────────────────────────────────────────────────

export async function saveProductAction(
  payload: ProductFormPayload & { id?: string },
): Promise<AdminState> {
  // Toda mutação revalida a sessão: chamar a action direto, sem sessão, falha.
  await requireAdmin();

  const parsed = productSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: collect(parsed.error.issues),
      message: "Confira os campos destacados.",
    };
  }

  const category = await categoryRepo.getById(parsed.data.categoryId);
  if (!category) {
    return { ok: false, fieldErrors: { categoryId: "Categoria inexistente." } };
  }

  try {
    const product = payload.id
      ? await productRepo.update(payload.id, parsed.data)
      : await productRepo.create(parsed.data);

    revalidateCatalog(product.slug);
    revalidatePath(`/categoria/${category.slug}`);

    return {
      ok: true,
      id: product.id,
      message: payload.id ? "Produto atualizado." : "Produto criado.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível salvar.",
    };
  }
}

export async function toggleProductActiveAction(
  id: string,
  isActive: boolean,
): Promise<AdminState> {
  await requireAdmin();
  const product = await productRepo.update(id, { isActive });
  revalidateCatalog(product.slug);
  return { ok: true, message: isActive ? "Produto ativado." : "Produto desativado." };
}

export async function deleteProductAction(id: string): Promise<AdminState> {
  await requireAdmin();
  const product = await productRepo.getById(id);
  if (!product) return { ok: false, message: "Produto não encontrado." };

  // Apagar as imagens do storage antes do registro: depois não há mais publicId.
  await Promise.all(
    product.images
      .filter((image) => image.publicId && !image.publicId.startsWith("mock/"))
      .map((image) => storage.remove(image.publicId)),
  );

  await productRepo.remove(id);
  revalidateCatalog(product.slug);
  revalidatePath(`/categoria/${product.category.slug}`);
  return { ok: true, message: "Produto excluído." };
}

/** Remove do storage uma imagem descartada no formulário antes de salvar. */
export async function deleteUploadedImageAction(publicId: string) {
  await requireAdmin();
  if (!publicId || publicId.startsWith("mock/")) return { ok: true };
  await storage.remove(publicId);
  return { ok: true };
}

// ─── Categorias ───────────────────────────────────────────────────────────────

export async function saveCategoryAction(payload: {
  id?: string;
  name: string;
  slug?: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
}): Promise<AdminState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, fieldErrors: collect(parsed.error.issues) };
  }

  try {
    const category = payload.id
      ? await categoryRepo.update(payload.id, parsed.data)
      : await categoryRepo.create(parsed.data);
    revalidatePath("/", "layout");
    revalidatePath("/admin/categorias");
    return {
      ok: true,
      id: category.id,
      message: payload.id ? "Categoria atualizada." : "Categoria criada.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível salvar.",
    };
  }
}

export async function reorderCategoriesAction(
  orderedIds: string[],
): Promise<AdminState> {
  await requireAdmin();
  await categoryRepo.reorder(orderedIds);
  revalidatePath("/", "layout");
  revalidatePath("/admin/categorias");
  return { ok: true, message: "Ordem da sidebar atualizada." };
}

export async function deleteCategoryAction(id: string): Promise<AdminState> {
  await requireAdmin();
  try {
    await categoryRepo.remove(id);
    revalidatePath("/", "layout");
    revalidatePath("/admin/categorias");
    return { ok: true, message: "Categoria excluída." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Não foi possível excluir a categoria.",
    };
  }
}

// ─── Quem somos ───────────────────────────────────────────────────────────────

export async function saveAboutAction(payload: {
  title: string;
  content: string;
  images: { url: string; publicId: string; alt: string | null; caption: string | null }[];
}): Promise<AdminState> {
  await requireAdmin();

  const parsed = aboutSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, fieldErrors: collect(parsed.error.issues) };
  }

  await aboutRepo.update(parsed.data);
  revalidatePath("/quem-somos");
  revalidatePath("/admin/quem-somos");
  return { ok: true, message: "Página atualizada." };
}
