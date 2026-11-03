import { error } from '@sveltejs/kit';
import { store } from '#lib/server/store.ts';
import type { RequestHandler } from './$types';

/** Foto zu einem Eingang (nur Verwaltung). Der Typ wird aus dem Dateikopf bestimmt, nicht aus Angaben des Geräts. */
export const GET: RequestHandler = ({ url }) => {
	const p = store().inboxPhoto(url.searchParams.get('id') ?? '');
	if (!p) error(404, 'Kein Foto');
	const b = Buffer.from(p);
	const mime = b[0] === 0xff ? 'image/jpeg' : b[0] === 0x89 ? 'image/png' : 'image/webp';
	return new Response(b, { headers: { 'content-type': mime, 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff', 'content-disposition': 'inline' } });
};
