# Finanz- und Geschäfts-Features moderner KMU-Software (DE) für einen Gebäudereiniger mit Dauerverträgen

Stand der Recherche: 03.11.2026. Methode: Web-Suche mit Zusammenfassungen plus gezielte Seitenabrufe; Rechtsstände mit Datum. Aufwand = Aufwand im Frontend-Prototyp (klein/mittel/groß). Ergänzt (wiederholt nicht) `Konkurrenz Featurekatalog Reinigungssoftware/handwerker_angebote.md` (dort bereits: Serienrechnung, OP-Liste/Mahnstufen, Kundencenter-Link mit Klick-Annahme, Optionspositionen, Lexware/sevdesk-Bankabgleich, DATEV-Export, ToolTime Pay, HERO virtuelle IBAN).

Quellenhinweis: Viele Belege stammen aus Such-Zusammenfassungen von Hersteller- und Drittseiten; wo nur Drittquelle oder Marketing, ist das vermerkt.

## 1. Zahlung und Liquidität

### Takeaway
Für Dauerrechnungen ist SEPA-Lastschrift mit Mandatsverwaltung das stärkste Feature; Lexware Office löst es nicht selbst, sondern über den Partner SepaHeld/GoCardless (Mandat per Mail bei erster Rechnung, Buchungsvorschläge nach Einzug), Qonto bündelt es mit Konto. EPC-QR/GiroCode ist ein offener Standard und im Frontend vollständig erzeugbar. Alles mit echtem Geldfluss (Einzug, Bank-API) braucht Backend und regulierten Dienstleister.

