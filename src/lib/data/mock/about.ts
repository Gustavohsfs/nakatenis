import type { AboutRepository } from "@/lib/data/types";
import { db } from "./store";

export const mockAboutRepo: AboutRepository = {
  async get() {
    return structuredClone(db.about);
  },

  async update(input) {
    db.about = {
      ...db.about,
      title: input.title,
      content: input.content,
      images: input.images,
      updatedAt: new Date().toISOString(),
    };
    return structuredClone(db.about);
  },
};
