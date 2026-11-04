<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { customerStatus, quoteStatus, quoteKind } from '#lib/labels.ts';
	import { formatEur, formatDate, formatDateTime, relativeTime, dayDiff, todayKey } from '#lib/format.ts';
	import Badge from '#lib/components/Badge.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import LvEditor from '#lib/components/LvEditor.svelte';
	import { lvAt } from '#lib/lv.ts';
	import type { Site as SiteT } from '#lib/types.ts';
	import { renderSVG } from 'uqr';
	import { addDays } from '#lib/calc.ts';
	import { portal } from '#lib/portal.ts';
	import { company } from '#lib/company.ts';
	import { downloadBytes } from '#lib/download.ts';
	import { buildMonthlyReportPdf } from '#lib/pdf/documentsPdf.ts';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { ChevronRight, Plus, Mail, Phone, MapPin, FileText, MessageSquare, Eye, ClipboardCheck, Receipt, Inbox, FilePlus2, Trash2, QrCode, ListChecks, UserCheck, Printer, ExternalLink, Pencil, CalendarPlus, UserPlus, FileDown, Clock, RotateCcw } from '@lucide/svelte';

	const customer = $derived(db.customer(page.params.id!));
	const quotes = $derived(customer ? db.quotesOf(customer.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : []);
	const events = $derived(customer ? db.eventsOf(customer.id) : []);
	const invoices = $derived(customer ? db.data.invoices.filter((i) => i.customerId === customer.id) : []);
	const openInvoices = $derived(invoices.filter((i) => !i.paidAt));

	// ── Pflege: Kunde, Ansprechperson, Objekt mit Reinigungsplan, Termin ──
	const today = todayKey();
	const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
	/** Leistungsbericht für den Kunden: Einsätze, freigegebene Begehungen, Mängelstatus des Berichtsmonats */
	async function monthlyReport() {
		const c = customer!;
		const month = db.refMonth;
		const sites = c.sites.map((s) => {
			const es = db.data.timeEntries.filter((t) => t.siteId === s.id && t.date.startsWith(month) && !t.voided);
			return { name: s.name, visits: new Set(es.map((t) => t.date)).size, hours: es.reduce((a, t) => a + db.hoursOf(t), 0) };
		}).filter((s) => s.visits > 0);
		const inspections = db.data.inspections.filter((i) => i.shared && i.date.startsWith(month) && c.sites.some((s) => s.id === i.siteId)).map((i) => {
			const rated = i.items.filter((x) => x.rating !== 'na');
			return { siteName: db.site(i.siteId)?.site.name ?? '', date: i.date, score: rated.length ? Math.round((rated.filter((x) => x.rating === 'ok').length / rated.length) * 100) : 100, flaws: i.items.filter((x) => x.rating === 'mangel').map((x) => x.label) };
		});
		const statusText = { offen: 'in Bearbeitung', in_bearbeitung: 'in Bearbeitung', erledigt: 'behoben' } as const;
		const defects = db.data.defects.filter((d) => d.customerId === c.id && (d.reportedOn.startsWith(month) || d.status !== 'erledigt')).map((d) => ({ title: d.title, status: statusText[d.status], reportedOn: d.reportedOn }));
		const bytes = await buildMonthlyReportPdf({ company, customer: c, month, today, sites, inspections, defects });
		downloadBytes(bytes, `Leistungsbericht-${month}-${c.name.slice(0, 20).replace(/[^\wäöüÄÖÜß]+/g, '_')}.pdf`, 'application/pdf');
		db.addEvent(c.id, 'notiz', `Leistungsbericht ${month} erstellt. Es wurde nichts verschickt.`);
		toasts.push('Leistungsbericht als PDF erstellt. Versand erfolgt durch Sie.', { tone: 'success', ms: 8000 });
	}

	let editOpen = $state(false);
	let ef = $state({ name: '', status: 'interessent' as 'interessent' | 'aktiv' | 'inaktiv', street: '', postal: '', city: '', buyerRef: '', debtorNo: '' });
	let efErr = $state<Record<string, string>>({});
	function openEdit() { ef = { name: customer!.name, status: customer!.status, street: customer!.street, postal: customer!.postal, city: customer!.city, buyerRef: customer!.buyerRef ?? '', debtorNo: customer!.debtorNo ?? '' }; efErr = {}; editOpen = true; }
	function saveEdit(e: SubmitEvent) {
		e.preventDefault();
		const err: Record<string, string> = {};
		if (ef.name.trim().length < 2) err.name = 'Bitte einen Namen eingeben.';
		if (ef.postal && !/^\d{5}$/.test(ef.postal)) err.postal = 'Die Postleitzahl hat 5 Ziffern.';
		efErr = err;
		if (Object.keys(err).length) return;
		Object.assign(customer!, { name: ef.name.trim(), status: ef.status, street: ef.street, postal: ef.postal, city: ef.city, buyerRef: ef.buyerRef.trim(), debtorNo: ef.debtorNo.trim() });
		editOpen = false;
		toasts.push('Kundendaten gespeichert.', { tone: 'success' });
	}

	let cOpen = $state(false);
	let cf = $state({ name: '', role: '', email: '', phone: '' });
	function saveContact(e: SubmitEvent) {
		e.preventDefault();
		if (cf.name.trim().length < 2) return;
		customer!.contacts.push({ id: 'c' + Date.now().toString(36), ...cf, name: cf.name.trim() });
		cOpen = false;
		toasts.push('Ansprechperson hinzugefügt.', { tone: 'success' });
	}

	let sOpen = $state(false);
	let sId = $state<string | null>(null);
	let sf = $state({ name: '', street: '', postal: '', city: '', note: '', chemicals: '', planOn: false, days: [] as number[], start: '08:00', hours: 2, staffIds: [] as string[], areaM2: '' as number | '' });
	let sErr = $state('');
	function openSite(id: string | null) {
		sId = id;
		const s = customer!.sites.find((x) => x.id === id);
		const p = s?.plan;
		sf = { name: s?.name ?? '', street: s?.street ?? customer!.street, postal: s?.postal ?? customer!.postal, city: s?.city ?? customer!.city, note: s?.note ?? '', chemicals: s?.chemicals ?? '', planOn: !!p, days: p ? [...p.days] : [0, 1, 2, 3, 4], start: p?.start ?? '08:00', hours: p?.hours ?? 2, staffIds: p ? [...p.staffIds] : [], areaM2: p?.areaM2 ?? '' };
		sErr = '';
		sOpen = true;
	}
	function saveSite(e: SubmitEvent) {
		e.preventDefault();
		if (sf.name.trim().length < 2) return (sErr = 'Bitte dem Objekt einen Namen geben.');
		if (sf.planOn && (!sf.days.length || !(sf.hours > 0) || !sf.staffIds.length)) return (sErr = 'Für den Reinigungsplan: Wochentage, Stunden und mindestens eine Person wählen.');
		const plan = sf.planOn ? { days: [...sf.days].sort(), start: sf.start, hours: Number(sf.hours), staffIds: [...sf.staffIds], areaM2: sf.areaM2 === '' ? null : Number(sf.areaM2) } : null;
		const data = { name: sf.name.trim(), street: sf.street, postal: sf.postal, city: sf.city, note: sf.note, chemicals: sf.chemicals.trim(), plan };
		if (sId) Object.assign(customer!.sites.find((x) => x.id === sId)!, data);
		else customer!.sites.push({ id: customer!.id + '-s' + Date.now().toString(36), ...data });
		sOpen = false;
		toasts.push(sf.planOn ? 'Objekt gespeichert. Es erscheint jetzt im Einsatzplan.' : 'Objekt gespeichert.', { tone: 'success' });
	}
	function toggle<T>(arr: T[], v: T) { const i = arr.indexOf(v); i >= 0 ? arr.splice(i, 1) : arr.push(v); }

	let tOpen = $state(false);
	let tf = $state({ kind: 'besichtigung' as 'besichtigung' | 'start', date: addDays(today, 1), time: '10:00', who: db.me, siteId: '' });
	function openTermin() { tf = { kind: 'besichtigung', date: addDays(today, 1), time: '10:00', who: db.me, siteId: customer!.sites[0]?.id ?? '' }; tOpen = true; }
	function saveTermin(e: SubmitEvent) {
		e.preventDefault();
		const at = new Date(`${tf.date}T${tf.time}:00`).toISOString();
		const site = customer!.sites.find((s) => s.id === tf.siteId);
		db.data.appointments.push({ id: 'a' + Date.now().toString(36), at, kind: tf.kind, customerId: customer!.id, title: `${tf.kind === 'besichtigung' ? 'Besichtigung' : 'Start'} ${site?.name ?? customer!.name}`.slice(0, 60), who: tf.who });
		db.addEvent(customer!.id, 'besichtigung', `${tf.kind === 'besichtigung' ? 'Besichtigung' : 'Starttermin'} am ${formatDate(tf.date)} um ${tf.time} Uhr geplant (${tf.who}).`);
		tOpen = false;
		toasts.push('Termin angelegt. Er steht auf „Heute“ unter Termine.', { tone: 'success' });
	}

	// ── Abnahme-Link für den Kunden ──
	let acOpen = $state(false);
	let acSite = $state<SiteT | null>(null);
	function openAccept(site: SiteT) { if (!site.acceptToken) site.acceptToken = newToken(); acSite = site; acOpen = true; }
	function renewAccept() { if (acSite && confirm('Neuen Link erzeugen? Der bisherige Link funktioniert danach nicht mehr.')) acSite.acceptToken = newToken(); }
	const acUrl = $derived(acSite?.acceptToken ? `${location.origin}/abnahme/${acSite.id}?t=${acSite.acceptToken}` : '');
	const acSvg = $derived(acUrl ? renderSVG(acUrl, { border: 1 }) : '');
	async function copyAccept() { try { await navigator.clipboard.writeText(acUrl); toasts.push('Link kopiert.', { tone: 'success' }); } catch { toasts.push('Kopieren nicht möglich, bitte markieren und kopieren.'); } }
	let lvOpen = $state(false);
	let lvSite = $state<SiteT | null>(null);
	let qrSite = $state<{ id: string; name: string } | null>(null);
	let qrOpen = $state(false);
	/** melden = Aushang für Kunden (Mängelmeldung), stempel = Aushang für das Team (Ein-/Ausstempeln) */
	let qrKind = $state<'melden' | 'stempel'>('melden');
	const newToken = () => { const b = new Uint8Array(16); crypto.getRandomValues(b); return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
	function openQr(siteId: string, kind: 'melden' | 'stempel') {
		const s = customer!.sites.find((x) => x.id === siteId)!;
		if (kind === 'stempel' && !s.stampToken) s.stampToken = newToken();
		qrSite = { id: s.id, name: s.name }; qrKind = kind; qrOpen = true;
	}
	function rotateToken() {
		const s = customer?.sites.find((x) => x.id === qrSite?.id);
		if (!s) return;
		s.stampToken = newToken();
		toasts.push('Neuer Stempel-Code erzeugt. Alte Aushänge sind ungültig, bitte neu ausdrucken.', { tone: 'success', ms: 8000 });
	}
	const qrUrl = $derived(qrSite && customer ? (qrKind === 'stempel' ? `${location.origin}/mitarbeiter?s=${qrSite.id}&t=${customer.sites.find((x) => x.id === qrSite!.id)?.stampToken ?? ''}` : `${location.origin}/portal/${customer.id}?objekt=${qrSite.id}`) : '');
	const qrSvg = $derived(qrUrl ? renderSVG(qrUrl, { border: 1 }) : '');

	let tab = $state<'uebersicht' | 'angebote' | 'verlauf'>('uebersicht');
	let note = $state('');

	function addNote(e: SubmitEvent) {
		e.preventDefault();
		if (!note.trim()) return;
		db.addEvent(customer!.id, 'notiz', note.trim());
		note = '';
		toasts.push('Notiz gespeichert.', { tone: 'success' });
	}
	function removeNote(id: string) {
		const removed = db.removeNote(id);
		if (removed) toasts.push('Notiz gelöscht.', { action: { label: 'Rückgängig', run: () => db.data.events.push(removed) } });
	}
	function newQuote() {
		const q = db.createQuote(customer!.id);
		toasts.push(`Angebot ${q.number} als Entwurf angelegt.`, { tone: 'success' });
		goto(`/angebote/${q.id}`);
	}

	const eventIcon = { notiz: MessageSquare, anfrage: Inbox, besichtigung: Eye, angebot: FileText, auftrag: ClipboardCheck, rechnung: Receipt };
	const tabs = [
		['uebersicht', 'Übersicht'],
		['angebote', 'Angebote'],
		['verlauf', 'Verlauf']
	] as const;

	function onTabKey(e: KeyboardEvent) {
		const i = tabs.findIndex((t) => t[0] === tab);
		const n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
		if (n === null) return;
		tab = tabs[(n + tabs.length) % tabs.length][0];
		(document.getElementById('tab-' + tab) as HTMLElement)?.focus();
	}
</script>

<svelte:head><title>{customer?.name ?? 'Kunde'} · Objektia</title></svelte:head>

{#if !customer}
	<div class="card"><EmptyState icon={Inbox} title="Kunde nicht gefunden" text="Dieser Kunde existiert nicht (mehr). Eventuell wurde der Link verändert oder die Demo-Daten wurden zurückgesetzt.">
		<a href="/kunden" class="btn">Zur Kundenliste</a>
	</EmptyState></div>
{:else}
	<nav class="mb-3 flex items-center gap-1 text-xs text-muted" aria-label="Brotkrumen">
		<a href="/kunden" class="hover:text-fg">Kunden</a><ChevronRight size={12} /><span class="max-w-[50ch] truncate text-fg">{customer.name}</span>
	</nav>

	<div class="card mb-5 p-5">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div class="flex min-w-0 items-start gap-4">
				<Avatar name={customer.name} size={52} />
				<div class="min-w-0">
					<div class="flex flex-wrap items-center gap-2.5">
						<h1 class="max-w-[60ch] text-xl leading-snug font-semibold tracking-tight">{customer.name}</h1>
						<Badge tone={customerStatus[customer.status].tone} label={customerStatus[customer.status].label} />
					</div>
					<p class="mt-1 flex items-center gap-1.5 text-sm text-muted"><MapPin size={13} /> {customer.street}, {customer.postal} {customer.city}</p>
				</div>
			</div>
			<div class="flex flex-wrap gap-2"><button class="btn" onclick={openEdit}><Pencil size={14} /> Bearbeiten</button><button class="btn" onclick={openTermin}><CalendarPlus size={14} /> Termin</button><button class="btn" onclick={monthlyReport}><FileDown size={14} /> Monatsbericht</button><button class="btn btn-primary" onclick={newQuote}><FilePlus2 size={15} /> Neues Angebot</button></div>
		</div>
		<dl class="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
			{#each [['Monatlich wiederkehrend', formatEur(db.monthlyRecurring(customer.id)), ''], ['Offene Rechnungen', formatEur(openInvoices.reduce((s, i) => s + i.netCents, 0)), openInvoices.some((i) => db.isOverdue(i)) ? 'text-danger' : ''], ['Objekte', String(customer.sites.length), ''], ['Zuletzt aktiv', relativeTime(db.lastActivity(customer.id)), '']] as [k, v, c]}
				<div class="bg-surface px-4 py-3"><dt class="text-xs text-muted">{k}</dt><dd class="num mt-0.5 text-base font-semibold {c}">{v}</dd></div>
			{/each}
		</dl>
	</div>

	<div class="mb-5 flex gap-1 border-b border-line" role="tablist" aria-label="Kundenbereiche" tabindex="-1" onkeydown={onTabKey}>
		{#each tabs as [id, label]}
			<button
				role="tab"
				id="tab-{id}"
				aria-selected={tab === id}
				aria-controls="panel-{id}"
				tabindex={tab === id ? 0 : -1}
				class="tab"
				onclick={() => (tab = id)}
			>
				{label}
				{#if id === 'angebote'}<span class="num ml-1 text-xs text-faint">{quotes.length}</span>{/if}
			</button>
		{/each}
	</div>

	{#if tab === 'uebersicht'}
		<div id="panel-uebersicht" role="tabpanel" tabindex="0" aria-labelledby="tab-uebersicht" class="grid gap-4 lg:grid-cols-3">
			<div class="flex flex-col gap-4 lg:col-span-2">
				<section class="card">
					<div class="flex items-center justify-between border-b border-line px-4 py-3"><h2 class="card-title">Ansprechpersonen</h2><button class="btn btn-sm" onclick={() => { cf = { name: '', role: '', email: '', phone: '' }; cOpen = true; }}><UserPlus size={13} /> Person</button></div>
					{#if customer.contacts.length === 0}
						<EmptyState icon={Inbox} title="Noch keine Ansprechperson" text="Für diesen Kunden wurde noch niemand hinterlegt." />
					{:else}
						<ul class="divide-y divide-line">
							{#each customer.contacts as c (c.id)}
								<li class="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3">
									<div class="min-w-[160px] flex-1">
										<p class="text-sm font-medium">{c.name}</p>
										<p class="text-xs text-muted">{c.role || 'Ansprechperson'}</p>
									</div>
									{#if c.email}<a href="mailto:{c.email}" class="flex items-center gap-1.5 text-sm hover:text-accent"><Mail size={13} class="text-muted" />{c.email}</a>{/if}
									{#if c.phone}<a href="tel:{c.phone.replace(/\s/g, '')}" class="num flex items-center gap-1.5 text-sm hover:text-accent"><Phone size={13} class="text-muted" />{c.phone}</a>{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</section>

				<section class="card">
					<div class="flex items-center justify-between border-b border-line px-4 py-3"><h2 class="card-title">Objekte <span class="num font-normal text-faint">{customer.sites.length}</span></h2><button class="btn btn-sm" onclick={() => openSite(null)}><Plus size={13} /> Objekt</button></div>
					{#if customer.sites.length === 0}
						<EmptyState icon={MapPin} title="Noch kein Objekt" text="Objekte sind die Gebäude oder Flächen, die gereinigt werden." />
					{:else}
						<ul class="divide-y divide-line">
							{#each customer.sites as s (s.id)}
								<li class="px-4 py-3">
									<div class="flex items-start justify-between gap-3">
										<div><p class="text-sm font-medium">{s.name}</p><p class="text-xs text-muted">{s.street}, {s.postal} {s.city}</p></div>
										<div class="flex flex-wrap gap-1"><button class="btn btn-sm" onclick={() => openAccept(s)} title="Link, mit dem Ihr Kunde Leistungen online abnimmt"><UserCheck size={13} /> Abnahme-Link</button><button class="btn btn-sm" onclick={() => { lvSite = s; lvOpen = true; }} title="Leistungsverzeichnis: was wird wo und wie oft gereinigt"><ListChecks size={13} /> Leistungen{#if lvAt(s, todayKey())} <span class="num text-muted">{lvAt(s, todayKey())?.items.length}</span>{/if}</button><button class="btn btn-sm" onclick={() => openSite(s.id)}><Pencil size={13} /> Bearbeiten</button><button class="btn btn-sm" onclick={() => openQr(s.id, 'melden')} title="Aushang für Kunden: Mängel melden"><QrCode size={13} /> QR-Code</button>{#if s.plan}<button class="btn btn-sm" onclick={() => openQr(s.id, 'stempel')} title="Aushang für das Team: Ein- und Ausstempeln"><Clock size={13} /> Stempel-QR</button>{/if}</div>
									</div>
									<p class="mt-1.5 text-xs {s.plan ? 'text-muted' : 'text-warn'}">{#if s.plan}Reinigungsplan: {s.plan.days.map((d) => weekdays[d]).join(', ')} ab {s.plan.start} Uhr, {s.plan.hours.toLocaleString('de-DE')} Std. · {s.plan.staffIds.length} {s.plan.staffIds.length === 1 ? 'Person' : 'Personen'}{:else}Noch kein Reinigungsplan, das Objekt erscheint nicht im Einsatzplan.{/if}</p>
									{#if s.note}<p class="mt-1.5 rounded-md bg-subtle px-2.5 py-1.5 text-xs text-muted">{s.note}</p>{/if}
									{#if s.chemicals}<p class="mt-1.5 rounded-md bg-info-soft px-2.5 py-1.5 text-xs text-info"><strong>Mittel:</strong> {s.chemicals}</p>{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			</div>

			<div class="flex flex-col gap-4">
				{#if openInvoices.length}
					<section class="card">
						<div class="border-b border-line px-4 py-3"><h2 class="card-title">Offene Rechnungen</h2></div>
						<ul class="divide-y divide-line">
							{#each openInvoices as inv (inv.id)}
								<li class="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
									<div><p class="font-medium">{inv.number}</p><p class="text-xs text-muted">fällig {formatDate(inv.dueOn)}</p></div>
									<div class="text-right"><p class="num font-medium">{formatEur(inv.netCents)}</p>{#if db.isOverdue(inv)}<Badge tone="danger" label="{-dayDiff(inv.dueOn)} Tage überfällig" />{/if}</div>
								</li>
							{/each}
						</ul>
					</section>
				{/if}
			</div>
		</div>
	{:else if tab === 'angebote'}
		<div id="panel-angebote" role="tabpanel" tabindex="0" aria-labelledby="tab-angebote" class="card overflow-x-auto">
			{#if quotes.length === 0}
				<EmptyState icon={FileText} title="Noch kein Angebot" text="Legen Sie ein Angebot als Entwurf an. Es wird erst durch „Finalisieren“ als versendet vermerkt.">
					<button class="btn btn-primary" onclick={newQuote}><Plus size={15} /> Neues Angebot</button>
				</EmptyState>
			{:else}
				<table class="w-full min-w-[640px] border-collapse">
					<thead class="border-b border-line bg-bg/60"><tr><th class="th">Nummer</th><th class="th">Art</th><th class="th">Status</th><th class="th text-right">Preis (netto)</th><th class="th text-right">Aktualisiert</th></tr></thead>
					<tbody class="divide-y divide-line">
						{#each quotes as q (q.id)}
							<tr class="cursor-pointer hover:bg-subtle/60" onclick={() => goto(`/angebote/${q.id}`)}>
								<td class="td"><a class="font-medium hover:text-accent" href="/angebote/{q.id}" onclick={(e) => e.stopPropagation()}>{q.number}{q.version > 1 ? ` · v${q.version}` : ''}</a></td>
								<td class="td text-muted">{quoteKind[q.kind]}</td>
								<td class="td"><Badge tone={quoteStatus[q.status].tone} label={quoteStatus[q.status].label} /></td>
								<td class="td num text-right">{q.kind === 'unterhaltsreinigung' ? (q.monthlyCents ? formatEur(q.monthlyCents) + ' / Monat' : '–') : q.hourlyCents ? formatEur(q.hourlyCents) + ' / Std.' : '–'}</td>
								<td class="td text-right text-xs text-muted">{relativeTime(q.updatedAt)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	{:else}
		<div id="panel-verlauf" role="tabpanel" tabindex="0" aria-labelledby="tab-verlauf" class="max-w-2xl">
			<form class="card mb-4 p-3" onsubmit={addNote}>
				<label class="label" for="note">Notiz hinzufügen</label>
				<textarea id="note" class="input" rows="2" placeholder="Gesprächsnotiz, Absprache, Hinweis …" bind:value={note}
					onkeydown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') e.currentTarget.form?.requestSubmit(); }}></textarea>
				<div class="mt-2 flex items-center justify-between">
					<span class="text-xs text-faint"><span class="kbd">⌘</span> <span class="kbd">↵</span> zum Speichern</span>
					<button class="btn btn-primary btn-sm" disabled={!note.trim()}>Speichern</button>
				</div>
			</form>
			<ol class="relative flex flex-col gap-4 border-l border-line pl-6">
				{#each events as e (e.id)}
					{@const Icon = eventIcon[e.kind]}
					<li class="group relative">
						<span class="absolute -left-[37px] grid size-6 place-items-center rounded-full border border-line bg-surface text-muted"><Icon size={12} /></span>
						<p class="text-sm">{e.text}</p>
						<p class="mt-0.5 flex items-center gap-2 text-xs text-muted">
							{e.by} · {formatDateTime(e.at)}
							{#if e.kind === 'notiz'}
								<button class="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-danger" aria-label="Notiz löschen" onclick={() => removeNote(e.id)}><Trash2 size={12} /></button>
							{/if}
						</p>
					</li>
				{/each}
			</ol>
		</div>
	{/if}
{/if}

<LvEditor bind:open={lvOpen} site={lvSite} />

<Dialog bind:open={acOpen} title="Abnahme-Link{acSite ? ' · ' + acSite.name : ''}" description="Ihr Kunde sieht damit die gemeldeten Einsätze dieses Objekts und kann sie abnehmen oder beanstanden, ohne Anmeldung." width={520}>
	{#snippet children()}
		{#if acSite}
			<div class="grid gap-3">
				<div><label class="label" for="ac-u">Link</label><input id="ac-u" class="input num" readonly value={acUrl} onfocus={(e) => e.currentTarget.select()} /></div>
				<div class="mx-auto w-40 rounded-lg bg-white p-2">{@html acSvg}</div>
				<p class="text-xs text-muted">Der Link enthält einen geheimen Schlüssel. Wer ihn hat, kann dieses Objekt abnehmen. Schicken Sie ihn nur an Ihre Ansprechperson (per E-Mail oder als QR-Code auf dem Leistungsnachweis). Mit „Neuer Link“ wird der alte ungültig. Der Kunde sieht nur Tage, an denen Sie die Ausführung festgehalten haben, und keine Namen Ihrer Mitarbeitenden.</p>
			</div>
		{/if}
	{/snippet}
	{#snippet footer()}<button class="btn" onclick={renewAccept}>Neuer Link</button><button class="btn" onclick={copyAccept}>Link kopieren</button><button class="btn btn-primary" onclick={() => (acOpen = false)}>Fertig</button>{/snippet}
</Dialog>

<Dialog bind:open={editOpen} title="Kunde bearbeiten" width={520}>
	{#snippet children()}
		<form id="edit-cust" class="grid grid-cols-6 gap-3" onsubmit={saveEdit} novalidate>
			<div class="col-span-4"><label class="label" for="e-n">Name</label><input id="e-n" class="input" aria-invalid={!!efErr.name} bind:value={ef.name} />{#if efErr.name}<p class="mt-1 text-xs text-danger">{efErr.name}</p>{/if}</div>
			<div class="col-span-2"><label class="label" for="e-s">Status</label><select id="e-s" class="input" bind:value={ef.status}><option value="interessent">Interessent</option><option value="aktiv">Aktiv</option><option value="inaktiv">Inaktiv</option></select></div>
			<div class="col-span-6"><label class="label" for="e-st">Straße und Hausnummer</label><input id="e-st" class="input" bind:value={ef.street} /></div>
			<div class="col-span-2"><label class="label" for="e-p">PLZ</label><input id="e-p" class="input num" maxlength="5" aria-invalid={!!efErr.postal} bind:value={ef.postal} />{#if efErr.postal}<p class="mt-1 text-xs text-danger">{efErr.postal}</p>{/if}</div>
			<div class="col-span-4"><label class="label" for="e-c">Ort</label><input id="e-c" class="input" bind:value={ef.city} /></div>
			<div class="col-span-3"><label class="label" for="e-lw">Leitweg-ID / Käuferreferenz</label><input id="e-lw" class="input" placeholder="nur öffentliche Hand" bind:value={ef.buyerRef} /></div>
			<div class="col-span-3"><label class="label" for="e-db">Debitorenkonto</label><input id="e-db" class="input num" inputmode="numeric" placeholder="automatisch" bind:value={ef.debtorNo} /></div>
		</form>
	{/snippet}
	{#snippet footer()}<button class="btn" type="button" onclick={() => (editOpen = false)}>Abbrechen</button><button class="btn btn-primary" type="submit" form="edit-cust">Speichern</button>{/snippet}
</Dialog>

<Dialog bind:open={cOpen} title="Ansprechperson hinzufügen">
	{#snippet children()}
		<form id="contact-form" class="grid grid-cols-2 gap-3" onsubmit={saveContact}>
			<div><label class="label" for="c-n">Name</label><input id="c-n" class="input" bind:value={cf.name} /></div>
			<div><label class="label" for="c-r">Funktion</label><input id="c-r" class="input" placeholder="z. B. Hausmeister" bind:value={cf.role} /></div>
			<div><label class="label" for="c-e">E-Mail</label><input id="c-e" type="email" class="input" bind:value={cf.email} /></div>
			<div><label class="label" for="c-p">Telefon</label><input id="c-p" type="tel" class="input" bind:value={cf.phone} /></div>
		</form>
	{/snippet}
	{#snippet footer()}<button class="btn" type="button" onclick={() => (cOpen = false)}>Abbrechen</button><button class="btn btn-primary" type="submit" form="contact-form">Hinzufügen</button>{/snippet}
</Dialog>

<Dialog bind:open={sOpen} title={sId ? 'Objekt bearbeiten' : 'Neues Objekt'} description="Ein Objekt ist das Gebäude oder die Fläche, die gereinigt wird. Mit Reinigungsplan erscheint es im Einsatzplan." width={600}>
	{#snippet children()}
		<form id="site-form" class="grid grid-cols-6 gap-3" onsubmit={saveSite} novalidate>
			<div class="col-span-6"><label class="label" for="s-n">Bezeichnung</label><input id="s-n" class="input" placeholder="z. B. Praxisräume 2. OG" bind:value={sf.name} /></div>
			<div class="col-span-6"><label class="label" for="s-st">Straße und Hausnummer</label><input id="s-st" class="input" bind:value={sf.street} /></div>
			<div class="col-span-2"><label class="label" for="s-p">PLZ</label><input id="s-p" class="input num" maxlength="5" bind:value={sf.postal} /></div>
			<div class="col-span-4"><label class="label" for="s-c">Ort</label><input id="s-c" class="input" bind:value={sf.city} /></div>
			<div class="col-span-6"><label class="label" for="s-no">Hinweise (Zugang, Besonderheiten)</label><input id="s-no" class="input" placeholder="z. B. Schlüssel beim Hausmeister. Keine Alarmcodes eintragen." bind:value={sf.note} /></div>
			<div class="col-span-6"><label class="label" for="s-ch">Reinigungsmittel und Verfahren (Objektdossier)</label><input id="s-ch" class="input" placeholder="z. B. Sanitär: Säurereiniger, Böden: neutral, kein Wachs" bind:value={sf.chemicals} /></div>
			<label class="col-span-6 flex cursor-pointer items-center gap-2 border-t border-line pt-3 text-sm font-semibold"><input type="checkbox" class="size-4 accent-[var(--accent)]" bind:checked={sf.planOn} /> Regelmäßige Reinigung mit Reinigungsplan</label>
			{#if sf.planOn}
				<div class="col-span-6"><span class="label">Wochentage</span>
					<div class="flex flex-wrap gap-1.5">{#each weekdays as d, i}<button type="button" class="btn btn-sm {sf.days.includes(i) ? 'border-accent bg-accent text-white' : ''}" aria-pressed={sf.days.includes(i)} onclick={() => toggle(sf.days, i)}>{d}</button>{/each}</div></div>
				<div class="col-span-2"><label class="label" for="s-b">Beginn</label><input id="s-b" type="time" class="input num" bind:value={sf.start} /></div>
				<div class="col-span-2"><label class="label" for="s-h">Stunden je Einsatz</label><input id="s-h" type="number" min="0.5" step="0.5" class="input num" bind:value={sf.hours} /></div>
				<div class="col-span-2"><label class="label" for="s-a">Fläche in m²</label><input id="s-a" type="number" min="0" class="input num" bind:value={sf.areaM2} /></div>
				<div class="col-span-6"><span class="label">Stammbesetzung</span>
					<div class="grid gap-1.5 sm:grid-cols-2">{#each db.data.employees as e (e.id)}<label class="flex cursor-pointer items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm hover:bg-subtle"><input type="checkbox" class="size-4 accent-[var(--accent)]" checked={sf.staffIds.includes(e.id)} onchange={() => toggle(sf.staffIds, e.id)} /> {e.name}<span class="ml-auto text-xs text-muted">{e.role}</span></label>{/each}</div></div>
			{/if}
			{#if sErr}<p class="col-span-6 text-xs text-danger">{sErr}</p>{/if}
		</form>
	{/snippet}
	{#snippet footer()}<button class="btn" type="button" onclick={() => (sOpen = false)}>Abbrechen</button><button class="btn btn-primary" type="submit" form="site-form">Speichern</button>{/snippet}
</Dialog>

<Dialog bind:open={tOpen} title="Termin anlegen" description="Besichtigung oder Starttermin. Er erscheint auf „Heute“ unter Termine.">
	{#snippet children()}
		<form id="termin-form" class="grid grid-cols-2 gap-3" onsubmit={saveTermin}>
			<div><label class="label" for="t-k">Art</label><select id="t-k" class="input" bind:value={tf.kind}><option value="besichtigung">Besichtigung</option><option value="start">Starttermin</option></select></div>
			<div><label class="label" for="t-w">Wer</label><select id="t-w" class="input" bind:value={tf.who}><option>{db.me}</option><option>Herr R.</option>{#each db.data.employees as e}<option>{e.name}</option>{/each}</select></div>
			<div><label class="label" for="t-d">Datum</label><input id="t-d" type="date" class="input" min={today} bind:value={tf.date} /></div>
			<div><label class="label" for="t-t">Uhrzeit</label><input id="t-t" type="time" class="input num" bind:value={tf.time} /></div>
			{#if customer && customer.sites.length}<div class="col-span-2"><label class="label" for="t-s">Objekt</label><select id="t-s" class="input" bind:value={tf.siteId}>{#each customer.sites as s}<option value={s.id}>{s.name}</option>{/each}</select></div>{/if}
		</form>
	{/snippet}
	{#snippet footer()}<button class="btn" type="button" onclick={() => (tOpen = false)}>Abbrechen</button><button class="btn btn-primary" type="submit" form="termin-form">Anlegen</button>{/snippet}
</Dialog>

{#snippet poster()}
	<div style="width:210mm;height:296mm;box-sizing:border-box;overflow:hidden;padding:16mm 18mm;display:flex;flex-direction:column;align-items:center;text-align:center;background:#fff;color:#1a1c1f;font-family:'Inter Variable',Inter,Arial,sans-serif;">
		<div style="width:100%;display:flex;justify-content:space-between;align-items:baseline;border-bottom:1.2mm solid var(--accent);padding-bottom:4mm;">
			<span style="font-size:6.5mm;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);">{company.name}</span>
			<span style="font-size:3.6mm;color:#62666d;">{customer?.name}</span>
		</div>
		<h1 style="margin:16mm 0 4mm;font-size:17mm;line-height:1.05;font-weight:800;letter-spacing:-.01em;">{#if qrKind === 'stempel'}Hier<br />einstempeln{:else}Etwas nicht<br />in Ordnung?{/if}</h1>
		<p style="margin:0 0 11mm;font-size:6mm;color:#3d4147;">{qrKind === 'stempel' ? 'Beim Kommen und Gehen scannen.' : 'Sagen Sie es uns, wir kümmern uns darum.'}</p>
		<div style="width:104mm;height:104mm;padding:5mm;border:1.2mm solid #1a1c1f;border-radius:6mm;background:#fff;box-sizing:content-box;"><div style="width:100%;height:100%;" class="qr-svg">{@html qrSvg}</div></div>
		<div style="margin-top:11mm;display:grid;grid-template-columns:repeat(3,1fr);gap:7mm;width:100%;">
			{#each (qrKind === 'stempel' ? [['1', 'Handy-Kamera öffnen'], ['2', 'QR-Code scannen'], ['3', 'Ein- oder Ausstempeln']] : [['1', 'Handy-Kamera öffnen'], ['2', 'QR-Code scannen'], ['3', 'Problem kurz beschreiben']]) as [n, t]}
				<div><div style="width:12mm;height:12mm;margin:0 auto 3mm;border-radius:50%;background:var(--accent);color:#fff;font-size:6.5mm;font-weight:800;display:grid;place-items:center;">{n}</div><div style="font-size:4.4mm;font-weight:600;">{t}</div></div>
			{/each}
		</div>
		<div style="margin-top:auto;width:100%;border-top:.4mm solid #d3d3cf;padding-top:5mm;font-size:3.8mm;color:#3d4147;">
			<div style="font-size:5mm;font-weight:700;color:#1a1c1f;">{qrSite?.name}</div>
			<div>{qrKind === 'stempel' ? 'Nur für Mitarbeitende dieses Objekts. Bitte nicht fotografieren oder weitergeben.' : `Keine Anmeldung nötig. Ihre Meldung geht direkt an ${company.name}.`}</div>
			<div style="margin-top:2mm;color:#62666d;">{company.phone} · {company.email}</div>
		</div>
	</div>
{/snippet}

<style>
	:global(.qr-svg svg) { width: 100%; height: 100%; display: block; }
</style>

<Dialog bind:open={qrOpen} title={qrKind === 'stempel' ? 'Stempel-QR für das Team' : 'QR-Code für Mängelmeldung'} description={qrKind === 'stempel' ? 'Aushang zum Ausdrucken (DIN A4 hochkant): Mitarbeitende scannen ihn beim Kommen und Gehen und stempeln in der App ein oder aus.' : 'Aushang zum Ausdrucken (DIN A4 hochkant): Kunden und Besucher melden Probleme per Handy, ganz ohne Anmeldung.'} width={500}>
	{#snippet children()}
		<div class="mx-auto overflow-hidden rounded-lg border border-line shadow-sm" style="width: calc(210mm * 0.4); height: calc(297mm * 0.4);" aria-label="Vorschau des Aushangs">
			<div style="transform: scale(0.4); transform-origin: top left; width: 210mm; height: 297mm; pointer-events: none;">{@render poster()}</div>
		</div>
		<p class="mt-3 break-all text-xs text-muted">{qrUrl}</p>
		{#if qrKind === 'stempel'}<p class="mt-1 rounded-md bg-warn-soft px-3 py-2 text-xs text-warn">Der Code enthält einen geheimen Schlüssel. Hängen Sie ihn nur im Objekt aus. Bei Verdacht auf Missbrauch erzeugen Sie einen neuen Code, die alten Aushänge werden damit ungültig.</p>{:else}<p class="mt-1 text-xs text-muted">Im Prototyp zeigt der Link auf die lokale Demo. Mit dem Backend wird daraus eine öffentliche, geschützte Meldeseite. Drucken Sie ohne Kopf- und Fußzeilen (im Druckdialog „Kopf- und Fußzeilen“ ausschalten).</p>{/if}
	{/snippet}
	{#snippet footer()}
		{#if qrKind === 'stempel'}<button class="btn" onclick={rotateToken}><RotateCcw size={14} /> Neuen Code erzeugen</button>{:else}<a class="btn" href={qrUrl.replace(location.origin, '')} target="_blank" rel="noopener"><ExternalLink size={14} /> Seite ansehen</a>{/if}
		<button class="btn btn-primary" onclick={() => window.print()}><Printer size={14} /> Drucken</button>
	{/snippet}
</Dialog>

{#if qrOpen}<div class="print-poster" use:portal>{@render poster()}</div>{/if}
