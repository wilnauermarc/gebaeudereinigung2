import { describe, expect, it } from 'vitest';
import { createDemoData } from './demo.ts';
import { plannedVisits, presence, recordOf, setAcceptance, setExecution, summarize } from './nachweis.ts';
import { addVersion } from './lv.ts';
import type { Data, Site } from './types.ts';

function setup() {
	const d = createDemoData(8);
	const site = d.customers.flatMap((c) => c.sites).find((s) => s.plan)! as Site;
	const customer = d.customers.find((c) => c.sites.includes(site))!;
	const date = '2026-10-12';
	return { d: d as Data, site, customer, date };
}
describe('Leistungsnachweis', () => {
	it('geplante Einsätze enthalten nur Planungstage bis heute', () => {
		const { d, site } = setup();
		const v = plannedVisits(d, '2026-10', '2026-10-15').filter((x) => x.siteId === site.id);
		expect(v.length).toBeGreaterThan(0);
		expect(v.every((x) => x.date <= '2026-10-15' && site.plan!.days.includes((new Date(x.date + 'T12:00:00Z').getUTCDay() + 6) % 7))).toBe(true);
	});
	it('Ausführung braucht bei „teilweise“ eine Angabe, bei „nicht“ einen Grund', () => {
		const { d, site, date } = setup();
		expect(setExecution(d, site, date, { execution: 'teilweise', missedItemIds: [], note: '' }, 'A')).toMatch(/nicht erbracht/);
		expect(setExecution(d, site, date, { execution: 'nicht', missedItemIds: [], note: '' }, 'A')).toMatch(/Grund/);
		expect(setExecution(d, site, date, { execution: 'vollstaendig', missedItemIds: [], note: '' }, 'A')).toBeNull();
		expect(recordOf(d, site.id, date)!.execution).toBe('vollstaendig');
	});
	it('merkt sich die geltende Version des Verzeichnisses', () => {
		const { d, site, date } = setup();
		addVersion(site, '2026-10-01', '', 'A');
		const id = site.lv!.at(-1)!.id;
		setExecution(d, site, date, { execution: 'vollstaendig', missedItemIds: [], note: '' }, 'A');
		expect(recordOf(d, site.id, date)!.lvVersionId).toBe(id);
	});
	it('Abnahme erst nach Ausführung, Beanstandung legt auf Wunsch einen Mangel an', () => {
		const { d, site, customer, date } = setup();
		const acc = { acceptance: 'abgenommen' as const, by: 'Frau Muster', note: '', createDefect: false };
		expect(setAcceptance(d, site, customer.id, date, acc, '2026-10-13', 'A')).toMatch(/Zuerst die Ausführung/);
		setExecution(d, site, date, { execution: 'vollstaendig', missedItemIds: [], note: '' }, 'A');
		expect(setAcceptance(d, site, customer.id, date, { ...acc, by: '' }, '2026-10-13', 'A')).toMatch(/wer/);
		expect(setAcceptance(d, site, customer.id, date, { acceptance: 'beanstandet', by: 'Frau Muster', note: '', createDefect: true }, '2026-10-13', 'A')).toMatch(/Beanstandung/);
		const before = d.defects.length;
		expect(setAcceptance(d, site, customer.id, date, { acceptance: 'beanstandet', by: 'Frau Muster', note: 'Boden nicht gewischt', createDefect: true }, '2026-10-13', 'A')).toBeNull();
		expect(d.defects.length).toBe(before + 1);
		// erneutes Speichern legt keinen zweiten Mangel an
		setAcceptance(d, site, customer.id, date, { acceptance: 'beanstandet', by: 'Frau Muster', note: 'Boden nicht gewischt', createDefect: true }, '2026-10-13', 'A');
		expect(d.defects.length).toBe(before + 1);
	});
	it('Zurücknehmen der Ausführung hebt die Abnahme auf', () => {
		const { d, site, customer, date } = setup();
		setExecution(d, site, date, { execution: 'vollstaendig', missedItemIds: [], note: '' }, 'A');
		setAcceptance(d, site, customer.id, date, { acceptance: 'abgenommen', by: 'Frau Muster', note: '', createDefect: false }, '2026-10-13', 'A');
		setExecution(d, site, date, { execution: 'offen', missedItemIds: [], note: '' }, 'A');
		expect(recordOf(d, site.id, date)!.acceptance).toBe('offen');
	});
	it('Zusammenfassung zählt die drei Zustände getrennt', () => {
		const { d, site, customer, date } = setup();
		setExecution(d, site, date, { execution: 'vollstaendig', missedItemIds: [], note: '' }, 'A');
		setAcceptance(d, site, customer.id, date, { acceptance: 'abgenommen', by: 'Frau Muster', note: '', createDefect: false }, '2026-10-13', 'A');
		const s = summarize(d, [{ siteId: site.id, customerId: customer.id, date }, { siteId: site.id, customerId: customer.id, date: '2026-10-14' }]);
		expect(s).toMatchObject({ visits: 2, executed: 1, accepted: 1, disputed: 0 });
		expect(presence(d, site.id, '2099-01-01').names).toEqual([]);
	});
});
