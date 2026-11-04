# Bestand der App „Objektia“ (Stand 2026-11-04, Code- und Dokumentenanalyse)

Quellen (alle lokal, Pfad relativ zu `/Users/marc/AI-Projekte/Resch-Gebäude 3/`): `README.md` (vollständig gelesen, 149 Zeilen), `docs/betrieb.md`, `docs/01-bestandsanalyse-und-konzept.md` (historisch, Phase A, beschreibt V1/V2 und NICHT den heutigen Stand), `src/lib/types.ts`, `src/routes/*`, `src/routes/api/*`, Navigation in `src/routes/+layout.svelte`, Testdateien. Selbst ausgeführt: `npx vitest run` -> 22 Dateien, 134 Tests bestanden. `npm run test:security` habe ich NICHT ausgeführt (braucht laufenden Server); die Zahl der Prüfungen stammt aus README (110+ bzw. 138) und Zählung im Skript (ca. 160 `ok(`-Aufrufe in `scripts/security-test.mjs`). Reifegrad-Angaben beruhen auf den Selbstauskünften im README, außer wo "im Code bestätigt" steht.

Legende Reifegrad: **T** = getestet (Browser und/oder Server-Sicherheitstest), **L** = nur Logik getestet (Vitest), **U** = ungetestet / nur Typprüfung und Build, **?** = unklar.

Wichtiger Vorbehalt: README ist in sich widersprüchlich (siehe Abschnitt "Widersprüche"). Die obere Hälfte des README (neuere Einträge) ist maßgeblich, die Tabelle "Umgesetzt" und die Liste "Nicht umgesetzt / Einschränkungen" enthalten teils überholte Aussagen.

---

## 1. Funktionen der Verwaltung

### Takeaway
Breiter, durchgängig verknüpfter Funktionsumfang (Anfrage bis Rechnung, Einsatzplan, Zeiten bis Lohnexport, Qualität mit Kundenabnahme). Technisch ein Prototyp mit erstem Server-Teil: Reifegrad meist "Logik getestet + Hauptabläufe manuell im Browser", Playwright-Tests fehlen. Menüstruktur im Code bestätigt: 4 Tagesseiten (Heute, Aufgaben, Fristen, Cockpit) plus Vorgänge, dazu 5 Bereiche.

### Cited Findings (nach Bereich)

**Verkauf**
- Kunden/Objekte: Liste mit Suche/Filter/Sortierung/CSV-Export und CSV-Import (mit Vorschau, Fehlerzeilen); Detail mit Ansprechpersonen, Objekten samt Reinigungsplan (füllt Einsatzplan), Terminen, Angeboten, Verlauf, Leistungsbericht-PDF; Leitweg-ID und Debitorenkonto je Kunde; Objektdossier (Hinweise, Reinigungsmittel/Verfahren). Reife: Kern T (manuell), CSV-Import **U** (README Z. 138). Position des Objekts auf der Karte nur von Hand/per Klick. — README "Umgesetzt", `types.ts` (Customer, Site)
- Angebote: Editor (Sonder-/Unterhaltsreinigung), Optionspositionen mit Aufpreis, Drag&Drop-Sortierung, Live-Marge nach Selbstkosten, PDF nach DIN 5008 Form B, "Finalisieren = als versendet vermerken", Rückmeldung, neue Version. **Kein E-Mail-Versand.** Reife: L (quotePdf.test) + manuell. — README Z. 84, 133
- Kalkulator: Raumbuch -> Stunden -> Monatspauschale, Annahmen editierbar (Lohn, LNK, Produktivität, Material, Maschinen, Gemeinkosten, Gewinn), Drag&Drop, Übernahme ins Angebot. Reife: L (`calc.test.ts`). Leistungs-/Produktivitätswerte sind Annahmen. — README Z. 85, 113, 136
- Vorgänge als Ablauf: 8 Schritte (Anfrage -> Daten -> Besichtigung -> Angebot -> Rückmeldung -> Start -> Ausführung -> Projektzeitliste), Flow-Ansicht je Zeile, Rückspringen, automatisches Vorrücken, .ics für Besichtigung. Reife: L (`cases.test.ts`) + Desktop-Browser; Handy-Ansicht des Flows nicht gesondert geprüft. Nicht enthalten: Verweildauer je Schritt, Erinnerung bei Stillstand. — README Z. 22, 78
- Projektzeitliste: abgeschlossene Vorgänge mit Auftragswert, CSV. — README Z. 79
- Verträge: Laufzeit, Kündigungsfrist, Preisanpassung nach Tarifszenario 2027, Preisanpassungsschreiben (PDF). Tarifwerte sind Annahmen/Szenarien, keine Rechtsauskunft. Reife: L/U (Brief-Vorlagen "vor Einsatz rechtlich prüfen"). — README Z. 86, 136
- Bieter-Mappe (`/ausschreibung`): Eignungsnachweise gegen Nachweisliste, Referenzliste und Kalkulationsblatt (Stundenverrechnungssatz) als PDF. Reife: L (documentsPdf.test). — README Z. 101

