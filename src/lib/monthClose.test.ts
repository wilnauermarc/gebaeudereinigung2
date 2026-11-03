import { describe, expect, it } from 'vitest';
import { createDemoData } from './demo.ts';
import { entryHours } from './calc.ts';
import { closeReport, exportedSinceClose } from './monthClose.ts';
import { todayKey } from './format.ts';

const hoursOf = (t: { start: string; end: string; breakMin: number }) => entryHours(t.start, t.end, t.breakMin);
describe('Monatsabschluss', () => {
	it('offene Korrekturanträge verhindern den Abschluss', () => {
		const d = createDemoData(8); const today = todayKey();
		const month = today.slice(0, 7);
		d.corrections = [{ id: 'c1', employeeId: d.employees[0].id, entryId: 'x', date: month + '-01', old: { start: '', end: '', breakMin: 0 }, proposed: { start: '08:00', end: '09:00', breakMin: 0 }, reason: 'x', status: 'offen', reply: '', createdAt: '', decidedOn: null }];
		const r = closeReport(d, month, today, hoursOf);
		expect(r.blockers.map((b) => b.id)).toEqual(['korrektur']);
		d.corrections[0].status = 'genehmigt';
		expect(closeReport(d, month, today, hoursOf).blockers).toEqual([]);
	});
	it('laufender Monat ist nur ein Hinweis, vergangener Monat nicht', () => {
		const d = createDemoData(8); const today = todayKey();
		expect(closeReport(d, today.slice(0, 7), today, hoursOf).warnings.some((w) => w.id === 'laufend')).toBe(true);
		expect(closeReport(d, '2020-01', today, hoursOf).warnings.some((w) => w.id === 'laufend')).toBe(false);
	});
	it('zählt nur gültige Buchungen des Monats und meldet Prüfhinweise', () => {
		const d = createDemoData(8);
		const mk = (id: string, date: string, voided = false, note = '') => ({ id, employeeId: d.employees[0].id, siteId: d.customers[0].sites[0].id, date, start: '08:00', end: '10:00', breakMin: 0, note, createdAt: '', editedAt: null, source: 'buero' as const, voided, history: [] });
		d.timeEntries = [mk('a', '2020-01-10'), mk('b', '2020-01-11', true), mk('c', '2020-02-01'), mk('d', '2020-01-12', false, 'Länger als 14 Std., bitte prüfen')];
		const r = closeReport(d, '2020-01', todayKey(), hoursOf);
		expect(r.entries).toBe(2); expect(r.hours).toBe(4);
		expect(r.warnings.some((w) => w.id === 'pruefen')).toBe(true);
	});
	it('Lohnexport gilt nur seit dem letzten Abschluss', () => {
		const e = (kind: 'abgeschlossen' | 'entsperrt' | 'lohnexport', at: string) => ({ month: '2026-09', kind, at, by: 'x', note: '' });
		expect(exportedSinceClose([], '2026-09')).toBeNull();
		expect(exportedSinceClose([e('abgeschlossen', '1'), e('lohnexport', '2')], '2026-09')).toBe('2');
		expect(exportedSinceClose([e('abgeschlossen', '1'), e('lohnexport', '2'), e('entsperrt', '3'), e('abgeschlossen', '4')], '2026-09')).toBeNull();
	});
});
