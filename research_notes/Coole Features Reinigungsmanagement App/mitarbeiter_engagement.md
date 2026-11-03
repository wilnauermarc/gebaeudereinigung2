# Mitarbeiter-Bindung, Einarbeitung und Alltag von Reinigungskräften/Schichtarbeitern: innovative WFM-Features (Stand 03.11.2026)

Methodik-Hinweis: Nur ca. 15 Tool-Aufrufe, überwiegend Suchzusammenfassungen. Volltext wurde nur bei Flip, Gallup, Rain-Blog, WEKA und Hagel-IT geprüft. Aussagen aus Suchzusammenfassungen sind mit "(Suchzusammenfassung)" markiert. Nicht wiederholt: Papershift/Planday/Crewmeister/Clockodo/Staffomatic-Grundfunktionen (siehe frühere Datei planung_zeiterfassung.md).

## 1. Mitarbeiter-App-Ideen (Chat/Übersetzung, Mehrsprachigkeit, Schichtbörse, Benachrichtigung, Stempeln, Offline, Foto)

### Takeaway
Auto-Übersetzung im Chat ist bei Flip (DeepL, "50+ Sprachen" laut Feature-Liste vs. "30+ Sprachen" Oberfläche laut FAQ, Widerspruch) und Beekeeper belegt; QR/NFC-Check-in ohne Login in der eigenen Sprache ist für Reinigung konkret beschrieben (Hagel-IT). Schichtbörse/Tausch/Offline sind bereits in der Vorrecherche belegt; hier nur ergänzt.

### Cited Findings

| Feature | Produkt | Beleg-URL | Workflow | Evidenz | Übertragbar auf DE | Aufwand für unsere App |
|---|---|---|---|---|---|---|
| Chat mit automatischer Übersetzung (Posts/Chats in eigener Sprache) | Flip (DE) | https://www.getflip.com/platform/employee-app/ | Beitrag in einer Sprache, jeder liest in seiner (DeepL, Herstellerangabe, Echtzeit) | mittel (Herstellerangabe, Kundenzitat, keine Wirkungsdaten) | ja, Vendor wirbt mit DSGVO, ISO 27001, EU-Rechenzentren, "betriebsratskonform" (Herstellerangabe, nicht geprüft) | mittel (Übersetzungs-API einbinden, DSGVO-AVV mit Anbieter; Chat selbst klein bis mittel) |
| Inline-Übersetzung + Chats/Streams/Umfragen | Beekeeper | https://apps.adp.com/en-US/apps/209466/beekeeper---employee-app/editions | Inline-Übersetzung in Essential- und Core-Tarif (Suchzusammenfassung) | schwach bis mittel | ja (CH/DE-Anbieter, Details DSGVO nicht geprüft) | mittel |
| Mehrsprachige Oberfläche, Check-in per QR/NFC-Tag ohne Login "in der eigenen Sprache" | Branchenartikel (anbieterneutral) | https://www.hagel-it.de/it-insights/digitalisierung-in-der-reinigungsbranche-so-geht-gebaeudereinigung-2026 | Tag (1-2 EUR Material) in Putzkammer/Wagen; bei Ankunft/Verlassen Zeit erfassen, Leistungen abhaken, bei Sondereinsätzen Foto hochladen | mittel (Fachbeitrag eines IT-Dienstleisters, keine Zahlen) | ja | klein bis mittel (QR-Link auf Web-App/PWA, kein App-Store) |
| QR-Zeiterfassung im Objekt mit Übersetzungen in viele Sprachen | Timetracker-App (DIGRAS) | https://apps.apple.com/ua/app/timetracker-app/id6447970682 | QR im Objekt scannen (Suchzusammenfassung, App-Store-Eintrag nicht im Volltext geprüft) | schwach | ja | klein bis mittel |
| Geofence-Stempeln mit Freigabeanfrage statt harter Sperre | Connecteam | https://au.connecteam.com/employee-time-clock-app/geofence-time-clock-app/ (aus Vorrecherche) | Außerhalb Radius: Anfrage an Vorgesetzten | mittel | heikel (Ortung, s. Abschnitt 5) | mittel |
| Reinigungs-spezifische Landingpage (Inhalt nicht ausgewertet) | Connecteam | https://lp.connecteam.com/cleaning-app-aw | nicht geprüft | schwach | unklar | - |
| Offene Schichten mit Bewerbung, Tausch mit Doppelfreigabe, Offline-Stempeln, Terminal | Papershift, Planday, Crewmeister, Staffomatic | siehe planung_zeiterfassung.md | s. Vorrecherche | mittel | ja | s. Vorrecherche |
| WhatsApp-Ersatz: gezielte Kanäle statt unkontrollierter Gruppen | Flip | https://www.getflip.com/platform/employee-app/ | Zielgruppen per HRIS-Metadaten (z. B. Standort, Nachtschicht) | mittel | ja; WhatsApp/Facebook gelten als ungeeignet für Arbeitskommunikation und oft rechtlich problematisch (WEKA) | mittel |

