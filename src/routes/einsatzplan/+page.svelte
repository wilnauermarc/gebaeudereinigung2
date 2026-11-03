<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { addDays, mondayOf, weekday, fromMinutes, toMinutes } from '#lib/calc.ts';
	import { coverCandidates } from '#lib/cockpit.ts';
	import { planWarnings } from '#lib/planning.ts';
	import { formatEur } from '#lib/format.ts';
	import { todayKey, formatDateShort } from '#lib/format.ts';
	import Dialog from '#lib/components/Dialog.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import { company } from '#lib/company.ts';
	import { downloadBytes } from '#lib/download.ts';
	import { buildShiftSheetPdf, type ShiftSheet } from '#lib/pdf/shiftSheetPdf.ts';
	import { ChevronLeft, ChevronRight, TriangleAlert, UserPlus, X, Copy, Sparkles, GripVertical, Trash2, FileText } from '@lucide/svelte';

	const today = todayKey();
	let monday = $state(mondayOf(today));
	const days = $derived(Array.from({ length: 7 }, (_, i) => addDays(monday, i)));
	const names = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
	const rows = $derived(db.plannedSites());

	const issues = $derived(
		rows.flatMap((r) => days.map((d) => ({ r, d, st: db.staffing(r.site.id, d) })).filter((x) => x.st && (x.st.empty || x.st.understaffed)))
	);
	const warnings = $derived(planWarnings(db, days));
	const warnLabel = { doppelt: 'Doppelbelegung', ruhezeit: 'Ruhezeit', ueberstunden: 'Über Vertrag' } as const;
	// ── Springer-Ablauf: für jeden Ausfall der Woche den besten Vorschlag (Springer zuerst, dann Kapazität, dann Kosten) mit einem Klick einteilen ──
	const gapsToFill = $derived(
		issues.filter((x) => x.st!.empty || x.st!.understaffed).map((x) => {
			const best = coverCandidates(db.data, x.r.site.id, x.d).find((c) => c.allowed);
			return { siteId: x.r.site.id, date: x.d, customer: x.r.customer.name, site: x.r.site.name, start: x.r.site.plan!.start, empty: x.st!.empty, best };
		}).sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))
	);
	function autoCover(g: (typeof gapsToFill)[number]) {
		if (!g.best) return toasts.push('Es gibt niemanden, der zu dieser Zeit einteilbar ist. Nutzen Sie den Assistenten oder fragen Sie extern an.', { tone: 'error', ms: 9000 });
		pick = { siteId: g.siteId, date: g.date };
		assign(g.best.employee.id);
	}
	const unfilled = $derived(issues.filter((x) => x.st!.empty).length);

	let pick = $state<{ siteId: string; date: string } | null>(null);
	let pickOpen = $state(false);
	const pickSite = $derived(pick ? db.site(pick.siteId) : undefined);
	const candidates = $derived(pick ? coverCandidates(db.data, pick.siteId, pick.date) : []);

	function requestText(emp: string) {
		const s = pickSite!, p = s.site.plan!;
		const first = db.employee(emp)?.name.split(' ')[0];
		const d = new Date(pick!.date + 'T12:00:00Z').toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', timeZone: 'UTC' });
		return `Hallo ${first}, kannst du am ${d} von ${p.start} bis ${fromMinutes(toMinutes(p.start) + p.hours * 60)} Uhr bei ${s.customer.name} (${s.site.name}, ${s.site.street}) einspringen? Bitte kurz Bescheid geben. Danke!`;
	}
	async function copyRequest(emp: string) {
		try { await navigator.clipboard.writeText(requestText(emp)); toasts.push('Anfragetext kopiert. Einfügen in WhatsApp oder SMS.', { tone: 'success' }); }
		catch { toasts.push('Kopieren nicht möglich. Text: ' + requestText(emp), { tone: 'error', ms: 12000 }); }
	}

	function open(siteId: string, date: string) {
		pick = { siteId, date };
		pickOpen = true;
	}
	function assign(employeeId: string) {
		const c = { id: 'c' + Date.now().toString(36), siteId: pick!.siteId, date: pick!.date, employeeId };
		db.data.covers.push(c);
		pickOpen = false;
		toasts.push(`${db.employee(employeeId)?.name} übernimmt den Einsatz.`, { tone: 'success', action: { label: 'Rückgängig', run: () => { const i = db.data.covers.findIndex((x) => x.id === c.id); if (i >= 0) db.data.covers.splice(i, 1); } } });
	}
	function removeCover(id: string) {
		const i = db.data.covers.findIndex((c) => c.id === id);
		if (i >= 0) db.data.covers.splice(i, 1);
	}
	// ── Drag & Drop: Personen aus der Leiste auf einen Einsatz ziehen, Vertretungen verschieben oder entfernen ──
	let drag = $state<{ kind: 'emp' | 'cover'; empId: string; coverId?: string } | null>(null);
	let over = $state<string | null>(null);
	const key = (siteId: string, date: string) => `${siteId}|${date}`;
	/** Für die gezogene Person: welche Zellen sind zulässig, welche nicht (und warum) */
	const targets = $derived.by(() => {
		const m = new Map<string, { ok: boolean; reason: string }>();
		if (!drag) return m;
		for (const { site } of rows) for (const d of days) {
			if (!site.plan!.days.includes(weekday(d))) continue;
			if (d < today) { m.set(key(site.id, d), { ok: false, reason: 'liegt in der Vergangenheit' }); continue; }
			const cand = coverCandidates(db.data, site.id, d).find((c) => c.employee.id === drag!.empId);
			m.set(key(site.id, d), cand ? { ok: cand.allowed, reason: cand.reason } : { ok: false, reason: 'gehört zur Stammbesetzung' });
		}
		return m;
	});
	function startDrag(ev: DragEvent, d: NonNullable<typeof drag>) {
		drag = d;
		ev.dataTransfer?.setData('text/plain', d.empId);
		if (ev.dataTransfer) ev.dataTransfer.effectAllowed = d.kind === 'cover' ? 'move' : 'copy';
	}
	function endDrag() { drag = null; over = null; }
	function allow(ev: DragEvent, siteId: string, date: string) {
		if (!drag) return;
		const t = targets.get(key(siteId, date));
		if (t?.ok) { ev.preventDefault(); over = key(siteId, date); if (ev.dataTransfer) ev.dataTransfer.dropEffect = drag.kind === 'cover' ? 'move' : 'copy'; }
	}
	function dropOn(ev: DragEvent, siteId: string, date: string) {
		ev.preventDefault();
		const d = drag; const t = targets.get(key(siteId, date));
		endDrag();
		if (!d) return;
		const name = db.employee(d.empId)?.name;
		if (!t?.ok) return void toasts.push(`${name} kann hier nicht eingeteilt werden${t?.reason ? `: ${t.reason}` : ''}.`, { tone: 'error' });
		const old = d.kind === 'cover' ? db.data.covers.find((c) => c.id === d.coverId) : undefined;
		if (old) db.data.covers.splice(db.data.covers.indexOf(old), 1);
		const c = { id: 'c' + Date.now().toString(36), siteId, date, employeeId: d.empId };
		db.data.covers.push(c);
		const where = db.site(siteId);
		toasts.push(`${name} ${old ? 'wurde verschoben nach' : 'übernimmt'} ${where?.site.name} am ${date.split('-').reverse().slice(0, 2).join('.')}.`, { tone: 'success', action: { label: 'Rückgängig', run: () => { const i = db.data.covers.findIndex((x) => x.id === c.id); if (i >= 0) db.data.covers.splice(i, 1); if (old) db.data.covers.push(old); } } });
	}
	function dropRemove(ev: DragEvent) {
		ev.preventDefault();
		const d = drag; endDrag();
		if (d?.kind !== 'cover') return;
		const old = db.data.covers.find((c) => c.id === d.coverId);
		if (!old) return;
		db.data.covers.splice(db.data.covers.indexOf(old), 1);
		toasts.push(`Vertretung ${db.employee(d.empId)?.name} entfernt.`, { action: { label: 'Rückgängig', run: () => db.data.covers.push(old) } });
	}
	// ── Einsatzzettel: Wochenübersicht je Person als PDF (große Schrift, einfache Sprache) ──
	let sheetOpen = $state(false);
	let sheetWho = $state('alle');
	function sheetFor(empId: string): ShiftSheet {
		const e = db.employee(empId)!;
		return {
			company, person: e.name, weekLabel: `Woche ${weekLabel}`,
			days: days.map((d, i) => ({
				label: `${['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'][i]}, ${d.slice(8)}.${d.slice(5, 7)}.`,
				entries: rows.flatMap(({ site, customer }) => {
					const st = db.staffing(site.id, d);
					const names = st ? [...st.present, ...st.covers.map((c) => c.emp)] : [];
					if (!st || !names.some((n) => n.id === empId)) return [];
					const p = site.plan!;
					return [{ time: `${p.start}–${fromMinutes(toMinutes(p.start) + p.hours * 60)}`, customer: customer.name, site: site.name, address: `${site.street}, ${site.city}`, mates: names.filter((n) => n.id !== empId).map((n) => n.name.split(' ')[0]).join(', ') }];
				}).sort((a, b) => a.time.localeCompare(b.time))
			}))
		};
	}
	async function makeSheets() {
		const ids = sheetWho === 'alle' ? db.data.employees.map((x) => x.id) : [sheetWho];
		const sheets = ids.map(sheetFor).filter((s) => s.days.some((d) => d.entries.length));
		if (!sheets.length) return void toasts.push('Für diese Woche gibt es keine Einsätze.', { tone: 'error' });
		downloadBytes(await buildShiftSheetPdf(sheets), `Einsatzzettel-${days[0]}.pdf`, 'application/pdf');
		sheetOpen = false;
		toasts.push(`${sheets.length} Einsatzzettel erstellt (eine Seite je Person).`, { tone: 'success' });
	}
	const weekLabel = $derived(`${formatDateShort(days[0] + 'T12:00:00Z')} – ${formatDateShort(days[6] + 'T12:00:00Z')}`);
	import PageHead from '#lib/components/PageHead.svelte';
	import type { Instrument, NextStep } from '#lib/ux.ts';
	const weekEinsaetze = $derived(rows.flatMap((r) => days.map((d) => db.staffing(r.site.id, d)).filter((x): x is NonNullable<typeof x> => !!x)));
	const weekStaffed = $derived(weekEinsaetze.filter((x) => !x.empty).length);
	const availableToday = $derived(db.data.employees.filter((e) => !db.isAbsent(e.id, today)).length);
	const instruments = $derived<Instrument[]>([
		{ kind: 'gauge', label: 'Besetzung der Woche', value: weekEinsaetze.length ? weekStaffed / weekEinsaetze.length : 1, sub: `${weekStaffed} von ${weekEinsaetze.length} Einsätzen`, good: 0.95, warn: 0.8 },
		{ kind: 'stat', label: 'Ohne Besetzung', value: String(unfilled), sub: 'rote Einsätze', tone: unfilled ? 'danger' : 'success' },
		{ kind: 'stat', label: 'Mit Lücke', value: String(issues.length - unfilled), sub: 'Verstärkung fehlt', tone: issues.length - unfilled ? 'warn' : '' },
		{ kind: 'stat', label: 'Heute verfügbar', value: `${availableToday} / ${db.data.employees.length}`, sub: 'Mitarbeitende' }
	]);
	const nextStep = $derived<NextStep>(
		unfilled ? { tone: 'danger', text: `${unfilled} ${unfilled === 1 ? 'Einsatz hat' : 'Einsätze haben'} keine Besetzung. Ziehen Sie eine Person aus der Leiste auf das rote Feld.` }
		: issues.length ? { tone: 'warn', text: `${issues.length} ${issues.length === 1 ? 'Einsatz ist' : 'Einsätze sind'} nur teilweise besetzt. Verstärkung per Drag & Drop einteilen.` }
		: { tone: 'ok', text: 'Alle Einsätze dieser Woche sind besetzt.' }
	);
