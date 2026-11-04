<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { todayKey, formatDate, dayDiff, relativeDay } from '#lib/format.ts';
	import { addMonths } from '#lib/calc.ts';
	import Badge from '#lib/components/Badge.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import { Plus, Minus, FlaskConical, Wrench, TriangleAlert, ShieldCheck } from '@lucide/svelte';
	import type { MaterialItem } from '#lib/types.ts';

	const consumables = $derived(db.data.material.filter((m) => m.kind === 'verbrauch').sort((a, b) => a.stock / a.min - b.stock / b.min));
	const devices = $derived(db.data.material.filter((m) => m.kind === 'geraet').sort((a, b) => (a.nextCheckOn ?? '9').localeCompare(b.nextCheckOn ?? '9')));
	const low = $derived(consumables.filter((m) => m.stock < m.min));

	function adjust(m: MaterialItem, d: number) { m.stock = Math.max(0, m.stock + d); }
	function checked(m: MaterialItem) {
		// DGUV V3: Richtwert 6 Monate für Werkstatt/Baustelle-Einsatz, im Betrieb per Gefährdungsbeurteilung festzulegen
		m.nextCheckOn = addMonths(todayKey(), 6);
		toasts.push(`Prüfung von ${m.name} dokumentiert. Nächste in 6 Monaten.`, { tone: 'success' });
	}
	function order(m: MaterialItem) {
		toasts.push(`Bestellung vermerkt: ${(m.min * 2 - m.stock).toLocaleString('de-DE')} ${m.unit} ${m.name}. Es wurde nichts bestellt.`, { ms: 7000 });
	}
	let open = $state(false);
	let f = $state({ name: '', kind: 'verbrauch' as MaterialItem['kind'], stock: 0, min: 0, unit: 'Stück', hazardous: false });
	function save(e: SubmitEvent) {
		e.preventDefault();
		if (f.name.trim().length < 2) return;
		db.data.material.push({ id: 'p' + Date.now().toString(36), name: f.name.trim(), kind: f.kind, stock: Number(f.stock), min: Number(f.min), unit: f.unit, hazardous: f.hazardous, nextCheckOn: f.kind === 'geraet' ? addMonths(todayKey(), 6) : null });
		open = false;
		toasts.push('Artikel angelegt.', { tone: 'success' });
	}
	import PageHead from '#lib/components/PageHead.svelte';
	import { materialInstruments as _materialInstruments } from '#lib/instruments.ts';
	import { todayKey as _tkmat } from '#lib/format.ts';
	const instruments = $derived(_materialInstruments(db.data, _tkmat()));
</script>

<svelte:head><title>Material · Putzbetrieb</title></svelte:head>

