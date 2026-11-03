<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { caseStatus, newCase, stepLabels, caseNet } from '#lib/cases.ts';
	import { formatEur, relativeTime, dayDiff } from '#lib/format.ts';
	import Avatar from '#lib/components/Avatar.svelte';
	import Badge from '#lib/components/Badge.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { Plus, Search, Inbox } from '@lucide/svelte';

	let filter = $state<'aktiv' | 'abgeschlossen' | 'beendet' | 'alle'>('aktiv');
	let query = $state('');
	const rows = $derived(
		db.data.cases.map((c) => ({ c, s: caseStatus(db.data, c), customer: db.customer(c.customerId) }))
			.filter((r) => {
				const k = r.s.closed;
				const ok = filter === 'alle' ? true : filter === 'aktiv' ? !k : filter === 'abgeschlossen' ? k === 'abgeschlossen' : k === 'abgesagt' || k === 'abgelehnt';
				const q = query.trim().toLowerCase();
				return ok && (!q || r.c.title.toLowerCase().includes(q) || r.c.number.toLowerCase().includes(q) || (r.customer?.name ?? '').toLowerCase().includes(q));
			})
			.sort((a, b) => b.c.createdAt.localeCompare(a.c.createdAt))
	);
	const counts = $derived({
		aktiv: db.data.cases.filter((c) => !caseStatus(db.data, c).closed).length,
		abgeschlossen: db.data.cases.filter((c) => caseStatus(db.data, c).closed === 'abgeschlossen').length,
		beendet: db.data.cases.filter((c) => ['abgesagt', 'abgelehnt'].includes(caseStatus(db.data, c).closed ?? '')).length,
		alle: db.data.cases.length
	});
	const closedLabel = { abgesagt: 'Abgesagt', abgelehnt: 'Abgelehnt', abgeschlossen: 'Abgeschlossen' } as const;

	let open = $state(false);
	let f = $state({ customerId: '', title: '', siteId: '' });
	// Eine neue Anfrage kommt meist von jemandem, der noch nicht im System ist: Kunde direkt hier mit anlegen
	let mode = $state<'neu' | 'bestehend'>('neu');
	let nc = $state({ name: '', contact: '', email: '', phone: '', street: '', postal: '', city: '', note: '' });
	let ncErr = $state('');
	let err = $state('');
	const sites = $derived(db.customer(f.customerId)?.sites ?? []);
	function openNew() {
		f = { customerId: db.data.customers[0]?.id ?? '', title: '', siteId: '' };
		nc = { name: '', contact: '', email: '', phone: '', street: '', postal: '', city: '', note: '' };
		mode = 'neu'; err = ''; ncErr = ''; open = true;
	}
	$effect(() => { if (page.url.searchParams.get('neu')) { openNew(); history.replaceState(history.state, '', '/vorgaenge'); } });
	function save(e: SubmitEvent) {
		e.preventDefault();
		if (f.title.trim().length < 4) return (err = 'Bitte kurz beschreiben, worum es geht, z. B. „Büroreinigung 3 x pro Woche“.');
		let customerId = f.customerId, siteId = f.siteId || null;
		let createdCustomer = false;
		if (mode === 'neu') {
			if (nc.name.trim().length < 2) return (ncErr = 'Bitte den Namen des Kunden oder der Firma eingeben.');
			if (nc.postal && !/^\d{5}$/.test(nc.postal)) return (ncErr = 'Die Postleitzahl hat 5 Ziffern.');
			const cust = db.addCustomer({ name: nc.name, contact: { name: nc.contact.trim(), role: '', email: nc.email.trim(), phone: nc.phone.trim() }, street: nc.street.trim(), postal: nc.postal.trim(), city: nc.city.trim(), note: nc.note });
			customerId = cust.id; siteId = cust.sites[0]?.id ?? null; createdCustomer = true;
		} else if (!db.customer(customerId)) return (err = 'Bitte einen Kunden wählen.');
		const c = newCase(db.data, customerId, f.title.trim(), siteId, db.me);
		db.data.cases.push(c);
		db.addEvent(c.customerId, 'anfrage', `Vorgang ${c.number} angelegt: ${c.title}.`);
		open = false;
		toasts.push(createdCustomer ? `Vorgang ${c.number} und neuer Kunde „${nc.name.trim().slice(0, 30)}“ angelegt.` : `Vorgang ${c.number} angelegt.`, { tone: 'success' });
		goto(`/vorgaenge/${c.id}`);
	}
	import PageHead from '#lib/components/PageHead.svelte';
	import type { Instrument, NextStep } from '#lib/ux.ts';
	const statusAll = $derived(db.data.cases.map((c) => ({ c, s: caseStatus(db.data, c) })));
	const activeCases = $derived(statusAll.filter((x) => !x.s.closed));
	const waiting = $derived(activeCases.filter((x) => x.s.current === 'rueckmeldung'));
	const doneN = $derived(statusAll.filter((x) => x.s.closed === 'abgeschlossen').length);
	const endedN = $derived(statusAll.filter((x) => x.s.closed === 'abgesagt' || x.s.closed === 'abgelehnt').length);
	const pipeline = $derived(activeCases.reduce((a, x) => a + (caseNet(db.data, x.c) ?? 0), 0));
	const instruments = $derived<Instrument[]>([
		{ kind: 'gauge', label: 'Abschlussquote', value: doneN + endedN ? doneN / (doneN + endedN) : 1, sub: `${doneN} abgeschlossen, ${endedN} beendet`, good: 0.6, warn: 0.4 },
		{ kind: 'stat', label: 'Aktive Vorgänge', value: String(activeCases.length), sub: 'im Ablauf' },
		{ kind: 'stat', label: 'Warten auf Antwort', value: String(waiting.length), sub: 'Angebot versendet', tone: waiting.length ? 'warn' : '' },
		{ kind: 'stat', label: 'Wert in Arbeit', value: formatEur(pipeline), sub: 'netto, aktive Vorgänge' }
	]);
	const oldest = $derived([...waiting].sort((a, b) => (a.s.quote?.sentAt ?? '').localeCompare(b.s.quote?.sentAt ?? ''))[0]);
	const fresh = $derived(activeCases.find((x) => x.s.current === 'anfrage'));
	const nextStep = $derived<NextStep>(
		fresh ? { tone: 'warn', text: `Neue Anfrage von ${fresh.c.title ? db.customer(fresh.c.customerId)?.name.slice(0, 40) : ''} wartet auf Ihre Entscheidung: annehmen oder absagen?`, cta: { label: 'Vorgang öffnen', href: `/vorgaenge/${fresh.c.id}` } }
		: oldest ? { tone: 'info', text: `${db.customer(oldest.c.customerId)?.name.slice(0, 40)}: Angebot ${oldest.s.quote?.number} wartet seit ${oldest.s.quote?.sentAt ? -dayDiff(oldest.s.quote.sentAt.slice(0, 10)) : '?'} Tagen auf eine Antwort. Nachfassen?`, cta: { label: 'Vorgang öffnen', href: `/vorgaenge/${oldest.c.id}` } }
		: { tone: 'ok', text: 'Keine Vorgänge warten auf Sie.' }
	);
