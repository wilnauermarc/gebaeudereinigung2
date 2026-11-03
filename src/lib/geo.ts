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
