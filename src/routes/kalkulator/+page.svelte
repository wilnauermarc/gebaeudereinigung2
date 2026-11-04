<script lang="ts">
	import { goto } from '$app/navigation';
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { hourlyRate, monthlyHours, WEEKS_PER_MONTH } from '#lib/calc.ts';
	import { areaTypes, defaultCalc } from '#lib/tariff.ts';
	import { formatEur } from '#lib/format.ts';
	import MoneyInput from '#lib/components/MoneyInput.svelte';
	import { Plus, Trash2, FileText, RotateCcw, GripVertical, Sparkles } from '@lucide/svelte';
	import { countUp } from '#lib/countup.ts';

	interface Room { id: string; name: string; type: string; area: number; perHour: number; perWeek: number }
	let rooms = $state<Room[]>([
		{ id: 'r1', name: 'Büroräume', type: 'buero', area: 1200, perHour: 450, perWeek: 5 },
		{ id: 'r2', name: 'Sanitärräume', type: 'sanitaer', area: 80, perHour: 150, perWeek: 5 },
		{ id: 'r3', name: 'Flure und Treppen', type: 'flur', area: 520, perHour: 500, perWeek: 2 }
	]);
	const s = db.data.calc;
	const rate = $derived(hourlyRate(s));
	const lines = $derived(rooms.map((r) => ({ r, hours: monthlyHours(r.area, r.perHour, r.perWeek) })));
	const hours = $derived(lines.reduce((a, l) => a + l.hours, 0));
	const price = $derived(Math.round((hours * rate) / 100) * 100);
	const totalArea = $derived(rooms.reduce((a, r) => a + (Number(r.area) || 0), 0));

	const typeColor: Record<string, string> = { buero: '#2457c5', sanitaer: '#0f8b8d', flur: '#7b8088', treppe: '#7a4fbf', kueche: '#d95a14', praxis: '#19734a' };
	const colorOf = (t: string) => typeColor[t] ?? '#7b8088';
	function addRoom(type = 'buero', at?: number) {
		const t = areaTypes.find((a) => a.id === type);
		const room: Room = { id: crypto.randomUUID(), name: type === 'buero' && !at ? '' : (t?.label ?? ''), type, area: type === 'buero' && !at ? 0 : 100, perHour: t?.perHour ?? 450, perWeek: 5 };
		if (at === undefined) rooms.push(room); else rooms.splice(at, 0, room);
	}

	// ── Drag & Drop: Raumtyp aus der Palette in das Raumbuch ziehen (neuer Bereich) oder auf eine Zeile (Art ändern); Zeilen am Griff sortieren ──
	let dragRoom = $state<string | null>(null);
	let dragType = $state<string | null>(null);
	let overId = $state<string | null>(null); // Zeilen-ID oder 'end'
	function dropOn(ev: DragEvent, targetId: string) {
		ev.preventDefault();
		const at = targetId === 'end' ? rooms.length : rooms.findIndex((x) => x.id === targetId);
		if (dragType) {
			if (targetId !== 'end') setType(rooms[at], dragType); else addRoom(dragType);
			toasts.push(targetId === 'end' ? 'Bereich hinzugefügt.' : 'Art geändert, Leistungswert angepasst.', { tone: 'success' });
		} else if (dragRoom) {
			const from = rooms.findIndex((x) => x.id === dragRoom);
			if (from >= 0 && from !== at && from + 1 !== at) {
				const [m] = rooms.splice(from, 1);
				rooms.splice(from < at ? at - 1 : at, 0, m);
			}
		}
		dragRoom = dragType = overId = null;
	}
	const endDrag = () => { dragRoom = dragType = overId = null; };
	const share = (h: number) => (hours ? (h / hours) * 100 : 0);

	// ── Aufbau des Stundensatzes (Cent), damit sichtbar wird, wohin das Geld geht ──
	const parts = $derived.by(() => {
		const w = s.wageCents, l = w * (s.lnkPct / 100), direct = (w + l) / Math.max(0.01, s.productivePct / 100);
		const unprod = direct - w - l, mm = direct * ((s.materialPct + s.machinePct) / 100), over = direct * (s.overheadPct / 100);
		const profit = (direct + mm + over) * (s.profitPct / 100);
		return [
			{ label: 'Lohn', v: w, c: '#2a2d32' }, { label: 'Nebenkosten und unproduktive Zeit', v: l + unprod, c: '#7b8088' },
			{ label: 'Material und Maschinen', v: mm, c: '#2457c5' }, { label: 'Gemeinkosten', v: over, c: '#e2a64b' }, { label: 'Wagnis und Gewinn', v: profit, c: '#19734a' }
		];
	});
	const partsSum = $derived(parts.reduce((a, p) => a + p.v, 0) || 1);
	function setType(r: Room, t: string) {
		r.type = t;
		r.perHour = areaTypes.find((a) => a.id === t)?.perHour ?? r.perHour;
	}
	const perWeekOptions = [[5, '5 x pro Woche'], [3, '3 x pro Woche'], [2, '2 x pro Woche'], [1, '1 x pro Woche'], [0.5, '14-tägig']] as const;
	const fmt = (n: number, d = 1) => n.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });

	const drafts = $derived(db.data.quotes.filter((q) => q.status === 'entwurf' && q.kind === 'unterhaltsreinigung'));
	let target = $state('');
	$effect(() => { if (!target && drafts.length) target = drafts[0].id; });

	function transfer() {
		const q = db.quote(target);
		if (!q) return;
		q.monthlyCents = price;
		q.calcHours = Math.round(hours * 10) / 10;
		q.areaM2 = totalArea || null;
		q.items = rooms.filter((r) => r.name.trim()).map((r) => ({ id: crypto.randomUUID(), text: `${r.name.trim()} reinigen (ca. ${fmt(r.area, 0)} m²)`, frequency: perWeekOptions.find((o) => o[0] === r.perWeek)![1] }));
		q.calculationNote = `Kalkulation: ${fmt(hours)} Std./Monat × ${formatEur(Math.round(rate))} Stundensatz (Lohn ${formatEur(s.wageCents)}, LNK ${s.lnkPct} %, produktiv ${s.productivePct} %, Material ${s.materialPct} %, Maschinen ${s.machinePct} %, Gemeinkosten ${s.overheadPct} %, Wagnis/Gewinn ${s.profitPct} %). Fläche ${fmt(totalArea, 0)} m².`;
		q.updatedAt = new Date().toISOString();
		toasts.push(`In ${q.number} übernommen.`, { tone: 'success' });
		goto(`/angebote/${q.id}`);
	}
	function resetParams() { Object.assign(db.data.calc, defaultCalc); toasts.push('Annahmen zurückgesetzt.'); }

	const params: [keyof typeof s, string, string][] = [
		['lnkPct', 'Lohnnebenkosten', '%'], ['productivePct', 'Produktive Zeit', '%'], ['materialPct', 'Material', '%'],
		['machinePct', 'Maschinen', '%'], ['overheadPct', 'Gemeinkosten', '%'], ['profitPct', 'Wagnis und Gewinn', '%']
	];
	import PageHead from '#lib/components/PageHead.svelte';
