# Auftraggeber-Anforderungen an Gebäudereinigungsfirmen und daraus folgende Software-Funktionen (Stand 03.11.2026)

Methodik-Hinweis: Rund 15 Tool-Aufrufe. Die meisten Primärdokumente (Leistungsverzeichnisse auf evergabe.de, TED-PDFs, Mülheimer Unterlagen, BMAS-Mustervorlage Tariftreue) waren nicht als Text abrufbar (PDF-Kompression, HTTP 403, 404, "Verfahren nicht mehr verfügbar"). Aussagen zu Ausschreibungsinhalten stammen daher aus Suchtreffer-Zusammenfassungen, die Passagen aus den Originalen zitieren; sie sind als "Stichprobe aus Einzelausschreibungen" zu lesen, nicht als Branchenstandard. Rödl-Artikel 03.11.2025 und BIV-/Branchendaten stehen im Vorbericht (`branchentrends_kundenerwartungen.md`) und werden nur ergänzt. Die Spalte "Bereits in unserer App?" ist durchgehend "unklar, bitte prüfen", weil mir nur der Trendbericht, nicht der App-Stand vorlag.

## 1. Nachweise und Berichte, die Auftraggeber fordern

### Takeaway
Öffentliche Auftraggeber verlangen (a) eine vom Auftragnehmer selbst geführte, aufgezeichnete Qualitätskontrolle, (b) ein Beschwerde-/Mängelmanagement mit Fristen und Sanktionen (Malus, Rechnungskürzung, Ersatzvornahme), (c) tägliche Leistungsdokumentation, (d) Schlüsselnachweise, (e) Tariftreue-/Mindestlohnnachweise bis in die Nachunternehmerkette. Das neue BTTG (seit 01.05.2026, Bundesvergaben) macht Tariftreue zur Ausführungsbedingung mit Nachweis auf Anforderung.

