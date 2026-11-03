/** Bundesweite gesetzliche Feiertage (Landesfeiertage folgen). „hoch“ = Tarif-Zuschlag 200 % (Neujahr, 1. Mai, Weihnachten). */
export interface Holiday {
	name: string;
	high: boolean;
}

/** Ostersonntag nach der Gaußschen Osterformel. */
export function easter(year: number): Date {
	const a = year % 19, b = Math.floor(year / 100), c = year % 100;
	const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
	const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
	return new Date(Date.UTC(year, month - 1, day, 12));
}
const key = (d: Date) => d.toISOString().slice(0, 10);
const shift = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

const cache = new Map<number, Map<string, Holiday>>();
export function holidays(year: number): Map<string, Holiday> {
	const hit = cache.get(year);
	if (hit) return hit;
	const e = easter(year);
	const m = new Map<string, Holiday>();
	const add = (k: string, name: string, high = false) => m.set(k, { name, high });
	add(`${year}-01-01`, 'Neujahr', true);
	add(key(shift(e, -2)), 'Karfreitag');
	add(key(shift(e, 1)), 'Ostermontag');
	add(`${year}-05-01`, 'Tag der Arbeit', true);
	add(key(shift(e, 39)), 'Christi Himmelfahrt');
	add(key(shift(e, 50)), 'Pfingstmontag');
	add(`${year}-10-03`, 'Tag der Deutschen Einheit');
	add(`${year}-12-25`, '1. Weihnachtstag', true);
	add(`${year}-12-26`, '2. Weihnachtstag', true);
	cache.set(year, m);
	return m;
}
export const holidayOn = (dateKey: string) => holidays(Number(dateKey.slice(0, 4))).get(dateKey) ?? null;
