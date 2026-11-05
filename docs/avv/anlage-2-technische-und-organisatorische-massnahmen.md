# Anlage 2: Technische und organisatorische Maßnahmen (Art. 32 DSGVO)

*Entwurf. Aufgeführt sind nur Maßnahmen, die in Quellcode oder Dokumentation der App belegt sind. **[OFFEN]** = nicht belegt oder nicht festgelegt. Vor Verwendung gegen den echten Betrieb prüfen. Das Rechenzentrum liegt bei netcup, Deutschland (Angabe des Betreibers); die Maßnahmen des Rechenzentrums (Zutritt, Strom, Brandschutz) sind über den Vertrag mit netcup zu belegen. **[OFFEN: TOM von netcup als Anlage beifügen]***

## 1. Vertraulichkeit

**Zugangskontrolle (Anmeldung)**
- Anmeldung mit Anmeldename und Passwort. Mindestlänge 12 Zeichen für Verwaltungszugänge, 8 Zeichen für Mitarbeitende.
- Passwörter werden nur als gesalzener Hash (scrypt) gespeichert.
- Neue Zugänge erhalten einen Einmal-Code und müssen beim ersten Anmelden ein eigenes Passwort wählen. Zugänge lassen sich sperren.
- Nach fünf Fehlversuchen wird ein Zugang für 15 Minuten gesperrt. Die Anmeldung ist zusätzlich je IP-Adresse begrenzt (30 Versuche in 10 Minuten, im Arbeitsspeicher). Ein unbekannter Anmeldename und ein falsches Passwort erhalten dieselbe Antwort.
- Sitzungs-Cookie ist nur für den Server lesbar (httpOnly), SameSite=Strict und bei HTTPS „Secure“. Sitzungsschlüssel werden nur als Hash gespeichert.
- Zwei-Faktor-Anmeldung: **nicht vorhanden** (geplant).

**Zugriffskontrolle (Rechte)**
- Rollen: Administrator, Büro, Objektleitung (Verwaltung) und Mitarbeiter. Nur Administratoren verwalten Zugänge und den Funktionsumfang. Der letzte aktive Administrator ist geschützt.
- Die Rechteprüfung läuft zentral auf dem Server. Mitarbeitende erhalten vom Server ausschließlich ihre eigenen Daten (keine Preise, Rechnungen, Daten anderer).
- Die öffentliche Abnahme-Seite für Kunden zeigt nur das jeweilige Objekt, ohne Preise, ohne Mitarbeiternamen und ohne interne Notizen, und ist durch einen geheimen Schlüssel geschützt, der sich erneuern lässt.
- Funktionsbausteine lassen sich betriebsweit ausschalten. Nicht enthaltene Bausteine sind auch auf dem Server gesperrt.

**Weitere Schutzmaßnahmen**
- Prüfung der Herkunft bei Schreibzugriffen (Origin), Sicherheits-Header (u. a. HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy), Beschränkung der Anfragegröße.
- 182 automatisierte Angriffs- und Rechteprüfungen (Eigentest `npm run test:security`, Stand 5. November 2026) sowie Unit-Tests. Eine Prüfung durch Dritte hat **nicht** stattgefunden.

## 2. Integrität

- **Weitergabekontrolle:** Übertragung per HTTPS über den Proxy Caddy. Für `app.putzbetrieb.app` und `demo.putzbetrieb.app` liegen gültige Zertifikate von Let's Encrypt vor (am 5. November 2026 geprüft); HSTS ist gesetzt. Die automatische Weiterleitung von HTTP auf HTTPS ist Standardverhalten von Caddy und wurde nicht gesondert geprüft.
- **Eingabekontrolle:** Änderungen an Zeitbuchungen werden nicht gelöscht, sondern ungültig gesetzt und im Änderungsprotokoll mit Person, Zeitpunkt, altem und neuem Wert festgehalten. Anmeldungen und Verwaltungsaktionen stehen in einem Protokoll. Abgeschlossene Monate sind gesperrt, Entsperren verlangt einen Grund.

## 3. Verfügbarkeit und Belastbarkeit

