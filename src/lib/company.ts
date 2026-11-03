/** Absenderdaten des Betriebs. DEMO-Werte – in Phase C kommen sie aus den Einstellungen. */
export const company = {
	name: 'Gebäude-Reinigung',
	owner: 'Anetta R.',
	street: 'Musterstraße 1',
	postal: '12345',
	city: 'Musterstadt',
	phone: '0123 456789',
	email: 'info@example.com',
	web: 'www.example.com',
	bank: 'Musterbank',
	iban: 'DE00 0000 0000 0000 0000 00',
	bic: 'MUSTDE00XXX',
	taxId: 'USt-IdNr. DE000000000'
};
export type Company = typeof company;
