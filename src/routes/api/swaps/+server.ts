import { json } from '@sveltejs/kit';
import { store } from '#lib/server/store.ts';
import type { RequestHandler } from './$types';

/** Tauschwünsche zur Entscheidung und genehmigte, die noch in den Plan zu übernehmen sind (nur Verwaltung) */
export const GET: RequestHandler = () => json({ swaps: store().swapsPending().map((r) => ({ id: r.id, siteId: r.site_id, date: r.date, offeredBy: r.offered_by, takenBy: r.taken_by, status: r.status })) });
