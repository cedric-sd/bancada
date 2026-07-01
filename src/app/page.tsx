import Board from '@/components/Board';
import Logo from '@/components/Logo';
import UserMenu from '@/components/UserMenu';
import PodiumCard from '@/components/PodiumCard';
import RankRow from '@/components/RankRow';
import SortTabs from '@/components/SortTabs';
import { listProjects, type SortKey } from '@/lib/projects';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const SORTS: SortKey[] = ['top', 'novos', 'alta'];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ ordem?: string }>;
}) {
  const { ordem } = await searchParams;
  const sort: SortKey = SORTS.includes(ordem as SortKey) ? (ordem as SortKey) : 'top';

  const user = await getCurrentUser();
  const authed = !!user;
  const all = listProjects(user?.id, sort);
  const podium = all.slice(0, 3);
  const rest = all.slice(3);
  const isTop = sort === 'top';

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
        <UserMenu user={user} />
      </div>

      {/* sort tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
        <SortTabs active={sort} />
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
        {podium[1] ? <PodiumCard project={podium[1]} place={2} palette="cool" authed={authed} /> : null}
        {podium[0] ? (
          <PodiumCard
            project={podium[0]}
            place={1}
            palette="warm"
            note={isTop ? 'líder · 3 sem.' : undefined}
            authed={authed}
          />
        ) : null}
        {podium[2] ? (
          <PodiumCard project={podium[2]} place={3} palette="sage" note={isTop ? 'IA · CLI' : undefined} authed={authed} />
        ) : null}
      </div>

      {/* ranked list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {rest.map((p) => (
          <RankRow key={p.slug} project={p} authed={authed} />
        ))}
      </div>
    </Board>
  );
}
