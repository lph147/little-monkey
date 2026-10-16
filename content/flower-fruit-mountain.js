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
    {message:'Walk down the path and say hello to the old monkey.'}
  ],

  // What this area remembers in your save, and the values a new game starts with.
  //   elder   0 not spoken to yet, 1 said hello, 2 told you about the animals
  //   gate    true once the rocks have rolled away
  //   story   true once you've read the story at the waterfall
  // The game adds each request below ('not asked', 'asked' or 'done'), what you're holding
  // for each request, and done: true once you've passed the word test at the cave door.
  progress: {elder:0, gate:false, story:false},

  // Numbers that text can show as {name}, and that an if can check. count is one of:
  // wordsLearned, animalsFound, animals (how many hide in the grass), animalsLeft or peaches.
  // minus takes some away; max is the most it can be.
  counters: {
    newWords: {count:'wordsLearned', minus:1, max:4},   // words learned apart from one (you're born knowing 石头), up to 4
    animals: {count:'animals'},
    found: {count:'animalsFound'},
    animalsLeft: {count:'animalsLeft'},
    peaches: {count:'peaches', max:10}   // your peaches, up to the headband's price
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
    {id:'elder', if:{elder:0}, text:'Talk to the old monkey on the path', arrow:'elder'},
    {id:'elder2', if:{elder:1, newWords:{atLeast:4}}, text:'Talk to the old monkey again', arrow:'elder'},
    {id:'learn4', if:{elder:1, newWords:{below:4}}, text:'Learn 4 words, then talk to the old monkey again ({newWords}/4)'},
    {id:'animals', if:{elder:{atLeast:2}, animalsLeft:{atLeast:1}}, text:'Find the hidden animals in the tall grass ({found}/{animals})'},
    {id:'h1', if:{hungry:'asked', holding:{hungry:false}}, text:'Find the fruit the hungry monkey asked for', arrow:[2, 7]},
    {id:'h2{holding:hungry}', if:{hungry:'asked', holding:{hungry:true}}, text:'Give the {holding:hungry} to the hungry monkey', arrow:'hungry'},
    {id:'t1', if:{thirsty:'asked', holding:{thirsty:false}}, text:'Collect water from the river or the pond', arrow:[11, 9]},
    {id:'t2', if:{thirsty:'asked', holding:{thirsty:true}}, text:'Give the {水} to the thirsty monkey', arrow:'thirsty'},
    {id:'fall', if:{gate:true, story:false}, text:'Climb up beside the river to the waterfall', arrow:[18, 1]},
    {id:'shop1', if:{knows:'老板', new:'头带'}, text:'See what the {老板} sells', arrow:'boss'},
    {id:'shop2', if:{knows:'头带', bought:{'头带':false}}, text:'Buy the {头带} from the {老板} ({peaches}/10 🍑)', arrow:'boss'},
    {id:'door', if:{ready:true, done:false}, text:'Pass the word test at the {洞} door', arrow:[3, 3]}
  ],

  // What the task box says when there are no tasks: the first whose if matches.
  hints: [
    {if:{elder:{atLeast:1}, hungry:'not asked'}, text:'Monkeys with a ! above them need help. Walk up to one and press A.'},
    {if:{elder:{atLeast:1}, thirsty:'not asked'}, text:'Monkeys with a ! above them need help. Walk up to one and press A.'},
    {if:{done:true}, text:'Flower Fruit Mountain is complete. Practise in the {草} or visit your friends.'}
  ],

  // The area's checklist, shown in Menu, Tasks and progress, and at the cave door. Once everything
  // apart from the exit test is done, the area is ready and the cave door opens.
  checklist: [
    {text:'Say hello to the old monkey', done:{elder:{atLeast:1}}},
    {text:'Learn about animals from the old monkey', done:{elder:{atLeast:2}}},
    {text:'Find the hidden animals in the grass ({found}/{animals})', done:{animalsLeft:0}},
    {text:'Bring the hungry monkey the fruit it wants', done:{hungry:'done'}},
    {text:'Bring water to the thirsty monkey', done:{thirsty:'done'}},
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
    thirsty: [{if:{elder:{atLeast:1}, thirsty:'not asked'}, show:'!'}, {if:{elder:{atLeast:1}, thirsty:'asked', holding:{thirsty:true}}, show:'?'}]
  },

  // Characters who ask you to bring them something. The game handles each one the same way:
  // they ask (teaching the verb), you find the thing (see gather in the legend), then you
  // build the sentence to give it to them, and get the reward.
  //   from         the character who asks
  //   wants        the word for what they want
  //   verb         taught when they ask, and used in the sentence you build
  //   ask          their line when asking, and asked: a message afterwards
  //   wrong        their line if you bring something else, and wrongMessage afterwards
  //   offer        their line when you bring the right thing
  //   firstTeach   new words to teach before you build the sentence, one at a time, each with a note
  //   build        the sentence you build from word tiles, with its English (buildEn); extraTile is a wrong tile mixed in
  //   reward       peaches you get; thanks is their line afterwards
  requests: {
    hungry: {from:'hungry', wants:'桃子', verb:'吃', ask:'hungry', asked:'The hungry monkey wants something to eat. Check your tasks.',
      wrong:'notThis', wrongMessage:'The monkey gives the fruit back. Listen to what it wants, then try another tree.',
      offer:'havePeach', firstTeach:[{word:'要', note:'Use 要 to say what you want.'}, {word:'我', note:'我 means I or me.'}],
      build:'我 要 吃 桃子', buildEn:'I want to eat a peach.', extraTile:'喝', buildPrompt:'Say what the monkey wants. Put the words in order.', reward:3, thanks:'thanks'},
    thirsty: {from:'thirsty', wants:'水', verb:'喝', ask:'thirsty', asked:'The thirsty monkey wants something to drink. Check your tasks.',
      offer:'haveWater', firstTeach:[{word:'要', note:'Use 要 to say what you want.'}, {word:'我', note:'我 means I or me.'}],
      build:'我 要 喝 水', buildEn:'I want to drink water.', extraTile:'吃', buildPrompt:'Say what the monkey wants. Put the words in order.', reward:3, thanks:'thanks'}
  },

  // The shop. who runs it, their line when you visit (ask) and after you buy (thanks), what they say
  // if you can't afford something yet (earnMore, after how many peaches you need), and when you've
  // bought everything (soldOut). Each item: its word and price in peaches, the sentence you build to
  // ask for it (extraTile is a wrong tile mixed in), a line on its new-word card (note), a message
  // after you buy it (bought), and wear: true if your monkey wears it from then on.
  shop: {
    who:'boss', ask:'whatWant', thanks:'thanks',
    earnMore:'Earn more by helping the monkeys, making friends with the animals in the tall grass, and training at the practice post.',
    soldOut:'You have everything the {老板} sells. Come back another time.',
    items: [
      {item:'头带', price:10, build:'我 要 头带', buildEn:'I want the headband.', extraTile:'吃', buildPrompt:'Ask for the {头带}. Put the words in order.',
        note:'A red cloth headband.', bought:'You tie on the red {头带}. It suits you!', wear:true}
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
    "MMMMMMMgF.gNMMgggFWWYYYY",
    "MMMCMMMgg.ggMMggggWWYYYY",
    "MMg.gMMMg.gMMMMRRMWWYYYY",
    "YTg.ggKgg.ggggg.ggWWYYYY",
    "YPg.............ggWWYYYY",
    "YQggGGGGgggFggg.ggWWgggY",
    "YPggGGGGggggTgg.ggWWgGgY",
    "YTggGGGgggOOOHg.gFWWGGgY",
    "YFgggggggOOOOgg.ggWWGGgY",
    "YTgggGGGggggggg.ggWWgggY",
    "YggFgGGGggggggg...BBgggY",
    "YgggggggggggggggggWWgGgY",
    "YTgGGGggggggggFgggWWGGgY",
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
  //   gather         something you can pick up here for a request (for), with a message afterwards
  //   action         something special that happens: 'caveDoor', 'story', 'sign' or 'training'
  //   label          what the A button says when you face it (Look if not given)
  //   whenGateOpens  the letter it becomes once the rocks have rolled away
  legend: {
    'g': {look:'grass', walk:true},
    'G': {look:'tallGrass', walk:true, word:'草', learnOnStep:true, stepNote:'Tall grass. Animals hide in here.', animals:true},
    'F': {look:'flowers', walk:true, word:'花', learnOnStep:true},
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
    {id:'elder', x:10, y:5, facing:'down', beard:true, name:{zh:'老猴子', py:'lǎo hóuzi', en:'Old monkey'},
      palette:{o:'#3A3A36', f:'#A9A79F', s:'#EADCC8', m:'#B89E86', e:'#222222', w:'#FAFAF5'}},
    {id:'hungry', x:13, y:5, facing:'down', name:{zh:'饿猴子', py:'è hóuzi', en:'Hungry monkey'},
      palette:{o:'#4A2C17', f:'#B8743E', s:'#F2C9A0', m:'#C68A64', e:'#24160C'}},
    {id:'thirsty', x:2, y:12, facing:'right', name:{zh:'渴猴子', py:'kě hóuzi', en:'Thirsty monkey'},
      palette:{o:'#40250F', f:'#94592E', s:'#F0C59A', m:'#C08060', e:'#24160C'}},
    {id:'playful', x:11, y:12, facing:'down', name:{zh:'小猴子', py:'xiǎo hóuzi', en:'Little monkey'},
      palette:{o:'#4A2C17', f:'#CC8D45', s:'#F6D2A8', m:'#C98E6A', e:'#24160C'}},
    {id:'boss', x:14, y:9, facing:'down', name:{zh:'老板', py:'lǎobǎn', en:'Shop owner'},
      palette:{o:'#3E2A14', f:'#9C6A3C', s:'#EFC9A0', m:'#B98260', e:'#24160C'}},
    {id:'bird', x:22, y:13, facing:'down', label:'Look', look:'bird', word:'鸟'}
  ],

  // The sign by the stone: its name, what it says, and a hint underneath.
  sign: {
    name: {zh:'牌子', py:'páizi', en:'Sign'},
    says: {zh:'花果山', en:'Flower Fruit Mountain'},
    hint: 'The name of your home. You will see it often in the book.'
  },

  // Things that sparkle until you learn their word: the word, where it is on the map, and
  // (optionally) an if that must match before it starts sparkling.
  sparkles: [
    {word:'石头', at:[9, 1]}, {word:'山', at:[12, 3]}, {word:'路', at:[9, 4]}, {word:'花', at:[8, 2]},
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
    '猴子': 'The little monkey at the bottom of the meadow.',
    '山': 'The cliffs all around the mountain.',
    '花': 'The flowers growing in the grass.',
    '草': 'The tall grass, where animals hide.',
    '树': 'The trees on the mountain.',
    '桃子': 'The peach trees at the far left end of the long path.',
    '苹果': 'The apple tree at the far left end of the long path.',
    '河': 'The river that runs down the right of the mountain.',
    '水': 'You collected it for the thirsty monkey.',
    '鱼': 'Little fish in the pond in the middle of the meadow.',
    '鸟': 'A bird across the wooden bridge, at the bottom right.',
    '动物': 'The old monkey told you about the hidden animals.',
    '兔子': 'It jumped out of the tall grass.',
    '狐狸': 'It jumped out of the tall grass.',
    '松鼠': 'It jumped out of the tall grass.',
    '山羊': 'It jumped out of the tall grass.',
    '洞': 'The cave door at the top of the short path on the far left.',
    '吃': 'The hungry monkey wanted something to eat.',
    '喝': 'The thirsty monkey wanted something to drink.',
    '朋友': 'The little monkey became your friend.',
    '我': 'You learned it to say what a monkey wanted.',
    '要': 'You learned it to say what a monkey wanted.',
    '瀑布': 'The waterfall at the top right of the mountain.',
    '老板': 'The shop owner at the stall by the pond.',
    '头带': 'You bought it from the {老板} at the stall by the pond.'
  },

  // Example sentences for words that no line or story sentence uses, shown on the word's page in
  // the Word Scroll. (A word that only appears in a sentence you build, such as 头带, shows that.)
  // Checked by a native speaker on 16 October 2026.
  examples: {
    '路': {zh:'小 猴子 在 路 上 。', en:'The little monkey is on the path.'},
    '花': {zh:'山 上 有 很多 花 。', en:'There are lots of flowers on the mountain.'},
    '兔子': {zh:'草 里 有 一只 兔子 。', en:'There is a rabbit in the grass.'},
    '狐狸': {zh:'狐狸 在 草 里 玩 。', en:'The fox is playing in the grass.'},
    '松鼠': {zh:'松鼠 在 树 上 。', en:'The squirrel is in the tree.'},
    '山羊': {zh:'山羊 在 山 上 吃 草 。', en:'The goat is eating grass on the mountain.'},
    '洞': {zh:'山 里 有 一个 洞 。', en:'There is a cave in the mountain.'}
  },

  // Where a fish jumps out of the water now and then.
  fish: [[11, 10]],

  // Animals hiding in the tall grass. The id is kept in saved games, so never change it.
  animals: [
    {id:'rabbit', word:'兔子'},
    {id:'fox', word:'狐狸'},
    {id:'squirrel', word:'松鼠'},
    {id:'goat', word:'山羊'}
  ],
  // Animals only start jumping out of the tall grass once this matches.
  animalsAppear: {knows:'动物'},

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
    whatWant: {zh:'你 要 什么 ？', en:'What do you want?'}
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
  //   wordGame  offer a word game. ask: the question; word: who you're playing with;
  //             notYet: the message if you don't know enough words yet
  // In an if: elder:0 checks what the area remembers; new:'猴子' is true while you don't know
  // a word yet, knows:'朋友' once you do; a counter, such as newWords:{below:4} or {atLeast:4}.
  talk: {
    elder: [
      {if:{elder:0}, do:[
        {say:'hi', teach:'你好'},
        {newWord:'你好'},
        {say:'go', hint:'Things that sparkle have a word to learn. Face them and press A. Learn 4 words, then come back and talk to me again.'},
        {set:{elder:1}}
      ]},
      {if:{elder:1, newWords:{below:4}}, do:[
        {say:'go', hint:'Learn 4 words first, then come back. ({newWords}/4)'}
      ]},
      {if:{elder:1}, do:[
        {say:'animals', teach:'动物', hint:'Walk through the tall grass to find the hidden animals. Answer their questions to make friends.'},
        {newWord:'动物', note:'There are {animals} different animals hiding in the tall grass. Can you find them all?'},
        {set:{elder:2}}
      ]},
      {do:[{say:'hi', showTasks:true, hint:'Keep exploring, little monkey.'}]}
    ],
    playful: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey on the path first. He’ll tell you what to do.'}]},
      {if:{new:'猴子'}, do:[{say:'iam', teach:'猴子'}, {newWord:'猴子'}]},
      {if:{new:'朋友'}, do:[{say:'weFriends', teach:'朋友'}, {newWord:'朋友', note:'Come back and play a word game with me any time.'}]},
      {do:[{say:'play'}, {wordGame:{ask:'Play a word game with this little monkey?', word:'猴子', notYet:'Learn a few more words first, then come back to play.'}}]}
    ],
    boss: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey on the path first. He’ll tell you what to do.'}]},
      {if:{new:'老板'}, do:[{say:'boss', teach:'老板'}, {newWord:'老板', note:'The {老板} owns the shop. Come back to see what they sell.'}]},
      {do:[{shop:true}]}
    ],
    hungry: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey on the path first. He’ll tell you what to do.'}]},
      {do:[{request:'hungry'}]}
    ],
    thirsty: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey on the path first. He’ll tell you what to do.'}]},
      {do:[{request:'thirsty'}]}
    ],
    bird: [
      {do:[{card:'鸟', note:'A little bird hops about, singing.'}]}
    ]
  },

  // The Story Scroll at the waterfall: a short reading challenge.
  story: [
    {zh:'山 上 有 一个 大 石头 。', en:'On the mountain there is a big stone.'},
    {zh:'石头 里 有 一只 小 猴子 。', en:'Inside the stone there is a little monkey.'},
    {zh:'小 猴子 有 很多 朋友 。', en:'The little monkey has lots of friends.'},
    {zh:'猴子 吃 桃子 ， 喝 水 。', en:'Monkeys eat peaches and drink water.'},
    {zh:'鸟 在 树 上 玩 。', en:'Birds play in the trees.'},
    {zh:'河 里 有 鱼 ， 山 上 有 瀑布 。', en:'There are fish in the river, and a waterfall on the mountain.'},
    {zh:'小 猴子 很 快乐 ！', en:'The little monkey is very happy!'}
  ],

  // Questions after the story, with their English (for checking; it isn't shown). The options are words; their pictures are shown, with the Chinese
  // underneath. Quizzes only use words you've caught, so the game shows the answer and the first
  // 2 other options you've caught, in a random order, and skips a question if you haven't caught
  // its answer. List the best wrong answers first, and make sure every one is clearly wrong.
  // Players have always caught 石头, 桃子 and 水 by the time they reach the waterfall.
  storyQuestions: [
    {zh:'谁 在 石头 里 ？', en:'Who is inside the stone?', options:['猴子', '鸟', '花', '桃子', '水'], answer:'猴子'},
    {zh:'猴子 吃 什么 ？', en:'What do monkeys eat?', options:['石头', '桃子', '草', '水'], answer:'桃子'},
    {zh:'河 里 有 什么 ？', en:'What is in the river?', options:['树', '山羊', '鱼', '鸟', '桃子'], answer:'鱼'}
  ],

  // The card after the story questions. reward: peaches, the first time only; rumble: the ground
  // shakes as you close it (first time only). Text may use <i>…</i> for a book title.
  storyEnd: {
    title: 'First slice complete',
    reward: 5,
    rumble: true,
    text: [
      'Every word here comes from the opening of <i>The Rise of the Monkey King</i>. Open your book at page 8 and read to page 18. Count how many words you now recognise without the footnotes.',
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
    done: 'The tunnel leads behind the waterfall to <b>水帘洞</b> (Water Curtain Cave), which is where the story goes next in your book.',
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
