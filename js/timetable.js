// The timetable at school (课程表, decided 28 October 2026, after playtesting: which lesson you were doing, which you'd
// done, how to do one again and when the next would open were all unclear): each of the area's lesson series is a
// subject (its subject: name), its words in numbered lessons (the first teaches its first few, first; then one word a
// lesson). You choose the subject and the lesson, on a card with a tab for each and one for practice, opened by the
// teacher (the lesson step) or the chart on the classroom wall. A lesson is done once you know its words, so a game from
// before the timetable has its ticks straight away.

/* ================= TIMETABLE ================= */
const subjects = () => (AREA.lessons || []).filter(s => !s.if || matches(s.if));   // the subjects you have now
const lessonsOf = s => { const first = s.first || 1; return [s.words.slice(0, first), ...s.words.slice(first).map(w => [w])]; };   // each lesson's words
const nextLessonOf = s => lessonsOf(s).findIndex(ws => ws.some(w => lvl(w) === 0)) + 1;   // the lesson after those done (0: all done)
// How many more questions you need to answer before the next new lesson, in any subject (here().lessonTurn: your question
// count when your last lesson that taught a new word ended; none before your first): one wait for all of them, so it's
// still one new word at a time (decided 26 October 2026, and again 28 October 2026 with the timetable).
const practiceLeft = () => { const n = (AREA.lessonGap || {}).questions || 0, t = here().lessonTurn; return typeof t === 'number' ? Math.max(0, n - ((S.turn || 0) - t)) : 0; };
// Lesson n of subject s now: done (you know its words), ready (to start), waiting for more questions answered (wait, with
// left: how many), for the last lesson's new word to be practised (practise: right twice, need: that word), or locked
// till the one before is done. fresh: its words you don't know yet. (wait false: as if the questions were answered.)
function lessonState(s, n, wait = true){
  const words = lessonsOf(s)[n - 1], fresh = words.filter(w => lvl(w) === 0), next = nextLessonOf(s);
  if (!fresh.length) return {state:'done', words, fresh};
  if (n > next) return {state:'locked', words, fresh};
  if (wait && practiceLeft() > 0) return {state:'wait', words, fresh, left:practiceLeft()};
  const prev = n > 1 && lessonsOf(s)[n - 2].slice(-1)[0], need = prev && needsPractice(prev) ? prev : null;   // (the last lesson's last word)
  return need ? {state:'practise', words, fresh, need} : {state:'ready', words, fresh};
}
// The new lesson ready now ({series, n, words: its new words, word: the first}), if any: when several subjects have one,
// the one you didn't do last, so they take turns when you don't choose (wait false: as if you'd answered the questions).
function lessonNow(wait = true){
  const ready = [];
  for (const s of subjects()){
    const n = nextLessonOf(s), st = n && lessonState(s, n, wait);
    if (st && st.state === 'ready') ready.push({series:s, n, words:st.fresh, word:st.fresh[0]});
  }
  return ready.find(l => l.series.id !== here().lastLesson) || ready[0] || null;
}
const subjectName = (s, py = true) => `<span class="hz">${s.subject.zh}</span>${py && S.pinyin ? ` <span class="spy">${s.subject.py}</span>` : ''} ${esc(s.subject.en)}`;
const lessonName = (s, n) => `${s.subject.en} lesson ${n}`;
// The lessons ready now (which: 'ready'), or waiting for questions to be answered (which: 'waiting'), in words, for your
// tasks and hints ({lessons:ready} in the area's text), such as "Maths lesson 3 or Art lesson 3".
function lessonsText(which){
  const ls = subjects().map(s => [s, nextLessonOf(s)]).filter(([s, n]) => n && lessonState(s, n, which !== 'waiting').state === 'ready');
  const names = ls.map(([s, n]) => lessonName(s, n));
  return names.length < 2 ? names.join('') : names.slice(0, -1).join(', ') + ' or ' + names[names.length - 1];
}
// The chart on the classroom wall (js/art.js): a row for each subject, its icon, how many lessons it has, how many are
// done, and whether the next is ready.
const chartRows = () => subjects().map(s => { const n = nextLessonOf(s); return {icon:s.icon, n:lessonsOf(s).length, done:n ? n - 1 : lessonsOf(s).length, ready:!!n && lessonState(s, n).state === 'ready'}; });

