import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { UserRepository } from "@/lib/data/types";
import { getPrisma } from "./client";
import { mapAddress, mapUser } from "./mappers";

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  cpf: true,
  role: true,
  createdAt: true,
  addresses: { orderBy: { createdAt: "asc" } },
} as const;

/** Hash descartável: mantém o tempo de resposta igual para e-mail inexistente. */
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8.rIcHt7Q9C1lQOyBIzoDcxUrEWuOa";

export const prismaUserRepo: UserRepository = {
  async getByEmail(email) {
    const row = await getPrisma().user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: userSelect,
    });
    return row ? mapUser(row) : null;
  },

  async getById(id) {
    const row = await getPrisma().user.findUnique({
      where: { id },
      select: userSelect,
    });
    return row ? mapUser(row) : null;
  },

  async verifyCredentials(email, password) {
    const row = await getPrisma().user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { ...userSelect, passwordHash: true },
    });
    const ok = await verifyPassword(password, row?.passwordHash ?? DUMMY_HASH);
    if (!row || !row.passwordHash || !ok) return null;
    // Nunca deixar o hash sair do repositório.
    return mapUser({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      cpf: row.cpf,
      role: row.role,
      addresses: row.addresses,
      createdAt: row.createdAt,
    });
  },

  async create(input) {
    const prisma = getPrisma();
    const email = input.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Já existe uma conta com este e-mail.");

    const row = await prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash: await hashPassword(input.password),
        phone: input.phone ?? null,
        cpf: input.cpf || null,
        role: input.role ?? "USER",
        ...(input.address
          ? { addresses: { create: { ...input.address, isDefault: true } } }
          : {}),
      },
      select: userSelect,
    });
    return mapUser(row);
  },

  async updateProfile(id, input) {
    const row = await getPrisma().user.update({
      where: { id },
      data: {
        name: input.name,
        phone: input.phone ?? null,
        cpf: input.cpf || null,
      },
      select: userSelect,
    });
    return mapUser(row);
  },

  async updatePassword(id, password) {
    await getPrisma().user.update({
      where: { id },
      data: { passwordHash: await hashPassword(password) },
    });
  },

  async addAddress(userId, input) {
    const prisma = getPrisma();
    const count = await prisma.address.count({ where: { userId } });
    const isDefault = input.isDefault || count === 0;
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    const row = await prisma.address.create({
      data: { ...input, userId, isDefault },
    });
    return mapAddress(row);
  },

  async updateAddress(userId, addressId, input) {
    const prisma = getPrisma();
    if (input.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    const result = await prisma.address.updateManyAndReturn({
      where: { id: addressId, userId },
      data: input,
    });
    if (result.length === 0) throw new Error("Endereço não encontrado.");
    return mapAddress(result[0]);
  },

  async removeAddress(userId, addressId) {
    const prisma = getPrisma();
    const removed = await prisma.address.deleteMany({
      where: { id: addressId, userId },
    });
    if (removed.count === 0) throw new Error("Endereço não encontrado.");
    const remaining = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    if (remaining && !remaining.isDefault) {
      const hasDefault = await prisma.address.count({
        where: { userId, isDefault: true },
      });
      if (hasDefault === 0) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }
  },

  async setDefaultAddress(userId, addressId) {
    const prisma = getPrisma();
    const owned = await prisma.address.count({ where: { id: addressId, userId } });
    if (owned === 0) throw new Error("Endereço não encontrado.");
    await prisma.$transaction([
      prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
      prisma.address.update({ where: { id: addressId }, data: { isDefault: true } }),
    ]);
  },
};
