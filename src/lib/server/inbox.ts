/**
 * Regeln für Eingaben von Mitarbeitenden. Alles wird auf dem Server geprüft; der Client bestimmt weder Person noch Zeitpunkt
 * (Zeit = Serverzeit, Ausnahme: nachgereichte Offline-Stempelung innerhalb von 36 Stunden, die gekennzeichnet wird).
 */
export const OFFLINE_MAX_MS = 36 * 3600_000;
export const MAX_SHIFT_MS = 14 * 3600_000;
export const MAX_PHOTO_BYTES = 300_000;

const berlin = (d: Date) => ({
	date: d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' }),
	time: d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Berlin' })
});
export const berlinParts = berlin;

/** Zeitpunkt der Stempelung: Serverzeit, oder die vom Gerät gemeldete Zeit, wenn sie plausibel ist (nicht Zukunft, nicht älter als 36 Std.) */
export function punchTime(clientAt: unknown, now = new Date()): { at: Date; offline: boolean } {
	if (typeof clientAt === 'string') {
		const t = Date.parse(clientAt);
		if (Number.isFinite(t) && t <= now.getTime() + 60_000 && now.getTime() - t <= OFFLINE_MAX_MS) return { at: new Date(Math.min(t, now.getTime())), offline: now.getTime() - t > 120_000 };
	}
	return { at: now, offline: false };
}

/** Bild erkennen (Dateikopf, nicht dem Namen oder Typ des Geräts vertrauen) und Größe begrenzen. */
export function parsePhoto(dataUrl: unknown): { bytes: Uint8Array; mime: string } | { error: string } | null {
	if (dataUrl === undefined || dataUrl === null || dataUrl === '') return null;
	if (typeof dataUrl !== 'string') return { error: 'Ungültiges Foto.' };
	const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
	if (!m) return { error: 'Nur Fotos (JPEG, PNG, WebP) sind erlaubt.' };
	const bytes = Uint8Array.from(Buffer.from(m[2], 'base64'));
	if (bytes.length > MAX_PHOTO_BYTES) return { error: 'Das Foto ist zu groß (höchstens 300 KB).' };
	const hex = Buffer.from(bytes.slice(0, 12)).toString('hex');
	const ok = (m[1] === 'image/jpeg' && hex.startsWith('ffd8ff')) || (m[1] === 'image/png' && hex.startsWith('89504e47')) || (m[1] === 'image/webp' && hex.slice(0, 8) === '52494646' && Buffer.from(bytes.slice(8, 12)).toString() === 'WEBP');
	return ok ? { bytes, mime: m[1] } : { error: 'Die Datei ist kein gültiges Foto.' };
}

/** Datum prüfen (YYYY-MM-DD, echtes Datum) */
export const validDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + 'T12:00:00Z')) && new Date(s + 'T12:00:00Z').toISOString().startsWith(s);
