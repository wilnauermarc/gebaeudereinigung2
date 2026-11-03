# Objektia – Bestandsanalyse und Konzept (Phase A)

Stand: 2026-11-02. Nur lesende Analyse, im Bestand wurde nichts verändert.

## 0. Was ich untersucht habe (und was nicht)

Der Ordner „Resch-Gebäude 3“ war leer. Der Bestand liegt in zwei Geschwisterordnern:

| | Ordner | Stand | Umfang |
|---|---|---|---|
| **V1** | `Resch-Gebaeude/Ohne Titel` | 25.10., 2 Git-Commits | ca. 11.600 Zeilen (Flask, Vue 3 + DaisyUI), 31 Benutzer, 66 Vorgänge, 10 Angebote, 7 Aufträge/Rechnungen, 9 Datenschutz-Dokumente, 8 Testmodule |
| **V2** | `Resch-Gebäude 2` | 02.11., kein Git | ca. 3.000 Zeilen (Flask, **Svelte 5** + DaisyUI), 4 Benutzer, 1 Vorgang, 15 Tests |

V2 ist ein bewusst verkleinerter Neuaufbau von V1 nach dem Prompt `docs/rebuild-prompt.md` in V1. **Dieser Prompt ist die beste fachliche Spezifikation, die es gibt.** Er wurde hier als Fachquelle verwendet.

Geprüft: Dokumentation, Datenbankschema, Routenliste, Auth-Code (Ausschnitte), Seed, Zeilenzahlen, Datenbankinhalt (nur Zählungen). Die 15 Tests von V2 liefen: 15 bestanden. Die Tests von V1 habe ich nicht ausgeführt.

**Nicht geprüft:** Ich habe die Oberfläche weder gestartet noch gesehen. Das Urteil zum Design stützt sich deshalb nur auf Stack und Code und ist vorläufig. Der Geschäftslogik-Code (V1 `services.py`, 2.142 Zeilen) ist von mir noch nicht Zeile für Zeile gelesen worden.

## 1. Funktionen und Architektur heute

**Es ist kein klassisches CRM, sondern ein prozessgeführtes Vorgangswerkzeug.** Kern ist ein „Vorgang“ (`cases`) in drei Typen: Kundenanfrage, Bewerbung, Beschwerde/Anliegen.

Ablauf einer Kundenanfrage (V1-Spezifikation, in V2 größtenteils umgesetzt):
Anfrage → angenommen? (Absage nur vermerkt) → Besichtigung ja/nein → Angebot ja/nein → finalisieren = „als gesendet vermerken“ → Rückmeldung → Auftrag (nur nach Annahme) → Startermin → Ausführung (Checkliste, Reklamation) → Projektzeitliste → Rechnung (+14 Tage, max. 2 Mahnstufen).

| Bereich | V2 | V1 | Bemerkung |
|---|---|---|---|
| Login, Sessions, CSRF, Rate-Limit, Bereiche | ✔ | ✔ | selbst gebaut |
| Vorgänge, Notizen, Entscheidung, Absage | ✔ | ✔ | |
| Angebote (2 Arten), Versionen, Finalisieren, PDF | ✔ | ✔ | siehe unten |
| Auftrag, Rechnung, Mahnung (PDF) | ✔ | ✔ | |
| Projektzeitliste, Excel-Export | ✔ | ✔ | Excel ohne Bewerbung/Beschwerde/Kalkulationsnotiz |
| Heute, Woche, Karte, Objektakte | ✔ (dünn) | ✔ | Seiten in V2 nur 20–50 Zeilen |
| Benutzer, Protokoll, Aufbewahrung/Löschung, Auskunft | ✔ | ✔ | V1 zusätzlich Löschjournal, `hold`/`replay` |
| Feature-Versionsschalter 1–5 | ✔ | ✔ | reine UI-Demo-Mechanik |
| E-Mail-Versand | ✘ | ✘ | bewusst nur „vermerken“ |

**Abweichungen zu Ihrer Aufgabenbeschreibung** (wichtig für die Planung):

