<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { company } from '#lib/company.ts';
	import { downloadBytes } from '#lib/download.ts';
	import { hourlyRate, monthlyHours } from '#lib/calc.ts';
	import { contractQuotes } from '#lib/cockpit.ts';
	import { buildCalcSheetPdf, buildReferencesPdf } from '#lib/pdf/documentsPdf.ts';
	import { areaTypes } from '#lib/tariff.ts';
	import { todayKey, formatDate, dayDiff } from '#lib/format.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import Badge from '#lib/components/Badge.svelte';
	import { FileDown, CircleCheck, CircleAlert, Info } from '@lucide/svelte';

	const today = todayKey();

	// ── Eignungsnachweise: typische Unterlagen gegen die Nachweisliste prüfen ──
	const required = [
		{ key: 'Unbedenklichkeit', label: 'Unbedenklichkeitsbescheinigung Finanzamt', match: (t: string) => /finanzamt|unbedenklichkeit/i.test(t) },
		{ key: 'BG', label: 'Unbedenklichkeitsbescheinigung Berufsgenossenschaft', match: (t: string) => /berufsgenossenschaft|bg bau|\bbg\b/i.test(t) },
		{ key: 'Krankenkasse', label: 'Bescheinigung Krankenkasse / Sozialversicherung', match: (t: string) => /krankenkasse|sozialversicherung/i.test(t) },
		{ key: 'Haftpflicht', label: 'Betriebshaftpflicht-Nachweis', match: (t: string) => /haftpflicht/i.test(t) }
	];
	const own = $derived(db.data.docs.filter((d) => d.ownerType === 'betrieb'));
	const checks = $derived(required.map((r) => {
		const d = own.find((x) => r.match(x.title));
		const days = d?.validUntil ? dayDiff(d.validUntil) : null;
		return { ...r, doc: d, state: !d ? 'fehlt' : days !== null && days < 0 ? 'abgelaufen' : days !== null && days <= 60 ? 'bald' : 'ok', days };
	}));
	const ready = $derived(checks.filter((c) => c.state === 'ok').length);

	// ── Referenzliste ──
	let minArea = $state(0);
	let anonymize = $state(false);
	const refs = $derived(contractQuotes(db.data).map((q) => {
		const s = db.site(q.siteId);
		return { id: q.id, customer: db.customer(q.customerId)?.name ?? '', object: s?.site.name ?? '', area: s?.site.plan?.areaM2 ?? null, since: q.contract!.startOn, contact: db.customer(q.customerId)?.contacts[0]?.name ?? '' };
	}).filter((r) => (r.area ?? 0) >= minArea).sort((a, b) => (b.area ?? 0) - (a.area ?? 0)));
	let picked = $state<Record<string, boolean>>({});
	$effect(() => { for (const r of refs) if (!(r.id in picked)) picked[r.id] = true; });
	const chosen = $derived(refs.filter((r) => picked[r.id]));
	async function refPdf() {
		const rows = chosen.map((r, i) => ({ ...r, customer: anonymize ? `Referenz ${i + 1} (Objektart: ${/praxis|klinik|arzt/i.test(r.customer) ? 'Praxis/Gesundheit' : /senior|pflege/i.test(r.customer) ? 'Pflege' : /wohnung|haus|verwalt/i.test(r.customer) ? 'Wohnungswirtschaft' : 'Gewerbe'})` : r.customer, contact: anonymize ? '' : r.contact }));
		downloadBytes(await buildReferencesPdf({ company, rows, today }), 'Referenzliste.pdf', 'application/pdf');
		toasts.push(`Referenzliste mit ${rows.length} Einträgen erstellt.`, { tone: 'success' });
	}

	// ── Kalkulationsblatt ──
	const rate = $derived(hourlyRate(db.data.calc));
	let ex = $state({ label: 'Büroreinigung', areaM2: 1800, type: 'buero', perHour: 450, perWeek: 5 });
	$effect(() => { ex.perHour = areaTypes.find((a) => a.id === ex.type)?.perHour ?? ex.perHour; });
	const exHours = $derived(monthlyHours(ex.areaM2, ex.perHour, ex.perWeek));
	async function calcPdf() {
		downloadBytes(await buildCalcSheetPdf({ company, today, calc: $state.snapshot(db.data.calc), rateCents: Math.round(rate), example: { label: ex.label, areaM2: ex.areaM2, perHour: ex.perHour, perWeek: ex.perWeek, monthlyHours: exHours } }), 'Kalkulationsblatt.pdf', 'application/pdf');
		toasts.push('Kalkulationsblatt erstellt.', { tone: 'success' });
	}
</script>

<svelte:head><title>Bieter-Mappe · Resch Business Manager</title></svelte:head>

<PageHead title="Bieter-Mappe" subtitle="Unterlagen für Ausschreibungen auf Knopfdruck: Eignungsnachweise, Referenzliste, Kalkulationsblatt."
	instruments={[{ kind: 'gauge', label: 'Nachweise bereit', value: ready / checks.length, sub: `${ready} von ${checks.length} gültig`, good: 0.99, warn: 0.5, href: '/nachweise' }, { kind: 'stat', label: 'Referenzen', value: String(refs.length), sub: 'aus laufenden Verträgen' }, { kind: 'stat', label: 'Stundenverrechnungssatz', value: (rate / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }), sub: 'netto, aus Ihren Annahmen' }]}
	next={ready < checks.length ? { tone: 'warn', text: `${checks.length - ready} Eignungsnachweise fehlen oder sind abgelaufen. Ohne sie wird ein Angebot oft ausgeschlossen.`, cta: { label: 'Nachweise pflegen', href: '/nachweise' } } : { tone: 'ok', text: 'Alle typischen Eignungsnachweise sind gültig.' }} />

