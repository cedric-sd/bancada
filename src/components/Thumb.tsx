import type { CSSProperties } from 'react';

const palettes: Record<string, string> = {
  warm: '#d8c49a',
  cool: '#cdb6c0',
  sage: '#bcc7b0',
};

/**
 * Placeholder de preview com hachura diagonal (screenshot do projeto).
 */
export default function Thumb({
  height = 118,
  palette = 'warm',
  label,
  radius = 3,
  stripe = 9,
  src,
  alt = '',
  style,
  children,
}: {
  height?: number;
  palette?: keyof typeof palettes | string;
  label?: string;
  radius?: number;
  stripe?: number;
  src?: string;
  alt?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}) {
  const base = palettes[palette] ?? palette;
  return (
    <div
      style={{
        position: 'relative',
        height,
        borderRadius: radius,
        overflow: 'hidden',
        background: `repeating-linear-gradient(45deg,${base} 0 ${stripe}px,rgba(0,0,0,.05) ${stripe}px ${stripe * 2}px)`,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.09),inset 0 2px 8px rgba(0,0,0,.14)',
        ...style,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : null}
      {!src && label ? (
        <span
          style={{
            position: 'absolute',
            left: 8,
            bottom: 7,
            font: '500 9px/1 var(--font-mono)',
            letterSpacing: '.08em',
            color: 'rgba(40,30,10,.55)',
            background: 'rgba(246,238,216,.85)',
            padding: '3px 5px',
            borderRadius: 2,
          }}
        >
          {label}
        </span>
      ) : null}
      {children}
    </div>
  );
}
