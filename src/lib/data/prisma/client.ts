import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Singleton preguiçoso do PrismaClient.
 *
 * Preguiçoso porque `src/lib/data/index.ts` importa os dois repositórios sempre —
 * com DATA_SOURCE=mock não existe DATABASE_URL e a conexão nunca deve ser criada.
 *
 * Singleton porque o hot reload do `next dev` abriria uma conexão nova a cada
 * recompilação e esgotaria o pool do Postgres em poucos minutos.
 */
const globalForPrisma = globalThis as unknown as {
  __nakatenisPrisma?: PrismaClient;
};

export function getPrisma(): PrismaClient {
  if (globalForPrisma.__nakatenisPrisma) return globalForPrisma.__nakatenisPrisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não configurada. Defina-a no .env ou use DATA_SOURCE=mock.",
    );
  }

  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
  globalForPrisma.__nakatenisPrisma = client;
  return client;
}
