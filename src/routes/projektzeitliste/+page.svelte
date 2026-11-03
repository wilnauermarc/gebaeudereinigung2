<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { caseNet } from '#lib/cases.ts';
	import { downloadBytes, toCsv } from '#lib/download.ts';
	import { formatEur, formatDate } from '#lib/format.ts';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { Download, ListChecks } from '@lucide/svelte';

	const rows = $derived(db.data.cases.filter((c) => c.timesheetAt).sort((a, b) => b.timesheetAt!.localeCompare(a.timesheetAt!)));
	const total = $derived(rows.reduce((s, c) => s + (caseNet(db.data, c) ?? 0), 0));
	function exportCsv() {
		const out = [['Vorgang', 'Kunde', 'Objekt', 'Leistung', 'Netto (EUR)', 'Start', 'Ausführung', 'Eingetragen']];
		for (const c of rows) {
			const cu = db.customer(c.customerId);
			out.push([c.number, cu?.name ?? '', cu?.sites.find((s) => s.id === c.siteId)?.name ?? '', c.title, ((caseNet(db.data, c) ?? 0) / 100).toFixed(2).replace('.', ','), c.startAt ? formatDate(c.startAt) : '', c.executionDoneAt ? formatDate(c.executionDoneAt) : '', formatDate(c.timesheetAt)]);
		}
		downloadBytes(toCsv(out), 'Projektzeitliste.csv', 'text/csv;charset=utf-8');
		toasts.push(`${rows.length} Einträge exportiert (CSV, in Excel zu öffnen).`, { tone: 'success' });
	}
	import PageHead from '#lib/components/PageHead.svelte';
</script>

<svelte:head><title>Projektzeitliste · Resch Business Manager</title></svelte:head>

<PageHead title="Projektzeitliste" subtitle={`Abgeschlossene Vorgänge mit Auftragswert, zur Übergabe an die Abrechnung. ${rows.length} Einträge, ${formatEur(total)} netto.`}>
	{#snippet actions()}
		<button class="btn" onclick={exportCsv} disabled={!rows.length}><Download size={14} /> Als CSV exportieren</button>
	{/snippet}
</PageHead>

<div class="card overflow-x-auto">
	{#if rows.length === 0}
		<EmptyState icon={ListChecks} title="Noch keine Einträge" text="Ein Vorgang landet hier, sobald Sie im letzten Schritt „In die Projektzeitliste eintragen“ wählen." />
	{:else}
		<table class="w-full min-w-[800px] border-collapse">
			<thead class="border-b border-line bg-bg/60"><tr><th class="th">Vorgang</th><th class="th">Kunde</th><th class="th">Leistung</th><th class="th text-right">Netto</th><th class="th">Start</th><th class="th">Ausführung</th><th class="th">Eingetragen</th></tr></thead>
			<tbody class="divide-y divide-line">
				{#each rows as c (c.id)}
					<tr>
						<td class="td"><a href="/vorgaenge/{c.id}" class="font-medium hover:text-accent">{c.number}</a></td>
						<td class="td max-w-[220px] truncate" title={db.customer(c.customerId)?.name}>{db.customer(c.customerId)?.name}</td>
						<td class="td max-w-[240px] truncate text-muted">{c.title}</td>
						<td class="td num text-right">{formatEur(caseNet(db.data, c))}</td>
						<td class="td num">{c.startAt ? formatDate(c.startAt) : '–'}</td>
						<td class="td num">{c.executionDoneAt ? formatDate(c.executionDoneAt) : '–'}</td>
						<td class="td num">{formatDate(c.timesheetAt)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
