import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { store } from '#lib/server/store.ts';
import { berlinParts, validDate } from '#lib/server/inbox.ts';
import { canTake, ownsShift, shiftAt } from '#lib/swap.ts';
import { notifySwap } from '#lib/server/notify.ts';
import type { RequestHandler } from './$types';

/** Schichttausch: Einsatz abgeben, Angebot übernehmen oder zurückziehen. Alles wird auf dem Server gegen den aktuellen Plan geprüft. */
export const POST: RequestHandler = async ({ request, locals }) => {
	const u = locals.user!;
	if (!u.employeeId) return json({ error: 'Diesem Zugang ist keine Person zugeordnet.' }, { status: 404 });
	const emp = u.employeeId;
	const b = await request.json().catch(() => ({}));
	const s = store();
	const state = s.getState();
	if (!state) return json({ error: 'Kein Datenbestand.' }, { status: 404 });
	const d = JSON.parse(state.json);
	const now = new Date();
	const { date: today, time } = berlinParts(now);
	const nowMin = Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

	if (b.action === 'offer') {
		if (!validDate(b.date) || typeof b.siteId !== 'string') return json({ error: 'Bitte Einsatz und Datum angeben.' }, { status: 400 });
		if (b.date < today) return json({ error: 'Vergangene Einsätze können nicht getauscht werden.' }, { status: 400 });
		if (!ownsShift(d, emp, b.siteId, b.date)) return json({ error: 'Das ist nicht Ihr Einsatz.' }, { status: 400 });
		const sh = shiftAt(d, b.siteId, b.date)!;
		if (b.date === today && sh.startMin - nowMin < 180) return json({ error: 'Heute nur bis 3 Stunden vor Beginn. Bitte im Büro melden.' }, { status: 400 });
		if (s.swapsOf(emp, today).some((r) => r.offered_by === emp && r.site_id === b.siteId && r.date === b.date && ['offen', 'angenommen'].includes(r.status))) return json({ error: 'Dieser Einsatz ist schon im Angebot.' }, { status: 409 });
		if (s.swapActiveCount(emp) >= 5) return json({ error: 'Sie haben schon 5 offene Angebote.' }, { status: 429 });
		const id = randomUUID();
		s.swapAdd({ id, siteId: b.siteId, date: b.date, offeredBy: emp });
		s.audit('swap_offer', u.id, `${b.siteId} ${b.date}`);
		notifySwap(s, d, 'offer', { swapId: id, siteId: b.siteId, date: b.date, offeredBy: emp, takenBy: null });
		return json({ ok: true, id });
	}
	const row = typeof b.id === 'string' ? s.swapGet(b.id) : undefined;
	if (!row) return json({ error: 'Angebot nicht gefunden.' }, { status: 404 });
	if (b.action === 'take') {
		if (row.date < today) return json({ error: 'Der Einsatz liegt in der Vergangenheit.' }, { status: 400 });
		if (row.offered_by === emp) return json({ error: 'Das ist Ihr eigenes Angebot.' }, { status: 400 });
		const ok = canTake(d, emp, row.site_id, row.date);
		if (!ok.ok) return json({ error: ok.reason }, { status: 400 });
		if (!ownsShift(d, row.offered_by, row.site_id, row.date)) return json({ error: 'Das Angebot ist nicht mehr gültig.' }, { status: 409 });
		if (!s.swapTake(row.id, emp)) return json({ error: 'Jemand anderes war schneller.' }, { status: 409 });
		s.audit('swap_take', u.id, row.id);
		notifySwap(s, d, 'taken', { swapId: row.id, siteId: row.site_id, date: row.date, offeredBy: row.offered_by, takenBy: emp });
		return json({ ok: true });
	}
	if (b.action === 'withdraw') {
		if (row.offered_by !== emp) return json({ error: 'Nur wer angeboten hat, kann zurückziehen.' }, { status: 403 });
		if (!s.swapSetStatus(row.id, 'zurueckgezogen', ['offen', 'angenommen'])) return json({ error: 'Das Angebot ist schon entschieden.' }, { status: 409 });
		s.audit('swap_withdraw', u.id, row.id);
		notifySwap(s, d, 'withdrawn', { swapId: row.id, siteId: row.site_id, date: row.date, offeredBy: row.offered_by, takenBy: row.taken_by });
		return json({ ok: true });
	}
	return json({ error: 'Unbekannte Aktion.' }, { status: 400 });
};
