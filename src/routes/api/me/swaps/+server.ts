import { json } from '@sveltejs/kit';
import { store } from '#lib/server/store.ts';
import { berlinParts } from '#lib/server/inbox.ts';
import { canTake, shiftAt } from '#lib/swap.ts';
import type { RequestHandler } from './$types';

/** Schichtbörse für die angemeldete Person: Angebote, die sie übernehmen darf, und die eigenen Angebote/Übernahmen. */
export const GET: RequestHandler = ({ locals }) => {
	const u = locals.user!;
	if (!u.employeeId) return json({ error: 'Diesem Zugang ist keine Person zugeordnet.' }, { status: 404 });
	const s = store();
	const state = s.getState();
	if (!state) return json({ offers: [], mine: [] });
	const d = JSON.parse(state.json);
	const today = berlinParts(new Date()).date;
	const first = (id: string | null) => (d.employees.find((e: any) => e.id === id)?.name ?? '').split(' ')[0];
	const view = (r: any) => { const sh = shiftAt(d, r.site_id, r.date); return sh ? { siteId: r.site_id, date: r.date, start: sh.start, end: sh.end, customer: sh.customer, site: sh.site } : null; };
	const offers = s.swapsOpen(today).filter((r) => r.offered_by !== u.employeeId && canTake(d, u.employeeId!, r.site_id, r.date).ok).map((r) => ({ id: r.id, by: first(r.offered_by), ...view(r) })).filter((x) => x.siteId);
	const mine = s.swapsOf(u.employeeId, today).map((r) => ({ id: r.id, status: r.status, role: r.offered_by === u.employeeId ? 'abgeber' : 'uebernehmer', other: first(r.offered_by === u.employeeId ? r.taken_by : r.offered_by), ...view(r) })).filter((x) => x.siteId);
	return json({ offers, mine });
};
