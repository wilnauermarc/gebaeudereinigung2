<script lang="ts">
	let { bars, format, height = 140 }: { bars: { label: string; value: number; highlight?: boolean }[]; format: (v: number) => string; height?: number } = $props();
	const W = 560, padB = 22, padT = 14;
	const max = $derived(Math.max(1, ...bars.map((b) => b.value)));
	const slot = $derived(W / bars.length);
	const bw = $derived(Math.min(36, slot * 0.58));
	let hover = $state<number | null>(null);
</script>

<div class="relative">
	<svg viewBox="0 0 {W} {height}" class="w-full" role="img" aria-label="Balkendiagramm: {bars.map((b) => `${b.label} ${format(b.value)}`).join(', ')}">
		<line x1="0" x2={W} y1={height - padB} y2={height - padB} stroke="var(--line)" />
		{#each bars as b, i}
			{@const h = (b.value / max) * (height - padB - padT)}
			<rect
				x={i * slot + (slot - bw) / 2} y={height - padB - h} width={bw} height={Math.max(h, 0)} rx="4"
				fill={b.highlight ? 'var(--accent)' : 'var(--accent)'} opacity={hover === null || hover === i ? (b.highlight ? 1 : 0.55) : 0.3}
				role="presentation" onmouseenter={() => (hover = i)} onmouseleave={() => (hover = null)}
			/>
			<text x={i * slot + slot / 2} y={height - 6} text-anchor="middle" font-size="10" fill="var(--faint)">{b.label}</text>
		{/each}
	</svg>
	{#if hover !== null}
		<div class="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md bg-fg px-2 py-1 text-xs text-bg shadow-[var(--shadow-pop)]" style="left: {((hover + 0.5) * slot / W) * 100}%">
			{bars[hover].label}: <strong class="num">{format(bars[hover].value)}</strong>
		</div>
	{/if}
</div>