### Cited Findings
| Feature | Produkt/Quelle | Beleg-URL | Workflow | Backend nötig? | Nutzen für Reiniger | Aufwand App |
|---|---|---|---|---|---|---|
| SEPA-Lastschrift mit automatischer Mandatseinholung für Serien-/Einzelrechnungen | Lexware Office + SepaHeld/GoCardless | https://lexware.de/partner/gocardless-sepaheld/ | Konten verbinden; passende Zahlungsbedingung wählen; beim Speichern/Senden einer Rechnung geht Mandatsanfrage per Mail an Kunde (einmalig je Kunde); nach Einzug Buchungsvorschläge per Klick | Ja: Zahlungsdienstleister (GoCardless), Mail, Webhooks | Sehr hoch: Monatsrechnungen Unterhaltsreinigung ohne Mahnaufwand | Prototyp: Mandatsstatus (offen/aktiv/widerrufen), Gläubiger-ID, Mandatsreferenz, Einzugsvorschau und pain.008-XML-Download = mittel; echter Einzug = groß |
| Mandat-Grundlagen: Gläubiger-ID kostenlos bei der Bundesbank, ungenutztes Mandat erlischt nach 36 Monaten (Drittquelle) | kostenlose-erechnung.de (Ratgeber, Dritt) | https://kostenlose-erechnung.de/ratgeber/sepa-lastschriftmandat-b2b-vorlage/ | Mandatsablaufwarnung, Mandatsvorlage (B2B vs. Basis) | Nein für Verwaltung | Mittel-hoch: Ablaufwarnung 36 Monate ist sinnvolle Erinnerung | klein |
| Lastschrift bei wiederkehrenden Rechnungen aktivieren; Rechnung mit Transaktion automatisch verknüpft; automatische Zahlungserinnerungen | Qonto (Marketing) | https://qonto.com/de/payment-methods/direct-debit ; https://qonto.com/de/accounting | Intervall wählen, Lastschrift aktivieren, Einzug beim Versand | Ja (Konto/Zahlungsdienst) | Hoch | groß (nur Konzept zeigbar) |
| GoCardless-Gebühren: 1 % max. 2 € oder fix 0,10-0,60 € plus Monatsgebühr (GoCardless-Hilfeartikel Juni 2024); Rücklastschriften können 10 € oder mehr kosten | GoCardless | https://gocardless.com/de/handbuch/artikel/mollie-oder-stripe ; https://gocardless.com/de/handbuch/sepa/laender | Kostenkalkulation je Rechnung | Ja | Zeigt Wirtschaftlichkeit: bei 1.500-€-Monatsrechnung deckelt 2-€-Gebühr | klein (Gebührenrechner) |
| Mollie/Stripe SEPA-Lastschrift: Mandat einmal, danach Einzug ohne Kundenaktion (Mollie) | Mollie | https://www.mollie.com/gb/payments/direct-debit | Mandat bei erster Zahlung | Ja | Alternative zu GoCardless | wie oben |
| EPC-QR-Code / GiroCode: Spezifikation EPC069-12 des European Payments Council; enthält Empfänger, IBAN, Betrag, Verwendungszweck, optional Referenz ISO 11649; Banking-App füllt Überweisung aus; bei Skonto Betrag problematisch | Sekundär (konto.org, rubydoc, easybill) | https://www.konto.org/lexikon/epc-qr-code/ ; https://www.easybill.de/?p=33581 ; https://www.npmjs.com/package/girocode | QR auf Rechnungs-PDF drucken, Kunde scannt | Nein | Hoch bei Kleinkunden/Privat (Treppenhausreinigung) | klein (Bibliothek, reines Frontend) |
| Zahlungslink PayPal in digitale Rechnung eingefügt; Verknüpfung zeigt bezahlt/offen | sevdesk | https://sevdesk.de/integrationen/paypal ; Stripe nur über Drittconnector (https://syncspider.com/integrations/sevdesk-and-stripe) | Link hinterlegen, wird automatisch in Ausgangsrechnung eingefügt | Link: nein (statischer Link); Statusabgleich: ja | Mittel; für B2B-Dauerverträge weniger relevant | klein (Link) |
| Zahlungslink ist in § 14 UStG weder vorgeschrieben noch verboten; ersetzt nicht Pflichtangaben (nur Einzelblog) | kostenlose-erechnung.de (Dritt, nicht autoritativ) | https://kostenlose-erechnung.de/ratgeber/paypal-stripe-rechnung-zahlungslink/ | - | - | Hinweis für Compliance | - |
| Bankabgleich per API mit Zuordnungsvorschlag: finAPI ist BaFin-registrierter Kontoinformationsdienst (AISP) und Zahlungsauslösedienst; PSD2-Lizenz als Add-on, damit Kunden keine eigene Erlaubnis brauchen; Zugriff über XS2A, FinTS, Web Scraping | finAPI | https://www.finapi.io/en/products/open-banking/banking-api/ ; https://www.finapi.io/?p=13492 ; https://www.ki-syndikat.de/tools/finapi/ (Dritt) | Konto per Bank-Login/SCA verbinden, Umsätze abrufen, mit offenen Posten matchen | Ja zwingend: Dritt-API plus Lizenz-Add-on; Zugriff muss alle 90 Tage per SCA erneuert werden (aus Wissen, nicht belegt) | Sehr hoch: spart Zahlungseingangs-Buchung | Prototyp: CSV/MT940/CAMT-Import mit Match (Rechnungsnummer, Betrag, IBAN) = mittel; API = groß |
| Belegmanagement am Konto: Fotoscan, GoBD-Archiv, Zuordnung zu Transaktion, Montags-Erinnerung für fehlende Belege, Weiterleitung per Mail, DATEV/Lexware-Sync (Lexware: stündlich, max. 90 Tage rückwirkend) | Qonto | https://qonto.com/de/accounting/receipt-management ; https://www.lexware.de/partner/qonto/ | Beleg fotografieren, Transaktion wählen | Ja (Bankdaten); OCR auch | Hoch für Material-/Tankbelege der Objektleiter | Foto + manuelle Zuordnung klein; OCR groß |
| Forderungsmanagement mit Inkasso-Übergabe nach letzter Mahnstufe (manuell/automatisch), Mahnstopp, Kontoabgleich | Bilendo; Creditreform Mahnwesen | https://www.deutscherpresseindex.de/?p=1281 ; https://www.creditreform.de/fileadmin/user_upload/Creditreform_Koeln/docs/NEU_Produktblatt_Creditreform_Mahnwesen.pdf | Mahnlauf -> Inkassopartner über Standardschnittstelle | Ja (Partner-API) | Mittel; bei Dauerkunden eher Mahnstopp bei Reklamation relevant | Mahnstopp-Flag klein; Übergabe-Export (CSV) mittel |
| Billomat: Bankabgleich, Mahnwesen mit Inkassoanbindung, DATEV-Format | Billomat (DATEV-Marktplatz) | https://www.datev.de/web/de/marktplatz/billomat | - | Ja | siehe oben | - |
| Factoring: Software gibt offene Posten an Factoring-Dienstleister weiter | Nicht produktspezifisch (Suchzusammenfassung) | https://omr.com/de/reviews/category/accounts-receivable | - | Ja | Gering-mittel (Reiniger mit 30-60 Tage Zahlungsziel öffentlicher Auftraggeber) | nur Export |

