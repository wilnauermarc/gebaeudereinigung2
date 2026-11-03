import { describe, expect, it } from 'vitest';
import { buildXRechnung } from './xrechnung';
import { company } from '../company';

const customer = { name: 'Praxis Dr. <Müller> & Co', street: 'Weg 1', postal: '12345', city: 'Ort', contacts: [{ id: 'c', name: 'A', role: '', email: 'a@b.de', phone: '' }] };
const invoice = { number: 'R-1', issuedOn: '2026-10-16', dueOn: '2026-10-30', netCents: 398000, period: '2026-02', description: 'Reinigung' };

describe('XRechnung-Entwurf', () => {
	const xml = buildXRechnung({ company, customer, invoice });
	it('rechnet Steuer und Brutto richtig', () => {
		expect(xml).toContain('<cbc:TaxAmount currencyID="EUR">756.20</cbc:TaxAmount>');
		expect(xml).toContain('<cbc:PayableAmount currencyID="EUR">4736.20</cbc:PayableAmount>');
	});
	it('maskiert Sonderzeichen und setzt Pflichtkennungen', () => {
		expect(xml).toContain('Praxis Dr. &lt;Müller&gt; &amp; Co');
		expect(xml).toContain('xrechnung_3.0');
		expect(xml).toContain('<cbc:EndDate>2026-02-28</cbc:EndDate>');
	});
	it('ist wohlgeformtes XML', () => {
		const stack: string[] = [];
		for (const m of xml.replace(/<\?xml[^>]*\?>/, '').matchAll(/<(\/?)([\w:]+)[^>]*?(\/?)>/g)) {
			if (m[3]) continue;
			if (m[1]) expect(stack.pop()).toBe(m[2]);
			else stack.push(m[2]);
		}
		expect(stack).toEqual([]);
	});
});
