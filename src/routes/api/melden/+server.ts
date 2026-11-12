import { json } from '@sveltejs/kit';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { store } from '#lib/server/store.ts';
import { rateLimited } from '#lib/server/auth.ts';
import type { RequestHandler } from './$types';

/**
 * Kundenmeldung per Link oder QR-Code am Objekt: kein Login, nur ein geheimer Schlüssel je Objekt (reportToken).
 * Es entsteht nur ein Eintrag im Eingang der Verwaltung, die ihn als Mangel übernimmt. Es gibt weder Fotos noch Dateien,
 * ausgeliefert werden nur Firmenname, Objektname und Adresse.
 */
function lookup(siteId: unknown, token: unknown) {
	const state = store().getState();
	if (!state || typeof siteId !== 'string' || typeof token !== 'string' || token.length < 16 || token.length > 80) return null;
	const doc = JSON.parse(state.json);
	for (const c of doc.customers ?? []) for (const s of c.sites ?? []) {
		if (s.id !== siteId || !s.reportToken) continue;
		const a = Buffer.from(String(s.reportToken)), b = Buffer.from(token);
		if (a.length === b.length && timingSafeEqual(a, b)) return { doc, customer: c, site: s };
	}
	return null;
}

export const GET: RequestHandler = ({ url, getClientAddress }) => {
	if (rateLimited('melden:' + getClientAddress())) return json({ error: 'Zu viele Anfragen. Bitte später erneut versuchen.' }, { status: 429 });
	const hit = lookup(url.searchParams.get('s'), url.searchParams.get('t'));
	if (!hit) return json({ error: 'Dieser Link ist ungültig oder wurde ersetzt.' }, { status: 404 });
	return json({ company: hit.doc.company?.name ?? '', site: hit.site.name, address: `${hit.site.street}, ${hit.site.postal} ${hit.site.city}` });
};

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	if (rateLimited('melden:' + getClientAddress())) return json({ error: 'Zu viele Anfragen. Bitte später erneut versuchen.' }, { status: 429 });
	const b = await request.json().catch(() => ({}));
	if (typeof b.website === 'string' && b.website) return json({ ok: true }); // Köderfeld: Menschen lassen es leer
	const hit = lookup(b.s, b.t);
	if (!hit) return json({ error: 'Dieser Link ist ungültig oder wurde ersetzt.' }, { status: 404 });
	const text = typeof b.text === 'string' ? b.text.trim() : '';
	const by = typeof b.by === 'string' ? b.by.trim() : '', contact = typeof b.contact === 'string' ? b.contact.trim() : '';
	if (text.length < 5 || text.length > 500) return json({ error: 'Bitte kurz beschreiben, was nicht in Ordnung ist (5 bis 500 Zeichen).' }, { status: 400 });
	if (by.length > 60 || contact.length > 100) return json({ error: 'Name oder Kontakt ist zu lang.' }, { status: 400 });
	if (/[<>]/.test(text + by + contact)) return json({ error: 'Bitte ohne die Zeichen < und >.' }, { status: 400 });
	const s = store();
	const emp = 'kunde:' + hit.site.id;
	// höchstens 20 Meldungen je Objekt und Tag, damit ein weitergegebener Link kein Postfach flutet
	if (s.inboxCountSince(emp, ['customer_report'], new Date(Date.now() - 86400_000).toISOString()) >= 20) return json({ error: 'Für dieses Objekt sind heute schon viele Meldungen eingegangen. Bitte rufen Sie uns an.' }, { status: 429 });
	const id = randomUUID();
	s.inboxAdd({ id, employeeId: emp, kind: 'customer_report', payload: { siteId: hit.site.id, text, by, contact } });
	s.audit('customer_report', null, hit.site.id);
	return json({ ok: true });
};
