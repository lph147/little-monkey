# Testing Little Monkey

## Automated tests

Run these in the project folder before every commit:

```
npm test
```

They start the game in a pretend browser (no window opens) and check that it loads without errors and shows the title screen, for a new player and for a saved game. They catch typos, missing files and files loaded in the wrong order.

They also check the content files: every word in a sentence is in the word bank, no word is listed twice, every picture is different, characters stand where you can walk, names have Chinese, pinyin and English, sprites are complete, and so on. If a test fails, its message says what's wrong and where.

One test plays Flower Fruit Mountain from a new game to the end of what's built (chapter 1, part A), pressing the game's own buttons the way a player would (tests/playthrough.test.js). If a change makes the area impossible to finish, it says where it got stuck.

And they try out a few things the game does: the story questions only show words you've caught, chapter 1 begins as soon as the prologue is done, and Space and Enter work as A on the title screen and in the intro.

They can't tell whether the game *feels* right, so the checks below are still needed.

## Playing on this computer

```
npm start
```

Then open http://127.0.0.1:8000 in a browser. Press Ctrl+C in the terminal to stop. In Claude Code, the preview pane's "game" setting does the same.

## The screens gallery

With `npm start` running, open http://127.0.0.1:8000/tools/screens.html. It shows every screen of the game side by side at phone size (the title, the opening, tips, How to play, conversations, replies, word cards, fill the gap, the shop, animals, the menu pages, the story and the cave door), each the real game with its own pretend save. Your saved game isn't touched, and it's silent. Change the size to check a small phone or a computer, and "alone" shows one screen bigger.

After any change you can see, look through it for things that overlap, buttons you'd have to scroll to find, text that's too long, and screens that don't match the others. A red "Error" under a screen means it didn't load. The screens are listed in tools/screens.js; add one when the game gets a new screen.

## Playing on your phone

Open https://lph147.github.io/little-monkey/ on your phone. GitHub Pages updates it a minute or two after each upload to GitHub. Your phone may keep showing the previous version for up to 10 minutes; if a change hasn't appeared, wait a little and reload.

The save on your phone belongs to this address, so it is separate from saves anywhere else.

## Quick check (after every change, about 5 minutes)

- [ ] The title screen shows the night sky, the stone on the mountain and a Start (or Continue) button with a red A badge.
- [ ] If words are due for review, the title screen says how many (after "Welcome back"). If your device has no Chinese voice, a short red note under it says so, and How to fix it opens a card explaining how to add one (A or OK closes it, without starting the game). Before you start, the header shows only 小猴子: no level, shells, word count or Menu.
- [ ] Continue puts you back where you left off, with the same level, shells (a pixel shell) and word count in the header.
- [ ] The header shows your level (Lv 1 to start). The menu shows it with your XP, such as "Level 1 · 40/100 XP". Catching a new word adds 10 XP, a right answer 2 (5 if the word was due), a monkey's task 20, the story 20 and the cave door test 50. Every 100 XP, "Level up!" appears.
- [ ] Holding a direction walks; a quick tap turns on the spot without moving.
- [ ] On a phone held upright, the game screen is taller than it is wide (it shows up to 14 rows of the map instead of 10), and while you play the whole console fits without scrolling. On a computer it shows 10 rows.
- [ ] The task box under the screen shows one task. With more than one, "+2 more" (and so on) opens all your tasks with the area checklist; B comes back to the game. A new task appears first, marked New.
- [ ] Talking to the old monkey: the line appears in a speech box across the bottom of the game screen, and you and the old monkey stay in sight above it (the map only slides up if one of you would be covered). The line is spoken, pinyin shows over every word, and tapping a word shows its meaning at the bottom of the box (without moving on). 🔊 says it again. A, B or the green ▼ moves on; the arrows and Menu do nothing until the talk is over.
- [ ] Your very first reply, after the old monkey's 你好, says "Now you say it" with just 你好 to say. After that (such as after a monkey's 谢谢你), "Your reply" shows 2 or 3 phrases, each with Chinese, pinyin and English. Tapping one (or the arrows and A) makes your monkey, 小猴子 (You), say it. Choosing a phrase that doesn't fit is fine: a note says which fits best. B doesn't choose. A phrase you haven't learned yet is taught on its own card first.
- [ ] At the 老板's stall, the button for not buying anything says 我不要 · no thanks. The first time, a card teaches 我不要; then your monkey says it.
- [ ] Sometimes an animal's last question is a sentence you know with a word missing (such as 我＿吃桃子。). Choosing right counts as a right answer.
- [ ] Menu, Settings, English on replies Off: reply choices show only Chinese and pinyin.
- [ ] The Word Scroll has a Phrases tab (你好, 谢谢, 不客气, 对不起, 没关系, 再见, 我不要). Phrases don't count in the word total in the header. A phrase you've replied with has all four gold squares.
- [ ] A line you've seen before hides its English behind an English button. "Tap any word to see what it means" only shows under your first few lines.
- [ ] Menu opens with the Menu button (or M): four big tiles, two by two: 词 Word Scroll, 任务 Tasks, 朋友 Friends and 衣服 Wardrobe, each with pinyin and English, then Settings. The first tile has the gold outline and A badge; the D-pad moves between them. B, Close or the Menu button closes it.
- [ ] The Word Scroll has tabs across the top: one per category (Animals, Food, Nature and so on), then Today, then Heard. On a phone they fit in two rows. Tapping a tab (or pressing left or right on the D-pad) switches to it, and the scroll opens at the same tab next time.
- [ ] A category's tab shows its count, such as "Animals 1/8", and a grid of its words, four across on a phone: caught words show their pixel picture, characters, pinyin and gold squares (words without a picture, like 我, show just the characters). Words you've heard but not caught show as a shadow of their picture, marked "heard 2×" and so on; the rest show ？.
- [ ] Tapping a caught word opens its page: its picture, pinyin and sound, its level (Caught, Recognised, Read or Used), where you found it, and an example sentence with the word in bold. English shows the meanings; Back returns to the same tab and place in the scroll.
- [ ] Today shows the words you've caught or practised today, and how many words are due for review within a day. Heard shows words like 有 with how often you've heard them; tapping one says it and shows its meaning.

