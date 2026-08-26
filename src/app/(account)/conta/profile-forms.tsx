"use client";

import { useActionState, useState } from "react";
import { KeyRound, Save } from "lucide-react";
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Field,
  FieldError,
  Input,
  Label,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import { formatCpf, formatPhone } from "@/lib/utils";
import {
  changePasswordAction,
  updateProfileAction,
  type AccountState,
} from "./actions";

const initialState: AccountState = { ok: false };

export function ProfileForm({
  defaults,
}: {
  defaults: { name: string; email: string; phone: string | null; cpf: string | null };
}) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialState,
  );
  const [phone, setPhone] = useState(defaults.phone ?? "");
  const [cpf, setCpf] = useState(defaults.cpf ?? "");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados pessoais</CardTitle>
        <CardDescription>
          Usamos estes dados para preencher a mensagem do WhatsApp.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          {state.message ? (
            <Alert variant={state.ok ? "success" : "danger"}>{state.message}</Alert>
          ) : null}

          <Field>
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              name="name"
              defaultValue={defaults.name}
              autoComplete="name"
              required
              aria-invalid={Boolean(state.fieldErrors?.name)}
            />
            <FieldError>{state.fieldErrors?.name}</FieldError>
          </Field>

          <Field>
            <Label htmlFor="account-email">E-mail</Label>
            <Input
              id="account-email"
              value={defaults.email}
              disabled
              readOnly
              aria-describedby="email-hint"
            />
            <p id="email-hint" className="text-[13px] text-ink-muted">
              Para trocar o e-mail, fale com a loja pelo WhatsApp.
            </p>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="phone">WhatsApp</Label>
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

            <Field>
              <Label htmlFor="cpf">CPF (opcional)</Label>
              <Input
                id="cpf"
                name="cpf"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(event) => setCpf(formatCpf(event.target.value))}
                aria-invalid={Boolean(state.fieldErrors?.cpf)}
              />
              <FieldError>{state.fieldErrors?.cpf}</FieldError>
            </Field>
          </div>

          <Button type="submit" disabled={pending}>
            <Save aria-hidden="true" />
            {pending ? "Salvando…" : "Salvar alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alterar senha</CardTitle>
        <CardDescription>Mínimo de 8 caracteres.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          {state.message ? (
            <Alert variant={state.ok ? "success" : "danger"}>{state.message}</Alert>
          ) : null}

          <Field>
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={Boolean(state.fieldErrors?.currentPassword)}
            />
            <FieldError>{state.fieldErrors?.currentPassword}</FieldError>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                aria-invalid={Boolean(state.fieldErrors?.password)}
              />
              <FieldError>{state.fieldErrors?.password}</FieldError>
            </Field>

            <Field>
              <Label htmlFor="confirm-new-password">Confirmar nova senha</Label>
              <Input
                id="confirm-new-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
              />
              <FieldError>{state.fieldErrors?.confirmPassword}</FieldError>
            </Field>
          </div>

          <Button type="submit" variant="secondary" disabled={pending}>
            <KeyRound aria-hidden="true" />
            {pending ? "Alterando…" : "Alterar senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
