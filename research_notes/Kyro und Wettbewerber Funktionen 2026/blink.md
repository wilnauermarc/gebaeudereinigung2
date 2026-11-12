# Blink (blink.de, Blink GmbH Nürnberg) – Funktionen und Umsetzung

Quellenlage: fast alles Herstellerangaben (blink.de, doku.blink.de = Confluence/Scroll Sites). Doku-Aussagen zu konkreten Einstellungen sind belastbarer als Marketingseiten. Unabhängige Belege: kaum. Stand Abruf: 2026-11-12. Die Doku-Seiten wurden per Abruf-Tool zusammengefasst, Wortlaut kann leicht gekürzt sein.

## 1. Konkrete Abläufe und Bildschirme laut Dokumentation

### Takeaway
Blink ist im Kern ein Zeiterfassungs-, Einsatzplanungs- und Kommunikationssystem (Blink Time/Manager/me, Add-ons Plan, Active, Check) mit Tickets, Formularen, Dokumenten und Kundenportal. Es ist kein ERP, keine Rechnungs- oder Angebotssoftware im Doku-Sinn (die Marketingseite nennt Angebote/Rechnungen, die Doku hat dazu keine Seite). Die Doku ist tief bei Zeit, Plan, Alarme, Export.

### Cited Findings

**Produktstruktur**
- Doku-Gliederung: Apps (Blink Manager = Verwaltung/Zeit, Blink me = Mitarbeiter-App), Funktionen (Tickets, Formulare, Dokumente, Kundenportal, Arbeitsscheine, Blinky KI, Chat, Sticker), Schnittstellen (zvoove, Business Central/Navision, BlueTem, mytutorial, Schulungstool, Sarikohn, Univado, ToolSense, e-QSS) — [doku.blink.de](https://doku.blink.de)
- Blink-Manager-Doku: 32 Seiten, u. a. Abrechnungsexport, Abwesenheiten, Alarme, Automatische Zeiterfassung, Befristungen, Berechtigungen, Bereiche, Berichtsvorlagen, Dienstausweis, Dienstplanung, Excelimport, GPS, Kontrollvorgaben, Leistungsarten, Pausen, Qualifikationen, Schichtplanung (Blink Plan), Tags, Terminals, Zeiten auf-/abrunden, Zuschläge — [Index](https://doku.blink.de/blink-manager/dokumentation)
- Modulnamen: Tickets/Formulare/Chat gehören zu "Blink Active" bzw. "Blink Check"; Blink Plan und Abrechnungsexport sind kostenpflichtige Add-ons — [Chat](https://doku.blink.de/blink-me/chat-feature), [Plan](https://doku.blink.de/blink-manager/schichtplanung-blink-plan), [Export](https://doku.blink.de/blink-manager/abrechnungsexport)

**Mitarbeiter-App Blink me: Registrierung**
- Login mit "Blink ID"-Karte (ID + Code), per QR-Scan oder manuell; einmalig, danach gespeichert. 21 Sprachen, Gerätesprache wird übernommen, sonst Deutsch — [Setup](https://doku.blink.de/blink-me/setting-up-blink-me)
- Mehrere Login-Profile (mehrere Firmen) möglich; Zeitformat dezimal oder h:min; Logout löscht lokale Daten, Profile und Chatverläufe — [Profil](https://doku.blink.de/blink-me/user-interface)

**Stempeln (Schritt für Schritt)**
- Start über grünen Button auf Startseite; Optionen QR-Code (Objektcode scannen), NFC-Sticker, oder ohne Code (wenn aktiviert; Stop ohne Code verlangt Kommentar). Stop: roter Button, Objekt erneut scannen. Bei vorhandener Einplanung zeigt der Scan Planungsnotiz und berechnetes Ende — [Zeiterfassung](https://doku.blink.de/blink-me/time-tracking)
- Offline: Zeiten ohne Netz erfassbar, werden automatisch gesendet; Hinweis auf Startseite — [Zeiterfassung](https://doku.blink.de/blink-me/time-tracking)
- "Weiterarbeiten": Fahrzeit zwischen zwei Objekten oder Leistungswechsel im Objekt per zweitem QR-Scan — [ebd.](https://doku.blink.de/blink-me/time-tracking)
- Alternativer Typ "Sollzeit bestätigen": Mitarbeiter bestätigt am Schichtende die geplante Zeit, Abweichung nur mit Kommentar — [ebd.](https://doku.blink.de/blink-me/time-tracking)
- Manuelle Nacherfassung (wenn freigeschaltet): bis zum 1. des Vormonats, ab dem 11. nur aktueller Monat — [ebd.](https://doku.blink.de/blink-me/time-tracking)
- Automatische Zeiterfassung: aus Einplanung werden Ist-Zeiten erzeugt (läuft täglich über die letzten 2 Tage), nicht bei Überschneidung, Abwesenheit, Vertretung; Aktivierung nur über Blink Support, Berechtigungsgruppe nötig — [Doku](https://doku.blink.de/blink-manager/automatische-zeiterfassung)
- Pausen: drei Varianten (ausstempeln; eingeplant, Lage = Mitte der Arbeitszeit; vollautomatisch, Default 30 min nach 6 h und 15 min nach 9 h) — [Pausen](https://doku.blink.de/blink-manager/pausen)
- Zeiten und Pläne in der App: Farbcodes grün gebucht, blau geplant, gelb Abwesenheit, rot Plan ohne Zeit; Wochen-/Monatsansicht; Soll/Ist/Vertrag-Summe; Urlaubsseite mit Antrag per Ticket — [Zeiten](https://doku.blink.de/blink-me/times-and-schedules)
- GPS: Toleranz in Systemeinstellungen, Alarm bei Start/Stopp außerhalb; Blink schließt Genauigkeitszusicherung ausdrücklich aus — [GPS](https://doku.blink.de/blink-manager/gps-verwendung)

**Manager-Seite: Freigabe und Alarme**
- 16 Alarmtypen pro Mandant wählbar (Zeit an ungeplantem Tag/außerhalb Fenster, falsches/fehlendes Objekt, unbekannte Nummer, Auto-Stopp, Tagesmaximum, Überschneidung, fehlende Leistung, GPS). Abweichung Plan/Ist Standard ±5 min. Überstunden-Alarm je Beschäftigungsverhältnis mit Monatslimit. Push an Objektleiter bei nicht eingestempelt (Standard 15 min nach Schichtbeginn) — [Alarme](https://doku.blink.de/blink-manager/alarme)
- Kontrollvorgaben: Soll-Stunden je Objekt, optional je Leistung, Wiederholung (täglich/wöchentlich/monatlich/RRULE), Feiertagsregel; Abgleich in Dienstplanung, "Meine Objekte", Statistik, Freigabe, Berichten — [Kontrollvorgaben](https://doku.blink.de/blink-manager/kontrollvorgaben)
- Berechtigungen: Sichtbarkeit (Mandant, Objektleiter, Teamleiter, Bereichsleiter, "Alle Mitarbeiter/Objekte") getrennt von Aktionen; Mandantenzuordnung eines Mitarbeiters nachträglich nicht änderbar — [Berechtigungen](https://doku.blink.de/blink-manager/berechtigungen)
- Bereiche (Regionen/Niederlassungen) steuern Sichtbarkeit; Doku rät sie nur bei Bedarf zu nutzen, weil komplex — [Bereiche](https://doku.blink.de/blink-manager/bereiche)
- Excel-Import von Stammdaten (Mitarbeiter, Objekte, Einplanungen): nur Neuanlage, Update über Support — [Import](https://doku.blink.de/blink-manager/excelimport-von-stammdaten)
- Berichtsvorlagen: Word-Vorlagen mit Platzhaltern, PDF-Ausgabe; Mitarbeiterbericht, Arbeitszeitnachweis, Produktivstunden, Objektbericht (kompakt); Massenexport als ZIP per E-Mail; importierte Vorlagen nicht editierbar — [Berichtsvorlagen](https://doku.blink.de/blink-manager/berichtsvorlagen)
- Release 6.1: Ticket-Workflows für Reinigungskräfte, Regietätigkeiten separat ausweisen, Hauptverantwortlicher je Objekt, Excel-Export Dienstplan — [6.1](https://doku.blink.de/blink-manager/release-notes-6-1). Release Notes liegen seit Juli/Nov 2025 in der Blink Community — [Manager](https://doku.blink.de/blink-manager), [Tickets](https://doku.blink.de/tickets)

**Planung (Blink Plan, Add-on)**
- Ablauf: Funktion je Mandant und Berechtigungsgruppe aktivieren; je Objekt "Aktivieren" (scheitert bei vorhandenen Zukunftsplanungen); Reviere anlegen (Name, Notiz für Mitarbeiter, Farbe, Stammmitarbeiter, Soll-Stunden je Wochentag); Schichten (Revier, Name, Kürzel, Leistung, Sollbesetzung, Zeiten, Pause, Wochentage, Intervall, Feiertagsregel); Mitarbeiter zuweisen (Tag/Woche/Zeitraum/Serie; Suche nach Name, Personalnummer, Blink ID, Qualifikation) — [Blink Plan](https://doku.blink.de/blink-manager/schichtplanung-blink-plan)
- Statusanzeigen: Besetzung blau/rot; Warndreieck bei Überschneidung, Ruhezeitverstoß, zu vielen Folgetagen, Arbeitszeitkonto — [ebd.](https://doku.blink.de/blink-manager/schichtplanung-blink-plan)
- Veröffentlichung per "Sichtbar bis"-Datum; Excel-Druck. Einschränkung: Revier-/Schichtnamen außerhalb von Blink Plan nicht sichtbar, Vertretungen werden nicht zurückgespielt — [ebd.](https://doku.blink.de/blink-manager/schichtplanung-blink-plan)
- Dienstplanung (Übersicht): Objekt- und Mitarbeitersicht, Status über/unter/optimal, Filter, Alarme, Drag and Drop — [Dienstplanung](https://doku.blink.de/blink-manager/dienstplanung)
- Marketing: Vertretung per Drag and Drop oder Zuweisung, Vorschlag nach Qualifikation, Erfahrung, Verfügbarkeit; Push an Vertreter; Alarme/Ruhezeiten auf der Marketingseite nicht erwähnt — [Dienstplanung](https://www.blink.de/funktionen/dienstplanung/)

**Qualifikationen und Fristen**
- Qualifikationen: Admin-gepflegt, Standard 9: Desinfektor, Dienstfahrzeug, Führerschein Klasse B, Glas, Hausmeister, Infektionsschutzbelehrung, Springer, Unterhalt, Vorarbeiter; Filter in Mitarbeiterliste, Suche, Vertretungsassistent — [Qualifikationen](https://doku.blink.de/blink-manager/qualifikationen)
- Befristungen: Typen mit Priorität (Kritisch/Informativ), Vorlauf, optional automatisches Ticket; Standard: Arbeitsvertrag, Aufenthaltsgenehmigung, Arbeitserlaubnis, Probezeit, Führerschein, Schulung/Belehrung; Alarm in der Planung bei abgelaufen; blockiert nichts, keine automatische Verlängerung — [Befristungen](https://doku.blink.de/blink-manager/befristungen)

**Tickets**
- 8 Standardtypen: Urlaubsantrag, Krankmeldung, Krankmeldung (eAU), Reklamation/Nachreinigung, Materialbestellung, Dokument einreichen, Überstundenausgleich, Dokumente für Kundenportal — [Standardtickets](https://doku.blink.de/tickets/standardtickets)
- Konfiguration: eigene Status (Neu / In Bearbeitung / Abgeschlossen), Zuweisung automatisch an Teamleiter/Objektleiter, Abwesenheitsantrag mit Genehmigung öffnet "Abwesenheitsassistent", Aktionsschlüssel approval/processing/complete — [Tickets konfigurieren](https://doku.blink.de/tickets/tickets-konfigurieren)
- In der App: "+ Ticket", Typ wählen, Pflichtfelder, Kommentar und Foto, Push/E-Mail — [Tickets/Formulare App](https://doku.blink.de/blink-me/tickets-and-forms)

**Formulare**
- Anlage: Blink Formulare (aus Manager oder eigene Check-URL), Vorlage, Einstellungen; Berechtigung "Formularvorlagen verwalten"; Import/Export im Format check-b64; ChatGPT-Tool "Blink Formularvorlagen GPT" wandelt Papierformulare in Vorlagen — [Vorlage anlegen](https://doku.blink.de/formulare/formularvorlage-anlegen)
- Aufbau: Kategorien > Seiten > Elemente; Eingabe (Text, Auswahl, Sterne/Smileys), Info-Elemente; Abhängigkeiten nur mit ODER verknüpfbar, nicht UND — [Formular erstellen](https://doku.blink.de/formulare/formular-erstellen-oder-bearbeiten-und-bereits)
- App: Seitenweise ausfüllen, Inhaltsübersicht grau/rot/grün, "In Bearbeitung" pausierbar, objekt- oder mitarbeitergebunden (QR-Auswahl), unübersetzte Formulare auf Deutsch — [App](https://doku.blink.de/blink-me/tickets-and-forms)
- Marketing: Baukasten mit Bildupload, Unterschriftsfeld, Barcode-Scanner, Scoring in Prozent, Berichtsvorlagen für PDF, automatische Mail bei Abschluss, öffentliche Formulare per Link, Auswertung im Kundenportal teilbar; Offline-Betrieb nicht erwähnt — [Digitale Formulare](https://www.blink.de/funktionen/digitale-formulare/)

**Dokumente**
- Kategorien steuern Sichtbarkeit, Verknüpfung mit Objekten und/oder Mitarbeitern, Massenaktionen, PDFs aus Formularen automatisch verknüpft — [Mit Dokumenten arbeiten](https://doku.blink.de/dokumente/mit-dokumenten-arbeiten)
- Geschützte Dokumente (nur Professional): genau ein Mitarbeiter, Status nicht rückgängig, App öffnet nur nach Geräte-Sperre (Face ID/PIN), Browser noch ohne Biometrie — [Geschützte Dokumente](https://doku.blink.de/dokumente/geschutzte-dokumente)
- Lesebestätigung/Signatur in der Doku-Seite zur App-Ansicht nicht beschrieben — [Documents](https://doku.blink.de/blink-me/documents)
- Es gibt eine BMS-Schnittstelle (Dokumente) — [Dokumente Index](https://doku.blink.de/dokumente)

**Optionale App-Features**: digitale Mitarbeiterkarte (offline nutzbar), Sticker (Lob), News (nicht übersetzt), externe Links, E-Learning mit Status blau/grün/rot — [Optional](https://doku.blink.de/blink-me/optional-feature)

**Kundenportal**: Anlegen von Kunden und Kundenbenutzern (Einladung per E-Mail), Anwesenheit sichtbar, Audit-Auswertungen, Tickets, Logo/Willkommensnachricht, Steuerung der Zeitdarstellung — [Einführung](https://doku.blink.de/kundenportal/einfuhrung). Mitarbeiternamen standardmäßig verborgen — [Kundenportal](https://www.blink.de/funktionen/kundenportal/)

### Inferences
- Das Bild "Doku = Zeit/Plan/Alarm/Tickets" deckt sich mit eurem Stand; euer Vorsprung liegt bei Kalkulator, Verträgen, Rechnung/Mahnung/E-Rechnung, LV-Nachweis mit Abnahme, Karte, Leitstand. In der Doku fand ich zu Angeboten und Rechnungen keine eigene Seite (Gap).
- Blink-Ansatz "Alarm-Katalog + Freigabekriterien mit Toleranz" ist ein übertragbares Muster (Plan/Ist-Abweichung ±5 min, Nichterscheinen nach 15 min, Überstundenlimit 10-15 % unter Maximum).

### Gaps
- Doku-Unterseiten Blink Manager (Zeiten erfassen, Zeiten auf-/abrunden, Terminals, Objektdetailseite, Mitarbeiterdetailseite, Abwesenheiten, Auswertungen, Dienstausweis, Tags u. a.), Arbeitsscheine, Chat-Übersetzung, Schnittstellenseiten (zvoove etc.), Formular-Elementreferenz (`/formulare/elemente`) wurden nicht gelesen.
- Blink Community (Release Notes, Forum) nicht abgerufen; Blog und Referenzen nicht ausgewertet.

## 2. Vorlagen namentlich (Vorlagenbibliothek, 27 Stück)

### Takeaway
Die Bibliothek umfasst laut Doku 27 Vorlagen in 4 Kategorien (Marketing: "über 20"). Für Personal viel Papierersatz (Minijob-Vertrag, Personalfragebogen), aber kein Voll-Arbeitsvertrag und keine Sofortmeldung als Vorlage.

### Cited Findings
Quelle für alles: [Formularvorlagen-Bibliothek](https://doku.blink.de/formulare/formularvorlagen-bibliothek). Marketing: kostenlos, ohne Anmeldung, als PDF, Online-Formular, Word — [Digitale Formulare](https://www.blink.de/funktionen/digitale-formulare/)

- Personal & Verwaltung (13): Personalfragebogen (Stammdaten, Ausbildung, Bank, Beschäftigungszeiten, Sozial-/Krankenversicherung, Steuer, optional Kinder/Schwerbehinderung, Unterschrift); Arbeitsvertrag Minijob (Beginn/Probezeit/Ende, Tätigkeit, Arbeitszeit, Entgelt, weitere Beschäftigung, RV-Pflicht, Urlaub, Abmeldung bei Krankheit, Verschwiegenheit, Kündigung, Unterschriften); Änderungsmeldung Personal; Antrag auf Befreiung von der Rentenversicherungspflicht; Vereinbarung Kürzung der Arbeitszeit (Geringfügigkeitsgrenze); Abmahnung (zwei Download-Varianten); Unterweisung Arbeitsschutz (mit Bestätigung/Unterschrift); Arbeitsunfall; Auslagenerstattung (Belegupload); Einverständnis Mitarbeiteraufnahmen; Ausgabe Arbeitskleidung; Empfangsbestätigung Blink ID-Karte; Onboarding-Checkliste (Übergabe/Rückgabe von Unterlagen, anpassbar).
- Qualität & Objekte (8): Objektbegehung (bis 3 Räume, je bis 10 Elemente mit Smiley, Fotos, Nachreinigung, Gesamtwertung, Unterschrift, optional Ticket); Qualitätscheck Kompakt (Sterne); Risikocheck (LMRA, für Fensterreiniger, kompakt/detailliert); Reparaturanfrage; Tätigkeitsnachweis (Kundenunterschrift als Abrechnungsgrundlage); Aufgabenliste (Aufgaben mit Beispielbildern, Kommentar bei Nichterledigung); Schlüsselübergabe; Schlüsselprotokoll (QR/Barcode je Schlüssel, Ausgabe und Weitergabe).
- Fuhrpark (3): Fahrzeugschäden; Fahrzeugübergabe; Führerscheinkontrolle.
- Kunde & Vertrieb (3): Begehungsprotokoll (vor Vertragsstart); Einwilligung Referenzkunde; SEPA Firmenlastschrift.

### Inferences
- Für euer Produkt interessante Lücken-Kandidaten: Schlüsselprotokoll mit Code je Schlüssel, Arbeitskleidung-Ausgabe, Risikocheck LMRA, Führerscheinkontrolle, Unterweisung mit Bestätigung, Tätigkeitsnachweis mit Kundenunterschrift, Auslagenerstattung, Arbeitsunfall.

### Gaps
- Feldtypen im Detail pro Vorlage nur als Stichwortliste; Inhalte der Arbeitsvertrag-Vorlage (Rechtsstand) nicht geprüft.

## 3. Personal: Onboarding, Sofortmeldung, Verträge, Signatur

### Takeaway
Die Marketingseite verspricht einen durchgängigen Onboarding-Ablauf inkl. Sofortmeldung, Vertragserstellung und digitaler Unterschrift. Die Doku, die ich lesen konnte, belegt das nicht; dort sind nur Befristungen, Qualifikationen, Minijob-Vorlagen und Unterweisung belegt.

### Cited Findings
- Herstellerbehauptung: Personalfragebogen auf dem Handy ausfüllen, Ausweis/Dokumente fotografieren, daraus legt KI den Mitarbeiter in Blink an; frei definierbare Status mit passenden To-dos; Aktivierung erst wenn alles steht; Fristen automatisch; Sofortmeldung "direkt im System"; Verträge aus Vorlagen, digital unterschreibbar — [Personalverwaltung](https://www.blink.de/funktionen/personalverwaltung/)
- Qualifikationen und Befristungen: siehe Abschnitt 1.
- Mitarbeiterprofil in Blink me: Foto, Dienstausweis, Dokumente, Ticket "Dokument einreichen", Krankmeldung eAU — [Optional](https://doku.blink.de/blink-me/optional-feature), [Standardtickets](https://doku.blink.de/tickets/standardtickets)
- Suche nach Sofortmeldung bei Blink ergab keinen unabhängigen Treffer — [Suche](https://www.ki-syndikat.de/tools/blink-gebaeudereinigung/) (Drittseite nennt Sofortmeldung nicht)

### Inferences
- Die "KI legt Mitarbeiter aus Foto an"-Funktion ist nur Marketing; Blinky KI in der Doku kann das nicht (siehe 4). Ob Sofortmeldung an die Sozialversicherung wirklich übertragen wird (sv.net/ELStAM-Weg) ist unklar.

### Gaps
- Keine Doku-Seite zu Onboarding-Status, Sofortmeldung, Vertragsvorlagen oder digitaler Signatur gefunden (Vertragssignatur-Art, z. B. einfache/qualifizierte, unbekannt). Nur Hersteller-Satz auf der Marketingseite.

## 4. KI, Mehrsprachigkeit, Offline, Push, Datenschutz

### Takeaway
Die dokumentierte KI (Blinky) hat genau ein Szenario: Rückfrage per Chat, wenn jemand länger als geplant gearbeitet hat. Mehrsprachigkeit ist breit (21 Sprachen, Chat-/Notiz-Übersetzung, Formularübersetzung nur Professional). Datenschutzangaben sind dünn.

### Cited Findings
- Blinky KI: ab Paket Standard; Szenario "Reinigungskraft hat länger gearbeitet": bei Stopp prüft Blink Ist gegen Plan plus Toleranz (%), startet Chat in Blink me, fragt nach Grund, führt je Grund Aktionen aus (Kommentar, Ist=Soll setzen, Zeit splitten, Ticket); immer Push an Objektleiter; max. 1 Rückfrage je Mitarbeiter/Objekt/Tag; unbeantwortet nach ca. 4 h ausgeblendet; Chat in App-Sprache, Manager sieht Übersetzung; "weitere Szenarien in Entwicklung" — [Einführung](https://doku.blink.de/blink-ai/einfuhrung), [Szenario](https://doku.blink.de/blink-ai/szenario-reinigungskraft-hat-langer-gearbeitet), [Einrichten](https://doku.blink.de/blink-ai/blinky-ki-einrichten)
- Blinky startet automatisch Chats, sobald Szenario aktiv und Gruppenrecht gesetzt; Rollout über Gruppenrechte steuern — [Einrichten](https://doku.blink.de/blink-ai/blinky-ki-einrichten)
- Übersetzung: Chat, Planungsnotizen, Mitarbeiternotizen werden in Profilsprache übersetzt; Dokumentnamen automatisch übersetzt, Dateien nicht; News nicht — [Profil](https://doku.blink.de/blink-me/user-interface), [Documents](https://doku.blink.de/blink-me/documents), [Optional](https://doku.blink.de/blink-me/optional-feature)
- Formularübersetzung automatisch (Professional) — [Preise](https://www.blink.de/preise/)
- Chat: Objekt-, Mitarbeiter-, 1:1-Chat; Text, Emojis, Fotos; Löschung nach 30 Tagen; Objektchat nimmt Eingeplante der letzten/nächsten 4 Wochen auf; Chat läuft ohne Telefonnummer — [Chat](https://doku.blink.de/blink-me/chat-feature)
- Push: je Login-Profil ein-/ausschaltbar; genutzt für Vertretung, Ticket, Verspätungsalarm — [Profil](https://doku.blink.de/blink-me/user-interface), [Alarme](https://doku.blink.de/blink-manager/alarme)
- Offline: nur für Zeiterfassung und digitale Mitarbeiterkarte belegt — [Zeiterfassung](https://doku.blink.de/blink-me/time-tracking), [Optional](https://doku.blink.de/blink-me/optional-feature)
- Datenschutz: Doku verlinkt nur auf iubenda-Datenschutzerklärung; Drittseite: Serverstandort und AVV auf archivierten Seiten nicht genannt, Empfehlung Betriebsrat/GPS-Information — [ki-syndikat](https://www.ki-syndikat.de/tools/blink-gebaeudereinigung/) (Drittanbieter-Redaktion, nicht unabhängig geprüft)
- Zuschläge: Blink berechnet Sonntag/Feiertag/Nacht und Belastungszuschlag (>8 h/Tag oder >40 h/Woche) nur als Stunden, nicht in Euro; Erschwerniszuschlag laut Doku "nicht unterstützt" — [Zuschläge](https://doku.blink.de/blink-manager/zuschlaege); WIDERSPRUCH: Marketingseite sagt, DATEV-Export füge Erschwerniszuschlag automatisch hinzu — [Lohnvorbereitung](https://www.blink.de/funktionen/lohnvorbereitung/)
- Abrechnungsexport: DATEV (LODAS/Excel-Version), SP Data, Sage; kostenpflichtiges Add-on; nur Zeiten mit Lohnart und Personalnummer; Summen je Mitarbeiter, Lohnart, Kostenstelle — [Export](https://doku.blink.de/blink-manager/abrechnungsexport)

### Inferences
- Die Marketingaussage "KI" ist weitgehend Chat-Automatik mit festem Szenario; für euch übertragbar ohne echtes KI-Modell (Regel: Überschreitung > Toleranz → Rückfrage in der App).

### Gaps
- Push-Technik (Android/iOS), Datenhaltung/Hosting, Zertifizierungen: nicht gefunden (datenschutz-URL 404).
- Offline für Formulare/Tickets/Checklisten: nicht belegt.

## 5. Preise

### Takeaway
Standard 149 € + 4,90 € je Nutzer; Professional 399 € + 4,90 €; Enterprise auf Anfrage; einmalige Einrichtungsgebühr (Höhe nicht genannt).

### Cited Findings
- Standard: Zeit, Plan, Tickets, Chat, KI, Arbeitsscheine, Kundenportal, 150 Formulare/Monat, 20 GB. Professional zusätzlich: automatische Formularübersetzung, unbegrenzte Formulare, 200 GB, geschützte Dokumente. Beispiel 40 Nutzer: 345 € bzw. 595 €/Monat netto — [Preise](https://www.blink.de/preise/) (Marketingseite nennt "Standard", nicht "Starter")
- Blink Plan und Abrechnungsexport werden in der Doku als kostenpflichtige Add-ons bezeichnet; Preise nicht genannt — [Plan](https://doku.blink.de/blink-manager/schichtplanung-blink-plan), [Export](https://doku.blink.de/blink-manager/abrechnungsexport)

### Gaps
- Add-on-Preise, Einrichtungsgebühr, Laufzeit: nicht gefunden. Widerspruch möglich: Preisseite listet "Schichtplanung" im Standard, Doku nennt Blink Plan Add-on (vermutlich unterschiedliche Funktionen, unklar).

## 6. Nutzen für einen deutschen Reinigungsbetrieb (10 bis 60 MA) und Kritik

### Takeaway
Wirklich nützlich (Inferenz): Stempeln per QR/NFC mit Offline, Plan/Ist-Alarme, Zuschläge als Stundenbericht für Lohn, Befristungs-/Qualifikationsfristen, Formularvorlagen (Schlüssel, Kleidung, Unterweisung, LMRA), Mehrsprachigkeit. Beiwerk: Sticker, News, E-Learning, externe Links, Blinky mit einem Szenario.

### Cited Findings
- Bewertungen: GetApp 4,7/5 (132), Capterra DE 4,7/5 (133); Zuordnung zum Reinigungsprodukt vom Suchsystem nicht eindeutig bestätigt; Seiten waren per Abruf 403, daher Inhalte nicht gelesen — [GetApp](https://www.getapp.de/reviews/112787/blink), [Capterra](https://www.capterra.com.de/software/173179/blink)
- Herstellerzahl: über 300 Gebäudedienstleister, 65.000 Reinigungskräfte (über Suchergebnis zitiert; nicht unabhängig belegt) — [softwareabc24](https://www.softwareabc24.de/gebaeudereiniger-software/blink)
- Redaktionelle Schwächen laut ki-syndikat (Drittseite, nicht Praxistest): kein ERP/Rechnung/Buchhaltung, keine Lohnabrechnung, Grundgebühr belastet Betriebe unter ca. 15 MA, Berichtstiefe unklar, Einführung bei Großkunden aufwendig — [ki-syndikat](https://www.ki-syndikat.de/tools/blink-gebaeudereinigung/)
- Dokumentierte Grenzen: Excel-Import nur Neuanlage; Zuschläge nur Stunden; GPS-Genauigkeit nicht zugesichert; Befristungen blockieren nichts; Formular-Abhängigkeiten nur ODER; automatische Zeiterfassung nur über Support aktivierbar — siehe Quellen oben
- Vergleichsportale softwareabc24 sind laut Suchzusammenfassung vom Hersteller bezahlt; nur zurückhaltend nutzen — [softwareabc24](https://www.softwareabc24.de/vergleiche/pland-vs-blink)

### Inferences
- Kritik in Foren/Reviews (Inhalt der Capterra/GetApp-Reviews, Reddit, Kununu) nicht erhoben; Lücken wahrscheinlich dort sichtbar, wo Blink kein Angebots-/Rechnungs-/Vertragsmodul hat.

### Gaps
- Review-Texte (Pros/Cons), Community/Forum, Blog, Referenzen: nicht gelesen (403 bzw. nicht abgerufen).
