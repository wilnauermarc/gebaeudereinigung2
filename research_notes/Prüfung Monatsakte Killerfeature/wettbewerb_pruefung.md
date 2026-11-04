# Wettbewerbsprüfung: Gibt es die „zahlungssichere Monatsakte“ (Leistungsnachweis je Objekt/Monat + Vertragsregeln + offene Reklamationen + Kunden-Gegenzeichnung + Rechnungsfreigabe) schon?

Abrufdatum aller Seiten, sofern nicht anders genannt: 2026-11-04. Methode: Seiten per WebFetch geöffnet; wo nur ein Suchtreffer-Auszug vorlag, ist das ausdrücklich vermerkt. Herstellerangaben sind als solche gekennzeichnet.

## 1. Mendato: Was bedeutet „Minderung“ genau, und was ist sonst an Nachweis/Abrechnung/Reklamation vorhanden?

### Takeaway
Mendato hat eine echte Funktion „Minderung erstellen“, aber sie ist eine manuell angelegte negative Abrechnungsposition (Menge/Betrag), keine Vertragsregel-Logik: kein Prozentsatz, keine Verknüpfung zu Reklamationen, keine Reaktionsfrist, keine Automatik. Leistungsbelege (Kundenunterschrift per App, Link oder Portal) gibt es je Einsatz und fließen bei einem Abrechnungsmodell in die Abrechnung ein; eine Monatsakte, ein Sperr-Mechanismus für die Rechnung oder eine Verbindung Reklamation → Euro-Abzug wurde nicht gefunden.

