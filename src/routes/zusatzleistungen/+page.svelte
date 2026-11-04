<script lang="ts">
	import { goto } from '$app/navigation';
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { todayKey, formatDate, formatEur } from '#lib/format.ts';
	import { addDays } from '#lib/calc.ts';
	import { extraLabels, extraNet, invoiceExtras, moveExtra, newExtra, unbilledCents } from '#lib/extras.ts';
	import type { ExtraService, ExtraStatus } from '#lib/types.ts';
	import type { Instrument, NextStep } from '#lib/ux.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { Plus, PackagePlus, Receipt, Check, X } from '@lucide/svelte';

	const today = todayKey();
	let filter = $state<'offen' | ExtraStatus | 'alle'>('offen');
	let customerFilter = $state('alle');
	const all = $derived(db.data.extras ?? []);
	const list = $derived(
		all.filter((e) => (customerFilter === 'alle' || e.customerId === customerFilter) && (filter === 'alle' ? true : filter === 'offen' ? ['angefragt', 'beauftragt', 'ausgefuehrt'].includes(e.status) : e.status === filter))
			.sort((a, b) => b.date.localeCompare(a.date))
	);
	const count = (s: ExtraStatus) => all.filter((e) => e.status === s).length;
	const unbilled = $derived(unbilledCents(db.data));
	const instruments = $derived<Instrument[]>([
		{ kind: 'stat', label: 'Angefragt', value: String(count('angefragt')), sub: 'wartet auf Beauftragung', tone: count('angefragt') ? 'warn' : '' },
		{ kind: 'stat', label: 'Beauftragt', value: String(count('beauftragt')), sub: 'noch nicht ausgeführt' },
		{ kind: 'stat', label: 'Ausgeführt, nicht abgerechnet', value: formatEur(unbilled), sub: `${count('ausgefuehrt')} Leistungen netto`, tone: unbilled ? 'warn' : 'success' },
		{ kind: 'stat', label: 'Abgerechnet', value: String(count('abgerechnet')), sub: 'in einer Rechnung' }
	]);
	const next = $derived<NextStep>(
		count('ausgefuehrt') ? { tone: 'warn', text: `${count('ausgefuehrt')} ausgeführte Zusatzleistung${count('ausgefuehrt') === 1 ? '' : 'en'} (${formatEur(unbilled)} netto) ${count('ausgefuehrt') === 1 ? 'ist' : 'sind'} noch nicht in Rechnung gestellt. Das ist Geld, das liegen bleibt.`, cta: { label: 'Nur Ausgeführte', onclick: () => (filter = 'ausgefuehrt') } }
		: count('angefragt') ? { tone: 'info', text: `${count('angefragt')} Anfragen warten auf die Beauftragung durch den Kunden.`, cta: { label: 'Anfragen zeigen', onclick: () => (filter = 'angefragt') } }
		: { tone: 'ok', text: 'Alle Zusatzleistungen sind abgerechnet oder noch nicht beauftragt.' }
	);
	const custName = (id: string) => db.customer(id)?.name ?? '';
	const siteName = (id: string | null) => (id ? db.site(id)?.site.name ?? '' : '');

	// ── Neu anlegen ──
	let nOpen = $state(false);
	let nf = $state({ customerId: '', siteId: '', title: '', description: '', qty: 1, unit: 'Std.' as ExtraService['unit'], price: '38,00', orderedBy: '', alreadyOrdered: false, date: today });
	let nErr = $state('');
	const nSites = $derived(db.customer(nf.customerId)?.sites ?? []);
	function openNew() { nf = { customerId: db.data.customers[0]?.id ?? '', siteId: '', title: '', description: '', qty: 1, unit: 'Std.', price: '38,00', orderedBy: db.customer(db.data.customers[0]?.id ?? '')?.contacts[0]?.name ?? '', alreadyOrdered: false, date: today }; nErr = ''; nOpen = true; }
	function pickCustomer() { nf.siteId = ''; nf.orderedBy = db.customer(nf.customerId)?.contacts[0]?.name ?? ''; }
	const parsePrice = (s: string) => Math.round(Number(s.replace(/\./g, '').replace(',', '.')) * 100);
	function create(e: SubmitEvent) {
		e.preventDefault();
		const r = newExtra({ customerId: nf.customerId, siteId: nf.siteId || null, title: nf.title, description: nf.description, qty: Number(nf.qty), unit: nf.unit, unitCents: parsePrice(nf.price), orderedBy: nf.orderedBy, alreadyOrdered: nf.alreadyOrdered, date: nf.date }, db.me, today);
		if (typeof r === 'string') return (nErr = r);
		if (!db.customer(nf.customerId)) return (nErr = 'Bitte einen Kunden wählen.');
		db.data.extras ??= [];
		db.data.extras.push(r);
		db.addEvent(r.customerId, 'notiz', `Zusatzleistung „${r.title}“ ${r.status === 'angefragt' ? 'angefragt' : 'beauftragt'} (${formatEur(extraNet(r))} netto).`);
		nOpen = false;
		toasts.push('Zusatzleistung angelegt.', { tone: 'success' });
	}

	// ── Schritt ──
	let sOpen = $state(false);
	let step = $state<{ e: ExtraService; to: ExtraStatus } | null>(null);
	let sf = $state({ orderedBy: '', executedOn: today, reason: '' });
	let sErr = $state('');
	function go(e: ExtraService, to: ExtraStatus) {
		step = { e, to }; sErr = '';
		sf = { orderedBy: e.orderedBy || db.customer(e.customerId)?.contacts[0]?.name || '', executedOn: e.executedOn ?? e.date <= today ? (e.executedOn ?? e.date) : today, reason: '' };
		if (to === 'angefragt' || (to === 'beauftragt' && e.status !== 'angefragt')) { apply(); return; }
		sOpen = true;
	}
	function apply() {
		if (!step) return;
		const err = moveExtra(step.e, step.to, { by: db.me, orderedBy: sf.orderedBy, executedOn: sf.executedOn, reason: sf.reason }, today);
		if (err) { sErr = err; if (!sOpen) toasts.push(err, { tone: 'error' }); return; }
		sOpen = false;
	}

	// ── Abrechnen ──
	let picked = $state<string[]>([]);
	const pickedList = $derived(all.filter((e) => picked.includes(e.id)));
	const pickedCustomers = $derived(new Set(pickedList.map((e) => e.customerId)).size);
	const pickedSum = $derived(pickedList.reduce((a, e) => a + extraNet(e), 0));
	function toggle(id: string) { picked = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]; }
	function bill() {
		const r = invoiceExtras(db.data, picked, today, addDays(today, 14), db.nextInvoiceNumber());
		if (typeof r === 'string') return toasts.push(r, { tone: 'error' });
		db.addEvent(r.customerId, 'rechnung', `Rechnung ${r.number} über ${formatEur(r.netCents)} netto für Zusatzleistungen erstellt.`);
		picked = [];
		toasts.push(`Rechnung ${r.number} über ${formatEur(r.netCents)} netto erstellt.`, { tone: 'success', action: { label: 'Zu den Rechnungen', run: () => goto('/rechnungen') } });
	}
	const badgeCls: Record<ExtraStatus, string> = { angefragt: 'badge-warn', beauftragt: 'badge-info', ausgefuehrt: 'badge-warn', abgerechnet: 'badge-success', abgelehnt: 'badge-neutral' };
