/**
 * Tarif- und Rechtsparameter (Stand 02.11.2026, aus dem Recherchebericht).
 * Branchenmindestlohn Gebäudereinigung: 15,00 € (LG 1) ab 01.01.2026. Die Verordnung läuft
 * zum 31.12.2026 aus, für 2027 gibt es noch keinen Abschluss. Szenarien sind Annahmen, keine Zusagen.
 */
export const WAGE_LG1_2026 = 1500; // Cent
/** Gesetzlicher Mindestlohn: 13,90 € (2026), 14,60 € ab 01.01.2027 (laut Recherche, vor Einsatz prüfen). Der Branchenlohn muss darüber liegen. */
export const STATUTORY_MIN_2027 = 1460;
export const MINIJOB_LIMIT_CENTS = 60300; // 603 € ab 2026
export const MINIJOB_HOURS_MAX = MINIJOB_LIMIT_CENTS / WAGE_LG1_2026; // 40,2 h

export interface TariffScenario {
	id: string;
	label: string;
	hint: string;
	/** neuer Stundenlohn LG 1 in Cent */
	wageCents: number;
}
export const scenarios: TariffScenario[] = [
	{ id: 'keine', label: 'Keine Erhöhung', hint: 'Lohn bleibt bei 15,00 €', wageCents: 1500 },
	{ id: 'arbeitgeber', label: 'Arbeitgeberangebot (+1,8 % ab 05/2027)', hint: 'Stand 22.10.2026, Verhandlung läuft', wageCents: Math.round(1500 * 1.018) },
	{ id: 'igbau', label: 'IG-BAU-Forderung (+2,00 €)', hint: 'Forderung, noch nicht beschlossen', wageCents: 1700 }
];

/** Typische Leistungswerte m²/Std. – streuen laut Quellen um bis zu Faktor 3, daher nur Startwerte zum Anpassen. */
export const areaTypes: { id: string; label: string; perHour: number }[] = [
	{ id: 'buero', label: 'Büro', perHour: 450 },
	{ id: 'sanitaer', label: 'Sanitär', perHour: 150 },
	{ id: 'flur', label: 'Flur', perHour: 500 },
	{ id: 'treppe', label: 'Treppenhaus', perHour: 300 },
	{ id: 'kueche', label: 'Teeküche', perHour: 200 },
	{ id: 'praxis', label: 'Praxis / Labor', perHour: 240 }
];

export const defaultCalc = {
	wageCents: WAGE_LG1_2026,
	lnkPct: 25,
	productivePct: 75,
	materialPct: 6,
	machinePct: 3,
	overheadPct: 18,
	profitPct: 12
};
