// Domínio da Bancada — dados portados do protótipo (vitrine gamificada de side projects).

export type Project = {
  rank: number;
  slug: string;
  name: string;
  blurb: string;
  author: string;
  handle: string;
  stars: string;
  votes: string;
  cat: string;
  badge: string;
  lvl: number;
  // detalhe
  description: string;
  tags: string[];
  forks: string;
  xpForAuthor: string;
  // autenticação/propriedade
  ownerId: number | null;
  voted: boolean;
};

export type Review = {
  name: string;
  handle: string;
  initials: string;
  stars: number;
  text: string;
};

export type Achievement = {
  label: string;
  color: string;
  rotate: number;
};

export type Dev = {
  handle: string;
  name: string;
  initials: string;
  bio: string;
  level: number;
  xp: number;
  xpNext: number;
  badge: string;
  stats: { projects: number; votes: string; bestRank: string };
  achievements: Achievement[];
  projectSlugs: string[];
};

const slugify = (s: string) => s.toLowerCase();

// Dados iniciais que semeiam o banco na primeira execução. A partir daí a
// fonte de verdade é o SQLite (ver src/lib/db.ts e src/lib/projects.ts).
export type SeedProject = Omit<Project, 'ownerId' | 'voted'>;

export const seedProjects: SeedProject[] = [
  {
    rank: 1,
    slug: slugify('Lumen'),
    name: 'Lumen',
    blurb: 'Estúdio de temas para o terminal, ao vivo.',
    author: 'Mara Klein',
    handle: '@marakt',
    stars: '3.2k',
    votes: '1.428',
    cat: 'Terminal',
    badge: 'TOP DA SEMANA',
    lvl: 14,
    description:
      'Lumen monta temas de terminal com pré-visualização ao vivo enquanto você ajusta contraste, paleta e fontes. Importa esquemas existentes, exporta para iTerm, Alacritty e Ghostty, e versiona cada tema como um arquivo legível.',
    tags: ['#cli', '#terminal', '#temas', '#rust'],
    forks: '412',
    xpForAuthor: '+240',
  },
  {
    rank: 2,
    slug: slugify('Quokka'),
    name: 'Quokka',
    blurb: 'Banco vetorial embutido, zero-config.',
    author: 'Théo Salles',
    handle: '@theos',
    stars: '2.7k',
    votes: '1.190',
    cat: 'Database',
    badge: 'TRENDING',
    lvl: 11,
    description:
      'Quokka é um banco vetorial embutido que roda dentro do seu processo, sem servidor e sem configuração. Indexa, busca por similaridade e persiste em um único arquivo.',
    tags: ['#vetorial', '#embedded', '#zero-config'],
    forks: '286',
    xpForAuthor: '+190',
  },
  {
    rank: 3,
    slug: slugify('Refactr'),
    name: 'Refactr',
    blurb: 'Refatoração assistida por IA, direto no CLI.',
    author: 'Ana Beltrão',
    handle: '@anab',
    stars: '2.1k',
    votes: '980',
    cat: 'IA',
    badge: '',
    lvl: 9,
    description:
      'Refactr aplica refatorações assistidas por IA direto no terminal, com diffs revisáveis antes de tocar no seu código.',
    tags: ['#ia', '#cli', '#refactor'],
    forks: '198',
    xpForAuthor: '+150',
  },
  {
    rank: 4,
    slug: slugify('Markdownr'),
    name: 'Markdownr',
    blurb: 'Markdown vira slides num comando só.',
    author: 'Igor Pádua',
    handle: '@igorp',
    stars: '1.6k',
    votes: '742',
    cat: 'Docs',
    badge: '',
    lvl: 7,
    description:
      'Markdownr transforma um arquivo Markdown em uma apresentação de slides com um único comando, sem sair do editor.',
    tags: ['#markdown', '#slides', '#docs'],
    forks: '120',
    xpForAuthor: '+110',
  },
  {
    rank: 5,
    slug: slugify('Stipple'),
    name: 'Stipple',
    blurb: 'Stippling e meio-tom para SVG.',
    author: 'Rê Couto',
    handle: '@recouto',
    stars: '1.3k',
    votes: '655',
    cat: 'Design',
    badge: '',
    lvl: 6,
    description:
      'Stipple aplica efeitos de stippling e meio-tom em imagens, exportando SVG vetorial pronto para impressão e plotters.',
    tags: ['#svg', '#design', '#plotter'],
    forks: '88',
    xpForAuthor: '+90',
  },
  {
    rank: 6,
    slug: slugify('Cronos'),
    name: 'Cronos',
    blurb: 'Construtor visual de expressões cron.',
    author: 'Davi Lin',
    handle: '@davilin',
    stars: '980',
    votes: '540',
    cat: 'DevTools',
    badge: '',
    lvl: 5,
    description:
      'Cronos é um construtor visual de expressões cron com pré-visualização das próximas execuções e exportação para vários agendadores.',
    tags: ['#cron', '#devtools', '#agendamento'],
    forks: '64',
    xpForAuthor: '+70',
  },
  {
    rank: 7,
    slug: slugify('Hashly'),
    name: 'Hashly',
    blurb: 'Hashing paralelo de arquivos grandes.',
    author: 'Bia Ramos',
    handle: '@biar',
    stars: '870',
    votes: '432',
    cat: 'CLI',
    badge: '',
    lvl: 4,
    description:
      'Hashly calcula hashes de arquivos enormes em paralelo, com barra de progresso e verificação em lote.',
    tags: ['#hashing', '#cli', '#paralelo'],
    forks: '41',
    xpForAuthor: '+55',
  },
  {
    rank: 8,
    slug: slugify('PixelForge'),
    name: 'PixelForge',
    blurb: 'Gerador de gradientes e ruído procedural.',
    author: 'Léo Maia',
    handle: '@leomaia',
    stars: '760',
    votes: '388',
    cat: 'Design',
    badge: 'NOVO',
    lvl: 3,
    description:
      'PixelForge gera gradientes, texturas e ruído procedural exportáveis como PNG ou shaders prontos para usar.',
    tags: ['#gradientes', '#ruído', '#design'],
    forks: '29',
    xpForAuthor: '+45',
  },
];

export const reviewsBySlug: Record<string, Review[]> = {
  lumen: [
    {
      name: 'Théo Salles',
      handle: '@theos',
      initials: 'TS',
      stars: 5,
      text: 'Troquei meu setup inteiro por causa do preview ao vivo. Absurdo de bom.',
    },
    {
      name: 'Bia Ramos',
      handle: '@biar',
      initials: 'BR',
      stars: 5,
      text: 'Importou meus temas antigos sem reclamar. Levei dois minutos no total.',
    },
    {
      name: 'Davi Lin',
      handle: '@davilin',
      initials: 'DL',
      stars: 4,
      text: 'Faltou export pro Windows Terminal, mas o resto é impecável.',
    },
  ],
};

export const getReviews = (slug: string): Review[] => reviewsBySlug[slug] ?? [];

/** Categorias sugeridas no formulário de publicação. */
export const categories = [
  'Terminal',
  'Database',
  'IA',
  'Docs',
  'Design',
  'DevTools',
  'CLI',
  'Outros',
];
