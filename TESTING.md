# Testing Little Monkey

## Automated tests

Run these in the project folder before every commit:

```
npm test
```

They start the game in a pretend browser (no window opens) and check that it loads without errors and shows the title screen, for a new player and for a saved game. They catch typos, missing files and files loaded in the wrong order.

They also check the content files: every word in a sentence is in the word bank, no word is listed twice, every picture is different, characters stand where you can walk, names have Chinese, pinyin and English, sprites are complete, and so on. If a test fails, its message says what's wrong and where.

And they try out a few things the game does: the story questions only show words you've caught, the cave door opens as soon as everything else is done, and Space and Enter work as A on the title screen and in the intro.

They can't tell whether the game *feels* right, so the checks below are still needed.

## Playing on this computer

```
npm start
```

Then open http://127.0.0.1:8000 in a browser. Press Ctrl+C in the terminal to stop. In Claude Code, the preview pane's "game" setting does the same.
## Playing on your phone

Open https://lph147.github.io/little-monkey/ on your phone. GitHub Pages updates it a minute or two after each upload to GitHub. Your phone may keep showing the previous version for up to 10 minutes; if a change hasn't appeared, wait a little and reload.

The save on your phone belongs to this address, so it is separate from saves anywhere else.

## Quick check (after every change, about 5 minutes)

- [ ] The title screen shows the night sky, the stone on the mountain and a Start (or Continue) button with a red A badge.
- [ ] Continue puts you back where you left off, with the same peaches and word count in the header.
- [ ] Holding a direction walks; a quick tap turns on the spot without moving.
- [ ] Talking to the old monkey: the line is spoken, pinyin shows over every word, and tapping a word shows its meaning underneath.
- [ ] Menu opens with the Menu button (or M); B closes it.
- [ ] The Word Scroll is grouped into categories with counts, such as "Animals 1/8", and shows your words with gold squares. Tapping one opens its page: its picture, pinyin and sound, its level (Caught, Recognised, Read or Used), where you found it, and an example sentence with the word in bold. English shows the meanings; Back returns to the same place in the scroll. Words you've heard in sentences but not caught yet show as a shadow of their picture, marked "heard 2×" and so on. At the end, the Heard list shows words like 有 with how often you've heard them; tapping one says it and shows its meaning.

## Full playthrough of Flower Fruit Mountain (about 20 minutes)

Do this in a **private or incognito window**, so your real save isn't touched. To start again from scratch there: Menu, Reset progress, Erase everything.

**Start**
- [ ] Press Start. The opening plays: each caption is spoken, Next moves on, the stone cracks and the monkey is born. The last caption has Begin. (Skip intro also works. On a computer, Space or Enter presses Start, Next and Begin.)
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
- [ ] Open Menu, Word Scroll: 桃子 isn't caught yet, so it shows as a shadow of a peach marked "heard 1×" (the monkey just said it). It turns into 桃子 once you pick one.
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

**The training ground**
- [ ] A wooden practice post stands on the grass just above the long path, between the short path on the left and the old monkey. Face it: A says Train.
- [ ] Before you have 4 words with pictures, it says to come back later (with a count).
- [ ] After that, it asks if you want to practise and says how many words are due for review. Start matches about 8 words to their pictures in 2 rounds. Stop ends it without changing anything.
- [ ] At the end it says how many you matched right first time, and gives 1 🍑 for each due word you got right first time.
- [ ] Words you got right first time aren't due again for a day or more, so training again straight away gives no peaches for them (only for words you missed, or due words that didn't fit in the first go).

**The waterfall**
- [ ] The rocks at the top of the right-hand path have gone. Walk up through the gap to the top right, stand just left of the waterfall, face it and press A.
- [ ] A card teaches 瀑布 (waterfall), then the Story Scroll opens. Read it to me highlights each sentence as it's spoken; English shows the translation.
- [ ] Questions asks up to 3 picture questions, with the Chinese under each picture and only words you've caught (a question is skipped if you haven't caught its answer, such as 鱼 (fish) or 猴子 (monkey)). Then it shows "First slice complete" with +5 🍑 and a rumble.

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
- [ ] After an update that changes the save format: the same, plus Menu, Tasks and progress shows the same ticks as before.
- [ ] Menu, Save game, Download saves a file called little-monkey-save- and the date. On a phone it goes to your downloads (Files on an iPhone).
- [ ] In a private or incognito window: Menu, Save game, Load a save file, and pick that file. It shows how many words and peaches the save has; Load it puts you on the title screen, and Continue carries on from that save.
- [ ] Loading something that isn't a save (any other file) says so and changes nothing.

When the save format changes, the game keeps a copy of your old save in the browser before converting it, so it can be recovered if anything goes wrong.

## Phone checks

- [ ] D-pad: hold to walk, tap to turn, and slide your thumb between directions without lifting.
- [ ] Pressing and holding on text never selects it.
- [ ] On cards, the main button has a red A badge and A presses it; the back button has a blue B badge.
- [ ] The whole console fits on screen in portrait.

## Known issues (not fixed yet)

None at the moment.
