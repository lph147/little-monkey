// The game's page loads every script in js/ and content/, so none gets forgotten.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {scriptsIn, ROOT, ENTRY} = require('./fake-browser');

test(`${ENTRY} loads every script in js/ and content/`, () => {
  const loaded = scriptsIn(ENTRY).map(s => path.relative(ROOT, s.file).split(path.sep).join('/'));
  for (const dir of ['content', 'js']){
    const onDisk = fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith('.js')).map(f => `${dir}/${f}`);
    for (const file of onDisk) assert.ok(loaded.includes(file), `${file} is not loaded by ${ENTRY}`);
  }
});
