import { json } from '@sveltejs/kit';
import { COOKIE, TTL_MS, isManagement, login, sessionCookieValue } from '#lib/server/auth.ts';
import { store } from '#lib/server/store.ts';
import { tenantBySlug, tenantByEmail, tenantStore, tenantsEnabled } from '#lib/server/tenants.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies, url, getClientAddress }) => {
	const b = await request.json().catch(() => ({}));
	const name = typeof b.login === 'string' ? b.login : '', pw = typeof b.password === 'string' ? b.password : '';
	if (!name || !pw || name.length > 80 || pw.length > 200) return json({ error: 'Bitte Anmeldename und Passwort eingeben.' }, { status: 400 });
	// Mehrere Betriebe: "name@kürzel" (Betriebskürzel ohne Punkt) oder die E-Mail-Adresse der Inhaberin; sonst der Hauptbetrieb
	let target = store(), tid = 'main', loginName = name;
	if (tenantsEnabled()) {
		const at = name.lastIndexOf('@');
		if (at > 0) {
			const right = name.slice(at + 1);
			const t = right.includes('.') ? tenantByEmail(name) : tenantBySlug(right);
			if (t) { tid = t.id; target = tenantStore(t.id); loginName = right.includes('.') ? name : name.slice(0, at); }
		}
	}
	const r = login(target, loginName, pw, getClientAddress());
	if (!r.ok) {
		// Gleiche Meldung für falsches Passwort und unbekannten Namen, damit Namen nicht erraten werden können
		const status = r.reason === 'ratelimit' ? 429 : r.reason === 'locked' ? 423 : 401;
		const error = r.reason === 'ratelimit' ? 'Zu viele Versuche. Bitte später erneut versuchen.' : r.reason === 'locked' ? 'Der Zugang ist nach mehreren Fehlversuchen kurz gesperrt. Bitte in 15 Minuten erneut versuchen.' : 'Anmeldename oder Passwort stimmt nicht.';
		return json({ error }, { status });
	}
	const mgmt = isManagement(r.user.role);
	cookies.set(COOKIE, sessionCookieValue(tid, r.token), { path: '/', httpOnly: true, sameSite: 'strict', secure: url.protocol === 'https:', maxAge: Math.floor(TTL_MS[mgmt ? 'management' : 'staff'] / 1000) });
	return json({ user: { id: r.user.id, display: r.user.display, role: r.user.role, employeeId: r.user.employeeId, mustChange: r.user.mustChange, management: mgmt } });
};
