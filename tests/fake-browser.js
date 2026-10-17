// A pretend browser, just big enough to run the game's start-up code in Node.
//
// The game expects a real page: buttons, a canvas, sound and a Chinese voice.
// Here every page element is a "stub": an object that accepts any property,
// method call or assignment without complaint, and remembers what was assigned,
// so a test can check it afterwards (for example, the text on the A button label).
//
// It reads the game's page, finds its <script> tags and runs them in order,
// exactly as a browser would. A typo, a missing file or files loaded in the
// wrong order make loadGame() throw, with the file name and line number.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {makeElement} = require('./mini-dom');

const ROOT = path.resolve(__dirname, '..');
const ENTRY = 'index.html';           // the page that loads the game
const SAVE_KEY = 'xiaohouzi-v2';      // where the game keeps its save in the browser

function stub(name){
  const props = {};
  return new Proxy(function(){}, {
    get(target, key){
      if (Object.hasOwn(props, key)) return props[key];
      if (key === Symbol.toPrimitive) return hint => (hint === 'number' ? 0 : '');
      if (key === Symbol.iterator) return function*(){};
      if (key === 'then') return undefined;   // so a stub is never mistaken for a promise
      return (props[key] = stub(`${name}.${String(key)}`));
    },
    set(target, key, value){ props[key] = value; return true; },
    apply: () => stub(`${name}()`),
    construct: () => stub(`new ${name}`)
  });
}

// The game's scripts, in the order the page loads them.
function scriptsIn(page, root = ROOT){
  const pageFile = path.join(root, page);
  const html = fs.readFileSync(pageFile, 'utf8');
  const scripts = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
    const src = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(m[1]);
    if (src){
      if (/^(https?:)?\/\//i.test(src[1])) continue;   // scripts from the internet aren't part of the game
      const file = path.join(path.dirname(pageFile), src[1]);
      scripts.push({file, code: fs.readFileSync(file, 'utf8'), lineOffset: 0});
    } else {
      const start = m.index + m[0].indexOf('>') + 1;
      scripts.push({file: pageFile, code: m[2], lineOffset: html.slice(0, start).split('\n').length - 1});
    }
  }
  if (!scripts.length) throw new Error(`No game scripts found in ${page}`);
  return scripts;
}

// Starts the game. Pass {save} to start with that saved game already in the browser
// (an object, or a string for the exact text, such as a broken save), and {storage} for
// anything else already in the browser's storage. {root} and {page} load a different copy
// of the game (used to compare versions).
// {dom: true} is for tests that play the game: the card (#sheet), the speech box (#talk) and the
// text box (#textbox) become working copies whose buttons can be found and pressed (see mini-dom.js),
// and timers wait until the test calls flush().
function loadGame({save, storage: stored = {}, root = ROOT, page = ENTRY, dom = false} = {}){
  const elements = {}, storage = new Map(Object.entries(stored)), frames = [], listeners = {};
  const timers = new Map(); let nextTimer = 1;
  if (save !== undefined) storage.set(SAVE_KEY, typeof save === 'string' ? save : JSON.stringify(save));
  const document = {
    hidden: false,
    activeElement: null,
    querySelector: sel => elements[sel] || (elements[sel] = stub(sel)),
    querySelectorAll: () => [],
    createElement: tag => stub(`<${tag}>`),
    addEventListener(type, fn){ (listeners[type] = listeners[type] || []).push(fn); }
  };
  if (dom){
    elements['#sheet'] = makeElement('div', {id: 'sheet', class: 'sheet', role: 'dialog'}, document);
    elements['#talk'] = makeElement('div', {id: 'talk', class: 'talk', hidden: ''}, document);
    elements['#textbox'] = makeElement('div', {id: 'textbox', class: 'textbox'}, document);
  }
  const win = vm.createContext({
    document,
    innerWidth: 812, innerHeight: 375, devicePixelRatio: 2,   // a phone held sideways
    localStorage: {
      getItem: k => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => { storage.set(k, String(v)); },
      removeItem: k => { storage.delete(k); }
    },
    performance: {now: () => 1000},
    requestAnimationFrame: fn => { frames.push(fn); return frames.length; },
    setTimeout: dom ? fn => { const id = nextTimer++; timers.set(id, fn); return id; } : () => 0,
    clearTimeout: id => { timers.delete(id); },
    setInterval: () => 0, clearInterval(){},
    addEventListener(){},
    console
  });
  vm.runInContext('globalThis.window = globalThis;', win);
  for (const s of scriptsIn(page, root)) vm.runInContext(s.code, win, {filename: s.file, lineOffset: s.lineOffset});
  return {
    el: sel => elements[sel],                     // a page element, by the same selector the game uses
    storage,                                      // the browser's saved data
    runFrame(now = 1000){ const fn = frames.shift(); if (fn) fn(now); },   // draw one frame
    flush(){ const due = [...timers.values()]; timers.clear(); due.forEach(fn => fn()); return due.length; },   // run waiting timers (with dom: true)
    run: code => vm.runInContext(code, win),     // run code inside the game, e.g. run('ORDER.length')
    // Press a key, such as ' ' or 'Enter'. repeat: the key is being held down. tabbedTo: a button
    // has been chosen with the Tab key. Returns the key press, to check if the game used it.
    key(key, {repeat = false, tabbedTo = false} = {}){
      const e = {key, repeat, target: {matches: () => tabbedTo}, defaultPrevented: false, preventDefault(){ e.defaultPrevented = true; }};
      for (const fn of listeners.keydown || []) fn(e);
      return e;
    }
  };
}

module.exports = {loadGame, scriptsIn, ROOT, ENTRY, SAVE_KEY};
