<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { addDays } from '#lib/calc.ts';
	import { todayKey, formatWeekday } from '#lib/format.ts';
	import { buildBoard, type BoardShift, type Live, type PersonState, type ShiftState } from '#lib/leitstand.ts';
	import { coverRadar } from '#lib/mapTools.ts';
	import type { Instrument, NextStep } from '#lib/ux.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { ChevronLeft, ChevronRight, Check, Phone, UserPlus, CircleCheck, Siren, TriangleAlert, Info, Activity, ExternalLink, MapPin, ListChecks, Clock } from '@lucide/svelte';

	const realToday = todayKey();
	let date = $state(realToday);
	let nowMs = $state(Date.now());
	let live = $state<Live | null>(null);
	let liveAt = $state<Date | null>(null);
	let liveErr = $state(false);
	let selected = $state<string | null>(null);

	async function refresh() {
		try {
			const r = await fetch('/api/live');
			if (!r.ok) throw new Error(String(r.status));
			live = await r.json(); liveAt = new Date(); liveErr = false;
		} catch { liveErr = true; }
	}
	// Live-Stand alle 20 Sekunden holen, die „Jetzt“-Linie läuft mit
	$effect(() => {
		refresh();
		const a = setInterval(() => { nowMs = Date.now(); refresh(); }, 20000);
		const b = setInterval(() => (nowMs = Date.now()), 10000);
		return () => { clearInterval(a); clearInterval(b); };
	});

	const board = $derived(buildBoard(db.data, date, nowMs, live));
	const sel = $derived(board.shifts.find((s) => s.siteId === selected) ?? null);
	// Ansicht: ganzer Tag oder ein Fenster um „jetzt“ (heute), damit Balken groß genug bleiben
	let zoom = $state<'tag' | 'jetzt'>('tag');
	const win = $derived.by(() => {
		const full = { start: board.rangeStart, end: board.rangeEnd };
		if (zoom !== 'jetzt' || !board.isToday) return full;
		// mindestens 4 Stunden Fenster, auch kurz vor Tagesende
		const start = Math.max(full.start, Math.min(Math.floor((board.nowMin - 90) / 60) * 60, full.end - 4 * 60));
		const end = Math.min(full.end, start + 8 * 60);
		return end - start >= 4 * 60 && board.shifts.some((s) => s.endMin > start && s.startMin < end) ? { start, end } : full;
	});
	const span = $derived(win.end - win.start);
	const pct = (min: number) => Math.max(0, Math.min(100, ((min - win.start) / span) * 100));
	// bei vielen Stunden nur jede zweite beschriften
	const hours = $derived(Array.from({ length: Math.floor(span / 60) + 1 }, (_, i) => win.start + i * 60).filter((m) => m <= win.end));
	const labelEvery = $derived(span > 10 * 60 ? 2 : 1);
	const outside = (sh: BoardShift) => (sh.endMin <= win.start ? 'links' : sh.startMin >= win.end ? 'rechts' : null);
	const fmtHm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
	const nowPct = $derived(board.isToday && board.nowMin >= win.start && board.nowMin <= win.end ? pct(board.nowMin) : null);
	const dateLabel = $derived(formatWeekday(date + 'T12:00:00Z'));
	const longDate = $derived(new Date(date + 'T12:00:00Z').toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }));

	const stateLabel: Record<ShiftState, string> = { fertig: 'Fertig', laeuft: 'Läuft', spaet: 'Verspätet', geplant: 'Geplant', unbesetzt: 'Unbesetzt', fehlt: 'Keine Buchung' };
	const barCls: Record<ShiftState, string> = {
		fertig: 'border-success/50 bg-success-soft text-success',
		laeuft: 'border-accent bg-accent shadow-[0_6px_18px_-8px_rgb(240_176_0/0.9)]',
		spaet: 'border-warn bg-warn-soft text-warn animate-pulse',
		geplant: 'border-line-strong bg-surface text-fg',
		unbesetzt: 'border-danger bg-danger-soft text-danger',
		fehlt: 'border-danger/60 bg-danger-soft text-danger'
	};
	const ring: Record<PersonState, string> = { drin: 'ring-2 ring-success', fertig: 'ring-2 ring-success/50', wartet: 'ring-1 ring-line-strong', spaet: 'ring-2 ring-warn', fehlt: 'ring-2 ring-danger' };
	const personText = (p: BoardShift['people'][number], sh: BoardShift) =>
		p.state === 'drin' ? `eingestempelt seit ${p.since} Uhr` : p.state === 'fertig' ? `fertig${p.since ? ` (ab ${p.since} Uhr)` : ''}` : p.state === 'spaet' ? `noch nicht eingestempelt, seit ${Math.max(0, board.nowMin - sh.startMin)} Min` : p.state === 'fehlt' ? 'keine Zeit gebucht' : `wartet auf den Beginn (${sh.start} Uhr)`;

	const instruments = $derived<Instrument[]>([
		{ kind: 'stat', label: 'Einsätze', value: String(board.counts.total), sub: longDate },
		{ kind: 'stat', label: board.isToday ? 'Laufen jetzt' : 'Fertig', value: String(board.isToday ? board.counts.running : board.counts.done), sub: board.isToday ? `${board.counts.done} schon fertig` : 'mit Zeitbuchung', tone: 'success' },
		{ kind: 'stat', label: board.isToday ? 'Ohne Stempelung' : 'Ohne Buchung', value: String(board.isToday ? board.counts.late : board.shifts.filter((s) => s.state === 'fehlt').length), sub: board.isToday ? 'zu spät oder Einsatz vorbei' : 'Einsätze ohne Zeitbuchung', tone: (board.isToday ? board.counts.late : board.shifts.some((s) => s.state === 'fehlt')) ? 'warn' : '' },
		{ kind: 'stat', label: 'Unbesetzt', value: String(board.counts.empty), sub: board.counts.absent ? `${board.counts.absent} Ausfälle im Plan` : 'keine Ausfälle', tone: board.counts.empty ? 'danger' : '' }
	]);
	const top = $derived(board.alerts[0]);
	const next = $derived<NextStep | null>(!board.isToday ? null : top ? { tone: top.level === 'rot' ? 'danger' : 'warn', text: top.text, cta: top.siteId ? { label: 'Ansehen', onclick: () => (selected = top.siteId!) } : undefined } : { tone: 'ok', text: board.counts.total ? 'Alles im grünen Bereich: Niemand fehlt, nichts verspätet.' : 'Heute sind keine Einsätze geplant.' });

	// ── Vertretung ──
	const radar = $derived(sel && (sel.empty || sel.under || sel.absent.length || sel.people.some((p) => p.state === 'spaet')) ? coverRadar(db.data, sel.siteId, date).filter((r) => r.allowed).slice(0, 5) : []);
	function assign(employeeId: string) {
		if (!sel) return;
		const c = { id: 'c' + Date.now().toString(36), siteId: sel.siteId, date, employeeId };
		db.data.covers.push(c);
		toasts.push(`${db.employee(employeeId)?.name} übernimmt ${sel.siteName}.`, { tone: 'success', action: { label: 'Rückgängig', run: () => { const i = db.data.covers.findIndex((x) => x.id === c.id); if (i >= 0) db.data.covers.splice(i, 1); } } });
	}
	const tel = (p: string) => p.replace(/\s/g, '');
