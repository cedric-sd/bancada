import type { CSSProperties } from 'react';

/**
 * Média de avaliações da comunidade (★ dourado + contagem). Não renderiza nada
 * quando o projeto ainda não tem avaliações.
 */
export default function Rating({
  rating,
  count,
  size = 11,
  style,
}: {
  rating: number;
  count: number;
  size?: number;
  style?: CSSProperties;
}) {
  if (count <= 0) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        font: `700 ${size}px var(--font-mono)`,
        color: '#c8951f',
        whiteSpace: 'nowrap',
        ...style,
      }}
      title={`${rating.toFixed(1)} de 5 · ${count} avaliaç${count === 1 ? 'ão' : 'ões'}`}
    >
      ★ {rating.toFixed(1)}
      <span style={{ color: 'rgba(40,30,10,.5)', fontWeight: 500 }}>({count})</span>
    </span>
  );
}
