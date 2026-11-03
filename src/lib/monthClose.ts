/** Prüfliste für den Monatsabschluss der Zeiterfassung. */
import type { Data } from './types.ts';
import { addDays } from './calc.ts';
import { findGaps } from './cockpit.ts';

export interface CloseCheck { id: 'korrektur' | 'laufend' | 'fehlt' | 'lang' | 'doppelt' | 'abwesend' | 'pruefen'; text: string; count: number }
export interface CloseReport {
	/** Verhindern den Abschluss */
	blockers: CloseCheck[];
	/** Dürfen bewusst übergangen werden */
	warnings: CloseCheck[];
	entries: number;
	hours: number;
}

const monthEnd = (month: string) => { const [y, m] = month.split('-').map(Number); return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10); };

/**
 * Prüft einen Monat vor dem Abschluss. Offene Korrekturanträge sperren den Abschluss, weil sich die Zeiten danach nicht mehr
 * ändern ließen. Fehlende Buchungen, überlange Tage, Überschneidungen und Buchungen an Abwesenheitstagen sind Hinweise.
 */
export function closeReport(d: Data, month: string, today: string, hoursOf: (t: Data['timeEntries'][number]) => number): CloseReport {
	const blockers: CloseCheck[] = [], warnings: CloseCheck[] = [];
	const open = (d.corrections ?? []).filter((c) => c.status === 'offen' && c.date.startsWith(month)).length;
	if (open) blockers.push({ id: 'korrektur', count: open, text: `${open} offene${open === 1 ? 'r' : ''} Korrekturantrag${open === 1 ? '' : 'e'} aus diesem Monat. Bitte erst freigeben oder ablehnen.` });
	const end = monthEnd(month);
	if (today <= end) warnings.push({ id: 'laufend', count: 1, text: 'Der Monat ist noch nicht zu Ende. Spätere Buchungen wären gesperrt.' });
	const upTo = today > end ? addDays(end, 1) : today;
	const last = addDays(upTo, -1); // letzter zu prüfender Tag
	const days = last.startsWith(month) ? Number(last.slice(8)) : 0;
	const gaps = findGaps(d, upTo, days).filter((g) => g.date.startsWith(month));
	const label = { fehlt: (n: number) => `${n} eingeplante${n === 1 ? 'r Einsatz hat' : ' Einsätze haben'} keine Zeitbuchung.`, lang: (n: number) => `${n} Tag${n === 1 ? '' : 'e'} mit mehr als 12 Stunden.`, doppelt: (n: number) => `${n} sich überschneidende Buchung${n === 1 ? '' : 'en'}.`, abwesend: (n: number) => `${n} Buchung${n === 1 ? '' : 'en'} an Tagen mit Urlaub oder Krankheit.` } as const;
	for (const kind of ['fehlt', 'lang', 'doppelt', 'abwesend'] as const) {
		const n = gaps.filter((g) => g.kind === kind).length;
		if (n) warnings.push({ id: kind, count: n, text: label[kind](n) });
	}
	const mine = d.timeEntries.filter((t) => t.date.startsWith(month) && !t.voided);
	const check = mine.filter((t) => /bitte prüfen/i.test(t.note)).length;
	if (check) warnings.push({ id: 'pruefen', count: check, text: `${check} Buchung${check === 1 ? '' : 'en'} mit Prüfhinweis (zum Beispiel länger als 14 Stunden).` });
	return { blockers, warnings, entries: mine.length, hours: mine.reduce((a, t) => a + hoursOf(t), 0) };
}

/** Eintrag im Abschlussprotokoll */
export interface MonthLogEntry { month: string; kind: 'abgeschlossen' | 'entsperrt' | 'lohnexport'; at: string; by: string; note: string }

/** Wurde für den Monat seit dem letzten Abschluss schon ein Lohnexport erzeugt? Dann wären spätere Änderungen nachzumelden. */
export function exportedSinceClose(log: MonthLogEntry[] | undefined, month: string): string | null {
	const l = (log ?? []).filter((x) => x.month === month);
	const lastClose = l.map((x, i) => (x.kind === 'abgeschlossen' ? i : -1)).reduce((a, b) => Math.max(a, b), -1);
	const exp = l.slice(Math.max(0, lastClose)).filter((x) => x.kind === 'lohnexport').at(-1);
	return exp?.at ?? null;
}
