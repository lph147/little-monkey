// Area 3: the Eastern Sea (东海), the book's chapter 3: our Chapters 5 and 6. Planned 11 November 2026, with mock-ups drawn by
// the game, and built a step at a time from 15 November 2026 (the plan: https://claude.ai/artifact/2n34PHv9xZA8WeJof6G4Tx;
// the build plan: https://claude.ai/artifact/8uhdkH4xrTY96M7z8feD2R). Chapter 5, under the sea: down from the iron bridge
// in the Water Curtain Cave to the seabed, the Dragon King's palace, the staff and the dragon kings' gifts. Chapter 6, the
// book of names: home with the staff, the dream, and the Great White Planet's invitation to Heaven.
// Its look under water, and its scenes, are in js/sea.js.
//
// Step 1 (15 November 2026): the way down. At the end of Chapter 4 the iron bridge in the Water Curtain Cave offers the
// dive (content/across-the-sea.js), and you land on the seabed, in your bubble of air.
// Step 2 (15 November 2026): the seabed. The sea turtle from your shore swims up and shows you round: your bubble (泡泡),
// the sand (沙子), shells (贝壳: the shells you've collected all game, and your money says so from then), seaweed (水草);
// it swims ahead while you walk (游) to the seaweed, where five starfish hide (海星), each its own colour. Fish swim over
// the sand. The rest of the sea comes in the steps that follow.

// The seabed's letters: sand, seaweed swaying up out of it, shells on the sand, and the sea's things (js/sea.js).
// Each teaches its word as you press A at it (the sand, a shell, the seaweed). The seaweed is where the five starfish hide,
// once the sea turtle has brought you to it (W: seaweed with starfish in it, as the bees' tall flowers have bees).
const SEA_FLOOR = {look:'seaSand', walk:true, word:'沙子', newNote:'沙子 means sand. The seabed is covered in it, soft and pale.'};
const SEA_SHELL_NOTE = '贝壳 means shell. The shells you’ve been collecting all along are 贝壳! From now on, your money says so: 🐚 贝壳.';
const SEA_WEED = {look:'seaweed', walk:true, word:'水草', newNote:'水草 means seaweed: 水 water + 草 grass. It sways round the seabed’s edges.'};
const SEA_LEGEND = {
  '.': SEA_FLOOR,
  'w': {...SEA_WEED, becomes:[{if:{turtle:{atLeast:2}}, to:'W'}]},
  'W': {...SEA_WEED, animals:['starfish']},
  's': {look:'sandShell', walk:true, word:'贝壳', newNote:SEA_SHELL_NOTE}, 'p': {look:'sandShellPink', walk:true, word:'贝壳', newNote:SEA_SHELL_NOTE},
  'n': {look:'sandConch', walk:true, word:'贝壳', newNote:SEA_SHELL_NOTE},
  'R': {look:'seaRock'}, 'B': {look:'seaRockBig'},
  'C': {look:'coral'}, 'O': {look:'coralOrange'}, 'F': {look:'seaFan'}, 'M': {look:'brainCoral'}, 'Q': {look:'clam'},
  'd': {look:'deepSea'}
};

