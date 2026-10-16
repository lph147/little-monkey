// Picture questions, word games with animals and monkeys, and sentences with a word to fill in.

/* ================= QUESTIONS & ENCOUNTERS ================= */
function pictureQ({head, body, options, answerIdx, word, type, text, onShow, onAnswer}){
  return new Promise(res => {
    openCard(`${head}${body}<div class="opts">${options.map((o,i) => `<button class="opt${text ? ' hz' : ''}" data-i="${i}" aria-label="Option ${i+1}">${o}</button>`).join('')}</div>
      <div class="feedback" aria-live="polite"></div><div class="actions"><button class="btn primary" data-a="next" hidden>Next</button></div>`);
    bindTokens(sheet);
    if (onShow) onShow();
    on('[data-a=say]', () => say(word || ''));
    on('[data-a=py]', e => { e.currentTarget.outerHTML = `<div class="py">${WORDS[word].py}</div>`; });
    sheet.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const i = +b.dataset.i, ok = i === answerIdx;
      sheet.querySelectorAll('.opt').forEach(x => x.disabled = true);
      b.classList.add(ok ? 'right' : 'wrong');
      sheet.querySelector(`.opt[data-i="${answerIdx}"]`).classList.add('right');
      ok ? SFX.right() : SFX.wrong();
      const fb = sheet.querySelector('.feedback');
      if (word){
        fb.innerHTML = `${ok ? 'Yes!' : 'Not quite.'}<span class="hz">${word}</span>${WORDS[word].py}${ok ? '' : ' · ' + esc(WORDS[word].en)}`;
        setTimeout(() => say(word), 250); if (type) answer(word, ok, type);
      } else fb.textContent = ok ? 'Yes!' : 'Not quite.';
      if (onAnswer) onAnswer(ok);
      const n = sheet.querySelector('[data-a=next]'); n.hidden = false; n.focus();
      n.onclick = () => res(ok);
    });
  });
}
const picWords = () => ORDER.filter(w => WORDS[w].pic);
const canEncounter = () => picWords().filter(w => lvl(w) >= 1).length >= 3;
const canWild = () => matches(AREA.animalsAppear) && canEncounter();   // can animals jump out of their hiding place yet?
// The kind of picture question to ask about w: harder as you know it better, but only the kinds this area asks
// (its questions list). Caught: listen. Recognised: read. Read or Used: hear and read, or a mix of read and listen.
const GAP_CHANCE = 0.3;   // how often an animal's last question is a sentence with a word missing
function questionType(w){
  const L0 = lvl(w), asks = t => AREA.questions.includes(t);
  const want = L0 <= 1 ? 'listen' : L0 === 2 ? 'read'
    : asks('hear') ? (Math.random() < .6 ? 'hear' : 'read') : (Math.random() < .6 ? 'read' : 'listen');
  return asks(want) ? want : 'listen';
}
const snack = () => (AREA.shop ? AREA.shop.items : []).find(i => i.eat && (S.bag[i.item] || 0) > 0);   // food in your bag to eat in an encounter
const wrongToEat = (n, answerIdx) => shuffle([...Array(n).keys()].filter(i => i !== answerIdx))[0];   // which wrong answer eating takes away
async function encounter(foe){
  const an = foe.hz, img = foe.img;
  let showEn = false;
  const nameHTML = () => foe.name
    ? `<div class="spk-zh">${foe.name.zh} <span class="spk-py">${foe.name.py}</span></div><div class="spk-en">${foe.name.en}</div>`
    : `<div class="spk-zh">${an} <span class="spk-py">${WORDS[an].py}</span>${foe.justTaught ? '' : (showEn ? ` <span class="small">${esc(WORDS[an].en)}</span>` : ' <button class="engbtn" data-a="foeen">English</button>')}</div>`;
  const pool = picWords().filter(w => lvl(w) >= 1).sort((a,b) => (rec(a).due - rec(b).due) || (lvl(a) - lvl(b)));
  const targets = shuffle(pool.slice(0, 5)).slice(0, 3);
  let score = 0;
  for (let i = 0; i < targets.length; i++){
    // Sometimes, in an area that asks them, the last question is a sentence you know with a word missing.
    const b = AREA.questions.includes('gap') && i === targets.length - 1 && Math.random() < GAP_CHANCE ? practiceSentence() : null;
    if (b){ if ((await gapRound(b, img)).right) score++; continue; }
    const w = targets[i], type = questionType(w);
    const others = shuffle(picWords().filter(x => x !== w && lvl(x) >= 1));   // only words you have already met
    const opts = shuffle([w].concat(others.slice(0, 2)));
    const hearts = `<div class="hearts" aria-label="${score} of 3 friendship">${[0,1,2].map(k => `<span style="${k < score ? '' : 'opacity:.22;filter:grayscale(1)'}">🍑</span>`).join('')}</div>`;
    const head = `<div class="arena"><div><div class="name">${nameHTML()}</div>${hearts}</div>${img}</div>`;
    let body;
    if (type === 'listen') body = `<p class="prompt">Listen. Which picture is it?</p><div class="center"><button class="sayBig" data-a="say" aria-label="Play the word again">🔊</button></div>`;
    else if (type === 'read') body = `<p class="prompt">Read it. Which picture is it?</p><div class="word"><div class="big">${w}</div></div>`;
    else body = `<p class="prompt">Listen. Which characters is it?</p><div class="center"><button class="sayBig" data-a="say" aria-label="Play the word again">🔊</button></div>`;
    const food = foe.wild && snack();   // in an animal encounter, food from the shop takes away a wrong answer
    if (food) body += `<div class="center"><button class="btn" data-a="eat">Eat a ${esc(wz(food.item))} · ${S.bag[food.item]} left</button></div>`;
    const ok = await pictureQ({head, body, word: w, type,
      options: opts.map(o => type === 'hear' ? o : `<span class="ico">${picHTML(o)}</span><span class="cap">${type === 'read' ? WORDS[o].py : o}</span>`), text: type === 'hear',
      answerIdx: opts.indexOf(w), onShow: () => {
        if (type !== 'read') setTimeout(() => say(w), 300);
        on('[data-a=foeen]', e => { showEn = true; e.currentTarget.outerHTML = ` <span class="small">${esc(WORDS[an].en)}</span>`; });
        on('[data-a=eat]', e => {
          if (sheet.querySelector('.opt[disabled]')) return;   // already answered
          sheet.querySelector(`.opt[data-i="${wrongToEat(opts.length, opts.indexOf(w))}"]`).hidden = true;
          S.bag[food.item]--; save(); SFX.blip();
          e.currentTarget.remove();
          sheet.querySelector('.feedback').textContent = 'Crunch! One wrong answer is gone.';
        });
      }});
    if (ok) score++;
  }
  closeCard();
  S.peaches += score; S.encounters = (S.encounters || 0) + 1;
  const won = score >= 2;
  let msg;
  if (won){
    if (!S.friends.includes(foe.id)){ S.friends.push(foe.id); first('friend', an); }
    SFX.fanfare();
    msg = `You got ${score} of 3. The ${wz(an)} is now your ${wz('朋友')}! +${score} 🍑`;
  } else msg = `You got ${score} of 3. The ${wz(an)} ${foe.wild ? `went back to the ${wz(foe.home || HIDING_WORD)}` : 'wants to play again later'}. Those words will come back soon.`;
  save();
  await infoBox(img, `<p>${msg}</p>`);
  return won;
}

