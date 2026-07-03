import type { CSSProperties } from 'react';

/**
 * Conquista como selo de lacre / sinete: um medalhão de cera com borda frisada,
 * ícone em relevo e o rótulo numa faixa abaixo — no lugar da antiga badge em
 * pílula. Presentacional.
 */
export default function AchievementSeal({
  label,
  color,
  icon,
  title,
}: {
  label: string;
  color: string;
  icon: string;
  title?: string;
}) {
  // Borda frisada (fluting) do lacre: setores claros/escuros alternados sobre a
  // cor do selo, dando o aspecto de cera prensada / medalha.
  const ring: CSSProperties = {
    position: 'relative',
    width: 66,
    height: 66,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: `repeating-conic-gradient(rgba(0,0,0,.28) 0deg 9deg, rgba(255,255,255,.14) 9deg 18deg), ${color}`,
    boxShadow: '0 4px 7px rgba(0,0,0,.35),inset 0 1px 1px rgba(255,255,255,.35)',
  };

  // Disco central abaulado (a cera): domo com relevo e um anel interno gravado.
  const disc: CSSProperties = {
    width: 50,
    height: 50,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 23,
    lineHeight: 1,
    background: `radial-gradient(circle at 38% 30%, rgba(255,255,255,.55), ${color} 62%, rgba(0,0,0,.35))`,
    boxShadow:
      'inset 0 2px 4px rgba(255,255,255,.45),inset 0 -4px 7px rgba(0,0,0,.4),0 0 0 2px rgba(0,0,0,.12),0 0 0 3px rgba(255,255,255,.25)',
    textShadow: '0 1px 0 rgba(255,255,255,.5),0 -1px 1px rgba(0,0,0,.35)',
  };

  return (
    <span
      title={title}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        width: 96,
        textAlign: 'center',
      }}
    >
      <span style={ring} aria-hidden>
        <span style={disc}>{icon}</span>
      </span>
      <span
        style={{
          font: '800 9px var(--font-mono)',
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color,
          lineHeight: 1.25,
          textShadow: '0 1px 0 rgba(255,255,255,.55)',
        }}
      >
        {label}
      </span>
    </span>
  );
}
