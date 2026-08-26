"use client";

import { useState } from "react";
import { Input } from "@/components/ui";
import { formatBRL, parseBRLToCents } from "@/lib/pricing";

/**
 * Máscara de moeda. O valor sai sempre em CENTAVOS (Int) — nunca Float.
 * Digitar só dígitos: 28990 → R$ 289,90.
 */
export function CurrencyInput({
  value,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  value: number;
  onValueChange: (cents: number) => void;
}) {
  const [text, setText] = useState(() => (value > 0 ? formatBRL(value) : ""));
  const [lastValue, setLastValue] = useState(value);

  // Ajuste durante a renderização: quando o valor muda por fora (reset do
  // formulário), refaz o texto sem passar por um efeito.
  if (value !== lastValue) {
    setLastValue(value);
    setText(value > 0 ? formatBRL(value) : "");
  }

  return (
    <Input
      inputMode="numeric"
      placeholder="R$ 0,00"
      className="font-semibold tabular-nums"
      {...props}
      value={text}
      onChange={(event) => {
        const digits = event.target.value.replace(/\D/g, "");
        if (!digits) {
          setText("");
          onValueChange(0);
          return;
        }
        const cents = Number.parseInt(digits, 10);
        setText(formatBRL(cents));
        onValueChange(cents);
      }}
      onBlur={(event) => {
        // Cola de "289,90" ou "R$ 1.299,00" continua funcionando.
        const cents = parseBRLToCents(event.target.value);
        setText(cents > 0 ? formatBRL(cents) : "");
        onValueChange(cents);
      }}
    />
  );
}
