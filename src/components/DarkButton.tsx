import type { CSSProperties, ReactNode } from 'react';

/**
 * Botão escuro gravado (ações primárias: Publicar, Abrir).
 */
export default function DarkButton({
  children,
  size = 'md',
  style,
}: {
  children: ReactNode;
  size?: 'md' | 'lg';
  style?: CSSProperties;
}) {
  const dims =
    size === 'lg'
      ? { font: '800 13px var(--font-archivo)', padding: '0 20px', radius: 11, height: 54 }
      : { font: '800 11px var(--font-mono)', padding: '10px 15px', radius: 9, height: 'auto' as const };

  return (
    <button
      className="press"
      style={{
        font: dims.font,
        letterSpacing: '.03em',
        color: '#f1e7cd',
        padding: dims.padding,
        height: dims.height,
        borderRadius: dims.radius,
        background: 'linear-gradient(#3a3022,#211a10)',
        border: '1px solid #120d07',
        boxShadow:
          '0 4px 0 #15100a,0 6px 11px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.12)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
