// The scroll (decided 11 November 2026, from mock-ups made in the game): every card, the speech box and a message are aged
// paper, the same on a phone set to light or to dark; and a word's characters, big on its card, each sit in a square of a
// practice grid.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadGame} = require('./fake-browser');

const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'game.css'), 'utf8');
const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));

test('the cards, the speech box and a message are aged paper, whatever the phone is set to', () => {
  const block = (css.match(/#modal,\.talk,\.saybox,\.placename\{([^}]*)\}/) || [])[1] || '';
  for (const v of ['--paper', '--ink', '--muted', '--line', '--bg', '--jade', '--gold', '--ok', '--bad', '--sil', '--who', '--where', '--plate'])
    assert.match(block, new RegExp(v + ':'), `${v} is the paper's own, not the phone's`);
  assert.match(block, /color:var\(--ink\)/, 'and its ink, for text that takes the page’s colour');
  assert.match(block, /color-scheme:light/);
  const dark = (css.match(/@media \(prefers-color-scheme: dark\)\{([\s\S]*?)\n\}/) || [])[1] || '';
  assert.ok(dark && !/\.sheet|\.talk|\.saybox|#modal/.test(dark), 'a dark phone changes the page and the console, never the cards');
  const paper = (css.match(/\.sheet,\.talk,\.saybox\{([^}]*)\}/) || [])[1] || '';
  assert.match(paper, /var\(--grain,none\)/, 'its grain, a tile the game makes as it starts (smooth without it)');
  assert.match(paper, /radial-gradient\(ellipse at center,transparent/, 'darker towards its edges');
  assert.ok(css.lastIndexOf('.sheet,.talk,.saybox{') > css.indexOf('.sheet{width:100%'), 'after the cards’ own styles, so the paper is what shows');
  // the grain is made in code, like all the game's art, the same every time
  const g = loadGame();
  assert.equal(g.run('typeof paperGrain'), 'function');
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'art.js'), 'utf8');
  assert.match(src, /setProperty\('--grain'/);
  assert.doesNotMatch((src.match(/function paperGrain\(\)\{[\s\S]*?\n\}/) || [''])[0], /Math\.random/, 'no chance in it');
});

test('a word’s characters, big on its card, each in a square of the practice grid: a new word, a word’s page in the scroll, and what you’ve picked', async () => {
  const g = loadGame({dom: true, save: {version: 42, started: true, w: {'山': {lv: 1, due: 0, ok: 0}}}});
  assert.equal(g.run("inGrid('山羊')"), '<span class="ge">山</span><span class="ge">羊</span>');
  assert.equal(g.run("inGrid('A & 山')"), 'A &amp; <span class="ge">山</span>', 'only Chinese characters, anything else as it is');
  g.run("mode = 'play'; say = () => {}; showNotice('山羊')");
  for (let i = 0; i < 10; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  const big = g.el('#sheet').querySelector('.word .big');
  assert.ok(big, 'the new word’s card');
  assert.equal(big.querySelectorAll('.ge').length, 2, 'a square for each character');
  assert.equal(big.textContent, '山羊', 'and it still reads as the word');
  for (const f of ['cards.js', 'scrolls.js']){
    const src = fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8');
    assert.doesNotMatch(src, /class="word side">[^\n]*<div class="big">\$\{(w|text)\}<\/div>/, `${f}: every word’s card puts its characters in the grid`);
  }
  assert.match(css, /\.word \.big \.ge\{[^}]*border:2px solid/, 'a red square');
  assert.match(css, /\.word \.big \.ge\{[^}]*repeating-linear-gradient\(90deg[^}]*repeating-linear-gradient\(0deg/, 'with a dashed cross');
  // a question's word to read is as it was: the grid is for a word's own card
  const quiz = fs.readFileSync(path.join(__dirname, '..', 'js', 'quiz.js'), 'utf8');
  assert.match(quiz, /<div class="word"><div class="big">\$\{w\}<\/div>/);
});
