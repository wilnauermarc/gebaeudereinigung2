# Featurekatalog Handwerker-/Dienstleister-Software (DE) für Kunden, Angebote, Aufträge, Rechnungen – übertragbar auf Reinigungsbetriebe

Stand der Recherche: 02.11.2026. Aufwand = Aufwand im reinen Frontend-Prototyp (klein/mittel/groß). Quellenqualität: "Hersteller" = Funktions-/Hilfeseite des Anbieters (primär); "Dritt" = Test-/Vergleichsportal (sekundär, ggf. veraltet). Nicht prüfbar waren: Hilfe-Center von HERO, ToolTime, Craftnote, Billomat, Fastbill (keine direkten Treffer, teils 404).

## 1. Welche konkreten Funktionen bieten die Produkte (Kundenstamm bis Onboarding)?

### Takeaway
Lexware Office und sevdesk liefern die am besten belegten Basis-Features (Optionspositionen, Angebot-per-Link mit Klick-Annahme, Serienrechnungen, Mahnstufen, Bankabgleich, XRechnung/ZUGFeRD, DATEV). HERO/ToolTime/openHandwerk/Craftnote ergänzen Auftrags-/Einsatzplanung, mobile Dokumentation und Unterschrift vor Ort. Duplikatserkennung, Tags, Versionierung, Befehlspalette und Tastaturkürzel sind bei den untersuchten Produkten nicht belegbar (Ausnahme: Shift+Enter bei Lexware-Aufgaben).

### Cited Findings

