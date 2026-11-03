<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { contractQuotes, economics, findGaps, forecast, healthScores, healthTone, costPerHour, MIN_MARGIN, TARGET_MARGIN } from '#lib/cockpit.ts';
	import { scenarios, WAGE_LG1_2026, STATUTORY_MIN_2027 } from '#lib/tariff.ts';
	import { formatEur, formatDate, todayKey } from '#lib/format.ts';
	import Avatar from '#lib/components/Avatar.svelte';
	import Badge from '#lib/components/Badge.svelte';
	import ScoreRing from '#lib/components/ScoreRing.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { ArrowRight, Gauge, CheckCheck, Info, ListPlus, Pencil } from '@lucide/svelte';

	const today = todayKey();
	const month = $derived(db.refMonth);
	const nowMonth = today.slice(0, 7);
	const label = (m: string) => new Date(m + '-15T12:00:00Z').toLocaleDateString('de-DE', { month: 'long', year: 'numeric', timeZone: 'UTC' });
	const pct = (m: number) => `${Math.round(m * 100)} %`;
	const fmt = (h: number) => h.toLocaleString('de-DE', { maximumFractionDigits: 0 });

	const health = $derived(healthScores(db.data, month, today));
	const gaps = $derived(findGaps(db.data, today));
	const eco = $derived(contractQuotes(db.data).map((q) => economics(db.data, q, month)));
	const sum = $derived({ revenue: eco.reduce((a, e) => a + e.revenue, 0), cost: eco.reduce((a, e) => a + e.cost, 0) });
	const totalMargin = $derived(sum.revenue ? (sum.revenue - sum.cost) / sum.revenue : 0);
	const fc = $derived(contractQuotes(db.data).map((q) => ({ q, f: forecast(db.data, q, nowMonth, today) })));
	const fcRevenue = $derived(fc.reduce((a, x) => a + x.f.revenue, 0));
	const fcCost = $derived(fc.reduce((a, x) => a + x.f.cost, 0));
	const fcMargin = $derived(fcRevenue ? (fcRevenue - fcCost) / fcRevenue : 0);
	const critical = $derived(health.filter((h) => h.score < 50).length);

	// ── Tarif-Simulator ──
	let wage = $state(WAGE_LG1_2026);
	const sim = $derived(
		contractQuotes(db.data).map((q) => {
			const base = economics(db.data, q, month);
			const now = economics(db.data, q, month, { wageCents: wage });
			// Kosten skalieren linear mit dem Lohn, daher lassen sich Break-even und Zielpreis direkt ableiten
			const cost0 = base.cost || 1;
			const breakEven = Math.round(db.data.calc.wageCents * (1 - MIN_MARGIN) * (base.revenue / cost0));
			const needed = Math.ceil(now.cost / (1 - TARGET_MARGIN) / 100) * 100;
			return { q, base, now, breakEven, needed, extra: Math.max(0, needed - base.revenue) };
		}).sort((a, b) => a.now.margin - b.now.margin)
	);
	const simRevenue = $derived(sim.reduce((a, s) => a + s.now.revenue, 0));
	const simCost = $derived(sim.reduce((a, s) => a + s.now.cost, 0));
	const simMargin = $derived(simRevenue ? (simRevenue - simCost) / simRevenue : 0);
	const below = $derived(sim.filter((s) => s.now.margin < MIN_MARGIN).length);
	const extraTotal = $derived(sim.reduce((a, s) => a + s.extra, 0));

	function task(g: (typeof gaps)[number]) {
		const title = `Ausfall klären: ${db.employee(g.employeeId)?.name}, ${db.site(g.siteId)?.customer.name.slice(0, 30) ?? ''} am ${formatDate(g.date)}`;
		if (db.data.tasks.some((t) => t.title === title && !t.done)) return toasts.push('Die Aufgabe gibt es schon.');
		db.data.tasks.push({ id: 'a' + Date.now().toString(36), title, dueOn: today, customerId: db.site(g.siteId)?.customer.id ?? null, done: false });
		toasts.push('Aufgabe angelegt.', { tone: 'success' });
	}
	const kindLabel = { fehlt: 'Keine Buchung', lang: 'Sehr lang', abwesend: 'Trotz Abwesenheit', doppelt: 'Überschneidung' } as const;
	const bars = [['margin', 'Marge'], ['plan', 'Plan'], ['quality', 'Qualität'], ['payment', 'Zahlung']] as const;
	import PageHead from '#lib/components/PageHead.svelte';
	import type { Instrument, NextStep } from '#lib/ux.ts';

	type Tab = 'uebersicht' | 'objekte' | 'luecken' | 'tarif';
	let tab = $state<Tab>('uebersicht');
	const tabs = $derived<[Tab, string, number | null][]>([['uebersicht', 'Übersicht', null], ['objekte', 'Objekte', health.length], ['luecken', 'Lücken', gaps.length], ['tarif', 'Tarif-Simulator', null]]);
	const avgScore = $derived(health.length ? health.reduce((a, h) => a + h.score, 0) / health.length : 0);
	const instruments = $derived<Instrument[]>([
		{ kind: 'gauge', label: 'Marge nach Lohn', value: Math.min(1, totalMargin / TARGET_MARGIN), shown: Math.max(0, totalMargin), sub: `Ziel ${pct(TARGET_MARGIN)} · ${formatEur(sum.revenue - sum.cost)}`, good: 0.9, warn: MIN_MARGIN / TARGET_MARGIN },
		{ kind: 'gauge', label: 'Prognose nach Lohn', value: Math.min(1, fcMargin / TARGET_MARGIN), shown: Math.max(0, fcMargin), sub: `Monatsende ${label(nowMonth)}`, good: 0.9, warn: MIN_MARGIN / TARGET_MARGIN },
		{ kind: 'gauge', label: 'Objekt-Gesundheit', value: avgScore / 100, sub: `Ø Score, ${critical} kritisch`, good: 0.75, warn: 0.5 },
		{ kind: 'stat', label: 'Auffälligkeiten', value: String(gaps.length), sub: 'letzte 7 Tage', tone: gaps.length ? 'warn' : 'success' }
	]);
	const nextStep = $derived<NextStep>(
		critical ? { tone: 'danger', text: `${critical} ${critical === 1 ? 'Objekt ist' : 'Objekte sind'} kritisch (Score unter 50). Beginnen Sie mit „${db.customer(health[0]?.quote.customerId ?? '')?.name ?? ''}“.`, cta: { label: 'Objekte ansehen', onclick: () => (tab = 'objekte') } }
		: gaps.length ? { tone: 'warn', text: `${gaps.length} Auffälligkeit${gaps.length === 1 ? '' : 'en'} im Einsatzplan gegen Zeitbuchungen.`, cta: { label: 'Lücken prüfen', onclick: () => (tab = 'luecken') } }
		: { tone: 'ok', text: 'Alle Objekte im grünen Bereich, keine Lücken in den Buchungen.' }
	);
