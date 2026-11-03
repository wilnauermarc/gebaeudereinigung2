<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { formatEur, formatWeekday, formatTime, formatDate, relativeDay, relativeTime, todayKey, dayDiff } from '#lib/format.ts';
	import { quoteStatus } from '#lib/labels.ts';
	import Badge from '#lib/components/Badge.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { ArrowUpRight, CalendarCheck, Check, FileText, Eye, PlayCircle, BellRing, TriangleAlert, Users, Plus, Clock, MessageSquareWarning, TrendingUp, Workflow, Sunrise, Hourglass, Gauge, PartyPopper, Wallet, Receipt, ListChecks } from '@lucide/svelte';
	import { addDays, addMonths as addMonthsKey, mondayOf } from '#lib/calc.ts';
	import Avatar from '#lib/components/Avatar.svelte';
	import { findGaps, healthScores, gauges as gaugesOf } from '#lib/cockpit.ts';
	import GaugeRing from '#lib/components/Gauge.svelte';
	import { countUp } from '#lib/countup.ts';
	import Dialog from '#lib/components/Dialog.svelte';
	import { fromMinutes, toMinutes } from '#lib/calc.ts';
	import { caseStatus } from '#lib/cases.ts';
	import AreaChart from '#lib/components/AreaChart.svelte';
	import BarChart from '#lib/components/BarChart.svelte';

	const today = todayKey();
	const quotes = $derived(db.data.quotes);
	const inWork = $derived(quotes.filter((q) => q.status === 'entwurf'));
	const waiting = $derived(quotes.filter((q) => q.status === 'versendet'));
	const overdue = $derived(db.data.invoices.filter((i) => db.isOverdue(i)));
	const overdueSum = $derived(overdue.reduce((s, i) => s + i.netCents, 0));

	const followups = $derived(
		quotes
			.filter((q) => q.status === 'versendet' && q.followupOn && dayDiff(q.followupOn) <= 7)
			.sort((a, b) => a.followupOn!.localeCompare(b.followupOn!))
	);

	const upcoming = $derived(
		db.data.appointments
			.filter((a) => a.at >= new Date(Date.now() - 3600000).toISOString())
			.sort((a, b) => a.at.localeCompare(b.at))
			.slice(0, 6)
	);
	const grouped = $derived(
		upcoming.reduce<{ day: string; items: typeof upcoming }[]>((acc, a) => {
			const day = todayKey(new Date(a.at));
			const g = acc.find((x) => x.day === day);
			g ? g.items.push(a) : acc.push({ day, items: [a] });
			return acc;
		}, [])
	);

	const recent = $derived(
		[
			...db.data.customers.map((c) => ({ type: 'Kunde' as const, id: c.id, title: c.name, href: `/kunden/${c.id}`, at: db.lastActivity(c.id), sub: c.city })),
			...quotes.map((q) => ({ type: 'Angebot' as const, id: q.id, title: `${q.number} · ${db.customer(q.customerId)?.name ?? ''}`, href: `/angebote/${q.id}`, at: q.updatedAt, sub: quoteStatus[q.status].label }))
		]
			.sort((a, b) => b.at.localeCompare(a.at))
			.slice(0, 6)
	);

	const pipeline = $derived(
		(['entwurf', 'versendet', 'angenommen', 'abgelehnt'] as const).map((s) => ({
			s,
			n: quotes.filter((q) => q.status === s).length
		}))
	);
	const pipelineTotal = $derived(Math.max(1, quotes.length));
	const barColor = { entwurf: 'bg-line-strong', versendet: 'bg-info', angenommen: 'bg-success', abgelehnt: 'bg-danger/70' };

	function markDone(id: string) {
		const q = db.quote(id)!;
		const prev = q.followupOn;
		q.followupOn = null;
		db.addEvent(q.customerId, 'notiz', `Wiedervorlage zu ${q.number} erledigt.`);
		toasts.push('Wiedervorlage erledigt.', {
			tone: 'success',
			action: { label: 'Rückgängig', run: () => (q.followupOn = prev) }
		});
	}

	// ── Betrieb: Warnungen aus Einsatzplan, Mängeln, Verträgen, Minijob ──
	const alerts = $derived.by(() => {
		const out: { href: string; text: string; tone: 'danger' | 'warn' }[] = [];
		let empty = 0;
		for (let i = 0; i < 7; i++) for (const r of db.plannedSites()) if (db.staffing(r.site.id, addDays(today, i))?.empty) empty++;
		if (empty) out.push({ href: '/einsatzplan', text: `${empty} Einsatz${empty === 1 ? '' : 'sätze'} in den nächsten 7 Tagen ohne Besetzung`, tone: 'danger' });
		const late = db.data.defects.filter((x) => x.status !== 'erledigt' && x.dueOn < today).length;
		if (late) out.push({ href: '/maengel', text: `${late} Mängel mit überschrittener Frist`, tone: 'danger' });
		const month = db.refMonth;
		for (const e of db.data.employees.filter((x) => x.contract === 'minijob')) {
			const cents = Math.round(db.data.timeEntries.filter((t) => t.employeeId === e.id && t.date.startsWith(month)).reduce((s, t) => s + db.hoursOf(t), 0) * 1500);
			if (cents >= 60300 * 0.85) out.push({ href: '/team', text: `${e.name}: Minijob-Grenze zu ${Math.round((cents / 60300) * 100)} % erreicht`, tone: 'warn' });
		}
		const missing = findGaps(db.data, today).filter((g) => g.kind === 'fehlt').length;
		if (missing) out.push({ href: '/cockpit', text: `${missing} eingeplante Einsätze der letzten 7 Tage ohne Zeitbuchung`, tone: 'warn' });
		const crit = healthScores(db.data, db.refMonth, today).filter((h) => h.score < 50);
		if (crit.length) out.push({ href: '/cockpit', text: `${crit.length} Objekt${crit.length === 1 ? '' : 'e'} mit kritischem Gesundheitsscore (${db.customer(crit[0].quote.customerId)?.name.slice(0, 28)}${crit.length > 1 ? ' u. a.' : ''})`, tone: 'danger' });
		const expDocs = db.data.docs.filter((d) => d.validUntil && dayDiff(d.validUntil) <= 30).length;
		if (expDocs) out.push({ href: '/nachweise', text: `${expDocs} Nachweis${expDocs === 1 ? '' : 'e'} abgelaufen oder in 30 Tagen fällig`, tone: 'warn' });
		const lowStock = db.data.material.filter((m) => m.kind === 'verbrauch' && m.stock < m.min).length;
		if (lowStock) out.push({ href: '/material', text: `${lowStock} Artikel unter Mindestbestand`, tone: 'warn' });
		const checks = db.data.material.filter((m) => m.nextCheckOn && dayDiff(m.nextCheckOn) < 0).length;
		if (checks) out.push({ href: '/material', text: `${checks} Geräteprüfung${checks === 1 ? '' : 'en'} überfällig (DGUV V3)`, tone: 'danger' });
		const requests = db.data.absences.filter((a) => a.status === 'beantragt').length;
		if (requests) out.push({ href: '/team', text: `${requests} Urlaubsantr${requests === 1 ? 'ag' : 'äge'} zur Freigabe`, tone: 'warn' });
		const untrained = db.data.employees.filter((e) => !e.instructedOn || dayDiff(addMonthsKey(e.instructedOn, 12)) < 0).length;
		if (untrained) out.push({ href: '/team', text: `${untrained} Mitarbeitende mit fehlender oder überfälliger Unterweisung`, tone: 'warn' });
		const lostKeys = db.data.keys.filter((k) => k.status === 'verloren').length;
		if (lostKeys) out.push({ href: '/schluessel', text: `${lostKeys} Schlüssel als verloren gemeldet`, tone: 'danger' });
		for (const q of db.data.quotes.filter((x) => x.status === 'angenommen' && x.contract)) {
			const c = q.contract!;
			let end = addMonthsKey(c.startOn, c.termMonths);
			while (c.autoRenew && end <= today) end = addMonthsKey(end, c.termMonths);
			const notice = addMonthsKey(end, -c.noticeMonths);
			if (dayDiff(notice) >= 0 && dayDiff(notice) <= 60) out.push({ href: '/vertraege', text: `Kündigungsfrist ${db.customer(q.customerId)?.name.slice(0, 32)} endet ${relativeDay(notice)}`, tone: 'warn' });
		}
		return out.sort((a, b) => Number(a.tone === 'warn') - Number(b.tone === 'warn'));
	});
	const urgent = $derived(alerts.filter((a) => a.tone === 'danger').length);

	const openTasks = $derived(db.data.tasks.filter((t) => !t.done).sort((a, b) => (a.dueOn ?? '9999').localeCompare(b.dueOn ?? '9999')).slice(0, 5));
	function completeTask(id: string) {
		const t = db.data.tasks.find((x) => x.id === id)!;
		t.done = true;
		t.doneOn = today;
		toasts.push('Aufgabe erledigt.', { tone: 'success', action: { label: 'Rückgängig', run: () => { t.done = false; t.doneOn = null; } } });
	}

	// ── Tagesziel: heute fällige oder überfällige Aufgaben, erledigte zählen mit ──
	const goalOpen = $derived(db.data.tasks.filter((t) => !t.done && t.dueOn && t.dueOn <= today).length);
	const goalDone = $derived(db.data.tasks.filter((t) => t.done && t.doneOn === today).length);
	const goalTotal = $derived(goalOpen + goalDone);
	const goalRatio = $derived(goalTotal ? goalDone / goalTotal : 1);
	let celebrate = $state(false);
	let prevOpen = -1;
	$effect(() => {
		const o = goalOpen;
		if (prevOpen > 0 && o === 0 && goalDone > 0) { celebrate = true; setTimeout(() => (celebrate = false), 2600); }
		prevOpen = o;
	});

	const gaugeData = $derived(gaugesOf(db.data, db.refMonth, today, mondayOf(today)));

	// ── Diagramme aus den vorhandenen Daten ──
	const weekBars = $derived.by(() => {
		const thisMonday = mondayOf(today);
		return Array.from({ length: 8 }, (_, i) => {
			const from = addDays(thisMonday, (i - 8) * 7); // bis zur letzten abgeschlossenen Woche
			const to = addDays(from, 6);
			const value = db.data.timeEntries.filter((t) => t.date >= from && t.date <= to).reduce((s, t) => s + db.hoursOf(t), 0);
			return { label: `KW ${isoWeek(from)}`, value, highlight: i === 7 };
		});
	});
	function isoWeek(key: string) {
		const d = new Date(key + 'T12:00:00Z');
		d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
		const y0 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
		return Math.ceil(((d.getTime() - y0.getTime()) / 86400000 + 1) / 7);
	}
	const mrr = $derived.by(() => {
		const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
		const contracts = db.data.quotes.filter((q) => q.status === 'angenommen' && q.contract && q.kind === 'unterhaltsreinigung');
		return Array.from({ length: 12 }, (_, i) => {
			const first = addMonthsKey(today.slice(0, 7) + '-01', i - 11);
			const end = addMonthsKey(first, 1);
			return { label: monthNames[Number(first.slice(5, 7)) - 1], value: contracts.filter((q) => q.contract!.startOn < end).reduce((s, q) => s + (q.monthlyCents ?? 0), 0) / 100 };
		});
	});
	const hoursThisWeek = $derived(weekBars[7].value);
	const hoursLastWeek = $derived(weekBars[6].value);
	const fmtH = (v: number) => `${v.toLocaleString('de-DE', { maximumFractionDigits: 0 })} Std.`;
	const fmtE = (v: number) => formatEur(Math.round(v * 100));

	const apptToday = $derived(db.data.appointments.filter((a) => todayKey(new Date(a.at)) === today).length);

	// ── Tagesbriefing: Text für Team-Chat oder Aushang, aus Plan, Terminen und offenen Punkten ──
	let briefOpen = $state(false);
	const briefing = $derived.by(() => {
		const lines: string[] = [`Tagesbriefing ${formatWeekday(new Date().toISOString())}`];
		const jobs = db.plannedSites().map(({ site, customer }) => ({ site, customer, st: db.staffing(site.id, today) })).filter((x) => x.st).sort((a, b) => a.site.plan!.start.localeCompare(b.site.plan!.start));
		lines.push('', jobs.length ? 'Einsätze:' : 'Heute sind keine regulären Einsätze geplant.');
		for (const { site, customer, st } of jobs) {
			const p = site.plan!;
			const who = [...st!.present, ...st!.covers.map((c) => c.emp)].map((e) => e.name.split(' ')[0]).join(', ');
			lines.push(`• ${p.start}–${fromMinutes(toMinutes(p.start) + p.hours * 60)} ${customer.name.slice(0, 40)}, ${site.name}: ${st!.empty ? 'UNBESETZT' : who}${st!.absent.length ? ` (fehlt: ${st!.absent.map((e) => e.name.split(' ')[0]).join(', ')})` : ''}`);
		}
		const ap = db.data.appointments.filter((a) => new Date(a.at).toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' }) === today);
		if (ap.length) { lines.push('', 'Termine:'); for (const a of ap) lines.push(`• ${formatTime(a.at)} ${a.title} (${a.who})`); }
		const tasks = db.data.tasks.filter((t) => !t.done && t.dueOn && t.dueOn <= today);
		if (tasks.length) { lines.push('', 'Heute fällig:'); for (const t of tasks) lines.push(`• ${t.title}`); }
		if (overdue.length) lines.push('', `Achtung: ${overdue.length} überfällige ${overdue.length === 1 ? 'Rechnung' : 'Rechnungen'}.`);
		return lines.join('\n');
	});
	async function copyBriefing() {
		try { await navigator.clipboard.writeText(briefing); toasts.push('Tagesbriefing kopiert.', { tone: 'success' }); }
		catch { toasts.push('Kopieren nicht möglich. Markieren Sie den Text im Fenster.', { tone: 'error' }); }
	}

	let showAllAlerts = $state(false);

	// ── Erste Schritte: erkennt selbst, was schon erledigt ist (angelegte Daten haben längere IDs als die Demo-Daten) ──
	let onboardingHidden = $state(true);
	$effect(() => { try { onboardingHidden = localStorage.getItem('resch-onboarding-hidden') === '1'; } catch { onboardingHidden = false; } });
	function hideOnboarding() { onboardingHidden = true; try { localStorage.setItem('resch-onboarding-hidden', '1'); } catch { /* ignorieren */ } }
	const steps = $derived([
		{ done: db.data.customers.some((c) => c.id.length > 4), title: 'Ersten Kunden anlegen', text: 'Name, Ansprechperson und Adresse genügen.', href: '/kunden?neu=1' },
		{ done: db.data.customers.some((c) => c.sites.some((s) => s.id.length > 10 && s.plan)), title: 'Objekt mit Reinigungsplan anlegen', text: 'Wochentage, Zeiten und Stammbesetzung, damit der Einsatzplan sich füllt.', href: '/kunden' },
		{ done: db.data.quotes.some((q) => q.id.length > 4 && q.status !== 'entwurf'), title: 'Angebot schreiben und vermerken', text: 'Mit Live-Marge und PDF nach DIN 5008.', href: '/angebote' },
		{ done: db.data.timeEntries.some((t) => t.id.length > 5), title: 'Eine Arbeitszeit erfassen', text: 'Zuschläge und Soll/Ist rechnet die App mit.', href: '/zeiten?neu=1' },
		{ done: db.data.invoices.some((i) => i.id.length > 3), title: 'Rechnungslauf starten', text: 'Alle Monatsrechnungen in einem Schritt.', href: '/rechnungen' }
	]);
	const stepsDone = $derived(steps.filter((s) => s.done).length);

	// ── Heute im Einsatz: alle geplanten Objekte des Tages mit Besetzung ──
	const jobs = $derived(
		db.plannedSites()
			.map(({ site, customer }) => ({ site, customer, st: db.staffing(site.id, today) }))
			.filter((x): x is { site: typeof x.site; customer: typeof x.customer; st: NonNullable<typeof x.st> } => !!x.st)
			.sort((a, b) => a.site.plan!.start.localeCompare(b.site.plan!.start))
	);
	const nowHM = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });
	const jobState = (start: string, hours: number) => { const end = fromMinutes(toMinutes(start) + hours * 60); return nowHM >= end ? 'done' : nowHM >= start ? 'live' : 'next'; };
	const todayAppts = $derived(db.data.appointments.filter((a) => todayKey(new Date(a.at)) === today).sort((a, b) => a.at.localeCompare(b.at)));
	const absentToday = $derived(db.data.employees.filter((e) => db.isAbsent(e.id, today)));
	const hour = new Date().getHours();
	const greeting = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';
