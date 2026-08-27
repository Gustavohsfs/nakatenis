"use server";

import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth/guards";
import { rateLimit, UPLOAD_LIMIT } from "@/lib/auth/rate-limit";
import {
  MAX_UPLOAD_BYTES,
  isAllowedMime,
  storage,
  storageDriver,
  type DirectUploadTicket,
} from "@/lib/storage";

const ALLOWED_FOLDERS = ["produtos", "quem-somos", "categorias"] as const;
export type UploadFolder = (typeof ALLOWED_FOLDERS)[number];

export type UploadTicketResult =
  | { ok: true; mode: "direct"; ticket: DirectUploadTicket }
  | { ok: true; mode: "proxy" }
  | { ok: false; message: string };

/**
 * Emite as credenciais de um upload direto do browser para o Cloudinary.
 *
 * O payload que trafega aqui é só metadado (nome do arquivo, tipo, tamanho) —
 * o arquivo em si vai do browser direto para o provedor. É isso que mantém a
 * requisição bem abaixo do limite de 1 MB do body de Server Action.
 *
 * Com STORAGE_DRIVER=local não existe endpoint público para receber, então
 * respondemos `mode: "proxy"` e o cliente volta a passar por /api/upload.
 */
export async function createUploadTicketAction(input: {
  folder: string;
  contentType: string;
  size: number;
}): Promise<UploadTicketResult> {
  await requireAdmin();

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "local";
  const limit = rateLimit(`upload-ticket:${ip}`, UPLOAD_LIMIT);
  if (!limit.ok) {
    return {
      ok: false,
      message: "Muitos uploads seguidos. Aguarde um instante e tente de novo.",
    };
  }

  if (!(ALLOWED_FOLDERS as readonly string[]).includes(input.folder)) {
    return { ok: false, message: "Destino de upload inválido." };
  }
  if (!isAllowedMime(input.contentType)) {
    return { ok: false, message: "Formato não suportado. Envie JPG, PNG, WebP ou AVIF." };
  }
  if (!Number.isFinite(input.size) || input.size <= 0) {
    return { ok: false, message: "Arquivo vazio." };
  }
  if (input.size > MAX_UPLOAD_BYTES) {
    return { ok: false, message: "Arquivo muito grande. O limite é 8 MB por imagem." };
  }

  if (!storage.createDirectUpload) {
    return { ok: true, mode: "proxy" };
  }

  try {
    const ticket = await storage.createDirectUpload(input.folder, input.contentType);
    return { ok: true, mode: "direct", ticket };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : `Não foi possível preparar o upload (driver: ${storageDriver}).`,
    };
  }
}
