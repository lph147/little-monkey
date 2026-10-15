# Testing Little Monkey

## Automated tests

Run these in the project folder before every commit:

```
npm test
```

They start the game in a pretend browser (no window opens) and check that it loads without errors and shows the title screen, for a new player and for a saved game. They catch typos, missing files and files loaded in the wrong order. They can't tell whether the game *feels* right, so the checks below are still needed.

## Playing on this computer

```
npm start
```

Then open http://127.0.0.1:8000 in a browser. Press Ctrl+C in the terminal to stop. In Claude Code, the preview pane's "game" setting does the same.

Until the split is finished, http://127.0.0.1:8000/little-monkey.html is the original version 8, for comparison. Both use the same save.

## Playing on your phone

Open https://lph147.github.io/little-monkey/ on your phone. GitHub Pages updates it a minute or two after each upload to GitHub. Your phone may keep showing the previous version for up to 10 minutes; if a change hasn't appeared, wait a little and reload.

The save on your phone belongs to this address, so it is separate from saves anywhere else.

## Quick check (after every change, about 5 minutes)

- [ ] The title screen shows the night sky, the stone on the mountain and a Start (or Continue) button with a red A badge.
- [ ] Continue puts you back where you left off, with the same peaches and word count in the header.
- [ ] Holding a direction walks; a quick tap turns on the spot without moving.
- [ ] Talking to the old monkey: the line is spoken, pinyin shows over every word, and tapping a word shows its meaning underneath.
- [ ] Menu opens with the Menu button (or M); B closes it.
- [ ] The Word Scroll shows your words with gold squares; tapping one says it.

## Full playthrough of Flower Fruit Mountain (about 20 minutes)

Do this in a **private or incognito window**, so your real save isn't touched. To start again from scratch there: Menu, Reset progress, Erase everything.

**Start**
- [ ] Press Start. The opening plays: each caption is spoken, Next moves on, the stone cracks and the monkey is born. The last caption has Begin. (Skip intro also works.)
- [ ] How to play has two pages; Got it closes it.
- [ ] A new-word card for 石头 (stone) appears, with the English showing. Then a message says to walk down the path.

**The old monkey**
- [ ] The first step onto the path teaches 路 (path).
- [ ] Walk down the path from the stone. The old monkey stands just to the right of the path, with a ! above him. Face him and press A.
- [ ] He says 你好！ with 你好 in bold green and the English underneath, then a new-word card for 你好, then 去看看！
- [ ] The task asks you to learn 4 words, with a counter.
- [ ] Learn words from things that sparkle: face a cliff (山), a tree (树) or the river (河) and press A; walk into flowers (花) or tall grass (草). The counter goes up.
- [ ] The sign next to the stone shows 花果山 with its name.
- [ ] Talk to the old monkey again: he teaches 动物 (animal). A new task asks you to find the hidden animals (0/4).

**The hungry monkey**
- [ ] The monkey to the right of the old monkey has a !. It says it's hungry and teaches 吃 (eat). A task asks you to find the fruit it wants.
- [ ] Walk to the far left end of the long path. The middle tree has apples. Face it and press A to learn 苹果 (apple) and pick one.
- [ ] Give the apple to the hungry monkey. It says 这是苹果。我要吃桃子！ and gives the apple back.
- [ ] Pick from the tree above or below the apple tree to learn 桃子 (peach). Take it back. The button says Give it.
- [ ] A new-word card for 要 (want) appears. Then build 我 要 吃 桃子 from word tiles (喝 is an extra tile). A wrong order shakes and resets; the right order completes the task with +3 🍑.

**The thirsty monkey**
- [ ] The thirsty monkey (bottom left) teaches 喝 (drink). A task asks you to collect water.
- [ ] Face the pond (middle of the meadow, where the yellow arrow points) and press A to learn 水 (water).
- [ ] Take it back. A new-word card for 我 (I) appears, then the tiles 我 要 喝 水. +3 🍑.
- [ ] With both monkeys helped, the screen shakes and a message says the rocks north of the meadow have rolled away.

**Friends and animals**
- [ ] The little monkey (bottom middle) teaches 猴子 (monkey) the first time, 朋友 (friend) the second, then offers a word game.
- [ ] In the word game, the questions use only words you've learned (pictures and wrong answers too). 2 or more right makes a friend; you get a 🍑 per right answer.
- [ ] Walk around in tall grass. After a few steps an animal jumps out with a ! over your head.
- [ ] The first time you meet each animal, a new-word card teaches its name and the encounter doesn't show the English. Meeting it again shows the Chinese name with an English button.
- [ ] Keep going until you've found all 4 (rabbit, fox, squirrel, goat).
- [ ] Optional words: cross the wooden bridge (bottom right) and face the bird (鸟). After learning 树, the trees on the far right teach 森林 (forest).

**The waterfall**
- [ ] The rocks at the top of the right-hand path have gone. Walk up through the gap to the top right, stand just left of the waterfall, face it and press A.
- [ ] A card teaches 瀑布 (waterfall), then the Story Scroll opens. Read it to me highlights each sentence as it's spoken; English shows the translation.
- [ ] Questions asks 3 picture questions, then shows "First slice complete" with +5 🍑 and a rumble.

**The cave door**
- [ ] The cave door is at the top of the short path on the far left. Stand below it, face up and press A. It teaches 洞 (cave).
- [ ] If anything is left to do, the door lists it. When everything is done, Start the test matches words to pictures in rounds of about 4. You need 80% right first time.
- [ ] Passing shows "Flower Fruit Mountain complete!" and puts you back on the path below the door.

**Menu**
- [ ] Tasks and progress shows the area checklist, all ticked.
- [ ] Word Scroll, Friends and Today's words open, and Back returns to the menu.
- [ ] Music, Sound effects and Pinyin switch on and off. With pinyin off, it's hidden over words in sentences.
- [ ] Title screen, then Continue, puts you back where you were.

## Saved games

- [ ] On your phone, with your real save: Continue works, and your words, peaches, friends and tasks are all as they were.

## Phone checks

- [ ] D-pad: hold to walk, tap to turn, and slide your thumb between directions without lifting.
- [ ] Pressing and holding on text never selects it.
- [ ] On cards, the main button has a red A badge and A presses it; the back button has a blue B badge.
- [ ] The whole console fits on screen in portrait.

## Known issues (not fixed yet)

- On a computer, Space and Enter don't press Start on the title screen or Next in the intro; you have to click. (They work once you're walking around and on cards.)
- Curly apostrophes show a gap, as in "device’ s", because the Chinese font draws them extra wide.
- The story questions at the waterfall break two learning rules: they can show pictures of words you haven't caught yet (🐐 goat, 🐦 bird), and the pictures have no Chinese underneath.
- If meeting the last hidden animal is the final thing you do, the cave door still looks closed until you reload. It works anyway: it sparkles and opens when you press A.