</script>

<svelte:head><title>Zusatzleistungen · Putzbetrieb</title></svelte:head>

<PageHead title="Zusatzleistungen" subtitle="Vom Wunsch des Kunden bis zur Rechnung: Angefragt → Beauftragt → Ausgeführt → Abgerechnet." {instruments} {next}>
	{#snippet actions()}
		<button class="btn btn-primary" onclick={openNew}><Plus size={15} /> Zusatzleistung</button>
	{/snippet}
</PageHead>

<div class="mb-3 flex flex-wrap items-center gap-2">
	<select class="input w-64" aria-label="Kunde filtern" bind:value={customerFilter}><option value="alle">Alle Kunden</option>{#each db.data.customers as c}<option value={c.id}>{c.name.length > 34 ? c.name.slice(0, 32) + '…' : c.name}</option>{/each}</select>
	<div class="flex flex-wrap gap-1" role="group" aria-label="Filtern">
		{#each [['offen', 'In Arbeit'], ['angefragt', 'Angefragt'], ['beauftragt', 'Beauftragt'], ['ausgefuehrt', 'Ausgeführt'], ['abgerechnet', 'Abgerechnet'], ['abgelehnt', 'Abgelehnt'], ['alle', 'Alle']] as [id, l]}
			<button class="btn btn-sm {filter === id ? 'border-accent bg-accent' : ''}" style={filter === id ? 'color: var(--accent-ink)' : ''} aria-pressed={filter === id} onclick={() => (filter = id as typeof filter)}>{l}</button>
		{/each}
	</div>
</div>

{#if picked.length}
	<div class="card mb-3 flex flex-wrap items-center justify-between gap-3 border-accent px-4 py-3" role="status">
		<p class="text-sm"><strong>{picked.length}</strong> ausgewählt · <span class="num font-semibold">{formatEur(pickedSum)}</span> netto{#if pickedCustomers > 1} · <span class="text-danger">Bitte nur einen Kunden wählen</span>{/if}</p>
		<div class="flex gap-2"><button class="btn btn-sm" onclick={() => (picked = [])}>Auswahl aufheben</button><button class="btn btn-primary btn-sm" onclick={bill} disabled={pickedCustomers > 1}><Receipt size={14} /> In Rechnung übernehmen</button></div>
	</div>
{/if}

<div class="card overflow-x-auto">
	{#if list.length === 0}
		<EmptyState icon={PackagePlus} title="Keine Zusatzleistungen in dieser Ansicht" text="Alles, was der Kunde über die Pauschale hinaus wünscht (Fenster, Grundreinigung, Sonderreinigung), legen Sie hier an und verfolgen es bis zur Rechnung."><button class="btn btn-primary" onclick={openNew}><Plus size={14} /> Zusatzleistung</button></EmptyState>
	{:else}
		<table class="w-full min-w-[900px] border-collapse">
			<thead class="border-b border-line bg-bg/60"><tr><th class="th w-10"></th><th class="th">Leistung</th><th class="th">Stand</th><th class="th text-right">Menge × Preis</th><th class="th text-right">Netto</th><th class="th text-right">Weiter</th></tr></thead>
			<tbody class="divide-y divide-line">
				{#each list as e (e.id)}
					<tr>
						<td class="td">{#if e.status === 'ausgefuehrt'}<input type="checkbox" class="size-[18px] accent-[var(--accent)]" aria-label="{e.title} für die Rechnung auswählen" checked={picked.includes(e.id)} onchange={() => toggle(e.id)} />{/if}</td>
						<td class="td"><p class="font-medium">{e.title}</p><p class="truncate text-xs text-muted">{custName(e.customerId)}{siteName(e.siteId) ? ' · ' + siteName(e.siteId) : ''} · {formatDate(e.executedOn ?? e.date)}{e.orderedBy ? ` · bestellt von ${e.orderedBy}` : ''}</p></td>
						<td class="td"><span class="badge {badgeCls[e.status]}">{extraLabels[e.status]}</span>{#if e.invoiceId}<a href="/rechnungen" class="ml-1.5 text-xs text-accent hover:underline">{db.data.invoices.find((i) => i.id === e.invoiceId)?.number}</a>{/if}</td>
						<td class="td num text-right text-sm text-muted">{e.qty.toLocaleString('de-DE')} {e.unit === 'pauschal' ? '' : e.unit} × {formatEur(e.unitCents)}</td>
						<td class="td num text-right font-semibold">{formatEur(extraNet(e))}</td>
						<td class="td text-right whitespace-nowrap">
							{#if e.status === 'angefragt'}<button class="btn btn-sm" onclick={() => go(e, 'beauftragt')}><Check size={13} /> Beauftragen</button> <button class="btn btn-ghost btn-sm hover:text-danger" aria-label="Ablehnen" onclick={() => go(e, 'abgelehnt')}><X size={13} /></button>
							{:else if e.status === 'beauftragt'}<button class="btn btn-sm" onclick={() => go(e, 'ausgefuehrt')}><Check size={13} /> Ausgeführt</button> <button class="btn btn-ghost btn-sm hover:text-danger" aria-label="Entfällt" onclick={() => go(e, 'abgelehnt')}><X size={13} /></button>
							{:else if e.status === 'ausgefuehrt'}<button class="btn btn-ghost btn-sm" onclick={() => go(e, 'beauftragt')}>Zurück</button>
							{:else if e.status === 'abgelehnt'}<button class="btn btn-ghost btn-sm" onclick={() => go(e, 'angefragt')}>Wieder öffnen</button>{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<Dialog bind:open={nOpen} title="Zusatzleistung anlegen" description="Eine Leistung außerhalb der Pauschale." width={560}>
	{#snippet children()}
		<form id="ex-form" class="grid grid-cols-2 gap-3" onsubmit={create} novalidate>
			<div class="col-span-2 sm:col-span-1"><label class="label" for="x-c">Kunde</label><select id="x-c" class="input" bind:value={nf.customerId} onchange={pickCustomer}>{#each db.data.customers as c}<option value={c.id}>{c.name.length > 40 ? c.name.slice(0, 38) + '…' : c.name}</option>{/each}</select></div>
			<div class="col-span-2 sm:col-span-1"><label class="label" for="x-s">Objekt (optional)</label><select id="x-s" class="input" bind:value={nf.siteId}><option value="">Ohne Objekt</option>{#each nSites as s}<option value={s.id}>{s.name}</option>{/each}</select></div>
			<div class="col-span-2"><label class="label" for="x-t">Leistung</label><input id="x-t" class="input" placeholder="z. B. Fensterreinigung Treppenhaus" bind:value={nf.title} /></div>
			<div class="col-span-2"><label class="label" for="x-d">Beschreibung (optional)</label><input id="x-d" class="input" bind:value={nf.description} /></div>
			<div><label class="label" for="x-q">Menge</label><input id="x-q" class="input num" type="number" min="0" step="0.25" bind:value={nf.qty} /></div>
			<div><label class="label" for="x-u">Einheit</label><select id="x-u" class="input" bind:value={nf.unit}><option>Std.</option><option>Stk.</option><option value="pauschal">pauschal</option></select></div>
			<div><label class="label" for="x-p">Preis netto je Einheit (€)</label><input id="x-p" class="input num" inputmode="decimal" bind:value={nf.price} /></div>
			<div><label class="label" for="x-dt">Datum</label><input id="x-dt" type="date" class="input" bind:value={nf.date} /></div>
			<div class="col-span-2"><label class="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" class="size-[16px] accent-[var(--accent)]" bind:checked={nf.alreadyOrdered} /> Der Kunde hat schon beauftragt (zum Beispiel am Telefon)</label></div>
			<div class="col-span-2"><label class="label" for="x-o">Angefragt bzw. beauftragt von</label><input id="x-o" class="input" bind:value={nf.orderedBy} /></div>
			{#if nErr}<p class="col-span-2 text-sm text-danger" role="alert">{nErr}</p>{/if}
		</form>
	{/snippet}
	{#snippet footer()}<button class="btn" type="button" onclick={() => (nOpen = false)}>Abbrechen</button><button class="btn btn-primary" type="submit" form="ex-form">Anlegen</button>{/snippet}
</Dialog>

<Dialog bind:open={sOpen} title={step?.to === 'beauftragt' ? 'Beauftragt' : step?.to === 'ausgefuehrt' ? 'Als ausgeführt festhalten' : 'Zusatzleistung entfällt'} description={step?.e.title ?? ''} width={440}>
	{#snippet children()}
		{#if step}
			<div class="grid gap-3">
				{#if step.to === 'beauftragt'}<div><label class="label" for="s-o">Wer hat beim Kunden beauftragt?</label><input id="s-o" class="input" bind:value={sf.orderedBy} /></div>{/if}
				{#if step.to === 'ausgefuehrt'}<div><label class="label" for="s-e">Ausgeführt am</label><input id="s-e" type="date" class="input" max={today} bind:value={sf.executedOn} /></div>{/if}
				{#if step.to === 'abgelehnt'}<div><label class="label" for="s-r">Grund</label><input id="s-r" class="input" bind:value={sf.reason} /></div>{/if}
				{#if sErr}<p class="text-sm text-danger" role="alert">{sErr}</p>{/if}
			</div>
		{/if}
	{/snippet}
	{#snippet footer()}<button class="btn" onclick={() => (sOpen = false)}>Abbrechen</button><button class="btn btn-primary" onclick={apply}>Übernehmen</button>{/snippet}
</Dialog>
