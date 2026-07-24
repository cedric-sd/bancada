import Link from 'next/link';
import type { MonthlyRace } from '@/lib/monthly';

/**
 * Faixa do ciclo mensal no topo do placar: mostra o mês em disputa, quem
 * lidera agora e quanto falta para encerrar — com atalho para o Hall da Fama.
 */
export default function MonthlyBanner({ race }: { race: MonthlyRace }) {
  const { leader } = race;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        flexWrap: 'wrap',
        padding: '12px 16px',
        marginBottom: 18,
        background: '#2b2318',
        backgroundImage:
          'repeating-linear-gradient(120deg,rgba(255,255,255,.03) 0 2px,transparent 2px 6px)',
        border: '1px solid #4a3c24',
        borderRadius: 10,
        boxShadow: '0 3px 0 rgba(0,0,0,.22),0 10px 22px rgba(0,0,0,.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <div style={{ flex: 'none' }}>
          <div
            style={{
              font: '700 8.5px var(--font-mono)',
              letterSpacing: '.16em',
              color: '#e8c869',
            }}
          >
            EM DISPUTA
          </div>
          <div style={{ font: '600 11px var(--font-mono)', color: 'rgba(240,230,205,.7)', marginTop: 3 }}>
            {race.range}
          </div>
        </div>

        <div
          style={{
            width: 1,
            alignSelf: 'stretch',
            background: 'rgba(255,255,255,.12)',
            flex: 'none',
          }}
        />

        {leader ? (
          <div style={{ minWidth: 0 }}>
            <div style={{ font: '600 8.5px var(--font-mono)', letterSpacing: '.14em', color: 'rgba(240,230,205,.5)' }}>
              LÍDER DO MÊS
            </div>
            <Link
              href={`/project/${leader.slug}`}
              style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 3, minWidth: 0 }}
            >
              <span style={{ font: '900 17px var(--font-archivo)', color: '#f3ead2' }}>{leader.name}</span>
              <span style={{ font: '700 11px var(--font-mono)', color: '#8fbf6a', flex: 'none' }}>
                ▲ {leader.monthlyVotes}
              </span>
            </Link>
          </div>
        ) : (
          <div style={{ font: '500 13px/1.4 var(--font-news)', color: 'rgba(240,230,205,.75)' }}>
            Ninguém pontuou ainda este mês — seu voto pode abrir o placar.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 'none' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ font: '700 8.5px var(--font-mono)', letterSpacing: '.14em', color: 'rgba(240,230,205,.5)' }}>
            ENCERRA EM
          </div>
          <div style={{ font: '900 15px var(--font-archivo)', color: '#f3ead2', marginTop: 2 }}>
            {race.endsIn}
          </div>
        </div>
        <Link
          href="/hall-da-fama"
          style={{
            font: '800 10px var(--font-mono)',
            letterSpacing: '.08em',
            color: '#2b2318',
            background: 'linear-gradient(#f4d98a,#d8a93a)',
            border: '1px solid #b98f2e',
            borderRadius: 7,
            padding: '8px 12px',
            boxShadow: '0 2px 0 rgba(0,0,0,.28)',
            whiteSpace: 'nowrap',
          }}
        >
          HALL DA FAMA ↗
        </Link>
      </div>
    </div>
  );
}
