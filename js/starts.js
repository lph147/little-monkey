// Starting at any part of the story, for testing (decided 17 November 2026, the owner's idea: testing a chapter meant
// playing the whole game up to it). A switch players never see: tap the version number on the title screen five times
// and testing is on for this device (TESTING_KEY), its label saying so; five more and it's off. Then an empty game's card
// (Save files) has Start at…: the story's chapters, then a chapter's parts, as their cards name them, and choosing one
// fills that game with a game just before the part begins, so you see it begin. Those games are made by the playthrough
// tests, which play the story as a player would (tools/starts/, made by npm run starts): the words a player knows by then,
// and not the ones still to come, every earlier job done. The very first part is a new game. Inside the game, not a page
// of its own, as an iPhone's home-screen app keeps its games apart from the browser's. A start is fetched only when it's
// chosen (so the offline copy doesn't grow), and only an empty game is filled.
const TESTING_KEY = KEY + '-testing';
const testing = () => { try { return localStorage.getItem(TESTING_KEY) === '1'; } catch(e) { return false; } };
const TAPS = 5, TAP_MS = 3000;   // five taps, each within 3 seconds of the first
let versionTaps = [];
function tapVersion(){
  const now = Date.now();
  versionTaps = versionTaps.filter(t => now - t < TAP_MS).concat(now);
  if (versionTaps.length < TAPS) return;
  versionTaps = [];
  const on = !testing();
  try { if (on) localStorage.setItem(TESTING_KEY, '1'); else localStorage.removeItem(TESTING_KEY); } catch(e) {}
  SFX.chime(); versionLabel();
  toast(on ? 'Testing is on. In Save files, an empty game can start at any part of the story.' : 'Testing is off.');
}
function versionLabel(){ $('#version').textContent = 'v' + VERSION + (testing() ? ' · testing' : ''); }
// Every part of the story, in order: its area and number there (i), its chapter, and the file of the game just before it
// begins (none for the very first: that's a new game)
function startPoints(){
  return AREAS.flatMap(A => A.parts.map((p, i) => ({area:A.number, i, chapter:A.chapters[p.chapter], ch:`${A.number}:${p.chapter}`, name:p.name, title:p.title,
    file:A.number === AREAS[0].number && i === 0 ? null : `tools/starts/a${A.number}p${i}.json`})));
}
const startFile = file => fetch(file, {cache:'no-cache'}).then(r => r.ok ? r.text() : Promise.reject(new Error(r.status)));
const pointRow = (key, name, title) => `<button class="btn slotrow" data-k="${key}" data-label="Choose"><span class="gt"><b>${esc(name)}</b><span>${esc(title)}</span></span></button>`;
// The chapters, for game n (an empty one)
function startCard(n, pick){
  const chapters = [...new Map(startPoints().map(p => [p.ch, p.chapter])).entries()];
  openCard(`<div class="files starts"><p class="label">Game ${n} · Start at…</p><p class="small spare">For testing: a game just before that part of the story begins, with the words a player would know by then.</p>
    <div class="menu">${chapters.map(([ch, c]) => pointRow(ch, c.name, c.title)).join('')}</div></div><div class="actions"><button class="btn" data-a="back" data-b>Back</button></div>`);
  sheet.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { SFX.blip(); partsCard(n, b.dataset.k); });
  on('[data-a=back]', () => slotCard(n));
  (sheet.querySelector(`[data-k="${pick}"]`) || sheet.querySelector('[data-k]')).focus();
}
// A chapter's parts (ch: its area and number there, 1:0 for the prologue)
function partsCard(n, ch){
  const parts = startPoints().filter(p => p.ch === ch), c = parts[0].chapter;
  openCard(`<div class="files starts"><p class="label">${esc(c.name)}: ${esc(c.title)}</p>
    <div class="menu">${parts.map(p => pointRow(p.i, p.name, p.title + (p.file ? '' : ' (a new game)'))).join('')}</div></div><div class="actions"><button class="btn" data-a="back" data-b>Back</button></div>`);
  sheet.querySelectorAll('[data-k]').forEach(b => b.onclick = () => startAt(n, parts.find(p => p.i === +b.dataset.k), ch));
  on('[data-a=back]', () => startCard(n, ch));
  sheet.querySelector('[data-k]').focus();
}
// Game n, started just before that part: with your sound and reading settings, as a new game keeps them
async function startAt(n, point, ch){
  getAC(); unlockSpeech(); keepSaves(); SFX.blip();   // (sound can only start from a tap: before waiting for the file)
  if (!point.file){ closeCard(); newGame(n); musicStart(); return; }
  sheet.querySelectorAll('button').forEach(b => { b.disabled = true; });
  let r;
  try { r = readSaveFile(await startFile(point.file)); }
  catch(e) { r = {error:'That part of the story couldn’t be fetched. Starting at a part needs an internet connection.'}; }
  if (r.error){ infoBox('💾', `<p>${esc(r.error)}</p>`).then(() => partsCard(n, ch)); return; }
  const keep = {sound:S.sound, music:S.music, pinyin:S.pinyin, replyEn:S.replyEn, fps:S.fps, voiceSpeed:S.voiceSpeed, typed:S.typed};
  useSave(Object.assign(r.save, keep), n);
  if ((S.area || 1) !== AREA.number) return toArea(S.area, n, 'continue');   // (in another area: the page loads again for it)
  setUpGame(); continueGame(n); musicStart();
}
