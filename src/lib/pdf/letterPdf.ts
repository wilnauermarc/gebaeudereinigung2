/**
 * Gemeinsamer Briefrahmen nach DIN 5008 Form B (Briefkopf 45 mm, Anschriftfeld 85 × 45 mm ab 45 mm,
 * Falz- und Lochmarke, Betreff ab 98,46 mm, Fußzeile, Folgeseiten mit Kopfzeile).
 * Läuft komplett im Browser mit pdf-lib und Standardschrift Helvetica. Angebot, Preisanpassung und
 * Mahnung füllen nur noch den Textteil über den `body`-Callback.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { Company } from '../company';

export const MM = 72 / 25.4;
const PAGE_W = 595.28;
const PAGE_H = 841.89;
export const X_BODY = 25 * MM;
export const X_RIGHT = PAGE_W - 20 * MM;
const X_ADDR = 20 * MM;
export const BODY_W = X_RIGHT - X_BODY;
const BODY_BOTTOM = 266; // mm von oben, darunter beginnt die Fußzeile
const CONT_TOP = 32; // Textbeginn auf Folgeseiten (mm)

export const ink = rgb(0.1, 0.11, 0.12);
export const gray = rgb(0.38, 0.4, 0.43);
export const light = rgb(0.82, 0.83, 0.84);
export const accent = rgb(0.06, 0.42, 0.48);
export const fill = rgb(0.965, 0.968, 0.97);
type Color = ReturnType<typeof rgb>;

/** Zeichen außerhalb des WinAnsi-Zeichensatzes ersetzen, sonst bricht pdf-lib ab (z. B. Emojis). */
export function clean(s: string, font: PDFFont) {
	const set = new Set(font.getCharacterSet());
	return [...s.replace(/[  ]/g, ' ').replace(/[‘’]/g, "'").replace(/\t/g, ' ')]
		.map((ch) => (set.has(ch.codePointAt(0)!) ? ch : '?'))
		.join('');
}

export function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
	const lines: string[] = [];
	for (const para of clean(text, font).split(/\r?\n/)) {
		let line = '';
		for (const word of para.split(' ')) {
			let w = word;
			while (font.widthOfTextAtSize(w, size) > maxWidth) {
				let cut = w.length - 1;
				while (cut > 1 && font.widthOfTextAtSize(w.slice(0, cut), size) > maxWidth) cut--;
				if (line) { lines.push(line); line = ''; }
				lines.push(w.slice(0, cut));
				w = w.slice(cut);
			}
			const next = line ? `${line} ${w}` : w;
			if (line && font.widthOfTextAtSize(next, size) > maxWidth) {
				lines.push(line);
				line = w;
			} else line = next;
		}
		lines.push(line);
	}
	return lines;
}

export interface LetterInput {
	company: Company;
	recipient: { name: string; contactName?: string; street: string; postal: string; city: string };
	/** Betreff (fett, ab 98,46 mm) */
	subject: string;
	/** Informationsblock rechts: [Beschriftung, Wert] */
	info: [string, string][];
	/** Kurzbezeichnung für die Kopfzeile der Folgeseiten */
	runningTitle: string;
	title: string;
	body: (c: LetterCtx) => void;
}

export interface LetterCtx {
	font: PDFFont;
	bold: PDFFont;
	/** aktuelle Seite (wechselt bei Seitenumbruch) */
	page: () => PDFPage;
	/** Schreibposition in mm von oben */
	y: number;
	Y: (mm: number) => number;
	text: (p: PDFPage, s: string, x: number, topMm: number, o?: { size?: number; f?: PDFFont; color?: Color; right?: boolean }) => void;
	ensure: (h: number) => void;
	paragraph: (s: string, o?: { size?: number; f?: PDFFont; x?: number; width?: number; lead?: number; color?: Color; gap?: number }) => void;
}

