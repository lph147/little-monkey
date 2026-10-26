// The app: added to a phone's home screen, the game opens full screen and sideways (manifest.webmanifest),
// with the monkey as its icon (tools/make-icons.js), and a service worker (sw.js) that always loads the
// newest version when there's a connection and keeps a copy for when there isn't.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {ROOT, ENTRY} = require('./fake-browser');
const {ICONS, DIR, draw, read} = require('../tools/make-icons');

const manifest = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));
const page = () => fs.readFileSync(path.join(ROOT, ENTRY), 'utf8');

test('the app opens full screen and sideways, named 小猴子, from the game’s own page', () => {
  const m = manifest();
  assert.equal(m.short_name, '小猴子');
  assert.match(m.name, /Little Monkey/);
  assert.equal(m.display, 'fullscreen');
  assert.equal(m.orientation, 'landscape', 'like the game, sideways');
  assert.equal(m.start_url, './', 'it starts at the game, wherever the site is (on GitHub Pages, under /little-monkey/)');
  assert.equal(m.scope, './');
  for (const k of ['background_color', 'theme_color']) assert.match(m[k], /^#[0-9A-F]{6}$/i, `${k} is a colour`);
});

test('the icons exist at the sizes the description says, with one that phones may cut into a circle', () => {
  const m = manifest();
  for (const size of ['192x192', '512x512']) assert.ok(m.icons.some(i => i.sizes === size && i.purpose === 'any'), `an icon ${size}`);
  assert.ok(m.icons.some(i => i.purpose === 'maskable'), 'a maskable icon');
  for (const icon of m.icons){
    const file = path.join(ROOT, icon.src);
    assert.ok(fs.existsSync(file), `${icon.src} exists`);
    const {w, h} = read(fs.readFileSync(file));
    assert.equal(`${w}x${h}`, icon.sizes, `${icon.src} is ${icon.sizes}`);
  }
});

test('the icons show the monkey as the game draws it (if not, run: npm run icons)', () => {
  for (const icon of ICONS){
    const {w, px} = read(fs.readFileSync(path.join(DIR, icon.file)));
    assert.equal(w, icon.size, `${icon.file} is ${icon.size} wide`);
    assert.ok(px.equals(draw(icon)), `icons/${icon.file} is out of date: run npm run icons`);
  }
});

test('the page links the app description, the icons, and the lines an iPhone needs', () => {
  const html = page();
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest">/);
  assert.match(html, /<link rel="apple-touch-icon" href="icons\/apple-touch-icon\.png">/);
  assert.equal(read(fs.readFileSync(path.join(ROOT, 'icons/apple-touch-icon.png'))).w, 180, 'an iPhone’s icon is 180 wide');
  assert.match(html, /<meta name="apple-mobile-web-app-capable" content="yes">/);
  assert.match(html, /<meta name="apple-mobile-web-app-title" content="小猴子">/);
  assert.match(html, new RegExp(`<meta name="theme-color" content="${manifest().theme_color}">`), 'the same colour as the description');
  assert.match(fs.readFileSync(path.join(ROOT, 'js/main.js'), 'utf8'), /serviceWorker\.register\('sw\.js'\)/, 'the game starts its service worker');
});

// sw.js, run with a pretend web: a server whose page can change, a connection that can drop or be slow, and the copy.
// A file on the server is its text, or {status} for an error, or {login} for a Wi-Fi login page it's sent on to.
const SITE = 'https://lph147.github.io/little-monkey/';
function worker(){
  const server = {[SITE]: 'version 1', [SITE + 'js/main.js']: 'the game'}, stores = {}, on = {}, timers = [], waiting = [];
  const web = {online: true, slow: false, server, fetched: {}, reopened: [], saved: {},   // (reopened: pages told to open again;
    // saved: the browser's own saved copy of a file, which GitHub lets it use for 10 minutes without asking if it's changed)
    get copy(){ return (stores['little-monkey'] || {}).map || new Map(); }, get next(){ return (stores['little-monkey-next'] || {}).map || new Map(); }};
  const response = (url, body, more = {}) => ({ok: true, status: 200, url, body, ...more, clone(){ return response(url, body, more); }});
  const reply = url => {
    const f = server[url];
    if (f === undefined) return {ok: false, status: 404, url, clone(){ return this; }};
    if (f.status) return {ok: false, status: f.status, url, body: 'error', clone(){ return this; }};
    if (f.login) return response(url, f.login, {redirected: true});
    return response(url, f);
  };
  const url = req => typeof req === 'string' ? new URL(req, SITE + 'sw.js').href : req.url;
  const store = name => stores[name] || (stores[name] = (map => ({map, put: async (req, res) => { map.set(url(req), res); }, match: async req => map.get(url(req)),
    keys: async () => [...map.keys()].map(u => ({url: u})), delete: async req => map.delete(req.url)}))(new Map()));   // a cache: its files, by address
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'), {
    self: {addEventListener: (type, fn) => { on[type] = fn; }, skipWaiting(){}, registration: {scope: SITE},
      clients: {claim: async () => {}, get: async id => ({id, url: SITE, navigate: async () => { web.reopened.push(id); }})}},
    fetch: async (req, init = {}) => {
      const url = typeof req === 'string' ? req : req.url;
      web.fetched[url] = (web.fetched[url] || 0) + 1;
      if (web.saved[url] !== undefined && !['no-cache', 'reload', 'no-store'].includes(init.cache)) return response(url, web.saved[url]);   // (without asking)
      if (web.slow) await new Promise(r => waiting.push(r));   // a slow connection: it answers when the test says (web.answer())
      if (!web.online) throw new TypeError('No connection');
      return reply(url);
    },
    caches: {open: async name => store(name), delete: async name => delete stores[name]},
    setTimeout: fn => timers.push(fn),
    Response: {error: () => ({ok: false, error: true})}, URL
  });
  const settle = () => new Promise(r => setImmediate(r));
  web.wait = async () => { await settle(); timers.splice(0).forEach(fn => fn()); await settle(); };   // WAIT goes by
  web.answer = async () => { web.slow = false; waiting.splice(0).forEach(r => r()); for (let i = 0; i < 5; i++) await settle(); };   // the slow connection answers
  // Asks for a file, as the page would, and waits for the worker to finish (page: the id of the page asking, or of the
  // page a navigation opens). With slow, it gives the answer as soon as there is one, without waiting for the rest.
  web.get = async (url, mode = 'no-cors', page = 'page 1') => {
    let answer; const after = [];
    on.fetch({request: {method: 'GET', url, mode}, clientId: mode === 'navigate' ? '' : page, resultingClientId: mode === 'navigate' ? page : '',
      respondWith: p => { answer = p; }, waitUntil: p => after.push(p)});
    if (web.slow){ await web.wait(); return answer; }
    const res = await answer; await Promise.all(after);
    return res;
  };
  web.send = async (data, page = 'page 1') => { const after = []; on.message({data, source: {id: page}, waitUntil: p => after.push(p)}); await Promise.all(after); };   // a message from a page
  web.load = async (page = 'page 1') => {   // the game loads whole from the web: its page, its file, then the list of its files
    const res = await web.get(SITE, 'navigate', page); await web.get(SITE + 'js/main.js', 'no-cors', page);
    await web.send({keepFiles: [SITE, SITE + 'js/main.js']}, page); return res;
  };
  return web;
}

