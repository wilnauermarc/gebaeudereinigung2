import { describe, expect, it } from 'vitest';
import { steps } from './tour.svelte';

describe('Rundgang', () => {
	it('hat 7 Schritte mit Titel, Text und gültigem Ziel', () => {
		expect(steps).toHaveLength(7);
		for (const s of steps) {
			expect(s.title.length).toBeGreaterThan(5);
			expect(s.lines.length).toBeGreaterThan(0);
			if (s.href) expect(s.href.startsWith('/')).toBe(true);
		}
	});
});
