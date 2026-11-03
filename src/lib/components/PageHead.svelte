<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Instrument, NextStep as Next } from '#lib/ux.ts';
	import Instruments from './Instruments.svelte';
	import NextStep from './NextStep.svelte';
	/** Einheitlicher Seitenkopf: Titel, Aktionen, „Nächster Schritt“ und Instrumentenleiste. */
	let { title, subtitle, actions, instruments, next }: { title: string; subtitle?: string; actions?: Snippet; instruments?: Instrument[]; next?: Next | null } = $props();
</script>

<header class="mb-5">
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div class="min-w-0"><h1 class="page-title">{title}</h1>{#if subtitle}<p class="mt-0.5 text-sm text-muted">{subtitle}</p>{/if}</div>
		{#if actions}<div class="flex flex-wrap items-center gap-2">{@render actions()}</div>{/if}
	</div>
	{#if next}<NextStep step={next} />{/if}
	{#if instruments?.length}<Instruments items={instruments} />{/if}
</header>