</script>

<svelte:head><title>Cockpit · Objektia</title></svelte:head>

<PageHead title="Controlling-Cockpit" subtitle={`Wo steht der Betrieb, wo muss ich eingreifen? Basis Monat ${label(month)}.`} {instruments} next={nextStep} />

<div class="my-5 flex flex-wrap gap-1 border-b border-line" role="tablist" aria-label="Cockpit-Bereiche">
	{#each tabs as [k, l, n]}
		<button class="tab" role="tab" aria-selected={tab === k} onclick={() => (tab = k)}>{l}{#if n !== null} <span class="num ml-1 text-xs opacity-70">{n}</span>{/if}</button>
	{/each}
</div>

{#if tab === 'uebersicht'}
<div class="grid gap-5 xl:grid-cols-2">
	<section class="card" aria-labelledby="h-top">
		<div class="flex items-center justify-between border-b border-line px-5 py-4"><div><h2 id="h-top" class="card-title">Zuerst kümmern</h2><p class="text-xs text-muted">Die drei schwächsten Objekte</p></div><button class="btn btn-sm" onclick={() => (tab = 'objekte')}>Alle <ArrowRight size={13} /></button></div>
		<ul class="divide-y divide-line">
			{#each health.slice(0, 3) as h (h.quote.id)}
				{@const c = db.customer(h.quote.customerId)}
				<li><a href="/kunden/{h.quote.customerId}" class="flex items-center gap-4 px-5 py-3 hover:bg-subtle/60"><ScoreRing score={h.score} /><div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold">{c?.name}</p><p class="truncate text-xs text-muted">Marge {pct(h.eco.margin)} · {formatEur(h.eco.revenue)} / Monat</p>{#if h.flags[0]}<div class="mt-1"><Badge tone="warn" label={h.flags[0]} /></div>{/if}</div><ArrowRight size={16} class="text-faint" /></a></li>
			{:else}
				<li><EmptyState icon={Gauge} title="Noch keine Verträge" text="Sobald Unterhaltsreinigungen angenommen sind, bewertet das Cockpit jedes Objekt." /></li>
			{/each}
		</ul>
	</section>
	<section class="card" aria-labelledby="h-top-gaps">
		<div class="flex items-center justify-between border-b border-line px-5 py-4"><div><h2 id="h-top-gaps" class="card-title">Neueste Auffälligkeiten</h2><p class="text-xs text-muted">Plan gegen Zeitbuchungen, letzte 7 Tage</p></div><button class="btn btn-sm" onclick={() => (tab = 'luecken')}>Alle <ArrowRight size={13} /></button></div>
		{#if gaps.length === 0}
			<EmptyState icon={CheckCheck} title="Alles lückenlos" text="Für jeden geplanten Einsatz gibt es eine plausible Zeitbuchung." />
		{:else}
			<ul class="divide-y divide-line">
				{#each gaps.slice(0, 4) as g, i (g.kind + g.date + g.employeeId + g.siteId + i)}
					<li class="px-5 py-3"><div class="mb-0.5 flex items-center gap-2"><Badge tone={g.kind === 'fehlt' ? 'danger' : 'warn'} label={kindLabel[g.kind]} /><span class="num text-xs text-muted">{formatDate(g.date)}</span></div><p class="text-sm">{g.text}</p></li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
<section class="card mt-5" aria-labelledby="h-fc">
	<div class="border-b border-line px-5 py-4"><h2 id="h-fc" class="card-title">Prognose {label(nowMonth)}</h2><p class="text-xs text-muted">Ist bis gestern plus geplante Stunden bis Monatsende, Abwesende sind abgezogen. Gesamt: <strong class="num text-fg">{pct(fcMargin)}</strong> Marge.</p></div>
	<div class="overflow-x-auto"><table class="w-full min-w-[480px] border-collapse">
		<thead class="border-b border-line bg-bg/60"><tr><th class="th">Objekt</th><th class="th text-right">Std.</th><th class="th text-right">Kosten</th><th class="th text-right">Marge</th></tr></thead>
		<tbody class="divide-y divide-line">
			{#each fc as x (x.q.id)}
				<tr><td class="td max-w-[260px] truncate" title={db.customer(x.q.customerId)?.name}>{db.customer(x.q.customerId)?.name}</td><td class="td num text-right">{fmt(x.f.hours)}</td><td class="td num text-right">{formatEur(x.f.cost)}</td><td class="td text-right"><Badge tone={healthTone(Math.max(0, x.f.margin / TARGET_MARGIN * 100))} label={pct(x.f.margin)} /></td></tr>
			{/each}
		</tbody>
	</table></div>
</section>
{/if}

{#if tab === 'objekte'}
<section class="card" aria-labelledby="h-health">
	<div class="border-b border-line px-5 py-4"><h2 id="h-health" class="card-title flex items-center gap-2"><Gauge size={16} class="text-muted" /> Objekt-Gesundheit</h2><p class="text-xs text-muted">Marge 40 %, Plan 20 %, Qualität 25 %, Zahlung 15 %. Das schlechteste Objekt steht oben.</p></div>
	{#if health.length === 0}
		<EmptyState icon={Gauge} title="Noch keine Verträge" text="Sobald Unterhaltsreinigungen angenommen sind, bewertet das Cockpit jedes Objekt." />
	{:else}
		<ul class="divide-y divide-line">
			{#each health as h (h.quote.id)}
				{@const c = db.customer(h.quote.customerId)}
				<li>
					<a href="/kunden/{h.quote.customerId}" class="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4 hover:bg-subtle/60">
						<ScoreRing score={h.score} />
						<div class="min-w-[220px] flex-1">
							<div class="flex items-center gap-2.5"><Avatar name={c?.name ?? ''} size={26} /><p class="truncate text-sm font-semibold" title={c?.name}>{c?.name}</p></div>
							<p class="mt-0.5 truncate pl-[38px] text-xs text-muted">{db.site(h.quote.siteId)?.site.name} · {formatEur(h.eco.revenue)} / Monat · Marge {pct(h.eco.margin)}</p>
							{#if h.flags.length}<div class="mt-2 flex flex-wrap gap-1.5 pl-[38px]">{#each h.flags as f}<Badge tone="warn" label={f} />{/each}</div>{/if}
						</div>
						<div class="grid w-full max-w-[300px] grid-cols-4 gap-2 sm:w-[300px]" aria-label="Teilnoten">
							{#each bars as [k, l]}
								<div title="{l}: {h.parts[k]} von 100"><div class="h-1.5 overflow-hidden rounded-full bg-subtle"><div class="h-full {h.parts[k] >= 75 ? 'bg-success' : h.parts[k] >= 50 ? 'bg-warn' : 'bg-danger'}" style="width: {h.parts[k]}%"></div></div><p class="mt-1 text-center text-[0.7rem] text-muted">{l}</p></div>
							{/each}
						</div>
						<ArrowRight size={16} class="text-faint" />
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>

{/if}

{#if tab === 'luecken'}
<section class="card" aria-labelledby="h-gaps">
		<div class="border-b border-line px-5 py-4"><h2 id="h-gaps" class="card-title flex items-center gap-2"><CheckCheck size={16} class="text-muted" /> Lücken-Detektor</h2><p class="text-xs text-muted">Einsatzplan gegen Zeitbuchungen der letzten 7 Tage: Ausfälle und Fehler, bevor Kunde oder Lohn sie merken.</p></div>
		{#if gaps.length === 0}
			<EmptyState icon={CheckCheck} title="Alles lückenlos" text="Für jeden geplanten Einsatz gibt es eine plausible Zeitbuchung." />
		{:else}
			<ul class="divide-y divide-line overflow-y-auto">
				{#each gaps as g, i (g.kind + g.date + g.employeeId + g.siteId + i)}
					<li class="flex flex-wrap items-center gap-3 px-5 py-3">
						<div class="min-w-[200px] flex-1"><div class="mb-0.5 flex items-center gap-2"><Badge tone={g.kind === 'fehlt' ? 'danger' : 'warn'} label={kindLabel[g.kind]} /><span class="num text-xs text-muted">{formatDate(g.date)}</span></div><p class="text-sm">{g.text}</p></div>
						<div class="flex gap-1">
							<a class="btn btn-sm" href="/zeiten?neu=1&emp={g.employeeId}&site={g.siteId ?? ''}&date={g.date}"><Pencil size={13} /> Nachtragen</a>
							<button class="btn btn-sm" onclick={() => task(g)}><ListPlus size={13} /> Aufgabe</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/if}

{#if tab === 'tarif'}
<section class="card" aria-labelledby="h-sim">
	<div class="border-b border-line px-5 py-4"><h2 id="h-sim" class="card-title">Tarif-Simulator: Was wäre, wenn der Lohn steigt?</h2><p class="text-xs text-muted">Rechnet die Monatsdaten von {label(month)} mit einem anderen Stundenlohn (Lohngruppe 1) durch. Sehen Sie, welche Objekte kippen und was die Preise tragen müssten.</p></div>
	<div class="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line px-5 py-4">
		<div class="min-w-[260px] flex-1">
			<label class="label" for="wage">Stundenlohn: <strong class="num text-fg">{formatEur(wage)}</strong> <span class="font-normal">(heute {formatEur(db.data.calc.wageCents)})</span></label>
			<input id="wage" type="range" min="1400" max="1900" step="5" class="w-full accent-[var(--accent)]" bind:value={wage} />
		</div>
		<div class="flex flex-wrap gap-1.5" role="group" aria-label="Szenarien">
			{#each scenarios as s}<button class="btn btn-sm {wage === s.wageCents ? 'border-accent bg-accent text-white' : ''}" aria-pressed={wage === s.wageCents} onclick={() => (wage = s.wageCents)} title={s.hint}>{s.label.split(' (')[0]} {formatEur(s.wageCents)}</button>{/each}
		</div>
	</div>
	<p class="border-b border-line px-5 py-2.5 text-xs {wage - STATUTORY_MIN_2027 < 50 ? 'bg-warn-soft font-medium text-warn' : 'text-muted'}">Abstand zum gesetzlichen Mindestlohn ab 2027 ({formatEur(STATUTORY_MIN_2027)}): <strong class="num">{formatEur(wage - STATUTORY_MIN_2027)}</strong>{wage - STATUTORY_MIN_2027 < 50 ? '. Der Abstand ist klein: Branchenlohn und gesetzlicher Lohn im Blick behalten.' : '.'}</p>
	<div class="grid grid-cols-3 gap-px border-b border-line bg-line text-center">
		<div class="bg-surface px-4 py-3"><p class="text-xs text-muted">Gesamtmarge</p><p class="num text-lg font-semibold {simMargin < MIN_MARGIN ? 'text-danger' : ''}">{pct(simMargin)} <span class="text-xs font-normal text-muted">statt {pct(totalMargin)}</span></p></div>
		<div class="bg-surface px-4 py-3"><p class="text-xs text-muted">Objekte unter {pct(MIN_MARGIN)} Marge</p><p class="num text-lg font-semibold {below ? 'text-danger' : 'text-success'}">{below}</p></div>
		<div class="bg-surface px-4 py-3"><p class="text-xs text-muted">Nötige Mehrerlöse für {pct(TARGET_MARGIN)} Ziel</p><p class="num text-lg font-semibold">{formatEur(extraTotal)} <span class="text-xs font-normal text-muted">/ Monat</span></p></div>
	</div>
	<div class="overflow-x-auto">
		<table class="w-full min-w-[760px] border-collapse">
			<thead class="border-b border-line bg-bg/60"><tr><th class="th">Objekt</th><th class="th text-right">Marge heute</th><th class="th text-right">Marge im Szenario</th><th class="th text-right">Break-even-Lohn ({pct(MIN_MARGIN)})</th><th class="th text-right">Preis für {pct(TARGET_MARGIN)} Marge</th></tr></thead>
			<tbody class="divide-y divide-line">
				{#each sim as s (s.q.id)}
					<tr>
						<td class="td max-w-[260px] truncate" title={db.customer(s.q.customerId)?.name}><a class="hover:text-accent" href="/kunden/{s.q.customerId}">{db.customer(s.q.customerId)?.name}</a></td>
						<td class="td num text-right text-muted">{pct(s.base.margin)}</td>
						<td class="td text-right"><Badge tone={s.now.margin < MIN_MARGIN ? 'danger' : s.now.margin < TARGET_MARGIN ? 'warn' : 'success'} label={pct(s.now.margin)} /></td>
						<td class="td num text-right {s.breakEven < wage ? 'font-semibold text-danger' : ''}">{formatEur(s.breakEven)}</td>
						<td class="td num text-right">{formatEur(s.needed)}{#if s.extra}<span class="block text-xs text-warn">+ {formatEur(s.extra)}</span>{/if}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="flex items-start gap-1.5 border-t border-line px-5 py-3 text-xs text-muted"><Info size={13} class="mt-px shrink-0" /> Lohnkosten = Stunden × Lohn × (1 + {db.data.calc.lnkPct} % Lohnnebenkosten) plus tarifliche Zuschläge, ohne Fahrzeit, Material und Gemeinkosten. Ziel- und Mindestmarge ({pct(TARGET_MARGIN)} und {pct(MIN_MARGIN)}) sind Annahmen. Die Tarifrunde 2027 ist offen, die Szenarien sind keine Prognose.</p>
</section>
{/if}
