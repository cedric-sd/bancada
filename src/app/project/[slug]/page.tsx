import Link from 'next/link';
import { notFound } from 'next/navigation';
import Board from '@/components/Board';
import Thumb from '@/components/Thumb';
import Stamp from '@/components/Stamp';
import Avatar from '@/components/Avatar';
import DarkButton from '@/components/DarkButton';
import VoteButton from '@/components/VoteButton';
import ReviewCard from '@/components/ReviewCard';
import DeleteProjectButton from '@/components/DeleteProjectButton';
import { getReviews } from '@/lib/data';
import { getProjectBySlug } from '@/lib/projects';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const statCell = (value: string, label: string, color = '#221c12') => (
  <div
    style={{
      background: '#efe6cd',
      border: '1px solid #cbb787',
      borderRadius: 8,
      padding: '11px 13px',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6)',
    }}
  >
    <div style={{ font: '900 19px var(--font-archivo)', color }}>{value}</div>
    <div
      style={{
        font: '600 8.5px var(--font-mono)',
        letterSpacing: '.1em',
        color: 'rgba(40,30,10,.55)',
        marginTop: 3,
      }}
    >
      {label}
    </div>
  </div>
);

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const project = getProjectBySlug(slug, user?.id);
  if (!project) notFound();
  const reviews = getReviews(slug);
  const devHandle = project.handle.replace(/^@/, '');
  const isOwner = !!user && project.ownerId === user.id;

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
        {isOwner ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href={`/project/${slug}/editar`} style={{ font: '600 11px var(--font-mono)', color: 'rgba(40,30,10,.6)' }}>
              editar
            </Link>
            <DeleteProjectButton slug={slug} name={project.name} />
          </div>
        ) : null}
      </div>

      <div
        style={{
          backgroundColor: '#f7efda',
          border: '1px solid #d8c79d',
          borderRadius: 10,
          boxShadow: '0 4px 0 rgba(0,0,0,.12),0 14px 30px rgba(0,0,0,.28)',
          padding: 22,
        }}
      >
        {/* hero */}
        <Thumb height={230} palette="warm" radius={6} stripe={12} label="screenshot principal · arraste aqui">
          <span
            style={{
              position: 'absolute',
              top: -9,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 120,
              height: 26,
              background: 'rgba(231,217,173,.55)',
              borderLeft: '1px dashed rgba(0,0,0,.14)',
              borderRight: '1px dashed rgba(0,0,0,.14)',
              boxShadow: '0 1px 3px rgba(0,0,0,.18)',
            }}
          />
          {project.badge ? (
            <Stamp label={project.badge} size="lg" rotate={-6} style={{ position: 'absolute', top: 12, right: 12 }} />
          ) : null}
        </Thumb>

        {/* title + actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginTop: 18 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ margin: 0, font: '900 30px/1 var(--font-archivo)', color: '#221c12', textShadow: '0 1px 0 rgba(255,255,255,.5)' }}>
                {project.name}
              </h1>
              <span style={{ font: '600 10px var(--font-mono)', color: 'rgba(40,30,10,.6)', border: '1px solid rgba(60,45,20,.3)', padding: '3px 8px', borderRadius: 5 }}>
                {project.cat}
              </span>
            </div>
            <Link href={`/dev/${devHandle}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 9 }}>
              <Avatar initials={project.author.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()} size={24} />
              <span style={{ font: '500 11px var(--font-mono)', color: 'rgba(40,30,10,.7)' }}>
                {project.author} · {project.handle}
              </span>
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 10, flex: 'none' }}>
            <VoteButton
              votes={project.votes}
              slug={project.slug}
              voted={project.voted}
              authed={!!user}
              variant="detail"
            />
            <DarkButton size="lg">
              ABRIR <span style={{ fontSize: 14 }}>↗</span>
            </DarkButton>
          </div>
        </div>

        {/* stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 18 }}>
          {statCell(`★ ${project.stars}`, 'STARS GITHUB')}
          {statCell(project.forks, 'FORKS')}
          {statCell(project.votes, 'VOTOS', '#b23a2a')}
          {statCell(project.xpForAuthor, 'XP P/ AUTOR', '#557a38')}
        </div>

        {/* description */}
        <p style={{ font: '400 15px/1.6 var(--font-news)', color: '#3f3a2e', margin: '18px 0 0', textWrap: 'pretty' }}>
          {project.description}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 14 }}>
          {project.tags.map((t) => (
            <span
              key={t}
              style={{
                font: '600 10px var(--font-mono)',
                color: 'rgba(40,30,10,.7)',
                background: '#e9dcbb',
                border: '1px solid #cbb787',
                padding: '4px 9px',
                borderRadius: 20,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* reviews */}
      {reviews.length > 0 ? (
        <div style={{ marginTop: 22 }}>
          <div style={{ font: '700 11px var(--font-mono)', letterSpacing: '.14em', color: 'rgba(40,30,10,.6)', marginBottom: 13 }}>
            REVIEWS DA COMUNIDADE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {reviews.map((r, i) => (
              <ReviewCard key={r.handle} review={r} rotate={i % 2 === 0 ? -0.4 : 0.5} />
            ))}
          </div>
        </div>
      ) : null}
    </Board>
  );
}
