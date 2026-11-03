import { describe, expect, it } from 'vitest';
import { easter, holidayOn } from './feiertage';
import { surchargeCents, surchargeInfo } from './surcharge';

describe('Feiertage', () => {
	it('Ostern 2026 ist der 5. April', () => expect(easter(2026).toISOString().slice(0, 10)).toBe('2026-04-05'));
	it('Karfreitag und Ostermontag 2026', () => {
		expect(holidayOn('2026-04-03')?.name).toBe('Karfreitag');
		expect(holidayOn('2026-04-06')?.name).toBe('Ostermontag');
	});
	it('Weihnachten ist hoher Feiertag, 3. Oktober nicht', () => {
		expect(holidayOn('2026-12-25')?.high).toBe(true);
		expect(holidayOn('2026-10-03')?.high).toBe(false);
		expect(holidayOn('2026-11-02')).toBeNull();
	});
});

describe('Zuschläge', () => {
	it('Werktag tagsüber ohne Zuschlag', () => expect(surchargeInfo('2026-11-02', '08:00', '12:00').maxPct).toBe(0));
	it('Sonntag 80 %', () => expect(surchargeInfo('2026-11-01', '08:00', '10:00').maxPct).toBe(80));
	it('Nacht 30 %: 22:00–02:00 hat 3 Stunden Nachtzeit', () => {
		const i = surchargeInfo('2026-11-02', '22:00', '02:00');
		expect(i.minutes[30]).toBe(180);
	});
	it('es zählt der höchste Satz: Neujahr nachts 200 %', () => expect(surchargeInfo('2027-01-01', '02:00', '04:00').maxPct).toBe(200));
	it('Nacht über Mitternacht in den Sonntag: Samstag 22–02 Uhr', () => {
		const i = surchargeInfo('2026-10-31', '22:00', '02:00'); // 31.10.2026 ist Samstag
		expect(i.minutes[80]).toBe(120);
		expect(i.minutes[30]).toBe(60);
	});
	it('Betrag: 2 Std. Sonntag bei 15 € = 24 €', () => expect(surchargeCents('2026-11-01', '08:00', '10:00', 1500)).toBe(2400));
});
