<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import Avatar from '#lib/components/Avatar.svelte';
	import { toasts } from '#lib/toast.svelte.ts';
	import { formatDate, formatEur, todayKey, dayDiff } from '#lib/format.ts';
	import { MINIJOB_LIMIT_CENTS, WAGE_LG1_2026 } from '#lib/tariff.ts';
	import { addMonths } from '#lib/calc.ts';
	import Badge from '#lib/components/Badge.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { Plus, CalendarOff, Trash2, TriangleAlert, ShieldCheck, KeyRound, ArrowLeftRight, ArrowRight, Check, X } from '@lucide/svelte';
	import type { ContractType, EmployeeStatus, PersonPaper } from '#lib/types.ts';
	import { STATUS, statusOf, statusLabel, onboarding, canActivate, openSteps, PAPER_KINDS, paperLabel, paperState, worstPaper } from '#lib/personal.ts';

	const today = todayKey();
	const month = db.refMonth;
	const label: Record<ContractType, string> = { vollzeit: 'Vollzeit', teilzeit: 'Teilzeit', minijob: 'Minijob' };

	const rows = $derived(
		db.data.employees.map((e) => {
			const hours = db.data.timeEntries.filter((t) => t.employeeId === e.id && t.date.startsWith(month)).reduce((s, t) => s + db.hoursOf(t), 0);
			const entries = db.data.timeEntries.filter((x) => x.employeeId === e.id && x.date.startsWith(month));
			const surcharge = entries.reduce((s, x) => s + db.surchargeOf(x), 0);
			const earned = Math.round(hours * WAGE_LG1_2026) + surcharge;
			const daysInMonth = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
			const soll = (e.weeklyHours * daysInMonth) / 7;
			const absence = db.isAbsent(e.id, today);
			return { e, hours, earned, surcharge, soll, absence, pct: e.contract === 'minijob' ? earned / MINIJOB_LIMIT_CENTS : 0 };
		})
	);
	/** Unterweisung: mindestens jährlich (§ 14 GefStoffV), Ampel 30 Tage vor Ablauf */
	function training(e: { instructedOn: string | null }) {
		if (!e.instructedOn) return { tone: 'danger' as const, label: 'Fehlt', due: null as string | null };
		const due = addMonths(e.instructedOn, 12);
		const days = dayDiff(due);
		return days < 0 ? { tone: 'danger' as const, label: `seit ${-days} Tagen überfällig`, due } : days <= 30 ? { tone: 'warn' as const, label: `fällig in ${days} Tagen`, due } : { tone: 'success' as const, label: 'aktuell', due };
	}
	function instruct(id: string) {
		const e = db.employee(id)!;
		const prev = e.instructedOn;
		e.instructedOn = today;
		toasts.push(`Unterweisung für ${e.name} dokumentiert.`, { tone: 'success', action: { label: 'Rückgängig', run: () => (e.instructedOn = prev) } });
	}
	const absences = $derived([...db.data.absences].sort((a, b) => b.from.localeCompare(a.from)));

	// Mitarbeiter anlegen
	let empOpen = $state(false);
	let emp = $state({ name: '', role: 'Reinigungskraft', contract: 'teilzeit' as ContractType, weeklyHours: 20, phone: '', email: '', direct: false });
	/** nächste freie Personalnummer (ab 1001) */
	const nextNo = () => String(Math.max(1000, ...db.data.employees.map((x) => Number(x.personnelNo) || 0)) + 1);
	let empErr = $state('');
	function addEmployee(ev: SubmitEvent) {
		ev.preventDefault();
		if (emp.name.trim().length < 2) return (empErr = 'Bitte einen Namen eingeben.');
		if (!(emp.weeklyHours > 0 && emp.weeklyHours <= 48)) return (empErr = 'Wochenstunden zwischen 1 und 48 angeben.');
		db.data.employees.push({ id: 'm' + Date.now().toString(36), name: emp.name.trim(), role: emp.role, contract: emp.contract, weeklyHours: emp.weeklyHours, phone: emp.phone, email: emp.email.trim(), personnelNo: nextNo(), status: emp.direct ? 'aktiv' : 'einstellung', startOn: todayKey(), instructedOn: null });
		empOpen = false;
		toasts.push(emp.direct ? `${emp.name.trim()} angelegt.` : `${emp.name.trim()} angelegt, Status „In Einstellung“. Erledigen Sie die Schritte in der Personalakte, dann wird die Person einplanbar.`, { tone: 'success', ms: 8000 });
	}

	// Personalakte
	let acte = $state<string | null>(null);
	const person = $derived(acte ? db.employee(acte) : undefined);
	let acteOpen = $state(false);
	const steps = $derived(person ? onboarding(person) : []);
	let paperDraft = $state<{ kind: PersonPaper['kind']; label: string; until: string; leadDays: number }>({ kind: 'arbeitserlaubnis', label: '', until: '', leadDays: 60 });
	function setStatus(s: EmployeeStatus) {
		if (!person) return;
		if (s === 'aktiv' && !canActivate(person) && !confirm(`Es sind noch ${openSteps(person).length} Schritte offen. Trotzdem aktivieren?`)) return;
		person.status = s;
		if (s === 'ausgeschieden') toasts.push('Bitte auch den Zugang zur Mitarbeiter-App sperren (Einstellungen → Zugänge).', { ms: 9000 });
	}
	function toggleStep(id: string, on: boolean) { if (!person) return; person.onboarding = { ...(person.onboarding ?? {}), [id]: on }; }
	function addPaper() {
		if (!person || !paperDraft.until) return;
		(person.papers ??= []);
		person.papers.push({ id: 'pp' + Date.now().toString(36), kind: paperDraft.kind, label: paperDraft.label.trim() || undefined, until: paperDraft.until, leadDays: Math.max(0, Math.min(365, Math.round(paperDraft.leadDays) || 60)) });
		paperDraft = { ...paperDraft, label: '', until: '' };
	}
	function removePaper(id: string) { if (person?.papers) person.papers = person.papers.filter((x) => x.id !== id); }

	// Abwesenheit
	let absOpen = $state(false);
	let ab = $state({ employeeId: '', kind: 'urlaub' as 'urlaub' | 'krank', from: today, to: today, approved: true });
	let abErr = $state('');
	function openAbsence(id = db.data.employees[0]?.id ?? '') {
		ab = { employeeId: id, kind: 'urlaub', from: today, to: today, approved: true };
		abErr = '';
		absOpen = true;
	}
	function addAbsence(ev: SubmitEvent) {
		ev.preventDefault();
		if (ab.to < ab.from) return (abErr = 'Das Ende darf nicht vor dem Beginn liegen.');
		db.data.absences.push({ id: 'ab' + Date.now().toString(36), employeeId: ab.employeeId, kind: ab.kind, from: ab.from, to: ab.to, status: ab.kind === 'krank' || ab.approved ? 'genehmigt' : 'beantragt' });
		absOpen = false;
		const open = db.plannedSites().filter((p) => p.site.plan!.staffIds.includes(ab.employeeId)).length;
		toasts.push(open ? `Eingetragen. ${open} Objekt(e) betroffen, prüfen Sie den Einsatzplan.` : 'Abwesenheit eingetragen.', { tone: 'success', ms: 8000 });
	}
	const pending = $derived(db.data.absences.filter((a) => a.status === 'beantragt'));
	function decide(id: string, ok: boolean) {
		const a = db.data.absences.find((x) => x.id === id)!;
		if (ok) { a.status = 'genehmigt'; toasts.push(`Urlaub für ${db.employee(a.employeeId)?.name} genehmigt.`, { tone: 'success' }); }
		else {
			const i = db.data.absences.indexOf(a);
			db.data.absences.splice(i, 1);
			toasts.push('Antrag abgelehnt.', { action: { label: 'Rückgängig', run: () => db.data.absences.push(a) } });
		}
	}
	function removeAbsence(id: string) {
		const i = db.data.absences.findIndex((a) => a.id === id);
		const [removed] = db.data.absences.splice(i, 1);
		toasts.push('Abwesenheit gelöscht.', { action: { label: 'Rückgängig', run: () => db.data.absences.push(removed) } });
	}
	import PageHead from '#lib/components/PageHead.svelte';
	import type { Instrument, NextStep } from '#lib/ux.ts';
	const trained = $derived(db.data.employees.filter((e) => e.instructedOn && training(e).tone !== 'danger').length);
	const awayToday = $derived(db.data.employees.filter((e) => db.isAbsent(e.id, today)).length);
	const minijobPeak = $derived(Math.max(0, ...rows.filter((r) => r.e.contract === 'minijob').map((r) => r.pct)));
	const instruments = $derived<Instrument[]>([
		{ kind: 'gauge', label: 'Unterweisungen aktuell', value: db.data.employees.length ? trained / db.data.employees.length : 1, sub: `${trained} von ${db.data.employees.length}`, good: 0.95, warn: 0.75 },
		{ kind: 'gauge', label: 'Minijob-Höchststand', value: Math.min(1, minijobPeak), sub: 'höchste Auslastung der 603-€-Grenze', good: 2, warn: 0.85 },
		{ kind: 'stat', label: 'Heute abwesend', value: `${awayToday} / ${db.data.employees.length}`, sub: 'krank oder im Urlaub', tone: awayToday ? 'warn' : '' },
		{ kind: 'stat', label: 'Zur Freigabe', value: String(pending.length), sub: 'Urlaubsanträge', tone: pending.length ? 'warn' : 'success' }
	]);
	const nextStep = $derived<NextStep>(
		pending.length ? { tone: 'warn', text: `${pending.length} ${pending.length === 1 ? 'Urlaubsantrag wartet' : 'Urlaubsanträge warten'} auf Ihre Entscheidung.` }
		: trained < db.data.employees.length ? { tone: 'warn', text: `${db.data.employees.length - trained} ${db.data.employees.length - trained === 1 ? 'Unterweisung fehlt oder ist' : 'Unterweisungen fehlen oder sind'} überfällig (jährliche Pflicht).` }
		: { tone: 'ok', text: 'Das Team ist auf dem aktuellen Stand.' }
	);
