// Area 3: the Eastern Sea (东海), the book's chapter 3: our Chapters 5 and 6. Planned 11 November 2026, with mock-ups drawn by
// the game, and built a step at a time from 15 November 2026 (the plan: https://claude.ai/artifact/2n34PHv9xZA8WeJof6G4Tx;
// the build plan: https://claude.ai/artifact/8uhdkH4xrTY96M7z8feD2R). Chapter 5, under the sea: down from the iron bridge
// in the Water Curtain Cave to the seabed, the Dragon King's palace, the staff and the dragon kings' gifts. Chapter 6, the
// book of names: home with the staff, the dream, and the Great White Planet's invitation to Heaven.
// Its look under water, and its scenes, are in js/sea.js.
//
// Step 1 (15 November 2026): the way down. At the end of Chapter 4 the iron bridge in the Water Curtain Cave offers the
// dive (content/across-the-sea.js), and you land on the seabed, in your bubble of air. The rest of the sea comes in the
// steps that follow.

// The seabed's letters: sand, seaweed swaying up out of it, shells on the sand, and the sea's things (js/sea.js).
const SEA_LEGEND = {
  '.': {look:'seaSand', walk:true},
  'w': {look:'seaweed', walk:true},
  's': {look:'sandShell', walk:true}, 'p': {look:'sandShellPink', walk:true}, 'n': {look:'sandConch', walk:true},
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
    {message:'You land softly on the seabed, in your bubble of air. To be continued: the rest of the sea is on its way!'}
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
      story:'You’ve dived from the iron bridge in the Water Curtain Cave, down through the water to the seabed, in a bubble of air. Somewhere down here is the Dragon King’s palace, where the finest weapons in the world are kept.',
      now:'Explore the seabed. The rest of the {海|sea} is on its way.'}
  ],

  // The day goes round down here too: no rain under the sea, and no bed, so the night passes by itself, as in the human world.
  dayNight: {if:{}, morning:'Good morning! You wake up with your health full.', sleep:[]},
  progress: {chapter:0, landed:0},
  counters: {},
  running: {knows:'跑'},
  areaMap: {has:{knows:'地图'}, notYet:'You don’t have a map yet.', word:'地图', note:'Every place you go is drawn on your map.'},
  practiseAt: [{text:'with quick practice (练习), in the menu'}],
  // Coins, as Chapter 4 left them (the 老板 at home sells in coins).
  money: {when:{knows:'钱'}},
  changes: ['鸟', '鱼', '树', '石头', '猫', '狗', '鸡', '鹅', '鹤', '兔子', '羊', '牛', '花', '桃子', '苹果', '船', '房子', '松树', '妖怪'],

  tasks: [
    {id:'seabed', main:true, if:{landed:1}, text:'Explore the seabed. The rest of the {海|sea} is on its way.', where:'seabed'}
  ],
  hints: [
    {if:{landed:1}, text:'You’re on the seabed, deep under the {海|sea}. The rest of the {海|sea}, and the Dragon King’s palace, are on their way. Until then, explore, and practise your words.'}
  ],
  checklist: [
    {part:'seabed', text:'Dive from the iron {桥|bridge}, down to the seabed', done:{landed:1}}
  ],
  bubbles: {},
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

  voices: {words:{provider:'google', name:'cmn-CN-Standard-A'}, everyone:{name:'zh-CN-YunxiNeural', style:'chat'}, elder:{name:'zh-CN-YunzeNeural'}},
  characters: [],
  yourNames: [{if:{}, zh:'孙悟空', py:'Sūn Wùkōng', en:'Sun Wukong (you)'}],
  sign: {name:{zh:'牌子', py:'páizi', en:'Sign'}, says:{zh:'海', en:'The sea'}, hint:''},
  spots: [],
  bigSparkles: {landed:0},
  sparkles: [],
  found: {},
  practiceSentences: [],
  examples: {},
  enemies: {},
  // Your broadsword from Chapter 4, in your paw (the staff comes later in Chapter 5).
  battles: {when:{knows:'妖怪'}, weapon:'棍子', hits:10, weapons:{'刀':15},
    restAt:[{at:[11, 6, 'seabed'], facing:'down', lost:'You’re worn out. You rest on the sand until your health is full again.'}]},
  fish: [],
  dragonflies: [],
  animals: [],
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

  // What's said here: for now only your monkey's line as you eat a durian you've brought (its food, as in Area 2).
  lines: {tooSmelly: ACROSS_THE_SEA.lines.tooSmelly},
  talk: {},
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
