/**
 * Projektion für Mitarbeitende: der Server berechnet hier aus dem Datenbestand NUR die Daten der angemeldeten Person.
 * Nichts anderes verlässt den Server (keine Kunden-, Preis-, Rechnungs- oder Teamdaten außer den eigenen Einsatzorten).
 */
import { addDays, entryHours, fromMinutes, toMinutes, weekday } from './calc';
import type { Data } from './types';

export interface StaffShift { siteId: string; date: string; start: string; end: string; customer: string; site: string; street: string; note: string; chemicals: string }
export interface StaffTime { id: string; date: string; start: string; end: string; breakMin: number; hours: number; voided: boolean; edited: boolean; source: string; history: string[]; pending: boolean; offline: boolean }
export interface StaffRequest { id: string; kind: 'absence' | 'defect' | 'correction'; label: string; from?: string; to?: string; status: string; reply?: string; createdAt: string }
export interface StaffOpen { id: string; startedAt: string; siteId: string; site: string }
/** Eingang des Servers für diese Person (Stempelungen und Meldungen, die die Verwaltung noch nicht übernommen hat oder die gerade laufen) */
export interface StaffInboxItem { id: string; kind: 'punch' | 'absence' | 'defect' | 'correction'; payload: any; created_at: string; status: string; closed: boolean }
export interface StaffView {
	name: string; role: string; contract: 'vollzeit' | 'teilzeit' | 'minijob'; weeklyHours: number;
	shifts: StaffShift[];
	times: StaffTime[];
	requests: StaffRequest[];
	open: StaffOpen | null;
	/** Einstempeln nur per QR-Code am Objekt */
	requireQr: boolean;
	/** Standort-Abgleich beim Stempeln aktiv */
	geo: boolean;
	month: string; hours: number; soll: number;
	minijob: { earnedCents: number; limitCents: number } | null;
	leave: { from: string; to: string; kind: 'urlaub' | 'krank'; status: 'beantragt' | 'genehmigt' }[];
	instructedOn: string | null;
	officePhone: string; company: string;
}
const MINIJOB_LIMIT = 63300;
const addYear = (k: string) => `${+k.slice(0, 4) + 1}${k.slice(4)}`;

export function staffView(d: Data, employeeId: string, today: string, inbox: StaffInboxItem[] = []): StaffView | null {
	const e = d.employees.find((x) => x.id === employeeId);
	if (!e) return null;
	const absent = (date: string) => d.absences.some((a) => a.status === 'genehmigt' && a.employeeId === e.id && a.from <= date && date <= a.to);
	const shifts: StaffShift[] = [];
	for (let i = 0; i < 7; i++) {
		const date = addDays(today, i);
		for (const c of d.customers) for (const s of c.sites) {
			const p = s.plan;
			if (!p || !p.days.includes(weekday(date))) continue;
			const mine = (p.staffIds.includes(e.id) && !absent(date) && !d.covers.some((v) => v.siteId === s.id && v.date === date && v.replacesId === e.id)) || d.covers.some((v) => v.siteId === s.id && v.date === date && v.employeeId === e.id);
			if (!mine) continue;
			shifts.push({ siteId: s.id, note: s.note ?? '', chemicals: s.chemicals ?? '', date, start: p.start, end: fromMinutes(toMinutes(p.start) + Math.round(p.hours * 60)), customer: c.name, site: s.name, street: `${s.street}, ${s.postal} ${s.city}` });
		}
	}
	shifts.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));

	// Bezugsmonat wie in der Verwaltung: Monat der jüngsten Buchung, in den ersten 9 Tagen eines Monats der Vormonat
	const latest = (d.timeEntries.map((t) => t.date).sort().at(-1) ?? today).slice(0, 7);
	let month = latest;
	if (latest === today.slice(0, 7) && Number(today.slice(8)) < 10) { const [y, m] = latest.split('-').map(Number); month = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`; }
	const hours = d.timeEntries.filter((t) => t.employeeId === e.id && t.date.startsWith(month) && !t.voided).reduce((s, t) => s + entryHours(t.start, t.end, t.breakMin), 0);
	const days = new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 0)).getUTCDate();

	const hm = (iso: string) => new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Berlin' });
	const ymd = (iso: string) => new Date(iso).toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
	const siteName = (id: string) => d.customers.flatMap((c) => c.sites).find((x) => x.id === id)?.name ?? '';
	const since = addDays(today, -14);
	const booked: StaffTime[] = d.timeEntries.filter((t) => t.employeeId === e.id && t.date >= since).map((t) => ({ id: t.id, date: t.date, start: t.start, end: t.end, breakMin: t.breakMin, hours: t.voided ? 0 : entryHours(t.start, t.end, t.breakMin), voided: t.voided, edited: !!t.editedAt, source: t.source, history: t.history, pending: false, offline: false }));
	const pendingPunches: StaffTime[] = inbox.filter((i) => i.kind === 'punch' && i.closed && i.status === 'neu' && i.payload.endAt).map((i) => ({ id: i.id, date: ymd(i.payload.startAt), start: hm(i.payload.startAt), end: hm(i.payload.endAt), breakMin: i.payload.breakMin ?? 0, hours: entryHours(hm(i.payload.startAt), hm(i.payload.endAt), i.payload.breakMin ?? 0), voided: false, edited: false, source: 'app', history: [], pending: true, offline: !!i.payload.offline }));
	const times = [...pendingPunches, ...booked].sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start));
	const openRow = inbox.find((i) => i.kind === 'punch' && !i.closed);
	const requests: StaffRequest[] = inbox.filter((i) => i.kind !== 'punch').map((i) => i.kind === 'absence'
		? { id: i.id, kind: 'absence' as const, label: i.payload.kind, from: i.payload.from, to: i.payload.to, status: i.status === 'neu' ? 'offen' : 'übernommen', createdAt: i.created_at }
		: i.kind === 'correction'
		? (() => { const c = (d.corrections ?? []).find((x) => x.id === 'c' + i.id); return { id: i.id, kind: 'correction' as const, label: `${i.payload.date.slice(8)}.${i.payload.date.slice(5, 7)}. ${i.payload.start}–${i.payload.end}`, status: c?.status ?? 'offen', reply: c?.reply || undefined, createdAt: i.created_at }; })()
		: { id: i.id, kind: 'defect' as const, label: String(i.payload.text).slice(0, 80), status: i.status === 'neu' ? 'offen' : 'übernommen', createdAt: i.created_at });

	return {
		requireQr: !!d.settings?.requireQr, geo: !!d.settings?.geo, times, requests, open: openRow ? { id: openRow.id, startedAt: openRow.payload.startAt, siteId: openRow.payload.siteId, site: siteName(openRow.payload.siteId) } : null,
		name: e.name, role: e.role, contract: e.contract, weeklyHours: e.weeklyHours,
		shifts, month, hours, soll: (e.weeklyHours * days) / 7,
		minijob: e.contract === 'minijob' ? { earnedCents: Math.round(hours * 1500), limitCents: MINIJOB_LIMIT } : null,
		leave: d.absences.filter((a) => a.employeeId === e.id && a.to >= today).sort((a, b) => a.from.localeCompare(b.from)).map((a) => ({ from: a.from, to: a.to, kind: a.kind, status: a.status })),
		instructedOn: e.instructedOn ? addYear(e.instructedOn) >= today ? e.instructedOn : null : null,
		officePhone: d.company.phone, company: d.company.name
	};
}
