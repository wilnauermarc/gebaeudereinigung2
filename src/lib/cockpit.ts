/**
 * Controlling-Logik als reine Funktionen auf den Daten: Wirtschaftlichkeit je Objekt, Gesundheitsscore,
 * Lücken-Detektor, Vertretungs-Assistent und Lohn-Simulation. Alle Schwellen sind Annahmen und
 * mit den eigenen Zielwerten abzugleichen. Auswertungen sind je Objekt bzw. als Betriebssumme, nicht je Person bewertet.
 */
import { addDays, addMonths, entryHours, fromMinutes, hourlyRate, toMinutes, weekday } from './calc';
import { MINIJOB_LIMIT_CENTS } from './tariff';
import { surchargeCents } from './surcharge';
import type { Data, Employee, Quote, TimeEntry } from './types';

export const TARGET_MARGIN = 0.25;
export const MIN_MARGIN = 0.1;

export const hoursOf = (e: TimeEntry) => (e.voided ? 0 : entryHours(e.start, e.end, e.breakMin));
export const costPerHour = (d: Data, wageCents = d.calc.wageCents) => Math.round(wageCents * (1 + d.calc.lnkPct / 100));
const empName = (d: Data, id: string) => d.employees.find((e) => e.id === id)?.name ?? id;

export function findSite(d: Data, siteId: string | null) {
	for (const c of d.customers) {
		const s = c.sites.find((x) => x.id === siteId);
		if (s) return { site: s, customer: c };
	}
	return undefined;
}
/** Wird die Person an diesem Tag und Objekt durch eine Vertretung ersetzt (Schichttausch)? */
export const isReplaced = (d: Data, siteId: string, date: string, empId: string) => d.covers.some((c) => c.siteId === siteId && c.date === date && c.replacesId === empId);
export const isAbsent = (d: Data, empId: string, date: string) =>
	d.absences.find((a) => a.status === 'genehmigt' && a.employeeId === empId && a.from <= date && date <= a.to);

/** Anzahl Tage eines Monats (YYYY-MM) */
export const daysInMonth = (month: string) => new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();

/** Laufende Unterhaltsreinigungen mit Objekt = Basis für Controlling */
export const contractQuotes = (d: Data) =>
	d.quotes.filter((q) => q.status === 'angenommen' && q.contract && q.kind === 'unterhaltsreinigung' && q.siteId);

export interface Economics {
	quote: Quote;
	revenue: number;
	hours: number;
	/** Soll-Stunden laut Plan bis zum Stichtag */
	sollHours: number;
	cost: number;
	surchargeCost: number;
	margin: number;
}

/** Wirtschaftlichkeit eines Vertragsobjekts im Monat. `wageCents` erlaubt Lohn-Simulationen. */
export function economics(d: Data, q: Quote, month: string, o: { wageCents?: number; until?: string } = {}): Economics {
	const wage = o.wageCents ?? d.calc.wageCents;
	const entries = d.timeEntries.filter((t) => t.siteId === q.siteId && t.date.startsWith(month) && (!o.until || t.date <= o.until));
	const hours = entries.reduce((a, t) => a + hoursOf(t), 0);
	const lnk = 1 + d.calc.lnkPct / 100;
	const surcharge = entries.reduce((a, t) => a + (t.voided ? 0 : surchargeCents(t.date, t.start, t.end, wage)), 0);
	const surchargeCost = Math.round(surcharge * lnk);
	const cost = Math.round(hours * wage * lnk) + surchargeCost;
	const revenue = q.monthlyCents ?? 0;
	const plan = findSite(d, q.siteId)?.site.plan;
	let soll = 0;
	if (plan) {
		const last = daysInMonth(month);
		const end = o.until && o.until < `${month}-${String(last).padStart(2, '0')}` ? o.until : `${month}-${String(last).padStart(2, '0')}`;
		for (let day = `${month}-01`; day <= end; day = addDays(day, 1)) if (plan.days.includes(weekday(day))) soll += plan.hours * plan.staffIds.length;
	}
	return { quote: q, revenue, hours, sollHours: soll, cost, surchargeCost, margin: revenue ? (revenue - cost) / revenue : 0 };
}

