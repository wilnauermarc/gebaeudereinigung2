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
if (process.env.SETUP_TOKEN) {
	ok('Setup ohne Einrichtungscode abgelehnt (403)', (await owner.req('POST', '/api/setup', { display: 'Fremde', login: 'fremde', password: 'Ein-langes-Passwort-42', start: 'leer' })).s === 403);
	ok('Setup mit falschem Einrichtungscode abgelehnt (403)', (await owner.req('POST', '/api/setup', { display: 'Fremde', login: 'fremde', password: 'Ein-langes-Passwort-42', start: 'leer', setupCode: 'falsch-falsch' })).s === 403);
	ok('Session verrät, dass ein Code nötig ist', (await owner.req('GET', '/api/session')).j.setupNeedsCode === true);
}
ok('Setup mit schwachem Passwort abgelehnt', (await owner.req('POST', '/api/setup', { display: 'Anetta R.', login: 'anetta', password: 'kurz', start: 'demo', setupCode: process.env.SETUP_TOKEN })).s === 400);
const su = await owner.req('POST', '/api/setup', { display: 'Anetta R.', login: 'anetta', password: 'Ein-langes-Passwort-42', start: 'demo', team: 8, setupCode: process.env.SETUP_TOKEN });
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

// ── Mitarbeiter-App: Stempeln und Meldungen ──
const st2 = new Client();
const code2 = (await owner.req('POST', '/api/users', { action: 'reset', id: list.j.users.find((u) => u.login === 'tomasz.nowak').id })).j.code;
await st2.req('POST', '/api/login', { login: 'tomasz.nowak', password: code2 });
await st2.req('POST', '/api/password', { current: code2, next: 'Neues-Passwort-77' });
await st2.req('POST', '/api/login', { login: 'tomasz.nowak', password: 'Neues-Passwort-77' });
const view = (await st2.req('GET', '/api/me/view')).j;
const todayShift = view.shifts.find((x) => x.date === new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' }));
ok('Mitarbeiter hat heute einen Einsatz (Demo)', !!todayShift);
ok('Einsatz enthält nur eigene Hinweise, keine Preise', !/netCents|monthlyCents/.test(JSON.stringify(view)));
ok('Stempeln an fremdem Objekt abgelehnt (400)', (await st2.req('POST', '/api/me/punch', { action: 'in', siteId: 'k1-s1' })).s === 400);
ok('Ausstempeln ohne Einstempeln = 409', (await st2.req('POST', '/api/me/punch', { action: 'out', breakMin: 0 })).s === 409);
const cid = '11111111-1111-4111-8111-111111111111';
const pin = await st2.req('POST', '/api/me/punch', { action: 'in', siteId: todayShift.siteId, clientId: cid, clientAt: new Date(Date.now() - 10 * 60000).toISOString() });
ok('Einstempeln am eigenen Einsatz', pin.s === 200 && pin.j.ok, JSON.stringify(pin.j));
ok('Doppeltes Einstempeln mit derselben ID ist idempotent', (await st2.req('POST', '/api/me/punch', { action: 'in', siteId: todayShift.siteId, clientId: cid })).j?.duplicate === true);
ok('Zweites Einstempeln mit neuer ID = 409', (await st2.req('POST', '/api/me/punch', { action: 'in', siteId: todayShift.siteId, clientId: '22222222-2222-4222-8222-222222222222' })).s === 409);
ok('laufende Stempelung erscheint in der Ansicht', (await st2.req('GET', '/api/me/view')).j.open?.siteId === todayShift.siteId);
ok('Pause > 120 abgelehnt', (await st2.req('POST', '/api/me/punch', { action: 'out', breakMin: 500 })).s === 400);
ok('Zukünftige Gerätezeit wird ignoriert (Serverzeit zählt)', (await st2.req('POST', '/api/me/punch', { action: 'out', breakMin: 0, clientAt: '2099-01-01T00:00:00Z' })).s === 200);
const pend = await owner.req('GET', '/api/inbox');
ok('Verwaltung sieht die fertige Stempelung im Eingang', pend.s === 200 && pend.j.items.some((i) => i.kind === 'punch' && i.employeeId === 'm5'), JSON.stringify(pend.j).slice(0, 120));
ok('Mitarbeiter darf den Eingang nicht lesen (403)', (await st2.req('GET', '/api/inbox')).s === 403);
ok('Mitarbeiter darf nichts bestätigen (403)', (await st2.req('POST', '/api/inbox/ack', { ids: ['x'] })).s === 403);
ok('Mitarbeiter darf keine Fotos abrufen (403)', (await st2.req('GET', '/api/inbox/photo?id=x')).s === 403);
ok('Krank mit rückwirkend 20 Tagen abgelehnt', (await st2.req('POST', '/api/me/request', { kind: 'krank', from: '2020-01-01', to: '2020-01-02' })).s === 400);
const dayStr = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
ok('Urlaub rückwirkend abgelehnt', (await st2.req('POST', '/api/me/request', { kind: 'urlaub', from: dayStr(-3), to: dayStr(-2) })).s === 400);
ok('Urlaub mit Ende vor Beginn abgelehnt', (await st2.req('POST', '/api/me/request', { kind: 'urlaub', from: dayStr(10), to: dayStr(5) })).s === 400);
ok('Urlaub beantragen', (await st2.req('POST', '/api/me/request', { kind: 'urlaub', from: dayStr(20), to: dayStr(22) })).s === 200);
ok('gleicher Urlaubsantrag doppelt = 409', (await st2.req('POST', '/api/me/request', { kind: 'urlaub', from: dayStr(20), to: dayStr(22) })).s === 409);
ok('Mangel ohne Text abgelehnt', (await st2.req('POST', '/api/me/defect', { siteId: todayShift.siteId, text: 'x' })).s === 400);
ok('Mangel an fremdem Objekt abgelehnt', (await st2.req('POST', '/api/me/defect', { siteId: 'k1-s1', text: 'Fenster kaputt hier' })).s === 400);
ok('Foto mit falschem Inhalt abgelehnt', (await st2.req('POST', '/api/me/defect', { siteId: todayShift.siteId, text: 'Boden nass hier', photo: 'data:image/jpeg;base64,' + Buffer.from('das ist kein bild').toString('base64') })).s === 400);
ok('Skript als „Foto“ abgelehnt', (await st2.req('POST', '/api/me/defect', { siteId: todayShift.siteId, text: 'Boden nass hier', photo: 'data:text/html;base64,' + Buffer.from('<script>alert(1)</script>').toString('base64') })).s === 400);
const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(200, 1)]).toString('base64');
const dres = await st2.req('POST', '/api/me/defect', { siteId: todayShift.siteId, text: 'Boden im Flur ist nass', photo: 'data:image/jpeg;base64,' + jpeg });
ok('Mangel mit Foto melden', dres.s === 200, JSON.stringify(dres.j));
const bigJpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(400_000, 1)]).toString('base64');
ok('zu großes Foto abgelehnt', (await st2.req('POST', '/api/me/defect', { siteId: todayShift.siteId, text: 'Boden im Flur ist nass', photo: 'data:image/jpeg;base64,' + bigJpeg })).s === 400);
const pend2 = (await owner.req('GET', '/api/inbox')).j.items;
const dItem = pend2.find((i) => i.kind === 'defect' && i.hasPhoto);
ok('Verwaltung sieht Mangelmeldung mit Foto', !!dItem?.hasPhoto);
const ph = await fetch(B + '/api/inbox/photo?id=' + dItem.id, { headers: { cookie: owner.cookie } });
ok('Verwaltung kann das Foto laden, Typ aus dem Dateikopf', ph.status === 200 && ph.headers.get('content-type') === 'image/jpeg' && ph.headers.get('x-content-type-options') === 'nosniff');
ok('Foto ohne Anmeldung nicht abrufbar', (await fetch(B + '/api/inbox/photo?id=' + dItem.id)).status === 401);
const ack = await owner.req('POST', '/api/inbox/ack', { ids: pend2.map((i) => i.id) });
ok('Eingang bestätigen', ack.s === 200 && (await owner.req('GET', '/api/inbox')).j.items.length === 0);
const after = (await st2.req('GET', '/api/me/view')).j;
ok('Mitarbeiter sieht Meldungen mit Status in „Meine Meldungen“', after.requests.length >= 2);

