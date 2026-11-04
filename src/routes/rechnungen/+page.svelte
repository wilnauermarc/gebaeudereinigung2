<script lang="ts">
	import { releaseExtras } from '#lib/extras.ts';
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { addDays } from '#lib/calc.ts';
	import { company } from '#lib/company.ts';
	import { downloadBytes, toCsv } from '#lib/download.ts';
	import { buildXRechnung } from '#lib/pdf/xrechnung.ts';
	import { bookingRows, extfBookings, toWin1252 } from '#lib/export.ts';
	import { exportSettings } from '#lib/exportConfig.svelte.ts';
	import { buildInvoicePdf, buildReminderPdf, VAT } from '#lib/pdf/documentsPdf.ts';
	import { formatEur, formatDate, todayKey, dayDiff } from '#lib/format.ts';
	import Badge from '#lib/components/Badge.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { Download, Check, BellRing, Plus, Receipt, Ban } from '@lucide/svelte';
	import type { Invoice } from '#lib/types.ts';

	const today = todayKey();
	let filter = $state<'offen' | 'ueberfaellig' | 'bezahlt' | 'alle'>('offen');
	const all = $derived(db.data.invoices);
	const open = $derived(all.filter((i) => !i.paidAt));
	const overdue = $derived(open.filter((i) => i.dueOn < today));
	const rows = $derived(
		all
			.filter((i) => (filter === 'alle' ? true : filter === 'bezahlt' ? !!i.paidAt : filter === 'offen' ? !i.paidAt : !i.paidAt && i.dueOn < today))
			.sort((a, b) => b.issuedOn.localeCompare(a.issuedOn))
	);
	const gross = (cents: number) => cents + Math.round(cents * VAT);

	function status(i: Invoice) {
		if (i.cancelledBy) return { label: `Storniert (${i.cancelledBy})`, tone: 'neutral' as const };
		if (i.stornoOf) return { label: `Storno zu ${i.stornoOf}`, tone: 'neutral' as const };
		if (i.paidAt) return { label: 'Bezahlt', tone: 'success' as const };
		if (i.dueOn < today) return { label: i.remindCount ? `Mahnstufe ${i.remindCount}` : `${-dayDiff(i.dueOn)} Tage überfällig`, tone: 'danger' as const };
		return { label: `fällig in ${dayDiff(i.dueOn)} Tagen`, tone: 'neutral' as const };
	}
	const doc = (i: Invoice) => ({ number: i.number, issuedOn: i.issuedOn, dueOn: i.dueOn, netCents: i.netCents, period: i.period, description: i.description ?? (i.period ? `Reinigungsleistungen laut Vertrag, Monatspauschale` : 'Reinigungsleistungen') });

	async function pdf(i: Invoice) {
		const c = db.customer(i.customerId)!;
		downloadBytes(await buildInvoicePdf({ company, customer: c, invoice: doc(i) }), `${i.number}.pdf`, 'application/pdf');
	}
	/** Buchungsstapel im DATEV-Importformat (EXTF) für den gewählten Monat der Rechnungsdaten. Ungeprüft, siehe `export.ts`. */
	function exportExtf() {
		const list = [...db.data.invoices].sort((a, b) => a.issuedOn.localeCompare(b.issuedOn));
		if (!list.length) return toasts.push('Keine Rechnungen zum Exportieren.');
		const cfg = exportSettings.cfg;
		if (!cfg.beraterNr || !cfg.mandantNr) toasts.push('Berater- und Mandantennummer fehlen noch (Einstellungen). Der Export enthält leere Felder.', { ms: 9000 });
		const txt = extfBookings(bookingRows(list, db.data.customers, cfg), cfg, { now: new Date(), from: list[0].issuedOn, to: list.at(-1)!.issuedOn });
		downloadBytes(toWin1252(txt), `EXTF_Buchungsstapel_${today}.csv`, 'text/csv;charset=windows-1252');
		toasts.push(`${list.length} Buchungen im DATEV-Format exportiert. Vor dem Einsatz Testimport bei der Steuerberatung machen.`, { tone: 'success', ms: 9000 });
	}
	function xml(i: Invoice) {
		const c = db.customer(i.customerId)!;
		downloadBytes(new TextEncoder().encode(buildXRechnung({ company, customer: c, invoice: doc(i), buyerReference: c.buyerRef })), `${i.number}-xrechnung.xml`, 'application/xml');
		toasts.push('XRechnung-Entwurf erzeugt. Vor dem Versand mit einem Validator prüfen.');
	}
	/** Storno statt Überschreiben: Die Rechnung bleibt unverändert erhalten, eine Stornorechnung mit Minusbetrag gleicht sie aus. */
	let stornoFor = $state<Invoice | null>(null);
	let stornoOpen = $state(false);
	function storno() {
		const i = stornoFor;
		if (!i) return;
		const nr = i.number + '-S';
		const stamp = new Date().toISOString();
		db.data.invoices.push({ id: 'r' + Date.now().toString(36), number: nr, customerId: i.customerId, netCents: -i.netCents, issuedOn: today, dueOn: today, paidAt: stamp, period: i.period, quoteId: i.quoteId, remindCount: 0, remindedAt: null, stornoOf: i.number });
		i.cancelledBy = nr;
		const freed = releaseExtras(db.data, i.id);
		i.paidAt = stamp;
		db.addEvent(i.customerId, 'notiz', `Rechnung ${i.number} storniert (Stornorechnung ${nr}).`);
		toasts.push(`${i.number} storniert. Stornorechnung ${nr} ist angelegt.${freed ? ` ${freed} Zusatzleistung${freed === 1 ? ' ist' : 'en sind'} wieder abrechenbar.` : ''}`, { tone: 'success' });
		stornoOpen = false;
	}
	function markPaid(i: Invoice) {
		const prev = i.paidAt;
		i.paidAt = new Date().toISOString();
		db.addEvent(i.customerId, 'rechnung', `Rechnung ${i.number} als bezahlt vermerkt.`);
		toasts.push(`${i.number} als bezahlt vermerkt.`, { tone: 'success', action: { label: 'Rückgängig', run: () => (i.paidAt = prev) } });
	}
	async function remind(i: Invoice) {
		if (i.remindCount >= 2) return;
		const stage = (i.remindCount + 1) as 1 | 2;
		const c = db.customer(i.customerId)!;
		const bytes = await buildReminderPdf({ company, customer: c, invoice: doc(i), stage, today, deadline: addDays(today, 7) });
		downloadBytes(bytes, `${stage === 1 ? 'Zahlungserinnerung' : 'Mahnung'}-${i.number}.pdf`, 'application/pdf');
		i.remindCount = stage;
		i.remindedAt = new Date().toISOString();
		db.addEvent(i.customerId, 'rechnung', `${stage === 1 ? 'Zahlungserinnerung' : 'Mahnung'} zu ${i.number} erstellt. Es wurde nichts verschickt.`);
		toasts.push(`${stage === 1 ? 'Zahlungserinnerung' : 'Mahnung'} erstellt und vermerkt. Versand erfolgt durch Sie.`, { tone: 'success', ms: 8000 });
	}

	/** Belegliste für den Steuerberater (CSV, Semikolon). Kein DATEV-Format. */
	function exportCsv() {
		const rowsOut = [['Rechnungsnummer', 'Rechnungsdatum', 'Fällig', 'Kunde', 'Zeitraum', 'Netto (EUR)', 'USt 19 % (EUR)', 'Brutto (EUR)', 'Bezahlt am', 'Mahnstufe']];
		const f = (c: number) => (c / 100).toFixed(2).replace('.', ',');
		for (const i of [...all].sort((a, b) => a.issuedOn.localeCompare(b.issuedOn))) {
			const vat = Math.round(i.netCents * VAT);
			rowsOut.push([i.number, formatDate(i.issuedOn), formatDate(i.dueOn), db.customer(i.customerId)?.name ?? '', i.period ?? '', f(i.netCents), f(vat), f(i.netCents + vat), i.paidAt ? formatDate(i.paidAt) : '', String(i.remindCount)]);
		}
		downloadBytes(toCsv(rowsOut), `Rechnungen-${today.slice(0, 7)}.csv`, 'text/csv;charset=utf-8');
		toasts.push(`${all.length} Rechnungen exportiert (CSV für den Steuerberater).`, { tone: 'success' });
	}

	// Rechnungslauf
	let runOpen = $state(false);
	let period = $state(today.slice(0, 7));
	const billable = $derived(db.billableContracts(period));
	let picked = $state<Record<string, boolean>>({});
	$effect(() => { picked = Object.fromEntries(billable.map((q) => [q.id, true])); });
	function run() {
		const sel = billable.filter((q) => picked[q.id]);
		for (const q of sel) db.createInvoice(q, period, today, addDays(today, 14));
		runOpen = false;
		toasts.push(sel.length ? `${sel.length} Rechnung${sel.length === 1 ? '' : 'en'} erstellt (Zahlungsziel 14 Tage).` : 'Nichts ausgewählt.', { tone: sel.length ? 'success' : 'default' });
	}
	const monthLabel = (p: string) => new Date(p + '-15T12:00:00Z').toLocaleDateString('de-DE', { month: 'long', year: 'numeric', timeZone: 'UTC' });
	import PageHead from '#lib/components/PageHead.svelte';
	import type { Instrument, NextStep } from '#lib/ux.ts';
	import { gauges as gaugesOf } from '#lib/cockpit.ts';
	import { mondayOf } from '#lib/calc.ts';
	const gm = $derived(gaugesOf(db.data, db.refMonth, today, mondayOf(today)));
	const sumGross = (list: Invoice[]) => list.reduce((s, i) => s + gross(i.netCents), 0);
	const toBill = $derived(db.billableContracts(today.slice(0, 7)).length);
	const instruments = $derived<Instrument[]>([
		{ kind: 'gauge', label: 'Zahlungsmoral', value: gm.payment, sub: 'pünktlich oder bezahlt', good: 0.9, warn: 0.75 },
		{ kind: 'stat', label: 'Offene Posten', value: formatEur(sumGross(open)), sub: `${open.length} Rechnungen` },
		{ kind: 'stat', label: 'Überfällig', value: formatEur(sumGross(overdue)), sub: `${overdue.length} Rechnungen`, tone: overdue.length ? 'danger' : 'success' },
		{ kind: 'stat', label: 'Noch zu erstellen', value: String(toBill), sub: 'Monatsrechnungen im Rechnungslauf', tone: toBill ? 'warn' : '' }
	]);
	const nextStep = $derived<NextStep>(
		overdue.length ? { tone: 'danger', text: `${overdue.length} ${overdue.length === 1 ? 'Rechnung ist' : 'Rechnungen sind'} überfällig (${formatEur(sumGross(overdue))}). Zahlungserinnerung oder Mahnung erstellen.`, cta: { label: 'Überfällige zeigen', onclick: () => (filter = 'ueberfaellig') } }
		: toBill ? { tone: 'warn', text: `${toBill} Monatsrechnungen sind noch nicht erstellt.`, cta: { label: 'Rechnungslauf starten', onclick: () => (runOpen = true) } }
		: { tone: 'ok', text: 'Alle Rechnungen sind erstellt, nichts ist überfällig.' }
	);
