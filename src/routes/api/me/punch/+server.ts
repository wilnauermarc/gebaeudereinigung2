import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { store } from '#lib/server/store.ts';
import { MAX_SHIFT_MS, berlinParts, punchTime } from '#lib/server/inbox.ts';
import { staffView } from '#lib/staffView.ts';
import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from './$types';

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Ein- und Ausstempeln. Person und Zeit bestimmt der Server; Einsatzort nur aus den eigenen Einsätzen des Tages. */
export const POST: RequestHandler = async ({ request, locals }) => {
	const u = locals.user!;
	if (!u.employeeId) return json({ error: 'Diesem Zugang ist keine Person zugeordnet.' }, { status: 404 });
	const b = await request.json().catch(() => ({}));
	const s = store();
	const emp = u.employeeId;
	const { at, offline } = punchTime(b.clientAt);
	const open = s.inboxOpenPunch(emp);

	if (b.action === 'in') {
		const id = typeof b.clientId === 'string' && ID.test(b.clientId) ? b.clientId : randomUUID();
		if (s.inboxOf(emp, new Date(Date.now() - 2 * 86400_000).toISOString()).some((i) => i.id === id)) return json({ ok: true, id, duplicate: true });
		if (open) return json({ error: 'Sie sind schon eingestempelt.', open: { startedAt: open.payload.startAt } }, { status: 409 });
		if (s.inboxCountSince(emp, ['punch'], new Date(Date.now() - 3600_000).toISOString()) >= 20) return json({ error: 'Zu viele Stempelungen in kurzer Zeit.' }, { status: 429 });
		const state = s.getState();
		const date = berlinParts(at).date;
		const v = state ? staffView(JSON.parse(state.json), emp, date) : null;
		const site = v?.shifts.find((x) => x.date === date && x.siteId === String(b.siteId));
		if (!site) return json({ error: 'Für diesen Einsatzort sind Sie heute nicht eingeplant.' }, { status: 400 });
		// QR-Code am Objekt: der Schlüssel muss zum Objekt passen (Vergleich in konstanter Zeit)
		const doc = state ? JSON.parse(state.json) : null;
		const siteRow = (doc?.customers ?? []).flatMap((c: any) => c.sites).find((x: any) => x.id === site.siteId);
		const want = String(siteRow?.stampToken ?? '');
		const got = typeof b.token === 'string' ? b.token : '';
		const tokenOk = !!want && got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want));
		if (doc?.settings?.requireQr && !tokenOk) return json({ error: 'Bitte scannen Sie den QR-Code im Objekt, um einzustempeln.', needsQr: true }, { status: 400 });
		if (got && !tokenOk) return json({ error: 'Dieser QR-Code ist ungültig oder abgelaufen. Bitte den aktuellen Aushang scannen.' }, { status: 400 });
		s.inboxAdd({ id, employeeId: emp, kind: 'punch', closed: false, payload: { siteId: site.siteId, startAt: at.toISOString(), offline, qr: tokenOk } });
		s.audit('punch_in', u.id, site.siteId);
		return json({ ok: true, id, startedAt: at.toISOString() });
	}
	if (b.action === 'out') {
		if (!open) {
			const prev = s.inboxOf(emp, new Date(Date.now() - 2 * 86400_000).toISOString()).find((i) => i.kind === 'punch' && i.payload.outId === b.clientId && typeof b.clientId === 'string');
			return prev ? json({ ok: true, duplicate: true }) : json({ error: 'Sie sind nicht eingestempelt.' }, { status: 409 });
		}
		const start = Date.parse(open.payload.startAt);
		if (at.getTime() < start) return json({ error: 'Das Ende liegt vor dem Beginn.' }, { status: 400 });
		const breakMin = Number.isInteger(b.breakMin) ? b.breakMin : 0;
		if (breakMin < 0 || breakMin > 120) return json({ error: 'Pause zwischen 0 und 120 Minuten.' }, { status: 400 });
		const mins = Math.floor((at.getTime() - start) / 60000);
		// Versehentliches Ein- und gleich Ausstempeln: weniger als eine Minute wird nicht gebucht
		if (mins < 1) { s.inboxDelete(open.id); s.audit('punch_cancel', u.id, open.payload.siteId); return json({ ok: true, cancelled: true }); }
		if (breakMin >= mins) return json({ error: 'Die Pause ist länger als die Arbeitszeit.' }, { status: 400 });
		const suspect = at.getTime() - start > MAX_SHIFT_MS;
		const end = suspect ? new Date(start + MAX_SHIFT_MS) : at;
		s.inboxUpdate(open.id, { ...open.payload, endAt: end.toISOString(), breakMin, offline: open.payload.offline || offline, suspect, outId: typeof b.clientId === 'string' ? b.clientId : undefined }, true);
		s.audit('punch_out', u.id, open.payload.siteId);
		return json({ ok: true, suspect });
	}
	return json({ error: 'Unbekannte Aktion.' }, { status: 400 });
};
