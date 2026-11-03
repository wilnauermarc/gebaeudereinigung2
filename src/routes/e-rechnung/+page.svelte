<script lang="ts">
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { company } from '#lib/company.ts';
	import { downloadBytes } from '#lib/download.ts';
	import { formatEur, formatDate } from '#lib/format.ts';
	import { VAT, buildInvoicePdf } from '#lib/pdf/documentsPdf.ts';
	import { buildXRechnung } from '#lib/pdf/xrechnung.ts';
	import { buildFacturX, checkInvoice, embedFacturX } from '#lib/einvoice.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import Badge from '#lib/components/Badge.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import type { Invoice } from '#lib/types.ts';
	import type { Instrument, NextStep } from '#lib/ux.ts';
	import { Download, FileCode2, FileText, Info, Settings2, ReceiptText } from '@lucide/svelte';

	const doc = (i: Invoice) => ({ number: i.number, issuedOn: i.issuedOn, dueOn: i.dueOn, netCents: Math.abs(i.netCents), period: i.period, description: i.period ? 'Reinigungsleistungen laut Vertrag, Monatspauschale' : 'Reinigungsleistungen' });
	const rows = $derived(
		[...db.data.invoices]
			.filter((i) => !i.stornoOf)
			.sort((a, b) => b.issuedOn.localeCompare(a.issuedOn))
			.map((i) => ({ i, issues: checkInvoice(company, db.customer(i.customerId), doc(i)) }))
	);
	const errorsOf = (r: (typeof rows)[number]) => r.issues.filter((x) => x.level === 'error');
	const ready = $derived(rows.filter((r) => errorsOf(r).length === 0).length);
	// Fehler der Absenderdaten sind bei allen Rechnungen gleich: einmal oben zeigen statt je Zeile
	const companyIssues = $derived([...new Set(rows.flatMap((r) => r.issues.filter((x) => x.scope === 'company').map((x) => x.text)))]);

	const instruments = $derived<Instrument[]>([
		{ kind: 'gauge', label: 'Versandbereit', value: rows.length ? ready / rows.length : 1, sub: `${ready} von ${rows.length} Rechnungen`, good: 0.99, warn: 0.5 },
		{ kind: 'stat', label: 'Mit Fehlern', value: String(rows.length - ready), sub: 'Pflichtangaben fehlen', tone: rows.length - ready ? 'danger' : 'success' },
		{ kind: 'stat', label: 'Ohne Leitweg-ID', value: String(new Set(rows.filter((r) => !db.customer(r.i.customerId)?.buyerRef).map((r) => r.i.customerId)).size), sub: 'Kunden (nur bei Behörden Pflicht)' }
	]);
	const next = $derived<NextStep>(
		companyIssues.length ? { tone: 'warn', text: `Eigene Angaben ergänzen, damit E-Rechnungen gültig sind: ${companyIssues.join('; ')}.`, cta: { label: 'Zu den Einstellungen', href: '/einstellungen' } }
		: { tone: 'ok', text: 'Alle Pflichtangaben vorhanden. Vor dem ersten Versand: Datei mit einem Validator (KoSIT) und mit der Steuerberatung prüfen.' }
	);

	function xml(i: Invoice) {
		const c = db.customer(i.customerId)!;
		downloadBytes(new TextEncoder().encode(buildXRechnung({ company, customer: c, invoice: doc(i), buyerReference: c.buyerRef })), `${i.number}-xrechnung.xml`, 'application/xml');
		toasts.push('XRechnung erzeugt. Bitte vor dem Versand validieren.');
	}
	async function zugferd(i: Invoice) {
		const c = db.customer(i.customerId)!;
		const d = doc(i);
		const pdf = await buildInvoicePdf({ company, customer: c, invoice: d });
		downloadBytes(await embedFacturX(pdf, buildFacturX({ company, customer: c, invoice: d })), `${i.number}-zugferd.pdf`, 'application/pdf');
		toasts.push('ZUGFeRD-PDF (Factur-X, EN 16931) erzeugt. Kein PDF/A-3: vor dem Versand validieren.');
	}
</script>

<svelte:head><title>E-Rechnung · Objektia</title></svelte:head>

