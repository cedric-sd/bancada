import type { CSSProperties } from 'react';

// Gradientes determinísticos por iniciais — mantém o tom "fichário" do protótipo.
const gradients = [
  'linear-gradient(#caa,#a77)',
  'linear-gradient(#b9c4a6,#8a9a6f)',
  'linear-gradient(#c4a9b0,#9a7480)',
  'linear-gradient(#c4b59a,#9a8a6f)',
];

function pick(initials: string) {
  const code = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
  return gradients[code % gradients.length];
}

/**
 * Avatar circular com iniciais (estilo "carimbo") ou a foto do usuário via `src`.
 */
export default function Avatar({
  initials,
  size = 22,
  src,
  style,
}: {
  initials: string;
  size?: number;
  src?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        background: pick(initials),
        display: 'grid',
        placeItems: 'center',
        font: `800 ${Math.max(8, Math.round(size * 0.4))}px var(--font-archivo)`,
        color: '#3a2a22',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.15)',
        flex: 'none',
        ...style,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials
      )}
    </div>
  );
}
