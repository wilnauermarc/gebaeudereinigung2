# Internationale Reinigungs-/Janitorial-Software: Featurekatalog auf Funktionsebene (Stand 02.11.2026)

Methodik-Hinweis: Ergänzt (ohne Wiederholung) die frühere Recherche `Reinigungssoftware Praxisstimmen und Konkurrenz/international_janitorial.md`. Fast alle Aussagen stammen von Hersteller-Hilfecentern/Funktionsseiten (interessengeleitet). Viele Hilfe-Center-Unterartikel (Swept) sind beim Abruf nur Inhaltsverzeichnisse; Tiefe daher begrenzt. Übertragbarkeit DE = eigene Einschätzung (Inferenz), nicht belegt.

## 1. Konkrete Funktionen (Inspektionen, Portal, Angebote, Verträge, Zeit, Planung, Aufgaben, Chat, Material, Incidents, KPIs, Automationen, Integrationen)

### Takeaway
Am tiefsten dokumentiert sind Inspektionen (Swept, Janitorial Manager, Otuvy/CleanTelligent, CleanGuru), QR/NFC-Verifikation (Scan4Clean/Scan2Inspect) und Jobbers Angebots-Follow-ups. Bid-Tools (BidLoom, CleanGuru) sind Rechner mit ISSA-Produktionsraten, E-Signatur kommt meist von Drittanbietern. Zu Vertragsverlängerung/Preiserhöhung, Schichttausch und Incident-Management in Janitorial-Spezialtools gibt es kaum belegte Funktionen.

### Cited Findings

#### Featuretabelle

