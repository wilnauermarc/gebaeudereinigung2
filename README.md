# Resch Business Manager 2.0

> **Stand: Frontend-Prototyp mit erstem Server-Teil.** Anmeldung, Rollen und Datenspeicherung laufen jetzt auf dem Server (SQLite, Datei `data/resch.db`). Die Daten in der Demo sind weiterhin erfunden.

## Betrieb mit Docker

`Dockerfile`, `docker-compose.yml` (mit Caddy für https) und `scripts/backup.mjs` liegen im Projekt. Anleitung, Anbieter-Empfehlung und Sicherung: [`docs/betrieb.md`](docs/betrieb.md). Das Image wurde gebaut und der komplette Sicherheitstest (110+ Prüfungen) lief **durch Caddy über https** erfolgreich, dazu Neustart, Sicherung und Healthcheck. Die Ersteinrichtung auf einem Server ist durch einen **Einrichtungscode** (`SETUP_TOKEN` in der `.env`) geschützt. **Nicht getestet:** der Betrieb hinter Caddy mit echtem Zertifikat auf einem Server.

## Anmeldung und Zugriffsschutz

- **Erster Start:** `/login` zeigt die Ersteinrichtung (Konto der Inhaberin, Passwort mindestens 12 Zeichen, Start leer, mit Demo oder mit den bisherigen Browserdaten). Danach ist die Einrichtung gesperrt.
- **Mitarbeitende:** Einstellungen → Zugänge → „Zugang anlegen“ erzeugt einen Anmeldenamen und einen **Einmal-Code** (10 Zeichen, nur einmal sichtbar). Beim ersten Anmelden wählt die Person ein eigenes Passwort (mindestens 8 Zeichen). Mitarbeitende landen nach der Anmeldung ausschließlich auf `/mitarbeiter`.
- **Mitarbeiter-App (`/mitarbeiter`, fürs Handy):** Ein- und Ausstempeln in zwei Taps (Einsatzort nur aus den eigenen Einsätzen des Tages, Zeit ist die **Serverzeit**, Pause beim Ausstempeln), **Krank melden** (Verwaltung bekommt sofort eine Aufgabe „Vertretung klären“, der Springer-Ablauf greift), **Urlaub beantragen** (landet in der Freigabe im Team), **Mangel melden mit Foto** (wird verkleinert, auf dem Server als Bild geprüft, nur für die Verwaltung abrufbar), eigene gebuchte Zeiten mit Hinweisen „beim Büro eingegangen / vom Büro geändert / ungültig“, Objekthinweise und Reinigungsmittel. **Ohne Netz** werden Stempelungen und Meldungen auf dem Gerät gespeichert und nachgesendet (nachgereichte Zeiten werden gekennzeichnet, höchstens 36 Stunden alt). Sprachen: Deutsch, English, Français, Polski, Română, Türkçe (Übersetzungen sind Entwürfe).
- **Eingang statt Direktzugriff:** Mitarbeitende schreiben nie in den Datenbestand der Verwaltung, sondern in einen getrennten Eingang. Die Verwaltung übernimmt ihn alle 30 Sekunden (und bei Fokus) als Zeitbuchung, Abwesenheit bzw. Mangel; jede Übernahme ist über die Eingangs-ID doppelt-sicher. Das vermeidet Konflikte beim Speichern.
- **QR-Stempeln am Objekt:** Beim Kunden unter Objekte → „Stempel-QR“ erzeugt die App einen Aushang (DIN A4) mit geheimem Schlüssel je Objekt. Mitarbeitende scannen ihn mit der Handy-Kamera, melden sich an (der Link wird über die Anmeldung hinweg gemerkt) und stempeln mit einem Tipp. Einstellungen → Stempeln: „Einstempeln nur per QR-Code“ macht den Scan zur Pflicht (belegt Anwesenheit ohne Standortdaten); Ausstempeln geht auch ohne Scan. Der Server prüft den Schlüssel in konstanter Zeit, Mitarbeitende sehen ihn nie, „Neuen Code erzeugen“ macht alte Aushänge ungültig. Ein weitergegebenes Foto des Aushangs ist ein Schwachpunkt (siehe Hinweis auf dem Poster).
- **Schichttausch:** In der Mitarbeiter-App gibt eine Person einen eigenen künftigen Einsatz ab (heute nur bis 3 Stunden vor Beginn, höchstens 5 offene Angebote). Kolleginnen und Kollegen sehen nur Angebote, die sie **übernehmen dürfen**: nicht schon am Objekt eingeplant, nicht abwesend, keine Überschneidung, 11 Stunden Ruhezeit zum Vor- und Folgetag, Minijob-Grenze. Wer zuerst übernimmt, bekommt das Angebot (atomar). Danach entscheidet das Büro im Team („Tauschwünsche“, auch Hinweis auf Heute); beim Genehmigen prüft der Server noch einmal gegen den aktuellen Plan. Der Tausch erscheint im Einsatzplan als Vertretung, die die abgebende Person **ersetzt** (sie gilt an diesem Tag nicht mehr als eingeplant, Besetzung, Prognose und Lücken-Detektor rechnen damit). Mitarbeitende sehen nur Vorname, Zeit und Objekt der Angebote.
- **Mitteilungen:** Die Mitarbeiter-App hat eine Glocke mit Zähler (und im Tab-Titel). Mitteilungen gibt es zu Tauschangeboten (nur für die, die sie übernehmen dürfen), zur Übernahme, zum Zurückziehen und zur Entscheidung des Büros; ist ein Angebot vergeben, verschwindet der Hinweis bei den anderen. Die App fragt alle 45 Sekunden und beim Zurückkehren in den Tab. Auf Wunsch zeigt sie neue Mitteilungen als Systemhinweis, **solange die App geöffnet ist**. **Kein echtes Push** (bei gesperrtem Handy oder geschlossener App): das braucht Web Push mit https, VAPID-Schlüsseln und eine Bibliothek, und ist hier nicht gebaut und nicht getestet.
- **Nicht umgesetzt:** Standortprüfung (bewusst: keine GPS-Ortung), NFC, Push bei geschlossener App, Push-Benachrichtigungen, Chat. Zwei Stempelungen innerhalb einer Minute gelten als Versehen und werden nicht gebucht.
- **Betrieb:** Der Node-Adapter begrenzt Anfragen standardmäßig auf 512 KB. Für den Datenbestand der Verwaltung `BODY_SIZE_LIMIT=26214400` setzen.
- **Was Mitarbeitende bekommen:** Der Server berechnet eine Projektion nur für die angemeldete Person (nächste Einsätze, Stundenkonto, Urlaub/Krankheit, Unterweisung). Die Person kommt aus der Sitzung, nie aus der Anfrage. Der Datenbestand, Zugänge, Preise, Rechnungen und Teamdaten werden an Mitarbeitende nicht ausgeliefert (HTTP 403, getestet).
- **Schutz:** Passwörter mit scrypt und Salt gehashed; Sitzungs-Token zufällig, im Speicher nur als Hash, Cookie `httpOnly` + `SameSite=Strict` (+ `Secure` unter https); Sperre nach 5 Fehlversuchen (15 Minuten) und Begrenzung je IP; gleiche Fehlermeldung für unbekannten Namen und falsches Passwort; Ursprungsprüfung für alle schreibenden Anfragen; Sicherheits-Header; Protokoll (Anmeldungen, Fehlversuche, Zugangsänderungen); optimistische Sperre beim Speichern (Revision).
- **Prüfung:** `npm run test:security` startet 110+ Angriffs- und Rechteprüfungen (inkl. Stempeln, Meldungen, Foto-Upload) gegen einen laufenden Server (`BASE=http://localhost:PORT`, am besten mit eigener Test-Datenbank: `RESCH_DB=/tmp/test.db`).
- **Grenzen, bitte beachten:**
  - **Nur über https betreiben** (Reverse Proxy mit Zertifikat). Ohne https können Passwörter mitgelesen werden.
  - Inhaberin, Büro und Objektleitung sehen **alle** Geschäftsdaten. Die Rollenwahl in den Einstellungen blendet nur Menüpunkte aus.
  - Keine Zwei-Faktor-Anmeldung, kein „Passwort vergessen“ (Inhaberin erzeugt einen neuen Code), kein Datenschutz-Audit, keine Penetrationstests durch Dritte. Vor dem Echtbetrieb prüfen lassen.
  - Das **Kundenportal** (`/portal/<id>`) ist nur noch eine Vorschau für angemeldete Verwaltungsnutzer. Ein öffentlicher Zugang für Kunden braucht eigene Zugangsdaten und einen eigenen, eingeschränkten Endpunkt.
  - Die Datenbank `data/resch.db` enthält echte Daten: sichern, nicht einchecken (steht in `.gitignore`). Für größere Betriebe ist PostgreSQL vorgesehen.
  - Der Datenbestand liegt als ein Dokument auf dem Server und wird vom Browser der Verwaltung gespeichert; Mehrbenutzerbetrieb wird nur durch die Revisionsprüfung abgesichert (bei Konflikt: neu laden).

