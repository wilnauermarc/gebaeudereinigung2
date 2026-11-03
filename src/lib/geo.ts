/** Kleine Geo-Helfer für die Karte. Entfernungen sind Luftlinie, keine Fahrstrecke. */
export const R_EARTH_KM = 6371;
const rad = (d: number) => (d * Math.PI) / 180;

export function haversineKm(a: [number, number], b: [number, number]) {
	const dLat = rad(b[0] - a[0]), dLon = rad(b[1] - a[1]);
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
	return 2 * R_EARTH_KM * Math.asin(Math.sqrt(h));
}
/** Länge eines Streckenzugs in km (Luftlinie von Punkt zu Punkt) */
export const pathKm = (pts: [number, number][]) => pts.slice(1).reduce((s, p, i) => s + haversineKm(pts[i], p), 0);

/** Demo-Koordinaten: erfundene Orte rund um eine fiktive Region, damit die Karte etwas zeigt. */
const centers: Record<string, [number, number]> = {
	Musterstadt: [49.452, 11.077],
	Beispieldorf: [49.505, 11.16],
	Neustadt: [49.398, 11.0],
	'Gewerbepark Süd': [49.365, 11.105]
};
export function demoCoords(city: string, seed: string): [number, number] {
	const c = centers[city] ?? [49.45, 11.08];
	const h = [...seed].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 9973, 7);
	return [Math.round((c[0] + ((h % 100) - 50) / 3500) * 1e5) / 1e5, Math.round((c[1] + (((h / 100) | 0) % 100 - 50) / 2500) * 1e5) / 1e5];
}

/** Ergebnis des Standort-Abgleichs beim Stempeln. Nur dieses Ergebnis wird gespeichert, nie die Koordinaten. */
export type GeoResult = { s: 'ok' | 'fern' | 'ungenau' | 'verweigert' | 'ohnePosition'; m?: number };
export const GEO_DEFAULT_RADIUS_M = 150;
/** Maximal zulässige Ungenauigkeit des Geräts in Metern; darüber ist der Abgleich nicht aussagekräftig. */
export const GEO_MAX_ACCURACY_M = 200;

/**
 * Gleicht einen Standort mit der Objektposition ab. Weiche Plausibilitätsprüfung: Das Ergebnis dient dem Büro als Hinweis
 * und blockiert nie das Stempeln. Der Abstand wird auf 10 m gerundet.
 */
export function geoCheck(site: { lat?: number | null; lon?: number | null }, fix: { lat: unknown; lon: unknown; acc?: unknown } | null, radiusM = GEO_DEFAULT_RADIUS_M): GeoResult {
	if (!fix) return { s: 'verweigert' };
	if (site.lat == null || site.lon == null) return { s: 'ohnePosition' };
	const lat = Number(fix.lat), lon = Number(fix.lon), acc = Number(fix.acc ?? 0);
	if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return { s: 'verweigert' };
	const m = Math.round((haversineKm([site.lat, site.lon], [lat, lon]) * 1000) / 10) * 10;
	if (Number.isFinite(acc) && acc > GEO_MAX_ACCURACY_M) return { s: 'ungenau', m };
	// die Messunsicherheit des Geräts zählt zugunsten der Person
	return m - (Number.isFinite(acc) ? Math.min(acc, GEO_MAX_ACCURACY_M) : 0) <= radiusM ? { s: 'ok', m } : { s: 'fern', m };
}
/** Kurzer Text für Büro-Notizen und Prüfansicht */
export function geoLabel(g: GeoResult | undefined, phase: 'Ein' | 'Aus'): string {
	if (!g) return '';
	const w = `${phase}stempeln`;
	if (g.s === 'ok') return '';
	if (g.s === 'fern') return `${w}: Standort ca. ${g.m} m vom Objekt entfernt`;
	if (g.s === 'ungenau') return `${w}: Standort zu ungenau für einen Abgleich`;
	if (g.s === 'verweigert') return `${w}: kein Standort übermittelt`;
	return `${w}: Objekt hat keine Position`;
}
