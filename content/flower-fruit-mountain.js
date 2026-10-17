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
  // row, counting from 0 at the top left of the map (of the first place, unless place says another).
  start: {x:9, y:2, facing:'up'},

  // What happens the very first time you play (steps, as in talk below). Tips explain the controls as you need them.
  begin: [
    {card:'石头', note:'You were just born from this stone!'},
    {message:'The old monkey is waiting by your stone. Go and say hello!'}
  ],

  // The story's chapters here, in order: each has its name and title, shown on a card when it begins (the
  // chapter step), and its own items on the checklist below.
  chapters: [
    {name:'Prologue', title:'The first day'},
    {name:'Chapter 1', title:'The Water Curtain Cave'}
  ],

  // What this area remembers in your save, and the values a new game starts with.
  //   chapter the chapter you're in, counting from 0 (the prologue)
  //   elder   0 not spoken to yet, 1 said hello, 2 told you about the animals
  //   gate    true once the rocks have rolled away
  //   story   true once you've read the story at the waterfall
  //   cave    chapter 1: 0 not dared yet, 1 dared to jump, 2 been inside the cave, 3 told the old monkey,
  //           4 led the troop in, 5 heard it's home, 6 made king
  //   count   how many of the troop you've counted into the cave (chapter 1)
  // The game adds each request below ('not asked', 'asked' or 'done'), what you're holding
  // for each request, and done: true once you've passed the area's word test (the troop's send-off, to come).
  progress: {chapter:0, elder:0, gate:false, story:false, cave:0, count:0},

  // Numbers that text can show as {name}, and that an if can check. count is one of:
  // wordsLearned, animalsFound, animals (how many hide in the grass), animalsLeft, shells, or picked
  // (how many you've picked for a request, given as request).
  // minus takes some away; max is the most it can be.
  counters: {
    newWords: {count:'wordsLearned', minus:1, max:4},   // words learned apart from one (you're born knowing 石头), up to 4
    animals: {count:'animals'},
    found: {count:'animalsFound'},
    animalsLeft: {count:'animalsLeft'},
    shells: {count:'shells', max:10},   // your shells, up to the headband's price
    flowersPicked: {count:'picked', request:'flowers'},   // flowers picked for the big monkey (one of each colour)
    caveThings: {count:'known', words:['桥', '床', '碗', '桌子']},   // things you've found in the Water Curtain Cave
    troopIn: {count:'known', words:['一', '二', '三']}   // the troop counted in (each count teaches its number)
  },

  // The task box under the game screen. Every task whose if matches is shown, in this order.
  //   id     a name for the task; the game remembers which tasks you've seen, to mark new ones
  //   text   what it says. {holding:hungry} is the word for what you're holding for that request, and
  //          {wanted:hungry} the word for what a fussy request wants now (after you've brought the other)
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
    {id:'h1', if:{hungry:'asked', holding:{hungry:false}, wanted:{hungry:false}}, text:'Find some fruit for the hungry monkey'},
    {id:'h1b', if:{hungry:'asked', holding:{hungry:false}, wanted:{hungry:true}}, text:'Find the {wanted:hungry} the hungry monkey wants'},
    {id:'h2{holding:hungry}', if:{hungry:'asked', holding:{hungry:true}}, text:'Give the {holding:hungry} to the hungry monkey', arrow:'hungry'},
    {id:'t1', if:{thirsty:'asked', holding:{thirsty:false}}, text:'Collect water from the river or the pond', arrow:[11, 9]},
    {id:'t2', if:{thirsty:'asked', holding:{thirsty:true}}, text:'Give the {水} to the thirsty monkey', arrow:'thirsty'},
    {id:'f1', if:{flowers:'asked', holding:{flowers:false}}, text:'Find a red, a yellow and a white {花} for the big monkey ({flowersPicked}/3)'},
    {id:'f2', if:{flowers:'asked', holding:{flowers:true}}, text:'Give the {花} to the big monkey', arrow:'big'},
    {id:'fall', if:{gate:true, story:false}, text:'Climb up beside the river to the waterfall', arrow:[18, 1]},
    {id:'shop1', if:{knows:'老板', new:'头带'}, text:'See what the {老板} sells', arrow:'boss'},
    {id:'shop2', if:{knows:'头带', bought:{'头带':false}}, text:'Buy the {头带} from the {老板} ({shells}/10 🐚)', arrow:'boss'},
    {id:'dare', if:{chapter:1, cave:0}, text:'Go to the {瀑布}: the troop is gathering', arrow:'elder'},
    {id:'jump', if:{cave:1}, text:'Jump through the {瀑布}', arrow:[18, 1]},
    {id:'explore', if:{cave:2, caveThings:{below:4}}, text:'Look around the {洞} ({caveThings}/4)'},
    {id:'tell', if:{cave:2, caveThings:4}, text:'Tell the old monkey about the {洞}', arrow:'elder'},
    {id:'lead', if:{cave:3}, text:'Lead the troop into the {洞}: jump through the {瀑布}', arrow:[18, 1]},
    {id:'home', if:{cave:4}, text:'Talk to the old monkey in the {洞}', arrow:'elder'},
    {id:'king', if:{cave:5}, text:'Talk to the big monkey', arrow:'big'},
    {id:'count', if:{cave:6, count:{below:3}}, text:'Count the troop in with the old monkey ({troopIn}/3)', arrow:'elder'},
  ],

  // What the task box says when there are no tasks: the first whose if matches.
  hints: [
    {if:{elder:{atLeast:1}, hungry:'not asked'}, text:'Monkeys with a ! need help. Go and talk to them.'},
    {if:{elder:{atLeast:1}, thirsty:'not asked'}, text:'Monkeys with a ! need help. Go and talk to them.'},
    {if:{elder:{atLeast:1}, flowers:'not asked'}, text:'Monkeys with a ! need help. Go and talk to them.'},
    {if:{count:3}, text:'The whole troop is home in the {洞}. The rest of chapter 1 is coming soon.'},
    {if:{done:true}, text:'Flower Fruit Mountain is complete. Practise in the {草} or visit your friends.'}
  ],

  // The area's checklist, shown in your tasks (Select): the chapter you're in (chapter, 0 if not given). Once
  // everything in a chapter is done, it's ready (ready:true in an if), and the next chapter can begin.
  // An item with show only appears once you've found it (show matches, such as the character having asked
  // you), or it's done; until then the list says there's more to find. exitTest marks the area's word test,
  // which comes last.
  checklist: [
    {text:'Say hello to the old monkey', done:{elder:{atLeast:1}}},
    {text:'Learn about animals from the old monkey', show:{elder:{atLeast:1}}, done:{elder:{atLeast:2}}},
    {text:'Find the animals ({found}/{animals})', show:{elder:{atLeast:2}}, done:{animalsLeft:0}},
    {text:'Bring the hungry monkey the fruit it wants', show:{hungry:'asked'}, done:{hungry:'done'}},
    {text:'Bring water to the thirsty monkey', show:{thirsty:'asked'}, done:{thirsty:'done'}},
    {text:'Bring the big monkey a red, a yellow and a white flower', show:{flowers:'asked'}, done:{flowers:'done'}},
    {text:'Read the story at the waterfall', show:{gate:true}, done:{story:true}},
    {text:'Buy a headband from the shop owner', show:{knows:'头带'}, done:{bought:{'头带':true}}},
    {chapter:1, text:'Jump through the waterfall', show:{cave:{atLeast:1}}, done:{cave:{atLeast:2}}},
    {chapter:1, text:'Look around the cave', show:{cave:{atLeast:2}}, done:{caveThings:4}},
    {chapter:1, text:'Tell the old monkey what’s inside', show:{caveThings:4}, done:{cave:{atLeast:3}}},
    {chapter:1, text:'Lead the troop into the cave', show:{cave:{atLeast:3}}, done:{cave:{atLeast:4}}},
    {chapter:1, text:'Hear what the old monkey calls the cave', show:{cave:{atLeast:4}}, done:{cave:{atLeast:5}}},
    {chapter:1, text:'Become the troop’s king', show:{cave:{atLeast:5}}, done:{cave:{atLeast:6}}},
    {chapter:1, text:'Count the troop into the cave ({troopIn}/3)', show:{cave:{atLeast:6}}, done:{count:3}}
  ],

  // A ! or ? over a character's head: the first whose if matches.
  bubbles: {
    elder: [{if:{elder:0}, show:'!'}, {if:{elder:1, newWords:{atLeast:4}}, show:'!'}, {if:{chapter:1, cave:0}, show:'!'}, {if:{cave:2, caveThings:4}, show:'!'},
      {if:{cave:4}, show:'!'}, {if:{cave:6, count:{below:3}}, show:'!'}],
    boss: [{if:{elder:{atLeast:1}, new:'老板'}, show:'!'}, {if:{elder:{atLeast:1}, new:'头带'}, show:'!'},
      {if:{bought:{'头带':false}, shells:{atLeast:10}}, show:'?'}],   // ? once you can afford the headband
    playful: [{if:{elder:{atLeast:1}, new:'猴子'}, show:'!'}, {if:{elder:{atLeast:1}, new:'朋友'}, show:'!'}],   // until it has taught you both its words
    hungry: [{if:{elder:{atLeast:1}, hungry:'not asked'}, show:'!'}, {if:{elder:{atLeast:1}, hungry:'asked', holding:{hungry:true}}, show:'?'}],
    thirsty: [{if:{elder:{atLeast:1}, thirsty:'not asked'}, show:'!'}, {if:{elder:{atLeast:1}, thirsty:'asked', holding:{thirsty:true}}, show:'?'}],
    big: [{if:{cave:5}, show:'!'}, {if:{elder:{atLeast:1}, flowers:'not asked'}, show:'!'}, {if:{elder:{atLeast:1}, flowers:'asked', holding:{flowers:true}}, show:'?'}]
  },

  // Characters who ask you to bring them something. The game handles each one the same way:
  // they ask (teaching the verb), you find the thing (see gather in the legend), then you
  // fill the gap in a sentence to give it to them, and get the reward.
  //   from         the character who asks
  //   wants        the word for what they want (or choices: see the hungry monkey)
  //   verb         a word taught when they ask (if it's new), and used in the sentence, such as 吃 or 花
  //   ask          their line when asking, and asked: a message afterwards
  //   wrong        their line if you bring something else, and wrongMessage afterwards; wrongReply is the
  //                phrase that fits as your reply, and wrongAnswer their line after it
  //   offer        their line when you bring the right thing
  //   firstTeach   new words to teach before the sentence, one at a time, each with a note (if any)
  //   sentence     the sentence you complete to give it to them, with its English (sentenceEn): it's shown
  //                with one word missing (gap; what they want if not given), and you choose the word
  //   reward       shells you get; thanks is their line afterwards, and thanksReply the phrase that fits as your reply
  requests: {
    // He wants fruit (水果), and is fussy: whichever you bring first, he wants the other (choices: each fruit's
    // lines and sentence, for when you bring it).
    hungry: {from:'hungry', verb:'吃', ask:'hungry', asked:'The hungry monkey wants some fruit. Check your tasks.',
      choices: {
        '桃子': {wrong:'notPeach', offer:'havePeach', sentence:'我 要 吃 桃子', sentenceEn:'I want to eat a peach.'},
        '苹果': {wrong:'notApple', offer:'haveApple', sentence:'我 要 吃 苹果', sentenceEn:'I want to eat an apple.'}
      },
      wrongReply:'对不起', wrongAnswer:'noProblem', wrongMessage:'The monkey gives the fruit back. It wants the {wanted:hungry}.',
      firstTeach:[{word:'要', note:'Use 要 to say what you want.'}, {word:'我', note:'我 means I or me.'}],
      reward:3, thanks:'thanks', thanksReply:'不客气'},
    thirsty: {from:'thirsty', wants:'水', verb:'喝', ask:'thirsty', asked:'The thirsty monkey wants something to drink. Check your tasks.',
      offer:'haveWater', firstTeach:[{word:'要', note:'Use 要 to say what you want.'}, {word:'我', note:'我 means I or me.'}],
      sentence:'我 要 喝 水', sentenceEn:'I want to drink water.', reward:3, thanks:'thanks', thanksReply:'不客气'},
    flowers: {from:'big', wants:'花', verb:'花', ask:'wantFlowers', asked:'The big monkey wants a red, a yellow and a white {花}, and will give you shells for them. Check your tasks.',
      offer:'haveFlowers', sentence:'我 要 红 花', sentenceEn:'I want a red flower.', gap:'红', reward:3, thanks:'thanks', thanksReply:'不客气'}
  },

  // The shop. who runs it, their line when you visit (ask) and after you buy (thanks, with thanksReply
  // the phrase that fits as your reply), the phrase you say when you don't want anything (no), what they say
  // if you can't afford something yet (earnMore, after how many shells you need), and when you've
  // bought everything (soldOut). Each item: its word and price in shells, the sentence you complete
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
    {if:{chapter:0, ready:true}, do:[{chapter:1}]},   // the prologue is done: chapter 1 begins
    {if:{place:'cave', cave:1}, do:[{card:'洞', note:'A big, dry cave, hidden behind the water!'}, {set:{cave:2}}]},   // inside for the first time
    {if:{place:'cave', cave:3}, do:[{message:'The troop follows you through the water curtain!'}, {set:{cave:4}}]},   // you lead the troop in
    {if:{hungry:'done', thirsty:'done', gate:false}, do:[
      {set:{gate:true}},
      {rumble:true},   // the ground shakes and the map is redrawn
      {message:'A rumble from the {山}! The rocks north of the meadow have rolled away.'}
    ]}
  ],

  // The area's places: small maps you move between. The first is where the game starts. Each has
  //   name    Chinese, pinyin and English, shown when you arrive (names aren't vocabulary)
  //   exits   ways to other places: step onto at and you go to the place to, arriving at arrive and
  //           facing facing. An exit with an if stays shut until it matches, and says closed instead.
  //   map     one letter per tile; the legend below says what each letter is
  // Positions elsewhere in this file ([x, y], or x and y) are in the first place. Something in another
  // place says which: [x, y, 'place'], or place:'id'.
  places: {
    meadow: {
      name: {zh:'草地', py:'cǎodì', en:'The meadow'},
      exits: [
        {at:[18, 1], by:'A', label:'Jump', to:'cave', arrive:[7, 12], facing:'up', if:{cave:{atLeast:1}}}   // jumping through the waterfall
      ],
      map: [
        "MMMMMMMMMMMMMMMMMMXXMMMM",
        "MMMMMMMggSggMMggggXXYYYY",
        "MMMMMMMgg.gNMMgggJWWYYYY",
        "MMMMMMMgg.ggMMggggWWYYYY",
        "MMgggMMMg.gMMMMRRMWWYYYY",
        "YTggggggg.ggggg.ggWWYYYY",
        "YPg.............ggWWYYYY",
        "YTggGGGGgggFggg.ggWWgggY",
        "YPggGGGGggggTgg.ggWWgGgY",
        "YTggGGGgggOOOKg.gJWWGGgY",
        "YJgggggggOOOOgg.ggWWGGgY",
        "YTgggGGGggggggg.ggWWgggY",
        "YggJgGGGggggggg...BBgggY",
        "YgggggggggggggggggWWgGgY",
        "YTgGGGggggggggFgggWWGGgY",
        "YTggggg.ggggggTgggWWgggY",
        "YMMMMgg.ggHgggggggWWgggY",
        "YMMMMgg.gggEggggggWWgQgY",
        "YMMMMgg.GGGGgTggggWWgggY",
        "YMMMggg...........BBgEgY",
        "YMMgEggGGGggggggggWWgggY",
        "YYYYYYYYYYYYYYYYYYWWYYYY"
      ]
    },
    // Behind the waterfall (chapter 1). You jump in through the water curtain at the bottom, and walk out
    // through it again.
    cave: {
      name: {zh:'水帘洞', py:'Shuǐlián Dòng', en:'Water Curtain Cave'},
      exits: [
        {at:[6, 13], to:'meadow', arrive:[17, 1], facing:'left'},
        {at:[7, 13], to:'meadow', arrive:[17, 1], facing:'left'},
        {at:[8, 13], to:'meadow', arrive:[17, 1], facing:'left'}
      ],
      map: [
        "ZZZZZZZZZZZZZZZZ",
        "ZDzDzDZZZZDzDzDZ",
        "ZzzzzzzzzzzzzzzZ",
        "ZzzAAzzzzVVzzzzZ",
        "ZzzAAzzzzzzzLzzZ",
        "ZzzzzzzzzzzzzzzZ",
        "ZUUUUUUIUUUUUUUZ",
        "ZzzzzzzzzzzzzzzZ",
        "ZzzzzzzzzzzzzzzZ",
        "ZzzzzzzzzzzzzzzZ",
        "ZzzzzzzzzzzzzzzZ",
        "ZzzzzzzzzzzzzzzZ",
        "ZzzzzzzzzzzzzzzZ",
        "ZZZZZZCCCZZZZZZZ"
      ]
    }
  },

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
  //                  and again the message at a patch you've picked already). With kind, it's one of each
  //                  kind instead (such as a colour); if the kind is a word, the first one teaches it (kindNote)
  //   action         something special that happens: 'story', 'sign' or 'training'
  //   label          what the A button says when you face it (Look if not given)
  //   whenGateOpens  the letter it becomes once the rocks have rolled away
  legend: {
    'g': {look:'grass', walk:true},
    'G': {look:'tallGrass', walk:true, word:'草', learnOnStep:true, stepNote:'Tall grass. Animals hide in here.', animals:true},
    'F': {look:'redFlowers', walk:true, word:'花', learnOnStep:true, gather:{item:'花', for:'flowers', kind:'红', count:3, label:'Pick', note:'You pick a flower.',
      kindNote:'The colour of these flowers.', message:'You picked a red {花} ({flowersPicked}/3). Find the other colours.', full:'You have a red, a yellow and a white {花}. Take them to the big monkey.',
      again:'You have a red {花} already. Find another colour.'}},   // red flowers, in the middle of the meadow
    'E': {look:'yellowFlowers', walk:true, word:'花', learnOnStep:true, gather:{item:'花', for:'flowers', kind:'黄', count:3, label:'Pick', note:'You pick a flower.',
      kindNote:'The colour of these flowers.', message:'You picked a yellow {花} ({flowersPicked}/3). Find the other colours.', full:'You have a red, a yellow and a white {花}. Take them to the big monkey.',
      again:'You have a yellow {花} already. Find another colour.'}},   // yellow flowers, in the south
    'J': {look:'whiteFlowers', walk:true, word:'花', learnOnStep:true, gather:{item:'花', for:'flowers', kind:'白', count:3, label:'Pick', note:'You pick a flower.',
      kindNote:'The colour of these flowers.', message:'You picked a white {花} ({flowersPicked}/3). Find the other colours.', full:'You have a red, a yellow and a white {花}. Take them to the big monkey.',
      again:'You have a white {花} already. Find another colour.'}},   // white flowers, on the far left and by the river
    '.': {look:'path', walk:true},   // (路 path waits for chapter 1: stepping off the stone was straight into a word)
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
    'W': {look:'water', word:'河', gather:{item:'水', for:'thirsty', label:'Collect', note:'You scoop up some water from the river.', message:'You collected some {水}. Take it to the thirsty monkey.'}},
    'O': {look:'water', word:'鱼', newNote:'Little fish dart about in the pond.', gather:{item:'水', for:'thirsty', label:'Collect', note:'You scoop up some water from the pond.', message:'You collected some {水}. Take it to the thirsty monkey.'}},
    'X': {look:'waterfall', word:'瀑布', note:'Water crashes down the 山 (mountain). What could be behind it?', landmark:true, action:'story'},
    // the Water Curtain Cave
    'Z': {look:'caveWall'},
    'z': {look:'caveFloor', walk:true},
    'C': {look:'curtain', walk:true},   // the water curtain: the way back out
    'U': {look:'water'},   // the stream through the cave
    'I': {look:'ironBridge', walk:true, word:'桥', learnOnStep:true, stepNote:'An iron bridge over the stream.'},
    'D': {look:'stoneBed', word:'床', landmark:true, note:'Beds of smooth stone, enough for the whole troop.'},
    'A': {look:'stoneTable', word:'桌子', landmark:true, note:'A big table of stone.'},
    'V': {look:'stoneBowls', word:'碗', landmark:true, note:'Bowls of stone, ready for the troop.'},
    'L': {look:'tablet', landmark:true, action:'sign', sign:{name:{zh:'石碑', py:'shíbēi', en:'Stone tablet'}, says:{zh:'水帘洞', en:'Water Curtain Cave'}, hint:'The name of the cave.'}}
  },

  // Characters standing on the map. A character's name shows Chinese, pinyin and English
  // together, because names aren't vocabulary.
  // palette: a monkey's colours. o outline, f fur, s face and tummy, m mouth, e eyes, w beard.
  // label: what the A button says beside them (Talk if not given).
  // look: 'bird' draws a little bird instead of a monkey. word: it sparkles until you know this word.
  // beard: draws a white beard. moves: where they go as the story goes on: the first whose if matches
  // (with x, y, facing, and place if it's another place), instead of where they start.
  characters: [
    {id:'elder', x:7, y:1, facing:'down', beard:true, name:{zh:'老猴子', py:'lǎo hóuzi', en:'Old monkey'}, moves:[{if:{cave:{atLeast:4}}, place:'cave', x:6, y:9, facing:'down'}, {if:{chapter:1}, x:15, y:1, facing:'right'}],
      palette:{o:'#3A3A36', f:'#A9A79F', s:'#EADCC8', m:'#B89E86', e:'#222222', w:'#FAFAF5'}},
    {id:'big', x:5, y:10, facing:'down', name:{zh:'大猴子', py:'dà hóuzi', en:'Big monkey'}, moves:[{if:{cave:{atLeast:4}}, place:'cave', x:9, y:8, facing:'down'}, {if:{chapter:1}, x:16, y:2, facing:'right'}],
      palette:{o:'#4A2C17', f:'#B9854E', s:'#F7DABA', m:'#D19A7A', e:'#24160C'}},
    {id:'hungry', x:13, y:5, facing:'down', name:{zh:'饿猴子', py:'è hóuzi', en:'Hungry monkey'},
      palette:{o:'#4A2C17', f:'#B8743E', s:'#F2C9A0', m:'#C68A64', e:'#24160C'}},
    {id:'thirsty', x:2, y:12, facing:'right', name:{zh:'渴猴子', py:'kě hóuzi', en:'Thirsty monkey'},
      palette:{o:'#40250F', f:'#94592E', s:'#F0C59A', m:'#C08060', e:'#24160C'}},
    {id:'playful', x:15, y:20, facing:'up', name:{zh:'小猴子', py:'xiǎo hóuzi', en:'Little monkey'}, moves:[{if:{cave:{atLeast:4}}, place:'cave', x:4, y:8, facing:'right'}, {if:{chapter:1}, x:14, y:2, facing:'right'}],
      palette:{o:'#4A2C17', f:'#CC8D45', s:'#F6D2A8', m:'#C98E6A', e:'#24160C'}},
    // the rest of the troop, in the meadow until they're counted into the cave in chapter 1
    {id:'troop1', x:21, y:7, facing:'left', name:{zh:'猴子', py:'hóuzi', en:'Monkey'}, moves:[{if:{count:{atLeast:1}}, place:'cave', x:10, y:11, facing:'up'}],
      palette:{o:'#4A2C17', f:'#C27C3A', s:'#F4CDA5', m:'#C98E6A', e:'#24160C'}},
    {id:'troop2', x:21, y:11, facing:'down', name:{zh:'猴子', py:'hóuzi', en:'Monkey'}, moves:[{if:{count:{atLeast:2}}, place:'cave', x:4, y:11, facing:'up'}],
      palette:{o:'#40250F', f:'#A8673A', s:'#EFC79C', m:'#C08060', e:'#24160C'}},
    {id:'troop3', x:20, y:13, facing:'right', name:{zh:'猴子', py:'hóuzi', en:'Monkey'}, moves:[{if:{count:{atLeast:3}}, place:'cave', x:12, y:8, facing:'left'}],
      palette:{o:'#4A2C17', f:'#D9A050', s:'#F8DAB4', m:'#C98E6A', e:'#24160C'}},
    {id:'boss', x:11, y:16, facing:'down', name:{zh:'老板', py:'lǎobǎn', en:'Shop owner'},
      palette:{o:'#3E2A14', f:'#9C6A3C', s:'#EFC9A0', m:'#B98260', e:'#24160C'}}
  ],

  // Your name in the speech box when you reply: the first whose if matches (otherwise 小猴子, You).
  yourNames: [
    {if:{cave:{atLeast:6}}, zh:'美猴王', py:'Měi Hóuwáng', en:'You, the king'}
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
    {word:'石头', at:[9, 1]}, {word:'山', at:[12, 3]}, {word:'花', at:[11, 7]},
    {word:'草', at:[5, 7]}, {word:'树', at:[12, 8]}, {word:'桃子', at:[1, 6]}, {word:'苹果', at:[21, 17]},
    {word:'河', at:[18, 7]}, {word:'鱼', at:[11, 9]},
    {word:'瀑布', at:[18, 1], if:{gate:true}},   // the waterfall is out of reach until the rocks roll away
    {word:'床', at:[1, 1, 'cave']}, {word:'桌子', at:[3, 3, 'cave']}, {word:'碗', at:[9, 3, 'cave']}, {word:'桥', at:[7, 6, 'cave']}
  ],

  // Where you found each word, shown on its page in the Word Scroll. Every word you can collect
  // here needs one (the tests check). A word in {curly brackets} is shown as 汉字 (English).
  found: {
    '石头': 'The stone you were born from, at the top of the path.',
    '你好': 'The old monkey said it when you first met.',
    '猴子': 'The little monkey, playing in the south meadow.',
    '山': 'The cliffs all around the mountain.',
    '花': 'The flowers growing in the grass.',
    '红': 'The red flowers in the middle of the meadow.',
    '黄': 'The yellow flowers in the south.',
    '白': 'The white flowers on the far left and by the river.',
    '草': 'The tall grass, where animals hide.',
    '树': 'The trees on the mountain.',
    '桃子': 'The peach trees at the far left end of the long path.',
    '苹果': 'The apple tree in the south-east, across the river.',
    '河': 'The river that runs down the right of the mountain.',
    '水': 'You collected it for the thirsty monkey.',
    '鱼': 'Little fish in the pond in the middle of the meadow.',
    '鸟': 'Little birds that land on the grass near you.',
    '动物': 'The old monkey told you about the hidden animals.',
    '兔子': 'It jumped out of the tall grass.',
    '狐狸': 'It jumped out of the tall grass.',
    '松鼠': 'It lives in the big tree to the south.',
    '山羊': 'It lives on the cliffs to the south.',
    '洞': 'The Water Curtain Cave, behind the waterfall.',
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
    '跳': 'The big monkey dared the troop to jump through the waterfall.',
    '桥': 'The iron bridge over the stream in the Water Curtain Cave.',
    '床': 'The stone beds in the Water Curtain Cave.',
    '碗': 'The stone bowls in the Water Curtain Cave.',
    '桌子': 'The stone table in the Water Curtain Cave.',
    '家': 'The old monkey, when the troop moved into the Water Curtain Cave.',
    '王': 'The troop, when they made you their king.',
    '一': 'Counting the troop into the Water Curtain Cave.',
    '二': 'Counting the troop into the Water Curtain Cave.',
    '三': 'Counting the troop into the Water Curtain Cave.',
  },

  // Example sentences for words that no line or story sentence uses, shown on the word's page in
  // the Word Scroll. (A word that only appears in a sentence you complete, such as 头带, shows that.)
  // Checked by a native speaker on 16 October 2026.
  examples: {
    '兔子': {zh:'草 里 有 一只 兔子 。', en:'There is a rabbit in the grass.'},
    '狐狸': {zh:'狐狸 在 草 里 玩 。', en:'The fox is playing in the grass.'},
    '松鼠': {zh:'松鼠 在 树 上 。', en:'The squirrel is in the tree.'},
    '山羊': {zh:'山羊 在 山 上 吃 草 。', en:'The goat is eating grass on the mountain.'},
    '洞': {zh:'山 里 有 一个 洞 。', en:'There is a cave in the mountain.'},
    // Chapter 1 (drafts, not checked yet: see CHINESE.md)
    '桥': {zh:'河 上 有 桥 。', en:'There is a bridge over the river.'},
    '碗': {zh:'桌子 上 有 碗 。', en:'There are bowls on the table.'},
    '桌子': {zh:'洞 里 有 桌子 。', en:'There is a table in the cave.'},
    '床': {zh:'洞 里 有 床 。', en:'There are beds in the cave.'},
    '二': {zh:'一 ， 二 ， 三 ！', en:'One, two, three!'}
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
    hungry: {zh:'我 饿 了 。 我 要 吃 水果 ！', en:"I'm hungry. I want to eat some fruit!"},
    thirsty: {zh:'我 渴 了 。 我 要 喝 水 ！', en:"I'm thirsty. I want to drink some water!"},
    havePeach: {zh:'你 有 桃子 吗 ？', en:'Do you have a peach?'},
    haveWater: {zh:'你 有 水 吗 ？', en:'Do you have water?'},
    haveApple: {zh:'你 有 苹果 吗 ？', en:'Do you have an apple?'},
    thanks: {zh:'谢谢 你 ！', en:'Thank you!'},
    play: {zh:'我们 玩 吧 ！', en:"Let's play!"},
    weFriends: {zh:'我们 是 朋友 ！', en:'We are friends!'},
    animals: {zh:'草 里 有 动物 。 去 找 动物 吧 ！', en:'There are animals in the grass. Go and find them!'},
    findElder: {zh:'你好 ！ 去 找 老 猴子 吧 ！', en:'Hello! Go and find the old monkey!'},
    notApple: {zh:'这 是 苹果 。 我 要 吃 桃子 ！', en:'This is an apple. I want to eat a peach!'},
    notPeach: {zh:'这 是 桃子 。 我 要 吃 苹果 ！', en:'This is a peach. I want to eat an apple!'},
    boss: {zh:'你好 ！ 我 是 老板 。', en:"Hello! I'm the shop owner."},
    whatWant: {zh:'你 要 什么 ？', en:'What do you want?'},
    bye: {zh:'再见 ！', en:'Goodbye!'},
    wantFlowers: {zh:'我 要 红 花 、 黄 花 和 白 花 ！', en:'I want a red flower, a yellow flower and a white flower!'},
    haveFlowers: {zh:'你 有 花 吗 ？', en:'Do you have flowers?'},
    noProblem: {zh:'没关系 ！', en:'That’s OK!'},
    // Chapter 1 (drafts, not checked yet: see CHINESE.md)
    whatBehind: {zh:'瀑布 后面 有 什么 ？', en:'What’s behind the waterfall?'},
    dare: {zh:'谁 跳 进去 ， 谁 就 是 王 ！', en:'Whoever jumps in will be king!'},
    scared: {zh:'我 怕 ！', en:'I’m scared!'},
    inside: {zh:'里面 有 什么 ？', en:'What’s inside?'},
    letsGo: {zh:'太 好 了 ！ 我们 去 看看 ！', en:'Wonderful! Let’s go and see!'},
    home: {zh:'这 是 我们 的 家 ！', en:'This is our home!'},
    king: {zh:'你 是 我们 的 王 ！', en:'You are our king!'},
    count1: {zh:'一 只 猴子 。', en:'One monkey.'},
    count2: {zh:'两 只 猴子 。', en:'Two monkeys.'},
    count3: {zh:'三 只 猴子 。', en:'Three monkeys.'}
  },

  // What happens when you press A beside each character. The game goes down their list and
  // does the first part whose if matches your progress (a part with no if always matches).
  // Steps in a do list:
  //   say       one of the lines above, said by the one you're talking to (or by, another character
  //             nearby). teach makes that word bold; hint adds a note underneath;
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
  //   gap       a sentence to finish by filling the gap: {sentence, en, word}, word being the missing one
  //   chapter   a new chapter begins: its title card, and its part of the checklist from then on
  //   message   a line of English, such as what's happening: in a conversation it waits in the speech
  //             box until you press A; anywhere else it's a message at the bottom of the screen
  // In an if: elder:0 checks what the area remembers; new:'猴子' is true while you don't know
  // a word yet, knows:'朋友' once you do; a counter, such as newWords:{below:4} or {atLeast:4}.
  talk: {
    elder: [
      {if:{elder:0}, do:[
        {say:'hi', teach:'你好'},
        {newWord:'你好'},
        {reply:'你好'},
        {message:'Every baby monkey explores the mountain to find out what things are called. Today it’s your turn!'},
        {say:'go', hint:'Things that sparkle have words. Learn 4, then come back.'},
        {set:{elder:1}}
      ]},
      {if:{elder:1, newWords:{below:4}}, do:[
        {say:'go', hint:'Learn 4 words first, then come back. ({newWords}/4)'}
      ]},
      {if:{elder:1}, do:[
        {say:'animals', teach:'动物', hint:'Animals hide in rustling grass, up a tree and on the cliffs to the south.'},
        {newWord:'动物', note:'There are {animals} different animals on the mountain. Can you find them all?'},
        {set:{elder:2}},
        {reply:'再见'},
        {say:'bye'}
      ]},
      // chapter 1: the dare at the waterfall, then telling him what's inside
      {if:{chapter:1, cave:0}, do:[
        {say:'whatBehind'},
        {say:'dare', by:'big', teach:'跳'},
        {newWord:'跳'},
        {say:'scared', by:'playful'},
        {message:'Everyone looks at you.'},
        {set:{cave:1}}
      ]},
      {if:{cave:1}, do:[{say:'dare', by:'big', hint:'Jump through the waterfall!'}]},
      {if:{cave:2, caveThings:4}, do:[
        {say:'inside'},
        {gap:{sentence:'里面 有 床', en:'There are beds inside.', word:'床'}},
        {say:'letsGo'},
        {set:{cave:3}}
      ]},
      {if:{cave:2}, do:[{say:'go', hint:'Look around the cave first.'}]},
      {if:{cave:3}, do:[{say:'letsGo', hint:'Lead the way: jump through the waterfall.'}]},
      // chapter 1, part B: the troop moves in. One new word each time you talk to him.
      {if:{cave:4}, do:[{say:'home', teach:'家'}, {newWord:'家'}, {set:{cave:5}}]},
      {if:{cave:6, count:0}, do:[{message:'A monkey comes in through the water curtain.'}, {say:'count1', teach:'一'}, {newWord:'一'}, {set:{count:1}}]},
      {if:{cave:6, count:1}, do:[{message:'Another monkey comes in.'}, {say:'count2'}, {newWord:'二', note:'When you count things, two is 两 (liǎng): 两只猴子 (two monkeys).'}, {set:{count:2}}]},
      {if:{cave:6, count:2}, do:[{message:'And another!'}, {say:'count3', teach:'三'}, {newWord:'三'}, {set:{count:3}}, {message:'The whole troop is home.'}]},
      {do:[{say:'hi', showTasks:true, hint:'Keep exploring, little monkey.'}, {reply:'你好'}]}
    ],
    playful: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      {if:{new:'猴子'}, do:[{say:'iam', teach:'猴子'}, {newWord:'猴子'}]},
      {if:{new:'朋友'}, do:[{say:'weFriends', teach:'朋友'}, {newWord:'朋友', note:'Come back and play a word game with me any time.'}]},
      {if:{chapter:1, cave:{below:3}}, do:[{say:'scared'}]},
      {do:[{say:'play'}, {wordGame:{ask:'Play a word game with this little monkey?', word:'猴子', notYet:'Learn a few more words first, then come back to play.'}}]}
    ],
    boss: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      {if:{new:'老板'}, do:[{say:'boss', teach:'老板'}, {newWord:'老板', note:'The {老板} owns the shop. Come back to see what they sell.'}, {reply:'你好'}]},
      {do:[{shop:true}]}
    ],
    hungry: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      {do:[{request:'hungry'}]}
    ],
    thirsty: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      {do:[{request:'thirsty'}]}
    ],
    troop1: [{if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]}, {do:[{say:'hi'}, {reply:'你好'}]}],
    troop2: [{if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]}, {do:[{say:'hi'}, {reply:'你好'}]}],
    troop3: [{if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]}, {do:[{say:'hi'}, {reply:'你好'}]}],
    big: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      {if:{cave:5}, do:[{say:'king', teach:'王'}, {newWord:'王'}, {message:'The troop names you 美猴王 (Měi Hóuwáng · Handsome Monkey King)!'}, {set:{cave:6}}]},
      {if:{chapter:1, cave:{below:3}}, do:[{say:'dare'}]},
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

  // The card after the story questions. reward: shells, the first time only; rumble: true to shake the
  // ground as you close it (first time only). Text may use <i>…</i> for a book title.
  storyEnd: {
    title: 'Your first story',
    reward: 5,
    rumble: false,
    text: [
      'You read a whole story in Chinese: the story of your first day on Flower Fruit Mountain.',
      'The troop stares at the roaring waterfall. What could be behind it?'
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

  // The opening scene, told in English so a beginner can follow it. Each caption appears this many
  // seconds in (at), then waits for Next. word: a word from the word bank to show and say with it, one
  // you'll meet on the mountain (one at most, or none). The pictures (night, dawn,
  // the stone cracking) are drawn by js/draw.js to match these times.
  intro: [
    {at:0, en:'Long, long ago, in the middle of the sea…'},
    {at:2.8, en:'…there was a mountain.', word:'山'},
    {at:5.4, en:'On top of the mountain sat a big stone.', word:'石头'},
    {at:7.2, en:'One day, the stone began to move!'},
    {at:9, en:'It cracked open, and out jumped a little monkey!', word:'猴子'},
    {at:10.6, en:'Light shone from its eyes.'},
    {at:13.2, en:'An old monkey came to say hello.', word:'你好'}
  ]
};