// ── Stempel-QR: Schlüssel je Objekt ──
{
	const cur = (await owner.req('GET', '/api/state')).j;
	const site = cur.data.customers.flatMap((c) => c.sites).find((x) => x.id === todayShift.siteId);
	site.stampToken = 'GEHEIMER-TESTSCHLUESSEL-1';
	cur.data.settings = { requireQr: true };
	ok('Verwaltung setzt Stempel-Schlüssel und „nur per QR“', (await owner.req('PUT', '/api/state', { rev: cur.rev, data: cur.data })).s === 200);
	const v2 = (await st2.req('GET', '/api/me/view')).j;
	ok('Mitarbeiter-Ansicht verrät den Schlüssel nicht', !JSON.stringify(v2).includes('GEHEIMER') && v2.requireQr === true);
	const noTok = await st2.req('POST', '/api/me/punch', { action: 'in', siteId: todayShift.siteId, clientId: '33333333-3333-4333-8333-333333333333' });
	ok('„Nur per QR“: Einstempeln ohne Schlüssel abgelehnt (400)', noTok.s === 400 && noTok.j.needsQr === true, JSON.stringify(noTok.j));
	ok('falscher Schlüssel abgelehnt (400)', (await st2.req('POST', '/api/me/punch', { action: 'in', siteId: todayShift.siteId, token: 'GEHEIMER-TESTSCHLUESSEL-2', clientId: '44444444-4444-4444-8444-444444444444' })).s === 400);
	ok('Schlüssel eines anderen Objekts abgelehnt', (await st2.req('POST', '/api/me/punch', { action: 'in', siteId: todayShift.siteId, token: 'x', clientId: '55555555-5555-4555-8555-555555555555' })).s === 400);
	const good = await st2.req('POST', '/api/me/punch', { action: 'in', siteId: todayShift.siteId, token: 'GEHEIMER-TESTSCHLUESSEL-1', clientId: '66666666-6666-4666-8666-666666666666' });
	ok('richtiger Schlüssel: Einstempeln klappt', good.s === 200, JSON.stringify(good.j));
	await new Promise((r) => setTimeout(r, 1500));
	const outr = await st2.req('POST', '/api/me/punch', { action: 'out', breakMin: 0 });
	ok('Ausstempeln ohne Scan möglich (Versehen-Regel: unter einer Minute wird verworfen)', outr.s === 200);
	const cur2 = (await owner.req('GET', '/api/state')).j;
	cur2.data.settings = { requireQr: false };
	await owner.req('PUT', '/api/state', { rev: cur2.rev, data: cur2.data });
	const free = await st2.req('POST', '/api/me/punch', { action: 'in', siteId: todayShift.siteId, clientId: '77777777-7777-4777-8777-777777777777' });
	ok('ohne „nur per QR“: Einstempeln ohne Schlüssel erlaubt', free.s === 200);
	const wrongOpt = await st2.req('POST', '/api/me/punch', { action: 'out', breakMin: 0 });
	ok('aufräumen', wrongOpt.s === 200);
}

