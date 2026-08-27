"use client";

import {
  MAX_UPLOAD_BYTES,
  isAllowedMime,
  type DirectUploadTicket,
  type UploadResult,
} from "./types";

/**
 * Envio do arquivo a partir do browser.
 *
 * Usa XMLHttpRequest em vez de fetch por um motivo único: `upload.onprogress`.
 * Uma foto de produto de 6 MB numa conexão doméstica leva dezenas de segundos,
 * e sem barra de progresso o lojista acha que travou e clica de novo.
 */
export type UploadProgress = (percent: number) => void;

function postFormData(
  endpoint: string,
  form: FormData,
  onProgress?: UploadProgress,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      const body = xhr.response;
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body);
        return;
      }
      const message =
        (body as { error?: { message?: string } | string } | null)?.error &&
        typeof (body as { error: { message?: string } }).error === "object"
          ? ((body as { error: { message?: string } }).error.message ?? "")
          : typeof (body as { error?: string } | null)?.error === "string"
            ? (body as { error: string }).error
            : "";
      reject(new Error(message || `Falha no upload (HTTP ${xhr.status}).`));
    };

    xhr.onerror = () => reject(new Error("Falha de rede ao enviar a imagem."));
    xhr.onabort = () => reject(new Error("Upload cancelado."));

    xhr.send(form);
  });
}

/** Valida no cliente antes de gastar uma ida ao servidor pedindo assinatura. */
export function validateFile(file: File): string | null {
  if (!isAllowedMime(file.type)) {
    return `"${file.name}": formato não suportado. Envie JPG, PNG, WebP ou AVIF.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `"${file.name}": ${mb} MB excede o limite de 8 MB.`;
  }
  return null;
}

/** Envia direto ao provedor usando o ticket assinado pelo servidor. */
export async function uploadDirect(
  file: File,
  ticket: DirectUploadTicket,
  onProgress?: UploadProgress,
): Promise<UploadResult> {
  const form = new FormData();
  for (const [key, value] of Object.entries(ticket.fields)) {
    form.append(key, value);
  }
  form.append(ticket.fileField, file);

  const raw = (await postFormData(ticket.endpoint, form, onProgress)) as Record<
    string,
    unknown
  >;

  // O mapeamento vem no ticket — o cliente não sabe que isto é Cloudinary.
  const url = raw?.[ticket.resultFields.url];
  const publicId = raw?.[ticket.resultFields.publicId];
  if (typeof url !== "string" || typeof publicId !== "string") {
    throw new Error("O provedor respondeu num formato inesperado.");
  }
  const width = raw?.[ticket.resultFields.width];
  const height = raw?.[ticket.resultFields.height];

  return {
    url,
    publicId,
    width: typeof width === "number" ? width : 0,
    height: typeof height === "number" ? height : 0,
  };
}

/** Caminho de fallback: o arquivo passa pela nossa app (driver local). */
export async function uploadThroughApp(
  file: File,
  folder: string,
  onProgress?: UploadProgress,
): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const data = (await postFormData("/api/upload", form, onProgress)) as UploadResult;
  return data;
}