</script>

<header class="hero mb-5 p-5 lg:px-7" aria-label="Tagesüberblick">
	<div class="relative z-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
		<div class="flex min-w-[260px] items-center gap-4">
			<Avatar name={db.me} size={56} square={false} person ring />
			<div>
				<p class="text-sm text-white/70">{formatWeekday(new Date().toISOString())}</p>
				<h1 class="text-[1.65rem] leading-tight font-semibold tracking-tight">{greeting}, {db.me.split(' ')[0]}</h1>
				<p class="mt-0.5 text-sm text-white/80">
					{jobs.length} {jobs.length === 1 ? 'Einsatz' : 'Einsätze'} heute{#if apptToday}, {apptToday} {apptToday === 1 ? 'Termin' : 'Termine'}{/if}.
					{#if alerts.length}<strong class="font-semibold text-white">{urgent ? `${urgent} dringend` : `${alerts.length} offen`}</strong>{:else}Alles im grünen Bereich.{/if}
				</p>
			</div>
		</div>
		<div class="flex flex-wrap gap-2">
			<button class="btn-hero" onclick={() => (briefOpen = true)}><Sunrise size={15} /> Briefing</button>
			<a href="/vorgaenge?neu=1" class="btn-hero"><Workflow size={15} /> Vorgang</a>
			<a href="/kunden?neu=1" class="btn-hero"><Users size={15} /> Kunde</a>
			<a href="/zeiten?neu=1" class="btn-hero"><Clock size={15} /> Zeit</a>
			<a href="/maengel?neu=1" class="btn-hero"><MessageSquareWarning size={15} /> Mangel</a>
		</div>
	</div>
</header>

<section class="card mb-5 overflow-hidden" aria-label="Betriebs-Cockpit">
	<div class="grid grid-cols-2 gap-1 p-2.5 md:grid-cols-5">
		<GaugeRing size={84} value={gaugeData.margin / 0.3} shown={gaugeData.margin} label="Marge" sub="Ziel 30 %" href="/cockpit" />
		<GaugeRing size={84} value={gaugeData.staffing} label="Besetzung" sub="{gaugeData.staffedCount}/{gaugeData.plannedCount} Einsätze, Woche" good={0.95} warn={0.8} href="/einsatzplan" />
		<GaugeRing size={84} value={gaugeData.payment} label="Zahlungsmoral" sub="pünktlich oder bezahlt" good={0.9} warn={0.75} href="/rechnungen" />
		<GaugeRing size={84} value={gaugeData.plan} label="Plan-Treue" sub="Ist gegen Soll" good={0.9} warn={0.75} href="/zeiten" />
		<div class="relative flex flex-col items-center justify-center rounded-xl bg-accent-soft/60 p-1 text-center">
			{#if celebrate}<div class="confetti" aria-hidden="true">{#each Array(14) as _, i}<i style="--a:{(i * 360) / 14}deg;--c:{['#d95a14', '#19734a', '#2457c5', '#e2a64b', '#b3261e'][i % 5]};--d:{(i % 4) * 60}ms"></i>{/each}</div>{/if}
			<GaugeRing size={84} value={goalRatio} label="Tagesziel" sub={goalTotal === 0 ? 'Nichts fällig' : goalOpen === 0 ? 'Geschafft!' : `${goalDone} von ${goalTotal} Aufgaben`} good={0.99} warn={0.5} href="/aufgaben" />
		</div>
	</div>
</section>

<div class="grid gap-5 lg:grid-cols-3">
	<div class="flex flex-col gap-5 lg:col-span-2">
		<section class="card" aria-labelledby="h-jobs">
			<div class="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
				<h2 id="h-jobs" class="card-title">Heute im Einsatz <span class="num font-normal text-muted">{jobs.length}</span></h2>
				<div class="flex items-center gap-3 text-xs text-muted">
					{#if absentToday.length}<span class="flex items-center gap-1.5">Abwesend: {#each absentToday as e}<Avatar name={e.name} size={20} square={false} person />{/each}</span>{/if}
					<a href="/einsatzplan" class="font-medium text-accent hover:underline">Einsatzplan →</a>
				</div>
			</div>
			{#if jobs.length === 0}
				<EmptyState icon={CalendarCheck} title="Heute keine regulären Einsätze" text="Reinigungspläne der Objekte füllen den Einsatzplan." />
			{:else}
				<ol class="divide-y divide-line">
					{#each jobs as j (j.site.id)}
						{@const p = j.site.plan!}
						{@const state = jobState(p.start, p.hours)}
						<li><a href="/einsatzplan" class="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 transition-colors hover:bg-subtle/60 {state === 'done' ? 'opacity-55' : ''}">
							<div class="w-[84px] shrink-0"><p class="num text-sm font-semibold">{p.start}</p><p class="num text-xs text-muted">bis {fromMinutes(toMinutes(p.start) + p.hours * 60)}</p></div>
							<span class="size-2.5 shrink-0 rounded-full {state === 'live' ? 'bg-success ring-4 ring-success/20' : state === 'done' ? 'bg-faint' : 'bg-line-strong'}" title={state === 'live' ? 'Läuft gerade' : state === 'done' ? 'Beendet' : 'Folgt'}></span>
							<div class="min-w-[180px] flex-1"><p class="truncate text-sm font-medium">{j.customer.name}</p><p class="truncate text-xs text-muted">{j.site.name}</p></div>
							<div class="flex items-center gap-2">
								{#if j.st.empty}<Badge tone="danger" label="Unbesetzt" />
								{:else}
									<span class="flex w-[4.2rem] shrink-0 -space-x-2">{#each [...j.st.present, ...j.st.covers.map((c) => c.emp)] as e (e.id)}<span title={e.name}><Avatar name={e.name} size={30} square={false} person ring /></span>{/each}</span>
									<span class="hidden w-[9rem] truncate text-left text-xs text-muted sm:block">{[...j.st.present, ...j.st.covers.map((c) => c.emp)].map((e) => e.name.split(' ')[0]).join(', ')}</span>
								{/if}
								{#if j.st.absent.length && !j.st.empty}<Badge tone="warn" label="{j.st.absent.length} fehlt" />{/if}
							</div>
						</a></li>
					{/each}
				</ol>
			{/if}
		</section>

		<section class="card" aria-labelledby="h-alert">
			<div class="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
				<h2 id="h-alert" class="card-title flex items-center gap-2"><TriangleAlert size={15} class="text-muted" /> Heute im Fokus</h2>
				<p class="flex gap-3 text-xs">{#if urgent}<span class="flex items-center gap-1.5 font-semibold text-danger"><span class="size-2 rounded-full bg-danger"></span>{urgent} dringend</span>{/if}<span class="flex items-center gap-1.5 text-muted"><span class="size-2 rounded-full bg-warn"></span>{alerts.length - urgent} wichtig</span></p>
			</div>
			{#if alerts.length === 0}
				<EmptyState icon={Check} title="Alles im grünen Bereich" text="Es gibt nichts, was Ihre Aufmerksamkeit braucht." />
			{:else}
				<ul>
					{#each (showAllAlerts ? alerts : alerts.slice(0, 5)) as a}
						<li class="border-b border-line last:border-0"><a href={a.href} class="group flex items-center gap-3.5 py-2.5 pr-5 pl-0 transition-colors hover:bg-subtle/60">
							<span class="h-8 w-1.5 shrink-0 rounded-r-full {a.tone === 'danger' ? 'bg-danger' : 'bg-warn'}"></span>
							<span class="min-w-0 flex-1 text-sm {a.tone === 'danger' ? 'font-semibold' : ''}">{a.text}</span>
							<span class="shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors {a.tone === 'danger' ? 'bg-danger-soft text-danger group-hover:bg-danger group-hover:text-white' : 'bg-warn-soft text-warn group-hover:bg-warn group-hover:text-white'}">Klären →</span>
						</a></li>
					{/each}
				</ul>
				{#if alerts.length > 5}<button class="w-full border-t border-line px-4 py-2.5 text-sm font-medium text-accent hover:bg-subtle" onclick={() => (showAllAlerts = !showAllAlerts)}>{showAllAlerts ? 'Weniger anzeigen' : `${alerts.length - 5} weitere anzeigen`}</button>{/if}
			{/if}
		</section>
	</div>

	<div class="flex flex-col gap-5">
		<section class="card" aria-labelledby="h-tasks">
			<div class="flex items-center justify-between border-b border-line px-4 py-3.5">
				<h2 id="h-tasks" class="card-title flex items-center gap-2"><ListChecks size={15} class="text-muted" /> Meine Aufgaben</h2>
				<a href="/aufgaben" class="text-xs font-medium text-accent hover:underline">Alle →</a>
			</div>
			{#if openTasks.length === 0}
				<EmptyState icon={Check} title="Keine offenen Aufgaben" text="Neue Aufgaben legen Sie unter Aufgaben an." />
			{:else}
				<ul class="divide-y divide-line">
					{#each openTasks as t (t.id)}
						<li class="flex items-center gap-3 px-4 py-2.5">
							<input type="checkbox" class="size-[18px] accent-[var(--accent)]" aria-label="{t.title} erledigt" onchange={() => completeTask(t.id)} />
							<span class="min-w-0 flex-1 truncate text-sm" title={t.title}>{t.title}</span>
							{#if t.dueOn}<span class="num text-xs {t.dueOn < today ? 'font-semibold text-danger' : 'text-muted'}">{relativeDay(t.dueOn)}</span>{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="card" aria-labelledby="h-appt">
			<div class="border-b border-line px-4 py-3.5"><h2 id="h-appt" class="card-title">Termine</h2></div>
			{#if grouped.length === 0}
				<EmptyState icon={CalendarCheck} title="Keine Termine" text="In den nächsten Tagen stehen keine Besichtigungen oder Starttermine an." />
			{:else}
				<ul class="divide-y divide-line">
					{#each upcoming.slice(0, 4) as a (a.id)}
						<li><a href="/kunden/{a.customerId}" class="flex items-center gap-3 px-4 py-2.5 hover:bg-subtle/60">
							<span class="grid size-8 shrink-0 place-items-center rounded-lg {a.kind === 'besichtigung' ? 'bg-info-soft text-info' : 'bg-success-soft text-success'}">{#if a.kind === 'besichtigung'}<Eye size={15} />{:else}<PlayCircle size={15} />{/if}</span>
							<span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{a.title}</span><span class="num text-xs text-muted">{todayKey(new Date(a.at)) === today ? 'Heute' : formatWeekday(a.at)}, {formatTime(a.at)} Uhr · {a.who}</span></span>
						</a></li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="card" aria-labelledby="h-follow">
			<div class="flex items-center justify-between border-b border-line px-4 py-3.5">
				<h2 id="h-follow" class="card-title flex items-center gap-2"><BellRing size={15} class="text-muted" /> Nachfassen</h2>
				<span class="text-xs text-muted">7 Tage</span>
			</div>
			{#if followups.length === 0}
				<EmptyState icon={CalendarCheck} title="Nichts nachzufassen" text="Versendete Angebote mit Wiedervorlage erscheinen hier." />
			{:else}
				<ul class="divide-y divide-line">
					{#each followups as q (q.id)}
						{@const late = dayDiff(q.followupOn!) < 0}
						<li class="flex items-center gap-2 px-4 py-2.5">
							<div class="min-w-0 flex-1"><a href="/angebote/{q.id}" class="block truncate text-sm font-medium hover:text-accent">{db.customer(q.customerId)?.name}</a><p class="num text-xs {late ? 'font-medium text-danger' : 'text-muted'}">{q.number} · {relativeDay(q.followupOn!)}</p></div>
							<button class="btn btn-sm" onclick={() => markDone(q.id)} aria-label="Wiedervorlage {q.number} erledigt"><Check size={13} /></button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
</div>

{#if !onboardingHidden && stepsDone < steps.length}
	<section class="card mt-5 border-accent/30 p-4" aria-labelledby="h-start">
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<div><h2 id="h-start" class="card-title">Erste Schritte <span class="num font-normal text-muted">{stepsDone}/{steps.length}</span></h2></div>
			<button class="btn btn-ghost btn-sm" onclick={hideOnboarding}>Ausblenden</button>
		</div>
		<ol class="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
			{#each steps as s, i}
				<li><a href={s.href} class="flex h-full gap-3 rounded-lg border border-line p-3 transition-colors hover:bg-accent-soft {s.done ? 'opacity-60' : ''}">
					<span class="grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold {s.done ? 'bg-success text-white' : 'bg-accent-soft text-accent'}">{#if s.done}✓{:else}{i + 1}{/if}</span>
					<span><span class="block text-sm font-semibold {s.done ? 'line-through' : ''}">{s.title}</span><span class="text-xs text-muted">{s.text}</span></span>
				</a></li>
			{/each}
		</ol>
	</section>
{/if}

<section class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Kennzahlen">
	{#snippet kpi(href: string, label: string, value: string, sub: string, Icon: any, chip: string, tone = '')}
		<a {href} class="card group flex items-center gap-3.5 p-4 transition-all hover:-translate-y-px hover:border-line-strong hover:shadow-[var(--shadow-pop)]">
			<span class="chip-icon shrink-0 {chip}"><Icon size={20} /></span>
			<span class="min-w-0"><span class="num block text-[1.45rem] leading-tight font-semibold tracking-tight {tone === 'danger' ? 'text-danger' : ''}">{value}</span><span class="block truncate text-xs font-medium">{label}</span><span class="block truncate text-xs text-muted">{sub}</span></span>
		</a>
	{/snippet}
	{@render kpi('/angebote?status=entwurf', 'Angebote in Arbeit', String(inWork.length), `${waiting.length} warten auf Antwort`, FileText, 'chip-blue')}
	{@render kpi('/vorgaenge', 'Offene Vorgänge', String(db.data.cases.filter((c) => !caseStatus(db.data, c).closed).length), 'von Anfrage bis Start', Workflow, 'chip-amber')}
	{@render kpi('/kunden?status=aktiv', 'Wiederkehrend / Monat', formatEur(db.monthlyRecurring()), 'netto, laufende Verträge', TrendingUp, 'chip-green')}
	{@render kpi('/rechnungen', 'Überfällig', formatEur(overdueSum), `${overdue.length} Rechnung${overdue.length === 1 ? '' : 'en'} · offen gesamt ${formatEur(db.data.invoices.filter((i) => !i.paidAt).reduce((a, i) => a + i.netCents, 0))}`, Receipt, 'chip-red', overdue.length ? 'danger' : '')}
</section>

<div class="mt-5 grid gap-5 lg:grid-cols-2">
	<section class="card p-4" aria-labelledby="h-mrr">
		<div class="mb-1 flex items-start justify-between">
			<div><h2 id="h-mrr" class="card-title">Wiederkehrender Umsatz</h2><p class="text-xs text-muted">Monatlich netto, aus laufenden Verträgen</p></div>
			<p class="num text-lg font-semibold">{fmtE(mrr[11].value)}</p>
		</div>
		<AreaChart points={mrr} format={fmtE} step height={170} />
	</section>
	<section class="card p-4" aria-labelledby="h-hours">
		<div class="mb-1 flex items-start justify-between">
			<div><h2 id="h-hours" class="card-title">Geleistete Stunden</h2><p class="text-xs text-muted">Letzte abgeschlossene Woche</p></div>
			<p class="num text-right text-lg font-semibold whitespace-nowrap">{fmtH(hoursThisWeek)} <span class="block text-xs font-normal {hoursThisWeek >= hoursLastWeek ? 'text-success' : 'text-warn'}">{hoursLastWeek ? `${hoursThisWeek >= hoursLastWeek ? '+' : ''}${Math.round(((hoursThisWeek - hoursLastWeek) / hoursLastWeek) * 100)} % zur Vorwoche` : ''}</span></p>
		</div>
		<BarChart bars={weekBars} format={fmtH} height={170} />
	</section>
</div>

<Dialog bind:open={briefOpen} title="Tagesbriefing" description="Fertiger Text für WhatsApp, E-Mail oder Aushang." width={560}>
	{#snippet children()}<textarea class="input font-sans text-sm leading-relaxed" style="height: min(50vh, 380px)" readonly aria-label="Tagesbriefing">{briefing}</textarea>{/snippet}
	{#snippet footer()}<button class="btn" onclick={() => (briefOpen = false)}>Schließen</button><button class="btn btn-primary" onclick={copyBriefing}>Kopieren</button>{/snippet}
</Dialog>
