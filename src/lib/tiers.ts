// Faixas de nível (tiers): dão significado cosmético ao nível — título/selo,
// moldura do avatar e chip destacado no card. Puro e testável.

export type TierKey = 'builder' | 'bronze' | 'prata' | 'ouro';

export type Tier = {
  key: TierKey;
  title: string; // rótulo curto ("Builder", "Ouro")
  badge: string; // selo do perfil ("BUILDER", "OURO DEV")
  accent: string; // cor de texto/borda
  frame: string; // gradiente da moldura/anel do avatar e do disco de nível
  chipBg: string; // fundo do chip de nível no card
  chipBorder: string;
  glow: string; // sombra/realce (destaque das faixas altas)
};

const BUILDER: Tier = {
  key: 'builder',
  title: 'Builder',
  badge: 'BUILDER',
  accent: '#557a38',
  frame: 'linear-gradient(135deg,#d8c9a4,#b39e6c)',
  chipBg: '#e4ecca',
  chipBorder: '#b8cf8f',
  glow: 'none',
};

const BRONZE: Tier = {
  key: 'bronze',
  title: 'Bronze',
  badge: 'BRONZE DEV',
  accent: '#9a6a1f',
  frame: 'linear-gradient(135deg,#e6b487,#a86a34)',
  chipBg: '#f3e2cf',
  chipBorder: '#d6a878',
  glow: '0 0 0 1px rgba(154,106,31,.25)',
};

const PRATA: Tier = {
  key: 'prata',
  title: 'Prata',
  badge: 'PRATA DEV',
  accent: '#6b7480',
  frame: 'linear-gradient(135deg,#eaeaea,#9fa6ad)',
  chipBg: '#eceef0',
  chipBorder: '#bcc3ca',
  glow: '0 0 0 1px rgba(107,116,128,.25)',
};

const OURO: Tier = {
  key: 'ouro',
  title: 'Ouro',
  badge: 'OURO DEV',
  accent: '#a97f22',
  frame: 'linear-gradient(135deg,#f7e29a,#d8a93a)',
  chipBg: '#f7ebc4',
  chipBorder: '#e2c877',
  glow: '0 0 14px rgba(216,169,58,.55)',
};

/** Faixa de nível de um dev (a mesma curva de sempre: 3 / 6 / 10). */
export function tierForLevel(level: number): Tier {
  if (level >= 10) return OURO;
  if (level >= 6) return PRATA;
  if (level >= 3) return BRONZE;
  return BUILDER;
}