**Einsatz & Team**
- Einsatzplan: Wochenplan aus Objekt-Reinigungsplänen, Drag&Drop (Personen, Vertretungen), Abwesenheiten, Vertretungs-Assistent (Rangliste: Kapazität, Kosten, Minijob-Rest, Anfragetext), Springer-Ablauf "Ausfälle ersetzen" (ein Klick), Planungswarnungen (Doppelbelegung, Ruhezeit < 11 Std., Wochenstunden > Vertrag +5), Einsatzzettel-PDF je Objekt/Tag. Reife: L (`planning.test.ts`, `shiftSheetPdf.test`) + manuell. Feiertage nur bundesweit. — README Z. 91, 102, 112, 116, 135
- Schichttausch (Verwaltungsseite: Team -> "Tauschwünsche", Entscheidung des Büros, Server prüft beim Genehmigen erneut). Reife: L (`swap.test.ts`) + Server-Sicherheitstest. — README Z. 17
- Team: Mitarbeitende, Urlaubsanträge mit Freigabe, Abwesenheiten, Minijob-Grenze inkl. Zuschläge, Stundenkonto-Saldo, Unterweisungs-Fristen. — README Z. 97
- Zeiten: Erfassung mit Validierung und Quelle (App/Papier/Büro), Zeitarten (Arbeit, Weg, Rüst; alle bezahlt), Zuschläge nach Rahmentarif mit Feiertagskalender (Nachtzeit 23-6 Uhr ist Annahme), Soll/Ist je Objekt, "ungültig statt löschen" mit Änderungsprotokoll, CSV, Lohnstunden-CSV je Mitarbeiter und Lohnart (Nummern aus Einstellungen; **keine Lohnabrechnung**). Reife: L (`surcharge.test`, `export.test`) + manuell.
- Korrekturworkflow: Antrag aus der App (Buchungen der letzten 14 Tage; neu Beginn/Ende/Pause + Begründung), Büro gibt frei oder lehnt ab (Antwort Pflicht), Protokoll alt -> neu, Monatssperre, 1 offener Antrag je Buchung, max. 5/Std. Reife: **T** Server-Ablauf (Sicherheitstest) + Freigabe im Browser. **U**: der Dialog in der Mitarbeiter-App. Offen: Benachrichtigung bei Entscheidung (Person sieht sie beim nächsten Öffnen), Korrektur nach Lohnexport als eigener Nachtragsfall. — README Z. 19
- Monatsabschluss: Prüfliste (offene Korrekturanträge blockieren; übergehbare Hinweise: Monat nicht zu Ende, Einsätze ohne Buchung, Tage > 12 Std., Überschneidungen, Buchungen an Urlaub/Krank, Prüfhinweise), Sperre, Entsperren nur mit Grund, Abschlussprotokoll inkl. Lohnexport, Warnung bei Entsperren nach Export. Reife: L (`monthClose.test.ts`) + Browser. **Nicht gebaut:** getrennte Zeitstände (erfasst/freigegeben/abrechenbar), Nachtragsbuchung nach Export als Beleg, "nur Inhaber darf entsperren". — README Z. 20
- Karte (Leaflet-artig, OpenStreetMap-Hintergrund abschaltbar): Alle Kunden nach Status; Einsatztag mit nummerierten Einsätzen, Termine, rote Umrandung unbesetzt, Tour je Person (Luftlinie); Ebenen "Offene Mängel", "Termine (14 Tage)"; Nähe-Check (3 km); Tagesstand der Einsätze (Zeit gebucht / ausstehend / >15 Min verspätet / vergangen ohne Buchung); Vertretung nach Entfernung mit "Einteilen" (+ Rückgängig); Wege je Person (Touren, in Einstellungen einschaltbar) mit Pausen-Warnung; Stempel-Radius-Kreis. Fahrzeit = Schätzung (Luftlinie x 1,3, 35 km/h, +5 Min), **keine Routenberechnung**. Reife: L (`mapTools.test`, `geo.test`, `tour.test`) + Browser für Ebenen, Nähe-Check, Tagesstatus, Einteilen. **Nicht im Browser gesehen:** Wege-Warnung, Radius-Kreis. **Nicht gebaut:** Position per Adresse suchen, Routenoptimierung. — README Z. 32-39, 90

