export type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string;
};

export type Store = {
  id: string;
  name: string;
  logo: string;
  banner: string;
  description: string;
  categoryId: string;
  whatsapp: string;
  instagram?: string;
  address?: string;
  featured: boolean;
  blocked?: boolean;
};

export type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  description: string;
  categoryId: string;
  storeId: string;
  externalLink?: string;
  whatsapp: string;
  featured: boolean;
  createdAt?: string;
};

export type Service = {
  id: string;
  name: string;
  image: string;
  description: string;
  storeId: string;
  whatsapp: string;
  featured: boolean;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link?: string;
};

/* ============ Prestadores de Serviços ============ */

export type ServiceCategory = {
  id: string;
  slug: string;
  name: string;
  icon: string;
};

export type Provider = {
  id: string;
  name: string;
  photo: string;
  cover: string;
  description: string;
  whatsapp: string;
  phone?: string;
  city?: string;
  serviceArea?: string;
  instagram?: string;
  facebook?: string;
  schedule?: string;
  categoryIds: string[];
  featured: boolean;
  blocked?: boolean;
};

export type ProviderService = {
  id: string;
  providerId: string;
  name: string;
  description: string;
  price?: number;
  image: string;
  categoryId: string;
  duration?: string;
  active: boolean;
  featured: boolean;
};

export type ProviderWork = {
  id: string;
  providerId: string;
  title: string;
  description: string;
  image: string;
  date: string; // ISO yyyy-mm-dd
};

export const seedCategories: Category[] = [
  { id: "c1", slug: "mercado", name: "Mercado", icon: "ShoppingBasket" },
  { id: "c2", slug: "moda", name: "Moda", icon: "Shirt" },
  { id: "c3", slug: "eletronicos", name: "Eletrônicos", icon: "Smartphone" },
  { id: "c4", slug: "beleza", name: "Beleza", icon: "Sparkles" },
  { id: "c5", slug: "casa", name: "Casa", icon: "Sofa" },
  { id: "c6", slug: "ferramentas", name: "Ferramentas", icon: "Wrench" },
  { id: "c7", slug: "servicos", name: "Serviços", icon: "Briefcase" },
  { id: "c8", slug: "restaurantes", name: "Restaurantes", icon: "UtensilsCrossed" },
  { id: "c9", slug: "farmacia", name: "Farmácia", icon: "Pill" },
  { id: "c10", slug: "automotivo", name: "Automotivo", icon: "Car" },
];

export const seedServiceCategories: ServiceCategory[] = [
  { id: "sc1", slug: "personal-trainer", name: "Personal Trainer", icon: "Dumbbell" },
  { id: "sc2", slug: "barbeiro", name: "Barbeiro", icon: "Scissors" },
  { id: "sc3", slug: "cabeleireiro", name: "Cabeleireiro", icon: "Scissors" },
  { id: "sc4", slug: "maquiador", name: "Maquiador(a)", icon: "Brush" },
  { id: "sc5", slug: "manicure", name: "Manicure", icon: "Hand" },
  { id: "sc6", slug: "pedreiro", name: "Pedreiro", icon: "Hammer" },
  { id: "sc7", slug: "eletricista", name: "Eletricista", icon: "Zap" },
  { id: "sc8", slug: "encanador", name: "Encanador", icon: "Droplet" },
  { id: "sc9", slug: "mecanico", name: "Mecânico", icon: "Wrench" },
  { id: "sc10", slug: "fotografo", name: "Fotógrafo", icon: "Camera" },
  { id: "sc11", slug: "designer", name: "Designer", icon: "Palette" },
  { id: "sc12", slug: "professor-particular", name: "Professor Particular", icon: "GraduationCap" },
  { id: "sc13", slug: "advogado", name: "Advogado", icon: "Scale" },
  { id: "sc14", slug: "contador", name: "Contador", icon: "Calculator" },
  { id: "sc15", slug: "servicos-gerais", name: "Serviços Gerais", icon: "Briefcase" },
  { id: "sc16", slug: "outros", name: "Outros", icon: "MoreHorizontal" },
];

