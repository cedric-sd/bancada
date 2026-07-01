import Link from 'next/link';
import { notFound } from 'next/navigation';
import Board from '@/components/Board';
import Stamp from '@/components/Stamp';
import { resolveDev, getProjectBySlug } from '@/lib/projects';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const statCell = (value: string, label: string, color = '#221c12') => (
  <div
    style={{
      background: '#efe6cd',
      border: '1px solid #cbb787',
      borderRadius: 8,
      padding: 12,
      textAlign: 'center',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6)',
    }}
  >
    <div style={{ font: '900 22px var(--font-archivo)', color }}>{value}</div>
    <div style={{ font: '600 8.5px var(--font-mono)', letterSpacing: '.1em', color: 'rgba(40,30,10,.55)', marginTop: 3 }}>
      {label}
    </div>
  </div>
);

export default async function DevPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const dev = resolveDev(handle);
  if (!dev) notFound();

  const user = await getCurrentUser();
  const isSelf = !!user && user.handle.replace(/^@/, '').toLowerCase() === dev.handle.replace(/^@/, '').toLowerCase();

  const pct = Math.min(100, Math.round((dev.xp / dev.xpNext) * 100));
  const remaining = (dev.xpNext - dev.xp).toLocaleString('pt-BR');
  const myProjects = dev.projectSlugs.map(getProjectBySlug).filter((p) => p !== undefined);

  return (
    <Board maxWidth={740}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 14,
          flexWrap: 'wrap',
        }}
      >
        <Link href="/" style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.6)' }}>
          ‹ voltar ao placar
        </Link>
        {isSelf ? (
          <Link href="/perfil/editar" style={{ font: '600 11px var(--font-mono)', color: 'rgba(40,30,10,.6)' }}>
            editar perfil
          </Link>
        ) : null}
      </div>

      {/* profile card */}
      <div
        style={{
          backgroundColor: '#f7efda',
          border: '1px solid #d8c79d',
          borderRadius: 10,
          boxShadow: '0 4px 0 rgba(0,0,0,.12),0 14px 30px rgba(0,0,0,.28)',
          padding: 22,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
          {/* taped photo */}
          <div
            style={{
              position: 'relative',
              flex: 'none',
              padding: '8px 8px 22px',
              background: '#fff',
              borderRadius: 2,
              boxShadow: '0 3px 10px rgba(0,0,0,.3)',
              transform: 'rotate(-2.5deg)',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -9,
                left: '50%',
                transform: 'translateX(-50%) rotate(3deg)',
                width: 64,
                height: 20,
                background: 'rgba(231,217,173,.6)',
                borderLeft: '1px dashed rgba(0,0,0,.14)',
                borderRight: '1px dashed rgba(0,0,0,.14)',
              }}
            />
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 2,
                background: 'radial-gradient(circle at 38% 32%,#d7b48a,#b07f54 70%,#7d5836)',
                display: 'grid',
                placeItems: 'center',
                font: '900 32px var(--font-archivo)',
                color: '#4a2f18',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)',
              }}
            >
              {dev.initials}
            </div>
            <div style={{ font: '500 9px var(--font-mono)', color: 'rgba(40,30,10,.5)', textAlign: 'center', marginTop: 6 }}>
              {dev.handle}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ margin: 0, font: '900 28px/1 var(--font-archivo)', color: '#221c12', textShadow: '0 1px 0 rgba(255,255,255,.5)' }}>
                {dev.name}
              </h1>
              <Stamp label={dev.badge} size="md" rotate={-4} style={{ padding: '3px 7px', borderRadius: 4 }} />
            </div>
            <div style={{ font: '400 14px/1.4 var(--font-news)', color: '#5a4f3c', marginTop: 5 }}>{dev.bio}</div>

            {/* level + xp */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
              <div
                style={{
                  flex: 'none',
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 30%,#f4d98a,#d8a93a 60%,#a97f22)',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 3px 6px rgba(0,0,0,.3),inset 0 1px 1px rgba(255,255,255,.6)',
                }}
              >
                <span style={{ font: '900 22px var(--font-archivo)', color: '#5a4310', lineHeight: 1 }}>{dev.level}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ font: '700 11px var(--font-mono)', color: '#221c12' }}>NÍVEL {dev.level}</span>
                  <span style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.55)' }}>
                    {dev.xp.toLocaleString('pt-BR')} / {dev.xpNext.toLocaleString('pt-BR')} XP
                  </span>
                </div>
                <div
                  style={{
                    height: 18,
                    borderRadius: 9,
                    background: '#cdb486',
                    border: '1px solid #a98f5f',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,.3)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: 'linear-gradient(#7aa05a,#557a38)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.35)',
                      borderRight: '2px solid rgba(0,0,0,.25)',
                    }}
                  />
                </div>
                <div style={{ font: '500 9px var(--font-mono)', color: 'rgba(40,30,10,.5)', marginTop: 5 }}>
                  faltam {remaining} XP para o nível {dev.level + 1}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 18 }}>
          {statCell(String(dev.stats.projects), 'PROJETOS')}
          {statCell(dev.stats.votes, 'VOTOS RECEBIDOS', '#b23a2a')}
          {statCell(dev.stats.bestRank, 'MELHOR POSIÇÃO', '#557a38')}
        </div>
      </div>

      {/* achievements */}
      {dev.achievements.length > 0 ? (
        <div style={{ marginTop: 20 }}>
          <div style={{ font: '700 11px var(--font-mono)', letterSpacing: '.14em', color: 'rgba(40,30,10,.6)', marginBottom: 13 }}>
            CONQUISTAS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 13 }}>
            {dev.achievements.map((a) => (
              <Stamp key={a.label} label={a.label} color={a.color} rotate={a.rotate} size="lg" />
            ))}
          </div>
        </div>
      ) : null}

      {/* published projects */}
      <div style={{ marginTop: 22 }}>
        <div style={{ font: '700 11px var(--font-mono)', letterSpacing: '.14em', color: 'rgba(40,30,10,.6)', marginBottom: 13 }}>
          PROJETOS PUBLICADOS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {myProjects.map((p) => (
            <Link
              key={p.slug}
              href={`/project/${p.slug}`}
              className="card-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '11px 15px',
                backgroundColor: '#f6eed8',
                border: '1px solid #d8c79d',
                borderRadius: 9,
                boxShadow: '0 2px 0 rgba(0,0,0,.06),0 4px 10px rgba(0,0,0,.12)',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: 'repeating-linear-gradient(45deg,#d8c49a 0 7px,rgba(0,0,0,.05) 7px 14px)',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.1)',
                  flex: 'none',
                }}
              >
                {p.hasImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/projects/${p.slug}/image`}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : null}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '800 15px var(--font-archivo)', color: '#221c12' }}>{p.name}</div>
                <div style={{ font: '400 12px/1.3 var(--font-news)', color: '#5a4f3c' }}>{p.blurb}</div>
              </div>
              <div style={{ textAlign: 'right', flex: 'none' }}>
                <div style={{ font: '800 12px var(--font-mono)', color: '#221c12' }}>★ {p.stars}</div>
                <div style={{ font: '600 9px var(--font-mono)', color: '#b23a2a', marginTop: 2 }}>▲ {p.votes}</div>
              </div>
              <div style={{ flex: 'none', font: '900 17px var(--font-archivo)', color: '#9a8050', width: 40, textAlign: 'right' }}>
                #{p.rank}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Board>
  );
}
