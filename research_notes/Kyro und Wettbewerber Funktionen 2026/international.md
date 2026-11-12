# Internationale Cleaning-/Janitorial-/Field-Service-Software als Ideengeber (Stand 2026)

Hinweis zur Methode: Alle Produktaussagen stammen von Herstellerwebseiten (= Herstellerbehauptung, nicht unabhängig geprüft). Die Seiten wurden per Abruf-Tool zusammengefasst; Preise in USD. Nicht erreichbar/ohne Inhalt: Aspire (Verbindungsfehler), Simpro (403), ServiceM8-/ZenMaid-Unterseiten teils 404, ServiceTitan-KI-Seite nur Namen ohne Beschreibung, Sweepsmart (kein belastbarer Treffer), BrightBid (ist laut Webseite eine Werbe-/Ads-Firma, kein Reinigungs-Bidding-Tool; Zuordnung in der Aufgabenstellung vermutlich falsch).

## 1. Welche 10-15 Funktionen/UX-Muster sind gut gelöst und übertragbar? Wie funktionieren sie?

### Takeaway
Am übertragbarsten sind: Angebot online annehmen/Änderung anfragen mit Anzahlung, automatische Erinnerungs-/Follow-up-Ketten, "Auf dem Weg"-Nachricht mit Mitarbeiterfoto, Inspektionsvorlagen mit Foto-Pflicht und Score, automatische Mängel-/Arbeitsauftrag-Erzeugung aus Inspektionsmängeln, QR-Scan-Nachweis vor Ort, Kunden-Portal mit Leistungsnachweis, Checklisten mit Übersetzung, KI-Textentwürfe/Zusammenfassungen, KI-Planungsvorschlag, Preismodell pro Objekt mit unbegrenzten Nutzern.

### Cited Findings

