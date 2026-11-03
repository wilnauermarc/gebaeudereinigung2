/**
 * Konfigurierbare Exporte für die Steuerberatung (Lohn und Buchungen). DATEV-nah, aber NICHT von DATEV zertifiziert:
 * Die Spaltenüberschriften folgen dem Buchungsstapel, es fehlt der EXTF-Kopf. Berater-/Mandantennummer, Konten und
 * Lohnarten sind Eingaben des Betriebs und müssen mit der Steuerberatung abgestimmt und mit einem Testimport geprüft werden.
 */
import { surchargeInfo } from './surcharge';
import type { Customer, Data, Invoice, TimeEntry } from './types';

export interface ExportConfig {
	beraterNr: string;
	mandantNr: string;
	kontenrahmen: 'SKR03' | 'SKR04';
	/** Erlöskonto für Reinigungsleistungen (19 %), z. B. 8400 (SKR03) bzw. 4400 (SKR04) */
	revenueAccount: string;
	/** Debitorenkonten beginnen bei dieser Nummer, je Kunde fortlaufend, sofern beim Kunden keine eigene steht */
	debtorBase: number;
	/** Lohnart-Nummern des Lohnprogramms je Stundenart */
	lohnarten: Record<LohnKey, string>;
}
export type LohnKey = 'arbeit' | 'weg' | 'ruest' | 'nacht' | 'sonntag' | 'feiertag';
export const lohnLabels: Record<LohnKey, string> = {
	arbeit: 'Arbeitsstunden', weg: 'Wegezeit', ruest: 'Rüstzeit', nacht: 'Zuschlagsstunden Nacht (30 %)', sonntag: 'Zuschlagsstunden Sonntag/Feiertag (80 %)', feiertag: 'Zuschlagsstunden hohe Feiertage (200 %)'
};
export const defaultExportConfig: ExportConfig = {
	beraterNr: '',
	mandantNr: '',
	kontenrahmen: 'SKR03',
	revenueAccount: '8400',
	debtorBase: 10000,
	lohnarten: { arbeit: '', weg: '', ruest: '', nacht: '', sonntag: '', feiertag: '' }
};

const num = (n: number) => n.toFixed(2).replace('.', ',');
const ttmm = (iso: string) => iso.slice(8, 10) + iso.slice(5, 7);

export interface PayrollRow { mitarbeiter: string; personalNr: string; lohnart: string; bezeichnung: string; stunden: number }

/** Stunden je Mitarbeiter und Lohnart: Grundstunden nach Zeitart, Zuschlagsstunden je Satz (nur gültige Buchungen). */
export function payrollRows(d: Pick<Data, 'employees' | 'timeEntries'>, month: string, cfg: ExportConfig, hoursOf: (t: TimeEntry) => number): PayrollRow[] {
	const out: PayrollRow[] = [];
	for (const e of d.employees) {
		const mine = d.timeEntries.filter((t) => t.employeeId === e.id && t.date.startsWith(month) && !t.voided);
		const sum: Record<LohnKey, number> = { arbeit: 0, weg: 0, ruest: 0, nacht: 0, sonntag: 0, feiertag: 0 };
		for (const t of mine) {
			sum[t.kind === 'weg' ? 'weg' : t.kind === 'ruest' ? 'ruest' : 'arbeit'] += hoursOf(t);
			const m = surchargeInfo(t.date, t.start, t.end).minutes;
			sum.nacht += (m[30] ?? 0) / 60;
			sum.sonntag += (m[80] ?? 0) / 60;
			sum.feiertag += (m[200] ?? 0) / 60;
		}
		for (const k of Object.keys(sum) as LohnKey[]) if (sum[k] > 0.004) out.push({ mitarbeiter: e.name, personalNr: e.id, lohnart: cfg.lohnarten[k], bezeichnung: lohnLabels[k], stunden: sum[k] });
	}
	return out;
}
export const payrollCsvRows = (rows: PayrollRow[], month: string) => [
	['Personalnummer', 'Mitarbeiter', 'Abrechnungsmonat', 'Lohnart', 'Bezeichnung', 'Stunden'],
	...rows.map((r) => [r.personalNr, r.mitarbeiter, month, r.lohnart, r.bezeichnung, num(r.stunden)])
];

/** Debitorenkonto: eigene Nummer beim Kunden oder fortlaufend ab `debtorBase` nach Anlagereihenfolge. */
export function debtorOf(c: Customer, customers: Customer[], cfg: ExportConfig): string {
	return c.debtorNo?.trim() || String(cfg.debtorBase + customers.findIndex((x) => x.id === c.id) + 1);
}

