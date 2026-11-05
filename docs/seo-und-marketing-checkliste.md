# Putzbetrieb: Checkliste für Auffindbarkeit und Verlinkung

Stand: 5. November 2026. Das ist eine Arbeitsliste für alles, was nur Sie selbst tun können (Konten, Verträge, Kontakte), plus die Routine für Veröffentlichung und Pflege der Webseite. Die Webseite liegt in `../Resch-Webseite` (eigenes Repository).

## 1. Domain und Netlify (einmalig, zuerst)

1. Netlify → Site → Domain management → „Add a domain“ → `putzbetrieb.app`. Die Domain als **Primary domain** setzen.
2. DNS: entweder die Nameserver zu Netlify DNS umstellen (Netlify zeigt sie an) oder beim Domain-Anbieter einen A-Eintrag (bzw. ALIAS/ANAME) auf Netlify und einen CNAME `www` auf die Netlify-Adresse setzen. Die genauen Werte zeigt Netlify nach Schritt 1 an.
3. HTTPS: Netlify stellt das Zertifikat nach Verknüpfung selbst aus („Provision certificate“). Danach „Force HTTPS“ aktivieren. `.app`-Domains erzwingen ohnehin HTTPS.
4. Die Weiterleitung `www.putzbetrieb.app` → `putzbetrieb.app` sowie `/login` und `/app` → `https://app.putzbetrieb.app` (302) stehen in `netlify.toml`. Die Weiterleitung von `gebaeude.netlify.app` → `putzbetrieb.app` steht dort **auskommentiert**: Erst einkommentieren, wenn die Domain verbunden ist und HTTPS läuft, sonst ist die Seite unter der alten Adresse nicht mehr erreichbar. Die App läuft getrennt unter `app.putzbetrieb.app` (eigener DNS-Eintrag beim Anbieter der App).
5. Danach prüfen: `https://putzbetrieb.app/`, `/blog/`, `/sitemap.xml`, `/robots.txt` laden, und `http://gebaeude.netlify.app/` leitet um.

## 2. Google Search Console und Bing (am selben Tag)

