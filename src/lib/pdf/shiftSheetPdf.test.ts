import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { buildShiftSheetPdf } from './shiftSheetPdf';
import { buildCalcSheetPdf, buildReferencesPdf } from './documentsPdf';
import { company } from '../company';

describe('Einsatzzettel und Ausschreibungsunterlagen', () => {
	it('erzeugt eine Seite je Person', async () => {
		const day = { label: 'Montag, 02.11.', entries: [{ time: '17:00–19:00', customer: 'Hausverwaltung Lindenhof GmbH & Co. KG', site: 'Treppenhaus', address: 'Lindenweg 4', mates: 'Sven' }] };
		const bytes = await buildShiftSheetPdf([{ company, person: 'Jana Petrov', weekLabel: 'KW 45', days: [day, { label: 'Dienstag, 03.11.', entries: [] }] }, { company, person: 'Sven Lorenz', weekLabel: 'KW 45', days: [day] }]);
		expect((await PDFDocument.load(bytes)).getPageCount()).toBe(2);
	});
	it('Referenzliste und Kalkulationsblatt werden erzeugt', async () => {
		const ref = await buildReferencesPdf({ company, today: '2026-11-03', rows: [{ customer: 'Seniorenresidenz', object: 'Haupthaus', area: 1850, since: '2025-11-01', contact: 'U. Lindner' }] });
		expect((await PDFDocument.load(ref)).getPageCount()).toBe(1);
		const sheet = await buildCalcSheetPdf({ company, today: '2026-11-03', calc: { wageCents: 1500, lnkPct: 25, productivePct: 75, materialPct: 6, machinePct: 3, overheadPct: 18, profitPct: 12 }, rateCents: 3556, example: { label: 'Büro', areaM2: 1800, perHour: 450, perWeek: 5, monthlyHours: 86.7 } });
		expect((await PDFDocument.load(sheet)).getPageCount()).toBe(1);
	});
});
