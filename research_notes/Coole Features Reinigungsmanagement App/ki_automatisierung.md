# KI- und Automatisierungs-Features in Reinigungs-/FM-/Field-Service-Software (Stand 2026-11) - Eignung für eine schlanke Verwaltungs-Web-App

Hinweis zur Methode: ca. 15 Tool-Aufrufe. Aussagen stammen aus Herstellerseiten bzw. Suchzusammenfassungen; wo nur eine Suchzusammenfassung vorlag, ist das vermerkt. Bereits in der Vorstudie (Konkurrenz Featurekatalog Reinigungssoftware.md) belegte Punkte (Mendato-Raumbuch, KleanApp-Nacharbeitsticket, Tarif-Wizard PlanD usw.) werden nur ergänzt, nicht wiederholt.

## 1. Welche KI-Funktionen gibt es bereits in Produkten?

### Takeaway
Die Reinigungs-Spezialisten (Mendato, KleanApp, PlanD) haben 2025/26 KI vor allem als (a) Dokument-/Foto-Extraktion mit Pflicht-Review, (b) Chat/MCP-Zugang zu den eigenen Daten und (c) Telefon-/E-Mail-Assistenz eingeführt. Die großen Field-Service-Anbieter (Jobber, Housecall Pro, ServiceTitan, Zuper, Simpro) setzen auf KI-Rezeption, Zusammenfassungen und Copilot-Chat. Quantifizierte, unabhängig belegte Wirkung ist fast nirgends vorhanden.

