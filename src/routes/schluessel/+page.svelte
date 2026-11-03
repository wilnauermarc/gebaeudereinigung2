<script lang="ts">
	import { db, CURRENT_USER } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { formatDateTime } from '#lib/format.ts';
	import Badge from '#lib/components/Badge.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import { KeyRound, Nfc, ShieldAlert, Plus } from '@lucide/svelte';
	import type { KeyItem } from '#lib/types.ts';

	const rows = $derived(db.data.keys.map((k) => ({ k, site: db.site(k.siteId), holder: k.holderId ? db.employee(k.holderId) : null })).sort((a, b) => (a.site?.customer.name ?? '').localeCompare(b.site?.customer.name ?? '')));
	const statusMeta = { im_buero: { label: 'Im Büro', tone: 'neutral' as const }, ausgegeben: { label: 'Ausgegeben', tone: 'info' as const }, verloren: { label: 'Verloren', tone: 'danger' as const } };

	function log(k: KeyItem, action: string) {
		k.log.push({ at: new Date().toISOString(), action, by: db.me });
	}
	let issueFor = $state<KeyItem | null>(null);
	let issueOpen = $state(false);
	let issueTo = $state('');
	function openIssue(k: KeyItem) { issueFor = k; issueTo = db.data.employees[0]?.id ?? ''; issueOpen = true; }
	function issue() {
		const k = issueFor!;
		k.holderId = issueTo; k.status = 'ausgegeben';
		log(k, `Ausgegeben an ${db.employee(issueTo)?.name}`);
		issueOpen = false;
		toasts.push(`${k.label} an ${db.employee(issueTo)?.name} ausgegeben.`, { tone: 'success' });
	}
	function takeBack(k: KeyItem) {
		const who = db.employee(k.holderId ?? '')?.name;
		k.holderId = null; k.status = 'im_buero';
		log(k, `Zurückgenommen von ${who}`);
		toasts.push(`${k.label} zurückgenommen.`, { tone: 'success' });
	}
	function lost(k: KeyItem) {
		log(k, `Als verloren gemeldet (zuletzt bei ${db.employee(k.holderId ?? '')?.name ?? 'Büro'})`);
		k.status = 'verloren'; k.holderId = null;
		toasts.push('Als verloren vermerkt. Bitte Versicherung und Kunden informieren und Schließanlage prüfen.', { tone: 'error', ms: 10000 });
	}

	let addOpen = $state(false);
	let nk = $state({ siteId: '', label: '', kind: 'schluessel' as KeyItem['kind'] });
	const siteOptions = $derived(db.data.customers.flatMap((c) => c.sites.map((s) => ({ id: s.id, label: `${c.name.length > 40 ? c.name.slice(0, 38) + '…' : c.name} · ${s.name}` }))));
	function add(ev: SubmitEvent) {
		ev.preventDefault();
		if (nk.label.trim().length < 2) return;
		db.data.keys.push({ id: 's' + Date.now().toString(36), siteId: nk.siteId, label: nk.label.trim(), kind: nk.kind, holderId: null, status: 'im_buero', log: [{ at: new Date().toISOString(), action: 'Angelegt', by: db.me }] });
		addOpen = false;
		toasts.push('Schlüssel angelegt.', { tone: 'success' });
	}
	let historyOf = $state<KeyItem | null>(null);
	let historyOpen = $state(false);
	import PageHead from '#lib/components/PageHead.svelte';
	import { keyInstruments as _keyInstruments } from '#lib/instruments.ts';
	import { todayKey as _tksch } from '#lib/format.ts';
	const instruments = $derived(_keyInstruments(db.data));
</script>

<svelte:head><title>Schlüssel · Resch Business Manager</title></svelte:head>

