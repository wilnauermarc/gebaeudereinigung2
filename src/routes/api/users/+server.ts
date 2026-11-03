import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { hashPassword, oneTimeCode } from '#lib/server/auth.ts';
import { store, type Role } from '#lib/server/store.ts';
import type { RequestHandler } from './$types';

/** Zugänge verwalten (nur Verwaltung, siehe hooks.server.ts). Passwort-Hashes verlassen den Server nie. */
export const GET: RequestHandler = () => json({ users: store().listUsers() });

export const POST: RequestHandler = async ({ request, locals }) => {
	const me = locals.user!;
	const b = await request.json().catch(() => ({}));
	const s = store();
	// Aktionen: create (Zugang für Mitarbeitende), reset (neuer Einmal-Code), disable/enable, remove
	if (b.action === 'create') {
		const role: Role = b.role === 'buero' || b.role === 'objektleitung' ? b.role : 'mitarbeiter';
		if ((role === 'buero' || role === 'objektleitung') && me.role !== 'inhaber') return json({ error: 'Nur die Inhaberin kann Verwaltungs-Zugänge anlegen.' }, { status: 403 });
		const login = String(b.login ?? '').trim(), display = String(b.display ?? '').trim();
		if (!/^[\p{L}\p{N}._@-]{3,40}$/u.test(login) || display.length < 2) return json({ error: 'Anmeldename (3–40 Zeichen, ohne Leerzeichen) und Name angeben.' }, { status: 400 });
		if (s.userByLogin(login)) return json({ error: 'Diesen Anmeldenamen gibt es schon.' }, { status: 409 });
		const employeeId = b.employeeId ? String(b.employeeId) : null;
		if (role === 'mitarbeiter') {
			if (!employeeId) return json({ error: 'Mitarbeiter-Zugänge brauchen eine zugeordnete Person.' }, { status: 400 });
			if (s.userByEmployee(employeeId)) return json({ error: 'Für diese Person gibt es schon einen Zugang.' }, { status: 409 });
		}
		const code = oneTimeCode();
		const id = randomUUID();
		s.insertUser({ id, login, display, role, employeeId: role === 'mitarbeiter' ? employeeId : null, pwHash: hashPassword(code), mustChange: true });
		s.audit('user_create', me.id, `${login} (${role})`);
		return json({ id, login, code });
	}
	const target = typeof b.id === 'string' ? s.userById(b.id) : undefined;
	if (!target) return json({ error: 'Zugang nicht gefunden.' }, { status: 404 });
	if (target.role !== 'mitarbeiter' && me.role !== 'inhaber') return json({ error: 'Verwaltungs-Zugänge ändert nur die Inhaberin.' }, { status: 403 });
	if (target.id === me.id && b.action !== 'reset') return json({ error: 'Den eigenen Zugang können Sie hier nicht ändern.' }, { status: 400 });
	if (b.action === 'reset') {
		const code = oneTimeCode();
		s.setPassword(target.id, hashPassword(code), true);
		s.deleteUserSessions(target.id);
		s.audit('user_reset', me.id, target.login);
		return json({ code });
	}
	if (b.action === 'disable' || b.action === 'enable') {
		s.setDisabled(target.id, b.action === 'disable');
		if (b.action === 'disable') s.deleteUserSessions(target.id);
		s.audit('user_' + b.action, me.id, target.login);
		return json({ ok: true });
	}
	if (b.action === 'remove') {
		s.deleteUser(target.id);
		s.audit('user_remove', me.id, target.login);
		return json({ ok: true });
	}
	return json({ error: 'Unbekannte Aktion.' }, { status: 400 });
};