1. **Keine Kundenverwaltung als eigene Entität.** Es gibt nur `contacts`, 1:1 an Vorgänge gehängt (V1: 66 Kontakte zu 66 Vorgängen). Eine Kundenhistorie über mehrere Vorgänge hinweg existiert nicht.
2. **Keine Objektverwaltung als Tabelle.** Objekte sind nur ein Textschlüssel (`object_key`) mit Adressfeldern am Vorgang.
3. **Der Angebotseditor hat keine Preispositionen.** Ein Angebot ist entweder Sonderreinigung (Stundenpreis + Aufwandstext + Leistungsliste) oder Unterhaltsreinigung (Monatspauschale + optional Anfangsstundenpreis + Leistungen mit Häufigkeit). Positionen haben nur Text und Häufigkeit, keine Menge oder Einzelpreise.
4. **Kein Dashboard im KPI-Sinn**, sondern „Heute im Blick“ (Termine, Tour, Als Nächstes).
5. Es gibt Bewerbungen und Beschwerden, die in Ihrer Liste fehlen.

**Datenhaltung:** SQLite (`data/app.db`), PDFs und Fotos im Dateisystem, Geldbeträge in Cents (gut). Schema über `CREATE TABLE IF NOT EXISTS`, keine Migrationen. Das Schema hat saubere Fremdschlüssel und CHECK-Constraints.

## 2. Stärken und Schwächen

**Stärken (erhalten):**
- Fachlich durchdachter Prozess mit klaren Regeln (Auftrag nur nach Annahme, Mahnstufen, Cents).
- Datenschutz-Ansatz ist ernsthaft: Bereichstrennung mit 404 statt „verboten“, Protokoll ohne Freitext, Löschvorschau, Auskunft nach Prüfung. Das ist Alleinstellungsmerkmal und wird übernommen.
- Gute Testidee (Berechtigungs- und Leaktests).

**Schwächen, nach Gewicht:**

| # | Schwäche | Folge |
|---|---|---|
| 1 | **Zwei Codebasen mit unklarem Status.** V2 hat nur etwa ein Viertel der Logik von V1, kein Git. | Gefahr, Funktionen zu verlieren oder doppelt zu pflegen. |
| 2 | **Fehlendes Domänenmodell** (kein Kunde, kein Objekt als Entität). | Keine Kundenhistorie, keine Objektakte mit echtem Bezug, doppelte Stammdaten. |
| 3 | **Sicherheitskritischer Code selbst gebaut** (Sessions, CSRF, Rate-Limit). | Fehleranfällig, Ihre Vorgabe lautet: bewährte Bibliotheken. |
| 4 | **Monolithische Dateien** (V2 `api.py` 879 Zeilen, V1 `services.py` 2.142 Zeilen, `style.css` 1.780 Zeilen). | Schlecht wartbar und testbar. |
| 5 | **Keine Migrationen, kein Docker, kein Build-Standard**, Frontend-Build wird ins Flask-Verzeichnis kopiert. | Nicht reproduzierbar deploybar. |
| 6 | **Anmeldung über Pulldown aller Benutzer**, öffentlich abrufbar (`/api/login-choices`). | Benutzerliste ist ohne Anmeldung einsehbar. Für ein 2-Personen-Büro bequem, für Produktion nicht ideal. |
| 7 | **Feature-Versionen 1–5** als Oberflächenschalter. | Zusätzliche Komplexität ohne Geschäftswert. |
| 8 | **Design (vorläufig, ungeprüft):** DaisyUI-Standardkomponenten, Hash-Router, sehr dünne Seiten in V2. | Wird nach Start der Anwendung nachgeprüft. |
| 9 | Demo-Passwort `demo-passwort-1` als Standard in `seed.py` (V2). | Nur Demo, aber sollte nicht im Code stehen. |

## 3. Empfehlung: Stack und Vorgehen

**Entscheidung: Neubau auf SvelteKit, fachliche Regeln werden portiert, nicht der Code.**

Begründung: Das Frontend ist nur ca. 1.000 Zeilen dünn und wird ohnehin neu entworfen. Das Backend ist Python, Ihr Zielstack durchgängig TypeScript. Eine Mischung (Flask-API hinter SvelteKit) würde zwei Laufzeiten, zwei Validierungsschichten und doppelte Typen bedeuten. Der Gewinn der Wiederverwendung ist gering, weil die Substanz in den **Regeln und Tests** liegt, und die lassen sich als Spezifikation übertragen (die V1-Tests werden zu Vitest-Tests).

