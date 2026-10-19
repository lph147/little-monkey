// The service worker: it lets the game be installed as an app (see manifest.webmanifest) and keeps a copy of
// it, so it can be played offline. Network first: when there's a connection, the game always loads the
// newest version from the web (and the copy is updated); only without one is the copy used.
// The voice clips (audio/) are all kept as soon as the game sends their list, so a line never heard yet can
// still be heard offline; clips the game doesn't use any more are let go.
'use strict';
const COPY = 'little-monkey';

self.addEventListener('install', () => self.skipWaiting());   // a new version of this file takes over straight away
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok){ const copy = res.clone(); e.waitUntil(caches.open(COPY).then(c => c.put(req, copy))); }
    return res;
  }).catch(() => caches.match(req, {ignoreSearch: true})                                 // offline: the copy
    .then(hit => hit || (req.mode === 'navigate' ? caches.match('./') : undefined))   // (the game's page, however it was asked for)
    .then(hit => hit || Response.error())));
});

self.addEventListener('message', e => {
  const list = e.data && e.data.keepClips;
  if (Array.isArray(list)) e.waitUntil(keepClips(list));
});
async function keepClips(list){
  const copy = await caches.open(COPY), want = new Set(list.map(u => new URL(u, self.registration.scope).href));
  for (const req of await copy.keys()) if (new URL(req.url).pathname.includes('/audio/') && !want.has(req.url)) await copy.delete(req);
  for (const url of want){
    if (await copy.match(url)) continue;
    try { const res = await fetch(url); if (res.ok) await copy.put(url, res); } catch(e) { return; }   // offline: try again next time
  }
}
