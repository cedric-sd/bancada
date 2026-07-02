import Link from 'next/link';
import BancadaMark from './BancadaMark';

/**
 * Marca da Bancada: o selo (pódio + upvote) gravado + wordmark e subtítulo.
 */
export default function Logo({ subtitle = 'PLACAR DA SEMANA' }: { subtitle?: string }) {
  return (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <BancadaMark size={38} />
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
