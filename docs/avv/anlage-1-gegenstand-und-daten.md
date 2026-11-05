# Anlage 1: Gegenstand der Verarbeitung, Datenarten, Betroffene

*Entwurf. Aus der Funktionsbeschreibung der App abgeleitet, durch Sie und die App-Sitzung zu bestätigen.*

## Art und Zweck der Verarbeitung

Bereitstellung der Anwendung Putzbetrieb als Webanwendung: Speichern, Anzeigen und Verarbeiten der vom Verantwortlichen eingetragenen Daten für Kundenverwaltung, Angebote, Einsatzplanung, Zeiterfassung, Rechnungen, Leistungsnachweise und die Handy-Ansicht der Mitarbeitenden. Betrieb, Sicherung und Löschung der Daten.

## Kategorien personenbezogener Daten

| Gruppe | Daten |
|---|---|
| Mitarbeitende des Verantwortlichen | Name, Anmeldename, Rolle, Personalstammdaten wie Teamzuordnung und Vertragsstunden, Einsatzplan, Arbeitszeiten (Beginn, Ende, Pause, Serverzeit), Zuschläge, Abwesenheiten (Urlaub, Krankheit), Korrekturanträge mit Begründung, Tauschangebote, Mitteilungen, Fotos von Mängeln und Checklisten (sofern aufgenommen), Unterweisungsstände, optional das Ergebnis eines Standort-Abgleichs beim Stempeln (nur „in Ordnung“ oder „ca. X m entfernt“, keine Koordinaten) |
| Kunden des Verantwortlichen (Unternehmen und Ansprechpersonen) | Firmenname, Anschrift, Ansprechpersonen mit Name, E-Mail-Adresse, Telefonnummer, Objektadressen, Schlüsselinformationen, Hinweise zum Objekt, Rechnungsdaten, Abnahmeentscheidungen mit Name der abnehmenden Person |
| Nutzer der Anwendung | Anmeldename, Anzeigename, Rolle, Zeitpunkte von Anmeldungen und Fehlversuchen (Protokoll). **IP-Adresse:** Sie wird bei Anmeldungen, Fehlversuchen, Sperren und der Ersteinrichtung **im Protokoll in der Datenbank gespeichert** und nach **90 Tagen automatisch entfernt** (der Protokolleintrag bleibt, die Adresse nicht; die Bereinigung läuft höchstens einmal täglich und wird bei einer Anmeldung angestoßen). Zusätzlich wird die IP-Adresse kurzzeitig im Arbeitsspeicher zur Begrenzung von Anfragen gehalten (nicht dauerhaft). Bei fehlgeschlagenen Anmeldungen wird der eingegebene Anmeldename (bis 60 Zeichen) im Protokoll vermerkt. |

**Besondere Kategorien (Art. 9 DSGVO):** Die Anwendung speichert Abwesenheitsarten wie „krank“. Das kann Gesundheitsdaten berühren, auch ohne Diagnose. Der Verantwortliche sollte nur das Nötige eintragen. **[OFFEN: rechtliche Bewertung durch Fachperson]**

## Kreis der Betroffenen

Mitarbeitende des Verantwortlichen, Ansprechpersonen bei Kunden des Verantwortlichen, Nutzer der Anwendung.

## Testanmeldung (nur wenn eingeschaltet)

Firmenname, Name, E-Mail-Adresse und Passwort (als Hash) des Testanmelders. Offene, unbestätigte Anträge werden nach 24 Stunden gelöscht. Nach Löschung eines Testbetriebs bleibt nur ein Hash der E-Mail-Adresse, damit die Testphase nicht beliebig oft neu beginnt. Die IP-Adresse wird beim Antrag nicht gespeichert (nur kurz im Arbeitsspeicher zur Begrenzung).

## Nicht verarbeitet

Dauer-Ortung von Personen findet nicht statt. Touren auf der Karte und der Standort-Abgleich sind standardmäßig ausgeschaltet und vom Verantwortlichen einschaltbar.
