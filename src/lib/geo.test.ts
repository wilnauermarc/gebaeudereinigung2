import { describe, expect, it } from 'vitest';
import { geoCheck, geoLabel } from './geo.ts';

const site = { lat: 50.1109, lon: 8.6821 };
describe('Standort-Abgleich beim Stempeln', () => {
	it('erkennt Anwesenheit im Radius', () => {
		expect(geoCheck(site, { lat: 50.1111, lon: 8.6823, acc: 20 }).s).toBe('ok');
	});
	it('meldet Abstand gerundet, wenn weit entfernt', () => {
		const r = geoCheck(site, { lat: 50.1209, lon: 8.6821, acc: 10 });
		expect(r.s).toBe('fern');
		expect(r.m! % 10).toBe(0);
		expect(r.m).toBeGreaterThan(1000);
	});
	it('wertet ungenaue Messung nicht als Abweichung', () => {
		expect(geoCheck(site, { lat: 50.2, lon: 8.9, acc: 900 }).s).toBe('ungenau');
	});
	it('ohne Freigabe oder Objektposition: kein Urteil, keine Sperre', () => {
		expect(geoCheck(site, null).s).toBe('verweigert');
		expect(geoCheck({}, { lat: 50, lon: 8 }).s).toBe('ohnePosition');
		expect(geoCheck(site, { lat: 'x', lon: 8 }).s).toBe('verweigert');
		expect(geoCheck(site, { lat: 999, lon: 8 }).s).toBe('verweigert');
	});
	it('Notiztext nur bei Auffälligkeit und ohne Koordinaten', () => {
		expect(geoLabel({ s: 'ok', m: 20 }, 'Ein')).toBe('');
		expect(geoLabel({ s: 'fern', m: 420 }, 'Aus')).toBe('Ausstempeln: Standort ca. 420 m vom Objekt entfernt');
	});
});
