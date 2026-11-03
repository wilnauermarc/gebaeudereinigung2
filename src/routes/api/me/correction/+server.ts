import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { store } from '#lib/server/store.ts';
import { berlinParts } from '#lib/server/inbox.ts';
import type { RequestHandler } from './$types';

const HM = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Korrektur einer eigenen Zeitbuchung beantragen. Die Person ändert nichts selbst: Der Antrag geht ins Büro,
 * dort wird geprüft und freigegeben oder abgelehnt. Gebucht wird erst nach der Freigabe, mit Eintrag im Änderungsprotokoll.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const u = locals.user!;
	if (!u.employeeId) return json({ error: 'Diesem Zugang ist keine Person zugeordnet.' }, { status: 404 });
	const b = await request.json().catch(() => ({}));
	const emp = u.employeeId;
	const entryId = typeof b.entryId === 'string' ? b.entryId.slice(0, 80) : '';
	const reason = typeof b.reason === 'string' ? b.reason.trim() : '';
	const breakMin = Number.isInteger(b.breakMin) ? b.breakMin : 0;
	if (!entryId || !HM.test(String(b.start)) || !HM.test(String(b.end)) || b.start === b.end) return json({ error: 'Bitte Beginn und Ende angeben.' }, { status: 400 });
	if (breakMin < 0 || breakMin > 120) return json({ error: 'Pause zwischen 0 und 120 Minuten.' }, { status: 400 });
	if (reason.length < 3 || reason.length > 300) return json({ error: 'Bitte kurz begründen (3 bis 300 Zeichen).' }, { status: 400 });
	const s = store();
	if (s.inboxCountSince(emp, ['correction'], new Date(Date.now() - 3600_000).toISOString()) >= 5) return json({ error: 'Zu viele Anträge in kurzer Zeit.' }, { status: 429 });

	// Die Buchung muss der Person gehören und darf höchstens 14 Tage alt sein (so weit reicht ihre Ansicht)
	const state = s.getState();
	const doc = state ? JSON.parse(state.json) : null;
	const since = berlinParts(new Date(Date.now() - 14 * 86400_000)).date;
	const inbox = s.inboxOf(emp, new Date(Date.now() - 16 * 86400_000).toISOString());
	const booked = (doc?.timeEntries ?? []).find((t: any) => t.employeeId === emp && (t.id === entryId || t.id === 't' + entryId));
	const pend = inbox.find((i) => i.id === entryId && i.kind === 'punch' && i.closed);
	const date: string | undefined = booked?.date ?? (pend ? berlinParts(new Date(pend.payload.startAt)).date : undefined);
	if (!date) return json({ error: 'Diese Buchung wurde nicht gefunden.' }, { status: 404 });
	if (date < since) return json({ error: 'Korrekturen online nur bis 14 Tage zurück. Bitte im Büro melden.' }, { status: 400 });
	if (booked?.voided) return json({ error: 'Diese Buchung ist ungültig.' }, { status: 400 });
	if (doc?.lockedMonths?.includes(date.slice(0, 7))) return json({ error: 'Dieser Monat ist abgeschlossen. Bitte im Büro melden.' }, { status: 400 });
	const refs = new Set([entryId, 't' + entryId, entryId.replace(/^t/, '')]);
	const dup = inbox.some((i) => i.kind === 'correction' && i.status === 'neu' && refs.has(i.payload.entryId))
		|| (doc?.corrections ?? []).some((c: any) => c.employeeId === emp && c.status === 'offen' && refs.has(c.entryId));
	if (dup) return json({ error: 'Für diese Buchung liegt dem Büro schon ein Antrag vor.' }, { status: 409 });

	const id = randomUUID();
	s.inboxAdd({ id, employeeId: emp, kind: 'correction', payload: { entryId, date, start: b.start, end: b.end, breakMin, reason } });
	s.audit('correction_request', u.id, entryId);
	return json({ ok: true, id });
};
