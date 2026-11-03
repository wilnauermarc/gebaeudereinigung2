<script lang="ts">
	import { page } from '$app/state';
	import { db } from '#lib/db.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';
	import { addDays } from '#lib/calc.ts';
	import { todayKey, relativeDay, formatDate, dayDiff } from '#lib/format.ts';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { Plus, ListChecks, Trash2, List, Columns3, ArrowRight } from '@lucide/svelte';

	const today = todayKey();
	let filter = $state<'offen' | 'erledigt'>('offen');
	let view = $state<'liste' | 'board'>('board');
	let title = $state('');
	let dueOn = $state(addDays(today, 3));
	let customerId = $state('');
	let titleEl: HTMLInputElement | undefined = $state();

	const rows = $derived(
		db.data.tasks
			.filter((t) => (filter === 'offen' ? !t.done : t.done))
			.sort((a, b) => (a.dueOn ?? '9999').localeCompare(b.dueOn ?? '9999'))
	);
	const openCount = $derived(db.data.tasks.filter((t) => !t.done).length);

	$effect(() => { if (page.url.searchParams.get('neu')) titleEl?.focus(); });

	// ── Board nach Arbeitsstand: Zu erledigen → In Arbeit → Wartet → Erledigt. Das Fälligkeitsdatum bleibt als Frist-Chip an der Karte. ──
	type Task = (typeof db.data.tasks)[number];
	type LaneId = 'todo' | 'doing' | 'waiting' | 'done';
	const byDue = (a: Task, b: Task) => (a.dueOn ?? '9999').localeCompare(b.dueOn ?? '9999');
	const stateOf = (t: Task): LaneId => (t.done ? 'done' : t.status ?? 'todo');
	const lanes = $derived<{ id: LaneId; title: string; hint: string; tone: string; items: Task[] }[]>([
		{ id: 'todo', title: 'Zu erledigen', hint: 'Neue Aufgaben landen hier', tone: 'text-fg', items: db.data.tasks.filter((t) => stateOf(t) === 'todo').sort(byDue) },
		{ id: 'doing', title: 'In Arbeit', hint: 'Hierher ziehen, sobald Sie anfangen', tone: 'text-accent', items: db.data.tasks.filter((t) => stateOf(t) === 'doing').sort(byDue) },
		{ id: 'waiting', title: 'Wartet auf andere', hint: 'Rückmeldung, Lieferung, Freigabe', tone: 'text-info', items: db.data.tasks.filter((t) => stateOf(t) === 'waiting').sort(byDue) },
		{ id: 'done', title: 'Erledigt', hint: 'Zuletzt abgeschlossen', tone: 'text-success', items: db.data.tasks.filter((t) => t.done).sort((a, b) => (b.doneOn ?? '').localeCompare(a.doneOn ?? '')).slice(0, 6) }
	]);
	const next: Record<LaneId, LaneId> = { todo: 'doing', doing: 'waiting', waiting: 'done', done: 'todo' };
	const laneName = { todo: 'Zu erledigen', doing: 'In Arbeit', waiting: 'Wartet auf andere', done: 'Erledigt' } as const;
	function dueChip(t: Task) {
		if (!t.dueOn || t.done) return null;
		const d = dayDiff(t.dueOn);
		return { text: d < 0 ? `überfällig · ${formatDate(t.dueOn)}` : d === 0 ? 'heute fällig' : `${relativeDay(t.dueOn)} · ${formatDate(t.dueOn)}`, cls: d < 0 ? 'bg-danger-soft text-danger font-semibold' : d === 0 ? 'bg-accent-soft text-accent font-semibold' : 'bg-subtle text-muted' };
	}
	let dragId = $state<string | null>(null);
	let overLane = $state<string | null>(null);
	function moveTo(t: Task, lane: LaneId) {
		const prev = { done: t.done, status: t.status, doneOn: t.doneOn };
		if (stateOf(t) === lane) return;
		t.done = lane === 'done';
		t.doneOn = lane === 'done' ? today : null;
		t.status = lane === 'doing' || lane === 'waiting' ? lane : undefined;
		toasts.push(`„${t.title.length > 36 ? t.title.slice(0, 35) + '…' : t.title}“ → ${laneName[lane]}.`, { tone: 'success', action: { label: 'Rückgängig', run: () => Object.assign(t, prev) } });
	}
	function dropLane(ev: DragEvent, lane: LaneId) {
		ev.preventDefault();
		const t = db.data.tasks.find((x) => x.id === dragId);
		dragId = null; overLane = null;
		if (t) moveTo(t, lane);
	}

	function add(e: SubmitEvent) {
		e.preventDefault();
		if (title.trim().length < 3) return;
		db.data.tasks.push({ id: 'a' + Date.now().toString(36), title: title.trim(), dueOn: dueOn || null, customerId: customerId || null, done: false });
		title = '';
		titleEl?.focus();
	}
	function toggle(id: string) {
		const t = db.data.tasks.find((x) => x.id === id)!;
		t.done = !t.done;
		if (t.done) toasts.push('Aufgabe erledigt.', { tone: 'success', action: { label: 'Rückgängig', run: () => (t.done = false) } });
	}
	function remove(id: string) {
		const i = db.data.tasks.findIndex((x) => x.id === id);
		const [t] = db.data.tasks.splice(i, 1);
		toasts.push('Aufgabe gelöscht.', { action: { label: 'Rückgängig', run: () => db.data.tasks.push(t) } });
	}
	import PageHead from '#lib/components/PageHead.svelte';
	import { taskInstruments as _taskInstruments } from '#lib/instruments.ts';
	import { todayKey as _tkauf } from '#lib/format.ts';
	const instruments = $derived(_taskInstruments(db.data, _tkauf()));