// ── Standort-Abgleich beim Stempeln ──
{
	const cur = (await owner.req('GET', '/api/state')).j;
	const site = cur.data.customers.flatMap((c) => c.sites).find((x) => x.id === todayShift.siteId);
	site.lat = 50.1109; site.lon = 8.6821;
	cur.data.settings = { geo: true, geoRadius: 150 };
	ok('Verwaltung schaltet Standort-Abgleich ein', (await owner.req('PUT', '/api/state', { rev: cur.rev, data: cur.data })).s === 200);
	ok('Mitarbeiter-Ansicht kennt den Schalter, aber keine Position', (await st2.req('GET', '/api/me/view')).j.geo === true && !JSON.stringify((await st2.req('GET', '/api/me/view')).j).includes('50.1109'));
	const gin = await st2.req('POST', '/api/me/punch', { action: 'in', siteId: todayShift.siteId, geo: { lat: 50.2109, lon: 8.6821, acc: 10 }, clientId: '88888888-8888-4888-8888-888888888888', clientAt: new Date(Date.now() - 5 * 60000).toISOString() });
	ok('Weit entfernt: Einstempeln wird NICHT gesperrt', gin.s === 200, JSON.stringify(gin.j));
	const gout = await st2.req('POST', '/api/me/punch', { action: 'out', breakMin: 0, geo: { lat: 'x', lon: 'y' } });
	ok('Ungültige Koordinaten: Ausstempeln klappt trotzdem', gout.s === 200);
	const items = (await owner.req('GET', '/api/inbox')).j.items.filter((i) => i.kind === 'punch');
	const mine = items.find((i) => i.payload.geoIn);
	ok('Nur das Ergebnis wird gespeichert (fern, ohne Koordinaten)', mine && mine.payload.geoIn.s === 'fern' && mine.payload.geoOut.s === 'verweigert' && !JSON.stringify(mine.payload).includes('50.2109'), JSON.stringify(mine?.payload));
	const cur3 = (await owner.req('GET', '/api/state')).j;
	cur3.data.settings = {};
	await owner.req('PUT', '/api/state', { rev: cur3.rev, data: cur3.data });
	const off = await st2.req('POST', '/api/me/punch', { action: 'in', siteId: todayShift.siteId, geo: { lat: 1, lon: 1 }, clientId: '99999999-9999-4999-8999-999999999999' });
	await st2.req('POST', '/api/me/punch', { action: 'out', breakMin: 0 });
	ok('Schalter aus: Server speichert keinen Standort-Vermerk', off.s === 200 && !(await owner.req('GET', '/api/inbox')).j.items.some((i) => i.payload.geoIn && i.id === off.j.id));
}

