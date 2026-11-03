/**
 * DEMO-DATEN – vollständig erfunden (Namen, Adressen, example.com).
 * Zeitangaben sind relativ zum heutigen Tag, damit das Dashboard lebendig wirkt.
 */
import { todayKey } from './format';
import { fromMinutes, toMinutes, weekday } from './calc';
import { defaultCalc } from './tariff';
import { defaultChecklist } from './cases';
import { demoCoords } from './geo';
import { company as defaultCompany } from './company';
import type { Case, Data, Defect, Quote, QuoteItem, SitePlan } from './types';

const DAY = 86400000;
const at = (days: number, hour = 9, min = 0) => {
	const d = new Date(Date.now() + days * DAY);
	d.setUTCHours(hour - 1, min, 0, 0); // ≈ Europe/Berlin (Winterzeit)
	return d.toISOString();
};
const on = (days: number) => todayKey(new Date(Date.now() + days * DAY));
const items = (...rows: [string, string][]): QuoteItem[] =>
	rows.map(([frequency, text], i) => ({ id: `i${i}-${Math.random().toString(36).slice(2, 7)}`, text, frequency }));

const OFFICE = items(
	['5 x pro Woche', 'Büroräume: Böden saugen bzw. feucht wischen'],
	['5 x pro Woche', 'Papierkörbe leeren, Müll entsorgen'],
	['3 x pro Woche', 'Sanitärräume reinigen und desinfizieren'],
	['1 x pro Woche', 'Schreibtische und Oberflächen feucht abwischen'],
	['1 x pro Monat', 'Fensterbänke und Heizkörper reinigen'],
	['Vierteljährlich', 'Fenster innen und außen reinigen']
);

function q(
	n: number,
	customerId: string,
	siteId: string | null,
	kind: Quote['kind'],
	status: Quote['status'],
	rest: Partial<Quote>
): Quote {
	return {
		id: `q${n}`,
		number: `A-2026-${String(n).padStart(4, '0')}`,
		version: 1,
		customerId,
		siteId,
		kind,
		status,
		hourlyCents: null,
		effortText: '',
		monthlyCents: null,
		initialHourlyCents: null,
		items: [],
		calculationNote: '',
		sentAt: null,
		followupOn: null,
		contract: null,
		createdAt: at(-30),
		updatedAt: at(-3),
		...rest
	};
}

/** Leere App: keine Kunden, Angebote, Mitarbeitenden usw. Firmendaten und Kalkulationsannahmen bleiben. */
export function createEmptyData(keep?: Pick<Data, 'company' | 'calc'>): Data {
	return {
		company: { ...(keep?.company ?? defaultCompany) }, cases: [], tasks: [], docs: [], material: [], lockedMonths: [], inspections: [], keys: [], customers: [], quotes: [], events: [], appointments: [],
		invoices: [], employees: [], absences: [], covers: [], timeEntries: [], defects: [], calc: { ...(keep?.calc ?? defaultCalc) }
	};
}

