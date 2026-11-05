import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { berlinParts } from './inbox.ts';

let dir = '';
let T: typeof import('./tenants.ts');
beforeAll(async () => {
	dir = mkdtempSync(join(tmpdir(), 'tenants-'));
	process.env.RESCH_DB = join(dir, 'main.db');
	delete process.env.REGISTRY_DB; delete process.env.SMTP_URL;
	T = await import('./tenants.ts');
});
afterAll(() => { T.closeRegistry(); rmSync(dir, { recursive: true, force: true }); });

const mk = (email: string, company = 'Alpha Reinigung GmbH') => T.createPending({ email, company, display: 'Anna Alpha', password: 'Ein-langes-Passwort-42', demo: false });

describe('Betriebe', () => {
	it('legt nach Bestätigung einen eigenen Betrieb mit 30 Tagen Test an', () => {
		const r = T.confirmPending(mk('anna@alpha.de'));
		expect(r.ok).toBe(true);
		if (!r.ok) return;
		expect(r.tenant.slug).toBe('alpha-reinigung-gmbh');
		expect(r.tenant.trial_until).toBe(T.addDays(berlinParts(new Date()).date, 30));
		expect(existsSync(join(dir, 'tenants', r.tenant.id + '.db'))).toBe(true);
		const s = T.tenantStore(r.tenant.id);
		expect(s.userCount()).toBe(1);
		expect(JSON.parse(s.getState()!.json).company.name).toBe('Alpha Reinigung GmbH');
	});
	it('der Link ist nur einmal gültig, und dieselbe Adresse testet nur einmal', () => {
		const t = mk('bea@beta.de', 'Beta Glanz');
		expect(T.confirmPending(t).ok).toBe(true);
		expect(T.confirmPending(t).ok).toBe(false);
		const again = T.confirmPending(mk('bea@beta.de', 'Beta Zwei'));
		expect(again.ok).toBe(false);
	});
	it('zwei Betriebe sehen nie dieselben Daten', () => {
		const a = T.tenantByEmail('anna@alpha.de')!, b = T.tenantByEmail('bea@beta.de')!;
		expect(a.id).not.toBe(b.id);
		expect(T.tenantStore(a.id).userByLogin('bea@beta.de')).toBeUndefined();
		expect(T.tenantStore(b.id).userByLogin('anna@alpha.de')).toBeUndefined();
	});
	it('ungültige Betriebs-IDs werden abgelehnt (kein Pfadzugriff)', () => {
		expect(() => T.tenantStore('../main')).toThrow();
		expect(T.tenantById('../../etc')).toBeUndefined();
	});
	it('abgelaufenes oder unbekanntes Token funktioniert nicht', () => {
		expect(T.confirmPending('x'.repeat(40)).ok).toBe(false);
		const t = mk('old@alt.de', 'Alt GmbH');
		T.registry().prepare('UPDATE pending SET expires_at = 1').run();
		expect(T.confirmPending(t).ok).toBe(false);
	});
	it('Kürzel sind eindeutig und reservierte Namen werden nicht vergeben', () => {
		expect(T.slugFor('Admin')).not.toBe('admin');
		expect(T.slugFor('Alpha Reinigung GmbH')).not.toBe('alpha-reinigung-gmbh');
		expect(T.SLUG_RE.test(T.slugFor('Müller & Söhne – Gebäudereinigung'))).toBe(true);
	});
	it('Testende: Warnung, dann Löschung der Datei; nur ein E-Mail-Hash bleibt', async () => {
		const t = T.tenantByEmail('anna@alpha.de')!;
		const today = new Date().toISOString().slice(0, 10);
		T.registry().prepare('UPDATE tenants SET trial_until = ? WHERE id = ?').run(T.addDays(today, 2), t.id);
		const w = await T.maintainTenants(new Date(), true);
		expect(w.warned).toBe(1);
		const outbox = readdirSync(join(dir, 'outbox')).map((f) => JSON.parse(readFileSync(join(dir, 'outbox', f), 'utf8')));
		expect(outbox.some((m) => m.to === 'anna@alpha.de' && /endet bald/.test(m.subject))).toBe(true);
		T.registry().prepare('UPDATE tenants SET trial_until = ? WHERE id = ?').run(T.addDays(today, -(T.KEEP_DAYS + 1)), t.id);
		const d = await T.maintainTenants(new Date(), true);
		expect(d.deleted).toBe(1);
		expect(existsSync(join(dir, 'tenants', t.id + '.db'))).toBe(false);
		expect(T.tenantById(t.id)).toBeUndefined();
		const row = T.registry().prepare('SELECT name, email, status FROM tenants WHERE id = ?').get(t.id) as { name: string | null; email: string | null; status: string };
		expect(row).toEqual({ name: null, email: null, status: 'geloescht' });
		expect(T.trialAlreadyUsed('anna@alpha.de')).toBe(true);
	});
	it('bezahlte Betriebe werden nie gelöscht', async () => {
		const t = T.tenantByEmail('bea@beta.de')!;
		const today = new Date().toISOString().slice(0, 10);
		T.registry().prepare('UPDATE tenants SET trial_until = ?, paid_until = ? WHERE id = ?').run(T.addDays(today, -100), T.addDays(today, 30), t.id);
		await T.maintainTenants(new Date(), true);
		expect(T.tenantById(t.id)).toBeDefined();
	});
	it('Begrenzung: nach der Höchstzahl ist Schluss', () => {
		T.resetLimits();
		const r = Array.from({ length: 7 }, () => T.overLimit('k', 5, 60_000));
		expect(r).toEqual([false, false, false, false, false, true, true]);
	});
});