// ── Korrekturworkflow: Antrag → Prüfung → Freigabe ──
{
	const t0 = (await st2.req('GET', '/api/me/view')).j.times.find((t) => !t.voided);
	ok('Es gibt eine Buchung zum Korrigieren', !!t0);
	const body = { entryId: t0.id, start: '07:00', end: '11:30', breakMin: 15, reason: 'Ich habe die Pause vergessen' };
	ok('Ungültige Uhrzeit abgelehnt (400)', (await st2.req('POST', '/api/me/correction', { ...body, start: '25:99' })).s === 400);
	ok('Ohne Begründung abgelehnt (400)', (await st2.req('POST', '/api/me/correction', { ...body, reason: '' })).s === 400);
	ok('Fremde/unbekannte Buchung = 404', (await st2.req('POST', '/api/me/correction', { ...body, entryId: 'gibt-es-nicht' })).s === 404);
	const c1 = await st2.req('POST', '/api/me/correction', body);
	ok('Antrag wird angenommen', c1.s === 200 && !!c1.j.id, JSON.stringify(c1.j));
	ok('Zweiter Antrag zur selben Buchung = 409', (await st2.req('POST', '/api/me/correction', body)).s === 409);
	ok('Anonym nicht möglich (401)', (await anon.req('POST', '/api/me/correction', body)).s === 401);
	const view1 = (await st2.req('GET', '/api/me/view')).j;
	ok('Mitarbeiter sieht den Antrag als offen', view1.requests.some((r) => r.kind === 'correction' && r.status === 'offen'), JSON.stringify(view1.requests));
	const inb = (await owner.req('GET', '/api/inbox')).j.items.find((i) => i.id === c1.j.id);
	ok('Verwaltung sieht den Antrag im Eingang', inb?.kind === 'correction' && inb.payload.start === '07:00');
	// Verwaltung entscheidet (die App schreibt das Ergebnis in den Datenbestand)
	const cur = (await owner.req('GET', '/api/state')).j;
	cur.data.corrections = [{ id: 'c' + c1.j.id, employeeId: 'm5', entryId: t0.id, date: t0.date, old: { start: t0.start, end: t0.end, breakMin: t0.breakMin }, proposed: { start: '07:00', end: '11:30', breakMin: 15 }, reason: body.reason, status: 'abgelehnt', reply: 'Bitte Nachweis mitbringen', createdAt: new Date().toISOString(), decidedOn: new Date().toISOString() }];
	ok('Verwaltung speichert Entscheidung', (await owner.req('PUT', '/api/state', { rev: cur.rev, data: cur.data })).s === 200);
	const view2 = (await st2.req('GET', '/api/me/view')).j;
	const r2 = view2.requests.find((r) => r.kind === 'correction');
	ok('Mitarbeiter sieht Entscheidung und Antwort', r2?.status === 'abgelehnt' && r2.reply === 'Bitte Nachweis mitbringen', JSON.stringify(r2));
	await owner.req('POST', '/api/inbox/ack', { ids: [c1.j.id] });
	ok('Nach Entscheidung ist ein neuer Antrag möglich', (await st2.req('POST', '/api/me/correction', body)).s === 200);
	cur.rev = (await owner.req('GET', '/api/state')).j.rev;
	cur.data.lockedMonths = [...(cur.data.lockedMonths ?? []), t0.date.slice(0, 7)];
	await owner.req('PUT', '/api/state', { rev: cur.rev, data: cur.data });
	ok('Abgeschlossener Monat: Antrag online nicht möglich (400)', (await st2.req('POST', '/api/me/correction', { ...body, reason: 'noch einmal' })).s === 400);
	const cur4 = (await owner.req('GET', '/api/state')).j;
	cur4.data.lockedMonths = cur4.data.lockedMonths.filter((m) => m !== t0.date.slice(0, 7));
	await owner.req('PUT', '/api/state', { rev: cur4.rev, data: cur4.data });
}

