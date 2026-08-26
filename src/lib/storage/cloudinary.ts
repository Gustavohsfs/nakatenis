import { createHash } from "node:crypto";
import { assertUploadable, type StorageAdapter } from "./types";

/**
 * Cloudinary via REST (fetch) — sem SDK, sem dependência extra no bundle.
 * Trocar de driver é só mudar STORAGE_DRIVER no .env.
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

/** Assinatura exigida pelo upload autenticado: sha1(params ordenados + api_secret). */
function sign(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(payload + apiSecret).digest("hex");
}

export const cloudinaryStorageAdapter: StorageAdapter = {
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

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: form },
    );

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Falha no upload para o Cloudinary: ${detail.slice(0, 200)}`);
    }

    const data = (await response.json()) as {
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
    };

    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
    };
  },

  async remove(publicId) {
    const { cloudName, apiKey, apiSecret } = config();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const form = new FormData();
    form.append("public_id", publicId);
    form.append("api_key", apiKey);
    form.append("timestamp", timestamp);
    form.append("signature", sign({ public_id: publicId, timestamp }, apiSecret));

    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: form,
    });
  },
};
