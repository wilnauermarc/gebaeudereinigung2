/** Zusatzleistungen: vom Wunsch des Kunden bis zur Rechnung nachverfolgt, damit nichts unbezahlt bleibt. */
import type { Data, ExtraService, ExtraStatus, Invoice } from './types.ts';

export const extraLabels: Record<ExtraStatus, string> = { angefragt: 'Angefragt', beauftragt: 'Beauftragt', ausgefuehrt: 'Ausgeführt', abgerechnet: 'Abgerechnet', abgelehnt: 'Abgelehnt' };
export const extraFlow: ExtraStatus[] = ['angefragt', 'beauftragt', 'ausgefuehrt', 'abgerechnet'];
export const extraNet = (e: Pick<ExtraService, 'qty' | 'unitCents'>) => Math.round(e.qty * e.unitCents);
const stamp = () => new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short' });

export function newExtra(p: Pick<ExtraService, 'customerId' | 'siteId' | 'title' | 'description' | 'qty' | 'unit' | 'unitCents' | 'orderedBy'> & { date: string; alreadyOrdered: boolean }, by: string, today: string): ExtraService | string {
	if (p.title.trim().length < 3) return 'Bitte die Leistung kurz benennen.';
	if (!(p.qty > 0)) return 'Die Menge muss größer als 0 sein.';
	if (!(p.unitCents >= 0)) return 'Der Preis darf nicht negativ sein.';
	if (p.alreadyOrdered && p.orderedBy.trim().length < 2) return 'Bitte angeben, wer die Leistung beauftragt hat.';
	return {
		id: 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), customerId: p.customerId, siteId: p.siteId, title: p.title.trim(), description: p.description.trim(), date: p.date, qty: p.qty, unit: p.unit, unitCents: p.unitCents,
		status: p.alreadyOrdered ? 'beauftragt' : 'angefragt', orderedBy: p.orderedBy.trim(), orderedOn: p.alreadyOrdered ? today : null, executedOn: null, invoiceId: null, createdAt: new Date().toISOString(),
		history: [`${stamp()}: ${p.alreadyOrdered ? 'Beauftragt' : 'Angefragt'} (${by})`]
	};
}

/** Einen Schritt weitergehen. Gibt eine Fehlermeldung zurück oder null. „Abgerechnet“ entsteht nur über `invoiceExtras`. */
export function moveExtra(e: ExtraService, to: ExtraStatus, x: { by: string; orderedBy?: string; executedOn?: string; reason?: string }, today: string): string | null {
	if (e.status === 'abgerechnet') return 'Abgerechnete Zusatzleistungen lassen sich nicht ändern. Bei Fehlern die Rechnung stornieren.';
	if (to === 'abgerechnet') return 'Abgerechnet wird über „In Rechnung übernehmen“.';
	const ok: Record<ExtraStatus, ExtraStatus[]> = { angefragt: ['beauftragt', 'abgelehnt'], beauftragt: ['ausgefuehrt', 'abgelehnt', 'angefragt'], ausgefuehrt: ['beauftragt'], abgelehnt: ['angefragt'], abgerechnet: [] };
	if (!ok[e.status].includes(to)) return `Von „${extraLabels[e.status]}“ geht es nicht direkt zu „${extraLabels[to]}“.`;
	if (to === 'beauftragt' && e.status === 'angefragt') {
		if ((x.orderedBy ?? '').trim().length < 2) return 'Bitte angeben, wer beim Kunden beauftragt hat.';
		e.orderedBy = x.orderedBy!.trim(); e.orderedOn = today;
	}
	if (to === 'ausgefuehrt') {
		if (!x.executedOn || x.executedOn > today) return 'Das Ausführungsdatum darf nicht in der Zukunft liegen.';
		e.executedOn = x.executedOn;
	}
	if (to === 'abgelehnt' && (x.reason ?? '').trim().length < 3) return 'Bitte kurz begründen, warum die Zusatzleistung entfällt.';
	if (to === 'beauftragt' && e.status === 'ausgefuehrt') e.executedOn = null;
	const was = e.status;
	e.status = to;
	e.history.push(`${stamp()}: ${extraLabels[was]} → ${extraLabels[to]} (${x.by})${to === 'abgelehnt' ? `: ${x.reason!.trim()}` : ''}`);
	return null;
}

const eur = (c: number) => (c / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €';
const qty = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 2 });
const day = (k: string) => k.split('-').reverse().join('.');

/** Ausgeführte Zusatzleistungen eines Kunden in eine Rechnung übernehmen. Alle müssen „ausgeführt“ sein und zum selben Kunden gehören. */
export function invoiceExtras(d: Data, ids: string[], today: string, dueOn: string, nextNumber: string): Invoice | string {
	const list = (d.extras ?? []).filter((e) => ids.includes(e.id));
	if (!list.length || list.length !== ids.length) return 'Bitte Zusatzleistungen auswählen.';
	if (list.some((e) => e.status !== 'ausgefuehrt')) return 'Nur ausgeführte Zusatzleistungen lassen sich abrechnen.';
	if (new Set(list.map((e) => e.customerId)).size > 1) return 'Eine Rechnung gilt für einen Kunden. Bitte nur Zusatzleistungen eines Kunden wählen.';
	const net = list.reduce((a, e) => a + extraNet(e), 0);
	const description = ['Zusatzleistungen nach Absprache:', ...list.map((e) => `${e.title} am ${day(e.executedOn ?? e.date)}: ${qty(e.qty)} ${e.unit === 'pauschal' ? 'pauschal' : e.unit} × ${eur(e.unitCents)} = ${eur(extraNet(e))}`)].join('\n');
	const inv: Invoice = { id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), number: nextNumber, customerId: list[0].customerId, netCents: net, issuedOn: today, dueOn, paidAt: null, period: null, quoteId: null, remindCount: 0, remindedAt: null, description, extraIds: list.map((e) => e.id) };
	d.invoices.push(inv);
	for (const e of list) { e.status = 'abgerechnet'; e.invoiceId = inv.id; e.history.push(`${stamp()}: Abgerechnet in ${inv.number}`); }
	return inv;
}

/** Wird die Rechnung storniert, werden ihre Zusatzleistungen wieder abrechenbar. */
export function releaseExtras(d: Data, invoiceId: string): number {
	let n = 0;
	for (const e of d.extras ?? []) if (e.invoiceId === invoiceId && e.status === 'abgerechnet') { e.status = 'ausgefuehrt'; e.invoiceId = null; e.history.push(`${stamp()}: Rechnung storniert, wieder abrechenbar`); n++; }
	return n;
}

/** Geld, das erbracht, aber noch nicht in Rechnung gestellt ist */
export const unbilledCents = (d: Data) => (d.extras ?? []).filter((e) => e.status === 'ausgefuehrt').reduce((a, e) => a + extraNet(e), 0);
