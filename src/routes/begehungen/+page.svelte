<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { addDays } from '#lib/calc.ts';
	import { formatDate, todayKey } from '#lib/format.ts';
	import Badge from '#lib/components/Badge.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { Plus, ClipboardCheck, ChevronDown, Info } from '@lucide/svelte';
	import type { InspectionItem } from '#lib/types.ts';

	const today = todayKey();
	const labels = ['Böden', 'Sanitärräume', 'Oberflächen und Möbel', 'Müllentsorgung', 'Glas und Fenster', 'Spender und Verbrauchsmaterial'];
	const score = (items: InspectionItem[]) => {
		const rated = items.filter((i) => i.rating !== 'na');
		return rated.length ? Math.round((rated.filter((i) => i.rating === 'ok').length / rated.length) * 100) : 100;
	};
	const rows = $derived([...db.data.inspections].sort((a, b) => b.date.localeCompare(a.date)));
	/** Entwicklung je Objekt: Differenz zur vorherigen Begehung */
	function trend(siteId: string, date: string, s: number) {
		const prev = db.data.inspections.filter((x) => x.siteId === siteId && x.date < date).sort((a, b) => b.date.localeCompare(a.date))[0];
		return prev ? s - score(prev.items) : null;
	}
	let expanded = $state<string | null>(null);

	let open = $state(false);
	let f = $state({ siteId: '', date: today, note: '', createDefects: true, shared: false, items: [] as InspectionItem[] });
	const siteOptions = $derived(db.data.customers.flatMap((c) => c.sites.map((s) => ({ id: s.id, label: `${c.name.length > 40 ? c.name.slice(0, 38) + '…' : c.name} · ${s.name}` }))));
	function openNew() {
		f = { siteId: siteOptions[0]?.id ?? '', date: today, note: '', createDefects: true, shared: false, items: labels.map((label, i) => ({ id: String(i), label, rating: 'ok', note: '' })) };
		open = true;
	}
	const liveScore = $derived(score(f.items));
	const bad = $derived(f.items.filter((i) => i.rating === 'mangel'));
	function save(ev: SubmitEvent) {
		ev.preventDefault();
		const id = 'b' + Date.now().toString(36);
		db.data.inspections.push({ id, siteId: f.siteId, date: f.date, inspector: db.me, note: f.note.trim(), shared: f.shared, items: $state.snapshot(f.items) });
		const s = db.site(f.siteId);
		if (f.createDefects && s) {
			for (const it of bad)
				db.data.defects.push({ id: 'd' + id + it.id, customerId: s.customer.id, siteId: f.siteId, title: `${it.label}: Nachbesserung`, description: it.note || 'Bei der Begehung festgestellt.', status: 'offen', severity: 'normal', reportedOn: f.date, dueOn: addDays(f.date, 3), closedOn: null, recheck: true, source: 'begehung' });
		}
		if (s) db.addEvent(s.customer.id, 'besichtigung', `Begehung ${s.site.name}: ${liveScore} % erfüllt${bad.length ? `, ${bad.length} Mangel/Mängel` : ''}.`);
		open = false;
		toasts.push(f.createDefects && bad.length ? `Begehung gespeichert, ${bad.length} Mängel angelegt.` : 'Begehung gespeichert.', { tone: 'success' });
	}
	import PageHead from '#lib/components/PageHead.svelte';
	import { inspectionInstruments as _inspectionInstruments } from '#lib/instruments.ts';
	import { todayKey as _tkbeg } from '#lib/format.ts';
	const instruments = $derived(_inspectionInstruments(db.data, _tkbeg()));
</script>

<svelte:head><title>Begehungen · Resch Business Manager</title></svelte:head>

