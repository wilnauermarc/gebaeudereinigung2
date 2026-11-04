import { describe, expect, it } from 'vitest';
import { createDemoData } from './demo.ts';
import { extraNet, invoiceExtras, moveExtra, newExtra, releaseExtras, unbilledCents } from './extras.ts';
import type { ExtraService } from './types.ts';

const base = { customerId: 'k1', siteId: null, title: 'Fensterreinigung Treppenhaus', description: '', qty: 2, unit: 'Std.' as const, unitCents: 3800, orderedBy: 'Frau Muster', date: '2026-10-12', alreadyOrdered: false };
function make(over: Partial<typeof base> = {}): ExtraService { const e = newExtra({ ...base, ...over }, 'A', '2026-10-12'); if (typeof e === 'string') throw new Error(e); return e; }
describe('Zusatzleistungen', () => {
	it('prüft Eingaben', () => {
		expect(newExtra({ ...base, title: 'x' }, 'A', '2026-10-12')).toMatch(/benennen/);
		expect(newExtra({ ...base, qty: 0 }, 'A', '2026-10-12')).toMatch(/Menge/);
		expect(newExtra({ ...base, alreadyOrdered: true, orderedBy: '' }, 'A', '2026-10-12')).toMatch(/beauftragt/);
		expect(make({ alreadyOrdered: true }).status).toBe('beauftragt');
		expect(make().status).toBe('angefragt');
	});
	it('geht Schritt für Schritt von angefragt bis ausgeführt', () => {
		const e = make();
		expect(moveExtra(e, 'ausgefuehrt', { by: 'A', executedOn: '2026-10-12' }, '2026-10-12')).toMatch(/nicht direkt/);
		expect(moveExtra(e, 'beauftragt', { by: 'A', orderedBy: '' }, '2026-10-12')).toMatch(/wer/);
		expect(moveExtra(e, 'beauftragt', { by: 'A', orderedBy: 'Frau Muster' }, '2026-10-12')).toBeNull();
		expect(moveExtra(e, 'ausgefuehrt', { by: 'A', executedOn: '2026-10-20' }, '2026-10-12')).toMatch(/Zukunft/);
		expect(moveExtra(e, 'ausgefuehrt', { by: 'A', executedOn: '2026-10-12' }, '2026-10-12')).toBeNull();
		expect(e.history.length).toBe(3);
	});
	it('Ablehnen braucht eine Begründung', () => {
		const e = make();
		expect(moveExtra(e, 'abgelehnt', { by: 'A' }, '2026-10-12')).toMatch(/begründen/);
		expect(moveExtra(e, 'abgelehnt', { by: 'A', reason: 'Kunde will doch nicht' }, '2026-10-12')).toBeNull();
	});
	it('Rechnung: nur ausgeführte, nur ein Kunde, Summe und Verknüpfung', () => {
		const d = createDemoData(8); d.extras = [];
		const a = make({ alreadyOrdered: true }), b = make({ alreadyOrdered: true, title: 'Grundreinigung Teeküche', qty: 1, unit: 'pauschal' as any, unitCents: 9000 }), c = make({ alreadyOrdered: true, customerId: 'k2' });
		d.extras.push(a, b, c);
		for (const e of [a, b, c]) moveExtra(e, 'ausgefuehrt', { by: 'A', executedOn: '2026-10-12' }, '2026-10-12');
		expect(unbilledCents(d)).toBe(extraNet(a) + extraNet(b) + extraNet(c));
		expect(invoiceExtras(d, [a.id, c.id], '2026-10-13', '2026-10-27', 'R-1')).toMatch(/einen Kunden/);
		const inv = invoiceExtras(d, [a.id, b.id], '2026-10-13', '2026-10-27', 'R-2026-9999');
		if (typeof inv === 'string') throw new Error(inv);
		expect(inv.netCents).toBe(7600 + 9000);
		expect(inv.description).toContain('Fensterreinigung Treppenhaus');
		expect(a.status).toBe('abgerechnet'); expect(a.invoiceId).toBe(inv.id);
		expect(invoiceExtras(d, [a.id], '2026-10-13', '2026-10-27', 'R-3')).toMatch(/ausgeführte/);
		expect(moveExtra(a, 'beauftragt', { by: 'A' }, '2026-10-13')).toMatch(/Rechnung stornieren/);
		expect(unbilledCents(d)).toBe(extraNet(c));
	});
	it('Storno macht abgerechnete Zusatzleistungen wieder abrechenbar', () => {
		const d = createDemoData(8); d.extras = [];
		const a = make({ alreadyOrdered: true }); d.extras.push(a);
		moveExtra(a, 'ausgefuehrt', { by: 'A', executedOn: '2026-10-12' }, '2026-10-12');
		const inv = invoiceExtras(d, [a.id], '2026-10-13', '2026-10-27', 'R-9') as any;
		expect(releaseExtras(d, inv.id)).toBe(1);
		expect(a.status).toBe('ausgefuehrt'); expect(a.invoiceId).toBeNull();
	});
});
