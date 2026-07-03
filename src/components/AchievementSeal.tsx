import type { CSSProperties } from 'react';

/**
 * Selo de conquista: um emblema (disco com ícone + rótulo) em relevo, no lugar
 * do carimbo rotacionado. Presentacional.
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
  const disc: CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: '50%',
    flex: 'none',
    display: 'grid',
    placeItems: 'center',
    fontSize: 15,
    background: `radial-gradient(circle at 35% 30%, #ffffff55, ${color})`,
    boxShadow: `inset 0 1px 1px rgba(255,255,255,.5), 0 1px 2px rgba(0,0,0,.35)`,
    border: '1.5px solid rgba(255,255,255,.55)',
  };

  return (
    <span
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 13px 5px 6px',
        borderRadius: 22,
        background: 'linear-gradient(180deg,#fdf6e3,#f1e4c4)',
        border: `1.5px solid ${color}`,
        boxShadow: '0 2px 0 rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.7)',
      }}
    >
      <span style={disc} aria-hidden>
        {icon}
      </span>
      <span style={{ font: '800 11px var(--font-archivo)', letterSpacing: '.04em', color }}>{label}</span>
    </span>
  );
}
