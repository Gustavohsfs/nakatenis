/**
 * Sanidade rápida do banco: quem existe e quanto existe.
 * Uso: npm run db:check
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const [users, categories, products, images, about, discounted, noImage] =
    await Promise.all([
      prisma.user.findMany({ select: { name: true, email: true, role: true } }),
      prisma.category.findMany({
        select: { name: true, slug: true, position: true, _count: { select: { products: true } } },
        orderBy: { position: "asc" },
      }),
      prisma.product.count(),
      prisma.productImage.count(),
      prisma.aboutPage.findUnique({ where: { id: "singleton" }, select: { title: true } }),
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count FROM "Product"
        WHERE "compareAtPrice" IS NOT NULL AND "compareAtPrice" > "price"`,
      prisma.product.count({ where: { images: { none: {} } } }),
    ]);

  console.log("Usuários:");
  for (const u of users) console.log(`  ${u.role.padEnd(5)} ${u.email}  —  ${u.name}`);
  console.log("\nCategorias (ordem da sidebar):");
  for (const c of categories)
    console.log(`  ${c.position}. ${c.name.padEnd(12)} /${c.slug}  —  ${c._count.products} produtos`);
  console.log(
    `\nProdutos: ${products} | imagens: ${images} | com desconto: ${Number(discounted[0]?.count ?? 0)} | sem imagem: ${noImage}`,
  );
  console.log(`Página institucional: ${about?.title ?? "(não cadastrada)"}`);
}

main()
  .catch((error) => {
    console.error("✗", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
