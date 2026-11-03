<script lang="ts">
	import { countUp } from '#lib/countup.ts';
	/** Ringanzeige 0–1 mit großer Zahl in der Mitte. `good` = ab diesem Wert grün, `warn` = ab diesem Wert gelb. */
	let { value, label, sub, good = 0.75, warn = 0.5, href, size = 92, shown }: { value: number; label: string; sub?: string; good?: number; warn?: number; href?: string; size?: number; /** anderer Wert für die Mitte (0–1), z. B. die echte Marge, während der Ring auf das Ziel skaliert ist */ shown?: number } = $props();
	const mid = $derived(Math.max(0, Math.min(1, shown ?? value)));
	const r = $derived(size / 2 - 7);
	const c = $derived(2 * Math.PI * r);
	const v = $derived(Math.max(0, Math.min(1, value)));
	const color = $derived(v >= good ? 'var(--success)' : v >= warn ? 'var(--warn)' : 'var(--danger)');
	let drawn = $state(0);
	$effect(() => { const t = setTimeout(() => (drawn = v), 60); return () => clearTimeout(t); });
</script>

<svelte:element this={href ? 'a' : 'div'} {href} class="group flex flex-col items-center gap-2 rounded-xl p-3 text-center transition {href ? 'hover:-translate-y-0.5 hover:bg-subtle/60' : ''}" aria-label="{label}: {Math.round(mid * 100)} Prozent">
	<div class="relative" style="width:{size}px;height:{size}px">
		<svg width={size} height={size} viewBox="0 0 {size} {size}" aria-hidden="true">
			<circle cx={size / 2} cy={size / 2} {r} fill="none" stroke="var(--subtle)" stroke-width="8" />
			<circle cx={size / 2} cy={size / 2} {r} fill="none" stroke={color} stroke-width="8" stroke-linecap="round" stroke-dasharray="{drawn * c} {c}" transform="rotate(-90 {size / 2} {size / 2})" style="transition: stroke-dasharray 0.9s cubic-bezier(.2,.8,.2,1), stroke .3s" />
		</svg>
		<span class="num absolute inset-0 grid place-items-center text-[1.35rem] font-bold tracking-tight" use:countUp={{ value: mid * 100, format: (n) => `${Math.round(n)}%` }}>{Math.round(mid * 100)}%</span>
	</div>
	<div><p class="text-sm font-semibold">{label}</p>{#if sub}<p class="text-xs text-muted">{sub}</p>{/if}</div>
</svelte:element>