| Feature | Produkt | Beleg-URL | Workflow-Kurzbeschreibung | Übertragbarkeit DE |
|---|---|---|---|---|
| Inspektionspläne je Standort aus Bereichen/Items + Vorlagen | Swept (ab Optimize, nicht Launch) | https://knowledge.sweptworks.com/knowledge/manage-inspections | Plan pro Location, Bereiche ("Areas") und Items, Standardvorlagen oder eigene hinzufügbar, duplizierbar; Items erhalten bei der Inspektion Kommentare, Fotos, Ratings | hoch |
| Kundenspezifische Inspektionsvorlagen mit Pflichtfotos/-notizen bei kritischen Punkten, Offline-Sync, Zeitstempel im Bild, Monatsreport an Kunden | Swept | https://sweptworks.com/janitorial-inspection-software | Supervisor bewertet Checkpoints mobil, Foto mit eingebettetem Zeitstempel; Bericht per E-Mail, Secure Link oder PDF; Verlaufsdashboards zum Coaching; Vorlagen klonbar auf ähnliche Kunden | hoch |
| Inspektionsbericht an Kunden senden ("Send to Clients") + Client-Portal-Ansicht | Swept (Scale-Tarif für Client-Features laut Konkurrent) | https://knowledge.sweptworks.com/knowledge/client-portal-inspections (nur via Suchzusammenfassung; direkter Abruf 404) | Nur Inspektionen, die per "Send to Clients" an Kunden eines Standorts gesendet wurden, erscheinen im Portal, optional mit Kommentar | hoch |
| Offsite-Clock-in/out-Report (nicht-verpflichtende Geofence) mit Liste und Karte | Swept | https://knowledge.sweptworks.com/knowledge/offsite-clock-in-report (Titel/Suchsnippet) | Stempelungen außerhalb des nicht-zwingenden Geofence landen in Report + Karte für Manager; bei zwingendem Geofence ist Stempeln ohne Standortdaten blockiert | niedrig-mittel (Datenschutz/Betriebsrat) |
| Zeiteinträge "invalidieren" statt löschen | Swept | https://knowledge.sweptworks.com/knowledge/invalidate-time-entries | Invalid markierte Einträge erscheinen nicht in Payroll- und Schedule-Variance-Report, bleiben aber im Time-Entry-Report sichtbar (Audit-Spur) | hoch (revisionsfreundliches Korrekturmuster) |
| Urlaubs-/Time-off-Antrag per Mobile App, Checklisten für Reinigungskräfte, Supplies-Anforderung und Lieferantenverwaltung, Messaging | Swept | https://knowledge.sweptworks.com/knowledge/scheduling ; https://knowledge.sweptworks.com/knowledge/supplies | Nur Artikeltitel belegt ("Requesting Time Off through the Mobile App", "How to Request Supplies", "Manage Suppliers and Supply Requests", "Assign Supplies to a Location"); Details nicht abrufbar | hoch |
| Vorlagen mit Grading Pass/Fail, Prozent o. Ä.; gewichtete Bereiche (z. B. Sanitär/Lobby zählen stärker); Fotos im Standortdatensatz; geplante Routine-Inspektionen + offene Ad-hoc-Checks; positive Reports als Leistungsnachweis oder Mitarbeiterlob | Janitorial Manager | https://www.janitorialmanager.com/work-management-system/janitorial-inspections-app/ | Zeitplan der Routineinspektionen in JM Connect; Scorebreakdown für Kunden transparent; Historie zeigt Trend und Schulungsbedarf | hoch (Personenbezug der Scores prüfen) |
| Scan4Clean: QR/NFC am Raum, Start-/Endzeit, Checkliste, Foto, öffentliche Feedback-/Service-Anforderung, Anzeige "zuletzt gereinigt von wem" | Janitorial Manager | https://www.janitorialmanager.com/work-management-system/scan4clean/ | Reinigungskraft scannt/tippt, bekommt Schrittanleitung, belegt mit Foto; Öffentlichkeit sieht letzte Reinigung + wer; Management sieht in Echtzeit wer/wann/wie lange | hoch für QR/Leistungsnachweis; "wer" öffentlich anzeigen: niedrig (DSGVO) |
| Scan2Inspect: eindeutiger QR/NFC je Raum für Vor-Ort-Inspektion | Janitorial Manager | https://www.janitorialmanager.com/work-management-system/scan2inspect/ (via Suchzusammenfassung) | Scan öffnet Raum-Checkliste, Supervisor vergibt Scores, Fotos, Mängel dokumentiert | hoch |
| Kundenportal ohne Aufpreis; Kunden stellen Material-/Serviceanfragen | Janitorial Manager | https://www.janitorialmanager.com/blog/janitorial-manager-vs-swept/ | Anfrage im Portal statt E-Mail; Work Orders mit Kosten/Profitabilität je Projekt | hoch |
| Zeiterfassung: GPS/Geofence, QR/NFC, Kiosk, Telefon-Einwahl, Auto-Clock-out, optional Gesichtserkennung gegen Buddy-Punching | Janitorial Manager | https://www.janitorialmanager.com/blog/janitorial-manager-vs-swept/ | Mehrere Stempelkanäle je Standort | QR/NFC/Kiosk hoch; Geofence mittel; Gesichtserkennung niedrig (biometrisch, Art. 9 DSGVO) |
| Inspektionsmängel werden automatisch zu Work Orders; Status je Stufe; Abschlussnachweis | Otuvy QM (ehem. CleanTelligent) | https://www.otuvy.com/otuvy-qm-features | Mangel -> Work Order (mit Frontline zusätzlich Aufgabenliste, Manager weist zu, Work Order schließt automatisch, wenn Task erledigt) | hoch |
| QR-Formulare erzeugen sofort Work Orders (z. B. niedriger Bestand) | Otuvy | https://www.otuvy.com/otuvy-qm-features | Scan -> Formular -> Work Order | hoch |
| Client-Portal mit individuellen Berechtigungen: Serviceanfragen, Nachrichten zu Inspektionen/Work Orders, Umfragen, On-Demand-Reports | Otuvy | https://www.otuvy.com/otuvy-qm-features | Kunde sieht nur freigegebene Daten; Zufriedenheitsumfragen im Portal | hoch |
| "Secondary Service Providers": Subunternehmer mit eigenen Rechten, Branding, Reports; Subunternehmer-Performance sichtbar | Otuvy | https://www.otuvy.com/otuvy-qm-features | Sub arbeitet im selben System, Hauptunternehmer sieht Leistung | hoch (Nachunternehmer-Steuerung im DE-Markt üblich) |
| Response-Time-Tracking über Work-Order-Lebenszyklus; filter-/speicher-/teilbare Operational-Intelligence-Dashboards | Otuvy | https://www.otuvy.com/otuvy-qm-features | SLA-Reaktionszeit pro Stufe messbar | hoch |
| Inspektion lädt Bereiche automatisch aus dem Angebot (Bid); Standardratings vorbelegt, nur Abweichungen ändern; Arbeitsticket bei Mängeln; Offline-Sync | CleanGuru | https://apps.apple.com/us/app/cleanguru-janitorial-software/id673270069 | Angebotsstruktur wird Inspektions-Checkliste (Single Source of Truth Leistungsverzeichnis) | hoch |
| Bid: Name, Gebäudetyp, Reinigungsfrequenz -> Preisvorschlag + Proposal als Anhang mit Anschreiben; Bid teilen/archivieren, Bid-Requests zur Angebotsvergleich | CleanGuru | https://apps.apple.com/us/app/cleanguru-janitorial-software/id673270069 ; https://www.capterra.com/p/175089/CleanBid/ | Mail-Versand mit automatisch angehängtem Proposal | mittel (ISSA-Raten US-basiert; Leistungswerte DE) |
| BidLoom: reiner ISSA-612-Produktionsraten-Bid, volle Labor-Burden-Berechnung (staatsspezifisch), Proposal-Builder verknüpft Stundenansatz mit Frequenz-Positionen, ca. 19 USD/Monat; E-Signatur nicht belegt | BidLoom | https://worldmetrics.org/best/commercial-cleaning-bidding-software/ (Drittquelle; Herstellerseite nicht abgerufen) | Frequenz x Fläche x Rate = Stunden x Lohn inkl. Nebenkosten = Preis | mittel (Lohnnebenkosten-Logik sehr gut übertragbar, Raten nicht) |
| Quote-Follow-up: automatische E-Mail/SMS-Erinnerung bei unbeantworteten Angeboten (ab Connect-Plan); Kunde kann im Client Hub freigeben oder Änderungen anfragen | Jobber | https://help.getjobber.com/hc/en-us/articles/115009739988 (Suchzusammenfassung); https://getjobber.com/features/quoting-animations | Follow-up-Sequenz stoppt laut Community nur bei Status Approved/Changes Requested (Nutzerangabe) | hoch |
| Invoice-Reminders je Abrechnungsfrequenz bei Wiederholungsjobs; Job-Follow-ups nach Abschluss (pro Kunde abschaltbar); Automations-Seite | Jobber | https://getjobber.com/features/automate-repetitive-tasks/ ; https://help.getjobber.com/en/articles/automations/ | Regelbasierte Nachrichten an Kunden | hoch |
| Genehmigungsworkflow für Estimates: Freigabe erforderlich, bevor Angebot an Kunden geht; Rollen/Nutzer je Umsatzschwelle, mehrstufig, je Division/Branch | Aspire | https://guide.youraspire.com/docs/workflow-search-list-screen (Suchzusammenfassung) | Vier-Augen-Prinzip bei Angeboten über Betragsgrenzen | hoch |
| Contract Renewal Workflow (2024 neu; Details nicht abrufbar) | Aspire | https://youraspire.com/blog/year-in-review-commercial-cleaning-2024 | nur Erwähnung belegt | unklar |
| Proposify-Integration (Angebotsdesign, Tracking, E-Sign) | Aspire | https://www.proposify.com/integrations/aspire | Angebot außerhalb, Status zurück | mittel |
| Preisänderung auf alle künftigen Termine eines Wiederholungsservice kopieren; Startdatum für neuen Preis empfohlen | ZenMaid | https://zenmaid.com/answers/en/articles/4789209-applying-a-price-change | Termin ändern -> "auf zukünftige Termine anwenden"; manuell/halbautomatisch, keine Kundenkommunikation belegt | hoch (Preiserhöhung als Massenänderung mit Stichtag) |
| Spotfinder: füllt Lücken im Kalender automatisch; Cleaner-App mit Checklisten, Kundennotizen, GPS-Check-in, PTO, SOS-Button | ZenMaid | https://get.zenmaid.com/compare/housecall-pro (Eigenvergleich, Marketing) | Lückenfüllung für Wiederholungskunden; Kundenportal nicht belegt | SOS/Checklisten hoch; GPS mittel |
| Schichttausch (1:1) mit optionaler Admin-Freigabe oder Auto-Abschluss; Open Shifts zum Selbst-Claimen; Timesheet-Freigabe nicht durch sich selbst (Vier-Augen); Mitarbeiter-Korrektur geht an Manager zur Freigabe; unbegrenzte Geofences | Connecteam | https://www.softwaresuggest.com/blog/connecteam-review/ ; https://lp.connecteam.com/lp-aw-geo-fence-time-clock-app (Drittquellen/Landingpage) | Mitarbeiter fragt Tausch an, Kollege akzeptiert, Admin-Regel entscheidet | hoch (ohne Geofence-Zwang) |
| Checklisten-Inspektion in Vorlagen, Kosten-/Reportfunktionen: SafetyCulture Janitorial (Free bis 10 Nutzer; 24 USD/Nutzer) | SafetyCulture | https://safetyculture.com/apps/janitorial-inspection-software | generisches Audit-Tool, QR-Servicetracking | mittel |
| Servicetitan Commercial Cleaning: Seite listet nur generisch Scheduling, Service Agreements, Customer Portal, Reporting; keine Reinigungsfeatures belegt | ServiceTitan | https://servicetitan.com/industries/commercial-cleaning-software | Kein belastbarer Beleg für Janitorial-Module | niedrig (nicht belegt) |

