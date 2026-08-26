"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import {
  Alert,
  Field,
  FieldError,
  FieldHint,
  Input,
  Label,
  Switch,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import { AddressFields } from "@/components/layout/address-fields";
import { formatPhone } from "@/lib/utils";
import { signUpAction, type ActionState } from "../actions";

const initialState: ActionState = { ok: false };

export function SignUpForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [withAddress, setWithAddress] = useState(true);
  const [phone, setPhone] = useState("");

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {state.message ? (
        <Alert variant={state.ok ? "success" : "danger"}>{state.message}</Alert>
      ) : null}

      <fieldset className="space-y-4">
        <legend className="text-[15px] font-semibold text-ink">Seus dados</legend>

        <Field>
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            aria-invalid={Boolean(state.fieldErrors?.name)}
          />
          <FieldError>{state.fieldErrors?.name}</FieldError>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(state.fieldErrors?.email)}
            />
            <FieldError>{state.fieldErrors?.email}</FieldError>
          </Field>

          <Field>
            <Label htmlFor="phone">WhatsApp (opcional)</Label>
            <Input
              id="phone"
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(17) 99999-9999"
              value={phone}
              onChange={(event) => setPhone(formatPhone(event.target.value))}
              aria-invalid={Boolean(state.fieldErrors?.phone)}
            />
            <FieldError>{state.fieldErrors?.phone}</FieldError>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <FieldError>{state.fieldErrors?.password}</FieldError>
            <FieldHint>Mínimo de 8 caracteres.</FieldHint>
          </Field>

          <Field>
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
            />
            <FieldError>{state.fieldErrors?.confirmPassword}</FieldError>
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-line pt-5">
        <legend className="sr-only">Endereço de entrega</legend>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[15px] font-semibold text-ink">Endereço de entrega</p>
            <p className="text-[13px] text-ink-muted">
              Vai junto na mensagem do WhatsApp — você pode cadastrar depois.
            </p>
          </div>
          <Switch
            name="withAddress"
            checked={withAddress}
            onChange={(event) => setWithAddress(event.target.checked)}
            label={withAddress ? "Incluir agora" : "Depois"}
          />
        </div>

        {withAddress ? (
          <AddressFields errors={state.fieldErrors} />
        ) : null}
      </fieldset>

      <Button type="submit" size="lg" block disabled={pending}>
        <UserPlus aria-hidden="true" />
        {pending ? "Criando conta…" : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Já tem conta?{" "}
        <Link
          href={`/entrar?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-brand-500 underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
