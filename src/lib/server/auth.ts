/** Anmeldung: Passwort-Hash (scrypt), Sitzungs-Token, Sperre nach Fehlversuchen, Regeln für Passwörter. */
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { MANAGEMENT, type Role, type SessionUser, type Store } from './store.ts';

export const COOKIE = 'resch_session';
/** Sitzungs-Cookie: bei weiteren Betrieben "<betriebs-id>.<token>", beim Hauptbetrieb nur das Token */
export function parseSessionCookie(raw: string | undefined): { tenant: string; token: string } | null {
	if (!raw) return null;
	const i = raw.indexOf('.');
	return i < 0 ? { tenant: 'main', token: raw } : { tenant: raw.slice(0, i), token: raw.slice(i + 1) };
}
export const sessionCookieValue = (tenant: string, token: string) => tenant === 'main' ? token : `${tenant}.${token}`;
export const MAX_FAILS = 5;
export const LOCK_MS = 15 * 60_000;
export const TTL_MS: Record<'management' | 'staff', number> = { management: 12 * 3600_000, staff: 30 * 86_400_000 };

const sha = (s: string) => createHash('sha256').update(s).digest('hex');
export const hashToken = sha;

export function hashPassword(pw: string): string {
	const salt = randomBytes(16);
	const key = scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 });
	return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}
export function verifyPassword(pw: string, stored: string): boolean {
	const [alg, saltB, keyB] = stored.split('$');
	if (alg !== 'scrypt' || !saltB || !keyB) return false;
	const key = Buffer.from(keyB, 'base64');
	const test = scryptSync(pw, Buffer.from(saltB, 'base64'), key.length, { N: 16384, r: 8, p: 1 });
	return test.length === key.length && timingSafeEqual(test, key);
}
// Beim Anmelden mit unbekanntem Namen trotzdem rechnen, damit die Antwortzeit nichts verrät
const DUMMY = hashPassword('dummy-password-for-timing');

/** Mindestanforderung für selbst gewählte Passwörter (Inhaber/Büro: 12 Zeichen, Mitarbeitende: 8) */
export function passwordIssue(pw: string, role: Role): string | null {
	const min = role === 'mitarbeiter' ? 8 : 12;
	if (pw.length < min) return `Das Passwort braucht mindestens ${min} Zeichen.`;
	if (/^(.)\1+$/.test(pw)) return 'Das Passwort ist zu einfach.';
	return null;
}
/** Einmal-Code für neue Zugänge: gut lesbar (ohne 0/O/1/I/l), 10 Zeichen, ausreichend zufällig. */
export function oneTimeCode(): string {
	const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
	const b = randomBytes(10);
	return [...b].map((x) => alphabet[x % alphabet.length]).join('');
}
export const isManagement = (r: Role) => MANAGEMENT.includes(r);

export type LoginResult = { ok: true; token: string; user: SessionUser } | { ok: false; reason: 'invalid' | 'locked' | 'ratelimit' };

// Einfache Begrenzung je IP im Speicher: 30 Versuche in 10 Minuten
const hits = new Map<string, number[]>();
export function rateLimited(ip: string, now = Date.now()): boolean {
	const arr = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
	arr.push(now);
	hits.set(ip, arr);
	return arr.length > 30;
}
export const resetRateLimit = () => hits.clear();

// IP-Adressen im Protokoll werden höchstens einmal am Tag bereinigt (beim Anmelden angestoßen)
const trimmed = new WeakMap<Store, number>();
function trimAuditDaily(store: Store, now: number) {
	if (now - (trimmed.get(store) ?? 0) < 86_400_000) return;
	trimmed.set(store, now);
	try { store.trimAudit(undefined, now); } catch { /* Bereinigung ist nicht kritisch */ }
}

export function login(store: Store, loginName: string, password: string, ip: string, now = Date.now()): LoginResult {
	trimAuditDaily(store, now);
	if (rateLimited(ip, now)) { store.audit('login_ratelimit', null, loginName.slice(0, 60), ip); return { ok: false, reason: 'ratelimit' }; }
	const u = store.userByLogin(loginName.trim());
	if (!u) { verifyPassword(password, DUMMY); store.audit('login_fail', null, `unbekannt: ${loginName.slice(0, 60)}`, ip); return { ok: false, reason: 'invalid' }; }
	if (u.locked_until > now) { store.audit('login_locked', u.id, '', ip); return { ok: false, reason: 'locked' }; }
	const ok = verifyPassword(password, u.pw_hash) && !u.disabled;
	if (!ok) { store.recordFailure(u.id, MAX_FAILS, LOCK_MS); store.audit('login_fail', u.id, u.disabled ? 'gesperrt' : '', ip); return { ok: false, reason: 'invalid' }; }
	store.clearFailures(u.id);
	const token = randomBytes(32).toString('base64url');
	store.createSession(hashToken(token), u.id, TTL_MS[isManagement(u.role) ? 'management' : 'staff']);
	store.audit('login', u.id, '', ip);
	return { ok: true, token, user: { id: u.id, login: u.login, display: u.display, role: u.role, employeeId: u.employee_id, mustChange: !!u.must_change } };
}
