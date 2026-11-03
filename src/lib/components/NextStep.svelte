<script lang="ts">
	import type { NextStep } from '#lib/ux.ts';
	import { ArrowRight, CircleCheck, Siren, TriangleAlert, Lightbulb } from '@lucide/svelte';
	let { step }: { step: NextStep } = $props();
	const look = {
		danger: { bg: 'bg-danger-soft', fg: 'text-danger', chip: 'bg-danger text-white', Icon: Siren, tag: 'Dringend' },
		warn: { bg: 'bg-warn-soft', fg: 'text-warn', chip: 'bg-warn text-white', Icon: TriangleAlert, tag: 'Als Nächstes' },
		info: { bg: 'bg-accent-soft', fg: 'text-accent', chip: 'bg-accent text-white', Icon: Lightbulb, tag: 'Tipp' },
		ok: { bg: 'bg-success-soft', fg: 'text-success', chip: 'bg-success text-white', Icon: CircleCheck, tag: 'Alles im Griff' }
	} as const;
	const l = $derived(look[step.tone]);
</script>

<div class="mt-4 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 {l.bg}" role="status">
	<span class="grid size-9 shrink-0 place-items-center rounded-xl {l.chip}"><l.Icon size={18} /></span>
	<div class="min-w-[200px] flex-1"><p class="text-[0.7rem] font-bold tracking-wider uppercase {l.fg}">{l.tag}</p><p class="text-sm font-medium text-fg">{step.text}</p></div>
	{#if step.cta}
		{#if step.cta.href}<a href={step.cta.href} class="btn btn-sm !bg-surface">{step.cta.label} <ArrowRight size={13} /></a>
		{:else}<button class="btn btn-sm !bg-surface" onclick={step.cta.onclick}>{step.cta.label} <ArrowRight size={13} /></button>{/if}
	{/if}
</div>
