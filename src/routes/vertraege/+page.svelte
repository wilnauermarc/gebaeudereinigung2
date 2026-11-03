<script lang="ts">
	import { goto } from '$app/navigation';
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { addMonths } from '#lib/calc.ts';
	import { scenarios, WAGE_LG1_2026 } from '#lib/tariff.ts';
	import { company } from '#lib/company.ts';
	import { downloadBytes } from '#lib/download.ts';
	import { buildPriceAdjustPdf } from '#lib/pdf/documentsPdf.ts';
	import Dialog from '#lib/components/Dialog.svelte';
	import { formatEur, formatDate, todayKey, dayDiff, relativeDay } from '#lib/format.ts';
	import Badge from '#lib/components/Badge.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { ScrollText, TrendingUp, TriangleAlert, FileDown } from '@lucide/svelte';

	const today = todayKey();
	let scenarioId = $state('arbeitgeber');
	let wageShare = $state(75);
	const scenario = $derived(scenarios.find((s) => s.id === scenarioId)!);
	const wageRise = $derived(scenario.wageCents / WAGE_LG1_2026 - 1);
	const adjustPct = $derived(wageRise * (wageShare / 100));

	const contracts = $derived.by(() =>
		db.data.quotes
			.filter((q) => q.status === 'angenommen' && q.contract && q.kind === 'unterhaltsreinigung')
			.map((q) => {
				const c = q.contract!;
				let end = addMonths(c.startOn, c.termMonths);
				if (c.autoRenew) while (end <= today) end = addMonths(end, c.termMonths);
				const notice = addMonths(end, -c.noticeMonths);
				const toNotice = dayDiff(notice);
				const newPrice = Math.round(((q.monthlyCents ?? 0) * (1 + adjustPct)) / 100) * 100;
				return { q, c, end, notice, toNotice, newPrice };
			})
			.sort((a, b) => a.notice.localeCompare(b.notice))
	);
	const total = $derived(contracts.reduce((s, c) => s + (c.q.monthlyCents ?? 0), 0));
	const totalNew = $derived(contracts.reduce((s, c) => s + c.newPrice, 0));

	// Preisanpassungsschreiben
	let letterOpen = $state(false);
	let letterFor = $state<(typeof contracts)[number] | null>(null);
	let letter = $state({ validFrom: '2027-05-01', reason: '' });
	function openLetter(r: (typeof contracts)[number]) {
		letterFor = r;
		letter = { validFrom: '2027-05-01', reason: `Der Personalkostenanteil in der Gebäudereinigung ist durch die tarifliche Entwicklung des Mindestlohns gestiegen. Wir passen die Monatspauschale daher entsprechend dem Lohnkostenanteil von ${wageShare} % an.` };
		letterOpen = true;
	}
	async function makeLetter() {
		const r = letterFor!;
		const c = db.customer(r.q.customerId)!;
		const bytes = await buildPriceAdjustPdf({ company, customer: c, siteName: db.site(r.q.siteId)?.site.name, oldCents: r.q.monthlyCents ?? 0, newCents: r.newPrice, validFrom: letter.validFrom, reason: letter.reason, today, quoteNumber: r.q.number });
		downloadBytes(bytes, `Preisanpassung-${r.q.number}.pdf`, 'application/pdf');
		db.addEvent(r.q.customerId, 'angebot', `Preisanpassungsschreiben zu ${r.q.number} erstellt (ab ${formatDate(letter.validFrom)}). Es wurde nichts verschickt.`);
		letterOpen = false;
		toasts.push('Schreiben als PDF erstellt und vermerkt. Versand erfolgt durch Sie.', { tone: 'success', ms: 8000 });
	}
	function draft(q: (typeof contracts)[number]) {
		const v = db.newVersion(q.q);
		v.monthlyCents = q.newPrice;
		v.calculationNote = `Preisanpassung nach Szenario „${scenario.label}“: Lohnanteil ${wageShare} % × Lohnsteigerung ${(wageRise * 100).toFixed(1).replace('.', ',')} % = ${(adjustPct * 100).toFixed(1).replace('.', ',')} %.\n${v.calculationNote}`.trim();
		toasts.push(`Entwurf ${v.number} v${v.version} mit angepasstem Preis angelegt.`, { tone: 'success' });
		goto(`/angebote/${v.id}`);
	}
	import PageHead from '#lib/components/PageHead.svelte';
</script>

<svelte:head><title>Verträge · Resch Business Manager</title></svelte:head>

<PageHead title="Verträge" subtitle={`Laufende Unterhaltsreinigungen mit Laufzeit, Kündigungsfrist und Preisanpassung. ${formatEur(total)} monatlich netto.`}>
</PageHead>