**Qualität**
- Mängel: Reklamationen mit Frist, Status, Wiederholungshinweis, Herkunft (intern, Begehung, Kunde, Mitarbeiter), erste Reaktion + Ø Reaktionszeit, automatische Nachkontrolle als Aufgabe nach Behebung, optional Foto aus Mitarbeitermeldung (`types.ts` Defect). Reife: manuell/Browser.
- Begehungen: Checkliste je Objekt, Erfüllungsgrad, Mängel direkt in die Mängelliste, Freigabe fürs Kundenportal. Bewusst nicht je Person ausgewertet (Kommentar in `types.ts`). Reife: manuell. — README Z. 93
- Leistungsverzeichnis (LV): je Objekt Leistungen je Raum mit Intervall (täglich/je Einsatz bis jährlich, nach Bedarf), optional Fläche; Versionen mit Gültigkeitsdatum, neue Version als Kopie, Änderungsübersicht (neu/entfallen/geändert); Version mit bereits geprüften Einsätzen gesperrt. Reife: L (`lv.test.ts`) + Browser. — README Z. 25
- Leistungsnachweis: je Einsatz drei getrennte Zustände Anwesenheit (aus Zeitbuchungen), Ausführung (vollständig/teilweise mit nicht erbrachten LV-Leistungen/nicht, Pflichtgrund), Abnahme (abgenommen/beanstandet, Name + Pflichtbegründung; Beanstandung legt auf Wunsch Mangel mit Nachkontrolle an); Abnahme erst nach Ausführung; merkt LV-Version; Verlauf; Filter, Massenaktion "als vollständig", CSV; Monats-PDF je Objekt mit Unterschriftsfeld. Reife: L (`nachweis.test`) + Browser. PDF: nur Struktur geprüft, nicht in PDF-Programm. — README Z. 26, 29, 41
- Abnahme per Kundenlink (öffentliche Seite `/abnahme/<Objekt>?t=<Schlüssel>`): siehe Frage 3. Reife: **T** (24 Sicherheitschecks + ganzer Weg im Browser).
- Fällige periodische Leistungen als Aufgaben (monatlich bis jährlich, 7 Tage vorher, max. 1 offene je Leistung; Basis letzter Nachweis, sonst LV-Beginn). Warnung: **beim ersten Lauf entstehen Aufgaben für alle bereits überfälligen Leistungen auf einmal.** Reife: L/Browser?. — README Z. 28
- Nachweise: Versicherungen/Bescheinigungen mit Ablaufampel, für Betrieb und Subunternehmer; **nur Metadaten, keine Dateien**. — README Z. 98, `types.ts` DocItem
- Kundenportal `/portal/<id>`: nur Vorvorschau für angemeldete Verwaltungsnutzer (Mangel melden, Meldungen verfolgen, freigegebene Kontrollberichte, Rechnungen, QR je Objekt). **Kein öffentlicher Kundenzugang** (braucht eigene Zugangsdaten + eigenen Endpunkt). — README Z. 53, 94, 137

**Geld**
- Rechnungen: offene Posten, Rechnungslauf für Monatspauschalen, Rechnungs-PDF, Zahlungserinnerung und Mahnung als PDF (**nur vermerkt, nicht versendet**; max. 2 Stufen in `Invoice.remindCount`), Storno als Stornorechnung (Original unverändert), CSV für Steuerberater. Reife: L (`documentsPdf.test`, `export.test`). Mahn-/Briefvorlagen nicht rechtlich geprüft. — README Z. 87, 111, 136
- E-Rechnung (`/e-rechnung`): Pflichtangaben-Prüfung (USt-ID, IBAN, E-Mail, Adressen, Leitweg-ID), XRechnung 3.0 (UBL), ZUGFeRD/Factur-X (EN 16931, PDF mit XML). Standard-USt-Satz 19 % im Code (`einvoice.ts`). **Weder KoSIT-Validator noch PDF/A-3 geprüft; kein Versand (Peppol/Portal).** Reife: L (`einvoice.test`, `xrechnung.test`), fachlich **ungeprüft**. — README Z. 115
- DATEV-Export (EXTF 700, Debitor an Erlöskonto, Storno als Haben; Berater-/Mandantennr., Kontenrahmen, Erlöskonto in Einstellungen). **"Aus dem Gedächtnis gebaut, nicht mit echtem DATEV-Import geprüft".** Reife: L, fachlich ungeprüft. — README Z. 106
- Zusatzleistungen: Angefragt -> Beauftragt (wer beim Kunden) -> Ausgeführt (Datum) -> Abgerechnet oder Abgelehnt (Grund); Verlauf; mehrere ausgeführte Leistungen eines Kunden zu **einer Rechnung** (Positionen im PDF); Anzeige "erbracht, aber nicht abgerechnet"; Storno der Rechnung macht sie wieder abrechenbar. Reife: L (`extras.test`) + Browser bis Rechnung. Nicht gebaut: Meldung durch Mitarbeitende; **als E-Rechnung nur eine Sammelzeile, keine Einzelpositionen**. — README Z. 40-41
- Controlling: Erlös, Lohnkosten, Deckungsbeitrag je Objekt, Kundenkonzentration. Cockpit: Objekt-Gesundheitsscore (Marge, Plan, Qualität, Zahlung), Lücken-Detektor (Plan vs. Zeitbuchungen), Prognose Monatsende, Tarif-Simulator (Break-even-Lohn, nötiger Preis), Mindestlohn-Abstand ab 2027 (14,60 EUR "laut Recherche, vor Einsatz prüfen"). Reife: L (`cockpit.test.ts`). Scores sind objektbezogen, bewusst nicht personenbezogen. — README Z. 88-89, 114, 139
- Heute-Seite: Besetzung mit Porträts, Fokus nach Dringlichkeit, Ringanzeigen, Tagesziel mit Konfetti, Tagesbriefing (Text zum Kopieren), Erste-Schritte-Checkliste, Rundgang (7 Schritte). Fristenkalender 12 Monate (Kündigungsfristen, Nachweise, Unterweisungen, Prüfungen, Zahlungen, gesetzl. Stichtage als Richtwerte). Aufgaben-Board mit Drag&Drop.

