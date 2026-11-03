import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { buildInvoicePdf, buildPriceAdjustPdf, buildReminderPdf } from './documentsPdf';
import { company } from '../company';

const customer = { name: 'Seniorenresidenz Abendrot', street: 'Abendrotweg 9', postal: '12353', city: 'Beispieldorf', contacts: [{ id: 'c', name: 'Ute Lindner', role: '', email: '', phone: '' }] };
const invoice = { number: 'R-2026-0107', issuedOn: '2026-10-16', dueOn: '2026-10-30', netCents: 398000, period: '2026-10', description: 'Reinigungsleistungen laut Vertrag' };

describe('Geschäftsbriefe', () => {
	it('Rechnung ist ein einseitiges A4-PDF', async () => {
		const doc = await PDFDocument.load(await buildInvoicePdf({ company, customer, invoice }));
		expect(doc.getPageCount()).toBe(1);
	});
	it('Zahlungserinnerung und Mahnung werden erzeugt', async () => {
		for (const stage of [1, 2] as const) {
			const bytes = await buildReminderPdf({ company, customer, invoice, stage, today: '2026-11-02', deadline: '2026-11-09' });
			expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
		}
	});
	it('Preisanpassungsschreiben wird erzeugt', async () => {
		const bytes = await buildPriceAdjustPdf({ company, customer, oldCents: 398000, newCents: 405000, validFrom: '2027-05-01', reason: 'Tarifliche Entwicklung.', today: '2026-11-02', quoteNumber: 'A-2026-0015' });
		expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
	});
});

import { buildMonthlyReportPdf } from './documentsPdf';
describe('Leistungsbericht', () => {
	it('wird auch ohne Daten erzeugt', async () => {
		const bytes = await buildMonthlyReportPdf({ company, customer, month: '2026-10', today: '2026-11-02', sites: [], inspections: [], defects: [] });
		expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
	});
	it('listet Einsätze, Begehungen und Mängel', async () => {
		const bytes = await buildMonthlyReportPdf({ company, customer, month: '2026-10', today: '2026-11-02', sites: [{ name: 'Haupthaus', visits: 22, hours: 176 }], inspections: [{ siteName: 'Haupthaus', date: '2026-10-12', score: 83, flaws: ['Glas und Fenster'] }], defects: [{ title: 'Handläufe staubig', status: 'behoben', reportedOn: '2026-10-01' }] });
		expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
	});
});
