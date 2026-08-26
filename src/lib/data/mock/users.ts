import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type {
  Address,
  AddressInput,
  User,
  UserRepository,
} from "@/lib/data/types";
import { db, nextId, type MockUser } from "./store";

/**
 * Contas de desenvolvimento (só existem com DATA_SOURCE=mock):
 *   admin@nakatenis.com.br   / admin123    → ADMIN
 *   cliente@nakatenis.com.br / cliente123  → USER, com endereço padrão
 */
let seeding: Promise<void> | null = null;

async function ensureSeeded() {
  if (db.users.length > 0) return;
  seeding ??= (async () => {
    const [adminHash, customerHash] = await Promise.all([
      hashPassword("admin123"),
      hashPassword("cliente123"),
    ]);
    if (db.users.length > 0) return;
    db.users.push(
      {
        id: "usr_admin",
        name: "Flávio Nakamura",
        email: "admin@nakatenis.com.br",
        passwordHash: adminHash,
        phone: "(17) 99181-4042",
        cpf: null,
        role: "ADMIN",
        addresses: [],
        createdAt: new Date("2026-01-10T12:00:00Z").toISOString(),
      },
      {
        id: "usr_cliente",
        name: "Gustavo Henrique",
        email: "cliente@nakatenis.com.br",
        passwordHash: customerHash,
        phone: "(17) 98888-1234",
        cpf: null,
        role: "USER",
        addresses: [
          {
            id: "adr_cliente_1",
            userId: "usr_cliente",
            label: "Casa",
            recipient: "Gustavo Henrique",
            zipCode: "15775-000",
            street: "Avenida Navarro de Andrade",
            number: "2177",
            complement: "Apto 42",
            district: "Centro",
            city: "Santa Fé do Sul",
            state: "SP",
            isDefault: true,
          },
        ],
        createdAt: new Date("2026-02-02T12:00:00Z").toISOString(),
      },
    );
  })();
  await seeding;
}

function toUser(user: MockUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    cpf: user.cpf,
    role: user.role,
    addresses: user.addresses.map((a) => ({ ...a })),
    createdAt: user.createdAt,
  };
}

async function findByEmail(email: string) {
  await ensureSeeded();
  const normalized = email.trim().toLowerCase();
  return db.users.find((u) => u.email.toLowerCase() === normalized) ?? null;
}

async function requireUser(id: string) {
  await ensureSeeded();
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new Error("Usuário não encontrado.");
  return user;
}

export const mockUserRepo: UserRepository = {
  async getByEmail(email) {
    const user = await findByEmail(email);
    return user ? toUser(user) : null;
  },

  async getById(id) {
    await ensureSeeded();
    const user = db.users.find((u) => u.id === id);
    return user ? toUser(user) : null;
  },

  async verifyCredentials(email, password) {
    const user = await findByEmail(email);
    // Compara mesmo sem usuário, para não vazar existência de e-mail pelo tempo.
    const hash = user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
    const ok = await verifyPassword(password, hash);
    if (!user || !ok) return null;
    return toUser(user);
  },

  async create(input) {
    await ensureSeeded();
    const existing = await findByEmail(input.email);
    if (existing) throw new Error("Já existe uma conta com este e-mail.");
    const id = nextId("usr");
    const user: MockUser = {
      id,
      name: input.name,
      email: input.email.trim().toLowerCase(),
      passwordHash: await hashPassword(input.password),
      phone: input.phone ?? null,
      cpf: input.cpf ?? null,
      role: input.role ?? "USER",
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    if (input.address) {
      user.addresses.push({
        ...input.address,
        id: nextId("adr"),
        userId: id,
        isDefault: true,
      });
    }
    db.users.push(user);
    return toUser(user);
  },

  async updateProfile(id, input) {
    const user = await requireUser(id);
    user.name = input.name;
    user.phone = input.phone ?? null;
    user.cpf = input.cpf ?? null;
    return toUser(user);
  },

  async updatePassword(id, password) {
    const user = await requireUser(id);
    user.passwordHash = await hashPassword(password);
  },

  async addAddress(userId, input) {
    const user = await requireUser(userId);
    const isDefault = input.isDefault || user.addresses.length === 0;
    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    const address: Address = { ...input, id: nextId("adr"), userId, isDefault };
    user.addresses.push(address);
    return { ...address };
  },

  async updateAddress(userId, addressId, input: Partial<AddressInput>) {
    const user = await requireUser(userId);
    const address = user.addresses.find((a) => a.id === addressId);
    if (!address) throw new Error("Endereço não encontrado.");
    Object.assign(address, input);
    if (input.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = a.id === addressId));
    }
    return { ...address };
  },

  async removeAddress(userId, addressId) {
    const user = await requireUser(userId);
    const index = user.addresses.findIndex((a) => a.id === addressId);
    if (index === -1) throw new Error("Endereço não encontrado.");
    const [removed] = user.addresses.splice(index, 1);
    if (removed.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
  },

  async setDefaultAddress(userId, addressId) {
    const user = await requireUser(userId);
    if (!user.addresses.some((a) => a.id === addressId)) {
      throw new Error("Endereço não encontrado.");
    }
    user.addresses.forEach((a) => (a.isDefault = a.id === addressId));
  },
};
