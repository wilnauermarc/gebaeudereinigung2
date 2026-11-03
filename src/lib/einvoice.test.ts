import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { buildFacturX, checkInvoice, embedFacturX } from './einvoice';
import { buildInvoicePdf } from './pdf/documentsPdf';
import { company as demo } from './company';

const customer = { name: 'Praxis & Co', street: 'Weg 1', postal: '12345', city: 'Ort', contacts: [{ id: 'c', name: 'A', role: '', email: 'a@b.de', phone: '' }] };
const invoice = { number: 'R-1', issuedOn: '2026-10-16', dueOn: '2026-10-30', netCents: 100000, period: '2026-10', description: 'Reinigung' };
const good = { ...demo, taxId: 'USt-IdNr. DE123456789', iban: 'DE89 3704 0044 0532 0130 00', email: 'buero@reinigung.de', phone: '0170 123456' };

describe('E-Rechnung Prüfung', () => {
	it('meldet Platzhalter der Demo-Firmendaten als Fehler', () => {
		const errs = checkInvoice(demo, customer, invoice).filter((x) => x.level === 'error').map((x) => x.text).join(' ');
		expect(errs).toContain('Umsatzsteuer-ID');
		expect(errs).toContain('IBAN');
		expect(errs).toContain('E-Mail');
	});
	it('akzeptiert vollständige Angaben ohne Fehler', () => {
		expect(checkInvoice(good, customer, invoice).filter((x) => x.level === 'error')).toEqual([]);
	});
	it('warnt ohne Leitweg-ID', () => {
		expect(checkInvoice(good, customer, invoice).some((x) => x.level === 'warn' && x.text.includes('Leitweg'))).toBe(true);
	});
});
describe('Factur-X', () => {
	it('rechnet Summen und maskiert Zeichen', () => {
		const xml = buildFacturX({ company: good, customer, invoice });
		expect(xml).toContain('<ram:GrandTotalAmount>1190.00</ram:GrandTotalAmount>');
		expect(xml).toContain('Praxis &amp; Co');
		expect(xml).toContain('urn:cen.eu:en16931:2017');
	});
	it('bettet das XML in die PDF ein', async () => {
		const pdf = await buildInvoicePdf({ company: good, customer, invoice });
		const out = await embedFacturX(pdf, buildFacturX({ company: good, customer, invoice }));
		const doc = await PDFDocument.load(out);
		expect(doc.getPageCount()).toBe(1);
		expect(new TextDecoder('latin1').decode(out)).toContain('factur-x.xml');
	});
});
