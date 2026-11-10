/**
 * Personal: Status, Einstellung (Aufgaben bis zur Aktivierung) und Papiere mit Ablaufdatum.
 * Reine Logik ohne Oberfläche. Rechtliche Angaben (Meldungen, Fristen) stehen hier nicht fest, der Betrieb pflegt seine eigenen Daten.
 */
import { addDays } from './calc';
import type { Employee, EmployeeStatus, OnboardingStep, PersonPaper } from './types';

export const STATUS: { id: EmployeeStatus; label: string; tone: 'neutral' | 'info' | 'success' | 'warn' | 'danger' }[] = [
	{ id: 'bewerber', label: 'Bewerber', tone: 'neutral' },
	{ id: 'einstellung', label: 'In Einstellung', tone: 'info' },
	{ id: 'vertrag', label: 'Vertrag unterschrieben', tone: 'info' },
	{ id: 'aktiv', label: 'Aktiv', tone: 'success' },
	{ id: 'ruhend', label: 'Ruhend', tone: 'warn' },
	{ id: 'gekuendigt', label: 'Gekündigt', tone: 'warn' },
	{ id: 'freigestellt', label: 'Freigestellt', tone: 'warn' },
	{ id: 'ausgeschieden', label: 'Ausgeschieden', tone: 'neutral' }
];
export const statusOf = (e: Pick<Employee, 'status'>): EmployeeStatus => e.status ?? 'aktiv';
export const statusLabel = (s: EmployeeStatus) => STATUS.find((x) => x.id === s)!.label;

/** Wer darf neu eingeplant werden? Aktive und Gekündigte (noch im Arbeitsverhältnis), nicht Bewerber, Ruhende, Freigestellte, Ausgeschiedene. */
export const isPlannable = (e: Pick<Employee, 'status'>) => ['aktiv', 'gekuendigt'].includes(statusOf(e));

export const STEPS: { id: OnboardingStep; label: string; hint: string }[] = [
	{ id: 'fragebogen', label: 'Personalfragebogen ausgefüllt', hint: 'Name, Anschrift, Geburtsdaten, Versicherungsnummer, Bankverbindung liegen vor.' },
	{ id: 'vertrag', label: 'Arbeitsvertrag unterschrieben', hint: 'Der unterschriebene Vertrag liegt vor.' },
	{ id: 'sofortmeldung', label: 'Sofortmeldung abgegeben', hint: 'Im Gebäudereinigungsgewerbe vor Beschäftigungsbeginn, meist über das Lohnbüro. Bitte mit Ihrem Lohnbüro klären.' },
	{ id: 'unterweisung', label: 'Erstunterweisung dokumentiert', hint: 'Arbeitsschutz und Gefahrstoffe, wird im Team unter „Unterweisung“ eingetragen.' },
	{ id: 'zugang', label: 'Zugang zur Mitarbeiter-App', hint: 'Unter Einstellungen → Zugänge einen Zugang für die Person anlegen.' }
];
export interface StepState { id: OnboardingStep; label: string; hint: string; done: boolean; auto: boolean }
export function onboarding(e: Employee): StepState[] {
	return STEPS.map((s) => ({ ...s, auto: s.id === 'unterweisung', done: s.id === 'unterweisung' ? !!e.instructedOn : !!e.onboarding?.[s.id] }));
}
export const openSteps = (e: Employee) => onboarding(e).filter((s) => !s.done);
/** Aktivierung ist erst sinnvoll, wenn alle Schritte erledigt sind */
export const canActivate = (e: Employee) => openSteps(e).length === 0;

export const PAPER_KINDS: { id: PersonPaper['kind']; label: string }[] = [
	{ id: 'arbeitserlaubnis', label: 'Arbeitserlaubnis' },
	{ id: 'aufenthaltstitel', label: 'Aufenthaltstitel' },
	{ id: 'befristung', label: 'Befristung des Vertrags' },
	{ id: 'gesundheitszeugnis', label: 'Gesundheitszeugnis' },
	{ id: 'fuehrerschein', label: 'Führerschein' },
	{ id: 'sonstiges', label: 'Sonstiges' }
];
export const paperLabel = (p: PersonPaper) => p.label?.trim() || PAPER_KINDS.find((k) => k.id === p.kind)!.label;

export type PaperState = 'abgelaufen' | 'bald' | 'gueltig';
export function paperState(p: PersonPaper, today: string): { state: PaperState; days: number } {
	const days = Math.round((Date.parse(p.until + 'T12:00:00Z') - Date.parse(today + 'T12:00:00Z')) / 86400_000);
	return { state: days < 0 ? 'abgelaufen' : days <= p.leadDays ? 'bald' : 'gueltig', days };
}
/** Schlechtester Stand aller Papiere einer Person (für die Anzeige in der Liste) */
export function worstPaper(e: Employee, today: string): { state: PaperState; count: number } | null {
	const ps = e.papers ?? [];
	if (!ps.length) return null;
	const rank: Record<PaperState, number> = { abgelaufen: 2, bald: 1, gueltig: 0 };
	let worst: PaperState = 'gueltig', n = 0;
	for (const p of ps) { const s = paperState(p, today).state; if (s !== 'gueltig') n++; if (rank[s] > rank[worst]) worst = s; }
	return { state: worst, count: n };
}

/** Termine für den Fristenkalender: ab Vorlauf sichtbar, abgelaufene bis 90 Tage danach */
export function paperDeadlines(employees: Employee[], today: string) {
	const out: { date: string; title: string; detail: string; state: PaperState }[] = [];
	for (const e of employees) {
		if (['ausgeschieden'].includes(statusOf(e))) continue;
		for (const p of e.papers ?? []) {
			const st = paperState(p, today);
			if (st.days < -90) continue;
			out.push({ date: p.until, title: `${paperLabel(p)}: ${e.name}`, detail: st.state === 'abgelaufen' ? `seit ${-st.days} Tagen abgelaufen` : `Vorlauf ${p.leadDays} Tage`, state: st.state });
		}
	}
	return out;
}
export { addDays };
