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
  start: {x:11, y:16, facing:'up'},

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
  progress: {chapter:0, landed:0, dressed:0, back:0, oldFisher:0, child:0, knock:0, farmer:0, dogStop:0, exchanged:0, years:0, boat:0, song:0, stepsTop:0, cargo:0, hen1:0, hen2:0, hen3:0, hen4:0, hensDone:0, planter:0},

  // Numbers that text can show as {name}, and that an if can check (as Flower Fruit Mountain's).
  counters: {
    // the village's words, which the road east waits for (the shore's net and boat too)
    villageWords: {count:'known', words:['不', '是', '什么', '井', '房子', '门', '谁', '鸡', '饭', '钱', '网', '船'],
      called:{'井':'the well', '房子':'a house', '门':'the gate in the white wall', '网':'the fishermen’s nets', '船':'their boats', '鸡':'a chicken', '谁':'who’s at the gate'}},
    askedWords: {count:'known', words:['井', '房子', '门', '网', '船']},   // the things you ask people about in the village and on the shore
    birdsShooed: {count:'shooed'},   // the birds you've shooed off the farmer's rice
    pierCaught: {count:'picked', request:'pierFish'},   // fish caught for the fishermen's basket (three)
    hensBack: {count:'flags', keys:['hen1', 'hen2', 'hen3', 'hen4']},   // the hens you've carried back to their yard
    cargoCarried: {count:'picked', request:'cargo'},   // the sacks you've carried onto the boat at the harbour (four)
    // the town's words, which the years passing wait for
    townWords: {count:'known', words:['买', '包子', '鞋', '茶', '说', '哪里', '听', '孩子', '学', '书', '猫']},
    coins: {count:'coins'}
  },

  // After any new word, the next waits till you've answered this many more questions, anywhere: a talk part, a square's
  // steps, asking about something or an animal you haven't met (waits) offers a quick word game first (as on Flower Fruit
  // Mountain, where it's 4). 6 here (decided 4 November 2026, for the plan's pacing: about 7 questions for each new word,
  // with the animals' games, the child's and the gaps you fill).
  wordGap: {questions:5, word:'人', yes:'Quick game', ask:'Something new is coming, after a little more practice: {left} more questions. Fishing, the stepping stones and your friends in the long grass all count. Or play a quick word game now?', notYet:'Learn a few more words first, then come back.'},
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
    {id:'a2coat', if:{landed:1, dressed:0}, text:'The old man dropped something on the sand as he ran: go and find it', arrow:[23, 10]},
    {id:'a2goose', if:{landed:1, friends:{goose:false}}, text:'Make {朋友|friends} with the goose on the sand', arrow:[8, 12]},
    {id:'a2hat', if:{dressed:1}, text:'Something else is blowing along the sand: pick it up too', arrow:[30, 13]},
    {id:'a2pier', if:{pierFish:'asked', holding:{pierFish:false}}, text:'Catch three {鱼|fish} for the fishermen: fish off the pier with your {鱼竿} ({pierCaught}/3)', arrow:[18, 20]},
    {id:'a2pierBack', if:{pierFish:'asked', holding:{pierFish:true}}, text:'Take the {鱼|fish} to the fisherman on the pier', arrow:'fisher1'},
    {id:'a2village', if:{dressed:2, child:0}, text:'Go up the {路|path} to the village', arrow:'child'},
    {id:'a2child', if:{child:{atLeast:1, below:3}}, text:'The {孩子|child} in the village wants to play again', arrow:'child'},
    {id:'a2ask', if:{child:3, askedWords:{below:5}}, text:'Ask {人|people} about things ({askedWords}/5): face something that sparkles ✨ with someone near, and press A. Still to find: {left:askedWords}.', arrow:{sparkle:true}},
    {id:'a2knock', if:{knows:'门', knock:0}, text:'Knock on the {门} in the white wall', arrow:[31, 4, 'village']},
    {id:'a2fishAsk', if:{fish:'asked', holding:{fish:false}}, text:'Catch a {鱼} for the fisherman: face the sea or the stream with your {鱼竿}, and press A'},
    {id:'a2fishBack', if:{fish:'asked', holding:{fish:true}}, text:'Take the {鱼} to the fisherman in the village', arrow:'fisherman'},
    {id:'a2chicken', if:{child:3, friends:{chicken:false}}, text:'Make {朋友|friends} with the chicken in the yard', arrow:[6, 16, 'village']},
    {id:'a2hens', if:{knows:'鸡', hensBack:{below:4}}, text:'The hens are out of their yard! Catch them, and carry them back ({hensBack}/4)'},
    {id:'a2hide', if:{hiding:true}, text:'Find the {孩子|child}: they’re hiding somewhere in the village', clue:true},   // (its clue under it, to hear again; no arrow: that's the game)
    {id:'a2east', if:{villageWords:12, farmer:0}, text:'Follow the {路|road} east, to the fields', arrow:'farmer'},
    {id:'a2birds', if:{farmer:1, birdsShooed:{below:5}}, text:'Shoo the {鸟|birds} off the farmer’s rice ({birdsShooed}/5)'},
    {id:'a2lunch', if:{lunch:'asked'}, text:'Give the farmer some {饭} from your bag. No {饭|rice}? The granny by the well has more', arrow:'farmer'},
    {id:'a2dog', if:{farmer:{atLeast:1}, friends:{dog:false}}, text:'Make {朋友|friends} with the dog by the road', arrow:[36, 9, 'fields']},
    {id:'a2town', if:{lunch:'done', friends:{dog:true}, exchanged:0}, text:'Follow the {路|road} east, to the town', arrow:'changer'},
    {id:'a2change', if:{exchanged:0, place:'town'}, text:'Change your {钱|money}: talk to the money changer at the market', arrow:'changer'},
    {id:'a2townWords', if:{exchanged:1, years:0}, text:'Get to know the town: find someone with a ! over them ({townWords}/11)'},
    {id:'a2granny', if:{grannyBuns:'asked', inBag:{'包子':false}}, text:'Buy a {包子} at the market for the granny'},
    {id:'a2grannyApple', if:{grannyApple:'asked', inBag:{'苹果':false}}, text:'Buy an {苹果} at the market for the granny'},
    {id:'a2grannyPeach', if:{grannyPeach:'asked', inBag:{'桃子':false}}, text:'Buy a {桃子} at the market for the granny'},
    {id:'a2grannyBack', if:{any:[{grannyBuns:'asked', inBag:{'包子':true}}, {grannyApple:'asked', inBag:{'苹果':true}}, {grannyPeach:'asked', inBag:{'桃子':true}}]}, text:'Take it to the granny in the town', arrow:'granny2'},
    {id:'a2cargo', if:{cargo:1, cargoCarried:{below:4}}, text:'Carry four sacks onto the {船|boat} for the docker ({cargoCarried}/4)'},
    {id:'a2cargoBack', if:{cargo:1, cargoCarried:4}, text:'Tell the docker the sacks are on the {船|boat}', arrow:'docker'},
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
    {text:'Catch {鱼|fish} for the fishermen’s basket', show:{pierFish:'asked'}, done:{pierFish:'done'}},
    {text:'Make {朋友|friends} with the chicken', show:{child:3}, done:{friends:{chicken:true}}},
    {text:'Catch the hens, and carry them back to their yard', show:{knows:'鸡'}, done:{hensBack:4}},
    {text:'Play hide and seek with the village {孩子|children}', show:{child:3}, done:{hidesFound:{atLeast:1}}},
    {text:'Have lunch with the granny', show:{child:3}, done:{knows:'饭'}},
    {text:'Catch a {鱼} for the fisherman', show:{fish:'asked'}, done:{fish:'done'}},
    {text:'Help the farmer in the fields', show:{farmer:{atLeast:1}}, done:{lunch:'done'}},
    {text:'Make {朋友|friends} with the dog by the road', show:{farmer:{atLeast:1}}, done:{friends:{dog:true}}},
    {text:'Change your {钱|money} in the town', show:{lunch:'done'}, done:{exchanged:1}},
    {text:'Get to know the town ({townWords}/11)', show:{exchanged:1}, done:{townWords:11}},
    {text:'Make {朋友|friends} with the cat in the market', show:{exchanged:1}, done:{friends:{cat:true}}},
    {text:'Go shopping for the granny in the town', show:{knows:'包子'}, done:{grannyPeach:'done'}},
    {text:'Help the docker load the {船|boat}', show:{years:1}, done:{cargo:2}},
    {text:'Sail across the western {海|sea}', show:{years:1}, done:{boat:2}},
    {text:'Find out {哪里|where} the immortal lives', show:{boat:2}, done:{song:1}}
  ],
  bubbles: {
    child: [{if:{dressed:2, child:0}, show:'!'}, {if:{child:{atLeast:1, below:3}}, show:'!'}],
    granny: [{if:{child:3, new:'饭'}, show:'!'}, {if:{lunch:'asked', inBag:{'饭':false}}, show:'!'}],
    fisherman: [{if:{child:3, fish:'not asked'}, show:'!'}, {if:{fish:'asked', holding:{fish:true}}, show:'?'}],
    oldFisher: [{if:{back:1, oldFisher:0}, show:'!'}],
    fisher1: [{if:{back:1, oldFisher:1, pierFish:'not asked'}, show:'!'}, {if:{pierFish:'asked', holding:{pierFish:true}}, show:'?'}],
    kid2: [{if:{child:3, hidesFound:0}, show:'!'}],
    planter: [{if:{planter:0}, show:'!'}],
    farmer: [{if:{farmer:0}, show:'!'}, {if:{farmer:1, birdsShooed:5}, show:'!'}, {if:{lunch:'asked', inBag:{'饭':true}}, show:'?'}],
    changer: [{if:{exchanged:0}, show:'!'}],
    fruitSeller: [{if:{exchanged:1, new:'买'}, show:'!'}],
    bunSeller: [{if:{knows:'买', new:'包子'}, show:'!'}],
    shoeSeller: [{if:{knows:'包子', grannyBuns:'done', new:'鞋'}, show:'!'}],
    teaKeeper: [{if:{knows:'鞋', new:'茶'}, show:'!'}],
    granny2: [{if:{knows:'包子', grannyBuns:'not asked'}, show:'!'}, {if:{grannyBuns:'asked', inBag:{'包子':true}}, show:'?'},
      {if:{grannyBuns:'done', grannyApple:'not asked'}, show:'!'}, {if:{grannyApple:'asked', inBag:{'苹果':true}}, show:'?'},
      {if:{grannyApple:'done', grannyPeach:'not asked'}, show:'!'}, {if:{grannyPeach:'asked', inBag:{'桃子':true}}, show:'?'}],
    docker: [{if:{years:1, cargo:0}, show:'!'}, {if:{cargo:1, cargoCarried:4}, show:'?'}],
    teller: [{if:{knows:'茶', new:'说'}, show:'!'}, {if:{knows:'说', new:'哪里'}, show:'!'}],
    teacher: [{if:{knows:'哪里', new:'听'}, show:'!'}, {if:{knows:'听', new:'孩子'}, show:'!'}, {if:{knows:'孩子', new:'学'}, show:'!'}],
    boatman: [{if:{years:1, boat:0}, show:'!'}, {if:{boat:1}, show:'!'}],
    woodcutter: [{if:{song:0}, show:'!'}]
  },

  // Characters who ask you to bring something (as Flower Fruit Mountain's). fromBag: what they want comes from your bag
  // (such as the granny's rice), not held for them. after: steps once they've thanked you (such as being paid).
  requests: {
    // a granny in the town sends you shopping, one thing at a time: a bun, an apple, a peach, from the stalls (each from
    // your bag)
    grannyBuns: {from:'granny2', wants:'包子', fromBag:true, ask:'wantBuns', asked:'The granny wants {包子|steamed buns}. Buy a steamed bun at the market, and bring it to her!',
      offer:'haveBuns', sentence:'我 有 包子', sentenceEn:'I have a steamed bun.', reward:2, thanks:'thanks', thanksReply:'不客气'},
    grannyApple: {from:'granny2', wants:'苹果', fromBag:true, ask:'wantApple', asked:'The granny wants {苹果|an apple}. Buy an apple at the market, and bring it to her!',
      offer:'haveApple', sentence:'我 有 苹果', sentenceEn:'I have an apple.', reward:2, thanks:'thanks', thanksReply:'不客气'},
    grannyPeach: {from:'granny2', wants:'桃子', fromBag:true, ask:'wantPeach', asked:'The granny wants {桃子|a peach}. Buy a peach at the market, and bring it to her!',
      offer:'havePeach', sentence:'我 有 桃子', sentenceEn:'I have a peach.', reward:2, thanks:'thanks', thanksReply:'不客气'},
    // the fisherman on the pier wants fish for their basket: three, caught with your rod beside him (each counted as you
    // catch it: the fishing's steps)
    pierFish: {from:'fisher1', wants:'鱼', ask:'haveFish', asked:'The fishermen want fish for their basket. Fish off the pier beside them: face the sea, and press A. Three, please!',
      offer:'haveFish', sentence:'我 有 鱼', sentenceEn:'I have some fish.', reward:3, thanks:'thanks', thanksReply:'不客气'},
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
    // the peddler on the high road, with his cart: fruit, and buns once you know them
    peddler: {who:'peddler', ask:'whatWant', given:'The peddler gives you the {item}.', reply:'谢谢', welcome:'welcome', no:'我不要',
      earnMore:'Earn more by helping people and making friends with animals.', puzzled:'The peddler looks puzzled: you pointed at the {item}, but asked for something else!',
      sorry:'对不起', sorryAbout:'You asked the peddler for the wrong thing.', noProblem:'noProblem', soldOut:'Come back another time.',
      items:[
        {item:'苹果', price:2, sentence:'我 要 苹果', sentenceEn:'I want an apple.', note:'A crunchy apple.', bought:'You put the {苹果} in your bag.', eat:true},
        {item:'桃子', price:2, sentence:'我 要 桃子', sentenceEn:'I want a peach.', note:'A ripe peach.', bought:'You put the {桃子} in your bag.', eat:true},
        {item:'包子', price:2, if:{knows:'包子'}, sentence:'我 要 包子', sentenceEn:'I want a steamed bun.', note:'A steamed bun, soft and hot.', bought:'You put the {包子} in your bag.', eat:true}
      ]},
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
      {if:{pierFish:'asked', holding:{pierFish:false}}, do:[{collect:'鱼', for:'pierFish', count:3, each:'A {鱼} for the fishermen’s basket ({pierCaught}/3). Cast again!', full:'Three {鱼|fish}! Take them to the fisherman on the pier.'}]},
      {if:{fish:'asked', holding:{fish:false}}, do:[{hold:'鱼', for:'fish'}, {message:'A {鱼} for the fisherman! Take it to him, in the village.'}]},
      {do:[{gap:{sentence:'这 是 小 鱼', en:'This is a little fish.', word:'小', others:['大'], pic:'小 鱼'}}, {message:'You let the little fish go.'}]}]},
    big:{questions:3, pic:'大 鱼', caught:'You caught a fish! It’s huge!', steps:[
      {if:{pierFish:'asked', holding:{pierFish:false}}, do:[{collect:'鱼', for:'pierFish', count:3, each:'A big {鱼} for the fishermen’s basket ({pierCaught}/3). Cast again!', full:'Three {鱼|fish}! Take them to the fisherman on the pier.'}]},
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
    // all four hens back in their yard: the villager thanks you
    {if:{hensBack:4, hensDone:0}, do:[{set:{hensDone:1}}, {sound:'chime'}, {shells:3, if:{new:'钱'}, note:'All four hens are back in their yard! The villager gives you 3 🐚 for your help.'},
      {shells:3, if:{knows:'钱'}, note:'All four hens are back in their yard! The villager gives you 3 🪙 for your help.'}]},
    {if:{landed:0}, do:LANDING},   // (the page closed before the landing was over)
    // dressed: the fishermen come out of their hut again
    {if:{dressed:2, back:0}, do:[{set:{back:1}}, {sound:'chime'},
      {message:'The fishermen come out of their hut. They don’t run away now: in a coat and hat, you look just like a person!'}]},
    // on the road through the fields, the dog stops you, guarding it
    {if:{place:'fields', dogStop:0, friends:{dog:false}, wordReady:true, around:[36, 8, 'fields', 1]}, do:[{set:{dogStop:1}}, {stopsYou:'dog'}]},
    // at the top of the stone steps on the far shore: the way on up the mountain, to the immortal (chapter 1, still to come)
    {if:{place:'farShore', stepsTop:0, around:[15, 1, 'farShore', 1]}, do:[{set:{stepsTop:1}},
      {message:'The path goes on up the mountain, to where the immortal lives. That’s chapter 1, still to come!'}]},
    // years go by in the town, once you know its words: you live among people, learning to talk like them, but nobody is
    // looking for the immortals (a match game of the town's and the village's words)
    {if:{townWords:11, years:0, wordReady:true, friends:{cat:true}}, do:[{set:{years:1}}, {scene:'yearsPass'}, {scene:'manyYearsLater'},
      {match:'Years among people', stop:'Not now', words:['人', '衣服', '帽子', '井', '房子', '门', '鸡', '饭', '钱', '网', '船', '狗', '包子', '鞋', '茶', '孩子', '书', '猫']},
      {message:'Years go by. You can talk like people now, but nobody here knows where the immortals are. The town has changed too: the children from the school are grown up. Across the bridge, at the harbour, a boatman sails west…'}]}
  ],

  // The places: the shore where you land, the fishing village above it, the fields east of that, the market town, its
  // harbour, and across the western sea, the far shore. Each in the human world's own look (decided 4 November 2026:
  // ground people have made, earth and flagstones; bamboo, white walls and dark tiles, mud-brick and thatch; a canal).
  places: {
    // where your raft washes up: the fishermen's homes up on the grass, a wide beach with their nets and boats, and a long
    // pier where they fish
    shore: {
      name: {zh:'海边', py:'hǎibiān', en:'The shore'},
      music: 'village',
      onMap: [46, 150],
      sounds: ['wind', 'birds'],
      exits: [
        {at:[17, 0], to:'shorePath', arrive:[12, 28], facing:'up', if:{dressed:2}, closed:'People run from a monkey! Find something to wear first.'},
        {at:[18, 0], to:'shorePath', arrive:[13, 28], facing:'up', if:{dressed:2}, closed:'People run from a monkey! Find something to wear first.'}
      ],
      map: [
        "bbbbbbbbbbbbbbbbb..bbbbbbbbbbbbbbbbb",
        "b,UUUU,,,UUUU,,,,..,,T,,,,UUUU,q,,,b",
        "b,UUUU,p,UUUU,j,,..,,,,,j,UUUU,,,,,b",
        "b,,,,,,,,,,,,,,,,..,,,,,,p,,,,,rr,,b",
        "bT,,,,,,,rr,,,,,,..,,,,,,,,,,,,,,T,b",
        "b,,,,,,,,,,,,,,,,..,,,,,,,,,,,,,,,,b",
        "ksssrrssssssrrsss..ssssssssssssssssk",
        "kssssssssssssssssssssssssssssssssssk",
        "ksssNsssssNssssssssssssssssssNsssssk",
        "kssssssssssssssssssssssssssssssssssk",
        "kssssssssssssssssssssssЖsssssssssksk",
        "kssssssssssssskssssssssssssssssssssk",
        "kssssssssssssssssssssssssssssssssssk",
        "kkssssssssssssssssssssssssskssЗssssk",
        "ksssskssssssssssqssssqsssssssssssskk",
        "kskssssssssssssqsPPPjssssssssssksssk",
        "kssssssssssssssssPPPsssssssssssssksk",
        "mmmmBBmmmmmФФmmmmPPPmmmmmmBBmmmmmmmm",
        "mmmmmmmmmmmmmmmmmPPPmmmmmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmmmPPPmmmmmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmmmPPPmmmmmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm"
      ]
    },
    // the path up from the shore to the village (as on Flower Fruit Mountain, no place is just next door): winding up
    // from the sand through grass and seaside pines, long grass beside it where your friends hide
    shorePath: {
      name: {zh:'海边的小路', py:'hǎibiān de xiǎolù', en:'The path up from the shore'},
      music: 'village',
      onMap: [46, 126],
      sounds: ['wind', 'birds'],
      exits: [
        {at:[12, 29], to:'shore', arrive:[17, 1], facing:'down'},
        {at:[13, 29], to:'shore', arrive:[18, 1], facing:'down'},
        {at:[11, 0], to:'village', arrive:[19, 26], facing:'up'},
        {at:[12, 0], to:'village', arrive:[20, 26], facing:'up'}
      ],
      map: [
        "bbbbbbbbbbb..bbbbbbbbbbb",
        "ttggggggggg..gggggggggtt",
        "ttggggggggg..ggtGGGGGgtt",
        "ttgggggg.....gggGGGGGgtt",
        "ttgggggg.....gggGGGGGgtt",
        "ttgggtgg..ggggggGGGGGgtt",
        "ttgggggg..ggggggggggggtt",
        "ttgggggg.........gggggtt",
        "ttGGGGGg.........gggggtt",
        "ttGGGGGggggTggg..ggtggtt",
        "ttGGGGGgggggggg..gggggtt",
        "ttGGGGGg.........gggggtt",
        "ttgggggg.........gggggtt",
        "ttgggggg..gggggggGGGGGtt",
        "ttggtggg..gggggggGGGGGtt",
        "ttgggggg......gggGGGGGtt",
        "ttgggggg......gggGGGGGtt",
        "ttgGGGGGgggg..gggGGGGGtt",
        "ttgGGGGGgggg..ggggggggtt",
        "ttgGGGGGgggg..ggggggggtt",
        "ttgGGGGGgggg..gggggtggtt",
        "ttgggggggggg..ggggggggtt",
        "ksssssssssss..sssssssssk",
        "ksssssqsssss..ssqssssssk",
        "ksssssssssss..sssskssssk",
        "ksssksssssss..sssssssssk",
        "ksssssssssss..sssssssssk",
        "ksssssssssss..sssssskssk",
        "ksssssssksss..sssssssssk",
        "ksssssssssss..sssssssssk"
      ]
    },
    // the fishing village: houses along the top, the white-walled courtyard, the old tree and the well on its green, the
    // chicken yard (its gate left open), vegetables, a stream along the bottom, the lane east
    village: {
      name: {zh:'渔村', py:'yúcūn', en:'The fishing village'},
      music: 'village',
      onMap: [46, 102],
      sounds: ['birds'],
      exits: [
        {at:[19, 27], to:'shorePath', arrive:[11, 1], facing:'down'},
        {at:[20, 27], to:'shorePath', arrive:[12, 1], facing:'down'},
        {at:[39, 12], to:'villageLane', arrive:[1, 6], facing:'right', if:{villageWords:12}, closed:'Not yet: there’s more to find in the village, and on the shore. Check your tasks.'},
        {at:[39, 13], to:'villageLane', arrive:[1, 7], facing:'right', if:{villageWords:12}, closed:'Not yet: there’s more to find in the village, and on the shore. Check your tasks.'}
      ],
      map: [
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "b.UUUU..UUUU..UUUU........wHHHHHHHHHHHwb",
        "b.UUUU..UUUU..UUUU..q.....wHHHHHHHHHHHwb",
        "b......p.....j............w,,,,,,,,,,,wb",
        "b.........................wwwwwzwwwwwwwb",
        "b.LLLL.................................b",
        "b........rr............................b",
        "b.............................UUUU.....b",
        "b...............,,,,,,,,,.....UUUUp....b",
        "b..............,,,,,,,,,,,...q.........b",
        "b..............,,ÖÖ,,,,,,,.........T...b",
        "b..............,,ÖÖ,,,O,,,.............b",
        "b..............,,,,,,,,,,,..............",
        "b.fffffffff....,,,,,,,,,,,..............",
        "b.f,p,,,,,f....,,,,,,,,,,,.............b",
        "b.f,,,,,,,f.....,,,,,,,,,...fffffffff..b",
        "b.f,,,,,,,f.................vvvvvvvvv..b",
        "b.f,,,,,,,f..UUUU....UUUU...vvvvvvvvv..b",
        "b.f,,,,,,,f..UUUU.j..UUUU.c.vvvvvvvvv..b",
        "b.ffff.ffff.................vvvvvvvvv..b",
        "b......................................b",
        "b...........LLL.............j.......T..b",
        "b..T.....T.....T.........T.....T....T..b",
        "b~~~~~~~~~~~~~~~~~~II~~~~~~~~~~~~~~~~~~b",
        "b~~~~~~~~~~~~~~~~~~II~~~~~~~~~~~~~~~~~~b",
        "b,,,,,,,,,,,,,,,,,,..,,,,,,,,,,,,,,,,,,b",
        "b,,,,,,,,,,,,,,,,,,..,,,,,,,,,,,,,,,,,,b",
        "bbbbbbbbbbbbbbbbbbb..bbbbbbbbbbbbbbbbbbb"
      ]
    },
    // the country lane east from the village to the fields: between bamboo groves, a brook beside it, its stone slabs to
    // the south bank, and stepping stones over to a quiet corner of long grass
    villageLane: {
      name: {zh:'乡间小路', py:'xiāngjiān xiǎolù', en:'The country lane'},
      music: 'village',
      onMap: [76, 102],
      sounds: ['birds', 'wind'],
      exits: [
        {at:[0, 6], to:'village', arrive:[38, 12], facing:'left'},
        {at:[0, 7], to:'village', arrive:[38, 13], facing:'left'},
        {at:[39, 6], to:'fields', arrive:[1, 8], facing:'right'},
        {at:[39, 7], to:'fields', arrive:[1, 9], facing:'right'}
      ],
      map: [
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "b,,,,,bbbb,,,,,,,,,,,,,,,,,bbbbb,,,,,,,b",
        "b,,v,,bbbb,,,,,,,,,,,,,,,,,bbbbb,,,,,,,b",
        "b,,,,,bbbb,,,,,,,,,,,,,,,,,bbbbb,,,,v,,b",
        "b,,,,,,,,,,,T,,,,,,,,,,,,T,,,,,,,,,,,,,b",
        "........................................",
        "........................................",
        "b,,,,,,,,,,,,,,,,,,,..,,,,,,,,,,,T,,,,,b",
        "b~~~~~~~hh~~~~~~~~~~II~~~~~~~~~~~~~~~~,b",
        "b~~~~~~~hh~~~~~~~~~~II~~~~~~~~~~~~~~~~,b",
        "b,GGGGGGGGGGGbbbbbb,..,vvvv,,,,,,bbbbb,b",
        "b,GGkGGGGGGGGbbbbbb,..,vvvv,c,,,,bbbbb,b",
        "b,GGGGGGGGGGGbbbbbb,..,,,,,,,,,,,bbbbb,b",
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
      ]
    },
    // the fields: a long road between rice fields, the farmer's farm, scarecrows, a channel across the lower fields with
    // stepping stones, long grass
    fields: {
      name: {zh:'田边', py:'tiánbiān', en:'The fields'},
      music: 'village',
      onMap: [106, 102],
      sounds: ['birds', 'wind'],
      exits: [
        {at:[0, 8], to:'villageLane', arrive:[38, 6], facing:'left'},
        {at:[0, 9], to:'villageLane', arrive:[38, 7], facing:'left'},
        {at:[43, 8], to:'highRoad', arrive:[1, 7], facing:'right', if:{lunch:'done', friends:{dog:true}}, closed:'Not yet: help the farmer, and make friends with the dog, first.'},
        {at:[43, 9], to:'highRoad', arrive:[1, 8], facing:'right', if:{lunch:'done', friends:{dog:true}}, closed:'Not yet: help the farmer, and make friends with the dog, first.'}
      ],
      map: [
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "bRRRRRRRRRR,RRRRRRRRRR,RRRRRRRRRR,RR,UUUU,,b",
        "bRRRRRRRRRR,RRRRRRRRRR,RRRRRRRRRR,RR,UUUU,,b",
        "bRRRRXRRRRR,RRRRRRRRRR,RRRRRRRRRR,RR,,,,,p,b",
        "bRRRRRRRRRR,RRRRRRRRRR,RRRRXRRRRR,RR,x,,,,,b",
        "bRRRRRRRRRR,RRRRRRRRRR,RRRRRRRRRR,RR,,,,,,,b",
        "bRRRRRRRRRR,RRRRRRRRRR,RRRRRRRRRR,RR,,,,,,,b",
        "b,,,T,,,,,,,,,T,,,,,,,,,,,T,,,,,,,,,,,,,,,,b",
        "............................................",
        "............................................",
        "b,,,,,,,T,,,,,,,,,,T,,,,,,,,,,T,,,,,,,,,,,,b",
        "bRRRRRRRR,,RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRb",
        "bRRRRRRRR,,RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRb",
        "b~~~~~~~~hh~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~b",
        "b~~~~~~~~hh~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~b",
        "b,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,b",
        "bRRRRRRRRRRRRRRR,RRRRRRRRRRRR,RRRRGGGGGGGGRb",
        "bRRRRRRRRRRRRRRR,RRRRRRRRRRRR,RRRRGGGGGGGGRb",
        "bRRRRRRRRRRRRRRR,RRRRRRRRRRRRXRRRRGGGGGGGGRb",
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
      ]
    },
    // the high road from the fields to the town: wide and busy, willows along it, a peddler's cart, an old tree and a well
    // to rest by, long grass in the meadows, the first houses of the town
    highRoad: {
      name: {zh:'大路', py:'dàlù', en:'The high road'},
      music: 'village',
      onMap: [136, 102],
      sounds: ['birds', 'wind'],
      exits: [
        {at:[0, 7], to:'fields', arrive:[42, 8], facing:'left'},
        {at:[0, 8], to:'fields', arrive:[42, 9], facing:'left'},
        {at:[43, 7], to:'town', arrive:[1, 12], facing:'right'},
        {at:[43, 8], to:'town', arrive:[1, 13], facing:'right'}
      ],
      map: [
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "bgGGGGGGGGGgggggggggggggggggggvvvvvvvHHHHHHb",
        "bgGGGGGGGGGggggggggÖÖgggggggggvvvvvvvHHHHHHb",
        "bgGGGGGGGGGggggggggÖÖgggggggggvvvvvvvvgggggb",
        "bgGGGGGGGGGgggggggggggOgggggggvvvvvvjvgggggb",
        "bggTgggggTgggggTgggggTgggggTgggggTgggggTgggb",
        ",,,,,,,,,,,,,,,,x,,,,,,,,,,,,,,,,,,,,,,,,,,,",
        "...............c............................",
        "............................................",
        ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
        "bgggggTgggggTgggggTgggggTgggggTgggggTgggggTb",
        "bgggggggggggggvvvvvvvgggggGGGGGGGGGggHHHHHHb",
        "bgggggggggggggvvvvvvvgggggGGGGGGGGGggHHHHHHb",
        "bgggggggggggggvvvvvvvgggggGGGGGGGGGggggjgggb",
        "bgggggggggggggggggggggggggGGGGGGGGGggggggggb",
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
      ]
    },
    // the market town: the teahouse and the school along the top, the market's stalls, the old tree and a well in the
    // square, a second row of houses, the canal with its arched bridge, and houses beyond it
    town: {
      name: {zh:'小镇', py:'xiǎozhèn', en:'The market town'},
      music: 'village',
      onMap: [166, 102],
      sounds: ['birds'],
      exits: [
        {at:[0, 12], to:'highRoad', arrive:[42, 7], facing:'left'},
        {at:[0, 13], to:'highRoad', arrive:[42, 7], facing:'left'},
        {at:[0, 14], to:'highRoad', arrive:[42, 8], facing:'left'},
        {at:[24, 27], to:'canalPath', arrive:[9, 1], facing:'down', if:{years:1}, closed:'Not yet: get to know the town first. Check your tasks.'},
        {at:[25, 27], to:'canalPath', arrive:[10, 1], facing:'down', if:{years:1}, closed:'Not yet: get to know the town first. Check your tasks.'}
      ],
      map: [
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "bQQQQQQHHHHKKKKK####HHHHH##HHHHH#HHHHHHb",
        "bQQQQQQHHHHKKKKK####HHHHH##HHHHH#HHHHHHb",
        "bQQQQQQ####KKKKKu######################b",
        "b######################################b",
        "b######################################b",
        "b######################################b",
        "b######################################b",
        "b################################xq####b",
        "b##AAA###YYY##############CCC##########b",
        "b######################################b",
        "b##################ÖÖ##################b",
        "###################ÖÖ##########O#######b",
        "###CCC###EEEǩǩǩ####################c###b",
        "#######################################b",
        "b##############HHHH########HHHHH#HHHHH#b",
        "b##xqj#########HHHHc###j###HHHHH#HHHHH#b",
        "b######################################b",
        "b#T#####T#####T###############T#####T##b",
        "b~~~~~~~~~~~~~~~~~~~~~~~nn~~~~~~~~~~~~~b",
        "b~~~~~~~~~~~~~~~~~~~~~~~nn~~~~~~~~~~~~~b",
        "b~~~~~~~~~~~~~~~~~~~~~~~nn~~~~~~~~~~~~~b",
        "b,,,,,,,,,,,,,,,,,,,,,,,##,,,,,,,,,,,,,b",
        "b,,,HHHHH,,,UUUU,p,,,,,,##,,,,HHHHH,T,,b",
        "b,,,HHHHH,,,UUUU,,,,,,,,##,,,,HHHHH,,,,b",
        "b,T,,,,,,,,,,,,,,,,T,,,,##,,,,,,,,,,,,,b",
        "b,,,,,,,,,,,,,,,,,,,,,,,##,,,,,,,,,,,,,b",
        "bbbbbbbbbbbbbbbbbbbbbbbb##bbbbbbbbbbbbbb"
      ]
    },
    // the canal path from the town down to the harbour: along the canal under willows, a little bridge, long grass
    canalPath: {
      name: {zh:'河边小路', py:'hébiān xiǎolù', en:'The canal path'},
      music: 'village',
      onMap: [166, 126],
      sounds: ['birds'],
      exits: [
        {at:[9, 0], to:'town', arrive:[24, 26], facing:'up'},
        {at:[10, 0], to:'town', arrive:[25, 26], facing:'up'},
        {at:[9, 29], to:'harbour', arrive:[16, 1], facing:'down'},
        {at:[10, 29], to:'harbour', arrive:[17, 1], facing:'down'}
      ],
      map: [
        "bbbbbbbbb##bbbbbbbbb",
        "b,,~~~,,,##,,,HHHH,b",
        "b,,~~~,,,##,,,HHHH,b",
        "b,,~~~T,,##,,,,,,,,b",
        "b,,~~~,,,##,,,,,,,,b",
        "b,,~~~,,,##,,,T,,,,b",
        "b,,~~~,,,##,,,,,,,,b",
        "b,,~~~,,,##,,,,,,,,b",
        "b,,~~~,,,##,,GGGGG,b",
        "b,,~~~T,,##,,GGGGG,b",
        "b,,~~~,,,##,,GGGGG,b",
        "b,,~~~,,,##,,GGGGG,b",
        "b,,~~~,,,##,,,,,T,,b",
        "b,,~~~,,,##,,,,,,,,b",
        "b,,III,,,##,,,,,,,,b",
        "b,,III,,,##,j,,,,,,b",
        "b,,~~~,,,##,,,j,,,,b",
        "b,,~~~T,,##,,,,,,,,b",
        "bGG~~~,,,##,,,,,,,,b",
        "bGG~~~,,,##,,,,,,,,b",
        "bGG~~~,,,##,,T,,,,,b",
        "bGG~~~,,,##,,,,,,,,b",
        "bGG~~~,,,##,,,,,,,,b",
        "bGG~~~T,,##,,,,,,,,b",
        "bGG~~~,,,##,x,,,,,,b",
        "b,,~~~,,,##,,,,,,,,b",
        "b,,~~~,,,##,,,,,T,,b",
        "b,,~~~,,,##,,,,,,,,b",
        "b,,~~~,,,##,,,,,,,,b",
        "bbbbbbbbb##bbbbbbbbb"
      ]
    },
    // the harbour: warehouses, sacks and baskets on the quay, a beach, a long pier out to the big boat
    harbour: {
      name: {zh:'码头', py:'mǎtou', en:'The harbour'},
      music: 'village',
      onMap: [166, 150],
      sounds: ['wind', 'birds'],
      // its sacks of rice, waiting to go on the boat: carry four for the docker (a question as you lift each)
      legend: {
        'x': {look:'sacks', landmark:true, onLook:[
          {if:{cargo:1, cargoCarried:{below:4}}, label:'Carry', sparkle:true, do:[{practise:1, label:'Lift the sack!', pic:'饭'}, {change:'#'},
            {collect:'饭', for:'cargo', count:4, each:'You carry the sack down to the boat ({cargoCarried}/4).', full:'Four sacks on the boat! Tell the docker.'}]},
          {do:[{message:'Sacks of rice, waiting to go on the boat.'}]}]}
      },
      exits: [
        {at:[16, 0], to:'canalPath', arrive:[9, 28], facing:'up'},
        {at:[17, 0], to:'canalPath', arrive:[10, 28], facing:'up'},
        {at:[18, 15], to:'farShore', arrive:[16, 19], facing:'up', by:'A', label:'Sail', if:{boat:2}}   // (once you've crossed with the boatman)
      ],
      map: [
        "bbbbbbbbbbbbbbbb##bbbbbbbbbbbbbbbb",
        "b#HHHHH##HHHHH######UUUU#HHHHHH##b",
        "b#HHHHH##HHHHH######UUUU#HHHHHH##b",
        "b####################jq##########b",
        "b#######xxq####################p#b",
        "b#rr########xx##############rr###b",
        "b##################q##xx#########b",
        "b#############q##################b",
        "kssssssssssssssPPPsssssssssssssssk",
        "ksssssNssssssssPPPsssssssssssssssk",
        "kssssssssssssssPPPsssssssssNsssssk",
        "mmmmmmmmmmmmmmmPPPmmmmmmmmmmmmmmmm",
        "mmmmmBBmmmmmmmmPPPmmmmmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmPPPmmmmmmmmBBmmmmmm",
        "mmmmmmmmmmmmmmmPPPmmmmmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmPPPVVVmmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmPPPmmmmmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmPPPmmmmmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmPPPmmmmmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm"
      ]
    },
    // across the western sea: a landing beach, a meadow climbing to pine woods, the woodcutter's clearing, stone steps up
    // the mountain. Till you find him, his song carries through the woods, louder the right way
    farShore: {
      name: {zh:'西边的海边', py:'xībiān de hǎibiān', en:'The far shore'},
      music: 'village',
      onMap: [206, 40],
      sounds: [{rows:[4, 16], cols:[0, 13], if:{song:0}, sounds:['song', 'birds']}, {rows:[0, 23], if:{song:0}, sounds:['songFar', 'wind']}, {rows:[0, 23], sounds:['wind', 'birds']}],
      exits: [
        {at:[17, 21], to:'harbour', arrive:[17, 15], facing:'right', by:'A', label:'Sail'},
        {at:[18, 21], to:'harbour', arrive:[17, 15], facing:'right', by:'A', label:'Sail'}
      ],
      map: [
        "^^^^^^^^^^^^^^^..^^^^^^^^^^^^^^^",
        "^^^^^^^^^^^^^^^..^^^^^^^^^^^^^^^",
        "MMMMMMMMMMMMMMM==MMMMMMMMMMMMMMM",
        "MMMMMMMMMMMMMMM==MMMMMMMMMMMMMMM",
        "ttttttttttttttt..ttttttttttttttt",
        "ttttttttttttttt..ttttttttttttttt",
        "ttttgggggggggtt..ttttttttttttttt",
        "ttttgggggggggtt..ttttttttttttttt",
        "tttggggggggpggg..ggggggggggggttt",
        "tttggggJgg.......gggggtggggggttt",
        "tttgggggggggggt..ggggggggggggttt",
        "tttgggggggJggggg..gggggggggggttt",
        "tttgggggggggggggg.ggggggggtggttt",
        "tttgggggggggtggg..gggggggtgggttt",
        "tttgggggggggggg..ggtgggggggggttt",
        "tttgggggggggggg.gggggggggggggttt",
        "tttgggggggggggg..ggggggggggggttt",
        "kssssssssssssssssssssssssssssssk",
        "kssssssssssssssPPssssssssssssssk",
        "kssssssssssssssPPssssssssssssssk",
        "mmmmmmmmmmmmmmmPPmmmmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmPPVVVmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmPPmmmmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm"
      ]
    }
  },

  // What each letter on the maps is (as Flower Fruit Mountain's legend). ask: a person near tells you its word when you ask
  // (这是什么？): their answer, one of the lines.
  legend: {
    // stepping stones, to hop onto a row at a time: hear a word, and hop onto the stone with its picture, the other tipping
    // you into the water (as on Flower Fruit Mountain's south slope); two to a row, so there's always a choice (decided 4
    // November 2026, after playing it: one to a row, there was nothing to choose)
    'h': {look:'hopStone', hop:{label:'Stepping stones', ask:'Listen, and hop onto the stone with its picture.',
      splash:'Splash! The stone tips, and in you go. You climb back out onto the bank. Try again!'}},
    '.': {look:'earth', walk:true},
    ',': {look:'lawn', walk:true},
    '#': {look:'paving', walk:true},
    's': {look:'sand', walk:true},
    'g': {look:'grass', walk:true},
    'G': {look:'tallGrass', walk:true, word:'草', animals:true},
    'm': {look:'sea', word:'海', fishing:true, note:'The sea, as far as you can see.'},
    '~': {look:'canal', word:'河', fishing:true},
    'I': {look:'slab', walk:true},
    // a new stall in the town after the years (where there were just flagstones before)
    'ǩ': {look:'paving', walk:true, becomes:[{if:{years:1}, to:'ǰ'}]},
    'ǰ': {look:'stallKites', landmark:true, onLook:[{do:[{message:'A new stall, selling kites. It wasn’t here before!'}]}]},
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
    {id:'fisher1', person:true, wear:'vest', x:17, y:20, facing:'down', plays:'fish', name:{zh:'渔夫', py:'yúfū', en:'Fisherman'}, moves:[{if:{landed:1, dressed:{below:2}}, place:'hut', x:0, y:0}],
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#4F78A8', b:'#3A2A1E', p:'#34404E', a:'#D9B866', d:'#A88A3E'}},
    {id:'fisher2', person:true, wear:'vest', x:11, y:9, facing:'left', name:{zh:'渔夫', py:'yúfū', en:'Fisherman'}, moves:[{if:{landed:1, dressed:{below:2}}, place:'hut', x:0, y:0}],
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E8BC90', e:'#1E140C', m:'#C4826A', c:'#6E8F5E', b:'#3A2A1E', p:'#3A3A30', a:'#D9B866', d:'#A88A3E'}},
    {id:'oldFisher', person:true, hair:'topknot', beard:true, x:25, y:15, facing:'left', name:{zh:'老渔夫', py:'lǎo yúfū', en:'Old fisherman'}, moves:[{if:{landed:1, dressed:{below:2}}, place:'hut', x:0, y:0}],
      palette:{o:'#3A2A1E', h:'#DADADA', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#E8DCC4', b:'#3A2A1E', p:'#3E3A34'}},
    // the village
    {id:'child', place:'village', person:true, hair:'pigtails', small:true, x:16, y:12, facing:'right', name:{zh:'小孩', py:'xiǎohái', en:'Child'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#E8A33C', b:'#3A2A1E', p:'#5A4632'}},
    {id:'granny', place:'village', person:true, hair:'bun', x:23, y:12, facing:'left', name:{zh:'老奶奶', py:'lǎo nǎinai', en:'Granny'},
      palette:{o:'#3A2A1E', h:'#E8E8E8', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#6A5A8A', b:'#3A2A1E', p:'#3A3446'}},
    {id:'fisherman', place:'village', person:true, wear:'vest', x:11, y:4, facing:'left', name:{zh:'渔夫', py:'yúfū', en:'Fisherman'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E8BC90', e:'#1E140C', m:'#C4826A', c:'#3E5A86', b:'#3A2A1E', p:'#34404E', a:'#D9B866', d:'#A88A3E'}},
    // the woman of the white house, inside till you knock at its gate (moves: inside her house)
    {id:'auntie', place:'village', person:true, hair:'scarf', x:32, y:5, facing:'down', name:{zh:'阿姨', py:'āyí', en:'Auntie'}, moves:[{if:{knock:0}, place:'house', x:0, y:0}],
      palette:{k:'#3E5A86', o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#C0504D', b:'#3A2A1E', p:'#4A3A3A'}},
    {id:'villager', place:'village', person:true, hair:'bun', x:29, y:6, facing:'down', name:{zh:'村民', py:'cūnmín', en:'Villager'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#7A5A8A', b:'#3A2A1E', p:'#3A3446'}},
    // four hens, out of their yard (its gate was left open), running about the village: catch each and carry it back
    {id:'hen1', place:'village', look:'鸡', scuttles:true, x:12, y:8, facing:'left', moves:[{if:{hen1:1}, place:'village', x:4, y:15}]},
    {id:'hen2', place:'village', look:'鸡', scuttles:true, x:25, y:6, facing:'right', moves:[{if:{hen2:1}, place:'village', x:8, y:15}]},
    {id:'hen3', place:'village', look:'鸡', scuttles:true, x:33, y:11, facing:'left', moves:[{if:{hen3:1}, place:'village', x:4, y:17}]},
    {id:'hen4', place:'village', look:'鸡', scuttles:true, x:7, y:21, facing:'right', moves:[{if:{hen4:1}, place:'village', x:8, y:17}]},
    // the village children: one plays hide and seek with you (the area's hideSeek), the other watches
    {id:'kid2', place:'village', person:true, small:true, x:20, y:14, facing:'up', name:{zh:'小孩', py:'xiǎohái', en:'Child'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#5FA36B', b:'#3A2A1E', p:'#3A4A5A'}},
    {id:'kid3', place:'village', person:true, hair:'topknot', small:true, x:14, y:12, facing:'right', name:{zh:'小孩', py:'xiǎohái', en:'Child'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#C0504D', b:'#3A2A1E', p:'#4A3A3A'}},
    // the fields: the farmer in his straw hat, a water buffalo, and birds eating his rice (shoo them off)
    {id:'farmer', place:'fields', person:true, wear:'vest', x:11, y:6, facing:'down', name:{zh:'农民', py:'nóngmín', en:'Farmer'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E0B088', e:'#1E140C', m:'#C4826A', c:'#8A7A5A', b:'#3A2A1E', p:'#4A4434', a:'#D9B866', d:'#A88A3E'}},
    {id:'buffalo', place:'fields', look:'水 牛', x:22, y:4, facing:'down'},
    // over the channel, in the far rice (a reason to cross the stepping stones): a woman planting rice, glad of the company
    {id:'planter', place:'fields', person:true, hair:'scarf', x:16, y:16, facing:'up', name:{zh:'农民', py:'nóngmín', en:'Farmer'},
      palette:{k:'#C7902F', o:'#3A2A1E', h:'#2A1E16', s:'#E8BC90', e:'#1E140C', m:'#C4826A', c:'#4F78A8', b:'#3A2A1E', p:'#3A3446'}},
    {id:'bird1', place:'fields', look:'bird', colour:'红色', pecks:true, x:6, y:6, facing:'left', shoo:'The bird flies off the rice ({birdsShooed}/5).'},
    {id:'bird2', place:'fields', look:'bird', colour:'黄色', pecks:true, x:19, y:16, facing:'left', shoo:'The bird flies off the rice ({birdsShooed}/5).'},
    {id:'bird3', place:'fields', look:'bird', colour:'白色', pecks:true, x:24, y:16, facing:'right', shoo:'The bird flies off the rice ({birdsShooed}/5).'},
    {id:'bird4', place:'fields', look:'bird', colour:'黑色', pecks:true, x:6, y:16, facing:'right', shoo:'The bird flies off the rice ({birdsShooed}/5).'},
    {id:'bird5', place:'fields', look:'bird', colour:'棕色', pecks:true, x:38, y:11, facing:'left', shoo:'The bird flies off the rice ({birdsShooed}/5).'},
    // the town: stallholders, the money changer, the teahouse's keeper and its storyteller, the teacher, children, people
    {id:'changer', place:'town', person:true, hair:'cap', wear:'robe', x:10, y:14, facing:'down', name:{zh:'换钱的', py:'huàn qián de', en:'Money changer'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#8A6E2E', b:'#3A2A1E', p:'#3A3020'}},
    {id:'fruitSeller', place:'town', person:true, hair:'bun', wear:'apron', x:4, y:14, facing:'down', calls:'callFruit', name:{zh:'老板', py:'lǎobǎn', en:'Stallholder'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#C7902F', b:'#3A2A1E', p:'#3A2A22'}},
    {id:'bunSeller', place:'town', person:true, hair:'topknot', wear:'apron', x:4, y:10, facing:'down', calls:'callBuns', name:{zh:'老板', py:'lǎobǎn', en:'Stallholder'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#B5462E', b:'#3A2A1E', p:'#3A2A22'}},
    {id:'shoeSeller', place:'town', person:true, wear:'apron', x:10, y:10, facing:'down', name:{zh:'老板', py:'lǎobǎn', en:'Stallholder'},
      palette:{o:'#3A2A1E', h:'#555555', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#3E7A8A', b:'#3A2A1E', p:'#2A3A40'}},
    {id:'teaKeeper', place:'town', person:true, hair:'bun', wear:'apron', x:3, y:4, facing:'down', name:{zh:'茶馆老板', py:'cháguǎn lǎobǎn', en:'Teahouse keeper'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#2F4E78', b:'#3A2A1E', p:'#2A303A'}},
    {id:'teller', place:'town', person:true, hair:'topknot', beard:true, wear:'robe', x:7, y:5, facing:'down', name:{zh:'说书人', py:'shuōshūrén', en:'Storyteller'},
      palette:{o:'#3A2A1E', h:'#E0E0E0', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#5A6A4A', b:'#3A2A1E', p:'#2E3428'}},
    {id:'teacher', place:'town', person:true, hair:'cap', wear:'robe', x:13, y:4, facing:'down', moves:[{if:{years:1}, place:'hut', x:0, y:0}], name:{zh:'老师', py:'lǎoshī', en:'Teacher'},
      palette:{o:'#3A2A1E', h:'#3A3A3A', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#5E3B22', b:'#3A2A1E', p:'#2E2A26'}},
    {id:'pupil1', place:'town', person:true, hair:'topknot', small:true, x:12, y:5, facing:'up', moves:[{if:{years:1}, place:'hut', x:0, y:0}], name:{zh:'学生', py:'xuésheng', en:'Pupil'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#4F78A8', b:'#3A2A1E', p:'#34404E'}},
    {id:'pupil2', place:'town', person:true, hair:'pigtails', small:true, x:14, y:5, facing:'up', moves:[{if:{years:1}, place:'hut', x:0, y:0}], name:{zh:'学生', py:'xuésheng', en:'Pupil'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#5FA36B', b:'#3A2A1E', p:'#3A4A5A'}},
    // after the years (years 1): the school's children grown up (one now sells kites at a new stall), two new little
    // pupils, and the teacher's hair gone grey
    {id:'grown1', place:'town', person:true, hair:'topknot', x:15, y:14, facing:'down', moves:[{if:{years:0}, place:'hut', x:0, y:0}], name:{zh:'老板', py:'lǎobǎn', en:'Stallholder'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#4F78A8', b:'#3A2A1E', p:'#34404E'}},
    {id:'grown2', place:'town', person:true, hair:'bun', x:17, y:6, facing:'down', moves:[{if:{years:0}, place:'hut', x:0, y:0}], name:{zh:'路人', py:'lùrén', en:'Passer-by'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#5FA36B', b:'#3A2A1E', p:'#3A4A5A'}},
    {id:'newPupil1', place:'town', person:true, hair:'pigtails', small:true, x:12, y:6, facing:'up', moves:[{if:{years:0}, place:'hut', x:0, y:0}], name:{zh:'学生', py:'xuésheng', en:'Pupil'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#C7902F', b:'#3A2A1E', p:'#3A3446'}},
    {id:'newPupil2', place:'town', person:true, hair:'topknot', small:true, x:14, y:6, facing:'up', moves:[{if:{years:0}, place:'hut', x:0, y:0}], name:{zh:'学生', py:'xuésheng', en:'Pupil'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#A8584E', b:'#3A2A1E', p:'#34404E'}},
    {id:'teacherOld', place:'town', person:true, hair:'cap', beard:true, wear:'robe', x:13, y:5, facing:'down', moves:[{if:{years:0}, place:'hut', x:0, y:0}, {if:{years:1}, place:'town', x:13, y:4, facing:'down'}], name:{zh:'老师', py:'lǎoshī', en:'Teacher'},
      palette:{o:'#3A2A1E', h:'#B8B8B8', s:'#EBC29A', e:'#1E140C', m:'#C4826A', c:'#5E3B22', b:'#3A2A1E', p:'#2E2A26'}},
    {id:'walker1', place:'town', person:true, hair:'bun', x:22, y:7, facing:'right', name:{zh:'路人', py:'lùrén', en:'Passer-by'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#A8584E', b:'#3A2A1E', p:'#3E3430'}},
    {id:'walker2', place:'town', person:true, hair:'topknot', x:25, y:14, facing:'left', name:{zh:'路人', py:'lùrén', en:'Passer-by'},
      palette:{o:'#3A2A1E', h:'#555555', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#3E5A86', b:'#3A2A1E', p:'#2A303A'}},
    {id:'porter', place:'town', person:true, wear:'vest', x:33, y:10, facing:'down', name:{zh:'路人', py:'lùrén', en:'Passer-by'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E0B088', e:'#1E140C', m:'#C4826A', c:'#8A7A5A', b:'#3A2A1E', p:'#4A4434', a:'#D9B866', d:'#A88A3E'}},
    // the paths between the places: travellers, who say hello; a peddler with his cart on the high road; an angler by the canal
    {id:'traveller1', place:'villageLane', person:true, x:24, y:6, facing:'left', name:{zh:'路人', py:'lùrén', en:'Traveller'}, palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#7A5A8A', b:'#3A2A1E', p:'#3A3446', a:'#D9B866', d:'#A88A3E'}},
    {id:'traveller2', place:'highRoad', person:true, hair:'topknot', x:28, y:7, facing:'left', name:{zh:'路人', py:'lùrén', en:'Traveller'}, palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#4F78A8', b:'#3A2A1E', p:'#3A3446'}},
    {id:'traveller3', place:'highRoad', person:true, hair:'bun', x:9, y:8, facing:'right', name:{zh:'路人', py:'lùrén', en:'Traveller'}, palette:{o:'#3A2A1E', h:'#555555', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#C0504D', b:'#3A2A1E', p:'#3A3446'}},
    {id:'peddler', place:'highRoad', person:true, x:16, y:8, facing:'up', name:{zh:'货郎', py:'huòláng', en:'Peddler'}, palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#C7902F', b:'#3A2A1E', p:'#3A3446', a:'#D9B866', d:'#A88A3E'}},
    {id:'angler', place:'canalPath', person:true, beard:true, x:6, y:12, facing:'left', plays:'fish', name:{zh:'渔夫', py:'yúfū', en:'Fisherman'}, palette:{o:'#3A2A1E', h:'#DADADA', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#6E8F5E', b:'#3A2A1E', p:'#3A3446', a:'#D9B866', d:'#A88A3E'}},
    // the town: a granny who sends you shopping, and a stallholder calling out what she sells
    {id:'granny2', place:'town', person:true, hair:'bun', x:21, y:14, facing:'left', name:{zh:'老奶奶', py:'lǎo nǎinai', en:'Granny'}, palette:{o:'#3A2A1E', h:'#E8E8E8', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#4A6E8A', b:'#3A2A1E', p:'#3A3446'}},
    {id:'caller', place:'town', person:true, wear:'apron', x:27, y:10, facing:'down', calls:'callFruit', name:{zh:'老板', py:'lǎobǎn', en:'Stallholder'}, palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#B5462E', b:'#3A2A1E', p:'#3A3446'}},
    // the harbour: a docker loading the big boat
    {id:'docker', place:'harbour', person:true, wear:'vest', x:11, y:6, facing:'down', name:{zh:'工人', py:'gōngrén', en:'Docker'}, palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E0B088', e:'#1E140C', m:'#C4826A', c:'#8A7A5A', b:'#3A2A1E', p:'#3A3446', a:'#D9B866', d:'#A88A3E'}},
    // the harbour: the boatman, by his big boat, and a goose on the sand
    {id:'boatman', place:'harbour', person:true, wear:'vest', x:17, y:16, facing:'right', name:{zh:'船夫', py:'chuánfū', en:'Boatman'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E0B088', e:'#1E140C', m:'#C4826A', c:'#4A5A7A', b:'#3A2A1E', p:'#2A303A', a:'#D9B866', d:'#A88A3E'}},
    {id:'harbourGoose', place:'harbour', look:'鹅', x:28, y:9, facing:'left'},
    // the far shore: the woodcutter, singing as he chops wood
    {id:'woodcutter', place:'farShore', person:true, beard:true, wear:'vest', x:9, y:10, facing:'left', name:{zh:'樵夫', py:'qiáofū', en:'Woodcutter'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E0B088', e:'#1E140C', m:'#C4826A', c:'#6E5B3A', b:'#3A2A1E', p:'#3A3226', a:'#D9B866', d:'#A88A3E'}}
  ],
  yourNames: [{if:{}, zh:'美猴王', py:'Měi Hóuwáng', en:'Handsome Monkey King (you)'}],

  // (no sign of its own: the human world's signs are the stalls' and the teahouse's)
  sign: {name:{zh:'牌子', py:'páizi', en:'Sign'}, says:{zh:'海', en:'The sea'}, hint:''},
  spots: [],
  bigSparkles: {dressed:0},
  sparkles: [
    {word:'衣服', at:[23, 10]}, {word:'帽子', at:[30, 13]},
    {word:'井', at:[22, 11, 'village'], if:{knows:'什么'}}, {word:'房子', at:[9, 2, 'village'], if:{knows:'什么'}},
    {word:'门', at:[31, 4, 'village'], if:{knows:'什么'}},
    {word:'网', at:[10, 8], if:{knows:'什么'}}, {word:'船', at:[26, 17], if:{knows:'什么'}},
    {word:'书', at:[16, 3, 'town'], if:{knows:'什么'}}
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
  fish: [[6, 19], [24, 20], [31, 18], [5, 21, 'farShore'], [26, 22, 'farShore'], [30, 9, 'villageLane'], [12, 13, 'fields'], [4, 8, 'canalPath']],
  dragonflies: [{at:[5, 23, 'village'], to:[11, 24]}, {at:[26, 23, 'village'], to:[33, 24]}, {at:[24, 9, 'villageLane'], to:[32, 10]}, {at:[30, 13, 'fields'], to:[37, 14]}],

  // The area's animals, friends to make with their word games, as on Flower Fruit Mountain. waits: the first time, its
  // word (new) waits for a little practice, as a character's does (practiseFirst, js/world.js).
  animals: [
    {id:'goose', word:'鹅', waits:true, at:[8, 12], roams:['shorePath', 'villageLane'], home:'海', clue:'The shore, on the sand', meetNote:'A goose waddles up to you on the sand, honking. Answer its questions to make friends.'},
    {id:'chicken', word:'鸡', waits:true, at:[6, 16, 'village'], roams:['shorePath', 'villageLane'], home:'草', clue:'The village, in the yard', meetNote:'A chicken pecks about in the yard. Answer its questions to make friends.'},
    {id:'dog', word:'狗', waits:true, at:[36, 9, 'fields'], roams:['villageLane', 'highRoad'], home:'草', clue:'The fields, by the road', meetNote:'A dog guards the road, barking at you! Answer its questions to make friends.'},
    {id:'cat', word:'猫', waits:true, at:[33, 8, 'town'], roams:['highRoad', 'canalPath'], perch:3, home:'房子', clue:'The town, at the market', meetNote:'A cat is curled up on the sacks at the market. Answer its questions to make friends.'}
  ],
  birds: {word:'鸟', note:'A little bird hops about, looking for something to eat.', colours:['红色', '黄色', '白色', '黑色', '蓝色', '绿色', '棕色', '橙色', '粉色']},
  // Hide and seek with a child in the village (the hideSeek step, js/hide.js, as with the little monkey at home): the
  // child hides while you count to ten, and calls out where it is, by something whose word you've learned here, so finding
  // it practises those words. Its clues' English leaves the place's word in Chinese ({井}).
  hideSeek: {
    by:'kid2', place:'village', shells:3,
    ask:'Hide and seek! Cover your eyes and count to ten, then find where the child is hiding. Listen to where they say they are.',
    notYet:'The child wants to play hide and seek, but you don’t know the words for enough places yet. Come back when you know more!',
    count:'hideCount', coming:'hideComing', found:'hideFound',
    notHere:'Not here! Listen again: where did they say they are?',
    tail:'Not here! Listen again, and look out for a foot poking out…',
    result:'You found the child! They were {where}.',
    again:'Talk to them again to play another game: they hide somewhere new each time.',
    spots: [
      {id:'tree', word:'树', say:'hideTree', where:'behind the big {树}', at:[[17, 10], [18, 10], [17, 11], [18, 11]], out:[19, 10], tail:[18, 10, 'right']},
      {id:'well', word:'井', say:'hideWell', where:'behind the {井}', at:[[22, 11]], out:[22, 10], tail:[22, 11, 'up']},
      {id:'house', word:'房子', say:'hideHouse', where:'behind a {房子}', at:[[8, 2], [9, 2], [10, 2], [11, 2], [8, 1], [9, 1], [10, 1], [11, 1]], out:[12, 3], tail:[11, 2, 'right']},
      {id:'gate', word:'门', say:'hideGate', where:'behind the {门}', at:[[31, 4]], out:[30, 5], tail:[31, 4, 'left']},
      {id:'washing', word:'衣服', say:'hideWashing', where:'behind the {衣服|washing}', at:[[2, 5], [3, 5], [4, 5], [5, 5]], out:[6, 6], tail:[5, 5, 'right']}
    ]
  },
  hidden: [
    {id:'shorePathPine', at:[5, 5, 'shorePath'], shells:2, note:'Under a pine by the path, among its needles: 2 🐚!'},
    {id:'laneRock', at:[4, 12, 'villageLane'], fruit:'桃子', note:'Tucked behind a rock in the long grass: a {桃子} for your bag!'},
    {id:'shoreRock2', at:[14, 11], shells:2, note:'Washed up behind a rock on the sand: 2 🐚!'},
    {id:'villageJars', at:[18, 18, 'village'], fruit:'苹果', note:'Tucked behind the jars: a {苹果} for your bag!'},
    {id:'fieldsScarecrow', at:[29, 17, 'fields'], shells:2, note:'Tucked in the straw of the scarecrow’s coat: 2 🐚!'},
    {id:'townSacks', at:[4, 16, 'town'], fruit:'桃子', note:'In a basket that nobody wants: a {桃子} for your bag!'}
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
    grownUp: {zh:'我 长大 了 ！', en:'I’ve grown up!'},
    thanks: {zh:'谢谢 ！', en:'Thank you!'},
    welcome: {zh:'不客气 ！', en:'You’re welcome!'},
    noProblem: {zh:'没关系 ！', en:'It doesn’t matter!'},
    play: {zh:'我们 玩 吧 ！', en:'Let’s play!'},
    whatWant: {zh:'你 要 什么 ？', en:'What do you want?'},   // the peddler on the high road
    // stallholders calling out what they sell, as you walk past (calls): just for listening
    callBuns: {zh:'包子 ！ 包子 ！', en:'Steamed buns! Steamed buns!'},
    callFruit: {zh:'苹果 ！ 桃子 ！', en:'Apples! Peaches!'},
    // the granny's shopping, one thing at a time
    wantBuns: {zh:'我 要 包子 。', en:'I want some steamed buns.'},
    haveBuns: {zh:'你 有 包子 吗 ？', en:'Do you have a steamed bun?'},
    wantApple: {zh:'我 要 苹果 。', en:'I want an apple.'},
    haveApple: {zh:'你 有 苹果 吗 ？', en:'Do you have an apple?'},
    wantPeach: {zh:'我 要 桃子 。', en:'I want a peach.'},
    havePeach: {zh:'你 有 桃子 吗 ？', en:'Do you have a peach?'},
    // hide and seek with a child in the village (the area's hideSeek): the same lines as the little monkey's at home, and its
    // clues, each about something here, its English leaving the place's word in Chinese
    hideAsk: {zh:'我们 来 捉迷藏 吧 ！', en:'Let’s play hide and seek!'},
    hideCount: {zh:'一 ， 二 ， 三 ， 四 ， 五 ， 六 ， 七 ， 八 ， 九 ， 十 ！', en:'One, two, three, four, five, six, seven, eight, nine, ten!'},
    hideComing: {zh:'我 来 了 ！', en:'Here I come!'},
    hideFound: {zh:'找到 你 了 ！', en:'Found you!'},
    hideTree: {zh:'我 在 大 树 后面 ！', en:'I’m behind the big {树}!'},
    hideWell: {zh:'我 在 井 后面 ！', en:'I’m behind the {井}!'},
    hideHouse: {zh:'我 在 房子 后面 ！', en:'I’m behind the {房子}!'},
    hideGate: {zh:'我 在 门 后面 ！', en:'I’m behind the {门}!'},
    hideWashing: {zh:'我 在 衣服 后面 ！', en:'I’m behind the {衣服|washing}!'},
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
    // the fisherman on the pier wants fish for their basket, once you're dressed: fish beside him (each reeled in with
    // questions, as at home), three of them
    fisher1: [{if:{back:1, oldFisher:1, pierFish:'not asked'}, do:[{request:'pierFish'}]}, {if:{pierFish:'asked'}, do:[{request:'pierFish'}]},
      {do:[{say:'hi'}, {reply:'你好'}]}],
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
    // the hens out of their yard: till you know 鸡, the one in the yard has to teach you; then catch each (a question, as
    // with the crabs: get it wrong, and it runs off somewhere else) and carry it back
    hen1: [{if:{new:'鸡'}, do:[{message:'A chicken runs about, clucking. There’s another one in the yard behind the fence: make friends with it first!'}]},
      {if:{hen1:0}, do:[{grab:'鸡', label:'Catch it!', missed:'The hen flaps out of your hands, and runs off! Try again.'}, {set:{hen1:1}}, {sound:'blip'},
        {message:'You carry the hen back to its yard ({hensBack}/4).'}]},
      {do:[{gap:{sentence:'这 是 鸡', en:'This is a chicken.', word:'鸡', others:['鹅', '鱼', '猫'], pic:'鸡'}}]}],
    hen2: [{if:{new:'鸡'}, do:[{message:'A chicken runs about, clucking. There’s another one in the yard behind the fence: make friends with it first!'}]},
      {if:{hen2:0}, do:[{grab:'鸡', label:'Catch it!', missed:'The hen flaps out of your hands, and runs off! Try again.'}, {set:{hen2:1}}, {sound:'blip'},
        {message:'You carry the hen back to its yard ({hensBack}/4).'}]},
      {do:[{gap:{sentence:'这 是 鸡', en:'This is a chicken.', word:'鸡', others:['鹅', '鱼', '猫'], pic:'鸡'}}]}],
    hen3: [{if:{new:'鸡'}, do:[{message:'A chicken runs about, clucking. There’s another one in the yard behind the fence: make friends with it first!'}]},
      {if:{hen3:0}, do:[{grab:'鸡', label:'Catch it!', missed:'The hen flaps out of your hands, and runs off! Try again.'}, {set:{hen3:1}}, {sound:'blip'},
        {message:'You carry the hen back to its yard ({hensBack}/4).'}]},
      {do:[{gap:{sentence:'这 是 鸡', en:'This is a chicken.', word:'鸡', others:['鹅', '鱼', '猫'], pic:'鸡'}}]}],
    hen4: [{if:{new:'鸡'}, do:[{message:'A chicken runs about, clucking. There’s another one in the yard behind the fence: make friends with it first!'}]},
      {if:{hen4:0}, do:[{grab:'鸡', label:'Catch it!', missed:'The hen flaps out of your hands, and runs off! Try again.'}, {set:{hen4:1}}, {sound:'blip'},
        {message:'You carry the hen back to its yard ({hensBack}/4).'}]},
      {do:[{gap:{sentence:'这 是 鸡', en:'This is a chicken.', word:'鸡', others:['鹅', '鱼', '猫'], pic:'鸡'}}]}],
    kid2: [{if:{child:{below:3}}, do:[{say:'hi'}, {reply:'你好'}]}, {do:[{say:'hideAsk'}, {hideSeek:true}]}],
    kid3: [{do:[{say:'hi'}, {reply:'你好'}]}],
    // the farmer: look, birds! (看); shoo them off his rice; then he's hungry (his lunch, from your bag)
    farmer: [
      {if:{farmer:0}, waits:true, do:[{say:'look', teach:'看'}, {newWord:'看', note:'看 means to look.'}, {set:{farmer:1}},
        {message:'Birds are eating the farmer’s rice! Shoo them off: walk up to each one, and press A.'}]},
      {if:{farmer:1, birdsShooed:{below:5}}, do:[{say:'look'}, {message:'Shoo the birds off the rice ({birdsShooed}/5).'}]},
      {if:{lunch:'not asked'}, do:[{request:'lunch'}]},
      {if:{lunch:'asked'}, do:[{request:'lunch'}]},
      {do:[{say:'hi'}, {reply:'你好'}]}
    ],
    planter: [
      {if:{planter:0}, do:[{say:'hi'}, {reply:'你好'}, {set:{planter:1}}, {bag:'苹果', note:'She’s planting rice over here, all on her own, and glad of the company. She gives you an {苹果} from her lunch basket.'}]},
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
    // the granny's shopping: a bun, then an apple, then a peach
    granny2: [
      {if:{knows:'包子', grannyBuns:'not asked'}, do:[{request:'grannyBuns'}]}, {if:{grannyBuns:'asked'}, do:[{request:'grannyBuns'}]},
      {if:{grannyBuns:'done', grannyApple:'not asked'}, do:[{request:'grannyApple'}]}, {if:{grannyApple:'asked'}, do:[{request:'grannyApple'}]},
      {if:{grannyApple:'done', grannyPeach:'not asked'}, do:[{request:'grannyPeach'}]}, {if:{grannyPeach:'asked'}, do:[{request:'grannyPeach'}]},
      {do:[{say:'hi'}, {reply:'你好'}]}
    ],
    caller: [{do:[{say:'callFruit'}]}],
    traveller1: [{do:[{say:'hi'}, {reply:'你好'}]}],
    traveller2: [{do:[{say:'hi'}, {reply:'你好'}]}],
    traveller3: [{do:[{say:'hi'}, {reply:'你好'}]}],
    angler: [{do:[{say:'hi'}, {reply:'你好'}]}],
    peddler: [{do:[{shop:'peddler'}]}],
    // the docker loading the big boat, once the years have passed: carry four sacks for him
    docker: [
      {if:{years:0}, do:[{say:'hi'}, {reply:'你好'}]},
      {if:{cargo:0}, do:[{say:'hi'}, {set:{cargo:1}}, {message:'The docker is loading the big boat. Help him: carry four sacks from the quay. Face a sack, and press A!'}]},
      {if:{cargo:1, cargoCarried:4}, do:[{set:{cargo:2}}, {say:'thanks'}, {reply:'不客气'}, {coins:3, note:'The docker gives you 3 🪙 for your help.'}]},
      {if:{cargo:1}, do:[{message:'Four sacks, please! ({cargoCarried}/4)'}]},
      {do:[{say:'hi'}, {reply:'你好'}]}
    ],
    pupil1: [{do:[{say:'hi'}, {reply:'你好'}]}],
    grown1: [{do:[{say:'grownUp'}, {message:'It’s one of the children from the school, all grown up, selling kites at a stall of their own!'}]}],
    grown2: [{do:[{say:'grownUp'}, {message:'It’s one of the children from the school, all grown up!'}]}],
    newPupil1: [{do:[{say:'hi'}, {reply:'你好'}]}],
    newPupil2: [{do:[{say:'hi'}, {reply:'你好'}]}],
    teacherOld: [{do:[{say:'listen'}, {message:'The teacher’s hair has gone grey. New children are learning at the school now.'}]}],
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
        {scene:'crossSea'}, {set:{boat:2}}, {goTo:'farShore', at:[16, 19], facing:'up'}]},
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
    // a card for a jump in time, after the years in the town: 很多年以后…… (decided 5 November 2026, with what's changed
    // when you look round: the children grown up, new little pupils, the teacher's hair grey, a new stall)
    manyYearsLater: {watch:'Watch “many years later”', when:{years:1}, captions: [{at:0, zh:'很 多 年 以后 ……', en:'Many years later…'}]},
    // across the western sea, in the boatman's big boat
    crossSea: {watch:'Watch the crossing', when:{boat:2}, captions: [
      {at:0, zh:'有 风 了 ！', en:'The wind’s come!'},
      {at:4, zh:'船 在 海 上 走 。', en:'The boat sails over the sea.'},
      {at:8, zh:'有 山 ！', en:'Mountains!'}
    ]}
  }
};
