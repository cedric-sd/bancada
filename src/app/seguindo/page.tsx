import Link from 'next/link';
import { redirect } from 'next/navigation';
import Board from '@/components/Board';
import VoteButton from '@/components/VoteButton';
import Rating from '@/components/Rating';
import { listFollowingFeed } from '@/lib/projects';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function SeguindoPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/entrar?next=/seguindo');

  const feed = listFollowingFeed(user.id);

  return (
    <Board maxWidth={720}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/" style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.6)' }}>
          ‹ voltar ao placar
        </Link>
      </div>

      <h1
        style={{
          margin: '0 0 4px',
          font: '900 26px/1 var(--font-archivo)',
          color: '#221c12',
          textShadow: '0 1px 0 rgba(255,255,255,.4)',
        }}
      >
        Seguindo
      </h1>
      <div style={{ font: '500 10px/1 var(--font-mono)', letterSpacing: '.14em', color: 'rgba(40,30,10,.6)', marginBottom: 20 }}>
        PROJETOS DOS DEVS QUE VOCÊ SEGUE
      </div>

      {feed.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {feed.map((p) => (
            <div
              key={p.slug}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 15px',
                backgroundColor: '#f6eed8',
                border: '1px solid #d8c79d',
                borderRadius: 10,
                boxShadow: '0 2px 0 rgba(0,0,0,.07),0 5px 12px rgba(0,0,0,.14)',
              }}
            >
              <VoteButton votes={p.votes} slug={p.slug} voted={p.voted} authed variant="column" />

              <Link
                href={`/project/${p.slug}`}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 7,
                  overflow: 'hidden',
                  background: 'repeating-linear-gradient(45deg,#d8c49a 0 7px,rgba(0,0,0,.05) 7px 14px)',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.1)',
                  flex: 'none',
                }}
                aria-label={`Abrir ${p.name}`}
              >
                {p.hasImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/projects/${p.slug}/image`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : null}
              </Link>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                  <Link href={`/project/${p.slug}`} style={{ font: '900 17px var(--font-archivo)', color: '#221c12' }}>
                    {p.name}
                  </Link>
                  <span
                    style={{
                      font: '500 9px var(--font-mono)',
                      letterSpacing: '.06em',
                      color: 'rgba(40,30,10,.55)',
                      border: '1px solid rgba(60,45,20,.25)',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}
                  >
                    {p.cat}
                  </span>
                  <Rating rating={p.rating} count={p.reviewCount} size={10} />
                </div>
                <div style={{ font: '400 13px/1.3 var(--font-news)', color: '#5a4f3c', marginTop: 2 }}>{p.blurb}</div>
                <div style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.5)', marginTop: 3 }}>
                  <Link href={`/dev/${p.handle.replace(/^@/, '')}`} style={{ color: 'rgba(40,30,10,.5)' }}>
                    {p.author} · {p.handle}
                  </Link>
                </div>
              </div>

              <div style={{ font: '800 13px var(--font-mono)', color: '#221c12', flex: 'none' }}>★ {p.stars}</div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            font: '400 15px/1.6 var(--font-news)',
            color: '#5a4f3c',
            background: '#f7efda',
            border: '1px dashed #cbb787',
            borderRadius: 10,
            padding: '30px 22px',
            textAlign: 'center',
          }}
        >
          Você ainda não segue ninguém — ou quem você segue ainda não publicou.
          Abra o perfil de um dev e toque em <b>Seguir</b> para acompanhar os
          projetos dele aqui.
        </div>
      )}
    </Board>
  );
}
