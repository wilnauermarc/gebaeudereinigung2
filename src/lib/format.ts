const TZ = 'Europe/Berlin';
const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const num2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatEur = (cents: number | null | undefined) =>
	cents == null ? '–' : eur.format(cents / 100);
export const formatDecimal = (cents: number | null | undefined) =>
	cents == null ? '' : num2.format(cents / 100);

/** „1.234,56“ / „12,5“ → Cent. Ungültig → null. */
export function parseEuroInput(s: string): number | null {
	const t = s.replace(/[\s€]/g, '').replace(/\./g, '').replace(',', '.');
	if (!t) return null;
	const f = Number(t);
	return Number.isFinite(f) && f >= 0 ? Math.round(f * 100) : null;
}

const fDate = new Intl.DateTimeFormat('de-DE', {
	timeZone: TZ,
	day: '2-digit',
	month: '2-digit',
	year: 'numeric'
});
const fDateShort = new Intl.DateTimeFormat('de-DE', { timeZone: TZ, day: '2-digit', month: 'short' });
const fWeekday = new Intl.DateTimeFormat('de-DE', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' });
const fTime = new Intl.DateTimeFormat('de-DE', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });

export const formatDate = (iso: string | null | undefined) => (iso ? fDate.format(new Date(iso)) : '–');
export const formatDateShort = (iso: string) => fDateShort.format(new Date(iso));
export const formatWeekday = (iso: string) => fWeekday.format(new Date(iso));
export const formatTime = (iso: string) => fTime.format(new Date(iso));
export const formatDateTime = (iso: string) => `${formatDate(iso)}, ${formatTime(iso)} Uhr`;

export function todayKey(d = new Date()) {
	return new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(d); // YYYY-MM-DD
}
export function dayDiff(dateKey: string, from = new Date()) {
	const a = Date.parse(dateKey + 'T00:00:00Z');
	const b = Date.parse(todayKey(from) + 'T00:00:00Z');
	return Math.round((a - b) / 86400000);
}
export function relativeDay(dateKey: string) {
	const n = dayDiff(dateKey);
	if (n === 0) return 'heute';
	if (n === 1) return 'morgen';
	if (n === -1) return 'gestern';
	return n > 0 ? `in ${n} Tagen` : `seit ${-n} Tagen`;
}
export function relativeTime(iso: string) {
	const diff = (Date.now() - new Date(iso).getTime()) / 1000;
	if (diff < 60) return 'gerade eben';
	if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min.`;
	if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std.`;
	const days = dayDiff(todayKey(new Date(iso))) * -1;
	if (days === 1) return 'gestern';
	if (days < 14) return `vor ${days} Tagen`;
	return formatDate(iso);
}
export const initials = (name: string) =>
	name
		.replace(/[^\p{L}\s]/gu, '')
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0])
		.join('')
		.toUpperCase();