<PageHead {instruments} title="Begehungen" subtitle={`Qualitätskontrolle je Objekt mit Checkliste. Festgestellte Mängel wandern direkt in die Mängelliste.`}>
	{#snippet actions()}
		<button class="btn btn-primary" onclick={openNew}><Plus size={15} /> Neue Begehung</button>
	{/snippet}
</PageHead>

<div class="card">
	{#if rows.length === 0}
		<EmptyState icon={ClipboardCheck} title="Noch keine Begehung" text="Regelmäßige Kontrollen belegen die Qualität gegenüber dem Kunden und zeigen Probleme früh.">
			<button class="btn btn-primary" onclick={openNew}><Plus size={14} /> Erste Begehung</button>
		</EmptyState>
	{:else}
		<ul class="divide-y divide-line">
			{#each rows as r (r.id)}
				{@const s = db.site(r.siteId)}
				{@const sc = score(r.items)}
				{@const tr = trend(r.siteId, r.date, sc)}
				<li>
					<button class="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-subtle/60" aria-expanded={expanded === r.id} onclick={() => (expanded = expanded === r.id ? null : r.id)}>
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-medium">{s?.customer.name}</p>
							<p class="truncate text-xs text-muted">{s?.site.name} · {formatDate(r.date)} · {r.inspector}</p>
						</div>
						{#if tr !== null}<span class="num text-xs {tr > 0 ? 'text-success' : tr < 0 ? 'text-danger' : 'text-muted'}">{tr > 0 ? '▲ +' : tr < 0 ? '▼ ' : '± '}{tr} %</span>{/if}
						<Badge tone={sc >= 90 ? 'success' : sc >= 70 ? 'warn' : 'danger'} label="{sc} % erfüllt" />
						<ChevronDown size={15} class="text-faint transition-transform {expanded === r.id ? 'rotate-180' : ''}" />
					</button>
					{#if expanded === r.id}
						<div class="border-t border-line bg-bg/50 px-4 py-3">
							<ul class="grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
								{#each r.items as it (it.id)}
									<li class="flex items-start gap-2 text-sm"><span class="mt-1.5 size-2 shrink-0 rounded-full {it.rating === 'ok' ? 'bg-success' : it.rating === 'mangel' ? 'bg-danger' : 'bg-line-strong'}"></span><span>{it.label}{#if it.note}<span class="block text-xs text-muted">{it.note}</span>{/if}</span></li>
								{/each}
							</ul>
							{#if r.note}<p class="mt-3 rounded-md bg-subtle px-3 py-2 text-sm text-muted">{r.note}</p>{/if}
							<label class="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-[var(--accent)]" bind:checked={r.shared} /> Im Kundenportal sichtbar</label>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
<p class="mt-3 flex items-start gap-1.5 text-xs text-muted"><Info size={13} class="mt-px shrink-0" /> Auswertung bewusst je Objekt, nicht je Mitarbeiter: personenbezogene Leistungsscores sind datenschutz- und mitbestimmungsrechtlich heikel.</p>

<Dialog bind:open title="Neue Begehung" width={560}>
	{#snippet children()}
		<form id="insp-form" class="flex flex-col gap-3" onsubmit={save}>
			<div class="grid gap-3 sm:grid-cols-3">
				<div class="sm:col-span-2"><label class="label" for="i-s">Objekt</label><select id="i-s" class="input" bind:value={f.siteId}>{#each siteOptions as s}<option value={s.id}>{s.label}</option>{/each}</select></div>
				<div><label class="label" for="i-d">Datum</label><input id="i-d" type="date" class="input" max={today} bind:value={f.date} /></div>
			</div>
			<ul class="divide-y divide-line rounded-lg border border-line">
				{#each f.items as it (it.id)}
					<li class="px-3 py-2">
						<div class="flex items-center gap-2">
							<span class="flex-1 text-sm">{it.label}</span>
							<div class="inline-flex rounded-md border border-line-strong p-0.5" role="radiogroup" aria-label={it.label}>
								{#each [['ok', 'In Ordnung'], ['mangel', 'Mangel'], ['na', 'n. a.']] as [v, l]}
									<button type="button" role="radio" aria-checked={it.rating === v} class="h-6 rounded px-2 text-xs font-medium {it.rating === v ? (v === 'mangel' ? 'bg-danger-soft text-danger' : v === 'ok' ? 'bg-success-soft text-success' : 'bg-subtle text-fg') : 'text-muted hover:text-fg'}" onclick={() => (it.rating = v as InspectionItem['rating'])}>{l}</button>
								{/each}
							</div>
						</div>
						{#if it.rating === 'mangel'}<input class="input mt-2" aria-label="Notiz zu {it.label}" placeholder="Was wurde festgestellt?" bind:value={it.note} />{/if}
					</li>
				{/each}
			</ul>
			<div><label class="label" for="i-n">Gesamtnotiz</label><textarea id="i-n" class="input" rows="2" bind:value={f.note}></textarea></div>
			<div class="flex items-center justify-between rounded-md bg-subtle px-3 py-2 text-sm">
				<span>Erfüllungsgrad <strong class="num">{liveScore} %</strong></span>
				<label class="flex items-center gap-2 text-muted"><input type="checkbox" class="size-4 accent-[var(--accent)]" bind:checked={f.createDefects} disabled={!bad.length} /> {bad.length} Mängel in die Mängelliste übernehmen</label>
			</div>
			<label class="flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-[var(--accent)]" bind:checked={f.shared} /> Im Kundenportal freigeben</label>
		</form>
	{/snippet}
	{#snippet footer()}
		<button class="btn" type="button" onclick={() => (open = false)}>Abbrechen</button>
		<button class="btn btn-primary" type="submit" form="insp-form">Speichern</button>
	{/snippet}
</Dialog>
