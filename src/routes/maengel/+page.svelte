<script lang="ts">
	import { page } from '$app/state';
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { todayKey, formatDate, relativeDay, dayDiff } from '#lib/format.ts';
	import { addDays } from '#lib/calc.ts';
	import Badge from '#lib/components/Badge.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { Plus, CircleCheck } from '@lucide/svelte';
	import type { Defect, DefectStatus } from '#lib/types.ts';

	const today = todayKey();
	const statusLabel: Record<DefectStatus, { label: string; tone: 'danger' | 'info' | 'success' }> = {
		offen: { label: 'Offen', tone: 'danger' },
		in_bearbeitung: { label: 'In Bearbeitung', tone: 'info' },
		erledigt: { label: 'Erledigt', tone: 'success' }
	};
	let filter = $state<DefectStatus | 'aktiv' | 'alle'>('aktiv');
	const all = $derived(db.data.defects);
	const rows = $derived(
		all
			.filter((d) => (filter === 'alle' ? true : filter === 'aktiv' ? d.status !== 'erledigt' : d.status === filter))
			.sort((a, b) => Number(a.status === 'erledigt') - Number(b.status === 'erledigt') || a.dueOn.localeCompare(b.dueOn))
	);
	const overdue = $derived(all.filter((d) => d.status !== 'erledigt' && d.dueOn < today).length);

	/** Wiederholungsmängel: gleiches Objekt, mehrere Meldungen in 60 Tagen */
	const repeat = (d: Defect) => d.siteId && all.filter((x) => x.siteId === d.siteId && x.id !== d.id && dayDiff(x.reportedOn) > -60).length > 0;

	function setStatus(d: Defect, s: DefectStatus) {
		const prev = { status: d.status, closedOn: d.closedOn, respondedOn: d.respondedOn };
		d.status = s;
		if (s !== 'offen' && !d.respondedOn) d.respondedOn = today;
		d.closedOn = s === 'erledigt' ? today : null;
		db.addEvent(d.customerId, 'notiz', `Mangel „${d.title}“: ${statusLabel[s].label}.`);
		if (s === 'erledigt' && d.recheck && !db.data.tasks.some((t) => t.title === `Nachkontrolle: ${d.title}` && !t.done)) {
			const task = { id: 'a' + Date.now().toString(36), title: `Nachkontrolle: ${d.title}`, dueOn: addDays(today, 3), customerId: d.customerId, done: false };
			db.data.tasks.push(task);
			toasts.push(`Behoben. Nachkontrolle als Aufgabe für ${formatDate(task.dueOn)} angelegt.`, { tone: 'success', ms: 8000, action: { label: 'Rückgängig', run: () => { Object.assign(d, prev); const i = db.data.tasks.indexOf(task); if (i >= 0) db.data.tasks.splice(i, 1); } } });
			return;
		}
		toasts.push(`„${d.title}“ ist jetzt ${statusLabel[s].label.toLowerCase()}.`, { tone: 'success', action: { label: 'Rückgängig', run: () => Object.assign(d, prev) } });
	}

	let open = $state(false);
	let f = $state({ customerId: '', siteId: '', title: '', description: '', severity: 'normal' as 'normal' | 'hoch', dueOn: addDays(today, 3), recheck: true });
	let err = $state<Record<string, string>>({});
	const siteList = $derived(db.customer(f.customerId)?.sites ?? []);
	$effect(() => { if (page.url.searchParams.get('neu')) { openNew(); history.replaceState(history.state, '', '/maengel'); } });
	function openNew() {
		const c = db.data.customers[0];
		f = { customerId: c?.id ?? '', siteId: c?.sites[0]?.id ?? '', title: '', description: '', severity: 'normal', dueOn: addDays(today, 3), recheck: true };
		err = {};
		open = true;
	}
	function save(ev: SubmitEvent) {
		ev.preventDefault();
		const e: Record<string, string> = {};
		if (f.title.trim().length < 3) e.title = 'Bitte den Mangel kurz benennen.';
		if (f.dueOn < today) e.dueOn = 'Die Frist liegt in der Vergangenheit.';
		err = e;
		if (Object.keys(e).length) return;
		db.data.defects.push({ id: 'd' + Date.now().toString(36), customerId: f.customerId, siteId: f.siteId || null, title: f.title.trim(), description: f.description.trim(), status: 'offen', severity: f.severity, reportedOn: today, dueOn: f.dueOn, closedOn: null, recheck: f.recheck, source: 'intern' });
		db.addEvent(f.customerId, 'notiz', `Mangel gemeldet: ${f.title.trim()}.`);
		open = false;
		toasts.push('Mangel erfasst.', { tone: 'success' });
	}
	import PageHead from '#lib/components/PageHead.svelte';
	import type { Instrument, NextStep } from '#lib/ux.ts';
	const openList = $derived(all.filter((d) => d.status !== 'erledigt'));
	const closedList = $derived(all.filter((d) => d.status === 'erledigt' && d.closedOn));
	const avgDays = $derived(closedList.length ? closedList.reduce((a, d) => a + Math.max(0, -dayDiff(d.reportedOn, new Date(d.closedOn + 'T12:00:00Z'))), 0) / closedList.length : 0);
	// Reaktionszeit: Tage von der Meldung bis zur ersten Statusänderung. Offene Mängel ohne Reaktion nach mehr als einem Tag gelten als unbeantwortet.
	const responded = $derived(all.filter((d) => d.respondedOn));
	const avgReaction = $derived(responded.length ? responded.reduce((s, d) => s + (Date.parse(d.respondedOn! + 'T12:00:00Z') - Date.parse(d.reportedOn + 'T12:00:00Z')) / 86400000, 0) / responded.length : 0);
	const unanswered = $derived(all.filter((d) => d.status === 'offen' && !d.respondedOn && dayDiff(d.reportedOn) < -1).length);
	const instruments = $derived<Instrument[]>([
		{ kind: 'gauge', label: 'Fristeinhaltung', value: all.length ? (all.length - overdue) / all.length : 1, sub: 'nicht überfällig', good: 0.9, warn: 0.7 },
		{ kind: 'stat', label: 'Offen', value: String(openList.length), sub: 'Mängel in Arbeit' },
		{ kind: 'stat', label: 'Überfällig', value: String(overdue), sub: 'Frist überschritten', tone: overdue ? 'danger' : 'success' },
		{ kind: 'stat', label: 'Ø Reaktionszeit', value: responded.length ? `${avgReaction.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Tage` : '–', sub: unanswered ? `${unanswered} ohne erste Reaktion` : 'bis zur ersten Reaktion', tone: unanswered ? 'warn' : '' },
		{ kind: 'stat', label: 'Ø Behebungsdauer', value: `${avgDays.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Tage`, sub: 'bei erledigten Mängeln' }
	]);
	const worst = $derived([...openList].filter((d) => d.dueOn < today).sort((a, b) => a.dueOn.localeCompare(b.dueOn))[0]);
	const nextStep = $derived<NextStep>(
		worst ? { tone: 'danger', text: `„${worst.title}“ ist seit ${-dayDiff(worst.dueOn)} ${-dayDiff(worst.dueOn) === 1 ? 'Tag' : 'Tagen'} überfällig (${db.customer(worst.customerId)?.name.slice(0, 40)}).`, cta: { label: 'Aktive zeigen', onclick: () => (filter = 'aktiv') } }
		: openList.length ? { tone: 'info', text: `${openList.length} ${openList.length === 1 ? 'Mangel ist' : 'Mängel sind'} in Arbeit, alle innerhalb der Frist.` }
		: { tone: 'ok', text: 'Keine offenen Mängel.' }
	);
