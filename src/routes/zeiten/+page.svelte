<script lang="ts">
	import { page } from '$app/state';
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { payrollRows, payrollCsvRows } from '#lib/export.ts';
	import { exportSettings } from '#lib/exportConfig.svelte.ts';
	import { addDays, addMonths, weekday, entryHours, fromMinutes, toMinutes } from '#lib/calc.ts';
	import { surchargeInfo } from '#lib/surcharge.ts';
	import { todayKey, formatDate, dayDiff } from '#lib/format.ts';
	import Badge from '#lib/components/Badge.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { downloadBytes, toCsv } from '#lib/download.ts';
	import { Plus, Download, ChevronLeft, ChevronRight, Pencil, Ban, RotateCcw, Clock, Lock, LockOpen } from '@lucide/svelte';
	import type { TimeEntry } from '#lib/types.ts';
	import { closeReport, exportedSinceClose } from '#lib/monthClose.ts';

	const today = todayKey();
	let month = $state(db.refMonth);
	let who = $state('alle');
	const monthLabel = $derived(new Date(month + '-15T12:00:00Z').toLocaleDateString('de-DE', { month: 'long', year: 'numeric', timeZone: 'UTC' }));
	const shiftMonth = (n: number) => (month = addMonths(month + '-15', n).slice(0, 7));

	const entries = $derived(
		db.data.timeEntries
			.filter((t) => t.date.startsWith(month) && (who === 'alle' || t.employeeId === who))
			.sort((a, b) => b.date.localeCompare(a.date) || b.start.localeCompare(a.start))
	);
	const total = $derived(entries.reduce((s, t) => s + db.hoursOf(t), 0));
	const fmt = (h: number) => h.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

	/** Soll/Ist je Objekt: Soll = geplante Einsatztage bis gestern (bzw. Monatsende) × Stunden × Stammbesetzung. */
	const sollIst = $derived.by(() => {
		const first = month + '-01';
		const last = addDays(addMonths(first, 1), -1);
		const end = last < today ? last : addDays(today, -1);
		return db.plannedSites().map(({ site, customer }) => {
			const p = site.plan!;
			let days = 0;
			for (let d = first; d <= end; d = addDays(d, 1)) if (p.days.includes(weekday(d))) days++;
			const soll = days * p.hours * p.staffIds.length;
			const ist = db.data.timeEntries.filter((t) => t.siteId === site.id && t.date.startsWith(month)).reduce((s, t) => s + db.hoursOf(t), 0);
			return { site, customer, soll, ist, diff: ist - soll };
		}).filter((r) => r.soll > 0 || r.ist > 0);
	});

	// Monatsabschluss: abgeschlossene Monate sind gegen Änderungen gesperrt
	const locked = $derived(db.data.lockedMonths.includes(month));
	/** Korrekturanträge: Antwort-Feld je Antrag */
	let replies = $state<Record<string, string>>({});
	const recentCorrections = $derived((db.data.corrections ?? []).filter((c) => c.status !== 'offen').sort((a, b) => (b.decidedOn ?? '').localeCompare(a.decidedOn ?? '')).slice(0, 5));
	function decide(id: string, approve: boolean) {
		const err = db.decideCorrection(id, approve, replies[id] ?? '');
		if (err) return toasts.push(err, { tone: 'error' });
		toasts.push(approve ? 'Korrektur freigegeben und in die Buchung übernommen. Sie steht im Änderungsprotokoll.' : 'Antrag abgelehnt. Die Person sieht Ihre Antwort.', { tone: 'success' });
	}
	let lockOpen = $state(false);
	let closeAck = $state(false);
	let reopenWhy = $state('');
	const report = $derived(closeReport(db.data, month, today, (t) => db.hoursOf(t)));
	const exportedAt = $derived(exportedSinceClose(db.data.monthLog, month));
	const monthLog = $derived((db.data.monthLog ?? []).filter((x) => x.month === month).sort((a, b) => b.at.localeCompare(a.at)));
	const logLabel = { abgeschlossen: 'Abgeschlossen', entsperrt: 'Entsperrt', lohnexport: 'Lohnexport erzeugt' } as const;
	const stampOf = (iso: string) => new Date(iso).toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short' });
	function logMonth(kind: 'abgeschlossen' | 'entsperrt' | 'lohnexport', note = '') {
		db.data.monthLog ??= [];
		db.data.monthLog.push({ month, kind, at: new Date().toISOString(), by: db.me, note });
	}
	function openLock() { closeAck = false; reopenWhy = ''; lockOpen = true; }
	function toggleLock() {
		if (locked) {
			if (reopenWhy.trim().length < 3) return toasts.push('Bitte einen Grund für das Entsperren angeben.', { tone: 'error' });
			db.data.lockedMonths = db.data.lockedMonths.filter((m) => m !== month);
			logMonth('entsperrt', reopenWhy.trim());
			toasts.push(`${monthLabel} entsperrt. Der Grund ist protokolliert.`);
		} else {
			if (report.blockers.length) return;
			if (report.warnings.length && !closeAck) return;
			db.data.lockedMonths.push(month);
			logMonth('abgeschlossen', report.warnings.length ? `Mit Hinweisen: ${report.warnings.map((w) => w.text).join(' ')}` : `${report.entries} Buchungen, ${report.hours.toFixed(2).replace('.', ',')} Std.`);
			toasts.push(`${monthLabel} abgeschlossen. Buchungen sind jetzt gesperrt.`, { tone: 'success' });
		}
		lockOpen = false;
	}

	// Erfassen / Bearbeiten
	let open = $state(false);
	let editId = $state<string | null>(null);
	let f = $state({ employeeId: '', siteId: '', date: today, start: '08:00', end: '10:00', breakMin: 0, note: '', source: 'buero' as TimeEntry['source'], kind: 'arbeit' as NonNullable<TimeEntry['kind']> });
	let err = $state<Record<string, string>>({});
	const siteOptions = $derived(db.data.customers.flatMap((c) => c.sites.map((s) => ({ id: s.id, label: `${c.name.length > 38 ? c.name.slice(0, 36) + '…' : c.name} · ${s.name}` }))));

	$effect(() => {
		const sp = page.url.searchParams;
		if (!sp.get('neu')) return;
		openNew();
		// Vorbelegung, z. B. aus dem Lücken-Detektor
		const emp = sp.get('emp'), site = sp.get('site'), date = sp.get('date');
		if (emp && db.employee(emp)) f.employeeId = emp;
		if (site && db.site(site)) {
			f.siteId = site;
			const p = db.site(site)?.site.plan;
			if (p) { f.start = p.start; f.end = fromMinutes(toMinutes(p.start) + p.hours * 60); }
		}
		if (date) f.date = date;
		history.replaceState(history.state, '', '/zeiten');
	});
	function openNew() {
		editId = null;
		f = { employeeId: who !== 'alle' ? who : db.data.employees[0]?.id ?? '', siteId: siteOptions[0]?.id ?? '', date: today, start: '08:00', end: '10:00', breakMin: 0, note: '', source: 'buero', kind: 'arbeit' };
		err = {};
		open = true;
	}
	function openEdit(t: TimeEntry) {
		editId = t.id;
		f = { employeeId: t.employeeId, siteId: t.siteId, date: t.date, start: t.start, end: t.end, breakMin: t.breakMin, note: t.note, source: t.source, kind: t.kind ?? 'arbeit' };
		err = {};
		open = true;
	}
	const hoursNow = $derived(entryHours(f.start || '00:00', f.end || '00:00', Number(f.breakMin) || 0));
	const late = $derived(f.date && dayDiff(f.date) < -7);
	function save(ev: SubmitEvent) {
		ev.preventDefault();
		const e: Record<string, string> = {};
		if (!f.date) e.date = 'Datum fehlt.';
		else if (db.isLocked(f.date)) e.date = 'Dieser Monat ist abgeschlossen. Bitte erst entsperren.';
		else if (f.date > today) e.date = 'Zeiten in der Zukunft können nicht erfasst werden.';
		if (!f.start || !f.end) e.end = 'Beginn und Ende angeben.';
		else if (f.start === f.end) e.end = 'Beginn und Ende sind gleich.';
		else if (hoursNow > 12) e.end = 'Mehr als 12 Stunden an einem Tag: bitte Beginn und Ende prüfen.';
		if (Number(f.breakMin) < 0 || Number(f.breakMin) > 120) e.breakMin = 'Pause zwischen 0 und 120 Minuten.';
		err = e;
		if (Object.keys(e).length) return;
		if (editId) {
			const t = db.data.timeEntries.find((x) => x.id === editId)!;
			const changes: string[] = [];
			const nm = (id: string) => db.employee(id)?.name ?? id;
			if (t.date !== f.date) changes.push(`Datum ${formatDate(t.date)} → ${formatDate(f.date)}`);
			if (t.start !== f.start || t.end !== f.end) changes.push(`Zeit ${t.start}–${t.end} → ${f.start}–${f.end}`);
			if (t.breakMin !== (Number(f.breakMin) || 0)) changes.push(`Pause ${t.breakMin} → ${Number(f.breakMin) || 0} Min.`);
			if (t.employeeId !== f.employeeId) changes.push(`Mitarbeiter ${nm(t.employeeId)} → ${nm(f.employeeId)}`);
			if (t.siteId !== f.siteId) changes.push('Objekt geändert');
			const stamp = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short' });
			if (changes.length) t.history.push(`${stamp}: ${changes.join('; ')}`);
			Object.assign(t, { ...f, breakMin: Number(f.breakMin) || 0, editedAt: new Date().toISOString() });
			toasts.push('Zeitbuchung geändert. Die Änderung ist vermerkt.', { tone: 'success' });
		} else {
			db.data.timeEntries.push({ id: 't' + Date.now().toString(36), ...f, breakMin: Number(f.breakMin) || 0, createdAt: new Date().toISOString(), editedAt: null, voided: false, history: [] });
			toasts.push('Zeit erfasst.', { tone: 'success' });
		}
		month = f.date.slice(0, 7);
		open = false;
	}
	/** Ungültig statt löschen: die Buchung bleibt nachvollziehbar sichtbar, zählt aber nicht mehr. */
	function voidEntry(t: TimeEntry) {
		if (db.isLocked(t.date)) return toasts.push('Der Monat ist abgeschlossen, Buchungen sind gesperrt.', { tone: 'error' });
		t.voided = !t.voided;
		const stamp = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short' });
		t.history.push(`${stamp}: ${t.voided ? 'als ungültig markiert' : 'wieder gültig gesetzt'}`);
		toasts.push(t.voided ? 'Buchung als ungültig markiert. Sie zählt nicht mehr.' : 'Buchung wieder gültig.', { action: { label: 'Rückgängig', run: () => { t.voided = !t.voided; t.history.pop(); } } });
	}

	/** Lohnstunden je Mitarbeiter und Lohnart (Arbeit, Weg, Rüst, Zuschläge) mit den Lohnart-Nummern aus den Einstellungen. Keine Lohnabrechnung. */
	function exportPayroll() {
		const cfg = exportSettings.cfg;
		const rows = payrollRows(db.data, month, cfg, (t) => db.hoursOf(t));
		downloadBytes(toCsv(payrollCsvRows(rows, month)), `Lohnstunden-${month}.csv`, 'text/csv;charset=utf-8');
		logMonth('lohnexport', locked ? '' : 'Monat war beim Export noch nicht abgeschlossen');
		const missing = rows.some((r) => !r.lohnart);
		toasts.push(`Lohnstunden für ${monthLabel} exportiert.${missing ? ' Es fehlen Lohnart-Nummern (Einstellungen).' : ''} Das ist keine Lohnabrechnung.`, { tone: missing ? 'default' : 'success', ms: 8000 });
	}
	function exportCsv() {
		const rows = [['Datum', 'Mitarbeiter', 'Kunde', 'Objekt', 'Beginn', 'Ende', 'Pause (Min.)', 'Stunden', 'Zuschlag', 'Geändert', 'Quelle', 'Zeitart', 'Gültig', 'Notiz']];
		for (const t of [...entries].reverse()) {
			const s = db.site(t.siteId);
			rows.push([t.date.split('-').reverse().join('.'), db.employee(t.employeeId)?.name ?? '', s?.customer.name ?? '', s?.site.name ?? '', t.start, t.end, String(t.breakMin), db.hoursOf(t).toFixed(2).replace('.', ','), surchargeInfo(t.date, t.start, t.end).label ?? '', t.editedAt ? 'ja' : '', t.source, t.kind === 'weg' ? 'Wegezeit' : t.kind === 'ruest' ? 'Rüstzeit' : 'Arbeit', t.voided ? 'nein' : 'ja', t.note]);
		}
		const csv = '﻿' + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\r\n');
		const a = document.createElement('a');
		a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
		a.download = `Zeiten-${month}.csv`;
		a.click();
		URL.revokeObjectURL(a.href);
		toasts.push(`${entries.length} Buchungen exportiert (CSV, Semikolon-getrennt).`, { tone: 'success' });
	}
	import PageHead from '#lib/components/PageHead.svelte';
	import type { Instrument, NextStep } from '#lib/ux.ts';
	import { findGaps } from '#lib/cockpit.ts';
	const istTotal = $derived(sollIst.reduce((a, r) => a + r.ist, 0));
	const sollTotal = $derived(sollIst.reduce((a, r) => a + r.soll, 0));
	const surchargeHours = $derived(entries.reduce((a, t) => a + Object.values(surchargeInfo(t.date, t.start, t.end).minutes).reduce((x, y) => x + y, 0) / 60, 0));
	const missing = $derived(findGaps(db.data, today).filter((g) => g.kind === 'fehlt').length);
	const instruments = $derived<Instrument[]>([
		{ kind: 'gauge', label: 'Plan-Treue', value: sollTotal ? Math.max(0, 1 - Math.abs(1 - istTotal / sollTotal)) : 1, sub: `Ist ${fmt(istTotal)} von Soll ${fmt(sollTotal)} Std.`, good: 0.9, warn: 0.75 },
		{ kind: 'stat', label: 'Stunden im Monat', value: fmt(total), sub: `${entries.length} Buchungen` },
		{ kind: 'stat', label: 'Zuschlagsstunden', value: fmt(surchargeHours), sub: 'Nacht, Sonn- und Feiertag' },
		{ kind: 'stat', label: 'Ohne Buchung', value: String(missing), sub: 'Einsätze der letzten 7 Tage', tone: missing ? 'warn' : 'success' }
	]);
	const nextStep = $derived<NextStep>(
		missing ? { tone: 'warn', text: `${missing} eingeplante ${missing === 1 ? 'Einsatz hat' : 'Einsätze haben'} keine Zeitbuchung. Bitte nachtragen (Frist: 7 Tage).`, cta: { label: 'Im Cockpit prüfen', href: '/cockpit' } }
		: !locked && month < today.slice(0, 7) ? { tone: 'info', text: `${monthLabel} ist vorbei. Schließen Sie den Monat ab, dann ist er gegen Änderungen geschützt.`, cta: { label: 'Monat abschließen', onclick: openLock } }
		: { tone: 'ok', text: 'Alle Einsätze sind gebucht.' }
	);