---

# Resch Business Manager 2.0 (Prototyp)

Interaktiver Frontend-Prototyp. **Alle Daten sind erfundene Demo-Daten**, sie liegen nur im Browser (localStorage). Es gibt noch kein Backend, keine Datenbank und keine Anmeldung. Das kommt in Phase C.

```bash
npm install
npm run dev      # http://localhost:5173
npm run check    # TypeScript / Svelte
npm test         # Unit-Tests: Rechenlogik, PDF-Erzeugung (Vitest)
npm run build    # Produktions-Build (adapter-node)
```

"Demo zurücksetzen" in der Seitenleiste lädt die ursprünglichen Demo-Daten neu. Tastatur: `⌘K` Suche, `g` dann `h` Heute, `p` Cockpit, `u` Aufgaben, `f` Fristen, `w` Vorgänge, `k` Kunden, `a` Angebote, `c` Kalkulator, `v` Verträge, `j` Projektzeitliste, `r` Rechnungen, `e` Einsatzplan, `z` Zeiten, `b` Begehungen, `m` Mängel, `t` Team, `s` Schlüssel, `l` Material, `n` Nachweise, `o` Controlling, `/` fokussiert die Suche.

## Umgesetzt

| Bereich | Stand |
|---|---|
| Heute | Kompakter Tageskopf, **Heute im Einsatz** (Besetzung mit Porträts, läuft/folgt/beendet), Fokus, Aufgaben, Termine, Nachfassen; **Betriebs-Cockpit mit Ringanzeigen** (Marge, Besetzung, Zahlungsmoral, Plan-Treue), **Tagesziel mit Konfetti**, „Heute im Fokus“ nach Dringlichkeit mit Direktaktion, Hero-Bereich mit Schnellaktionen, Kennzahlen, Diagramme (wiederkehrender Umsatz, Wochenstunden), Warnungen, Aufgaben, Wiedervorlagen, Termine |
| Vorgänge | **Geführter Ablauf je Kundenanfrage** mit Stepper: Anfrage (angenommen?, neuer Kunde wird direkt im Dialog mit angelegt) → Daten → Besichtigung (notwendig? mit Termin und .ics) → Angebot (notwendig?) → Rückmeldung → Start → Ausführung (Checkliste, Reklamation) → Projektzeitliste. Erreichte Schritte lassen sich im Stepper anklicken, um **zurückzuspringen** (spätere Daten bleiben, ein verknüpftes Angebot wird wieder Entwurf bzw. „versendet“). Schritte rücken automatisch vor, z. B. wenn das Angebot als versendet vermerkt wird |
| Projektzeitliste | Abgeschlossene Vorgänge mit Auftragswert, CSV-Export (in Excel zu öffnen) |
| Aufgaben | To-dos und Wiedervorlagen, **Board nach Arbeitsstand** (Zu erledigen / In Arbeit / Wartet auf andere / Erledigt) mit Drag & Drop und Frist-Chip, Listenansicht |
| Fristen | Kalender der nächsten 12 Monate: Kündigungsfristen, Nachweise, Unterweisungen, Prüfungen, Zahlungen, gesetzliche Stichtage (Richtwerte) |
| Erste Schritte | Checkliste auf „Heute“, die selbst erkennt, was erledigt ist |
| Kunden | Liste mit Suche, Filter, Sortierung, CSV-Export; Detail mit Bearbeiten, Ansprechpersonen, Objekten samt Reinigungsplan (füllt den Einsatzplan), Terminen, Angeboten, Verlauf, Leistungsbericht-PDF |
| Angebote | Editor (Sonder-/Unterhaltsreinigung) mit **Optionspositionen und Aufpreis**, Leistungen per Drag & Drop sortierbar und **Live-Marge nach Selbstkosten** (wie der Kalkulator: unproduktive Zeit, Material, Maschinen, Gemeinkosten) (Stunden, Lohnkosten, Preisempfehlung), **echte PDF-Vorschau nach DIN 5008 Form B** mit Download, Finalisieren = "als versendet vermerken", Rückmeldung, neue Version |
| Kalkulator | Raumbuch → Stunden → Monatspauschale, Annahmen editierbar, Übernahme in Angebotsentwurf |
| Verträge | Laufzeit, Kündigungsfrist, Preisanpassung nach Tarifszenario 2027, Preisanpassungsschreiben als PDF |
| Rechnungen | Offene Posten, Rechnungslauf für Monatspauschalen, Rechnungs-PDF, Zahlungserinnerung und Mahnung als PDF (nur vermerkt, nicht versendet), CSV für den Steuerberater |
| Controlling | Erlös, Lohnkosten und Deckungsbeitrag je Objekt, Kundenkonzentration |
| Cockpit | Objekt-Gesundheitsscore (Marge, Plan, Qualität, Zahlung), Lücken-Detektor (Plan gegen Zeitbuchungen), Prognose zum Monatsende, Tarif-Simulator mit Break-even-Lohn und nötigem Preis |
| Karte | **Alle Kunden** nach Status auf der Karte; **Einsatztag**: Einsätze des Tages nummeriert nach Beginn, Termine als Rauten, rote Umrandung für unbesetzt, Tour je Person als Linie mit Luftlinien-Kilometern. Kartenhintergrund (OpenStreetMap) standardmäßig an, abschaltbar (OpenStreetMap sieht dabei IP und Kartenausschnitt; die Referrer-Policy sendet den Ursprung mit, sonst sperrt OSM die Kacheln), Position von Objekten per Klick setzen |
| Einsatzplan | Wochenplan aus Objekt-Reinigungsplänen, **Drag & Drop** (Personen auf Einsätze ziehen, Vertretungen verschieben oder entfernen, zulässige Felder leuchten), Abwesenheiten, Vertretungs-Assistent (Rangliste mit Kapazität, Kosten, Minijob-Rest, Anfragetext zum Kopieren) |
| Zeiten | Erfassung mit Validierung und Quelle (App/Papier/Büro), **Zuschläge nach Rahmentarif mit Feiertagskalender**, Soll/Ist je Objekt, **Monatsabschluss mit Sperre**, **ungültig statt löschen mit Änderungsprotokoll**, CSV-Export, Lohnvorbereitung je Mitarbeiter (CSV) |
| Begehungen | Checkliste je Objekt, Erfüllungsgrad, Mängel direkt in die Mängelliste, Freigabe fürs Kundenportal |
| Kundenportal (Vorschau) | Eigene Seite je Kunde unter `/portal/<id>`: Mangel melden, Meldungen verfolgen, freigegebene Kontrollberichte, Rechnungen. QR-Code je Objekt zum Aushängen |
| Mängel | Reklamationen mit Frist, Status, Wiederholungshinweis, **automatische Nachkontrolle als Aufgabe** nach der Behebung, Herkunft (Kunde, Begehung) |
| Schlüssel | Ausgabe, Rücknahme, Verlust, Protokoll (keine Alarmcodes) |
| Team | Mitarbeitende, **Urlaubsanträge mit Freigabe**, Abwesenheiten, Minijob-Grenze inkl. Zuschläge, Stundenkonto-Saldo, Unterweisungs-Fristen |
| Nachweise | Versicherungen und Bescheinigungen mit Ablaufampel, für den Betrieb und Subunternehmer (nur Metadaten) |
| Material | Bestände mit Mindestmenge, Gefahrstoff-Kennzeichen, Geräteprüfung (DGUV V3) |
| Einheitliche Führung | Jede Hauptseite hat denselben Kopf: Titel, **Instrumentenleiste** (Ringanzeigen/Kennzahlen) und ein Banner **„Nächster Schritt“** (Gefahr/Warnung/Info/Ok) |
| Bieter-Mappe | Eignungsnachweise gegen die Nachweisliste prüfen, Referenzliste und Kalkulationsblatt (Stundenverrechnungssatz) als PDF |
| Einsatzzettel | Einsatzplan: Zettel je Objekt und Tag als PDF zum Aushängen oder Mitgeben |
| CSV-Import | Kunden per CSV importieren (Vorschau, Fehlerzeilen) |
| Tagesbriefing | Kurzer Tagesüberblick auf „Heute“ als Text zum Kopieren |
| Mitarbeiter-Ansicht | `/mitarbeiter` (nach Anmeldung mit Mitarbeiter-Zugang): schreibgeschützte Handy-Ansicht mit nächstem Einsatz, Woche, Stundenkonto, Minijob-Stand, Urlaub/Krank, Unterweisung; Deutsch, English, Français, Polski, Română, Türkçe (Übersetzungen sind Entwürfe, bitte prüfen lassen). Ohne Backend ohne Zugriffsschutz |
| DATEV-Export (EXTF) | Rechnungen → „DATEV-Export“: Buchungsstapel im DATEV-Importformat (EXTF 700, Debitor an Erlöskonto, Storno als Haben). **Aus dem Gedächtnis gebaut, nicht mit echtem DATEV-Import geprüft: Testimport mit der Steuerberatung nötig.** Berater-/Mandantennummer, Kontenrahmen, Erlöskonto stehen in den Einstellungen |
| Lohnstunden | Zeiten → „Lohnstunden“: CSV je Mitarbeiter und Lohnart (Arbeit, Weg, Rüst, Zuschläge) mit Lohnart-Nummern aus den Einstellungen. Keine Lohnabrechnung |
| Leitweg-ID, Debitorenkonto | Je Kunde editierbar, die Leitweg-ID geht in die XRechnung |
| Objektdossier | Objekt: Hinweise plus Reinigungsmittel und Verfahren (Chemie), sichtbar auf der Objektkarte |
| Einheitliche Kennzahlenleiste | Auch Aufgaben, Material, Nachweise, Schlüssel und Begehungen haben jetzt die Instrumentenleiste |
| Storno | Rechnungen: Stornieren legt eine Stornorechnung mit Minusbetrag an, das Original bleibt unverändert |
| Planungswarnungen | Einsatzplan: Doppelbelegung, Ruhezeit unter 11 Std. und Wochenstunden über Vertrag (+5 Std.), Logik in `planning.ts` mit Tests |
| Kalkulator | Drag & Drop: Raumtypen aus der Palette ins Raumbuch, Zeilen sortieren, Stundensatz-Aufbau, Live-Anteile |
| Mindestlohn-Abstand | Cockpit/Tarif-Simulator zeigt den Abstand zum gesetzlichen Mindestlohn ab 2027 (14,60 €, laut Recherche, vor Einsatz prüfen) |
| E-Rechnung | Eigene Seite `/e-rechnung`: Prüfung der Pflichtangaben je Rechnung (USt-ID, IBAN, E-Mail, Adressen, Leitweg-ID), XRechnung 3.0 (UBL) und ZUGFeRD/Factur-X (EN 16931, PDF mit eingebettetem XML). **Weder KoSIT-Validator noch PDF/A-3 geprüft**, kein Versand über Peppol/Portal |
| Springer-Ablauf | Einsatzplan: „Ausfälle ersetzen“ schlägt je Lücke die beste Person vor (Springer zuerst, dann Kapazität und Kosten) und teilt mit einem Klick ein |
| Mängel-Reaktionszeit | Erste Reaktion wird festgehalten, Ø Reaktionszeit und unbeantwortete Mängel stehen in der Kennzahlenleiste |
| Rollen und Basismodus | Einstellungen: Inhaberin, Büro, Objektleitung und Basismodus blenden Bereiche in der Navigation aus. **Kein Zugriffsschutz** |
| Offline | Service Worker und Manifest (installierbar). Die Auslieferung ist geprüft, die Registrierung im Test-Browser nicht; bitte im echten Chrome prüfen. Offline-Anzeige in der Kopfleiste |
| XRechnung-Entwurf | Rechnungen: Button „XML“ erzeugt eine XRechnung (UBL 3.0-Syntax). **Nicht gegen den KoSIT-Validator geprüft**, Leitweg-ID noch nicht erfassbar |
| Zeitarten | Zeiten: Arbeit, Wegezeit zwischen Objekten, Rüstzeit (alle bezahlt), im CSV-Export |
| Datenschutz-Schalter | Einstellungen: Touren je Person auf der Karte sind standardmäßig aus |
| Porträts | Mitarbeitende und Inhaberin haben Porträtfotos (Unsplash, lokal in `static/people`, siehe `CREDITS.md`); andere Namen bekommen gezeichnete Figuren. Echte Personen auf Fotos stehen für **erfundene** Demo-Namen |
| Demodaten | Einstellungen → Demodaten: **entfernen** (leere App, Firmendaten und Kalkulation bleiben), Demo mit **8** oder **12** Mitarbeitenden laden (12: vier weitere Personen, vier zusätzliche Objekte mit Plänen, Abwesenheiten). Ersetzen ist nicht rückgängig zu machen, vorher JSON-Sicherung |
| Farbwelten | Einstellungen → Farbwelt: Sets Signalorange, Warnweste Gelb, Stahlblau, Petrolgrün oder eine eigene Akzentfarbe. Ein Set bündelt Akzent, Seitenleiste und Kopfbereich; Statusfarben bleiben. Gilt je Gerät, auch im dunklen Design |
| Rundgang | Begrüßungs-Rundgang in 7 Schritten (Heute, Firmendaten, Anfragen/Kunden, Kalkulation/Angebote, Einsatzplan/Team, Mitarbeiter-App, Abrechnen). Öffnet sich beim ersten Login von selbst, bleibt beim Seitenwechsel stehen (Knöpfe „Zu …“ springen zur Seite), ist jederzeit links unten unter „Rundgang“ erreichbar; Esc oder × beendet ihn. Gemerkt wird je Person in diesem Browser |
| Einstellungen | Firmendaten (Absender für PDFs, IBAN-Prüfung), Datensicherung als JSON (Export/Import) |
| Designsystem | Tokens, Komponenten, Zustände unter `/designsystem` |

