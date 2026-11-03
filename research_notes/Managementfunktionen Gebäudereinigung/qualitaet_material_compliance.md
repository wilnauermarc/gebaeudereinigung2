# Qualitätsmanagement, Ressourcenverwaltung und Compliance in der deutschen Gebäudereinigung (Stand Recherche: 02.11.2026)

Hinweis zur Quellenlage: Websuche-Zusammenfassungen und einzelne Gesetzestexte (gesetze-im-internet.de, abgerufen 02.11.2026). Normen (DIN 77400, DIN EN 13549, INSTA 800) und DGUV-Regeln lagen nicht im Volltext vor. Nicht belegte Punkte stehen unter "Gaps".

## 1. Qualitätskontrolle (Begehungen, Checklisten, Bewertung, Normen, Mängel-/Reklamationsmanagement, Kundenzufriedenheit)

### Takeaway
Qualitätsmessung erfolgt in der Branche über Sichtkontrolle mit Stichproben (EN 13549 / INSTA 800, AQL nach ISO 2859-1) und dokumentierte Begehungen mit Checkliste. Konkrete Bewertungsskalen und Mängelfristen sind vertraglich (Leistungsverzeichnis) festzulegen, nicht normativ vorgegeben. Das ist für den Prototyp konfigurierbar zu halten.