**Ausstattung**
- Schlüssel: Ausgabe, Rücknahme, Verlust, Protokoll; Alarmcodes bewusst nicht gespeichert. — README Z. 96, `types.ts`
- Material: Bestände mit Mindestmenge, Gefahrstoff-Kennzeichen, Geräteprüfung (DGUV V3). Keine Verbrauchsbuchung je Einsatz erkennbar (? im Code nicht geprüft). — README Z. 99

**Querschnitt**
- Datensicherung als JSON (Export/Import), Demodaten entfernen oder mit 8/12 Mitarbeitenden laden, Farbwelten (Gelb als Primärfarbe), Hell/Dunkel, Favoriten im Menü, Befehlspalette ⌘K, Tastenkürzel. Einstellungen-Dialoge, CSV-Import, Einsatzzettel, Tagesbriefing nur über Typprüfung/Build abgesichert (README Z. 138). Neue Optik: übrige Seiten nicht einzeln durchgesehen (README Z. 23).
- Offline/PWA: Service Worker + Manifest vorhanden; **Registrierung im Test-Browser nicht geprüft**.

### Inferences
- Alles läuft als ein Dokument ("Data" in `types.ts`, ein JSON-Bestand, vom Browser gespeichert); dadurch einfache Verknüpfungen, aber Mehrbenutzerbetrieb nur über Revisionsprüfung.
- Zielgruppe de facto kleiner bis mittlerer Betrieb (bis ca. 50 Mitarbeitende laut `docs/betrieb.md`); größere Betriebe bräuchten PostgreSQL (nur "vorgesehen").

### Gaps
- Kein Playwright-Test, keine Responsive-/Tastaturprüfung (README Z. 140).
- Ob Material-Verbrauch/Bestandsabbuchung automatisch erfolgt: unklar (nicht im Code verfolgt).
- Ob Vorgangs-Typen Bewerbung/Beschwerde (V1) in Objektia existieren: laut `types.ts` nur Kundenanfrage-Vorgang (`Case`), also nicht.
- Kein Fahrzeug-/Fuhrpark-, Lager-, Inventur- oder Subunternehmer-Einsatzmodul im Code gefunden (nur Subunternehmer-Nachweise als Metadaten). Gesucht nur per Stichwort/Typen, nicht Seite für Seite.

---

## 2. Mitarbeiter-App (`/mitarbeiter`, Handy)

### Takeaway
Ausgebaute, schreibgeschützte-plus-Eingang-App: Stempeln, Checkliste mit Foto, Meldungen, Tausch, Mitteilungen, 6 Sprachen. Schreibzugriff nur über einen getrennten Eingang, den die Verwaltung übernimmt. Mehrere Teile sind nur serverseitig, nicht auf echtem Gerät getestet.

