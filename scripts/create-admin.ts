/**
 * Cria (ou promove) o primeiro administrador — nunca um admin fixo no seed.
 *
 *   npm run create-admin -- --email=admin@nakatenis.com.br --name="Flávio Nakamura" --password=SuaSenhaForte
 *
 * Sem --password, a senha é lida do prompt (sem eco no terminal).
 * Requer DATA_SOURCE=prisma e DATABASE_URL configurados.
 */
import "dotenv/config";
import { createInterface } from "node:readline";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

type Args = { email?: string; name?: string; password?: string };

function parseArgs(): Args {
  const args: Args = {};
  for (const raw of process.argv.slice(2)) {
    const match = /^--([^=]+)=(.*)$/.exec(raw);
    if (!match) continue;
    const [, key, value] = match;
    if (key === "email" || key === "name" || key === "password") args[key] = value;
  }
  return args;
}

function ask(question: string, silent = false): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  if (silent) {
    // Desliga o eco: a senha não fica no scrollback nem no histórico.
    const output = rl as unknown as { output: NodeJS.WriteStream; _writeToOutput: (s: string) => void };
    output._writeToOutput = () => {};
  }
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      if (silent) process.stdout.write("\n");
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Defina DATABASE_URL no .env antes de criar o admin.");
  }

  const args = parseArgs();
  const email = (args.email ?? (await ask("E-mail do admin: "))).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error("E-mail inválido.");
  }

  const name = args.name ?? (await ask("Nome completo: "));
  if (name.length < 3) throw new Error("Informe o nome completo.");

  const password = args.password ?? (await ask("Senha (mín. 8 caracteres): ", true));
  if (password.length < 8) throw new Error("A senha precisa de no mínimo 8 caracteres.");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      create: { name, email, passwordHash, role: "ADMIN" },
      update: { name, passwordHash, role: "ADMIN" },
    });
    console.log(`✓ Admin pronto: ${user.email} (${user.id})`);
    console.log("  Acesse /entrar e depois /admin.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("✗", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
