<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { quoteStatus, quoteKind, frequencies } from '#lib/labels.ts';
	import { formatEur, formatDate, todayKey } from '#lib/format.ts';
	import { addMonths } from '#lib/calc.ts';
	import { buildQuotePdf } from '#lib/pdf/quotePdf.ts';
	import { company } from '#lib/company.ts';
	import { priceCheck, avgPricePerM2 } from '#lib/cockpit.ts';
	import Badge from '#lib/components/Badge.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import MoneyInput from '#lib/components/MoneyInput.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { ChevronRight, GripVertical, Plus, Trash2, ArrowUp, ArrowDown, Download, ExternalLink, Send, Copy, ThumbsUp, ThumbsDown, Lock, FileQuestion, TriangleAlert } from '@lucide/svelte';
	import type { QuoteKind } from '#lib/types.ts';

	const quote = $derived(db.quote(page.params.id!));
	const customer = $derived(quote ? db.customer(quote.customerId) : undefined);
	const site = $derived(customer?.sites.find((s) => s.id === quote?.siteId));
	const editable = $derived(quote?.status === 'entwurf');
	const savedAt = $derived(db.savedAt);
	const linkedCase = $derived(quote ? db.data.cases.find((x) => x.quoteId === quote.id) : undefined);

	function touch() {
		if (quote) quote.updatedAt = new Date().toISOString();
	}
	function addItem() {
		quote!.items.push({ id: crypto.randomUUID(), text: '', frequency: quote!.kind === 'sonderreinigung' ? 'Einmalig' : '1 x pro Woche' });
		touch();
		queueMicrotask(() => {
			const els = document.querySelectorAll<HTMLInputElement>('[data-item-text]');
			els[els.length - 1]?.focus();
		});
	}
	function removeItem(i: number) {
		const [removed] = quote!.items.splice(i, 1);
		touch();
		toasts.push('Leistung entfernt.', { action: { label: 'Rückgängig', run: () => { quote!.items.splice(i, 0, removed); touch(); } } });
	}
	// Leistungen per Drag & Drop an der Griff-Fläche umsortieren (Pfeiltasten bleiben für die Tastatur)
	let dragIdx = $state<number | null>(null);
	let overIdx = $state<number | null>(null);
	function dropItem(to: number) {
		const from = dragIdx;
		dragIdx = null; overIdx = null;
		if (from === null || from === to) return;
		const [it] = quote!.items.splice(from, 1);
		quote!.items.splice(to, 0, it);
		touch();
	}
	function move(i: number, d: -1 | 1) {
		const items = quote!.items;
		const j = i + d;
		if (j < 0 || j >= items.length) return;
		[items[i], items[j]] = [items[j], items[i]];
		touch();
	}
	function setKind(k: QuoteKind) {
		quote!.kind = k;
		touch();
	}

	// ── Preisvorschau / Validierung ──
	const price = $derived(
		quote?.kind === 'unterhaltsreinigung'
			? { main: quote.monthlyCents, label: 'pro Monat' }
			: { main: quote?.hourlyCents ?? null, label: 'pro Stunde' }
	);
	const problems = $derived.by(() => {
		if (!quote) return [];
		const p: string[] = [];
		if (!price.main) p.push(quote.kind === 'unterhaltsreinigung' ? 'Monatspauschale angeben' : 'Stundenpreis angeben');
		if (quote.kind === 'sonderreinigung' && !quote.effortText.trim()) p.push('Geschätzten Aufwand angeben');
		if (!quote.items.length) p.push('Mindestens eine Leistung hinzufügen');
		else if (quote.items.some((i) => !i.text.trim())) p.push('Leere Leistungen ausfüllen oder entfernen');
		return p;
	});
	// ── Angebots-Assistent: Live-Marge aus kalkulierten Stunden ──
	const check = $derived(quote ? priceCheck(db.data, quote) : null);
	const avgM2 = $derived(avgPricePerM2(db.data));
	const ownM2 = $derived(quote?.areaM2 && quote.monthlyCents ? Math.round(quote.monthlyCents / quote.areaM2) : null);
	const pct = (m: number) => `${Math.round(m * 100)} %`;

	// ── PDF-Vorschau (echtes DIN-5008-PDF, 400 ms nach der letzten Änderung neu erzeugt) ──
	let pdfUrl = $state<string | null>(null);
	let pdfError = $state(false);
	let pdfBusy = $state(false);
	$effect(() => {
		if (!quote || !customer) return;
		// alles lesen, was ins PDF einfließt (die interne Kalkulationsnotiz gehört nicht dazu)
		const input = $state.snapshot({
			quote: { number: quote.number, version: quote.version, kind: quote.kind, hourlyCents: quote.hourlyCents, effortText: quote.effortText, monthlyCents: quote.monthlyCents, initialHourlyCents: quote.initialHourlyCents, items: quote.items, sentAt: quote.sentAt },
			customer: { name: customer.name, street: customer.street, postal: customer.postal, city: customer.city, contacts: customer.contacts },
			site: site ? { name: site.name, street: site.street, postal: site.postal, city: site.city } : null,
			company
		});
		pdfBusy = true;
		const t = setTimeout(async () => {
			try {
				const bytes = await buildQuotePdf(input);
				const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
				const old = pdfUrl;
				pdfUrl = url;
				pdfError = false;
				if (old) setTimeout(() => URL.revokeObjectURL(old), 2000);
			} catch (e) {
				console.error(e);
				pdfError = true;
			} finally {
				pdfBusy = false;
			}
		}, 400);
		return () => clearTimeout(t);
	});
	$effect(() => () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); });

	// ── Aktionen ──
	let finalizeOpen = $state(false);
	let responseOpen = $state(false);
	let followup = $state('');

	function openFinalize() {
		if (problems.length) {
			toasts.push(`Noch nicht vollständig: ${problems.join(', ')}.`, { tone: 'error', ms: 9000 });
			return;
		}
		const d = new Date(); d.setDate(d.getDate() + 7);
		followup = todayKey(d);
		finalizeOpen = true;
	}
	function finalize() {
		quote!.status = 'versendet';
		quote!.sentAt = new Date().toISOString();
		quote!.followupOn = followup || null;
		touch();
		db.addEvent(quote!.customerId, 'angebot', `Angebot ${quote!.number} als versendet vermerkt.`);
		finalizeOpen = false;
		toasts.push('Angebot als versendet vermerkt. Es wurde nichts per E-Mail verschickt.', { tone: 'success', ms: 8000 });
	}
	function respond(result: 'angenommen' | 'abgelehnt') {
		quote!.status = result;
		quote!.followupOn = null;
		touch();
		if (result === 'angenommen' && customer && customer.status !== 'aktiv') customer.status = 'aktiv';
		if (result === 'angenommen' && quote!.kind === 'unterhaltsreinigung') {
			// Standardvertrag: Start zum nächsten Monatsersten, 12 Monate, 3 Monate Kündigungsfrist (Annahme, bitte im Vertrag prüfen)
			const next = addMonths(todayKey().slice(0, 7) + '-01', 1);
			quote!.contract = { startOn: next, termMonths: 12, noticeMonths: 3, autoRenew: true };
		}
		db.addEvent(quote!.customerId, 'angebot', `Angebot ${quote!.number} ${result === 'angenommen' ? 'angenommen' : 'abgelehnt'}.`);
		responseOpen = false;
		toasts.push(result === 'angenommen' ? 'Als angenommen vermerkt.' : 'Als abgelehnt vermerkt.', { tone: 'success' });
	}
	function newVersion() {
		const v = db.newVersion(quote!);
		toasts.push(`Neue Version v${v.version} als Entwurf angelegt.`, { tone: 'success' });
		goto(`/angebote/${v.id}`);
	}
	function onKey(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
			e.preventDefault();
			touch();
			toasts.push('Änderungen sind automatisch gespeichert.', { ms: 2500 });
		}
	}
