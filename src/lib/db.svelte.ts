import { geoLabel } from '#lib/geo.ts';
import { company, type Company } from './company';
import { createDemoData, createEmptyData } from './demo.ts';
import { todayKey } from './format';
import { addMonths, entryHours, weekday } from './calc';
import { surchargeCents } from './surcharge';
import type { ActivityEvent, Contact, Customer, Data, Employee, Quote, QuoteKind, Site, TimeEntry } from './types';

/** Schlüssel der früheren Browser-Speicherung (nur noch zum Übernehmen alter Daten beim Einrichten) */
export const LEGACY_KEY = 'resch-demo-data-v11';
export const CURRENT_USER = 'Anetta R.';

export interface SwapWish { id: string; siteId: string; date: string; offeredBy: string; takenBy: string | null; status: string }
export interface Session { id: string; display: string; role: 'inhaber' | 'buero' | 'objektleitung' | 'mitarbeiter'; employeeId: string | null; mustChange: boolean; management: boolean }

const todayKeyPlus = (k: string, n: number) => new Date(Date.parse(k + 'T12:00:00Z') + n * 86400000).toISOString().slice(0, 10);
const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

class Db {
	data = $state<Data>(createEmptyData());
	/** Anmeldung geprüft und (für die Verwaltung) der Datenbestand vom Server geladen */
	ready = $state(false);
	session = $state<Session | null>(null);
	needsSetup = $state(false);
	/** Auf dem Server ist ein Einrichtungscode gesetzt (SETUP_TOKEN) */
	setupNeedsCode = $state(false);
	/** Zeitpunkt der letzten Speicherung auf dem Server (für die Statusanzeige) */
	savedAt = $state<Date | null>(null);
	storageError = $state(false);
	/** Der Datenbestand wurde anderswo geändert: Speichern ist gestoppt, bis neu geladen wird */
	conflict = $state(false);
	#rev = 0;
	#last = '';
	/** Es gibt Änderungen, die noch nicht auf dem Server liegen */
	dirty = $state(false);

	/** Zuletzt aus dem Eingang übernommene Meldungen (für die Anzeige) */
	inboxImported = $state(0);
	#syncing = false;

