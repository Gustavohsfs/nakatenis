/**
 * Regras de dinheiro do NakaTenis.
 * Todo valor circula em CENTAVOS (Int). Nunca Float.
 */

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** 28990 → "R$ 289,90" */
export function formatBRL(cents: number) {
  return brl.format(cents / 100);
}

/** "289,90" ou "R$ 289,90" ou "28990" → 28990 centavos */
export function parseBRLToCents(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return 0;
  // Formato pt-BR: ponto é milhar, vírgula é decimal.
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}

/**
 * Percentual de desconto arredondado. Retorna null quando não há desconto real
 * — o campo `compareAtPrice` inválido é ignorado silenciosamente na vitrine.
 */
export function getDiscount(price: number, compareAt?: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** Economia em centavos, ou null quando não há desconto. */
export function getSavings(price: number, compareAt?: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return compareAt - price;
}

export const MAX_INSTALLMENTS = 12;

/**
 * Parcelamento exibido: divide em 12x, arredondando pra cima no último centavo
 * para que a soma das parcelas nunca fique abaixo do total.
 */
export function getInstallment(price: number, installments = MAX_INSTALLMENTS) {
  const count = Math.max(1, installments);
  const amount = Math.ceil(price / count);
  return { count, amount, label: `${count}x de ${formatBRL(amount)} sem juros` };
}

/** Preço à vista no Pix (mesmo valor — a loja não aplica desconto automático). */
export function getPixPrice(price: number) {
  return price;
}
