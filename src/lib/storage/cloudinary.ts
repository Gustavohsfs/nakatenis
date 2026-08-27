import { createHash, randomUUID } from "node:crypto";
import {
  assertUploadable,
  isAllowedMime,
  type DirectUploadTicket,
  type StorageAdapter,
  type UploadResult,
} from "./types";

/**
 * Cloudinary via REST (fetch) — sem SDK, sem dependência extra no bundle.
 * Trocar de driver é só mudar STORAGE_DRIVER no .env.
 *
 * O caminho normal é o upload DIRETO do browser (`createDirectUpload`): o
 * servidor só assina, e nunca toca no arquivo nem em pixel. O resize, o
 * WebP/AVIF e o CDN ficam do lado do Cloudinary — que é o ponto de usá-lo num
 * plano com CPU compartilhada.
 */
function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary não configurado. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET.",
    );
  }
  const baseFolder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "nakatenis";
  return { cloudName, apiKey, apiSecret, baseFolder };
}

function uploadEndpoint(cloudName: string) {
  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
}

/** Assinatura exigida pelo upload autenticado: sha1(params ordenados + api_secret). */
function sign(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(payload + apiSecret).digest("hex");
}

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  error?: { message?: string };
};

function toUploadResult(raw: unknown): UploadResult {
  const data = raw as CloudinaryUploadResponse;
  if (data?.error?.message) throw new Error(data.error.message);
  if (!data?.secure_url || !data?.public_id) {
    throw new Error("Resposta inesperada do Cloudinary.");
  }
  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width ?? 0,
    height: data.height ?? 0,
  };
}

export const cloudinaryStorageAdapter: StorageAdapter = {
  async createDirectUpload(folder, contentType) {
    if (!isAllowedMime(contentType)) {
      throw new Error("Formato não suportado. Envie JPG, PNG, WebP ou AVIF.");
    }
    const { cloudName, apiKey, apiSecret, baseFolder } = config();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const fullFolder = [baseFolder, folder].filter(Boolean).join("/");
    // public_id sorteado aqui: entra na assinatura, então o cliente não escolhe
    // o destino nem sobrescreve um asset existente.
    const publicId = randomUUID();

    const signedParams = {
      folder: fullFolder,
      public_id: publicId,
      timestamp,
    };

    const ticket: DirectUploadTicket = {
      endpoint: uploadEndpoint(cloudName),
      fileField: "file",
      resultFields: {
        url: "secure_url",
        publicId: "public_id",
        width: "width",
        height: "height",
      },
      fields: {
        ...signedParams,
        api_key: apiKey,
        signature: sign(signedParams, apiSecret),
      },
    };
    return ticket;
  },

  parseDirectUpload(raw) {
    return toUploadResult(raw);
  },

  async upload(file, folder) {
    assertUploadable(file);
    const { cloudName, apiKey, apiSecret, baseFolder } = config();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const fullFolder = [baseFolder, folder].filter(Boolean).join("/");

    const signedParams = { folder: fullFolder, timestamp };
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", apiKey);
    form.append("timestamp", timestamp);
    form.append("folder", fullFolder);
    form.append("signature", sign(signedParams, apiSecret));

    const response = await fetch(uploadEndpoint(cloudName), {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Falha no upload para o Cloudinary: ${detail.slice(0, 200)}`);
    }

    return toUploadResult(await response.json());
  },

  async remove(publicId) {
    const { cloudName, apiKey, apiSecret } = config();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    // `invalidate` purga também as cópias no CDN — sem ele, a imagem de um
    // produto excluído continua servível pela borda até o cache expirar.
    const params = { invalidate: "true", public_id: publicId, timestamp };
    const form = new FormData();
    form.append("public_id", publicId);
    form.append("invalidate", "true");
    form.append("api_key", apiKey);
    form.append("timestamp", timestamp);
    form.append("signature", sign(params, apiSecret));

    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: form,
    });
  },
};
