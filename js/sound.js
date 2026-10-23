// Sound effects, the background music (guzheng and dizi), and the Chinese: voice clips (made by npm run voices,
// listed in content/voices.js), or the device's Chinese voice for anything without one.

/* ================= SOUND ================= */
let AC = null;
// The sound engine, made the first time a tap needs it. An iPhone (iOS 17 or later) is told this is a game with
// sound (playback), so its silent switch doesn't mute the music and effects, as with a video. Sound that's paused
// starts again: suspended, or interrupted (an iPhone, after the phone is locked, a call or another app).
function getAC(){
  try {
    if (!AC){
      if (typeof navigator !== 'undefined' && navigator.audioSession) try { navigator.audioSession.type = 'playback'; } catch(e) {}
      AC = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (AC.state !== 'running' && AC.state !== 'closed') AC.resume();
  } catch(e) { return null; }
  return AC;
}
function ac(){ return S.sound ? getAC() : null; }
function tone(f, d = .1, type = 'square', v = .045, when = 0, slide = 0){
  const a = ac(); if (!a) return;
  const t = a.currentTime + when, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.linearRampToValueAtTime(f + slide, t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .03);
}
function noise(d = .8, v = .12){
  const a = ac(); if (!a) return;
  const buf = a.createBuffer(1, a.sampleRate * d, a.sampleRate), ch = buf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  f.type = 'lowpass'; f.frequency.value = 280; g.gain.value = v; s.buffer = buf;
  s.connect(f); f.connect(g); g.connect(a.destination); s.start();
}
const SFX = {
  blip: () => tone(880, .05, 'square', .03),
  bump: () => tone(105, .07, 'square', .04),
  turn: () => tone(520, .025, 'square', .015),
  word: () => { tone(784, .09); tone(1175, .16, 'square', .04, .09); },
  right: () => [523,659,784].forEach((f,i) => tone(f, .09, 'square', .04, i*.07)),
  wrong: () => { tone(330, .12); tone(247, .2, 'square', .04, .12); },
  encounter: () => [392,523,392,659,784].forEach((f,i) => tone(f, .07, 'square', .04, i*.06)),
  call: () => { tone(988, .06, 'square', .04); tone(1319, .12, 'square', .04, .08); },   // someone calls you over: a ! pops up over them
  fanfare: () => [523,659,784,1047,784,1047].forEach((f,i) => tone(f, .13, 'square', .04, i*.1)),
  rumble: () => noise(.9, .16),
  chime: () => [1047,1319,1568,2093].forEach((f,i) => tone(f, .35, 'triangle', .05, i*.08)),
  shimmer: () => tone(520, 1.1, 'triangle', .04, 0, 900),
  splash: () => {   // a splash of water: a burst of noise, bright and quick
    const a = ac(); if (!a) return;
    const buf = a.createBuffer(1, a.sampleRate * .45, a.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch.length, 2);
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = .7; g.gain.value = .22; s.buffer = buf;
    s.connect(f); f.connect(g); g.connect(a.destination); s.start();
  },
  swish: (when = 0) => tone(900, .18, 'triangle', .025, when, -650),   // something cutting through the air: a stick, a leap
  thwack: (when = 0) => { tone(150, .09, 'square', .05, when, -60); tone(90, .14, 'triangle', .06, when); },   // a hit
  tock: (when = 0) => { tone(620, .045, 'square', .025, when, -220); tone(240, .09, 'triangle', .05, when, -40); },   // a stake hammered into the ground
  sprout: (when = 0) => { tone(440, .08, 'triangle', .045, when, 380); tone(1175, .1, 'triangle', .02, when + .07); },   // something planted, coming up out of the ground
  slip: () => { tone(330, .1, 'triangle', .035, 0, 160); tone(560, .24, 'triangle', .03, .14, -380); },   // trying to climb a bank: a scramble up, then sliding back down
  // a place's own sounds, now and then (its sounds: ambience in js/world.js), such as the pine wood's
  crow: () => {   // a crow somewhere up in the pines: caw, caw
    const a = ac(); if (!a) return;
    for (const w of [0, .34]){
      const t = a.currentTime + w, o = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(640, t); o.frequency.exponentialRampToValueAtTime(430, t + .22);
      f.type = 'bandpass'; f.frequency.value = 1300; f.Q.value = 2.5;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.045, t + .03); g.gain.exponentialRampToValueAtTime(0.0001, t + .24);
      o.connect(f); f.connect(g); g.connect(a.destination); o.start(t); o.stop(t + .26);
    }
  },
  howl: () => {   // a wolf howling, far off: rising, holding with a waver, and falling away
    const a = ac(); if (!a) return;
    const t = a.currentTime, o = a.createOscillator(), lfo = a.createOscillator(), lg = a.createGain(), f = a.createBiquadFilter(), g = a.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(560, t + .7);
    o.frequency.setValueAtTime(560, t + 1.4); o.frequency.exponentialRampToValueAtTime(380, t + 2.4);
    lfo.frequency.value = 5; lg.gain.value = 6; lfo.connect(lg); lg.connect(o.frequency);
    f.type = 'lowpass'; f.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.035, t + .5); g.gain.setValueAtTime(.035, t + 1.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
    o.connect(f); f.connect(g); g.connect(a.destination); [o, lfo].forEach(x => { x.start(t); x.stop(t + 2.6); });
  },
  wind: () => {   // the wind in the pines: a soft rush that swells and dies away
    const a = ac(); if (!a) return;
    const d = 3.2, t = a.currentTime, buf = a.createBuffer(1, a.sampleRate * d, a.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    f.type = 'bandpass'; f.Q.value = .8; f.frequency.setValueAtTime(400, t); f.frequency.linearRampToValueAtTime(700, t + 1.6); f.frequency.linearRampToValueAtTime(350, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + 1.4); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.buffer = buf; src.connect(f); f.connect(g); g.connect(a.destination); src.start(t);
  }
};

/* ---- background music: guzheng and dizi in a Chinese pentatonic style ----
   Two songs. The area's (home): odd passes, the tune on a plucked guzheng (with tremolo on long notes and bends); even
   passes, on a breathy dizi flute with slides, grace notes and vibrato; underneath, a rolling guzheng accompaniment,
   glissando sweeps and a soft wood block. Battles' (battle): quicker, but calm and cheerful, never tense: the same
   pentatonic scale, a bouncy guzheng in quavers, a soft drum and wood block, and a tune taking turns on guzheng and dizi.
   The cave's (cave): its own sound, unlike the others: slower and sparser, with a long echo; a slow tune on soft bells,
   then on a xun (an ancient clay flute, deep and hollow), bell-like plinks, a low hum and drips of water. The pine wood's
   (pineWood): slower still, quiet and gloomy, in a minor key, on the xun and then soft bells, with a hum, far-apart plinks
   and the wind sighing; and its battle song (pineBattle): its own tune, slower, on the xun and then the dizi, over a
   heartbeat of a drum and a low guzheng, all in the tune's five notes. A place can have its own song (the content's music)
   and battle song (battleMusic); otherwise they're home's and battle. Only one song sounds at a time: changing it stops
   the last, with all it was still playing (songBus). */
const BPM = 72, BEAT = 60 / BPM, LOOP_BEATS = 64;
const MEL = [[76,1.5],[79,.5],[81,1],[84,.5],[81,.5], [79,2],[76,1],[79,1], [74,.5],[76,.5],[79,1],[76,1],[74,.5],[72,.5], [74,4],
             [76,1.5],[79,.5],[81,1],[79,.5],[81,.5], [84,2],[86,1],[84,.5],[81,.5], [79,.5],[81,.5],[79,.5],[76,.5],[74,1],[76,1], [69,4],
             [84,1],[81,1],[79,1.5],[81,.5], [76,2],[74,1],[76,1], [79,.5],[81,.5],[84,1],[81,.5],[79,.5],[76,1], [79,4],
             [76,1],[74,.5],[72,.5],[74,1],[76,1], [79,1.5],[81,.5],[79,1],[76,1], [74,1],[76,.5],[74,.5],[72,1],[69,1], [72,4]];
const ROOTS = [48,48,43,43, 48,45,43,45, 45,48,45,43, 48,43,45,48];
const PENT = [0,2,4,7,9];
const upNeighbor = m => { for (let k = 1; k <= 4; k++) if (PENT.includes((m + k) % 12)) return m + k; return m + 2; };
const EVENTS = (() => {
  const ev = []; let bt = 0, prev = 0;
  MEL.forEach(([m,d]) => { ev.push({b:bt, m, d, k:'mel', prev}); prev = m; bt += d; });
  ROOTS.forEach((r,i) => {
    [[0,r,.045],[1,r+7,.03],[2,r+12,.035],[3,r+7,.028]].forEach(([o,m,v]) => ev.push({b:i*4 + o, m, d:1, k:'acc', v}));
    if (i % 2 === 0) ev.push({b:i*4, k:'wood', v:.03});
    if (i % 4 === 3) ev.push({b:i*4 + 3.5, k:'wood', v:.02});
  });
  ev.push({b:31.25, k:'gliss'}); ev.push({b:63.25, k:'gliss'});
  return ev.sort((a,c) => a.b - c.b);
})();
// The battle song: 8 bars, a bar of the tune each line, and the bar's root note for the bass and the rolling guzheng.
const BATTLE_MEL = [[72,.5],[74,.5],[76,1],[79,.5],[76,.5],[74,1], [72,.5],[74,.5],[76,.5],[79,.5],[81,2],
                    [79,.5],[81,.5],[79,.5],[76,.5],[74,1],[76,1], [72,1],[69,1],[72,2],
                    [76,.5],[79,.5],[81,1],[84,.5],[81,.5],[79,1], [76,.5],[79,.5],[81,.5],[79,.5],[76,2],
                    [74,.5],[76,.5],[79,.5],[76,.5],[74,1],[72,1], [74,1],[76,1],[72,2]];
const BATTLE_ROOTS = [48,45,43,48, 45,48,43,48];
const BATTLE_EVENTS = (() => {
  const ev = []; let bt = 0;
  BATTLE_MEL.forEach(([m,d]) => { ev.push({b:bt, m, d, k:'mel'}); bt += d; });
  BATTLE_ROOTS.forEach((r,i) => {
    [r+12, r+19, r+24, r+19, r+12, r+19, r+24, r+19].forEach((m,j) => ev.push({b:i*4 + j*.5, m, k:'roll'}));   // quavers
    ev.push({b:i*4, m:r, k:'bass'}); ev.push({b:i*4 + 2, m:r + 7, k:'bass'});
    ev.push({b:i*4, k:'drum', v:.05}); ev.push({b:i*4 + 2, k:'drum', v:.035});
    ev.push({b:i*4 + 1, k:'wood', v:.022}); ev.push({b:i*4 + 3, k:'wood', v:.022});
    if (i % 2) ev.push({b:i*4 + 3.5, k:'wood', v:.014});
  });
  return ev.sort((a,c) => a.b - c.b);
})();
// The cave's song: a slow tune with pauses (0 is a rest), a hum every 8 beats on these roots with three plinks over it
// (CAVE_PLINKS, the root's own notes), and drips.
const CAVE_MEL = [[81,2],[76,1],[79,1],[72,3],[0,1], [74,1],[76,1],[79,2],[76,4],
                  [84,2],[81,1],[79,1],[76,3],[0,1], [74,2],[72,1],[69,1],[72,4]];
const CAVE_ROOTS = [45,43,48,40];
const CAVE_PLINKS = {45:[69,76,81], 43:[67,74,79], 48:[72,79,84], 40:[64,67,76]};
const CAVE_DRIPS = [[1.5,2400],[5.25,3100],[9.75,2700],[13.5,3400],[18.25,2500],[21.5,3000],[26.75,2800],[30.25,3300]];
const CAVE_EVENTS = (() => {
  const ev = []; let bt = 0, prev = 0;
  CAVE_MEL.forEach(([m,d]) => { ev.push({b:bt, m, d, k:'mel', prev}); prev = m; bt += d; });
  CAVE_ROOTS.forEach((r,i) => {
    ev.push({b:i*8, m:r, k:'hum'});
    CAVE_PLINKS[r].forEach((m,j) => ev.push({b:i*8 + [1.5, 4, 6.5][j], m, k:'plink'}));
  });
  CAVE_DRIPS.forEach(([b,f]) => ev.push({b, f, k:'drip'}));
  return ev.sort((a,c) => a.b - c.b);
})();
// The pine wood's battle song, unlike the other (decided 21 October 2026: the first, the battle tune in a minor key, was
// too like it to notice): its own tune, slower, low on the xun and then on the dizi, over a heartbeat of a drum and a low
// guzheng rocking on open fifths, with no cheerful wood block. A little tense, never frightening. Every note is one of the
// tune's own five (A C D E G), on roots that suit each bar, so nothing clashes with it (the guzheng had B flat, F and B
// in it, up among the tune's notes, and it sounded like two songs at once).
const PINE_BATTLE_MEL = [[57,1],[60,.5],[62,.5],[64,1],[62,1], [60,.5],[57,.5],[55,1],[57,2],
                         [64,1],[67,.5],[69,.5],[67,1],[64,1], [62,.5],[64,.5],[62,1],[57,2],
                         [69,1],[72,.5],[74,.5],[72,1],[69,1], [67,.5],[69,.5],[67,1],[64,2],
                         [62,1],[64,.5],[62,.5],[60,1],[57,1], [55,1],[57,1],[57,2]];
const PINE_BATTLE_ROOTS = [45,45,48,43, 45,48,43,45];   // A A C G, A C G A
const PINE_BATTLE_EVENTS = (() => {
  const ev = []; let bt = 0;
  PINE_BATTLE_MEL.forEach(([m,d]) => { ev.push({b:bt, m, d, k:'mel'}); bt += d; });
  PINE_BATTLE_ROOTS.forEach((r,i) => {
    [r, r+7, r+12, r+7, r, r+7, r+12, r+7].forEach((m,j) => ev.push({b:i*4 + j*.5, m, k:'roll'}));   // quavers, low, under the tune
    ev.push({b:i*4, m:r, k:'bass'}); ev.push({b:i*4 + 2, m:r + 7, k:'bass'});
    [[0, .07], [.5, .045], [2, .06], [2.5, .04]].forEach(([o, v]) => ev.push({b:i*4 + o, k:'drum', v}));   // a heartbeat
  });
  return ev.sort((a,c) => a.b - c.b);
})();
// The pine wood's song: slow and quiet, in a minor key (A C D E G), with long rests; a low hum on these roots, a few high
// plinks, far apart, and the wind sighing now and then. Gloomy, but not frightening.
const PINE_MEL = [[69,2],[72,1],[69,1],[67,3],[0,1], [64,2],[67,1],[64,1],[62,4],
                  [64,2],[69,1],[67,1],[64,3],[0,1], [62,2],[60,1],[62,1],[57,4]];
const PINE_ROOTS = [45, 43, 40, 45];
const PINE_PLINKS = [[3.5, 81], [11, 76], [19.5, 84], [27, 79]];
const PINE_EVENTS = (() => {
  const ev = []; let bt = 0;
  PINE_MEL.forEach(([m,d]) => { ev.push({b:bt, m, d, k:'mel'}); bt += d; });
  PINE_ROOTS.forEach((r,i) => ev.push({b:i*8, m:r, k:'hum'}));
  PINE_PLINKS.forEach(([b, m]) => ev.push({b, m, k:'plink'}));
  [6, 22].forEach(b => ev.push({b, k:'sigh'}));
  return ev.sort((a,c) => a.b - c.b);
})();
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
// The music's volume (mMain), and the song playing's own way out to it (mBus: its notes go into it, and its echo, half a
// beat later, into mBus.echoIn). Each song gets a new mBus, and the last one fades away at once with everything it was
// still playing, so two songs never sound together (decided 21 October 2026: the pine wood's low hum, ten seconds long,
// and its slow notes went on under its battle song).
let mMain = null, mBus = null, mTimer = null, mStart = 0, mIdx = 0, mLoop = 0, noiseBuf = null;
function musicGraph(a){
  if (mMain) return;
  mMain = a.createGain(); mMain.gain.value = 0; mMain.connect(a.destination);
  noiseBuf = a.createBuffer(1, a.sampleRate * .3, a.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
}
function songBus(a, name){
  const old = mBus, sg = SONGS[name];
  if (old){ old.gain.setTargetAtTime(0, a.currentTime, .03); setTimeout(() => old.parts.forEach(n => n.disconnect()), 1000); }
  mBus = a.createGain(); mBus.connect(mMain);
  const dl = a.createDelay(1), fb = a.createGain(), lp = a.createBiquadFilter(), wet = a.createGain();
  dl.delayTime.value = 60 / sg.bpm * .5; fb.gain.value = sg.echo[0]; wet.gain.value = sg.echo[1]; lp.type = 'lowpass'; lp.frequency.value = 2200;
  mBus.echoIn = a.createGain(); mBus.echoIn.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet); wet.connect(mBus);
  mBus.parts = [mBus, mBus.echoIn, dl, fb, lp, wet];
}
function zheng(a, f, t, v, len, bend){
  const o = a.createOscillator(), o2 = a.createOscillator(), flt = a.createBiquadFilter(), g = a.createGain(), g2 = a.createGain();
  o.type = 'sawtooth'; o2.type = 'triangle'; g2.gain.value = .3;
  [[o,1],[o2,2]].forEach(([osc,mul]) => {
    if (bend){ osc.frequency.setValueAtTime(f*mul*.944, t); osc.frequency.exponentialRampToValueAtTime(f*mul, t + .16); }
    else osc.frequency.setValueAtTime(f*mul, t);
  });
  flt.type = 'lowpass'; flt.Q.value = 3; flt.frequency.setValueAtTime(Math.min(7000, f*9), t); flt.frequency.exponentialRampToValueAtTime(Math.max(260, f*1.4), t + .5);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .004); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(flt); o2.connect(g2); g2.connect(flt); flt.connect(g); g.connect(mBus); g.connect(mBus.echoIn);
  o.start(t); o2.start(t); o.stop(t + len + .05); o2.stop(t + len + .05);
}
function dizi(a, f, t, dur, fromF, graceF){
  const o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain(), g2 = a.createGain(), lfo = a.createOscillator(), lg = a.createGain();
  o.type = 'sine'; o2.type = 'triangle'; g2.gain.value = .16;
  [o, o2].forEach(osc => {
    if (graceF){ osc.frequency.setValueAtTime(graceF, t); osc.frequency.setValueAtTime(f, t + .075); }
    else if (fromF){ osc.frequency.setValueAtTime(fromF, t); osc.frequency.exponentialRampToValueAtTime(f, t + .09); }
    else osc.frequency.setValueAtTime(f, t);
  });
  lfo.frequency.value = 5.3; lg.gain.setValueAtTime(0, t);
  lg.gain.linearRampToValueAtTime(dur > .6 ? f * .011 : f * .003, t + Math.min(dur, .5));
  lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
  const end = t + dur, hold = Math.max(t + .08, end - .08);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.075, t + .06); g.gain.setValueAtTime(.068, hold); g.gain.exponentialRampToValueAtTime(0.0001, end + .14);
  o.connect(g); o2.connect(g2); g2.connect(g); g.connect(mBus); g.connect(mBus.echoIn);
  if (noiseBuf){
    const n = a.createBufferSource(), bp = a.createBiquadFilter(), ng = a.createGain();
    n.buffer = noiseBuf; bp.type = 'bandpass'; bp.frequency.value = f * 2.2; bp.Q.value = 1.2;
    ng.gain.setValueAtTime(.025, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + .14);
    n.connect(bp); bp.connect(ng); ng.connect(mBus); n.start(t); n.stop(t + .2);
  }
  [o, o2, lfo].forEach(x => { x.start(t); x.stop(end + .2); });
}
function drum(a, t, v){   // a soft, low drum
  const o = a.createOscillator(), g = a.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(65, t + .13);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + .22);
  o.connect(g); g.connect(mBus); o.start(t); o.stop(t + .26);
}
function hum(a, f, t, dur){   // a low, soft hum, as if the cave itself were singing: the note and its fifth
  const o = a.createOscillator(), o2 = a.createOscillator(), lp = a.createBiquadFilter(), g = a.createGain();
  o.type = 'triangle'; o2.type = 'sine'; o.frequency.setValueAtTime(f, t); o2.frequency.setValueAtTime(f * 1.5, t);
  lp.type = 'lowpass'; lp.frequency.value = 520;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.045, t + 1.6); g.gain.setValueAtTime(.045, t + dur - 1); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + .6);
  o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(mBus);
  [o, o2].forEach(x => { x.start(t); x.stop(t + dur + .7); });
}
function bell(a, f, t, v, len){   // a soft bell: the note, with two quieter overtones that fade first
  [[1, v, len], [2.76, v * .3, len * .35], [5.4, v * .1, len * .18]].forEach(([mul, vv, l]) => {
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f * mul, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vv, t + .006); g.gain.exponentialRampToValueAtTime(0.0001, t + l);
    o.connect(g); g.connect(mBus); g.connect(mBus.echoIn); o.start(t); o.stop(t + l + .05);
  });
}
function xun(a, f, t, dur){   // the xun, an ancient clay flute: a deep, hollow note that swells in, with a slow wobble
  const o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain(), g2 = a.createGain(), lfo = a.createOscillator(), lg = a.createGain(), lp = a.createBiquadFilter();
  o.type = 'sine'; o2.type = 'triangle'; g2.gain.value = .12;
  o.frequency.setValueAtTime(f, t); o2.frequency.setValueAtTime(f * 2, t);
  lfo.frequency.value = 4.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * .008, t + Math.min(dur, .8));
  lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
  lp.type = 'lowpass'; lp.frequency.value = 1400;
  const end = t + dur;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.07, t + .18); g.gain.setValueAtTime(.06, Math.max(t + .2, end - .15)); g.gain.exponentialRampToValueAtTime(0.0001, end + .3);
  o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(mBus); g.connect(mBus.echoIn);
  [o, o2, lfo].forEach(x => { x.start(t); x.stop(end + .35); });
}
function drip(a, t, f){   // a drop of water falling into a pool: a little plink, rising, that echoes
  const o = a.createOscillator(), g = a.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.9, t + .06);
  g.gain.setValueAtTime(.028, t); g.gain.exponentialRampToValueAtTime(0.0001, t + .12);
  o.connect(g); g.connect(mBus); g.connect(mBus.echoIn); o.start(t); o.stop(t + .15);
}
function wood(a, t, v){
  const o = a.createOscillator(), g = a.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(1250, t); o.frequency.exponentialRampToValueAtTime(820, t + .05);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + .08);
  o.connect(g); g.connect(mBus); o.start(t); o.stop(t + .12);
}
function playEvent(a, ev, t, pass){
  if (ev.k === 'mel'){
    if (pass === 0){
      const f = midi(ev.m - 12), len = ev.d * BEAT;
      if (ev.d >= 2){
        zheng(a, f, t, .085, 1.2, true);
        for (let tt = t + .32; tt < t + len - .25; tt += .11) zheng(a, f, tt, .03, .35, false);   // tremolo
      } else zheng(a, f, t, .085, Math.min(len + .8, 1.8), ev.d >= 1 && Math.random() < .25);
    } else {
      const f = midi(ev.m), dur = ev.d * BEAT * .96;
      const slide = ev.prev && Math.abs(ev.m - ev.prev) <= 3 && ev.d >= 1 ? midi(ev.prev) : 0;
      const grace = ev.d >= 2 && !slide ? midi(upNeighbor(ev.m)) : 0;
      dizi(a, f, t, dur, slide, grace);
    }
  } else if (ev.k === 'acc') zheng(a, midi(ev.m), t, ev.v, 1.6, false);
  else if (ev.k === 'wood') wood(a, t, ev.v);
  else if (ev.k === 'gliss') [60,62,64,67,69,72,74,76,79].forEach((m,i) => zheng(a, midi(m), t + i*.045, .028, .9, false));
}
function playBattleEvent(a, ev, t, pass){
  const beat = 60 / SONGS.battle.bpm;
  if (ev.k === 'mel'){
    if (pass === 0) zheng(a, midi(ev.m), t, .07, Math.min(ev.d * beat + .4, 1.2), false);
    else dizi(a, midi(ev.m), t, ev.d * beat * .9, 0, 0);
  } else if (ev.k === 'roll') zheng(a, midi(ev.m), t, .022, .45, false);
  else if (ev.k === 'bass') zheng(a, midi(ev.m), t, .05, .9, false);
  else if (ev.k === 'drum') drum(a, t, ev.v);
  else if (ev.k === 'wood') wood(a, t, ev.v);
}
function playCaveEvent(a, ev, t, pass){
  const beat = 60 / SONGS.cave.bpm;
  if (ev.k === 'mel'){
    if (!ev.m) return;   // a rest
    if (pass === 0) bell(a, midi(ev.m), t, .055, Math.min(ev.d * beat + 1.6, 3.2));
    else xun(a, midi(ev.m - 12), t, ev.d * beat * .92);
  } else if (ev.k === 'plink') bell(a, midi(ev.m + 12), t, .016, 1.4);
  else if (ev.k === 'hum') hum(a, midi(ev.m), t, 8 * beat);
  else if (ev.k === 'drip') drip(a, t, ev.f);
}
function playPineBattleEvent(a, ev, t, pass){
  const beat = 60 / SONGS.pineBattle.bpm;
  if (ev.k === 'mel'){
    if (pass === 0) xun(a, midi(ev.m), t, ev.d * beat * .9);
    else dizi(a, midi(ev.m + 12), t, ev.d * beat * .92, 0, 0);
  } else if (ev.k === 'roll') zheng(a, midi(ev.m), t, .018, .45, false);
  else if (ev.k === 'bass') zheng(a, midi(ev.m), t, .055, 1, false);
  else if (ev.k === 'drum') drum(a, t, ev.v);
}
function playPineEvent(a, ev, t, pass){
  const beat = 60 / SONGS.pineWood.bpm;
  if (ev.k === 'mel'){
    if (!ev.m) return;   // a rest
    if (pass === 0) xun(a, midi(ev.m - 12), t, ev.d * beat * .92);
    else bell(a, midi(ev.m), t, .04, Math.min(ev.d * beat + 1.4, 3));
  } else if (ev.k === 'hum') hum(a, midi(ev.m), t, 8 * beat);
  else if (ev.k === 'plink') bell(a, midi(ev.m), t, .013, 1.6);
  else if (ev.k === 'sigh') sigh(a, t);
}
function sigh(a, t){   // the wind sighing through the trees, very softly, into the song's echo
  const d = 2.6, buf = a.createBuffer(1, a.sampleRate * d, a.sampleRate), ch = buf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(500, t); f.frequency.linearRampToValueAtTime(800, t + 1.3); f.frequency.linearRampToValueAtTime(450, t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.02, t + 1.1); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  src.buffer = buf; src.connect(f); f.connect(g); g.connect(mBus); g.connect(mBus.echoIn); src.start(t);
}
// The songs: how fast (beats a minute), how many beats before it loops, its notes, how each is played, and its echo
// (how much comes back each time, and how loud it is).
const SONGS = {
  home: {bpm:BPM, beats:LOOP_BEATS, events:EVENTS, play:playEvent, echo:[.32, .3]},
  battle: {bpm:116, beats:32, events:BATTLE_EVENTS, play:playBattleEvent, echo:[.32, .3]},
  cave: {bpm:54, beats:32, events:CAVE_EVENTS, play:playCaveEvent, echo:[.52, .55]},
  pineWood: {bpm:50, beats:32, events:PINE_EVENTS, play:playPineEvent, echo:[.45, .45]},
  pineBattle: {bpm:100, beats:32, events:PINE_BATTLE_EVENTS, play:playPineBattleEvent, echo:[.26, .22]}   // (less echo, so the tune stays clear)
};
const placeSong = () => (PLACES[PLACE] && SONGS[PLACES[PLACE].music]) ? PLACES[PLACE].music : 'home';   // the place you're in's own song, if it has one
const battleSong = () => (PLACES[PLACE] && SONGS[PLACES[PLACE].battleMusic]) ? PLACES[PLACE].battleMusic : 'battle';   // and its own battle song
const isBattleSong = name => name === 'battle' || Object.values(PLACES).some(p => p.battleMusic === name);
let song = 'home';   // the song playing (or that will, once the music is on)
function musicTick(){
  const a = AC; if (!a || !mBus) return;
  const sg = SONGS[song], beat = 60 / sg.bpm, ahead = a.currentTime + .35;
  for (let guard = 0; guard < 80; guard++){
    const ev = sg.events[mIdx], t = mStart + (mLoop * sg.beats + ev.b) * beat;
    if (t > ahead) break;
    if (t > a.currentTime - .05) sg.play(a, ev, t, mLoop % 2);
    mIdx++; if (mIdx >= sg.events.length){ mIdx = 0; mLoop++; }
  }
}
// Changes the song (such as into a battle and out again), from its start, with a moment's quiet between.
function playSong(name){
  if (song === name || !SONGS[name]) return;
  song = name;
  if (!mTimer || !AC || !mMain) return;
  const now = AC.currentTime;
  mStart = now + .25; mIdx = 0; mLoop = 0;
  songBus(AC, name);   // (the last song stops, with all it was playing)
  mMain.gain.cancelScheduledValues(now); mMain.gain.setTargetAtTime(0, now, .04); mMain.gain.setTargetAtTime(musicLevel(), now + .25, .2);
}
function musicStart(){
  if (!S.music || mTimer) return;
  if (!isBattleSong(song)) song = placeSong();
  const a = getAC(); if (!a) return;
  musicGraph(a); songBus(a, song);   // (from its start: anything left from before is gone)
  mStart = a.currentTime + .15; mIdx = 0; mLoop = 0;
  mMain.gain.cancelScheduledValues(a.currentTime); mMain.gain.setTargetAtTime(musicLevel(), a.currentTime, .8);
  mTimer = setInterval(musicTick, 50); musicTick();
}
function musicStop(){
  if (!mTimer) return; clearInterval(mTimer); mTimer = null;
  if (AC && mMain){ mMain.gain.cancelScheduledValues(AC.currentTime); mMain.gain.setTargetAtTime(0, AC.currentTime, .3); }
}
const musicLevel = () => speaking ? .28 : .7;
function duck(){ if (AC && mMain && mTimer){ mMain.gain.cancelScheduledValues(AC.currentTime); mMain.gain.setTargetAtTime(musicLevel(), AC.currentTime, .25); } }
document.addEventListener('visibilitychange', () => { if (document.hidden) musicStop(); else if (mode !== 'title') musicStart(); });

