/**
 * Mehrere Betriebe in einer Installation (nur mit TENANTS=1).
 * Jeder Betrieb hat eine eigene Datenbankdatei (data/tenants/<id>.db). Ein Verzeichnis (data/registry.db) kennt nur die Betriebe,
 * die offenen Anmeldungen und einen Hash der E-Mail-Adressen, die schon getestet haben. Der bisherige Betrieb dieser Installation
 * bleibt als "main" unverändert bestehen.
 */
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { openStore, type Store } from './store.ts';
import { hashPassword, hashToken } from './auth.ts';
import { createDemoData, createEmptyData } from '../demo.ts';
import { sendMail } from './mail.ts';
import { berlinParts } from './inbox.ts';

export const tenantsEnabled = () => process.env.TENANTS === '1';
export const TRIAL_DAYS = 30;
/** Nach Ende der Testphase bleiben die Daten so viele Tage erhalten, dann werden sie gelöscht */
export const KEEP_DAYS = 14;
export const MAX_TENANTS = () => Number(process.env.MAX_TENANTS) > 0 ? Number(process.env.MAX_TENANTS) : 200;
export const PENDING_HOURS = 24;
const RESERVED = new Set(['main', 'app', 'www', 'demo', 'admin', 'api', 'start', 'test', 'login', 'putzbetrieb', 'support', 'mail']);

export interface TenantRow { id: string; slug: string; name: string | null; email: string | null; created_at: string; trial_until: string | null; paid_until: string | null; plan: string; status: 'aktiv' | 'geloescht'; warned3: number; warned_end: number }

const base = () => dirname(process.env.RESCH_DB ?? 'data/resch.db');
const tenantDir = () => join(base(), 'tenants');
let reg: DatabaseSync | null = null;
let regPath = '';
export function registry(): DatabaseSync {
	const p = process.env.REGISTRY_DB ?? join(base(), 'registry.db');
	if (reg && p === regPath) return reg;
	if (p !== ':memory:') mkdirSync(dirname(p), { recursive: true });
	reg = new DatabaseSync(p); regPath = p;
	reg.exec(`
		PRAGMA journal_mode = WAL;
		CREATE TABLE IF NOT EXISTS tenants (
			id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT, email TEXT, created_at TEXT NOT NULL,
			trial_until TEXT, paid_until TEXT, plan TEXT NOT NULL DEFAULT 'standard', status TEXT NOT NULL DEFAULT 'aktiv',
			warned3 INTEGER NOT NULL DEFAULT 0, warned_end INTEGER NOT NULL DEFAULT 0
		);
		CREATE UNIQUE INDEX IF NOT EXISTS tenants_email ON tenants (email) WHERE email IS NOT NULL;
		CREATE TABLE IF NOT EXISTS pending (
			token_hash TEXT PRIMARY KEY, email TEXT NOT NULL, company TEXT NOT NULL, display TEXT NOT NULL, pw_hash TEXT NOT NULL,
			demo INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL
		);
		CREATE TABLE IF NOT EXISTS used (email_hash TEXT PRIMARY KEY, at TEXT NOT NULL);
		CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);
	`);
	return reg;
}
export const closeRegistry = () => { try { reg?.close(); } catch { /* schon zu */ } reg = null; };

const sha = (s: string) => createHash('sha256').update(s).digest('hex');
export const emailHash = (email: string) => sha('putzbetrieb-email:' + email.trim().toLowerCase());
export const ID_RE = /^[0-9a-f]{16}$/;
export const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export function addDays(date: string, n: number): string {
	const d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n);
	return d.toISOString().slice(0, 10);
}
const today = () => berlinParts(new Date()).date;

export const tenantById = (id: string) => ID_RE.test(id) ? registry().prepare("SELECT * FROM tenants WHERE id = ? AND status = 'aktiv'").get(id) as TenantRow | undefined : undefined;
export const tenantBySlug = (slug: string) => registry().prepare("SELECT * FROM tenants WHERE slug = ? AND status = 'aktiv'").get(slug.toLowerCase()) as TenantRow | undefined;
export const tenantByEmail = (email: string) => registry().prepare("SELECT * FROM tenants WHERE email = ? AND status = 'aktiv'").get(email.trim().toLowerCase()) as TenantRow | undefined;
export const activeTenantCount = () => (registry().prepare("SELECT COUNT(*) AS n FROM tenants WHERE status = 'aktiv'").get() as { n: number }).n;
export const trialAlreadyUsed = (email: string) => !!registry().prepare('SELECT 1 FROM used WHERE email_hash = ?').get(emailHash(email));

