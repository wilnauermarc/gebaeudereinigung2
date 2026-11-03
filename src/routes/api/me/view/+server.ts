import { json } from '@sveltejs/kit';
import { store } from '#lib/server/store.ts';
import { staffView } from '#lib/staffView.ts';
import type { RequestHandler } from './$types';

/** Die eigene Ansicht: ausschließlich Daten der angemeldeten Person (employeeId kommt aus der Sitzung, nie aus der Anfrage). */
export const GET: RequestHandler = ({ locals }) => {
	const u = locals.user!;
	if (!u.employeeId) return json({ error: 'Diesem Zugang ist keine Person zugeordnet.' }, { status: 404 });
	const s = store().getState();
	const v = s ? staffView(JSON.parse(s.json), u.employeeId, new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' })) : null;
	if (!v) return json({ error: 'Person nicht gefunden.' }, { status: 404 });
	return json(v);
};