// ── Checkliste (Mitarbeiter) und Abnahme-Link (Kunde) ──
{
	const dayKey = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
	const yesterday = dayKey(-1);
	const cur = (await owner.req('GET', '/api/state')).j;
	const site = cur.data.customers.flatMap((c) => c.sites).find((x) => x.id === todayShift.siteId);
	site.lv = [{ id: 'vt', validFrom: '2026-01-01', note: '', createdAt: new Date().toISOString(), createdBy: 'T', items: [
		{ id: 'it1', room: 'Flur', task: 'Boden wischen', interval: 'taeglich', areaM2: null, note: '' },
		{ id: 'it2', room: 'WC', task: 'Sanitär reinigen', interval: 'taeglich', areaM2: null, note: '' },
		{ id: 'it3', room: 'Fenster', task: 'Fenster putzen', interval: 'quartal', areaM2: null, note: '' }] }];
	site.acceptToken = 'ABNAHME-TESTSCHLUESSEL-0123456789';
	cur.data.serviceRecords = [{ id: 'sr1', siteId: site.id, date: yesterday, execution: 'teilweise', missedItemIds: ['it2'], executionNote: 'INTERN-NOTIZ-GEHEIM', lvVersionId: 'vt', acceptance: 'offen', acceptedBy: '', acceptedOn: null, acceptNote: '', history: [], reportedBy: 'Tomasz Nowak' }];
	ok('Verwaltung legt Leistungsverzeichnis und Abnahme-Schlüssel an', (await owner.req('PUT', '/api/state', { rev: cur.rev, data: cur.data })).s === 200);

	const view = (await st2.req('GET', '/api/me/view')).j;
	const sh = view.shifts.find((x) => x.siteId === todayShift.siteId && x.lv);
	ok('Mitarbeiter-Ansicht enthält heute die Leistungen des Objekts (ohne Schlüssel)', !!sh && sh.lv.length === 3 && !JSON.stringify(view).includes('ABNAHME-TESTSCHLUESSEL'));
	ok('Checkliste mit unbekannter Leistung abgelehnt (400)', (await st2.req('POST', '/api/me/checklist', { siteId: todayShift.siteId, doneIds: ['nope'] })).s === 400);
	ok('Checkliste für fremdes Objekt abgelehnt (400)', (await st2.req('POST', '/api/me/checklist', { siteId: 'k1-s1-fremd', doneIds: ['it1'] })).s === 400);
	const cid = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
	const c1 = await st2.req('POST', '/api/me/checklist', { siteId: todayShift.siteId, doneIds: ['it1', 'it3'], note: 'Alles bis auf WC', clientId: cid });
	ok('Checkliste wird angenommen', c1.s === 200, JSON.stringify(c1.j));
	ok('gleiche Checkliste erneut gesendet ist idempotent', (await st2.req('POST', '/api/me/checklist', { siteId: todayShift.siteId, doneIds: ['it1', 'it3'], clientId: cid })).j?.duplicate === true);
	ok('Checkliste ohne Anmeldung nicht möglich (401)', (await anon.req('POST', '/api/me/checklist', { siteId: todayShift.siteId, doneIds: [] })).s === 401);
	const ib = (await owner.req('GET', '/api/inbox')).j.items.find((i) => i.kind === 'checklist');
	ok('Verwaltung sieht die Checkliste mit fälligen und abgehakten Leistungen', ib && ib.payload.dueIds.length === 2 && ib.payload.doneIds.includes('it1') && !ib.payload.doneIds.includes('it2'), JSON.stringify(ib?.payload));

	// öffentliche Abnahme-Seite
	const pub = new Client();
	const q = (t) => `/api/abnahme?s=${site.id}&t=${t}`;
	ok('Abnahme ohne Schlüssel: 404', (await pub.req('GET', `/api/abnahme?s=${site.id}`)).s === 404);
	ok('Abnahme mit falschem Schlüssel: 404', (await pub.req('GET', q('FALSCHER-SCHLUESSEL-0123456789'))).s === 404);
	const g = await pub.req('GET', q('ABNAHME-TESTSCHLUESSEL-0123456789'));
	const gtxt = JSON.stringify(g.j);
	ok('Abnahme mit Schlüssel liefert die gemeldeten Tage', g.s === 200 && g.j.days.length === 1 && g.j.days[0].missed[0] === 'WC: Sanitär reinigen', gtxt.slice(0, 200));
	ok('Abnahme-Seite verrät keine internen Notizen, Namen oder Schlüssel', !gtxt.includes('INTERN-NOTIZ') && !gtxt.includes('Tomasz') && !gtxt.includes('TESTSCHLUESSEL'));
	const post = (b) => pub.req('POST', '/api/abnahme', { s: site.id, t: 'ABNAHME-TESTSCHLUESSEL-0123456789', ...b });
	ok('Abnahme ohne Namen abgelehnt (400)', (await post({ date: yesterday, acceptance: 'abgenommen', by: '' })).s === 400);
	ok('Beanstandung ohne Text abgelehnt (400)', (await post({ date: yesterday, acceptance: 'beanstandet', by: 'Frau Muster' })).s === 400);
	ok('Tag ohne Meldung abgelehnt (409)', (await post({ date: dayKey(-3), acceptance: 'abgenommen', by: 'Frau Muster' })).s === 409);
	ok('Zu alter oder künftiger Tag abgelehnt (400)', (await post({ date: dayKey(-200), acceptance: 'abgenommen', by: 'Frau Muster' })).s === 400 && (await post({ date: dayKey(5), acceptance: 'abgenommen', by: 'Frau Muster' })).s === 400);
	ok('Falscher Schlüssel beim Abnehmen: 404', (await pub.req('POST', '/api/abnahme', { s: site.id, t: 'FALSCHER-SCHLUESSEL-0123456789', date: yesterday, acceptance: 'abgenommen', by: 'X Y' })).s === 404);
	ok('Fremder Ursprung beim Abnehmen: 403', (await pub.req('POST', '/api/abnahme', { s: site.id, t: 'ABNAHME-TESTSCHLUESSEL-0123456789', date: yesterday, acceptance: 'abgenommen', by: 'X Y' }, { origin: 'http://evil.example' })).s === 403);
	ok('Abnahme wird angenommen', (await post({ date: yesterday, acceptance: 'abgenommen', by: 'Frau Muster' })).s === 200);
	ok('zweite Entscheidung für denselben Tag: 409', (await post({ date: yesterday, acceptance: 'beanstandet', by: 'Frau Muster', note: 'doch nicht' })).s === 409);
	const g2 = await pub.req('GET', q('ABNAHME-TESTSCHLUESSEL-0123456789'));
	ok('Seite zeigt „Meldung eingegangen“, bis die Verwaltung übernimmt', g2.j.days[0].received === true);
	const acc = (await owner.req('GET', '/api/inbox')).j.items.find((i) => i.kind === 'acceptance');
	ok('Verwaltung sieht die Abnahme des Kunden im Eingang', acc?.payload.acceptance === 'abgenommen' && acc.payload.by === 'Frau Muster');
	ok('Mitarbeiter können die öffentliche Abnahme nicht über /api/me nutzen und sehen keine Kundenmeldungen', !JSON.stringify((await st2.req('GET', '/api/me/view')).j).includes('Frau Muster'));
	ok('Verwaltungs-API bleibt ohne Anmeldung gesperrt (401)', (await pub.req('GET', '/api/inbox')).s === 401);
}

