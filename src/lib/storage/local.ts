import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";
import { assertUploadable, extensionFor, type StorageAdapter } from "./types";

/**
 * Grava no disco do servidor. Em produção (VPS) o Nginx serve /uploads
 * direto do disco — ver deploy/nginx.conf.
 */
const UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR ?? "public/uploads";

function rootDir() {
  // turbopackIgnore evita que o bundler trace o projeto inteiro por causa deste
  // resolve dinâmico — o diretório é sempre um subdiretório do próprio projeto.
  return resolve(/* turbopackIgnore: true */ process.cwd(), UPLOAD_DIR);
}

/** Dimensões lidas do cabeçalho do arquivo, sem dependência de processamento. */
function readDimensions(bytes: Uint8Array, mime: string): { width: number; height: number } {
  try {
    if (mime === "image/png" && bytes.length > 24) {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      return { width: view.getUint32(16), height: view.getUint32(20) };
    }
    if (mime === "image/jpeg") {
      let offset = 2;
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      while (offset < bytes.length) {
        if (view.getUint8(offset) !== 0xff) break;
        const marker = view.getUint8(offset + 1);
        const length = view.getUint16(offset + 2);
        // SOF0..SOF15, exceto os marcadores que não carregam dimensão
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
        }
        offset += 2 + length;
      }
    }
  } catch {
    // Cai no fallback abaixo — dimensão é informativa, não bloqueia o upload.
  }
  return { width: 0, height: 0 };
}

export const localStorageAdapter: StorageAdapter = {
  async upload(file, folder) {
    assertUploadable(file);
    const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, "").replace(/^\/+/, "");
    const dir = join(/* turbopackIgnore: true */ rootDir(), safeFolder);
    await mkdir(dir, { recursive: true });

    const name = `${randomUUID()}.${extensionFor(file.type)}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    await writeFile(join(/* turbopackIgnore: true */ dir, name), bytes);

    const publicId = safeFolder ? `${safeFolder}/${name}` : name;
    const { width, height } = readDimensions(bytes, file.type);
    return { url: `/uploads/${publicId}`, publicId, width, height };
  },

  async remove(publicId) {
    // Nunca deixar um publicId manipulado escapar do diretório de uploads.
    const target = resolve(/* turbopackIgnore: true */ rootDir(), publicId);
    const root = rootDir();
    if (target !== root && !target.startsWith(root + sep)) return;
    try {
      await unlink(target);
    } catch {
      // Arquivo já removido — apagar imagem não pode derrubar a operação.
    }
  },
};
