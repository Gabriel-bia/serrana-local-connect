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
  description: string;
  categoryId: string;
  storeId: string;
  externalLink?: string;
  whatsapp: string;
  featured: boolean;
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
