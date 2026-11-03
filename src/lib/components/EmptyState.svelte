<script lang="ts">
	import type { Snippet } from 'svelte';
	let { icon: Icon, title, text, children }: { icon: any; title: string; text: string; children?: Snippet } = $props();
</script>

<div class="flex flex-col items-center px-6 py-14 text-center">
	<div class="mb-3 grid size-10 place-items-center rounded-full bg-subtle text-muted"><Icon size={20} /></div>
	<p class="text-sm font-semibold">{title}</p>
	<p class="mt-1 max-w-sm text-sm text-muted">{text}</p>
	{#if children}<div class="mt-4">{@render children()}</div>{/if}
</div>
