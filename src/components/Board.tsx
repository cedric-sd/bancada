import type { CSSProperties, ReactNode } from 'react';

const boardBg =
  'radial-gradient(circle at 18% 12%,rgba(255,255,255,.07),transparent 42%),' +
  'radial-gradient(circle at 82% 88%,rgba(0,0,0,.10),transparent 46%),' +
  'repeating-linear-gradient(94deg,rgba(0,0,0,.022) 0 2px,transparent 2px 5px),' +
  'repeating-linear-gradient(2deg,rgba(255,255,255,.02) 0 3px,transparent 3px 7px)';

/**
 * Bancada de madeira — a textura ocupa a tela inteira (full-bleed) e o conteúdo
 * fica centralizado por cima, limitado a `maxWidth`.
 */
export default function Board({
  children,
  maxWidth = 1080,
  style,
}: {
  children: ReactNode;
  maxWidth?: number;
  style?: CSSProperties;
}) {
  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '40px 20px',
        backgroundColor: 'var(--board)',
        backgroundImage: boardBg,
        boxShadow: 'inset 0 0 220px rgba(60,40,15,.4)',
      }}
    >
      <div style={{ width: '100%', maxWidth, ...style }}>{children}</div>
    </main>
  );
}
