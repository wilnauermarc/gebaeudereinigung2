<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from '@lucide/svelte';

	let {
		open = $bindable(false),
		title,
		description,
		width = 460,
		children,
		footer,
		bare = false
	}: {
		open: boolean;
		title: string;
		description?: string;
		width?: number;
		children: Snippet;
		footer?: Snippet;
		bare?: boolean;
	} = $props();

	let el: HTMLDialogElement;

	$effect(() => {
		if (open && !el.open) el.showModal();
		if (!open && el.open) el.close();
	});
</script>

<dialog
	bind:this={el}
	class="dlg"
	style="width: {width}px"
	aria-label={title}
	onclose={() => (open = false)}
	onclick={(e) => {
		if (e.target === el) open = false;
	}}
>
	{#if open}
		{#if bare}
			{@render children()}
		{:else}
			<div class="flex items-start justify-between gap-4 px-5 pt-4 pb-1">
				<div>
					<h2 class="text-base font-semibold">{title}</h2>
					{#if description}<p class="mt-0.5 text-sm text-muted">{description}</p>{/if}
				</div>
				<button class="btn btn-ghost btn-icon -mr-2 -mt-1" aria-label="Schließen" onclick={() => (open = false)}>
					<X size={16} />
				</button>
			</div>
			<div class="px-5 py-3">{@render children()}</div>
			{#if footer}
				<div class="flex justify-end gap-2 border-t border-line px-5 py-3">{@render footer()}</div>
			{/if}
		{/if}
	{/if}
</dialog>
