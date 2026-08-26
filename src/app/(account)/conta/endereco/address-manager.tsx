"use client";

import { useActionState, useState, useTransition } from "react";
import { Check, MapPin, Plus, Save, Star, Trash2, X } from "lucide-react";
import {
  Alert,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  EmptyState,
  Switch,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddressFields } from "@/components/layout/address-fields";
import type { Address } from "@/lib/data/types";
import {
  removeAddressAction,
  saveAddressAction,
  setDefaultAddressAction,
  type AccountState,
} from "../actions";

const initialState: AccountState = { ok: false };

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [editing, setEditing] = useState<Address | "new" | null>(
    addresses.length === 0 ? "new" : null,
  );
  const [confirmRemove, setConfirmRemove] = useState<Address | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-5">
      {addresses.length === 0 && editing !== "new" ? (
        <EmptyState
          icon={<MapPin className="size-7" />}
          title="Nenhum endereço cadastrado"
          description="Com endereço salvo, ele vai junto na mensagem do WhatsApp e você não precisa digitar a cada pedido."
          action={
            <Button onClick={() => setEditing("new")}>
              <Plus aria-hidden="true" />
              Cadastrar endereço
            </Button>
          }
        />
      ) : null}

      {addresses.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                        {address.label || "Endereço"}
                        {address.isDefault ? (
                          <Badge variant="success" size="sm">
                            <Star className="size-3" aria-hidden="true" />
                            Padrão
                          </Badge>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-[13px] text-ink-muted">
                        {address.recipient}
                      </p>
                    </div>
                  </div>

                  <address className="text-[13.5px] not-italic leading-relaxed text-ink-soft">
                    {address.street}, {address.number}
                    {address.complement ? ` — ${address.complement}` : ""}
                    <br />
                    {address.district} — {address.city}/{address.state}
                    <br />
                    CEP {address.zipCode}
                  </address>

                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditing(address)}
                    >
                      Editar
                    </Button>
                    {!address.isDefault ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            await setDefaultAddressAction(address.id);
                          })
                        }
                      >
                        <Check aria-hidden="true" />
                        Tornar padrão
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-danger-600 hover:bg-danger-50"
                      onClick={() => setConfirmRemove(address)}
                    >
                      <Trash2 aria-hidden="true" />
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}

      {editing ? (
        <AddressForm
          address={editing === "new" ? null : editing}
          onDone={() => setEditing(null)}
          allowCancel={addresses.length > 0}
        />
      ) : (
        <Button variant="secondary" onClick={() => setEditing("new")}>
          <Plus aria-hidden="true" />
          Adicionar outro endereço
        </Button>
      )}

      <ConfirmDialog
        open={Boolean(confirmRemove)}
        title="Remover este endereço?"
        description={
          confirmRemove
            ? `${confirmRemove.street}, ${confirmRemove.number} — ${confirmRemove.city}/${confirmRemove.state}`
            : undefined
        }
        confirmLabel="Remover"
        pending={pending}
        onCancel={() => setConfirmRemove(null)}
        onConfirm={() => {
          const target = confirmRemove;
          if (!target) return;
          startTransition(async () => {
            await removeAddressAction(target.id);
            setConfirmRemove(null);
          });
        }}
      />
    </div>
  );
}

function AddressForm({
  address,
  onDone,
  allowCancel,
}: {
  address: Address | null;
  onDone: () => void;
  allowCancel: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveAddressAction, initialState);
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? true);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{address ? "Editar endereço" : "Novo endereço"}</CardTitle>
        <CardDescription>
          O endereço padrão é o que entra na mensagem do WhatsApp.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5" noValidate>
          {address ? (
            <input type="hidden" name="addressId" value={address.id} />
          ) : null}

          {state.message ? (
            <Alert variant={state.ok ? "success" : "danger"}>{state.message}</Alert>
          ) : null}

          <AddressFields
            defaults={address ?? undefined}
            errors={state.fieldErrors}
            idPrefix={address ? `edit-${address.id}-` : "new-"}
          />

          <Switch
            name="isDefault"
            checked={isDefault}
            onChange={(event) => setIsDefault(event.target.checked)}
            label="Usar como endereço padrão"
          />

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              <Save aria-hidden="true" />
              {pending ? "Salvando…" : "Salvar endereço"}
            </Button>
            {allowCancel ? (
              <Button type="button" variant="outline" onClick={onDone}>
                <X aria-hidden="true" />
                Cancelar
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
