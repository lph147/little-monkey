# 小猴子 Little Monkey — Game design

Last updated 16 October 2026

Little Monkey is a vocabulary-collecting adventure through *Journey to the West*: you catch Chinese words the way Pokémon players catch creatures, learn grammar from the story's characters, and earn progress by practising.

## Vision

The game's job in its early areas is to build a large, well-remembered vocabulary and a first layer of grammar, wrapped in a story worth following. Reading the Jeff Pepper books is a longer-term benefit, not what the first areas are measured against.

It is not a translation tool, a flashcard app with a skin, or a game where walking around counts as learning. Every system should either put a word in front of you, ask you to recognise it, or ask you to use it.

**Four pillars**

| Pillar | What it means | Where you see it |
| --- | --- | --- |
| Collect | Catch words like creatures and complete a collection | Word Scroll, animals in the grass, new items in each area |
| Speak | Learn grammar from the story's characters, one pattern at a time | Conversations, sentence building, shops |
| Journey | Follow Sun Wukong's story from stone to pilgrim | Areas, quests, cutscenes |
| Grow | Learning pays for progress | XP, peaches and coins, shops, abilities |

## Core loop

Every area runs the same loop: you meet new words in the world, catch them, use them, train them, and the rewards unlock the next part of the journey.

Explore (a new area of the story) → Meet (grass, people, shops) → Catch (a new word card) → Use (quests, shops, sentences) → Train (the rolling word test) → Grow (XP, peaches, abilities) → back to Explore. The review scheduler decides which words come back at each step.

Catching is the heart of it, and the review scheduler feeds old words back into every other step.

## The Word Scroll

The Word Scroll becomes the game's Pokédex: a collection you want to complete, split into categories, where every entry is a word you have met.

**Heard, then caught.** A word you have only heard in conversation shows as a silhouette marked "heard", with a count, until you catch it with its new-word card. Words the area doesn't teach go in a Heard list at the end of the scroll, with their counts, and are caught in the area that teaches them: 有, heard nine times on Flower Fruit Mountain, is caught in the Water Curtain Cave. This turns the grey "just listen" words into a pipeline instead of a dead end.

**Categories:** animals, food, nature, places, items, actions (verbs), and people and phrases. Each shows a completion count, such as "Animals 6/10". A category only appears once there are words in it (Flower Fruit Mountain has no items).

**Phrases** (你好, 谢谢, 再见 and so on) are a collection of their own, on a Phrases page. They don't count towards an area's budget of about 25 words, and they earn their Used mastery when you reply with them (see Grammar through characters).

**Each entry holds:** its pixel sprite, the word with pinyin and sound, an example sentence from the game, where you found it, and a mastery level.

| Mastery | Earned by |
| --- | --- |
| Heard | Hearing it in a sentence |
| Caught | Its new-word card |
| Recognised | Picking it from sound alone, twice in a row |
| Read | Picking it from the characters alone, twice in a row |
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

## Grammar through characters

Each main character introduces one or two sentence patterns, and you practise them with words from your own collection. Learn 我要 once, then use it with every food you've caught.

| Area | Character | Patterns | Example |
| --- | --- | --- | --- |
| 1 Flower Fruit Mountain | 老猴子 Old monkey and the troop | Phrases 你好, 再见, 谢谢, 不客气, 对不起, 没关系, 早上好, 晚安; 我要 / 我不要 + thing | 我要桃子。 |
| 2 Water Curtain Cave | The monkey troop | 这是…, 有 / 没有, numbers with 一只 / 一个 | 洞里有三只猴子。 |
| 3 Across the sea | Villagers and a market seller | Questions with 吗, 什么, 哪里; 不 | 这是什么？ |
| 4 The teacher's mountain | 菩提祖师 Master Subhuti | 会 / 能 (can), 想 (want to), 变成 (turn into) | 我会变成鸟。 |
| 5 Dragon King's palace | 龙王 the Dragon King | 在 + place, 给 (give), 几 / 多少 (how many) | 给我一个。 |
| 6 Heaven | 玉皇大帝 the Jade Emperor | 了 for finished actions, 很 / 太, 比 (comparisons) | 我吃了桃子。 |
| 7 Under the mountain | 唐僧 the monk | 因为…所以…, time words | 因为我很饿，所以我吃桃子。 |
| 8 onward | 猪八戒 the pig, 沙僧 Sandy | Longer sentences and story telling |  |

