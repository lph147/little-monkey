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
// from the edge (鲸鱼), and at the very bottom a light (光): the Dragon King's palace.
// Step 6 (16 November 2026): the palace gate, down at the bottom of the trench: the sea guard who stops you (你是谁？ 我是孙悟空！),
// gold dragons coiled round the pillars by the gate (龙), the crab general and his shrimp soldiers drilling (兵), counted
// with him by tens to a hundred (百), and the lobster at the palace door (龙虾).
// Step 7 (16 November 2026): the throne hall, through the palace door: its pillars (柱子), the Dragon King coming to meet
// you (欢迎！欢迎！), the great broadsword his soldiers stagger in with (太重了！ 重), weighed on the palace's great scale (八百斤：
// 斤), and too light (太轻了！ 轻); the fork you weigh yourself, big weights and small (三千六百斤: 千); the halberd (这个多少斤？
// 多少), still too light. The Dragon Queen's idea comes in the step after.
// Step 8 (16 November 2026): the Dragon Queen's whisper (宝库里有一根铁柱子，它有光！), and the treasury behind the throne
// hall, dim, the iron pillar glowing in it, up through the roof: 太长了！ (长). You tell it what to do, a card: 变短！ (短),
// and it shrinks as you watch; 变小！, a staff in a flash of golden light (金色的光！ 金色); its writing, 如意金箍棒
// 一万三千五百斤, read out by the Dragon King (万); and his 给你！ (给). The staff is your weapon from then on, twice as strong
// as the broadsword.
// Step 9 (16 November 2026): the end of Chapter 5. You'd like clothes to go with the staff (我还要衣服！), but the Dragon King
// has none, only three younger brothers (我有三个弟弟！); back in the throne hall you beat his drum with your staff (鼓, for
// a game that never bought the cave's) and ring his bell (钟), and the Dragon Kings of the South, West and North Seas swim
// in, each with a gift, 给你！: a golden hat with two long red feathers, golden armour and white cloud shoes, worn on your
// monkey from then on (the wardrobe's look, js/art.js). On the way back through the seaweed forest a shark meets your
// staff, and on the seabed the sea turtle takes you home (我们回家吧！), up through the water to the iron bridge.
// Chapter 6 (16 November 2026, built in one batch at the owner's request, with the plan's recommended answers): home with
// the staff, the book of names and the invitation. Home to Flower Fruit Mountain, borrowed as you left it (in autumn,
// as Chapter 4 left it), the troop as they were then; the little monkeys can't lift your staff (太重了！), so you show
// them: up to the sky, then down to a needle (针), tucked into your ear (耳朵), where it lives now (在我的耳朵里！ 在).
// Then the staff around the mountain, told what to do at each of five spots: the peaches at the top of a tree too tall
// (高), the boulder the troop can't move, a bridge to the little island in the meadow's pond, a pearl in a crack in the
// cave's wall, and a little monkey in training who'd like to try it. A feast for the staff, and in a gentle dream, two
// officers lead you off with a rope (绳子), down a misty road lit by lamps (灯), to the ten kings, who are scared of you
// (怕) and give you the book of names: find yours (找), and cross it out with a brush (毛笔), then the troop's. Woken by
// the old monkey (醒醒！ 醒), it was a dream (梦), but the troop will never grow old. And in Heaven the Dragon King and the
// ten kings complain, and the Great White Planet flies down to invite you (玉皇大帝请你去天宫。 请): the end of Area 3.

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
  'v': {look:'trenchGlow', landmark:true},
  'V': {look:'trenchGlow', walk:true}   // (the way down into the light, to the palace)
};
// The palace's: jade flagstones, its red wall, the gate (a big object, 龙宫 on its plaque), and the red pillars either
// side with gold dragons coiled round them, which teach 龙.
const PALACE_LEGEND = {
  '#': {look:'jadeFloor', walk:true},
  'X': {look:'palaceWall'},
  'G': {look:'palaceGate', landmark:true},
  'P': {look:'dragonPillar', word:'龙', newNote:'龙 means dragon. Gold dragons coil round the palace’s pillars. And 龙王, the Dragon King, is dragon + king (王)!'}
};
// The throne hall's: jade, the wall, its pillars (gold dragons coiled round them: here they teach 柱子), the throne on its
// dais, the great scale, and the doorway back out.
const HALL_LEGEND = {
  '#': {look:'jadeFloor', walk:true}, '.': {look:'jadeFloor', walk:true}, 'D': {look:'jadeFloor', walk:true},
  'X': {look:'palaceWall'},
  'P': {look:'dragonPillar', word:'柱子', newNote:'柱子 means pillar. The throne hall’s pillars are red, with gold dragons coiled round them.'},
  'Y': {look:'throne', landmark:true}, 'S': {look:'greatScale', landmark:true},
  'E': {look:'treasuryDoor', becomes:[{if:{hall:{atLeast:3}}, to:'e'}]}, 'e': {look:'treasuryDoorOpen', walk:true},   // (the treasury's door, at the back: open once the Dragon Queen opens it)
  // (step 9) the Dragon King's drum and bell, either side of his throne: beaten and rung with your staff, to call his brothers
  'G': {look:'palaceDrum', landmark:true, word:'鼓', newNote:'鼓 means drum. The Dragon King’s great drum stands beside his throne.', onLook:[
    {if:{gifts:1}, label:'Beat it', do:[{strike:'drum', times:3}, {if:{new:'鼓'}, newWord:'鼓', note:'鼓 means drum. BOOM! BOOM! BOOM! The sound rolls out across the sea.'},
      {set:{gifts:2}}, {say:'bellToo', by:'dragonKing'}, {message:'Now ring the bell, on the other side of the throne!'}]}]},
  'B': {look:'palaceBell', landmark:true, word:'钟', onLook:[
    {if:{gifts:0}, do:[{message:'A great bronze bell hangs beside the Dragon King’s throne.'}]},
    {if:{gifts:1}, do:[{message:'A great bronze bell hangs beside the throne. Beat the {鼓|drum} first, on the other side!'}]},
    {if:{gifts:2}, label:'Ring it', do:[{strike:'bell', times:2}, {newWord:'钟', note:'钟 means bell. DONG… DONG… The sound carries far across the sea, to the South, West and North Seas.'},
      {scene:'brothers'}, {set:{gifts:3}}, {say:'theyCame', by:'dragonKing'},
      {message:'The Dragon Kings of the South, West and North Seas have come, each with a gift for you!'}]}]}
};
// The treasury's (step 8): its dark stone floor, the back wall, chests, gold and clams with pearls, and the iron pillar,
// drawn glowing up through the roof (the place's pillar, its foot: js/sea.js), its squares walkable once it's shrunk away
// from them. A at it: you tell it what to do, and the staff, picked up and read and given you.
// (and you'd like clothes to go with it: the Dragon King has none, but three younger brothers, and he hurries back to the
// throne hall to call them, the Dragon Queen with him)
const ASK_CLOTHES = [
  {say:'wantClothes', by:'player'}, {say:'threeBrothers', by:'dragonKing'},
  {walk:'dragonKing', to:[7, 10], ms:240}, {walk:'dragonQueen', to:[8, 10], ms:240}, {set:{gifts:1}},
  {message:'The Dragon King has no clothes for you, but his three younger brothers, the Dragon Kings of the South, West and North Seas, might! He hurries back to the throne hall, to call them with his drum and his bell.'}];
const STAFF_GIVEN = [
  {writing:'staff'},
  {say:'jin13500', by:'dragonKing', teach:'万'}, {newWord:'万', note:'万 means ten thousand: 一万 is 10,000. The staff weighs 13,500 jin!'},
  {say:'hereYouAre', by:'dragonKing', teach:'给'}, {newWord:'给', note:'给 means to give. 给你！ Here you are! The Dragon King is giving you the staff.'},
  {say:'yoursNow', by:'dragonQueen'}, {set:{staff:4}},
  {message:'The staff hits twice as hard as the {刀|broadsword}!'}, ...ASK_CLOTHES];
const STAFF_SMALL = [{pickUp:'金箍棒'}, {set:{staff:3}}, {weapon:'金箍棒'}, ...STAFF_GIVEN];
const PILLAR_SMALLER = [{tell:'smaller'}, {set:{staff:2}},
  {if:{new:'金色'}, say:'goldenLight', by:'player', teach:'金色'}, {newWord:'金色', note:'金色 means golden. The staff has a golden band at each end.'}, ...STAFF_SMALL];
const PILLAR_LOOK = [
  {if:{staff:0}, label:'Look', do:[
    {say:'tooLong', by:'player', teach:'长'}, {newWord:'长', note:'长 means long. The pillar runs right up through the roof: 太长了！ It’s too long!'},
    {tell:'shorter'}, {newWord:'短', note:'短 means short, the opposite of 长 (long). 变短！ Get shorter!'}, {set:{staff:1}}, ...PILLAR_SMALLER]},
  {if:{staff:1}, label:'Tell', do:PILLAR_SMALLER},
  {if:{staff:2}, label:'Pick up', do:STAFF_SMALL}];
