import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { store } from '#lib/server/store.ts';
import { berlinParts, parsePhoto, punchTime } from '#lib/server/inbox.ts';
import { staffView } from '#lib/staffView.ts';
import { dueAtVisit, lvAt } from '#lib/lv.ts';
import type { RequestHandler } from './$types';

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * Checkliste zum heutigen Einsatz: Die Person hakt die Leistungen des Objekts ab (optional Foto, Notiz).
 * Die Verwaltung übernimmt daraus die „Ausführung“ im Leistungsnachweis. Es zählen nur Leistungen aus dem
 * Verzeichnis des Objekts, und nur für einen Einsatz, auf dem die Person heute eingeplant ist.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const u = locals.user!;
	if (!u.employeeId) return json({ error: 'Diesem Zugang ist keine Person zugeordnet.' }, { status: 404 });
	const b = await request.json().catch(() => ({}));
	const s = store();
	const emp = u.employeeId;
	const { at } = punchTime(b.clientAt);
	const date = berlinParts(at).date;
	const id = typeof b.clientId === 'string' && ID.test(b.clientId) ? b.clientId : randomUUID();
	if (s.inboxOf(emp, new Date(Date.now() - 2 * 86400_000).toISOString()).some((i) => i.id === id)) return json({ ok: true, id, duplicate: true });
	if (s.inboxCountSince(emp, ['checklist'], new Date(Date.now() - 3600_000).toISOString()) >= 20) return json({ error: 'Zu viele Meldungen in kurzer Zeit.' }, { status: 429 });
	const state = s.getState();
	const doc = state ? JSON.parse(state.json) : null;
	if (!doc) return json({ error: 'Keine Daten vorhanden.' }, { status: 400 });
	const v = staffView(doc, emp, date);
	if (!v?.shifts.some((x) => x.date === date && x.siteId === String(b.siteId))) return json({ error: 'Für dieses Objekt sind Sie heute nicht eingeplant.' }, { status: 400 });
	const site = doc.customers.flatMap((c: any) => c.sites).find((x: any) => x.id === b.siteId);
	const lv = site ? lvAt(site, date) : null;
	if (!lv || !lv.items.length) return json({ error: 'Für dieses Objekt gibt es noch kein Leistungsverzeichnis.' }, { status: 400 });
	const all = new Set(lv.items.map((i) => i.id));
	const doneIds: string[] = Array.isArray(b.doneIds) ? [...new Set<string>(b.doneIds.filter((x: unknown): x is string => typeof x === 'string'))] : [];
	if (doneIds.some((x) => !all.has(x))) return json({ error: 'Unbekannte Leistung in der Checkliste.' }, { status: 400 });
	const note = typeof b.note === 'string' ? b.note.trim().slice(0, 300) : '';
	const photo = parsePhoto(b.photo);
	if (photo && 'error' in photo) return json({ error: photo.error }, { status: 400 });
	const dueIds = lv.items.filter((i) => dueAtVisit(i, date, site.plan?.days ?? [])).map((i) => i.id);
	s.inboxAdd({ id, employeeId: emp, kind: 'checklist', payload: { siteId: b.siteId, date, lvVersionId: lv.id, dueIds, doneIds, note, mime: photo && !('error' in photo) ? photo.mime : null }, photo: photo && !('error' in photo) ? photo.bytes : null });
	s.audit('checklist', u.id, `${b.siteId} ${date}`);
	return json({ ok: true, id });
};