| Feature | Produkt | Beleg-URL | Workflow-Kurzbeschreibung | Aufwand im Prototyp |
|---|---|---|---|---|
| Kundenstamm mit Gesprächsnotizen, Dokumenten, Aufgaben pro Kunde | Lexware Office | https://www.lexware.de/funktionen/kontakte-verwalten/ | Pro Kontakt Notizen/Dateien/Aufgaben; Stammdaten werden automatisch in Angebote/Rechnungen vorbefüllt | klein |
| Kontakt-Kennzahlen (Umsatz, offene Forderungen, Zahlungsdauer), Sortierung nach Umsatz, CSV-Export | Lexware Office | https://www.lexware.de/funktionen/kontakte-verwalten/ | Kennzahlen direkt in Kundenliste/-detail | klein |
| Kontakt-CSV-Import (max. 2 MB, exakte Spaltenüberschriften; Fehlerdatei per E-Mail) | Lexware Office | https://help.lexware.de/de-form/articles/548267-anleitung-zum-import-von-kontakten-kunden-und-lieferanten ; https://help.lexware.de/de-form/articles/548116-kontakte-beim-account-wechsel-ubertragen-export-und-import-in-lexware-office | Vorlage laden, befüllen, hochladen; Prüfung in Kontaktübersicht | mittel |
| Kontakt-Rechtestufe ohne Finanzzugriff | Lexware Office | https://www.lexware.de/funktionen/kontakte-verwalten/ | Mitarbeiter bearbeiten Kontakte/Produkte, sehen keine Finanzdaten | mittel |
| Kontakte per CSV anlegen, in Kategorien einordnen | sevdesk | https://sevdesk.de/funktionen | Manuell oder CSV; Kategorien (Kunde/Lieferant) | klein |
| Kundenhistorie, Notizen, CRM, anpassbare E-Mail-Vorlagen, Versand aus System | HERO | https://www.fuer-gruender.de/wissen/unternehmen-fuehren/buchhaltung/handwerker-software-vergleich/hero-test/ (Dritt) | Historie + Notizen je Kunde/Auftrag; E-Mail-Vorlagen | klein (Historie) / groß (echter Versand) |
| CSV-Import von Kundendaten (Team-Tarif) | ToolTime | https://www.ki-syndikat.de/tools/tooltime/ (Dritt) | Kundenimport nur ab Team-Tarif | mittel |
| Kundenstamm + Projektchats + Aufgaben + Zeiterfassung (Paket Büro Plus 49,90 €/Nutzer/Mon., Büro 29,90 € ohne Angebot/Rechnung) | Craftnote | https://omr.com/de/reviews/product/craftnote/pricing (Dritt) | Chat je Projekt als zentraler Einstieg | groß (Chat) |
| Duplikate zusammenführen/entfernen ("Ressourcenverwaltung") | Pipedrive (CRM-UX) | https://www.pipedrive.com/de/features | Merge-Dialog für Personen/Organisationen | mittel |
| Pipeline-Ansicht, Aktivitäts-Tracking, Fokusansicht Tagesplanung, Aufgabenautomation, Ein-Klick-Freigabe von CRM-Updates | Pipedrive (CRM-UX) | https://www.pipedrive.com/de/features | Anpassbare Pipelines (Kanban), Aktivitäten planen, KI-Vorschläge werden mit einem Klick freigegeben | mittel (Kanban) |
| Angebotseditor: Standard-, Alternativ-, Optional- und Freitextpositionen; Alternativen/Optionen nicht in Summe | Lexware Office | https://www.lexware.de/funktionen/angebote-schreiben/ ; https://help.lexware.de/de-form/articles/547989-optionale-und-alternative-positionen-in-angeboten-nutzen | Kreissymbol OPTIONAL unter Positionen; Alternative über Positionsnummer der Hauptposition | mittel |
| Angebote/Layout-Vorlagen mit Logo, Designer, Druckvorschau, eigenes Briefpapier-PDF | Lexware Office | https://www.lexware.de/funktionen/angebote-schreiben/ | Layout-Designer mit Vorschau | mittel |
| Gespeicherte Defaults (Zahlungsbedingungen, Rabatt, Skonto, AGB) werden in neue Angebote vorbefüllt; automatische MwSt/Rabatt-Berechnung | Lexware Office | https://www.lexware.de/funktionen/angebote-schreiben/ | Einstellungen einmal, dann Autofill | klein |
| Gesamtrabatt pauschal oder prozentual auf Rechnung | Lexware Office | https://www.lexware.de/funktionen/ | Rabattzeile unter Positionen | klein |
| Angebote mit Vorlagen, Preislisten für Leistungen/Material, DATANORM, GAEB-Ausschreibung | HERO | https://www.fuer-gruender.de/wissen/unternehmen-fuehren/buchhaltung/handwerker-software-vergleich/hero-test/ (Dritt) | Leistungs-/Materialkatalog im Angebot | mittel (Katalog) / groß (DATANORM/GAEB) |
| Eigener Material-/Leistungskatalog, Großhändler-Anbindung, Datanorm/IDS-Import; Termin direkt aus Angebot erstellen | ToolTime | https://www.tooltime.app/ ; https://www.ki-syndikat.de/tools/tooltime/ | Angebot -> Termin im Baustellenplaner | mittel |
| Textbausteine, Zwischensummen, Titel/Gruppierung, Versionierung | – | nicht belegt (Lexware-Funktionsseite nennt sie ausdrücklich nicht; HERO-Test nennt keine Textbausteine; openHandwerk-Seite erwähnt sie nicht) | – | – |
| Angebot per Link (Kundencenter): Link wird in Lexware-Mails automatisch eingebunden, zufällig generierter Link, Autorisierung per PLZ, smartphone-optimiert, DE/EN, kein Zusatzpreis | Lexware Office | https://www.lexware.de/funktionen/kundencenter/ ; https://help.lexware.de/de-form/articles/548071-neues-kundencenter-interaktive-ausgangsbelege-per-link-bereitstellen | Beleg freigeben -> Kunde öffnet ohne Registrierung | mittel (UI) / groß (echter Link-Zugriff, Server) |
| Online-Annahme per Klick (ab Tarif "M"); Auswahl der Alternative, Bestätigung optionaler Positionen; bereinigte Version wird erzeugt | Lexware Office | https://www.lexware.de/funktionen/kundencenter/ | Kunde wählt Variante -> Annahme -> Mail an Anbieter | mittel (Frontend-Simulation) / groß (echt) |
| Status Offen -> Angenommen automatisch + Bestätigungsmail als Nachweis; Hinweis auf Widerrufsbelehrung | Lexware Office | (Suchzusammenfassung zu) https://help.lexware.de/de-form/articles/548071-neues-kundencenter-interaktive-ausgangsbelege-per-link-bereitstellen | Statuswechsel + Nachweis-Mail | klein (Status) / groß (Mail) |
| Weiterführen-Dialog: Angebot -> Auftragsbestätigung/Lieferschein/Rechnung; Auswahl der optionalen/alternativen Positionen, danach irreversibel; Empfehlung, Original-PDF vorher per Mail zu archivieren | Lexware Office | https://help.lexware.de/de-form/articles/547989-optionale-und-alternative-positionen-in-angeboten-nutzen | "Auswahl übernehmen"; Angebot bleibt erhalten | mittel |
| Auftragsbestätigung aus Angebot | Lexware Office, sevdesk, HERO | https://www.lexware.de/funktionen/auftragsbestaetigung-schreiben/ ; https://sevdesk.de/funktionen ; HERO-Test (Dritt) | Ein-Klick-Folgebeleg | klein |
| Angebot per E-Mail, Post oder PDF; E-Mail-Versand ohne Drittanbieter | Lexware, sevdesk, Billomat | https://www.lexware.de/funktionen/angebote-schreiben/ ; https://sevdesk.de/funktionen ; https://trusted.de/billomat (Dritt) | Versand-Dialog mit Vorlage | klein (Dialog) / groß (SMTP) |
| Erinnerung an offene Angebote / "angesehen"-Status | – | nicht belegt (Lexware-Kundencenter-Seite nennt keine Erinnerung; nur Statusübersicht "offen") | – | – |
| Digitale Unterschrift im Angebot | – | nicht belegt für Angebote (Lexware: Klick-Annahme, keine Unterschrift) | – | – |
| Digitale Unterschrift (Stundennachweise, Regieberichte, Abnahmeprotokolle) vor Ort | openHandwerk, Craftnote, HERO | https://www.ki-syndikat.de/tools/openhandwerk/ ; https://www.ki-syndikat.de/tools/craftnote/ ; HERO-Test (Dritt) | Kunde unterschreibt auf Smartphone/Tablet; Dokument sofort im Büro | mittel (Canvas-Signatur lokal) |
| Rechnungen: Abschlags-, Teil-, Storno-, Gutschrift, Reverse-Charge, Lieferschein, Rabatt/Skonto | HERO | https://www.fuer-gruender.de/wissen/unternehmen-fuehren/buchhaltung/handwerker-software-vergleich/hero-test/ (Dritt) | Rechnung aus Angebot/Auftrag | mittel |
| Rechnung aus Auftrag per Befehl; Mensch prüft und gibt frei | HERO | https://www.hero-software.de/ | "Du prüfst und gibst frei" | mittel |
| Serienrechnungen (monatlich/quartalsweise/jährlich), automatische Erzeugung + Erinnerung | Lexware Office, sevdesk | https://www.lexware.de/funktionen/ ; https://sevdesk.de/funktionen | Rechnung als Vorlage, Intervall wählen | mittel (Logik lokal), groß (Autoversand) |
| Wiederholungsrechnung als Option in Rechnungsmaske | Zervant | https://www.experte.de/buchhaltung/zervant (Dritt) | Checkbox in Maske | klein |
| Abo-Rechnung (Vorlage einmal, Folgerechnungen automatisch); Mahnwesen erst im Tarif "Business" | Billomat | https://trusted.de/billomat ; https://trusted.de/billomat-kosten (Dritt) | – | mittel |
| Wiederkehrende Rechnungen ab Pro-Tarif (27 €/Mon.), automatisches Mahnwesen Add-on/Premium | Fastbill | https://www.experte.de/buchhaltung/fastbill ; https://www.fuer-gruender.de/wissen/unternehmen-fuehren/buchhaltung/buchhaltungsprogramm/buchhaltungssoftware-vergleich/fastbill-test/ (Dritt, widersprüchlich) | – | mittel |
| Mahnwesen: aus offener Rechnung per Klick Zahlungserinnerung/Mahnung; editierbare Vorschläge, eigene Texte, Mahnstufen-Anzeige | Lexware Office | https://www.lexware.de/funktionen/offene-posten-liste/ ; https://www.lexware.de/funktionen/ | Offene-Posten-Liste markiert Überfälliges, Textvorschlag | mittel |
| Interne Mahnstufen, Zahlungserinnerungen aus Software | sevdesk | https://sevdesk.de/funktionen | Mahnlauf mit Stufen | mittel |
| Mahnlauf (HERO Wallet), Mahnwesen nicht im Select-Tarif | HERO | https://www.hero-software.de/ ; fuer-gruender.de HERO-Test (Dritt) | Sammel-Mahnlauf | mittel |
| Zahlungsabgleich per Bankanbindung (Multibanking): Zuordnungsvorschläge, OP automatisch aus Rechnungen und Zahlungseingängen | Lexware Office | https://www.lexware.de/funktionen/offene-posten-liste/ ; https://www.lexware.de/funktionen/ | Vorschläge bestätigen | mittel (Mock/CSV), groß (Bank-API) |
| Online-Banking >4.000 Banken, automatische Verbuchung | sevdesk | https://sevdesk.de/funktionen (Hersteller-Angabe) | – | groß |
| Virtuelle IBAN je Kunde, automatische Zuordnung; HERO Wallet (Rechnungsabgleich, offene Posten) | HERO | https://www.hero-software.de/ (Wallet bestätigt); virtuelle IBAN nur Dritt: https://www.softguide.de/programm/hero | Zahlungseingang trifft eindeutig auf Rechnung | groß |
| ToolTime Pay: Zahlung über App ab 1 % Gebühr | ToolTime | https://www.ki-syndikat.de/tools/tooltime/ (Dritt) | Payment-Link/Karte | groß |
| E-Rechnung XRechnung/ZUGFeRD erstellen; empfangen und Daten extrahieren | sevdesk, ToolTime, HERO | https://sevdesk.de/funktionen ; https://www.tooltime.app/ ; HERO-Test (Dritt) | Format wählen, validieren | groß (XML korrekt erzeugen); mittel mit Bibliothek |
| XRechnung + digitaler Rechnungseingang (bis 20 Absenderadressen per Mail) | Lexware Office | https://www.lexware.de/funktionen/ | Eingangsrechnungen landen automatisch im Postfach der Software | groß (Mail-Inbound) |
| DATEV-Export (Buchungsdaten, Kontenrahmen, Berater-/Mandantennr.) + CSV/PDF/TXT; Steuerberater-Zugang | Lexware Office | https://www.lexware.de/funktionen/ | Export-Dialog | mittel |
| DATEV-Schnittstelle als Add-on 19 €/Mon. | ToolTime | https://www.ki-syndikat.de/tools/tooltime/ (Dritt) | – | mittel |
| Benutzer & Berechtigungen, Steuerberater-Zugang | Lexware Office, sevdesk | https://www.lexware.de/funktionen/ ; https://sevdesk.de/funktionen | Rollen je Nutzer | mittel |
| Aufgaben mit Fälligkeit und optionaler Erinnerung; am Kontakt oder aus Angebot/Rechnung heraus; Filter "Alle offen/Erledigt"; Dashboard-Hinweis; App-Erinnerung + Kalenderverknüpfung; Shift+Enter für Zeilenumbruch | Lexware Office | https://help.lexware.de/de-form/articles/11002099-wie-kann-ich-aufgaben-erinnerungen-erstellen | Aufgabe in Kontakthistorie anlegen | klein |
| Aufgaben mit Erinnerung, verknüpft mit Dokumenten/Kontakten, To-do-Liste im Dashboard | sevdesk | https://sevdesk.de/funktionen | Wiedervorlage | klein |
| Projekt-/Auftragsplanung, Aufgaben, Aufmaß, Fotodoku, Projektmappe, Dateianhänge | HERO | https://www.fuer-gruender.de/wissen/unternehmen-fuehren/buchhaltung/handwerker-software-vergleich/hero-test/ (Dritt) | Auftragsakte | mittel |
| Kalender/Plantafel (in allen Tarifen), Baustellenplaner, Termine Echtzeit für Mitarbeiter | openHandwerk, ToolTime | https://www.ki-syndikat.de/tools/openhandwerk/ ; https://www.tooltime.app/ | Aufträge per Drag&Drop auf Mitarbeiter | mittel-groß |
| HERO Copilot (14 Automatisierungen, OS Plus), HERO Command (Termin/Angebot/Rechnung per Eingabe) | HERO | https://www.hero-software.de/ ; fuer-gruender.de HERO-Test (Dritt) | KI erstellt Entwurf, Nutzer gibt frei | groß |
| Dashboard-Hinweis offener Aufgaben, Offene-Posten-Übersicht | Lexware Office | https://help.lexware.de/de-form/articles/11002099-wie-kann-ich-aufgaben-erinnerungen-erstellen ; https://www.lexware.de/funktionen/offene-posten-liste/ | – | klein |
| Aktivitätsprotokoll, globale Suche/Befehlspalette, Tastaturkürzel | – | nicht belegt (Lexware-Funktionsseite: Aufgaben/Suche nicht enthalten) | – | – |
| Onboarding: 30 Tage Test (Lexware), 14 Tage ohne Kreditkarte (Billomat), 7 Tage (ToolTime), 1 h Online-Training im Max-Tarif | Lexware, Billomat, ToolTime | https://www.lexware.de/funktionen/kundencenter/ ; https://www.billomat.com/ ; https://www.ki-syndikat.de/tools/tooltime/ | Nur Testphasen belegt, keine UI-Onboarding-Flows | – |