</script>

<svelte:head><title>Zeiten · Objektia</title></svelte:head>

<PageHead title="Zeiten" subtitle={'Arbeitszeit-Nachweis mit Beginn, Ende und Dauer. Erfassung binnen 7 Tagen, Aufbewahrung 2 Jahre.'} {instruments} next={nextStep}>
	{#snippet actions()}
		<button class="btn" onclick={openLock}>{#if locked}<LockOpen size={14} /> Entsperren{:else}<Lock size={14} /> Monat abschließen{/if}</button>
		<button class="btn" onclick={exportPayroll} disabled={!entries.length} title="Stunden je Lohnart (Arbeit, Weg, Rüst, Zuschläge) für die Lohnabrechnung"><Download size={14} /> Lohnstunden</button>
		<button class="btn" onclick={exportCsv} disabled={!entries.length}><Download size={14} /> CSV</button>
		<button class="btn btn-primary" onclick={openNew}><Plus size={15} /> Zeit erfassen</button>
	{/snippet}
</PageHead>

<div class="mb-3 flex flex-wrap items-center gap-2">
	<div class="flex items-center gap-1">
		<button class="btn btn-icon" aria-label="Vorheriger Monat" onclick={() => shiftMonth(-1)}><ChevronLeft size={15} /></button>
		<span class="min-w-[150px] text-center text-sm font-medium capitalize">{monthLabel}{#if locked} <Lock size={12} class="mb-0.5 inline text-muted" aria-label="abgeschlossen" />{/if}</span>
		<button class="btn btn-icon" aria-label="Nächster Monat" onclick={() => shiftMonth(1)}><ChevronRight size={15} /></button>
	</div>
	<select class="input w-52" aria-label="Mitarbeiter filtern" bind:value={who}>
		<option value="alle">Alle Mitarbeitenden</option>
		{#each db.data.employees as e}<option value={e.id}>{e.name}</option>{/each}
	</select>
	<span class="num ml-auto text-sm text-muted">{entries.length} Buchungen · <strong class="text-fg">{fmt(total)} Std.</strong></span>
</div>

{#if monthLog.length}
	<details class="mb-4 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm">
		<summary class="cursor-pointer font-semibold">Abschlussprotokoll {monthLabel} <span class="font-normal text-muted">({monthLog.length})</span></summary>
		<ul class="mt-2 divide-y divide-line">{#each monthLog as x}<li class="py-1.5"><span class="num text-muted">{stampOf(x.at)}</span> · <strong>{logLabel[x.kind]}</strong> · {x.by}{#if x.note}<span class="block text-xs text-muted">{x.note}</span>{/if}</li>{/each}</ul>
	</details>
{/if}

{#if db.openCorrections.length || recentCorrections.length}
	<section class="card mb-4 overflow-hidden" aria-labelledby="h-corr">
		<h2 id="h-corr" class="border-b border-line px-5 py-3 text-sm font-bold tracking-wide text-accent uppercase">Korrekturanträge{#if db.openCorrections.length} <span class="ml-1 rounded-full bg-warn-soft px-2 py-0.5 text-xs text-warn normal-case">{db.openCorrections.length} offen</span>{/if}</h2>
		<ul class="divide-y divide-line">
			{#each db.openCorrections as c (c.id)}
				{@const t = db.correctionTarget(c.entryId)}
				{@const s = t ? db.site(t.siteId) : null}
				<li class="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-start">
					<div class="min-w-0">
						<p class="font-semibold">{db.employee(c.employeeId)?.name ?? ''} <span class="num font-normal text-muted">· {formatDate(c.date)}{#if s} · {s.site.name}{/if}</span></p>
						<p class="num mt-1 text-sm"><span class="text-muted line-through">{c.old.start}–{c.old.end} (Pause {c.old.breakMin})</span> → <strong>{c.proposed.start}–{c.proposed.end} (Pause {c.proposed.breakMin})</strong></p>
						<p class="mt-1 text-sm">„{c.reason}“</p>
						{#if !t}<p class="mt-1 text-xs text-warn">Die Buchung ist noch nicht übernommen oder wurde entfernt.</p>{:else if db.isLocked(c.date)}<p class="mt-1 text-xs text-warn">Der Monat ist abgeschlossen. Zum Freigeben erst entsperren.</p>{/if}
					</div>
					<div class="flex flex-col gap-2 sm:w-64">
						<input class="input" placeholder="Antwort (bei Ablehnung Pflicht)" aria-label="Antwort an {db.employee(c.employeeId)?.name}" bind:value={replies[c.id]} maxlength="300" />
						<div class="flex gap-2"><button class="btn btn-primary flex-1" onclick={() => decide(c.id, true)} disabled={!t || db.isLocked(c.date)}>Freigeben</button><button class="btn flex-1" onclick={() => decide(c.id, false)}>Ablehnen</button></div>
					</div>
				</li>
			{/each}
			{#each recentCorrections as c (c.id)}
				<li class="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 text-sm text-muted"><span class="min-w-0 truncate">{db.employee(c.employeeId)?.name} · {formatDate(c.date)} · {c.proposed.start}–{c.proposed.end}{#if c.reply} · „{c.reply}“{/if}</span><span class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold {c.status === 'genehmigt' ? 'bg-success/15 text-success' : 'bg-danger-soft text-danger'}">{c.status}</span></li>
			{/each}
		</ul>
	</section>
{/if}

<div class="mb-5 grid gap-4 lg:grid-cols-5">
	<div class="card overflow-x-auto lg:col-span-3">
		{#if entries.length === 0}
			<EmptyState icon={Clock} title="Keine Zeitbuchungen" text="Für diesen Monat und Filter gibt es keine Einträge. Erfassen Sie Zeiten direkt nach dem Einsatz.">
				<button class="btn btn-primary" onclick={openNew}><Plus size={14} /> Zeit erfassen</button>
			</EmptyState>
		{:else}
			<table class="w-full min-w-[560px] border-collapse">
				<thead class="border-b border-line bg-bg/60"><tr><th class="th">Datum</th><th class="th">Mitarbeiter</th><th class="th">Objekt</th><th class="th text-right">Zeit</th><th class="th text-right">Std.</th><th class="th w-16"></th></tr></thead>
				<tbody class="divide-y divide-line">
					{#each entries.slice(0, 60) as t (t.id)}
						{@const s = db.site(t.siteId)}
						{@const sur = surchargeInfo(t.date, t.start, t.end).label}
						<tr class="group {t.voided ? 'opacity-50' : ''}">
							<td class="td num whitespace-nowrap">{formatDate(t.date)}</td>
							<td class="td max-w-[140px] truncate">{db.employee(t.employeeId)?.name}</td>
							<td class="td max-w-[200px]"><span class="block truncate" title={s?.customer.name}>{s?.customer.name}</span><span class="block truncate text-xs text-muted">{s?.site.name}</span></td>
							<td class="td num text-right whitespace-nowrap text-muted">{t.start}–{t.end}{#if t.breakMin} <span class="text-xs">(−{t.breakMin}′)</span>{/if}</td>
							<td class="td num text-right whitespace-nowrap font-medium">{fmt(db.hoursOf(t))}
								{#if sur}<span class="ml-1 align-middle"><Badge tone="warn" label={sur} /></span>{/if}
								{#if t.voided}<span class="ml-1 text-xs font-normal text-danger">ungültig</span>{/if}
								{#if t.editedAt}<span class="ml-1 text-xs font-normal text-faint" title={t.history.join('\n')}>geändert</span>{/if}
								{#if t.kind === 'weg'}<span class="ml-1 text-xs font-normal text-muted" title="Wegezeit zwischen Objekten">Weg</span>{:else if t.kind === 'ruest'}<span class="ml-1 text-xs font-normal text-muted" title="Rüstzeit">Rüst</span>{/if}
								{#if t.source === 'papier'}<span class="ml-1 text-xs font-normal text-muted" title="Aus Papier-Stundenzettel nacherfasst">Papier</span>{/if}
								{#if dayDiff(t.date, new Date(t.createdAt)) < -7}<span class="ml-1 text-xs font-normal text-warn" title="Mehr als 7 Tage nach der Arbeit erfasst">nachträglich</span>{/if}</td>
							<td class="td">
								<div class="flex justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100">
									<button class="btn btn-ghost btn-icon btn-sm" aria-label="Buchung bearbeiten" disabled={locked} onclick={() => openEdit(t)}><Pencil size={13} /></button>
									<button class="btn btn-ghost btn-icon btn-sm {t.voided ? '' : 'hover:text-danger'}" aria-label={t.voided ? 'Wieder gültig setzen' : 'Als ungültig markieren'} title={t.voided ? 'Wieder gültig setzen' : 'Als ungültig markieren'} disabled={locked} onclick={() => voidEntry(t)}>{#if t.voided}<RotateCcw size={13} />{:else}<Ban size={13} />{/if}</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			{#if entries.length > 60}<p class="border-t border-line px-4 py-2 text-xs text-muted">Die ersten 60 von {entries.length} Buchungen. Der CSV-Export enthält alle.</p>{/if}
		{/if}
	</div>

	<section class="card lg:col-span-2">
		<div class="border-b border-line px-4 py-3"><h2 class="card-title">Soll / Ist je Objekt</h2><p class="text-xs text-muted">Personenstunden bis gestern, laut Reinigungsplan</p></div>
		<ul class="divide-y divide-line">
			{#each sollIst as r (r.site.id)}
				<li class="px-4 py-2.5">
					<div class="flex items-baseline justify-between gap-2">
						<span class="truncate text-sm font-medium" title={r.customer.name}>{r.customer.name}</span>
						<span class="num shrink-0 text-xs {r.diff < -1 ? 'font-medium text-warn' : r.diff > 1 ? 'font-medium text-info' : 'text-muted'}">{r.diff > 0 ? '+' : ''}{fmt(r.diff)} Std.</span>
					</div>
					<p class="mb-1 truncate text-xs text-muted">{r.site.name}</p>
					<div class="h-1.5 overflow-hidden rounded-full bg-subtle"><div class="h-full {r.diff < -1 ? 'bg-warn' : 'bg-accent'}" style="width: {Math.min(100, r.soll ? (r.ist / r.soll) * 100 : 100)}%"></div></div>
					<p class="num mt-1 text-xs text-muted">Ist {fmt(r.ist)} von Soll {fmt(r.soll)} Std.</p>
				</li>
			{/each}
		</ul>
	</section>
</div>
<p class="text-xs text-muted">Zuschläge nach Rahmentarif: Nacht 23–6 Uhr +30 %, Sonn- und Feiertage +80 %, Neujahr, 1. Mai und Weihnachten +200 %, es zählt der höchste Satz. Bundesweite Feiertage, Landesfeiertage folgen. Keine GPS-Erfassung.</p>

<Dialog bind:open title={editId ? 'Zeitbuchung bearbeiten' : 'Zeit erfassen'} description={editId ? 'Änderungen werden an der Buchung vermerkt.' : undefined} width={500}>
	{#snippet children()}
		<form id="time-form" class="grid grid-cols-6 gap-3" onsubmit={save} novalidate>
			<div class="col-span-6 sm:col-span-3"><label class="label" for="z-e">Mitarbeiter</label><select id="z-e" class="input" bind:value={f.employeeId}>{#each db.data.employees as e}<option value={e.id}>{e.name}</option>{/each}</select></div>
			<div class="col-span-6 sm:col-span-3"><label class="label" for="z-d">Datum</label><input id="z-d" type="date" class="input" max={today} aria-invalid={!!err.date} bind:value={f.date} />{#if err.date}<p class="mt-1 text-xs text-danger">{err.date}</p>{/if}</div>
			<div class="col-span-6"><label class="label" for="z-s">Objekt</label><select id="z-s" class="input" bind:value={f.siteId}>{#each siteOptions as s}<option value={s.id}>{s.label}</option>{/each}</select></div>
			<div class="col-span-2"><label class="label" for="z-b">Beginn</label><input id="z-b" type="time" class="input num" bind:value={f.start} /></div>
			<div class="col-span-2"><label class="label" for="z-t">Ende</label><input id="z-t" type="time" class="input num" aria-invalid={!!err.end} bind:value={f.end} /></div>
			<div class="col-span-2"><label class="label" for="z-p">Pause (Min.)</label><input id="z-p" type="number" min="0" max="120" class="input num" aria-invalid={!!err.breakMin} bind:value={f.breakMin} /></div>
			{#if err.end}<p class="col-span-6 -mt-1 text-xs text-danger">{err.end}</p>{/if}
			{#if err.breakMin}<p class="col-span-6 -mt-1 text-xs text-danger">{err.breakMin}</p>{/if}
			<div class="col-span-6 sm:col-span-3"><label class="label" for="z-k">Zeitart</label><select id="z-k" class="input" bind:value={f.kind}><option value="arbeit">Arbeit am Objekt</option><option value="weg">Wegezeit zwischen Objekten</option><option value="ruest">Rüstzeit</option></select></div>
			<div class="col-span-6 sm:col-span-3"><label class="label" for="z-n">Notiz</label><input id="z-n" class="input" placeholder="z. B. Zusatzleistung, Besonderheiten" bind:value={f.note} /></div>
			<div class="col-span-6 sm:col-span-3"><label class="label" for="z-q">Quelle</label><select id="z-q" class="input" bind:value={f.source}><option value="buero">Büro</option><option value="papier">Papierzettel</option><option value="app">App</option></select></div>
			<p class="col-span-6 text-sm text-muted">Arbeitszeit: <strong class="num text-fg">{hoursNow.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Std.</strong>
				{#if f.date && f.start && f.end && surchargeInfo(f.date, f.start, f.end).label} · Zuschlag: {surchargeInfo(f.date, f.start, f.end).label}{/if}</p>
			{#if editId}{@const hist = db.data.timeEntries.find((x) => x.id === editId)?.history ?? []}{#if hist.length}<div class="col-span-6 rounded-md bg-subtle px-3 py-2 text-xs text-muted"><p class="mb-1 font-semibold text-fg">Änderungsprotokoll</p>{#each hist as h}<p>{h}</p>{/each}</div>{/if}{/if}
			{#if late}<p class="col-span-6 rounded-md bg-warn-soft px-3 py-2 text-xs text-warn">Das Datum liegt mehr als 7 Tage zurück. Die Aufzeichnung sollte spätestens 7 Tage nach der Arbeit erfolgen, diese Buchung gilt als nachträglich.</p>{/if}
		</form>
	{/snippet}
	{#snippet footer()}
		<button class="btn" type="button" onclick={() => (open = false)}>Abbrechen</button>
		<button class="btn btn-primary" type="submit" form="time-form">{editId ? 'Speichern' : 'Erfassen'}</button>
	{/snippet}
</Dialog>

<Dialog bind:open={lockOpen} title={locked ? `${monthLabel} entsperren?` : `${monthLabel} abschließen?`} description={locked ? 'Buchungen dieses Monats sind danach wieder änderbar. Das Entsperren wird mit Ihrem Namen und dem Grund protokolliert.' : 'Nach dem Abschluss lassen sich Buchungen dieses Monats nicht mehr ändern, auch nicht über Korrekturanträge.'}>
	{#snippet children()}
		{#if locked}
			{#if exportedAt}<p class="mb-3 rounded-lg bg-warn-soft px-3 py-2.5 text-sm text-warn">Für diesen Monat wurde am {stampOf(exportedAt)} schon ein Lohnexport erzeugt. Änderungen danach müssen der Lohnbuchhaltung nachgemeldet und der Export erneut erzeugt werden.</p>{/if}
			<label class="label" for="why">Grund für das Entsperren</label>
			<textarea id="why" class="input" rows="2" maxlength="300" bind:value={reopenWhy} placeholder="z. B. Stunden von Herrn Nowak nachtragen"></textarea>
		{:else}
			<p class="num mb-3 text-sm text-muted">{report.entries} gültige Buchungen · {report.hours.toFixed(1).replace('.', ',')} Std.</p>
			{#each report.blockers as b}<p class="mb-2 flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger"><Ban size={15} class="mt-0.5 shrink-0" /> {b.text}</p>{/each}
			{#each report.warnings as w}<p class="mb-2 flex items-start gap-2 rounded-lg bg-warn-soft px-3 py-2.5 text-sm text-warn"><Clock size={15} class="mt-0.5 shrink-0" /> {w.text}</p>{/each}
			{#if !report.blockers.length && !report.warnings.length}<p class="rounded-lg bg-success/10 px-3 py-2.5 text-sm text-success">Alles in Ordnung: keine offenen Anträge, keine Lücken, keine Auffälligkeiten.</p>{/if}
			{#if !report.blockers.length && report.warnings.length}<label class="mt-3 flex cursor-pointer items-start gap-2 text-sm"><input type="checkbox" class="mt-0.5 size-[18px] accent-[var(--accent)]" bind:checked={closeAck} /> Ich habe die Hinweise geprüft und schließe den Monat trotzdem ab.</label>{/if}
		{/if}
	{/snippet}
	{#snippet footer()}
		<button class="btn" onclick={() => (lockOpen = false)}>Abbrechen</button>
		<button class="btn btn-primary" onclick={toggleLock} disabled={!locked && (report.blockers.length > 0 || (report.warnings.length > 0 && !closeAck))}>{#if locked}<LockOpen size={14} /> Entsperren{:else}<Lock size={14} /> Abschließen{/if}</button>
	{/snippet}
</Dialog>
