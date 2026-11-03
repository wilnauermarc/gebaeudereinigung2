<script lang="ts">
	import { toasts } from '#lib/toast.svelte.ts';
	import { CircleCheck, CircleAlert, X } from '@lucide/svelte';
</script>

<div class="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[360px] max-w-[calc(100vw-32px)] flex-col gap-2" aria-live="polite">
	{#each toasts.list as t (t.id)}
		<div role="status" class="pointer-events-auto flex items-center gap-3 rounded-lg bg-fg px-3.5 py-2.5 text-sm text-bg shadow-[var(--shadow-pop)]">
			{#if t.tone === 'success'}<CircleCheck size={16} class="shrink-0 text-success" />{/if}
			{#if t.tone === 'error'}<CircleAlert size={16} class="shrink-0 text-danger" />{/if}
			<span class="min-w-0 flex-1">{t.text}</span>
			{#if t.action}
				<button class="font-semibold underline-offset-2 hover:underline" onclick={() => { t.action!.run(); toasts.dismiss(t.id); }}>{t.action.label}</button>
			{/if}
			<button aria-label="Meldung schließen" class="opacity-60 hover:opacity-100" onclick={() => toasts.dismiss(t.id)}><X size={14} /></button>
		</div>
	{/each}
</div>
