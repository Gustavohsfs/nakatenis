"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { userRepo } from "@/lib/data";
import {
  LOGIN_LIMIT,
  SIGNUP_LIMIT,
  rateLimit,
} from "@/lib/auth/rate-limit";
import { signInSchema, signUpSchema } from "@/lib/auth/schemas";
import { onlyDigits } from "@/lib/utils";

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

/** Chave do rate limit: IP do cliente atrás do Nginx, com fallback local. */
async function clientKey(prefix: string) {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "local";
  return `${prefix}:${ip}`;
}

function safeCallbackUrl(value: FormDataEntryValue | null) {
  const raw = typeof value === "string" ? value : "";
  // Nunca redirecionar para fora do site — open redirect.
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
}

export async function signInAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limit = rateLimit(await clientKey("login"), LOGIN_LIMIT);
  if (!limit.ok) {
    return {
      ok: false,
      message: `Muitas tentativas. Tente novamente em ${Math.ceil(limit.retryAfterSeconds / 60)} minuto(s).`,
    };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { ok: false, fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeCallbackUrl(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Mensagem genérica de propósito: nunca revelar se o e-mail existe.
      return { ok: false, message: "E-mail ou senha incorretos." };
    }
    throw error; // NEXT_REDIRECT precisa subir para o Next tratar.
  }

  return { ok: true };
}

export async function signUpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limit = rateLimit(await clientKey("signup"), SIGNUP_LIMIT);
  if (!limit.ok) {
    return {
      ok: false,
      message: `Muitas tentativas de cadastro. Tente novamente em ${Math.ceil(limit.retryAfterSeconds / 60)} minuto(s).`,
    };
  }

  const wantsAddress = formData.get("withAddress") === "on";

  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    phone: formData.get("phone") ?? "",
    ...(wantsAddress
      ? {
          address: {
            label: formData.get("label") ?? "",
            recipient: formData.get("recipient"),
            zipCode: formData.get("zipCode"),
            street: formData.get("street"),
            number: formData.get("number"),
            complement: formData.get("complement") ?? "",
            district: formData.get("district"),
            city: formData.get("city"),
            state: formData.get("state"),
          },
        }
      : {}),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors, message: "Confira os campos destacados." };
  }

  const { address, ...data } = parsed.data;

  try {
    await userRepo.create({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || null,
      address: address
        ? {
            label: address.label || null,
            recipient: address.recipient,
            zipCode: onlyDigits(address.zipCode).replace(/(\d{5})(\d{3})/, "$1-$2"),
            street: address.street,
            number: address.number,
            complement: address.complement || null,
            district: address.district,
            city: address.city,
            state: address.state,
            isDefault: true,
          }
        : null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível criar a conta.";
    return { ok: false, message };
  }

  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: safeCallbackUrl(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: true,
        message: "Conta criada! Faça login para continuar.",
      };
    }
    throw error;
  }

  return { ok: true };
}