## Full playthrough of Flower Fruit Mountain (about 20 minutes)

Do this in a **private or incognito window**, so your real save isn't touched. To start again from scratch there: Menu, Settings, Reset progress, Erase everything.

**Start**
- [ ] Press Start. The opening plays, told in English in a box over the sky, with Next to move on; the stone cracks and the monkey is born. Four captions also show a word in Chinese, pinyin and English (山 mountain, 石头 stone, 猴子 monkey, 你好 hello), said aloud; tapping it says it again. The stone, mountain and monkey are never hidden by the box. The last caption has Begin. (Skip intro also works. On a computer, Space or Enter presses Start, Next and Begin.)
- [ ] There's no How to play: a new-word card for 石头 (stone) appears straight away, with the English showing. Then a message says the old monkey is waiting by your stone.
- [ ] Tips: a yellow bubble over the D-pad says "Hold an arrow to walk. Tap to turn." and goes once you take a step. Facing the old monkey, one over the A button says "Press A to talk"; facing something new, "Press A to look". In the old monkey's "去看看！" line, one points at a grey word: they're just for listening. Once you know 3 words, one points at the Menu for a few seconds. Each tip shows only once.
- [ ] Menu, Settings, How to play still has its two pages; Next, Back and Got it are always in sight at the bottom of the card, even on a small phone.

**The old monkey**
- [ ] Stepping off the stone onto the path is just walking: no word card (路 waits for chapter 1).
- [ ] The old monkey stands just left of your stone, with a ! above him. Walk two steps left (below him), face up and press A.
- [ ] He says 你好！ with 你好 in bold green and the English underneath, then a new-word card for 你好 that stays quiet (he has just said it; 🔊 Hear it says it), then 去看看！ Cards for words you discover yourself, such as looking at a tree, say the word straight away.
- [ ] The task asks you to learn 4 words, with a counter.
- [ ] Learn words from things that sparkle: face a cliff (山), a tree (树) or the river (河) and press A; walk into flowers (花) or tall grass (草). The counter goes up.
- [ ] The sign next to the stone shows 花果山 with its name, and the note "The name of your home." (nothing about a book).
- [ ] Talk to the old monkey again: he teaches 动物 (animal). A new task asks you to find the hidden animals (0/4).

