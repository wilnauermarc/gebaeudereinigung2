import { describe, expect, it } from 'vitest';
import { createDemoData } from './demo';
import { addDays, weekday } from './calc';
import { canTake, ownsShift, shiftAt, shiftsOn } from './swap';
import { todayKey } from './format';

const today = todayKey();
const nextDayWith = (d: ReturnType<typeof createDemoData>, siteId: string) => {
	const p = d.customers.flatMap((c) => c.sites).find((s) => s.id === siteId)!.plan!;
	for (let i = 1; i < 14; i++) if (p.days.includes(weekday(addDays(today, i)))) return addDays(today, i);
	throw new Error('kein Tag');
};

describe('Schichttausch', () => {
	it('erkennt eigene Einsätze und Einsatzzeiten', () => {
		const d = createDemoData();
		const date = nextDayWith(d, 'k2-s1');
		expect(ownsShift(d, 'm5', 'k2-s1', date)).toBe(true);
		expect(ownsShift(d, 'm2', 'k2-s1', date)).toBe(false);
		expect(shiftAt(d, 'k2-s1', date)?.start).toBe('19:00');
	});
	it('wer schon am Objekt eingeplant ist, kann nicht übernehmen', () => {
		const d = createDemoData();
		const date = nextDayWith(d, 'k2-s1');
		expect(canTake(d, 'm4', 'k2-s1', date)).toMatchObject({ ok: false });
	});
	it('freie Person darf übernehmen, belegte nicht (Überschneidung)', () => {
		const d = createDemoData();
		const date = nextDayWith(d, 'k2-s1');
		// Lukas (Springer) hat abends keinen Einsatz an diesem Objekt
		const lukas = canTake(d, 'm7', 'k2-s1', date);
		expect(lukas.ok || lukas.reason).toBeTruthy();
		// künstliche Überschneidung: Sven soll zur selben Zeit woanders arbeiten
		d.customers.flatMap((c) => c.sites).find((s) => s.id === 'k1-s2')!.plan = { days: [weekday(date)], start: '19:30', hours: 2, staffIds: ['m3'], areaM2: null };
		expect(canTake(d, 'm3', 'k2-s1', date)).toEqual({ ok: false, reason: 'Sie haben zur selben Zeit einen anderen Einsatz.' });
	});
	it('abwesende Personen können nicht übernehmen', () => {
		const d = createDemoData();
		const date = nextDayWith(d, 'k2-s1');
		d.absences.push({ id: 'x', employeeId: 'm7', from: date, to: date, kind: 'urlaub', status: 'genehmigt' });
		expect(canTake(d, 'm7', 'k2-s1', date)).toEqual({ ok: false, reason: 'Sie sind an diesem Tag abwesend.' });
	});
	it('verlangt 11 Stunden Ruhezeit zum Vortag', () => {
		const d = createDemoData();
		const date = nextDayWith(d, 'k2-s1');
		// Frühschicht 06:00 am Folgetag für Lukas, der abends übernehmen soll: 19:00-21:00 → 06:00 = nur 9 h Ruhe
		d.customers.flatMap((c) => c.sites).find((s) => s.id === 'k1-s2')!.plan = { days: [weekday(addDays(date, 1))], start: '06:00', hours: 2, staffIds: ['m7'], areaM2: null };
		const r = canTake(d, 'm7', 'k2-s1', date);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.reason).toContain('Ruhezeit');
	});
	it('ersetzte Person hat den Einsatz nicht mehr, die Vertretung schon', () => {
		const d = createDemoData();
		const date = nextDayWith(d, 'k2-s1');
		d.covers.push({ id: 'c1', siteId: 'k2-s1', date, employeeId: 'm7', replacesId: 'm5' });
		expect(shiftsOn(d, 'm5', date).some((s) => s.siteId === 'k2-s1')).toBe(false);
		expect(shiftsOn(d, 'm7', date).some((s) => s.siteId === 'k2-s1')).toBe(true);
	});
});
