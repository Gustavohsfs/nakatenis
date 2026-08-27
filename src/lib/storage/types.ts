export type UploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
};

/**
 * Credenciais de um upload direto do browser para o provedor.
 * O arquivo NUNCA passa pela nossa aplicação: isso contorna o limite de body
 * do host e o limite de 1 MB do body de Server Action do Next — foto de produto
 * estoura os dois com facilidade, e o erro que aparece é confuso.
 *
 * Cada ticket vale para UM arquivo: o `public_id` é sorteado no servidor e vai
 * dentro da assinatura, então o cliente não escolhe onde grava.
 */
export type DirectUploadTicket = {
  /** Endpoint do provedor para onde o browser faz o POST. */
  endpoint: string;
  /** Campos assinados que acompanham o arquivo no multipart. */
  fields: Record<string, string>;
  /** Nome do campo do arquivo no multipart. */
  fileField: string;
  /**
   * De onde ler cada campo na resposta do provedor. Vai no ticket para o
   * cliente conseguir traduzir o retorno sem conhecer o formato do Cloudinary
   * — trocar de provedor não mexe no componente de upload.
   */
  resultFields: { url: string; publicId: string; width: string; height: string };
};

export interface StorageAdapter {
  /** Upload server-side. Ainda usado pelo driver local e como fallback. */
  upload(file: File, folder: string): Promise<UploadResult>;
  remove(publicId: string): Promise<void>;
  /**
   * Quando implementado, o browser envia direto ao provedor.
   * Ausente no driver local — que não tem endpoint público para receber.
   */
  createDirectUpload?(folder: string, contentType: string): Promise<DirectUploadTicket>;
  /** Traduz a resposta crua do provedor para o formato interno. */
  parseDirectUpload?(raw: unknown): UploadResult;
}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
export const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
] as const;

export type AllowedMime = (typeof ALLOWED_MIME)[number];

export function isAllowedMime(mime: string): mime is AllowedMime {
  return (ALLOWED_MIME as readonly string[]).includes(mime);
}

export function assertUploadable(file: Pick<File, "type" | "size">) {
  if (!isAllowedMime(file.type)) {
    throw new Error("Formato não suportado. Envie JPG, PNG, WebP ou AVIF.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Arquivo muito grande. O limite é 8 MB por imagem.");
  }
}

export function extensionFor(mime: string) {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    case "image/svg+xml":
      return "svg";
    default:
      return "jpg";
  }
}
