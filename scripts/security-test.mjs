const B = process.env.BASE ?? 'http://localhost:4180';
class Client {
	cookie = '';
	async req(method, path, body, headers = {}) {
		const h = { origin: B, ...headers };
		if (body !== undefined) h['content-type'] = 'application/json';
		if (this.cookie) h.cookie = this.cookie;
		const r = await fetch(B + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
		const sc = r.headers.get('set-cookie');
		if (sc) this.cookie = sc.split(';')[0].includes('=;') || /Max-Age=0|expires=Thu, 01 Jan 1970/i.test(sc) ? '' : sc.split(';')[0];
		let j = null; try { j = await r.json(); } catch {}
		return { s: r.status, j, h: r.headers, sc };
	}
}
let fail = 0;
const ok = (name, cond, extra = '') => { console.log((cond ? 'OK   ' : 'FAIL ') + name + (cond ? '' : '  -> ' + extra)); if (!cond) fail++; };

const anon = new Client();
ok('ohne Sitzung: /api/state = 401', (await anon.req('GET', '/api/state')).s === 401);
ok('ohne Sitzung: /api/users = 401', (await anon.req('GET', '/api/users')).s === 401);
ok('ohne Sitzung: /api/me/view = 401', (await anon.req('GET', '/api/me/view')).s === 401);
ok('Fremder Ursprung beim Login = 403', (await anon.req('POST', '/api/login', { login: 'a', password: 'b' }, { origin: 'http://evil.example' })).s === 403);
ok('ohne Origin-Header = 403', (await fetch(B + '/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })).status === 403);

const owner = new Client();
ok('Setup mit schwachem Passwort abgelehnt', (await owner.req('POST', '/api/setup', { display: 'Anetta R.', login: 'anetta', password: 'kurz', start: 'demo' })).s === 400);
const su = await owner.req('POST', '/api/setup', { display: 'Anetta R.', login: 'anetta', password: 'Ein-langes-Passwort-42', start: 'demo', team: 8 });
ok('Setup mit gutem Passwort', su.s === 200, JSON.stringify(su.j));
ok('Cookie ist httpOnly und SameSite=Strict', /HttpOnly/i.test(su.sc ?? '') && /SameSite=Strict/i.test(su.sc ?? ''), su.sc);
ok('zweites Setup gesperrt (409)', (await anon.req('POST', '/api/setup', { display: 'Angreifer', login: 'evil', password: 'Ein-langes-Passwort-42' })).s === 409);
const st = await owner.req('GET', '/api/state');
ok('Inhaberin lädt den Datenbestand', st.s === 200 && st.j?.data?.employees?.length === 8 && st.j.rev >= 1);

const cr = await owner.req('POST', '/api/users', { action: 'create', role: 'mitarbeiter', employeeId: 'm5', login: 'tomasz.nowak', display: 'Tomasz Nowak' });
ok('Zugang für Mitarbeiter anlegen, Einmal-Code kommt zurück', cr.s === 200 && /^[A-Z2-9]{10}$/.test(cr.j?.code ?? ''), JSON.stringify(cr.j));
ok('doppelter Zugang für dieselbe Person = 409', (await owner.req('POST', '/api/users', { action: 'create', role: 'mitarbeiter', employeeId: 'm5', login: 'tomasz2', display: 'Tom' })).s === 409);
const list = await owner.req('GET', '/api/users');
ok('Zugangsliste enthält keine Passwort-Hashes', list.s === 200 && !JSON.stringify(list.j).includes('scrypt') && !JSON.stringify(list.j).includes('pw_hash'));

const staff = new Client();
ok('falscher Code abgelehnt', (await staff.req('POST', '/api/login', { login: 'tomasz.nowak', password: 'FALSCH12345' })).s === 401);
const li = await staff.req('POST', '/api/login', { login: 'tomasz.nowak', password: cr.j.code });
ok('Mitarbeiter meldet sich mit Einmal-Code an, Passwortwechsel verlangt', li.s === 200 && li.j.user.mustChange === true && li.j.user.management === false, JSON.stringify(li.j));
ok('vor Passwortwechsel: eigene Ansicht gesperrt (403)', (await staff.req('GET', '/api/me/view')).s === 403);
ok('vor Passwortwechsel: Datenbestand gesperrt (403)', (await staff.req('GET', '/api/state')).s === 403);
ok('schwaches neues Passwort abgelehnt', (await staff.req('POST', '/api/password', { current: cr.j.code, next: '123' })).s === 400);
const pw = await staff.req('POST', '/api/password', { current: cr.j.code, next: 'Mein-eigenes-Passwort' });
ok('Passwortwechsel klappt, Sitzung wird beendet', pw.s === 200 && (await staff.req('GET', '/api/me/view')).s === 401);
ok('alter Code gilt nicht mehr', (await staff.req('POST', '/api/login', { login: 'tomasz.nowak', password: cr.j.code })).s === 401);
const li2 = await staff.req('POST', '/api/login', { login: 'tomasz.nowak', password: 'Mein-eigenes-Passwort' });
ok('Anmeldung mit eigenem Passwort', li2.s === 200 && li2.j.user.mustChange === false);

// Zugriffe des Mitarbeiters
const mv = await staff.req('GET', '/api/me/view');
ok('Mitarbeiter sieht die eigene Ansicht', mv.s === 200 && mv.j.name === 'Tomasz Nowak', JSON.stringify(mv.j)?.slice(0, 100));
const txt = JSON.stringify(mv.j);
ok('Ansicht enthält keine fremden Namen, Preise oder Rechnungen', !/Maria Kowalski|Jana Petrov|Lukas Brandt|monthlyCents|netCents|iban|invoice/i.test(txt));
const other = await staff.req('GET', '/api/me/view?employeeId=m1&id=m1');
ok('Mitarbeiter kann keine fremde Person per Parameter abfragen', other.j?.name === 'Tomasz Nowak');
for (const [m, p, b] of [['GET', '/api/state'], ['PUT', '/api/state', { rev: 1, data: { customers: [] } }], ['GET', '/api/users'], ['POST', '/api/users', { action: 'create', role: 'inhaber', login: 'hacker', display: 'Hacker' }], ['POST', '/api/users', { action: 'reset', id: 'x' }], ['GET', '/api/state/../users']]) {
	const r = await staff.req(m, p, b);
	ok(`Mitarbeiter: ${m} ${p} gesperrt`, r.s === 403 || r.s === 404, String(r.s));
}
const before = (await owner.req('GET', '/api/state')).j.rev;
ok('Datenbestand blieb unverändert', before === st.j.rev);

// Sperre nach Fehlversuchen
const brute = new Client();
let last = 0;
for (let i = 0; i < 6; i++) last = (await brute.req('POST', '/api/login', { login: 'tomasz.nowak', password: 'falsch' + i })).s;
ok('nach 5 Fehlversuchen: Zugang gesperrt (423)', last === 423, String(last));
ok('auch das richtige Passwort wird dann abgelehnt', (await brute.req('POST', '/api/login', { login: 'tomasz.nowak', password: 'Mein-eigenes-Passwort' })).s === 423);

// Sperren durch Inhaberin beendet Sitzungen
const id = list.j.users.find((u) => u.login === 'tomasz.nowak').id;
await owner.req('POST', '/api/users', { action: 'reset', id }); // neuer Code, Sitzung des Mitarbeiters endet
ok('nach Reset ist die alte Sitzung des Mitarbeiters ungültig', (await staff.req('GET', '/api/me/view')).s === 401);

// Rollen: Büro darf keine Verwaltungszugänge anlegen
const b = await owner.req('POST', '/api/users', { action: 'create', role: 'buero', login: 'buero.kraft', display: 'Büro Kraft' });
const buero = new Client();
await buero.req('POST', '/api/login', { login: 'buero.kraft', password: b.j.code });
await buero.req('POST', '/api/password', { current: b.j.code, next: 'Buero-Passwort-123' });
await buero.req('POST', '/api/login', { login: 'buero.kraft', password: 'Buero-Passwort-123' });
ok('Büro lädt Datenbestand', (await buero.req('GET', '/api/state')).s === 200);
ok('Büro darf keine Verwaltungszugänge anlegen (403)', (await buero.req('POST', '/api/users', { action: 'create', role: 'buero', login: 'x1x', display: 'X1x' })).s === 403);
const inh = await owner.req('POST', '/api/users', { action: 'create', role: 'inhaber', login: 'zweite.inhaberin', display: 'Zweite' });
ok('Rolle Inhaberin lässt sich nicht über die API vergeben', inh.s === 400, String(inh.s));
ok('Büro darf Inhaberin nicht sperren (403)', (await buero.req('POST', '/api/users', { action: 'disable', id: list.j.users.find((u) => u.login === 'anetta').id })).s === 403);

// Optimistische Sperre
const cur = (await owner.req('GET', '/api/state')).j;
ok('Speichern mit veralteter Revision = 409', (await owner.req('PUT', '/api/state', { rev: cur.rev - 1, data: cur.data })).s === 409);
ok('Speichern mit aktueller Revision klappt', (await owner.req('PUT', '/api/state', { rev: cur.rev, data: cur.data })).s === 200);

// Abmelden
await owner.req('POST', '/api/logout', {});
ok('nach Abmelden: Datenbestand gesperrt', (await owner.req('GET', '/api/state')).s === 401);

const hdr = (await anon.req('GET', '/api/session')).h;
ok('Sicherheits-Header gesetzt', hdr.get('x-content-type-options') === 'nosniff' && hdr.get('x-frame-options') === 'DENY' && hdr.get('cache-control') === 'no-store');
console.log(fail ? `\n${fail} Prüfung(en) FEHLGESCHLAGEN` : '\nAlle Prüfungen bestanden');
process.exit(fail ? 1 : 0);
