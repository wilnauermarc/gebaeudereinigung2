import { describe, expect, it } from 'vitest';
import { gauges, avgPricePerM2, contractQuotes, coverCandidates, economics, findGaps, forecast, healthScores, priceCheck, TARGET_MARGIN } from './cockpit';
import { createDemoData } from './demo';
import { todayKey } from './format';

const today = todayKey();
const month = today.slice(0, 7);
const octMonth = (() => { const d = createDemoData(); return d.timeEntries.map((t) => t.date).sort().at(-1)!.slice(0, 7); })();

describe('Wirtschaftlichkeit', () => {
	it('Marge sinkt mit steigendem Lohn, Break-even liegt konsistent', () => {
		const d = createDemoData();
		const q = contractQuotes(d)[0];
		const a = economics(d, q, octMonth, { wageCents: 1500 });
		const b = economics(d, q, octMonth, { wageCents: 1700 });
		expect(b.cost).toBeGreaterThan(a.cost);
		expect(b.margin).toBeLessThan(a.margin);
		expect(a.revenue).toBe(q.monthlyCents);
	});
	it('Voided Buchungen zählen nicht', () => {
		const d = createDemoData();
		const q = contractQuotes(d)[0];
		const before = economics(d, q, octMonth).hours;
		for (const t of d.timeEntries.filter((x) => x.siteId === q.siteId)) t.voided = true;
		expect(economics(d, q, octMonth).hours).toBe(0);
		expect(before).toBeGreaterThan(0);
	});
	it('Prognose enthält mindestens die Ist-Stunden', () => {
		const d = createDemoData();
		const q = contractQuotes(d)[0];
		expect(forecast(d, q, month, today).hours).toBeGreaterThanOrEqual(economics(d, q, month, { until: today }).hours);
	});
});

describe('Gesundheitsscore', () => {
	it('liegt zwischen 0 und 100, sortiert aufsteigend', () => {
		const d = createDemoData();
		const h = healthScores(d, octMonth, today);
		expect(h.length).toBe(contractQuotes(d).length);
		for (const x of h) expect(x.score >= 0 && x.score <= 100).toBe(true);
		expect(h.map((x) => x.score)).toEqual([...h.map((x) => x.score)].sort((a, b) => a - b));
	});
	it('überfällige Rechnung senkt die Zahlungs-Teilnote', () => {
		const d = createDemoData();
		const q = contractQuotes(d)[0];
		const before = healthScores(d, octMonth, today).find((x) => x.quote.id === q.id)!.parts.payment;
		d.invoices.push({ id: 'x', number: 'R-X', customerId: q.customerId, netCents: 1, issuedOn: '2020-01-01', dueOn: '2020-01-15', paidAt: null, period: null, quoteId: null, remindCount: 0, remindedAt: null });
		expect(healthScores(d, octMonth, today).find((x) => x.quote.id === q.id)!.parts.payment).toBeLessThan(before);
	});
});

describe('Lücken-Detektor', () => {
	it('findet eingeplante Einsätze ohne Buchung', () => {
		const d = createDemoData();
		const before = findGaps(d, today).filter((g) => g.kind === 'fehlt').length;
		const t = d.timeEntries.filter((x) => x.date >= '0')[0];
		d.timeEntries.splice(d.timeEntries.indexOf(t), 1);
		expect(findGaps(d, today).filter((g) => g.kind === 'fehlt').length).toBeGreaterThanOrEqual(before);
	});
	it('erkennt überlange und überlappende Buchungen', () => {
		const d = createDemoData();
		const e = d.timeEntries.find((x) => x.date === d.timeEntries.map((y) => y.date).sort().at(-1))!;
		const copy = { ...e, id: 'dup', start: e.start, end: e.end };
		d.timeEntries.push(copy, { ...e, id: 'long', start: '05:00', end: '20:00' });
		const kinds = findGaps(d, today, 14).map((g) => g.kind);
		expect(kinds).toContain('doppelt');
		expect(kinds).toContain('lang');
	});
});

describe('Vertretungs-Assistent', () => {
	it('schließt Stammbesetzung und Abwesende aus, Springer zuerst', () => {
		const d = createDemoData();
		const s = d.customers.flatMap((c) => c.sites).find((x) => x.id === 'k1-s1')!;
		const date = d.absences.find((a) => a.employeeId === 'm2')!.from; // Jana ist krank
		const list = coverCandidates(d, s.id, date);
		expect(list.find((c) => c.employee.id === 'm2')).toBeUndefined();
		const first = list[0];
		expect(first.allowed).toBe(true);
		expect(list.filter((c) => c.allowed).every((c) => c.costCents > 0)).toBe(true);
	});
});

describe('Angebots-Assistent', () => {
	it('berechnet Marge und Preisempfehlung aus Stunden', () => {
		const d = createDemoData();
		const r = priceCheck(d, { kind: 'unterhaltsreinigung', monthlyCents: 200000, hourlyCents: null, calcHours: 80 })!;
		expect(r.cost).toBe(80 * 1875);
		expect(r.margin).toBeCloseTo(0.25, 2);
		expect(r.targetPrice).toBeGreaterThanOrEqual(Math.round(r.cost / (1 - TARGET_MARGIN)));
	});
	it('liefert ohne Stunden keine Bewertung', () => {
		expect(priceCheck(createDemoData(), { kind: 'unterhaltsreinigung', monthlyCents: 100000, hourlyCents: null, calcHours: null })).toBeNull();
	});
	it('Durchschnittspreis je m² ist plausibel', () => {
		const v = avgPricePerM2(createDemoData())!;
		expect(v).toBeGreaterThan(100);
		expect(v).toBeLessThan(2000);
	});
});

describe('Betriebs-Gauges', () => {
	it('liefert Werte zwischen 0 und 1', () => {
		const d = createDemoData();
		const g = gauges(d, octMonth, today, '2026-11-02');
		for (const v of [g.staffing, g.payment, g.plan]) expect(v >= 0 && v <= 1).toBe(true);
		expect(g.plannedCount).toBeGreaterThan(0);
	});
	it('Besetzung sinkt, wenn alle Stammkräfte abwesend sind', () => {
		const d = createDemoData();
		const before = gauges(d, octMonth, today, '2026-11-02').staffing;
		for (const e of d.employees) d.absences.push({ id: 'x' + e.id, employeeId: e.id, from: '2026-11-02', to: '2026-11-08', kind: 'krank', status: 'genehmigt' });
		expect(gauges(d, octMonth, today, '2026-11-02').staffing).toBeLessThan(before);
	});
});
