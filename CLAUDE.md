# Little Monkey (小猴子): project notes for Claude Code

## About this project
A retro, Pokémon-style web game for learning Mandarin Chinese, themed on *Journey to the West*. The player is a baby monkey (Sun Wukong) who collects Chinese words like creatures, learns grammar from the story's characters, and earns progress by practising.

- **DESIGN.md** is the plan and the source of truth for design decisions. Follow it. If a request conflicts with it, point that out before building.
- **index.html** is the game. It loads `css/game.css`, then the content in `content/`, then the engine in `js/`, in the order listed in index.html; each script can use what the ones before it define. All pixel art and sound are generated in code.
- **content/** is the game's content, as data: `words.js` (the word bank: every word once, with pinyin, English, picture and the area it's collected in), `sprites.js` (pixel art for collectible words) and one file per area, such as `flower-fruit-mountain.js`. An area's `legend` says what each map letter is (how it looks, whether you can walk on it, the word it teaches, what A does); the looks are in `js/art.js` and the special actions in `js/world.js`. Its `talk` scripts say what each character does: the first part whose `if` matches runs its list of steps (`STEPS` in `js/world.js`). Its `requests` are characters asking you to bring something (run by `request()` in `js/world.js`), its `events` happen by themselves when their `if` matches, and its `counters` are numbers that text and conditions can use. In content text, `{汉字}` is shown as 汉字 (English) and `{counter}` as its number. Every line must be said somewhere (a test checks). Chinese sentences are written with a space between words (`'我 饿 了 。'`), and every word must be in the word bank; `npm test` checks this and more.
- **Version 8**, the single-file original built in a Claude chat, is in git history as `little-monkey.html` (first commit). It was deleted once its save format was replaced.
- **The save** (`js/state.js`) has a version number. When the format changes: raise `SAVE_VERSION`, add a step to `upgradeSave()` that converts the previous version, and add a test to `tests/save.test.js`. The game keeps a copy of each old save in the browser before converting it (`xiaohouzi-v2-backup-v2` and so on), and never overwrites a broken save.

## About me
I'm new to coding. Please:
- Explain what you're about to do and why, in plain English, in a few sentences.
- Plan before any large change, and wait for my go-ahead.
- Keep each task small enough that I can test it on my phone afterwards.
- Tell me exactly how to check your work (what to open, where to walk, what to press).

## How we work
- Commit to git after every change that works, with a clear message. Never leave the game broken at the end of a task.
- Ask me before each upload (push) to GitHub, because uploading publishes to the live site.
- Run the automated tests before every commit, once they exist. Add or update a test when you add a feature.
- Keep saved games working. If the save format changes, migrate old saves instead of wiping them.
- The game must work on a phone browser (portrait, touch) and on desktop (keyboard).
- No build tools or frameworks unless we agree. Plain HTML, CSS and JavaScript, loadable from a static web host (GitHub Pages).
- Keep DESIGN.md's "Next steps" checklist up to date when a step is finished.

## Tools
- `npm test` runs the automated tests (Node's built-in test runner; there are no packages to install).
- `npm start` serves the game at http://127.0.0.1:8000. The preview pane's "game" configuration does the same.
- TESTING.md has the checks to do by hand: a quick check after every change and a full playthrough of Area 1.
- The game is published at https://lph147.github.io/little-monkey/ by GitHub Pages, from the `main` branch of github.com/lph147/little-monkey. Pushing to GitHub updates it within a few minutes. Commits use the GitHub private email, never a personal one.

## Learning design rules (decided through playtesting; keep these)
- **One new word at a time.** No conversation, action or encounter teaches two new words back to back.
- **New-word cards** show the picture, characters, pinyin, sound and English. English is shown by default on the first card only; after that it is behind an English button.
- **Sentences:** pinyin over every word (a global setting can turn it off). Words the player has learned are green. The word being taught right now is bold green. Everything else is grey and "just for listening". Tapping any word shows its pinyin and meaning.
- **A sentence's English** is shown underneath the first time it appears; after that it is behind an English button.
- **In English UI text** (tasks, messages, notes), a Chinese word is always written as 汉字 (English), e.g. "Give the 水 (water) to the thirsty monkey". Tasks for words not yet learned are written in plain English.
- **Quizzes only use words the player has already caught**, including all wrong-answer options. Every picture must be unique and unambiguous. Answers show Chinese under the picture (characters when listening, pinyin when reading).
- **Names of characters** (e.g. 老猴子 lǎo hóuzi · Old monkey) show Chinese, pinyin and English together, because names aren't vocabulary. Use plain descriptions, never invented nicknames.
- **Animal names:** the first meeting teaches the name on a new-word card and the encounter never shows the English. Later meetings show Chinese and pinyin with English on tap.
- **The old monkey must be spoken to first**; other characters point the player to him until then.

## Controls rules (keep these)
- D-pad: hold to walk, tap to turn on the spot, slide between directions without lifting. Text on the page must never be selectable.
- **A** = talk, look, choose. On cards, A always presses the main (green) button, marked with a red A badge.
- **B** = back or dismiss only (blue B badge on the button it presses). B never opens the menu.
- **Menu** is its own button at the top (keyboard: M or Esc).
- A/B badges appear only on a card's bottom action buttons and in the menu, never on things you tap directly (answers, word tiles, words in sentences).
- Messages appear in a box at the bottom of the game screen; tasks live in the text box below the screen.

## Chinese accuracy
Lines in the game should be natural, simple Mandarin. Flag anything you're unsure of so I can get it checked by a native speaker.