const EASTERN_SEA = {
  number: 3,
  name: {zh:'东海', py:'Dōng Hǎi', en:'The Eastern Sea'},

  // Where you land, on the seabed, under the iron bridge's water.
  start: {x:11, y:6, facing:'down'},

  // What happens as you arrive (diving from the iron bridge: the sail step at the end of Chapter 4): your broadsword still
  // in your paw, the dive, down through the water in your bubble of air, and the first chapter's card.
  begin: [
    {weapon:'刀'},
    {scene:'dive'},
    {chapter:0},
    {set:{landed:1}},
    // (one message: a second would replace it at once, as messages out on the map don't wait)
    {message:'You land softly on the seabed, in your bubble of air. A sea turtle is swimming towards you!'}
  ],

  // The story's chapters here, numbered through the whole story (decided 11 November 2026): the code counts them from 0.
  chapters: [
    {name:'Chapter 5', title:'Under the sea'},
    {name:'Chapter 6', title:'The book of names'}
  ],

  // The journey's goal, and the story's parts (as in Areas 1 and 2).
  goal: 'Find the Dragon King’s palace, deep under the sea, and a weapon fit for a king.',
  parts: [
    {id:'seabed', chapter:0, name:'Part 1', title:'The seabed', when:{landed:1}, card:false,
      story:'You’ve dived from the iron bridge in the Water Curtain Cave, down through the water to the seabed, in a bubble of air. The sea turtle from your shore swims up to show you round. Somewhere down here is the Dragon King’s palace, where the finest weapons in the world are kept.',
      now:'Explore the seabed with the {海龟|sea turtle}. The rest of the {海|sea} is on its way.'}
  ],

  // The day goes round down here too: no rain under the sea, and no bed, so the night passes by itself, as in the human world.
  dayNight: {if:{}, morning:'Good morning! You wake up with your health full.', sleep:[]},
  progress: {chapter:0, landed:0, turtle:0, starFriends:0},
  //   turtle   0 not met yet, 1 said hello (泡泡), 2 led you to the seaweed (游), 3 found all five starfish
  counters: {
    seabedWords: {count:'known', words:['沙子', '贝壳', '水草'], called:{'沙子':'the sand', '贝壳':'a shell', '水草':'the seaweed'}},
    starCount: {count:'progress', key:'starFriends'}   // the starfish in the seaweed you've made friends with (of five)
  },
  running: {knows:'跑'},
  areaMap: {has:{knows:'地图'}, notYet:'You don’t have a map yet.', word:'地图', note:'Every place you go is drawn on your map.'},
  practiseAt: [{text:'with quick practice (练习), in the menu'}],
  // No money of its own: under the sea, what you're given is shells (贝壳), as on Flower Fruit Mountain; your coins stay
  // in your bag for the 老板 at home.
  changes: ['鸟', '鱼', '树', '石头', '猫', '狗', '鸡', '鹅', '鹤', '兔子', '羊', '牛', '花', '桃子', '苹果', '船', '房子', '松树', '妖怪'],

  tasks: [
    {id:'turtle', main:true, if:{landed:1, turtle:0}, text:'A {海龟|sea turtle} is swimming towards you: talk to it', arrow:'turtle'},
    {id:'seabedWords', main:true, if:{turtle:1, seabedWords:{below:3}}, text:'Explore the seabed: things that sparkle ✨ have words ({seabedWords}/3). Still to find: {left:seabedWords}', arrow:{sparkle:true}},
    {id:'turtle2', main:true, if:{turtle:1, seabedWords:3}, text:'Go back to the {海龟|sea turtle}', arrow:'turtle'},
    {id:'starfish', main:true, if:{turtle:2, starFriends:{below:5}}, text:'Find the five {海星|starfish} hiding in the {水草|seaweed} ({starCount}/5)', where:'seabed'},
    {id:'turtle3', main:true, if:{turtle:2, starFriends:5}, text:'Tell the {海龟|sea turtle} you’ve found all five', arrow:'turtle'},
    {id:'seabed', main:true, if:{turtle:3}, text:'The rest of the {海|sea} is on its way. Until then, practise your words and play with your {朋友|friends}', where:'seabed'}
  ],
  hints: [
    {if:{turtle:0}, text:'You’re on the seabed, deep under the {海|sea}. A {海龟|sea turtle} is swimming towards you: walk up to it and press A.'},
    {if:{turtle:1}, text:'The {海龟|sea turtle} is showing you round. Things that sparkle ✨ have words: walk up to one and press A.'},
    {if:{turtle:2}, text:'Walk beside the {水草|seaweed} round the edge of the seabed: where it rustles, something is hiding. Face it and it comes out.'},
    {if:{turtle:3}, text:'The rest of the {海|sea}, and the Dragon King’s palace, are on their way. Until then, practise your words.'}
  ],
  checklist: [
    {part:'seabed', text:'Dive from the iron {桥|bridge}, down to the seabed', done:{landed:1}},
    {part:'seabed', text:'Say hello to the {海龟|sea turtle}', show:{landed:1}, done:{turtle:{atLeast:1}}},
    {part:'seabed', text:'Find the seabed’s three words', show:{turtle:{atLeast:1}}, done:{seabedWords:3}},
    {part:'seabed', text:'Find the five {海星|starfish}', show:{turtle:{atLeast:2}}, done:{starFriends:5}}
  ],
  bubbles: {
    turtle: [{if:{landed:1, turtle:0}, show:'!'}, {if:{turtle:1, seabedWords:3}, show:'!'}, {if:{turtle:2, starFriends:5}, show:'!'}]
  },
  requests: {},
  events: [],

  places: {
    // The seabed, under the iron bridge's water: sand, shells, seaweed, rocks and coral, light rippling over it all.
    seabed: {
      name: {zh:'海底', py:'hǎidǐ', en:'The seabed'},
      onMap: [120, 40, 24, 16],
      underwater: true,
      music: 'sea',
      exits: [],
      // little fish swimming over the sand in schools: [row, how many, map drawing, squares a second, which way]
      schools: [[3, 5, 'fishYellow', .9, -1], [10, 4, 'fishBlue', .7, 1]],
      map: [
        "wwwBBwwwww....wwwwwwCwww",
        "ww........s.....p....www",
        "w..C..........Q.......Fw",
        "w.......n..........s...w",
        "ww..M.......p..........w",
        "w.........s.......O....w",
        "w..p...................w",
        "w......R.........s.....w",
        "ww..........p.......M..w",
        "w....s.........C.......w",
        "w..O.......n...........w",
        "ww.......BB.......p...ww",
        "w...p..........s......Fw",
        "wwC.......s.........wwww",
        "wwww...p.......Q...wwwww",
        "wwwwwwww....wwwwwwwwwwww"
      ]
    }
  },
  legend: SEA_LEGEND,

  // The sea turtle's own voice, Xiaorui (an older woman's: chosen by the owner from round 6 of the voice test, 15 November 2026)
  voices: {words:{provider:'google', name:'cmn-CN-Standard-A'}, everyone:{name:'zh-CN-YunxiNeural', style:'chat'}, turtle:{name:'zh-CN-XiaoruiNeural'}},
  characters: [
    // the sea turtle from your shore (Area 1's friend), swimming over the sand: it greets you as you land, shows you round,
    // and swims ahead to the seaweed where the starfish hide
    {id:'turtle', place:'seabed', x:14, y:6, facing:'left', look:'海龟', flies:true, swims:true,
      moves:[{if:{turtle:{atLeast:2}}, place:'seabed', x:5, y:12, facing:'right'}]}
  ],
  yourNames: [{if:{}, zh:'孙悟空', py:'Sūn Wùkōng', en:'Sun Wukong (you)'}],
  sign: {name:{zh:'牌子', py:'páizi', en:'Sign'}, says:{zh:'海', en:'The sea'}, hint:''},
  spots: [],
  bigSparkles: {landed:0},
  // the seabed's words, once the turtle is showing you round: the sand, a shell, the seaweed
  sparkles: [
    {word:'沙子', at:[9, 8, 'seabed'], if:{turtle:{atLeast:1}}}, {word:'贝壳', at:[10, 5, 'seabed'], if:{turtle:{atLeast:1}}},
    {word:'水草', at:[1, 4, 'seabed'], if:{turtle:{atLeast:1}}}
  ],
  found: {
    '泡泡': 'The sea turtle, as you landed on the seabed in your bubble of air.',
    '沙子': 'The sand all over the seabed.',
    '贝壳': 'The shells on the seabed’s sand: the shells you’ve collected all along.',
    '水草': 'The seaweed round the seabed’s edges.',
    '游': 'The sea turtle, swimming ahead of you to the seaweed.',
    '海星': 'Hiding in the seabed’s seaweed: five of them, each a different colour.'
  },
  practiceSentences: [],
  examples: {
    '沙子': {zh:'海 里 有 很多 沙子 。', en:'There’s lots of sand in the sea.'},
    '贝壳': {zh:'我 有 很多 贝壳 。', en:'I have lots of shells.'},
    '水草': {zh:'海星 在 水草 里 。', en:'The starfish are in the seaweed.'}
  },
  enemies: {},
  // Your broadsword from Chapter 4, in your paw (the staff comes later in Chapter 5).
  battles: {when:{knows:'妖怪'}, weapon:'棍子', hits:10, weapons:{'刀':15},
    restAt:[{at:[11, 6, 'seabed'], facing:'down', lost:'You’re worn out. You rest on the sand until your health is full again.'}]},
  fish: [],
  dragonflies: [],
  animals: [
    // five starfish hiding in the seabed's seaweed, once the sea turtle has brought you to it: each comes out onto the sand
    // and stays there, lying in its own colour (lies, colours: A at one that's your friend shows it, such as 红色的海星)
    {id:'starfish', word:'海星', hides:'seabed', home:'水草', chapter:0, lies:true, colours:['红色', '橙色', '黄色', '粉色', '蓝色'],
      clue:'The seabed, hiding in the seaweed: five of them, each a different colour',
      meetNote:'A starfish creeps out of the {水草|seaweed} onto the {沙子|sand}! Answer its questions to make friends.',
      many:5, counts:'starFriends', counted:[
        [{say:'count1', by:'player'}, {message:'Your first {海星|starfish} friend! It stays out on the sand now. Four more to find.'}],
        [{say:'count2', by:'player'}, {message:'Two {海星|starfish} friends! Three more to find.'}],
        [{say:'count3', by:'player'}, {message:'Three {海星|starfish} friends! Two more to find.'}],
        [{say:'count4', by:'player'}, {message:'Four {海星|starfish} friends! Just one more to find.'}],
        [{say:'count5', by:'player'}]
      ],
      stays:{another:'Another {海星|starfish}, a new one! Answer its questions to make friends with it too ({starCount} of 5 so far).',
        again:'This {海星|starfish} still wants to play! Answer its questions to make friends ({starCount} of 5 so far).',
        lost:'The {海星|starfish} stays on the sand: it still wants to play. Press A at it to try again.'}}
  ],
  birds: {word:'鸟', note:'', colours:[]},
  hidden: [],
  animalsAppear: {knows:'动物'},
  animalsPlay: {say:'play', hint:'It wants to play! Answer its questions to make friends.', friendHint:'Your {朋友} wants to play again! Answer its questions.'},
  tips: {},
  questions: ['listen', 'read', 'gap'],
  // Whoever seals full pages of your scroll: in the steps to come, the Dragon King under the sea, and the old monkey at home.
  scroll: {by:[], snacks:['包子', '蜂蜜', '桃子']},
  // What you can wear and eat here: everything from the areas before (the dragon kings' gifts join the wardrobe in Chapter 5).
  wardrobe: ACROSS_THE_SEA.wardrobe,
  food: ACROSS_THE_SEA.food,

  // What's said here (drafts for the native speaker: CHINESE.md), and your monkey's line as you eat a durian you've
  // brought (its food, as in Area 2).
  lines: {
    tooSmelly: ACROSS_THE_SEA.lines.tooSmelly,
    hello: {zh:'你好 ！', en:'Hello!'},
    longTime: {zh:'好久不见 ！', en:'Long time no see!'},
    inBubble: {zh:'你 在 泡泡 里 ！', en:'You’re in a bubble!'},
    swimWalk: {zh:'我 游 ， 你 走 。', en:'I swim, you walk.'},
    fiveFriends: {zh:'你 有 五 个 海星 朋友 了 ！', en:'You’ve got five starfish friends now!'},
    play: {zh:'我们 玩 吧 ！', en:'Let’s play!'},
    count1: {zh:'一 ！', en:'One!'}, count2: {zh:'二 ！', en:'Two!'}, count3: {zh:'三 ！', en:'Three!'}, count4: {zh:'四 ！', en:'Four!'}, count5: {zh:'五 ！', en:'Five!'}
  },
  talk: {
    // the sea turtle: hello (好久不见 if it's your friend from the shore), your bubble (泡泡); a look round (the sand, a shell,
    // the seaweed); then it swims ahead to the seaweed (游), where five starfish hide; and once you've found them all, shells
    turtle: [
      {if:{turtle:0}, do:[
        {if:{friends:{seaTurtle:true}}, say:'longTime'}, {if:{friends:{seaTurtle:true}}, reply:'好久不见'},
        {if:{friends:{seaTurtle:false}}, say:'hello'}, {if:{friends:{seaTurtle:false}}, reply:'你好'},
        {say:'inBubble', teach:'泡泡'}, {newWord:'泡泡', note:'泡泡 means bubble. You’re in a bubble of air, so you can breathe under the sea!'},
        {set:{turtle:1}}, {message:'The sea turtle wants to show you round. Things that sparkle ✨ have words: walk up to them and press A.'}]},
      {if:{turtle:1, seabedWords:{below:3}}, do:[{message:'The sea turtle waits for you to look round. Still to find: {left:seabedWords}.'}]},
      {if:{turtle:1, seabedWords:3}, do:[
        {say:'swimWalk', teach:'游'}, {newWord:'游', note:'游 means to swim. The turtle swims, and you walk on the sand in your bubble.'},
        {leadTo:[5, 12], you:[6, 12, 'left']}, {set:{turtle:2}},
        {message:'The sea turtle has brought you to the {水草|seaweed}. Five {海星|starfish} are hiding in it: find them all!'}]},
      {if:{turtle:2, starFriends:{below:5}}, do:[{message:'The sea turtle says five {海星|starfish} are hiding in the {水草|seaweed}. You’ve found {starCount} so far.'}]},
      {if:{turtle:2, starFriends:5}, do:[{say:'fiveFriends'}, {shells:5, note:'The sea turtle gives you 5 🐚 贝壳 it found on the seabed.'}, {set:{turtle:3}},
        {message:'To be continued: the rest of the sea is on its way!'}]},
      {do:[{say:'swimWalk'}]}
    ]
  },
  story: [],
  storyQuestions: [],
  storyEnd: {title:'', reward:0, rumble:false, text:[]},
  exit: {notReady:'Not yet.', ready:'Ready.', tryAgain:'Try again.', passButton:'OK', failButton:'OK', done:'Done.', notBuilt:'Not built yet.', returnTo:{x:11, y:6, facing:'down'}},
  intro: [],
  scenes: {
    // diving from the iron bridge in the Water Curtain Cave, down through the water in your bubble of air, to the seabed
    dive: {watch:'Watch the dive', part:'seabed', when:{landed:1}, captions: [
      {at:0, zh:'一 ， 二 ， 三 ， 跳 ！', en:'One, two, three, jump!'},
      {at:3.5, zh:'水 里 有 很多 鱼 。', en:'There are lots of fish in the water.'},
      {at:7, zh:'孙悟空 在 海 下面 ！', en:'Sun Wukong is under the sea!'}
    ]}
  }
};