</script>

<svelte:head><title>Team · Putzbetrieb</title></svelte:head>

<PageHead title="Team" subtitle={`${db.data.employees.length} Mitarbeitende, Stunden und Minijob-Grenze im Monat ${month.split('-').reverse().join('/')}`} {instruments} next={nextStep}>
	{#snippet actions()}
		<button class="btn" onclick={() => openAbsence()}><CalendarOff size={14} /> Abwesenheit</button>
		<button class="btn btn-primary" onclick={() => { emp = { name: '', role: 'Reinigungskraft', contract: 'teilzeit', weeklyHours: 20, phone: '', email: '', direct: false }; empErr = ''; empOpen = true; }}><Plus size={15} /> Mitarbeiter</button>
	{/snippet}
</PageHead>

{#if db.swaps.length}
	<section class="card mb-5 border-accent/30" aria-labelledby="h-swap">
		<div class="border-b border-line px-5 py-3.5"><h2 id="h-swap" class="card-title flex items-center gap-2"><ArrowLeftRight size={15} class="text-accent" /> Tauschwünsche <span class="num font-normal text-muted">{db.swaps.length}</span></h2><p class="text-xs text-muted">Zwei Mitarbeitende haben sich geeinigt. Mit „Genehmigen“ wechselt der Einsatz im Plan.</p></div>
		<ul class="divide-y divide-line">
			{#each db.swaps as w (w.id)}
				{@const f = db.site(w.siteId)}
				{@const from = db.employee(w.offeredBy)}
				{@const to = db.employee(w.takenBy ?? '')}
				<li class="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
					<div class="flex items-center gap-2">{#if from}<Avatar name={from.name} size={30} square={false} person />{/if}<ArrowRight size={14} class="text-faint" />{#if to}<Avatar name={to.name} size={30} square={false} person />{/if}</div>
					<div class="min-w-[220px] flex-1"><p class="text-sm font-medium">{from?.name.split(' ')[0]} gibt ab, {to?.name.split(' ')[0]} übernimmt</p><p class="text-xs text-muted"><span class="num">{formatDate(w.date)}</span>{#if f} · {f.customer.name.slice(0, 40)}, {f.site.name}{#if f.site.plan} · {f.site.plan.start} Uhr{/if}{/if}</p></div>
					<div class="flex gap-1.5"><button class="btn btn-sm btn-primary" onclick={async () => { const e = await db.decideSwap(w.id, 'approve'); toasts.push(e ?? 'Tausch genehmigt, der Plan ist angepasst.', { tone: e ? 'error' : 'success', ms: e ? 9000 : 4000 }); }}><Check size={13} /> Genehmigen</button><button class="btn btn-sm" onclick={async () => { const e = await db.decideSwap(w.id, 'reject'); toasts.push(e ?? 'Tausch abgelehnt.', { tone: e ? 'error' : 'success' }); }}><X size={13} /> Ablehnen</button></div>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<div class="card mb-5 overflow-x-auto">
	<table class="w-full min-w-[1080px] border-collapse">
		<thead class="border-b border-line bg-bg/60">
			<tr><th class="th">Name</th><th class="th">Rolle</th><th class="th">Vertrag</th><th class="th text-right">Std./Woche</th><th class="th">Heute</th><th class="th text-right">Ist-Std.</th><th class="th text-right">Saldo</th><th class="th w-[210px]">Minijob-Grenze</th><th class="th">Unterweisung</th></tr>
		</thead>
		<tbody class="divide-y divide-line">
			{#each rows as r (r.e.id)}
				{@const tr = training(r.e)}
				<tr>
					<td class="td font-medium whitespace-nowrap"><span class="flex items-center gap-2.5"><Avatar name={r.e.name} size={30} square={false} person /><button class="text-left font-medium hover:underline" onclick={() => { acte = r.e.id; acteOpen = true; }} title="Personalakte öffnen">{r.e.name}</button>{#if statusOf(r.e) !== 'aktiv'}<Badge tone={STATUS.find((s) => s.id === statusOf(r.e))!.tone} label={statusLabel(statusOf(r.e))} />{/if}{#if worstPaper(r.e, today)?.state === 'abgelaufen'}<span title="Ein Papier ist abgelaufen"><Badge tone="danger" label="Papier abgelaufen" /></span>{:else if worstPaper(r.e, today)?.state === 'bald'}<span title="Ein Papier läuft bald ab"><Badge tone="warn" label="Papier läuft ab" /></span>{/if}<a href="/einstellungen#zugaenge" class="ml-1 inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs font-medium text-muted hover:border-accent hover:text-accent" title="Handy-Zugang verwalten" aria-label="Zugang für {r.e.name} verwalten"><KeyRound size={11} /> Zugang</a></span></td>
					<td class="td text-muted">{r.e.role}</td>
					<td class="td"><Badge tone={r.e.contract === 'minijob' ? 'warn' : 'neutral'} label={label[r.e.contract]} /></td>
					<td class="td num text-right">{r.e.weeklyHours}</td>
					<td class="td">
						{#if r.absence}<Badge tone={r.absence.kind === 'krank' ? 'danger' : 'info'} label={r.absence.kind === 'krank' ? 'Krank' : 'Urlaub'} />{:else}<span class="text-muted">verfügbar</span>{/if}
					</td>
					<td class="td num text-right">{r.hours.toLocaleString('de-DE', { maximumFractionDigits: 1 })}</td>
					<td class="td num text-right text-sm {r.hours - r.soll < -4 ? 'text-warn' : r.hours - r.soll > 4 ? 'text-info' : 'text-muted'}" title="Ist minus Soll ({r.soll.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Std.)">{r.hours - r.soll > 0 ? '+' : ''}{(r.hours - r.soll).toLocaleString('de-DE', { maximumFractionDigits: 1 })}</td>
					<td class="td">
						{#if r.e.contract === 'minijob'}
							<div class="flex items-center gap-2">
								<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-valuenow={Math.round(r.pct * 100)} aria-valuemin="0" aria-valuemax="100" aria-label="Auslastung der Minijob-Grenze">
									<div class="h-full {r.pct >= 1 ? 'bg-danger' : r.pct >= 0.85 ? 'bg-warn' : 'bg-accent'}" style="width: {Math.min(100, r.pct * 100)}%"></div>
								</div>
								<span class="num w-24 text-right text-xs {r.pct >= 0.85 ? 'font-medium text-warn' : 'text-muted'}">{formatEur(r.earned)} / {formatEur(MINIJOB_LIMIT_CENTS)}</span>
							</div>
						{:else}<span class="text-xs text-faint">–</span>{/if}
					</td>
					<td class="td whitespace-nowrap">
						<div class="flex items-center gap-2">
							<Badge tone={tr.tone} label={tr.label} />
							{#if tr.tone !== 'success'}<button class="btn btn-ghost btn-sm" onclick={() => instruct(r.e.id)} title="Heute dokumentieren"><ShieldCheck size={13} /> Heute</button>{/if}
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
<p class="mb-5 -mt-3 flex items-start gap-1.5 text-xs text-muted"><TriangleAlert size={13} class="mt-px shrink-0" /> Minijob: Verdienst = Ist-Stunden × 15,00 € (Branchenmindestlohn LG 1) plus Zuschläge für Nacht, Sonn- und Feiertage. Saldo = Ist minus Soll laut Wochenstunden. Grenze 603 € monatlich (2026). Richtwert zur Orientierung, ersetzt keine Lohnabrechnung.</p>

{#if pending.length}
	<section class="card mb-5 border-warn/40" aria-labelledby="h-pending">
		<div class="border-b border-line px-4 py-3"><h2 id="h-pending" class="card-title">Zur Freigabe <span class="num font-normal text-faint">{pending.length}</span></h2></div>
		<ul class="divide-y divide-line">
			{#each pending as a (a.id)}
				{@const clash = db.plannedSites().filter((p) => p.site.plan!.staffIds.includes(a.employeeId)).length}
				<li class="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
					<div class="min-w-[200px] flex-1"><p class="flex items-center gap-2 font-medium"><Avatar name={db.employee(a.employeeId)?.name ?? ""} size={24} square={false} person />{db.employee(a.employeeId)?.name}</p><p class="text-xs text-muted">Urlaubsantrag {formatDate(a.from)}{a.to !== a.from ? ` – ${formatDate(a.to)}` : ''}{clash ? ` · betrifft ${clash} Objekt${clash === 1 ? '' : 'e'}` : ''}</p></div>
					<button class="btn btn-sm" onclick={() => decide(a.id, false)}>Ablehnen</button>
					<button class="btn btn-primary btn-sm" onclick={() => decide(a.id, true)}>Genehmigen</button>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<section class="card">
	<div class="flex items-center justify-between border-b border-line px-4 py-3"><h2 class="card-title">Abwesenheiten</h2></div>
	{#if absences.length === 0}
		<EmptyState icon={CalendarOff} title="Keine Abwesenheiten" text="Urlaub und Krankheit tragen Sie hier ein. Der Einsatzplan zeigt dann unbesetzte Objekte." />
	{:else}
		<ul class="divide-y divide-line">
			{#each absences as a (a.id)}
				<li class="flex items-center gap-3 px-4 py-2.5 text-sm">
					<span class="min-w-0 flex-1 font-medium">{db.employee(a.employeeId)?.name}</span>
					<Badge tone={a.kind === 'krank' ? 'danger' : a.status === 'beantragt' ? 'warn' : 'info'} label={a.kind === 'krank' ? 'Krank' : a.status === 'beantragt' ? 'Urlaub, beantragt' : 'Urlaub'} />
					<span class="num text-muted">{formatDate(a.from)}{a.to !== a.from ? ` – ${formatDate(a.to)}` : ''}</span>
					<button class="btn btn-ghost btn-icon btn-sm hover:text-danger" aria-label="Abwesenheit löschen" onclick={() => removeAbsence(a.id)}><Trash2 size={13} /></button>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<Dialog bind:open={empOpen} title="Neuer Mitarbeiter">
	{#snippet children()}
		<form id="emp-form" class="grid grid-cols-2 gap-3" onsubmit={addEmployee} novalidate>
			<div class="col-span-2"><label class="label" for="e-n">Name *</label><input id="e-n" class="input" bind:value={emp.name} /></div>
			<div><label class="label" for="e-r">Rolle</label><select id="e-r" class="input" bind:value={emp.role}><option>Reinigungskraft</option><option>Objektleitung</option><option>Springer</option></select></div>
			<div><label class="label" for="e-c">Vertrag</label><select id="e-c" class="input" bind:value={emp.contract}><option value="vollzeit">Vollzeit</option><option value="teilzeit">Teilzeit</option><option value="minijob">Minijob</option></select></div>
			<div><label class="label" for="e-h">Stunden pro Woche</label><input id="e-h" type="number" min="1" max="48" step="0.5" class="input num" bind:value={emp.weeklyHours} /></div>
			<div><label class="label" for="e-p">Mobilnummer</label><input id="e-p" type="tel" class="input" bind:value={emp.phone} /></div>
			<div class="col-span-2"><label class="label" for="e-m">E-Mail</label><input id="e-m" type="email" class="input" bind:value={emp.email} /></div>
			<label class="col-span-2 flex items-start gap-2 text-sm"><input type="checkbox" class="mt-0.5 size-4 accent-[var(--accent)]" bind:checked={emp.direct} /> <span>Direkt als aktiv anlegen (schon eingearbeitet). Sonst startet die Person „In Einstellung“ und wird erst nach den Schritten einplanbar.</span></label>
			{#if empErr}<p class="col-span-2 text-xs text-danger">{empErr}</p>{/if}
		</form>
	{/snippet}
	{#snippet footer()}
		<button class="btn" type="button" onclick={() => (empOpen = false)}>Abbrechen</button>
		<button class="btn btn-primary" type="submit" form="emp-form">Anlegen</button>
	{/snippet}
</Dialog>

<Dialog bind:open={acteOpen} title={person ? `Personalakte: ${person.name}` : 'Personalakte'} width={640}>
	{#snippet children()}
		{#if person}
			<div class="grid gap-5">
				<section aria-labelledby="pa-s">
					<h3 id="pa-s" class="mb-2 text-sm font-semibold">Stammdaten</h3>
					<div class="grid grid-cols-2 gap-3">
						<div><label class="label" for="pa-n">Name</label><input id="pa-n" class="input" bind:value={person.name} /></div>
						<div><label class="label" for="pa-no">Personalnummer</label><input id="pa-no" class="input num" bind:value={person.personnelNo} /></div>
						<div><label class="label" for="pa-p">Mobilnummer</label><input id="pa-p" type="tel" class="input" bind:value={person.phone} /></div>
						<div><label class="label" for="pa-m">E-Mail</label><input id="pa-m" type="email" class="input" bind:value={person.email} /></div>
						<div><label class="label" for="pa-r">Rolle</label><select id="pa-r" class="input" bind:value={person.role}><option>Reinigungskraft</option><option>Objektleitung</option><option>Springer</option></select></div>
						<div><label class="label" for="pa-c">Vertrag</label><select id="pa-c" class="input" bind:value={person.contract}><option value="vollzeit">Vollzeit</option><option value="teilzeit">Teilzeit</option><option value="minijob">Minijob</option></select></div>
						<div><label class="label" for="pa-h">Stunden pro Woche</label><input id="pa-h" type="number" min="1" max="48" step="0.5" class="input num" bind:value={person.weeklyHours} /></div>
						<div><label class="label" for="pa-b">Beschäftigungsbeginn</label><input id="pa-b" type="date" class="input" bind:value={person.startOn} /></div>
					</div>
				</section>

				<section aria-labelledby="pa-st">
					<div class="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 id="pa-st" class="text-sm font-semibold">Status und Einstellung</h3>
						<select class="input h-9 w-auto" aria-label="Status" value={statusOf(person)} onchange={(e) => { const v = e.currentTarget.value as EmployeeStatus; setStatus(v); e.currentTarget.value = statusOf(person); }}>{#each STATUS as s}<option value={s.id}>{s.label}</option>{/each}</select>
					</div>
					{#if ['bewerber', 'einstellung', 'vertrag'].includes(statusOf(person))}
					<ul class="divide-y divide-line rounded-lg border border-line">
						{#each steps as s (s.id)}
							<li class="flex items-start gap-3 px-3 py-2.5 text-sm">
								<input type="checkbox" class="mt-0.5 size-[18px] accent-[var(--accent)]" checked={s.done} disabled={s.auto} onchange={(e) => toggleStep(s.id, e.currentTarget.checked)} aria-label={s.label} />
								<div class="min-w-0 flex-1"><p class="font-medium {s.done ? 'text-muted line-through' : ''}">{s.label}</p><p class="text-xs text-muted">{s.hint}{#if s.auto} <span class="text-faint">(ergibt sich aus der Unterweisung)</span>{/if}</p></div>
								{#if s.auto && !s.done}<button class="btn btn-sm" onclick={() => instruct(person.id)}><ShieldCheck size={13} /> Heute dokumentieren</button>{/if}
							</li>
						{/each}
					</ul>
					{:else}<p class="text-sm text-muted">{statusOf(person) === 'aktiv' ? 'Die Person ist aktiv und wird eingeplant.' : `Status „${statusLabel(statusOf(person))}“: Die Person wird nicht neu eingeplant.`} Wählen Sie „In Einstellung“, um die Schritte der Einstellung zu sehen.</p>{/if}
					{#if ['bewerber', 'einstellung', 'vertrag'].includes(statusOf(person))}
						<div class="mt-3 flex flex-wrap items-center gap-3 rounded-lg px-3 py-2.5 text-sm {canActivate(person) ? 'bg-accent-soft' : 'bg-subtle'}">
							<span class="flex-1">{canActivate(person) ? 'Alle Schritte sind erledigt. Die Person kann jetzt aktiviert und eingeplant werden.' : `Noch ${openSteps(person).length} Schritte offen, bevor die Person eingeplant werden kann.`}</span>
							<button class="btn btn-primary btn-sm" disabled={!canActivate(person)} onclick={() => setStatus('aktiv')}><Check size={14} /> Aktivieren</button>
						</div>
					{/if}
				</section>

				<section aria-labelledby="pa-pp">
					<h3 id="pa-pp" class="mb-2 text-sm font-semibold">Papiere mit Ablaufdatum</h3>
					{#if (person.papers ?? []).length}
						<ul class="mb-3 divide-y divide-line rounded-lg border border-line">
							{#each person.papers ?? [] as p (p.id)}
								{@const st = paperState(p, today)}
								<li class="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
									<span class="min-w-[140px] flex-1 font-medium">{paperLabel(p)}</span>
									<span class="num text-muted">bis {formatDate(p.until)}</span>
									<Badge tone={st.state === 'abgelaufen' ? 'danger' : st.state === 'bald' ? 'warn' : 'success'} label={st.state === 'abgelaufen' ? `seit ${-st.days} Tagen abgelaufen` : st.state === 'bald' ? `noch ${st.days} Tage` : 'gültig'} />
									<button class="btn btn-ghost btn-icon btn-sm hover:text-danger" aria-label="Papier löschen" onclick={() => removePaper(p.id)}><Trash2 size={13} /></button>
								</li>
							{/each}
						</ul>
					{:else}<p class="mb-3 text-sm text-muted">Noch keine Papiere hinterlegt. Hier tragen Sie Arbeitserlaubnis, Aufenthaltstitel oder die Befristung eines Vertrags ein. Der Fristenkalender warnt rechtzeitig.</p>{/if}
					<div class="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_130px_90px_auto]">
						<select class="input" aria-label="Art" bind:value={paperDraft.kind}>{#each PAPER_KINDS as k}<option value={k.id}>{k.label}</option>{/each}</select>
						<input class="input" aria-label="Bezeichnung (optional)" placeholder="Bezeichnung (optional)" bind:value={paperDraft.label} />
						<input type="date" class="input" aria-label="Gültig bis" bind:value={paperDraft.until} />
						<input type="number" min="0" max="365" class="input num" aria-label="Vorlauf in Tagen" title="So viele Tage vorher wird gewarnt" bind:value={paperDraft.leadDays} />
						<button class="btn btn-sm" disabled={!paperDraft.until} onclick={addPaper}><Plus size={14} /> Hinzufügen</button>
					</div>
				</section>
			</div>
		{/if}
	{/snippet}
	{#snippet footer()}<button class="btn" type="button" onclick={() => (acteOpen = false)}>Schließen</button>{/snippet}
</Dialog>

<Dialog bind:open={absOpen} title="Abwesenheit eintragen">
	{#snippet children()}
		<form id="abs-form" class="grid grid-cols-2 gap-3" onsubmit={addAbsence} novalidate>
			<div><label class="label" for="a-e">Mitarbeiter</label><select id="a-e" class="input" bind:value={ab.employeeId}>{#each db.data.employees as e}<option value={e.id}>{e.name}</option>{/each}</select></div>
			<div><label class="label" for="a-k">Art</label><select id="a-k" class="input" bind:value={ab.kind}><option value="urlaub">Urlaub</option><option value="krank">Krank</option></select></div>
			<div><label class="label" for="a-f">Von</label><input id="a-f" type="date" class="input" bind:value={ab.from} /></div>
			<div><label class="label" for="a-t">Bis</label><input id="a-t" type="date" class="input" bind:value={ab.to} /></div>
			{#if ab.kind === 'urlaub'}<label class="col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-[var(--accent)]" bind:checked={ab.approved} /> Bereits genehmigt (sonst als Antrag zur Freigabe)</label>{/if}
			{#if abErr}<p class="col-span-2 text-xs text-danger">{abErr}</p>{/if}
		</form>
	{/snippet}
	{#snippet footer()}
		<button class="btn" type="button" onclick={() => (absOpen = false)}>Abbrechen</button>
		<button class="btn btn-primary" type="submit" form="abs-form">Eintragen</button>
	{/snippet}
</Dialog>
