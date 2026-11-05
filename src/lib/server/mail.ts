/**
 * E-Mail-Versand. Mit SMTP_URL (zum Beispiel smtps://benutzer:passwort@mail.beispiel.de:465) und MAIL_FROM wird über SMTP gesendet.
 * Ohne SMTP_URL wird nichts versendet: Die Nachricht landet als Datei im Ordner outbox neben der Datenbank (nur zum Testen).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import nodemailer from 'nodemailer';

export interface Mail { to: string; subject: string; text: string }

export function mailConfigured() { return !!process.env.SMTP_URL && !!process.env.MAIL_FROM; }

export async function sendMail(m: Mail): Promise<{ sent: boolean }> {
	if (/[\r\n]/.test(m.to + m.subject)) throw new Error('Ungültige Adresse oder Betreffzeile.');
	if (!mailConfigured()) {
		const dir = join(dirname(process.env.RESCH_DB ?? 'data/resch.db'), 'outbox');
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, `${Date.now()}-${randomUUID().slice(0, 8)}.json`), JSON.stringify(m, null, 2), { mode: 0o600 });
		return { sent: false };
	}
	const t = nodemailer.createTransport(process.env.SMTP_URL!);
	await t.sendMail({ from: process.env.MAIL_FROM, to: m.to, subject: m.subject, text: m.text });
	return { sent: true };
}
