<script lang="ts">
	import { goto } from '$app/navigation';
	import { db } from '#lib/db.svelte.ts';
	import { addDays } from '#lib/calc.ts';
	import { todayKey, dayDiff } from '#lib/format.ts';
	import { langs, t, type Lang } from '#lib/staffI18n.ts';
	import type { StaffView } from '#lib/staffView.ts';
	import Avatar from '#lib/components/Avatar.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import { Phone, MapPin, Clock, CalendarOff, ShieldCheck, Eye, LogOut, KeyRound, Play, Square, Camera, CircleCheck, QrCode, ArrowLeftRight, Bell, Send, Thermometer, Palmtree, TriangleAlert, WifiOff, Info } from '@lucide/svelte';

	const today = todayKey();
	// QR-Code am Objekt: der Link enthält Objekt und Schlüssel. Er wird gemerkt (auch über die Anmeldung hinweg) und aus der Adresse entfernt.
	function readQr(): { s: string; t: string } | null {
		try {
			const p = new URLSearchParams(location.search);
			if (p.get('s') && p.get('t')) { sessionStorage.setItem('resch-qr', JSON.stringify({ s: p.get('s'), t: p.get('t') })); history.replaceState(null, '', '/mitarbeiter'); }
			return JSON.parse(sessionStorage.getItem('resch-qr') ?? 'null');
		} catch { return null; }
	}
	let qr = $state<{ s: string; t: string } | null>(readQr());
	function clearQr() { qr = null; try { sessionStorage.removeItem('resch-qr'); } catch { /* ignorieren */ } }
	let v = $state<StaffView | null>(null);
	let phase = $state<'laden' | 'ok' | 'fehler'>('laden');
	let errMsg = $state('');
	async function load() {
		try {
			const r = await fetch('/api/me/view');
			if (r.status === 403) { phase = 'ok'; return; } // Passwortwechsel nötig
			if (!r.ok) { errMsg = (await r.json().catch(() => ({}))).error ?? ''; phase = 'fehler'; return; }
			v = await r.json(); phase = 'ok';
		} catch { if (phase === 'laden') phase = 'fehler'; }
	}
	// ── Mitteilungen: Glocke mit Zähler; bei offener App optional als Systemhinweis ──
	type Notif = { id: string; kind: string; payload: Record<string, string>; createdAt: string; read: boolean };
	let notifs = $state<Notif[]>([]);
	let notifOpen = $state(false);
	let seen = new Set<string>();
	let firstLoad = true;
	const unread = $derived(notifs.filter((n) => !n.read).length);
	let permission = $state<'default' | 'granted' | 'denied' | 'unsupported'>('unsupported');
	$effect(() => { permission = typeof Notification === 'undefined' ? 'unsupported' : Notification.permission; });
	const kindKey = { swap_offer: 'nSwapOffer', swap_taken: 'nSwapTaken', swap_approved: 'nSwapApproved', swap_rejected: 'nSwapRejected', swap_withdrawn: 'nSwapWithdrawn' } as const;
	const fmtN = (n: Notif) => {
		const tpl = (L as Record<string, string>)[kindKey[n.kind as keyof typeof kindKey] ?? ''] ?? '';
		return tpl.replace(/\{(\w+)\}/g, (_, k) => (k === 'date' ? dShort(n.payload.date) : (n.payload[k] ?? '')));
	};
	async function loadNotifs() {
		try {
			const r = await fetch('/api/me/notifications');
			if (!r.ok) return;
			const j = await r.json();
			const fresh = (j.items as Notif[]).filter((n) => !n.read && !seen.has(n.id));
			for (const n of j.items as Notif[]) seen.add(n.id);
			notifs = j.items;
			// Neue Mitteilungen als Systemhinweis zeigen (nicht beim ersten Laden und nur mit Erlaubnis)
			if (!firstLoad && fresh.length && typeof Notification !== 'undefined' && Notification.permission === 'granted') for (const n of fresh) { try { new Notification(L.swapTitle, { body: fmtN(n), tag: n.id }); } catch { /* nicht überall erlaubt */ } }
			firstLoad = false;
			if (fresh.length) loadSwaps();
		} catch { /* offline */ }
	}
	async function markRead() { await fetch('/api/me/notifications', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ all: true }) }); await loadNotifs(); }
	async function allowNotif() { try { permission = await Notification.requestPermission(); } catch { /* ignorieren */ } }
	$effect(() => {
		if (!db.ready || !db.session || db.session.mustChange) return;
		loadNotifs();
		const t2 = setInterval(loadNotifs, 45000);
		const onVis = () => { if (document.visibilityState === 'visible') loadNotifs(); };
		document.addEventListener('visibilitychange', onVis);
		return () => { clearInterval(t2); document.removeEventListener('visibilitychange', onVis); };
	});
	$effect(() => { document.title = unread ? `(${unread}) Meine Einsätze · Putzbetrieb` : 'Meine Einsätze · Putzbetrieb'; });

	// ── Schichttausch ──
	type SwapOffer = { id: string; by: string; siteId: string; date: string; start: string; end: string; customer: string; site: string };
	type SwapMine = { id: string; status: string; role: 'abgeber' | 'uebernehmer'; other: string; siteId: string; date: string; start: string; end: string; customer: string; site: string };
	let offers = $state<SwapOffer[]>([]);
	let mineSwaps = $state<SwapMine[]>([]);
	async function loadSwaps() {
		try { const r = await fetch('/api/me/swaps'); if (r.ok) { const j = await r.json(); offers = j.offers; mineSwaps = j.mine; } } catch { /* offline */ }
	}
	$effect(() => { if (db.ready && db.session) { load(); flush(); loadSwaps(); } });

	let lang = $state<Lang>('de');
	$effect(() => { try { const x = localStorage.getItem('resch-staff-lang') as Lang | null; if (x && x in t) lang = x; } catch { /* aus */ } });
	function setLang(l: Lang) { lang = l; try { localStorage.setItem('resch-staff-lang', l); } catch { /* ignorieren */ } }
	const L = $derived(t[lang]);
	const locale = $derived(langs.find((l) => l.id === lang)!.locale);
	const dayName = (d: string) => (d === today ? L.today : d === addDays(today, 1) ? L.tomorrow : new Date(d + 'T12:00:00Z').toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'numeric', timeZone: 'UTC' }));
	const shifts = $derived(v?.shifts ?? []);
	const todays = $derived(shifts.filter((s) => s.date === today));
	const trainingOk = $derived(!!v?.instructedOn);
	const fmt = (n: number) => n.toLocaleString(locale, { maximumFractionDigits: 1 });
	const dShort = (d: string) => new Date(d + 'T12:00:00Z').toLocaleDateString(locale, { day: 'numeric', month: 'numeric', timeZone: 'UTC' });
	const hm = (iso: string) => new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });

	// ── Warteschlange: ohne Netz gespeicherte Stempelungen und Meldungen werden nachgesendet ──
	type Job = { url: string; body: Record<string, unknown> };
	const QKEY = 'resch-staff-queue';
	const readQ = (): Job[] => { try { return JSON.parse(localStorage.getItem(QKEY) ?? '[]'); } catch { return []; } };
	const writeQ = (q: Job[]) => { try { localStorage.setItem(QKEY, JSON.stringify(q)); } catch { /* ignorieren */ } };
	let queued = $state(0);
	let localOpen = $state<{ startedAt: string; siteId: string; site: string } | null>(null);
	let flash = $state('');
	async function send(url: string, body: Record<string, unknown>): Promise<{ ok: boolean; offline?: boolean; error?: string; status?: number }> {
		try {
			const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
			const j = await r.json().catch(() => ({}));
			return { ok: r.ok || (r.status === 409 && !!(j.duplicate)), error: j.error, status: r.status };
		} catch { return { ok: false, offline: true }; }
	}
	async function flush() {
		const q = readQ();
		queued = q.length;
		if (!q.length || !navigator.onLine) return;
		const rest: Job[] = [];
		for (const job of q) { const r = await send(job.url, job.body); if (!r.ok && r.offline) rest.push(job); }
		writeQ(rest); queued = rest.length;
		if (!rest.length) { localOpen = null; await load(); }
	}
	$effect(() => { const on = () => flush(); window.addEventListener('online', on); const t2 = setInterval(on, 60000); return () => { window.removeEventListener('online', on); clearInterval(t2); }; });

	async function act(url: string, body: Record<string, unknown>, after?: () => void): Promise<boolean> {
		const r = await send(url, body);
		if (r.offline) { writeQ([...readQ(), { url, body }]); queued = readQ().length; flash = L.offlineQ; after?.(); return true; }
		if (!r.ok) { flash = r.error ?? ''; return false; }
		after?.(); await load(); return true;
	}

	// ── Stempeln ──
	const open = $derived(v?.open ?? localOpen);
	let now = $state(Date.now());
	$effect(() => { const i = setInterval(() => (now = Date.now()), 30000); return () => clearInterval(i); });
	const runningMin = $derived(open ? Math.max(0, Math.floor((now - Date.parse(open.startedAt)) / 60000)) : 0);
	/** Standort nur im Moment des Stempelns und nur, wenn der Betrieb es eingeschaltet hat. Wird nicht gespeichert, nur abgeglichen. */
	function fix(): Promise<{ lat: number; lon: number; acc: number } | null> {
		if (!v?.geo || !('geolocation' in navigator)) return Promise.resolve(null);
		return new Promise((res) => navigator.geolocation.getCurrentPosition((p) => res({ lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy }), () => res(null), { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }));
	}
	let outOpen = $state(false);
	let breakMin = $state(0);
	async function punchIn(s: { siteId: string; customer: string; site: string }, token?: string) {
		flash = '';
		const startedAt = new Date().toISOString();
		const ok = await act('/api/me/punch', { action: 'in', siteId: s.siteId, token, geo: await fix(), clientId: crypto.randomUUID(), clientAt: startedAt }, () => { localOpen = { startedAt, siteId: s.siteId, site: s.site }; clearQr(); });
		if (!ok) flash = flash || '';
	}
	async function punchOut() {
		const ok = await act('/api/me/punch', { action: 'out', breakMin, geo: await fix(), clientId: crypto.randomUUID(), clientAt: new Date().toISOString() }, () => { localOpen = null; });
		if (ok) { outOpen = false; breakMin = 0; clearQr(); }
	}

	// ── Checkliste zum Einsatz: Leistungen abhaken, optional Foto ──
	let cl = $state<Record<string, { done: string[]; note: string; photo: string; edit: boolean }>>({});
	const blank = { done: [] as string[], note: '', photo: '', edit: false };
	// Einträge anlegen, bevor sie bedient werden (nicht beim Zeichnen der Seite)
	$effect(() => { for (const t of todays) if (t.lv?.length && !cl[t.siteId]) cl[t.siteId] = { done: [], note: '', photo: '', edit: false }; });
	const clOf = (id: string) => cl[id] ?? blank;
	async function clPhoto(id: string, e: Event) {
		const f = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!f) return;
		const bmp = await createImageBitmap(f);
		const scale = Math.min(1, 1024 / Math.max(bmp.width, bmp.height));
		const c = document.createElement('canvas'); c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
		c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
		let q = 0.72, url = c.toDataURL('image/jpeg', q);
		while (url.length > 380_000 && q > 0.3) { q -= 0.1; url = c.toDataURL('image/jpeg', q); }
		clOf(id).photo = url;
	}
	async function clSend(siteId: string) {
		flash = '';
		const x = clOf(siteId);
		const ok = await act('/api/me/checklist', { siteId, doneIds: x.done, note: x.note, photo: x.photo || undefined, clientId: crypto.randomUUID(), clientAt: new Date().toISOString() });
		if (ok) { x.edit = false; flash = L.clSent; }
	}

	// ── Melden: Krank, Urlaub, Mangel ──
	let repOpen = $state<null | 'krank' | 'urlaub' | 'defekt'>(null);
	let repDlg = $state(false);
	let rf = $state({ from: today, to: today, text: '', siteId: '' , photo: '' });
	function openReport(k: 'krank' | 'urlaub' | 'defekt') { rf = { from: today, to: today, text: '', siteId: todays[0]?.siteId ?? shifts[0]?.siteId ?? '', photo: '' }; flash = ''; repOpen = k; repDlg = true; }
	// ── Korrektur einer gebuchten Zeit beantragen ──
	let corrDlg = $state(false);
	let cf = $state({ entryId: '', label: '', start: '', end: '', breakMin: 0, reason: '' });
	function openCorr(x: { id: string; date: string; start: string; end: string; breakMin: number }) { cf = { entryId: x.id, label: `${dShort(x.date)} · ${x.start}–${x.end}`, start: x.start, end: x.end, breakMin: x.breakMin, reason: '' }; flash = ''; corrDlg = true; }
	async function submitCorr(e: SubmitEvent) {
		e.preventDefault();
		const r = await send('/api/me/correction', { entryId: cf.entryId, start: cf.start, end: cf.end, breakMin: Number(cf.breakMin) || 0, reason: cf.reason });
		if (r.offline) { flash = L.offlineQ; return; }
		if (!r.ok) { flash = r.error ?? ''; return; }
		corrDlg = false; flash = L.corrSent; await load();
	}
	const sitesList = $derived([...new Map(shifts.map((s) => [s.siteId, s])).values()]);
	async function submitReport(e: SubmitEvent) {
		e.preventDefault();
		const ok = repOpen === 'defekt'
			? await act('/api/me/defect', { siteId: rf.siteId, text: rf.text, photo: rf.photo || undefined })
			: await act('/api/me/request', { kind: repOpen, from: rf.from, to: rf.to < rf.from ? rf.from : rf.to });
		if (ok) { repDlg = false; flash = flash || L.sent; }
	}
	/** Foto verkleinern (längste Seite 1024 px, JPEG), damit es klein bleibt und schnell hochgeladen ist */
	async function onPhoto(e: Event) {
		const f = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!f) return;
		const bmp = await createImageBitmap(f);
		const scale = Math.min(1, 1024 / Math.max(bmp.width, bmp.height));
		const c = document.createElement('canvas'); c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
		c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
		let q = 0.72, url = c.toDataURL('image/jpeg', q);
		while (url.length > 380_000 && q > 0.3) { q -= 0.1; url = c.toDataURL('image/jpeg', q); }
		rf.photo = url;
	}

	async function swapAct(body: Record<string, unknown>, ok?: string) {
		flash = '';
		const r = await send('/api/me/swap', body);
		if (r.offline) { flash = L.offlineQ; return; }
		if (!r.ok) { flash = r.error ?? ''; return; }
		if (ok) flash = ok;
		await loadSwaps();
	}
	const swapStatus = (m: SwapMine) => ({ offen: L.swapStOffen, angenommen: L.swapStAngenommen, bestaetigt: L.swapStBestaetigt, abgelehnt: L.swapStAbgelehnt, zurueckgezogen: L.swapStZurueck } as Record<string, string>)[m.status] ?? m.status;
	/** Eigene künftige Einsätze, die noch nicht im Angebot sind */
	const givable = $derived(shifts.filter((s) => !mineSwaps.some((m) => m.role === 'abgeber' && m.siteId === s.siteId && m.date === s.date && ['offen', 'angenommen'].includes(m.status))));

	// Passwort ändern (Pflicht beim ersten Login nach Einmal-Code)
	let pw = $state({ current: '', next: '', next2: '' });
	let pwErr = $state('');
	async function changePw(e: SubmitEvent) {
		e.preventDefault();
		if (pw.next !== pw.next2) return (pwErr = 'Die beiden neuen Passwörter sind nicht gleich.');
		const r = await fetch('/api/password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ current: pw.current, next: pw.next }) });
		const j = await r.json().catch(() => ({}));
		if (!r.ok) return (pwErr = j.error ?? 'Nicht möglich.');
		pw = { current: '', next: '', next2: '' }; pwErr = '';
		await db.init(); await goto('/login');
	}
	async function logout() { await db.logout(); await goto('/login'); await db.init(); }
	const kindLabel = (k: string) => (k === 'krank' ? L.sick : L.vacation);
</script>

<svelte:head><title>Meine Einsätze · Putzbetrieb</title><meta name="robots" content="noindex" /></svelte:head>

<div class="mx-auto flex min-h-dvh max-w-xl flex-col gap-4 px-4 py-5">
	{#if phase === 'laden'}
		<p class="card p-6 text-center text-muted" role="status">…</p>
	{:else if db.session?.mustChange}
		<section class="card p-5" aria-labelledby="h-pw">
			<h1 id="h-pw" class="mb-1 flex items-center gap-2 text-lg font-semibold"><KeyRound size={18} /> Neues Passwort wählen</h1>
			<p class="mb-4 text-sm text-muted">Der Code vom Büro gilt nur für die erste Anmeldung. Wählen Sie jetzt ein eigenes Passwort (mindestens 8 Zeichen).</p>
			<form class="grid gap-3" onsubmit={changePw}>
				<div><label class="label" for="pw-c">Code vom Büro</label><input id="pw-c" type="password" class="input h-11 text-base" autocomplete="current-password" bind:value={pw.current} /></div>
				<div><label class="label" for="pw-n">Neues Passwort</label><input id="pw-n" type="password" class="input h-11 text-base" autocomplete="new-password" bind:value={pw.next} /></div>
				<div><label class="label" for="pw-n2">Wiederholen</label><input id="pw-n2" type="password" class="input h-11 text-base" autocomplete="new-password" bind:value={pw.next2} /></div>
				{#if pwErr}<p class="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">{pwErr}</p>{/if}
				<button class="btn btn-primary h-11 text-base">Passwort speichern</button>
			</form>
		</section>
	{:else if phase === 'fehler' || !v}
		<p class="card p-6 text-center text-lg">{errMsg || L.notFound}</p>
		<a href="/" class="btn">Zur Verwaltung</a>
	{:else if !v.modules.active}
		<section class="card p-6 text-center"><h1 class="card-title mb-1">{v.name}</h1><p class="text-muted">Die Mitarbeiter-App ist in Ihrem Betrieb zurzeit nicht eingeschaltet. Bitte wenden Sie sich an das Büro.</p>{#if v.officePhone}<a href="tel:{v.officePhone.replace(/\s/g, '')}" class="btn btn-primary mt-4 h-12"><Phone size={18} /> {L.call}</a>{/if}</section>
	{:else}
		<header class="hero flex items-center gap-4 p-5">
			<Avatar name={v.name} size={64} square={false} person ring />
			<div class="relative z-10 min-w-0 flex-1">
				<p class="text-sm text-white/70">{v.company}</p>
				<h1 class="break-words text-2xl font-semibold leading-tight"><span class="block text-base font-normal text-white/70">{L.hello},</span>{v.name.split(' ')[0]}</h1>
			</div>
			<button class="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="{L.notifTitle}{unread ? ` (${unread})` : ''}" onclick={() => (notifOpen = true)}><Bell size={22} />{#if unread}<span class="num absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-bold text-white">{unread}</span>{/if}</button>
		</header>

		<div class="flex flex-wrap gap-1.5" role="group" aria-label="Sprache / Language">
			{#each langs as l}<button class="btn btn-sm {lang === l.id ? 'border-accent bg-accent text-white' : ''}" aria-pressed={lang === l.id} onclick={() => setLang(l.id)}>{l.label}</button>{/each}
		</div>

		{#if flash}<p class="flex items-start gap-2 rounded-lg bg-info-soft px-4 py-3 text-sm text-info" role="status"><Info size={16} class="mt-0.5 shrink-0" /> {flash}</p>{/if}
		{#if queued}<p class="flex items-center gap-2 rounded-lg bg-warn-soft px-4 py-2.5 text-sm text-warn"><WifiOff size={15} /> {queued} × {L.offlineQ}</p>{/if}

		<!-- Stempeln -->
		{#if v.modules.zeiten}<section class="card overflow-hidden" aria-labelledby="h-punch">
			<h2 id="h-punch" class="border-b border-line px-5 py-3 text-sm font-bold tracking-wide text-accent uppercase">{L.punchTitle}</h2>
			{#if v?.geo}<p class="flex items-start gap-2 border-b border-line bg-info-soft/50 px-5 py-2.5 text-xs text-info"><MapPin size={14} class="mt-0.5 shrink-0" /> {L.geoHint}</p>{/if}
			{#if qr && v}
				{@const qs = todays.find((x) => x.siteId === qr!.s)}
				<div class="border-b border-line bg-accent-soft/50 px-5 py-4">
					<p class="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wide text-accent uppercase"><QrCode size={13} /> {L.qrFound}</p>
					{#if open && open.siteId === qr.s}
						<p class="mb-2 font-semibold">{open.site}</p>
						<button class="btn btn-danger h-16 w-full text-xl" onclick={() => (outOpen = true)}><Square size={22} /> {L.punchOut}</button>
					{:else if qs && !open}
						<p class="font-semibold">{qs.customer}</p><p class="num mb-3 text-sm text-muted">{qs.start}–{qs.end} · {qs.site}</p>
						<button class="btn btn-primary h-16 w-full text-xl" onclick={() => punchIn(qs, qr!.t)}><Play size={22} /> {L.punchIn}</button>
					{:else if open}
						<p class="text-sm text-muted">{open.site}</p>
					{:else}
						<p class="text-sm text-warn">{L.qrNotToday}</p>
					{/if}
					<button class="mt-2 text-xs text-muted underline" onclick={clearQr}>{L.cancel}</button>
				</div>
			{/if}
			{#if open}
				<div class="bg-success/10 px-5 py-5 text-center">
					<p class="text-sm font-semibold text-success">{L.running} {hm(open.startedAt)}</p>
					<p class="num my-1 text-5xl font-bold tracking-tight">{Math.floor(runningMin / 60)}:{String(runningMin % 60).padStart(2, '0')}</p>
					<p class="text-sm text-muted">{open.site}</p>
					<button class="btn btn-danger mt-4 h-16 w-full text-xl" onclick={() => (outOpen = true)}><Square size={22} /> {L.punchOut}</button>
				</div>
			{:else if todays.length && v.requireQr && !qr}
				<p class="flex items-start gap-2 px-5 py-5 text-sm text-muted"><QrCode size={18} class="mt-0.5 shrink-0" /> {L.scanQr}</p>
			{:else if todays.length}
				<ul class="divide-y divide-line">
					{#each todays as s}
						<li class="flex flex-col gap-3 px-5 py-4"><div class="min-w-0"><p class="font-semibold">{s.customer}</p><p class="num text-sm text-muted">{s.start}–{s.end} · {s.site}</p></div><button class="btn btn-primary h-14 w-full text-lg" onclick={() => punchIn(s)}><Play size={20} /> {L.punchIn}</button></li>
					{/each}
				</ul>
			{:else}
				<p class="px-5 py-6 text-center text-muted">{L.noShiftToday}</p>
			{/if}
		</section>{/if}

		{#each v.modules.nachweis ? todays.filter((x) => x.lv && x.lv.length) : [] as t (t.siteId)}
			{@const x = clOf(t.siteId)}
			<section class="card overflow-hidden" aria-labelledby="h-cl-{t.siteId}">
				<h2 id="h-cl-{t.siteId}" class="border-b border-line px-5 py-3 text-sm font-bold tracking-wide text-accent uppercase">{L.clTitle} · {t.site}</h2>
				{#if t.checklistSent && !x.edit}
					<div class="flex items-center justify-between gap-3 px-5 py-4"><p class="flex items-center gap-2 font-semibold text-success"><CircleCheck size={18} /> {L.clSent}</p><button class="btn btn-sm" onclick={() => (x.edit = true)}>{L.clEdit}</button></div>
				{:else}
					<div class="px-5 py-4">
						<p class="mb-2 text-sm text-muted">{L.clHint}</p>
						{#if t.lv!.some((i) => i.due)}
							<ul class="grid gap-1.5">{#each t.lv!.filter((i) => i.due) as it (it.id)}<li><label class="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-line px-3 py-2 {x.done.includes(it.id) ? 'border-accent bg-accent-soft' : ''}"><input type="checkbox" class="size-6 accent-[var(--accent)]" checked={x.done.includes(it.id)} onchange={(e) => (x.done = e.currentTarget.checked ? [...x.done, it.id] : x.done.filter((y) => y !== it.id))} /><span class="text-base"><span class="font-semibold">{it.room || '·'}</span> {it.task}</span></label></li>{/each}</ul>
						{:else}<p class="text-sm text-muted">{L.clNoDue}</p>{/if}
						{#if t.lv!.some((i) => !i.due)}
							<details class="mt-3"><summary class="cursor-pointer text-sm font-semibold text-muted">{L.clOther}</summary>
								<ul class="mt-2 grid gap-1.5">{#each t.lv!.filter((i) => !i.due) as it (it.id)}<li><label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-line px-3 py-2"><input type="checkbox" class="size-5 accent-[var(--accent)]" checked={x.done.includes(it.id)} onchange={(e) => (x.done = e.currentTarget.checked ? [...x.done, it.id] : x.done.filter((y) => y !== it.id))} /><span class="text-sm"><span class="font-semibold">{it.room || '·'}</span> {it.task}</span></label></li>{/each}</ul>
							</details>
						{/if}
						<label class="label mt-3" for="cl-n-{t.siteId}">{L.clNote}</label>
						<textarea id="cl-n-{t.siteId}" class="input text-base" rows="2" maxlength="300" bind:value={x.note}></textarea>
						<div class="mt-2"><label class="btn h-12 w-full cursor-pointer"><Camera size={18} /> {L.photo}<input type="file" accept="image/*" capture="environment" class="sr-only" onchange={(e) => clPhoto(t.siteId, e)} /></label>{#if x.photo}<img src={x.photo} alt="" class="mt-2 h-24 rounded-lg object-cover" />{/if}</div>
						<button class="btn btn-primary mt-3 h-14 w-full text-lg" onclick={() => clSend(t.siteId)}><Send size={18} /> {L.clSend}</button>
					</div>
				{/if}
			</section>
		{/each}

		<section class="card overflow-hidden" aria-labelledby="h-next">
			<h2 id="h-next" class="border-b border-line px-5 py-3 text-sm font-bold tracking-wide text-accent uppercase">{L.next}</h2>
			{#if shifts.length === 0}
				<p class="px-5 py-8 text-center text-lg text-muted">{L.nothing}</p>
			{:else}
				{@const n = shifts[0]}
				<div class="bg-accent-soft/50 px-5 py-4">
					<p class="text-sm font-semibold capitalize">{dayName(n.date)}</p>
					<p class="num text-4xl font-bold tracking-tight">{n.start}<span class="text-xl font-semibold text-muted">&nbsp;{L.to}&nbsp;{n.end}</span></p>
					<p class="mt-2 text-lg font-semibold">{n.customer}</p>
					<p class="text-muted">{n.site}</p>
					<p class="mt-1 flex items-start gap-1.5 text-sm"><MapPin size={15} class="mt-0.5 shrink-0" />{n.street}</p>
					{#if n.note || n.chemicals}<div class="mt-3 rounded-lg bg-surface/70 p-3 text-sm"><p class="mb-1 flex items-center gap-1.5 text-xs font-bold tracking-wide text-muted uppercase"><Info size={12} /> {L.siteInfo}</p>{#if n.note}<p>{n.note}</p>{/if}{#if n.chemicals}<p class="mt-1"><strong>{L.means}:</strong> {n.chemicals}</p>{/if}</div>{/if}
				</div>
				{#if shifts.length > 1}
					<h3 class="border-t border-line px-5 pt-3 text-xs font-bold tracking-wide text-muted uppercase">{L.week}</h3>
					<ul class="divide-y divide-line">
						{#each shifts.slice(1) as s}
							<li class="px-5 py-3"><p class="flex flex-wrap items-baseline gap-x-2"><span class="text-sm font-semibold capitalize">{dayName(s.date)}</span><span class="num text-sm text-muted">{s.start}–{s.end}</span></p><p class="font-medium">{s.customer}</p><p class="text-sm text-muted">{s.site}</p></li>
						{/each}
					</ul>
				{/if}
			{/if}
		</section>

		<!-- Schichttausch -->
		{#if v.modules.einsatz}<section class="card p-5" aria-labelledby="h-swap">
			<h2 id="h-swap" class="mb-1 flex items-center gap-2 text-sm font-bold tracking-wide text-muted uppercase"><ArrowLeftRight size={15} /> {L.swapTitle}</h2>
			<p class="mb-3 text-xs text-muted">{L.swapHint}</p>
			{#if offers.length}
				<h3 class="mb-1 text-xs font-bold tracking-wide text-accent uppercase">{L.swapOffers}</h3>
				<ul class="mb-4 divide-y divide-line">{#each offers as o (o.id)}<li class="flex items-center gap-3 py-2.5"><div class="min-w-0 flex-1"><p class="text-sm font-semibold capitalize">{dayName(o.date)} <span class="num font-normal text-muted">{o.start}–{o.end}</span></p><p class="truncate text-sm">{o.customer}</p><p class="truncate text-xs text-muted">{o.site} · {L.swapBy} {o.by}</p></div><button class="btn btn-primary h-11 px-4" onclick={() => swapAct({ action: 'take', id: o.id }, L.swapTook)}>{L.swapTakeBtn}</button></li>{/each}</ul>
			{:else}<p class="mb-4 text-sm text-muted">{L.swapNoOffers}</p>{/if}
			{#if mineSwaps.length}
				<h3 class="mb-1 text-xs font-bold tracking-wide text-muted uppercase">{L.swapMine}</h3>
				<ul class="mb-4 divide-y divide-line">{#each mineSwaps as m (m.id)}<li class="flex items-center gap-3 py-2.5"><div class="min-w-0 flex-1"><p class="text-sm font-medium capitalize">{dayName(m.date)} <span class="num font-normal text-muted">{m.start}–{m.end}</span></p><p class="truncate text-xs text-muted">{m.customer}{m.other ? ` · ${m.role === 'abgeber' ? '→' : L.swapBy} ${m.other}` : ''}</p><p class="text-xs font-semibold {m.status === 'bestaetigt' ? 'text-success' : m.status === 'abgelehnt' || m.status === 'zurueckgezogen' ? 'text-muted' : 'text-warn'}">{swapStatus(m)}</p></div>{#if m.role === 'abgeber' && (m.status === 'offen' || m.status === 'angenommen')}<button class="btn btn-sm" onclick={() => swapAct({ action: 'withdraw', id: m.id })}>{L.swapWithdraw}</button>{/if}</li>{/each}</ul>
			{/if}
			{#if givable.length}
				<h3 class="mb-1 text-xs font-bold tracking-wide text-muted uppercase">{L.swapOwn}</h3>
				<ul class="divide-y divide-line">{#each givable as s (s.siteId + s.date)}<li class="flex items-center gap-3 py-2.5"><div class="min-w-0 flex-1"><p class="text-sm font-medium capitalize">{dayName(s.date)} <span class="num font-normal text-muted">{s.start}–{s.end}</span></p><p class="truncate text-xs text-muted">{s.customer}</p></div><button class="btn btn-sm" onclick={() => { if (confirm(L.swapConfirm)) swapAct({ action: 'offer', siteId: s.siteId, date: s.date }, L.swapGave); }}>{L.swapGive}</button></li>{/each}</ul>
			{/if}
		</section>{/if}

		<!-- Melden -->
		<section class="card p-5" aria-labelledby="h-rep">
			<h2 id="h-rep" class="mb-3 text-sm font-bold tracking-wide text-muted uppercase">{L.report}</h2>
			<div class="grid gap-2">
				<button class="btn h-14 justify-start px-4 text-base" onclick={() => openReport('krank')}><Thermometer size={20} class="text-danger" /> {L.sickBtn}</button>
				<button class="btn h-14 justify-start px-4 text-base" onclick={() => openReport('urlaub')}><Palmtree size={20} class="text-info" /> {L.vacBtn}</button>
{#if v.modules.maengel}				<button class="btn h-14 justify-start px-4 text-base" onclick={() => openReport('defekt')} disabled={!sitesList.length}><TriangleAlert size={20} class="text-warn" /> {L.defectBtn}</button>{/if}
			</div>
			{#if v.requests.length}
				<h3 class="mt-4 mb-1 text-xs font-bold tracking-wide text-muted uppercase">{L.myReports}</h3>
				<ul class="divide-y divide-line text-sm">{#each v.requests as r}<li class="flex items-center justify-between gap-3 py-2"><span class="min-w-0 truncate">{r.kind === 'correction' ? `${L.corrBtn}: ${r.label}` : r.kind === 'absence' ? `${kindLabel(r.label)} ${dShort(r.from!)}${r.to !== r.from ? ' – ' + dShort(r.to!) : ''}` : r.label}</span><span class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold {r.status === 'genehmigt' ? 'bg-success/15 text-success' : r.status === 'abgelehnt' ? 'bg-danger-soft text-danger' : 'bg-subtle'}">{r.status === 'offen' ? L.open : r.status === 'genehmigt' ? L.corrOk : r.status === 'abgelehnt' ? L.corrNo : L.taken}</span></li>{#if r.reply}<li class="pb-2 text-xs text-muted">{r.reply}</li>{/if}{/each}</ul>
			{/if}
		</section>

		{#if v.modules.zeiten}<section class="card p-5" aria-labelledby="h-hours">
			<h2 id="h-hours" class="mb-3 flex items-center gap-2 text-sm font-bold tracking-wide text-muted uppercase"><Clock size={15} /> {L.month}</h2>
			<div class="flex items-end justify-between"><p class="num text-4xl font-bold">{fmt(v.hours)} <span class="text-lg font-semibold text-muted">{L.hours}</span></p><p class="text-right text-sm text-muted">{L.target} {fmt(v.soll)} {L.hours}<br />{L.diff}: <strong class="num text-fg">{v.hours - v.soll > 0 ? '+' : ''}{fmt(v.hours - v.soll)}</strong></p></div>
			<div class="mt-3 h-3 overflow-hidden rounded-full bg-subtle" role="img" aria-label="{fmt(v.hours)} / {fmt(v.soll)}"><div class="h-full rounded-full bg-accent transition-all" style="width:{Math.min(100, v.soll ? (v.hours / v.soll) * 100 : 0)}%"></div></div>
			{#if v.minijob}
				<p class="mt-4 text-sm font-medium">{L.limit}: <span class="num">{Math.round((v.minijob.earnedCents / v.minijob.limitCents) * 100)} %</span></p>
				<div class="mt-1 h-3 overflow-hidden rounded-full bg-subtle"><div class="h-full rounded-full {v.minijob.earnedCents / v.minijob.limitCents > 0.9 ? 'bg-danger' : 'bg-success'}" style="width:{Math.min(100, (v.minijob.earnedCents / v.minijob.limitCents) * 100)}%"></div></div>
			{/if}
			{#if v.times.length}
				<h3 class="mt-5 mb-1 text-xs font-bold tracking-wide text-muted uppercase">{L.myTimes}</h3>
				<ul class="divide-y divide-line text-sm">
					{#each v.times.slice(0, 12) as x (x.id)}
						<li class="flex items-center justify-between gap-3 py-2 {x.voided ? 'opacity-50' : ''}"><div class="min-w-0"><p class="num font-medium {x.voided ? 'line-through' : ''}">{dShort(x.date)} · {x.start}–{x.end}{#if x.breakMin} <span class="text-muted">(−{x.breakMin} {L.min})</span>{/if}</p>{#if x.pending || x.edited || x.voided || x.offline}<p class="text-xs text-muted">{[x.pending ? L.pendingL : '', x.edited ? L.changed : '', x.voided ? L.voidedL : '', x.offline ? '⚡' : ''].filter(Boolean).join(' · ')}</p>{/if}{#if x.history.length}<p class="text-xs text-muted">{x.history.at(-1)}</p>{/if}{#if !x.voided}<button class="mt-1 text-xs font-semibold text-accent underline" onclick={() => openCorr(x)}>{L.corrBtn}</button>{/if}</div><span class="num shrink-0 font-semibold">{fmt(x.hours)} {L.hours}</span></li>
					{/each}
				</ul>
			{/if}
		</section>{/if}

		<section class="card p-5" aria-labelledby="h-leave">
			<h2 id="h-leave" class="mb-3 flex items-center gap-2 text-sm font-bold tracking-wide text-muted uppercase"><CalendarOff size={15} /> {L.leave}</h2>
			{#if v.leave.length === 0}<p class="text-muted">{L.noLeave}</p>{:else}
				<ul class="flex flex-col gap-2">{#each v.leave as a}<li class="flex items-center justify-between gap-3"><span class="num font-medium">{dShort(a.from)}{a.to !== a.from ? ` – ${dShort(a.to)}` : ''}</span><span class="rounded-full px-3 py-1 text-sm font-semibold {a.kind === 'krank' ? 'bg-danger-soft text-danger' : 'bg-info-soft text-info'}">{a.kind === 'krank' ? L.sick : L.vacation}{a.status === 'beantragt' ? ` (${L.requested})` : ''}</span></li>{/each}</ul>
			{/if}
			<p class="mt-4 flex items-center gap-2 border-t border-line pt-3 text-sm"><ShieldCheck size={16} class={trainingOk ? 'text-success' : 'text-warn'} /> {L.training}: <strong>{trainingOk ? L.trainOk : L.trainDue}</strong></p>
		</section>

		<a href="tel:{v.officePhone.replace(/\s/g, '')}" class="btn btn-primary h-14 text-lg"><Phone size={20} /> {L.call}</a>
		<button class="btn" onclick={logout}><LogOut size={15} /> Abmelden</button>
		<p class="flex items-start justify-center gap-1.5 text-center text-xs text-muted"><Eye size={13} class="mt-0.5 shrink-0" /> {L.readOnly}{lang !== 'de' ? ` ${L.draft}` : ''}</p>
	{/if}
</div>

<Dialog bind:open={outOpen} title={L.confirmOut} width={400}>
	{#snippet children()}
		<p class="mb-2 text-sm font-medium">{L.pause}</p>
		<div class="grid grid-cols-5 gap-2" role="radiogroup" aria-label={L.pause}>{#each [0, 15, 30, 45, 60] as m}<button type="button" role="radio" aria-checked={breakMin === m} class="btn h-12 {breakMin === m ? 'border-accent bg-accent text-white' : ''}" onclick={() => (breakMin = m)}>{m}</button>{/each}</div>
		<p class="mt-1 text-center text-xs text-muted">{L.min}</p>
	{/snippet}
	{#snippet footer()}<button class="btn" onclick={() => (outOpen = false)}>{L.cancel}</button><button class="btn btn-danger" onclick={punchOut}>{L.punchOut}</button>{/snippet}
</Dialog>

<Dialog bind:open={repDlg} title={repOpen === 'krank' ? L.sickBtn : repOpen === 'urlaub' ? L.vacBtn : L.defectBtn} description={repOpen === 'krank' ? L.sickHint : ''} width={440}>
	{#snippet children()}
		<form id="rep-form" class="grid gap-3" onsubmit={submitReport}>
			{#if repOpen === 'defekt'}
				<div><label class="label" for="rf-s">{L.objectL}</label><select id="rf-s" class="input h-11 text-base" bind:value={rf.siteId}>{#each sitesList as s}<option value={s.siteId}>{s.customer} · {s.site}</option>{/each}</select></div>
				<div><label class="label" for="rf-t">{L.describe}</label><textarea id="rf-t" class="input text-base" rows="3" maxlength="1000" bind:value={rf.text}></textarea></div>
				<div><label class="btn h-12 w-full cursor-pointer"><Camera size={18} /> {L.photo}<input type="file" accept="image/*" capture="environment" class="sr-only" onchange={onPhoto} /></label>{#if rf.photo}<img src={rf.photo} alt="" class="mt-2 max-h-40 rounded-lg border border-line" />{/if}</div>
			{:else}
				<div class="grid grid-cols-2 gap-3"><div><label class="label" for="rf-f">{L.fromD}</label><input id="rf-f" type="date" class="input h-11 text-base" bind:value={rf.from} /></div><div><label class="label" for="rf-e">{L.toD}</label><input id="rf-e" type="date" class="input h-11 text-base" min={rf.from} bind:value={rf.to} /></div></div>
			{/if}
			{#if flash}<p class="text-sm text-danger" role="alert">{flash}</p>{/if}
		</form>
	{/snippet}
	{#snippet footer()}<button class="btn" type="button" onclick={() => (repDlg = false)}>{L.cancel}</button><button class="btn btn-primary" type="submit" form="rep-form"><Send size={14} /> {L.send}</button>{/snippet}
</Dialog>

<Dialog bind:open={corrDlg} title={L.corrBtn} description="{cf.label}. {L.corrHint}" width={440}>
	{#snippet children()}
		<form id="corr-form" class="grid gap-3" onsubmit={submitCorr}>
			<div class="grid grid-cols-3 gap-3"><div><label class="label" for="cf-s">{L.corrFrom}</label><input id="cf-s" type="time" class="input h-11 text-base" bind:value={cf.start} required /></div><div><label class="label" for="cf-e">{L.corrTo}</label><input id="cf-e" type="time" class="input h-11 text-base" bind:value={cf.end} required /></div><div><label class="label" for="cf-b">{L.pause} ({L.min})</label><input id="cf-b" type="number" min="0" max="120" step="5" class="input h-11 text-base" bind:value={cf.breakMin} /></div></div>
			<div><label class="label" for="cf-r">{L.corrWhy}</label><textarea id="cf-r" class="input text-base" rows="3" maxlength="300" required bind:value={cf.reason}></textarea></div>
			{#if flash}<p class="text-sm text-danger" role="alert">{flash}</p>{/if}
		</form>
	{/snippet}
	{#snippet footer()}<button class="btn" type="button" onclick={() => (corrDlg = false)}>{L.cancel}</button><button class="btn btn-primary" type="submit" form="corr-form"><Send size={14} /> {L.send}</button>{/snippet}
</Dialog>

<Dialog bind:open={notifOpen} title={L.notifTitle} width={440}>
	{#snippet children()}
		{#if notifs.length === 0}<p class="py-6 text-center text-muted">{L.notifNone}</p>{:else}
			<ul class="divide-y divide-line">{#each notifs as n (n.id)}<li class="flex items-start gap-3 py-3 {n.read ? 'opacity-60' : ''}"><span class="mt-1.5 size-2.5 shrink-0 rounded-full {n.read ? 'bg-line-strong' : 'bg-accent'}"></span><p class="text-sm">{fmtN(n)}</p></li>{/each}</ul>
		{/if}
		{#if permission === 'default'}<button class="btn mt-3 w-full" onclick={allowNotif}><Bell size={15} /> {L.notifAllow}</button>{:else if permission === 'granted'}<p class="mt-3 text-xs text-muted">{L.notifOn}</p>{/if}
	{/snippet}
	{#snippet footer()}<button class="btn" onclick={markRead} disabled={!unread}>{L.notifAllRead}</button><button class="btn btn-primary" onclick={() => (notifOpen = false)}>OK</button>{/snippet}
</Dialog>
