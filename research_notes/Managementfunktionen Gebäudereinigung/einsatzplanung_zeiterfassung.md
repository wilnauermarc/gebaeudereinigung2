# Einsatz- und Personalplanung, Objektbesetzung und Zeiterfassung in der deutschen Gebäudereinigung

Rechtsstand der Recherche: 02.11.2026. Überwiegend Sekundärquellen (Ratgeber, Kanzleiblogs); Primärquellen sind markiert. Keine Rechtsberatung.

## 1. Wie läuft Einsatzplanung in der Praxis ab, und welche Objektdaten braucht man?

### Takeaway
Belegt ist nur ein dünnes Bild: Springer und Vertretungsrollen sind übliche Stellenprofile, Stundenzettel auf Papier sind noch weit verbreitet, und Software-Anbieter bündeln Objektmanagement, Personalplanung und QR/NFC-Leistungsnachweis. Konkrete Belege zu Reinigungsplan, Rhythmus oder Leistungsverzeichnis (LV) als Softwarefunktion fanden sich nicht. Das Objekt-Datenmodell ist daher überwiegend Inferenz.

### Cited Findings
- Stellenanzeigen zeigen das übliche Muster: Springer decken Ausfälle ab, und manche Stellen verlangen die Vertretung des Objektbetreuers bei Urlaub oder Krankheit. Beispiel: [AWO-Stelle Springerin Unterhalts- und Sonderreinigung](https://www.awo-jobs.de/stellenangebote/stellenangebot/124360-mitarbeiterin-in-der-unterhalts-und-sonderreinigung-als-springerin?type=123) und [Minijob als Krankheits- und Urlaubsvertretung](https://www.medi-karriere.de/job/stellenanzeige-reinigungskraft-49134_wallenhorst-pädiatrie-ee721e3823933dd66f19d88185784930/).
- Branchenquellen nennen hohe Krankenstände und Fluktuation; Krankmeldungen am Montagmorgen lösen Telefonstress aus, Objekte bleiben teils ungereinigt (Quelle zur Einordnung eher Blog-Niveau) — [ki-syndikat.de, Mitarbeiterplanung](https://www.ki-syndikat.de/usecases/reinigung/03-mitarbeiterplanung-schichtorganisation/).
- Viele Betriebe erfassen Arbeitszeiten noch handschriftlich auf Stundenzetteln, die im Büro nachträglich ausgewertet werden — [softwareabc24.de](https://www.softwareabc24.de/gebaeudereiniger-software).
- Eine Ausschreibung eines Gebäudereinigers nennt als Anforderungen: Einsatzplanung für einmalige und wiederkehrende Einsätze sowie Verwaltung von Objekten und Kundendaten — [softguide.de Ausschreibung](https://www.softguide.de/ausschreibungen/gebaeudereiniger-sucht-branchenloesung-2).
- Ein Praxisartikel 2026 nennt als Digitalisierungshebel: Objektmanagement, Personalplanung, QR-/NFC-Leistungsnachweis, mobile Dispo-App, digitale Zeiterfassung — [hagel-it.de](https://www.hagel-it.de/it-insights/digitalisierung-in-der-reinigungsbranche-so-geht-gebaeudereinigung-2026).
- PlanD wirbt mit Einsatzplanung, mobiler Zeiterfassung, Lohnabrechnung und Rechnungsstellung auf einer Plattform — [PlanD](https://pland.app/en/software-cleaning-businesses); Schichtplanung speziell für Reinigungsfirmen — [PlanD Shift planning](https://pland.app/en/features/shift-planning-for-cleaning-companies).
- Ein Anbieter erfasst neben Zeit auch Leistung (Reinigung mit Foto, optional Standortprüfung) — [ShiftFlow Janitorial](https://www.shiftflow.app/de/industries/janitorial).

### Inferences
- Ein Objekt braucht mindestens: Stammdaten/Adresse, Kunde, Ansprechpartner, Zugang (Schlüssel/Transponder/Alarmcode), Soll-Stunden pro Reinigung bzw. pro Monat, Rhythmus (Wochentage, Uhrzeitfenster, 1x/Woche, 14-täglich, monatlich), Leistungsverzeichnis (Bereiche, Tätigkeiten, Intervalle) und Stammbesetzung (Hauptkraft plus feste Vertretung). Dies leitet sich aus den genannten Anforderungen ab, ist aber nicht im Detail belegt.
- Sinnvolles Modell: Objekt-Vorlage (wiederkehrend) erzeugt Wochen-Einsätze; Abweichungen (Vertretung, Sonderreinigung) werden als Einzeleinsätze überschrieben. Soll-/Ist-Stunden pro Objekt ist die zentrale Kontrollgröße.

### Gaps
- Keine belastbare Quelle zu typischen Reinigungsplan-/LV-Strukturen, Tourenplanung oder Rhythmus-Konventionen (z. B. DIN 77400 / Leistungsbeschreibungen); gezielte Recherche bei BIV, DIN 77400 oder RAL-Leitfäden nötig.
- Keine unabhängigen Funktionsvergleiche oder Preise der Software-Anbieter.

## 2. Rechtliche Anforderungen an die Arbeitszeiterfassung (Stand 02.11.2026)

### Takeaway
Heute gilt: allgemeine Erfassungspflicht nach BAG 2022 (ohne Formvorgabe), dazu branchenspezifische Aufzeichnung Beginn/Ende/Dauer binnen 7 Tagen und 2 Jahre Aufbewahrung für Gebäudereinigung (§ 17 MiLoG i. V. m. § 2a SchwarzArbG) sowie für alle Minijobber. Das Gesetz zur elektronischen Erfassung ist nur ein Referentenentwurf (Juni 2026), noch nicht in Kraft.

### Cited Findings
- BAG, Beschluss vom 13.09.2022 (1 ABR 22/21): Pflicht zur Arbeitszeiterfassung wird unionsrechtskonform aus § 3 Abs. 2 Nr. 1 ArbSchG abgeleitet; elektronische Erfassung ist nicht vorgeschrieben, Papier genügt; Verstoß ist keine Ordnungswidrigkeit nach § 25 ArbSchG — [Norton Rose Fulbright](https://www.nortonrosefulbright.com/de-de/wissen/publications/c5306eab/working-time-compliance-bag-ruling-on-systematic-recording-of-working-time), [Gleiss Lutz](https://www.gleisslutz.com/de/know-how/bag-zur-zeiterfassungspflicht-klarheit-aus-erfurt), [IHK Bodensee-Oberschwaben](https://www.ihk.de/bodensee-oberschwaben/recht/arbeitsrecht/verpflichtung-zeiterfassungssystem-5640024). (Die Zusammenfassung zu Ordnungswidrigkeit stammt aus Suchzusammenfassung; Volltext nicht geprüft.)
- § 17 Abs. 1 MiLoG (Primärquelle): Beginn, Ende und Dauer der täglichen Arbeitszeit sind spätestens bis zum Ablauf des siebten auf den Tag der Arbeitsleistung folgenden Kalendertags aufzuzeichnen; Aufbewahrung mindestens 2 Jahre. § 17 Abs. 2: Unterlagen sind im Inland, auf Deutsch, für die Dauer der Beschäftigung (max. 2 Jahre) bereitzuhalten; Kontrolle am Beschäftigungsort möglich — [gesetze-im-internet.de/milog/__17](https://www.gesetze-im-internet.de/milog/__17.html) (per WebFetch-Zusammenfassung).
- Gebäudereinigung gehört zu den Branchen des § 2a SchwarzArbG; die Aufzeichnungspflicht gilt zusätzlich für alle Arbeitgeber von Minijobbern (§ 8 Abs. 1 SGB IV) — [IHK Koblenz](https://www.ihk.de/koblenz/unternehmensservice/recht/arbeitsrecht/aufzeichnungspflichten-nach-dem-mindestlohngesetz-1478366).
- § 2a SchwarzArbG wurde zuletzt durch das Gesetz zur Modernisierung und Digitalisierung der Schwarzarbeitsbekämpfung geändert (laut buzer.de in Kraft seit 30.12.2025); Inhalt der Änderung nicht geprüft — [buzer.de](https://www.buzer.de/gesetz/5868/a159297.htm).
- § 16 Abs. 2 ArbZG (aktuell): Aufzeichnung nur der über 8 Stunden werktäglich hinausgehenden Arbeitszeit sowie Liste der Einwilligungen nach § 7 Abs. 7; Aufbewahrung mindestens 2 Jahre — [gesetze-im-internet.de/arbzg/__16](https://www.gesetze-im-internet.de/arbzg/__16.html).
- Referentenentwurf BMAS zur ArbZG-Änderung, Mitte Juni 2026 bekannt geworden (genaues Datum nicht belegt; eine Quelle nennt 18.06.2026): früher Entwurf, nicht offiziell veröffentlicht, kein Kabinettsbeschluss. Inhalt: Beginn, Ende, Dauer am Tag der Arbeit elektronisch erfassen; Technik offen (Terminal, App, Schichtplan möglich); Erfassung durch Beschäftigte oder Dritte, Arbeitgeber bleibt verantwortlich und kontrolliert stichprobenartig; Arbeitgeber bis zu 10 Beschäftigte und Privathaushalte dürfen dauerhaft nicht-elektronisch erfassen; Übergangsfristen ab Inkrafttreten: 1 Jahr (alle), 2 Jahre (unter 250 Beschäftigte), 5 Jahre (unter 50 Beschäftigte); Tarifverträge können Papier und Erfassung bis 7 Tage später zulassen; Aufbewahrung mind. 2 Jahre; Ordnungswidrigkeit (§ 22 ArbZG erweitert); Inkrafttreten am ersten Tag des Quartals nach Verkündung — [Energie und Recht](https://www.energieundrecht.com/blog-arbeitsrecht-zivilrecht/arbeitszeitgesetz-reform-2026-referentenentwurf).
- Weitere Entwurfsinhalte laut Ratgeber: wöchentliche statt täglicher Höchstarbeitszeit (durchschnittlich 48 h, über 12 Monate) nur für tarifgebundene Betriebe; Bußgeld bis 30.000 EUR laut einer Quelle — [clockin.de](https://www.clockin.de/blog/reform-des-arbeitszeitgesetzes---pflicht-zur-arbeitseiterfassung-in-2026). Ein Bericht zum Koalitionsausschuss Juli 2026 erwähnt, der Entwurf sei nicht im Reformpaket enthalten gewesen (Sekundärangabe).
- Kritik an Entwurf (hoher Verwaltungsaufwand, Beschränkung auf Tarifgebundene): ZDH und Bauwirtschaft laut Suchzusammenfassung — [topagrar](https://www.topagrar.com/betriebsleitung/news/arbeitszeitgesetz-pflicht-zur-elektronischen-erfassung-d-20026915.html), [EY](https://www.ey.com/de_de/insights/tax-law-magazine/zwang-zur-zeiterfassung).
- Der Entwurf von 2023 (BMAS, April 2023: elektronisch am Tag, Papier per Tarifvertrag bis 7 Tage später) wurde nie Gesetz — [Haufe 2023](https://www.haufe.de/oeffentlicher-dienst/personal-tarifrecht/gesetz-zur-erfassung-der-arbeitszeit_144_592420.html).
- Mindestlohn Gebäudereinigung: Lohngruppe 1 (Innen-/Unterhaltsreinigung) 15,00 EUR/h ab 01.01.2026 (2025: 14,25 EUR), Lohngruppe 6 (Glas/Fassade) 18,40 EUR; allgemeinverbindlich; Verordnung läuft laut gesetze-im-internet/buzer zum 31.12.2026 aus, Verlängerung/Nachfolge nicht bestätigt; IG BAU fordert 17 EUR — [lohn-info.de](https://www.lohn-info.de/mindestlohn_gebaeudereinigung.html), [gesetze-im-internet.de](https://www.gesetze-im-internet.de/tvmindestlohngeb_ude_2024/__2.html), [ms-aktuell](https://ms-aktuell.de/?p=156023). Ein Rechner (rulecalc) nennt 13,50 EUR, vermutlich veraltet und abweichend.

### Inferences
- Für ein Unternehmen mit 5–80 Mitarbeitenden: Die 7-Tage-Aufzeichnung in der Gebäudereinigung gilt heute bereits; ein Prototyp sollte tägliche Beginn/Ende/Dauer je Mitarbeiter speichern, Änderungen protokollieren und mind. 2 Jahre vorhalten (Export/Lesbarkeit für Zollkontrolle).
- Falls der Entwurf unverändert kommt: Betriebe unter 10 Beschäftigten sind ausgenommen; kleine Betriebe unter 50 hätten faktisch 5 Jahre Übergang. Da Gebäudereiniger aber ohnehin der § 17 MiLoG-Pflicht unterliegen, bleibt digitale Erfassung praktisch sinnvoll.
- Zeitrundungen (z. B. 15-Minuten-Takt) sind heikel; eine (nicht verifizierte) Meldung nennt ein BAG-Urteil 2025 dazu.

### Gaps
- Primärtexte des Referentenentwurfs (BMAS) und aktueller Wortlaut § 2a SchwarzArbG/AEntG § 19 (Verhältnis zu § 17 MiLoG) nicht eingesehen; AEntG-Aufzeichnungspflicht nicht gesondert belegt.
- Ausgleichsfristen, Pausenerfassung und Bußgeldhöhe im Entwurf: Quellen widersprüchlich/unklar.
- Aktueller Status (Kabinett, Bundestag) nach Juli 2026 nicht ermittelt; vor Verwendung BMAS-Seite prüfen.
- Verlängerung der Mindestlohn-VO ab 2027 ungeklärt.

## 3. Praxisnahe Zeiterfassung und Datenschutz

### Takeaway
Gängig sind QR/NFC am Objekt, PIN, Terminal und Mobile App (auch private Handys). GPS-Dauerortung ist datenschutzrechtlich kaum zulässig und für die Zeiterfassung nicht nötig; QR/NFC am Objekt ist die datensparsame Alternative.

### Cited Findings
- ShiftScan stempelt per NFC, QR, PIN oder Terminal ohne App, Nachlieferung der Buchungen ohne Empfang — [Capterra ShiftScan](https://www.capterra.com.de/software/1111359/ShiftScan). Blink me ermöglicht QR-Zeitstart auch am privaten Handy (laut Suchzusammenfassung).
- Ratgeber: Tag/QR am Objekt (z. B. Putzkammer) als Leistungsnachweis; DSGVO-konform konfigurieren, keine permanente GPS-Verfolgung — [hagel-it.de](https://www.hagel-it.de/it-insights/digitalisierung-in-der-reinigungsbranche-so-geht-gebaeudereinigung-2026). Nutzermeinung (kein Test): QR-Codes lassen sich kopieren, nicht alle Smartphones unterstützen NFC.
- GPS-Ortung von Beschäftigten: Verarbeitung nach Art. 88 DSGVO i. V. m. § 26 BDSG nur wenn erforderlich und verhältnismäßig (VG Lüneburg) — [dr-datenschutz.de](https://www.dr-datenschutz.de/vg-lueneburg-teilurteil-gps-ortung-von-firmenfahrzeugen-unzulaessig/); Dauerüberwachung unzulässig laut LfDI BW — [datenschutz-notizen.de](https://www.datenschutz-notizen.de/gps-der-arbeitgeber-mit-einwilligung-auf-schritt-und-tritt-dabei-0620192/); Einwilligung im Beschäftigungsverhältnis vom VG Wiesbaden als nicht freiwillig bewertet, Speicherung von Standortdaten über 400 Tage unverhältnismäßig — [activemind.legal](https://www.activemind.legal/de/guides/urteil-gps-daten/). Betriebsrat: § 87 Abs. 1 Nr. 6 BetrVG — [kanzlei-herfurtner](https://kanzlei-herfurtner.de/ueberwachung-von-arbeitnehmern/).

### Inferences
- Prototyp: Zeiterfassung ohne Standortdaten (manuell oder QR/PIN), optional Objekt-Code als Anwesenheitsnachweis; Löschfristen und Rollen/Rechte (Mitarbeitende sehen nur eigene Daten) einplanen.

### Gaps
- Kein Urteil speziell für Reinigungskräfte gefunden; einige Quellen beziehen sich auf alte § 26-BDSG-Fassung, EuGH C-34/21 (2023) nicht geprüft. Quellen überwiegend Kanzlei-/Anbieterblogs.

## 4. Typische Pain Points kleiner Reinigungsfirmen (Minijob, Teilzeit, Zuschläge, Urlaub, Krankheit)

### Takeaway
Minijob-Grenze 2026: 603 EUR/Monat bei Mindestlohn 13,90 EUR (Branchenmindestlohn 15,00 EUR ergibt nur ca. 40 h). Zuschläge und Urlaub/Krankheit sind fehleranfällig, besonders Feiertagszuschläge.

### Cited Findings
- Mindestlohn 2026: 13,90 EUR (2027: 14,60 EUR); Minijob-Grenze 603 EUR/Monat 2026 (2027: 633 EUR); Jahresgrenze 7.236 EUR; gelegentliches Überschreiten bis 1.206 EUR/Monat zulässig (Quellen uneinheitlich bei Details); Midijob 603,01–2.000 EUR — [Deutsche Rentenversicherung BW](https://www.deutsche-rentenversicherung.de/BadenWuerttemberg/DE/Presse/Pressemitteilungen/2025/251222_Minijob), [TK](https://www.tk.de/firmenkunden/service/fachthemen/versicherung-fachthema/mindestlohn-2026-minijobs-und-uebergangsbereich-2203074), [biallo.de](https://www.biallo.de/soziales/news/minijob-grenze-und-mindestlohn-steigen). Hinweis: Die vom Auftrag genannte "538 EUR" ist überholt (538 EUR galt 2024).
- Minijobber haben Anspruch auf gesetzlichen Urlaub (4 Wochen) und Entgeltfortzahlung im Krankheitsfall; Urlaub bemisst sich nach Arbeitstagen — [gegen-hartz.de](https://www.gegen-hartz.de/?p=175431), [Tagesspiegel](https://www.tagesspiegel.de/wirtschaft/arbeitgeber-im-kleinen-4033174.html).
- Rahmentarifvertrag Gebäudereinigung (Stand 31.10.2019, seit 01.11.2019): Nachtzuschlag 30 %, Sonn-/Feiertag 80 %, 200 % an 1. und 2. Weihnachtstag, Neujahr, 1. Mai; Belastungszuschlag 25 % ab der 9. Stunde; bei Zusammentreffen nur der höchste Zuschlag. Nicht alle Arbeitgeber setzen die 200 % um — [Deutsche Handwerks-Zeitung](https://www.deutsche-handwerks-zeitung.de/gebaeudereiniger-handwerk-bekommt-hoehere-lohnzuschlaege-und-mehr-urlaub/150/3094/394741), [DHZ Tacheles](https://www.deutsche-handwerks-zeitung.de/?p=335575). Aktualität des RTV (neuere Fassung) nicht geprüft.
- Die IG BAU/BIV-Tarifverträge gelten für Minijobber gleichberechtigt, wenn Tarifbindung besteht (WSI 2012, alt) — [WSI](https://www.wsi.de/data/wsimit_2012_01_riedel.pdf). Der Branchenverband kritisierte im April 2026 die Minijob-Politik der Bundesregierung (Inhalt nicht gelesen) — [Pressemitteilung](https://www.die-gebaeudedienstleister.de/wp-content/uploads/2026/04/260419_PM_Minijobs_Kritik-an-Bundesregierung.pdf).

### Inferences
- Ein 603-EUR-Limit bei 15,00 EUR/h = max. 40,2 h/Monat; Prototyp sollte Verdienstgrenze (Monat/Jahr) pro Minijobber mit Soll-Stunden bei Planung warnen (Rechnung aus belegten Zahlen).
- Zuschläge (Nacht, Sonn-/Feiertag) lassen sich aus Datum/Uhrzeit der Zeitbuchung automatisch ableiten und markieren; Feiertage sind bundeslandabhängig.

### Gaps
- Keine belastbaren Statistiken zu Krankenstand, Fluktuation in kleinen Reinigungsfirmen (nur Einzelaussage 9,7 % Fluktuation, nicht verifiziert).
- Urlaubsplanung und Tarifurlaub Gebäudereinigung konkret (Tage) nicht belegt; aktueller RTV zu prüfen. Lohnfortzahlung/U1-Umlage nicht recherchiert.

## 5. Minimale Funktionen eines Verwaltungs-Prototyps

### Takeaway
Abbildbar und sinnvoll: Objektstamm mit Reinigungsplan, Wochenplan, Mitarbeiterzuordnung, Abwesenheiten, Zeitbuchung und Stundenübersicht; Rechtsbezug ergibt sich aus 7-Tage-Aufzeichnung und 2-Jahres-Aufbewahrung.

### Cited Findings
- Branchensoftware deckt typisch ab: Objektmanagement, Personalplanung, mobile Zeiterfassung, Leistungsnachweis, Lohnexport — [hagel-it.de](https://www.hagel-it.de/it-insights/digitalisierung-in-der-reinigungsbranche-so-geht-gebaeudereinigung-2026), [PlanD](https://pland.app/en/software-cleaning-businesses).
- Rechtliche Mindestinhalte: Beginn, Ende, Dauer je Tag; Frist 7 Tage; Aufbewahrung 2 Jahre — [§ 17 MiLoG](https://www.gesetze-im-internet.de/milog/__17.html).

### Inferences
- Vorschlag Mindestumfang: (1) Objekt (Adresse, Kunde, Zugang, Soll-Stunden/Monat, Rhythmus, LV-Tätigkeitsliste); (2) Mitarbeiter (Vertragsart Minijob/Teilzeit/Vollzeit, Wochen-/Monatsstunden, Stundenlohn, Stammobjekte); (3) Stammbesetzung/Vertretung je Objekt, Springer-Flag; (4) Wochenplan generiert aus Rhythmus, manuell überschreibbar; (5) Abwesenheiten (Urlaub, Krank) mit Konfliktanzeige "Objekt unbesetzt" und Vertretungsvorschlag; (6) Zeitbuchung Beginn/Ende/Pause mit Änderungsprotokoll; (7) Stundenübersicht Soll/Ist je Mitarbeiter und Objekt, Minijob-Grenzwarnung, Zuschlagskennzeichnung; (8) CSV-Export für Lohnbüro/Zoll. Nicht erforderlich im ersten Schritt: GPS, Lohnabrechnung, Rechnungsstellung.

### Gaps
- Keine Nutzerbefragungen kleiner Reinigungsbetriebe; Priorisierung beruht auf Inferenz.
