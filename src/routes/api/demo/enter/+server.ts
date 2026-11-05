import { json } from '@sveltejs/kit';
import { randomBytes } from 'node:crypto';
import { COOKIE, hashToken, rateLimited } from '#lib/server/auth.ts';
import { store } from '#lib/server/store.ts';
import { DEMO_MAX_SESSIONS, DEMO_SESSION_MS, isDemoServer, maintainDemo } from '#lib/server/demo.ts';
import type { RequestHandler } from './$types';

/** Demo ohne Anmeldung (nur auf der Demo-Instanz): öffnet eine Sitzung für das Büro oder die Mitarbeiter-App. */
export const POST: RequestHandler = async ({ request, cookies, url, getClientAddress }) => {
	if (!isDemoServer()) return json({ error: 'Nicht verfügbar.' }, { status: 404 });
	if (rateLimited('demo:' + getClientAddress())) return json({ error: 'Zu viele Aufrufe. Bitte später erneut versuchen.' }, { status: 429 });
	const s = store();
	maintainDemo(s);
	s.purgeSessions();
	const n = (s.raw.prepare('SELECT COUNT(*) AS n FROM sessions').get() as { n: number }).n;
	if (n >= DEMO_MAX_SESSIONS) return json({ error: 'Die Demo ist gerade ausgelastet. Bitte später erneut versuchen.' }, { status: 503 });
	const b = await request.json().catch(() => ({}));
	const id = b.as === 'staff' ? 'demo-team' : 'demo-buero';
	const u = s.userById(id);
	if (!u) return json({ error: 'Demo nicht verfügbar.' }, { status: 503 });
	const token = randomBytes(32).toString('base64url');
	s.createSession(hashToken(token), u.id, DEMO_SESSION_MS);
	cookies.set(COOKIE, token, { path: '/', httpOnly: true, sameSite: 'strict', secure: url.protocol === 'https:', maxAge: Math.floor(DEMO_SESSION_MS / 1000) });
	return json({ ok: true, role: u.role });
};
