import { json } from '@sveltejs/kit';
import { store } from '#lib/server/store.ts';
import type { RequestHandler } from './$types';

/** Den eigenen Anzeigenamen ändern (Verwaltung). Der Anmeldename bleibt, nur der angezeigte Name ändert sich. */
export const POST: RequestHandler = async ({ request, locals }) => {
	const u = locals.user!;
	const b = await request.json().catch(() => ({}));
	const display = typeof b.display === 'string' ? b.display.trim().replace(/\s+/g, ' ') : '';
	if (display.length < 2 || display.length > 60) return json({ error: 'Der Name braucht 2 bis 60 Zeichen.' }, { status: 400 });
	if (/[<>]/.test(display)) return json({ error: 'Der Name darf kein < oder > enthalten.' }, { status: 400 });
	store().setDisplay(u.id, display);
	store().audit('profile_name', u.id, display.slice(0, 60));
	return json({ ok: true, display });
};
