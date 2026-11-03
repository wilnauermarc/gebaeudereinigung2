import { json } from '@sveltejs/kit';
import { store } from '#lib/server/store.ts';
import type { RequestHandler } from './$types';

/** Eigene Mitteilungen (nur die der angemeldeten Person) */
export const GET: RequestHandler = ({ locals }) => {
	const u = locals.user!;
	if (!u.employeeId) return json({ items: [], unread: 0 });
	const items = store().notifyList(u.employeeId);
	return json({ items, unread: items.filter((i) => !i.read).length });
};
export const POST: RequestHandler = async ({ request, locals }) => {
	const u = locals.user!;
	if (!u.employeeId) return json({ error: 'Diesem Zugang ist keine Person zugeordnet.' }, { status: 404 });
	const b = await request.json().catch(() => ({}));
	if (b.all === true) store().notifyRead(u.employeeId, 'all');
	else if (Array.isArray(b.ids)) store().notifyRead(u.employeeId, b.ids.filter((x: unknown) => typeof x === 'string').slice(0, 100));
	return json({ ok: true });
};