#### Weitere belegte Detailaussagen
- Swept Inspektionsberichte: Zeitstempelfotos, Qualitätsscores; Client-Sign-off auf Inspektionen wurde in der Swept-Doku nicht gefunden — [Suchzusammenfassung zu Swept-Knowledge](https://knowledge.sweptworks.com/knowledge/inspections)
- Otuvy beschreibt keinen expliziten Client-Sign-off; nur Portal-Sichtbarkeit und Abschlussnachweis (die frühere Recherche nannte Gegenzeichnung bei CleanTelligent; hier nicht bestätigt) — [Otuvy Features](https://www.otuvy.com/otuvy-qm-features)
- Janitorial Manager Inspektionsseite beschreibt weder Client-Sign-off noch Folge-Work-Orders aus Inspektionen — [JM Inspections](https://www.janitorialmanager.com/work-management-system/janitorial-inspections-app/)
- Scan4Clean-Seite beschreibt weder Berichte, Alarme noch Incident-Handling — [Scan4Clean](https://www.janitorialmanager.com/work-management-system/scan4clean/)
- ISSA berichtet über wachsende Nachfrage nach digitalem Leistungsnachweis (Proof of Service) in Echtzeit — [ISSA News](https://www.issa.com/?p=70509) (nur Titel/Snippet)
- Orderly: kein Produkt gefunden; "Orderry" (orderry.com/cleaning-service) ist ein anderes Field-Service-Tool, nicht geprüft — [Orderry](https://orderry.com/cleaning-service/)
- CareClean: QR-Scan protokolliert Reinigungen und startet Timer, Checklisten, Bestandsführung, automatische Erinnerungen, Basic 175 USD/Monat — [Capterra CareClean](https://www.capterra.com/p/10026735/CareClean/)
- Preise Swept: Inspektionen nur in Optimize (150 USD) und Scale (225 USD), nicht Launch — [Swept Inspection](https://sweptworks.com/janitorial-inspection-software)
- Jobber Quote-Follow-ups erst ab "Connect"-Plan — [Jobber Help](https://help.getjobber.com/hc/en-us/articles/115009739988) (Suchzusammenfassung)

### Inferences
- Das durchgängigste Muster: Angebot (Leistungsverzeichnis/Bereiche) -> Inspektionsvorlage -> Mangel -> Work Order/Task -> Kundenbericht. CleanGuru und Otuvy zeigen Teilketten; keiner belegt die komplette Kette inkl. Client-Gegenzeichnung und Preis-/Vertragsanpassung.
- Preiserhöhung ist nur als Terminserien-Massenänderung (ZenMaid) belegt, nicht als Vertragsworkflow mit Kundenmitteilung, Zustimmung und Index-/Tarifklausel. Das ist ein mögliches Differenzierungsfeld für DE (Tarifrunde Mindestlohn/Rahmentarif als Auslöser).
- Kunden-Gegenzeichnung auf Inspektionen scheint bei den untersuchten Produkten selten dokumentiert; in DE (Abnahmeprotokoll) wäre sie relevant.

### Gaps
- Nicht gefunden/abrufbar: Swept-Artikel zu Geofence-Konfiguration, Schichttausch, Open Shifts, Konflikten, Ersatzvorschlägen (nur Titelverzeichnisse); Swept Release Notes (4.10-Seite 404); Swept Client-Portal-Artikel (404).
- Keine Primärquelle für BidLoom (E-Signatur, Statustracking, Reminder), Housecall Pro, ServiceM8, Orderly, Aspire-Renewal-Details, ServiceTitan-Janitorial.
- Webinare, App-Store-Reviews für Mitarbeiter-Apps (JM Connect, Swept Mobile) nicht ausgewertet.
- Incident-/Beschwerdemanagement als eigenes Modul: nur indirekt (Service-Requests im Portal, Work Orders, Öffentlichkeits-Feedback via Scan4Clean).
- Dashboards/KPIs: Otuvy (Qualitätstrends, Response-Time), Swept (Inspektionsverlauf) belegt; konkrete KPI-Liste siehe früherer Bericht.
- Automationen: nur Jobber (Nachrichtenautomationen) und Otuvy (Mangel -> Work Order) belegt; keine Wenn-Dann-Regelbuilder in Janitorial-Tools gefunden.

## 2. Besonders durchdachte Workflows und UX-Muster

### Takeaway
Überzeugend sind: Mangel -> Work Order -> Task -> Auto-Close (Otuvy), Soft-Delete von Zeiteinträgen (Swept "invalidate"), Vier-Augen-Freigabe von Zeiten und Angeboten (Connecteam, Aspire), Pflichtfoto-Vorlagen mit eingebettetem Zeitstempel (Swept), QR je Raum als Identität für Reinigung und Inspektion (Janitorial Manager).

### Cited Findings
- Auto-Close: Work Order schließt automatisch, wenn die zugehörige Aufgabe erledigt ist; Manager weist zu; Echtzeitstatus je Stufe — [Otuvy](https://www.otuvy.com/otuvy-qm-features)
- Invalid statt Löschen: Eintrag fällt aus Payroll/Variance, bleibt im Time-Entry-/Mood-Report — [Swept Invalidate](https://knowledge.sweptworks.com/knowledge/invalidate-time-entries)
- Nicht-zwingender Geofence mit Offsite-Report statt Blockade; zwingender Geofence blockiert bei fehlenden Standortdaten (Hartvariante, von Nutzern als GPS-Problem bemängelt) — [Swept Offsite](https://knowledge.sweptworks.com/knowledge/offsite-clock-in-report); [JM vs Swept](https://www.janitorialmanager.com/blog/janitorial-manager-vs-swept/)
- Freigabe nach Betragsschwelle, mehrstufig, je Division, spezifischster Workflow gewinnt — [Aspire Docs](https://guide.youraspire.com/docs/workflow-search-list-screen)
- Admin kann eigene Zeiteinträge nicht freigeben; Mitarbeiter-Korrekturen gehen zur Freigabe — [Connecteam Review](https://www.softwaresuggest.com/blog/connecteam-review/)
- Berechtigungsgesteuerte Kundensicht: pro Kunde konfigurierbar, was er sieht — [Otuvy](https://www.otuvy.com/otuvy-qm-features); Swept: Inspektion wird erst durch aktives "Send to Clients" für den Kunden sichtbar (Kuratierungsschritt) — [Swept Portal](https://knowledge.sweptworks.com/knowledge/client-portal-inspections)
- Vorbelegte Bewertungen (Default = ok, nur Abweichung erfassen) beschleunigt Inspektionen — [CleanGuru](https://apps.apple.com/us/app/cleanguru-janitorial-software/id673270069)
- Quote-Follow-up im selben Kanal wie das Angebot (Text -> Text), pro Kontakt abschaltbar — [Jobber Help](https://help.getjobber.com/hc/en-us/articles/115009739988)

### Inferences
- Statusmodell-Vorbild: Mangel (Inspektion) -> Aufgabe -> Work Order -> erledigt -> Auto-Close -> Kundenbenachrichtigung; Kunde sieht erst nach Freigabe durch Innendienst.
- Korrektur-/Freigabemuster ("invalidieren", Vier-Augen) passt zu GoBD/Aufzeichnungspflichten in DE.

### Gaps
- Benachrichtigungslogik (Push/E-Mail-Trigger je Statuswechsel) in den Hilfecentern nicht abrufbar.

## 3. In Deutschland rechtlich/kulturell problematische Features

### Takeaway
Problematisch: Geofence-/GPS-Pflichtstempeln, Live-GPS, Gesichtserkennung, Personenscores aus Inspektionen und öffentliche Namensanzeige ("wer hat gereinigt"). Weniger kritisch: QR/NFC am Objekt, objektbezogene Scores.

### Cited Findings
- Geofence ist als Option und als Pflicht verfügbar (Swept zwingend/nicht-zwingend); Janitorial Manager bietet Gesichtserkennung gegen Buddy-Punching; Connecteam bewirbt Live-GPS und Geofences — [Swept Offsite](https://knowledge.sweptworks.com/knowledge/offsite-clock-in-report); [JM vs Swept](https://www.janitorialmanager.com/blog/janitorial-manager-vs-swept/); [Connecteam LP](https://lp.connecteam.com/lp-aw-geo-fence-time-clock-app)
- Scan4Clean zeigt der Öffentlichkeit, wann und von wem gereinigt wurde — [Scan4Clean](https://www.janitorialmanager.com/work-management-system/scan4clean/)
- Swept-Mood-Report existiert (Stimmung der Mitarbeiter bei Clock-out, indirekt belegt durch Erwähnung "Mood Report") — [Swept Invalidate](https://knowledge.sweptworks.com/knowledge/invalidate-time-entries)
- Rechtsrahmen (Mitbestimmung § 87 Abs. 1 Nr. 6 BetrVG, BAG 1 ABR 22/21 etc.) siehe frühere Recherche — [Früherer Bericht](/Users/marc/AI-Projekte/Resch-Gebäude 3/research_notes/Reinigungssoftware Praxisstimmen und Konkurrenz/international_janitorial.md)

### Inferences
- Niedrig: Gesichtserkennung (biometrische Daten), Live-GPS, öffentlicher Personenbezug, Mood-Tracking pro Person, Rankings von Reinigungskräften.
- Mittel: Geofence nur als Hinweis/Report bei Stempelung (Event), nie Blockade; Betriebsvereinbarung nötig.
- Hoch: QR/NFC-Scan als Objektnachweis, objektbezogene Inspektionsscores, Kiosk-Stempeln.

### Gaps
- Keine rechtliche Primärprüfung in dieser Runde; Aussagen sind Ableitungen.