export interface BookingRow { umsatz: string; sh: 'S' | 'H'; konto: string; gegenkonto: string; bu: string; belegdatum: string; belegfeld1: string; text: string }
/**
 * Buchungsstapel der Ausgangsrechnungen: Debitor (Konto) an Erlöskonto (Gegenkonto), Betrag brutto.
 * Stornorechnungen (negativ) werden als Haben-Buchung auf dem Debitorenkonto geführt. BU-Schlüssel bleibt leer,
 * weil die Steuer bei vielen Erlöskonten automatisch gebucht wird: mit der Steuerberatung abstimmen.
 */
export function bookingRows(invoices: Invoice[], customers: Customer[], cfg: ExportConfig, vat = 0.19): BookingRow[] {
	return invoices.map((i) => {
		const c = customers.find((x) => x.id === i.customerId);
		const gross = Math.round(Math.abs(i.netCents) * (1 + vat));
		return { umsatz: num(gross / 100), sh: i.netCents < 0 ? 'H' : 'S', konto: c ? debtorOf(c, customers, cfg) : '', gegenkonto: cfg.revenueAccount, bu: '', belegdatum: ttmm(i.issuedOn), belegfeld1: i.number, text: `${c?.name.slice(0, 40) ?? ''} ${i.period ?? ''}`.trim() };
	});
}
export const bookingCsvRows = (rows: BookingRow[], cfg: ExportConfig) => [
	['Umsatz (ohne Soll/Haben-Kz)', 'Soll/Haben-Kennzeichen', 'WKZ Umsatz', 'Konto', 'Gegenkonto (ohne BU-Schlüssel)', 'BU-Schlüssel', 'Belegdatum (TTMM)', 'Belegfeld 1', 'Buchungstext', `Hinweis`],
	...rows.map((r, n) => [r.umsatz, r.sh, 'EUR', r.konto, r.gegenkonto, r.bu, r.belegdatum, r.belegfeld1, r.text, n === 0 ? `Berater ${cfg.beraterNr || '-'} / Mandant ${cfg.mandantNr || '-'} / ${cfg.kontenrahmen}, nicht von DATEV zertifiziert` : ''])
];

/**
 * Buchungsstapel im DATEV-Importformat (EXTF, Version 700, Kategorie 21, Format 12), Kernspalten bis „Buchungstext“.
 * Aus dem Gedächtnis des Formats gebaut und NICHT mit einem echten DATEV-Import geprüft: vor dem Einsatz einen
 * Testimport bei der Steuerberatung machen. Kodierung der Datei: Windows-1252 (siehe `toWin1252`).
 */
export function extfBookings(rows: BookingRow[], cfg: ExportConfig, o: { now: Date; from: string; to: string; name?: string }): string {
	const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
	const p2 = (n: number) => String(n).padStart(2, '0');
	const stamp = `${o.now.getFullYear()}${p2(o.now.getMonth() + 1)}${p2(o.now.getDate())}${p2(o.now.getHours())}${p2(o.now.getMinutes())}${p2(o.now.getSeconds())}000`;
	const ymd = (iso: string) => iso.replace(/-/g, '');
	const header = ['"EXTF"', '700', '21', q('Buchungsstapel'), '12', stamp, '', q('RE'), q('Resch Business Manager'), '""', cfg.beraterNr || '', cfg.mandantNr || '', `${o.from.slice(0, 4)}0101`, '4', ymd(o.from), ymd(o.to), q(o.name ?? 'Ausgangsrechnungen'), '""', '1', '0', '0', q('EUR'), '', '', '', '', q(cfg.kontenrahmen === 'SKR04' ? '04' : '03'), '', '', '', ''];
	const cols = ['Umsatz (ohne Soll/Haben-Kz)', 'Soll/Haben-Kennzeichen', 'WKZ Umsatz', 'Kurs', 'Basis-Umsatz', 'WKZ Basis-Umsatz', 'Konto', 'Gegenkonto (ohne BU-Schlüssel)', 'BU-Schlüssel', 'Belegdatum', 'Belegfeld 1', 'Belegfeld 2', 'Skonto', 'Buchungstext'];
	const lines = [header.join(';'), cols.join(';')];
	for (const r of rows) lines.push([r.umsatz, q(r.sh), q('EUR'), '', '', '', r.konto, r.gegenkonto, r.bu, r.belegdatum, q(r.belegfeld1.slice(0, 36)), '', '', q(r.text.slice(0, 60))].join(';'));
	return lines.join('\r\n') + '\r\n';
}
/** Windows-1252 (nur der für Umlaute nötige Latin-1-Bereich, übrige Zeichen werden zu „?“). */
export function toWin1252(s: string): Uint8Array {
	const out = new Uint8Array(s.length);
	for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); out[i] = c < 256 ? c : 63; }
	return out;
}
