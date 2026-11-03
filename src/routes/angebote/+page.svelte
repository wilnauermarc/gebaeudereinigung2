<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { db } from '#lib/db.svelte.ts';
	import { quoteStatus, quoteKind } from '#lib/labels.ts';
	import { formatEur, formatDate, relativeDay, dayDiff } from '#lib/format.ts';
	import Badge from '#lib/components/Badge.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import { toasts } from '#lib/toast.svelte.ts';
	import { Search, FileText, Plus } from '@lucide/svelte';
	import type { QuoteStatus } from '#lib/types.ts';

	const init = page.url.searchParams.get('status');
	let status = $state<QuoteStatus | 'alle'>(init && init in quoteStatus ? (init as QuoteStatus) : 'alle');
	let query = $state('');

	const all = $derived(db.data.quotes);
	const rows = $derived(
		all
			.filter((q) => status === 'alle' || q.status === status)
			.filter((q) => {
				const s = query.trim().toLowerCase();
				return !s || q.number.toLowerCase().includes(s) || (db.customer(q.customerId)?.name ?? '').toLowerCase().includes(s);
			})
			.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
	);
	let newOpen = $state(false);
	let pickCustomer = $state('');
	let pickKind = $state<'unterhaltsreinigung' | 'sonderreinigung'>('unterhaltsreinigung');
	function createQuote() {
		if (!pickCustomer) return;
		const q = db.createQuote(pickCustomer, pickKind);
		newOpen = false;
		toasts.push(`Angebot ${q.number} als Entwurf angelegt.`, { tone: 'success' });
		goto(`/angebote/${q.id}`);
	}
	const chips: (QuoteStatus | 'alle')[] = ['alle', 'entwurf', 'versendet', 'angenommen', 'abgelehnt'];
	import PageHead from '#lib/components/PageHead.svelte';
	import type { Instrument, NextStep } from '#lib/ux.ts';
	const decided = $derived(all.filter((q) => q.status === 'angenommen' || q.status === 'abgelehnt'));
	const winRate = $derived(decided.length ? decided.filter((q) => q.status === 'angenommen').length / decided.length : 1);
	const sentList = $derived(all.filter((q) => q.status === 'versendet'));
	const pipelineValue = $derived(sentList.reduce((a, q) => a + ((q.kind === 'unterhaltsreinigung' ? q.monthlyCents : q.hourlyCents) ?? 0), 0));
	const lateFollow = $derived(sentList.filter((q) => q.followupOn && dayDiff(q.followupOn) < 0));
	const drafts = $derived(all.filter((q) => q.status === 'entwurf'));
	const instruments = $derived<Instrument[]>([
		{ kind: 'gauge', label: 'Abschlussquote', value: winRate, sub: `${decided.filter((q) => q.status === 'angenommen').length} von ${decided.length} entschieden`, good: 0.5, warn: 0.3 },
		{ kind: 'stat', label: 'Offene Angebote', value: formatEur(pipelineValue), sub: `${sentList.length} warten auf Antwort (Monatswert)` },
		{ kind: 'stat', label: 'Entwürfe', value: String(drafts.length), sub: 'noch nicht vermerkt' },
		{ kind: 'stat', label: 'Nachfassen fällig', value: String(lateFollow.length), sub: 'Wiedervorlage überschritten', tone: lateFollow.length ? 'danger' : 'success' }
	]);
	const nextStep = $derived<NextStep>(
		lateFollow.length ? { tone: 'danger', text: `${db.customer(lateFollow[0].customerId)?.name.slice(0, 40)}: Wiedervorlage zu ${lateFollow[0].number} ist überfällig. Jetzt nachfassen.`, cta: { label: 'Angebot öffnen', href: `/angebote/${lateFollow[0].id}` } }
		: drafts.length ? { tone: 'info', text: `${drafts.length} ${drafts.length === 1 ? 'Entwurf wartet' : 'Entwürfe warten'} auf Fertigstellung.`, cta: { label: 'Entwurf öffnen', href: `/angebote/${drafts[0].id}` } }
		: { tone: 'ok', text: 'Alle Angebote sind bearbeitet.' }
	);
</script>

<svelte:head><title>Angebote · Objektia</title></svelte:head>

