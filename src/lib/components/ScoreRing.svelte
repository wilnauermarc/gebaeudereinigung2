<script lang="ts">
	let { score, size = 56 }: { score: number; size?: number } = $props();
	const r = $derived(size / 2 - 5);
	const c = $derived(2 * Math.PI * r);
	const color = $derived(score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warn)' : 'var(--danger)');
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}" role="img" aria-label="Gesundheitsscore {score} von 100">
	<circle cx={size / 2} cy={size / 2} {r} fill="none" stroke="var(--subtle)" stroke-width="5" />
	<circle cx={size / 2} cy={size / 2} {r} fill="none" stroke={color} stroke-width="5" stroke-linecap="round" stroke-dasharray="{(score / 100) * c} {c}" transform="rotate(-90 {size / 2} {size / 2})" />
	<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-size={size * 0.3} font-weight="600" fill="var(--fg)" class="num">{score}</text>
</svg>
