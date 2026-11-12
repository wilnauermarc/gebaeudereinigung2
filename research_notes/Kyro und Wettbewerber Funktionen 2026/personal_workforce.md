# Personal-, Schicht- und Workforce-Software für Dienstleistungsbetriebe: Ideen für eine schlanke Reinigungs-App (Stand Nov 2026, Deutschland)

Methodik-Hinweis: Nur Suchergebnis-Zusammenfassungen und wenige Seitenabrufe waren möglich (Personio-Hilfe 403/429, Glitter-Guide leer). Viele Detailfragen (Bildschirmabläufe, Signaturstufen je Anbieter, Minijob-Warnung je Anbieter) sind daher NICHT belegt und stehen unter Gaps. Herstellerangaben sind mit "(Hersteller)" markiert.

## 1. Onboarding, Verträge, Signatur, Meldungen und Fristen: wie lösen es die Anbieter konkret?

### Takeaway
Die Anbieter lösen Onboarding als Schrittfolge (Checkliste/Plan mit Zuständigen, Fristen und automatischen Erinnerungen) und Signatur als integrierte oder angebundene E-Signatur direkt im Mitarbeiterprofil. Meldewesen (DEÜV) liefert Personio nur im eigenen Payroll-Modul; reine Schicht-/Zeittools (Papershift, Staffomatic) exportieren dagegen Dateien ans Lohnbüro. Belege für konkrete Bildschirme fehlen weitgehend.