/** `team` = Anzahl Mitarbeitende: 8 (Standard) oder 12 (zusätzliche Objekte, Personen, Abwesenheiten). */
export function createDemoData(team: 8 | 12 = 8): Data {
	const c = (id: string, name: string, status: Data['customers'][number]['status'], street: string, postal: string, city: string, contact: [string, string, string, string], sites: [string, string, string, string, string][], created: number) => ({
		id,
		name,
		status,
		street,
		postal,
		city,
		contacts: [{ id: id + '-c1', name: contact[0], role: contact[1], email: contact[2], phone: contact[3] }],
		sites: sites.map((s, i) => ({ id: `${id}-s${i + 1}`, name: s[0], street: s[1], postal: s[2], city: s[3], note: s[4], plan: null as SitePlan | null, lat: demoCoords(s[3], id + i)[0], lon: demoCoords(s[3], id + i)[1] })),
		createdAt: at(created)
	});

	const customers = [
		c('k1', 'Hausverwaltung Lindenhof GmbH & Co. KG', 'aktiv', 'Lindenweg 4', '12345', 'Musterstadt', ['Erika Beispiel', 'Objektbetreuung', 'e.beispiel@example.com', '0123 456789'], [
			['Lindenweg 4 – Treppenhaus', 'Lindenweg 4', '12345', 'Musterstadt', 'Schlüssel beim Hausmeister, Zugang Seiteneingang.'],
			['Gartenstraße 12 – Wohnanlage', 'Gartenstraße 12', '12345', 'Musterstadt', '']
		], -420),
		c('k2', 'Gemeinschaftspraxis Dr. Beispiel, Dr. Muster und Kollegen für Allgemeinmedizin und Innere Medizin', 'aktiv', 'Ärztehaus Mitte, Marktplatz 7', '12347', 'Beispieldorf', ['Sabine Muster', 'Praxismanagerin', 's.muster@example.com', '0123 555010'], [
			['Praxisräume 2. OG', 'Marktplatz 7', '12347', 'Beispieldorf', 'Reinigung nur nach 19 Uhr. Hygieneplan beachten.']
		], -300),
		c('k3', 'Kita Sonnenkäfer e. V.', 'interessent', 'Am Bach 3', '12345', 'Musterstadt', ['Tom Fiktiv', 'Leitung', 't.fiktiv@example.com', '0123 777100'], [
			['Kita-Gebäude', 'Am Bach 3', '12345', 'Musterstadt', '']
		], -40),
		c('k4', 'Steuerkanzlei Weber & Partner mbB', 'interessent', 'Schillerstraße 21', '12348', 'Neustadt', ['Jonas Weber', 'Partner', 'j.weber@example.com', '0123 882244'], [
			['Kanzleiräume', 'Schillerstraße 21', '12348', 'Neustadt', '']
		], -25),
		c('k5', 'Autohaus Nordring GmbH', 'interessent', 'Nordring 90', '12349', 'Neustadt', ['Lena Brandt', 'Assistenz der Geschäftsführung', 'l.brandt@example.com', '0123 431200'], [
			['Verkaufshalle & Werkstattbüros', 'Nordring 90', '12349', 'Neustadt', 'Grundreinigung vor Wiedereröffnung der Halle.']
		], -18),
		c('k6', 'Fitnessstudio Vitalis', 'interessent', 'Sportallee 5', '12350', 'Musterstadt', ['Marco Kern', 'Studioleiter', 'm.kern@example.com', '0123 990011'], [['Studio', 'Sportallee 5', '12350', 'Musterstadt', '']], -9),
		c('k7', 'Bäckerei Hartmann', 'inaktiv', 'Hauptstraße 18', '12345', 'Musterstadt', ['Gerda Hartmann', 'Inhaberin', 'g.hartmann@example.com', '0123 112233'], [['Backstube & Laden', 'Hauptstraße 18', '12345', 'Musterstadt', '']], -200),
		c('k8', 'Wohnungsbaugenossenschaft Am Park eG', 'aktiv', 'Parkallee 1', '12351', 'Beispieldorf', ['Nina Vogel', 'Hausbewirtschaftung', 'n.vogel@example.com', '0123 660660'], [
			['Parkallee 1–5', 'Parkallee 1', '12351', 'Beispieldorf', ''],
			['Parkallee 7–11', 'Parkallee 7', '12351', 'Beispieldorf', ''],
			['Tiefgarage', 'Parkallee 13', '12351', 'Beispieldorf', 'Nur Kehrmaschine, Zugang per Transponder.']
		], -520),
		c('k9', 'Notariat Keller', 'inaktiv', 'Domplatz 2', '12345', 'Musterstadt', ['Dr. Anja Keller', 'Notarin', 'a.keller@example.com', '0123 303030'], [['Kanzlei', 'Domplatz 2', '12345', 'Musterstadt', '']], -150),
		c('k10', 'Zahnarztpraxis Dr. Lang', 'interessent', 'Rosenweg 8', '12352', 'Neustadt', ['Dr. Peter Lang', 'Praxisinhaber', 'p.lang@example.com', '0123 454545'], [['Praxis', 'Rosenweg 8', '12352', 'Neustadt', '']], -6),
		c('k11', 'Logistikzentrum Süd GmbH', 'interessent', 'Industriering 40', '12360', 'Gewerbepark Süd', ['Henrik Auer', 'Facility Management', 'h.auer@example.com', '0123 700800'], [
			['Verwaltung', 'Industriering 40', '12360', 'Gewerbepark Süd', ''],
			['Halle 2 Sozialräume', 'Industriering 40', '12360', 'Gewerbepark Süd', '']
		], -14),
		c('k12', 'Hotel Zur Post', 'interessent', 'Poststraße 1', '12345', 'Musterstadt', ['Claudia Reuter', 'Hausdame', 'c.reuter@example.com', '0123 121212'], [['Hotel, 34 Zimmer', 'Poststraße 1', '12345', 'Musterstadt', '']], -4),
		c('k13', 'Kanzlei Schneider Rechtsanwälte', 'inaktiv', 'Bahnhofstraße 33', '12348', 'Neustadt', ['Ralf Schneider', 'Rechtsanwalt', 'r.schneider@example.com', '0123 818181'], [['Kanzlei', 'Bahnhofstraße 33', '12348', 'Neustadt', '']], -260),
		c('k14', 'Seniorenresidenz Abendrot', 'aktiv', 'Abendrotweg 9', '12353', 'Beispieldorf', ['Ute Lindner', 'Hauswirtschaftsleitung', 'u.lindner@example.com', '0123 242424'], [['Haupthaus', 'Abendrotweg 9', '12353', 'Beispieldorf', 'Hygienekonzept vorhanden, Einweisung erforderlich.']], -380)
	];

	const quotes: Quote[] = [
		q(15, 'k14', 'k14-s1', 'unterhaltsreinigung', 'angenommen', { monthlyCents: 398000, initialHourlyCents: 3400, items: OFFICE, sentAt: at(-370), followupOn: null, createdAt: at(-380), updatedAt: at(-362), calculationNote: 'Kalkulation: 96 Std./Monat × 41,46 € inkl. Sachkosten.' }),
		q(18, 'k7', 'k7-s1', 'sonderreinigung', 'abgelehnt', { hourlyCents: 3600, effortText: 'ca. 6–8 Stunden', items: items(['Einmalig', 'Backstube: Bodenreinigung mit Fettlöser'], ['Einmalig', 'Fliesen und Spritzschutz entfetten']), sentAt: at(-200), createdAt: at(-205), updatedAt: at(-190) }),
		q(21, 'k1', 'k1-s1', 'unterhaltsreinigung', 'angenommen', { monthlyCents: 148000, items: items(['2 x pro Woche', 'Treppenhaus saugen und wischen'], ['2 x pro Woche', 'Handläufe und Briefkästen abwischen'], ['1 x pro Monat', 'Kellerflure kehren und wischen'], ['Vierteljährlich', 'Fenster im Treppenhaus reinigen']), sentAt: at(-410), createdAt: at(-420), updatedAt: at(-400) }),
		q(24, 'k2', 'k2-s1', 'unterhaltsreinigung', 'angenommen', { monthlyCents: 175000, initialHourlyCents: 3500, items: OFFICE, sentAt: at(-290), createdAt: at(-300), updatedAt: at(-280), calculationNote: 'Praxisbereich mit Desinfektion, Aufschlag 6 %.' }),
		q(27, 'k3', 'k3-s1', 'unterhaltsreinigung', 'versendet', { monthlyCents: 89000, items: items(['5 x pro Woche', 'Gruppenräume: Böden feucht wischen'], ['5 x pro Woche', 'Sanitärbereich Kinder reinigen und desinfizieren'], ['1 x pro Woche', 'Spielzeugregale abwischen'], ['Vierteljährlich', 'Fenster reinigen']), sentAt: at(-12), followupOn: on(-2), createdAt: at(-14), updatedAt: at(-12) }),
		q(29, 'k4', 'k4-s1', 'unterhaltsreinigung', 'versendet', { monthlyCents: 64000, items: OFFICE.slice(0, 4), sentAt: at(-5), followupOn: on(3), createdAt: at(-7), updatedAt: at(-5) }),
		q(30, 'k5', 'k5-s1', 'sonderreinigung', 'versendet', { hourlyCents: 3800, effortText: 'ca. 14–18 Stunden', items: items(['Einmalig', 'Verkaufshalle: Böden maschinell reinigen'], ['Einmalig', 'Glasflächen und Rahmen reinigen'], ['Einmalig', 'Werkstattbüros: Grundreinigung']), sentAt: at(-4), followupOn: on(5), createdAt: at(-6), updatedAt: at(-4), calculationNote: 'Maschinenmiete 120 € nicht im Stundensatz enthalten.' }),
		q(31, 'k6', 'k6-s1', 'unterhaltsreinigung', 'entwurf', { monthlyCents: 112000, calcHours: 56, areaM2: 650, items: items(['5 x pro Woche', 'Trainingsfläche: Böden reinigen'], ['5 x pro Woche', 'Umkleiden und Duschen reinigen und desinfizieren'], ['1 x pro Woche', 'Geräte und Spiegel abwischen']), createdAt: at(-2), updatedAt: at(0, 8) }),
		q(32, 'k12', 'k12-s1', 'sonderreinigung', 'entwurf', { hourlyCents: 3700, effortText: '', items: [], createdAt: at(-1), updatedAt: at(-1, 15) }),
		q(33, 'k11', 'k11-s1', 'unterhaltsreinigung', 'versendet', { monthlyCents: 276000, initialHourlyCents: 3600, items: OFFICE, sentAt: at(-2), followupOn: on(9), createdAt: at(-9), updatedAt: at(-2) })
	];

	const E = (customerId: string, days: number, kind: Data['events'][number]['kind'], text: string, by = 'Anetta R.') => ({
		id: `e-${customerId}-${days}-${kind}`,
		customerId,
		at: at(days, 11),
		kind,
		text,
		by
	});
	const events: Data['events'] = [
		E('k1', -420, 'anfrage', 'Anfrage über Empfehlung. Treppenhausreinigung für zwei Objekte.'),
		E('k1', -410, 'angebot', 'Angebot A-2026-0021 versendet.'),
		E('k1', -400, 'auftrag', 'Angebot angenommen, Start zum nächsten Monatsersten.'),
		E('k1', -35, 'notiz', 'Hausmeister Herr Brandt hat neue Schlüssel übergeben.', 'Herr R.'),
		E('k2', -300, 'anfrage', 'Anfrage per Telefon, Praxisreinigung abends.'),
		E('k2', -295, 'besichtigung', 'Besichtigung vor Ort, Hygieneplan erhalten.', 'Herr R.'),
		E('k2', -290, 'angebot', 'Angebot A-2026-0024 versendet.'),
		E('k2', -280, 'auftrag', 'Auftrag erteilt.'),
		E('k2', -9, 'rechnung', 'Rechnung R-2026-0105 fällig, Zahlung ausstehend.'),
		E('k3', -40, 'anfrage', 'Kita sucht Reinigung ab Januar.'),
		E('k3', -30, 'besichtigung', 'Besichtigung mit Leitung. Gruppenräume 4, Turnraum.', 'Herr R.'),
		E('k3', -12, 'angebot', 'Angebot A-2026-0027 versendet, Wiedervorlage vereinbart.'),
		E('k4', -25, 'anfrage', 'Kanzlei fragt nach wöchentlicher Büroreinigung.'),
		E('k4', -5, 'angebot', 'Angebot A-2026-0029 versendet.'),
		E('k5', -18, 'anfrage', 'Grundreinigung vor Wiedereröffnung der Halle.'),
		E('k5', -10, 'besichtigung', 'Besichtigung, ca. 900 m² Hallenfläche.', 'Herr R.'),
		E('k5', -4, 'angebot', 'Angebot A-2026-0030 versendet.'),
		E('k6', -9, 'anfrage', 'Neueröffnung, Reinigung gewünscht.'),
		E('k7', -200, 'anfrage', 'Einmalige Grundreinigung der Backstube.'),
		E('k7', -190, 'angebot', 'Angebot A-2026-0018 abgelehnt, wird selbst gemacht.'),
		E('k8', -520, 'auftrag', 'Rahmenvertrag Treppenhäuser Parkallee.'),
		E('k11', -14, 'anfrage', 'Anfrage über Ausschreibung Facility Management.'),
		E('k11', -2, 'angebot', 'Angebot A-2026-0033 versendet.'),
		E('k12', -4, 'anfrage', 'Hotel möchte Frühjahrsputz für Gästezimmer.'),
		E('k14', -380, 'anfrage', 'Seniorenresidenz, Einweisung Hygienekonzept nötig.'),
		E('k14', -362, 'auftrag', 'Angebot A-2026-0015 angenommen.'),
		E('k14', -3, 'rechnung', 'Rechnung R-2026-0107 überfällig.', 'Herr R.')
	];

	const appointments: Data['appointments'] = [
		{ id: 'a1', at: at(0, 14), kind: 'besichtigung', customerId: 'k12', title: 'Besichtigung Hotel Zur Post', who: 'Herr R.' },
		{ id: 'a2', at: at(1, 10), kind: 'besichtigung', customerId: 'k6', title: 'Besichtigung Studio', who: 'Anetta R.' },
		{ id: 'a3', at: at(3, 6), kind: 'start', customerId: 'k8', title: 'Wohnanlage Parkallee: Tiefgarage', who: 'Team Süd' },
		{ id: 'a4', at: at(5, 9, 30), kind: 'besichtigung', customerId: 'k11', title: 'Besichtigung Halle 2', who: 'Herr R.' },
		{ id: 'a5', at: at(6, 18), kind: 'start', customerId: 'k2', title: 'Praxis: Grundreinigung Quartal', who: 'Team Mitte' }
	];

	const invoices: Data['invoices'] = [
		{ id: 'r1', number: 'R-2026-0098', customerId: 'k1', netCents: 148000, issuedOn: on(-62), dueOn: on(-48), paidAt: at(-50), period: null, quoteId: null, remindCount: 0, remindedAt: null },
		{ id: 'r2', number: 'R-2026-0105', customerId: 'k2', netCents: 175000, issuedOn: on(-23), dueOn: on(-9), paidAt: null, period: null, quoteId: null, remindCount: 0, remindedAt: null },
		{ id: 'r3', number: 'R-2026-0107', customerId: 'k14', netCents: 398000, issuedOn: on(-17), dueOn: on(-3), paidAt: null, period: null, quoteId: null, remindCount: 0, remindedAt: null },
		{ id: 'r4', number: 'R-2026-0110', customerId: 'k1', netCents: 148000, issuedOn: on(-4), dueOn: on(10), paidAt: null, period: null, quoteId: null, remindCount: 0, remindedAt: null },
		{ id: 'r5', number: 'R-2026-0111', customerId: 'k8', netCents: 524000, issuedOn: on(-2), dueOn: on(12), paidAt: null, period: null, quoteId: null, remindCount: 0, remindedAt: null }
	];

	// ── Verträge (aus angenommenen Unterhaltsreinigungen) ──
	const contract = (id: string, startDays: number, term = 12, notice = 3) => {
		const q = quotes.find((x) => x.id === id)!;
		q.contract = { startOn: on(startDays), termMonths: term, noticeMonths: notice, autoRenew: true };
	};
	contract('q15', -360, 24, 3);
	contract('q21', -400, 12, 3);
	contract('q24', -270, 12, 6);

	// ── Team ──
	const emp = (id: string, name: string, role: string, ct: 'vollzeit' | 'teilzeit' | 'minijob', h: number, phone: string, instructed: number | null) => ({ id, name, role, contract: ct, weeklyHours: h, phone, instructedOn: instructed === null ? null : on(instructed) });
	const employees: Data['employees'] = [
		emp('m1', 'Maria Kowalski', 'Objektleitung', 'vollzeit', 40, '0123 800101', -120),
		emp('m2', 'Jana Petrov', 'Reinigungskraft', 'teilzeit', 25, '0123 800102', -340),
		emp('m3', 'Sven Lorenz', 'Reinigungskraft', 'teilzeit', 20, '0123 800103', -400),
		emp('m4', 'Aylin Demir', 'Reinigungskraft', 'minijob', 10, '0123 800104', -60),
		emp('m5', 'Tomasz Nowak', 'Reinigungskraft', 'minijob', 10, '0123 800105', -200),
		emp('m6', 'Fatma Yıldız', 'Reinigungskraft', 'teilzeit', 30, '0123 800106', -30),
		emp('m7', 'Lukas Brandt', 'Springer', 'vollzeit', 40, '0123 800107', null),
		emp('m8', 'Olga Sidorova', 'Reinigungskraft', 'teilzeit', 20, '0123 800108', -310)
	];

	// ── Erweiterung auf 12 Personen: vier weitere Mitarbeitende und zusätzliche Objekte aktiver Kunden ──
	if (team === 12) {
		employees.push(
			emp('m9', 'Marek Horvat', 'Objektleitung', 'vollzeit', 40, '0123 800109', -90),
			emp('m10', 'Dilara Kaya', 'Reinigungskraft', 'teilzeit', 25, '0123 800110', -250),
			emp('m11', 'Piotr Zielinski', 'Reinigungskraft', 'vollzeit', 38, '0123 800111', -150),
			emp('m12', 'Ioana Popescu', 'Reinigungskraft', 'minijob', 10, '0123 800112', -45)
		);
		const extra: [string, string, string, string, string, string][] = [
			['k1', 'k1-s3', 'Tiefgarage und Keller', 'Lindenweg 4', '12345', 'Musterstadt'],
			['k2', 'k2-s2', 'Praxis 2. OG', 'Marktplatz 7', '12347', 'Beispieldorf'],
			['k8', 'k8-s4', 'Werkstatt und Lager', 'Parkallee 7', '12349', 'Musterstadt'],
			['k14', 'k14-s2', 'Nebengebäude', 'Lindenweg 6', '12345', 'Musterstadt']
		];
		for (const [cid, sid, name, street, postal, city] of extra) {
			const cu = customers.find((x) => x.id === cid);
			if (cu && !cu.sites.some((s) => s.id === sid)) cu.sites.push({ id: sid, name, street, postal, city, note: '', plan: null as SitePlan | null, lat: demoCoords(city, sid)[0], lon: demoCoords(city, sid)[1] });
		}
	}

	// ── Reinigungspläne der Objekte (Tage: 0 = Montag) ──
	const plans: Record<string, SitePlan> = {
		'k1-s1': { days: [0, 3], start: '17:00', hours: 2, staffIds: ['m2'], areaM2: 420 },
		'k1-s2': { days: [1, 4], start: '16:30', hours: 2.5, staffIds: ['m3', 'm7'], areaM2: 610 },
		'k2-s1': { days: [0, 1, 2, 3, 4], start: '19:00', hours: 2, staffIds: ['m4', 'm5'], areaM2: 380 },
		'k8-s1': { days: [0, 2, 4], start: '06:00', hours: 3, staffIds: ['m6', 'm7'], areaM2: 900 },
		'k8-s2': { days: [1, 3], start: '06:00', hours: 3, staffIds: ['m6', 'm7'], areaM2: 820 },
		'k8-s3': { days: [2], start: '09:30', hours: 1.5, staffIds: ['m7'], areaM2: 1400 },
		'k14-s1': { days: [0, 1, 2, 3, 4], start: '06:30', hours: 4, staffIds: ['m1', 'm8'], areaM2: 1850 }
	};
	if (team === 12) {
		plans['k1-s3'] = { days: [2, 4], start: '18:00', hours: 1.5, staffIds: ['m10'], areaM2: 300 };
		plans['k2-s2'] = { days: [0, 1, 2, 3, 4], start: '20:30', hours: 1.5, staffIds: ['m12'], areaM2: 260 };
		plans['k8-s4'] = { days: [0, 1, 2, 3, 4], start: '14:00', hours: 3, staffIds: ['m11', 'm10'], areaM2: 1100 };
		plans['k14-s2'] = { days: [0, 1, 2, 3, 4], start: '06:30', hours: 3, staffIds: ['m9', 'm11'], areaM2: 700 };
	}
	for (const c of customers) for (const s of c.sites) if (plans[s.id]) s.plan = plans[s.id];

	// ── Abwesenheiten ──
	const absences: Data['absences'] = [
		{ id: 'ab1', employeeId: 'm2', from: on(0), to: on(2), kind: 'krank', status: 'genehmigt' },
		{ id: 'ab2', employeeId: 'm6', from: on(8), to: on(14), kind: 'urlaub', status: 'genehmigt' },
		{ id: 'ab3', employeeId: 'm3', from: on(-16), to: on(-14), kind: 'urlaub', status: 'genehmigt' },
		{ id: 'ab4', employeeId: 'm4', from: on(20), to: on(24), kind: 'urlaub', status: 'beantragt' },
		{ id: 'ab5', employeeId: 'm8', from: on(12), to: on(13), kind: 'urlaub', status: 'beantragt' },
		...(team === 12 ? [
			{ id: 'ab6', employeeId: 'm11', from: on(3), to: on(4), kind: 'krank' as const, status: 'genehmigt' as const },
			{ id: 'ab7', employeeId: 'm10', from: on(15), to: on(21), kind: 'urlaub' as const, status: 'beantragt' as const }
		] : [])
	];

	// ── Zeitbuchungen der letzten 24 Tage aus den Plänen (einzelne Ausfälle und Abweichungen als Demo) ──
	const timeEntries: Data['timeEntries'] = [];
	let n = 0;
	for (let d = -63; d <= -1; d++) {
		const date = on(d);
		for (const c of customers) {
			for (const s of c.sites) {
				const p = s.plan;
				if (!p || !p.days.includes(weekday(date))) continue;
				for (const staff of p.staffIds) {
					n++;
					const absent = absences.some((a) => a.employeeId === staff && a.from <= date && date <= a.to);
					if (absent || n % 13 === 0) continue;
					const extra = n % 7 === 0 ? 0.5 : 0;
					const start = toMinutes(p.start);
					timeEntries.push({
						id: `t${n}`, employeeId: staff, siteId: s.id, date, start: p.start,
						end: fromMinutes(start + Math.round((p.hours + extra) * 60)), breakMin: 0,
						note: extra ? 'Zusätzliche Fensterreinigung' : '', createdAt: at(d, 20), editedAt: null, source: n % 6 === 0 ? 'papier' : 'app', voided: false, history: []
					});
				}
			}
		}
	}

	// ── Mängel ──
	const D = (id: string, customerId: string, siteId: string | null, title: string, description: string, status: Defect['status'], severity: Defect['severity'], reported: number, due: number, closed: number | null = null): Defect => ({
		id, customerId, siteId, title, description, status, severity, reportedOn: on(reported), dueOn: on(due), closedOn: closed === null ? null : on(closed), recheck: id !== 'd4', source: id === 'd2' ? 'kunde' : 'intern'
	});
	const defects: Defect[] = [
		D('d1', 'k2', 'k2-s1', 'Streifen auf dem Boden im Wartezimmer', 'Praxismanagerin meldet Wischstreifen, Boden wirkt klebrig. Reinigungsmittel und Dosierung prüfen.', 'offen', 'hoch', -4, -1),
		D('d2', 'k1', 'k1-s1', 'Briefkästen nicht abgewischt', 'Mehrfach vom Hausmeister bemängelt (zweite Meldung in 4 Wochen).', 'in_bearbeitung', 'normal', -6, 1),
		D('d3', 'k8', 'k8-s3', 'Tiefgarage: Kehrung ausgefallen', 'Sensor/Transponder defekt, Zugang am Dienstag nicht möglich.', 'offen', 'normal', -1, 2),
		D('d4', 'k14', 'k14-s1', 'Handläufe staubig', 'Hauswirtschaftsleitung bemerkt Staub auf den Handläufen im 1. OG.', 'erledigt', 'normal', -20, -17, -18),
		D('d5', 'k14', 'k14-s1', 'Reinigungsmittel im Gemeinschaftsraum vergessen', 'Flasche nicht verschlossen weggestellt. Unterweisung nachholen.', 'in_bearbeitung', 'hoch', -2, 0)
	];

	for (const inv of invoices) {
		inv.period = inv.issuedOn.slice(0, 7);
		inv.quoteId = quotes.find((q) => q.customerId === inv.customerId && q.status === 'angenommen' && q.contract)?.id ?? null;
	}

	// ── Begehungen und Schlüssel ──
	const labels = ['Böden', 'Sanitärräume', 'Oberflächen und Möbel', 'Müllentsorgung', 'Glas und Fenster', 'Spender und Verbrauchsmaterial'];
	const ins = (id: string, siteId: string, days: number, bad: number[], note = ''): Data['inspections'][number] => ({
		id, siteId, date: on(days), inspector: days % 2 ? 'Herr R.' : 'Anetta R.', note, shared: bad.length === 0 || days < -30,
		items: labels.map((label, i) => ({ id: `${id}-${i}`, label, rating: bad.includes(i) ? 'mangel' : 'ok', note: bad.includes(i) ? 'Nachbesserung nötig' : '' }))
	});
	const inspections: Data['inspections'] = [
		ins('b1', 'k2-s1', -46, [1]), ins('b2', 'k2-s1', -16, [], 'Sehr sauber, Praxismanagerin zufrieden.'),
		ins('b3', 'k14-s1', -40, [2, 4]), ins('b4', 'k14-s1', -12, [4]),
		ins('b5', 'k1-s1', -33, [3]), ins('b6', 'k1-s1', -5, [3, 0], 'Briefkästen erneut beanstandet.'),
		ins('b7', 'k8-s1', -21, [])
	];
	const key = (id: string, siteId: string, label: string, kind: 'schluessel' | 'transponder', holderId: string | null, status: 'im_buero' | 'ausgegeben' | 'verloren' = holderId ? 'ausgegeben' : 'im_buero'): Data['keys'][number] => ({
		id, siteId, label, kind, holderId, status, log: [{ at: at(-300), action: 'Angelegt', by: 'Anetta R.' }, ...(holderId ? [{ at: at(-120), action: 'Ausgegeben', by: 'Anetta R.' }] : [])]
	});
	const keys: Data['keys'] = [
		key('s1', 'k1-s1', 'Haustür Lindenweg 4', 'schluessel', 'm2'),
		key('s2', 'k1-s2', 'Eingang Gartenstraße 12', 'schluessel', 'm3'),
		key('s3', 'k2-s1', 'Praxis-Transponder', 'transponder', 'm4'),
		key('s4', 'k2-s1', 'Praxis-Transponder (Reserve)', 'transponder', null),
		key('s5', 'k8-s3', 'Tiefgarage-Transponder', 'transponder', 'm7'),
		key('s6', 'k14-s1', 'Haupthaus Personaleingang', 'schluessel', 'm1')
	];

	const tasks: Data['tasks'] = [
		{ id: 'a1', title: 'Angebot Kita Sonnenkäfer telefonisch nachfassen', dueOn: on(-2), customerId: 'k3', done: false },
		{ id: 'a2', title: 'Transponder Tiefgarage beim Kunden reklamieren', dueOn: on(1), customerId: 'k8', done: false },
		{ id: 'a3', title: 'Preisanpassungsschreiben für Praxis vorbereiten', dueOn: on(10), customerId: 'k2', done: false },
		{ id: 'a4', title: 'Unterweisung für Lukas Brandt terminieren', dueOn: on(3), customerId: null, done: false },
		{ id: 'a5', title: 'Besichtigungstermin Hotel Zur Post vorbereiten', dueOn: on(0), customerId: 'k12', done: true }
	];
	const docs: Data['docs'] = [
		{ id: 'n1', kind: 'versicherung', title: 'Betriebshaftpflicht', ownerType: 'betrieb', owner: 'Gebäude-Reinigung', validUntil: on(200), note: 'Deckungssumme und Schlüsselverlust-Baustein prüfen' },
		{ id: 'n2', kind: 'unbedenklichkeit', title: 'Unbedenklichkeitsbescheinigung Finanzamt', ownerType: 'betrieb', owner: 'Gebäude-Reinigung', validUntil: on(25), note: '' },
		{ id: 'n3', kind: 'versicherung', title: 'Betriebshaftpflicht', ownerType: 'subunternehmer', owner: 'Glas und Fassade Müller GmbH', validUntil: on(-10), note: 'Neuen Nachweis anfordern' },
		{ id: 'n4', kind: 'freistellung', title: 'Freistellungsbescheinigung § 48b EStG', ownerType: 'subunternehmer', owner: 'Glas und Fassade Müller GmbH', validUntil: on(300), note: '' },
		{ id: 'n5', kind: 'versicherung', title: 'Betriebshaftpflicht', ownerType: 'subunternehmer', owner: 'Teppichpflege Schmidt', validUntil: on(90), note: '' }
	];
	const material: Data['material'] = [
		{ id: 'p1', name: 'Allzweckreiniger', kind: 'verbrauch', stock: 18, min: 20, unit: 'Liter', hazardous: false, nextCheckOn: null },
		{ id: 'p2', name: 'Sanitärreiniger (sauer)', kind: 'verbrauch', stock: 12, min: 10, unit: 'Liter', hazardous: true, nextCheckOn: null },
		{ id: 'p3', name: 'Flächendesinfektion', kind: 'verbrauch', stock: 6, min: 8, unit: 'Liter', hazardous: true, nextCheckOn: null },
		{ id: 'p4', name: 'Mikrofasertücher', kind: 'verbrauch', stock: 140, min: 100, unit: 'Stück', hazardous: false, nextCheckOn: null },
		{ id: 'p5', name: 'Einscheibenmaschine Nr. 1', kind: 'geraet', stock: 1, min: 1, unit: 'Stück', hazardous: false, nextCheckOn: on(14) },
		{ id: 'p6', name: 'Nass-/Trockensauger Nr. 2', kind: 'geraet', stock: 1, min: 1, unit: 'Stück', hazardous: false, nextCheckOn: on(-5) },
		{ id: 'p7', name: 'Scheuersaugmaschine', kind: 'geraet', stock: 1, min: 1, unit: 'Stück', hazardous: false, nextCheckOn: on(120) }
	];

	// ── Vorgänge (Ablauf einer Anfrage bis zur Projektzeitliste) ──
	let cn = 0;
	const cs = (customerId: string, siteId: string | null, title: string, ago: number, p: Partial<Case>): Case => ({
		id: `v${++cn}`, number: `V-2026-${String(cn).padStart(3, '0')}`, customerId, siteId, title, assignee: cn % 2 ? 'Anetta R.' : 'Herr R.',
		createdAt: at(-ago), decision: 'accepted', declineNotedAt: null, dataConfirmed: true,
		visitNeeded: null, visitApptId: null, visitDoneAt: null, visitNote: '',
		quoteRequired: null, quoteId: null, manualNetCents: null,
		startAt: null, startApptId: null, executionDoneAt: null,
		checklist: defaultChecklist(), complaintNote: '', timesheetAt: null,
		log: [{ at: at(-ago), text: 'Anfrage erfasst.' }], ...p
	});
	const cases: Case[] = [
		cs('k3', 'k3-s1', 'Unterhaltsreinigung Kita-Gebäude', 40, { visitNeeded: true, visitDoneAt: at(-30), visitNote: 'Gruppenräume 4, Turnraum, Küche.', quoteRequired: true, quoteId: 'q27' }),
		cs('k6', 'k6-s1', 'Unterhaltsreinigung Fitnessstudio', 9, { visitNeeded: true, visitDoneAt: at(-3), quoteRequired: true, quoteId: 'q31' }),
		cs('k12', 'k12-s1', 'Frühjahrsputz Gästezimmer', 4, { visitNeeded: true, visitApptId: 'a1' }),
		cs('k11', 'k11-s1', 'Verwaltung und Sozialräume Halle 2', 14, { visitNeeded: true, visitDoneAt: at(-8), quoteRequired: true, quoteId: 'q33' }),
		cs('k5', 'k5-s1', 'Grundreinigung Verkaufshalle', 18, { visitNeeded: true, visitDoneAt: at(-10), quoteRequired: true, quoteId: 'q30' }),
		cs('k10', 'k10-s1', 'Praxisreinigung Zahnarzt', 1, { decision: null, dataConfirmed: false }),
		cs('k8', 'k8-s3', 'Grundreinigung Tiefgarage', 6, { visitNeeded: false, quoteRequired: false, manualNetCents: 62000, startAt: at(3, 6), startApptId: 'a3' }),
		cs('k7', 'k7-s1', 'Grundreinigung Backstube', 205, { visitNeeded: false, quoteRequired: true, quoteId: 'q18' }),
		cs('k14', 'k14-s1', 'Unterhaltsreinigung Haupthaus', 380, { visitNeeded: true, visitDoneAt: at(-376), quoteRequired: true, quoteId: 'q15', startAt: at(-360), executionDoneAt: at(-359), checklist: defaultChecklist().map((x) => ({ ...x, done: true })), timesheetAt: at(-358) }),
		cs('k9', 'k9-s1', 'Büroreinigung Notariat', 160, { decision: 'declined', declineNotedAt: at(-158), dataConfirmed: false })
	];

	return { company: { ...defaultCompany }, cases, tasks, docs, material, lockedMonths: [on(-45).slice(0, 7)], inspections, keys, customers, quotes, events, appointments, invoices, employees, absences, covers: [], timeEntries, defects, calc: { ...defaultCalc } };
}
