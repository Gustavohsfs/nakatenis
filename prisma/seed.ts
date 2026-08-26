/**
 * Seed do catálogo — espelha src/lib/data/mock/catalog.ts.
 * Rodar com: npm run db:seed
 *
 * NÃO cria usuário admin. O primeiro admin é criado por `npm run create-admin`,
 * para nunca existir credencial fixa em produção.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { mockAbout, mockCategories, mockProducts } from "../src/lib/data/mock/catalog";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Defina DATABASE_URL (ou DIRECT_URL) no .env antes de rodar o seed.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  console.log("→ Semeando categorias…");
  for (const category of mockCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        position: category.position,
        isActive: category.isActive,
      },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        position: category.position,
        isActive: category.isActive,
      },
    });
  }

  console.log("→ Semeando produtos…");
  for (const product of mockProducts) {
    const data = {
      title: product.title,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      paymentInfo: product.paymentInfo,
      brand: product.brand,
      sku: product.sku,
      stock: product.stock,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      categoryId: product.categoryId,
      specs: product.specs,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      createdAt: new Date(product.createdAt),
    };

    await prisma.product.upsert({
      where: { slug: product.slug },
      create: {
        id: product.id,
        ...data,
        images: {
          create: product.images.map((image) => ({
            url: image.url,
            publicId: image.publicId,
            alt: image.alt,
            width: image.width,
            height: image.height,
            position: image.position,
          })),
        },
      },
      update: {
        ...data,
        images: {
          deleteMany: {},
          create: product.images.map((image) => ({
            url: image.url,
            publicId: image.publicId,
            alt: image.alt,
            width: image.width,
            height: image.height,
            position: image.position,
          })),
        },
      },
    });
  }

  console.log("→ Semeando a página Quem somos…");
  await prisma.aboutPage.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      title: mockAbout.title,
      content: mockAbout.content,
      images: mockAbout.images,
    },
    update: {
      title: mockAbout.title,
      content: mockAbout.content,
      images: mockAbout.images,
    },
  });

  const [categories, products] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
  ]);
  console.log(`✓ Seed concluído: ${categories} categorias, ${products} produtos.`);
  console.log("  Crie o primeiro admin com: npm run create-admin");
}

main()
  .catch((error) => {
    console.error("✗ Falha no seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
