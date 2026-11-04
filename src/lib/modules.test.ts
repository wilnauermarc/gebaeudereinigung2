import { describe, expect, it } from 'vitest';
import { MODULES, MODULE_IDS, PRESETS, activeModules, dependentsOf, disable, enable, matchingPreset, moduleOfPath, pathAllowed, presetChoice, prerequisitesOf, type ModuleChoice, type ModuleId } from './modules.ts';

describe('Funktionsumfang', () => {
	it('ohne Auswahl ist alles an (bestehende Betriebe ändern sich nicht)', () => {
		expect(activeModules(undefined).size).toBe(MODULE_IDS.length);
		expect(activeModules({}).size).toBe(MODULE_IDS.length);
	});
	it('Grundbaustein lässt sich nicht ausschalten', () => {
		expect(activeModules({ stamm: false }).has('stamm')).toBe(true);
		expect(disable(undefined, 'stamm').stamm).toBeUndefined();
	});
	it('Abhängigkeiten haben keinen Zirkel und zeigen auf bekannte Bausteine', () => {
		for (const m of MODULES) { expect(m.requires.every((r) => MODULE_IDS.includes(r))).toBe(true); expect(prerequisitesOf(m.id)).not.toContain(m.id); }
	});
	it('Ausschalten nimmt Abhängige mit, Einschalten holt Voraussetzungen', () => {
		const off = disable(undefined, 'rechnungen');
		const act = activeModules(off);
		expect(act.has('rechnungen')).toBe(false);
		for (const d of dependentsOf('rechnungen')) expect(act.has(d)).toBe(false);
		expect(dependentsOf('rechnungen')).toEqual(expect.arrayContaining(['zusatz', 'controlling']));
		const back = activeModules(enable(off, 'zusatz'));
		expect(back.has('zusatz') && back.has('rechnungen') && back.has('verkauf')).toBe(true);
	});
	it('gewählt, aber Voraussetzung fehlt: nicht aktiv', () => {
		expect(activeModules({ einsatz: false }).has('zeiten')).toBe(false);
		expect(activeModules({ einsatz: false }).has('mitarbeiter')).toBe(false);
	});
	it('Voreinstellungen sind in sich stimmig und erkennbar', () => {
		for (const p of PRESETS) {
			const act = activeModules(presetChoice(p.id));
			expect([...act].sort()).toEqual([...p.on].sort());
			expect(matchingPreset(presetChoice(p.id))).toBe(p.id);
		}
		expect(matchingPreset({ zusatz: false })).toBeNull();
	});
	it('Pfade gehören zu Bausteinen, Unterseiten erben, Unbekanntes bleibt frei', () => {
		expect(moduleOfPath('/')).toBe('stamm');
		expect(moduleOfPath('/kunden/k1')).toBe('stamm');
		expect(moduleOfPath('/angebote/q1')).toBe('verkauf');
		expect(moduleOfPath('/abnahme/s1')).toBe('nachweis');
		expect(moduleOfPath('/login')).toBeNull();
		expect(moduleOfPath('/mitarbeiter')).toBeNull();
		expect(pathAllowed(presetChoice('einfach'), '/leitstand')).toBe(false);
		expect(pathAllowed(presetChoice('einfach'), '/zeiten')).toBe(true);
		expect(pathAllowed(presetChoice('einfach'), '/login')).toBe(true);
	});
	it('jede Seite gehört zu genau einem Baustein', () => {
		const seen = new Map<string, ModuleId>();
		for (const m of MODULES) for (const p of m.pages) { expect(seen.has(p)).toBe(false); seen.set(p, m.id); }
	});
	it('alle möglichen Auswahlen ergeben eine in sich stimmige aktive Menge', () => {
		const optional = MODULE_IDS.filter((m) => m !== 'stamm');
		for (let mask = 0; mask < 1 << optional.length; mask++) {
			const c: ModuleChoice = {}; optional.forEach((m, i) => (c[m] = !!(mask & (1 << i))));
			const act = activeModules(c);
			expect(act.has('stamm')).toBe(true);
			for (const m of act) { for (const r of MODULES.find((x) => x.id === m)!.requires) expect(act.has(r)).toBe(true); if (m !== 'stamm') expect(c[m]).toBe(true); }
			// jede Seite eines aktiven Bausteins ist erlaubt, jede eines inaktiven gesperrt
			for (const m of MODULES) for (const p of m.pages) expect(pathAllowed(c, p)).toBe(act.has(m.id));
		}
	});
});
