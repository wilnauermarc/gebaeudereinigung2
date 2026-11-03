<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import { deadlines, type DeadlineKind } from '#lib/fristen.ts';
	import { todayKey, formatDate, dayDiff, relativeDay } from '#lib/format.ts';
	import Badge from '#lib/components/Badge.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { CalendarClock, Info } from '@lucide/svelte';

	const today = todayKey();
	let kind = $state<DeadlineKind | 'alle'>('alle');
	const all = $derived(deadlines(db.data, today));
	const rows = $derived(all.filter((x) => kind === 'alle' || x.kind === kind));
	const overdue = $derived(rows.filter((x) => x.date < today));
	const upcoming = $derived(rows.filter((x) => x.date >= today));
	const months = $derived.by(() => {
		const by = new Map<string, typeof upcoming>();
		for (const x of upcoming) (by.get(x.date.slice(0, 7)) ?? by.set(x.date.slice(0, 7), []).get(x.date.slice(0, 7))!).push(x);
		return [...by.entries()];
	});
	const label = (m: string) => new Date(m + '-15T12:00:00Z').toLocaleDateString('de-DE', { month: 'long', year: 'numeric', timeZone: 'UTC' });
	const kinds: [DeadlineKind | 'alle', string][] = [['alle', 'Alle'], ['vertrag', 'Verträge'], ['kunde', 'Kunden'], ['personal', 'Personal'], ['betrieb', 'Betrieb'], ['gesetz', 'Gesetz und Steuer']];
	const tone = (d: string) => (d < today ? 'danger' : dayDiff(d) <= 14 ? 'warn' : 'neutral') as 'danger' | 'warn' | 'neutral';
	import PageHead from '#lib/components/PageHead.svelte';
</script>

<svelte:head><title>Fristen · Resch Business Manager</title></svelte:head>

<PageHead title="Fristenkalender" subtitle={`Alle Termine der nächsten 12 Monate an einem Ort: Verträge, Nachweise, Unterweisungen, Prüfungen, Zahlungen und gesetzliche Stichtage.`}>
</PageHead>

<div class="mb-4 flex flex-wrap gap-1" role="group" aria-label="Nach Bereich filtern">
	{#each kinds as [id, l]}<button class="btn btn-sm {kind === id ? 'border-accent bg-accent text-white' : ''}" aria-pressed={kind === id} onclick={() => (kind = id)}>{l}</button>{/each}
</div>

{#if overdue.length}
	<section class="card mb-4 border-danger/40" aria-labelledby="h-over">
		<div class="border-b border-line px-5 py-3"><h2 id="h-over" class="card-title text-danger">Überfällig <span class="num font-normal">{overdue.length}</span></h2></div>
		<ul class="divide-y divide-line">
			{#each overdue as x}
				<li><a href={x.href} class="flex items-center gap-3 px-5 py-2.5 hover:bg-subtle/60"><span class="num w-24 shrink-0 text-xs text-danger">{formatDate(x.date)}</span><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{x.title}</span>{#if x.detail}<span class="block truncate text-xs text-muted">{x.detail}</span>{/if}</span><Badge tone="danger" label={relativeDay(x.date)} /></a></li>
			{/each}
		</ul>
	</section>
{/if}

{#if months.length === 0 && overdue.length === 0}
	<div class="card"><EmptyState icon={CalendarClock} title="Keine Fristen" text="In diesem Bereich stehen keine Termine an." /></div>
{/if}

<div class="flex flex-col gap-4">
	{#each months as [m, items] (m)}
		<section class="card" aria-label={label(m)}>
			<div class="border-b border-line px-5 py-3"><h2 class="card-title capitalize">{label(m)} <span class="num font-normal text-faint">{items.length}</span></h2></div>
			<ul class="divide-y divide-line">
				{#each items as x}
					<li><a href={x.href} class="flex items-center gap-3 px-5 py-2.5 hover:bg-subtle/60">
						<span class="num w-24 shrink-0 text-xs text-muted">{formatDate(x.date)}</span>
						<span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{x.title}</span>{#if x.detail}<span class="block truncate text-xs text-muted">{x.detail}</span>{/if}</span>
						{#if x.generic}<span class="text-xs text-faint" title="Allgemeiner Richtwert, nicht aus Ihren Daten">Richtwert</span>{/if}
						<Badge tone={tone(x.date)} label={relativeDay(x.date)} />
					</a></li>
				{/each}
			</ul>
		</section>
	{/each}
</div>
<p class="mt-3 flex items-start gap-1.5 text-xs text-muted"><Info size={13} class="mt-px shrink-0" /> Gesetzliche Stichtage (Steuer, BG, Mindestlohn) sind Richtwerte aus der Recherche, Stand 02.11.2026. Bitte mit Steuerberater und Berufsgenossenschaft abgleichen, Abgabearten und Fristverlängerungen unterscheiden sich je Betrieb.</p>