**The hungry monkey**
- [ ] The monkey to the right of the old monkey has a !. It says 我饿了。我要吃水果！ (I want to eat some fruit: 水果 is grey, just for listening) and teaches 吃 (eat). The task says "Find some fruit for the hungry monkey", with no arrow: finding it is the point.
- [ ] Peach trees grow at the far left end of the long path; the apple tree is in the south-east, across the river. Face one and press A to learn its word (桃子 peach or 苹果 apple) and pick one.
- [ ] Whichever you bring first, he gives it back: 这是桃子。我要吃苹果！ (or 这是苹果。我要吃桃子！). You reply 对不起 and he says 没关系. The task changes to "Find the 苹果 (apple) the hungry monkey wants" (or the 桃子).
- [ ] The thirsty monkey stands near the bottom of the map: when it talks, you both still show above the speech box.
- [ ] Bring the other fruit: 你有苹果吗？ (or 你有桃子吗？). The button says Give it.
- [ ] A new-word card for 要 (want) appears. Then "Fill the gap": 我要吃＿。 with the English underneath, and 3 choices. While the fruit is new they're pictures with the Chinese; once you've recognised it, Chinese and pinyin only. Choosing fills the gap and reads the sentence aloud; a wrong choice shows the right one, and either way the task completes with +3 🐚.

**The big monkey**
- [ ] The big monkey (大猴子) stands in the middle meadow, between the two patches of tall grass on the left, with a ! once you've said hello to the old monkey. It says 我要红花、黄花和白花！ (I want a red flower, a yellow flower and a white flower) and teaches 花 if you don't know it yet.
- [ ] Red flowers grow in the middle of the meadow, yellow ones in the south and white ones on the far left and by the river. Face a patch and press A (it says Pick): the first of each colour teaches its word on a card (红 red, 黄 yellow, 白 white), then "You picked a red 花 (flower) (1/3)". Another patch of a colour you have says you have that colour already. The task box counts up to 3, with no arrow.
- [ ] Take them back (it shows a ?): 你有花吗？, then fill the gap in 我要＿花。 (I want a red flower.), +3 🐚, and reply 不客气 when it says thank you.

**The thirsty monkey**
- [ ] The thirsty monkey (bottom left) teaches 喝 (drink). A task asks you to collect water.
- [ ] Face the pond (middle of the meadow, where the yellow arrow points) and press A to learn 水 (water).
- [ ] Take it back. A new-word card for 我 (I) appears, then fill the gap in 我要喝＿。 (I want to drink water.). +3 🐚.
- [ ] With both monkeys helped, the screen shakes and a message says the rocks north of the meadow have rolled away.

