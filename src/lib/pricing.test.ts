import { describe, expect, it } from 'vitest';
import { PLANS, planModules, priceFor } from './pricing.ts';
import { licenseInfo } from './server/license.ts';
import { activeModules, MODULE_IDS, PRESETS } from './modules.ts';

describe('Preise', () => {
	it('Grundpreis gilt bis zur inklusiven Personenzahl, danach je weitere Person', () => {
		expect(priceFor('standard', 15).totalEur).toBe(99);
		expect(priceFor('standard', 30)).toMatchObject({ extraSeats: 15, extraTotalEur: 60, totalEur: 159 });
		expect(priceFor('einfach', 0).totalEur).toBe(49);
		expect(priceFor('alles', 8).extraSeats).toBe(0);
	});
	it('höheres Paket ist bei gleicher Personenzahl nie billiger, und es gibt keinen Sprung an Grenzen', () => {
		for (let n = 0; n <= 120; n++) {
			const e = priceFor('einfach', n).totalEur, s = priceFor('standard', n).totalEur, a = priceFor('alles', n).totalEur;
			expect(e).toBeLessThanOrEqual(s); expect(s).toBeLessThanOrEqual(a);
			if (n > 0) for (const id of ['einfach', 'standard', 'alles'] as const) expect(priceFor(id, n).totalEur - priceFor(id, n - 1).totalEur).toBeLessThanOrEqual(5);
		}
	});
	it('Pakete entsprechen den Voreinstellungen', () => {
		for (const p of PLANS) expect([...planModules(p.id)].sort()).toEqual([...PRESETS.find((x) => x.id === p.id)!.on].sort());
	});
});

describe('Lizenz', () => {
	const today = '2026-11-05';
	it('ohne Angaben: Eigenbetrieb ohne Begrenzung', () => {
		const l = licenseInfo(today, {});
		expect(l.status).toBe('eigenbetrieb'); expect(l.allowed.length).toBe(MODULE_IDS.length);
	});
	it('Testphase: alle Bausteine, Resttage', () => {
		const l = licenseInfo(today, { LICENSE_PLAN: 'einfach', LICENSE_TRIAL_UNTIL: '2026-11-15' });
		expect(l).toMatchObject({ status: 'test', daysLeft: 10 }); expect(l.allowed.length).toBe(MODULE_IDS.length);
	});
	it('bezahlt: nur die Bausteine des Pakets', () => {
		const l = licenseInfo(today, { LICENSE_PLAN: 'einfach', LICENSE_PAID_UNTIL: '2027-01-01' });
		expect(l.status).toBe('aktiv'); expect(l.allowed).not.toContain('steuerung'); expect(l.allowed).toContain('zeiten');
		expect(activeModules(undefined, l.allowed).has('steuerung')).toBe(false);
		expect(activeModules(undefined, l.allowed).has('rechnungen')).toBe(true);
	});
	it('abgelaufen: Paket bleibt, Status abgelaufen', () => {
		const l = licenseInfo(today, { LICENSE_PLAN: 'standard', LICENSE_TRIAL_UNTIL: '2026-10-01', LICENSE_PAID_UNTIL: '2026-11-04' });
		expect(l.status).toBe('abgelaufen'); expect(l.allowed).toContain('mitarbeiter'); expect(l.allowed).not.toContain('controlling');
	});
	it('ungültige Angaben werden ignoriert', () => {
		expect(licenseInfo(today, { LICENSE_PLAN: 'premium', LICENSE_TRIAL_UNTIL: 'bald' }).status).toBe('eigenbetrieb');
	});
	it('Paketgrenze gilt auch für Abhängige: ohne Einsatzplan keine Zeiten', () => {
		expect(activeModules(undefined, ['stamm', 'zeiten']).has('zeiten')).toBe(false);
	});
});

describe('Demo-Lizenz', () => {
	it('DEMO=1 ist nur lesend mit schmalem Umfang', async () => {
		const { licenseInfo, DEMO_MODULES } = await import('./server/license.ts');
		const l = licenseInfo('2026-11-05', { DEMO: '1' });
		expect(l.status).toBe('demo');
		expect(l.allowed).toEqual(DEMO_MODULES);
		expect(l.allowed).not.toContain('rechnungen');
		expect(licenseInfo('2026-11-05', {}).status).toBe('eigenbetrieb');
	});
});
