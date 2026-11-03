import { json } from '@sveltejs/kit';
import { hashPassword, passwordIssue, verifyPassword } from '#lib/server/auth.ts';
import { store } from '#lib/server/store.ts';
import type { RequestHandler } from './$types';

/** Eigenes Passwort ändern. Alle anderen Sitzungen der Person werden beendet. */
export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	const u = locals.user!;
	const b = await request.json().catch(() => ({}));
	const row = store().userById(u.id);
	if (!row || typeof b.current !== 'string' || typeof b.next !== 'string' || !verifyPassword(b.current, row.pw_hash)) return json({ error: 'Das aktuelle Passwort stimmt nicht.' }, { status: 400 });
	const issue = passwordIssue(b.next, u.role);
	if (issue) return json({ error: issue }, { status: 400 });
	if (b.next === b.current) return json({ error: 'Das neue Passwort muss anders sein.' }, { status: 400 });
	store().setPassword(u.id, hashPassword(b.next), false);
	store().deleteUserSessions(u.id);
	store().audit('password_change', u.id);
	cookies.delete('resch_session', { path: '/' });
	return json({ ok: true, relogin: true });
};