<PageHead title="E-Rechnung" subtitle="Rechnungen als XRechnung (XML) oder ZUGFeRD/Factur-X (PDF mit eingebettetem XML), mit Prüfung der Pflichtangaben." {instruments} {next} />

<div class="card mt-5 overflow-x-auto">
	{#if rows.length === 0}
		<EmptyState icon={ReceiptText} title="Noch keine Rechnungen" text="Erstellen Sie zuerst einen Rechnungslauf unter Rechnungen." />
	{:else}
		<table class="w-full min-w-[760px] border-collapse">
			<thead class="border-b border-line bg-bg/60"><tr><th class="th">Rechnung</th><th class="th">Kunde</th><th class="th text-right">Brutto</th><th class="th">Prüfung</th><th class="th"></th></tr></thead>
			<tbody class="divide-y divide-line">
				{#each rows as r (r.i.id)}
					{@const errs = errorsOf(r)}
					{@const warns = r.issues.filter((x) => x.level === 'warn')}
					<tr>
						<td class="td whitespace-nowrap"><span class="font-medium">{r.i.number}</span><span class="block text-xs text-muted">{formatDate(r.i.issuedOn)}</span></td>
						<td class="td max-w-[260px] truncate" title={db.customer(r.i.customerId)?.name}>{db.customer(r.i.customerId)?.name}</td>
						<td class="td num text-right whitespace-nowrap">{formatEur(r.i.netCents + Math.round(r.i.netCents * VAT))}</td>
						<td class="td">
							{#if errs.length}<Badge tone="danger" label="{errs.length} Fehler" />{:else}<Badge tone="success" label="bereit" />{/if}
							{#if warns.length}<span class="ml-1"><Badge tone="warn" label="{warns.length} Hinweis{warns.length === 1 ? '' : 'e'}" /></span>{/if}
							{#each r.issues.filter((x) => x.scope === 'invoice') as x}<p class="mt-1 text-xs {x.level === 'error' ? 'text-danger' : 'text-muted'}">{x.text}</p>{/each}
						</td>
						<td class="td"><div class="flex flex-wrap justify-end gap-1">
							<button class="btn btn-sm" onclick={() => xml(r.i)} title="XRechnung 3.0 (UBL)"><FileCode2 size={13} /> XRechnung</button>
							<button class="btn btn-sm" onclick={() => zugferd(r.i)} title="ZUGFeRD/Factur-X: PDF mit eingebettetem XML"><FileText size={13} /> ZUGFeRD</button>
						</div></td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<section class="card mt-5 p-5" aria-labelledby="h-info">
	<h2 id="h-info" class="card-title mb-2 flex items-center gap-2"><Info size={15} class="text-muted" /> Was Sie wissen sollten</h2>
	<ul class="flex flex-col gap-1.5 text-sm text-muted">
		<li><strong class="text-fg">Pflicht:</strong> Empfang von E-Rechnungen ist seit 01.01.2025 Pflicht, der Versand wird gestaffelt verpflichtend (nach Recherche ab 2027 für größere, ab 2028 für alle Betriebe). Fristen und Ausnahmen bitte mit der Steuerberatung klären.</li>
		<li><strong class="text-fg">XRechnung</strong> ist das reine XML-Format, in Deutschland für Behörden üblich. <strong class="text-fg">ZUGFeRD/Factur-X</strong> ist eine lesbare PDF mit eingebettetem XML und für Firmenkunden bequemer.</li>
		<li><strong class="text-fg">Nicht geprüft:</strong> Die Dateien wurden nicht mit dem KoSIT-Validator getestet, die ZUGFeRD-PDF ist nicht als PDF/A-3 zertifiziert. Ein Versand per E-Mail oder über Peppol/Portal gibt es nicht.</li>
		<li><strong class="text-fg">Stornorechnungen</strong> (Minusbeträge) tauchen hier nicht auf: Sie sind steuerlich eine Gutschrift (Typ 381) und brauchen eine eigene Abstimmung.</li>
	</ul>
	<a href="/einstellungen" class="btn btn-sm mt-3"><Settings2 size={13} /> Eigene Angaben pflegen</a>
</section>
