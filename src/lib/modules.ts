/**
 * Funktionsumfang: Der Betrieb schaltet Bausteine (Module) ein oder aus. Ausgeblendet wird nur, nie gelöscht:
 * Alle Daten bleiben erhalten und sind nach dem Einschalten wieder da.
 * Ein Baustein ist nur aktiv, wenn auch alle seine Voraussetzungen aktiv sind.
 */
export type ModuleId = 'stamm' | 'verkauf' | 'einsatz' | 'zeiten' | 'mitarbeiter' | 'nachweis' | 'maengel' | 'rechnungen' | 'zusatz' | 'steuerung' | 'controlling' | 'ausstattung';

export interface ModuleDef {
	id: ModuleId;
	label: string;
	/** Ein Satz für Menschen: wofür ist das gut? */
	blurb: string;
	/** was darin steckt, zum Anzeigen */
	contains: string;
	requires: ModuleId[];
	/** Seiten (Pfadanfänge), die zu diesem Baustein gehören */
	pages: string[];
}

export const MODULES: ModuleDef[] = [
	{ id: 'stamm', label: 'Kunden und Objekte', blurb: 'Die Grundlage: Kunden, Objekte, Aufgaben und Fristen.', contains: 'Heute, Kunden, Aufgaben, Fristen', requires: [], pages: ['/', '/kunden', '/aufgaben', '/fristen', '/einstellungen', '/designsystem'] },
	{ id: 'verkauf', label: 'Angebote und Verträge', blurb: 'Von der Anfrage über Angebot und Kalkulation bis zum Vertrag.', contains: 'Vorgänge, Angebote, Kalkulator, Verträge, Bieter-Mappe, Projektzeitliste', requires: ['stamm'], pages: ['/vorgaenge', '/angebote', '/kalkulator', '/vertraege', '/ausschreibung', '/projektzeitliste'] },
	{ id: 'einsatz', label: 'Einsatzplanung', blurb: 'Wer ist wann wo? Pläne, Teamliste, Abwesenheiten und Vertretung.', contains: 'Einsatzplan, Team', requires: ['stamm'], pages: ['/einsatzplan', '/team'] },
	{ id: 'zeiten', label: 'Zeiterfassung', blurb: 'Arbeitszeiten erfassen, korrigieren, abschließen und für die Lohnabrechnung exportieren.', contains: 'Zeiten, Korrekturanträge, Monatsabschluss, Lohnstunden', requires: ['einsatz'], pages: ['/zeiten'] },
	{ id: 'mitarbeiter', label: 'Mitarbeiter-App', blurb: 'Das Team stempelt, meldet Krankheit und Mängel und tauscht Schichten auf dem Handy.', contains: 'Zugänge für Mitarbeitende, Stempeln, Meldungen, Schichttausch, Mitteilungen', requires: ['einsatz', 'zeiten'], pages: [] },
	{ id: 'nachweis', label: 'Leistungsverzeichnis und Nachweis', blurb: 'Was wird wo gereinigt, wurde es getan, hat der Kunde abgenommen?', contains: 'Leistungsverzeichnis, Checkliste, Leistungsnachweis mit PDF, Abnahme-Link, fällige Leistungen', requires: ['einsatz'], pages: ['/leistungsnachweis', '/abnahme'] },
	{ id: 'maengel', label: 'Mängel und Begehungen', blurb: 'Reklamationen mit Frist und Nachkontrolle, Qualitätskontrollen vor Ort.', contains: 'Mängel, Begehungen', requires: ['stamm'], pages: ['/maengel', '/begehungen'] },
	{ id: 'rechnungen', label: 'Rechnungen', blurb: 'Rechnungen schreiben, mahnen, E-Rechnung und DATEV.', contains: 'Rechnungen, E-Rechnung, Mahnwesen, Export für die Steuerberatung', requires: ['verkauf'], pages: ['/rechnungen', '/e-rechnung'] },
	{ id: 'zusatz', label: 'Zusatzleistungen', blurb: 'Extraarbeiten vom Wunsch bis zur Rechnung verfolgen.', contains: 'Zusatzleistungen', requires: ['rechnungen'], pages: ['/zusatzleistungen'] },
	{ id: 'steuerung', label: 'Leitstand und Karte', blurb: 'Der Tag live auf der Zeitleiste und alle Objekte auf der Karte.', contains: 'Leitstand, Karte, Vertretung nach Entfernung', requires: ['einsatz'], pages: ['/leitstand', '/karte'] },
	{ id: 'controlling', label: 'Controlling', blurb: 'Marge, Prognose und Gesundheit je Objekt.', contains: 'Cockpit, Controlling, Tarif-Simulator', requires: ['rechnungen', 'zeiten'], pages: ['/cockpit', '/controlling'] },
	{ id: 'ausstattung', label: 'Schlüssel, Material und Nachweise', blurb: 'Schlüssel- und Materialverwaltung, Nachweise von Subunternehmern.', contains: 'Schlüssel, Material, Nachweise', requires: ['stamm'], pages: ['/schluessel', '/material', '/nachweise'] }
];
export const MODULE_IDS = MODULES.map((m) => m.id);
export const MODULE_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m])) as Record<ModuleId, ModuleDef>;

