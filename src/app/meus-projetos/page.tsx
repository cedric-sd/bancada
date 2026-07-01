import Link from 'next/link';
import { redirect } from 'next/navigation';
import Board from '@/components/Board';
import DarkButton from '@/components/DarkButton';
import DeleteProjectButton from '@/components/DeleteProjectButton';
import { listProjectsByOwner } from '@/lib/projects';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function MeusProjetosPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/entrar?next=/meus-projetos');

  const projects = listProjectsByOwner(user.id);

  return (
    <Board maxWidth={740}>
      {/* header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 18,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <Link href="/" style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.6)' }}>
            ‹ voltar ao placar
          </Link>
          <h1 style={{ margin: '8px 0 0', font: '900 26px/1 var(--font-archivo)', color: '#221c12', textShadow: '0 1px 0 rgba(255,255,255,.5)' }}>
            Meus projetos
          </h1>
          <div style={{ font: '500 11px var(--font-mono)', color: 'rgba(40,30,10,.55)', marginTop: 5 }}>
            {projects.length} publicado{projects.length === 1 ? '' : 's'} · {user.handle}
          </div>
        </div>
        <DarkButton href="/publicar">+ Publicar</DarkButton>
      </div>

      {projects.length === 0 ? (
        <div
          style={{
            backgroundColor: '#f7efda',
            border: '1px dashed #cbb787',
            borderRadius: 10,
            padding: '34px 24px',
            textAlign: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6)',
          }}
        >
          <div style={{ font: '400 15px/1.5 var(--font-news)', color: '#5a4f3c' }}>
            Você ainda não publicou nada na bancada.
          </div>
          <div style={{ marginTop: 14 }}>
            <DarkButton href="/publicar">Publicar seu primeiro projeto</DarkButton>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {projects.map((p) => (
            <div
              key={p.slug}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 15px',
                backgroundColor: '#f6eed8',
                border: '1px solid #d8c79d',
                borderRadius: 9,
                boxShadow: '0 2px 0 rgba(0,0,0,.06),0 4px 10px rgba(0,0,0,.12)',
                flexWrap: 'wrap',
              }}
            >
              <Link
                href={`/project/${p.slug}`}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: 'repeating-linear-gradient(45deg,#d8c49a 0 7px,rgba(0,0,0,.05) 7px 14px)',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.1)',
                  flex: 'none',
                }}
                aria-label={`Abrir ${p.name}`}
              >
                {p.hasImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/projects/${p.slug}/image`}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : null}
              </Link>

              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Link href={`/project/${p.slug}`} style={{ font: '800 15px var(--font-archivo)', color: '#221c12' }}>
                    {p.name}
                  </Link>
                  <span
                    style={{
                      font: '500 9px var(--font-mono)',
                      color: 'rgba(40,30,10,.55)',
                      border: '1px solid rgba(60,45,20,.25)',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}
                  >
                    {p.cat}
                  </span>
                </div>
                <div style={{ font: '500 11px var(--font-mono)', color: 'rgba(40,30,10,.55)', marginTop: 4 }}>
                  #{p.rank} no placar · ★ {p.stars} · ▲ {p.votes}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 'none' }}>
                <Link href={`/project/${p.slug}/editar`} style={{ font: '600 11px var(--font-mono)', color: 'rgba(40,30,10,.6)' }}>
                  editar
                </Link>
                <DeleteProjectButton slug={p.slug} name={p.name} redirectTo="/meus-projetos" />
              </div>
            </div>
          ))}
        </div>
      )}
    </Board>
  );
}
