import { describe, expect, it } from 'vitest';
import { guessMapping, parseCsv } from './csv';

describe('CSV-Import', () => {
	it('liest Semikolon-getrennt mit Anführungszeichen und BOM', () => {
		const rows = parseCsv('﻿Name;Straße;PLZ;Ort\r\n"Müller; GmbH";Hauptstr. 1;12345;Musterstadt\r\nKita "Sonne";Weg 2;12346;Neustadt');
		expect(rows).toHaveLength(3);
		expect(rows[1][0]).toBe('Müller; GmbH');
		expect(rows[2][0]).toBe('Kita Sonne');
	});
	it('erkennt Komma und Tabulator', () => {
		expect(parseCsv('a,b,c\n1,2,3')[1]).toEqual(['1', '2', '3']);
		expect(parseCsv('a\tb\n1\t2')[1]).toEqual(['1', '2']);
	});
	it('ordnet typische Kopfzeilen zu', () => {
		const m = guessMapping(['Firma', 'Ansprechpartner', 'E-Mail', 'Telefon', 'Straße', 'PLZ', 'Ort']);
		expect(m).toMatchObject({ name: 0, contact: 1, email: 2, phone: 3, street: 4, postal: 5, city: 6 });
	});
	it('lässt unbekannte Spalten unzugeordnet', () => {
		expect(guessMapping(['Foo', 'Bar']).name).toBe(-1);
	});
});
