import type { CustomerStatus, QuoteKind, QuoteStatus } from './types';

export type Tone = 'neutral' | 'info' | 'success' | 'warn' | 'danger';

export const customerStatus: Record<CustomerStatus, { label: string; tone: Tone }> = {
	interessent: { label: 'Interessent', tone: 'info' },
	aktiv: { label: 'Aktiv', tone: 'success' },
	inaktiv: { label: 'Inaktiv', tone: 'neutral' }
};
export const quoteStatus: Record<QuoteStatus, { label: string; tone: Tone }> = {
	entwurf: { label: 'Entwurf', tone: 'neutral' },
	versendet: { label: 'Versendet', tone: 'info' },
	angenommen: { label: 'Angenommen', tone: 'success' },
	abgelehnt: { label: 'Abgelehnt', tone: 'danger' }
};
export const quoteKind: Record<QuoteKind, string> = {
	sonderreinigung: 'Sonderreinigung',
	unterhaltsreinigung: 'Unterhaltsreinigung'
};
/** Häufigkeitsgruppen der Unterhaltsreinigung (Annahme aus V1: „1 x pro Woche …“; Liste noch mit Frau R. abzustimmen). */
export const frequencies = [
	'Einmalig',
	'1 x pro Woche',
	'2 x pro Woche',
	'3 x pro Woche',
	'5 x pro Woche',
	'14-tägig',
	'1 x pro Monat',
	'Vierteljährlich'
];
