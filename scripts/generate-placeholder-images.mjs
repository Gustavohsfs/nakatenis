/**
 * Gera as ilustrações SVG usadas pelo catálogo mock (public/mock).
 * São placeholders desenhados à mão — nenhuma dependência externa de imagem.
 * Uso: node scripts/generate-placeholder-images.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "mock");
mkdirSync(OUT, { recursive: true });

const PALETTES = {
  blue: ["#e6f0f8", "#c6ddf0", "#12406e", "#1b6ca8"],
  sand: ["#fdf1dc", "#f8cd8a", "#a36613", "#f2a93b"],
  mint: ["#e8f7ef", "#bfe8d1", "#116631", "#15803d"],
  slate: ["#eef2f7", "#d6dee9", "#0f172a", "#475569"],
};

const rep = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join("");

const shapes = {
  "raquete-tenis": (a, b) =>
    '<g transform="translate(400 400) rotate(-24)">' +
    '<ellipse cx="0" cy="-90" rx="150" ry="185" fill="none" stroke="' +
    a +
    '" stroke-width="26"/>' +
    '<ellipse cx="0" cy="-90" rx="124" ry="159" fill="#ffffff" fill-opacity=".7"/>' +
    '<g stroke="' +
    b +
    '" stroke-width="4" opacity=".5">' +
    rep(
      9,
      (i) =>
        '<line x1="' +
        (-112 + i * 28) +
        '" y1="-238" x2="' +
        (-112 + i * 28) +
        '" y2="58"/>',
    ) +
    rep(
      11,
      (i) =>
        '<line x1="-126" y1="' +
        (-232 + i * 28) +
        '" x2="126" y2="' +
        (-232 + i * 28) +
        '"/>',
    ) +
    "</g>" +
    '<ellipse cx="0" cy="-90" rx="124" ry="159" fill="none" stroke="' +
    a +
    '" stroke-width="8"/>' +
    '<path d="M-34 78 L34 78 L26 150 L-26 150 Z" fill="' +
    a +
    '"/>' +
    '<rect x="-30" y="146" width="60" height="150" rx="26" fill="' +
    b +
    '"/>' +
    '<rect x="-30" y="146" width="60" height="150" rx="26" fill="none" stroke="' +
    a +
    '" stroke-width="6"/>' +
    "</g>",

  "raquete-beach": (a, b) =>
    '<g transform="translate(400 380) rotate(-18)">' +
    '<rect x="-160" y="-250" width="320" height="380" rx="150" fill="' +
    a +
    '"/>' +
    '<rect x="-134" y="-224" width="268" height="328" rx="130" fill="#ffffff" fill-opacity=".82"/>' +
    '<g fill="' +
    b +
    '" opacity=".65">' +
    rep(5, (r) =>
      rep(
        5,
        (c) =>
          '<circle cx="' + (-88 + c * 44) + '" cy="' + (-160 + r * 60) + '" r="13"/>',
      ),
    ) +
    "</g>" +
    '<rect x="-134" y="-224" width="268" height="328" rx="130" fill="none" stroke="' +
    a +
    '" stroke-width="7"/>' +
    '<rect x="-34" y="120" width="68" height="170" rx="30" fill="' +
    b +
    '"/>' +
    '<rect x="-34" y="120" width="68" height="170" rx="30" fill="none" stroke="' +
    a +
    '" stroke-width="6"/>' +
    "</g>",

  tenis: (a, b) =>
    '<g transform="translate(400 430)">' +
    '<path d="M-250 70 C-250 10 -230 -30 -190 -46 L-120 -74 C-92 -86 -74 -104 -58 -132 L-24 -190 C-8 -216 22 -222 44 -204 L74 -180 C96 -162 100 -132 88 -108 L74 -80 L182 -44 C224 -30 250 6 250 50 L250 74 C250 96 232 114 210 114 L-210 114 C-232 114 -250 96 -250 74 Z" fill="' +
    a +
    '"/>' +
    '<path d="M-250 62 L250 62 L250 74 C250 96 232 114 210 114 L-210 114 C-232 114 -250 96 -250 74 Z" fill="' +
    b +
    '"/>' +
    '<path d="M-24 -190 C-8 -216 22 -222 44 -204 L74 -180 C96 -162 100 -132 88 -108 L74 -80 L-4 -104 Z" fill="#ffffff" fill-opacity=".5"/>' +
    '<g stroke="#ffffff" stroke-width="9" stroke-linecap="round" opacity=".85">' +
    '<line x1="-42" y1="-108" x2="16" y2="-146"/>' +
    '<line x1="-24" y1="-74" x2="36" y2="-112"/>' +
    '<line x1="-6" y1="-40" x2="54" y2="-78"/>' +
    "</g>" +
    '<circle cx="-160" cy="16" r="20" fill="#ffffff" fill-opacity=".45"/>' +
    "</g>",

  camisa: (a, b) =>
    '<g transform="translate(400 400)">' +
    '<path d="M-96 -172 L-40 -196 C-24 -160 24 -160 40 -196 L96 -172 L192 -128 L152 -30 L108 -46 L108 196 C108 210 97 220 84 220 L-84 220 C-97 220 -108 210 -108 196 L-108 -46 L-152 -30 L-192 -128 Z" fill="' +
    a +
    '"/>' +
    '<path d="M-40 -196 C-24 -160 24 -160 40 -196 L18 -206 C6 -186 -6 -186 -18 -206 Z" fill="#ffffff" fill-opacity=".7"/>' +
    '<rect x="-108" y="96" width="216" height="26" fill="' +
    b +
    '" opacity=".85"/>' +
    '<circle cx="0" cy="10" r="46" fill="#ffffff" fill-opacity=".55"/>' +
    '<path d="M-22 10 l16 18 l30 -38" fill="none" stroke="' +
    b +
    '" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>' +
    "</g>",

  shorts: (a, b) =>
    '<g transform="translate(400 400)">' +
    '<path d="M-170 -140 L170 -140 L200 170 C202 188 189 202 171 202 L54 202 C38 202 25 190 23 174 L0 22 L-23 174 C-25 190 -38 202 -54 202 L-171 202 C-189 202 -202 188 -200 170 Z" fill="' +
    a +
    '"/>' +
    '<rect x="-170" y="-140" width="340" height="44" fill="' +
    b +
    '"/>' +
    '<path d="M0 22 L-23 174 C-25 190 -38 202 -54 202 L-171 202 C-189 202 -202 188 -200 170 L-186 22 Z" fill="#ffffff" fill-opacity=".28"/>' +
    '<line x1="-150" y1="-118" x2="-40" y2="-118" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity=".8"/>' +
    "</g>",

  bola: (a, b) =>
    '<g transform="translate(400 400)">' +
    '<circle cx="0" cy="0" r="210" fill="' +
    a +
    '"/>' +
    '<circle cx="-64" cy="-70" r="70" fill="#ffffff" fill-opacity=".28"/>' +
    '<path d="M-208 -34 C-120 -22 -80 46 -74 208" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round"/>' +
    '<path d="M208 -34 C120 -22 80 46 74 208" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round"/>' +
    '<circle cx="0" cy="0" r="210" fill="none" stroke="' +
    b +
    '" stroke-width="8" opacity=".4"/>' +
    "</g>",

  mochila: (a, b) =>
    '<g transform="translate(400 400)">' +
    '<path d="M-140 -110 C-140 -190 -80 -230 0 -230 C80 -230 140 -190 140 -110 L140 30 L-140 30 Z" fill="' +
    a +
    '"/>' +
    '<rect x="-160" y="10" width="320" height="230" rx="42" fill="' +
    a +
    '"/>' +
    '<rect x="-160" y="86" width="320" height="66" fill="' +
    b +
    '"/>' +
    '<rect x="-58" y="98" width="116" height="42" rx="12" fill="#ffffff" fill-opacity=".7"/>' +
    '<path d="M-96 -120 C-96 -176 -50 -200 0 -200 C50 -200 96 -176 96 -120" fill="none" stroke="#ffffff" stroke-width="14" opacity=".55"/>' +
    '<rect x="-60" y="180" width="120" height="16" rx="8" fill="#ffffff" fill-opacity=".45"/>' +
    "</g>",

  acessorio: (a, b) =>
    '<g transform="translate(400 400)">' +
    '<circle cx="0" cy="0" r="180" fill="' +
    a +
    '"/>' +
    '<circle cx="0" cy="0" r="120" fill="#ffffff" fill-opacity=".75"/>' +
    '<circle cx="0" cy="0" r="60" fill="' +
    b +
    '"/>' +
    '<g stroke="' +
    b +
    '" stroke-width="14" stroke-linecap="round">' +
    '<line x1="0" y1="-176" x2="0" y2="-128"/>' +
    '<line x1="0" y1="128" x2="0" y2="176"/>' +
    '<line x1="-176" y1="0" x2="-128" y2="0"/>' +
    '<line x1="128" y1="0" x2="176" y2="0"/>' +
    "</g>" +
    "</g>",
};

const files = [
  ["raquete-tenis-1", "raquete-tenis", "blue"],
  ["raquete-tenis-2", "raquete-tenis", "slate"],
  ["raquete-tenis-3", "raquete-tenis", "mint"],
  ["raquete-beach-1", "raquete-beach", "sand"],
  ["raquete-beach-2", "raquete-beach", "blue"],
  ["raquete-beach-3", "raquete-beach", "mint"],
  ["raquete-beach-4", "raquete-beach", "slate"],
  ["tenis-1", "tenis", "blue"],
  ["tenis-2", "tenis", "slate"],
  ["tenis-3", "tenis", "sand"],
  ["tenis-4", "tenis", "mint"],
  ["camisa-1", "camisa", "blue"],
  ["camisa-2", "camisa", "mint"],
  ["camisa-3", "camisa", "sand"],
  ["camisa-4", "camisa", "slate"],
  ["shorts-1", "shorts", "slate"],
  ["shorts-2", "shorts", "blue"],
  ["bola-1", "bola", "mint"],
  ["bola-2", "bola", "sand"],
  ["mochila-1", "mochila", "blue"],
  ["mochila-2", "mochila", "slate"],
  ["acessorio-1", "acessorio", "sand"],
  ["acessorio-2", "acessorio", "blue"],
  ["acessorio-3", "acessorio", "mint"],
];

for (const [name, shape, palette] of files) {
  const [bg1, bg2, ink, tone] = PALETTES[palette];
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img">' +
    "<defs>" +
    '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="' +
    bg1 +
    '"/><stop offset="1" stop-color="' +
    bg2 +
    '"/>' +
    "</linearGradient>" +
    '<radialGradient id="glow" cx=".5" cy=".38" r=".62">' +
    '<stop offset="0" stop-color="#ffffff" stop-opacity=".85"/>' +
    '<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>' +
    "</radialGradient>" +
    "</defs>" +
    '<rect width="800" height="800" fill="url(#bg)"/>' +
    '<rect width="800" height="800" fill="url(#glow)"/>' +
    '<ellipse cx="400" cy="686" rx="230" ry="34" fill="' +
    ink +
    '" opacity=".1"/>' +
    shapes[shape](ink, tone) +
    "</svg>";
  writeFileSync(join(OUT, name + ".svg"), svg, "utf8");
}

// Placeholder do produto sem imagem cadastrada
writeFileSync(
  join(process.cwd(), "public", "brand", "placeholder.svg"),
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img">' +
    '<rect width="800" height="800" fill="#eef2f7"/>' +
    '<g fill="none" stroke="#94a3b8" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="230" y="250" width="340" height="270" rx="24"/>' +
    '<path d="M230 440 l96 -96 l86 86 l64 -64 l94 94"/>' +
    '<circle cx="342" cy="330" r="26"/>' +
    "</g>" +
    '<text x="400" y="596" text-anchor="middle" font-family="system-ui, sans-serif" font-size="34" fill="#64748b">Sem imagem</text>' +
    "</svg>",
  "utf8",
);

console.log("Geradas " + (files.length + 1) + " imagens em public/mock e public/brand.");
