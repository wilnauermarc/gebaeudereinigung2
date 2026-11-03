import { json } from '@sveltejs/kit';
import { store } from '#lib/server/store.ts';
import { canTake, ownsShift } from '#lib/swap.ts';
import { notifySwap } from '#lib/server/notify.ts';
import type { RequestHandler } from './$types';

/** Genehmigen oder ablehnen. Beim Genehmigen wird noch einmal gegen den aktuellen Plan geprüft. */
export const POST: RequestHandler = async ({ request, locals }) => {
	const b = await request.json().catch(() => ({}));
	const s = store();
	const row = typeof b.id === 'string' ? s.swapGet(b.id) : undefined;
	if (!row || row.status !== 'angenommen' || !row.taken_by) return json({ error: 'Kein offener Tauschwunsch.' }, { status: 404 });
	const state0 = s.getState();
	const d0 = state0 ? JSON.parse(state0.json) : null;
	const info = { swapId: row.id, siteId: row.site_id, date: row.date, offeredBy: row.offered_by, takenBy: row.taken_by };
	if (b.decision === 'reject') { s.swapSetStatus(row.id, 'abgelehnt', ['angenommen']); s.audit('swap_reject', locals.user!.id, row.id); if (d0) notifySwap(s, d0, 'rejected', info); return json({ ok: true }); }
	if (b.decision !== 'approve') return json({ error: 'Unbekannte Entscheidung.' }, { status: 400 });
	const state = s.getState();
	const d = state ? JSON.parse(state.json) : null;
	if (!d || !ownsShift(d, row.offered_by, row.site_id, row.date)) return json({ error: 'Der Einsatz gehört der abgebenden Person nicht mehr. Bitte ablehnen.' }, { status: 409 });
	const ok = canTake(d, row.taken_by, row.site_id, row.date);
	if (!ok.ok) return json({ error: `Die übernehmende Person kann nicht mehr: ${ok.reason}` }, { status: 409 });
	s.swapSetStatus(row.id, 'bestaetigt', ['angenommen']);
	s.audit('swap_approve', locals.user!.id, row.id);
	notifySwap(s, d, 'approved', info);
	return json({ ok: true });
};
