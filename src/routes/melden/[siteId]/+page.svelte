<script lang="ts">
	import { page } from '$app/state';
	import { CircleCheck, TriangleAlert, Loader } from '@lucide/svelte';

	let info = $state<{ company: string; site: string; address: string } | null>(null);
	let error = $state('');
	let loading = $state(true);
	let busy = $state(false);
	let done = $state(false);
	let text = $state('');
	let by = $state('');
	let contact = $state('');
	let website = $state('');
	const siteId = $derived(page.params.siteId!);
	const token = $derived(page.url.searchParams.get('t') ?? '');
	const biz = $derived(page.url.searchParams.get('b') ?? '');
	const bq = $derived(biz ? `&b=${encodeURIComponent(biz)}` : '');

	$effect(() => {
		const s = siteId, t = token, q = bq;
		(async () => {
			try {
				const r = await fetch(`/api/melden?s=${encodeURIComponent(s)}&t=${encodeURIComponent(t)}${q}`);
				const j = await r.json().catch(() => ({}));
				if (!r.ok) { error = j.error ?? 'Der Link ist ungültig.'; return; }
				info = j; error = '';
			} catch { error = 'Keine Verbindung. Bitte später erneut versuchen.'; } finally { loading = false; }
		})();
	});
	async function send(e: SubmitEvent) {
		e.preventDefault();
		error = ''; busy = true;
		try {
			const r = await fetch(`/api/melden?x=1${bq}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ s: siteId, t: token, text, by, contact, website }) });
			const j = await r.json().catch(() => ({}));
			if (!r.ok) { error = j.error ?? 'Das hat nicht geklappt.'; return; }
			done = true;
		} catch { error = 'Keine Verbindung. Bitte später erneut versuchen.'; } finally { busy = false; }
	}
</script>

<svelte:head><title>Meldung · {info?.company ?? 'Reinigung'}</title><meta name="robots" content="noindex" /></svelte:head>
<div class="mx-auto grid min-h-dvh max-w-md place-items-center px-4 py-8">
	<div class="card w-full p-6">
		{#if loading}<p class="flex items-center gap-2 text-sm text-muted"><Loader size={14} class="animate-spin" /> Wird geladen …</p>
		{:else if !info}<p class="flex items-start gap-2 text-sm text-danger" role="alert"><TriangleAlert size={16} class="mt-0.5 shrink-0" /> {error || 'Der Link ist ungültig.'}</p>
		{:else if done}
			<p class="flex items-start gap-2 text-sm"><CircleCheck size={18} class="mt-0.5 shrink-0 text-success" /> <span><strong>Danke, Ihre Meldung ist eingegangen.</strong> {info.company} kümmert sich darum. Bei Dringendem rufen Sie bitte direkt an.</span></p>
		{:else}
			<h1 class="text-lg font-semibold">Etwas melden</h1>
			<p class="mt-1 mb-4 text-sm text-muted">{info.site}, {info.address}<br />Reinigung: {info.company}</p>
			<form class="grid gap-3" onsubmit={send} novalidate>
				<div><label class="label" for="m-t">Was ist nicht in Ordnung? *</label><textarea id="m-t" class="input min-h-28" maxlength="500" placeholder="z. B. Toilette im 2. OG nicht gereinigt, Müll nicht geleert …" bind:value={text}></textarea></div>
				<div><label class="label" for="m-n">Ihr Name (optional)</label><input id="m-n" class="input h-11 text-base" maxlength="60" autocomplete="name" bind:value={by} /></div>
				<div><label class="label" for="m-c">Telefon oder E-Mail für Rückfragen (optional)</label><input id="m-c" class="input h-11 text-base" maxlength="100" autocomplete="off" bind:value={contact} /></div>
				<div class="absolute -left-[9999px]" aria-hidden="true"><label>Website <input tabindex="-1" autocomplete="off" bind:value={website} /></label></div>
				{#if error}<p class="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">{error}</p>{/if}
				<button class="btn btn-primary h-11 w-full text-base" disabled={busy || text.trim().length < 5}>Meldung senden</button>
				<p class="text-xs text-muted">Ihre Angaben gehen nur an {info.company}. Bitte keine Fotos oder Daten von Personen angeben.</p>
			</form>
		{/if}
	</div>
</div>
