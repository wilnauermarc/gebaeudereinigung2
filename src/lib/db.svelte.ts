import { company, type Company } from './company';
import { createDemoData, createEmptyData } from './demo.ts';
import { todayKey } from './format';
import { addMonths, entryHours, weekday } from './calc';
import { surchargeCents } from './surcharge';
import type { ActivityEvent, Contact, Customer, Data, Employee, Quote, QuoteKind, Site, TimeEntry } from './types';

/** Schlüssel der früheren Browser-Speicherung (nur noch zum Übernehmen alter Daten beim Einrichten) */
export const LEGACY_KEY = 'resch-demo-data-v11';
export const CURRENT_USER = 'Anetta R.';

export interface Session { id: string; display: string; role: 'inhaber' | 'buero' | 'objektleitung' | 'mitarbeiter'; employeeId: string | null; mustChange: boolean; management: boolean }

const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

class Db {
	data = $state<Data>(createEmptyData());
	/** Anmeldung geprüft und (für die Verwaltung) der Datenbestand vom Server geladen */
	ready = $state(false);
	session = $state<Session | null>(null);
	needsSetup = $state(false);
	/** Zeitpunkt der letzten Speicherung auf dem Server (für die Statusanzeige) */
	savedAt = $state<Date | null>(null);
	storageError = $state(false);
	/** Der Datenbestand wurde anderswo geändert: Speichern ist gestoppt, bis neu geladen wird */
	conflict = $state(false);
	#rev = 0;
	#last = '';
	/** Es gibt Änderungen, die noch nicht auf dem Server liegen */
	dirty = $state(false);

	/** Beim Start: Sitzung prüfen und, falls Verwaltung, den Datenbestand laden. Mitarbeitende laden hier nichts. */
	/** Name der angemeldeten Person (für Verlauf, Termine, Protokolle) */
	get me() { return this.session?.display ?? CURRENT_USER; }

	async init() {
		try {
			const r = await fetch('/api/session');
			const j = await r.json();
			this.needsSetup = !!j.needsSetup;
			this.session = j.user;
			if (j.user?.management) await this.load();
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
		const present = regular.filter((e) => !this.isAbsent(e.id, date));
		const absent = regular.filter((e) => this.isAbsent(e.id, date));
		const covers = this.data.covers.filter((c) => c.siteId === siteId && c.date === date).map((c) => ({ cover: c, emp: this.employee(c.employeeId)! }));
		return { present, absent, covers, understaffed: present.length + covers.length < regular.length, empty: present.length + covers.length === 0 };
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