/** Prognose bis Monatsende: Ist bis gestern plus Planstunden ab heute (ohne Abwesende, mit Vertretungen). */
export function forecast(d: Data, q: Quote, month: string, today: string) {
	const yesterday = addDays(today, -1);
	const eco = economics(d, q, month, { until: yesterday });
	const plan = findSite(d, q.siteId)?.site.plan;
	let futureHours = 0;
	if (plan) {
		const last = `${month}-${String(daysInMonth(month)).padStart(2, '0')}`;
		for (let day = today > `${month}-01` ? today : `${month}-01`; day <= last; day = addDays(day, 1)) {
			if (day < today || !plan.days.includes(weekday(day))) continue;
			const present = plan.staffIds.filter((id) => !isAbsent(d, id, day) && !isReplaced(d, q.siteId!, day, id)).length;
			const covers = d.covers.filter((c) => c.siteId === q.siteId && c.date === day).length;
			futureHours += plan.hours * (present + covers);
		}
	}
	const hours = eco.hours + futureHours;
	const cost = eco.cost + Math.round(futureHours * costPerHour(d));
	return { hours, cost, margin: eco.revenue ? (eco.revenue - cost) / eco.revenue : 0, revenue: eco.revenue };
}

// ───────── Betriebs-Gauges für „Heute“ ─────────
export interface Gauges {
	/** Gesamtmarge des Berichtsmonats, 0–1 */
	margin: number;
	/** Anteil besetzter Einsätze in der laufenden Woche, 0–1 */
	staffing: number;
	/** Anteil Rechnungen, die bezahlt oder noch nicht fällig sind, 0–1 */
	payment: number;
	/** Ist- gegen Soll-Stunden (begrenzt auf 0–1, 1 = Plan eingehalten) */
	plan: number;
	staffedCount: number;
	plannedCount: number;
}
export function gauges(d: Data, month: string, today: string, mondayKey: string): Gauges {
	const eco = contractQuotes(d).map((q) => economics(d, q, month));
	const rev = eco.reduce((a, e) => a + e.revenue, 0), cost = eco.reduce((a, e) => a + e.cost, 0);
	let planned = 0, staffed = 0;
	for (let i = 0; i < 7; i++) {
		const date = addDays(mondayKey, i);
		for (const c of d.customers) for (const s of c.sites) {
			if (!s.plan?.days.includes(weekday(date))) continue;
			planned++;
			const present = s.plan.staffIds.filter((id) => !isAbsent(d, id, date) && !isReplaced(d, s.id, date, id)).length + d.covers.filter((x) => x.siteId === s.id && x.date === date).length;
			if (present > 0) staffed++;
		}
	}
	const inv = d.invoices.filter((i) => i.issuedOn >= addDays(today, -120));
	const bad = inv.filter((i) => !i.paidAt && i.dueOn < today).length;
	const soll = eco.reduce((a, e) => a + e.sollHours, 0), ist = eco.reduce((a, e) => a + e.hours, 0);
	return {
		margin: rev ? (rev - cost) / rev : 0,
		staffing: planned ? staffed / planned : 1,
		payment: inv.length ? 1 - bad / inv.length : 1,
		plan: soll ? Math.max(0, 1 - Math.abs(1 - ist / soll)) : 1,
		staffedCount: staffed, plannedCount: planned
	};
}

// ───────── Gesundheitsscore ─────────
export interface Health {
	quote: Quote;
	score: number;
	parts: { margin: number; plan: number; quality: number; payment: number };
	flags: string[];
	eco: Economics;
}
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const inspectionScore = (items: { rating: string }[]) => {
	const rated = items.filter((i) => i.rating !== 'na');
	return rated.length ? (rated.filter((i) => i.rating === 'ok').length / rated.length) * 100 : 100;
};

