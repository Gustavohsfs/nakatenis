/**
 * Consulta pontual no banco, para conferência manual.
 * Uso: npm run db:query -- <slug-do-produto>
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const slug = process.argv[2];

async function main() {
  if (!slug) {
    console.log("Informe o slug do produto. Ex.: npm run db:query -- tenis-clay-grip-saibro");
    return;
  }
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      title: true,
      slug: true,
      price: true,
      compareAtPrice: true,
      stock: true,
      isActive: true,
      isFeatured: true,
      updatedAt: true,
      category: { select: { name: true } },
      _count: { select: { images: true } },
    },
  });
  console.log(product ? JSON.stringify(product, null, 2) : "Produto não encontrado.");
}

main()
  .catch((e) => {
    console.error("✗", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