const img = (q: string, w = 800, h = 800) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const seedStores: Store[] = [
  {
    id: "s1",
    name: "Mercado Serra Verde",
    logo: img("photo-1542838132-92c53300491e", 200, 200),
    banner: img("photo-1604719312566-8912e9227c6a", 1200, 400),
    description: "Hortifruti, mercearia e produtos frescos todos os dias.",
    categoryId: "c1",
    whatsapp: "https://wa.me/5535999990001",
    instagram: "mercadoserraverde",
    address: "Rua das Flores, 120 - Centro",
    featured: true,
  },
  {
    id: "s2",
    name: "Boutique Aurora",
    logo: img("photo-1441986300917-64674bd600d8", 200, 200),
    banner: img("photo-1483985988355-763728e1935b", 1200, 400),
    description: "Moda feminina com peças exclusivas para todas as ocasiões.",
    categoryId: "c2",
    whatsapp: "https://wa.me/5535999990002",
    instagram: "boutiqueaurora",
    featured: true,
  },
  {
    id: "s3",
    name: "TechZone Eletrônicos",
    logo: img("photo-1518770660439-4636190af475", 200, 200),
    banner: img("photo-1498049794561-7780e7231661", 1200, 400),
    description: "Smartphones, acessórios e assistência técnica especializada.",
    categoryId: "c3",
    whatsapp: "https://wa.me/5535999990003",
    instagram: "techzone",
    address: "Av. Brasil, 500",
    featured: true,
  },
  {
    id: "s4",
    name: "Bella Beauty",
    logo: img("photo-1522335789203-aaa2f6e1ea0a", 200, 200),
    banner: img("photo-1487412947147-5cebf100ffc2", 1200, 400),
    description: "Cosméticos, perfumaria e produtos para cuidados pessoais.",
    categoryId: "c4",
    whatsapp: "https://wa.me/5535999990004",
    featured: false,
  },
  {
    id: "s5",
    name: "Sabor da Serra",
    logo: img("photo-1555396273-367ea4eb4db5", 200, 200),
    banner: img("photo-1517248135467-4c7edcad34c4", 1200, 400),
    description: "Restaurante regional com pratos típicos da serra.",
    categoryId: "c8",
    whatsapp: "https://wa.me/5535999990005",
    instagram: "sabordaserra",
    address: "Praça Central, 45",
    featured: true,
  },
  {
    id: "s6",
    name: "Oficina do Pedro",
    logo: img("photo-1486262715619-67b85e0b08d3", 200, 200),
    banner: img("photo-1487754180451-c456f719a1fc", 1200, 400),
    description: "Mecânica geral, balanceamento e troca de óleo.",
    categoryId: "c10",
    whatsapp: "https://wa.me/5535999990006",
    address: "Rua dos Mecânicos, 88",
    featured: false,
  },
];

export const seedProducts: Product[] = [
  {
    id: "p1",
    name: "Cesta de Frutas Premium",
    image: img("photo-1610832958506-aa56368176cf", 800, 800),
    price: 89.9,
    description: "Cesta com frutas selecionadas da estação. Ideal para presente.",
    categoryId: "c1",
    storeId: "s1",
    whatsapp: "https://wa.me/5535999990001",
    featured: true,
  },
  {
    id: "p2",
    name: "Vestido Floral Verão",
    image: img("photo-1572804013309-59a88b7e92f1", 800, 800),
    price: 159.0,
    description: "Vestido leve, perfeito para os dias quentes. Tecido viscose.",
    categoryId: "c2",
    storeId: "s2",
    whatsapp: "https://wa.me/5535999990002",
    featured: true,
  },
  {
    id: "p3",
    name: "Smartphone 128GB",
    image: img("photo-1511707171634-5f897ff02aa9", 800, 800),
    price: 1899.0,
    description: "Tela 6.5\", câmera dupla 48MP, bateria 5000mAh.",
    categoryId: "c3",
    storeId: "s3",
    whatsapp: "https://wa.me/5535999990003",
    externalLink: "https://example.com",
    featured: true,
  },
  {
    id: "p4",
    name: "Kit Skincare Completo",
    image: img("photo-1556228720-195a672e8a03", 800, 800),
    price: 249.9,
    description: "Limpeza, tônico, sérum e hidratante. Para todos os tipos de pele.",
    categoryId: "c4",
    storeId: "s4",
    whatsapp: "https://wa.me/5535999990004",
    featured: true,
  },
  {
    id: "p5",
    name: "Sofá 3 Lugares Retrátil",
    image: img("photo-1555041469-a586c61ea9bc", 800, 800),
    price: 2499.0,
    description: "Sofá retrátil e reclinável, tecido suede, espuma D33.",
    categoryId: "c5",
    storeId: "s1",
    whatsapp: "https://wa.me/5535999990001",
    featured: false,
  },
  {
    id: "p6",
    name: "Furadeira de Impacto 750W",
    image: img("photo-1581147036324-c47a03a81d48", 800, 800),
    price: 329.9,
    description: "Mandril 13mm, reversível, com maleta e brocas inclusas.",
    categoryId: "c6",
    storeId: "s3",
    whatsapp: "https://wa.me/5535999990003",
    featured: false,
  },
  {
    id: "p7",
    name: "Pizza Artesanal Grande",
    image: img("photo-1565299624946-b28f40a0ae38", 800, 800),
    price: 59.9,
    description: "Massa fina, ingredientes frescos. Diversos sabores.",
    categoryId: "c8",
    storeId: "s5",
    whatsapp: "https://wa.me/5535999990005",
    featured: true,
  },
  {
    id: "p8",
    name: "Troca de Óleo + Filtro",
    image: img("photo-1632823471565-1ecdf5c6f4ce", 800, 800),
    price: 189.0,
    description: "Óleo semissintético + filtro de óleo. Serviço completo.",
    categoryId: "c10",
    storeId: "s6",
    whatsapp: "https://wa.me/5535999990006",
    featured: false,
  },
];

