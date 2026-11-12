/**
 * Zentrale Zugriffsprüfung. JEDE Anfrage an /api läuft hier durch:
 *  - ohne gültige Sitzung nur /api/session, /api/login, /api/setup,
 *  - Mitarbeitende dürfen ausschließlich /api/me/* und /api/logout, /api/password,
 *  - alle anderen Endpunkte nur für Inhaber, Büro und Objektleitung,
 *  - schreibende Anfragen nur vom eigenen Ursprung (Schutz vor Fremdseiten).
 */
import type { Handle } from '@sveltejs/kit/hooks';
import { COOKIE, hashToken, isManagement, parseSessionCookie } from '#lib/server/auth.ts';
import { store, mainStore, tenantScope, type TenantContext } from '#lib/server/store.ts';
import { licenseEnvFor, maintainTenants, tenantById, tenantBySlug, tenantStore, tenantsEnabled } from '#lib/server/tenants.ts';
import { serverModules, staffEndpointModule } from '#lib/server/modules.ts';
import { isDemoServer, maintainDemo } from '#lib/server/demo.ts';

const PUBLIC = new Set(['/api/session', '/api/login', '/api/setup', '/api/abnahme', '/api/melden', '/api/demo/enter', '/api/signup', '/api/signup/confirm']);
const ANY_USER = (p: string) => p.startsWith('/api/me/') || p === '/api/logout' || p === '/api/password';

/** Mehrere Betriebe (TENANTS=1): das Cookie nennt den Betrieb, die Anfrage läuft mit dessen Speicher und Lizenz */
export const handle: Handle = async (input) => {
	const c = parseSessionCookie(input.event.cookies.get(COOKIE));
	if (!tenantsEnabled()) return run(input, c && c.tenant === 'main' ? c.token : undefined);
	let ctx: TenantContext = { id: 'main', store: mainStore() };
	let token = c?.token;
	if (c && c.tenant !== 'main') {
		const t = tenantById(c.tenant);
		if (t) ctx = { id: t.id, slug: t.slug, store: tenantStore(t.id), env: licenseEnvFor(t) };
		else token = undefined; // Betrieb gibt es nicht (mehr)
	}
	// Öffentliche Abnahme-Seite: der Betrieb steht als Kürzel (?b=) im Link, weil es dort keine Sitzung gibt
	if (input.event.url.pathname === '/api/abnahme' || input.event.url.pathname === '/api/melden') {
		const b = input.event.url.searchParams.get('b');
		const t = b ? tenantBySlug(b) : undefined;
		if (t) { ctx = { id: t.id, slug: t.slug, store: tenantStore(t.id), env: licenseEnvFor(t) }; token = undefined; }
	}
	void maintainTenants().catch(() => undefined); // Warnmails und Löschung nach Testende, höchstens stündlich
	return tenantScope.run(ctx, () => run(input, token));
};

const run = async ({ event, resolve }: Parameters<Handle>[0], token: string | undefined) => {
	const path = event.url.pathname;
	if (isDemoServer()) maintainDemo(store()); // Demo: bei Bedarf anlegen oder zurücksetzen
	event.locals.user = token ? store().sessionUser(hashToken(token)) : null;

	if (path.startsWith('/api/')) {
		const method = event.request.method;
		if (method !== 'GET' && method !== 'HEAD') {
			const origin = event.request.headers.get('origin');
			// Gleicher Host wie die Anfrage (Schema und Port-Weiterleitung durch einen Proxy dürfen abweichen)
			let same = false;
			try { same = !!origin && new URL(origin).host === event.url.host; } catch { same = false; }
			if (!same) return json(403, { error: 'Ungültiger Ursprung.' });
			// Demo: nur lesen. Ausnahmen: Demo betreten und abmelden (der Datenbestand selbst antwortet mit 402)
			if (isDemoServer() && path !== '/api/demo/enter' && path !== '/api/logout' && path !== '/api/state') return json(403, { error: 'In der Demo werden Änderungen nicht gespeichert.', demo: true });
		}
		if (!PUBLIC.has(path)) {
			const u = event.locals.user;
			if (!u) return json(401, { error: 'Nicht angemeldet.' });
			if (!isManagement(u.role) && !ANY_USER(path)) return json(403, { error: 'Keine Berechtigung.' });
			if (u.mustChange && path !== '/api/password' && path !== '/api/logout' && path !== '/api/me/profile') return json(403, { error: 'Bitte zuerst ein neues Passwort wählen.', mustChange: true });
			// Ausgeschaltete Bausteine gelten auch auf dem Server (nicht nur im Menü): Mitarbeiter-Endpunkte werden abgelehnt
			const need = staffEndpointModule(path);
			if (need && path.startsWith('/api/me/')) {
				const on = serverModules();
				if (!on.has('mitarbeiter') || !on.has(need as never)) return json(403, { error: 'Diese Funktion ist in Ihrem Betrieb nicht eingeschaltet.', disabled: true });
			}
		}
		// Öffentliche Abnahme-Seite des Kunden: nur mit eingeschaltetem Baustein
		if (path === '/api/abnahme' && !serverModules().has('nachweis')) return json(404, { error: 'Dieser Link ist ungültig oder wurde ersetzt.' });
		if (path === '/api/melden' && !serverModules().has('maengel')) return json(404, { error: 'Dieser Link ist ungültig oder wurde ersetzt.' });
	}
	const res = await resolve(event);
	res.headers.set('X-Content-Type-Options', 'nosniff');
	res.headers.set('X-Frame-Options', 'DENY');
	// Nur der Ursprung (ohne Pfad) geht an andere Seiten. OpenStreetMap verlangt eine Referer-Angabe und sperrt Anfragen ohne sie.
	res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	res.headers.set('X-Robots-Tag', 'noindex, nofollow');
	res.headers.set('Permissions-Policy', 'geolocation=(self), microphone=(), camera=(self)');
	if (path.startsWith('/api/')) res.headers.set('Cache-Control', 'no-store');
	return res;
};
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