### Inferences
- Im Prototyp zeigbar ohne Dritt-API: EPC-QR auf Rechnung, Mandatsverwaltung inkl. Ablaufwarnung, pain.008-Sammellastschrift-Datei (SEPA-XML) zum Hochladen ins eigene Online-Banking (der Betrieb zieht dann selbst ein, braucht eigene Gläubiger-ID und Bankvereinbarung - nicht belegt, Annahme), CSV-/CAMT-Kontoauszug-Import mit Zuordnungsvorschlag, Mahnstufen-Logik, Cashflow-Prognose aus offenen Posten und Serienrechnungsplan (reine Berechnung).
- "Mahnstopp bei Reklamation" und Rücklastschrift-Kostenhinweis sind Differenzierung für Reinigung (Qualitätsreklamationen sind Standardgrund für Zahlungsverzug).
- Zahlungsdienste (Einzug, Pay-Links) dürfen nicht selbst angeboten werden; Anbindung an lizenzierten Partner ist der übliche Weg (GoCardless/Mollie/Stripe; finAPI mit PSD2-Add-on).

### Gaps
- Keine offizielle, datierte 2026-Preisliste von Mollie/Stripe SEPA; GoCardless-Zahlen sind von 2024 (Hilfeartikel) bzw. Drittquelle.
- Skonto-Automatik, Cashflow-Prognose-Tools (z. B. Qonto/Pleo/sevdesk) wurden nicht gezielt belegt; Pleo und Zervant nicht recherchiert.
- Lexware-/sevdesk-Zahlungslink-Hilfeartikel: kein Treffer.

## 2. Rechnung und Buchhaltung

### Takeaway
E-Rechnung ist der zeitkritische Pflichtpunkt: Empfang seit 2025; Versandpflicht ab 01.01.2027 für Unternehmen mit Gesamtumsatz 2026 über 800.000 €, ab 01.01.2028 für alle. Ein Gebäudereiniger mit Dauerverträgen an Unternehmen/Behörden (B2B/B2G) ist voll betroffen. DATEV-Export und Belegerfassung sind Standard.