### Cited Findings
- Stempeln: Ein-/Ausstempeln in zwei Taps, Einsatzort nur aus eigenen Einsätzen des Tages, **Serverzeit**, Pause beim Ausstempeln; zwei Stempelungen innerhalb 1 Min gelten als Versehen. Reife: T (Sicherheitstest). — README Z. 14, 44
- QR-Stempeln: Aushang DIN A4 mit geheimem Schlüssel je Objekt; optional "Einstempeln nur per QR" (Ausstempeln auch ohne); Vergleich in konstanter Zeit; "Neuen Code erzeugen" macht Aushänge ungültig. Schwachpunkt: weitergegebenes Foto des Aushangs. — README Z. 16
- Optionaler Standort-Abgleich (Standard aus): Standort nur im Moment des Stempelns; Server vergleicht mit Objektposition + Radius (Standard 150 m, Messungenauigkeit zugunsten der Person); gespeichert wird **nur das Ergebnis**, keine Koordinaten; sperrt nie. Reife: L + Server-Sicherheitstest. **Nicht getestet:** Standortabfrage im echten Handy-Browser, Genauigkeit in Gebäuden. — README Z. 18
- Checkliste am Einsatz: LV-Leistungen des Objekts (heute fällige zuerst, periodische unter "Weitere Leistungen"), abhaken, Notiz, Foto; Server nimmt nur Leistungen des Objekts für heutigen eigenen Einsatz; idempotent, offline-fähig. Reife: Browser-Weg getestet; **Foto mit echter Handykamera nicht geprüft**. — README Z. 27, 31
- Mangel melden mit Foto (verkleinert, serverseitig als Bild geprüft, nur für Verwaltung abrufbar). — README Z. 14
- Krank melden (Aufgabe "Vertretung klären" an Verwaltung, Springer-Ablauf greift), Urlaub beantragen (Freigabe im Team). — README Z. 14
- Eigene Zeiten mit Status (eingegangen / vom Büro geändert / ungültig), Objekthinweise, Reinigungsmittel, nächste Einsätze, Stundenkonto, Minijob-Stand, Unterweisung. Korrektur melden (14 Tage).
- Schichttausch: eigenen künftigen Einsatz abgeben (nur bis 3 Std. vor Beginn, max. 5 offene Angebote); Kollegen sehen nur übernehmbare Angebote (nicht schon eingeplant, nicht abwesend, keine Überschneidung, 11 Std. Ruhezeit, Minijob-Grenze); wer zuerst übernimmt (atomar); Büro entscheidet; erscheint als ersetzende Vertretung im Plan. Mitarbeitende sehen nur Vorname, Zeit, Objekt. — README Z. 17
- Mitteilungen: Glocke mit Zähler (auch im Tab-Titel); Abfrage alle 45 s und bei Tab-Rückkehr; optional Systemhinweis, **solange App geöffnet** (im Code bestätigt: `new Notification(...)` in `+page.svelte`, kein Web Push). Kein echtes Push (gesperrtes Handy / geschlossene App) ist **nicht gebaut und nicht getestet**. — README Z. 43
- Offline: Stempelungen/Meldungen/Checkliste werden in Gerätewarteschlange gespeichert und nachgesendet (nachgereichte Zeiten gekennzeichnet, max. 36 Std. alt). Reife: ? (Auslieferung des Service Workers geprüft, Registrierung im Browser nicht).
- Sprachen: de, en, fr, pl, ro, tr (im Code bestätigt `staffI18n.ts`). **Übersetzungen sind Entwürfe**, nicht von Muttersprachlern geprüft.
- Server-API unter `/api/me/*`: checklist, correction, defect, notifications, punch, request, swap, swaps, view (im Code bestätigt).

### Inferences
- Datenfluss-Prinzip: Mitarbeitende schreiben nie in den Verwaltungsbestand; Verwaltung pollt Eingang alle 30 s (+ bei Fokus). Das heißt: Übernahme in die Verwaltung findet nur statt, wenn dort ein Browser mit der App offen ist (aus README abgeleitet, nicht im Code verifiziert).

### Gaps
- Nicht gebaut laut README: NFC, echtes Push, Chat, Zusatzleistung-Meldung durch Mitarbeitende, Dateiablage. Mitarbeiter-Ansicht war lt. alter Tabelle "schreibgeschützt/ohne Zugriffsschutz" (überholt, siehe Widersprüche).
- Dialog "Korrektur melden" in der App nicht im Browser getestet; Übersetzungen ungeprüft.
- Kein Fotobeweis-/Zeitstempel-Standard, keine Unterschrift in der App, keine Materialanforderung durch Mitarbeitende (im README nicht erwähnt, im Code nicht gefunden: unklar/nicht vorhanden).

---

## 3. Daten und Verknüpfungen

### Takeaway
Die Kette Leistungsverzeichnis -> Checkliste -> Leistungsnachweis -> Abnahme -> Mangel -> Nachkontrolle, sowie Zeiten -> Lohn/Abschluss und Zusatzleistung -> Rechnung existieren und sind größtenteils im Browser durchgespielt.

### Cited Findings
- **LV (Site.lv, Versionen) -> Checkliste (Mitarbeiter-App) -> Ausführung im Leistungsnachweis** (vollständig/teilweise/nicht automatisch aus Abhaken abgeleitet, Foto, "gemeldet von", Aufgabe bei Abweichung) -> **Abnahme** (Büro oder Kundenlink) -> **Mangel mit Nachkontrolle + Aufgabe** (`ServiceRecord.defectId`). Im Browser komplett geprüft. — README Z. 27, 31; `types.ts` ServiceRecord
- LV -> **periodische Leistungen** -> Aufgaben "Fällig: ..." (über `ServiceRecord.doneKeys`).
- LV-Version wird im Nachweis gemerkt (`lvVersionId`) und gesperrt, sobald geprüft: rückwirkende Änderung verhindert.
- **Zeiten -> Anwesenheit** im Leistungsnachweis (abgeleitet); **Zeiten -> Zuschläge -> Lohnstunden-CSV** (nach Lohnart) -> **Monatsabschluss** (Sperre, Protokoll `monthLog` mit Kind `lohnexport`). Korrekturantrag -> Freigabe -> Buchung + Änderungsprotokoll (`TimeEntry.history`).
- **Zeiten/Plan -> Lücken-Detektor, Besetzung, Prognose** (Cockpit); Zeiten + Rechnungen -> Controlling (Deckungsbeitrag je Objekt).
- **Zusatzleistung -> Rechnung** (`ExtraService.invoiceId` <-> `Invoice.extraIds`; Storno gibt Leistungen frei). Rechnung -> Debitor/Erlöskonto -> DATEV-EXTF; Rechnung + `buyerRef` -> XRechnung/ZUGFeRD.
- Kalkulator -> Angebot (calcHours, areaM2 für Live-Marge) -> Vertrag (`Quote.contract`) -> Rechnungslauf (Monatspauschale, `Invoice.period`, `quoteId`).
- Vorgang (`Case`) verknüpft Kunde, Objekt, Angebot, Termine (Besichtigung/Start) und Projektzeitliste.
- Schichttausch -> `Cover` mit `replacesId`/`swapId` -> Einsatzplan, Besetzung, Prognose, Lücken-Detektor.
- Krankmeldung -> Aufgabe + Springer-Ablauf; Mangel (Begehung/Kunde/Mitarbeiter/Kundenabnahme) -> gemeinsame Mängelliste.
- Karte verknüpft Objekte, Mängel, Termine, Zeitbuchungen (Tagesstand), Abwesenheiten und Stempel-Einstellungen.

