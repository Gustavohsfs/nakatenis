export type UploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
};

export interface StorageAdapter {
  upload(file: File, folder: string): Promise<UploadResult>;
  remove(publicId: string): Promise<void>;
}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
export const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
] as const;

export function assertUploadable(file: File) {
  if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
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
