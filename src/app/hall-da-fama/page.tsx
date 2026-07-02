import Link from 'next/link';
import Board from '@/components/Board';
import BancadaMark from '@/components/BancadaMark';
import Stamp from '@/components/Stamp';
import Movement from '@/components/Movement';
import { currentRace, listChampions } from '@/lib/weekly';

export const dynamic = 'force-dynamic';

const MEDALS = ['#e8c869', '#cdd2da', '#d09a5e'];

export default async function HallDaFamaPage() {
  const race = currentRace();
  const champions = listChampions();

  return (
    <Board maxWidth={740}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <Link href="/" style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.6)' }}>
          ‹ voltar ao placar
        </Link>
      </div>

      {/* cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 22 }}>
        <BancadaMark size={44} />
        <div>
          <h1
            style={{
              margin: 0,
              font: '900 30px/1 var(--font-archivo)',
              color: '#221c12',
              textShadow: '0 1px 0 rgba(255,255,255,.4)',
            }}
          >
            Hall da Fama
          </h1>
          <div
            style={{
              font: '500 10px/1 var(--font-mono)',
              letterSpacing: '.16em',
              color: 'rgba(40,30,10,.6)',
              marginTop: 4,
            }}
          >
            OS VENCEDORES DE CADA SEMANA
          </div>
        </div>
      </div>

      {/* em disputa: semana atual */}
      <section
        style={{
          background: '#f7efda',
          border: '1px solid #d8c79d',
          borderRadius: 10,
          boxShadow: '0 3px 0 rgba(0,0,0,.1),0 10px 22px rgba(0,0,0,.2)',
          padding: 18,
          marginBottom: 26,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            marginBottom: 14,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ font: '700 11px var(--font-mono)', letterSpacing: '.14em', color: 'rgba(40,30,10,.6)' }}>
              EM DISPUTA
            </span>
            <Stamp label="AO VIVO" color="#4f8a3a" rotate={-3} />
          </div>
          <div style={{ font: '600 11px var(--font-mono)', color: 'rgba(40,30,10,.6)' }}>
            {race.range} · encerra em {race.endsIn}
          </div>
        </div>

        {race.top.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {race.top.map((e) => (
              <Link
                key={e.slug}
                href={`/project/${e.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 13,
                  padding: '9px 12px',
                  background: '#efe6cd',
                  border: '1px solid #cbb787',
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    font: '900 22px var(--font-archivo)',
                    color: MEDALS[e.rank - 1] ?? '#9a8050',
                    width: 26,
                    textAlign: 'center',
                    flex: 'none',
                    textShadow: '0 1px 0 rgba(255,255,255,.5)',
                  }}
                >
                  {e.rank}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ font: '900 15px var(--font-archivo)', color: '#221c12' }}>{e.name}</span>
                    <Movement move={e.move} />
                  </div>
                  <div style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.55)', marginTop: 1 }}>
                    {e.author}
                  </div>
                </div>
                <span style={{ font: '800 13px var(--font-mono)', color: '#4f8a3a', flex: 'none' }}>
                  ▲ {e.weeklyVotes}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ font: '400 14px/1.5 var(--font-news)', color: '#5a4f3c' }}>
            Nenhum voto nesta semana ainda. O primeiro a pontuar assume a ponta.
          </div>
        )}
      </section>

      {/* campeões anteriores */}
      <div style={{ font: '700 11px var(--font-mono)', letterSpacing: '.14em', color: 'rgba(40,30,10,.6)', marginBottom: 13 }}>
        CAMPEÕES ANTERIORES
      </div>

      {champions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {champions.map((c, i) => (
            <div
              key={c.weekKey}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 15,
                padding: '14px 16px',
                background: '#f6eed8',
                backgroundImage:
                  'repeating-linear-gradient(0deg,rgba(70,55,30,.016) 0 1px,transparent 1px 22px)',
                border: '1px solid #d8c79d',
                borderRadius: 10,
                boxShadow: '0 2px 0 rgba(0,0,0,.07),0 5px 12px rgba(0,0,0,.14)',
              }}
            >
              <div style={{ flex: 'none', textAlign: 'center', width: 40 }}>
                <div style={{ font: '22px', lineHeight: 1 }}>🏆</div>
                {i === 0 ? (
                  <div style={{ font: '600 7.5px var(--font-mono)', letterSpacing: '.1em', color: '#b8891f', marginTop: 3 }}>
                    ATUAL
                  </div>
                ) : null}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '600 9.5px var(--font-mono)', letterSpacing: '.1em', color: 'rgba(40,30,10,.55)' }}>
                  SEMANA {c.range}
                </div>
                <Link
                  href={`/project/${c.slug}`}
                  style={{ font: '900 19px var(--font-archivo)', color: '#221c12', display: 'inline-block', marginTop: 2 }}
                >
                  {c.name}
                </Link>
                <div style={{ font: '500 11px var(--font-mono)', color: 'rgba(40,30,10,.6)', marginTop: 2 }}>
                  {c.author}
                </div>
              </div>
              <div style={{ textAlign: 'right', flex: 'none' }}>
                <div style={{ font: '900 18px var(--font-archivo)', color: '#4f8a3a' }}>▲ {c.votes}</div>
                <div style={{ font: '600 8.5px var(--font-mono)', letterSpacing: '.1em', color: 'rgba(40,30,10,.5)', marginTop: 2 }}>
                  VOTOS NA SEMANA
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            font: '400 15px/1.5 var(--font-news)',
            color: '#5a4f3c',
            background: '#f7efda',
            border: '1px dashed #cbb787',
            borderRadius: 10,
            padding: '28px 20px',
            textAlign: 'center',
          }}
        >
          Ainda não há campeões — a primeira semana está em disputa agora.
        </div>
      )}
    </Board>
  );
}
