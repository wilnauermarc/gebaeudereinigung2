# Moderne UX- und Produktivitätsmuster aus B2B-SaaS, übertragbar auf eine Reinigungs-Verwaltungs-App (Svelte)

Stand: 03.11.2026. Aufwand = Aufwand in unserer Svelte-App (klein/mittel/groß). Quellenlage: Nur Seiten, die ich tatsächlich abgerufen oder in Suchergebnissen gesehen habe, sind zitiert. Beschreibungen sind teils als "Suchsnippet" oder "Drittquelle" markiert. Alle Aufwandsangaben und Reiniger-Nutzen sind meine Einschätzung (siehe Inferences).

## 1. Navigation und Tempo (Befehlspalette, Kürzel, Schnellerfassung, Undo, Autospeichern, Offline)

### Takeaway
Befehlspalette (Cmd/Ctrl+K), "G dann I"-Navigationskürzel, "?"-Hilfe und Undo-Send sind bei Linear und Superhuman belegt. Natürlichsprachliche Eingabe mit Live-Hervorhebung ist bei Todoist sauber dokumentiert und liefert die Vorlage für "Aylin gestern Praxis 19-21". PWA/Offline ist über MDN belegt.

### Cited Findings
- Linear: Cmd/Ctrl+K öffnet das Command Menu, "open pages or run actions without leaving your keyboard"; "/" sucht Issues/Projekte nach Kennung (z. B. LIN-123); "G dann I" = Inbox, "G dann M" = My Issues, "?" zeigt alle Kürzel — [Linear Enablement](https://linear.app/enablement/guide/navigating-linear)
- Linear: Shortcut-Hilfe wurde durchsuchbar gemacht (Changelog 2021) — [Linear Changelog](https://linear.app/changelog/2021-03-25-keyboard-shortcuts-help) (nur Suchsnippet gesehen)
- Superhuman: "Superhuman Command" – wer ein Kürzel nicht kennt, tippt, was er will; jede Aktion hat ein Kürzel; "Undo" nach Senden: "will never have sent"; "Remind Me" = Snooze bis zu passender Zeit — [Superhuman Blog](https://blog.superhuman.com/the-fastest-email-experience-ever-made/)
- Superhuman: Snooze kann so gesetzt werden, dass er nur bei "keine Antwort" auslöst — [Efficient.app Review](https://efficient.app/blog/superhuman-email-app-worth-it) (Drittquelle)
- Todoist Quick Add: erkennt "tomorrow at 16:00", "Fri 7pm", "in 5 days", "tom morning" (=9 Uhr), wiederkehrend "every 3rd Tuesday starting Aug 29"; erkannte Datumsangaben werden beim Tippen hervorgehoben; Fehlerkennung (z. B. "monthly" in "Create monthly report") lässt sich per Klick zurücknehmen, Erkennung ist abschaltbar; "1300" ohne Doppelpunkt wird nicht erkannt — [Todoist Help](https://todoist.com/help/articles/205325931-Due-dates-and-times)
- Jobber: Mitarbeiter können Zeiteintrag ohne Timer über ein "Quick create"-Menü in der App anlegen; Admins können Einträge im Web (Timesheets) für Teammitglieder hinzufügen/bearbeiten; Timer können für andere gestartet werden — [Jobber Help](https://help.getjobber.com/en/articles/timesheets/) (Suchsnippet)
- PWA: installierbar, offline nutzbar, Cache API für Offline-Assets — [MDN PWA](https://developer.mozilla.org/en-US/Apps)

### Inferences
- Eine Quick-Add-Zeile "Aylin gestern Praxis 19-21" ist mit einem kleinen Regel-Parser (Mitarbeitername aus Stammdaten, Objekt per Fuzzy-Match, Zeitraum per Regex, Datumswörter DE) machbar; Todoists Muster "Treffer hervorheben + per Klick verwerfen" ist der Schlüssel gegen Fehlinterpretation.
- Palette als Liste registrierter Aktionen (Name, Kürzel, Handler) ist in Svelte klein bis mittel; Offline-Schreiben mit Sync ist groß, reines Installieren/Caching klein.

### Gaps
- Superhuman-Mechanik "100-ms-Regel" nicht belegt (Seite erwähnt sie nicht).
- Autospeichern/Undo-Toast als generisches Muster: keine eigene Primärquelle gefunden (nur Superhuman Undo Send).
- Offizielle Linear-Shortcut-Doku und web.dev-PWA-Seiten nicht abgerufen.

## 2. Arbeitsorganisation (Inbox/Triage, Views, Layout-Wechsel, Bulk, Snooze, Mein Tag)

### Takeaway
Gespeicherte Ansichten mit "Aktueller Benutzer"-Filter (Attio), mehrere Layouts über denselben Datenbestand (Notion), Split-Inbox und Snooze (Superhuman) und Bulk-Aktionen aus Views (Zendesk) sind gut belegt und für Auftrags-/Objektlisten direkt übertragbar.

### Cited Findings
- Attio: Filter/Sortierung pro View gespeichert; "Save for everyone" oder "Save as new view"; ungespeicherte Änderungen verfallen beim nächsten Laden; Filter "Current user" für Owner/Assignee, damit eine View für jeden Kollegen funktioniert; mehrere Sortierungen per Drag in Reihenfolge; verschachtelte And/Or-Gruppen — [Attio Help](https://attio.com/help/reference/managing-your-data/views/filter-and-sort-views)
- Attio Kanban: Gruppierung nur nach Status-Attributen; Sortierung nach Zeit in Stufe möglich — [Attio Kanban](https://attio.com/help/reference/managing-your-data/views/create-and-manage-kanban-views) (Suchsnippet)
- Notion: derselbe Datenbestand als Table, Board, Calendar, Timeline, Gallery (u. a.), je View eigene Filter/Sortierungen; Seiten öffnen als Side-Peek — [Notion Help](https://notion.com/help/views-filters-and-sorts) (Suchsnippet)
- Linear: Sidebar trennt Inbox ("updates that need your attention"), My Issues, Team-Triage-Queue, Favorites — [Linear Enablement](https://linear.app/enablement/guide/navigating-linear)
- Superhuman: Split Inbox trennt Team, VIPs, Tools; Aktivierung über Cmd+K — [Superhuman Blog](https://blog.superhuman.com/the-fastest-email-experience-ever-made/), [Superhuman Help](https://help.superhuman.com/article/441-splits)
- Zendesk: Bulk-Aktion aus einer View heraus, laut Drittguide max. 100 Tickets pro Operation, geschlossene nicht bulk-änderbar — [eesel Guide](https://www.eesel.ai/blog/zendesk-bulk-apply-macro-to-tickets) (Drittquelle, nicht offiziell geprüft)
- Pipedrive: Aktivitäts-Erinnerungen konfigurierbar, optional in tägliche Zusammenfassungs-Mail; Praxisbericht: starre "idle > 7 Tage"-Regeln erzeugen schnell Alarm-Rauschen — [Guideflow](https://www.guideflow.com/tutorial/how-to-get-reminders-for-upcoming-activities-in-pipedrive), [Cotera](https://cotera.co/articles/pipedrive-workflow-automation-guide) (beides Drittquellen)
- ServiceTitan: Dispatch-Board mit Drag&Drop; "Jobs Tray" mit Tab "Unassigned", Job per Drag oder Click-to-drop auf Techniker-Zeitleiste; Zuweisung auch per Dropdown — [ServiceTitan Help](https://help.servicetitan.com/docs/use-the-daily-dispatch-board), [Release Hub](https://help.servicetitan.com/release-hub/docs/move-the-jobs-tray-onto-the-dispatch-board-to-speed-up-scheduling)
- Monday.com: kein Bulk-Edit von Automationen, Workaround Bedingungen konsolidieren — [monday Community](https://community.monday.com/t/update-multiple-similar-automations-in-one-go/123105)

### Inferences
- "Mein Tag" für Reiniger-Büro = vorgespeicherte View "Meine heute fälligen Einsätze/Aufgaben" via Current-user-Filter; sehr kleiner Aufwand, wenn Listen bereits Filter haben.
- "Nicht zugewiesene Einsätze"-Tray (ServiceTitan) passt 1:1 auf Vertretungsplanung bei Krankmeldung.
- Pipedrive-Warnung: Erinnerungsregeln mit sinnvollen Schwellen/Opt-out bauen, sonst Alarmmüdigkeit.

### Gaps
- Linear Triage-Mechanik (Accept/Decline/Snooze) nicht im abgerufenen Text; Height nicht recherchiert (Produkt laut meiner Kenntnis eingestellt, nicht belegt); Airtable/Monday/Asana Views nicht im Detail geprüft; Inline-Tabellenbearbeitung und Spaltenkonfiguration ohne eigene Quelle.

## 3. Zusammenarbeit (Kommentare, @Mentions, Aktivität, Rechte)

### Takeaway
Front liefert das belegte Muster interner Kommentare mit @Mention direkt am Vorgang, inklusive Benachrichtigungsfächern "Mentions/Subscribed" und Einladung externer Gäste. Rechte-Granularität ist bei Front (Kommentar-Berechtigung) und Lexware (vorige Recherche) belegt.

### Cited Findings
- Front: @ im Kommentar benennt Kollegen; Vorschlag der 5 meistgenannten; Konversation erscheint in "Mentions" und "Subscribed"; Kommentare erfordern Berechtigung "Send comments"; @all wirkt nur auf Personen mit Zugriff; externe Gäste per @Mention einladbar mit Bestätigungsdialog; eigene Gruppen wie @managers per Regel — [Front Help](https://help.front.com/t/k924vw)
- Front: Kommentare sind intern und nie beim Kunden sichtbar — [Macha-Blog](https://www.getmacha.com/blog/front-comments-and-mentions-explained) (Drittquelle)
- Asana Regel-Aktivitätslog zur Prüfung, wann Regeln gefeuert haben — [TemperStack](https://www.temperstack.com/learn/asana/build-automation-rules/) (Drittquelle)

### Inferences
- Für ein kleines Büro reicht "Notizen mit @Name" pro Kunde/Objekt/Einsatz plus Verlauf; Echtzeit-Zusammenarbeit ist für 2–5 Büronutzer verzichtbar (keine Quelle, Einschätzung).

### Gaps
- Intercom, HubSpot, Notion-Kommentare und Echtzeit-Präsenz nicht belegt; Share-by-Link-Mechanik nicht recherchiert (Angebot-per-Link siehe vorherige Recherche).

## 4. Automatisierung und Integration

### Takeaway
Das Regelmuster Wenn (Trigger) → Falls (Bedingung) → Dann (Aktion) ist bei Front und Asana belegt; Tags können Regeln verketten. Airtable zeigt gute und schlechte Seiten von CSV-Spalten-Mapping.

### Cited Findings
- Front: Regeln als Trigger-Bedingung-Aktion; Aktionen u. a. zuweisen, verschieben, taggen, Entwurf, SLA; Regeln auch durch Kommentare auslösbar; Tag-Verkettung — [Macha Glossar/Review](https://www.getmacha.com/blog/front-shared-inbox-explained) (Drittquelle; Planlimits widersprüchlich in Quellen)
- Asana: Regeln im Reiter "Rules" pro Projekt, bulk-Auslösen im Portfolio-Grid (April 2026) — [Asana Release Notes](https://forum.asana.com/t/asana-release-notes-april-2026/1138067/1)
- Airtable CSV-Import: Zielfeld je CSV-Spalte wählen, gleichnamige Spalten automatisch zugeordnet, Mapping-Merken laut Doku vorhanden aber laut Nutzern unzuverlässig, 25.000 Zeilen Limit — [Airtable Community](https://community.airtable.com/t/csv-import-block-fixing-field-mappings/30704) (Nutzerberichte)
- Lexware: CSV nur mit exakten Überschriften, Fehlerdatei per Mail (vorherige Recherche, Gegenbeispiel zu gutem Mapping) — [Lexware Help](https://help.lexware.de/de-form/articles/548267-anleitung-zum-import-von-kontakten-kunden-und-lieferanten)

### Inferences
- Minimalistischer Regel-Baukasten mit 5–6 festen Triggern (Einsatz abgesagt, Rechnung 14 Tage überfällig, neuer Kunde) und 3 Aktionen (Aufgabe, Benachrichtigung, Status) deckt 90 % ab; Rauschen vermeiden (siehe Pipedrive).
- Import-Assistent mit Vorschau der ersten 5 Zeilen, Auto-Mapping nach Spaltennamen und gespeichertem Mapping schlägt Lexware-Starrheit.

### Gaps
- Webhooks, E-Mail-an-Ticket, ICS/Google/Outlook-Sync, WhatsApp Business: keine Primärquellen in dieser Runde gefunden (nicht abgerufen). HubSpot/Pipedrive-Offizialhilfe nicht erreicht.

## 5. Dashboards und Berichte

### Takeaway
Stripe liefert das belegte Muster "Bericht planen: täglich/wöchentlich/monatlich, Spalten wählen, Mail-Benachrichtigung zum Abholen" sowie Standardzeitraum Vormonat.

### Cited Findings
- Stripe: Berichte laden standardmäßig mit Vormonat; Zeitraum inklusiv; Zeitzonen-Umschalter — [Stripe Docs](https://docs.stripe.com/reports/scheduled-reports)
- Stripe: Berichte planen (täglich/wöchentlich/monatlich), Spalten wählen, E-Mail-Benachrichtigung, Abschalten durch "None" — [Stripe Docs](https://docs.stripe.com/reports/scheduled-reports)
- Pipedrive: Aktivitätsziele als Funktion — [Pipedrive Features](https://www.pipedrive.com/en/features/activities-goals) (nur Titel gesehen, Inhalt nicht geprüft)

### Inferences
- Monatsbericht für Steuerberater (Umsatz, Stunden) als geplante Mail/PDF ist kleiner Aufwand, wenn ein Mailversand existiert, sonst mittel.
- "Morning Briefing" (heutige Einsätze, Abwesenheiten, überfällige Rechnungen) ist eine reine Zusammenfassung existierender Daten, klein.

### Gaps
- Vorperioden-Vergleich, Anomalie-Hinweise, OKR-Ringe, HubSpot-Dashboards: keine Quellen abgerufen.

## 6. Onboarding und Hilfe

### Takeaway
In dieser Runde keine belegten Primärquellen gefunden.

### Cited Findings
- Linear: "?" öffnet Kürzelübersicht als eingebaute Hilfe — [Linear Enablement](https://linear.app/enablement/guide/navigating-linear)

### Inferences
- Beispieldaten, Checkliste, Leer-Zustände mit Aktion sind Standard, aber hier nicht belegt; Aufwand klein.

### Gaps
- Checklisten, Touren, Changelog "Neu in der App" (z. B. Linear Changelog, Intercom Product Tours) nicht recherchiert.

## 7. Barrierefreiheit und Nicht-Techniker

### Takeaway
WCAG 2.2 verlangt mindestens 24x24 CSS-px Zielgröße (AA) mit Ausnahmen; 44x44 gilt als AAA. Für ältere/nicht-technische Nutzer sind 44+ px sinnvoll.

### Cited Findings
- WCAG 2.5.8 AA: Ziele mindestens 24x24 CSS-px, Ausnahmen Abstand, Inline, Äquivalent, Browser-Kontrolle, Essenziell; AAA 2.5.5: 44x44 — [W3C Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- Todoist: Smart-Erkennung abschaltbar, Fehltreffer per Klick rücknehmbar (Fehlertoleranz) — [Todoist Help](https://todoist.com/help/articles/205325931-Due-dates-and-times)
- Superhuman: Undo statt Bestätigungsdialog — [Superhuman Blog](https://blog.superhuman.com/the-fastest-email-experience-ever-made/)

### Inferences
- Undo-Toast ersetzt "Wirklich löschen?"-Dialoge, senkt Fehlerangst bei Nicht-Technikern.

### Gaps
- Einfache-Sprache-Richtlinien nicht recherchiert.

---

## Feature-Katalog (Tabelle)

| Feature | Produkt | Beleg-URL | Beschreibung | Nutzen für Reiniger-Büro | Aufwand |
|---|---|---|---|---|---|
| Befehlspalette mit Aktionen (Cmd/Ctrl+K) | Linear, Superhuman | https://linear.app/enablement/guide/navigating-linear ; https://blog.superhuman.com/the-fastest-email-experience-ever-made/ | Aktionen und Seiten per Tippen auffindbar, auch ohne Kürzel | "Neuer Einsatz", "Zu Kunde X", "Rechnung erstellen" ohne Menüsuche | klein-mittel |
| Navigationskürzel "G dann X" + "?" Hilfe | Linear | https://linear.app/enablement/guide/navigating-linear | Zweitastenfolgen, durchsuchbare Kürzelübersicht | Schneller für Vielnutzer im Büro | klein |
| Globale Suche mit Kennung ("/") | Linear | https://linear.app/enablement/guide/navigating-linear | Springt per Nummer zum Vorgang | Rechnungsnr./Auftragsnr. direkt öffnen | klein |
| Quick Add mit natürlicher Sprache und Live-Hervorhebung | Todoist | https://todoist.com/help/articles/205325931-Due-dates-and-times | Erkennt Datum/Zeit im Text, hebt hervor, per Klick verwerfbar | "Aylin gestern Praxis 19-21" erzeugt Stundeneintrag | mittel |
| Zeiteintrag per Quick-create ohne Timer; Admin trägt für andere nach | Jobber | https://help.getjobber.com/en/articles/timesheets/ | Manueller Eintrag mit Job, Datum, Start/Ende | Nachtragen vergessener Stunden | klein |
| Undo statt Bestätigungsdialog | Superhuman | https://blog.superhuman.com/the-fastest-email-experience-ever-made/ | Aktion sofort, "Rückgängig" im Toast | Fehlertoleranz, weniger Dialoge | klein-mittel |
| Gespeicherte Views (für alle / als neue / verwerfen) | Attio | https://attio.com/help/reference/managing-your-data/views/filter-and-sort-views | Filter+Sort je View, ungespeichert verfällt | "Offene Rechnungen", "Objekte Nord" | mittel |
| Filter "Aktueller Benutzer" | Attio | https://attio.com/help/reference/managing-your-data/views/filter-and-sort-views | Eine View für jeden Kollegen | "Meine Einsätze heute" / Mein Tag | klein |
| Mehrere Layouts über denselben Datenbestand | Notion, Attio | https://notion.com/help/views-filters-and-sorts | Tabelle, Board, Kalender, Timeline umschaltbar | Einsätze als Woche-Kalender, Angebote als Kanban | mittel-groß |
| Side-Peek (Detail rechts statt Seitenwechsel) | Notion | https://notion.com/help/views-filters-and-sorts | Datensatz öffnet seitlich | Listenkontext bleibt erhalten | mittel |
| Inbox mit Aufmerksamkeitsfach + Triage-Queue | Linear | https://linear.app/enablement/guide/navigating-linear | Updates, die Aufmerksamkeit brauchen | Kundenanfragen, Krankmeldungen, Reklamationen sichten | mittel |
| Split Inbox | Superhuman | https://help.superhuman.com/article/441-splits | Eingang in Segmente aufgeteilt | Eingang nach Typ (Anfrage, Beschwerde, Rechnung) | mittel |
| Snooze / Wiedervorlage ("Remind Me", nur wenn keine Antwort) | Superhuman | https://blog.superhuman.com/the-fastest-email-experience-ever-made/ ; https://efficient.app/blog/superhuman-email-app-worth-it | Vorgang verschwindet bis Datum | Angebot nach 7 Tagen nachfassen | klein |
| Bulk-Aktion aus View | Zendesk | https://www.eesel.ai/blog/zendesk-bulk-apply-macro-to-tickets | Mehrfachauswahl, Makro anwenden (Limit 100) | Mehrere Rechnungen mahnen/versenden | mittel |
| Dispatch-Board mit "Unassigned"-Tray, Drag oder Click-to-drop | ServiceTitan | https://help.servicetitan.com/docs/use-the-daily-dispatch-board | Offene Jobs auf Mitarbeiter-Zeitleiste ziehen | Vertretung planen bei Ausfall | groß |
| Kommentare mit @Mention am Vorgang | Front | https://help.front.com/t/k924vw | Interne Notiz, Mentions-/Subscribed-Fach | Absprachen am Kunden/Einsatz statt WhatsApp | mittel |
| Regel-Baukasten Wenn-Falls-Dann | Front, Asana | https://www.getmacha.com/blog/front-shared-inbox-explained ; https://forum.asana.com/t/asana-release-notes-april-2026/1138067/1 | Trigger → Bedingung → Aktion | Automatische Aufgabe bei Absage/Überfälligkeit | mittel-groß |
| Reminder mit Tagesmail-Option, Schwellen-Vorsicht | Pipedrive | https://www.guideflow.com/tutorial/how-to-get-reminders-for-upcoming-activities-in-pipedrive | Erinnerung vorab, in Tageszusammenfassung | Morning Briefing | klein-mittel |
| CSV-Import mit Spalten-Mapping | Airtable | https://community.airtable.com/t/csv-import-block-fixing-field-mappings/30704 | Zielfeld je Spalte, Auto-Match | Kundenübernahme aus Excel | mittel |
| Geplante Berichte per Mail | Stripe | https://docs.stripe.com/reports/scheduled-reports | Tägl./wöchentl./monatl., Spalten wählbar | Monatsreport an Chefin/Steuerberater | mittel |
| Standardzeitraum Vormonat + Zeitraumwahl | Stripe | https://docs.stripe.com/reports/scheduled-reports | Vorbelegt, inklusive Enddatum | Abrechnungsreports | klein |
| PWA (installierbar, Offline-Cache) | Web-Standard | https://developer.mozilla.org/en-US/Apps | Manifest + Service Worker | Mitarbeiter-App ohne Store, Keller ohne Netz | klein (Install) / groß (Offline-Schreiben) |
| Zielgrößen 24px min., besser 44px | WCAG 2.2 | https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | Mindestgröße Touch/Click | Bedienbar für Reinigungskräfte mit Handschuhen/Handy | klein |

## Top-10 (größter Eindruck bei kleinem Aufwand) – meine Einschätzung
1. Befehlspalette Cmd+K mit Aktionen (Linear/Superhuman)
2. Quick-Add-Zeile mit Live-Hervorhebung (Todoist-Muster)
3. Undo-Toast statt Bestätigungsdialogen (Superhuman)
4. "Mein Tag"-View via Filter "Aktueller Benutzer" (Attio)
5. Gespeicherte Views mit "Als neue speichern" (Attio)
6. Snooze/Wiedervorlage an Angeboten und Rechnungen (Superhuman)
7. "?"-Kürzelübersicht + G-dann-X-Navigation (Linear)
8. Morning Briefing / Tagesmail (Pipedrive-Muster)
9. Geplanter Monatsbericht per Mail (Stripe)
10. Große Touch-Ziele (44px) + PWA-Installation (WCAG/MDN)

## Gesamt-Lücken
Nicht belegt: HubSpot, Intercom, Height, Airtable-Interfaces, Monday-Views, Echtzeit-Zusammenarbeit, Webhooks, E-Mail-an-Ticket, Kalender-Sync, WhatsApp, Onboarding-Checklisten/Touren/Changelog, Anomalie-Hinweise, OKR-Ringe. Mehrere Quellen sind Suchsnippets oder Drittanbieter-Blogs, nicht Primärdokumentation. Airtable-Doku (support.airtable.com) lieferte 404.
