<script lang="ts">
	import { goto } from '$app/navigation';
	import { db } from '#lib/db.svelte.ts';
	import { addDays } from '#lib/calc.ts';
	import { todayKey, dayDiff } from '#lib/format.ts';
	import { langs, t, type Lang } from '#lib/staffI18n.ts';
	import type { StaffView } from '#lib/staffView.ts';
	import Avatar from '#lib/components/Avatar.svelte';
	import { Phone, MapPin, Clock, CalendarOff, ShieldCheck, Eye, LogOut, KeyRound } from '@lucide/svelte';

	const today = todayKey();
	let v = $state<StaffView | null>(null);
	let phase = $state<'laden' | 'ok' | 'fehler'>('laden');
	let errMsg = $state('');
	async function load() {
		const r = await fetch('/api/me/view');
		if (r.status === 403) { phase = 'ok'; return; } // Passwortwechsel nötig
		if (!r.ok) { errMsg = (await r.json().catch(() => ({}))).error ?? ''; phase = 'fehler'; return; }
		v = await r.json(); phase = 'ok';
	}
	$effect(() => { if (db.ready && db.session) load(); });

	let lang = $state<Lang>('de');
	$effect(() => { try { const x = localStorage.getItem('resch-staff-lang') as Lang | null; if (x && x in t) lang = x; } catch { /* aus */ } });
	function setLang(l: Lang) { lang = l; try { localStorage.setItem('resch-staff-lang', l); } catch { /* ignorieren */ } }
	const L = $derived(t[lang]);
	const locale = $derived(langs.find((l) => l.id === lang)!.locale);
	const dayName = (d: string) => (d === today ? L.today : d === addDays(today, 1) ? L.tomorrow : new Date(d + 'T12:00:00Z').toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'numeric', timeZone: 'UTC' }));
	const shifts = $derived(v?.shifts ?? []);
	const trainingOk = $derived(!!v?.instructedOn);
	const fmt = (n: number) => n.toLocaleString(locale, { maximumFractionDigits: 1 });
	const dShort = (d: string) => new Date(d + 'T12:00:00Z').toLocaleDateString(locale, { day: 'numeric', month: 'numeric', timeZone: 'UTC' });

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
</script>

<svelte:head><title>Meine Einsätze · Resch</title><meta name="robots" content="noindex" /></svelte:head>

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
	{:else}
		<header class="hero flex items-center gap-4 p-5">
			<Avatar name={v.name} size={64} square={false} person ring />
			<div class="relative z-10 min-w-0">
				<p class="text-sm text-white/70">{v.company}</p>
				<h1 class="truncate text-2xl font-semibold">{L.hello}, {v.name.split(' ')[0]}</h1>
			</div>
		</header>

		<div class="flex flex-wrap gap-1.5" role="group" aria-label="Sprache / Language">
			{#each langs as l}<button class="btn btn-sm {lang === l.id ? 'border-accent bg-accent text-white' : ''}" aria-pressed={lang === l.id} onclick={() => setLang(l.id)}>{l.label}</button>{/each}
		</div>

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

		<section class="card p-5" aria-labelledby="h-hours">
			<h2 id="h-hours" class="mb-3 flex items-center gap-2 text-sm font-bold tracking-wide text-muted uppercase"><Clock size={15} /> {L.month}</h2>
			<div class="flex items-end justify-between"><p class="num text-4xl font-bold">{fmt(v.hours)} <span class="text-lg font-semibold text-muted">{L.hours}</span></p><p class="text-right text-sm text-muted">{L.target} {fmt(v.soll)} {L.hours}<br />{L.diff}: <strong class="num text-fg">{v.hours - v.soll > 0 ? '+' : ''}{fmt(v.hours - v.soll)}</strong></p></div>
			<div class="mt-3 h-3 overflow-hidden rounded-full bg-subtle" role="img" aria-label="{fmt(v.hours)} / {fmt(v.soll)}"><div class="h-full rounded-full bg-accent transition-all" style="width:{Math.min(100, v.soll ? (v.hours / v.soll) * 100 : 0)}%"></div></div>
			{#if v.minijob}
				<p class="mt-4 text-sm font-medium">{L.limit}: <span class="num">{Math.round((v.minijob.earnedCents / v.minijob.limitCents) * 100)} %</span></p>
				<div class="mt-1 h-3 overflow-hidden rounded-full bg-subtle"><div class="h-full rounded-full {v.minijob.earnedCents / v.minijob.limitCents > 0.9 ? 'bg-danger' : 'bg-success'}" style="width:{Math.min(100, (v.minijob.earnedCents / v.minijob.limitCents) * 100)}%"></div></div>
			{/if}
		</section>

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