<PageHead title="Angebote" subtitle={'Entwürfe, versendete und entschiedene Angebote auf einen Blick.'} {instruments} next={nextStep}>
	{#snippet actions()}
		<button class="btn btn-primary" onclick={() => { pickCustomer = db.data.customers[0]?.id ?? ''; newOpen = true; }}><Plus size={15} /> Neues Angebot</button>
	{/snippet}
</PageHead>

<div class="mb-3 flex flex-wrap items-center gap-2">
	<div class="relative w-full sm:w-72">
		<Search size={14} class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-faint" />
		<input data-search class="input pl-8" placeholder="Nummer oder Kunde …" aria-label="Angebote durchsuchen" bind:value={query} />
	</div>
	<div class="flex flex-wrap gap-1" role="group" aria-label="Nach Status filtern">
		{#each chips as chip}
			<button class="btn btn-sm {status === chip ? 'border-accent bg-accent text-white' : ''}" aria-pressed={status === chip} onclick={() => (status = chip)}>
				{chip === 'alle' ? 'Alle' : quoteStatus[chip].label}
				<span class="num text-muted">{chip === 'alle' ? all.length : all.filter((q) => q.status === chip).length}</span>
			</button>
		{/each}
	</div>
</div>

<div class="card overflow-x-auto">
	<table class="w-full min-w-[820px] border-collapse">
		<thead class="border-b border-line bg-bg/60">
			<tr><th class="th">Nummer</th><th class="th">Kunde</th><th class="th">Art</th><th class="th">Status</th><th class="th text-right">Preis (netto)</th><th class="th text-right">Wiedervorlage</th></tr>
		</thead>
		<tbody class="divide-y divide-line">
			{#each rows as q (q.id)}
				<tr class="group cursor-pointer hover:bg-subtle/60" onclick={() => goto(`/angebote/${q.id}`)}>
					<td class="td whitespace-nowrap"><a class="font-medium group-hover:text-accent" href="/angebote/{q.id}" onclick={(e) => e.stopPropagation()}>{q.number}{q.version > 1 ? ` · v${q.version}` : ''}</a></td>
					<td class="td max-w-[300px] truncate" title={db.customer(q.customerId)?.name}>{db.customer(q.customerId)?.name}</td>
					<td class="td text-muted">{quoteKind[q.kind]}</td>
					<td class="td"><Badge tone={quoteStatus[q.status].tone} label={quoteStatus[q.status].label} /></td>
					<td class="td num text-right whitespace-nowrap">{q.kind === 'unterhaltsreinigung' ? (q.monthlyCents ? formatEur(q.monthlyCents) + ' / Monat' : '–') : q.hourlyCents ? formatEur(q.hourlyCents) + ' / Std.' : '–'}</td>
					<td class="td text-right text-xs whitespace-nowrap {q.status === 'versendet' && q.followupOn && dayDiff(q.followupOn) < 0 ? 'font-medium text-danger' : 'text-muted'}">
						{q.status === 'versendet' && q.followupOn ? `${formatDate(q.followupOn)} · ${relativeDay(q.followupOn)}` : '–'}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	{#if rows.length === 0}
		<EmptyState icon={FileText} title="Keine Angebote gefunden" text="Mit diesem Filter gibt es keine Angebote." >
			<button class="btn" onclick={() => { status = 'alle'; query = ''; }}>Filter zurücksetzen</button>
		</EmptyState>
	{/if}
</div>

<Dialog bind:open={newOpen} title="Neues Angebot" description="Für welchen Kunden und welche Art von Reinigung?">
	{#snippet children()}
		<div class="grid gap-3">
			<div><label class="label" for="nq-c">Kunde</label><select id="nq-c" class="input" bind:value={pickCustomer}>{#each [...db.data.customers].sort((x, y) => x.name.localeCompare(y.name)) as c}<option value={c.id}>{c.name.length > 60 ? c.name.slice(0, 58) + '…' : c.name}</option>{/each}</select></div>
			<div><span class="label">Art</span>
				<div class="grid grid-cols-2 gap-2">
					{#each [['unterhaltsreinigung', 'Unterhaltsreinigung', 'Regelmäßig, Monatspauschale'], ['sonderreinigung', 'Sonderreinigung', 'Einmalig, nach Stundenpreis']] as [v, l, s]}
						<button type="button" class="rounded-lg border p-3 text-left {pickKind === v ? 'border-accent bg-accent-soft' : 'border-line hover:bg-subtle'}" aria-pressed={pickKind === v} onclick={() => (pickKind = v as typeof pickKind)}><span class="block text-sm font-semibold">{l}</span><span class="text-xs text-muted">{s}</span></button>
					{/each}
				</div>
			</div>
		</div>
	{/snippet}
	{#snippet footer()}<button class="btn" onclick={() => (newOpen = false)}>Abbrechen</button><button class="btn btn-primary" onclick={createQuote}>Entwurf anlegen</button>{/snippet}
</Dialog>