### Cited Findings
- Mendato-Hilfecenter (DE) ist in 13 Sammlungen gegliedert, u. a. „Abrechnung & Leistungsnachweise“ (32 Artikel), „Rechnungen & Buchhaltung“, „Kundenportal & Reklamationen“ (6 Artikel). — [Hilfecenter Startseite](https://intercom.help/mendato/de/) und [Sammlung Abrechnung & Leistungsnachweise](https://help.mendato.com/de/collections/19690892-abrechnung-leistungsnachweise)
- Die Sammlung „Abrechnung & Leistungsnachweise“ enthält die Artikel „Minderung erstellen“, „Minderung in Mendato Buchhaltung erstellen“ sowie sechs Artikel zu Leistungsbelegen (Übersicht, gegenzeichnen lassen, herunterladen, Vorlage, manuell, automatisch). — [Sammlung](https://help.mendato.com/de/collections/19690892-abrechnung-leistungsnachweise)
- Die drei Abrechnungstypen sind „Leistung“, „Anfahrt“, „Material“ (Modelle: einmalig, wiederholend, pro Einsatz). „Minderung“ ist KEIN Abrechnungstyp in dieser Liste, sondern eine Korrekturfunktion an einer Abrechnungsposition. (Die Vorgabe „Minderung als Abrechnungstyp“ ist nach den Hilfeseiten ungenau.) — [Übersicht: Abrechnungstypen](https://help.mendato.com/de/articles/10542198-ubersicht-abrechnungstypen); [Step 3: Define Billing Items (EN)](https://help.mendato.com/en/articles/10088426-step-3-define-billing-items)
- „Minderung erstellen“: eine Minderung ist eine Korrektur einer Abrechnungsposition, die den Betrag verringert, gedacht wenn „eine geplante oder berechnete Leistung nicht vollständig erbracht wurde oder nachträglich angepasst werden muss“ (sinngemäß, aus dem Artikel gelesen). Gilt nur für Kunden; Gutschriften sind nur für Subunternehmer. Jede Minderung erzeugt einen negativen offenen Posten, der mit der nächsten Rechnung verrechnet oder separat abgerechnet werden kann. Erstellung über das Drei-Punkte-Menü an der Abrechnungsposition, Eingabe von Menge oder Betrag. Der Artikel erwähnt keine Prozente, keine Reklamation, keine Fristen. — [Minderung erstellen](https://help.mendato.com/de/articles/10568202-minderung-erstellen)
- „Minderung in Mendato Buchhaltung erstellen“: Eingabe von Titel, optionalem Grund, Menge/Einheit, Netto-Einzelpreis, Zeitraum; wird als negativer Posten erfasst und kann mit bestehenden Rechnungen verrechnet werden. Prozent/Betrag, Reklamationsbezug und Regeln werden nicht behandelt. — [Minderung in Mendato Buchhaltung erstellen](https://help.mendato.com/de/articles/10579174-minderung-in-mendato-buchhaltung-erstellen)
- Leistungsbeleg: dokumentiert erbrachte Arbeit, Kunde bestätigt per Unterschrift, „eine Grundlage für die Abrechnung“. Belege werden pro Einsatz erstellt, kein Monatszeitraum genannt, keine Statuswerte, keine direkte Verknüpfung zur Rechnung beschrieben. — [Übersicht über Leistungsbelege](https://help.mendato.com/de/articles/10568259-ubersicht-uber-leistungsbelege)
- Gegenzeichnen: drei Wege (Operations-App vor Ort, digitaler Link per E-Mail/Nachricht, Kundenportal mit hinterlegtem Ansprechpartner). Der Artikel nennt keinen Abrechnungszeitraum und keinen Zusammenhang mit Rechnungssperre. — [Leistungsbelege gegenzeichnen lassen](https://help.mendato.com/de/articles/10568653-leistungsbelege-in-mendato-gegenzeichnen-lassen)
- Abrechnungsmodell „Pro Einsatz, dynamische Menge per Leistungsbeleg“: „Nur unterschriebene Leistungsbelege werden in die Abrechnung übernommen.“ Empfehlung im Artikel: Rechnungen erst erstellen, wenn alle Mengen per Leistungsbeleg bestätigt sind; fehlende Mengen/Unterschriften erscheinen im Dashboard als „Menge fehlt“. Ob das technisch eine Sperre ist, geht aus dem Text nicht eindeutig hervor (Empfehlung). — [Pro Einsatz, dynamische Menge per Leistungsbeleg](https://help.mendato.com/de/articles/10560638-pro-einsatz-dynamische-menge-per-leistungsbeleg)
- Portal-Alltag (EN): Operations > Service Receipts zeigt, welche Belege noch auf Kundenunterschrift warten; Erinnerung an den Kunden im Portal möglich; „Once all receipts are signed, invoices can be created faster.“ Keine Erwähnung von Minderung, Abzug oder Freigabe. — [Daily Work with the Mendato Customer Portal](https://help.mendato.com/en/articles/10631953-daily-work-with-the-mendato-customer-portal)
- Reklamationen: Kunde erfasst Reklamation mit Beschreibung und Fotos im Portal, automatisch Ticket in Mendato, Status offen/geplant/erledigt für den Kunden sichtbar. Keine Verbindung zu Rechnung, Minderung oder Abzug im Artikel. — [Digital Complaint Management (EN)](https://help.mendato.com/en/articles/11095691-digital-complaint-management-customer-portal-ticket-system)
- „Pro Einsatz – Abrechnungen erzwingen“ bedeutet Abrechnung bis zu einem Zukunftsdatum vor Periodenende zu erzeugen; Bedingung nur „Einsätze müssen vollständig sein (Menge & Zeiterfassung geprüft)“, kein Leistungsbeleg/Unterschrift erforderlich. — [Abrechnungen erzwingen](https://help.mendato.com/de/articles/10561677-pro-einsatz-abrechnungen-erzwingen)
- Mendato-Hilfecenter-Struktur (EN) zeigt weniger Artikel als die DE-Version (Sammlung „Billing & Service Receipts“ nur 1 Artikel); die deutsche Version ist die vollständigere. — [EN-Startseite](https://help.mendato.com/en/)
- Drittquelle (Suchauszug, nicht selbst geöffnet): Mendato werbe mit Kundenportal und Subunternehmer-Abrechnung mit prozentualen Splits. — [KI-Syndikat Mendato](https://www.ki-syndikat.de/tools/mendato/), [SoftGuide Mendato](https://www.softguide.de/programm/mendato/vorschau) (SoftGuide-Funktionsliste: „Leistungsabnahme“, „Automatisierte Rechnungserstellung“, „Minderung“ nicht erwähnt)

### Inferences
- Mendato deckt die Bausteine „Kunde zeichnet Einsatz-Leistungsbeleg gegen“, „Reklamation im Portal“ und „manuelle Minderung als Negativposten“ ab, aber als drei getrennte Funktionen. Die Verknüpfung (Vertragsregel → Euro-Risiko → Ampel „Rechnung kann raus“ → Monatsbestätigung) ist in der Dokumentation nicht beschrieben.
- Mendato ist der nächste Wettbewerber und wird von der Monatsakte zumindest in der Basis-Mechanik (Unterschrift gegen Abrechnung, manuelle Minderung) „vorweggenommen“.

### Gaps
- Nicht geprüft: Mendato-Demo-Videos, Release Notes, Preisliste; ob in der Produktoberfläche mehr existiert als in den Hilfeartikeln (z. B. Rechnungssperre bei fehlenden Belegen).
- Ob Mendato intern eine Sperre „keine Rechnung ohne Unterschrift“ erzwingt: Text nur als Empfehlung formuliert.

---

## 2. Deutsche Gebäudereinigungs-Software: Einzelprüfung der genannten Anbieter

### Takeaway
Bei keinem der geprüften deutschen Anbieter fand sich eine automatische Berechnung von Abzügen/Pönalen aus Reklamationen oder Vertragsregeln, ein Monatsnachweis mit Kunden-Gegenzeichnung des Monats oder eine Rechnungsfreigabe-Logik. Vorhanden sind überall Einzelbausteine (Kundenunterschrift pro Einsatz/Arbeitsschein, Tickets, Qualitätskontrolle, Rechnung).

### Cited Findings
**KleanApp** (seit 31.03.2026 Teil der zvoove Group)
- Funktionsseite (Herstellerangabe): Qualitätskontrolle (auch nach DIN 2859-1), Tickets mit automatischen Nacharbeitstickets, QR-Meldungen, Arbeitsaufträge/Sonderleistungen, Rechnungserstellung, digitale Formulare mit Unterschrift (u. a. „Abnahmeprotokoll“). Minderung, Abzug, Vertragsstrafe: nicht erwähnt; Leistungsnachweis nicht ausdrücklich; Freigabe nicht ausdrücklich. — [KleanApp Funktionen](https://www.kleanapp.net/en/Home/Functions)
- Lexware-Partnerseite (Herstellerangabe): Kunde unterschreibt Arbeitsscheine/Sonderleistungen vor Ort in der App; Rechnung per Knopfdruck oder Rechnungslauf; Arbeitsscheine mit Kundenunterschrift werden als PDF an die Rechnung angehängt; bei schlechter Raumbewertung automatisch Nacharbeitstickets. — [Lexware: KleanApp](https://www.lexware.de/partner/kleanapp/)
- Übernahme durch zvoove: [PR Newswire](https://prnewswire.com/de/pressemitteilungen/zvoove-group-ubernimmt-kleanapp-302728607.html) (nur Suchauszug gelesen)
- Urteil: Kundenunterschrift + Rechnung mit Anhang ja; Minderung/Pönale/Monatsakte: geprüft, nichts gefunden.

**Blink**
- Redaktionelle Beschreibung (KI-Syndikat, Stand der Seite; Drittquelle): GPS-Zeiterfassung, Dienstplanung, Tickets, Chat, Kundenportal; „Kein vollständiges ERP-System, für Rechnungsstellung und Buchhaltung braucht man zusätzliche Software“; Leistungsnachweis, Kundenunterschrift, Minderung im Text nicht erwähnt. — [KI-Syndikat Blink](https://www.ki-syndikat.de/tools/blink-gebaeudereinigung/)
- Urteil: geprüft, nichts gefunden (Rechnung gar nicht im Produkt).

**zvoove Clean / fortytools / CleanManager (zvoove-Gruppe; CleanManager seit August 2025)**
- Nur Suchtreffer-Auszüge: zvoove Clean ist eine mobile Qualitätskontroll-App; digitale Arbeitsaufträge. Übernahme von CleanManager Aug. 2025. — [App Store zvoove Clean](https://apps.apple.com/sk/app/zvoove-clean/id1478562448), [Pulse2](https://pulse2.com/zvoove-buying-time-tracking-platform-cleanmanager/)
- CleanManager laut SoftGuide (Herstellerangabe): Funktionen „Qualitätsmanagement“, „Qualitätssicherung und Alarmfunktion“, „Rechnungen“, „Fakturierung“, Rechnungen aus erfassten Arbeitszeiten; Leistungsnachweis, Reklamation, Minderung, Kundenportal nicht genannt. — [SoftGuide CleanManager](https://www.softguide.de/programm/cleanmanager/vorschau)
- CleanManager-Website: Qualitätskontrolle (Zusatzmodul), Kundenportal (Basismodul), Fakturakalkulation (Zusatzmodul); Reklamation, Leistungsnachweis, Minderung, SLA: keine Information. — [cleanmanager.com](https://www.cleanmanager.com/)
- fortytools: Produktseite (fortytools.com/de/gebaeudereinigung-software) lieferte 404; nur Suchauszug: Angebot, Arbeitsaufträge, Zeiterfassung, Rechnung, Unterschrift in App laut Nutzerbewertung. — [SoftGuide fortytools](https://www.softguide.de/programm/fortytools/vorschau) (nicht selbst geöffnet)
- Urteil: geprüft, nichts gefunden; fortytools und zvoove Clean nur über Drittquellen belegt, also schwächere Evidenz.

**PlanD**
- Funktionsliste (Drittseite): Reklamationsmanagement, Arbeitsscheine, Rechnungserstellung, Lohnabrechnung; nicht genannt: Leistungsnachweis, Kundenportal, Minderung. — [softwareabc24 PlanD](https://www.softwareabc24.de/gebaeudereiniger-software/pland)
- Die Hersteller-Lexikonseite „Reklamationsmanagement“ und die Funktionsseite lieferten 404 beziehungsweise nur Werbetext. — [PlanD Arbeitslexikon](https://pland.app/en/arbeitslexikon/reklamationsmanagement)
- Urteil: Reklamationsmodul existiert (Tiefe unbekannt); Minderung/Monatsakte: nichts gefunden.

**A.S.E. Gebäudereiniger Software (WorkGroups)**
- SoftGuide-Funktionsliste: „Erfassung von Arbeits- und Leistungsscheinen“, „Teil- und Schlussrechnung“, „Gutschrifterstellung“, „Automatisierbare Workflows bei Eintreten von Qualitätsmängeln“, „Rabatte/Rabatt-System“; Reklamation, Minderung, Vertragsstrafe, Kundenunterschrift nicht genannt. — [SoftGuide A.S.E.](https://www.softguide.de/programm/ase-workgroups-gebaeudereiniger-software/vorschau)
- Urteil: Qualitätsmangel-Workflow und Gutschrift vorhanden (Marketing-Stichwort, Tiefe unbekannt); nichts zu Monatsakte.

**cleaning pro (Lederer Systemhaus)**
- „Arbeitsaufträge/Leistungsnachweise (optional mit digitaler Unterschrift)“, „Automatische Vertragsabrechnung in frei definierbaren Perioden“, Prozess Angebot → Auftrag → Leistungsnachweis → Faktura. Minderung/Reklamation/Vertragsstrafe: nicht auf der Seite. — [SoftGuide cleaning pro](https://www.softguide.de/programm/cleaning-pro-branchenloesung-fuer-gebaeudedienste/vorschau)
- Urteil: nahe an „Leistungsnachweis → Faktura“, aber ohne Regeln/Minderung/Gegenzeichnung des Monats.

**Gerelo**
- Hersteller-App-Seite: Mitarbeiter-App (Zeit, Qualitätskontrolle mit GPS und Foto), Kundenbereich mit Login: Firmennews, Rechnungen, **freigegebene** Qualitätskontrollberichte; ab 1 € je Mitarbeiter/Monat. Reklamation, Leistungsnachweis, Kundenunterschrift, Minderung: nicht auf der Seite. — [Gerelo / gebaeudereiniger-app.de](https://gebaeudereiniger-app.de/)
- Urteil: geprüft, nichts gefunden zur Monatsakte. („Freigabe“ bezieht sich auf die interne Freigabe von Kontrollberichten für den Kunden, nicht auf Rechnungen.)

**DIGRAS**
- Funktionsliste „Auszug“: Rechnungen, Rechnungspositionen, wiederkehrende Rechnungen; keine Treffer zu Leistungsnachweis, Reklamation, Minderung, Qualität. — [SoftGuide DIGRAS](https://www.softguide.de/programm/digras/vorschau)

**ProClean, Hagel IT-Lösungen**
- Hagel IT (Herstellerwerbetext, 2026): nennt „QR-/NFC-Leistungsnachweis“ und „Kundenportal“ als Hebel und verweist auf Produkte landwehrl, vitodata cleanvito, cleanicro, Casual; kein Wort zu Minderung/Pönale/Rechnungsfreigabe. — [hagel IT](https://www.hagel-it.de/it-insights/digitalisierung-in-der-reinigungsbranche-so-geht-gebaeudereinigung-2026)
- ProClean: keine eigene Seite gefunden/geöffnet; geprüft über Suchen, nichts gefunden. (Gap)

**Spezialisten für Qualitätsmessung (nicht in der Anbieterliste, aber relevant)**
- iQTrust (MT-Consult Bochum; Seite von KI-Syndikat, zuletzt geprüft 13.06.2026): DIN-EN-13549-Kontrollen, NFC-Anwesenheit, Ticketsystem für Mängel mit „Sanktions- und Eskalationsstufen“, automatische PDF-Berichte nach jedem Prüfgang; Fallstudie: monatlich automatisch erzeugte PDF-Berichte für den Auftraggeber. Wie Sanktionen berechnet/angewendet werden, steht nicht dort. Rechnung/Kundenunterschrift nicht beschrieben. — [KI-Syndikat iQTrust](https://www.ki-syndikat.de/tools/iqtrust/)
- e-QSS (Neumann & Neumann; Seite zuletzt geprüft 30.07.2026): CheckApp, TicketApp, WebPortal, PDF-Bericht je Objekt und Prüfzyklus. Minderung, Malus, Abzug, Rechnung, Kundenunterschrift: nicht beschrieben; „Vertragsstrafen“ nur als Anwendungsfall bei Mängelrügen genannt. — [KI-Syndikat e-QSS](https://www.ki-syndikat.de/tools/e-qss/)
- Diese Tools liegen am nächsten an „Sanktionslogik“ (iQTrust), sind aber Qualitätsmess-Tools auf Auftraggeberseite oder Prüfer-Seite, nicht Abrechnungs-Tools des Reinigers.

### Inferences
- Der deutsche Markt hat durchgängig: Kundenunterschrift pro Arbeitsschein/Einsatz, Ticket/Reklamation, Qualitätskontrolle, Rechnung. Er hat (nach öffentlich zugänglichen Quellen) nicht: Vertragsregel-Parameter je Objekt, Euro-Risiko-Berechnung, Monats-Gegenzeichnung, Rechnungs-Ampel.
- Bei zvoove-Gruppe (Clean, fortytools, CleanManager, KleanApp) ist die Evidenz überwiegend sekundär; ein Release-Notes-/Hilfecenter-Review dieser Hersteller steht aus.

### Gaps
- Nicht erreichbar/ungeprüft: fortytools Produktseite (404), zvoove-Clean-Herstellerseite, PlanD-Hilfecenter, ProClean, Gerelo über Gerelo hinaus, A.S.E. Herstellerseite, Release Notes aller genannten.
- Keine YouTube-Demos oder Webinare geprüft.

---

## 3. Internationale Reinigungs-/Field-Service-Software (Swept, Jobber, Aspire, CleanTelligent/Otuvy, Connecteam, ServiceTitan, BuildOps, Zenput/Crunchtime, Skello, Fieldwire, Tractivity)

### Takeaway
Keiner der geprüften US/UK-Anbieter dokumentiert eine automatische Berechnung von SLA-Abzügen aus Inspektionen/Beschwerden oder eine Rechnungsfreigabe nach Kunden-Monatsbestätigung. Sie bieten Inspektionsberichte, Client-Portale und ggf. Co-Signatur von Inspektionsberichten, aber getrennt von der Abrechnung.

### Cited Findings
- **Swept:** Kundenportal erlaubt Nachrichten (bis 10 Dateien) und Einsicht in Inspektionsberichte; nichts zu Genehmigung, Unterschrift, Rechnungen, Gutschriften; nur in Scale/Loyalty-Tarifen. — [Swept Client Portal](https://knowledge.sweptworks.com/knowledge/swept-client-portal). Suchauszug: Swept sei laut eigener Vergleichsseite nicht für Rechnungen/Zahlungen gedacht. — [Swept Vergleich](https://learn.sweptworks.com/best-janitorial-commercial-cleaning-software) (nur Suchtreffer)
- **Jobber:** Rechnungen einzeln oder im Batch, Angebote online freigebbar, „proof of service“ in App; Gutschriften/SLA auf der Seite nicht erwähnt, Qualität nicht mit Abrechnung verknüpft. — [Jobber Janitorial](https://www.getjobber.com/dlp/janitorial-software/)
- **Aspire:** Vertragsabrechnung (Festpreis/pro Service/T&M), Rechnungsassistent, Batch-Versand, Kundenportal mit Rechnungen und Tickets; nichts zu Freigabe, Credit Memo, SLA, Kundenunterschrift. — [Aspire Blog Billing](https://www.youraspire.com/blog/best-janitorial-apps-billing-invoicing)
- **CleanTelligent (jetzt Otuvy):** Inspektionen, Work Orders, Client-Portal; Herstellerseite: „Build a standardized inspection program that adapts to each contract“, „proof of completion“; keine Abrechnung, kein SLA, kein Abzug. Suchauszug (Vendor-Seite, nicht geöffnet): Kunde kann Inspektionsberichte mitunterzeichnen. — [Otuvy QM Features](https://www.otuvy.com/otuvy-qm-features), [CleanTelligent Inspektion (Suchauszug)](https://cleantelligent.com/solutions/janitorial-inspection-software/)
- **Janitorial Manager:** Inspektionsscore wird gespeichert, Client-Portal; Artikel von 27.12.2017 nennt keine Kundenfreigabe, kein SLA, keine Gutschrift, keine Verbindung Score → Rechnung. — [Janitorial Manager Blog](https://www.janitorialmanager.com/blog/can-increase-client-satisfaction-cleaning-inspection-software/)
- **BuildOps:** Service-Agreement-Management; Suchauszug: SLA-Tracking gegen Vertragsverpflichtungen als Marketingaussage; Funktionsseite lieferte 404; keine Pönalen-/Credit-Mechanik gefunden. — [BuildOps Service Agreements](https://buildops.com/feature-service-agreements) (404), [BuildOps AI Guide (Suchtreffer)](https://buildops.com/resources/ai-service-agreement-management)
- **ServiceTitan:** Kein „Credit Note“-Dokument; Guthaben erscheint auf dem Statement; AP-Freigabe-Workflows betreffen Lieferantenrechnungen, nicht Kundenrechnungen; Community-Beitrag fragt nach Kundensignatur im Portal (undatiert, kein Beleg für Umsetzung). Alles aus Suchauszügen. — [ServiceTitan Help: Credits](https://help.servicetitan.com/problem-solution/convert-a-negative-balance-to-a-credit), [AP Approval Workflows](https://help.servicetitan.com/commercial/docs/automate-bill-reviews-with-ap-approval-workflows)
- **Connecteam:** Workforce-App mit Checklisten/Formularen, Staff-seitige Signaturen; keine Kunden-Rechnungsfreigabe gefunden (Suchauszüge). — [Connecteam Cleaning](https://connecteam.com/connecteam-cleaning-companies/)
- **Zenput / Crunchtime Ops Execution:** Audits mit Korrekturaufgaben; nichts zu Abrechnung/Pönale. — [Zenput Audits](https://www.zenput.com/platform/audits-corrective-action) (Suchauszug)
- **Skello, Fieldwire, Tractivity:** gezielt nicht gesondert geöffnet; Skello ist Schichtplanung, Fieldwire Baustellenaufgaben; kein Hinweis auf Abrechnungs-/Pönalen-Funktion in den Suchen. Als „nicht vollständig geprüft“ zu werten.
- **ServiceChannel / Corrigo (Auftraggeberseite):** Suche nach automatischen SLA-Abzügen ergab nichts; ein G2-Reviewer erwähnt Verzögerungen, da Rechnungen erst nach Prüfung der Leistungserledigung am Standort freigegeben werden (Suchauszug). — [G2 ServiceChannel](https://g2.com/products/servicechannel/reviews)

### Inferences
- Auf der US-Seite existiert die Rechnungsfreigabe nach Leistungsbestätigung am ehesten in Auftraggeber-Plattformen (ServiceChannel/Corrigo) für Lieferantenrechnungen – das ist die Gegenrichtung (Kunde prüft, Dienstleister bekommt nicht vorab eine Ampel). Belegt nur schwach (Reviewer-Satz).

### Gaps
- Aspire-Help-Center, Swept-Release-Notes, ServiceTitan Commercial, BuildOps-Dokumentation, Skello, Fieldwire, Tractivity nicht im Detail geöffnet.

---

## 4. Facility-Management/CAFM (Planon, Plancal, Axians/Infoma, Dynamics, Allplan FM, Spacewell, MCS, pitFM, Causeway, TABS)

### Takeaway
CAFM-Anbieter werben mit „SLA-Tracking“ und Berichten, aber ein öffentlich dokumentierter, automatischer Pönale-/Minderungsabzug vom Dienstleister-Rechnungsbetrag fand sich nur als Projekt-Einzelfall (Intertec auf Hexagon EAM, Herstellerbehauptung); bei Planon, Spacewell, pitFM, Causeway, TABS: geprüft, nichts Entsprechendes gefunden. Plancal, Infoma, Dynamics-Lösungen, Allplan FM, MCS: nicht auffindbar/nicht geprüft.

### Cited Findings
- **Intertec (UAE, Case Study, Herstellerangabe):** kundenspezifisch gebautes CAFM auf HxGN EAM 12.1 mit „SLA and penalty automation“, „automated deductions for SLA breaches linked to performance KPIs“, Berichte zur Unterstützung der Monatsabrechnung. Keine Zahlen, kein Datum, keine Aussage über Kunden-Gegenzeichnung. Direktaufruf der Seite gab 404; nur Suchauszug gelesen. — [Intertec Case Study](https://www.intertecsystems.com/case-study/turning-school-facilities-into-always-on-learning-spaces-with-intelligent-cafm)
- **Planon:** KI-Syndikat-Seite (Stand der Quellen 30.10.2026): SLA-Tracking und Subunternehmersteuerung als Demo-Thema; „Pönale-Regelungen, Prüfprozesse für Rechnungen und die Verrechnung … werden nicht beschrieben“. — [KI-Syndikat Planon](https://www.ki-syndikat.de/tools/planon/); Planon-Herstellerfallstudie UniCredit nennt „significantly fewer supplier disputes“, ohne Mechanik. — [Case Study UniCredit](https://www.casestudies.com/company/planon/case-study/planon-software-as-business-enabler-at-unicredit); Planon Field Services Seite: Mobile-App mit „job documentation and customer sign off“, Revenue Management („reduce revenue leaks“), keine Pönale. — [Planon Soft FM](https://planonsoftware.com/se/software/field-services/soft-fm-services/)
- **Spacewell:** KI-Syndikat-Seite (zuletzt geprüft 31.05.2026): SLA, Pönale, Rechnungsprüfung, Leistungsverrechnung nicht erwähnt. — [KI-Syndikat Spacewell](https://www.ki-syndikat.de/tools/spacewell/)
- **pitFM:** Seite für FM-Dienstleister spricht von SLA und Abrechnung als zentralen Daten; Pönale, Leistungsverrechnung, Leistungsnachweis nicht erwähnt. — [pit-cup FM-Dienstleister](https://pit.de/en/betreiben/fm-dienstleister/)
- **Causeway FM Facts:** Artikel (11.07.2012) beschreibt SLA-Management/-Reporting an der Universität Bradford; keine Abzugs-/Rechnungsfunktion genannt. — [PFM on the Net](https://www.pfmonthenet.net/article/51721/Hitting-SLAs-with-Causeway-FM-Facts.aspx)
- **TABS FM (13.01.2013):** Frühwarnungen vor SLA-Überschreitung und Datenanalyse zur Abwehr von Vertragsstrafen (Herstellerblog; behauptete Ersparnis ca. 35.000 GBP/Jahr bei einem Kunden); keine automatische Abzugsberechnung. — [TABS FM Blog](https://public.tabsfm.co.uk/media/blogs/how-can-CAFM-software-save-money)
- Fachartikel (Rödl, Auszug aus Suche): automatisierte Erstellung von Schreiben zur Ziehung von Vertragsstrafen sei „vergleichsweise einfach umsetzbar“ – Hinweis, dass dies im FM zwar denkbar, aber nicht als Standardprodukt belegt ist. — [Rödl: Dienstleistungssteuerung FM](https://www.roedl.com/insights/dienstleistungssteuerung-fm-umsetzungshilfen-aktiv-nutzen/) (nur Suchauszug)
- **OxMaint CMMS (17.07.2026):** automatische Berechnung von Lieferanten-Scores aus geschlossenen Arbeitsaufträgen; Holdback/Strafen stehen nur in einer Tabelle zu Zahlungsbedingungen, nicht als Produktfunktion. — [OxMaint Guide](https://oxmaint.com/industries/facility-management/facility-vendor-sla-performance-scoring-cmms-guide)

### Inferences
- Der Intertec-Fall zeigt: SLA-Abzug-Automatik existiert als individuelle Projektanpassung im Großkunden-CAFM. Als Produktfunktion für mittelständische Gebäudereiniger ist sie nicht belegt.

### Gaps
- Plancal, Axians/Infoma, Dynamics-basierte FM-Lösungen, Allplan FM, MCS: weder Herstellerseite noch Hilfedokumentation gefunden; Fazit „nicht auffindbar“, kein Beleg für Existenz oder Nichtexistenz.
- CAFM-Funktionen sind meist nur in Demo/Lastenheft sichtbar; öffentlich nicht prüfbar.

---

## 5. Gibt es „Rechnung zurückhalten, bis Monatsbericht gegengezeichnet ist“ oder „automatische Abzüge aus Reklamationen“ irgendwo?

### Takeaway
Als Software-Funktion: nicht gefunden (geprüft bei allen oben genannten). Als Vertragsrealität: sehr wohl – öffentliche Reinigungsausschreibungen verlangen genau diese Mechanik, aber als Papier-/Excel-Prozess des Auftraggebers.

### Cited Findings
- Mülheim an der Ruhr (Ausschreibung Unterhaltsreinigung): Anlage „Qualitätsmessung und Malussystem“, Anlage 7 „Beschwerdemanagement – Malussystem“ und Anlage 05 „Informationsblatt Monatsbericht“. Aus Suchauszügen: Malus nach im Kalendermonat erfassten Mängeln, Bezugsgröße fakturierter Umsatz des Gebäudeteils, Staffel (z. B. 6–10 Fehlerpunkte = 10 % Abzug), Monatsbericht des Objektverantwortlichen mit „ordnungsgemäße Reinigung bestätigt nur wenn kein Mangel im Monat“. Die PDFs lieferten 403; nur Suchauszüge, daher unverifiziert im Detail. — [Anlage 2](https://www1.muelheim-ruhr.de/system/files/ausschreibungen/Anlage_2_Qualitaetsmessung_und_Malussystem_1.pdf), [Anlage 7](https://www1.muelheim-ruhr.de/system/files/ausschreibungen/Anlage_7_-_Beschwerdemanagement_-_Malussystem_2_4.pdf), [Anlage 05 Monatsbericht](https://www1.muelheim-ruhr.de/system/files/ausschreibungen/Anlage_05_Informationsblatt_Monatsbericht.pdf)
- Andere Ausschreibungsmuster (Suchauszüge): Malus gedeckelt bei 5 % des Netto-Entgelts; Rechnung nur vollständig mit Monatsqualitätsbericht; gestaffelter Abzug 1 % / 2 % bei verspäteter/unterlassener Beschwerdebearbeitung; schriftliche Geltendmachung mit Berechnung erforderlich. — [evergabe-Unterlagen](https://evergabe.de/unterlagen/924530/download/2022659?id=3144526), [Rödl: Reinigungsvertrag](https://www.roedl.com/insights/reinigungsvertrag-herausforderungen/) (nur Suchauszüge)
- Hochschule Flensburg (2017): Vertragsstrafe, wenn bei Qualitätskontrolle oder Monatsbericht festgestellte Mängel nicht (rechtzeitig) behoben werden; ohne Nachweis gelten Leistungen als nicht erbracht (Suchauszug). — [Unterlagen Reinigung 01/17](https://hs-flensburg.de/sites/default/files/bekanntmachung/2017-09/Unterlagen-Reinigung-01-17.pdf)
- US-Verträge (Jacksonville, San Leandro) mit Abzug nach Inspektionsbefund bzw. 10 % Retention je Monatsrechnung: reine Vertragsklauseln, keine Software. — Suchauszüge, u. a. [Jacksonville OIG-Bericht 2025-0007](https://jacksonville.gov/getattachment/Departments/Inspector-General/Reports/2025-0007-Janitorial-Services.pdf.aspx?lang=en-US)
- Suchen nach „Rechnungssperre bis Leistungsnachweis“ / „invoice hold until client sign-off“ in Reinigungs- und Field-Service-Software ergaben keinen Treffer für eine entsprechende Produktfunktion. Das ist ein Suchergebnis, kein Beweis der Abwesenheit.
- Nur Auftraggeberseite ähnlich: Infor LN (ERP) kennt „Gutschriftverfahren“ (Kunde genehmigt Leistung, dann Rechnung), also ERP-Konzept „Evaluated Receipt Settlement“. — [Infor LN Doku](https://docs.infor.com/ln/10.8/de-de/lnolh/tfolh/tfom000455.html) (nur Suchauszug)

### Inferences
- Die Nachfrage ist real und kommt aus Ausschreibungen; Reiniger müssen diese Malus-/Monatsbericht-Logik derzeit manuell abbilden.

### Gaps
- Mülheim-PDFs im Original nicht gelesen (403); Prozentstaffeln sollten vor Verwendung im Bericht anhand des Originals geprüft werden.

---

## 6. Urteil: Was ist neu, was Standard?

### Takeaway
Standard: Kundenunterschrift je Einsatz/Arbeitsschein, Tickets/Reklamationen, Qualitätskontrollen, Rechnung aus Aufträgen, manuelle Gutschrift/Minderung. Selten, aber vorhanden: Leistungsbeleg als Abrechnungsgrundlage (Mendato, cleaning pro). Nicht gefunden (also nach öffentlichem Stand neu): Vertragsregeln je Objekt als Parameter, automatische Euro-Berechnung von Minderungsrisiko aus offenen Reklamationen/fehlender Gegenzeichnung, Monats-Gegenzeichnung als Akte, Ampel „Rechnung kann raus“.

### Cited Findings (Matrix, Kurzform)
| Teil der Idee | Standard/vorhanden | Beleg |
|---|---|---|
| Anwesenheit, Ausführung, Fotos, Checklisten | Standard | KleanApp, Gerelo, Blink, CleanManager, Swept (siehe oben) |
| Kunde zeichnet Einsatz gegen (App/Link/Portal) | vorhanden: Mendato, KleanApp, cleaning pro | [Mendato](https://help.mendato.com/de/articles/10568653-leistungsbelege-in-mendato-gegenzeichnen-lassen), [Lexware KleanApp](https://www.lexware.de/partner/kleanapp/) |
| Nur unterschriebene Belege in Abrechnung | Mendato (Modell „per Leistungsbeleg“, als Empfehlung) | [Mendato](https://help.mendato.com/de/articles/10560638-pro-einsatz-dynamische-menge-per-leistungsbeleg) |
| Reklamation im Kundenportal → Ticket | vorhanden: Mendato, KleanApp, PlanD (Modul), iQTrust, e-QSS | [Mendato](https://help.mendato.com/en/articles/11095691-digital-complaint-management-customer-portal-ticket-system) |
| Manuelle Minderung/Gutschrift | vorhanden: Mendato („Minderung erstellen“), A.S.E. („Gutschrifterstellung“) | [Mendato](https://help.mendato.com/de/articles/10568202-minderung-erstellen), [A.S.E.](https://www.softguide.de/programm/ase-workgroups-gebaeudereiniger-software/vorschau) |
| Sanktions-/Eskalationsstufen im Ticket | iQTrust (Marketingbegriff, Berechnung unklar) | [iQTrust](https://www.ki-syndikat.de/tools/iqtrust/) |
| SLA-Abzug automatisch, an KPIs gekoppelt | nur Projekt-Einzelfall (Intertec/HxGN EAM, Herstellerangabe) | [Intertec](https://www.intertecsystems.com/case-study/turning-school-facilities-into-always-on-learning-spaces-with-intelligent-cafm) |
| Vertragsregeln je Objekt (Frist, % / €) als Daten | nicht gefunden | alle geprüften Quellen |
| Euro-Minderungsrisiko aus offenen Reklamationen + fehlender Gegenzeichnung | nicht gefunden | alle geprüften Quellen |
| Monats-Gegenzeichnung je Objekt | nicht gefunden (Mendato: je Einsatz; iQTrust: monatlicher Bericht ohne Gegenzeichnung beschrieben) | s. o. |
| Rechnungsfreigabe-Ampel / Sperre | nicht gefunden (Mendato nur Empfehlung/Dashboard „Menge fehlt“) | s. o. |
| PDF-Akte mit Rechnung | Teilweise: KleanApp hängt unterschriebene Arbeitsscheine an Rechnungs-PDF | [Lexware KleanApp](https://www.lexware.de/partner/kleanapp/) |

### Inferences
- Der Bericht sollte NICHT behaupten „kein Wettbewerber hat Minderung/Gegenzeichnung“. Korrekt: Einzelbausteine existieren; die Integration auf Vertragsregeln-Basis mit Euro-Risiko und Monatsfreigabe ist öffentlich nicht dokumentiert.
- Mendato ist der Wettbewerber, der die Idee am schnellsten ergänzen könnte (Minderungs-Negativposten, Leistungsbeleg-Pflichtmodell, Reklamationsportal bestehen bereits).
- Die Abwesenheit in öffentlichen Quellen ist kein Beweis, dass es sie nicht gibt: Funktionen können hinter Login, in Demos oder in Kundenprojekten existieren.

### Gaps
- Keine Demo-Videos, Webinare, Preislisten, Release Notes, Capterra/G2/Trustpilot-Reviews systematisch ausgewertet.
- Nicht geöffnet bzw. nicht erreichbar: fortytools, zvoove Clean (Herstellerseiten), PlanD (Hilfe), ProClean, Hagel-Produkte (landwehrl, vitodata cleanvito, cleanicro, Casual), Plancal, Infoma, Dynamics-FM, Allplan FM, MCS, Tractivity, Fieldwire, Skello.
- Empfohlene Nachprüfung vor Verwendung: Mendato-Support/Demo zur Frage, ob Rechnungen technisch ohne Leistungsbeleg gesperrt werden; iQTrust-Demo zu „Sanktionsstufen“; Mülheim-Originalanlagen.
