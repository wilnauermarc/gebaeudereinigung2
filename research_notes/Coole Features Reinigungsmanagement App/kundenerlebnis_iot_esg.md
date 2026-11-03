# Kundenerlebnis, Qualitätsnachweis, Sensorik/IoT, Robotik, Raumbuch und ESG in der Gebäudereinigung (2023–2026)

Stand: 03.11.2026. Methodik: ca. 16 Tool-Aufrufe; viele Aussagen stammen aus Suchzusammenfassungen (Snippets) oder Herstellerseiten, nicht aus vollständig gelesenen Primärquellen. Marketing-Bias ist jeweils gekennzeichnet. Ergänzt (nicht wiederholt) den früheren Bericht `international_janitorial.md` (Swept, Janitorial Manager, CleanTelligent, Scan4Clean, BAG/BetrVG-Themen).

## 1. Kundenerlebnis und Qualitätsnachweis

### Takeaway
Im DACH-Markt sind QR/NFC-Leistungsnachweis, Checkliste mit Foto, QR-Mängelmeldung und Kundenportal mit Ticketstatus bei Branchensoftware bereits belegt (überwiegend Herstellerangaben). Für Kleinbetriebe sind diese Funktionen reine Software- bzw. Softwaretag-Themen (NFC-Tag ca. 1–2 EUR) und damit der realistischste Hebel für eine schlanke Web-App.