1. [Search Console](https://search.google.com/search-console) → Property „Domain“ → `putzbetrieb.app` → Bestätigung über einen **DNS-TXT-Eintrag** (beim DNS-Anbieter oder in Netlify DNS).
2. Sitemaps → `https://putzbetrieb.app/sitemap.xml` einreichen.
3. URL-Prüfung → Startseite und die wichtigsten Artikel „Indexierung beantragen“ (nur wenige, kein Massenversand).
4. [Bing Webmaster Tools](https://www.bing.com/webmasters) → „Aus der Google Search Console importieren“. Dort gibt es auch Berichte zu Zitaten in Copilot.
5. In den ersten Wochen wöchentlich ansehen: Indexierung (Seiten „Gefunden, nicht indexiert“ sind normal bei neuen Domains), Suchanfragen, Klicks, Positionen.

## 2b. Anfrageformular (Netlify Forms)

1. Nach dem ersten Deploy erscheint in Netlify unter **Forms** das Formular `testzugang`. Testen Sie es einmal mit einer eigenen Anfrage.
2. Forms → Settings & usage → **Form notifications** → „Add notification“ → E-Mail an Ihre Adresse. Ohne diesen Schritt landen Anfragen nur im Netlify-Menü.
3. Spam: Das Formular hat ein verstecktes Feld (Honeypot). Netlify bietet zusätzlich einen Spam-Filter in den Formular-Einstellungen.
4. Datenschutz: Erledigte Einträge in Netlify löschen. Die gelb markierte Stelle in der Datenschutzerklärung (Auftragsverarbeitung, Speicherdauer) füllen.

## 3. Rechtstexte (vor dem Start)

- **Impressum** (`impressum.html`): Telefonnummer ergänzen oder streichen, USt-IdNr. ergänzen oder streichen. Ob weitere Angaben nötig sind, hängt von Ihrer Rechtsform und Tätigkeit ab.
- **Datenschutzerklärung** (`datenschutz.html`): Die gelb markierten Stellen zum Auftragsverarbeitungsvertrag und zur Drittlandübermittlung bei Netlify prüfen. Beides ist nicht verifiziert. Hinweis: Das E-Mail-Postfach (Gmail) ist ebenfalls ein Dienstleister, der Daten verarbeitet; das sollte in die Erklärung, wenn Sie das Postfach für Anfragen nutzen.
- Danach den gelben „Vor der Veröffentlichung“-Hinweis am Ende beider Seiten entfernen.

## 4. Veröffentlichung der Artikel in Wellen

Die 30 Artikel liegen in `blog-src/`. Welcher Artikel ab wann live ist, steht in `blog-src/_zeitplan.json`. Der Generator baut nur Beiträge, deren Datum erreicht ist.

```bash
cd ../Resch-Webseite
python3 build-blog.py          # baut alles, was bis heute fällig ist
python3 build-blog.py --all    # Vorschau aller 30 (nicht committen)
git add -A && git commit -m "Blog: nächste Welle" && git push
```

| Welle | Datum | Artikel (Nummer im Bericht) |
|---|---|---|
| 1 | 5.11.2026 | 17, 18, 22, 4, 5, 6, 24, 16 |
| 2 | 9.11.2026 | 7, 8, 9, 12 |
| 3 | 16.11.2026 | 19, 20, 13, 14 |
| 4 | 23.11.2026 | 28, 30, 11, 15 |
| 5 | 30.11.2026 | 1, 2, 3, 23 |
| 6 | 7.12.2026 | 10, 21, 27, 29, 25, 26 |

**Welle 6 erst freigeben, wenn die Prüfungen erledigt sind:** Rahmentarifvertrag im Volltext (Artikel 10), Gesetzestext des Bundestariftreuegesetzes (21), Gesetzesstand der E-Rechnung und des BMF-Schreibens (27), § 13b im Wortlaut (29), BAG-Beschluss und VG-Lüneburg-Urteil im Volltext sowie ein Test der Standortfunktion auf einem echten Handy (25). Sonst das Datum in `_zeitplan.json` nach hinten setzen.

Vor jeder Welle: Artikel selbst lesen, mit eigener Praxiserfahrung ergänzen (Beispiele, Zahlen aus dem eigenen Betrieb), Quellenlinks anklicken. Google geht gegen massenhaft erzeugte Inhalte ohne Mehrwert vor; eigene Erfahrung ist der wirksamste Schutz.

Wenn die Seite die Artikel automatisch zum Datum freischalten soll, kann in Netlify als Build-Befehl `python3 build-blog.py` eingetragen und täglich ein Build ausgelöst werden (Build-Hook). Das ist optional und noch nicht eingerichtet.

## 5. Pflege: Zahlen, die sich ändern

| Was | Wann prüfen | Wo ändern |
|---|---|---|
| Branchenmindestlohn und Tarifrunde (Artikel 4, 6, 7, 8, 9, 13, 19–22) | nach jeder Tarifrunde, spätestens zum 1.1.2027 (Verordnung läuft 31.12.2026 aus) | `blog-src/*.json`, dort `modified` auf das Änderungsdatum setzen |
| Gesetzlicher Mindestlohn 14,60 €, Minijob-Grenze 603 € → 633 € (ab 1.1.2027, eigene Rechnung, nicht amtlich bestätigt) | Dezember 2026 | Artikel 8, 11 |
| Basiszins und Verzugszins (Artikel 30, 22) | 1.1. und 1.7. jedes Jahres (Bundesbank) | Artikel 30 |
| E-Rechnung: 800.000-Euro-Stufe, Verschiebungsforderung, ZRE (Artikel 27, 24, 28) | monatlich bis Ende 2026 | Artikel 27 |
| Zeiterfassungs-Gesetzentwurf (Artikel 12, 25) | quartalsweise | Artikel 12 |
| Bundestariftreuegesetz, Vergabeänderungen (Artikel 20, 21) | vor Welle 6 | Artikel 21 |

Der Recherchebericht mit Quellen, Stand und offenen Lücken: `reports/Blogthemen Gebäudereinigung SEO.md`.

## 6. Keywords prüfen (kostenlos)

Der Bericht hat keine Suchvolumina. Vor und nach jeder Welle:

- Search Console → Leistung → Suchanfragen: Welche Begriffe bringen Einblendungen? Titel und erste Absätze der Artikel danach schärfen.
- Google-Autocomplete und „Ähnliche Fragen“ für das Hauptkeyword jedes Artikels ansehen und fehlende Fragen als FAQ ergänzen.
- Google Trends für Begriffspaare (z. B. „Mindestlohn Gebäudereinigung“ vs. „Reinigungskraft Stundenlohn“) und der kostenlose Keyword-Generator von Ahrefs für grobe Hinweise.

## 7. Verlinkung und Verzeichnisse

Links von anderen Seiten sind der stärkste Hebel, den Sie beeinflussen können. Er braucht echte Kontakte und kostet Zeit. Reihenfolge nach Aufwand:

1. **Google-Unternehmensprofil** (business.google.com): Kategorie „Softwareunternehmen“ oder „Softwareentwickler“; Adresse nur eintragen, wenn Sie Kundenbesuche dort empfangen, sonst als Dienstleistung ohne Adresse führen. Die Postanschrift im Impressum muss nicht dem Profil entsprechen.
2. **Software-Verzeichnisse:** Capterra/GetApp/Software Advice (Gartner Digital Markets), OMR Reviews, G2, Crozdesk, SaaSHub. Kostenlose Basiseinträge reichen für den Anfang. Prüfen Sie jeweils die Bedingungen; manche verlangen Kundenbewertungen, die es bei einem Prototyp noch nicht gibt.
3. **LinkedIn-Unternehmensseite** und ein Profil für Marc Wilnauer mit Link zur Seite. Pro Welle 1 bis 2 Beiträge, die einen Artikel mit einer eigenen Erkenntnis verbinden (keine reine Linkabgabe).
4. **Verbände und Innungen:** Regionale Gebäudereiniger-Innungen und der Bundesinnungsverband (BIV) veröffentlichen gelegentlich Hinweise auf Werkzeuge und Vorlagen für Mitglieder. Eine kurze, persönliche Anfrage mit Link auf Rechner und Vorlagen ist erfolgversprechender als eine Werbeanfrage. **Entwurf, nicht gesendet:**
   > Guten Tag, ich entwickle Putzbetrieb, eine Verwaltungssoftware für kleine Gebäudereinigungsbetriebe. Dazu habe ich kostenlose Hilfen erstellt, die auch für Ihre Mitglieder nützlich sein könnten: einen Stundenverrechnungssatz-Rechner und Vorlagen für Leistungsverzeichnis und Objektkontrolle (https://putzbetrieb.app/werkzeuge/). Ich freue mich über Rückmeldungen und Fehlerhinweise. Wenn die Hilfen für Ihre Mitglieder passen, würde ich mich über einen Hinweis freuen. Mit freundlichen Grüßen, Marc Wilnauer
5. **Gründer- und Branchenportale, Fachpresse:** Kurze Gastbeiträge mit eigenen Erkenntnissen (z. B. „Was uns beim Nachbauen eines Leistungsnachweises aufgefallen ist“) sind wertvoller als Pressemitteilungen. Hier gilt: nur Beiträge mit echtem Inhalt einreichen.
6. **Kunden und Piloten:** Wer Putzbetrieb testet und zufrieden ist, kann auf der eigenen Seite oder in einem Verzeichnis verlinken. Fragen Sie danach, wenn es passt, und versprechen Sie keine Gegenleistung für Bewertungen.

## 8. Was die Seite schon mitbringt

- Titel, Beschreibung, Überschriften mit dem Hauptkeyword „Software für Gebäudereinigung“; Strukturdaten (Organisation, Software, Artikel, Brotkrumen); Sitemap mit Datum; `robots.txt` mit freigegebenen Such-Crawlern; Atom-Feed; `llms.txt` (harmlos, belegter Nutzen gering).
- Über-uns-Seite mit Angaben zum Betreiber und zur Entstehung der Beiträge (nennt die KI-Unterstützung; passen Sie den Text an, wenn Sie die Beiträge selbst gegenlesen und das so schreiben möchten).
- Drei Werkzeuge: Stundenverrechnungssatz-Rechner, Vorlage Leistungsverzeichnis, Checkliste Objektkontrolle (Excel und zum Drucken), im Blog an passender Stelle verlinkt.

## 9. Was niemand garantieren kann

Neue Domains brauchen erfahrungsgemäß Monate, bis Rankings sichtbar werden. Die Hebel mit der größten Wirkung sind eigene, belegte und aktuell gehaltene Inhalte sowie Links von Seiten Ihrer Branche.
