<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { caseStatus, caseNet, stepLabels, reopenStep, type StepKey } from '#lib/cases.ts';
	import Dialog from '#lib/components/Dialog.svelte';
	import { addDays, addMonths } from '#lib/calc.ts';
	import { downloadIcs } from '#lib/download.ts';
	import { formatDate, formatDateTime, formatEur, todayKey } from '#lib/format.ts';
	import Badge from '#lib/components/Badge.svelte';
	import ProcessStepper from '#lib/components/ProcessStepper.svelte';
	import MoneyInput from '#lib/components/MoneyInput.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { ChevronRight, Check, X, CalendarPlus, FileText, ArrowRight, Inbox, CalendarArrowDown } from '@lucide/svelte';

	const today = todayKey();
	const c = $derived(db.data.cases.find((x) => x.id === page.params.id));
	const customer = $derived(c ? db.customer(c.customerId) : undefined);
	const site = $derived(c && customer ? customer.sites.find((s) => s.id === c.siteId) : undefined);
	const st = $derived(c ? caseStatus(db.data, c) : null);
	const net = $derived(c ? caseNet(db.data, c) : null);

	// ── Zurückspringen: erreichte Schritte im Stepper anklicken ──
	let jumpTo = $state<StepKey | null>(null);
	let jumpOpen = $state(false);
	function jump() {
		if (!c || !jumpTo) return;
		const text = reopenStep(db.data, c, jumpTo);
		db.addEvent(c.customerId, 'notiz', `${c.number}: ${text}`);
		toasts.push(text, { tone: 'success' });
		jumpOpen = false;
	}
	const log = (text: string) => c!.log.push({ at: new Date().toISOString(), text });
	const closedLabel = { abgesagt: 'Abgesagt', abgelehnt: 'Angebot abgelehnt', abgeschlossen: 'Abgeschlossen' } as const;

	// ── 1 Anfrage ──
	let declining = $state(false);
	function accept() { c!.decision = 'accepted'; log('Anfrage angenommen.'); toasts.push('Anfrage angenommen.', { tone: 'success' }); }
	function declineNoted() {
		c!.decision = 'declined'; c!.declineNotedAt = new Date().toISOString();
		log('Absage dem Kunden mitgeteilt (nur vermerkt, nichts versendet).');
		declining = false;
		toasts.push('Absage vermerkt. Der Vorgang ist beendet.', { tone: 'success' });
	}
	// ── 2 Daten ──
	function confirmData() { c!.dataConfirmed = true; log('Kundendaten geprüft und bestätigt.'); }
	// ── 3 Besichtigung ──
	let vf = $state({ date: addDays(today, 2), time: '10:00', who: db.me });
	function skipVisit() { c!.visitNeeded = false; log('Besichtigung nicht notwendig.'); }
	function planVisit(e: SubmitEvent) {
		e.preventDefault();
		const id = 'a' + Date.now().toString(36);
		db.data.appointments.push({ id, at: new Date(`${vf.date}T${vf.time}:00`).toISOString(), kind: 'besichtigung', customerId: c!.customerId, title: `Besichtigung ${site?.name ?? customer!.name}`.slice(0, 60), who: vf.who });
		c!.visitNeeded = true; c!.visitApptId = id;
		log(`Besichtigung am ${formatDate(vf.date)} um ${vf.time} Uhr geplant (${vf.who}).`);
		toasts.push('Termin angelegt, er steht auf „Heute“.', { tone: 'success' });
	}
	const visitAppt = $derived(db.data.appointments.find((a) => a.id === c?.visitApptId));
	function visitDone() { c!.visitDoneAt = new Date().toISOString(); log('Besichtigung durchgeführt.' + (c!.visitNote ? ` Notiz: ${c!.visitNote}` : '')); }
	// ── 4 Angebot ──
	let kind = $state<'unterhaltsreinigung' | 'sonderreinigung'>('unterhaltsreinigung');
	function createQuote() {
		const q = db.createQuote(c!.customerId, kind);
		if (c!.siteId) q.siteId = c!.siteId;
		c!.quoteRequired = true; c!.quoteId = q.id;
		log(`Angebot ${q.number} als Entwurf angelegt.`);
		goto(`/angebote/${q.id}`);
	}
	function noQuote() { c!.quoteRequired = false; log('Kein Angebot notwendig, weiter mit dem Startermin.'); }
	// ── 5 Rückmeldung ──
	function respond(res: 'angenommen' | 'abgelehnt') {
		const q = st!.quote!;
		q.status = res; q.followupOn = null; q.updatedAt = new Date().toISOString();
		if (res === 'angenommen') {
			if (customer && customer.status !== 'aktiv') customer.status = 'aktiv';
			if (q.kind === 'unterhaltsreinigung') q.contract = { startOn: addMonths(today.slice(0, 7) + '-01', 1), termMonths: 12, noticeMonths: 3, autoRenew: true };
		}
		log(`Angebot ${q.number} ${res === 'angenommen' ? 'angenommen' : 'abgelehnt'}.`);
		db.addEvent(c!.customerId, 'angebot', `Angebot ${q.number} ${res}.`);
		toasts.push(res === 'angenommen' ? 'Angebot angenommen. Weiter mit dem Startermin.' : 'Angebot abgelehnt. Der Vorgang ist beendet.', { tone: 'success' });
	}
	// ── 6 Start ──
	let sf = $state({ date: addDays(today, 7), time: '08:00', who: 'Team', net: null as number | null });
	let sErr = $state('');
	function planStart(e: SubmitEvent) {
		e.preventDefault();
		if (c!.quoteRequired === false && !sf.net) return (sErr = 'Ohne Angebot brauchen wir den Auftragswert (netto) für die Projektzeitliste.');
		const id = 'a' + Date.now().toString(36);
		const iso = new Date(`${sf.date}T${sf.time}:00`).toISOString();
		db.data.appointments.push({ id, at: iso, kind: 'start', customerId: c!.customerId, title: `Start ${site?.name ?? customer!.name}`.slice(0, 60), who: sf.who });
		c!.startAt = iso; c!.startApptId = id;
		if (c!.quoteRequired === false) c!.manualNetCents = sf.net;
		log(`Startermin am ${formatDate(sf.date)} um ${sf.time} Uhr (${sf.who}).`);
		sErr = '';
		toasts.push('Startermin angelegt, er steht auf „Heute“.', { tone: 'success' });
	}
	function ics(title: string, iso: string) { downloadIcs({ title: `${title}: ${customer?.name}`, startIso: iso, minutes: 120, description: c!.title, filename: `${c!.number}-${title}.ics` }); }
	// ── 7 Ausführung ──
	function executionDone() {
		c!.executionDoneAt = new Date().toISOString();
		log('Ausführung vermerkt.' + (c!.complaintNote ? ' Reklamation erfasst.' : ''));
		if (c!.complaintNote.trim()) {
			db.data.defects.push({ id: 'd' + Date.now().toString(36), customerId: c!.customerId, siteId: c!.siteId, title: `Reklamation: ${c!.title}`.slice(0, 80), description: c!.complaintNote.trim(), status: 'offen', severity: 'normal', reportedOn: today, dueOn: addDays(today, 3), closedOn: null, recheck: true, source: 'intern' });
			toasts.push('Ausführung vermerkt, die Reklamation steht in der Mängelliste.', { tone: 'success' });
		} else toasts.push('Ausführung vermerkt.', { tone: 'success' });
	}
	// ── 8 Projektzeitliste ──
	function toTimesheet() {
		c!.timesheetAt = new Date().toISOString();
		log('In die Projektzeitliste eingetragen. Vorgang abgeschlossen.');
		db.addEvent(c!.customerId, 'auftrag', `Vorgang ${c!.number} abgeschlossen und in die Projektzeitliste eingetragen.`);
		toasts.push('Eingetragen. Der Vorgang ist abgeschlossen.', { tone: 'success' });
	}
