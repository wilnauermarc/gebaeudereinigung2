# Anlage 3: Unterauftragsverarbeiter

Stand: 5. November 2026. *Entwurf.*

| Unterauftragsverarbeiter | Leistung | Standort | Daten | Vertrag |
|---|---|---|---|---|
| netcup (genaue Firma und Anschrift **[OFFEN]**) | Hosting der Server, auf denen Anwendung und Datenbank laufen | Deutschland (Angabe des Betreibers). Rechenzentrum **[OFFEN]** | alle in der Anwendung gespeicherten Daten | AV-Vertrag **[OFFEN: abschließen]** |
| E-Mail-Dienst für die Testanmeldung (Anbieter **[OFFEN: noch nicht gewählt]**) | Versand von Bestätigungs- und Erinnerungs-E-Mails (Bestätigungslink, Hinweis vor Ablauf der Testphase) | **[OFFEN]** | E-Mail-Adresse, Name, Firmenname der Testanmelder | AV-Vertrag **[OFFEN]** |
| Sicherungsspeicher | Ablage der Sicherungen | Nach den Beispielen in `docs/betrieb.md` im Docker-Volume auf demselben netcup-Server; ein externer Speicher ist **nicht** eingerichtet **[OFFEN: ob und wohin]** | Sicherungskopien der Hauptdatenbank | wie netcup |

## Weitere Empfänger, die keine Unterauftragsverarbeiter sind

- **OpenStreetMap (Kartenhintergrund):** Wenn der Kartenhintergrund eingeschaltet ist (Standard, abschaltbar), lädt der Browser des Nutzers Kartenbilder direkt von OpenStreetMap. Dabei sieht der Anbieter die IP-Adresse und den Kartenausschnitt. Die Anwendung selbst gibt dorthin keine Daten weiter. Der Verantwortliche kann den Hintergrund in den Einstellungen ausschalten und sollte seine Mitarbeitenden darauf hinweisen. **[OFFEN: Bewertung durch Fachperson]**

## Nicht Teil der Anwendung

Die Webseite `putzbetrieb.app` (Hosting bei Netlify) und ihr Anfrageformular sind eine eigene Verarbeitung des Betreibers und nicht Gegenstand dieses Vertrags.
