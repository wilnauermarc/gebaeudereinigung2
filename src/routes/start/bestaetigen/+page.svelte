<script lang="ts">
	import { goto } from '$app/navigation';
	import { db } from '#lib/db.svelte.ts';

	let msg = $state('Ihr Testzugang wird angelegt …');
	let failed = $state(false);
	// Das Token steht hinter # im Link und geht deshalb nie an Server-Protokolle oder Weiterleitungen
	$effect(() => {
		const token = location.hash.slice(1);
		(async () => {
			try {
				const r = await fetch('/api/signup/confirm', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) });
				const j = await r.json().catch(() => ({}));
				if (!r.ok) { failed = true; msg = j.error ?? 'Das hat nicht geklappt.'; return; }
				history.replaceState(null, '', location.pathname);
				await db.init();
				await goto('/');
			} catch { failed = true; msg = 'Der Server ist nicht erreichbar.'; }
		})();
	});
</script>

<svelte:head><title>E-Mail bestätigen · Putzbetrieb</title><meta name="robots" content="noindex" /></svelte:head>
<div class="mx-auto grid min-h-dvh max-w-md place-items-center px-4 text-sm" role="status">
	<div class="card p-6 text-center">
		<p class={failed ? 'text-danger' : 'text-muted'}>{msg}</p>
		{#if failed}<p class="mt-3"><a class="font-semibold underline" href="/start">Testzugang neu beantragen</a></p>{/if}
	</div>
</div>
