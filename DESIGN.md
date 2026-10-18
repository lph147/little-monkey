# 小猴子 Little Monkey — Game design

Last updated 18 October 2026

Little Monkey is a vocabulary-collecting adventure through *Journey to the West*: you catch Chinese words the way Pokémon players catch creatures, hear them again and again in simple sentences from the story's characters, and earn progress by practising.

## Vision

The game's job is to build a large, well-remembered vocabulary, with lots of repeated input of simple Chinese sentences, wrapped in a story worth following. It's a relaxed game: it never tests grammar. Sentence patterns are absorbed by hearing and reading them, not taught or tested. Reading the Jeff Pepper books is a longer-term benefit, not what the first areas are measured against.

It is not a translation tool, a flashcard app with a skin, or a game where walking around counts as learning. Every system should either put a word in front of you, ask you to recognise it, or ask you to use it.

**Four pillars**

| Pillar | What it means | Where you see it |
| --- | --- | --- |
| Collect | Catch words like creatures and complete a collection | Word Scroll, animals in the grass, new items in each area |
| Hear | Meet your words again and again in simple sentences, from the story's characters | Conversations, filling gaps in sentences, shops |
| Journey | Follow Sun Wukong's story from stone to pilgrim | Areas, quests, cutscenes |
| Grow | Learning pays for progress | The words you know, friends, shells and coins, shops, abilities |

## Core loop

Every area runs the same loop: you meet new words in the world, catch them, use them, train them, and the rewards unlock the next part of the journey.

Explore (a new area of the story) → Meet (grass, people, shops) → Catch (a new word card) → Use (quests, shops, sentences) → Train (the rolling word test) → Grow (friends, shells, abilities) → back to Explore. The review scheduler decides which words come back at each step.

Catching is the heart of it, and the review scheduler feeds old words back into every other step.

## The game's mechanics (the long-term plan)

Decided on 18 October 2026, so the first area can prepare you for what comes later. Every mechanic is about words, never grammar, and each has a gentle first version on Flower Fruit Mountain.

| Mechanic | Later in the game | First on Flower Fruit Mountain |
| --- | --- | --- |
| Explore with abilities | Like Pokémon's Cut and Surf: each ability is a word you learn and then use to open the map, such as 游 swim (Area 2), and 变成 transform and the cloud somersault (Area 3) | Rocks that roll away, 跳 jump through the waterfall, and chopping trees (砍) to open a way to a new place |
| Befriend, then battle | From Area 3, demons. You and the foe each have hearts. On your turn you choose a question, a friend's power or an item: a right answer hits, a wrong one costs you a heart. Harder kinds of question hit harder, so you choose your risk | Animal encounters, food that helps (the apple), and friend powers: each animal friend can help once in an encounter, such as the fox taking away a wrong answer. A friendly sparring match with the big monkey at the school shows your own hearts for the first time |
| Build | Gather materials and build things for others: the raft that ends Area 1, and something in each area after | The troop's school: gather wood (木头) and stone to build it |
| Learn at school | Lessons review the words that are due; each area's word test is its exam | The school replaces the practice post, with the old monkey as teacher (老师); hide and seek happens there, once you know enough places |
| Grow | No levels: progress is the words you know (see Progression). A bigger collection means a bigger pool for every battle, game and lesson, and words you know better get harder questions | Shells, friends, and the Word Scroll filling up |

**Guided by characters, not prompts** (decided 18 October 2026). Playtesters ignored the task prompts and tips, which stayed flashing for ages. What to do next comes from a character in the speech box, as part of the story: the old monkey is your guide and checks in after each step, and other monkeys mention where things are. The task list stays as a reminder, and its dot doesn't flash.

## The Word Scroll

The Word Scroll becomes the game's Pokédex: a collection you want to complete, split into categories, where every entry is a word you have met.

**Heard, then caught.** A word you have only heard in conversation shows as a silhouette marked "heard", with a count, until you catch it with its new-word card. Words not taught yet go in a Heard list at the end of the scroll, with their counts, and are caught where they're taught: 有, heard nine times in the prologue, is caught in chapter 1, in the Water Curtain Cave. This turns the grey "just listen" words into a pipeline instead of a dead end.

**Categories:** animals, food, nature, places, items, actions (verbs), and people and phrases. Each shows a completion count, such as "Animals 6/10". A category only appears once there are words in it (Flower Fruit Mountain has no items).

**Phrases** (你好, 谢谢, 再见 and so on) are a collection of their own, on a Phrases page. They don't count towards a chapter's budget of about 25 words, and they earn their Used mastery when you reply with them (see Grammar through characters).

**Each entry holds:** its pixel sprite, the word with pinyin and sound, an example sentence from the game, where you found it, and a mastery level.

| Mastery | Earned by |
| --- | --- |
| Heard | Hearing it in a sentence |
| Caught | Its new-word card |
| Recognised | Picking it from sound alone, twice in a row |
| Read | Picking it from its written form (characters with pinyin), twice in a row |
| Used | Using it in a sentence, a shop order or a quest, once you can read it |

**Chinese only, once caught.** After the new-word card, the Chinese name is the only name shown in the world, with English a tap away. That is part of why Pokémon names stick: nobody thinks of them in translation.

**Word building blocks.** Entries show how compound words are built, such as 山羊 = 山 (mountain) + 羊 (sheep or goat), so earlier words make later ones easier to remember.

