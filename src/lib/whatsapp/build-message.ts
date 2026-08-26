import { formatBRL } from "@/lib/pricing";
import { absoluteUrl } from "@/lib/utils";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5517991814042";

/** wa.me degrada acima de ~2.000 caracteres — truncamos antes disso. */
const MAX_MESSAGE_LENGTH = 1800;
const MAX_ITEMS = 15;

export type CheckoutItem = {
  slug: string;
  title: string;
  /** centavos */
  price: number;
  quantity: number;
};

export type DeliveryInfo = {
  name: string;
  phone?: string | null;
  address?: {
    street: string;
    number: string;
    complement?: string | null;
    district: string;
    city: string;
    state: string;
    zipCode: string;
  } | null;
};

function formatAddressLine(address: NonNullable<DeliveryInfo["address"]>) {
  const street = [address.street, address.number].filter(Boolean).join(", ");
  const withComplement = address.complement
    ? `${street} — ${address.complement}`
    : street;
  return `${withComplement} — ${address.district} — ${address.city}/${address.state} — CEP ${address.zipCode}`;
}

function formatItem(item: CheckoutItem, index: number) {
  const unit = formatBRL(item.price);
  const quantityLine =
    item.quantity > 1
      ? `   Qtd: ${item.quantity} — ${unit} cada`
      : `   Qtd: 1 — ${unit}`;
  return [
    `${index + 1}. ${item.title}`,
    quantityLine,
    `   ${absoluteUrl(`/produto/${item.slug}`)}`,
  ].join("\n");
}

export function getCheckoutTotal(items: CheckoutItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

function composeMessage(
  items: CheckoutItem[],
  shownCount: number,
  delivery?: DeliveryInfo | null,
) {
  const total = getCheckoutTotal(items);
  const shown = items.slice(0, shownCount);
  const hidden = items.length - shown.length;

  const lines: string[] = [
    "Olá! Tenho interesse nestes produtos da NakaTenis:",
    "",
    ...shown.map(formatItem).flatMap((block) => [block, ""]),
  ];

  if (hidden > 0) {
    lines.push(
      `...e mais ${hidden} ${hidden === 1 ? "item" : "itens"} — ver carrinho: ${absoluteUrl("/carrinho")}`,
      "",
    );
  }

  // O total considera SEMPRE o carrinho inteiro, mesmo com a lista truncada.
  lines.push(`Total: ${formatBRL(total)}`);

  if (delivery?.address) {
    lines.push(
      "",
      "Dados para entrega:",
      delivery.name,
      ...(delivery.phone ? [delivery.phone] : []),
      formatAddressLine(delivery.address),
    );
  }

  return lines.join("\n").trimEnd();
}

/**
 * Monta a mensagem de checkout. O bloco "Dados para entrega" só entra quando há
 * usuário logado COM endereço — sem placeholder vazio.
 */
export function buildWhatsAppMessage(
  items: CheckoutItem[],
  delivery?: DeliveryInfo | null,
): string {
  if (items.length === 0) {
    return "Olá! Gostaria de saber mais sobre os produtos da NakaTenis.";
  }

  let shownCount = Math.min(items.length, MAX_ITEMS);
  let message = composeMessage(items, shownCount, delivery);

  // wa.me degrada em mensagens longas: vai cortando itens até caber.
  while (message.length > MAX_MESSAGE_LENGTH && shownCount > 1) {
    shownCount -= 1;
    message = composeMessage(items, shownCount, delivery);
  }

  return message;
}

export function buildWhatsAppUrl(
  items: CheckoutItem[],
  delivery?: DeliveryInfo | null,
) {
  const message = buildWhatsAppMessage(items, delivery);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Link de contato simples, sem carrinho — usado no rodapé e no cabeçalho. */
export function whatsAppContactUrl(text?: string) {
  const message =
    text ?? "Olá! Vim pelo site da NakaTenis e gostaria de tirar uma dúvida.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