test('online, the app always loads the newest version, and keeps a copy once it has loaded whole', async () => {
  const web = worker();
  assert.equal((await web.load()).body, 'version 1');
  assert.equal(web.copy.get(SITE).body, 'version 1', 'a copy is kept');
  web.server[SITE] = 'version 2'; web.server[SITE + 'js/main.js'] = 'the new game';   // an upload to GitHub
  assert.equal((await web.get(SITE, 'navigate', 'page 2')).body, 'version 2', 'the new version, not the old copy');
  await web.get(SITE + 'js/main.js', 'no-cors', 'page 2');
  assert.deepEqual([web.copy.get(SITE).body, web.copy.get(SITE + 'js/main.js').body], ['version 1', 'the game'], 'the copy waits till it has loaded whole…');
  await web.send({keepFiles: [SITE, SITE + 'js/main.js']}, 'page 2');
  assert.deepEqual([web.copy.get(SITE).body, web.copy.get(SITE + 'js/main.js').body], ['version 2', 'the new game'], '…then it’s all updated together');
});

test('the browser’s own saved copy of a file is never used: every file is checked with the web, so a new version never mixes with the old (decided 26 October 2026: the new page came with the old styles and code)', async () => {
  const web = worker();
  await web.load();
  web.saved = {[SITE + 'js/main.js']: 'the game'};   // the browser saved the old one a minute ago
  web.server[SITE] = 'version 2'; web.server[SITE + 'js/main.js'] = 'the new game';   // an upload to GitHub
  assert.equal((await web.get(SITE, 'navigate', 'page 2')).body, 'version 2');
  assert.equal((await web.get(SITE + 'js/main.js', 'no-cors', 'page 2')).body, 'the new game', 'the new file, not the saved old one');
  await web.send({keepFiles: [SITE, SITE + 'js/main.js', SITE + 'css/game.css']}, 'page 2');
  assert.equal(web.copy.get(SITE + 'js/main.js').body, 'the new game', 'and the copy has the new one');
});