// What a lesson is, in words: its first ("Three new numbers, then counting") or one of the rest.
const lessonAbout = (s, n) => n === 1 && lessonsOf(s)[0].length > 1 ? s.about.first : s.about.one;
// Why lesson n isn't open, or what it is if it is (the card's detail under the lessons), short enough for a small phone.
const wordsPy = ws => ws.map(w => `<span class="hz">${w}</span>${S.pinyin ? ` <span class="py">${WORDS[w].py}</span>` : ''}`).join(' · ');
function lessonDetail(s, n){
  const st = lessonState(s, n), head = `<b>Lesson ${n}</b> · `;
  if (st.state === 'done') return `${head}✓ Done: ${wordsPy(st.words)}`;
  if (st.state === 'locked') return `${head}Opens once you’ve done lesson ${n - 1}.`;
  if (st.state === 'wait'){ const n8 = (AREA.lessonGap || {}).questions || 0, did = n8 - st.left;
    return `${head}Opens after ${st.left} more question${st.left === 1 ? '' : 's'}, answered anywhere:<span class="bar"><i style="width:${did / n8 * 100}%"></i></span><b>${did}/${n8}</b>`; }
  if (st.state === 'practise') return `${head}Opens once you know ${wz(st.need)} well: get it right twice more, in practice.`;
  return `${head}Ready: ${lessonAbout(s, n)}.`;
}
// What choosing lesson n of s (or the practice tab: s null) does: a new lesson (new), one done again (again), or practice
// (while it isn't open yet): {kind, series, n}, with its button's words.
function lessonAction(s, n){
  if (!s) return {kind:'practice', label:'Practise'};
  const st = lessonState(s, n).state;
  if (st === 'done') return {kind:'again', series:s, n, label:`Lesson ${n} again`};
  if (st === 'ready') return {kind:'new', series:s, n, label:`Start lesson ${n}`};
  return {kind:'practice', label:'Practise'};
}
// Where the timetable opens: on a subject with a new lesson ready (one you didn't do last, if there are two), else one
// whose next lesson waits for practice, else the practice tab; on its next lesson (or its last, all done).
function ttDefault(){
  const now = lessonNow() || lessonNow(false), s = now ? now.series : subjects().find(x => nextLessonOf(x));
  return s ? {tab:s.id, n:nextLessonOf(s) || lessonsOf(s).length} : {tab:'practice', n:0};
}
const ttAction = ({tab, n}) => lessonAction(subjects().find(s => s.id === tab) || null, n);
const LOCK = '<svg class="lock" viewBox="0 0 7 8" aria-hidden="true"><path d="M2 3V2h1V1h1v1h1v1h1v5H1V3zM2 3h3V2H2z" fill="currentColor" fill-rule="evenodd"/></svg>';
// The timetable's card (at: the tab and lesson to open on, as {tab, n}; else ttDefault()). Left and right on the D-pad
// switch tabs, up and down choose a lesson (as in the Word Scroll), and A does what the main button says: start it, do it
// again, or practise. Gives the choice ({kind, series, n}), or null for Close.
function ttCard(at = ttDefault()){
  return new Promise(res => {
    let tab = at.tab, n = at.n;
    const render = () => {
      const subs = subjects(), s = subs.find(x => x.id === tab) || null;
      const tabs = [...subs.map(x => { const nx = nextLessonOf(x), mark = !nx ? '<span class="dn">✓</span>' : lessonState(x, nx).state === 'ready' ? '<span class="st">⭐</span>' : '';
        return `<button class="tab" role="tab" data-tab="${x.id}" aria-selected="${x.id === tab}"><ruby>${x.subject.zh}<rt>${S.pinyin ? x.subject.py : ''}</rt></ruby> ${esc(x.subject.en)}${mark}</button>`; }),
        `<button class="tab" role="tab" data-tab="practice" aria-selected="${!s}"><ruby>练习<rt>${S.pinyin ? 'liànxí' : ''}</rt></ruby> Practice</button>`].join('');
      let body;
      if (!s){
        const need = practiceWords(), pics = need.filter(w => WORDS[w].pic).slice(0, 9);
        body = `<div class="ttpractice">${pics.length ? `<div class="row">${pics.map(picHTML).join('')}</div>` : ''}
          <p>${need.length ? `<b>${need.length} word${need.length === 1 ? '' : 's'} need${need.length === 1 ? 's' : ''} practice.</b> ` : '<b>No words need practice right now.</b> '}A practice lesson asks about the words you know: never a new one, so you can do one any time, as often as you like.</p></div>`;
      } else {
        const tiles = lessonsOf(s).map((words, i) => {
          const k = i + 1, st = lessonState(s, k).state, cls = st === 'practise' ? 'wait' : st;
          const pics = `<span class="pics${words.length > 1 ? ' three' : ''}${st === 'done' ? '' : ' sil'}">${words.map(picHTML).join('')}</span>`;
          return `<button class="tile ${cls}${k === n ? ' sel' : ''}" data-lesson="${k}" aria-label="Lesson ${k}" data-label="Choose"><span class="n">${k}</span>${pics}<span class="badge">${{done:'✓', ready:'⭐'}[st] || LOCK}</span></button>`;
        }).join('');
        body = `<div class="tiles" data-nav>${tiles}</div><p class="detail">${lessonDetail(s, n)}</p>`;
      }
      const act = lessonAction(s, n);
      openCard(`<div class="tt"><p class="label"><span class="hz">课程表</span>${S.pinyin ? ' kèchéngbiǎo' : ''} · Timetable</p><div class="scrolltabs" role="tablist">${tabs}</div>${body}</div>
        <div class="actions"><button class="btn" data-a="no" data-b>Close</button><button class="btn primary" data-a="ok">${esc(act.label)}</button></div>`);
      sheet.querySelectorAll('.tab').forEach(b => b.onclick = () => {
        if (b.dataset.tab === tab) return;
        tab = b.dataset.tab; const t = subjects().find(x => x.id === tab); n = t ? nextLessonOf(t) || lessonsOf(t).length : 0;
        SFX.turn(); render();
        const sel = sheet.querySelector('.tab[aria-selected="true"]'); if (sel && sel.scrollIntoView) sel.scrollIntoView({block:'nearest', inline:'nearest'});
      });
      sheet.querySelectorAll('.tile').forEach(b => {
        const choose = () => { if (+b.dataset.lesson === n) return false; n = +b.dataset.lesson; SFX.turn(); render(); const t = sheet.querySelector(`.tile[data-lesson="${n}"]`); if (t){ markNav(t); t.focus({preventScroll:true}); } return true; };
        b.onclick = () => { if (!choose()) sheet.querySelector('[data-a=ok]').click(); };   // (tapping the chosen one again, or A at it: what the button says)
        b.onfocus = () => { if (+b.dataset.lesson !== n) choose(); };   // (the D-pad choosing it)
      });
      on('[data-a=no]', () => { closeCard(); res(null); });
      on('[data-a=ok]', () => { closeCard(); res(act); });
      const sel = sheet.querySelector('.tile.sel');
      if (sel){ markNav(sel); sel.focus({preventScroll:true}); }
    };
    render();
  });
}
// The lesson's name over every card in it (openCard, js/cards.js), such as 数学 shùxué Maths · Lesson 3, or Lesson 1, again.
let lessonBar = null;
// A lesson chosen on the timetable (a new one, or one again), with the teacher (who): its words (new ones taught, or all
// of them again, taught as before, with nothing new), then its end card. After a new one, the next new lesson, in any
// subject, waits (lessonGap). Gives whether to open the timetable again.
async function runLesson(pick, who){
  const s = pick.series, again = pick.kind === 'again', st = lessonState(s, pick.n);
  lessonBar = `${subjectName(s)} · Lesson ${pick.n}${again ? ', again' : ''}`;
  let r;
  try { r = await LESSON_KINDS[s.kind](s, again ? st.words : st.fresh, who, {again}); } finally { lessonBar = null; }
  if (!again){ here().lastLesson = s.id; here().lessonTurn = S.turn || 0; }
  save(); buildMap();   // (the chart on the wall gets its new star)
  return lessonEnd(s, pick.n, again ? st.words : st.fresh, again, r);
}
// The end of a lesson: what it taught (its words, with their pictures), how you did (r: right of asked, and shells), and
// what's next in the subject. Timetable goes back to choose another; OK (or B) ends the class.
function lessonEnd(s, n, words, again, r){
  const nx = nextLessonOf(s), st = nx && lessonState(s, nx);   // (the subject's first not done)
  const next = !nx ? `You’ve done every ${esc(s.subject.en)} lesson!`
    : st.state === 'ready' ? `Next in ${esc(s.subject.en)}: lesson ${nx}, ready now!`
    : st.state === 'wait' ? `Next in ${esc(s.subject.en)}: lesson ${nx}, after ${st.left} more questions, answered anywhere.`
    : st.state === 'practise' ? `Next in ${esc(s.subject.en)}: lesson ${nx}, once you know ${wz(st.need)} well.`
    : `Next in ${esc(s.subject.en)}: lesson ${nx}.`;
  return new Promise(res => {
    openCard(`<p class="lessonbar">${subjectName(s)} · Lesson ${n}${again ? ', again' : ''}</p>
      <div class="ldone"><span class="pics${words.length > 1 ? ' three' : ''}">${words.map(picHTML).join('')}</span><div><div class="big">${again ? '✓ Done again!' : `✓ Lesson ${n} done!`}</div>
        <div class="w">${wordsPy(words)}</div>
        <div class="small">${r.right} of ${r.asked} right${r.shells ? ` · +${r.shells} 🐚` : ''}</div></div></div>
      <p class="small">${next}</p>
      <div class="actions"><button class="btn" data-a="tt">Timetable</button><button class="btn primary" data-a="ok" data-b>OK</button></div>`);
    SFX.fanfare();
    on('[data-a=tt]', () => { closeCard(); res(true); });
    on('[data-a=ok]', () => { closeCard(); res(false); });
  });
}
// The class (the lesson step): the timetable, then whatever you choose on it: a lesson, and back to the timetable if you
// like, or practice. Gives false if you closed it without doing anything (so the class doesn't end: no 下课).
async function timetable(who){
  let at, did = false;
  for (;;){
    const pick = await ttCard(at);
    if (!pick) return did;
    if (pick.kind === 'practice') return await practise(speaker(who), PRACTICE.lesson) || did;   // (false: not started)
    did = true;
    if (!await runLesson(pick, who)) return true;
    at = {tab:pick.series.id, n:nextLessonOf(pick.series) || pick.n};
  }
}
