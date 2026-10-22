// Picture questions, word games with animals and monkeys, and sentences with a word to fill in.

/* ================= QUESTIONS & ENCOUNTERS ================= */
// The bottom row: what happened (or a helper, such as food to eat, until you answer) on the left, and Next on the
// right, its space kept while it's hidden, so nothing moves when it appears. Answers can have a part shown only
// once you've answered (class later).
function pictureQ({head, body, options, answerIdx, word, type, text, helper = '', onShow, onAnswer}){
  return new Promise(res => {
    openCard(`${head}${body}<div class="opts" data-nav>${options.map((o,i) => `<button class="opt${text ? ' hz' : ''}" data-i="${i}" aria-label="Option ${i+1}">${o}</button>`).join('')}</div>
      <div class="actions qfoot"><div class="feedback" aria-live="polite">${helper}</div><button class="btn primary" data-a="next" hidden>Next</button></div>`);
    bindTokens(sheet);
    if (onShow) onShow();
    on('[data-a=say]', () => say(word || ''));
    on('[data-a=py]', e => { e.currentTarget.outerHTML = `<div class="py">${WORDS[word].py}</div>`; });
    sheet.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const i = +b.dataset.i, ok = i === answerIdx;
      sheet.querySelectorAll('.opt').forEach(x => x.disabled = true);
      sheet.querySelector('.opts').classList.add('answered');
      b.classList.add(ok ? 'right' : 'wrong');
      sheet.querySelector(`.opt[data-i="${answerIdx}"]`).classList.add('right');
      ok ? SFX.right() : SFX.wrong();
      const fb = sheet.querySelector('.feedback');
      if (word){
        fb.innerHTML = `${ok ? 'Yes!' : 'Not quite.'}<span class="hz">${word}</span>${WORDS[word].py} · ${esc(WORDS[word].en)}`;   // (the English either way, in case a picture wasn't clear)
        setTimeout(() => say(word), 250); if (type) answer(word, ok, type);
      } else fb.textContent = ok ? 'Yes!' : 'Not quite.';
      if (onAnswer) onAnswer(ok);
      const n = sheet.querySelector('[data-a=next]'); n.hidden = false; n.focus(); shown();   // (so A pressed again at once doesn't skip what it says)
      n.onclick = () => res(ok);
    });
  });
}
const laterPy = w => S.pinyin ? `<span class="cap py later">${WORDS[w].py}</span>` : '';   // an answer's pinyin, shown once you've answered
// A counting question (a number lesson), about n things (thing: its word, and where they are: on the teacher's table,
// or together on the grass), with three numbers you know to choose from: the right one and the two nearest it.
// While the right one is new, you hear it, and choose the one with that many things, each with its characters (and its
// pinyin once you've answered). After that, the teacher asks how many there are (his line, ask, read aloud in his
// voice: who), and you count n things and choose its characters with pinyin. The answers are never pictures of numbers,
// such as dice: you could count their dots instead (decided 22 October 2026). A miss is practice, not a test: the
// number comes back soon, and keeps its gold squares. Gives whether you were right.
async function countQ({who, thing, n}){
  const num = COUNTING[n - 1], listen = lvl(num) <= 1;
  const gap = w => Math.abs(COUNTING.indexOf(w) - (n - 1));
  const near = shuffle(COUNTING.filter(w => w !== num && !NOT_HOW_MANY.includes(w) && WORDS[w] && lvl(w) >= 1)).sort((a, b) => gap(a) - gap(b));
  const opts = shuffle([num, ...(listen ? soundApart(num, near, 2) : near.slice(0, 2))]);
  const things = k => Array.from({length:k}, () => `<span class="thing">${picHTML(thing.word)}</span>`).join('');
  let ok;
  if (listen) ok = await pictureQ({head:`<div class="qhead lessonhead"><div class="who" aria-hidden="true">${portrait(who)}</div><p class="label">Listen. Which has that many?</p></div>`,
    body:'<div class="hearit"><button class="sayBig" data-a="say" aria-label="Hear it again">🔊</button></div>',
    options:opts.map(w => { const k = COUNTING.indexOf(w) + 1;   // (its characters, then its pinyin once you've answered, under it)
      return `<span class="count few ${thing.on || 'table'}">${things(k)}</span><span class="under"><span class="cap">${w}</span>${laterPy(w)}</span>`; }),
    answerIdx:opts.indexOf(num), word:num, onShow:() => setTimeout(() => say(num), 300)});
  else {
    const line = L[thing.ask], text = line.t.join('');
    hear(line.t);
    // (the question beside the teacher's face, then the things with its English beside them, so it all fits above the
    // answers on a small phone)
    ok = await pictureQ({head:`<div class="qhead lessonhead"><div class="who" aria-hidden="true">${portrait(who)}</div>${lineHTML(line.t)}<button class="tbtn" data-a="ask" aria-label="Hear the question again">🔊</button></div>`,
      body:`<div class="countq"><div class="count ${thing.on || 'table'}">${things(n)}</div>
        <div class="sentence-en">${esc(line.en)}</div></div><div class="gloss"></div>`,
      options:opts.map(w => `${w}<span class="cap">${WORDS[w].py}</span>`),
      text:true, answerIdx:opts.indexOf(num), word:num,
      onShow:() => { say(text, null, who); on('[data-a=ask]', () => say(text, null, who)); }});
  }
  closeCard();
  if (ok) answer(num, true, listen ? 'listen' : 'read'); else reviewed(num, false);
  return ok;
}
// A number lesson (a lesson series of kind count, with the teacher: who): he counts things onto his table, teaching the
// new number (his line for it, teach), then five counting questions: the new number three times, and twice another
// you know. Each right answer earns a shell if that number needed practice. Gives whether you had the lesson
// (you can say Not now at the start).
const LESSON_QUESTIONS = 5;   // (in a number or colour lesson)
// Numbers that never answer how many there are: two things are 两 (liǎng), not 二, so there are never two things to
// count, and 二 is never an answer (decided 21 October 2026).
const NOT_HOW_MANY = ['二'];
async function countLesson(series, word, who){
  const face = speaker(who);
  if (!await confirmBox(face, fill(series.start), 'Start', 'Not now')) return false;
  await showDialog(face, L[series.teach[word]], {teach:word});
  await showNotice(word, {quiet:true, ...(series.note ? {note:fill(series.note)} : {})});
  const top = COUNTING.indexOf(word) + 1, others = shuffle([...Array(top - 1).keys()].map(i => i + 1).filter(n => !NOT_HOW_MANY.includes(COUNTING[n - 1])));
  const counts = shuffle([...Array(LESSON_QUESTIONS - 2).fill(top), ...others.slice(0, 2)]);
  let right = 0, shells = 0;
  for (const n of counts){
    const things = series.things.filter(t => lvl(t.word) >= 1), thing = things[Math.floor(Math.random() * things.length)] || series.things[0];
    const need = needsPractice(COUNTING[n - 1]);
    if (await countQ({who, thing, n})){ right++; if (need) shells++; }
  }
  S.shells += shells; save(); SFX.fanfare();
  await infoBox(face, `<p class="label">Lesson over</p><p>You counted <b>${right} of ${counts.length}</b> right.${shells ? ` +${shells} 🐚` : ''}</p>`);
  return true;
}
// A colour question (a colour lesson): the teacher wants a paint, and you choose it from three colours you know, as in
// any picture question: you hear it while it's new, and the paints have their characters (and their pinyin once you've
// answered); once you know it, you read it, and choose from the paints alone. A miss is practice, as when counting.
// In your first colour lessons, before you know two other colours, other things you know with pictures make up the
// answers (decided 22 October 2026: red, yellow and white, which the prologue's flowers taught, are the first lessons now).
// Gives whether you were right.
async function colourQ({who, w}){
  const listen = lvl(w) <= 1, known = x => x !== w && lvl(x) >= 1;
  const colours = shuffle(ORDER.filter(x => known(x) && WORDS[x].category === WORDS[w].category));
  const pool = colours.length >= 2 ? colours : [...colours, ...shuffle(picWords().filter(x => known(x) && WORDS[x].category !== WORDS[w].category))];
  const opts = shuffle([w, ...(listen ? soundApart(w, pool, 2) : pool.slice(0, 2))]);
  const which = opts.every(o => WORDS[o].category === WORDS[w].category) ? 'Which paint is it?' : 'Which is it?';
  const ok = await pictureQ({head:`<div class="qhead lessonhead"><div class="who" aria-hidden="true">${portrait(who)}</div><p class="label">${listen ? 'Listen.' : 'Read it.'} ${which}</p></div>`,
    body:listen ? '<div class="hearit"><button class="sayBig" data-a="say" aria-label="Hear it again">🔊</button></div>'
      : `<div class="word"><div class="big">${w}</div>${S.pinyin ? `<div class="py">${WORDS[w].py}</div>` : ''}</div>`,
    options:opts.map(o => `<span class="ico">${picHTML(o)}</span>${listen ? `<span class="cap">${o}</span>${laterPy(o)}` : ''}`),
    answerIdx:opts.indexOf(w), word:w, onShow:() => { if (listen) setTimeout(() => say(w), 300); }});
  closeCard();
  if (ok) answer(w, true, listen ? 'listen' : 'read'); else reviewed(w, false);
  return ok;
}
// A colour lesson (a lesson series of kind paint, with the teacher: who): he opens a pot of the new colour, teaching it
// (his line for it, teach), then wants paints, five times: the new colour three times, and twice another colour you
// know (in your first lessons, the new colour instead, until you know two others). Each right answer earns a shell if that colour needed practice. Then the class goes out and paints a part of the
// school with the new colour (its scene, in scenes). Gives whether you had the lesson (you can say Not now at the start).
async function paintLesson(series, word, who){
  const face = speaker(who);
  if (!await confirmBox(face, fill(series.start), 'Start', 'Not now')) return false;
  await showDialog(face, L[series.teach[word]], {teach:word});
  await showNotice(word, {quiet:true, ...(series.note ? {note:fill(series.note)} : {})});
  const others = shuffle(ORDER.filter(x => x !== word && WORDS[x].category === WORDS[word].category && lvl(x) >= 1)).slice(0, 2);   // (the first lessons: fewer, or none)
  const asks = shuffle([...Array(LESSON_QUESTIONS - others.length).fill(word), ...others]);
  let right = 0, shells = 0;
  for (const w of asks){
    const need = needsPractice(w);
    if (await colourQ({who, w})){ right++; if (need) shells++; }
  }
  S.shells += shells; save();
  if ((series.scenes || {})[word]) await storyScene(series.scenes[word]);   // (with its own fanfare)
  await infoBox(face, `<p class="label">Lesson over</p><p>You chose <b>${right} of ${asks.length}</b> paints right.${shells ? ` +${shells} 🐚` : ''}</p>`);
  return true;
}
const picWords = () => ORDER.filter(w => WORDS[w].pic);
// A word's pinyin without its tones (ü as u, no spaces): the words that sound alike, to anyone just hearing them.
const toneless = w => WORDS[w].py.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '').toLowerCase();
// n of these words, in order, to go beside the answer when you only hear it (listening): none that sounds like the
// answer or another of them apart from its tone, such as 喝 hē beside 河 hé (decided 21 October 2026: confusing, and a
// voice can't always make the tone clear). When reading, they can be together.
function soundApart(answer, words, n){
  const heard = new Set([toneless(answer)]), out = [];
  for (const w of words){ if (out.length >= n) break; if (!heard.has(toneless(w))){ heard.add(toneless(w)); out.push(w); } }
  return out;
}
// An animal asks about 3 words you've caught, never its own name (that's on the screen), so you need 4.
const canEncounter = () => picWords().filter(w => lvl(w) >= 1).length >= 4;
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
// A question about word w, of the kind its level calls for: what to show (body), and the answers (opts, as HTML in
// options), never with avoid among them (such as an animal that's right there). Only words you've already met.
function wordQuestion(w, avoid){
  const type = questionType(w);
  const others = shuffle(picWords().filter(x => x !== w && x !== avoid && lvl(x) >= 1));
  const opts = shuffle([w].concat(type === 'read' ? others.slice(0, 2) : soundApart(w, others, 2)));   // (listening: none that sound alike)
  let body;
  if (type === 'listen') body = `<div class="askrow"><p class="prompt">Listen. Which picture is it?</p><button class="sayBig" data-a="say" aria-label="Play the word again">🔊</button></div>`;
  else if (type === 'read') body = `<div class="askrow"><p class="prompt">Read it. Which picture is it?</p><div class="word"><div class="big">${w}</div>${S.pinyin ? `<div class="py">${WORDS[w].py}</div>` : ''}</div></div>`;   // (the word to read where a listening question has its 🔊: above the answers)
  else body = `<div class="askrow"><p class="prompt">Listen. Which word is it?</p><button class="sayBig" data-a="say" aria-label="Play the word again">🔊</button></div>`;
  // The answers: when listening, pictures with their characters; when reading, just pictures (the word has its
  // pinyin, so pinyin here would match itself); when hearing, the words with their pinyin. Never characters alone.
  // When listening, each one's pinyin shows once you've answered (before, you could match the sound to it).
  const options = opts.map(o => type === 'hear' ? o + (S.pinyin ? `<span class="cap">${WORDS[o].py}</span>` : '') : `<span class="ico">${picHTML(o)}</span>${type === 'read' ? '' : `<span class="cap">${o}</span>${laterPy(o)}`}`);
  return {type, body, opts, options, text:type === 'hear', answerIdx:opts.indexOf(w)};
}
// The words to ask about (n of them, avoiding avoid): from the front of the review list, at random (nextWords, js/state.js).
const toAsk = (avoid, n) => nextWords(picWords().filter(w => w !== avoid && lvl(w) >= 1), n);
// Food: what's in your bag to eat (AREA.food says what each does). Some brings hearts back (heal: eaten on your turn in a
// battle, or from your bag), and some takes away a wrong answer in a question (helps: no turn used).
const FOOD = AREA.food || {};
const foodThat = does => Object.keys(FOOD).find(w => FOOD[w][does] && (S.bag[w] || 0) > 0);   // food in your bag that heals, or helps
const bagFull = w => (S.bag[w] || 0) >= ((FOOD[w] || {}).carry || 3);
function intoBag(w){ if (bagFull(w)) return false; S.bag[w] = (S.bag[w] || 0) + 1; save(); return true; }   // false: no room
const wrongToEat = (n, answerIdx) => shuffle([...Array(n).keys()].filter(i => i !== answerIdx))[0];   // which wrong answer eating takes away
// Food that takes away a wrong answer, such as an apple, offered under a question until you answer: its button (helperHTML),
// and eating it (wireHelper: one of the wrong answers goes; n is how many answers there are, right the right one).
function helperHTML(){ const w = foodThat('helps'); return w ? `<button class="helper" data-a="eat" data-label="Eat">${picHTML(w)}<span>Eat a ${esc(wz(w))}<span class="why">: one wrong answer goes</span> · ${S.bag[w]} left</span></button>` : ''; }
function wireHelper(n, right){
  on('[data-a=eat]', e => {
    const w = foodThat('helps');
    if (!w || sheet.querySelector('.opt[disabled]')) return;   // already answered
    sheet.querySelector(`.opt[data-i="${wrongToEat(n, right)}"]`).hidden = true;
    S.bag[w]--; save(); SFX.blip();
    e.currentTarget.remove();
    sheet.querySelector('.feedback').textContent = 'Crunch! One wrong answer is gone.';
  });
}
async function encounter(foe){
  const an = foe.hz, img = foe.img;
  let showEn = false;
  const nameHTML = () => foe.name
    ? `<div class="spk-zh">${foe.name.zh} <span class="spk-py">${foe.name.py}</span></div><div class="spk-en">${foe.name.en}</div>`
    : `<div class="spk-zh">${an} <span class="spk-py">${WORDS[an].py}</span>${foe.justTaught ? '' : (showEn ? ` <span class="small">${esc(WORDS[an].en)}</span>` : ' <button class="engbtn" data-a="foeen">English</button>')}</div>`;
  // The scene: your monkey, from behind, facing the animal on the grass (or a cliff, if that's its home), and its
  // name plate with hearts for the friendship won so far (filled: how many) and which question this is (n of 3).
  const me = monkeySprite('player', 'up', false, 0, true).toDataURL();   // (no stick: these are friends)
  const scene = (filled, n, look = '') => `<div class="scene${sceneLook(foe.home)}"><div class="mound foem"></div><div class="foe ${look}">${img}</div>`
    + `<div class="mound mem"></div><img class="me" alt="" src="${me}"><div class="plate"><div class="name">${nameHTML()}</div>`
    + `<div class="hearts" aria-label="Friendship: ${filled} of 3">${[0, 1, 2].map(k => heartHTML(k < filled)).join('')}</div>${n ? `<div class="qn">Question ${n} of 3</div>` : ''}</div>`
    + '<div class="plus" aria-hidden="true" hidden>+♥</div></div>';
  const targets = toAsk(an, 3);
  let score = 0;
  for (let i = 0; i < targets.length; i++){
    // Sometimes, in an area that asks them, the last question is a sentence you know with a word missing.
    const b = AREA.questions.includes('gap') && i === targets.length - 1 && Math.random() < GAP_CHANCE ? practiceSentence() : null;
    if (b){ if ((await gapRound(b, img)).right) score++; continue; }
    const w = targets[i], q = wordQuestion(w, an), {type, body, opts} = q;   // (never the animal, which is right there)
    const head = scene(score, i + 1);
    const helper = foe.wild ? helperHTML() : '';   // in an animal encounter, food such as an apple takes away a wrong answer
    const ok = await pictureQ({head, body, word: w, type, helper, options: q.options, text: q.text,
      answerIdx: q.answerIdx, onAnswer: ok => {   // right: the animal hops and a heart fills
        if (!ok) return;
        const sc = sheet.querySelector('.scene'); if (!sc) return;
        sc.querySelector('.foe').classList.add('hop');
        sc.querySelector('.hearts').innerHTML = [0, 1, 2].map(k => heartHTML(k < score + 1)).join('');
        sc.querySelector('.plus').hidden = false;
      }, onShow: () => {
        if (type !== 'read') setTimeout(() => say(w), 300);
        on('[data-a=foeen]', e => { showEn = true; e.currentTarget.outerHTML = ` <span class="small">${esc(WORDS[an].en)}</span>`; });
        wireHelper(opts.length, opts.indexOf(w));
      }});
    if (ok) score++;
  }
  closeCard();
  S.shells += score; S.encounters = (S.encounters || 0) + 1;
  const won = score >= 2, already = S.friends.includes(foe.id), shells = score ? ` +${score} 🐚` : '';
  let label, msg;
  if (won){
    if (!already) S.friends.push(foe.id);
    SFX.fanfare();
    label = already ? '♥ Friends' : '⭐ New friend';
    msg = already ? `You played with your ${wz('朋友')}, the ${wz(an)}!${shells}` : `The ${wz(an)} is now your ${wz('朋友')}!${shells}`;
  } else {
    label = `${score} of 3`;
    msg = `The ${wz(an)} ${foe.wild ? `went back to the ${wz(foe.home || HIDING_WORD)}` : 'wants to play again later'}. Those words will come back soon.${shells}`;
  }
  save(); showEn = true;   // the English is in the message, so the name plate shows it too
  await infoBox(scene(score, 0, won ? 'hop' : 'gone'), `<p class="label center">${label}</p><p class="endmsg">${msg}</p>`);
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
  // The speaker beside what to do, then the sentence and its English (and, for your first few lines, how to see a word's meaning).
  const tip = Object.keys(S.lines).length <= TAP_TIP_LINES;
  const ok = await pictureQ({head:`<div class="qhead">${who ? `<div class="who" aria-hidden="true">${who}</div>` : ''}<div><p class="label">${label}</p><p class="prompt">Choose the missing word.</p></div></div>`,
    body:lineHTML(shown.map(w => w === gap ? GAP : w)) + `<div class="sentence-en">${esc(en)}</div><div class="gloss${tip ? ' tip' : ''}">${tip ? 'Tap a word for its meaning.' : ''}</div>`,
    options:opts.map(w => pics ? `<span class="ico">${picHTML(w)}</span><span class="cap">${w}</span>${laterPy(w)}` : `${w}<span class="cap">${WORDS[w].py}</span>`),
    text:!pics, answerIdx:opts.indexOf(gap),
    onAnswer:() => { sheet.querySelector('.line').outerHTML = lineHTML(shown, gap); bindTokens(sheet); say(t.join('')); }});
  closeCard();
  if (ok) answer(gap, true, !WORDS[gap].pic ? 'fill' : pics ? 'gap' : 'read');
  else reviewed(gap, false);   // missed: it comes back soon (its gold squares stay: filling a gap is practice, not a test)
  return ok;
}
