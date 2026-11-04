<script lang="ts">
	import { page } from '$app/state';
	import { CircleCheck, Info, TriangleAlert, ShieldCheck, Loader } from '@lucide/svelte';

	interface Day { date: string; execution: string; missed: string[]; acceptance: string; acceptedBy: string; received: boolean }
	interface Data { company: string; customer: string; site: string; address: string; today: string; days: Day[] }
	let data = $state<Data | null>(null);
	let error = $state('');
	let loading = $state(true);
	let by = $state('');
	let busy = $state('');
	let note = $state<Record<string, string>>({});
	let formErr = $state<Record<string, string>>({});
	let open = $state<string | null>(null);
	const siteId = $derived(page.params.siteId!);
	const token = $derived(page.url.searchParams.get('t') ?? '');

	async function load() {
		try {
			const r = await fetch(`/api/abnahme?s=${encodeURIComponent(siteId)}&t=${encodeURIComponent(token)}`);
			const j = await r.json().catch(() => ({}));
			if (!r.ok) { error = j.error ?? 'Der Link ist ungültig.'; return; }
			data = j; error = '';
		} catch { error = 'Keine Verbindung. Bitte später erneut versuchen.'; } finally { loading = false; }
	}
	$effect(() => { if (siteId && token !== undefined) load(); });
	$effect(() => { try { by = localStorage.getItem('putzbetrieb-abnahme-name') ?? ''; } catch { /* leer */ } });

	async function decide(date: string, acceptance: 'abgenommen' | 'beanstandet') {
		busy = date + acceptance; formErr[date] = '';
		try {
			try { localStorage.setItem('putzbetrieb-abnahme-name', by.trim()); } catch { /* ignorieren */ }
			const r = await fetch('/api/abnahme', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ s: siteId, t: token, date, acceptance, by, note: note[date] ?? '' }) });
			const j = await r.json().catch(() => ({}));
			if (!r.ok) { formErr[date] = j.error ?? 'Nicht möglich.'; return; }
			open = null; await load();
		} catch { formErr[date] = 'Keine Verbindung.'; } finally { busy = ''; }
	}
	const dayLabel = (k: string) => new Date(k + 'T12:00:00Z').toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', timeZone: 'UTC' });
	const execText: Record<string, string> = { vollstaendig: 'Vollständig erbracht', teilweise: 'Teilweise erbracht', nicht: 'Nicht erbracht' };
	const todo = $derived(data?.days.filter((d) => d.acceptance === 'offen' && !d.received) ?? []);
</script>

<svelte:head><title>Leistungen abnehmen</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<div class="min-h-dvh bg-bg">
	<header class="hero rounded-none">
		<div class="relative z-10 mx-auto max-w-2xl px-5 py-7">
			<p class="text-sm text-white/70">{data?.company ?? ''}</p>
			<h1 class="text-2xl font-bold tracking-tight">{data ? data.site : 'Leistungen abnehmen'}</h1>
			{#if data}<p class="text-sm text-white/70">{data.customer} · {data.address}</p>{/if}
		</div>
	</header>

	<main class="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
		{#if loading}
			<p class="flex items-center justify-center gap-2 py-10 text-muted"><Loader size={16} class="animate-spin" /> Wird geladen …</p>
		{:else if error}
			<div class="card p-6 text-center"><TriangleAlert size={28} class="mx-auto mb-2 text-warn" /><h2 class="card-title">Link nicht gültig</h2><p class="mt-1 text-sm text-muted">{error} Bitte wenden Sie sich an Ihren Ansprechpartner.</p></div>
		{:else if data}
			<section class="card p-5">
				<h2 class="card-title mb-1">Bitte nehmen Sie die erbrachten Leistungen ab</h2>
				<p class="mb-3 text-sm text-muted">Sie sehen die Einsätze der letzten Wochen. Mit „Abnehmen“ bestätigen Sie, dass die Reinigung in Ordnung war. Wenn etwas nicht stimmt, wählen Sie „Beanstanden“ und beschreiben es kurz. Wir kümmern uns darum.</p>
				<label class="label" for="ab-n">Ihr Name</label>
				<input id="ab-n" class="input h-11 text-base" autocomplete="name" placeholder="Vor- und Nachname" bind:value={by} maxlength="60" />
			</section>

			{#if data.days.length === 0}
				<div class="card flex items-center gap-3 p-5"><Info size={24} class="shrink-0 text-info" /><p class="text-sm">Zurzeit gibt es keine gemeldeten Einsätze zum Abnehmen. Sobald wir einen Einsatz gemeldet haben, erscheint er hier.</p></div>
			{:else if todo.length === 0}
				<div class="card flex items-center gap-3 p-5"><CircleCheck size={24} class="shrink-0 text-success" /><p class="text-sm">Alles abgenommen. Vielen Dank! Neue Einsätze erscheinen hier, sobald sie gemeldet sind.</p></div>
			{/if}

			{#each data.days as d (d.date)}
				<section class="card p-5">
					<div class="flex flex-wrap items-start justify-between gap-2">
						<div><p class="font-semibold capitalize">{dayLabel(d.date)}</p><p class="text-sm {d.execution === 'vollstaendig' ? 'text-success' : 'text-warn'}">{execText[d.execution]}</p></div>
						{#if d.received}<span class="badge badge-info">Ihre Meldung ist eingegangen</span>
						{:else if d.acceptance === 'abgenommen'}<span class="badge badge-success">Abgenommen{d.acceptedBy ? ` · ${d.acceptedBy}` : ''}</span>
						{:else if d.acceptance === 'beanstandet'}<span class="badge badge-danger">Beanstandet</span>{/if}
					</div>
					{#if d.missed.length}<div class="mt-2 rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn"><p class="font-semibold">Nicht erbracht:</p><ul class="list-disc pl-5">{#each d.missed as m}<li>{m}</li>{/each}</ul></div>{/if}
					{#if d.acceptance === 'offen' && !d.received}
						{#if open === d.date}
							<label class="label mt-3" for="ab-a-{d.date}">Was ist nicht in Ordnung?</label>
							<textarea id="ab-a-{d.date}" class="input text-base" rows="3" maxlength="300" bind:value={note[d.date]}></textarea>
							{#if formErr[d.date]}<p class="mt-1 text-sm text-danger" role="alert">{formErr[d.date]}</p>{/if}
							<div class="mt-3 flex gap-2"><button class="btn h-12 flex-1" onclick={() => (open = null)}>Abbrechen</button><button class="btn btn-danger h-12 flex-1" disabled={!!busy} onclick={() => decide(d.date, 'beanstandet')}>Beanstandung senden</button></div>
						{:else}
							{#if formErr[d.date]}<p class="mt-2 text-sm text-danger" role="alert">{formErr[d.date]}</p>{/if}
							<div class="mt-3 flex gap-2"><button class="btn btn-primary h-12 flex-1 text-base" disabled={!!busy} onclick={() => decide(d.date, 'abgenommen')}><CircleCheck size={18} /> Abnehmen</button><button class="btn h-12 flex-1 text-base" onclick={() => { open = d.date; formErr[d.date] = ''; }}>Beanstanden</button></div>
						{/if}
					{/if}
				</section>
			{/each}

			<p class="flex items-start justify-center gap-1.5 text-center text-xs text-muted"><ShieldCheck size={13} class="mt-0.5 shrink-0" /> Diese Seite zeigt nur dieses Objekt. Der Link ist persönlich, bitte nicht weitergeben.</p>
		{/if}
	</main>
</div>
