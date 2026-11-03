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
	<div class="flex items-baseline justify-between gap-3 border-b border-line px-4 py-2.5">
		<h2 class="text-sm font-bold tracking-wide text-accent uppercase">Ablauf</h2>
		<p class="text-xs text-muted">{total} {total === 1 ? 'Vorgang' : 'Vorgänge'} unterwegs · jeder Vorgang steht an genau einem Schritt{#if active} · <button class="underline" onclick={() => onpick?.(null)}>Filter aufheben</button>{/if}</p>
	</div>
	<ol class="flex overflow-x-auto">
		{#each stepOrder as k, i (k)}
			{@const n = counts[k]}
			{@const on = active === k}
			<li class="flex min-w-[104px] flex-1 items-stretch">
				{#if onpick}
					<button class="flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition-colors hover:bg-subtle {on ? 'bg-accent-soft' : ''}" aria-pressed={on} onclick={() => onpick(on ? null : k)} title={hint[k] ?? ''}>
						{@render cell(k, i, n, on)}
					</button>
				{:else}
					<a class="flex w-full flex-col items-start gap-0.5 px-4 py-3 transition-colors hover:bg-subtle" href="/vorgaenge?schritt={k}" title={hint[k] ?? ''}>
						{@render cell(k, i, n, on)}
					</a>
				{/if}
				{#if i < stepOrder.length - 1}<span class="grid shrink-0 place-items-center text-faint" aria-hidden="true"><ChevronRight size={14} /></span>{/if}
			</li>
		{/each}
	</ol>
</nav>

{#snippet cell(k: StepKey, i: number, n: number, on: boolean)}
	<span class="text-[0.7rem] font-semibold text-faint">{i + 1}</span>
	<span class="text-sm font-semibold {on ? 'text-accent-text' : ''}">{stepLabels[k]}</span>
	<span class="num text-2xl leading-none font-bold {n === 0 ? 'text-faint' : k === 'anfrage' && n ? 'text-warn' : ''}">{n}</span>
	{#if !compact}<span class="text-[0.7rem] leading-tight text-muted">{n ? (hint[k] ?? (n === 1 ? 'Vorgang' : 'Vorgänge')) : 'frei'}</span>{/if}
{/snippet}