</script>

<svelte:head><title>{c?.number ?? 'Vorgang'} · Objektia</title></svelte:head>

{#if !c || !customer || !st}
	<div class="card"><EmptyState icon={Inbox} title="Vorgang nicht gefunden" text="Dieser Vorgang existiert nicht (mehr)."><a href="/vorgaenge" class="btn">Zu den Vorgängen</a></EmptyState></div>
{:else}
	<nav class="mb-3 flex items-center gap-1 text-xs text-muted" aria-label="Brotkrumen">
		<a href="/vorgaenge" class="hover:text-fg">Vorgänge</a><ChevronRight size={12} /><span class="text-fg">{c.number}</span>
	</nav>

	<div class="mb-5 flex flex-wrap items-start justify-between gap-3">
		<div class="min-w-0">
			<div class="flex flex-wrap items-center gap-2.5">
				<h1 class="page-title">{c.title}</h1>
				{#if st.closed}<Badge tone={st.closed === 'abgeschlossen' ? 'success' : 'danger'} label={closedLabel[st.closed]} />{:else}<Badge tone="info" label="Aktuell: {stepLabels[st.current!]}" />{/if}
			</div>
			<p class="mt-1 text-sm text-muted"><a href="/kunden/{customer.id}" class="font-medium text-fg hover:text-accent">{customer.name}</a>{#if site}{' · '}{site.name}{/if}{' · '}{c.number}{' · zuständig '}{c.assignee}</p>
		</div>
		{#if net}<div class="text-right"><p class="text-xs text-muted">Auftragswert netto</p><p class="num text-xl font-semibold">{formatEur(net)}</p></div>{/if}
	</div>

	<div class="mb-4"><ProcessStepper steps={st.steps} onjump={(k) => { jumpTo = k; jumpOpen = true; }} /></div>

	<div class="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
		<section class="card border-accent/30 p-5" aria-labelledby="h-action" aria-live="polite">
			{#if st.closed === 'abgesagt'}
				<h2 id="h-action" class="card-title mb-1">Vorgang beendet: Absage</h2>
				<p class="text-sm text-muted">Die Anfrage wurde nicht angenommen. Die Absage wurde am {formatDateTime(c.declineNotedAt!)} als mitgeteilt vermerkt.</p>
			{:else if st.closed === 'abgelehnt'}
				<h2 id="h-action" class="card-title mb-1">Vorgang beendet: Angebot abgelehnt</h2>
				<p class="text-sm text-muted">Der Kunde hat das Angebot {st.quote?.number} abgelehnt. Wenn sich etwas ändert, legen Sie eine neue Version an.</p>
				{#if st.quote}<a class="btn mt-3" href="/angebote/{st.quote.id}"><FileText size={14} /> Angebot ansehen</a>{/if}
			{:else if st.closed === 'abgeschlossen'}
				<h2 id="h-action" class="card-title mb-1">Vorgang abgeschlossen</h2>
				<p class="text-sm text-muted">In die Projektzeitliste eingetragen am {formatDateTime(c.timesheetAt!)}.</p>
				<a class="btn mt-3" href="/projektzeitliste">Zur Projektzeitliste <ArrowRight size={14} /></a>

			{:else if st.current === 'anfrage'}
				<h2 id="h-action" class="card-title mb-1 flex items-center gap-2"><ArrowRight size={16} class="text-accent" /> Wird die Anfrage angenommen?</h2>
				<p class="mb-4 text-sm text-muted">{customer.name} fragt an: {c.title}. Nehmen Sie den Auftrag an, geht es mit den Kundendaten weiter. Bei Absage wird der Vorgang beendet.</p>
				{#if !declining}
					<div class="flex flex-wrap gap-2"><button class="btn btn-primary" onclick={accept}><Check size={15} /> Ja, annehmen</button><button class="btn" onclick={() => (declining = true)}><X size={15} /> Nein, absagen</button></div>
				{:else}
					<div class="rounded-lg bg-warn-soft px-4 py-3 text-sm text-warn">
						<p class="font-semibold">Absage dem Kunden mitteilen</p>
						<p class="mt-1">Teilen Sie die Absage dem Kunden selbst mit. Hier vermerken Sie nur, dass es geschehen ist, es wird nichts versendet.</p>
						<div class="mt-3 flex gap-2"><button class="btn btn-primary" onclick={declineNoted}>Absage als mitgeteilt vermerken</button><button class="btn" onclick={() => (declining = false)}>Zurück</button></div>
					</div>
				{/if}

			{:else if st.current === 'daten'}
				<h2 id="h-action" class="card-title mb-1 flex items-center gap-2"><ArrowRight size={16} class="text-accent" /> Sind die Kundendaten vollständig?</h2>
				<dl class="my-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
					<div><dt class="text-xs text-muted">Kunde</dt><dd class="font-medium">{customer.name}</dd></div>
					<div><dt class="text-xs text-muted">Anschrift</dt><dd>{customer.street}, {customer.postal} {customer.city}</dd></div>
					<div><dt class="text-xs text-muted">Ansprechperson</dt><dd>{customer.contacts[0]?.name ?? 'fehlt'}{customer.contacts[0]?.phone ? ` · ${customer.contacts[0].phone}` : ''}</dd></div>
					<div><dt class="text-xs text-muted">Objekt</dt><dd>{site ? site.name : customer.sites.length ? 'nicht gewählt' : 'fehlt'}</dd></div>
				</dl>
				{#if !customer.contacts.length || !customer.sites.length}<p class="mb-3 rounded-md bg-warn-soft px-3 py-2 text-sm text-warn">Es fehlt noch eine Ansprechperson oder ein Objekt. Ergänzen Sie das beim Kunden.</p>{/if}
				<div class="flex flex-wrap gap-2"><button class="btn btn-primary" onclick={confirmData}><Check size={15} /> Daten sind vollständig</button><a class="btn" href="/kunden/{customer.id}">Kunde bearbeiten</a></div>

			{:else if st.current === 'besichtigung'}
				{#if c.visitNeeded === null}
					<h2 id="h-action" class="card-title mb-1 flex items-center gap-2"><ArrowRight size={16} class="text-accent" /> Ist eine Besichtigung notwendig?</h2>
					<p class="mb-4 text-sm text-muted">Bei größeren oder unklaren Objekten lohnt sich ein Termin vor Ort für Maße, Zugang und Besonderheiten.</p>
					<div class="flex flex-wrap gap-2"><button class="btn btn-primary" onclick={() => (c!.visitNeeded = true)}>Ja, Termin planen</button><button class="btn" onclick={skipVisit}>Nein, überspringen</button></div>
				{:else if !c.visitApptId}
					<h2 id="h-action" class="card-title mb-3">Besichtigungstermin festlegen</h2>
					<form class="grid gap-3 sm:grid-cols-3" onsubmit={planVisit}>
						<div><label class="label" for="vd">Datum</label><input id="vd" type="date" class="input" min={today} bind:value={vf.date} /></div>
						<div><label class="label" for="vt">Uhrzeit</label><input id="vt" type="time" class="input num" bind:value={vf.time} /></div>
						<div><label class="label" for="vw">Wer</label><select id="vw" class="input" bind:value={vf.who}><option>{db.me}</option><option>Herr R.</option>{#each db.data.employees as e}<option>{e.name}</option>{/each}</select></div>
						<div class="sm:col-span-3 flex gap-2"><button class="btn btn-primary"><CalendarPlus size={15} /> Termin anlegen</button><button type="button" class="btn" onclick={() => (c!.visitNeeded = null)}>Zurück</button></div>
					</form>
				{:else}
					<h2 id="h-action" class="card-title mb-1">Besichtigung{visitAppt ? ` am ${formatDateTime(visitAppt.at)}` : ''}</h2>
					<p class="mb-3 text-sm text-muted">Nach dem Termin halten Sie hier fest, was Sie vor Ort gesehen haben.</p>
					<label class="label" for="vn">Notizen zur Besichtigung</label>
					<textarea id="vn" class="input mb-3" rows="3" placeholder="Flächen, Zugang, Besonderheiten, Wünsche des Kunden …" bind:value={c.visitNote}></textarea>
					<div class="flex flex-wrap gap-2"><button class="btn btn-primary" onclick={visitDone}><Check size={15} /> Besichtigung durchgeführt</button>{#if visitAppt}<button class="btn" onclick={() => ics('Besichtigung', visitAppt!.at)}><CalendarArrowDown size={14} /> In Kalender (.ics)</button>{/if}</div>
				{/if}

			{:else if st.current === 'angebot'}
				{#if c.quoteRequired === null}
					<h2 id="h-action" class="card-title mb-1 flex items-center gap-2"><ArrowRight size={16} class="text-accent" /> Ist ein Angebot notwendig?</h2>
					<p class="mb-3 text-sm text-muted">Für Kleinaufträge reicht oft ein Festpreis ohne Angebot. Dann geht es direkt zum Startermin.</p>
					<div class="mb-3 grid max-w-lg grid-cols-2 gap-2">
						{#each [['unterhaltsreinigung', 'Unterhaltsreinigung', 'Regelmäßig, Monatspauschale'], ['sonderreinigung', 'Sonderreinigung', 'Einmalig, nach Stundenpreis']] as [v, l, s]}
							<button type="button" class="rounded-lg border p-3 text-left {kind === v ? 'border-accent bg-accent-soft' : 'border-line hover:bg-subtle'}" aria-pressed={kind === v} onclick={() => (kind = v as typeof kind)}><span class="block text-sm font-semibold">{l}</span><span class="text-xs text-muted">{s}</span></button>
						{/each}
					</div>
					<div class="flex flex-wrap gap-2"><button class="btn btn-primary" onclick={createQuote}><FileText size={15} /> Ja, Angebot erstellen</button><button class="btn" onclick={noQuote}>Nein, direkt zum Start</button></div>
				{:else if st.quote}
					<h2 id="h-action" class="card-title mb-1">Angebot {st.quote.number} ist ein Entwurf</h2>
					<p class="mb-4 text-sm text-muted">Sobald Sie es im Editor „als versendet vermerken“, rückt der Vorgang zur Rückmeldung vor.</p>
					<a class="btn btn-primary" href="/angebote/{st.quote.id}"><FileText size={15} /> Angebot bearbeiten</a>
				{/if}

			{:else if st.current === 'rueckmeldung' && st.quote}
				<h2 id="h-action" class="card-title mb-1 flex items-center gap-2"><ArrowRight size={16} class="text-accent" /> Wird das Angebot angenommen?</h2>
				<p class="mb-4 text-sm text-muted">Angebot {st.quote.number} wurde {st.quote.sentAt ? `am ${formatDate(st.quote.sentAt)} ` : ''}als versendet vermerkt{st.quote.followupOn ? `, Wiedervorlage ${formatDate(st.quote.followupOn)}` : ''}. Tragen Sie die Antwort des Kunden ein.</p>
				<div class="flex flex-wrap gap-2"><button class="btn btn-primary" onclick={() => respond('angenommen')}><Check size={15} /> Angenommen</button><button class="btn" onclick={() => respond('abgelehnt')}><X size={15} /> Abgelehnt</button><a class="btn btn-ghost" href="/angebote/{st.quote.id}">Angebot ansehen</a></div>

			{:else if st.current === 'start'}
				<h2 id="h-action" class="card-title mb-3 flex items-center gap-2"><ArrowRight size={16} class="text-accent" /> Startermin festlegen</h2>
				<form class="grid gap-3 sm:grid-cols-3" onsubmit={planStart}>
					<div><label class="label" for="sd">Datum</label><input id="sd" type="date" class="input" min={today} bind:value={sf.date} /></div>
					<div><label class="label" for="st">Uhrzeit</label><input id="st" type="time" class="input num" bind:value={sf.time} /></div>
					<div><label class="label" for="sw">Wer</label><select id="sw" class="input" bind:value={sf.who}><option>Team</option><option>{db.me}</option><option>Herr R.</option>{#each db.data.employees as e}<option>{e.name}</option>{/each}</select></div>
					{#if c.quoteRequired === false}<div class="sm:col-span-3 max-w-xs"><label class="label" for="sn">Auftragswert netto</label><MoneyInput id="sn" bind:value={sf.net} /></div>{/if}
					{#if sErr}<p class="text-xs text-danger sm:col-span-3">{sErr}</p>{/if}
					<div class="sm:col-span-3"><button class="btn btn-primary"><CalendarPlus size={15} /> Startermin anlegen</button></div>
				</form>

			{:else if st.current === 'ausfuehrung'}
				<h2 id="h-action" class="card-title mb-1 flex items-center gap-2"><ArrowRight size={16} class="text-accent" /> Ausführung vermerken</h2>
				<p class="mb-3 text-sm text-muted">Start war {c.startAt ? formatDateTime(c.startAt) : ''}. Haken Sie ab, was erledigt ist.</p>
				<ul class="mb-3 grid gap-1.5 sm:grid-cols-2">{#each c.checklist as it}<li><label class="flex cursor-pointer items-center gap-2 rounded-md border border-line px-3 py-2 text-sm hover:bg-subtle"><input type="checkbox" class="size-4 accent-[var(--accent)]" bind:checked={it.done} /> {it.label}</label></li>{/each}</ul>
				<label class="label" for="rk">Reklamation oder Auffälligkeit (optional)</label>
				<textarea id="rk" class="input mb-3" rows="2" placeholder="Wird bei Eintrag in die Mängelliste übernommen." bind:value={c.complaintNote}></textarea>
				<div class="flex flex-wrap gap-2"><button class="btn btn-primary" onclick={executionDone}><Check size={15} /> Ausführung vermerken</button>{#if c.startAt}<button class="btn" onclick={() => ics('Start', c!.startAt!)}><CalendarArrowDown size={14} /> Startermin (.ics)</button>{/if}</div>

			{:else if st.current === 'zeitliste'}
				<h2 id="h-action" class="card-title mb-1 flex items-center gap-2"><ArrowRight size={16} class="text-accent" /> In die Projektzeitliste eintragen</h2>
				<p class="mb-3 text-sm text-muted">Das schließt den Vorgang ab und übergibt Auftrag, Zeiten und Betrag an die Projektzeitliste.</p>
				<dl class="mb-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
					<div><dt class="text-xs text-muted">Auftragswert netto</dt><dd class="num font-medium">{net ? formatEur(net) : 'nicht angegeben'}</dd></div>
					<div><dt class="text-xs text-muted">Start</dt><dd>{c.startAt ? formatDate(c.startAt) : '–'}</dd></div>
					<div><dt class="text-xs text-muted">Ausführung</dt><dd>{c.executionDoneAt ? formatDate(c.executionDoneAt) : '–'}</dd></div>
				</dl>
				<button class="btn btn-primary" onclick={toTimesheet}><Check size={15} /> Eintragen und abschließen</button>
			{/if}
		</section>

		<aside class="flex flex-col gap-4">
			<section class="card p-4"><h2 class="card-title mb-3">Vorgang</h2>
				<dl class="flex flex-col gap-2 text-sm">
					<div class="flex justify-between gap-3"><dt class="text-muted">Nummer</dt><dd class="font-medium">{c.number}</dd></div>
					<div class="flex justify-between gap-3"><dt class="text-muted">Erfasst</dt><dd>{formatDate(c.createdAt)}</dd></div>
					<div class="flex justify-between gap-3"><dt class="text-muted">Zuständig</dt><dd>{c.assignee}</dd></div>
					{#if st.quote}<div class="flex justify-between gap-3"><dt class="text-muted">Angebot</dt><dd><a class="text-accent hover:underline" href="/angebote/{st.quote.id}">{st.quote.number}</a></dd></div>{/if}
				</dl>
			</section>
			<section class="card"><div class="border-b border-line px-4 py-3"><h2 class="card-title">Verlauf</h2></div>
				<ol class="flex max-h-72 flex-col gap-3 overflow-y-auto p-4">
					{#each [...c.log].reverse() as l}<li class="text-sm"><p>{l.text}</p><p class="text-xs text-muted">{formatDateTime(l.at)}</p></li>{/each}
				</ol>
			</section>
		</aside>
	</div>
{/if}

<Dialog bind:open={jumpOpen} title="Zurückspringen?" description="Der Schritt wird wieder offen. Spätere Schritte behalten ihre Daten, gelten aber als offen, bis dieser Schritt erneut bestätigt ist." width={480}>
	{#snippet children()}<p class="text-sm">Zu Schritt <strong>„{jumpTo ? stepLabels[jumpTo] : ''}“</strong> zurückspringen?{#if jumpTo === 'angebot' && st?.quote} Das Angebot {st.quote.number} wird dafür wieder zum Entwurf.{:else if jumpTo === 'rueckmeldung' && st?.quote} Das Angebot {st.quote.number} gilt dann wieder als versendet.{/if}</p>{/snippet}
	{#snippet footer()}<button class="btn" onclick={() => (jumpOpen = false)}>Abbrechen</button><button class="btn btn-primary" onclick={jump}>Zurückspringen</button>{/snippet}
</Dialog>
