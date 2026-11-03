<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import Dialog from './Dialog.svelte';
	import Badge from './Badge.svelte';
	import { KeyRound, Plus, RotateCcw, Ban, Check, Trash2, Copy } from '@lucide/svelte';

	interface U { id: string; login: string; display: string; role: string; employee_id: string | null; must_change: number; disabled: number; locked_until: number }
	let users = $state<U[]>([]);
	let loadErr = $state('');
	const roleLabel: Record<string, string> = { inhaber: 'Inhaberin', buero: 'Büro', objektleitung: 'Objektleitung', mitarbeiter: 'Mitarbeiter-Zugang' };
	const isOwner = $derived(db.session?.role === 'inhaber');

	async function api(body: unknown) {
		const r = await fetch('/api/users', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
		return { ok: r.ok, body: await r.json().catch(() => ({})) };
	}
	async function refresh() {
		const r = await fetch('/api/users');
		if (!r.ok) { loadErr = 'Zugänge konnten nicht geladen werden.'; return; }
		users = (await r.json()).users; loadErr = '';
	}
	$effect(() => { if (db.session?.management) refresh(); });

	const withoutAccess = $derived(db.data.employees.filter((e) => !users.some((u) => u.employee_id === e.id)));
	const nameOf = (id: string | null) => db.data.employees.find((e) => e.id === id)?.name ?? '';

	// Einmal-Code: wird genau einmal angezeigt, danach nur noch zurücksetzbar
	let code = $state<{ login: string; code: string } | null>(null);
	let codeOpen = $state(false);
	function showCode(login: string, c: string) { code = { login, code: c }; codeOpen = true; }
	async function copy() { try { await navigator.clipboard.writeText(`Anmeldename: ${code!.login}\nEinmal-Code: ${code!.code}`); toasts.push('Kopiert.', { tone: 'success' }); } catch { toasts.push('Kopieren nicht möglich, bitte abschreiben.'); } }

	let open = $state(false);
	let f = $state({ role: 'mitarbeiter', employeeId: '', login: '', display: '' });
	let err = $state('');
	const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
	function openNew(employeeId = '') {
		const e = db.data.employees.find((x) => x.id === employeeId);
		f = { role: 'mitarbeiter', employeeId, login: e ? slug(e.name) : '', display: e?.name ?? '' };
		err = ''; open = true;
	}
	function pickEmployee() { const e = db.data.employees.find((x) => x.id === f.employeeId); if (e) { f.display = e.name; f.login = slug(e.name); } }
	async function create(e: SubmitEvent) {
		e.preventDefault();
		const r = await api({ action: 'create', ...f });
		if (!r.ok) return (err = r.body.error ?? 'Nicht möglich.');
		open = false; showCode(r.body.login, r.body.code); await refresh();
	}
	async function act(u: U, action: 'reset' | 'disable' | 'enable' | 'remove') {
		if (action === 'remove' && !confirm(`Zugang „${u.login}“ wirklich löschen?`)) return;
		const r = await api({ action, id: u.id });
		if (!r.ok) return toasts.push(r.body.error ?? 'Nicht möglich.', { tone: 'error' });
		if (action === 'reset') showCode(u.login, r.body.code);
		else toasts.push(action === 'disable' ? 'Zugang gesperrt, laufende Sitzungen beendet.' : action === 'enable' ? 'Zugang freigegeben.' : 'Zugang gelöscht.', { tone: 'success' });
		await refresh();
	}
	// Wunsch aus „Team → Zugang“: /einstellungen#zugaenge
</script>

<section id="zugaenge" class="card p-5" aria-labelledby="h-acc">
	<div class="mb-1 flex flex-wrap items-center justify-between gap-2"><h2 id="h-acc" class="card-title flex items-center gap-2"><KeyRound size={15} class="text-muted" /> Zugänge</h2><button class="btn btn-sm btn-primary" onclick={() => openNew()}><Plus size={13} /> Zugang anlegen</button></div>
	<p class="mb-3 text-xs text-muted">Mitarbeitende melden sich mit eigenem Zugang an und sehen <strong>ausschließlich ihre eigenen</strong> Einsätze, Stunden und Abwesenheiten. Der Server liefert ihnen keine anderen Daten aus. Neue Zugänge bekommen einen Einmal-Code, den die Person beim ersten Anmelden durch ein eigenes Passwort ersetzt.</p>
	{#if loadErr}<p class="text-sm text-danger">{loadErr}</p>{/if}
	<ul class="divide-y divide-line">
		{#each users as u (u.id)}
			<li class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
				<div class="min-w-[180px] flex-1"><p class="text-sm font-medium">{u.display} <span class="text-xs font-normal text-muted">· {u.login}</span></p><p class="text-xs text-muted">{roleLabel[u.role]}{u.employee_id ? ` · ${nameOf(u.employee_id)}` : ''}</p></div>
				{#if u.disabled}<Badge tone="danger" label="gesperrt" />{:else if u.must_change}<Badge tone="warn" label="Code offen" />{:else if u.locked_until > Date.now()}<Badge tone="warn" label="kurz gesperrt" />{:else}<Badge tone="success" label="aktiv" />{/if}
				{#if u.id !== db.session?.id && (u.role === 'mitarbeiter' || isOwner)}
					<div class="flex gap-1">
						<button class="btn btn-ghost btn-sm" onclick={() => act(u, 'reset')} title="Neuen Einmal-Code erzeugen"><RotateCcw size={13} /> Code</button>
						{#if u.disabled}<button class="btn btn-ghost btn-sm" onclick={() => act(u, 'enable')}><Check size={13} /> Freigeben</button>{:else}<button class="btn btn-ghost btn-sm" onclick={() => act(u, 'disable')}><Ban size={13} /> Sperren</button>{/if}
						<button class="btn btn-ghost btn-sm hover:text-danger" onclick={() => act(u, 'remove')} aria-label="Zugang {u.login} löschen"><Trash2 size={13} /></button>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
	{#if withoutAccess.length}<p class="mt-3 text-xs text-muted">Noch ohne Zugang: {#each withoutAccess as e, i}<button class="text-accent hover:underline" onclick={() => openNew(e.id)}>{e.name.split(' ')[0]}</button>{i < withoutAccess.length - 1 ? ', ' : ''}{/each}</p>{/if}
</section>

<Dialog bind:open title="Zugang anlegen" width={480}>
	{#snippet children()}
		<form id="acc-form" class="grid grid-cols-2 gap-3" onsubmit={create} novalidate>
			<div class="col-span-2"><label class="label" for="a-r">Art</label><select id="a-r" class="input" bind:value={f.role}><option value="mitarbeiter">Mitarbeiter-Zugang (nur eigene Daten)</option>{#if isOwner}<option value="buero">Büro (Verwaltung)</option><option value="objektleitung">Objektleitung (Verwaltung)</option>{/if}</select></div>
			{#if f.role === 'mitarbeiter'}<div class="col-span-2"><label class="label" for="a-e">Person</label><select id="a-e" class="input" bind:value={f.employeeId} onchange={pickEmployee}><option value="">Bitte wählen</option>{#each withoutAccess as e}<option value={e.id}>{e.name}</option>{/each}</select></div>{/if}
			<div><label class="label" for="a-n">Name</label><input id="a-n" class="input" bind:value={f.display} /></div>
			<div><label class="label" for="a-l">Anmeldename</label><input id="a-l" class="input" autocapitalize="none" bind:value={f.login} /></div>
			{#if f.role !== 'mitarbeiter'}<p class="col-span-2 text-xs text-warn">Verwaltungs-Zugänge sehen alle Geschäftsdaten (Preise, Rechnungen, Team). Nur an vertrauenswürdige Personen vergeben.</p>{/if}
			{#if err}<p class="col-span-2 text-sm text-danger" role="alert">{err}</p>{/if}
		</form>
	{/snippet}
	{#snippet footer()}<button class="btn" type="button" onclick={() => (open = false)}>Abbrechen</button><button class="btn btn-primary" type="submit" form="acc-form">Anlegen</button>{/snippet}
</Dialog>

<Dialog bind:open={codeOpen} title="Einmal-Code" description="Wird nur jetzt angezeigt. Geben Sie ihn der Person persönlich weiter, nicht per Gruppenchat." width={440}>
	{#snippet children()}
		{#if code}<div class="rounded-lg bg-subtle p-4 text-center"><p class="text-xs text-muted">Anmeldename</p><p class="num text-lg font-semibold">{code.login}</p><p class="mt-3 text-xs text-muted">Einmal-Code</p><p class="num text-3xl font-bold tracking-[0.2em]">{code.code}</p></div><p class="mt-3 text-xs text-muted">Bei der ersten Anmeldung wählt die Person ein eigenes Passwort. Der Code ist danach ungültig.</p>{/if}
	{/snippet}
	{#snippet footer()}<button class="btn" onclick={copy}><Copy size={14} /> Kopieren</button><button class="btn btn-primary" onclick={() => (codeOpen = false)}>Fertig</button>{/snippet}
</Dialog>
