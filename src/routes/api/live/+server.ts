import { json } from '@sveltejs/kit';
import { store } from '#lib/server/store.ts';
import { berlinParts } from '#lib/server/inbox.ts';
import type { RequestHandler } from './$types';

/**
 * Live-Stand des heutigen Tages für den Leitstand (nur Verwaltung, siehe hooks.server.ts):
 * wer ist gerade eingestempelt, welche Checklisten sind eingegangen, wer hat sich krank oder abwesend gemeldet.
 * Enthält keine Fotos und keine Standortdaten.
 */
export const GET: RequestHandler = () => {
	const today = berlinParts(new Date()).date;
	const items = store().inboxLive(new Date(Date.now() - 36 * 3600_000).toISOString());
	const punches = items.filter((i) => i.kind === 'punch' && (!i.closed || berlinParts(new Date(i.payload.startAt)).date === today)).map((i) => ({ employeeId: i.employeeId, siteId: String(i.payload.siteId), startAt: String(i.payload.startAt), endAt: i.closed && i.payload.endAt ? String(i.payload.endAt) : null, offline: !!i.payload.offline }));
	const checklists = items.filter((i) => i.kind === 'checklist' && i.payload.date === today).map((i) => ({ employeeId: i.employeeId, siteId: String(i.payload.siteId), at: i.createdAt, due: Array.isArray(i.payload.dueIds) ? i.payload.dueIds.length : 0, done: Array.isArray(i.payload.doneIds) ? i.payload.doneIds.length : 0 }));
	const absences = items.filter((i) => i.kind === 'absence').map((i) => ({ employeeId: i.employeeId, kind: String(i.payload.kind), from: String(i.payload.from), to: String(i.payload.to), at: i.createdAt }));
	return json({ now: new Date().toISOString(), today, punches, checklists, absences });
};
