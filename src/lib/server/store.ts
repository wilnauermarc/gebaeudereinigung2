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
export interface SwapRow { id: string; site_id: string; date: string; offered_by: string; taken_by: string | null; status: 'offen' | 'angenommen' | 'bestaetigt' | 'abgelehnt' | 'zurueckgezogen'; created_at: string; decided_at: string | null; applied: number }
export type InboxKind = 'punch' | 'absence' | 'defect' | 'correction' | 'checklist' | 'acceptance';
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
		CREATE TABLE IF NOT EXISTS inbox (
			id TEXT PRIMARY KEY, employee_id TEXT NOT NULL, kind TEXT NOT NULL, payload TEXT NOT NULL, photo BLOB,
			created_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'neu', closed INTEGER NOT NULL DEFAULT 1
		);
		CREATE INDEX IF NOT EXISTS inbox_emp ON inbox (employee_id, created_at);
		CREATE TABLE IF NOT EXISTS swaps (
			id TEXT PRIMARY KEY, site_id TEXT NOT NULL, date TEXT NOT NULL, offered_by TEXT NOT NULL, taken_by TEXT,
			status TEXT NOT NULL DEFAULT 'offen', created_at TEXT NOT NULL, decided_at TEXT, applied INTEGER NOT NULL DEFAULT 0
		);
		CREATE INDEX IF NOT EXISTS swaps_status ON swaps (status, date);
		CREATE TABLE IF NOT EXISTS notifications (
			id TEXT PRIMARY KEY, employee_id TEXT NOT NULL, kind TEXT NOT NULL, ref TEXT, payload TEXT NOT NULL,
			created_at TEXT NOT NULL, read_at TEXT
		);
		CREATE INDEX IF NOT EXISTS notif_emp ON notifications (employee_id, created_at);
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
		setDisplay: (id: string, display: string) => db.prepare('UPDATE users SET display = ? WHERE id = ?').run(display, id),
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
		// ── Eingang: Stempelungen und Meldungen der Mitarbeitenden. Sie liegen getrennt vom Datenbestand und werden von der Verwaltung übernommen. ──
		inboxAdd: (i: { id: string; employeeId: string; kind: InboxKind; payload: unknown; photo?: Uint8Array | null; closed?: boolean }) =>
			db.prepare('INSERT INTO inbox (id, employee_id, kind, payload, photo, created_at, closed) VALUES (?,?,?,?,?,?,?)').run(i.id, i.employeeId, i.kind, JSON.stringify(i.payload), i.photo ?? null, iso(), i.closed === false ? 0 : 1),
		inboxUpdate: (id: string, payload: unknown, closed: boolean) => db.prepare('UPDATE inbox SET payload = ?, closed = ? WHERE id = ?').run(JSON.stringify(payload), closed ? 1 : 0, id),
		inboxDelete: (id: string) => db.prepare('DELETE FROM inbox WHERE id = ?').run(id),
		inboxOpenPunch: (employeeId: string) => {
			const r = db.prepare("SELECT id, payload, created_at FROM inbox WHERE employee_id = ? AND kind = 'punch' AND closed = 0 ORDER BY created_at DESC LIMIT 1").get(employeeId) as { id: string; payload: string; created_at: string } | undefined;
			return r ? { id: r.id, createdAt: r.created_at, payload: JSON.parse(r.payload) } : undefined;
		},
		inboxOf: (employeeId: string, sinceIso: string) =>
			(db.prepare('SELECT id, kind, payload, created_at, status, closed FROM inbox WHERE employee_id = ? AND created_at >= ? ORDER BY created_at DESC').all(employeeId, sinceIso) as { id: string; kind: InboxKind; payload: string; created_at: string; status: string; closed: number }[]).map((r) => ({ ...r, payload: JSON.parse(r.payload), closed: !!r.closed })),
		inboxPending: () =>
			(db.prepare("SELECT id, employee_id, kind, payload, created_at, (photo IS NOT NULL) AS has_photo FROM inbox WHERE status = 'neu' AND closed = 1 ORDER BY created_at").all() as { id: string; employee_id: string; kind: InboxKind; payload: string; created_at: string; has_photo: number }[]).map((r) => ({ id: r.id, employeeId: r.employee_id, kind: r.kind, payload: JSON.parse(r.payload), createdAt: r.created_at, hasPhoto: !!r.has_photo })),
		/** Alle Eingänge seit einem Zeitpunkt (auch laufende Stempelungen), für den Live-Stand der Verwaltung. Ohne Fotos. */
		inboxLive: (sinceIso: string) =>
			(db.prepare("SELECT id, employee_id, kind, payload, created_at, closed FROM inbox WHERE created_at >= ? AND kind IN ('punch','checklist','absence') ORDER BY created_at").all(sinceIso) as { id: string; employee_id: string; kind: InboxKind; payload: string; created_at: string; closed: number }[]).map((r) => ({ id: r.id, employeeId: r.employee_id, kind: r.kind, payload: JSON.parse(r.payload), createdAt: r.created_at, closed: !!r.closed })),
		inboxPhoto: (id: string) => (db.prepare('SELECT photo FROM inbox WHERE id = ?').get(id) as { photo: Uint8Array | null } | undefined)?.photo ?? null,
		inboxAck: (ids: string[]) => { const st = db.prepare("UPDATE inbox SET status = 'uebernommen' WHERE id = ? AND closed = 1"); for (const id of ids) st.run(id); },
		inboxCountSince: (employeeId: string, kinds: InboxKind[], sinceIso: string) =>
			(db.prepare(`SELECT COUNT(*) AS n FROM inbox WHERE employee_id = ? AND created_at >= ? AND kind IN (${kinds.map(() => '?').join(',')})`).get(employeeId, sinceIso, ...kinds) as { n: number }).n,
		// ── Mitteilungen an Mitarbeitende (in der App, ohne Weitergabe an Dritte) ──
		notifyAdd: (n: { id: string; employeeId: string; kind: string; ref?: string | null; payload: unknown }) =>
			db.prepare('INSERT INTO notifications (id, employee_id, kind, ref, payload, created_at) VALUES (?,?,?,?,?,?)').run(n.id, n.employeeId, n.kind, n.ref ?? null, JSON.stringify(n.payload), iso()),
		notifyList: (emp: string) => {
			db.prepare('DELETE FROM notifications WHERE created_at < ?').run(new Date(Date.now() - 30 * 86400000).toISOString());
			return (db.prepare('SELECT id, kind, ref, payload, created_at, read_at FROM notifications WHERE employee_id = ? ORDER BY created_at DESC LIMIT 50').all(emp) as { id: string; kind: string; ref: string | null; payload: string; created_at: string; read_at: string | null }[]).map((r) => ({ id: r.id, kind: r.kind, ref: r.ref, payload: JSON.parse(r.payload), createdAt: r.created_at, read: !!r.read_at }));
		},
		notifyRead: (emp: string, ids: string[] | 'all') => {
			if (ids === 'all') db.prepare('UPDATE notifications SET read_at = ? WHERE employee_id = ? AND read_at IS NULL').run(iso(), emp);
			else { const st = db.prepare('UPDATE notifications SET read_at = ? WHERE id = ? AND employee_id = ? AND read_at IS NULL'); for (const id of ids) st.run(iso(), id, emp); }
		},
		/** Mitteilungen zu einem Vorgang (z. B. Tauschangebot) entfernen, wenn er sich erledigt hat */
		notifyDropRef: (ref: string, kind: string) => db.prepare('DELETE FROM notifications WHERE ref = ? AND kind = ?').run(ref, kind),
		/** Personen mit Zugang (nur sie können Mitteilungen lesen) */
		employeesWithAccess: () => (db.prepare("SELECT employee_id FROM users WHERE role = 'mitarbeiter' AND employee_id IS NOT NULL AND disabled = 0").all() as { employee_id: string }[]).map((r) => r.employee_id),
		// ── Schichttausch ──
		swapAdd: (s: { id: string; siteId: string; date: string; offeredBy: string }) => db.prepare('INSERT INTO swaps (id, site_id, date, offered_by, created_at) VALUES (?,?,?,?,?)').run(s.id, s.siteId, s.date, s.offeredBy, iso()),
		swapGet: (id: string) => db.prepare('SELECT * FROM swaps WHERE id = ?').get(id) as SwapRow | undefined,
		swapsOpen: (fromDate: string) => db.prepare("SELECT * FROM swaps WHERE status = 'offen' AND date >= ? ORDER BY date").all(fromDate) as unknown as SwapRow[],
		swapsOf: (emp: string, fromDate: string) => db.prepare('SELECT * FROM swaps WHERE (offered_by = ? OR taken_by = ?) AND date >= ? ORDER BY date').all(emp, emp, fromDate) as unknown as SwapRow[],
		swapActiveCount: (emp: string) => (db.prepare("SELECT COUNT(*) AS n FROM swaps WHERE offered_by = ? AND status IN ('offen','angenommen')").get(emp) as { n: number }).n,
		/** Atomar: nur wer das Angebot zuerst nimmt, bekommt es */
		swapTake: (id: string, emp: string) => (db.prepare("UPDATE swaps SET taken_by = ?, status = 'angenommen' WHERE id = ? AND status = 'offen' AND offered_by <> ?").run(emp, id, emp).changes as number) === 1,
		swapSetStatus: (id: string, status: string, allowedFrom: string[]) => (db.prepare(`UPDATE swaps SET status = ?, decided_at = ? WHERE id = ? AND status IN (${allowedFrom.map(() => '?').join(',')})`).run(status, iso(), id, ...allowedFrom).changes as number) === 1,
		swapsPending: () => db.prepare("SELECT * FROM swaps WHERE status = 'angenommen' OR (status = 'bestaetigt' AND applied = 0) ORDER BY date").all() as unknown as SwapRow[],
		swapsApplied: (ids: string[]) => { const st = db.prepare("UPDATE swaps SET applied = 1 WHERE id = ? AND status = 'bestaetigt'"); for (const id of ids) st.run(id); },
		audit: (action: string, userId: string | null, detail = '', ip = '') => db.prepare('INSERT INTO audit (at, user_id, action, detail, ip) VALUES (?,?,?,?,?)').run(iso(), userId, action, detail, ip),
		recentAudit: (n = 100) => db.prepare('SELECT at, user_id, action, detail, ip FROM audit ORDER BY id DESC LIMIT ?').all(n) as { at: string; user_id: string | null; action: string; detail: string; ip: string }[],
		close: () => db.close()
	};
}
export type Store = ReturnType<typeof openStore>;

let shared: Store | null = null;
/** Gemeinsame Instanz für den laufenden Server */
export const store = (): Store => (shared ??= openStore());