**Kundenerlebnis**
1. Online-Buchung mit Regeln: Leistungen mit Dauer und Schätzpreis, buchbare Mitarbeiter, früheste Verfügbarkeit, Pufferzeit, Einsatzgebiet und max. Fahrstrecke zwischen Terminen; System weist verfügbaren Mitarbeiter zu und sendet Bestätigung (Herstellerbehauptung) — [Jobber Features](https://www.getjobber.com/features/)
2. Angebot online: Kunde genehmigt Angebot oder bittet um Änderungen im Kundenportal ("client hub"), Betrieb wird benachrichtigt; Versand per SMS/E-Mail; Anzahlung zur Auftragssicherung möglich — [Jobber Features](https://www.getjobber.com/features/)
3. Angebot mit Bildern, optionalen Zusatzpositionen (Upsell) und Bewertungen ist erst im Jobber-Tarif "Grow" enthalten — [Jobber Pricing](https://www.getjobber.com/pricing/)
4. Erinnerungen: automatische Termin-Erinnerung per E-Mail/SMS mit Termindetails und zugewiesenem Team; Rechnungs-Follow-ups; Angebots-Follow-ups — [Jobber Features](https://www.getjobber.com/features/)
5. "On My Way"-Nachricht an den Kunden bei Anfahrt — [Housecall Pro](https://www.housecallpro.com/features/); Workiz ergänzt Foto und Kurzprofil des Technikers und informiert zugleich das Backoffice — [Workiz Features](https://www.workiz.com/features/)
6. ZenMaid: Sofort-Buchungsformular als Website-Einbettung oder Link; automatische Bestätigung/Erinnerung/"on-my-way" an Kunde, Manager und Reinigungskraft; Rechnungen mit Zahlungserinnerung, gespeicherte Karten (Stripe/Square) — [ZenMaid](https://get.zenmaid.com/)
7. Bewertung: Google-Bewertungsanfrage automatisch bei Jobabschluss/Besuch/bezahlter Rechnung; Dashboard mit KI-Antwortvorschlägen (Add-on) — [Jobber Features](https://www.getjobber.com/features/)
8. Zahlung: Online-Zahlung inkl. Trinkgeld, Karte automatisch belasten, Tap-to-Pay am Handy — [Jobber Features](https://www.getjobber.com/features/)
9. Gebrandetes Kundenportal: Angebote prüfen/unterschreiben, Rechnungen ansehen und bezahlen — [Workiz Features](https://www.workiz.com/features/)
10. Anrufmaskierung: persönliche Nummern von Mitarbeitern und Kunden bleiben verborgen — [Workiz Features](https://www.workiz.com/features/)

**Mitarbeiter-App**
11. Swept: Geofence-Ein-/Ausstempeln, GPS-Check-ins, Alarme bei Nichterscheinen/Verspätung, Soll-/Ist-Abweichungsbericht, Rentabilität je Objekt; Checklisten in 100+ Sprachen übersetzt — [Swept](https://sweptworks.com/)
12. Janitorial Manager: App "JM Connect" (Reinigungsanweisungen, Stempeln, Nachrichten mit Fotos); QR-Code-Scan "Scan4Clean" zum Leistungsnachweis und Kurzumfrage, mit der Gäste die Sauberkeit eines Raums bewerten; Herstellerangabe 2,2 Mio. Scans Okt 2024 bis Mrz 2026 (per Suchzusammenfassung, nicht auf Herstellerseite verifiziert) — [Janitorial Manager](https://www.janitorialmanager.com/)
13. Otuvy (ehemals CleanTelligent, Weiterleitung der Domain): eine App zum Ein-/Ausstempeln, Aufgaben, Echtzeit-Inspektion; "Completion Reports" und "Employee Scorecards" — [Otuvy](https://www.otuvy.com/)
14. Otuvy KI-Listen-Generator erstellt Aufgabenlisten — [Otuvy](https://www.otuvy.com/)
15. Workiz: Schritt-Checklisten je Auftragstyp zur Standardisierung und Einarbeitung — [Workiz Features](https://www.workiz.com/features/)
16. Routen: Karte der Besuche, schnellste Route, neuer Auftrag an nächstgelegenen Mitarbeiter per GPS — [Jobber Features](https://www.getjobber.com/features/)

**Qualität / Inspektionen**
17. Swept-Ablauf: (1) Vorlage je Kunde mit Prüfpunkten nach Bereich, klonbar, vorgefertigte Hausmeister-Vorlagen; (2) Vorgesetzter inspiziert mobil, bewertet Prüfpunkte, Fotos/Notizen (für kritische Punkte erzwingbar), Offline-Modus; (3) Bericht mit Zeitstempel-Fotos und Score per E-Mail, Sicherheitslink oder PDF; Verlaufs-Dashboards. Berechnung des Scores nicht erklärt. Inspektionen nur ab Paket "Optimize" — [Swept Inspektionen](https://sweptworks.com/janitorial-inspection-software)
18. Otuvy: anpassbare Bewertungsskalen/Fragen/Vorlagen, Fotos, Notizen, E-Signatur; bei Mangel wird automatisch ein Arbeitsauftrag erzeugt, nachverfolgt in zentralem Posteingang, geteilt mit Kunden, Subunternehmern und Team — [Otuvy](https://www.otuvy.com/)
19. Kundenportal, in dem Kunden selbst Berichte abrufen (Otuvy); Portal ohne Zusatzgebühr (Janitorial Manager) — [Otuvy](https://www.otuvy.com/), [Janitorial Manager](https://www.janitorialmanager.com/)
20. Unabhängige Einordnung: Reviews uneinig über Tiefe von Swerts Inspektionsfunktion (teils "basic"); Quellen oft Affiliate-Rankings — [Websuche-Ergebnis, u. a. Capterra](https://www.capterra.com/p/148615/Swept/) (nur Treffer, nicht im Detail geprüft)

**KI**
21. KI-Rezeption: nimmt Anrufe/SMS an, erfasst Anfragen, bucht in den Kalender (Jobber, 29 USD/Monat Add-on; Plus-Tarif nennt ihn) — [Jobber Features](https://www.getjobber.com/features/), [Jobber Pricing](https://www.getjobber.com/pricing/)
22. Workiz: AI Answering, AI Leads Capture (aus E-Mails), AI Call Insights (Zusammenfassungen), Genius Scheduling (Zeit und Techniker nach Verfügbarkeit, Nähe, Qualifikation, verhindert Doppelbuchung), Smart Messaging (Textentwürfe nach Kundenhistorie) — [Workiz Features](https://www.workiz.com/features/)
23. Housecall Pro "AI Team": CSR AI (Anrufe), Analyst AI und Coach AI (Auswertungen/Tipps) — [Housecall Pro](https://www.housecallpro.com/features/)
24. Connecteam: Nutzer beschreibt Bedarf in Alltagssprache, KI baut Dienstplan — [Connecteam](https://connecteam.com/features/)
25. Fergus: Assistant beantwortet Fragen zu Aufträgen/Kosten; Go Assistant: Aufträge/Zeiten per Tippen oder Sprache vor Ort aktualisieren — [Fergus](https://fergus.com/)
26. ServiceM8: "AI Writing Helper" in allen Tarifen, Office Agent ab Starter, Knowledge in Premium — [ServiceM8](https://www.servicem8.com/)
27. Estora (kleiner Anbieter): Angebot aus vorhandenen Leistungspaketen, Checklisten, Zuschlägen, Laufzeiten; Beispiel "3 Zimmer 2 Bad Endreinigung"; Foto-/Grundriss-Eingabe nicht belegt — [Estora](https://estora-www.pages.dev/cleaning)
28. Angebot aus Foto/Grundriss: keine Herstellerseite gefunden, die das belegt (siehe Gaps).

**Automationen**
29. Jobber-Automationen: Bewertungsanfragen, Angebots-/Rechnungs-Follow-ups, Besuchserinnerungen, Job-Nachfragen, Kampagnen, automatische Einplanung aus Online-Buchung; "individuelle Workflow-Automationen" ab Grow — [Jobber Features](https://www.getjobber.com/features/), [Jobber Pricing](https://www.getjobber.com/pricing/)
30. Housecall Pro: Pipeline-Automationen (Leads und Angebote zu Aufträgen) — [Housecall Pro](https://www.housecallpro.com/features/)

**Preismodelle**
31. Swept: pro Objekt, unbegrenzte Nutzer; Optimize 150, Scale 225 USD/Monat, Accelerate (>60 Objekte) individuell; 20 % Rabatt bei Jahreszahlung — [Swept](https://sweptworks.com/)
32. Jobber: Core/Connect/Grow/Plus, 1 bis 15 Nutzer; z. B. Core 49 USD ohne Bindung (29 jährlich); Zusatznutzer 29 USD; Add-ons Receptionist 29, Pipeline 49, Marketing Suite 99 — [Jobber Pricing](https://www.getjobber.com/pricing/)
33. ServiceM8: nach Auftragsmenge, unbegrenzte Nutzer (außer Free): Free 0 (30 Jobs), Starter 29 (50), Growing 79 (150), Premium 149 (500), Premium Plus 349 — [ServiceM8](https://www.servicem8.com/)
34. Fergus: ab 53 (Basic) / 75 USD (Pro) pro Nutzer/Monat, monatlich kündbar — [Fergus](https://fergus.com/)
35. Connecteam: Teams unter 10 Mitarbeitern kostenlos; Zertifizierungen SOC 2 Type 2, ISO 27001, DSGVO genannt — [Connecteam](https://connecteam.com/features/)

### Inferences
- Top-Übertragbar (Priorität für eure App, da vieles schon existiert): (a) Angebot online annehmen mit "Änderung anfragen" und optionalen Zusatzpositionen; (b) Inspektion -> automatisch Mangel/Arbeitsauftrag (ihr habt Mängel und Begehungen, Verknüpfung wäre der Gewinn); (c) Foto-Pflicht für kritische Prüfpunkte mit Zeitstempel; (d) QR-Scan am Objektraum als Anwesenheits-/Leistungsnachweis statt GPS; (e) "Mitarbeiter ist unterwegs"-Nachricht; (f) Abweichungsbericht Soll/Ist je Objekt (Rentabilität); (g) Checkliste in Übersetzung (Reinigungsteams oft mehrsprachig); (h) KI-Textentwürfe und Zusammenfassungen (Begehungsbericht, Kundenmail); (i) Pufferzeit-/Fahrstrecke-Regeln im Einsatzplan; (j) Regeln "wenn X dann Y" (z. B. Leistungsnachweis abgenommen -> Rechnungsentwurf; Frist 30 Tage -> Erinnerung); (k) Preis pro Objekt mit unbegrenzten Nutzern passt zu Reinigungsfirmen mit vielen Kräften.
- Rezeptions-KI, Google-Bewertungsmarketing und Trinkgeld sind US-Muster mit geringer Relevanz für B2B-Gebäudereinigung.

### Gaps
- Keine Herstellerbelege für KI-Angebot aus Foto/Grundriss gefunden; Aspire, Simpro, Tradify-KI, ServiceTitan-Funktionsdetails nicht abrufbar/ohne Beschreibung. Tradify: Online-Annahme nicht auf der Seite erwähnt.
- Sweepsmart nicht auffindbar; BrightBid ist ein Ads-Anbieter. Wer gemeint ist, muss geklärt werden.
- Swept-Scoring-Berechnung und Korrekturmaßnahmen nicht beschrieben.
- Kein Bildschirm-Screenshot-Detail (nur Textbeschreibung der Marketingseiten).

## 2. Was ist in Deutschland rechtlich problematisch bzw. passend?

### Takeaway
Geofence-/Live-GPS-Tracking von Mitarbeitern ist nur sehr eng zulässig und erfordert Mitbestimmung (§ 87 Abs. 1 Nr. 6 BetrVG), Verhältnismäßigkeitsprüfung und meist eine DSFA; QR-Scan oder Standort nur zum Stempelzeitpunkt sind das datensparsame Äquivalent. Mitarbeiter-Scorecards sind ebenfalls mitbestimmungs- und datenschutzrelevant.

### Cited Findings
- Bei bestehendem Betriebsrat Mitbestimmung nach § 87 Abs. 1 Nr. 6 BetrVG bei Einführung von GPS-Tracking — [dr-datenschutz.de](https://www.dr-datenschutz.de/gps-ueberwachung-am-arbeitsplatz-und-der-datenschutz/) (aus Suchzusammenfassung, Seite nicht vollständig abgerufen)
- Rechtsgrundlage meist Art. 6 Abs. 1 lit. f DSGVO; Einwilligung im Beschäftigungsverhältnis selten freiwillig; Betriebsvereinbarung ersetzt Art. 6 nicht; heimliche Ortung unzulässig, Information nach Art. 13; DSFA oft nötig; anlasslose Dauerortung kritisch; BayLDA fordert Nachweis von Eignung, Erforderlichkeit, Angemessenheit — [BayLDA zu GPS in Firmenfahrzeugen](https://www.dr-datenschutz.de/baylda-zu-gps-tracking-in-firmenfahrzeugen/) und [Hans-Böckler-Stiftung Praxis](https://www.boeckler.de/data/mbf_bvd_praxis_einsatzplanung_per_ortungssysteme.pdf) (Zusammenfassung der Suche, nicht im Volltext geprüft)
- Praxisbeispiel Betriebsrat: Ortung abschaltbar für Pausen/Feierabend, keine Ortung außerhalb der Arbeitszeit — gleiche Böckler-Quelle
- Lösch-Frist 30 Tage ist laut Ratgeber nur ein Beispiel, keine gesetzliche Frist — gleiche Quellen
- Connecteam nennt DSGVO-Konformität als Herstellerbehauptung — [Connecteam](https://connecteam.com/features/)

### Inferences (eigene Einordnung, keine Rechtsberatung)
- Nicht übertragbar ohne Anpassung: Live-GPS/Geofence-Stempeln (Swept, Jobber-Routing nach GPS-Nähe), "Late/No-show"-Alarme automatisiert, Employee Scorecards (Leistungs-/Verhaltenskontrolle, Betriebsrat), Gäste-Sauberkeitsbewertung pro Raum, wenn sie einer Person zugeordnet wird. Alternative: Standort nur einmalig beim Stempeln oder QR-Scan, Bewertung auf Objekt/Leistung statt Person beziehen.
- Zeiterfassung ist in DE ohnehin Pflicht (BAG 2022, Arbeitszeitgesetz-Reform) und Mindestlohn-/Tarifnachweise (Branchenmindestlohn Gebäudereinigung, Minijob-Grenze) sind eher ein Plus: Soll-/Ist-Abweichung und Stundenauswertung je Objekt sind übertragbar. (Diese Punkte sind nicht durch Quellen in dieser Recherche belegt.)
- Anruf-Aufzeichnung/KI-Call-Insights (Workiz) wären in DE zusätzlich nach § 201 StGB/DSGVO heikel; KI-Rezeption nur mit Hinweis/Einwilligung des Anrufers.
- Kundenfotos in Berichten: Fotos mit Personen vermeiden; Aufbewahrung begrenzen.

### Gaps
- Keine spezifischen Quellen zu Reinigungskräften, Tarifvertrag, Minijob-Regeln und Bewertung von Mitarbeitern durch Scorecards gefunden; Rechtsquellen nur über Suchzusammenfassungen, Volltexte nicht geprüft. Juristische Prüfung nötig.
