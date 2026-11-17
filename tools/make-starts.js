// Makes the games to start at each part of the story from, for testing (Start at…, js/starts.js): runs the playthrough
// tests, which keep the game just before each part begins (tests/starts.js), and has them write those games to
// tools/starts/. Run it after changing the story, so the starts have its newest words and jobs. (npm run starts)
'use strict';
const {execFileSync} = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const tests = fs.readdirSync(path.join(__dirname, '..', 'tests')).filter(f => /^playthrough.*\.test\.js$/.test(f)).map(f => path.join('tests', f));
execFileSync(process.execPath, ['--test', ...tests], {cwd: path.join(__dirname, '..'), stdio: 'inherit', env: {...process.env, STARTS: '1'}});
console.log(`Made the starts in tools/starts/, from ${tests.length} playthroughs.`);
