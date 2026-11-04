/** Leistungsnachweis: Anwesenheit (abgeleitet), Ausführung und Abnahme je Einsatz. */
import type { Data, Defect, ServiceRecord, Site } from './types.ts';
import { addDays, weekday } from './calc.ts';
import { lvAt } from './lv.ts';

export interface Visit { siteId: string; customerId: string; date: string }
const monthStart = (m: string) => m + '-01';
const monthEnd = (m: string) => { const [y, mm] = m.split('-').map(Number); return new Date(Date.UTC(y, mm, 0)).toISOString().slice(0, 10); };

/** Geplante Einsätze eines Monats bis einschließlich heute (Zukunft ist noch nichts zu prüfen). */
export function plannedVisits(d: Data, month: string, today: string): Visit[] {
	const out: Visit[] = [];
	const last = monthEnd(month) < today ? monthEnd(month) : today;
	for (let date = monthStart(month); date <= last; date = addDays(date, 1)) {
		for (const c of d.customers) for (const s of c.sites) if (s.plan?.days.includes(weekday(date))) out.push({ siteId: s.id, customerId: c.id, date });
	}
	return out;
}

/** Wer hat an dem Tag am Objekt gebucht? (gültige Buchungen) */
export function presence(d: Data, siteId: string, date: string): { names: string[]; hours: number } {
	const es = d.timeEntries.filter((t) => t.siteId === siteId && t.date === date && !t.voided);
	const hours = es.reduce((a, t) => { const [h1, m1] = t.start.split(':').map(Number), [h2, m2] = t.end.split(':').map(Number); let m = h2 * 60 + m2 - (h1 * 60 + m1); if (m <= 0) m += 1440; return a + Math.max(0, m - t.breakMin) / 60; }, 0);
	return { names: [...new Set(es.map((t) => d.employees.find((e) => e.id === t.employeeId)?.name.split(' ')[0] ?? '?'))], hours };
}

export const recordOf = (d: Data, siteId: string, date: string) => (d.serviceRecords ?? []).find((r) => r.siteId === siteId && r.date === date);

const stamp = () => new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short' });
function ensure(d: Data, site: Site, date: string): ServiceRecord {
	d.serviceRecords ??= [];
	const list = d.serviceRecords;
	let r = list.find((x) => x.siteId === site.id && x.date === date);
	if (!r) { r = { id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), siteId: site.id, date, execution: 'offen', missedItemIds: [], executionNote: '', lvVersionId: null, acceptance: 'offen', acceptedBy: '', acceptedOn: null, acceptNote: '', history: [] }; list.push(r); r = list.at(-1)!; /* mit Svelte-Zustand liefert push einen Proxy: danach nur noch diesen ändern */ }
	return r;
}

export type ExecInput = { execution: ServiceRecord['execution']; missedItemIds: string[]; note: string };
/** Ausführung festhalten. Bei „teilweise“ muss mindestens eine nicht erbrachte Leistung oder eine Notiz angegeben sein. */
export function setExecution(d: Data, site: Site, date: string, x: ExecInput, by: string): string | null {
	if (x.execution === 'teilweise' && !x.missedItemIds.length && !x.note.trim()) return 'Bei „teilweise“ bitte angeben, was nicht erbracht wurde (Leistung wählen oder Notiz).';
	if (x.execution === 'nicht' && !x.note.trim()) return 'Bei „nicht ausgeführt“ bitte kurz den Grund notieren.';
	const r = ensure(d, site, date);
	const was = r.execution;
	r.execution = x.execution;
	r.missedItemIds = x.execution === 'teilweise' ? [...x.missedItemIds] : [];
	r.executionNote = x.note.trim();
	r.lvVersionId = lvAt(site, date)?.id ?? null;
	// Wird die Ausführung nachträglich zurückgenommen, gilt eine frühere Abnahme nicht mehr
	if (x.execution === 'offen' && r.acceptance !== 'offen') { r.acceptance = 'offen'; r.acceptedOn = null; r.acceptedBy = ''; }
	r.history.push(`${stamp()}: Ausführung ${was} → ${x.execution} (${by})${x.note.trim() ? `: ${x.note.trim()}` : ''}`);
	return null;
}

