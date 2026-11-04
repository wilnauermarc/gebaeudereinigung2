/** Einsatzzettel: übersichtliche Wochenübersicht je Person, große Schrift, einfache Sprache. Eine Seite je Person. */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { clean, wrap } from './letterPdf';
import type { Company } from '../company';

export interface ShiftDay {
	/** z. B. „Montag, 02.11.“ */
	label: string;
	entries: { time: string; customer: string; site: string; address: string; mates: string }[];
}
export interface ShiftSheet {
	company: Company;
	person: string;
	weekLabel: string;
	days: ShiftDay[];
}

const MM = 72 / 25.4;
const accent = rgb(0.85, 0.35, 0.08);

export async function buildShiftSheetPdf(sheets: ShiftSheet[]): Promise<Uint8Array> {
	const pdf = await PDFDocument.create();
	const font = await pdf.embedFont(StandardFonts.Helvetica);
	const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
	pdf.setTitle('Einsatzzettel');
	pdf.setCreator('Putzbetrieb');
	pdf.setLanguage('de-DE');
	for (const s of sheets) {
		let page = pdf.addPage([595.28, 841.89]);
		let y = 841.89 - 20 * MM;
		const L = 18 * MM, R = 595.28 - 18 * MM;
		const text = (t: string, x: number, size: number, f = font, color = rgb(0.1, 0.11, 0.12)) => page.drawText(clean(t, f), { x, y, size, font: f, color });
		text(s.company.name.toUpperCase(), L, 10, bold, accent); y -= 9 * MM;
		text('Einsatzzettel', L, 26, bold); y -= 9 * MM;
		text(`${s.person}  ·  ${s.weekLabel}`, L, 14, font, rgb(0.38, 0.4, 0.43)); y -= 4 * MM;
		page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness: 1.2, color: accent }); y -= 9 * MM;
		for (const d of s.days) {
			const need = (d.entries.length ? d.entries.length * 17 : 9) * MM + 11 * MM;
			if (y - need < 22 * MM) { page = pdf.addPage([595.28, 841.89]); y = 841.89 - 20 * MM; }
			text(d.label, L, 14, bold); y -= 7 * MM;
			if (!d.entries.length) { text('frei', L + 4 * MM, 12, font, rgb(0.6, 0.62, 0.64)); y -= 9 * MM; continue; }
			for (const e of d.entries) {
				page.drawRectangle({ x: L, y: y - 11.5 * MM, width: 2 * MM, height: 14 * MM, color: accent });
				text(e.time, L + 6 * MM, 14, bold);
				const lines = wrap(e.customer, bold, 12, R - L - 42 * MM);
				page.drawText(clean(lines[0] ?? '', bold), { x: L + 36 * MM, y, size: 12, font: bold, color: rgb(0.1, 0.11, 0.12) });
				page.drawText(clean(`${e.site}, ${e.address}`.slice(0, 80), font), { x: L + 36 * MM, y: y - 5 * MM, size: 10.5, font, color: rgb(0.2, 0.22, 0.25) });
				if (e.mates) page.drawText(clean(`Mit: ${e.mates}`.slice(0, 80), font), { x: L + 36 * MM, y: y - 10 * MM, size: 10, font, color: rgb(0.45, 0.47, 0.5) });
				y -= 17 * MM;
			}
			y -= 4 * MM;
		}
		page.drawText(clean('Bei Fragen oder Krankheit bitte sofort im Büro melden: ' + s.company.phone, font), { x: L, y: 14 * MM, size: 10, font, color: rgb(0.38, 0.4, 0.43) });
	}
	return pdf.save();
}
