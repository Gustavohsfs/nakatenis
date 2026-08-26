"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, Badge, Input, Label } from "@/components/ui";
import { deleteUploadedImageAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export type UploaderImage = {
  url: string;
  publicId: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  position: number;
};

/**
 * Upload múltiplo com drag-and-drop, preview, reordenação e definição da
 * imagem principal (posição 0). Remover apaga também do storage.
 */
export function ImageUploader({
  images,
  onChange,
  folder = "produtos",
  max = 8,
}: {
  images: UploaderImage[];
  onChange: (images: UploaderImage[]) => void;
  folder?: "produtos" | "quem-somos" | "categorias";
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function reindex(list: UploaderImage[]) {
    return list.map((image, index) => ({ ...image, position: index }));
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    const room = max - images.length;
    if (room <= 0) {
      setError(`Limite de ${max} imagens atingido.`);
      return;
    }
    const selected = list.slice(0, room);
    setError(list.length > room ? `Só cabem mais ${room} imagem(ns).` : null);
    setUploading((n) => n + selected.length);

    const uploaded: UploaderImage[] = [];
    for (const file of selected) {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      try {
        const response = await fetch("/api/upload", { method: "POST", body });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error ?? "Falha no upload.");
        } else {
          uploaded.push({
            url: data.url,
            publicId: data.publicId,
            alt: null,
            width: data.width || null,
            height: data.height || null,
            position: 0,
          });
        }
      } catch {
        setError("Falha de rede ao enviar a imagem.");
      } finally {
        setUploading((n) => Math.max(0, n - 1));
      }
    }

    if (uploaded.length > 0) onChange(reindex([...images, ...uploaded]));
  }

  async function removeAt(index: number) {
    const [removed] = images.slice(index, index + 1);
    onChange(reindex(images.filter((_, i) => i !== index)));
    if (removed?.publicId) {
      await deleteUploadedImageAction(removed.publicId);
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(reindex(next));
  }

  function makePrimary(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(reindex(next));
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (event.dataTransfer.files.length > 0) {
            void uploadFiles(event.dataTransfer.files);
          }
        }}
        className={cn(
          "flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragging
            ? "border-brand-500 bg-brand-50"
            : "border-line-strong bg-surface-alt",
        )}
      >
        <UploadCloud
          className={cn("size-8", dragging ? "text-brand-500" : "text-ink-muted")}
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-ink">
          Arraste as imagens aqui ou{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-brand-500 underline underline-offset-2 hover:text-brand-700"
          >
            escolha do computador
          </button>
        </p>
        <p className="text-[12.5px] text-ink-muted">
          JPG, PNG, WebP ou AVIF · até 8 MB cada · máximo de {max} imagens
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) void uploadFiles(event.target.files);
            event.target.value = "";
          }}
        />
        {uploading > 0 ? (
          <p className="flex items-center gap-2 text-[13px] font-medium text-brand-600">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Enviando {uploading} imagem(ns)…
          </p>
        ) : null}
      </div>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      {images.length === 0 ? (
        <p className="flex items-center gap-2 rounded-lg bg-surface-alt px-3 py-2.5 text-[13px] text-ink-muted">
          <ImagePlus className="size-4" aria-hidden="true" />
          Sem imagem, o produto aparece com um placeholder na vitrine.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <li
              key={`${image.publicId}-${index}`}
              className="overflow-hidden rounded-xl border border-line bg-surface shadow-card"
            >
              <div className="relative aspect-square bg-surface-sunken">
                <Image
                  src={image.url}
                  alt={image.alt ?? `Imagem ${index + 1}`}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                {index === 0 ? (
                  <Badge
                    variant="brand"
                    size="sm"
                    className="absolute left-2 top-2 shadow-sm"
                  >
                    <Star className="size-3" aria-hidden="true" />
                    Principal
                  </Badge>
                ) : null}
              </div>

              <div className="space-y-2 p-2.5">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Mover imagem ${index + 1} para trás`}
                    >
                      <ArrowLeft />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => move(index, 1)}
                      disabled={index === images.length - 1}
                      aria-label={`Mover imagem ${index + 1} para frente`}
                    >
                      <ArrowRight />
                    </Button>
                  </div>
                  <div className="flex gap-0.5">
                    {index !== 0 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => makePrimary(index)}
                        aria-label={`Definir imagem ${index + 1} como principal`}
                      >
                        <Star />
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-danger-600 hover:bg-danger-50"
                      onClick={() => void removeAt(index)}
                      aria-label={`Remover imagem ${index + 1}`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor={`alt-${index}`}
                    className="text-[11px] uppercase tracking-wide text-ink-muted"
                  >
                    Texto alternativo
                  </Label>
                  <Input
                    id={`alt-${index}`}
                    className="h-8 text-[12.5px]"
                    placeholder="O que aparece na foto"
                    value={image.alt ?? ""}
                    onChange={(event) => {
                      const next = [...images];
                      next[index] = { ...image, alt: event.target.value || null };
                      onChange(next);
                    }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
