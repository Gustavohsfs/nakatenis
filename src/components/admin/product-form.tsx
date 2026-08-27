"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
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
import { ImageUploader, type UploaderImage } from "./image-uploader";
import { CurrencyInput } from "./currency-input";
import type { Category, Product } from "@/lib/data/types";
import { formatBRL, getDiscount, getSavings } from "@/lib/pricing";
import { slugify } from "@/lib/utils";
import { saveProductAction } from "@/app/admin/actions";
import { useUiStore } from "@/stores/ui-store";

export const DEFAULT_PAYMENT_INFO =
  "Cartão em até 12x sem juros ou à vista no Pix.";

const formSchema = z
  .object({
    title: z.string().trim().min(3, "Informe um título com pelo menos 3 caracteres."),
    shortDescription: z
      .string()
      .trim()
      .min(10, "Mínimo de 10 caracteres.")
      .max(200, "Máximo de 200 caracteres."),
    description: z.string().trim(),
    price: z.number().int().positive("Informe o valor atual."),
    compareAtPrice: z.number().int().nonnegative(),
    paymentInfo: z.string().trim().min(3, "Informe as formas de pagamento."),
    brand: z.string().trim(),
    sku: z.string().trim(),
    stock: z
      .string()
      .trim()
      .regex(/^\d+$/, "Informe um número inteiro maior ou igual a zero."),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    categoryId: z.string().trim().min(1, "Escolha uma categoria."),
    specs: z.array(
      z.object({
        label: z.string().trim(),
        value: z.string().trim(),
      }),
    ),
  })
  .refine((data) => data.compareAtPrice === 0 || data.compareAtPrice > data.price, {
    message: "O valor antigo precisa ser MAIOR que o valor atual.",
    path: ["compareAtPrice"],
  });

