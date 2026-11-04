<script lang="ts">
	import { page } from '$app/state';
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { todayKey, formatDate, dayDiff, relativeDay } from '#lib/format.ts';
	import Badge from '#lib/components/Badge.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { Plus, FileCheck2, Trash2, Info } from '@lucide/svelte';
	import type { DocItem } from '#lib/types.ts';

	const today = todayKey();
	const kindLabel: Record<DocItem['kind'], string> = { versicherung: 'Versicherung', unbedenklichkeit: 'Unbedenklichkeitsbescheinigung', freistellung: 'Freistellungsbescheinigung', sonstiges: 'Sonstiges' };
	function docState(d: DocItem) {
		if (!d.validUntil) return { tone: 'neutral' as const, label: 'unbefristet', rank: 3 };
		const n = dayDiff(d.validUntil);
		return n < 0 ? { tone: 'danger' as const, label: `abgelaufen vor ${-n} Tagen`, rank: 0 } : n <= 60 ? { tone: 'warn' as const, label: `läuft ${relativeDay(d.validUntil)} ab`, rank: 1 } : { tone: 'success' as const, label: 'gültig', rank: 2 };
	}
	const groups = $derived.by(() => {
		const by = new Map<string, DocItem[]>();
		for (const d of db.data.docs) (by.get(d.owner) ?? by.set(d.owner, []).get(d.owner)!).push(d);
		return [...by.entries()].map(([owner, docs]) => ({ owner, type: docs[0].ownerType, docs: docs.sort((a, b) => docState(a).rank - docState(b).rank) }))
			.sort((a, b) => (a.type === b.type ? a.owner.localeCompare(b.owner) : a.type === 'betrieb' ? -1 : 1));
	});
	const problems = $derived(db.data.docs.filter((d) => docState(d).rank <= 1).length);

	let open = $state(false);
	let f = $state({ kind: 'versicherung' as DocItem['kind'], title: '', ownerType: 'subunternehmer' as DocItem['ownerType'], owner: '', validUntil: '', note: '' });
	let err = $state('');
	$effect(() => { if (page.url.searchParams.get('neu')) openNew(); });
	function openNew() { f = { kind: 'versicherung', title: 'Betriebshaftpflicht', ownerType: 'subunternehmer', owner: '', validUntil: '', note: '' }; err = ''; open = true; }
	function save(e: SubmitEvent) {
		e.preventDefault();
		if (f.title.trim().length < 3 || f.owner.trim().length < 2) return (err = 'Bezeichnung und Inhaber angeben.');
		db.data.docs.push({ id: 'n' + Date.now().toString(36), kind: f.kind, title: f.title.trim(), ownerType: f.ownerType, owner: f.ownerType === 'betrieb' ? 'Gebäude-Reinigung' : f.owner.trim(), validUntil: f.validUntil || null, note: f.note.trim() });
		open = false;
		toasts.push('Nachweis erfasst.', { tone: 'success' });
	}
	function remove(d: DocItem) {
		const i = db.data.docs.findIndex((x) => x.id === d.id);
		const [r] = db.data.docs.splice(i, 1);
		toasts.push('Nachweis gelöscht.', { action: { label: 'Rückgängig', run: () => db.data.docs.push(r) } });
	}
	import PageHead from '#lib/components/PageHead.svelte';
	import { docInstruments as _docInstruments } from '#lib/instruments.ts';
	import { todayKey as _tknac } from '#lib/format.ts';
	const instruments = $derived(_docInstruments(db.data, _tknac()));
</script>

<svelte:head><title>Nachweise · Putzbetrieb</title></svelte:head>

