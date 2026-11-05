import { json } from '@sveltejs/kit';
import { store } from '#lib/server/store.ts';
import { isManagement } from '#lib/server/auth.ts';
import type { RequestHandler } from './$types';

/** Wer bin ich? Ohne Sitzung nur die Angabe, ob noch ein Konto eingerichtet werden muss. */
export const GET: RequestHandler = ({ locals }) => {
	const u = locals.user;
	return json({ demo: process.env.DEMO === '1', needsSetup: store().userCount() === 0, setupNeedsCode: !!process.env.SETUP_TOKEN, user: u ? { id: u.id, display: u.display, role: u.role, employeeId: u.employeeId, mustChange: u.mustChange, management: isManagement(u.role) } : null });
};
