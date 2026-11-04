/** Rechnung, Zahlungserinnerung/Mahnung und Preisanpassungsschreiben auf dem DIN-5008-Briefrahmen. */
import type { Company } from '../company';
import { formatDate, formatEur } from '../format';
import type { Customer } from '../types';
import { BODY_W, MM, X_BODY, X_RIGHT, accent, buildLetter, fill, gray, light } from './letterPdf';

type Cust = Pick<Customer, 'name' | 'street' | 'postal' | 'city' | 'contacts'>;
const recipient = (c: Cust) => ({ name: c.name, contactName: c.contacts[0]?.name, street: c.street, postal: c.postal, city: c.city });
export const VAT = 0.19;

export interface InvoiceDoc {
	number: string;
	issuedOn: string;
	dueOn: string;
	netCents: number;
	/** YYYY-MM */
	period: string | null;
	description: string;
}

function table(c: Parameters<Parameters<typeof buildLetter>[0]['body']>[0], rows: [string, string, boolean][]) {
	c.ensure(rows.length * 6 + 10);
	const p = c.page();
	const h = rows.length * 6 + 5;
	p.drawRectangle({ x: X_BODY, y: c.Y(c.y + h), width: BODY_W, height: h * MM, color: fill });
	p.drawRectangle({ x: X_BODY, y: c.Y(c.y + h), width: 1.2 * MM, height: h * MM, color: accent });
	let ry = c.y + 6;
	for (const [l, v, strong] of rows) {
		c.text(p, l, X_BODY + 6 * MM, ry, { size: 10, f: strong ? c.bold : c.font });
		c.text(p, v, X_RIGHT - 4 * MM, ry, { size: strong ? 11 : 10, f: strong ? c.bold : c.font, right: true });
		if (strong) p.drawLine({ start: { x: X_BODY + 6 * MM, y: c.Y(ry - 4.6) }, end: { x: X_RIGHT - 4 * MM, y: c.Y(ry - 4.6) }, thickness: 0.4, color: light });
		ry += 6;
	}
	c.y += h + 6;
}
const monthLong = (period: string) => new Date(period + '-15T12:00:00Z').toLocaleDateString('de-DE', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export function buildInvoicePdf(o: { company: Company; customer: Cust; invoice: InvoiceDoc }) {
	const { company, customer, invoice: inv } = o;
	const vat = Math.round(inv.netCents * VAT);
	return buildLetter({
		company, recipient: recipient(customer), subject: `Rechnung ${inv.number}`,
		title: `Rechnung ${inv.number}`, runningTitle: `Rechnung ${inv.number}`,
		info: [['Rechnungs-Nr.', inv.number], ['Rechnungsdatum', formatDate(inv.issuedOn)], ['Leistungszeitraum', inv.period ? monthLong(inv.period) : 'siehe Beschreibung'], ['Zahlbar bis', formatDate(inv.dueOn)]],
		body: (c) => {
			c.paragraph('Sehr geehrte Damen und Herren,', { gap: 3 });
			c.paragraph('für die im genannten Zeitraum erbrachten Leistungen berechnen wir Ihnen:', { gap: 4 });
			inv.description.split('\n').forEach((line, i, all) => c.paragraph(line, { f: i === 0 ? c.bold : c.font, gap: i === all.length - 1 ? 4 : 1 }));
			table(c, [
				['Nettobetrag', formatEur(inv.netCents), false],
				['zzgl. 19 % Umsatzsteuer', formatEur(vat), false],
				['Rechnungsbetrag (brutto)', formatEur(inv.netCents + vat), true]
			]);
			c.paragraph(`Bitte überweisen Sie den Rechnungsbetrag bis zum ${formatDate(inv.dueOn)} ohne Abzug unter Angabe der Rechnungsnummer auf das unten genannte Konto.`, { gap: 5 });
			c.paragraph('Vielen Dank für Ihr Vertrauen.', { gap: 5 });
			c.paragraph('Mit freundlichen Grüßen', { gap: 12 });
			c.paragraph(company.owner, { f: c.bold });
			c.paragraph(company.name, { color: gray });
		}
	});
}

export function buildReminderPdf(o: { company: Company; customer: Cust; invoice: InvoiceDoc; stage: 1 | 2; today: string; deadline: string }) {
	const { company, customer, invoice: inv, stage } = o;
	const gross = inv.netCents + Math.round(inv.netCents * VAT);
	const title = stage === 1 ? 'Zahlungserinnerung' : 'Mahnung';
	return buildLetter({
		company, recipient: recipient(customer), subject: `${title} zu Rechnung ${inv.number}`,
		title: `${title} ${inv.number}`, runningTitle: `${title} zu ${inv.number}`,
		info: [['Rechnungs-Nr.', inv.number], ['Rechnungsdatum', formatDate(inv.issuedOn)], ['Fällig seit', formatDate(inv.dueOn)], ['Datum', formatDate(o.today)]],
		body: (c) => {
			c.paragraph('Sehr geehrte Damen und Herren,', { gap: 3 });
			c.paragraph(stage === 1
				? `vermutlich ist es Ihrer Aufmerksamkeit entgangen: Die folgende Rechnung war am ${formatDate(inv.dueOn)} fällig, ein Zahlungseingang ist bei uns bisher nicht verzeichnet.`
				: `trotz unserer Zahlungserinnerung konnten wir zu der folgenden Rechnung, fällig am ${formatDate(inv.dueOn)}, bisher keinen Zahlungseingang feststellen.`, { gap: 4 });
			table(c, [[`Rechnung ${inv.number} (brutto)`, formatEur(gross), true]]);
			c.paragraph(stage === 1
				? `Bitte überweisen Sie den offenen Betrag bis zum ${formatDate(o.deadline)}. Sollten Sie bereits gezahlt haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.`
				: `Wir bitten Sie, den offenen Betrag bis spätestens ${formatDate(o.deadline)} zu überweisen. Wir weisen darauf hin, dass wir uns gesetzliche Verzugszinsen sowie die Verzugspauschale von 40 Euro nach § 288 BGB vorbehalten.`, { gap: 5 });
			c.paragraph('Mit freundlichen Grüßen', { gap: 12 });
			c.paragraph(company.owner, { f: c.bold });
			c.paragraph(company.name, { color: gray });
		}
	});
}

export function buildPriceAdjustPdf(o: { company: Company; customer: Cust; siteName?: string; oldCents: number; newCents: number; validFrom: string; reason: string; today: string; quoteNumber: string }) {
	const { company, customer } = o;
	const pct = o.oldCents ? ((o.newCents - o.oldCents) / o.oldCents) * 100 : 0;
	return buildLetter({
		company, recipient: recipient(customer), subject: 'Anpassung der Monatspauschale',
		title: `Preisanpassung ${o.quoteNumber}`, runningTitle: `Preisanpassung zu ${o.quoteNumber}`,
		info: [['Vertrag', o.quoteNumber], ['Datum', formatDate(o.today)], ...(o.siteName ? ([['Objekt', o.siteName]] as [string, string][]) : [])],
		body: (c) => {
			c.paragraph('Sehr geehrte Damen und Herren,', { gap: 3 });
			c.paragraph('vielen Dank für die gute Zusammenarbeit. Mit diesem Schreiben informieren wir Sie über eine Anpassung der vereinbarten Monatspauschale.', { gap: 4 });
			c.paragraph(o.reason, { gap: 4 });
			table(c, [
				['Bisherige Monatspauschale (netto)', formatEur(o.oldCents), false],
				[`Neue Monatspauschale (netto) ab ${formatDate(o.validFrom)}`, formatEur(o.newCents), true],
				['Veränderung', `${pct >= 0 ? '+' : ''}${pct.toFixed(1).replace('.', ',')} %`, false]
			]);
			c.paragraph('Alle Preise zzgl. gesetzlicher Umsatzsteuer. Für Rückfragen stehen wir Ihnen gern zur Verfügung.', { gap: 5 });
			c.paragraph('Mit freundlichen Grüßen', { gap: 12 });
			c.paragraph(company.owner, { f: c.bold });
			c.paragraph(company.name, { color: gray });
		}
	});
}

export interface MonthlyReport {
	company: Company;
	customer: Cust;
	/** YYYY-MM */
	month: string;
	today: string;
	sites: { name: string; visits: number; hours: number }[];
	inspections: { siteName: string; date: string; score: number; flaws: string[] }[];
	defects: { title: string; status: string; reportedOn: string }[];
}

/** Kunden-Monatsbericht (Rapport): Leistungen, Kontrollergebnisse und Mängelstatus auf einer Briefseite. */
export function buildMonthlyReportPdf(o: MonthlyReport) {
	const { company, customer } = o;
	const monthLabel = monthLong(o.month);
	return buildLetter({
		company, recipient: recipient(customer), subject: `Leistungsbericht ${monthLabel}`,
		title: `Leistungsbericht ${monthLabel}`, runningTitle: `Leistungsbericht ${monthLabel}`,
		info: [['Berichtsmonat', monthLabel], ['Datum', formatDate(o.today)], ['Ansprechperson', company.owner]],
		body: (c) => {
			c.paragraph('Sehr geehrte Damen und Herren,', { gap: 3 });
			c.paragraph(`nachfolgend erhalten Sie eine Übersicht der im ${monthLabel} erbrachten Leistungen, der durchgeführten Kontrollen und des Stands offener Hinweise.`, { gap: 5 });
			c.paragraph('Erbrachte Leistungen', { f: c.bold, size: 10.5, gap: 1.5 });
			if (!o.sites.length) c.paragraph('Für diesen Monat liegen keine erfassten Einsätze vor.', { gap: 4 });
			for (const s of o.sites) c.paragraph(`${s.name}: ${s.visits} Einsätze, ${s.hours.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Stunden`, { gap: 0.8, x: X_BODY + 4 * MM });
			c.y += 3;
			c.paragraph('Kontrollen und Begehungen', { f: c.bold, size: 10.5, gap: 1.5 });
			if (!o.inspections.length) c.paragraph('In diesem Monat wurde keine Begehung durchgeführt oder freigegeben.', { gap: 4 });
			for (const i of o.inspections) {
				c.paragraph(`${formatDate(i.date)}, ${i.siteName}: ${i.score} % der Prüfpunkte in Ordnung${i.flaws.length ? `. Beanstandet: ${i.flaws.join(', ')}.` : '.'}`, { gap: 0.8, x: X_BODY + 4 * MM });
			}
			c.y += 3;
			c.paragraph('Hinweise und Mängel', { f: c.bold, size: 10.5, gap: 1.5 });
			if (!o.defects.length) c.paragraph('Es liegen keine offenen oder neu gemeldeten Hinweise vor.', { gap: 4 });
			for (const d of o.defects) c.paragraph(`${d.title} (gemeldet ${formatDate(d.reportedOn)}): ${d.status}`, { gap: 0.8, x: X_BODY + 4 * MM });
			c.y += 5;
			c.paragraph('Bei Fragen oder Anregungen sprechen Sie uns gern an.', { gap: 5 });
			c.paragraph('Mit freundlichen Grüßen', { gap: 12 });
			c.paragraph(company.owner, { f: c.bold });
			c.paragraph(company.name, { color: gray });
		}
	});
}

export interface ReferenceRow {
	customer: string;
	object: string;
	area: number | null;
	since: string;
	contact: string;
}
/** Referenzliste für Ausschreibungen: Objekt, Fläche, Laufzeit seit, Ansprechperson. Kundennamen lassen sich anonymisieren. */
export function buildReferencesPdf(o: { company: Company; rows: ReferenceRow[]; today: string }) {
	const { company } = o;
	const total = o.rows.reduce((a, r) => a + (r.area ?? 0), 0);
	return buildLetter({
		company, recipient: { name: 'Vergabestelle', street: '', postal: '', city: '' }, subject: 'Referenzliste Gebäudereinigung',
		title: 'Referenzliste', runningTitle: 'Referenzliste',
		info: [['Datum', formatDate(o.today)], ['Referenzen', String(o.rows.length)], ['Fläche gesamt', `${total.toLocaleString('de-DE')} m²`]],
		body: (c) => {
			c.paragraph(`${company.name} führt folgende vergleichbare Reinigungsleistungen aus:`, { gap: 4 });
			o.rows.forEach((r, i) => {
				c.ensure(20);
				c.paragraph(`${i + 1}. ${r.customer}`, { f: c.bold, gap: 0.5 });
				c.paragraph(`Objekt: ${r.object}${r.area ? `, Reinigungsfläche ca. ${r.area.toLocaleString('de-DE')} m²` : ''}`, { x: X_BODY + 5 * MM, gap: 0.5 });
				c.paragraph(`Leistungsbeginn: ${formatDate(r.since)}, Ansprechperson: ${r.contact || 'auf Anfrage'}`, { x: X_BODY + 5 * MM, color: gray, gap: 3.5 });
			});
			c.y += 4;
			c.paragraph('Bescheinigungen der Auftraggeber stellen wir auf Anforderung zur Verfügung.', { gap: 8 });
			c.paragraph(company.owner, { f: c.bold });
			c.paragraph(company.name, { color: gray });
		}
	});
}

export interface CalcSheet {
	company: Company;
	today: string;
	calc: { wageCents: number; lnkPct: number; productivePct: number; materialPct: number; machinePct: number; overheadPct: number; profitPct: number };
	rateCents: number;
	example: { label: string; areaM2: number; perHour: number; perWeek: number; monthlyHours: number } | null;
}
/** Kalkulationsblatt: Stundenverrechnungssatz nachvollziehbar aufgeschlüsselt (häufig K.O.-Unterlage in Ausschreibungen). */
export function buildCalcSheetPdf(o: CalcSheet) {
	const { company, calc: k } = o;
	const lohn = k.wageCents / 100;
	const mitLnk = lohn * (1 + k.lnkPct / 100);
	const produktiv = mitLnk / Math.max(0.01, k.productivePct / 100);
	const zuschl = (k.materialPct + k.machinePct + k.overheadPct) / 100;
	const vorGewinn = produktiv * (1 + zuschl);
	const rows: [string, string, boolean][] = [
		['Stundenlohn (Lohngruppe 1)', formatEur(k.wageCents), false],
		[`+ Lohnnebenkosten ${k.lnkPct} %`, formatEur(Math.round((mitLnk - lohn) * 100)), false],
		[`Lohnkosten je bezahlter Stunde`, formatEur(Math.round(mitLnk * 100)), false],
		[`Umgerechnet auf produktive Stunden (${k.productivePct} % Anteil)`, formatEur(Math.round(produktiv * 100)), false],
		[`+ Material ${k.materialPct} %, Maschinen ${k.machinePct} %, Gemeinkosten ${k.overheadPct} %`, formatEur(Math.round((vorGewinn - produktiv) * 100)), false],
		[`+ Wagnis und Gewinn ${k.profitPct} %`, formatEur(Math.round((o.rateCents / 100 - vorGewinn) * 100)), false],
		['Stundenverrechnungssatz (netto)', formatEur(o.rateCents), true]
	];
	return buildLetter({
		company, recipient: { name: 'Vergabestelle', street: '', postal: '', city: '' }, subject: 'Kalkulationsblatt Stundenverrechnungssatz',
		title: 'Kalkulationsblatt', runningTitle: 'Kalkulationsblatt',
		info: [['Datum', formatDate(o.today)], ['Basis', 'Branchenmindestlohn LG 1']],
		body: (c) => {
			c.paragraph('Der Stundenverrechnungssatz setzt sich wie folgt zusammen (alle Beträge netto):', { gap: 4 });
			table(c, rows);
			if (o.example) {
				c.paragraph('Beispielrechnung Monatspauschale', { f: c.bold, gap: 1.5 });
				const e = o.example;
				c.paragraph(`${e.label}: ${e.areaM2.toLocaleString('de-DE')} m² ÷ ${e.perHour} m²/Std. × ${e.perWeek.toLocaleString('de-DE')} Reinigungen pro Woche × 4,33 Wochen = ${e.monthlyHours.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Std. pro Monat.`, { gap: 1.5 });
				c.paragraph(`Monatspreis: ${e.monthlyHours.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Std. × ${formatEur(o.rateCents)} = ${formatEur(Math.round(e.monthlyHours * o.rateCents))} netto; Jahrespreis ${formatEur(Math.round(e.monthlyHours * o.rateCents * 12))} netto.`, { f: c.bold, gap: 4 });
			}
			c.paragraph('Die Leistungswerte und Aufschläge sind betriebliche Annahmen und werden bei Tariferhöhungen angepasst.', { color: gray });
		}
	});
}

export interface ServiceProofRow { date: string; presence: string; execution: string; missed: string[]; note: string; acceptance: string }
/** Monatlicher Leistungsnachweis je Objekt für den Kunden: Verzeichnis, Einsätze mit Anwesenheit, Ausführung und Abnahme, Unterschriftsfeld. */
export function buildServiceProofPdf(o: { company: Company; customer: Cust; siteName: string; siteAddress: string; month: string; rows: ServiceProofRow[]; lv: { room: string; task: string; interval: string }[]; lvFrom: string | null; today: string }) {
	const { company, customer } = o;
	const monthLabel = monthLong(o.month);
	return buildLetter({
		company, recipient: recipient(customer), subject: `Leistungsnachweis ${monthLabel}, ${o.siteName}`,
		title: `Leistungsnachweis ${monthLabel}`, runningTitle: `Leistungsnachweis ${monthLabel} · ${o.siteName}`,
		info: [['Objekt', o.siteName], ['Anschrift', o.siteAddress], ['Monat', monthLabel], ['Datum', formatDate(o.today)]],
		body: (c) => {
			c.paragraph('Sehr geehrte Damen und Herren,', { gap: 3 });
			c.paragraph(`nachfolgend der Nachweis der im ${monthLabel} erbrachten Leistungen für das Objekt ${o.siteName}. Bitte bestätigen Sie die Abnahme mit Ihrer Unterschrift.`, { gap: 5 });
			c.paragraph(`Vereinbarte Leistungen${o.lvFrom ? ` (Stand ab ${formatDate(o.lvFrom)})` : ''}`, { f: c.bold, size: 10.5, gap: 1.5 });
			if (!o.lv.length) c.paragraph('Für dieses Objekt ist kein Leistungsverzeichnis hinterlegt.', { gap: 4 });
			for (const i of o.lv) c.paragraph(`${i.room || 'Allgemein'}: ${i.task} (${i.interval})`, { gap: 0.8, x: X_BODY + 4 * MM });
			c.y += 3;
			c.paragraph('Einsätze', { f: c.bold, size: 10.5, gap: 1.5 });
			if (!o.rows.length) c.paragraph('In diesem Monat fanden keine geplanten Einsätze statt.', { gap: 4 });
			for (const r of o.rows) {
				c.paragraph(`${formatDate(r.date)}: Anwesenheit ${r.presence} · Ausführung ${r.execution} · Abnahme ${r.acceptance}`, { gap: 0.8, x: X_BODY + 4 * MM });
				if (r.missed.length) c.paragraph(`Nicht erbracht: ${r.missed.join('; ')}`, { gap: 0.8, x: X_BODY + 9 * MM, color: gray });
				if (r.note) c.paragraph(`Hinweis: ${r.note}`, { gap: 0.8, x: X_BODY + 9 * MM, color: gray });
			}
			c.y += 8;
			c.paragraph('Abnahme durch den Auftraggeber', { f: c.bold, size: 10.5, gap: 8 });
			c.paragraph('Ort, Datum: ______________________    Unterschrift: ______________________________', { gap: 8 });
			c.paragraph('Mit freundlichen Grüßen', { gap: 12 });
			c.paragraph(company.owner, { f: c.bold });
			c.paragraph(company.name, { color: gray });
		}
	});
}
