<script lang="ts">
	import { features } from '#lib/features.svelte.ts';
	import { privacy } from '#lib/privacy.svelte.ts';
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { addDays } from '#lib/calc.ts';
	import { haversineKm, pathKm } from '#lib/geo.ts';
	import { GEO_DEFAULT_RADIUS_M } from '#lib/geo.ts';
	import { coverRadar, nearby, tourLegs, travelMinutes, visitState, type VisitState } from '#lib/mapTools.ts';
	import { customerStatus } from '#lib/labels.ts';
	import { formatEur, formatWeekday, formatDate, todayKey, formatTime } from '#lib/format.ts';
	import MapView, { type MapMarker } from '#lib/components/MapView.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import Badge from '#lib/components/Badge.svelte';
	import { ChevronLeft, ChevronRight, MapPin, Route, Info, ExternalLink, Crosshair, TriangleAlert, UserPlus, Clock } from '@lucide/svelte';

	const today = todayKey();
	let view = $state<'alle' | 'tag'>('alle');
	let date = $state(today);
	let who = $state('alle');
	$effect(() => { if (!privacy.tours) who = 'alle'; });
	let status = $state<'alle' | 'aktiv' | 'interessent' | 'inaktiv'>('alle');
	let selected = $state<string | null>(null);
	// Kartenhintergrund (OpenStreetMap) ist standardmäßig an; wer ihn ausschaltet, behält das für dieses Gerät
	let tiles = $state(true);
	$effect(() => { try { tiles = localStorage.getItem('resch-map-tiles') !== '0'; } catch { /* Standard: an */ } });
	function setTiles(v: boolean) { tiles = v; try { localStorage.setItem('resch-map-tiles', v ? '1' : '0'); } catch { /* ignorieren */ } }

	const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
	const colorOf = { aktiv: '#19734a', interessent: '#2457c5', inaktiv: '#7b8088' } as const;

	// ── Alle Kunden ──
	const allSites = $derived(db.data.customers.flatMap((c) => c.sites.map((s) => ({ c, s }))));
	const placed = $derived(allSites.filter((x) => x.s.lat != null && x.s.lon != null && (status === 'alle' || x.c.status === status)));
	const unplaced = $derived(allSites.filter((x) => x.s.lat == null || x.s.lon == null));
	// Ebenen: offene Mängel hervorheben, Termine der nächsten 14 Tage zeigen
	let showDefects = $state(true);
	let showAppts = $state(false);
	const openDefects = $derived.by(() => {
		const m = new Map<string, { n: number; late: number }>();
		for (const d of db.data.defects) if (d.siteId && d.status !== 'erledigt') { const x = m.get(d.siteId) ?? { n: 0, late: 0 }; x.n++; if (d.dueOn < today) x.late++; m.set(d.siteId, x); }
		return m;
	});
	const defectSites = $derived(placed.filter((x) => openDefects.has(x.s.id)).length);
	const upcoming = $derived(db.data.appointments.filter((a) => a.at.slice(0, 10) >= today && a.at.slice(0, 10) <= addDays(today, 14)).map((a) => ({ a, site: db.customer(a.customerId)?.sites.find((s) => s.lat != null) })).filter((x) => x.site));
	const allMarkers = $derived<MapMarker[]>([
		...placed.map(({ c, s }) => ({ id: s.id, lat: s.lat!, lon: s.lon!, color: colorOf[c.status], title: `${c.name} · ${s.name}`, popup: `<strong>${esc(c.name.length > 50 ? c.name.slice(0, 48) + '…' : c.name)}</strong><br>${esc(s.name)}<br>${esc(s.street)}, ${esc(s.postal)} ${esc(s.city)}${openDefects.get(s.id) ? `<br><strong style="color:#b3261e">${openDefects.get(s.id)!.n} offene${openDefects.get(s.id)!.n === 1 ? 'r Mangel' : ' Mängel'}${openDefects.get(s.id)!.late ? `, ${openDefects.get(s.id)!.late} überfällig` : ''}</strong>` : ''}`, ...(showDefects && features.has('maengel') && openDefects.has(s.id) ? { alert: true, label: String(openDefects.get(s.id)!.n) } : {}) })),
		...(showAppts ? upcoming.map(({ a, site }) => ({ id: 'ap' + a.id, lat: site!.lat!, lon: site!.lon!, color: a.kind === 'besichtigung' ? '#2457c5' : '#19734a', shape: 'diamond' as const, title: a.title, popup: `<strong>${esc(a.title)}</strong><br>${formatDate(a.at.slice(0, 10))} ${formatTime(a.at)} Uhr · ${esc(a.who)}` })) : [])
	]);
	const counts = $derived({
		alle: allSites.filter((x) => x.s.lat != null).length,
		aktiv: allSites.filter((x) => x.s.lat != null && x.c.status === 'aktiv').length,
		interessent: allSites.filter((x) => x.s.lat != null && x.c.status === 'interessent').length,
		inaktiv: allSites.filter((x) => x.s.lat != null && x.c.status === 'inaktiv').length
	});

	// ── Nähe-Check: andere Objekte rund um das gewählte ──
	const near = $derived.by(() => {
		const x = view === 'alle' ? allSites.find((y) => y.s.id === selected) : undefined;
		if (!x || x.s.lat == null || x.s.lon == null) return null;
		const all = allSites.map((y) => ({ id: y.s.id, lat: y.s.lat, lon: y.s.lon, s: y.s, c: y.c }));
		const list = nearby({ id: x.s.id, lat: x.s.lat, lon: x.s.lon }, all, 5, 25);
		return { list, active3: list.filter((l) => l.item.c.status === 'aktiv' && l.km <= 3).length };
	});
	// Radius des Standort-Abgleichs beim Stempeln um das gewählte Objekt (nur wenn der Abgleich eingeschaltet ist)
	const circles = $derived.by(() => {
		if (!db.data.settings?.geo || !selected) return [];
		const s = allSites.find((x) => x.s.id === selected)?.s;
		return s && s.lat != null && s.lon != null ? [{ lat: s.lat, lon: s.lon, radiusM: db.data.settings.geoRadius ?? GEO_DEFAULT_RADIUS_M, color: '#2457c5', label: 'Radius des Standort-Abgleichs beim Stempeln' }] : [];
	});

	// ── Position setzen per Klick ──
	let pickSite = $state<string | null>(null);
	function onpick(lat: number, lon: number) {
		const hit = allSites.find((x) => x.s.id === pickSite);
		if (!hit) return;
		hit.s.lat = Math.round(lat * 1e5) / 1e5; hit.s.lon = Math.round(lon * 1e5) / 1e5;
		toasts.push(`Position für ${hit.s.name} gesetzt.`, { tone: 'success' });
		selected = hit.s.id; pickSite = null;
	}

	// ── Einsatztag ──
	interface Stop { n: number; under: boolean; state: VisitState; hours: number; siteId: string; customerName: string; siteName: string; start: string; people: string[]; empty: boolean; lat: number | null; lon: number | null }
	const stops = $derived.by<Stop[]>(() => {
		const out: Omit<Stop, 'n'>[] = [];
		const nowMin = (() => { const p = new Date().toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hour12: false }).split(':').map(Number); return p[0] * 60 + p[1]; })();
		for (const { site, customer } of db.plannedSites()) {
			const st = db.staffing(site.id, date);
			if (!st) continue;
			const names = [...st.present, ...st.covers.map((c) => c.emp)];
			if (who !== 'alle' && !names.some((e) => e.id === who)) continue;
			out.push({ under: st.understaffed, state: visitState(db.data, site.id, date, today, nowMin), hours: site.plan!.hours, siteId: site.id, customerName: customer.name, siteName: site.name, start: site.plan!.start, people: names.map((e) => e.name.split(' ')[0]), empty: st.empty, lat: site.lat ?? null, lon: site.lon ?? null });
		}
		return out.sort((a, b) => a.start.localeCompare(b.start)).map((s, i) => ({ ...s, n: i + 1 }));
	});
	const appts = $derived(
		db.data.appointments.filter((a) => a.at.slice(0, 10) === date || new Date(a.at).toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' }) === date)
			.map((a) => ({ a, site: db.customer(a.customerId)?.sites.find((s) => s.lat != null) }))
	);
	const stateColor: Record<VisitState, string> = { gebucht: '#19734a', geplant: '#e6a100', spaet: '#c2410c', fehlt: '#b3261e' };
	const stateText: Record<VisitState, string> = { gebucht: 'Zeit gebucht', geplant: 'geplant', spaet: 'Beginn überschritten, keine Buchung', fehlt: 'keine Zeitbuchung' };
	const dayMarkers = $derived<MapMarker[]>([
		...stops.filter((s) => s.lat != null).map((s) => ({ id: s.siteId, lat: s.lat!, lon: s.lon!, label: String(s.n), color: stateColor[s.state], alert: s.empty || s.under, title: `${s.start} ${s.customerName}`, popup: `<strong>${s.n}. ${esc(s.siteName)}</strong><br>${s.start} Uhr · ${esc(s.people.join(', ') || 'unbesetzt')}` })),
		...appts.filter((x) => x.site).map(({ a, site }) => ({ id: 'ap' + a.id, lat: site!.lat!, lon: site!.lon!, color: a.kind === 'besichtigung' ? '#2457c5' : '#19734a', shape: 'diamond' as const, title: a.title, popup: `<strong>${esc(a.title)}</strong><br>${formatTime(a.at)} Uhr · ${esc(a.who)}` }))
	]);
	const route = $derived(who !== 'alle' ? (stops.filter((s) => s.lat != null).map((s) => [s.lat!, s.lon!] as [number, number])) : null);
	const km = $derived(route && route.length > 1 ? pathKm(route) : 0);
	// Wege je Person: reicht die Pause zwischen zwei Einsätzen für die Fahrt?
	const legs = $derived(who !== 'alle' ? tourLegs(stops.map((s) => ({ siteId: s.siteId, start: s.start, hours: s.hours, lat: s.lat, lon: s.lon }))) : []);
	const tightLegs = $derived(legs.filter((l) => l.tight).length);
	const legKm = (i: number) => {
		const a = stops[i - 1], b = stops[i];
		return a?.lat != null && b?.lat != null ? haversineKm([a.lat, a.lon!], [b.lat!, b.lon!]) : null;
	};
	// ── Vertretung nach Entfernung für den gewählten, nicht voll besetzten Einsatz ──
	const selStop = $derived(view === 'tag' ? stops.find((x) => x.siteId === selected) : undefined);
	const radar = $derived(selStop && (selStop.empty || selStop.under) ? coverRadar(db.data, selStop.siteId, date).slice(0, 6) : []);
	function assignCover(employeeId: string) {
		if (!selStop) return;
		const c = { id: 'c' + Date.now().toString(36), siteId: selStop.siteId, date, employeeId };
		db.data.covers.push(c);
		toasts.push(`${db.employee(employeeId)?.name} übernimmt ${selStop.siteName}.`, { tone: 'success', action: { label: 'Rückgängig', run: () => { const i = db.data.covers.findIndex((x) => x.id === c.id); if (i >= 0) db.data.covers.splice(i, 1); } } });
	}
	const unplacedToday = $derived(stops.filter((s) => s.lat == null).length);
	const emptyToday = $derived(stops.filter((s) => s.empty).length);
	const shown = $derived(view === 'alle' ? allMarkers : dayMarkers);
	const sel = $derived(view === 'alle' ? allSites.find((x) => x.s.id === selected) : undefined);
	const dateLabel = $derived(formatWeekday(date + 'T12:00:00Z'));
	import PageHead from '#lib/components/PageHead.svelte';
</script>

<svelte:head><title>Karte · Putzbetrieb</title></svelte:head>

<PageHead title="Karte" subtitle={`Wo sind unsere Kunden, und wo wird heute gereinigt? Die Positionen in der Demo sind erfunden.`}>
	{#snippet actions()}
		<div class="inline-flex rounded-lg border border-line-strong bg-surface p-1" role="tablist" aria-label="Kartenansicht">
		<button role="tab" aria-selected={view === 'alle'} class="tab !mb-0 !rounded-md" onclick={() => { view = 'alle'; selected = null; }}><MapPin size={14} class="mr-1 inline" /> Alle Kunden</button>
		<button role="tab" aria-selected={view === 'tag'} class="tab !mb-0 !rounded-md" onclick={() => { view = 'tag'; selected = null; }}><Route size={14} class="mr-1 inline" /> Einsatztag</button>
	</div>
	{/snippet}
</PageHead>

<div class="mb-3 flex flex-wrap items-center gap-2">
	{#if view === 'alle'}
		<div class="flex flex-wrap gap-1" role="group" aria-label="Nach Status filtern">
			{#each [['alle', 'Alle'], ['aktiv', 'Aktiv'], ['interessent', 'Interessenten'], ['inaktiv', 'Inaktiv']] as [id, l]}
				<button class="btn btn-sm {status === id ? 'border-accent bg-accent text-white' : ''}" aria-pressed={status === id} onclick={() => (status = id as typeof status)}>{l} <span class="num opacity-70">{counts[id as keyof typeof counts]}</span></button>
			{/each}
		</div>
		<div class="ml-2 flex items-center gap-3 text-xs text-muted">{#each Object.entries(colorOf) as [k, c]}<span class="flex items-center gap-1"><span class="size-2.5 rounded-full" style="background:{c}"></span>{customerStatus[k as keyof typeof customerStatus].label}</span>{/each}</div>
	{:else}
		<div class="flex items-center gap-1">
			<button class="btn btn-icon" aria-label="Vorheriger Tag" onclick={() => (date = addDays(date, -1))}><ChevronLeft size={15} /></button>
			<input type="date" class="input w-40" aria-label="Datum" bind:value={date} />
			<button class="btn btn-icon" aria-label="Nächster Tag" onclick={() => (date = addDays(date, 1))}><ChevronRight size={15} /></button>
			<button class="btn btn-sm" onclick={() => (date = today)} disabled={date === today}>Heute</button>
		</div>
		{#if privacy.tours}<select class="input w-52" aria-label="Person wählen" bind:value={who}><option value="alle">Alle Einsätze</option>{#each db.data.employees as e}<option value={e.id}>Tour: {e.name}</option>{/each}</select>{/if}
	{/if}
	{#if view === 'alle'}
		{#if features.has('maengel')}<label class="flex cursor-pointer items-center gap-1.5 text-sm"><input type="checkbox" class="size-4 accent-[var(--accent)]" bind:checked={showDefects} /> Offene Mängel{#if defectSites} <span class="num text-xs text-muted">({defectSites})</span>{/if}</label>{/if}
		{#if features.has('verkauf')}<label class="flex cursor-pointer items-center gap-1.5 text-sm"><input type="checkbox" class="size-4 accent-[var(--accent)]" bind:checked={showAppts} /> Termine (14 Tage)</label>{/if}
	{/if}
	<label class="ml-auto flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-[var(--accent)]" checked={tiles} onchange={(e) => setTiles(e.currentTarget.checked)} /> Kartenhintergrund (OpenStreetMap)</label>
</div>

<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
	<div class="card relative h-[min(68vh,640px)] min-h-[360px] overflow-hidden p-1.5">
		<MapView markers={shown} circles={view === 'alle' ? circles : []} route={view === 'tag' ? route : null} {tiles} selectedId={selected} pickMode={!!pickSite} onselect={(id) => (selected = id)} {onpick} />
		{#if pickSite}<div class="pointer-events-none absolute inset-x-0 top-4 flex justify-center"><span class="rounded-full bg-fg px-4 py-1.5 text-sm text-bg shadow-[var(--shadow-pop)]"><Crosshair size={14} class="mr-1 inline" /> Klicken Sie auf die Karte, um die Position zu setzen</span></div>{/if}
		{#if !tiles}<p class="pointer-events-none absolute bottom-3 left-3 rounded-md bg-surface/90 px-2.5 py-1 text-xs text-muted shadow-sm">Ohne Kartenhintergrund, es wird nichts an Kartendienste übertragen.</p>{/if}
	</div>

	<aside class="flex flex-col gap-3">
		{#if view === 'alle'}
			{#if sel}
				<section class="card p-4" aria-live="polite">
					<div class="flex items-start gap-3"><Avatar name={sel.c.name} size={36} /><div class="min-w-0"><p class="text-sm font-semibold">{sel.c.name}</p><p class="text-xs text-muted">{sel.s.name}</p></div></div>
					<p class="mt-2 text-sm">{sel.s.street}, {sel.s.postal} {sel.s.city}</p>
					<div class="mt-2 flex flex-wrap items-center gap-2"><Badge tone={customerStatus[sel.c.status].tone} label={customerStatus[sel.c.status].label} />{#if db.monthlyRecurring(sel.c.id)}<span class="num text-xs text-muted">{formatEur(db.monthlyRecurring(sel.c.id))} / Monat</span>{/if}</div>
					<a class="btn btn-sm mt-3" href="/kunden/{sel.c.id}"><ExternalLink size={13} /> Zum Kunden</a>
					{#if openDefects.get(sel.s.id)}<p class="mt-3 flex items-center gap-1.5 text-sm font-semibold text-danger"><TriangleAlert size={14} /> {openDefects.get(sel.s.id)?.n} offene{openDefects.get(sel.s.id)?.n === 1 ? 'r Mangel' : ' Mängel'}{openDefects.get(sel.s.id)?.late ? `, ${openDefects.get(sel.s.id)?.late} überfällig` : ''} <a href="/maengel" class="ml-1 font-normal underline">ansehen</a></p>{/if}
					{#if near}
						<div class="mt-3 border-t border-line pt-3">
							<h3 class="section-label mb-1.5">In der Nähe</h3>
							{#if near.active3}<p class="mb-1.5 rounded-lg bg-success-soft px-2.5 py-1.5 text-xs text-success">{near.active3} aktive{near.active3 === 1 ? 's Objekt' : ' Objekte'} im Umkreis von 3 km: Einsätze lassen sich bündeln.</p>{/if}
							{#if near.list.length}<ul class="grid gap-0.5">{#each near.list as n (n.item.id)}<li><button class="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-xs hover:bg-subtle" onclick={() => (selected = n.item.id)}><span class="size-2 shrink-0 rounded-full" style="background:{colorOf[n.item.c.status]}"></span><span class="min-w-0 flex-1 truncate">{n.item.c.name.length > 30 ? n.item.c.name.slice(0, 28) + '…' : n.item.c.name} · {n.item.s.name}</span><span class="num shrink-0 text-muted">{n.km.toLocaleString('de-DE', { maximumFractionDigits: 1 })} km</span></button></li>{/each}</ul>{:else}<p class="text-xs text-muted">Kein anderes Objekt im Umkreis von 25 km.</p>{/if}
							<p class="mt-1 text-[0.68rem] text-faint">Luftlinie, keine Fahrstrecke.</p>
						</div>
					{/if}
					{#if db.data.settings?.geo}<p class="mt-2 text-[0.68rem] text-faint">Der blaue Kreis zeigt den Radius des Standort-Abgleichs beim Stempeln.</p>{/if}
				</section>
			{/if}
			<section class="card"><div class="border-b border-line px-4 py-3"><h2 class="card-title">Objekte <span class="num font-normal text-faint">{placed.length}</span></h2></div>
				<ul class="max-h-[260px] divide-y divide-line overflow-y-auto">
					{#each placed as { c, s } (s.id)}
						<li><button class="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm hover:bg-subtle/60 {selected === s.id ? 'bg-accent-soft' : ''}" onclick={() => (selected = s.id)}><span class="size-2.5 shrink-0 rounded-full" style="background:{colorOf[c.status]}"></span><span class="min-w-0 flex-1"><span class="block truncate font-medium">{c.name}</span><span class="block truncate text-xs text-muted">{s.name} · {s.city}</span></span></button></li>
					{/each}
				</ul>
			</section>
			{#if unplaced.length}
				<section class="card border-warn/40"><div class="border-b border-line px-4 py-3"><h2 class="card-title">Ohne Position <span class="num font-normal text-faint">{unplaced.length}</span></h2><p class="text-xs text-muted">Wählen Sie ein Objekt und klicken Sie auf die Karte. Mit Backend kommt die Position automatisch aus der Adresse.</p></div>
					<ul class="divide-y divide-line">
						{#each unplaced as { c, s } (s.id)}
							<li class="flex items-center gap-2 px-4 py-2 text-sm"><span class="min-w-0 flex-1"><span class="block truncate font-medium">{c.name}</span><span class="block truncate text-xs text-muted">{s.name}</span></span><button class="btn btn-sm {pickSite === s.id ? 'border-accent bg-accent text-white' : ''}" onclick={() => (pickSite = pickSite === s.id ? null : s.id)}><Crosshair size={13} /> Setzen</button></li>
						{/each}
					</ul>
				</section>
			{/if}
		{:else}
			<section class="card" aria-labelledby="h-day">
				<div class="border-b border-line px-4 py-3"><h2 id="h-day" class="card-title capitalize">{dateLabel}</h2>
					<p class="text-xs text-muted">{stops.length} {stops.length === 1 ? 'Einsatz' : 'Einsätze'}{emptyToday ? `, ${emptyToday} unbesetzt` : ''}{who !== 'alle' && km ? ` · Tour ca. ${km.toLocaleString('de-DE', { maximumFractionDigits: 1 })} km Luftlinie` : ''}{tightLegs ? ` · ${tightLegs} zu knappe${tightLegs === 1 ? 'r Weg' : ' Wege'}` : ''}</p>
					<p class="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[0.68rem] text-muted">{#each Object.entries(stateColor) as [k, c]}<span class="flex items-center gap-1"><span class="size-2 rounded-full" style="background:{c}"></span>{({ gebucht: 'Zeit gebucht', geplant: 'geplant', spaet: 'Beginn überschritten', fehlt: 'keine Buchung' } as Record<string, string>)[k]}</span>{/each}</p></div>
				{#if stops.length === 0}
					<p class="px-4 py-8 text-center text-sm text-muted">An diesem Tag ist kein Einsatz geplant.</p>
				{:else}
					<ol class="max-h-[420px] divide-y divide-line overflow-y-auto">
						{#each stops as s, i (s.siteId)}
							{@const leg = who !== 'alle' && i > 0 ? legKm(i) : null}
							{@const lg = who !== 'alle' && i > 0 ? legs[i - 1] : null}
							{#if lg}<li class="px-4 py-1 text-center text-[0.7rem] {lg.tight ? 'font-semibold text-danger' : 'text-faint'}">↓ {#if lg.km != null}ca. {lg.km.toLocaleString('de-DE', { maximumFractionDigits: 1 })} km · ca. {lg.needMin} Min Fahrt{:else}Weg unbekannt (Position fehlt){/if} · Pause {lg.gapMin} Min{#if lg.tight}: reicht nicht{/if}</li>{:else if leg !== null}<li class="px-4 py-1 text-center text-[0.7rem] text-faint" aria-hidden="true">↓ ca. {leg.toLocaleString('de-DE', { maximumFractionDigits: 1 })} km</li>{/if}
							<li><button class="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-subtle/60 {selected === s.siteId ? 'bg-accent-soft' : ''}" onclick={() => (selected = s.siteId)}>
								<span class="grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white {s.empty ? 'ring-2 ring-danger ring-offset-1' : ''}" style="background:{stateColor[s.state]}" title={stateText[s.state]}>{s.n}</span>
								<span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{s.customerName}</span><span class="block truncate text-xs text-muted">{s.start} Uhr · {s.siteName}</span><span class="block truncate text-xs {s.empty ? 'font-semibold text-danger' : 'text-muted'}">{s.empty ? 'Unbesetzt' : s.people.join(', ')}</span></span>
								{#if s.lat == null}<span class="text-xs text-warn" title="Keine Position">?</span>{/if}
							</button></li>
						{/each}
					</ol>
				{/if}
				{#if unplacedToday}<p class="border-t border-line px-4 py-2 text-xs text-warn">{unplacedToday} Objekt{unplacedToday === 1 ? '' : 'e'} ohne Position, siehe „Alle Kunden“.</p>{/if}
			</section>
			{#if selStop && (selStop.empty || selStop.under)}
				<section class="card border-danger/40" aria-labelledby="h-radar">
					<div class="border-b border-line px-4 py-3"><h2 id="h-radar" class="card-title flex items-center gap-2"><UserPlus size={15} /> Vertretung für {selStop.siteName}</h2><p class="text-xs text-muted">{selStop.empty ? 'Unbesetzt' : 'Nicht voll besetzt'} · {selStop.start} Uhr. Sortiert nach Entfernung zum nächsten Einsatz der Person an diesem Tag.</p></div>
					{#if radar.length === 0}<p class="px-4 py-4 text-sm text-muted">Niemand verfügbar.</p>
					{:else}<ul class="divide-y divide-line">
						{#each radar as r (r.employee.id)}
							<li class="flex items-center gap-2.5 px-4 py-2 {r.allowed ? '' : 'opacity-60'}">
								<Avatar name={r.employee.name} size={28} person />
								<span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{r.employee.name} <span class="text-xs font-normal text-muted">· {r.employee.role}</span></span><span class="block truncate text-xs {r.allowed ? 'text-muted' : 'text-warn'}">{#if !r.allowed}{r.reason}{:else if r.km != null}{r.km.toLocaleString('de-DE', { maximumFractionDigits: 1 })} km von {r.from} · ca. {r.needMin} Min Fahrt{:else}an diesem Tag sonst nicht eingeplant, Entfernung unbekannt{/if}</span></span>
								{#if r.allowed}<button class="btn btn-sm" onclick={() => assignCover(r.employee.id)}>Einteilen</button>{/if}
							</li>
						{/each}
					</ul>{/if}
					<p class="border-t border-line px-4 py-2 text-[0.68rem] text-faint">Luftlinie und Schätzung der Fahrzeit (35 km/h im Stadtverkehr). Privatadressen sind nicht gespeichert.</p>
				</section>
			{/if}
			{#if appts.length}
				<section class="card"><div class="border-b border-line px-4 py-3"><h2 class="card-title">Termine</h2></div>
					<ul class="divide-y divide-line">{#each appts as { a } (a.id)}<li class="flex items-center gap-2.5 px-4 py-2 text-sm"><span class="size-3 shrink-0 rotate-45 rounded-[3px]" style="background:{a.kind === 'besichtigung' ? '#2457c5' : '#19734a'}"></span><span class="min-w-0 flex-1"><span class="block truncate font-medium">{a.title}</span><span class="text-xs text-muted">{formatTime(a.at)} Uhr · {a.who}</span></span></li>{/each}</ul></section>
			{/if}
			<p class="flex items-start gap-1.5 text-xs text-muted"><Info size={13} class="mt-px shrink-0" /> {who === 'alle' ? 'Touren je Person sind aus Datenschutzgründen aus und lassen sich in den Einstellungen einschalten.' : 'Die Linie verbindet die Einsätze nach Beginn, Entfernungen sind Luftlinie und keine Fahrstrecke.'} Orange Zahl = Reihenfolge nach Beginn, rote Umrandung = unbesetzt, Raute = Termin.</p>
		{/if}
	</aside>
</div>
