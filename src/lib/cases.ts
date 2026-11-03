/**
 * Ablauf eines Vorgangs. Die Schrittzustände werden aus den Daten des Vorgangs (und dem Angebotsstatus) abgeleitet,
 * damit es keine zweite Wahrheit gibt: Wird das Angebot als versendet vermerkt, rückt der Vorgang von selbst vor.
 *
 * Regeln (aus der bisherigen App): Absage wird nur vermerkt; Auftrag bei Angebotspflicht erst nach Annahme;
 * ohne Angebot ist ein manueller Nettobetrag möglich; Abschluss = Eintrag in die Projektzeitliste.
 */
import type { Case, Data, Quote } from './types';

export type StepKey = 'anfrage' | 'daten' | 'besichtigung' | 'angebot' | 'rueckmeldung' | 'start' | 'ausfuehrung' | 'zeitliste';
export type StepState = 'done' | 'current' | 'todo' | 'skipped' | 'ended';
export type Closed = 'abgesagt' | 'abgelehnt' | 'abgeschlossen' | null;

export const stepLabels: Record<StepKey, string> = {
	anfrage: 'Anfrage',
	daten: 'Daten',
	besichtigung: 'Besichtigung',
	angebot: 'Angebot',
	rueckmeldung: 'Rückmeldung',
	start: 'Start',
	ausfuehrung: 'Ausführung',
	zeitliste: 'Projektzeitliste'
};
export const stepOrder = Object.keys(stepLabels) as StepKey[];

export interface StepInfo {
	key: StepKey;
	label: string;
	state: StepState;
}
export interface CaseStatus {
	steps: StepInfo[];
	current: StepKey | null;
	closed: Closed;
	quote: Quote | null;
	/** Fortschritt 0–1 (erledigte oder übersprungene Schritte) */
	progress: number;
}

type Res = 'done' | 'skipped' | 'open' | 'ended';

export function caseStatus(d: Data, c: Case): CaseStatus {
	const quote = d.quotes.find((q) => q.id === c.quoteId) ?? null;
	const res: Record<StepKey, () => Res> = {
		anfrage: () => (c.decision === 'declined' ? 'ended' : c.decision === 'accepted' ? 'done' : 'open'),
		daten: () => (c.dataConfirmed ? 'done' : 'open'),
		besichtigung: () => (c.visitNeeded === false ? 'skipped' : c.visitNeeded === true && c.visitDoneAt ? 'done' : 'open'),
		angebot: () => (c.quoteRequired === false ? 'skipped' : c.quoteRequired === true && quote && quote.status !== 'entwurf' ? 'done' : 'open'),
		rueckmeldung: () => (c.quoteRequired === false ? 'skipped' : quote?.status === 'angenommen' ? 'done' : quote?.status === 'abgelehnt' ? 'ended' : 'open'),
		start: () => (c.startAt ? 'done' : 'open'),
		ausfuehrung: () => (c.executionDoneAt ? 'done' : 'open'),
		zeitliste: () => (c.timesheetAt ? 'done' : 'open')
	};
	const steps: StepInfo[] = [];
	let stopped = false;
	let current: StepKey | null = null;
	let closed: Closed = null;
	for (const key of stepOrder) {
		if (stopped) { steps.push({ key, label: stepLabels[key], state: 'todo' }); continue; }
		const r = res[key]();
		if (r === 'open') { steps.push({ key, label: stepLabels[key], state: 'current' }); current = key; stopped = true; }
		else if (r === 'ended') { steps.push({ key, label: stepLabels[key], state: 'ended' }); closed = key === 'anfrage' ? 'abgesagt' : 'abgelehnt'; stopped = true; }
		else steps.push({ key, label: stepLabels[key], state: r });
	}
	if (!stopped) closed = 'abgeschlossen';
	const progress = steps.filter((s) => s.state === 'done' || s.state === 'skipped').length / steps.length;
	return { steps, current, closed, quote, progress };
}

/**
 * Zurückspringen: macht einen bereits erledigten, übersprungenen oder beendeten Schritt wieder offen.
 * Spätere Schritte behalten ihre Daten, gelten aber als offen, bis dieser Schritt erneut bestätigt ist.
 * Ein verknüpftes Angebot wird dafür wieder bearbeitbar (Entwurf) bzw. auf „versendet“ zurückgesetzt.
 */
export function reopenStep(d: Data, c: Case, key: StepKey): string {
	const quote = d.quotes.find((q) => q.id === c.quoteId) ?? null;
	switch (key) {
		case 'anfrage': c.decision = null; c.declineNotedAt = null; break;
		case 'daten': c.dataConfirmed = false; break;
		case 'besichtigung': c.visitNeeded = null; c.visitDoneAt = null; break;
		case 'angebot':
			if (quote) { quote.status = 'entwurf'; quote.updatedAt = new Date().toISOString(); c.quoteRequired = true; }
			else c.quoteRequired = null;
			break;
		case 'rueckmeldung':
			if (quote && (quote.status === 'angenommen' || quote.status === 'abgelehnt')) { quote.status = 'versendet'; quote.updatedAt = new Date().toISOString(); }
			break;
		case 'start': c.startAt = null; break;
		case 'ausfuehrung': c.executionDoneAt = null; break;
		case 'zeitliste': c.timesheetAt = null; break;
	}
	const text = `Zurückgesprungen zu „${stepLabels[key]}“.`;
	c.log.push({ at: new Date().toISOString(), text });
	return text;
}

/** Auftragswert in Cent (netto): Angebotspreis (Monatspauschale bzw. Stundenpreis) oder manueller Betrag. */
export function caseNet(d: Data, c: Case): number | null {
	const q = d.quotes.find((x) => x.id === c.quoteId);
	if (q) return (q.kind === 'unterhaltsreinigung' ? q.monthlyCents : q.hourlyCents) ?? null;
	return c.manualNetCents;
}

export const defaultChecklist = () => [
	{ label: 'Leistung vollständig erbracht', done: false },
	{ label: 'Objekt abgeschlossen, Schlüssel zurück', done: false },
	{ label: 'Kunde über Abschluss informiert', done: false },
	{ label: 'Besonderheiten dokumentiert', done: false }
];

export function newCase(d: Data, customerId: string, title: string, siteId: string | null, assignee: string): Case {
	const year = new Date().getFullYear();
	const nums = d.cases.map((x) => Number(x.number.split('-').at(-1)));
	return {
		id: 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
		number: `V-${year}-${String(Math.max(0, ...nums) + 1).padStart(3, '0')}`,
		customerId, siteId, title, assignee,
		createdAt: new Date().toISOString(),
		decision: null, declineNotedAt: null, dataConfirmed: false,
		visitNeeded: null, visitApptId: null, visitDoneAt: null, visitNote: '',
		quoteRequired: null, quoteId: null, manualNetCents: null,
		startAt: null, startApptId: null, executionDoneAt: null,
		checklist: defaultChecklist(), complaintNote: '', timesheetAt: null,
		log: [{ at: new Date().toISOString(), text: 'Anfrage erfasst.' }]
	};
}
