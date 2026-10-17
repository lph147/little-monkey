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

// sw.js, run with a pretend web: a server whose page can change, a connection that can drop, and the copy.
const SITE = 'https://lph147.github.io/little-monkey/';
function worker(){
  const server = {[SITE]: 'version 1', [SITE + 'js/main.js']: 'the game'}, copy = new Map(), on = {};
  const web = {online: true, server, copy};
  const response = (url, body) => ({ok: true, url, body, clone(){ return response(url, body); }});
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'), {
    self: {addEventListener: (type, fn) => { on[type] = fn; }, skipWaiting(){}, clients: {claim: async () => {}}},
    fetch: async req => {
      if (!web.online) throw new TypeError('No connection');
      return req.url in server ? response(req.url, server[req.url]) : {ok: false, status: 404, url: req.url, clone(){ return this; }};
    },
    caches: {open: async () => ({put: async (req, res) => { copy.set(req.url, res); }}), match: async req => copy.get(typeof req === 'string' ? new URL(req, SITE + 'sw.js').href : req.url)},
    Response: {error: () => ({ok: false, error: true})}, URL
  });
  // Asks for a file, as the page would, and waits for the worker to finish.
  web.get = async (url, mode = 'no-cors') => {
    let answer; const after = [];
    on.fetch({request: {method: 'GET', url, mode}, respondWith: p => { answer = p; }, waitUntil: p => after.push(p)});
    const res = await answer; await Promise.all(after);
    return res;
  };
  return web;
}

test('online, the app always loads the newest version, and keeps a copy', async () => {
  const web = worker();
  assert.equal((await web.get(SITE, 'navigate')).body, 'version 1');
  assert.equal(web.copy.get(SITE).body, 'version 1', 'a copy is kept');
  web.server[SITE] = 'version 2';   // an upload to GitHub
  assert.equal((await web.get(SITE, 'navigate')).body, 'version 2', 'the new version, not the old copy');
  assert.equal(web.copy.get(SITE).body, 'version 2', 'and the copy is updated');
});

test('offline, the app uses its copy', async () => {
  const web = worker();
  await web.get(SITE, 'navigate'); await web.get(SITE + 'js/main.js');
  web.online = false;
  assert.equal((await web.get(SITE, 'navigate')).body, 'version 1');
  assert.equal((await web.get(SITE + 'js/main.js')).body, 'the game');
  assert.equal((await web.get(SITE + 'index.html', 'navigate')).body, 'version 1', 'the game’s page, however it’s asked for');
  assert.equal((await web.get(SITE + 'never-seen.png')).error, true, 'and nothing it never had');
});
