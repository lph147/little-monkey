// The service worker: it lets the game be installed as an app (see manifest.webmanifest) and keeps a copy of
// it, so it can be played offline. Network first: when there's a connection, the game always loads the
// newest version from the web (and the copy is updated); only without one is the copy used. On a slow
// connection, the game opens from the copy after WAIT, and that page's files all come from the copy too, so the
// old and new versions never mix; a fresh copy waits for a quicker connection. An error or a page that isn't the
// game (a Wi-Fi login page, which comes by a redirect) is never kept, and the copy is used instead, if there is one.
// The page sends the list of its own files (keepFiles), and any not in the copy yet are fetched, so the game plays
// offline after its very first visit. The voice clips (audio/) are all kept as soon as the game sends their list,
// so a line never heard yet can still be heard offline; clips the game doesn't use any more are let go. A clip never
// changes (each has its own name), so one in the copy is played straight away, without waiting for the connection.
'use strict';
const COPY = 'little-monkey';
const WAIT = 3000;            // how long the game's page waits for a slow connection before opening from the copy
const fromCopy = new Set();   // pages opened from the copy (by their client id): their files come from the copy too

self.addEventListener('install', () => self.skipWaiting());   // a new version of this file takes over straight away
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  e.respondWith(new URL(req.url).pathname.includes('/audio/') || fromCopy.has(e.clientId) ? copyFirst(req) : networkFirst(req, e));
});
// What the copy has for req (the game's page, however it was asked for), or undefined.
const inCopy = req => caches.match(req, {ignoreSearch: true}).then(hit => hit || (req.mode === 'navigate' ? caches.match('./') : undefined));
const good = res => res.ok && !res.redirected;   // the game's own file (not an error, nor a login page it was sent on to)
const keep = (req, res) => caches.open(COPY).then(c => c.put(req, res));
async function copyFirst(req){
  const hit = await inCopy(req);
  if (hit) return hit;
  try { const res = await fetch(req); if (good(res)) await keep(req, res.clone()); return res; } catch(e) { return Response.error(); }
}
async function networkFirst(req, e){
  let late = false;   // the page has opened from the copy: this answer comes too late to keep
  const net = fetch(req).then(async res => { if (good(res) && !late) await keep(req, res.clone()); return res; });
  if (req.mode === 'navigate'){   // the game's page: on a slow connection, the copy after WAIT
    const slow = await Promise.race([net.then(() => false, () => false), new Promise(r => setTimeout(() => r(true), WAIT))]);
    const hit = slow && await inCopy(req);
    if (hit){ late = true; if (e.resultingClientId) fromCopy.add(e.resultingClientId); e.waitUntil(net.catch(() => {})); return hit; }
  }
  try { const res = await net; return good(res) ? res : (await inCopy(req)) || res; }
  catch(err) { return (await inCopy(req)) || Response.error(); }   // offline: the copy
}

// The page sends what to keep: its own files (keepFiles), and every voice clip (keepClips). One list at a time, so a
// list sent twice at once isn't downloaded twice.
let keeping = Promise.resolve();
self.addEventListener('message', e => {
  const d = e.data || {};
  if (Array.isArray(d.keepFiles)) e.waitUntil(keeping = keeping.then(() => keepFiles(d.keepFiles)));
  if (Array.isArray(d.keepClips)) e.waitUntil(keeping = keeping.then(() => keepClips(d.keepClips)));
});
const here = u => new URL(u, self.registration.scope).href;
async function keepFiles(list){   // the game's own files: any the copy hasn't got yet (it's kept up to date as the game loads them)
  const copy = await caches.open(COPY);
  for (const url of new Set(list.map(here))){
    if (await copy.match(url)) continue;
    try { const res = await fetch(url); if (good(res)) await copy.put(url, res); } catch(e) { return; }   // offline: try again next time
  }
}
async function keepClips(list){
  const copy = await caches.open(COPY), want = new Set(list.map(here));
  for (const req of await copy.keys()) if (new URL(req.url).pathname.includes('/audio/') && !want.has(req.url)) await copy.delete(req);
  for (const url of want){
    if (await copy.match(url)) continue;
    try { const res = await fetch(url); if (good(res)) await copy.put(url, res); } catch(e) { return; }   // offline: try again next time
  }
}
