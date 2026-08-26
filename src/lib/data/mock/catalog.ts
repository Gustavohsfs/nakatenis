import type {
  AboutPage,
  Category,
  Product,
  ProductImage,
  ProductSpec,
} from "@/lib/data/types";

/**
 * Catálogo de desenvolvimento. Espelhado por prisma/seed.ts.
 * Casos-limite deliberados (exigidos pela Fase 1 do brief):
 *  - 9 produtos com `compareAtPrice` (exercitam o badge de desconto)
 *  - 1 produto sem imagem  → "raqueteira-termica-6-raquetes"
 *  - 1 produto inativo     → "camiseta-dry-fit-classic-branca"
 *  - 1 descrição longa     → "raquete-beach-tennis-pro-carbon-340"
 *  - 1 fora de estoque     → "bola-tenis-championship-tubo-3"
 */

const DEFAULT_PAYMENT_INFO =
  "Cartão em até 12x sem juros ou à vista no Pix.\nRetirada na loja em Santa Fé do Sul ou envio para todo o Brasil — frete combinado pelo WhatsApp.";

export const mockCategories: Category[] = [
  {
    id: "cat_raquetes",
    name: "Raquetes",
    slug: "raquetes",
    description:
      "Raquetes de tênis e de beach tennis em fibra de carbono, fibra de vidro e composições híbridas, de 290g a 340g.",
    icon: "racket",
    position: 0,
    isActive: true,
  },
  {
    id: "cat_calcados",
    name: "Calçados",
    slug: "calcados",
    description:
      "Tênis de quadra rápida, saibro e areia, com solado específico para cada piso. Numeração 34 ao 44.",
    icon: "shoe",
    position: 1,
    isActive: true,
  },
  {
    id: "cat_roupas",
    name: "Roupas",
    slug: "roupas",
    description:
      "Camisetas dry-fit, shorts com bolso de bola, saias e vestidos de jogo. Tamanhos P ao GG.",
    icon: "shirt",
    position: 2,
    isActive: true,
  },
  {
    id: "cat_acessorios",
    name: "Acessórios",
    slug: "acessorios",
    description:
      "Bolas, overgrips, antivibradores, cordas, raqueteiras, mochilas e tudo o que cabe na bolsa de jogo.",
    icon: "bag",
    position: 3,
    isActive: true,
  },
];

type RawProduct = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  paymentInfo?: string;
  brand?: string | null;
  sku?: string | null;
  stock?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  categoryId: string;
  images?: string[];
  specs?: ProductSpec[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  daysAgo?: number;
};

const LONG_DESCRIPTION = `A Pro Carbon 340 é a raquete de beach tennis para quem já passou da fase de aprender o golpe e agora quer controlar o ponto. A face é de fibra de carbono 12K em três camadas, com núcleo de EVA soft de 22 mm — a combinação que entrega rebote curto e previsível, sem a vibração seca das raquetes 100% rígidas.

O formato híbrido amplia o ponto doce em direção à parte superior da face, onde a maioria das smashes acontece. O balanço é levemente cabeça-pesada (325 mm), o que ajuda quem gosta de finalizar de rede e ainda mantém a raquete manobrável no voleio de reflexo.

A superfície recebe tratamento rugoso aplicado em duas demãos, com granulação média. Ele segura o giro da bola nos slices e nos efeitos laterais, e resiste bem ao atrito da areia — a rugosidade continua perceptível depois de uma temporada inteira de jogo em quadra pública.

**Para quem é:** jogador de nível intermediário a avançado, que já define o próprio posicionamento em quadra e busca uma raquete de controle.

**Para quem não é:** iniciante. O núcleo mais firme exige tempo de bola e punho firme; quem está começando aproveita mais uma raquete de fibra de vidro, com face mais macia e mais perdão nos golpes descentralizados.

Cada raquete sai da caixa com capa térmica acolchoada e um par de antivibradores. A garantia de 6 meses cobre delaminação e defeito de fabricação — não cobre trinca por impacto no solo, que é o jeito mais comum de aposentar uma raquete de beach tennis antes da hora.`;