export type AcceptInput = { acceptance: ServiceRecord['acceptance']; by: string; note: string; createDefect: boolean };
/** Abnahme durch den Kunden. Erst nach festgehaltener Ausführung; eine Beanstandung braucht eine Begründung und kann einen Mangel anlegen. */
export function setAcceptance(d: Data, site: Site, customerId: string, date: string, x: AcceptInput, today: string, by: string): string | null {
	const r = ensure(d, site, date);
	if (x.acceptance !== 'offen' && r.execution === 'offen') return 'Zuerst die Ausführung festhalten, dann abnehmen.';
	if (x.acceptance !== 'offen' && x.by.trim().length < 2) return 'Bitte angeben, wer abgenommen bzw. beanstandet hat.';
	if (x.acceptance === 'beanstandet' && x.note.trim().length < 3) return 'Bitte die Beanstandung kurz beschreiben.';
	const was = r.acceptance;
	r.acceptance = x.acceptance;
	r.acceptedBy = x.acceptance === 'offen' ? '' : x.by.trim();
	r.acceptedOn = x.acceptance === 'offen' ? null : today;
	r.acceptNote = x.note.trim();
	r.history.push(`${stamp()}: Abnahme ${was} → ${x.acceptance}${x.acceptance !== 'offen' ? ` durch ${x.by.trim()}` : ''} (erfasst von ${by})${x.note.trim() ? `: ${x.note.trim()}` : ''}`);
	if (x.acceptance === 'beanstandet' && x.createDefect && !r.defectId) {
		const defect: Defect = { id: 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4), customerId, siteId: site.id, title: `Beanstandung Einsatz ${date.split('-').reverse().slice(0, 2).join('.')}.: ${x.note.trim().slice(0, 50)}`, description: `${x.note.trim()}\n(Aus dem Leistungsnachweis vom ${date}, beanstandet von ${x.by.trim()}.)`, status: 'offen', severity: 'normal', reportedOn: today, dueOn: addDays(today, 3), closedOn: null, recheck: true, source: 'kunde' };
		d.defects.push(defect);
		r.defectId = defect.id;
		r.history.push(`${stamp()}: Mangel angelegt`);
	}
	return null;
}

export interface NachweisSummary { visits: number; withPresence: number; executed: number; partial: number; notDone: number; accepted: number; disputed: number; acceptanceOpen: number }
export function summarize(d: Data, visits: Visit[]): NachweisSummary {
	const s: NachweisSummary = { visits: visits.length, withPresence: 0, executed: 0, partial: 0, notDone: 0, accepted: 0, disputed: 0, acceptanceOpen: 0 };
	for (const v of visits) {
		const r = recordOf(d, v.siteId, v.date);
		if (presence(d, v.siteId, v.date).names.length) s.withPresence++;
		if (r?.execution === 'vollstaendig') s.executed++; else if (r?.execution === 'teilweise') s.partial++; else if (r?.execution === 'nicht') s.notDone++;
		if (r?.acceptance === 'abgenommen') s.accepted++; else if (r?.acceptance === 'beanstandet') s.disputed++;
		else if (r && r.execution !== 'offen') s.acceptanceOpen++;
	}
	return s;
}

/** Aus der Checkliste der Mitarbeitenden: Was war heute fällig, was wurde abgehakt? */
export function executionFromChecklist(dueIds: string[], doneIds: string[]): { execution: ServiceRecord['execution']; missed: string[] } {
	const done = new Set(doneIds);
	const missed = dueIds.filter((id) => !done.has(id));
	if (!dueIds.length) return { execution: doneIds.length ? 'vollstaendig' : 'offen', missed: [] };
	if (!missed.length) return { execution: 'vollstaendig', missed: [] };
	return { execution: dueIds.some((id) => done.has(id)) ? 'teilweise' : 'nicht', missed };
}