test('offline, the app uses its copy', async () => {
  const web = worker();
  await web.load();
  web.online = false;
  assert.equal((await web.get(SITE, 'navigate')).body, 'version 1');
  assert.equal((await web.get(SITE + 'js/main.js')).body, 'the game');
  assert.equal((await web.get(SITE + 'index.html', 'navigate')).body, 'version 1', 'the game’s page, however it’s asked for');
  assert.equal((await web.get(SITE + 'never-seen.png')).error, true, 'and nothing it never had');
});

test('the game’s own files are kept from its very first visit, so it plays offline after just one', async () => {
  const web = worker();   // the first visit: the page loaded before the worker was there, so nothing went through it
  await web.send({keepFiles: [SITE, SITE + 'js/main.js']});
  assert.deepEqual([...web.copy.keys()].sort(), [SITE, SITE + 'js/main.js'], 'the page sent the list of its files, and they’re kept');
  await web.send({keepFiles: [SITE, SITE + 'js/main.js']});
  assert.deepEqual(web.fetched, {[SITE]: 1, [SITE + 'js/main.js']: 1}, 'once: not again when they’re in the copy');
  web.online = false;
  assert.equal((await web.get(SITE, 'navigate')).body, 'version 1');
  assert.equal((await web.get(SITE + 'js/main.js')).body, 'the game');
});

test('a voice clip in the copy plays straight away, without waiting for the connection', async () => {
  const web = worker(), clip = SITE + 'audio/yunxi/abc.mp3';
  web.server[clip] = 'ni hao';
  await web.send({keepClips: ['audio/yunxi/abc.mp3']});
  web.fetched = {};
  web.slow = true;
  assert.equal((await web.get(clip)).body, 'ni hao');
  assert.deepEqual(web.fetched, {}, 'it didn’t even ask the web');
});

test('the clips are downloaded once, even when their list arrives twice at once', async () => {
  const web = worker(), clips = ['audio/yunxi/a.mp3', 'audio/yunxi/b.mp3'];
  for (const c of clips) web.server[SITE + c] = c;
  await Promise.all([web.send({keepClips: clips}), web.send({keepClips: clips})]);
  assert.deepEqual(web.fetched, {[SITE + clips[0]]: 1, [SITE + clips[1]]: 1});
});

test('on a slow connection, the game opens from its copy, and that page’s files all come from the copy (the versions never mix)', async () => {
  const web = worker();
  await web.load();   // played before: the copy has version 1
  web.server[SITE] = 'version 2'; web.server[SITE + 'js/main.js'] = 'the new game';   // an upload to GitHub
  web.slow = true;
  assert.equal((await web.get(SITE, 'navigate', 'page 2')).body, 'version 1', 'after a wait, the copy');
  assert.equal((await web.get(SITE + 'js/main.js', 'no-cors', 'page 2')).body, 'the game', 'and its files from the copy too, straight away');
  await web.answer();
  assert.equal(web.copy.get(SITE).body, 'version 1', 'the new page, coming too late, isn’t kept with the old files');
  assert.equal((await web.get(SITE, 'navigate', 'page 3')).body, 'version 2', 'next time, with a good connection, the newest version');
  assert.equal((await web.get(SITE + 'js/main.js', 'no-cors', 'page 3')).body, 'the new game');
});

