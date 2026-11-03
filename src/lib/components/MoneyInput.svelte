<script lang="ts">
	import { formatDecimal, parseEuroInput } from '#lib/format.ts';

	let {
		value = $bindable<number | null | undefined>(),
		id,
		disabled = false,
		placeholder = '0,00',
		oninput
	}: { value: number | null | undefined; id?: string; disabled?: boolean; placeholder?: string; oninput?: () => void } = $props();

	let text = $state('');
	let focused = false;
	let invalid = $state(false);

	$effect(() => {
		const v = value;
		if (!focused) text = formatDecimal(v);
	});

	function commit() {
		const parsed = parseEuroInput(text);
		invalid = text.trim() !== '' && parsed === null;
		if (!invalid) value = parsed;
		oninput?.();
	}
</script>

<div class="relative">
	<input
		{id}
		{disabled}
		{placeholder}
		inputmode="decimal"
		autocomplete="off"
		class="input num pr-7 text-right"
		aria-invalid={invalid}
		bind:value={text}
		oninput={commit}
		onfocus={() => (focused = true)}
		onblur={() => {
			focused = false;
			if (!invalid) text = formatDecimal(value);
		}}
	/>
	<span class="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-muted">€</span>
</div>
{#if invalid}<p class="mt-1 text-xs text-danger">Bitte einen Betrag wie 1.234,50 eingeben.</p>{/if}
