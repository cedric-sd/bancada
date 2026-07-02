import type { CSSProperties } from 'react';
import type { Move } from '@/lib/weekly';

/**
 * Indicador de variação de posição na disputa da semana: ▲ subiu, ▼ caiu,
 * "novo" entrou nesta semana, "=" manteve. `move` ausente → não renderiza
 * (projeto sem votos na semana). Presentacional e puro.
 */
export default function Movement({ move, style }: { move?: Move; style?: CSSProperties }) {
  if (!move) return null;

  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    font: '800 10px var(--font-mono)',
    lineHeight: 1,
    padding: '2px 5px',
    borderRadius: 4,
    whiteSpace: 'nowrap',
    ...style,
  };

  if (move.isNew) {
    return (
      <span
        style={{ ...base, color: '#2f6d86', background: '#dcebf1', border: '1px solid #a9cdda' }}
        title="Novo na disputa da semana"
      >
        novo
      </span>
    );
  }

  if (move.delta > 0) {
    return (
      <span
        style={{ ...base, color: '#4f8a3a', background: '#e4ecca', border: '1px solid #b8cf8f' }}
        title={`Subiu ${move.delta} na disputa da semana`}
      >
        ▲{move.delta}
      </span>
    );
  }

  if (move.delta < 0) {
    return (
      <span
        style={{ ...base, color: '#b23a2a', background: '#f4dcd6', border: '1px solid #dcaea3' }}
        title={`Caiu ${-move.delta} na disputa da semana`}
      >
        ▼{-move.delta}
      </span>
    );
  }

  return (
    <span
      style={{ ...base, color: 'rgba(40,30,10,.5)', background: '#ece2c6', border: '1px solid #cdbd97' }}
      title="Manteve a posição na disputa da semana"
    >
      =
    </span>
  );
}
