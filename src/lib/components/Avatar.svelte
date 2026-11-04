<script lang="ts">
	import { initials } from '#lib/format.ts';
	import { db } from '#lib/db.svelte.ts';
	import { photoFor } from '#lib/photos.ts';
	/**
	 * Kunden: Initialen auf getöntem Grund. Personen (`person`): echtes Porträtfoto (Unsplash, lokal abgelegt, siehe static/people/CREDITS.md).
	 * Die Fotos sind Demo-Platzhalter und zeigen nicht die genannten Personen.
	 */
	let { name, size = 32, square = true, person = false, ring = false }: { name: string; size?: number; square?: boolean; person?: boolean; ring?: boolean } = $props();
	/** Porträts etwas größer als die angegebene Größe, damit Gesichter gut erkennbar sind */
	const px = $derived(person ? Math.round(size * 1.2) : size);
	const hue = $derived([...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7));
	const photo = $derived(`/people/${photoFor(name, db.data.avatars?.[name])}.jpg`);
</script>

{#if person}
	<span class="inline-block shrink-0 overflow-hidden bg-subtle {ring ? 'ring-2 ring-surface' : ''} {square ? 'rounded-lg' : 'rounded-full'}" style="width:{px}px;height:{px}px" aria-hidden="true">
		<img src={photo} alt="" width={px} height={px} class="size-full object-cover" loading="lazy" decoding="async" />
	</span>
{:else}
	<span
		class="avatar inline-grid shrink-0 place-items-center font-semibold select-none {square ? 'rounded-lg' : 'rounded-full'}"
		style="--h: {hue}; width: {size}px; height: {size}px; font-size: {Math.round(size * 0.38)}px"
		aria-hidden="true">{initials(name)}</span>
{/if}
