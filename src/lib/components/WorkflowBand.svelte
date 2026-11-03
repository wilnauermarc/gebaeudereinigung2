<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import { caseStatus, stepLabels, stepOrder, type StepKey } from '#lib/cases.ts';
	import { ChevronRight } from '@lucide/svelte';

	/** aktiver Schritt (Filter) und Reaktion auf Klick; ohne onpick sind die Felder Links zur Vorgangsliste */
	let { active = null, onpick, compact = false }: { active?: StepKey | null; onpick?: (k: StepKey | null) => void; compact?: boolean } = $props();

	const counts = $derived.by(() => {
		const out = Object.fromEntries(stepOrder.map((k) => [k, 0])) as Record<StepKey, number>;
		for (const c of db.data.cases) { const s = caseStatus(db.data, c); if (!s.closed && s.current) out[s.current]++; }
		return out;
	});
	const total = $derived(stepOrder.reduce((n, k) => n + counts[k], 0));
	/** Was hier wartet, braucht eine Entscheidung von Ihnen (Anfrage) oder eine Antwort des Kunden (Rückmeldung) */
	const hint: Partial<Record<StepKey, string>> = { anfrage: 'wartet auf Ihre Entscheidung', rueckmeldung: 'wartet auf den Kunden' };
</script>

<nav class="card mb-5 overflow-hidden" aria-label="Ablauf der Vorgänge">
	<div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-5 pt-4">
		<h2 class="card-title">Ablauf der Vorgänge</h2>
		<p class="text-xs text-muted"><strong class="num text-fg">{total}</strong> {total === 1 ? 'Vorgang' : 'Vorgänge'} unterwegs{#if active} · <button class="font-semibold underline decoration-accent decoration-2 underline-offset-2" onclick={() => onpick?.(null)}>Filter aufheben</button>{/if}</p>
	</div>
	<ol class="flex overflow-x-auto px-3 pt-3 pb-4">
		{#each stepOrder as k, i (k)}
			{@const n = counts[k]}
			{@const on = active === k}
			<li class="relative flex min-w-[96px] flex-1 flex-col items-center">
				{#if i > 0}<span class="absolute top-[22px] right-1/2 left-[-50%] h-0.5 rounded-full {counts[stepOrder[i - 1]] || n ? 'bg-accent/60' : 'bg-line'}" aria-hidden="true"></span>{/if}
				{#if onpick}
					<button class="group relative flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-1 text-center transition" aria-pressed={on} onclick={() => onpick(on ? null : k)} title={hint[k] ?? ''}>
						{@render cell(k, i, n, on)}
					</button>
				{:else}
					<a class="group relative flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-1 text-center transition" href="/vorgaenge?schritt={k}" title={hint[k] ?? ''}>
						{@render cell(k, i, n, on)}
					</a>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

{#snippet cell(k: StepKey, i: number, n: number, on: boolean)}
	<span class="num relative z-10 grid size-11 place-items-center rounded-full border-2 text-lg font-bold transition group-hover:-translate-y-0.5 {n ? 'border-accent bg-accent shadow-[0_8px_18px_-8px_rgb(240_176_0/0.95)]' : 'border-line bg-surface text-faint'} {on ? 'ring-4 ring-accent/30' : ''}" style={n ? 'color: var(--accent-ink)' : ''}>{n}</span>
	<span class="text-[0.8rem] leading-tight font-semibold {on ? 'text-accent-text' : n ? '' : 'text-muted'}">{stepLabels[k]}</span>
	{#if !compact}<span class="text-[0.68rem] leading-tight text-muted">{n && hint[k] ? hint[k] : `Schritt ${i + 1}`}</span>{/if}
{/snippet}
