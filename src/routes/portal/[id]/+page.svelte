<script lang="ts">
	import { page } from '$app/state';
	import { db } from '#lib/db.svelte.ts';
	import { addDays } from '#lib/calc.ts';
	import { company } from '#lib/company.ts';
	import { formatDate, formatEur, todayKey, dayDiff } from '#lib/format.ts';
	import { VAT } from '#lib/pdf/documentsPdf.ts';
	import Badge from '#lib/components/Badge.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import { ArrowLeft, CircleCheck, Send, Info } from '@lucide/svelte';

	const today = todayKey();
	const customer = $derived(db.customer(page.params.id!));
	const preset = $derived(page.url.searchParams.get('objekt'));
	const defects = $derived(customer ? db.data.defects.filter((d) => d.customerId === customer.id).sort((a, b) => b.reportedOn.localeCompare(a.reportedOn)) : []);
	const reports = $derived(
		customer ? db.data.inspections.filter((i) => i.shared && db.site(i.siteId)?.customer.id === customer.id).sort((a, b) => b.date.localeCompare(a.date)) : []
	);
	const invoices = $derived(customer ? db.data.invoices.filter((i) => i.customerId === customer.id).sort((a, b) => b.issuedOn.localeCompare(a.issuedOn)) : []);
	const score = (items: { rating: string }[]) => {
		const rated = items.filter((i) => i.rating !== 'na');
		return rated.length ? Math.round((rated.filter((i) => i.rating === 'ok').length / rated.length) * 100) : 100;
	};

	let siteId = $state('');
	let text = $state('');
	let sent = $state(false);
	let err = $state('');
	$effect(() => { if (customer && !siteId) siteId = customer.sites.find((s) => s.id === preset)?.id ?? customer.sites[0]?.id ?? ''; });

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (text.trim().length < 5) return (err = 'Bitte beschreiben Sie das Problem in einem Satz.');
		const c = customer!;
		const id = 'd' + Date.now().toString(36);
		db.data.defects.push({ id, customerId: c.id, siteId: siteId || null, title: text.trim().slice(0, 80), description: text.trim(), status: 'offen', severity: 'normal', reportedOn: today, dueOn: addDays(today, 3), closedOn: null, recheck: true, source: 'kunde' });
		db.data.tasks.push({ id: 'a' + id, title: `Kundenmeldung prüfen: ${text.trim().slice(0, 50)}`, dueOn: today, customerId: c.id, done: false });
		db.addEvent(c.id, 'notiz', `Mängelmeldung über das Kundenportal: ${text.trim().slice(0, 100)}`);
		sent = true; text = ''; err = '';
	}
	const statusLabel = { offen: 'Eingegangen', in_bearbeitung: 'In Bearbeitung', erledigt: 'Behoben' } as const;
	const statusTone = { offen: 'warn', in_bearbeitung: 'info', erledigt: 'success' } as const;
</script>

<svelte:head><title>Kundenportal · {company.name}</title></svelte:head>