### Cited Findings
**Reinigungs-Spezialisten (DE)**
- Mendato KI-Seite listet 7 Use Cases plus MCP: (1) Kalkulation aus Grundriss-Foto + Leistungsverzeichnis (legt Kunde, Objekt, Räume an, liest Frequenzen, rechnet Personenstunden/Monat), (2) LV -> Schichten (Tagesschichten mit Zeiten, Räumen, Aufgaben, sichtbar in der Mitarbeiter-App), (3) Stundenzettel-Foto lesen, (4) Angebot aus Ausschreibung (GAEB-Datei; Sprachmemo oder Skizze als Basis möglich), (5) Neumitarbeiter-Anlage aus hochgeladenen Unterlagen (Personalbogen, Ausweis, Vertrag, Zeugnisse), (6) Aufenthaltstitel-Erfassung mit Ablauf-Frist und Erinnerung, (7) Mülltonnen-Abfuhrplan -> Schichten. Jeweils "Nothing counts unchecked" (Prüfung durch Nutzer). Keine Zahlen zu Genauigkeit/Zeitersparnis. MCP-Anbindung (Claude/ChatGPT) ist in Pro Plus enthalten. Datenschutz: Seite nennt "GDPR-compliant, GoBD, Made in Germany", aber keinen Modellanbieter, Hosting-Ort oder Auftragsverarbeitung für die KI-Funktionen - [Mendato KI](https://www.mendato.com/en/ki)
- Mendato Stundenzettel-Foto: KI erkennt Datum, Zeiten, Pausen, Mitarbeiter (Personalnummer/Name); erkannte Einträge werden geprüft und bestätigt, nur bestätigte fließen in die Lohnabrechnung; gedacht für Betriebe mit Papier - [Mendato Hilfe](https://help.mendato.com/en/articles/15255570-capture-timesheets-via-photo-ai-recognition) (über Suchzusammenfassung; Vorstudie führt das Feature als BETA)
- KleanApp (Funktionsseite, fetch erfolgreich): eigener MCP-Server, über den ChatGPT/Claude die KleanApp-Daten abfragen; Zugriff über persönlichen Login mit denselben Rechten, optional nur lesend; Lizenz nach Nutzerzahl gestaffelt. Eingebaute KI-Tools: KI-Auswertung der Zeiterfassung (Anomalien, mögliche Arbeitszeitverstöße, fehlende Pausendokumentation), KI-Auswertung des Dienstplans (Konflikte, ungleiche Verteilung), KI-Auswertung der Lohnvorbereitung (Plausibilität: auffällig hohe Tagesstunden, doppelte Einträge, Zuschläge ohne Basiseintrag), KI-Zusammenfassung von Tickets, KI-Objekt-Briefing (Stammdaten, Qualitätstrend, offene Tickets, Kommunikation, Einsätze der nächsten 14 Tage). Governance laut Seite: nur Mandantendaten, Rechte respektiert, ändern keine Daten, pro Mandant einzeln aktivierbar, Token-Nutzung wird protokolliert - [KleanApp Funktionen](https://www.kleanapp.net/de/Home/Functions)
- KleanApp ohne KI (regelbasierte Automatik, deshalb gut nachbaubar): schlechte Bewertung erzeugt Nacharbeitsticket + Nachkontrolle; Zufallsstichprobe nach DIN 2859-1; Echtzeit-Warnung bei Nichterscheinen oder Scan außerhalb des Objekts; E-Mail-Import -> Ticket mit Zuordnung zu Objekt/Personal; Führerscheinkontrolle mit automatischem Folgetermin; Arbeitsscheine als PDF automatisch an Rechnung; fällige Tickets/Kontrollen automatisch im Kalender mit Push - [KleanApp Funktionen](https://www.kleanapp.net/de/Home/Functions)
- KleanApp-Übernahme durch zvoove (Pressemeldung 31.03.2026): Ziel "KI-gestütztes Ökosystem für die Reinigungsbranche" (Absichtserklärung, kein Feature) - [PR Newswire](https://prnewswire.com/de/pressemitteilungen/zvoove-group-ubernimmt-kleanapp-302728607.html) (Zusammenfassung via Suche)
- PlanD "Paula": Hilfecenter nennt 5 Artikel: KI-Telefonassistentin (nimmt Anrufe an, erfasst Infos, legt automatisch Aufgaben in PlanD an), KI-Assistentin im Dashboard/App, E-Mail-Anbindung (Postfach verbinden), "Prompts gezielt einsetzen" (Einsatzplanung, Berichte, Kundenkommunikation), Einsatzmöglichkeiten für Objektleiter. Keine Angaben zu Grenzen, Preis, Datenschutz - [PlanD Hilfe Paula](https://help.pland.app/de/collections/1435865-paula). Messe-Listing beschreibt Paula als mehrsprachigen Sprach-/Chat-Assistenten, der PlanD-Abläufe freihändig ausführt (Ticket anlegen, Personal disponieren) - [InterClean-Listing](https://www.intercleanshow.com/amsterdam/exhibitor-list/pland-the-all-in-one-software-for-cleaning-businesses/products/ai-assistant-paula)
- PlanD-Fallstudie Oelfke: Inhaberin berichtet, Telefon klingele nur noch halb so oft - [PlanD Success Story](https://pland.app/en/success-stories/how-oelfkes-phone-now-rings-only-half-as-often-as-before) (nur Suchzusammenfassung; direkter Abruf der URL lieferte 404; Eigenwerbung, Einzelfall, ohne Methode). Ein Trustpilot-Rezensent lobt den Assistenten (Suchzusammenfassung, nicht verifiziert) - [Trustpilot](https://fr-be.trustpilot.com/review/pland.app)
- HERO (Handwerker, Branchennähe): KI-Telefonassistentin "HERO Voice" (nimmt Anrufe an, beantwortet Fragen, legt Aufgaben an), "HERO Copilot" (Automatisierung wiederkehrender Prozesse wie Mails, Aufgaben, Termine), in Vorschau-Listing "HERO Command" (KI-Angebotserstellung) und "HERO Report" (KI-Baudokumentation). Preise/Paketzuordnung widersprüchlich zwischen Quellen (z. B. Plus 299 EUR/Monat mit Copilot (14 Automationen) und Voice 150 Min; HERO-Preisseite: Copilot 59 EUR/Nutzer + 39 EUR/Account) - [Handwerksblatt](https://www.handwerksblatt.de/betriebsfuehrung/ki-soll-den-bueroalltag-im-handwerk-erleichtern), [KI-Syndikat](https://www.ki-syndikat.de/tools/hero-software/), [HERO Pricing](https://hero-software.de/pricing). Hinweis: Eine Sprachnachricht-zu-Angebot-Funktion bei HERO konnte nicht bestätigt werden.

**Field-Service-Anbieter (international)**
- Jobber (Feature-Seite): Custom Report Builder (Prompt -> Bericht aus Live-Daten), Automations (Jobber lernt Nutzungsmuster und schlägt Automationen für Follow-ups, Angebotsentwurf, High-Value-Alarm vor), Rewrite (Entwurf -> professionelle Nachricht), AI Receptionist (Anrufe/SMS, Termine, Anfragen, Nachrichten in vom Nutzer gesetzten Grenzen), Voice ("100+ Aufgaben freihändig" in der Mobile-App), Recommendations-Chat. Auf der Seite kein "Copilot"-Name, keine Plan-Zuordnung, keine quantifizierten Wirkungsangaben; einziges Testimonial ohne Zahlen. Kennzahlen: 4,8 (460+ G2-Reviews) - [Jobber AI](https://www.getjobber.com/features/put-ai-to-work/). Receptionist erzeugt aus einer Reinigungs-Anfrage eine Work Request; Quote-Automationen (Auto-Entwurf, High-Value-Alarm) laut Suchzusammenfassung für Connect/Grow/Plus - [Jobber AI Receptionist](https://www.getjobber.com/ai-receptionist/). Foto-basiertes Schätzen bei Jobber nicht belegt; die Gegenbehauptung stammt von einem Konkurrenten (QuoteIQ) - [QuoteIQ](https://myquoteiq.com/?p=21010).
- Housecall Pro "AI Team": CSR AI nimmt jeden Anruf an, bucht Jobs, deckt Nächte/Wochenenden; optionales Add-on, übrige AI-Team-Mitglieder im Basisaccount; Anruflog und Dashboard im Inbox; Demo ohne Abo möglich. Die oft zitierten "+35 % Umsatz" beziehen sich auf die Plattform allgemein, nicht auf CSR AI. Keine unabhängigen Leistungsdaten gefunden - [HCP AI Team](https://www.housecallpro.com/features/ai-team/), [HCP Hilfe CSR AI](https://help.housecallpro.com/en/articles/9740104-csr-ai-overview)
- ServiceTitan Atlas (Start Sept. 2025): Chat/Sprache (Berichte, unverkaufte Angebote finden, Techniker disponieren, "liegt der Monat im Plan?"), liest Dispatch-Board und nutzt Auslastung, Saisonalität, Wetter für Marketing-Empfehlungen und passt Marketing-Budget automatisch an, scannt Technikernotizen nach Ersatzgeschäft-Signalen und legt CRM-Opportunities an, Voice-Agent-Buchung ohne Mensch. Einziges Kundenbeispiel: ca. 30 % der Buchungen eines Betriebs laufen ohne menschliches Zutun. Zahlen sind Herstellerangaben, ohne Genauigkeits-/Preisangabe. Hilfe warnt, Atlas sei generative KI und könne falsche oder veraltete Antworten liefern; einige Funktionen "coming soon"/Early Access (Drittbewertung) - [ServiceTitan Blog](https://www.servicetitan.com/blog/automation-atlas-ai), [ServiceTitan Hilfe](https://help.servicetitan.com/residential-s-r/docs/atlas-field-mobile-guide-features-and-navigation-in-servicetitan-max), [SiliconANGLE 18.09.2025](https://siliconangle.com/2025/09/18/servicetitan-launches-atlas-ai-sidekick-automate-contractor-operations/)
- Zuper AI (Start 28.07.2025): Expense Scanner (Belegfoto -> Positionen am Job), Voice Notes (Diktat, Korrektur, Übersetzung), Job Walkthrough (Fotos + Erzählung -> strukturierte Zusammenfassung), Job Summary, Call Summary (Anruf-Transkript -> Aufgaben), Responder (24/7 Kundenfragen/Terminstatus aus Live-Jobdaten); in Core/Premium für Neukunden ohne Aufpreis. Wirkung nur qualitativ ("von Stunden auf Minuten") - [Zuper Blog](https://www.zuper.co/blog/how-zuper-ai-transforms-the-way-teams-work), [BusinessWire 28.07.2025](https://www.businesswire.com/news/home/20250728446307/en/Zuper-Introduces-Zuper-AI-The-Next-Leap-in-Field-Service-Intelligence)
- Simpro "RAIN" (Meldung Juli 2026): "100+ KI-Verbesserungen" über Simpro/AroFlo/BigChange, für Lightning-Bestandskunden ohne Aufpreis - [CFOtech](https://cfotech.com.au/story/simpro-launches-rain-with-ai-tools-for-field-service) (nur Suchzusammenfassung; Marketing-Zahl). Joblogic bewirbt "AI-powered" (Engineer-Matching, Audit-Records) nur auf Vergleichsseite - [Joblogic vs Simpro](https://www.joblogic.com/joblogicvssimpro).
- Janitorial-spezifisch (US): CleanSlate AI "Shift Coordinator" (Schichtbestätigung, Ausfall-Ersatz, GPS-Stempeln) nur als Listing - [Software Advice](https://www.softwareadvice.com/janitorial/?page=3); Fieldproxy: "lernt aus Dienstplänen, sagt Personalbedarf voraus" nur Eigenwerbung - [Fieldproxy Blog](https://www.fieldproxy.ai/blog/cleaning-staff-scheduling-software).
- Voice-Agent-Marketing für Reiniger: [Famulor Field Guide 2026](https://www.famulor.io/de/blog/ai-voice-agent-for-cleaning-companies-2026-field-guide) (Anbieter-Blog, nicht geprüft).

### Inferences
- Das häufigste und am besten belegte Muster ist "KI liest/entwirft, Mensch bestätigt" (Mendato: "Nothing counts unchecked"). Das ist auch das datenschutz- und haftungsseitig tragfähige Muster.
- KleanApps Ansatz (KI-Tools ändern keine Daten, einzeln pro Mandant schaltbar, Token-Logging) ist ein übertragbares Governance-Vorbild.
- Zuper/Mendato-Features (Voice-Note -> Bericht, Belegscan) sind mit LLM-API ohne eigenes Training machbar.

### Gaps
- Churn-/Abwanderungsvorhersage, Krankheitsausfall-Prognose, Preisgefährdung: in Reinigungs-/FM-Produkten kein belegtes Feature gefunden (Suche nur generische Attendance-/Scheduling-Marketing-Texte). Behandle als Hype/nicht belegt.
- Housecall-Pro-"AI Team"-Details außer CSR AI, Hero-Copilot-Funktionsliste, Fieldproxy-, Simpro- und Joblogic-Featuredetails: nur Marketing-Zusammenfassungen, nicht im Volltext geprüft.
- Unabhängige Tests/Fallstudien zu Genauigkeit der Stundenzettel-OCR, Grundrisserkennung oder Paula: nicht gefunden.
- Nicht abgerufen/gesperrt: PlanD-Success-Story (404 beim Direktabruf), PR-Newswire-Seiten (nur via Suche).

## 2. Automations-Muster (Wenn-Dann, Trigger/Aktion, Webhooks, Zapier/Make)

### Takeaway
Üblich sind (a) native, vorgefertigte Automationen für Angebots-/Rechnungs-Follow-up und Bewertungsanfragen (Jobber), (b) Statusereignis -> Aufgabe/Ticket/Kalender (KleanApp), (c) Zapier-Trigger auf Kunde/Anfrage/Angebot/Rechnung/Job-Abschluss. Eigene freie Regel-Engines sind selten; "KI schlägt Automationen vor" (Jobber) ist neu.

### Cited Findings
- Jobber native Automationen: Bewertungsanfragen, Angebots- und Rechnungs-Follow-ups, Custom-Builder für Kunden-Follow-ups und Tagging - [Jobber Automations](https://www.getjobber.com/features/automations/)
- Jobber + Zapier-Trigger: neuer Kunde/Work Request, Angebot erstellt/genehmigt, Rechnung erstellt; Beispiele: Job abgeschlossen -> Umfrage (SurveyMonkey), Rechnung gesendet -> Zeile in Google Sheets; Drittanbieter-Aktion "Review-Request senden" - [Jobber Zapier-Ideen](https://www.getjobber.com/academy/best-jobber-zapier-integrations/), [Zapier ReviewNudger](https://zapier.com/apps/reviewnudger/integrations/jobber). Die Zahl "42 % weniger manuelle E-Mails" eines Zapier-Beratungsblogs ist unbelegt und Marketing - [GrowwStacks](https://growwstacks.com/blog/automate-email-jobber-zapier)
- KleanApp-Regeln (siehe oben): schlechte Note -> Nacharbeitsticket -> Nachkontrolle; Führerschein -> Folgetermin + Erinnerung; Nichterscheinen -> Alarm; E-Mail -> Ticket - [KleanApp](https://www.kleanapp.net/de/Home/Functions)
- Mendato: Aufenthaltstitel/Dokument-Ablauf -> Frist + Erinnerung - [Mendato KI](https://www.mendato.com/en/ki)
- HERO Copilot: "14 Automationen" im Plus-Paket (Anzahl laut Drittquelle, Inhalte nicht verifiziert) - [fuer-gruender.de/KI-Syndikat via Suche](https://www.ki-syndikat.de/tools/hero-software/)
- ServiceTitan Atlas: Board leer -> Kampagne starten; Board voll -> Budget zurücknehmen; Technikernotiz "Ersatz" -> CRM-Opportunity - [ServiceTitan Blog](https://www.servicetitan.com/blog/automation-atlas-ai)

### Inferences
- Eine kleine Regelmenge (Trigger: Mangel mit Note < X, Dokument läuft ab in N Tagen, Angebot N Tage unbeantwortet, Rechnung N Tage überfällig, Einsatz ohne Ausführer in 48 h; Aktion: Aufgabe/Wiedervorlage/Hinweis im Dashboard) deckt den Großteil der beworbenen Beispiele ab, ohne Mailversand.
- Webhooks/Zapier-Schnittstelle ist für eine schlanke interne App nachrangig.

### Gaps
- Konkrete Make-/n8n-Beispiele für Reinigungssoftware: nicht gefunden. PlanD/Mendato-Webhooks: nicht verifiziert.

## 3. Belastbarkeit der Versprechen (Marketing-Bias)

### Takeaway
Praktisch alle Wirkungsangaben sind Herstellerangaben; belastbare Zahlen sind selten und meist Einzelfälle. Ehrlichste Quellen sind Hilfeartikel mit Einschränkungen (ServiceTitan-Warnhinweis, Mendato "Nothing counts unchecked").

### Cited Findings
- ServiceTitan: "30 % Buchungen ohne Mensch" ist ein einzelnes Kundenzitat im Herstellerblog; Plattformzahlen ($62 Mrd. GTV, 21 % Umsatz) beziehen sich nicht auf Atlas - [ServiceTitan Blog](https://www.servicetitan.com/blog/automation-atlas-ai)
- Housecall Pro: "+35 % Umsatz" nicht CSR-AI-spezifisch - [HCP Updates](https://www.housecallpro.com/?p=53833)
- Jobber: keine Wirkungszahlen auf der KI-Seite, nur Reichweitenzahlen - [Jobber AI](https://www.getjobber.com/features/put-ai-to-work/)
- Mendato: "über 500 Reinigungsunternehmen", keine Genauigkeitswerte - [Mendato KI](https://www.mendato.com/en/ki)
- PlanD Paula: "Telefon klingelt halb so oft" Einzelfall - [PlanD Success Story](https://pland.app/en/success-stories/how-oelfkes-phone-now-rings-only-half-as-often-as-before)
- Zuper: nur qualitative Aussagen - [Zuper Blog](https://www.zuper.co/blog/how-zuper-ai-transforms-the-way-teams-work)
- Mendato-Preise widersprüchlich zwischen OMR-Review (199 EUR bis 30 Kräfte) und Herstellerseite (99 EUR bis 15 Kräfte) - [Mendato Preise](https://www.mendato.com/en/preise)

### Inferences
- Realismus-Einstufung unten beruht auf Funktionsbeschreibung + technischer Plausibilität, nicht auf gemessener Wirkung.
- Hype-Verdacht: Churn-/Krankheits-Vorhersage, "autonome" Disposition, Marketing-Budget-Autopilot.

### Gaps
- Unabhängige Tests (Stiftung Warentest, Fachmedien, Reddit/HN-Erfahrungsberichte) zu diesen Features: keine gefunden.

## 4. Machbarkeit in einer Web-App ohne eigenes Training und Datenschutz

### Takeaway
Mit LLM-API (Strukturierte Extraktion, Zusammenfassung, Textentwurf) plus Regeln lassen sich die meisten "coolen" Features bauen; Vorhersagemodelle und Telefonie nicht sinnvoll. Kritisch ist alles mit Personenbezug Beschäftigter.

### Cited Findings (Recht, nur allgemein belegt)
- § 26 BDSG und Art. 88 DSGVO regeln Beschäftigtendatenschutz; § 87 Abs. 1 Nr. 6 BetrVG: Mitbestimmung bei technischen Einrichtungen, die Verhalten/Leistung überwachen können; § 90 BetrVG Informationsrechte; DSFA nach Art. 35 DSGVO bei vielen HR-KI-Anwendungen; KI im Beschäftigungskontext (Leistungsbewertung usw.) oft Hochrisiko nach EU-KI-Verordnung - [Betriebsrat.de](https://www.betriebsrat.de/fachartikel/datenschutz/datenschutz-im-betrieb-das-wichtigste-auf-einen-blick-3122798), [Der Betrieb](https://der-betrieb.de/meldungen/ki-im-betrieb-datenschutz-und-mitbestimmung), [Norton Rose Fulbright](https://www.nortonrosefulbright.com/de-de/wissen/publications/726b1966/nrf--innovation-ai-and-legal-tech-in-employment-law) (Fachbeiträge/Suchzusammenfassungen, keine Rechtsberatung)
- Mendato nennt für KI keinen Modellanbieter/Hosting - [Mendato KI](https://www.mendato.com/en/ki); KleanApp nennt Mandantentrennung, Berechtigungen, Token-Log - [KleanApp](https://www.kleanapp.net/de/Home/Functions)

### Inferences (eigene Einschätzung)
- Bei LLM-API: Auftragsverarbeitungsvertrag, EU-Region, keine Trainingsnutzung, Minimierung (Namen/Personalnummern pseudonymisieren), Hinweis in Datenschutzerklärung.
- Ausweis-/Aufenthaltstitel-Scan (Mendato-Muster) berührt besonders schützenswerte Daten bzw. Ausweisdokumente: für kleine App nicht empfohlen.
- Personenbezogene KI-Auswertung von Zeiterfassung/Dienstplan (KleanApp-Muster) = Leistungs-/Verhaltenskontrolle; bei Betrieben mit Betriebsrat mitbestimmungspflichtig. Besser objekt- statt personenbezogen und nur Plausibilität ohne Bewertung. Art.-22-DSGVO-Aussagen konnten nicht belegt werden (Gap): keine automatisierten Entscheidungen über Beschäftigte, immer Mensch bestätigt.

### Gaps
- Keine BAG-/Aufsichtsbehörden-Quelle zu Art. 22 DSGVO im Arbeitsverhältnis gefunden; juristische Prüfung nötig.

---
## Feature-Katalog (Tabelle)

Realismus = Produktivreife nach Quellenlage (hoch/mittel/niedrig; nicht unabhängig getestet). Aufwand = für schlanke Web-App mit LLM-API + Regeln.

| Feature | Produkt | Beleg-URL | Workflow | Realismus | Aufwand |
|---|---|---|---|---|---|
| Stundenzettel-Foto -> Zeiteinträge (Review-Pflicht) | Mendato | https://help.mendato.com/en/articles/15255570-capture-timesheets-via-photo-ai-recognition | Foto -> Vision-LLM -> Vorschlagsliste -> Büro bestätigt -> Zeitdatensatz | mittel (Beta lt. Vorstudie, handschriftliche Qualität unbelegt) | mittel |
| Grundriss/LV -> Raumbuch + Personenstunden | Mendato | https://www.mendato.com/en/ki | Upload -> KI legt Räume/Frequenzen an -> Prüfung | mittel | groß |
| LV (PDF/Foto) -> Räume zuordnen | Mendato | https://www.mendato.com/en/modul/leistungsverzeichnis | Upload -> Zuordnung -> Nutzer prüft | mittel | mittel |
| Angebot aus GAEB/Sprachmemo/Skizze | Mendato, HERO Command (Vorschau) | https://www.mendato.com/en/ki | Eingabe -> Positionsentwurf -> Prüfung | niedrig-mittel (HERO nur Vorschau-Listing) | mittel (Sprachmemo -> Positionen) / groß (GAEB) |
| LV -> Tagesschichten/Checklisten | Mendato | https://www.mendato.com/en/ki | Digitales LV -> Schichten mit Räumen/Aufgaben | mittel | mittel (regelbasiert reicht) |
| Mülltonnen-Abfuhrplan -> Schichten | Mendato | https://www.mendato.com/en/ki | Plan hochladen -> Schichten pro Objekt | mittel | mittel |
| Mitarbeiter anlegen aus Unterlagen | Mendato | https://www.mendato.com/en/ki | Upload Personalbogen/Ausweis -> Stammdaten | mittel | mittel; Datenschutz heikel |
| Aufenthaltstitel -> Frist + Erinnerung | Mendato | https://www.mendato.com/en/ki | Dokument -> Ablaufdatum -> Erinnerung | mittel | klein-mittel (Datum manuell + Ampel klein); Datenschutz heikel |
| MCP-/Chat-Anbindung an eigene Daten (Chat-with-your-data) | KleanApp, Mendato | https://www.kleanapp.net/de/Home/Functions | Nutzer koppelt Claude/ChatGPT per Login, read-only wählbar | mittel-hoch (Anbieterangabe) | mittel (MCP-Server mit Read-only-Token); Alternative: In-App-Chat mit Tool-Calls: groß |
| KI-Objekt-Briefing (Stammdaten, Qualität, Tickets, nächste 14 Tage) | KleanApp | https://www.kleanapp.net/de/Home/Functions | Klick -> Zusammenfassung aus Objektdaten | hoch (reine Zusammenfassung) | klein |
| KI-Ticket-/Verlaufs-Zusammenfassung mit offenen Punkten/Risiken | KleanApp, Zuper (Job Summary) | https://www.kleanapp.net/de/Home/Functions | Ticketverlauf -> Summary | hoch | klein |
| Plausibilitätsprüfung Lohnvorbereitung (hohe Tagesstunden, Dubletten, Zuschlag ohne Basis) | KleanApp | https://www.kleanapp.net/de/Home/Functions | Zeitraum wählen -> Auffälligkeiten | hoch (Regeln genügen) | klein (Regeln) |
| KI-Auswertung Zeiterfassung (Pausenverstöße) | KleanApp | https://www.kleanapp.net/de/Home/Functions | Zeitraum -> Anomalien | mittel; Mitbestimmung/Beschäftigtendaten | klein (Regeln ArbZG-Pausen) |
| KI-Dienstplan-Konflikt/Verteilungsanalyse | KleanApp | https://www.kleanapp.net/de/Home/Functions | Plan + Abwesenheiten -> Konflikte/Imbalancen | mittel | klein-mittel (Regeln) |
| Auto-Nacharbeitsticket + Nachkontrolle bei schlechter Note | KleanApp | https://www.kleanapp.net/de/Home/Functions | Bewertung < Schwelle -> Ticket -> Folgekontrolle | hoch (Regel, keine KI) | klein |
| E-Mail -> Ticket (mit Objektzuordnung) | KleanApp, PlanD (E-Mail-Anbindung) | https://www.kleanapp.net/de/Home/Functions | Postfach/Weiterleitung -> LLM extrahiert Objekt/Kategorie -> Ticketentwurf | mittel-hoch | mittel (Inbound-Mail-Endpunkt) |
| KI-Telefonassistentin (Anrufe -> Aufgaben) | PlanD Paula, HERO Voice, Jobber Receptionist, Housecall Pro CSR AI | https://help.pland.app/de/collections/1435865-paula | Anruf -> Sprach-Agent -> Aufgabe/Termin | mittel (Einzelfall-Fallstudie, Preise unklar) | groß (Telefonie, Latenz, Aufzeichnungs-Einwilligung) - nicht empfohlen |
| Dashboard-/Chat-Assistent mit Prompts (Disposition, Berichte, Kundentexte) | PlanD Paula, Jobber Recommendations, ServiceTitan Atlas | https://help.pland.app/de/collections/1435865-paula | Prompt -> Antwort/Aktion | mittel (Atlas-Hinweis: kann falsch liegen) | mittel (read-only Q&A) / groß (Aktionen) |
| Voice-Notiz -> Bericht/Checkliste (mehrsprachig) | Zuper Voice Notes, Jobber Voice | https://www.zuper.co/blog/how-zuper-ai-transforms-the-way-teams-work | Diktat -> Transkript -> strukturierte Notiz/Übersetzung | hoch | klein-mittel (Browser-Diktat + LLM) |
| Belegfoto -> Kosten am Auftrag | Zuper Expense Scanner | https://www.zuper.co/blog/how-zuper-ai-transforms-the-way-teams-work | Foto -> Positionen -> Auftrag | mittel-hoch | mittel |
| Rechnungs-/Vertrags-/Bescheinigungs-OCR | Zuper (Belege), Mendato (Dokumente) | https://www.mendato.com/en/ki | Upload -> Feldextraktion -> Review | hoch (Standard-OCR+LLM) | mittel |
| Textverbesserung Kundennachricht ("Rewrite") | Jobber | https://www.getjobber.com/features/put-ai-to-work/ | Entwurf -> Klick -> besserer Text | hoch | klein |
| KI-Berichtsbuilder (Prompt -> Report) | Jobber | https://www.getjobber.com/features/put-ai-to-work/ | Prompt -> Bericht/Grafik | mittel | mittel-groß |
| KI-vorgeschlagene Automationen | Jobber | https://www.getjobber.com/features/put-ai-to-work/ | Nutzungsmuster -> Regelvorschlag | niedrig-mittel (unbelegt, Details fehlen) | groß |
| Angebots-/Rechnungs-Follow-up automatisch | Jobber | https://www.getjobber.com/features/automations/ | Angebot N Tage offen -> Erinnerung/Mail | hoch | klein (Wiedervorlage) |
| Bewertungsanfrage nach Auftrag | Jobber (+Zapier) | https://www.getjobber.com/academy/best-jobber-zapier-integrations/ | Job fertig -> Anfrage | hoch | klein (für B2B-Gebäudereinigung geringer Nutzen) |
| Zapier/Webhook-Trigger (Kunde/Angebot/Rechnung/Job fertig) | Jobber | https://help.getjobber.com/es/articles/jobber-and-zapier-integration/ | Ereignis -> externer Flow | hoch | mittel |
| Echtzeit-Alarm Nichterscheinen / Scan außerhalb | KleanApp | https://www.kleanapp.net/de/Home/Functions | Soll-Einsatz ohne Stempel -> Warnung | hoch, aber Überwachungsthema | groß (nur mit App-Stempeln) |
| Dokumenten-Ablauf-Erinnerung (Führerschein etc.) | KleanApp | https://www.kleanapp.net/de/Home/Functions | Gültig-bis -> Ampel/Aufgabe | hoch | klein |
| Marketing-Autopilot nach Auslastung; Ersatzgeschäft-Signale aus Notizen | ServiceTitan Atlas | https://www.servicetitan.com/blog/automation-atlas-ai | Board/Notizen -> Kampagne/Opportunity | niedrig-mittel (Herstellerzitat) | groß; für Gebäudereiniger kaum relevant (Analogie: Zusatzleistungs-Hinweise aus Notizen, klein) |
| Churn-/Abwanderungs-, Krankheitsausfall-, Preisgefährdungs-Prognose | in Reinigungsprodukten nicht belegt | (keine; Suche ohne Treffer) | - | niedrig (Hype/unbelegt) | groß; als Heuristik (Ampel: Mängel-Trend, Kürzungen, Vertragsende) klein-mittel |
| Auto-Routen-/Einsatzoptimierung, Engineer-Matching | ServiceTitan Dispatch, Joblogic (Marketing), PlanD Routenvorlagen | https://help.servicetitan.com/residential-s-r/docs/atlas-field-mobile-guide-features-and-navigation-in-servicetitan-max | Skills/Ort/Kapazität -> Vorschlag | mittel | mittel (Vorschlagsliste, kein Solver) |

## Empfohlene Kandidaten für die Web-App (Inferenz, Priorität nach Nutzen/Aufwand/Risiko)
1. Objekt-Briefing und Ticket-/Verlaufs-Zusammenfassung per LLM (klein, hohes Realismus, geringes Risiko).
2. Regelbasierte Automationen: Mangel -> Nacharbeit -> Nachkontrolle, Angebot/Rechnung/Fristen-Wiedervorlagen, Plausibilitätsprüfung vor Lohnexport (klein).
3. Diktat/Sprachnotiz -> Mängelmeldung, Begehungsprotokoll, Angebotspositionen (klein-mittel).
4. Stundenzettel-Foto mit Review (mittel; Beschäftigtendaten, AVV/EU-Region klären).
5. Read-only Chat/MCP auf eigene Daten (mittel; Token pro Nutzer, Mandantentrennung).
6. E-Mail-Weiterleitung -> Ticketentwurf (mittel).
Nicht empfohlen: Telefon-Agent, personenbezogene KI-Auswertung der Arbeitszeit, Churn-/Krankheitsprognosen als KI, Ausweis-Scans.