<section class="card mb-5 p-4" aria-labelledby="h-adjust">
	<h2 id="h-adjust" class="card-title mb-1 flex items-center gap-2"><TrendingUp size={15} class="text-muted" /> Preisanpassung 2027 simulieren</h2>
	<p class="mb-3 text-xs text-muted">Der Branchenmindestlohn läuft zum 31.12.2026 aus, die Tarifrunde ist offen. Wählen Sie ein Szenario und sehen Sie, was es für Ihre Verträge bedeutet.</p>
	<div class="grid gap-3 sm:grid-cols-3">
		<div class="sm:col-span-2">
			<label class="label" for="sc">Szenario Lohnentwicklung (LG 1)</label>
			<select id="sc" class="input" bind:value={scenarioId}>{#each scenarios as s}<option value={s.id}>{s.label} → {formatEur(s.wageCents)}/Std.</option>{/each}</select>
			<p class="mt-1 text-xs text-muted">{scenario.hint}</p>
		</div>
		<div>
			<label class="label" for="ws">Lohnanteil am Preis (%)</label>
			<input id="ws" type="number" min="30" max="95" class="input num" bind:value={wageShare} />
			<p class="mt-1 text-xs text-muted">Annahme, bitte aus Ihrer Kalkulation prüfen</p>
		</div>
	</div>
	<div class="mt-4 flex flex-wrap items-baseline gap-x-8 gap-y-1 border-t border-line pt-3 text-sm">
		<span>Lohnsteigerung <strong class="num">{(wageRise * 100).toFixed(1).replace('.', ',')} %</strong></span>
		<span>Preisanpassung <strong class="num">{(adjustPct * 100).toFixed(1).replace('.', ',')} %</strong></span>
		<span>Monatlich vorher <strong class="num">{formatEur(total)}</strong></span>
		<span>nachher <strong class="num text-accent">{formatEur(totalNew)}</strong> <span class="text-muted">(+{formatEur(totalNew - total)})</span></span>
	</div>
</section>

<div class="card overflow-x-auto">
	{#if contracts.length === 0}
		<EmptyState icon={ScrollText} title="Noch keine Verträge" text="Sobald Sie ein Angebot der Unterhaltsreinigung als angenommen vermerken, erscheint es hier mit Laufzeit und Kündigungsfrist." />
	{:else}
		<table class="w-full min-w-[820px] border-collapse">
			<thead class="border-b border-line bg-bg/60"><tr><th class="th">Kunde</th><th class="th">Angebot</th><th class="th text-right">Monatlich</th><th class="th">Laufzeit bis</th><th class="th">Kündigungsfrist bis</th><th class="th text-right">Neuer Preis</th><th class="th w-[210px]"></th></tr></thead>
			<tbody class="divide-y divide-line">
				{#each contracts as r (r.q.id)}
					<tr>
						<td class="td max-w-[260px]"><a href="/kunden/{r.q.customerId}" class="block truncate font-medium hover:text-accent" title={db.customer(r.q.customerId)?.name}>{db.customer(r.q.customerId)?.name}</a><span class="block truncate text-xs text-muted">{r.c.termMonths} Monate · {r.c.noticeMonths} Monate Kündigung{r.c.autoRenew ? ' · verlängert sich' : ''}</span></td>
						<td class="td whitespace-nowrap"><a href="/angebote/{r.q.id}" class="hover:text-accent">{r.q.number}</a></td>
						<td class="td num text-right">{formatEur(r.q.monthlyCents)}</td>
						<td class="td num whitespace-nowrap">{formatDate(r.end)}</td>
						<td class="td whitespace-nowrap">
							<span class="num">{formatDate(r.notice)}</span>
							{#if r.toNotice < 0}<Badge tone="neutral" label="Frist verstrichen" />
							{:else if r.toNotice <= 90}<Badge tone="warn" label={relativeDay(r.notice)} />{/if}
						</td>
						<td class="td num text-right font-medium">{formatEur(r.newPrice)}</td>
						<td class="td"><div class="flex flex-wrap justify-end gap-1"><button class="btn btn-ghost btn-sm" onclick={() => openLetter(r)} disabled={adjustPct === 0}><FileDown size={13} /> Schreiben</button><button class="btn btn-sm" onclick={() => draft(r)} disabled={adjustPct === 0} title={adjustPct === 0 ? 'Im Szenario keine Erhöhung' : ''}>Entwurf</button></div></td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
<p class="mt-3 flex items-start gap-1.5 text-xs text-muted"><TriangleAlert size={13} class="mt-px shrink-0" /> Laufzeiten und Fristen sind Demo-Annahmen, maßgeblich ist der jeweilige Vertrag. Ob und wie eine Preisanpassung zulässig ist, regelt der Vertrag (Gleitklausel). Keine Rechtsberatung.</p>

<Dialog bind:open={letterOpen} title="Preisanpassungsschreiben" description={letterFor ? `${db.customer(letterFor.q.customerId)?.name}: ${formatEur(letterFor.q.monthlyCents)} → ${formatEur(letterFor.newPrice)}` : ''} width={540}>
	{#snippet children()}
		<div class="mb-3"><label class="label" for="l-d">Gültig ab</label><input id="l-d" type="date" class="input w-44" bind:value={letter.validFrom} /></div>
		<label class="label" for="l-r">Begründung im Schreiben</label>
		<textarea id="l-r" class="input" rows="5" bind:value={letter.reason}></textarea>
		<p class="mt-2 text-xs text-muted">Ob die Anpassung vertraglich zulässig ist und welche Ankündigungsfrist gilt, steht im Vertrag. Bitte vor dem Versand prüfen.</p>
	{/snippet}
	{#snippet footer()}
		<button class="btn" onclick={() => (letterOpen = false)}>Abbrechen</button>
		<button class="btn btn-primary" onclick={makeLetter} disabled={!letter.reason.trim() || !letter.validFrom}><FileDown size={14} /> PDF erstellen</button>
	{/snippet}
</Dialog>
