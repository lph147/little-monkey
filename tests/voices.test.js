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
