import Link from 'next/link';
import Board from '@/components/Board';
import Logo from '@/components/Logo';
import UserMenu from '@/components/UserMenu';
import GithubButton from '@/components/GithubButton';
import PodiumCard from '@/components/PodiumCard';
import RankRow from '@/components/RankRow';
import PlacarControls from '@/components/PlacarControls';
import MonthlyBanner from '@/components/MonthlyBanner';
import MissionsDrawer from '@/components/MissionsDrawer';
import { listProjects, type SortKey } from '@/lib/projects';
import { currentRace, monthlyMovementMap } from '@/lib/monthly';
import { getWeeklyMissions } from '@/lib/missions';
import { getCurrentUser } from '@/lib/auth';
import { categories } from '@/lib/data';

export const dynamic = 'force-dynamic';

const SORTS: SortKey[] = ['top', 'novos', 'alta'];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ ordem?: string; cat?: string; q?: string }>;
}) {
  const { ordem, cat, q } = await searchParams;
  const sort: SortKey = SORTS.includes(ordem as SortKey) ? (ordem as SortKey) : 'top';
  const query = (q ?? '').trim();
  const category = (cat ?? '').trim();

  const user = await getCurrentUser();
  const authed = !!user;
  const all = listProjects(user?.id, { sort, cat: category, q: query });
  const race = currentRace();
  const moves = monthlyMovementMap();
  const missions = user ? getWeeklyMissions(user.id) : [];

  // Pódio só na visão padrão (sem busca nem filtro de categoria).
  const filtering = !!query || (!!category && category !== 'Todos');
  const showPodium = !filtering;
  const podium = showPodium ? all.slice(0, 3) : [];
  const rest = showPodium ? all.slice(3) : all;
  const isTop = sort === 'top';

  return (
    <Board>
      {/* header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 22,
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <Logo subtitle="PLACAR DO MÊS" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <GithubButton href="https://github.com/cedric-sd" />
          <UserMenu user={user} />
        </div>
      </div>

      {/* ciclo mensal: líder atual + atalho para o Hall da Fama */}
      <MonthlyBanner race={race} />

      {/* missões da semana (só logado) — botão flutuante + drawer */}
      {authed ? <MissionsDrawer missions={missions} /> : null}

      {/* controles: ordenação, busca e categorias */}
      <div style={{ marginBottom: 10 }}>
        <PlacarControls categories={categories} />
      </div>
      <div style={{ textAlign: 'right', marginBottom: 18 }}>
        <Link href="/categorias" style={{ font: '600 10px var(--font-mono)', color: 'rgba(40,30,10,.6)' }}>
          rankings por categoria →
        </Link>
      </div>

      {/* podium (visão padrão) */}
      {showPodium ? (
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
          {podium[1] ? (
            <PodiumCard project={podium[1]} place={2} palette="cool" authed={authed} move={moves[podium[1].slug]} />
          ) : null}
          {podium[0] ? (
            <PodiumCard
              project={podium[0]}
              place={1}
              palette="warm"
              note={isTop ? 'líder · 3 meses' : undefined}
              authed={authed}
              move={moves[podium[0].slug]}
            />
          ) : null}
          {podium[2] ? (
            <PodiumCard
              project={podium[2]}
              place={3}
              palette="sage"
              note={isTop ? 'IA · CLI' : undefined}
              authed={authed}
              move={moves[podium[2].slug]}
            />
          ) : null}
        </div>
      ) : (
        <div style={{ font: '600 11px var(--font-mono)', color: 'rgba(40,30,10,.6)', marginBottom: 12 }}>
          {all.length} resultado{all.length === 1 ? '' : 's'}
          {category && category !== 'Todos' ? ` · ${category}` : ''}
          {query ? ` · "${query}"` : ''}
        </div>
      )}

      {/* lista */}
      {rest.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {rest.map((p) => (
            <RankRow key={p.slug} project={p} authed={authed} move={moves[p.slug]} />
          ))}
        </div>
      ) : !showPodium ? (
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
          Nenhum projeto encontrado com esses filtros.
        </div>
      ) : null}

      {/* rodapé discreto: versão do app (lida do package.json em build-time) */}
      {process.env.APP_VERSION ? (
        <footer
          style={{
            textAlign: 'center',
            marginTop: 30,
            font: '500 9px var(--font-mono)',
            letterSpacing: '.1em',
            color: 'rgba(40,30,10,.3)',
          }}
        >
          v{process.env.APP_VERSION}
        </footer>
      ) : null}
    </Board>
  );
}
