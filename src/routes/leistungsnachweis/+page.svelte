<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { todayKey, formatDate } from '#lib/format.ts';
	import { addMonths } from '#lib/calc.ts';
	import { downloadBytes, toCsv } from '#lib/download.ts';
	import { buildServiceProofPdf } from '#lib/pdf/documentsPdf.ts';
	import { company } from '#lib/company.ts';
	import { lvAt, intervalLabels, lvKey } from '#lib/lv.ts';
	import { plannedVisits, presence, recordOf, setAcceptance, setExecution, summarize, type Visit } from '#lib/nachweis.ts';
	import type { ServiceRecord } from '#lib/types.ts';
	import type { Instrument, NextStep } from '#lib/ux.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { ChevronLeft, ChevronRight, ClipboardCheck, Download, Check, TriangleAlert, Clock, CircleX, UserCheck } from '@lucide/svelte';

	const today = todayKey();
	let month = $state(db.refMonth);
	let siteFilter = $state('alle');
	let show = $state<'alle' | 'ausfuehrung' | 'abnahme' | 'beanstandet'>('alle');
	const monthLabel = $derived(new Date(month + '-15T12:00:00Z').toLocaleDateString('de-DE', { month: 'long', year: 'numeric', timeZone: 'UTC' }));
	const shiftMonth = (n: number) => (month = addMonths(month + '-15', n).slice(0, 7));
	const weekdayName = (k: string) => new Date(k + 'T12:00:00Z').toLocaleDateString('de-DE', { weekday: 'short', timeZone: 'UTC' });

	const allVisits = $derived(plannedVisits(db.data, month, today));
	const sites = $derived(db.data.customers.flatMap((c) => c.sites.filter((s) => s.plan).map((s) => ({ s, c }))));
	const visits = $derived(allVisits.filter((v) => siteFilter === 'alle' || v.siteId === siteFilter));
	const sum = $derived(summarize(db.data, visits));
	const rows = $derived(
		visits.map((v) => ({ v, r: recordOf(db.data, v.siteId, v.date), p: presence(db.data, v.siteId, v.date), site: db.site(v.siteId) }))
			.filter(({ r }) => show === 'alle' || (show === 'ausfuehrung' && (!r || r.execution === 'offen')) || (show === 'abnahme' && r && r.execution !== 'offen' && r.acceptance === 'offen') || (show === 'beanstandet' && r?.acceptance === 'beanstandet'))
			.sort((a, b) => b.v.date.localeCompare(a.v.date) || (a.site?.site.name ?? '').localeCompare(b.site?.site.name ?? ''))
	);

	const instruments = $derived<Instrument[]>([
		{ kind: 'gauge', label: 'Ausführung bestätigt', value: sum.visits ? (sum.executed + sum.partial + sum.notDone) / sum.visits : 1, sub: `${sum.executed + sum.partial + sum.notDone} von ${sum.visits} Einsätzen`, good: 0.9, warn: 0.6 },
		{ kind: 'stat', label: 'Anwesenheit belegt', value: `${sum.withPresence}/${sum.visits}`, sub: 'Einsätze mit Zeitbuchung', tone: sum.withPresence < sum.visits ? 'warn' : 'success' },
		{ kind: 'stat', label: 'Abnahme offen', value: String(sum.acceptanceOpen), sub: 'ausgeführt, noch nicht abgenommen', tone: sum.acceptanceOpen ? 'warn' : '' },
		{ kind: 'stat', label: 'Beanstandet', value: String(sum.disputed), sub: 'durch den Kunden', tone: sum.disputed ? 'danger' : 'success' }
	]);
	const notChecked = $derived(visits.length - (sum.executed + sum.partial + sum.notDone));
	const next = $derived<NextStep>(
		sum.disputed ? { tone: 'danger', text: `${sum.disputed} beanstandete${sum.disputed === 1 ? 'r Einsatz' : ' Einsätze'}: Mangel prüfen und Nacharbeit planen.`, cta: { label: 'Nur Beanstandete', onclick: () => (show = 'beanstandet') } }
		: notChecked > 0 ? { tone: 'warn', text: `${notChecked} Einsätze in ${monthLabel} sind noch nicht auf Ausführung geprüft.`, cta: { label: 'Ungeprüfte zeigen', onclick: () => (show = 'ausfuehrung') } }
		: sum.acceptanceOpen ? { tone: 'info', text: `${sum.acceptanceOpen} ausgeführte Einsätze warten auf die Abnahme durch den Kunden.`, cta: { label: 'Abnahme zeigen', onclick: () => (show = 'abnahme') } }
		: { tone: 'ok', text: 'Für diesen Monat ist alles geprüft.' }
	);

	// ── Prüfen und abnehmen ──
	let open = $state(false);
	let cur = $state<Visit | null>(null);
	let f = $state({ done: [] as string[], execution: 'vollstaendig' as ServiceRecord['execution'], missed: [] as string[], note: '', acceptance: 'offen' as ServiceRecord['acceptance'], by: '', acceptNote: '', createDefect: true });
	let err = $state('');
	const curSite = $derived(cur ? db.site(cur.siteId) : null);
	const lv = $derived(cur && curSite ? lvAt(curSite.site, cur.date) : null);
	const curRec = $derived(cur ? recordOf(db.data, cur.siteId, cur.date) : undefined);
	function edit(v: Visit) {
		cur = v; err = '';
		const r = recordOf(db.data, v.siteId, v.date);
		const contact = db.customer(v.customerId)?.contacts?.[0]?.name ?? '';
		f = { done: [...(r?.doneKeys ?? [])], execution: r?.execution && r.execution !== 'offen' ? r.execution : 'vollstaendig', missed: [...(r?.missedItemIds ?? [])], note: r?.executionNote ?? '', acceptance: r?.acceptance ?? 'offen', by: r?.acceptedBy || contact, acceptNote: r?.acceptNote ?? '', createDefect: !r?.defectId };
		open = true;
	}
	function save(e: SubmitEvent) {
		e.preventDefault();
		if (!cur || !curSite) return;
		const e1 = setExecution(db.data, curSite.site, cur.date, { execution: f.execution, missedItemIds: f.missed, note: f.note }, db.me);
		if (e1) return (err = e1);
		if (f.acceptance !== 'offen' || curRec?.acceptance !== 'offen') {
			const e2 = setAcceptance(db.data, curSite.site, cur.customerId, cur.date, { acceptance: f.acceptance, by: f.by, note: f.acceptNote, createDefect: f.createDefect }, today, db.me);
			if (e2) return (err = e2);
		}
		const saved = recordOf(db.data, cur.siteId, cur.date);
		if (saved) saved.doneKeys = [...f.done];
		open = false;
		toasts.push('Leistungsnachweis gespeichert.', { tone: 'success' });
	}
	/** Alle noch ungeprüften Einsätze mit belegter Anwesenheit als vollständig ausgeführt festhalten (Massenaktion, nur Ausführung) */
	function bulk() {
		let n = 0;
		for (const { v, r, p, site } of rows) {
			if (site && (!r || r.execution === 'offen') && p.names.length) { setExecution(db.data, site.site, v.date, { execution: 'vollstaendig', missedItemIds: [], note: '' }, db.me); n++; }
		}
		toasts.push(n ? `${n} Einsätze als vollständig ausgeführt festgehalten.` : 'Keine ungeprüften Einsätze mit Zeitbuchung in dieser Ansicht.', { tone: n ? 'success' : 'default' });
	}
	const bulkCount = $derived(rows.filter(({ r, p }) => (!r || r.execution === 'offen') && p.names.length).length);

	const execLabel = { offen: 'ungeprüft', vollstaendig: 'vollständig', teilweise: 'teilweise', nicht: 'nicht ausgeführt' } as const;
	const accLabel = { offen: 'offen', abgenommen: 'abgenommen', beanstandet: 'beanstandet' } as const;
	/** Monatsnachweis für das gewählte Objekt als PDF für den Kunden */
	async function exportPdf() {
		const found = siteFilter === 'alle' ? null : db.site(siteFilter);
		if (!found) return toasts.push('Bitte zuerst oben ein Objekt wählen.', { tone: 'error' });
		const v = lvAt(found.site, month + '-28') ?? lvAt(found.site, today);
		const mine = [...rows].reverse();
		const bytes = await buildServiceProofPdf({
			company, customer: found.customer, siteName: found.site.name, siteAddress: `${found.site.street}, ${found.site.postal} ${found.site.city}`, month, today, lvFrom: v?.validFrom ?? null,
			lv: (v?.items ?? []).map((i) => ({ room: i.room, task: i.task, interval: intervalLabels[i.interval] })),
			rows: mine.map(({ v: vis, r, p, site }) => ({
				date: vis.date, presence: p.names.length ? `ja (${p.names.join(', ')}, ${p.hours.toFixed(1).replace('.', ',')} Std.)` : 'nicht belegt', execution: execLabel[r?.execution ?? 'offen'],
				missed: r ? (lvAt(site!.site, vis.date)?.items ?? []).filter((i) => r.missedItemIds.includes(i.id)).map((i) => `${i.room || 'Allgemein'}: ${i.task}`) : [],
				note: r?.executionNote ?? '', acceptance: r?.acceptance === 'abgenommen' ? `abgenommen (${r.acceptedBy})` : r?.acceptance === 'beanstandet' ? `beanstandet (${r.acceptedBy})` : 'offen'
			}))
		});
		downloadBytes(bytes, `Leistungsnachweis-${found.site.name.replace(/[^\wäöüÄÖÜß-]+/g, '_')}-${month}.pdf`, 'application/pdf');
	}
	function exportCsv() {
		const out = [['Datum', 'Kunde', 'Objekt', 'Anwesenheit', 'Stunden', 'Ausführung', 'Nicht erbracht', 'Notiz Ausführung', 'Abnahme', 'Abgenommen von', 'Abgenommen am', 'Notiz Abnahme']];
		for (const { v, r, p, site } of [...rows].reverse()) {
			const missed = r ? (lvAt(site!.site, v.date)?.items ?? []).filter((i) => r.missedItemIds.includes(i.id)).map((i) => `${i.room}: ${i.task}`).join(' | ') : '';
			out.push([formatDate(v.date), site?.customer.name ?? '', site?.site.name ?? '', p.names.join(', ') || 'keine Zeitbuchung', p.hours.toFixed(2).replace('.', ','), execLabel[r?.execution ?? 'offen'], missed, r?.executionNote ?? '', accLabel[r?.acceptance ?? 'offen'], r?.acceptedBy ?? '', r?.acceptedOn ? formatDate(r.acceptedOn) : '', r?.acceptNote ?? '']);
		}
		downloadBytes(toCsv(out), `Leistungsnachweis-${month}.csv`, 'text/csv;charset=utf-8');
	}
