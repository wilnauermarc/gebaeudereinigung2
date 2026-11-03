<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { db } from '#lib/db.svelte.ts';
	import Avatar from '#lib/components/Avatar.svelte';
	import { ui, roleLabels, applyPalette } from '#lib/ui.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import Toasts from '#lib/components/Toasts.svelte';
	import CommandPalette from '#lib/components/CommandPalette.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import { initials, todayKey } from '#lib/format.ts';
	import { caseStatus } from '#lib/cases.ts';
	import {
		LayoutDashboard, FileCode2, Users, FileText, Search, Menu, Moon, Sun, Palette, ClipboardList,
		Building2, Receipt, CalendarDays, RotateCcw, LogOut, Check, Calculator, ScrollText, Clock, MessageSquareWarning, UsersRound, KeyRound, Bell, ChevronDown, FolderOpen, Settings, Map, CalendarClock, Workflow, ListTodo, LineChart, ClipboardCheck, Package, ListChecks, FileCheck2, Gauge
	} from '@lucide/svelte';

	let { children } = $props();

	let paletteOpen = $state(false);
	let menuOpen = $state(false);
	let resetOpen = $state(false);
	let dark = $state(false);
	let online = $state(true);
	$effect(() => {
		online = navigator.onLine;
		const on = () => (online = true), off = () => (online = false);
		window.addEventListener('online', on); window.addEventListener('offline', off);
		return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
	});

	$effect(() => {
		dark = document.documentElement.dataset.theme === 'dark';
	});
	function toggleTheme() {
		dark = !dark;
		document.documentElement.dataset.theme = dark ? 'dark' : 'light';
		try { localStorage.setItem('resch-theme', dark ? 'dark' : 'light'); } catch { /* ignorieren */ }
		applyPalette(ui.palette, ui.custom);
	}

	const groups = [
		{ title: null, items: [
			{ href: '/', label: 'Heute', icon: LayoutDashboard, key: 'h' },
			{ href: '/cockpit', label: 'Cockpit', icon: Gauge, key: 'p' },
			{ href: '/aufgaben', label: 'Aufgaben', icon: ListChecks, key: 'u' },
			{ href: '/fristen', label: 'Fristen', icon: CalendarClock, key: 'f' }
		] },
		{ title: 'Vertrieb', items: [
			{ href: '/vorgaenge', label: 'Vorgänge', icon: Workflow, key: 'w' },
			{ href: '/kunden', label: 'Kunden', icon: Users, key: 'k' },
			{ href: '/angebote', label: 'Angebote', icon: FileText, key: 'a' },
			{ href: '/kalkulator', label: 'Kalkulator', icon: Calculator, key: 'c' },
			{ href: '/vertraege', label: 'Verträge', icon: ScrollText, key: 'v' },
			{ href: '/ausschreibung', label: 'Bieter-Mappe', icon: FolderOpen, key: 'i' },
			{ href: '/projektzeitliste', label: 'Projektzeitliste', icon: ListTodo, key: 'j' },
			{ href: '/rechnungen', label: 'Rechnungen', icon: Receipt, key: 'r' },
			{ href: '/e-rechnung', label: 'E-Rechnung', icon: FileCode2, key: 'y' }
		] },
		{ title: 'Betrieb', items: [
			{ href: '/einsatzplan', label: 'Einsatzplan', icon: CalendarDays, key: 'e' },
			{ href: '/karte', label: 'Karte', icon: Map, key: 'x' },
			{ href: '/zeiten', label: 'Zeiten', icon: Clock, key: 'z' },
			{ href: '/begehungen', label: 'Begehungen', icon: ClipboardCheck, key: 'b' },
			{ href: '/maengel', label: 'Mängel', icon: MessageSquareWarning, key: 'm' }
		] },
		{ title: 'Verwaltung', items: [
			{ href: '/team', label: 'Team', icon: UsersRound, key: 't' },
			{ href: '/schluessel', label: 'Schlüssel', icon: KeyRound, key: 's' },
			{ href: '/material', label: 'Material', icon: Package, key: 'l' },
			{ href: '/nachweise', label: 'Nachweise', icon: FileCheck2, key: 'n' },
			{ href: '/controlling', label: 'Controlling', icon: LineChart, key: 'o' }
		] }
	];
	// Gruppen einklappbar, Auswahl bleibt erhalten; „Verwaltung“ ist anfangs zu
	let folded = $state<Record<string, boolean>>({ Verwaltung: true });
	$effect(() => {
		try { const s = localStorage.getItem('resch-nav-folded'); if (s) folded = JSON.parse(s); } catch { /* Standard */ }
	});
	function toggleGroup(t: string) {
		folded[t] = !folded[t];
		try { localStorage.setItem('resch-nav-folded', JSON.stringify(folded)); } catch { /* ignorieren */ }
	}
	const visibleGroups = $derived(groups.map((g) => ({ ...g, items: g.items.filter((n) => ui.allows(n.href)) })).filter((g) => g.items.length));
	const nav = $derived(visibleGroups.flatMap((g) => g.items));
	/** Zähler an Navigationspunkten: Dinge, die Aufmerksamkeit brauchen */
	function badge(href: string): number {
		const today = todayKey();
		if (href === '/maengel') return db.data.defects.filter((d) => d.status !== 'erledigt' && d.dueOn < today).length;
		if (href === '/vorgaenge') return db.data.cases.filter((c) => !caseStatus(db.data, c).closed).length;
		if (href === '/aufgaben') return db.data.tasks.filter((t) => !t.done && t.dueOn && t.dueOn < today).length;
		if (href === '/rechnungen') return db.data.invoices.filter((i) => !i.paidAt && i.dueOn < today).length;
		if (href === '/angebote') return db.data.quotes.filter((q) => q.status === 'versendet' && q.followupOn && q.followupOn < today).length;
		return 0;
	}
	const attention = $derived(['/maengel', '/angebote', '/rechnungen', '/aufgaben'].reduce((n, h) => n + badge(h), 0));
	const isActive = (href: string) => (href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href));

	// Tastatur: ⌘K / Strg+K Suche, „g“ dann Buchstabe navigiert
	let gPending = false;
	function onKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			paletteOpen = !paletteOpen;
			return;
		}
		const t = e.target as HTMLElement;
		if (t.closest('input, textarea, select, dialog, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
		if (gPending) {
			gPending = false;
			const hit = nav.find((n) => n.key === e.key.toLowerCase());
			if (hit) { e.preventDefault(); goto(hit.href); }
		} else if (e.key === 'g') {
			gPending = true;
			setTimeout(() => (gPending = false), 1000);
		} else if (e.key === '/') {
			e.preventDefault();
			const s = document.querySelector<HTMLInputElement>('[data-search]');
			s ? s.focus() : (paletteOpen = true);
		}
	}

	$effect(() => {
		page.url.pathname;
		menuOpen = false;
	});

	// ── Anmeldung: ohne Sitzung nur /login; Mitarbeitende kommen ausschließlich auf /mitarbeiter ──
	$effect(() => { db.init(); });
	$effect(() => { applyPalette(ui.palette, ui.custom); });
	const path = $derived(page.url.pathname);
	const bare = $derived(path.startsWith('/login') || path.startsWith('/mitarbeiter'));
	$effect(() => {
		if (!db.ready) return;
		const u = db.session;
		if (!u) { if (!path.startsWith('/login')) goto('/login'); return; }
		if (u.role === 'mitarbeiter') { if (!path.startsWith('/mitarbeiter')) goto('/mitarbeiter'); return; }
		if (path.startsWith('/login')) goto('/');
	});
	async function logout() { await db.logout(); goto('/login'); await db.init(); }
	const savedLabel = $derived(
		db.conflict
			? 'Konflikt: bitte Seite neu laden'
			: db.storageError
				? 'Speichern fehlgeschlagen'
				: db.dirty
					? 'Wird gespeichert …'
					: db.savedAt
						? `Gespeichert · ${db.savedAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' })}`
						: 'Alles gespeichert'
	);
	// Beim Schließen warnen, solange Änderungen noch nicht auf dem Server liegen
	function beforeUnload(e: BeforeUnloadEvent) { if (db.dirty || db.storageError || db.conflict) { e.preventDefault(); e.returnValue = ''; } }

</script>

<svelte:window onkeydown={onKeydown} onbeforeunload={beforeUnload} />
<svelte:head><title>Resch Business Manager</title></svelte:head>

{#if bare}
	{@render children()}
	<Toasts />
{:else if !db.ready || !db.session || db.session.role === 'mitarbeiter'}
	<div class="grid min-h-dvh place-items-center text-sm text-muted" role="status">Wird geladen …</div>
{:else if path.startsWith('/portal')}
	{@render children()}
	<Toasts />
{:else}
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-1.5">Zum Inhalt springen</a>

<div class="flex min-h-dvh">
	{#if menuOpen}
		<button class="fixed inset-0 z-30 bg-black/40 lg:hidden" aria-label="Menü schließen" onclick={() => (menuOpen = false)}></button>
	{/if}

	<aside
		class="fixed inset-y-0 left-0 z-40 flex w-[256px] flex-col bg-side text-side-fg transition-transform lg:translate-x-0 {menuOpen ? '' : '-translate-x-full'}"
		aria-label="Hauptnavigation"
	>
		<div class="flex h-16 items-center gap-3 bg-accent px-5 text-white">
			<div class="grid size-9 place-items-center rounded-lg bg-white/95 text-base font-extrabold text-accent shadow-sm">R</div>
			<p class="text-[1.05rem] font-extrabold tracking-[0.12em] uppercase">Resch</p>
		</div>

		<div class="flex items-center gap-3 px-5 pt-5 pb-4">
			<div class="shrink-0 rounded-full ring-2 ring-white/20"><Avatar name={db.me} size={46} square={false} person /></div>
			<div class="min-w-0">
			<p class="truncate text-[0.95rem] font-semibold">{db.me}</p>
			<p class="truncate text-xs text-side-muted">{roleLabels[ui.role]}{ui.basic ? ' · Basis' : ''}</p>
			</div>
		</div>

		<nav class="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-4 pb-3" aria-label="Bereiche">
			{#each visibleGroups as g}
				{@const hasActive = g.items.some((n) => isActive(n.href))}
				{@const closed = !!g.title && !!folded[g.title] && !hasActive}
				{#if g.title}
					<button class="mt-4 mb-1 flex items-center justify-between rounded px-3 text-left text-[0.7rem] font-semibold tracking-wider text-side-muted uppercase hover:text-side-fg" aria-expanded={!closed} onclick={() => toggleGroup(g.title!)}>
						{g.title}<ChevronDown size={13} class="transition-transform {closed ? '-rotate-90' : ''}" />
					</button>
				{/if}
				{#if !closed}
					{#each g.items as n}
						<a
							href={n.href}
							aria-current={isActive(n.href) ? 'page' : undefined}
							class="relative flex h-9 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors {isActive(n.href) ? 'bg-side-active text-side-fg' : 'text-side-muted hover:bg-side-hover hover:text-side-fg'}"
						>
							{#if isActive(n.href)}<span class="absolute top-2 bottom-2 -left-4 w-1 rounded-r bg-accent"></span>{/if}
							<n.icon size={17} /> <span class="flex-1">{n.label}</span>
							{#if badge(n.href)}<span class="num rounded-full px-1.5 text-[0.72rem] font-semibold text-white {n.href === '/vorgaenge' ? 'bg-white/25' : 'bg-danger'}">{badge(n.href)}</span>{/if}
						</a>
					{/each}
				{/if}
			{/each}
		</nav>

		<div class="flex flex-col gap-0.5 border-t border-side-line p-4">
			<a href="/einstellungen" aria-current={isActive('/einstellungen') ? 'page' : undefined} class="flex h-9 items-center gap-3 rounded-lg px-3 text-sm {isActive('/einstellungen') ? 'bg-side-active' : 'text-side-muted hover:bg-side-hover hover:text-side-fg'}"><Settings size={17} /> Einstellungen</a>
			<a href="/designsystem" aria-current={isActive('/designsystem') ? 'page' : undefined} class="flex h-9 items-center gap-3 rounded-lg px-3 text-sm {isActive('/designsystem') ? 'bg-side-active' : 'text-side-muted hover:bg-side-hover hover:text-side-fg'}">
				<Palette size={17} /> Designsystem
			</a>
			<button class="flex h-9 items-center gap-3 rounded-lg px-3 text-sm text-side-muted hover:bg-side-hover hover:text-side-fg" onclick={toggleTheme}>
				{#if dark}<Sun size={17} /> Helles Design{:else}<Moon size={17} /> Dunkles Design{/if}
			</button>
			<button class="flex h-9 items-center gap-3 rounded-lg px-3 text-sm text-side-muted hover:bg-side-hover hover:text-side-fg" onclick={logout}>
				<LogOut size={17} /> Abmelden
			</button>
		</div>
	</aside>

	<div class="flex min-w-0 flex-1 flex-col lg:pl-[256px]">
		<header class="sticky top-0 z-20 flex h-16 items-center gap-3 bg-side px-4 text-side-fg shadow-sm lg:px-6">
			<button class="grid size-9 place-items-center rounded-lg text-side-muted hover:bg-side-hover lg:hidden" aria-label="Menü öffnen" onclick={() => (menuOpen = true)}><Menu size={19} /></button>
			<button class="flex h-10 w-full max-w-md items-center gap-2.5 rounded-lg bg-white px-3.5 text-sm text-faint shadow-inner transition hover:ring-2 hover:ring-accent/40" onclick={() => (paletteOpen = true)} aria-label="Suchen">
				<Search size={16} /> <span class="flex-1 truncate text-left"><span class="sm:hidden">Suchen …</span><span class="hidden sm:inline">Kunde, Angebot oder Seite suchen …</span></span> <span class="rounded border border-line px-1.5 text-[0.7rem]">⌘K</span>
			</button>
			<span class="ml-auto hidden text-xs md:inline {db.conflict || db.storageError ? 'font-semibold text-danger' : 'text-side-muted'}" role="status" aria-live="polite">{savedLabel}</span>
			{#if !online}<span class="badge badge-warn" title="Ohne Netz arbeiten Sie weiter, alle Daten liegen im Browser. Kartenhintergrund und Downloads brauchen Netz.">Offline</span>{/if}
			<span class="badge badge-warn hidden sm:inline-flex" title="Alle Daten in diesem Prototyp sind erfunden.">Prototyp · Demo</span>
			<a href="/aufgaben" class="relative grid size-10 place-items-center rounded-lg text-side-muted hover:bg-side-hover hover:text-side-fg" aria-label="Aufgaben und Warnungen"><Bell size={19} />{#if attention > 0}<span class="num absolute top-1 right-1 grid min-w-[1.1rem] place-items-center rounded-full bg-accent px-1 text-[0.65rem] font-bold text-white">{attention}</span>{/if}</a>
		</header>
		<main id="main" class="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-8">
			{@render children()}
		</main>
	</div>
</div>

<CommandPalette bind:open={paletteOpen} />
<Toasts />

<Dialog bind:open={resetOpen} title="Demo-Daten zurücksetzen?" description="Alle Änderungen im Prototyp (neue Kunden, Angebote, Notizen) gehen verloren und die ursprünglichen Demo-Daten werden neu geladen.">
	{#snippet children()}{/snippet}
	{#snippet footer()}
		<button class="btn" onclick={() => (resetOpen = false)}>Abbrechen</button>
		<button class="btn btn-danger" onclick={() => { db.reset(); resetOpen = false; goto('/'); toasts.push('Demo-Daten zurückgesetzt.', { tone: 'success' }); }}><Check size={14} /> Zurücksetzen</button>
	{/snippet}
</Dialog>
{/if}
