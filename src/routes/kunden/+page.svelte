<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { customerStatus } from '#lib/labels.ts';
	import { formatEur, relativeTime } from '#lib/format.ts';
	import Badge from '#lib/components/Badge.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { downloadBytes, toCsv } from '#lib/download.ts';
	import { parseCsv, guessMapping, customerFields, type CustomerField } from '#lib/csv.ts';
	import { Download, Upload, Plus, Search, ArrowUp, ArrowDown, SearchX, X } from '@lucide/svelte';
	import type { CustomerStatus } from '#lib/types.ts';

	type SortKey = 'name' | 'status' | 'contact' | 'sites' | 'open' | 'monthly' | 'activity';

	const initial = page.url.searchParams.get('status');
	let query = $state('');
	let status = $state<CustomerStatus | 'alle'>(initial && initial in customerStatus ? (initial as CustomerStatus) : 'alle');
	let sortKey = $state<SortKey>('activity');
	let sortDir = $state<'asc' | 'desc'>('desc');

	const rows = $derived(
		db.data.customers.map((c) => ({
			c,
			contact: c.contacts[0]?.name ?? '',
			sites: c.sites.length,
			open: db.quotesOf(c.id).filter((q) => q.status === 'entwurf' || q.status === 'versendet').length,
			monthly: db.monthlyRecurring(c.id),
			activity: db.lastActivity(c.id)
		}))
	);

	const counts = $derived({
		alle: rows.length,
		aktiv: rows.filter((r) => r.c.status === 'aktiv').length,
		interessent: rows.filter((r) => r.c.status === 'interessent').length,
		inaktiv: rows.filter((r) => r.c.status === 'inaktiv').length
	});

	const visible = $derived.by(() => {
		const s = query.trim().toLowerCase();
		const list = rows.filter(
			(r) =>
				(status === 'alle' || r.c.status === status) &&
				(!s || [r.c.name, r.c.city, r.contact, r.c.postal].some((x) => x.toLowerCase().includes(s)))
		);
		const dir = sortDir === 'asc' ? 1 : -1;
		const val = (r: (typeof rows)[number]): string | number => {
			switch (sortKey) {
				case 'name': return r.c.name.toLowerCase();
				case 'status': return r.c.status;
				case 'contact': return r.contact.toLowerCase();
				case 'sites': return r.sites;
				case 'open': return r.open;
				case 'monthly': return r.monthly;
				default: return r.activity;
			}
		};
		return list.sort((a, b) => {
			const x = val(a), y = val(b);
			return (x < y ? -1 : x > y ? 1 : 0) * dir;
		});
	});

	function sortBy(k: SortKey) {
		if (sortKey === k) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		else { sortKey = k; sortDir = k === 'name' || k === 'contact' || k === 'status' ? 'asc' : 'desc'; }
	}
	const ariaSort = (k: SortKey) => (sortKey === k ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none');

	// ── Neuer Kunde ──
	let dlg = $state(false);
	let f = $state({ name: '', contactName: '', email: '', phone: '', street: '', postal: '', city: '', note: '' });
	let errors = $state<Record<string, string>>({});

	function openNew() {
		f = { name: '', contactName: '', email: '', phone: '', street: '', postal: '', city: '', note: '' };
		errors = {};
		dlg = true;
	}
	function validate() {
		const e: Record<string, string> = {};
		if (f.name.trim().length < 2) e.name = 'Bitte einen Firmen- oder Kundennamen eingeben.';
		if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Das sieht nicht nach einer E-Mail-Adresse aus, z. B. name@firma.de.';
		if (f.postal && !/^\d{5}$/.test(f.postal)) e.postal = 'Die Postleitzahl hat 5 Ziffern.';
		errors = e;
		return Object.keys(e).length === 0;
	}
	function create(ev: SubmitEvent) {
		ev.preventDefault();
		if (!validate()) return;
		const c = db.addCustomer({
			name: f.name,
			contact: { name: f.contactName, role: '', email: f.email, phone: f.phone },
			street: f.street, postal: f.postal, city: f.city, note: f.note
		});
		dlg = false;
		toasts.push(`„${c.name}“ angelegt.`, { tone: 'success' });
		goto(`/kunden/${c.id}`);
	}

	$effect(() => { if (page.url.searchParams.get('neu')) { openNew(); history.replaceState(history.state, '', '/kunden'); } });
	function exportCsv() {
		const data = [['Name', 'Status', 'Ansprechperson', 'E-Mail', 'Telefon', 'Straße', 'PLZ', 'Ort', 'Objekte', 'Monatlich netto (EUR)']];
		for (const r of visible) data.push([r.c.name, customerStatus[r.c.status].label, r.contact, r.c.contacts[0]?.email ?? '', r.c.contacts[0]?.phone ?? '', r.c.street, r.c.postal, r.c.city, String(r.sites), (r.monthly / 100).toFixed(2).replace('.', ',')]);
		downloadBytes(toCsv(data), 'Kunden.csv', 'text/csv;charset=utf-8');
		toasts.push(`${visible.length} Kunden exportiert (CSV, Semikolon-getrennt).`, { tone: 'success' });
	}
	// ── CSV-Import: Datei wählen, Spalten zuordnen, prüfen, importieren ──
	let impOpen = $state(false);
	let impRows = $state<string[][]>([]);
	let impMap = $state<Record<CustomerField, number>>({ name: -1, contact: -1, email: -1, phone: -1, street: -1, postal: -1, city: -1 });
	let impName = $state('');
	let impErr = $state('');
	async function onCsv(e: Event) {
		impErr = '';
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		const rows = parseCsv(await file.text());
		if (rows.length < 2) return void (impErr = 'In der Datei steht nichts Lesbares. Erwartet wird eine Kopfzeile und mindestens eine Datenzeile.');
		impRows = rows; impName = file.name; impMap = guessMapping(rows[0]);
	}
	const cell = (r: string[], f: CustomerField) => (impMap[f] >= 0 ? (r[impMap[f]] ?? '').trim() : '');
	const impChecked = $derived(impRows.slice(1).map((r) => {
		const name = cell(r, 'name');
		const issues: string[] = [];
		if (name.length < 2) issues.push('Name fehlt');
		if (cell(r, 'postal') && !/^\d{5}$/.test(cell(r, 'postal'))) issues.push('PLZ ungültig');
		if (cell(r, 'email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cell(r, 'email'))) issues.push('E-Mail ungültig');
		if (name && db.data.customers.some((c) => c.name.toLowerCase() === name.toLowerCase())) issues.push('gibt es schon');
		return { r, name, issues, ok: issues.length === 0 };
	}));
	const impOk = $derived(impChecked.filter((x) => x.ok));
	function runImport() {
		for (const x of impOk) {
			const c = db.addCustomer({ name: x.name, contact: { name: cell(x.r, 'contact'), role: '', email: cell(x.r, 'email'), phone: cell(x.r, 'phone') }, street: cell(x.r, 'street'), postal: cell(x.r, 'postal'), city: cell(x.r, 'city') });
			db.data.events = db.data.events.filter((ev) => !(ev.customerId === c.id && ev.text === 'Kunde angelegt.'));
			db.addEvent(c.id, 'notiz', `Per CSV-Import angelegt (${impName}).`);
		}
		impOpen = false;
		toasts.push(`${impOk.length} Kunden importiert${impChecked.length - impOk.length ? `, ${impChecked.length - impOk.length} übersprungen` : ''}.`, { tone: 'success' });
		impRows = [];
	}
	const chips: (CustomerStatus | 'alle')[] = ['alle', 'aktiv', 'interessent', 'inaktiv'];
	import PageHead from '#lib/components/PageHead.svelte';
	import type { Instrument, NextStep } from '#lib/ux.ts';
	const activeShare = $derived(db.data.customers.length ? counts.aktiv / db.data.customers.length : 1);
	const prospects = $derived(db.data.customers.filter((c) => c.status === 'interessent'));
	const instruments = $derived<Instrument[]>([
		{ kind: 'gauge', label: 'Aktive Kunden', value: activeShare, sub: `${counts.aktiv} von ${db.data.customers.length}`, good: 0.5, warn: 0.3 },
		{ kind: 'stat', label: 'Wiederkehrend', value: formatEur(db.monthlyRecurring()), sub: 'netto pro Monat' },
		{ kind: 'stat', label: 'Interessenten', value: String(prospects.length), sub: 'noch nicht gewonnen', tone: prospects.length ? 'warn' : '' },
		{ kind: 'stat', label: 'Objekte', value: String(db.data.customers.reduce((a, c) => a + c.sites.length, 0)), sub: 'gesamt' }
	]);
	const nextStep = $derived<NextStep>(
		prospects.length ? { tone: 'info', text: `${prospects.length} Interessenten warten auf eine Entscheidung. Wie weit sind die Angebote?`, cta: { label: 'Zu den Angeboten', href: '/angebote' } }
		: { tone: 'ok', text: 'Alle Kunden sind entschieden.' }
	);
</script>

<svelte:head><title>Kunden · Resch Business Manager</title></svelte:head>

<PageHead title="Kunden" subtitle={`${counts.alle} Kunden, ${formatEur(db.monthlyRecurring())} monatlich wiederkehrend`} {instruments} next={nextStep}>
	{#snippet actions()}
		<button class="btn" onclick={() => { impRows = []; impErr = ''; impOpen = true; }}><Upload size={14} /> Import</button><button class="btn" onclick={exportCsv} disabled={!visible.length}><Download size={14} /> CSV</button><button class="btn btn-primary" onclick={openNew}><Plus size={15} /> Neuer Kunde</button>
	{/snippet}
</PageHead>

<div class="mb-3 flex flex-wrap items-center gap-2">
	<div class="relative w-full sm:w-72">
		<Search size={14} class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-faint" />
		<input data-search class="input pl-8" placeholder="Name, Ort oder Ansprechperson …" aria-label="Kunden durchsuchen" bind:value={query} />
		{#if query}
			<button class="absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-1 text-faint hover:text-fg" aria-label="Suche leeren" onclick={() => (query = '')}><X size={13} /></button>
		{/if}
	</div>
	<div class="flex flex-wrap gap-1" role="group" aria-label="Nach Status filtern">
		{#each chips as chip}
			<button
				class="btn btn-sm {status === chip ? 'border-accent bg-accent text-white' : ''}"
				aria-pressed={status === chip}
				onclick={() => (status = chip)}
			>
				{chip === 'alle' ? 'Alle' : customerStatus[chip].label}
				<span class="num text-muted">{counts[chip]}</span>
			</button>
		{/each}
	</div>
</div>

<div class="card overflow-x-auto">
	<table class="w-full min-w-[820px] border-collapse">
		<thead class="border-b border-line bg-bg/60">
			<tr>
				{#snippet th(k: SortKey, label: string, cls = '')}
					<th class="th {cls}" aria-sort={ariaSort(k)}>
						<button class="inline-flex items-center gap-1 hover:text-fg {cls.includes('text-right') ? 'flex-row-reverse' : ''}" onclick={() => sortBy(k)}>
							{label}
							{#if sortKey === k}{#if sortDir === 'asc'}<ArrowUp size={12} />{:else}<ArrowDown size={12} />{/if}{/if}
						</button>
					</th>
				{/snippet}
				{@render th('name', 'Kunde')}
				{@render th('status', 'Status')}
				{@render th('contact', 'Ansprechperson')}
				{@render th('sites', 'Objekte', 'text-right')}
				{@render th('open', 'Offene Angebote', 'text-right')}
				{@render th('monthly', 'Monatlich', 'text-right')}
				{@render th('activity', 'Zuletzt aktiv', 'text-right')}
			</tr>
		</thead>
		<tbody class="divide-y divide-line">
			{#each visible as r (r.c.id)}
				<tr class="group cursor-pointer hover:bg-subtle/60" onclick={() => goto(`/kunden/${r.c.id}`)}>
					<td class="td max-w-[360px]">
						<div class="flex items-center gap-3">
							<Avatar name={r.c.name} size={30} />
							<div class="min-w-0">
								<a href="/kunden/{r.c.id}" class="block truncate font-medium group-hover:text-accent" title={r.c.name} onclick={(e) => e.stopPropagation()}>{r.c.name}</a>
								<span class="block truncate text-xs text-muted">{r.c.postal} {r.c.city}</span>
							</div>
						</div>
					</td>
					<td class="td"><Badge tone={customerStatus[r.c.status].tone} label={customerStatus[r.c.status].label} /></td>
					<td class="td max-w-[180px] truncate text-muted">{r.contact || '–'}</td>
					<td class="td num text-right">{r.sites}</td>
					<td class="td num text-right">{r.open || '–'}</td>
					<td class="td num text-right">{r.monthly ? formatEur(r.monthly) : '–'}</td>
					<td class="td text-right text-xs whitespace-nowrap text-muted">{relativeTime(r.activity)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	{#if visible.length === 0}
		<EmptyState icon={SearchX} title="Keine Kunden gefunden" text="Zu dieser Suche und diesem Filter gibt es keine Treffer. Prüfen Sie die Schreibweise oder setzen Sie den Filter zurück.">
			<button class="btn" onclick={() => { query = ''; status = 'alle'; }}>Filter zurücksetzen</button>
		</EmptyState>
	{/if}
</div>

<Dialog bind:open={dlg} title="Neuer Kunde" description="Nur der Name ist Pflicht. Alles Weitere lässt sich später ergänzen." width={520}>
	{#snippet children()}
		<form id="new-customer" class="grid grid-cols-6 gap-3" onsubmit={create} novalidate>
			<div class="col-span-6">
				<label class="label" for="nc-name">Kundenname *</label>
				<!-- svelte-ignore a11y_autofocus -->
				<input id="nc-name" class="input" autofocus aria-invalid={!!errors.name} aria-describedby="nc-name-e" bind:value={f.name} placeholder="z. B. Hausverwaltung Muster GmbH" />
				{#if errors.name}<p id="nc-name-e" class="mt-1 text-xs text-danger">{errors.name}</p>{/if}
			</div>
			<div class="col-span-6 sm:col-span-3">
				<label class="label" for="nc-cn">Ansprechperson</label>
				<input id="nc-cn" class="input" bind:value={f.contactName} />
			</div>
			<div class="col-span-6 sm:col-span-3">
				<label class="label" for="nc-ph">Telefon</label>
				<input id="nc-ph" class="input" type="tel" bind:value={f.phone} />
			</div>
			<div class="col-span-6">
				<label class="label" for="nc-em">E-Mail</label>
				<input id="nc-em" class="input" type="email" aria-invalid={!!errors.email} bind:value={f.email} />
				{#if errors.email}<p class="mt-1 text-xs text-danger">{errors.email}</p>{/if}
			</div>
			<div class="col-span-6">
				<label class="label" for="nc-st">Straße und Hausnummer</label>
				<input id="nc-st" class="input" bind:value={f.street} />
			</div>
			<div class="col-span-2">
				<label class="label" for="nc-pl">PLZ</label>
				<input id="nc-pl" class="input num" inputmode="numeric" maxlength="5" aria-invalid={!!errors.postal} bind:value={f.postal} />
				{#if errors.postal}<p class="mt-1 text-xs text-danger">{errors.postal}</p>{/if}
			</div>
			<div class="col-span-4">
				<label class="label" for="nc-ci">Ort</label>
				<input id="nc-ci" class="input" bind:value={f.city} />
			</div>
			<div class="col-span-6">
				<label class="label" for="nc-no">Hinweis zum Objekt (Zugang, Besonderheiten)</label>
				<input id="nc-no" class="input" placeholder="z. B. Souterrainwohnung, bitte an der Tür unten klopfen" bind:value={f.note} />
			</div>
		</form>
	{/snippet}
	{#snippet footer()}
		<button class="btn" type="button" onclick={() => (dlg = false)}>Abbrechen</button>
		<button class="btn btn-primary" type="submit" form="new-customer">Kunde anlegen</button>
	{/snippet}
</Dialog>

<Dialog bind:open={impOpen} title="Kunden aus CSV importieren" description="Aus Excel oder einer anderen Software: speichern Sie die Tabelle als CSV und wählen Sie die Datei." width={760}>
	{#snippet children()}
		{#if impRows.length === 0}
			<label class="grid cursor-pointer place-items-center gap-1 rounded-xl border-2 border-dashed border-line-strong px-6 py-10 text-center hover:bg-subtle/60">
				<Upload size={22} class="text-muted" /><span class="text-sm font-semibold">CSV-Datei wählen</span><span class="text-xs text-muted">Trennzeichen (Semikolon, Komma, Tab) und Spalten erkennt die App selbst. Erste Zeile = Überschriften.</span>
				<input type="file" accept=".csv,.txt,text/csv" class="sr-only" onchange={onCsv} />
			</label>
			{#if impErr}<p class="mt-3 text-sm text-danger" role="alert">{impErr}</p>{/if}
		{:else}
			<p class="mb-3 text-sm"><strong>{impName}</strong>: {impRows.length - 1} Zeilen. Prüfen Sie die Zuordnung der Spalten.</p>
			<div class="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
				{#each customerFields as f (f.key)}
					<div><label class="label" for="m-{f.key}">{f.label}</label><select id="m-{f.key}" class="input" bind:value={impMap[f.key]}><option value={-1}>nicht importieren</option>{#each impRows[0] as h, i}<option value={i}>{h || `Spalte ${i + 1}`}</option>{/each}</select></div>
				{/each}
			</div>
			<div class="max-h-60 overflow-auto rounded-lg border border-line">
				<table class="w-full border-collapse text-sm"><thead class="bg-bg/60"><tr><th class="th">Name</th><th class="th">Ort</th><th class="th">Prüfung</th></tr></thead>
					<tbody class="divide-y divide-line">{#each impChecked.slice(0, 40) as x}<tr><td class="px-3 py-1.5">{x.name || '–'}</td><td class="px-3 py-1.5 text-muted">{cell(x.r, 'postal')} {cell(x.r, 'city')}</td><td class="px-3 py-1.5">{#if x.ok}<Badge tone="success" label="bereit" />{:else}<Badge tone="warn" label={x.issues.join(', ')} />{/if}</td></tr>{/each}</tbody></table>
			</div>
			{#if impChecked.length > 40}<p class="mt-1 text-xs text-muted">Vorschau der ersten 40 von {impChecked.length} Zeilen.</p>{/if}
			<p class="mt-3 text-sm"><strong>{impOk.length}</strong> Kunden werden angelegt, {impChecked.length - impOk.length} übersprungen. Neue Kunden starten als Interessenten.</p>
		{/if}
	{/snippet}
	{#snippet footer()}
		<button class="btn" onclick={() => (impOpen = false)}>Abbrechen</button>
		{#if impRows.length}<button class="btn" onclick={() => (impRows = [])}>Andere Datei</button><button class="btn btn-primary" onclick={runImport} disabled={!impOk.length}>{impOk.length} Kunden importieren</button>{/if}
	{/snippet}
</Dialog>