</script>

<svelte:window onkeydown={onKey} />
<svelte:head><title>{quote?.number ?? 'Angebot'} · Putzbetrieb</title></svelte:head>

{#if !quote || !customer}
	<div class="card"><EmptyState icon={FileQuestion} title="Angebot nicht gefunden" text="Dieses Angebot existiert nicht (mehr).">
		<a href="/angebote" class="btn">Zu den Angeboten</a>
	</EmptyState></div>
{:else}
	<nav class="mb-3 flex items-center gap-1 text-xs text-muted" aria-label="Brotkrumen">
		<a href="/angebote" class="hover:text-fg">Angebote</a><ChevronRight size={12} />
		<a href="/kunden/{customer.id}" class="max-w-[40ch] truncate hover:text-fg">{customer.name}</a><ChevronRight size={12} />
		<span class="text-fg">{quote.number}</span>
	</nav>

	{#if linkedCase}<p class="mb-3 rounded-lg bg-accent-soft px-3 py-2 text-sm">Gehört zu Vorgang <a class="font-semibold text-accent hover:underline" href="/vorgaenge/{linkedCase.id}">{linkedCase.number} · {linkedCase.title}</a>. Mit „Als versendet vermerken“ rückt der Vorgang zur Rückmeldung vor.</p>{/if}
	<div class="mb-5 flex flex-wrap items-center justify-between gap-3">
		<div class="flex flex-wrap items-center gap-2.5">
			<h1 class="text-xl font-semibold tracking-tight">{quote.number}{quote.version > 1 ? ` · v${quote.version}` : ''}</h1>
			<Badge tone={quoteStatus[quote.status].tone} label={quoteStatus[quote.status].label} />
			{#if !editable}<span class="flex items-center gap-1 text-xs text-muted"><Lock size={12} /> schreibgeschützt</span>{:else if savedAt}<span class="text-xs text-muted">Automatisch gespeichert</span>{/if}
		</div>
		<div class="flex flex-wrap gap-2">
			<a class="btn" class:pointer-events-none={!pdfUrl} class:opacity-45={!pdfUrl} href={pdfUrl ?? undefined} download="{quote.number}{quote.version > 1 ? `-v${quote.version}` : ''}.pdf"><Download size={14} /> PDF herunterladen</a>
			{#if quote.status === 'entwurf'}
				<button class="btn btn-primary" onclick={openFinalize}><Send size={14} /> Als versendet vermerken</button>
			{:else}
				{#if quote.status === 'versendet'}<button class="btn" onclick={() => (responseOpen = true)}>Rückmeldung erfassen</button>{/if}
				<button class="btn" onclick={newVersion}><Copy size={14} /> Neue Version</button>
			{/if}
		</div>
	</div>

	<div class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
		<!-- ───────── Editor ───────── -->
		<form class="flex flex-col gap-4" oninput={touch} onsubmit={(e) => e.preventDefault()}>
			<fieldset disabled={!editable} class="contents">
				<section class="card p-4">
					<h2 class="card-title mb-3">Angebot</h2>
					<div class="mb-3">
						<span class="label" id="kind-l">Angebotsart</span>
						<div class="inline-flex rounded-md border border-line-strong p-0.5" role="radiogroup" aria-labelledby="kind-l">
							{#each ['unterhaltsreinigung', 'sonderreinigung'] as k}
								<button type="button" role="radio" aria-checked={quote.kind === k} disabled={!editable}
									class="h-7 rounded px-3 text-sm font-medium disabled:cursor-not-allowed {quote.kind === k ? 'bg-accent-soft text-accent' : 'text-muted hover:text-fg'}"
									onclick={() => setKind(k as QuoteKind)}>{quoteKind[k as QuoteKind]}</button>
							{/each}
						</div>
						<p class="mt-1.5 text-xs text-muted">{quote.kind === 'unterhaltsreinigung' ? 'Regelmäßige Reinigung mit Monatspauschale.' : 'Einmalige Reinigung nach Stundenpreis und geschätztem Aufwand.'}</p>
					</div>
					<div class="grid gap-3 sm:grid-cols-2">
						<div>
							<span class="label">Kunde</span>
							<a href="/kunden/{customer.id}" class="input flex items-center truncate bg-subtle text-muted hover:text-fg" title={customer.name}>{customer.name}</a>
						</div>
						<div>
							<label class="label" for="site">Objekt</label>
							<select id="site" class="input" bind:value={quote.siteId}>
								{#each customer.sites as s}<option value={s.id}>{s.name}</option>{/each}
								{#if !customer.sites.length}<option value={null}>Kein Objekt hinterlegt</option>{/if}
							</select>
						</div>
					</div>
				</section>

				<section class="card p-4">
					<h2 class="card-title mb-3">Preis <span class="font-normal text-muted">(netto)</span></h2>
					{#if quote.kind === 'unterhaltsreinigung'}
						<div class="grid gap-3 sm:grid-cols-2">
							<div><label class="label" for="monthly">Monatspauschale *</label><MoneyInput id="monthly" bind:value={quote.monthlyCents} disabled={!editable} oninput={touch} /></div>
							<div><label class="label" for="initial">Stundenpreis für die Anfangsreinigung</label><MoneyInput id="initial" bind:value={quote.initialHourlyCents} disabled={!editable} oninput={touch} /></div>
						</div>
					{:else}
						<div class="grid gap-3 sm:grid-cols-2">
							<div><label class="label" for="hourly">Stundenpreis *</label><MoneyInput id="hourly" bind:value={quote.hourlyCents} disabled={!editable} oninput={touch} /></div>
							<div><label class="label" for="effort">Geschätzter Aufwand *</label><input id="effort" class="input" bind:value={quote.effortText} placeholder="z. B. ca. 8–12 Stunden" /></div>
						</div>
					{/if}
				</section>

				<section class="card p-4" aria-labelledby="h-eco">
					<h2 id="h-eco" class="card-title mb-1">Wirtschaftlichkeit</h2>
					<p class="mb-3 text-xs text-muted">{quote.kind === 'unterhaltsreinigung' ? 'Tragen Sie die kalkulierten Stunden ein (oder übernehmen Sie sie aus dem Kalkulator), dann sehen Sie sofort, was der Preis bringt.' : 'Stundenpreis gegen die Lohnstundenkosten.'}</p>
					{#if quote.kind === 'unterhaltsreinigung'}
						<div class="mb-3 grid gap-3 sm:grid-cols-2">
							<div><label class="label" for="ch">Kalkulierte Stunden pro Monat</label><input id="ch" type="number" min="0" step="0.5" class="input num text-right" bind:value={quote.calcHours} /></div>
							<div><label class="label" for="ca">Fläche in m² (optional)</label><input id="ca" type="number" min="0" class="input num text-right" bind:value={quote.areaM2} /></div>
						</div>
					{/if}
					{#if check}
						<div class="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line text-center">
							<div class="bg-surface px-3 py-2.5"><p class="text-xs text-muted" title="Lohn mit Nebenkosten, unproduktive Zeit, Material, Maschinen und Gemeinkosten. Nur Lohn: {formatEur(check.wageCost)}">Selbstkosten</p><p class="num text-sm font-semibold">{formatEur(check.cost)}</p></div>
							<div class="bg-surface px-3 py-2.5"><p class="text-xs text-muted">Marge</p><p class="num text-sm font-semibold {check.tone === 'danger' ? 'text-danger' : check.tone === 'warn' ? 'text-warn' : 'text-success'}">{pct(check.margin)}</p></div>
							<div class="bg-surface px-3 py-2.5"><p class="text-xs text-muted">Erlös je Std.</p><p class="num text-sm font-semibold">{check.perHourRevenue ? formatEur(check.perHourRevenue) : '–'}</p></div>
						</div>
						{#if check.tone !== 'success'}
							<p class="mt-3 rounded-md px-3 py-2 text-sm {check.tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-warn-soft text-warn'}">
								{check.tone === 'danger' ? 'Der Preis deckt die Selbstkosten nicht.' : `Unter dem Ziel von ${pct(check.targetMargin)} Marge.`}
								{#if quote.kind === 'unterhaltsreinigung'}Laut Kalkulator wären {formatEur(check.targetPrice)} nötig, kostendeckend ab {formatEur(check.floorPrice)}.{:else}Laut Kalkulator wären {formatEur(check.targetPrice)} je Stunde nötig, kostendeckend ab {formatEur(check.floorPrice)}.{/if}
							</p>
						{/if}
						{#if ownM2 && avgM2}<p class="mt-2 text-xs text-muted">Preis je m² und Monat: <strong class="num text-fg">{formatEur(ownM2)}</strong>, Ihre laufenden Objekte liegen im Schnitt bei <span class="num">{formatEur(avgM2)}</span>.</p>{/if}
					{:else}
						<p class="rounded-md bg-subtle px-3 py-2 text-sm text-muted">{quote.kind === 'unterhaltsreinigung' ? 'Monatspauschale und kalkulierte Stunden eintragen, dann erscheint die Bewertung.' : 'Stundenpreis eintragen, dann erscheint die Bewertung.'}</p>
					{/if}
				</section>

				<section class="card">
					<div class="flex items-center justify-between border-b border-line px-4 py-3">
						<h2 class="card-title">Leistungen <span class="num font-normal text-faint">{quote.items.length}</span></h2>
						{#if editable}<button type="button" class="btn btn-sm" onclick={addItem}><Plus size={13} /> Leistung</button>{/if}
					</div>
					{#if quote.items.length === 0}
						<EmptyState icon={Plus} title="Noch keine Leistungen" text="Fügen Sie hinzu, was gereinigt wird und wie oft. Die Leistungen erscheinen im Angebot nach Häufigkeit gruppiert.">
							{#if editable}<button type="button" class="btn btn-primary" onclick={addItem}><Plus size={14} /> Erste Leistung hinzufügen</button>{/if}
						</EmptyState>
					{:else}
						<ul class="divide-y divide-line">
							{#each quote.items as item, i (item.id)}
								<li class="flex flex-wrap items-center gap-2 px-4 py-2.5 transition-colors sm:flex-nowrap {dragIdx === i ? 'opacity-40' : ''} {overIdx === i && dragIdx !== i ? 'bg-accent-soft' : ''}" role="presentation" ondragover={(ev) => { if (dragIdx !== null) { ev.preventDefault(); overIdx = i; } }} ondragleave={() => { if (overIdx === i) overIdx = null; }} ondrop={(ev) => { ev.preventDefault(); dropItem(i); }}>
									{#if editable}<span role="presentation" draggable="true" ondragstart={(ev) => { dragIdx = i; ev.dataTransfer?.setData('text/plain', String(i)); if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'move'; const row = (ev.currentTarget as HTMLElement).closest('li'); if (row) ev.dataTransfer?.setDragImage(row, 16, 16); }} ondragend={() => { dragIdx = null; overIdx = null; }} class="-ml-1 cursor-grab text-faint hover:text-fg active:cursor-grabbing" title="Ziehen zum Sortieren" aria-hidden="true"><GripVertical size={15} /></span>{/if}
									<span class="num w-5 shrink-0 text-xs text-faint">{i + 1}</span>
									<input data-item-text class="input min-w-0 flex-1 basis-full sm:basis-auto" aria-label="Leistung {i + 1}" placeholder="Beschreibung der Leistung" bind:value={item.text}
										onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }} />
									<select class="input w-[150px] shrink-0" aria-label="Häufigkeit Leistung {i + 1}" bind:value={item.frequency}>
										{#each frequencies as f}<option>{f}</option>{/each}
									</select>
									{#if editable}
										<div class="flex shrink-0">
											<button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Nach oben" disabled={i === 0} onclick={() => move(i, -1)}><ArrowUp size={13} /></button>
											<button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Nach unten" disabled={i === quote.items.length - 1} onclick={() => move(i, 1)}><ArrowDown size={13} /></button>
											<button type="button" class="btn btn-ghost btn-icon btn-sm hover:text-danger" aria-label="Leistung entfernen" onclick={() => removeItem(i)}><Trash2 size={13} /></button>
										</div>
									{/if}
									<div class="flex basis-full flex-wrap items-center gap-3 pl-8 sm:pl-8">
										<label class="flex cursor-pointer items-center gap-2 text-sm text-muted"><input type="checkbox" class="size-4 accent-[var(--accent)]" checked={!!item.optional} disabled={!editable} onchange={(e) => { item.optional = e.currentTarget.checked; item.extraCents = item.extraCents ?? null; touch(); }} /> Option (nicht im Preis enthalten)</label>
										{#if item.optional}
											<div class="w-44"><MoneyInput bind:value={item.extraCents} disabled={!editable} oninput={touch} placeholder="Aufpreis" /></div>
											<span class="text-xs text-muted">Aufpreis netto {quote.kind === 'unterhaltsreinigung' ? 'pro Monat' : 'pro Stunde'}</span>
										{/if}
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</section>

				<section class="card p-4">
					<h2 class="card-title mb-3">Intern</h2>
					<label class="label" for="calc">Kalkulationsnotiz</label>
					<textarea id="calc" class="input" rows="3" bind:value={quote.calculationNote} placeholder="Nur für uns sichtbar, erscheint nie im Angebots-PDF."></textarea>
					<p class="mt-1 flex items-center gap-1 text-xs text-muted"><Lock size={11} /> Erscheint nicht in der Vorschau rechts und nicht im Ausdruck.</p>
				</section>
			</fieldset>
			{#if quote.status === 'versendet'}
				<section class="card p-4">
					<h2 class="card-title mb-3">Nachfassen</h2>
					<label class="label" for="fu">Wiedervorlage</label>
					<input id="fu" type="date" class="input w-44" bind:value={quote.followupOn} />
					<p class="mt-1 text-xs text-muted">Erscheint bis dahin auf „Heute“ unter Wiedervorlagen.</p>
				</section>
			{/if}
		</form>

		<!-- ───────── Vorschau ───────── -->
		<div class="xl:sticky xl:top-20">
			<div class="mb-2 flex items-center justify-between text-xs">
				<span class="font-medium text-muted">Vorschau · DIN 5008, Form B{pdfBusy ? ' · wird aktualisiert …' : ''}</span>
				{#if pdfUrl}<a class="flex items-center gap-1 text-muted hover:text-fg" href={pdfUrl} target="_blank" rel="noopener"><ExternalLink size={12} /> In neuem Tab</a>{/if}
			</div>
			<div class="card h-[calc(100dvh-9rem)] min-h-[560px] overflow-hidden bg-subtle">
				{#if pdfError}
					<EmptyState icon={FileQuestion} title="Vorschau nicht möglich" text="Das PDF konnte nicht erzeugt werden. Ihre Eingaben sind nicht verloren, bitte Angaben prüfen." />
				{:else if pdfUrl}
					<iframe title="Angebots-PDF Vorschau" src="{pdfUrl}#toolbar=0&navpanes=0&view=FitH" class="size-full border-0 bg-white"></iframe>
				{:else}
					<div class="grid size-full place-items-center"><div class="skeleton h-3/4 w-3/5"></div></div>
				{/if}
			</div>
		</div>
	</div>

	<Dialog bind:open={finalizeOpen} title="Als versendet vermerken?" description="Das Angebot wird als versendet vermerkt und danach schreibgeschützt. Es wird nichts per E-Mail verschickt, das PDF geben Sie selbst an den Kunden.">
		{#snippet children()}
			{#if check && check.tone !== 'success'}<p class="mb-3 rounded-md px-3 py-2 text-sm {check.tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-warn-soft text-warn'}">Achtung: Die Marge nach Selbstkosten liegt bei {pct(check.margin)}{check.tone === 'danger' ? ', der Preis deckt die Kosten nicht' : `, unter dem Ziel von ${pct(check.targetMargin)}`}.</p>{/if}
			<div class="mb-1"><label class="label" for="fu-new">Wiedervorlage zum Nachfassen</label><input id="fu-new" type="date" class="input w-44" bind:value={followup} /></div>
		{/snippet}
		{#snippet footer()}
			<button class="btn" onclick={() => (finalizeOpen = false)}>Abbrechen</button>
			<button class="btn btn-primary" onclick={finalize}><Send size={14} /> Vermerken</button>
		{/snippet}
	</Dialog>

	<Dialog bind:open={responseOpen} title="Rückmeldung des Kunden" description="Wie hat {customer.name} auf {quote.number} reagiert?">
		{#snippet children()}{/snippet}
		{#snippet footer()}
			<button class="btn" onclick={() => respond('abgelehnt')}><ThumbsDown size={14} /> Abgelehnt</button>
			<button class="btn btn-primary" onclick={() => respond('angenommen')}><ThumbsUp size={14} /> Angenommen</button>
		{/snippet}
	</Dialog>
{/if}
