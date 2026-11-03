import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { store } from '#lib/server/store.ts';
import { parsePhoto } from '#lib/server/inbox.ts';
import type { RequestHandler } from './$types';

/** Mangel oder Auffälligkeit melden, optional mit Foto. Nur für Objekte, auf denen die Person eingeplant ist. */
export const POST: RequestHandler = async ({ request, locals }) => {
	const u = locals.user!;
	if (!u.employeeId) return json({ error: 'Diesem Zugang ist keine Person zugeordnet.' }, { status: 404 });
	const b = await request.json().catch(() => ({}));
	const text = typeof b.text === 'string' ? b.text.trim() : '';
	if (text.length < 5 || text.length > 1000) return json({ error: 'Bitte kurz beschreiben, was los ist (5 bis 1000 Zeichen).' }, { status: 400 });
	const photo = parsePhoto(b.photo);
	if (photo && 'error' in photo) return json({ error: photo.error }, { status: 400 });
	const s = store();
	const state = s.getState();
	const d = state ? JSON.parse(state.json) : null;
	const mine = (d?.customers ?? []).flatMap((c: any) => c.sites).filter((x: any) => x.plan?.staffIds?.includes(u.employeeId) || (d.covers ?? []).some((v: any) => v.siteId === x.id && v.employeeId === u.employeeId));
	if (!mine.some((x: any) => x.id === b.siteId)) return json({ error: 'Für dieses Objekt sind Sie nicht eingeplant.' }, { status: 400 });
	if (s.inboxCountSince(u.employeeId, ['defect'], new Date(Date.now() - 3600_000).toISOString()) >= 10) return json({ error: 'Zu viele Meldungen in kurzer Zeit.' }, { status: 429 });
	const id = randomUUID();
	s.inboxAdd({ id, employeeId: u.employeeId, kind: 'defect', payload: { siteId: b.siteId, text, mime: photo && !('error' in photo) ? photo.mime : null }, photo: photo && !('error' in photo) ? photo.bytes : null });
	s.audit('defect_report', u.id, String(b.siteId));
	return json({ ok: true, id });
};
