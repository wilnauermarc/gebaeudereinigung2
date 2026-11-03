<script lang="ts">
	import { goto } from '$app/navigation';
	import { steps, tour } from '#lib/tour.svelte.ts';
	import { ArrowLeft, ArrowRight, Check, X, ExternalLink } from '@lucide/svelte';

	const s = $derived(steps[tour.step]);
	const last = $derived(tour.step === steps.length - 1);
	function onKey(e: KeyboardEvent) { if (tour.open && e.key === 'Escape') tour.finish(); }
</script>

<svelte:window onkeydown={onKey} />

{#if tour.open}
	{@const Icon = s.icon}
	<!-- Nicht blockierend: Der Rundgang bleibt beim Wechseln der Seiten stehen, damit man gleich ausprobieren kann. -->
	<div class="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[400px]" role="dialog" aria-modal="false" aria-labelledby="tour-title" aria-describedby="tour-body">
		<div class="overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-pop)]">
			<div class="h-1 bg-subtle" role="progressbar" aria-valuemin="1" aria-valuemax={steps.length} aria-valuenow={tour.step + 1} aria-label="Fortschritt des Rundgangs"><div class="h-full bg-accent transition-all duration-300" style="width:{((tour.step + 1) / steps.length) * 100}%"></div></div>
			<div class="p-5">
				<div class="mb-3 flex items-start gap-3">
					<span class="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent"><Icon size={22} /></span>
					<div class="min-w-0 flex-1"><p class="text-xs font-semibold tracking-wide text-muted uppercase">Rundgang · Schritt {tour.step + 1} von {steps.length}</p><h2 id="tour-title" class="text-[1.05rem] leading-snug font-semibold">{s.title}</h2></div>
					<button class="btn btn-ghost btn-icon btn-sm -mt-1 -mr-1.5" onclick={() => tour.finish()} aria-label="Rundgang beenden"><X size={16} /></button>
				</div>
				<ul id="tour-body" class="flex flex-col gap-2 text-sm text-muted">{#each s.lines as l}<li class="flex gap-2"><span class="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-accent/60"></span><span>{l}</span></li>{/each}</ul>
				{#if s.href}<button class="btn btn-sm mt-4" onclick={() => goto(s.href!)}><ExternalLink size={13} /> {s.cta}</button>{/if}
			</div>
			<div class="flex items-center justify-between gap-2 border-t border-line bg-bg/50 px-5 py-3">
				<div class="flex items-center gap-1" aria-hidden="true">{#each steps as _, i}<button tabindex="-1" class="size-2 rounded-full transition-colors {i === tour.step ? 'bg-accent' : i < tour.step ? 'bg-accent/40' : 'bg-line-strong'}" onclick={() => (tour.step = i)} aria-label="Zu Schritt {i + 1}"></button>{/each}</div>
				<div class="flex items-center gap-1.5">
					{#if tour.step > 0}<button class="btn btn-sm" onclick={() => tour.prev()}><ArrowLeft size={13} /> Zurück</button>{:else}<button class="btn btn-ghost btn-sm" onclick={() => tour.finish()}>Überspringen</button>{/if}
					<button class="btn btn-sm btn-primary" onclick={() => tour.next()}>{#if last}<Check size={13} /> Fertig{:else}Weiter <ArrowRight size={13} />{/if}</button>
				</div>
			</div>
		</div>
	</div>
{/if}
