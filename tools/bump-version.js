// Raises the version number in js/version.js by one. Run by git before every commit (.githooks/pre-commit).
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'js', 'version.js');
const text = fs.readFileSync(FILE, 'utf8');
const n = Number(text.match(/const VERSION = (\d+);/)[1]) + 1;
fs.writeFileSync(FILE, text.replace(/const VERSION = \d+;/, `const VERSION = ${n};`));
console.log(`Version ${n}`);