type FormValues = z.infer<typeof formSchema>;

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const router = useRouter();
  const toast = useUiStore((s) => s.toast);
  const [serverError, setServerError] = useState<string | null>(null);
  const [images, setImages] = useState<UploaderImage[]>(
    product?.images.map((image) => ({
      url: image.url,
      publicId: image.publicId,
      alt: image.alt,
      width: image.width,
      height: image.height,
      position: image.position,
    })) ?? [],
  );
  const [saving, startSaving] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product?.title ?? "",
      shortDescription: product?.shortDescription ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      compareAtPrice: product?.compareAtPrice ?? 0,
      paymentInfo: product?.paymentInfo ?? DEFAULT_PAYMENT_INFO,
      brand: product?.brand ?? "",
      sku: product?.sku ?? "",
      stock: String(product?.stock ?? 0),
      isActive: product?.isActive ?? true,
      isFeatured: product?.isFeatured ?? false,
      categoryId: product?.categoryId ?? categories[0]?.id ?? "",
      specs: product?.specs.length ? product.specs : [{ label: "", value: "" }],
    },
  });

  const specs = useFieldArray({ control, name: "specs" });

  // useWatch (e não watch()) para o React Compiler conseguir memoizar o form.
  const title = useWatch({ control, name: "title" });
  const price = useWatch({ control, name: "price" });
  const compareAtPrice = useWatch({ control, name: "compareAtPrice" });
  const shortDescription = useWatch({ control, name: "shortDescription" });

  const discount = getDiscount(price, compareAtPrice || null);
  const savings = getSavings(price, compareAtPrice || null);
  const invalidCompare = compareAtPrice > 0 && compareAtPrice <= price;

  function onSubmit(values: FormValues) {
    setServerError(null);
    startSaving(async () => {
      const result = await saveProductAction({
        id: product?.id,
        title: values.title,
        // Na criação a URL nasce do título; na edição ela fica estável para não
        // quebrar links já compartilhados no WhatsApp.
        slug: product ? undefined : slugify(values.title),
        shortDescription: values.shortDescription,
        description: values.description,
        price: values.price,
        compareAtPrice: values.compareAtPrice > 0 ? values.compareAtPrice : null,
        paymentInfo: values.paymentInfo,
        brand: values.brand || null,
        sku: values.sku || null,
        stock: Number(values.stock),
        isActive: values.isActive,
        isFeatured: values.isFeatured,
        categoryId: values.categoryId,
        images: images.map((image, index) => ({ ...image, position: index })),
        specs: values.specs.filter((spec) => spec.label && spec.value),
      });

      if (!result.ok) {
        setServerError(result.message ?? "Não foi possível salvar.");
        return;
      }

      toast({
        variant: "success",
        title: result.message ?? "Produto salvo",
        description: "Já aparece na categoria escolhida.",
      });
      router.push("/admin/produtos");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/produtos">
            <ArrowLeft aria-hidden="true" />
            Voltar para a lista
          </Link>
        </Button>
        <Button type="submit" disabled={saving}>
          <Save aria-hidden="true" />
          {saving ? "Salvando…" : product ? "Salvar alterações" : "Criar produto"}
        </Button>
      </div>

      {serverError ? <Alert variant="danger">{serverError}</Alert> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          {/* ─── Identificação ──────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Identificação</CardTitle>
              <CardDescription>
                Título e descrição curta são o que aparece no card da listagem.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  {...register("title")}
                  aria-invalid={Boolean(errors.title)}
                />
                <FieldError>{errors.title?.message}</FieldError>
                <FieldHint>
                  Endereço na loja: /produto/
                  {product ? product.slug : slugify(title) || "titulo-do-produto"}
                </FieldHint>
              </Field>

              <Field>
                <Label htmlFor="shortDescription">Descrição curta</Label>
                <Textarea
                  id="shortDescription"
                  rows={2}
                  maxLength={200}
                  {...register("shortDescription")}
                  aria-invalid={Boolean(errors.shortDescription)}
                />
                <div className="flex items-center justify-between gap-2">
                  <FieldError>{errors.shortDescription?.message}</FieldError>
                  <span
                    className={
                      shortDescription.length > 180
                        ? "ml-auto text-[13px] font-medium text-accent-700"
                        : "ml-auto text-[13px] text-ink-muted"
                    }
                  >
                    {shortDescription.length}/200
                  </span>
                </div>
              </Field>

              <Field>
                <Label htmlFor="description">Descrição completa (opcional)</Label>
                <Textarea
                  id="description"
                  rows={12}
                  {...register("description")}
                  aria-invalid={Boolean(errors.description)}
                  className="font-mono text-[13px] leading-relaxed"
                />
                <FieldError>{errors.description?.message}</FieldError>
                <FieldHint>
                  Separe parágrafos com uma linha em branco. Use **texto** para negrito.
                  Descreva com entidades concretas (material, peso, formato) — é isso que
                  faz o produto ser citável por buscadores e por IAs.
                </FieldHint>
              </Field>
            </CardContent>
          </Card>

          {/* ─── Imagens ────────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Imagens</CardTitle>
              <CardDescription>
                A primeira imagem é a principal — aparece no card e no
                compartilhamento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader images={images} onChange={setImages} folder="produtos" />
            </CardContent>
          </Card>

          {/* ─── Especificações ─────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Especificações</CardTitle>
              <CardDescription>
                Tabela da PDP. Ex.: Peso · 340 g, Material · fibra de carbono 12K.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {specs.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    placeholder="Rótulo"
                    aria-label={`Rótulo da especificação ${index + 1}`}
                    className="w-2/5"
                    {...register(`specs.${index}.label` as const)}
                  />
                  <Input
                    placeholder="Valor"
                    aria-label={`Valor da especificação ${index + 1}`}
                    {...register(`specs.${index}.value` as const)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-danger-600 hover:bg-danger-50"
                    onClick={() => specs.remove(index)}
                    aria-label={`Remover especificação ${index + 1}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => specs.append({ label: "", value: "" })}
              >
                <Plus aria-hidden="true" />
                Adicionar linha
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ─── Coluna lateral ─────────────────────────────────────────────── */}
        <div className="space-y-5 xl:sticky xl:top-24 xl:h-fit">
          <Card>
            <CardHeader>
              <CardTitle>Preço</CardTitle>
              <CardDescription>Valores em reais, gravados em centavos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <Label htmlFor="price">Valor atual</Label>
                <Controller
                  control={control}
                  name="price"
                  render={({ field }) => (
                    <CurrencyInput
                      id="price"
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-invalid={Boolean(errors.price)}
                    />
                  )}
                />
                <FieldError>{errors.price?.message}</FieldError>
              </Field>

              <Field>
                <Label htmlFor="compareAtPrice">Valor antigo (opcional)</Label>
                <Controller
                  control={control}
                  name="compareAtPrice"
                  render={({ field }) => (
                    <CurrencyInput
                      id="compareAtPrice"
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-invalid={Boolean(errors.compareAtPrice) || invalidCompare}
                    />
                  )}
                />
                <FieldError>{errors.compareAtPrice?.message}</FieldError>
                {invalidCompare && !errors.compareAtPrice ? (
                  <p className="text-[13px] font-medium text-accent-700">
                    Valor antigo menor ou igual ao atual — será ignorado na vitrine.
                  </p>
                ) : null}
              </Field>

              {/* Preview ao vivo do desconto */}
              <div className="rounded-lg border border-line bg-surface-alt p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Como aparece na vitrine
                </p>
                <div className="mt-2 space-y-1">
                  {discount !== null ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-ink-muted line-through">
                        {formatBRL(compareAtPrice)}
                      </span>
                      <Badge variant="discount" size="sm">
                        -{discount}%
                      </Badge>
                    </div>
                  ) : null}
                  <p className="text-2xl font-bold leading-none text-ink tabular-nums">
                    {formatBRL(price)}
                  </p>
                  {savings ? (
                    <p className="text-[13px] font-medium text-success-600">
                      Economia de {formatBRL(savings)}
                    </p>
                  ) : null}
                  <p className="text-[13px] text-ink-muted">
                    em{" "}
                    <span className="font-semibold text-ink-soft">
                      12x de {formatBRL(Math.ceil(price / 12))} sem juros
                    </span>
                  </p>
                </div>
              </div>

              <Field>
                <Label htmlFor="paymentInfo">Formas de pagamento</Label>
                <Textarea id="paymentInfo" rows={3} {...register("paymentInfo")} />
                <FieldError>{errors.paymentInfo?.message}</FieldError>
                <FieldHint>Texto livre exibido em bloco próprio na PDP.</FieldHint>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organização</CardTitle>
              <CardDescription>
                A categoria define em qual item da sidebar o produto aparece.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <Label htmlFor="categoryId">Categoria</Label>
                <Select
                  id="categoryId"
                  {...register("categoryId")}
                  aria-invalid={Boolean(errors.categoryId)}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                      {category.isActive ? "" : " (inativa)"}
                    </option>
                  ))}
                </Select>
                <FieldError>{errors.categoryId?.message}</FieldError>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <Label htmlFor="brand">Marca</Label>
                  <Input id="brand" {...register("brand")} />
                </Field>
                <Field>
                  <Label htmlFor="sku">Código interno (SKU)</Label>
                  <Input id="sku" placeholder="Ex.: NKP-BT-340" {...register("sku")} />
                </Field>
              </div>

              <Field>
                <Label htmlFor="stock">Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  min={0}
                  {...register("stock")}
                  aria-invalid={Boolean(errors.stock)}
                />
                <FieldError>{errors.stock?.message}</FieldError>
                <FieldHint>
                  Não bloqueia a compra — o fechamento é humano, no WhatsApp. Serve para
                  exibir “últimas unidades”.
                </FieldHint>
              </Field>

              <div className="space-y-3 border-t border-line pt-4">
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      label="Ativo na vitrine"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="isFeatured"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      label="Destaque na home"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" block disabled={saving}>
            <Save aria-hidden="true" />
            {saving ? "Salvando…" : product ? "Salvar alterações" : "Criar produto"}
          </Button>
        </div>
      </div>
    </form>
  );
}