export const seedServices: Service[] = [
  {
    id: "sv1",
    name: "Assistência Técnica de Celulares",
    image: img("photo-1512941937669-90a1b58e7e9c", 800, 600),
    description: "Troca de tela, bateria e reparo em geral.",
    storeId: "s3",
    whatsapp: "https://wa.me/5535999990003",
    featured: true,
  },
  {
    id: "sv2",
    name: "Mecânica Automotiva",
    image: img("photo-1632823471565-1ecdf5c6f4ce", 800, 600),
    description: "Revisão completa, freios, suspensão e injeção eletrônica.",
    storeId: "s6",
    whatsapp: "https://wa.me/5535999990006",
    featured: true,
  },
  {
    id: "sv3",
    name: "Entrega em Domicílio",
    image: img("photo-1526367790999-0150786686a2", 800, 600),
    description: "Entregamos suas compras na sua casa em até 1 hora.",
    storeId: "s1",
    whatsapp: "https://wa.me/5535999990001",
    featured: true,
  },
];

export const seedBanners: Banner[] = [
  {
    id: "b1",
    title: "Encontre tudo da sua cidade",
    subtitle: "Produtos, lojas e serviços locais em um só lugar",
    image: "",
  },
];

export const seedProviders: Provider[] = [
  {
    id: "pr1",
    name: "Carlos Barber Studio",
    photo: img("photo-1503951914875-452162b0f3f1", 300, 300),
    cover: img("photo-1521590832167-7bcbfaa6381f", 1200, 400),
    description: "Barbeiro profissional com 10 anos de experiência. Cortes modernos e barba.",
    whatsapp: "https://wa.me/5535999990010",
    phone: "+5535999990010",
    city: "Serrana",
    serviceArea: "Serrana e região",
    instagram: "carlosbarberstudio",
    schedule: "Seg a Sáb, 9h às 19h",
    categoryIds: ["sc2"],
    featured: true,
  },
  {
    id: "pr2",
    name: "Juliana Make",
    photo: img("photo-1487412720507-e7ab37603c6f", 300, 300),
    cover: img("photo-1522337360788-8b13dee7a37e", 1200, 400),
    description: "Maquiadora especializada em noivas, debutantes e eventos sociais.",
    whatsapp: "https://wa.me/5535999990011",
    phone: "+5535999990011",
    city: "Serrana",
    serviceArea: "Atende toda a região serrana",
    instagram: "julianamake",
    schedule: "Agendamento via WhatsApp",
    categoryIds: ["sc4", "sc5"],
    featured: true,
  },
  {
    id: "pr3",
    name: "Roberto Eletricista",
    photo: img("photo-1521119989659-a83eee488004", 300, 300),
    cover: img("photo-1565608087341-404b25492fee", 1200, 400),
    description: "Eletricista residencial e comercial. Instalações, reparos e emergências 24h.",
    whatsapp: "https://wa.me/5535999990012",
    phone: "+5535999990012",
    city: "Serrana",
    serviceArea: "Serrana, Cravinhos e região",
    schedule: "Seg a Sex 8h-18h, emergências 24h",
    categoryIds: ["sc7", "sc15"],
    featured: true,
  },
  {
    id: "pr4",
    name: "Studio Lux Fotografia",
    photo: img("photo-1492562080023-ab3db95bfbce", 300, 300),
    cover: img("photo-1452587925148-ce544e77e70d", 1200, 400),
    description: "Fotografia profissional para casamentos, ensaios e eventos corporativos.",
    whatsapp: "https://wa.me/5535999990013",
    phone: "+5535999990013",
    city: "Serrana",
    serviceArea: "Serrana e cidades vizinhas",
    instagram: "studioluxfoto",
    schedule: "Agendamento prévio",
    categoryIds: ["sc10"],
    featured: false,
  },
];

