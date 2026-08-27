"use client";

/**
 * Loader de imagem do Next.
 *
 * Sem ele, todo `next/image` passaria por `/_next/image` e o NOSSO servidor
 * faria o resize e a conversão para WebP/AVIF. Num plano com CPU e RAM
 * compartilhadas isso é exatamente o que não pode acontecer: processar imagem
 * é o que mais consome.
 *
 * Com este loader, a transformação vira parâmetro na URL do Cloudinary e quem
 * redimensiona é o CDN deles. O servidor nunca toca em pixel.
 *
 * URLs que não são do Cloudinary (SVGs do mock, placeholder, /uploads do driver
 * local) passam direto, sem transformação — são leves e já estão no formato
 * final.
 */
const CLOUDINARY_HOST = "res.cloudinary.com";
const UPLOAD_SEGMENT = "/image/upload/";

export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src.includes(CLOUDINARY_HOST) || !src.includes(UPLOAD_SEGMENT)) {
    return src;
  }

  const [base, rest] = src.split(UPLOAD_SEGMENT);
  if (!rest) return src;

  const transforms = [
    "f_auto", // WebP/AVIF conforme o Accept do browser
    quality ? `q_${quality}` : "q_auto",
    "c_limit", // reduz quando precisa, nunca amplia
    `w_${width}`,
  ].join(",");

  return `${base}${UPLOAD_SEGMENT}${transforms}/${rest}`;
}
