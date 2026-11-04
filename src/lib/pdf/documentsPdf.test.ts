import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { buildInvoicePdf, buildPriceAdjustPdf, buildReminderPdf, buildServiceProofPdf } from './documentsPdf';
import { company } from '../company';

const customer = { name: 'Seniorenresidenz Abendrot', street: 'Abendrotweg 9', postal: '12353', city: 'Beispieldorf', contacts: [{ id: 'c', name: 'Ute Lindner', role: '', email: '', phone: '' }] };
const invoice = { number: 'R-2026-0107', issuedOn: '2026-10-16', dueOn: '2026-10-30', netCents: 398000, period: '2026-10', description: 'Reinigungsleistungen laut Vertrag' };

describe('Geschäftsbriefe', () => {
	it('Rechnung ist ein einseitiges A4-PDF', async () => {
		const doc = await PDFDocument.load(await buildInvoicePdf({ company, customer, invoice }));
		expect(doc.getPageCount()).toBe(1);
	});
	it('Rechnung mit mehreren Positionen (Zusatzleistungen) bleibt ein gültiges PDF', async () => {
		const description = ['Zusatzleistungen nach Absprache:', 'Grundreinigung Teeküche am 05.10.2026: 3 Std. × 38,00 € = 114,00 €', 'Fensterreinigung Treppenhaus am 12.10.2026: 1 pauschal × 140,00 € = 140,00 €'].join('\n');
		const doc = await PDFDocument.load(await buildInvoicePdf({ company, customer, invoice: { ...invoice, period: null, netCents: 25400, description } }));
		expect(doc.getPageCount()).toBe(1);
	});
	it('Leistungsnachweis mit vielen Einsätzen läuft über mehrere Seiten und bleibt gültig', async () => {
		const rows = Array.from({ length: 45 }, (_, i) => ({ date: `2026-10-${String((i % 28) + 1).padStart(2, '0')}`, presence: 'ja (Sven, 2,5 Std.)', execution: i % 7 === 0 ? 'teilweise' : 'vollständig', missed: i % 7 === 0 ? ['WC: Sanitär reinigen'] : [], note: '', acceptance: 'abgenommen' }));
		const bytes = await buildServiceProofPdf({ company, customer, siteName: 'Haupthaus', siteAddress: 'Abendrotweg 9, 12353 Beispieldorf', month: '2026-10', rows, lv: [{ room: 'WC', task: 'Sanitär reinigen', interval: 'an jedem Einsatz' }], lvFrom: '2026-01-01', today: '2026-11-04' });
		const doc = await PDFDocument.load(bytes);
		expect(doc.getPageCount()).toBeGreaterThan(1);
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
