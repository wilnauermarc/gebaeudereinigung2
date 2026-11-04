import { json } from '@sveltejs/kit';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { store } from '#lib/server/store.ts';
import { rateLimited } from '#lib/server/auth.ts';
import { berlinParts, validDate } from '#lib/server/inbox.ts';
import { lvAt } from '#lib/lv.ts';
import type { RequestHandler } from './$types';

/**
 * Öffentliche Abnahme-Seite für Kunden: kein Login, nur ein geheimer Schlüssel je Objekt im Link.
 * Ausgeliefert wird bewusst wenig: Objektname, Tage mit festgehaltener Ausführung, was nicht erbracht wurde, Abnahmestand.
 * Keine Namen von Mitarbeitenden, keine internen Notizen, keine Preise. Entscheidungen landen im Eingang der Verwaltung.
 */
const MAX_AGE_DAYS = 45;
const addDays = (k: string, n: number) => new Date(Date.parse(k + 'T12:00:00Z') + n * 86400_000).toISOString().slice(0, 10);

function lookup(siteId: unknown, token: unknown) {
	const state = store().getState();
	if (!state || typeof siteId !== 'string' || typeof token !== 'string' || token.length < 16 || token.length > 80) return null;
	const doc = JSON.parse(state.json);
	for (const c of doc.customers ?? []) for (const s of c.sites ?? []) {
		if (s.id !== siteId || !s.acceptToken) continue;
		const a = Buffer.from(String(s.acceptToken)), b = Buffer.from(token);
		if (a.length === b.length && timingSafeEqual(a, b)) return { doc, customer: c, site: s };
	}
	return null;
}

export const GET: RequestHandler = ({ url, getClientAddress }) => {
	if (rateLimited('abnahme:' + getClientAddress())) return json({ error: 'Zu viele Anfragen. Bitte später erneut versuchen.' }, { status: 429 });
	const hit = lookup(url.searchParams.get('s'), url.searchParams.get('t'));
	if (!hit) return json({ error: 'Dieser Link ist ungültig oder wurde ersetzt.' }, { status: 404 });
	const { doc, customer, site } = hit;
	const today = berlinParts(new Date()).date;
	const since = addDays(today, -MAX_AGE_DAYS);
	const pending = store().inboxPending().filter((i) => i.kind === 'acceptance' && i.payload.siteId === site.id);
	const days = (doc.serviceRecords ?? [])
		.filter((r: any) => r.siteId === site.id && r.date >= since && r.execution !== 'offen')
		.sort((a: any, b: any) => b.date.localeCompare(a.date))
		.map((r: any) => {
			const lv = lvAt(site, r.date);
			const waiting = pending.find((i) => i.payload.date === r.date);
			return {
				date: r.date,
				execution: r.execution as string,
				missed: (lv?.items ?? []).filter((i: any) => (r.missedItemIds ?? []).includes(i.id)).map((i: any) => `${i.room || 'Allgemein'}: ${i.task}`),
				acceptance: waiting ? waiting.payload.acceptance : r.acceptance,
				acceptedBy: waiting ? waiting.payload.by : r.acceptedBy,
				/** Entscheidung liegt vor, die Verwaltung hat sie noch nicht übernommen */
				received: !!waiting
			};
		});
	return json({ company: doc.company?.name ?? '', customer: customer.name, site: site.name, address: `${site.street}, ${site.postal} ${site.city}`, today, days });
};

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	if (rateLimited('abnahme:' + getClientAddress())) return json({ error: 'Zu viele Anfragen. Bitte später erneut versuchen.' }, { status: 429 });
	const b = await request.json().catch(() => ({}));
	const hit = lookup(b.s, b.t);
	if (!hit) return json({ error: 'Dieser Link ist ungültig oder wurde ersetzt.' }, { status: 404 });
	const { doc, site } = hit;
	const today = berlinParts(new Date()).date;
	const date = b.date;
	if (!validDate(date) || date > today || date < addDays(today, -MAX_AGE_DAYS)) return json({ error: 'Ungültiger Einsatztag.' }, { status: 400 });
	const acceptance = b.acceptance === 'abgenommen' || b.acceptance === 'beanstandet' ? b.acceptance : null;
	if (!acceptance) return json({ error: 'Bitte „abnehmen“ oder „beanstanden“ wählen.' }, { status: 400 });
	const by = typeof b.by === 'string' ? b.by.trim() : '', note = typeof b.note === 'string' ? b.note.trim() : '';
	if (by.length < 2 || by.length > 60) return json({ error: 'Bitte Ihren Namen angeben.' }, { status: 400 });
	if (note.length > 300) return json({ error: 'Die Anmerkung ist zu lang (höchstens 300 Zeichen).' }, { status: 400 });
	if (acceptance === 'beanstandet' && note.length < 3) return json({ error: 'Bitte kurz beschreiben, was beanstandet wird.' }, { status: 400 });
	const rec = (doc.serviceRecords ?? []).find((r: any) => r.siteId === site.id && r.date === date);
	if (!rec || rec.execution === 'offen') return json({ error: 'Für diesen Tag liegt noch keine Leistungsmeldung vor.' }, { status: 409 });
	if (rec.acceptance !== 'offen') return json({ error: 'Dieser Tag ist schon entschieden. Änderungen bitte über das Büro.' }, { status: 409 });
	const s = store();
	if (s.inboxPending().some((i) => i.kind === 'acceptance' && i.payload.siteId === site.id && i.payload.date === date)) return json({ error: 'Ihre Entscheidung für diesen Tag liegt schon vor.' }, { status: 409 });
	const id = randomUUID();
	s.inboxAdd({ id, employeeId: 'kunde:' + site.id, kind: 'acceptance', payload: { siteId: site.id, date, acceptance, by, note } });
	s.audit('acceptance_link', null, `${site.id} ${date} ${acceptance}`);
	return json({ ok: true });
};