</script>

<svelte:head><title>Einsatzplan · Objektia</title></svelte:head>

<PageHead title="Einsatzplan" subtitle={'Wochenplan aus den Reinigungsplänen, Abwesenheiten sind eingerechnet.'} {instruments} next={nextStep}>
	{#snippet actions()}
		<div class="flex items-center gap-1">
			<button class="btn" onclick={() => (sheetOpen = true)}><FileText size={14} /> Einsatzzettel</button>
			<button class="btn btn-icon" aria-label="Vorherige Woche" onclick={() => (monday = addDays(monday, -7))}><ChevronLeft size={15} /></button>
			<button class="btn min-w-[150px] num" onclick={() => (monday = mondayOf(today))}>{weekLabel}</button>
			<button class="btn btn-icon" aria-label="Nächste Woche" onclick={() => (monday = addDays(monday, 7))}><ChevronRight size={15} /></button>
		</div>
	{/snippet}
</PageHead>


{#if gapsToFill.length}
	<section class="card mb-3 border-danger/30 p-3" aria-label="Ausfälle ersetzen">
		<p class="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-danger uppercase"><UserPlus size={13} /> Ausfälle ersetzen ({gapsToFill.length})</p>
		<ul class="flex flex-col divide-y divide-line">
			{#each gapsToFill as g (g.siteId + g.date)}
				<li class="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2">
					<div class="min-w-[220px] flex-1"><p class="text-sm font-medium"><span class="num text-muted">{formatDateShort(g.date)}, {g.start}</span> · {g.customer}</p><p class="text-xs text-muted">{g.site}{g.empty ? ' · unbesetzt' : ' · unterbesetzt'}</p></div>
					{#if g.best}
						<span class="flex items-center gap-2 text-sm"><Avatar name={g.best.employee.name} size={26} square={false} person />{g.best.employee.name.split(' ')[0]}<span class="text-xs text-muted">{g.best.employee.role === 'Springer' ? 'Springer' : `${Math.round(g.best.capacityLeft)} Std. frei`}</span></span>
						<button class="btn btn-sm btn-primary" onclick={() => autoCover(g)}>Einteilen</button>
					{:else}<span class="text-xs text-danger">Niemand frei</span>{/if}
					<button class="btn btn-sm" onclick={() => open(g.siteId, g.date)}>Assistent</button>
				</li>
			{/each}
		</ul>
	</section>
{/if}

{#if warnings.length}
	<section class="card mb-3 border-warn/40 p-3" aria-label="Planungswarnungen">
		<p class="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-warn uppercase"><TriangleAlert size={13} /> {warnings.length} Planungswarnung{warnings.length === 1 ? '' : 'en'} in dieser Woche</p>
		<ul class="flex flex-col gap-1">{#each warnings as w}<li class="flex items-start gap-2 text-sm"><span class="mt-0.5 shrink-0 rounded-full bg-warn-soft px-2 py-0.5 text-[0.7rem] font-semibold text-warn">{warnLabel[w.kind]}</span><span>{w.text}</span></li>{/each}</ul>
	</section>
{/if}

<section class="card mb-3 p-3" aria-label="Personen zum Einteilen">
	<div class="mb-2 flex items-center justify-between gap-2">
		<p class="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase"><GripVertical size={13} /> Ziehen und ablegen</p>
		{#if drag?.kind === 'cover'}
			<div class="flex items-center gap-1.5 rounded-lg border-2 border-dashed border-danger/50 px-3 py-1 text-xs text-danger" role="presentation" ondragover={(e) => e.preventDefault()} ondrop={dropRemove}><Trash2 size={13} /> Hierher ziehen: Vertretung entfernen</div>
		{:else}<p class="hidden text-xs text-muted sm:block">Person auf einen Einsatz ziehen = Vertretung einteilen. Zulässige Felder leuchten grün.</p>{/if}
	</div>
	<ul class="flex flex-wrap gap-1.5">
		{#each db.data.employees as e (e.id)}
			{@const away = db.isAbsent(e.id, today)}
			<li draggable="true" ondragstart={(ev) => startDrag(ev, { kind: 'emp', empId: e.id })} ondragend={endDrag} class="flex cursor-grab items-center gap-2 rounded-full border border-line bg-surface py-1 pr-3 pl-1 text-sm shadow-sm transition hover:-translate-y-px hover:shadow-md active:cursor-grabbing {away ? 'opacity-50' : ''} {drag?.empId === e.id ? 'ring-2 ring-accent' : ''}" title="{e.name}, {e.role}{away ? ' (heute abwesend)' : ''}">
				<Avatar name={e.name} size={26} square={false} person /><span class="font-medium">{e.name.split(' ')[0]}</span><span class="text-xs text-muted">{e.role === 'Springer' ? 'Springer' : e.contract === 'minijob' ? 'Minijob' : ''}</span>
			</li>
		{/each}
	</ul>
</section>

<div class="card overflow-x-auto">
	<table class="w-full min-w-[980px] table-fixed border-collapse">
		<thead class="border-b border-line bg-bg/60">
			<tr>
				<th class="th sticky left-0 z-10 w-[150px] bg-surface sm:w-[220px]">Objekt</th>
				{#each days as d, i}
					<th class="th text-center {d === today ? 'text-accent' : ''}">{names[i]} <span class="num font-normal">{d.slice(8)}.{d.slice(5, 7)}.</span></th>
				{/each}
			</tr>
		</thead>
		<tbody class="divide-y divide-line">
			{#each rows as { site, customer } (site.id)}
				<tr>
					<td class="sticky left-0 z-10 bg-surface px-3 py-2.5 align-top">
						<a href="/kunden/{customer.id}" class="block truncate text-sm font-medium hover:text-accent" title={customer.name}>{customer.name}</a>
						<span class="block truncate text-xs text-muted">{site.name} · {site.plan!.start}–{fromMinutes(toMinutes(site.plan!.start) + site.plan!.hours * 60)}</span>
					</td>
					{#each days as d}
						{@const st = db.staffing(site.id, d)}
						<td class="px-1.5 py-1.5 align-top {d === today ? 'bg-accent-soft/40' : ''}">
							{#if st}
								{@const tg = drag ? targets.get(key(site.id, d)) : undefined}
								<div
									role="button"
									tabindex="0"
									class="flex w-full cursor-pointer flex-col gap-0.5 rounded-md border px-2 py-1.5 text-left text-xs transition {st.empty ? 'border-danger/40 bg-danger-soft text-danger hover:border-danger' : st.understaffed ? 'border-warn/40 bg-warn-soft hover:border-warn' : 'border-line bg-surface hover:border-line-strong'} {drag && tg?.ok ? 'ring-2 ring-success/60 ring-offset-1' : ''} {drag && !tg?.ok ? 'opacity-40' : ''} {over === key(site.id, d) ? '!border-success !bg-success-soft scale-[1.03]' : ''}"
									onclick={() => open(site.id, d)}
									onkeydown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); open(site.id, d); } }}
									ondragover={(ev) => allow(ev, site.id, d)}
									ondragleave={() => { if (over === key(site.id, d)) over = null; }}
									ondrop={(ev) => dropOn(ev, site.id, d)}
									aria-label="{site.name} am {d}: {st.empty ? 'unbesetzt' : 'besetzt'}. Vertretung einteilen"
								>
									{#each st.present as m}<span class="truncate font-medium text-fg">{m.name.split(' ')[0]}</span>{/each}
									{#each st.covers as c}<span role="presentation" draggable="true" ondragstart={(ev) => { ev.stopPropagation(); startDrag(ev, { kind: 'cover', empId: c.emp.id, coverId: c.cover.id }); }} ondragend={endDrag} onclick={(ev) => ev.stopPropagation()} class="flex cursor-grab items-center gap-1 truncate rounded bg-info-soft px-1 font-medium text-info active:cursor-grabbing" title="Ziehen zum Verschieben oder Entfernen"><UserPlus size={11} />{c.emp.name.split(' ')[0]}</span>{/each}
									{#each st.absent as m}<span class="truncate line-through opacity-70">{m.name.split(' ')[0]}</span>{/each}
									{#if st.empty}<span class="font-semibold">Unbesetzt</span>{/if}
								</div>
							{:else}
								<div class="h-full min-h-8 text-center text-faint">·</div>
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
<p class="mt-3 text-xs text-muted">Tipp: Blaue Vertretungen lassen sich auf andere Einsätze verschieben. Durchgestrichen = abwesend · <span class="text-info">blau</span> = Vertretung · Soll-Stunden und Besetzung pflegen Sie im Reinigungsplan des Objekts (Demo-Daten).</p>

<Dialog bind:open={pickOpen} title="Besetzung ändern" description={pickSite && pick ? `${pickSite.customer.name} · ${pickSite.site.name} am ${pick.date.split('-').reverse().join('.')}` : ''} width={540}>
	{#snippet children()}
		{#if pick}
			{@const covers = db.data.covers.filter((c) => c.siteId === pick!.siteId && c.date === pick!.date)}
			{#if covers.length}
				<ul class="mb-3 flex flex-wrap gap-1.5">
					{#each covers as c (c.id)}
						<li class="badge badge-info">{db.employee(c.employeeId)?.name}
							<button class="ml-0.5" aria-label="Vertretung entfernen" onclick={() => removeCover(c.id)}><X size={11} /></button></li>
					{/each}
				</ul>
			{/if}
			<p class="label flex items-center gap-1.5"><Sparkles size={12} /> Vorschläge, beste zuerst</p>
			<ul class="flex max-h-80 flex-col gap-1.5 overflow-y-auto">
				{#each candidates as c, i (c.employee.id)}
					<li class="rounded-lg border border-line {c.allowed ? '' : 'opacity-60'}">
						<div class="flex items-center gap-2 px-3 py-2">
							<div class="min-w-0 flex-1">
								<p class="text-sm font-medium">{c.employee.name} <span class="font-normal text-muted">· {c.employee.role}</span>{#if c.allowed && i === 0}<span class="badge badge-success ml-1.5">Empfohlen</span>{/if}</p>
								{#if c.allowed}
									<p class="num text-xs text-muted">{c.capacityLeft > 0 ? `${c.capacityLeft.toLocaleString('de-DE')} Std./Woche frei` : 'ausgelastet'} · Kosten ca. {formatEur(c.costCents)}{c.minijobLeftCents !== null ? ` · Minijob-Rest ${formatEur(c.minijobLeftCents)}` : ''}</p>
								{:else}<p class="text-xs text-danger">{c.reason}</p>{/if}
							</div>
							{#if c.allowed}
								<button class="btn btn-ghost btn-icon btn-sm" aria-label="Anfragetext für {c.employee.name} kopieren" title="Anfragetext kopieren" onclick={() => copyRequest(c.employee.id)}><Copy size={13} /></button>
								<button class="btn btn-sm" onclick={() => assign(c.employee.id)}>Einteilen</button>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	{/snippet}
</Dialog>

<Dialog bind:open={sheetOpen} title="Einsatzzettel" description="Wochenübersicht zum Ausdrucken oder Weitergeben: große Schrift, einfache Sprache, mit Kolleginnen und Kollegen je Einsatz.">
	{#snippet children()}
		<label class="label" for="sw">Für wen?</label>
		<select id="sw" class="input" bind:value={sheetWho}><option value="alle">Alle Mitarbeitenden (eine Seite je Person)</option>{#each db.data.employees as e}<option value={e.id}>{e.name}</option>{/each}</select>
		<p class="mt-2 text-xs text-muted">Woche {weekLabel}. Personen ohne Einsatz in dieser Woche werden ausgelassen.</p>
	{/snippet}
	{#snippet footer()}<button class="btn" onclick={() => (sheetOpen = false)}>Abbrechen</button><button class="btn btn-primary" onclick={makeSheets}><FileText size={14} /> PDF erstellen</button>{/snippet}
</Dialog>