// ── Speicher je Betrieb (offene Verbindungen werden begrenzt) ──
const open = new Map<string, Store>();
const MAX_OPEN = 40;
export function tenantStore(id: string): Store {
	if (!ID_RE.test(id)) throw new Error('Ungültige Betriebs-ID.');
	const hit = open.get(id);
	if (hit) { open.delete(id); open.set(id, hit); return hit; } // zuletzt benutzt nach hinten
	if (open.size >= MAX_OPEN) { const [oldId, old] = open.entries().next().value as [string, Store]; try { old.close(); } catch { /* schon zu */ } open.delete(oldId); }
	const s = openStore(join(tenantDir(), `${id}.db`));
	open.set(id, s);
	return s;
}
function dropStore(id: string) { const s = open.get(id); if (s) { try { s.close(); } catch { /* schon zu */ } open.delete(id); } }

/** Lizenzwerte eines Betriebs (gleiche Form wie die Umgebungsvariablen der Hauptinstanz) */
export const licenseEnvFor = (t: TenantRow) => ({ LICENSE_PLAN: t.plan, LICENSE_TRIAL_UNTIL: t.trial_until ?? undefined, LICENSE_PAID_UNTIL: t.paid_until ?? undefined });

export function slugFor(company: string): string {
	let s = company.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24).replace(/-+$/, '');
	if (s.length < 3) s = 'betrieb';
	let slug = s, n = 1;
	while (RESERVED.has(slug) || registry().prepare('SELECT 1 FROM tenants WHERE slug = ?').get(slug)) slug = `${s.slice(0, 24)}-${++n}`;
	return slug;
}

// ── Begrenzung im Arbeitsspeicher: höchstens max Aufrufe je Schlüssel im Zeitfenster ──
const hitsMap = new Map<string, number[]>();
export function overLimit(key: string, max: number, windowMs: number, now = Date.now()): boolean {
	const arr = (hitsMap.get(key) ?? []).filter((t) => now - t < windowMs);
	arr.push(now);
	hitsMap.set(key, arr);
	if (hitsMap.size > 5000) for (const [k, v] of hitsMap) if (!v.some((t) => now - t < windowMs)) hitsMap.delete(k);
	return arr.length > max;
}
export const resetLimits = () => hitsMap.clear();

// ── Anmeldung mit E-Mail-Bestätigung ──
export function createPending(p: { email: string; company: string; display: string; password: string; demo: boolean }): string {
	const token = randomBytes(32).toString('base64url');
	const now = Date.now();
	registry().prepare('DELETE FROM pending WHERE email = ?').run(p.email.toLowerCase());
	registry().prepare('INSERT INTO pending (token_hash, email, company, display, pw_hash, demo, created_at, expires_at) VALUES (?,?,?,?,?,?,?,?)')
		.run(hashToken(token), p.email.toLowerCase(), p.company, p.display, hashPassword(p.password), p.demo ? 1 : 0, now, now + PENDING_HOURS * 3600_000);
	return token;
}
export const pendingCount = () => (registry().prepare('SELECT COUNT(*) AS n FROM pending WHERE expires_at > ?').get(Date.now()) as { n: number }).n;

export type ConfirmResult = { ok: true; tenant: TenantRow; userId: string } | { ok: false; reason: 'invalid' | 'full' | 'taken' };
/** Bestätigt die Adresse und legt den Betrieb mit 30 Tagen Testphase an */
export function confirmPending(token: string): ConfirmResult {
	const r = registry();
	const p = r.prepare('SELECT * FROM pending WHERE token_hash = ?').get(hashToken(token)) as { email: string; company: string; display: string; pw_hash: string; demo: number; expires_at: number } | undefined;
	if (!p || p.expires_at < Date.now()) return { ok: false, reason: 'invalid' };
	if (tenantByEmail(p.email) || trialAlreadyUsed(p.email)) { r.prepare('DELETE FROM pending WHERE token_hash = ?').run(hashToken(token)); return { ok: false, reason: 'taken' }; }
	if (activeTenantCount() >= MAX_TENANTS()) return { ok: false, reason: 'full' };
	const id = randomBytes(8).toString('hex');
	const slug = slugFor(p.company);
	const t0 = today();
	const data = p.demo ? createDemoData(8) : createEmptyData();
	data.company = { ...data.company, name: p.company };
	if (!p.demo) data.settings = { ...(data.settings ?? {}), demo: false };
	const s = tenantStore(id);
	const userId = 'u-' + randomBytes(8).toString('hex');
	s.insertUser({ id: userId, login: p.email, display: p.display, role: 'inhaber', employeeId: null, pwHash: p.pw_hash, mustChange: false });
	s.putState(JSON.stringify(data), 0);
	s.audit('tenant_created', userId, slug);
	r.prepare("INSERT INTO tenants (id, slug, name, email, created_at, trial_until, plan) VALUES (?,?,?,?,?,?, 'standard')").run(id, slug, p.company, p.email, new Date().toISOString(), addDays(t0, TRIAL_DAYS));
	r.prepare('INSERT OR IGNORE INTO used (email_hash, at) VALUES (?,?)').run(emailHash(p.email), t0);
	r.prepare('DELETE FROM pending WHERE token_hash = ?').run(hashToken(token));
	return { ok: true, tenant: tenantById(id)!, userId };
}

