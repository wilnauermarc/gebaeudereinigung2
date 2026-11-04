/** Leistungsverzeichnis (LV) je Objekt: Versionen mit Gültigkeitsdatum, Vergleich und Fälligkeit. */
import type { LvInterval, LvItem, LvVersion, Site } from './types.ts';
import { weekday } from './calc.ts';

export const intervalLabels: Record<LvInterval, string> = {
	taeglich: 'an jedem Einsatz',
	woechentlich: 'wöchentlich',
	zweiwoechentlich: 'alle 2 Wochen',
	monatlich: 'monatlich',
	quartal: 'vierteljährlich',
	halbjahr: 'halbjährlich',
	jaehrlich: 'jährlich',
	bedarf: 'nach Bedarf'
};
export const intervalOrder = Object.keys(intervalLabels) as LvInterval[];

/** Der am Stichtag gültige Stand: die neueste Version mit Beginn am oder vor dem Tag. */
export function lvAt(site: Pick<Site, 'lv'>, date: string): LvVersion | null {
	const valid = (site.lv ?? []).filter((v) => v.validFrom <= date).sort((a, b) => a.validFrom.localeCompare(b.validFrom) || a.createdAt.localeCompare(b.createdAt));
	return valid.at(-1) ?? null;
}

const uid = () => Math.random().toString(36).slice(2, 9);
export const newItem = (): LvItem => ({ id: 'l' + uid(), room: '', task: '', interval: 'taeglich', areaM2: null, note: '' });

/**
 * Neue Version ab einem Datum, als Kopie des bisher gültigen Stands. Ein Beginn vor dem der letzten Version ist nicht erlaubt,
 * weil sich sonst rückwirkend ändern würde, wonach bereits geprüft wurde.
 */
export function addVersion(site: Site, validFrom: string, note: string, by: string, now = new Date().toISOString()): { ok: true; version: LvVersion } | { ok: false; error: string } {
	site.lv ??= [];
	const list = site.lv; // über den Proxy (Svelte-Zustand), nicht über das zugewiesene Rohobjekt
	const last = [...list].sort((a, b) => a.validFrom.localeCompare(b.validFrom)).at(-1);
	if (last && validFrom <= last.validFrom) return { ok: false, error: `Die neue Version muss nach dem Stand vom ${last.validFrom.split('-').reverse().join('.')} beginnen.` };
	const base = last ?? null;
	const version: LvVersion = { id: 'v' + uid(), validFrom, note, createdAt: now, createdBy: by, items: (base?.items ?? []).map((i) => ({ ...i, id: 'l' + uid() })) };
	list.push(version);
	return { ok: true, version: list.at(-1)! }; // bei Svelte-Zustand ist das der Proxy, nicht das Ausgangsobjekt
}

export interface LvDiff { added: LvItem[]; removed: LvItem[]; changed: { before: LvItem; after: LvItem }[] }
/** Was hat sich zwischen zwei Ständen geändert? Zuordnung über Raum und Leistung. */
export function diffLv(before: LvVersion | null, after: LvVersion): LvDiff {
	const key = (i: LvItem) => `${i.room.trim().toLowerCase()}|${i.task.trim().toLowerCase()}`;
	const b = new Map((before?.items ?? []).map((i) => [key(i), i]));
	const a = new Map(after.items.map((i) => [key(i), i]));
	const added = after.items.filter((i) => !b.has(key(i)));
	const removed = (before?.items ?? []).filter((i) => !a.has(key(i)));
	const changed = after.items.filter((i) => b.has(key(i))).map((i) => ({ before: b.get(key(i))!, after: i })).filter((x) => x.before.interval !== x.after.interval || x.before.areaM2 !== x.after.areaM2 || x.before.note !== x.after.note);
	return { added, removed, changed };
}

/** Ist die Leistung an diesem Einsatztag voraussichtlich dran? „taeglich“ immer, wöchentlich am ersten Einsatztag der Woche; Seltenes manuell. */
export function dueAtVisit(item: LvItem, date: string, plannedDays: number[]): boolean {
	if (item.interval === 'taeglich') return true;
	if (item.interval === 'woechentlich' || item.interval === 'zweiwoechentlich') return weekday(date) === Math.min(...plannedDays);
	return false;
}
