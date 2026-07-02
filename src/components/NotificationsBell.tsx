import Link from 'next/link';
import { unreadCount } from '@/lib/notifications';

/**
 * Sino de notificações no header: leva para /notificacoes e mostra um selo com
 * a contagem de não-lidas quando houver. Server Component (lê direto do banco).
 */
export default function NotificationsBell({ userId }: { userId: number }) {
  const unread = unreadCount(userId);

  return (
    <Link
      href="/notificacoes"
      aria-label={unread > 0 ? `Notificações (${unread} não lidas)` : 'Notificações'}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 38,
        height: 38,
        borderRadius: 9,
        background: '#efe6cd',
        border: '1px solid #bfa873',
        boxShadow: '0 2px 0 rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.6)',
        flex: 'none',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 9a6 6 0 1112 0c0 4 1.2 5.5 2 6.4.4.5.1 1.3-.6 1.3H4.6c-.7 0-1-.8-.6-1.3.8-.9 2-2.4 2-6.4z"
          fill="#3a3022"
          stroke="#3a3022"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M9.5 20a2.5 2.5 0 005 0" stroke="#3a3022" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {unread > 0 ? (
        <span
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            minWidth: 18,
            height: 18,
            padding: '0 4px',
            borderRadius: 9,
            background: '#b23a2a',
            border: '1.5px solid #f3ead2',
            color: '#fff',
            font: '800 10px/16px var(--font-mono)',
            textAlign: 'center',
            boxShadow: '0 1px 2px rgba(0,0,0,.35)',
          }}
        >
          {unread > 9 ? '9+' : unread}
        </span>
      ) : null}
    </Link>
  );
}
