/** Kennzahlen für die Instrumentenleiste der Seitenköpfe (gleiches Muster auf allen Seiten). */
import { addDays } from './calc';
import { dayDiff } from './format';
import type { Data } from './types';
import type { Instrument } from './ux';

const pct = (n: number, of: number) => (of ? n / of : 1);

export function taskInstruments(d: Data, today: string): Instrument[] {
	const open = d.tasks.filter((t) => !t.done);
	const over = open.filter((t) => t.dueOn && t.dueOn < today).length;
	const dueToday = open.filter((t) => t.dueOn === today).length;
	const doneToday = d.tasks.filter((t) => t.done && t.doneOn === today).length;
	const goal = over + dueToday + doneToday;
	return [
		{ kind: 'gauge', label: 'Tagesziel', value: pct(doneToday, goal), sub: goal ? `${doneToday} von ${goal} erledigt` : 'Heute nichts fällig', good: 0.99, warn: 0.5 },
		{ kind: 'stat', label: 'Offen', value: String(open.length), sub: 'alle Aufgaben' },
		{ kind: 'stat', label: 'Überfällig', value: String(over), sub: 'Frist überschritten', tone: over ? 'danger' : 'success' },
		{ kind: 'stat', label: 'In Arbeit', value: String(open.filter((t) => t.status === 'doing').length), sub: `${open.filter((t) => t.status === 'waiting').length} warten auf andere` }
	];
}

export function materialInstruments(d: Data, today: string): Instrument[] {
	const supplies = d.material.filter((m) => m.kind === 'verbrauch');
	const low = supplies.filter((m) => m.stock < m.min).length;
	const devices = d.material.filter((m) => m.kind === 'geraet');
	const overdue = devices.filter((m) => m.nextCheckOn && m.nextCheckOn < today).length;
	const soon = devices.filter((m) => m.nextCheckOn && m.nextCheckOn >= today && dayDiff(m.nextCheckOn) <= 30).length;
	return [
		{ kind: 'gauge', label: 'Bestand ok', value: pct(supplies.length - low, supplies.length), sub: `${supplies.length - low} von ${supplies.length} Artikeln`, good: 0.9, warn: 0.7 },
		{ kind: 'stat', label: 'Unter Mindestmenge', value: String(low), sub: 'nachbestellen', tone: low ? 'warn' : 'success' },
		{ kind: 'stat', label: 'Prüfung überfällig', value: String(overdue), sub: `${soon} in 30 Tagen fällig`, tone: overdue ? 'danger' : 'success' },
		{ kind: 'stat', label: 'Gefahrstoffe', value: String(d.material.filter((m) => m.hazardous).length), sub: 'gekennzeichnet' }
	];
}

export function docInstruments(d: Data, today: string): Instrument[] {
	const dated = d.docs.filter((x) => x.validUntil);
	const expired = dated.filter((x) => x.validUntil! < today).length;
	const soon = dated.filter((x) => x.validUntil! >= today && dayDiff(x.validUntil!) <= 30).length;
	const ok = dated.length - expired - soon;
	return [
		{ kind: 'gauge', label: 'Nachweise gültig', value: pct(ok, dated.length), sub: `${ok} von ${dated.length}`, good: 0.95, warn: 0.8 },
		{ kind: 'stat', label: 'Abgelaufen', value: String(expired), sub: 'sofort erneuern', tone: expired ? 'danger' : 'success' },
		{ kind: 'stat', label: 'Bald fällig', value: String(soon), sub: 'in 30 Tagen', tone: soon ? 'warn' : 'success' },
		{ kind: 'stat', label: 'Nachweise gesamt', value: String(d.docs.length), sub: 'Betrieb und Subunternehmer' }
	];
}

export function keyInstruments(d: Data): Instrument[] {
	const out = d.keys.filter((k) => k.status === 'ausgegeben').length;
	const lost = d.keys.filter((k) => k.status === 'verloren').length;
	return [
		{ kind: 'gauge', label: 'Im Büro', value: pct(d.keys.filter((k) => k.status === 'im_buero').length, d.keys.length), sub: `${d.keys.length} Schlüssel und Transponder`, good: 0.3, warn: 0.1 },
		{ kind: 'stat', label: 'Ausgegeben', value: String(out), sub: 'bei Mitarbeitenden' },
		{ kind: 'stat', label: 'Verloren', value: String(lost), sub: lost ? 'Schloss prüfen, Versicherung melden' : 'nichts vermisst', tone: lost ? 'danger' : 'success' }
	];
}

export function inspectionInstruments(d: Data, today: string): Instrument[] {
	const rated = (i: Data['inspections'][number]) => i.items.filter((x) => x.rating !== 'na');
	const all = d.inspections.flatMap(rated);
	const ok = all.filter((x) => x.rating === 'ok').length;
	const recent = d.inspections.filter((i) => dayDiff(i.date) >= -30 && i.date <= addDays(today, 0)).length;
	return [
		{ kind: 'gauge', label: 'Erfüllungsgrad', value: pct(ok, all.length), sub: `${ok} von ${all.length} Punkten ok`, good: 0.9, warn: 0.75 },
		{ kind: 'stat', label: 'Begehungen', value: String(d.inspections.length), sub: `${recent} in 30 Tagen` },
		{ kind: 'stat', label: 'Mängel festgestellt', value: String(all.length - ok), sub: 'in allen Begehungen', tone: all.length - ok ? 'warn' : 'success' },
		{ kind: 'stat', label: 'Im Portal sichtbar', value: String(d.inspections.filter((i) => i.shared).length), sub: 'für Kunden freigegeben' }
	];
}