</script>

<svelte:head><title>Rechnungen · Putzbetrieb</title></svelte:head>

<PageHead title="Rechnungen" subtitle={`Offene Posten ${formatEur(sumGross(open))} brutto, davon überfällig ${formatEur(sumGross(overdue))}`} {instruments} next={nextStep}>
	{#snippet actions()}
		<button class="btn" onclick={exportExtf} title="Buchungsstapel im DATEV-Importformat (nicht zertifiziert)"><Download size={14} /> DATEV-Export</button><button class="btn" onclick={exportCsv}><Download size={14} /> CSV für Steuerberater</button><button class="btn btn-primary" onclick={() => (runOpen = true)}><Plus size={15} /> Rechnungslauf</button>
	{/snippet}
</PageHead>

<div class="mb-3 flex flex-wrap gap-1" role="group" aria-label="Filter">
	{#each [['offen', `Offen ${open.length}`], ['ueberfaellig', `Überfällig ${overdue.length}`], ['bezahlt', 'Bezahlt'], ['alle', 'Alle']] as [id, label]}
		<button class="btn btn-sm {filter === id ? 'border-accent bg-accent text-white' : ''}" aria-pressed={filter === id} onclick={() => (filter = id as typeof filter)}>{label}</button>
	{/each}
</div>

<div class="card overflow-x-auto">
	{#if rows.length === 0}
		<EmptyState icon={Receipt} title="Keine Rechnungen in dieser Ansicht" text="Mit dem Rechnungslauf erstellen Sie die Monatsrechnungen aller laufenden Verträge in einem Schritt." />
	{:else}
		<table class="w-full min-w-[900px] border-collapse">
			<thead class="border-b border-line bg-bg/60"><tr><th class="th">Nummer</th><th class="th">Kunde</th><th class="th">Zeitraum</th><th class="th text-right">Brutto</th><th class="th">Fällig</th><th class="th">Status</th><th class="th w-[210px]"></th></tr></thead>
			<tbody class="divide-y divide-line">
				{#each rows as i (i.id)}
					{@const st = status(i)}
					<tr>
						<td class="td whitespace-nowrap font-medium">{i.number}</td>
						<td class="td max-w-[240px] truncate"><a href="/kunden/{i.customerId}" class="hover:text-accent" title={db.customer(i.customerId)?.name}>{db.customer(i.customerId)?.name}</a></td>
						<td class="td whitespace-nowrap text-muted">{i.period ? monthLabel(i.period) : '–'}</td>
						<td class="td num text-right whitespace-nowrap">{formatEur(gross(i.netCents))}<span class="block text-xs text-muted">netto {formatEur(i.netCents)}</span></td>
						<td class="td num whitespace-nowrap">{formatDate(i.dueOn)}</td>
						<td class="td"><Badge tone={st.tone} label={st.label} /></td>
						<td class="td min-w-[220px]">
							<div class="flex flex-wrap justify-end gap-1">
								<button class="btn btn-ghost btn-sm" onclick={() => pdf(i)} aria-label="Rechnung {i.number} als PDF"><Download size={13} /> PDF</button>
								{#if !i.stornoOf}<button class="btn btn-ghost btn-sm" onclick={() => xml(i)} aria-label="Rechnung {i.number} als XRechnung-Entwurf" title="XRechnung (UBL), Entwurf"><Download size={13} /> XML</button>{/if}
								{#if !i.paidAt}
									{#if i.dueOn < today && i.remindCount < 2}<button class="btn btn-sm" onclick={() => remind(i)}><BellRing size={13} /> {i.remindCount === 0 ? 'Erinnerung' : 'Mahnung'}</button>{/if}
									<button class="btn btn-sm" onclick={() => markPaid(i)}><Check size={13} /> Bezahlt</button>
								{/if}
								{#if !i.cancelledBy && !i.stornoOf}<button class="btn btn-ghost btn-sm hover:text-danger" onclick={() => (stornoFor = i, stornoOpen = true)} aria-label="Rechnung {i.number} stornieren" title="Stornieren"><Ban size={13} /></button>{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
<p class="mt-3 text-xs text-muted">Zahlungserinnerung und Mahnung werden als PDF erstellt und hier vermerkt, aber nicht versendet. Textvorlagen, bitte vor Einsatz rechtlich prüfen. Der XML-Button erzeugt einen XRechnung-Entwurf, der vor dem Versand validiert werden muss. ZUGFeRD folgt mit dem Backend.</p>

<Dialog bind:open={runOpen} title="Rechnungslauf" description="Erstellt die Pauschalrechnungen für alle laufenden Verträge, die in diesem Monat noch nicht abgerechnet sind." width={520}>
	{#snippet children()}
		<div class="mb-3"><label class="label" for="run-p">Abrechnungsmonat</label><input id="run-p" type="month" class="input w-48" bind:value={period} /></div>
		{#if billable.length === 0}
			<p class="rounded-md bg-subtle px-3 py-3 text-sm text-muted">Für {monthLabel(period)} ist bereits alles abgerechnet.</p>
		{:else}
			<ul class="flex flex-col gap-1">
				{#each billable as q (q.id)}
					<li><label class="flex cursor-pointer items-center gap-3 rounded-md border border-line px-3 py-2 text-sm hover:bg-subtle">
						<input type="checkbox" bind:checked={picked[q.id]} class="size-4 accent-[var(--accent)]" />
						<span class="min-w-0 flex-1 truncate">{db.customer(q.customerId)?.name}</span>
						<span class="num text-muted">{formatEur(q.monthlyCents)}</span>
					</label></li>
				{/each}
			</ul>
		{/if}
	{/snippet}
	{#snippet footer()}
		<button class="btn" onclick={() => (runOpen = false)}>Abbrechen</button>
		<button class="btn btn-primary" onclick={run} disabled={!billable.some((q) => picked[q.id])}>Rechnungen erstellen</button>
	{/snippet}
</Dialog>

<Dialog bind:open={stornoOpen} title="Rechnung stornieren?" description="Die Rechnung bleibt unverändert erhalten. Eine Stornorechnung mit Minusbetrag gleicht sie aus." width={460}>
	{#snippet children()}<p class="text-sm">{stornoFor?.number} über {formatEur(stornoFor ? gross(stornoFor.netCents) : 0)} brutto wird ausgeglichen. Danach können Sie eine korrigierte Rechnung neu erstellen.</p>{/snippet}
	{#snippet footer()}<button class="btn" onclick={() => (stornoOpen = false)}>Abbrechen</button><button class="btn btn-danger" onclick={storno}>Stornieren</button>{/snippet}
</Dialog>
