import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Proxy (o antigo middleware — renomeado no Next 16, runtime Node).
 *
 * Aqui só acontece a checagem otimista: redireciona quem não está logado.
 * A autorização de verdade continua nos guards de servidor
 * (src/lib/auth/guards.ts), que rodam em toda página e Server Action do admin.
 */
export const proxy = auth((req) => {
  const { pathname, search } = req.nextUrl;
  const session = req.auth;

  const isAccount = pathname === "/conta" || pathname.startsWith("/conta/");
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (!isAccount && !isAdmin) return NextResponse.next();

  if (!session?.user) {
    const url = new URL("/entrar", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // Papel ADMIN é conferido em src/app/admin/layout.tsx, que responde 404
  // (e não 403) para usuário comum — o painel não deve revelar que existe.
  return NextResponse.next();
});

export const config = {
  matcher: ["/conta/:path*", "/admin/:path*"],
};