/** Gewichtung: Marge 40 %, Planabweichung 20 %, Qualität 25 %, Zahlungsmoral 15 %. */
export function healthScores(d: Data, month: string, today: string): Health[] {
	const until = addDays(today, -1);
	return contractQuotes(d).map((q) => {
		const eco = economics(d, q, month, { until: until < `${month}-31` ? until : undefined });
		const flags: string[] = [];
		const margin = clamp((eco.margin / TARGET_MARGIN) * 100);
		if (eco.revenue && eco.margin < MIN_MARGIN) flags.push(`Marge nur ${Math.round(eco.margin * 100)} %`);
		let plan = 100;
		if (eco.sollHours > 0) {
			const dev = Math.abs(1 - eco.hours / eco.sollHours);
			plan = clamp(100 - dev * 200);
			if (dev > 0.15) flags.push(`${eco.hours < eco.sollHours ? 'Unter' : 'Über'}plan: ${Math.round(eco.hours)} statt ${Math.round(eco.sollHours)} Std.`);
		}
		const last = d.inspections.filter((i) => i.siteId === q.siteId).sort((a, b) => b.date.localeCompare(a.date))[0];
		const openDefects = d.defects.filter((x) => x.siteId === q.siteId && x.status !== 'erledigt');
		const lateDefects = openDefects.filter((x) => x.dueOn < today).length;
		const quality = clamp((last ? inspectionScore(last.items) : 70) - openDefects.length * 12 - lateDefects * 10);
		if (openDefects.length) flags.push(`${openDefects.length} offene${openDefects.length === 1 ? 'r Mangel' : ' Mängel'}${lateDefects ? ` (${lateDefects} überfällig)` : ''}`);
		const overdue = d.invoices.filter((i) => i.customerId === q.customerId && !i.paidAt && i.dueOn < today);
		const payment = clamp(100 - overdue.length * 45);
		if (overdue.length) flags.push(`${overdue.length} überfällige Rechnung${overdue.length === 1 ? '' : 'en'}`);
		const score = clamp(margin * 0.4 + plan * 0.2 + quality * 0.25 + payment * 0.15);
		return { quote: q, score, parts: { margin, plan, quality, payment }, flags, eco };
	}).sort((a, b) => a.score - b.score);
}
export const healthTone = (s: number) => (s >= 75 ? 'success' : s >= 50 ? 'warn' : 'danger') as 'success' | 'warn' | 'danger';

// ───────── Lücken-Detektor ─────────
export interface Gap {
	kind: 'fehlt' | 'abwesend' | 'lang' | 'doppelt';
	date: string;
	siteId: string | null;
	employeeId: string;
	text: string;
}

/** Vergleicht Einsatzplan und Zeitbuchungen der letzten Tage und meldet Auffälligkeiten. */
export function findGaps(d: Data, today: string, backDays = 7): Gap[] {
	const gaps: Gap[] = [];
	for (let i = 1; i <= backDays; i++) {
		const date = addDays(today, -i);
		for (const c of d.customers) for (const s of c.sites) {
			const p = s.plan;
			if (!p || !p.days.includes(weekday(date))) continue;
			const expected = [
				...p.staffIds.filter((id) => !isAbsent(d, id, date) && !isReplaced(d, s.id, date, id)),
				...d.covers.filter((x) => x.siteId === s.id && x.date === date).map((x) => x.employeeId)
			];
			for (const emp of expected) {
				const has = d.timeEntries.some((t) => t.employeeId === emp && t.siteId === s.id && t.date === date && !t.voided);
				if (!has) gaps.push({ kind: 'fehlt', date, siteId: s.id, employeeId: emp, text: `${empName(d, emp)} war für ${c.name} (${s.name}) eingeplant, es gibt keine Zeitbuchung.` });
			}
		}
		const day = d.timeEntries.filter((t) => t.date === date && !t.voided);
		for (const t of day) {
			const s = findSite(d, t.siteId);
			if (hoursOf(t) > 12) gaps.push({ kind: 'lang', date, siteId: t.siteId, employeeId: t.employeeId, text: `${empName(d, t.employeeId)}: ${hoursOf(t).toFixed(1).replace('.', ',')} Std. an einem Tag, bitte Beginn und Ende prüfen.` });
			if (isAbsent(d, t.employeeId, date)) gaps.push({ kind: 'abwesend', date, siteId: t.siteId, employeeId: t.employeeId, text: `${empName(d, t.employeeId)} hat gebucht${s ? ` (${s.customer.name})`: ''}, ist aber an dem Tag als abwesend eingetragen.` });
		}
		for (const a of day) for (const b of day) {
			if (a.id >= b.id || a.employeeId !== b.employeeId) continue;
			const sa = toMinutes(a.start), ea = toMinutes(a.end) <= sa ? toMinutes(a.end) + 1440 : toMinutes(a.end);
			const sb = toMinutes(b.start), eb = toMinutes(b.end) <= sb ? toMinutes(b.end) + 1440 : toMinutes(b.end);
			if (sa < eb && sb < ea) gaps.push({ kind: 'doppelt', date, siteId: b.siteId, employeeId: a.employeeId, text: `${empName(d, a.employeeId)} hat sich überschneidende Buchungen (${a.start}–${a.end} und ${b.start}–${b.end}).` });
		}
	}
	return gaps.sort((a, b) => b.date.localeCompare(a.date));
}

