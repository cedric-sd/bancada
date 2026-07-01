import Link from 'next/link';
import { redirect } from 'next/navigation';
import Board from '@/components/Board';
import ProfileForm from '@/components/ProfileForm';
import { getAccount, getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function EditarPerfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/entrar?next=/perfil/editar');

  const account = getAccount(user.id)!;
  const handle = account.handle.replace(/^@/, '');

  return (
    <Board maxWidth={520}>
      <Link
        href={`/dev/${handle}`}
        style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.6)', display: 'inline-block', marginBottom: 14 }}
      >
        ‹ voltar ao perfil
      </Link>
      <ProfileForm handle={handle} initialName={account.name} initialBio={account.bio} />
    </Board>
  );
}
