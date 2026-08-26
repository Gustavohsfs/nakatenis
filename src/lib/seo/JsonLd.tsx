/**
 * Injeta JSON-LD no HTML renderizado no servidor.
 * Crawlers de IA em geral não executam JS — o dado precisa vir no HTML.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Conteúdo é gerado por nós, não vem do usuário final.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}
