// Area 2: 海的那边 Across the sea. Its prologue, the human world (decided 4 November 2026, from the plan and mock-ups):
// as in the book's first chapter, your raft drifts across the sea to a land of people; you learn to dress, talk and live
// like them, years go by, and a boatman takes you across the western sea, where a woodcutter's song tells you where the
// immortal lives. No battles here, as in the book: words come from people, by asking them what things are (这是什么？).
//
// This file is only data: the engine in js/ reads it, as it reads Flower Fruit Mountain's. Chinese sentences are written
// with a space between words, and every word must be in the word bank (content/words.js). Every line is a draft until the
// native speaker has checked it (CHINESE.md).
// Your words, friends, shells, bag (the fishing rod too) and headbands come with you from Flower Fruit Mountain; there's
// no going back there in the prologue (the raft has gone), as decided 4 November 2026.
// Landing: the raft drifts across the sea, and washes up on a sandy shore, where fishermen are mending their nets. They've
// never seen a monkey: they shout and run off into their hut, and the old one drops his coat as he goes. (人, the first
// people you've seen, as you see them.) As you arrive (begin), or, if the page was closed before it was over, next time.
const LANDING = [
  {scene:'drift'},
  {say:'monkeyMonkey', by:'fisher1'},
  {newWord:'人', note:'People! The first you’ve ever seen. They’re pointing at you…'},
  {leap:'fisher1', to:[4, 3]}, {leap:'fisher2', to:[5, 3]}, {leap:'oldFisher', to:[4, 3]},
  {set:{landed:1}},
  {message:'The people ran off into their hut! The old one dropped something on the sand as he ran.'}
];
const ACROSS_THE_SEA = {
  number: 2,
  name: {zh:'海的那边', py:'hǎi de nàbiān', en:'Across the sea'},

  // Where your raft washes up, on the shore, and which way you face.
  start: {x:13, y:11, facing:'up'},

  // What happens as you arrive (sailing in on your raft: the sail step at the end of Area 1): the raft drifts for days,
  // and washes up on a sandy shore, where fishermen are mending their nets. They've never seen a monkey: they shout and
  // run off into their hut, and the old one drops his coat as he goes. (人, the first people you've seen, as you see them.)
  begin: LANDING,

  chapters: [
    {name:'Prologue', title:'The human world'}
  ],

  // What this area remembers in your save, and the values it starts with.
  //   landed   1 once you've seen the fishermen run off
  //   dressed  0 just a monkey, 1 in the old fisherman's coat, 2 in his hat as well (people stop running)
  //   back     1 once the fishermen have come out of their hut again
  //   oldFisher 1 once the old fisherman has seen you in his coat
  //   child    0 not met, 1 told you you're not a person (不), 2 played 是不是 (是), 3 shown you how to ask (什么)
  //   knock    1 once you've knocked at the white house's gate
  //   farmer   1 once he's shown you the birds in his rice (看)
  //   dogStop  1 once the dog has stopped you on the road
  //   changed  1 once the money changer has changed your shells for coins
  //   years    1 once the years have passed, in the town
  //   boat     1 the boatman has no wind (风), 2 you've crossed the western sea
  //   song     1 once you've heard the woodcutter's song (歌): the end of the prologue
  progress: {chapter:0, landed:0, dressed:0, back:0, oldFisher:0, child:0, knock:0, farmer:0, dogStop:0, exchanged:0, years:0, boat:0, song:0, stepsTop:0},

  // Numbers that text can show as {name}, and that an if can check (as Flower Fruit Mountain's).
  counters: {
    // the village's words, which the road east waits for (the shore's net and boat too)
    villageWords: {count:'known', words:['不', '是', '什么', '井', '房子', '门', '谁', '鸡', '饭', '钱', '网', '船'],
      called:{'井':'the well', '房子':'a house', '门':'the gate in the white wall', '网':'the fishermen’s nets', '船':'their boats', '鸡':'a chicken', '谁':'who’s at the gate'}},
    askedWords: {count:'known', words:['井', '房子', '门', '网', '船']},   // the things you ask people about in the village and on the shore
    birdsShooed: {count:'shooed'},   // the birds you've shooed off the farmer's rice
    // the town's words, which the years passing wait for
    townWords: {count:'known', words:['买', '包子', '鞋', '茶', '说', '哪里', '听', '孩子', '学', '书', '猫']},
    coins: {count:'coins'}
  },

  // After any new word, the next waits till you've answered this many more questions, anywhere: a talk part, a square's
  // steps, asking about something or an animal you haven't met (waits) offers a quick word game first (as on Flower Fruit
  // Mountain, where it's 4). 6 here (decided 4 November 2026, for the plan's pacing: about 7 questions for each new word,
  // with the animals' games, the child's and the gaps you fill).
  wordGap: {questions:6, word:'人', ask:'Something new is coming! But first, a few words to practise. Play a quick word game?', notYet:'Learn a few more words first, then come back.'},
  running: {knows:'跑'},
  areaMap: {has:{knows:'地图'}, notYet:'You don’t have a map yet.', word:'地图', note:'Every place you go is drawn on your map.'},
  practiseAt: [{text:'with quick practice (练习), in the menu'}],

  // Asking what something is (decided 4 November 2026: the human world's way of finding words): once you know the word
  // (word, 什么, from the child in the village), A at something new with a person near you (within ASK_NEAR squares,
  // js/world.js) has your monkey ask, 这是什么？ (line), and they tell you, teaching its word (each square's ask: their
  // answer, one of the lines). Till you know it, cantYet; with nobody near, nobody.
  asking: {word:'什么', line:'whatsThis', label:'Ask', cantYet:'You don’t know what this is. Maybe someone can tell you, once you know how to ask.',
    nobody:'You don’t know what this is. Ask someone: walk up to it with a person nearby, and press A.'},
  // Money (decided 4 November 2026): coins, once you know their word, 钱 (when). The money changer in town changes your
  // shells for them, one for one.
  money: {when:{knows:'钱'}},
  // The child's game, 是不是？ (Is it?): a picture of something you know and 这是…吗？ about it, the word one of these
  // (only those you know, with pictures), and you answer 是 or 不是.
  isIt: ['猴子', '鱼', '鸟', '树', '花', '山', '石头', '桃子', '苹果', '水', '河', '草', '人', '鹅', '鸡', '狗', '猫', '牛', '羊', '兔子',
    '房子', '井', '门', '船', '网', '衣服', '帽子', '书', '茶', '包子', '鞋', '海', '饭'],

  tasks: [
    {id:'a2coat', if:{landed:1, dressed:0}, text:'The old man dropped something on the sand as he ran: go and find it', arrow:[20, 8]},
    {id:'a2goose', if:{landed:1, friends:{goose:false}}, text:'Make {朋友|friends} with the goose on the sand', arrow:[5, 10]},
    {id:'a2hat', if:{dressed:1}, text:'Something else is blowing along the sand: pick it up too', arrow:[23, 10]},
    {id:'a2village', if:{dressed:2, child:0}, text:'Go up the {路|path} to the village', arrow:'child'},
    {id:'a2child', if:{child:{atLeast:1, below:3}}, text:'The {孩子|child} in the village wants to play again', arrow:'child'},
    {id:'a2ask', if:{child:3, askedWords:{below:5}}, text:'Ask {人|people} about things ({askedWords}/5): face something that sparkles ✨ with someone near, and press A. Still to find: {left:askedWords}.', arrow:{sparkle:true}},
    {id:'a2knock', if:{knows:'门', knock:0}, text:'Knock on the {门} in the white wall', arrow:[19, 4, 'village']},
    {id:'a2fishAsk', if:{fish:'asked', holding:{fish:false}}, text:'Catch a {鱼} for the fisherman: face the sea or the stream with your {鱼竿}, and press A'},
    {id:'a2fishBack', if:{fish:'asked', holding:{fish:true}}, text:'Take the {鱼} to the fisherman in the village', arrow:'fisherman'},
    {id:'a2chicken', if:{child:3, friends:{chicken:false}}, text:'Make {朋友|friends} with the chicken in the yard', arrow:[22, 9, 'village']},
    {id:'a2east', if:{villageWords:12, farmer:0}, text:'Follow the {路|road} east, to the fields', arrow:'farmer'},
    {id:'a2birds', if:{farmer:1, birdsShooed:{below:3}}, text:'Shoo the {鸟|birds} off the farmer’s rice ({birdsShooed}/3)'},
    {id:'a2lunch', if:{lunch:'asked'}, text:'Give the farmer some {饭} from your bag. No {饭|rice}? The granny by the well has more', arrow:'farmer'},
    {id:'a2dog', if:{farmer:{atLeast:1}, friends:{dog:false}}, text:'Make {朋友|friends} with the dog by the road', arrow:[24, 4, 'fields']},
    {id:'a2town', if:{lunch:'done', friends:{dog:true}, exchanged:0}, text:'Follow the {路|road} east, to the town', arrow:'changer'},
    {id:'a2change', if:{exchanged:0, place:'town'}, text:'Change your {钱|money}: talk to the money changer at the market', arrow:'changer'},
    {id:'a2townWords', if:{exchanged:1, years:0}, text:'Get to know the town: find someone with a ! over them ({townWords}/11)'},
    {id:'a2harbour', if:{years:1, boat:0}, text:'Cross the {桥|bridge} to the harbour, and find the boatman', arrow:'boatman'},
    {id:'a2wind', if:{boat:1}, text:'Wait for the {风|wind}: practise a little, then go back to the boatman', arrow:'boatman'},
    {id:'a2woodcutter', if:{boat:2, song:0}, text:'Someone is singing among the {树|trees}. Go and find them', arrow:'woodcutter'}
  ],
  hints: [
    {if:{song:1}, text:'The prologue is complete! Chapter 1 is still to come: until then, practise your words, and visit your {朋友|friends}.'},
    {if:{landed:0}, text:'Walk about on the shore.'},
    {if:{dressed:2, child:3}, text:'Find someone with a ! over them, and ask {人|people} about things.'},
    {if:{}, text:'Find someone with a ! over them.'}
  ],
  checklist: [
    {text:'Make friends with the {鹅|goose} on the sand', done:{friends:{goose:true}}},
    {text:'Dress like a {人|person}', show:{landed:1}, done:{dressed:2}},
    {text:'Go up to the village', show:{dressed:2}, done:{child:{atLeast:1}}},
    {text:'Play the {孩子|child}’s game', show:{child:{atLeast:1}}, done:{child:{atLeast:2}}},
    {text:'Find out how to ask about things', show:{child:{atLeast:2}}, done:{child:3}},
    {text:'Ask about things in the village and on the shore ({askedWords}/5)', show:{child:3}, done:{askedWords:5}},
    {text:'Knock on the {门} in the white wall', show:{knows:'门'}, done:{knock:{atLeast:1}}},
    {text:'Make {朋友|friends} with the chicken', show:{child:3}, done:{friends:{chicken:true}}},
    {text:'Have lunch with the granny', show:{child:3}, done:{knows:'饭'}},
    {text:'Catch a {鱼} for the fisherman', show:{fish:'asked'}, done:{fish:'done'}},
    {text:'Help the farmer in the fields', show:{farmer:{atLeast:1}}, done:{lunch:'done'}},
    {text:'Make {朋友|friends} with the dog by the road', show:{farmer:{atLeast:1}}, done:{friends:{dog:true}}},
    {text:'Change your {钱|money} in the town', show:{lunch:'done'}, done:{exchanged:1}},
    {text:'Get to know the town ({townWords}/11)', show:{exchanged:1}, done:{townWords:11}},
    {text:'Make {朋友|friends} with the cat in the market', show:{exchanged:1}, done:{friends:{cat:true}}},
    {text:'Sail across the western {海|sea}', show:{years:1}, done:{boat:2}},
    {text:'Find out {哪里|where} the immortal lives', show:{boat:2}, done:{song:1}}
  ],
  bubbles: {
    child: [{if:{dressed:2, child:0}, show:'!'}, {if:{child:{atLeast:1, below:3}}, show:'!'}],
    granny: [{if:{child:3, new:'饭'}, show:'!'}, {if:{lunch:'asked', inBag:{'饭':false}}, show:'!'}],
    fisherman: [{if:{child:3, fish:'not asked'}, show:'!'}, {if:{fish:'asked', holding:{fish:true}}, show:'?'}],
    oldFisher: [{if:{back:1, oldFisher:0}, show:'!'}],
    farmer: [{if:{farmer:0}, show:'!'}, {if:{farmer:1, birdsShooed:3}, show:'!'}, {if:{lunch:'asked', inBag:{'饭':true}}, show:'?'}],
    changer: [{if:{exchanged:0}, show:'!'}],
    fruitSeller: [{if:{exchanged:1, new:'买'}, show:'!'}],
    bunSeller: [{if:{knows:'买', new:'包子'}, show:'!'}],
    shoeSeller: [{if:{knows:'买', new:'鞋'}, show:'!'}],
    teaKeeper: [{if:{exchanged:1, new:'茶'}, show:'!'}],
    teller: [{if:{exchanged:1, new:'说'}, show:'!'}, {if:{knows:'说', new:'哪里'}, show:'!'}],
    teacher: [{if:{exchanged:1, new:'听'}, show:'!'}, {if:{knows:'听', new:'孩子'}, show:'!'}, {if:{knows:'孩子', new:'学'}, show:'!'}],
    boatman: [{if:{years:1, boat:0}, show:'!'}, {if:{boat:1}, show:'!'}],
    woodcutter: [{if:{song:0}, show:'!'}]
  },

  // Characters who ask you to bring something (as Flower Fruit Mountain's). fromBag: what they want comes from your bag
  // (such as the granny's rice), not held for them. after: steps once they've thanked you (such as being paid).
  requests: {
    // the fisherman in the village wants a fish: catch one with the rod you brought from home, and he pays you in coins
    // (钱, the human world's money)
    fish: {from:'fisherman', wants:'鱼', ask:'haveFish', asked:'The fisherman wants a fish. Catch one with your {鱼竿}: face the sea or the stream, and press A.',
      offer:'haveFish', sentence:'我 有 鱼', sentenceEn:'I have a fish.', reward:0, thanks:'thanks', thanksReply:'不客气',
      after:[{say:'thisIsMoney', teach:'钱'}, {newWord:'钱', note:'Coins: the money people use. The fisherman pays you for the fish!'}, {coins:3, note:'The fisherman gives you 3 🪙. Now you have coins!'}]},
    // the farmer is hungry once you've shooed the birds off his rice: give him the granny's rice from your bag
    lunch: {from:'farmer', wants:'饭', fromBag:true, ask:'hungryFarmer', asked:'The farmer is hungry. Give him some {饭|rice} from your bag!',
      offer:'hungryFarmer', sentence:'我 有 饭', sentenceEn:'I have some rice.', reward:3, thanks:'thanks', thanksReply:'不客气'}
  },

  // The market's stalls (the shop step, by their id): as the 老板's shop on Flower Fruit Mountain, in coins. teach: a word
  // the stall's question teaches, if it's new (买, at the fruit stall).
  shops: {
    fruit: {who:'fruitSeller', ask:'whatBuy', teach:'买', given:'The stallholder gives you the {item}.', reply:'谢谢', welcome:'welcome', no:'我不要',
      earnMore:'Earn more by helping people and making friends with animals.', puzzled:'The stallholder looks puzzled: you pointed at the {item}, but asked for something else!',
      sorry:'对不起', sorryAbout:'You asked the stallholder for the wrong thing.', noProblem:'noProblem', soldOut:'Come back another time.',
      items:[
        {item:'苹果', price:2, sentence:'我 要 买 苹果', sentenceEn:'I want to buy an apple.', note:'A crunchy apple.', bought:'You put the {苹果} in your bag.', eat:true},
        {item:'桃子', price:2, sentence:'我 要 买 桃子', sentenceEn:'I want to buy a peach.', note:'A ripe peach.', bought:'You put the {桃子} in your bag.', eat:true}
      ]},
    buns: {who:'bunSeller', ask:'whatBuy', given:'The stallholder gives you the {item}.', reply:'谢谢', welcome:'welcome', no:'我不要',
      earnMore:'Earn more by helping people and making friends with animals.', puzzled:'The stallholder looks puzzled: you pointed at the {item}, but asked for something else!',
      sorry:'对不起', sorryAbout:'You asked the stallholder for the wrong thing.', noProblem:'noProblem', soldOut:'Come back another time.',
      items:[
        {item:'包子', price:2, sentence:'我 要 买 包子', sentenceEn:'I want to buy a steamed bun.', note:'A steamed bun, soft and hot, with something tasty inside.', bought:'You put the {包子} in your bag. In a word game, eat it to take away a wrong answer.', eat:true}
      ]},
    shoes: {who:'shoeSeller', ask:'whatBuy', given:'The stallholder gives you the {item}.', reply:'谢谢', welcome:'welcome', no:'我不要',
      earnMore:'Earn more by helping people and making friends with animals.', puzzled:'The stallholder looks puzzled: you pointed at the {item}, but asked for something else!',
      sorry:'对不起', sorryAbout:'You asked the stallholder for the wrong thing.', noProblem:'noProblem', soldOut:'You have shoes now! Come back another time.',
      items:[
        {item:'鞋', price:4, sentence:'我 要 买 鞋', sentenceEn:'I want to buy shoes.', note:'Cloth shoes, black, with thick soles.', bought:'You put on your new {鞋}. Now you look just like a person!', wear:true}
      ]}
  },

  areaEnd: {title:'To be continued…', text:['The woodcutter points up the stone steps: the immortal lives up on the mountain!',
    'That’s the end of the prologue. Chapter 1, the immortal’s mountain, is still to come. Until then, practise your words, and visit your friends.']},

  // Fishing (js/fishing.js), with the rod you brought from Flower Fruit Mountain: in the sea, and the village's stream.
  fishing: {
    rod:'鱼竿', has:{knows:'鱼竿'}, bait:'鱼饵', bigIf:{knows:'大'}, bigWithin:4,
    cast:'You cast your line. Wait for the float to go under, then press A!', bite:'A bite! Press A!',
    missed:'Too slow: it got away! Cast again.', slipped:'It slipped off the hook! Cast again.', stop:'You reel in your line.',
    baited:'You put some {鱼饵} on your hook: a big one bites!', reel:'Reel it in!',
    small:{questions:1, pic:'小 鱼', caught:'You caught a fish! It’s little.', steps:[
      {if:{fish:'asked', holding:{fish:false}}, do:[{hold:'鱼', for:'fish'}, {message:'A {鱼} for the fisherman! Take it to him, in the village.'}]},
      {do:[{gap:{sentence:'这 是 小 鱼', en:'This is a little fish.', word:'小', others:['大'], pic:'小 鱼'}}, {message:'You let the little fish go.'}]}]},
    big:{questions:3, pic:'大 鱼', caught:'You caught a fish! It’s huge!', steps:[
      {if:{fish:'asked', holding:{fish:false}}, do:[{hold:'鱼', for:'fish'}, {message:'A big {鱼} for the fisherman! Take it to him, in the village.'}]},
      {do:[{gap:{sentence:'这 是 大 鱼', en:'This is a big fish.', word:'大', others:['小'], pic:'大 鱼'}}, {coins:1, note:'You sell the big fish at the market: +1 🪙', if:{knows:'钱'}}, {message:'You let the big fish go.', if:{new:'钱'}}]}]}
  },

  // Food you carry in your bag: Flower Fruit Mountain's, and the human world's.
  food: {
    '桃子': {heal:10, carry:3, does:'Brings back 10 health'},
    '苹果': {helps:true, carry:3, does:'Takes away a wrong answer'},
    '蜂蜜': {fast:60, carry:2, does:'Walk faster for a minute'},
    '饭': {helps:true, carry:2, does:'Takes away a wrong answer'},
    '包子': {helps:true, carry:3, does:'Takes away a wrong answer'}
  },

  events: [
    {if:{landed:0}, do:LANDING},   // (the page closed before the landing was over)
    // dressed: the fishermen come out of their hut again
    {if:{dressed:2, back:0}, do:[{set:{back:1}}, {sound:'chime'},
      {message:'The fishermen come out of their hut. They don’t run away now: in a coat and hat, you look just like a person!'}]},
    // on the road through the fields, the dog stops you, guarding it
    {if:{place:'fields', dogStop:0, friends:{dog:false}, wordReady:true, around:[24, 5, 'fields', 1]}, do:[{set:{dogStop:1}}, {stopsYou:'dog'}]},
    // at the top of the stone steps on the far shore: the way on up the mountain, to the immortal (chapter 1, still to come)
    {if:{place:'farShore', stepsTop:0, around:[12, 1, 'farShore', 1]}, do:[{set:{stepsTop:1}},
      {message:'The path goes on up the mountain, to where the immortal lives. That’s chapter 1, still to come!'}]},
    // years go by in the town, once you know its words: you live among people, learning to talk like them, but nobody is
    // looking for the immortals (a match game of the town's and the village's words)
    {if:{townWords:11, years:0, wordReady:true, friends:{cat:true}}, do:[{set:{years:1}}, {scene:'yearsPass'},
      {match:'Years among people', stop:'Not now', words:['人', '衣服', '帽子', '井', '房子', '门', '鸡', '饭', '钱', '网', '船', '狗', '包子', '鞋', '茶', '孩子', '书', '猫']},
      {message:'Years go by. You can talk like people now, but nobody here knows where the immortals are. Across the bridge, at the harbour, a boatman sails west…'}]}
  ],

  // The places: the shore where you land, the fishing village above it, the fields east of that, the market town, its
  // harbour, and across the western sea, the far shore. Each in the human world's own look (decided 4 November 2026:
  // ground people have made, earth and flagstones; bamboo, white walls and dark tiles, mud-brick and thatch; a canal).
  places: {
    shore: {
      name: {zh:'海边', py:'hǎibiān', en:'The shore'},
      music: 'village',   // the human world's song (js/sound.js), not Flower Fruit Mountain's
      onMap: [46, 132],
      sounds: ['wind', 'birds'],
      exits: [
        {at:[12, 0], to:'village', arrive:[11, 14], facing:'up', if:{dressed:2}, closed:'People run from a monkey! Find something to wear first.'},
        {at:[13, 0], to:'village', arrive:[12, 14], facing:'up', if:{dressed:2}, closed:'People run from a monkey! Find something to wear first.'}
      ],
      map: [
        "bbbbbbbbbbbb..bbbbbbbbbbbb",
        "b,,UUUU,,,,,..,,,,,,rr,,,b",
        "b,,UUUU,p,,,..,,,,j,,,,,,b",
        "b,,,..,,,,,,..,,,,,,,,,,,b",
        "kssssssssssssssssssssssssk",
        "ksNsssNsssssssssssssssNssk",
        "kssssssssssssssssssssssssk",
        "kssssssssssssssssssssssssk",
        "ksssssssksssssssssssЖssssk",
        "kssssssssssssssssssssssssk",
        "kssssssssssssssssssssssЗsk",
        "kssksssssssssssssskssssssk",
        "mmmmBBmmmmmmФФmmmmmmBBmmmm",
        "mmmmmmmmmmmmmmmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmmmmmmmmmmmm"
      ]
    },
    village: {
      name: {zh:'渔村', py:'yúcūn', en:'The fishing village'},
      music: 'village',
      onMap: [46, 104],
      sounds: ['birds'],
      exits: [
        {at:[11, 15], to:'shore', arrive:[12, 1], facing:'down'},
        {at:[12, 15], to:'shore', arrive:[13, 1], facing:'down'},
        {at:[27, 6], to:'fields', arrive:[1, 5], facing:'right', if:{villageWords:12}, closed:'Not yet: there’s more to find in the village, and on the shore. Check your tasks.'},
        {at:[27, 7], to:'fields', arrive:[1, 5], facing:'right', if:{villageWords:12}, closed:'Not yet: there’s more to find in the village, and on the shore. Check your tasks.'}
      ],
      map: [
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "b.UUUU..UUUU,,,bbHHHHHbbbbbb",
        "b.UUUUj.UUUUp....HHHHH.,,,,b",
        "b,,....q........w,,,,,w,,,,b",
        "b.LLLL...rr.....wwwzwww....b",
        "b..........................b",
        "b.,,,.......ÖÖ....,,,,,,....",
        "b...,,......ÖÖ..O...........",
        "bfffffff............,,,,,,,b",
        "bvvvvvvv............,q,,,,,b",
        "bvvv,vvv............,,,,,j,b",
        "bvvvvvvv............,,,c,,,b",
        "b,T,,,T,........T...T...T..b",
        "b~~~~~~~~~~II~~~~~~~~~~~~~~b",
        "bbbbbbbbb,b..b,,bbbbbbbbbbbb",
        "bbbbbbbbbbb..bbbbbbbbbbbbbbb"
      ]
    },
    fields: {
      name: {zh:'田边', py:'tiánbiān', en:'The fields'},
      music: 'village',
      onMap: [90, 100],
      sounds: ['birds', 'wind'],
      exits: [
        {at:[0, 5], to:'village', arrive:[26, 6], facing:'left'},
        {at:[27, 5], to:'town', arrive:[1, 5], facing:'right', if:{lunch:'done', friends:{dog:true}}, closed:'Not yet: help the farmer, and make friends with the dog, first.'}
      ],
      map: [
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "bRRRRRRRRRR,GG,RRRRRRRRRRR,b",
        "bRRRRXRRRRR,GG,RRRRRRRRRRR,b",
        "bRRRRRRRRRR,GG,RRRRRRRRRRR,b",
        "b,,T,,,,,,,,,,,,,T,,,,,,,,,b",
        "............................",
        "b,,,,T,,,,,,,,,,,,,,,T,,,,,b",
        "bRRRRRRRRRR,GG,RRRRRRRRRRR,b",
        "bRRRRRRRRRR,GG,RRRRRRXRRRR,b",
        "bRRRRRRRRRR,GG,RRRRRRRRRRR,b",
        "b,,,,,,,,,,,GG,,,,,,,,,,,,,b",
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbb"
      ]
    },
    town: {
      name: {zh:'小镇', py:'xiǎozhèn', en:'The market town'},
      music: 'village',
      onMap: [136, 102],
      sounds: ['birds'],
      exits: [
        {at:[0, 4], to:'fields', arrive:[26, 5], facing:'left'},
        {at:[0, 5], to:'fields', arrive:[26, 5], facing:'left'},
        {at:[0, 6], to:'fields', arrive:[26, 5], facing:'left'},
        {at:[19, 15], to:'harbour', arrive:[12, 1], facing:'down', if:{years:1}, closed:'Not yet: get to know the town first. Check your tasks.'},
        {at:[20, 15], to:'harbour', arrive:[13, 1], facing:'down', if:{years:1}, closed:'Not yet: get to know the town first. Check your tasks.'}
      ],
      map: [
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "bQQQQQQbbKKKKKbHHHHbbbHHHHbbbb",
        "bQQQQQQwwKKKKKwHHHHwwwHHHHwwbb",
        "bQQQQQQ##KKKKKuHHHH###HHHH###b",
        "#############################b",
        "#############################b",
        "#############################b",
        "bq###########################b",
        "b#AAA##YYY###ÖÖ####O###xq####b",
        "b############ÖÖ##########j###b",
        "b#CCC##EEE############c######b",
        "b##T#####T#####T#########T###b",
        "~~~~~~~~~~~~~~~~~~~nn~~~~~~~~~",
        "~~~~~~~~~~~~~~~~~~~nn~~~~~~~~~",
        "bbbbbbbbbbbbbbbbbbb##bbbbbbbbb",
        "bbbbbbbbbbbbbbbbbbb##bbbbbbbbb"
      ]
    },
    harbour: {
      name: {zh:'码头', py:'mǎtou', en:'The harbour'},
      music: 'village',
      onMap: [136, 128],
      sounds: ['wind', 'birds'],
      exits: [
        {at:[12, 0], to:'town', arrive:[19, 14], facing:'up'},
        {at:[13, 0], to:'town', arrive:[20, 14], facing:'up'},
        {at:[14, 8], to:'farShore', arrive:[11, 10], facing:'up', by:'A', label:'Sail', if:{boat:2}}   // (once you've crossed with the boatman)
      ],
      map: [
        "bbbbbbbbbbbb##bbbbbbbbbbbb",
        "b,HHHH,,,,,,##,,,,,HHHH,,b",
        "b,HHHH,,,x,,##,,qj,HHHH,,b",
        "b,,,,,,,,,,####,,,,,,,,,,b",
        "kssssssssssPPPsssssssssssk",
        "kssNsssssssPPPssssssssNssk",
        "kssssssssssPPPsssssssssssk",
        "mmmmmmmmmmmmPPmmmmmmmmmmmm",
        "mmmBBmmmmmmmPPVVVmmmmmmmmm",
        "mmmmmmmmmmmmPPmmmmmmBBmmmm",
        "mmmmmmmmmmmmmmmmmmmmmmmmmm"
      ]
    },
    farShore: {
      name: {zh:'西边的海边', py:'xībiān de hǎibiān', en:'The far shore'},
      music: 'village',
      onMap: [206, 40],
      sounds: ['wind', 'birds'],
      exits: [
        {at:[11, 11], to:'harbour', arrive:[13, 8], facing:'left', by:'A', label:'Sail'},
        {at:[12, 11], to:'harbour', arrive:[13, 8], facing:'left', by:'A', label:'Sail'}
      ],
      map: [
        "^^^^^^^^^^^^..^^^^^^^^^^^^",
        "^^^^^^^^^^^^..^^^^^^^^^^^^",
        "MMMMMMMMMMMM==MMMMMMMMMMMM",
        "MMMMMMMMMMMM==MMMMMMMMMMMM",
        "tttggggggJgg..ggJgggtggttt",
        "ttgggggggggg..ggggggggggtt",
        "ttgtgggggg.....ggpgtggggtt",
        "ttgggggggg.gggggggggggggtt",
        "ttggggtggg.ggggggggggtggtt",
        "kssssssssss.sssssssssssssk",
        "kssssssssssssssssssssssssk",
        "mmmmmmmmmmmBBmmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmmmmmmmmmmmm"
      ]
    }
  },

  // What each letter on the maps is (as Flower Fruit Mountain's legend). ask: a person near tells you its word when you ask
  // (这是什么？): their answer, one of the lines.
  legend: {
    '.': {look:'earth', walk:true},
    ',': {look:'lawn', walk:true},
    '#': {look:'paving', walk:true},
    's': {look:'sand', walk:true},
    'g': {look:'grass', walk:true},
    'G': {look:'tallGrass', walk:true, word:'草', animals:true},
    'm': {look:'sea', word:'海', fishing:true, note:'The sea, as far as you can see.'},
    '~': {look:'canal', word:'河', fishing:true},
    'I': {look:'slab', walk:true},
    'n': {look:'archBridge', walk:true},
    'P': {look:'pier', walk:true},
    'b': {look:'bamboo', landmark:true, onLook:[{do:[{message:'A thick grove of bamboo.'}]}]},
    'k': {look:'shoreRock', word:'石头'},
    'T': {look:'willow', word:'树'},
    't': {look:'pine', word:'树'},
    'Ö': {look:'oldTree', word:'树', note:'A big old tree, with a ring of stone round it to sit on.'},
    'U': {look:'mudHouse', word:'房子', ask:'isHouse', note:'A fisherman’s house, with mud walls and a thatched roof.'},
    'H': {look:'jHouse', word:'房子', ask:'isHouse', note:'A house with white walls and a roof of dark tiles.'},
    'Q': {look:'teahouse', landmark:true, onLook:[{if:{knows:'茶'}, do:[{card:'茶', note:'The teahouse: a red flag with 茶 on it hangs outside.'}]}, {do:[{message:'A busy house with a red flag and red lanterns. People come and go, and sit inside.'}]}]},
    'K': {look:'townSchool', word:'学校', note:'The town’s school: the board over its door says {学校}.'},
    'w': {look:'whiteWall'},
    'z': {look:'wallGate', word:'门', ask:'isDoor', note:'A wooden gate in the white wall.', onLook:[
      {if:{knows:'门', knock:0}, label:'Knock', waits:true, do:[{sound:'tock'}, {sound:'tock'}, {say:'whoIsIt', by:'auntie', teach:'谁'}, {newWord:'谁', note:'Someone behind the gate wants to know who’s there.'},
        {say:'itsMe', by:'player'}, {set:{knock:1}}, {sound:'blip'}, {say:'littleMonkey', by:'auntie'}, {reply:'你好'}]}]},
    'L': {look:'washLine', word:'衣服'},
    'r': {look:'fishRack', word:'鱼', note:'Fish hung up to dry in the sun.'},
    'j': {look:'jars', landmark:true, onLook:[{do:[{message:'Big clay jars of water.'}]}]},
    'q': {look:'baskets', landmark:true, onLook:[{do:[{message:'Baskets, woven from bamboo.'}]}]},
    'p': {look:'woodpile', word:'木头'},
    'c': {look:'cart', landmark:true, onLook:[{do:[{message:'A handcart, full of vegetables.'}]}]},
    'x': {look:'sacks', landmark:true, onLook:[{do:[{message:'Sacks of rice.'}]}]},
    'f': {look:'bambooFence'},
    'v': {look:'veg', landmark:true, onLook:[{do:[{message:'Rows of green vegetables, growing behind a bamboo fence.'}]}]},
    'O': {look:'well', word:'井', ask:'isWell', note:'A deep stone well, where the village gets its water.'},
    'N': {look:'netRack', word:'网', ask:'isNet', note:'A fishing net, hung up to dry.'},
    'B': {look:'boat', word:'船', ask:'isBoat', note:'A little fishing boat, with a woven roof.'},
    'V': {look:'bigBoat', word:'船', note:'A big boat with a sail, to cross the sea.'},
    'R': {look:'rice', landmark:true, onLook:[{do:[{message:'Young rice, growing in muddy water.'}]}]},
    'X': {look:'scarecrow', landmark:true, onLook:[{do:[{message:'A scarecrow, in a straw hat. The birds don’t seem scared of it.'}]}]},
    'A': {look:'stallBuns', landmark:true, onLook:[{do:[{message:'A stall of steamed buns, with a sign: 包子.'}]}]},
    'Y': {look:'stallShoes', landmark:true, onLook:[{do:[{message:'A stall of shoes.'}]}]},
    'C': {look:'stallFruit', landmark:true, onLook:[{do:[{message:'A stall of fruit and vegetables.'}]}]},
    'E': {look:'stallChanger', landmark:true, onLook:[{do:[{message:'The money changer’s table, with strings of coins.'}]}]},
    'u': {look:'bookTable', word:'书', ask:'isBook', note:'Books, on a table by the school.'},
    'Ж': {look:'coatOnSand', landmark:true, onLook:[{if:{dressed:0}, label:'Pick up', waits:true, do:[{newWord:'衣服', note:'The old man’s coat: you put it on!'},
      {wear:'衣服'}, {change:'s'}, {set:{dressed:1}}, {message:'You put on the coat. But people would still know you’re a monkey…'}]}]},
    'З': {look:'hatOnSand', landmark:true, onLook:[{if:{dressed:1}, label:'Pick up', waits:true, do:[{newWord:'帽子', note:'A straw hat: you put it on, and it hides your ears!'},
      {wear:'帽子'}, {change:'s'}, {set:{dressed:2}}]},
      {do:[{message:'A straw hat, blowing along the sand.'}]}]},
    'Ф': {look:'raft', word:'木筏', landmark:true, onLook:[{do:[{card:'木筏', note:'Your raft, washed up on the sand. It won’t sail again: the sea has broken it up.'}]}]},
    'J': {look:'stump', landmark:true, onLook:[{do:[{message:'A tree stump, where the woodcutter chops his wood.'}]}]},
    '^': {look:'heights', word:'山'},
    'M': {look:'cliffFace', word:'山'},
    '=': {look:'steps', walk:true}
  },

  voices: {words:{provider:'google', name:'cmn-CN-Standard-A'}, everyone:{name:'zh-CN-YunxiNeural', style:'chat'}},

  // People (person: drawn as a person; palette: o outline, h hair, s skin, e eyes, m mouth, c clothes, b belt, p trousers,
  // and a, d a straw hat), and animals that aren't friends to make (look: a word's map sprite).
  characters: [
    // the shore: fishermen mending their nets, who run off into their hut when they see a monkey, and stay there till
    // you're dressed (moves: hidden in their hut)
    {id:'fisher1', person:true, x:3, y:6, facing:'right', name:{zh:'渔夫', py:'yúfū', en:'Fisherman'}, moves:[{if:{landed:1, dressed:{below:2}}, place:'hut', x:0, y:0}],
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#4F78A8', b:'#3A2A1E', p:'#34404E', a:'#D9B866', d:'#A88A3E'}},
    {id:'fisher2', person:true, x:6, y:10, facing:'down', name:{zh:'渔夫', py:'yúfū', en:'Fisherman'}, moves:[{if:{landed:1, dressed:{below:2}}, place:'hut', x:0, y:0}],
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E8BC90', e:'#1E140C', m:'#C4826A', c:'#6E8F5E', b:'#3A2A1E', p:'#3A3A30', a:'#D9B866', d:'#A88A3E'}},
    {id:'oldFisher', person:true, x:21, y:6, facing:'left', name:{zh:'老渔夫', py:'lǎo yúfū', en:'Old fisherman'}, moves:[{if:{landed:1, dressed:{below:2}}, place:'hut', x:0, y:0}],
      palette:{o:'#3A2A1E', h:'#DADADA', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#E8DCC4', b:'#3A2A1E', p:'#3E3A34'}},
    // the village
    {id:'child', place:'village', person:true, small:true, x:11, y:5, facing:'right', name:{zh:'小孩', py:'xiǎohái', en:'Child'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#E8A33C', b:'#3A2A1E', p:'#5A4632'}},
    {id:'granny', place:'village', person:true, x:17, y:7, facing:'left', name:{zh:'老奶奶', py:'lǎo nǎinai', en:'Granny'},
      palette:{o:'#3A2A1E', h:'#E8E8E8', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#6A5A8A', b:'#3A2A1E', p:'#3A3446'}},
    {id:'fisherman', place:'village', person:true, x:9, y:5, facing:'up', name:{zh:'渔夫', py:'yúfū', en:'Fisherman'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E8BC90', e:'#1E140C', m:'#C4826A', c:'#3E5A86', b:'#3A2A1E', p:'#34404E', a:'#D9B866', d:'#A88A3E'}},
    // the woman of the white house, inside till you knock at its gate (moves: inside her house)
    {id:'auntie', place:'village', person:true, x:20, y:5, facing:'down', name:{zh:'阿姨', py:'āyí', en:'Auntie'}, moves:[{if:{knock:0}, place:'house', x:0, y:0}],
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#C0504D', b:'#3A2A1E', p:'#4A3A3A'}},
    {id:'villager', place:'village', person:true, x:8, y:10, facing:'down', name:{zh:'村民', py:'cūnmín', en:'Villager'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#7A5A8A', b:'#3A2A1E', p:'#3A3446'}},
    {id:'hen1', place:'village', look:'鸡', x:5, y:6, facing:'left'},
    {id:'hen2', place:'village', look:'鸡', x:7, y:7, facing:'right'},
    // the fields: the farmer in his straw hat, a water buffalo, and birds eating his rice (shoo them off)
    {id:'farmer', place:'fields', person:true, x:7, y:4, facing:'down', name:{zh:'农民', py:'nóngmín', en:'Farmer'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E0B088', e:'#1E140C', m:'#C4826A', c:'#8A7A5A', b:'#3A2A1E', p:'#4A4434', a:'#D9B866', d:'#A88A3E'}},
    {id:'buffalo', place:'fields', look:'水 牛', x:20, y:10, facing:'left'},
    {id:'bird1', place:'fields', look:'bird', colour:'红色', pecks:true, x:6, y:3, facing:'left', shoo:'The bird flies off the rice ({birdsShooed}/3).'},
    {id:'bird2', place:'fields', look:'bird', colour:'黄色', pecks:true, x:18, y:3, facing:'left', shoo:'The bird flies off the rice ({birdsShooed}/3).'},
    {id:'bird3', place:'fields', look:'bird', colour:'白色', pecks:true, x:23, y:7, facing:'right', shoo:'The bird flies off the rice ({birdsShooed}/3).'},
    // the town: stallholders, the money changer, the teahouse's keeper and its storyteller, the teacher, children, people
    {id:'changer', place:'town', person:true, x:10, y:10, facing:'down', name:{zh:'换钱的', py:'huàn qián de', en:'Money changer'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#8A6E2E', b:'#3A2A1E', p:'#3A3020'}},
    {id:'fruitSeller', place:'town', person:true, x:5, y:10, facing:'down', name:{zh:'老板', py:'lǎobǎn', en:'Stallholder'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#C7902F', b:'#3A2A1E', p:'#3A2A22'}},
    {id:'bunSeller', place:'town', person:true, x:5, y:8, facing:'down', name:{zh:'老板', py:'lǎobǎn', en:'Stallholder'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#B5462E', b:'#3A2A1E', p:'#3A2A22'}},
    {id:'shoeSeller', place:'town', person:true, x:10, y:8, facing:'down', name:{zh:'老板', py:'lǎobǎn', en:'Stallholder'},
      palette:{o:'#3A2A1E', h:'#555555', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#3E7A8A', b:'#3A2A1E', p:'#2A3A40'}},
    {id:'teaKeeper', place:'town', person:true, x:2, y:4, facing:'down', name:{zh:'茶馆老板', py:'cháguǎn lǎobǎn', en:'Teahouse keeper'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#2F4E78', b:'#3A2A1E', p:'#2A303A'}},
    {id:'teller', place:'town', person:true, x:5, y:4, facing:'down', name:{zh:'说书人', py:'shuōshūrén', en:'Storyteller'},
      palette:{o:'#3A2A1E', h:'#E0E0E0', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#5A6A4A', b:'#3A2A1E', p:'#2E3428'}},
    {id:'teacher', place:'town', person:true, x:12, y:4, facing:'down', name:{zh:'老师', py:'lǎoshī', en:'Teacher'},
      palette:{o:'#3A2A1E', h:'#3A3A3A', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#5E3B22', b:'#3A2A1E', p:'#2E2A26'}},
    {id:'pupil1', place:'town', person:true, small:true, x:10, y:5, facing:'up', name:{zh:'学生', py:'xuésheng', en:'Pupil'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#4F78A8', b:'#3A2A1E', p:'#34404E'}},
    {id:'pupil2', place:'town', person:true, small:true, x:13, y:5, facing:'up', name:{zh:'学生', py:'xuésheng', en:'Pupil'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#5FA36B', b:'#3A2A1E', p:'#3A4A5A'}},
    {id:'walker1', place:'town', person:true, x:17, y:5, facing:'right', name:{zh:'路人', py:'lùrén', en:'Passer-by'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#A8584E', b:'#3A2A1E', p:'#3E3430'}},
    {id:'walker2', place:'town', person:true, x:22, y:6, facing:'left', name:{zh:'路人', py:'lùrén', en:'Passer-by'},
      palette:{o:'#3A2A1E', h:'#555555', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#3E5A86', b:'#3A2A1E', p:'#2A303A'}},
    {id:'porter', place:'town', person:true, x:25, y:5, facing:'down', name:{zh:'路人', py:'lùrén', en:'Passer-by'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E0B088', e:'#1E140C', m:'#C4826A', c:'#8A7A5A', b:'#3A2A1E', p:'#4A4434', a:'#D9B866', d:'#A88A3E'}},
    // the harbour: the boatman, by his big boat, and a goose on the sand
    {id:'boatman', place:'harbour', person:true, x:13, y:9, facing:'up', name:{zh:'船夫', py:'chuánfū', en:'Boatman'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E0B088', e:'#1E140C', m:'#C4826A', c:'#4A5A7A', b:'#3A2A1E', p:'#2A303A', a:'#D9B866', d:'#A88A3E'}},
    {id:'harbourGoose', place:'harbour', look:'鹅', x:20, y:5, facing:'left'},
    // the far shore: the woodcutter, singing as he chops wood
    {id:'woodcutter', place:'farShore', person:true, x:15, y:5, facing:'left', name:{zh:'樵夫', py:'qiáofū', en:'Woodcutter'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E0B088', e:'#1E140C', m:'#C4826A', c:'#6E5B3A', b:'#3A2A1E', p:'#3A3226', a:'#D9B866', d:'#A88A3E'}}
  ],
  yourNames: [{if:{}, zh:'美猴王', py:'Měi Hóuwáng', en:'Handsome Monkey King (you)'}],

  // (no sign of its own: the human world's signs are the stalls' and the teahouse's)
  sign: {name:{zh:'牌子', py:'páizi', en:'Sign'}, says:{zh:'海', en:'The sea'}, hint:''},
  spots: [],
  bigSparkles: {dressed:0},
  sparkles: [
    {word:'衣服', at:[20, 8]}, {word:'帽子', at:[23, 10]},
    {word:'井', at:[16, 7, 'village'], if:{knows:'什么'}}, {word:'房子', at:[9, 2, 'village'], if:{knows:'什么'}},
    {word:'门', at:[19, 4, 'village'], if:{knows:'什么'}},
    {word:'网', at:[2, 5], if:{knows:'什么'}}, {word:'船', at:[4, 12], if:{knows:'什么'}},
    {word:'书', at:[14, 3, 'town'], if:{knows:'什么'}}
  ],
  // Where you found each word, on its page in the Word Scroll.
  found: {
    '人': 'The fishermen on the shore, the first people you saw.',
    '鹅': 'Waddling about on the sand, where you landed.',
    '衣服': 'The old fisherman’s coat, dropped on the sand.',
    '帽子': 'The old fisherman’s straw hat, blowing along the sand.',
    '不': 'The child in the village: 你不是人！ (You’re not a person!)',
    '是': 'The child’s game in the village: 是不是？ (Is it or isn’t it?)',
    '什么': 'The child in the village, pointing at the well: 这是什么？',
    '井': 'The well in the middle of the village, from the granny.',
    '房子': 'The houses in the village.',
    '门': 'The gate in the white wall, in the village.',
    '谁': 'Knocking on the gate in the white wall: 谁啊？ (Who is it?)',
    '鸡': 'In the yard in the village.',
    '饭': 'The granny’s lunch: 吃饭吧！',
    '钱': 'The fisherman paid you for a fish.',
    '网': 'The fishermen’s nets, drying on the shore.',
    '船': 'The fishermen’s boats, on the shore.',
    '看': 'The farmer, showing you the birds in his rice: 你看！',
    '狗': 'Guarding the road through the fields.',
    '买': 'The fruit stall at the market: 你要买什么？',
    '包子': 'The bun stall at the market.',
    '鞋': 'The shoe stall at the market.',
    '茶': 'The teahouse in the town: 喝茶吧！',
    '说': 'The storyteller in front of the teahouse: 我说，你听。',
    '哪里': 'Asking the storyteller where the immortals are.',
    '听': 'The teacher at the town’s school: 你听！',
    '孩子': 'The children at the town’s school.',
    '学': 'The children learning at the town’s school.',
    '书': 'The books on the table by the town’s school.',
    '猫': 'On the sacks at the market.',
    '风': 'The boatman at the harbour, waiting for the wind.',
    '歌': 'The woodcutter’s song, on the far shore.'
  },
  // Sentences for practising words without pictures (as Flower Fruit Mountain's). Like those, each needs every word in it caught.
  practiceSentences: [
    {sentence:'我 不 是 鱼', sentenceEn:'I’m not a fish.'},
    {sentence:'这 是 井', sentenceEn:'This is a well.'},
    {sentence:'这 是 什么', sentenceEn:'What’s this?'},
    {sentence:'你 是 谁', sentenceEn:'Who are you?'},
    {sentence:'你 看 鸟', sentenceEn:'Look at the birds.'},
    {sentence:'我 要 买 包子', sentenceEn:'I want to buy a steamed bun.'},
    {sentence:'我 说 你 听', sentenceEn:'I talk, you listen.'},
    {sentence:'神仙 在 哪里', sentenceEn:'Where are the immortals?'},
    {sentence:'我们 在 学', sentenceEn:'We’re learning.'}
  ],
  // Example sentences for words, on their Word Scroll pages.
  examples: {
    '鹅': {zh:'鹅 在 水 里 。', en:'The goose is in the water.'},
    '鸡': {zh:'鸡 吃 草 。', en:'Chickens eat grass.'},
    '狗': {zh:'狗 是 我 的 朋友 。', en:'The dog is my friend.'},
    '猫': {zh:'猫 很 小 。', en:'The cat is very small.'}
  },
  enemies: {},
  battles: {},
  fish: [[6, 13], [16, 14], [22, 13], [5, 12, 'farShore'], [18, 11, 'farShore']],
  dragonflies: [{at:[3, 12, 'village'], to:[8, 13]}, {at:[18, 12, 'village'], to:[24, 13]}],

  // The area's animals, friends to make with their word games, as on Flower Fruit Mountain. waits: the first time, its
  // word (new) waits for a little practice, as a character's does (practiseFirst, js/world.js).
  animals: [
    {id:'goose', word:'鹅', waits:true, at:[5, 10], home:'海', clue:'The shore, on the sand', meetNote:'A goose waddles up to you on the sand, honking. Answer its questions to make friends.'},
    {id:'chicken', word:'鸡', waits:true, at:[22, 9, 'village'], home:'草', clue:'The village, in the yard', meetNote:'A chicken pecks about in the yard. Answer its questions to make friends.'},
    {id:'dog', word:'狗', waits:true, at:[24, 4, 'fields'], home:'草', clue:'The fields, by the road', meetNote:'A dog guards the road, barking at you! Answer its questions to make friends.'},
    {id:'cat', word:'猫', waits:true, at:[23, 8, 'town'], perch:3, home:'房子', clue:'The town, at the market', meetNote:'A cat is curled up on the sacks at the market. Answer its questions to make friends.'}
  ],
  birds: {word:'鸟', note:'A little bird hops about, looking for something to eat.', colours:['红色', '黄色', '白色', '黑色', '蓝色', '绿色', '棕色', '橙色', '粉色']},
  hidden: [
    {id:'shoreRock2', at:[8, 8], shells:2, note:'Washed up behind a rock on the sand: 2 🐚!'},
    {id:'villageJars', at:[25, 10, 'village'], fruit:'苹果', note:'Tucked behind the jars: a {苹果} for your bag!'},
    {id:'townSacks', at:[1, 7, 'town'], fruit:'桃子', note:'In a basket that nobody wants: a {桃子} for your bag!'}
  ],
  animalsAppear: {knows:'动物'},
  animalsPlay: {say:'play', hint:'It wants to play! Answer its questions to make friends.', friendHint:'Your {朋友} wants to play again! Answer its questions.'},
  tips: {},
  questions: ['listen', 'read', 'gap'],

  // Clothes: Flower Fruit Mountain's headbands, and the human world's coat, hat and shoes. on: where it goes, one thing
  // at a time there (the hat or a headband).
  wardrobe: [
    ...FLOWER_FRUIT_MOUNTAIN.wardrobe,
    {item:'衣服', on:'body', sentence:'这 是 我 的 衣服', sentenceEn:'These are my clothes.'},
    {item:'帽子', on:'head', sentence:'我 戴 帽子', sentenceEn:'I wear my hat.', teach:'戴', note:'Use 戴 for things you wear on your head.'},
    {item:'鞋', on:'feet', sentence:'这 是 我 的 鞋', sentenceEn:'These are my shoes.'}
  ],

  lines: {
    hi: {zh:'你好 ！', en:'Hello!'},
    thanks: {zh:'谢谢 ！', en:'Thank you!'},
    welcome: {zh:'不客气 ！', en:'You’re welcome!'},
    noProblem: {zh:'没关系 ！', en:'It doesn’t matter!'},
    play: {zh:'我们 玩 吧 ！', en:'Let’s play!'},
    // (drafts, not checked yet: see CHINESE.md)
    monkeyMonkey: {zh:'猴子 ！ 猴子 ！', en:'A monkey! A monkey!'},
    myClothes: {zh:'这 是 我 的 衣服 ！', en:'Those are my clothes!'},
    whoAreYou: {zh:'你 是 谁 ？', en:'Who are you?'},
    notPerson: {zh:'你 不 是 人 ！ 你 是 猴子 ！', en:'You’re not a person! You’re a monkey!'},
    whatsThis: {zh:'这 是 什么 ？', en:'What’s this?'},
    isWell: {zh:'这 是 井 。', en:'It’s a well.'},
    isHouse: {zh:'这 是 房子 。', en:'It’s a house.'},
    isDoor: {zh:'这 是 门 。', en:'It’s a gate.'},
    isNet: {zh:'这 是 网 。', en:'It’s a net.'},
    isBoat: {zh:'这 是 船 。', en:'It’s a boat.'},
    isBook: {zh:'这 是 书 。', en:'They’re books.'},
    whoIsIt: {zh:'谁 啊 ？', en:'Who is it?'},
    itsMe: {zh:'我 ！', en:'Me!'},
    littleMonkey: {zh:'你 是 小 猴子 ！ 你好 ！', en:'You’re a little monkey! Hello!'},
    areYouHungry: {zh:'你 饿 吗 ？ 吃 饭 吧 ！', en:'Are you hungry? Have something to eat!'},
    haveFish: {zh:'你 有 鱼 吗 ？', en:'Do you have a fish?'},
    thisIsMoney: {zh:'这 是 钱 。', en:'Here’s some money.'},
    look: {zh:'你 看 ！ 鸟 ！', en:'Look! Birds!'},
    hungryFarmer: {zh:'我 饿 了 。 你 有 饭 吗 ？', en:'I’m hungry. Do you have any rice?'},
    isThisCow: {zh:'这 是 牛 吗 ？', en:'Is this a cow?'},
    yes: {zh:'是 ！', en:'Yes!'},
    changeMoney: {zh:'你 要 换 钱 吗 ？', en:'Do you want to change money?'},
    hereMoney: {zh:'这 是 你 的 钱 。', en:'Here’s your money.'},
    whatBuy: {zh:'你 要 买 什么 ？', en:'What do you want to buy?'},
    drinkTea: {zh:'喝 茶 吧 ！', en:'Have some tea!'},
    iTalk: {zh:'我 说 ， 你 听 。', en:'I talk, you listen.'},
    whereImmortals: {zh:'神仙 在 哪里 ？', en:'Where are the immortals?'},
    dontKnow: {zh:'我 不 知道 。', en:'I don’t know.'},
    listen: {zh:'你 听 ！', en:'Listen!'},
    theyAreChildren: {zh:'他们 是 孩子 。', en:'They’re children.'},
    childrenLearn: {zh:'孩子 们 在 学 。', en:'The children are learning.'},
    noWind: {zh:'今天 没有 风 。', en:'There’s no wind today.'},
    windCame: {zh:'有 风 了 ！', en:'The wind’s come!'},
    letsGo: {zh:'我们 走 吧 ！', en:'Let’s go!'},
    immortalSong: {zh:'这 是 神仙 的 歌 。', en:'It’s the immortal’s song.'},
    immortalOnMountain: {zh:'神仙 在 山 上 ！', en:'The immortal lives up on the mountain!'}
  },

  talk: {
    fisher1: [{do:[{say:'hi'}, {reply:'你好'}]}],
    fisher2: [{do:[{say:'hi'}, {reply:'你好'}]}],
    oldFisher: [{if:{oldFisher:0}, do:[{say:'myClothes'}, {set:{oldFisher:1}}, {message:'The old fisherman laughs, and lets you keep his coat and hat.'}]},
      {do:[{say:'hi'}, {reply:'你好'}]}],
    // the child: who are you? (你是谁？ 我是＿) You're not a person! (不); then the 是不是 game (是); then what's this? (什么)
    child: [
      {if:{child:0}, waits:true, do:[{say:'whoAreYou'}, {gap:{sentence:'我 是 人', en:'I’m a person.', word:'人', others:['鱼', '鸟', '鹅']}},
        {say:'notPerson', teach:'不'}, {newWord:'不', note:'不 means not.'}, {set:{child:1}}, {message:'The child laughs. They don’t mind that you’re a monkey!'}]},
      {if:{child:1}, waits:true, do:[{say:'play'}, {newWord:'是', note:'是 means is, or yes. 不是 means isn’t, or no.'},
        {isIt:4}, {set:{child:2}}, {message:'The child claps. You’re good at this game!'}]},
      {if:{child:2}, waits:true, do:[{say:'whatsThis', teach:'什么'}, {newWord:'什么', note:'什么 means what. 这是什么？ means What’s this?'}, {set:{child:3}},
        {message:'Now you can ask what things are! Face something that sparkles ✨ with a person near, and press A.'}]},
      {do:[{say:'play'}, {isIt:4}]}
    ],
    granny: [
      {if:{child:{below:3}}, do:[{say:'hi'}, {reply:'你好'}]},
      {if:{new:'饭'}, waits:true, do:[{say:'areYouHungry', teach:'饭'}, {newWord:'饭', note:'饭 is rice, or a meal.'},
        {bag:'饭', note:'The granny gives you a bowl of {饭|rice} for your bag. In a word game, eat it to take away a wrong answer.'}, {reply:'谢谢'}]},
      {if:{inBag:{'饭':false}}, do:[{say:'areYouHungry'}, {bag:'饭', note:'The granny gives you another bowl of {饭|rice}.'}, {reply:'谢谢'}]},
      {do:[{say:'hi'}, {reply:'你好'}]}
    ],
    fisherman: [
      {if:{child:{below:3}}, do:[{say:'hi'}, {reply:'你好'}]},
      {if:{fish:'asked', holding:{fish:true}}, waits:true, do:[{request:'fish'}]},   // (钱 comes as he pays you: practise first)
      {if:{fish:'not asked'}, do:[{request:'fish'}]},
      {if:{fish:'asked'}, do:[{request:'fish'}]},
      {do:[{say:'hi'}, {reply:'你好'}]}
    ],
    auntie: [{do:[{say:'littleMonkey'}]}],
    villager: [{do:[{say:'hi'}, {reply:'你好'}]}],
    hen1: [{if:{new:'鸡'}, do:[{message:'A chicken pecks at the ground, clucking. Another one in the yard wants to play!'}]},
      {do:[{gap:{sentence:'这 是 鸡', en:'This is a chicken.', word:'鸡', others:['鹅', '鱼', '猫'], pic:'鸡'}}]}],
    hen2: [{if:{new:'鸡'}, do:[{message:'A chicken pecks at the ground, clucking. Another one in the yard wants to play!'}]},
      {do:[{gap:{sentence:'这 是 鸡', en:'This is a chicken.', word:'鸡', others:['鹅', '鱼', '猫'], pic:'鸡'}}]}],
    // the farmer: look, birds! (看); shoo them off his rice; then he's hungry (his lunch, from your bag)
    farmer: [
      {if:{farmer:0}, waits:true, do:[{say:'look', teach:'看'}, {newWord:'看', note:'看 means to look.'}, {set:{farmer:1}},
        {message:'Birds are eating the farmer’s rice! Shoo them off: walk up to each one, and press A.'}]},
      {if:{farmer:1, birdsShooed:{below:3}}, do:[{say:'look'}, {message:'Shoo the birds off the rice ({birdsShooed}/3).'}]},
      {if:{lunch:'not asked'}, do:[{request:'lunch'}]},
      {if:{lunch:'asked'}, do:[{request:'lunch'}]},
      {do:[{say:'hi'}, {reply:'你好'}]}
    ],
    buffalo: [{do:[{say:'isThisCow', by:'player'}, {say:'yes', by:'farmer'}, {message:'A water buffalo: a big grey cow that works in the rice fields.'}]}],
    // the town
    changer: [
      {if:{exchanged:0}, do:[{say:'changeMoney'}, {exchange:true}, {say:'hereMoney'}, {set:{exchanged:1}}, {reply:'谢谢'}]},
      {do:[{say:'changeMoney'}, {exchange:true}]}
    ],
    fruitSeller: [{if:{new:'买'}, waits:true, do:[{shop:'fruit'}]}, {do:[{shop:'fruit'}]}],
    bunSeller: [{if:{new:'买'}, do:[{say:'hi'}, {message:'The bun seller is busy. Try the fruit stall first!'}]},
      {if:{new:'包子'}, waits:true, do:[{shop:'buns'}]}, {do:[{shop:'buns'}]}],
    shoeSeller: [{if:{new:'买'}, do:[{say:'hi'}, {message:'The shoe seller is busy. Try the fruit stall first!'}]},
      {if:{new:'鞋'}, waits:true, do:[{shop:'shoes'}]}, {do:[{shop:'shoes'}]}],
    teaKeeper: [
      {if:{new:'茶'}, waits:true, do:[{say:'drinkTea', teach:'茶'}, {newWord:'茶', note:'A cup of hot green tea, in the teahouse.'}, {rest:true}, {reply:'谢谢'}]},
      {do:[{say:'drinkTea'}, {rest:true}, {message:'You sit down and drink a cup of tea.'}]}
    ],
    teller: [
      {if:{new:'说'}, waits:true, do:[{say:'iTalk', teach:'说'}, {newWord:'说', note:'说 means to say, or to talk.'}, {message:'The storyteller tells stories in front of the teahouse. People stop to listen.'}]},
      {if:{new:'哪里'}, waits:true, do:[{say:'whereImmortals', by:'player', teach:'哪里'}, {newWord:'哪里', note:'哪里 means where.'}, {say:'dontKnow'},
        {message:'The storyteller knows lots of stories, but not where the immortals live.'}]},
      {do:[{say:'iTalk'}]}
    ],
    teacher: [
      {if:{new:'听'}, waits:true, do:[{say:'listen', teach:'听'}, {newWord:'听', note:'听 means to listen.'}, {message:'Inside the school, children are reading aloud together.'}]},
      {if:{new:'孩子'}, waits:true, do:[{say:'theyAreChildren', teach:'孩子'}, {newWord:'孩子', note:'孩子 means child, or children.'}]},
      {if:{new:'学'}, waits:true, do:[{say:'childrenLearn', teach:'学'}, {newWord:'学', note:'学 means to learn.'}]},
      {do:[{say:'listen'}]}
    ],
    pupil1: [{do:[{say:'hi'}, {reply:'你好'}]}],
    pupil2: [{do:[{say:'hi'}, {reply:'你好'}]}],
    walker1: [{do:[{say:'hi'}, {reply:'你好'}]}],
    walker2: [{do:[{say:'hi'}, {reply:'你好'}]}],
    porter: [{do:[{say:'hi'}, {reply:'你好'}]}],
    // the harbour: no wind today (风); once you've practised a little, the wind comes, and he takes you across for your fare
    boatman: [
      {if:{years:0}, do:[{say:'hi'}, {reply:'你好'}]},
      {if:{boat:0}, waits:true, do:[{say:'noWind', teach:'风'}, {newWord:'风', note:'风 means wind. Without it, the boat can’t sail.'}, {set:{boat:1}},
        {message:'No wind today: the boat can’t sail. Practise a little, then come back.'}]},
      {if:{boat:1}, waits:true, do:[{sound:'wind'}, {say:'windCame'}, {pay:5, note:'You give the boatman 5 🪙 for your fare.'}, {say:'letsGo'},
        {scene:'crossSea'}, {set:{boat:2}}, {goTo:'farShore', at:[11, 10], facing:'up'}]},
      {do:[{say:'hi'}, {reply:'你好'}]}
    ],
    harbourGoose: [{do:[{gap:{sentence:'这 是 鹅', en:'This is a goose.', word:'鹅', others:['鸡', '鱼', '狗'], pic:'鹅'}}]}],
    // the far shore: the woodcutter's song (歌), the immortal's; and where the immortal lives
    woodcutter: [
      {if:{song:0}, waits:true, do:[{sound:'chime'}, {say:'immortalSong', teach:'歌'}, {newWord:'歌', note:'歌 means song. The woodcutter learned it from the immortal!'},
        {say:'immortalOnMountain'}, {set:{song:1, done:true}}, {areaEnd:true}]},
      {do:[{say:'immortalOnMountain'}]}
    ]
  },

  story: [],
  storyQuestions: [],
  storyEnd: {title:'', reward:0, rumble:false, text:[]},
  exit: {notReady:'Not yet.', ready:'Ready.', tryAgain:'Try again.', passButton:'OK', failButton:'OK', done:'Done.', notBuilt:'Not built yet.', returnTo:{x:13, y:11, facing:'up'}},   // (no word test at its end: the woodcutter's song ends the prologue)

  // No opening of its own: you arrive (the drift scene, in begin).
  intro: [],
  scenes: {
    // your raft drifts across the sea for days, and washes up on a sandy shore
    drift: {watch:'Watch the raft drifting', when:{landed:1}, captions: [
      {at:0, zh:'木筏 在 海 上 。', en:'The raft is out on the sea.'},
      {at:4, zh:'有 山 ！ 有 树 ！', en:'Mountains! Trees!'},
      {at:7.5, zh:'有 人 ！', en:'People!'}
    ]},
    // years go by in the town, among people
    yearsPass: {watch:'Watch the years go by', when:{years:1}, captions: [
      {at:0, zh:'小 猴子 看 ， 小 猴子 听 。', en:'The little monkey watches, and listens.'},
      {at:4, zh:'小 猴子 学 说 话 。', en:'The little monkey learns to talk like people.'},
      {at:8, zh:'神仙 在 哪里 ？ 我 不 知道 。', en:'Where are the immortals? Nobody knows.'}
    ]},
    // across the western sea, in the boatman's big boat
    crossSea: {watch:'Watch the crossing', when:{boat:2}, captions: [
      {at:0, zh:'有 风 了 ！', en:'The wind’s come!'},
      {at:4, zh:'船 在 海 上 走 。', en:'The boat sails over the sea.'},
      {at:8, zh:'有 山 ！', en:'Mountains!'}
    ]}
  }
};
