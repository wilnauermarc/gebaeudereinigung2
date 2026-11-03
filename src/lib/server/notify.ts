/** Mitteilungen rund um den Schichttausch. Es werden nur Daten gespeichert, die die Person ohnehin in der App sieht. */
import { randomUUID } from 'node:crypto';
import { canTake, shiftAt } from '../swap.ts';
import type { Store } from './store.ts';

export interface SwapEvent { swapId: string; siteId: string; date: string; offeredBy: string; takenBy: string | null }
type Kind = 'offer' | 'taken' | 'withdrawn' | 'approved' | 'rejected';

export function notifySwap(s: Store, d: any, kind: Kind, e: SwapEvent) {
	const sh = shiftAt(d, e.siteId, e.date);
	if (!sh) return;
	const first = (id: string | null) => (d.employees.find((x: any) => x.id === id)?.name ?? '').split(' ')[0];
	const base = { date: e.date, time: sh.start, customer: sh.customer.length > 44 ? sh.customer.slice(0, 43) + '…' : sh.customer, site: sh.site };
	const add = (emp: string, k: string, extra: Record<string, unknown> = {}) => s.notifyAdd({ id: randomUUID(), employeeId: emp, kind: k, ref: e.swapId, payload: { ...base, ...extra } });
	if (kind === 'offer') {
		// Alle mit Zugang, die den Einsatz übernehmen dürfen
		for (const emp of s.employeesWithAccess()) if (emp !== e.offeredBy && canTake(d, emp, e.siteId, e.date).ok) add(emp, 'swap_offer', { by: first(e.offeredBy) });
	} else if (kind === 'taken') {
		s.notifyDropRef(e.swapId, 'swap_offer'); // das Angebot ist vergeben, die Hinweise an andere verschwinden
		add(e.offeredBy, 'swap_taken', { other: first(e.takenBy) });
	} else if (kind === 'withdrawn') {
		s.notifyDropRef(e.swapId, 'swap_offer');
		if (e.takenBy) add(e.takenBy, 'swap_withdrawn', { other: first(e.offeredBy) });
	} else {
		const k = kind === 'approved' ? 'swap_approved' : 'swap_rejected';
		add(e.offeredBy, k); if (e.takenBy) add(e.takenBy, k);
	}
}
