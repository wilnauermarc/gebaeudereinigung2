import { describe, expect, it } from 'vitest';
import { addDays, addMonths, entryHours, hourlyRate, mondayOf, monthlyHours, surchargeHint, weekday } from './calc';
import { defaultCalc } from './tariff';
import { parseEuroInput } from './format';

describe('Kalkulation', () => {
	it('Stundensatz aus Mindestlohn 15 € ergibt 35,56 €', () => {
		expect(Math.round(hourlyRate(defaultCalc))).toBe(3556);
	});
	it('Monatsstunden: 1.800 m², 450 m²/h, 5 x pro Woche ≈ 86,7 h', () => {
		expect(monthlyHours(1800, 450, 5)).toBeCloseTo(86.67, 1);
	});
	it('Leistungswert 0 führt nicht zu Unendlich', () => {
		expect(monthlyHours(100, 0, 5)).toBe(0);
	});
});

describe('Zeiten', () => {
	it('Stunden mit Pause', () => expect(entryHours('08:00', '10:30', 30)).toBe(2));
	it('Überlauf über Mitternacht', () => expect(entryHours('22:00', '02:00', 0)).toBe(4));
	it('Sonntag und Nacht werden als Zuschlag erkannt', () => {
		expect(surchargeHint('2026-11-01', '10:00', '12:00')).toBe('Sonntag');
		expect(surchargeHint('2026-11-02', '22:00', '23:30')).toBe('Nacht');
		expect(surchargeHint('2026-11-02', '17:00', '19:00')).toBeNull();
	});
});

describe('Datum', () => {
	it('Wochentag und Wochenanfang', () => {
		expect(weekday('2026-11-02')).toBe(0);
		expect(mondayOf('2026-11-05')).toBe('2026-11-02');
		expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
		expect(addMonths('2026-01-31', 1).startsWith('2026-03') || addMonths('2026-01-31', 1).startsWith('2026-02')).toBe(true);
	});
});

describe('Eurobeträge', () => {
	it('liest deutsche Schreibweise', () => {
		expect(parseEuroInput('1.250,5')).toBe(125050);
		expect(parseEuroInput('12')).toBe(1200);
		expect(parseEuroInput('')).toBeNull();
		expect(parseEuroInput('abc')).toBeNull();
	});
});

import { ibanValid } from './iban';
describe('IBAN', () => {
	it('erkennt gültige und ungültige Nummern', () => {
		expect(ibanValid('DE89 3704 0044 0532 0130 00')).toBe(true);
		expect(ibanValid('DE89 3704 0044 0532 0130 01')).toBe(false);
		expect(ibanValid('DE00 0000 0000 0000 0000 00')).toBe(false);
	});
});
