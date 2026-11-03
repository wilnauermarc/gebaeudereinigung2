/** Svelte-Action: zählt eine Zahl in `node` kurz hoch (respektiert „weniger Bewegung“). Format über `format`. */
export function countUp(node: HTMLElement, opts: { value: number; format: (n: number) => string; ms?: number }) {
	let raf = 0;
	let shown = 0;
	function run(o: typeof opts) {
		cancelAnimationFrame(raf);
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) { node.textContent = o.format(o.value); shown = o.value; return; }
		const from = shown, start = performance.now(), ms = o.ms ?? 700;
		const tick = (t: number) => {
			const p = Math.min(1, (t - start) / ms);
			const e = 1 - Math.pow(1 - p, 3);
			shown = from + (o.value - from) * e;
			node.textContent = o.format(shown);
			if (p < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
	}
	run(opts);
	return { update: run, destroy: () => cancelAnimationFrame(raf) };
}
