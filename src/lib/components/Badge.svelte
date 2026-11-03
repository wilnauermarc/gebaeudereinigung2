<script lang="ts">
	import type { Tone } from '#lib/labels.ts';
	let { tone, label }: { tone: Tone; label: string } = $props();
</script>

<span class="badge badge-{tone}">{label}</span>
