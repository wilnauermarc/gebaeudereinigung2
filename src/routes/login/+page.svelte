<script lang="ts">
	import { goto } from '$app/navigation';
	import { db, LEGACY_KEY } from '#lib/db.svelte.ts';
	import { LogIn, ShieldCheck, Loader } from '@lucide/svelte';

	let login = $state('');
	let password = $state('');
	let err = $state('');
	let busy = $state(false);

	// Einrichtung (nur beim allerersten Start)
	let sf = $state({ display: '', login: '', password: '', password2: '', code: '', start: 'leer' as 'leer' | 'demo8' | 'demo12' | 'import' });
	const legacy = $derived.by(() => { try { return localStorage.getItem(LEGACY_KEY); } catch { return null; } });

	async function post(url: string, body: unknown) {
		const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
		return { ok: r.ok, status: r.status, body: await r.json().catch(() => ({})) };
	}
	async function submit(e: SubmitEvent) {
		e.preventDefault();
		err = ''; busy = true;
		try {
			if (db.needsSetup) {
				if (sf.password !== sf.password2) return (err = 'Die beiden Passwörter sind nicht gleich.');
				const state = sf.start === 'import' && legacy ? JSON.parse(legacy) : undefined;
				const r = await post('/api/setup', { display: sf.display, login: sf.login, password: sf.password, setupCode: sf.code, start: sf.start === 'demo8' || sf.start === 'demo12' ? 'demo' : sf.start, team: sf.start === 'demo12' ? 12 : 8, state });
				if (!r.ok) return (err = r.body.error ?? 'Einrichtung nicht möglich.');
			} else {
				const r = await post('/api/login', { login, password });
				if (!r.ok) return (err = r.body.error ?? 'Anmeldung nicht möglich.');
			}
			password = ''; sf.password = ''; sf.password2 = '';
			await db.init();
			await goto(db.session?.role === 'mitarbeiter' ? '/mitarbeiter' : '/');
		} catch {
			err = 'Der Server ist nicht erreichbar.';
		} finally { busy = false; }
	}
</script>

<svelte:head><title>Anmelden · Putzbetrieb</title><meta name="robots" content="noindex" /></svelte:head>

<div class="mx-auto grid min-h-dvh max-w-md place-items-center px-4 py-8">
	<form class="card w-full p-6" onsubmit={submit} novalidate>
		<div class="mb-5 flex items-center gap-3"><div class="grid size-11 place-items-center rounded-xl bg-accent text-lg font-extrabold text-white">P</div><div><p class="text-lg font-semibold">Putzbetrieb</p><p class="text-xs text-muted">{db.needsSetup ? 'Ersteinrichtung' : 'Anmelden'}</p></div></div>
		{#if !db.ready}
			<p class="flex items-center gap-2 text-sm text-muted"><Loader size={14} class="animate-spin" /> Wird geladen …</p>
		{:else if db.needsSetup}
			<p class="mb-4 text-sm text-muted">Legen Sie das Konto der Inhaberin an. Dieser Schritt ist nur beim ersten Start möglich.</p>
			<div class="grid gap-3">
				{#if db.setupNeedsCode}<div><label class="label" for="s-c">Einrichtungscode</label><input id="s-c" class="input" autocomplete="off" autocapitalize="none" placeholder="steht in der Datei .env auf dem Server" bind:value={sf.code} /></div>{/if}
				<div><label class="label" for="s-d">Ihr Name</label><input id="s-d" class="input" autocomplete="name" bind:value={sf.display} /></div>
				<div><label class="label" for="s-l">Anmeldename</label><input id="s-l" class="input" autocomplete="username" autocapitalize="none" bind:value={sf.login} /></div>
				<div><label class="label" for="s-p">Passwort (mindestens 12 Zeichen)</label><input id="s-p" type="password" class="input" autocomplete="new-password" bind:value={sf.password} /></div>
				<div><label class="label" for="s-p2">Passwort wiederholen</label><input id="s-p2" type="password" class="input" autocomplete="new-password" bind:value={sf.password2} /></div>
				<div><label class="label" for="s-s">Womit starten?</label><select id="s-s" class="input" bind:value={sf.start}><option value="leer">Leer (eigene Daten eintragen)</option><option value="demo8">Demo mit 8 Mitarbeitenden</option><option value="demo12">Demo mit 12 Mitarbeitenden</option>{#if legacy}<option value="import">Bisherige Daten aus diesem Browser übernehmen</option>{/if}</select></div>
			</div>
		{:else}
			<div class="grid gap-3">
				<div><label class="label" for="l-l">Anmeldename</label><input id="l-l" class="input h-11 text-base" autocomplete="username" autocapitalize="none" bind:value={login} /></div>
				<div><label class="label" for="l-p">Passwort</label><input id="l-p" type="password" class="input h-11 text-base" autocomplete="current-password" bind:value={password} /></div>
			</div>
		{/if}
		{#if err}<p class="mt-3 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">{err}</p>{/if}
		{#if db.ready}<button class="btn btn-primary mt-5 h-11 w-full text-base" disabled={busy}><LogIn size={16} /> {db.needsSetup ? 'Einrichten und anmelden' : 'Anmelden'}</button>{/if}
		<p class="mt-4 flex items-start gap-1.5 text-xs text-muted"><ShieldCheck size={13} class="mt-0.5 shrink-0" /> Mitarbeitende sehen nach der Anmeldung nur ihre eigenen Einsätze und Stunden. Verwaltungsbereiche sind auf dem Server gesperrt.</p>
	</form>
</div>