### Cited Findings
- Fristentabelle (Stand 19.10.2026): Übergangsregel § 27 Abs. 38 Nr. 2 UStG gilt bei Gesamtumsatz 2026 bis 800.000 € nur für 2027 ausgeführte Umsätze; ab 01.01.2028 können die allgemeinen Übergangsregeln nicht mehr genutzt werden; 800.000-€-Grenze nach § 19 Abs. 2 UStG (vereinnahmte Entgelte, ohne USt); EDI-Übergang bis Ende 2027; für 2026 ausgeführte Leistungen reicht Papier/PDF nur, wenn Rechnung bis 31.12.2026 übermittelt wurde — [ETL Zeitplan](https://www.etl.de/e-rechnung/zeitplan/)
- BMF-Schreiben vom 15.10.2026 (laut ETL und IHK Gera) bringt neue Details, verlängert die allgemeinen Übergangsfristen nicht — [ETL](https://www.etl.de/e-rechnung/zeitplan/) ; [IHK Gera](https://www.ihk.de/gera/recht-und-steuern/aktuelles-rechtundsteuern/naechste-stufe-der-e-rechnung-7216566). Ältere Quellen nennen ein BMF-Schreiben vom 15.10.2025 (Dritt: https://kostenlose-erechnung.de/ratgeber/e-rechnungspflicht-leitfaden/). BMF-Original nicht abgerufen.
- Kleinbetragsrechnungen bis 250 € brutto ausgenommen; Empfangspflicht seit 2025 — [kostenlose-erechnung.de](https://kostenlose-erechnung.de/ratgeber/e-rechnung-pflicht-faq-2026/) (Dritt)
- Widerspruch zur Auslegung der Umsatzgrenze 2026/2027: ETL sagt, bei Gesamtumsatz 2026 über 800.000 € müssen 2027 ausgeführte Umsätze E-Rechnung sein; sevdesk-Blog soll angeben, sonstige Rechnung könne 2027 trotz Vorjahresumsatz über 800.000 € zulässig sein (nur aus Such-Zusammenfassung; Volltext nicht geprüft) — [sevdesk Blog](https://sevdesk.de/blog/e-rechnung-update/) vs. [ETL](https://www.etl.de/zeitplan)
- E-Rechnung erstellen/empfangen: sevdesk, ToolTime, HERO (siehe Vorrecherche); Lexware: XRechnung + digitaler Rechnungseingang per Mail (Vorrecherche, https://www.lexware.de/funktionen/)
- Serienrechnung (Vorrecherche) ohne Indexierung belegt; Indexierung/Preisanpassung siehe Abschnitt 3.
- DATEV: Lohnimport per ASCII; DATEV prüft nur den Dateikopf, volle Prüfung erst in der DATEV-App, Testimport empfohlen — [DATEV ASCII-Vorgaben](https://developer.datev.de/datev/platform/en/schnittstellenvorgaben/ascii) (nur aus Suchzusammenfassung; Seite nicht abrufbar)
- Qonto: Lieferantenrechnungen/Kreditoren-Modul, Belege per Foto — [Qonto Supplier Invoices](https://qonto.com/de-at/invoicing/supplier-invoices) (nur Titel, kein Detail abgerufen)

### Inferences
- E-Rechnung im Prototyp: Das XRechnung-/ZUGFeRD-XML (CII) ist mit Bibliothek client-seitig erzeugbar; "Validierung gegen KoSIT" ist nicht belegt, Prototyp zeigt nur "Format-Check/Vorschau". Pflichtfelder bei Behördenrechnung: Leitweg-ID (Annahme aus Fachwissen, hier nicht belegt) - Feld "Leitweg-ID" im Auftraggeberstamm vorsehen.
- "Kostenstelle je Objekt" ist Alleinstellungsmerkmal für Reiniger (Marge je Objekt); in den recherchierten Produkten nicht gezielt belegt.

### Gaps
- Nicht recherchiert: §13b-Automatik (Reverse Charge für Gebäudereinigung ist im Gesetz § 13b Abs. 2 Nr. 8 UStG geregelt, hier nicht belegt), Kostenstellen/Umlagen in Lexware/sevdesk, Kreditoren-OCR-Funktionen, BMF-Primärschreiben, XRechnung-Version/Standard-Pflichten (Leitweg-ID, Bundesrecht).

## 3. Preise und Verträge

### Takeaway
Lohn- und Tarifbindung der Branche ist der stärkste Auslöser für ein Preisanpassungs-Feature: Branchenmindestlohn Lohngruppe 1 stieg 13,50 € (2024) -> 14,25 € (01.01.2025) -> 15,00 € (01.01.2026); Lohngruppe 6 16,70 -> 17,65 -> 18,40 €. Die Mindestlohn-Verordnung läuft laut Suchzusammenfassung zum 31.12.2026 aus, die Tarifrunde 2026 läuft. Verträge der öffentlichen Hand enthalten Lohngleitklauseln.

### Cited Findings
| Feature | Produkt/Quelle | Beleg-URL | Workflow | Backend nötig? | Nutzen für Reiniger | Aufwand App |
|---|---|---|---|---|---|---|
| Lohngleitklausel-Automatik: Preis folgt Tarif-/Mindestlohnänderung und Sozialabgaben, maßgeblich Lohntarifvertrag des Gebäudereiniger-Handwerks (Vertragsmuster Görlitz, Bautzen: eigener § 5) | Vergabe-Vertragsmuster (Primär, Behörden) | https://www.evergabe.de/unterlagen/0192242a-f8d8-4a58-bdde-b5837dab2819/download-url/b0499a8b-db11-4234-a4cc-7b905cefe8d7 (Seite per Suche gefunden, Inhalt nur als Zusammenfassung) | Tarifstufen mit Stichtag hinterlegen -> App berechnet Anteil Lohnkosten je Vertrag -> Vorschlag neuer Monatspreis -> Kundenschreiben (PDF) -> Freigabe | Nein für Rechenlogik/PDF; Mail-Versand ja | Sehr hoch: Tarifsprung 15,00 -> neuer Satz 2027 erwartbar, Marge-Schutz | mittel |
| Branchenmindestlohn-Stufen: LG1 13,50 / 14,25 / 15,00 €; LG6 16,70 / 17,65 / 18,40 € (2024/2025/2026); Laufzeit 24 Monate; allgemeinverbindlich; Azubi-Vergütung | Deutsche Handwerks Zeitung | https://www.deutsche-handwerks-zeitung.de/tariflohn-gebaeudereinigung-2025-2026-337962/ | Tariftabelle als pflegbarer Datensatz | Nein | Datengrundlage Kalkulation | klein |
| Verordnung (GebäudereinigungsArbbV) tritt mit Ablauf 31.12.2026 außer Kraft (Suchzusammenfassung, einzeln prüfen); IG BAU fordert laut Meldung 17 € bzw. +2 €, erster Termin 09.09.2026 | ms-aktuell; handwerk.com; buzer | https://ms-aktuell.de/welt/ig-bau-mindestlohn-04-09-2026/ ; https://handwerk.com/politik-und-wirtschaft/gebaeudereinigung-gewerkschaft-fordert-2-euro-mehr-pro-stunde ; https://www.buzer.de/Anlage_GebaeudeArbbV.htm | "Was-wäre-wenn"-Szenario: Tarif +X € -> Marge je Objekt | Nein | Hoch: Vorlaufwarnung vor Preisverhandlung | klein-mittel |
| Rechtlicher Rahmen: BGH VII ZR 13/05 behandelt Lohnklauseln als Kostenelementeklauseln; nur Lohnkostenveränderungen sollen Preis ändern (Pfennigklausel); Hinweis Rödl: Reinigungsverträge überwiegend Werkverträge, Verträge nach Mindestlohnerhöhung anpassen | anwalt24; NWB; Rödl | https://www.anwalt24.de/urteile/bgh/2006-06-08/vii-zr-13_05 ; https://www.roedl.com/insights/reinigungsvertrag-herausforderungen/ | Klauselbaustein in Vertragsvorlage; Hinweis "rechtlich prüfen lassen" | Nein | Mittel | klein |
| Angebots-Annahme per Link, Online-Annahme per Klick, Optionen: bereits Vorrecherche (Lexware Kundencenter) | Lexware | https://www.lexware.de/funktionen/kundencenter/ | - | Echt: ja; Simulation: nein | - | - |

### Inferences
- Preisbenchmarks je m²/Objektart, Margenwarnungen, "angesehen"-Tracking, eIDAS-Stufen: nicht belegt (Gaps). Margenwarnung ist reine Rechnung (Umsatz minus Lohn x Stunden x Lohnnebenkosten-Faktor minus Material/Fahrt) und im Prototyp darstellbar.
- Vertragsverlängerungs-Workflow (Kündigungsfrist-Countdown, automatische Verlängerung, Wiedervorlage 90/60/30 Tage) ist reine Datumslogik -> klein.

### Gaps
- Kein Beleg zu Preisbenchmarks (Reinigungsleistung €/m² nach Objektart), keine Produktbelege für Index-Serienrechnungen in Lexware/sevdesk (Suche lieferte keine), keine eIDAS-/Signatur-Anbieter (z. B. Skribble, DocuSign) recherchiert, keine Vertragsvorlagen-Features.
- Tarifstand 2027 und Verlängerung der Mindestlohnverordnung: ungeklärt, Verhandlungen laufen (Stand Quellen Sep. 2026).

## 4. Ausschreibungen

### Takeaway
Ausschreibungen für Gebäudereinigung erscheinen mit CPV 90911200 (Gebäudereinigung; Fund durch TED-Bekanntmachungen) auf TED, evergabe.de, DTVP u. a. Portale bieten kostenlose Registrierung, CPV-Filter, gespeicherte Suchprofile und E-Mail-Benachrichtigung. Standard-Bieterunterlagen (PQ-VOL, Unbedenklichkeitsbescheinigungen, Eigenerklärungen) lassen sich als Dokumenten-Ablage mit Ablaufdatum abbilden.

### Cited Findings
| Feature | Produkt/Quelle | Beleg-URL | Workflow | Backend nötig? | Nutzen für Reiniger | Aufwand App |
|---|---|---|---|---|---|---|
| Monitoring nach CPV: Bekanntmachungen zu Unterhaltsreinigung tragen CPV 90911200; Beispiele TED, Region Hannover, Stadt Kleve, Kiel | TED/Behörden | https://ted.europa.eu/de/notice/283892-2025/pdf ; https://kleve.de/system/files/2025-01/Unterhaltsreinigung%20Aufragsbekanntmachung%2026.01.2025-25.02.2025.pdf | Suchprofil (CPV + PLZ-Radius) -> Treffer-Liste -> "Interessant"-Status | Ja (TED-API/Portal-Feeds; Prototyp: manuelle Erfassung/Import) | Hoch | Prototyp: Pipeline-Board + manuelles Anlegen = klein-mittel |
| Deutsche eVergabe: Suche nach Schlagwort, Region, CPV; gespeicherte Suchprofile nach Registrierung; E-Mail-Benachrichtigung (Landkreis-Leitfaden); Registrierung kostenlos; DTVP mit Basic/Professional/Enterprise | Behörden-Leitfäden | https://www.oldenburg.de/fileadmin/oldenburg/Benutzer/Dateien/22_Rechtsamt/Vergaberecht/Leitfaden_Bietende_-_Stand_Juni_2025_Barrierefrei.pdf ; https://www.auftraege.bayern.de/content/documents/Nutzungsbedingungen_registrierte_Benutzer.pdf | Konto beim Portal; Suchprofil dort anlegen; Alert per Mail | Ja (Portal) | Hoch | Prototyp: Anleitung + eingehende Alert-Mail als Import = klein |
| evergabe.de Preisliste Auftraggeber: Bieter nutzen kostenfrei bei Profisuche, 50 € pro Vergabe (Auftraggeber-Preisliste, kein Bieterpreis; Deutung unklar) | evergabe.de | https://a.storyblok.com/f/328997/x/e9d3145f98/260901-preisliste-ag-evergabe-de.pdf | - | - | Unklar | - |
| PQ-VOL: regionale Präqualifizierungsstellen (IHK), bundesweite Datenbank pq-vol.de; Dokumente: Gewerbeanmeldung, Registerauszug, Eigenerklärungen (Steuern, Sozialabgaben, Straftaten, Insolvenz), BG-Unbedenklichkeit, Haftpflichtpolice; Bremen: Sozialkasse-Unbedenklichkeit, Gültigkeit 1 Jahr | IHK-Flyer; Bremen | https://www.ihk.de/blueprint/servlet/resource/blob/1408482/85436efe9e0161eff7fec863d61a56c8/flyer-praequalifizierung-data.pdf ; https://www.service.bremen.de/dienstleistungen/unternehmen-in-das-verzeichnis-praequalifizierter-unternehmen-fuer-oeffentliche-ausschreibungen-im-baubereich-eintragen-lassen-190361 | Dokumentensafe mit Gültigkeitsdatum, Ampel, "Bieterpaket" als ZIP | Nein im Prototyp | Sehr hoch: Wiederkehrendes Suchen von Dokumenten | klein-mittel |
| Typische Zusatzunterlagen: Formblatt L 124/EEE, Krankenkassen-Unbedenklichkeit (max. 6 Monate), Steuer-Unbedenklichkeit, Objektleiter-Qualifikation "Geprüfter Objektleiter in der Gebäudereinigung", Referenzen, Tariftreue | TED/Hannover/Halle-Bekanntmachung (Suchzusammenfassung) | https://www.hannover.de/content/download/1071915/file/2026-OJS157-00569227-de-ts.pdf ; https://ted.europa.eu/de/notice/321036-2026/pdf | Checkliste je Ausschreibung aus Dokumentenstamm | Nein | Hoch | mittel |
| Kalkulation: Auskömmlichkeit bei Reinigungsdienstleistungen (Lohnuntergrenze als Prüfmaßstab) | Vergabeblog 2013 | https://vergabeblog.de/2013-01-06/auskommlichkeit-der-angebote-bei-der-vergabe-von-reinigungsdienstleistungen/?print=print | Auskömmlichkeits-Check vor Abgabe | Nein | Hoch | mittel (Rechnung) |

### Inferences
- GAEB-Import ist für Gebäudereinigung eher nicht üblich (Leistungsverzeichnisse oft PDF/Excel/Raumbuch) — nicht belegt. Sinnvoller: Raumbuch-/Leistungsverzeichnis-Import via CSV/Excel mit m² je Raumart und Reinigungsintervall.
- Prototyp kann Alert, Pipeline, Dokumentenampel und Auskömmlichkeitsrechner vollständig lokal simulieren; einziger echter Dritt-Zugriff wäre TED/Portal-Feed.

### Gaps
- service.bund.de, DTVP, evergabe-online Hilfe-/Suchagenten-Seiten nicht direkt abgerufen; Suchagent-Details nur indirekt belegt. TED-API-Zugangsbedingungen nicht geprüft.
- GAEB für Reinigung: kein Beleg. PQ-VOL-Formularliste aktuell: nicht belegt.

## 5. Lohn und Personal

### Takeaway
Lohn-Export in DATEV (LODAS/Lohn und Gehalt) per ASCII-Importdatei ist der etablierte Weg (Personio-Beispiel); Papershift bietet DATEV-kompatible Exporte. Zuschläge (SFN) haben klare steuerliche Regeln, Minijob-Besonderheiten sind dokumentiert.

### Cited Findings
- Personio exportiert Stammdaten, Fixgehälter, wiederkehrende/einmalige Vergütungen, Stundenlöhne, Abwesenheiten über Lohnimportdatenservice; Import in DATEV via LODAS-ASCII-Import — [Personio Support](https://support.personio.de/hc/en-us/articles/360012685577-Exporting-Master-Data-via-the-Lohnimportdatenservice)
- Rückweg: Lohnabrechnungsdokumente über Lohnauswertungsdatenservice — [Personio Support](https://support.personio.de/hc/en-us/articles/4407943363089-Importing-documents-via-the-DATEV-Lohnauswertungsdatenservice)
- Papershift: DATEV-kompatible Exporte; Test nennt LODAS, Sage; Dienstplanung erst ab Premium (Dritt) — [Papershift](https://www.papershift.com/en/time-logging) ; [Fastlancer](https://www.fastlancer.org/fastlancer-blog/papershift-review/)
- SFN-Zuschläge 2026: bis 25 €/h Grundlohn steuer- und SV-frei, 25,01-50 € nur steuerfrei, ab 50,01 € voll abgabepflichtig (DATEV-Übersicht) — [DATEV SFN 2026](https://www.datev.de/web/de/unternehmen/loesungen/themen-im-fokus/aktuelle-themen-fuer-unternehmen/sfn-zuschlaege_2026)
- Nur für tatsächlich geleistete Arbeit; Zuschläge ohne Arbeitsleistung steuerpflichtig, im Minijob zählen sie dann zum Verdienst — [Minijob-Zentrale](https://www.minijob-zentrale.de/DE/meta/faq-bereich/lohn/25_was_ist_bei_SFN-Zuschlaegen_zu_beachten/faq_25_was_ist_bei_SFN-Zuschlaegen_zu_beachten) ; [Haufe](https://www.haufe.de/hr/magazin/sonntagszuschlag-was-arbeitgeber-wissen-muessen)
- DATEV-Produkte für SFN in LODAS und Lohn und Gehalt — [DATEV LODAS](https://www.datev.de/web/de/shop/produkt-details/zuschlaege-fuer-sonntags-feiertags-und-nachtarbeit-mit-datev-lodas-77689)
- Zeiterfassung-Anbieter mit DATEV-Lohnexport (zmi time) — [DATEV Marktplatz](https://www.datev.de/web/de/marktplatz/zmi-time)

| Feature | Produkt/Quelle | Workflow | Backend nötig? | Nutzen | Aufwand App |
|---|---|---|---|---|---|
| Stunden -> Lohnarten-Export (Normal, Nacht, Sonn-/Feiertag, Urlaub, Krank) als CSV/LODAS-ASCII | Personio, Papershift | Monatsabschluss -> Prüfliste -> Export-Datei -> Steuerberater importiert | Nein (Datei); direkte Übergabe nur über DATEV-Dienste (Zulassung/Partner) | Sehr hoch: Reinigungskräfte sind zu Randzeiten tätig | mittel (Lohnartenmapping je Mandant); ASCII-Struktur ist Spezifikation, Testimport nötig |
| Zuschlagsrechner mit Steuergrenze 25/50 € und Minijob-Hinweis | DATEV / Minijob-Zentrale | Regelwerk als Konfiguration | Nein | Hoch | klein |

### Inferences
- Gebäudereinigung hat Branchenmindestlohn (siehe 3); Zuschlagsregeln des Rahmentarifvertrags nicht belegt, daher Zuschlagssätze konfigurierbar halten.
- Zeitkonten, Urlaubsberechnung, Sofortmeldung, Minijob-Meldungen: keine Produktbelege gefunden; Sofortmeldung und Meldungen laufen über SV-Meldeportal/Entgeltabrechnungsprogramm (nicht belegt) -> im Prototyp nur Checkliste/Hinweis.

### Gaps
- Keine Primärquelle für Papershift-DATEV-Details, Sofortmeldung, Urlaubsberechnung nach BUrlG/Tarif, Zeitkonten; DATEV-ASCII-Seite konnte nicht abgerufen werden (leerer Abruf), Aussagen daraus sind Suchzusammenfassung.

## 6. Was braucht Backend/Zulassung, was geht im Frontend-Prototyp?

### Takeaway
Zwingend Backend/Dritt-API/Lizenz: echter Lastschrifteinzug (lizenzierter Zahlungsdienst wie GoCardless/Mollie/Stripe), Bank-Live-Anbindung (PSD2, z. B. finAPI mit AISP-Lizenz bzw. Add-on), Mail-Ein-/Ausgang für Eingangsrechnungen, Kundenlink mit Zugriffsschutz, Portal-Feeds (TED/Vergabeplattformen), echte qualifizierte Signatur. Im Frontend zeigbar: alles Datenmodell, Berechnung und Dateiexport.

### Cited Findings
- finAPI-Lizenzmodell (AISP, PSD2-Add-on, XS2A/FinTS/Web Scraping) — [finAPI](https://www.finapi.io/?p=13492) ; [finAPI Banking API](https://www.finapi.io/en/products/open-banking/banking-api/)
- Lastschrift per Partner (SepaHeld/GoCardless) mit Konten-Verbindung — [Lexware Partner](https://lexware.de/partner/gocardless-sepaheld/)
- EPC-QR als offener Standard mit Bibliothek — [npm girocode](https://www.npmjs.com/package/girocode)
- DATEV-Dateiimport (ASCII) ohne API-Zulassung nutzbar, Prüfung nur Kopfzeile — [DATEV ASCII](https://developer.datev.de/datev/platform/en/schnittstellenvorgaben/ascii)
- Portale: Bekanntmachungssuche ohne Konto möglich, Suchprofile nach kostenloser Registrierung — [Oldenburg Leitfaden](https://www.oldenburg.de/fileadmin/oldenburg/Benutzer/Dateien/22_Rechtsamt/Vergaberecht/Leitfaden_Bietende_-_Stand_Juni_2025_Barrierefrei.pdf)

### Inferences (Matrix, Einschätzung)
| Feature | Prototyp-Variante ohne Backend | Echt braucht |
|---|---|---|
| SEPA-Mandate/Einzug | Mandatsverwaltung + pain.008-Download | Zahlungsdienst, Gläubiger-ID, Bank |
| Zahlungslink | Statischer Link/EPC-QR | PSP-Konto |
| Bankabgleich | CSV/CAMT-Import + Matching | finAPI o. ä. + PSD2 |
| E-Rechnung | XML-Erzeugung per Bibliothek + Formatcheck | Validator, Peppol/Mail-Versand |
| Eingangs-OCR | Foto + manuelle Felder | OCR-API |
| DATEV-Export | Datei-Download (Buchungsstapel/Lohn-ASCII) | Nichts; Direktübergabe = DATEV-Partner |
| Preisanpassung | Rechner + Schreiben-PDF | Mail-Versand |
| Vertrag/Signatur | Zeichenfeld/Klick-Annahme (einfache Signatur) | qualifizierte Signatur via Anbieter |
| Vergabe-Alerts | Manuelle Pipeline/Import | Portal-API/Feeds |
| Cashflow-Prognose | Berechnung aus OP + Serienplan | Nichts |
| Inkasso/Factoring | Übergabe-CSV | Partnervertrag |

### Gaps
- Kosten/Aufnahmeprozess für DATEV-Marktplatz-Partnerschaft, PSD2-Details der Reauthentifizierung, BaFin-Registerprüfung für finAPI: nicht verifiziert.
- Pleo, Zervant, Mollie/Stripe Primärpreise, Qonto-Preise: nicht recherchiert.

## Top-Ideen (Nutzen/Aufwand)
1. Tarif-/Index-Preisanpassung mit Kundenschreiben (mittel, sehr hoher Nutzen).
2. Bieter-Dokumentensafe mit Ablaufampel + Ausschreibungs-Pipeline (klein-mittel).
3. Mandatsverwaltung + SEPA-Sammeldatei + EPC-QR (klein-mittel).
4. E-Rechnung XRechnung/ZUGFeRD-Export mit Pflicht-Countdown 01.01.2027/2028 (mittel-groß).
5. Kontoauszugs-Import mit Zuordnungsvorschlag + Mahnstufen + Mahnstopp (mittel).
6. Marge je Objekt/Kostenstelle mit Tarifszenario (mittel).
7. Lohn-Export mit SFN-Zuschlagsmapping (mittel).
