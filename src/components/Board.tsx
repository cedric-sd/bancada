import type { CSSProperties, ReactNode } from 'react';

const boardBg =
  'radial-gradient(circle at 18% 22%,rgba(255,255,255,.07),transparent 42%),' +
  'radial-gradient(circle at 82% 78%,rgba(0,0,0,.10),transparent 46%),' +
  'repeating-linear-gradient(94deg,rgba(0,0,0,.022) 0 2px,transparent 2px 5px),' +
  'repeating-linear-gradient(2deg,rgba(255,255,255,.02) 0 3px,transparent 3px 7px)';

/**
 * Painel de madeira da "bancada" — fundo texturizado que emoldura cada tela.
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
        display: 'flex',
        justifyContent: 'center',
        padding: '40px 20px',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth,
          borderRadius: 12,
          padding: '26px 28px 34px',
          backgroundColor: 'var(--board)',
          backgroundImage: boardBg,
          boxShadow:
            'inset 0 0 120px rgba(60,40,15,.35),0 2px 4px rgba(0,0,0,.12),0 18px 40px rgba(0,0,0,.22)',
          ...style,
        }}
      >
        {children}
      </div>
    </main>
  );
}