/* ================= FILL THE GAP ================= */
// A sentence with one word missing (gap), in Chinese with pinyin and in English (en): choose the missing
// word. It's never a grammar test. The choices follow the word's level: its picture with the Chinese
// while it's new (Caught), Chinese and pinyin once you've recognised it, and always for a word without a
// picture. Only words you've caught are offered: the gap and up to 2 others (from wrong, best first, or
// any not in the sentence), unless options gives them all. Choosing fills the gap and reads the sentence
// aloud. A right choice counts for the word; a wrong one shows the right word and play carries on.
// Gives true if you chose right.
async function gapQ({who = '', label = 'Fill the gap', t, en, gap, wrong, options}){
  const pics = !!WORDS[gap].pic && lvl(gap) <= 1;
  const fits = w => w !== gap && WORDS[w] && !WORDS[w].phrase && lvl(w) >= 1 && !t.includes(w) && (!pics || WORDS[w].pic);
  const opts = options || shuffle([gap, ...(wrong ? wrong.filter(fits) : shuffle(ORDER.filter(fits))).slice(0, 2)]);
  const shown = PUNCT.has(t.at(-1)) ? t : [...t, '。'];
  hear(t);
  const ok = await pictureQ({head:`${who ? `<div class="who" aria-hidden="true">${who}</div>` : ''}<p class="label">${label}</p><p class="prompt">Choose the missing word.</p>`,
    body:lineHTML(shown.map(w => w === gap ? GAP : w)) + `<div class="sentence-en">${esc(en)}</div><div class="gloss">Tap a word for its meaning.</div>`,
    options:opts.map(w => pics ? `<span class="ico">${picHTML(w)}</span><span class="cap">${w}</span>` : `${w}<span class="cap">${WORDS[w].py}</span>`),
    text:!pics, answerIdx:opts.indexOf(gap),
    onAnswer:() => { sheet.querySelector('.line').outerHTML = lineHTML(shown, gap); bindTokens(sheet); say(t.join('')); }});
  closeCard();
  if (ok) answer(gap, true, !WORDS[gap].pic ? 'build' : pics ? 'gap' : 'read');
  return ok;
}
