import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations e introspecção usam a conexão direta (sem pooler).
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
