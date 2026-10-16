# Testing Little Monkey

## Automated tests

Run these in the project folder before every commit:

```
npm test
```

They start the game in a pretend browser (no window opens) and check that it loads without errors and shows the title screen, for a new player and for a saved game. They catch typos, missing files and files loaded in the wrong order.

They also check the content files: every word in a sentence is in the word bank, no word is listed twice, every picture is different, characters stand where you can walk, names have Chinese, pinyin and English, sprites are complete, and so on. If a test fails, its message says what's wrong and where.

One test plays the whole of Flower Fruit Mountain, from a new game to passing the word test at the cave door, pressing the game's own buttons the way a player would (tests/playthrough.test.js). If a change makes the area impossible to finish, it says where it got stuck.

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
- [ ] If words are due for review, the title screen says how many (after "Welcome back"). If your device has no Chinese voice, a red note under it explains how to add one.
- [ ] Continue puts you back where you left off, with the same level, peaches and word count in the header.
- [ ] The header shows your level (Lv 1 to start). The menu shows it with your XP, such as "Level 1 · 40/100 XP". Catching a new word adds 10 XP, a right answer 2 (5 if the word was due), a monkey's task 20, the story 20 and the cave door test 50. Every 100 XP, "Level up!" appears.
- [ ] Holding a direction walks; a quick tap turns on the spot without moving.
- [ ] On a phone held upright, the game screen is taller than it is wide (it shows up to 14 rows of the map instead of 10), and while you play the whole console fits without scrolling. On a computer it shows 10 rows.
- [ ] The task box under the screen shows one task. With more than one, "+2 more" (and so on) opens all your tasks with the area checklist; B comes back to the game. A new task appears first, marked New.
- [ ] Talking to the old monkey: the line appears in a speech box across the bottom of the game screen, and the map slides up so you and the old monkey stay in sight above it. The line is spoken, pinyin shows over every word, and tapping a word shows its meaning at the bottom of the box (without moving on). 🔊 says it again. A, B or the green ▼ moves on; the arrows and Menu do nothing until the talk is over.
- [ ] A line you've seen before hides its English behind an English button. "Tap any word to see what it means" only shows under your first few lines.
- [ ] Menu opens with the Menu button (or M): three big tiles, 词 Word Scroll, 任务 Tasks and 朋友 Friends, each with pinyin and English, then Settings. The first tile has the gold outline and A badge; the D-pad moves between them. B, Close or the Menu button closes it.
- [ ] The Word Scroll has tabs across the top: one per category (Animals, Food, Nature and so on), then Today, then Heard. On a phone they fit in two rows. Tapping a tab (or pressing left or right on the D-pad) switches to it, and the scroll opens at the same tab next time.
- [ ] A category's tab shows its count, such as "Animals 1/8", and a grid of its words, four across on a phone: caught words show their pixel picture, characters, pinyin and gold squares (words without a picture, like 我, show just the characters). Words you've heard but not caught show as a shadow of their picture, marked "heard 2×" and so on; the rest show ？.
- [ ] Tapping a caught word opens its page: its picture, pinyin and sound, its level (Caught, Recognised, Read or Used), where you found it, and an example sentence with the word in bold. English shows the meanings; Back returns to the same tab and place in the scroll.
- [ ] Today shows the words you've caught or practised today, and how many words are due for review within a day. Heard shows words like 有 with how often you've heard them; tapping one says it and shows its meaning.

## Full playthrough of Flower Fruit Mountain (about 20 minutes)

Do this in a **private or incognito window**, so your real save isn't touched. To start again from scratch there: Menu, Settings, Reset progress, Erase everything.

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
- [ ] The thirsty monkey stands near the bottom of the map: when it talks, you both still show above the speech box.
- [ ] Pick from the tree above or below the apple tree to learn 桃子 (peach). Take it back. The button says Give it.
- [ ] A new-word card for 要 (want) appears. Then build 我 要 吃 桃子 from word tiles (喝 is an extra tile). A wrong order shakes and resets; the right order completes the task with +3 🍑.

**The thirsty monkey**
- [ ] The thirsty monkey (bottom left) teaches 喝 (drink). A task asks you to collect water.
- [ ] Face the pond (middle of the meadow, where the yellow arrow points) and press A to learn 水 (water).
- [ ] Take it back. A new-word card for 我 (I) appears, then the tiles 我 要 喝 水. +3 🍑.
- [ ] With both monkeys helped, the screen shakes and a message says the rocks north of the meadow have rolled away.

