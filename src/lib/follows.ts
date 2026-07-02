import { getDb } from './db';

/** Segue um dev. Ignora auto-seguir. Retorna true se passou a seguir agora. */
export function followUser(followerId: number, followingId: number): boolean {
  if (followerId === followingId) return false;
  const info = getDb()
    .prepare('INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)')
    .run(followerId, followingId);
  return info.changes > 0;
}

/** Deixa de seguir um dev. */
export function unfollowUser(followerId: number, followingId: number): void {
  getDb().prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(followerId, followingId);
}

export function isFollowing(followerId: number, followingId: number): boolean {
  return !!getDb()
    .prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?')
    .get(followerId, followingId);
}

/** Contagens de seguidores e de quem o usuário segue. */
export function followCounts(userId: number): { followers: number; following: number } {
  const db = getDb();
  const followers = (db.prepare('SELECT COUNT(*) AS n FROM follows WHERE following_id = ?').get(userId) as { n: number }).n;
  const following = (db.prepare('SELECT COUNT(*) AS n FROM follows WHERE follower_id = ?').get(userId) as { n: number }).n;
  return { followers, following };
}
