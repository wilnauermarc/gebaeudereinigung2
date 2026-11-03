# Featurekatalog deutsche Reinigungssoftware: Mendato, PlanD, zvoove (fortytools / KleanApp / CleanManager), Dynvon, CleanMG (Stand Nov. 2026)

Methodik: Herstellerseiten, Hilfecenter (Intercom-Collections), Changelogs per WebFetch (Zusammenfassung durch Fetch-Modell, Unschärfe möglich). Bei Hilfecenter-Collections sind nur Artikeltitel gelesen worden (Titel = Beleg für Existenz der Funktion, nicht für Details); Volltexte nur dort, wo ausdrücklich "Volltext" steht. "Nicht gefunden" ≠ "nicht vorhanden". Frühere Recherche (konkurrenz_detail_de.md) nicht wiederholt, sondern vertieft.

Wichtige Einordnung zu zvoove: zvoove Group (Zeitarbeits-/Reinigungssoftware) besitzt für Gebäudereinigung drei Produkte: **fortytools by zvoove** (Browser-Suite, kleine/mittlere Betriebe), **KleanApp** (2025 übernommen; Raumbuch/QM/LV, größere Betriebe) und **CleanManager** (dänischer Ursprung). Es gibt kein eigenständiges "zvoove Gebäudedienste"-Produkt mit eigener Funktionsseite; zvoove.com/de/clean nennt keine Einzelfunktionen ([zvoove.com](https://www.zvoove.com/de/clean)). Die Übernahme von fortytools (Jan. 2023) ist belegt ([tech.eu](https://tech.eu/2023/01/16/cleaning-service-startup)); die KleanApp-Übernahme laut Suchtreffern ([PR Newswire](https://prnewswire.com/de/pressemitteilungen/zvoove-group-ubernimmt-kleanapp-302728607.html), [Staffing Industry](https://www.staffingindustry.com/news/global-daily-news/zvoove-acquires-german-cleaning-software-firm-kleanapp), Seiten direkt nicht abrufbar, 403).

---

## 1. Stammdaten (Kunde, Objekt, Raumbuch, LV, Reinigungsplan)

### Takeaway
Mendato hat die am besten belegte Raumbuch-/LV-Kette (Raumtypen, Bodenbeläge, Leistungswerte, KI-Grundrisserkennung, LV-KI-Import, LV-Editor). KleanApp (zvoove) ist stark bei Raumbuch-Excel-Import, LV-gebundener Qualitätskontrolle und Fachmodulen. PlanD ist stärker Dienstplan/Lohn-orientiert, mit digitaler Objektmappe, aber ohne belegtes Raumbuch. CleanMG ist schlank (Kunde/Objekt/Mitarbeiter), ohne Raumbuch.

### Cited Findings (Tabelle: Feature | Produkt | Beleg-URL | Workflow-Kurzbeschreibung)

| Feature | Produkt | Beleg-URL | Workflow-Kurzbeschreibung |
|---|---|---|---|
| Grundriss hochladen, Räume per KI erkennen | Mendato | [Hilfe-Artikel (Titel)](https://help.mendato.com/de/articles/17312703-grundrisse-hochladen-und-raume-mit-ki-erkennen); [Startseite](https://www.mendato.com/) | Grundriss hochladen, KI erkennt Räume, diese werden dem Objekt zugeordnet; darauf baut Kalkulation auf. |
| Raumplanung: Raumtypen, Bodenbeläge, Leistungswerte (Katalog) | Mendato | [Hilfe (Titel)](https://help.mendato.com/de/articles/15923510-raumplanung-raumtypen-bodenbelage-und-leistungswerte-pflegen) | Katalog aus Raumtyp/Bodenbelag/Leistungswert (m²/h); dient als Vorbelegung im Raumbuch. |
| Raumbuch im Auftrag mit Stundenberechnung | Mendato | [Hilfe, Volltext gelesen](https://help.mendato.com/de/articles/15923514-raumbuch-reinigungsflachen-und-personenstunden-kalkulieren) | Tab "Raumbuch" im Auftrag; je Leistung eigene Tabelle; Räume hinzufügen; Leistungswert (m²/h, auftragsspezifisch überschreibbar) und Reinigungshäufigkeit/Woche (auch 0,5) ergeben h/Reinigung, h/Woche, h/Monat; optional Monatsziel-Stunden mit roter Warnung bei Überschreitung; Druckfassung je Leistung für Angebot/Vertrag; "Aus Raumbuch übernehmen" für Aufgabe-Raum-Zuordnung. |
| Räume anlegen/verwalten, Objekttypen, Schlüsselverwaltung je Objekt | Mendato | [Stammdaten-Collection](https://help.mendato.com/de/collections/19690889-stammdaten-objekte) | Räume/Objekttypen/Schlüssel als Stammdaten am Objekt. |
| Materialverwaltung (Gruppen, Lieferanten, Zuordnung zu Auftrag/Einsatz, Verbrauch) | Mendato | [Stammdaten-Collection](https://help.mendato.com/de/collections/19690889-stammdaten-objekte) | Material wird Aufträgen/Einsätzen zugeordnet und Verbrauch erfasst (nur Titel). |
| Datenimporte (Übersicht, Aufträge importieren) | Mendato | [Stammdaten-Collection](https://help.mendato.com/de/collections/19690889-stammdaten-objekte) | Importer für Stammdaten/Aufträge. |
| LV-Editor (Leistungen, Räume, Aufgaben) + Altes LV mit KI importieren | Mendato | [Vertrieb-Collection](https://help.mendato.com/de/collections/19734500-vertrieb-angebote); [Modul LV](https://www.mendato.com/modul/leistungsverzeichnis) | PDF/Foto des LV einlesen, daraus Schichten mit Aufgaben und Checklisten, die in der App erscheinen; Fotos als Kundennachweis. |
| LV-Übersicht (Aufgaben, Intervalle, Wochentage), Ausführungszeitfenster, Aufgabenvorlagen je Leistung, "Ausführung auf Nachfrage" | Mendato | [Aufträge&Planung-Collection](https://help.mendato.com/de/collections/9242052-auftrage-planung) | Aufgaben je Leistung als Vorlage vorbereiten und in Aufträge übernehmen; Zeitfenster und bedarfsgesteuerte Leistungen (nur Titel). |
| Interessenten (CRM-light) anlegen, in Kunden umwandeln | Mendato | [Vertrieb-Collection](https://help.mendato.com/de/collections/19734500-vertrieb-angebote) | Interessent -> Kalkulation -> Angebot -> Umwandlung in Kunde/Auftrag. |
| Mitarbeiterdateien mit Kategorien und Ablaufdaten; Objektleiter/Vorgesetzte zuordnen | Mendato | [Personal-Collection](https://help.mendato.com/de/collections/19690891-personal-abwesenheiten) | Dokumente je Mitarbeiter mit Ablaufdatum (nur Titel). |
| Raumbuch mit Objekt/Gebäude/Ebene/Nutzungsart, Excel-Import | KleanApp (zvoove) | [kleanapp.net](https://www.kleanapp.net/) | Raumbuch per Excel einlesen, an Anforderungen anpassbar. |
| Komplexe Leistungsverzeichnisse, Reinigungsdokumentation gemäß LV; LV in Qualitätskontrolle einbindbar | KleanApp | [Funktionsseite](https://www.kleanapp.net/de/Home/Functions) | Kontrollobjekte nach Nutzungsart/Raumgruppe festlegen oder LV vollständig einbinden. |
| Kunden-, Objekt-, Vertrags-, Mitarbeiterverwaltung, Steuerberater-Zugang | fortytools by zvoove | [fortytools.com](https://www.fortytools.com/) | Objekte direkt mit Kundenverwaltung/CRM verknüpft. |
| Reinigungspläne, Lagerverwaltung (Basismodul), Datenimport aus Buchhaltung | CleanManager (zvoove) | [cleanmanager.com](https://cleanmanager.com/) | Basismodul: Planung, Reinigungspläne, Lager, Kundenportal; Raumbuch dort nicht erwähnt. |
| Digitale Objektmappe (Fotos, Dokumente, Tickets mobil), Dokumentenverwaltung, Stammdaten | PlanD | [Funktionsübersicht](https://pland.app/funktionen/uebersicht) | Objektinfos jederzeit mobil verfügbar. |
| Kunden-/Objekt-/Mitarbeiter-/Vertragsverwaltung an einer Stelle | Dynvon | [dynvon.com/reinigung/software](https://www.dynvon.com/reinigung/software) | Objekte, Auftraggeber, Verträge, Ansprechpartner zentral. |
| Kunde, Objekt (Soll-Ist-Stunden, Besetzung, Turnus, Status), Mitarbeiter (Reinigungskraft/Objektleiter/Subunternehmer, Stundenlohn, Arbeitszeitmodell) | CleanMG | [cleanmg.de](https://www.cleanmg.de/) | Setup in 3 Schritten: Firma anlegen, Team anlegen, Betrieb starten. |

### Inferences
- Raumbuch + Leistungswerte + KI-Import ist bei Mendato am tiefsten dokumentiert; für KleanApp sind Raumbuch/LV belegt, aber Leistungswert-Kalkulation nicht.
- Bei PlanD fehlt ein Raumbuch auf allen gelesenen Seiten (Hilfe-Titel enthalten keines) - wahrscheinlich nicht vorhanden, aber nicht bewiesen.

### Gaps
- Volltexte der meisten Hilfe-Artikel (nur Titel) nicht gelesen; Mendato-Hilfecenter hat 232 Artikel, PlanD-Dashboard 79.
- Dynvon: keine Raumbuch-Aussage gefunden.

---

## 2. Kalkulation / Angebot

### Takeaway
Mendato: Kalkulations-Editor mit Stundenlohn, Zuschlägen und Monatslimit, direkt zu Angebot und Auftrag. KleanApp: Angebote aus Textbausteinen. Dynvon: Angebot aus Objektkalkulation plus kostenloser öffentlicher Kalkulationsrechner (Tarifwerte 2026). PlanD: Angebote per Klick mit automatischer Abrechnung nach Annahme, aber keine Raumbuch-Kalkulation belegt.

### Cited Findings

| Feature | Produkt | Beleg-URL | Workflow |
|---|---|---|---|
| Kalkulations-Editor, Kalkulations-Einstellungen (Stundenlohn, Zuschläge, Monatslimit) | Mendato | [Vertrieb-Collection](https://help.mendato.com/de/collections/19734500-vertrieb-angebote) | Kalkulation erstellen (Schritt-für-Schritt), Parameter pflegen. |
| Auftrag bzw. Angebot direkt aus Kalkulation erzeugen | Mendato | [Vertrieb-Collection](https://help.mendato.com/de/collections/19734500-vertrieb-angebote) | Kalkulation -> Angebot oder Auftrag in einem Schritt; Schichten gehen anschließend an die App ([Startseite](https://www.mendato.com/)). |
| Digitales Angebot, Versand, Angebot -> Rechnung | Mendato | [Vertrieb-Collection](https://help.mendato.com/de/collections/19734500-vertrieb-angebote), [Rechnungen-Collection](https://help.mendato.com/de/collections/7382229-rechnungen-buchhaltung) | Angebot versenden, später Rechnung aus Angebot erstellen. |
| Kalkulation (Grundriss + LV hochladen, Personenstunden pro Monat, Angebot) | Mendato (ab Starter) | [mendato.com](https://www.mendato.com/) | Räume aus Grundriss, Aufgaben aus LV, Personenstunden/Monat -> Angebot. |
| Angebote aus Textbausteinen (Einmalauftrag, Monatspauschale, Abrechnung nach Arbeitsschein); Sonderleistungen per Unterschrift | KleanApp | [Funktionsseite](https://www.kleanapp.net/de/Home/Functions) | Textbausteine kombinieren; nicht beauftragte Sonderleistungen vor Ort erfassen und unterschreiben lassen. |
| Angebote mit Briefpapier-Vorlage; Rechnungen für Einmal- und Dauerleistungen; Abschlag/Schlussrechnung | fortytools | [fortytools.com](https://www.fortytools.com/) | Angebot -> Arbeitsschein -> Rechnung. |
| Angebote per Klick, Bestätigung durch Kunden, danach automatische Abrechnung; Deckungsbeitrag je Auftrag | PlanD | [Funktionsübersicht](https://pland.app/funktionen/uebersicht), [pland.app](https://pland.app/) | Angebot digital senden; nach Annahme automatisch abgerechnet. Changelog: AGB-Anhang an alle Angebote (15.10.2026), Auftragsbestätigung aus Angebot (25.08.2026), [Changelog](https://www.fortytools.com/changelog) - NB: das ist der fortytools-Changelog, nicht PlanD (Zuordnung siehe Gaps). |
| Aus Objektkalkulation entsteht das Angebot, Status je Angebot; Kalkulationsrechner + Angebotsvorlage als Ressourcen | Dynvon | [dynvon.com/reinigung/software](https://www.dynvon.com/reinigung/software) | Objektkalkulation -> Angebot -> Statusführung. |
| Online-Kalkulationsrechner: Lohngruppe (LG 1-9 ohne 5, Tarif 2026), LNK ~25 %, Ausfallkosten ~27 %, Gemeinkosten, Marge 15 %, Leistungswert m²/h -> Stundenverrechnungssatz (Beispiel 26,81 €/h), €/m²/Monat (Beispiel 2,67 €) | Dynvon | [Kalkulationsrechner](https://www.dynvon.com/reinigung/kalkulationsrechner) | 3 Schritte: Verrechnungssatz, Preis/m², Monatspreis Objekt (Wochenfrequenz × 4,33). Hinweis: Tarifwerte laufen laut Seite zum 31.12.2026 aus. |
| Angebotskalkulation (Zusatzmodul), Fakturakalkulation, Lohnkalkulation | CleanManager | [cleanmanager.com](https://cleanmanager.com/) | Angebotsdokumente + Preiskalkulation als Zusatzmodul. |
| Angebote | CleanMG | - | Nicht auf der Seite genannt (nur Rechnungen). |

### Inferences
- Mendato ist der einzige Anbieter dieses Sets mit belegter Kalkulation aus Raumbuch + Leistungswerten; Dynvon bietet nur einen öffentlichen Rechner/Angebotsmodul.

### Gaps
- Kalkulation bei PlanD (Leistungswerte) nicht belegt. Angebotsvorlagen/Textbausteine bei Mendato nicht im Detail gelesen.
- Die Changelog-Einträge zu Angeboten stammen von fortytools.com/changelog (diese Seite ist die fortytools-Software, nicht PlanD); ich habe sie hier fälschlich in der PlanD-Zeile erwähnt - bitte als fortytools-Feature lesen.

---

## 3. Einsatz- und Personalplanung

### Takeaway
Mendato: Dienstplan mit Verfügbarkeiten, Abwesenheitskalender, Zeitkonto, "Einsätze ohne Ausführer", Ausfall-Markierung mit sofortiger Umplanung. PlanD: Planungsassistent (wer hat Zeit/ist in der Nähe), Routen/Tourenplanung, Vertretung, Urlaubsanspruchsberechnung. KleanApp: Drag&Drop mit Max-Arbeitszeit-Regeln und KI-Konfliktanalyse. Schichttausch wurde bei keinem Anbieter belegt.

### Cited Findings

| Feature | Produkt | Beleg-URL | Workflow |
|---|---|---|---|
| Drag&Drop-Einsatzplanung, Dienstplan sofort aufs Handy | Mendato | [mendato.com](https://www.mendato.com/) | Plan ändern -> Mitarbeiter sehen es sofort. |
| Verfügbarkeit von Mitarbeitern / Verfügbarkeit feststellen | Mendato | [Personal-Collection](https://help.mendato.com/de/collections/19690891-personal-abwesenheiten) | Verfügbarkeit pflegen und bei Planung prüfen (nur Titel). |
| Abwesenheit erstellen/genehmigen/ablehnen, Abwesenheitskalender, "Welche Einsätze sind betroffen?", Urlaubskonto | Mendato | [Personal-Collection](https://help.mendato.com/de/collections/19690891-personal-abwesenheiten) | Abwesenheit zeigt betroffene Einsätze, dann Umplanung (nur Titel). |
| Einsätze ohne Ausführer; Mitarbeiter als Ausfall kennzeichnen; Einsatz verschieben | Mendato | [Aufträge&Planung](https://help.mendato.com/de/collections/9242052-auftrage-planung) | Ausfall markieren -> offene Einsätze werden sichtbar -> neu besetzen (aus Titeln abgeleitet). |
| Zeitkonto Überstunden/Minusstunden (pro Arbeitszeitmodell aktivierbar, Transaktionsliste, manuelle Buchung, Feiertags-/Abwesenheitslogik, Freizeitausgleich) | Mendato | [Hilfe, Volltext](https://help.mendato.com/de/articles/11509029-zeitkonto-fur-uberstunden-und-minusstunden) | Soll/Ist-Differenz wird automatisch (nach Pausenabzug) gebucht; Auszahlung als negative Manualbuchung, Abbau über Freizeitausgleich-Abwesenheit. Einschränkung: manuelle Buchungen noch nicht im Lohn-Export. |
| Einsatzplanung mit Echtzeit-Push, Abwesenheiten/Vertretungen (Vertretung nach Qualifikation) | PlanD | [pland.app](https://pland.app/) | - |
| Planungsassistent (wer hat Zeit, wer ist in der Nähe); digitaler Urlaubsantrag mit Benachrichtigung; Abwesenheitsverwaltung in einem Kalender | PlanD | [Funktionsübersicht](https://pland.app/funktionen/uebersicht) | - |
| Routen/Tourenplanung (Routenvorlage -> Drag&Drop auf Mitarbeiter/Tag; Endzeit aus Gesamtdauer; in App Stopp für Stopp wischen; Umplanung bei Abwesenheit über "Route zuweisen") | PlanD | [Hilfe, Volltext](https://help.pland.app/de/articles/653765-routen-tourenplanung) | Vorlage mit Objekten + Dauern, einplanen, Änderungen nur an der konkreten Route. |
| Urlaubsanspruch-Berechnung, Resturlaub übernehmen, E-Mail-Abwesenheitsbenachrichtigung, Abwesenheiten bezahlen/umplanen, Kommentare auf Objekt/Auftrag/Einsatz, Filter, Quick-Actions, Aufträge duplizieren, Stundenkontingente | PlanD | [Dashboard-Collection](https://help.pland.app/de/collections/519060-dashboard-funktionen) | nur Titel. |
| Arbeitszeitkonto mit monatlicher Grenze, Ansparen, Auszahlung (30.09.2026); Planen nach Einsatzgruppe (14.10.2026); Vertretungen in erfassten Zeiten markiert (20.08.2026) | fortytools (Changelog) | [Changelog](https://www.fortytools.com/changelog) | - |
| Mobile Einsatzplanung (Manager-App) | PlanD | [App-Funktionen](https://help.pland.app/de/collections/495919-app-funktionen) | nur Titel. |
| Dienstplan: Start-/Endzeit, max. Tages-/Wochenarbeitszeit je Mitarbeiter, Reinigungsfenster je Objekt, Drag&Drop, Planung nach Objekt oder Benutzer | KleanApp | [Funktionsseite](https://www.kleanapp.net/de/Home/Functions) | - |
| KI-Auswertung des Dienstplans (Konflikte mit Abwesenheiten, ungleiche Verteilung) | KleanApp | [Funktionsseite](https://www.kleanapp.net/de/Home/Functions) | integriertes KI-Tool; einzeln freischaltbar, ändert keine Daten. |
| Termine & Aufgaben (automatisch aus Tickets, Kontrollen, Sollstunden; Push) | KleanApp | [Funktionsseite](https://www.kleanapp.net/de/Home/Functions) | - |
| Einsatzplanung (wiederkehrende Einsätze, Umplanung) | Dynvon | [dynvon.com/reinigung/software](https://www.dynvon.com/reinigung/software) | - |
| Planung online, Mitarbeiterverfügbarkeit, Kundenanfragen an einem Ort | CleanManager | [cleanmanager.com](https://cleanmanager.com/) | - |
| Schichtplanung Monat/Woche/Tag | CleanMG | [cleanmg.de](https://www.cleanmg.de/) | - |

### Inferences
- Konfliktwarnungen (Doppelbelegung, Arbeitszeitgesetz) sind nur bei KleanApp (KI-Tool, Plausibilität) und eingeschränkt bei Mendato (Max-/Zielstunden-Warnung im Raumbuch) belegt.

### Gaps
- Schichttausch (Mitarbeiter-initiiert) bei keinem der Anbieter gefunden. Krankmeldung per App bei keinem gefunden (Mendato: nur Admin-Seite "Mitarbeiter als Ausfall kennzeichnen").

---

## 4. Zeiterfassung

### Takeaway
Mendato nennt 6 Erfassungswege (inkl. KI-Foto-Stundenzettel, BETA, ab Pro) und eine detaillierte SFN-Zuschlagslogik nach Rahmentarif. PlanD hat Standortkontrolle, Pausen-/Fahrzeiten und Offline-Modus. KleanApp/CleanManager setzen auf Barcode/NFC. CleanMG nur Browser-Stundenzettel.

### Cited Findings

| Feature | Produkt | Beleg-URL | Workflow |
|---|---|---|---|
| 6 Wege: manuell ohne Planung, App (GPS-Nachweis), Einzel-Nachtragung, nach Planzeiten (1:1 übernehmen), Stundenzettel-Import (Excel), Stundenzettel per Foto mit KI (BETA, Pro/Pro Plus) | Mendato | [Hilfe, Volltext](https://help.mendato.com/de/articles/10901099-ubersicht-die-6-moglichkeiten-der-zeiterfassung-in-mendato) | Artikel nennt weder QR noch NFC noch Terminal. |
| SFN-Zuschläge: Nacht 30 % (22-5 Uhr), Nachtkern 30 %, Sonntag 80 %, Feiertag 80 %, Hohe Feiertage 200 %, Belastungszuschlag 25 % (>8 h/Tag oder >40 h/Woche); nur höchster Zuschlag je Zeitsegment; steuerfreie Anteile; Basis wählbar (ab Stempelzeit / ab Planbeginn / nur innerhalb Planzeit); Neuberechnung ab Datum | Mendato | [Hilfe, Volltext](https://help.mendato.com/de/articles/17613781-nacht-sonntags-und-feiertagszuschlage-berechnung-und-einstellungen) | Export der Zuschlagsstunden nach Lohnart zu DATEV/Lexware/Agenda; AT/CH mit lokalen Sätzen. |
| Pausen automatisch abziehen; Pausen nachtragen; Zeiterfassung bearbeiten/bestätigen; "Tagesgeschäft abschließen"; Sollzeit/Planzeit/Istzeit/vergütete Zeit; Vergütungsmodelle; manuelle Erfassung je Rolle sperrbar; App offline nutzbar (Frage-Artikel) | Mendato | [Zeiterfassung-Collection](https://help.mendato.com/de/collections/19690890-zeiterfassung) | nur Titel (Ausnahme: Offline-Frage als Titel belegt). |
| GPS-Check-in/-out, automatische Stundenzettel, Live-Überblick | Mendato | [mendato.com](https://www.mendato.com/) | - |
| Erfassung von Arbeitszeit, Pausen, Fahrten per App; Abgleich mit Dienstplan; Standortkontrolle (Benachrichtigung bei Erfassung außerhalb Objektradius); Zuschläge; Arbeitsscheine mit Unterschrift | PlanD | [Funktionsübersicht](https://pland.app/funktionen/uebersicht) | - |
| Offline-Modus, freie Zeiterfassung, Zeiten nachtragen, Einsatz neu starten bei versehentlichem Beenden, GPS-Einverständniserklärung als Dokument, GPS-Fehler in Zeitenfreigabe | PlanD | [App-Funktionen](https://help.pland.app/de/collections/495919-app-funktionen), [Dashboard-Collection](https://help.pland.app/de/collections/519060-dashboard-funktionen) | nur Titel. |
| Erfassung per Barcode, Telefon, Terminal; Echtzeit-Warnungen bei Nichterscheinen/Scan außerhalb des Objekts; optional GPS; Soll/Ist | KleanApp | [Funktionsseite](https://www.kleanapp.net/de/Home/Functions) | NFC-Tags laut Seite ebenfalls genannt. |
| KI-Auswertung Zeiterfassung (Pausen-/ArbZG-Auffälligkeiten) | KleanApp | [Funktionsseite](https://www.kleanapp.net/de/Home/Functions) | - |
| Stempeln per NFC-Tag am Objekt; Alarm bei Abweichung/Nichterscheinen; Offline-Fotos mit Nachupload | CleanManager | [App-Seite](https://cleanmanager.com/zusatzmodule/app-mit-zeiterfassung) | Chip scannen bei Beginn und Ende; Stunden fließen in Rechnung/Lohn. |
| Stempeln am Objekt in mehrsprachiger App, Dienstplan auf dem Handy | Dynvon | [dynvon.com/reinigung/software](https://www.dynvon.com/reinigung/software) | "Stunden stehen abends im System". |
| Online-Zeiterfassung mit eigenem Zugang, Echtzeit-Reporting; mobile App; Filter erfasste Zeiten nach Objektleiter (24.08.2026) | fortytools | [fortytools.com](https://www.fortytools.com/), [Changelog](https://www.fortytools.com/changelog) | - |
| Stundenzettel erfassen, freigeben/bestätigen, PDF-Export; fehlende Stundenzettel im Dashboard | CleanMG | [cleanmg.de](https://www.cleanmg.de/) | läuft im Browser (kein App-Install). |

### Inferences
- QR-Stempeln ist nirgends belegt (NFC/Barcode statt QR); QR existiert bei PlanD und KleanApp nur als Kunden-/Mängelmeldung (Abschnitt 5).

### Gaps
- Pausen-/Korrektur-Workflows bei PlanD, Dynvon nicht im Detail.

---

## 5. Qualität (Begehung, Checkliste, Foto, Mängel/Reklamation, Kundenfreigabe)

### Takeaway
KleanApp (zvoove) hat die tiefste QM-Kette: Zufallskontrolle nach DIN 2859-1, automatische Nacharbeitstickets bei schlechter Bewertung, QR-Mängelmeldung im WC, E-Mail-zu-Ticket. Mendato: Kundenportal + Ticket mit Foto-Reklamation und Live-Status. PlanD: Kundendashboard per Objekt-QR-Code mit Ticket + Foto. CleanManager: Kontrollvorlagen + Berichtsversand. Dynvon: Begehung mit Foto + Unterschrift, PDF-Bericht.

### Cited Findings

| Feature | Produkt | Beleg-URL | Workflow |
|---|---|---|---|
| Kundenportal-Reklamation -> automatisches Ticket -> Zuweisung/Priorisierung -> Kunde sieht Status (offen/geplant/erledigt) | Mendato (Ticket ab Starter, Portal ab Pro) | [Hilfe, Volltext](https://help.mendato.com/de/articles/11095691-digitales-reklamationsmanagement-kundenportal-ticketsystem) | Kunde meldet mit Foto im Portal; Mini-Paket zeigt nur Vorschau. |
| Kundenportal: Sichtbarkeit je Kunde steuerbar (Zeiten, Namen), unbegrenzt Kunden einladbar, Reklamationsauswertung für Quartalsgespräche, Demozugang für Vertrieb | Mendato | [Modul Kundenportal](https://www.mendato.com/modul/kundenportal) | - |
| Leistungsbelege (Vorlage, automatisch/manuell erzeugen, gegenzeichnen lassen) | Mendato | [Abrechnung-Collection](https://help.mendato.com/de/collections/19690892-abrechnung-leistungsnachweise) | nur Titel. |
| Fotodokumentation in App; Aufgaben/Checklisten aus LV | Mendato | [mendato.com](https://www.mendato.com/) | - |
| Kundendashboard: objektspezifischer QR-Code (nicht neu generierbar) am Objekt; Kunde scannt, sieht Leistungsnachweis (letzte 30 Tage), optional geplante Einsätze (1 Tag bis 1 Jahr, Uhrzeiten ein/aus), reicht Ticket ("Ihr Anliegen") mit Foto/Dokument ein | PlanD | [Hilfe, Volltext](https://help.pland.app/de/articles/355817-kundendashboard-tickets-einreichen-termine-einsehen) | Ticket landet im Reiter "Tickets"; Hilfe-Artikel zu Migration "Tickets werden zu Aufgaben" und Aufgabenmanagement existieren ([Dashboard-Collection](https://help.pland.app/de/collections/519060-dashboard-funktionen)). |
| Qualitätschecks mit Bildern, Kommentaren, Sternen; Leistungsnachweise; Kunden-Mails bei Ticket/Vertretung | PlanD | [Funktionsübersicht](https://pland.app/funktionen/uebersicht) | - |
| QK: Ad-hoc (Räume manuell) oder geplant (Zufallsliste nach Kriterien wie DIN 2859-1); Bewertung je Raum; Audits/gemeinsame Begehungen; Berichte mit Grafiken | KleanApp | [Funktionsseite](https://www.kleanapp.net/de/Home/Functions) | Intervalle, Bewertungsmodus, Kontrollobjekte konfigurierbar. |
| Schlechte Bewertung erzeugt automatisch Nacharbeitsticket + Nachkontrolle; Mängelmeldung durch Kunden/Besucher per QR-Code (z. B. WC) oder Objektlink; E-Mail wird Ticket; Ticketarten Angebot/Beschwerde/Störung | KleanApp | [Funktionsseite](https://www.kleanapp.net/de/Home/Functions) | - |
| Digitale Formulare/Formulardesigner (Abnahmescheine, Objektaudits, Checklisten, Materialbestellung), Ausfüllen/Unterschrift/Foto in App | KleanApp | [Funktionsseite](https://www.kleanapp.net/de/Home/Functions) | - |
| KI-Objekt-Briefing (Qualitätstrend, offene Tickets, Einsätze nächste 14 Tage); Ticket-Zusammenfassung | KleanApp | [Funktionsseite](https://www.kleanapp.net/de/Home/Functions) | - |
| Schulungen mit Unterschrift auf Tablet, Pflicht je Mitarbeiter/Funktion, auslaufende Schulungen | KleanApp | [Funktionsseite](https://www.kleanapp.net/de/Home/Functions) | - |
| Kontrollvorlagen (unbegrenzt, kundenspezifisch, auch Umfragen), Beweisfotos, Rechteverwaltung, Bericht per E-Mail/SMS an Kunde, Statistik je Kunde; Sonderreinigung per Foto vorschlagen | CleanManager (Qualitätskontrolle als Zusatzmodul) | [Modulseite](https://cleanmanager.com/zusatzmodule/qualit%C3%A4tskontrolle) | Vorlage -> Kontrolle vor Ort mit Foto -> Bericht -> Mängel -> Archiv/Auswertung. |
| QM & Ticketsystem mobil ("Neu") | fortytools | [fortytools.com](https://www.fortytools.com/) | Details nicht gefunden. |
| Begehung per Handy mit Foto + Unterschrift, PDF-Bericht (größere Pakete: Begehungen, Kundenportal) | Dynvon | [dynvon.com/reinigung/software](https://www.dynvon.com/reinigung/software) | - |
| Qualität | CleanMG | - | Nicht genannt. |

### Inferences
- Kundenfreigabe/Abnahme per Unterschrift ist belegt bei fortytools/KleanApp (Arbeitsschein), PlanD (Arbeitsschein), Mendato (Leistungsbeleg gegenzeichnen).

### Gaps
- Mendato-Hilfe zu Begehungen/Checklisten-Abnahme nicht gefunden (nur Aufgaben/Fotos).

---

## 6. Abrechnung

### Takeaway
Mendato hat die breiteste dokumentierte Abrechnung (Abrechnungstypen, Rechnungslauf, Dauer-/Jahresrechnung, Mahnstufen, Bankabgleich MT940, E-Rechnung ZUGFeRD/XRechnung, KI-Belegscanner, Subunternehmer-Gutschriften). PlanD hat ausführlichen Rechnungs-/Lohn-Stack inkl. DATEV Lohn-Export, Tarifwizard, Abschlags-/Schlussrechnung und Schweizer QR-Rechnung.

### Cited Findings

| Feature | Produkt | Beleg-URL | Workflow |
|---|---|---|---|
| Abrechnungstypen: pro Einsatz (feste Menge / dynamisch per Eingabe / Zeiterfassung / Leistungsbeleg / gruppiert), wiederholend (Dauer-/Jahresrechnung), einmalig, Anfahrt, Material, Minderung, "bis Zeitpunkt abrechnen" | Mendato | [Abrechnung-Collection](https://help.mendato.com/de/collections/19690892-abrechnung-leistungsnachweise) | Abrechnungspositionen am Auftrag definieren, Rechnung entsteht aus ausstehenden Posten (nur Titel). |
| Rechnungslauf (alle ausstehenden Posten), Rechnung aus Angebot, Stornierung, Mahnstufen/Mahnung versenden, Zahlungszuordnung automatisch, Bankanbindung, MT940-Import | Mendato | [Rechnungen-Collection](https://help.mendato.com/de/collections/7382229-rechnungen-buchhaltung) | nur Titel. |
| E-Rechnung (ZUGFeRD/XRechnung, BT-Felder, Pflichtfelder, Fristen) | Mendato | [Rechnungen-Collection](https://help.mendato.com/de/collections/7382229-rechnungen-buchhaltung) | nur Titel. |
| Belegscanner (KI), wiederkehrende Belege (Miete/Leasing), DATEV-Konto/Erlöskonto in Stammdaten, Export Buchungsdaten; DATEV-Export in jedem Tarif | Mendato | [Rechnungen-Collection](https://help.mendato.com/de/collections/7382229-rechnungen-buchhaltung), [mendato.com](https://www.mendato.com/) | - |
| Lohn-Export, vorbereitende Lohnabrechnung (Export zu DATEV/Lexware/Agenda) | Mendato | [Zeiterfassung-Collection](https://help.mendato.com/de/collections/19690890-zeiterfassung), [Zuschlags-Artikel](https://help.mendato.com/de/articles/17613781-nacht-sonntags-und-feiertagszuschlage-berechnung-und-einstellungen) | - |
| Subunternehmer: prozentuale Aufteilung, Gutschrift per Klick | Mendato (ab Pro) | [mendato.com](https://www.mendato.com/), [Gutschrift-Artikel (Titel)](https://help.mendato.com/de/articles/10600495-gutschrift-fur-subunternehmer-erstellen) | - |
| Automatische Rechnungen je Einsatz inkl. Versand (E-Mail/Post); wiederholende Rechnungen; Dynamische Positionen; Abschlags-/Teil-/Schlussrechnung; Arbeitsscheine fakturieren; Mahnungen mit Vorlagen; Bankanbindung; ZUGFeRD/X-Rechnung; DATEV-Rechnungsexport/Buchungsstapel; Skonto; Debitorennummern; Postversand; Preisanpassungen von Produkten; Schweizer QR-Rechnung + Rappenrundung; §35a-Lohnkostenanteil | PlanD | [Dashboard-Collection](https://help.pland.app/de/collections/519060-dashboard-funktionen) | nur Titel. |
| Lohnabrechnung: Lohnarten, Zuschläge, Feiertagsbezahlung, Kostenstellen, DATEV-Lohn-Export und Import in DATEV Lohn & Gehalt, "Lohnabrechnung als Service", Belastungszuschlag, steuerfreie Zuschläge §3b EStG, mehrere Lohnarten je Mitarbeiter | PlanD | [Dashboard-Collection](https://help.pland.app/de/collections/519060-dashboard-funktionen), [Funktionsübersicht](https://pland.app/funktionen/uebersicht) | Export DATEV/CSV/individuell/API. |
| Tarifvertrag-Wizard: Tarifvorlage anwenden -> Lohngruppen 1-9 wählen -> Zuschläge vorschlagen/zuordnen -> abweichende Lohnarten je Auftragsart (höhere Lohngruppe gewinnt) -> Vorschau; Tariflöhne zentral aktualisiert, nicht manuell editierbar | PlanD | [Hilfe, Volltext](https://help.pland.app/de/articles/692392-tarifvertrag-wizard) | Re-Run erkennt Bestehendes (keine Duplikate). |
| Rechnungen (Einmal/Dauer), Dauerrechnungen, Abschlag + Schlussrechnung, Arbeitsscheine aus Planung; Changelog: Original-Rechnungen an Mahnung anhängen (14.08.2026), PDF-Anhänge mit Rechnung zusammenführen (22.07.2026), Debitorennummer auf Rechnung | fortytools | [fortytools.com](https://www.fortytools.com/), [Changelog](https://www.fortytools.com/changelog) | - |
| Rechnungen einzeln oder als Rechnungslauf; Arbeitsschein-PDF mit Unterschrift angehängt; Schnittstellen DATEV (inkl. Belege), Lexware, Lodas, Addison, Agenda, Sage, Digras, Saphir; ERP zvoove, Navision/BSS; Sensorik Tork EasyCube, FeedbackNow | KleanApp | [Funktionsseite](https://www.kleanapp.net/de/Home/Functions) | Lodas hier explizit belegt. |
| Fakturakalkulation + Lohnkalkulation (Zusatzmodule) mit Anbindung an Lohn-/Buchhaltungssoftware | CleanManager | [cleanmanager.com](https://cleanmanager.com/) | - |
| Wiederkehrende Rechnungen aus Verträgen/Einsätzen, E-Rechnung, Mahnwesen (laut FAQ) | Dynvon | [dynvon.com/reinigung/software](https://www.dynvon.com/reinigung/software) | Lohn-Export auf Seite nicht erwähnt; Excel-Lohnrechner als Ressource. Individualprojekt-Seite nennt Lohnvorbereitung, Bankabgleich, Eingangsrechnungen ([Individualsoftware](https://www.dynvon.com/reinigung/individualsoftware)). |
| Rechnungen (Status Entwurf/geprüft/versendet, PDF) | CleanMG | [cleanmg.de](https://www.cleanmg.de/) | Kein DATEV/Mahnwesen/E-Rechnung auf Seite genannt. |

### Inferences
- E-Rechnung ist belegt bei Mendato, PlanD (ZUGFeRD/XRechnung), Dynvon; Lodas explizit nur bei KleanApp (DATEV Lohn und Gehalt/Lodas).

### Gaps
- Tatsächliche Details (Mahnfristen, Gebühren) nicht gelesen.

---

## 7. Mitarbeiter-App, Kundenportal, Dashboards, Rollen, Import/Export, KI

### Takeaway
PlanD punktet bei App (16+ Sprachen über Schulungsplattform, Chat mit Auto-Übersetzung, Offline) und Chat; Mendato bei Rollen/Controlling. Alle fünf Familien haben mind. eine KI-Funktion; die tiefste KI hat KleanApp (5 integrierte Tools + MCP), PlanD ("Paula" Telefon/E-Mail/Dashboard), Mendato (KI-Grundriss/-LV/-Belegscanner/-Stundenzettel).

### Cited Findings

| Feature | Produkt | Beleg-URL | Workflow |
|---|---|---|---|
| Operations-App (iOS/Android): Stempeln, Aufgaben, Foto; 11 Hilfe-Artikel | Mendato | [mendato.com](https://www.mendato.com/), [Mitarbeiter-Collection](https://help.mendato.com/de/collections/7382339-fur-mitarbeiter-mendato-operations) | App-Store-Eintrag nicht gefunden (Suche ergebnislos). |
| Controlling: Soll-Ist-Stunden, Marge, Kosten/Umsatz/Ergebnis (ab Pro Plus); Benutzer & Rollen (Account-Collection) | Mendato | [Controlling-Collection](https://help.mendato.com/de/collections/19648850-controlling-auswertungen), [Account-Collection](https://help.mendato.com/de/collections/8885288-account-einstellungen) | - |
| KI-Funktionen: Räume aus Grundriss, LV-Import, Belegscanner, Stundenzettel-Foto (BETA); "KI-Fallbeispiele"-Seite | Mendato | Siehe Abschnitte 1, 4, 6; [mendato.com/ki](https://www.mendato.com/ki) | - |
| Mitarbeiter-Chat (Gruppenchats, per Rechtegruppe), Chat-Übersetzung, Push, Geburtstagserinnerung, Schulungsplattform MyTutorial (16+ Sprachen), Rechtegruppen selbst erstellbar, Zapier, Branding | PlanD | [Funktionsübersicht](https://pland.app/funktionen/uebersicht), [Dashboard-Collection](https://help.pland.app/de/collections/519060-dashboard-funktionen) | - |
| Paula: KI-Telefonassistentin (nimmt Anrufe an, legt Aufgaben an), Dashboard-Assistentin, E-Mail-Anbindung, Prompts, Einsatz für Objektleiter | PlanD | [Paula-Collection](https://help.pland.app/de/collections/1435865-paula) | KI-Antworten auf Kundenanfragen ([Funktionsübersicht](https://pland.app/funktionen/uebersicht)). |
| Mehrsprachigkeit/Offline der App (16+ Sprachen, 10.000 Gerätetypen) | PlanD | [Suchtreffer pland.app](https://pland.app/en/app-for-cleaning-businesses) (nur Snippet; Google-Play-Eintrag nicht gefunden) | - |
| Dashboard pro Nutzer konfigurierbar (01.09.2026), Sanktionslisten-Abgleich (08.10.2026), Systemprotokoll/Audit (24./25.08.2026), Excel-Export Lohndaten | fortytools | [Changelog](https://www.fortytools.com/changelog) | - |
| Dashboard-/Berichts-/Formulardesigner, Rechte wie in App, MCP-KI | KleanApp | [Funktionsseite](https://www.kleanapp.net/de/Home/Functions) | - |
| Kundenportal im Basismodul; App mehrsprachig (Sprachen ungenannt); Dokumentbereitstellung (Zugangscodes, SDB), Warenbestellung per App | CleanManager | [cleanmanager.com](https://cleanmanager.com/), [App-Seite](https://cleanmanager.com/zusatzmodule/app-mit-zeiterfassung) | - |
| MCP-KI-Zugang in jedem Paket; Dashboard (offene Rechnungen, Auslastung, Nachweise, DB je Objekt); mehrsprachige App | Dynvon | [dynvon.com/reinigung/software](https://www.dynvon.com/reinigung/software) | - |
| Dashboard fehlende Stundenzettel; Subunternehmer; EU-Server | CleanMG | [cleanmg.de](https://www.cleanmg.de/) | - |

---

## 8. Tarif-Gating (welche Funktion nur in höheren Tarifen)

### Cited Findings
- Mendato (99/199/299/499 € je Monat): Mini = Objekte, Zeiterfassung, Personalplanung, Buchhaltung, Statistiken; Starter (199 €) = + Ticketsystem, Urlaubsplanung, Kalkulation; Pro (299 €) = + Kundenportal, Subunternehmermanagement (und Stundenzettel-Foto-KI); Pro Plus (499 €) = + Controlling, Schnittstellen; Enterprise individuell — [mendato.com](https://www.mendato.com/), [Reklamations-Artikel](https://help.mendato.com/de/articles/11095691-digitales-reklamationsmanagement-kundenportal-ticketsystem), [Zeiterfassungs-Artikel](https://help.mendato.com/de/articles/10901099-ubersicht-die-6-moglichkeiten-der-zeiterfassung-in-mendato). Widerspruch zur Vorstudie: dort war Kalkulation als "Zusatzmodul" beschrieben, hier ab Starter.
- CleanMG: Starter 29 € (10 MA/5 Kunden/20 Objekte/25 Rechnungen), Professional 59 €, Business 99 € (unbegrenzt, Prioritäts-Support); Subunternehmer-Angabe widersprüchlich — [cleanmg.de](https://www.cleanmg.de/)
- KleanApp: Reduziert 12,30 €/Nutzer (nur mit mind. einer Pro-Lizenz), Pro 99 €/Nutzer; Zeitpakete ab 145 € (ab 25 MA); Einrichtung M 290/L 790/XL 1.290 € (Schnittstellen DATEV/Lexware ab L; Formulare ab L/XL); MCP-KI 59/229/399 € — [kleanapp.net](https://www.kleanapp.net/)
- Dynvon: Lizenz einmalig 1.290/3.490/7.990/10.900 € (bis 15/30/60/110 Vollzeitstellen) + Betrieb ab 49/69/89/109 € monatlich netto; größere Pakete ergänzen Begehungen, Kundenportal, Subunternehmer; KI-Zugang in jedem Paket — [dynvon.com/reinigung/software](https://www.dynvon.com/reinigung/software)
- fortytools, PlanD, CleanManager: keine Tarife/Funktionen je Tarif auf den gelesenen Seiten (fortytools: 30 Tage Test mit allen Funktionen; CleanManager: Preisübersicht-Seite nicht gelesen, 14 Tage Test; PlanD: Demo-Pflicht; ein Drittanbieter-Snippet nennt ~10 €/MA/Monat, veraltet) — [fortytools.com](https://www.fortytools.com/), [cleanmanager.com](https://cleanmanager.com/)

---

## 9. Besonderheiten / Alleinstellungsmerkmale (Kurzworkflow)

- Mendato: Raumbuch-Kalkulation mit m²/h-Leistungswertkatalog und Monatsziel-Warnung; KI-Import von Grundriss und altem LV; Kundenportal mit Reklamations-Auswertung für Quartalsgespräche; konfigurierbare SFN-Zuschlagsbasis (Stempel vs. Plan) mit Neuberechnung — Belege in Abschnitten 1, 4, 5.
- PlanD: Tarifvertrag-Wizard (Lohngruppen 1-9, zentral gepflegt); Routen als Vorlage mit Wisch-Erfassung in der App; Planungsassistent; KI-Telefonassistentin Paula; Chat mit Übersetzung; Kundendashboard per Objekt-QR — [Wizard](https://help.pland.app/de/articles/692392-tarifvertrag-wizard), [Routen](https://help.pland.app/de/articles/653765-routen-tourenplanung), [Kundendashboard](https://help.pland.app/de/articles/355817-kundendashboard-tickets-einreichen-termine-einsehen).
- KleanApp: Qualitätskontrolle mit Zufallsraumliste nach DIN 2859-1 und Auto-Nacharbeitsticket; QR-Mängelmeldung; Führerschein-Kontrolle per NFC; DGUV-Prüfworkflow; Schlüsselübergabe per NFC + Unterschrift; fünf integrierte KI-Prüftools — [Funktionsseite](https://www.kleanapp.net/de/Home/Functions).
- CleanManager: NFC-Stempeln am Objekt mit Alarm bei Nichterscheinen; Qualitätsvorlagen unbegrenzt — [App](https://cleanmanager.com/zusatzmodule/app-mit-zeiterfassung), [QK](https://cleanmanager.com/zusatzmodule/qualit%C3%A4tskontrolle).
- Dynvon (Nürnberg, gegründet 2025, 6 MA): Einmallizenz statt Pro-Kopf-Abo, Quellcode-Hinterlegung, 27 Standardmodule + Individualentwicklung; öffentlicher Kalkulationsrechner mit Tarifwerten 2026 — [Individualsoftware](https://www.dynvon.com/reinigung/individualsoftware), [Rechner](https://www.dynvon.com/reinigung/kalkulationsrechner). Unterneh­mensangaben (Zertifizierungen) nur Eigenaussage.
- CleanMG: Preis-Einstieg 29 €/Monat, minimaler Funktionsumfang — [cleanmg.de](https://www.cleanmg.de/).

### Inferences
- Positionierung: CleanMG = Einstieg Kleinbetrieb; Mendato/PlanD/fortytools = Mittelstand-SaaS; KleanApp/CleanManager = größere Betriebe/Fachtiefe; Dynvon = Kauf-/Individualmodell für 15-110+ Vollzeitkräfte.

### Gaps
- Dynvon bekannt erst seit 2025 gegründet; keine unabhängigen Belege/Reviews; Frühere Vorstudie fand Dynvon nicht (dynvon.de existiert nicht, korrekt ist dynvon.com).
- Nicht erreichbar: App-Store-/Google-Play-Beschreibungen (Mendato Operations, PlanD) - Suche ergebnislos; YouTube-Beschreibungen/Webinare (PlanD-Webinar-Collection, Mendato-YouTube @mendato) nicht ausgewertet; PlanD produkt-updates-Seite und Funktionsunterseiten nicht einzeln gelesen; CleanManager Preisübersicht, support.cleanmanager.com und fortytools Hilfecenter (hilfe.fortytools.com) nicht gelesen; KleanApp-Übernahmepresse nicht abrufbar.
- Changelog-Zuordnung: Die gelesene Changelog-Seite ist fortytools.com/changelog; sie belegt Features von fortytools by zvoove, nicht von PlanD.
- Schichttausch, Krankmeldung per Mitarbeiter-App, Raumbuch bei PlanD/fortytools/CleanMG/Dynvon: nicht gefunden.
