import Link from 'next/link';
import { redirect } from 'next/navigation';
import Board from '@/components/Board';
import { getCurrentUser } from '@/lib/auth';
import { listNotifications, markAllRead, type NotificationView } from '@/lib/notifications';
import { fromSqliteUtc } from '@/lib/week';

export const dynamic = 'force-dynamic';

/** "agora", "há 5min", "há 3h", "há 2d" a partir de um timestamp do SQLite (UTC). */
function timeAgo(createdAt: string): string {
  const ms = Date.now() - fromSqliteUtc(createdAt).getTime();
  if (ms < 60_000) return 'agora';
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `há ${min}min`;
  const h = Math.floor(ms / 3_600_000);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(ms / 86_400_000);
  return `há ${d}d`;
}

function Item({ n }: { n: NotificationView }) {
  const inner = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: '13px 15px',
        background: n.read ? '#f6eed8' : '#fbf4e2',
        border: `1px solid ${n.read ? '#d8c79d' : '#e0b95e'}`,
        borderRadius: 10,
        boxShadow: '0 2px 0 rgba(0,0,0,.06),0 4px 10px rgba(0,0,0,.1)',
      }}
    >
      <span
        style={{
          flex: 'none',
          width: 34,
          height: 34,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          font: '700 15px var(--font-mono)',
          color: n.kind === 'review' ? '#c8951f' : '#4f8a3a',
          background: n.kind === 'review' ? '#f6eccb' : '#e4ecca',
          border: `1px solid ${n.kind === 'review' ? '#e3c877' : '#b8cf8f'}`,
        }}
      >
        {n.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '500 14px/1.4 var(--font-news)', color: '#2f2a1e' }}>{n.title}</div>
        <div style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.5)', marginTop: 3 }}>
          {timeAgo(n.createdAt)}
        </div>
      </div>
      {!n.read ? (
        <span style={{ flex: 'none', width: 8, height: 8, borderRadius: '50%', background: '#b23a2a' }} />
      ) : null}
    </div>
  );

  return n.href ? (
    <Link href={n.href} style={{ display: 'block' }}>
      {inner}
    </Link>
  ) : (
    inner
  );
}

export default async function NotificacoesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/entrar?next=/notificacoes');

  // Lê antes de marcar como lidas — assim as novas aparecem destacadas nesta visita.
  const items = listNotifications(user.id);
  markAllRead(user.id);

  return (
    <Board maxWidth={640}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <Link href="/" style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.6)' }}>
          ‹ voltar ao placar
        </Link>
      </div>

      <h1
        style={{
          margin: '0 0 4px',
          font: '900 26px/1 var(--font-archivo)',
          color: '#221c12',
          textShadow: '0 1px 0 rgba(255,255,255,.4)',
        }}
      >
        Notificações
      </h1>
      <div
        style={{
          font: '500 10px/1 var(--font-mono)',
          letterSpacing: '.14em',
          color: 'rgba(40,30,10,.6)',
          marginBottom: 20,
        }}
      >
        O QUE ANDA ACONTECENDO COM OS SEUS PROJETOS
      </div>

      {items.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((n) => (
            <Item key={n.id} n={n} />
          ))}
        </div>
      ) : (
        <div
          style={{
            font: '400 15px/1.6 var(--font-news)',
            color: '#5a4f3c',
            background: '#f7efda',
            border: '1px dashed #cbb787',
            borderRadius: 10,
            padding: '30px 22px',
            textAlign: 'center',
          }}
        >
          Nada por aqui ainda. Quando alguém votar ou avaliar um projeto seu, você
          fica sabendo primeiro.
        </div>
      )}
    </Board>
  );
}
