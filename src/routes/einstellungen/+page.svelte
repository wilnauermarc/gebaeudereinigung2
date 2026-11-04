<script lang="ts">
	import { goto } from '$app/navigation';
	import { PHOTO_IDS, photoFor } from '#lib/photos.ts';
	import { MODULES, MODULE_BY_ID, PRESETS, activeModules, dependentsOf, disable, enable, matchingPreset, presetChoice, prerequisitesOf, type ModuleChoice, type ModuleId, type PresetId } from '#lib/modules.ts';
	import AccessPanel from '#lib/components/AccessPanel.svelte';
	import { privacy } from '#lib/privacy.svelte.ts';
	import { ui, roleLabels, palettes, type Role } from '#lib/ui.svelte.ts';
	import { exportSettings } from '#lib/exportConfig.svelte.ts';
	import { lohnLabels, type LohnKey } from '#lib/export.ts';
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { downloadBytes } from '#lib/download.ts';
	import { ibanValid } from '#lib/iban.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import { Save, Download, Upload, ShieldCheck, TriangleAlert, Trash2, Users, Check } from '@lucide/svelte';
	import type { Company } from '#lib/company.ts';
	import type { Data } from '#lib/types.ts';

	/** Bereiche statt einer langen Seite: Betrieb, Zugänge, Aussehen, Daten */
	type Tab = 'betrieb' | 'umfang' | 'zugaenge' | 'aussehen' | 'daten';
	const tabList: { id: Tab; label: string }[] = [{ id: 'betrieb', label: 'Betrieb' }, { id: 'umfang', label: 'Funktionsumfang' }, { id: 'zugaenge', label: 'Zugänge & Stempeln' }, { id: 'aussehen', label: 'Aussehen' }, { id: 'daten', label: 'Daten & Datenschutz' }];
	let tab = $state<Tab>('betrieb');
	// ── Funktionsumfang ──
	const isAdmin = $derived(db.session?.role === 'inhaber');
	const active = $derived(activeModules(db.data.settings?.modules));
	const preset = $derived(matchingPreset(db.data.settings?.modules));
	function setChoice(c: ModuleChoice) { db.data.settings ??= {}; db.data.settings.modules = c; }
	function toggle(id: ModuleId, on: boolean) {
		if (!isAdmin) return;
		if (on) {
			const need = prerequisitesOf(id).filter((x) => !active.has(x));
			setChoice(enable(db.data.settings?.modules, id));
			if (need.length) toasts.push(`Zusätzlich eingeschaltet, weil nötig: ${need.map((x) => MODULE_BY_ID[x].label).join(', ')}.`);
		} else {
			const gone = dependentsOf(id).filter((x) => active.has(x));
			if (gone.length && !confirm(`„${MODULE_BY_ID[id].label}“ ausschalten? Das schaltet auch aus: ${gone.map((x) => MODULE_BY_ID[x].label).join(', ')}.\n\nDie Daten bleiben erhalten.`)) return;
			setChoice(disable(db.data.settings?.modules, id));
		}
	}
	function applyPreset(id: PresetId) {
		if (!isAdmin) return;
		const lost = [...active].filter((m) => !presetChoice(id)[m]);
		if (lost.length && !confirm(`Voreinstellung „${PRESETS.find((p) => p.id === id)!.label}“ übernehmen? Ausgeblendet wird: ${lost.map((x) => MODULE_BY_ID[x].label).join(', ')}.\n\nDie Daten bleiben erhalten.`)) return;
		setChoice(presetChoice(id));
	}
	function pick(t: Tab) { tab = t; try { history.replaceState(history.state, '', `/einstellungen#${t === 'zugaenge' ? 'zugaenge' : t}`); } catch { /* ignorieren */ } }
	$effect(() => { const h = location.hash.slice(1); if (h === 'zugaenge' || h === 'aussehen' || h === 'daten' || h === 'betrieb' || h === 'umfang') tab = h as Tab; });

	let f = $state<Company>({ ...db.data.company });
	let err = $state<Record<string, string>>({});
	const isPlaceholder = $derived(f.iban.replace(/\s/g, '').startsWith('DE0000') || f.email.endsWith('example.com'));

	function save(e: SubmitEvent) {
		e.preventDefault();
		const x: Record<string, string> = {};
		if (f.name.trim().length < 2) x.name = 'Bitte den Firmennamen eingeben.';
		if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) x.email = 'Das sieht nicht nach einer E-Mail-Adresse aus.';
		if (f.postal && !/^\d{5}$/.test(f.postal)) x.postal = 'Die Postleitzahl hat 5 Ziffern.';
		if (f.iban.trim() && !ibanValid(f.iban) && !f.iban.replace(/\s/g, '').startsWith('DE0000')) x.iban = 'Die IBAN-Prüfziffer stimmt nicht. Bitte prüfen.';
		err = x;
		if (Object.keys(x).length) return;
		db.setCompany({ ...f, name: f.name.trim() });
		toasts.push('Betriebsdaten gespeichert. Neue PDFs verwenden sie sofort.', { tone: 'success' });
	}

	// ── Sicherung ──
	const counts = $derived([['Kunden', db.data.customers.length], ['Angebote', db.data.quotes.length], ['Vorgänge', db.data.cases.length], ['Rechnungen', db.data.invoices.length], ['Zeitbuchungen', db.data.timeEntries.length], ['Mitarbeitende', db.data.employees.length]] as const);
	function exportAll() {
		const json = JSON.stringify({ format: 'resch-business-manager', version: 1, exportedAt: new Date().toISOString(), data: $state.snapshot(db.data) }, null, 2);
		downloadBytes(json, `Sicherung-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
		toasts.push('Sicherung heruntergeladen. Bewahren Sie die Datei sicher auf, sie enthält personenbezogene Daten.', { tone: 'success', ms: 9000 });
	}
	let pending = $state<{ data: Data; name: string; size: number } | null>(null);
	let confirmOpen = $state(false);
	let importErr = $state('');
	async function onFile(e: Event) {
		importErr = '';
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		(e.currentTarget as HTMLInputElement).value = '';
		if (!file) return;
		try {
			const parsed = JSON.parse(await file.text());
			const d = parsed?.data;
			if (parsed?.format !== 'resch-business-manager' || !d || !Array.isArray(d.customers) || !Array.isArray(d.quotes) || !Array.isArray(d.employees)) throw new Error('Das ist keine Sicherung dieser App.');
			pending = { data: d as Data, name: file.name, size: file.size };
			confirmOpen = true;
		} catch (ex) {
			importErr = ex instanceof Error ? ex.message : 'Die Datei konnte nicht gelesen werden.';
		}
	}
	function applyImport() {
		db.replaceAll(pending!.data);
		f = { ...db.data.company };
		confirmOpen = false;
		toasts.push('Sicherung eingespielt.', { tone: 'success' });
		pending = null;
	}
	// ── Demodaten: entfernen oder für ein Team vorgegebener Größe anlegen ──
	type DemoAction = 'leer' | 'team8' | 'team12';
	let demoAsk = $state<DemoAction | null>(null);
	let demoOpen = $state(false);
	const demoText = { leer: 'Alle Kunden, Angebote, Rechnungen, Mitarbeitenden, Zeiten und Mängel werden entfernt. Firmendaten und Kalkulationsannahmen bleiben.', team8: 'Alle jetzigen Daten werden durch die Demo mit 8 Mitarbeitenden ersetzt.', team12: 'Alle jetzigen Daten werden durch die Demo mit 12 Mitarbeitenden ersetzt: mehr Objekte, Pläne, Abwesenheiten und Zeitbuchungen.' } as const;
	const demoTitle = { leer: 'Demodaten entfernen?', team8: 'Demo mit 8 Personen laden?', team12: 'Demo mit 12 Personen laden?' } as const;
	function askDemo(a: DemoAction) { demoAsk = a; demoOpen = true; }
	function runDemo() {
		if (!demoAsk) return;
		if (demoAsk === 'leer') db.clear(); else db.reset(demoAsk === 'team12' ? 12 : 8);
		try { localStorage.removeItem('resch-onboarding-hidden'); } catch { /* ignorieren */ }
		toasts.push(demoAsk === 'leer' ? 'Alle Demodaten entfernt. Die App ist leer.' : `Demodaten für ${demoAsk === 'team12' ? 12 : 8} Mitarbeitende angelegt.`, { tone: 'success' });
		demoOpen = false;
		goto('/');
	}
</script>

<svelte:head><title>Einstellungen · Putzbetrieb</title></svelte:head>

<PageHead title="Einstellungen" subtitle="Betrieb, Zugänge, Aussehen und Daten, jeweils in einem eigenen Bereich." />

<div class="mb-5 flex flex-wrap gap-1 border-b border-line" role="tablist" aria-label="Bereiche der Einstellungen">
	{#each tabList as t}
		<button role="tab" id="tab-{t.id}" aria-selected={tab === t.id} aria-controls="panel-{t.id}" class="tab" onclick={() => pick(t.id)}>{t.label}</button>
	{/each}
</div>

<div class="grid items-start gap-5 {tab === 'betrieb' ? 'xl:grid-cols-[minmax(0,1fr)_380px]' : 'mx-auto max-w-3xl'}" role="tabpanel" id="panel-{tab}" aria-labelledby="tab-{tab}">
	{#if tab === 'betrieb'}
	<form class="card p-5" onsubmit={save} novalidate aria-labelledby="h-firm">
		<h2 id="h-firm" class="card-title mb-1">Betriebsdaten</h2>
		<p class="mb-4 text-sm text-muted">Diese Angaben stehen auf Angeboten, Rechnungen, Mahnungen und Berichten (Briefkopf und Fußzeile).</p>
		{#if isPlaceholder}<p class="mb-4 flex items-start gap-2 rounded-lg bg-warn-soft px-3 py-2.5 text-sm text-warn"><TriangleAlert size={16} class="mt-0.5 shrink-0" /> Noch Platzhalter-Daten. Tragen Sie Ihre echten Angaben ein, bevor Sie Dokumente versenden.</p>{/if}
		<div class="grid grid-cols-6 gap-3">
			<div class="col-span-6 sm:col-span-4"><label class="label" for="s-n">Firmenname</label><input id="s-n" class="input" aria-invalid={!!err.name} bind:value={f.name} />{#if err.name}<p class="mt-1 text-xs text-danger">{err.name}</p>{/if}</div>
			<div class="col-span-6 sm:col-span-2"><label class="label" for="s-o">Inhaber/in</label><input id="s-o" class="input" bind:value={f.owner} /></div>
			<div class="col-span-6"><label class="label" for="s-st">Straße und Hausnummer</label><input id="s-st" class="input" bind:value={f.street} /></div>
			<div class="col-span-2"><label class="label" for="s-p">PLZ</label><input id="s-p" class="input num" maxlength="5" aria-invalid={!!err.postal} bind:value={f.postal} />{#if err.postal}<p class="mt-1 text-xs text-danger">{err.postal}</p>{/if}</div>
			<div class="col-span-4"><label class="label" for="s-c">Ort</label><input id="s-c" class="input" bind:value={f.city} /></div>
			<div class="col-span-6 sm:col-span-3"><label class="label" for="s-t">Telefon</label><input id="s-t" type="tel" class="input" bind:value={f.phone} /></div>
			<div class="col-span-6 sm:col-span-3"><label class="label" for="s-e">E-Mail</label><input id="s-e" type="email" class="input" aria-invalid={!!err.email} bind:value={f.email} />{#if err.email}<p class="mt-1 text-xs text-danger">{err.email}</p>{/if}</div>
			<div class="col-span-6"><label class="label" for="s-w">Webseite</label><input id="s-w" class="input" bind:value={f.web} /></div>
			<div class="col-span-6 border-t border-line pt-3"><h3 class="mb-2 text-sm font-semibold">Bank und Steuer</h3></div>
			<div class="col-span-6 sm:col-span-2"><label class="label" for="s-b">Bank</label><input id="s-b" class="input" bind:value={f.bank} /></div>
			<div class="col-span-6 sm:col-span-3"><label class="label" for="s-i">IBAN</label><input id="s-i" class="input num" aria-invalid={!!err.iban} bind:value={f.iban} />{#if err.iban}<p class="mt-1 text-xs text-danger">{err.iban}</p>{/if}</div>
			<div class="col-span-6 sm:col-span-1"><label class="label" for="s-bic">BIC</label><input id="s-bic" class="input num" bind:value={f.bic} /></div>
			<div class="col-span-6"><label class="label" for="s-x">Umsatzsteuer-Identifikationsnummer</label><input id="s-x" class="input" bind:value={f.taxId} /></div>
		</div>
		<div class="mt-5 flex justify-end"><button class="btn btn-primary"><Save size={15} /> Speichern</button></div>
	</form>
	{/if}

	<div class="flex flex-col gap-4">
		{#if tab === 'daten'}
		<section class="card p-5" aria-labelledby="h-backup">
			<h2 id="h-backup" class="card-title mb-1">Sicherung und Datenübernahme</h2>
			<p class="mb-3 text-sm text-muted">Ihre Daten gehören Ihnen. Laden Sie jederzeit alles als eine Datei herunter oder spielen Sie eine Sicherung ein.</p>
			<dl class="mb-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">{#each counts as [l, n]}<div class="flex justify-between"><dt class="text-muted">{l}</dt><dd class="num font-medium">{n}</dd></div>{/each}</dl>
			<div class="flex flex-wrap gap-2">
				<button class="btn btn-primary" onclick={exportAll}><Download size={14} /> Alles exportieren</button>
				<label class="btn cursor-pointer"><Upload size={14} /> Sicherung einspielen<input type="file" accept="application/json,.json" class="sr-only" onchange={onFile} /></label>
			</div>
			{#if importErr}<p class="mt-3 text-sm text-danger" role="alert">{importErr}</p>{/if}
			<p class="mt-3 text-xs text-muted">Im Prototyp liegen die Daten nur in diesem Browser. Machen Sie regelmäßig eine Sicherung, bevor Sie Browserdaten löschen.</p>
		</section>
		{/if}
		{#if tab === 'aussehen'}
		<section class="card p-5" aria-labelledby="h-photo">
			<h2 id="h-photo" class="card-title mb-1">Mein Profilfoto</h2>
			<p class="mb-3 text-xs text-muted">Die Fotos sind Platzhalter (Unsplash) und zeigen nicht die angemeldete Person. Später lässt sich hier ein eigenes Foto hochladen.</p>
			<div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Profilfoto wählen">
				{#each PHOTO_IDS as id}
					{@const on = photoFor(db.me, db.data.avatars?.[db.me]) === id}
					<button type="button" role="radio" aria-checked={on} aria-label="Foto {id}" class="size-14 overflow-hidden rounded-full ring-offset-2 ring-offset-surface transition {on ? 'ring-2 ring-accent' : 'opacity-80 hover:opacity-100'}" onclick={() => { (db.data.avatars ??= {})[db.me] = id; }}><img src="/people/{id}.jpg" alt="" class="size-full object-cover" loading="lazy" /></button>
				{/each}
			</div>
		</section>
		{/if}
		{#if tab === 'umfang'}
			<section class="card p-5" aria-labelledby="h-umfang">
				<h2 id="h-umfang" class="card-title mb-1">Funktionsumfang</h2>
				<p class="mb-4 text-sm text-muted">Nicht jeder Betrieb braucht alles. Schalten Sie Bausteine aus, die Sie nicht nutzen: Sie verschwinden aus Menü, Suche und Mitarbeiter-App. <strong>Es wird nichts gelöscht.</strong> Alle Daten bleiben erhalten und sind nach dem Einschalten wieder da.</p>
				{#if !isAdmin}<p class="mb-4 rounded-lg bg-warn-soft px-3 py-2.5 text-sm text-warn">Nur Administratoren können den Funktionsumfang ändern.</p>{/if}
				<div class="mb-5 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Voreinstellung">
					{#each PRESETS as p}
						<button class="rounded-xl border-2 p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 {preset === p.id ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong'}" role="radio" aria-checked={preset === p.id} disabled={!isAdmin} onclick={() => applyPreset(p.id)}>
							<span class="flex items-center justify-between"><span class="font-semibold">{p.label}</span>{#if preset === p.id}<Check size={15} class="text-accent-text" />{/if}</span>
							<span class="mt-1 block text-xs text-muted">{p.hint}</span>
						</button>
					{/each}
				</div>
				<ul class="divide-y divide-line">
					{#each MODULES as m (m.id)}
						{@const on = active.has(m.id)}
						{@const chosenOn = db.data.settings?.modules?.[m.id] !== false}
						{@const blocked = chosenOn && !on}
						<li class="flex items-start gap-3 py-3 {on ? '' : 'opacity-70'}">
							<label class="relative mt-0.5 inline-flex shrink-0 cursor-pointer items-center {m.id === 'stamm' || !isAdmin ? 'cursor-not-allowed opacity-60' : ''}">
								<input type="checkbox" class="peer sr-only" checked={on} disabled={m.id === 'stamm' || !isAdmin} onchange={(e) => toggle(m.id, e.currentTarget.checked)} aria-label="{m.label} {on ? 'ausschalten' : 'einschalten'}" />
								<span class="h-6 w-11 rounded-full bg-line-strong transition peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2"></span>
								<span class="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5"></span>
							</label>
							<div class="min-w-0 flex-1">
								<p class="text-sm font-semibold">{m.label}{#if m.id === 'stamm'}{' '}<span class="text-xs font-normal text-muted">(immer an)</span>{/if}</p>
								<p class="text-xs text-muted">{m.blurb}</p>
								<p class="mt-0.5 text-[0.7rem] text-faint">Enthält: {m.contains}</p>
								{#if m.requires.filter((r) => r !== 'stamm').length}<p class="mt-0.5 text-[0.7rem] text-faint">Braucht: {m.requires.filter((r) => r !== 'stamm').map((r) => MODULE_BY_ID[r].label).join(', ')}</p>{/if}
								{#if blocked}<p class="mt-1 text-xs font-semibold text-warn">Ausgeschaltet, weil ein nötiger Baustein aus ist.</p>{/if}
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
		{#if tab === 'zugaenge'}
		<section class="card p-5" aria-labelledby="h-qr">
			<h2 id="h-qr" class="card-title mb-1">Stempeln</h2>
			<label class="flex cursor-pointer items-start gap-2 text-sm"><input type="checkbox" class="mt-1 size-[18px] accent-[var(--accent)]" checked={!!db.data.settings?.requireQr} onchange={(e) => { db.data.settings ??= {}; db.data.settings.requireQr = e.currentTarget.checked; }} /><span><strong>Einstempeln nur per QR-Code am Objekt</strong><span class="block text-xs text-muted">Mitarbeitende müssen den Aushang im Objekt scannen. Das belegt, dass sie vor Ort sind, ohne Standortdaten zu erheben. Den Aushang drucken Sie beim Kunden unter Objekte → „Stempel-QR“. Ausstempeln ist auch ohne Scan möglich.</span></span></label>
			<label class="mt-4 flex cursor-pointer items-start gap-2 text-sm"><input type="checkbox" class="mt-1 size-[18px] accent-[var(--accent)]" checked={!!db.data.settings?.geo} onchange={(e) => { db.data.settings ??= {}; db.data.settings.geo = e.currentTarget.checked; }} /><span><strong>Standort beim Stempeln abgleichen</strong><span class="block text-xs text-muted">Nur im Moment des Ein- und Ausstempelns fragt das Handy den Standort ab und vergleicht ihn mit der Objektposition (Karte). Gespeichert wird nur das Ergebnis, etwa „ca. 420 m entfernt“, keine Koordinaten und kein Verlauf. Es ist ein Hinweis fürs Büro und sperrt nie das Stempeln. Ohne Freigabe am Handy wird „kein Standort übermittelt“ vermerkt. Vor dem Einschalten: Betriebsrat beteiligen (§ 87 Abs. 1 Nr. 6 BetrVG), Beschäftigte informieren und Verarbeitungsverzeichnis ergänzen; lassen Sie das juristisch prüfen.</span></span></label>
			{#if db.data.settings?.geo}
				<label class="mt-3 ml-7 flex items-center gap-2 text-sm">Radius um das Objekt <input type="number" min="30" max="2000" step="10" class="input-bare w-24 rounded-lg border border-line px-2 py-1.5 text-right" value={db.data.settings?.geoRadius ?? 150} onchange={(e) => { db.data.settings ??= {}; db.data.settings.geoRadius = Math.min(2000, Math.max(30, Number(e.currentTarget.value) || 150)); }} /> m</label>
				<p class="mt-2 ml-7 text-xs text-muted">Objekte ohne Position (Karte → Objekt setzen) werden nicht abgeglichen. Abweichungen erscheinen als Notiz in der Zeitbuchung.</p>
			{/if}
		</section>
		{/if}
		{#if tab === 'zugaenge'}<AccessPanel />{/if}
		{#if tab === 'daten'}
		<section class="card p-5" aria-labelledby="h-demo">
			<h2 id="h-demo" class="card-title mb-1">Demodaten</h2>
			<p class="mb-3 text-xs text-muted">Alle Daten in diesem Prototyp sind erfunden und liegen nur im Browser. Starten Sie leer, um mit eigenen Daten zu arbeiten, oder laden Sie eine Demo in der Größe Ihres Teams. <strong>Sichern Sie vorher</strong> (Abschnitt Datensicherung), das Ersetzen lässt sich nicht rückgängig machen.</p>
			<div class="flex flex-wrap gap-2">
				<button class="btn" onclick={() => askDemo('leer')}><Trash2 size={14} /> Demodaten entfernen</button>
				<button class="btn" onclick={() => askDemo('team8')}><Users size={14} /> Demo mit 8 Personen</button>
				<button class="btn btn-primary" onclick={() => askDemo('team12')}><Users size={14} /> Demo mit 12 Personen</button>
			</div>
		</section>
		{/if}
		{#if tab === 'aussehen'}
		<section class="card p-5" aria-labelledby="h-pal">
			<h2 id="h-pal" class="card-title mb-1">Farbwelt</h2>
			<p class="mb-3 text-xs text-muted">Ein Set bestimmt Akzentfarbe, Seitenleiste und Kopfbereich. Die Auswahl gilt für dieses Gerät und wirkt sofort. Statusfarben (grün, gelb, rot) bleiben unverändert.</p>
			<div class="grid gap-2" style="grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr))" role="radiogroup" aria-label="Farbwelt">
				{#each palettes as p (p.id)}
					<button type="button" role="radio" aria-checked={ui.palette === p.id} class="flex items-center gap-3 rounded-lg border-2 p-2.5 text-left transition {ui.palette === p.id ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong'}" onclick={() => ui.setPalette(p.id)}>
						<span class="relative grid size-10 shrink-0 overflow-hidden rounded-md" style="background:{p.id === 'eigen' ? ui.custom : p.swatch[0]}"><span class="absolute inset-y-0 left-0 w-3" style="background:{p.swatch[1]}"></span></span>
						<span class="min-w-0 flex-1"><span class="block truncate text-sm font-semibold" title={p.label}>{p.label}</span><span class="block truncate text-xs text-muted" title={p.hint}>{p.hint}</span></span>
					</button>
				{/each}
			</div>
			{#if ui.palette === 'eigen'}<div class="mt-3 flex items-center gap-3"><label class="label !mb-0" for="pal-c">Akzentfarbe</label><input id="pal-c" type="color" class="h-9 w-14 cursor-pointer rounded border border-line-strong bg-surface p-0.5" value={ui.custom} oninput={(e) => ui.setCustom(e.currentTarget.value)} /><span class="num text-xs text-muted">{ui.custom}</span></div>{/if}
		</section>
		{/if}
		{#if tab === 'aussehen'}
		<section class="card p-5" aria-labelledby="h-role">
			<h2 id="h-role" class="card-title mb-1">Ansicht: Rolle und Basismodus</h2>
			<p class="mb-3 text-xs text-muted">Blendet Bereiche in der Navigation aus, damit jede Person nur sieht, was sie braucht. <strong>Das ist kein Zugriffsschutz:</strong> ohne Backend und Anmeldung bleiben alle Seiten per Adresse erreichbar.</p>
			<div class="grid gap-3 sm:grid-cols-2">
				<div><label class="label" for="ro">Rolle</label><select id="ro" class="input" bind:value={ui.role} onchange={() => ui.save()}>{#each Object.keys(roleLabels) as r}<option value={r}>{roleLabels[r as Role]}</option>{/each}</select></div>
				<label class="flex cursor-pointer items-end gap-2 pb-2 text-sm"><input type="checkbox" class="size-[18px] accent-[var(--accent)]" bind:checked={ui.basic} onchange={() => ui.save()} /><span><strong>Basismodus</strong> <span class="text-muted">nur die täglichen Bereiche</span></span></label>
			</div>
		</section>
		{/if}
		{#if tab === 'betrieb'}
		<section class="card p-5" aria-labelledby="h-exp">
			<h2 id="h-exp" class="card-title mb-1">Schnittstellen für die Steuerberatung</h2>
			<p class="mb-3 text-xs text-muted">Diese Angaben stecken in den Exporten (Rechnungen → DATEV-Buchungsstapel, Zeiten → Lohnstunden). <strong>Nicht von DATEV zertifiziert:</strong> Konten und Lohnarten bitte mit der Steuerberatung abstimmen und einen Testimport machen.</p>
			<div class="grid grid-cols-2 gap-3">
				<div><label class="label" for="x-b">Beraternummer</label><input id="x-b" class="input num" inputmode="numeric" bind:value={exportSettings.cfg.beraterNr} onchange={() => exportSettings.save()} /></div>
				<div><label class="label" for="x-m">Mandantennummer</label><input id="x-m" class="input num" inputmode="numeric" bind:value={exportSettings.cfg.mandantNr} onchange={() => exportSettings.save()} /></div>
				<div><label class="label" for="x-k">Kontenrahmen</label><select id="x-k" class="input" bind:value={exportSettings.cfg.kontenrahmen} onchange={() => exportSettings.save()}><option value="SKR03">SKR03</option><option value="SKR04">SKR04</option></select></div>
				<div><label class="label" for="x-e">Erlöskonto (19 %)</label><input id="x-e" class="input num" inputmode="numeric" placeholder="8400 / 4400" bind:value={exportSettings.cfg.revenueAccount} onchange={() => exportSettings.save()} /></div>
				<div class="col-span-2"><label class="label" for="x-d">Debitorenkonten ab</label><input id="x-d" type="number" class="input num" bind:value={exportSettings.cfg.debtorBase} onchange={() => exportSettings.save()} /></div>
			</div>
			<p class="label mt-4">Lohnart-Nummern (aus Ihrem Lohnprogramm)</p>
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{#each Object.keys(lohnLabels) as k}
					<div><label class="label" for="la-{k}">{lohnLabels[k as LohnKey]}</label><input id="la-{k}" class="input num" inputmode="numeric" bind:value={exportSettings.cfg.lohnarten[k as LohnKey]} onchange={() => exportSettings.save()} /></div>
				{/each}
			</div>
		</section>
		{/if}
		{#if tab === 'daten'}
		<section class="card p-5" aria-labelledby="h-privacy">
			<h2 id="h-privacy" class="card-title mb-2 flex items-center gap-2"><ShieldCheck size={15} class="text-muted" /> Datenschutz</h2>
			<ul class="flex flex-col gap-1.5 text-sm text-muted">
				<li>Daten verlassen den Browser nicht. Es gibt keine Tracker und keine externen Schriften.</li>
				<li>Der Kartenhintergrund wird von OpenStreetMap geladen (dabei sieht OpenStreetMap die IP-Adresse und den gezeigten Kartenausschnitt). Sie können ihn auf der Karte jederzeit ausschalten.</li>
				<li><label class="flex cursor-pointer items-start gap-2 text-fg"><input type="checkbox" class="mt-1" checked={privacy.tours} onchange={(e) => privacy.setTours(e.currentTarget.checked)} /><span><strong>Touren je Person auf der Karte anzeigen.</strong> <span class="text-muted">Aus = es sind nur Einsätze und Objekte sichtbar, keine Wege einzelner Mitarbeitender. Touren sind personenbezogen; vor dem Einschalten Betriebsrat/Datenschutz klären, falls vorhanden.</span></span></label></li>
				<li>Arbeitszeiten: Aufbewahrung mindestens 2 Jahre, Rechnungen 8 Jahre (Richtwerte, mit Steuerberater abgleichen).</li>
			</ul>
		</section>
		{/if}
	</div>
</div>

<Dialog bind:open={confirmOpen} title="Sicherung einspielen?" description="Alle aktuellen Daten in diesem Browser werden durch die Sicherung ersetzt. Das lässt sich nicht rückgängig machen.">
	{#snippet children()}
		{#if pending}<p class="text-sm">Datei <strong>{pending.name}</strong> ({Math.round(pending.size / 1024)} KB) mit {pending.data.customers.length} Kunden, {pending.data.quotes.length} Angeboten und {pending.data.employees.length} Mitarbeitenden. Tipp: Exportieren Sie vorher den aktuellen Stand.</p>{/if}
	{/snippet}
	{#snippet footer()}<button class="btn" onclick={() => (confirmOpen = false)}>Abbrechen</button><button class="btn btn-danger" onclick={applyImport}>Jetzt ersetzen</button>{/snippet}
</Dialog>

<Dialog bind:open={demoOpen} title={demoAsk ? demoTitle[demoAsk] : ''} description={demoAsk ? demoText[demoAsk] : ''} width={480}>
	{#snippet children()}<p class="text-sm">Das kann nicht rückgängig gemacht werden. Eine JSON-Sicherung vorher erstellen Sie im Abschnitt Datensicherung.</p>{/snippet}
	{#snippet footer()}<button class="btn" onclick={() => (demoOpen = false)}>Abbrechen</button><button class="btn {demoAsk === 'leer' ? 'btn-danger' : 'btn-primary'}" onclick={runDemo}>{demoAsk === 'leer' ? 'Entfernen' : 'Laden'}</button>{/snippet}
</Dialog>