## Nicht umgesetzt / Einschränkungen

- Kein Backend, keine Authentifizierung, keine Berechtigungen, keine Datenbank.
- Kein E-Mail-Versand, E-Rechnung nur als ungeprüfte Dateien (siehe oben). PDFs entstehen im Browser mit Standardschrift Helvetica.
- Absenderdaten in `src/lib/company.ts` sind Platzhalter (Demo).
- Feiertagskalender nur bundesweit (Landesfeiertage fehlen), Nachtzeit 23–6 Uhr ist eine Annahme. Keine GPS-Erfassung, bewusst.
- Tarifwerte, Leistungswerte, Ampelgrenzen und Standard-Vertragslaufzeiten sind Annahmen und Szenarien (Stand 02.11.2026), keine Rechtsauskunft. Mahn- und Briefvorlagen vor Einsatz rechtlich prüfen.
- Das Kundenportal ist eine Vorschau mit lokalen Daten: ohne Backend gibt es keinen Zugriffsschutz und keine öffentliche Erreichbarkeit.
- Noch offen: Leistungsnachweis/Arbeitsschein mit Unterschrift, zentrale Tarifparameter-Tabelle mit Gültigkeit, Plan-Editor mit Ruhezeit-Warnungen, mehrsprachige Mitarbeiteransicht, Dateiablage. Dialoge Einstellungen, CSV-Import, Einsatzzettel und Tagesbriefing sind bisher nur über Typprüfung und Build abgesichert, nicht per Browser-Test.
- Bewusst nicht gebaut (laut Recherche rechtlich heikel oder aufwändig): Dauer-GPS, Pflicht-Geofencing, personenbezogene Scores, eigene Lohnabrechnung, Bank-API.
- Playwright-Kernabläufe, Responsive- und Tastaturprüfung stehen aus. Getestet wurden bisher Rechen- und PDF-Logik (Vitest) sowie die Hauptabläufe manuell im Browser.

## Recherche und Konzept

- `docs/01-bestandsanalyse-und-konzept.md`: Analyse der bisherigen App, Stack, Informationsarchitektur, Plan
- `reports/Managementfunktionen Gebäudereinigung.md`: Pflichten, Tarif, Kalkulation, Markt
- `reports/Reinigungssoftware Praxisstimmen und Konkurrenz.md`: Praxisstimmen, Bewertungen, Konkurrenz (Quellenlage eingeschränkt)
- `reports/Software Wünsche Gebäudereinigung Nachrecherche.md` und `reports/Anforderungen Reinigungsfirmen Verwaltungssoftware.md`: Wünsche und Anforderungen (dünne Quellenlage, Anbieterangaben markiert)
- `reports/Konkurrenz Featurekatalog Reinigungssoftware.md`: Feature-Katalog mit Evidenz, Marktstandard/Differenzierer und Umsetzungsliste
- `research_notes/`: Rohnotizen der Recherchen mit Quellen
