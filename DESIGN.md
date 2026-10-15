# 小猴子 Little Monkey — Game design

Last updated 15 October 2026

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

**Heard, then caught.** A word you have only heard in conversation shows as a silhouette marked "heard", with a count. Once you've heard it a few times, or a character teaches it, you can catch it with a new-word card. This turns the grey "just listen" words into a pipeline instead of a dead end.

**Categories:** animals, food, items, places, actions (verbs) and phrases. Each shows a completion count, such as "Animals 6/10".

**Each entry holds:** its pixel sprite, the word with pinyin and sound, an example sentence from the game, where you found it, and a mastery level.

| Mastery | Earned by |
| --- | --- |
| Heard | Hearing it in a sentence |
| Caught | Its new-word card |
| Recognised | Picking it from sound alone |
| Read | Picking it from the characters alone |
| Used | Using it in a sentence, a shop order or a quest |

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
| 1 Flower Fruit Mountain | 老猴子 Old monkey and the troop | 你好, 谢谢, 我要 + thing | 我要桃子。 |
| 2 Water Curtain Cave | The monkey troop | 这是…, 有 / 没有, numbers with 一只 / 一个 | 洞里有三只猴子。 |
| 3 Across the sea | Villagers and a market seller | Questions with 吗, 什么, 哪里; 不 | 这是什么？ |
| 4 The teacher's mountain | 菩提祖师 Master Subhuti | 会 / 能 (can), 想 (want to), 变成 (turn into) | 我会变成鸟。 |
| 5 Dragon King's palace | 龙王 the Dragon King | 在 + place, 给 (give), 几 / 多少 (how many) | 给我一个。 |
| 6 Heaven | 玉皇大帝 the Jade Emperor | 了 for finished actions, 很 / 太, 比 (comparisons) | 我吃了桃子。 |
| 7 Under the mountain | 唐僧 the monk | 因为…所以…, time words | 因为我很饿，所以我吃桃子。 |
| 8 onward | 猪八戒 the pig, 沙僧 Sandy | Longer sentences and story telling |  |

Patterns are practised by building sentences from word tiles, ordering in shops, and answering characters' questions. The Chinese in this table needs a native speaker's check before it goes into the game.

## Story and areas

Each area is one chapter of Sun Wukong's story, with its own collection of new words, a grammar pattern, a new ability and a test to move on.

| Area | Story | New collections (samples) | New ability |
| --- | --- | --- | --- |
| 1 Flower Fruit Mountain | Born from a stone; meets the troop | Animals 兔子 狐狸 松鼠 山羊; food 桃子 苹果; nature 山 树 花 河 | Walk, talk |
| 2 Water Curtain Cave | Jumps through the waterfall; becomes king | Home items 床 碗 桌子 门; 王 家; numbers 1–10 | 跳 jump |
| 3 Across the sea | Builds a raft; reaches the human world | Travel 海 船 风; people 人 孩子; clothes 衣服 帽子; 钱 money | 游 swim |
| 4 The teacher's mountain | Learns from Master Subhuti and gets a name | Body 手 脚 眼睛; sky 云 风; actions 飞 爬 | 变成 transform, cloud somersault |
| 5 Dragon King's palace | Finds his staff under the sea | Sea creatures 虾 蟹 乌龟 龙; treasure 金 | Staff |
| 6 Heaven | Looks after the horses and guards the peach garden | Sky 太阳 月亮 星星; 马 horses; more fruit | Fly |
| 7 Under the mountain | Trapped by the Buddha for 500 years; freed by the monk | Time 年 月 天; directions 东 南 西 北 | Joins the pilgrims |
| 8 onward | The journey west with the pig and Sandy | Demons, towns, more food and items | Team members |

The first areas follow the opening of the Jeff Pepper series closely, so by the time you finish them, the start of the books will feel familiar.

## Progression and economy

XP and money come mainly from learning, so progress in the game and progress in Chinese move together.

**XP and levels.** You earn XP for catching words, answering correctly, completing quests and passing tests. Levels unlock things like extra bag space or new training challenges. Walking around earns nothing on its own.

**Money.** Peaches are the money on Flower Fruit Mountain and in the Water Curtain Cave. From the human world onward, coins (钱) take over, which teaches the word naturally.

**Shops.** Every area has a shopkeeper who sells that area's items. Labels are in Chinese only, so browsing is reading practice. Buying means building a sentence, such as 我要一个苹果. Items are either useful (food that helps in encounters, tools such as a raft or rope) or cosmetic (decorations for your cave). Prices stay modest so the economy never becomes a grind.

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

The question type follows the word's mastery level, so new words start easy and get harder as you know them better. From Area 4, enemies (demons and guards) replace friendly animals in some places and ask harder questions, and abilities like transformations can be used in encounters.

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

- **Words per area:** about 25 new words to collect, like Area 1 (27), so about 20 new sprites per area. Words you only hear in sentences don't count towards this.
- **Demons:** harder battles start at Area 4, as in the story: Sun Wukong comes home from his teacher and defeats the Demon of Havoc (混世魔王), who has been bullying the monkeys.
- **Grammar:** the order in the grammar table stays as it is. Patterns can be heard in sentences in earlier areas before they are taught.

## Next steps

Rebuild Area 1 on the new foundations first, then play it for a week before starting Area 2.

- [x] Agree this design and answer the open questions
- [x] Split the engine from the content and move Area 1 into data
- [ ] Turn the Word Scroll into a collection with heard and caught words and categories
- [ ] Add the scheduler to animal appearances, quests and shop stock
- [ ] Add XP, peaches as money, an Area 1 shop and the training ground
- [ ] Replace emoji with pixel sprites for Area 1's collectibles
- [ ] Add save export and import
- [ ] Playtest Area 1 for a week, then build Area 2, the Water Curtain Cave