## Repetition

A spaced-repetition scheduler sits behind everything and decides which words come back, so repetition happens through play rather than drills.

**Target:** every caught word is met at least 8 times in its first week, through at least 3 different channels. These numbers are a starting point to tune by playtesting.

| Channel | How the scheduler uses it |
| --- | --- |
| Animals in the grass | Animals whose names are due appear more often; their questions draw on due words |
| Shops | Due items are stocked and highlighted |
| Quests | Requests ("我要…") ask for words you're due to practise |
| Conversations | Characters' lines reuse caught words from earlier areas |
| Training ground | The rolling word test favours due words |
| Transformations | Turning into a caught animal says and shows its name |

Review gaps follow 1, 3, 7 and 21 days. A wrong answer brings a word back sooner. Words from earlier areas keep appearing in later ones, so nothing is learned once and then dropped.

## Sentences through characters

Each area's characters use one or two simple sentence patterns again and again, with words from your own collection: hear 我要… once, then with every food you've caught. Patterns are never taught as grammar or tested. The table is a guide to which patterns each area's sentences use, so they repeat and grow gradually.

**Sentence tasks fill a gap, never build a sentence.** Wherever a task involves a sentence (asking for something, buying, practising, some animal questions, the story's questions), you're given the whole sentence in Chinese, with pinyin, and in English, with one word missing, and you choose the missing word. The choices follow the word's level: its picture with the Chinese while the word is new, then Chinese and pinyin once you've recognised it. Choosing the word reads the whole sentence aloud. A wrong choice shows the right one and you carry on: it's practice, not a test.

| Area | Character | Patterns | Example |
| --- | --- | --- | --- |
| 1 Flower Fruit Mountain, prologue | 老猴子 Old monkey and the troop | Phrases 你好, 再见, 谢谢, 不客气, 对不起, 没关系; 我要 / 我不要 + thing | 我要桃子。 |
| 1 Flower Fruit Mountain, chapter 1 | The troop, and you as their king | 这是…, 有 / 没有, numbers with 一只 / 一个 | 洞里有三只猴子。 |
| 2 Across the sea | Villagers and a market seller | Questions with 吗, 什么, 哪里; 不 | 这是什么？ |
| 3 The teacher's mountain | 菩提祖师 Master Subhuti | 会 / 能 (can), 想 (want to), 变成 (turn into) | 我会变成鸟。 |
| 4 Dragon King's palace | 龙王 the Dragon King | 在 + place, 给 (give), 几 / 多少 (how many) | 给我一个。 |
| 5 Heaven | 玉皇大帝 the Jade Emperor | 了 for finished actions, 很 / 太, 比 (comparisons) | 我吃了桃子。 |
| 6 Under the mountain | 唐僧 the monk | 因为…所以…, time words | 因为我很饿，所以我吃桃子。 |
| 7 onward | 猪八戒 the pig, 沙僧 Sandy | Longer sentences and story telling |  |

Patterns are met in characters' lines, gap sentences, shops and replies. The prologue's phrases were checked by a native speaker on 16 October 2026; the rest of this table still needs a check before it goes into the game.

**Replying.** Characters' lines invite a reply: you choose what to say from two or three phrases you've caught, each with pinyin, its sound and its English. In the first areas replies are input, not a test: the English is always shown (players who know some Chinese can turn it off in Settings), any choice is accepted, and the game says which phrase fits best. 你好 starts a conversation and 再见 ends it, 谢谢 and 不客气 follow gifts and help, and 对不起 and 没关系 follow mistakes. Because every conversation has them, the core phrases are heard and used dozens of times a session. The first time a phrase is needed it's taught on its own card. 我不要 is taught in Area 1 as a fixed phrase; 不 on its own is still taught in Area 2.

## Story and areas

The game follows Sun Wukong's story in order, and stays true to it. Three words describe its shape:

- An **area** is a part of the world where a stretch of the story happens, such as Flower Fruit Mountain. You leave it when the story does, after a word test.
- A **chapter** is a part of the story within an area. Each brings about 25 new words, new requests and encounters, and reuses the words you already know.
- A **place** is one small map within an area. New places unlock as the story goes on, so you keep coming back to familiar ground with new things to do.

| Area | Story | New collections (samples) | New ability |
| --- | --- | --- | --- |
| 1 Flower Fruit Mountain | The prologue: born from a stone, a baby's first day. Chapter 1: jumps through the waterfall, finds the Water Curtain Cave, becomes king; then leaves on a raft to find an immortal to learn from | Prologue: animals 兔子 狐狸 松鼠 山羊; food 桃子 苹果; nature 山 树 花 河. Chapter 1: home 床 碗 桌子 门 家; 王; numbers 1–10; 海 sea | Walk, talk, then 跳 jump |
| 2 Across the sea | Sails the raft to the human world and dresses like a person | Travel 船 风; people 人 孩子; clothes 衣服 帽子; 钱 money | 游 swim |
| 3 The teacher's mountain | Learns from Master Subhuti and gets his name; then flies home to Flower Fruit Mountain and defeats the demon bullying the troop | Body 手 脚 眼睛; sky 云; actions 飞 爬 | 变成 transform, cloud somersault |
| 4 Dragon King's palace | Finds his staff under the sea | Sea creatures 虾 蟹 乌龟 龙; treasure 金 | Staff |
| 5 Heaven | Looks after the horses and guards the peach garden | Sky 太阳 月亮 星星; 马 horses; more fruit | Fly |
| 6 Under the mountain | Trapped by the Buddha for 500 years; freed by the monk | Time 年 月 天; directions 东 南 西 北 | Joins the pilgrims |
| 7 onward | The journey west with the pig and Sandy | Demons, towns, more food and items | Team members |

The first areas follow the opening of the Jeff Pepper series closely, so by the time you finish them, the start of the books will feel familiar.

**Renumbered on 17 October 2026.** The Water Curtain Cave was going to be Area 2. In the story it's the troop's home on Flower Fruit Mountain, not somewhere Sun Wukong goes, so it became chapter 1 of Area 1, and every later area moved up one. Area numbers everywhere in this document have been updated to match.

### Area 1: Flower Fruit Mountain

**A longer Area 1** (decided 18 October 2026). Playtesters became king in about 5 minutes, which is far too soon, and the headband and the crown came straight after each other. The prologue grows into three parts, and becoming king moves later in chapter 1. A play-time clock in each saved game will show how long each part really takes.

| Part | What happens | Status |
| --- | --- | --- |
| Prologue 1: born, and naming things | Born from the stone; the old monkey explains more (the troop, the mountain, why every baby learns names) and sends you off to find things | Built; more dialogue to come |
| Prologue 2: helping the troop | The hungry, thirsty and big monkeys' finding quests, the animals and the shop; the old monkey introduces the others and checks in after each | Built; more dialogue to come |
| Prologue 3: up the stream | From the book: the monkeys follow the river up to where it starts. When the rocks roll away, a new place opens upstream, with obstacles, one or two new animals and a friend's power used for the first time. At the source is the waterfall, and the story of your first days | To build next |
| Chapter 1 A: the dare and the cave | The dare, the jump, the Water Curtain Cave | Built |
| Chapter 1 B: moving in, then king | The troop moves in and sets up home, with requests using 有 and 没有 (碗里没有水, 床上没有草); you count the rest of the troop in (four to ten); then you become king at the feast. In the book the monkeys scramble for beds and bowls, then he reminds them of their promise and they bow | Partly built (home, king, one to three) |
| Chapter 1 C: a school for the troop | Now they have a home, the troop wants more. You chop trees for wood, which opens a path to a new place, and build a school (学校): the old monkey becomes the teacher (老师), there are books (书), its lessons replace the practice post, and hide and seek comes near the end | To plan |
| The end of Area 1 | The old gibbon, building the raft (building again), the send-off word test as the school's exam, sailing away | To plan |

The school isn't in the book: it fills the gap where the story skips hundreds of years of happy life on the mountain, and sets up what comes next, as the school can't teach him how to live forever, so he goes to find a real teacher (Area 3). The new words (砍 木头 学校 老师 书 有 没有 四 to 十) are drafts for the native speaker's check.

**Prologue: the first day (built).** The baby is born from the stone. The old monkey, like a grandparent, welcomes it and sends it off to explore: you learn the names of things by finding them yourself (anything that sparkles has a word), and the monkeys you meet teach a few more through what they need: food, water, play, trading. The story is told through short lines, not long cutscenes. The waterfall is loud, and a little frightening; by the end of the day the troop wonders what's behind it. The prologue ends with the story of your first day, read at the waterfall.

**Chapter 1: the Water Curtain Cave.** As in the book:

1. The troop gathers at the waterfall, and agrees that whoever can jump through and come back unhurt will be their king.
2. You jump (跳) through the water and find a cave behind it: an iron bridge (桥) and a stone home with stone beds (床), bowls (碗) and tables (桌子). A stone tablet names it 水帘洞 (Water Curtain Cave).
3. You jump back and lead the troop in. The cave becomes their home (家), and they make you king (王): 美猴王 (Měi Hóuwáng · Handsome Monkey King).
4. As the troop moves in, you count them: numbers 1–10, with 只 (三只猴子, three monkeys). The longer story from the book's opening, saved from the waterfall, is read here (see below).

**Life as king** (now chapter 1 B and C, above). New places unlock: the cave itself, a new place past the trees you chop, and the shore. The troop has new requests, the 老板 has new stock (food, and decorations for the cave), and new animals live in the new places. Most of what you hear uses words you already know, so this is where the prologue's words get their repetition, with new words arriving a few at a time.

**Leaving.** At a feast, you grow sad that one day you'll die. An old gibbon tells you about immortals who never die, and you decide to find one and learn from them. The troop helps you build a raft from wood (木头) on the shore. Before you sail, the troop gives you a send-off: you name everything you've learned on the mountain (the area's word test, 80% to pass). Then you sail across the sea (海), and Area 2 begins.

**Words.** The prologue has 30 words (and 7 phrases), with the colours 红 黄 白. Chapter 1 brings about 25 more, such as 跳 洞 路 桥 床 碗 桌子 门 家 王, the numbers 一 to 十, 有, 海 and 木头, and a fruit or two for the shop. The list is a draft; its Chinese, and the names 美猴王 and the old gibbon's, need the native speaker's check.

**路 (path) waits for chapter 1** (decided 17 October 2026): stepping off the stone onto the path taught it straight away, one word too soon. Chapter 1 can teach it on a path to a new place, such as up to the high slopes. Its word bank entry and sprite were removed meanwhile (the tests don't allow unused ones); they're in git history, in the commit before the one that took it out.

**What changes in the prologue.** The cave door on the far left (洞) isn't in the story, so it goes: 洞 is caught at the Water Curtain Cave instead. The word test moves from that door to the send-off on the shore. The waterfall's fright and the troop's wondering aren't in the game yet: the rumble after the waterfall story becomes the troop wondering what's behind the water, which leads into chapter 1.

**Saved for chapter 1:** the story from the book's opening that was at the waterfall, checked by the native speaker: 山上有一个大石头。石头里有一只小猴子。小猴子有很多朋友。猴子吃桃子，喝水。鸟在树上玩。河里有鱼，山上有瀑布。小猴子很快乐！ It needs 一个, 一只, 很 and 大, which come with chapter 1 (大, 很, 快乐 and 谁 left the word bank with it). Its questions used 谁 and 什么, so they wait for Area 2's questions, or become gap questions like the prologue's.

**Compact, lively places.** Places stay small so walking doesn't crowd out learning. Today's map (grown a little to the south on 16 October 2026 to make room for its animals' homes) becomes the first place: the meadow, with animals at their own spots (the squirrel in a tree, the goat on the cliffs), birds that come and go, and grass that rustles where an animal is hiding. Once the engine can move between maps, Flower Fruit Mountain is a few small connected places: the meadow (with the river and the waterfall, as today), the Water Curtain Cave behind the waterfall, the high slopes and the shore.

**Coming home.** In Area 3, Sun Wukong flies home and finds a demon bullying the troop, so Flower Fruit Mountain's places come back then, with your old words and friends.

## Progression and economy

Money comes mainly from learning, so progress in the game and progress in Chinese move together.

**No XP or levels** (decided 18 October 2026). They had no effect on anything. Progress is the words you know: how many you've caught, and how well you know each one (the Word Scroll). That already makes the game grow with you, as a bigger collection is a bigger pool for every battle, game and lesson, and words you know better get harder questions. The menu and your tasks show your shells, words and friends. In battles you always start with the same hearts; help comes from friends and food, and a tougher fight means harder questions, not a bigger number. (XP and levels were added on 16 October 2026 and taken out two days later.)

**Money.** Shells are the money on Flower Fruit Mountain: the troop trades cowrie shells from the shore, as China did before coins (which is why 贝 is inside money words like 买, 卖 and 贵). From the human world (Area 2) onward, coins (钱) take over, which teaches the word naturally. (Peaches were the money at first, but you could pick them from the trees, so they became shells on 17 October 2026. Peaches are just food. 贝壳 isn't a word to catch for now.)

**Shops.** Every area has a shopkeeper who sells that area's items. Each item has a card with its picture, its Chinese with pinyin, its English and its price, so it's always clear what's for sale (decided 16 October 2026, replacing Chinese-only labels). Buying means filling the gap in a sentence, such as 我要＿ (I want an apple), with the word for what you want. Items are either useful (food that helps in encounters, tools such as a raft or rope) or cosmetic (decorations for your cave). Prices stay modest so the economy never becomes a grind. Until 一个 is taught in chapter 1, buying uses the prologue's pattern: 我要 + thing.

**Flower Fruit Mountain's shop.** A monkey shop owner, 老板 (lǎobǎn), sells a red cloth headband, 头带 (tóudài), for about 10 shells. It's something you choose to buy, not something you must do (decided 18 October 2026; it used to be on the prologue's checklist, and becoming king with the crown came straight after it). Your monkey wears it from then on. (The golden headband comes much later in the story, from the monk.)

**Wardrobe.** Clothes are a collection on a Wardrobe page (衣服): the items you own, each with its sprite, Chinese and pinyin. Putting one on says the sentence, such as 我戴头带。 or 我穿衣服。, which counts as using the words: 戴 is for things on your head, 穿 for clothes and shoes. The wardrobe starts on Flower Fruit Mountain with the 头带 headband, and opens fully in Area 2, where Sun Wukong takes human clothes to dress like a person (衣服, 帽子, 鞋). Items come from shops and request rewards, so each area's shop has clothes to sell as well as food and cave decorations.

**Training ground.** A place in every area where you can do a rolling word-matching test at any time. It always includes your newest words and anything due for review.

| Word in the test | Reward |
| --- | --- |
| Due for review (newly caught words are due), right first time | A shell |
| Not due | Nothing |
| Wrong answer | Nothing, and it comes back sooner |

This stops anyone farming easy words, and keeps the reward pointed at what actually needs practice. The troop's school will take over from the training ground on Flower Fruit Mountain (chapter 1 C).

**Moving on.** Each area ends with a word test covering that area's words, with an 80% pass mark, as part of the story: on Flower Fruit Mountain it's the troop's send-off on the shore, before you sail.

## Encounters and question types

Encounters are the game's battles: you win by answering, and every answer is a chance to meet a word again. Questions only ever use words you've already caught. An animal never asks about its own name, which is on the screen, and its picture is never one of the answers, so animals wait until you've caught 4 words with pictures. An encounter is a scene, like a Pokémon battle: your monkey, from behind, facing the animal on the grass (or its cliff), whose name plate has three hearts to fill and says which question this is. A right answer makes it hop and fills a heart; two hearts make a friend, with a new-friend moment at the end.

| Question | You get | You choose | Trains |
| --- | --- | --- | --- |
| Listen | The word spoken | A picture, with its characters underneath | Sound to meaning |
| Read | The characters, with pinyin (never characters alone: decided 17 October 2026, as too hard for beginners) | A picture | Written word to meaning |
| Hear and read | The word spoken | Words in characters with pinyin | Sound to the written word |
| Fill the gap | A sentence in Chinese and English, one word missing | The missing word: a picture with its Chinese while it's new, then Chinese and pinyin | Words in context |
| Tones (later) | Two similar words spoken | Which one you heard | Tones |

The question type follows the word's mastery level, so new words start easy and get harder as you know them better. A word needs two right answers in a row before its questions get harder, and each area says which kinds it asks: Flower Fruit Mountain asks only Listen and Read, so a beginner always has a picture to go on. Hear and read starts in a later area, for words you can already read. From Area 3, enemies (demons and guards) replace friendly animals in some places and ask harder questions, and abilities like transformations can be used in encounters. Battles are planned in The game's mechanics, above: hearts on both sides, and on each turn a question, a friend's power or an item.

## Screens

Every screen should take as few presses as possible, so time goes on Chinese rather than menus.

- **The opening** is told in English, so a beginner can follow the story before learning any Chinese. Four captions each show one word you'll meet on the mountain (山, 石头, 猴子 and 你好), in Chinese, pinyin and English, said aloud; tap it to hear it again. The words aren't caught yet: that happens on the mountain. The caption sits over the sky at the top of the picture, so the page keeps its size.
- **Tips, not instructions** (decided 17 October 2026). A new game starts straight away, with no page of How to play. Instead a bubble points at a control the first time you need it: the D-pad (walking), A (talking, then looking), a grey word in a sentence (just for listening), Select once you have a task, and Start once you have a few words. Each shows once. How to play stays in Settings. Hints are one line.

- **Talk** appears in a speech box across the bottom of the game screen, with the map still visible above; the view slides up so you and whoever is talking stay in sight. A (or B) moves on. Full cards are kept for new words, quizzes, the shop and the story. A line of story in a conversation (such as the old monkey sending you off to explore) waits in the speech box too, so the next line can't cover it. A card's buttons always stay in sight at its bottom, however long the card.
- **Bigger objects, with today's graphics** (decided 17 October 2026, from mockups that also tried richer tiles and new characters): trees, the fruit trees, your stone, the rocks and the stall are drawn bigger than their squares, in today's colours (the practice post went back to its one-square look, which looked better). A block of forest two squares by two is one big round tree, other trees are taller, and the stall is three squares wide. What reaches up above an object's squares (leaves, the awning) is drawn over the characters, so you can walk behind things. Walking through a peach or apple tree's wide branches (the squares right beside it), it rustles once, gently, dropping a couple of leaves; walking behind trees, it doesn't. The ground, water, mountain and characters keep today's look.
- **Your tasks only list what you've found** (decided 17 October 2026): the chapter's checklist shows a quest once you've met it (the big monkey's flowers once he has asked), or once it's done, then "More to find as you play" while some are still hidden. Finding things is part of the fun, so the list never gives them away.
- **Start and Select** (decided 17 October 2026), like a Game Boy, under the D-pad: Start opens the menu and Select your tasks, both with your shells, words and friends at the top. They replace the header (title, stats and a Menu button) and the task box under the screen, so the screen can be taller. A new task is announced with a message, and a red dot stays on Select until you've looked. The title screen's words and the opening's buttons are in the picture. They are labelled TASKS and MENU (decided 18 October 2026), so it is clear what they do.
- **The menu** has five big tiles, each with an icon, Chinese and English: 词 Word Scroll, 任务 Tasks, 朋友 Friends, 衣服 Wardrobe and 保存 Save. A Settings page holds music, sound effects, pinyin, English on replies, How to play, the opening and the title screen. The game saves itself; Save says so ("Saved: Game 1, just now"), because players expect a Save button.
- **Three games (save slots)** (decided 18 October 2026), like a Game Boy game, so two people can share a phone. The title screen shows them side by side, each with its words, chapter and when it was last played, or empty. Choosing one opens its card: Continue, Copy to a file, or Delete (asked once more, with Keep it as the main button, and a copy kept in the browser); an empty one has New game or Load from a file. Each game keeps its own settings, and a new game starts with the sound and reading settings you're using. Your game from before is Game 1, unchanged. Saving, loading and starting again moved here from Settings.
- **The Word Scroll** is a grid of sprites, with shadows for words you haven't caught and category tabs across the top. Today's words is a filter in it.
- **Played sideways, like a Game Boy Advance** (decided 17 October 2026). There's one layout: the screen in the middle, always 15 columns by 10 rows (the GBA's shape, 3:2), as big as fits; the D-pad, Select and Start on the left with a power light; A and B on the right with a speaker. A tall screen on an upright phone looked strange, so held upright a card asks you to turn the phone, and the game waits (if the phone's rotation lock is on, it has to be switched off). Every place must be at least 15 by 10 (a test checks). Cards sit over the screen, so they only have its height: they use its width instead (pictures beside words, answers in a row), and text and pictures follow the screen's height (13 to 18px text), so the same layouts fit an iPhone, an Android phone and a computer. It can be installed as an app (manifest.webmanifest, sw.js) to get the whole screen: on Android it opens full screen and stays sideways; on an iPhone it opens without Safari's bars, but the phone must still be turned.

## Technical approach

The current game is one hand-built map in one file. Adding areas that way would become unmanageable, so the engine is split from the content first.

- **Data-driven areas.** Each area is a block of data: its map, words, characters, lines, quests, shop stock and exit test. The engine reads it, so adding an area is writing content, not new code.
- **A shared word bank.** Every word is defined once, with its pinyin, meaning, category, sprite and the area it belongs to. The scheduler, the Word Scroll, shops and encounters all read from it.
- **Pixel pictures for every collectible.** Emoji look different on every device and clash with the pixel style, so animals, food and items get their own pixel pictures. They're 32 × 32 (decided 17 October 2026: at 16 × 16 they looked too rough on cards, and 你好 (hello) was hard to read), drawn from shapes in tools/draw-pictures.js, which shades and outlines them, so a new one is quick to make. They're shown at sizes that give each pixel a whole number of the screen's real pixels, so they stay sharp. The animals walking on the map stay 16 × 16, a square's size. This is the biggest cost per area.
- **Saving.** Progress stays in the browser, plus a save export and import, so a cleared browser doesn't lose weeks of play.
- **Audio.** The device's Chinese voice for now. Recorded native audio is a later upgrade, worth it once tones are taught.
- **Format.** A web game that runs in a phone browser, hosted on GitHub Pages and built in Claude Code.

## Risks and open questions

| Risk | What could go wrong | Plan |
| --- | --- | --- |
| Scope | A full RPG is a lot to build | Data-driven areas, built a chapter at a time; finish Area 1 well before adding Area 2 |
| A long first area | Area 1 has two chapters, about 50 words | Chapter 1 mostly reuses the prologue's words, and new places keep it fresh; playtest the prologue first |
| Art | Every collectible needs a sprite | Reuse palettes and shapes; aim for 15–20 new sprites per area |
| Time per session | Walking and menus crowd out learning | Target at least half of play time hearing, reading or answering |
| Reward farming | Players repeat easy words for rewards | Shells only for words due for review, as above |
| Chinese accuracy | Unnatural lines as grammar gets harder | Native-speaker review of each area's lines |
| Lost progress | A cleared browser wipes the save | Save export and import |

**Decided** (these were the open questions)

- **Words per chapter:** about 25 new words to collect, like the prologue (27: 28 once the shop added 老板 and 头带 and 森林 was dropped, then 路 moved to chapter 1), so about 20 new sprites per chapter. (Area 1 has two chapters, decided 17 October 2026.) Words you only hear in sentences don't count towards this.
- **Demons:** harder battles start at Area 3, as in the story: Sun Wukong comes home from his teacher and defeats the Demon of Havoc (混世魔王), who has been bullying the monkeys.
- **Pinyin** stays over every word (the menu setting turns it off); it doesn't fade as you learn words.
- **After the headband:** the 老板 also sells 苹果, bought with 我要苹果; eating one in an animal encounter takes away a wrong answer.
- **Native speaker:** someone can check the game's Chinese, from a review sheet listing every line with pinyin and English.
- **Grammar:** the order in the table of sentence patterns stays as it is. Patterns can be heard in earlier areas before an area uses them a lot.

**Decided on 16 October 2026** (from the [second review](https://claude.ai/code/artifact/a02dc745-404f-4605-9b78-00d70691112e))

- **Phrases** are their own collection, outside the budget of about 25 words per area.
- **我不要** is taught in Area 1 as a fixed phrase; 不 on its own waits for Area 2.
- **Talk** moves into a speech box over the map; full cards only for the big moments.
- **The wardrobe** starts in Area 1 with the headband, and opens fully in Area 2. (A flower behind your ear was tried and taken out.)
- **The map** stays compact and gets livelier now; it splits into small places with the multi-map work. (Later the same day: it grew to the south, 24 × 22 tiles, to give the squirrel and goat their homes, and the 老板's market stall and the little monkey moved down there so the top isn't crowded.)
- **Day and night:** a day ends with sleep in the cave and a summary. (Tried, then taken out on 16 October 2026: see below.)
- **Native speaker check:** 再见, 不客气, 对不起, 没关系, 我不要, 早上好, 晚安, 我戴头带, 我穿衣服 and 这是山 are all fine as written.

**Decided on 16 October 2026: no days or sleeping.** A nest, a day count, an end-of-day summary and good night and good morning scenes were built and then taken out: people play at any time and for any length, so a day rhythm gave no real reason to sleep. Reviews still follow real time (1, 3, 7 and 21 days), whenever you next play. 早上好 and 晚安 left the phrases with it; they're checked, and can come back if a good place for them turns up. The book of firsts was taken out too. The repetition target above (8 times in a word's first week) assumed daily play and needs rethinking with the scheduler.

**Decided on 16 October 2026: a vocabulary game, never a grammar test.** Sentence tasks always give the whole sentence in Chinese and English with one word missing, and you choose the word; word tiles in order are gone. The choices follow the word's level (pictures while new, then Chinese and pinyin). This makes the game more relaxed while still giving lots of repeated input of simple sentence structures.

**Decided after playtesting stage 2** (16 October 2026): Flower Fruit Mountain must suit someone who speaks no Chinese yet, so they can spend longer there getting to know its words.

- **No emoji** (decided 18 October 2026): every icon is pixel art like the rest of the game (a star, a scroll, a clipboard, a paw, a shirt, a cog, a floppy disk, a book, a cup, mountains, the shell, the speaker and the heart), drawn in tools/draw-pictures.js at 16 × 16. The text still says them as emoji, and the game shows the pixel icon instead.
- **The question layout** (decided 18 October 2026): a question starts at the top, with the speaker beside "Listen. Which picture is it?", and a bottom row whose space is always kept: what happened ("Yes! 山 shān") on the left and Next on the right, so nothing moves when you answer. When listening, the answers show their characters, and their pinyin once you've answered. Food from the shop is a small hint in that bottom row ("Eat a 苹果 (apple): one wrong answer goes"), in plain text, not a big button. The pixel font is kept for short English labels and buttons; Chinese and sentences are never in it.
- **Questions get harder slowly:** two right answers in a row at each step, and no picking characters by sound (without pictures) on Flower Fruit Mountain.
- **Building a sentence** marks its words as used, but doesn't skip the questions: a word is Used once you can read it too.
- **Every word you practise has a picture,** including 瀑布, 老板 and 头带. 我 and 要 are practised by building 我要 sentences at the practice post.
- **The story at the waterfall** is a short one made of sentences you've already met, each with a picture, and its questions fill a gap with a picture. The longer story from the book's opening moves to the Water Curtain Cave, which teaches 有, 一只 and 一个.

## Next steps

Build Area 1 a chapter at a time: play the prologue for a week, then build chapter 1, then Area 2.

- [x] Agree this design and answer the open questions
- [x] Split the engine from the content and move Area 1 into data
- [x] Turn the Word Scroll into a collection with heard and caught words and categories
- [ ] Add the scheduler to animal appearances, quests and shop stock
- [x] Add XP, peaches (now shells) as money, an Area 1 shop and the training ground
- [x] Replace emoji with pixel sprites for Area 1's collectibles
- [x] Add save export and import
- [x] Improve Area 1, from the review on 2026-10-16:
  - [x] Say so on the title screen if the device has no Chinese voice, and how to add one
  - [x] Show how many words are due, on the title screen and as a ! on the practice post
  - [x] A Chinese review sheet for the native speaker: every line, with pinyin and English (CHINESE.md)
  - [x] Example sentences for the 7 words met in no sentence (路 花 兔子 狐狸 松鼠 山羊 洞), checked first
  - [x] Practise words without pictures (我 要 瀑布 老板 头带) by listening: hear it, pick its characters
  - [x] The 老板 sells 苹果 (我要苹果); eating one in an encounter takes away a wrong answer
  - [x] A test that plays Area 1 from start to finish
  - [x] Remove 和 from the word bank (no sentence uses it)
- [x] Lighter talk and menus:
  - [x] Talk in a speech box over the map
  - [x] The Word Scroll as a grid of sprites, with category tabs and a Today tab
  - [x] A menu of big tiles, and a Settings page (three tiles until the wardrobe adds 衣服)
  - [x] A bigger game screen on phones (up to 14 rows of the map), and a task box showing the current task with "more"
- [x] Gentler pacing for beginners (decided after playtesting stage 2):
  - [x] Questions get harder after two right answers in a row; no characters-only questions on Flower Fruit Mountain
  - [x] Pictures for 瀑布, 老板 and 头带; 我 and 要 practised by building 我要 sentences at the practice post
  - [x] A short story at the waterfall from sentences you've met, with gap-filling picture questions
- [x] Reply in Chinese: reply moments with Area 1's phrases, a Phrases page, more 我要 and 我不要 building, and Build questions in encounters
  - [x] Reply choices in the speech box (你好, 谢谢, 不客气, 对不起 and 没关系, 再见), with Chinese, pinyin and English
  - [x] Settings, English on replies (on to start with)
  - [x] Phrases as their own collection, with a Phrases tab in the Word Scroll
  - [x] 我不要 at the shop, and sentence-building questions in animal encounters
- [x] The first-day story: the old monkey welcomes the baby and sends it off to explore (a nest, days, good night and good morning, and a book of firsts were tried and taken out)
- [x] 大猴子 Big monkey, in the middle meadow, wants 3 flowers and pays you shells: you pick one from each of 3 patches (no mother: Sun Wukong is born from the stone)
- [x] Wardrobe: a 衣服 page with the 头带 (戴), with a new save version (a flower from the little monkey was tried and taken out)
- [x] A livelier Flower Fruit Mountain: animals at their own spots, birds that come and go, grass that rustles where an animal hides (the map grew to the south for them)
- [x] A quality review (17 October 2026): a screens gallery (tools/screens.html) and fixes for what a fresh playthrough found: the old monkey's welcome was hidden, an animal could ask about its own name, friendship showed as shells, a one-choice first reply, How to play's hidden buttons, a busy title screen and a long voice warning
  - [x] Mockups of the three bigger changes, all agreed (17 October 2026)
  - [x] Never characters alone in a question: Read questions show pinyin, with pictures as the answers
  - [x] Tips instead of How to play, and one-line hints
  - [x] A gentler opening: English tells the story, in a box over the sky, and some captions show one word you'll meet (山, 石头, 猴子, 你好), said aloud
  - [x] Animals as a scene, with hearts to fill and a new-friend moment
- [x] The prologue's requests made into finding things (17 October 2026): the hungry monkey wants fruit (水果, heard only) and, whichever you bring first, wants the other, with the peaches on the far left and the apple tree in the south-east; the big monkey wants a red, a yellow and a white flower, which grow in different parts of the meadow, and the first of each colour teaches its word (红 黄 白). No arrows for finding them. "He doesn't like it" is said as 这是苹果。我要吃桃子！, keeping 不 for Area 2. Save version 20
- [x] Start and Select instead of the header and task box (17 October 2026; save version 21)
- [x] Played sideways, like a Game Boy Advance (decided 17 October 2026):
  - [x] The console: the screen 15 × 10 in the middle, the controls either side, a power light and a speaker; held upright, a card asks you to turn the phone
  - [x] Layouts for the wide, short screen (17 October 2026), from mockups at Android and iPhone sizes: text and pictures follow the screen's height; a shorter speech box; word cards with the picture on the left; fill the gap with the answers in one row; animals with their scene down the left; matching with words across the top and pictures underneath; the menu's tiles in a row; Settings and Tasks in two columns; the title and the opening with the mountain on the right and the words on the left
- [x] An app: added to a phone's home screen, the game opens full screen and sideways, with the monkey as its icon, and plays offline (17 October 2026). The service worker always loads the newest version when there's a connection. On an iPhone the home-screen app has its own save, moved across with the save file
- [x] Bigger objects (17 October 2026): big trees, fruit trees, stone, rocks and post, walking behind them, and the stall three squares wide
- [x] The cave's things redrawn (18 October 2026): straw beds with a leaf blanket and a pillow, a table with fruit on two legs, bigger bowls and a carved tablet, which now stands just inside the entrance. A mockup of Emerald-style cliffs and new cave walls was tried and not kept
- [x] Three games (save slots) on the title screen, and a Save tile in the menu (18 October 2026)
- [x] Pixel icons instead of emoji everywhere (18 October 2026)
- [x] The question layout (18 October 2026): no gap at the top and no jump when Next appears; bigger answers, with their pinyin once you've answered; the apple as a small hint; a compact version for the smallest phones
- [x] Console and map touches (18 October 2026): Select and Start labelled TASKS and MENU; A higher than B, like a GBA; the pond bigger, with four fish jumping in turn; the practice post back to one square; a pixel speaker instead of 🔊
- [x] Sharper word pictures (17 October 2026): every word's picture redrawn at 32 × 32, on word cards, questions, the scrolls, the shop, animal encounters and the Friends list; the animals on the map unchanged
- [ ] Playtest the prologue for a week
- [x] A vocabulary game, never a grammar test (decided 16 October 2026):
  - [x] Record the decision here and in CLAUDE.md
  - [x] One fill-the-gap question: the sentence in Chinese and English, choices following the word's level
  - [x] Replace word tiles everywhere: requests, the shop, the practice post and animals' questions
  - [x] The story's questions show their English all the time
- [x] Plan Area 1 as the prologue and chapter 1, true to the story: the cave behind the waterfall is home, and you leave on a raft (decided 17 October 2026)
- [x] Places: the engine moves between small connected maps within an area (a fade, and the place's name for a moment; ways can stay shut until the story opens them; task arrows point the way); today's map is the meadow, unchanged, with a new save version
- [x] Chapter 1's script, agreed on 17 October 2026 (you come back out and tell the troop before they follow; numbers 1–3 as they move in, 4–10 in later requests; 门 waits). Its Chinese is on the native speaker's sheet, CHINESE.md, under "Chapter 1, not built yet"
- [x] Chapters: the prologue, then chapter 1, each with its own checklist and a title card; events checked after anything you do; the cave door and its word test taken out (the test returns as the send-off) (17 October 2026)
- [x] Chapter 1, part A: the troop's dare at the waterfall, the jump (跳), the Water Curtain Cave as a new place (洞 桥 床 碗 桌子), coming back out and telling the old monkey (里面有床), with the draft Chinese until it's checked (17 October 2026)
- [x] Chapter 1, part B: the troop moves in, you become king (家 王; your name becomes 美猴王), and three more of the troop are counted in (一 二 三, with 两 explained on the card for 二), with the draft Chinese until it's checked (17 October 2026)
- [ ] Chapter 1: the story from the book's opening, read in the cave (checked already; it needs 一个, 一只, 很, 大 and 快乐 back in the word bank)
- [x] Record the long-term mechanics and a longer Area 1 (18 October 2026)
- [x] Take out XP and levels (save version 22, 18 October 2026)
- [ ] Prologue: more dialogue from the old monkey and the troop, guiding you instead of prompts; the headband no longer required
- [ ] Prologue 3: up the stream, a new place upstream with the waterfall at its source
- [ ] A play-time clock in each saved game, to see how long each part takes
- [ ] Chapter 1 B: setting up home (有, 没有), counting the troop in (four to ten), then king at the feast
- [ ] Chapter 1 C: chopping trees for wood, a new place, building the school, lessons and hide and seek
- [ ] Friend powers in encounters
- [ ] The end of Area 1: the old gibbon, building the raft, the troop's send-off word test, sailing away
- [ ] Let the engine run more than one area, so sailing away leads into Area 2
- [ ] Build Area 2, Across the sea
