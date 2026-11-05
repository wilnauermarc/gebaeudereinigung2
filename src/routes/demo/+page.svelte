<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { db } from '#lib/db.svelte.ts';

	let msg = $state('Demo wird geöffnet …');
	// Direktlink: /demo (Büro) oder /demo?as=staff (Mitarbeiter-App). Nur auf der Demo-Instanz, sonst weiter zur Anmeldung.
	$effect(() => {
		const staff = page.url.searchParams.get('as') === 'staff';
		(async () => {
			try {
				const r = await fetch('/api/demo/enter', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ as: staff ? 'staff' : 'office' }) });
				if (!r.ok) { msg = r.status === 404 ? 'Hier gibt es keine Demo.' : 'Die Demo ist gerade nicht erreichbar. Bitte später erneut versuchen.'; if (r.status === 404) await goto('/login'); return; }
				await db.init();
				await goto(staff ? '/mitarbeiter' : '/');
			} catch { msg = 'Der Server ist nicht erreichbar.'; }
		})();
	});
</script>

<svelte:head><title>Demo · Putzbetrieb</title><meta name="robots" content="noindex" /></svelte:head>
<div class="grid min-h-dvh place-items-center px-4 text-sm text-muted" role="status">{msg}</div>
