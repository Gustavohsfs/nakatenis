"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, Badge, Input, Label } from "@/components/ui";
import { deleteUploadedImageAction } from "@/app/admin/actions";
import {
  createUploadTicketAction,
  type UploadFolder,
} from "@/app/admin/upload-actions";
import {
  uploadDirect,
  uploadThroughApp,
  validateFile,
} from "@/lib/storage/direct-upload-client";
import { cn } from "@/lib/utils";

export type UploaderImage = {
  url: string;
  publicId: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  position: number;
};

type Pending = { name: string; percent: number };

/**
 * Upload múltiplo com drag-and-drop, preview, reordenação e definição da
 * imagem principal (posição 0). Remover apaga também do storage.
 *
 * Com o Cloudinary, o arquivo vai do browser DIRETO para o provedor: o servidor
 * só assina o envio. Isso evita o limite de body do host e o limite de 1 MB do
 * body de Server Action — foto de produto estoura os dois. Com o driver local
 * (dev), o servidor devolve `mode: "proxy"` e o arquivo volta a passar por
 * /api/upload.
 */
export function ImageUploader({
  images,
  onChange,
  folder = "produtos",
  max = 8,
}: {
  images: UploaderImage[];
  onChange: (images: UploaderImage[]) => void;
  folder?: UploadFolder;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState<Pending[]>([]);
  const [error, setError] = useState<string | null>(null);

  function reindex(list: UploaderImage[]) {
    return list.map((image, index) => ({ ...image, position: index }));
  }

  function setProgress(name: string, percent: number) {
    setPending((current) =>
      current.map((p) => (p.name === name ? { ...p, percent } : p)),
    );
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    const room = max - images.length - pending.length;
    if (room <= 0) {
      setError(`Limite de ${max} imagens atingido.`);
      return;
    }

    const problems: string[] = [];
    if (list.length > room) problems.push(`Só cabem mais ${room} imagem(ns).`);

    const selected: File[] = [];
    for (const file of list.slice(0, room)) {
      const problem = validateFile(file);
      if (problem) problems.push(problem);
      else selected.push(file);
    }

    setError(problems.length > 0 ? problems.join(" ") : null);
    if (selected.length === 0) return;

    setPending((current) => [
      ...current,
      ...selected.map((file) => ({ name: file.name, percent: 0 })),
    ]);

    const uploaded: UploaderImage[] = [];

    for (const file of selected) {
      try {
        const ticket = await createUploadTicketAction({
          folder,
          contentType: file.type,
          size: file.size,
        });

        if (!ticket.ok) {
          setError(ticket.message);
          continue;
        }

        const result =
          ticket.mode === "direct"
            ? await uploadDirect(file, ticket.ticket, (p) => setProgress(file.name, p))
            : await uploadThroughApp(file, folder, (p) => setProgress(file.name, p));

        uploaded.push({
          url: result.url,
          publicId: result.publicId,
          alt: null,
          width: result.width || null,
          height: result.height || null,
          position: 0,
        });
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? `"${file.name}": ${uploadError.message}`
            : `Falha ao enviar "${file.name}".`,
        );
      } finally {
        setPending((current) => current.filter((p) => p.name !== file.name));
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
      </div>

      {pending.length > 0 ? (
        <ul className="space-y-2" aria-live="polite">
          {pending.map((item) => (
            <li
              key={item.name}
              className="rounded-lg border border-line bg-surface px-3.5 py-2.5"
            >
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <span className="truncate font-medium text-ink">{item.name}</span>
                <span className="shrink-0 tabular-nums text-ink-muted">
                  {item.percent}%
                </span>
              </div>
              <div
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-sunken"
                role="progressbar"
                aria-valuenow={item.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Enviando ${item.name}`}
              >
                <div
                  className="h-full rounded-full bg-brand-500 transition-[width] duration-200"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <Alert variant="danger">{error}</Alert> : null}

      {images.length === 0 && pending.length === 0 ? (
        <p className="flex items-center gap-2 rounded-lg bg-surface-alt px-3 py-2.5 text-[13px] text-ink-muted">
          <ImagePlus className="size-4" aria-hidden="true" />
          Sem imagem, o produto aparece com um placeholder na vitrine.
        </p>
      ) : null}

      {images.length > 0 ? (
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
      ) : null}
    </div>
  );
}
