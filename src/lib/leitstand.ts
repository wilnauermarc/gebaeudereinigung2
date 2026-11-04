/**
 * Leitstand: der Tag als Zeitleiste. Verbindet Einsatzplan, Abwesenheiten, Vertretungen, Zeitbuchungen und den Live-Stand
 * (laufende Stempelungen, Checklisten) zu einem Bild: Wo läuft es, wo hakt es, was muss das Büro jetzt tun?
 */
import type { Data } from './types.ts';
import { fromMinutes, toMinutes } from './calc.ts';
import { isAbsent, isReplaced } from './cockpit.ts';

export interface Live {
	now: string;
	today: string;
	punches: { employeeId: string; siteId: string; startAt: string; endAt: string | null; offline: boolean }[];
	checklists: { employeeId: string; siteId: string; at: string; due: number; done: number }[];
	absences: { employeeId: string; kind: string; from: string; to: string; at: string }[];
}
export type PersonState = 'drin' | 'fertig' | 'wartet' | 'spaet' | 'fehlt';
export type ShiftState = 'fertig' | 'laeuft' | 'spaet' | 'geplant' | 'unbesetzt' | 'fehlt';
export interface BoardPerson { id: string; name: string; first: string; role: string; phone: string; state: PersonState; since: string | null; cover: boolean; offline: boolean }
export interface BoardAbsent { id: string; name: string; first: string; phone: string; kind: 'krank' | 'urlaub' }
export interface BoardShift {
	siteId: string; siteName: string; customerId: string; customerName: string; note: string;
	start: string; end: string; startMin: number; endMin: number;
	people: BoardPerson[]; absent: BoardAbsent[]; regular: number;
	state: ShiftState; empty: boolean; under: boolean;
	checklist: { done: number; due: number } | null; defects: number;
}
export interface BoardAlert { id: string; level: 'rot' | 'gelb' | 'info'; text: string; siteId?: string; sortMin: number }
export interface Board {
	date: string; isToday: boolean; nowMin: number;
	shifts: BoardShift[]; alerts: BoardAlert[];
	counts: { total: number; running: number; done: number; late: number; empty: number; absent: number };
	rangeStart: number; rangeEnd: number;
}

const berlinMinutes = (ms: number) => { const [h, m] = new Date(ms).toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hour12: false }).split(':').map(Number); return h * 60 + m; };
const berlinHm = (iso: string) => new Date(iso).toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hour12: false });
const weekday = (key: string) => (new Date(key + 'T12:00:00Z').getUTCDay() + 6) % 7;
/** Wie viele Minuten nach Beginn gilt jemand als „zu spät“ */
export const GRACE_MIN = 15;

