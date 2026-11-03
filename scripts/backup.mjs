// Konsistente Sicherung der SQLite-Datenbank (auch im laufenden Betrieb).
// Aufruf im Container: docker compose exec app node scripts/backup.mjs /data/backup-2026-11-03.db
import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';

const src = process.env.RESCH_DB ?? 'data/resch.db';
const out = process.argv[2];
if (!out) { console.error('Ziel angeben, z. B. /data/backup.db'); process.exit(1); }
if (existsSync(out)) { console.error(`Ziel existiert schon: ${out}`); process.exit(1); }
const db = new DatabaseSync(src);
db.exec(`VACUUM INTO '${out.replace(/'/g, "''")}'`);
db.close();
console.log(`Sicherung geschrieben: ${out}`);
