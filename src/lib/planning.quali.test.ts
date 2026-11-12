import { describe, expect, it } from 'vitest';
import { planWarnings } from './planning';
import { coverCandidates } from './cockpit';
import { createDemoData } from './demo';
import { addDays } from './calc';
import { todayKey } from './format';

describe('Qualifikation im Plan', () => {
	it('Vertretungsvorschläge enthalten keine Personen in Einstellung und zeigen fehlende Qualifikation', () => {
		const d = createDemoData(8);
		const site = d.customers.flatMap((c) => c.sites).find((s) => s.id === 'k14-s1')!;
		expect(site.plan!.requires).toEqual(['Desinfektor']);
		d.employees.find((e) => e.id === 'm2')!.status = 'einstellung';
		const today = todayKey();
		const list = coverCandidates(d, site.id, addDays(today, 1));
		expect(list.some((c) => c.employee.id === 'm2')).toBe(false);
		const m3 = list.find((c) => c.employee.id === 'm3');
		expect(m3?.missing).toEqual(['Desinfektor']);
		// wer die Qualifikation hat, steht vor denen ohne (bei gleicher Zulässigkeit)
		d.employees.find((e) => e.id === 'm6')!.skills = [{ name: 'Desinfektor' }];
		const ok = coverCandidates(d, site.id, addDays(today, 1)).filter((c) => c.allowed);
		const firstMissing = ok.findIndex((c) => c.missing.length);
		const lastOk = ok.map((c) => c.missing.length).lastIndexOf(0);
		expect(lastOk).toBeLessThan(firstMissing === -1 ? 999 : firstMissing);
	});
});
