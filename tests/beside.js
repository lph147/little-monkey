// Watches a game for a task that comes up just as you finish with someone, about them, while you're still beside them,
// such as "The master wants to see you" as you stand talking to him (decided 6 November 2026, after playing it: bringing
// the senior pupil his water, a new task said to go and see him). They should go straight on instead (the goOn step).
// What you're doing for them, to remind you, is fine (REMINDERS): the practice before a lesson, what to bring, the wind
// to wait for, or what you said Not now to.
const REMINDERS = ['practise', 'count', 'cow3', 'c1chore', 'c1fetch', 'c1axe', 'a2wind'];
function watchBeside(g){
  g.run(`globalThis.__beside = []; (() => {
    const points = (t0, id) => { const t = AREA.tasks.find(x => x.id === t0.id) || {}; return t.arrow === id || !!(t.arrow && t.arrow.nearest && t.arrow.nearest.some(a => a.who === id)); };
    let last = null;
    const ri = interact; interact = async (x, y) => { const n = npcAt(x, y) || followerAt(x, y); last = n ? {n, before: new Set(getTasks().map(t => t.id))} : null; return ri(x, y); };
    const rr = runEvents; runEvents = async () => { await rr(); if (!last) return;
      const {n, before} = last; last = null;
      if (n.place !== PLACE || Math.abs(n.x - pl.x) + Math.abs(n.y - pl.y) > 1) return;   // (not beside them any more, such as sent back to your room)
      for (const t of getTasks()) if (!before.has(t.id) && points(t, n.id)) __beside.push({who: n.id, task: t.id, text: t.text}); };
  })()`);
}
const besideTasks = g => JSON.parse(g.run('JSON.stringify(__beside)')).filter(t => !REMINDERS.includes(t.task));
module.exports = {watchBeside, besideTasks, REMINDERS};
