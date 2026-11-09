// Both ways (decided 9 November 2026): learning English, what the game says in your own language is in Chinese, looked up
// by its English in ZH_UI (content/chinese-ui.js). tools/ui-strings.js finds every piece of text the game shows in your own
// language: the engine's (what's given to ui() as written) and the content's (each area's tasks, messages, notes…).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');
const {uiStrings} = require('../tools/ui-strings');

const ZH = JSON.parse(loadGame().run('JSON.stringify(ZH_UI)'));
const ALL = uiStrings();
const holes = s => (String(s).match(/\{[^}]*\}/g) || []).filter(h => h !== '{s}' && h !== '{them}').sort();   // ({s}, {them}: English endings)

test('every piece of text the game shows in your own language has its Chinese (node tools/ui-strings.js --missing lists any without)', () => {
  const missing = [...ALL].filter(([t]) => !Object.hasOwn(ZH, t) || !String(ZH[t]).trim()).map(([t, w]) => `${w}: ${t}`);
  assert.deepEqual(missing, [], 'these have no Chinese in content/chinese-ui.js');
});

test('and none is left over: every Chinese is for text the game still shows', () => {
  assert.deepEqual(Object.keys(ZH).filter(t => !ALL.has(t)), [], 'these are in content/chinese-ui.js, but the game no longer says them: take them out');
});

test('each Chinese keeps what goes into its English: its numbers, names and words ({n}, {who}, {水}), and its bold', () => {
  const wrong = Object.entries(ZH).filter(([en, zh]) => holes(en).join(' ') !== holes(zh).join(' ') || (en.match(/<\/?b>/g) || []).length !== (zh.match(/<\/?b>/g) || []).length)
    .map(([en, zh]) => `${en}  →  ${zh}`);
  assert.deepEqual(wrong, []);
});

test('the Chinese is Chinese: written with Chinese punctuation, never English left in by mistake', () => {
  const english = Object.entries(ZH).filter(([en, zh]) => /[A-Za-z]/.test(en) && /\s[a-z]{3,}\s[a-z]{3,}\s/.test(zh.replace(/\{[^}]*\}|“[^”]*”|<[^>]*>/g, ' ').replace(/[A-Z][\w’']*(?:\s+[\w’'?!.]+)*[?!.]/g, ' ')))
    .map(([en, zh]) => `${en}  →  ${zh}`);
  assert.deepEqual(english, [], 'these look as if they are still in English');
});
