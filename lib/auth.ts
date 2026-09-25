import { cookies } from 'next/headers';
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { db } from './db';
const scrypt = promisify(scryptCb);
const COOKIE = 'lifepath_session';

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = await scrypt(password, salt, 64) as Buffer;
  const a = Buffer.from(hash, 'hex');
  return a.length === derived.length && timingSafeEqual(a, derived);
}
export function sha256(value: string) { return createHash('sha256').update(value).digest('hex'); }

export async function createSession(userId: string) {
  const raw = randomBytes(32).toString('base64url');
  const tokenHash = sha256(raw);
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const sql = db();
  await sql`INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (${userId},${tokenHash},${expires.toISOString()})`;
  const jar = await cookies();
  jar.set(COOKIE, raw, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires });
}
export async function deleteSession() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (raw) { const sql = db(); await sql`DELETE FROM sessions WHERE token_hash=${sha256(raw)}`; }
  jar.delete(COOKIE);
}
export async function currentUser() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const sql = db();
  const rows = await sql`SELECT u.id,u.email,u.role,p.first_name,p.last_name,p.grade,p.province,p.onboarding_complete
    FROM sessions s JOIN users u ON u.id=s.user_id LEFT JOIN learner_profiles p ON p.user_id=u.id
    WHERE s.token_hash=${sha256(raw)} AND s.expires_at > now() LIMIT 1`;
  return rows[0] ?? null;
}
export async function requireUser() {
  const u = await currentUser();
  if (!u) throw new Error('UNAUTHENTICATED');
  return u;
}
export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== 'admin') throw new Error('FORBIDDEN');
  return u;
}
export function roleForEmail(email: string) {
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
  return admins.includes(email.toLowerCase()) ? 'admin' : 'learner';
}
