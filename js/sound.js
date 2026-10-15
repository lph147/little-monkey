// Sound effects, the background music (guzheng and dizi) and the device's Chinese voice.

/* ================= SOUND ================= */
let AC = null;
function getAC(){ try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch(e) { return null; } return AC; }
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
  fanfare: () => [523,659,784,1047,784,1047].forEach((f,i) => tone(f, .13, 'square', .04, i*.1)),
  rumble: () => noise(.9, .16),
  chime: () => [1047,1319,1568,2093].forEach((f,i) => tone(f, .35, 'triangle', .05, i*.08)),
  shimmer: () => tone(520, 1.1, 'triangle', .04, 0, 900)
};

/* ---- background music: guzheng and dizi in a Chinese pentatonic style ----
   Odd passes: the tune on a plucked guzheng (with tremolo on long notes and bends).
   Even passes: the tune on a breathy dizi flute with slides, grace notes and vibrato.
   Underneath: a rolling guzheng accompaniment, glissando sweeps and a soft wood block. */
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
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
let mBus = null, mTimer = null, mStart = 0, mIdx = 0, mLoop = 0, noiseBuf = null;
function musicGraph(a){
  if (mBus) return;
  mBus = a.createGain(); mBus.gain.value = 0; mBus.connect(a.destination);
  const dl = a.createDelay(1); dl.delayTime.value = BEAT * .5;
  const fb = a.createGain(); fb.gain.value = .32; const wet = a.createGain(); wet.gain.value = .3;
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
  mBus.echoIn = a.createGain(); mBus.echoIn.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet); wet.connect(mBus);
  noiseBuf = a.createBuffer(1, a.sampleRate * .3, a.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
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
function musicTick(){
  const a = AC; if (!a || !mBus) return;
  const ahead = a.currentTime + .35;
  for (let guard = 0; guard < 80; guard++){
    const ev = EVENTS[mIdx], t = mStart + (mLoop * LOOP_BEATS + ev.b) * BEAT;
    if (t > ahead) break;
    if (t > a.currentTime - .05) playEvent(a, ev, t, mLoop % 2);
    mIdx++; if (mIdx >= EVENTS.length){ mIdx = 0; mLoop++; }
  }
}
function musicStart(){
  if (!S.music || mTimer) return;
  const a = getAC(); if (!a) return;
  musicGraph(a);
  mStart = a.currentTime + .15; mIdx = 0; mLoop = 0;
  mBus.gain.cancelScheduledValues(a.currentTime); mBus.gain.setTargetAtTime(musicLevel(), a.currentTime, .8);
  mTimer = setInterval(musicTick, 50); musicTick();
}
function musicStop(){
  if (!mTimer) return; clearInterval(mTimer); mTimer = null;
  if (AC && mBus){ mBus.gain.cancelScheduledValues(AC.currentTime); mBus.gain.setTargetAtTime(0, AC.currentTime, .3); }
}
const musicLevel = () => speaking ? .28 : .7;
function duck(){ if (AC && mBus && mTimer){ mBus.gain.cancelScheduledValues(AC.currentTime); mBus.gain.setTargetAtTime(musicLevel(), AC.currentTime, .25); } }
document.addEventListener('visibilitychange', () => { if (document.hidden) musicStop(); else if (mode !== 'title') musicStart(); });

/* ================= SPEECH ================= */
let zhVoice = null, speaking = false, speakSafety = 0, uttRef = null;
function pickVoice(){ try { const vs = speechSynthesis.getVoices(); zhVoice = vs.find(v => /zh[-_]CN/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || null; } catch(e) {} }
if ('speechSynthesis' in window){ pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
const speechBusy = () => speaking && performance.now() < speakSafety;
function say(text, onend){
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
function stopSpeech(){ try { uttRef = null; speaking = false; speechSynthesis.cancel(); duck(); } catch(e) {} }
function unlockSpeech(){ try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch(e) {} }
