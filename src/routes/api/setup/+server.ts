import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { COOKIE, TTL_MS, hashPassword, hashToken, passwordIssue } from '#lib/server/auth.ts';
import { store } from '#lib/server/store.ts';
import { createDemoData, createEmptyData } from '#lib/demo.ts';
import { randomBytes } from 'node:crypto';
import { rateLimited } from '#lib/server/auth.ts';
import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from './$types';

/** Erste Einrichtung: legt das Inhaber-Konto an, solange es noch keine Zugänge gibt. Danach gesperrt. */
export const POST: RequestHandler = async ({ request, cookies, url, getClientAddress }) => {
	const s = store();
	if (s.userCount() > 0) return json({ error: 'Die Einrichtung ist bereits abgeschlossen.' }, { status: 409 });
	if (rateLimited('setup:' + getClientAddress())) return json({ error: 'Zu viele Versuche. Bitte später erneut versuchen.' }, { status: 429 });
	const b = await request.json().catch(() => ({}));
	// Auf einem öffentlichen Server schützt ein Einrichtungscode (Umgebungsvariable SETUP_TOKEN) davor, dass Fremde das Inhaber-Konto anlegen
	const want = process.env.SETUP_TOKEN ?? '';
	if (want) {
		const got = typeof b.setupCode === 'string' ? b.setupCode : '';
		if (got.length !== want.length || !timingSafeEqual(Buffer.from(got), Buffer.from(want))) return json({ error: 'Der Einrichtungscode stimmt nicht.' }, { status: 403 });
	}
	const display = String(b.display ?? '').trim(), login = String(b.login ?? '').trim(), password = String(b.password ?? '');
	if (display.length < 2 || login.length < 3 || !/^[\p{L}\p{N}._@-]+$/u.test(login)) return json({ error: 'Name und Anmeldename (mindestens 3 Zeichen, ohne Leerzeichen) angeben.' }, { status: 400 });
	const issue = passwordIssue(password, 'inhaber');
	if (issue) return json({ error: issue }, { status: 400 });
	const start = b.start === 'demo' ? createDemoData(b.team === 12 ? 12 : 8) : b.start === 'import' && b.state && typeof b.state === 'object' ? b.state : createEmptyData();
	const id = randomUUID();
	s.insertUser({ id, login, display, role: 'inhaber', employeeId: null, pwHash: hashPassword(password), mustChange: false });
	s.putState(JSON.stringify(start), 0);
	const token = randomBytes(32).toString('base64url');
	s.createSession(hashToken(token), id, TTL_MS.management);
	s.audit('setup', id, `Start: ${b.start ?? 'leer'}`, getClientAddress());
	cookies.set(COOKIE, token, { path: '/', httpOnly: true, sameSite: 'strict', secure: url.protocol === 'https:', maxAge: Math.floor(TTL_MS.management / 1000) });
	return json({ ok: true });
};