export const seedProviderServices: ProviderService[] = [
  {
    id: "ps1",
    providerId: "pr1",
    name: "Corte Masculino",
    description: "Corte moderno com acabamento na navalha.",
    price: 35,
    image: img("photo-1599351431202-1e0f0137899a", 800, 800),
    categoryId: "sc2",
    duration: "40 min",
    active: true,
    featured: true,
  },
  {
    id: "ps2",
    providerId: "pr1",
    name: "Barba Completa",
    description: "Modelagem, toalha quente e finalização.",
    price: 30,
    image: img("photo-1622286342621-4bd786c2447c", 800, 800),
    categoryId: "sc2",
    duration: "30 min",
    active: true,
    featured: false,
  },
  {
    id: "ps3",
    providerId: "pr2",
    name: "Maquiagem para Noiva",
    description: "Maquiagem completa com prova prévia.",
    price: 450,
    image: img("photo-1457972729786-0411a3b2b626", 800, 800),
    categoryId: "sc4",
    duration: "2h",
    active: true,
    featured: true,
  },
  {
    id: "ps4",
    providerId: "pr3",
    name: "Instalação Elétrica Residencial",
    description: "Projeto e execução de instalação elétrica completa.",
    image: img("photo-1581094794329-c8112a89af12", 800, 800),
    categoryId: "sc7",
    duration: "Sob consulta",
    active: true,
    featured: true,
  },
  {
    id: "ps5",
    providerId: "pr4",
    name: "Ensaio Fotográfico",
    description: "Ensaio externo com 40 fotos editadas em alta resolução.",
    price: 600,
    image: img("photo-1554080353-a576cf803bda", 800, 800),
    categoryId: "sc10",
    duration: "1h30",
    active: true,
    featured: true,
  },
];

export const seedProviderWorks: ProviderWork[] = [
  {
    id: "pw1",
    providerId: "pr1",
    title: "Corte fade clássico",
    description: "Cliente satisfeito com o degradê perfeito.",
    image: img("photo-1605497788044-5a32c7078486", 800, 800),
    date: "2026-05-12",
  },
  {
    id: "pw2",
    providerId: "pr1",
    title: "Barba esculpida",
    description: "Modelagem de barba para evento social.",
    image: img("photo-1517163521540-0d6e23df0c3d", 800, 800),
    date: "2026-04-22",
  },
  {
    id: "pw3",
    providerId: "pr2",
    title: "Make noiva clássica",
    description: "Make para casamento ao ar livre.",
    image: img("photo-1519415943484-9fa1873496d4", 800, 800),
    date: "2026-05-30",
  },
  {
    id: "pw4",
    providerId: "pr3",
    title: "Reforma elétrica completa",
    description: "Troca de quadro e fiação em residência.",
    image: img("photo-1558618047-3c8c76ca7d13", 800, 800),
    date: "2026-05-02",
  },
  {
    id: "pw5",
    providerId: "pr4",
    title: "Casamento Ana & Pedro",
    description: "Cobertura completa de cerimônia e festa.",
    image: img("photo-1519741497674-611481863552", 800, 800),
    date: "2026-04-18",
  },
];
