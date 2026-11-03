import { json } from '@sveltejs/kit';
import { store } from '#lib/server/store.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const b = await request.json().catch(() => ({}));
	store().swapsApplied(Array.isArray(b.ids) ? b.ids.filter((x: unknown) => typeof x === 'string').slice(0, 100) : []);
	return json({ ok: true });
};
