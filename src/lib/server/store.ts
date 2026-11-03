/**
 * Serverseitiger Speicher (SQLite, eine Datei). Enthält den Datenbestand, Zugänge, Sitzungen und ein Protokoll.
 * Die Datenbank liegt unter `data/resch.db` (Umgebungsvariable RESCH_DB überschreibt den Pfad).
 * Für den Betrieb mit mehreren Servern oder größerem Umfang ist der Umstieg auf PostgreSQL vorgesehen.
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type Role = 'inhaber' | 'buero' | 'objektleitung' | 'mitarbeiter';
export const MANAGEMENT: Role[] = ['inhaber', 'buero', 'objektleitung'];
export interface UserRow { id: string; login: string; display: string; role: Role; employee_id: string | null; pw_hash: string; must_change: number; disabled: number; created_at: string; failed: number; locked_until: number }
export interface SessionUser { id: string; login: string; display: string; role: Role; employeeId: string | null; mustChange: boolean }

export function openStore(path = process.env.RESCH_DB ?? 'data/resch.db') {
	if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
	const db = new DatabaseSync(path);
	db.exec(`
		PRAGMA journal_mode = WAL;
		PRAGMA foreign_keys = ON;
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY, login TEXT NOT NULL UNIQUE COLLATE NOCASE, display TEXT NOT NULL, role TEXT NOT NULL,
			employee_id TEXT, pw_hash TEXT NOT NULL, must_change INTEGER NOT NULL DEFAULT 0, disabled INTEGER NOT NULL DEFAULT 0,
			created_at TEXT NOT NULL, failed INTEGER NOT NULL DEFAULT 0, locked_until INTEGER NOT NULL DEFAULT 0
		);
		CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL
		);
		CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY CHECK (id = 1), json TEXT NOT NULL, rev INTEGER NOT NULL, updated_at TEXT NOT NULL);
		CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, user_id TEXT, action TEXT NOT NULL, detail TEXT, ip TEXT);
	`);
	const now = () => Date.now();
	const iso = () => new Date().toISOString();

	return {
		raw: db,
		userCount: () => (db.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number }).n,
		userByLogin: (login: string) => db.prepare('SELECT * FROM users WHERE login = ?').get(login) as UserRow | undefined,
		userById: (id: string) => db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined,
		userByEmployee: (employeeId: string) => db.prepare('SELECT * FROM users WHERE employee_id = ?').get(employeeId) as UserRow | undefined,
		listUsers: () => db.prepare('SELECT id, login, display, role, employee_id, must_change, disabled, created_at, locked_until FROM users ORDER BY created_at').all() as Omit<UserRow, 'pw_hash' | 'failed'>[],
		insertUser: (u: { id: string; login: string; display: string; role: Role; employeeId: string | null; pwHash: string; mustChange: boolean }) =>
			db.prepare('INSERT INTO users (id, login, display, role, employee_id, pw_hash, must_change, created_at) VALUES (?,?,?,?,?,?,?,?)').run(u.id, u.login, u.display, u.role, u.employeeId, u.pwHash, u.mustChange ? 1 : 0, iso()),
		setPassword: (id: string, pwHash: string, mustChange: boolean) => db.prepare('UPDATE users SET pw_hash = ?, must_change = ?, failed = 0, locked_until = 0 WHERE id = ?').run(pwHash, mustChange ? 1 : 0, id),
		setDisabled: (id: string, disabled: boolean) => db.prepare('UPDATE users SET disabled = ? WHERE id = ?').run(disabled ? 1 : 0, id),
		deleteUser: (id: string) => db.prepare('DELETE FROM users WHERE id = ?').run(id),
		recordFailure: (id: string, max: number, lockMs: number) => {
			db.prepare('UPDATE users SET failed = failed + 1 WHERE id = ?').run(id);
			const u = db.prepare('SELECT failed FROM users WHERE id = ?').get(id) as { failed: number };
			if (u.failed >= max) db.prepare('UPDATE users SET locked_until = ?, failed = 0 WHERE id = ?').run(now() + lockMs, id);
		},
		clearFailures: (id: string) => db.prepare('UPDATE users SET failed = 0, locked_until = 0 WHERE id = ?').run(id),

		createSession: (hash: string, userId: string, ttlMs: number) => db.prepare('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?,?,?,?)').run(hash, userId, now(), now() + ttlMs),
		sessionUser: (hash: string): SessionUser | null => {
			const r = db.prepare('SELECT u.*, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?').get(hash) as (UserRow & { expires_at: number }) | undefined;
			if (!r) return null;
			if (r.expires_at < now() || r.disabled) { db.prepare('DELETE FROM sessions WHERE id = ?').run(hash); return null; }
			return { id: r.id, login: r.login, display: r.display, role: r.role, employeeId: r.employee_id, mustChange: !!r.must_change };
		},
		deleteSession: (hash: string) => db.prepare('DELETE FROM sessions WHERE id = ?').run(hash),
		deleteUserSessions: (userId: string) => db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId),
		purgeSessions: () => db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now()),

		getState: () => db.prepare('SELECT json, rev FROM state WHERE id = 1').get() as { json: string; rev: number } | undefined,
		/** Optimistische Sperre: schreibt nur, wenn die Revision noch dem erwarteten Stand entspricht. */
		putState: (json: string, expectedRev: number): { ok: true; rev: number } | { ok: false; rev: number } => {
			const cur = db.prepare('SELECT rev FROM state WHERE id = 1').get() as { rev: number } | undefined;
			if (!cur) { db.prepare('INSERT INTO state (id, json, rev, updated_at) VALUES (1,?,1,?)').run(json, iso()); return { ok: true, rev: 1 }; }
			if (cur.rev !== expectedRev) return { ok: false, rev: cur.rev };
			db.prepare('UPDATE state SET json = ?, rev = rev + 1, updated_at = ? WHERE id = 1').run(json, iso());
			return { ok: true, rev: cur.rev + 1 };
		},
		audit: (action: string, userId: string | null, detail = '', ip = '') => db.prepare('INSERT INTO audit (at, user_id, action, detail, ip) VALUES (?,?,?,?,?)').run(iso(), userId, action, detail, ip),
		recentAudit: (n = 100) => db.prepare('SELECT at, user_id, action, detail, ip FROM audit ORDER BY id DESC LIMIT ?').all(n) as { at: string; user_id: string | null; action: string; detail: string; ip: string }[],
		close: () => db.close()
	};
}
export type Store = ReturnType<typeof openStore>;

let shared: Store | null = null;
/** Gemeinsame Instanz für den laufenden Server */
export const store = (): Store => (shared ??= openStore());