### Cited Findings
- Papershift: Onboarding-Schritte lassen sich definieren (Hersteller: "based on the job posting"), es gibt rollenbasierte Vorlagen und Checklisten; Dokumente können "for digital signature" versendet werden. Upload durch Mitarbeiter und Erinnerungen werden auf der Seite nicht erwähnt — [Papershift Onboarding](https://www.papershift.com/en/onboarding)
- Papershift beschreibt die digitale Personalakte als zentrale Datenbasis für Mitarbeiterdaten und Dokumente (Hersteller) — [Papershift Lexikon](https://www.papershift.com/en/lexicon/digitalpersonnelfile)
- Personio: Offene Onboarding-Schritte erzeugen automatisch E-Mail-Erinnerungen an die Zuständigen: 7 Tage vor Frist, 2 Tage vorher, bei Überfälligkeit täglich. Quelle ist ein Nutzerbeitrag, keine offizielle Doku — [Personio Community](https://community.personio.com/employee-data-documents-86/automatically-send-out-reminders-3252) (Inhalt laut Suchzusammenfassung)
- Personio hat eine eingebaute E-Signatur; bereits im Mitarbeiterprofil liegende Dokumente können zur Unterschrift angefordert werden, signierte Dokumente landen im Profil — [Personio Hilfe: Request electronic signatures](https://support.personio.de/hc/en-us/articles/360012724438-Request-electronic-signatures-on-employee-documents); [Übersicht E-Signatur](https://support.personio.de/hc/en-us/articles/30124907720605-Overview-of-electronic-signatures-in-Personio) (nur Titel gesehen)
- Personio-Lexikon: Fortgeschrittene Signatur kann per biometrischer Signatur oder digitalem Zertifikat erfolgen; die qualifizierte Signatur braucht Signaturkarte eines Zertifizierungsanbieters, Kartenleser und Signatursoftware — [Personio Lexikon QES](https://www.personio.com/hr-lexicon/qualified-electronic-signature/)
- Personio-Community-Thema (März 2026): automatisches Auslösen von Signaturanfragen im Onboarding wird nachgefragt; Antwort nicht gesehen — [Community](https://community.personio.com/integrations-workflows-75/subject-automating-digital-signature-requests-during-onboarding-5213)
- Personio: Dokumente Neueinsteiger-Upload vor Start ist in der Community thematisiert (Titel) — [Community](https://community.personio.de/questions-answers-about-personio-257/how-can-new-hires-upload-their-documents-in-personio-before-their-start-17419)
- Personio Payroll: DEÜV-Meldungen werden aus verarbeiteten Lohndaten automatisch erzeugt und nach Freigabe der Abrechnung automatisch übermittelt; einsehbar unter Payroll > Compliance, in Payroll-Dokumenten und im Mitarbeiterprofil. Ausnahme: Anmeldungen mit Meldegründen 10, 11, 13 ohne gültige Versicherungsnummer — [Personio Hilfe DEÜV](https://support.personio.de/hc/en-us/articles/38364170459933-DE%C3%9CV-reporting-procedure-for-social-security-in-Personio-Payroll) (nur Suchzusammenfassung, Seite 403)
- Sofortmeldung: Pflicht nach § 28a SGB IV i. V. m. § 7 DEÜV in bestimmten Branchen, spätestens bei Beschäftigungsbeginn; ersetzt die Anmeldung nicht — [Haufe](https://www.haufe.de/id/beitrag/sofortmeldung-HI524784.html)
- Zu Personio und Sofortmeldung speziell keine Doku gefunden; Lohn-Anbindung an DATEV LODAS/LuG wird in Community-Threads diskutiert — [DATEV Community](https://www.datev-community.de/t5/Personalwirtschaft/Schnittstelle-Personio-zu-LuG-und-Lodas/m-p/457589)
- Papershift/Staffomatic: Lohnintegration typischerweise über Exportdateien, nicht Lohnlauf im Tool (Vergleich); Staffomatic: Auswertungen von Schichtplänen/Arbeitszeiten als CSV/Excel — [Ordio-Vergleich (Wettbewerber, nicht neutral)](https://www.ordio.com/insights/ratgeber/schichtplanungssoftware-lohnabrechnung-vergleich); [Staffomatic](https://staffomatic.com/de/zeiterfassung?hsLang=en)
- Papershift: DATEV/LODAS-Export laut Testartikel (Affiliate-Charakter) — [Fastlancer](https://www.fastlancer.org/fastlancer-blog/papershift-review/)

### Inferences
- Ein tragfähiges Minimalmuster: Onboarding-Schritt = Titel, Zuständiger, Frist, Status; Erinnerung 7 Tage / 2 Tage / täglich überfällig. Das passt zu den bereits vorhandenen "Einstellungsschritten" der App.
- Eine Sofortmeldung kann eine kleine App nicht selbst übermitteln (zertifizierte Schnittstelle nötig); realistisch ist ein "Sofortmeldung-Checkliste-Schritt" mit Datenpaket (Name, Geburtsdatum, Versicherungsnummer/Geburtsort, Betriebsnummer, Beginn) zur Übergabe an Lohnbüro oder sv.net/Lohnprogramm.

### Gaps
- Konkrete Bildschirmabläufe bei Personio, Papershift, Sage HR, Factorial, HRworks: nicht abrufbar (Hilfeseiten blockiert).
- Welche Signaturstufe(n) Personio nativ anbietet (einfach/fortgeschritten/QES via Partner): nicht belegt.
- Ob Papershift, Staffomatic, Shiftbase, Planday, Quinyx, Zep, Clockodo, Timetac Sofortmeldung erzeugen: kein Beleg.

## 2. Welche Muster sind einfach genug für eine kleine Web-App (ohne zertifizierte Schnittstellen)?

### Takeaway
Gut machbar sind: Schritt-Checklisten mit Erinnerungen, Dokumentenablage mit Ablaufdatum und Fristenwarnung, Urlaubs-/Krankmeldung mit Freigabe, Schichttausch mit Zwei-Stufen-Bestätigung, Chat mit Auto-Übersetzung (über Übersetzungs-API), Minijob-Grenzwarnung (Rechenlogik) und CSV-Lohnexport.

### Cited Findings
- Fristen: Ordio (Wettbewerber) wirbt mit zentraler Verwaltung von Arbeitserlaubnissen, Überwachung von Ablaufdaten und revisionssicherer Archivierung (Hersteller); die Arbeitserlaubnis ist ein Vermerk im Aufenthaltstitel (eAT), kein separates Dokument — [Ordio Lexikon Arbeitserlaubnis](https://www.ordio.com/insights/lexikon/arbeitserlaubnis/)
- Rechtlich: Der Aufenthaltstitel muss die konkrete Erwerbstätigkeit erlauben; einmaliges Vorzeigen beim Onboarding reicht nicht (Kanzlei Visaguard, Anwaltsblog) — [Visaguard](https://www.visaguard.berlin/post/ausländerbeschäftigung-was-gehört-in-die-personalakte)
- Schichttausch bei Planday: drei Austauscharten (tauschen, abgeben, verkaufen); Mitarbeiter bestätigen zuerst untereinander, dann Genehmigung durch Manager — [Planday Hilfe](https://help.planday.com/en/articles/30399-open-shifts-shift-requests-and-shift-swaps)
- Planday: Offene Schichten (ohne Zuweisung), die Mitarbeiter anfragen; Arbeitszeitregeln, Vertragsstunden und Abwesenheitsregeln werden auf jeden Plan angewendet, Echtzeit-Warnungen (Hersteller) — [Planday Compliance](https://lp.planday.com/how-it-works/compliance); [Planday Open Shifts](https://help.planday.com/en/articles/30399-open-shifts-shift-requests-and-shift-swaps)
- Quinyx: Regelprüfung (Ruhezeiten, Arbeitszeit, Pausen, Tarifverträge) beim Planen; Hersteller nennt 69 konfigurierbare Regeln; Ersatzvorschläge nach Qualifikation, Verfügbarkeit, Regeln — [Quinyx Compliance](https://www.quinyx.com/resources/the-global-standard-for-workforce-compliance); [Quinyx Scheduling](https://www.quinyx.com/product/scheduling)
- Shiftbase: App in jedem Tarif enthalten; Schichttausch, offene Schichten, Urlaubsantrag mit Saldo, Ein-/Ausstempeln; Manager genehmigt Tausch-, Urlaubs- und Stundenänderungsanfragen an einer Stelle; Warnung bei Überschneidungen und Arbeitszeitgesetz (Hersteller) — [Shiftbase Mobile App](https://www.shiftbase.com/mobile-app)
- Connecteam: Chat mit automatischer Übersetzung, Lesebestätigung, rollen-/standortbasierte Gruppen (Hersteller); Checklisten mit Erinnerungen und Lesen-und-Bestätigen; Reinigungs-Vorlagen (Tages-/Wochenchecklisten, Objektkontrolle, Inventar, Uniformbestellung), GPS-Stempeluhr — [Connecteam Chat](https://connecteam.com/chat-draft-3/); [Connecteam Reinigung](https://connecteam.com/connecteam-cleaning-companies/); [Connecteam Janitorial](https://lp.connecteam.com/janitorial-software-aw)
- Factorial: Urlaubsanträge per App, Genehmigung per Klick; Dokumentenmanagement mit Berechtigungen und App-Zugriff (Hersteller) — [Factorial Funktionen](https://factorialhr.de/funktionen); [Factorial Dokumente](https://factorialhr.de/dokumente-management)
- Sage HR: Mitarbeiterportal/App, Urlaubsanträge werden automatisch an Zuständige geleitet; Krankmeldung als Self-Service-Beispiel (Hersteller) — [Sage Mitarbeiterportal](https://www.sage.com/de-de/hr-software/mitarbeiterportal/)
- Minijob 2026: Grenze 603 €/Monat, 7.236 €/Jahr; Summe aller Minijobs zählt; bei Überschreitung werden alle sozialversicherungspflichtig; 2027 steigt sie auf 633 € — [Lohnklar](https://lohnklar.de/blog/minijob-grenze-2026); [PTA-in-Love](https://www.pta-in-love.de/minijob-verdienstgrenze-ueberschritten-was-gilt) (Sekundärquellen)
- Grenze ist an den Mindestlohn gekoppelt (13,90 €/h, ca. 43,4 h/Monat, eigene Rechnung der Suche) — [Lohnklar](https://lohnklar.de/blog/minijob-grenze-2026)
- Nachweispflicht: Arbeitgeber muss Einhaltung der Grenze belegen können — [Lohnklar](https://lohnklar.de/blog/minijob-grenze-2026)
- HiBob (Hersteller): verknüpft Zeiterfassung mit Verdienstgrenze und warnt Führungskräfte in Echtzeit — [HiBob Minijob-Guide](https://www.hibob.com/de/hr-glossary/der-komplette-guide-zum-minijob-verdienstgrenzen-regeln-und-compliance/)
- Dienstplan-Auswahlkriterium aus herstellerneutralem Ratgeber: Minijob-Warnungen unabhängig vom Vertragstyp, Pausen, Ruhezeiten, getesteter Lohnexport — [Ordio Gastro-Vergleich (Wettbewerberquelle)](https://www.ordio.com/insights/ratgeber/dienstplan-software-gastronomie-vergleich)

### Inferences
- Minijob-Warnung: Soll-Verdienst aus geplanten und geleisteten Stunden x Stundenlohn je Monat, Ampel bei z. B. 80 %/100 % von 603 €, Jahressumme gegen 7.236 €; Mehrfachbeschäftigung nur per Angabe im Fragebogen prüfbar. Rein Rechenlogik, keine Schnittstelle nötig.
- Schichttausch zweistufig (Kollege bestätigt, Leitung genehmigt) und mit Prüfung gegen Verfügbarkeit/Regeln ist Branchenstandard; die App hat Schichttausch bereits, Ergänzung wäre die Regelprüfung vor Genehmigung.
- Auto-Übersetzung im Chat per externer Übersetzungs-API machbar, aber Datenschutz (Auftragsverarbeitung, Drittland) prüfen.
- Cleaning-spezifische Ideen von Connecteam: Objekt-Checklisten, Inspektionsformulare, Lesen-und-Bestätigen für Hygiene-/Arbeitsanweisungen, Uniform-/Materialbestellung.

### Gaps
- Ob Zep, Clockodo, Timetac, Staffomatic, Papershift Minijob-Grenzen tatsächlich überwachen: keine Treffer; ebenso Quellen zu Staffomatic Minijob (nur "nicht gefunden").
- Mitarbeiter-Beteiligung (Umfragen, Wünsche, Verfügbarkeitsabfragen), Push-Details, Zeitkonten-Logik (Plus/Minus-Saldo, Monatsabschluss) je Anbieter: nicht recherchiert/belegt.
- Krankmeldung-Workflow (Meldung, AU-Upload, eAU-Hinweis) je Anbieter: nur Sage-Erwähnung.

## 3. Was ist rechtlich heikel und wie gehen die Anbieter damit um (Hinweise, Disclaimer)?

### Takeaway
Heikel sind Signaturform (Schriftform bei Befristung), Ausweiskopien/Datenschutz, Aufenthaltstitel-Prüfung, Sofortmeldung und Minijob-Grenzen. Anbieter verweisen meist auf Eigenverantwortung des Arbeitgebers; konkrete Disclaimer-Texte konnten nicht belegt werden.

### Cited Findings
- Signaturform: Die meisten Arbeitsverträge lassen sich laut Anbieterartikel mit einfacher oder fortgeschrittener Signatur schließen; wo Schriftform verlangt wird, z. B. Befristung nach § 14 TzBfG, erfüllt nur die qualifizierte elektronische Signatur. Die Quelle ist ein Signaturanbieter (Hersteller-Ratgeber); Yousign behauptet dagegen, Arbeitsverträge erforderten QES — widersprüchlich, nicht ungeprüft übernehmen — [Yousign HR-Arbeitsvertrag](https://yousign.com/de-de/blog/esignatur-hr-arbeitsvertrag)
- Personio erklärt in seinem Lexikon die Stufen und die technischen Voraussetzungen der QES (siehe Abschnitt 1) — [Personio Lexikon](https://www.personio.com/hr-lexicon/qualified-electronic-signature/)
- Digitale Personalakte ist nicht für jedes Unternehmen gesetzlich vorgeschrieben; Papier/Mischformen sind möglich, solange Nachweis- und Aufbewahrungspflichten erfüllt sind (Ordio, Wettbewerber) — [Ordio Lexikon](https://www.ordio.com/insights/lexikon/digitale-personalakte/)
- Aufenthaltstitel: Arbeitserlaubnis steckt im Titel; Nebenbestimmungen entscheiden, ob Nebentätigkeit/Minijob erlaubt ist — [se-legal](https://se-legal.de/rechtsanwalt/auslaenderrecht-aufenthaltsrecht/nebentaetigkeit-mit-aufenthaltserlaubnis-wann-ist-eine-genehmigung-erforderlich/); IHK rät, Beschäftigte rechtzeitig auf Verlängerung hinzuweisen — [IHK Frankfurt](https://www.frankfurt-main.ihk.de/hauptnavigation/wirtschaftspolitik/fachkraefte-demografie-und-arbeitsmarkt/auslaendische-fachkraefte/ihre-pflichten-als-arbeitgeber-6561284)
- Personio Payroll nimmt Anmeldungen ohne gültige Versicherungsnummer (Gründe 10, 11, 13) vom Automatismus aus — [Personio Hilfe DEÜV](https://support.personio.de/hc/en-us/articles/38364170459933-DE%C3%9CV-reporting-procedure-for-social-security-in-Personio-Payroll)
- Minijob: Bei schwankendem Verdienst Zwölfmonats-Durchschnitt der Minijob-Zentrale beachten; gelegentliches Überschreiten möglich, Jahresgrenze maßgeblich (Sekundärquellen) — [Lohnklar](https://lohnklar.de/blog/minijob-grenze-2026); [PTA-in-Love](https://www.pta-in-love.de/minijob-verdienstgrenze-ueberschritten-was-gilt)
- Unabhängiger Hinweis (Suchzusammenfassung): Regelkonfigurationen zu Arbeitszeit sind länderspezifisch; Tools warnen teils nur statt zu blockieren — Planday/Quinyx-Seiten oben; Warnung-vs-Sperre vor Nutzung prüfen.

### Inferences
- Für die App sinnvoll: eigene sichtbare Hinweise "keine Rechtsberatung / keine amtliche Meldung", Signatur als "einfach (Zustimmung mit Zeit-, Nutzer-Nachweis)" kennzeichnen und bei Befristung/Schriftformfällen auf Papier oder QES-Dienst verweisen.
- Ausweiskopie: Regeln (Kopie nur wo erlaubt, Aufbewahrung begrenzen) nicht belegt — siehe Gaps; Mindestmuster: Dokument + Prüfvermerk (Person, Datum) + Ablaufdatum statt Kopie speichern, falls rechtlich ausreichend.

### Gaps
- Ausweiskopie-Regeln (DSGVO, § 8 Abs. 2 AufenthG/Aufbewahrung, Kopie vs. Prüfvermerk): keine Quelle gefunden; separat recherchieren (Datenschutzbehörden, Bundesagentur/Zoll).
- Konkrete Hersteller-Disclaimer-Texte (Personio, Papershift etc.) nicht auffindbar.
- Gesundheitszeugnis/Belehrung nach IfSG für Reinigung (relevant eher Gastronomie): nicht recherchiert.
- Betriebsrat/DSGVO-Grenzen bei Zeit-/Ortserfassung: nicht belegt.
- Anbieter Zep, Clockodo, Timetac, Staffomatic, HRworks wurden im Detail nicht belegt; Aussagen zu ihnen fehlen bewusst.
