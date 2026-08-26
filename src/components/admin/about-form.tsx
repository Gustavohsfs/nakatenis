"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Save } from "lucide-react";
import Link from "next/link";
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Field,
  FieldError,
  FieldHint,
  Input,
  Label,
  Textarea,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import { ImageUploader, type UploaderImage } from "./image-uploader";
import { useUiStore } from "@/stores/ui-store";
import type { AboutPage } from "@/lib/data/types";
import { saveAboutAction } from "@/app/admin/actions";

export function AboutForm({ about }: { about: AboutPage }) {
  const router = useRouter();
  const toast = useUiStore((s) => s.toast);
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(about.title);
  const [content, setContent] = useState(about.content);
  const [captions, setCaptions] = useState<Record<string, string>>(
    Object.fromEntries(about.images.map((i) => [i.url, i.caption ?? ""])),
  );
  const [images, setImages] = useState<UploaderImage[]>(
    about.images.map((image, index) => ({
      url: image.url,
      publicId: image.publicId,
      alt: image.alt,
      width: null,
      height: null,
      position: index,
    })),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function submit() {
    setErrors({});
    setFormError(null);
    startTransition(async () => {
      const result = await saveAboutAction({
        title,
        content,
        images: images.map((image) => ({
          url: image.url,
          publicId: image.publicId,
          alt: image.alt,
          caption: captions[image.url] || null,
        })),
      });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.message ?? "Não foi possível salvar.");
        return;
      }
      toast({ variant: "success", title: result.message ?? "Página atualizada" });
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {formError ? <Alert variant="danger">{formError}</Alert> : null}

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Conteúdo</CardTitle>
            <CardDescription>
              Texto exibido em /quem-somos. É a página que ancora a loja como entidade
              local para buscadores e IAs.
            </CardDescription>
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/quem-somos" target="_blank">
              <ExternalLink aria-hidden="true" />
              Ver página
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field>
            <Label htmlFor="about-title">Título</Label>
            <Input
              id="about-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={Boolean(errors.title)}
            />
            <FieldError>{errors.title}</FieldError>
          </Field>

          <Field>
            <Label htmlFor="about-content">Texto</Label>
            <Textarea
              id="about-content"
              rows={18}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              aria-invalid={Boolean(errors.content)}
              className="font-mono text-[13px] leading-relaxed"
            />
            <FieldError>{errors.content}</FieldError>
            <FieldHint>
              Separe parágrafos com uma linha em branco. Use **texto** para negrito. Cite
              nome do dono, cidade, tempo de mercado e especialidade — é o que ancora a
              loja como entidade local.
            </FieldHint>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Galeria</CardTitle>
          <CardDescription>Fotos da loja, da equipe e dos produtos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUploader
            images={images}
            onChange={setImages}
            folder="quem-somos"
            max={6}
          />

          {images.length > 0 ? (
            <div className="space-y-3 border-t border-line pt-4">
              <p className="text-[13px] font-semibold text-ink">Legendas</p>
              {images.map((image, index) => (
                <Field key={image.url}>
                  <Label
                    htmlFor={`caption-${index}`}
                    className="text-[12.5px] text-ink-muted"
                  >
                    Imagem {index + 1}
                  </Label>
                  <Input
                    id={`caption-${index}`}
                    className="h-9 text-[13px]"
                    placeholder="Legenda exibida abaixo da foto"
                    value={captions[image.url] ?? ""}
                    onChange={(event) =>
                      setCaptions((current) => ({
                        ...current,
                        [image.url]: event.target.value,
                      }))
                    }
                  />
                </Field>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Button size="lg" onClick={submit} disabled={pending}>
        <Save aria-hidden="true" />
        {pending ? "Salvando…" : "Salvar página"}
      </Button>
    </div>
  );
}
