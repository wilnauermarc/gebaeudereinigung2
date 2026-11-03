/**
 * Fristenkalender: sammelt Termine aus allen Bereichen und ergänzt wiederkehrende gesetzliche Stichtage.
 * Gesetzliche Termine sind Richtwerte aus dem Recherchebericht (Stand 02.11.2026) und mit Steuerberater/Kammer abzugleichen.
 */
import { addDays, addMonths } from './calc';
import { contractQuotes } from './cockpit';
import type { Data } from './types';

export type DeadlineKind = 'vertrag' | 'personal' | 'betrieb' | 'kunde' | 'gesetz';
export interface Deadline {
	date: string;
	title: string;
	detail?: string;
	kind: DeadlineKind;
	href: string;
	/** Hinweis, dass der Termin aus allgemeinen Regeln stammt und nicht aus Ihren Daten */
	generic?: boolean;
}

export function deadlines(d: Data, today: string, horizonDays = 365): Deadline[] {
	const out: Deadline[] = [];
	const end = addDays(today, horizonDays);
	const push = (x: Deadline) => { if (x.date <= end && (!x.generic || x.date >= today)) out.push(x); };
	const name = (id: string) => d.customers.find((c) => c.id === id)?.name ?? '';

	for (const q of contractQuotes(d)) {
		const c = q.contract!;
		let e = addMonths(c.startOn, c.termMonths);
		while (c.autoRenew && e <= today) e = addMonths(e, c.termMonths);
		// nächste noch nutzbare Kündigungsfrist; verstrichene sind nicht mehr handlungsrelevant
		while (c.autoRenew && addMonths(e, -c.noticeMonths) < today) e = addMonths(e, c.termMonths);
		if (addMonths(e, -c.noticeMonths) >= today) push({ date: addMonths(e, -c.noticeMonths), title: `Kündigungsfrist endet: ${name(q.customerId)}`, detail: `Vertrag ${q.number}, läuft bis ${e.split('-').reverse().join('.')}${c.autoRenew ? ' und verlängert sich' : ''}`, kind: 'vertrag', href: '/vertraege' });
	}
	for (const q of d.quotes) if (q.status === 'versendet' && q.followupOn) push({ date: q.followupOn, title: `Angebot nachfassen: ${name(q.customerId)}`, detail: q.number, kind: 'kunde', href: `/angebote/${q.id}` });
	for (const x of d.docs) if (x.validUntil) push({ date: x.validUntil, title: `${x.title} läuft ab`, detail: x.owner, kind: x.ownerType === 'betrieb' ? 'betrieb' : 'vertrag', href: '/nachweise' });
	for (const e of d.employees) push({ date: e.instructedOn ? addMonths(e.instructedOn, 12) : today, title: `Unterweisung: ${e.name}`, detail: e.instructedOn ? 'jährlich fällig' : 'noch nie dokumentiert', kind: 'personal', href: '/team' });
	for (const m of d.material) if (m.nextCheckOn) push({ date: m.nextCheckOn, title: `Geräteprüfung: ${m.name}`, detail: 'DGUV V3', kind: 'betrieb', href: '/material' });
	for (const t of d.tasks) if (!t.done && t.dueOn) push({ date: t.dueOn, title: t.title, kind: 'betrieb', href: '/aufgaben' });
	for (const x of d.defects) if (x.status !== 'erledigt') push({ date: x.dueOn, title: `Mangel beheben: ${x.title}`, detail: name(x.customerId), kind: 'kunde', href: '/maengel' });
	for (const i of d.invoices) if (!i.paidAt) push({ date: i.dueOn, title: `Zahlung erwartet: ${i.number}`, detail: name(i.customerId), kind: 'kunde', href: '/rechnungen' });
	for (const a of d.absences) if (a.status === 'beantragt') push({ date: a.from, title: `Urlaubsantrag entscheiden: ${d.employees.find((e) => e.id === a.employeeId)?.name}`, kind: 'personal', href: '/team' });

	// wiederkehrende und feste gesetzliche Termine
	for (let i = 0; i < 13; i++) {
		const m = addMonths(today.slice(0, 7) + '-01', i).slice(0, 7);
		push({ date: `${m}-10`, title: 'Umsatzsteuer-Voranmeldung', detail: 'am 10. des Folgemonats, mit Dauerfristverlängerung einen Monat später', kind: 'gesetz', href: '/fristen', generic: true });
	}
	const y = Number(today.slice(0, 4));
	for (const yr of [y, y + 1]) push({ date: `${yr}-02-16`, title: 'BG-Lohnnachweis (BG BAU)', detail: 'bis 16. Februar für das Vorjahr', kind: 'gesetz', href: '/fristen', generic: true });
	push({ date: '2026-12-31', title: 'Branchenmindestlohn: Verordnung läuft aus', detail: 'Neue Tarifwerte ab 2027 noch offen (Verhandlung läuft). Preisanpassung vorbereiten.', kind: 'gesetz', href: '/vertraege', generic: true });
	push({ date: '2027-01-01', title: 'Gesetzlicher Mindestlohn steigt auf 14,60 €', detail: 'Minijob-Grenze 633 € ab 2027', kind: 'gesetz', href: '/team', generic: true });
	return out.sort((a, b) => a.date.localeCompare(b.date));
}
