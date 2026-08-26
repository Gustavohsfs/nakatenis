"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Field, FieldError, FieldHint, Input, Label, Select } from "@/components/ui";
import { UF } from "@/lib/auth/schemas";
import { formatZipCode, onlyDigits } from "@/lib/utils";

export type AddressDefaults = {
  label?: string | null;
  recipient?: string | null;
  zipCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
};

type ViaCepResponse = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

/**
 * Campos de endereço com autopreenchimento pelo ViaCEP.
 * Se a API falhar, os campos continuam editáveis — o preenchimento manual é o
 * caminho de fallback, nunca um bloqueio.
 */
export function AddressFields({
  defaults,
  errors,
  idPrefix = "",
}: {
  defaults?: AddressDefaults;
  errors?: Record<string, string>;
  idPrefix?: string;
}) {
  const [zip, setZip] = useState(defaults?.zipCode ?? "");
  const [street, setStreet] = useState(defaults?.street ?? "");
  const [district, setDistrict] = useState(defaults?.district ?? "");
  const [city, setCity] = useState(defaults?.city ?? "");
  const [state, setState] = useState(defaults?.state ?? "SP");
  const [looking, setLooking] = useState(false);
  const [zipMessage, setZipMessage] = useState<string | null>(null);

  const id = (name: string) => `${idPrefix}${name}`;
  const error = (name: string) => errors?.[name] ?? errors?.[`address.${name}`];

  async function lookupZip(value: string) {
    const digits = onlyDigits(value);
    if (digits.length !== 8) return;
    setLooking(true);
    setZipMessage(null);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!response.ok) throw new Error("falha");
      const data = (await response.json()) as ViaCepResponse;
      if (data.erro) {
        setZipMessage("CEP não encontrado. Preencha o endereço manualmente.");
        return;
      }
      if (data.logradouro) setStreet(data.logradouro);
      if (data.bairro) setDistrict(data.bairro);
      if (data.localidade) setCity(data.localidade);
      if (data.uf) setState(data.uf);
      setZipMessage(null);
    } catch {
      setZipMessage("Não conseguimos consultar o CEP agora. Preencha manualmente.");
    } finally {
      setLooking(false);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-6">
      <Field className="sm:col-span-2">
        <Label htmlFor={id("zipCode")}>CEP</Label>
        <div className="relative">
          <Input
            id={id("zipCode")}
            name="zipCode"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            value={zip}
            aria-invalid={Boolean(error("zipCode"))}
            onChange={(event) => {
              const formatted = formatZipCode(event.target.value);
              setZip(formatted);
              if (onlyDigits(formatted).length === 8) void lookupZip(formatted);
            }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
            {looking ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="size-4" aria-hidden="true" />
            )}
          </span>
        </div>
        <FieldError>{error("zipCode")}</FieldError>
        <FieldHint>{zipMessage ?? "Preenchemos o resto automaticamente."}</FieldHint>
      </Field>

      <Field className="sm:col-span-4">
        <Label htmlFor={id("recipient")}>Quem recebe</Label>
        <Input
          id={id("recipient")}
          name="recipient"
          autoComplete="name"
          defaultValue={defaults?.recipient ?? ""}
          aria-invalid={Boolean(error("recipient"))}
        />
        <FieldError>{error("recipient")}</FieldError>
      </Field>

      <Field className="sm:col-span-4">
        <Label htmlFor={id("street")}>Rua</Label>
        <Input
          id={id("street")}
          name="street"
          autoComplete="address-line1"
          value={street}
          onChange={(event) => setStreet(event.target.value)}
          aria-invalid={Boolean(error("street"))}
        />
        <FieldError>{error("street")}</FieldError>
      </Field>

      <Field className="sm:col-span-2">
        <Label htmlFor={id("number")}>Número</Label>
        <Input
          id={id("number")}
          name="number"
          defaultValue={defaults?.number ?? ""}
          aria-invalid={Boolean(error("number"))}
        />
        <FieldError>{error("number")}</FieldError>
      </Field>

      <Field className="sm:col-span-3">
        <Label htmlFor={id("complement")}>Complemento (opcional)</Label>
        <Input
          id={id("complement")}
          name="complement"
          placeholder="Apto, bloco, referência"
          defaultValue={defaults?.complement ?? ""}
        />
      </Field>

      <Field className="sm:col-span-3">
        <Label htmlFor={id("district")}>Bairro</Label>
        <Input
          id={id("district")}
          name="district"
          value={district}
          onChange={(event) => setDistrict(event.target.value)}
          aria-invalid={Boolean(error("district"))}
        />
        <FieldError>{error("district")}</FieldError>
      </Field>

      <Field className="sm:col-span-4">
        <Label htmlFor={id("city")}>Cidade</Label>
        <Input
          id={id("city")}
          name="city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          aria-invalid={Boolean(error("city"))}
        />
        <FieldError>{error("city")}</FieldError>
      </Field>

      <Field className="sm:col-span-2">
        <Label htmlFor={id("state")}>UF</Label>
        <Select
          id={id("state")}
          name="state"
          value={state}
          onChange={(event) => setState(event.target.value)}
          aria-invalid={Boolean(error("state"))}
        >
          {UF.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </Select>
        <FieldError>{error("state")}</FieldError>
      </Field>

      <Field className="sm:col-span-6">
        <Label htmlFor={id("label")}>Apelido do endereço (opcional)</Label>
        <Input
          id={id("label")}
          name="label"
          placeholder="Casa, Trabalho…"
          defaultValue={defaults?.label ?? ""}
        />
      </Field>
    </div>
  );
}
