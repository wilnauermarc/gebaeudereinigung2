/** Kartenhelfer: Nähe, Wegezeit, Tagesstatus und Vertretung nach Entfernung. Entfernungen sind Luftlinie, Fahrzeiten Schätzungen. */
import type { Data, Employee } from './types.ts';
import { fromMinutes, toMinutes, weekday } from './calc.ts';
import { coverCandidates, type CoverCandidate } from './cockpit.ts';
import { haversineKm } from './geo.ts';

/** Geschätzte Fahrzeit in Minuten: Luftlinie × 1,3 als Wegstrecke, 35 km/h im Stadtverkehr, 5 Minuten für Parken und Weg zum Eingang. */
export const travelMinutes = (airKm: number) => Math.ceil(((airKm * 1.3) / 35) * 60) + 5;

export interface Pos { lat?: number | null; lon?: number | null }
const has = (p: Pos): p is { lat: number; lon: number } => p.lat != null && p.lon != null;

/** Die nächsten Objekte zu einem Punkt, mit Entfernung (ohne das Objekt selbst, nur mit Position). */
export function nearby<T extends Pos & { id: string }>(from: { lat: number; lon: number; id: string }, items: T[], n = 4, maxKm = 15): { item: T; km: number }[] {
	return items.filter((i) => i.id !== from.id && has(i)).map((i) => ({ item: i, km: haversineKm([from.lat, from.lon], [i.lat!, i.lon!]) })).filter((x) => x.km <= maxKm).sort((a, b) => a.km - b.km).slice(0, n);
}

export interface TourStop extends Pos { siteId: string; start: string; hours: number }
export interface Leg { fromId: string; toId: string; km: number | null; needMin: number | null; gapMin: number; /** reicht die Pause zwischen den Einsätzen nicht für die Fahrt? */ tight: boolean }
/** Wege zwischen aufeinanderfolgenden Einsätzen einer Person und ob die Zeit dafür reicht. */
export function tourLegs(stops: TourStop[]): Leg[] {
	const s = [...stops].sort((a, b) => a.start.localeCompare(b.start));
	const out: Leg[] = [];
	for (let i = 1; i < s.length; i++) {
		const a = s[i - 1], b = s[i];
		const gap = toMinutes(b.start) - (toMinutes(a.start) + Math.round(a.hours * 60));
		const km = has(a) && has(b) ? haversineKm([a.lat, a.lon], [b.lat, b.lon]) : null;
		const need = km == null ? null : travelMinutes(km);
		out.push({ fromId: a.siteId, toId: b.siteId, km, needMin: need, gapMin: gap, tight: need != null && gap < need });
	}
	return out;
}

export type VisitState = 'gebucht' | 'geplant' | 'spaet' | 'fehlt';
/**
 * Stand eines Einsatzes am Tag: gebucht (jemand hat Zeit gebucht), geplant (noch nicht dran),
 * spät (heute, Beginn überschritten, keine Buchung) oder fehlt (vergangener Tag ohne Buchung).
 */
export function visitState(d: Data, siteId: string, date: string, today: string, nowMin: number): VisitState {
	if (d.timeEntries.some((t) => t.siteId === siteId && t.date === date && !t.voided)) return 'gebucht';
	if (date < today) return 'fehlt';
	if (date > today) return 'geplant';
	const start = d.customers.flatMap((c) => c.sites).find((s) => s.id === siteId)?.plan?.start;
	return start && toMinutes(start) + 15 < nowMin ? 'spaet' : 'geplant';
}

export interface RadarEntry extends CoverCandidate { km: number | null; from: string | null; needMin: number | null }
/**
 * Vertretung nach Entfernung: wer ist einsetzbar, und wie weit ist er oder sie vom Objekt entfernt?
 * Entfernung = zum nächsten Einsatz dieser Person am selben Tag (Privatadressen sind nicht gespeichert); ohne Einsatz unbekannt.
 */
export function coverRadar(d: Data, siteId: string, date: string): RadarEntry[] {
	const target = d.customers.flatMap((c) => c.sites).find((s) => s.id === siteId);
	const wd = weekday(date);
	const placeOf = (e: Employee) => {
		let best: { km: number; from: string } | null = null;
		for (const c of d.customers) for (const s of c.sites) {
			if (s.id === siteId || !has(s) || !target || !has(target)) continue;
			const mine = (s.plan?.days.includes(wd) && s.plan.staffIds.includes(e.id)) || d.covers.some((v) => v.siteId === s.id && v.date === date && v.employeeId === e.id);
			if (!mine) continue;
			const km = haversineKm([target.lat, target.lon], [s.lat, s.lon]);
			if (!best || km < best.km) best = { km, from: s.name };
		}
		return best;
	};
	return coverCandidates(d, siteId, date).map((c) => { const p = placeOf(c.employee); return { ...c, km: p?.km ?? null, from: p?.from ?? null, needMin: p ? travelMinutes(p.km) : null }; })
		.sort((a, b) => Number(b.allowed) - Number(a.allowed) || (a.km ?? 1e9) - (b.km ?? 1e9) || b.capacityLeft - a.capacityLeft);
}

export const endOfVisit = (start: string, hours: number) => fromMinutes(toMinutes(start) + Math.round(hours * 60));