const rawProducts: RawProduct[] = [
  // ─── Raquetes ───────────────────────────────────────────────────────────────
  {
    id: "prd_001",
    title: "Raquete Beach Tennis Pro Carbon 340",
    slug: "raquete-beach-tennis-pro-carbon-340",
    shortDescription:
      "Fibra de carbono 12K, núcleo EVA soft 22 mm, 340 g, formato híbrido. Controle para jogo avançado.",
    description: LONG_DESCRIPTION,
    price: 28990,
    compareAtPrice: 59900,
    brand: "NakaPro",
    sku: "NKP-BT-340",
    stock: 12,
    isFeatured: true,
    categoryId: "cat_raquetes",
    images: ["raquete-beach-1", "raquete-beach-2", "raquete-beach-3"],
    specs: [
      { label: "Modalidade", value: "Beach tennis" },
      { label: "Material da face", value: "Fibra de carbono 12K (3 camadas)" },
      { label: "Núcleo", value: "EVA soft 22 mm" },
      { label: "Peso", value: "340 g" },
      { label: "Formato", value: "Híbrido" },
      { label: "Balanço", value: "325 mm (cabeça-pesada)" },
      { label: "Nível", value: "Intermediário / avançado" },
      { label: "Acompanha", value: "Capa térmica + 2 antivibradores" },
    ],
    metaTitle: "Raquete Beach Tennis Pro Carbon 340 — carbono 12K",
    metaDescription:
      "Raquete de beach tennis em fibra de carbono 12K, 340 g, núcleo EVA soft 22 mm e formato híbrido. Controle para jogo intermediário e avançado.",
    daysAgo: 3,
  },
  {
    id: "prd_002",
    title: "Raquete Beach Tennis Fiber Start 320",
    slug: "raquete-beach-tennis-fiber-start-320",
    shortDescription:
      "Fibra de vidro, núcleo EVA 22 mm, 320 g. Face macia e tolerante — a escolha certa para começar.",
    description:
      "Raquete de beach tennis em fibra de vidro com núcleo de EVA de 22 mm, pensada para quem está nos primeiros meses de jogo. A face mais flexível devolve a bola com mais facilidade e perdoa golpes fora do centro, reduzindo o esforço no braço.\n\nFormato oval, ponto doce centralizado e amplo. Peso de 320 g bem distribuído, com balanço neutro (320 mm) para facilitar o voleio.\n\nSuperfície rugosa de granulação fina, suficiente para o efeito básico sem exigir técnica avançada. Acompanha capa simples.",
    price: 19990,
    compareAtPrice: 32900,
    brand: "NakaPro",
    sku: "NKP-BT-320",
    stock: 25,
    isFeatured: true,
    categoryId: "cat_raquetes",
    images: ["raquete-beach-2", "raquete-beach-4"],
    specs: [
      { label: "Modalidade", value: "Beach tennis" },
      { label: "Material da face", value: "Fibra de vidro" },
      { label: "Núcleo", value: "EVA 22 mm" },
      { label: "Peso", value: "320 g" },
      { label: "Formato", value: "Oval" },
      { label: "Nível", value: "Iniciante" },
    ],
    daysAgo: 10,
  },
  {
    id: "prd_003",
    title: "Raquete Beach Tennis Elite Carbon 3K 335",
    slug: "raquete-beach-tennis-elite-carbon-3k-335",
    shortDescription:
      "Carbono 3K com moldura reforçada, 335 g, formato diamante. Potência para quem ataca de rede.",
    description:
      "Raquete de beach tennis com face de fibra de carbono 3K e moldura reforçada em toda a borda superior — a região que mais sofre em quedas na areia.\n\nO formato diamante desloca o ponto doce para o topo da face, favorecendo o smash e o ataque de rede. O balanço de 330 mm entrega peso na cabeça, o que soma potência mas exige punho preparado.\n\nRugosidade média-alta aplicada em três demãos, com boa retenção de efeito. Acompanha capa térmica.",
    price: 89900,
    brand: "Court Line",
    sku: "CTL-BT-335",
    stock: 6,
    categoryId: "cat_raquetes",
    images: ["raquete-beach-3", "raquete-beach-1"],
    specs: [
      { label: "Modalidade", value: "Beach tennis" },
      { label: "Material da face", value: "Fibra de carbono 3K" },
      { label: "Peso", value: "335 g" },
      { label: "Formato", value: "Diamante" },
      { label: "Balanço", value: "330 mm" },
      { label: "Nível", value: "Avançado" },
    ],
    daysAgo: 21,
  },
  {
    id: "prd_004",
    title: "Raquete de Tênis Court Power 300 Grafite",
    slug: "raquete-tenis-court-power-300-grafite",
    shortDescription:
      "Grafite, 300 g, cabeça 100 pol², padrão 16x19. Equilíbrio entre potência e controle.",
    description:
      "Raquete de tênis em grafite com cabeça de 100 polegadas quadradas e encordoamento no padrão 16x19 — a configuração mais usada por jogadores de nível intermediário porque combina janela de erro generosa com boa saída de efeito.\n\nPeso de 300 g não encordoada, balanço 320 mm. Cabo em couro sintético perfurado, empunhadura L2/L3 conforme o estoque.\n\nSai da loja já encordoada com monofilamento de 1,25 mm a 24 kg, sem custo adicional. Consulte outras tensões pelo WhatsApp.",
    price: 74900,
    compareAtPrice: 99900,
    brand: "Court Line",
    sku: "CTL-TN-300",
    stock: 9,
    isFeatured: true,
    categoryId: "cat_raquetes",
    images: ["raquete-tenis-1", "raquete-tenis-2"],
    specs: [
      { label: "Modalidade", value: "Tênis" },
      { label: "Material", value: "Grafite" },
      { label: "Peso", value: "300 g (sem corda)" },
      { label: "Cabeça", value: "100 pol²" },
      { label: "Padrão de corda", value: "16x19" },
      { label: "Empunhadura", value: "L2 / L3" },
      { label: "Encordoamento", value: "Incluso — monofilamento 1,25 mm a 24 kg" },
    ],
    daysAgo: 6,
  },
  {
    id: "prd_005",
    title: "Raquete de Tênis Junior 25 Alumínio",
    slug: "raquete-tenis-junior-25-aluminio",
    shortDescription:
      "Alumínio, 240 g, 25 polegadas. Para crianças de 8 a 10 anos, com cabo emborrachado.",
    description:
      "Raquete de tênis infantil de 25 polegadas em alumínio, indicada para crianças de 8 a 10 anos (altura entre 1,25 m e 1,40 m). Leve, com 240 g, para não sobrecarregar o ombro em treino longo.\n\nCabo emborrachado antiderrapante e cabeça de 105 pol², que amplia a área de acerto e acelera o aprendizado. Já sai encordoada de fábrica.",
    price: 21900,
    brand: "NakaPro",
    sku: "NKP-TN-J25",
    stock: 14,
    categoryId: "cat_raquetes",
    images: ["raquete-tenis-3"],
    specs: [
      { label: "Modalidade", value: "Tênis infantil" },
      { label: "Material", value: "Alumínio" },
      { label: "Comprimento", value: "25 polegadas" },
      { label: "Peso", value: "240 g" },
      { label: "Idade indicada", value: "8 a 10 anos" },
    ],
    daysAgo: 33,
  },
  {
    id: "prd_006",
    title: "Raquete de Tênis Spin Master 305 Carbono",
    slug: "raquete-tenis-spin-master-305-carbono",
    shortDescription:
      "Carbono, 305 g, padrão aberto 16x18 e cabeça 98 pol². Feita para quem joga de efeito.",
    description:
      "Raquete de tênis com estrutura em carbono e padrão de corda aberto 16x18, desenhado para maximizar o giro da bola. A cabeça de 98 pol² dá controle na hora de fechar o ponto na linha.\n\nPeso de 305 g e balanço 315 mm — equilibrada na mão, sem a inércia das raquetes cabeça-pesadas. Perfil de aro de 22 mm, mais fino, que privilegia sensação de bola a potência bruta.\n\nIndicada para jogador que já tem swing completo e busca margem por cima da rede.",
    price: 109900,
    compareAtPrice: 139900,
    brand: "Court Line",
    sku: "CTL-TN-305",
    stock: 4,
    categoryId: "cat_raquetes",
    images: ["raquete-tenis-2", "raquete-tenis-1", "raquete-tenis-3"],
    specs: [
      { label: "Modalidade", value: "Tênis" },
      { label: "Material", value: "Carbono" },
      { label: "Peso", value: "305 g (sem corda)" },
      { label: "Cabeça", value: "98 pol²" },
      { label: "Padrão de corda", value: "16x18 (aberto)" },
      { label: "Perfil do aro", value: "22 mm" },
    ],
    daysAgo: 14,
  },

  // ─── Calçados ───────────────────────────────────────────────────────────────
  {
    id: "prd_007",
    title: "Tênis Court Speed Quadra Rápida",
    slug: "tenis-court-speed-quadra-rapida",
    shortDescription:
      "Solado de borracha herringbone para quadra rápida, cabedal em mesh, reforço lateral. Nº 37 ao 44.",
    description:
      "Tênis de quadra rápida com solado de borracha em desenho herringbone, que segura a frenagem lateral sem travar o pé no deslizamento curto.\n\nCabedal em mesh respirável com reforço termoplástico na lateral externa — a área que se rasga primeiro em quem arrasta o pé no forehand aberto. Entressola em EVA de dupla densidade, mais firme no calcanhar.\n\nDisponível do 37 ao 44. Informe a numeração no WhatsApp ao fechar o pedido.",
    price: 45990,
    compareAtPrice: 62900,
    brand: "Court Line",
    sku: "CTL-SH-SPEED",
    stock: 18,
    isFeatured: true,
    categoryId: "cat_calcados",
    images: ["tenis-1", "tenis-2"],
    specs: [
      { label: "Piso", value: "Quadra rápida" },
      { label: "Solado", value: "Borracha herringbone" },
      { label: "Cabedal", value: "Mesh com reforço termoplástico" },
      { label: "Entressola", value: "EVA dupla densidade" },
      { label: "Numeração", value: "37 ao 44" },
      { label: "Garantia do solado", value: "6 meses" },
    ],
    daysAgo: 5,
  },
  {
    id: "prd_008",
    title: "Tênis Clay Grip Saibro",
    slug: "tenis-clay-grip-saibro",
    shortDescription:
      "Solado full herringbone fechado para saibro, com barreira antiterra na gáspea. Nº 36 ao 43.",
    description:
      "Tênis específico para saibro, com solado full herringbone de canais fechados — o desenho que solta a terra a cada passada em vez de acumular no vão.\n\nA gáspea recebe uma barreira em material sintético que impede a entrada de saibro pela costura frontal, ponto onde o pé fica sujo mais rápido nos modelos genéricos.\n\nEntressola com amortecimento em gel na região do calcanhar. Numeração do 36 ao 43.",
    price: 51990,
    brand: "Court Line",
    sku: "CTL-SH-CLAY",
    stock: 7,
    categoryId: "cat_calcados",
    images: ["tenis-2", "tenis-3"],
    specs: [
      { label: "Piso", value: "Saibro" },
      { label: "Solado", value: "Full herringbone fechado" },
      { label: "Amortecimento", value: "Gel no calcanhar" },
      { label: "Numeração", value: "36 ao 43" },
    ],
    daysAgo: 19,
  },
  {
    id: "prd_009",
    title: "Tênis Beach Sand Areia Ultraleve",
    slug: "tenis-beach-sand-areia-ultraleve",
    shortDescription:
      "215 g, malha drenante e solado flexível. Feito para jogar beach tennis sem pé descalço.",
    description:
      "Calçado ultraleve de 215 g para beach tennis, com cabedal em malha drenante que expulsa a areia e a água em vez de retê-las.\n\nSolado flexível de 6 mm, fino o suficiente para manter a sensibilidade na areia e ainda proteger a planta do pé de conchas e pedras em quadra pública.\n\nFecho em cordão elástico com trava, para calçar e descalçar rápido entre os jogos. Numeração 34 ao 44.",
    price: 26990,
    compareAtPrice: 34990,
    brand: "NakaPro",
    sku: "NKP-SH-SAND",
    stock: 22,
    isFeatured: true,
    categoryId: "cat_calcados",
    images: ["tenis-3", "tenis-4"],
    specs: [
      { label: "Modalidade", value: "Beach tennis" },
      { label: "Peso", value: "215 g (par nº 40)" },
      { label: "Cabedal", value: "Malha drenante" },
      { label: "Solado", value: "Borracha flexível 6 mm" },
      { label: "Fecho", value: "Cordão elástico com trava" },
      { label: "Numeração", value: "34 ao 44" },
    ],
    daysAgo: 8,
  },
  {
    id: "prd_010",
    title: "Tênis All Court Pro Estabilidade",
    slug: "tenis-all-court-pro-estabilidade",
    shortDescription:
      "Solado misto all court, contraforte rígido e cabedal em couro sintético. Nº 38 ao 44.",
    description:
      "Tênis all court, para quem alterna entre quadra rápida e saibro sem querer manter dois pares. O solado combina herringbone no antepé com blocos de borracha no calcanhar.\n\nContraforte rígido e cadarço em teia cruzada seguram o retropé no giro, reduzindo o risco de torção. Cabedal em couro sintético, mais durável que o mesh — em troca de um pouco de ventilação.\n\nModelo mais pesado da linha, 380 g, indicado para jogador de base firme.",
    price: 58990,
    brand: "Ace Court",
    sku: "ACE-SH-ALL",
    stock: 3,
    categoryId: "cat_calcados",
    images: ["tenis-4", "tenis-1"],
    specs: [
      { label: "Piso", value: "All court" },
      { label: "Peso", value: "380 g (par nº 40)" },
      { label: "Cabedal", value: "Couro sintético" },
      { label: "Numeração", value: "38 ao 44" },
    ],
    daysAgo: 27,
  },
  {
    id: "prd_011",
    title: "Meia Esportiva Cano Médio — Kit com 3 pares",
    slug: "meia-esportiva-cano-medio-kit-3-pares",
    shortDescription:
      "Algodão com poliamida, palmilha acolchoada e canaleta de ventilação. Kit com 3 pares, 38 ao 43.",
    description:
      "Kit com três pares de meia esportiva de cano médio, em algodão com poliamida e elastano. Palmilha acolchoada na região do antepé e do calcanhar, onde o atrito é maior no jogo de quadra.\n\nCanaleta de ventilação no peito do pé e faixa elástica de sustentação no arco. Tamanho único 38 ao 43.",
    price: 5990,
    compareAtPrice: 8990,
    brand: "NakaPro",
    sku: "NKP-AC-MEIA3",
    stock: 40,
    categoryId: "cat_calcados",
    images: ["acessorio-1"],
    specs: [
      { label: "Composição", value: "Algodão, poliamida e elastano" },
      { label: "Cano", value: "Médio" },
      { label: "Conteúdo", value: "3 pares" },
      { label: "Tamanho", value: "38 ao 43" },
    ],
    daysAgo: 40,
  },

  // ─── Roupas ─────────────────────────────────────────────────────────────────
  {
    id: "prd_012",
    title: "Camiseta Dry-Fit Match Azul",
    slug: "camiseta-dry-fit-match-azul",
    shortDescription:
      "Poliéster dry-fit com proteção UV 50+, corte atlético e costura raglan. Tamanhos P ao GG.",
    description:
      "Camiseta de jogo em poliéster dry-fit de 130 g/m², com tecnologia de secagem rápida e proteção solar UV 50+.\n\nCorte atlético com costura raglan no ombro, que libera a amplitude do saque sem repuxar o tecido. Painéis em malha aberta nas laterais e nas costas.\n\nTamanhos P, M, G e GG. Informe o tamanho no WhatsApp ao fechar o pedido.",
    price: 8990,
    compareAtPrice: 12990,
    brand: "NakaPro",
    sku: "NKP-AP-TEE-AZ",
    stock: 30,
    isFeatured: true,
    categoryId: "cat_roupas",
    images: ["camisa-1", "camisa-2"],
    specs: [
      { label: "Composição", value: "100% poliéster dry-fit 130 g/m²" },
      { label: "Proteção solar", value: "UV 50+" },
      { label: "Corte", value: "Atlético, costura raglan" },
      { label: "Tamanhos", value: "P, M, G, GG" },
    ],
    daysAgo: 4,
  },
  {
    id: "prd_013",
    title: "Camiseta Dry-Fit Classic Branca",
    slug: "camiseta-dry-fit-classic-branca",
    shortDescription:
      "Modelo clássico em dry-fit branco, gola redonda. Coleção anterior — fora de linha.",
    description:
      "Camiseta clássica em poliéster dry-fit branco, gola redonda e corte reto. Peça da coleção anterior, mantida no catálogo apenas para consulta de tamanho.\n\nPara disponibilidade de peças remanescentes, fale com a loja pelo WhatsApp.",
    price: 6990,
    brand: "NakaPro",
    sku: "NKP-AP-TEE-BR",
    stock: 0,
    isActive: false,
    categoryId: "cat_roupas",
    images: ["camisa-4"],
    specs: [
      { label: "Composição", value: "100% poliéster dry-fit" },
      { label: "Gola", value: "Redonda" },
      { label: "Tamanhos", value: "P, M, G" },
    ],
    daysAgo: 180,
  },
  {
    id: "prd_014",
    title: "Camiseta Beach Tennis Sunset Feminina",
    slug: "camiseta-beach-tennis-sunset-feminina",
    shortDescription:
      "Cropped em poliamida com elastano, UV 50+ e cós elástico. Tamanhos P ao GG.",
    description:
      "Camiseta cropped de beach tennis em poliamida com elastano, tecido leve e de secagem rápida com proteção UV 50+.\n\nCós elástico embutido na barra, que impede a peça de subir no smash. Manga curta com recorte na cava para liberar o ombro.\n\nTamanhos P, M, G e GG.",
    price: 10990,
    compareAtPrice: 14990,
    brand: "Sunset Beach",
    sku: "SNS-AP-CROP",
    stock: 16,
    categoryId: "cat_roupas",
    images: ["camisa-3", "camisa-1"],
    specs: [
      { label: "Composição", value: "Poliamida com elastano" },
      { label: "Proteção solar", value: "UV 50+" },
      { label: "Modelagem", value: "Cropped com cós elástico" },
      { label: "Tamanhos", value: "P, M, G, GG" },
    ],
    daysAgo: 12,
  },
  {
    id: "prd_015",
    title: "Shorts de Jogo com Bolso de Bola",
    slug: "shorts-de-jogo-com-bolso-de-bola",
    shortDescription:
      "Poliéster leve com bolso lateral fundo para bola, cós com cordão. Tamanhos P ao GG.",
    description:
      "Shorts de jogo em poliéster leve, com dois bolsos laterais fundos dimensionados para carregar a bola durante o saque — o bolso raso do shorts genérico deixa a bola cair no meio do ponto.\n\nCós com elástico interno e cordão de ajuste. Fenda lateral de 5 cm na barra para não limitar a passada.\n\nTamanhos P, M, G e GG.",
    price: 9990,
    brand: "NakaPro",
    sku: "NKP-AP-SHORT",
    stock: 24,
    categoryId: "cat_roupas",
    images: ["shorts-1", "shorts-2"],
    specs: [
      { label: "Composição", value: "100% poliéster" },
      { label: "Bolsos", value: "2 laterais fundos, para bola" },
      { label: "Cós", value: "Elástico com cordão" },
      { label: "Tamanhos", value: "P, M, G, GG" },
    ],
    daysAgo: 16,
  },
  {
    id: "prd_016",
    title: "Shorts Beach Tennis Quick Dry",
    slug: "shorts-beach-tennis-quick-dry",
    shortDescription:
      "Tecido de secagem rápida, sem forro, com cordão externo. Não retém areia. P ao GG.",
    description:
      "Shorts de beach tennis em tecido de secagem rápida, sem forro interno — o forro é justamente onde a areia se acumula e incomoda depois do primeiro set.\n\nCordão externo, bolso traseiro com zíper impermeável e barra na altura do meio da coxa. Tamanhos P ao GG.",
    price: 7990,
    compareAtPrice: 10990,
    brand: "Sunset Beach",
    sku: "SNS-AP-SHORT",
    stock: 19,
    categoryId: "cat_roupas",
    images: ["shorts-2", "shorts-1"],
    specs: [
      { label: "Composição", value: "Poliéster de secagem rápida" },
      { label: "Forro", value: "Sem forro" },
      { label: "Bolso", value: "Traseiro com zíper impermeável" },
      { label: "Tamanhos", value: "P, M, G, GG" },
    ],
    daysAgo: 9,
  },
  {
    id: "prd_017",
    title: "Vestido de Tênis Court Line com Short Interno",
    slug: "vestido-de-tenis-court-line-com-short-interno",
    shortDescription:
      "Vestido em poliamida com short interno de bolso duplo e sutiã embutido. Tamanhos P ao GG.",
    description:
      "Vestido de tênis em poliamida com elastano, com short interno de bolso duplo — cabe uma bola de cada lado — e sutiã esportivo embutido com bojo removível.\n\nSaia com pregas e caimento acima do joelho. Costas em nadador, com recorte em malha respirável.\n\nTamanhos P, M, G e GG.",
    price: 18990,
    brand: "Court Line",
    sku: "CTL-AP-DRESS",
    stock: 8,
    categoryId: "cat_roupas",
    images: ["camisa-2", "camisa-3"],
    specs: [
      { label: "Composição", value: "Poliamida com elastano" },
      { label: "Short interno", value: "Sim, com bolso duplo" },
      { label: "Sutiã", value: "Embutido, bojo removível" },
      { label: "Tamanhos", value: "P, M, G, GG" },
    ],
    daysAgo: 23,
  },
  {
    id: "prd_018",
    title: "Jaqueta Corta-Vento Court Windbreaker",
    slug: "jaqueta-corta-vento-court-windbreaker",
    shortDescription:
      "Nylon ripstop resistente à água, capuz recolhível e punhos elásticos. Tamanhos P ao GG.",
    description:
      "Corta-vento em nylon ripstop com acabamento repelente à água, para aquecimento e jogo em dia frio. Capuz recolhível na gola e punhos com elástico.\n\nZíper frontal com aba antivento e dois bolsos laterais com zíper. Ventilação nas costas, sob o cavalete. Tamanhos P ao GG.",
    price: 22990,
    compareAtPrice: 29990,
    brand: "Court Line",
    sku: "CTL-AP-WIND",
    stock: 11,
    categoryId: "cat_roupas",
    images: ["camisa-4", "camisa-1"],
    specs: [
      { label: "Material", value: "Nylon ripstop repelente à água" },
      { label: "Capuz", value: "Recolhível na gola" },
      { label: "Bolsos", value: "2 laterais com zíper" },
      { label: "Tamanhos", value: "P, M, G, GG" },
    ],
    daysAgo: 30,
  },

  // ─── Acessórios ─────────────────────────────────────────────────────────────
  {
    id: "prd_019",
    title: "Bola de Beach Tennis Soft — Pack com 3",
    slug: "bola-de-beach-tennis-soft-pack-com-3",
    shortDescription:
      "Bola de pressão reduzida (estágio 2), feltro resistente à areia. Pack com 3 unidades.",
    description:
      "Pack com três bolas de beach tennis de pressão reduzida (estágio 2), padrão oficial da modalidade. Pressão menor que a bola de tênis, o que reduz o quique na areia e alonga a troca de bolas.\n\nFeltro de alta densidade, tratado contra abrasão da areia. Embalagem em saco selado, sem pressurização — a bola de beach tennis não perde pressão como a de tênis.",
    price: 5990,
    brand: "NakaPro",
    sku: "NKP-AC-BOLA3",
    stock: 55,
    isFeatured: true,
    categoryId: "cat_acessorios",
    images: ["bola-1", "bola-2"],
    specs: [
      { label: "Modalidade", value: "Beach tennis" },
      { label: "Pressão", value: "Estágio 2 (reduzida)" },
      { label: "Conteúdo", value: "3 unidades" },
      { label: "Feltro", value: "Alta densidade, antiabrasão" },
    ],
    daysAgo: 2,
  },
  {
    id: "prd_020",
    title: "Bola de Tênis Championship — Tubo com 3",
    slug: "bola-tenis-championship-tubo-3",
    shortDescription:
      "Tubo pressurizado com 3 bolas de feltro premium, para quadra rápida e saibro.",
    description:
      "Tubo pressurizado com três bolas de tênis de feltro premium, homologadas para treino e torneio amador. Núcleo de borracha natural e costura sem emenda aparente.\n\nIndicadas para quadra rápida e saibro. Uma vez aberto, o tubo perde pressão em poucos dias — compre a quantidade que vai usar na semana.",
    price: 4990,
    compareAtPrice: 6990,
    brand: "Ace Court",
    sku: "ACE-AC-TUBO3",
    stock: 0,
    categoryId: "cat_acessorios",
    images: ["bola-2", "bola-1"],
    specs: [
      { label: "Modalidade", value: "Tênis" },
      { label: "Conteúdo", value: "3 unidades" },
      { label: "Embalagem", value: "Tubo pressurizado" },
      { label: "Piso", value: "Quadra rápida e saibro" },
    ],
    daysAgo: 11,
  },
  {
    id: "prd_021",
    title: "Overgrip Perfurado — Kit com 6 unidades",
    slug: "overgrip-perfurado-kit-6-unidades",
    shortDescription:
      "Poliuretano perfurado de 0,6 mm, alta absorção. Kit com 6 unidades, cores sortidas.",
    description:
      "Kit com seis overgrips em poliuretano perfurado de 0,6 mm de espessura. A perfuração aumenta a absorção do suor e mantém a aderência no fim do set.\n\nSuperfície levemente adesiva, que não escorrega mesmo com a mão molhada. Acompanha fita de acabamento em cada unidade. Cores sortidas conforme o estoque.",
    price: 4490,
    compareAtPrice: 6990,
    brand: "NakaPro",
    sku: "NKP-AC-GRIP6",
    stock: 60,
    isFeatured: true,
    categoryId: "cat_acessorios",
    images: ["acessorio-2", "acessorio-1"],
    specs: [
      { label: "Material", value: "Poliuretano perfurado" },
      { label: "Espessura", value: "0,6 mm" },
      { label: "Conteúdo", value: "6 unidades" },
      { label: "Cores", value: "Sortidas" },
    ],
    daysAgo: 7,
  },
  {
    id: "prd_022",
    title: "Corda de Tênis Monofilamento 1,25 mm — 12 m",
    slug: "corda-tenis-monofilamento-125mm-12m",
    shortDescription:
      "Poliéster monofilamento 1,25 mm, set de 12 m para uma raquete. Controle e durabilidade.",
    description:
      "Set de 12 metros de corda de tênis em poliéster monofilamento de 1,25 mm — o suficiente para encordoar uma raquete.\n\nMaterial de baixa elasticidade, que entrega controle e resiste bem ao atrito de quem joga muito efeito. Em troca, exige tensão mais baixa (22 a 24 kg) para não sobrecarregar o braço.\n\nServiço de encordoamento disponível na loja. Consulte pelo WhatsApp.",
    price: 3990,
    brand: "Ace Court",
    sku: "ACE-AC-CORDA",
    stock: 35,
    categoryId: "cat_acessorios",
    images: ["acessorio-3"],
    specs: [
      { label: "Material", value: "Poliéster monofilamento" },
      { label: "Bitola", value: "1,25 mm" },
      { label: "Comprimento", value: "12 m (1 raquete)" },
      { label: "Tensão indicada", value: "22 a 24 kg" },
    ],
    daysAgo: 26,
  },
  {
    id: "prd_023",
    title: "Antivibrador Silicone — Par",
    slug: "antivibrador-silicone-par",
    shortDescription:
      "Par de antivibradores em silicone macio, encaixe universal. Reduz a vibração no cotovelo.",
    description:
      "Par de antivibradores em silicone macio, com encaixe universal entre as cordas verticais. Reduzem a vibração residual do impacto — o que alivia o cotovelo em sessões longas.\n\nO antivibrador não altera a potência nem o controle da raquete: ele age no som e na vibração que chega ao braço.",
    price: 1990,
    brand: "NakaPro",
    sku: "NKP-AC-ANTIV",
    stock: 48,
    categoryId: "cat_acessorios",
    images: ["acessorio-1", "acessorio-3"],
    specs: [
      { label: "Material", value: "Silicone macio" },
      { label: "Conteúdo", value: "2 unidades" },
      { label: "Encaixe", value: "Universal" },
    ],
    daysAgo: 45,
  },
  {
    id: "prd_024",
    title: "Mochila Esportiva Court Bag 32 L",
    slug: "mochila-esportiva-court-bag-32l",
    shortDescription:
      "32 L, compartimento térmico para 2 raquetes, bolso de calçado ventilado e alças acolchoadas.",
    description:
      "Mochila de 32 litros em poliéster 600D, com compartimento térmico forrado para duas raquetes — a forração reduz a variação de temperatura que resseca a corda dentro do carro.\n\nBolso lateral ventilado para o calçado, bolso frontal organizador para bolas e overgrips, e bolso superior forrado em veludo para óculos e celular.\n\nAlças e painel dorsal acolchoados, com tira peitoral. Base reforçada e impermeável.",
    price: 24990,
    compareAtPrice: 32990,
    brand: "Court Line",
    sku: "CTL-AC-BAG32",
    stock: 13,
    isFeatured: true,
    categoryId: "cat_acessorios",
    images: ["mochila-1", "mochila-2"],
    specs: [
      { label: "Capacidade", value: "32 L" },
      { label: "Material", value: "Poliéster 600D" },
      { label: "Raquetes", value: "Até 2, em compartimento térmico" },
      { label: "Bolso de calçado", value: "Sim, ventilado" },
    ],
    daysAgo: 13,
  },
  {
    id: "prd_025",
    title: "Raqueteira Térmica para 6 Raquetes",
    slug: "raqueteira-termica-6-raquetes",
    shortDescription:
      "Raqueteira com dois compartimentos térmicos para até 6 raquetes. Foto do produto em breve.",
    description:
      "Raqueteira profissional com dois compartimentos térmicos independentes, com espaço para até seis raquetes de tênis.\n\nBolso de calçado isolado, bolso organizador com chaveiro e alças conversíveis (mão, ombro ou mochila).\n\nProduto recém-chegado — as fotos estão sendo produzidas. Peça detalhes e imagens reais pelo WhatsApp.",
    price: 39990,
    brand: "Ace Court",
    sku: "ACE-AC-BAG6",
    stock: 5,
    categoryId: "cat_acessorios",
    images: [],
    specs: [
      { label: "Capacidade", value: "Até 6 raquetes" },
      { label: "Compartimentos térmicos", value: "2 independentes" },
      { label: "Alças", value: "Mão, ombro ou mochila" },
    ],
    daysAgo: 1,
  },
];

