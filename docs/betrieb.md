# Betrieb auf einem eigenen Server

Die App ist ein Node-Server mit SQLite-Datenbank. Sie läuft als Docker-Container, davor liegt Caddy, der das https-Zertifikat selbst holt und erneuert.

## Wo betreiben?

Empfehlung: ein **virtueller Server (VPS) bei einem Anbieter in der EU**, zum Beispiel Hetzner (Rechenzentren in Deutschland), IONOS, netcup oder Strato. Gründe: Mitarbeiter- und Kundendaten bleiben in der EU, mit dem Anbieter lässt sich ein **Auftragsverarbeitungsvertrag (AVV)** schließen, und der Preis liegt bei wenigen Euro im Monat (aktuelle Preise beim Anbieter prüfen). Für einen Betrieb mit bis zu 50 Mitarbeitenden reichen 2 CPU-Kerne und 2 bis 4 GB Arbeitsspeicher.

Weniger geeignet sind Dienste wie Netlify, Vercel oder Cloudflare Pages (nur statische Seiten bzw. kein dauerhafter Speicher) und US-Plattformen (Fly.io, Render, Railway, Heroku): Sie funktionieren technisch, verlagern die Daten aber ggf. in Drittländer, was bei Personaldaten zusätzlichen Prüfaufwand bedeutet.

## Einrichtung in Kürze

1. VPS mit Ubuntu LTS anlegen, SSH-Schlüssel hinterlegen, Passwort-Login abschalten.
2. Docker installieren (`apt install docker.io docker-compose-v2` oder die Anleitung von docker.com).
3. Eine Domain oder Subdomain (z. B. `app.ihre-firma.de`) per **A-Eintrag** auf die IP des Servers legen.
4. Das Repository auf den Server holen: `git clone <repo> && cd <repo>`.
5. `cp .env.example .env` und `DOMAIN` eintragen.
6. `docker compose up -d --build`
7. `https://<domain>` öffnen: Die **Ersteinrichtung** (Konto der Inhaberin) erscheint beim ersten Aufruf. Danach ist sie gesperrt.
8. Firewall: nur Ports 22, 80 und 443 öffnen (`ufw allow 22,80,443/tcp && ufw enable`).

## Wichtig im Betrieb

- **https ist Pflicht.** Ohne https können Passwörter mitgelesen werden. Die Compose-Datei erzwingt das über Caddy.
- **Sicherungen:** Die Datenbank liegt im Docker-Volume `resch-data`. Sichern Sie sie täglich und legen Sie die Kopie **außerhalb des Servers** ab (z. B. Storage Box, anderer Anbieter):
  ```bash
  docker compose exec app node scripts/backup.mjs /data/backup-$(date +%F).db
  docker compose cp app:/data/backup-$(date +%F).db ./backups/
  ```
  Zusätzlich helfen automatische Server-Snapshots des Anbieters. **Wiederherstellung** üben, bevor sie gebraucht wird: Container stoppen, Sicherung als `/data/resch.db` zurückkopieren, Container starten.
- **Updates der App:** `git pull && docker compose up -d --build`. Updates des Servers (`apt upgrade`) regelmäßig, am besten automatisch (`unattended-upgrades`).
- **Passwort vergessen:** Es gibt keine Selbstbedienung. Die Inhaberin kann Mitarbeitenden einen neuen Einmal-Code erzeugen (Einstellungen → Zugänge). Für das Inhaber-Konto selbst hilft nur ein Eingriff in die Datenbank oder eine Wiederherstellung.
- **Datenschutz:** Mit dem Server-Anbieter einen AVV abschließen, ein Verzeichnis der Verarbeitungstätigkeiten führen und die Mitarbeitenden informieren. Eine Prüfung der Sicherheit durch Dritte steht aus, ebenso Zwei-Faktor-Anmeldung.
- **Mehrere Server:** Die Datenbank ist eine Datei und für einen Server gedacht. Für mehr Last oder Ausfallsicherheit ist ein Umstieg auf PostgreSQL vorgesehen.

## Lokal ausprobieren

```bash
docker build -t reinigungsmanager .
docker run --rm -p 3000:3000 -v rm-daten:/data reinigungsmanager
# http://localhost:3000 (ohne https nur zum Testen)
```
