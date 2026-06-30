import Link from 'next/link';
import Board from '@/components/Board';
import Logo from '@/components/Logo';
import DarkButton from '@/components/DarkButton';
import Avatar from '@/components/Avatar';
import PodiumCard from '@/components/PodiumCard';
import RankRow from '@/components/RankRow';
import { podium, rest, devs } from '@/lib/data';

export default function Home() {
  const me = devs.marakt;

  return (
    <Board>
      {/* header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <Logo subtitle="PLACAR DA SEMANA" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link
            href={`/dev/${me.handle.replace(/^@/, '')}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#efe6cd',
              border: '1px solid #bfa873',
              borderRadius: 9,
              padding: '6px 12px 6px 8px',
              boxShadow: '0 2px 0 rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.6)',
            }}
          >
            <Avatar initials={me.initials} size={26} />
            <div>
              <div style={{ font: '800 11px/1 var(--font-archivo)', color: '#221c12' }}>
                Nível {me.level}
              </div>
              <div
                style={{
                  font: '500 8.5px/1 var(--font-mono)',
                  color: 'rgba(40,30,10,.55)',
                  marginTop: 2,
                }}
              >
                {me.xp.toLocaleString('pt-BR')} XP
              </div>
            </div>
          </Link>
          <DarkButton>+ Publicar</DarkButton>
        </div>
      </div>

      {/* podium */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 16,
          marginBottom: 26,
          flexWrap: 'wrap',
        }}
      >
        <PodiumCard project={podium[1]} place={2} palette="cool" />
        <PodiumCard project={podium[0]} place={1} palette="warm" note="líder · 3 sem." />
        <PodiumCard project={podium[2]} place={3} palette="sage" note="IA · CLI" />
      </div>

      {/* ranked list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {rest.map((p) => (
          <RankRow key={p.slug} project={p} />
        ))}
      </div>
    </Board>
  );
}
