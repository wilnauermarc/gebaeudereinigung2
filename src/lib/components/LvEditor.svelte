<script lang="ts">
	import { untrack } from 'svelte';
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { todayKey, formatDate } from '#lib/format.ts';
	import { addDays } from '#lib/calc.ts';
	import { addVersion, diffLv, intervalLabels, intervalOrder, lvAt, newItem } from '#lib/lv.ts';
	import type { LvInterval, Site } from '#lib/types.ts';
	import Dialog from './Dialog.svelte';
	import { Plus, Trash2, ListChecks, Lock } from '@lucide/svelte';

	let { open = $bindable(false), site }: { open: boolean; site: Site | null } = $props();
	const today = todayKey();

	let selId = $state<string | null>(null);
	let newFrom = $state(addDays(today, 1));
	let newNote = $state('');
	let err = $state('');
	const versions = $derived([...(site?.lv ?? [])].sort((a, b) => b.validFrom.localeCompare(a.validFrom)));
	const current = $derived(site ? lvAt(site, today) : null);
	// beim Öffnen: den heute gültigen Stand zeigen, sonst den neuesten
	// nur beim Öffnen zurücksetzen (nicht bei jeder Änderung der Versionen, sonst springt die Auswahl von der neuen Version zurück)
	$effect(() => { if (open && site) untrack(() => { selId = (lvAt(site, today) ?? versions[0] ?? null)?.id ?? null; err = ''; newFrom = addDays(today, 1); newNote = ''; }); });
	const sel = $derived(versions.find((v) => v.id === selId) ?? null);
	const prev = $derived.by(() => { if (!sel) return null; const older = versions.filter((v) => v.validFrom < sel.validFrom); return older[0] ?? null; });
	const diff = $derived(sel ? diffLv(prev, sel) : null);
	/** Eine Version, nach der schon Nachweise geprüft wurden, bleibt unverändert; Änderungen laufen über eine neue Version. */
	const usedBy = $derived(sel ? (db.data.serviceRecords ?? []).filter((r) => r.lvVersionId === sel.id).length : 0);
	const locked = $derived(usedBy > 0);
	const totalArea = $derived(sel ? sel.items.reduce((a, i) => a + (i.areaM2 ?? 0), 0) : 0);

	function create() {
		if (!site) return;
		const r = addVersion(site, newFrom, newNote.trim(), db.me);
		if (!r.ok) return (err = r.error);
		err = ''; selId = r.version.id; newNote = '';
		toasts.push(site.lv!.length === 1 ? 'Leistungsverzeichnis angelegt. Jetzt Leistungen eintragen.' : `Neue Version ab ${formatDate(r.version.validFrom)} angelegt. Sie startet als Kopie des bisherigen Stands.`, { tone: 'success' });
	}
	function add() { sel?.items.push(newItem()); }
	function remove(id: string) { if (sel) sel.items = sel.items.filter((i) => i.id !== id); }
	function removeVersion() {
		if (!site || !sel || locked) return;
		if (!confirm(`Version ab ${formatDate(sel.validFrom)} löschen?`)) return;
		site.lv = site.lv!.filter((v) => v.id !== sel!.id);
		selId = (lvAt(site, today) ?? [...site.lv].sort((a, b) => b.validFrom.localeCompare(a.validFrom))[0] ?? null)?.id ?? null;
	}
</script>

