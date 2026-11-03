import { describe, expect, it } from 'vitest';
import { createDemoData } from './demo';
import { staffView } from './staffView';
import { todayKey } from './format';

const d = createDemoData();
const today = todayKey();

describe('Mitarbeiter-Projektion', () => {
	const v = staffView(d, 'm5', today)!;
	it('enthält die eigenen Einsätze der nächsten 7 Tage', () => {
		expect(v.name).toBe('Tomasz Nowak');
		expect(v.shifts.length).toBeGreaterThan(0);
		expect(v.shifts.every((s) => s.date >= today)).toBe(true);
	});
	it('enthält keine Preis-, Rechnungs- oder Teamdaten', () => {
		const json = JSON.stringify(v);
		expect(json).not.toMatch(/netCents|monthlyCents|invoice|Rechnung|calc|wageCents|iban/i);
		for (const other of d.employees.filter((e) => e.id !== 'm5')) expect(json).not.toContain(other.name);
		expect(Object.keys(v).sort()).toEqual(['company', 'contract', 'hours', 'instructedOn', 'leave', 'minijob', 'month', 'name', 'officePhone', 'open', 'requests', 'requireQr', 'role', 'shifts', 'soll', 'times', 'weeklyHours'].sort());
	});
	it('zeigt eigene Stempelungen aus dem Eingang als „beim Büro eingegangen“', () => {
		const iso = (h: number) => new Date(`${today}T${String(h).padStart(2, '0')}:00:00+01:00`).toISOString();
		const view = staffView(d, 'm5', today, [{ id: 'p1', kind: 'punch', payload: { siteId: 'k1-s1', startAt: iso(8), endAt: iso(10), breakMin: 0 }, created_at: iso(10), status: 'neu', closed: true }])!;
		expect(view.times.some((t) => t.pending && t.hours === 2)).toBe(true);
	});
	it('laufende Stempelung erscheint als offen, ohne Fremddaten', () => {
		const view = staffView(d, 'm5', today, [{ id: 'p2', kind: 'punch', payload: { siteId: 'k1-s1', startAt: new Date().toISOString() }, created_at: new Date().toISOString(), status: 'neu', closed: false }])!;
		expect(view.open?.id).toBe('p2');
	});
	it('unbekannte Person liefert nichts', () => {
		expect(staffView(d, 'nope', today)).toBeNull();
	});
	it('kranke Personen bekommen für Krankheitstage keinen Einsatz', () => {
		const sick = d.absences.find((a) => a.kind === 'krank' && a.from <= today && today <= a.to);
		if (!sick) return;
		const view = staffView(d, sick.employeeId, today)!;
		expect(view.shifts.some((s) => s.date >= sick.from && s.date <= sick.to)).toBe(false);
	});
});
