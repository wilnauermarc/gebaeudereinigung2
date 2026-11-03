# Feature-Katalog zeigt: Tarif- und Nachweislogik schlägt Funktionsfülle

Der Markt für Reinigungssoftware ist bei den Basismodulen weitgehend gesättigt, und genau dort muss der Prototyp (Kunden, Angebote mit DIN-5008-PDF, Kalkulator/Raumbuch, Verträge mit Preisanpassung, Rechnungen mit Mahnung, Controlling, Einsatzplan, Zeiten, Begehungen, Mängel, Schlüssel, Team mit Minijob- und Unterweisungsampel) nicht mehr nachziehen. **Marktstandard** sind laut Herstellerangaben Kunden-/Objektstamm, Dienstplan mit Drag and Drop, mobile Zeiterfassung mit Soll/Ist, Angebot, Rechnung mit Rechnungslauf und Mahnwesen, DATEV-/Lohn-Export, Fotodokumentation und ein Ticket-/Mängelsystem. **Differenzierer** sind die Raumbuch-Kalkulation mit Leistungswerten (Mendato), die Qualitätskette Stichprobe nach DIN 2859-1, Auto-Nacharbeitsticket und QR-Mängelmeldung (KleanApp), der Tarifvertrag-Wizard (PlanD), Kundenportal mit steuerbarer Sichtbarkeit (Mendato, CleanManager, Otuvy) sowie KI-Importe (Grundriss, altes Leistungsverzeichnis, Stundenzettel-Foto). Bei der bestehenden App fehlen vor allem: Leistungsnachweis/Arbeitsschein mit Unterschrift, der geschlossene Kreis Mangel -> Nacharbeit -> Nachkontrolle, Tarifparameter mit Gültigkeit und Szenarien, Rechnungslauf/Serienrechnung samt Offene-Posten-Liste, Optionspositionen im Angebot, Abwesenheits-/Vertretungslogik, ein Korrekturprotokoll mit Sperre abgeschlossener Zeiträume und CSV-Import. **Rechtlich/kulturell problematisch** sind Pflicht-Geofencing, Live-GPS, Gesichtserkennung, personenbezogene Scores und die öffentliche Namensanzeige der Reinigungskraft; die Mitbestimmung nach § 87 Abs. 1 Nr. 6 BetrVG greift schon bei technischer Eignung zur Verhaltens- und Leistungskontrolle. Dass **Minijob-Grenzwarnung, Preisanpassungsrechner mit Kundenschreiben und Fristenampeln** bei keinem geprüften Anbieter belegt sind, ist ein negativer Suchbefund und kein Beweis ihres Fehlens; der Prototyp hat diese Funktionen teils schon und sollte sie vertiefen statt breiter zu werden. **Die Quellenlage ist eingeschränkt** (siehe nächster Abschnitt): Das Bild beruht überwiegend auf Herstellerseiten, vielen Hilfe-Titeln ohne Volltext und einigen gesperrten oder nicht abrufbaren Seiten.

## Quellenlage und Kennzeichnung: was belegt ist und was nicht

Kennzeichnung im Text: **[Beleg]** = in einer Quelle genannt, **[Ableitung]** = eigene Schlussfolgerung, **[Lücke]** = nicht gefunden oder nicht abrufbar. "Nicht gefunden" bedeutet nie "nicht vorhanden". Die Evidenzstufen in den Tabellen bedeuten: **stark** = Herstellerhilfe im Volltext oder mehrere unabhängige Quellen; **mittel** = Herstellerfunktionsseite oder Hilfe-Titel (Existenz belegt, Details nicht); **schwach** = nur Drittquelle, Suchzusammenfassung, Branchenblog oder reine Ableitung.

