<script lang="ts">
	import { goto } from '$app/navigation';
	import { db } from '#lib/db.svelte.ts';
	import { features } from '#lib/features.svelte.ts';
	import Dialog from './Dialog.svelte';
	import { Search, LayoutDashboard, Users, FileText, Palette, Building2, FilePlus2 } from '@lucide/svelte';
	import { quoteStatus } from '#lib/labels.ts';

	let { open = $bindable(false) }: { open: boolean } = $props();

	let q = $state('');
	let active = $state(0);
	let inputEl: HTMLInputElement | undefined = $state();

	type Item = { group: string; label: string; hint?: string; icon: any; href: string };

	const nav: Item[] = [
		{ group: 'Navigation', label: 'Heute', icon: LayoutDashboard, href: '/' },
		{ group: 'Navigation', label: 'Kunden', icon: Users, href: '/kunden' },
		{ group: 'Navigation', label: 'Angebote', icon: FileText, href: '/angebote' },
		{ group: 'Navigation', label: 'Designsystem', icon: Palette, href: '/designsystem' }
	];

	const items = $derived.by(() => {
		const s = q.trim().toLowerCase();
		const customers: Item[] = db.data.customers
			.filter((c) => !s || c.name.toLowerCase().includes(s) || c.city.toLowerCase().includes(s))
			.map((c) => ({ group: 'Kunden', label: c.name, hint: c.city, icon: Building2, href: `/kunden/${c.id}` }));
		const quotes: Item[] = db.data.quotes
			.filter((x) => !s || x.number.toLowerCase().includes(s) || (db.customer(x.customerId)?.name ?? '').toLowerCase().includes(s))
			.map((x) => ({
				group: 'Angebote',
				label: `${x.number} · ${db.customer(x.customerId)?.name ?? ''}`,
				hint: quoteStatus[x.status].label,
				icon: FilePlus2,
				href: `/angebote/${x.id}`
			}));
		const navs = nav.filter((n) => features.path(n.href) && (!s || n.label.toLowerCase().includes(s)));
		if (!features.has('verkauf')) quotes.length = 0;
		return [...navs, ...customers.slice(0, s ? 6 : 4), ...quotes.slice(0, s ? 5 : 3)];
	});

	$effect(() => {
		if (open) {
			q = '';
			active = 0;
			queueMicrotask(() => inputEl?.focus());
		}
	});
	$effect(() => {
		items.length;
		active = 0;
	});

	function go(i: Item) {
		open = false;
		goto(i.href);
	}
	function onkey(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			active = Math.min(active + 1, items.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			active = Math.max(active - 1, 0);
		} else if (e.key === 'Enter' && items[active]) {
			e.preventDefault();
			go(items[active]);
		}
		document.getElementById(`cmd-${active}`)?.scrollIntoView({ block: 'nearest' });
	}
</script>

<Dialog bind:open title="Suche und Befehle" width={560} bare>
	<div class="flex items-center gap-2.5 border-b border-line px-4 focus-within:border-accent">
		<Search size={16} class="text-faint" />
		<input
			bind:this={inputEl}
			bind:value={q}
			onkeydown={onkey}
			role="combobox"
			aria-expanded="true"
			aria-controls="cmd-list"
			aria-label="Suchen"
			placeholder="Kunde, Angebot oder Seite suchen …"
			class="input-bare h-12"
		/>
		<span class="kbd">Esc</span>
	</div>
	<ul id="cmd-list" role="listbox" class="max-h-[340px] overflow-y-auto p-1.5">
		{#each items as item, i (item.href)}
			{#if i === 0 || items[i - 1].group !== item.group}
				<li class="px-2.5 pt-2 pb-1 text-[0.72rem] font-medium tracking-wide text-faint uppercase" role="presentation">{item.group}</li>
			{/if}
			<li role="option" aria-selected={i === active} id="cmd-{i}">
				<button
					class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm {i === active ? 'bg-accent-soft' : ''}"
					onmousemove={() => (active = i)}
					onclick={() => go(item)}
				>
					<item.icon size={15} class="shrink-0 text-muted" />
					<span class="min-w-0 flex-1 truncate">{item.label}</span>
					{#if item.hint}<span class="shrink-0 text-xs text-muted">{item.hint}</span>{/if}
				</button>
			</li>
		{:else}
			<li class="px-3 py-8 text-center text-sm text-muted">Keine Treffer für „{q}“.</li>
		{/each}
	</ul>
</Dialog>
