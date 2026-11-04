import { describe, expect, it } from 'vitest';
import { createDemoData } from './demo.ts';
import { coverRadar, nearby, tourLegs, travelMinutes, visitState } from './mapTools.ts';

describe('Kartenhelfer', () => {
	it('Fahrzeit wächst mit der Entfernung und hat einen Mindestwert', () => {
		expect(travelMinutes(0)).toBe(5);
		expect(travelMinutes(10)).toBeGreaterThan(travelMinutes(5));
		expect(travelMinutes(7)).toBe(Math.ceil((7 * 1.3 / 35) * 60) + 5);
	});
	it('nächste Objekte sortiert, ohne sich selbst und ohne Position', () => {
		const items = [{ id: 'a', lat: 50, lon: 8 }, { id: 'b', lat: 50.01, lon: 8 }, { id: 'c', lat: 50.1, lon: 8 }, { id: 'd', lat: null, lon: null }, { id: 'e', lat: 51.5, lon: 8 }];
		const r = nearby({ id: 'a', lat: 50, lon: 8 }, items, 5, 20);
		expect(r.map((x) => x.item.id)).toEqual(['b', 'c']);
		expect(r[0].km).toBeLessThan(r[1].km);
	});
	it('Wege zwischen Einsätzen: knappe Pause wird erkannt', () => {
		const stops = [{ siteId: 'a', start: '08:00', hours: 2, lat: 50, lon: 8 }, { siteId: 'b', start: '10:10', hours: 2, lat: 50.2, lon: 8 }, { siteId: 'c', start: '14:00', hours: 1, lat: 50.2, lon: 8.001 }];
		const legs = tourLegs(stops);
		expect(legs[0]).toMatchObject({ fromId: 'a', toId: 'b', gapMin: 10, tight: true });
		expect(legs[1].tight).toBe(false);
		expect(tourLegs([{ siteId: 'a', start: '08:00', hours: 1, lat: null, lon: null }, { siteId: 'b', start: '09:00', hours: 1, lat: 50, lon: 8 }])[0]).toMatchObject({ km: null, tight: false });
	});
	it('Einsatzstand: gebucht, geplant, spät, fehlt', () => {
		const d = createDemoData(8);
		const site = d.customers.flatMap((c) => c.sites).find((s) => s.plan)!;
		d.timeEntries = [];
		expect(visitState(d, site.id, '2026-11-10', '2026-11-04', 600)).toBe('geplant');
		expect(visitState(d, site.id, '2026-11-01', '2026-11-04', 600)).toBe('fehlt');
		const start = (site.plan!.start.split(':').map(Number).reduce((h, m) => h * 60 + m));
		expect(visitState(d, site.id, '2026-11-04', '2026-11-04', start + 30)).toBe('spaet');
		expect(visitState(d, site.id, '2026-11-04', '2026-11-04', start - 30)).toBe('geplant');
		d.timeEntries.push({ id: 't', employeeId: d.employees[0].id, siteId: site.id, date: '2026-11-04', start: '08:00', end: '10:00', breakMin: 0, note: '', createdAt: '', editedAt: null, source: 'buero', voided: false, history: [] });
		expect(visitState(d, site.id, '2026-11-04', '2026-11-04', start + 30)).toBe('gebucht');
	});
	it('Vertretung nach Entfernung: Einsetzbare zuerst, nahe vor fernen', () => {
		const d = createDemoData(8);
		const site = d.customers.flatMap((c) => c.sites).find((s) => s.plan && s.lat != null)!;
		const date = '2026-11-04';
		const r = coverRadar(d, site.id, date);
		expect(r.length).toBeGreaterThan(0);
		const firstBlocked = r.findIndex((x) => !x.allowed);
		if (firstBlocked >= 0) expect(r.slice(firstBlocked).every((x) => !x.allowed)).toBe(true);
		const withKm = r.filter((x) => x.allowed && x.km != null).map((x) => x.km!);
		expect([...withKm].sort((a, b) => a - b)).toEqual(withKm);
	});
});