	/**
	 * Eingang der Mitarbeitenden übernehmen: abgeschlossene Stempelungen werden Zeitbuchungen, Urlaubsanträge und Krankmeldungen
	 * Abwesenheiten, Mängelmeldungen Mängel. Jede Übernahme ist über die Eingangs-ID doppelt-sicher (nichts wird zweimal angelegt).
	 */
	/** Tauschwünsche, die auf eine Entscheidung warten (Anzeige in Team und Heute) */
	swaps = $state<SwapWish[]>([]);
	/** Tauschwünsche holen; genehmigte werden als Vertretung („ersetzt“) in den Einsatzplan übernommen. */
	async syncSwaps() {
		try {
			const r = await fetch('/api/swaps');
			if (!r.ok) return;
			const { swaps } = (await r.json()) as { swaps: SwapWish[] };
			this.swaps = swaps.filter((s) => s.status === 'angenommen');
			const done: string[] = [];
			for (const s of swaps.filter((x) => x.status === 'bestaetigt')) {
				const cid = 'sw' + s.id;
				if (!this.data.covers.some((c) => c.id === cid) && s.takenBy) {
					this.data.covers.push({ id: cid, siteId: s.siteId, date: s.date, employeeId: s.takenBy, replacesId: s.offeredBy, swapId: s.id });
					const f = this.site(s.siteId);
					if (f) this.addEvent(f.customer.id, 'notiz', `Schichttausch ${s.date.split('-').reverse().slice(0, 2).join('.')}.: ${this.employee(s.takenBy)?.name ?? '?'} übernimmt für ${this.employee(s.offeredBy)?.name ?? '?'}.`);
					this.inboxImported += 1;
				}
				done.push(s.id);
			}
			if (done.length) await fetch('/api/swaps/applied', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ids: done }) });
		} catch { /* nächster Versuch */ }
	}
	/** Genehmigen oder ablehnen. Gibt eine Fehlermeldung zurück, wenn der Server den Tausch nicht mehr zulässt. */
	async decideSwap(id: string, decision: 'approve' | 'reject'): Promise<string | null> {
		const r = await fetch('/api/swaps/decide', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, decision }) });
		const j = await r.json().catch(() => ({}));
		await this.syncSwaps();
		return r.ok ? null : (j.error ?? 'Nicht möglich.');
	}

	async syncInbox() {
		if (this.#syncing || !this.session?.management || !this.ready) return;
		await this.syncSwaps();
		this.#syncing = true;
		try {
			const r = await fetch('/api/inbox');
			if (!r.ok) return;
			const { items } = (await r.json()) as { items: { id: string; employeeId: string; kind: 'punch' | 'absence' | 'defect' | 'correction'; payload: any; createdAt: string; hasPhoto: boolean }[] };
			if (!items.length) return;
			const today = todayKey();
			const d = this.data;
			const who = (id: string) => d.employees.find((e) => e.id === id)?.name ?? 'Mitarbeiter';
			let n = 0;
			for (const it of items) {
				if (it.kind === 'punch') {
					const tid = 't' + it.id;
					if (d.timeEntries.some((t) => t.id === tid)) continue;
					const p = it.payload;
					const loc = (iso: string) => ({ date: new Date(iso).toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' }), time: new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Berlin' }) });
					const a = loc(p.startAt), z = loc(p.endAt);
					if (a.time === z.time && a.date === z.date) continue; // gleiche Minute: nichts zu buchen
					const notes = [p.offline ? 'Offline erfasst, nachgereicht' : '', p.suspect ? 'Länger als 14 Std., bitte prüfen' : '', geoLabel(p.geoIn, 'Ein'), geoLabel(p.geoOut, 'Aus'), this.isLocked(a.date) ? 'Monat war schon abgeschlossen' : ''].filter(Boolean).join('; ');
					d.timeEntries.push({ id: tid, employeeId: it.employeeId, siteId: p.siteId, date: a.date, start: a.time, end: z.time, breakMin: p.breakMin ?? 0, note: notes, createdAt: p.endAt, editedAt: null, source: 'app', voided: false, history: [] });
					n++;
				} else if (it.kind === 'absence') {
					const aid = 'ab' + it.id;
					if (d.absences.some((a) => a.id === aid)) continue;
					const p = it.payload;
					d.absences.push({ id: aid, employeeId: it.employeeId, kind: p.kind, from: p.from, to: p.to, status: p.kind === 'krank' ? 'genehmigt' : 'beantragt' });
					if (p.kind === 'krank') d.tasks.push({ id: 'a' + it.id, title: `Krankmeldung ${who(it.employeeId)} (${p.from.split('-').reverse().slice(0, 2).join('.')}.): Vertretung klären`, dueOn: today, customerId: null, done: false });
					n++;
				} else if (it.kind === 'correction') {
					const cid = 'c' + it.id;
					d.corrections ??= []; // danach über den Zustands-Proxy arbeiten, nicht über das frisch zugewiesene Rohobjekt
					const corr = d.corrections;
					if (corr.some((c) => c.id === cid)) continue;
					const p = it.payload;
					const t = this.correctionTarget(p.entryId);
					corr.push({ id: cid, employeeId: it.employeeId, entryId: t?.id ?? p.entryId, date: p.date, old: t ? { start: t.start, end: t.end, breakMin: t.breakMin } : { start: '', end: '', breakMin: 0 }, proposed: { start: p.start, end: p.end, breakMin: p.breakMin ?? 0 }, reason: String(p.reason).slice(0, 300), status: 'offen', reply: '', createdAt: it.createdAt, decidedOn: null });
					d.tasks.push({ id: 'a' + it.id, title: `Zeitkorrektur von ${who(it.employeeId)} prüfen (${p.date.split('-').reverse().slice(0, 2).join('.')}.)`, dueOn: today, customerId: null, done: false });
					n++;
				} else if (it.kind === 'defect') {
					const did = 'd' + it.id.slice(0, 12);
					if (d.defects.some((x) => x.id === did)) continue;
					const found = this.site(it.payload.siteId);
					d.defects.push({ id: did, customerId: found?.customer.id ?? '', siteId: it.payload.siteId, title: String(it.payload.text).slice(0, 80), description: `${String(it.payload.text)}\n(Gemeldet von ${who(it.employeeId)} über die Mitarbeiter-Ansicht)`, status: 'offen', severity: 'normal', reportedOn: today, dueOn: todayKeyPlus(today, 3), closedOn: null, recheck: true, source: 'mitarbeiter', photoId: it.hasPhoto ? it.id : undefined });
					d.tasks.push({ id: 'a' + it.id, title: `Meldung von ${who(it.employeeId)} prüfen: ${String(it.payload.text).slice(0, 50)}`, dueOn: today, customerId: found?.customer.id ?? null, done: false });
					if (found) this.addEvent(found.customer.id, 'notiz', `Mängelmeldung von ${who(it.employeeId)}: ${String(it.payload.text).slice(0, 100)}`);
					n++;
				}
			}
			await fetch('/api/inbox/ack', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ids: items.map((i) => i.id) }) });
			if (n) this.inboxImported += n;
		} catch { /* nächster Versuch */ } finally { this.#syncing = false; }
	}

	/** Beim Start: Sitzung prüfen und, falls Verwaltung, den Datenbestand laden. Mitarbeitende laden hier nichts. */
	/** Name der angemeldeten Person (für Verlauf, Termine, Protokolle) */
	get me() { return this.session?.display ?? CURRENT_USER; }

	async init() {
		try {
			const r = await fetch('/api/session');
			const j = await r.json();
			this.needsSetup = !!j.needsSetup;
			this.setupNeedsCode = !!j.setupNeedsCode;
			this.session = j.user;
			if (j.user?.management && !j.user.mustChange) await this.load();
		} catch {
			this.storageError = true;
		}
		this.ready = true;
	}
	async load() {
		const r = await fetch('/api/state');
		if (r.status === 401 || r.status === 403) { this.session = null; return; }
		const j = await r.json();
		const d = j.data as Data;
		d.company = { ...company, ...(d.company ?? {}) };
		Object.assign(company, d.company);
		this.#rev = j.rev;
		this.#last = JSON.stringify(d);
		this.data = d;
		this.conflict = false;
	}
	async logout() {
		await fetch('/api/logout', { method: 'POST' });
		this.session = null; this.ready = false; this.data = createEmptyData(); this.#last = '';
	}

	constructor() {
		$effect.root(() => {
			let timer: ReturnType<typeof setTimeout>;
			$effect(() => {
				const json = JSON.stringify(this.data);
				clearTimeout(timer);
				if (!this.session?.management || !this.ready) return;
				this.dirty = json !== this.#last;
				if (this.conflict || !this.dirty) return;
				timer = setTimeout(async () => {
					try {
						const r = await fetch('/api/state', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ rev: this.#rev, data: this.data }) });
						if (r.status === 409) { this.conflict = true; return; }
						if (!r.ok) throw new Error(String(r.status));
						this.#rev = (await r.json()).rev;
						this.#last = json;
						this.dirty = JSON.stringify(this.data) !== json;
						this.savedAt = new Date();
						this.storageError = false;
					} catch {
						this.storageError = true;
					}
				}, 600);
			});
		});
	}

	customer = (id: string) => this.data.customers.find((c) => c.id === id);
	quote = (id: string) => this.data.quotes.find((q) => q.id === id);
	quotesOf = (customerId: string) => this.data.quotes.filter((q) => q.customerId === customerId);
	eventsOf = (customerId: string) =>
		this.data.events.filter((e) => e.customerId === customerId).sort((a, b) => b.at.localeCompare(a.at));

	/** Monatsumsatz aus angenommenen Unterhaltsreinigungen (netto, Cent) */
	monthlyRecurring(customerId?: string) {
		return this.data.quotes
			.filter((q) => q.status === 'angenommen' && q.kind === 'unterhaltsreinigung' && (!customerId || q.customerId === customerId))
			.reduce((s, q) => s + (q.monthlyCents ?? 0), 0);
	}
	isOverdue = (inv: Data['invoices'][number]) => !inv.paidAt && inv.dueOn < todayKey();

	lastActivity(customerId: string) {
		const times = [
			...this.eventsOf(customerId).map((e) => e.at),
			...this.quotesOf(customerId).map((q) => q.updatedAt)
		];
		return times.sort().at(-1) ?? this.customer(customerId)?.createdAt ?? '';
	}

	addEvent(customerId: string, kind: ActivityEvent['kind'], text: string) {
		this.data.events.push({ id: uid('e'), customerId, at: new Date().toISOString(), kind, text, by: this.me });
	}

	addCustomer(input: {
		name: string;
		contact: Omit<Contact, 'id'>;
		street: string;
		postal: string;
		city: string;
		/** Hinweis zum Objekt (Zugang, Besonderheiten), landet in den Objekt-Hinweisen */
		note?: string;
	}): Customer {
		const id = uid('k');
		const hasContact = input.contact.name.trim();
		const site: Site = { id: id + '-s1', name: input.street || 'Hauptobjekt', street: input.street, postal: input.postal, city: input.city, note: input.note?.trim() ?? '', plan: null };
		const customer: Customer = {
			id,
			name: input.name.trim(),
			status: 'interessent',
			street: input.street,
			postal: input.postal,
			city: input.city,
			contacts: hasContact ? [{ ...input.contact, id: id + '-c1' }] : [],
			sites: input.street ? [site] : [],
			createdAt: new Date().toISOString()
		};
		this.data.customers.push(customer);
		this.addEvent(id, 'notiz', 'Kunde angelegt.');
		return customer;
	}

	removeNote(id: string) {
		const i = this.data.events.findIndex((e) => e.id === id);
		return i >= 0 ? this.data.events.splice(i, 1)[0] : undefined;
	}

	nextQuoteNumber() {
		const nums = this.data.quotes.map((q) => Number(q.number.split('-').at(-1)));
		return `A-${new Date().getFullYear()}-${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
	}

	createQuote(customerId: string, kind: QuoteKind = 'unterhaltsreinigung'): Quote {
		const c = this.customer(customerId)!;
		const now = new Date().toISOString();
		const quote: Quote = {
			id: uid('q'),
			number: this.nextQuoteNumber(),
			version: 1,
			customerId,
			siteId: c.sites[0]?.id ?? null,
			kind,
			status: 'entwurf',
			hourlyCents: null,
			effortText: '',
			monthlyCents: null,
			initialHourlyCents: null,
			items: [],
			calculationNote: '',
			sentAt: null,
			followupOn: null,
			contract: null,
			createdAt: now,
			updatedAt: now
		};
		this.data.quotes.push(quote);
		this.addEvent(customerId, 'angebot', `Angebot ${quote.number} als Entwurf angelegt.`);
		return quote;
	}

	/** Neue Version eines bereits versendeten Angebots (Original bleibt unverändert). */
	newVersion(source: Quote): Quote {
		const now = new Date().toISOString();
		const copy: Quote = {
			...$state.snapshot(source),
			id: uid('q'),
			version: Math.max(...this.data.quotes.filter((q) => q.number === source.number).map((q) => q.version)) + 1,
			status: 'entwurf',
			sentAt: null,
			followupOn: null,
			contract: null,
			createdAt: now,
			updatedAt: now,
			items: source.items.map((i) => ({ ...$state.snapshot(i), id: uid('i') }))
		};
		this.data.quotes.push(copy);
		this.addEvent(source.customerId, 'angebot', `Neue Version ${copy.number} v${copy.version} als Entwurf angelegt.`);
		return copy;
	}

	/**
	 * Berichtsmonat für Auswertungen: der Monat der jüngsten Zeitbuchung. In den ersten Tagen eines Monats ist dieser fast leer,
	 * dann zählt der Vormonat, damit Marge und Plan-Treue nicht verzerrt sind.
	 */
	get refMonth() {
		const today = todayKey();
		const latest = (this.data.timeEntries.map((t) => t.date).sort().at(-1) ?? today).slice(0, 7);
		if (latest === today.slice(0, 7) && Number(today.slice(8)) < 10) return addMonths(today.slice(0, 7) + '-01', -1).slice(0, 7);
		return latest;
	}
	employee = (id: string) => this.data.employees.find((e) => e.id === id);
	site(id: string | null) {
		for (const c of this.data.customers) {
			const s = c.sites.find((x) => x.id === id);
			if (s) return { site: s, customer: c };
		}
		return undefined;
	}
	/** Alle Objekte mit Reinigungsplan. */
	plannedSites() {
		return this.data.customers.flatMap((c) => c.sites.filter((s) => s.plan).map((s) => ({ site: s, customer: c })));
	}
	isAbsent(employeeId: string, date: string) {
		return this.data.absences.find((a) => a.status === 'genehmigt' && a.employeeId === employeeId && a.from <= date && date <= a.to);
	}
	/** Besetzung eines Einsatzes: Stammbesetzung (ohne Abwesende) plus Vertretungen. */
	staffing(siteId: string, date: string) {
		const s = this.site(siteId)?.site;
		if (!s?.plan || !s.plan.days.includes(weekday(date))) return null;
		const regular = s.plan.staffIds.map((id) => this.employee(id)).filter((e): e is Employee => !!e);
		const replaced = (id: string) => this.data.covers.some((c) => c.siteId === siteId && c.date === date && c.replacesId === id);
		const present = regular.filter((e) => !this.isAbsent(e.id, date) && !replaced(e.id));
		const absent = regular.filter((e) => this.isAbsent(e.id, date) && !replaced(e.id));
		const covers = this.data.covers.filter((c) => c.siteId === siteId && c.date === date).map((c) => ({ cover: c, emp: this.employee(c.employeeId)! }));
		return { present, absent, covers, understaffed: present.length + covers.length < regular.length, empty: present.length + covers.length === 0 };
	}
	/** Die Buchung, auf die sich ein Korrekturantrag bezieht (die App-Stempelung heißt im Bestand „t“ + Eingangs-ID) */
	correctionTarget = (entryId: string) => this.data.timeEntries.find((t) => t.id === entryId || t.id === 't' + entryId);
	/** Offene Korrekturanträge */
	get openCorrections() { return (this.data.corrections ?? []).filter((c) => c.status === 'offen'); }
	/**
	 * Antrag freigeben oder ablehnen. Freigabe schreibt die Zeiten in die Buchung und ins Änderungsprotokoll,
	 * Ablehnung braucht eine Antwort. Abgeschlossene Monate bleiben gesperrt. Gibt eine Fehlermeldung zurück oder null.
	 */
	decideCorrection(id: string, approve: boolean, reply: string): string | null {
		const c = (this.data.corrections ?? []).find((x) => x.id === id);
		if (!c || c.status !== 'offen') return 'Der Antrag ist schon entschieden.';
		const by = this.session?.display ?? 'Büro';
		const stamp = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short' });
		if (!approve) {
			if (reply.trim().length < 3) return 'Bitte eine kurze Begründung für die Ablehnung angeben.';
			c.status = 'abgelehnt'; c.reply = reply.trim().slice(0, 300); c.decidedOn = new Date().toISOString();
			const t = this.correctionTarget(c.entryId);
			t?.history.push(`${stamp}: Korrekturantrag ${c.proposed.start}–${c.proposed.end} abgelehnt (${by}): ${c.reply}`);
			return null;
		}
		const t = this.correctionTarget(c.entryId);
		if (!t) return 'Die Buchung ist noch nicht übernommen oder wurde entfernt.';
		if (t.voided) return 'Die Buchung ist ungültig gesetzt.';
		if (this.isLocked(t.date)) return 'Der Monat ist abgeschlossen. Erst entsperren, dann freigeben.';
		t.history.push(`${stamp}: Korrektur auf Antrag freigegeben (${by}): ${t.start}–${t.end} (Pause ${t.breakMin}) → ${c.proposed.start}–${c.proposed.end} (Pause ${c.proposed.breakMin}). Grund: ${c.reason}`);
		Object.assign(t, { start: c.proposed.start, end: c.proposed.end, breakMin: c.proposed.breakMin, editedAt: new Date().toISOString() });
		c.status = 'genehmigt'; c.reply = reply.trim().slice(0, 300); c.decidedOn = new Date().toISOString();
		return null;
	}
	isLocked = (date: string) => this.data.lockedMonths.includes(date.slice(0, 7));
	/** Zuschlag in Cent für eine Zeitbuchung (Basis: Stundenlohn aus den Kalkulationsannahmen) */
	surchargeOf(e: TimeEntry) {
		if (e.voided) return 0;
		return surchargeCents(e.date, e.start, e.end, this.data.calc.wageCents);
	}
	hoursOf(e: TimeEntry) {
		return e.voided ? 0 : entryHours(e.start, e.end, e.breakMin);
	}
	nextInvoiceNumber() {
		const nums = this.data.invoices.map((i) => Number(i.number.split('-').at(-1)));
		return `R-${new Date().getFullYear()}-${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
	}
	/** Vertragslaufzeit-Status für einen Abrechnungsmonat (YYYY-MM): Vertrag begonnen und noch nicht abgerechnet. */
	billableContracts(period: string) {
		const end = period + '-31';
		return this.data.quotes.filter(
			(q) => q.status === 'angenommen' && q.kind === 'unterhaltsreinigung' && q.contract && q.contract.startOn <= end && !this.data.invoices.some((i) => i.quoteId === q.id && i.period === period)
		);
	}
	createInvoice(q: Quote, period: string, today: string, dueOn: string) {
		const inv = {
			id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
			number: this.nextInvoiceNumber(),
			customerId: q.customerId,
			netCents: q.monthlyCents ?? 0,
			issuedOn: today,
			dueOn,
			paidAt: null,
			period,
			quoteId: q.id,
			remindCount: 0,
			remindedAt: null
		};
		this.data.invoices.push(inv);
		this.addEvent(q.customerId, 'rechnung', `Rechnung ${inv.number} über ${(inv.netCents / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })} € netto erstellt.`);
		return inv;
	}
	/** Absenderdaten speichern und für die PDF-Erzeugung übernehmen */
	setCompany(c: Company) {
		this.data.company = { ...c };
		Object.assign(company, c);
	}
	/** Kompletten Datenbestand ersetzen (Import einer Sicherung) */
	replaceAll(d: Data) {
		d.company = { ...company, ...(d.company ?? {}) };
		this.data = d;
		Object.assign(company, d.company);
	}
	reset(team: 8 | 12 = 8) {
		this.data = createDemoData(team);
		Object.assign(company, this.data.company);
	}
	/** Alle Demo-Daten entfernen. Firmendaten und Kalkulationsannahmen bleiben erhalten. */
	clear() {
		this.data = createEmptyData({ company: this.data.company, calc: this.data.calc });
	}
}

export const db = new Db();