**Friends and animals**
- [ ] The little monkey (in the south meadow, on the path near the bottom right, below the 老板's stall) has a ! over it once you've said hello to the old monkey. It teaches 猴子 (monkey) the first time, 朋友 (friend) the second, then offers a word game. The ! goes once it has taught you both words.
- [ ] In the word game, the questions use only words you've learned (pictures and wrong answers too). A question is never about the animal (or monkey) you're playing with. Each right answer fills a red heart; 2 or more makes a friend, and you get a 🐚 per right answer.
- [ ] Once the old monkey has told you about animals, a patch of tall grass rustles now and then: an animal is hiding there. Step onto it and the animal jumps out with a ! over your head. A few steps after meeting one, another hides.
- [ ] South of the meadow (down the path through the gap in the trees), the squirrel sits up a big tree and the goat stands on the cliffs. Face one: A says Meet.
- [ ] Little birds land on the grass near you now and then and hop about for most of a minute. Walk up and face one: A says Look and shows 鸟 (bird), then it flies off. Stepping right onto one also makes it fly off.
- [ ] Meeting an animal is a scene: your monkey, from behind, facing the animal on the grass (the goat on its grey cliff), with the animal's name plate showing 3 hearts and "Question 1 of 3". The animal's own picture is never one of the answers. A right answer makes the animal hop and fills a heart (+♥). At the end: "⭐ New friend" (or "♥ Friends" if it already was) with your hearts and shells, or, with fewer than 2 right, the animal fades away back to its home. On a small phone the scene is smaller and the answers fit without scrolling.
- [ ] The first time you meet each animal, a new-word card teaches its name and the encounter doesn't show the English. Meeting it again shows the Chinese name with an English button.
- [ ] Animals' questions always have pictures to choose from. A new word is asked by sound ("Listen. Which picture is it?"); after two right answers in a row it's asked by its written form ("Read it."): its characters with pinyin underneath, and pictures to choose from, with nothing written under them. On Flower Fruit Mountain you're never asked to pick characters by sound.
- [ ] Keep going until you've found all 4 (rabbit and fox in the grass, the squirrel and the goat at their homes).
- [ ] Little birds land on the grass near you; until you know 鸟 (bird), one sparkles. Face it and press A to learn 鸟.

**The training ground**
- [ ] A wooden practice post stands just right of the pond, in the middle of the meadow. Face it: A says Train.
- [ ] Before you have 4 words with pictures, it says to come back later (with a count).
- [ ] After that, it asks if you want to practise and says how many words are due for review. Start matches about 8 words to their pictures in 2 rounds. Stop ends it without changing anything.
- [ ] Once you know 我 (I) and 要 (want), the practice ends with a sentence you know with one of them missing, such as 我＿吃桃子。 with its English, and Chinese and pinyin to choose from. There is no listening round where you pick characters by sound.
- [ ] At the end it says how many you matched right first time and whether you built the sentence right first time, and gives 1 🐚 for each due word you got right first time.
- [ ] 瀑布 (waterfall), 老板 (shop owner) and 头带 (headband) have pixel pictures: on their new-word cards, in the Word Scroll, at the practice post and in the cave door test.
- [ ] When words are due for review, the post has a ! over it.
- [ ] Words you got right first time aren't due again for a day or more, so training again straight away gives no shells for them (only for words you missed, or due words that didn't fit in the first go).

**The shop**
- [ ] During a whole conversation (talking to the 老板, the shop, filling the gap, his thanks and your reply), the map stays still behind it: it may slide up once at the start, and slides back only when the conversation is over.
- [ ] In the south meadow (down the path through the trees), beside a striped market stall, stands the 老板 (shop owner), with a ! once you've said hello to the old monkey. Talking says 你好！我是老板。 and teaches 老板 on a new-word card.
- [ ] Talk again: 你要什么？, then the stall shows a card for each thing for sale: its pixel picture, Chinese, pinyin, English and price (the price is red if you can't afford it yet), with your shells above. Choosing the 头带 teaches it (headband). 我不要 · no thanks closes it.
- [ ] With fewer than 10 🐚, it says how many you have and how to earn more. The task box shows "Buy the 头带 (headband) from the 老板 (shop owner)" with your shells out of 10, and the 老板 shows a ? once you have 10.
- [ ] With 10 🐚: fill the gap in 我要＿。 (I want the headband.). Your shells go down by 10, the 老板 says 谢谢你！, and your monkey wears a red headband on the map from then on (a new monkey starts without one).

**The waterfall**
- [ ] The rocks at the top of the right-hand path have gone. Walk up through the gap to the top right, stand just left of the waterfall, face it and press A.
- [ ] A card teaches 瀑布 (waterfall), with its picture, then the Story Scroll opens: 8 short sentences about your first day (石头里有猴子。我是猴子。…), each with a picture beside it and its English underneath. Read it to me highlights each sentence as it's spoken. The next time you read it, the English is behind the English button.
- [ ] Questions asks up to 3 questions: a sentence from the story with a gap (石头里有＿。), and pictures to fill it, with the Chinese under each picture and only words you've caught (a question is skipped if you haven't caught its answer, such as 鱼 (fish) or 猴子 (monkey)). The sentence's English, with the gap, is shown underneath. Answering fills the gap and says the sentence. Then it shows "Your first story" with +5 🐚: "The troop stares at the roaring waterfall. What could be behind it?"

**The wardrobe**
- [ ] Buying the 头带 puts it on. It's the wardrobe's only item for now.
- [ ] Menu, 衣服 Wardrobe shows what you own, with "Wearing" on what's on. Tapping something you're not wearing closes the menu: the first time, a card teaches 戴 (wear); then your monkey says 我戴花 (or 我戴头带) and is wearing it on the map. Tapping something you're wearing takes it off.

**The old monkey**
- [ ] After the old monkey's first 你好 and your reply, the speech box says (in italics) that every baby monkey explores the mountain to find out what things are called, and waits for A before his next line.