### Cited Findings
- Eigene Qualitätskontrolle: Vertragsklausel (Stadt Leipzig laut Suchtreffer): Auftragnehmer führt eine Qualitätskontrolle durch, zeichnet das Ergebnis auf und weist es auf Anforderung nach — [evergabe.de Unterlage](https://www.evergabe.de/unterlagen/943339/download/2049805?id=3167039) (Original nicht lesbar, Zitat über Suchzusammenfassung)
- Mängelbeseitigung in zwei Stufen: Auftraggeber setzt angemessene Frist; bei Versäumnis Beseitigung durch Dritte auf Kosten des Auftragnehmers — [evergabe.de Unterlage](https://www.evergabe.de/unterlagen/943339/download/2049805?id=3167039)
- Beschwerdemanagement als Ticketsystem mit Zuweisung, Beseitigungsfrist und Malus-Punktesystem (Mülheim an der Ruhr, "Anlage 7 Beschwerdemanagement – Malussystem"); Details nicht abrufbar (HTTP 403) — [Stadt Mülheim Anlage 7](https://www1.muelheim-ruhr.de/system/files/ausschreibungen/Anlage_7_-_Beschwerdemanagement_-_Malussystem_2_4.pdf)
- Malus/Strafen in Beispielen: 35 EUR je nicht durchgeführter Qualitätskontrolle laut eingereichtem Konzept, Gesamtdeckel 5 % der Nettovergütung — [evergabe.de](https://evergabe.de/unterlagen/914250/download/2006009?id=3133303) (Zuordnung der Zahlen zu genau dieser Unterlage unsicher, stammt aus Suchzusammenfassung); gestaffelte Rechnungskürzung 15 % nach zweiter, 30 % nach dritter fehlgeschlagener Prüfung, Kündigungsvorbehalt nach vierter — [TED 154097-2025](https://ted.europa.eu/de/notice/154097-2025/pdf) (Original nicht lesbar; Auftraggeber vermutlich Stadt Lüneburg)
- Vertragsstrafe bei Einzelfristüberschreitung (Dresden, Besondere Vertragsbedingungen), Gesamtdeckel im Muster offen — Suchtreffer-Zusammenfassung, keine abrufbare URL einzeln benannt; siehe [evergabe.de Trefferliste](https://www.evergabe.de/unterlagen/943339/download/2049805?id=3167039)
- Tägliche Dokumentation (Logbuch) bzw. QM-System/Software oder schriftliche Kontrolle als Mindestanforderung, teils Zuschlagskriterium (Leipzig laut Suchtreffer) — [evergabe.de](https://www.evergabe.de/unterlagen/976912/download/2096289?id=3207523) (Zuordnung unsicher)
- Reinigungsplan: Übergabe bei Vertragsbeginn bzw. vor Vertragsbeginn; Änderungen binnen 5 Werktagen schriftlich mitteilen — [evergabe.de Muster](https://www.evergabe.de/unterlagen/986980/download/2112710?id=3219220) (Suchzusammenfassung)
- Schlüsselmanagement: Auftragnehmer dokumentiert, welcher Mitarbeiter welchen Schlüssel hat, hält das aktuell, legt auf Verlangen vor; Verlust sofort melden; Haftung für Kosten einer neuen Schließanlage; Rückgabe bei Vertragsende — [Stadt Mülheim, Muster Grundreinigungsvertrag 2025](https://www1.muelheim-ruhr.de/system/files/ausschreibungen/Vertrag_Grundreinigung_Muster_2025_1.pdf) (laut Suchzusammenfassung)
- Soll-Stunden-Kontrolle: Mehrere sächsische/thüringische Ausschreibungen verlangen Überwachung der Einhaltung der produktiven Stunden (Vorgabezeiten) — [evergabe.de Trefferliste Schulreinigung](https://www.evergabe.de/unterlagen/944825/download/2051255?id=3168706) (Suchzusammenfassung)
- Berlin: einheitliches Muster-Leistungsverzeichnis für Schulreinigung aus einer Arbeitsgruppe, Mindestarbeitsumfang 6 Stunden für Tagesreinigung angesprochen — [Abgeordnetenhaus Berlin Schriftliche Anfrage 19/19583](https://pardok.parlament-berlin.de/starweb/adis/citat/VT/19/SchrAnfr/S19-19583.pdf)
- Normen: Qualitätsmessung orientiert an DIN EN 13549 (Grundanforderungen und Empfehlungen für Qualitätsmesssysteme, Ausgabe 2001-10, laut DIN als aktuell geführt), mit Bezug auf Stichprobenverfahren nach ISO 2859-1 (AQL) — [DIN Media](https://www.dinmedia.de/en/standard/din-en-13549/42885168); [DIN](https://www.din.de/en/wdc-beuth:din21:42885168). Verträge nennen zudem RAL GZ-902 und je nach Sektor DIN 77400 (Schulen), siehe [Rödl 03.11.2025](https://www.roedl.com/insights/reinigungsvertrag-herausforderungen/). Status DIN 77400 uneinheitlich (Vorbericht).
- Krankenhaus: DIN 13063:2021-09 (Reinigung/desinfizierende Reinigung in Krankenhäusern) als naheliegender Normbezug; fehlende Dokumentation kann im Infektionsfall Beweisnachteile haben (Quelle bezieht sich auf Arztpraxen, § 630h BGB) — [DIN Media DIN 13063](https://www.dinmedia.de/de/norm/din-13063/342791036); [medizinio](https://medizinio.de/blog/reinigungs-und-desinfektionsplan-arztpraxis). Konkrete Krankenhaus-Ausschreibungsklauseln (Hygieneschulungsnachweis, Desinfektionsnachweis) nicht gefunden.
- Bundestariftreuegesetz: Tariftreue ist vom Bundesauftraggeber als Ausführungsbedingung zu machen; Auftragnehmer gewährt den Beschäftigten mindestens die Bedingungen der einschlägigen Rechtsverordnung (§ 3 Abs. 1); muss von Nachunternehmern und Verleihern Einhaltung verlangen und durch geeignete Maßnahmen sicherstellen (§ 3 Abs. 2) — [§ 3 BTTG](https://www.gesetze-im-internet.de/bttg/__3.html)
- BTTG § 9: Nachweis der Einhaltung durch "geeignete Unterlagen", auf Anforderung der Prüfstelle Bundestariftreue; keine Dokumentarten, Fristen oder Aufbewahrungsdauer im Text (laut Abruf) — [§ 9 BTTG](https://www.gesetze-im-internet.de/bttg/__9.html)
- BTTG § 10: Nachweispflicht entfällt bei geeignetem Zertifikat einer Präqualifizierungsstelle; Kontrollrecht der Prüfstelle bleibt; Zertifikate von Nachunternehmern/Verleihern zulässig — [§ 10 BTTG](https://www.gesetze-im-internet.de/bttg/__10.html)
- BTTG Umfang: Schwellenwert 50.000 EUR, gesamte Nachunternehmer-/Verleiherkette; Ausschluss von künftigen Vergaben bis zu drei Jahren bei Verstößen (iBau-Glossar) — [lxgesetze BTTG](https://lxgesetze.de/bttg/3); [iBau Glossar](https://www.ibau.de/akademie/glossar/bundestariftreuegesetz/). Quellen widersprechen sich, ob eine Dokumentationspflicht für Nachunternehmer im Endtext bestehen bleibt (CMS vs. IHK Bonn) — [CMS](https://cms.law/de/deu/legal-updates/bundestariftreuegesetz-beschlossene-sache-was-unternehmen-nun-erwartet); [IHK Bonn](https://www.ihk-bonn.de/recht-und-steuern/recht/aktuelles/bundestarifsteuergesetz-vergaben-des-bundes-nur-noch-zu-tarifbedingungen)
- Vertragsbedingungen BVB BTTG (BMAS-Stil, Datum 02.06.2026 laut Suchzusammenfassung) und Mustervorlage Tariftreueversprechen (BMAS, Mai 2026) existieren; Inhalt nicht lesbar — [BGE BVB BTTG](https://www.bge.de/fileadmin/Download/Besondere_Vertragsbedingungen_Bundestariftreuegesetz_barrierefrei.pdf); [BAS Mustervorlage](https://www.bundesamtsozialesicherung.de/fileadmin/user_upload/20260515__Mustervorlage_Tariftreueversprechen.pdf)
- Mindestlohn-Auftraggeberhaftung: § 13 MiLoG i. V. m. § 14 AEntG, Haftung wie selbstschuldnerischer Bürge, verschuldensunabhängig; Auftraggeber verlangen als Nachweis Entgeltabrechnungen, Stundennachweise, Arbeitsverträge und halten bei fehlenden Nachweisen Zahlungen zurück; Quellen teils 2016–2020 — [NWB Experten-Blog](https://www.nwb-experten-blog.de/voellig-unterschaetzt-die-auftraggeberhaftung-nach-dem-milog/); [Haufe](https://www.haufe.de/personal/arbeitsrecht/mindestlohn-subunternehmer-kein-auftrag-ohne-haftung_76_296406.html); [Bremer Muster Nachunternehmer](https://wirtschaft.bremen.de/sixcms/media.php/13/Vereinbarung%20Nachunternehmer%20hb.pdf)

### Inferences
- Software muss je Objekt einen Kontroll-Nachweis (Datum, Prüfer, Räume, Ergebnis, Mängel) liefern, der den vertraglich zugesagten Kontrollrhythmus abbildet und Versäumnisse sichtbar macht (Malus je ausgefallener Kontrolle).
- Ein Mängel-/Beschwerdeticket mit Eingang, Zuweisung, Frist, Erledigung und Zeitstempel ist die Datengrundlage gegen Malus und Rechnungskürzung.
- Für BTTG und Auftraggeberhaftung reichen Lohn-, Stunden- und Vertragsunterlagen je Auftrag, auf Anforderung exportierbar; eine eigene BTTG-Spezialfunktion ist nach der Rechtslage (nur "geeignete Unterlagen") nicht belegt nötig.

### Gaps
- Unterweisungs-/Schulungsnachweise, Versicherungsnachweise, Vertretungsregelung und Ansprechpartner-Pflichten: keine konkreten Ausschreibungsklauseln im Wortlaut gefunden (Suchtreffer ohne Treffer).
- Berichtsrhythmus (monatlich/quartalsweise) nicht belegt.
- Hausverwaltungs-/Gewerbekunden-Musterverträge (privat) nicht gefunden; nur öffentliche Muster.
- Wortlaut BVB BTTG und BAS-Mustervorlage nicht lesbar.
- Mülheim-Malussystem, TED 154097-2025 und evergabe-Unterlagen nur über Zusammenfassungen.

## 2. Angebots- und Kalkulationsunterlagen

### Takeaway
Typisch ist ein vorgegebenes Mengengerüst (Flächen, Intervalle, Raumkategorien) und ein Kalkulationsblatt, in dem der Bieter Stundenverrechnungssatz und Leistungswerte nennt; Jahrespreis und Jahresstunden werden daraus berechnet. Fehlt das Blatt, droht Ausschluss. Gleitklauseln sind kaum in Unterlagen belegt, aber Bieter fragen danach.

### Cited Findings
- Stundenverrechnungssatz-Blatt: Jahrespreis = kalkulierte Jahresreinigungsstunden x Stundenverrechnungssatz plus etwaige Zuschläge (Hannover, Alice-Salomon-Schule); in Uetze Blatt "StVS UR" mit nachvollziehbarer Kalkulation — [evergabe.de](https://www.evergabe.de/unterlagen/957751/download/2070474?id=3184585) (Suchzusammenfassung)
- K.O.-Kriterium: Nichtvorlage des ausgefüllten Stundenverrechnungssatz-Blatts führt in einer bayerischen Ausschreibung zum Ausschluss — [evergabe.bayern.de](https://www.evergabe.bayern.de/evergabe.bieter/api/supplier/external/subproject/2b4acd3d-fb1c-4e3a-a7a5-53c0654646fc/suitabilitycriteria) (Link bei späterem Abruf "nicht mehr verfügbar"; Aussage aus Suchzusammenfassung)
- Bewertung auch der Sätze für Dauer- und Urlaubsvertretung (niedrigster Satz erhält 110 Punkte) — [Stadt Mülheim Anlage 10](https://www1.muelheim-ruhr.de/system/files/ausschreibungen/Anlage_10_-_Zuschlagserlaeuterung_2_4.pdf) (Suchzusammenfassung)
- In einer EU-weiten Ausschreibung musste in den Preisblättern der kalkulierte Tariflohn ausgewiesen werden — [evergabe.de](https://evergabe.de/unterlagen/824395/download/1870775?id=3019777) (Suchzusammenfassung)
- Rödl (01.04.2026): Auftraggeber gibt Mengengerüst vor; Bieter legt Stundenverrechnungssatz und Leistungswerte je Raumtyp offen; Jahrespreis und Jahreszeit werden automatisch berechnet; Blatt dient später als Abrechnungs-/Kontrollgrundlage, braucht dafür ausdrückliche vertragliche Vereinbarung; empfohlenes Zuschlagspaar Jahrespreis und Jahresreinigungszeit (Stunden) — [Rödl 01.04.2026](https://www.roedl.com/insights/reinigungsdienstleistungen/)
- Eignung: Eigenerklärungen (§§ 123, 124 GWB), Umsatz im Tätigkeitsbereich, Referenzen — [Rödl 01.04.2026](https://www.roedl.com/insights/reinigungsdienstleistungen/)
- Referenzen: mindestens drei geeignete aus den letzten drei Jahren (Bayern); zwei davon mit mindestens 5.500 qm Grundfläche oder 530.000 qm Jahresreinigungsfläche; Zeuthen verlangt bis zu fünf unterschriebene Referenzbescheinigungen mit Qualitätsaussage (bis 7 Punkte je Referenz) — [evergabe.bayern.de](https://www.evergabe.bayern.de/evergabe.bieter/api/supplier/external/subproject/2d328451-ac54-40d2-9bac-1a86479233ad/suitabilitycriteria); [Zeuthen Zuschlagskriterien](https://www.zeuthen.de/ErlaeuterungZuschlagskriterien-pdf-705973.pdf)
- Gleitklausel: Bieterfrage, ob für 2027 (Tariflohn noch unbekannt) eine Anpassung über Preisgleitklausel möglich ist; kein Ausschreibungstext mit konkreter Lohngleitklausel gefunden — [evergabe.de](https://www.evergabe.de/unterlagen/959269/download/2073038?id=3186383) (Suchzusammenfassung)
- Preisanpassung bei Mindestlohnsteigerungen als Vertragsthema: [Rödl 03.11.2025](https://www.roedl.com/insights/reinigungsvertrag-herausforderungen/)

### Inferences
- Kalkulationsmodul sollte pro Raumtyp Leistungswert (qm/h), Intervalle und Flächen halten, Jahresstunden und Jahrespreis berechnen und als Excel/PDF im Vorlagenformat des Auftraggebers ausgeben (Import der Vorgabe-Mengengerüste).
- Referenzliste (Objekt, Fläche, Zeitraum, Ansprechpartner, Bescheinigung) als pflegbare Stammdaten mit Filter nach Alter und Mindestfläche.
- Stundenverrechnungssatz-Aufschlüsselung (Lohn, Lohnnebenkosten, Gemeinkosten, Wagnis, Gewinn) mit Tariflohn-Szenarien für Anpassungsanträge.

### Gaps
- Vollständiger Aufbau eines amtlichen Kalkulationsblatts (Zuschlagsfaktoren, Pflichtfelder) nicht belegt.
- Wortlaut von Preis-/Lohngleitklauseln in Rahmenverträgen nicht gefunden.
- Anforderungen an Versicherungshöhen (Haftpflicht-Deckungssummen) nicht gefunden.

## 3. Reaktionszeiten, Erreichbarkeit, Meldewege, Dokumentation

### Takeaway
Reaktionszeit auf Mängel ist teils Wertungskriterium mit Gewichtung; konkrete Stundenwerte stammen aus Einzelfällen. QR-/Portal-Meldewege sind in den gefundenen Ausschreibungen nicht als Pflicht belegt.

### Cited Findings
- Bayern: Reaktionszeit für Mängelbeseitigung wird mit 15 % gewichtet (max. 10 Punkte) und Bieter sollen verbindliche Zeiten zusagen; Eigenkontroll-/QS-System und Zuständigkeit für Qualitätskontrolle werden abgefragt — [evergabe.bayern.de](https://www.evergabe.bayern.de/evergabe.bieter/api/supplier/external/subproject/66fb2a15-50d9-44b8-a5e3-46c287e9aaa3/awardcriteria) (nachträglich nicht mehr abrufbar; Suchzusammenfassung)
- Weitere Ausschreibung: Reaktionszeit auf Beschwerden max. 5 Punkte neben Selbstkontrollen und Teilnahme an Begehungen — Suchzusammenfassung zu [evergabe.de](https://www.evergabe.de/unterlagen/944825/download/2051255?id=3168706)
- Vorbericht: Mängelbeseitigung schriftlich binnen 1–2 Stunden anzeigen; zwei Qualitätskontrollen je Monat in einem Beispiel — [evergabe.de Unterlage](https://www.evergabe.de/unterlagen/994706/download/2123267?id=3228130)
- Anbieterblog: QR/NFC-Check-in, digitale Checklisten, Foto-Doku, Kundenportal als Kundenerwartung (nur Herstellerquelle) — [hagel IT](https://www.hagel-it.de/it-insights/digitalisierung-in-der-reinigungsbranche-so-geht-gebaeudereinigung-2026)

### Inferences
- Software braucht Zeitstempel für Meldungseingang, Erstreaktion und Erledigung, um Reaktionszeiten nachzuweisen und auszuwerten; Meldeweg (Telefon, E-Mail, QR-Link ohne Login) ist egal, Hauptsache alles landet im selben Ticket.
- Hotline-/Erreichbarkeitszeiten und Vertretung (Objektleiter, Springer) als Stammdaten je Objekt, in Auftraggeber-Dokumente exportierbar.

### Gaps
- Keine belegten Standardwerte für Erreichbarkeit (z. B. 24/7), Vertretungsregelung oder Ansprechpartnerpflichten.
- Kommunale Muster ohne Hinweis auf Pflicht-App oder Portal.
- Kliniken: keine konkreten Reaktionszeiten gefunden.

## 4. Konsequenz: Berichte, Vorlagen, Fristen, Exporte auf Knopfdruck

### Takeaway
Tabelle der Auftraggeber-Anforderungen mit Software-Funktion. Spalte "Bereits in der App" ist unklar und muss gegen die Frühberichte geprüft werden.

### Cited Findings
| Auftraggeber-Anforderung | Quelle (URL) | Daraus folgende Software-Funktion | Bereits in unserer App? |
|---|---|---|---|
| Aufgezeichnete Eigenkontrolle, Nachweis auf Anforderung | [evergabe.de 943339](https://www.evergabe.de/unterlagen/943339/download/2049805?id=3167039) | Kontrollprotokoll je Objekt/Datum (Prüfer, Räume, Ergebnis, Fotos), PDF-Export, Plan-Ist-Kontrollen | unklar, bitte prüfen |
| Qualitätsmessung nach DIN EN 13549 (Stichprobe/AQL) | [DIN Media](https://www.dinmedia.de/en/standard/din-en-13549/42885168); [Rödl 03.11.2025](https://www.roedl.com/insights/reinigungsvertrag-herausforderungen/) | Prüfvorlage mit Stichprobenumfang je Objektgröße, Bewertungsskala, Quote bestanden/nicht bestanden | unklar, bitte prüfen |
| Mängel mit Fristen, Ersatzvornahme | [evergabe.de 943339](https://www.evergabe.de/unterlagen/943339/download/2049805?id=3167039) | Mängelticket mit Fristrechner, Eskalation, Erledigungsnachweis | unklar, bitte prüfen |
| Beschwerdemanagement mit Malussystem | [Mülheim Anlage 7](https://www1.muelheim-ruhr.de/system/files/ausschreibungen/Anlage_7_-_Beschwerdemanagement_-_Malussystem_2_4.pdf) | Malus-/Abzugskonto je Objekt, Dashboard "Risiko Rechnungskürzung" | unklar, bitte prüfen |
| Rechnungskürzung 15 %/30 %, Kündigungsvorbehalt nach Serie | [TED 154097-2025](https://ted.europa.eu/de/notice/154097-2025/pdf) | Warnung bei aufeinanderfolgenden negativen Prüfungen | unklar, bitte prüfen |
| Tägliches Logbuch / Leistungsnachweis | [evergabe.de 976912](https://www.evergabe.de/unterlagen/976912/download/2096289?id=3207523) | Digitale Checkliste/Einsatzprotokoll je Tag, Zeitstempel, optional QR/Foto | unklar, bitte prüfen |
| Reinigungsplan bei Vertragsbeginn, Änderungen binnen 5 Werktagen | [evergabe.de 986980](https://www.evergabe.de/unterlagen/986980/download/2112710?id=3219220) | Reinigungsplan-Vorlage (Raum, Leistung, Intervall), Versionierung mit Änderungsdatum | unklar, bitte prüfen |
| Schlüssel je Mitarbeiter dokumentieren, Verlust melden | [Mülheim Muster](https://www1.muelheim-ruhr.de/system/files/ausschreibungen/Vertrag_Grundreinigung_Muster_2025_1.pdf) | Schlüsselregister (Objekt, Schlüssel-Nr., Inhaber, Ausgabe/Rückgabe, Verlustmeldung) | unklar, bitte prüfen |
| Soll-Stunden/Produktivstunden überwachen | [evergabe.de 944825](https://www.evergabe.de/unterlagen/944825/download/2051255?id=3168706) | Soll/Ist-Stunden je Objekt und Monat, Abweichungsbericht | unklar, bitte prüfen |
| Tariftreue-/Mindestlohnnachweis, Nachunternehmerkette | [§ 3 BTTG](https://www.gesetze-im-internet.de/bttg/__3.html); [§ 9 BTTG](https://www.gesetze-im-internet.de/bttg/__9.html) | Auftragsbezogene Ablage von Lohn-/Stundenunterlagen, Tariftreue-Eigenerklärung, Nachunternehmerregister mit Erklärungen | unklar, bitte prüfen |
| Entgeltabrechnungen/Stundennachweise bei Auftraggeberhaftung | [NWB](https://www.nwb-experten-blog.de/voellig-unterschaetzt-die-auftraggeberhaftung-nach-dem-milog/) | Export Lohn-/Stundennachweis je Objekt und Zeitraum | unklar, bitte prüfen |
| Kalkulationsblatt mit Stundenverrechnungssatz (K.O.) | [Rödl 01.04.2026](https://www.roedl.com/insights/reinigungsdienstleistungen/) | Kalkulations-/Angebotsmodul mit Raumtypen, Leistungswerten, Excel-Export | unklar, bitte prüfen |
| Referenzen (3 in 3 Jahren, Mindestfläche) | [evergabe.bayern.de](https://www.evergabe.bayern.de/evergabe.bieter/api/supplier/external/subproject/2d328451-ac54-40d2-9bac-1a86479233ad/suitabilitycriteria) | Referenzliste mit Filter und Export | unklar, bitte prüfen |
| Eigenerklärungen, Eignungsnachweise (Vorbericht) | [Rödl 01.04.2026](https://www.roedl.com/insights/reinigungsdienstleistungen/) | Dokumentenablage mit Gültigkeitsdatum und Ablauf-Erinnerung | unklar, bitte prüfen |
| Reaktionszeit auf Mängel, wertungsrelevant | [evergabe.bayern.de](https://www.evergabe.bayern.de/evergabe.bieter/api/supplier/external/subproject/66fb2a15-50d9-44b8-a5e3-46c287e9aaa3/awardcriteria) | Reaktionszeit-Auswertung (Eingang bis Erstreaktion/Erledigung) | unklar, bitte prüfen |
| Preisanpassung bei Mindestlohn/Tarif | [Rödl 03.11.2025](https://www.roedl.com/insights/reinigungsvertrag-herausforderungen/) | Anpassungsrechner mit Tarifszenarien und Anschreiben-Vorlage | unklar, bitte prüfen |
| Krankenhaus: Hygieneplan, Desinfektionsnachweis (nur Normbezug) | [DIN Media DIN 13063](https://www.dinmedia.de/de/norm/din-13063/342791036) | Hygiene-Reinigungsplan-Vorlage, Schulungsnachweis je Mitarbeiter | unklar, bitte prüfen |

### Inferences
- Dokumentenpaket auf Knopfdruck pro Objekt: Reinigungsplan, Kontrollprotokolle, Mängelliste mit Fristen, Soll/Ist-Stunden, Schlüsselregister, Mitarbeiterliste mit Einsatz und Unterweisungsstand, Nachweisordner (Haftpflicht, Tariftreue, SV-Erklärung). Dies passt zur Erwartung bei Audits (hagel IT) und zu Auskunftsverlangen.
- Fristen/Erinnerungen: Mängelfrist, Kontrollrhythmus, Ablauf von Versicherungs-/Zertifikatsnachweisen, Unterweisungs-Wiederholung, Preisanpassungs-Stichtage.

### Gaps
- Unterweisungsnachweise (Arbeitsschutz, Hygiene): keine Ausschreibungsklauseln im Wortlaut belegt; Funktion ist Ableitung.
- Status der App-Funktionen: Frühberichte nicht eingesehen, daher keine Soll-Ist-Zuordnung.