Patterns are practised by building sentences from word tiles, ordering in shops, and answering characters' questions. Area 1's phrases were checked by a native speaker on 16 October 2026; the rest of this table still needs a check before it goes into the game.

**Replying.** Characters' lines invite a reply: you choose what to say from two or three phrases you've caught, each with pinyin, its sound and its English. In the first areas replies are input, not a test: the English is always shown (players who know some Chinese can turn it off in Settings), any choice is accepted, and the game says which phrase fits best. 你好 starts a conversation and 再见 ends it, 谢谢 and 不客气 follow gifts and help, and 对不起 and 没关系 follow mistakes. Because every conversation has them, the core phrases are heard and used dozens of times a session. The first time a phrase is needed it's taught on its own card. 我不要 is taught in Area 1 as a fixed phrase; 不 on its own is still taught in Area 3.

## Story and areas

Each area is one chapter of Sun Wukong's story, with its own collection of new words, a grammar pattern, a new ability and a test to move on.

| Area | Story | New collections (samples) | New ability |
| --- | --- | --- | --- |
| 1 Flower Fruit Mountain | Born from a stone; a baby's first day, learning the names of its home from the troop | Animals 兔子 狐狸 松鼠 山羊; food 桃子 苹果; nature 山 树 花 河 | Walk, talk |
| 2 Water Curtain Cave | Jumps through the waterfall; becomes king | Home items 床 碗 桌子 门; 王 家; numbers 1–10 | 跳 jump |
| 3 Across the sea | Builds a raft; reaches the human world | Travel 海 船 风; people 人 孩子; clothes 衣服 帽子; 钱 money | 游 swim |
| 4 The teacher's mountain | Learns from Master Subhuti and gets a name | Body 手 脚 眼睛; sky 云 风; actions 飞 爬 | 变成 transform, cloud somersault |
| 5 Dragon King's palace | Finds his staff under the sea | Sea creatures 虾 蟹 乌龟 龙; treasure 金 | Staff |
| 6 Heaven | Looks after the horses and guards the peach garden | Sky 太阳 月亮 星星; 马 horses; more fruit | Fly |
| 7 Under the mountain | Trapped by the Buddha for 500 years; freed by the monk | Time 年 月 天; directions 东 南 西 北 | Joins the pilgrims |
| 8 onward | The journey west with the pig and Sandy | Demons, towns, more food and items | Team members |

The first areas follow the opening of the Jeff Pepper series closely, so by the time you finish them, the start of the books will feel familiar.

**Saved for the Water Curtain Cave:** the story from the book's opening that was at the waterfall, checked by the native speaker: 山上有一个大石头。石头里有一只小猴子。小猴子有很多朋友。猴子吃桃子，喝水。鸟在树上玩。河里有鱼，山上有瀑布。小猴子很快乐！ It needs 一个, 一只, 很 and 大, which come with Area 2 (大, 很, 快乐 and 谁 left the word bank with it). Its questions used 谁 and 什么, so they wait for Area 3's questions, or become gap questions like Flower Fruit Mountain's.

**Flower Fruit Mountain is a baby's first day.** The old monkey, like a grandparent, teaches the newborn the names of everything (这是山。), and each monkey shows the baby something: food, water, play, trading. Firsts (first word, first friend, first 我要) are celebrated in a book of firsts. The day starts with 早上好 and ends with sleep in a nest by the cave (晚安), with a summary of what you learned today and what's due tomorrow. Early on the loud waterfall scares the baby; by the end the troop wonders what's behind it, which leads into Area 2. The story is told through short lines, not long cutscenes.

**Compact, lively places.** Areas stay small so walking doesn't crowd out learning. Flower Fruit Mountain grew a little to the south (decided 16 October 2026), only to make room for its animals' homes, and got livelier: animals at their own spots (the squirrel in a tree, the goat on the cliffs), birds that come and go, and grass that rustles where an animal is hiding. Once the engine can move between maps, it splits into a few small connected places: the meadow, the orchard, the riverbank and the cliffs with the waterfall.

## Progression and economy

XP and money come mainly from learning, so progress in the game and progress in Chinese move together.

**XP and levels.** You earn XP for catching words, answering correctly, completing quests and passing tests. Levels unlock things like extra bag space or new training challenges. Walking around earns nothing on its own. For now a level is just shown in the header; rewards for levels come once there is more to unlock.

**Money.** Peaches are the money on Flower Fruit Mountain and in the Water Curtain Cave. From the human world onward, coins (钱) take over, which teaches the word naturally.