</script>

<svelte:head><title>Kalkulator · Putzbetrieb</title></svelte:head>

<PageHead title="Kalkulator" subtitle={`Von der Fläche zur Monatspauschale: Fläche ÷ Leistungswert × Häufigkeit × Stundensatz.`}>
</PageHead>

<div class="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
	<div class="flex flex-col gap-4">
		<section class="card">
			<div class="flex items-center justify-between border-b border-line px-4 py-3">
				<h2 class="card-title">Raumbuch (Flächen)</h2>
				<button class="btn btn-sm" onclick={() => addRoom()}><Plus size={13} /> Bereich</button>
			</div>
			<div class="border-b border-line px-4 py-3">
				<p class="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted"><Sparkles size={13} /> Raumtyp ins Raumbuch ziehen (oder anklicken). Auf eine Zeile gezogen ändert er deren Art.</p>
				<div class="flex flex-wrap gap-2" role="group" aria-label="Raumtypen">
					{#each areaTypes as a}
						<button type="button" draggable="true" class="flex cursor-grab items-center gap-2 rounded-full border border-line-strong bg-surface px-3 py-1.5 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing" ondragstart={(e) => { dragType = a.id; e.dataTransfer?.setData('text/plain', a.id); if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy'; }} ondragend={endDrag} onclick={() => addRoom(a.id, rooms.length)} title="{a.perHour} m²/Std. als Startwert"><span class="size-2.5 rounded-full" style="background:{colorOf(a.id)}"></span>{a.label}<span class="num text-xs font-normal text-muted">{a.perHour}</span></button>
					{/each}
				</div>
				{#if hours > 0}
					<div class="mt-3 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-subtle" role="img" aria-label="Anteil der Stunden je Bereich">
						{#each lines as { r, hours: h } (r.id)}<div class="transition-all duration-500" style="width:{share(h)}%;background:{colorOf(r.type)}" title="{r.name || 'Bereich'}: {fmt(h)} Std."></div>{/each}
					</div>
				{/if}
			</div>
			<div class="overflow-x-auto">
				<table class="w-full min-w-[760px] border-collapse">
					<thead class="border-b border-line bg-bg/60"><tr><th class="th w-8"></th><th class="th">Bereich</th><th class="th">Art</th><th class="th text-right">Fläche m²</th><th class="th text-right">m² / Std.</th><th class="th">Häufigkeit</th><th class="th text-right">Std. / Monat</th><th class="th w-10"></th></tr></thead>
					<tbody class="divide-y divide-line">
						{#each lines as { r, hours: h } (r.id)}
							<tr class="transition-colors {overId === r.id ? 'bg-accent-soft/60' : ''} {dragRoom === r.id ? 'opacity-40' : ''}" ondragover={(e) => { if (dragRoom || dragType) { e.preventDefault(); overId = r.id; } }} ondragleave={() => { if (overId === r.id) overId = null; }} ondrop={(e) => dropOn(e, r.id)}>
								<td class="w-8 px-1"><button type="button" draggable="true" class="grid size-7 cursor-grab place-items-center rounded text-faint hover:bg-subtle hover:text-fg active:cursor-grabbing" aria-label="Bereich verschieben" title="Zum Sortieren ziehen" ondragstart={(e) => { dragRoom = r.id; e.dataTransfer?.setData('text/plain', r.id); if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'; }} ondragend={endDrag}><GripVertical size={15} /></button></td>
								<td class="px-2 py-1.5"><input class="input" aria-label="Bereichsname" placeholder="z. B. Büros 1. OG" bind:value={r.name} /></td>
								<td class="px-2 py-1.5"><select class="input" aria-label="Art" value={r.type} onchange={(e) => setType(r, e.currentTarget.value)}>{#each areaTypes as a}<option value={a.id}>{a.label}</option>{/each}</select></td>
								<td class="px-2 py-1.5"><input type="number" min="0" class="input num text-right" aria-label="Fläche in Quadratmetern" bind:value={r.area} /></td>
								<td class="px-2 py-1.5"><input type="number" min="1" class="input num text-right" aria-label="Leistungswert Quadratmeter pro Stunde" bind:value={r.perHour} /></td>
								<td class="px-2 py-1.5"><select class="input" aria-label="Häufigkeit" bind:value={r.perWeek}>{#each perWeekOptions as o}<option value={o[0]}>{o[1]}</option>{/each}</select></td>
								<td class="td num text-right"><span class="block">{fmt(h)}</span><span class="mt-1 block h-1 overflow-hidden rounded-full bg-subtle"><span class="block h-full rounded-full transition-all duration-500" style="width:{share(h)}%;background:{colorOf(r.type)}"></span></span></td>
								<td class="px-1"><button class="btn btn-ghost btn-icon btn-sm hover:text-danger" aria-label="Bereich entfernen" onclick={() => rooms.splice(rooms.findIndex((x) => x.id === r.id), 1)}><Trash2 size={13} /></button></td>
							</tr>
						{/each}
						<tr ondragover={(e) => { if (dragRoom || dragType) { e.preventDefault(); overId = 'end'; } }} ondragleave={() => { if (overId === 'end') overId = null; }} ondrop={(e) => dropOn(e, 'end')}>
							<td colspan="8" class="px-3 py-3 text-center text-xs {overId === 'end' ? 'bg-accent-soft/60 font-semibold text-accent' : 'text-faint'}">{dragRoom || dragType ? 'Hier ablegen: ans Ende' : rooms.length ? '' : 'Noch keine Bereiche: Raumtyp hierher ziehen oder oben anklicken'}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p class="border-t border-line px-4 py-2.5 text-xs text-muted">Leistungswerte sind Startwerte. Quellen nennen für Büros 150–550 m²/Std., die Streuung ist groß: bitte mit eigenen Erfahrungswerten abgleichen.</p>
		</section>

		<section class="card p-4">
			<div class="mb-3 flex items-center justify-between"><h2 class="card-title">Annahmen</h2><button class="btn btn-ghost btn-sm" onclick={resetParams}><RotateCcw size={12} /> Zurücksetzen</button></div>
			<div class="grid gap-3 sm:grid-cols-3">
				<div><label class="label" for="p-w">Stundenlohn (LG 1)</label><MoneyInput id="p-w" bind:value={s.wageCents} /></div>
				{#each params as [k, label, unit]}
					<div><label class="label" for="p-{k}">{label}</label><div class="relative"><input id="p-{k}" type="number" min="0" max="100" step="0.5" class="input num pr-7 text-right" bind:value={s[k]} /><span class="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-muted">{unit}</span></div></div>
				{/each}
			</div>
			<p class="mt-3 text-xs text-muted">Branchenmindestlohn LG 1: 15,00 € (2026). Die übrigen Prozentwerte sind Praxis-Annahmen aus einer Kalkulationsvorlage, keine Verbandsvorgaben.</p>
		</section>
	</div>

	<aside class="card p-5 max-2xl:order-first max-2xl:grid max-2xl:grid-cols-2 max-2xl:gap-x-8 2xl:sticky 2xl:top-20">
		<div>
		<p class="text-xs font-medium text-muted">Monatspauschale (netto)</p>
		<p class="num mt-1 text-[2.4rem] leading-none font-semibold tracking-tight" use:countUp={{ value: price / 100, format: (n) => formatEur(Math.round(n * 100)) }}>{formatEur(price)}</p>
		<p class="mt-1 text-xs text-muted">{fmt(hours)} Std. × {formatEur(Math.round(rate))} je Stunde</p>
		<div class="mt-4">
			<p class="mb-1.5 text-xs font-medium text-muted">Woraus sich der Stundensatz zusammensetzt</p>
			<div class="flex h-3 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Aufbau des Stundensatzes">{#each parts as p}<div class="transition-all duration-500" style="width:{(p.v / partsSum) * 100}%;background:{p.c}" title="{p.label}: {formatEur(Math.round(p.v))}"></div>{/each}</div>
			<ul class="mt-2 flex flex-col gap-1 text-xs">{#each parts as p}<li class="flex items-center gap-2"><span class="size-2 rounded-full" style="background:{p.c}"></span><span class="flex-1 text-muted">{p.label}</span><span class="num font-medium">{formatEur(Math.round(p.v))}</span></li>{/each}</ul>
		</div>
		</div>
		<div>
		<dl class="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-sm max-2xl:mt-0 max-2xl:border-t-0 max-2xl:pt-0">
			<div class="flex justify-between"><dt class="text-muted">Gesamtfläche</dt><dd class="num font-medium">{fmt(totalArea, 0)} m²</dd></div>
			<div class="flex justify-between"><dt class="text-muted">Stunden pro Monat</dt><dd class="num font-medium">{fmt(hours)}</dd></div>
			<div class="flex justify-between"><dt class="text-muted">Stundensatz (netto)</dt><dd class="num font-medium">{formatEur(Math.round(rate))}</dd></div>
			<div class="flex justify-between"><dt class="text-muted">Preis je m² und Monat</dt><dd class="num font-medium">{totalArea ? formatEur(Math.round(price / totalArea)) : '–'}</dd></div>
			<div class="flex justify-between"><dt class="text-muted">Wochenfaktor</dt><dd class="num font-medium">{fmt(WEEKS_PER_MONTH, 2)}</dd></div>
		</dl>
		<div class="mt-5 border-t border-line pt-4">
			<label class="label" for="target">In Angebotsentwurf übernehmen</label>
			{#if drafts.length}
				<select id="target" class="input mb-2" bind:value={target}>{#each drafts as q}<option value={q.id}>{q.number} · {db.customer(q.customerId)?.name.slice(0, 28)}</option>{/each}</select>
				<button class="btn btn-primary w-full" onclick={transfer} disabled={!price}><FileText size={14} /> Preis und Leistungen übernehmen</button>
				<p class="mt-2 text-xs text-muted">Überschreibt Monatspauschale und Leistungsliste des Entwurfs. Die Kalkulation landet in der internen Notiz.</p>
			{:else}
				<p class="text-sm text-muted">Es gibt keinen Entwurf einer Unterhaltsreinigung. Legen Sie zuerst beim Kunden ein Angebot an.</p>
			{/if}
		</div>
		</div>
	</aside>
</div>
