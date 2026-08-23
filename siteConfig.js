// ============================================================================
// siteConfig.js — Edit THIS file to update business info across the whole site.
// Nothing here talks to Supabase; it's just static copy/config.
// ============================================================================

export const siteConfig = {
  brand: {
    name: "Liverpool Barbearia",
    shortName: "Liverpool",
    tagline: "Onde o estilo encontra a precisão.",
    subtitle:
      "Mais que um corte de cabelo — uma experiência. Ambiente exclusivo, barbeiros mestres e o ritual que todo homem merece.",
  },

  contact: {
    phoneDisplay: "(81) 3227-6310",
    // wa.me needs digits only, country code + area code + number.
    whatsappNumber: "5581932276310",
    whatsappMessage: "Olá! Gostaria de agendar um horário na Liverpool Barbearia.",
    instagramHandle: "@liverpoolbarber10",
    instagramUrl: "https://instagram.com/liverpoolbarber10",
    address: {
      line1: "R. José Bonifácio, 1315 - Torre",
      line2: "Recife - PE, 50710-000",
      landmark: "Dentro do Carrefour Hipermercado Recife Torre",
    },
    // TODO: swap for an embed URL generated from Google Maps > Share > Embed a map
    mapEmbedUrl:
      "https://www.google.com/maps?q=R.+Jos%C3%A9+Bonif%C3%A1cio,+1315+-+Torre,+Recife+-+PE,+50710-000&output=embed",
  },

  hours: [
    { day: "Segunda-feira", value: "08:00–22:00" },
    { day: "Terça-feira", value: "08:00–22:00" },
    { day: "Quarta-feira", value: "08:00–22:00" },
    { day: "Quinta-feira", value: "08:00–22:00" },
    { day: "Sexta-feira", value: "08:00–22:00" },
    { day: "Sábado", value: "08:00–22:00" },
    { day: "Domingo", value: "08:00–20:00" },
  ],

  // Real numbers where we have them (Google Business listing). Fill in the
  // TODOs with the barbershop's own figures before launch.
  stats: {
    rating: "4.7",
    reviewsCount: "126",
    yearsHistory: "?", // TODO: anos de história
    clients: "?", // TODO: nº de clientes atendidos
    barbers: "?", // TODO: nº de barbeiros na equipe
  },

  about: {
    eyebrow: "— SOBRE NÓS",
    title: "Uma tradição de excelência.",
    titleEmphasis: "excelência",
    paragraphs: [
      "A Liverpool Barbearia nasceu para resgatar a essência das barbearias clássicas com um toque contemporâneo. Aqui, cada cliente é recebido como em um clube exclusivo — ambiente reservado, atendimento impecável e técnicas refinadas.",
      "Nossa equipe é formada por barbeiros experientes que tratam cada corte como uma obra de arte. Bem-vindo à sua nova barbearia.",
    ],
    photo: "./assets/img/interior.jpg",
  },

  // Fallback carousel photos, used only until the admin uploads real ones to
  // the `carrossel-fotos` Supabase Storage bucket.
  carouselFallback: [
    { id: 1, src: "./assets/carrossel/1.jpg", alt: "Corte estilo clássico" },
    { id: 2, src: "./assets/carrossel/2.jpg", alt: "Degradê navalhado" },
    { id: 3, src: "./assets/carrossel/3.jpg", alt: "Barba alinhada" },
    { id: 4, src: "./assets/carrossel/4.jpg", alt: "Corte social" },
    { id: 5, src: "./assets/carrossel/5.jpg", alt: "Platinado" },
    { id: 6, src: "./assets/carrossel/6.jpg", alt: "Barboterapia" },
    { id: 7, src: "./assets/carrossel/7.jpg", alt: "Acabamento navalha" },
    { id: 8, src: "./assets/carrossel/8.jpg", alt: "Visagismo" },
  ],

  // TODO: confirm "Corte + Barba" combo price (partially illegible on the
  // printed price sheet) before publishing.
  pricing: {
    title: "O Ritual Completo do Cavalheiro",
    subtitle: "Serviços",
    items: [
      { id: "corte", name: "Corte", price: 50 },
      { id: "barba", name: "Barba", price: 40 },
      { id: "corte-barba", name: "Corte + Barba", price: null }, // TODO: preço
      { id: "acabamento", name: "Acabamento do cabelo", price: 10 },
      { id: "sobrancelha", name: "Sobrancelha na lâmina", price: 10 },
      { id: "progressiva", name: "Progressiva", price: 100, fromPrice: true },
      { id: "botox", name: "Botox capilar", price: 70, fromPrice: true },
    ],
  },

  testimonials: [
    {
      id: 1,
      name: "Rafael Mendes",
      role: "Cliente há 5 anos",
      rating: 5,
      text: "Melhor barbearia da região. Atendimento impecável e o corte sempre perfeito. Não troco por nada.",
    },
    {
      id: 2,
      name: "Lucas Andrade",
      role: "Empresário",
      rating: 5,
      text: "Ambiente elegante, profissionais excelentes. Saio sempre me sentindo um cavalheiro de verdade.",
    },
    {
      id: 3,
      name: "Felipe Costa",
      role: "Designer",
      rating: 5,
      text: "Detalhe, precisão e estilo. A Liverpool é uma experiência completa, vale cada centavo.",
    },
  ],

  finalCta: {
    eyebrow: "— AGENDE SEU HORÁRIO",
    title: "Pronto para uma nova versão de você?",
    subtitle:
      "Reserve seu horário pelo WhatsApp em segundos. Atendimento rápido, confirmação imediata.",
  },

  nav: [
    { label: "Início", href: "#home" },
    { label: "Serviços", href: "#servicos" },
    { label: "Sobre", href: "#sobre" },
    { label: "Contato", href: "#contato" },
  ],
};
