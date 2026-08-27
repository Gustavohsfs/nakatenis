import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "./index";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "USER" | "ADMIN";
};

// cache(): a mesma sessão é lida por Header, Shell e guards da página dentro
// de um único render — decodificar o JWT uma vez por requisição basta.
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role ?? "USER",
  };
});

/** Área da conta: sem sessão, manda para o login guardando o destino. */
export async function requireUser(callbackPath = "/conta"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/entrar?callbackUrl=${encodeURIComponent(callbackPath)}`);
  return user;
}

/**
 * Área administrativa. Usuário comum recebe 404, não 403 — o painel não deve
 * sequer revelar que existe (critério de aceite da Fase 5).
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/entrar?callbackUrl=${encodeURIComponent("/admin")}`);
  if (user.role !== "ADMIN") notFound();
  return user;
}