<div class="grid items-start gap-5 xl:grid-cols-2">
	<section class="card" aria-labelledby="h-eig">
		<div class="border-b border-line px-5 py-4"><h2 id="h-eig" class="card-title">Eignungsnachweise</h2><p class="text-xs text-muted">Typische Unterlagen öffentlicher Ausschreibungen, geprüft gegen Ihre Nachweisliste.</p></div>
		<ul class="divide-y divide-line">
			{#each checks as c (c.key)}
				<li class="flex items-center gap-3 px-5 py-3">
					{#if c.state === 'ok'}<CircleCheck size={18} class="shrink-0 text-success" />{:else}<CircleAlert size={18} class="shrink-0 {c.state === 'bald' ? 'text-warn' : 'text-danger'}" />{/if}
					<div class="min-w-0 flex-1"><p class="text-sm font-medium">{c.label}</p><p class="text-xs text-muted">{c.doc ? (c.doc.validUntil ? `gültig bis ${formatDate(c.doc.validUntil)}` : 'unbefristet') : 'noch nicht erfasst'}</p></div>
					<Badge tone={c.state === 'ok' ? 'success' : c.state === 'bald' ? 'warn' : 'danger'} label={c.state === 'ok' ? 'bereit' : c.state === 'bald' ? 'läuft bald ab' : c.state === 'abgelaufen' ? 'abgelaufen' : 'fehlt'} />
				</li>
			{/each}
		</ul>
		<p class="flex items-start gap-1.5 border-t border-line px-5 py-3 text-xs text-muted"><Info size={13} class="mt-px shrink-0" /> Welche Unterlagen verlangt werden, steht in der jeweiligen Ausschreibung. Die Liste ist eine Orientierung, keine Rechtsberatung.</p>
	</section>

	<section class="card" aria-labelledby="h-ref">
		<div class="border-b border-line px-5 py-4"><h2 id="h-ref" class="card-title">Referenzliste</h2><p class="text-xs text-muted">Aus Ihren laufenden Verträgen mit Fläche und Laufzeit.</p></div>
		<div class="flex flex-wrap items-end gap-4 border-b border-line px-5 py-3">
			<div><label class="label" for="ma">Mindestfläche (m²)</label><input id="ma" type="number" min="0" step="100" class="input num w-32" bind:value={minArea} /></div>
			<label class="flex cursor-pointer items-center gap-2 pb-2 text-sm"><input type="checkbox" class="size-4 accent-[var(--accent)]" bind:checked={anonymize} /> Kundennamen anonymisieren</label>
		</div>
		{#if refs.length === 0}<p class="px-5 py-8 text-center text-sm text-muted">Keine Referenzen mit diesen Kriterien. Flächen pflegen Sie am Objekt im Reinigungsplan.</p>
		{:else}
			<ul class="divide-y divide-line">
				{#each refs as r (r.id)}
					<li><label class="flex cursor-pointer items-center gap-3 px-5 py-2.5 hover:bg-subtle/60"><input type="checkbox" class="size-4 accent-[var(--accent)]" bind:checked={picked[r.id]} /><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{anonymize ? 'Referenz (anonymisiert)' : r.customer}</span><span class="block truncate text-xs text-muted">{r.object} · seit {formatDate(r.since)}</span></span><span class="num text-xs text-muted">{r.area ? `${r.area.toLocaleString('de-DE')} m²` : '–'}</span></label></li>
				{/each}
			</ul>
		{/if}
		<div class="border-t border-line px-5 py-3"><button class="btn btn-primary" onclick={refPdf} disabled={!chosen.length}><FileDown size={14} /> Referenzliste als PDF ({chosen.length})</button></div>
	</section>

	<section class="card xl:col-span-2" aria-labelledby="h-calc">
		<div class="border-b border-line px-5 py-4"><h2 id="h-calc" class="card-title">Kalkulationsblatt</h2><p class="text-xs text-muted">Stundenverrechnungssatz aufgeschlüsselt, mit Beispielrechnung. Das Fehlen dieses Blatts war in Stichproben ein Ausschlussgrund.</p></div>
		<div class="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-end">
			<div class="grid gap-3 sm:grid-cols-4">
				<div class="sm:col-span-2"><label class="label" for="e-l">Beispiel</label><input id="e-l" class="input" bind:value={ex.label} /></div>
				<div><label class="label" for="e-a">Fläche m²</label><input id="e-a" type="number" min="1" class="input num" bind:value={ex.areaM2} /></div>
				<div><label class="label" for="e-p">Reinigungen / Woche</label><input id="e-p" type="number" min="0.5" step="0.5" class="input num" bind:value={ex.perWeek} /></div>
				<div class="sm:col-span-2"><label class="label" for="e-t">Art</label><select id="e-t" class="input" bind:value={ex.type}>{#each areaTypes as a}<option value={a.id}>{a.label}</option>{/each}</select></div>
				<div><label class="label" for="e-h">m² / Std.</label><input id="e-h" type="number" min="1" class="input num" bind:value={ex.perHour} /></div>
				<div class="flex flex-col justify-end text-sm"><span class="text-xs text-muted">Ergebnis</span><strong class="num">{exHours.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Std./Monat</strong></div>
			</div>
			<button class="btn btn-primary" onclick={calcPdf}><FileDown size={14} /> Kalkulationsblatt als PDF</button>
		</div>
		<p class="border-t border-line px-5 py-3 text-xs text-muted">Aufschläge und Leistungswerte kommen aus Ihren Annahmen im Kalkulator. Prüfen Sie sie vor dem Einreichen, besonders nach Tarifänderungen.</p>
	</section>
</div>