### Cited Findings
- DIN 77400 (Ausgabe 2015-09) "Reinigungsdienstleistungen – Schulgebäude – Anforderungen an die Reinigung" steht laut DIN als aktuell; Geltungsbereich: allgemeinbildende und berufliche Schulen inkl. Sportanlagen; Intervalle hängen u. a. von Nutzung, Frequentierung, Bausubstanz und Jahreszeit ab; die Vorgängerausgabe 2003 ist zurückgezogen. — [DIN Norm-Übersicht (aktuell)](https://www.din.de/en/wdc-beuth:din21:237208488); [DIN (zurückgezogen)](https://www.din.de/en/wdc-beuth:din21:66057408); [Forum Verlag zu DIN 77400](https://forum-verlag.com/fachwissen/bildung-und-erziehung/din-77400-schulreinigung/)
- Öffentliche Ausschreibungen (Berlin) verlangen z. B. zwei dokumentierte, mit dem Auftraggeber abgestimmte Qualitätskontrollen, ein Qualitätsmanagementkonzept und Beschwerdemanagement; DIN 77400 beschreibt selbst kein Messverfahren (laut Suchzusammenfassung). — [Berlin Karriereportal Stellenbeschreibung Mängelmanagement](https://www.karriereportal-stellen.berlin.de/Sachbearbeitung-Vertrags-und-Maengelmanagement-Grosser-Che-de-j68346.html?pdf=de)
- INSTA 800 baut auf EN 13549 auf; zwei Prüfprinzipien: Sichtkontrolle und Kontrolle mit Messinstrumenten (z. B. Staubmessung Anhang D.1); Objektgruppen, Verschmutzungsarten, Prüfstrategien und Qualitätsstufen werden definiert; AQL je Reinigungsqualitätsstufe nach ISO 2859-1; der Kunde legt fest, wer kontrolliert. — [NS-INSTA 800-1:2018](https://online.standard.no/en/ns-insta-800-1-2018); [IRBnet Konferenzpapier](https://www.irbnet.de/daten/iconda/CIB7041.pdf)
- ÖNORM EN 13549 (Ausgabe 2001-10-01) beschreibt Grundanforderungen/Empfehlungen für Qualitätsmesssysteme bei Reinigungsdienstleistungen und verweist auf ISO 2859-1 (AQL-Stichprobe). — [Austrian Standards](https://www.austrian-standards.at/de/shop/onorm-en-13549-2001-10-01~p1354650)
- Praxisratgeber: monatliche Objektbegehung mit Reinigungsleiter, Checkliste, unangekündigte Stichproben, Qualitätsprotokoll, bei Mängeln sofort schriftlich reklamieren, bei Wiederholung Abmahnung bis Kündigung. — [Clean Invoice Ratgeber](https://www.clean-invoice.com/gebaeudereinigung/checkliste-gebaeudereinigung) (Ratgeber eines Anbieters, Datum nicht ermittelt)
- Softwaremarkt: SoftGuide führt Qualitätskontrolle (Kontrolle der Reinigungsstandards, Meldung von Problemen/Reparaturen durch Reinigungskräfte) als Modulfunktion; "CHECK UP!" (DeKoBe) und KleanApp bieten Qualitätsmesssysteme mit konfigurierbarem Bewertungsschema, Prüfpunkten und Nutzungsarten. — [SoftGuide Reinigung](https://www.softguide.de/funktion/reinigung); [CHECK UP! App Store](https://apps.apple.com/de/app/check-up/id1015278445); [KleanApp Quality checks](https://www.kleanapp.net/en/Home/Info_Qualitaetskontrollen)
- Eine kommunale Software-Ausschreibung nennt als Anforderungen: Qualitätsmessung, Verwaltung der Gebäudereinigung, Leistungsverzeichnisse, Mitarbeiterunterweisung, Tablet-Unterstützung iOS/Android; genannte Produkte: Axxerion, firstaudit, KeyLogic, WISSINTRA. — [SoftGuide Ausschreibung](https://www.softguide.de/ausschreibungen/stadt-sucht-software-als-qualitaetsmess-system-management-gebaeudereinigung)
- Generische Checklistenvorlagen (Datum, Objekt, Verantwortlicher, Bewertung, erforderliche Korrekturen, Verantwortlicher) existieren, z. B. Jotform. — [Jotform Qualitätskontrolle](https://www.jotform.com/de/form-templates/preview/261452040322038/classic&nofs&disableSmartEmbed=1)

### Inferences
- Minimal sinnvolles Datenmodell: Objekt – Begehung (Datum, Prüfer, Typ angekündigt/unangekündigt) – Prüfpunkte je Raum/Flächengruppe (ok/Mangel, Foto) – Note/Prozentwert – Mängelliste. Bewertungsschema (Noten 1–5 oder Prozent „Mängelquote vs. AQL“) pro Objekt/Vertrag konfigurierbar, weil Normen es dem Vertrag überlassen.
- Mängel-/Reklamationsstatus: Neu – In Bearbeitung – Behoben – Abgenommen/Geschlossen; Felder Eingang, Frist zur Beseitigung (aus Vertrag, z. B. 24 h/3 Werktage; Wert vertragsabhängig, nicht normativ belegt), Wiedervorlage, Wiederholungsmängel-Zähler (Eskalation Abmahnung).
- Kundenzufriedenheit: einfache Bewertung pro Quartal/Begehung plus Reklamationsquote je Objekt genügt für einen Prototyp.

### Gaps
- Volltexte DIN 77400, DIN EN 13549, INSTA 800 nicht eingesehen: Keine Belege für konkrete Bewertungsskalen, AQL-Werte oder Qualitätsstufen. Aktuellen Status von EN 13549 (evtl. überarbeitet) nicht geprüft.
- Keine belastbare Quelle zu üblichen Mängelbeseitigungsfristen; gesetzliche Grundlage (Werkvertrag/BGB, Mängelrüge) und BIV-Leitfäden wurden nicht recherchiert.
- Keine Quelle zu Kundenzufriedenheits-Kennzahlen (z. B. BIV).

## 2. Material-, Maschinen- und Schlüsselverwaltung

### Takeaway
Prüfpflichtig sind elektrische Reinigungsgeräte (DGUV V3 / BetrSichV; Richtwert 6 Monate, Verlängerung bis 1–2 Jahre bei Fehlerquote < 2 %, Fristfestlegung durch Gefährdungsbeurteilung). Schlüsselhaftung ergibt sich überwiegend aus dem Vertrag und der Notwendigkeit eines tatsächlichen Schlosswechsels (BGH). Ein Schlüsselregister mit Ausgabeprotokoll ist deshalb der zentrale Risikopuffer.

### Cited Findings
- Ortsveränderliche Betriebsmittel (inkl. Verlängerungs-/Geräteanschlussleitungen) sollten alle 6 Monate (Baustellen alle 3 Monate) geprüft werden; bei Fehlerquote < 2 % kann die Frist auf max. 1 Jahr (Werkstatt/Fertigung/Baustelle) bzw. 2 Jahre (Büro) verlängert werden, Begründung nötig. — [Forum Verlag, 14.04.2023](https://forum-verlag.com/fachwissen/elektrosicherheit-und-elektrotechnik/prueffristen-nach-dguv-v3/)
- Universitäts-FAQ nennt Staubsauger, Hochdruckreiniger und Bohnermaschinen als unter DGUV V3 fallende ortsveränderliche Geräte. — [Uni Gießen FAQ DGUV](https://www.uni-giessen.de/de/org/admin/dez/e/3/em-1/dguv/faq)
- DGUV V3-Fristen sind Richtwerte; der Unternehmer legt sie nach Beanspruchung fest; bei hoher Beanspruchung verkürzen; Prüfplakette macht Prüfung am Gerät erkennbar; DGUV Information 203-070 ist Hilfe für Prüfpersonen (kein eigenständiges Recht), Dokumentationshinweise in 203-071. Ausgabe Dez. 2016; ein Verlagsangebot nennt eine Ausgabe April 2026 (nicht bestätigt). — [DGUV Publikationen 203-070](https://publikationen.dguv.de/regelwerk/dguv-informationen/246/wiederkehrende-pruefungen-ortsveraenderlicher-elektrischer-betriebsmittel-fachwissen-fuer-pruefpersone?c=77); [WEKA](https://www.weka.de/elektrosicherheit/dguv-information-203-070-pruefung-ortsveraenderlicher-elektrischer-betriebsmittel/)
- Gefahrstoffverzeichnis (§ 6 Abs. 12 GefStoffV) Mindestangaben: Bezeichnung, Einstufung/gefährliche Eigenschaften, Mengenbereiche, Arbeitsbereiche mit möglicher Exposition, Verweis auf Sicherheitsdatenblätter; Angaben außer Mengen müssen Beschäftigten zugänglich sein. — [§ 6 GefStoffV](https://www.gesetze-im-internet.de/gefstoffv_2010/__6.html)
- Reinigungsmittel: GISBAU-Produktcode zeigt Gefahrstoffgehalt; Betriebsanweisung im Putzmittelraum des Gebäudes (mit Dosieranleitung kombinierbar) wird laut NRW-Auskunft als ausreichend angesehen. — [WEKA Muster-Betriebsanweisung](https://www.weka.de/arbeitsschutz-gefahrstoffe/muster-betriebsanweisung-reinigungsmittel-dl/); [komnet.nrw](https://www.komnet.nrw.de/_sitetools/dialog/2969)
- BGH VIII ZR 205/13 (05.03.2014, Mietrecht): Schlüsselverlust führt nur zu ersatzfähigem Schaden, wenn Schlosswechsel aus objektiver Gefährdung nötig ist und tatsächlich erfolgt; fiktive Kosten nicht ersetzbar. Übertragung auf Reinigungsverträge nicht direkt belegt. — [Anwalt-Online Zusammenfassung](https://www.anwaltonline.com/mietrecht/tipps/1264/schluesselverlust-im-mehrfamilienhaus-was-mieter-ueber-haftung-und-versicherungsschutz-wissen-sollten); [MTH Partner](https://www.mth-partner.de/mietrecht-rechtsanwalt/mietrecht-umfang-der-haftung-des-mieters-fuer-den-verlust-eines-schluessels/)
- Sicherheitsbewertung nach Verlust: Zuordnung zum Gebäude und sensible Bereiche (Server, Kassen, Labore, Mandantenunterlagen) sind ausschlaggebend; Musterklausel begrenzt Haftung auf übliche Versicherungsleistung für Schlüsselverlust. — [Kanzlei Herfurtner](https://kanzlei-herfurtner.de/bueroschluessel-verloren/); [LawInsider Musterklauseln](https://lawinsider.com/de/clause/schlüssel)
- Arbeitsrecht: bei einfacher Fahrlässigkeit trägt laut Ratgeber der Arbeitgeber die Kosten eines vom Beschäftigten verlorenen Schlüssels. — [HUK Ratgeber](https://www.huk.de/haus-haftung-recht/ratgeber/schluessel-verloren.html) (Versicherer-Quelle)
- Versicherung: Betriebshaftpflicht deckt Fremdschlüsselverlust nur über Zusatzbausteine mit Sublimits; Beispiele: Folgeschäden bis 25.000 € (Bayerische), bis 300.000 € (VHV), 1.000.000 € Schlüsselverlust / 50.000 € Folgeschaden mit 250 € Selbstbehalt (Interlloyd, Gastgewerbe, nicht reinigungsspezifisch). — [Bayerische Highlightblatt](https://www.diebayerische.de/dam/jcr:4e891d91-26b4-489d-ab73-731967700fc9/220271_highlightblatt_betriebshaftpflichtversicherung.pdf); [VHV](https://vhv.de/ds/101.0031.293.pdf); [Interlloyd](https://www.interlloyd.de/medien/pdf/service/bedingungen/bbr_gaststätten_und_beherbergung_leistungsbeschreibung_busec_2020.pdf)

### Inferences
- Schlüsselregister-Felder: Schlüssel-ID/Nummer, Objekt, Typ (Schlüssel/Transponder/Karte/Alarmcode), Schließanlage ja/nein, Sensibilitätsstufe, aktueller Inhaber, Ausgabe-/Rückgabedatum, Quittung/Unterschrift, Status (ausgegeben/verloren/zurück), Verlustmeldung mit Datum. Alarmcodes nicht im Klartext speichern (siehe Datenschutz).
- Geräteverwaltung: Gerät, Seriennummer, Standort/Objekt, letzte Prüfung, Prüfintervall (Standard 6 Monate, anpassbar), nächste Fälligkeit, Prüfer, Ergebnis -> Ampel.
- Materialbestand: Artikel, Lagerort/Objekt, Bestand, Mindestbestand, Gefahrstoff-Flag mit Link zu SDB/Betriebsanweisung (Verknüpfung zum Gefahrstoffverzeichnis).

### Gaps
- Keine Quelle zu Prüffristen speziell für Einscheibenmaschinen/Staubsauger (Tabellen TRBS 1201 / DGUV 203-070 nicht eingesehen); Prüffrist für Leitern, Hubgeräte, Hochdruckreiniger (mechanisch) nicht recherchiert.
- Keine reinigungsspezifische Rechtsprechung oder Branchenvertragsmuster (BIV) zur Schlüsselhaftung gefunden; keine Quelle zu Schlüsselübergabeprotokollen.
- Keine Belege für Schlüsselverwaltungsfunktionen in Reinigungssoftware (KeyLogic als CAFM nur genannt, nicht bestätigt).

## 3. Arbeitsschutz und Compliance (Gefährdungsbeurteilung, Unterweisung, Gefahrstoffe, Erste Hilfe, Datenschutz, Versicherung, Fristen)

### Takeaway
Gefährdungsbeurteilung (dokumentiert), Betriebsanweisungen und mindestens jährliche dokumentierte Gefahrstoff-Unterweisung (§ 14 GefStoffV) sind Kernpflichten; Hilfestellungen liefert die BG BAU. Weitere Fristen: Verbandbuch 5 Jahre, Vorsorge bei Feuchtarbeit. Datenschutz: AV-Verträge und Zugangs-TOMs sind relevant.

### Cited Findings
- § 6 ArbSchG: Dokumentation von Ergebnis der Gefährdungsbeurteilung, festgelegten Maßnahmen und Wirksamkeitsprüfung; Umfang abhängig von Tätigkeit und Beschäftigtenzahl; bei gleichartiger Gefährdung zusammengefasste Angaben zulässig; Unfälle mit mehr als 3 Tagen Arbeitsunfähigkeit sind zu erfassen. — [§ 6 ArbSchG](https://www.gesetze-im-internet.de/arbschg/__6.html)
- § 12 ArbSchG: Unterweisung bei Einstellung, Aufgabenwechsel, neuen Arbeitsmitteln/Technologien, "erforderlichenfalls regelmäßig" wiederholen, während der Arbeitszeit; keine feste gesetzliche Frist. — [§ 12 ArbSchG](https://www.gesetze-im-internet.de/arbschg/__12.html)
- § 14 GefStoffV: schriftliche Betriebsanweisung (Gefahrstoffe, Schutzmaßnahmen, Verhalten bei Störungen/Unfällen); mündliche, arbeitsplatzbezogene Unterweisung vor Beschäftigungsbeginn und mindestens einmal jährlich; Inhalt und Zeitpunkt schriftlich dokumentieren und von den Unterwiesenen unterschreiben lassen; Zugang zu Sicherheitsdatenblättern; Betriebsanweisung bei wesentlichen Änderungen aktualisieren. — [§ 14 GefStoffV](https://www.gesetze-im-internet.de/gefstoffv_2010/__14.html)
- § 6 GefStoffV: Gefährdungsbeurteilung vor Aufnahme der Tätigkeit dokumentieren (unabhängig von Beschäftigtenzahl), regelmäßig überprüfen und bei Änderungen anpassen. — [§ 6 GefStoffV](https://www.gesetze-im-internet.de/gefstoffv_2010/__6.html)
- BG BAU stellt eine Kurz-Handlungshilfe zur Gefährdungsbeurteilung für Kleinbetriebe der Gebäudereinigung bereit; DGUV Regel 101-605 (Gebäudereinigung) enthält Maßnahmen und Muster-Betriebsanweisung; TRGS 555 zu Betriebsanweisung/Unterweisung (gefundene Fassung 2008). — [BG BAU Kurz-Handlungshilfe](https://www.bgbau.de/fileadmin/Themen/Arbeitsschutz/Gefaehrdungsbeurteilung/kurz_handlungshilfe_gb_kleinbetrieb_gebaeuder.doc); [DGUV Regel 101-605](https://publikationen.dguv.de/detail/index/sArticle/3365); [TRGS 555](https://bildungsportal-niedersachsen.de/fileadmin/2_Portale/AUG/Uebergreifende_Themen/Gefahrstoffe/Dokumente/TRGS-555.pdf)
- Arbeitsmedizinische Vorsorge Feuchtarbeit (ArbMedVV): Angebotsvorsorge bei regelmäßig > 2 Std./Tag (freiwillig), Pflichtvorsorge bei regelmäßig >= 4 Std./Tag (Quellen uneinheitlich "vier oder mehr" vs. "mehr als 4"); Wiederholung "in regelmäßigen Abständen". — [BG BAU Flyer Angebotsvorsorge (07/2025)](https://www.bgbau.de/fileadmin/Medien-Objekte/Medien/Broschuere_Flyer/20250723_Flyer_Arbeitsmedizinische_Angebotsvorsorge_barrirefrei.pdf); [BGN TRGS 401 Schutzmaßnahmen](https://vorschriften.bgn-branchenwissen.de/daten/tr/trgs401/5.htm)
- Hessische Behörde (RP Darmstadt, 2022) berichtet Arbeitsschutzmängel in Reinigungsbetrieben, u. a. fehlender Hautschutzplan in 46 % der Betriebe (laut Suchzusammenfassung; PDF konnte nicht gelesen werden). — [RP Darmstadt 2022](https://rp-darmstadt.hessen.de/sites/rp-darmstadt.hessen.de/files/2022-03/2022-03-01_arbeitsschutzmaengel-in-reinigungsbetrieben.pdf)
- Verbandbuch/Erste-Hilfe-Dokumentation: 5 Jahre Aufbewahrung nach letztem Eintrag (§ 24 Abs. 6 DGUV Vorschrift 1); Datenschutz beim Verbandbuch beachten. — [DGUV Information 204-020](https://www.primeros.de/storage/app/media/204-020.pdf); [Forum Verlag Verbandbuch](https://forum-verlag.com/blog-gp/verbandbuch)
- Datenschutz: Muster-AV-Verträge (Art. 28 DSGVO) nennen Schlüssel/Chipkarten/Alarmanlagen als Zutrittskontroll-TOM und verlangen Vertraulichkeitsverpflichtung und Schulung der Mitarbeiter; Bayerisches Landesamt: Orientierungshilfe Auftragsverarbeitung v2.0 (04/2019). — [Muster AVV (firmenabc)](https://firmenabc.com/fileadmin/user_upload/firmenabc/datenschutz_anb-agb/AVV_DE.pdf); [BayLDA Orientierungshilfe](https://www.datenschutz-bayern.de/technik/orient/oh_auftragsverarbeitung.pdf)

### Inferences
- Fristen-Ampel: Unterweisung Gefahrstoffe 12 Monate (§ 14 GefStoffV), allgemeine ArbSchG-Unterweisung üblich jährlich (Praxis, kein gesetzlicher Fixwert), Prüfung elektr. Geräte 6/12/24 Monate (konfigurierbar), Gefährdungsbeurteilung Überprüfung bei Änderungen bzw. regelmäßig (üblich jährlich, nicht gesetzlich fixiert), Ersthelfer-Auffrischung (Praxis 2 Jahre, nicht belegt), Vorsorge (Intervall aus Arbeitsmedizin), Verbandbuch-Archiv 5 Jahre.
- Datenschutz-Prototyp: Zugriffsrechte nach Rolle, Alarmcodes nur verschlüsselt/maskiert oder nur Hinweis "Code beim Objektleiter", Löschfristen, Beschäftigtendaten minimieren (Qualifikationen/Unterweisungsnachweise ja, Gesundheitsdaten/Vorsorge-Befunde nein; nur "Vorsorge angeboten/wahrgenommen" ist üblich).
- Unterweisungsnachweis muss Datum, Inhalt, Unterweiser und Unterschrift enthalten (aus § 14 Abs. 2 GefStoffV abgeleitet).

### Gaps
- Nicht bestätigt: Ersthelfer-Fortbildung alle 2 Jahre, Ersthelfer-Quote (§ 26 DGUV V1), Wiederholungsintervalle ArbMedVV, exakte Schwelle für Pflichtvorsorge Feuchtarbeit, Jahresfrist für Unterweisung nach DGUV Grundsatz/Regel 100-001 bzw. 101-605.
- Keine reinigungsspezifische Datenschutzquelle gefunden (Art. 30 VVT, § 38 BDSG Datenschutzbeauftragter-Schwelle, Löschfristen Beschäftigtendaten, Videoüberwachung/GPS-Zeiterfassung nicht recherchiert).
- Keine Quelle zu Pflicht-/üblichen Deckungssummen der Betriebshaftpflicht speziell für Gebäudereiniger; Policen sind Fremdbranchen.
- Mutterschutz-Gefährdungsbeurteilung, Gefahrstoff-Exposition (TRGS 400/402), Mindestlohn/Tarifvertrag (Compliance außerhalb Scope) nicht behandelt.

## 4. Realistische Minimalfunktionen eines Verwaltungs-Prototyps

### Takeaway
Fünf Module sind mit einfachen Tabellen, Status, Fristen und Ampellogik umsetzbar und decken die im Markt typisch genannten Funktionen ab (Qualitätsmessung, Mängelmeldung, Unterweisung, Leistungsverzeichnis). Tiefe Normlogik (AQL-Stichproben, Messinstrumente) ist bewusst auszulassen.

### Cited Findings
- Marktübliche Funktionsliste aus kommunaler Ausschreibung und Softwareführern: Qualitätsmessung, Verwaltung, Leistungsverzeichnisse, Mitarbeiterunterweisung, Mobilzugriff, Mängelmeldung. — [SoftGuide Ausschreibung](https://www.softguide.de/ausschreibungen/stadt-sucht-software-als-qualitaetsmess-system-management-gebaeudereinigung); [SoftGuide Funktionen](https://www.softguide.de/funktion/reinigung)
- KleanApp: Bewertungsschema, Prüfpunkte und Nutzungsarten frei konfigurierbar. — [KleanApp](https://www.kleanapp.net/en/Home/Info_Qualitaetskontrollen)

### Inferences (Vorschlag MVP, nach Priorität)
1. Reklamations-/Mängelliste: Objekt, Beschreibung, Quelle (Kunde/Begehung), Eingang, Frist, Status (Neu/In Arbeit/Behoben/Abgenommen), verantwortlicher Mitarbeiter, Wiedervorlagedatum, Überfällig-Markierung (rot).
2. Begehungsprotokoll: Checkliste je Objekt (Raumgruppen/Prüfpunkte ok/nicht ok), Note oder Prozentwert automatisch (Anteil ok), Bemerkung/Foto, daraus automatisch Mängel anlegen.
3. Schlüsselregister: Schlüssel/Transponder/Code-Hinweis, Inhaber, Ausgabe-/Rückgabedatum, Verlustmeldung, Historie; Filter "nicht zurückgegeben".
4. Fristen-Ampel: Unterweisungen je Mitarbeiter und Thema (grün > 60 Tage, gelb <= 60/30 Tage, rot überfällig; Schwellen frei wählbar), Geräteprüfungen, Vorsorge-Angebote, Erste-Hilfe-Auffrischung.
5. Materialbestand: Artikel, Bestand, Mindestbestand (Warnung), Gefahrstoff-Kennzeichen + SDB-Link/Betriebsanweisung; Gefahrstoffverzeichnis als gefilterte Ansicht (Pflichtfelder § 6 Abs. 12 GefStoffV).
Später: Kundenzufriedenheits-Score, AQL-Stichprobenlogik, Prüfprotokoll-PDF, Dokumentenablage, Rollen/Rechte.

### Gaps
- Keine Nutzer-/Pain-Point-Studien kleiner Reinigungsbetriebe gefunden; Priorisierung beruht auf Ableitung aus Rechtslage und Marktfunktionen.
- Funktionsumfang konkreter Anbieter (Profacilo, BlueTem DS, KeyLogic) nicht verifiziert.
