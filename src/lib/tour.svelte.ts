/** Begrüßungs-Rundgang: Zustand (offen, Schritt) und Inhalt. Pro Person wird gemerkt, ob er schon gezeigt wurde (nur in diesem Browser). */
import { Building2, CalendarDays, FileText, Gauge, LayoutDashboard, Smartphone, Users } from '@lucide/svelte';

export interface TourStep { icon: typeof Gauge; title: string; lines: string[]; href?: string; cta?: string }

export const steps: TourStep[] = [
	{ icon: LayoutDashboard, title: 'Willkommen: Ihr Tag auf einen Blick', lines: ['„Heute“ zeigt, was jetzt wichtig ist: Einsätze des Tages, Dringendes, Aufgaben und Termine.', 'Die Ringe oben sind Ihr Cockpit: Marge, Besetzung, Zahlungsmoral, Plan-Treue und Tagesziel.', 'Mit ⌘K (oder Strg+K) finden Sie jeden Kunden, jedes Angebot und jede Seite.'], href: '/', cta: 'Zu „Heute“' },
	{ icon: Building2, title: '1. Firmendaten eintragen', lines: ['Name, Adresse, USt-ID und Bankverbindung stehen später auf jedem Angebot, jeder Rechnung und in der E-Rechnung.', 'Solange hier Platzhalter stehen, sind PDFs und E-Rechnungen nicht brauchbar.'], href: '/einstellungen', cta: 'Einstellungen öffnen' },
	{ icon: Users, title: '2. Anfragen und Kunden', lines: ['Jede neue Anfrage legen Sie als „Vorgang“ an, den Kunden direkt dabei mit.', 'Die App führt Sie Schritt für Schritt: annehmen, Besichtigung, Angebot, Rückmeldung, Start. Erreichte Schritte können Sie anklicken, um zurückzuspringen.', 'Beim Kunden pflegen Sie Objekte mit Hinweisen, Reinigungsmitteln und Reinigungsplan.'], href: '/vorgaenge', cta: 'Vorgänge ansehen' },
	{ icon: FileText, title: '3. Kalkulieren und Angebote schreiben', lines: ['Der Kalkulator rechnet von der Fläche zur Monatspauschale. Raumtypen ziehen Sie ins Raumbuch.', 'Im Angebot zeigt „Wirtschaftlichkeit“ die Marge nach Selbstkosten: Rot heißt, der Preis deckt die Kosten nicht.', 'Das PDF entsteht nach DIN 5008 mit Live-Vorschau.'], href: '/kalkulator', cta: 'Zum Kalkulator' },
	{ icon: CalendarDays, title: '4. Einsatzplan und Team', lines: ['Der Plan entsteht aus den Reinigungsplänen der Objekte. Personen ziehen Sie per Drag & Drop auf Einsätze.', '„Ausfälle ersetzen“ schlägt bei Krankheit sofort die beste Vertretung vor, auch Springer.', 'Im Team sehen Sie Stunden, Minijob-Grenzen, Urlaubsanträge und Tauschwünsche.'], href: '/einsatzplan', cta: 'Zum Einsatzplan' },
	{ icon: Smartphone, title: '5. Die Mitarbeiter-App', lines: ['Unter Einstellungen → Zugänge legen Sie für jede Person einen Zugang an (Einmal-Code, Passwort wählt die Person selbst).', 'Mitarbeitende stempeln am Handy, auch per QR-Code am Objekt (Beim Kunden: „Stempel-QR“), melden sich krank, beantragen Urlaub, melden Mängel mit Foto und tauschen Schichten.', 'Sie sehen nur ihre eigenen Daten, alles andere ist auf dem Server gesperrt.'], href: '/einstellungen#zugaenge', cta: 'Zugänge anlegen' },
	{ icon: Gauge, title: '6. Abrechnen und im Blick behalten', lines: ['Der Rechnungslauf erstellt alle Monatsrechnungen in einem Schritt, auch als E-Rechnung (XRechnung, ZUGFeRD) und als DATEV-Datei für die Steuerberatung.', 'Cockpit und Controlling zeigen je Objekt Gesundheit, Marge und Lücken zwischen Plan und Zeitbuchungen.', 'Sichern Sie Ihre Daten regelmäßig (Einstellungen → Datensicherung). Diesen Rundgang finden Sie jederzeit links unten unter „Rundgang“.'], href: '/rechnungen', cta: 'Zu den Rechnungen' }
];

const key = (id: string) => `resch-tour:${id}`;

class Tour {
	open = $state(false);
	step = $state(0);
	#user = '';
	/** Für diese Person laden: beim allerersten Mal von selbst öffnen */
	init(userId: string) {
		if (this.#user === userId) return;
		this.#user = userId;
		let seen = false;
		try { seen = !!localStorage.getItem(key(userId)); } catch { /* ohne Speicher: nicht nerven */ seen = true; }
		this.step = 0;
		this.open = !seen;
	}
	start() { this.step = 0; this.open = true; }
	next() { if (this.step < steps.length - 1) this.step += 1; else this.finish(); }
	prev() { if (this.step > 0) this.step -= 1; }
	/** Schließen und merken, dass der Rundgang gezeigt wurde */
	finish() { this.open = false; try { localStorage.setItem(key(this.#user), String(Date.now())); } catch { /* ignorieren */ } }
}
export const tour = new Tour();