Die Einschränkungen im Einzelnen: Bei den Hilfecentern von Mendato (232 Artikel) und PlanD (79 Artikel) wurden meist nur **Artikeltitel** gelesen, die Existenz einer Funktion belegen, aber keine Workflows ([Mendato-Collection Rechnungen](https://help.mendato.com/de/collections/7382229-rechnungen-buchhaltung), [PlanD-Dashboard-Collection](https://help.pland.app/de/collections/519060-dashboard-funktionen)). Fast alle Funktionsaussagen sind **Herstellerangaben** und damit interessengeleitet; Seiten wurden durch ein kleines Fetch-Modell zusammengefasst, Unschärfe ist möglich. **Gesperrt oder nicht lesbar** waren die Miele-Seiten (403) und -PDFs, die KleanApp-Übernahmepresse (403), mehrere Swept-Artikel (404), Hilfecenter von HERO, ToolTime, Craftnote, Billomat und Fastbill sowie Review-Plattformen (Reddit, Capterra, G2 teils gesperrt). Mehrere Anbieter wurden nur über Drittseiten belegt (SoftGuide-Verzeichnis, KI-Syndikat, fuer-gruender.de, Capterra-Snippets), darunter MR.Clean, A.S.E., iQTrust, e-QSS, HERO, ToolTime. Nicht untersucht wurden Quinyx, Deputy, When I Work und TimeTac-Detailseiten. Beim Anbieter Dynvon fehlen unabhängige Belege vollständig (gegründet 2025, Nürnberg, Eigenaussagen) ([Dynvon Individualsoftware](https://www.dynvon.com/reinigung/individualsoftware)). Eine echte Nutzer- oder Inhaberbefragung fehlt; die Empfehlungen in diesem Bericht sind daher begründete Eigenableitung.

**Widersprüche und Korrekturen zwischen den Notizen**, die der Leser kennen muss:

Erstens die **Kundengegenzeichnung bei Inspektionen**. Die frühere Recherche nannte für CleanTelligent/Otuvy "Inspektionsformulare mit Gegenzeichnung durch den Kunden". Die vertiefende Runde fand auf der Otuvy-Featureseite keinen Client-Sign-off, nur Portal-Sichtbarkeit, Umfragen und Work-Order-Abschlussnachweis ([Otuvy Features](https://www.otuvy.com/otuvy-qm-features)); auch bei Swept und Janitorial Manager ist kein Sign-off dokumentiert. Belegt ist Gegenzeichnung nur für **Arbeitsscheine/Sonderleistungen** (KleanApp, PlanD, fortytools; [KleanApp Funktionen](https://www.kleanapp.net/de/Home/Functions)) und, nur als Titel, für Leistungsbelege bei Mendato ([Mendato Abrechnung-Collection](https://help.mendato.com/de/collections/19690892-abrechnung-leistungsnachweise)). Dieser Bericht wertet Kundengegenzeichnung auf Begehungen daher als **nicht belegt** (Lücke), nicht als widerlegt.

Zweitens der **Fehler in der PlanD-Angebotszeile**: In der Notiz zu deutschen Anbietern stehen unter PlanD Changelog-Einträge (AGB-Anhang an Angebote 15.10.2026, Auftragsbestätigung aus Angebot 25.08.2026). Diese stammen von fortytools.com/changelog und gehören zu **fortytools by zvoove**, nicht zu PlanD; die Notiz räumt den Fehler selbst ein ([fortytools Changelog](https://www.fortytools.com/changelog)). Das gilt auch für die Zeitkonto-, Einsatzgruppen- und Vertretungs-Changelogeinträge. Für PlanD bleibt belegt: Angebote per Klick mit Kundenbestätigung und anschließender automatischer Abrechnung ([PlanD Funktionsübersicht](https://pland.app/funktionen/uebersicht)).

Drittens **Mendato-Tarife**: Die Vorstudie beschrieb die Kalkulation als Zusatzmodul, die aktuelle Herstellerseite ordnet sie ab dem Starter-Tarif (199 EUR) ein ([mendato.com](https://www.mendato.com/)); hier gilt die aktuelle Angabe. Viertens **KleanApp-Übernahme** durch zvoove (April 2026) und CleanManager (August 2025): Beide Daten stammen aus Suchzusammenfassungen von Pressemeldungen, die Seiten selbst waren nicht lesbar ([PR Newswire](https://prnewswire.com/de/pressemitteilungen/zvoove-group-ubernimmt-kleanapp-302728607.html)). Fünftens **Papershift-Minijob**: Papershift-Seiten nennen teils veraltete Verdienstgrenzen (450/520/538/556 EUR); eine Warnfunktion im Plan wurde nicht gefunden ([Papershift Blog](https://www.papershift.com/blog/mindestlohn-2025-auswirkungen-auf-verdienst-und-arbeitszeit-in-minijobs)). Sechstens **A.S.E.**: SoftGuide führt "webbasiert: nein", beschreibt aber PC-/Web-/App-Clients; die Funktionsliste ist nur ein "Auszug" ([SoftGuide A.S.E.](https://www.softguide.de/programm/ase-workgroups-gebaeudereiniger-software)). Siebtens **Clockodo-DATEV**: Die Funktionsseite nennt DATEV nicht, das Lexware-Partnerprofil nennt nur Schnittstellen/CSV ([Clockodo](https://www.clockodo.com/de/funktionen/)).

Zur Einordnung der Anbieter: zvoove besitzt drei Gebäudereinigungsprodukte (fortytools by zvoove für kleine bis mittlere Betriebe, KleanApp für Raumbuch/QM/LV bei größeren Betrieben, CleanManager mit dänischem Ursprung); es gibt keine eigene "zvoove Gebäudedienste"-Funktionsseite ([zvoove Clean](https://www.zvoove.com/de/clean)). Ob Profacilo, Mendato und andere Funktionen nach Tarif gesperrt haben, ist teilweise belegt (Abschnitt Tarif-Gating unten).

## Feature-Katalog nach Bereichen

Die Spalten der Tabellen: **Evidenz** (stark/mittel/schwach, siehe oben), **Status** (Marktstandard = bei mindestens drei Anbietern der untersuchten Gruppen belegt; Differenzierer = bei höchstens ein bis zwei Anbietern oder als Alleinstellung beworben), **Aufwand** im Prototyp (klein/mittel/groß; Eigeneinschätzung, nicht belegt), **Empfehlung** (umsetzen/später/nicht empfohlen). Der Prototyp ist eine Svelte-Web-App; "groß" bedeutet meist, dass ein Backend oder eine externe Schnittstelle nötig wäre. Anbieterkürzel: Mend = Mendato, KA = KleanApp, PD = PlanD, ft = fortytools by zvoove, CM = CleanManager, Dyn = Dynvon, CMG = CleanMG, JM = Janitorial Manager, Pap = Papershift.

### Stammdaten, Raumbuch und Leistungsverzeichnis

[Beleg] Mendato hat die am besten dokumentierte Kette Raumtyp -> Bodenbelag -> Leistungswert (m²/h) -> Raumbuch -> Personenstunden; im Volltext belegt sind Häufigkeit pro Woche (auch 0,5), Stunden je Reinigung/Woche/Monat, optionales Monatsziel mit roter Warnung und Druckfassung je Leistung für Angebot/Vertrag ([Mendato Raumbuch-Artikel](https://help.mendato.com/de/articles/15923514-raumbuch-reinigungsflachen-und-personenstunden-kalkulieren)). KleanApp unterstützt Raumbuch-Excel-Import und LV-gebundene Kontrollobjekte, aber keine Leistungswertkalkulation ([KleanApp](https://www.kleanapp.net/de/Home/Functions)). [Lücke] Bei PlanD, fortytools, CleanMG und Dynvon wurde kein Raumbuch gefunden.

| Feature | Anbieter | Evidenz | Status | Aufwand | Empfehlung und Begründung |
|---|---|---|---|---|---|
| Raumbuch mit Leistungswert, Frequenz, Stunden/Monat und Monatsziel-Warnung | Mend (Volltext) | stark | Differenzierer | klein (Bestand: Kalkulator/Raumbuch) | **Umsetzen/prüfen**: Bestand deckt den Kern ab; Monatsziel-Warnung und Druckfassung je Leistung ergänzen, falls fehlend |
| Katalog Raumtyp/Bodenbelag/Leistungswert als Vorbelegung | Mend (Titel) | mittel | Differenzierer | klein | **Umsetzen**: spart Eingabe, reine Stammdatentabelle |
| Raumbuch-Excel/CSV-Import | KA, Mend (Datenimporte, Titel) | mittel | Marktstandard (für Einstieg) | mittel | **Umsetzen**: senkt Go-live-Hürde; Rückfall auf Excel nach ca. 6 Monaten und fehlende Stammdaten sind als Hemmnis genannt (Anbieterblog) ([hagel IT](https://www.hagel-it.de/it-insights/digitalisierung-in-der-reinigungsbranche-so-geht-gebaeudereinigung-2026)) |
| KI-Grundrisserkennung (Räume aus Plan) | Mend (Titel + Startseite) | mittel | Differenzierer | groß | **Nicht empfohlen** im Prototyp: Fremdmodell nötig, Fehlerrisiko, geringer Nutzen bei kleinen Objekten |
| LV-Import per PDF/Foto mit KI, LV-Editor | Mend | mittel | Differenzierer | groß | **Später**: LV-Editor (manuell) ist klein und sinnvoll, KI-Import nicht |
| LV als Quelle für Checklisten und Kontrollpunkte | Mend, KA, CleanGuru, e-QSS | mittel | Marktstandard (in QM-Anbietern) | mittel | **Umsetzen**: Single Source of Truth, Grundlage für Leistungsnachweis und Begehung ([CleanGuru](https://apps.apple.com/us/app/cleanguru-janitorial-software/id673270069)) |
| Objektmappe (Fotos, Dokumente, Zugangsinfos) | PD, CM, Mend | mittel | Marktstandard | klein | **Umsetzen**, falls nicht vorhanden: einfache Dokumentenliste je Objekt |
| Interessenten (CRM-light) und Wiedervorlagen | Mend, MR.Clean, Lexware | mittel | Marktstandard | klein | **Umsetzen**: Status "Interessent" am Kunden plus Wiedervorlage-Datum |
| Aufgaben/Notizen/Kennzahlen am Kunden (Umsatz, offene Forderungen, Zahlungsdauer) | Lexware Office | stark (Herstellerseite) | Marktstandard (Buchhaltung) | klein | **Umsetzen**: Kennzahlen kommen aus vorhandenen Daten ([Lexware Kontakte](https://www.lexware.de/funktionen/kontakte-verwalten/)) |
| CSV-Import Kunden/Objekte/Mitarbeiter | Lexware (Volltext), ToolTime, CMG | stark | Marktstandard | mittel | **Umsetzen**: Importprotokoll mit Fehlerliste ([Lexware Import](https://help.lexware.de/de-form/articles/548267-anleitung-zum-import-von-kontakten-kunden-und-lieferanten)) |
| Duplikaterkennung/Zusammenführen im Kundenstamm | Pipedrive (CRM-UX) | mittel | Differenzierer (bei Handwerkersoftware nicht belegt) | mittel | **Später** |
| Befehlspalette, Tastaturkürzel, Aktivitätsprotokoll | keiner belegt | schwach | - | mittel | **Später**; Marktnachfrage nicht belegt |

### Kalkulation und Angebot

[Beleg] Mendato erzeugt Angebot oder Auftrag direkt aus der Kalkulation, mit Stundenlohn, Zuschlägen und Monatslimit ([Mendato Vertrieb-Collection](https://help.mendato.com/de/collections/19734500-vertrieb-angebote)). Dynvon veröffentlicht einen Rechner mit Lohngruppen 1 bis 9 (Tarif 2026), Lohnnebenkosten rund 25 %, Ausfallkosten rund 27 %, Gemeinkosten und 15 % Marge; Beispiel 26,81 EUR/h und 2,67 EUR/m²/Monat, Tarifwerte laut Seite bis 31.12.2026 ([Dynvon Rechner](https://www.dynvon.com/reinigung/kalkulationsrechner)). Der Rechenweg Stundenverrechnungssatz -> Preis/m² -> Monatspreis (Wochenfrequenz mal 4,33) ist damit öffentlich nachvollziehbar.

| Feature | Anbieter | Evidenz | Status | Aufwand | Empfehlung und Begründung |
|---|---|---|---|---|---|
| Kalkulation: Lohngruppe, LNK, Ausfall, Gemeinkosten, Marge -> Verrechnungssatz -> Monatspreis | Dyn (Rechner), Mend, CM (Zusatzmodul), MR.Clean | stark | Marktstandard (bei Spezialisten) | klein (Bestand) | **Bestand prüfen**: Satz je Lohngruppe mit Gültigkeitsdatum ergänzen (siehe Tarifparameter) |
| Angebot direkt aus Kalkulation erzeugen | Mend, Dyn, KA (Textbausteine) | mittel | Marktstandard | klein | **Umsetzen/prüfen** (Bestand) |
| Textbausteine/Briefpapier-Vorlage im Angebot | KA, ft, Lexware | mittel | Marktstandard | klein | **Umsetzen**: wenige Bausteine für Einleitung, Leistungsumfang, AGB |
| Optional- und Alternativpositionen (nicht in Summe) | Lexware (Volltext) | stark | Marktstandard (Handwerk), in Reinigung nicht belegt | mittel | **Umsetzen**: passt gut (Fensterreinigung optional, 14-täglich als Alternative); Weiterführen übernimmt nur Gewähltes ([Lexware Hilfe](https://help.lexware.de/de-form/articles/547989-optionale-und-alternative-positionen-in-angeboten-nutzen)) |
| Weiterführen-Dialog Angebot -> Auftragsbestätigung/Vertrag/Rechnung | Lexware, sevdesk, HERO, fortytools | stark | Marktstandard | mittel | **Umsetzen**: im Reinigungskontext Angebot -> Vertrag -> Einsatzplan |
| Angebot per Link mit Online-Annahme per Klick | Lexware (ab Tarif M), PD (Angebot per Klick), Jobber (Client Hub) | stark | Marktstandard (Handwerk), Differenzierer in Reinigung | mittel (simuliert) / groß (echt) | **Später**: Annahme-Seite als Demo möglich; echter Link braucht Backend und Widerrufshinweis ([Lexware Kundencenter](https://www.lexware.de/funktionen/kundencenter/)) |
| Automatisches Angebots-Nachfassen (E-Mail/SMS bei unbeantwortetem Angebot) | Jobber (ab Connect-Plan) | mittel (Suchzusammenfassung) | Differenzierer | mittel (nur interne Wiedervorlage) | **Umsetzen als Wiedervorlage**, nicht als Versand ([Jobber Help](https://help.getjobber.com/hc/en-us/articles/115009739988)) |
| Freigabe von Angeboten nach Betragsschwelle (Vier-Augen) | Aspire | mittel (Suchzusammenfassung) | Differenzierer | klein | **Später**: für Kleinbetriebe selten nötig ([Aspire Docs](https://guide.youraspire.com/docs/workflow-search-list-screen)) |
| Ausschreibungsimport GAEB | A.S.E., HERO | mittel/schwach | Differenzierer | groß | **Nicht empfohlen** |
| Angebots-Versionierung, Zwischensummen/Titel | keiner belegt | schwach | - | mittel | **Später** |
| Digitale Unterschrift im Angebot | keiner belegt | schwach | - | mittel | **Nicht empfohlen**: Klick-Annahme genügt, Unterschrift auf Arbeitsschein verlagern |

### Verträge, Preisanpassung und Tarifparameter

[Beleg] In den untersuchten Produkten ist **kein vollständiger Vertragsworkflow mit Index-/Tarifklausel, Kundenschreiben und Zustimmung** dokumentiert. ZenMaid kennt nur die Massenänderung "Preis auf alle zukünftigen Termine eines Wiederholungsservices anwenden", mit empfohlenem Startdatum ([ZenMaid](https://zenmaid.com/answers/en/articles/4789209-applying-a-price-change)); PlanD nennt "Preisanpassungen von Produkten" nur als Titel ([PlanD-Collection](https://help.pland.app/de/collections/519060-dashboard-funktionen)); Aspire erwähnt einen Contract-Renewal-Workflow ohne abrufbare Details ([Aspire](https://youraspire.com/blog/year-in-review-commercial-cleaning-2024)). cleaning pro bietet ein Tarifgrundmodul und Vertragsmanagement ([SoftGuide](https://www.softguide.de/programm/cleaning-pro-branchenloesung-fuer-gebaeudedienste)). PlanD hat den einzigen detailliert belegten **Tarifvertrag-Wizard** (Lohngruppen 1-9, Zuschläge, Wiederholung ohne Duplikate, zentral gepflegte Tariflöhne) ([PlanD Wizard](https://help.pland.app/de/articles/692392-tarifvertrag-wizard)). Ein Praxis-Gesuch nennt Vertrags- und Preisanpassungsmanagement ausdrücklich ([SoftGuide 16/632](https://www.softguide.de/ausschreibungen/gebaeudereiniger-sucht-branchensoftware)). [Ableitung] Der aktuelle Auslöser ist die offene Tarifrunde: Branchenmindestlohn läuft zum 31.12.2026 aus, IG BAU fordert +2,00 EUR, Arbeitgeberangebot 3,4 % über 24 Monate, gesetzlicher Mindestlohn ab 01.01.2027 14,60 EUR ([Deutsche Handwerks-Zeitung](https://www.deutsche-handwerks-zeitung.de/?p=385440)).

| Feature | Anbieter | Evidenz | Status | Aufwand | Empfehlung und Begründung |
|---|---|---|---|---|---|
| Tarifparameter-Tabelle mit Gültig-ab/bis, Status beschlossen/Szenario | PD (Wizard, zentral gepflegt), cleaning pro | mittel | Differenzierer | mittel | **Umsetzen (Priorität 1)**: eine Tabelle speist Kalkulator, Vertragsrechner, Minijob-Ampel und Zuschläge; Szenarien 2027 (+13,3 % vs. +3,4 %) vergleichbar |
| Preisanpassung als Vertragsworkflow (Lohnanteil x Steigerung, neuer Preis, Wirksamkeit, Anschreiben-PDF) | bei keinem belegt; Bestand der App | schwach (Gesuch, Rödl) | Differenzierer | mittel | **Umsetzen/vertiefen**: Anschreiben im DIN-5008-Layout aus Vertrag erzeugen, Status "angekündigt/zugestimmt/angewandt" ([Rödl & Partner](https://www.roedl.com/insights/reinigungsvertrag-herausforderungen/)) |
| Preisänderung auf Folgetermine mit Stichtag | ZenMaid | mittel | Marktstandard (Terminserien) | klein | **Umsetzen**: Stichtag statt rückwirkend |
| Kündigungs-/Verlängerungsfristen mit Erinnerung | cleaning pro (Vertragsmanagement), Aspire (Renewal) | schwach | Differenzierer | klein | **Umsetzen**: Datum plus Ampel, ohne Mailversand |
| Vertragsanlagen/Leistungsverzeichnis-Version mit Stundenwirkung bei Kundenkürzung | bei keinem belegt | schwach (65 % Kundenkürzungen laut BIV) | Differenzierer | mittel | **Später** ([BIV-Umfrage 2026](https://www.die-gebaeudedienstleister.de/wp-content/uploads/2026/04/260414_Deutschlands-personalintensivstes-Handwerk-im-Stimmungstief-1.pdf)) |

### Rechnung, Mahnung, Buchhaltungsschnittstellen

[Beleg] Mendato listet Abrechnungstypen (pro Einsatz, wiederholend, einmalig, Anfahrt, Material, Minderung), Rechnungslauf, Mahnstufen, MT940-Import, Zahlungszuordnung und E-Rechnung (ZUGFeRD/XRechnung), allerdings überwiegend als Titel ([Mendato Rechnungen](https://help.mendato.com/de/collections/7382229-rechnungen-buchhaltung)). PlanD nennt Abschlags-/Schlussrechnung, Skonto, Debitorennummern, §-35a-Lohnkostenanteil und Schweizer QR-Rechnung (Titel). KleanApp hat Rechnungslauf mit angehängtem unterschriebenem Arbeitsschein und zahlreiche Schnittstellen (DATEV, Lodas, Lexware, Addison, Agenda, Sage). Lexware zeigt eine Offene-Posten-Liste mit Mahnvorschlag und editierbaren Texten ([Lexware OP-Liste](https://www.lexware.de/funktionen/offene-posten-liste/)). CleanMG kennt nur Rechnungen ohne Mahnwesen oder DATEV ([CleanMG](https://www.cleanmg.de/)).

| Feature | Anbieter | Evidenz | Status | Aufwand | Empfehlung und Begründung |
|---|---|---|---|---|---|
| Rechnung aus Vertrag/Dauerleistung (Serien-/Dauerrechnung) mit Vorschau und Freigabe | Mend, PD, ft, Dyn, Lexware, sevdesk | mittel | Marktstandard | mittel | **Umsetzen**: Monatslauf je Vertrag, "Entwurf -> prüfen -> freigeben" |
| Rechnungslauf (alle fälligen Posten gesammelt) | Mend, KA, ft | mittel | Marktstandard | mittel | **Umsetzen** |
| Rechnung aus erfassten Zeiten/Arbeitsscheinen | Mend, PD, KA, ft | mittel | Marktstandard | mittel | **Umsetzen**: Brücke Zeiten -> Rechnung für Regie-/Sonderleistungen |
| Abschlags-/Schlussrechnung | PD, ft, HERO | mittel | Marktstandard | mittel | **Später**: für Unterhaltsreinigung selten |
| Offene-Posten-Liste nach Alter | Lexware, cleaning pro, MR.Clean | mittel | Marktstandard | klein | **Umsetzen**: aus Rechnungsdaten ableitbar |
| Mahnstufen mit Vorlagen, Verzugszins und Pauschale | Mend, PD, ft (Original-Rechnung an Mahnung anhängen), Lexware, sevdesk | mittel | Marktstandard | klein (Bestand) | **Bestand prüfen**: Original-Rechnung als Anlage ergänzen ([fortytools Changelog](https://www.fortytools.com/changelog)) |
| Zahlungsabgleich per Bank-API / virtuelle IBAN | Lexware, sevdesk, HERO | mittel | Marktstandard (Buchhaltung) | groß | **Nicht empfohlen**; Alternative CSV-Kontoauszug-Import mit Zuordnungsvorschlag (**später**, mittel; MT940-Import bei Mendato als Vorbild) |
| E-Rechnung (ZUGFeRD/XRechnung) | Mend, PD, Dyn, sevdesk, ToolTime, Lexware | mittel | Marktstandard | groß | **Später**: korrekte Erzeugung und Validierung aufwendig; [Eigenableitung] gesetzliche Fristen vor dem Bau prüfen, die Notizen belegen sie nicht |
| DATEV-Export Buchungsstapel / Rechnungsdaten | Mend (jeder Tarif), PD, KA, Lexware | mittel | Marktstandard | mittel | **Später**; zuerst sauberer CSV-Export |
| Debitorennummer, Skonto, Lohnkostenanteil § 35a auf Rechnung | PD (Titel), ft | schwach | Differenzierer | klein | **Umsetzen**: Debitorennummer und § 35a nur für Privatkunden relevant; Skonto optional |
| Eigene Lohnabrechnung | PD, MR.Clean, cleaning pro | mittel | Differenzierer | groß | **Nicht empfohlen**: Pflicht-Lohn gilt als Anti-Feature, Haftung, Steuerberater/Lohnbüro bleibt zuständig |
| Subunternehmer-Gutschrift (Prozentaufteilung) | Mend (ab Pro), Otuvy (Secondary Providers) | mittel | Differenzierer | mittel | **Später** (nur Dokumentenampel zuerst) |

### Einsatz- und Personalplanung

[Beleg] Mendato: Dienstplan mit Verfügbarkeiten, Abwesenheitskalender mit der Frage "Welche Einsätze sind betroffen?", Einsätze ohne Ausführer, Ausfallmarkierung und Zeitkonto (Volltext) ([Mendato Zeitkonto](https://help.mendato.com/de/articles/11509029-zeitkonto-fur-uberstunden-und-minusstunden)). PlanD: Planungsassistent, Routenvorlagen mit Drag and Drop und Vertretung nach Qualifikation ([PlanD Routen](https://help.pland.app/de/articles/653765-routen-tourenplanung)). KleanApp: maximale Tages-/Wochenarbeitszeit je Mitarbeiter, Reinigungsfenster je Objekt, KI-Konfliktanalyse ohne Datenänderung. Papershift markiert Unterbesetzung und Überschneidungen direkt im Plan und zeigt den Stundensaldo ([Papershift Tour](https://www.papershift.com/tour-durch-die-funktionen)). Planday trennt Tausch, Übergabe und Verkauf mit Doppelfreigabe ([Planday Help](https://help.planday.com/en/articles/30314-how-to-swap-handover-or-sell-shifts-in-the-planday-app)). [Lücke] Schichttausch ist bei keinem der Reinigungs-Spezialisten belegt, nur bei allgemeinen Planungstools; Krankmeldung per Mitarbeiter-App ebenfalls nicht.

| Feature | Anbieter | Evidenz | Status | Aufwand | Empfehlung und Begründung |
|---|---|---|---|---|---|
| Drag-and-drop-Wochenplan, wiederkehrende Einsätze | alle Spezialisten | mittel | Marktstandard | klein (Bestand) | Bestand |
| Inline-Warnung im Plan (Unterbesetzung, Überschneidung, Max-Arbeitszeit, Ruhezeit) | Pap, KA, Mend (Monatsziel) | mittel | Marktstandard (Planungstools), Differenzierer in Reinigung | mittel | **Umsetzen**: Konflikte an der Zelle statt im Bericht |
| Minijob-Verdienstgrenze im Plan (Stunden x Lohn vs. Grenze) | bei keinem belegt (Pap: nur Tageszähler 70-Tage-Regel) | schwach | Differenzierer | klein (Bestand: Minijob-Ampel) | **Vertiefen**: Plan-Warnung statt nur Teamansicht; Lohn aus Tarifparametern ([Papershift Tageszähler](https://www.papershift.com/blog/automatischer-tageszaehler-fuer-kurzfristige-minijobber)) |
| Abwesenheiten (Urlaub/Krank) mit betroffenen Einsätzen und Umplanung | Mend, PD, Clockodo, Pap | mittel | Marktstandard | mittel | **Umsetzen**: Büro erfasst Abwesenheit, Liste offener Einsätze |
| Urlaubsanspruch/Resturlaub, Sperrzeiten | PD, Clockodo, Pap | mittel | Marktstandard | mittel | **Später** |
| Vertretungs-/Springervorschlag (Verfügbarkeit, Entfernung, Minijob-Rest) | PD (Vertretung nach Qualifikation, Planungsassistent) | mittel | Differenzierer | mittel | **Umsetzen als Vorschlagsliste ohne Automatik**: Personalmangel stark belegt, Nutzerwunsch nicht direkt |
| Routen-/Tourenplanung mit Vorlage | PD, MR.Clean | mittel | Differenzierer | mittel | **Später**; einfache Fahrtzeit je Einsatz genügt zunächst |
| Schichttausch / offene Schichten zum Selbst-Claimen | Planday, Staffomatic, Connecteam, Pap | mittel | Marktstandard (Planungstools), nicht in Reinigung belegt | groß (braucht Mitarbeiter-Zugang) | **Nicht empfohlen** im Prototyp |
| KI-Dienstplan-Konfliktanalyse | KA | mittel | Differenzierer | groß | **Nicht empfohlen**: regelbasierte Warnungen liefern denselben Nutzen |
| Zuweisung nach Einsatzgruppe/Qualifikation | ft (Changelog 14.10.2026), PD | mittel | Differenzierer | klein | **Später** |

### Zeiterfassung und Zuschläge

[Beleg] Mendato nennt sechs Erfassungswege (manuell, App mit GPS-Nachweis, Einzelnachtrag, nach Planzeit 1:1, Excel-Import, Stundenzettel-Foto per KI in BETA) und eine detaillierte Zuschlagslogik: Nacht 30 % (22-5 Uhr), Sonntag 80 %, Feiertag 80 %, Hohe Feiertage 200 %, Belastungszuschlag 25 % ab 8 h/Tag oder 40 h/Woche, nur der höchste Zuschlag je Zeitsegment, Basis wählbar (Stempelzeit oder Planzeit), Neuberechnung ab Datum ([Mendato Zuschläge](https://help.mendato.com/de/articles/17613781-nacht-sonntags-und-feiertagszuschlage-berechnung-und-einstellungen), [Mendato Erfassungswege](https://help.mendato.com/de/articles/10901099-ubersicht-die-6-moglichkeiten-der-zeiterfassung-in-mendato)). QR-Stempeln als Zeiterfassung ist bei den deutschen Anbietern nicht belegt, sondern NFC/Barcode (KleanApp, CleanManager); A.S.E. nennt QR/NFC. Clockodo bietet Bearbeitungssperre für abgeschlossene Zeiträume und Signatur-Freigabe ([Clockodo](https://www.clockodo.com/de/funktionen/)), Swept "invalidiert" Einträge statt sie zu löschen ([Swept](https://knowledge.sweptworks.com/knowledge/invalidate-time-entries)).

| Feature | Anbieter | Evidenz | Status | Aufwand | Empfehlung und Begründung |
|---|---|---|---|---|---|
| Soll/Ist-Zeiten, Pausenautomatik, Zeitkonto | Mend (Volltext), Crewmeister, Clockodo, ft | stark | Marktstandard | klein (Bestand teilweise) | **Zeitkonto ergänzen**, falls fehlend |
| Zuschlagsberechnung (Nacht/Sonn-/Feiertag nach Tarif) | Mend (Volltext), PD, Pap (nur "auswerten") | stark (Mend) | Differenzierer | mittel | **Umsetzen**: Sätze aus Tarifparametern, höchster Zuschlag je Segment; Feiertage nach Bundesland |
| Nacherfassung durch das Büro / Stundenzettel-Import mit Quelle (App/Papier/Büro) | Mend, CMG, PD | mittel | Marktstandard | klein | **Umsetzen**: 43 % erfassen noch handschriftlich (Herstellerstudie) |
| Korrekturprotokoll (wer, wann, Grund) und Sperre abgeschlossener Monate | Clockodo (Sperre), Swept (invalidieren), Connecteam (Vier-Augen) | mittel | Differenzierer | klein | **Umsetzen**: passt zu Aufzeichnungspflichten; invalidieren statt löschen |
| Warnung bei Nacherfassung älter als 7 Tage | bei keinem belegt | schwach | Differenzierer | klein | **Umsetzen** ([Eigenableitung] aus § 17 MiLoG laut Vorrecherche) |
| App-Stempeln mit Offline-Sync | Mend, PD, Crewmeister, CM | mittel | Marktstandard | groß | **Nicht empfohlen** im Prototyp; Büro-Erfassung/Terminal als Zwischenlösung |
| Terminal/Tablet-Stempeluhr | Crewmeister, Pap, KA | mittel | Marktstandard | mittel | **Später** |
| NFC/Barcode-Stempeln am Objekt mit Alarm bei Nichterscheinen | KA, CM, A.S.E. | mittel | Marktstandard (QM-Anbieter) | groß | **Später**; nur QR am Objekt als Leistungsnachweis (siehe Qualität) |
| GPS-Check-in / Standortkontrolle | Mend, PD, JM, Swept, Connecteam | mittel | Marktstandard | mittel | **Nicht empfohlen** (siehe Abschnitt Problematisches) |
| KI-Stundenzettel-Foto (BETA, ab Pro) | Mend | mittel | Differenzierer | groß | **Nicht empfohlen** |
| Lohn-/Zuschlags-Export (DATEV-nah) | Mend, PD, Crewmeister, Pap, KA | mittel | Marktstandard | mittel | **Später** (CSV mit Stunden nach Zuschlagsart zuerst) |

### Qualität: Leistungsnachweis, Begehung, Mängel, Kundenportal

[Beleg] KleanApp besitzt die tiefste Kette: geplante Kontrollen mit Zufallsstichprobe nach DIN 2859-1 oder Ad-hoc-Kontrolle, Bewertung je Raum, schlechte Bewertung erzeugt automatisch ein Nacharbeitsticket samt Nachkontrolle, Mängelmeldung durch Besucher per QR-Code (z. B. im WC), E-Mail wird Ticket ([KleanApp Funktionen](https://www.kleanapp.net/de/Home/Functions)). Mendato verbindet Kundenportal-Reklamation mit Ticket, Zuweisung, Priorisierung und Statusanzeige ([Mendato Reklamation](https://help.mendato.com/de/articles/11095691-digitales-reklamationsmanagement-kundenportal-ticketsystem)). PlanD stellt ein Kundendashboard per Objekt-QR bereit (Leistungsnachweis der letzten 30 Tage, Ticket mit Foto) ([PlanD Kundendashboard](https://help.pland.app/de/articles/355817-kundendashboard-tickets-einreichen-termine-einsehen)). Otuvy macht aus Inspektionsmängeln automatisch Work Orders, die sich beim Erledigen der Aufgabe schließen ([Otuvy](https://www.otuvy.com/otuvy-qm-features)). Swept zeigt Inspektionen im Kundenportal erst nach aktivem "Send to Clients" ([Swept Portal](https://knowledge.sweptworks.com/knowledge/client-portal-inspections), nur Suchzusammenfassung). Janitorial Manager gewichtet Bereiche im Inspektionsscore ([JM Inspections](https://www.janitorialmanager.com/work-management-system/janitorial-inspections-app/)). Die Qualitätsnorm DIN EN 13549 nennen iQTrust und Auftraggeber-Quellen ([iQTrust](https://www.ki-syndikat.de/tools/iqtrust/)).

| Feature | Anbieter | Evidenz | Status | Aufwand | Empfehlung und Begründung |
|---|---|---|---|---|---|
| Begehung mit Prüfpunkten aus LV, Raum-Bewertung, Note, Fotos | KA, CM, iQTrust, e-QSS, Dyn, JM, Swept | mittel | Marktstandard (QM-Anbieter) | klein (Bestand) | **Bestand prüfen**: Prüfpunkte aus LV vorbelegen, Standardwert "ok", nur Abweichungen erfassen (CleanGuru-Muster) |
| Gewichtete Bereiche im Score | JM | mittel | Differenzierer | klein | **Später** |
| Stichprobe/Zufallsraumliste nach DIN 2859-1 | KA | mittel | Differenzierer | mittel | **Später**: Zufallsauswahl von n Räumen ist einfach, Normbezug vorher prüfen |
| Mangel -> Aufgabe -> Nacharbeit -> Nachkontrolle -> Auto-Close | KA, Otuvy | mittel | Differenzierer | mittel | **Umsetzen (hohe Priorität)**: Mängel-Statusmodell mit Frist, Verantwortlichem und automatischer Nachkontrolle-Aufgabe |
| Eskalationsstufen bei nicht behobenen Mängeln | iQTrust | schwach (Drittseite) | Differenzierer | klein | **Später** |
| Leistungsnachweis je Einsatz (Checkliste, Zeitstempel, Foto, Unterschrift) | Mend, PD, KA, CM, JM | mittel | Marktstandard | mittel | **Umsetzen**: PDF-Nachweis je Einsatz/Monat; ohne Standortdaten |
| Arbeitsschein/Sonderleistung mit Kundenunterschrift | KA, PD, ft | mittel | Marktstandard | mittel | **Umsetzen**: Canvas-Unterschrift lokal, Anbindung an Rechnung |
| Kundengegenzeichnung auf Begehungsprotokoll | nicht belegt (Widerspruch zur Vorstudie, s. o.) | schwach | - | mittel | **Später**: als Feld "gegengezeichnet am/von" möglich, Marktbedarf unbelegt |
| QR-Code je Objekt/Raum zur Mängelmeldung (ohne Login) | KA, PD, JM (Scan4Clean) | mittel | Differenzierer | mittel (QR-Generierung) / groß (öffentlicher Endpunkt) | **Später**: QR drucken ist klein, Meldeseite braucht Backend; Spamschutz nötig |
| Kundenportal mit je Kunde steuerbarer Sichtbarkeit | Mend (ab Pro), CM, Otuvy, JM | mittel | Differenzierer (wird Standard bei Mittelstands-SaaS) | groß | **Später**; Vorstufe: Kundenbericht-PDF je Monat |
| Reklamationsauswertung für Quartalsgespräche | Mend | mittel | Differenzierer | klein | **Später** (aus Mängeldaten ableitbar) |
| Kundenumfragen/Feedback-Terminals | Otuvy, CM, KA (FeedbackNow-Schnittstelle) | schwach | Differenzierer | mittel | **Nicht empfohlen** |
| Digitale Formulardesigner | KA | mittel | Differenzierer | groß | **Nicht empfohlen** |

### Schlüssel, Material, Geräte, Compliance und Schulung

[Beleg] KleanApp dokumentiert Schlüsselübergabe mit NFC und Unterschrift, DGUV-Prüfplanung mit monatlicher Fälligkeitsübersicht, Führerscheinkontrolle und Pflichtschulungen mit Ablaufhinweis ([KleanApp](https://www.kleanapp.net/de/Home/Functions)). MR.Clean hat als einziger explizit Mindest-/Meldebestand und Bestellvorschläge ([SoftGuide MR.Clean](https://www.softguide.de/programm/mrclean-software-fuer-gebaeudereiniger)). Mendato führt Dateien mit Ablaufdatum je Mitarbeiter (Titel) und Schlüssel je Objekt. Profacilo nennt Gerätemanagement, DGUV A3, NFC-Schlüsselverwaltung und Subunternehmen-Management (Auszug; [SoftGuide Profacilo](https://www.softguide.de/programm/profacilo-software-fuer-gebaeudereinigung)).

| Feature | Anbieter | Evidenz | Status | Aufwand | Empfehlung und Begründung |
|---|---|---|---|---|---|
| Schlüsselregister mit Ausgabe/Rückgabe/Quittung/Verlust | Mend, KA, MR.Clean, Profacilo, Miele | mittel | Marktstandard | klein (Bestand) | **Bestand prüfen**: Filter "nicht zurückgegeben", Unterschrift als Quittung |
| Schlüsselübergabe per NFC-Anhänger | KA, Profacilo | mittel | Differenzierer | groß | **Nicht empfohlen** |
| Unterweisungs-/Schulungsnachweise mit Fälligkeit | KA, Mend (Dateien mit Ablauf), cleaning pro | mittel | Marktstandard (bei Spezialisten) | klein (Bestand) | **Bestand**; Unterschrift als Nachweis ergänzen |
| Dokumente je Mitarbeiter mit Gültig-bis (Bescheinigungen) | Mend, cleaning pro | mittel | Marktstandard | klein | **Umsetzen**: Ampel erweitern; keine Gesundheitsdaten |
| Geräte/DGUV-Prüffristen | KA, Profacilo, A.S.E. | mittel | Differenzierer | mittel | **Später** |
| Materialverwaltung mit Mindestbestand/Bestellvorschlag | MR.Clean, A.S.E., Mend (Titel), CM | mittel | Differenzierer | mittel | **Später**: Kleinbetriebe nutzen oft Pauschalen; QR-Lager wünschte eine Einzelstimme |
| Führerschein-/Fuhrparkkontrolle | KA | mittel | Differenzierer | mittel | **Nicht empfohlen** |
| Subunternehmer-Dokumentenampel | Mend, Otuvy, cleaning pro | mittel | Differenzierer | klein | **Umsetzen/später**: Gültig-bis für Unbedenklichkeitsbescheinigung, Haftpflicht |
| Bieterdokumentenablage (Tariftreue-Erklärung, Haftpflicht, Referenzen) | keiner belegt | schwach (Ausschreibungsmuster) | Differenzierer | klein | **Später** ([evergabe.de](https://www.evergabe.de/unterlagen/994706/download/2123267?id=3228130)) |

### Controlling, Dashboard, Integrationen und KI

[Beleg] Mendato bietet Controlling (Soll-Ist-Stunden, Marge, Kosten/Umsatz/Ergebnis) erst im Pro-Plus-Tarif (499 EUR), PlanD Deckungsbeitrag je Auftrag, Dynvon ein Dashboard (offene Rechnungen, Auslastung, Nachweise, Deckungsbeitrag je Objekt), KleanApp Dashboard-/Berichtsdesigner ([Mendato Controlling](https://help.mendato.com/de/collections/19648850-controlling-auswertungen)). KI-Funktionen existieren bei allen größeren Anbietern, als Telefonassistentin "Paula" (PlanD), MCP-Zugang (KleanApp, Dynvon), Belegscanner und Importe (Mendato) ([PlanD Paula](https://help.pland.app/de/collections/1435865-paula)). Ihr Nutzen ist nicht belegt.

| Feature | Anbieter | Evidenz | Status | Aufwand | Empfehlung und Begründung |
|---|---|---|---|---|---|
| Deckungsbeitrag/Marge je Objekt, Soll-Ist-Stunden | Mend (Pro Plus), PD, Dyn, Aspire (Job-Costing) | mittel | Marktstandard (gehobene Tarife) | klein (Bestand) | **Bestand**; in kleiner Software ein Verkaufsargument, da bei Mendato teuer gegated |
| Controlling mit LV-Version und Kundenkürzung | bei keinem belegt | schwach | Differenzierer | mittel | **Später** |
| Management-Dashboard (offene Posten, auslaufende Fristen, Auslastung) | Dyn, KA, Mend | mittel | Marktstandard | klein | **Umsetzen**: wenige Kacheln aus vorhandenen Daten |
| Rollen/Berechtigungen (z. B. Kontakte ohne Finanzdaten) | Lexware, sevdesk, Mend, KA | mittel | Marktstandard | mittel | **Später**, sobald mehrere Nutzer; Steuerberater-Lesezugang ist ebenfalls Standard |
| Mehrsprachige Mitarbeiteransicht / Chat mit Übersetzung | PD (16+ Sprachen), CM, Swept (150+) | mittel | Differenzierer | mittel | **Später**: 47,4 % Beschäftigte ohne deutschen Pass (Branchenzahl) stützen den Bedarf, Sprachen unbekannt |
| Mitarbeiter-App (iOS/Android) | alle Spezialisten | mittel | Marktstandard | groß | **Nicht empfohlen**; PWA-fähige Büro-Web-App zuerst |
| KI-Assistenz (Telefon, Textentwürfe, Auswertungs-Briefing) | PD, KA, Mend, HERO, Dyn | mittel | Differenzierer | groß | **Nicht empfohlen** im Prototyp |
| Sensorik/Roboter/Occupancy | Tork-Schnittstelle (KA), Kärcher, Propmodo | schwach | Hype-nah | groß | **Nicht empfohlen** ([Propmodo](https://propmodo.com/?p=9268)) |
| Systemprotokoll/Audit-Log | ft (Changelog 24./25.08.2026) | mittel | Differenzierer | mittel | **Umsetzen** für Zeiten, Rechnungen, Preisänderungen |

### Tarif-Gating als Marktsignal

[Beleg] Mendato staffelt: Mini 99 EUR (Objekte, Zeiterfassung, Planung, Buchhaltung), Starter 199 (Ticket, Urlaub, Kalkulation), Pro 299 (Kundenportal, Subunternehmer), Pro Plus 499 (Controlling, Schnittstellen) ([mendato.com](https://www.mendato.com/)). CleanMG kostet 29 bis 99 EUR, ohne Kalkulation und Qualität. KleanApp: 12,30 EUR pro Nutzer (reduziert) bis 99 EUR pro Nutzer (Pro) plus Einrichtung 290 bis 1.290 EUR, Schnittstellen erst ab Paket L. Dynvon: Einmallizenz 1.290 bis 10.900 EUR plus 49 bis 109 EUR Betrieb monatlich ([Dynvon](https://www.dynvon.com/reinigung/software)). Swept erlaubt Inspektionen erst ab 150 USD ([Swept](https://sweptworks.com/janitorial-inspection-software)). [Ableitung] Controlling, Kundenportal, Kalkulation, Schnittstellen und Qualität gelten als "Premium"; ein Produkt, das Kalkulation, Controlling und Mängelworkflow ohne Aufpreis bietet, positioniert sich zwischen CleanMG und Mendato. Zahlungsbereitschaft kleiner Betriebe bleibt unbelegt.

## In Deutschland rechtlich oder kulturell problematische Features

Die rechtliche Einordnung beruht auf der Vorrecherche (CMS, Böckler, BAG) und ist keine Rechtsberatung. [Beleg] Der Betriebsrat hat nach § 87 Abs. 1 Nr. 6 BetrVG mitzubestimmen, sobald eine Einrichtung technisch zur Verhaltens- oder Leistungskontrolle geeignet ist, ohne Bagatellschwelle; ein Praxisbeispiel zu GPS-Einsatzplanung regelt per Betriebsvereinbarung, dass Ortung nur in der Arbeitszeit läuft und Beschäftigte sie in Pausen abschalten können ([CMS Law](https://cms.law/de/deu/legal-updates/arbeitszeiterfassung-it-tools-und-apps-rechtssicher-einfuehren), [Böckler](https://www.boeckler.de/data/mbf_bvd_praxis_einsatzplanung_per_ortungssysteme.pdf)). Zusätzlich greifen Datenschutzgrundsätze (Erforderlichkeit, Zweckbindung); biometrische Daten fallen unter Art. 9 DSGVO ([Eigenableitung] aus allgemeinem Rechtswissen, in den Notizen nicht belegt). Eine rechtliche Primärprüfung fand nicht statt.

| Feature | Anbieter | Evidenz (Vorkommen) | Einschätzung für DE | Empfehlung |
|---|---|---|---|---|
| Zwingender Geofence (Stempeln ohne Standort blockiert) | Swept, Connecteam | mittel | Kritisch (Leistungskontrolle, Verhältnismäßigkeit) | **Nicht empfohlen** |
| Nicht-zwingender Geofence mit Offsite-Report | Swept, PD (Standortkontrolle), Mend (GPS-Nachweis) | mittel | Mittel; nur mit Betriebsvereinbarung, Ereignisbezug statt Dauertracking | **Nicht im Prototyp** |
| Live-GPS, Fuhrpark-Live-Karte | Connecteam, KA | mittel | Kritisch | **Nicht empfohlen** |
| Gesichtserkennung gegen Buddy-Punching | JM | mittel | Kritisch (biometrisch) | **Nicht empfohlen** |
| Öffentliche Anzeige "zuletzt gereinigt von wem" | JM (Scan4Clean) | mittel | Kritisch (Personenbezug öffentlich) | **Nicht empfohlen**; stattdessen nur Zeitpunkt ohne Namen |
| Personenbezogene Inspektionsscores und Rankings | JM (Historie, Coaching), Swept | mittel | Mittel bis kritisch | **Auswertung je Objekt, nicht je Person** |
| Mood-Report beim Ausstempeln | Swept (indirekt belegt) | schwach | Kritisch | **Nicht empfohlen** |
| QR/NFC-Scan als Objektnachweis, Kiosk-Stempeln | JM, KA, CM, A.S.E. | mittel | Unkritisch bis gering, wenn kein Dauertracking | **Umsetzen** (QR) |
| Plan-Warnung Minijob-Grenze, Unterweisungsampel | - | - | Unkritisch; Ampel nur mit Datum, keine Gesundheitsdaten | **Bestand** |
| KI-Auswertung von Zeiterfassung auf Arbeitszeit-Auffälligkeiten | KA | mittel | Mittel (Leistungs-/Verhaltenskontrolle); Betriebsrat | **Nicht empfohlen** |
| Zuschlagslogik mit Tarifwerten ohne Pflichtangabe | PD, Mend | mittel | Rechtlich heikel durch Haftung bei falschem Satz; aktuell Tarifwerte ungültig ab 31.12.2026 | **Mit Gültigkeitsdatum und Hinweis umsetzen** |

[Ableitung] Kulturell kommt hinzu: Beschäftigte hielten laut einer Praxisquelle an Outlook fest, aus Angst, Termine zu verlieren (Einführungswiderstand, schwacher Beleg), und 43 % erfassen Zeit noch handschriftlich. Eine Büro-Web-App, die Papierzettel nacherfasst, umgeht beides. Der Referentenentwurf zur elektronischen Zeiterfassung (BMAS, 18.06.2026) ist nicht beschlossen und sieht eine Ausnahme für Betriebe bis zehn Beschäftigte vor ([industrie-fachwissen.de](https://industrie-fachwissen.de/data/arbeitszeitreform-2027-elektronische-zeiterfassung-wochenhoechstarbeitszeit-betrieb)); § 17 MiLoG gilt bereits.

## Zusätzliche Features für den Prototyp: priorisierte Umsetzungsliste

Die Reihenfolge ist [Ableitung] aus Evidenz, Marktlücke, rechtlichem Druck und Aufwand im Frontend-Prototyp. Alles, was Außenkommunikation (Mail, Bank, öffentlicher Link) benötigt, ist bewusst ausgeklammert oder simuliert. Keine Priorität ist durch eine Befragung kleiner Betriebe abgesichert.

**Stufe 1, sofort (kleiner bis mittlerer Aufwand, starke Wirkung)**

1. **Tarifparameter mit Gültigkeit und Szenarien** (mittel): Lohngruppen, Zuschläge, Gültig-ab/bis und Szenario-Status als zentrale Tabelle; speist Kalkulator, Vertragspreisanpassung, Minijob-Ampel und Zuschläge. Nutzen: akuter Bedarf wegen offener Tarifrunde, bei keinem Anbieter außer PlanD-Wizard belegt.
2. **Mängel-Workflow Mangel -> Nacharbeit -> Nachkontrolle** (mittel): Status, Frist, Verantwortlicher, automatische Nachkontrolle-Aufgabe, Verknüpfung zur Begehung; Auswertung je Objekt (KleanApp/Otuvy-Muster).
3. **Leistungsnachweis und Arbeitsschein mit Unterschrift** (mittel): Checkliste aus LV, Zeitstempel, Canvas-Unterschrift, PDF je Einsatz oder Monat; Arbeitsschein-Positionen fließen in die Rechnung.
4. **Rechnungslauf aus Verträgen und Zeiten, mit Entwurf -> Freigabe, plus Offene-Posten-Liste** (mittel): Lexware-Muster; Mahnung hängt Originalrechnung an.
5. **Korrekturprotokoll und Monatssperre für Zeiten, Nacherfassung mit Quellenfeld und 7-Tage-Warnung** (klein): Clockodo-/Swept-Muster, "invalidieren statt löschen".
6. **Zuschlagsberechnung für Zeiten** (mittel): Nacht, Sonntag, Feiertag nach Tarifwerten, höchster Zuschlag je Segment.

**Stufe 2, danach (mittlerer Aufwand)**

7. **Optionspositionen/Alternativen im Angebot und Weiterführen-Dialog** (mittel), dazu Angebots-Wiedervorlage ohne Versand (klein).
8. **Plan-Editor mit Inline-Warnungen** (Unterbesetzung, Max-Arbeitszeit, Ruhezeit, Minijob-Restbudget) und **Abwesenheitsliste mit betroffenen Einsätzen** samt Springervorschlag (mittel).
9. **CSV-Import und vollständiger Datenexport** für Kunden, Objekte, Mitarbeiter, Raumbuch (mittel).
10. **Fristenübersicht**: Vertragskündigung/-verlängerung, Subunternehmer-Dokumente, Mitarbeiterbescheinigungen, Management-Dashboard-Kacheln (klein).
11. **Preisanpassungsschreiben** als DIN-5008-PDF mit Status und Stichtag (klein bis mittel, nutzt Bestand).

**Stufe 3, später**

12. QR-Code je Objekt für Mängelmeldung (QR-Druck zuerst, öffentliche Seite mit Backend), Kundenbericht-PDF monatlich als Vorstufe zum Kundenportal, Stichprobe nach DIN 2859-1, Materialbestand mit Mindestmenge, Zeitkonto, Routen/Fahrtzeit, CSV-Kontoauszug-Abgleich, DATEV-/Lohn-Export, E-Rechnung, Rollen, Mehrsprachigkeit.

**Nicht umsetzen:** Dauer-GPS, Pflicht-Geofencing, Gesichtserkennung, personenbezogene Scores/Mood-Tracking, öffentliche Namensanzeige, eigene Lohnabrechnung, Bank-API/virtuelle IBAN, KI-Grundriss-/LV-Import, Roboter-/Sensorintegration, GAEB-Ausschreibungsimport, native Mitarbeiter-App.

## Fazit

Der Katalog verschiebt die Frage von "was fehlt?" zu "was lohnt sich?": Die tiefen Funktionen der Wettbewerber (KI-Importe, NFC-Stempeln, Kundenportale, Bank-APIs, Mitarbeiter-Apps) sind teuer in Betrieb und Datenschutz, während die belegten Lücken (Tarif- und Preisanpassungslogik, Minijob-Budget, Fristen, Büro-Nacherfassung mit Revisionsspur) im Frontend-Prototyp billig und für ein Produkt zwischen CleanMG und Mendato verkaufsfähig sind. Die Preisgestaltung der Wettbewerber, bei der Controlling und Kundenportal erst im Premiumtarif stehen, macht ein transparentes Paket mit Controlling und Mängelworkflow zu einer eigenen Positionierung, was aber ohne Nutzerbefragung eine Hypothese bleibt.

Das größte Risiko ist die dünne Evidenz: Viele Features sind nur als Hilfe-Titel belegt, Nutzerstimmen deutscher Anbieter fehlen fast ganz, und die Tarifrunde 2027 kann Annahmen schnell überholen. Vor dem Bau der Stufe-2-Funktionen sollten fünf bis zehn Betriebe mit 5 bis 50 Beschäftigten befragt, die Mendato- und PlanD-Hilfeartikel im Volltext gelesen und die rechtlichen Fristen zur E-Rechnung sowie zum Zuschlagswesen geprüft werden.