<PageHead {instruments} title="Material und Geräte" subtitle={`${low.length ? low.length + ' Artikel unter Mindestbestand' : 'Bestände in Ordnung'}, ${devices.filter((d) => d.nextCheckOn && d.nextCheckOn < todayKey()).length} Geräteprüfungen überfällig.`}>
	{#snippet actions()}
		<button class="btn btn-primary" onclick={() => { f = { name: '', kind: 'verbrauch', stock: 0, min: 0, unit: 'Stück', hazardous: false }; open = true; }}><Plus size={15} /> Artikel</button>
	{/snippet}
</PageHead>

<div class="grid gap-4 lg:grid-cols-2">
	<section class="card">
		<div class="border-b border-line px-4 py-3"><h2 class="card-title flex items-center gap-2"><FlaskConical size={15} class="text-muted" /> Verbrauchsmaterial</h2></div>
		<ul class="divide-y divide-line">
			{#each consumables as m (m.id)}
				{@const isLow = m.stock < m.min}
				<li class="flex items-center gap-3 px-4 py-3">
					<div class="min-w-0 flex-1">
						<p class="flex flex-wrap items-center gap-2 text-sm font-medium">{m.name}{#if m.hazardous}<span title="Gefahrstoff: Sicherheitsdatenblatt und Betriebsanweisung bereithalten"><Badge tone="warn" label="Gefahrstoff" /></span>{/if}</p>
						<div class="mt-1.5 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-subtle"><div class="h-full {isLow ? 'bg-danger' : 'bg-accent'}" style="width: {Math.min(100, (m.stock / (m.min * 2)) * 100)}%"></div></div>
						<p class="num mt-1 text-xs text-muted">Mindestbestand {m.min} {m.unit}</p>
					</div>
					<div class="flex items-center gap-1">
						<button class="btn btn-icon btn-sm" aria-label="{m.name}: Bestand verringern" onclick={() => adjust(m, -1)}><Minus size={13} /></button>
						<span class="num w-16 text-center text-sm font-semibold {isLow ? 'text-danger' : ''}">{m.stock} <span class="text-xs font-normal text-muted">{m.unit}</span></span>
						<button class="btn btn-icon btn-sm" aria-label="{m.name}: Bestand erhöhen" onclick={() => adjust(m, 1)}><Plus size={13} /></button>
					</div>
					{#if isLow}<button class="btn btn-sm" onclick={() => order(m)}>Nachbestellen</button>{/if}
				</li>
			{/each}
		</ul>
	</section>

	<section class="card">
		<div class="border-b border-line px-4 py-3"><h2 class="card-title flex items-center gap-2"><Wrench size={15} class="text-muted" /> Geräte und Prüfungen</h2></div>
		<ul class="divide-y divide-line">
			{#each devices as m (m.id)}
				{@const n = m.nextCheckOn ? dayDiff(m.nextCheckOn) : null}
				<li class="flex flex-wrap items-center gap-3 px-4 py-3">
					<div class="min-w-[160px] flex-1"><p class="text-sm font-medium">{m.name}</p><p class="text-xs text-muted">Elektroprüfung (DGUV V3){m.nextCheckOn ? `, nächste ${formatDate(m.nextCheckOn)}` : ''}</p></div>
					{#if n !== null}<Badge tone={n < 0 ? 'danger' : n <= 30 ? 'warn' : 'success'} label={n < 0 ? `überfällig seit ${-n} Tagen` : `fällig ${relativeDay(m.nextCheckOn!)}`} />{/if}
					{#if n !== null && n <= 30}<button class="btn btn-sm" onclick={() => checked(m)}><ShieldCheck size={13} /> Geprüft</button>{/if}
				</li>
			{/each}
		</ul>
	</section>
</div>
<p class="mt-3 flex items-start gap-1.5 text-xs text-muted"><TriangleAlert size={13} class="mt-px shrink-0" /> Prüfintervalle legt der Betrieb per Gefährdungsbeurteilung fest, 6 Monate sind ein Richtwert. Für Gefahrstoffe gehören Sicherheitsdatenblatt und Betriebsanweisung zum Verzeichnis.</p>

<Dialog bind:open title="Neuer Artikel">
	{#snippet children()}
		<form id="mat-form" class="grid grid-cols-2 gap-3" onsubmit={save}>
			<div class="col-span-2"><label class="label" for="m-n">Bezeichnung</label><input id="m-n" class="input" bind:value={f.name} /></div>
			<div><label class="label" for="m-k">Art</label><select id="m-k" class="input" bind:value={f.kind}><option value="verbrauch">Verbrauchsmaterial</option><option value="geraet">Gerät</option></select></div>
			<div><label class="label" for="m-u">Einheit</label><input id="m-u" class="input" bind:value={f.unit} /></div>
			<div><label class="label" for="m-s">Bestand</label><input id="m-s" type="number" min="0" class="input num" bind:value={f.stock} /></div>
			<div><label class="label" for="m-m">Mindestbestand</label><input id="m-m" type="number" min="0" class="input num" bind:value={f.min} /></div>
			{#if f.kind === 'verbrauch'}<label class="col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-[var(--accent)]" bind:checked={f.hazardous} /> Gefahrstoff</label>{/if}
		</form>
	{/snippet}
	{#snippet footer()}<button class="btn" type="button" onclick={() => (open = false)}>Abbrechen</button><button class="btn btn-primary" type="submit" form="mat-form">Anlegen</button>{/snippet}
</Dialog>
