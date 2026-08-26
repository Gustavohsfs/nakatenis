import type { AboutPage, Address, Product, Category, Role } from "@/lib/data/types";
import { mockAbout, mockCategories, mockProducts } from "./catalog";

export type MockUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string | null;
  cpf: string | null;
  role: Role;
  addresses: Address[];
  createdAt: string;
};

type MockDb = {
  products: Product[];
  categories: Category[];
  users: MockUser[];
  about: AboutPage;
};

/**
 * Estado em memória. Vive no globalThis para sobreviver ao hot reload do dev —
 * sem isso, cada recompilação zera o que o admin acabou de cadastrar.
 */
const globalForMock = globalThis as unknown as { __nakatenisMockDb?: MockDb };

export const db: MockDb =
  globalForMock.__nakatenisMockDb ??
  (globalForMock.__nakatenisMockDb = {
    products: structuredClone(mockProducts),
    categories: structuredClone(mockCategories),
    users: [],
    about: structuredClone(mockAbout),
  });

export function nextId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
