import type { AboutRepository } from "@/lib/data/types";
import { getPrisma } from "./client";
import { mapAbout } from "./mappers";

const SINGLETON_ID = "singleton";

const FALLBACK = {
  title: "Quem somos",
  content:
    "Conteúdo ainda não cadastrado. Edite esta página em /admin/quem-somos.",
};

export const prismaAboutRepo: AboutRepository = {
  async get() {
    const prisma = getPrisma();
    const row = await prisma.aboutPage.findUnique({ where: { id: SINGLETON_ID } });
    if (row) return mapAbout(row);
    // Sem upsert aqui: leitura de página pública não deve escrever no banco.
    return {
      id: SINGLETON_ID,
      title: FALLBACK.title,
      content: FALLBACK.content,
      images: [],
      updatedAt: new Date().toISOString(),
    };
  },

  async update(input) {
    const row = await getPrisma().aboutPage.upsert({
      where: { id: SINGLETON_ID },
      create: {
        id: SINGLETON_ID,
        title: input.title,
        content: input.content,
        images: input.images,
      },
      update: {
        title: input.title,
        content: input.content,
        images: input.images,
      },
    });
    return mapAbout(row);
  },
};
