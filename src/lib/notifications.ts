import { getDb } from './db';

export type NotificationKind = 'vote' | 'review';

type Row = {
  id: number;
  kind: string;
  project_slug: string | null;
  project_name: string | null;
  actor: string | null;
  meta: string | null;
  read: number;
  created_at: string;
};

export type Notification = {
  id: number;
  kind: NotificationKind;
  projectSlug: string | null;
  projectName: string | null;
  actor: string | null;
  meta: Record<string, unknown>;
  read: boolean;
  createdAt: string;
};

/** Como uma notificação é apresentada na lista (ícone + texto + link). Puro. */
export type NotificationView = Notification & {
  icon: string;
  title: string;
  href: string | null;
};

function parseMeta(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function toNotification(row: Row): Notification {
  return {
    id: row.id,
    kind: (row.kind as NotificationKind) ?? 'vote',
    projectSlug: row.project_slug,
    projectName: row.project_name,
    actor: row.actor,
    meta: parseMeta(row.meta),
    read: !!row.read,
    createdAt: row.created_at,
  };
}

/** Monta ícone, texto e link de uma notificação — sem tocar no banco. */
export function describeNotification(n: Notification): NotificationView {
  const who = n.actor ?? 'Alguém';
  const proj = n.projectName ?? 'seu projeto';
  const href = n.projectSlug ? `/project/${n.projectSlug}` : null;

  if (n.kind === 'review') {
    const stars = Number(n.meta.stars) || 0;
    const label = stars > 0 ? `${'★'.repeat(stars)} ` : '';
    return {
      ...n,
      icon: '★',
      title: `${who} avaliou ${proj} — ${label}${stars}/5`,
      href,
    };
  }

  // vote (padrão)
  return {
    ...n,
    icon: '▲',
    title: `${who} votou em ${proj}`,
    href,
  };
}

/** Insere uma notificação para o usuário `userId`. */
export function notify(input: {
  userId: number;
  kind: NotificationKind;
  projectSlug?: string | null;
  projectName?: string | null;
  actor?: string | null;
  meta?: Record<string, unknown>;
}): void {
  getDb()
    .prepare(
      `INSERT INTO notifications (user_id, kind, project_slug, project_name, actor, meta)
       VALUES (@userId, @kind, @projectSlug, @projectName, @actor, @meta)`,
    )
    .run({
      userId: input.userId,
      kind: input.kind,
      projectSlug: input.projectSlug ?? null,
      projectName: input.projectName ?? null,
      actor: input.actor ?? null,
      meta: input.meta ? JSON.stringify(input.meta) : null,
    });
}

type ProjectActor = { ownerId: number | null; name: string; slug: string };

function projectActorInfo(projectId: number): ProjectActor | undefined {
  const row = getDb()
    .prepare('SELECT owner_id AS ownerId, name, slug FROM projects WHERE id = ?')
    .get(projectId) as { ownerId: number | null; name: string; slug: string } | undefined;
  return row;
}

function userName(userId: number): string | null {
  const row = getDb().prepare('SELECT name FROM users WHERE id = ?').get(userId) as
    | { name: string }
    | undefined;
  return row?.name ?? null;
}

/**
 * Notifica o dono de um projeto sobre um evento causado por `actorId`. Não
 * notifica projetos sem dono nem quando o autor da ação é o próprio dono.
 */
export function notifyProjectEvent(
  projectId: number,
  actorId: number,
  kind: NotificationKind,
  meta?: Record<string, unknown>,
): void {
  const proj = projectActorInfo(projectId);
  if (!proj || proj.ownerId === null || proj.ownerId === actorId) return;
  notify({
    userId: proj.ownerId,
    kind,
    projectSlug: proj.slug,
    projectName: proj.name,
    actor: userName(actorId),
    meta,
  });
}

/** Quantidade de notificações não lidas do usuário. */
export function unreadCount(userId: number): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read = 0')
    .get(userId) as { n: number };
  return row.n;
}

/** Lista as notificações do usuário (mais recentes primeiro), já apresentáveis. */
export function listNotifications(userId: number, limit = 50): NotificationView[] {
  const rows = getDb()
    .prepare(
      `SELECT id, kind, project_slug, project_name, actor, meta, read, created_at
       FROM notifications WHERE user_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT ?`,
    )
    .all(userId, limit) as Row[];
  return rows.map((r) => describeNotification(toNotification(r)));
}

/** Marca todas as notificações do usuário como lidas. */
export function markAllRead(userId: number): void {
  getDb().prepare('UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0').run(userId);
}