export async function buildLetter(input: LetterInput): Promise<Uint8Array> {
	const { company, recipient, subject, info } = input;
	const pdf = await PDFDocument.create();
	const font = await pdf.embedFont(StandardFonts.Helvetica);
	const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
	pdf.setTitle(input.title);
	pdf.setAuthor(company.name);
	pdf.setCreator('Putzbetrieb');
	pdf.setLanguage('de-DE');

	const pages: PDFPage[] = [];
	let page = pdf.addPage([PAGE_W, PAGE_H]);
	pages.push(page);

	const Y = (mm: number) => PAGE_H - mm * MM;
	const text: LetterCtx['text'] = (p, s, x, topMm, o = {}) => {
		const f = o.f ?? font, size = o.size ?? 10;
		const t = clean(s, f);
		const w = f.widthOfTextAtSize(t, size);
		p.drawText(t, { x: o.right ? x - w : x, y: Y(topMm), size, font: f, color: o.color ?? ink });
	};
	const ctx: LetterCtx = {
		font, bold, Y, text,
		y: 0,
		page: () => page,
		ensure(h) {
			if (ctx.y + h <= BODY_BOTTOM) return;
			page = pdf.addPage([PAGE_W, PAGE_H]);
			pages.push(page);
			ctx.y = CONT_TOP;
		},
		paragraph(s, o = {}) {
			const size = o.size ?? 10, f = o.f ?? font, lead = o.lead ?? size * 0.47 * 1.45;
			const x = o.x ?? X_BODY;
			for (const line of wrap(s, f, size, o.width ?? BODY_W - (x - X_BODY))) {
				ctx.ensure(lead);
				text(page, line, x, ctx.y + size * 0.3528, { size, f, color: o.color });
				ctx.y += lead;
			}
			ctx.y += o.gap ?? 0;
		}
	};

	// ── Briefkopf (0–45 mm) ──
	text(page, company.name, X_ADDR, 17, { size: 17, f: bold, color: accent });
	text(page, `Inhaberin ${company.owner}`, X_ADDR, 22.5, { size: 8.5, color: gray });
	page.drawLine({ start: { x: X_ADDR, y: Y(28) }, end: { x: X_RIGHT, y: Y(28) }, thickness: 0.6, color: accent });
	[company.street, `${company.postal} ${company.city}`, `Telefon ${company.phone}`, company.email].forEach((l, i) =>
		text(page, l, X_RIGHT, 12 + i * 3.8, { size: 8, color: gray, right: true })
	);

	// ── Anschriftfeld: Rücksendeangabe (45 mm), Anschrift ab 62,7 mm ──
	text(page, `${company.name} · ${company.street} · ${company.postal} ${company.city}`, X_ADDR, 50, { size: 7, color: gray });
	page.drawLine({ start: { x: X_ADDR, y: Y(51.2) }, end: { x: X_ADDR + 85 * MM, y: Y(51.2) }, thickness: 0.3, color: light });
	let nameLines = wrap(recipient.name, bold, 10, 82 * MM);
	if (nameLines.length > 3) nameLines = [...nameLines.slice(0, 2), nameLines[2].replace(/.{0,2}$/, '') + '…'];
	const addr = [...nameLines];
	if (recipient.contactName) addr.push(`z. H. ${recipient.contactName}`);
	if (recipient.street) addr.push(recipient.street);
	addr.push(`${recipient.postal} ${recipient.city}`.trim());
	addr.slice(0, 6).forEach((l, i) => text(page, l, X_ADDR, 66 + i * 4.6, { size: 10, f: i < nameLines.length ? bold : font }));

	// ── Informationsblock rechts (ab 125 mm) ──
	const X_INFO = 125 * MM;
	let iy = 52;
	for (const [k, v] of info) {
		text(page, k, X_INFO, iy, { size: 7.5, color: gray });
		const vl = wrap(v, font, 9.5, X_RIGHT - X_INFO);
		vl.slice(0, 2).forEach((l, i) => text(page, l, X_INFO, iy + 4 + i * 4, { size: 9.5 }));
		iy += 4 + Math.min(2, vl.length) * 4 + 2;
	}

	// ── Betreff und Text (Betreff ab 98,46 mm) ──
	ctx.y = 98.5;
	ctx.paragraph(subject, { size: 11.5, f: bold, gap: 6 });
	input.body(ctx);

	// ── Marken, Kopf der Folgeseiten, Fußzeile und Seitenzahlen auf allen Seiten ──
	const total = pages.length;
	pages.forEach((p, i) => {
		for (const [mmY, len] of [[105, 5], [148.5, 8], [210, 5]] as const)
			p.drawLine({ start: { x: 5 * MM, y: Y(mmY) }, end: { x: (5 + len) * MM, y: Y(mmY) }, thickness: 0.5, color: gray });
		if (i > 0) {
			text(p, `${company.name} · ${input.runningTitle}`, X_BODY, 18, { size: 8.5, color: gray });
			p.drawLine({ start: { x: X_BODY, y: Y(21) }, end: { x: X_RIGHT, y: Y(21) }, thickness: 0.4, color: light });
		}
		p.drawLine({ start: { x: X_ADDR, y: Y(271) }, end: { x: X_RIGHT, y: Y(271) }, thickness: 0.4, color: light });
		const cols: string[][] = [
			[company.name, company.street, `${company.postal} ${company.city}`],
			[`Telefon ${company.phone}`, company.email, company.web],
			[company.bank, `IBAN ${company.iban}`, `BIC ${company.bic}`, company.taxId]
		];
		cols.forEach((col, ci) => col.forEach((l, li) => text(p, l, X_ADDR + ci * 60 * MM, 276 + li * 3.4, { size: 7.5, color: gray })));
		text(p, `Seite ${i + 1} von ${total}`, X_RIGHT, 291, { size: 7.5, color: gray, right: true });
	});

	return pdf.save();
}
