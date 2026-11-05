import { json } from '@sveltejs/kit';
import { randomBytes } from 'node:crypto';
import { COOKIE, TTL_MS, hashToken, rateLimited, sessionCookieValue } from '#lib/server/auth.ts';
import { confirmPending, tenantsEnabled, tenantStore } from '#lib/server/tenants.ts';
import type { RequestHandler } from './$types';

/** Bestätigt die E-Mail-Adresse (der Link enthält das Token hinter #, deshalb per POST), legt den Betrieb an und meldet an. */
export const POST: RequestHandler = async ({ request, cookies, url, getClientAddress }) => {
	if (!tenantsEnabled()) return json({ error: 'Nicht verfügbar.' }, { status: 404 });
	if (rateLimited('confirm:' + getClientAddress())) return json({ error: 'Zu viele Versuche. Bitte später erneut versuchen.' }, { status: 429 });
	const b = await request.json().catch(() => ({}));
	const token = typeof b.token === 'string' ? b.token : '';
	if (token.length < 20 || token.length > 100) return json({ error: 'Dieser Link ist ungültig oder abgelaufen.' }, { status: 400 });
	const r = confirmPending(token);
	if (!r.ok) {
		const msg = r.reason === 'full' ? 'Im Moment nehmen wir keine neuen Testzugänge an. Bitte später erneut versuchen.' : r.reason === 'taken' ? 'Für diese Adresse gibt es schon einen Zugang oder eine abgelaufene Testphase. Bitte melden Sie sich an oder schreiben Sie uns.' : 'Dieser Link ist ungültig oder abgelaufen. Bitte den Testzugang neu beantragen.';
		return json({ error: msg }, { status: r.reason === 'full' ? 503 : 400 });
	}
	const s = tenantStore(r.tenant.id);
	const session = randomBytes(32).toString('base64url');
	s.createSession(hashToken(session), r.userId, TTL_MS.management);
	cookies.set(COOKIE, sessionCookieValue(r.tenant.id, session), { path: '/', httpOnly: true, sameSite: 'strict', secure: url.protocol === 'https:', maxAge: Math.floor(TTL_MS.management / 1000) });
	return json({ ok: true, slug: r.tenant.slug, trialUntil: r.tenant.trial_until });
};