Preisanker (für Positionierung, Stand Oktober 2026): ToolTime Solo 79 €/Team 149 €/Max 299 € im Jahresabo (https://www.ki-syndikat.de/tools/tooltime/); HERO Select ab 59 €, OS ab 109 €, OS Plus ab 289 € (1 Mitarbeiter, Jahresabo; Drittquelle, intern widersprüchlich) (https://www.fuer-gruender.de/wissen/unternehmen-fuehren/buchhaltung/handwerker-software-vergleich/hero-test/); openHandwerk 20–60 € je Nutzer/Mon. (https://www.ki-syndikat.de/tools/openhandwerk/); Craftnote 14,90–49,90 € je Nutzer (https://omr.com/de/reviews/product/craftnote/pricing).

### Inferences
- Für Reinigungsbetriebe sind Serienrechnungen und Offene-Posten/Mahnwesen wichtiger als Material-/Datanorm-Funktionen; Wiederkehr passt zu Daueraufträgen (Unterhaltsreinigung).
- Lücken im Markt (nicht belegt bei den untersuchten Produkten): Angebots-Erinnerung/Nachfass-Automatik, "angesehen"-Tracking, Versionierung, Zwischensummen/Titel, Tags, Duplikatswarnung im Kundenstamm, Befehlspalette. Das sind Differenzierungschancen, aber auch Hinweis, dass die Seiten sie nicht prominent bewerben.
- Funktionen wie Auftragsbestätigung, Optionspositionen und Weiterführen-Dialog sind rein logische Datenmodelle und gut im Frontend darstellbar.

### Gaps
- Keine Hilfe-Center-Artikel zu HERO, ToolTime, Craftnote, Billomat, Fastbill, Zervant, Openhandwerk-Herstellerseite gefunden bzw. abrufbar (Billomat 404 bei Funktionsseite); deren Features nur über Drittportale belegt.
- Craftnote-Herstellerseite (craftnote.com/de) lieferte keine abrufbaren Funktionsdetails.
- Lexware-Kontaktseite erwähnt Ansprechpartner/Historie/Tags nur in einer nicht ausgewerteten Schlusszeile; Details unbestätigt (die Kontakthistorie existiert laut Aufgaben-Hilfeartikel).
- Lexware-Statuswechsel/Bestätigungsmail: Beleg nur über Suchzusammenfassung des Hilfeartikels, Volltext nicht separat abgerufen.
- HubSpot Starter wurde nicht per Primärquelle geprüft; Pipedrive nur auf der allgemeinen Funktionsseite.
- Keine Release-Notes ausgewertet.

## 2. Welche Workflows und UX-Muster sind besonders gut und in einer schlanken Web-App nachbaubar?

### Takeaway
Die stärksten Muster sind (a) Angebot als Link mit Klick-Annahme inkl. Optionen/Alternativen, (b) Weiterführen-Dialog Angebot -> Folgebeleg, (c) Serienrechnungen mit Erinnerung, (d) Offene-Posten-Liste mit Mahnvorschlägen, (e) Aufgaben/Wiedervorlagen an Kontakt und Beleg, (f) KI-/Automatik-Entwurf mit "prüfen und freigeben".

### Cited Findings
- Angebot per Link: Kunde braucht keine Registrierung, nur PLZ zur Autorisierung; Mobil-optimiert; Anbieter erhält Mail und kann Auftrag direkt starten — [Lexware Kundencenter](https://www.lexware.de/funktionen/kundencenter/)
- Optionspositionen: Kunde wählt keine/einzelne/alle Optionen und genau eine Alternative; nicht gewählte entfallen im Folgebeleg, Original bleibt im Angebot — [Lexware Hilfe](https://help.lexware.de/de-form/articles/547989-optionale-und-alternative-positionen-in-angeboten-nutzen)
- Serienrechnung: automatisch erzeugt, Nutzer wird erinnert (also Vorschau/Freigabe möglich) — [Lexware Funktionen](https://www.lexware.de/funktionen/)
- Mahnvorschlag: Offene-Posten-Liste zeigt überfällig/Mahnstufe, schlägt editierbaren Text vor — [Lexware OP-Liste](https://www.lexware.de/funktionen/offene-posten-liste/)
- Aufgabe aus Kontakthistorie oder aus laufendem Angebot/Rechnung heraus mit optionaler Erinnerung — [Lexware Hilfe Aufgaben](https://help.lexware.de/de-form/articles/11002099-wie-kann-ich-aufgaben-erinnerungen-erstellen)
- Entwurf-dann-Freigabe-Muster (HERO Command: "Du prüfst und gibst frei"; Pipedrive: CRM-Updates mit einem Klick freigeben) — [HERO](https://www.hero-software.de/), [Pipedrive](https://www.pipedrive.com/de/features)
- Kennzahlen direkt im Kontakt (Umsatz, offene Forderungen, Zahlungsdauer) — [Lexware Kontakte](https://www.lexware.de/funktionen/kontakte-verwalten/)
- Unterschrift auf dem Gerät für Stundennachweise/Abnahmeprotokolle, Dokument sofort im Büro — [ki-syndikat openHandwerk](https://www.ki-syndikat.de/tools/openhandwerk/)
- Termin direkt aus Angebot — [ToolTime](https://www.tooltime.app/)
- Kritik als UX-Warnung: Dokumente nur über Umwege auffindbar (Lieferschein erst über Rechnung) — [Capterra/Suchzusammenfassung ToolTime](https://www.capterra.com.de/software/178945/tooltime) (Dritt)
- Rechtlicher Hinweis: bei Klick-Annahme ggf. Widerrufsbelehrung nötig — [Lexware Hilfe Kundencenter](https://help.lexware.de/de-form/articles/548071-neues-kundencenter-interaktive-ausgangsbelege-per-link-bereitstellen)

### Inferences
- Empfohlene Top-Muster für einen Reinigungs-Prototyp: Angebot mit Optionen (z. B. Fensterreinigung optional, Alternative: wöchentlich/14-täglich) + Annahme-Seite; Serienrechnung für Dauerauftrag; OP-Liste mit Mahnvorschlag; Aufgabe/Wiedervorlage an Kunde/Angebot; Belege jederzeit vom Kunden aus erreichbar (Kundenakte als Zeitachse).
- Das Muster "Entwurf -> prüfen -> freigeben" lässt sich auch ohne KI für Serienrechnungen und Mahnungen nutzen.

### Gaps
- Keine Primärdemos/YouTube-Beschreibungen ausgewertet; UX-Details (Tastaturkürzel, Befehlspalette) nicht belegt.

## 3. Welche Funktionen brauchen Backend/Dienste, welche gehen im Frontend-Prototyp?

### Takeaway
Alles, was Außenkommunikation oder externe Datenquellen braucht (E-Mail-Versand/-Empfang, Bank, Zahlung, echter Kundenlink), braucht Backend; Datenmodell, Editoren, Status, Berechnungen, Regeln und Exportdateien gehen clientseitig.

### Cited Findings
- Backend/Dienste zwingend: Kundenlink mit Zugriffsschutz (zufälliger Link, PLZ-Autorisierung) und Bestätigungsmail an Anbieter — [Lexware Kundencenter](https://www.lexware.de/funktionen/kundencenter/); Bankanbindung/Multibanking — [Lexware OP-Liste](https://www.lexware.de/funktionen/offene-posten-liste/); Online-Banking über >4.000 Banken — [sevdesk](https://sevdesk.de/funktionen); virtuelle IBAN/Zahlungsannahme — [HERO-Test](https://www.fuer-gruender.de/wissen/unternehmen-fuehren/buchhaltung/handwerker-software-vergleich/hero-test/); ToolTime Pay — [ki-syndikat](https://www.ki-syndikat.de/tools/tooltime/); E-Mail-Posteingang für Eingangsrechnungen — [Lexware Funktionen](https://www.lexware.de/funktionen/); automatischer Mahnversand — [Billomat/Fastbill Dritt](https://trusted.de/billomat-kosten).
- Frontend-fähig (reine Daten/Logik, Export als Datei): Kundenstamm, CSV-Import/Export — [Lexware Import-Hilfe](https://help.lexware.de/de-form/articles/548267-anleitung-zum-import-von-kontakten-kunden-und-lieferanten); Positions-/Rabatt-/MwSt-Berechnung — [Lexware Angebot](https://www.lexware.de/funktionen/angebote-schreiben/); Aufgaben/Erinnerungen im Dashboard — [Lexware Hilfe](https://help.lexware.de/de-form/articles/11002099-wie-kann-ich-aufgaben-erinnerungen-erstellen); DATEV/CSV/PDF-Export als Download — [Lexware Funktionen](https://www.lexware.de/funktionen/); Serienrechnungs-Regeln.

### Inferences
- Prototyp ohne Backend: Kundenlink-Ansicht als eigene Route mit Demo-Daten simulieren (Annahme-Button schreibt Status in lokalen Speicher); Bankabgleich per CSV-Kontoauszug-Import mit Zuordnungsvorschlag (Betrag/Rechnungsnr.-Matching) statt Bank-API; Mail-Versand als "mailto:"/PDF-Download oder Platzhalter; Erinnerungen als In-App-Fälligkeiten.
- E-Rechnung (XRechnung/ZUGFeRD) technisch clientseitig machbar (XML/PDF-A3-Erzeugung per Bibliothek), aber Validierung/Rechtssicherheit aufwändig – als "groß".
- Wahrscheinliche Reihenfolge nach Nutzen/Aufwand: Optionspositionen, Weiterführen-Dialog, Aufgaben/Wiedervorlage, OP-Liste + Mahnstufen, Serienrechnung, Annahme-Seite (simuliert), CSV-Bankabgleich, DATEV-/CSV-Export.

### Gaps
- Konkrete technische Anforderungen (z. B. DATEV-Formatspezifikation, FinTS/PSD2-Dienstleister) nicht recherchiert.
- Aufwandsschätzungen sind Einschätzungen, nicht belegt.
