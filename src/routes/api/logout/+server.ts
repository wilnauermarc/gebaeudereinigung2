import { json } from '@sveltejs/kit';
import { COOKIE, hashToken } from '#lib/server/auth.ts';
import { store } from '#lib/server/store.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ cookies, locals }) => {
	const t = cookies.get(COOKIE);
	if (t) store().deleteSession(hashToken(t));
	if (locals.user) store().audit('logout', locals.user.id);
	cookies.delete(COOKIE, { path: '/' });
	return json({ ok: true });
};
