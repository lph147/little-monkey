// The small working copy of a page that tests use to press the game's buttons (mini-dom.js).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {makeElement} = require('./mini-dom');

const card = html => { const doc = {activeElement: null}, el = makeElement('div', {id: 'sheet'}, doc); el.innerHTML = html; return {el, doc}; };

test('finds buttons by class, data attribute and compound selectors', () => {
  const {el} = card('<div class="opts"><button class="opt hz" data-i="0">山</button><button class="opt" data-i="1">水</button></div>'
    + '<div class="actions"><button class="btn primary" data-a="next" hidden>Next</button></div>');
  assert.equal(el.querySelectorAll('.opt').length, 2);
  assert.equal(el.querySelector('.opt[data-i="1"]').textContent, '水');
  assert.equal(el.querySelector('[data-a=next]').textContent, 'Next');
  assert.equal(el.querySelectorAll('.actions button, .opts .hz').length, 2);
  assert.equal(el.querySelector('.opt').dataset.i, '0');
  assert.equal(el.querySelector('[data-a=next]').hidden, true);
});

test('clicking runs the button\'s onclick, unless it is disabled', () => {
  const {el} = card('<button class="tile" data-w="b"><ruby>我<rt>wǒ</rt></ruby></button>');
  const b = el.querySelector('.tile');
  let clicks = 0;
  b.onclick = e => { clicks++; assert.equal(e.currentTarget, b); };
  b.click(); b.disabled = true; b.click();
  assert.equal(clicks, 1);
  assert.ok(el.querySelector('.tile[disabled]'));
  assert.equal(b.querySelector('ruby').firstChild.textContent, '我');
});

test('classes, hiding, removing, focus and replacing a button', () => {
  const {el, doc} = card('<div class="word"><div class="en" hidden>mountain</div></div><button class="mw" data-w="山">山</button>');
  const mw = el.querySelector('.mw');
  mw.classList.add('sel', 'done'); mw.classList.remove('sel');
  assert.equal(mw.className, 'mw done');
  assert.equal(el.querySelector('.word .en').offsetParent, null, 'hidden things have no offsetParent');
  el.querySelector('.word .en').hidden = false;
  assert.ok(el.querySelector('.word .en').offsetParent);
  mw.focus(); assert.equal(doc.activeElement, mw); assert.ok(el.contains(mw));
  mw.outerHTML = '<span class="small">gone</span>';
  assert.equal(el.querySelector('.mw'), null);
  assert.equal(el.querySelector('.small').textContent, 'gone');
});
