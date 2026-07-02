import Link from 'next/link';
import Board from '@/components/Board';
import AuthForm from '@/components/AuthForm';
import { githubConfigured } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function CadastrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; erro?: string }>;
}) {
  const { next, erro } = await searchParams;
  return (
    <Board maxWidth={520}>
      <Link
        href="/"
        style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.6)', display: 'inline-block', marginBottom: 14 }}
      >
        ‹ voltar ao placar
      </Link>
      <AuthForm mode="register" next={next} githubEnabled={githubConfigured()} initialError={erro} />
    </Board>
  );
}