<div class="min-h-dvh bg-bg">
	<div class="bg-warn-soft px-4 py-2 text-center text-sm text-warn">
		<Info size={14} class="mr-1 inline" /> Vorschau der Kundenansicht mit Demo-Daten.
		<a href="/kunden/{customer?.id ?? ''}" class="ml-2 inline-flex items-center gap-1 font-semibold underline"><ArrowLeft size={13} /> Zurück zur Verwaltung</a>
	</div>

	{#if !customer}
		<main class="mx-auto max-w-xl px-4 py-16 text-center"><h1 class="page-title">Seite nicht gefunden</h1><p class="mt-2 text-muted">Dieser Link ist ungültig.</p></main>
	{:else}
		<header class="hero rounded-none">
			<div class="relative z-10 mx-auto flex max-w-3xl items-center gap-4 px-4 py-8">
				<Avatar name={customer.name} size={52} />
				<div><p class="text-sm text-white/70">{company.name} · Kundenportal</p><h1 class="text-2xl font-semibold tracking-tight">{customer.name}</h1></div>
			</div>
		</header>

		<main class="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">
			<section class="card p-5" aria-labelledby="h-melden">
				<h2 id="h-melden" class="card-title mb-1">Mangel melden</h2>
				<p class="mb-4 text-sm text-muted">Etwas ist nicht in Ordnung? Teilen Sie es uns mit, wir kümmern uns zeitnah darum.</p>
				{#if sent}
					<div class="flex items-start gap-3 rounded-lg bg-success-soft px-4 py-3 text-success" role="status">
						<CircleCheck size={18} class="mt-0.5 shrink-0" />
						<div><p class="font-semibold">Vielen Dank, Ihre Meldung ist eingegangen.</p><p class="text-sm">Wir prüfen sie noch heute und melden uns bei Rückfragen.</p><button class="mt-2 text-sm underline" onclick={() => (sent = false)}>Weitere Meldung erfassen</button></div>
					</div>
				{:else}
					<form class="flex flex-col gap-3" onsubmit={submit} novalidate>
						{#if customer.sites.length > 1}<div><label class="label" for="p-s">Objekt</label><select id="p-s" class="input" bind:value={siteId}>{#each customer.sites as s}<option value={s.id}>{s.name}</option>{/each}</select></div>{/if}
						<div><label class="label" for="p-t">Was ist Ihnen aufgefallen?</label><textarea id="p-t" class="input" rows="3" aria-invalid={!!err} placeholder="z. B. Im Erdgeschoss ist der Boden nicht gewischt." bind:value={text}></textarea>{#if err}<p class="mt-1 text-xs text-danger">{err}</p>{/if}</div>
						<div><button class="btn btn-primary"><Send size={14} /> Meldung senden</button></div>
					</form>
				{/if}
			</section>

			{#if defects.length}
				<section class="card" aria-labelledby="h-m"><div class="border-b border-line px-5 py-3"><h2 id="h-m" class="card-title">Ihre Meldungen</h2></div>
					<ul class="divide-y divide-line">
						{#each defects as d (d.id)}
							<li class="flex items-center gap-3 px-5 py-3"><div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{d.title}</p><p class="text-xs text-muted">gemeldet am {formatDate(d.reportedOn)}{d.siteId ? ` · ${db.site(d.siteId)?.site.name}` : ''}</p></div><Badge tone={statusTone[d.status]} label={statusLabel[d.status]} /></li>
						{/each}
					</ul>
				</section>
			{/if}

			<section class="card" aria-labelledby="h-r"><div class="border-b border-line px-5 py-3"><h2 id="h-r" class="card-title">Kontrollberichte</h2></div>
				{#if reports.length === 0}<p class="px-5 py-6 text-sm text-muted">Noch keine Berichte freigegeben.</p>
				{:else}
					<ul class="divide-y divide-line">
						{#each reports as r (r.id)}
							<li class="px-5 py-3">
								<div class="flex items-center justify-between gap-3"><div><p class="text-sm font-medium">{db.site(r.siteId)?.site.name}</p><p class="text-xs text-muted">Begehung am {formatDate(r.date)}</p></div><Badge tone={score(r.items) >= 90 ? 'success' : score(r.items) >= 70 ? 'warn' : 'danger'} label="{score(r.items)} % erfüllt" /></div>
								<ul class="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
									{#each r.items.filter((i) => i.rating !== 'na') as it (it.id)}<li class="flex items-center gap-2"><span class="size-2 shrink-0 rounded-full {it.rating === 'ok' ? 'bg-success' : 'bg-danger'}"></span>{it.label}</li>{/each}
								</ul>
							</li>
						{/each}
					</ul>
				{/if}
			</section>

			<section class="card" aria-labelledby="h-i"><div class="border-b border-line px-5 py-3"><h2 id="h-i" class="card-title">Rechnungen</h2></div>
				{#if invoices.length === 0}<p class="px-5 py-6 text-sm text-muted">Keine Rechnungen vorhanden.</p>
				{:else}
					<ul class="divide-y divide-line">
						{#each invoices as i (i.id)}
							<li class="flex items-center gap-3 px-5 py-3 text-sm"><span class="flex-1 font-medium">{i.number}</span><span class="num text-muted">{formatEur(i.netCents + Math.round(i.netCents * VAT))}</span>
								<Badge tone={i.paidAt ? 'success' : i.dueOn < today ? 'danger' : 'neutral'} label={i.paidAt ? 'Bezahlt' : i.dueOn < today ? 'Überfällig' : `fällig am ${formatDate(i.dueOn)}`} /></li>
						{/each}
					</ul>
				{/if}
			</section>
		</main>
	{/if}
</div>
