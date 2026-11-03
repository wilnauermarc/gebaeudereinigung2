<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import { formatEur } from '#lib/format.ts';
	import { contractQuotes, economics } from '#lib/cockpit.ts';
	import Badge from '#lib/components/Badge.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { Info, LineChart } from '@lucide/svelte';

	const month = $derived(db.refMonth);
	const monthLabel = $derived(new Date(month + '-15T12:00:00Z').toLocaleDateString('de-DE', { month: 'long', year: 'numeric', timeZone: 'UTC' }));
	const costPerHour = $derived(Math.round(db.data.calc.wageCents * (1 + db.data.calc.lnkPct / 100)));
	const fmt = (h: number) => h.toLocaleString('de-DE', { maximumFractionDigits: 1 });

	const rows = $derived(
		contractQuotes(db.data).map((q) => {
			const e = economics(db.data, q, month);
			return { q, s: db.site(q.siteId), hours: e.hours, revenue: e.revenue, cost: e.cost, db: e.revenue - e.cost, margin: e.margin };
		}).sort((a, b) => a.margin - b.margin)
	);
	const sum = $derived({
		revenue: rows.reduce((a, r) => a + r.revenue, 0),
		cost: rows.reduce((a, r) => a + r.cost, 0),
		hours: rows.reduce((a, r) => a + r.hours, 0)
	});
	const totalMargin = $derived(sum.revenue ? (sum.revenue - sum.cost) / sum.revenue : 0);
	/** Konzentrationsrisiko: Umsatzanteil des größten Kunden */
	const top = $derived.by(() => {
		const by = new Map<string, number>();
		for (const r of rows) by.set(r.q.customerId, (by.get(r.q.customerId) ?? 0) + r.revenue);
		const [id, v] = [...by.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['', 0];
		return { name: db.customer(id)?.name ?? '–', share: sum.revenue ? v / sum.revenue : 0 };
	});
	const tone = (m: number) => (m >= 0.25 ? 'success' : m >= 0.1 ? 'warn' : 'danger');
	const pct = (m: number) => `${(m * 100).toFixed(0)} %`;
	import PageHead from '#lib/components/PageHead.svelte';
</script>

<svelte:head><title>Controlling · Resch Business Manager</title></svelte:head>

<PageHead title="Controlling" subtitle={`Ergebnis je Objekt im Monat ${monthLabel}: Monatserlös laut Vertrag gegen tatsächlich geleistete Stunden.`}>
</PageHead>

<div class="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
	{#snippet tile(label: string, value: string, sub: string, cls = '')}
		<div class="card p-4"><p class="text-xs text-muted">{label}</p><p class="num mt-1 text-2xl font-semibold tracking-tight {cls}">{value}</p><p class="text-xs text-muted">{sub}</p></div>
	{/snippet}
	{@render tile('Erlös (netto)', formatEur(sum.revenue), `${rows.length} Objekte mit Vertrag`)}
	{@render tile('Lohnkosten', formatEur(sum.cost), `${fmt(sum.hours)} Std. × ${formatEur(costPerHour)}`)}
	{@render tile('Deckungsbeitrag', formatEur(sum.revenue - sum.cost), `Marge ${pct(totalMargin)}`, totalMargin < 0.1 ? 'text-danger' : '')}
	{@render tile('Größter Kunde', pct(top.share), top.name, top.share > 0.4 ? 'text-warn' : '')}
</div>

<div class="card overflow-x-auto">
	{#if rows.length === 0}
		<EmptyState icon={LineChart} title="Noch keine Verträge" text="Das Controlling erscheint, sobald Unterhaltsreinigungen als angenommen vermerkt sind." />
	{:else}
		<table class="w-full min-w-[860px] border-collapse">
			<thead class="border-b border-line bg-bg/60"><tr><th class="th">Objekt</th><th class="th text-right">Erlös</th><th class="th text-right">Ist-Std.</th><th class="th text-right">Lohnkosten</th><th class="th text-right">Deckungsbeitrag</th><th class="th">Marge</th></tr></thead>
			<tbody class="divide-y divide-line">
				{#each rows as r (r.q.id)}
					<tr>
						<td class="td max-w-[300px]"><a href="/kunden/{r.q.customerId}" class="block truncate font-medium hover:text-accent" title={db.customer(r.q.customerId)?.name}>{db.customer(r.q.customerId)?.name}</a><span class="block truncate text-xs text-muted">{r.s?.site.name}</span></td>
						<td class="td num text-right">{formatEur(r.revenue)}</td>
						<td class="td num text-right">{fmt(r.hours)}</td>
						<td class="td num text-right">{formatEur(r.cost)}</td>
						<td class="td num text-right font-medium">{formatEur(r.db)}</td>
						<td class="td">
							<div class="flex items-center gap-2">
								<div class="h-1.5 w-24 overflow-hidden rounded-full bg-subtle"><div class="h-full {tone(r.margin) === 'success' ? 'bg-success' : tone(r.margin) === 'warn' ? 'bg-warn' : 'bg-danger'}" style="width: {Math.max(0, Math.min(100, r.margin * 100))}%"></div></div>
								<Badge tone={tone(r.margin)} label={pct(r.margin)} />
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
<p class="mt-3 flex items-start gap-1.5 text-xs text-muted"><Info size={13} class="mt-px shrink-0" /> Lohnkosten = Ist-Stunden × (Stundenlohn + Lohnnebenkosten) aus den Kalkulationsannahmen, inklusive tariflicher Zuschläge (Nacht, Sonn-, Feiertag), ohne Fahrzeit, Material und Gemeinkosten. Die Ampelgrenzen (grün ab 25 %, gelb ab 10 %) sind frei gesetzt und noch mit Ihren Zielwerten abzugleichen.</p>
