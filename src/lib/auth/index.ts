import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { dataSource, userRepo } from "@/lib/data";
import { getPrisma } from "@/lib/data/prisma";
import type { Role } from "@/lib/data/types";
import { credentialsSchema } from "./schemas";

/**
 * Auth.js v5 com Credentials provider.
 * Sessão em JWT (cookie httpOnly) — obrigatório com Credentials — carregando
 * `role` para os guards de /admin.
 *
 * Com DATA_SOURCE=prisma o PrismaAdapter entra junto, deixando o caminho pronto
 * para provedores OAuth sem mexer no resto.
 */
export const authConfig = {
  ...(dataSource === "prisma" ? { adapter: PrismaAdapter(getPrisma()) } : {}),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  trustHost: true,
  pages: {
    signIn: "/entrar",
    error: "/entrar",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await userRepo.verifyCredentials(
          parsed.data.email,
          parsed.data.password,
        );
        if (!user) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: Role }).role ?? "USER";
      }
      // Após atualizar o perfil na conta, o nome no menu precisa acompanhar.
      if (trigger === "update" && token.id) {
        const fresh = await userRepo.getById(token.id as string);
        if (fresh) {
          token.name = fresh.name;
          token.email = fresh.email;
          token.role = fresh.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? session.user.id;
        session.user.role = (token.role as Role) ?? "USER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
