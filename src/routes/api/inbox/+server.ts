import { json } from '@sveltejs/kit';
import { store } from '#lib/server/store.ts';
import type { RequestHandler } from './$types';

/** Offene Eingänge von Mitarbeitenden (nur Verwaltung, siehe hooks.server.ts) */
export const GET: RequestHandler = () => json({ items: store().inboxPending() });