test('if the connection drops as a new version loads, the page opens again from the copy, whole: the versions never mix', async () => {
  const web = worker();
  await web.load();   // played before: the copy has version 1
  web.server[SITE] = 'version 2'; web.server[SITE + 'js/main.js'] = 'the new game';   // an upload to GitHub
  assert.equal((await web.get(SITE, 'navigate', 'page 2')).body, 'version 2', 'the new page, from the web');
  web.online = false;   // and the connection drops as its files load
  assert.equal((await web.get(SITE + 'js/main.js', 'no-cors', 'page 2')).error, true, 'not the old file from the copy');
  assert.deepEqual(web.reopened, ['page 2'], 'the page is told to open again');
  await web.send({keepFiles: [SITE, SITE + 'js/main.js']}, 'page 2');
  assert.deepEqual([web.copy.get(SITE).body, web.copy.get(SITE + 'js/main.js').body], ['version 1', 'the game'], 'and the copy is still version 1, whole');
  web.online = true;   // (even if the connection comes back straight away)
  assert.equal((await web.get(SITE, 'navigate', 'page 3')).body, 'version 1', 'it opens from the copy');
  assert.equal((await web.get(SITE + 'js/main.js', 'no-cors', 'page 3')).body, 'the game', 'with all its files from the copy');
  assert.equal((await web.get(SITE, 'navigate', 'page 4')).body, 'version 2', 'and the next time, the newest version from the web');
  assert.equal((await web.get(SITE + 'js/main.js', 'no-cors', 'page 4')).body, 'the new game');
});

test('opened from the copy with no connection, a page gets all its files from the copy, even if the connection comes back as it loads', async () => {
  const web = worker();
  await web.load();
  web.server[SITE] = 'version 2'; web.server[SITE + 'js/main.js'] = 'the new game';
  web.online = false;
  assert.equal((await web.get(SITE, 'navigate', 'page 2')).body, 'version 1');
  web.online = true;
  assert.equal((await web.get(SITE + 'js/main.js', 'no-cors', 'page 2')).body, 'the game', 'the old page’s own file, not the new one');
});

test('on a slow connection with no copy yet, the game waits for the web', async () => {
  const web = worker();
  web.slow = true;
  let res = null;
  web.get(SITE, 'navigate').then(r => { res = r; });
  await web.wait();
  assert.equal(res, null, 'still waiting');
  await web.answer();
  assert.equal(res.body, 'version 1');
});

test('an error, or a Wi-Fi login page, is never kept: the copy is used instead', async () => {
  const web = worker();
  await web.load();
  web.server[SITE + 'js/main.js'] = {status: 500};
  assert.equal((await web.get(SITE + 'js/main.js')).error, true, 'a server error for a file: not the copy’s, which could be older…');
  assert.deepEqual(web.reopened, ['page 1'], '…the page opens again from the copy, whole');
  assert.equal((await web.get(SITE, 'navigate', 'page 2')).body, 'version 1');
  assert.equal((await web.get(SITE + 'js/main.js', 'no-cors', 'page 2')).body, 'the game', 'all of it');
  web.server[SITE] = {login: 'Log in to the hotel Wi-Fi'};
  assert.equal((await web.get(SITE, 'navigate')).body, 'version 1', 'sent on to a login page: the game, from the copy');
  assert.equal(web.copy.get(SITE).body, 'version 1', 'and the login page isn’t kept');
  web.server[SITE + 'new.png'] = {status: 404};
  assert.equal((await web.get(SITE + 'new.png')).status, 404, 'nothing in the copy: the error, as it was');
});