</script>

<svelte:head><title>Mängel · Putzbetrieb</title></svelte:head>

<PageHead title="Mängel und Reklamationen" subtitle={`${openList.length} offen${overdue ? `, davon ${overdue} überfällig` : ''}`} {instruments} next={nextStep}>
	{#snippet actions()}
		<button class="btn btn-primary" onclick={openNew}><Plus size={15} /> Mangel melden</button>
	{/snippet}
</PageHead>

<div class="mb-3 flex flex-wrap gap-1" role="group" aria-label="Nach Status filtern">
	{#each [['aktiv', 'Aktiv'], ['offen', 'Offen'], ['in_bearbeitung', 'In Bearbeitung'], ['erledigt', 'Erledigt'], ['alle', 'Alle']] as [id, label]}
		<button class="btn btn-sm {filter === id ? 'border-accent bg-accent text-white' : ''}" aria-pressed={filter === id} onclick={() => (filter = id as typeof filter)}>{label}</button>
	{/each}
</div>

<div class="card">
	{#if rows.length === 0}
		<EmptyState icon={CircleCheck} title="Keine Mängel in dieser Ansicht" text="Gut so. Neue Beanstandungen erfassen Sie mit „Mangel melden“, damit Frist und Verlauf nachvollziehbar bleiben." />
	{:else}
		<ul class="divide-y divide-line">
			{#each rows as d (d.id)}
				{@const late = d.status !== 'erledigt' && d.dueOn < today}
				<li class="flex flex-wrap items-start gap-x-4 gap-y-2 px-4 py-3">
					<div class="min-w-[240px] flex-1">
						<div class="flex flex-wrap items-center gap-2">
							<p class="text-sm font-medium">{d.title}</p>
							{#if d.severity === 'hoch'}<Badge tone="warn" label="Hoch" />{/if}
							{#if repeat(d)}<Badge tone="danger" label="Wiederholt" />{/if}
							{#if d.source !== 'intern'}<Badge tone="info" label={d.source === 'kunde' ? 'Vom Kunden gemeldet' : d.source === 'mitarbeiter' ? 'Vom Team gemeldet' : 'Aus Begehung'} />{/if}
							{#if d.photoId}<a href="/api/inbox/photo?id={d.photoId}" target="_blank" rel="noopener" class="ml-1 inline-block align-middle" title="Foto öffnen"><img src="/api/inbox/photo?id={d.photoId}" alt="Foto zur Meldung" class="size-9 rounded-md border border-line object-cover" loading="lazy" /></a>{/if}
						</div>
						<p class="mt-0.5 text-xs text-muted"><a class="hover:text-accent" href="/kunden/{d.customerId}">{db.customer(d.customerId)?.name}</a>{#if d.siteId} · {db.site(d.siteId)?.site.name}{/if}</p>
						{#if d.description}<p class="mt-1 text-sm text-muted">{d.description}</p>{/if}
					</div>
					<div class="num text-right text-xs {late ? 'font-medium text-danger' : 'text-muted'}">
						{#if d.status === 'erledigt'}erledigt am {formatDate(d.closedOn)}{:else}Frist {formatDate(d.dueOn)}<br />{relativeDay(d.dueOn)}{/if}
					</div>
					<label class="sr-only" for="st-{d.id}">Status</label>
					<select id="st-{d.id}" class="input w-[150px]" value={d.status} onchange={(e) => setStatus(d, e.currentTarget.value as DefectStatus)}>
						{#each Object.entries(statusLabel) as [k, v]}<option value={k}>{v.label}</option>{/each}
					</select>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<Dialog bind:open title="Mangel melden" description="Beanstandung des Kunden oder aus der eigenen Kontrolle." width={500}>
	{#snippet children()}
		<form id="defect-form" class="grid grid-cols-2 gap-3" onsubmit={save} novalidate>
			<div><label class="label" for="m-c">Kunde</label><select id="m-c" class="input" bind:value={f.customerId} onchange={() => (f.siteId = db.customer(f.customerId)?.sites[0]?.id ?? '')}>{#each db.data.customers as c}<option value={c.id}>{c.name.length > 40 ? c.name.slice(0, 38) + '…' : c.name}</option>{/each}</select></div>
			<div><label class="label" for="m-s">Objekt</label><select id="m-s" class="input" bind:value={f.siteId}>{#each siteList as s}<option value={s.id}>{s.name}</option>{/each}</select></div>
			<div class="col-span-2"><label class="label" for="m-t">Was ist das Problem? *</label><input id="m-t" class="input" aria-invalid={!!err.title} bind:value={f.title} />{#if err.title}<p class="mt-1 text-xs text-danger">{err.title}</p>{/if}</div>
			<div class="col-span-2"><label class="label" for="m-d">Details</label><textarea id="m-d" class="input" rows="3" bind:value={f.description}></textarea></div>
			<div><label class="label" for="m-f">Frist zur Behebung</label><input id="m-f" type="date" class="input" min={today} aria-invalid={!!err.dueOn} bind:value={f.dueOn} />{#if err.dueOn}<p class="mt-1 text-xs text-danger">{err.dueOn}</p>{/if}</div>
			<div><label class="label" for="m-v">Dringlichkeit</label><select id="m-v" class="input" bind:value={f.severity}><option value="normal">Normal</option><option value="hoch">Hoch</option></select></div>
			<label class="col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-[var(--accent)]" bind:checked={f.recheck} /> Nach der Behebung automatisch eine Nachkontrolle als Aufgabe anlegen</label>
		</form>
	{/snippet}
	{#snippet footer()}
		<button class="btn" type="button" onclick={() => (open = false)}>Abbrechen</button>
		<button class="btn btn-primary" type="submit" form="defect-form">Erfassen</button>
	{/snippet}
</Dialog>