</script>

<svelte:head><title>Vorgänge · Objektia</title></svelte:head>

<PageHead title="Vorgänge" subtitle={`Jede Kundenanfrage als geführter Ablauf bis zur Projektzeitliste.`} {instruments} next={nextStep}>
	{#snippet actions()}
		<button class="btn btn-primary" onclick={openNew}><Plus size={15} /> Neuer Vorgang</button>
	{/snippet}
</PageHead>

<div class="mb-3 flex flex-wrap items-center gap-2">
	<div class="relative w-full sm:w-72"><Search size={14} class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-faint" /><input data-search class="input pl-8" placeholder="Vorgang oder Kunde …" aria-label="Vorgänge durchsuchen" bind:value={query} /></div>
	<div class="flex flex-wrap gap-1" role="group" aria-label="Filtern">
		{#each [['aktiv', 'Aktiv'], ['abgeschlossen', 'Abgeschlossen'], ['beendet', 'Beendet'], ['alle', 'Alle']] as [id, l]}
			<button class="btn btn-sm {filter === id ? 'border-accent bg-accent text-white' : ''}" aria-pressed={filter === id} onclick={() => (filter = id as typeof filter)}>{l} <span class="num opacity-70">{counts[id as keyof typeof counts]}</span></button>
		{/each}
	</div>
</div>

<div class="card overflow-x-auto">
	{#if rows.length === 0}
		<EmptyState icon={Inbox} title="Keine Vorgänge in dieser Ansicht" text="Legen Sie für jede neue Anfrage einen Vorgang an. Die App führt Sie dann Schritt für Schritt bis zur Projektzeitliste."><button class="btn btn-primary" onclick={openNew}><Plus size={14} /> Neuer Vorgang</button></EmptyState>
	{:else}
		<table class="w-full min-w-[860px] border-collapse">
			<thead class="border-b border-line bg-bg/60"><tr><th class="th">Vorgang</th><th class="th">Fortschritt</th><th class="th">Stand</th><th class="th text-right">Wert netto</th><th class="th">Zuständig</th><th class="th text-right">Erfasst</th></tr></thead>
			<tbody class="divide-y divide-line">
				{#each rows as { c, s, customer } (c.id)}
					<tr class="cursor-pointer" onclick={() => goto(`/vorgaenge/${c.id}`)}>
						<td class="td max-w-[340px]"><div class="flex items-center gap-3"><Avatar name={customer?.name ?? ''} size={30} /><div class="min-w-0"><a href="/vorgaenge/{c.id}" class="block truncate font-medium hover:text-accent" onclick={(e) => e.stopPropagation()}>{c.title}</a><span class="block truncate text-xs text-muted">{c.number} · {customer?.name}</span></div></div></td>
						<td class="td"><div class="flex gap-0.5" role="img" aria-label="{Math.round(s.progress * 8)} von 8 Schritten erledigt">{#each s.steps as st}<span class="h-1.5 w-4 rounded-full {st.state === 'done' ? 'bg-accent' : st.state === 'skipped' ? 'bg-accent/35' : st.state === 'current' ? 'bg-side' : st.state === 'ended' ? 'bg-danger' : 'bg-line'}"></span>{/each}</div></td>
						<td class="td">{#if s.closed}<Badge tone={s.closed === 'abgeschlossen' ? 'success' : 'danger'} label={closedLabel[s.closed]} />{:else}<Badge tone="info" label={stepLabels[s.current!]} />{/if}</td>
						<td class="td num text-right">{caseNet(db.data, c) ? formatEur(caseNet(db.data, c)) : '–'}</td>
						<td class="td text-muted">{c.assignee}</td>
						<td class="td text-right text-xs whitespace-nowrap text-muted">{relativeTime(c.createdAt)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<Dialog bind:open title="Neuer Vorgang" description="Eine Kundenanfrage, die Sie durch den Ablauf führen möchten." width={560}>
	{#snippet children()}
		<form id="case-form" class="grid gap-3" onsubmit={save} novalidate>
			<div class="inline-flex rounded-lg border border-line-strong bg-surface p-0.5" role="group" aria-label="Kunde">
				<button type="button" class="btn btn-sm !border-0 {mode === 'neu' ? 'bg-accent-soft text-accent' : 'btn-ghost'}" aria-pressed={mode === 'neu'} onclick={() => (mode = 'neu')}>Neuer Kunde</button>
				<button type="button" class="btn btn-sm !border-0 {mode === 'bestehend' ? 'bg-accent-soft text-accent' : 'btn-ghost'}" aria-pressed={mode === 'bestehend'} disabled={!db.data.customers.length} onclick={() => (mode = 'bestehend')}>Bestehender Kunde</button>
			</div>
			{#if mode === 'neu'}
				<div class="grid grid-cols-6 gap-3 rounded-lg bg-subtle/60 p-3">
					<div class="col-span-6"><label class="label" for="nc-n">Name / Firma *</label><input id="nc-n" class="input" aria-invalid={!!ncErr} bind:value={nc.name} />{#if ncErr}<p class="mt-1 text-xs text-danger">{ncErr}</p>{/if}</div>
					<div class="col-span-6 sm:col-span-2"><label class="label" for="nc-c">Ansprechperson</label><input id="nc-c" class="input" bind:value={nc.contact} /></div>
					<div class="col-span-6 sm:col-span-2"><label class="label" for="nc-e">E-Mail</label><input id="nc-e" type="email" class="input" bind:value={nc.email} /></div>
					<div class="col-span-6 sm:col-span-2"><label class="label" for="nc-t">Telefon</label><input id="nc-t" type="tel" class="input" bind:value={nc.phone} /></div>
					<div class="col-span-6"><label class="label" for="nc-s">Straße (optional, wird als Objekt angelegt)</label><input id="nc-s" class="input" bind:value={nc.street} /></div>
					<div class="col-span-2"><label class="label" for="nc-p">PLZ</label><input id="nc-p" class="input num" maxlength="5" bind:value={nc.postal} /></div>
					<div class="col-span-4"><label class="label" for="nc-o">Ort</label><input id="nc-o" class="input" bind:value={nc.city} /></div>
					<div class="col-span-6"><label class="label" for="nc-no">Hinweis zum Objekt (Zugang, Besonderheiten)</label><input id="nc-no" class="input" placeholder="z. B. Souterrainwohnung, bitte an der Tür unten klopfen" bind:value={nc.note} /></div>
					<p class="col-span-6 text-xs text-muted">Der Kunde wird als „Interessent“ angelegt und wird mit der Annahme des Angebots zum aktiven Kunden.</p>
				</div>
			{:else}
				<div><label class="label" for="cv-c">Kunde</label><select id="cv-c" class="input" bind:value={f.customerId} onchange={() => (f.siteId = '')}>{#each [...db.data.customers].sort((a, b) => a.name.localeCompare(b.name)) as c}<option value={c.id}>{c.name.length > 46 ? c.name.slice(0, 44) + '…' : c.name}</option>{/each}</select></div>
			{/if}
			<div><label class="label" for="cv-t">Worum geht es?</label><input id="cv-t" class="input" aria-invalid={!!err} placeholder="z. B. Büroreinigung 3 x pro Woche" bind:value={f.title} />{#if err}<p class="mt-1 text-xs text-danger">{err}</p>{/if}</div>
			{#if mode === 'bestehend' && sites.length}<div><label class="label" for="cv-s">Objekt (optional)</label><select id="cv-s" class="input" bind:value={f.siteId}><option value="">Noch offen</option>{#each sites as s}<option value={s.id}>{s.name}</option>{/each}</select></div>{/if}
		</form>
	{/snippet}
	{#snippet footer()}<button class="btn" type="button" onclick={() => (open = false)}>Abbrechen</button><button class="btn btn-primary" type="submit" form="case-form">Vorgang anlegen</button>{/snippet}
</Dialog>
