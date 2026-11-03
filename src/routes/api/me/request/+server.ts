import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { store } from '#lib/server/store.ts';
import { berlinParts, validDate } from '#lib/server/inbox.ts';
import type { RequestHandler } from './$types';

const addDays = (k: string, n: number) => new Date(Date.parse(k + 'T12:00:00Z') + n * 86400_000).toISOString().slice(0, 10);

/** Urlaub beantragen oder Krankheit melden. Die Verwaltung übernimmt den Eintrag (Urlaub zur Freigabe, Krankheit sofort mit Aufgabe). */
export const POST: RequestHandler = async ({ request, locals }) => {
	const u = locals.user!;
	if (!u.employeeId) return json({ error: 'Diesem Zugang ist keine Person zugeordnet.' }, { status: 404 });
	const b = await request.json().catch(() => ({}));
	const kind = b.kind === 'krank' ? 'krank' : b.kind === 'urlaub' ? 'urlaub' : null;
	if (!kind || !validDate(b.from) || !validDate(b.to)) return json({ error: 'Bitte Art und Datum angeben.' }, { status: 400 });
	const today = berlinParts(new Date()).date;
	if (b.to < b.from) return json({ error: 'Das Ende liegt vor dem Beginn.' }, { status: 400 });
	if (kind === 'urlaub' && b.from < today) return json({ error: 'Urlaub kann nicht rückwirkend beantragt werden.' }, { status: 400 });
	if (kind === 'krank' && b.from < addDays(today, -7)) return json({ error: 'Krankmeldungen rückwirkend nur bis 7 Tage. Bitte im Büro melden.' }, { status: 400 });
	if (b.to > addDays(b.from, kind === 'krank' ? 30 : 60) || b.from > addDays(today, 400)) return json({ error: 'Der Zeitraum ist zu lang. Bitte im Büro melden.' }, { status: 400 });
	const s = store();
	if (s.inboxCountSince(u.employeeId, ['absence'], new Date(Date.now() - 3600_000).toISOString()) >= 5) return json({ error: 'Zu viele Meldungen in kurzer Zeit.' }, { status: 429 });
	const dup = s.inboxOf(u.employeeId, new Date(Date.now() - 30 * 86400_000).toISOString()).some((i) => i.kind === 'absence' && i.status === 'neu' && i.payload.kind === kind && i.payload.from === b.from && i.payload.to === b.to);
	if (dup) return json({ error: 'Diese Meldung liegt dem Büro schon vor.' }, { status: 409 });
	const id = randomUUID();
	s.inboxAdd({ id, employeeId: u.employeeId, kind: 'absence', payload: { kind, from: b.from, to: b.to } });
	s.audit('absence_' + kind, u.id, `${b.from}..${b.to}`);
	return json({ ok: true, id });
};
