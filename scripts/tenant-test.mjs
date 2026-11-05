// HTTP-Test für mehrere Betriebe. Voraussetzung: Server mit TENANTS=1, frischer Datenbank (RESCH_DB) und ohne SMTP_URL (E-Mails landen im Ordner outbox neben RESCH_DB).
// Aufruf: OUTBOX=<pfad zum outbox-Ordner> node scripts/tenant-test.mjs
import { readdirSync, readFileSync } from 'node:fs';
const B = process.env.BASE ?? 'http://localhost:4180';
const OUT = process.env.OUTBOX;
if (!OUT) throw new Error('OUTBOX setzen');
class C {
	cookie = '';
	async req(method, path, body) {
		const h = { origin: B }; if (body !== undefined) h['content-type'] = 'application/json'; if (this.cookie) h.cookie = this.cookie;
		const r = await fetch(B + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
		const sc = r.headers.get('set-cookie'); if (sc) this.cookie = sc.split(';')[0];
		let j = null; try { j = await r.json(); } catch {}
		return { s: r.status, j };
	}
}
let fail = 0;
const ok = (n, c, x = '') => { console.log((c ? 'OK   ' : 'FAIL ') + n + (c ? '' : '  -> ' + x)); if (!c) fail++; };
const mails = () => { try { return readdirSync(OUT).sort().map((f) => JSON.parse(readFileSync(OUT + '/' + f, 'utf8'))); } catch { return []; } };
const tokenOf = (to) => { const m = mails().filter((x) => x.to === to).at(-1); return m?.text.match(/#([\w-]{20,})/)?.[1]; };
const PW = 'Ein-langes-Passwort-42';
const signup = (c, o) => c.req('POST', '/api/signup', { company: 'Alpha Reinigung', name: 'Anna Alpha', email: 'anna@alpha.de', password: PW, accept: true, demo: true, ...o });

const main = new C();
ok('Ersteinrichtung der Hauptinstanz', (await main.req('POST', '/api/setup', { display: 'Haupt', login: 'hauptadmin', password: PW, start: 'leer' })).s === 200);
const sess = (await new C().req('GET', '/api/session')).j;
ok('Session meldet Testanmeldung', sess.signup === true);

// ── Anmeldung: Prüfungen ──
const a = new C(), b = new C(), anon = new C();
ok('ohne Zustimmung abgelehnt', (await signup(anon, { accept: false })).s === 400);
ok('schwaches Passwort abgelehnt', (await signup(anon, { password: 'kurz' })).s === 400);
ok('ungültige E-Mail abgelehnt', (await signup(anon, { email: 'keine-mail' })).s === 400);
ok('Firmenname mit < > abgelehnt', (await signup(anon, { company: '<b>x</b>' })).s === 400);
const before = mails().length;
ok('Köderfeld: neutrale Antwort, keine Mail', (await signup(anon, { website: 'http://spam' })).s === 200 && mails().length === before);
ok('vor Bestätigung gibt es keinen Betrieb', (await anon.req('POST', '/api/login', { login: 'anna@alpha.de', password: PW })).s === 401);

// ── Betrieb A und B ──
ok('Antrag A: neutrale Antwort', (await signup(a, {})).s === 200);
const tA = tokenOf('anna@alpha.de');
ok('Bestätigungsmail für A liegt vor', !!tA);
ok('Antrag B', (await signup(b, { company: 'Beta Glanz', name: 'Bea Beta', email: 'bea@beta.de' })).s === 200);
const tB = tokenOf('bea@beta.de');
ok('Link ungültig = 400', (await new C().req('POST', '/api/signup/confirm', { token: 'x'.repeat(43) })).s === 400);
const cA = await a.req('POST', '/api/signup/confirm', { token: tA });
ok('Bestätigung A legt Betrieb an und meldet an', cA.s === 200 && cA.j.slug === 'alpha-reinigung', JSON.stringify(cA));
ok('Cookie von A trägt die Betriebs-ID', /^resch_session=[0-9a-f]{16}\./.test(a.cookie));
ok('Link nur einmal gültig', (await new C().req('POST', '/api/signup/confirm', { token: tA })).s === 400);
const cB = await b.req('POST', '/api/signup/confirm', { token: tB });
ok('Bestätigung B', cB.s === 200 && cB.j.slug === 'beta-glanz');

const sa = (await a.req('GET', '/api/session')).j, sb = (await b.req('GET', '/api/session')).j;
ok('A ist Inhaberin von A, Kürzel stimmt', sa.user?.role === 'inhaber' && sa.tenant === 'alpha-reinigung');
ok('B ist Inhaberin von B', sb.user?.role === 'inhaber' && sb.tenant === 'beta-glanz');
const stA = (await a.req('GET', '/api/state')).j, stB = (await b.req('GET', '/api/state')).j;
ok('Datenbestände getrennt (Firmenname)', stA.data.company.name === 'Alpha Reinigung' && stB.data.company.name === 'Beta Glanz');
ok('A hat Beispieldaten, kein Fremddatum von B', stA.data.customers.length > 0 && !JSON.stringify(stA).includes('Beta Glanz'));
const lA = (await a.req('GET', '/api/license')).j;
ok('A: Testphase mit 30 Tagen, alle Bausteine', lA.status === 'test' && lA.daysLeft === 30 && lA.allowed.length === 12, JSON.stringify(lA));

// ── Isolation ──
const idA = a.cookie.split('=')[1].split('.')[0], idB = b.cookie.split('=')[1].split('.')[0];
const forged = new C(); forged.cookie = `resch_session=${idB}.${a.cookie.split('.')[1]}`;
ok('Token von A mit Betrieb B = nicht angemeldet', (await forged.req('GET', '/api/state')).s === 401);
const asMain = new C(); asMain.cookie = `resch_session=${a.cookie.split('.')[1]}`;
ok('Token von A in der Hauptinstanz = nicht angemeldet', (await asMain.req('GET', '/api/state')).s === 401);
const bad = new C(); bad.cookie = `resch_session=../../etc.${a.cookie.split('.')[1]}`;
ok('Ungültige Betriebs-ID im Cookie = nicht angemeldet', (await bad.req('GET', '/api/state')).s === 401);
ok('Hauptinstanz sieht keine Daten der Betriebe', !JSON.stringify((await main.req('GET', '/api/state')).j).includes('Alpha Reinigung'));

// ── Anmeldung ──
const al = new C();
ok('Anmeldung mit E-Mail', (await al.req('POST', '/api/login', { login: 'anna@alpha.de', password: PW })).s === 200 && (await al.req('GET', '/api/session')).j.tenant === 'alpha-reinigung');
ok('falsches Passwort = 401', (await new C().req('POST', '/api/login', { login: 'anna@alpha.de', password: 'falsch-falsch-123' })).s === 401);
const mn = new C();
ok('Hauptinstanz-Anmeldung unverändert', (await mn.req('POST', '/api/login', { login: 'hauptadmin', password: PW })).s === 200 && (await mn.req('GET', '/api/session')).j.tenant === null);

// ── Mitarbeitende eines Betriebs ──
const emp = stA.data.employees[0];
const created = await a.req('POST', '/api/users', { action: 'create', role: 'mitarbeiter', employeeId: emp.id, login: 'maria.test', display: emp.name });
ok('A legt Zugang an', created.s === 200 && !!created.j.code, JSON.stringify(created.j));
const stf = new C();
ok('Anmeldung mit name@kürzel', (await stf.req('POST', '/api/login', { login: 'maria.test@alpha-reinigung', password: created.j.code })).s === 200);
ok('neuer Zugang muss zuerst ein Passwort wählen', (await stf.req('GET', '/api/me/view')).s === 403);
ok('Passwort wählen', (await stf.req('POST', '/api/password', { current: created.j.code, next: 'Neues-Passwort-77' })).s === 200);
await stf.req('POST', '/api/login', { login: 'maria.test@alpha-reinigung', password: 'Neues-Passwort-77' });
ok('dasselbe Kürzel eines anderen Betriebs scheitert', (await new C().req('POST', '/api/login', { login: 'maria.test@beta-glanz', password: created.j.code })).s === 401);
ok('Mitarbeiterin sieht nur ihre Ansicht', (await stf.req('GET', '/api/me/view')).s === 200 && (await stf.req('GET', '/api/state')).s === 403);

// ── Wiederholung und Abnahme ──
const n0 = mails().length;
ok('zweiter Antrag mit gleicher Adresse: neutral, keine neue Mail', (await signup(new C(), {})).s === 200 && mails().length === n0);
const ab = await new C().req('GET', '/api/abnahme?s=x&t=' + 'a'.repeat(20) + '&b=alpha-reinigung');
ok('Abnahme-Link wird im Betrieb gesucht (ungültig = 404)', ab.s === 404, String(ab.s));

// ── Abmelden ──
const lo = await a.req('POST', '/api/logout', {});
const after = await a.req('GET', '/api/state');
ok('nach Abmeldung nicht mehr angemeldet', after.s === 401, `logout ${lo.s}, danach ${after.s} cookie=${a.cookie}`);
console.log(fail ? `\n${fail} FEHLER` : '\nAlles bestanden');
process.exit(fail ? 1 : 0);