export function buildBoard(d: Data, date: string, nowMs: number, live: Live | null): Board {
	const today = live?.today ?? new Date(nowMs).toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
	const isToday = date === today, isPast = date < today;
	const nowMin = berlinMinutes(nowMs);
	const emp = (id: string) => d.employees.find((e) => e.id === id);
	// Krankmeldungen von heute, die das Büro noch nicht übernommen hat, zählen schon jetzt
	const liveAbsent = (id: string) => (isToday ? live?.absences.find((a) => a.employeeId === id && a.from <= date && date <= a.to) : undefined);
	const absenceOf = (id: string): 'krank' | 'urlaub' | null => {
		const a = isAbsent(d, id, date);
		if (a) return a.kind === 'krank' ? 'krank' : 'urlaub';
		const l = liveAbsent(id);
		return l ? (l.kind === 'krank' ? 'krank' : 'urlaub') : null;
	};

	const shifts: BoardShift[] = [];
	for (const c of d.customers) for (const s of c.sites) {
		const p = s.plan;
		if (!p || !p.days.includes(weekday(date))) continue;
		const startMin = toMinutes(p.start), endMin = startMin + Math.round(p.hours * 60);
		const regular = p.staffIds.map(emp).filter((e): e is NonNullable<ReturnType<typeof emp>> => !!e);
		const present = regular.filter((e) => !absenceOf(e.id) && !isReplaced(d, s.id, date, e.id));
		const absent: BoardAbsent[] = regular.filter((e) => absenceOf(e.id) && !isReplaced(d, s.id, date, e.id)).map((e) => ({ id: e.id, name: e.name, first: e.name.split(' ')[0], phone: e.phone, kind: absenceOf(e.id)! }));
		const covers = d.covers.filter((v) => v.siteId === s.id && v.date === date).map((v) => emp(v.employeeId)).filter((e): e is NonNullable<ReturnType<typeof emp>> => !!e);
		const coverIds = new Set(covers.map((e) => e.id));
		const people: BoardPerson[] = [...present, ...covers.filter((e) => !present.some((x) => x.id === e.id))].map((e) => {
			const open = live?.punches.find((x) => x.employeeId === e.id && x.siteId === s.id && x.endAt == null && (isToday));
			const closedLive = live?.punches.find((x) => x.employeeId === e.id && x.siteId === s.id && x.endAt != null && x.startAt.length > 0 && isToday);
			const booked = d.timeEntries.find((t) => t.employeeId === e.id && t.siteId === s.id && t.date === date && !t.voided);
			let state: PersonState; let since: string | null = null;
			if (open) { state = 'drin'; since = berlinHm(open.startAt); }
			else if (closedLive || booked) { state = 'fertig'; since = closedLive ? berlinHm(closedLive.startAt) : booked!.start; }
			else if (isPast) state = 'fehlt';
			else if (isToday && nowMin > endMin) state = 'fehlt';
			else if (isToday && nowMin > startMin + GRACE_MIN) state = 'spaet';
			else state = 'wartet';
			return { id: e.id, name: e.name, first: e.name.split(' ')[0], role: e.role, phone: e.phone, state, since, cover: coverIds.has(e.id), offline: !!(open?.offline || closedLive?.offline) };
		});
		const empty = people.length === 0;
		const under = !empty && people.length < regular.length;
		let state: ShiftState;
		if (empty) state = isPast ? 'fehlt' : 'unbesetzt';
		else if (people.every((x) => x.state === 'fertig')) state = 'fertig';
		else if (isPast) state = 'fehlt';
		else if (people.some((x) => x.state === 'drin')) state = 'laeuft';
		else if (people.every((x) => x.state === 'fehlt' || x.state === 'fertig')) state = 'fehlt';
		else if (people.some((x) => x.state === 'spaet')) state = 'spaet';
		else state = 'geplant';
		const lists = (live?.checklists ?? []).filter((x) => x.siteId === s.id).sort((a, b) => b.at.localeCompare(a.at));
		const checklist = isToday && lists[0] ? { done: lists[0].done, due: lists[0].due } : null;
		shifts.push({
			siteId: s.id, siteName: s.name, customerId: c.id, customerName: c.name, note: s.note ?? '', start: p.start, end: fromMinutes(endMin), startMin, endMin, people, absent, regular: regular.length, state, empty, under, checklist,
			defects: d.defects.filter((x) => x.siteId === s.id && x.status !== 'erledigt').length
		});
	}
	shifts.sort((a, b) => a.startMin - b.startMin || a.siteName.localeCompare(b.siteName));

	// ── Hinweise: nur für heute, nach Dringlichkeit ──
	const alerts: BoardAlert[] = [];
	if (isToday) {
		for (const sh of shifts) {
			const started = nowMin >= sh.startMin, over = nowMin > sh.endMin;
			if (sh.empty && !over) alerts.push({ id: 'u' + sh.siteId, level: started ? 'rot' : 'gelb', text: `${sh.siteName} (${sh.start} Uhr) ist unbesetzt${started ? ' und hat schon begonnen' : ''}.`, siteId: sh.siteId, sortMin: sh.startMin });
			for (const a of sh.absent) alerts.push({ id: 'a' + sh.siteId + a.id, level: started && !sh.empty ? 'gelb' : sh.empty ? 'rot' : 'gelb', text: `${a.first} fehlt (${a.kind}) bei ${sh.siteName}, ${sh.start} Uhr${sh.empty ? ', keine Vertretung' : ''}.`, siteId: sh.siteId, sortMin: sh.startMin });
			for (const p of sh.people) {
				if (p.state === 'spaet' && !over) { const late = nowMin - sh.startMin; alerts.push({ id: 's' + sh.siteId + p.id, level: late > 30 ? 'rot' : 'gelb', text: `${p.first} ist bei ${sh.siteName} noch nicht eingestempelt (Beginn ${sh.start}, seit ${late} Min).`, siteId: sh.siteId, sortMin: sh.startMin }); }
				if (p.state === 'fehlt' && over) alerts.push({ id: 'm' + sh.siteId + p.id, level: 'gelb', text: `${p.first}: bei ${sh.siteName} (${sh.start}–${sh.end} Uhr) wurde nichts eingestempelt.`, siteId: sh.siteId, sortMin: sh.startMin });
				if (p.state === 'drin' && nowMin > sh.endMin + 30) alerts.push({ id: 'o' + sh.siteId + p.id, level: 'gelb', text: `${p.first} ist bei ${sh.siteName} noch eingestempelt, Einsatzende war ${sh.end} Uhr.`, siteId: sh.siteId, sortMin: sh.endMin });
				if (p.offline) alerts.push({ id: 'f' + sh.siteId + p.id, level: 'info', text: `${p.first}: Stempelung bei ${sh.siteName} wurde offline erfasst und nachgereicht.`, siteId: sh.siteId, sortMin: sh.startMin });
			}
			if (sh.under && !sh.empty && !over) alerts.push({ id: 'n' + sh.siteId, level: 'gelb', text: `${sh.siteName}: ${sh.people.length} von ${sh.regular} Personen eingeplant.`, siteId: sh.siteId, sortMin: sh.startMin });
		}
	}
	const rank = { rot: 0, gelb: 1, info: 2 } as const;
	alerts.sort((a, b) => rank[a.level] - rank[b.level] || a.sortMin - b.sortMin);

	const absentIds = new Set(shifts.flatMap((s) => s.absent.map((a) => a.id)));
	const counts = {
		total: shifts.length,
		running: shifts.filter((s) => s.state === 'laeuft').length,
		done: shifts.filter((s) => s.state === 'fertig').length,
		late: shifts.filter((s) => s.state === 'spaet' || (isToday && s.state === 'fehlt')).length,
		empty: shifts.filter((s) => s.state === 'unbesetzt' || (s.empty && isPast)).length,
		absent: absentIds.size
	};
	const lo = shifts.length ? Math.min(...shifts.map((s) => s.startMin)) : 6 * 60, hi = shifts.length ? Math.max(...shifts.map((s) => s.endMin)) : 18 * 60;
	let rangeStart = Math.floor((lo - 30) / 60) * 60, rangeEnd = Math.ceil((hi + 30) / 60) * 60;
	if (rangeEnd - rangeStart < 8 * 60) rangeEnd = rangeStart + 8 * 60;
	rangeStart = Math.max(0, rangeStart); rangeEnd = Math.min(24 * 60, Math.max(rangeEnd, rangeStart + 6 * 60));
	return { date, isToday, nowMin, shifts, alerts, counts, rangeStart, rangeEnd };
}
