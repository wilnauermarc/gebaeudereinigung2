import { describe, expect, it } from 'vitest';
import { PDFDocument, PDFRawStream, decodePDFRawStream } from 'pdf-lib';
import { buildQuotePdf, type QuotePdfInput } from './quotePdf';
import { company } from '../company';

const hex = (s: string) => [...s].map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join('');
const latin = (b: Uint8Array) => new TextDecoder('latin1').decode(b);
/** Entpackt alle Inhaltsströme, damit der gezeichnete Text durchsuchbar wird. */
async function drawnText(bytes: Uint8Array) {
	const doc = await PDFDocument.load(bytes);
	let out = '';
	for (const [, obj] of doc.context.enumerateIndirectObjects())
		if (obj instanceof PDFRawStream) out += latin(decodePDFRawStream(obj).decode()) + '\n';
	return out;
}

const base = (items = 3): QuotePdfInput => ({
	company,
	customer: { name: 'Praxis Dr. Beispiel – Gemeinschaftspraxis für Allgemeinmedizin und Innere Medizin', street: 'Marktplatz 7', postal: '12347', city: 'Beispieldorf', contacts: [{ id: 'c', name: 'Sabine Muster', role: '', email: '', phone: '' }] },
	site: { name: 'Praxisräume 2. OG', street: 'Marktplatz 7', postal: '12347', city: 'Beispieldorf' },
	quote: {
		number: 'A-2026-0099', version: 1, kind: 'unterhaltsreinigung', hourlyCents: null, effortText: '', monthlyCents: 215000, initialHourlyCents: 3500, sentAt: null,
		items: Array.from({ length: items }, (_, i) => ({ id: `i${i}`, text: `Leistung Nummer ${i + 1} mit etwas längerem Text, damit der Zeilenumbruch greift`, frequency: i % 2 ? '1 x pro Woche' : '5 x pro Woche' }))
	}
});

describe('Angebots-PDF (DIN 5008)', () => {
	it('erzeugt ein gültiges A4-PDF (Rückantwort steht auf Seite 2)', async () => {
		const bytes = await buildQuotePdf(base());
		expect(latin(bytes.slice(0, 5))).toBe('%PDF-');
		const doc = await PDFDocument.load(bytes);
		expect(doc.getPageCount()).toBe(2);
		const { width, height } = doc.getPage(0).getSize();
		expect(Math.round(width)).toBe(595);
		expect(Math.round(height)).toBe(842);
	});
	it('bricht lange Leistungslisten auf Folgeseiten um', async () => {
		const doc = await PDFDocument.load(await buildQuotePdf(base(60)));
		expect(doc.getPageCount()).toBeGreaterThan(1);
	});
	it('enthält Kundenanschrift, aber keine interne Notiz (wird gar nicht übergeben)', async () => {
		const input = base();
		(input.quote as Record<string, unknown>).calculationNote = 'GEHEIMNOTIZ';
		const text = await drawnText(await buildQuotePdf(input));
		expect(text).toContain(hex('A-2026-0099'));
		expect(text).not.toContain(hex('GEHEIMNOTIZ'));
	});
	it('führt Optionen getrennt mit Aufpreis auf und lässt sie aus dem Leistungsumfang heraus', async () => {
		const input = base();
		input.quote.items.push({ id: 'o1', text: 'Teppichreinigung OPTIONSTEXT', frequency: 'Vierteljährlich', optional: true, extraCents: 8500 });
		const text = await drawnText(await buildQuotePdf(input));
		expect(text).toContain(hex('Optionale Leistungen'));
		expect(text).toContain(hex('OPTIONSTEXT'));
	});
	it('ersetzt nicht darstellbare Zeichen statt abzubrechen', async () => {
		const input = base();
		input.quote.items[0].text = 'Fenster 🪟 reinigen';
		await expect(buildQuotePdf(input)).resolves.toBeInstanceOf(Uint8Array);
	});
});