<PageHead {instruments} title="Schlüsselregister" subtitle={`Wer hat welchen Schlüssel oder Transponder? Jede Ausgabe wird protokolliert.`}>
	{#snippet actions()}
		<button class="btn btn-primary" onclick={() => { nk = { siteId: siteOptions[0]?.id ?? '', label: '', kind: 'schluessel' }; addOpen = true; }}><Plus size={15} /> Schlüssel</button>
	{/snippet}
</PageHead>

<div class="card overflow-x-auto">
	<table class="w-full min-w-[820px] border-collapse">
		<thead class="border-b border-line bg-bg/60"><tr><th class="th">Schlüssel</th><th class="th">Objekt</th><th class="th">Status</th><th class="th">Inhaber</th><th class="th w-[250px]"></th></tr></thead>
		<tbody class="divide-y divide-line">
			{#each rows as { k, site, holder } (k.id)}
				<tr>
					<td class="td"><span class="flex items-center gap-2 font-medium">{#if k.kind === 'transponder'}<Nfc size={14} class="text-muted" />{:else}<KeyRound size={14} class="text-muted" />{/if}{k.label}</span></td>
					<td class="td max-w-[260px]"><span class="block truncate" title={site?.customer.name}>{site?.customer.name}</span><span class="block truncate text-xs text-muted">{site?.site.name}</span></td>
					<td class="td"><Badge tone={statusMeta[k.status].tone} label={statusMeta[k.status].label} /></td>
					<td class="td text-muted">{holder?.name ?? '–'}</td>
					<td class="td">
						<div class="flex justify-end gap-1">
							<button class="btn btn-ghost btn-sm" onclick={() => { historyOf = k; historyOpen = true; }}>Verlauf</button>
							{#if k.status === 'im_buero'}<button class="btn btn-sm" onclick={() => openIssue(k)}>Ausgeben</button>{/if}
							{#if k.status === 'ausgegeben'}<button class="btn btn-sm" onclick={() => takeBack(k)}>Zurücknehmen</button><button class="btn btn-ghost btn-sm hover:text-danger" onclick={() => lost(k)}>Verloren</button>{/if}
							{#if k.status === 'verloren'}<button class="btn btn-sm" onclick={() => { k.status = 'im_buero'; log(k, 'Wiedergefunden'); }}>Wiedergefunden</button>{/if}
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
<p class="mt-3 flex items-start gap-1.5 text-xs text-muted"><ShieldAlert size={13} class="mt-px shrink-0" /> Alarmcodes und Zugangsdaten gehören nicht in diese Liste und werden hier bewusst nicht gespeichert. Ob die Betriebshaftpflicht Schlüsselverlust abdeckt, hängt vom Vertrag ab.</p>

<Dialog bind:open={issueOpen} title="Schlüssel ausgeben" description={issueFor?.label}>
	{#snippet children()}<label class="label" for="iss">Ausgabe an</label><select id="iss" class="input" bind:value={issueTo}>{#each db.data.employees as e}<option value={e.id}>{e.name}</option>{/each}</select>{/snippet}
	{#snippet footer()}<button class="btn" onclick={() => (issueOpen = false)}>Abbrechen</button><button class="btn btn-primary" onclick={issue}>Ausgeben</button>{/snippet}
</Dialog>

<Dialog bind:open={addOpen} title="Neuer Schlüssel">
	{#snippet children()}
		<form id="key-form" class="grid gap-3" onsubmit={add}>
			<div><label class="label" for="k-s">Objekt</label><select id="k-s" class="input" bind:value={nk.siteId}>{#each siteOptions as s}<option value={s.id}>{s.label}</option>{/each}</select></div>
			<div class="grid grid-cols-3 gap-3"><div class="col-span-2"><label class="label" for="k-l">Bezeichnung</label><input id="k-l" class="input" placeholder="z. B. Haustür" bind:value={nk.label} /></div><div><label class="label" for="k-k">Art</label><select id="k-k" class="input" bind:value={nk.kind}><option value="schluessel">Schlüssel</option><option value="transponder">Transponder</option></select></div></div>
		</form>
	{/snippet}
	{#snippet footer()}<button class="btn" type="button" onclick={() => (addOpen = false)}>Abbrechen</button><button class="btn btn-primary" type="submit" form="key-form">Anlegen</button>{/snippet}
</Dialog>

<Dialog bind:open={historyOpen} title="Verlauf" description={historyOf?.label}>
	{#snippet children()}
		<ol class="flex max-h-80 flex-col gap-2 overflow-y-auto">
			{#each [...(historyOf?.log ?? [])].reverse() as l}<li class="text-sm"><span class="font-medium">{l.action}</span><span class="block text-xs text-muted">{l.by} · {formatDateTime(l.at)}</span></li>{/each}
		</ol>
	{/snippet}
</Dialog>