<Dialog bind:open title="Leistungsverzeichnis{site ? ' · ' + site.name : ''}" description="Was wird wo und wie oft gereinigt? Änderungen gelten ab einem Datum, ältere Stände bleiben für Nachweise erhalten." width={860}>
	{#snippet children()}
		{#if site}
			{#if versions.length === 0}
				<div class="rounded-xl bg-subtle p-5">
					<p class="mb-3 flex items-center gap-2 font-semibold"><ListChecks size={16} /> Noch kein Leistungsverzeichnis</p>
					<p class="mb-3 text-sm text-muted">Legen Sie den ersten Stand an. Er gilt ab dem gewählten Tag und ist die Grundlage für den Leistungsnachweis.</p>
					<div class="flex flex-wrap items-end gap-2"><div><label class="label" for="lv-f">Gültig ab</label><input id="lv-f" type="date" class="input w-44" bind:value={newFrom} /></div><button class="btn btn-primary" onclick={() => { newFrom = newFrom || today; create(); }}><Plus size={14} /> Anlegen</button></div>
					{#if err}<p class="mt-2 text-sm text-danger" role="alert">{err}</p>{/if}
				</div>
			{:else}
				<div class="mb-3 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Versionen">
					{#each versions as v (v.id)}
						<button role="tab" aria-selected={v.id === selId} class="btn btn-sm {v.id === selId ? 'border-accent bg-accent' : ''}" style={v.id === selId ? 'color: var(--accent-ink)' : ''} onclick={() => (selId = v.id)}>ab {formatDate(v.validFrom)}{#if current?.id === v.id} <span class="rounded-full bg-success/15 px-1.5 text-[0.65rem] font-bold text-success">gilt jetzt</span>{:else if v.validFrom > today} <span class="rounded-full bg-info-soft px-1.5 text-[0.65rem] font-bold text-info">geplant</span>{/if}</button>
					{/each}
				</div>

				{#if sel}
					{#if locked}<p class="mb-3 flex items-start gap-2 rounded-lg bg-subtle px-3 py-2 text-sm text-muted"><Lock size={15} class="mt-0.5 shrink-0" /> Nach dieser Version wurden schon {usedBy} {usedBy === 1 ? 'Einsatz' : 'Einsätze'} geprüft. Sie bleibt unverändert; für Änderungen unten eine neue Version anlegen.</p>{/if}
					{#if sel.note || sel.createdBy}<p class="mb-2 text-xs text-muted">Angelegt von {sel.createdBy}{sel.note ? ` · ${sel.note}` : ''}</p>{/if}
					<div class="overflow-x-auto rounded-xl border border-line">
						<table class="w-full min-w-[640px] border-collapse text-sm">
							<thead class="bg-subtle/60"><tr><th class="th">Raum / Bereich</th><th class="th">Leistung</th><th class="th">Intervall</th><th class="th text-right">m²</th><th class="th"></th></tr></thead>
							<tbody class="divide-y divide-line">
								{#each sel.items as it (it.id)}
									<tr>
										<td class="p-1.5"><input class="input" aria-label="Raum" placeholder="z. B. Treppenhaus" disabled={locked} bind:value={it.room} /></td>
										<td class="p-1.5"><input class="input" aria-label="Leistung" placeholder="z. B. Boden nass wischen" disabled={locked} bind:value={it.task} /></td>
										<td class="p-1.5"><select class="input" aria-label="Intervall" disabled={locked} bind:value={it.interval}>{#each intervalOrder as k}<option value={k}>{intervalLabels[k as LvInterval]}</option>{/each}</select></td>
										<td class="w-24 p-1.5"><input class="input num text-right" type="number" min="0" step="1" aria-label="Fläche in m²" disabled={locked} value={it.areaM2 ?? ''} oninput={(e) => (it.areaM2 = e.currentTarget.value === '' ? null : Number(e.currentTarget.value))} /></td>
										<td class="w-10 p-1.5">{#if !locked}<button class="btn btn-ghost btn-icon btn-sm hover:text-danger" aria-label="Zeile löschen" onclick={() => remove(it.id)}><Trash2 size={13} /></button>{/if}</td>
									</tr>
								{:else}
									<tr><td colspan="5" class="px-4 py-6 text-center text-muted">Noch keine Leistungen. Mit „Leistung hinzufügen“ beginnen.</td></tr>
								{/each}
							</tbody>
						</table>
					</div>
					<div class="mt-2 flex flex-wrap items-center justify-between gap-2">
						{#if !locked}<button class="btn btn-sm" onclick={add}><Plus size={13} /> Leistung hinzufügen</button>{:else}<span></span>{/if}
						<span class="num text-xs text-muted">{sel.items.length} Leistungen{totalArea ? ` · ${totalArea.toLocaleString('de-DE')} m² erfasst` : ''}</span>
					</div>

					{#if diff && prev && (diff.added.length || diff.removed.length || diff.changed.length)}
						<div class="mt-3 rounded-xl bg-accent-soft/50 px-3 py-2.5 text-sm">
							<p class="mb-1 font-semibold">Änderungen gegenüber dem Stand ab {formatDate(prev.validFrom)}</p>
							<ul class="grid gap-0.5 text-xs">
								{#each diff.added as i}<li><span class="font-semibold text-success">+ neu</span> {i.room}: {i.task} ({intervalLabels[i.interval]})</li>{/each}
								{#each diff.removed as i}<li><span class="font-semibold text-danger">− entfällt</span> {i.room}: {i.task}</li>{/each}
								{#each diff.changed as c}<li><span class="font-semibold text-info">~ geändert</span> {c.after.room}: {c.after.task} ({intervalLabels[c.before.interval]} → {intervalLabels[c.after.interval]})</li>{/each}
							</ul>
						</div>
					{/if}
					{#if !locked && versions.length > 1}<button class="mt-2 text-xs text-muted underline hover:text-danger" onclick={removeVersion}>Diese Version löschen</button>{/if}
				{/if}

				<div class="mt-5 rounded-xl border border-dashed border-line-strong p-4">
					<p class="mb-2 text-sm font-semibold">Neue Version anlegen</p>
					<div class="flex flex-wrap items-end gap-2">
						<div><label class="label" for="lv-nf">Gilt ab</label><input id="lv-nf" type="date" class="input w-44" bind:value={newFrom} /></div>
						<div class="min-w-[200px] flex-1"><label class="label" for="lv-nn">Grund (optional)</label><input id="lv-nn" class="input" placeholder="z. B. Fensterreinigung ab Januar" bind:value={newNote} /></div>
						<button class="btn btn-primary" onclick={create}><Plus size={14} /> Anlegen</button>
					</div>
					<p class="mt-1.5 text-xs text-muted">Die neue Version startet als Kopie des bisherigen Stands und beginnt nach dem letzten Stand.</p>
					{#if err}<p class="mt-2 text-sm text-danger" role="alert">{err}</p>{/if}
				</div>
			{/if}
		{/if}
	{/snippet}
	{#snippet footer()}<button class="btn btn-primary" onclick={() => (open = false)}>Fertig</button>{/snippet}
</Dialog>