### Inferences
- Es gibt kein durchgängiges Foto-/Beweis-Modell außerhalb von Mangel-Foto und Checklisten-Foto (Fotos liegen als Eingang-IDs auf dem Server). Eine Foto-Galerie je Einsatz/Objekt ist nicht erkennbar.

### Gaps
- Verknüpfung Zeiten -> Rechnung (Stundenabrechnung/Regiearbeiten) nicht erkennbar; Rechnungen basieren auf Monatspauschale oder Zusatzleistungen (unklar, ob Stundenlohnrechnung möglich ist).
- Verknüpfung Material -> Einsatz/Objekt (Verbrauch) nicht gefunden.

---

## 4. Lücken laut README ("Nicht umgesetzt / Einschränkungen") und "Nicht gebaut"-Hinweise

### Takeaway
Die Liste ist teils überholt; unten gemäß dem neuesten Stand sortiert. Die wichtigsten echten Lücken: kein Versand (E-Mail/E-Rechnung/Push), fachlich ungeprüfte Schnittstellen (DATEV, KoSIT, PDF/A-3), kein öffentlicher Kundenzugang außer Abnahmelink, kein echtes Push, keine Routenberechnung.

### Cited Findings (Lücken, gruppiert)
**Versand und Schnittstellen**
- Kein E-Mail-Versand (Angebote, Mahnungen, Abnahme-Link, alles nur "vermerkt"/kopieren). — README Z. 31, 133
- E-Rechnung: nicht gegen KoSIT-Validator, kein PDF/A-3-Check, kein Peppol/Portal-Versand. — Z. 115
- DATEV-Export nicht mit echtem DATEV-Import getestet. — Z. 106
- Keine Bank-API, keine eigene Lohnabrechnung (bewusst). — Z. 139
- E-Rechnung aus Zusatzleistungen nur Sammelzeile. — Z. 41

**Zeiten / Lohn**
- Keine getrennten Zeitstände (erfasst/freigegeben/abrechenbar), kein Nachtragsbeleg nach Export, kein Rechtekonzept "nur Inhaber entsperrt". — Z. 20
- Keine Benachrichtigung bei Entscheidung über Korrekturantrag; Korrektur nach Lohnexport nicht als Nachtragsfall. — Z. 19
- Feiertage nur bundesweit (Landesfeiertage fehlen); Nachtzeit 23-6 Uhr Annahme. — Z. 135
- Tarif-/Leistungswerte, Ampelgrenzen, Vertragslaufzeiten sind Annahmen (Stand 02.11.2026). Zentrale Tarifparameter-Tabelle mit Gültigkeit offen. — Z. 136, 138

**Standort / Planung**
- Keine GPS-Ortung, kein Dauer-GPS, kein Pflicht-Geofencing (bewusst); optionaler Abgleich nur Hinweis. — Z. 44, 135, 139
- Keine Routenoptimierung, keine echte Routenberechnung, keine Adresssuche für Kartenposition. — Z. 39
- NFC nicht umgesetzt. — Z. 44

**Kommunikation**
- Kein echtes Push, kein Chat. — Z. 43-44
- Kein E-Mail-/SMS-Versand an Kunden.

**Kunde / Portal**
- Kundenportal `/portal/<id>` nur Vorschau für angemeldete Verwaltung; öffentlicher Zugang für Kunden fehlt (nur der Abnahme-Link ist öffentlich). — Z. 53, 137
- Vorgänge auf der Kundenseite nicht umgesetzt. — Z. 24

**Betrieb / Sicherheit** (Details Abschnitt 5)
- Keine Zwei-Faktor-Anmeldung, kein "Passwort vergessen", kein Datenschutz-Audit, kein Pen-Test durch Dritte, keine Content-Security-Policy. Betrieb mit echtem Zertifikat auf Server nicht getestet; Last, Wiederherstellung, Updates im Betrieb nicht getestet. — Z. 7, 24, 52; `docs/betrieb.md`
- Ein Dokument als Datenbestand; Mehrbenutzer nur über Revisionsprüfung (bei Konflikt neu laden); PostgreSQL nur vorgesehen. — Z. 54-55
- Sprachen: Übersetzungen Entwürfe. PDFs mit Standardschrift Helvetica. Absenderdaten `src/lib/company.ts` Platzhalter.
- Dateiablage fehlt (Nachweise nur Metadaten). — Z. 138
- Verweildauer je Vorgangsschritt / Stillstand-Erinnerung fehlt. — Z. 22
- Einheitliche Benennung Cockpit nicht umgesetzt. — Z. 24

