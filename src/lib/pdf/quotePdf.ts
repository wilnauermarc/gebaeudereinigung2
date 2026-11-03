/** Angebots-PDF: Textteil auf dem DIN-5008-Briefrahmen aus letterPdf.ts. Die interne Kalkulationsnotiz wird bewusst nie übergeben. */
import { frequencies, quoteKind } from '../labels';
import { formatDate, formatEur } from '../format';
import type { Company } from '../company';
import type { Customer, Quote, Site } from '../types';
import { BODY_W, MM, X_BODY, X_RIGHT, accent, buildLetter, clean, fill, gray, ink, light, wrap } from './letterPdf';

export { wrap };

export interface QuotePdfInput {
	quote: Pick<Quote, 'number' | 'version' | 'kind' | 'hourlyCents' | 'effortText' | 'monthlyCents' | 'initialHourlyCents' | 'items' | 'sentAt'>;
	customer: Pick<Customer, 'name' | 'street' | 'postal' | 'city' | 'contacts'>;
	site?: Pick<Site, 'name' | 'street' | 'postal' | 'city'> | null;
	company: Company;
}

export function buildQuotePdf({ quote, customer, site, company }: QuotePdfInput): Promise<Uint8Array> {
	const info: [string, string][] = [
		['Angebot Nr.', quote.version > 1 ? `${quote.number} (Version ${quote.version})` : quote.number],
		['Datum', formatDate(quote.sentAt ?? new Date().toISOString())],
		['Ansprechperson', company.owner],
		['Telefon', company.phone]
	];
	if (site) info.push(['Objekt', site.name]);

	return buildLetter({
		company,
		recipient: { name: customer.name, contactName: customer.contacts[0]?.name, street: customer.street, postal: customer.postal, city: customer.city },
		subject: `Angebot ${quoteKind[quote.kind]}`,
		info,
		title: `Angebot ${quote.number}`,
		runningTitle: `Angebot ${quote.number}${quote.version > 1 ? ` (Version ${quote.version})` : ''}`,
		body: (c) => {
			const { paragraph, ensure, text, Y } = c;
			paragraph('Sehr geehrte Damen und Herren,', { gap: 3 });
			const where = site ? `das Objekt „${site.name}“ (${[site.street, `${site.postal} ${site.city}`.trim()].filter(Boolean).join(', ')})` : 'Ihr Objekt';
			paragraph(`vielen Dank für Ihre Anfrage und das entgegengebrachte Vertrauen. Gern bieten wir Ihnen für ${where} die nachfolgend aufgeführten Leistungen an.`, { gap: 5 });

			// Leistungen nach Häufigkeit gruppiert
			const groups = new Map<string, string[]>();
			for (const it of quote.items) if (it.text.trim() && !it.optional) (groups.get(it.frequency) ?? groups.set(it.frequency, []).get(it.frequency)!).push(it.text.trim());
			const ordered = [...groups.entries()].sort((a, b) => frequencies.indexOf(a[0]) - frequencies.indexOf(b[0]));
			paragraph('Leistungsumfang', { f: c.bold, size: 10.5, gap: 1.5 });
			for (const [freq, items] of ordered) {
				ensure(14);
				paragraph(freq, { f: c.bold, gap: 0.8 });
				for (const t of items) {
					const lines = wrap(t, c.font, 10, BODY_W - 8 * MM);
					ensure(lines.length * 4.7 + 0.5);
					text(c.page(), '•', X_BODY + 1.5 * MM, c.y + 3.5, { size: 10 });
					paragraph(t, { x: X_BODY + 6 * MM, gap: 0.6 });
				}
				c.y += 2;
			}

			// ── Preisblock ──
			const unit = quote.kind === 'unterhaltsreinigung' ? 'Monatspauschale' : 'Stundenpreis';
			const net = quote.kind === 'unterhaltsreinigung' ? quote.monthlyCents : quote.hourlyCents;
			const vat = net != null ? Math.round(net * 0.19) : null;
			const rows: [string, string, boolean][] = [
				[`${unit} (netto)`, formatEur(net), false],
				['zzgl. 19 % Umsatzsteuer', formatEur(vat), false],
				[`${unit} (brutto)`, formatEur(net != null && vat != null ? net + vat : null), true]
			];
			const extra: string[] = [];
			if (quote.kind === 'unterhaltsreinigung' && quote.initialHourlyCents) extra.push(`Anfangsreinigung nach Aufwand: ${formatEur(quote.initialHourlyCents)} je Stunde (netto)`);
			if (quote.kind === 'sonderreinigung' && quote.effortText.trim()) extra.push(`Geschätzter Aufwand: ${quote.effortText.trim()}`);
			const boxH = 6 + rows.length * 6 + extra.length * 5 + 3;
			ensure(boxH + 14);
			c.y += 2;
			paragraph('Vergütung', { f: c.bold, size: 10.5, gap: 1 });
			c.y += 1;
			const p = c.page();
			p.drawRectangle({ x: X_BODY, y: Y(c.y + boxH), width: BODY_W, height: boxH * MM, color: fill });
			p.drawRectangle({ x: X_BODY, y: Y(c.y + boxH), width: 1.2 * MM, height: boxH * MM, color: accent });
			let ry = c.y + 6.5;
			for (const [label, value, strong] of rows) {
				text(p, label, X_BODY + 6 * MM, ry, { size: 10, f: strong ? c.bold : c.font });
				text(p, value, X_RIGHT - 4 * MM, ry, { size: strong ? 11 : 10, f: strong ? c.bold : c.font, right: true });
				if (strong) p.drawLine({ start: { x: X_BODY + 6 * MM, y: Y(ry - 4.6) }, end: { x: X_RIGHT - 4 * MM, y: Y(ry - 4.6) }, thickness: 0.4, color: light });
				ry += 6;
			}
			for (const e of extra) { text(p, e, X_BODY + 6 * MM, ry, { size: 9, color: gray }); ry += 5; }
			c.y += boxH + 6;

			// ── Optionale Leistungen ──
			const options = quote.items.filter((i) => i.optional && i.text.trim());
			if (options.length) {
				ensure(20);
				paragraph('Optionale Leistungen (nicht im Preis enthalten)', { f: c.bold, size: 10.5, gap: 1.5 });
				const per = quote.kind === 'unterhaltsreinigung' ? 'pro Monat' : 'pro Stunde';
				for (const o of options) {
					const price = o.extraCents ? `+ ${formatEur(o.extraCents)} ${per} (netto)` : 'Preis auf Anfrage';
					const lines = wrap(o.text.trim(), c.font, 10, BODY_W - 6 * MM - 52 * MM);
					ensure(lines.length * 4.7 + 1);
					const startY = c.y;
					text(c.page(), '•', X_BODY + 1.5 * MM, startY + 3.5, { size: 10 });
					paragraph(`${o.text.trim()} (${o.frequency})`, { x: X_BODY + 6 * MM, width: BODY_W - 6 * MM - 52 * MM, gap: 0.6 });
					text(c.page(), price, X_RIGHT, startY + 3.5, { size: 10, right: true, color: gray });
				}
				c.y += 4;
			}

			// ── Schluss ──
			paragraph('Wir freuen uns auf Ihre Rückmeldung und stehen für Rückfragen oder einen Vor-Ort-Termin jederzeit gern zur Verfügung.', { gap: 6 });
			ensure(30);
			paragraph('Mit freundlichen Grüßen', { gap: 14 });
			paragraph(company.owner, { f: c.bold });
			paragraph(company.name, { color: gray });
			c.y += 8;

			// ── Rückantwort ──
			ensure(78);
			let pg = c.page();
			pg.drawLine({ start: { x: X_BODY, y: Y(c.y) }, end: { x: X_RIGHT, y: Y(c.y) }, thickness: 0.5, color: gray, dashArray: [3, 3] });
			c.y += 6;
			paragraph(`Rückantwort zu Angebot ${quote.number}`, { f: c.bold, size: 10.5, gap: 2 });
			const box = (label: string, withLine = false) => {
				ensure(8);
				pg = c.page();
				pg.drawRectangle({ x: X_BODY, y: Y(c.y + 3.2), width: 3.4 * MM, height: 3.4 * MM, borderColor: ink, borderWidth: 0.7 });
				text(pg, label, X_BODY + 6 * MM, c.y + 2.5, { size: 10 });
				if (withLine) {
					const x0 = X_BODY + 6 * MM + c.font.widthOfTextAtSize(clean(label, c.font), 10) + 3 * MM;
					pg.drawLine({ start: { x: x0, y: Y(c.y + 2.5) }, end: { x: X_RIGHT, y: Y(c.y + 2.5) }, thickness: 0.4, color: gray });
				}
				c.y += 7;
			};
			box('Wir nehmen das Angebot an.');
			box('Wir haben Rückfragen, bitte rufen Sie uns an.');
			box('Wir wünschen Änderungen:', true);
			c.y += 1;
			paragraph('Rechnungsversand', { f: c.bold, gap: 1 });
			box('per E-Mail an:', true);
			box('per Post');
			c.y += 8;
			ensure(14);
			pg = c.page();
			const sigY = c.y + 8;
			pg.drawLine({ start: { x: X_BODY, y: Y(sigY) }, end: { x: X_BODY + 70 * MM, y: Y(sigY) }, thickness: 0.4, color: gray });
			pg.drawLine({ start: { x: X_BODY + 85 * MM, y: Y(sigY) }, end: { x: X_RIGHT, y: Y(sigY) }, thickness: 0.4, color: gray });
			text(pg, 'Ort, Datum', X_BODY, sigY + 3.5, { size: 7.5, color: gray });
			text(pg, 'Unterschrift, Stempel', X_BODY + 85 * MM, sigY + 3.5, { size: 7.5, color: gray });
		}
	});
}
