/** Einfacher CSV-Leser (Trennzeichen automatisch, Anführungszeichen, BOM) und Spaltenzuordnung für den Kunden-Import. */
export function parseCsv(text: string): string[][] {
	const src = text.replace(/^﻿/, '');
	const first = src.split(/\r?\n/, 1)[0] ?? '';
	const delim = [';', '\t', ','].map((d) => [d, first.split(d).length] as const).sort((a, b) => b[1] - a[1])[0][0];
	const rows: string[][] = [];
	let row: string[] = [], cell = '', q = false;
	for (let i = 0; i < src.length; i++) {
		const ch = src[i];
		if (q) {
			if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
			else if (ch === '"') q = false;
			else cell += ch;
		} else if (ch === '"') q = true;
		else if (ch === delim) { row.push(cell); cell = ''; }
		else if (ch === '\n' || ch === '\r') {
			if (ch === '\r' && src[i + 1] === '\n') i++;
			row.push(cell); cell = '';
			if (row.some((c) => c.trim())) rows.push(row);
			row = [];
		} else cell += ch;
	}
	row.push(cell);
	if (row.some((c) => c.trim())) rows.push(row);
	return rows.map((r) => r.map((c) => c.trim()));
}

export type CustomerField = 'name' | 'contact' | 'email' | 'phone' | 'street' | 'postal' | 'city';
export const customerFields: { key: CustomerField; label: string; hints: RegExp }[] = [
	{ key: 'name', label: 'Kundenname', hints: /^(name|kunde|kundenname|firma|firmenname|unternehmen|company)$/i },
	{ key: 'contact', label: 'Ansprechperson', hints: /ansprech|kontakt|contact|person|vorname|nachname/i },
	{ key: 'email', label: 'E-Mail', hints: /mail/i },
	{ key: 'phone', label: 'Telefon', hints: /tel|phone|mobil|handy/i },
	{ key: 'street', label: 'Straße', hints: /stra(ß|ss)e|adresse|street|anschrift/i },
	{ key: 'postal', label: 'PLZ', hints: /plz|postleit|zip/i },
	{ key: 'city', label: 'Ort', hints: /^(ort|stadt|city)$|ort$/i }
];
/** Ordnet Kopfzeilen automatisch den Feldern zu (Index oder -1). */
export function guessMapping(header: string[]): Record<CustomerField, number> {
	const used = new Set<number>();
	const map = {} as Record<CustomerField, number>;
	for (const f of customerFields) {
		const i = header.findIndex((h, idx) => !used.has(idx) && f.hints.test(h));
		map[f.key] = i;
		if (i >= 0) used.add(i);
	}
	return map;
}
