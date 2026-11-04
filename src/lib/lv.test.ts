import { describe, expect, it } from 'vitest';
import { addVersion, diffLv, dueAtVisit, dueLvItems, lvAt, lvKey } from './lv.ts';
import { createDemoData } from './demo.ts';
import type { Site } from './types.ts';

const site = (): Site => ({ id: 's', name: 'x', street: '', postal: '', city: '', note: '', plan: null });
describe('Leistungsverzeichnis', () => {
	it('gültiger Stand hängt vom Datum ab', () => {
		const s = site();
		const v1 = addVersion(s, '2026-01-01', 'Start', 'A');
		expect(v1.ok).toBe(true);
		s.lv![0].items.push({ id: 'i1', room: 'Flur', task: 'Boden wischen', interval: 'taeglich', areaM2: 20, note: '' });
		const v2 = addVersion(s, '2026-07-01', 'Fenster dazu', 'A');
		expect(v2.ok).toBe(true);
		s.lv![1].items.push({ id: 'i2', room: 'Flur', task: 'Fenster', interval: 'monatlich', areaM2: null, note: '' });
		expect(lvAt(s, '2025-12-31')).toBeNull();
		expect(lvAt(s, '2026-06-30')!.items).toHaveLength(1);
		expect(lvAt(s, '2026-07-01')!.items).toHaveLength(2);
	});
	it('neue Version kopiert den letzten Stand und darf nicht rückwirkend vor dem letzten beginnen', () => {
		const s = site();
		addVersion(s, '2026-05-01', '', 'A');
		s.lv![0].items.push({ id: 'i1', room: 'Büro', task: 'Saugen', interval: 'taeglich', areaM2: null, note: '' });
		const r = addVersion(s, '2026-05-01', '', 'A');
		expect(r.ok).toBe(false);
		const ok = addVersion(s, '2026-06-01', '', 'A');
		expect(ok.ok && ok.version.items[0].task).toBe('Saugen');
		expect(ok.ok && ok.version.items[0].id).not.toBe('i1');
	});
	it('Vergleich findet neu, entfernt und geändert', () => {
		const s = site();
		addVersion(s, '2026-01-01', '', 'A');
		s.lv![0].items.push({ id: 'a', room: 'WC', task: 'Reinigen', interval: 'taeglich', areaM2: null, note: '' }, { id: 'b', room: 'Küche', task: 'Boden', interval: 'woechentlich', areaM2: null, note: '' });
		const v2 = addVersion(s, '2026-02-01', '', 'A');
		if (!v2.ok) throw new Error();
		v2.version.items = v2.version.items.filter((i) => i.task !== 'Boden');
		v2.version.items.find((i) => i.task === 'Reinigen')!.interval = 'woechentlich';
		v2.version.items.push({ id: 'n', room: 'Flur', task: 'Fenster', interval: 'monatlich', areaM2: null, note: '' });
		const d = diffLv(s.lv![0], v2.version);
		expect(d.added.map((i) => i.task)).toEqual(['Fenster']);
		expect(d.removed.map((i) => i.task)).toEqual(['Boden']);
		expect(d.changed).toHaveLength(1);
	});
	it('Fälligkeit am Einsatztag', () => {
		const item = (interval: any) => ({ id: 'x', room: '', task: '', interval, areaM2: null, note: '' });
		expect(dueAtVisit(item('taeglich'), '2026-11-04', [0, 2])).toBe(true);
		expect(dueAtVisit(item('woechentlich'), '2026-11-02', [0, 2])).toBe(true); // Montag = erster Einsatztag
		expect(dueAtVisit(item('woechentlich'), '2026-11-04', [0, 2])).toBe(false);
		expect(dueAtVisit(item('monatlich'), '2026-11-02', [0])).toBe(false);
	});
	it('periodische Leistungen werden fällig, nach Erledigung wandert das Datum', () => {
		const d = createDemoData(8);
		const site = d.customers[0].sites.find((s) => s.plan)!;
		site.lv![0].validFrom = '2026-06-01';
		const quarter = site.lv![0].items.find((i) => i.interval === 'quartal')!;
		const key = lvKey(quarter);
		const today = '2026-11-04';
		const first = dueLvItems(d, today, 0).find((x) => x.site.id === site.id && x.key === key);
		expect(first).toBeDefined(); // Version beginnt vor 120 Tagen, Quartal ist abgelaufen
		d.serviceRecords = [{ id: 'r', siteId: site.id, date: '2026-11-03', execution: 'vollstaendig', missedItemIds: [], executionNote: '', lvVersionId: null, acceptance: 'offen', acceptedBy: '', acceptedOn: null, acceptNote: '', history: [], doneKeys: [key] }];
		expect(dueLvItems(d, today, 0).some((x) => x.site.id === site.id && x.key === key)).toBe(false);
		expect(dueLvItems(d, '2027-02-10', 0).some((x) => x.site.id === site.id && x.key === key)).toBe(true);
	});
});
