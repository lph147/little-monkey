// Friends to find (decided 30 October 2026): the Friends page shows every animal of the chapters you've reached, your
// friends in colour, one you've met but not won over in colour too (Not a friend yet; the bees, how many of the six), and
// the rest as shadows with a clue to where they live, which you tap for its clue card. Then the troop and others, friends
// you make through the story, only once they're your friends.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const knowing = words => Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]));
function friends(more){
  const g = loadGame({dom: true, save: {version: 32, started: true, w: knowing(['石头', '山', '草', '树', '动物', '兔子', '羊', '松鼠', '山羊', '鹿', '狐狸', '蜜蜂', '牛']), ...more}});
  g.run("mode = 'play'; say = () => {}");
  g.run('openMenu()'); g.el('#sheet').querySelector('[data-m="friends"]').click();
  return g;
}
const cards = g => g.el('#sheet').querySelectorAll('.friends button').map(b => [b.dataset.w || b.dataset.clue, b.className || 'friend', b.textContent.replace(/\s+/g, ' ').trim()]);

test('in the prologue: its four animals, a friend, one met but not won over, and two shadows with clues', () => {
  const g = friends({friends: ['rabbit'], met: ['rabbit', 'sheep'], areas: {1: {elder: 2}}});
  assert.equal(g.el('#sheet').querySelector('.label').textContent, 'Friends 1 of 4 animals');
  assert.deepEqual(cards(g), [
    ['兔子', 'friend', '兔子tùzi'],
    ['羊', 'fmet', '羊yángNot a friend yet'],
    ['squirrel', 'fshadow', '？The meadow, up a big tree'],
    ['goat', 'fshadow', '？The meadow, on a cliff']], 'chapter 1’s animals aren’t there yet');
});

test('in chapter 1: its animals join, the bees as one card with how many of the six are your friends', () => {
  const g = friends({friends: ['rabbit', 'sheep', 'squirrel', 'goat', 'deer', 'bee', 'playful', 'cow'], met: ['rabbit', 'sheep', 'squirrel', 'goat', 'deer', 'fox', 'bee'],
    areas: {1: {elder: 2, chapter: 1, beeFriends: 3}}});
  assert.equal(g.el('#sheet').querySelector('.label').textContent, 'Friends 5 of 11 animals', 'the bees count once all six are friends');
  const c = cards(g);
  assert.deepEqual(c.slice(4, 11).map(([id, k]) => [id, k]), [['鹿', 'friend'], ['owl', 'fshadow'], ['狐狸', 'fmet'], ['butterfly', 'fshadow'], ['蜜蜂', 'fmet'], ['duck', 'fshadow'], ['horse', 'fshadow']]);
  assert.match(c[8][2], /3\/6/);
  assert.deepEqual(c.slice(11).map(([w]) => w), ['小猴子', '牛'], 'then the troop and others, only your friends');
  assert.equal(g.el('#sheet').querySelectorAll('.fsub').length, 1);
});

test('tap a shadow: its clue, then Back to the page, on that shadow', () => {
  const g = friends({friends: [], met: [], areas: {1: {elder: 2}}});
  g.el('#sheet').querySelector('.friends [data-clue="goat"]').click();
  const text = g.run('sheet.textContent').replace(/\s+/g, ' ');
  assert.match(text, /A friend to find.*？.*The meadow, on a cliff\..*Find it, and answer its questions to make friends\./);
  assert.ok(!text.includes('山羊') && !text.includes('goat'), 'never its name');
  g.run('pressB()');
  assert.equal(g.run('document.activeElement && document.activeElement.dataset.clue'), 'goat');
});

test('every animal has a clue to where it lives, in plain English, never its name', () => {
  const g = friends({friends: [], met: []});
  const bad = JSON.parse(g.run("JSON.stringify(ANIMALS.filter(a => !a.clue || /[\\u4e00-\\u9fff]/.test(a.clue) || a.clue.toLowerCase().includes(a.name.toLowerCase())).map(a => a.id))"));
  assert.deepEqual(bad, []);
});
