import { json } from '@sveltejs/kit';
import { store } from '#lib/server/store.ts';
import type { RequestHandler } from './$types';

/** Die Verwaltung bestätigt, dass sie Eingänge in den Datenbestand übernommen hat. */
export const POST: RequestHandler = async ({ request, locals }) => {
	const b = await request.json().catch(() => ({}));
	const ids = Array.isArray(b.ids) ? b.ids.filter((x: unknown) => typeof x === 'string').slice(0, 200) : [];
	store().inboxAck(ids);
	store().audit('inbox_ack', locals.user!.id, String(ids.length));
	return json({ ok: true });
};