</script>

<svelte:head><title>Leistungsnachweis · Objektia</title></svelte:head>

<PageHead title="Leistungsnachweis" subtitle="Je Einsatz drei getrennte Antworten: War jemand da? Wurde geleistet, was vereinbart ist? Hat der Kunde abgenommen?" {instruments} {next}>
	{#snippet actions()}
		<button class="btn" onclick={exportPdf} disabled={siteFilter === 'alle' || !rows.length} title={siteFilter === 'alle' ? 'Zuerst ein Objekt wählen' : 'Monatsnachweis für den Kunden'}><Download size={14} /> PDF</button>
		<button class="btn" onclick={exportCsv} disabled={!rows.length}><Download size={14} /> CSV</button>
		<button class="btn btn-primary" onclick={bulk} disabled={!bulkCount} title="Alle ungeprüften Einsätze mit Zeitbuchung als vollständig ausgeführt festhalten"><Check size={14} /> {bulkCount || ''} als vollständig</button>
	{/snippet}
</PageHead>

<div class="mb-3 flex flex-wrap items-center gap-2">
	<div class="flex items-center gap-1">
		<button class="btn btn-icon" aria-label="Vorheriger Monat" onclick={() => shiftMonth(-1)}><ChevronLeft size={15} /></button>
		<span class="min-w-[150px] text-center text-sm font-medium capitalize">{monthLabel}</span>
		<button class="btn btn-icon" aria-label="Nächster Monat" onclick={() => shiftMonth(1)}><ChevronRight size={15} /></button>
	</div>
	<select class="input w-64" aria-label="Objekt filtern" bind:value={siteFilter}>
		<option value="alle">Alle Objekte</option>
		{#each sites as { s, c }}<option value={s.id}>{c.name.length > 30 ? c.name.slice(0, 28) + '…' : c.name} · {s.name}</option>{/each}
	</select>
	<div class="flex flex-wrap gap-1" role="group" aria-label="Filtern">
		{#each [['alle', 'Alle'], ['ausfuehrung', 'Ungeprüft'], ['abnahme', 'Abnahme offen'], ['beanstandet', 'Beanstandet']] as [id, l]}
			<button class="btn btn-sm {show === id ? 'border-accent bg-accent' : ''}" style={show === id ? 'color: var(--accent-ink)' : ''} aria-pressed={show === id} onclick={() => (show = id as typeof show)}>{l}</button>
		{/each}
	</div>
</div>

<div class="card overflow-x-auto">
	{#if rows.length === 0}
		<EmptyState icon={ClipboardCheck} title="Keine Einsätze in dieser Ansicht" text="Einsätze erscheinen, sobald ein Objekt einen Reinigungsplan hat und der Tag erreicht ist. Wählen Sie einen anderen Monat oder Filter." />
	{:else}
		<table class="w-full min-w-[880px] border-collapse">
			<thead class="border-b border-line bg-bg/60"><tr><th class="th">Einsatz</th><th class="th">1 · Anwesenheit</th><th class="th">2 · Ausführung</th><th class="th">3 · Abnahme</th><th class="th"></th></tr></thead>
			<tbody class="divide-y divide-line">
				{#each rows as { v, r, p, site } (v.siteId + v.date)}
					<tr class="cursor-pointer" onclick={() => edit(v)}>
						<td class="td"><p class="font-medium"><span class="num text-muted">{weekdayName(v.date)} {formatDate(v.date).slice(0, 6)}</span> · {site?.site.name}</p><p class="truncate text-xs text-muted">{site?.customer.name}</p></td>
						<td class="td">{#if p.names.length}<span class="inline-flex items-center gap-1.5 text-sm"><Clock size={14} class="text-success" /> {p.names.join(', ')} <span class="num text-muted">· {p.hours.toFixed(1).replace('.', ',')} Std.</span></span>{:else}<span class="inline-flex items-center gap-1.5 text-sm text-warn"><TriangleAlert size={14} /> keine Zeitbuchung</span>{/if}</td>
						<td class="td">
							{#if !r || r.execution === 'offen'}<span class="badge badge-neutral">ungeprüft</span>
							{:else if r.execution === 'vollstaendig'}<span class="badge badge-success">vollständig</span>
							{:else if r.execution === 'teilweise'}<span class="badge badge-warn">teilweise</span>{#if r.missedItemIds.length}<span class="ml-1.5 text-xs text-muted">{r.missedItemIds.length} offen</span>{/if}
							{:else}<span class="badge badge-danger">nicht ausgeführt</span>{/if}
						</td>
						<td class="td">
							{#if r?.acceptance === 'abgenommen'}<span class="badge badge-success">abgenommen</span><span class="ml-1.5 text-xs text-muted">{r.acceptedBy}</span>
							{:else if r?.acceptance === 'beanstandet'}<span class="badge badge-danger">beanstandet</span>{#if r.defectId}<a href="/maengel" class="ml-1.5 text-xs text-accent hover:underline" onclick={(e) => e.stopPropagation()}>Mangel</a>{/if}
							{:else}<span class="badge badge-neutral">offen</span>{/if}
						</td>
						<td class="td text-right"><button class="btn btn-sm" onclick={(e) => { e.stopPropagation(); edit(v); }}><UserCheck size={13} /> Prüfen</button></td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<Dialog bind:open title="Einsatz prüfen" description={cur && curSite ? `${weekdayName(cur.date)} ${formatDate(cur.date)} · ${curSite.site.name} · ${curSite.customer.name}` : ''} width={620}>
	{#snippet children()}
		{#if cur && curSite}
			{@const p = presence(db.data, cur.siteId, cur.date)}
			<form id="nw-form" class="grid gap-4" onsubmit={save}>
				<section>
					<h3 class="section-label mb-1.5">1 · Anwesenheit (aus den Zeitbuchungen)</h3>
					<p class="text-sm">{#if p.names.length}<Clock size={14} class="mr-1 inline text-success" /> {p.names.join(', ')} · {p.hours.toFixed(1).replace('.', ',')} Std.{:else}<span class="text-warn"><CircleX size={14} class="mr-1 inline" /> Keine Zeitbuchung für diesen Tag. Ausführung trotzdem festhalten? Dann bitte begründen.</span>{/if}</p>
				</section>
				<section>
					<h3 class="section-label mb-1.5">2 · Ausführung</h3>
					<div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Ausführung">
						{#each [['vollstaendig', 'Vollständig'], ['teilweise', 'Teilweise'], ['nicht', 'Nicht ausgeführt'], ['offen', 'Ungeprüft']] as [id, l]}
							<button type="button" role="radio" aria-checked={f.execution === id} class="btn btn-sm {f.execution === id ? 'border-accent bg-accent' : ''}" style={f.execution === id ? 'color: var(--accent-ink)' : ''} onclick={() => (f.execution = id as typeof f.execution)}>{l}</button>
						{/each}
					</div>
					{#if f.execution === 'teilweise'}
						<div class="mt-3 rounded-lg bg-subtle p-3">
							<p class="mb-1.5 text-xs font-semibold text-muted">Was wurde nicht erbracht?{#if lv} <span class="font-normal">(Verzeichnis ab {formatDate(lv.validFrom)})</span>{/if}</p>
							{#if lv && lv.items.length}
								<ul class="grid gap-1">{#each lv.items as it (it.id)}<li><label class="flex cursor-pointer items-start gap-2 text-sm"><input type="checkbox" class="mt-1 size-[16px] accent-[var(--accent)]" checked={f.missed.includes(it.id)} onchange={(e) => (f.missed = e.currentTarget.checked ? [...f.missed, it.id] : f.missed.filter((x) => x !== it.id))} /><span>{it.room || 'Allgemein'}: {it.task} <span class="text-xs text-muted">({intervalLabels[it.interval]})</span></span></label></li>{/each}</ul>
							{:else}<p class="text-xs text-muted">Für dieses Objekt gibt es noch kein Leistungsverzeichnis (Kunde → Objekt → Leistungen). Bitte in der Notiz beschreiben.</p>{/if}
						</div>
					{/if}
					{#if f.execution !== 'vollstaendig' && f.execution !== 'offen' || !p.names.length}
						<label class="label mt-3" for="nw-n">Notiz {#if f.execution === 'nicht' || f.execution === 'teilweise'}<span class="font-normal">(Grund)</span>{/if}</label>
						<textarea id="nw-n" class="input" rows="2" maxlength="300" bind:value={f.note}></textarea>
					{/if}
				</section>
				{#if curRec?.reportedBy || curRec?.photoIds?.length}
					<section class="rounded-lg bg-subtle p-3 text-sm">
						{#if curRec.reportedBy}<p class="text-xs text-muted">Ausführung gemeldet von <strong class="text-fg">{curRec.reportedBy}</strong> über die Mitarbeiter-App.</p>{/if}
						{#if curRec.photoIds?.length}<div class="mt-2 flex flex-wrap gap-2">{#each curRec.photoIds as pid}<a href="/api/inbox/photo?id={pid}" target="_blank" rel="noopener"><img src="/api/inbox/photo?id={pid}" alt="Foto vom Einsatz" class="size-20 rounded-lg border border-line object-cover" loading="lazy" /></a>{/each}</div>{/if}
					</section>
				{/if}
				{#if lv && lv.items.some((i) => !['taeglich', 'woechentlich', 'zweiwoechentlich', 'bedarf'].includes(i.interval))}
					<section>
						<h3 class="section-label mb-1.5">Periodische Leistungen, heute miterledigt</h3>
						<ul class="grid gap-1">{#each lv.items.filter((i) => !['taeglich', 'woechentlich', 'zweiwoechentlich', 'bedarf'].includes(i.interval)) as it (it.id)}<li><label class="flex cursor-pointer items-start gap-2 text-sm"><input type="checkbox" class="mt-1 size-[16px] accent-[var(--accent)]" checked={f.done.includes(lvKey(it))} onchange={(e) => (f.done = e.currentTarget.checked ? [...f.done, lvKey(it)] : f.done.filter((x) => x !== lvKey(it)))} /><span>{it.room || 'Allgemein'}: {it.task} <span class="text-xs text-muted">({intervalLabels[it.interval]})</span></span></label></li>{/each}</ul>
						<p class="mt-1 text-xs text-muted">Das setzt die Fälligkeit der Leistung zurück (Aufgabe „Fällig: …“).</p>
					</section>
				{/if}
				<section>
					<h3 class="section-label mb-1.5">3 · Abnahme durch den Kunden</h3>
					<div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Abnahme">
						{#each [['offen', 'Offen'], ['abgenommen', 'Abgenommen'], ['beanstandet', 'Beanstandet']] as [id, l]}
							<button type="button" role="radio" aria-checked={f.acceptance === id} class="btn btn-sm {f.acceptance === id ? 'border-accent bg-accent' : ''}" style={f.acceptance === id ? 'color: var(--accent-ink)' : ''} onclick={() => (f.acceptance = id as typeof f.acceptance)}>{l}</button>
						{/each}
					</div>
					{#if f.acceptance !== 'offen'}
						<div class="mt-3 grid gap-3 sm:grid-cols-2">
							<div><label class="label" for="nw-b">Wer hat {f.acceptance === 'abgenommen' ? 'abgenommen' : 'beanstandet'}?</label><input id="nw-b" class="input" bind:value={f.by} /></div>
							<div><label class="label" for="nw-an">Notiz{f.acceptance === 'beanstandet' ? ' (Pflicht)' : ''}</label><input id="nw-an" class="input" maxlength="300" bind:value={f.acceptNote} /></div>
						</div>
						{#if f.acceptance === 'beanstandet' && !curRec?.defectId}<label class="mt-2 flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" class="size-[16px] accent-[var(--accent)]" bind:checked={f.createDefect} /> Mangel anlegen (mit Nachkontrolle)</label>{/if}
					{/if}
				</section>
				{#if curRec?.history.length}<details class="text-xs text-muted"><summary class="cursor-pointer font-semibold">Verlauf</summary><ul class="mt-1 grid gap-0.5">{#each curRec.history as h}<li>{h}</li>{/each}</ul></details>{/if}
				{#if err}<p class="text-sm text-danger" role="alert">{err}</p>{/if}
			</form>
		{/if}
	{/snippet}
	{#snippet footer()}<button class="btn" type="button" onclick={() => (open = false)}>Abbrechen</button><button class="btn btn-primary" type="submit" form="nw-form">Speichern</button>{/snippet}
</Dialog>
