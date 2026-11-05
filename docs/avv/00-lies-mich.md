# Auftragsverarbeitung (AVV): Entwurf und Arbeitsliste

Stand: 5. November 2026. **Entwurf, keine Rechtsberatung.** Alle Texte hier sind Vorlagen für Ihre Prüfung und die einer Fachperson (Fachanwalt für IT-Recht oder Datenschutzbeauftragte/r). Sie dürfen so nicht unterschrieben werden, bevor alle Stellen mit **[OFFEN]** geklärt sind.

## Wer ist wer?

| Beziehung | Rolle von Putzbetrieb | Was gebraucht wird |
|---|---|---|
| Reinigungsbetrieb (Kunde) → Putzbetrieb | Auftragsverarbeiter | AVV nach Art. 28 DSGVO (Datei `avv-entwurf.md` mit Anlagen 1 bis 3) |
| Putzbetrieb → netcup (Hosting) | Putzbetrieb ist Verantwortlicher oder Auftragsverarbeiter, netcup Unterauftragsverarbeiter | AV-Vertrag mit netcup, in Anlage 3 als Unterauftragsverarbeiter aufführen |
| Putzbetrieb → E-Mail-Dienst der Testanmeldung (noch nicht gewählt) | Unterauftragsverarbeiter | AV-Vertrag vor dem Start der automatischen Testanmeldung |
| Webseite → Netlify (Formular, Hosting) | Marc Wilnauer ist Verantwortlicher, Netlify Auftragsverarbeiter | Netlify-DPA prüfen und annehmen, Drittlandübermittlung (USA) klären |
| Anfragen-Postfach (Gmail) | Google als Auftragsverarbeiter | Für kostenlose Gmail-Konten gibt es keinen AVV. Besser: Postfach mit eigener Domain und AVV (z. B. Google Workspace oder ein Anbieter mit AVV) |

Die **Demo** (`demo.putzbetrieb.app`) enthält nur erfundene Daten und braucht keinen AVV. Der **Testzugang** braucht ihn, sobald ein Testbetrieb echte Mitarbeiter- oder Kundendaten einträgt.

## Dateien

- `avv-entwurf.md`: Vertragstext
- `anlage-1-gegenstand-und-daten.md`: Gegenstand, Datenarten, Betroffene
- `anlage-2-technische-und-organisatorische-massnahmen.md`: Maßnahmen (nur belegte Punkte, Rest **[OFFEN]**)
- `anlage-3-unterauftragsverarbeiter.md`: Liste mit Stand

## Was Sie noch tun müssen (Reihenfolge)

1. **Fachperson beauftragen** und den Entwurf prüfen lassen. Er ist ein Gerüst, keine fertige Lösung.
2. **netcup:** AV-Vertrag im Kundenbereich prüfen und abschließen. Die TOM von netcup als Anlage oder Verweis aufnehmen.
3. **E-Mail-Dienst** für die Testanmeldung auswählen (mit AVV, am besten mit Verarbeitung in der EU) und eintragen.
4. **Offene Maßnahmen klären** (Anlage 2): Verschlüsselung der Datenbank, Sicherung der Testbetriebe, Zugriff durch Support, Notfallplan.
5. **Verzeichnis der Verarbeitungstätigkeiten** für Putzbetrieb als Auftragsverarbeiter anlegen (Art. 30 Abs. 2 DSGVO).
6. **Ablauf für Datenpannen** festlegen: Als Auftragsverarbeiter müssen Sie Kunden unverzüglich informieren.
7. **Löschkonzept** festlegen (Testbetriebe: 14 Tage nach Ablauf, bezahlte Betriebe: nach Vertragsende, Frist festlegen).
8. **Webseite:** Erst wenn ein AVV tatsächlich bereitsteht, „AVV auf Anfrage“ schreiben. Bis dahin steht dort „wird vor Vertragsabschluss geklärt“.
9. **Netlify und Gmail:** DPA bei Netlify annehmen, Postfach auf einen Anbieter mit AVV umstellen. Danach die gelben Stellen in der Datenschutzerklärung füllen.
10. **Hauptvertrag:** Nutzungsbedingungen und Leistungsbeschreibung (Haftung, Verfügbarkeit, Support) festlegen. Der AVV ersetzt sie nicht.

## Grenzen dieses Entwurfs

- Rechtliche Wirksamkeit, Haftungsregelungen, Vertragsstrafen, Vergütung und Gerichtsstand sind nicht ausformuliert.
- Technische Angaben stammen aus dem Quellcode und der Dokumentation der App. Sie müssen vor Verwendung gegen den echten Betrieb auf dem Server geprüft werden.
- Hosting-Standort: netcup, Deutschland (Angabe des Betreibers). Das genaue Rechenzentrum ist nicht dokumentiert.