// ── Pflege: Warnmails und Löschung nach Testende (höchstens einmal pro Stunde, bei Anfragen angestoßen) ──
export function deleteTenant(id: string) {
	dropStore(id);
	for (const ext of ['', '-wal', '-shm']) { const f = join(tenantDir(), `${id}.db${ext}`); if (existsSync(f)) rmSync(f, { force: true }); }
	// Personenbezug im Verzeichnis entfernen; der E-Mail-Hash bleibt, damit die Testphase nicht beliebig oft neu beginnt
	registry().prepare("UPDATE tenants SET status = 'geloescht', name = NULL, email = NULL WHERE id = ?").run(id);
}
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 86400_000);
export async function maintainTenants(now = new Date(), force = false): Promise<{ warned: number; deleted: number }> {
	const r = registry();
	const last = Number((r.prepare("SELECT v FROM meta WHERE k = 'maintained'").get() as { v: string } | undefined)?.v ?? 0);
	if (!force && now.getTime() - last < 3600_000) return { warned: 0, deleted: 0 };
	r.prepare("INSERT INTO meta (k, v) VALUES ('maintained', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").run(String(now.getTime()));
	r.prepare('DELETE FROM pending WHERE expires_at < ?').run(now.getTime());
	const t0 = berlinParts(now).date;
	let warned = 0, deleted = 0;
	const rows = r.prepare("SELECT * FROM tenants WHERE status = 'aktiv'").all() as unknown as TenantRow[];
	for (const t of rows) {
		if (!t.trial_until) continue;
		const paid = !!t.paid_until && t.paid_until >= t0;
		if (paid) continue;
		const left = daysBetween(t0, t.trial_until); // negativ: Testphase vorbei
		const deleteOn = addDays(t.trial_until, KEEP_DAYS);
		if (left < -KEEP_DAYS) { deleteTenant(t.id); deleted++; continue; }
		if (t.email && left <= 3 && left >= 0 && !t.warned3) {
			await sendMail({ to: t.email, subject: 'Ihre Testphase bei Putzbetrieb endet bald', text: `Guten Tag,\n\nIhre 30-tägige Testphase endet am ${t.trial_until.split('-').reverse().join('.')}.\nDanach ist die App nur noch lesbar. Wenn Sie nicht weitermachen, werden Ihre Daten am ${deleteOn.split('-').reverse().join('.')} gelöscht.\n\nSie können Ihre Daten vorher unter Einstellungen exportieren. Bei Fragen oder zum Weitermachen antworten Sie einfach auf diese Nachricht.\n\nPutzbetrieb` }).catch(() => undefined);
			r.prepare('UPDATE tenants SET warned3 = 1 WHERE id = ?').run(t.id); warned++;
		}
		if (t.email && left < 0 && !t.warned_end) {
			await sendMail({ to: t.email, subject: 'Ihre Testphase bei Putzbetrieb ist beendet', text: `Guten Tag,\n\nIhre Testphase ist beendet. Ihre Daten bleiben bis zum ${deleteOn.split('-').reverse().join('.')} lesbar und exportierbar und werden danach endgültig gelöscht.\nUm weiterzumachen, antworten Sie einfach auf diese Nachricht.\n\nPutzbetrieb` }).catch(() => undefined);
			r.prepare('UPDATE tenants SET warned_end = 1 WHERE id = ?').run(t.id); warned++;
		}
	}
	return { warned, deleted };
}
