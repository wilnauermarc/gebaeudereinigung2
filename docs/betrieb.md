# Betrieb auf einem eigenen Server

Die App ist ein Node-Server mit SQLite-Datenbank. Sie läuft als Docker-Container, davor liegt Caddy, der das https-Zertifikat selbst holt und erneuert.

## Wo betreiben?

Empfehlung: ein **virtueller Server (VPS) bei einem Anbieter in der EU**, zum Beispiel Hetzner (Rechenzentren in Deutschland), IONOS, netcup oder Strato. Gründe: Mitarbeiter- und Kundendaten bleiben in der EU, mit dem Anbieter lässt sich ein **Auftragsverarbeitungsvertrag (AVV)** schließen, und der Preis liegt bei wenigen Euro im Monat (aktuelle Preise beim Anbieter prüfen). Für einen Betrieb mit bis zu 50 Mitarbeitenden reichen 2 CPU-Kerne und 2 bis 4 GB Arbeitsspeicher.

**Warum nicht wie bei Netlify „hochladen“?** Netlify, Vercel und Cloudflare Pages liefern statische Seiten oder kurzlebige Funktionen aus. Diese App braucht einen dauerhaft laufenden Server mit Datenbankdatei, deshalb geht das dort nicht. Die bequemste Alternative ist ein **VPS mit einer Verwaltungsoberfläche** wie [Coolify](https://coolify.io) oder Dokploy: Sie installieren das Programm einmal auf dem Server, verbinden das Repository und bekommen Deployments, https und Sicherungen per Klick. Das nimmt die Kommandozeile ab, Daten und Kosten bleiben beim EU-Anbieter. Der hier beschriebene Weg mit Docker Compose ist die einfachste Variante ohne zusätzliche Software.

Weniger geeignet sind Dienste wie Netlify, Vercel oder Cloudflare Pages (nur statische Seiten bzw. kein dauerhafter Speicher) und US-Plattformen (Fly.io, Render, Railway, Heroku): Sie funktionieren technisch, verlagern die Daten aber ggf. in Drittländer, was bei Personaldaten zusätzlichen Prüfaufwand bedeutet.

## Einrichtung in Kürze

1. VPS mit Ubuntu LTS anlegen, SSH-Schlüssel hinterlegen, Passwort-Login abschalten.
2. Docker installieren (`apt install docker.io docker-compose-v2` oder die Anleitung von docker.com).
3. Eine Domain oder Subdomain (z. B. `app.ihre-firma.de`) per **A-Eintrag** auf die IP des Servers legen.
4. Das Repository auf den Server holen: `git clone <repo> && cd <repo>`.
5. `cp .env.example .env`, `DOMAIN` eintragen und einen **Einrichtungscode** erzeugen: `openssl rand -hex 16` (als `SETUP_TOKEN` in die `.env`). Ohne ihn startet die App nicht, damit niemand Fremdes das Inhaber-Konto anlegen kann, bevor Sie es tun.
6. `docker compose up -d --build`
7. `https://<domain>` öffnen: Die **Ersteinrichtung** (Konto der Inhaberin) erscheint beim ersten Aufruf, dort den Einrichtungscode eingeben. Danach ist sie gesperrt, der Code wird nicht mehr gebraucht.
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

## Tägliche Sicherung einrichten (Beispiel)

Als root auf dem Server mit `crontab -e` (täglich 03:15, 14 Tage behalten; die Kopie anschließend **extern** ablegen, z. B. per `rclone` oder `scp` auf eine Storage Box):

```cron
15 3 * * * cd /opt/reinigungsmanager && docker compose exec -T app node scripts/backup.mjs /data/backup-$(date +\%F).db && docker compose cp app:/data/backup-$(date +\%F).db /var/backups/reinigung/ && docker compose exec -T app sh -c 'find /data -name "backup-*.db" -mtime +14 -delete' && find /var/backups/reinigung -name "backup-*.db" -mtime +14 -delete
```

Wiederherstellen: `docker compose stop app`, Sicherung als `/data/resch.db` zurückkopieren (`docker compose cp backup.db app:/data/resch.db`), alte `resch.db-wal` und `resch.db-shm` löschen, `docker compose start app`.

## Was geprüft ist und was nicht

Geprüft (lokal mit Docker Desktop): Image baut (Node 24, unprivilegierter Benutzer), Stack mit Caddy und selbst signiertem Zertifikat läuft, alle Sicherheitsprüfungen von `npm run test:security` laufen **durch den Proxy über https** (Cookie `Secure`, `HttpOnly`, `SameSite=Strict`, echte Client-Adresse für die Anmeldebegrenzung, Sicherheits-Header, Einrichtungscode), Sicherung mit `backup.mjs`, Neustart ohne Datenverlust. **Nicht geprüft:** Betrieb mit echter Domain und Let's-Encrypt-Zertifikat auf einem Server, Last mit vielen gleichzeitigen Nutzern, Wiederherstellung aus der Sicherung, Updates im laufenden Betrieb.

## Lokal ausprobieren

```bash
docker build -t reinigungsmanager .
docker run --rm -p 3000:3000 -v rm-daten:/data reinigungsmanager
# optional: -e SETUP_TOKEN=meincode (dann fragt die Ersteinrichtung danach)
# http://localhost:3000 (ohne https nur zum Testen)
```
