// The voice test (tools/try-voices.js): the Azure key never goes to GitHub, and the test lines
// are the game's own words.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {ITEMS, VOICES, ssml} = require('../tools/try-voices');

test('the key file is kept off GitHub', () => {
  const ignored = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8').split(/\r?\n/).map(l => l.trim());
  assert.ok(ignored.includes('voice-key.txt'), '.gitignore must list voice-key.txt, so the Azure key is never uploaded');
});

test('the voice test has a clip name and some speech for every voice and item', () => {
  assert.equal(new Set(ITEMS.map(i => i.id)).size, ITEMS.length, 'each item needs its own id');
  for (const v of VOICES) for (const id of v.only || []) assert.ok(ITEMS.some(i => i.id === id), `${v.label} is for ${id}, which isn't an item`);
  for (const v of VOICES) for (const i of ITEMS) assert.match(ssml(v, i), new RegExp(i.zh.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('an empty key line reads as no key, not as the region on the next line', () => {
  const {readKey} = require('../tools/try-voices');
  const os = require('os');
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'voices-')), 'voice-key.txt');
  fs.writeFileSync(file, '# a note\r\nkey=\r\nregion=eastus\r\n');
  assert.deepEqual(readKey(file), {key:'', region:'eastus'});
  fs.writeFileSync(file, 'key= abc123 \nregion=\n');
  assert.deepEqual(readKey(file), {key:'abc123', region:'eastus'});
});

test('every voice clip is made and listed (run npm run voices after changing any Chinese)', () => {
  const {plan, indexText, clipPath, INDEX} = require('../tools/make-voices');
  const p = plan();
  assert.ok(fs.existsSync(INDEX) && fs.readFileSync(INDEX, 'utf8') === indexText(p), 'content/voices.js is out of date: run npm run voices');
  const missing = Object.entries(p.clips).flatMap(([v, texts]) => Object.entries(texts).filter(([, c]) => !fs.existsSync(clipPath(v, c))).map(([t]) => `${v}: ${t}`));
  assert.deepEqual(missing, [], 'these clips are missing: run npm run voices');
});

test('the old monkey has his own voice for his lines, and everyone else the main one', () => {
  const {plan} = require('../tools/make-voices');
  const p = plan();
  assert.deepEqual(p.who, {everyone:'yunxi', elder:'yunze'});
  assert.ok(p.clips.yunze['我是老猴子。这是花果山。'], 'the old monkey says who he is in his own voice');
  assert.ok(!p.clips.yunze['我怕！'], 'the little monkey’s line isn’t in the old monkey’s voice');
  assert.ok(p.clips.yunxi['猴子'] && p.clips.yunxi['你好！'], 'words and lines are in the main voice');
});