<PageHead {instruments} title="Nachweise und Subunternehmer" subtitle={`${problems ? problems + (problems === 1 ? ' Nachweis' : ' Nachweise') + ' abgelaufen oder bald fällig' : 'Alle Nachweise gültig'}. Fristen im Blick, bevor sie zum Problem werden.`}>
	{#snippet actions()}
		<button class="btn btn-primary" onclick={openNew}><Plus size={15} /> Nachweis</button>
	{/snippet}
</PageHead>

{#if groups.length === 0}
	<div class="card"><EmptyState icon={FileCheck2} title="Noch keine Nachweise" text="Versicherungen und Bescheinigungen mit Ablaufdatum erfassen Sie hier." /></div>
{:else}
	<div class="flex flex-col gap-4">
		{#each groups as g (g.owner)}
			<section class="card">
				<div class="flex items-center justify-between border-b border-line px-4 py-3">
					<h2 class="card-title">{g.owner}</h2>
					<Badge tone={g.type === 'betrieb' ? 'info' : 'neutral'} label={g.type === 'betrieb' ? 'Eigener Betrieb' : 'Subunternehmer'} />
				</div>
				<ul class="divide-y divide-line">
					{#each g.docs as d (d.id)}
						{@const st = docState(d)}
						<li class="group flex flex-wrap items-center gap-3 px-4 py-3">
							<div class="min-w-[220px] flex-1"><p class="text-sm font-medium">{d.title}</p><p class="text-xs text-muted">{kindLabel[d.kind]}{d.note ? ` · ${d.note}` : ''}</p></div>
							<span class="num text-xs text-muted">{d.validUntil ? `gültig bis ${formatDate(d.validUntil)}` : ''}</span>
							<Badge tone={st.tone} label={st.label} />
							<button class="btn btn-ghost btn-icon btn-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-danger" aria-label="Nachweis löschen" onclick={() => remove(d)}><Trash2 size={14} /></button>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
{/if}
<p class="mt-3 flex items-start gap-1.5 text-xs text-muted"><Info size={13} class="mt-px shrink-0" /> Hier stehen nur Art, Inhaber und Ablaufdatum, keine Dateien. Der Auftraggeber haftet für den Mindestlohn von Subunternehmern (§ 14 AEntG), deshalb lohnen aktuelle Nachweise.</p>

<Dialog bind:open title="Neuer Nachweis" width={520}>
	{#snippet children()}
		<form id="doc-form" class="grid grid-cols-2 gap-3" onsubmit={save} novalidate>
			<div><label class="label" for="d-o">Gehört zu</label><select id="d-o" class="input" bind:value={f.ownerType}><option value="subunternehmer">Subunternehmer</option><option value="betrieb">Eigener Betrieb</option></select></div>
			<div><label class="label" for="d-k">Art</label><select id="d-k" class="input" bind:value={f.kind}>{#each Object.entries(kindLabel) as [k, l]}<option value={k}>{l}</option>{/each}</select></div>
			{#if f.ownerType === 'subunternehmer'}<div class="col-span-2"><label class="label" for="d-n">Name des Subunternehmers</label><input id="d-n" class="input" list="subs" bind:value={f.owner} /><datalist id="subs">{#each [...new Set(db.data.docs.filter((d) => d.ownerType === 'subunternehmer').map((d) => d.owner))] as n}<option value={n}></option>{/each}</datalist></div>{/if}
			<div class="col-span-2"><label class="label" for="d-t">Bezeichnung</label><input id="d-t" class="input" bind:value={f.title} /></div>
			<div><label class="label" for="d-v">Gültig bis</label><input id="d-v" type="date" class="input" bind:value={f.validUntil} /></div>
			<div><label class="label" for="d-no">Notiz</label><input id="d-no" class="input" bind:value={f.note} /></div>
			{#if err}<p class="col-span-2 text-xs text-danger">{err}</p>{/if}
		</form>
	{/snippet}
	{#snippet footer()}<button class="btn" type="button" onclick={() => (open = false)}>Abbrechen</button><button class="btn btn-primary" type="submit" form="doc-form">Erfassen</button>{/snippet}
</Dialog>
