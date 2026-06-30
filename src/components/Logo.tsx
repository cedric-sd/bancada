import Link from 'next/link';

/**
 * Marca da Bancada: selo "B" gravado + wordmark e subtítulo.
 */
export default function Logo({ subtitle = 'PLACAR DA SEMANA' }: { subtitle?: string }) {
  return (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 9,
          background: 'linear-gradient(#2a2419,#16120c)',
          color: '#e9dcc0',
          display: 'grid',
          placeItems: 'center',
          font: '900 18px var(--font-archivo)',
          boxShadow: '0 3px 0 rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.14)',
        }}
      >
        B
      </div>
      <div>
        <div
          style={{
            font: '900 22px/1 var(--font-archivo)',
            color: '#221c12',
            textShadow: '0 1px 0 rgba(255,255,255,.4)',
          }}
        >
          BANCADA
        </div>
        <div
          style={{
            font: '500 9px/1 var(--font-mono)',
            letterSpacing: '.18em',
            color: 'rgba(40,30,10,.6)',
            marginTop: 3,
          }}
        >
          {subtitle}
        </div>
      </div>
    </Link>
  );
}
