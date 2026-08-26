import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSessionUser } from "@/lib/auth/guards";
import { rateLimit, UPLOAD_LIMIT } from "@/lib/auth/rate-limit";
import { storage } from "@/lib/storage";

const ALLOWED_FOLDERS = ["produtos", "quem-somos", "categorias"] as const;

export async function POST(request: Request) {
  const user = await getSessionUser();
  // Rota de mutação: sem sessão de admin, 404 — não revela que a rota existe.
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  }

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "local";
  const limit = rateLimit(`upload:${ip}`, UPLOAD_LIMIT);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Muitos uploads seguidos. Aguarde um instante." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const rawFolder = formData.get("folder");
  const folder =
    typeof rawFolder === "string" &&
    (ALLOWED_FOLDERS as readonly string[]).includes(rawFolder)
      ? rawFolder
      : "produtos";

  try {
    const result = await storage.upload(file, folder);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao enviar a imagem.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
