"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Alert, Field, FieldError, Input, Label } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { signInAction, type ActionState } from "../actions";

const initialState: ActionState = { ok: false };

export function SignInForm({
  callbackUrl,
  errorFromUrl,
}: {
  callbackUrl: string;
  errorFromUrl?: string;
}) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  const message =
    state.message ??
    (errorFromUrl ? "E-mail ou senha incorretos." : undefined);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {message ? <Alert variant="danger">{message}</Alert> : null}

      <Field>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
        />
        <FieldError>{state.fieldErrors?.email}</FieldError>
      </Field>

      <Field>
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="pr-11"
            aria-invalid={Boolean(state.fieldErrors?.password)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        <FieldError>{state.fieldErrors?.password}</FieldError>
      </Field>

      <Button type="submit" size="lg" block disabled={pending}>
        <LogIn aria-hidden="true" />
        {pending ? "Entrando…" : "Entrar"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Ainda não tem conta?{" "}
        <Link
          href={`/cadastro?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-brand-500 underline-offset-4 hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