### Widersprüche im README (wichtig für die Weiterverwendung)
- Z. 44 "Nicht umgesetzt: Standortprüfung (bewusst: keine GPS-Ortung)" und Z. 135 "Keine GPS-Erfassung" vs. Z. 18 optionaler Standort-Abgleich beim Stempeln: Gemeint ist offenbar: kein Dauer-Tracking, aber optionaler punktueller Abgleich. Im Code: `Data.settings.geo`, `geoRadius` vorhanden.
- Z. 41 "Nicht gebaut: Mitarbeiter-App hakt LV-Leistungen ab; Kundenportal zur Abnahme; PDF des Leistungsnachweises" vs. Z. 27, 29-31: **inzwischen gebaut** (Commit 0b96bba).
- Z. 138 "Noch offen: Leistungsnachweis/Arbeitsschein mit Unterschrift ... mehrsprachige Mitarbeiteransicht" vs. gebauter Leistungsnachweis und 6 Sprachen. Einen digitalen Unterschriftsfeld-Eintrag gibt es nur als Namen + Begründung bei Abnahme und Unterschriftsfeld im PDF; Unterschrift auf dem Display: nicht vorhanden.
- Z. 61, 132, 137 "Kein Backend, keine Authentifizierung ... Daten nur im Browser" und Z. 105/118 "Kein Zugriffsschutz" vs. Z. 3, 9-15, 47: Server mit SQLite, Login, Rollen sind gebaut. Alte Zeilen überholt.
- Z. 7 "110+ Prüfungen" vs. Z. 24 "138 Sicherheitschecks" vs. Z. 48 "110+": Zählungsstände verschiedener Zeitpunkte; im Skript ca. 160 `ok(`-Aufrufe (ohne Ausführung).
- Z. 120 XRechnung "Leitweg-ID noch nicht erfassbar" vs. Z. 108 und Code (`buyerRef`): Leitweg-ID ist erfassbar.
- Z. 44 nennt "Push-Benachrichtigungen" als nicht umgesetzt, Z. 43 beschreibt Mitteilungen in der geöffneten App: gemeint ist nur echtes Push.

### Inferences
- Die größten Marktlücken im Vergleich zu typischer Branchensoftware dürften (nur Hypothese, nicht aus dieser Analyse belegt) sein: Versand, öffentlicher Kundenzugang, echte Schnittstellen-Validierung, Push, Fotodokumentation als eigenes Modul.

### Gaps
- Keine Gewichtung der Lücken nach Nutzerbedarf in dieser Analyse (Vergleich mit Marktwünschen ist ein späterer Schritt, siehe `reports/` und anderer `research_notes/`).

---

## 5. Datenschutz- und Sicherheitsentscheidungen

### Takeaway
Bewusst datensparsam (kein Dauer-Tracking, keine personenbezogenen Scores, keine Koordinatenspeicherung), serverseitige Rollen/Sitzungen mit gängigen Schutzmaßnahmen; aber kein externes Audit, keine 2FA, kein Passwort-Reset.

### Cited Findings
**Datensparsamkeit / Entscheidungen**
- Kein Dauer-GPS, kein Pflicht-Geofencing; Standort-Abgleich optional (Standard aus), nur im Moment des Stempelns, nur Ergebnis gespeichert, sperrt nie; Hinweis in der App vor dem Stempeln; Rechtshinweis Betriebsrat § 87 Abs. 1 Nr. 6 BetrVG, DSFA, Verarbeitungsverzeichnis "prüfen lassen, keine Rechtsberatung". — README Z. 18, 139
- QR-Stempeln als Alternative zur Standortprüfung: belegt Anwesenheit ohne Standortdaten. — Z. 16
- Touren je Person auf der Karte standardmäßig aus (Datenschutz-Schalter). Privatadressen der Mitarbeitenden nicht gespeichert. — Z. 36, 122
- Keine personenbezogenen Scores; Begehungen/Qualität objektbezogen. — Z. 139; `types.ts` Inspection
- Alarmcodes werden nicht gespeichert (Schlüssel). — `types.ts` KeyItem
- Kartenhintergrund OpenStreetMap abschaltbar (OSM sieht IP und Ausschnitt); keine Adresssuche, damit keine Adressen an Kartendienst. — Z. 39, 90
- Abnahme-Seite für Kunden: keine Namen von Mitarbeitenden, keine internen Notizen, keine Preise. — Z. 30
- Mitarbeitende sehen von Tauschangeboten nur Vorname, Zeit, Objekt. — Z. 17

