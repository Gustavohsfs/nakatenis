import type {
  AboutRepository,
  CategoryRepository,
  ProductRepository,
  UserRepository,
} from "./types";
import { mockAboutRepo, mockCategoryRepo, mockProductRepo, mockUserRepo } from "./mock";
import {
  prismaAboutRepo,
  prismaCategoryRepo,
  prismaProductRepo,
  prismaUserRepo,
} from "./prisma";

/**
 * Ponto único de troca da fonte de dados.
 * DATA_SOURCE=mock   → catálogo em memória (dev offline)
 * DATA_SOURCE=prisma → PostgreSQL
 *
 * Regra dura: nada fora de src/lib/data/prisma importa PrismaClient.
 */
export const dataSource = process.env.DATA_SOURCE === "prisma" ? "prisma" : "mock";

const usePrisma = dataSource === "prisma";

export const productRepo: ProductRepository = usePrisma
  ? prismaProductRepo
  : mockProductRepo;
export const categoryRepo: CategoryRepository = usePrisma
  ? prismaCategoryRepo
  : mockCategoryRepo;
export const userRepo: UserRepository = usePrisma ? prismaUserRepo : mockUserRepo;
export const aboutRepo: AboutRepository = usePrisma ? prismaAboutRepo : mockAboutRepo;

export * from "./types";