</script>

<svelte:head><title>Aufgaben · Resch Business Manager</title></svelte:head>

<PageHead {instruments} title="Aufgaben" subtitle={`${openCount} offen. Wiedervorlagen und To-dos, optional einem Kunden zugeordnet.`}>
</PageHead>

<form class="card mb-4 flex flex-wrap items-end gap-3 p-4" onsubmit={add}>
	<div class="min-w-[240px] flex-1"><label class="label" for="t-t">Neue Aufgabe</label><input id="t-t" bind:this={titleEl} class="input" placeholder="Was ist zu tun?" bind:value={title} /></div>
	<div><label class="label" for="t-d">Fällig</label><input id="t-d" type="date" class="input w-44" bind:value={dueOn} /></div>
	<div class="w-56"><label class="label" for="t-c">Kunde</label><select id="t-c" class="input" bind:value={customerId}><option value="">Ohne Kunde</option>{#each db.data.customers as c}<option value={c.id}>{c.name.length > 30 ? c.name.slice(0, 28) + '…' : c.name}</option>{/each}</select></div>
	<button class="btn btn-primary" disabled={title.trim().length < 3}><Plus size={15} /> Hinzufügen</button>
</form>

<div class="mb-3 flex flex-wrap items-center gap-1" role="group" aria-label="Filter">
	{#if view === 'liste'}{#each [['offen', 'Offen'], ['erledigt', 'Erledigt']] as [id, label]}
		<button class="btn btn-sm {filter === id ? 'border-accent bg-accent text-white' : ''}" aria-pressed={filter === id} onclick={() => (filter = id as typeof filter)}>{label}</button>
	{/each}{/if}
	<div class="ml-auto inline-flex rounded-lg border border-line-strong bg-surface p-0.5" role="group" aria-label="Ansicht">
		<button class="btn btn-sm !border-0 {view === 'board' ? 'bg-accent-soft text-accent' : 'btn-ghost'}" aria-pressed={view === 'board'} onclick={() => (view = 'board')}><Columns3 size={13} /> Board</button>
		<button class="btn btn-sm !border-0 {view === 'liste' ? 'bg-accent-soft text-accent' : 'btn-ghost'}" aria-pressed={view === 'liste'} onclick={() => (view = 'liste')}><List size={13} /> Liste</button>
	</div>
</div>

{#if view === 'board'}
	<div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Aufgaben-Board">
		{#each lanes as lane (lane.id)}
			<section
				class="flex min-h-[220px] flex-col rounded-xl border-2 bg-bg/60 p-2 transition {overLane === lane.id ? 'border-accent bg-accent-soft/50' : 'border-transparent'} {dragId ? 'border-dashed !border-line-strong' : ''}"
				aria-label={lane.title}
				ondragover={(e) => { if (dragId) { e.preventDefault(); overLane = lane.id; } }}
				ondragleave={() => { if (overLane === lane.id) overLane = null; }}
				ondrop={(e) => dropLane(e, lane.id)}
			>
				<h2 class="mb-2 flex items-center justify-between px-1.5 text-xs font-bold tracking-wide uppercase {lane.tone}">{lane.title}<span class="num rounded-full bg-surface px-2 py-0.5 text-[0.7rem] font-semibold text-muted">{lane.items.length}</span></h2>
				<ul class="flex flex-1 flex-col gap-2">
					{#each lane.items as t (t.id)}
						{@const chip = dueChip(t)}
						<li draggable="true" ondragstart={(e) => { dragId = t.id; e.dataTransfer?.setData('text/plain', t.id); if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'; }} ondragend={() => { dragId = null; overLane = null; }}
							class="group cursor-grab rounded-lg border border-line bg-surface p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing {dragId === t.id ? 'opacity-40' : ''} {lane.id === 'done' ? 'opacity-75' : ''}">
							<div class="flex items-start gap-2">
								<input type="checkbox" class="mt-0.5 size-[18px] shrink-0 accent-[var(--accent)]" checked={t.done} onchange={() => moveTo(t, t.done ? 'todo' : 'done')} aria-label="{t.title} erledigt" />
								<div class="min-w-0 flex-1"><p class="text-sm font-medium {t.done ? 'line-through' : ''}">{t.title}</p>{#if t.customerId}<a href="/kunden/{t.customerId}" class="block truncate text-xs text-muted hover:text-accent">{db.customer(t.customerId)?.name}</a>{/if}</div>
							</div>
							<div class="mt-2 flex items-center justify-between gap-2">
								{#if chip}<span class="num rounded-full px-2 py-0.5 text-[0.7rem] {chip.cls}">{chip.text}</span>{:else}<span></span>{/if}
								<button class="btn btn-ghost btn-sm !px-1.5 opacity-60 hover:opacity-100 focus-visible:opacity-100" onclick={() => moveTo(t, next[stateOf(t)])} title="Weiter nach „{laneName[next[stateOf(t)]]}“" aria-label="{t.title}: weiter nach {laneName[next[stateOf(t)]]}"><ArrowRight size={13} /></button>
							</div>
						</li>
					{:else}
						<li class="grid flex-1 place-items-center py-6 text-center text-xs text-faint">{lane.hint}</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
	<p class="mt-2 text-xs text-muted">Ziehen Sie Karten zwischen den Spalten oder nutzen Sie den Pfeil. Die Frist bleibt als Chip an der Karte, überfällige sind rot.</p>
{:else}

<div class="card">
	{#if rows.length === 0}
		<EmptyState icon={ListChecks} title={filter === 'offen' ? 'Alles erledigt' : 'Noch nichts erledigt'} text={filter === 'offen' ? 'Keine offenen Aufgaben. Tragen Sie oben neue ein.' : 'Erledigte Aufgaben erscheinen hier.'} />
	{:else}
		<ul class="divide-y divide-line">
			{#each rows as t (t.id)}
				{@const late = !t.done && t.dueOn && t.dueOn < today}
				<li class="group flex items-center gap-3 px-4 py-3">
					<input type="checkbox" class="size-[18px] accent-[var(--accent)]" checked={t.done} onchange={() => toggle(t.id)} aria-label="{t.title} erledigt" />
					<div class="min-w-0 flex-1">
						<p class="text-sm {t.done ? 'text-muted line-through' : 'font-medium'}">{t.title}</p>
						{#if t.customerId}<a href="/kunden/{t.customerId}" class="text-xs text-muted hover:text-accent">{db.customer(t.customerId)?.name}</a>{/if}
					</div>
					{#if t.dueOn}<span class="num shrink-0 text-xs {late ? 'font-semibold text-danger' : 'text-muted'}">{formatDate(t.dueOn)} · {relativeDay(t.dueOn)}</span>{/if}
					<button class="btn btn-ghost btn-icon btn-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-danger" aria-label="Aufgabe löschen" onclick={() => remove(t.id)}><Trash2 size={14} /></button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
{/if}
