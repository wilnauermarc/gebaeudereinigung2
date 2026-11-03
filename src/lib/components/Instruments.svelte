<script lang="ts">
	import type { Instrument } from '#lib/ux.ts';
	import { countUp } from '#lib/countup.ts';
	let { items }: { items: Instrument[] } = $props();
	const SIZE = 62;
	const R = SIZE / 2 - 6;
	const C = 2 * Math.PI * R;
	const col = (v: number, good = 0.75, warn = 0.5) => (v >= good ? 'var(--success)' : v >= warn ? 'var(--warn)' : 'var(--danger)');
	const statColor = { danger: 'text-danger', warn: 'text-warn', success: 'text-success', '': '' } as const;
</script>

<div class="mt-4 grid gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-[var(--shadow-card)]" style="grid-template-columns: repeat(auto-fit, minmax(190px, 1fr))" role="list" aria-label="Kennzahlen dieser Seite">
	{#each items as it}
		<svelte:element this={it.href ? 'a' : 'div'} href={it.href} role="listitem" class="flex items-center gap-3.5 bg-surface px-4 py-3 {it.href ? 'transition-colors hover:bg-subtle/60' : ''}">
			{#if it.kind === 'gauge'}
				{@const v = Math.max(0, Math.min(1, it.value))}
				{@const mid = Math.max(0, Math.min(1, it.shown ?? it.value))}
				<div class="relative shrink-0" style="width:{SIZE}px;height:{SIZE}px">
					<svg width={SIZE} height={SIZE} viewBox="0 0 {SIZE} {SIZE}" aria-hidden="true">
						<circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--subtle)" stroke-width="6" />
						<circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={col(v, it.good, it.warn)} stroke-width="6" stroke-linecap="round" stroke-dasharray="{v * C} {C}" transform="rotate(-90 {SIZE / 2} {SIZE / 2})" style="transition: stroke-dasharray .9s cubic-bezier(.2,.8,.2,1)" />
					</svg>
					<span class="num absolute inset-0 grid place-items-center text-[0.95rem] font-bold" use:countUp={{ value: mid * 100, format: (n) => `${Math.round(n)}%` }}>{Math.round(mid * 100)}%</span>
				</div>
				<div class="min-w-0"><p class="text-sm font-semibold">{it.label}</p>{#if it.sub}<p class="truncate text-xs text-muted">{it.sub}</p>{/if}</div>
			{:else}
				<div class="min-w-0"><p class="text-xs text-muted">{it.label}</p><p class="num text-[1.55rem] leading-tight font-bold tracking-tight {statColor[it.tone ?? '']}">{it.value}</p>{#if it.sub}<p class="truncate text-xs text-muted">{it.sub}</p>{/if}</div>
			{/if}
		</svelte:element>
	{/each}
</div>
