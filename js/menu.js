// The pause menu and its pages.

/* ================= PAUSE MENU ================= */
function openMenu(focusId){
  const done = areaChecklist().filter(([, d]) => d).length, total = areaChecklist().length;
  openCard(`<p class="label">Paused</p>
    <div class="stats"><span>Area ${done}/${total}</span><span>${ORDER.filter(w => lvl(w) > 0).length}/${ORDER.length} words</span><span>🍑 ${S.peaches}</span></div>
    <div class="menu">
      <button class="btn" data-m="resume" data-b>Resume</button>
      <button class="btn" data-m="tasks">Tasks and progress</button>
      <button class="btn" data-m="words">Word Scroll</button>
      <button class="btn" data-m="friends">Friends <span class="val">${S.friends.length}</span></button>
      <button class="btn" data-m="today">Today’s words</button>
      <button class="btn" data-m="music" data-label="Music">Music <span class="val">${S.music ? 'On' : 'Off'}</span></button>
      <button class="btn" data-m="sound" data-label="Sound">Sound effects <span class="val">${S.sound ? 'On' : 'Off'}</span></button>
      <button class="btn" data-m="pinyin" data-label="Pinyin">Pinyin over words <span class="val">${S.pinyin ? 'On' : 'Off'}</span></button>
      <button class="btn" data-m="howto">How to play</button>
      <button class="btn" data-m="save">Save game</button>
      <button class="btn" data-m="title">Title screen</button>
      <button class="btn" data-m="reset">Reset progress</button>
    </div>`);
  if (focusId){ const f = sheet.querySelector(`[data-m="${focusId}"]`); if (f) f.focus(); }
  const back = () => openMenu();
  const act = {
    resume: () => closeCard(),
    tasks: () => {
      const tasks = getTasks();
      openCard(`<p class="label">${AREA.name.en}</p>${checklistHTML(false)}
        <p class="label">Now</p>${tasks.length ? `<ul class="tasks">${tasks.map(t => `<li>${esc(t.text)}</li>`).join('')}</ul>` : `<p class="hint">${esc(tasksHint() || 'Nothing to do right now.')}</p>`}
        <div class="stats" style="margin-top:10px"><span>${ORDER.filter(w => lvl(w) > 0).length}/${ORDER.length} words</span><span>${ORDER.filter(w => lvl(w) >= 3).length} can read</span><span>${S.friends.length} friends</span></div>
        <div class="actions"><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
      on('[data-a=ok]', () => openMenu('tasks'));
    },
    words: () => openScroll(() => openMenu('words')),
    friends: () => {
      openCard(`<p class="label">Friends</p>${S.friends.length ? `<div class="friends">${S.friends.map(id => { const hz = FRIEND_NAMES[id] || id; return `<button data-w="${hz}">${portrait(id)}<span style="font-size:1.2rem">${hz}</span><span class="small">${WORDS[hz] ? WORDS[hz].py : (NAMES[id] || {}).py || ''}</span></button>`; }).join('')}</div>` : '<p class="hint">No friends yet. Answer the questions of animals in the tall grass to make friends.</p>'}
        <div class="actions"><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
      sheet.querySelectorAll('.friends button').forEach(bt => bt.onclick = () => say(bt.dataset.w));
      on('[data-a=ok]', () => openMenu('friends'));
    },
    today: () => todaysWords(() => openMenu('today')),
    music: () => { S.music = !S.music; save(); if (S.music) musicStart(); else musicStop(); openMenu('music'); },
    sound: () => { S.sound = !S.sound; save(); if (S.sound) SFX.blip(); openMenu('sound'); },
    pinyin: () => { S.pinyin = !S.pinyin; save(); openMenu('pinyin'); },
    howto: () => howToPlay().then(() => openMenu('howto')),
    save: () => {
      save(); const t = new Date();
      openCard(`<div class="who" aria-hidden="true">💾</div><p>Game saved at ${t.getHours()}:${String(t.getMinutes()).padStart(2,'0')}.</p>
        <p class="small">Your progress also saves automatically after every step, on this device. To keep a copy somewhere safe, or to carry on on another device, download your save as a file, then load it here.</p>
        <input type="file" accept=".json,application/json" hidden>
        <div class="actions"><button class="btn" data-a="load">Load a save file</button><button class="btn" data-a="download">Download</button><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
      on('[data-a=ok]', () => openMenu('save'));
      on('[data-a=download]', () => {
        const f = saveFile(), a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([f.text], {type:'application/json'})); a.download = f.name;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        toast(`Downloaded ${f.name}`);
      });
      const pick = sheet.querySelector('input[type=file]');
      on('[data-a=load]', () => pick.click());
      pick.onchange = async () => {
        const file = pick.files[0]; if (!file) return;
        const r = readSaveFile(await file.text());
        if (r.error){ infoBox('💾', `<p>${esc(r.error)}</p>`).then(() => openMenu('save')); return; }
        const words = s => Object.values(s.w).filter(x => x && x.lv > 0).length;
        const yes = await confirmBox('💾', `Load this save? It has ${words(r.save)} words and ${r.save.peaches} 🍑. It replaces the game you're playing now (${words(S)} words); a copy of that is kept in this browser.`, 'Load it', 'Cancel');
        if (!yes) return openMenu('save');
        useSave(r.save); closeCard(); buildMap(); placePlayer(); toTitle();
      };
    },
    title: () => { closeCard(); toTitle(); },
    reset: () => {
      openCard(`<p class="label">Reset progress?</p><p>This erases every word, friend and task on this device. It can’t be undone.</p>
        <div class="actions"><button class="btn primary" data-a="no" data-b>Keep my progress</button><button class="btn" data-a="yes">Erase everything</button></div>`);
      on('[data-a=no]', () => openMenu('reset'));
      on('[data-a=yes]', () => { const snd = S.sound, mus = S.music; S = fresh(); S.sound = snd; S.music = mus; save(); closeCard(); buildMap(); placePlayer(); toTitle(); });
    }
  };
  sheet.querySelectorAll('[data-m]').forEach(bt => bt.onclick = () => { SFX.blip(); act[bt.dataset.m](); });
}
