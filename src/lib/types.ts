export type CustomerStatus = 'interessent' | 'aktiv' | 'inaktiv';
export type QuoteKind = 'sonderreinigung' | 'unterhaltsreinigung';
export type QuoteStatus = 'entwurf' | 'versendet' | 'angenommen' | 'abgelehnt';

export interface Contact {
	id: string;
	name: string;
	role: string;
	email: string;
	phone: string;
}
/** Reinigungsplan eines Objekts: Wochentage (0 = Montag), Beginn, Stunden je Einsatz, Stammbesetzung. */
export type LvInterval = 'taeglich' | 'woechentlich' | 'zweiwoechentlich' | 'monatlich' | 'quartal' | 'halbjahr' | 'jaehrlich' | 'bedarf';
/** Eine Leistung im Leistungsverzeichnis: was, wo, wie oft */
export interface LvItem {
	id: string;
	room: string;
	task: string;
	interval: LvInterval;
	areaM2: number | null;
	note: string;
}
/** Stand des Leistungsverzeichnisses ab einem Datum. Ältere Stände bleiben für Nachweise und Streitfälle erhalten. */
export interface LvVersion {
	id: string;
	validFrom: string;
	note: string;
	createdAt: string;
	createdBy: string;
	items: LvItem[];
}
export interface SitePlan {
	days: number[];
	start: string;
	hours: number;
	staffIds: string[];
	areaM2: number | null;
}
export interface Site {
	id: string;
	name: string;
	street: string;
	postal: string;
	city: string;
	note: string;
	/** Objektdossier: eingesetzte Reinigungsmittel und Verfahren (Chemie), damit Vertretungen richtig arbeiten */
	chemicals?: string;
	/** Geheimer Schlüssel im Stempel-QR-Code des Objekts (nur Verwaltung sieht ihn, Mitarbeitende nur über den gedruckten Code) */
	stampToken?: string;
	plan: SitePlan | null;
	/** Leistungsverzeichnis in Versionen mit Gültigkeitsdatum (neueste zuletzt) */
	lv?: LvVersion[];
	/** Position für die Karte (WGS84). Ohne Backend von Hand oder per Klick auf der Karte gesetzt. */
	lat?: number | null;
	lon?: number | null;
}
export interface Customer {
	id: string;
	name: string;
	/** Leitweg-ID bzw. Käuferreferenz für die XRechnung (Pflicht bei der öffentlichen Hand) */
	buyerRef?: string;
	/** Eigenes Debitorenkonto für den Buchungsexport */
	debtorNo?: string;
	status: CustomerStatus;
	street: string;
	postal: string;
	city: string;
	contacts: Contact[];
	sites: Site[];
	createdAt: string;
}
export interface QuoteItem {
	id: string;
	text: string;
	frequency: string;
	/** Option: nicht im Preis enthalten, mit Aufpreis (Cent pro Monat bzw. Stunde) */
	optional?: boolean;
	extraCents?: number | null;
}
export interface Contract {
	/** YYYY-MM-DD */
	startOn: string;
	termMonths: number;
	noticeMonths: number;
	autoRenew: boolean;
}
export interface Quote {
	id: string;
	number: string;
	version: number;
	customerId: string;
	siteId: string | null;
	kind: QuoteKind;
	status: QuoteStatus;
	/** Cents */
	hourlyCents: number | null;
	effortText: string;
	monthlyCents: number | null;
	initialHourlyCents: number | null;
	/** kalkulierte Stunden pro Monat und Fläche (aus dem Kalkulator), Grundlage der Live-Marge */
	calcHours?: number | null;
	areaM2?: number | null;
	items: QuoteItem[];
	/** Intern, erscheint nie im PDF */
	calculationNote: string;
	sentAt: string | null;
	/** YYYY-MM-DD */
	followupOn: string | null;
	contract: Contract | null;
	createdAt: string;
	updatedAt: string;
}
export interface ActivityEvent {
	id: string;
	customerId: string;
	at: string;
	kind: 'notiz' | 'anfrage' | 'besichtigung' | 'angebot' | 'auftrag' | 'rechnung';
	text: string;
	by: string;
}
export interface Appointment {
	id: string;
	at: string;
	kind: 'besichtigung' | 'start';
	customerId: string;
	title: string;
	who: string;
}
export interface Invoice {
	id: string;
	number: string;
	customerId: string;
	netCents: number;
	issuedOn: string;
	dueOn: string;
	paidAt: string | null;
	/** Abrechnungsmonat YYYY-MM (Pauschalrechnung) */
	period: string | null;
	quoteId: string | null;
	/** 0 = keine Mahnung, 1 = Zahlungserinnerung, 2 = Mahnung */
	remindCount: number;
	remindedAt: string | null;
	/** Storno statt Überschreiben: Nummer der Stornorechnung bzw. der stornierten Rechnung */
	cancelledBy?: string;
	stornoOf?: string;
	/** Freitext für Rechnungen, die nicht die Monatspauschale sind (zum Beispiel Zusatzleistungen), je Zeile eine Position */
	description?: string;
	/** abgerechnete Zusatzleistungen */
	extraIds?: string[];
}
export type ContractType = 'vollzeit' | 'teilzeit' | 'minijob';
export interface Employee {
	id: string;
	name: string;
	role: string;
	contract: ContractType;
	weeklyHours: number;
	phone: string;
	/** letzte dokumentierte Unterweisung (Gefahrstoffe, Arbeitsschutz), mindestens jährlich */
	instructedOn: string | null;
}
export interface Absence {
	id: string;
	employeeId: string;
	from: string;
	to: string;
	kind: 'urlaub' | 'krank';
	/** Urlaub wird beantragt und freigegeben, Krankheit direkt eingetragen */
	status: 'beantragt' | 'genehmigt';
}
/** Vertretung für einen einzelnen Einsatz (Objekt + Tag). */
export interface Cover {
	id: string;
	siteId: string;
	date: string;
	employeeId: string;
	/** Bei einem Schichttausch: die Person aus der Stammbesetzung, die an diesem Tag ersetzt wird (sie ist dann nicht eingeplant) */
	replacesId?: string;
	/** Herkunft: ID des genehmigten Tauschs */
	swapId?: string;
}
export interface TimeEntry {
	id: string;
	employeeId: string;
	siteId: string;
	date: string;
	start: string;
	end: string;
	breakMin: number;
	note: string;
	createdAt: string;
	editedAt: string | null;
	/** Herkunft der Buchung: Büro-Nacherfassung, Papier-Stundenzettel oder Mitarbeiter-App */
	source: 'app' | 'papier' | 'buero';
	/** Zeitart: Arbeit am Objekt (Standard), Wegezeit zwischen Objekten oder Rüstzeit. Alle drei zählen als bezahlte Arbeitszeit. */
	kind?: 'arbeit' | 'weg' | 'ruest';
	/** ungültig statt gelöscht: bleibt sichtbar, zählt aber nicht */
	voided: boolean;
	/** Änderungsprotokoll */
	history: string[];
}
/** Antrag einer Person, eine eigene Zeitbuchung zu korrigieren. Gebucht wird erst nach Freigabe durch das Büro. */
export interface TimeCorrection {
	id: string;
	employeeId: string;
	/** Zeitbuchung, auf die sich der Antrag bezieht */
	entryId: string;
	date: string;
	old: { start: string; end: string; breakMin: number };
	proposed: { start: string; end: string; breakMin: number };
	reason: string;
	status: 'offen' | 'genehmigt' | 'abgelehnt';
	/** Antwort des Büros (bei Ablehnung Pflicht) */
	reply: string;
	createdAt: string;
	decidedOn: string | null;
}
/**
 * Leistungsnachweis je Einsatz (Objekt + Tag) mit drei getrennten Zuständen:
 * Anwesenheit (aus den Zeitbuchungen abgeleitet), Ausführung (nach Leistungsverzeichnis) und Abnahme (durch den Kunden).
 */
