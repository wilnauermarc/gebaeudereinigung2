<script lang="ts">
	/** Kleines, abhängigkeitsfreies Flächen-/Stufendiagramm mit Achsenbeschriftung und Tooltip per title. */
	let { points, format, height = 140, step = false }: { points: { label: string; value: number }[]; format: (v: number) => string; height?: number; step?: boolean } = $props();
	const W = 560, padL = 6, padR = 6, padT = 12, padB = 22;
	const max = $derived(Math.max(1, ...points.map((p) => p.value)));
	const x = (i: number) => padL + (points.length > 1 ? (i / (points.length - 1)) * (W - padL - padR) : 0);
	const y = (v: number) => padT + (1 - v / (max * 1.1)) * (height - padT - padB);
	const line = $derived(
		points.map((p, i) => (i === 0 ? `M${x(i)},${y(p.value)}` : step ? `H${x(i)}V${y(p.value)}` : `L${x(i)},${y(p.value)}`)).join('')
	);
	const area = $derived(`${line}L${x(points.length - 1)},${height - padB}L${x(0)},${height - padB}Z`);
	let hover = $state<number | null>(null);
</script>

<div class="relative">
	<svg viewBox="0 0 {W} {height}" class="w-full" role="img" aria-label="Verlauf: {points.map((p) => `${p.label} ${format(p.value)}`).join(', ')}">
		<defs>
			<linearGradient id="ac-fill" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="var(--accent)" stop-opacity="0.22" />
				<stop offset="100%" stop-color="var(--accent)" stop-opacity="0.02" />
			</linearGradient>
		</defs>
		{#each [0, 0.5, 1] as g}
			<line x1={padL} x2={W - padR} y1={y(max * g)} y2={y(max * g)} stroke="var(--line)" stroke-dasharray={g === 0 ? '' : '3 4'} />
		{/each}
		<path d={area} fill="url(#ac-fill)" />
		<path d={line} fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" />
		{#each points as p, i}
			<rect x={x(i) - 14} y="0" width="28" height={height} fill="transparent" role="presentation" onmouseenter={() => (hover = i)} onmouseleave={() => (hover = null)} />
			{#if hover === i || i === points.length - 1}
				<circle cx={x(i)} cy={y(p.value)} r="3.5" fill="var(--surface)" stroke="var(--accent)" stroke-width="2" />
			{/if}
			{#if i % Math.ceil(points.length / 6) === 0 || i === points.length - 1}
				<text x={x(i)} y={height - 6} text-anchor="middle" font-size="10" fill="var(--faint)">{p.label}</text>
			{/if}
		{/each}
	</svg>
	{#if hover !== null}
		<div class="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md bg-fg px-2 py-1 text-xs text-bg shadow-[var(--shadow-pop)]" style="left: {(x(hover) / W) * 100}%">
			{points[hover].label}: <strong class="num">{format(points[hover].value)}</strong>
		</div>
	{/if}
</div>
