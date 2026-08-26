import type { StorageAdapter } from "./types";
import { localStorageAdapter } from "./local";
import { cloudinaryStorageAdapter } from "./cloudinary";

export const storageDriver =
  process.env.STORAGE_DRIVER === "cloudinary" ? "cloudinary" : "local";

export const storage: StorageAdapter =
  storageDriver === "cloudinary" ? cloudinaryStorageAdapter : localStorageAdapter;

export * from "./types";