/* ================= SPEECH ================= */
let zhVoice = null, speaking = false, speakSafety = 0, uttRef = null, clipSrc = null;
function pickVoice(){ try { const vs = speechSynthesis.getVoices(); zhVoice = vs.find(v => /zh[-_]CN/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || null; } catch(e) {} }
if ('speechSynthesis' in window){ pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
// What's wrong with the Chinese voice, if anything: 'none' if this browser can't speak at all,
// 'missing' if it has voices but no Chinese one, '' if all is well (or the voices haven't loaded yet).
function voiceProblem(){
  if (canPlayClips()) return '';   // the game's own voice clips: no device voice needed
  if (!('speechSynthesis' in window)) return 'none';
  let vs = []; try { vs = speechSynthesis.getVoices() || []; } catch(e) {}
  if (!vs.length) return '';
  return vs.some(v => /^(zh|cmn)/i.test(v.lang)) ? '' : 'missing';
}
const VOICE_SHORT = {   // on the title screen, with VOICE_HELP behind "How to fix it"
  none: 'This browser can’t speak, so you won’t hear any Chinese.',
  missing: 'Your device has no Chinese voice yet, so you won’t hear the words.'
};
const VOICE_HELP = {
  none: 'This browser can’t speak, so you won’t hear any Chinese. Try Safari on an iPhone, or Chrome on Android or a computer.',
  missing: 'Your device has no Chinese voice yet, so you won’t hear the words. On an iPhone: Settings, Accessibility, Spoken Content, Voices, Chinese, then download a voice. On Android: in Settings, search for Text-to-speech, open Speech Services by Google, Install voice data, and add Chinese (Mandarin). Then reload the game.'
};
const speechBusy = () => speaking && performance.now() < speakSafety;
const canPlayClips = () => typeof VOICE_CLIPS !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext);
// The clip that says this text (VOICE_CLIPS and VOICE_OF in content/voices.js): in who's own voice if they have one
// (the old monkey's lines), a word on its own in the words voice, and any other line in everyone's voice; null if
// there isn't one.
function clipFor(text, who){
  if (typeof VOICE_CLIPS === 'undefined') return null;
  for (const v of [VOICE_OF[who], VOICE_OF.words, VOICE_OF.everyone]){
    const code = v && VOICE_CLIPS[v] && VOICE_CLIPS[v][text];
    if (code) return `audio/${v}/${code}.mp3`;
  }
  return null;
}
const clipBuffers = new Map();   // each clip, once loaded and decoded
// Where the speech in a clip starts and how long it lasts, in seconds, leaving out the silence before and after it
// (Google's clips have some): from the first to the last sound louder than a fiftieth of its loudest, and a little more.
function speechSpan(buf){
  const d = buf.getChannelData(0), pad = Math.round(buf.sampleRate * 0.04);
  let peak = 0; for (const x of d) peak = Math.max(peak, Math.abs(x));
  let from = 0, to = d.length - 1;
  while (from < to && Math.abs(d[from]) < peak / 50) from++;
  while (to > from && Math.abs(d[to]) < peak / 50) to--;
  from = Math.max(0, from - pad); to = Math.min(d.length, to + pad);
  return [from / buf.sampleRate, (to - from) / buf.sampleRate];
}
function loadClip(a, url){
  if (!clipBuffers.has(url)) clipBuffers.set(url, fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(data => new Promise((ok, no) => a.decodeAudioData(data, ok, no)))
    .then(buf => { if (buf.getChannelData) buf.span = speechSpan(buf); return buf; })
    .catch(e => { clipBuffers.delete(url); throw e; }));
  return clipBuffers.get(url);
}
// Say some Chinese aloud: its clip if there is one (in who's voice), else the device's Chinese voice.
// onend runs when it's finished (or couldn't be said).
function say(text, onend, who){
  const url = clipFor(text, who), a = url && getAC();
  if (!a) return sayDevice(text, onend);
  stopSpeech();
  const me = {}; uttRef = me;
  speaking = true; speakSafety = performance.now() + text.length * 500 + 4000; duck();
  loadClip(a, url).then(buf => {
    if (uttRef !== me) return;   // something else was said in the meantime
    const s = a.createBufferSource();
    s.buffer = buf; s.connect(a.destination);
    s.onended = () => { if (uttRef !== me) return; clipSrc = null; speaking = false; duck(); if (onend) onend(); };
    clipSrc = s; s.start(0, ...(buf.span || []));   // just the speech, without the silence around it
  }).catch(() => { if (uttRef === me) sayDevice(text, onend); });   // the clip didn't load (offline before it was kept): the device's voice
}
function sayDevice(text, onend){
  try {
    if (!('speechSynthesis' in window)) { onend && onend(); return; }
    const ss = speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN'; if (zhVoice) u.voice = zhVoice; u.rate = 0.8;
    const done = () => { if (uttRef !== u) return; speaking = false; duck(); if (onend) onend(); };
    u.onend = done; u.onerror = done;
    uttRef = u; window.__lastUtterance = u;   // keep a reference so the browser does not cut it off
    speaking = true; speakSafety = performance.now() + text.length * 500 + 2000; duck();
    if (ss.speaking || ss.pending){ ss.cancel(); setTimeout(() => { if (uttRef === u) ss.speak(u); }, 90); }
    else ss.speak(u);
  } catch(e) { speaking = false; onend && onend(); }
}
function stopSpeech(){
  uttRef = null; speaking = false;
  if (clipSrc){ try { clipSrc.onended = null; clipSrc.stop(); } catch(e) {} clipSrc = null; }
  try { speechSynthesis.cancel(); } catch(e) {}
  duck();
}
function unlockSpeech(){ try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch(e) {} }