| Baustein | Empfehlung | Anmerkung |
|---|---|---|
| Framework | SvelteKit (Svelte 5), TypeScript strict, `adapter-node` | wie von Ihnen gewünscht |
| UI | Tailwind 4, shadcn-svelte, Lucide | |
| Datenbank | **PostgreSQL + Drizzle** | siehe Rückfrage unten; die vorhandenen Daten sind nach meinem Stand Demodaten, die Migration ist daher billig |
| Validierung | Zod, geteilt zwischen Formular und Server | |
| Auth | bewährte Bibliothek (z. B. Better Auth) statt Eigenbau, Argon2id | Auswahl vor Phase C kurz verifizieren |
| PDF | serverseitig in Node (z. B. pdfmake oder PDFKit) | ersetzt reportlab, Layout muss neu gebaut werden |
| Excel | exceljs | ersetzt openpyxl |
| Tests | Vitest (Geschäftslogik), Playwright (Kernabläufe) | |
| Betrieb | Dockerfile + Compose (App, Postgres), `.env` | Backup per `pg_dump`, Restore-Skript |

Bewusst **nicht**: Microservices, GraphQL, eigene Abstraktionsschichten über Drizzle, Feature-Flags.

## 4. Informationsarchitektur 2.0

Sidebar (einklappbar, `⌘K` Befehlspalette), nach Aufgaben gegliedert:

```
Heute                 Dashboard: Kennzahlen, fällige Wiedervorlagen, Termine, zuletzt bearbeitet
Posteingang?          (optional: neue Anfragen ohne Bearbeiter)

ARBEIT
  Vorgänge            Pipeline (Liste + Kanban): Anfrage → Besichtigung → Angebot → Auftrag → Ausführung → Rechnung
  Kunden              NEU als Entität: Liste, Detail mit Kontakten, Objekten, Historie, Dokumenten
  Objekte             NEU als Entität: Adresse, Zugang, Notizen, Reklamationen, Material, Karte
  Angebote            Liste + Editor (Sonder-/Unterhaltsreinigung), PDF-Vorschau
  Aufträge            laufende/wiederkehrende, Projektzeitliste (Excel)
  Rechnungen          offen / überfällig / bezahlt, Mahnstufen
  Kalender            Woche (Besichtigung/Start), Konflikterkennung, Tour

PERSONAL
  Bewerbungen
  Anliegen            Beschwerden / sonstige

VERWALTUNG
  Benutzer & Bereiche · Protokoll · Aufbewahrung · Auskunft · Monatsabschluss
```

Prinzipien: Ein Vorgang bleibt der rote Faden, aber Kunde und Objekt werden eigenständige Seiten mit Verknüpfung. Der Prozessstand steht als Schrittleiste im Vorgang, die nächste sinnvolle Aktion ist immer der primäre Button. Bereiche (Anfragen, Bewerbungen, Anliegen, Admin) steuern, was in der Sidebar erscheint und serverseitig erreichbar ist.

## 5. Designkonzept

