/**
 * Zentrale Zugriffsprüfung. JEDE Anfrage an /api läuft hier durch:
 *  - ohne gültige Sitzung nur /api/session, /api/login, /api/setup,
 *  - Mitarbeitende dürfen ausschließlich /api/me/* und /api/logout, /api/password,
 *  - alle anderen Endpunkte nur für Inhaber, Büro und Objektleitung,
 *  - schreibende Anfragen nur vom eigenen Ursprung (Schutz vor Fremdseiten).
 */
import type { Handle } from '@sveltejs/kit/hooks';
import { COOKIE, hashToken, isManagement } from '#lib/server/auth.ts';
import { store } from '#lib/server/store.ts';

const PUBLIC = new Set(['/api/session', '/api/login', '/api/setup', '/api/abnahme']);
const ANY_USER = (p: string) => p.startsWith('/api/me/') || p === '/api/logout' || p === '/api/password';

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	const token = event.cookies.get(COOKIE);
	event.locals.user = token ? store().sessionUser(hashToken(token)) : null;

	if (path.startsWith('/api/')) {
		const method = event.request.method;
		if (method !== 'GET' && method !== 'HEAD') {
			const origin = event.request.headers.get('origin');
			// Gleicher Host wie die Anfrage (Schema und Port-Weiterleitung durch einen Proxy dürfen abweichen)
			let same = false;
			try { same = !!origin && new URL(origin).host === event.url.host; } catch { same = false; }
			if (!same) return json(403, { error: 'Ungültiger Ursprung.' });
		}
		if (!PUBLIC.has(path)) {
			const u = event.locals.user;
			if (!u) return json(401, { error: 'Nicht angemeldet.' });
			if (!isManagement(u.role) && !ANY_USER(path)) return json(403, { error: 'Keine Berechtigung.' });
			if (u.mustChange && path !== '/api/password' && path !== '/api/logout' && path !== '/api/me/profile') return json(403, { error: 'Bitte zuerst ein neues Passwort wählen.', mustChange: true });
		}
	}
	const res = await resolve(event);
	res.headers.set('X-Content-Type-Options', 'nosniff');
	res.headers.set('X-Frame-Options', 'DENY');
	// Nur der Ursprung (ohne Pfad) geht an andere Seiten. OpenStreetMap verlangt eine Referer-Angabe und sperrt Anfragen ohne sie.
	res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	res.headers.set('Permissions-Policy', 'geolocation=(self), microphone=(), camera=(self)');
	if (path.startsWith('/api/')) res.headers.set('Cache-Control', 'no-store');
	return res;
};
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
