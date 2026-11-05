<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import { Loader, MailCheck } from '@lucide/svelte';

	let f = $state({ company: '', name: '', email: '', password: '', password2: '', demo: true, accept: false, website: '' });
	let err = $state('');
	let busy = $state(false);
	let done = $state('');

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		err = '';
		if (f.password !== f.password2) return (err = 'Die beiden Passwörter sind nicht gleich.');
		busy = true;
		try {
			const r = await fetch('/api/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ company: f.company, name: f.name, email: f.email, password: f.password, demo: f.demo, accept: f.accept, website: f.website }) });
			const j = await r.json().catch(() => ({}));
			if (!r.ok) return (err = j.error ?? 'Das hat nicht geklappt. Bitte später erneut versuchen.');
			done = j.message ?? 'Bitte prüfen Sie Ihr E-Mail-Postfach.';
			f.password = ''; f.password2 = '';
		} catch { err = 'Der Server ist nicht erreichbar.'; } finally { busy = false; }
	}
</script>

<svelte:head><title>30 Tage kostenlos testen · Putzbetrieb</title><meta name="robots" content="noindex" /></svelte:head>
<div class="mx-auto grid min-h-dvh max-w-md place-items-center px-4 py-8">
	<div class="card w-full p-6">
		<div class="mb-4"><img src="/brand/logo-480.webp" alt="Putzbetrieb" width="480" height="120" class="logo-light h-12 w-auto" /><img src="/brand/logo-dark-480.webp" alt="" aria-hidden="true" width="480" height="120" class="logo-dark h-12 w-auto" /></div>
		{#if done}
			<p class="flex items-start gap-2 text-sm"><MailCheck size={18} class="mt-0.5 shrink-0 text-accent-text" /> <span>{done}</span></p>
			<p class="mt-4 text-center text-xs text-muted"><a class="font-semibold underline" href="https://putzbetrieb.app" rel="noopener">← Zur Webseite</a></p>
		{:else if !db.ready}
			<p class="flex items-center gap-2 text-sm text-muted"><Loader size={14} class="animate-spin" /> Wird geladen …</p>
		{:else if !db.signup}
			<p class="text-sm">Hier gibt es keinen Testzugang. <a class="font-semibold underline" href="https://putzbetrieb.app" rel="noopener">Zur Webseite</a></p>
		{:else}
			<h1 class="mb-1 text-lg font-semibold">30 Tage kostenlos testen</h1>
			<p class="mb-4 text-sm text-muted">Mit allen Bausteinen, ohne Zahlungsdaten. Nach der Bestätigung Ihrer E-Mail-Adresse geht es sofort los.</p>
			<form class="grid gap-3" onsubmit={submit} novalidate>
				<div><label class="label" for="g-c">Firma</label><input id="g-c" class="input h-11 text-base" autocomplete="organization" maxlength="80" bind:value={f.company} /></div>
				<div><label class="label" for="g-n">Ihr Name</label><input id="g-n" class="input h-11 text-base" autocomplete="name" maxlength="60" bind:value={f.name} /></div>
				<div><label class="label" for="g-e">E-Mail</label><input id="g-e" type="email" class="input h-11 text-base" autocomplete="email" maxlength="120" bind:value={f.email} /></div>
				<div><label class="label" for="g-p">Passwort (mindestens 12 Zeichen)</label><input id="g-p" type="password" class="input h-11 text-base" autocomplete="new-password" bind:value={f.password} /></div>
				<div><label class="label" for="g-p2">Passwort wiederholen</label><input id="g-p2" type="password" class="input h-11 text-base" autocomplete="new-password" bind:value={f.password2} /></div>
				<label class="flex items-start gap-2 text-sm"><input type="checkbox" class="mt-1" bind:checked={f.demo} /> <span>Mit Beispieldaten starten (zum Ausprobieren, lassen sich später entfernen)</span></label>
				<label class="flex items-start gap-2 text-sm"><input type="checkbox" class="mt-1" bind:checked={f.accept} /> <span>Ich habe die <a class="underline" href="https://putzbetrieb.app/datenschutz.html" rel="noopener" target="_blank">Hinweise zum Datenschutz</a> gelesen.</span></label>
				<!-- Köderfeld gegen automatische Anmeldungen: für Menschen unsichtbar -->
				<div class="absolute -left-[9999px]" aria-hidden="true"><label>Website <input tabindex="-1" autocomplete="off" bind:value={f.website} /></label></div>
				{#if err}<p class="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">{err}</p>{/if}
				<button class="btn btn-primary h-11 w-full text-base" disabled={busy || !f.accept}>Testzugang anfordern</button>
			</form>
			<p class="mt-4 text-xs text-muted">Wir senden Ihnen einen Bestätigungslink. Ohne Weiterführung nach 30 Tagen werden Ihre Daten gelöscht, vorher erinnern wir Sie per E-Mail.</p>
			<p class="mt-3 border-t border-line pt-3 text-center text-xs text-muted">Schon registriert? <a class="font-semibold underline" href="/login">Anmelden</a></p>
		{/if}
	</div>
</div>
