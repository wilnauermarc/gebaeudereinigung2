import { describe, expect, it } from 'vitest';
import { caseNet, caseStatus, newCase } from './cases';
import { createDemoData } from './demo';

const fresh = () => { const d = createDemoData(); const c = newCase(d, 'k1', 'Test', null, 'Anetta R.'); d.cases.push(c); return { d, c }; };

describe('Vorgangs-Ablauf', () => {
	it('beginnt bei der Anfrage', () => {
		const { d, c } = fresh();
		expect(caseStatus(d, c).current).toBe('anfrage');
	});
	it('Absage beendet den Vorgang', () => {
		const { d, c } = fresh();
		c.decision = 'declined';
		const s = caseStatus(d, c);
		expect(s.closed).toBe('abgesagt');
		expect(s.steps[0].state).toBe('ended');
		expect(s.steps.slice(1).every((x) => x.state === 'todo')).toBe(true);
	});
	it('ohne Besichtigung und Angebot geht es direkt zum Start', () => {
		const { d, c } = fresh();
		Object.assign(c, { decision: 'accepted', dataConfirmed: true, visitNeeded: false, quoteRequired: false });
		const s = caseStatus(d, c);
		expect(s.current).toBe('start');
		expect(s.steps.find((x) => x.key === 'besichtigung')!.state).toBe('skipped');
		expect(s.steps.find((x) => x.key === 'rueckmeldung')!.state).toBe('skipped');
	});
	it('Angebot als Entwurf blockiert, versendet rückt zur Rückmeldung vor', () => {
		const { d, c } = fresh();
		const q = d.quotes.find((x) => x.status === 'entwurf')!;
		Object.assign(c, { decision: 'accepted', dataConfirmed: true, visitNeeded: false, quoteRequired: true, quoteId: q.id });
		expect(caseStatus(d, c).current).toBe('angebot');
		q.status = 'versendet';
		expect(caseStatus(d, c).current).toBe('rueckmeldung');
		q.status = 'angenommen';
		expect(caseStatus(d, c).current).toBe('start');
		q.status = 'abgelehnt';
		expect(caseStatus(d, c).closed).toBe('abgelehnt');
	});
	it('vollständiger Durchlauf ist abgeschlossen', () => {
		const { d, c } = fresh();
		Object.assign(c, { decision: 'accepted', dataConfirmed: true, visitNeeded: false, quoteRequired: false, manualNetCents: 45000, startAt: '2026-11-10T08:00:00Z', executionDoneAt: '2026-11-10T12:00:00Z', timesheetAt: '2026-11-11T08:00:00Z' });
		const s = caseStatus(d, c);
		expect(s.closed).toBe('abgeschlossen');
		expect(s.progress).toBe(1);
		expect(caseNet(d, c)).toBe(45000);
	});
});

describe('Zurückspringen', () => {
	it('macht einen erledigten Schritt wieder offen und lässt spätere Daten stehen', async () => {
		const { reopenStep } = await import('./cases');
		const d = createDemoData();
		const c = d.cases.find((x) => caseStatus(d, x).steps.filter((s) => s.state === 'done').length >= 3 && !caseStatus(d, x).closed)!;
		const before = caseStatus(d, c);
		const lastDone = [...before.steps].reverse().find((s) => s.state === 'done')!.key;
		reopenStep(d, c, lastDone);
		const after = caseStatus(d, c);
		expect(after.current).toBe(lastDone);
		expect(c.log.at(-1)?.text).toContain('Zurückgesprungen');
	});
	it('setzt ein angenommenes Angebot beim Sprung zur Rückmeldung auf versendet', async () => {
		const { reopenStep } = await import('./cases');
		const d = createDemoData();
		const c = d.cases.find((x) => d.quotes.find((q) => q.id === x.quoteId)?.status === 'angenommen')!;
		reopenStep(d, c, 'rueckmeldung');
		expect(d.quotes.find((q) => q.id === c.quoteId)?.status).toBe('versendet');
		expect(caseStatus(d, c).current).toBe('rueckmeldung');
	});
});

import { createEmptyData } from './demo';
describe('Demo-Datensätze', () => {
	it('12-Personen-Demo: jede Person ist in einem Plan eingeteilt oder hat Buchungen, Pläne verweisen nur auf vorhandene Personen', () => {
		const d = createDemoData(12);
		expect(d.employees).toHaveLength(12);
		const ids = new Set(d.employees.map((e) => e.id));
		const plans = d.customers.flatMap((c) => c.sites.flatMap((s) => (s.plan ? [s.plan] : [])));
		for (const p of plans) for (const id of p.staffIds) expect(ids.has(id)).toBe(true);
		for (const e of d.employees) expect(plans.some((p) => p.staffIds.includes(e.id)) || d.timeEntries.some((t) => t.employeeId === e.id)).toBe(true);
		expect(createDemoData().employees).toHaveLength(8);
	});
	it('leere Daten behalten Firmendaten und Kalkulation, sonst nichts', () => {
		const d = createDemoData();
		d.company.name = 'Meine Firma';
		const e = createEmptyData({ company: d.company, calc: d.calc });
		expect(e.company.name).toBe('Meine Firma');
		expect(e.customers).toHaveLength(0);
		expect(e.employees).toHaveLength(0);
		expect(e.invoices).toHaveLength(0);
	});
});
