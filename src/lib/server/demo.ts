/**
 * Öffentliche Demo (nur wenn der Server mit DEMO=1 läuft, eigene Instanz mit eigener Datenbank):
 * erfundene Daten, Zugang ohne Anmeldung, nur lesend, regelmäßig zurückgesetzt.
 * In dieser Instanz gibt es keine echten Daten und keine echten Zugänge.
 */
import { randomBytes, randomUUID } from 'node:crypto';
import { createDemoData } from '../demo.ts';
import { hashPassword } from './auth.ts';
import type { Store } from './store.ts';

export const isDemoServer = () => process.env.DEMO === '1';
/** Nach so vielen Stunden wird die Demo auf den Ausgangsstand zurückgesetzt */
export const DEMO_RESET_HOURS = 3;
/** Höchstzahl gleichzeitiger Demo-Sitzungen (schützt vor Massenanlage) */
export const DEMO_MAX_SESSIONS = 300;
export const DEMO_SESSION_MS = 2 * 3600_000;

/** Legt Daten und zwei Zugänge an (Büro, Mitarbeiter-App). Passwörter sind zufällig und werden nie angezeigt. */
export function seedDemo(s: Store) {
	const data = createDemoData(12);
	const emp = data.employees.find((e) => e.name) ?? data.employees[0];
	s.putState(JSON.stringify(data), 0);
	s.insertUser({ id: 'demo-buero', login: 'demo-buero', display: 'Demo (Büro)', role: 'inhaber', employeeId: null, pwHash: hashPassword(randomBytes(24).toString('base64url')), mustChange: false });
	if (emp) s.insertUser({ id: 'demo-team', login: 'demo-team', display: emp.name, role: 'mitarbeiter', employeeId: emp.id, pwHash: hashPassword(randomBytes(24).toString('base64url')), mustChange: false });
}
/** Alles löschen und neu anlegen */
export function resetDemo(s: Store) {
	for (const t of ['sessions', 'inbox', 'swaps', 'notifications', 'audit', 'state', 'users']) s.raw.exec(`DELETE FROM ${t}`);
	seedDemo(s);
}
/** Legt die Demo beim ersten Aufruf an und setzt sie nach Ablauf zurück */
export function maintainDemo(s: Store, now = Date.now()) {
	const cur = s.getState();
	if (!cur || s.userCount() === 0) { resetDemo(s); return; }
	const row = s.raw.prepare('SELECT updated_at FROM state WHERE id = 1').get() as { updated_at: string } | undefined;
	if (!row || now - Date.parse(row.updated_at) > DEMO_RESET_HOURS * 3600_000) resetDemo(s);
}
export const newDemoSessionId = () => randomUUID();