**Zugriff / Rollen**
- Rollen: Mitarbeitende (landen ausschließlich auf `/mitarbeiter`), Administrator (verwaltet Zugänge), Büro, Objektleitung. Büro/Objektleitung sehen **alle** Geschäftsdaten, können aber keine Verwaltungszugänge verwalten; letzter aktiver Administrator nicht sperr-/löschbar. Die Rollenwahl in Einstellungen blendet nur Menüpunkte aus (kein Datenschutz-Feinschnitt). — Z. 11-12, 51, 118
- Mitarbeitende erhalten eine serverseitig berechnete Projektion nur für die angemeldete Person (Person aus Sitzung, nie aus Anfrage); Verwaltungsbestand, Zugänge, Preise, Rechnungen, Teamdaten: HTTP 403 (getestet). — Z. 46
- Mindest-Passwortlänge: Mitarbeitende 8, Verwaltung 12 (im Code bestätigt `auth.ts` `passwordIssue`). Neue Zugänge mit Einmal-Code, Passwortwechsel beim ersten Anmelden.
- Ersteinrichtung nur mit `SETUP_TOKEN` (Einrichtungscode) und danach gesperrt. — Z. 7, `docs/betrieb.md`

**Server-Schutz**
- Passwörter scrypt+Salt; Sitzungstoken zufällig, im Speicher nur gehasht; Cookie httpOnly + SameSite=Strict (+ Secure unter https); Sperre nach 5 Fehlversuchen (15 Min) + Begrenzung je IP; identische Fehlermeldung bei unbekanntem Namen/falschem Passwort; Ursprungsprüfung (Origin) für schreibende Anfragen; Sicherheits-Header; Protokoll (Anmeldungen, Fehlversuche, Zugangsänderungen); optimistische Sperre (Revision). — Z. 47
- Öffentliche Abnahme-Seite: Schlüsselvergleich in konstanter Zeit, 30 Anfragen / 10 Min je IP, Ursprungsprüfung, Tage nur bis 45 zurück, nur einmal entscheidbar, Link mit "Neuer Link" ungültig machbar. Restrisiko: wer den Link hat, kann abnehmen. — Z. 30
- Foto-Upload: verkleinert, serverseitig als Bild geprüft, nur Verwaltung. Obergrenzen: Korrekturanträge 5/Std., Tauschangebote 5 offene.
- Betrieb: Docker (Node 24, unprivilegierter Benutzer), Caddy mit https (HSTS), Sicherungsskript, Healthcheck; Daten in SQLite `data/resch.db` (in `.gitignore`); EU-VPS-Empfehlung, AVV nötig. Sicherheitstest lief durch Caddy über https mit selbst signiertem Zertifikat.

**Nicht getan**
- Keine 2FA, kein "Passwort vergessen" (Selbstbedienung), kein Datenschutz-Audit, kein Pen-Test durch Dritte, keine Content-Security-Policy, Betrieb mit echtem Zertifikat nicht getestet. Offline gestempelte Orte liegen kurz in der Gerätewarteschlange. DSGVO-Funktionen aus V1 (Löschjournal, Auskunft, Aufbewahrung) sind laut alter Konzeptdatei geplant (Phase C4), im heutigen README nicht als umgesetzt genannt: **unklar**, ob es sie gibt.

### Inferences
- Datenschutz-Haltung ist "Privacy by Design durch Weglassen" (Ergebnis statt Koordinate, Objekt- statt Personenbewertung); Rollen sind grob (Mitarbeitende vs. Verwaltung), nicht fein.

### Gaps
- Keine Aussage möglich zu Aufbewahrungs-/Löschfristen und Auskunftsfunktion (DSGVO) im aktuellen Code: nicht gefunden/nicht geprüft.
- Wie Mitarbeiterfotos (Unsplash-Porträts in `static/people`, für erfundene Demo-Namen) in echten Daten gehandhabt werden: nur Demo; Echtbetrieb unklar.

---

## Kurzübersicht Reifegrade

| Bereich | Reife |
|---|---|
| Rechenlogik (Kalkulator, Zuschläge, Planung, Cockpit, LV, Nachweis, Extras, Tausch, Geo, Monatsabschluss) | L (134 Vitest bestanden, am 2026-11-04 ausgeführt) |
| Server: Login, Rollen, Mitarbeiter-Projektion, Stempeln, Korrektur, Abnahme-API | T (Sicherheitstest, nicht von mir erneut ausgeführt) |
| Browser-Hauptabläufe (Vorgänge, Plan, Nachweis -> Abnahme -> Mangel, Zusatzleistung -> Rechnung, Monatsabschluss, Karte teilweise) | T manuell, laut README |
| E-Rechnung, DATEV-EXTF, Mahnvorlagen, Tarifwerte | L, fachlich/rechtlich ungeprüft |
| Handy-Hardware (Kamera, GPS in Gebäuden), echtes Push, PDF-Viewer, Service-Worker-Registrierung, Echtzertifikat-Betrieb | U |
| CSV-Import, Einstellungen-Dialoge, Einsatzzettel, Tagesbriefing, Mitarbeiter-Korrekturdialog, Wege-Warnung, Radius-Kreis, Übersetzungen | U |