- Flip-Kundenzahlen (Herstellerseite, Marketing): EDEKA "Information 66 % schneller", Bauder "90 % Nutzerzuwachs in 6 Monaten", Kodi "100 % Nutzungsquote in 250 Filialen", Apotheke Mache "100 % an 8 Standorten" — [Flip](https://www.getflip.com/platform/employee-app/). Der ROI-Rechner der Seite zeigt unplausible Werte und ist nicht belastbar.
- Gemischter Betrieb mit Foto-Nachweis, Leistungen abhaken, Dispo-App mit Chat zur Zentrale für Vorarbeiter — [Hagel-IT](https://www.hagel-it.de/it-insights/digitalisierung-in-der-reinigungsbranche-so-geht-gebaeudereinigung-2026). Hagel-IT empfiehlt Schulungskonzept vor Go-live und Begleitung der Vorarbeiter.
- Gelistete Konkurrenz mit Reinigungsbezug (Suchtreffer, nicht ausgewertet): KleanApp https://www.kleanapp.net/en/ , Miele CleanPlus https://www.miele.de/pro/cleanplus , Kühl DigiClean https://www.klueh.de/fileadmin/user_upload/klueh_de/documents/Familienunternehmen/Factsheets_Digitalisierung/Factsheet_DigiClean_eng_2022.pdf , BWClean https://apps.apple.com/de/app/bwclean/id6444410171

### Inferences
- Für Minijob-Kräfte mit teils schwachen Deutschkenntnissen ist QR-Link ohne Login + eigene Sprache + Piktogramme der Hebel mit dem besten Aufwand/Nutzen; eine Web-App (PWA) vermeidet Store-Hürden und Passwörter.
- Übersetzung nur für Chat-Freitext einsetzen; Standardtexte (Schichtangebot, Checklisten) als eigene Übersetzungstabellen vorhalten, das ist verlässlicher und datensparsamer als jede Nachricht an einen Dienst zu schicken.
- Push/WhatsApp: WhatsApp-Business-Benachrichtigungen mit Link sind für Reinigungskräfte wahrscheinlich praktikabler als Push, aber Datenschutzfragen (Drittland, Metadaten) bleiben; hier keine Quelle gefunden.

### Gaps
- Keine Primärquelle zu Piktogramm-Oberflächen in einem WFM-Produkt gefunden.
- Deputy, Homebase, 7shifts, Branch, Workstream, Shiftsmart, Mendato, PlanD, Quinyx, Staffbase, Zeitgold, Crew: Produktseiten nicht ausgewertet (Budget). Digitale Gehaltszettel/Dokumentenablage, Verfügbarkeits-/Wunschzeiten-Eingabe und Foto-Nachweise bei diesen Produkten daher nicht belegt.
- Welche Sprachen Flip/Beekeeper für Reinigungsklientel (z. B. Rumänisch, Polnisch, Ukrainisch, Arabisch) abdecken: nicht geprüft.

## 2. Einarbeitung und Wissen (Onboarding, Micro-Learning, QR-Betriebsanweisung, Einarbeitungsblatt)

### Takeaway
Belegt sind Kurs-/Quiz-Bausteine und Onboarding-Flows als Marketing-Funktionen (Connecteam, Flip); eine QR-gesteuerte Schulungsvideo-Zuordnung zu Objekt/Gerät wurde bei einer US-Reinigungs-App gefunden (Suchzusammenfassung). Ein rechtssicherer Unterweisungsnachweis nach Arbeitsschutzrecht ist in keiner Quelle als Produktfeature belegt.

### Cited Findings

| Feature | Produkt | Beleg-URL | Workflow | Evidenz | Übertragbar auf DE | Aufwand |
|---|---|---|---|---|---|---|
| Kurse und Quizze im HR Hub; Abschluss-Badge im Profil; Diplom als Dokument in Personalakte | Connecteam | https://help.connecteam.com/en/articles/8133439-steps-for-a-successful-training-session-using-connecteam (Suchzusammenfassung) | Kurs bauen, Quiz am Ende, Diplom hochladen, Badge vergeben; kein eigenes Zertifikat-Tool | mittel (Help-Center, aber nur Snippet) | ja, Nachweis-Qualität nach DGUV/ArbSchG prüfen | mittel |
| Onboarding-Flows "vom Onboarding bis Urlaub", vorgefertigte Vorlagen, Pilot in 4-6 Wochen | Flip | https://www.getflip.com/platform/employee-app/ | HR-Prozesse als Flow; EUROPART: "Onboarding zum Erlebnis gemacht" | schwach (Marketing) | ja | mittel |
| QR-Aufkleber ordnet Schulungsvideo dem Objekt/Gerät zu: Scan spielt Video sofort | RCP Smart App | https://www.janitorialmanager.com/blog/how-to-make-educational-facility-cleaning-better-with-qr-codes/ (nur verwandter Treffer; RCP-Smart-App-Quelle nicht separat geprüft) | Scan am Objekt, Video je Ort | schwach | ja | klein (QR + Video-Link je Objekt) |
| Fachwortschatz-App Gebäudereinigung (1.300 Fachbegriffe) | WKO Österreich | https://wko.at/oe/gewerbe-handwerk/chemische-gewerbe/denkmal-fassade-gebaeude/folder-sprachlernapp-quadrat.pdf | Deutsch lernen mit Branchenvokabular; ersetzt keine Unterweisung | schwach (Suchzusammenfassung) | Idee übertragbar | klein (Glossar mit Bild) |

### Inferences
- "Einarbeitungsblatt für Vertretungen" = pro Objekt eine Seite (Zugang, Schlüssel, Alarm, Checkliste, Foto der Sollzustände, Kontakt, Gefahrstoffe), per QR/Link abrufbar, mehrsprachig. Als fertiges Feature wurde das bei keinem Produkt belegt; es ist eine Kombination aus belegten Bausteinen (Checkliste, Foto, QR, Wissensdatenbank).
- Unterweisungsnachweis: Datum, Thema, Sprache, Bestätigung/Signatur und Quiz-Ergebnis speichern. Rechtlicher Rahmen (ArbSchG § 12, DGUV) wurde nicht recherchiert; vor Einsatz als Nachweis prüfen.
- Quiz-Ergebnisse je Person sind Leistungs-/Verhaltensdaten und lösen ggf. Mitbestimmung aus (s. Abschnitt 5); besser "bestanden/nicht bestanden" speichern, keine Einzelantworten.

### Gaps
- Keine Quelle zu E-Signatur im Onboarding (Arbeitsvertrag Schriftform/Nachweisgesetz) bei einem Produkt.
- Keine Studie zur Wirkung digitalen Onboardings auf Fluktuation in Reinigung gefunden.
- BG BAU/DGUV-Vorgaben zu Unterweisung von Reinigungskräften nicht recherchiert.

## 3. Bindung und Motivation (Anerkennung, Gamification, EWA, Umfragen, Prämien) und Evidenz zur Fluktuation

### Takeaway
Die stärkste unabhängige Evidenz betrifft Anerkennung (Gallup/Workhuman, ca. 3.500 Beschäftigte, nur korrelativ, US). Zu Earned Wage Access gibt es fast nur Anbieterzahlen (14 bis 35 % weniger Fluktuation, ohne Methodik). Zu Gamification, Pulse-Checks und Empfehlungsprämien im Reinigungsbereich wurde keine belastbare Evidenz gefunden.

### Cited Findings

| Feature | Produkt | Beleg-URL | Workflow | Evidenz | Übertragbar auf DE | Aufwand |
|---|---|---|---|---|---|---|
| Anerkennung: Badges mit persönlicher Nachricht, eigene Badge-Bibliothek | Connecteam | https://help.connecteam.com/en/articles/6423761-starting-guide-to-recognitions | Admin aktiviert Feature, sendet Badge an Personen | mittel (Gallup stützt Prinzip, kein Produkt-Wirkungsnachweis) | ja, Lob ohne Ranking unkritisch(er) | klein |
| Rewards: Tokens gegen Geschenkkarten, Anbieter einschränkbar | Connecteam | https://help.connecteam.com/en/articles/5956739-starting-guide-to-rewards | Manager sendet Tokens, Mitarbeiter lösen ein | schwach | eingeschränkt (Sachbezug 50-EUR-Grenze/Lohnsteuer nicht geprüft) | mittel |
| Earned Wage Access (Verdienten Lohn vorab abrufen) | Rain, Instant, Payactiv, Wagestream, DailyPay, Minu, Netchex | https://www.rainapp.com/blog/earned-wage-access-and-employee-retention-what-the-data-shows-for-frontline-employers | Mitarbeiter ruft bereits verdienten Teil ab; Arbeitgeber bindet Anbieter an Payroll | schwach (nur Vendordaten) | unklar/heikel (Kredit-/Aufsichtsrecht DE nicht geklärt) | groß (Zahlungsfluss, Haftung, Lohnabrechnung) |
| Umfragen/Polls/Pulse in Mitarbeiter-App | Beekeeper | https://apps.adp.com/en-US/apps/209466/beekeeper---employee-app/editions | Chats, Streams, Umfragen (Suchzusammenfassung) | schwach | ja, anonym/aggregiert; Umfragen sind mitbestimmungsrelevant (Rechtslupe) | klein |

Evidenz zur Wirkung:
- Gallup/Workhuman (veröffentlicht 18.09.2024): Verfolgung von fast 3.500 Beschäftigten 2022-2024; gut anerkannte Beschäftigte waren nach zwei Jahren 45 % weniger wahrscheinlich gewechselt; 65 % weniger wahrscheinlich auf Jobsuche bei hochwertiger Anerkennung (mind. 4 von 5 Gallup-Säulen); 55 % der US-Beschäftigten erhalten keine oder keine qualifizierte Anerkennung; Ersatz einer Frontline-Kraft kostet ca. 40 % des Gehalts — [Gallup](https://www.gallup.com/workplace/650174/employee-recognition-quality-drives-retention.aspx). Ob die Stichprobe nur US ist und ob Frontline gesondert ausgewertet wurde, geht aus der Seite nicht hervor; Gallup ist zudem Partner des Anbieters Workhuman (Interessenlage).
- Rain (Vendor): "Ø 35 % weniger Fluktuation" nach EWA-Einführung, 56,6 % der Stundenlöhner würden bei schnellerem Zugang länger bleiben; keine Methodik, Zeitraum, Stichprobe oder Kontrollgruppe, Quelle nicht prüfbar — [Rain](https://www.rainapp.com/blog/earned-wage-access-and-employee-retention-what-the-data-shows-for-frontline-employers).
- Weitere Vendor-Angaben (Suchzusammenfassung): Instant Financial bis 27 % (2021) https://www.instant.co/?p=4836 ; Payactiv/RHA Health Services 26 % https://www.casestudies.com/company/payactiv/case-study/rha-health-services-boosts-retention-26-with-payactiv ; Netchex 10-30 % https://netchex.com/blog/how-earned-wage-access-reduces-turnover-in-hourly-workforces/ ; UKG-Kunde Encore 14 % https://www.ukg.com/for-llms/blog/payroll-leaders/modern-pay-modern-work-why-demand-pay-strategic-employers ; Minu (Mexiko) bis 33 % https://www.minu.mx/blog/minu-the-leading-employee-wellness-platform-in-mexico-raises-us-30-million-to-improve-the-financial-health-of-millions-of-workers .
- Wagestream: Ipsos-MORI-Bericht "signifikant weniger Fluktuation" (nur Snippet; Zahl nicht abrufbar, Seite zog nach stream.co um und lieferte 404) — [Ipsos-MORI-Report-Link](https://wagestream.com/en/resources/ipsos-mori-report). Vom Anbieter beauftragt/beworben.
- Akademisch: Ein NBER-Konferenzpapier (f193126) mit Abschnitt "Effect of Earned Wage Access on Employee Turnover" existiert, der PDF-Text war nicht lesbar; Autoren, Daten und Ergebnisse nicht geprüft — [NBER PDF](https://conference.nber.org/conf_papers/f193126/f193126.pdf). Die in einer Suchzusammenfassung genannte Zuordnung zu "Murillo, Vallée, Yu" konnte nicht bestätigt werden.
- Forrester TEI im Auftrag von Legion (2026): vier Kundeninterviews, 10 % weniger freiwillige Fluktuation, kombiniert mit Planungstools, 1.340 % ROI (Suchzusammenfassung; Seite gesperrt, HTTP 402) — [Las Vegas Sun](https://lasvegassun.com/news/2026/aug/04/frontline-retention-is-now-a-wfm-outcome-tei-study/).
- Schichtbörse/flexible Planung: Shyft-Blogs nennen 24-40 % weniger Fluktuation und 76 % schnellere Besetzung, ohne Quellen — [Shyft ROI](https://www.myshyft.com/blog/roi-success-stories/) (Suchzusammenfassung, Eigenwerbung). Als Kostenbasis Cornell-Zahl 5.864 USD je Abgang im Schnellrestaurant über Shyft-PDF zitiert: https://www.myshyft.com/wp-content/uploads/2020/09/Shyft-Workforce-IHL-Case-Study-2020.pdf

### Inferences
- Gestützt ist nur das Prinzip "regelmäßige, konkrete Anerkennung korreliert mit weniger Wechsel"; Kausalität, Effektgröße in Reinigung und für Minijobber sind offen.
- EWA-Zahlen nicht als Argument für die App verwenden; wichtiger sind Planungssicherheit (verlässliche Stunden, Schichtwünsche) und pünktliche Abrechnung. Für Minijobs mit Monatsgrenze 603 EUR (Vorrecherche) ist ein Vorschuss ohnehin begrenzt.
- Empfehlungsprämien, Gamification und Karrierepfade (Vorarbeiter-Entwicklung) sind plausibel, aber hier nicht belegt.

### Gaps
- Keine unabhängige Studie zu Fluktuation speziell in Gebäudereinigung gefunden.
- Keine Quellen für Gamification-Wirkung, Empfehlungsprämien, Pulse-Check-Wirkung, Karrierepfade-Features.
- Deutsche rechtliche Einordnung von EWA/Vorschuss (BaFin, Kreditwesen, Pfändungsschutz) nicht gefunden; Suche lieferte überwiegend US-Recht (z. B. NCLC) und nichts zu Zeitgold.
- Branch, Workstream, Shiftsmart: kein Fallbericht mit Zahlen gefunden.

## 4. Anbieterlandschaft DE/International (Kurzprofil)

### Takeaway
Für gewerbliche Mitarbeitende mit Chat/Übersetzung sind Flip und Beekeeper belegt; Staffbase, Crew, Zeitgold, Mendato, PlanD, Quinyx, Deputy, Homebase, 7shifts, Branch, Workstream, Shiftsmart wurden nicht ausgewertet.

### Cited Findings
- Flip GmbH, "Made in Germany", Nachrichten und Posts werden automatisch übersetzt, Gruppen-/1:1-Anrufe; 2022 mehr als 1 Mio. Nutzer, 33 Mio. USD Finanzierung — [App Store](https://apps.apple.com/app/id1505736692), [TechCrunch](https://techcrunch.com/2022/02/02/flip-a-popular-chat-app-for-frontline-workers-raises-33m-as-it-passes-1m-users) (Suchzusammenfassung).
- Beekeeper (Beekeeper AG): Inline-Übersetzung, Peer- und Gruppenchats — [ADP Marketplace](https://apps.adp.com/en-US/apps/209466/beekeeper---employee-app/editions).
- Connecteam: Operations Hub (Formulare/Checklisten, Aufgaben), Communications Hub (Chat, Updates, Verzeichnis, Wissensdatenbank), Employee Training (Quizze), Recognition and Rewards; Übersetzung laut Slashdot-Listing in fünf Sprachen (einzige Quelle, nicht verifiziert) — [Connecteam Navigation](https://connecteam.com/pricing-calculator-sbp/), [Slashdot](https://slashdot.org/software/comparison/Connecteam-vs-Speakap/).

### Inferences
- Allgemeine Frontline-Apps (Flip/Beekeeper) sind Kommunikationsplattformen, keine Reinigungsplaner; die Lücke ist die Kombination aus Objekt-Einsatzplan, QR-Nachweis, Unterweisung und mehrsprachiger Kommunikation in einem leichten Produkt für kleine Betriebe.

### Gaps
- Preise, Mindestgrößen und Eignung für Betriebe mit unter 50 Mitarbeitern nicht ermittelt.

## 5. Datenschutz- und mitbestimmungsrechtlich heikle Features in Deutschland

### Takeaway
Mitarbeiter-Apps sind regelmäßig nach § 87 Abs. 1 Nr. 1 und Nr. 6 BetrVG mitbestimmungspflichtig, wenn ein Betriebsrat besteht. Heikel sind Rankings/Leistungsdaten, Ortung, Auswertung von Quiz- und Verhaltensdaten sowie Dauererreichbarkeit. Ob Gamification-Rankings im Einzelfall erfasst sind, ist nicht höchstrichterlich belegt.

### Cited Findings
- Einführung von Mitarbeiter-Apps: § 87 Abs. 1 Nr. 1 (Ordnung des Betriebs) und Nr. 6 (technische Überwachung); Schichtplanung kann Nr. 2/3 auslösen, Prozessgestaltung § 90; Betriebsrat kann Betriebsvereinbarung erzwingen; SaaS-Updates können Funktionen nach Vereinbarung ändern; Datensparsamkeit, nur aggregierte/anonyme Auswertung, kein Profiling zu Leistung, Gesundheit, Zuverlässigkeit, Standort; WhatsApp/Facebook für Arbeitskommunikation ungeeignet — [WEKA](https://www.weka.de/betriebsrat-personalrat/mitarbeiter-apps-so-bestimmt-der-betriebsrat-mit/) (Fachverlag, kein Rechtsrat).
- Nr. 6 greift nur, wenn Daten durch die technische Einrichtung programmgemäß zur Überwachung verarbeitet werden; bei einer Smartphone-App mit Kundenfeedback ohne eigene Auswertungssoftware wurde die Mitbestimmung verneint — [Rechtslupe](https://www.rechtslupe.de/arbeitsrecht/smartphone-app-kundenfeedbackfunktion-3125182), [Osborne Clarke](https://www.osborneclarke.com/de/insights/betriebsverfassungs-und-tarifrecht-die-einfuhrung-einer-smartphone-app-mit-kundenfeedbackfunktion-ist-nicht-zwingend-mitbestimmungspflichtig) (Suchzusammenfassung).
- Ortung/Einsatzplanung per Ortungssystem: Hans-Böckler-Stiftung-Praxishilfe zu Betriebsvereinbarungen (Inhalt nicht auswertbar, HTTP 404 beim Abruf) — [Böckler](https://www.boeckler.de/data/mbf_bvd_praxis_einsatzplanung_per_ortungssysteme.pdf). Ein Praxisbeispiel (Suchzusammenfassung): Beschäftigte können GPS-Ortung für Pausen/Feierabend selbst ausschalten.
- Mitarbeiterbefragungen: Mitbestimmungsfall in der Rechtsprechung — [Rechtslupe](https://www.rechtslupe.de/arbeitsrecht/die-konzernweit-elektronisch-durchgefuehrte-mitarbeiterbefragung-und-die-mitbestimmung-des-konzernbetriebsrats-3139942) (nur Titel/Snippet).
- BAG 1 ABR 24/22 (17.10.2023) und BAG 1 ABR 50/11 erschienen als Suchtreffer, Inhalt nicht geprüft — [BAG 2023](https://rewis.io/urteile/urteil/hfh-17-10-2023-1-abr-2422/), [BAG 2012](https://www.bundesarbeitsgericht.de/wp-content/uploads/2021/01/1-ABR-50-11.pdf).

Heikelkeits-Einschätzung (eigene Einordnung, nicht quellenbelegt):

| Feature | Risiko | Maßnahme |
|---|---|---|
| Ranglisten/Leaderboards (schnellste Reinigung, Pünktlichkeit) | hoch | weglassen; stattdessen Team-Ziele oder nur freiwilliges, nicht vergleichendes Lob |
| Anerkennung/Badges ohne Ranking | niedrig bis mittel | Zweck und Sichtbarkeit festlegen |
| Quiz-/Lernergebnisse je Person | mittel | nur bestanden/Datum speichern |
| GPS/Geofence-Stempeln | hoch (Verhältnismäßigkeit, § 26 BDSG) | QR/NFC am Objekt statt Dauer-Ortung; Standort nur beim Stempeln, nie im Hintergrund |
| Foto-Nachweise | mittel | Objektfotos ohne Personen; Zweck, Löschfrist |
| Chat | mittel (Kommunikationsdaten, Übersetzung via Drittanbieter) | AVV, EU-Hosting, Löschfristen, private Nutzung klären |
| Push/WhatsApp außerhalb Arbeitszeit | mittel | keine Antwortpflicht, Ruhezeiten |
| Pulse-Checks | mittel | anonym, Mindest-Gruppengröße |
| EWA/Vorschuss | rechtlich offen | nicht recherchiert |

### Inferences
- Reinigungsbetriebe mit vielen Minijobbern haben oft keinen Betriebsrat; die DSGVO-/BDSG-Pflichten (Transparenz, Zweckbindung, Löschkonzept, ggf. AVV) gelten trotzdem. Bei bestehendem Betriebsrat ist eine Muster-Betriebsvereinbarung als Verkaufsargument plausibel.

### Gaps
- Keine Entscheidung zu Gamification-Rankings gefunden; kein DSGVO-Aufsichtsbehörden-Papier zu Geofencing/Mitarbeiter-Apps ausgewertet; Rechtsprechung (BAG) nicht im Volltext gelesen.

## Verbleibende Lücken (gesamt)
- Primärquellen für Deputy, Homebase, 7shifts, Branch, Workstream, Shiftsmart, Mendato, PlanD, Quinyx, Staffbase, Zeitgold, Crew nicht geprüft.
- Gesperrt/nicht abrufbar: Böckler-PDF (404), Ipsos-MORI-Report (404), Las Vegas Sun/Forrester-TEI (402), NBER-PDF (unlesbar).
