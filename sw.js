// The service worker: it lets the game be installed as an app (see manifest.webmanifest) and keeps a copy of
// it, so it can be played offline. Network first: when there's a connection, the game always loads the
// newest version from the web; only without one is the copy used. The copy is always one version, whole, so the old
// and new versions never mix (decided 22 October 2026: a file the web couldn't send as the game loaded came from the
// copy, older, mixed in with the new ones):
// - The files a page gets from the web wait in NEXT, and go into the copy together once the page has loaded whole (it
//   sends the list of its files then, keepFiles), so a page that loads only part of a new version never changes it.
// - A page opened from the copy (on a slow connection, after WAIT; with no connection; or when the web sends an
//   error) gets all its files from the copy too.
// - A page from the web whose own file can't come from the web (the connection dropped as it loaded) opens again
//   from the copy, whole, rather than get that file from the copy.
// An error or a page that isn't the game (a Wi-Fi login page, which comes by a redirect) is never kept. Any of the
// page's files not in the copy yet are fetched when it sends their list, so the game plays offline after its very
// first visit. The voice clips (audio/) are all kept as soon as the game sends their list, so a line never heard yet
// can still be heard offline; clips the game doesn't use any more are let go. A clip never changes (each has its own
// name), so one in the copy is played straight away, without waiting for the connection.
'use strict';
const COPY = 'little-monkey', NEXT = 'little-monkey-next';   // the copy, and the files of a page from the web, waiting
const WAIT = 3000;            // how long the game's page waits for a slow connection before opening from the copy
const AGAIN = 10000;          // how soon after a page from the web couldn't get a file it opens again from the copy
const fromCopy = new Set();   // pages opened from the copy (by their client id): their files come from the copy too
const broken = new Set();     // pages from the web that couldn't get one of their files: they never change the copy
let copyNext = 0;             // when the last of those couldn't (the next page opens from the copy)

self.addEventListener('install', () => self.skipWaiting());   // a new version of this file takes over straight away
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  const clip = new URL(req.url).pathname.includes('/audio/');
  e.respondWith(clip || fromCopy.has(e.clientId) ? copyFirst(req, clip) : networkFirst(req, e));
});
// What the copy has for req (the game's page, however it was asked for), or undefined.
const inCopy = req => caches.open(COPY).then(c => c.match(req, {ignoreSearch: true}).then(hit => hit || (req.mode === 'navigate' ? c.match('./') : undefined)));
const good = res => res.ok && !res.redirected;   // the game's own file (not an error, nor a login page it was sent on to)
const keep = (req, res, into = COPY) => caches.open(into).then(c => c.put(req, res));
async function copyFirst(req, clip){   // a clip, which never changes (kept when it comes), or a file for a page from the copy
  const hit = await inCopy(req);
  if (hit) return hit;
  try { const res = await fetch(req); if (clip && good(res)) await keep(req, res.clone()); return res; } catch(e) { return Response.error(); }
}
async function networkFirst(req, e){
  const page = req.mode === 'navigate';   // the game's page (otherwise one of its files)
  if (page && Date.now() - copyNext < AGAIN){ copyNext = 0; const hit = await inCopy(req); if (hit) return opened(hit, e); }
  let late = false;   // the page has opened from the copy: this answer comes too late to keep
  const net = fetch(req).then(async res => { if (good(res) && !late) await keep(req, res.clone(), NEXT); return res; });
  if (page){   // on a slow connection, the copy after WAIT
    const slow = await Promise.race([net.then(() => false, () => false), new Promise(r => setTimeout(() => r(true), WAIT))]);
    const hit = slow && await inCopy(req);
    if (hit){ late = true; e.waitUntil(net.catch(() => {})); return opened(hit, e); }
  }
  let res = null;
  try { res = await net; if (good(res)) return res; } catch(err) {}
  const hit = await inCopy(req);   // no connection, an error or a login page: the copy, if it has it
  if (!hit) return res || Response.error();
  if (page) return opened(hit, e);
  broken.add(e.clientId); copyNext = Date.now(); e.waitUntil(openAgain(e.clientId));   // a file for a page from the web: the page opens again from the copy
  return Response.error();
}
const opened = (hit, e) => { if (e.resultingClientId) fromCopy.add(e.resultingClientId); return hit; };   // a page from the copy
async function openAgain(id){ const page = id && await self.clients.get(id); if (page && page.navigate) await page.navigate(page.url).catch(() => {}); }
async function update(){   // a page from the web has loaded whole: its files go into the copy together
  const next = await caches.open(NEXT), copy = await caches.open(COPY);
  for (const req of await next.keys()){ const res = await next.match(req); if (res) await copy.put(req, res); }
  await caches.delete(NEXT);
}

// The page sends what to keep: its own files (keepFiles), once it has loaded whole, and every voice clip (keepClips).
// One list at a time, so a list sent twice at once isn't downloaded twice.
let keeping = Promise.resolve();
self.addEventListener('message', e => {
  const d = e.data || {}, id = e.source && e.source.id;
  const fromWeb = !fromCopy.has(id) && !broken.has(id);   // (a page from the copy, or one that couldn't load whole, changes nothing)
  if (Array.isArray(d.keepFiles) && fromWeb) e.waitUntil(keeping = keeping.then(() => update()).then(() => keepFiles(d.keepFiles)));
  if (Array.isArray(d.keepClips)) e.waitUntil(keeping = keeping.then(() => keepClips(d.keepClips)));
});
const here = u => new URL(u, self.registration.scope).href;
async function keepFiles(list){   // the game's own files: any the copy hasn't got yet
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
