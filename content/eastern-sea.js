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
// the sand.
// Step 3 (15 November 2026): the seaweed forest, east of the seabed, once you've found the starfish: tall seaweed where
// sharks and jellyfish hide (鲨鱼, 水母), the turtle's warning (小心), and the octopus among the rocks (章鱼), who counts
// its feet with you (脚, 几).
// Step 4 (15 November 2026): the coral reef, east of the forest once you've counted the octopus's feet: coral in the colours
// you know (珊瑚), a seahorse among it (海马), and a dolphin who wants a race (海豚), as PE's: it wins the first time, by
// miles (快), the turtle puffing along last (慢); win one and it gives you shells.
// Step 5 (15 November 2026): the trench, past the reef once you've beaten the dolphin: currents sweeping across the way down,
// as the gusts of wind on the cliff road (cross while they're calm), the edge of the deep (深), a whale gliding in it, met
// from the edge (鲸鱼), and at the very bottom a light (光): the Dragon King's palace. It comes in the steps that follow.

// The seabed's letters: sand, seaweed swaying up out of it, shells on the sand, and the sea's things (js/sea.js).
// Each teaches its word as you press A at it (the sand, a shell, the seaweed). The seaweed is where the five starfish hide,
// once the sea turtle has brought you to it (W: seaweed with starfish in it, as the bees' tall flowers have bees).
const SEA_FLOOR = {look:'seaSand', walk:true, word:'沙子', newNote:'沙子 means sand. The seabed is covered in it, soft and pale.'};
const SEA_SHELL_NOTE = '贝壳 means shell. The shells you’ve been collecting all along are 贝壳! From now on, your money says so: 🐚 贝壳.';
const SEA_WEED = {look:'seaweed', walk:true, word:'水草', newNote:'水草 means seaweed: 水 water + 草 grass. It sways round the seabed’s edges.'};
// The seaweed forest's own letter: tall seaweed, where sharks and jellyfish hide, as wild creatures hide in long grass;
// it parts round you as you walk through (js/sea.js).
const FOREST_LEGEND = {'T': {look:'tallSeaweed', walk:true, word:'水草', wild:['shark', 'jelly']}};
// The coral reef's: its coral teaches 珊瑚 (a pink one or an orange one shows its colour once you know both, as a flower does),
// and the dolphin's race track across the sand, its start (g) and finish (f).
const REEF_LEGEND = {
  'C': {look:'coral', word:'珊瑚', colour:'粉色'}, 'O': {look:'coralOrange', word:'珊瑚', colour:'橙色'},
  'F': {look:'seaFan', word:'珊瑚'}, 'M': {look:'brainCoral', word:'珊瑚'},
  'g': {look:'raceStart', walk:true, word:'沙子'}, 'f': {look:'raceFinish', walk:true, word:'沙子'}
};
// The trench's: currents sweeping across it, every row at once, pushing you back while they flow (as the cliff road's gusts
// of wind: a vent with current), and the glow at the very bottom, from the palace below.
const TRENCH_LEGEND = {
  '~': {look:'currentSand', walk:true, word:'沙子', vent:{current:true, every:3600, puff:1700, at:0,
    hot:'The current is too strong! Wait for it to drop, then cross quickly.', pushed:'Whoosh! The current sweeps you back.'}},
  'v': {look:'trenchGlow', landmark:true}
};
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
      now:'Explore the seabed with the {海龟|sea turtle}.'},
    {id:'forest', chapter:0, name:'Part 2', title:'The seaweed forest', when:{turtle:3},
      text:'East of the seabed, the seaweed grows tall and thick, with shafts of light falling through it. Sharks hide in it, and jellyfish drift about. And somewhere among the rocks, something is watching you…',
      now:'Explore the seaweed forest.'},
    {id:'reef', chapter:0, name:'Part 3', title:'The coral reef', when:{octopus:1},
      text:'Further east, coral grows everywhere, pink and orange and purple, and little fish dart in and out of it. A dolphin is leaping about, looking for someone to race…',
      now:'Race the dolphin on the coral reef.'},
    {id:'trench', chapter:0, name:'Part 4', title:'The trench', when:{dolphin:2},
      text:'Past the reef, the seabed drops away into the dark. Currents sweep across the way down, something huge is singing far below, and at the very bottom, something glows…',
      now:'Cross the currents, and find the way down to the bottom of the trench. The rest of the {海|sea} is on its way.'}
  ],

  // The day goes round down here too: no rain under the sea, and no bed, so the night passes by itself, as in the human world.
  dayNight: {if:{}, morning:'Good morning! You wake up with your health full.', sleep:[]},
  progress: {chapter:0, landed:0, turtle:0, starFriends:0, forest:0, octopus:0, dolphin:0, trench:0},
  //   turtle   0 not met yet, 1 said hello (泡泡), 2 led you to the seaweed (游), 3 found all five starfish: off to the forest
  //   forest   0 not in the seaweed forest yet, 1 met your first shark there (小心, 鲨鱼)
  //   octopus  0 hasn't counted its feet with you yet, 1 has (脚, 几): off to the coral reef
  //   dolphin  0 hasn't raced you yet, 1 has, and won (快, 慢), 2 you've won a race: off to the trench
  //   trench   0 not across its currents yet, 1 across them, at the edge of the deep (深), 2 seen the light at the bottom (光)
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
    {id:'toForest', main:true, if:{turtle:3, forest:0}, text:'Follow the {海龟|sea turtle} east, into the seaweed forest', arrow:{place:'forest'}},
    {id:'octopus', main:true, if:{forest:1, friends:{octopus:false}}, text:'Something is hiding among the {石头|rocks} in the north of the seaweed forest: go and see', arrow:[13, 2, 'forest']},
    {id:'octopus2', main:true, if:{friends:{octopus:true}, octopus:0}, text:'The {章鱼|octopus} wants to show you something', arrow:'octopus'},
    {id:'toReef', main:true, if:{octopus:1, dolphin:0, away:'reef'}, text:'Follow the {海龟|sea turtle} east, to the coral reef', arrow:{place:'reef'}},
    {id:'dolphin', main:true, if:{octopus:1, dolphin:0, place:'reef'}, text:'Someone on the coral reef wants a race', arrow:'dolphin'},
    {id:'dolphin2', main:true, if:{dolphin:1}, text:'Race the {海豚|dolphin} again, and win', arrow:'dolphin'},
    {id:'toTrench', main:true, if:{dolphin:2, trench:0, away:'trench'}, text:'Follow the {海龟|sea turtle} east, to the trench', arrow:{place:'trench'}},
    {id:'currents', main:true, if:{dolphin:2, trench:0, place:'trench'}, text:'Cross the currents to the {海龟|sea turtle}: wait till they drop, then go', arrow:'turtle'},
    {id:'whale', if:{trench:{atLeast:1}, friends:{whale:false}}, text:'Something huge is gliding in the deep {水|water}: meet it from the edge', arrow:[8, 9, 'trench']},
    {id:'glow', main:true, if:{trench:1}, text:'Follow the slope down to the bottom of the trench', arrow:[19, 13, 'trench']},
    {id:'trench', main:true, if:{trench:2}, text:'The rest of the {海|sea}, and the Dragon King’s palace, are on their way. Until then, practise your words', where:'trench'}
  ],
  hints: [
    {if:{turtle:0}, text:'You’re on the seabed, deep under the {海|sea}. A {海龟|sea turtle} is swimming towards you: walk up to it and press A.'},
    {if:{turtle:1}, text:'The {海龟|sea turtle} is showing you round. Things that sparkle ✨ have words: walk up to one and press A.'},
    {if:{turtle:2}, text:'Walk beside the {水草|seaweed} round the edge of the seabed: where it rustles, something is hiding. Face it and it comes out.'},
    {if:{turtle:3, forest:0}, text:'The {海龟|sea turtle} has swum east, into the seaweed forest. Walk off the {东边|east} side of the seabed to follow it.'},
    {if:{octopus:1, dolphin:{below:2}}, text:'The {海豚|dolphin} on the coral reef wants a race: talk to it. To win, hold B as you walk, to {跑|run}, and set off as soon as it says {游|swim}.'},
    {if:{dolphin:2, trench:0}, text:'Currents flow across the trench, all at once: wait till they drop, then cross quickly. If one catches you, it pushes you back.'},
    {if:{trench:1}, text:'A slope of {沙子|sand} runs down at the east side of the trench, to the very bottom. And something huge glides in the deep {水|water} below the edge.'},
    {if:{trench:2}, text:'The rest of the {海|sea}, and the Dragon King’s palace, are on their way. Until then, practise your words.'},
    {if:{forest:1, octopus:0}, text:'{鲨鱼|Sharks} and jellyfish hide in the tall seaweed, and come out as you walk through it. The {章鱼|octopus} lives among the rocks in the north. The rest of the {海|sea} is on its way.'}
  ],
  checklist: [
    {part:'seabed', text:'Dive from the iron {桥|bridge}, down to the seabed', done:{landed:1}},
    {part:'seabed', text:'Say hello to the {海龟|sea turtle}', show:{landed:1}, done:{turtle:{atLeast:1}}},
    {part:'seabed', text:'Find the seabed’s three words', show:{turtle:{atLeast:1}}, done:{seabedWords:3}},
    {part:'seabed', text:'Find the five {海星|starfish}', show:{turtle:{atLeast:2}}, done:{starFriends:5}},
    {part:'forest', text:'Go into the seaweed forest', done:{forest:1}},
    {part:'forest', text:'Meet a {水母|jellyfish} in the tall seaweed', show:{forest:1}, done:{knows:'水母'}},
    {part:'forest', text:'Make friends with whoever is hiding among the {石头|rocks}', show:{forest:1}, done:{friends:{octopus:true}}},
    {part:'forest', text:'Play the {章鱼|octopus}’s counting game', show:{friends:{octopus:true}}, done:{octopus:1}},
    {part:'reef', text:'Find the {珊瑚|coral} growing all over the reef', done:{knows:'珊瑚'}},
    {part:'reef', text:'Race the {海豚|dolphin}', done:{dolphin:{atLeast:1}}},
    {part:'reef', text:'Win a race against the {海豚|dolphin}', show:{dolphin:{atLeast:1}}, done:{dolphin:2}},
    {part:'reef', text:'Make friends with whoever is among the {珊瑚|coral} to the north', done:{friends:{seahorse:true}}},
    {part:'trench', text:'Cross the currents', done:{trench:{atLeast:1}}},
    {part:'trench', text:'Make friends with what’s gliding in the deep {水|water}', show:{trench:{atLeast:1}}, done:{friends:{whale:true}}},
    {part:'trench', text:'Get down to the bottom of the trench', show:{trench:{atLeast:1}}, done:{trench:2}}
  ],
  bubbles: {
    turtle: [{if:{landed:1, turtle:0}, show:'!'}, {if:{turtle:1, seabedWords:3}, show:'!'}, {if:{turtle:2, starFriends:5}, show:'!'}, {if:{dolphin:2, trench:0}, show:'!'}],
    octopus: [{if:{friends:{octopus:true}, octopus:0}, show:'!'}],
    dolphin: [{if:{octopus:1, dolphin:0}, show:'!'}, {if:{dolphin:1}, show:'!'}]
  },
  requests: {},
  events: [
    // into the seaweed forest: the sea turtle's warning (小心), and your first shark shoots out of the seaweed
    {if:{place:'forest', forest:0, around:[3, 7, 'forest', 1]}, do:[
      {say:'careful', by:'turtle', teach:'小心'}, {newWord:'小心', note:'小心 means careful! Say it when someone might get hurt.'},
      {battle:'shark', out:true, retry:true, meet:'A {鲨鱼|shark} shoots out of the seaweed at you!', back:{at:[1, 7, 'forest'], facing:'right'},
        lost:'You swim back to the edge of the forest to catch your breath.',
        win:[{set:{forest:1}}, {message:'Sharks and jellyfish hide in the tall seaweed. And something is hiding among the rocks to the north…'}]}]},
    // across the trench's currents, the turtle at the edge of the deep (深); then down at the very bottom, the light (光)
    {if:{place:'trench', trench:0, around:[4, 9, 'trench', 2]}, do:[
      {say:'deep', by:'turtle', teach:'深'}, {newWord:'深', note:'深 means deep. The water below the edge goes down and down, darker and darker.'},
      {set:{trench:1}}, {message:'Something huge is gliding in the deep water below the edge. And a slope of sand runs down at the east side, to the very bottom…'}]},
    {if:{place:'trench', trench:1, around:[19, 13, 'trench', 1]}, do:[
      {say:'lightBelow', by:'player', teach:'光'}, {newWord:'光', note:'光 means light. Far below, at the very bottom of the trench, something is shining.'},
      {set:{trench:2}}, {message:'To be continued: the light far below is the Dragon King’s palace, and the way down is on its way!'}]}
  ],

  places: {
    // The seabed, under the iron bridge's water: sand, shells, seaweed, rocks and coral, light rippling over it all.
    seabed: {
      name: {zh:'海底', py:'hǎidǐ', en:'The seabed'},
      onMap: [120, 40, 24, 16],
      underwater: true,
      music: 'sea',
      // east, to the seaweed forest, once the starfish are found
      exits: [{at:[23, 6], to:'forest', arrive:[1, 7], facing:'right', if:{turtle:{atLeast:3}}, closed:'The seaweed grows thick here. The sea turtle wants to show you round the seabed first.'}],
      backdrop: 'sea',
      // little fish swimming over the sand in schools: [row, how many, map drawing, squares a second, which way]
      schools: [[3, 5, 'fishYellow', .9, -1], [10, 4, 'fishBlue', .7, 1]],
      map: [
        "wwwBBwwwww....wwwwwwCwww",
        "ww........s.....p....www",
        "w..C..........Q.......Fw",
        "w.......n..........s...w",
        "ww..M.......p..........w",
        "w.........s.......O....w",
        "w..p....................",
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
    },
    // The seaweed forest, east of the seabed: tall seaweed all round a sandy clearing, sharks and jellyfish hiding in it,
    // jellyfish drifting over it, and the octopus among the rocks to the north. The way on east comes in the next step.
    forest: {
      name: {zh:'水草林', py:'shuǐcǎo lín', en:'The seaweed forest'},
      onMap: [150, 42, 26, 16],
      underwater: true,
      music: 'sea',
      backdrop: 'sea',
      legend: FOREST_LEGEND,
      exits: [{at:[0, 7], to:'seabed', arrive:[22, 6], facing:'left'},
        {at:[25, 7], to:'reef', arrive:[1, 7], facing:'right', if:{octopus:{atLeast:1}}, closed:'The seaweed grows too thick to get through here, for now.'}],
      jellies: [[5, 4], [21, 9], [12, 12], [22, 2]],
      schools: [[4, 4, 'fishBlue', .6, 1], [11, 5, 'fishYellow', .8, -1]],
      map: [
        "wwwwwwwwwwwwwwwwwwwwwwwwww",
        "wTTTTTTw...R..BB..wTTTTTTw",
        "wTTTTTT...R....R...TTTTTTw",
        "wTTTTT...s.R...R....TTTTTw",
        "wTTTT.........p......TTTTw",
        "wwTTT....TTTTTT....n..TTTw",
        "w.......TTTTTTTT.......TTw",
        "........TTTTTTTTT.........",
        "w..s....TTTTTTTTT....s...w",
        "wTT......TTTTTTT.........w",
        "wTTTT..........p....TTTTTw",
        "wTTTTTT....C.......TTTTTTw",
        "wTTTTTTT.......O..TTTTTTTw",
        "wTTTTTTTT..F...TTTTTTTTTTw",
        "wwTTTTTTTTT...TTTTTTTTTTww",
        "wwwwwwwwwwwwwwwwwwwwwwwwww"
      ]
    },
    // The coral reef, east of the seaweed forest: coral in the colours you know all round, little fish darting through it,
    // the seahorse among the coral to the north, and the dolphin's race track across the sand. The way on east comes later.
    reef: {
      name: {zh:'珊瑚礁', py:'shānhú jiāo', en:'The coral reef'},
      onMap: [180, 42, 26, 16],
      underwater: true,
      music: 'sea',
      backdrop: 'sea',
      legend: REEF_LEGEND,
      exits: [{at:[0, 7], to:'forest', arrive:[24, 7], facing:'left'},
        {at:[25, 7], to:'trench', arrive:[1, 3], facing:'right', if:{dolphin:2}, closed:'The coral grows too thick to get through here, for now.'}],
      schools: [[3, 6, 'fishYellow', 1.1, 1], [6, 4, 'fishBlue', .9, -1], [12, 5, 'fishYellow', .7, -1]],
      map: [
        "wwwwwwwwwwwwwwwwwwwwwwwwww",
        "wCC..OC..FF..CO..MC..OOCCw",
        "wC....C.......C......C...w",
        "wO..p.....n.......s....OCw",
        "wF.......CC....OO.......Cw",
        "wC...........M......p...Ow",
        "w..s...O.............C...w",
        ".......................s..",
        "wC.......................w",
        "wO.g..........f.........Cw",
        "wC.g..........f..........w",
        "wF.g..........f.........Ow",
        "wC.......................w",
        "wOC...p....C....O...F..CCw",
        "wwCOC..MCC..OCC..CCO..COww",
        "wwwwwwwwwwwwwwwwwwwwwwwwww"
      ]
    },
    // The trench, past the reef: a ledge of sand, then currents sweeping across the way down, every row at once, a ledge
    // at the edge of the deep where the whale glides, and a slope down at the east side to the very bottom, where the
    // palace's light shines up out of the dark. The way down to the palace comes in the next step.
    trench: {
      name: {zh:'海沟', py:'hǎigōu', en:'The trench'},
      onMap: [210, 46, 26, 16],
      underwater: true,
      music: 'sea',
      backdrop: 'sea',
      legend: TRENCH_LEGEND,
      exits: [{at:[0, 3], to:'reef', arrive:[24, 7], facing:'left'}],
      schools: [[2, 4, 'fishBlue', .7, 1]],
      map: [
        "wwwwwwwwwwwwwwwwwwwwwwwwww",
        "wC....R.....BB.....R...ddw",
        "w..s......p.......n...dddw",
        "...............s.....ddddw",
        "wR....M..............ddddw",
        "w~~~~~~~~~~~~~~~~~~~~ddddw",
        "w~~~~~~~~~~~~~~~~~~~~ddddw",
        "w~~~~~~~~~~~~~~~~~~~~ddddw",
        "wR..p..........s.....ddddw",
        "wC.......n...........ddddw",
        "wwwddddddddddd.......ddddw",
        "wdddddddddddddd......ddddw",
        "wddddddddddddddd.....ddddw",
        "wdddddddddddddddd....ddddw",
        "wddddddddddddddddd..vddddw",
        "wdddddddddddddddddvvvvdddw"
      ]
    }
  },
  legend: SEA_LEGEND,

  // Its characters' own voices, chosen by the owner from round 6 of the voice test: the sea turtle's, Xiaorui (an older
  // woman's, 15 November 2026); the Dragon King's, Yunyang (a deep, steady man's), and the Dragon Queen's, Xiaohan (a warm
  // woman's), both 16 November 2026, for the palace (step 6 on)
  voices: {words:{provider:'google', name:'cmn-CN-Standard-A'}, everyone:{name:'zh-CN-YunxiNeural', style:'chat'}, turtle:{name:'zh-CN-XiaoruiNeural'},
    dragonKing:{name:'zh-CN-YunyangNeural'}, dragonQueen:{name:'zh-CN-XiaohanNeural'}},
  characters: [
    // the sea turtle from your shore (Area 1's friend), swimming over the sand: it greets you as you land, shows you round,
    // and swims ahead to the seaweed where the starfish hide
    {id:'turtle', place:'seabed', x:14, y:6, facing:'left', look:'海龟', flies:true, swims:true,
      moves:[{if:{dolphin:2}, place:'trench', x:4, y:9, facing:'up'}, {if:{octopus:{atLeast:1}}, place:'reef', x:2, y:6, facing:'right'}, {if:{turtle:{atLeast:3}}, place:'forest', x:3, y:6, facing:'right'}, {if:{turtle:{atLeast:2}}, place:'seabed', x:5, y:12, facing:'right'}]},
    // the octopus among the seaweed forest's rocks, once it's your friend (till then, the animal there: see animals)
    {id:'octopus', place:'forest', x:13, y:2, facing:'down', look:'章鱼', moves:[{if:{friends:{octopus:false}}, place:'gone', x:0, y:0}]},
    // the dolphin on the coral reef, leaping about by the race track, wanting a race
    {id:'dolphin', place:'reef', x:4, y:8, facing:'down', look:'海豚', flies:true, swims:true}
  ],
  yourNames: [{if:{}, zh:'孙悟空', py:'Sūn Wùkōng', en:'Sun Wukong (you)'}],
  sign: {name:{zh:'牌子', py:'páizi', en:'Sign'}, says:{zh:'海', en:'The sea'}, hint:''},
  spots: [],
  bigSparkles: {landed:0},
  // the seabed's words, once the turtle is showing you round: the sand, a shell, the seaweed
  sparkles: [
    {word:'沙子', at:[9, 8, 'seabed'], if:{turtle:{atLeast:1}}}, {word:'贝壳', at:[10, 5, 'seabed'], if:{turtle:{atLeast:1}}},
    {word:'水草', at:[1, 4, 'seabed'], if:{turtle:{atLeast:1}}},
    {word:'珊瑚', at:[1, 8, 'reef']}
  ],
  found: {
    '泡泡': 'The sea turtle, as you landed on the seabed in your bubble of air.',
    '沙子': 'The sand all over the seabed.',
    '贝壳': 'The shells on the seabed’s sand: the shells you’ve collected all along.',
    '水草': 'The seaweed round the seabed’s edges.',
    '游': 'The sea turtle, swimming ahead of you to the seaweed.',
    '海星': 'Hiding in the seabed’s seaweed: five of them, each a different colour.',
    '小心': 'The sea turtle, as your first shark shot out of the seaweed forest’s tall seaweed.',
    '鲨鱼': 'Hiding in the seaweed forest’s tall seaweed.',
    '水母': 'Drifting in the seaweed forest’s tall seaweed, more of them at night.',
    '章鱼': 'Among the rocks in the north of the seaweed forest, squirting ink.',
    '脚': 'The octopus in the seaweed forest, waving its eight feet.',
    '几': 'The octopus in the seaweed forest, asking how many feet it has.',
    '珊瑚': 'All over the coral reef, pink and orange and more.',
    '海马': 'Among the coral reef’s coral, to the north.',
    '海豚': 'On the coral reef, wanting a race.',
    '快': 'The sea turtle, after the dolphin won its first race: 海豚很快！',
    '慢': 'The sea turtle, puffing along last in the dolphin’s race: 我很慢。',
    '深': 'The sea turtle, at the edge of the deep in the trench: 这里很深！',
    '鲸鱼': 'Gliding in the trench’s deep water, below the edge.',
    '光': 'The light shining up from the very bottom of the trench: 下面有光！'
  },
  practiceSentences: [
    {sentence:'我 有 几 只 脚', sentenceEn:'How many feet have I got?'}   // (几, which has no picture)
  ],
  examples: {
    '沙子': {zh:'海 里 有 很多 沙子 。', en:'There’s lots of sand in the sea.'},
    '贝壳': {zh:'我 有 很多 贝壳 。', en:'I have lots of shells.'},
    '水草': {zh:'海星 在 水草 里 。', en:'The starfish are in the seaweed.'},
    '水母': {zh:'海 里 有 水母 。', en:'There are jellyfish in the sea.'},
    '章鱼': {zh:'章鱼 有 八 只 脚 。', en:'An octopus has eight feet.'},
    '珊瑚': {zh:'海 里 有 珊瑚 。', en:'There’s coral in the sea.'},
    '海马': {zh:'海马 很 小 。', en:'The seahorse is small.'},
    '鲸鱼': {zh:'鲸鱼 很 大 。', en:'The whale is very big.'}
  },
  // What hides in the seaweed forest's tall seaweed (step 3): sharks, and jellyfish, more of them at night
  enemies: {
    shark: {word:'鲨鱼', health:30, hits:10, attacks:['泡泡', '沙子', '贝壳', '水草', '海星'], meetNote:'A shark shoots out of the tall seaweed!', meet:'A {鲨鱼} swims at you!',
      hide:'The {鲨鱼} darts out of sight…', attack:'The {鲨鱼} snaps at you!', away:'The {鲨鱼} swims off into the seaweed.', sniff:'The {鲨鱼} sniffs the water, and swims off!', reward:2},
    jelly: {word:'水母', health:20, hits:8, day:.5, night:2, attacks:['泡泡', '沙子', '贝壳', '水草', '海星'], meetNote:'A jellyfish drifts out of the tall seaweed, glowing!', meet:'A {水母} drifts at you!',
      hide:'The {水母} drifts out of sight…', attack:'The {水母} stings you!', away:'The {水母} drifts off into the seaweed.', sniff:'The {水母} drifts away from the smell!', reward:1}
  },
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
        lost:'The {海星|starfish} stays on the sand: it still wants to play. Press A at it to try again.'}},
    // the octopus among the seaweed forest's rocks, squirting ink as you meet it (inks); once it's your friend, it stays
    // there to talk to (leaves: the octopus character takes its place)
    {id:'octopus', word:'章鱼', at:[13, 2, 'forest'], leaves:true, inks:true, home:'海', chapter:0, clue:'The seaweed forest, among the rocks to the north',
      meetNote:'An octopus pops up from behind the rocks, squirts a cloud of ink, and peeks out at you! Answer its questions to make friends.'},
    // a seahorse among the coral reef's coral, to the north
    {id:'seahorse', word:'海马', at:[13, 2, 'reef'], home:'珊瑚', chapter:0, clue:'The coral reef, among the coral to the north',
      meetNote:'A seahorse bobs among the coral, its tail curled round a branch! Answer its questions to make friends.'},
    // a whale gliding in the trench's deep water, met from the edge above it
    {id:'whale', word:'鲸鱼', at:[8, 10, 'trench'], glides:true, home:'海', chapter:0, clue:'The trench, gliding in the deep water below the edge',
      meetNote:'A huge whale glides up out of the deep, singing! Answer its questions to make friends.'}
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
    careful: {zh:'小心 ！ 有 鲨鱼 ！', en:'Careful! A shark!'},
    eightFeet: {zh:'我 有 八 只 脚 ！', en:'I’ve got eight feet!'},
    howManyFeet: {zh:'我 有 几 只 脚 ？', en:'How many feet have I got?'},
    countFeet: {zh:'这里 有 几 只 脚 ？', en:'How many feet are here?'},
    great: {zh:'太 好 了 ！', en:'Great!'},
    letsRace: {zh:'我们 游 吧 ！', en:'Let’s swim!'},
    startRace: {zh:'一 ， 二 ， 三 ， 游 ！', en:'One, two, three, swim!'},
    fast: {zh:'海豚 很 快 ！', en:'The dolphin is fast!'},
    slow: {zh:'我 很 慢 。', en:'I’m slow.'},
    deep: {zh:'这里 很 深 ！', en:'It’s deep here!'},
    lightBelow: {zh:'下面 有 光 ！', en:'There’s light down there!'},
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
        {message:'The sea turtle swims off east, into the seaweed forest. Follow it!'}]},
      {do:[{say:'swimWalk'}]}
    ],
    // the octopus, once it's your friend: its eight feet (脚), how many (几), then counting its feet with you
    octopus: [
      {if:{octopus:0}, do:[
        {say:'eightFeet', teach:'脚'}, {newWord:'脚', note:'脚 means foot. The octopus calls its eight arms its feet!'},
        {say:'howManyFeet', teach:'几'}, {newWord:'几', note:'几 means how many, when it’s a few: 几只脚？ How many feet? You answer with a number: 八只脚, eight feet.'},
        {countGame:'feet'}, {set:{octopus:1}},
        {message:'The sea turtle swims on east, to the coral reef. Follow it!'}]},
      {do:[{countGame:'feet'}]}
    ],
    // the dolphin: its name as you meet it (海豚), then a race, as PE's, which it wins by miles the first time; the turtle,
    // puffing along last, says why (快, 慢); then race it again, and win (the first win: shells)
    dolphin: [
      {if:{dolphin:0}, do:[
        {newWord:'海豚', met:true, note:'海豚 means dolphin. It’s the fastest swimmer in the sea, and it wants a race!'},
        {say:'letsRace'}, {race:'first'},
        {say:'fast', by:'turtle', teach:'快'}, {newWord:'快', note:'快 means fast: 海豚很快！ The dolphin is fast!'},
        {say:'slow', by:'turtle', teach:'慢'}, {newWord:'慢', note:'慢 means slow: 我很慢。 The turtle is slow!'},
        {set:{dolphin:1}},
        {if:{knows:'跑'}, message:'Race the dolphin again! Hold B as you walk, to run, and set off as soon as it says {游|swim}.'},
        {if:{new:'跑'}, message:'Race the dolphin again! Set off as soon as it says {游|swim}.'}]},
      {if:{dolphin:1}, do:[{say:'letsRace'}, {race:'again', win:[{set:{dolphin:2}}, {message:'The sea turtle swims on east, towards the trench. Follow it!'}]}]},
      {do:[{say:'letsRace'}, {race:'again'}]}
    ]
  },
  // The dolphin's races on the coral reef (the race step, js/pe.js): you in the middle lane, the dolphin above, the turtle
  // below (slow), from the pebbles to the line of shells. The first time the dolphin is far too fast; after that, it's
  // faster than you walk and slower than you run (and slower than you walk, if you can't run yet), and your first win
  // earns shells.
  races: {
    first: {word:'游', you:[2, 10, 'right'], racers:{dolphin:[2, 9, 120], turtle:[2, 11, 450]}, to:14, start:'startRace',
      go:'Race to the line of shells! Hold B as you walk, to run.', won:'You won!', lost:'The dolphin is there already, almost before you’ve started!'},
    again: {word:'游', you:[2, 10, 'right'], racers:{dolphin:[2, 9], turtle:[2, 11, 450]}, to:14, ms:230, walkMs:320, start:'startRace',
      go:'Race to the line of shells! Hold B as you walk, to run.', won:'You beat the dolphin!', lost:'The dolphin won this time. Set off as soon as it says {游|swim}!', prize:5, wonKey:'dolphinWon'}
  },
  // The octopus waving some of its feet out from behind its rock, for you to count (the countGame step)
  countGames: {
    feet: {thing:{word:'脚', ask:'countFeet', on:'sand'}, start:'The octopus waves some of its feet out from behind its rock. Count them? Each right answer earns a 🐚 if that number needs practice.',
      notYet:'The octopus wants to count with you: learn more numbers, then come back!', win:[{say:'great'}]}
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
