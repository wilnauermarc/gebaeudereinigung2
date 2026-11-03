/**
 * Zuschläge für Nacht, Sonntag und Feiertag. Sätze laut Rahmentarifvertrag Gebäudereinigung (Fassung 2019,
 * aus dem Recherchebericht): Nacht 30 %, Sonn-/Feiertag 80 %, hohe Feiertage 200 %. Es zählt je Minute
 * nur der höchste Zuschlag. Nachtzeit hier 23–6 Uhr (Annahme, im Betrieb zu prüfen). Pausen werden nicht verrechnet.
 */
import { addDays, toMinutes, weekday } from './calc';
import { holidayOn } from './feiertage';

export const NIGHT_PCT = 30, SUNDAY_PCT = 80, HOLIDAY_PCT = 80, HIGH_PCT = 200;

export interface SurchargeInfo {
	/** Minuten je Zuschlagssatz in Prozent */
	minutes: Record<number, number>;
	maxPct: number;
	/** z. B. „Sonntag +80 %“ */
	label: string | null;
}

function rateFor(date: string, minuteOfDay: number): { pct: number; why: string } {
	const h = holidayOn(date);
	let best = { pct: 0, why: '' };
	const take = (pct: number, why: string) => { if (pct > best.pct) best = { pct, why }; };
	if (minuteOfDay < 6 * 60 || minuteOfDay >= 23 * 60) take(NIGHT_PCT, 'Nacht');
	if (weekday(date) === 6) take(SUNDAY_PCT, 'Sonntag');
	if (h) take(h.high ? HIGH_PCT : HOLIDAY_PCT, h.high ? `Feiertag (${h.name})` : `Feiertag (${h.name})`);
	return best;
}

export function surchargeInfo(date: string, start: string, end: string): SurchargeInfo {
	const s = toMinutes(start);
	let e = toMinutes(end);
	if (e <= s) e += 1440;
	const minutes: Record<number, number> = {};
	let top = { pct: 0, why: '' };
	for (let m = s; m < e; m++) {
		const day = m >= 1440 ? addDays(date, 1) : date;
		const r = rateFor(day, m % 1440);
		if (r.pct) {
			minutes[r.pct] = (minutes[r.pct] ?? 0) + 1;
			if (r.pct > top.pct) top = r;
		}
	}
	return { minutes, maxPct: top.pct, label: top.pct ? `${top.why} +${top.pct} %` : null };
}

/** Zuschlagsbetrag in Cent auf Basis des Stundenlohns. */
export function surchargeCents(date: string, start: string, end: string, wageCents: number): number {
	const { minutes } = surchargeInfo(date, start, end);
	return Math.round(Object.entries(minutes).reduce((sum, [pct, min]) => sum + (min / 60) * wageCents * (Number(pct) / 100), 0));
}
