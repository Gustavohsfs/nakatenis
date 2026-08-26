"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  Alert,
  Badge,
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
  Select,
  Switch,
  Textarea,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useUiStore } from "@/stores/ui-store";
import type { Category } from "@/lib/data/types";
import { slugify } from "@/lib/utils";
import {
  deleteCategoryAction,
  reorderCategoriesAction,
  saveCategoryAction,
} from "@/app/admin/actions";

const ICON_OPTIONS = [
  { value: "racket", label: "Raquete" },
  { value: "shoe", label: "Calçado" },
  { value: "shirt", label: "Roupa" },
  { value: "bag", label: "Bolsa / acessório" },
];

type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
};

const EMPTY_DRAFT: Draft = {
  name: "",
  slug: "",
  description: "",
  icon: "racket",
  isActive: true,
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const toast = useUiStore((s) => s.toast);
  const [pending, startTransition] = useTransition();
  const [order, setOrder] = useState(categories);
  const [dirtyOrder, setDirtyOrder] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function moveTo(from: number, to: number) {
    if (to < 0 || to >= order.length || from === to) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrder(next);
    setDirtyOrder(true);
  }

  function saveOrder() {
    startTransition(async () => {
      const result = await reorderCategoriesAction(order.map((c) => c.id));
      toast({
        variant: result.ok ? "success" : "danger",
        title: result.message ?? "Erro ao reordenar",
      });
      setDirtyOrder(false);
      router.refresh();
    });
  }

  function submitDraft() {
    if (!draft) return;
    setErrors({});
    setFormError(null);
    startTransition(async () => {
      const result = await saveCategoryAction({
        id: draft.id,
        name: draft.name,
        slug: draft.slug || slugify(draft.name),
        description: draft.description || null,
        icon: draft.icon || null,
        isActive: draft.isActive,
      });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.message ?? "Não foi possível salvar.");
        return;
      }
      toast({ variant: "success", title: result.message ?? "Categoria salva" });
      setDraft(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Ordem da sidebar</CardTitle>
            <CardDescription>
              Arraste ou use as setas. Esta é a ordem que o cliente vê na loja.
            </CardDescription>
          </div>
          {dirtyOrder ? (
            <Button size="sm" onClick={saveOrder} disabled={pending}>
              <Save aria-hidden="true" />
              Salvar ordem
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-line">
            {order.map((category, index) => (
              <li
                key={category.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragIndex !== null) moveTo(dragIndex, index);
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
                className={
                  dragIndex === index
                    ? "flex items-center gap-3 bg-brand-50 px-4 py-3"
                    : "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-alt/60"
                }
              >
                <GripVertical
                  className="size-4 shrink-0 cursor-grab text-ink-muted"
                  aria-hidden="true"
                />

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-sm font-medium text-ink">
                    {category.name}
                    {!category.isActive ? (
                      <Badge variant="neutral" size="sm">
                        inativa
                      </Badge>
                    ) : null}
                    <Badge variant="outline" size="sm">
                      {category.productCount ?? 0} produtos
                    </Badge>
                  </p>
                  <p className="truncate text-[12.5px] text-ink-muted">
                    /categoria/{category.slug}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => moveTo(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Mover ${category.name} para cima`}
                  >
                    <ChevronUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => moveTo(index, index + 1)}
                    disabled={index === order.length - 1}
                    aria-label={`Mover ${category.name} para baixo`}
                  >
                    <ChevronDown />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setDraft({
                        id: category.id,
                        name: category.name,
                        slug: category.slug,
                        description: category.description ?? "",
                        icon: category.icon ?? "racket",
                        isActive: category.isActive,
                      })
                    }
                    aria-label={`Editar ${category.name}`}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-danger-600 hover:bg-danger-50"
                    onClick={() => setConfirmDelete(category)}
                    aria-label={`Excluir ${category.name}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {draft ? (
        <Card>
          <CardHeader>
            <CardTitle>{draft.id ? "Editar categoria" : "Nova categoria"}</CardTitle>
            <CardDescription>
              O slug vira a URL da listagem: /categoria/{draft.slug || slugify(draft.name) || "…"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formError ? <Alert variant="danger">{formError}</Alert> : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <Label htmlFor="cat-name">Nome</Label>
                <Input
                  id="cat-name"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      name: event.target.value,
                      slug: draft.id ? draft.slug : slugify(event.target.value),
                    })
                  }
                  aria-invalid={Boolean(errors.name)}
                />
                <FieldError>{errors.name}</FieldError>
              </Field>

              <Field>
                <Label htmlFor="cat-slug">Slug</Label>
                <Input
                  id="cat-slug"
                  value={draft.slug}
                  onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
                />
              </Field>
            </div>

            <Field>
              <Label htmlFor="cat-description">Descrição</Label>
              <Textarea
                id="cat-description"
                rows={3}
                value={draft.description}
                onChange={(event) =>
                  setDraft({ ...draft, description: event.target.value })
                }
              />
              <FieldHint>
                Aparece no topo da listagem e na meta description da categoria.
              </FieldHint>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <Label htmlFor="cat-icon">Ícone da sidebar</Label>
                <Select
                  id="cat-icon"
                  value={draft.icon}
                  onChange={(event) => setDraft({ ...draft, icon: event.target.value })}
                >
                  {ICON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="flex items-end pb-2">
                <Switch
                  checked={draft.isActive}
                  onChange={(event) =>
                    setDraft({ ...draft, isActive: event.target.checked })
                  }
                  label="Visível na loja"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={submitDraft} disabled={pending}>
                <Save aria-hidden="true" />
                {pending ? "Salvando…" : "Salvar categoria"}
              </Button>
              <Button variant="outline" onClick={() => setDraft(null)}>
                <X aria-hidden="true" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="secondary" onClick={() => setDraft({ ...EMPTY_DRAFT })}>
          <Plus aria-hidden="true" />
          Nova categoria
        </Button>
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Excluir esta categoria?"
        description={
          confirmDelete ? (
            (confirmDelete.productCount ?? 0) > 0 ? (
              <>
                <strong>{confirmDelete.name}</strong> tem{" "}
                {confirmDelete.productCount} produto(s) vinculado(s). Mova os produtos
                para outra categoria antes de excluir.
              </>
            ) : (
              <>
                <strong>{confirmDelete.name}</strong> será removida da sidebar e da
                loja.
              </>
            )
          ) : undefined
        }
        confirmLabel="Excluir categoria"
        pending={pending}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          const target = confirmDelete;
          if (!target) return;
          startTransition(async () => {
            const result = await deleteCategoryAction(target.id);
            toast({
              variant: result.ok ? "success" : "danger",
              title: result.message ?? "Erro ao excluir",
            });
            if (result.ok) setConfirmDelete(null);
            router.refresh();
          });
        }}
      />
    </div>
  );
}