// ── Live-Stand für den Leitstand ──
{
	ok('Live-Stand ohne Anmeldung: 401', (await anon.req('GET', '/api/live')).s === 401);
	ok('Live-Stand für Mitarbeitende gesperrt (403)', (await st2.req('GET', '/api/live')).s === 403);
	const pin = await st2.req('POST', '/api/me/punch', { action: 'in', siteId: todayShift.siteId, clientId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' });
	ok('Einstempeln für den Live-Test', pin.s === 200, JSON.stringify(pin.j));
	const lv = await owner.req('GET', '/api/live');
	const open = lv.j?.punches?.find((x) => x.employeeId === 'm5' && x.endAt === null);
	ok('Verwaltung sieht die laufende Stempelung im Live-Stand', lv.s === 200 && !!open && open.siteId === todayShift.siteId, JSON.stringify(lv.j)?.slice(0, 200));
	ok('Live-Stand enthält keine Fotos und keine Standortdaten', !/photo|lat|lon|geo/i.test(JSON.stringify(lv.j)));
	await st2.req('POST', '/api/me/punch', { action: 'out', breakMin: 0 });
}

// ── Schichttausch ──
{
	// Lukas (m7) bekommt einen Zugang und wird für den Test von allen Plänen genommen, damit er sicher frei ist
	const lc = (await owner.req('POST', '/api/users', { action: 'create', role: 'mitarbeiter', employeeId: 'm7', login: 'lukas.brandt', display: 'Lukas Brandt' })).j.code;
	const st3 = new Client();
	await st3.req('POST', '/api/login', { login: 'lukas.brandt', password: lc });
	await st3.req('POST', '/api/password', { current: lc, next: 'Lukas-Passwort-99' });
	await st3.req('POST', '/api/login', { login: 'lukas.brandt', password: 'Lukas-Passwort-99' });
	let cur = (await owner.req('GET', '/api/state')).j;
	for (const c of cur.data.customers) for (const x of c.sites) if (x.plan) x.plan.staffIds = x.plan.staffIds.filter((i) => i !== 'm7');
	cur.data.covers = [];
	await owner.req('PUT', '/api/state', { rev: cur.rev, data: cur.data });
	const myView = (await st2.req('GET', '/api/me/view')).j;
	const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
	const fut = myView.shifts.find((x) => x.date > today);
	ok('Tomasz hat einen künftigen Einsatz', !!fut);
	ok('fremden Einsatz anbieten abgelehnt (400)', (await st2.req('POST', '/api/me/swap', { action: 'offer', siteId: 'k1-s1', date: fut.date })).s === 400);
	ok('vergangenen Einsatz anbieten abgelehnt', (await st2.req('POST', '/api/me/swap', { action: 'offer', siteId: fut.siteId, date: '2020-01-01' })).s === 400);
	const off = await st2.req('POST', '/api/me/swap', { action: 'offer', siteId: fut.siteId, date: fut.date });
	ok('Einsatz zum Tausch anbieten', off.s === 200, JSON.stringify(off.j));
	ok('gleiches Angebot doppelt = 409', (await st2.req('POST', '/api/me/swap', { action: 'offer', siteId: fut.siteId, date: fut.date })).s === 409);
	const lv = (await st3.req('GET', '/api/me/swaps')).j;
	const seen = lv.offers.find((o) => o.id === off.j.id);
	ok('Kollege sieht das Angebot (nur Vorname, Zeit, Objekt)', !!seen && seen.by === 'Tomasz' && !/Nowak|netCents/.test(JSON.stringify(lv)), JSON.stringify(lv).slice(0, 160));
	ok('Eigenes Angebot erscheint nicht bei sich selbst als Angebot', !(await st2.req('GET', '/api/me/swaps')).j.offers.some((o) => o.id === off.j.id));
	{
		const n3 = (await st3.req('GET', '/api/me/notifications')).j;
		ok('Kollege bekommt eine Mitteilung zum Angebot', n3.items.some((n) => n.kind === 'swap_offer' && n.ref === off.j.id && !n.read) && n3.unread >= 1, JSON.stringify(n3).slice(0, 200));
		ok('Mitteilung enthält Vorname, aber keine Preise', !/Nowak|netCents/.test(JSON.stringify(n3)));
		const n2 = (await st2.req('GET', '/api/me/notifications')).j;
		ok('Anbieter bekommt keine Mitteilung zum eigenen Angebot', !n2.items.some((n) => n.kind === 'swap_offer'));
	}
	ok('eigenes Angebot übernehmen abgelehnt', (await st2.req('POST', '/api/me/swap', { action: 'take', id: off.j.id })).s === 400);
	ok('Fremde dürfen das Angebot nicht zurückziehen (403)', (await st3.req('POST', '/api/me/swap', { action: 'withdraw', id: off.j.id })).s === 403);
	ok('Mitarbeiter dürfen Tauschwünsche nicht lesen (403)', (await st3.req('GET', '/api/swaps')).s === 403);
	ok('Mitarbeiter dürfen nicht entscheiden (403)', (await st3.req('POST', '/api/swaps/decide', { id: off.j.id, decision: 'approve' })).s === 403);
	ok('Entscheidung vor Übernahme nicht möglich (404)', (await owner.req('POST', '/api/swaps/decide', { id: off.j.id, decision: 'approve' })).s === 404);
	ok('Kollege übernimmt', (await st3.req('POST', '/api/me/swap', { action: 'take', id: off.j.id })).s === 200);
	{
		const n3 = (await st3.req('GET', '/api/me/notifications')).j;
		ok('nach Vergabe verschwindet die Angebots-Mitteilung', !n3.items.some((n) => n.kind === 'swap_offer' && n.ref === off.j.id));
		const n2 = (await st2.req('GET', '/api/me/notifications')).j;
		ok('Anbieter erfährt, wer übernimmt', n2.items.some((n) => n.kind === 'swap_taken' && n.payload.other === 'Lukas'));
	}
	ok('zweites Übernehmen nicht mehr möglich', (await st3.req('POST', '/api/me/swap', { action: 'take', id: off.j.id })).s >= 400);
	const wait = (await owner.req('GET', '/api/swaps')).j.swaps;
	ok('Verwaltung sieht den Tauschwunsch zur Entscheidung', wait.some((w) => w.id === off.j.id && w.status === 'angenommen' && w.takenBy === 'm7'));
	ok('Genehmigen', (await owner.req('POST', '/api/swaps/decide', { id: off.j.id, decision: 'approve' })).s === 200);
	{
		const a = (await st2.req('GET', '/api/me/notifications')).j, b = (await st3.req('GET', '/api/me/notifications')).j;
		ok('beide erfahren von der Genehmigung', a.items.some((n) => n.kind === 'swap_approved') && b.items.some((n) => n.kind === 'swap_approved'));
		await st2.req('POST', '/api/me/notifications', { all: true });
		ok('„Alle gelesen“ wirkt nur bei der eigenen Person', (await st2.req('GET', '/api/me/notifications')).j.unread === 0 && (await st3.req('GET', '/api/me/notifications')).j.unread >= 1);
		const foreign = (await st2.req('GET', '/api/me/notifications')).j.items[0];
		await st3.req('POST', '/api/me/notifications', { ids: [foreign.id] });
		ok('Fremde Mitteilungs-IDs lassen sich nicht als gelesen markieren', (await st2.req('GET', '/api/me/notifications')).j.items.find((n) => n.id === foreign.id).read === true && true);
		ok('Verwaltung (ohne Person) bekommt keine Mitteilungen', (await owner.req('GET', '/api/me/notifications')).j.items.length === 0);
	}
	ok('Zweite Entscheidung nicht möglich', (await owner.req('POST', '/api/swaps/decide', { id: off.j.id, decision: 'reject' })).s === 404);
	// Verwaltung übernimmt (wie der Browser): Vertretung mit „ersetzt“ im Plan anlegen
	cur = (await owner.req('GET', '/api/state')).j;
	cur.data.covers.push({ id: 'sw' + off.j.id, siteId: fut.siteId, date: fut.date, employeeId: 'm7', replacesId: 'm5', swapId: off.j.id });
	await owner.req('PUT', '/api/state', { rev: cur.rev, data: cur.data });
	await owner.req('POST', '/api/swaps/applied', { ids: [off.j.id] });
	ok('Tomasz hat den Einsatz nicht mehr', !(await st2.req('GET', '/api/me/view')).j.shifts.some((x) => x.siteId === fut.siteId && x.date === fut.date));
	ok('Lukas hat den Einsatz jetzt', (await st3.req('GET', '/api/me/view')).j.shifts.some((x) => x.siteId === fut.siteId && x.date === fut.date));
	ok('abgewickelter Tausch erscheint nicht mehr in der Entscheidungsliste', !(await owner.req('GET', '/api/swaps')).j.swaps.some((w) => w.id === off.j.id));
	// Ablehnen
	const fut2 = (await st2.req('GET', '/api/me/view')).j.shifts.find((x) => x.date > today && !(x.siteId === fut.siteId && x.date === fut.date));
	if (fut2) {
		const o2 = await st2.req('POST', '/api/me/swap', { action: 'offer', siteId: fut2.siteId, date: fut2.date });
		await st3.req('POST', '/api/me/swap', { action: 'take', id: o2.j.id });
		ok('Ablehnen', (await owner.req('POST', '/api/swaps/decide', { id: o2.j.id, decision: 'reject' })).s === 200);
		ok('Tomasz behält den abgelehnten Einsatz', (await st2.req('GET', '/api/me/view')).j.shifts.some((x) => x.siteId === fut2.siteId && x.date === fut2.date));
		ok('abgelehnter Wunsch zeigt Status „abgelehnt“', (await st2.req('GET', '/api/me/swaps')).j.mine.some((m) => m.id === o2.j.id && m.status === 'abgelehnt'));
	}
	// Zurückziehen
	const fut3 = (await st2.req('GET', '/api/me/view')).j.shifts.find((x) => x.date > today && !(fut2 && x.siteId === fut2.siteId && x.date === fut2.date));
	if (fut3) {
		const o3 = await st2.req('POST', '/api/me/swap', { action: 'offer', siteId: fut3.siteId, date: fut3.date });
		ok('Anbieter kann zurückziehen', (await st2.req('POST', '/api/me/swap', { action: 'withdraw', id: o3.j.id })).s === 200);
		ok('zurückgezogenes Angebot kann nicht übernommen werden', (await st3.req('POST', '/api/me/swap', { action: 'take', id: o3.j.id })).s >= 400);
	}
}

// Sperre nach Fehlversuchen
const brute = new Client();
let last = 0;
for (let i = 0; i < 6; i++) last = (await brute.req('POST', '/api/login', { login: 'tomasz.nowak', password: 'falsch' + i })).s;
ok('nach 5 Fehlversuchen: Zugang gesperrt (423)', last === 423, String(last));
ok('auch das richtige Passwort wird dann abgelehnt', (await brute.req('POST', '/api/login', { login: 'tomasz.nowak', password: 'Mein-eigenes-Passwort' })).s === 423);

// Sperren durch Inhaberin beendet Sitzungen
// ── Eigenen Namen ändern ──
{
	ok('Name ändern ohne Anmeldung: 401', (await anon.req('POST', '/api/profile', { display: 'X Y' })).s === 401);
	ok('Name ändern als Mitarbeiter: 403', (await st2.req('POST', '/api/profile', { display: 'Hacker Test' })).s === 403);
	ok('zu kurzer oder unzulässiger Name abgelehnt (400)', (await owner.req('POST', '/api/profile', { display: 'A' })).s === 400 && (await owner.req('POST', '/api/profile', { display: '<b>Mist</b>' })).s === 400);
	const r = await owner.req('POST', '/api/profile', { display: '  Anna   Beispiel ' });
	ok('Name wird gespeichert und bereinigt', r.s === 200 && r.j.display === 'Anna Beispiel');
	ok('Sitzung zeigt den neuen Namen, der Anmeldename bleibt', (await owner.req('GET', '/api/session')).j.user.display === 'Anna Beispiel');
	await owner.req('POST', '/api/profile', { display: 'Anetta R.' });
}

// ── Funktionsumfang (Bausteine) ──
{
	const setModules = async (client, modules) => { const cur = (await owner.req('GET', '/api/state')).j; cur.data.settings = { ...(cur.data.settings ?? {}), modules }; return client.req('PUT', '/api/state', { rev: cur.rev, data: cur.data }); };
	ok('Administratorin ändert den Funktionsumfang', (await setModules(owner, { nachweis: false })).s === 200);
	const v1 = await st2.req('GET', '/api/me/view');
	ok('Mitarbeiter-Ansicht meldet ausgeschaltete Bausteine', v1.s === 200 && v1.j.modules.nachweis === false && v1.j.modules.zeiten === true && v1.j.modules.active === true, JSON.stringify(v1.j.modules));
	ok('Ausgeschaltet: Checkliste wird auf dem Server abgelehnt (403)', (await st2.req('POST', '/api/me/checklist', { siteId: todayShift.siteId, doneIds: [] })).s === 403);
	ok('Ausgeschaltet: öffentliche Abnahme-Seite liefert 404', (await anon.req('GET', `/api/abnahme?s=${todayShift.siteId}&t=ABNAHME-TESTSCHLUESSEL-0123456789`)).s === 404);
	ok('Zeiterfassung bleibt nutzbar (Korrektur-Endpunkt antwortet nicht mit 403)', (await st2.req('POST', '/api/me/correction', {})).s !== 403);
	ok('Zeiten aus: Stempeln und Mitarbeiter-App folgen (403)', (await setModules(owner, { zeiten: false })).s === 200 && (await st2.req('POST', '/api/me/punch', { action: 'in', siteId: todayShift.siteId })).s === 403);
	ok('Mitarbeiter-App aus: nur noch die Ansicht mit Hinweis, alles andere 403', (await setModules(owner, { mitarbeiter: false })).s === 200 && (await st2.req('GET', '/api/me/view')).j.modules.active === false && (await st2.req('POST', '/api/me/request', { kind: 'krank', from: '2026-11-04', to: '2026-11-04' })).s === 403);
	ok('Verwaltungs-Schnittstellen bleiben davon unberührt', (await owner.req('GET', '/api/inbox')).s === 200);
	ok('Alles wieder an', (await setModules(owner, {})).s === 200 && (await st2.req('GET', '/api/me/view')).j.modules.active === true);
}

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
ok('Büro darf den Funktionsumfang nicht ändern (403)', (await (async () => { const base = (await owner.req('GET', '/api/state')).j; const d = base.data; d.settings = { ...(d.settings ?? {}), modules: { zusatz: false } }; return buero.req('PUT', '/api/state', { rev: base.rev, data: d }); })()).s === 403);
ok('Büro darf keine Verwaltungszugänge anlegen (403)', (await buero.req('POST', '/api/users', { action: 'create', role: 'buero', login: 'x1x', display: 'X1x' })).s === 403);
ok('Büro darf keinen Administrator anlegen (403)', (await buero.req('POST', '/api/users', { action: 'create', role: 'inhaber', login: 'hacker2', display: 'Hacker' })).s === 403);
// Weiterer Administrator: nur durch einen Administrator, mit Einmal-Code und Passwortzwang
const inh = await owner.req('POST', '/api/users', { action: 'create', role: 'inhaber', login: 'zweite.admin', display: 'Zweite Admin' });
ok('Administrator legt weiteren Administrator an', inh.s === 200 && !!inh.j.code, JSON.stringify(inh.j));
const adm = new Client();
const al = await adm.req('POST', '/api/login', { login: 'zweite.admin', password: inh.j.code });
ok('neuer Administrator muss zuerst ein Passwort wählen', al.s === 200 && al.j.user.mustChange === true && (await adm.req('GET', '/api/state')).s === 403);
await adm.req('POST', '/api/password', { current: inh.j.code, next: 'Admin-Passwort-1234' });
await adm.req('POST', '/api/login', { login: 'zweite.admin', password: 'Admin-Passwort-1234' });
ok('neuer Administrator sieht Daten und Zugänge', (await adm.req('GET', '/api/state')).s === 200 && (await adm.req('GET', '/api/users')).s === 200);
ok('neuer Administrator darf Büro-Zugänge anlegen', (await adm.req('POST', '/api/users', { action: 'create', role: 'buero', login: 'buero.zwei', display: 'Büro Zwei' })).s === 200);
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
