import { describe, expect, it } from 'vitest';
import { bookingCsvRows, bookingRows, defaultExportConfig, payrollRows } from './export';
import { createDemoData } from './demo';

const cfg = { ...defaultExportConfig, beraterNr: '12345', mandantNr: '1', lohnarten: { ...defaultExportConfig.lohnarten, arbeit: '100', weg: '110', nacht: '210' } };

describe('Lohnexport', () => {
	it('trennt Zeitarten und führt Lohnart-Nummern mit', () => {
		const d = createDemoData();
		const t = d.timeEntries.find((x) => !x.voided)!;
		d.timeEntries.push({ ...t, id: 'tw', kind: 'weg', start: '12:00', end: '13:00', breakMin: 0, date: t.date });
		const month = t.date.slice(0, 7);
		const rows = payrollRows(d, month, cfg, () => 1);
		expect(rows.some((r) => r.bezeichnung === 'Wegezeit' && r.lohnart === '110')).toBe(true);
		expect(rows.some((r) => r.bezeichnung === 'Arbeitsstunden' && r.lohnart === '100')).toBe(true);
	});
	it('ignoriert ungültige Buchungen', () => {
		const d = createDemoData();
		d.timeEntries.forEach((t) => (t.voided = true));
		expect(payrollRows(d, d.timeEntries[0].date.slice(0, 7), cfg, () => 1)).toEqual([]);
	});
});
describe('Buchungsexport', () => {
	const d = createDemoData();
	it('bucht brutto auf Debitor an Erlöskonto, Storno als Haben', () => {
		const inv = d.invoices[0];
		const rows = bookingRows([inv, { ...inv, id: 'x', number: inv.number + '-S', netCents: -inv.netCents }], d.customers, cfg);
		expect(rows[0]).toMatchObject({ sh: 'S', gegenkonto: '8400' });
		expect(rows[1].sh).toBe('H');
		expect(rows[0].umsatz).toBe(rows[1].umsatz);
		expect(Number(rows[0].konto)).toBeGreaterThan(10000);
	});
	it('nennt Berater, Mandant und fehlende Zertifizierung im Hinweis', () => {
		const csv = bookingCsvRows(bookingRows([d.invoices[0]], d.customers, cfg), cfg);
		expect(csv[1].at(-1)).toContain('nicht von DATEV zertifiziert');
		expect(csv[1].at(-1)).toContain('12345');
	});
});

import { extfBookings, toWin1252 } from './export';
describe('EXTF-Buchungsstapel', () => {
	const d = createDemoData();
	const rows = bookingRows([d.invoices[0]], d.customers, cfg);
	const txt = extfBookings(rows, cfg, { now: new Date('2026-11-03T10:00:00'), from: '2026-10-01', to: '2026-10-31' });
	const lines = txt.trim().split('\r\n');
	it('beginnt mit dem EXTF-Kopf', () => {
		expect(lines[0].startsWith('"EXTF";700;21;"Buchungsstapel";12;20261103100000000')).toBe(true);
		expect(lines[0]).toContain(';12345;1;20260101;4;20261001;20261031;');
	});
	it('hat in Überschrift und Datenzeile gleich viele Spalten', () => {
		expect(lines[2].split(';').length).toBe(lines[1].split(';').length);
	});
	it('kodiert Umlaute als einzelne Bytes', () => {
		expect(Array.from(toWin1252('äöüß'))).toEqual([228, 246, 252, 223]);
	});
});
