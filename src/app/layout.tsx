import type { Metadata } from 'next';
import { Archivo, JetBrains_Mono, Newsreader } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
});

const newsreader = Newsreader({
  variable: '--font-news',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Bancada — vitrine gamificada de side projects',
  description:
    'Bancada é uma vitrine gamificada de side projects: placar mensal, pódio, votos e XP para a comunidade de builders.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${jetbrainsMono.variable} ${newsreader.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
