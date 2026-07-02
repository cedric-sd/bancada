import Link from 'next/link';
import { redirect } from 'next/navigation';
import Board from '@/components/Board';
import PublicarForm from '@/components/PublicarForm';
import { getCurrentUser, getGithubLogin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function PublicarPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/entrar?next=/publicar');

  const hasGithub = !!getGithubLogin(user.id);

  return (
    <Board maxWidth={740}>
      <Link
        href="/"
        style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.6)', display: 'inline-block', marginBottom: 14 }}
      >
        ‹ voltar ao placar
      </Link>
      <PublicarForm hasGithub={hasGithub} />
    </Board>
  );
}
