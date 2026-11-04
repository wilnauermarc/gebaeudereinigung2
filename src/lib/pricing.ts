/** Pakete und Preise (netto, je Monat). Die Pakete entsprechen den Voreinstellungen des Funktionsumfangs. Zahlen sind ein Vorschlag, noch nicht am Markt geprüft. */
import { PRESETS, type ModuleId, type PresetId } from './modules.ts';

export type PlanId = PresetId;
export interface PlanDef { id: PlanId; label: string; baseEur: number; includedSeats: number; extraEur: number; tagline: string }
export const TRIAL_DAYS = 30;
export const PLANS: PlanDef[] = [
	{ id: 'einfach', label: 'Einfach', baseEur: 49, includedSeats: 10, extraEur: 3, tagline: 'Kunden, Angebote, Einsatzplan, Zeiten, Rechnungen' },
	{ id: 'standard', label: 'Standard', baseEur: 99, includedSeats: 15, extraEur: 4, tagline: 'Dazu Mitarbeiter-App, Mängel, Leistungsnachweis, Leitstand und Karte' },
	{ id: 'alles', label: 'Alles', baseEur: 179, includedSeats: 20, extraEur: 5, tagline: 'Dazu Zusatzleistungen, Controlling, Schlüssel und Material' }
];
export const planOf = (id: PlanId) => PLANS.find((p) => p.id === id)!;
/** Welche Bausteine gehören zum Paket? */
export const planModules = (id: PlanId): Set<ModuleId> => new Set(PRESETS.find((p) => p.id === id)!.on);

export interface Price { baseEur: number; includedSeats: number; seats: number; extraSeats: number; extraEur: number; extraTotalEur: number; totalEur: number }
/** Monatspreis netto: Grundpreis plus ein kleiner Betrag je weiterer aktiver Person (Büronutzer zählen nicht). */
export function priceFor(id: PlanId, seats: number): Price {
	const p = planOf(id);
	const extraSeats = Math.max(0, seats - p.includedSeats);
	return { baseEur: p.baseEur, includedSeats: p.includedSeats, seats, extraSeats, extraEur: p.extraEur, extraTotalEur: extraSeats * p.extraEur, totalEur: p.baseEur + extraSeats * p.extraEur };
}
