import Link from 'next/link';
import type { Project } from '@/lib/data';
import type { Move } from '@/lib/weekly';
import { tierForLevel } from '@/lib/tiers';
import VoteButton from './VoteButton';
import Rating from './Rating';
import Movement from './Movement';

/**
 * Linha do placar (posições fora do pódio). Voto físico + rank gigante.
 */
export default function RankRow({
  project,
  authed,
  move,
}: {
  project: Project;
  authed: boolean;
  move?: Move;
}) {
  const tier = tierForLevel(project.lvl);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 16px',
        backgroundColor: '#f6eed8',
        backgroundImage:
          'repeating-linear-gradient(0deg,rgba(70,55,30,.016) 0 1px,transparent 1px 22px)',
        border: '1px solid #d8c79d',
        borderRadius: 10,
        boxShadow: '0 2px 0 rgba(0,0,0,.07),0 5px 12px rgba(0,0,0,.14)',
      }}
    >
      <div
        style={{
          font: '900 32px var(--font-archivo)',
          color: '#9a8050',
          textShadow: '0 1px 0 rgba(255,255,255,.5)',
          width: 46,
          textAlign: 'center',
          flex: 'none',
        }}
      >
        {project.rank}
      </div>

      <VoteButton
        votes={project.votes}
        slug={project.slug}
        voted={project.voted}
        authed={authed}
        variant="column"
      />

      <Link
        href={`/project/${project.slug}`}
        style={{
          width: 50,
          height: 50,
          borderRadius: 7,
          overflow: 'hidden',
          background:
            'repeating-linear-gradient(45deg,#d8c49a 0 7px,rgba(0,0,0,.05) 7px 14px)',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.1)',
          flex: 'none',
        }}
        aria-label={`Abrir ${project.name}`}
      >
        {project.hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/projects/${project.slug}/image`}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : null}
      </Link>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Link href={`/project/${project.slug}`} style={{ font: '900 17px var(--font-archivo)', color: '#221c12' }}>
            {project.name}
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
            {project.cat}
          </span>
          <Rating rating={project.rating} count={project.reviewCount} size={10} />
          <Movement move={move} />
        </div>
        <div style={{ font: '400 13px/1.3 var(--font-news)', color: '#5a4f3c', marginTop: 2 }}>
          {project.blurb}
        </div>
        <div style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.5)', marginTop: 3 }}>
          {project.author} ·{' '}
          <Link href={`/dev/${project.handle.replace(/^@/, '')}`} style={{ color: 'rgba(40,30,10,.5)' }}>
            {project.handle}
          </Link>
        </div>
      </div>

      <div style={{ textAlign: 'right', flex: 'none' }}>
        <div style={{ font: '800 13px var(--font-mono)', color: '#221c12' }}>★ {project.stars}</div>
        <div
          title={`Faixa ${tier.title}`}
          style={{
            display: 'inline-block',
            marginTop: 5,
            font: '700 9px var(--font-mono)',
            color: tier.accent,
            background: tier.chipBg,
            border: `1px solid ${tier.chipBorder}`,
            padding: '2px 7px',
            borderRadius: 5,
            boxShadow: tier.glow,
          }}
        >
          LVL {project.lvl}
        </div>
      </div>
    </div>
  );
}
