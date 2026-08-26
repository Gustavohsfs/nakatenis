import { z } from "zod";
import { onlyDigits } from "@/lib/utils";

const UF = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT",
  "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
] as const;

export const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const signInSchema = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail.").email("E-mail inválido."),
  password: z.string().min(1, "Informe sua senha."),
});

export const addressSchema = z.object({
  label: z.string().trim().max(40).optional().or(z.literal("")),
  recipient: z.string().trim().min(3, "Informe o nome de quem recebe."),
  zipCode: z
    .string()
    .trim()
    .refine((v) => onlyDigits(v).length === 8, "CEP deve ter 8 dígitos."),
  street: z.string().trim().min(3, "Informe a rua."),
  number: z.string().trim().min(1, "Informe o número."),
  complement: z.string().trim().max(60).optional().or(z.literal("")),
  district: z.string().trim().min(2, "Informe o bairro."),
  city: z.string().trim().min(2, "Informe a cidade."),
  state: z.enum(UF, { message: "UF inválida." }),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(3, "Informe seu nome completo."),
    email: z.string().trim().min(1, "Informe seu e-mail.").email("E-mail inválido."),
    password: z
      .string()
      .min(8, "A senha precisa de no mínimo 8 caracteres.")
      .max(72, "A senha pode ter no máximo 72 caracteres."),
    confirmPassword: z.string(),
    phone: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || [10, 11].includes(onlyDigits(v).length),
        "Telefone inválido.",
      )
      .optional()
      .or(z.literal("")),
    address: addressSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo."),
  phone: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || [10, 11].includes(onlyDigits(v).length),
      "Telefone inválido.",
    )
    .optional()
    .or(z.literal("")),
  cpf: z
    .string()
    .trim()
    .refine((v) => v === "" || onlyDigits(v).length === 11, "CPF inválido.")
    .optional()
    .or(z.literal("")),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    password: z.string().min(8, "A nova senha precisa de no mínimo 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type AddressFormInput = z.infer<typeof addressSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export { UF };
