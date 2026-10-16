// Picture questions, word games with animals and monkeys, and building sentences from word tiles.

/* ================= QUESTIONS & ENCOUNTERS ================= */
function pictureQ({head, body, options, answerIdx, word, type, text, onShow}){
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
      const n = sheet.querySelector('[data-a=next]'); n.hidden = false; n.focus();
      n.onclick = () => res(ok);
    });
  });
}
const picWords = () => ORDER.filter(w => WORDS[w].pic);
const canEncounter = () => picWords().filter(w => lvl(w) >= 1).length >= 3;
const canWild = () => matches(AREA.animalsAppear) && canEncounter();   // can animals jump out of their hiding place yet?
// The kind of question to ask about w: harder as you know it better, but only the kinds this area asks
// (its questions list). Caught: listen. Recognised: read. Read or Used: hear and read, or a mix of read and listen.
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
    if (!S.friends.includes(foe.id)) S.friends.push(foe.id);
    SFX.fanfare();
    msg = `You got ${score} of 3. The ${wz(an)} is now your ${wz('朋友')}! +${score} 🍑`;
  } else msg = `You got ${score} of 3. The ${wz(an)} ${foe.wild ? `ran back into the ${wz(HIDING_WORD)}` : 'wants to play again later'}. Those words will come back soon.`;
  save();
  await infoBox(img, `<p>${msg}</p>`);
  return won;
}

/* ================= SENTENCE TILES ================= */
function tiles(who, target, extras, prompt){   // gives true if the sentence was built right first time
  return new Promise(res => {
    const bank = shuffle(target.concat(extras)).map((t,i) => ({t, i}));
    let picked = [], misses = 0;
    const tileBtn = (o, where) => { const [py] = info(o.t); const show = S.pinyin;
      return `<button class="tile" data-w="${where}" data-i="${o.i}"><ruby>${o.t}<rt class="${show ? '' : 'hid'}">${py}</rt></ruby></button>`; };
    function render(msg){
      openCard(`<div class="who" aria-hidden="true">${who}</div><p class="prompt">${prompt}</p>
        <div class="slots" aria-label="Your sentence">${picked.map(o => tileBtn(o,'s')).join('') || '<span class="small">Tap the words below in order.</span>'}</div>
        <div class="bank">${bank.filter(o => !picked.includes(o)).map(o => tileBtn(o,'b')).join('')}</div>
        <div class="feedback" aria-live="polite">${msg || ''}</div>
        <div class="actions"><button class="btn grow" data-a="say">🔊 Hear the monkey</button><button class="btn primary" data-a="check" ${picked.length === target.length ? '' : 'disabled'}>Say it</button></div>`);
      sheet.querySelectorAll('.tile').forEach(b => b.onclick = () => {
        const o = bank.find(x => x.i === +b.dataset.i);
        say(o.t); SFX.blip();
        if (b.dataset.w === 'b') picked.push(o); else picked = picked.filter(x => x !== o);
        render();
      });
      on('[data-a=say]', () => say(target.join('')));
      on('[data-a=check]', () => {
        if (picked.map(o => o.t).join('') === target.join('')){ SFX.right(); say(target.join('')); closeCard(); res(misses === 0); }
        else { misses++; picked = []; SFX.wrong(); render('Not quite. Listen again and try once more.'); sheet.querySelector('.slots').classList.add('shake'); say(target.join('')); }
      });
    }
    render();
  });
}