**Shops.** Every area has a shopkeeper who sells that area's items. Labels are in Chinese only, so browsing is reading practice. Buying means building a sentence, such as 我要一个苹果. Items are either useful (food that helps in encounters, tools such as a raft or rope) or cosmetic (decorations for your cave). Prices stay modest so the economy never becomes a grind. Until 一个 is taught in Area 2, buying uses Area 1's pattern: 我要 + thing.

**Flower Fruit Mountain's shop.** A monkey shop owner, 老板 (lǎobǎn), sells a red cloth headband, 头带 (tóudài), for about 10 peaches. Buying it is on the area's checklist, so you need it before the cave door test, and every player can afford it by then. Your monkey wears it from then on. (The golden headband comes much later in the story, from the monk.)

**Wardrobe.** Clothes are a collection on a Wardrobe page (衣服): the items you own, each with its sprite, Chinese and pinyin. Putting one on says the sentence, such as 我戴头带。 or 我穿衣服。, which counts as using the words: 戴 is for things on your head, 穿 for clothes and shoes. The wardrobe starts on Flower Fruit Mountain with the 头带 headband and a flower behind your ear, and opens fully in Area 3, where Sun Wukong takes human clothes to dress like a person (衣服, 帽子, 鞋). Items come from shops, request rewards and levels, so each area's shop has clothes to sell as well as food and cave decorations.

**Training ground.** A place in every area where you can do a rolling word-matching test at any time. It always includes your newest words and anything due for review.

| Word in the test | XP |
| --- | --- |
| Due for review | Full |
| Newly caught | Full |
| Not due and already mastered | Very little |
| Wrong answer | None, and it comes back sooner |

This stops anyone farming easy words for XP, and keeps the reward pointed at what actually needs practice.

**Moving on.** Each area still ends with a word test at its exit, covering that area's words, with an 80% pass mark.

## Encounters and question types

Encounters are the game's battles: you win by answering, and every answer is a chance to meet a word again. Questions only ever use words you've already caught.

| Question | You get | You choose | Trains |
| --- | --- | --- | --- |
| Listen | The word spoken | A picture, with its characters underneath | Sound to meaning |
| Read | The characters | A picture, with its pinyin underneath | Characters to meaning and sound |
| Hear and read | The word spoken | Characters only | Sound to characters |
| Build | A request or a picture scene | Word tiles in order | Grammar |
| Tones (later) | Two similar words spoken | Which one you heard | Tones |

The question type follows the word's mastery level, so new words start easy and get harder as you know them better. A word needs two right answers in a row before its questions get harder, and each area says which kinds it asks: Flower Fruit Mountain asks only Listen and Read, so a beginner always has a picture to go on. Hear and read starts in a later area, for words you can already read. From Area 4, enemies (demons and guards) replace friendly animals in some places and ask harder questions, and abilities like transformations can be used in encounters.

## Screens

Every screen should take as few presses as possible, so time goes on Chinese rather than menus.

- **Talk** appears in a speech box across the bottom of the game screen, with the map still visible above; the view slides up so you and whoever is talking stay in sight. A (or B) moves on. Full cards are kept for new words, quizzes, the shop and the story.
- **The menu** has four big tiles, each with an icon, Chinese and English: 词 Word Scroll, 任务 Tasks, 朋友 Friends, 衣服 Wardrobe. A Settings page holds music, sound effects, pinyin, How to play, export and import, the title screen and reset. The game saves itself, so there's no Save button.
- **The Word Scroll** is a grid of sprites, with shadows for words you haven't caught and category tabs across the top. Today's words is a filter in it.
- **On phones** the game screen uses the full height available, and the task box shows the current task with the rest behind "more".

## Technical approach

The current game is one hand-built map in one file. Adding areas that way would become unmanageable, so the engine is split from the content first.

- **Data-driven areas.** Each area is a block of data: its map, words, characters, lines, quests, shop stock and exit test. The engine reads it, so adding an area is writing content, not new code.
- **A shared word bank.** Every word is defined once, with its pinyin, meaning, category, sprite and the area it belongs to. The scheduler, the Word Scroll, shops and encounters all read from it.
- **Pixel sprites for every collectible.** Emoji look different on every device and clash with the pixel style, so animals, food and items get their own 16 × 16 sprites. This is the biggest cost per area.
- **Saving.** Progress stays in the browser, plus a save export and import, so a cleared browser doesn't lose weeks of play.
- **Audio.** The device's Chinese voice for now. Recorded native audio is a later upgrade, worth it once tones are taught.
- **Format.** A web game that runs in a phone browser, hosted on GitHub Pages and built in Claude Code.

