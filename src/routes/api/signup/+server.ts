import { json } from '@sveltejs/kit';
import { passwordIssue } from '#lib/server/auth.ts';
import { activeTenantCount, overLimit, createPending, MAX_TENANTS, pendingCount, tenantsEnabled, trialAlreadyUsed, tenantByEmail } from '#lib/server/tenants.ts';
import { sendMail } from '#lib/server/mail.ts';
import type { RequestHandler } from './$types';

const EMAIL = /^[^\s@<>"',;:()[\]\\]{1,64}@[^\s@<>"',;:()[\]\\]+\.[a-z]{2,}$/i;
const NEUTRAL = { ok: true, message: 'Wenn die Adresse neu ist, haben wir Ihnen eine E-Mail mit dem Bestätigungslink geschickt. Bitte auch im Spam-Ordner nachsehen.' };

/** Testzugang beantragen: legt noch nichts an, schickt nur den Bestätigungslink. Antwort ist immer dieselbe, damit niemand Adressen erraten kann. */
export const POST: RequestHandler = async ({ request, getClientAddress, url }) => {
	if (!tenantsEnabled()) return json({ error: 'Nicht verfügbar.' }, { status: 404 });
	const ip = getClientAddress();
	// grobe Begrenzung aller Aufrufe (auch fehlerhafter) je Adresse; die strenge für gültige Anträge folgt nach der Prüfung
	if (overLimit('signup-raw:' + ip, 40, 3600_000)) return json({ error: 'Zu viele Versuche. Bitte später erneut versuchen.' }, { status: 429 });
	const b = await request.json().catch(() => ({}));
	if (typeof b.website === 'string' && b.website) return json(NEUTRAL); // Köderfeld: Menschen lassen es leer
	const company = String(b.company ?? '').trim(), display = String(b.name ?? '').trim(), email = String(b.email ?? '').trim().toLowerCase(), password = String(b.password ?? '');
	if (company.length < 2 || company.length > 80 || /[<>]/.test(company)) return json({ error: 'Bitte den Firmennamen angeben (2 bis 80 Zeichen, ohne < >).' }, { status: 400 });
	if (display.length < 2 || display.length > 60 || /[<>]/.test(display)) return json({ error: 'Bitte Ihren Namen angeben (2 bis 60 Zeichen, ohne < >).' }, { status: 400 });
	if (email.length > 120 || !EMAIL.test(email)) return json({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' }, { status: 400 });
	const issue = passwordIssue(password, 'inhaber');
	if (issue) return json({ error: issue }, { status: 400 });
	if (b.accept !== true) return json({ error: 'Bitte stimmen Sie den Hinweisen zum Datenschutz zu.' }, { status: 400 });
	// gültige Anträge: höchstens 5 je Adresse und Stunde, insgesamt höchstens 60 pro Stunde
	if (overLimit('signup:' + ip, 5, 3600_000) || overLimit('signup:all', 60, 3600_000)) return json({ error: 'Zu viele Versuche. Bitte später erneut versuchen.' }, { status: 429 });
	if (activeTenantCount() >= MAX_TENANTS() || pendingCount() > 500) return json({ error: 'Im Moment nehmen wir keine neuen Testzugänge an. Bitte später erneut versuchen.' }, { status: 503 });
	// Schon registriert oder schon getestet: dieselbe neutrale Antwort, aber kein neuer Link
	if (tenantByEmail(email) || trialAlreadyUsed(email)) return json(NEUTRAL);
	if (overLimit('signup-mail:' + email, 2, 24 * 3600_000)) return json(NEUTRAL); // keine Massen-Mails an eine fremde Adresse
	const token = createPending({ email, company, display, password, demo: b.demo !== false });
	const link = `${url.origin}/start/bestaetigen#${token}`;
	await sendMail({ to: email, subject: 'Bitte bestätigen Sie Ihre E-Mail-Adresse für Putzbetrieb', text: `Guten Tag ${display},\n\nvielen Dank für Ihr Interesse an Putzbetrieb. Mit diesem Link bestätigen Sie Ihre Adresse und starten Ihre 30-tägige Testphase für „${company}“:\n\n${link}\n\nDer Link gilt 24 Stunden. Wenn Sie das nicht angefordert haben, ignorieren Sie diese Nachricht einfach, dann wird nichts angelegt.\n\nPutzbetrieb` }).catch(() => undefined);
	return json(NEUTRAL);
};
