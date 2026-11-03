import { describe, expect, it } from 'vitest';
import { planWarnings } from './planning';

type Emp = { id: string; name: string; weeklyHours: number };
const emp: Emp = { id: 'e1', name: 'Anna Beispiel', weeklyHours: 10 };
/** Minimaler Db-Ersatz: Objekte mit festem Plan, Anna steht überall (außer es ist anders vorgegeben) */
function fakeDb(sites: { id: string; start: string; hours: number; days: string[] }[]) {
	return {
		employee: (id: string) => (id === 'e1' ? emp : undefined),
		plannedSites: () => sites.map((s) => ({ site: { id: s.id, plan: { start: s.start, hours: s.hours } }, customer: { name: 'Kunde ' + s.id } })),
		staffing: (siteId: string, date: string) => {
			const s = sites.find((x) => x.id === siteId)!;
			return s.days.includes(date) ? { present: [emp], covers: [], absent: [], understaffed: false, empty: false } : null;
		}
	} as never;
}
const days = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08'];

describe('Planungswarnungen', () => {
	it('erkennt Doppelbelegung am selben Tag', () => {
		const w = planWarnings(fakeDb([{ id: 'a', start: '08:00', hours: 3, days: ['2026-11-03'] }, { id: 'b', start: '10:00', hours: 2, days: ['2026-11-03'] }]), days);
		expect(w.some((x) => x.kind === 'doppelt')).toBe(true);
	});
	it('erkennt zu kurze Ruhezeit zwischen zwei Tagen', () => {
		const w = planWarnings(fakeDb([{ id: 'a', start: '15:00', hours: 8, days: ['2026-11-03'] }, { id: 'b', start: '05:00', hours: 2, days: ['2026-11-04'] }]), days);
		expect(w.find((x) => x.kind === 'ruhezeit')?.text).toContain('6 Std.');
	});
	it('meldet nichts bei sauberem Plan', () => {
		const w = planWarnings(fakeDb([{ id: 'a', start: '08:00', hours: 2, days: ['2026-11-03'] }, { id: 'b', start: '14:00', hours: 2, days: ['2026-11-03'] }]), days);
		expect(w).toEqual([]);
	});
	it('warnt bei Wochenstunden über Vertrag', () => {
		const w = planWarnings(fakeDb([{ id: 'a', start: '08:00', hours: 4, days: days.slice(0, 5) }]), days);
		expect(w.some((x) => x.kind === 'ueberstunden')).toBe(true);
	});
});
