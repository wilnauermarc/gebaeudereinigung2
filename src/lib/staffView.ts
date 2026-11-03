/**
 * Projektion für Mitarbeitende: der Server berechnet hier aus dem Datenbestand NUR die Daten der angemeldeten Person.
 * Nichts anderes verlässt den Server (keine Kunden-, Preis-, Rechnungs- oder Teamdaten außer den eigenen Einsatzorten).
 */
import { addDays, entryHours, fromMinutes, toMinutes, weekday } from './calc';
import type { Data } from './types';

export interface StaffShift { date: string; start: string; end: string; customer: string; site: string; street: string }
export interface StaffView {
	name: string; role: string; contract: 'vollzeit' | 'teilzeit' | 'minijob'; weeklyHours: number;
	shifts: StaffShift[];
	month: string; hours: number; soll: number;
	minijob: { earnedCents: number; limitCents: number } | null;
	leave: { from: string; to: string; kind: 'urlaub' | 'krank'; status: 'beantragt' | 'genehmigt' }[];
	instructedOn: string | null;
	officePhone: string; company: string;
}
const MINIJOB_LIMIT = 63300;
const addYear = (k: string) => `${+k.slice(0, 4) + 1}${k.slice(4)}`;

export function staffView(d: Data, employeeId: string, today: string): StaffView | null {
	const e = d.employees.find((x) => x.id === employeeId);
	if (!e) return null;
	const absent = (date: string) => d.absences.some((a) => a.status === 'genehmigt' && a.employeeId === e.id && a.from <= date && date <= a.to);
	const shifts: StaffShift[] = [];
	for (let i = 0; i < 7; i++) {
		const date = addDays(today, i);
		for (const c of d.customers) for (const s of c.sites) {
			const p = s.plan;
			if (!p || !p.days.includes(weekday(date))) continue;
			const mine = (p.staffIds.includes(e.id) && !absent(date)) || d.covers.some((v) => v.siteId === s.id && v.date === date && v.employeeId === e.id);
			if (!mine) continue;
			shifts.push({ date, start: p.start, end: fromMinutes(toMinutes(p.start) + Math.round(p.hours * 60)), customer: c.name, site: s.name, street: `${s.street}, ${s.postal} ${s.city}` });
		}
	}
	shifts.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));

	// Bezugsmonat wie in der Verwaltung: Monat der jüngsten Buchung, in den ersten 9 Tagen eines Monats der Vormonat
	const latest = (d.timeEntries.map((t) => t.date).sort().at(-1) ?? today).slice(0, 7);
	let month = latest;
	if (latest === today.slice(0, 7) && Number(today.slice(8)) < 10) { const [y, m] = latest.split('-').map(Number); month = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`; }
	const hours = d.timeEntries.filter((t) => t.employeeId === e.id && t.date.startsWith(month) && !t.voided).reduce((s, t) => s + entryHours(t.start, t.end, t.breakMin), 0);
	const days = new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 0)).getUTCDate();

	return {
		name: e.name, role: e.role, contract: e.contract, weeklyHours: e.weeklyHours,
		shifts, month, hours, soll: (e.weeklyHours * days) / 7,
		minijob: e.contract === 'minijob' ? { earnedCents: Math.round(hours * 1500), limitCents: MINIJOB_LIMIT } : null,
		leave: d.absences.filter((a) => a.employeeId === e.id && a.to >= today).sort((a, b) => a.from.localeCompare(b.from)).map((a) => ({ from: a.from, to: a.to, kind: a.kind, status: a.status })),
		instructedOn: e.instructedOn ? addYear(e.instructedOn) >= today ? e.instructedOn : null : null,
		officePhone: d.company.phone, company: d.company.name
	};
}
