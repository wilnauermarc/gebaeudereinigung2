import { beforeEach, describe, expect, it } from 'vitest';
import { LOCK_MS, MAX_FAILS, hashPassword, hashToken, login, oneTimeCode, passwordIssue, resetRateLimit, verifyPassword } from './auth';
import { openStore, type Store } from './store';

let s: Store;
beforeEach(() => {
	s = openStore(':memory:');
	resetRateLimit();
	s.insertUser({ id: 'u1', login: 'maria', display: 'Maria', role: 'mitarbeiter', employeeId: 'm1', pwHash: hashPassword('Geheim-Passwort1'), mustChange: false });
});

describe('Passwörter', { timeout: 30_000 }, () => {
	it('hasht mit Salt und prüft korrekt', () => {
		const h = hashPassword('abc12345');
		expect(h).not.toContain('abc12345');
		expect(verifyPassword('abc12345', h)).toBe(true);
		expect(verifyPassword('abc12346', h)).toBe(false);
		expect(hashPassword('abc12345')).not.toBe(h);
	});
	it('Mindestlängen je Rolle', () => {
		expect(passwordIssue('kurz', 'mitarbeiter')).toBeTruthy();
		expect(passwordIssue('12345678', 'mitarbeiter')).toBeNull();
		expect(passwordIssue('12345678', 'inhaber')).toBeTruthy();
		expect(passwordIssue('aaaaaaaaaaaa', 'inhaber')).toBeTruthy();
	});
	it('Einmal-Codes sind 10 Zeichen ohne verwechselbare Zeichen', () => {
		for (let i = 0; i < 50; i++) expect(oneTimeCode()).toMatch(/^[A-HJKMNP-Z2-9]{10}$/);
	});
});
describe('Anmeldung und Sitzung', { timeout: 30_000 }, () => {
	it('meldet mit richtigem Passwort an, Sitzung ist über Token-Hash auffindbar', () => {
		const r = login(s, 'maria', 'Geheim-Passwort1', '1.1.1.1');
		expect(r.ok).toBe(true);
		if (r.ok) {
			expect(s.sessionUser(hashToken(r.token))?.role).toBe('mitarbeiter');
			// im Speicher liegt nur der Hash, nie das Token selbst
			expect((s.raw.prepare('SELECT id FROM sessions').all() as { id: string }[]).some((x) => x.id === r.token)).toBe(false);
		}
	});
	it('Anmeldename ist nicht groß-/kleinschreibungsabhängig', () => {
		expect(login(s, 'MARIA', 'Geheim-Passwort1', '1.1.1.1').ok).toBe(true);
	});
	it('falsches Passwort und unbekannter Name liefern dieselbe Ablehnung', () => {
		expect(login(s, 'maria', 'falsch', '1.1.1.1')).toEqual({ ok: false, reason: 'invalid' });
		expect(login(s, 'niemand', 'falsch', '1.1.1.1')).toEqual({ ok: false, reason: 'invalid' });
	});
	it('sperrt den Zugang nach zu vielen Fehlversuchen, auch mit richtigem Passwort', () => {
		const t = Date.now();
		for (let i = 0; i < MAX_FAILS; i++) login(s, 'maria', 'falsch', '1.1.1.1', t);
		expect(login(s, 'maria', 'Geheim-Passwort1', '1.1.1.1', t + 1000)).toEqual({ ok: false, reason: 'locked' });
		expect(login(s, 'maria', 'Geheim-Passwort1', '1.1.1.1', t + LOCK_MS + 1000).ok).toBe(true);
	}, 30_000);
	it('begrenzt Versuche je IP', () => {
		let last;
		for (let i = 0; i < 40; i++) last = login(s, 'x' + i, 'falsch', '9.9.9.9');
		expect(last).toEqual({ ok: false, reason: 'ratelimit' });
	}, 30_000);
	it('gesperrte Zugänge können sich nicht anmelden und verlieren ihre Sitzung', () => {
		const r = login(s, 'maria', 'Geheim-Passwort1', '1.1.1.1');
		if (!r.ok) throw new Error('login');
		s.setDisabled('u1', true);
		expect(s.sessionUser(hashToken(r.token))).toBeNull();
		expect(login(s, 'maria', 'Geheim-Passwort1', '1.1.1.1').ok).toBe(false);
	});
	it('abgelaufene Sitzungen gelten nicht', () => {
		s.createSession('h', 'u1', -1000);
		expect(s.sessionUser('h')).toBeNull();
	});
	it('protokolliert Fehlversuche', () => {
		login(s, 'maria', 'falsch', '2.2.2.2');
		expect(s.recentAudit().some((a) => a.action === 'login_fail')).toBe(true);
	});
});
describe('Datenbestand', () => {
	it('schreibt nur bei passender Revision', () => {
		expect(s.putState('{"a":1}', 0)).toEqual({ ok: true, rev: 1 });
		expect(s.putState('{"a":2}', 1)).toEqual({ ok: true, rev: 2 });
		expect(s.putState('{"a":3}', 1)).toEqual({ ok: false, rev: 2 });
		expect(JSON.parse(s.getState()!.json)).toEqual({ a: 2 });
	});
});

describe('Protokoll: IP-Adressen', () => {
	it('werden nach 90 Tagen entfernt, der Eintrag bleibt', () => {
		s.audit('login', 'u1', '', '203.0.113.7');
		const day = 86_400_000;
		expect(s.trimAudit(90, Date.now() + 89 * day)).toBe(0);
		expect(s.trimAudit(90, Date.now() + 91 * day)).toBe(1);
		const row = s.recentAudit(1)[0];
		expect(row.ip).toBe('');
		expect(row.action).toBe('login');
	});
	it('die Anmeldung stößt die Bereinigung an', () => {
		s.audit('login_fail', null, 'x', '198.51.100.9');
		const old = Date.now() + 100 * 86_400_000;
		login(s, 'maria', 'falsch-falsch', '198.51.100.9', old);
		expect(s.recentAudit(5).some((r) => r.action === 'login_fail' && r.detail === 'x' && r.ip === '')).toBe(true);
	});
});
