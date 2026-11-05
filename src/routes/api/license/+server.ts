import { json } from '@sveltejs/kit';
import { store } from '#lib/server/store.ts';
import { licenseInfo } from '#lib/server/license.ts';
import { berlinParts } from '#lib/server/inbox.ts';
import { priceFor } from '#lib/pricing.ts';
import type { RequestHandler } from './$types';

/** Lizenz und Preis dieser Installation (nur Verwaltung, siehe hooks.server.ts). Die Lizenz setzt allein der Betreiber über die Umgebung des Servers. */
export const GET: RequestHandler = () => {
	const lic = licenseInfo(berlinParts(new Date()).date);
	const s = store().getState();
	let seats = 0;
	try { seats = s ? (JSON.parse(s.json).employees?.length ?? 0) : 0; } catch { seats = 0; }
	return json({ ...lic, seats, price: lic.status === 'eigenbetrieb' || lic.status === 'demo' ? null : priceFor(lic.plan, seats) });
};