- **Haltung:** ruhig, hell, dicht aber luftig, wie Linear/Attio. Die Oberfläche tritt zurück, die Daten stehen vorne.
- **Farbe:** neutrale kühle Graustufen (Zinc/Slate) als Basis, **eine** Akzentfarbe (Vorschlag: gedämpftes Petrol/Tiefblau, passend zum „Schieferblau“ der V1-Vorgabe, bewusst kein AI-Lila). Semantische Farben nur für Status: neutral, Info, Erfolg, Warnung, Kritisch. Wird nach Ihren Referenz-Screenshots angepasst.
- **Typografie:** Inter (lokal gebündelt, kein CDN) mit tabellarischen Ziffern für Beträge; Skala 12/13/14/16/20/28; Überschriften mit `font-medium`, nicht fett.
- **Raster:** 4-px-Basis, Seitenränder 24/32, Tabellenzeilen 40 px (kompakt 32), Radius 6/8, Ränder 1 px statt Schatten; Schatten nur für Popover und Dialoge.
- **Komponenten:** Tabellen mit Sortierung, Filter-Chips, Spaltenwahl und Sticky-Header; Detailansichten als rechtes Seitenpanel oder volle Seite; Status als Punkt plus Text; Skeletons statt Spinner; erklärende Empty States mit einer Aktion; Fehlerzustände mit Handlungsempfehlung; Toasts mit „Rückgängig“; destruktive Aktionen mit Dialog, der die Folge benennt.
- **Interaktion:** vollständig per Tastatur (`⌘K`, `G` dann `K` für Kunden, `N` für neu), sichtbarer Fokus, Formulare mit Inline-Validierung und Auto-Speichern-Hinweis („Entwurf gespeichert“), damit nie Eingaben verloren gehen.
- **Deutsch:** `Intl` mit `de-DE`, Europe/Berlin, `1.234,56 €`, Datum `02.11.2026`.
- Dark Mode wird über Design-Tokens vorbereitet, aber erst nach den Kernflächen umgesetzt.

## 6. Priorisierter Implementierungsplan

| Phase | Inhalt | Ergebnis |
|---|---|---|
| **B1** | Designsystem-Tokens, Shell (Sidebar, ⌘K, Toasts), Demo-Daten klar als „Demo“ markiert | Klickbarer Prototyp: **Dashboard**, **Kunden + Kundendetail**, **Angebotseditor** |
| **B2** | Beurteilung durch Sie, Korrekturrunde | Freigabe des Designs |
| **C1** | Postgres/Drizzle-Schema (inkl. neue Entitäten Kunde/Objekt), Auth + Bereiche, Docker | Lauffähiges Fundament, Tests für Rechte |
| **C2** | Vorgänge + Prozessregeln, Angebote + PDF | Kernprozess Anfrage → Angebot |
| **C3** | Aufträge, Rechnungen, Mahnung, Excel, Kalender, Tour | Prozess vollständig |
| **C4** | Protokoll, Aufbewahrung, Auskunft, Hold/Replay-Äquivalent | Datenschutzfunktionen |
| **D** | Datenübernahme nur falls echte Daten existieren: Dry-Run, Backup, Validierungsbericht | Erst nach Ihrer Freigabe |
| **E** | Playwright-Kernabläufe, Responsive-/Tastatur-/Sicherheitsprüfung, Testprotokoll | Dokumentierte Ergebnisse |

Nach Ihrer Rückmeldung zu den Fragen unten beginne ich mit **B1**.

## 7. Rückfragen, die Fachlichkeit und Datenintegrität betreffen

1. **Welcher Ordner ist maßgeblich?** Ich gehe von V1 als Funktionsumfang und V2 als jüngstem Stand aus. Falls V1 echte Funktionen hat, die Sie behalten wollen, die in V2 fehlen (Karte, Tour, Fotos, Verbrauch, Katalog, Nachfassen), bitte benennen.
2. **Sind die Daten in beiden Datenbanken reine Demodaten?** Alles deutet darauf hin (`example.com`, Seed). Falls es echte Kunden gibt, wird Phase D relevant.
3. **Angebotseditor:** Soll er die bestehenden zwei Angebotsarten abbilden (Bestand), oder zusätzlich Positionen mit Menge und Einzelpreis bekommen (Erweiterung mit neuen Geschäftsregeln, etwa Umsatzsteuer)?
4. **Kunde und Objekt als eigene Entitäten** (siehe Abschnitt 1): bitte bestätigen, das ist eine fachliche Neuerung.
5. **Datenbank:** PostgreSQL wie gewünscht? Für eine Firma mit wenigen Nutzern wäre SQLite einfacher zu betreiben und zu sichern. Ich folge Ihrer Präferenz, wenn Sie nichts anderes sagen.
6. **Referenz-Screenshots** der Finanzanwendung bitte bereitstellen, bevor ich Palette und Komponentenstil festlege.
7. **Betrieb:** Wo soll der Docker-Container laufen (eigener Server, Hoster, nur lokal)? Beeinflusst HTTPS, Backup und Anmeldung.
