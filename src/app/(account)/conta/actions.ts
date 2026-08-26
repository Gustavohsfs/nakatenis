"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/guards";
import { userRepo } from "@/lib/data";
import { addressSchema, passwordChangeSchema, profileSchema } from "@/lib/auth/schemas";
import { onlyDigits } from "@/lib/utils";

export type AccountState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

function collectErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function normalizeZip(value: string) {
  const digits = onlyDigits(value);
  return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
}

export async function updateProfileAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const user = await requireUser("/conta");
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
    cpf: formData.get("cpf") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: collectErrors(parsed.error.issues) };
  }

  await userRepo.updateProfile(user.id, {
    name: parsed.data.name,
    phone: parsed.data.phone || null,
    cpf: parsed.data.cpf || null,
  });

  revalidatePath("/conta");
  return { ok: true, message: "Dados atualizados." };
}

export async function changePasswordAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await requireUser("/conta");
  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: collectErrors(parsed.error.issues) };
  }

  const user = await userRepo.getById(session.id);
  if (!user) return { ok: false, message: "Sessão inválida. Entre novamente." };

  const valid = await userRepo.verifyCredentials(
    user.email,
    parsed.data.currentPassword,
  );
  if (!valid) {
    return { ok: false, fieldErrors: { currentPassword: "Senha atual incorreta." } };
  }

  await userRepo.updatePassword(session.id, parsed.data.password);
  return { ok: true, message: "Senha alterada." };
}

export async function saveAddressAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const user = await requireUser("/conta/endereco");
  const addressId = formData.get("addressId");

  const parsed = addressSchema.safeParse({
    label: formData.get("label") ?? "",
    recipient: formData.get("recipient"),
    zipCode: formData.get("zipCode"),
    street: formData.get("street"),
    number: formData.get("number"),
    complement: formData.get("complement") ?? "",
    district: formData.get("district"),
    city: formData.get("city"),
    state: formData.get("state"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: collectErrors(parsed.error.issues),
      message: "Confira os campos destacados.",
    };
  }

  const input = {
    label: parsed.data.label || null,
    recipient: parsed.data.recipient,
    zipCode: normalizeZip(parsed.data.zipCode),
    street: parsed.data.street,
    number: parsed.data.number,
    complement: parsed.data.complement || null,
    district: parsed.data.district,
    city: parsed.data.city,
    state: parsed.data.state,
    isDefault: formData.get("isDefault") === "on",
  };

  if (typeof addressId === "string" && addressId) {
    await userRepo.updateAddress(user.id, addressId, input);
  } else {
    await userRepo.addAddress(user.id, input);
  }

  revalidatePath("/conta/endereco");
  return { ok: true, message: "Endereço salvo." };
}

export async function removeAddressAction(addressId: string): Promise<AccountState> {
  const user = await requireUser("/conta/endereco");
  await userRepo.removeAddress(user.id, addressId);
  revalidatePath("/conta/endereco");
  return { ok: true, message: "Endereço removido." };
}

export async function setDefaultAddressAction(
  addressId: string,
): Promise<AccountState> {
  const user = await requireUser("/conta/endereco");
  await userRepo.setDefaultAddress(user.id, addressId);
  revalidatePath("/conta/endereco");
  return { ok: true, message: "Endereço padrão atualizado." };
}
