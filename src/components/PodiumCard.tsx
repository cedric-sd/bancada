import Link from 'next/link';
import type { Project } from '@/lib/data';
import VoteButton from './VoteButton';
import Stamp from './Stamp';
import Thumb from './Thumb';

const medals = {
  1: {
    bg: 'radial-gradient(circle at 35% 30%,#f4d98a,#d8a93a 60%,#a97f22)',
    color: '#5a4310',
  },
  2: {
    bg: 'radial-gradient(circle at 35% 30%,#e4e4e4,#b8b8b8 65%,#8f8f8f)',
    color: '#444',
  },
  3: {
    bg: 'radial-gradient(circle at 35% 30%,#e0a878,#bd7d42 65%,#8a5826)',
    color: '#3a2410',
  },
} as const;

/**
 * Card do pódio (1º, 2º, 3º). O 1º é destacado (maior e em papel mais claro).
 */
export default function PodiumCard({
  project,
  place,
  palette,
  note,
}: {
  project: Project;
  place: 1 | 2 | 3;
  palette: 'warm' | 'cool' | 'sage';
  note?: string;
}) {
  const featured = place === 1;
  const medal = medals[place];

  return (
    <Link
      href={`/project/${project.slug}`}
      className="card-link"
      style={{
        width: featured ? 250 : 230,
        backgroundColor: featured ? '#fbf3dd' : '#f6eed8',
        border: '1px solid #d8c79d',
        borderRadius: 10,
        padding: featured ? 16 : 14,
        boxShadow: featured
          ? '0 4px 0 rgba(0,0,0,.14),0 16px 32px rgba(0,0,0,.32)'
          : '0 3px 0 rgba(0,0,0,.12),0 12px 24px rgba(0,0,0,.25)',
        position: 'relative',
      }}
    >
      {featured ? (
        <div
          style={{
            position: 'absolute',
            top: -13,
            left: '50%',
            transform: 'translateX(-50%) rotate(-4deg)',
            font: '800 9px var(--font-archivo)',
            letterSpacing: '.1em',
            color: '#f3e6c8',
            background: '#b23a2a',
            padding: '4px 10px',
            borderRadius: 3,
            boxShadow: '0 2px 5px rgba(0,0,0,.35)',
          }}
        >
          {project.badge || 'TOP DA SEMANA'}
        </div>
      ) : null}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          margin: featured ? '6px 0 11px' : '0 0 10px',
        }}
      >
        <div
          style={{
            width: featured ? 40 : 34,
            height: featured ? 40 : 34,
            borderRadius: '50%',
            background: medal.bg,
            display: 'grid',
            placeItems: 'center',
            font: `900 ${featured ? 17 : 14}px var(--font-archivo)`,
            color: medal.color,
            boxShadow: '0 2px 4px rgba(0,0,0,.3),inset 0 1px 1px rgba(255,255,255,.6)',
          }}
        >
          {place}
        </div>
        {!featured && place === 2 ? (
          <Stamp label={project.badge || 'TRENDING'} color="#2f6d86" rotate={-4} />
        ) : (
          <span style={{ font: '500 9px var(--font-mono)', color: 'rgba(40,30,10,.55)' }}>
            {note}
          </span>
        )}
      </div>

      <Thumb height={featured ? 96 : 80} palette={palette} radius={4} />

      <div
        style={{
          font: `900 ${featured ? 22 : 18}px var(--font-archivo)`,
          color: '#221c12',
          marginTop: featured ? 11 : 10,
          textShadow: featured ? '0 1px 0 rgba(255,255,255,.5)' : undefined,
        }}
      >
        {project.name}
      </div>
      <div style={{ font: '400 12px/1.3 var(--font-news)', color: '#5a4f3c' }}>
        {project.blurb}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: featured ? 12 : 10,
        }}
      >
        <span style={{ font: `800 ${featured ? 12 : 11}px var(--font-mono)`, color: '#221c12' }}>
          ★ {project.stars}
        </span>
        <VoteButton votes={project.votes} variant={featured ? 'lg' : 'column'} />
      </div>
    </Link>
  );
}
