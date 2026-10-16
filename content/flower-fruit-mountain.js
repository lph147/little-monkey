// Area 1: 花果山 Flower Fruit Mountain.
// The little monkey is born from a stone and meets the monkey troop.
//
// This file is only data: the engine in js/ reads it. Chinese sentences are written with a space
// between words, like '我 饿 了 。', because each word is coloured and can be tapped on its own.
// Every word must be in the word bank (content/words.js); the tests check.
const FLOWER_FRUIT_MOUNTAIN = {
  number: 1,
  name: {zh:'花果山', py:'Huāguǒ Shān', en:'Flower Fruit Mountain'},

  // Where you start the first time you play, and which way you face. x is the column and y the
  // row, counting from 0 at the top left of the map.
  start: {x:9, y:2, facing:'up'},

  // What happens the very first time you play, after How to play (steps, as in talk below).
  begin: [
    {card:'石头', note:'You were just born from this stone!'},
    {message:'The old monkey is standing by your stone. Face him and press A to say hello.'}
  ],

  // What this area remembers in your save, and the values a new game starts with.
  //   elder   0 not spoken to yet, 1 said hello, 2 told you about the animals
  //   gate    true once the rocks have rolled away
  //   story   true once you've read the story at the waterfall
  // The game adds each request below ('not asked', 'asked' or 'done'), what you're holding
  // for each request, and done: true once you've passed the word test at the cave door.
  progress: {elder:0, gate:false, story:false},

  // Numbers that text can show as {name}, and that an if can check. count is one of:
  // wordsLearned, animalsFound, animals (how many hide in the grass), animalsLeft, peaches, or picked
  // (how many you've picked for a request, given as request).
  // minus takes some away; max is the most it can be.
  counters: {
    newWords: {count:'wordsLearned', minus:1, max:4},   // words learned apart from one (you're born knowing 石头), up to 4
    animals: {count:'animals'},
    found: {count:'animalsFound'},
    animalsLeft: {count:'animalsLeft'},
    peaches: {count:'peaches', max:10},   // your peaches, up to the headband's price
    flowersPicked: {count:'picked', request:'flowers'}   // flowers picked for the big monkey
  },

  // The task box under the game screen. Every task whose if matches is shown, in this order.
  //   id     a name for the task; the game remembers which tasks you've seen, to mark new ones
  //   text   what it says. {holding:hungry} is the word for what you're holding for that request
  //   arrow  where the yellow arrow points: a character, or [x, y] on the map (no arrow if left out)
  // Besides what the area remembers, words and counters, an if can check holding:{hungry:true}
  // (true if you're holding something for that request, false if not), bought:{'头带':true} (true if
  // you've bought it from the shop, false if not), and ready:true (everything
  // on the checklist is done apart from the exit test).
  tasks: [
    {id:'elder', if:{elder:0}, text:'Say hello to the old monkey, by your stone', arrow:'elder'},
    {id:'elder2', if:{elder:1, newWords:{atLeast:4}}, text:'Talk to the old monkey again', arrow:'elder'},
    {id:'learn4', if:{elder:1, newWords:{below:4}}, text:'Learn 4 words, then talk to the old monkey again ({newWords}/4)'},
    {id:'animals', if:{elder:{atLeast:2}, animalsLeft:{atLeast:1}}, text:'Find the animals: in rustling grass, up a tree, on a cliff ({found}/{animals})'},
    {id:'h1', if:{hungry:'asked', holding:{hungry:false}}, text:'Find the fruit the hungry monkey asked for', arrow:[2, 7]},
    {id:'h2{holding:hungry}', if:{hungry:'asked', holding:{hungry:true}}, text:'Give the {holding:hungry} to the hungry monkey', arrow:'hungry'},
    {id:'t1', if:{thirsty:'asked', holding:{thirsty:false}}, text:'Collect water from the river or the pond', arrow:[11, 9]},
    {id:'t2', if:{thirsty:'asked', holding:{thirsty:true}}, text:'Give the {水} to the thirsty monkey', arrow:'thirsty'},
    {id:'f1', if:{flowers:'asked', holding:{flowers:false}}, text:'Pick 3 {花} for the big monkey: face a patch of flowers and press A ({flowersPicked}/3)'},
    {id:'f2', if:{flowers:'asked', holding:{flowers:true}}, text:'Give the {花} to the big monkey', arrow:'big'},
    {id:'fall', if:{gate:true, story:false}, text:'Climb up beside the river to the waterfall', arrow:[18, 1]},
    {id:'shop1', if:{knows:'老板', new:'头带'}, text:'See what the {老板} sells', arrow:'boss'},
    {id:'shop2', if:{knows:'头带', bought:{'头带':false}}, text:'Buy the {头带} from the {老板} ({peaches}/10 🍑)', arrow:'boss'},
    {id:'door', if:{ready:true, done:false}, text:'Pass the word test at the {洞} door', arrow:[3, 3]}
  ],

  // What the task box says when there are no tasks: the first whose if matches.
  hints: [
    {if:{elder:{atLeast:1}, hungry:'not asked'}, text:'Monkeys with a ! above them need help. Walk up to one and press A.'},
    {if:{elder:{atLeast:1}, thirsty:'not asked'}, text:'Monkeys with a ! above them need help. Walk up to one and press A.'},
    {if:{elder:{atLeast:1}, flowers:'not asked'}, text:'Monkeys with a ! above them need help. Walk up to one and press A.'},
    {if:{done:true}, text:'Flower Fruit Mountain is complete. Practise in the {草} or visit your friends.'}
  ],

  // The area's checklist, shown in Menu, Tasks and progress, and at the cave door. Once everything
  // apart from the exit test is done, the area is ready and the cave door opens.
  checklist: [
    {text:'Say hello to the old monkey', done:{elder:{atLeast:1}}},
    {text:'Learn about animals from the old monkey', done:{elder:{atLeast:2}}},
    {text:'Find the animals ({found}/{animals})', done:{animalsLeft:0}},
    {text:'Bring the hungry monkey the fruit it wants', done:{hungry:'done'}},
    {text:'Bring water to the thirsty monkey', done:{thirsty:'done'}},
    {text:'Bring the big monkey 3 flowers', done:{flowers:'done'}},
    {text:'Read the story at the waterfall', done:{story:true}},
    {text:'Buy a headband from the shop owner', done:{bought:{'头带':true}}},
    {text:'Pass the word test at the cave door', done:{done:true}, exitTest:true}
  ],

  // A ! or ? over a character's head: the first whose if matches.
  bubbles: {
    elder: [{if:{elder:0}, show:'!'}, {if:{elder:1, newWords:{atLeast:4}}, show:'!'}],
    boss: [{if:{elder:{atLeast:1}, new:'老板'}, show:'!'}, {if:{elder:{atLeast:1}, new:'头带'}, show:'!'},
      {if:{bought:{'头带':false}, peaches:{atLeast:10}}, show:'?'}],   // ? once you can afford the headband
    playful: [{if:{elder:{atLeast:1}, new:'猴子'}, show:'!'}, {if:{elder:{atLeast:1}, new:'朋友'}, show:'!'}],   // until it has taught you both its words
    hungry: [{if:{elder:{atLeast:1}, hungry:'not asked'}, show:'!'}, {if:{elder:{atLeast:1}, hungry:'asked', holding:{hungry:true}}, show:'?'}],
    thirsty: [{if:{elder:{atLeast:1}, thirsty:'not asked'}, show:'!'}, {if:{elder:{atLeast:1}, thirsty:'asked', holding:{thirsty:true}}, show:'?'}],
    big: [{if:{elder:{atLeast:1}, flowers:'not asked'}, show:'!'}, {if:{elder:{atLeast:1}, flowers:'asked', holding:{flowers:true}}, show:'?'}]
  },

  // Characters who ask you to bring them something. The game handles each one the same way:
  // they ask (teaching the verb), you find the thing (see gather in the legend), then you
  // fill the gap in a sentence to give it to them, and get the reward.
  //   from         the character who asks
  //   wants        the word for what they want
  //   verb         taught when they ask, and used in the sentence (if there's a new verb to teach)
  //   ask          their line when asking, and asked: a message afterwards
  //   wrong        their line if you bring something else, and wrongMessage afterwards; wrongReply is the
  //                phrase that fits as your reply, and wrongAnswer their line after it
  //   offer        their line when you bring the right thing
  //   firstTeach   new words to teach before the sentence, one at a time, each with a note (if any)
  //   sentence     the sentence you complete to give it to them, with its English (sentenceEn): it's shown
  //                with one word missing (gap; what they want if not given), and you choose the word
  //   reward       peaches you get; thanks is their line afterwards, and thanksReply the phrase that fits as your reply
  requests: {
    hungry: {from:'hungry', wants:'桃子', verb:'吃', ask:'hungry', asked:'The hungry monkey wants something to eat. Check your tasks.',
      wrong:'notThis', wrongReply:'对不起', wrongAnswer:'noProblem', wrongMessage:'The monkey gives the fruit back. Listen to what it wants, then try another tree.',
      offer:'havePeach', firstTeach:[{word:'要', note:'Use 要 to say what you want.'}, {word:'我', note:'我 means I or me.'}],
      sentence:'我 要 吃 桃子', sentenceEn:'I want to eat a peach.', reward:3, thanks:'thanks', thanksReply:'不客气'},
    thirsty: {from:'thirsty', wants:'水', verb:'喝', ask:'thirsty', asked:'The thirsty monkey wants something to drink. Check your tasks.',
      offer:'haveWater', firstTeach:[{word:'要', note:'Use 要 to say what you want.'}, {word:'我', note:'我 means I or me.'}],
      sentence:'我 要 喝 水', sentenceEn:'I want to drink water.', reward:3, thanks:'thanks', thanksReply:'不客气'},
    flowers: {from:'big', wants:'花', ask:'wantFlowers', asked:'The big monkey wants 3 {花}, and will give you peaches for them. Check your tasks.',
      offer:'haveFlowers', sentence:'我 要 花', sentenceEn:'I want flowers.', reward:3, thanks:'thanks', thanksReply:'不客气'}
  },

  // The shop. who runs it, their line when you visit (ask) and after you buy (thanks, with thanksReply
  // the phrase that fits as your reply), the phrase you say when you don't want anything (no), what they say
  // if you can't afford something yet (earnMore, after how many peaches you need), and when you've
  // bought everything (soldOut). Each item: its word and price in peaches, the sentence you complete
  // to ask for it (sentence, with sentenceEn; the item is the missing word), a line on its new-word card (note), a message
  // after you buy it (bought), and wear: true if your monkey wears it from then on (bought once), or
  // eat: true for food you can buy again and eat in an animal encounter to take away a wrong answer,
  // with carry: the most you can carry.
  shop: {
    who:'boss', ask:'whatWant', thanks:'thanks', thanksReply:'谢谢', no:'我不要',
    earnMore:'Earn more by helping the monkeys, making friends with the animals in the tall grass, and training at the practice post.',
    soldOut:'You have everything the {老板} sells. Come back another time.',
    items: [
      {item:'头带', price:10, sentence:'我 要 头带', sentenceEn:'I want the headband.',
        note:'A red cloth headband.', bought:'You tie on the red {头带}. It suits you!', wear:true},
      {item:'苹果', price:2, sentence:'我 要 苹果', sentenceEn:'I want an apple.',
        note:'A crunchy apple.', bought:'You put the {苹果} in your bag. In an animal encounter, eat it to take away a wrong answer.', eat:true, carry:3}
    ]
  },

  // Things that happen by themselves when the time comes (checked whenever a request is done).
  // A word in {curly brackets} in a message is shown as 汉字 (English).
  events: [
    {if:{hungry:'done', thirsty:'done', gate:false}, do:[
      {set:{gate:true}},
      {rumble:true},   // the ground shakes and the map is redrawn
      {message:'A rumble from the {山}! The rocks north of the meadow have rolled away.'}
    ]}
  ],

  // The map, one letter per tile. The legend below says what each letter is.
  map: [
    "MMMMMMMMMMMMMMMMMMXXMMMM",
    "MMMMMMMggSggMMggggXXYYYY",
    "MMMMMMMgg.gNMMgggFWWYYYY",
    "MMMCMMMgg.ggMMggggWWYYYY",
    "MMg.gMMMg.gMMMMRRMWWYYYY",
    "YTg.ggggg.ggggg.ggWWYYYY",
    "YPg.............ggWWYYYY",
    "YQggGGGGgggFggg.ggWWgggY",
    "YPggGGGGggggTgg.ggWWgGgY",
    "YTggGGGgggOOOKg.gFWWGGgY",
    "YFgggggggOOOOgg.ggWWGGgY",
    "YTgggGGGggggggg.ggWWgggY",
    "YggFgGGGggggggg...BBgggY",
    "YgggggggggggggggggWWgGgY",
    "YTgGGGggggggggFgggWWGGgY",
    "YTggggg.ggggggTgggWWgggY",
    "YMMMMgg.ggHgggggggWWgggY",
    "YMMMMgg.gggFggggggWWgTgY",
    "YMMMMgg.GGGGgTggggWWgggY",
    "YMMMggg...........BBgFgY",
    "YMMgFggGGGggggggggWWgggY",
    "YYYYYYYYYYYYYYYYYYWWYYYY"
  ],

  // What each map letter is. Every letter on the map must be here (the tests check).
  //   look           how it's drawn: one of the looks in js/art.js
  //   walk           true if you can walk on it
  //   word           the word you learn by facing it and pressing A
  //   note           a line on that word's card
  //   newNote        a line on the card only while the word is new
  //   learnFirst     a word it teaches instead, until you know that one
  //   landmark       true if A always looks at it (otherwise only while its word is new)
  //   message        a message shown after its card
  //   learnOnStep    true to learn its word the first time you step on it, with stepNote on the card
  //   animals        true if animals hide here
  //   gather         something you can pick up here for a request (for), with a message afterwards. With
  //                  count, you pick one at each patch until you have that many (full is the message then,
  //                  and again the message at a patch you've picked already)
  //   action         something special that happens: 'caveDoor', 'story', 'sign' or 'training'
  //   label          what the A button says when you face it (Look if not given)
  //   whenGateOpens  the letter it becomes once the rocks have rolled away
  legend: {
    'g': {look:'grass', walk:true},
    'G': {look:'tallGrass', walk:true, word:'草', learnOnStep:true, stepNote:'Tall grass. Animals hide in here.', animals:true},
    'F': {look:'flowers', walk:true, word:'花', learnOnStep:true, gather:{item:'花', for:'flowers', count:3, label:'Pick', note:'You pick a flower.',
      message:'You picked a {花} ({flowersPicked}/3). Find another patch.', full:'You have 3 {花}. Take them to the big monkey.', again:'You picked this patch already. Find another patch of {花}.'}},
    '.': {look:'path', walk:true, word:'路', learnOnStep:true, stepNote:'You are walking along a path.'},
    'B': {look:'bridge', walk:true},
    'T': {look:'tree', word:'树'},
    'Y': {look:'tree', word:'树'},   // the forest round the edge of the map
    'P': {look:'peachTree', word:'桃子', landmark:true, gather:{item:'桃子', for:'hungry', label:'Pick', note:'You pick one from the tree.', message:'You picked a {桃子}. Take it to the hungry monkey.'}},
    'Q': {look:'appleTree', word:'苹果', landmark:true, gather:{item:'苹果', for:'hungry', label:'Pick', note:'You pick one from the tree.', message:'You picked a {苹果}. Take it to the hungry monkey.'}},
    'S': {look:'stone', word:'石头', note:'You were born from this stone.', landmark:true},
    'N': {look:'sign', landmark:true, action:'sign'},
    'K': {look:'post', landmark:true, label:'Train', action:'training'},   // the training ground
    'H': {look:'stall'},   // the shop owner's stall
    'R': {look:'rocks', word:'石头', landmark:true, message:'Big rocks block the way up. Maybe they will move once the monkeys are happy.', whenGateOpens:'.'},
    'M': {look:'cliff', word:'山'},
    'C': {look:'caveDoor', word:'洞', note:'A cave in the cliff, closed by a heavy stone door.', landmark:true, action:'caveDoor'},
    'W': {look:'water', word:'河', gather:{item:'水', for:'thirsty', label:'Collect', note:'You scoop up some water from the river.', message:'You collected some {水}. Take it to the thirsty monkey.'}},
    'O': {look:'water', word:'鱼', newNote:'Little fish dart about in the pond.', gather:{item:'水', for:'thirsty', label:'Collect', note:'You scoop up some water from the pond.', message:'You collected some {水}. Take it to the thirsty monkey.'}},
    'X': {look:'waterfall', word:'瀑布', note:'Water crashes down the 山 (mountain). What could be behind it?', landmark:true, action:'story'}
  },

  // Characters standing on the map. A character's name shows Chinese, pinyin and English
  // together, because names aren't vocabulary.
  // palette: a monkey's colours. o outline, f fur, s face and tummy, m mouth, e eyes, w beard.
  // label: what the A button says beside them (Talk if not given).
  // look: 'bird' draws a little bird instead of a monkey. word: it sparkles until you know this word.
  // beard: draws a white beard.
  characters: [
    {id:'elder', x:7, y:1, facing:'down', beard:true, name:{zh:'老猴子', py:'lǎo hóuzi', en:'Old monkey'},
      palette:{o:'#3A3A36', f:'#A9A79F', s:'#EADCC8', m:'#B89E86', e:'#222222', w:'#FAFAF5'}},
    {id:'big', x:5, y:10, facing:'down', name:{zh:'大猴子', py:'dà hóuzi', en:'Big monkey'},
      palette:{o:'#4A2C17', f:'#B9854E', s:'#F7DABA', m:'#D19A7A', e:'#24160C'}},
    {id:'hungry', x:13, y:5, facing:'down', name:{zh:'饿猴子', py:'è hóuzi', en:'Hungry monkey'},
      palette:{o:'#4A2C17', f:'#B8743E', s:'#F2C9A0', m:'#C68A64', e:'#24160C'}},
    {id:'thirsty', x:2, y:12, facing:'right', name:{zh:'渴猴子', py:'kě hóuzi', en:'Thirsty monkey'},
      palette:{o:'#40250F', f:'#94592E', s:'#F0C59A', m:'#C08060', e:'#24160C'}},
    {id:'playful', x:15, y:20, facing:'up', name:{zh:'小猴子', py:'xiǎo hóuzi', en:'Little monkey'},
      palette:{o:'#4A2C17', f:'#CC8D45', s:'#F6D2A8', m:'#C98E6A', e:'#24160C'}},
    {id:'boss', x:11, y:16, facing:'down', name:{zh:'老板', py:'lǎobǎn', en:'Shop owner'},
      palette:{o:'#3E2A14', f:'#9C6A3C', s:'#EFC9A0', m:'#B98260', e:'#24160C'}}
  ],

  // The sign by the stone: its name, what it says, and a hint underneath.
  sign: {
    name: {zh:'牌子', py:'páizi', en:'Sign'},
    says: {zh:'花果山', en:'Flower Fruit Mountain'},
    hint: 'The name of your home.'
  },

  // Things that sparkle until you learn their word: the word, where it is on the map, and
  // (optionally) an if that must match before it starts sparkling.
  sparkles: [
    {word:'石头', at:[9, 1]}, {word:'山', at:[12, 3]}, {word:'路', at:[9, 4]}, {word:'花', at:[11, 7]},
    {word:'草', at:[5, 7]}, {word:'树', at:[12, 8]}, {word:'桃子', at:[1, 6]}, {word:'苹果', at:[1, 7]},
    {word:'河', at:[18, 7]}, {word:'鱼', at:[11, 9]}, {word:'洞', at:[3, 3]},
    {word:'瀑布', at:[18, 1], if:{gate:true}}   // the waterfall is out of reach until the rocks roll away
  ],

  // Where you found each word, shown on its page in the Word Scroll. Every word you can collect
  // here needs one (the tests check). A word in {curly brackets} is shown as 汉字 (English).
  found: {
    '石头': 'The stone you were born from, at the top of the path.',
    '路': 'The path down the mountain from your stone.',
    '你好': 'The old monkey said it when you first met.',
    '猴子': 'The little monkey, playing in the south meadow.',
    '山': 'The cliffs all around the mountain.',
    '花': 'The flowers growing in the grass.',
    '草': 'The tall grass, where animals hide.',
    '树': 'The trees on the mountain.',
    '桃子': 'The peach trees at the far left end of the long path.',
    '苹果': 'The apple tree at the far left end of the long path.',
    '河': 'The river that runs down the right of the mountain.',
    '水': 'You collected it for the thirsty monkey.',
    '鱼': 'Little fish in the pond in the middle of the meadow.',
    '鸟': 'Little birds that land on the grass near you.',
    '动物': 'The old monkey told you about the hidden animals.',
    '兔子': 'It jumped out of the tall grass.',
    '狐狸': 'It jumped out of the tall grass.',
    '松鼠': 'It lives in the big tree to the south.',
    '山羊': 'It lives on the cliffs to the south.',
    '洞': 'The cave door at the top of the short path on the far left.',
    '吃': 'The hungry monkey wanted something to eat.',
    '喝': 'The thirsty monkey wanted something to drink.',
    '朋友': 'The little monkey became your friend.',
    '我': 'You learned it to say what a monkey wanted.',
    '要': 'You learned it to say what a monkey wanted.',
    '瀑布': 'The waterfall at the top right of the mountain.',
    '老板': 'The shop owner at the market stall in the south meadow.',
    '头带': 'You bought it from the {老板} at the market stall in the south meadow.',
    '谢谢': 'You said it to the {老板} after buying from the stall.',
    '不客气': 'You said it when a monkey thanked you for your help.',
    '对不起': 'You said it when you brought the hungry monkey the wrong fruit.',
    '没关系': 'The hungry monkey said it when you said sorry.',
    '再见': 'You said it to the old monkey after he told you about the animals.',
    '我不要': 'You said it at the {老板}’s stall when you didn’t want anything.',
    '戴': 'You said it when you put something on from your wardrobe.',
  },

  // Example sentences for words that no line or story sentence uses, shown on the word's page in
  // the Word Scroll. (A word that only appears in a sentence you complete, such as 头带, shows that.)
  // Checked by a native speaker on 16 October 2026.
  examples: {
    '路': {zh:'小 猴子 在 路 上 。', en:'The little monkey is on the path.'},
    '兔子': {zh:'草 里 有 一只 兔子 。', en:'There is a rabbit in the grass.'},
    '狐狸': {zh:'狐狸 在 草 里 玩 。', en:'The fox is playing in the grass.'},
    '松鼠': {zh:'松鼠 在 树 上 。', en:'The squirrel is in the tree.'},
    '山羊': {zh:'山羊 在 山 上 吃 草 。', en:'The goat is eating grass on the mountain.'},
    '洞': {zh:'山 里 有 一个 洞 。', en:'There is a cave in the mountain.'}
  },

  // Where a fish jumps out of the water now and then.
  fish: [[11, 10]],

  // The area's animals. The id is kept in saved games, so never change it. An animal with at lives
  // at that spot (x, y) on the map, such as up a tree or on a cliff: face it and press A to meet it,
  // and home is the word for where it lives. The others hide in the tall grass, which rustles where
  // one is hiding: step in to meet it. meetNote is on its new-word card the first time.
  animals: [
    {id:'rabbit', word:'兔子'},
    {id:'fox', word:'狐狸'},
    {id:'squirrel', word:'松鼠', at:[13, 18], home:'树', meetNote:'A squirrel peeks out of the big {树}! Answer its questions to make friends.'},
    {id:'goat', word:'山羊', at:[4, 18], home:'山', meetNote:'A goat stands on the cliff, chewing. Answer its questions to make friends.'}
  ],
  // Little birds land near you now and then: face one and press A to see its word (word, with note on its card).
  birds: {word:'鸟', note:'A little bird hops about on the grass, singing.'},
  // Animals only start jumping out of the tall grass once this matches.
  animalsAppear: {knows:'动物'},
  // The kinds of question animals ask, easiest first: 'listen' (hear a word, pick its picture), 'read'
  // (see its characters, pick its picture) and 'hear' (hear a word, pick its characters, with no
  // pictures). A word's questions get harder as you know it better, but only up to the kinds listed
  // here. Picking characters by sound is too hard for a first day, so 'hear' waits for a later area.
  // 'gap' means an animal's last question is sometimes a sentence you know with a word missing.
  questions: ['listen', 'read', 'gap'],

  // Clothes for your wardrobe (Menu, 衣服). Each: the word, the sentence your monkey says putting it on
  // (sentence, with sentenceEn; it's practised at the practice post too, with a word missing), and the
  // word it teaches the first time (teach, with a note on its card). You get them from the shop
  // (wear: true there) or with a give step.
  wardrobe: [
    {item:'头带', sentence:'我 戴 头带', sentenceEn:'I wear my headband.', teach:'戴', note:'Use 戴 for things you wear on your head.'}
  ],

  // What the characters say. The English shows under a sentence the first time you see it.
  lines: {
    hi: {zh:'你好 ！', en:'Hello!'},
    iam: {zh:'我 是 猴子 。 你 也 是 猴子 ！', en:'I am a monkey. You are a monkey too!'},
    go: {zh:'去 看看 ！', en:'Go and take a look!'},
    hungry: {zh:'我 饿 了 。 我 要 吃 桃子 ！', en:"I'm hungry. I want to eat a peach!"},
    thirsty: {zh:'我 渴 了 。 我 要 喝 水 ！', en:"I'm thirsty. I want to drink some water!"},
    havePeach: {zh:'你 有 桃子 吗 ？', en:'Do you have a peach?'},
    haveWater: {zh:'你 有 水 吗 ？', en:'Do you have water?'},
    thanks: {zh:'谢谢 你 ！', en:'Thank you!'},
    play: {zh:'我们 玩 吧 ！', en:"Let's play!"},
    weFriends: {zh:'我们 是 朋友 ！', en:'We are friends!'},
    animals: {zh:'草 里 有 动物 。 去 找 动物 吧 ！', en:'There are animals in the grass. Go and find them!'},
    findElder: {zh:'你好 ！ 去 找 老 猴子 吧 ！', en:'Hello! Go and find the old monkey!'},
    notThis: {zh:'这 是 苹果 。 我 要 吃 桃子 ！', en:'This is an apple. I want to eat a peach!'},
    boss: {zh:'你好 ！ 我 是 老板 。', en:"Hello! I'm the shop owner."},
    whatWant: {zh:'你 要 什么 ？', en:'What do you want?'},
    bye: {zh:'再见 ！', en:'Goodbye!'},
    wantFlowers: {zh:'我 要 花 ！', en:'I want flowers!'},
    haveFlowers: {zh:'你 有 花 吗 ？', en:'Do you have flowers?'},
    noProblem: {zh:'没关系 ！', en:'That’s OK!'}
  },

  // What happens when you press A beside each character. The game goes down their list and
  // does the first part whose if matches your progress (a part with no if always matches).
  // Steps in a do list:
  //   say       one of the lines above. teach makes that word bold; hint adds a note underneath;
  //             showTasks puts your current tasks in the note instead (the hint if there are none)
  //   newWord   a word's new-word card, only if you don't know the word yet (note: a line on it)
  //   card      a word's card, every time (note: a line on it)
  //   set       change what the area remembers, such as {elder:1}
  //   request   the character's request (see requests)
  //   shop      open the area's shop (see shop below)
  //   give      put something in your wardrobe, such as {give:'花'}, with a message afterwards (note)
  //   reply     your reply: you choose what to say from phrases you know, and this is the one that fits
  //             (taught on its own card the first time). Any choice is fine; the game says which fits best.
  //   wordGame  offer a word game. ask: the question; word: who you're playing with;
  //             notYet: the message if you don't know enough words yet
  // In an if: elder:0 checks what the area remembers; new:'猴子' is true while you don't know
  // a word yet, knows:'朋友' once you do; a counter, such as newWords:{below:4} or {atLeast:4}.
  talk: {
    elder: [
      {if:{elder:0}, do:[
        {say:'hi', teach:'你好'},
        {newWord:'你好'},
        {reply:'你好'},
        {message:'The old monkey is the oldest in the troop. He teaches every baby monkey the names of everything on the mountain, and today it’s your turn.'},
        {say:'go', hint:'Things that sparkle have a word to learn. Face them and press A. Learn 4 words, then come back and talk to me again.'},
        {set:{elder:1}}
      ]},
      {if:{elder:1, newWords:{below:4}}, do:[
        {say:'go', hint:'Learn 4 words first, then come back. ({newWords}/4)'}
      ]},
      {if:{elder:1}, do:[
        {say:'animals', teach:'动物', hint:'Watch for tall grass that rustles: an animal is hiding there. Others live up a tree and on the cliffs to the south. Answer their questions to make friends.'},
        {newWord:'动物', note:'There are {animals} different animals on the mountain. Can you find them all?'},
        {set:{elder:2}},
        {reply:'再见'},
        {say:'bye'}
      ]},
      {do:[{say:'hi', showTasks:true, hint:'Keep exploring, little monkey.'}, {reply:'你好'}]}
    ],
    playful: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first. He’ll tell you what to do.'}]},
      {if:{new:'猴子'}, do:[{say:'iam', teach:'猴子'}, {newWord:'猴子'}]},
      {if:{new:'朋友'}, do:[{say:'weFriends', teach:'朋友'}, {newWord:'朋友', note:'Come back and play a word game with me any time.'}]},
      {do:[{say:'play'}, {wordGame:{ask:'Play a word game with this little monkey?', word:'猴子', notYet:'Learn a few more words first, then come back to play.'}}]}
    ],
    boss: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first. He’ll tell you what to do.'}]},
      {if:{new:'老板'}, do:[{say:'boss', teach:'老板'}, {newWord:'老板', note:'The {老板} owns the shop. Come back to see what they sell.'}, {reply:'你好'}]},
      {do:[{shop:true}]}
    ],
    hungry: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first. He’ll tell you what to do.'}]},
      {do:[{request:'hungry'}]}
    ],
    thirsty: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first. He’ll tell you what to do.'}]},
      {do:[{request:'thirsty'}]}
    ],
    big: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first. He’ll tell you what to do.'}]},
      {do:[{request:'flowers'}]}
    ]
  },

  // The Story Scroll at the waterfall: your first day, told in short sentences made of words you've met.
  // pic is the word whose picture is shown beside the sentence. Each sentence's English shows under it
  // the first time you read the story. (The longer story from the book's opening, with 一只, 一个 and
  // 很, waits for the Water Curtain Cave, which teaches them.)
  story: [
    {zh:'石头 里 有 猴子 。', en:'There is a monkey inside the stone.', pic:'石头'},
    {zh:'我 是 猴子 。', en:'I am a monkey.', pic:'猴子'},
    {zh:'我 有 朋友 。', en:'I have friends.', pic:'朋友'},
    {zh:'我 吃 桃子 ， 喝 水 。', en:'I eat peaches and drink water.', pic:'桃子'},
    {zh:'草 里 有 动物 。', en:'There are animals in the grass.', pic:'动物'},
    {zh:'树 上 有 鸟 。', en:'There are birds in the trees.', pic:'鸟'},
    {zh:'河 里 有 鱼 。', en:'There are fish in the river.', pic:'鱼'},
    {zh:'山 上 有 瀑布 ！', en:'There is a waterfall on the mountain!', pic:'瀑布'}
  ],

  // Questions after the story: a sentence from the story with one word missing, and pictures to fill
  // the gap. zh is the whole sentence; answer is the missing word; en is the English with the gap.
  // Quizzes only use words you've caught, so the game shows the answer and the first 2 other options
  // you've caught, in a random order, and skips a question if you haven't caught its answer. List the
  // best wrong answers first, and make sure every one is clearly wrong.
  // Players have always caught 石头, 桃子 and 水 by the time they reach the waterfall.
  storyQuestions: [
    {zh:'石头 里 有 猴子 。', en:'There is a … inside the stone.', options:['猴子', '鱼', '鸟', '水'], answer:'猴子'},
    {zh:'我 吃 桃子 ， 喝 水 。', en:'I eat … and drink water.', options:['桃子', '石头', '树', '花'], answer:'桃子'},
    {zh:'河 里 有 鱼 。', en:'There are … in the river.', options:['鱼', '树', '山羊', '花'], answer:'鱼'}
  ],

  // The card after the story questions. reward: peaches, the first time only; rumble: the ground
  // shakes as you close it (first time only). Text may use <i>…</i> for a book title.
  storyEnd: {
    title: 'Your first story',
    reward: 5,
    rumble: true,
    text: [
      'You read a whole story in Chinese: the story of your first day on Flower Fruit Mountain.',
      'You hear a heavy door roll open somewhere in the cliffs. That’s the way onward.'
    ]
  },

  // The way out of the area: the word test at the cave door, and what happens when you pass.
  //   notReady    shown above what's left to do, while the door won't open
  //   ready       when it opens (the game adds the pass mark)
  //   tryAgain    if you don't pass the test, with failButton; passButton if you do
  //   done        after passing, with notBuilt underneath, then you're put back at returnTo
  exit: {
    notReady: 'The door won’t move. Finish everything on Flower Fruit Mountain first:',
    ready: 'The door has rolled open. To go through, pass a short word test: match each word you learned here to its picture.',
    tryAgain: 'Walk around the mountain, look at things again and meet animals in the tall grass. Then come back to the door and try again.',
    passButton: 'Go through the door',
    failButton: 'Back to the mountain',
    done: 'The tunnel leads behind the waterfall to <b>水帘洞</b> (Water Curtain Cave), where the story goes next.',
    notBuilt: 'That area isn’t built yet, so you’re back on the mountain for now. Your progress is saved.',
    returnTo: {x:3, y:4, facing:'down'}
  },

  // The opening scene. Each caption appears this many seconds in, then waits for Next.
  // The pictures (night, dawn, the stone cracking) are drawn by js/draw.js to match these times.
  intro: [
    {at:0, zh:'很久很久以前……', py:'Hěn jiǔ hěn jiǔ yǐqián……', en:'Long, long ago…'},
    {at:2.8, zh:'海里有一座山，叫花果山。', py:'Hǎi lǐ yǒu yí zuò shān, jiào Huāguǒ Shān.', en:'In the sea stood a mountain called Flower Fruit Mountain.'},
    {at:5.4, zh:'山上有一个大石头。', py:'Shān shàng yǒu yí gè dà shítou.', en:'On top of the mountain sat a big stone.'},
    {at:7.2, zh:'石头动了！', py:'Shítou dòng le!', en:'The stone moved!'},
    {at:9, zh:'一只小猴子！', py:'Yì zhī xiǎo hóuzi!', en:'A little monkey!'},
    {at:10.6, zh:'它的眼睛里有光。', py:'Tā de yǎnjing lǐ yǒu guāng.', en:'Light shone from its eyes.'},
    {at:13.2, zh:'你好，小猴子！', py:'Nǐ hǎo, xiǎo hóuzi!', en:'Hello, little monkey!'}
  ]
};