function buildImages(productId: string, names: string[]): ProductImage[] {
  return names.map((name, index) => ({
    id: `${productId}_img_${index + 1}`,
    url: `/mock/${name}.svg`,
    publicId: `mock/${name}`,
    alt: null,
    width: 800,
    height: 800,
    position: index,
  }));
}

const now = Date.UTC(2026, 7, 20, 12, 0, 0);

function daysAgoIso(days: number) {
  return new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
}

export const mockProducts: Product[] = rawProducts.map((raw) => {
  const category = mockCategories.find((c) => c.id === raw.categoryId)!;
  const createdAt = daysAgoIso(raw.daysAgo ?? 30);
  const images = buildImages(raw.id, raw.images ?? []);
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    shortDescription: raw.shortDescription,
    description: raw.description,
    price: raw.price,
    compareAtPrice: raw.compareAtPrice ?? null,
    paymentInfo: raw.paymentInfo ?? DEFAULT_PAYMENT_INFO,
    brand: raw.brand ?? null,
    sku: raw.sku ?? null,
    stock: raw.stock ?? 0,
    isActive: raw.isActive ?? true,
    isFeatured: raw.isFeatured ?? false,
    categoryId: raw.categoryId,
    category: { id: category.id, name: category.name, slug: category.slug },
    images: images.map((image, index) => ({
      ...image,
      alt: `${raw.title} — imagem ${index + 1}`,
    })),
    specs: raw.specs ?? [],
    metaTitle: raw.metaTitle ?? null,
    metaDescription: raw.metaDescription ?? null,
    createdAt,
    updatedAt: createdAt,
  };
});

