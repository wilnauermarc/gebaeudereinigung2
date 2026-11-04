/** Der aktuelle Funktionsumfang des Betriebs (aus den Einstellungen), reaktiv für Menü, Seiten und Knöpfe. */
import { db } from './db.svelte.ts';
import { activeModules, pathAllowed, type ModuleId } from './modules.ts';

class Features {
	active = $derived(activeModules(db.data.settings?.modules));
	/** Ist dieser Baustein aktiv? */
	has = (id: ModuleId) => this.active.has(id);
	/** Darf diese Seite gezeigt werden? */
	path = (p: string) => pathAllowed(db.data.settings?.modules, p);
}
export const features = new Features();