// ───────── Vertretungs-Assistent ─────────
export interface CoverCandidate {
	employee: Employee;
	allowed: boolean;
	/** Grund, falls nicht einteilbar, sonst Hinweis */
	reason: string;
	capacityLeft: number;
	minijobLeftCents: number | null;
	costCents: number;
}

/** Wochenstunden laut Plan (Stammbesetzung) */
export function plannedWeeklyHours(d: Data, empId: string) {
	let h = 0;
	for (const c of d.customers) for (const s of c.sites) if (s.plan?.staffIds.includes(empId)) h += s.plan.hours * s.plan.days.length;
	return h;
}
export function earnedInMonth(d: Data, empId: string, month: string) {
	return d.timeEntries.filter((t) => t.employeeId === empId && t.date.startsWith(month) && !t.voided)
		.reduce((a, t) => a + Math.round(hoursOf(t) * d.calc.wageCents) + surchargeCents(t.date, t.start, t.end, d.calc.wageCents), 0);
}

export function coverCandidates(d: Data, siteId: string, date: string): CoverCandidate[] {
	const found = findSite(d, siteId);
	const p = found?.site.plan;
	if (!p) return [];
	const from = toMinutes(p.start), to = from + p.hours * 60;
	const end = fromMinutes(to);
	const month = date.slice(0, 7);
	const shiftPay = Math.round(p.hours * d.calc.wageCents) + surchargeCents(date, p.start, end, d.calc.wageCents);
	const cost = Math.round(shiftPay * (1 + d.calc.lnkPct / 100));
	return d.employees.filter((e) => !p.staffIds.includes(e.id)).map((e): CoverCandidate => {
		const capacityLeft = e.weeklyHours - plannedWeeklyHours(d, e.id);
		const left = e.contract === 'minijob' ? MINIJOB_LIMIT_CENTS - earnedInMonth(d, e.id, month) : null;
		let reason = '';
		const abs = isAbsent(d, e.id, date);
		if (abs) reason = abs.kind === 'krank' ? 'krank' : 'im Urlaub';
		else if (d.covers.some((x) => x.siteId === siteId && x.date === date && x.employeeId === e.id)) reason = 'bereits eingeteilt';
		else {
			const clash = d.customers.flatMap((c) => c.sites).find((s) => {
				if (s.id === siteId || !s.plan || !s.plan.days.includes(weekday(date)) || !s.plan.staffIds.includes(e.id) || isAbsent(d, e.id, date)) return false;
				const a = toMinutes(s.plan.start), b = a + s.plan.hours * 60;
				return a < to && from < b;
			});
			const coverClash = d.covers.some((x) => x.employeeId === e.id && x.date === date && x.siteId !== siteId && (() => {
				const s = findSite(d, x.siteId)?.site.plan;
				if (!s) return false;
				const a = toMinutes(s.start), b = a + s.hours * 60;
				return a < to && from < b;
			})());
			if (clash || coverClash) reason = 'Termin zur selben Zeit';
			else if (left !== null && shiftPay > left) reason = 'würde Minijob-Grenze überschreiten';
		}
		return { employee: e, allowed: !reason, reason, capacityLeft, minijobLeftCents: left, costCents: cost };
	}).sort((a, b) =>
		Number(b.allowed) - Number(a.allowed) ||
		Number(b.employee.role === 'Springer') - Number(a.employee.role === 'Springer') ||
		b.capacityLeft - a.capacityLeft || a.costCents - b.costCents
	);
}

