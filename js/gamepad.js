// Game controllers (Xbox, PlayStation, Switch Pro and most Bluetooth ones), on a computer or a phone. Each of the
// controller's buttons presses one of the game's own: its D-pad or left stick is the D-pad, the bottom button
// (Xbox A, PlayStation ✕) is A and the right one (Xbox B, PlayStation ○) is B, as on an Xbox, the left one (Xbox X,
// PlayStation □) BAG and the top one (Xbox Y, PlayStation △) MAP; Start (Menu, Options)
// is MENU and Select (View, Share) is TASKS. The button on the screen lights up as you press it. A browser only
// tells the page a controller is there once you press one of its buttons, and only while one is connected is it
// looked at, every frame.

/* ================= CONTROLLERS ================= */
const PAD_BUTTONS = [[0, '#btnA', () => pressA(performance.now())], [1, '#btnB', () => pressB(performance.now())], [2, '#bagBtn', () => pressBag()], [3, '#mapBtn', () => pressMap()], [9, '#startBtn', () => pressMenu()], [8, '#selectBtn', () => pressSelect()]];
const PAD_DIRS = [[12, 'up'], [13, 'down'], [14, 'left'], [15, 'right']];
const STICK = 0.5;                            // how far the stick must be pushed to count
const PAD_WAIT = 400, PAD_REPEAT = 150;       // holding a direction on a card: it moves again after PAD_WAIT, then every PAD_REPEAT
const padWas = {};                            // the buttons that were down last time
let padLoop = 0, padHeldDir = null, padRepeatAt = 0, padHeldOn = '';
const padsNow = () => [...((typeof navigator !== 'undefined' && navigator.getGamepads && navigator.getGamepads()) || [])].filter(p => p && p.connected !== false);
// What a direction does right now: walk, or move between the buttons on a card, the title screen or your replies.
const padOn = () => !modal.hidden ? 'card' : mode === 'title' ? 'title' : talkNext && talkMove ? 'replies' : 'walk';
const padDown = (p, i) => !!(p.buttons[i] && p.buttons[i].pressed);
function padDirOf(p){   // the direction a controller is pressing: its D-pad, or else its left stick
  const b = PAD_DIRS.find(([i]) => padDown(p, i));
  if (b) return b[1];
  const x = p.axes[0] || 0, y = p.axes[1] || 0;
  if (Math.max(Math.abs(x), Math.abs(y)) < STICK) return null;
  return Math.abs(x) > Math.abs(y) ? (x < 0 ? 'left' : 'right') : (y < 0 ? 'up' : 'down');
}
function readPads(now){
  const pads = padsNow();
  if (!pads.length){ padLoop = 0; letGo(); return; }   // none connected: let go of what it held, and stop looking until one is
  padLoop = requestAnimationFrame(readPads);
  if (upright) return;   // the phone is upright: the game waits until it's turned
  for (const [i, sel, press] of PAD_BUTTONS){   // a button pressed (not held): it presses the game's button once
    const isDown = pads.some(p => padDown(p, i));
    if (isDown !== !!padWas[i]) $(sel).classList.toggle('held', isDown);
    if (isDown && !padWas[i]){ getAC(); press(); }
    padWas[i] = isDown;
  }
  const d = pads.map(padDirOf).find(Boolean) || null;
  if (d !== padHeldDir){   // the same as the D-pad on the screen: walk, turn, or move between buttons
    padHeldDir = d; padRepeatAt = now + PAD_WAIT; padHeldOn = padOn();
    setPad(d); if (!d) held = null;
  } else if (d && now >= padRepeatAt && padHeldOn !== 'walk' && padOn() === padHeldOn){   // held on a card, the title screen or
    padRepeatAt = now + PAD_REPEAT;                                                         // your replies: it moves again (not on
    if (padHeldOn === 'card') navFocus(d);                                                  // a card that opened while you walked)
    else if (padHeldOn === 'title') moveTitle(d);
    else talkMove(d);
  }
}
// The last controller has gone (its battery, or Bluetooth) with a direction or a button down: they're let go, so you
// stop walking (decided 22 October 2026: you walked on, with nothing pressed).
function letGo(){
  if (padHeldDir){ padHeldDir = null; setPad(null); held = null; }
  for (const [i, sel] of PAD_BUTTONS) if (padWas[i]){ $(sel).classList.remove('held'); padWas[i] = false; }
}
const watchPads = () => { if (!padLoop && padsNow().length) padLoop = requestAnimationFrame(readPads); };
window.addEventListener('gamepadconnected', watchPads);
window.addEventListener('load', watchPads);   // (one already connected, such as after a reload, once the whole game has loaded)
