/** IBAN-Prüfziffer nach ISO 13616 (Modulo 97). Leere Eingabe ist gültig, Platzhalter nicht. */
export function ibanValid(iban: string): boolean {
	const s = iban.replace(/\s+/g, '').toUpperCase();
	if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s)) return false;
	const moved = s.slice(4) + s.slice(0, 4);
	const digits = [...moved].map((c) => (c >= 'A' ? String(c.charCodeAt(0) - 55) : c)).join('');
	let rem = 0;
	for (const ch of digits) rem = (rem * 10 + Number(ch)) % 97;
	return rem === 1;
}