// ───────── Preis-Wirtschaftlichkeit (Angebots-Assistent) ─────────
export interface PriceCheck {
	/** Selbstkosten (Vollkosten): Lohn mit Nebenkosten, unproduktive Zeit, Material, Maschinen und Gemeinkosten */
	cost: number;
	/** nur Lohn mit Lohnnebenkosten für die kalkulierten Stunden (ohne unproduktive Zeit, Material, Gemeinkosten) */
	wageCost: number;
	/** Marge auf den Preis, gerechnet gegen die Selbstkosten */
	margin: number;
	/** Zielmarge laut Kalkulations-Annahmen (Wagnis und Gewinn) */
	targetMargin: number;
	/** Preis, den der Kalkulator für diese Stunden ausweist (Selbstkosten plus Wagnis und Gewinn) */
	targetPrice: number;
	/** Preis, bei dem gerade die Selbstkosten gedeckt sind */
	floorPrice: number;
	perHourRevenue: number | null;
	tone: 'success' | 'warn' | 'danger';
}
/** Selbstkosten je kalkulierter Stunde (Cent): Verrechnungssatz des Kalkulators ohne Wagnis und Gewinn. */
export const fullCostPerHour = (d: Data) => hourlyRate(d.calc) / (1 + d.calc.profitPct / 100);

/**
 * Wirtschaftlichkeit eines Angebots mit Vollkosten, damit sie zum Kalkulator passt.
 * Monatspauschale: Kosten aus kalkulierten Stunden. Stundenpreis: Marge je Stunde.
 */
export function priceCheck(d: Data, q: Pick<Quote, 'kind' | 'monthlyCents' | 'hourlyCents' | 'calcHours'>): PriceCheck | null {
	const cph = fullCostPerHour(d);
	const wph = costPerHour(d);
	const targetMargin = d.calc.profitPct / 100 / (1 + d.calc.profitPct / 100);
	let price: number | null, cost: number, wageCost: number, hours: number | null;
	if (q.kind === 'unterhaltsreinigung') {
		if (!q.monthlyCents || !q.calcHours) return null;
		price = q.monthlyCents; hours = q.calcHours; cost = Math.round(hours * cph); wageCost = Math.round(hours * wph);
	} else {
		if (!q.hourlyCents) return null;
		price = q.hourlyCents; hours = 1; cost = Math.round(cph); wageCost = wph;
	}
	const margin = (price - cost) / price;
	return {
		cost, wageCost, margin, targetMargin,
		targetPrice: Math.ceil((cost * (1 + d.calc.profitPct / 100)) / 100) * 100,
		floorPrice: Math.ceil(cost / 100) * 100,
		perHourRevenue: q.kind === 'unterhaltsreinigung' ? Math.round(price / hours) : price,
		tone: margin >= targetMargin - 0.005 ? 'success' : margin >= 0 ? 'warn' : 'danger'
	};
}

/** Durchschnittlicher Monatspreis je m² der laufenden Verträge mit bekannter Fläche */
export function avgPricePerM2(d: Data) {
	const rows = contractQuotes(d).map((q) => ({ q, area: findSite(d, q.siteId)?.site.plan?.areaM2 ?? null })).filter((r) => r.area && r.q.monthlyCents);
	if (!rows.length) return null;
	const sum = rows.reduce((a, r) => a + r.q.monthlyCents!, 0), area = rows.reduce((a, r) => a + r.area!, 0);
	return Math.round(sum / area);
}

export { addMonths };