const TREASURY_LEGEND = {
  '.': {look:'treasuryFloor', walk:true}, 'D': {look:'treasuryFloor', walk:true},
  'X': {look:'palaceWall'},
  'c': {look:'chest'}, '$': {look:'goldHeap'}, 'Q': {look:'pearlClam'},
  'i': {look:'ironPillar', onLook:PILLAR_LOOK, becomes:[{if:{staff:{atLeast:1}}, to:'.'}]},
  'I': {look:'ironPillar', onLook:PILLAR_LOOK, becomes:[{if:{staff:{atLeast:2}}, to:'.'}]},
  'P': {look:'ironPillar', landmark:true, onLook:PILLAR_LOOK, becomes:[{if:{staff:{atLeast:3}}, to:'.'}]}
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

// Chapter 6: home. Flower Fruit Mountain's places, borrowed as you left them there, as in Chapter 4 (each with ffm in front
// of its id here): no wild creatures in their long grass now the little demons have gone, only any animals you missed
// (pastAnimals); not on your map, which is the sea's. A few squares of their own (put): the spots where your staff helps.
const HOME_AGAIN = (id, own = {}) => ({borrow:id, from:1, wild:[], noMap:'This is home: you know your way about here. Your map is of the sea.', ...own});
// The troop as Chapter 4 left them (content/across-the-sea.js: their looks, older and greyer, shared, not copied, so they
// can't drift apart), where each is now.
const TROOP = (id, place, x, y, facing, own = {}) => { const {moves:_m, place:_p, x:_x, y:_y, facing:_f, ...c} = ACROSS_THE_SEA.characters.find(c => c.id === id); return {...c, place, x, y, facing, ...own}; };
// The iron bridge in the Water Curtain Cave: dive again, whenever you like, down to the seabed (the sea turtle there swims
// you home again).
const DIVE_AGAIN = {look:'ironBridge', walk:true, onLook:[{if:{home:{atLeast:3}}, label:'Dive', do:[{scene:'diveAgain'}, {goTo:'seabed', at:[11, 6], facing:'down'}]}]};
// The cave's stone beds: sleep till morning, as ever; but the night of the feast for your staff, you dream.
const DREAM = [{scene:'dreamIn'}, {set:{dream:1}}, {goTo:'underworld', at:[7, 12], facing:'up'}];
const BED_AGAIN = {look:'stoneBed', word:'床', landmark:true, note:'Beds of smooth stone, enough for the whole troop.',
  onLook:[{if:{feast:1, dream:0}, label:'Sleep', do:DREAM}, {if:{knows:'床'}, label:'Sleep', do:[{sleep:'You wake up with your health full.'}]}]};
// The staff around the mountain (Part 2): at each spot you tell your staff what to do (the tell step, its telling below),
// and see it do just that, then it's back in your ear (stow). The tallest peach tree in the meadow, its best peaches too
// high for anyone (高); a boulder the big monkey can't move, something glinting under it; the meadow's pond, a little
// island in it with something glinting on it, your staff lying across the water as a bridge; a little monkey's pearl in a
// thin crack in the Water Curtain Cave's wall; and the little monkey in training at the home ground, who'd like to try it.
const TREE_SPOT = [
  {if:{new:'高'}, say:'treeTooTall', by:'baby5', teach:'高'}, {if:{new:'高'}, newWord:'高', note:'高 means tall, or high. The best peaches are right at the top of the tree, too high for anyone to reach!'},
  {tell:'tree'}, {drop:'桃子', n:3}, {stow:true}, {say:'thanks', by:'baby5'}, {set:{spotTree:1}},
  {bag:'桃子', note:'The little monkey shares the peaches: one for you!'}];
const BOULDER_SPOT = [
  {tell:'boulder'}, {roll:true}, {set:{spotBoulder:1}}, {stow:true},
  {if:{new:'金子'}, newWord:'金子', note:'金子 means gold.'}, {bag:'金子', note:'Where the boulder was, something glints in the earth: a nugget of {金子|gold}! The big monkey says it’s yours.'}, {say:'great', by:'big'}];
const ISLET_SPOT = [{tell:'islet'}, {set:{bridge:1}}, {stow:'left'}, {message:'Your staff lies across the {水|water}: a bridge to the little island! Walk over it.'}];
const CRACK_SPOT = [
  {tell:'crack'}, {stow:true}, {pickUp:'珍珠'}, {if:{new:'珍珠'}, newWord:'珍珠', note:'珍珠 means pearl.'},
  {say:'thanks', by:'baby2'}, {set:{spotCrack:1}}, {shells:5, note:'The little monkey takes her {珍珠|pearl} back, and gives you 5 🐚 贝壳 to say thank you.'}];
// The underworld, in the dream (Part 3): a misty road of pale stone, lamps along it, up to a dim hall where the ten kings
// sit behind their long table, the book of names on it; all round, the dark mist of a dream (its look: js/sea.js).
const UNDERWORLD_LEGEND = {
  'X': {look:'dreamWall'}, '.': {look:'dreamFloor', walk:true}, ',': {look:'dreamRoad', walk:true}, 'm': {look:'dreamVoid'},
  'L': {look:'dreamLamp', word:'灯', newNote:'灯 means lamp. Stone lamps line the misty road, glowing in the dark.'},
  'K': {look:'kingTable', landmark:true, onLook:[{if:{dream:3}, label:'Look', do:[{talkTo:'king1'}]}]}
};
// The ten kings of the underworld, in a row behind their table (people: each a little different), the first in the middle.
const TEN_KINGS = [[7, '#5A2A2A', '#E8E8E8'], [3, '#2A3A5A', '#3A3030'], [4, '#3A5A3A', '#B8B8B8'], [5, '#5A4A2A', '#2A2020'], [6, '#4A2A5A', '#D8D8D8'],
  [8, '#2A4A5A', '#4A3A30'], [9, '#5A3A2A', '#C8C8C8'], [10, '#3A3A3A', '#2A2020'], [11, '#2A5A4A', '#E0E0E0'], [12, '#5A2A4A', '#3A3030']].map(([x, c, h], i) =>
  ({id:'king' + (i + 1), place:'underworld', person:true, hair:'cap', beard:true, wear:'robe', x, y:2, facing:'down', name:{zh:'十王', py:'Shí Wáng', en:'The ten kings'},
    palette:{o:'#1E1A28', h, s:'#E2C4A2', e:'#14101C', m:'#A87A6A', c, b:'#C8A04A', p:'#2A2638'}}));

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
  goal: [{if:{home:{below:2}}, text:'Find the Dragon King’s palace, deep under the sea, and a weapon fit for a king.'},
    {if:{invite:{below:3}}, text:'Home to Flower Fruit Mountain, with your staff.'},
    {if:{}, text:'Up to Heaven, invited by the Jade Emperor: Area 4, on its way.'}],
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
      now:'Cross the currents, and find the way down to the bottom of the trench.'},
    {id:'palace', chapter:0, name:'Part 5', title:'The Dragon King’s palace', when:{palace:1},
      text:'At the very bottom of the trench stands the Dragon King’s palace, its gate green and gold, gold dragons coiled round its pillars. Shrimp soldiers drill on the jade flagstones in front of it, and a crab general barks out orders…',
      now:'Explore the palace gate.'},
    {id:'hall', chapter:0, name:'Part 6', title:'Too light!', when:{hall:1},
      text:'Inside the Crystal Palace, gold dragons curl round the pillars, and the Dragon King himself comes out to meet you. You ask him for a weapon worthy of you, and his soldiers bring out the finest he has…',
      now:'Try the Dragon King’s weapons.'},
    {id:'pillar', chapter:0, name:'Part 7', title:'The iron pillar', when:{hall:3},
      text:'The Dragon Queen whispers: the iron pillar in the treasury has been glowing for days, as if it’s waiting for someone…',
      now:'See the glowing pillar in the treasury.'},
    {id:'gifts', chapter:0, name:'Part 8', title:'The drum and the bell', when:{gifts:1},
      text:'The staff is yours, but a king needs clothes to go with it! The Dragon King has none for you. But he has three younger brothers, the Dragon Kings of the South, West and North Seas, and a drum and a bell to call them with…',
      now:'Call the Dragon King’s brothers, then go home in their gifts, with your staff.'},
    // Chapter 6, the book of names
    {id:'homeAgain', chapter:1, name:'Part 1', title:'Home with the staff', when:{home:{atLeast:2}}, card:false,
      story:'You’ve swum home with the sea turtle, up through the water to the iron bridge in the Water Curtain Cave, in your golden clothes, with the staff from the Dragon King’s treasury. The troop can’t wait to see it.',
      now:'Show the troop your staff.'},
    {id:'staffSpots', chapter:1, name:'Part 2', title:'The staff around the mountain', when:{ear:1},
      text:'Your staff grows and shrinks as you tell it to. And all round Flower Fruit Mountain, the troop has jobs that only your staff can do…',
      now:'Help the troop with your staff.'},
    {id:'dream', chapter:1, name:'Part 3', title:'The dream', when:{feast:1},
      text:'The troop holds a feast for your staff, late into the night. And when at last you fall asleep, you dream a strange dream…',
      now:'Go to bed, and see where your dream takes you.'},
    {id:'heaven', chapter:1, name:'Part 4', title:'Trouble in Heaven', when:{dream:5},
      text:'Far above the clouds, in Heaven, the Dragon King has come to complain about you, and so have the ten kings. The Jade Emperor isn’t pleased. But the Great White Planet has an idea…',
      now:'See who’s coming down from the sky.'}
  ],

  // The day goes round down here too: no rain under the sea, and no bed, so the night passes by itself, as in the human world.
  dayNight: {if:{}, morning:'Good morning! You wake up with your health full.', sleep:[]},
  progress: {chapter:0, landed:0, turtle:0, starFriends:0, forest:0, octopus:0, dolphin:0, trench:0, palace:0, hall:0, staff:0, gifts:0, south:0, west:0, north:0, home:0,
    ear:0, spotTree:0, spotBoulder:0, bridge:0, spotIslet:0, spotCrack:0, spotTrainee:0, feast:0, dream:0, invite:0},
  //   turtle   0 not met yet, 1 said hello (泡泡), 2 led you to the seaweed (游), 3 found all five starfish: off to the forest
  //   forest   0 not in the seaweed forest yet, 1 met your first shark there (小心, 鲨鱼)
  //   octopus  0 hasn't counted its feet with you yet, 1 has (脚, 几): off to the coral reef
  //   dolphin  0 hasn't raced you yet, 1 has, and won (快, 慢), 2 you've won a race: off to the trench
  //   trench   0 not across its currents yet, 1 across them, at the edge of the deep (深), 2 seen the light at the bottom (光)
  //   palace   0 not past the sea guard yet, 1 past him, 2 counted the soldiers with the crab general (兵, 百), 3 the lobster's friend too
  //   hall     0 not in the throne hall yet, 1 the Dragon King has welcomed you (欢迎), 2 tried his weapons: all too light,
  //            3 the Dragon Queen has whispered about the iron pillar: the treasury's open
  //   staff    0 the iron pillar as tall as ever, 1 you've told it 变短 (长, 短), 2 变小: a staff, standing at its foot (金色),
  //            3 you've picked it up, your weapon now, 4 the Dragon King has read its writing (万) and given it to you (给)
  //   gifts    0 not yet, 1 you've asked for clothes: he's gone to call his brothers, 2 you've beaten his drum (鼓), 3 rung
  //            his bell (钟): his three brothers have come, 4 they've all given you their gifts
  //   south, west, north   the Dragon King of the South, West or North Sea has given you his gift (1)
  //   home     0 not on your way home yet, 1 a shark has met your staff in the seaweed forest, 2 you've swum home with the
  //            sea turtle: the end of Chapter 5, home to the Water Curtain Cave, and Chapter 6's card; 3 the old monkey's
  //            gone to tell the others
  //   ear      0 not yet, 1 you've shown the little monkeys your staff, up to the sky and down to a needle (针), into your
  //            ear (耳朵), where it lives now (在)
  //   spotTree, spotBoulder, spotIslet, spotCrack, spotTrainee   your staff has helped at that spot (1); bridge: it lies
  //            across the meadow's pond (1), to the little island
  //   feast    1 the troop's feast for your staff
  //   dream    0 not yet, 1 asleep: in the dream, 2 the officers' rope round you (绳子), 3 they've run from your staff, 4
  //            you've crossed out your name and the troop's (怕, 找, 毛笔), 5 woken in the cave (醒, 梦): the troop won't grow old
  //   invite   1 trouble in Heaven (the scene): someone's coming, 2 the Great White Planet has come down, 3 he's invited
  //            you to Heaven (请): the end of Area 3
  counters: {
    seabedWords: {count:'known', words:['沙子', '贝壳', '水草'], called:{'沙子':'the sand', '贝壳':'a shell', '水草':'the seaweed'}},
    starCount: {count:'progress', key:'starFriends'},   // the starfish in the seaweed you've made friends with (of five)
    staffSpots: {count:'flags', keys:['spotTree', 'spotBoulder', 'spotIslet', 'spotCrack', 'spotTrainee']}   // the spots at home where your staff has helped (of five)
  },
  // Chapter 6: your staff in your ear once you've shown the troop (not in your paw on the map: js/sea.js); the officers'
  // rope round you in the dream, its end in the first one's hand; the jade glinting on the meadow pond's little island
  // till you've found it; home in autumn, as Chapter 4 left it (the sea has no seasons: its if never matches); and any
  // animals you missed in Areas 1 and 2, at home again.
  inEar: {ear:1},
  rope: {place:'underworld', if:{dream:2}, by:'official1'},
  glimmers: [{at:[10, 10, 'ffmMeadow'], if:{spotIslet:0}}],
  seasons: {if:{chapter:9}, home:{if:{}, season:'autumn'}},
  pastAnimals: {chapter:1},
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
    {id:'toPalace', main:true, if:{trench:2, palace:0, away:'palace'}, text:'Go down into the {光|light} at the very bottom of the trench', arrow:[19, 15, 'trench']},
    {id:'guard', main:true, if:{palace:0, place:'palace'}, text:'Talk to the {夜叉|sea guard}', arrow:'yaksha'},
    {id:'dragons', if:{palace:{atLeast:1}, new:'龙'}, text:'Something gold is coiled round the pillars by the palace {门|gate}: press A at one', arrow:{sparkle:true}},
    {id:'crab', main:true, if:{palace:1}, text:'The crab general wants to show you his {兵|soldiers}', arrow:'crab'},
    {id:'lobster', main:true, if:{palace:2, friends:{lobster:false}}, text:'Something is guarding the palace {门|door}: go and meet it', arrow:[12, 6, 'palace']},
    {id:'toHall', main:true, if:{palace:3, hall:0, away:'hall'}, text:'Go in through the palace {门|door}', arrow:[12, 4, 'palace']},
    {id:'king', main:true, if:{hall:1}, text:'The Dragon King has weapons to show you', arrow:'dragonKing'},
    {id:'pillars', if:{hall:{atLeast:1}, new:'柱子'}, text:'Press A at one of the throne hall’s {柱子|pillars}', arrow:{sparkle:true}},
    {id:'queen', main:true, if:{hall:2}, text:'The Dragon Queen has an idea', arrow:'dragonQueen'},
    {id:'toTreasury', main:true, if:{hall:3, staff:{below:3}, away:'treasury'}, text:'Go into the treasury, at the back of the throne hall', arrow:[12, 0, 'hall']},
    {id:'pillar', main:true, if:{hall:3, staff:{below:3}, place:'treasury'}, text:'Press A at the glowing iron {柱子|pillar}', arrow:[7, 5, 'treasury']},
    {id:'given', main:true, if:{staff:3}, text:'The Dragon King has more for you', arrow:'dragonKing'},
    {id:'clothes', main:true, if:{staff:4, gifts:0}, text:'The Dragon King has something more for you', arrow:'dragonKing'},
    {id:'drum', main:true, if:{gifts:1}, text:'Beat the Dragon King’s {鼓|drum}, beside his throne, with your staff', arrow:[5, 2, 'hall']},
    {id:'bell', main:true, if:{gifts:2}, text:'Ring the {钟|bell} on the other side of the throne', arrow:[10, 2, 'hall']},
    {id:'brothers', main:true, if:{gifts:3}, text:'Three dragon kings have come, each with a gift for you: press A beside each of them',
      arrow:{nearest:[{who:'southKing', if:{south:0}}, {who:'westKing', if:{west:0}}, {who:'northKing', if:{north:0}}]}},
    {id:'home', main:true, if:{gifts:4, home:{below:2}}, text:'Go back to the seabed, where the {海龟|sea turtle} is waiting for you', arrow:'turtle'},
    // Chapter 6
    {id:'showTroop', main:true, if:{home:3, ear:0, away:'ffmHomeGround'}, text:'Show the troop your staff: they’re at the home ground, outside the {瀑布|waterfall}', arrow:{place:'ffmHomeGround'}},
    {id:'showStaff', main:true, if:{home:3, ear:0, place:'ffmHomeGround'}, text:'Show the little {猴子|monkeys} your staff', arrow:'baby1'},
    {id:'tree', main:true, if:{ear:1, spotTree:0}, text:'A little {猴子|monkey} by the {桃子|peach} trees in the meadow needs your staff', arrow:'baby5'},
    {id:'boulder', main:true, if:{ear:1, spotBoulder:0}, text:'The big {猴子|monkey} in the meadow can’t move a boulder', arrow:'big'},
    {id:'islet', main:true, if:{ear:1, spotIslet:0}, text:'Something glints on the little island in the meadow’s pond: get across the {水|water} with your staff', arrow:[13, 10, 'ffmMeadow']},
    {id:'crack', main:true, if:{ear:1, spotCrack:0}, text:'A little {猴子|monkey} in the Water Curtain Cave has lost something', arrow:'baby2'},
    {id:'trainee', main:true, if:{ear:1, spotTrainee:0}, text:'The little {猴子|monkey} in training at the home ground would like to try your staff', arrow:'traineeStick'},
    {id:'feast', main:true, if:{staffSpots:5, feast:0}, text:'Go back to the home ground: the {猴子|monkeys} have a surprise for you', arrow:{place:'ffmHomeGround'}},
    {id:'bed', main:true, if:{feast:1, dream:0}, text:'Go to {床|bed} in the Water Curtain Cave', arrow:[1, 1, 'ffmCave']},
    {id:'hall', main:true, if:{dream:3}, text:'Go up the {路|road}, into the dim hall', arrow:[7, 4, 'underworld']},
    {id:'planet', main:true, if:{invite:1}, text:'Someone is coming down from the {天|sky}, to the home ground: go and see', arrow:{place:'ffmHomeGround'}},
    {id:'continued', main:true, if:{invite:3}, text:'Area 4, Heaven, is on its way. Till then, explore Flower Fruit Mountain and the {海|sea}'}
  ],
  hints: [
    {if:{turtle:0}, text:'You’re on the seabed, deep under the {海|sea}. A {海龟|sea turtle} is swimming towards you: walk up to it and press A.'},
    {if:{turtle:1}, text:'The {海龟|sea turtle} is showing you round. Things that sparkle ✨ have words: walk up to one and press A.'},
    {if:{turtle:2}, text:'Walk beside the {水草|seaweed} round the edge of the seabed: where it rustles, something is hiding. Face it and it comes out.'},
    {if:{turtle:3, forest:0}, text:'The {海龟|sea turtle} has swum east, into the seaweed forest. Walk off the {东边|east} side of the seabed to follow it.'},
    {if:{octopus:1, dolphin:{below:2}}, text:'The {海豚|dolphin} on the coral reef wants a race: talk to it. To win, hold B as you walk, to {跑|run}, and set off as soon as it says {游|swim}.'},
    {if:{dolphin:2, trench:0}, text:'Currents flow across the trench, all at once: wait till they drop, then cross quickly. If one catches you, it pushes you back.'},
    {if:{trench:1}, text:'A slope of {沙子|sand} runs down at the east side of the trench, to the very bottom. And something huge glides in the deep {水|water} below the edge.'},
    {if:{trench:2, palace:0}, text:'The way down to the palace is at the very bottom of the trench, in the {光|light}: walk into it.'},
    {if:{palace:{atLeast:1}, new:'龙'}, text:'Something gold is coiled round the pillars by the palace {门|gate}: press A at one.'},
    {if:{palace:1}, text:'The crab general, beside his {虾|shrimp} soldiers, wants to show you how many there are: talk to him.'},
    {if:{palace:2}, text:'Something is guarding the palace {门|door}: walk up to it and press A.'},
    {if:{palace:3, hall:0}, text:'The palace {门|door} is open now: face it, in the middle of the gate, and press A.'},
    {if:{hall:1}, text:'The Dragon King, by his throne, has weapons to show you: go up to him and press A. On the scale, put the {千|thousands} on first, then the {百|hundreds}.'},
    {if:{hall:2}, text:'None of the Dragon King’s weapons is {重|heavy} enough for you. But the Dragon Queen, by the throne, has an idea: go up to her and press A.'},
    {if:{hall:3, staff:{below:3}}, text:'Go through the doorway at the back of the throne hall, into the treasury. Press A at the glowing {柱子|pillar}, and choose what to tell it.'},
    {if:{staff:3}, text:'The Dragon King, in the treasury, has more for you: go up to him and press A.'},
    {if:{staff:4, gifts:0}, text:'The Dragon King, in the treasury, has something more for you: go up to him and press A.'},
    {if:{gifts:1}, text:'Go back to the throne hall, and beat the Dragon King’s {鼓|drum} with your staff: it’s beside his throne. Walk up to it and press A.'},
    {if:{gifts:2}, text:'Now ring the {钟|bell} on the other side of the throne: walk up to it and press A.'},
    {if:{gifts:3}, text:'Three dragon kings have come to the throne hall, each with a gift for you: go up to each of them and press A.'},
    {if:{gifts:4, home:{below:2}}, text:'Walk back the way you came, through the trench, the reef and the seaweed forest, to the seabed: the {海龟|sea turtle} is waiting for you there.'},
    {if:{home:3, ear:0}, text:'The troop is at the home ground, outside the {瀑布|waterfall}: walk out of the Water Curtain Cave, through the waterfall, and go up to the little monkeys.'},
    {if:{ear:1, staffSpots:{below:5}}, text:'Monkeys with a ! need your staff: in the meadow, the Water Curtain Cave and at the home ground. Face the thing they need help with, press A, and tell your staff how to {变|change}: 变长, 变短, 变大 or 变小 ({staffSpots} of 5 so far).'},
    {if:{staffSpots:5, feast:0}, text:'You’ve helped at every spot! Go back to the home ground: the {猴子|monkeys} have a surprise for you.'},
    {if:{feast:1, dream:0}, text:'Go into the Water Curtain Cave, face a stone {床|bed} and press A, to sleep.'},
    {if:{dream:{atLeast:1, below:3}}, text:'You’re dreaming! Two officers have come for you. Let them lead you up the {路|road}.'},
    {if:{dream:3}, text:'Walk up the {路|road}, into the dim hall at the top: the ten kings are waiting behind their long table.'},
    {if:{invite:1}, text:'Someone is coming down from the {天|sky}, to the home ground: go and see who.'},
    {if:{invite:3}, text:'That’s the end of Area 3! Area 4, Heaven, is on its way. Till then, explore Flower Fruit Mountain and the {海|sea}: dive from the iron bridge in the Water Curtain Cave.'},
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
    {part:'trench', text:'Get down to the bottom of the trench', show:{trench:{atLeast:1}}, done:{trench:2}},
    {part:'palace', text:'Get past the {夜叉|sea guard}', done:{palace:{atLeast:1}}},
    {part:'palace', text:'Press A at a pillar by the palace {门|gate}', done:{knows:'龙'}},
    {part:'palace', text:'Count the {兵|soldiers} with the crab general', show:{palace:{atLeast:1}}, done:{palace:{atLeast:2}}},
    {part:'palace', text:'Make friends with the guard at the palace {门|door}', show:{palace:{atLeast:2}}, done:{friends:{lobster:true}}},
    {part:'hall', text:'Meet the Dragon King', done:{hall:{atLeast:1}}},
    {part:'hall', text:'Press A at one of the throne hall’s {柱子|pillars}', done:{knows:'柱子'}},
    {part:'hall', text:'Try the Dragon King’s weapons', show:{hall:{atLeast:1}}, done:{hall:{atLeast:2}}},
    {part:'pillar', text:'Find the glowing {柱子|pillar} in the treasury', done:{staff:{atLeast:1}}},
    {part:'pillar', text:'Make the {柱子|pillar} small enough to hold', show:{staff:{atLeast:1}}, done:{staff:{atLeast:2}}},
    {part:'pillar', text:'Read the writing on your staff', show:{staff:{atLeast:2}}, done:{staff:4}},
    {part:'gifts', text:'Beat the Dragon King’s {鼓|drum}', done:{gifts:{atLeast:2}}},
    {part:'gifts', text:'Ring the {钟|bell}', show:{gifts:{atLeast:2}}, done:{gifts:{atLeast:3}}},
    {part:'gifts', text:'Get a gift from each of the three dragon kings', show:{gifts:{atLeast:3}}, done:{gifts:4}},
    {part:'gifts', text:'Meet a {鲨鱼|shark} with your staff, on the way back', show:{gifts:4}, done:{home:{atLeast:1}}},
    {part:'gifts', text:'Swim home with the {海龟|sea turtle}', show:{gifts:4}, done:{home:{atLeast:2}}},
    {part:'homeAgain', chapter:1, text:'Show the {猴子|monkeys} your staff', done:{ear:1}},
    {part:'staffSpots', chapter:1, text:'Get the {桃子|peaches} at the top of the tallest tree', done:{spotTree:1}},
    {part:'staffSpots', chapter:1, text:'Move the boulder the big {猴子|monkey} can’t', done:{spotBoulder:1}},
    {part:'staffSpots', chapter:1, text:'Get across the {水|water} to the little island', done:{spotIslet:1}},
    {part:'staffSpots', chapter:1, text:'Find what the little {猴子|monkey} lost in the cave', done:{spotCrack:1}},
    {part:'staffSpots', chapter:1, text:'Let the little {猴子|monkey} in training try your staff', done:{spotTrainee:1}},
    {part:'dream', chapter:1, text:'Go to {床|bed} after the feast', done:{dream:{atLeast:1}}},
    {part:'dream', chapter:1, text:'Find your {名字|name} in the book of names', show:{dream:{atLeast:1}}, done:{dream:{atLeast:4}}},
    {part:'dream', chapter:1, text:'Wake up from your {梦|dream}', show:{dream:{atLeast:4}}, done:{dream:{atLeast:5}}},
    {part:'heaven', chapter:1, text:'Meet the visitor from the {天|sky}', done:{invite:3}}
  ],
  bubbles: {
    turtle: [{if:{landed:1, turtle:0}, show:'!'}, {if:{turtle:1, seabedWords:3}, show:'!'}, {if:{turtle:2, starFriends:5}, show:'!'}, {if:{dolphin:2, trench:0}, show:'!'}, {if:{gifts:4, home:{below:2}}, show:'!'}],
    octopus: [{if:{friends:{octopus:true}, octopus:0}, show:'!'}],
    dolphin: [{if:{octopus:1, dolphin:0}, show:'!'}, {if:{dolphin:1}, show:'!'}],
    yaksha: [{if:{palace:0}, show:'!'}],
    crab: [{if:{palace:1}, show:'!'}],
    dragonKing: [{if:{hall:1}, show:'!'}, {if:{staff:3}, show:'!'}, {if:{staff:4, gifts:0}, show:'!'}],
    dragonQueen: [{if:{hall:2}, show:'!'}],
    southKing: [{if:{gifts:3, south:0}, show:'!'}], westKing: [{if:{gifts:3, west:0}, show:'!'}], northKing: [{if:{gifts:3, north:0}, show:'!'}],
    // Chapter 6
    baby1: [{if:{home:3, ear:0}, show:'!'}],
    baby5: [{if:{ear:1, spotTree:0}, show:'!'}], big: [{if:{ear:1, spotBoulder:0}, show:'!'}], baby2: [{if:{ear:1, spotCrack:0}, show:'!'}],
    traineeStick: [{if:{ear:1, spotTrainee:0}, show:'!'}],
    elder: [{if:{dream:4}, show:'!'}], troopA: [{if:{dream:4}, show:'!'}],
    official1: [{if:{dream:1}, show:'!'}], king1: [{if:{dream:3}, show:'!'}], planet: [{if:{invite:2}, show:'!'}]
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
      {set:{trench:2}}, {message:'The light far below is the Dragon King’s palace! Walk down into it.'}]},
    // down at the palace: the sea guard stops you; and once the lobster at the door is your friend, the step ends
    {if:{place:'palace', palace:0, around:[12, 12, 'palace', 2]}, do:[{stopsYou:'yaksha'}]},
    {if:{palace:2, friends:{lobster:true}}, do:[{set:{palace:3}}, {message:'The lobster lets you through: the palace door is open now. The Dragon King waits inside!'}]},
    // into the throne hall: the Dragon King comes to meet you (欢迎！欢迎！), and you ask him for a weapon
    {if:{place:'hall', hall:0}, do:[
      {walk:'dragonKing', to:'you', ms:320},
      {say:'welcome', by:'dragonKing', teach:'欢迎'}, {newWord:'欢迎', note:'欢迎 means welcome! You say it when someone comes to your home.'},
      {say:'whatDoYouWant', by:'dragonKing'}, {say:'iWantWeapon', by:'player'}, {set:{hall:1}}]},
    // all three dragon kings' gifts on: the Dragon Queen's 好看！, and home
    {if:{gifts:3, south:1, west:1, north:1}, do:[{say:'lovely', by:'dragonQueen'}, {set:{gifts:4}},
      {message:'You’re dressed like a king now, with a staff to match! The sea turtle is waiting for you on the seabed, where you landed, to take you home. (Your other clothes are in your wardrobe: Menu, 衣服.)'}]},
    // on the way home through the seaweed forest: a shark meets your staff
    {if:{place:'forest', gifts:4, home:0, around:[21, 7, 'forest', 1]}, do:[
      {battle:'shark', out:true, retry:true, meet:'A {鲨鱼|shark} shoots out of the seaweed at you! It hasn’t met your staff yet…', back:{at:[24, 7, 'forest'], facing:'left'},
        lost:'You catch your breath at the edge of the forest.',
        win:[{set:{home:1}}, {message:'One blow of your staff, and the {鲨鱼|shark} swims off as fast as it can! The sea turtle is waiting for you on the seabed.'}]}]},
    // Chapter 6: home, up through the water with the sea turtle (or a game from the end of Chapter 5, on the seabed): to the
    // iron bridge in the Water Curtain Cave, and Chapter 6's card
    {if:{home:2, chapter:0}, do:[{goTo:'ffmCave', at:[7, 7], facing:'down'}, {chapter:1}]},
    // the old monkey, in the cave, glad to see you (and your clothes!), then off out through the waterfall to tell the others
    {if:{place:'ffmCave', home:2, chapter:1}, do:[{walk:'elder', to:'you'}, {say:'backAgain', by:'elder'}, {say:'lovely', by:'elder'},
      {walk:'elder', to:[7, 12]}, {set:{home:3}},
      {message:'The old monkey hurries off to tell the others. The troop is at the home ground, outside the waterfall: show them your staff!'}]},
    // at the home ground, the little monkeys crowd round to see your staff
    {if:{place:'ffmHomeGround', home:3, ear:0, around:[9, 10, 'ffmHomeGround', 3]}, do:[{walk:'baby1', to:'you'}, {talkTo:'baby1'}]},
    // the little island's jade, once your staff's a bridge to it
    {if:{place:'ffmMeadow', bridge:1, spotIslet:0, around:[10, 10, 'ffmMeadow', 0]}, do:[
      {if:{new:'玉'}, newWord:'玉', note:'玉 means jade.'}, {bag:'玉', note:'A piece of {玉|jade}, green and smooth, glinting in the grass of the little island!'}, {set:{spotIslet:1}}]},
    // all five spots: the troop's feast for your staff, back at the home ground
    {if:{place:'ffmHomeGround', staffSpots:5, feast:0}, do:[{scene:'staffFeast'}, {set:{feast:1}},
      {message:'The feast goes on late into the night. You’re tired out: go to bed, in the Water Curtain Cave.'}]},
    // the dream: two officers come for you with a rope; the ten kings, as you come up to their table
    {if:{place:'underworld', dream:1}, do:[{walk:'official1', to:'you'}, {talkTo:'official1'}]},
    {if:{place:'underworld', dream:3, around:[7, 4, 'underworld', 1]}, do:[{talkTo:'king1'}]},
    // woken in the Water Curtain Cave by the old monkey (醒), the next morning: it was a dream (梦); but the troop won't
    // grow old
    {if:{place:'ffmCave', dream:4}, do:[
      {say:'wakeUp', by:'elder', teach:'醒'}, {newWord:'醒', note:'醒 means to wake up. 醒醒！ Wake up! The old monkey is shaking you.'},
      {say:'itWasADream', by:'player', teach:'梦'}, {newWord:'梦', note:'梦 means dream. It was all a dream!'},
      {message:'You tell the old monkey about the book of names, and the names you crossed out…'},
      {say:'wontGrowOld', by:'troopA'}, {set:{dream:5}}]},
    // trouble in Heaven; then someone coming down from the sky
    {if:{dream:5, invite:0}, do:[{nextPart:true}, {scene:'heaven'}, {set:{invite:1}}, {message:'Someone is coming down from the sky, to the home ground! Go and see.'}]},
    // the Great White Planet, down on his cloud at the home ground, with the Jade Emperor's invitation
    {if:{place:'ffmHomeGround', invite:1}, do:[{scene:'planetCloud'}, {set:{invite:2}}, {walk:'planet', to:'you'}, {talkTo:'planet'}]}
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
      exits: [{at:[0, 3], to:'reef', arrive:[24, 7], facing:'left'},
        {at:[19, 15], to:'palace', arrive:[12, 14], facing:'up', if:{trench:2}, closed:'It’s too dark to go down there yet.'}],
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
        "wddddddddddddddddddVvvdddw"
      ]
    },
    // The palace gate, at the very bottom of the trench: jade flagstones in front of the palace's red wall, its gate in the
    // middle, red pillars with gold dragons either side; the shrimp soldiers drilling in two rows of ten, their crab general
    // beside them; the sea guard by the way down; the lobster at the door. The way in comes in the next step.
    palace: {
      name: {zh:'龙宫', py:'Lónggōng', en:'The Dragon Palace'},
      onMap: [210, 72, 26, 16],
      underwater: true,
      music: 'sea',
      backdrop: 'sea',
      legend: PALACE_LEGEND,
      exits: [{at:[12, 15], to:'trench', arrive:[19, 14], facing:'up'},
        {at:[12, 4], to:'hall', arrive:[8, 10], facing:'up', by:'A', if:{palace:3}, closed:'The palace door is shut, for now.'}],
      map: [
        "dddddddddddddddddddddddddd",
        "ddddddddddGGGGGddddddddddd",
        "ddddddddddGGGGGddddddddddd",
        "XXXXXXXXPXGGGGGXPXXXXXXXXX",
        "XXXXXXXXPXGGGGGXPXXXXXXXXX",
        "##########################",
        "##########################",
        "##########################",
        "##########################",
        "##########################",
        "##########################",
        "##########################",
        "##########################",
        "##########################",
        "##########################",
        "##########################"
      ]
    },
    // The throne hall (the Crystal Palace), through the palace door: red pillars with gold dragons, the Dragon King's throne
    // at the top, the Dragon Queen beside it, the great scale to one side. Indoors, and inside the palace on your map.
    hall: {
      name: {zh:'水晶宫', py:'Shuǐjīng Gōng', en:'The Crystal Palace'},
      noMap: 'You’re inside the Dragon Palace.',
      indoors: true,
      underwater: true,
      music: 'sea',
      backdrop: 'sea',
      legend: HALL_LEGEND,
      exits: [{at:[8, 11], to:'palace', arrive:[12, 5], facing:'down'}, {at:[9, 11], to:'palace', arrive:[12, 5], facing:'down'},
        {at:[12, 0], to:'treasury', arrive:[7, 10], facing:'up', if:{hall:{atLeast:3}}, closed:'The {门|door} at the back of the throne hall is shut.'}],
      map: [
        "XXXXXXXXXXXXEXXXXX",
        "X....GGYYYBB.....X",
        "X..P.GGYYYBB..P..X",
        "X..P..........P..X",
        "X................X",
        "X..P.............X",
        "X..P.............X",
        "X............SS..X",
        "X..P.........SS..X",
        "X..P.............X",
        "X................X",
        "XXXXXXXXDDXXXXXXXX"
      ]
    },
    // The treasury (海藏), through the door at the back of the throne hall once the Dragon Queen opens it: dim, chests, gold
    // and pearls, and the iron pillar in the middle, glowing, up through the roof (pillar: its foot). Indoors.
    treasury: {
      name: {zh:'海藏', py:'Hǎicáng', en:'The Treasury'},
      noMap: 'You’re inside the Dragon Palace.',
      indoors: true,
      underwater: true,
      dim: true,
      music: 'sea',
      backdrop: 'sea',
      pillar: [7, 5],
      legend: TREASURY_LEGEND,
      exits: [{at:[7, 11], to:'hall', arrive:[12, 1], facing:'down'}],
      map: [
        "XXXXXXXXXXXXXXX",
        "Xcc...$i$...ccX",
        "X$.....i.....$X",
        "X..Q...I...Q..X",
        "X......I......X",
        "X.$...$P$...$.X",
        "X.............X",
        "X.............X",
        "XQ...........QX",
        "X.c.$.....$.c.X",
        "X.............X",
        "XXXXXXXDXXXXXXX"
      ]
    },
    // Chapter 6: home, Flower Fruit Mountain's places as you left them (HOME_AGAIN), with a few squares of their own: in the
    // meadow, the tallest peach tree (ぴ), the boulder the troop can't move (け), and the pond's little island (く), with the
    // water your staff lies across to it (ご, き); in the Water Curtain Cave, the crack in its wall (こ), the iron bridge to
    // dive from again and the stone beds
    ffmMeadow: HOME_AGAIN('meadow', {put:[[1, 8, 'ぴ'], [14, 4, 'け'], [10, 10, 'く'], [11, 10, 'ご'], [12, 10, 'き']], legend:{
      'ぴ': {look:'peachTree', word:'桃子', landmark:true, onLook:[{if:{ear:1, spotTree:0}, label:'Staff', do:TREE_SPOT}]},
      'け': {look:'boulder', word:'石头', onLook:[{if:{ear:1, spotBoulder:0}, label:'Staff', do:BOULDER_SPOT}], becomes:[{if:{spotBoulder:1}, to:'げ'}]},
      'げ': {look:'grass', walk:true},
      'く': {look:'grass', walk:true},
      'ご': {look:'water', word:'鱼', becomes:[{if:{bridge:1}, to:'ぎ'}]},
      'き': {look:'water', word:'鱼', onLook:[{if:{ear:1, bridge:0}, label:'Staff', do:ISLET_SPOT}], becomes:[{if:{bridge:1}, to:'ぐ'}]},
      'ぎ': {look:'staffBridgeL', walk:true}, 'ぐ': {look:'staffBridgeR', walk:true}}}),
    ffmPath: HOME_AGAIN('path'), ffmValley: HOME_AGAIN('valley'), ffmFalls: HOME_AGAIN('falls'),
    ffmCave: HOME_AGAIN('cave', {indoors:true, put:[[0, 10, 'こ']], legend:{'D':BED_AGAIN, 'I':DIVE_AGAIN,
      'こ': {look:'caveCrack', landmark:true, onLook:[{if:{ear:1, spotCrack:0}, label:'Staff', do:CRACK_SPOT}]}}}),
    ffmHomeGround: HOME_AGAIN('homeGround'),
    ffmShore: HOME_AGAIN('shore'), ffmHillside: HOME_AGAIN('hillside'), ffmRiverside: HOME_AGAIN('riverside'), ffmFlowerValley: HOME_AGAIN('flowerValley'),
    ffmSouthSlope: HOME_AGAIN('southSlope'), ffmCliffs: HOME_AGAIN('cliffs'), ffmHotSprings: HOME_AGAIN('hotSprings'), ffmMelonField: HOME_AGAIN('melonField'),
    ffmDarkPines: HOME_AGAIN('darkPines'), ffmPasture: HOME_AGAIN('pasture'), ffmPineWood: HOME_AGAIN('pineWood'), ffmSchool: HOME_AGAIN('school', {indoors:true}), ffmSportsGround: HOME_AGAIN('sportsGround'),
    // the dream (Part 3): the underworld, a misty road up to a dim hall (not on any map: you're dreaming)
    underworld: {
      name: {zh:'地府', py:'dìfǔ', en:'The underworld'},
      noMap: 'You’re dreaming: this place isn’t on any map.',
      dream: true,
      indoors: true,
      clouds: true,
      music: 'cave',
      legend: UNDERWORLD_LEGEND,
      exits: [],
      map: [
        "XXXXXXXXXXXXXXX",
        "X.............X",
        "X.............X",
        "X..KKKKKKKKKK.X",
        "X.............X",
        "X.............X",
        "XXXXXX...XXXXXX",
        "mmmmL,,,,,Lmmmm",
        "mmmmm,,,,,mmmmm",
        "mmmmL,,,,,Lmmmm",
        "mmmmm,,,,,mmmmm",
        "mmmmL,,,,,Lmmmm",
        "mmmmm,,,,,mmmmm",
        "mmmmmmmmmmmmmmm"
      ]
    }
  },
  legend: SEA_LEGEND,

  // Its characters' own voices, chosen by the owner from round 6 of the voice test: the sea turtle's, Xiaorui (an older
  // woman's, 15 November 2026); the Dragon King's, Yunyang (a deep, steady man's), and the Dragon Queen's, Xiaohan (a warm
  // woman's), both 16 November 2026, for the palace (step 6 on)
  voices: {words:{provider:'google', name:'cmn-CN-Standard-A'}, everyone:{name:'zh-CN-YunxiNeural', style:'chat'}, turtle:{name:'zh-CN-XiaoruiNeural'},
    dragonKing:{name:'zh-CN-YunyangNeural'}, dragonQueen:{name:'zh-CN-XiaohanNeural'},
    southKing:{name:'zh-CN-YunyangNeural'}, westKing:{name:'zh-CN-YunyangNeural'}, northKing:{name:'zh-CN-YunyangNeural'},   // (his brothers, for now, in the Dragon King's own voice)
    // Chapter 6: the old monkey's own (Yunze, as ever); the ten kings', Yunhao, and the Great White Planet's, Yunye (both
    // from round 6 of the voice test, each unlike the Dragon King's: chosen 16 November 2026, the owner having asked for
    // Chapter 6 in one batch with the recommended answers)
    elder:{name:'zh-CN-YunzeNeural'}, king1:{name:'zh-CN-YunhaoNeural'}, planet:{name:'zh-CN-YunyeNeural'}},
  characters: [
    // the sea turtle from your shore (Area 1's friend), swimming over the sand: it greets you as you land, shows you round,
    // and swims ahead to the seaweed where the starfish hide
    {id:'turtle', place:'seabed', x:14, y:6, facing:'left', look:'海龟', flies:true, swims:true,
      moves:[{if:{gifts:{atLeast:4}}, place:'seabed', x:12, y:6, facing:'left'}, {if:{palace:{atLeast:1}}, place:'palace', x:9, y:14, facing:'right'}, {if:{dolphin:2}, place:'trench', x:4, y:9, facing:'up'}, {if:{octopus:{atLeast:1}}, place:'reef', x:2, y:6, facing:'right'}, {if:{turtle:{atLeast:3}}, place:'forest', x:3, y:6, facing:'right'}, {if:{turtle:{atLeast:2}}, place:'seabed', x:5, y:12, facing:'right'}]},
    // the octopus among the seaweed forest's rocks, once it's your friend (till then, the animal there: see animals)
    {id:'octopus', place:'forest', x:13, y:2, facing:'down', look:'章鱼', moves:[{if:{friends:{octopus:false}}, place:'gone', x:0, y:0}]},
    // the dolphin on the coral reef, leaping about by the race track, wanting a race
    {id:'dolphin', place:'reef', x:4, y:8, facing:'down', look:'海豚', flies:true, swims:true},
    // the palace gate's: the sea guard (a yaksha), who stops you as you come down, then steps aside; the crab general and
    // his shrimp soldiers, drilling in time (drills: their spears thrust up and back)
    {id:'yaksha', place:'palace', x:12, y:12, facing:'down', look:'夜叉', name:{zh:'夜叉', py:'yèchā', en:'Sea guard'},
      moves:[{if:{palace:{atLeast:1}}, place:'palace', x:14, y:13, facing:'left'}]},
    {id:'crab', place:'palace', x:6, y:8, facing:'right', look:'蟹将', name:{zh:'蟹将', py:'xièjiàng', en:'Crab general'}},
    // the throne hall's: the Dragon King (Yunyang's voice), who comes to meet you and stays where he met you; the Dragon
    // Queen (Xiaohan's); and two shrimp soldiers by the great scale, who carried the broadsword in
    {id:'dragonKing', place:'hall', x:8, y:3, facing:'down', look:'龙王', name:{zh:'东海龙王', py:'Dōnghǎi Lóngwáng', en:'Dragon King of the Eastern Sea'},
      moves:[{if:{gifts:{atLeast:1}}, place:'hall', x:8, y:3, facing:'down'}, {if:{hall:{atLeast:3}}, place:'treasury', x:5, y:7, facing:'right'}, {if:{hall:{atLeast:1}}, parked:true}]},
    {id:'dragonQueen', place:'hall', x:11, y:3, facing:'down', look:'龙婆', name:{zh:'龙婆', py:'Lóngpó', en:'Dragon Queen'},
      moves:[{if:{gifts:{atLeast:1}}, place:'hall', x:13, y:3, facing:'down'}, {if:{hall:{atLeast:3}}, place:'treasury', x:9, y:7, facing:'left'}]},
    // (step 9) the Dragon King's three younger brothers, come at the sound of his drum and bell, each with a gift for you:
    // the Dragon Kings of the South, West and North Seas, each in his own colours (content/sprites.js)
    {id:'southKing', place:'hall', x:6, y:5, facing:'down', look:'南海龙王', name:{zh:'南海龙王', py:'Nánhǎi Lóngwáng', en:'Dragon King of the South Sea'}, moves:[{if:{gifts:{below:3}}, place:'gone', x:0, y:0}]},
    {id:'westKing', place:'hall', x:8, y:5, facing:'down', look:'西海龙王', name:{zh:'西海龙王', py:'Xīhǎi Lóngwáng', en:'Dragon King of the West Sea'}, moves:[{if:{gifts:{below:3}}, place:'gone', x:0, y:0}]},
    {id:'northKing', place:'hall', x:10, y:5, facing:'down', look:'北海龙王', name:{zh:'北海龙王', py:'Běihǎi Lóngwáng', en:'Dragon King of the North Sea'}, moves:[{if:{gifts:{below:3}}, place:'gone', x:0, y:0}]},
    {id:'carrier1', place:'hall', x:12, y:8, facing:'right', look:'虾兵', name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'carrier2', place:'hall', x:15, y:8, facing:'left', look:'虾兵', name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier1', place:'palace', x:8, y:8, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier2', place:'palace', x:9, y:8, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier3', place:'palace', x:10, y:8, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier4', place:'palace', x:11, y:8, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier5', place:'palace', x:12, y:8, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier6', place:'palace', x:13, y:8, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier7', place:'palace', x:14, y:8, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier8', place:'palace', x:15, y:8, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier9', place:'palace', x:16, y:8, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier10', place:'palace', x:17, y:8, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier11', place:'palace', x:8, y:9, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier12', place:'palace', x:9, y:9, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier13', place:'palace', x:10, y:9, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier14', place:'palace', x:11, y:9, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier15', place:'palace', x:12, y:9, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier16', place:'palace', x:13, y:9, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier17', place:'palace', x:14, y:9, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier18', place:'palace', x:15, y:9, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier19', place:'palace', x:16, y:9, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    {id:'soldier20', place:'palace', x:17, y:9, facing:'down', look:'虾兵', drills:true, name:{zh:'虾兵', py:'xiābīng', en:'Shrimp soldier'}},
    // Chapter 6: the troop at home, as Chapter 4 left them (TROOP): the old monkey in the Water Curtain Cave as you come home,
    // then at the home ground, by the big table (beside your bed as you wake from the dream, with a monkey of the troop);
    // the others at the home ground, but for those who need your staff: a little monkey under the tallest peach tree and
    // the big monkey by the boulder, in the meadow, and a little monkey in the cave, by the crack in its wall
    TROOP('elder', 'ffmCave', 7, 9, 'down', {moves:[{if:{dream:4}, place:'ffmCave', x:2, y:2, facing:'left'}, {if:{home:{atLeast:3}}, place:'ffmHomeGround', x:16, y:8, facing:'down'}]}),
    TROOP('troopA', 'ffmHomeGround', 12, 12, 'right', {moves:[{if:{dream:4}, place:'ffmCave', x:1, y:3, facing:'up'}]}),
    TROOP('troopB', 'ffmHomeGround', 9, 11, 'left'), TROOP('hungry', 'ffmHomeGround', 20, 8, 'down'), TROOP('mother', 'ffmHomeGround', 10, 11, 'right'),
    TROOP('big', 'ffmMeadow', 13, 5, 'right'),
    TROOP('baby1', 'ffmHomeGround', 11, 11, 'left'), TROOP('baby2', 'ffmCave', 2, 11, 'left'), TROOP('baby3', 'ffmHomeGround', 6, 12, 'left'),
    TROOP('baby4', 'ffmHomeGround', 13, 12, 'left'), TROOP('baby5', 'ffmMeadow', 2, 9, 'up'),
    TROOP('traineeStick', 'ffmHomeGround', 2, 12, 'right'), TROOP('boss', 'ffmHomeGround', 7, 8, 'down'),
    // the dream: two officers of the underworld (a gentle name: the plan), with their rope, gone once they've run from your
    // staff; and the ten kings behind their table
    {id:'official1', place:'underworld', person:true, hair:'cap', wear:'robe', x:6, y:9, facing:'down', name:{zh:'差人', py:'chāirén', en:'Officer of the underworld'},
      moves:[{if:{dream:{atLeast:3}}, place:'gone', x:0, y:0}], palette:{o:'#1E1A28', h:'#2A2638', s:'#D8C8B8', e:'#14101C', m:'#A87A6A', c:'#3A3458', b:'#1E1A28', p:'#2A2638'}},
    {id:'official2', place:'underworld', person:true, hair:'cap', wear:'robe', x:8, y:9, facing:'down', name:{zh:'差人', py:'chāirén', en:'Officer of the underworld'},
      moves:[{if:{dream:{atLeast:3}}, place:'gone', x:0, y:0}], palette:{o:'#1E1A28', h:'#2A2638', s:'#D8C8B8', e:'#14101C', m:'#A87A6A', c:'#4A3E5A', b:'#1E1A28', p:'#2A2638'}},
    ...TEN_KINGS,
    // the Great White Planet, come down on his cloud to the home ground with the Jade Emperor's invitation
    {id:'planet', place:'ffmHomeGround', person:true, hair:'bun', beard:true, wear:'robe', x:15, y:10, facing:'left', name:{zh:'太白金星', py:'Tàibái Jīnxīng', en:'The Great White Planet'},
      moves:[{if:{invite:{below:2}}, place:'gone', x:0, y:0}], palette:{o:'#3A2A1E', h:'#F4F4F0', s:'#F2D2B0', e:'#1E140C', m:'#C4826A', c:'#E8E4D8', b:'#C8A04A', p:'#B8B0A0'}}
  ],
  yourNames: [{if:{}, zh:'孙悟空', py:'Sūn Wùkōng', en:'Sun Wukong (you)'}],
  sign: {name:{zh:'牌子', py:'páizi', en:'Sign'}, says:{zh:'海', en:'The sea'}, hint:''},
  spots: [],
  bigSparkles: {landed:0},
  // the seabed's words, once the turtle is showing you round: the sand, a shell, the seaweed
  sparkles: [
    {word:'沙子', at:[9, 8, 'seabed'], if:{turtle:{atLeast:1}}}, {word:'贝壳', at:[10, 5, 'seabed'], if:{turtle:{atLeast:1}}},
    {word:'水草', at:[1, 4, 'seabed'], if:{turtle:{atLeast:1}}},
    {word:'珊瑚', at:[1, 8, 'reef']},
    {word:'龙', at:[8, 4, 'palace'], if:{palace:{atLeast:1}}},
    {word:'柱子', at:[3, 3, 'hall'], if:{hall:{atLeast:1}}},
    {word:'钟', at:[10, 2, 'hall'], if:{gifts:2}},
    {word:'灯', at:[4, 9, 'underworld'], if:{dream:{atLeast:1}}}
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
    '光': 'The light shining up from the very bottom of the trench: 下面有光！',
    '龙': 'The gold dragons coiled round the pillars by the Dragon Palace’s gate.',
    '兵': 'The crab general’s shrimp soldiers, drilling at the Dragon Palace: 他们是我的兵！',
    '百': 'Counting the shrimp soldiers by tens with the crab general: 一百！',
    '龙虾': 'Guarding the Dragon Palace’s door.',
    '柱子': 'The throne hall’s red pillars, gold dragons coiled round them.',
    '欢迎': 'The Dragon King, coming to meet you in his throne hall: 欢迎！欢迎！',
    '重': 'The shrimp soldiers, carrying in the Dragon King’s great broadsword: 太重了！',
    '斤': 'The great broadsword on the palace’s scale: 八百斤！',
    '轻': 'You, lifting the great broadsword in one paw: 太轻了！',
    '千': 'Weighing the fork on the palace’s scale: 三千六百斤！',
    '多少': 'The Dragon King, as you weighed the halberd: 这个多少斤？',
    '长': 'The iron pillar in the Dragon King’s treasury, up through the roof: 太长了！',
    '短': 'Telling the iron pillar what to do: 变短！',
    '金色': 'The pillar, shrinking into a staff in a flash of golden light: 金色的光！',
    '万': 'The staff’s writing, read out by the Dragon King: 一万三千五百斤！',
    '给': 'The Dragon King, handing you the staff: 给你！',
    '钟': 'The Dragon King’s bell, beside his throne: you rang it with your staff, to call his brothers.',
    '针': 'Your staff, shrinking as small as a needle at the home ground.',
    '耳朵': 'Your ear, where you tuck your staff as a needle.',
    '在': 'You, telling a little monkey where your staff is: 在我的耳朵里！',
    '高': 'A little monkey in the meadow, under the tallest peach tree: 树太高了！',
    '绳子': 'The officers of the underworld, in your dream: the rope they tied round you.',
    '灯': 'The stone lamps along the misty road in your dream.',
    '怕': 'The ten kings, in your dream: 我们怕你！',
    '找': 'The ten kings, in your dream: 找你的名字！',
    '毛笔': 'The ten kings, in your dream, giving you a brush to cross out your name.',
    '醒': 'The old monkey, waking you up in the Water Curtain Cave: 醒醒！',
    '梦': 'You, waking up in the Water Curtain Cave: 是梦！',
    '请': 'The Great White Planet, come down to the home ground: 玉皇大帝请你去天宫。'
  },
  practiceSentences: [
    {sentence:'我 有 几 只 脚', sentenceEn:'How many feet have I got?'},   // (几, which has no picture)
    {sentence:'这个 多少 斤', sentenceEn:'How many jin is this one?'},   // (and 多少)
    {sentence:'金箍棒 在 我 的 耳朵 里', sentenceEn:'The staff is in my ear.'},   // (在)
    {sentence:'玉皇大帝 请 你 去 天宫', sentenceEn:'The Jade Emperor invites you to Heaven.'}   // (请)
  ],
  examples: {
    '沙子': {zh:'海 里 有 很多 沙子 。', en:'There’s lots of sand in the sea.'},
    '贝壳': {zh:'我 有 很多 贝壳 。', en:'I have lots of shells.'},
    '水草': {zh:'海星 在 水草 里 。', en:'The starfish are in the seaweed.'},
    '水母': {zh:'海 里 有 水母 。', en:'There are jellyfish in the sea.'},
    '章鱼': {zh:'章鱼 有 八 只 脚 。', en:'An octopus has eight feet.'},
    '珊瑚': {zh:'海 里 有 珊瑚 。', en:'There’s coral in the sea.'},
    '海马': {zh:'海马 很 小 。', en:'The seahorse is small.'},
    '鲸鱼': {zh:'鲸鱼 很 大 。', en:'The whale is very big.'},
    '龙': {zh:'龙 很 大 。', en:'The dragon is very big.'},
    '龙虾': {zh:'龙虾 是 红色 的 。', en:'The lobster is red.'},
    '灯': {zh:'这里 有 很多 灯 。', en:'There are lots of lamps here.'},
    '针': {zh:'针 很 小 。', en:'The needle is very small.'},
    '绳子': {zh:'这 是 绳子 。', en:'This is a rope.'},
    '毛笔': {zh:'我 有 毛笔 。', en:'I have a writing brush.'}
  },
  // What hides in the seaweed forest's tall seaweed (step 3): sharks, and jellyfish, more of them at night
  enemies: {
    shark: {word:'鲨鱼', health:30, hits:10, attacks:['泡泡', '沙子', '贝壳', '水草', '海星'], meetNote:'A shark shoots out of the tall seaweed!', meet:'A {鲨鱼} swims at you!',
      hide:'The {鲨鱼} darts out of sight…', attack:'The {鲨鱼} snaps at you!', away:'The {鲨鱼} swims off into the seaweed.', sniff:'The {鲨鱼} sniffs the water, and swims off!', reward:2},
    jelly: {word:'水母', health:20, hits:8, day:.5, night:2, attacks:['泡泡', '沙子', '贝壳', '水草', '海星'], meetNote:'A jellyfish drifts out of the tall seaweed, glowing!', meet:'A {水母} drifts at you!',
      hide:'The {水母} drifts out of sight…', attack:'The {水母} stings you!', away:'The {水母} drifts off into the seaweed.', sniff:'The {水母} drifts away from the smell!', reward:1}
  },
  // Your broadsword from Chapter 4, in your paw (the staff comes later in Chapter 5).
  battles: {when:{knows:'妖怪'}, weapon:'棍子', hits:10, weapons:{'刀':15, '金箍棒':30},
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
      meetNote:'A huge whale glides up out of the deep, singing! Answer its questions to make friends.'},
    // a lobster guarding the palace door, its big claws up
    {id:'lobster', word:'龙虾', at:[11, 5, 'palace'], home:'海', chapter:0, clue:'The Dragon Palace, guarding its door',
      meetNote:'A lobster guarding the palace door snaps its big claws at you! Answer its questions to make friends.'}
  ],
  birds: {word:'鸟', note:'', colours:[]},
  hidden: [],
  animalsAppear: {knows:'动物'},
  animalsPlay: {say:'play', hint:'It wants to play! Answer its questions to make friends.', friendHint:'Your {朋友} wants to play again! Answer its questions.'},
  tips: {},
  questions: ['listen', 'read', 'gap'],
  // Whoever seals full pages of your scroll: the Dragon King under the sea, once you've met him, and the old monkey at home
  // (Chapter 6), as the master and the old monkey shared it in Chapters 3 and 4.
  scroll: {by:[{who:'dragonKing', if:{hall:{atLeast:1}, home:{below:3}}, say:'great'}, {who:'elder', if:{home:{atLeast:3}}, say:'great'}], snacks:['包子', '蜂蜜', '桃子']},
  // The 老板 at his stall at home (Chapter 6), as in Chapter 4, in shells here, as on Flower Fruit Mountain (no money of
  // its own here); his You're welcome, when you thank him.
  shops: {home: {...ACROSS_THE_SEA.shops.home, welcome:'youreWelcome'}},
  // What you can wear and eat here: everything from the areas before, and the dragon kings' gifts (Chapter 5), each in the
  // colour it's called by and with a look of its own on your monkey (js/art.js): a golden hat with two long red feathers,
  // golden armour, and white cloud shoes. The sentence your monkey says putting each on is the wardrobe's, as for a headband.
  wardrobe: [...ACROSS_THE_SEA.wardrobe,
    {item:'帽子', on:'head', colours:['金色'], look:'goldCap', sentence:'我 戴 金色 的 帽子', sentenceEn:'I wear my golden hat.', colourSentence:'我 戴 {colour} 的 帽子', colourSentenceEn:'I wear my {colour} hat.'},
    {item:'衣服', on:'body', colours:['金色'], look:'goldArmour', sentence:'这 是 金色 的 衣服', sentenceEn:'These are golden clothes.', colourSentence:'这 是 {colour} 的 衣服', colourSentenceEn:'These are {colour} clothes.'},
    {item:'鞋', on:'feet', colours:['白色'], look:'cloudShoes', sentence:'这 是 白色 的 鞋', sentenceEn:'These are white shoes.', colourSentence:'这 是 {colour} 的 鞋', colourSentenceEn:'These are {colour} shoes.'}
  ],
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
    whoAreYou: {zh:'你 是 谁 ？', en:'Who are you?'},
    iAmWukong: {zh:'我 是 孙悟空 ！', en:'I’m Sun Wukong!'},
    kingInside: {zh:'龙王 在 里面 。', en:'The Dragon King is inside.'},
    mySoldiers: {zh:'他们 是 我 的 兵 ！', en:'They’re my soldiers!'},
    ten: {zh:'十 ！', en:'Ten!'},
    twenty: {zh:'二十 ！', en:'Twenty!'},
    thirty: {zh:'三十 ！', en:'Thirty!'},
    forty: {zh:'四十 ！', en:'Forty!'},
    fifty: {zh:'五十 ！', en:'Fifty!'},
    sixty: {zh:'六十 ！', en:'Sixty!'},
    seventy: {zh:'七十 ！', en:'Seventy!'},
    eighty: {zh:'八十 ！', en:'Eighty!'},
    ninety: {zh:'九十 ！', en:'Ninety!'},
    hundred: {zh:'一 百 ！', en:'A hundred!'},
    hundredSoldiers: {zh:'一 百 个 兵 ！', en:'A hundred soldiers!'},
    drillShout: {zh:'一 ， 二 ！ 一 ， 二 ！', en:'One, two! One, two!'},
    welcome: {zh:'欢迎 ！ 欢迎 ！', en:'Welcome! Welcome!'},
    whatDoYouWant: {zh:'你 要 什么 ？', en:'What would you like?'},
    iWantWeapon: {zh:'我 要 刀 ！', en:'I want a broadsword!'},
    tooHeavy: {zh:'太 重 了 ！', en:'Too heavy!'},
    tooLight: {zh:'太 轻 了 ！', en:'Too light!'},
    thisOne: {zh:'你 看 这个 ！', en:'Look at this one!'},
    howManyJin: {zh:'这个 多少 斤 ？', en:'How many jin is this one?'},
    noMore: {zh:'没有 了 。', en:'That’s all there is.'},
    queenHello: {zh:'你好 ！', en:'Hello!'},
    queenWhisper: {zh:'宝库 里 有 一 根 铁 柱子 ， 它 有 光 ！', en:'In the treasury there’s an iron pillar, and it’s glowing!'},
    tooLong: {zh:'太 长 了 ！', en:'It’s too long!'},
    getShorter: {zh:'变 短 ！', en:'Get shorter!'}, getLonger: {zh:'变 长 ！', en:'Get longer!'},
    getSmaller: {zh:'变 小 ！', en:'Get smaller!'}, getBigger: {zh:'变 大 ！', en:'Get bigger!'},
    goldenLight: {zh:'金色 的 光 ！', en:'A golden light!'},
    jin13500: {zh:'一 万 三 千 五 百 斤 ！', en:'Thirteen thousand five hundred jin!'},
    hereYouAre: {zh:'给 你 ！', en:'Here you are!'},
    yoursNow: {zh:'金箍棒 是 你 的 了 ！', en:'The staff is yours now!'},
    wantClothes: {zh:'我 还 要 衣服 ！', en:'I want some clothes too!'},
    threeBrothers: {zh:'我 没有 。 我 有 三 个 弟弟 ！', en:'I haven’t got any. But I’ve got three younger brothers!'},
    beatDrum: {zh:'打 鼓 吧 ！', en:'Beat the drum!'},
    bellToo: {zh:'还 有 钟 ！', en:'And the bell!'},
    theyCame: {zh:'他们 来 了 ！', en:'They’re here!'},
    lovely: {zh:'好看 ！', en:'Lovely!'},
    goHome: {zh:'我们 回家 吧 ！', en:'Let’s go home!'},
    jin800: {zh:'八 百 斤 ！', en:'800 jin!'},
    jin1000: {zh:'一 千 ！', en:'1,000!'},
    jin2000: {zh:'两 千 ！', en:'2,000!'},
    jin3000: {zh:'三 千 ！', en:'3,000!'},
    jin3100: {zh:'三 千 一 百 ！', en:'3,100!'},
    jin3200: {zh:'三 千 二 百 ！', en:'3,200!'},
    jin3300: {zh:'三 千 三 百 ！', en:'3,300!'},
    jin3400: {zh:'三 千 四 百 ！', en:'3,400!'},
    jin3500: {zh:'三 千 五 百 ！', en:'3,500!'},
    jin3600: {zh:'三 千 六 百 斤 ！', en:'3,600 jin!'},
    jin4000: {zh:'四 千 ！', en:'4,000!'},
    jin5000: {zh:'五 千 ！', en:'5,000!'},
    jin6000: {zh:'六 千 ！', en:'6,000!'},
    jin7000: {zh:'七 千 ！', en:'7,000!'},
    jin7100: {zh:'七 千 一 百 ！', en:'7,100!'},
    jin7200: {zh:'七 千 二 百 斤 ！', en:'7,200 jin!'},
    play: {zh:'我们 玩 吧 ！', en:'Let’s play!'},
    count1: {zh:'一 ！', en:'One!'}, count2: {zh:'二 ！', en:'Two!'}, count3: {zh:'三 ！', en:'Three!'}, count4: {zh:'四 ！', en:'Four!'}, count5: {zh:'五 ！', en:'Five!'},
    // Chapter 6
    backAgain: {zh:'你 回来 了 ！', en:'You’re back!'},
    letMeSee: {zh:'我 看看 ！', en:'Let me see!'},
    whereStaff: {zh:'金箍棒 在 哪里 ？', en:'Where’s the staff?'},
    inMyEar: {zh:'在 我 的 耳朵 里 ！', en:'In my ear!'},
    treeTooTall: {zh:'树 太 高 了 ！', en:'The tree’s too tall!'},
    myPearl: {zh:'我 的 珍珠 ！', en:'My pearl!'},
    thanks: {zh:'谢谢 你 ！', en:'Thank you!'},
    areYouWukong: {zh:'你 是 孙悟空 吗 ？', en:'Are you Sun Wukong?'},
    letsGo: {zh:'走 吧 ！', en:'Come on!'},
    wereScared: {zh:'我们 怕 你 ！', en:'We’re scared of you!'},
    findYourName: {zh:'找 你 的 名字 ！', en:'Find your name!'},
    wakeUp: {zh:'醒 醒 ！', en:'Wake up!'},
    itWasADream: {zh:'是 梦 ！', en:'It was a dream!'},
    wontGrowOld: {zh:'我们 不 会 老 了 ！', en:'We won’t grow old now!'},
    invitation: {zh:'玉皇大帝 请 你 去 天宫 。', en:'The Jade Emperor invites you to Heaven.'},
    illGo: {zh:'好 ！ 我 去 ！', en:'All right! I’ll go!'},
    hungry: {zh:'我 饿 了 ！', en:'I’m hungry!'},
    // (the 老板's, as in Chapter 4)
    whatBuy: ACROSS_THE_SEA.lines.whatBuy, whatSell: ACROSS_THE_SEA.lines.whatSell, noProblem: ACROSS_THE_SEA.lines.noProblem, youreWelcome: ACROSS_THE_SEA.lines.welcome
  },
  talk: {
    // the sea turtle: hello (好久不见 if it's your friend from the shore), your bubble (泡泡); a look round (the sand, a shell,
    // the seaweed); then it swims ahead to the seaweed (游), where five starfish hide; and once you've found them all, shells
    turtle: [
      // (step 9) home: up through the water to the iron bridge, the end of Chapter 5
      {if:{gifts:4, home:{below:2}}, do:[{say:'goHome'}, {scene:'swimHome'}, {set:{home:2}}]},   // (then home to the cave, and Chapter 6: an event)
      {if:{home:{atLeast:3}}, do:[{say:'goHome'}, {scene:'swimHome'}, {goTo:'ffmCave', at:[7, 7], facing:'down'}]},   // (home again, after a dive from the iron bridge)
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
    ],
    // the sea guard: who are you? (你是谁？ 我是孙悟空！), then he steps aside
    yaksha: [
      {if:{palace:0}, do:[{say:'whoAreYou'}, {say:'iAmWukong', by:'player'}, {say:'kingInside'}, {set:{palace:1}},
        {message:'The sea guard steps aside. Gold dragons are coiled round the pillars by the gate, and a crab general is drilling his shrimp soldiers…'}]},
      {do:[{say:'kingInside'}]}
    ],
    // the Dragon King: his weapons, each weighed on the great scale and lifted, all too light: the broadsword the soldiers
    // carried in (重), 八百斤 (斤), 太轻了！ (轻); the fork, weighed by you (千); the halberd (多少)
    dragonKing: [
      {if:{hall:1}, do:[
        {leadTo:[12, 9], you:[13, 9, 'up']},
        {say:'tooHeavy', by:'carrier1', teach:'重'}, {newWord:'重', note:'重 means heavy: 太重了！ Too heavy! It takes two shrimp soldiers to carry the great broadsword.'},
        {weigh:'broadsword'}, {newWord:'斤', note:'斤 means jin, a weight: half a kilo. 八百斤, eight hundred jin!'},
        {heave:'broadsword'}, {say:'tooLight', by:'player', teach:'轻'}, {newWord:'轻', note:'轻 means light, not heavy: 太轻了！ Too light! You lift it in one paw.'},
        {say:'thisOne'}, {weigh:'fork'}, {newWord:'千', note:'千 means thousand: 三千六百斤, three thousand six hundred jin!'},
        {heave:'fork'}, {say:'tooLight', by:'player'},
        {say:'howManyJin', teach:'多少'}, {newWord:'多少', note:'多少 means how many, or how much: 这个多少斤？ How many jin is this one?'},
        {weigh:'halberd'}, {heave:'halberd'}, {say:'tooLight', by:'player'},
        {say:'noMore'}, {set:{hall:2}},
        {message:'None of the Dragon King’s weapons is heavy enough. To be continued: the Dragon Queen has an idea…'}]},
      {if:{hall:2}, do:[{say:'noMore'}]},
      {if:{staff:3}, do:STAFF_GIVEN},
      {if:{staff:4, gifts:0}, do:ASK_CLOTHES},   // (a game from before the gifts)
      {if:{gifts:1}, do:[{say:'beatDrum'}]}, {if:{gifts:2}, do:[{say:'bellToo'}]}, {if:{gifts:3}, do:[{say:'theyCame'}]},
      {if:{hall:3, staff:{below:3}}, do:[{say:'thisOne'}]},
      {do:[{say:'welcome'}]}
    ],
    // the Dragon Queen's idea: the iron pillar in the treasury, glowing (her whisper), and she leads you to its door
    dragonQueen: [
      {if:{hall:2}, do:[{say:'queenWhisper'}, {leadTo:[12, 1], you:[12, 2, 'up']}, {set:{hall:3}},
        {message:'The Dragon Queen opens the {门|door} at the back of the throne hall, and the Dragon King follows her in, to the treasury.'}]},
      {do:[{say:'queenHello'}]}],
    carrier1: [{do:[{say:'tooHeavy'}]}], carrier2: [{do:[{say:'tooHeavy'}]}],
    // the Dragon King's brothers, each with his gift (给你！), put on as you watch, and what you say as you wear it
    southKing: [{if:{south:0}, do:[{say:'hereYouAre'}, {if:{new:'帽子'}, newWord:'帽子', note:'帽子 means hat.'},
      {gift:'金色 的 帽子', label:'A gift from the Dragon King of the South Sea', note:'A golden hat, with two long red feathers! You put it on.'}, {set:{south:1}}]}, {do:[{say:'lovely'}]}],
    westKing: [{if:{west:0}, do:[{say:'hereYouAre'}, {if:{new:'衣服'}, newWord:'衣服', note:'衣服 means clothes.'},
      {gift:'金色 的 衣服', label:'A gift from the Dragon King of the West Sea', note:'Golden clothes: armour of little golden scales, to go with your staff! You put them on.'}, {set:{west:1}}]}, {do:[{say:'lovely'}]}],
    northKing: [{if:{north:0}, do:[{say:'hereYouAre'}, {if:{new:'鞋'}, newWord:'鞋', note:'鞋 means shoes.'},
      {gift:'白色 的 鞋', label:'A gift from the Dragon King of the North Sea', note:'White shoes, as light as clouds: in these, you could walk on the clouds! You put them on.'}, {set:{north:1}}]}, {do:[{say:'lovely'}]}],
    // the crab general: his soldiers (兵), counted with you by tens to a hundred (百)
    crab: [
      {if:{palace:1}, do:[
        {say:'mySoldiers', teach:'兵'}, {newWord:'兵', note:'兵 means soldier. 虾兵, the shrimp soldiers, are shrimp + soldier!'},
        {countTens:["ten","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety","hundred"]},
        {newWord:'百', note:'百 means hundred: 一百, one hundred. Ten rows of ten soldiers!'},
        {say:'hundredSoldiers'}, {set:{palace:2}}, {message:'Something is guarding the palace door. Go and meet it!'}]},
      {if:{palace:{atLeast:2}}, do:[{say:'mySoldiers'}, {countTens:["ten","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety","hundred"]}]},
      {do:[{say:'mySoldiers'}]}
    ],
    soldier1: [{do:[{say:'drillShout'}]}],
    soldier2: [{do:[{say:'drillShout'}]}],
    soldier3: [{do:[{say:'drillShout'}]}],
    soldier4: [{do:[{say:'drillShout'}]}],
    soldier5: [{do:[{say:'drillShout'}]}],
    soldier6: [{do:[{say:'drillShout'}]}],
    soldier7: [{do:[{say:'drillShout'}]}],
    soldier8: [{do:[{say:'drillShout'}]}],
    soldier9: [{do:[{say:'drillShout'}]}],
    soldier10: [{do:[{say:'drillShout'}]}],
    soldier11: [{do:[{say:'drillShout'}]}],
    soldier12: [{do:[{say:'drillShout'}]}],
    soldier13: [{do:[{say:'drillShout'}]}],
    soldier14: [{do:[{say:'drillShout'}]}],
    soldier15: [{do:[{say:'drillShout'}]}],
    soldier16: [{do:[{say:'drillShout'}]}],
    soldier17: [{do:[{say:'drillShout'}]}],
    soldier18: [{do:[{say:'drillShout'}]}],
    soldier19: [{do:[{say:'drillShout'}]}],
    soldier20: [{do:[{say:'drillShout'}]}],
    // Chapter 6: the little monkeys can't lift your staff, so you show them: up to the sky (变长), then down to a needle
    // (针), tucked into your ear (耳朵); and where is it now? (在)
    baby1: [{if:{home:3, ear:0}, do:[
      {say:'letMeSee'}, {message:'The little monkeys try to lift your staff, all of them together…'}, {say:'tooHeavy'},
      {tell:'sky'}, {stow:'left'}, {scene:'staffSky'}, {set:{ear:1}},
      {newWord:'针', note:'针 means needle. Your staff has shrunk as small as a needle!'},
      {newWord:'耳朵', note:'耳朵 means ear. You tuck the needle into your ear, where it’s always with you.'},
      {say:'whereStaff'}, {say:'inMyEar', by:'player', teach:'在'}, {newWord:'在', note:'在 means at, or in: 在我的耳朵里！ In my ear! It says where something is.'},
      {message:'The troop has jobs for your staff! Look for monkeys with a ! in the meadow, the Water Curtain Cave and here.'}]},
      {do:[{say:'letMeSee'}]}],
    // the spots: who needs your staff, and why (the spots themselves are squares: put, in ffmMeadow and ffmCave)
    baby5: [{if:{ear:1, spotTree:0}, do:[{say:'treeTooTall', teach:'高'}, {newWord:'高', note:'高 means tall, or high. The best peaches are right at the top of the tree, too high for anyone to reach!'},
      {message:'Face the tall peach tree beside the little monkey, and press A to take out your staff.'}]}, {do:[{say:'thanks'}]}],
    big: [{if:{ear:1, spotBoulder:0}, do:[{say:'tooHeavy'}, {message:'The big monkey has been trying to move the boulder beside him: something glints under it, but it’s far too heavy. Face it, and press A.'}]}, {do:[{say:'great'}]}],
    baby2: [{if:{ear:1, spotCrack:0}, do:[{say:'myPearl'}, {message:'Her {珍珠|pearl} has rolled into the thin crack in the wall, too thin for any paw. Face the crack, and press A.'}]}, {do:[{say:'thanks'}]}],
    traineeStick: [{if:{ear:1, spotTrainee:0}, do:[{say:'letMeSee'}, {tell:'trainee'},
      {message:'The little monkey swings your staff round and round, just like you! Then he gives it back.'}, {stow:true}, {say:'great'}, {set:{spotTrainee:1}}]},
      {do:[{say:'great'}]}],
    // the troop, and the 老板
    elder: [{if:{dream:4}, do:[{say:'wakeUp'}]}, {do:[{say:'lovely'}]}],
    troopA: [{if:{dream:{atLeast:5}}, do:[{say:'wontGrowOld'}]}, {do:[{say:'lovely'}]}],
    troopB: [{do:[{say:'lovely'}]}], hungry: [{do:[{say:'hungry'}]}], mother: [{do:[{say:'lovely'}]}],
    baby3: [{do:[{say:'letMeSee'}]}], baby4: [{do:[{say:'letMeSee'}]}],
    boss: [{do:[{shop:'home'}]}],
    // the dream: the officers, and their rope (绳子); up the road with them, till your staff scares them off
    official1: [{if:{dream:1}, do:[
      {say:'areYouWukong'}, {say:'iAmWukong', by:'player'}, {say:'letsGo'}, {set:{dream:2}},
      {newWord:'绳子', note:'绳子 means rope. The two officers have tied a rope round you, and they’re leading you off!'},
      {leadTo:[7, 5], you:[7, 6, 'up']},
      {say:'getBigger', by:'player'}, {flourish:true},
      {walk:'official1', to:[5, 12], ms:150}, {walk:'official2', to:[9, 12], ms:150}, {set:{dream:3}},
      {message:'The officers drop their rope and run! A dim hall stands at the top of the road.'}]},
      {do:[{say:'letsGo'}]}],
    official2: [{do:[{say:'letsGo'}]}],
    // the ten kings: scared of you (怕), and the book of names: find yours (找), and cross it out with a brush (毛笔); then
    // you run, trip, and wake up at home the next morning
    king1: [{if:{dream:3}, do:[
      {say:'wereScared', teach:'怕'}, {newWord:'怕', note:'怕 means to be scared. The ten kings are scared of you, and your staff!'},
      {say:'findYourName', teach:'找'}, {newWord:'找', note:'找 means to look for. 找你的名字！ Look for your name!'},
      {message:'The kings open the book of names. Everyone’s name is written in it.'},
      {newWord:'毛笔', note:'毛笔 means a writing brush: 毛 hair + 笔 pen. The kings give you one, dipped in ink.'},
      {book:'names'}, {set:{dream:4}},
      {message:'You throw down the brush and run, out of the hall and down the road… and trip over something…'},
      {morning:true}, {goTo:'ffmCave', at:[1, 2], facing:'right'}]},
      {do:[{say:'wereScared'}]}],
    king2: [{do:[{say:'wereScared'}]}], king3: [{do:[{say:'wereScared'}]}], king4: [{do:[{say:'wereScared'}]}], king5: [{do:[{say:'wereScared'}]}],
    king6: [{do:[{say:'wereScared'}]}], king7: [{do:[{say:'wereScared'}]}], king8: [{do:[{say:'wereScared'}]}], king9: [{do:[{say:'wereScared'}]}], king10: [{do:[{say:'wereScared'}]}],
    // the Great White Planet: you welcome him (欢迎, the phrase you learned in the Dragon King's hall), and his invitation (请)
    planet: [{if:{invite:2}, do:[
      {reply:'欢迎', about:'The Great White Planet has come down from the sky, to your home. What do you say?'},
      {say:'invitation', teach:'请'}, {newWord:'请', note:'请 means to invite, or please: 玉皇大帝请你去天宫。 The Jade Emperor invites you to Heaven!'},
      {say:'illGo', by:'player'}, {set:{invite:3}}, {areaEnd:true}]},
      {do:[{say:'invitation'}]}]
  },
  // The Dragon King's weapons on the palace's great scale (the weigh step, js/sea.js): the broadsword weighed already, its
  // weights on (show); the fork and the halberd, weighed by you, big weights first, each total said as it grows (its lines,
  // jin and the total; says, in order), its weight with 斤 as it balances. (The book's weights for the fork and the halberd;
  // the broadsword's is the game's own.)
  weighing: {
    broadsword: {pic:'broadsword', target:800, show:true, teach:'斤', label:'The great broadsword, on the palace’s great scale', says:["jin800"]},
    fork: {pic:'fork', target:3600, teach:'千', label:'Weigh the fork: put weights on the scale till it balances.', says:["jin1000","jin2000","jin3000","jin3100","jin3200","jin3300","jin3400","jin3500","jin3600"]},
    halberd: {pic:'halberd', target:7200, label:'Weigh the halberd yourself: put weights on till it balances.', says:["jin1000","jin2000","jin3000","jin4000","jin5000","jin6000","jin7000","jin7100","jin7200"]}
  },
  // What you tell the iron pillar (the tell step, js/sea.js): what you could say, each your line, what it turns into as you
  // watch, and what happens if it's not what's needed
  telling: {
    shorter: {ask:'The {柱子|pillar} is far too {长|long} to hold. What do you tell it?', choices:['变长', '变短'], right:'变短', teach:'短',
      says:{'变长':'getLonger', '变短':'getShorter'}, morph:{'变长':'longer', '变短':'short'},
      wrong:{'变长':'It strains to grow even {长|longer}, and the whole treasury shakes! That won’t help.'}},
    smaller: {ask:'It’s {短|short} now, but still far too thick to hold. What do you tell it?', choices:['变大', '变小'], right:'变小',
      says:{'变大':'getBigger', '变小':'getSmaller'}, morph:{'变大':'wide', '变小':'small'},
      wrong:{'变大':'It grows even thicker! That won’t help.'}},
    // Chapter 6: your staff at home (staff: its length and thickness in pixels as you see it, for each thing you tell it)
    sky: {ask:'The little {猴子|monkeys} want to see what your staff can do! What do you tell it?', choices:['变长', '变短'], right:'变长',
      says:{'变长':'getLonger', '变短':'getShorter'}, staff:{'变长':{len:46, w:3}, '变短':{len:7, w:3}},
      wrong:{'变短':'It shrinks to a little stub. The little monkeys giggle!'}},
    tree: {ask:'The best {桃子|peaches} are at the very top of the tree. What do you tell your staff?', choices:['变长', '变短'], right:'变长', up:true,
      says:{'变长':'getLonger', '变短':'getShorter'}, staff:{'变长':{len:44, w:3}, '变短':{len:7, w:3}},
      wrong:{'变短':'It shrinks to a little stub, nowhere near the {桃子|peaches}!'}},
    islet: {ask:'Something glints on the little island, but the {水|water} is in the way. What do you tell your staff?', choices:['变长', '变短'], right:'变长',
      says:{'变长':'getLonger', '变短':'getShorter'}, staff:{'变长':{len:42, w:4}, '变短':{len:7, w:3}},
      wrong:{'变短':'It shrinks to a little stub. You’d never get across on that!'}},
    boulder: {ask:'The boulder is far too {重|heavy} for the troop. What do you tell your staff?', choices:['变大', '变小'], right:'变大',
      says:{'变大':'getBigger', '变小':'getSmaller'}, staff:{'变大':{len:26, w:7}, '变小':{len:12, w:1}},
      wrong:{'变小':'It shrinks as thin as a twig. That won’t move a boulder!'}},
    crack: {ask:'The {珍珠|pearl} has rolled deep into the thin crack. What do you tell your staff?', choices:['变大', '变小'], right:'变小',
      says:{'变大':'getBigger', '变小':'getSmaller'}, staff:{'变小':{len:18, w:1}, '变大':{len:18, w:7}},
      wrong:{'变大':'It grows far too thick to go into the crack!'}},
    trainee: {ask:'The little {猴子|monkey} would like to try your staff, but it’s far too {长|long} for him. What do you tell it?', choices:['变长', '变短'], right:'变短',
      says:{'变长':'getLonger', '变短':'getShorter'}, staff:{'变短':{len:11, w:2}, '变长':{len:40, w:3}},
      wrong:{'变长':'It grows even longer, and the little monkey jumps back!'}}
  },
  // The book of names, in the dream (the book step, js/sea.js): everyone's name in it (yours, you; the troop's, every name
  // with 猴 in it, monkey), each with its pinyin and, once crossed out, its English; what the card says as you go.
  books: {
    names: {label:'The book of names', find:'Everyone’s name is written in it. Find your name, and cross it out!',
      notYours:'That isn’t your name. Find yours: 孙悟空.', troop:'Now the troop’s names: cross out every name with 猴 in it, so no monkey of Flower Fruit Mountain will grow old.',
      noMonkey:'There’s no 猴 in that name.', more:'{n} more with 猴 in them.', done:'All crossed out! No monkey of Flower Fruit Mountain will ever grow old.',
      names:[
        {zh:'小狗', py:'xiǎo gǒu', en:'Little dog'}, {zh:'老猴子', py:'lǎo hóuzi', en:'Old monkey', monkey:true}, {zh:'白马', py:'bái mǎ', en:'White horse'},
        {zh:'大鱼', py:'dà yú', en:'Big fish'}, {zh:'孙悟空', py:'Sūn Wùkōng', en:'Sun Wukong (you)', you:true}, {zh:'大猴子', py:'dà hóuzi', en:'Big monkey', monkey:true},
        {zh:'饿猴子', py:'è hóuzi', en:'Hungry monkey', monkey:true}, {zh:'老牛', py:'lǎo niú', en:'Old cow'}, {zh:'小鸟', py:'xiǎo niǎo', en:'Little bird'},
        {zh:'小猫', py:'xiǎo māo', en:'Little cat'}, {zh:'小猴子', py:'xiǎo hóuzi', en:'Little monkey', monkey:true}, {zh:'白兔', py:'bái tù', en:'White rabbit'}]}
  },
  // The staff's writing, on a card (the writing step, js/sea.js): its name, and how heavy it is, which the Dragon King reads out
  writing: {
    staff: {label:'There’s writing on the staff', lines:[{zh:'如意金箍棒', name:true}, {zh:'一 万 三 千 五 百 斤'}],
      note:'You can read how heavy it is, all but its second character. The Dragon King reads it out for you.'}
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
  // The end of Area 3 (the end of Chapter 6, as the book's chapter 3 ends), then what's to come.
  areaEnd: {title:'The end of Area 3', text:['Your name is gone from the book of names, and no monkey of Flower Fruit Mountain will ever grow old.',
    'The Jade Emperor has invited you to Heaven! To be continued: up to Heaven (Area 4). Till then, explore Flower Fruit Mountain, and dive from the iron bridge to the sea.']},
  storyEnd: {title:'', reward:0, rumble:false, text:[]},
  exit: {notReady:'Not yet.', ready:'Ready.', tryAgain:'Try again.', passButton:'OK', failButton:'OK', done:'Done.', notBuilt:'Not built yet.', returnTo:{x:11, y:6, facing:'down'}},
  intro: [],
  scenes: {
    // diving from the iron bridge in the Water Curtain Cave, down through the water in your bubble of air, to the seabed
    dive: {watch:'Watch the dive', part:'seabed', when:{landed:1}, captions: [
      {at:0, zh:'一 ， 二 ， 三 ， 跳 ！', en:'One, two, three, jump!'},
      {at:3.5, zh:'水 里 有 很多 鱼 。', en:'There are lots of fish in the water.'},
      {at:7, zh:'孙悟空 在 海 下面 ！', en:'Sun Wukong is under the sea!'}
    ]},
    // the Dragon King's brothers, coming at the sound of his drum and bell, from the south, the west and the north (played as
    // you ring the bell, A at it: like the supply basket's, it has no button to watch it again)
    brothers: {name:'the dragon kings coming', captions: [
      {at:0, zh:'南边 ， 西边 ， 北边 ……', en:'South, west, north…'},
      {at:3.5, zh:'三 个 龙王 来 了 ！', en:'Three dragon kings are coming!'}
    ]},
    // home with the sea turtle, up through the water to the iron bridge in the Water Curtain Cave
    swimHome: {watch:'Watch the swim home', part:'gifts', when:{home:2}, captions: [
      {at:0, zh:'孙悟空 回家 了 。', en:'Sun Wukong is going home.'},
      {at:4.4, zh:'我 回来 了 ！', en:'I’m back!'}
    ]},
    // Chapter 6: diving again from the iron bridge (A at it: no button to watch it again)
    diveAgain: {art:'dive', captions: [
      {at:0, zh:'一 ， 二 ， 三 ， 跳 ！', en:'One, two, three, jump!'},
      {at:7, zh:'孙悟空 在 海 下面 ！', en:'Sun Wukong is under the sea!'}
    ]},
    // the staff up to the sky at the home ground, then down to a needle, into your ear
    staffSky: {watch:'Watch the staff grow to the sky', part:'homeAgain', when:{ear:1}, captions: [
      {at:0, zh:'变 长 ！', en:'Get longer!'},
      {at:4.4, zh:'变 小 ！ 变 小 ！', en:'Get smaller! Get smaller!'},
      {at:7.6, zh:'好 ！', en:'There!'}
    ]},
    // the troop's feast for your staff (the party's picture, js/havoc.js)
    staffFeast: {art:'party', watch:'Watch the feast for the staff', part:'dream', when:{feast:1}, captions: [
      {at:0, zh:'大家 吃 吧 ！', en:'Let’s all eat!'}
    ]},
    // falling asleep after the feast, into the dream (A at a bed: no button to watch it again)
    dreamIn: {captions: [
      {at:0, zh:'孙悟空 睡觉 了 。', en:'Sun Wukong falls asleep.'},
      {at:3.4, zh:'这 是 哪里 ？', en:'Where is this?'}
    ]},
    // trouble in Heaven: the Dragon King, and the ten kings, complain to the Jade Emperor; the Great White Planet's idea
    heaven: {watch:'Watch the trouble in Heaven', part:'heaven', when:{invite:{atLeast:1}}, captions: [
      {at:0, zh:'龙王 去 天宫 。', en:'The Dragon King goes up to Heaven, to complain.'},
      {at:3.2, zh:'十王 也 去 天宫 。', en:'The ten kings go up to Heaven too.'},
      {at:6.4, zh:'我 去 找 孙悟空 ！', en:'The Great White Planet: “I’ll go and find Sun Wukong!”'}
    ]},
    // the Great White Planet coming down on his cloud to the home ground
    planetCloud: {watch:'Watch the Great White Planet come', part:'heaven', when:{invite:{atLeast:2}}, captions: [
      {at:0, zh:'有 人 来 了 ！', en:'Someone’s coming!'},
      {at:3.8, zh:'你 是 谁 ？', en:'Who are you?'}
    ]}
  }
};
