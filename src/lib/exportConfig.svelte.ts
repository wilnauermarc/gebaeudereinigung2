import { defaultExportConfig, type ExportConfig } from './export';
const KEY = 'resch-export-config';
/** Schnittstellen-Einstellungen für die Steuerberatung, lokal im Browser gespeichert. */
class ExportSettings {
	cfg = $state<ExportConfig>(structuredClone(defaultExportConfig));
	constructor() {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) { const p = JSON.parse(raw); this.cfg = { ...defaultExportConfig, ...p, lohnarten: { ...defaultExportConfig.lohnarten, ...(p.lohnarten ?? {}) } }; }
		} catch { /* Standard */ }
	}
	save() { try { localStorage.setItem(KEY, JSON.stringify(this.cfg)); } catch { /* ignorieren */ } }
}
export const exportSettings = new ExportSettings();
