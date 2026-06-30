import type { CSSProperties } from 'react';

/**
 * Carimbo editorial rotacionado (TOP DA SEMANA, TRENDING, NOVO…).
 */
export default function Stamp({
  label,
  color = '#b23a2a',
  rotate = -4,
  size = 'md',
  style,
}: {
  label: string;
  color?: string;
  rotate?: number;
  size?: 'sm' | 'md' | 'lg';
  style?: CSSProperties;
}) {
  const sizes = {
    sm: { font: '800 8px var(--font-archivo)', padding: '1px 5px', border: '1.5px solid', radius: 3 },
    md: { font: '800 9px var(--font-archivo)', padding: '2px 6px', border: '2px solid', radius: 3 },
    lg: { font: '800 12px var(--font-archivo)', padding: '7px 12px', border: '2.5px solid', radius: 5 },
  }[size];

  return (
    <span
      style={{
        font: sizes.font,
        letterSpacing: '.1em',
        color,
        border: `${sizes.border} ${color}`,
        padding: sizes.padding,
        borderRadius: sizes.radius,
        transform: `rotate(${rotate}deg)`,
        opacity: 0.85,
        mixBlendMode: 'multiply',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {label}
    </span>
  );
}
