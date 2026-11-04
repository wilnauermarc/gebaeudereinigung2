import { describe, expect, it } from 'vitest';
import { createDemoData } from './demo.ts';
import { buildBoard, type Live } from './leitstand.ts';
import type { Data } from './types.ts';

/** Ein Objekt mit Plan, ein passender Tag und die Zeit am Tag als Zeitpunkt (Winterzeit, UTC+1) */
function setup() {
	const d: Data = createDemoData(8);
	d.timeEntries = []; d.covers = []; d.absences = [];
	const site = d.customers.flatMap((c) => c.sites).find((s) => s.plan && s.plan.staffIds.length === 1)
		?? d.customers.flatMap((c) => c.sites).find((s) => s.plan)!;
	const wd = site.plan!.days[0];
	// ein Datum im November 2026 mit diesem Wochentag
	let date = '2026-11-02';
	while ((new Date(date + 'T12:00:00Z').getUTCDay() + 6) % 7 !== wd) date = new Date(Date.parse(date + 'T12:00:00Z') + 86400000).toISOString().slice(0, 10);
	const [h, m] = site.plan!.start.split(':').map(Number);
	const at = (minutesAfterStart: number) => { const t = h * 60 + m + minutesAfterStart; return new Date(`${date}T${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}:00+01:00`).getTime(); };
	const live = (over: Partial<Live> = {}): Live => ({ now: '', today: date, punches: [], checklists: [], absences: [], ...over });
	const shiftOf = (b: ReturnType<typeof buildBoard>) => b.shifts.find((s) => s.siteId === site.id)!;
	return { d, site, date, at, live, shiftOf };
}

describe('Leitstand', () => {
	it('vor Beginn ist alles geplant, nach Beginn ohne Stempelung „spät“ mit Hinweis, später rot', () => {
		const { d, site, date, at, live, shiftOf } = setup();
		expect(shiftOf(buildBoard(d, date, at(-30), live())).state).toBe('geplant');
		const late20 = buildBoard(d, date, at(20), live());
		expect(shiftOf(late20).state).toBe('spaet');
		expect(late20.alerts.find((a) => a.siteId === site.id && a.level === 'gelb')?.text).toMatch(/noch nicht eingestempelt/);
		const late40 = buildBoard(d, date, at(40), live());
		expect(late40.alerts.find((a) => a.siteId === site.id && a.text.includes('noch nicht eingestempelt'))?.level).toBe('rot');
		expect(late40.counts.late).toBeGreaterThan(0);
	});
	it('Einsatz vorbei ohne Stempelung: „fehlt“ statt „seit 848 Minuten spät“', () => {
		const { d, site, date, at, live, shiftOf } = setup();
		const after = at(site.plan!.hours * 60 + 60);
		const b = buildBoard(d, date, after, live());
		expect(shiftOf(b).state).toBe('fehlt');
		expect(shiftOf(b).people.every((p) => p.state === 'fehlt')).toBe(true);
		expect(b.alerts.some((a) => a.siteId === site.id && /nichts eingestempelt/.test(a.text))).toBe(true);
		expect(b.alerts.some((a) => /noch nicht eingestempelt/.test(a.text) && a.siteId === site.id)).toBe(false);
	});
	it('laufende Stempelung: „läuft“, danach „fertig“', () => {
		const { d, site, date, at, live, shiftOf } = setup();
		const emp = site.plan!.staffIds;
		const start = new Date(at(2)).toISOString();
		const open = live({ punches: emp.map((e) => ({ employeeId: e, siteId: site.id, startAt: start, endAt: null, offline: false })) });
		const b = buildBoard(d, date, at(30), open);
		expect(shiftOf(b).state).toBe('laeuft');
		expect(shiftOf(b).people.every((p) => p.state === 'drin' && !!p.since)).toBe(true);
		const closed = live({ punches: emp.map((e) => ({ employeeId: e, siteId: site.id, startAt: start, endAt: new Date(at(120)).toISOString(), offline: false })) });
		expect(shiftOf(buildBoard(d, date, at(130), closed)).state).toBe('fertig');
	});
	it('Ausfall ohne Vertretung: unbesetzt und rot; mit Vertretung wieder besetzt', () => {
		const { d, site, date, at, live, shiftOf } = setup();
		for (const e of site.plan!.staffIds) d.absences.push({ id: 'ab' + e, employeeId: e, kind: 'krank', from: date, to: date, status: 'genehmigt' });
		const b = buildBoard(d, date, at(-60), live());
		expect(shiftOf(b).state).toBe('unbesetzt');
		expect(shiftOf(b).absent.length).toBe(site.plan!.staffIds.length);
		expect(b.alerts.some((a) => a.siteId === site.id && /unbesetzt/.test(a.text))).toBe(true);
		const helper = d.employees.find((e) => !site.plan!.staffIds.includes(e.id))!;
		d.covers.push({ id: 'c1', siteId: site.id, date, employeeId: helper.id });
		const b2 = buildBoard(d, date, at(-60), live());
		expect(shiftOf(b2).state).toBe('geplant');
		expect(shiftOf(b2).people.some((p) => p.id === helper.id && p.cover)).toBe(true);
	});
	it('Krankmeldung aus dem Live-Stand zählt, bevor das Büro sie übernommen hat', () => {
		const { d, site, date, at, live, shiftOf } = setup();
		const e = site.plan!.staffIds[0];
		const b = buildBoard(d, date, at(-60), live({ absences: [{ employeeId: e, kind: 'krank', from: date, to: date, at: '' }] }));
		expect(shiftOf(b).absent.some((a) => a.id === e && a.kind === 'krank')).toBe(true);
	});
	it('vergangene Tage: ohne Buchung „fehlt“, mit Buchung „fertig“; keine Hinweise', () => {
		const { d, site, date, at, live, shiftOf } = setup();
		const later = buildBoard(d, date, new Date(`2026-11-30T12:00:00+01:00`).getTime(), live({ today: '2026-11-30' }));
		expect(shiftOf(later).state).toBe('fehlt');
		expect(later.alerts).toEqual([]);
		for (const e of site.plan!.staffIds) d.timeEntries.push({ id: 't' + e, employeeId: e, siteId: site.id, date, start: site.plan!.start, end: '23:00', breakMin: 0, note: '', createdAt: '', editedAt: null, source: 'buero', voided: false, history: [] });
		expect(shiftOf(buildBoard(d, date, new Date(`2026-11-30T12:00:00+01:00`).getTime(), live({ today: '2026-11-30' }))).state).toBe('fertig');
		void at;
	});
	it('Zeitbereich umfasst alle Einsätze', () => {
		const { d, date, at, live } = setup();
		const b = buildBoard(d, date, at(0), live());
		expect(b.rangeStart).toBeLessThanOrEqual(Math.min(...b.shifts.map((s) => s.startMin)));
		expect(b.rangeEnd).toBeGreaterThanOrEqual(Math.max(...b.shifts.map((s) => s.endMin)));
		expect(b.rangeEnd - b.rangeStart).toBeGreaterThanOrEqual(8 * 60);
	});
});