**The end of the prologue**
- [ ] There's no cave door on the far left any more (and no word test for now: it comes back as the troop's send-off at the end of Area 1).
- [ ] Menu, Tasks shows "Prologue: The first day" and its checklist; the menu shows "Prologue" with how many are done.
- [ ] As soon as the last thing on the prologue's checklist is done (whatever it is), a card says "Chapter 1: The Water Curtain Cave" with a Begin button.

**Chapter 1, part A: the Water Curtain Cave**
- [ ] The old monkey, the big monkey and the little monkey are by the waterfall, with a ! over the old monkey; the task says "Go to the 瀑布 (waterfall): the troop is gathering". Talk to the old monkey: 瀑布后面有什么？, then the big monkey says 谁跳进去，谁就是王！ (with its name over the speech box), then a card teaches 跳 (jump), the little monkey says 我怕！, and "Everyone looks at you."
- [ ] Task: "Jump through the 瀑布 (waterfall)". Stand just left of the waterfall and face it: A says Jump. Press A: a fade, and you're in the Water Curtain Cave, with its name 水帘洞 Shuǐlián Dòng at the top. A card says 洞 (cave) aloud: "A big, dry cave, hidden behind the water!"
- [ ] The cave has rock walls, stone beds along the top, a stone table, stone bowls, a stone tablet, a stream with an iron bridge, and the water curtain at the bottom. Four things sparkle. Stepping on the bridge teaches 桥 (bridge); facing the beds, the table and the bowls and pressing A teaches 床 (bed), 桌子 (table) and 碗 (bowl). The task counts them: "Look around the 洞 (cave) (2/4)". The tablet says 水帘洞 (Water Curtain Cave).
- [ ] Walk down into the water curtain: you're back beside the waterfall. The task says to tell the old monkey, with the arrow on him (inside the cave, the arrow points to the curtain).
- [ ] Talk to the old monkey: 里面有什么？, then fill the gap in 里面有＿。 (There are beds inside.) with 床, then 太好了！我们去看看！ and "The rest of chapter 1 is coming soon". Menu, Tasks shows those three things ticked on chapter 1's checklist.

**Chapter 1, part B: the troop moves in**
- [ ] Task: "Lead the troop into the 洞 (cave): jump through the 瀑布 (waterfall)". Jump in: a message says the troop follows you, and the old monkey, the big monkey and the little monkey are in the cave.
- [ ] Talk to the old monkey (he has a !): 这是我们的家！ and a card teaches 家 (home).
- [ ] Talk to the big monkey (now he has the !): 你是我们的王！, a card teaches 王 (king), and "The troop names you 美猴王". From then on, your replies show 美猴王 Měi Hóuwáng as your name.
- [ ] Talk to the old monkey three times. Each time a monkey comes in through the water curtain, he counts (一只猴子。, 两只猴子。, 三只猴子。) and a card teaches one number: 一 (one), 二 (two, with a note that you say 两 when counting things) and 三 (three). The task counts 1/3, 2/3, 3/3, and three more monkeys from the meadow are now in the cave.
- [ ] Afterwards the task box says the whole troop is home, and that the rest of chapter 1 is coming soon.

**Menu**
- [ ] 任务 Tasks shows the area checklist, all ticked.
- [ ] 词 Word Scroll and 朋友 Friends open, and Back returns to the menu, on the same tile.
- [ ] Settings: Music, Sound effects and Pinyin switch on and off. With pinyin off, it's hidden over words in sentences. Back returns to the menu.
- [ ] Settings, Title screen, then Continue, puts you back where you were.

## Saved games

- [ ] On your phone, with your real save: Continue works, and your words, shells, friends and tasks are all as they were. (After the update from peaches to shells, you have the same number of shells as you had peaches.)
- [ ] After an update that changes the save format: the same, plus Menu, 任务 Tasks shows the same ticks as before.
- [ ] Menu, Settings, Save file, Download saves a file called little-monkey-save- and the date. On a phone it goes to your downloads (Files on an iPhone).
- [ ] In a private or incognito window: Menu, Settings, Save file, Load a save file, and pick that file. It shows how many words and shells the save has; Load it puts you on the title screen, and Continue carries on from that save.
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
