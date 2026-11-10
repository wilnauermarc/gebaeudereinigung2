import { describe, expect, it } from 'vitest';
import { canActivate, isPlannable, onboarding, openSteps, paperDeadlines, paperState, statusOf, worstPaper } from './personal';
import type { Employee } from './types';

const base: Employee = { id: 'e1', name: 'Test Person', role: 'Reinigungskraft', contract: 'teilzeit', weeklyHours: 20, phone: '', instructedOn: null };

describe('Status', () => {
	it('fehlender Status gilt als aktiv (Bestand)', () => { expect(statusOf(base)).toBe('aktiv'); expect(isPlannable(base)).toBe(true); });
	it('Bewerber, Ruhende, Freigestellte und Ausgeschiedene werden nicht eingeplant', () => {
		for (const s of ['bewerber', 'einstellung', 'vertrag', 'ruhend', 'freigestellt', 'ausgeschieden'] as const) expect(isPlannable({ status: s })).toBe(false);
		expect(isPlannable({ status: 'gekuendigt' })).toBe(true);
	});
});
describe('Einstellung', () => {
	it('Aktivieren geht erst, wenn alle Schritte erledigt sind', () => {
		const e: Employee = { ...base, status: 'einstellung' };
		expect(openSteps(e)).toHaveLength(5);
		expect(canActivate(e)).toBe(false);
		e.onboarding = { fragebogen: true, vertrag: true, sofortmeldung: true, zugang: true };
		expect(canActivate(e)).toBe(false); // Unterweisung fehlt
		e.instructedOn = '2026-11-01';
		expect(canActivate(e)).toBe(true);
	});
	it('Unterweisung ergibt sich aus dem Datum und ist nicht von Hand setzbar', () => {
		const s = onboarding({ ...base, onboarding: { unterweisung: true } }).find((x) => x.id === 'unterweisung')!;
		expect(s.done).toBe(false);
		expect(s.auto).toBe(true);
	});
});
describe('Papiere', () => {
	const p = { id: 'p1', kind: 'arbeitserlaubnis' as const, until: '2026-12-31', leadDays: 60 };
	it('Stand nach Vorlauf', () => {
		expect(paperState(p, '2026-10-01').state).toBe('gueltig');
		expect(paperState(p, '2026-11-05')).toEqual({ state: 'bald', days: 56 });
		expect(paperState(p, '2027-01-02').state).toBe('abgelaufen');
	});
	it('schlechtester Stand zählt', () => {
		const e: Employee = { ...base, papers: [p, { ...p, id: 'p2', until: '2026-01-01' }] };
		expect(worstPaper(e, '2026-11-05')).toEqual({ state: 'abgelaufen', count: 2 });
		expect(worstPaper(base, '2026-11-05')).toBeNull();
	});
	it('Kalender: Ausgeschiedene und sehr alte Papiere entfallen', () => {
		const old = { ...p, id: 'p3', until: '2026-01-01' };
		const list = paperDeadlines([{ ...base, papers: [p, old] }, { ...base, id: 'e2', status: 'ausgeschieden', papers: [p] }], '2026-11-05');
		expect(list).toHaveLength(1);
		expect(list[0].title).toBe('Arbeitserlaubnis: Test Person');
	});
});
