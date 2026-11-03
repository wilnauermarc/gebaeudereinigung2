<script lang="ts">
	import type { StepInfo, StepKey } from '#lib/cases.ts';
	import { Inbox, House, MapPin, FileText, MessageSquare, Flag, Play, ListChecks } from '@lucide/svelte';

	let { steps, compact = false, onjump }: { steps: StepInfo[]; compact?: boolean; /** Wenn gesetzt, lassen sich erreichte Schritte anklicken, um dorthin zurückzuspringen */ onjump?: (key: StepKey) => void } = $props();
	let list: HTMLOListElement | undefined = $state();
	// Auf schmalen Bildschirmen den aktuellen Schritt in die Mitte scrollen, damit man sofort sieht, wo der Vorgang steht
	$effect(() => {
		steps.map((s) => s.state);
		list?.querySelector('[aria-current=step]')?.scrollIntoView({ inline: 'center', block: 'nearest' });
	});
	const icons: Record<StepKey, any> = { anfrage: Inbox, daten: House, besichtigung: MapPin, angebot: FileText, rueckmeldung: MessageSquare, start: Flag, ausfuehrung: Play, zeitliste: ListChecks };
	const cls = {
		done: 'bg-accent-soft text-accent',
		current: 'bg-side text-white',
		todo: 'bg-surface text-muted',
		skipped: 'bg-subtle text-faint',
		ended: 'bg-danger-soft text-danger'
	} as const;
</script>

<ol bind:this={list} class="flex overflow-x-auto rounded-2xl border border-line bg-surface p-1.5 shadow-[var(--shadow-card)]" aria-label="Ablauf des Vorgangs">
	{#each steps as s, i (s.key)}
		{@const Icon = icons[s.key]}
		<li
			class="chevron relative flex min-w-[112px] flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-center {cls[s.state]} {i > 0 ? '-ml-[10px] pl-3' : ''}"
			style="clip-path: {i === 0 ? 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)' : i === steps.length - 1 ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 14px 50%)' : 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)'}; border-radius: {i === 0 ? '12px 0 0 12px' : i === steps.length - 1 ? '0 12px 12px 0' : '0'}"
			aria-current={s.state === 'current' ? 'step' : undefined}
		>
			{#if onjump && s.state !== 'current' && s.state !== 'todo'}<button type="button" class="absolute inset-0 z-10 cursor-pointer rounded hover:bg-black/5" title="Zu „{s.label}“ zurückspringen" aria-label="Zu Schritt {s.label} zurückspringen" onclick={() => onjump(s.key)}></button>{/if}
			<span class="num text-[0.7rem] font-semibold opacity-70">{i + 1}</span>
			<Icon size={compact ? 14 : 17} />
			<span class="text-[0.82rem] font-semibold {s.state === 'skipped' ? 'line-through' : ''}">{s.label}</span>
			{#if s.state === 'skipped'}<span class="text-[0.65rem]">übersprungen</span>{/if}
			{#if s.state === 'ended'}<span class="text-[0.65rem]">beendet</span>{/if}
		</li>
	{/each}
</ol>
