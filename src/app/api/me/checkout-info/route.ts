import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { userRepo } from "@/lib/data";
import type { DeliveryInfo } from "@/lib/whatsapp/build-message";

/**
 * Sessão + endereço de entrega, lidos PELO NAVEGADOR depois do load.
 *
 * Existe para as páginas públicas poderem ser cacheadas: nenhum dado de
 * sessão entra no HTML delas — o menu de conta e o bloco de entrega da
 * mensagem do WhatsApp vêm daqui, por usuário, sem invalidar o cache.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { user: null, delivery: null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const user = await userRepo.getById(session.id);
  if (!user) {
    return NextResponse.json(
      { user: null, delivery: null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const address = user.addresses.find((a) => a.isDefault) ?? user.addresses[0];
  const delivery: DeliveryInfo | null = address
    ? {
        name: user.name,
        phone: user.phone,
        address: {
          street: address.street,
          number: address.number,
          complement: address.complement,
          district: address.district,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
        },
      }
    : null;

  return NextResponse.json(
    {
      user: { name: user.name, email: user.email, role: user.role },
      delivery,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