export interface ServiceRecord {
	id: string;
	siteId: string;
	date: string;
	execution: 'offen' | 'vollstaendig' | 'teilweise' | 'nicht';
	/** bei „teilweise“: nicht erbrachte Leistungen aus dem Verzeichnis */
	missedItemIds: string[];
	executionNote: string;
	/** Stand des Verzeichnisses, nach dem geprüft wurde */
	lvVersionId: string | null;
	acceptance: 'offen' | 'abgenommen' | 'beanstandet';
	acceptedBy: string;
	acceptedOn: string | null;
	acceptNote: string;
	/** aus einer Beanstandung entstandener Mangel */
	defectId?: string;
	history: string[];
}
/** Zusatzleistung außerhalb der Pauschale: vom Wunsch bis zur Rechnung nachverfolgt, damit nichts unbezahlt bleibt. */
export type ExtraStatus = 'angefragt' | 'beauftragt' | 'ausgefuehrt' | 'abgerechnet' | 'abgelehnt';
export interface ExtraService {
	id: string;
	customerId: string;
	siteId: string | null;
	title: string;
	description: string;
	date: string;
	qty: number;
	unit: 'Std.' | 'Stk.' | 'pauschal';
	unitCents: number;
	status: ExtraStatus;
	/** wer beim Kunden die Leistung angefragt bzw. beauftragt hat */
	orderedBy: string;
	orderedOn: string | null;
	executedOn: string | null;
	invoiceId: string | null;
	createdAt: string;
	history: string[];
}
export type DefectStatus = 'offen' | 'in_bearbeitung' | 'erledigt';
export interface Defect {
	id: string;
	customerId: string;
	siteId: string | null;
	title: string;
	description: string;
	status: DefectStatus;
	severity: 'normal' | 'hoch';
	reportedOn: string;
	dueOn: string;
	closedOn: string | null;
	/** Tag der ersten Reaktion (Status weg von „offen“), für die Reaktionszeit */
	respondedOn?: string | null;
	/** nach der Behebung automatisch eine Nachkontrolle als Aufgabe anlegen */
	recheck: boolean;
	source: 'intern' | 'begehung' | 'kunde' | 'mitarbeiter';
	/** Foto aus der Mitarbeiter-Meldung (Eingang-ID, nur für die Verwaltung abrufbar) */
	photoId?: string;
}
/** Annahmen der Kalkulation, alle in Prozent bzw. Cent; vom Betrieb anpassbar. */
export interface CalcSettings {
	wageCents: number;
	lnkPct: number;
	productivePct: number;
	materialPct: number;
	machinePct: number;
	overheadPct: number;
	profitPct: number;
}
export interface InspectionItem {
	id: string;
	label: string;
	rating: 'ok' | 'mangel' | 'na';
	note: string;
}
/** Begehung/Qualitätskontrolle je Objekt (bewusst nicht je Person ausgewertet). */
export interface Inspection {
	id: string;
	siteId: string;
	date: string;
	inspector: string;
	items: InspectionItem[];
	note: string;
	/** im Kundenportal sichtbar */
	shared: boolean;
}
export interface KeyLogEntry {
	at: string;
	action: string;
	by: string;
}
/** Schlüsselregister. Alarmcodes werden bewusst nicht gespeichert. */
export interface KeyItem {
	id: string;
	siteId: string;
	label: string;
	kind: 'schluessel' | 'transponder';
	holderId: string | null;
	status: 'im_buero' | 'ausgegeben' | 'verloren';
	log: KeyLogEntry[];
}
export interface Task {
	id: string;
	title: string;
	dueOn: string | null;
	customerId: string | null;
	done: boolean;
	/** Arbeitsstand für das Board; ohne Angabe = zu erledigen */
	status?: 'doing' | 'waiting';
	/** Tag, an dem die Aufgabe erledigt wurde (für das Tagesziel) */
	doneOn?: string | null;
}
/** Nachweis mit Ablaufdatum (Versicherung, Bescheinigungen). Es werden nur Metadaten gespeichert, keine Dateien. */
export interface DocItem {
	id: string;
	kind: 'versicherung' | 'unbedenklichkeit' | 'freistellung' | 'sonstiges';
	title: string;
	ownerType: 'betrieb' | 'subunternehmer';
	owner: string;
	validUntil: string | null;
	note: string;
}
export interface MaterialItem {
	id: string;
	name: string;
	kind: 'verbrauch' | 'geraet';
	stock: number;
	min: number;
	unit: string;
	hazardous: boolean;
	/** nächste Prüfung, z. B. DGUV V3 bei elektrischen Geräten */
	nextCheckOn: string | null;
}
/** Vorgang = der Ablauf einer Kundenanfrage bis zur Projektzeitliste (Anfrage → Daten → Besichtigung → Angebot → Rückmeldung → Start → Ausführung → Projektzeitliste). */
export interface Case {
	id: string;
	number: string;
	customerId: string;
	siteId: string | null;
	title: string;
	assignee: string;
	createdAt: string;
	/** Anfrage angenommen? null = noch offen */
	decision: 'accepted' | 'declined' | null;
	/** Absage dem Kunden mitgeteilt (nur vermerkt) */
	declineNotedAt: string | null;
	dataConfirmed: boolean;
	visitNeeded: boolean | null;
	visitApptId: string | null;
	visitDoneAt: string | null;
	visitNote: string;
	quoteRequired: boolean | null;
	quoteId: string | null;
	/** Auftragswert ohne Angebot (Cent, netto) */
	manualNetCents: number | null;
	startAt: string | null;
	startApptId: string | null;
	executionDoneAt: string | null;
	checklist: { label: string; done: boolean }[];
	complaintNote: string;
	timesheetAt: string | null;
	log: { at: string; text: string }[];
}
export interface Data {
	/** Betriebsweite Einstellungen */
	settings?: {
		/** Einstempeln nur per QR-Code am Objekt */
		requireQr?: boolean;
		/** Standort-Abgleich beim Ein- und Ausstempeln (nur Plausibilitätshinweis, nie Sperre) */
		geo?: boolean;
		/** Radius um das Objekt in Metern (Standard 150) */
		geoRadius?: number;
		/** Der Bestand besteht aus erfundenen Demodaten (steuert den Hinweis in der Kopfleiste) */
		demo?: boolean;
	};
	/** Gewähltes Profilfoto je Person (Name → Foto-Kürzel, siehe photos.ts) */
	avatars?: Record<string, string>;
	/** Absenderdaten des Betriebs für alle Dokumente (PDF) */
	company: import('./company').Company;
	cases: Case[];
	tasks: Task[];
	docs: DocItem[];
	material: MaterialItem[];
	/** abgeschlossene Monate (YYYY-MM), Zeitbuchungen sind dort gesperrt */
	lockedMonths: string[];
	/** Korrekturanträge der Mitarbeitenden */
	corrections?: TimeCorrection[];
	/** Leistungsnachweise je Einsatz */
	serviceRecords?: ServiceRecord[];
	/** Zusatzleistungen bis zur Rechnung */
	extras?: ExtraService[];
	/** Protokoll der Monatsabschlüsse: Abschluss, Entsperren mit Grund, Lohnexport */
	monthLog?: { month: string; kind: 'abgeschlossen' | 'entsperrt' | 'lohnexport'; at: string; by: string; note: string }[];
	inspections: Inspection[];
	keys: KeyItem[];
	employees: Employee[];
	absences: Absence[];
	covers: Cover[];
	timeEntries: TimeEntry[];
	defects: Defect[];
	calc: CalcSettings;
	customers: Customer[];
	quotes: Quote[];
	events: ActivityEvent[];
	appointments: Appointment[];
	invoices: Invoice[];
}
