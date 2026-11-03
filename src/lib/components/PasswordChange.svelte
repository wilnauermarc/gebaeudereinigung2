<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import { goto } from '$app/navigation';
	import { KeyRound, Loader } from '@lucide/svelte';

	let current = $state('');
	let next = $state('');
	let next2 = $state('');
	let err = $state('');
	let busy = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (next !== next2) return (err = 'Die beiden neuen Passwörter sind nicht gleich.');
		busy = true; err = '';
		try {
			const r = await fetch('/api/password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ current, next }) });
			const j = await r.json().catch(() => ({}));
			if (!r.ok) return (err = j.error ?? 'Nicht möglich.');
			current = next = next2 = '';
			await db.init();
		} catch { err = 'Der Server ist nicht erreichbar.'; } finally { busy = false; }
	}
	async function cancel() { await db.logout(); await goto('/login'); await db.init(); }
</script>

<div class="mx-auto grid min-h-dvh max-w-md place-items-center px-4 py-8">
	<form class="card w-full p-6" onsubmit={submit} novalidate>
		<div class="mb-4 flex items-center gap-3"><div class="grid size-11 place-items-center rounded-xl bg-accent text-white"><KeyRound size={20} /></div><div><p class="text-lg font-semibold">Neues Passwort wählen</p><p class="text-sm text-muted">Sie haben sich mit einem Einmal-Passwort angemeldet.</p></div></div>
		<div class="grid gap-3">
			<div><label class="label" for="pc-c">Einmal-Passwort</label><input id="pc-c" type="password" class="input h-11 text-base" autocomplete="current-password" bind:value={current} /></div>
			<div><label class="label" for="pc-n">Neues Passwort (mindestens 12 Zeichen)</label><input id="pc-n" type="password" class="input h-11 text-base" autocomplete="new-password" bind:value={next} /></div>
			<div><label class="label" for="pc-n2">Neues Passwort wiederholen</label><input id="pc-n2" type="password" class="input h-11 text-base" autocomplete="new-password" bind:value={next2} /></div>
		</div>
		{#if err}<p class="mt-3 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">{err}</p>{/if}
		<button class="btn btn-primary mt-5 h-11 w-full text-base" disabled={busy}>{#if busy}<Loader size={15} class="animate-spin" />{/if} Passwort speichern</button>
		<button type="button" class="btn mt-2 w-full" onclick={cancel}>Abbrechen und abmelden</button>
	</form>
</div>
