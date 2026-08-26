import type {
  AboutImage,
  AboutPage,
  Address,
  Category,
  Product,
  ProductSpec,
  Role,
  User,
} from "@/lib/data/types";

/** Linha do Prisma → tipo público. Mantém a UI independente do ORM. */

type PrismaCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  position: number;
  isActive: boolean;
  _count?: { products: number };
};

type PrismaImageRow = {
  id: string;
  url: string;
  publicId: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  position: number;
};

type PrismaProductRow = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  paymentInfo: string;
  brand: string | null;
  sku: string | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  images: PrismaImageRow[];
  specs: unknown;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type PrismaAddressRow = {
  id: string;
  userId: string;
  label: string | null;
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  isDefault: boolean;
};

type PrismaUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  role: Role;
  addresses?: PrismaAddressRow[];
  createdAt: Date;
};

type PrismaAboutRow = {
  id: string;
  title: string;
  content: string;
  images: unknown;
  updatedAt: Date;
};

export function toSpecs(value: unknown): ProductSpec[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (typeof record.label !== "string" || typeof record.value !== "string") return [];
    return [{ label: record.label, value: record.value }];
  });
}

export function toAboutImages(value: unknown): AboutImage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (typeof record.url !== "string") return [];
    return [
      {
        url: record.url,
        publicId: typeof record.publicId === "string" ? record.publicId : "",
        alt: typeof record.alt === "string" ? record.alt : null,
        caption: typeof record.caption === "string" ? record.caption : null,
      },
    ];
  });
}

export function mapCategory(row: PrismaCategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    position: row.position,
    isActive: row.isActive,
    ...(row._count ? { productCount: row._count.products } : {}),
  };
}

export function mapProduct(row: PrismaProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.shortDescription,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compareAtPrice,
    paymentInfo: row.paymentInfo,
    brand: row.brand,
    sku: row.sku,
    stock: row.stock,
    isActive: row.isActive,
    isFeatured: row.isFeatured,
    categoryId: row.categoryId,
    category: {
      id: row.category.id,
      name: row.category.name,
      slug: row.category.slug,
    },
    images: row.images
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((image) => ({
        id: image.id,
        url: image.url,
        publicId: image.publicId,
        alt: image.alt,
        width: image.width,
        height: image.height,
        position: image.position,
      })),
    specs: toSpecs(row.specs),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapAddress(row: PrismaAddressRow): Address {
  return {
    id: row.id,
    userId: row.userId,
    label: row.label,
    recipient: row.recipient,
    zipCode: row.zipCode,
    street: row.street,
    number: row.number,
    complement: row.complement,
    district: row.district,
    city: row.city,
    state: row.state,
    isDefault: row.isDefault,
  };
}

export function mapUser(row: PrismaUserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    cpf: row.cpf,
    role: row.role,
    addresses: (row.addresses ?? []).map(mapAddress),
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapAbout(row: PrismaAboutRow): AboutPage {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    images: toAboutImages(row.images),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** `include` padrão das consultas de produto — evita N+1 nas listagens. */
export const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { position: "asc" } },
} as const;
