<script lang="ts">
	import { goto } from '$app/navigation';
	import { db } from '#lib/db.svelte.ts';
	import { caseNet, caseStatus, stepLabels, stepOrder, type CaseStatus, type StepKey } from '#lib/cases.ts';
	import { formatEur, relativeTime } from '#lib/format.ts';
	import type { Case, Customer } from '#lib/types.ts';
	import Avatar from './Avatar.svelte';
	import { Check, Minus, X } from '@lucide/svelte';

	type Row = { c: Case; s: CaseStatus; customer: Customer | undefined };
	/** rows: darzustellende Vorgänge; active/onpick: Schritt-Filter über die Spaltenköpfe; compact: ohne Wert- und Zuständig-Spalte */
	let { rows, active = null, onpick, compact = false }: { rows: Row[]; active?: StepKey | null; onpick?: (k: StepKey | null) => void; compact?: boolean } = $props();

	const counts = $derived.by(() => {
		const out = Object.fromEntries(stepOrder.map((k) => [k, 0])) as Record<StepKey, number>;
		for (const c of db.data.cases) { const s = caseStatus(db.data, c); if (!s.closed && s.current) out[s.current]++; }
		return out;
	});
	const cols = $derived(`grid-template-columns: minmax(250px, 1.7fr) repeat(8, minmax(82px, 1fr))${compact ? '' : ' minmax(150px, 0.9fr)'}`);
	const closedLabel = { abgesagt: 'Abgesagt', abgelehnt: 'Abgelehnt', abgeschlossen: 'Abgeschlossen' } as const;
</script>

<div class="card overflow-x-auto">
	<div class="min-w-[1100px]">
		<!-- Kopf: die acht Schritte; ein Klick filtert die Liste auf Vorgänge an diesem Schritt -->
		<div class="grid items-end gap-x-1 border-b border-line bg-subtle/50 px-4 py-2.5" style={cols}>
			<span class="section-label">Vorgang</span>
			{#each stepOrder as k (k)}
				{@const on = active === k}
				{#snippet head()}
					<span class="text-[0.74rem] leading-tight font-semibold {on ? 'text-accent-text' : 'text-fg'}">{stepLabels[k]}</span>
					<span class="num min-w-6 rounded-full px-2 py-px text-[0.68rem] font-bold {counts[k] ? 'bg-accent' : 'bg-line text-faint'}" style={counts[k] ? 'color: var(--accent-ink)' : ''} title="{counts[k]} {counts[k] === 1 ? 'Vorgang steht' : 'Vorgänge stehen'} an diesem Schritt">{counts[k]}</span>
				{/snippet}
				{#if onpick}
					<button class="flex h-full flex-col items-center justify-end gap-1 rounded-lg px-1 py-1.5 text-center transition hover:bg-surface {on ? 'bg-surface shadow-sm ring-2 ring-accent' : ''}" aria-pressed={on} onclick={() => onpick(on ? null : k)} title="Nur Vorgänge an diesem Schritt zeigen">{@render head()}</button>
				{:else}
					<a href="/vorgaenge?schritt={k}" class="flex h-full flex-col items-center justify-end gap-1 rounded-lg px-1 py-1.5 text-center transition hover:bg-surface">{@render head()}</a>
				{/if}
			{/each}
			{#if !compact}<span class="section-label text-right">Stand</span>{/if}
		</div>

		<ul class="divide-y divide-line">
			{#each rows as { c, s, customer } (c.id)}
				<li>
					<a href="/vorgaenge/{c.id}" class="grid items-center gap-x-1 px-4 py-3.5 transition-colors hover:bg-accent-soft/50" style={cols} aria-label="{c.title}, {s.closed ? closedLabel[s.closed] : stepLabels[s.current!]}">
						<div class="flex min-w-0 items-center gap-3 pr-3">
							<Avatar name={customer?.name ?? ''} size={34} />
							<div class="min-w-0">
								<p class="line-clamp-2 leading-snug font-semibold">{c.title}</p>
								<p class="truncate text-xs text-muted">{c.number} · {customer?.name}</p>
							</div>
						</div>
						{#each s.steps as st, i (st.key)}
							{@const prev = i > 0 ? s.steps[i - 1].state : null}
							{@const reached = st.state === 'done' || st.state === 'skipped' || st.state === 'current' || st.state === 'ended'}
							<div class="relative grid h-10 place-items-center">
								{#if i > 0}<span class="absolute top-1/2 right-1/2 left-[-50%] h-[3px] -translate-y-1/2 rounded-full {reached && (prev === 'done' || prev === 'skipped') ? 'bg-accent' : 'bg-line'}" aria-hidden="true"></span>{/if}
								{#if st.state === 'done'}
									<span class="relative grid size-7 place-items-center rounded-full bg-accent" style="color: var(--accent-ink)" title="{stepLabels[st.key]}: erledigt"><Check size={15} strokeWidth={3} /></span>
								{:else if st.state === 'current'}
									<span class="relative grid size-9 place-items-center rounded-full bg-accent shadow-[0_0_0_5px_var(--accent-soft),0_8px_18px_-6px_rgb(240_176_0/0.95)]" style="color: var(--accent-ink)" title="{stepLabels[st.key]}: jetzt dran"><span class="size-2.5 rounded-full bg-current"></span></span>
								{:else if st.state === 'skipped'}
									<span class="relative grid size-6 place-items-center rounded-full border-2 border-dashed border-accent/60 bg-surface text-accent-text" title="{stepLabels[st.key]}: nicht nötig"><Minus size={12} strokeWidth={3} /></span>
								{:else if st.state === 'ended'}
									<span class="relative grid size-7 place-items-center rounded-full bg-danger text-white" title="{stepLabels[st.key]}: beendet"><X size={15} strokeWidth={3} /></span>
								{:else}
									<span class="relative size-5 rounded-full border-2 border-line bg-surface" title="{stepLabels[st.key]}: folgt noch"></span>
								{/if}
							</div>
						{/each}
						{#if !compact}
							<div class="pl-3 text-right">
								<p class="num text-sm font-semibold">{caseNet(db.data, c) ? formatEur(caseNet(db.data, c)) : '–'}</p>
								<p class="text-xs leading-snug text-muted">{c.assignee}</p><p class="text-xs leading-snug text-faint">{relativeTime(c.createdAt)}</p>
							</div>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</div>