</script>

<svelte:head><title>Leitstand · Objektia</title></svelte:head>

<PageHead title="Leitstand" subtitle="Der Tag auf einer Zeitleiste: wo es läuft, wo es hakt und was das Büro jetzt tun muss." {instruments} next={next}>
	{#snippet actions()}
		<span class="mr-1 hidden items-center gap-2 text-xs text-muted sm:inline-flex" role="status" aria-live="polite">
			{#if board.isToday}
				{#if liveErr}<span class="size-2 rounded-full bg-danger"></span> Live-Stand nicht erreichbar{:else}<span class="relative flex size-2"><span class="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60"></span><span class="relative inline-flex size-2 rounded-full bg-success"></span></span> Live{#if liveAt} · {liveAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Berlin' })}{/if}{/if}
			{/if}
		</span>
		<div class="flex items-center gap-1">
			<button class="btn btn-icon" aria-label="Vorheriger Tag" onclick={() => { date = addDays(date, -1); selected = null; }}><ChevronLeft size={15} /></button>
			<input type="date" class="input w-40" aria-label="Datum" bind:value={date} onchange={() => (selected = null)} />
			<button class="btn btn-icon" aria-label="Nächster Tag" onclick={() => { date = addDays(date, 1); selected = null; }}><ChevronRight size={15} /></button>
			<button class="btn btn-sm" onclick={() => { date = realToday; selected = null; }} disabled={date === realToday}>Heute</button>
		</div>
	{/snippet}
</PageHead>

{#if board.shifts.length === 0}
	<div class="card"><EmptyState icon={Activity} title="Keine Einsätze an diesem Tag" text={`Für ${dateLabel} ist kein Einsatz geplant. Wählen Sie einen anderen Tag oder legen Sie im Einsatzplan Reinigungspläne an.`} /></div>
{:else}
	<div class="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
		<section class="card overflow-hidden" aria-label="Zeitleiste der Einsätze">
			<div class="overflow-x-auto">
				<div class="min-w-[660px]">
					<!-- Kopf mit Stunden -->
					<div class="grid grid-cols-[210px_minmax(0,1fr)] border-b border-line bg-subtle/40">
						<div class="px-4 py-2.5 text-[0.7rem] font-bold tracking-wider text-muted uppercase">Objekt</div>
						<div class="relative h-9">
							{#each hours as m, i}{#if i % labelEvery === 0}<span class="num absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-[0.7rem] text-muted" style="left:{pct(m)}%">{fmtHm(m)}</span>{/if}{/each}
							{#if nowPct !== null}<span class="num absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent px-2 py-0.5 text-[0.68rem] font-bold shadow-sm" style="left:{nowPct}%; color: var(--accent-ink)">{fmtHm(board.nowMin)}</span>{/if}
						</div>
					</div>
					<!-- Zeilen -->
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 right-0 left-[210px]" aria-hidden="true">
							{#each hours as m}<span class="absolute inset-y-0 w-px bg-line/70" style="left:{pct(m)}%"></span>{/each}
							{#if nowPct !== null}<span class="absolute inset-y-0 z-10 w-0.5 bg-accent" style="left:{nowPct}%"></span>{/if}
						</div>
						{#each board.shifts as sh (sh.siteId)}
							{@const elapsed = board.isToday && sh.state === 'laeuft' ? Math.max(0, Math.min(1, (board.nowMin - sh.startMin) / (sh.endMin - sh.startMin))) : 0}
							<div class="grid grid-cols-[210px_minmax(0,1fr)] items-center border-b border-line last:border-b-0 {selected === sh.siteId ? 'bg-accent-soft/60' : 'hover:bg-subtle/40'}">
								<button class="min-w-0 px-4 py-2.5 text-left" onclick={() => (selected = sh.siteId)} aria-label="{sh.customerName}, {sh.siteName}, {stateLabel[sh.state]}">
									<span class="block truncate text-sm font-semibold">{sh.siteName}</span>
									<span class="block truncate text-xs text-muted">{sh.customerName}</span>
								</button>
								<div class="relative h-[3.6rem]">
									{#if outside(sh)}
										<button class="absolute top-1/2 flex h-8 -translate-y-1/2 items-center gap-1 rounded-full border px-2.5 text-xs {barCls[sh.state]} {outside(sh) === 'links' ? 'left-1' : 'right-1'}" onclick={() => (selected = sh.siteId)} title="{sh.start}–{sh.end} Uhr · {stateLabel[sh.state]}">{#if outside(sh) === 'links'}◀{/if}<span class="num font-semibold">{sh.start}–{sh.end}</span>{#if outside(sh) === 'rechts'}▶{/if}</button>
									{:else}
									<button
										class="absolute top-1/2 flex h-10 -translate-y-1/2 items-center gap-1.5 overflow-hidden rounded-xl border-2 px-2 text-left transition hover:-translate-y-[55%] hover:shadow-[var(--shadow-lift)] {barCls[sh.state]} {selected === sh.siteId ? 'ring-4 ring-accent/40' : ''}"
										style="left:{pct(sh.startMin)}%; width:max({pct(sh.endMin) - pct(sh.startMin)}%, 4.5rem); {sh.state === 'unbesetzt' ? 'background-image: repeating-linear-gradient(135deg, transparent 0 7px, rgb(179 38 30 / 0.12) 7px 14px)' : ''}"
										onclick={() => (selected = sh.siteId)} title="{sh.start}–{sh.end} Uhr · {stateLabel[sh.state]}"
									>
										{#if elapsed > 0}<span class="pointer-events-none absolute inset-y-0 left-0 bg-black/10" style="width:{elapsed * 100}%"></span>{/if}
										<span class="num relative z-10 shrink-0 text-xs font-bold">{sh.start}</span>
										<span class="relative z-10 flex -space-x-1.5">
											{#each sh.people.slice(0, 4) as p (p.id)}<span class="rounded-full bg-surface {ring[p.state]}" title="{p.name}: {personText(p, sh)}"><Avatar name={p.name} size={22} person /></span>{/each}
											{#if sh.people.length > 4}<span class="grid size-[22px] place-items-center rounded-full bg-surface text-[0.6rem] font-bold text-fg ring-1 ring-line-strong">+{sh.people.length - 4}</span>{/if}
										</span>
										{#if sh.empty}<span class="relative z-10 text-xs font-bold">unbesetzt</span>{/if}
										{#if sh.state === 'fertig'}<Check size={14} strokeWidth={3} class="relative z-10 ml-auto shrink-0" />{/if}
										{#if sh.absent.length && !sh.empty}<TriangleAlert size={13} class="relative z-10 ml-auto shrink-0 text-warn" />{/if}
									</button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
			<div class="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-4 py-2.5 text-[0.7rem] text-muted">
				<span class="flex items-center gap-1.5"><span class="size-3 rounded border-2 border-accent bg-accent"></span> läuft</span>
				<span class="flex items-center gap-1.5"><span class="size-3 rounded border-2 border-success/50 bg-success-soft"></span> fertig</span>
				<span class="flex items-center gap-1.5"><span class="size-3 rounded border-2 border-warn bg-warn-soft"></span> verspätet</span>
				<span class="flex items-center gap-1.5"><span class="size-3 rounded border-2 border-danger bg-danger-soft"></span> unbesetzt / keine Buchung</span>
				<span class="flex items-center gap-1.5"><span class="size-3 rounded border-2 border-line-strong bg-surface"></span> geplant</span>
				{#if board.isToday}<span class="ml-auto inline-flex rounded-lg border border-line-strong bg-surface p-0.5" role="group" aria-label="Zeitfenster"><button class="rounded-md px-2.5 py-1 text-xs font-semibold {zoom === 'tag' ? 'bg-accent' : 'text-muted'}" style={zoom === 'tag' ? 'color: var(--accent-ink)' : ''} aria-pressed={zoom === 'tag'} onclick={() => (zoom = 'tag')}>Ganzer Tag</button><button class="rounded-md px-2.5 py-1 text-xs font-semibold {zoom === 'jetzt' ? 'bg-accent' : 'text-muted'}" style={zoom === 'jetzt' ? 'color: var(--accent-ink)' : ''} aria-pressed={zoom === 'jetzt'} onclick={() => (zoom = 'jetzt')}>Um jetzt</button></span>{/if}
			</div>
		</section>

		<aside class="flex flex-col gap-4">
			{#if board.isToday}
				<section class="card overflow-hidden" aria-labelledby="h-alerts">
					<div class="flex items-center justify-between border-b border-line px-4 py-3"><h2 id="h-alerts" class="card-title">Aufmerksamkeit</h2>{#if board.alerts.length}<span class="num rounded-full bg-danger px-2 py-0.5 text-xs font-bold text-white">{board.alerts.length}</span>{/if}</div>
					{#if board.alerts.length === 0}
						<p class="flex items-center gap-2.5 px-4 py-5 text-sm text-success"><CircleCheck size={18} /> Alles im grünen Bereich.</p>
					{:else}
						<ul class="max-h-[300px] divide-y divide-line overflow-y-auto">
							{#each board.alerts as a (a.id)}
								<li><button class="flex w-full items-start gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-subtle/60 {selected && a.siteId === selected ? 'bg-accent-soft' : ''}" onclick={() => (selected = a.siteId ?? null)}>
									{#if a.level === 'rot'}<Siren size={16} class="mt-0.5 shrink-0 text-danger" />{:else if a.level === 'gelb'}<TriangleAlert size={16} class="mt-0.5 shrink-0 text-warn" />{:else}<Info size={16} class="mt-0.5 shrink-0 text-info" />{/if}
									<span class="min-w-0 flex-1">{a.text}</span>
								</button></li>
							{/each}
						</ul>
					{/if}
				</section>
			{/if}

			{#if sel}
				<section class="card overflow-hidden" aria-labelledby="h-sel">
					<div class="border-b border-line px-4 py-3">
						<div class="flex items-start justify-between gap-2"><div class="min-w-0"><h2 id="h-sel" class="card-title truncate">{sel.siteName}</h2><p class="truncate text-xs text-muted">{sel.customerName}</p></div><span class="badge shrink-0 {sel.state === 'fertig' ? 'badge-success' : sel.state === 'laeuft' ? 'badge-info' : sel.state === 'geplant' ? 'badge-neutral' : sel.state === 'spaet' ? 'badge-warn' : 'badge-danger'}">{stateLabel[sel.state]}</span></div>
						<p class="num mt-1 flex items-center gap-1.5 text-sm"><Clock size={13} class="text-muted" /> {sel.start}–{sel.end} Uhr</p>
					</div>
					<ul class="divide-y divide-line">
						{#each sel.people as p (p.id)}
							<li class="flex items-center gap-3 px-4 py-2.5">
								<span class="rounded-full {ring[p.state]}"><Avatar name={p.name} size={34} person /></span>
								<span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{p.name}{#if p.cover} <span class="text-xs font-normal text-muted">(Vertretung)</span>{/if}</span><span class="block truncate text-xs {p.state === 'spaet' || p.state === 'fehlt' ? 'font-semibold text-warn' : p.state === 'drin' || p.state === 'fertig' ? 'text-success' : 'text-muted'}">{personText(p, sel)}</span></span>
								{#if p.phone}<a class="btn btn-icon btn-sm" href="tel:{tel(p.phone)}" aria-label="{p.first} anrufen" title={p.phone}><Phone size={14} /></a>{/if}
							</li>
						{/each}
						{#each sel.absent as a (a.id)}
							<li class="flex items-center gap-3 bg-danger-soft/40 px-4 py-2.5">
								<span class="rounded-full opacity-60 ring-2 ring-danger"><Avatar name={a.name} size={34} person /></span>
								<span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium line-through decoration-danger/50">{a.name}</span><span class="block text-xs font-semibold text-danger">{a.kind === 'krank' ? 'krank gemeldet' : 'im Urlaub'}</span></span>
								{#if a.phone}<a class="btn btn-icon btn-sm" href="tel:{tel(a.phone)}" aria-label="{a.first} anrufen"><Phone size={14} /></a>{/if}
							</li>
						{/each}
						{#if sel.people.length === 0 && sel.absent.length === 0}<li class="px-4 py-4 text-sm text-muted">Niemand eingeplant.</li>{/if}
					</ul>
					{#if sel.checklist}
						<div class="border-t border-line px-4 py-3">
							<p class="mb-1 flex items-center justify-between text-xs"><span class="flex items-center gap-1.5 font-semibold"><ListChecks size={13} /> Checkliste</span><span class="num text-muted">{sel.checklist.done} abgehakt{sel.checklist.due ? ` · ${sel.checklist.due} fällig` : ''}</span></p>
							<div class="h-2 overflow-hidden rounded-full bg-subtle"><div class="h-full rounded-full bg-success" style="width:{sel.checklist.due ? Math.min(100, (sel.checklist.done / sel.checklist.due) * 100) : 100}%"></div></div>
						</div>
					{/if}
					{#if sel.defects}<a href="/maengel" class="flex items-center gap-2 border-t border-line px-4 py-2.5 text-sm text-danger hover:bg-subtle/60"><TriangleAlert size={14} /> {sel.defects} offene{sel.defects === 1 ? 'r Mangel' : ' Mängel'} an diesem Objekt <ExternalLink size={12} class="ml-auto" /></a>{/if}
					{#if sel.note}<p class="border-t border-line px-4 py-2.5 text-xs text-muted">{sel.note}</p>{/if}
					<div class="flex flex-wrap gap-2 border-t border-line px-4 py-3"><a class="btn btn-sm" href="/kunden/{sel.customerId}"><ExternalLink size={13} /> Kunde</a><a class="btn btn-sm" href="/karte"><MapPin size={13} /> Karte</a><a class="btn btn-sm" href="/einsatzplan">Einsatzplan</a></div>
				</section>

				{#if radar.length}
					<section class="card overflow-hidden border-accent/60" aria-labelledby="h-vertretung">
						<div class="border-b border-line px-4 py-3"><h2 id="h-vertretung" class="card-title flex items-center gap-2"><UserPlus size={15} /> Vertretung finden</h2><p class="text-xs text-muted">Einsetzbar, nach Entfernung zum nächsten Einsatz der Person an diesem Tag.</p></div>
						<ul class="divide-y divide-line">
							{#each radar as r (r.employee.id)}
								<li class="flex items-center gap-2.5 px-4 py-2">
									<Avatar name={r.employee.name} size={28} person />
									<span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{r.employee.name} <span class="text-xs font-normal text-muted">· {r.employee.role}</span></span><span class="block truncate text-xs text-muted">{r.km != null ? `${r.km.toLocaleString('de-DE', { maximumFractionDigits: 1 })} km von ${r.from} · ca. ${r.needMin} Min Fahrt` : 'an diesem Tag sonst nicht eingeplant'}</span></span>
									{#if r.employee.phone}<a class="btn btn-icon btn-sm" href="tel:{tel(r.employee.phone)}" aria-label="{r.employee.name.split(' ')[0]} anrufen"><Phone size={14} /></a>{/if}
									<button class="btn btn-primary btn-sm" onclick={() => assign(r.employee.id)}>Einteilen</button>
								</li>
							{/each}
						</ul>
					</section>
				{/if}
			{:else}
				<section class="card px-5 py-8 text-center text-sm text-muted"><Activity size={26} class="mx-auto mb-2 text-faint" />Wählen Sie einen Balken oder einen Hinweis, um Personen, Checkliste und Vertretung zu sehen.</section>
			{/if}
		</aside>
	</div>
{/if}