### Cited Findings
- Digitalisierungs-Ratgeber (Anbieter Hagel IT, Marketing; veröffentlicht 29.09.2023, aktualisiert 24.04.2026): QR/NFC-Tag am Objekt als Check-in/Check-out, GPS bestätigt Standort, Leistungen werden per Checkliste abgehakt, bei Sondereinsätzen Fotos, am Ende entsteht der Leistungsnachweis automatisch; Kunde erhält ihn per Portal oder E-Mail. Kundenportal: Reklamationen melden, Leistungsnachweise einsehen, Sondereinsätze buchen, Rechnungen abrufen. Behauptete Ersparnis 2–4 Std./Objektleiter/Woche (Eigenangabe). NFC-Tag ca. 1–2 EUR; Software ca. 20–45 EUR/Mitarbeiter/Monat; Einrichtung 8.000–30.000 EUR (Schätzung des Anbieters); Kjello-Kundenportal 29 EUR/Arbeitsplatz/Monat; laut BIV nutzt rund ein Drittel der Betriebe flächendeckend Branchensoftware — [Hagel IT](https://www.hagel-it.de/it-insights/digitalisierung-in-der-reinigungsbranche-so-geht-gebaeudereinigung-2026)
- KleanApp (Lexware-Partner): Mängelmeldung per QR-Code (z. B. in der Toilette) und per objektspezifischem Link, Kunde muss kein Nutzer sein; Tickets gehen über ein Rechtesystem in Echtzeit an den Verantwortlichen; Fotos in Formularen; Qualitätsreports mit Grafiken/Statistik/Bildern als PDF/Excel; Protokoll für Audits/gemeinsame Begehungen; digitale Kundensignatur auf Arbeitsscheinen, die als PDF an die Rechnung gehängt werden. Kein Kundenportal auf der Funktionsseite beschrieben; keine Preise — [KleanApp Funktionen](https://www.kleanapp.net/en/Home/Functions), [Lexware-Partnerseite](https://www.lexware.de/partner/kleanapp/)
- Mendato: Kundenportal, über das Kunden Reklamationen oder Zusatzaufträge als Ticket eröffnen und Status (offen, geplant, erledigt) sehen; Marketingthema "Abschlussquote erhöhen" — [Mendato Hilfe](https://intercom.help/mendato/de/articles/11095576-kundenportal-nutzen-um-abschlussquote-zu-erhohen)
- Weitere DACH-Anbieter mit QR/NFC/GPS-Leistungsnachweis laut Marktübersicht: A.S.E. (NFC, QR, GPS), BetreiberCockpit (QR + Zeitstempel), PlanD, Profacilo, MR.Clean; nur gelistet, Funktionen nicht geprüft — [softguide Gebäudereinigung](https://www.softguide.de/software/reinigung), [softguide A.S.E.](https://www.softguide.de/programm/ase-workgroups-gebaeudereiniger-software)
- US/Intl. Referenz (aus früherem Bericht, nicht neu geprüft): Scan4Clean (öffentliche Sauberkeitsbewertung per QR) und Kundenportale bei Janitorial Manager/CleanTelligent — [Janitorial Manager QR-Codes](https://www.janitorialmanager.com/?p=65587), [CleanTelligent](https://cleantelligent.com/solutions/janitorial-inspection-software/)
- Cleancode (Plattform für Transparenz/Accountability in Facility-Reinigung, Business Wire 28.02.2022): Hersteller-PR, Details nicht gelesen — [Business Wire](https://www.businesswire.com/news/home/20220228005766/en/New-Cleancode-Platform-Creates-Transparency-and-Accountability-Around-Facility-Cleaning)

### Inferences
- "Ihr Objekt wurde heute um 19:42 gereinigt" ist technisch ein Ableitungsprodukt aus Check-out-Zeitstempel + abgehakter Checkliste; kein zusätzlicher Hardwarebedarf außer NFC/QR-Tag.
- NPS/Feedback nach Einsatz: In den geprüften Quellen als Produktfunktion nicht belegt (nur als KPI "Kundenzufriedenheit"); lässt sich als Ein-Klick-Bewertung (1–5 Sterne) per QR/E-Mail-Link trivial umsetzen.
- Zusatzleistungs-Katalog/Upselling: Sondereinsätze buchen (Hagel IT) und Zusatzaufträge als Ticket (Mendato) belegen das Muster; Preislisten-Katalog mit Anfragebutton ist ein kleiner Schritt.

### Gaps
- Kein Beleg zu NPS-Modulen, Servicezeiten-Kalender im Portal, Kundenfreigabe von Audits (nur Kundensignatur bei KleanApp und gegenzeichnete Inspektion bei CleanTelligent aus früherem Bericht).
- Keine unabhängige Evidenz für Zeitersparnis-/Reklamationsreduktion durch Portale; alle Zahlen Anbieterangaben.
- Preise von KleanApp, Mendato, A.S.E. nicht gefunden.

## 2. Smarte Gebäudereinigung (Sensorik/IoT)

### Takeaway
Sensorgesteuerte Reinigung ist am besten für Großobjekte mit hoher Besucherfrequenz belegt (Einkaufszentren, Flughäfen); quantifizierte Einsparungen sind rar (15 % Tork-Fall, 20 % Locatee-Claim, ca. 10 % Hochschul-Pilot) und alle nicht unabhängig geprüft. Preise sind nicht öffentlich. Für Kleinbetriebe ist Eigenbetrieb nicht sinnvoll; eher ein Importthema (Daten/Alarm per Webhook) bei Kundenwunsch.

### Cited Findings
- Tork Vision Cleaning (Essity): Besucherzähler plus vernetzte Spender liefern Echtzeitdaten, wo gereinigt werden muss. Herstellerbehauptungen aus einer eigenen Umfrage unter 69 Nutzern in 18 Ländern (Nov/Dez 2023): Spender zu 99 % gefüllt, 75 % weniger Beschwerden, 68 % Effizienzgewinn (Selbstauskunft, Marketing-Bias) — [Tork Vision Cleaning](https://torkglobal.com/us/en/visioncleaning), [Tork Meilenstein](https://www.torkglobal.com/us/en/about/press-and-news/tork-achieves-milestone), [European Cleaning Journal](https://www.europeancleaningjournal.com/magazine/articles/latest-news/tork-makes-the-switch-to-datadriven-cleaning-easier-than-ever-with-tork-vision-cleaning)
- Fall Ülemiste Centre (Tallinn, Baltic Times, April 2025): Überschrift "cuts costs by 15%"; knapp 800.000 WC-Besuche in sechs Monaten, bis 6.000 Besucher/Tag. Seite beim Abruf mit 403 gesperrt, Messmethode des 15-%-Wertes nicht verifizierbar — [Baltic Times](https://www.baltictimes.com/innovation_in_retail___lemiste_centre_s_smart_cleaning_solution_cuts_costs_by_15_)
- Tork-Hardware: Level Sensor 3.0, Sensor Communication Unit 3.0 (benötigt Bluetooth-Access-Points oder Tork Gateway 3.0), drei Reinigungsmodi (Facility Flow, Refill on Demand, Customized Cleaning); keine Preise veröffentlicht — [Tork Sensor Communication Unit 3.0](https://www.torkglobal.com/gb/en/product/652846), [Tork Level Sensor 3.0](https://www.torkglobal.com/gb/en/product/652918), [Imperial Dade](https://www.imperialdade.com/spotlight/essity-vision-clean)
- Infogrid Smart Cleaning Pro (Start Mai 2024): Hardware erkennt Anwesenheit eines Fobs und zeigt per Farbblinken Reinigungsstatus eines Raums; Integration mit VergeSense (Belegungssensoren) — [CMM Online](https://cmmonline.com/news/infogrid-debuts-smart-cleaning-pro-for-data-driven-cleaning-operations), [VergeSense](https://www.vergesense.com/resources/press/data-driven-commercial-cleaning-infogrid-integrates-vergesense-for-smarter-maintenance), [Facilities Dive](https://www.facilitiesdive.com/news/infogrid-technology-for-data-driven-commercial-cleaning-operations/716467/). Keine quantifizierte Einsparung gefunden.
- Locatee (Belegungsanalyse): Datenblatt behauptet, FHNW habe mit Smart Cleaning plus Locatee-Daten 20 % Reinigungskosten gespart (Vendor, ohne Methodik) — [Cisco Partnerseite Locatee](https://cisco.com/c/en/us/solutions/smart-building/partner-ecosystem/content-hub/locatee.html), [Tango/Locatee Ressource](https://resources.tangoanalytics.com/i/1519783)
- Politecnico-di-Milano-Abschlussarbeit: modellierter/pilotierter Occupancy-Ansatz, ca. 10 % Reduktion im optimierten Szenario (akademisch, kein Realeinsatz einer Marke) — [Politesi](https://www.politesi.polimi.it/handle/10589/194932)
- Mapiq/ENGIE: Ergebnisse betreffen Arbeitsplatznutzung (+36 % Meetingraumnutzung, +30 % Schreibtischnutzung), nicht Reinigungseinsparung — [casestudies.com ENGIE/Mapiq](https://www.casestudies.com/company/mapiq/case-study/engie-customer-case-study)
- C&W "Hybrid Clean" (aus früherem Bericht): Occupancy/Smart-Restroom-Auslöser, keine Einsparzahlen — [Propmodo 2024](https://propmodo.com/?p=9268)
- Wirtschaftliche Einordnung: Fachbeitrag betont Sensorik, Cloud und Kostendruck als Treiber; Maschinen sollen Leistungsberichte in Echtzeit senden — [produktion.de](https://www.produktion.de/instandhaltung/sauberer-betrieb-digitalisierung-in-der-industriereinigung/1652648)

### Inferences
- Die einzigen Zahlen (10/15/20 %) sind Pilot-/Marketingwerte; als "Potenzial in Großobjekten, nicht belegt" darstellen.
- Wirtschaftlich nur dort, wo Besucherfluss stark schwankt (Mall, Flughafen, Hochschule); Büro mit festen Nutzern bringt weniger.
- Zu Kärcher/Tennant/Nilfisk/Diversey Sensorik: siehe Abschnitt 3; Spenderfüllstand, Luftqualität: nur Tork belegt, Luftqualität/Infogrid-Sensoren nicht vertieft.

### Gaps
- Keine Preise für Tork/Infogrid/Mapiq/Locatee öffentlich; Mapiq-Reinigungsfunktion nicht belegt.
- Keine unabhängige Studie zu Einsparungen gefunden. Baltic-Times-Text gesperrt. Kostenvergleich Sensor vs. fixe Reinigungsfrequenz nicht belegt.
- Gegenbauer, Kötter: kein Treffer zu Digitalprogrammen.

## 3. Robotik-Management

### Takeaway
Roboterbetrieb ist ein Großbetrieb-/Großkundenthema (WISAG-Flotte 500 Geräte), aber Hersteller liefern ihre eigenen Cloud-Portale mit Coverage-Maps und Berichten. Eine schlanke Verwaltungs-App kann Roboter als Objekt-Ressource führen (Einsatzplan, Wartung, Reports als Dateianhang), nicht die Flotte selbst steuern.

### Cited Findings
- WISAG (Pressemitteilung 01.06.2026, nur aus Suchsnippet; PDF binär, nicht gelesen): Roboterflotte wächst bis Jahresende auf 500 Geräte; neues Modell R5, zwei Jahre mit Praxiserfahrung entwickelt; Stellenanzeige für bundesweites Robotik-Monitoring — [WISAG PM](https://www.wisag.de/fileadmin/user_upload/wisag-de/newsroom/news-facility-20260601-WGR-R5/2026_PM_WGR_500_Reinigungsroboter.pdf), [WISAG Stellenanzeige](https://jobjump.net/jobs/projektmitarbeiter-mwd-robotik-or-gebaudereinigung-1d9bb1c3-823a-571a-b938-14ee4249e766)
- Kärcher: KIRA B 50 sendet Status- und Reinigungsberichte per IoT (Telekom-Netz) in die Cloud; Kärcher Fleet als Webportal. Verzeichniseintrag: Fleet nur mit Kärcher-Hardware sinnvoll, Preis auf Anfrage — [CIO.de](https://www.cio.de/article/3698305/kaercher-vernetzt-reinigungsroboter-mit-iot.html), [Telekom](https://www.telekom.com/de/medien/medieninformationen/detail/kaercher-setzt-auf-globales-iot-netz-der-telekom-1048298), [ComputerWoche](https://www.computerwoche.de/article/2724248/wie-fleet-management-die-gebaeudereinigung-revolutioniert.html), [ki-syndikat Kärcher](https://www.ki-syndikat.de/tools/kaercher/)
- Avidbots Command Center: Coverage-Maps, Produktivitätskennzahlen, Berichte als SLA-Nachweis — [The Robot Report](https://www.therobotreport.com/neo-2-cleaning-robot-includes-avidbots-updates-ai-fleet-management/), [sp-edge](https://sp-edge.com/companies/203896)
- Herstellerneutrale Flottensoftware: ToolSense Robotics Management, Numatic Service One — [ToolSense](https://toolsense.io/product/robotics-management)
- TASKI (Diversey) Ecobot 50 Pro: Sensorik mit 360-Grad-Erfassung (Herstellerinfo) — [Diversey Blickpunkt Gebäudereinigung](https://hub.diversey.com/hubfs/97016-LIT-Blickpunkt_Gebaudereinigung-Webversion-de-CH-HRNC-3.pdf)
- Kosten (Anbieter-Blog, USA): Anschaffung 15.000 bis 80.000+ USD, Scheuersaug-Roboter-Leasing ca. 1.795 USD/Monat, Fleet-Software 50–500 USD/Roboter/Monat — [Keyi Robot](https://keyirobot.com/de-de/blogs/insights/service-robot-cost); Amortisationsangabe "unter 18 Monate" ohne Methodik — [Mordor Intelligence](https://www.mordorintelligence.com/de/industry-reports/cleaning-robot-market)
- Fall aus früherem Bericht: Flughafen-Test, ROI 14 Monate (C&W-Schätzung) — [Propmodo](https://propmodo.com/?p=9268)

### Inferences
- Nützliches App-Feature: Roboter je Objekt (Gerät, Seriennummer, Fläche, Einsatztage, Wartung, Störungsprotokoll, Report-PDF-Upload). Keine Herstellerintegration nötig (APIs nicht belegt).
- Für Kleinbetriebe nur sinnvoll bei großen Hartbodenflächen; Mietpreise in Deutschland nicht belegt.

### Gaps
- Keine API-Dokumentation zu Kärcher Fleet/Avidbots/Nilfisk/Tennant/Brain Corp gefunden (Tennant, Brain Corp, Nilfisk-Details: keine eigenen Ergebnisse). Deutsche Miet-/Leasingpreise nicht gefunden.

## 4. Raumbuch, Digital Twin, Flächenerfassung

### Takeaway
Raumbuch mit automatischer Flächenberechnung ist im öffentlichen Bau bekannt; LiDAR-Grundrisse per Smartphone sind möglich, aber ±1–3 cm Genauigkeit und Herstellerhinweise gegen präzise Aufmaße. Eine reinigungsspezifische automatische Leistungswert-Berechnung aus Scans wurde nicht belegt.

### Cited Findings
- Sachsen stepIN RGB 2.0 Pflichtenheft (2022): Datenbankgestütztes Raum- und Gebäudebuch, automatische Flächen-/Umfangsberechnung aus Zeichnungen (DXF/DWG), Sachdaten als Excel — [SIB Sachsen](https://www.sib.sachsen.de/download/StepIN%20RGB/Pflichtenheft_V3_01_2022.pdf)
- LiDAR-/KI-Grundrissapps (magicplan, RoomSketcher): Wand-/Türerkennung, schneller aber weniger genau (±1–3 cm); RoomSketcher FloorCapture ausdrücklich nicht für präzises Handwerker-Aufmaß — [ki-syndikat Aufmaß](https://www.ki-syndikat.de/usecases/handwerk/11-grundriss-aufmass-ki/), [ki-syndikat magicplan](https://www.ki-syndikat.de/tools/magicplan/), [ki-syndikat RoomSketcher](https://www.ki-syndikat.de/tools/roomsketcher/)
- Matterport LiDAR-Raumkartierung — [Matterport](https://matterport.com/de/blog/lidar-room-mapping)
- Digitales Aufmaß Appvergleich — [clean-invoice](https://www.clean-invoice.com/wissen/allgemein/digitales-aufmass-apps)

### Inferences
- Realistisch für die App: manuelle Raumliste (Raumtyp, m², Bodenbelag, Frequenz) + Import CSV/Excel; Foto-/Scan-Import als Anhang. Leistungswert (m²/h) bleibt interne Kalkulation je Raumtyp. CAFM/BIM-Import: eher IFC/Excel-Export-Import, kein belegter Standard in der Reinigung.

### Gaps
- Keine Quelle zu Reinigungs-Leistungswerten (m²/h nach Tarif/GEFMA/RAL) oder automatischer Ableitung aus Scan; kein Reinigungs-CAFM-Import belegt.

## 5. Nachhaltigkeit, ESG und Nachweise

### Takeaway
Kleine Reinigungsfirmen erhalten zunehmend ESG-Fragebögen von Großkunden. Praktisch relevant sind ein Verbrauchsnachweis (Mittelart/-menge, Zertifikate) und Tariftreue-/Mindestlohnnachweise; Blauer Engel und EU Ecolabel erscheinen in öffentlichen Ausschreibungen als Nachweis für Produkte.

### Cited Findings
- ESG-Fragebogen-Typen (Anbieter-Ratgeber, Marketing): Scope 1 Fuhrpark, Chemikalienverbrauch nach Produktgruppe, Wasserverbrauch je Objekt, Verpackungsrecycling, Schulungsquote, Arbeitsunfälle/1.000 Stunden; EcoVadis/ISO 14001 teils in Ausschreibungen; Aufwand erster Bericht 4–8 Wochen ohne KI, Folgefragebogen 3–5 Tage (Eigenangaben); EcoVadis ab 429 EUR/Jahr für bis 25 Mitarbeiter — [ki-syndikat ESG-Reporting](https://www.ki-syndikat.de/usecases/reinigung/09-nachhaltigkeitsreporting-esg/)
- Leadity: Branchenlösung ESG, mit BIV entwickelt; Referenzkunden laut Anbieter Piepenbrock, WISAG, Dussmann; Preis auf Anfrage; wenige OMR-Reviews, fehlende volle ESRS-Verknüpfung kritisiert. Zeitangaben zur Veröffentlichung der Pilotstudie widersprüchlich: ki-syndikat nennt einmal 26.01.2026 (rationell reinigen), die Suche zeigt "2024" — nicht verifiziert — [Leadity Gebäudereinigung](https://leadity.de/en/esg-industry-solutions/building-cleaning/), [OMR Leadity](https://omr.com/de/reviews/product/leadity), [ki-syndikat Leadity](https://www.ki-syndikat.de/tools/leadity/)
- Ausschreibungsanforderungen: Graz verlangt Umweltzeichen (EU Ecolabel, Blauer Engel u. a.) und auf Verlangen Mittel- und Mengenliste; Kanton Zürich verlangt Nachweis, EU Ecolabel/Nordic Swan/C2C/Blauer Engel gelten als konform; Berlin Leistungsblatt fordert DE-UZ 194 bzw. Prüfberichte (Stand 2018); UBA-Beispiel (Salzgitter): Bieter bestätigen Zahlung von Tarif- und Mindestlöhnen — [Graz](https://www.umwelt.graz.at/cms/dokumente/10246703_6310211/30d6f7ee/%C3%96KOPROFIT%20Beschaffungsrichtlinie-Reinigung_Kriterien%20Dienstleistung.pdf), [Kanton Zürich](https://www.zh.ch/de/politik-staat/kanton/kantonale-verwaltung/beschaffung-einkaeufe/nachhaltige-beschaffung/beschaffungsleitlinien/reinigung.html), [Berlin Leistungsblatt 21](https://berlin.de/nachhaltige-beschaffung/_assets/leistungsblaetter/21_reinigungsdienstleistungen-gebaeude.pdf), [UBA Salzgitter](https://www.umweltbundesamt.de/themen/wirtschaft-konsum/umweltfreundliche-beschaffung/gute-praxisbeispiele/unterhaltsreinigung/umweltbundesamt-reinigungsleistungen-fuer)
- Blauer Engel DE-UZ 194 (Handgeschirrspülmittel und Reiniger für harte Oberflächen) Ausgabe 01/2022 mit Abschnitt 3.10 "Dosage requirements", Gültigkeit bis 31.12.2026 (Nachfolgeversion nicht geprüft); UBA: auch Umweltzeichen-Mittel nur bei korrekter Dosierung vorteilhaft. DE-UZ 104 (Nassreinigungsdienstleistung) Ausgabe 2009 — [Blauer Engel DE-UZ 194 Kriterien](https://produktinfo.blauer-engel.de/uploads/criteriafile/en/203/DE-UZ%20194-202201-en%20criteria-V2.pdf), [UBA Reinigung](https://www.umweltbundesamt.de/reinigungsdienstleistungen-mittel-0), [DE-UZ 104](https://produktinfo.blauer-engel.de/uploads/criteriafile/de/DE-UZ%20104-200904-de%20Kriterien-V5.pdf)
- Bundestariftreuegesetz (BTTG): ausgefertigt 27.04.2026, BGBl. 2026 I Nr. 119 vom 30.04.2026, gilt seit 01.05.2026 für Bundesaufträge; Schwelle 50.000 EUR netto, Dienstleistungen erfasst, Länder/Kommunen nicht; Präqualifizierungszertifikat ersetzt Einzelnachweise; bei Aufträgen bis zwei Monate nur Entlohnungsbedingungen — [Vergabeblog 05.05.2026](https://vergabeblog.de/2026-05-05/bundestariftreuegesetz-im-bundesgesetzblatt-veroeffentlicht-grosse-wirkung-trotz-begrenztem-anwendungsbereich/), [Lexware](https://www.lexware.de/wissen/mitarbeiter-gehalt/bundestariftreuegesetz/), [Gesetze im Internet BTTG](https://www.gesetze-im-internet.de/bttg/BJNR0770B0026.html)

### Inferences
- Dankbare App-Funktion: Chemie-Verbrauchsnachweis je Objekt (Produkt, Zertifikat, Menge) und Export als Liste für Ausschreibungen/ESG-Fragebogen; Tariftreue-Nachweis als Dokumentenablage plus Auswertung der Lohnzahlung aus Zeiterfassung (ohne Gehalt).
- Eigenes CO2-Reporting je Objekt (Fahrten, Verbrauch) erfordert Datenerfassung; für Kleinbetrieb als reiner Export-Report realistisch.

### Gaps
- LkSG/CSRD-Omnibus-Schwellen und Folgen für KMU-Lieferketten: nicht belegt. EU Ecolabel-Kriterien für Reinigungsdienste nicht gefunden. Keine Belege für Kennzahlen zur automatischen Dosierung (Dosiergeräte/Dosierprotokolle) als Software-Feature.

## 6. Katalog: Feature | Eignung für Kleinbetrieb und Aufwand

| Feature | Anbieter/Beispiel | Beleg-URL | Workflow | Reifegrad | Für Kleinbetrieb realistisch | Aufwand für unsere App |
|---|---|---|---|---|---|---|
| NFC/QR-Check-in mit Checkliste und Zeitstempel | A.S.E., Hagel IT, Janitorial Manager | [Hagel IT](https://www.hagel-it.de/it-insights/digitalisierung-in-der-reinigungsbranche-so-geht-gebaeudereinigung-2026) | Tag am Objekt scannen, Checkliste, Check-out | Etabliert | Ja (Tag ca. 1–2 EUR) | Mittel |
| Echtzeit-Status "gereinigt um 19:42" | Portal-Muster Hagel IT/Mendato | [Mendato](https://intercom.help/mendato/de/articles/11095576-kundenportal-nutzen-um-abschlussquote-zu-erhohen) | Check-out erzeugt Statusereignis im Portal | Etabliert | Ja | Klein-Mittel |
| QR-Mängelmeldung ohne Login | KleanApp | [KleanApp](https://www.kleanapp.net/en/Home/Functions) | QR im Raum, Formular, Ticket an Verantwortlichen | Etabliert | Ja | Klein |
| Kundenportal mit Ticketstatus und Zusatzauftrag | Mendato, Kjello (29 EUR/Platz) | [Hagel IT](https://www.hagel-it.de/it-insights/digitalisierung-in-der-reinigungsbranche-so-geht-gebaeudereinigung-2026) | Kunde meldet, sieht Status, bucht Sondereinsatz | Etabliert | Ja | Mittel |
| Foto-/Checklisten-Nachweis und Kundensignatur | KleanApp | [KleanApp](https://www.kleanapp.net/en/Home/Functions) | Foto im Auftrag, Kunde unterschreibt, PDF an Rechnung | Etabliert | Ja | Klein-Mittel |
| Audit-Protokoll mit Kundenfreigabe | KleanApp, CleanTelligent | [CleanTelligent](https://cleantelligent.com/solutions/janitorial-inspection-software/) | Begehung, Score, Gegenzeichnung | Etabliert | Ja | Mittel |
| Monats-/Quartalsreport PDF | KleanApp | [KleanApp](https://www.kleanapp.net/en/Home/Functions) | Auswertung Inspektionen/Tickets automatisch | Etabliert | Ja | Mittel |
| Kundenfeedback/NPS nach Einsatz | nicht als Produkt belegt | (Lücke) | Link nach Einsatz, 1 Klick | Unbelegt | Ja | Klein |
| Bedarfsgesteuerte Reinigung (Besucherzähler, Spenderfüllstand) | Tork Vision Cleaning | [Tork](https://torkglobal.com/us/en/visioncleaning) | Sensoren melden Bedarf, App-Alarm | Früh bis etabliert in Großobjekten; Einsparclaims 15 %/20 % unverifiziert | Nein (Hardware, Kosten nicht öffentlich) | Hoch; nur Webhook-Import sinnvoll |
| Raumbelegung/Smart-Cleaning-Fob | Infogrid, VergeSense, Locatee | [CMM Online](https://cmmonline.com/news/infogrid-debuts-smart-cleaning-pro-for-data-driven-cleaning-operations) | Belegung triggert Aufgabe | Pilot/früh | Nein | Hoch |
| Roboter-Flottenreporting | Kärcher Fleet, Avidbots, ToolSense | [ToolSense](https://toolsense.io/product/robotics-management) | Herstellerportal liefert Reports | Etabliert bei Herstellern | Nur bei Großfläche | Klein als Geräte-/Berichtsablage, hoch als Integration |
| Roboter-Einsatz im Dienstplan | WISAG-Flotte | [WISAG](https://www.wisag.de/fileadmin/user_upload/wisag-de/newsroom/news-facility-20260601-WGR-R5/2026_PM_WGR_500_Reinigungsroboter.pdf) | Gerät als Ressource je Objekt | Wachsend | Nein/Randthema | Klein-Mittel |
| Raumbuch mit automatischer Flächenberechnung | stepIN RGB | [SIB Sachsen](https://www.sib.sachsen.de/download/StepIN%20RGB/Pflichtenheft_V3_01_2022.pdf) | Räume erfassen, Summen automatisch | Etabliert (öff. Bau) | Ja (manuell/Excel) | Mittel |
| LiDAR-Aufmaß per Smartphone | magicplan, RoomSketcher | [ki-syndikat](https://www.ki-syndikat.de/usecases/handwerk/11-grundriss-aufmass-ki/) | Scan, Grundriss, m² | Etabliert, Genauigkeit begrenzt | Teilweise (externe App) | Klein (Import) |
| Verbrauchsnachweis Reinigungsmittel mit Zertifikat | Anforderungen Graz, Zürich, Berlin | [Kanton Zürich](https://www.zh.ch/de/politik-staat/kanton/kantonale-verwaltung/beschaffung-einkaeufe/nachhaltige-beschaffung/beschaffungsleitlinien/reinigung.html) | Produktliste je Objekt, Menge, Zertifikat-Nachweis | Gefordert in Ausschreibungen | Ja | Klein-Mittel |
| ESG-Reporting | Leadity (BIV) | [Leadity](https://leadity.de/en/esg-industry-solutions/building-cleaning/) | Daten sammeln, Fragebogen beantworten | Früh/etabliert für Großkunden | Eingeschränkt; Export-Report ja | Mittel |
| Tariftreue-Nachweis | BTTG | [Vergabeblog](https://vergabeblog.de/2026-05-05/bundestariftreuegesetz-im-bundesgesetzblatt-veroeffentlicht-grosse-wirkung-trotz-begrenztem-anwendungsbereich/) | Dokumente ablegen, Lohnnachweise exportieren | Neu seit 05/2026 (Bund, ab 50.000 EUR) | Ja bei Bundesaufträgen | Klein-Mittel |

### Inferences (Gesamt)
- Realistisch für Kleinbetrieb: alle Software-only-Funktionen (Check-in, Status, QR-Meldung, Portal, Audits, Reports, Feedback, Verbrauchsnachweis, Tariftreue-Ablage). Großkonzern-Themen: Sensorik, Roboterflotten, Digital Twin/BIM, vollständiges ESG nach ESRS.
- Datenschutz/Betriebsrat bei Geofencing und Personenscores siehe früherer Bericht.

### Gaps (Gesamt)
- Gesperrt: Baltic Times (403). Nicht lesbar: WISAG-PDF (binär), BSCAI (aus früherem Bericht). Gegenbauer/Kötter/Dussmann-Digitalprogramme kaum belegt; INTERCLEAN-/Rationell-reinigen-Berichte nicht abgerufen; Tennant, Brain Corp, Nilfisk, Diversey-Dosiersysteme nicht eigenständig recherchiert.
