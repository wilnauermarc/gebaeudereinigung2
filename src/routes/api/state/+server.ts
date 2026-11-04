import { json } from '@sveltejs/kit';
import { store } from '#lib/server/store.ts';
import { licenseInfo } from '#lib/server/license.ts';
import { berlinParts } from '#lib/server/inbox.ts';
import type { RequestHandler } from './$types';

const MAX_BYTES = 25 * 1024 * 1024;

/** Gesamter Datenbestand: nur für Inhaber, Büro und Objektleitung (siehe hooks.server.ts). */
export const GET: RequestHandler = () => {
	const s = store().getState();
	if (!s) return json({ error: 'Kein Datenbestand.' }, { status: 404 });
	return json({ rev: s.rev, data: JSON.parse(s.json) });
};
export const PUT: RequestHandler = async ({ request, locals }) => {
	// Abgelaufenes Abo: Lesemodus. Daten bleiben sichtbar und exportierbar, gespeichert wird nichts mehr.
	if (licenseInfo(berlinParts(new Date()).date).status === 'abgelaufen') return json({ error: 'Das Abo ist abgelaufen. Die Daten bleiben les- und exportierbar, Änderungen werden erst nach der Verlängerung gespeichert.', licenseExpired: true }, { status: 402 });
	const text = await request.text();
	if (text.length > MAX_BYTES) return json({ error: 'Datenbestand zu groß.' }, { status: 413 });
	let b: { rev?: unknown; data?: unknown };
	try { b = JSON.parse(text); } catch { return json({ error: 'Ungültige Daten.' }, { status: 400 }); }
	if (typeof b.rev !== 'number' || !b.data || typeof b.data !== 'object' || !Array.isArray((b.data as { customers?: unknown }).customers)) return json({ error: 'Ungültige Daten.' }, { status: 400 });
	// Den Funktionsumfang ändern nur Administratoren (sonst bliebe die Einstellung eine reine Anzeige)
	const cur = store().getState();
	if (cur && locals.user?.role !== 'inhaber') {
		let before: unknown = null;
		try { before = JSON.parse(cur.json)?.settings?.modules ?? null; } catch { /* keine Vorgabe */ }
		const after = (b.data as { settings?: { modules?: unknown } }).settings?.modules ?? null;
		if (JSON.stringify(before) !== JSON.stringify(after)) return json({ error: 'Den Funktionsumfang ändern nur Administratoren.' }, { status: 403 });
	}
	const r = store().putState(JSON.stringify(b.data), b.rev);
	if (!r.ok) return json({ error: 'Der Datenbestand wurde zwischenzeitlich anderswo geändert. Bitte neu laden.', rev: r.rev }, { status: 409 });
	if (locals.user && b.rev === 0) store().audit('state_init', locals.user.id);
	return json({ rev: r.rev });
};
