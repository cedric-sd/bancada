import Link from 'next/link';
import Avatar from '@/components/Avatar';
import DarkButton from '@/components/DarkButton';
import LogoutButton from '@/components/LogoutButton';
import type { User } from '@/lib/auth';

/**
 * Cabeçalho de conta: mostra o usuário logado (chip + sair + publicar) ou os
 * botões de entrar/publicar quando deslogado.
 */
export default function UserMenu({ user }: { user: User | null }) {
  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link
          href="/entrar"
          className="press"
          style={{
            font: '800 11px var(--font-mono)',
            color: '#221c12',
            background: '#efe6cd',
            border: '1px solid #bfa873',
            borderRadius: 9,
            padding: '9px 14px',
            boxShadow: '0 2px 0 rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.6)',
          }}
        >
          Entrar
        </Link>
        <DarkButton href="/publicar">+ Publicar</DarkButton>
      </div>
    );
  }

  const handleSlug = user.handle.replace(/^@/, '');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div
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
        <Link href={`/dev/${handleSlug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Avatar
            initials={user.initials}
            size={26}
            src={user.hasAvatar ? `/api/users/${handleSlug}/avatar` : undefined}
          />
          <div>
            <div style={{ font: '800 11px/1 var(--font-archivo)', color: '#221c12' }}>{user.name}</div>
            <div style={{ font: '500 8.5px/1 var(--font-mono)', color: 'rgba(40,30,10,.55)', marginTop: 2 }}>
              {user.handle}
            </div>
          </div>
        </Link>
        <span style={{ width: 1, height: 20, background: 'rgba(60,45,20,.2)' }} />
        <LogoutButton />
      </div>
      <DarkButton href="/publicar">+ Publicar</DarkButton>
    </div>
  );
}