## Risks and open questions

| Risk | What could go wrong | Plan |
| --- | --- | --- |
| Scope | A full RPG is a lot to build | Data-driven areas; finish Area 1 well before adding Area 2 |
| Art | Every collectible needs a sprite | Reuse palettes and shapes; aim for 15–20 new sprites per area |
| Time per session | Walking and menus crowd out learning | Target at least half of play time hearing, reading or answering |
| XP farming | Players repeat easy words for rewards | XP weighted to due words, as above |
| Chinese accuracy | Unnatural lines as grammar gets harder | Native-speaker review of each area's lines |
| Lost progress | A cleared browser wipes the save | Save export and import |

**Decided** (these were the open questions)

- **Words per area:** about 25 new words to collect, like Area 1 (28 once the shop adds 老板 and 头带 and 森林 is dropped), so about 20 new sprites per area. Words you only hear in sentences don't count towards this.
- **Demons:** harder battles start at Area 4, as in the story: Sun Wukong comes home from his teacher and defeats the Demon of Havoc (混世魔王), who has been bullying the monkeys.
- **Pinyin** stays over every word (the menu setting turns it off); it doesn't fade as you learn words.
- **Peaches after the headband:** the 老板 also sells 苹果, bought with 我要苹果; eating one in an animal encounter takes away a wrong answer.
- **Native speaker:** someone can check the game's Chinese, from a review sheet listing every line with pinyin and English.
- **Grammar:** the order in the grammar table stays as it is. Patterns can be heard in sentences in earlier areas before they are taught.

**Decided on 16 October 2026** (from the [second review](https://claude.ai/code/artifact/a02dc745-404f-4605-9b78-00d70691112e))

- **Phrases** are their own collection, outside the budget of about 25 words per area.
- **我不要** is taught in Area 1 as a fixed phrase; 不 on its own waits for Area 3.
- **Talk** moves into a speech box over the map; full cards only for the big moments.
- **The wardrobe** starts in Area 1 with the headband and a flower, and opens fully in Area 3.
- **The map** stays compact and gets livelier now; it splits into small places with the multi-map work. (Later the same day: it grew to the south, 24 × 22 tiles, to give the squirrel and goat their homes.)
- **Day and night:** a day ends with sleep in the cave and a summary.
- **Native speaker check:** 再见, 不客气, 对不起, 没关系, 我不要, 早上好, 晚安, 我戴头带, 我穿衣服 and 这是山 are all fine as written.

**Decided after playtesting stage 2** (16 October 2026): Flower Fruit Mountain must suit someone who speaks no Chinese yet, so they can spend longer there getting to know its words.

- **Questions get harder slowly:** two right answers in a row at each step, and no picking characters by sound (without pictures) on Flower Fruit Mountain.
- **Building a sentence** marks its words as used, but doesn't skip the questions: a word is Used once you can read it too.
- **Every word you practise has a picture,** including 瀑布, 老板 and 头带. 我 and 要 are practised by building 我要 sentences at the practice post.
- **The story at the waterfall** is a short one made of sentences you've already met, each with a picture, and its questions fill a gap with a picture. The longer story from the book's opening moves to the Water Curtain Cave, which teaches 有, 一只 and 一个.

## Next steps

Rebuild Area 1 on the new foundations first, then play it for a week before starting Area 2.

- [x] Agree this design and answer the open questions
- [x] Split the engine from the content and move Area 1 into data
- [x] Turn the Word Scroll into a collection with heard and caught words and categories
- [ ] Add the scheduler to animal appearances, quests and shop stock
- [x] Add XP, peaches as money, an Area 1 shop and the training ground
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
- [x] The first-day story: the old monkey's purpose for the baby, a book of firsts, morning and sleep in the cave with a summary (a nest by the cave door; 早上好 and 晚安 as replies; a new morning when you come back on a new date)
- [ ] Wardrobe: a 衣服 page with the 头带 and a flower (戴), with a new save version
- [x] A livelier Flower Fruit Mountain: animals at their own spots, birds that come and go, grass that rustles where an animal hides (the map grew to the south for them)
- [ ] Playtest Area 1 for a week
- [ ] Let the engine run more than one area, so the cave door leads on, and split Flower Fruit Mountain into small connected places
- [ ] Build Area 2, the Water Curtain Cave
