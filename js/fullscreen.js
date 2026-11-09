// Playing full screen on a phone. Opened from the home screen, the game is an app, already full screen, so
// nothing is offered. In a phone's browser, the title screen offers Play full screen: on Android (and tablets)
// it goes full screen and sideways straight away, with Install the app when the browser offers it. An iPhone
// lets a web page do neither, so there a card shows how to add the game to the home screen: "I've added it"
// hides the offer in that browser for good, and "Not now" for a day. On Android the installed app shares the
// browser's storage, so it leaves a note (APP_KEY) and the browser says you have the app; on an iPhone it can't.
// In Safari on an iPhone, once you have a game, the offer is to keep your games safe: Safari deletes what a web page
// has saved if you don't open it for a week (on the home screen, the app's games are safe).
const FS_KEY = KEY + '-fullscreen', APP_KEY = KEY + '-app';
let installPrompt = null;   // the browser's own install offer (Android), kept for Install the app
const media = q => { try { return !!(window.matchMedia && window.matchMedia(q).matches); } catch(e) { return false; } };
const isApp = () => media('(display-mode: fullscreen)') || media('(display-mode: standalone)') || (typeof navigator !== 'undefined' && navigator.standalone === true);
const isIPhone = () => typeof navigator !== 'undefined' && /iPhone|iPod/.test(navigator.userAgent || '');
const inSafari = () => !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent || '');   // (on an iPhone: not Chrome, Firefox or Edge)
const isFull = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
const canGoFull = () => { const d = document.documentElement; return !!(d && (d.requestFullscreen || d.webkitRequestFullscreen)); };
const stored = k => { try { return localStorage.getItem(k); } catch(e) { return null; } };
const store = (k, v) => { try { localStorage.setItem(k, v); } catch(e) {} };

// What the title screen offers: '' (nothing), 'go' (a button that goes full screen) or 'steps' (how to add it to the home screen).
function fullscreenOffer(){
  if (isApp()){ store(APP_KEY, '1'); return ''; }
  if (!media('(pointer: coarse)') || isFull()) return '';   // a computer, or already full screen
  if (isIPhone() || !canGoFull()){
    const off = stored(FS_KEY);
    return off === 'added' || (off && Date.now() - Number(off) < 86400000) ? '' : 'steps';
  }
  return 'go';
}
// The line under the title's words (titleText in js/main.js), and its buttons.
function fullscreenHTML(){
  const offer = fullscreenOffer();
  if (!offer) return '';
  const hasApp = stored(APP_KEY) === '1';
  const safe = offer === 'steps' && isIPhone() && inSafari() && SLOTS.some(slotSummary);
  return `<p class="fs">${hasApp ? 'You have the app: open 小猴子 from your home screen. ' : ''}<button class="linkbtn" id="fullBtn">⛶ ${safe ? 'Keep your games safe' : 'Play full screen'}</button>`
    + `${offer === 'go' && installPrompt && !hasApp ? ' · <button class="linkbtn" id="installBtn">Install the app</button>' : ''}</p>`;
}
function wireFullscreen(){
  const fb = $('#fullBtn'), ib = $('#installBtn');
  if (fb) fb.onclick = () => fullscreenOffer() === 'go' ? goFullscreen() : showAddSteps();
  if (ib) ib.onclick = () => {
    const p = installPrompt; installPrompt = null;
    Promise.resolve(p.prompt()).then(() => p.userChoice).then(c => { if (c && c.outcome === 'accepted') store(APP_KEY, '1'); }).catch(() => {}).then(titleText);
  };
}
function goFullscreen(){
  const d = document.documentElement;
  try {
    Promise.resolve((d.requestFullscreen || d.webkitRequestFullscreen).call(d, {navigationUI:'hide'}))
      .then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape'))   // and sideways, where the phone allows it
      .catch(() => {});
  } catch(e) {}
}
function showAddSteps(){
  const safari = inSafari();
  openCard(`<p class="label">⛶ Add to your home screen</p>
    <p>On your home screen, 小猴子 plays full screen and offline, and your games are safe${safari ? ': Safari can delete them after a week away' : ''}.</p>
    <ol class="steps">
      <li>Tap Share 📤${safari ? ' (or ⋯ first)' : ', beside the address'}.</li>
      <li>Tap ➕ Add to Home Screen (scroll down for it).</li>
      <li>Open <img class="appicon" src="icons/icon-192.png" alt=""> 小猴子 from your home screen.</li>
    </ol>
    <p class="small">To bring this game across: Copy to a file here, Load from a file there.</p>
    <div class="actions"><button class="btn" data-a="no" data-b>Not now</button><button class="btn primary" data-a="yes">I’ve added it</button></div>`);
  on('[data-a=no]', () => { store(FS_KEY, String(Date.now())); closeCard(); titleText(); });
  on('[data-a=yes]', () => { store(FS_KEY, 'added'); closeCard(); titleText(); });
}
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; if (mode === 'title') titleText(); });
window.addEventListener('appinstalled', () => { installPrompt = null; store(APP_KEY, '1'); if (mode === 'title') titleText(); });
document.addEventListener('fullscreenchange', () => { if (mode === 'title') titleText(); });   // the button goes when full screen, and comes back after
