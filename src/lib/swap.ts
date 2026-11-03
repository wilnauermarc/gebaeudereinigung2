/**
 * Schichttausch: Prüfregeln. Eine Person gibt einen eigenen Einsatz ab, eine andere übernimmt ihn, das Büro genehmigt.
 * Übernehmen darf nur, wer zu dieser Zeit frei ist (keine Überschneidung, nicht abwesend, 11 Std. Ruhezeit, Minijob-Grenze).
 */
import { addDays, fromMinutes, toMinutes, weekday } from './calc';
import { coverCandidates, isAbsent, isReplaced } from './cockpit';
import type { Data } from './types';

export const REST_MINUTES = 11 * 60;
export interface ShiftInfo { siteId: string; date: string; start: string; end: string; startMin: number; endMin: number; customer: string; site: string; street: string }

/** Einsatz an einem Objekt und Tag (aus dem Reinigungsplan), unabhängig davon, wer ihn leistet */
export function shiftAt(d: Data, siteId: string, date: string): ShiftInfo | null {
	for (const c of d.customers) {
		const s = c.sites.find((x) => x.id === siteId);
		const p = s?.plan;
		if (!s || !p || !p.days.includes(weekday(date))) continue;
		const startMin = toMinutes(p.start), endMin = startMin + Math.round(p.hours * 60);
		return { siteId, date, start: p.start, end: fromMinutes(endMin), startMin, endMin, customer: c.name, site: s.name, street: `${s.street}, ${s.postal} ${s.city}` };
	}
	return null;
}
/** Alle Einsätze einer Person an einem Tag (Stammbesetzung ohne Abwesenheit/Ersetzte, plus Vertretungen) */
export function shiftsOn(d: Data, empId: string, date: string): ShiftInfo[] {
	const out: ShiftInfo[] = [];
	for (const c of d.customers) for (const s of c.sites) {
		const p = s.plan;
		if (!p || !p.days.includes(weekday(date))) continue;
		const regular = p.staffIds.includes(empId) && !isAbsent(d, empId, date) && !isReplaced(d, s.id, date, empId);
		const cover = d.covers.some((v) => v.siteId === s.id && v.date === date && v.employeeId === empId);
		if (regular || cover) { const i = shiftAt(d, s.id, date); if (i) out.push(i); }
	}
	return out;
}
/** Gehört dieser Einsatz der Person (kann sie ihn abgeben)? */
export const ownsShift = (d: Data, empId: string, siteId: string, date: string) => shiftsOn(d, empId, date).some((x) => x.siteId === siteId);

/** Darf die Person diesen Einsatz übernehmen? Liefert den Grund, wenn nicht. */
export function canTake(d: Data, empId: string, siteId: string, date: string): { ok: true } | { ok: false; reason: string } {
	const sh = shiftAt(d, siteId, date);
	if (!sh) return { ok: false, reason: 'Es gibt diesen Einsatz nicht mehr.' };
	const cand = coverCandidates(d, siteId, date).find((c) => c.employee.id === empId);
	if (!cand) return { ok: false, reason: 'Sie sind an diesem Objekt schon eingeplant.' };
	if (!cand.allowed) return { ok: false, reason: cand.reason === 'Termin zur selben Zeit' ? 'Sie haben zur selben Zeit einen anderen Einsatz.' : cand.reason === 'krank' || cand.reason === 'im Urlaub' ? 'Sie sind an diesem Tag abwesend.' : cand.reason === 'würde Minijob-Grenze überschreiten' ? 'Das würde Ihre Minijob-Grenze überschreiten.' : 'Das ist nicht möglich.' };
	for (const prev of shiftsOn(d, empId, addDays(date, -1))) if (1440 - Math.min(prev.endMin, 1440) + sh.startMin < REST_MINUTES) return { ok: false, reason: 'Zu wenig Ruhezeit (11 Stunden) nach dem Einsatz am Vortag.' };
	for (const next of shiftsOn(d, empId, addDays(date, 1))) if (1440 - Math.min(sh.endMin, 1440) + next.startMin < REST_MINUTES) return { ok: false, reason: 'Zu wenig Ruhezeit (11 Stunden) vor dem Einsatz am Folgetag.' };
	return { ok: true };
}
