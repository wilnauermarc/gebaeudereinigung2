<script lang="ts">
	import { toasts } from '#lib/toast.svelte.ts';
	import Badge from '#lib/components/Badge.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { Inbox, CircleAlert, Plus, RefreshCw } from '@lucide/svelte';

	let confirmOpen = $state(false);
	const swatches = [
		['bg', 'Hintergrund'], ['surface', 'Fläche'], ['subtle', 'Hover / Dezent'], ['line', 'Linie'],
		['fg', 'Text'], ['muted', 'Text gedämpft'], ['accent', 'Akzent'], ['accent-soft', 'Akzent weich'],
		['info', 'Info'], ['success', 'Erfolg'], ['warn', 'Warnung'], ['danger', 'Kritisch']
	];
</script>

<svelte:head><title>Designsystem · Putzbetrieb</title></svelte:head>

<h1 class="mb-1 text-xl font-semibold tracking-tight">Designsystem</h1>
<p class="mb-6 text-sm text-muted">Alle Bausteine des Prototyps. Farben sind Tokens und wechseln mit dem Dunklen Design.</p>

<div class="flex flex-col gap-6">
	<section class="card p-5">
		<h2 class="card-title mb-3">Farben</h2>
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
			{#each swatches as [t, label]}
				<div><div class="h-12 rounded-md border border-line" style="background: var(--{t})"></div><p class="mt-1 text-xs font-medium">{label}</p><p class="text-[0.72rem] text-faint">--{t}</p></div>
			{/each}
		</div>
	</section>

	<section class="card p-5">
		<h2 class="card-title mb-3">Typografie (Inter, tabellarische Ziffern)</h2>
		<p class="text-2xl font-semibold tracking-tight">Seitentitel 24/32 · 1.234,56 €</p>
		<p class="mt-2 text-xl font-semibold tracking-tight">Seitenüberschrift 20</p>
		<p class="mt-2 text-sm font-semibold">Kartentitel 13 semibold</p>
		<p class="mt-2 text-sm">Fließtext und Tabellen 13, Standard im Interface.</p>
		<p class="mt-2 text-xs text-muted">Hilfetext und Metadaten 12, gedämpft</p>
	</section>

	<section class="card p-5">
		<h2 class="card-title mb-3">Buttons und Status</h2>
		<div class="flex flex-wrap items-center gap-2">
			<button class="btn btn-primary"><Plus size={14} /> Primär</button>
			<button class="btn">Sekundär</button>
			<button class="btn btn-ghost">Dezent</button>
			<button class="btn btn-danger">Löschen</button>
			<button class="btn" disabled>Deaktiviert</button>
			<button class="btn btn-sm">Klein</button>
		</div>
		<div class="mt-4 flex flex-wrap gap-2">
			<Badge tone="neutral" label="Entwurf" /><Badge tone="info" label="Versendet" /><Badge tone="success" label="Angenommen" /><Badge tone="warn" label="Wiedervorlage" /><Badge tone="danger" label="Überfällig" />
		</div>
	</section>

	<section class="card p-5">
		<h2 class="card-title mb-3">Formularfelder</h2>
		<div class="grid max-w-xl gap-3 sm:grid-cols-2">
			<div><label class="label" for="d1">Normal</label><input id="d1" class="input" placeholder="Platzhalter" /></div>
			<div><label class="label" for="d2">Fehler</label><input id="d2" class="input" aria-invalid="true" value="abc" /><p class="mt-1 text-xs text-danger">Das sieht nicht nach einer E-Mail-Adresse aus.</p></div>
			<div><label class="label" for="d3">Deaktiviert</label><input id="d3" class="input" disabled value="Schreibgeschützt" /></div>
			<div><label class="label" for="d4">Auswahl</label><select id="d4" class="input"><option>1 x pro Woche</option></select></div>
		</div>
	</section>

	<section class="grid gap-4 md:grid-cols-3">
		<div class="card p-4">
			<h2 class="card-title mb-3">Skeleton (Laden)</h2>
			<div class="flex flex-col gap-2"><div class="skeleton h-4 w-2/3"></div><div class="skeleton h-4 w-full"></div><div class="skeleton h-4 w-5/6"></div></div>
		</div>
		<div class="card"><EmptyState icon={Inbox} title="Empty State" text="Erklärt, warum nichts da ist, und bietet die passende Aktion." /></div>
		<div class="card"><EmptyState icon={CircleAlert} title="Fehlerzustand" text="Die Daten konnten nicht geladen werden. Ihre Eingaben sind nicht verloren."><button class="btn"><RefreshCw size={14} /> Erneut versuchen</button></EmptyState></div>
	</section>

	<section class="card p-5">
		<h2 class="card-title mb-3">Rückmeldung</h2>
		<div class="flex flex-wrap gap-2">
			<button class="btn" onclick={() => toasts.push('Änderung gespeichert.', { tone: 'success' })}>Erfolgs-Toast</button>
			<button class="btn" onclick={() => toasts.push('Speichern nicht möglich. Bitte Verbindung prüfen.', { tone: 'error' })}>Fehler-Toast</button>
			<button class="btn" onclick={() => toasts.push('Notiz gelöscht.', { action: { label: 'Rückgängig', run: () => toasts.push('Wiederhergestellt.', { tone: 'success' }) } })}>Toast mit Rückgängig</button>
			<button class="btn" onclick={() => (confirmOpen = true)}>Bestätigungsdialog</button>
		</div>
	</section>
</div>

<Dialog bind:open={confirmOpen} title="Kunde wirklich löschen?" description="Alle zugehörigen Notizen und Angebotsentwürfe werden ebenfalls entfernt. Das lässt sich nicht rückgängig machen.">
	{#snippet children()}{/snippet}
	{#snippet footer()}
		<button class="btn" onclick={() => (confirmOpen = false)}>Abbrechen</button>
		<button class="btn btn-danger" onclick={() => (confirmOpen = false)}>Endgültig löschen</button>
	{/snippet}
</Dialog>
