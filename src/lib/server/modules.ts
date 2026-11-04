import { store } from './store.ts';
import { activeModules, type ModuleId } from '../modules.ts';

/** Aktive Bausteine des Betriebs, aus dem gespeicherten Datenbestand (fehlende Auswahl = alles an). */
export function serverModules(): Set<ModuleId> {
	const s = store().getState();
	let choice;
	try { choice = s ? JSON.parse(s.json)?.settings?.modules : undefined; } catch { choice = undefined; }
	return activeModules(choice);
}

/** Welcher Baustein muss für diesen Endpunkt der Mitarbeitenden aktiv sein? (zusätzlich zur Mitarbeiter-App selbst) */
export function staffEndpointModule(path: string): ModuleId | 'mitarbeiter' | null {
	if (path === '/api/me/view' || path === '/api/me/profile') return null;
	if (path === '/api/me/punch' || path === '/api/me/correction') return 'zeiten';
	if (path === '/api/me/checklist') return 'nachweis';
	if (path === '/api/me/defect') return 'maengel';
	if (path === '/api/me/swap' || path === '/api/me/swaps') return 'einsatz';
	if (path.startsWith('/api/me/')) return 'mitarbeiter';
	return null;
}