**Friends and animals**
- [ ] The little monkey (bottom middle) has a ! over it once you've said hello to the old monkey. It teaches 猴子 (monkey) the first time, 朋友 (friend) the second, then offers a word game. The ! goes once it has taught you both words.
- [ ] In the word game, the questions use only words you've learned (pictures and wrong answers too). 2 or more right makes a friend; you get a 🍑 per right answer.
- [ ] Walk around in tall grass. After a few steps an animal jumps out with a ! over your head.
- [ ] The first time you meet each animal, a new-word card teaches its name and the encounter doesn't show the English. Meeting it again shows the Chinese name with an English button.
- [ ] Animals' questions always have pictures to choose from. A new word is asked by sound ("Listen. Which picture is it?"); after two right answers in a row it's asked by its characters ("Read it."). On Flower Fruit Mountain you're never asked to pick characters by sound.
- [ ] Keep going until you've found all 4 (rabbit, fox, squirrel, goat).
- [ ] Optional words: cross the wooden bridge (bottom right) and face the bird (鸟).

**The training ground**
- [ ] A wooden practice post stands on the grass just above the long path, between the short path on the left and the old monkey. Face it: A says Train.
- [ ] Before you have 4 words with pictures, it says to come back later (with a count).
- [ ] After that, it asks if you want to practise and says how many words are due for review. Start matches about 8 words to their pictures in 2 rounds. Stop ends it without changing anything.
- [ ] At the end it says how many you matched right first time, and gives 1 🍑 for each due word you got right first time.
- [ ] When words are due for review, the post has a ! over it.
- [ ] Words you got right first time aren't due again for a day or more, so training again straight away gives no peaches for them (only for words you missed, or due words that didn't fit in the first go).

**The shop**
- [ ] Beside a striped market stall next to the pond stands the 老板 (shop owner), with a ! once you've said hello to the old monkey. Talking says 你好！我是老板。 and teaches 老板 on a new-word card.
- [ ] Talk again: 你要什么？, then the stall shows 头带 · 🍑 10, in Chinese only, with your peaches above. Choosing it teaches 头带 (headband). Not now closes it.
- [ ] With fewer than 10 🍑, it says how many you have and how to earn more. The task box shows "Buy the 头带 (headband) from the 老板 (shop owner)" with your peaches out of 10, and the 老板 shows a ? once you have 10.
- [ ] With 10 🍑: build 我 要 头带 from tiles (吃 is an extra one). Your peaches go down by 10, the 老板 says 谢谢你！, and your monkey wears a red headband on the map from then on (a new monkey starts without one).

**The waterfall**
- [ ] The rocks at the top of the right-hand path have gone. Walk up through the gap to the top right, stand just left of the waterfall, face it and press A.
- [ ] A card teaches 瀑布 (waterfall), then the Story Scroll opens. Read it to me highlights each sentence as it's spoken; English shows the translation.
- [ ] Questions asks up to 3 picture questions, with the Chinese under each picture and only words you've caught (a question is skipped if you haven't caught its answer, such as 鱼 (fish) or 猴子 (monkey)). Then it shows "First slice complete" with +5 🍑 and a rumble.

**The cave door**
- [ ] The cave door is at the top of the short path on the far left. Stand below it, face up and press A. It teaches 洞 (cave).
- [ ] If anything is left to do, the door lists it. When everything is done, Start the test matches words to pictures in rounds of about 4. You need 80% right first time.
- [ ] Passing shows "Flower Fruit Mountain complete!" and puts you back on the path below the door.

**Menu**
- [ ] 任务 Tasks shows the area checklist, all ticked.
- [ ] 词 Word Scroll and 朋友 Friends open, and Back returns to the menu, on the same tile.
- [ ] Settings: Music, Sound effects and Pinyin switch on and off. With pinyin off, it's hidden over words in sentences. Back returns to the menu.
- [ ] Settings, Title screen, then Continue, puts you back where you were.

## Saved games

- [ ] On your phone, with your real save: Continue works, and your words, peaches, friends and tasks are all as they were.
- [ ] After an update that changes the save format: the same, plus Menu, 任务 Tasks shows the same ticks as before.
- [ ] Menu, Settings, Save file, Download saves a file called little-monkey-save- and the date. On a phone it goes to your downloads (Files on an iPhone).
- [ ] In a private or incognito window: Menu, Settings, Save file, Load a save file, and pick that file. It shows how many words and peaches the save has; Load it puts you on the title screen, and Continue carries on from that save.
- [ ] Loading something that isn't a save (any other file) says so and changes nothing.

When the save format changes, the game keeps a copy of your old save in the browser before converting it, so it can be recovered if anything goes wrong.

## Phone checks

- [ ] D-pad: hold to walk, tap to turn, and slide your thumb between directions without lifting.
- [ ] Pressing and holding on text never selects it.
- [ ] On cards, the main button has a red A badge and A presses it; the back button has a blue B badge.
- [ ] The whole console fits on screen in portrait.
- [ ] Word pictures are pixel art, not emoji: on new-word cards, quiz answers, the word test and training, and the Word Scroll (and its shadows). They look sharp, not blurry.

## Known issues (not fixed yet)

None at the moment.
