# Anlage 2: Technische und organisatorische Maßnahmen (Art. 32 DSGVO)

*Entwurf. Aufgeführt sind nur Maßnahmen, die in Quellcode oder Dokumentation der App belegt sind. **[OFFEN]** = nicht belegt oder nicht festgelegt. Vor Verwendung gegen den echten Betrieb prüfen. Das Rechenzentrum liegt bei netcup, Deutschland (Angabe des Betreibers); die Maßnahmen des Rechenzentrums (Zutritt, Strom, Brandschutz) sind über den Vertrag mit netcup zu belegen. **[OFFEN: TOM von netcup als Anlage beifügen]***

## 1. Vertraulichkeit

**Zugangskontrolle (Anmeldung)**
- Anmeldung mit Anmeldename und Passwort. Mindestlänge 12 Zeichen für Verwaltungszugänge, 8 Zeichen für Mitarbeitende.
- Passwörter werden nur als gesalzener Hash (scrypt) gespeichert.
- Neue Zugänge erhalten einen Einmal-Code und müssen beim ersten Anmelden ein eigenes Passwort wählen. Zugänge lassen sich sperren.
- Nach fünf Fehlversuchen wird ein Zugang für 15 Minuten gesperrt. Die Anmeldung ist zusätzlich je IP-Adresse begrenzt.
- Sitzungs-Cookie ist nur für den Server lesbar (httpOnly), SameSite=Strict und bei HTTPS „Secure“. Sitzungsschlüssel werden nur als Hash gespeichert.
- Zwei-Faktor-Anmeldung: **nicht vorhanden** (geplant).

**Zugriffskontrolle (Rechte)**
- Rollen: Administrator, Büro, Objektleitung (Verwaltung) und Mitarbeiter. Nur Administratoren verwalten Zugänge und den Funktionsumfang. Der letzte aktive Administrator ist geschützt.
- Die Rechteprüfung läuft zentral auf dem Server. Mitarbeitende erhalten vom Server ausschließlich ihre eigenen Daten (keine Preise, Rechnungen, Daten anderer).
- Die öffentliche Abnahme-Seite für Kunden zeigt nur das jeweilige Objekt, ohne Preise, ohne Mitarbeiternamen und ohne interne Notizen, und ist durch einen geheimen Schlüssel geschützt, der sich erneuern lässt.
- Funktionsbausteine lassen sich betriebsweit ausschalten. Nicht enthaltene Bausteine sind auch auf dem Server gesperrt.

**Weitere Schutzmaßnahmen**
- Prüfung der Herkunft bei Schreibzugriffen (Origin), Sicherheits-Header (u. a. HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy), Beschränkung der Anfragegröße.
- Mehr als 110 automatisierte Angriffs- und Rechteprüfungen (Eigentest). Eine Prüfung durch Dritte hat **nicht** stattgefunden.

## 2. Integrität

- **Weitergabekontrolle:** Übertragung per HTTPS. **[OFFEN: Zertifikat und Weiterleitung auf dem Server bestätigen]**
- **Eingabekontrolle:** Änderungen an Zeitbuchungen werden nicht gelöscht, sondern ungültig gesetzt und im Änderungsprotokoll mit Person, Zeitpunkt, altem und neuem Wert festgehalten. Anmeldungen und Verwaltungsaktionen stehen in einem Protokoll. Abgeschlossene Monate sind gesperrt, Entsperren verlangt einen Grund.

## 3. Verfügbarkeit und Belastbarkeit

- Die Anwendung läuft in einem Container mit eingeschränkten Rechten (unprivilegierter Benutzer) und Gesundheitsprüfung. Das Sicherungsskript `scripts/backup.mjs` ist vorhanden.
- **[OFFEN: Sicherung der Produktivdaten festlegen: Zeitplan, Ort, Verschlüsselung, Aufbewahrung, Wiederherstellungstest]**
- **Testbetriebe:** Derzeit keine Sicherung eingerichtet. **[OFFEN: bestätigen oder einrichten]**
- **[OFFEN: Notfallplan, Wiederanlaufzeit]**

## 4. Trennung

- Die Demo läuft als eigene Instanz mit eigener Datenbank, getrennt von Betrieben. Jeder Testbetrieb hat eine eigene Datenbankdatei.
- **[OFFEN: Für bezahlte Betriebe bestätigen: eigene Instanz oder eigene Datenbank je Betrieb]**

## 5. Verschlüsselung und Pseudonymisierung

- Verschlüsselung der Daten auf dem Datenträger (Datenbank, Sicherungen): **[OFFEN, nicht belegt]**
- Fotos werden verkleinert und serverseitig als Bild geprüft. Für die Mitarbeiter-App werden Einmal-Codes nur einmal angezeigt.

## 6. Datenschutz durch Voreinstellung

- Standort-Abgleich beim Stempeln und Touren auf der Karte sind standardmäßig aus. Beim Abgleich wird nur das Ergebnis gespeichert, keine Koordinaten. Mitarbeitende sehen nur eigene Daten.

## 7. Löschung

- Testbetriebe: 14 Tage nach Ablauf der Testphase Löschung samt Daten (Angabe des Betreibers). **[OFFEN: technisch bestätigen]**
- Bezahlte Betriebe: Löschung auf Veranlassung nach Vertragsende. **[OFFEN: Frist und Verfahren festlegen]**

## 8. Organisatorische Maßnahmen

- **[OFFEN]** Verpflichtung auf Vertraulichkeit aller Personen mit Zugang, Zugriff des Betreibers auf Kundendaten (nur bei Support, mit Zustimmung?), Protokollierung von Supportzugriffen, Schulung, Prozess für Datenpannen, Prozess für Betroffenenanfragen, regelmäßige Überprüfung der Maßnahmen.
