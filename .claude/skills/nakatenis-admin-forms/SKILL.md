---
name: nakatenis-admin-forms
description: Use ao criar ou alterar telas do painel admin do NakaTenis — carrega o padrão react-hook-form + zod, upload de múltiplas imagens, estados de erro e loading e confirmação de exclusão.
---

# Formulários do painel NakaTenis

## Segurança primeiro

**Toda Server Action de mutação começa com `await requireAdmin()`.** Não confie no proxy nem no layout: a action é um endpoint público e pode ser chamada direto. `requireAdmin` responde 404 (não 403) para usuário comum — o painel não deve revelar que existe.

A rota `POST /api/upload` faz a mesma checagem e responde 404 sem sessão de admin.

## Padrão de formulário

`react-hook-form` + `zodResolver`, com a Server Action chamada dentro de `useTransition`:

```tsx
const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: { ... },
});
const [saving, startSaving] = useTransition();

function onSubmit(values: FormValues) {
  startSaving(async () => {
    const result = await saveXAction({ id, ...values });
    if (!result.ok) { setServerError(result.message); return; }
    toast({ variant: "success", title: result.message });
    router.push("/admin/x"); router.refresh();
  });
}
```

Formulários simples (login, endereço, perfil) usam `useActionState` + `<form action={formAction}>` em vez de RHF — menos JS para o mesmo resultado.

**Sempre revalide no servidor também.** O schema zod do cliente é conveniência; o schema em `src/app/admin/actions.ts` é a regra.

## Detalhes que já estão resolvidos — não reinventar

- **Máscara de moeda**: `<CurrencyInput value={cents} onValueChange={...} />`. Entra e sai em **centavos**. Use `Controller` do RHF.
- **Preview de desconto ao vivo**: bloco "Como aparece na vitrine" no `ProductForm`. Valor antigo `<=` valor atual → aviso âmbar ("será ignorado na vitrine"), e o `refine` do schema bloqueia o submit.
- **Upload múltiplo**: `<ImageUploader images onChange folder max />` — drag-and-drop, preview, reordenação por setas, "tornar principal" (posição 0), remoção (que apaga do storage via `deleteUploadedImageAction`) e campo de texto alternativo por imagem.
- **Slug**: não existe campo no formulário. Gerado do título na criação (colisão vira sufixo `-2`, `-3`) e **estável na edição** — mudar o título não muda a URL, para não quebrar links já compartilhados no WhatsApp. O hint sob o título mostra o endereço.
- **Contador de caracteres**: descrição curta 200. Vira âmbar perto do limite.
- **SEO**: sem campos manuais. `generateMetadata` usa título + descrição curta como fallback; `metaTitle`/`metaDescription` continuam no schema do banco caso um dia voltem ao formulário.
- **Exclusão**: sempre `<ConfirmDialog>`, com o nome do registro e a consequência escrita ("junto com N imagens no storage"). Excluir produto remove as imagens do storage antes do registro — depois não há mais `publicId`.
- **`useWatch({ control, name })`**, não `watch()` — o `watch()` faz o React Compiler pular a memoização do componente inteiro.

## Estados obrigatórios

| Estado | Como |
|---|---|
| loading | `disabled={saving}` + label "Salvando…" |
| erro de campo | `aria-invalid` no input + `<FieldError>` abaixo |
| erro geral | `<Alert variant="danger">` no topo do formulário |
| sucesso | `toast({ variant: "success" })` + `router.refresh()` |
| vazio | `<EmptyState>` com CTA |

## Revalidação

Depois de mutar catálogo, chame `revalidatePath("/", "layout")` (a sidebar de categorias vive no layout) mais os caminhos específicos (`/produto/[slug]`, `/categoria/[slug]`, `/admin/produtos`).
