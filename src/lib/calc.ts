import type { CalcSettings } from './types';

export const WEEKS_PER_MONTH = 52 / 12;

/** Verrechnungssatz netto pro Stunde (Cent) aus Lohn und Zuschlägen. */
export function hourlyRate(c: CalcSettings): number {
	const direct = (c.wageCents * (1 + c.lnkPct / 100)) / Math.max(0.01, c.productivePct / 100);
	return direct * (1 + (c.materialPct + c.machinePct + c.overheadPct) / 100) * (1 + c.profitPct / 100);
}
/** Stunden pro Monat für eine Fläche mit Leistungswert (m²/h) und Reinigungen pro Woche. */
export const monthlyHours = (areaM2: number, perHour: number, perWeek: number) =>
	perHour > 0 ? (areaM2 / perHour) * perWeek * WEEKS_PER_MONTH : 0;

/** 0 = Montag … 6 = Sonntag für ein YYYY-MM-DD. */
export const weekday = (key: string) => (new Date(key + 'T12:00:00Z').getUTCDay() + 6) % 7;
export function addDays(key: string, n: number) {
	const d = new Date(key + 'T12:00:00Z');
	d.setUTCDate(d.getUTCDate() + n);
	return d.toISOString().slice(0, 10);
}
export const mondayOf = (key: string) => addDays(key, -weekday(key));
export function addMonths(key: string, n: number) {
	const d = new Date(key + 'T12:00:00Z');
	d.setUTCMonth(d.getUTCMonth() + n);
	return d.toISOString().slice(0, 10);
}
export const toMinutes = (t: string) => {
	const [h, m] = t.split(':').map(Number);
	return h * 60 + (m || 0);
};
export const fromMinutes = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
/** Arbeitsstunden eines Eintrags; Ende vor Beginn gilt als Überlauf über Mitternacht. */
export function entryHours(start: string, end: string, breakMin: number) {
	let d = toMinutes(end) - toMinutes(start);
	if (d <= 0) d += 24 * 60;
	return Math.max(0, d - breakMin) / 60;
}
/** Zuschlagshinweis: Sonn-/Feiertag nur Sonntag erkannt (Feiertagskalender folgt), Nacht 23–6 Uhr. */
export function surchargeHint(date: string, start: string, end: string): string | null {
	if (weekday(date) === 6) return 'Sonntag';
	const s = toMinutes(start), e = toMinutes(end) <= s ? toMinutes(end) + 1440 : toMinutes(end);
	return s < 6 * 60 || e > 23 * 60 ? 'Nacht' : null;
}