- Die Anwendung läuft im Container als unprivilegierter Benutzer („node“) mit Gesundheitsprüfung und startet nach Ausfall neu. Weitere Härtung (schreibgeschütztes Dateisystem, entzogene Linux-Fähigkeiten) ist **nicht** eingerichtet.
- **Sicherung:** Das Skript `scripts/backup.mjs` erzeugt eine konsistente Kopie der Datenbank (SQLite `VACUUM INTO`). Die Kopie ist **unverschlüsselt** und liegt dort, wohin sie geschrieben wird (im Beispiel im selben Docker-Volume auf demselben Server, also nicht außerhalb). Ein täglicher Zeitplan ist in `docs/betrieb.md` nur als Beispiel beschrieben. **[OFFEN: ob der Betreiber produktiv täglich sichert, wohin, Aufbewahrung, Wiederherstellungstest]**
- **Testbetriebe und Verzeichnis:** Das Skript sichert nur die Hauptdatenbank, **nicht** die Datenbanken der Testbetriebe und nicht das Verzeichnis (`registry.db`). Eine Sicherung dieser Daten ist **nicht** eingerichtet.
- **[OFFEN: Notfallplan, Wiederanlaufzeit]**
- **[OFFEN: Notfallplan, Wiederanlaufzeit]**

## 4. Trennung

- Die Demo läuft als eigene Instanz (eigener Container, eigenes Volume) mit erfundenen Daten, getrennt von Betrieben.
- Bei eingeschalteter Testanmeldung hat jeder Betrieb (auch ein späterer bezahlter) eine **eigene Datenbankdatei**, aber alle laufen im **selben Serverprozess**. Die Trennung beruht auf dem Code: Das Sitzungs-Cookie nennt den Betrieb, Sitzungen gelten nur im eigenen Betrieb, und ein HTTP-Test prüft, dass gefälschte Betriebe, fremde Sitzungen und manipulierte Betriebs-IDs abgewiesen werden. Eine Prüfung durch Dritte gab es nicht. Der bisherige Betrieb dieser Installation hat eine getrennte Datei. **Stand 5. November 2026: Die Testanmeldung ist auf dem Server noch nicht eingeschaltet.** **[OFFEN: Soll jeder bezahlte Betrieb stattdessen eine eigene Instanz bekommen?]**

## 5. Verschlüsselung und Pseudonymisierung

- Verschlüsselung der Daten auf dem Datenträger (Datenbank, Sicherungen): Die Anwendung verschlüsselt die Datenbank **nicht**. Ob der Datenträger des Servers verschlüsselt ist, ist **nicht belegt** **[OFFEN: bei netcup klären]**.
- Fotos werden im Browser verkleinert; der Server akzeptiert nur JPEG, PNG und WebP, prüft die Dateikennung und begrenzt auf 300 KB. Für die Mitarbeiter-App werden Einmal-Codes nur einmal angezeigt.

## 6. Datenschutz durch Voreinstellung

- Standort-Abgleich beim Stempeln und Touren auf der Karte sind standardmäßig aus. Beim Abgleich wird nur das Ergebnis gespeichert, keine Koordinaten. Mitarbeitende sehen nur eigene Daten.

## 7. Löschung

- Testbetriebe: 3 Tage vor und bei Ablauf geht eine Hinweis-E-Mail raus; **14 Tage nach Ablauf der Testphase** wird die Datenbankdatei des Betriebs samt Zusatzdateien (WAL/SHM) vom Server gelöscht, im Verzeichnis werden Name und E-Mail-Adresse entfernt, ein Hash der Adresse bleibt. Technisch umgesetzt und mit Unit-Tests mit künstlichen Datumswerten geprüft, **nicht** über echte Zeit im Betrieb. Die Löschung wird durch Anfragen an den Server ausgelöst (höchstens stündlich), nicht durch einen eigenen Zeitgeber. Es ist eine normale Dateilöschung, kein mehrfaches Überschreiben. Vorhandene Sicherungskopien werden dadurch **nicht** erfasst. Bezahlte Betriebe werden nie automatisch gelöscht.
- Bezahlte Betriebe: Löschung auf Veranlassung nach Vertragsende. **[OFFEN: Frist und Verfahren festlegen]**

## 8. Organisatorische Maßnahmen

- **Zugriff des Betreibers:** Der Betreiber hat als Administrator des Servers technisch Zugriff auf alle Datenbankdateien. Die Anwendung hat keine Support-Funktion, mit der sich jemand als Nutzer eines Betriebs anmeldet, und die Zugriffe des Betreibers auf Server und Dateien werden **nicht** protokolliert. **[OFFEN: Regelung, wann der Betreiber Daten einsehen darf, und wie das dokumentiert wird]**
- **[OFFEN]** Verpflichtung auf Vertraulichkeit aller Personen mit Zugang, Protokollierung von Supportzugriffen, Schulung, Prozess für Datenpannen, Prozess für Betroffenenanfragen, regelmäßige Überprüfung der Maßnahmen.