export const mockAbout: AboutPage = {
  id: "singleton",
  title: "Quem somos",
  content: `A NakaTenis nasceu em 2016, dentro da quadra. O Naka — Flávio Nakamura — jogava tênis desde os doze anos em Santa Fé do Sul e passou a encordoar raquetes dos amigos no fundo de casa para pagar as próprias aulas. Em pouco tempo o fundo de casa não dava mais conta.

Hoje a loja atende jogadores de tênis e de beach tennis das quadras de Santa Fé do Sul e da região. São quase dez anos vendendo raquete, calçado, roupa e acessório para gente que joga de verdade — e isso muda o que entra no estoque: só fica na prateleira o que a gente usaria em quadra.

**O que fazemos bem**

- Indicar a raquete certa para o seu nível, e não a mais cara da vitrine.
- Encordoamento no mesmo dia, com tensão ajustada ao seu jogo.
- Numeração de calçado conferida antes do envio — o número do tênis de quadra costuma calçar diferente do casual.
- Atendimento por WhatsApp com resposta de gente, não de robô.

**Como funciona a compra**

O site é a nossa vitrine. Você monta o carrinho aqui e finaliza a conversa pelo WhatsApp, onde combinamos disponibilidade, tamanho, frete e forma de pagamento. É assim porque a maioria dos itens tem variação de numeração ou tamanho, e a conversa evita a troca depois.

Quem é de Santa Fé do Sul pode retirar na loja. Para o resto do Brasil, enviamos pelos Correios ou por transportadora, com o frete combinado antes de fechar.`,
  images: [
    {
      url: "/mock/raquete-tenis-1.svg",
      publicId: "mock/raquete-tenis-1",
      alt: "Raquete de tênis em destaque na loja",
      caption: "Encordoamento feito na loja, com tensão ajustada ao seu jogo.",
    },
    {
      url: "/mock/raquete-beach-1.svg",
      publicId: "mock/raquete-beach-1",
      alt: "Raquete de beach tennis",
      caption: "Linha de beach tennis renovada a cada temporada.",
    },
    {
      url: "/mock/mochila-1.svg",
      publicId: "mock/mochila-1",
      alt: "Mochila esportiva",
      caption: "Raqueteiras e mochilas testadas em quadra antes de entrar no estoque.",
    },
  ],
  updatedAt: daysAgoIso(15),
};
