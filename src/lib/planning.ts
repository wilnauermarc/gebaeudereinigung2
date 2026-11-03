/** Planungswarnungen für den Einsatzplan: Doppelbelegung, Ruhezeit (11 Std., § 5 ArbZG) und Wochenstunden über Vertrag. */
import { addDays, toMinutes } from './calc';
type Db = typeof import('./db.svelte').db;

export interface PlanWarning {
	kind: 'doppelt' | 'ruhezeit' | 'ueberstunden';
	employeeId: string;
	date: string;
	text: string;
}
interface Shift { employeeId: string; date: string; start: number; end: number; label: string }

export const REST_MIN = 11 * 60;
const OVERTIME_TOLERANCE_H = 5;

/** Alle Schichten (Stamm + Vertretung, ohne Abwesende) der Tage `days`, Zeiten in Minuten ab Mitternacht des jeweiligen Tages. */
export function shiftsOf(db: Pick<Db, 'plannedSites' | 'staffing'>, days: string[]): Shift[] {
	const out: Shift[] = [];
	for (const { site, customer } of db.plannedSites()) {
		const p = site.plan!;
		for (const d of days) {
			const st = db.staffing(site.id, d);
			if (!st) continue;
			const start = toMinutes(p.start);
			for (const e of [...st.present, ...st.covers.map((c) => c.emp)]) out.push({ employeeId: e.id, date: d, start, end: start + Math.round(p.hours * 60), label: `${customer.name.slice(0, 24)} ${p.start}` });
		}
	}
	return out;
}

export function planWarnings(db: Pick<Db, 'plannedSites' | 'staffing' | 'employee'>, days: string[]): PlanWarning[] {
	const out: PlanWarning[] = [];
	// einen Tag davor einbeziehen, damit die Ruhezeit zum Wochenbeginn stimmt
	const shifts = shiftsOf(db, [addDays(days[0], -1), ...days]);
	const name = (id: string) => db.employee(id)?.name.split(' ')[0] ?? id;
	const byEmp = new Map<string, Shift[]>();
	for (const s of shifts) byEmp.set(s.employeeId, [...(byEmp.get(s.employeeId) ?? []), s]);
	for (const [id, list] of byEmp) {
		const abs = (s: Shift) => dayIndex(s.date, list) * 1440 + s.start;
		const sorted = [...list].sort((a, b) => abs(a) - abs(b));
		for (let i = 1; i < sorted.length; i++) {
			const a = sorted[i - 1], b = sorted[i];
			const aEnd = dayIndex(a.date, list) * 1440 + a.end, bStart = dayIndex(b.date, list) * 1440 + b.start;
			if (!days.includes(b.date)) continue;
			if (bStart < aEnd) out.push({ kind: 'doppelt', employeeId: id, date: b.date, text: `${name(id)} ist am ${b.date.split('-').reverse().slice(0, 2).join('.')}. doppelt eingeplant (${a.label} und ${b.label}).` });
			else if (a.date !== b.date && bStart - aEnd < REST_MIN) out.push({ kind: 'ruhezeit', employeeId: id, date: b.date, text: `${name(id)}: nur ${Math.floor((bStart - aEnd) / 60)} Std. Ruhezeit vor ${b.label} (${b.date.split('-').reverse().slice(0, 2).join('.')}.), nötig sind 11.` });
		}
		const emp = db.employee(id);
		const hours = list.filter((s) => days.includes(s.date)).reduce((a, s) => a + (s.end - s.start) / 60, 0);
		if (emp && hours > emp.weeklyHours + OVERTIME_TOLERANCE_H) out.push({ kind: 'ueberstunden', employeeId: id, date: days[0], text: `${name(id)}: ${Math.round(hours)} Std. geplant bei ${emp.weeklyHours} Std. Vertrag.` });
	}
	return out;
}
/** Tage seit dem frühesten Datum in der Liste, um Schichten über Mitternacht hinweg vergleichbar zu machen */
function dayIndex(date: string, list: Shift[]) {
	const min = list.reduce((m, s) => (s.date < m ? s.date : m), list[0].date);
	return Math.round((Date.parse(date + 'T12:00:00Z') - Date.parse(min + 'T12:00:00Z')) / 86400000);
}