/** Gespeicherte Auswahl: fehlende Einträge gelten als an (bestehende Betriebe behalten alles). */
export type ModuleChoice = Partial<Record<ModuleId, boolean>>;
const chosen = (c: ModuleChoice | undefined, id: ModuleId) => id === 'stamm' ? true : c?.[id] !== false;

/** Welche Bausteine sind wirklich aktiv? (gewählt und alle Voraussetzungen aktiv) */
export function activeModules(c: ModuleChoice | undefined, allowed?: Iterable<ModuleId>): Set<ModuleId> {
	const lic = allowed ? new Set(allowed) : null; // Paket der Lizenz: was nicht dazugehört, ist aus
	const on = new Set<ModuleId>();
	let changed = true;
	while (changed) {
		changed = false;
		for (const m of MODULES) if (!on.has(m.id) && chosen(c, m.id) && (!lic || lic.has(m.id)) && m.requires.every((r) => on.has(r))) { on.add(m.id); changed = true; }
	}
	return on;
}

/** Alle Bausteine, die direkt oder indirekt von diesem abhängen */
export function dependentsOf(id: ModuleId): ModuleId[] {
	const out = new Set<ModuleId>();
	let changed = true;
	while (changed) { changed = false; for (const m of MODULES) if (!out.has(m.id) && m.requires.some((r) => r === id || out.has(r))) { out.add(m.id); changed = true; } }
	return [...out];
}
/** Alle Voraussetzungen, direkt und indirekt */
export function prerequisitesOf(id: ModuleId): ModuleId[] {
	const out = new Set<ModuleId>();
	const walk = (x: ModuleId) => { for (const r of MODULE_BY_ID[x].requires) if (!out.has(r)) { out.add(r); walk(r); } };
	walk(id);
	return [...out];
}

/** Baustein einschalten: Voraussetzungen werden mitgewählt. */
export function enable(c: ModuleChoice | undefined, id: ModuleId): ModuleChoice {
	const next = { ...(c ?? {}) };
	for (const x of [id, ...prerequisitesOf(id)]) next[x] = true;
	return next;
}
/** Baustein ausschalten: alles, was von ihm abhängt, wird mit ausgeschaltet. */
export function disable(c: ModuleChoice | undefined, id: ModuleId): ModuleChoice {
	if (id === 'stamm') return { ...(c ?? {}) };
	const next = { ...(c ?? {}) };
	for (const x of [id, ...dependentsOf(id)]) next[x] = false;
	return next;
}

export type PresetId = 'einfach' | 'standard' | 'alles';
export const PRESETS: { id: PresetId; label: string; hint: string; on: ModuleId[] }[] = [
	{ id: 'einfach', label: 'Einfach', hint: 'Kunden, Angebote, Einsatzplan, Zeiten und Rechnungen. Das Wichtigste, ohne Beiwerk.', on: ['stamm', 'verkauf', 'einsatz', 'zeiten', 'rechnungen'] },
	{ id: 'standard', label: 'Standard', hint: 'Dazu Mitarbeiter-App, Mängel, Nachweise, Leitstand und Karte.', on: ['stamm', 'verkauf', 'einsatz', 'zeiten', 'rechnungen', 'mitarbeiter', 'maengel', 'nachweis', 'steuerung'] },
	{ id: 'alles', label: 'Alles', hint: 'Der volle Umfang, auch Zusatzleistungen, Controlling, Schlüssel und Material.', on: MODULE_IDS }
];
export function presetChoice(id: PresetId): ModuleChoice {
	const p = PRESETS.find((x) => x.id === id)!;
	return Object.fromEntries(MODULE_IDS.map((m) => [m, p.on.includes(m)])) as ModuleChoice;
}
/** Passt die aktive Auswahl genau zu einer Voreinstellung? */
export function matchingPreset(c: ModuleChoice | undefined): PresetId | null {
	const act = activeModules(c);
	return PRESETS.find((p) => p.on.length === act.size && p.on.every((m) => act.has(m)))?.id ?? null;
}

/** Zu welchem Baustein gehört dieser Pfad? Der längste passende Pfadanfang gewinnt; unbekannte Pfade gehören keinem. */
export function moduleOfPath(path: string): ModuleId | null {
	let best: { id: ModuleId; len: number } | null = null;
	for (const m of MODULES) for (const p of m.pages) {
		const hit = p === '/' ? path === '/' : path === p || path.startsWith(p + '/');
		if (hit && (!best || p.length > best.len)) best = { id: m.id, len: p.length };
	}
	return best?.id ?? null;
}
export const pathAllowed = (c: ModuleChoice | undefined, path: string, allowed?: Iterable<ModuleId>) => { const m = moduleOfPath(path); return m ? activeModules(c, allowed).has(m) : true; };
