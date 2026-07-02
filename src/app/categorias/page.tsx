import Link from 'next/link';
import Board from '@/components/Board';
import BancadaMark from '@/components/BancadaMark';
import Stamp from '@/components/Stamp';
import Rating from '@/components/Rating';
import { categoryRankings } from '@/lib/projects';

export const dynamic = 'force-dynamic';

const MEDALS = ['#e8c869', '#cdd2da', '#d09a5e'];

export default async function CategoriasPage() {
  const groups = categoryRankings();

  return (
    <Board maxWidth={820}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/" style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.6)' }}>
          ‹ voltar ao placar
        </Link>
      </div>

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
            Rankings por categoria
          </h1>
          <div style={{ font: '500 10px/1 var(--font-mono)', letterSpacing: '.16em', color: 'rgba(40,30,10,.6)', marginTop: 4 }}>
            O MELHOR DE CADA CATEGORIA
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 16 }}>
        {groups.map(({ cat, projects }) => {
          const champion = projects[0];
          const runners = projects.slice(1, 4);
          return (
            <section
              key={cat}
              style={{
                background: '#f7efda',
                border: '1px solid #d8c79d',
                borderRadius: 10,
                boxShadow: '0 3px 0 rgba(0,0,0,.1),0 10px 22px rgba(0,0,0,.2)',
                padding: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                <span style={{ font: '700 11px var(--font-mono)', letterSpacing: '.14em', color: 'rgba(40,30,10,.6)' }}>
                  {cat.toUpperCase()}
                </span>
                <span style={{ font: '600 10px var(--font-mono)', color: 'rgba(40,30,10,.5)' }}>
                  {projects.length} projeto{projects.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* campeão da categoria */}
              <Link
                href={`/project/${champion.slug}`}
                className="card-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 13,
                  padding: '12px 13px',
                  background: '#fbf3dd',
                  border: '1px solid #e0c98f',
                  borderRadius: 9,
                  boxShadow: '0 2px 0 rgba(0,0,0,.08)',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 7,
                    overflow: 'hidden',
                    background: 'repeating-linear-gradient(45deg,#d8c49a 0 7px,rgba(0,0,0,.05) 7px 14px)',
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.1)',
                    flex: 'none',
                  }}
                >
                  {champion.hasImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/projects/${champion.slug}/image`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : null}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Stamp label={`MELHOR EM ${cat.toUpperCase()}`} color="#b23a2a" rotate={-3} />
                  <div style={{ font: '900 18px var(--font-archivo)', color: '#221c12', marginTop: 6 }}>{champion.name}</div>
                  <div style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.55)', marginTop: 2 }}>
                    {champion.author}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flex: 'none' }}>
                  <div style={{ font: '800 13px var(--font-mono)', color: '#b23a2a' }}>▲ {champion.votes}</div>
                  <div style={{ marginTop: 4 }}>
                    <Rating rating={champion.rating} count={champion.reviewCount} size={10} />
                  </div>
                </div>
              </Link>

              {/* vice-campeões */}
              {runners.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
                  {runners.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/project/${p.slug}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '7px 10px', background: '#efe6cd', border: '1px solid #cbb787', borderRadius: 7 }}
                    >
                      <span style={{ font: '900 15px var(--font-archivo)', color: MEDALS[p.rank - 1] ?? '#9a8050', width: 20, textAlign: 'center', flex: 'none' }}>
                        {p.rank}
                      </span>
                      <span style={{ flex: 1, minWidth: 0, font: '800 13px var(--font-archivo)', color: '#221c12' }}>{p.name}</span>
                      <span style={{ font: '700 11px var(--font-mono)', color: 'rgba(40,30,10,.6)', flex: 'none' }}>▲ {p.votes}</span>
                    </Link>
                  ))}
                </div>
              ) : null}

              <Link
                href={`/?cat=${encodeURIComponent(cat)}`}
                style={{ display: 'inline-block', marginTop: 12, font: '600 10px var(--font-mono)', color: '#b23a2a' }}
              >
                ver todos em {cat} →
              </Link>
            </section>
          );
        })}
      </div>
    </Board>
  );
}
