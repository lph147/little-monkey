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
// The teacher's mountain's own letters (chapter 1: the cliff road's and the stone pillars' legend, on top of the area's):
// its rock, mossy stone, pines growing out of the rock and a sea of clouds below (js/mountain.js); a walkway of planks; gusts
// of wind across it (vents with wind, all four rows at once: wait for a gust to drop, then cross); loose planks
// hung by chains, to hop (swing: a wrong one swings away, and you grab the chain); a chain up a sheer face, to climb, a
// question a pull (the climb step); peaches; the mountain's tablet and the cave's stone door, open once the boy has opened it.
const GUST = {wind:true, every:3200, puff:1000, at:0, hot:'The wind is too strong! Wait for the gust to drop, then cross the windy planks quickly.', pushed:'Whoosh! The wind blows you back.'};   // (every row at once, so you can cross up or down: decided 6 November 2026, after playing it; a row after another, you couldn't come back down)
const CLIMB_LEGEND = {
  // lingzhi (灵芝), the mushroom of long life, growing out of the rock among the stone pillars (the master's year, summer:
  // he needs three for his medicine, 药)
  'Z': {look:'lingzhi', landmark:true, onLook:[{if:{herbs:1}, label:'Pick', sparkle:true, do:[{pickUp:'灵芝'}, {change:'k'},
      {collect:'灵芝', for:'herbs', count:3, quiet:true, each:'You pick a lingzhi ({herbsFound}/3).', full:'Three lingzhi! Take them to the master.'}]},
    {do:[{message:'A lingzhi, a mushroom of long life, growing out of the rock.'}]}]},
  'c': {look:'cloudSea', word:'云', note:'A sea of clouds, far below.', onLook:[{if:{new:'云'}, label:'Look', do:[{newWord:'云', note:'云 means cloud. You’re up above the clouds!'}]}]},
  'R': {look:'karstTop', word:'山'},
  'K': {look:'karstFace', word:'山'},
  'k': {look:'mossStone', walk:true},
  'T': {look:'twistedPine', word:'树', note:'A pine, growing out of the bare rock.'},
  's': {look:'water', word:'水', note:'Clear, cold water, running down from the top of the mountain.'},
  'W': {look:'waterfall', word:'瀑布'},
  'H': {look:'plankH', walk:true},
  'V': {look:'plankV', walk:true},
  'w': {look:'windPlank', walk:true, vent:GUST},
  'v': {look:'windPlank', walk:true, vent:GUST},
  'q': {look:'windPlank', walk:true, vent:GUST},
  'j': {look:'windPlank', walk:true, vent:GUST},
  'h': {look:'loosePlank', hop:{label:'Loose planks', ask:'Listen, and hop onto the plank with its picture.', swing:true,
    splash:'The plank swings away under you! You grab the chain, and pull yourself back.'}},
  'C': {look:'chainFace', landmark:true, onLook:[{label:'Climb', do:[{climb:[[12, 8], [12, 11]], pulls:3, label:'Climbing the chain', pic:'猴子'}]}]},
  'Q': {look:'rockPeach', word:'桃子', landmark:true, note:'A peach tree, in blossom and ripe fruit at once.', pick:{item:'桃子'}},
  'X': {look:'mountainTablet', landmark:true, action:'sign', sign:{name:{zh:'石碑', py:'shíbēi', en:'Stone tablet'}, says:{zh:'灵台方寸山', en:'Mountain of Mind and Heart'}, hint:'The name of the immortal’s mountain.'}},
  'D': {look:'stoneDoor', landmark:true, action:'sign', sign:{name:{zh:'石门', py:'shímén', en:'Stone door'}, says:{zh:'斜月三星洞', en:'Cave of the Slanting Moon and Three Stars'}, hint:'The name of the immortal’s cave.'},
    becomes:[{if:{door:{atLeast:1}}, to:'Ď'}]},
  'Ď': {look:'stoneDoor', open:true, landmark:true, action:'sign', sign:{name:{zh:'石门', py:'shímén', en:'Stone door'}, says:{zh:'斜月三星洞', en:'Cave of the Slanting Moon and Three Stars'}, hint:'The name of the immortal’s cave.'}}
};
// The cave behind the stone door (斜月三星洞, chapter 1): a great hollow in the mountain, open to the sky, ringed by
// rock; the lecture hall against its back wall, the pupils' rooms cut into the rock (yours on the left), the master's
// back door beside the hall, a spring falling into a pool, a peach garden, pines, a woodpile and logs to chop, and
// leaves to sweep. The same map by day (cave) and by night (caveNight, the night of the master's riddle: CAVE_NIGHT).
const CAVE_MAP = [
  "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR",
  "RRKKKKKKKKKHHHHHHHKKKKKWWKKKRR",
  "RRKKYKyKyKKHHHHHHHKMKKKWWKKKRR",
  "RRkkkFkkkkjHHHHHHHkkksssssskRR",
  "RRkkkkk##############sssssskRR",
  "RRkkkkk##############sssssskRR",
  "RRkQkkk##l######El###ssmssskRR",
  "RRkkkkk##############kkkkkkkRR",
  "RRkkkqk##############kkkkkkkRR",
  "RRkQkkk#####l########pkkkkTkRR",
  "RRkkkUk#######B######kkkkkkkRR",
  "RRkkkkk############l#kkLkLkkRR",
  "RRqkkqk#l############kkkkkkoRR",
  "RRkkkkk##############kNkkkkkRR",
  "RRkkkkk##############kkkTkkkRR",
  "RRTkkkkkkTkkkkkkkkkkkkkkkkkkRR",
  "RRRRRRRRRRRRRRkkRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRkkRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRkkRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRkkRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRkkRRRRRRRRRRRRRR"
];
// The night between two seasons of the master's year (decided 7 November 2026, from the plan): once a season's jobs are
// done, evening falls, with the first sign of the season to come; you go to bed in your room, the night passes in a scene
// as the cave turns, and in the morning you come out into the new season: its part of the story, and its word.
const NEXT_SEASON = (to, word, note) => [{scene:['', 'toSummer', 'toAutumn', 'toWinter'][to]}, {set:{season:to, evening:0}}, {morning:true}, {goTo:'cave', at:[4, 4], facing:'down'},
  {nextPart:true}, {newWord:word, note}];
// Sweeping up the autumn leaves (扫), for the senior pupil.
const SWEEP_LEAVES = [{say:'sweepLeaves', teach:'扫'}, {newWord:'扫', note:'扫 means to sweep. Face a heap of leaves, and press A to sweep it up.'}, {set:{sweep:1}}];
// A bucket of water from the pool for your little tree (spring): one, filled and carried in your hands.
const FILL_FOR_TREE = {if:{myTree:2, carrying:false}, label:'Fill', do:[{dip:'水'}, {carry:'水', inHand:true, took:'You fill the bucket with {水|water}. Now water your little tree: face it, and press A.'}]};
const CAVE_LEGEND = {
  'R': {look:'karstTop', word:'山'},
  'K': {look:'karstFace', word:'山'},
  'k': {look:'mossStone', walk:true},
  '#': {look:'paving', walk:true},
  'H': {look:'jHouse', word:'房子', note:'The lecture hall, where the master teaches.'},
  'T': {look:'twistedPine', word:'树', note:'A pine, growing out of the rock.'},
  'W': {look:'waterfall', word:'瀑布'},
  's': {look:'water', word:'水', note:'A clear pool, fed by the spring.', onLook:[FILL_FOR_TREE, {if:{waterFetch:1}, label:'Fill', do:[{carry:'水', howMany:true, inHand:true, each:[{dip:'水'}], ask:'How many {桶|buckets} of {水|water} do you want to fill?', took:'You’re carrying {n} bucket{s} of {水|water}. Take {them} to the senior pupil.'}]}]},
  'm': {look:'water', word:'水', note:'A clear pool, fed by the spring.', onLook:[FILL_FOR_TREE, {if:{waterFetch:1}, label:'Fill', do:[{carry:'水', howMany:true, inHand:true, each:[{dip:'水'}], ask:'How many {桶|buckets} of {水|water} do you want to fill?', took:'You’re carrying {n} bucket{s} of {水|water}. Take {them} to the senior pupil.'}]}]},
  'Q': {look:'rockPeach', word:'桃子', landmark:true, note:'A peach tree, in the master’s garden.', pick:{item:'桃子', if:{any:[{season:1}, {grown:1}]}}},   // (ripe in summer)
  'q': {look:'sapling', word:'桃子', note:'A young peach tree, just planted. You water it every day.', becomes:[{if:{grown:1}, to:'Q'}]},
  'o': {look:'boulder', word:'石头'},
  'j': {look:'jars', landmark:true, onLook:[{do:[{message:'Big jars of water, for the kitchen.'}]}]},
  'p': {look:'woodpile', word:'木头', note:'The cave’s firewood.', onLook:[{if:{fire:1, carrying:false}, label:'Take', do:[{carry:'木头', took:'You take an armful of {木头|wood} from the pile. Now light the fire: face the brazier, and press A.'}]}]},
  'L': {look:'stump', landmark:true, onLook:[{if:{axeFetch:1}, label:'Chop', do:[{carry:'木头', howMany:true, each:[{practise:1, label:'Chopping the wood', pic:'斧头'}, {hit:'wood', with:'斧头', times:2}], ask:'How many pieces of {木头|wood} do you want to chop?', took:'You’re carrying {n} piece{s} of {木头|wood}. Take {them} to the senior pupil.'}]},
    {do:[{message:'A chopping block, with logs beside it to chop.'}]}]},
  'l': {look:'leafPile', word:'叶子', becomes:[{if:{any:[{season:{below:2}}, {season:3}, {grown:1}]}, to:'#'}],   // (heaps of fallen leaves in autumn, the master's year)
    onLook:[{if:{sweep:0}, do:[{message:'A heap of fallen leaves.'}]},
    {if:{sweep:1}, label:'Sweep', sparkle:true, do:[{practise:1, label:'Sweeping the leaves', pic:'扫'}, {sweep:'leaves'}, {change:'#'},
      {collect:'叶子', for:'sweep', count:5, each:'You sweep up the leaves ({leavesSwept}/5).', full:'All five heaps swept! Tell the senior pupil.'}]}]},
  'y': {look:'rockDoor', word:'门', note:'A pupil’s room, cut into the rock.'},
  // by your room's door, as summer ends: the first yellow leaf of autumn, drifted down (叶子)
  'F': {look:'mossStone', walk:true, becomes:[{if:{season:1, evening:1}, to:'f'}, {if:{season:2, evening:1}, to:'g'}]},
  'f': {look:'fallenLeaf', walk:true, word:'叶子', onLook:[{if:{new:'叶子'}, label:'Look', sparkle:true, do:[{newWord:'叶子', note:'叶子 means a leaf, or leaves. The first yellow leaf, drifting down: autumn is coming!'}]}]},
  // and as autumn ends, the first snow settling there (雪)
  'g': {look:'firstSnow', walk:true, word:'雪', onLook:[{if:{new:'雪'}, label:'Look', sparkle:true, do:[{say:'snowing', by:'player', teach:'雪'}, {newWord:'雪', note:'雪 means snow. 下雪了！ It’s snowing! Winter is coming.'}]}]},
  // your own little peach tree (the master's year): given you by the senior pupil in spring, planted where the garden
  // sparkles, watered from a bucket, and growing as the seasons go round (its look: myTree, js/seasons.js)
  'U': {look:'mossStone', walk:true, becomes:[{if:{wrapped:1, season:3, grown:0}, to:'û'}, {if:{myTree:{atLeast:2}}, to:'u'}],
    onLook:[{if:{myTree:1}, label:'Plant', sparkle:true, do:[{kneel:'树'}, {plant:{myTree:2}}, {message:'Your own little peach tree! Now fill the bucket at the pool, and water it.'}]}]},
  'u': {look:'myTree', word:'树', landmark:true, note:'Your own peach tree.',
    onLook:[{if:{myTree:2, carrying:'水'}, label:'Water', do:[{pour:'水'}, {set:{myTree:3}}, {message:'You water your little tree, and it drinks it all up. It’ll grow big and strong!'}]},
      {if:{season:3, fire:2, wrapped:0, grown:0}, label:'Wrap', do:[{kneel:'树'}, {set:{wrapped:1}}, {sound:'chime'}, {message:'You wrap straw round your little tree’s trunk, and tie it tight. Now the frost can’t hurt it!'}]},
      {if:{myTree:2}, do:[{message:'Your little peach tree is thirsty. Fill the bucket at the pool, and water it.'}]},
      {do:[{message:'Your own peach tree, which you planted in the spring.'}]}]},
  'û': {look:'myTreeWrapped', word:'树', landmark:true, note:'Your own peach tree, wrapped in straw for the winter.'},
  // winter: the brazier in the middle of the courtyard (bring wood from the pile you filled in autumn, and light a fire: 火);
  // a snowman, built with the pupils (雪人); and the New Year's Eve dinner, set out in front of the hall
  'B': {look:'brazier', landmark:true, becomes:[{if:{fire:2, season:3, grown:0}, to:'Ɓ'}],
    onLook:[{if:{fire:1, carrying:'木头'}, label:'Light it', do:[{light:{fire:2}}, {newWord:'火', note:'火 means fire. The flames leap up, and the pupils come running to warm their hands.'},
        {leap:'spyPupil', from:[9, 9]}, {leap:'darePupil', from:[12, 13]}, {leap:'pupil4', from:[20, 14]},
        {say:'treeCold', by:'senior'}, {message:'Your little peach tree is cold too. Wrap its trunk in straw against the frost: face it, and press A.'}]},
      {if:{fire:1}, do:[{message:'The brazier is empty. Bring wood from the woodpile, to light a fire.'}]},
      {do:[{message:'A bronze brazier, for a fire in winter.'}]}]},
  'Ɓ': {look:'brazierLit', word:'火', landmark:true, note:'The fire in the courtyard, keeping everyone warm.'},
  'N': {look:'mossStone', walk:true, becomes:[{if:{snowman:1, season:3, grown:0}, to:'Ň'}]},
  'Ň': {look:'snowman', word:'雪人', landmark:true, note:'The snowman you built with the pupils, in a red scarf.'},
  'E': {look:'paving', walk:true, becomes:[{if:{nyTable:1, season:3, grown:0}, to:'Ě'}]},
  'Ě': {look:'nyTable', landmark:true, onLook:[{do:[{message:'The New Year’s dinner: bowls of {米饭|rice}, and the fish you brought, for plenty in the year to come.'}]}]},
  'Y': {look:'rockDoor', word:'门', landmark:true, onLook:[
    // the master's year: once a season's jobs are done, evening comes; you go to bed here, and wake in the next season
    {if:{evening:1, season:0}, label:'Sleep', do:NEXT_SEASON(1, '夏天', '夏天 means summer. Hot, sunny days, and everything green.')},
    {if:{evening:1, season:1}, label:'Sleep', do:NEXT_SEASON(2, '秋天', '秋天 means autumn. The leaves are turning red and gold, and falling.')},
    {if:{evening:1, season:2}, label:'Sleep', do:NEXT_SEASON(3, '冬天', '冬天 means winter. Snow on the mountain, and cold!')},
    {if:{evening:1, season:3}, label:'Sleep', do:[{scene:'caveYears'}, {set:{grown:1, evening:0}}, {morning:true}, {goTo:'cave', at:[4, 4], facing:'down'}, {sound:'chime'},
      {message:'Seven years have gone by. The peach trees you watered are tall now, with fruit on them, and there are new little pupils.'}]},
    {if:{riddle:1}, label:'Wait for night', do:[{set:{riddle:2}}, {message:'You lie down in your room, but you don’t sleep. You wait, and wait…'},
      {goTo:'caveNight', at:[4, 4], facing:'down'}, {sound:'chime'}, {if:{knows:'晚上'}, message:'It’s the middle of the night: everyone is asleep. It’s the third watch.'},
      {if:{new:'晚上'}, newWord:'晚上', note:'晚上 means night, or evening. Everyone is asleep: it’s the third watch of the night.'}]},   // (晚上 you know from your first night, unless this game hasn't had one)
    {if:{teacher:0}, do:[{message:'A pupil’s room, cut into the rock: a stone bed, and a little window.'}]},   // (not yours till the master takes you as his pupil)
    {label:'Sleep', do:[{sleep:'You wake up in your room, with your health full.', room:true}]}]},   // your room: sleep there till morning, any time (js/daynight.js)
  'M': {look:'rockDoor', word:'门', landmark:true, onLook:[{do:[{message:'The master’s back door. It’s shut.'}]}]}
};
// By night: no-one about; the slanting moon shining in the pool (月亮), and three stars over the master's back door (星星),
// which is open for you, lamplight inside.
const CAVE_NIGHT = {
  'm': {look:'moonWater', word:'月亮', onLook:[{if:{new:'月亮'}, label:'Look', do:[{newWord:'月亮', note:'月亮 means the moon. A thin, slanting moon, shining in the pool.'}]}]},
  's': {look:'water', word:'水'},
  'l': {look:'leafPile', word:'叶子'},
  'L': {look:'stump', landmark:true, onLook:[{do:[{message:'The chopping block, in the moonlight.'}]}]},
  'Y': {look:'rockDoor', word:'门', landmark:true, onLook:[{do:[{message:'Not now! The master is waiting, at his back door beside the hall.'}]}]},
  'M': {look:'rockDoorOpen', word:'门', landmark:true, onLook:[{if:{new:'星星'}, label:'Look up', do:[{newWord:'星星',
    note:'星星 means stars. Over the master’s back door: a slanting moon, and three stars. Like the cave’s name: 斜月三星洞!'}]}]}
};
// The senior pupil's chores, fetched by their word (as the woodcutter's): in summer, three buckets of water from the pool;
// in autumn, four logs chopped with the axe; at the pool, or a chopping block, you choose how many first, and they're filled
// or chopped one after another, counted (decided 6 November 2026, after playing it: one at a time, it wasn't clear what to
// do). His thanks, and his next job, if he has one, there and then: you're talking to him already.
const FETCH_WATER = {fetch:'waterFetch', asks:[{word:'水', count:3, ask:'wantWater3'}], right:'rightThanks', wrong:'notRight', wrongNote:'That’s not what he asked for. Listen again!',
  listen:'He says it only in Chinese. Listen for how many he wants: fill them at the pool, all at once, and bring them to him.', done:[{coins:2, note:'The senior pupil gives you 2 🪙 for your help.'}, {goOn:true}]};
const FETCH_WOOD = {fetch:'axeFetch', asks:[{word:'木头', count:4, ask:'wantWood4'}], right:'rightThanks', wrong:'notRight', wrongNote:'That’s not what he asked for. Listen again!',
  listen:'He says it only in Chinese. Listen for how many he wants: chop them at a chopping block, all at once, and bring them to him.',
  done:[{say:'veryGood'}, {coins:3, note:'The senior pupil gives you 3 🪙 for your help.'}, {goOn:true}]};
// Chapter 2, home to Flower Fruit Mountain (decided 5 November 2026, from the plan and its mock-ups): twenty years on, the
// troop is hiding; a demon from the north, the Demon of Havoc (混世魔王, a name, never a word to catch), has carried off
// their little ones, and his little demons (妖怪) are in the long grass. Home's places are Flower Fruit Mountain's,
// borrowed as you left them (borrow, js/data.js): the school, garden, pen and hive all built, the feast held, each with
// ffm in front of its id there; with little demons in their long grass, and a few squares of their own (put).
const HOME_MAP = 'This is home: you know your way about here. Your map is of the lands across the sea.';
const AT_HOME = (id, own = {}) => ({borrow:id, from:1, wild:['demon'], noMap:HOME_MAP, ...own});
// The stone beds in the Water Curtain Cave, at home: sleep in one till morning (js/daynight.js), as you did there.
const HOME_BED = {look:'stoneBed', word:'床', landmark:true, note:'Beds of smooth stone, enough for the whole troop.',
  onLook:[{if:{knows:'床'}, label:'Sleep', do:[{sleep:'You wake up with your health full.'}]}]};
// The demon's mountain, far to the north (坎源山, a name): ashy ground, dry grass full of little demons, dead pines and a
// black pool; at the top, the cages, two torches and his cave's mouth (水脏洞), his guards in front of it, and over to the
// right, the little demons' cart, the troop's things piled on it, and the little demon guarding it (characters); your
// cloud at the foot of the path.
const LAIR_MAP = [
  "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
  "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
  "^^MMMMMMMMMMMMOOMMMMMMMMMMMM^^",
  "^^MMMMMMMMMMMMOOMMMMMMMMMMMM^^",
  "^^g.........T....T.........g^^",
  "^^g.か.き.く..................g^^",
  "^^g........................g^^",
  "^^g..け.こ...................g^^",
  "^^g........................g^^",
  "^^gDgggggggDgg..ggbggggggDgg^^",
  "^^gLLLLLLLgggg..gggggggggggg^^",
  "^^gLLLLLLLggbg..gggLLLLLLLgg^^",
  "^^gLLLLLLLgggg...ggLLLLLLLgg^^",
  "^^ggggggggggggg..DgLLLLLLLgg^^",
  "^^gggggggggggg...ggggggggggg^^",
  "^^DgggLLLLLLLg..ggggLLLLLggg^^",
  "^^ggggLLLLLLLg..ggggLLLLLggg^^",
  "^^ggggLLLLLLLg..gggggbgwwwDg^^",
  "^^ggbgggggggゆg..gggggggwwwgg^^",
  "^^gggggggggggg..gggggggggggg^^"
];
// The docker's boat at the harbour, with so many sacks on its deck (n): A, carrying a sack, puts it down there.
const ON_BOAT = n => ({look:'bigBoat', deck:n, word:'船', note:'A big boat with a sail, to cross the sea.',
  ...(n ? {} : {becomes:[4, 3, 2, 1].map(k => ({if:{cargoCarried:{atLeast:k}}, to:'①②③④'[k - 1]}))}),
  onLook:[{if:{cargo:1, lifted:'sack'}, label:'Put down', do:[{putDown:'sack'},
    {collect:'米', for:'cargo', count:4, note:'米 means rice, uncooked: grains of rice, in a sack. Cooked, it’s 米饭.', each:'You put the sack down on the {船|boat} ({cargoCarried}/4).', full:'Four sacks on the {船|boat}! Tell the docker.'}]}]});
// A cage, a little monkey locked in it (n: which, at x, y): 救命！ (an event as you come near), 笼子 as you look at it, and
// once you have the key (钥匙), opened with a question, the little monkey jumping out and hiding behind you.
const CAGE = (n, x, y) => ({look:'cage', word:'笼子', landmark:true, becomes:[{if:{['freed' + n]:1}, to:'がぎぐげご'[n - 1]}], onLook:[
  {if:{new:'救命'}, do:[{message:'A little monkey, locked in a wooden cage! It looks frightened.'}]},
  {if:{new:'笼子'}, label:'Look', do:[{newWord:'笼子', note:'笼子 means cage. A little monkey from the troop is locked inside!'}]},
  {if:{key:0}, do:[{message:'The cage is locked. Who has the key?'}]},
  {label:'Open', do:[{practise:1, label:'Opening the cage', pic:'钥匙'}, {unlock:'钥匙'}, {set:{['freed' + n]:1}}, {sound:'chime'}, {leap:'baby' + n, from:[x, y]},
    {say:'thanks', by:'baby' + n}, {message:'The little monkey jumps out, free! ({freed}/5)'}]}]});
const OPEN_CAGE = {look:'cageOpen', word:'笼子', landmark:true, onLook:[{do:[{message:'An empty cage, its door open.'}]}]};
const LAIR_LEGEND = {
  'g': {look:'ash', walk:true},
  '.': {look:'trampled', walk:true},
  'L': {look:'deadGrass', walk:true, word:'草', wild:['demon']},
  'D': {look:'ashPine', word:'树', note:'A dead pine, black and bare.'},
  'w': {look:'murk', word:'水', note:'A black pool. Nothing lives in it.'},
  // a boulder, out of the guard's sight: hide behind it, and change into a little demon (变, as the master taught you)
  'b': {look:'ashBoulder', word:'石头', onLook:[{if:{knows:'钥匙', key:0, form:null}, label:'Hide', do:[{message:'Out of the guard’s sight behind the boulder, you remember what the master taught you…'},
    {turnInto:1, word:'妖怪', keep:true, label:'变！ What will you change into, to fool the guard? Listen!'}, {message:'You look just like a little demon! Go and ask the guard for the key.'}]}]},
  'T': {look:'torch', word:'火', landmark:true, onLook:[{if:{new:'火'}, label:'Look', do:[{newWord:'火', note:'火 means fire. Torches, burning in front of the demon’s cave.'}]},
    {do:[{message:'A torch, burning.'}]}]},
  'O': {look:'demonDoor', landmark:true, action:'sign', sign:{name:{zh:'洞', py:'dòng', en:'Cave'}, says:{zh:'水脏洞', en:'Water-Belly Cave'}, hint:'The name of the Demon of Havoc’s cave.'}},
  'か': CAGE(1, 4, 5), 'き': CAGE(2, 6, 5), 'く': CAGE(3, 8, 5), 'け': CAGE(4, 5, 7), 'こ': CAGE(5, 7, 7),
  'が': OPEN_CAGE, 'ぎ': OPEN_CAGE, 'ぐ': OPEN_CAGE, 'げ': OPEN_CAGE, 'ご': OPEN_CAGE,
  // your cloud, to fly home on (but not with the cart: you pull that back to the little monkeys first)
  'ゆ': {look:'cloudAsh', landmark:true, onLook:[{if:{following:{cart:true}}, label:'Fly home', do:[{message:'The cart’s too heavy for your cloud! Pull it back to the little monkeys first.'}]},
    {if:{king:{below:2}}, label:'Fly home', do:[{message:'You leap onto your cloud, and somersault home.'}, {goTo:'ffmHomeGround', at:[13, 11], facing:'down'}]}]}
};
// At home: a bush the troop hides behind (the big monkey in the meadow, the hungry monkey at the home ground), sparkling
// till you look (its sparkle); the feast's tables, bare till the troop puts everything back; and your cloud, there once the
// old monkey sends you north.
const HIDING = (key, who, x, y, wait) => ({look:'bush', onLook:[{if:{...wait, [key]:0}, label:'Look', do:[{sound:'scuffle'}, {set:{[key]:1}}, {leap:who, from:[x, y]}, {talkTo:who}]},
  {do:[{message:'A bush.'}]}]});
// The feast's tables, everything on them gone (ROBBED), till the troop celebrates (party) and puts it all back (to: the
// letter of the table as it was); the big one and the second one fill again first, as you unload the cart onto them (the
// unload step: back, what each becomes as the troop's things go on it, one at a time; table, which it is).
const CART_THINGS = ['碗', '桃子', '苹果', '蜂蜜', '牛奶'];
const PUT_BACK = table => ({if:{homeAgain:1, party:0, any:CART_THINGS.map(w => ({lifted:w}))}, label:'Put down', do:[{unload:table}]});
const ROBBED = (look, to, back = [], table) => ({look, word:'桌子', landmark:true, note:'The feast’s table. Everything on it has gone!', becomes:[{if:{party:1}, to}, ...back],
  ...(table ? {onLook:[PUT_BACK(table)]} : {})});
const BACK_ON = (look, table) => ({look, word:'桌子', landmark:true, note:'The feast’s table, the troop’s things going back on it.', onLook:[PUT_BACK(table)]});
// Asking someone you've helped where the immortals are (神仙在哪里？, decided 5 November 2026, after playing it: the human
// world's purpose, said from the start): the first you ask teaches 哪里, the next 知道 (each waiting for a little practice,
// as a new word does). None of them knows (我不知道。), but they're your friend now (the befriend step: your Friends page,
// under People), and you're told who to try next (then). The last, the boatman, knows: across the sea.
const ASK = (key, helped, then) => [
  {if:{...helped, [key]:0, new:'哪里'}, do:[{say:'whereImmortals', by:'player', teach:'哪里'}, {newWord:'哪里', note:'哪里 means where. 神仙在哪里？ Where are the immortals?'},
    {say:'dontKnow'}, {set:{[key]:1}}, {befriend:true}, ...then]},
  {if:{...helped, [key]:0, new:'知道'}, do:[{say:'whereImmortals', by:'player'}, {say:'dontKnow', teach:'知道'}, {newWord:'知道', note:'知道 means to know. 我不知道。 I don’t know.'},
    {set:{[key]:1}}, {befriend:true}, ...then]},
  {if:{...helped, [key]:0}, do:[{say:'whereImmortals', by:'player'}, {say:'dontKnow'}, {set:{[key]:1}}, {befriend:true}, ...then]}
];
const VILLAGE_NEXT = [
  {if:{askedVillage:{below:3}}, message:'They don’t know, but they’re your friend now. Help the others in the village, and ask them too.'},
  {if:{askedVillage:3}, message:'Nobody in the village knows where the immortals are. Maybe someone further east does: the road east is open now, through the fields.'}];
const TOWN_NEXT = [{if:{askedTown:{below:3}}, message:'They don’t know, but they’re your friend now. Help the others in the town, and ask them too.'}];   // (the last: the years go by)
const ACROSS_THE_SEA = {
  number: 2,
  name: {zh:'海的那边', py:'hǎi de nàbiān', en:'Across the sea'},
  // Softer, older colours in the human world (decided 6 November 2026, from the art proposal): greens toward olive and
  // jade, whites a little warmer, like paper; not in the places borrowed from Flower Fruit Mountain, a fairy mountain,
  // bright as it always was.
  colours: 'soft',

  // Where your raft washes up, on the shore, and which way you face.
  start: {x:11, y:16, facing:'up'},

  // What happens as you arrive (sailing in on your raft: the sail step at the end of Area 1): the raft drifts for days,
  // and washes up on a sandy shore, where fishermen are mending their nets. They've never seen a monkey: they shout and
  // run off into their hut, and the old one drops his coat as he goes. (人, the first people you've seen, as you see them.)
  begin: LANDING,

  chapters: [
    {name:'Prologue', title:'The human world'},
    {name:'Chapter 1', title:'The teacher’s mountain'},
    {name:'Chapter 2', title:'The Demon of Havoc'}
  ],

  // The journey's goal, and the story's parts within each chapter (decided 5 November 2026, after playing it: the human
  // world felt aimless, and never said why you were there), at the top of the Tasks page: a part's title card as it
  // begins (when: the furthest you've reached; card:false, one that begins with its chapter's card), what it's about
  // (text), and what you're doing in it (now). Checklist items with a part show only while you're in it.
  goal: [{if:{chapter:0, toldSea:0}, text:'Find someone who knows where the immortals live: an immortal can teach you never to grow old.'},
    {if:{door:{below:2}}, text:'Find an immortal who can teach you never to grow old.'}, {if:{sentHome:0}, text:'Learn all you can from the immortal.'},
    {if:{king:{below:2}}, text:'Save the troop’s little monkeys from the Demon of Havoc.'},
    {text:'A real weapon for a king: the Dragon King’s palace, under the sea (still to come).'}],
  parts: [
    {id:'dress', chapter:0, name:'Part 1', title:'Dressing like a person', when:{landed:1},
      text:'You’ve crossed the sea to find an immortal, who can teach you never to grow old. But the people here run from a monkey! First, find something to wear.',
      now:'People run from a monkey: find something to wear.'},
    {id:'talk', chapter:0, name:'Part 2', title:'Learning to talk', when:{dressed:2},
      text:'Dressed like a person, you can go among people. Up the path is a village: learn to talk like the villagers, help them, and ask them where the immortals are.',
      now:[{if:{child:{below:3}}, text:'Go up to the village, and meet the people there.'}, {text:'Help the villagers, and ask them where the immortals are ({askedVillage} of 3).'}]},
    {id:'road', chapter:0, name:'Part 3', title:'The road east', when:{askedVillage:3},
      text:'Nobody in the village knows where the immortals are. Maybe someone further east does: the road goes east, through the fields, to a town.',
      now:'Follow the road east, through the fields, to the town. Help the farmer on the way, and ask him too.'},
    {id:'town', chapter:0, name:'Part 4', title:'The market town', when:{exchanged:1},
      text:'A busy market town, full of people. Help them, and ask them where the immortals are: someone here must know!',
      now:'Help the people of the town, and ask them where the immortals are ({askedTown} of 3).'},
    {id:'west', chapter:0, name:'Part 5', title:'Across the western sea', when:{years:1},
      text:'Years go by, and nobody in the town knows. But at the harbour, boats sail all over the sea: maybe someone there knows…',
      now:[{if:{toldSea:0}, text:'Ask at the harbour: someone there must know.'}, {if:{boat:{below:2}}, text:'Sail west across the sea, with the boatman.'}, {text:'Find out where the immortal lives.'}]},
    {id:'climb', chapter:1, name:'Part 1', title:'The climb', when:{chapter:1}, card:false,
      now:'Climb the mountain, to the immortal’s cave.'},
    {id:'spring', chapter:1, name:'Part 2', title:'Spring', when:{door:2},
      text:'The immortal is waiting for you, in his cave. You’ll live here a whole year, and he’s a great teacher: learn all you can!',
      now:'Learn from the master, and help in the cave.'},
    {id:'summer', chapter:1, name:'Part 3', title:'Summer', when:{season:1},
      text:'Summer in the cave: long, hot days, and everything green.',
      now:'Help in the cave through the summer.'},
    {id:'autumn', chapter:1, name:'Part 4', title:'Autumn', when:{season:2},
      text:'Autumn: the leaves are turning red and gold, and falling.',
      now:'Get the cave ready for the winter.'},
    {id:'winter', chapter:1, name:'Part 5', title:'Winter', when:{season:3},
      text:'Winter: snow on the mountain, and cold in the cave. Nothing grows now, and the stores are getting low.',
      now:[{if:{trip:{atLeast:1, below:4}}, text:'Fetch rice and fish from the fishing village, across the sea.'}, {if:{trip:{below:1}}, text:'Keep warm, and help in the cave.'}, {text:'The last days of the year.'}]},
    {id:'secret', chapter:1, name:'Part 6', title:'The master’s secret', when:{grown:1},
      text:'Seven years have gone by. You’ve learned a lot, but not yet what you came for: how never to grow old…',
      now:'Find out what the master’s riddle means.'},
    {id:'change', chapter:1, name:'Part 7', title:'Changing into things', when:{riddle:3},
      text:'The master has told you his secret, at night. Now learn to change into things, and to fly!',
      now:'Learn to change into things, and to fly.'},
    {id:'home', chapter:1, name:'Part 8', title:'Showing off', when:{pine:1},
      text:'Showing off to the pupils has made the master angry…',
      now:[{if:{sentHome:0}, text:'The master wants to see you.'}, {text:'That’s the end of chapter 1.'}]},
    {id:'homeAgain', chapter:2, name:'Part 1', title:'Home again', when:{chapter:2}, card:false,
      now:'Home, after twenty years. Find the troop: they’re hiding.'},
    {id:'demons', chapter:2, name:'Part 2', title:'The little demons', when:{news:1},
      text:'A demon from the north, the Demon of Havoc, has carried off the troop’s little ones. Some of his little demons are still here…',
      now:'Chase the little demons off the home ground ({demonsChased} of 3).'},
    {id:'lair', chapter:2, name:'Part 3', title:'The demon’s mountain', when:{north:1},
      text:'Far to the north: the Demon of Havoc’s mountain. The troop’s little ones are here somewhere!',
      now:[{if:{freed:{below:5}}, text:'Find the little monkeys, and set them free ({freed} of 5).'}, {if:{cartWon:0}, text:'The troop’s things are on a {车|cart}: beat the little {妖怪|demon} guarding it.'},
        {text:'Pull the {车|cart} back to the little monkeys.'}]},
    {id:'king', chapter:2, name:'Part 4', title:'The Demon of Havoc', when:{loot:{atLeast:1}},
      text:'The little demons have run into the cave, shouting. Out comes their master…',
      now:'Beat the Demon of Havoc.'},
    {id:'home2', chapter:2, name:'Part 5', title:'Home', when:{king:2},
      text:'The Demon of Havoc has run off for good. Take the little monkeys home!',
      now:[{if:{party:0}, text:'Home with the little monkeys and the {车|cart}: put the troop’s things back on the feast’s {桌子|tables}.'}, {if:{ch2:0}, text:'Home with the little monkeys: celebrate with the troop.'},
        {text:'That’s the end of Area 2.'}]}
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
  //   song     1 once you've heard the woodcutter's song (歌): the end of the prologue, and chapter 1 begins
  //   woodFetch chapter 1: the woodcutter's fetching game at his hut: 0 not yet, 1 to 3 what he's asking for, 4 all brought
  //   sky      1 once you've seen the sky (天) over the stone pillars
  //   door     1 once the boy has opened the cave's stone door, 2 once he's asked who you are
  //   caveSeen 1 once you've been into the cave; teacher 1 once the master has said he's your master (师父); named 1 once
  //            he's named you 孙悟空 (名字); spyGame the games of I spy you've finished with the pupil
  //   the master's year (season, evening: above): waterFetch, the senior pupil's buckets of water in summer (as the
  //            woodcutter's fetching game: 1 asked, 2 brought); sweep, the leaves in autumn (1 sweeping, 2 swept); axeFetch,
  //            his wood in autumn; newYear 1 once the year's last day is done
  //   grown    1 once seven years have gone by (the saplings grown, new little pupils); lecture 1 once you've heard the
  //            master's lecture, after them
  //   riddle   1 the master's taps on your head (头), 2 the night (晚上), at his back door, 3 he's taught you to change (变)
  //   tests    1 once he's tested your changes; fly 1 once he's taught you the cloud somersault (飞), and you can fly by
  //            cloud from the map; pine 1 once you've shown off as a pine tree (松树); sentHome 1 once he's sent you home
  // chapter 2, home:
  //   home2    1 once you've landed by your stone; foundBig, foundHungry 1 once you've found them hiding behind their bush
  //   news     1 once the old monkey has told you about the Demon of Havoc; d1 d2 d3 1 once you've chased off each
  //            little demon on the home ground; north 1 once the old monkey has sent you north, on your cloud
  //   lairSeen 1 once you've been to the demon's mountain; key 1 once the guard has given you the cages' key (you, as a
  //            little demon); freed1 to freed5 1 once you've let each little monkey out of its cage; cartWon 1 once you've
  //            beaten the little demon guarding the cart of the troop's things; loot 1 once you've pulled the cart back
  //            to the little monkeys; king 1 once he's come out, 2 once you've beaten him
  //   homeAgain 1 once a wind has carried you home with the little monkeys and the cart; unload which of the troop's things
  //            the hungry monkey wants off the cart (the unloading: 1 to 5, then 6 once they're all on the feast's
  //            tables); party 1 once the troop has celebrated; stickGiven 1 once
  //            you've given your stick to a little monkey in training; ch2 1 once the old monkey has told you of the
  //            Dragon King (the end of Area 2)
  // the prologue's asking: askChild askFisher askVillager askFarmer askGranny askTea askTeller askDocker 1 once you've asked each
  // where the immortals are (none knows); toldSea 1 once the boatman has told you: across the sea
  // The master's year (chapter 1, decided 7 November 2026): while it runs, the places are in its season (js/seasons.js),
  // kept in season (0 spring, 1 summer, 2 autumn, 3 winter); evening: 1 once a season's last task is done, till you go to
  // bed and wake in the next.
  seasons: {key:'season', if:{chapter:1, grown:0}, evening:{evening:1}, home:{if:{chapter:2}, season:'autumn'}},   // (home: Flower Fruit Mountain in chapter 2, in autumn, decided 7 November 2026, so it feels different from Area 1)
  // The day going round (js/daynight.js, decided 7 November 2026, the owner's idea): a day of about 20 minutes on the map,
  // then night. At night the human world's streets are quieter: people go home (stay: those who stay up all the same, such
  // as the night market's stallholders, the teahouse, the fishermen and the boatman), and so do the master and his pupils;
  // back home on Flower Fruit Mountain, once everything's back on the feast's tables, the troop sleeps in the Water Curtain
  // Cave again (till then they're hiding, and stay up). Anyone you have something to do with stays up. morning: what
  // you're told as you wake, after sleeping (in your room at the master's cave, or a stone bed at home).
  dayNight: {if:{}, morning:'Good morning! You wake up with your health full.',
    sleep:[{who:'monkeys', if:{party:1}, place:'ffmCave', at:[[3, 1, 'bed'], [5, 1, 'bed'], [10, 1, 'bed'], [12, 1, 'bed'],
      [1, 4, 'right'], [14, 4, 'left'], [2, 8, 'right'], [13, 8, 'left'], [1, 11, 'right'], [14, 11, 'left'], [3, 10, 'right'], [12, 10, 'left'], [10, 12, 'left'], [4, 12, 'right']]},
      {who:'people', stay:['fisher1', 'fisherman', 'villager', 'fruitSeller', 'bunSeller', 'teaKeeper', 'walker1', 'porter', 'changer', 'peddler', 'traveller2', 'angler', 'boatman', 'docker']}]},
  // Unloading the cart at home, back from the demon's mountain (the unload step, js/world.js; decided 7 November 2026): the
  // hungry monkey wants each of the troop's things off it, one at a time, only in Chinese, to go back on its table, the big
  // one, or the second for the milk; once they're all back, the troop puts everything else back too, and celebrates.
  unloading: {key:'unload', by:'hungry', cart:'cart', over:{party:1},
    asks:[{word:'碗', ask:'wantBowls', on:'big'}, {word:'桃子', ask:'wantPeach', on:'big'}, {word:'苹果', ask:'wantApple', on:'big'}, {word:'蜂蜜', ask:'wantHoney', on:'big'}, {word:'牛奶', ask:'wantMilk', on:'milk'}],
    right:'rightThanks', wrong:'notRight', take:'What does she want? Take it off the cart.',
    listen:'She says it only in Chinese. Take it off the cart: press A at the cart.',
    carry:'You’re carrying the {item}. Put it down on its table.', otherTable:'Not on this table: it goes on the other one.',
    done:[{setUp:{party:1}}, {sound:'fanfare'}, {message:'Everything’s back on the feast’s tables! The troop brings out the rest, and everyone celebrates: your friends come too.'}, {scene:'party'}, {say:'veryHappy', by:'elder'}]},
  // What people with nothing much to say talk about (their last few words, js/world.js): the weather, as the seasons go
  // round in the master's year (decided 7 November 2026, the owner's idea).
  smallTalk: [
    {if:{raining:'heavy'}, monkeys:true, say:'rainTooHeavy'},   // (rain, now and then, light or heavy, and night, as the day goes round:
    {if:{raining:true}, monkeys:true, say:'raining'},           // js/daynight.js; the troop too, at home)
    {if:{night:true}, say:'goodEvening'},
    {if:{chapter:1, grown:0, season:0, place:'cave'}, say:'springHere'},
    {if:{chapter:1, grown:0, season:1}, say:'hotToday'},
    {if:{chapter:1, grown:0, season:2}, say:'manyLeaves'},
    {if:{chapter:1, grown:0, season:3}, say:'coldToday'}
  ],
  progress: {season:0, evening:0, askChild:0, askFisher:0, askVillager:0, askFarmer:0, askGranny:0, askTea:0, askTeller:0, askDocker:0, toldSea:0, home2:0, foundBig:0, foundHungry:0, news:0, d1:0, d2:0, d3:0, north:0, lairSeen:0, key:0, freed1:0, freed2:0, freed3:0, freed4:0, freed5:0, cartWon:0, loot:0, king:0, homeAgain:0, unload:0, party:0, stickGiven:0, ch2:0,
    chapter:0, woodFetch:0, sky:0, door:0, caveSeen:0, teacher:0, named:0, spyGame:0, class1:0, drill:0, myTree:0, trainGame:0, class2:0, spar1:0, herbs:0, wrote:0, class3:0, fire:0, wrapped:0, class4:0, snowman:0, nyTable:0, trip:0, bigMatch:0, snowCave:0, snowTown:0, snowFields:0, snowVillage:0, sweep:0, waterFetch:0, axeFetch:0, newYear:0, grown:0, lecture:0, riddle:0, tests:0, fly:0, pine:0, sentHome:0, landed:0, dressed:0, back:0, oldFisher:0, child:0, knock:0, farmer:0, dogStop:0, exchanged:0, years:0, boat:0, song:0, stepsTop:0, cargo:0, hen1:0, hen2:0, hen3:0, hen4:0, hensDone:0, planter:0},

  // Numbers that text can show as {name}, and that an if can check (as Flower Fruit Mountain's).
  counters: {
    // the village's words, which the road east waits for (the shore's net and boat too)
    villageWords: {count:'known', words:['不', '是', '什么', '井', '房子', '门', '谁', '鸡', '米饭', '钱', '网', '船'],
      called:{'井':'the well', '房子':'a house', '门':'the gate in the white wall', '网':'the fishermen’s nets', '船':'their boats', '鸡':'a chicken', '谁':'who’s at the gate', '米饭':'the granny’s rice', '钱':'money'}},
    askedWords: {count:'known', words:['井', '房子', '门', '网', '船']},   // the things you ask people about in the village and on the shore
    birdsShooed: {count:'shooed'},   // the birds you've shooed off the farmer's rice
    pierCaught: {count:'picked', request:'pierFish'},   // fish caught for the fishermen's basket (three)
    hensBack: {count:'flags', keys:['hen1', 'hen2', 'hen3', 'hen4']},   // the hens you've carried back to their yard
    cargoCarried: {count:'picked', request:'cargo'},   // the sacks you've carried onto the boat at the harbour (four)
    // the town's words, which the years passing wait for
    townWords: {count:'known', words:['多少钱', '包子', '鞋', '茶', '说', '听', '孩子', '学', '书', '猫']},   // (多少钱 since 9 November 2026: 买 is the 老板's, on Flower Fruit Mountain)
    // who you've asked where the immortals are: everyone (8), the village's three and the town's three
    asked: {count:'flags', keys:['askChild', 'askFisher', 'askVillager', 'askFarmer', 'askGranny', 'askTea', 'askTeller', 'askDocker']},
    askedVillage: {count:'flags', keys:['askChild', 'askFisher', 'askVillager']},
    askedTown: {count:'flags', keys:['askGranny', 'askTea', 'askTeller']},
    coins: {count:'coins'},
    leavesSwept: {count:'picked', request:'sweep'},
    herbsFound: {count:'picked', request:'herbs'},   // the lingzhi you've picked among the stone pillars, for the master's medicine (three)   // the heaps of leaves you've swept up in the cave (five)
    demonsChased: {count:'flags', keys:['d1', 'd2', 'd3']},   // chapter 2: the little demons chased off the home ground
    freed: {count:'flags', keys:['freed1', 'freed2', 'freed3', 'freed4', 'freed5']}   // the little monkeys let out of their cages
  },

  // The town's teacher, after any new word, waits till you've answered this many more questions, anywhere, before he
  // teaches the next (waits), offering a quick word game first (as the school's teacher on Flower Fruit Mountain does, where
  // it's 4). Only the teacher waits now (decided 7 November 2026, after playing it: everywhere else it made the story too
  // slow, and was out of place, such as when the master was angry with you).
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
  // Changing into things (变, the turnInto step, chapter 1): what the master can ask you to change into, those you know.
  changes: ['鸟', '鱼', '树', '石头', '猫', '狗', '鸡', '鹅', '鹤', '兔子', '羊', '牛', '花', '桃子', '苹果', '船', '房子', '松树', '妖怪'],
  // Flying by cloud (the cloud somersault, chapter 1): from your map, to any place you've been, once you can (has).
  cloudTravel: {has:{fly:1}, note:'You leap onto a cloud, and somersault away!'},
  // The child's game, 是不是？ (Is it?): a picture of something you know and 这是…吗？ about it, the word one of these
  // (only those you know, with pictures), and you answer 是 or 不是.
  isIt: ['猴子', '鱼', '鸟', '树', '花', '山', '石头', '桃子', '苹果', '水', '河', '草', '人', '鹅', '鸡', '狗', '猫', '牛', '羊', '兔子',
    '房子', '井', '门', '船', '网', '衣服', '帽子', '书', '茶', '包子', '鞋', '海', '米饭'],

  tasks: [
    {id:'seal', if:{sealsWaiting:true, chapter:1}, text:'A page of your scroll is full: show it to your {师父|master}', arrow:'master'},   // (the old monkey's scroll: js/scrolls.js)
    {id:'sealHome', if:{sealsWaiting:true, chapter:2}, text:'A page of your scroll is full: show it to the {老|old} monkey', arrow:'elder'},
    {id:'a2coat', main:true, if:{landed:1, dressed:0}, text:'The {老|old} man dropped something on the sand as he ran: go and find it', arrow:[23, 10]},
    {id:'a2goose', if:{landed:1, friends:{goose:false}}, text:'Make {朋友|friends} with the goose on the sand', arrow:[8, 12]},
    {id:'a2hat', main:true, if:{dressed:1}, text:'Something else is blowing along the sand: pick it up too', arrow:[30, 13]},
    {id:'a2pier', if:{pierFish:'asked', holding:{pierFish:false}}, text:'Catch three {鱼|fish} for the fishermen: fish off the pier with your {鱼竿} ({pierCaught}/3)', arrow:[18, 20]},
    {id:'a2pierBack', if:{pierFish:'asked', holding:{pierFish:true}}, text:'Take the {鱼|fish} to the fisherman on the pier', arrow:'fisher1'},
    {id:'a2village', main:true, if:{dressed:2, child:0}, text:'Go up the {路|path} to the village', arrow:'child'},
    {id:'a2child', main:true, if:{child:{atLeast:1, below:3}}, text:'The {孩子|child} in the village wants to play again', arrow:'child'},
    {id:'a2ask', if:{child:3, askedWords:{below:5}}, text:'Ask {人|people} about things ({askedWords}/5): face something that sparkles ✨ with someone near, and press A. Still to find: {left:askedWords}.', arrow:{sparkle:true}},
    {id:'a2knock', if:{knows:'门', knock:0}, text:'Knock on the {门} in the white wall', arrow:[31, 4, 'village']},
    {id:'a2fishAsk', if:{fish:'asked', holding:{fish:false}}, text:'Catch a {鱼} for the fisherman: face the sea or the stream with your {鱼竿}, and press A', where:'The sea, or the village’s stream'},
    {id:'a2fishBack', if:{fish:'asked', holding:{fish:true}}, text:'Take the {鱼} to the fisherman in the village', arrow:'fisherman'},
    {id:'a2chicken', if:{child:3, friends:{chicken:false}}, text:'Make {朋友|friends} with the chicken in the yard', arrow:[6, 16, 'village']},
    {id:'a2hens', if:{knows:'鸡', hensBack:{below:4}}, text:'The hens are out of their yard! Catch them, and carry them back ({hensBack}/4)',
      arrow:{nearest:[{who:'hen1', if:{hen1:0}}, {who:'hen2', if:{hen2:0}}, {who:'hen3', if:{hen3:0}}, {who:'hen4', if:{hen4:0}}]}},   // (the nearest one still loose),
    {id:'a2hide', if:{hiding:true}, text:'Find the {孩子|child}: they’re hiding somewhere in the village', clue:true, where:'village'},   // (its clue under it, to hear again; no arrow: that's the game)
    {id:'a2askVillage', main:true, if:{child:3, askedVillage:{below:3}}, text:'Help the people of the village, and ask them {哪里|where} the immortals are ({askedVillage}/3)', where:'village'},
    {id:'a2askChild', main:true, if:{child:3, askChild:0}, text:'Ask the {孩子|child} where the immortals are', arrow:'child'},
    {id:'a2askFisher', main:true, if:{fish:'done', askFisher:0}, text:'Ask the fisherman {哪里|where} the immortals are', arrow:'fisherman'},
    {id:'a2askVillager', main:true, if:{hensDone:1, askVillager:0}, text:'Ask the villager by the hens’ yard {哪里|where} the immortals are', arrow:'villager'},
    {id:'a2villageWords', if:{child:3, villageWords:{below:12}}, text:'Learn to {说|talk} like the villagers: learn the village’s words ({villageWords}/12). Still to find: {left:villageWords}', where:'The village and the shore'},
    {id:'a2east', main:true, if:{askedVillage:3, farmer:0}, text:'Follow the {路|road} east, to the fields', arrow:'farmer'},
    {id:'a2birds', main:true, if:{farmer:1, birdsShooed:{below:5}}, text:'Shoo the {鸟|birds} off the farmer’s rice ({birdsShooed}/5)', where:'fields'},
    {id:'a2birdsDone', main:true, if:{farmer:{atLeast:1}, birdsShooed:{atLeast:5}, lunch:'not asked'}, text:'The {鸟|birds} have gone: go back to the farmer', arrow:'farmer'},   // (decided 6 November 2026: with the birds gone, nothing said what next)
    {id:'a2lunch', main:true, if:{lunch:'asked', holding:{lunch:false}}, text:'The farmer is hungry: ask the granny by the well for some {米饭|rice} for him', arrow:'granny'},
    {id:'a2lunchBack', main:true, if:{lunch:'asked', holding:{lunch:true}}, text:'Take the {米饭|rice} to the farmer in the fields', arrow:'farmer'},
    {id:'a2dog', main:true, if:{farmer:{atLeast:1}, friends:{dog:false}}, text:'Make {朋友|friends} with the dog by the road', arrow:[36, 9, 'fields']},
    {id:'a2askFarmer', main:true, if:{lunch:'done', askFarmer:0}, text:'Ask the farmer {哪里|where} the immortals are', arrow:'farmer'},
    {id:'a2town', main:true, if:{lunch:'done', friends:{dog:true}, askFarmer:1, exchanged:0}, text:'Follow the {路|road} east, to the town', arrow:'changer'},
    {id:'a2change', main:true, if:{exchanged:0, place:'town'}, text:'Change your {钱|money}: talk to the money changer at the market', arrow:'changer'},
    {id:'a2askTown', main:true, if:{exchanged:1, askedTown:{below:3}}, text:'Help the people of the town, and ask them {哪里|where} the immortals are ({askedTown}/3)', where:'town'},
    {id:'a2askGranny', main:true, if:{grannyPeach:'done', askGranny:0}, text:'Ask the granny in the town {哪里|where} the immortals are', arrow:'granny2'},
    {id:'a2askTea', main:true, if:{knows:'茶', askTea:0}, text:'Ask the teahouse keeper {哪里|where} the immortals are', arrow:'teaKeeper'},
    {id:'a2askTeller', main:true, if:{knows:'说', askTeller:0}, text:'Ask the storyteller {哪里|where} the immortals are', arrow:'teller'},
    {id:'a2townWords', if:{exchanged:1, townWords:{below:10}}, text:'Learn to {说|talk} like the townspeople: find someone with a ! over them ({townWords}/10)', where:'town'},
    {id:'a2granny', if:{grannyBuns:'asked', inBag:{'包子':false}}, text:'Buy a {包子} at the market for the granny', where:'town'},
    {id:'a2grannyApple', if:{grannyApple:'asked', inBag:{'苹果':false}}, text:'Buy an {苹果} at the market for the granny', where:'town'},
    {id:'a2grannyPeach', if:{grannyPeach:'asked', inBag:{'桃子':false}}, text:'Buy a {桃子} at the market for the granny', where:'town'},
    {id:'a2grannyBack', if:{any:[{grannyBuns:'asked', inBag:{'包子':true}}, {grannyApple:'asked', inBag:{'苹果':true}}, {grannyPeach:'asked', inBag:{'桃子':true}}]}, text:'Take it to the granny in the town', arrow:'granny2'},
    {id:'a2cargo', main:true, if:{cargo:1, cargoCarried:{below:4}, lifted:false}, text:'Carry four sacks onto the {船|boat} for the docker ({cargoCarried}/4)', where:'harbour', arrow:{sparkle:true}},
    {id:'a2cargoBoat', main:true, if:{cargo:1, lifted:'sack'}, text:'Carry the sack down the pier, and put it on the {船|boat} ({cargoCarried}/4)', arrow:[18, 15, 'harbour']},
    {id:'a2cargoBack', main:true, if:{cargo:1, cargoCarried:4}, text:'Tell the docker the sacks are on the {船|boat}', arrow:'docker'},
    {id:'a2cat', if:{exchanged:1, friends:{cat:false}}, text:'Make {朋友|friends} with the cat in the market', arrow:[33, 8, 'town']},
    {id:'a2harbour', main:true, if:{years:1, cargo:0}, text:'Cross the {桥|bridge} to the harbour: maybe someone there knows', arrow:'docker'},
    {id:'a2askDocker', main:true, if:{cargo:2, askDocker:0}, text:'Ask the docker {哪里|where} the immortals are', arrow:'docker'},
    {id:'a2askAll', main:true, if:{askDocker:1, asked:{below:8}}, text:'Ask everyone on your list {哪里|where} the immortals are ({asked}/8): tap the faces on your Tasks page to see who’s left'},
    {id:'a2askBoatman', main:true, if:{asked:8, toldSea:0}, text:'Ask the boatman {哪里|where} the immortals are: the boatman has sailed all over the sea', arrow:'boatman'},
    {id:'a2sail', main:true, if:{toldSea:1, boat:0}, text:'Ask the boatman to take you across the {海|sea}', arrow:'boatman'},   // (decided 6 November 2026: after his news, nothing said what next)
    {id:'a2wind', main:true, if:{boat:1}, text:'Wait for the {风|wind}: practise a little, then go back to the boatman', arrow:'boatman'},
    {id:'a2woodcutter', main:true, if:{boat:2, song:0}, text:'Someone is singing among the {树|trees}. Go and find them', arrow:'woodcutter'},
    // chapter 1: up the mountain
    {id:'c1hut', if:{chapter:1, woodFetch:0}, text:'The woodcutter has gone back to his {家|home}, up the steps. Find out if he needs help', arrow:'woodcutter'},
    {id:'c1fetch', if:{woodFetch:{atLeast:1, below:4}}, text:'Bring the woodcutter {什么|what} he asks for, as many as he asks for: it’s by his hut. Talk to him again to {听|listen} again', arrow:'woodcutter'},
    {id:'c1up', main:true, if:{chapter:1, door:0, away:['cliffRoad', 'pillars']}, text:'Climb the {山|mountain}, to find where the immortal lives', arrow:{place:'cliffRoad'}},
    {id:'c1cliff', main:true, if:{chapter:1, door:0, place:'cliffRoad'}, text:'Climb the walkway up the cliff. Gusts of {风|wind} blow across it: wait for one to drop, then cross the windy planks quickly', arrow:{place:'pillars'}},
    {id:'c1crane', if:{chapter:1, place:'cliffRoad', friends:{crane:false}}, text:'Make {朋友|friends} with the {鹤} by the pool', arrow:[14, 12, 'cliffRoad']},
    {id:'c1door', main:true, if:{chapter:1, door:0, place:'pillars'}, text:'Find the immortal’s {洞|cave}, up at the top', arrow:[15, 6, 'pillars']},
    // in the cave
    {id:'c1in', main:true, if:{door:2, teacher:0}, text:'Go in through the stone {门|door}, and find the old man in front of the hall', arrow:'master'},
    {id:'c1name', main:true, if:{teacher:1, named:0}, text:'Your {师父|master} has something to ask you', arrow:'master'},
    {id:'c1spy', if:{named:1, spyGame:0}, text:'A pupil wants to play I spy: {听|listen}, then find what she sees, and press A at it', arrow:'spyPupil'},
    // the master's year: each season's jobs, then bed
    {id:'c1class1', main:true, if:{named:1, class1:0}, text:'The {师父|master}’s first class is about to begin', arrow:'master'},
    {id:'c1drill', main:true, if:{class1:1, drill:0}, text:'Morning training! The senior pupil is waiting for you', arrow:'senior'},
    {id:'c1plant', main:true, if:{myTree:1}, text:'Plant your little peach {树|tree} in the garden, where the ground sparkles ✨: face it, and press A', arrow:[5, 11, 'cave']},
    {id:'c1fill', main:true, if:{myTree:2, carrying:false}, text:'Your little {树|tree} is thirsty: fill your {桶|bucket} at the pool', arrow:[21, 6, 'cave']},
    {id:'c1pour', main:true, if:{myTree:2, carrying:'水'}, text:'Water your little peach {树|tree}: face it, and press A', arrow:[5, 11, 'cave']},
    {id:'c1train', if:{named:1, grown:0, trainGame:{below:2}, season:{below:3}}, text:'A pupil wants to train with you: a quick word game', arrow:'pupil4'},
    {id:'c1water', main:true, if:{season:1, waterFetch:0, evening:0}, text:'It’s a hot {夏天|summer}’s day. The senior pupil has a job for you', arrow:'senior'},
    {id:'c1class2', main:true, if:{season:1, waterFetch:2, class2:0}, text:'The {师父|master}’s summer class is about to begin', arrow:'master'},
    {id:'c1spar', main:true, if:{season:1, class2:1, spar1:0}, text:'A pupil wants a friendly match with you', arrow:'darePupil'},
    {id:'c1herbsAsk', main:true, if:{season:1, spar1:1, herbs:0}, text:'The {师父|master} needs your help with something', arrow:'master'},
    {id:'c1herbs', main:true, if:{herbs:1, herbsFound:{below:3}, away:'pillars'}, text:'Find three lingzhi for the {师父|master}’s medicine: they grow among the stone pillars, outside the cave ({herbsFound}/3)', arrow:{place:'pillars'}},
    {id:'c1herbsHere', main:true, if:{herbs:1, herbsFound:{below:3}, place:'pillars'}, text:'Find three lingzhi on the {山|mountain}’s rocks: they sparkle ✨ ({herbsFound}/3)', arrow:{sparkle:true}},
    {id:'c1herbsBack', main:true, if:{herbs:1, herbsFound:{atLeast:3}}, text:'Take the lingzhi to the {师父|master}', arrow:'master'},
    {id:'c1leaf', main:true, if:{season:1, evening:1, new:'叶子'}, text:'A yellow {叶子|leaf} has drifted down by your room: face it, and press A', arrow:[5, 4, 'cave']},
    {id:'c1write', main:true, if:{season:2, axeFetch:2, wrote:0}, text:'The senior pupil has one more thing to teach you', arrow:'senior'},
    {id:'c1class3', main:true, if:{season:2, wrote:1, class3:0}, text:'The {师父|master}’s autumn class is about to begin', arrow:'master'},
    {id:'c1snow', main:true, if:{season:2, evening:1, new:'雪'}, text:'The first {雪|snow} is settling by your room: face it, and press A', arrow:[5, 4, 'cave']},
    {id:'c1leaves', main:true, if:{season:2, sweep:0, evening:0}, text:'It’s {秋天|autumn}. The senior pupil has jobs for you', arrow:'senior'},
    {id:'c1sweep', main:true, if:{sweep:1, leavesSwept:{below:5}}, text:'{扫|Sweep} up the five heaps of fallen {叶子|leaves}: face one, and press A ({leavesSwept}/5)', arrow:{sparkle:true}},
    {id:'c1swept', main:true, if:{sweep:1, leavesSwept:5}, text:'Tell the senior pupil the {叶子|leaves} are swept up', arrow:'senior'},
    {id:'c1chore', main:true, if:{any:[{waterFetch:1}, {axeFetch:1}]}, text:'Bring the senior pupil {什么|what} he asks for. Talk to him again to {听|listen} again', arrow:'senior'},
    {id:'c1axe', main:true, if:{sweep:2, axeFetch:0}, text:'The senior pupil has one more job for you before {冬天|winter}', arrow:'senior'},
    {id:'c1fire', main:true, if:{season:3, fire:0, evening:0, grown:0}, text:'It’s {冬天|winter}, and cold! The senior pupil has a job for you', arrow:'senior'},
    {id:'c1wood', main:true, if:{fire:1, carrying:false}, text:'Take {木头|wood} from the woodpile, for the fire', arrow:[21, 10, 'cave']},
    {id:'c1light', main:true, if:{fire:1, carrying:'木头'}, text:'Light a {火|fire} in the brazier, in the middle of the courtyard: face it, and press A', arrow:[14, 11, 'cave']},
    {id:'c1wrap', main:true, if:{season:3, fire:2, wrapped:0, grown:0}, text:'Your little {树|tree} is cold: wrap its trunk in straw. Face it, and press A', arrow:[5, 11, 'cave']},
    {id:'c1class4', main:true, if:{season:3, wrapped:1, class4:0, grown:0}, text:'The {师父|master}’s winter class is about to begin', arrow:'master'},
    {id:'c1snowman', main:true, if:{season:3, class4:1, snowman:0, grown:0}, text:'A pupil wants to build something with you, out of {雪|snow}', arrow:'spyPupil'},
    {id:'c1trip', main:true, if:{season:3, snowman:1, trip:0, grown:0}, text:'The senior pupil needs your help', arrow:'senior'},
    {id:'c1tripGo', main:true, if:{trip:1, away:'village'}, text:'Go down the {山|mountain} and across the sea, to the fishing village. Buy rice and {鱼|fish} there, for the senior pupil', arrow:{place:'village'}},
    {id:'c1tripBuy', main:true, if:{trip:1, place:'village'}, text:'Buy rice from the granny, and {鱼|fish} from the fisherman', arrow:{nearest:[{who:'granny', if:{holding:{tripRice:false}}}, {who:'fisherman', if:{holding:{tripFish:false}}}]}},
    {id:'c1tripBoat', main:true, if:{trip:2, away:'shore'}, text:'The boatman is waiting on the beach below the village, to take you back across the {海|sea}', arrow:{place:'shore'}},
    {id:'c1tripBoatHere', main:true, if:{trip:2, place:'shore'}, text:'The boatman will take you back across the {海|sea}', arrow:'boatman'},
    {id:'c1tripBasket', main:true, if:{trip:3, away:'mountainFoot'}, text:'Go to the foot of the {山|mountain}: the pupils’ basket will haul you up', arrow:{place:'mountainFoot'}},
    {id:'c1tripBasketHere', main:true, if:{trip:3, place:'mountainFoot'}, text:'Climb into the pupils’ {篮子|basket}: face it, and press A', arrow:[18, 2, 'mountainFoot']},
    {id:'c1tripBack', main:true, if:{trip:4}, text:'Take the rice and {鱼|fish} to the senior pupil', arrow:'senior'},
    {id:'c1bigMatch', main:true, if:{season:3, trip:5, bigMatch:0, grown:0}, text:'The senior pupil wants a match with you: the {年|year}’s big match', arrow:'senior'},
    {id:'c1newYear', main:true, if:{season:3, bigMatch:1, newYear:0, grown:0}, text:'It’s the last night of the {年|year}: the {师父|master} is waiting for you', arrow:'master'},
    {id:'c1snowCave', if:{season:3, fire:2, snowCave:0, grown:0, place:'cave'}, text:'A pupil wants a snowball fight with you', arrow:'pupil4'},
    {id:'c1snowTown', if:{trip:{atLeast:1, below:3}, snowTown:0, place:'town'}, text:'A {孩子|child} in the town wants a snowball fight with you', arrow:'snowKid1'},
    {id:'c1snowFields', if:{trip:{atLeast:1, below:3}, snowFields:0, place:'fields'}, text:'A {孩子|child} in the fields wants a snowball fight with you', arrow:'snowKid2'},
    {id:'c1snowVillage', if:{trip:{atLeast:1, below:3}, snowVillage:0, place:'village'}, text:'A {孩子|child} in the village wants a snowball fight with you', arrow:'kid2'},
    {id:'c1bed', main:true, if:{evening:1, any:[{season:0}, {season:1, knows:'叶子'}, {season:2, knows:'雪'}, {season:3}]}, text:'Time to {睡觉|sleep}: go to your room in the rock, face its door, and press A', arrow:[4, 3, 'cave']},
    {id:'c1lecture', main:true, if:{grown:1, lecture:0}, text:'Go to the {师父|master}’s lecture, in front of the hall', arrow:'master'},
    {id:'c1riddle', main:true, if:{lecture:1, riddle:0}, text:'The {师父|master} wants to see you', arrow:'master'},
    {id:'c1night', main:true, if:{riddle:1}, text:'Three taps on the {头|head}, then the back {门|door}… Wait for night: press A at your room in the rock', arrow:[4, 3, 'cave']},
    {id:'c1backDoor', main:true, if:{riddle:2, place:'caveNight'}, text:'Go quietly to the {师父|master}’s back door, beside the hall', arrow:[19, 3, 'caveNight']},
    {id:'c1room', main:true, if:{riddle:2, place:'masterRoom'}, text:'Talk to your {师父|master}', arrow:'master'},
    {id:'c1tests', main:true, if:{riddle:3, tests:0}, text:'The {师父|master} wants to test you', arrow:'master'},
    {id:'c1fly', main:true, if:{tests:1, fly:0}, text:'The {师父|master} has one more thing to teach you', arrow:'master'},
    {id:'c1pine', main:true, if:{fly:1, pine:0}, text:'The pupils want to {看|see} you change into something', arrow:'darePupil'},
    {id:'c1home', main:true, if:{pine:1, sentHome:0}, text:'The {师父|master} is angry with you. Go and {说|talk} to him', arrow:'master'},
    // chapter 2: home, twenty years on
    {id:'c2crying', main:true, if:{chapter:2, new:'哭'}, text:'Someone near your stone is {哭|crying}', arrow:'mother'},
    {id:'c2big', main:true, if:{knows:'哭', foundBig:0}, text:'The troop is hiding! A bush sparkles ✨ over there: someone’s behind it', arrow:{sparkle:true}},
    {id:'c2hungry', main:true, if:{foundBig:1, foundHungry:0}, text:'The others are hiding up at the home ground, by the {瀑布|waterfall}', arrow:{place:'ffmHomeGround'}},
    {id:'c2elder', main:true, if:{foundHungry:1, news:0}, text:'The {老|old} monkey is hiding in the Water Curtain Cave: jump through the waterfall', arrow:{place:'ffmCave'}},
    {id:'c2d1', main:true, if:{news:1, d1:0}, text:'Little {妖怪|demons} are on the home ground! Chase them off', arrow:'d1'},
    {id:'c2d2', main:true, if:{d1:1, d2:0}, text:'Chase the next little {妖怪|demon} off the home ground', arrow:'d2'},
    {id:'c2d3', main:true, if:{d2:1, d3:0}, text:'One more little {妖怪|demon} to chase off', arrow:'d3'},
    {id:'c2north', main:true, if:{d3:1, north:0}, text:'The little {妖怪|demons} have gone. Tell the {老|old} monkey', arrow:'elder'},
    {id:'c2fly', main:true, if:{north:1, king:{below:2}, away:'lair'}, text:'Fly north on your {云|cloud}, to the demon’s mountain', arrow:[13, 12, 'ffmHomeGround']},
    {id:'c2torch', main:true, if:{place:'lair', new:'火'}, text:'Climb up to the {洞|cave} at the top. Something’s burning in front of it', arrow:[12, 4, 'lair']},
    {id:'c2cries', main:true, if:{place:'lair', knows:'火', new:'救命'}, text:'Someone is calling out, near the {火|fire}', arrow:[6, 6, 'lair']},
    {id:'c2cage', main:true, if:{place:'lair', knows:'救命', new:'笼子'}, text:'Little {猴子|monkeys} are locked in {笼子|cages}!', arrow:[6, 5, 'lair']},
    {id:'c2key', main:true, if:{place:'lair', knows:'笼子', new:'钥匙'}, text:'Who has the {钥匙|key}? Ask the guard at the cave’s {门|door}', arrow:'guard'},
    {id:'c2change', main:true, if:{place:'lair', knows:'钥匙', key:0}, text:'The guard won’t give a monkey the {钥匙|key}. Hide behind a boulder, {变|change} into a little {妖怪|demon}, and ask him again', arrow:[12, 11, 'lair']},
    {id:'c2free', main:true, if:{place:'lair', key:1, freed:{below:5}}, text:'Open the {笼子|cages} with the {钥匙|key} ({freed}/5)', arrow:{sparkle:true}},
    {id:'c2cart', main:true, if:{place:'lair', freed:5, cartWon:0}, text:'The troop’s things are on a {车|cart}, over on the right. Beat the little {妖怪|demon} guarding it', arrow:'cartGuard'},
    {id:'c2pull', main:true, if:{place:'lair', cartWon:1, loot:0, following:{cart:false}}, text:'Pull the {车|cart} back to the little monkeys', arrow:[24, 5, 'lair']},   // (it's where it was till you pull it)
    {id:'c2pulling', main:true, if:{place:'lair', following:{cart:true}}, text:'Pull the {车|cart} back to the little monkeys, by the {笼子|cages}', arrow:[8, 6, 'lair']},
    {id:'c2king', main:true, if:{place:'lair', king:1}, text:'Beat {混世魔王}', arrow:'king'},
    {id:'c2unload', main:true, if:{homeAgain:1, party:0, lifted:false}, text:'The hungry monkey wants the troop’s things off the {车|cart}, one at a time: {听|listen}, then take each off it', arrow:[19, 8, 'ffmHomeGround']},
    {id:'c2putBack', main:true, if:{homeAgain:1, party:0, any:CART_THINGS.slice(0, 4).map(w => ({lifted:w}))}, text:'Put it down on the big {桌子|table}', arrow:[17, 7, 'ffmHomeGround']},
    {id:'c2putMilk', main:true, if:{homeAgain:1, party:0, lifted:'牛奶'}, text:'Put the {牛奶|milk} down on the table beside the big one', arrow:[22, 7, 'ffmHomeGround']},
    {id:'c2stick', main:true, if:{homeAgain:1, stickGiven:0}, text:'Give your {棍子|stick} to the little monkey in training', arrow:'trainee'},
    {id:'c2end', main:true, if:{stickGiven:1, ch2:0}, text:'The {老|old} monkey wants to talk to you', arrow:'elder'}
  ],
  hints: [
    {if:{ch2:1}, text:'That’s the end of Area 2! The Dragon King’s palace, under the {海|sea}, is still to come. Until then, practise your words, and visit your {朋友|friends}.'},
    {if:{north:1, king:{below:2}}, text:'Far to the north lives {混世魔王}. Fly there on your {云|cloud}, from the home ground.'},
    {if:{chapter:2}, text:'Find someone with a ! over them.'},
    {if:{door:2}, text:'Find someone in the {洞|cave} with a ! over them.'},
    {if:{chapter:1}, text:'Climb the {山|mountain}, to find where the immortal lives.'},
    {if:{landed:0}, text:'Walk about on the shore.'},
    {if:{dressed:2, child:3}, text:'Find someone with a ! over them, and ask {人|people} about things.'},
    {if:{}, text:'Find someone with a ! over them.'}
  ],
  checklist: [
    {part:'dress', text:'Make friends with the {鹅|goose} on the sand', done:{friends:{goose:true}}},
    {part:'dress', text:'Dress like a {人|person}', show:{landed:1}, done:{dressed:2}},
    {part:'talk', text:'Go up to the village', show:{dressed:2}, done:{child:{atLeast:1}}},
    {part:'talk', text:'Play the {孩子|child}’s game', show:{child:{atLeast:1}}, done:{child:{atLeast:2}}},
    {part:'talk', text:'Find out how to ask about things', show:{child:{atLeast:2}}, done:{child:3}},
    {part:'talk', text:'Ask the villagers {哪里|where} the immortals are ({askedVillage}/3)', show:{child:3}, done:{askedVillage:3}},
    {part:'talk', text:'Ask about things in the village and on the shore ({askedWords}/5)', show:{child:3}, done:{askedWords:5}},
    {part:'talk', text:'Knock on the {门} in the white wall', show:{knows:'门'}, done:{knock:{atLeast:1}}},
    {part:'talk', text:'Catch {鱼|fish} for the fishermen’s basket', show:{pierFish:'asked'}, done:{pierFish:'done'}},
    {part:'talk', text:'Make {朋友|friends} with the chicken', show:{child:3}, done:{friends:{chicken:true}}},
    {part:'talk', text:'Catch the hens, and carry them back to their yard', show:{knows:'鸡'}, done:{hensBack:4}},
    {part:'talk', text:'Play hide and seek with the village {孩子|children}', show:{child:3}, done:{hidesFound:{atLeast:1}}},
    {part:'talk', text:'Have lunch with the granny', show:{child:3}, done:{knows:'米饭'}},
    {part:'talk', text:'Catch a {鱼} for the fisherman', show:{fish:'asked'}, done:{fish:'done'}},
    {part:'road', text:'Help the farmer in the fields', show:{farmer:{atLeast:1}}, done:{lunch:'done'}},
    {part:'road', text:'Ask the farmer {哪里|where} the immortals are', show:{lunch:'done'}, done:{askFarmer:1}},
    {part:'road', text:'Make {朋友|friends} with the dog by the road', show:{farmer:{atLeast:1}}, done:{friends:{dog:true}}},
    {part:'town', text:'Change your {钱|money} in the town', show:{lunch:'done'}, done:{exchanged:1}},
    {part:'town', text:'Ask the people of the town {哪里|where} the immortals are ({askedTown}/3)', show:{exchanged:1}, done:{askedTown:3}},
    {part:'town', text:'Learn to {说|talk} like the townspeople ({townWords}/10)', show:{exchanged:1}, done:{townWords:10}},
    {part:'town', text:'Make {朋友|friends} with the cat in the market', show:{exchanged:1}, done:{friends:{cat:true}}},
    {part:'town', text:'Go shopping for the granny in the town', show:{knows:'包子'}, done:{grannyPeach:'done'}},
    {part:'west', text:'Help the docker load the {船|boat}', show:{years:1}, done:{cargo:2}},
    {part:'west', text:'Find someone who knows {哪里|where} the immortals are', show:{years:1}, done:{toldSea:1}},
    {part:'west', text:'Sail across the western {海|sea}', show:{years:1}, done:{boat:2}},
    {part:'west', text:'Find out {哪里|where} the immortal lives', show:{boat:2}, done:{song:1}},
    {chapter:1, part:'climb', text:'Help the woodcutter at his hut', done:{woodFetch:4}},
    {chapter:1, part:'climb', text:'Make {朋友|friends} with the {鹤} on the cliff road', done:{friends:{crane:true}}},
    {chapter:1, part:'climb', text:'Find the immortal’s {洞|cave}', done:{door:2}},
    {chapter:1, part:'spring', text:'Find out your new {名字|name}', show:{door:2}, done:{named:1}},
    {chapter:1, part:'spring', text:'Go to the {师父|master}’s first class', show:{named:1}, done:{class1:1}},
    {chapter:1, part:'spring', text:'Morning training with the pupils', show:{class1:1}, done:{drill:1}},
    {chapter:1, part:'spring', text:'Plant and water your own peach {树|tree}', show:{drill:1}, done:{myTree:3}},
    {chapter:1, part:'spring', text:'Play I spy with a pupil', show:{named:1}, done:{spyGame:{atLeast:1}}},
    {chapter:1, part:'spring', text:'Train with a pupil, and win', show:{named:1}, done:{trainGame:2}},
    {chapter:1, part:'summer', text:'Fetch {水|water} for the pupils', done:{waterFetch:2}},
    {chapter:1, part:'summer', text:'Go to the {师父|master}’s summer class', show:{waterFetch:2}, done:{class2:1}},
    {chapter:1, part:'summer', text:'Have a friendly match with a pupil', show:{class2:1}, done:{spar1:1}},
    {chapter:1, part:'summer', text:'Find lingzhi for the {师父|master}’s medicine', show:{herbs:{atLeast:1}}, done:{herbs:2}},
    {chapter:1, part:'autumn', text:'Sweep up the fallen {叶子|leaves}', done:{sweep:2}},
    {chapter:1, part:'autumn', text:'Chop firewood for the {冬天|winter}', done:{axeFetch:2}},
    {chapter:1, part:'autumn', text:'Write your {名字|name} with a brush', show:{axeFetch:2}, done:{wrote:1}},
    {chapter:1, part:'autumn', text:'Go to the {师父|master}’s autumn class', show:{wrote:1}, done:{class3:1}},
    {chapter:1, part:'winter', text:'Light a {火|fire} for the pupils', done:{fire:2}},
    {chapter:1, part:'winter', text:'Wrap your peach {树|tree} in straw', show:{fire:2}, done:{wrapped:1}},
    {chapter:1, part:'winter', text:'Go to the {师父|master}’s winter class', show:{wrapped:1}, done:{class4:1}},
    {chapter:1, part:'winter', text:'Build a {雪人|snowman}', show:{class4:1}, done:{snowman:1}},
    {chapter:1, part:'winter', text:'Fetch rice and {鱼|fish} from the fishing village', show:{snowman:1}, done:{trip:5}},
    {chapter:1, part:'winter', text:'Win a snowball fight', show:{fire:2}, done:{any:[{snowCave:{atLeast:1}}, {snowTown:{atLeast:1}}, {snowFields:{atLeast:1}}, {snowVillage:{atLeast:1}}]}},
    {chapter:1, part:'winter', text:'Win the {年|year}’s big match', show:{trip:5}, done:{bigMatch:1}},
    {chapter:1, part:'winter', text:'New Year’s Eve, the last night of the {年|year}', show:{bigMatch:1}, done:{newYear:1}},
    {chapter:1, part:'secret', text:'Solve the {师父|master}’s riddle', show:{grown:1}, done:{riddle:3}},
    {chapter:1, part:'change', text:'Learn to {变|change} into things, and to {飞|fly}', show:{riddle:3}, done:{fly:1}},
    {chapter:1, part:'home', text:'Go {回家|home}', show:{pine:1}, done:{sentHome:1}},
    {chapter:2, part:'homeAgain', text:'Find the troop: they’re hiding', done:{news:1}},
    {chapter:2, part:'demons', text:'Chase the little {妖怪|demons} off the home ground', show:{news:1}, done:{d3:1}},
    {chapter:2, part:'lair', text:'Set the little monkeys free', show:{north:1}, done:{freed:5}},
    {chapter:2, part:'lair', text:'Bring back the troop’s things', show:{freed:5}, done:{loot:{atLeast:1}}},
    {chapter:2, part:'king', text:'Beat {混世魔王}', show:{loot:{atLeast:1}}, done:{king:2}},
    {chapter:2, part:'home2', text:'Put the troop’s things back on the feast’s {桌子|tables}', show:{homeAgain:1}, done:{party:1}},
    {chapter:2, part:'home2', text:'Take the little monkeys {回家|home}', show:{king:2}, done:{ch2:1}}
  ],
  bubbles: {
    child: [{if:{dressed:2, child:0}, show:'!'}, {if:{child:{atLeast:1, below:3}}, show:'!'}, {if:{child:3, askChild:0}, show:'!'}],
    villager: [{if:{hensDone:1, askVillager:0}, show:'!'}],

    oldFisher: [{if:{back:1, oldFisher:0}, show:'!'}],
    fisher1: [{if:{back:1, oldFisher:1, pierFish:'not asked'}, show:'!'}, {if:{pierFish:'asked', holding:{pierFish:true}}, show:'?'}],
    kid2: [{if:{child:3, hidesFound:0}, show:'!'}, {if:{season:3, trip:{atLeast:1, below:5}, snowVillage:0}, show:'!'}],
    planter: [{if:{planter:0}, show:'!'}],
    farmer: [{if:{farmer:0}, show:'!'}, {if:{farmer:1, birdsShooed:5}, show:'!'}, {if:{lunch:'asked', holding:{lunch:true}}, show:'?'}, {if:{lunch:'done', askFarmer:0}, show:'!'}],
    fruitSeller: [{if:{exchanged:1, new:'买'}, show:'!'}, {if:{exchanged:1, new:'多少钱'}, show:'!'}],
    changer: [{if:{exchanged:0}, show:'!'}, {if:{new:'卖', treasures:true}, show:'!'}],
    boss: [{if:{new:'卖', treasures:true}, show:'!'}, {if:{canBuy:'home'}, show:'?'}],   // (? only for his own shop at home, not the town's stalls)
    bunSeller: [{if:{knows:'多少钱', new:'包子'}, show:'!'}, {if:{night:true, knows:'多少钱', new:'臭豆腐'}, show:'!'}],   // (after the fruit stall's 多少钱: one ! at a time, as a game from Flower Fruit Mountain knows 买 already)
    shoeSeller: [{if:{knows:'包子', grannyBuns:'done', new:'鞋'}, show:'!'}],
    teaKeeper: [{if:{knows:'鞋', new:'茶'}, show:'!'}, {if:{knows:'茶', askTea:0}, show:'!'}],
    granny2: [{if:{knows:'包子', grannyBuns:'not asked'}, show:'!'}, {if:{grannyBuns:'asked', inBag:{'包子':true}}, show:'?'},
      {if:{grannyBuns:'done', grannyApple:'not asked'}, show:'!'}, {if:{grannyApple:'asked', inBag:{'苹果':true}}, show:'?'},
      {if:{grannyApple:'done', grannyPeach:'not asked'}, show:'!'}, {if:{grannyPeach:'asked', inBag:{'桃子':true}}, show:'?'}, {if:{grannyPeach:'done', askGranny:0}, show:'!'}],
    docker: [{if:{years:1, cargo:0}, show:'!'}, {if:{cargo:1, cargoCarried:4}, show:'?'}, {if:{cargo:2, askDocker:0}, show:'!'}],
    teller: [{if:{knows:'茶', new:'说'}, show:'!'}, {if:{knows:'说', askTeller:0}, show:'!'}],
    teacher: [{if:{knows:'说', new:'听'}, show:'!'}, {if:{knows:'听', new:'孩子'}, show:'!'}, {if:{knows:'孩子', new:'学'}, show:'!'}],
    teacherOld: [{if:{new:'听'}, show:'!'}, {if:{knows:'听', new:'孩子'}, show:'!'}, {if:{knows:'孩子', new:'学'}, show:'!'}],
    boatman: [{if:{asked:8, toldSea:0}, show:'!'}, {if:{toldSea:1, boat:0}, show:'!'}, {if:{boat:1}, show:'!'}, {if:{trip:2}, show:'!'}],
    master: [{if:{door:2, teacher:0}, show:'!'}, {if:{teacher:1, named:0}, show:'!'}, {if:{named:1, class1:0}, show:'!'}, {if:{season:1, waterFetch:2, class2:0}, show:'!'},
      {if:{season:1, spar1:1, herbs:0}, show:'!'}, {if:{season:2, wrote:1, class3:0}, show:'!'}, {if:{herbs:1, herbsFound:{atLeast:3}}, show:'?'}, {if:{season:3, wrapped:1, class4:0, grown:0}, show:'!'}, {if:{season:3, bigMatch:1, newYear:0, grown:0}, show:'!'}, {if:{grown:1, lecture:0}, show:'!'}, {if:{lecture:1, riddle:0}, show:'!'},
      {if:{riddle:2}, show:'!'}, {if:{riddle:3, tests:0}, show:'!'}, {if:{tests:1, fly:0}, show:'!'}, {if:{pine:1, sentHome:0}, show:'!'}],
    spyPupil: [{if:{named:1, spyGame:0}, show:'!'}, {if:{season:3, class4:1, snowman:0, grown:0}, show:'!'}],
    pupil4: [{if:{named:1, grown:0, trainGame:{below:2}, season:{below:3}}, show:'!'}, {if:{season:3, fire:2, snowCave:0, grown:0}, show:'!'}],
    snowKid1: [{if:{snowTown:0}, show:'!'}], snowKid2: [{if:{snowFields:0}, show:'!'}],
    granny: [{if:{child:3, new:'米饭'}, show:'!'}, {if:{lunch:'asked', holding:{lunch:false}}, show:'!'}, {if:{season:3, trip:1, holding:{tripRice:false}}, show:'!'}],
    fisherman: [{if:{child:3, fish:'not asked'}, show:'!'}, {if:{fish:'asked', holding:{fish:true}}, show:'?'}, {if:{fish:'done', askFisher:0}, show:'!'}, {if:{season:3, trip:1, holding:{tripFish:false}}, show:'!'}],
    senior: [{if:{class1:1, drill:0}, show:'!'}, {if:{drill:1, myTree:0}, show:'!'}, {if:{season:1, waterFetch:0, evening:0}, show:'!'}, {if:{season:2, sweep:0, evening:0}, show:'!'}, {if:{sweep:1, leavesSwept:5}, show:'?'}, {if:{any:[{waterFetch:1}, {axeFetch:1}]}, show:'?'}, {if:{sweep:2, axeFetch:0}, show:'!'}, {if:{season:2, axeFetch:2, wrote:0}, show:'!'},
      {if:{season:3, fire:0, grown:0}, show:'!'}, {if:{season:3, snowman:1, trip:0, grown:0}, show:'!'}, {if:{trip:4}, show:'?'}, {if:{season:3, trip:5, bigMatch:0, grown:0}, show:'!'}],
    darePupil: [{if:{season:1, class2:1, spar1:0}, show:'!'}, {if:{fly:1, pine:0}, show:'!'}],
    woodcutter: [{if:{song:0}, show:'!'}, {if:{chapter:1, woodFetch:0}, show:'!'}, {if:{woodFetch:{atLeast:1, below:4}}, show:'?'}],
    // chapter 2
    mother: [{if:{chapter:2, new:'哭'}, show:'!'}],
    elder: [{if:{knows:'好久不见', new:'老'}, show:'!'}, {if:{d3:1, north:0}, show:'!'}, {if:{stickGiven:1, ch2:0}, show:'!'}],
    d1: [{if:{d1:0}, show:'!'}], d2: [{if:{d1:1, d2:0}, show:'!'}], d3: [{if:{d2:1, d3:0}, show:'!'}],
    guard: [{if:{knows:'笼子', new:'钥匙'}, show:'!'}, {if:{key:0, form:'妖怪'}, show:'!'}],
    cartGuard: [{if:{freed:5, cartWon:0}, show:'!'}],
    hungry: [{if:{homeAgain:1, party:0, lifted:false}, show:'!'}],
    trainee: [{if:{homeAgain:1, stickGiven:0}, show:'!'}],
    king: [{if:{king:1}, show:'!'}]
  },

  // Who knows where the immortals are? (decided 5 November 2026): the people you help, and ask, on your Tasks page under
  // your journey while show matches (whoKnowsHTML in js/menu.js), each ticked once you've asked them (asked: the key that
  // says so); and the one who knows (knows), a ? till they've told you (done).
  askList: {title:'Who knows?', show:{landed:1, chapter:0}, done:{toldSea:1}, knows:'boatman',
    people:[{who:'child', asked:'askChild'}, {who:'fisherman', asked:'askFisher'}, {who:'villager', asked:'askVillager'}, {who:'farmer', asked:'askFarmer'},
      {who:'granny2', asked:'askGranny'}, {who:'teaKeeper', asked:'askTea'}, {who:'teller', asked:'askTeller'}, {who:'docker', asked:'askDocker'}]},

  // Who you're carrying something for, when it isn't one of their requests (the bag's For someone tab): the lingzhi you
  // pick for the master's medicine.
  holdingFor: {herbs:'master', tripRice:'senior', tripFish:'senior'},

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
      offer:'havePeach', sentence:'我 有 桃子', sentenceEn:'I have a peach.', reward:2, thanks:'thanks', thanksReply:'不客气', after:[{goOn:true}]},
    // the fisherman on the pier wants fish for their basket: three, caught with your rod beside him (each counted as you
    // catch it: the fishing's steps)
    pierFish: {from:'fisher1', wants:'鱼', ask:'haveFish', asked:'The fishermen want fish for their basket. Fish off the pier beside them: face the sea, and press A. Three, please!',
      offer:'haveFish', sentence:'我 有 鱼', sentenceEn:'I have some fish.', reward:3, thanks:'thanks', thanksReply:'不客气'},
    // the fisherman in the village wants a fish: catch one with the rod you brought from home, and he pays you in coins
    // (钱, the human world's money)
    fish: {from:'fisherman', wants:'鱼', ask:'haveFish', asked:'The fisherman wants a fish. Catch one with your {鱼竿}: face the sea or the stream, and press A.',
      offer:'haveFish', sentence:'我 有 鱼', sentenceEn:'I have a fish.', reward:0, thanks:'thanks', thanksReply:'不客气',
      after:[{say:'thisIsMoney', teach:'钱'}, {newWord:'钱', note:'Coins: the money people use. The fisherman pays you for the fish!'}, {coins:3, note:'The fisherman gives you 3 🪙. Now you have coins!'}, {goOn:true}]},
    // the farmer is hungry once you've shooed the birds off his rice: the granny gives you a bowl of rice for him (a meal,
    // carried for him: not a snack in your bag, decided 5 November 2026)
    lunch: {from:'farmer', wants:'米饭', ask:'hungryFarmer', asked:'The farmer is hungry, but his lunch is back in the village. Ask the granny by the well for some {米饭|rice} for him!',
      offer:'hungryFarmer', sentence:'我 有 米饭', sentenceEn:'I have some rice.', reward:3, thanks:'thanks', thanksReply:'不客气', after:[{goOn:true}]}
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
        {item:'包子', price:2, sentence:'我 要 买 包子', sentenceEn:'I want to buy a steamed bun.', note:'A steamed bun, soft and hot, with something tasty inside.', bought:'You put the {包子} in your bag. In a word game, eat it to take away a wrong answer.', eat:true},
        // the night market (decided 8 November 2026, the polish plan): at night the bun stall fries stinky tofu, which does what a
        // durian does, useful against the little demons at home
        {item:'臭豆腐', price:2, if:{night:true}, sentence:'我 要 买 臭豆腐', sentenceEn:'I want to buy some stinky tofu.', note:'Tofu, fried till it’s golden. It smells terrible, and tastes good!', bought:'You put the {臭豆腐} in your bag. Eat it out on the map, and wild creatures keep away from the smell for two minutes.', eat:true}
      ]},
    // the fishing village in winter: rice and fish for the cave's stores (for: carried for the senior pupil, holdingFor)
    rice: {who:'granny', ask:'whatBuy', given:'The granny gives you the {item}.', reply:'谢谢', welcome:'welcome', no:'我不要',
      earnMore:'The senior pupil gave you enough for the rice and the fish. Spent some? Catch big {鱼|fish} with your rod and sell them, 1 🪙 each.', puzzled:'The granny looks puzzled: you pointed at the {item}, but asked for something else!',
      sorry:'对不起', sorryAbout:'You asked the granny for the wrong thing.', noProblem:'noProblem', soldOut:'Come back another time.',
      items:[{item:'米', price:3, for:'tripRice', if:{trip:1}, sentence:'我 要 买 米', sentenceEn:'I want to buy rice.', note:'A sack of rice, for the cave.', bought:'You carry the sack of {米|rice} for the senior pupil.'}]},
    fish: {who:'fisherman', ask:'whatBuy', given:'The fisherman gives you the {item}.', reply:'谢谢', welcome:'welcome', no:'我不要',
      earnMore:'The senior pupil gave you enough for the rice and the fish. Spent some? Catch big {鱼|fish} with your rod and sell them, 1 🪙 each.', puzzled:'The fisherman looks puzzled: you pointed at the {item}, but asked for something else!',
      sorry:'对不起', sorryAbout:'You asked the fisherman for the wrong thing.', noProblem:'noProblem', soldOut:'Come back another time.',
      items:[{item:'鱼', price:3, for:'tripFish', if:{trip:1}, sentence:'我 要 买 鱼', sentenceEn:'I want to buy fish.', note:'A big fish, for the cave.', bought:'You carry the {鱼|fish} for the senior pupil.'}]},
    shoes: {who:'shoeSeller', ask:'whatBuy', given:'The stallholder gives you the {item}.', reply:'谢谢', welcome:'welcome', no:'我不要',
      earnMore:'Earn more by helping people and making friends with animals.', puzzled:'The stallholder looks puzzled: you pointed at the {item}, but asked for something else!',
      sorry:'对不起', sorryAbout:'You asked the stallholder for the wrong thing.', noProblem:'noProblem', soldOut:'You have shoes now! Come back another time.',
      items:[
        {item:'鞋', price:4, sentence:'我 要 买 鞋', sentenceEn:'I want to buy shoes.', note:'Cloth shoes, black, with thick soles.', bought:'You put on your new {鞋}. Now you look just like a person!', wear:true}
      ]},
    // the money changer buys Flower Fruit Mountain's treasures too, for coins (js/trade.js: decided 9 November 2026, the trade
    // plan): his Sell tab alone, as he sells nothing
    changer: {who:'changer', ask:'changeMoney', reply:'谢谢', welcome:'welcome', sells:{}, sellAsk:'whatSell',
      sellPuzzled:'The money changer looks puzzled: you pointed at the {item}, but offered him something else!', items:[]},
    // the 老板, at his stall at home once the Demon of Havoc is beaten: the tools and things for the Water Curtain Cave
    // he sold on Flower Fruit Mountain, now in coins (the words you catch only by buying them), and he buys treasures
    home: {who:'boss', ask:'whatBuy', teach:'买', given:'The {老板} gives you the {item}.', reply:'谢谢', welcome:'welcome', no:'我不要',
      earnMore:'Earn more by helping the troop, making friends with animals, and selling the {老板} treasures.', puzzled:'The {老板} looks puzzled: you pointed at the {item}, but asked for something else!',
      sorry:'对不起', sorryAbout:'You asked the {老板} for the wrong thing.', noProblem:'noProblem', soldOut:'You have everything the {老板} sells. Come back another time.',
      sells:{}, sellAsk:'whatSell', sellPuzzled:'The {老板} looks puzzled: you pointed at the {item}, but offered him something else!',
      groups:{snacks:'Snacks', tools:'Tools', cave:'For the Water Curtain Cave'},
      items:[
        {item:'桃子', price:2, group:'snacks', sentence:'我 要 买 桃子', sentenceEn:'I want to buy a peach.', note:'A ripe peach.', bought:'You put the {桃子} in your bag.', eat:true},
        {item:'篮子', price:15, group:'tools', tool:true, sentence:'我 要 买 篮子', sentenceEn:'I want to buy the basket.', note:'A woven bamboo basket for your bag.', bought:'Your {篮子} goes in your bag: now you can carry two more of every snack.'},
        {item:'灯笼', price:10, group:'tools', tool:true, sentence:'我 要 买 灯笼', sentenceEn:'I want to buy the lantern.', note:'A red paper lantern, with a candle inside.', bought:'Your {灯笼} lights up the dark round you at night, and treasures glint from further away.'},
        {item:'铲子', price:12, group:'tools', tool:true, sentence:'我 要 买 铲子', sentenceEn:'I want to buy the spade.', note:'A spade with a wooden handle, for digging.', bought:'With your {铲子}, you can dig up roots that grow deep in the ground.'},
        {item:'花瓶', price:6, group:'cave', decor:true, sentence:'我 要 买 花瓶', sentenceEn:'I want to buy the vase.', note:'A clay vase, for flowers.', bought:'The troop will set your {花瓶} up in the Water Curtain Cave. Go and see!'},
        {item:'风铃', price:8, group:'cave', decor:true, sentence:'我 要 买 风铃', sentenceEn:'I want to buy the wind chime.', note:'Bamboo tubes that tinkle in the wind.', bought:'The troop will hang your {风铃} up in the Water Curtain Cave. Go and see!'},
        {item:'鼓', price:10, group:'cave', decor:true, sentence:'我 要 买 鼓', sentenceEn:'I want to buy the drum.', note:'A drum of wood and skin. Boom!', bought:'The troop will set your {鼓} up in the Water Curtain Cave. Go and see!'},
        {item:'画', price:12, group:'cave', decor:true, sentence:'我 要 买 画', sentenceEn:'I want to buy the painting.', note:'A painting of the mountain, on paper.', bought:'The troop will hang your {画} up in the Water Curtain Cave. Go and see!'},
        {item:'鱼缸', price:15, group:'cave', decor:true, sentence:'我 要 买 鱼缸', sentenceEn:'I want to buy the fish jar.', note:'A big glazed jar, for a fish to live in.', bought:'The troop will set your {鱼缸} up in the Water Curtain Cave.'}
      ]}
  },

  // The end of Area 2 (the end of chapter 2, as the book's second chapter ends), then what's to come.
  areaEnd: {title:'The end of Area 2', text:['The troop’s little ones are home, and the Demon of Havoc has gone for good.',
    'To be continued: under the sea, to the Dragon King’s palace (Area 3). Until then, practise your words, and visit your friends.']},

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

  // Snacks (零食) you carry in your bag: Flower Fruit Mountain's, and the human world's. (A meal, such as the granny's rice,
  // you eat there and then: the eat step.)
  food: {
    '桃子': {heal:10, carry:3, does:'Brings back 10 health'},
    '苹果': {helps:true, carry:3, does:'Takes away a wrong answer'},
    '蜂蜜': {fast:60, carry:2, does:'Walk faster for a minute'},
    '包子': {helps:true, carry:3, does:'Takes away a wrong answer'},
    // a durian you brought from Flower Fruit Mountain, as there (stink: js/input.js)
    '榴莲': {stink:120, carry:2, does:'Keeps wild creatures away for 2 minutes', note:'Phew! Wild creatures keep away from the smell for two minutes.',
      eaten:[{if:{new:'臭'}, say:'tooSmelly', by:'player', teach:'臭'}, {if:{new:'臭'}, newWord:'臭', note:'臭 means smelly. Nothing wants to come near you now!'}]},
    // stinky tofu from the night market (the bun stall, at night), which does the same
    '臭豆腐': {stink:120, carry:2, does:'Keeps wild creatures away for 2 minutes', note:'Phew! Wild creatures keep away from the smell for two minutes.',
      eaten:[{if:{new:'臭'}, say:'tooSmelly', by:'player', teach:'臭'}, {if:{new:'臭'}, newWord:'臭', note:'臭 means smelly. Nothing wants to come near you now!'}]}
  },

  events: [
    // the first night and the first rain, for a game that hasn't had them on Flower Fruit Mountain (js/daynight.js)
    {if:{night:true, new:'晚上'}, do:[{sound:'chime'}, {message:'The sun has gone down, and the moon is coming up.'},
      {say:'nightNow', by:'player', teach:'晚上'}, {if:{new:'晚上'}, newWord:'晚上', note:'晚上 means night, or evening. Everyone goes home to sleep, and the streets are quiet.'}]},
    {if:{raining:true, new:'雨'}, do:[{message:'Drip, drip… it’s starting to rain!'}, {say:'raining', by:'player', teach:'雨'},
      {if:{new:'雨'}, newWord:'雨', note:'雨 means rain. It never lasts long: the sun will soon be out again.'}]},
    {if:{raining:'heavy', knows:'雨', new:'大雨'}, do:[{message:'Splash, splash… it’s pouring!'}, {say:'pouring', by:'player', teach:'大雨'},
      {if:{new:'大雨'}, newWord:'大雨', note:'大雨 means heavy rain: big rain. It never lasts long either.'}]},
    // a game from before rice was a meal (5 November 2026), with rice in its bag for the farmer: it's his lunch now
    {if:{lunch:'asked', holding:{lunch:false}, inBag:{'米饭':true}}, do:[{hold:'米饭', for:'lunch'}]},
    // all four hens back in their yard: the villager thanks you
    {if:{hensBack:4, hensDone:0}, do:[{set:{hensDone:1}}, {sound:'chime'}, {shells:3, if:{new:'钱'}, note:'All four hens are back in their yard! The villager gives you 3 🐚 for your help.'},
      {shells:3, if:{knows:'钱'}, note:'All four hens are back in their yard! The villager gives you 3 🪙 for your help.'}]},
    {if:{landed:0}, do:LANDING},   // (the page closed before the landing was over)
    // dressed: the fishermen come out of their hut again
    {if:{dressed:2, back:0}, do:[{set:{back:1}}, {sound:'chime'},
      {message:'The fishermen come out of their hut. They don’t run away now: in a coat and hat, you look just like a person!'}]},
    // on the road through the fields, the dog stops you, guarding it
    {if:{place:'fields', dogStop:0, friends:{dog:false}, around:[36, 8, 'fields', 1]}, do:[{set:{dogStop:1}}, {stopsYou:'dog'}]},
    // a game saved at the end of the prologue, before chapter 1 was built (the woodcutter's song ended it then): it begins now
    {if:{song:1, chapter:0}, do:[{chapter:1}, {message:'The woodcutter has gone home, up the stone steps. Follow him up the mountain!'}]},
    // over the stone pillars, nothing but the open sky (天), once you've had a little practice since your last new word
    {if:{place:'pillars', sky:0}, do:[{set:{sky:1}}, {sound:'chime'},
      {message:'Up here, above the clouds, there’s nothing over you but the wide, blue sky.'}, {newWord:'天', note:'天 means sky. Up here, it feels close enough to touch!'}]},
    // into the cave for the first time
    {if:{place:'cave', caveSeen:0}, do:[{set:{caveSeen:1}},
      {message:'Through the stone doors: a great hollow in the mountain, open to the sky. Pupils in robes are sweeping and reading, and an old man in white stands in front of the hall…'}]},
    // the master's year (decided 7 November 2026): it's spring as you arrive, the peach trees in blossom
    {if:{place:'cave', caveSeen:1, season:0, grown:0, new:'春天'}, do:[{newWord:'春天', note:'春天 means spring. The peach trees are in blossom, and everything is growing again.'}]},
    // a season's jobs done: evening falls, and the first sign of the season to come
    {if:{season:0, myTree:3, evening:0, grown:0}, do:[{set:{evening:1}}, {sound:'chime'},
      {message:'The sun goes down behind the rocks. The last of the blossom blows away, and the cicadas start to sing: summer is coming. Time for bed!'}]},
    {if:{season:1, waterFetch:2, class2:1, spar1:1, herbs:2, evening:0}, do:[{set:{evening:1}}, {sound:'chime'},
      {message:'Evening comes, cooler at last. A yellow leaf drifts down, by your room: autumn is coming!'}]},
    {if:{season:2, sweep:2, axeFetch:2, wrote:1, class3:1, evening:0}, do:[{set:{evening:1}}, {sound:'chime'},
      {message:'Evening comes, and it’s cold. The first snowflakes are falling, and settling by your room: winter is coming!'}]},
    {if:{season:3, trip:1, holding:{tripRice:true, tripFish:true}}, do:[{set:{trip:2}}, {sound:'chime'},
      {message:'Rice and fish! The boatman is waiting on the beach below the village, to sail you straight back across the sea.'}]},
    {if:{season:3, newYear:1, evening:0, grown:0}, do:[{set:{evening:1}}, {sound:'chime'},
      {message:'The last night of the year. Time for bed!'}]},
    // at the cave's door: the stone doors rumble open, and a boy comes out (the immortal's pupil)
    {if:{place:'pillars', door:0, around:[15, 6, 'pillars', 2]}, do:[{set:{door:1}}, {sound:'rumble'},
      {message:'With a deep rumble, the stone doors swing open. A boy comes out!'}, {talkTo:'doorBoy'}]},
    // years go by in the town, once you know its words: you live among people, learning to talk like them, but nobody is
    // looking for the immortals (a match game of the town's and the village's words)
    // chapter 2: a game saved at the end of chapter 1, before chapter 2 was built (the master had sent you home): it begins now
    {if:{sentHome:1, chapter:1}, do:[{chapter:2}, {goTo:'ffmMeadow', at:[9, 2], facing:'down'}]},
    // home, by your stone, after twenty years
    {if:{place:'ffmMeadow', home2:0}, do:[{set:{home2:1}},
      {message:'Flower Fruit Mountain, after twenty years! Your stone, the meadow, the river… But it’s very quiet. Then you hear someone crying.'}]},
    // back from the cave with the news: a little demon on the home ground stops you
    {if:{place:'ffmHomeGround', news:1, d1:0, around:[4, 9, 'ffmHomeGround', 2]}, do:[{stopsYou:'d1'}]},
    // the old monkey, following you out of the cave after his news (decided 7 November 2026, after playing it: he just
    // appeared at the home ground), sits down on his stool by the big table as you come past it
    {if:{place:'ffmHomeGround', following:{elder:true}, around:[16, 8, 'ffmHomeGround', 2]}, do:[{follow:[]}, {message:'The old monkey sits down on his stool by the big table, to watch.'}]},
    // the demon's mountain, the first time
    {if:{place:'lair', lairSeen:0}, do:[{set:{lairSeen:1}},
      {message:'The Demon of Havoc’s mountain: black rock, ash and dead pines. Up at the top, torches burn in front of a dark cave…'}]},
    // near the cages: the troop's little ones, calling for help
    {if:{place:'lair', knows:'火', new:'救命', around:[6, 6, 'lair', 3]}, do:[{say:'help', by:'baby1'}, {newWord:'救命', note:'救命 means Help! The troop’s little ones, locked in cages!'}]},
    // all five free: the little demon guarding the cart of the troop's things stops you as you come up to it
    {if:{place:'lair', freed:5, cartWon:0, around:[24, 6, 'lair', 2]}, do:[{stopsYou:'cartGuard'}]},
    // the cart pulled back to the little monkeys (decided 7 November 2026, after playing it: the Demon of Havoc appeared
    // off the screen): they jump for joy, the ground shakes, his little demons run into the cave, and out he comes, down
    // towards you, a heavy step at a time
    {if:{place:'lair', following:{cart:true}, around:[7, 6, 'lair', 3]}, do:[{follow:[], park:true}, {sound:'chime'},
      {leap:'baby1'}, {leap:'baby3'}, {leap:'baby5'}, {say:'veryHappy', by:'baby2'},
      {sound:'rumble'}, {message:'The ground shakes! The little demons run into the cave, shouting. Something big is coming out…'},
      {leap:'guard', to:[14, 3]}, {leap:'guard2', to:[15, 3]}, {set:{loot:1, king:1}},
      {walk:'king', from:[14, 3], to:'you', ms:420, stomp:true}, {talkTo:'king'}]},
    // home with the little monkeys and the cart: the hungry monkey wants the troop's things off it, for the feast's tables
    {if:{place:'ffmHomeGround', homeAgain:1, unload:0, party:0}, do:[{talkTo:'hungry'}]},
    {if:{place:'ffmCave', decorWaiting:true}, do:[{decorate:true, by:'player', line:'lovely'}]},   // (what you've bought for the cave from the 老板: js/trade.js)
    // (a game that heard the boatman's news before the asking was the story's purpose: he's told you)
    {if:{boat:{atLeast:1}, toldSea:0}, do:[{set:{toldSea:1}}]},
    {if:{askedTown:3, years:0}, do:[{set:{years:1}}, {message:'Nobody in the town knows where the immortals are either. You stay, and keep asking, year after year…'},
      {scene:'yearsPass'}, {scene:'manyYearsLater'},
      {match:'Years among people', stop:'Not now', words:['人', '衣服', '帽子', '井', '房子', '门', '鸡', '米饭', '钱', '网', '船', '狗', '包子', '鞋', '茶', '孩子', '书', '猫']},
      {message:'Years go by. You can talk like people now, but nobody here knows where the immortals are. The town has changed too: the children from the school are grown up. Across the bridge, at the harbour, boats sail all over the sea: maybe someone there knows.'}]}
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
        {at:[39, 12], to:'villageLane', arrive:[1, 6], facing:'right', if:{any:[{askedVillage:3}, {farmer:{atLeast:1}}]}, closed:'Not yet: help the villagers, and ask them where the immortals are. Check your tasks.'},
        {at:[39, 13], to:'villageLane', arrive:[1, 7], facing:'right', if:{any:[{askedVillage:3}, {farmer:{atLeast:1}}]}, closed:'Not yet: help the villagers, and ask them where the immortals are. Check your tasks.'}
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
      fireflies: true,   // (fireflies over the rice fields at night, as on Flower Fruit Mountain: js/daynight.js)
      onMap: [106, 102],
      sounds: ['birds', 'wind'],
      exits: [
        {at:[0, 8], to:'villageLane', arrive:[38, 6], facing:'left'},
        {at:[0, 9], to:'villageLane', arrive:[38, 7], facing:'left'},
        {at:[43, 8], to:'highRoad', arrive:[1, 7], facing:'right', if:{any:[{lunch:'done', friends:{dog:true}, askFarmer:1}, {exchanged:1}]}, closed:'Not yet: help the farmer and ask him where the immortals are, and make friends with the dog, first.'},
        {at:[43, 9], to:'highRoad', arrive:[1, 8], facing:'right', if:{any:[{lunch:'done', friends:{dog:true}, askFarmer:1}, {exchanged:1}]}, closed:'Not yet: help the farmer and ask him where the immortals are, and make friends with the dog, first.'}
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
        "bgggggggggggggvvvvvvvgggggGGGGGGGGGggjgggggb",
        "bgggggggggggggggggggggggggGGGGGGGGGggggggggb",
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
      ]
    },
    // the market town: the teahouse and the school along the top, the market's stalls, the old tree and a well in the
    // square, a second row of houses, the canal with its arched bridge, and houses beyond it
    town: {
      name: {zh:'小镇', py:'xiǎozhèn', en:'The market town'},
      music: 'village',
      nightBats: [[4, 8], [10, 8], [27, 8]],   // (bats flitting round the stalls' lanterns at night: js/daynight.js)
      onMap: [166, 102],
      sounds: ['birds'],
      exits: [
        {at:[0, 12], to:'highRoad', arrive:[42, 7], facing:'left'},
        {at:[0, 13], to:'highRoad', arrive:[42, 7], facing:'left'},
        {at:[0, 14], to:'highRoad', arrive:[42, 8], facing:'left'},
        {at:[24, 27], to:'canalPath', arrive:[9, 1], facing:'down', if:{years:1}, closed:'Not yet: help the people of the town, and ask them where the immortals are. Check your tasks.'},
        {at:[25, 27], to:'canalPath', arrive:[10, 1], facing:'down', if:{years:1}, closed:'Not yet: help the people of the town, and ask them where the immortals are. Check your tasks.'}
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
      // its sacks of rice, waiting to go on the boat: carry four for the docker, one at a time (a question as you lift each),
      // over your head down the pier, and put each down on the boat's deck, where they pile up (decided 6 November 2026,
      // after playing it: they were thrown onto it)
      legend: {
        'x': {look:'sacks', landmark:true, onLook:[
          {if:{cargo:1, cargoCarried:{below:4}, lifted:false}, label:'Lift', sparkle:true, do:[{practise:1, label:'Lift the sack!', pic:'米'}, {change:'#'}, {lift:'sack'},
            {message:'Up it goes, over your head! Carry it down the pier, onto the {船|boat}.'}]},
          {if:{lifted:'sack'}, do:[{message:'Your arms are full! Take this sack to the {船|boat} first.'}]},
          {do:[{message:'Sacks of rice, waiting to go on the boat.'}]}]},
        // the boat, and the sacks on its deck, as many as you've put there
        'V': ON_BOAT(0), '①': ON_BOAT(1), '②': ON_BOAT(2), '③': ON_BOAT(3), '④': ON_BOAT(4)
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
        "b###################j##q#########b",
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
      legend: {'.': {look:'path', walk:true}},   // (a path through the grass, soft at its edges, as at home: decided 5 November 2026, after playing it, when it zigzagged in hard squares)
      sounds: [{rows:[4, 16], cols:[0, 13], if:{song:0}, sounds:['song', 'birds']}, {rows:[0, 23], if:{song:0}, sounds:['songFar', 'wind']}, {rows:[0, 23], sounds:['wind', 'birds']}],
      exits: [
        {at:[17, 21], to:'harbour', arrive:[17, 15], facing:'right', by:'A', label:'Sail'},
        {at:[18, 21], to:'harbour', arrive:[17, 15], facing:'right', by:'A', label:'Sail'},
        {at:[15, 0], to:'mountainFoot', arrive:[16, 22], facing:'up', if:{song:1}, closed:'The path goes on up the mountain. Who lives up there? Find out first.'},   // (up the stone steps, once the woodcutter has told you)
        {at:[16, 0], to:'mountainFoot', arrive:[17, 22], facing:'up', if:{song:1}, closed:'The path goes on up the mountain. Who lives up there? Find out first.'}
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
        "tttggggJggg......gggggtggggggttt",
        "tttgggggggggggt..ggggggggggggttt",
        "tttgggggggJgggg..ggggggggggggttt",
        "tttgggggggggggg..gggggggggtggttt",
        "tttgggggggggtgg..ggggggggtgggttt",
        "tttgggggggggggg..ggtgggggggggttt",
        "tttgggggggggggg..ggggggggggggttt",
        "tttgggggggggggg..ggggggggggggttt",
        "kssssssssssssssssssssssssssssssk",
        "kssssssssssssssPPssssssssssssssk",
        "kssssssssssssssPPssssssssssssssk",
        "mmmmmmmmmmmmmmmPPmmmmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmPPVVVmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmPPmmmmmmmmmmmmmmm",
        "mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm"
      ]
    },
    // Chapter 1, the teacher's mountain (decided 4 November 2026, after three drafts of the plan): up the stone steps from
    // the far shore, the foot of the mountain, a pine forest round the woodcutter's hut, a rushing stream to cross by
    // stepping stones; above it, a walkway of planks bolted up the cliff over a sea of clouds (gusts of wind across it,
    // loose planks to hop, a chain to climb); and at the top, the stone pillars, joined by chain bridges, mist rolling in,
    // the mountain's tablet and the cave's stone door. The mountain has its own look (js/mountain.js).
    mountainFoot: {
      name: {zh:'山脚', py:'shānjiǎo', en:'The foot of the mountain'},
      music: 'village',
      onMap: [206, 18],
      sounds: ['wind', 'birds'],
      exits: [
        {at:[16, 23], to:'farShore', arrive:[15, 1], facing:'down'},
        {at:[17, 23], to:'farShore', arrive:[16, 1], facing:'down'},
        {at:[20, 0], to:'cliffRoad', arrive:[10, 32], facing:'up'},
        {at:[21, 0], to:'cliffRoad', arrive:[11, 32], facing:'up'}
      ],
      legend: {
        'P': {look:'pine', word:'树'},
        'w': {look:'water', word:'河', note:'A stream, rushing down from the mountain.', onLook:[{if:{woodFetch:{atLeast:1, below:4}}, label:'Scoop', do:[{carry:'水'}]}]},
        'p': {look:'woodpile', word:'木头', onLook:[{if:{woodFetch:{atLeast:1, below:4}}, label:'Pick up', do:[{carry:'木头', howMany:true}]}]},
        'o': {look:'pebble', word:'石头', onLook:[{if:{woodFetch:{atLeast:1, below:4}}, label:'Pick up', do:[{carry:'石头', howMany:true}]}]},
        'r': {look:'rocks', word:'石头', landmark:true},
        'u': {look:'mushrooms', walk:true, landmark:true, word:'蘑菇', note:'Red mushrooms with white spots, under the pines. Pretty, but not for eating!'},
        // the pupils' supply basket, let down on a long rope while you're away for the rice and fish (winter): it hauls
        // you back up the mountain
        'б': {look:'grass', walk:true, becomes:[{if:{season:3, trip:{atLeast:1}, grown:0}, to:'Б'}]},
        'Б': {look:'supplyBasket', landmark:true, onLook:[{if:{trip:3}, label:'Climb in', do:[{scene:'basketUp'}, {set:{trip:4}}, {goTo:'cave', at:[14, 19], facing:'up'},
            {message:'The pupils haul you all the way up, with the rice and the fish. Take them to the senior pupil!'}]},
          {if:{trip:{below:3}}, do:[{message:'The pupils’ supply basket, on its long rope. Come back with the rice and the fish, and they’ll haul you up in it.'}]},
          {do:[{message:'The pupils’ supply basket, on its long rope.'}]}]}
      },
      map: [
        "PPPPPPPPPPPPPPPPPPPP..PPPPwwPPPPPP",
        "PggggggggggggggggPgg..ggPgwwgggggP",
        "PggUUUUUgggggPggggбg..ggggwwgggggP",
        "PggUUUUUpgggggggggggGGGGGgwwggPggP",
        "Pggg...ggJggggggggggGGGGGgwwgggggP",
        "Pggg........ggggggggGGGGGgwwgggggP",
        "Pggg........gggggPggGGGGGgwwgrgggP",
        "Pggggggggg..ggggggggGGGGGgwwgggggP",
        "PggPgggggg............ggggwwgPgggP",
        "Pggggggugg............ggggwwgggggP",
        "PgggggPggg..gggggggggggPggwwgggggP",
        "Pgggoggggg..ggPgggggggogggwwgggggP",
        "wwwwwwwwwwhhwwwwwwwwwwwwwwwwgggggP",
        "wwwwwwwwwwhhwwwwwwwwwwwwwwwwgggggP",
        "PgPggggggg..gggggggggggogggggggggP",
        "Pggggggggg..ggPggggggggggPgggggPgP",
        "PgGGGGGGGG..gPgggggggggggggggggggP",
        "PgGGGGGGGG..ggggggggggGGGGGGGGGggP",
        "PgGGGGGGGG........ggggGGGGGGrGGggP",
        "PgGGGGGGGG........ggggGGGGGGGGGggP",
        "PgGGGGGGGGgggggg..ggggGGGGGGGGGggP",
        "PgggggggPggggggg..gPggGGGGGGGGGggP",
        "PggggPgggggggggg..gggggggggggggggP",
        "PPPPPPPPPPPPPPPP..PPPPPPPPPPPPPPPP"
      ]
    },
    // the cliff road: a walkway of planks up the cliff, over a sea of clouds. Gusts of wind blow across it (wind vents: wait
    // till it drops), loose planks hang by chains (hop onto the one with the word's picture), and a chain hangs down a sheer
    // face to climb (a question a pull). A crane stands by a pool where the stream runs over a ledge.
    cliffRoad: {
      name: {zh:'栈道', py:'zhàndào', en:'The cliff road'},
      music: 'cave',
      clouds: true,
      onMap: [176, 18],
      sounds: ['wind'],
      exits: [
        {at:[10, 33], to:'mountainFoot', arrive:[20, 1], facing:'down'},
        {at:[11, 33], to:'mountainFoot', arrive:[21, 1], facing:'down'},
        {at:[11, 0], to:'pillars', arrive:[14, 22], facing:'up'},
        {at:[12, 0], to:'pillars', arrive:[15, 22], facing:'up'}
      ],
      legend: CLIMB_LEGEND,
      map: [
        "RRRRRRRRRRRkkRRssRRRRRRR",
        "RRRRRRRRRRRkkRRssRRRRRRR",
        "RRRRRRRRRRRkkRRssRRRRRRR",
        "RRRRRRRRRRkkkkksskkkkkRR",
        "RRRTRRRRRRkkkkksskkkkkRR",
        "RRRRRRRRRRkkkkkHHkkTkkRR",
        "RRRRRRRRRRkkkTksskkkkkRR",
        "RRRRRRRRRRkkkkksskkkkkRR",
        "RRRRRRRRRRkkkkksskkkkkRR",
        "RRRRRRRRRRKKCKKWWKKKKKKK",
        "RRRRRRRRRRKKCKKWWKKKKKKK",
        "RRRRRRTRRRkkkkksskcccccc",
        "RRRRRRRRRRkkTkksskcckTkc",
        "RRRRRRRRRRkkkkksskHHkkkc",
        "RRRRRRRRRRkkkkkHHkcckkkc",
        "RRRRRRRRRRkkkkksskccKKKc",
        "RRRRRRRRRRhhKKKWWKccKKKc",
        "RRTRRRRRRRhhKKKWWKcccccc",
        "RRRRRRRRRRVVcccccccccccc",
        "RRRRRRRRRRVVcccccccccccc",
        "RRRRRRRRRRVVcccccccccccc",
        "RRRRRRRRRRVVcccccccccccc",
        "RRRRRRRTRRjjccccccRTRRcc",
        "RRRRRRRRRRqqccccccRRRRcc",
        "RRRRRRRRRRvvccccccRRRRcc",
        "RRRRTRRRRRwwccccccKKKKcc",
        "RRRRRRRRRRVVccccccKKKKcc",
        "RRRRRRRRRRVVcccccccccccc",
        "KKKKKKKKKKVVcccccccccccc",
        "KKKKKKKKKKVVcccccccccccc",
        "kkkkkkkkkkkkkkkkcccccccc",
        "kkkkkTkkkkkkkkkkcccccccc",
        "kkkkkkkkkkkkkTkkcccccccc",
        "kkkkkkkkkkkkkkkkcccccccc"
      ]
    },
    // the stone pillars, at the top: chain bridges between them, the mist rolling in now and then; peaches in blossom and
    // fruit at once; the mountain's tablet (灵台方寸山); the cave's stone door in the great cliff (斜月三星洞), where a boy
    // opens it and asks who you are
    pillars: {
      name: {zh:'石林', py:'shílín', en:'The stone pillars'},
      music: 'cave',
      clouds: true,
      mist: true,
      onMap: [146, 18],
      sounds: ['wind', 'birds'],
      exits: [
        {at:[14, 23], to:'cliffRoad', arrive:[11, 1], facing:'down'},
        {at:[15, 23], to:'cliffRoad', arrive:[12, 1], facing:'down'},
        {at:[14, 5], to:'cave', arrive:[14, 20], facing:'up', by:'A', label:'Go in', if:{door:{atLeast:2}}},   // (in through the open doors)
        {at:[15, 5], to:'cave', arrive:[15, 20], facing:'up', by:'A', label:'Go in', if:{door:{atLeast:2}}}
      ],
      legend: CLIMB_LEGEND,
      map: [
        "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR",
        "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR",
        "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR",
        "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR",
        "KKKKKKKKKKKKKDDDDKKKKKKKKKKKKK",
        "KKKKKKKKKKKKKDDDDKKKKKKKKKKKKK",
        "ccccccccccckkkkkkkkccccccccccc",
        "ccccccccccckkkkkkkkccccccccccc",
        "ccccccccccckkTkkkkkccccccccccc",
        "cckkkkkkccckkkkkkkkccckkkkkkcc",
        "cckQkkkkHHHkkkkkkkkccckkkTkkcc",
        "ccZkkkkkHHHkkkkkkTkHHHkkkkkkcc",
        "cckkkkQkccckXkkkkkkHHHkkkkkZcc",
        "cckkQkkkccckkkkkkkkccckTkkkkcc",
        "cckkkkkkcccKKKVVKKKccckkkkkkcc",
        "ccKKKKKKcccKKKVVKKKcccKKVVVKcc",
        "ccKKKKKKccccccVVccccccKKVVVKcc",
        "ccccccccccccccVVccccccccVVVccc",
        "cRTRRccccccckkkkkkccccccVVVccc",
        "cRRRRccccccckkkkkkccccccVVVccc",
        "cRRRRccccccckkkkkkccccckkkkkcc",
        "cKKKKccccccckTkkkkccccckkkTZcc",
        "cKKKKccccccckkkkkkccccckkkkkcc",
        "cccccccccccckkkkkkcccccKKKKKcc"
      ]
    },
    // the cave behind the stone door, by day, and by night; and the master's room, behind his back door
    cave: {
      backdrop: [{if:{season:3, grown:0}, is:'courtyardSnow'}, {is:'courtyard'}],   // (for a friendly match in the courtyard: under snow in winter)
      name: {zh:'斜月三星洞', py:'Xiéyuè Sānxīng Dòng', en:'Cave of the Slanting Moon and Three Stars'},
      music: 'cave',
      onMap: [116, 18],
      sounds: ['wind', 'birds'],
      exits: [
        {at:[14, 21], to:'pillars', arrive:[14, 6], facing:'down'},
        {at:[15, 21], to:'pillars', arrive:[15, 6], facing:'down'}
      ],
      legend: CAVE_LEGEND,
      plaques: [{at:[4, 3], text:'孙悟空', if:{wrote:1}}],   // (your name over your room's door, once you've written it, autumn)
      fires: [{at:[14, 11], if:{fire:2, season:3, grown:0}}],   // (the fire in the brazier, winter)
      lanterns: [{at:[11, 5], if:{season:3, bigMatch:1, grown:0}}, {at:[17, 5], if:{season:3, bigMatch:1, grown:0}}],   // (red lanterns for New Year's Eve)
      map: CAVE_MAP.slice()
    },
    caveNight: {
      name: {zh:'斜月三星洞', py:'Xiéyuè Sānxīng Dòng', en:'Cave of the Slanting Moon and Three Stars'},
      music: 'cave',
      night: true,
      noMap: 'It’s too dark to read your map!',
      exits: [
        {at:[19, 3], to:'masterRoom', arrive:[4, 5], facing:'up', by:'A', label:'Go in', if:{knows:'星星'}}
      ],
      legend: {...CAVE_LEGEND, ...CAVE_NIGHT},
      plaques: [{at:[4, 3], text:'孙悟空', if:{wrote:1}}],
      map: CAVE_MAP.slice()
    },
    masterRoom: {
      name: {zh:'师父的房间', py:'shīfu de fángjiān', en:'The master’s room'},
      indoors: true,   // (no rain in here: js/daynight.js)
      music: 'cave',
      noMap: 'Not now: the master is waiting!',
      exits: [
        {at:[4, 6], to:'caveNight', arrive:[19, 4], facing:'down'}
      ],
      legend: {'Z':{look:'caveWall'}, 'z':{look:'caveFloor', walk:true}, 'D':{look:'stoneBed', word:'床', landmark:true}, 'A':{look:'stoneTable', word:'桌子', landmark:true}},
      map: [
        "ZZZZZZZZZ",
        "ZzDDzzAzZ",
        "ZzzzzzzzZ",
        "ZzzzzzzzZ",
        "ZzzzzzzzZ",
        "ZzzzzzzzZ",
        "ZZZZzZZZZ"
      ]
    },
    // chapter 2: home, as you left it (Flower Fruit Mountain's places, borrowed: AT_HOME), with squares of its own: the
    // bushes the troop hides behind, the feast's tables, bare, and your cloud
    ffmMeadow: AT_HOME('meadow', {put:[[2, 10, 'あ']], legend:{'あ':HIDING('foundBig', 'big', 2, 10, {knows:'哭'})}}),
    ffmPath: AT_HOME('path'), ffmValley: AT_HOME('valley'), ffmFalls: AT_HOME('falls'), ffmCave: AT_HOME('cave', {indoors:true, legend:{'D':HOME_BED}}),
    ffmHomeGround: AT_HOME('homeGround', {
      put:[[3, 12, 'い'], [13, 12, 'え'], [12, 7, 'エ'], [13, 7, 'オ'], [14, 7, 'カ'], [15, 7, 'キ'], [16, 7, 'ア'], [17, 7, 'ア'], [18, 7, 'ア'], [21, 7, 'イ'], [22, 7, 'イ'], [23, 7, 'イ'], [24, 7, 'ク']],
      legend:{'い':HIDING('foundHungry', 'hungry', 3, 12, {foundBig:1}),
        'え': {look:'grass', walk:true, becomes:[{if:{north:1, homeAgain:0}, to:'ぇ'}]},
        'ぇ': {look:'cloudGrass', landmark:true, onLook:[{label:'Fly north', do:[{scene:'flyNorth'}, {goTo:'lair', at:[14, 18], facing:'up'}]}]},
        'ア':ROBBED('feastTableRobbed', '*', [5, 4, 3, 2].map(k => ({if:{unload:{atLeast:k}}, to:'サシスセ'[k - 2]})), 'big'),
        'イ':ROBBED('milkTableBare', ']', [{if:{unload:{atLeast:6}}, to:'ソ'}], 'milk'),
        'サ':BACK_ON('tableBack1', 'big'), 'シ':BACK_ON('tableBack2', 'big'), 'ス':BACK_ON('tableBack3', 'big'), 'セ':BACK_ON('tableBack4', 'big'), 'ソ':BACK_ON('milkTableJug', 'milk'),
        'エ':ROBBED('fruitTableL', 'λ'), 'オ':ROBBED('fruitTableM', 'π'), 'カ':ROBBED('fruitTableR', 'Φ'),
        'キ':ROBBED('tableBlock', 'Щ'), 'ク':ROBBED('tableBlock', 'Ш')}}),
    ffmShore: AT_HOME('shore'), ffmHillside: AT_HOME('hillside'), ffmRiverside: AT_HOME('riverside'), ffmFlowerValley: AT_HOME('flowerValley'),
    ffmSouthSlope: AT_HOME('southSlope'), ffmCliffs: AT_HOME('cliffs'), ffmHotSprings: AT_HOME('hotSprings'), ffmMelonField: AT_HOME('melonField'),
    ffmDarkPines: AT_HOME('darkPines'), ffmPasture: AT_HOME('pasture'), ffmPineWood: AT_HOME('pineWood'), ffmSchool: AT_HOME('school', {indoors:true}), ffmSportsGround: AT_HOME('sportsGround'),
    // the demon's mountain, far to the north (坎源山)
    lair: {
      name: {zh:'坎源山', py:'Kǎnyuán Shān', en:'The demon’s mountain'},
      music: 'pineWood', battleMusic: 'pineBattle',
      gloom: {deep:.42, open:.14, mist:false, eyes:false, beams:false},   // (gloomy, with no sunbeams)
      noMap: 'You’re far from home, and your map is of the lands across the sea.',
      sounds: ['wind', 'crow'],
      legend: LAIR_LEGEND,
      map: LAIR_MAP
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
      {if:{knows:'门', knock:0}, label:'Knock', do:[{sound:'tock'}, {sound:'tock'}, {say:'whoIsIt', by:'auntie', teach:'谁'}, {newWord:'谁', note:'Someone behind the gate wants to know who’s there.'},
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
    'Ж': {look:'coatOnSand', landmark:true, onLook:[{if:{dressed:0}, label:'Pick up', do:[{newWord:'衣服', note:'The old man’s coat: you put it on!'},
      {wear:'衣服'}, {change:'s'}, {set:{dressed:1}}, {message:'You put on the coat. But people would still know you’re a monkey…'}]}]},
    'З': {look:'hatOnSand', landmark:true, onLook:[{if:{dressed:1}, label:'Pick up', do:[{newWord:'帽子', note:'A straw hat: you put it on, and it hides your ears!'},
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
    {id:'bunSeller', place:'town', person:true, hair:'topknot', wear:'apron', x:4, y:10, facing:'down', calls:'callBuns', nightCalls:'callTofu', name:{zh:'老板', py:'lǎobǎn', en:'Stallholder'},
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
    // winter in the master's year, on your way to the fishing village: children out in the snow, who want a snowball fight
    {id:'snowKid1', place:'town', person:true, small:true, hair:'pigtails', x:30, y:6, facing:'left', name:{zh:'小孩', py:'xiǎohái', en:'Child'},
      moves:[{if:{any:[{season:{below:3}}, {trip:0}, {trip:{atLeast:5}}, {grown:1}]}, place:'hut', x:0, y:0}],
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#C0504D', b:'#3A2A1E', p:'#3A4A5A'}},
    {id:'snowKid2', place:'fields', person:true, small:true, hair:'topknot', x:30, y:7, facing:'down', name:{zh:'小孩', py:'xiǎohái', en:'Child'},
      moves:[{if:{any:[{season:{below:3}}, {trip:0}, {trip:{atLeast:5}}, {grown:1}]}, place:'hut', x:0, y:0}],
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#3E5A86', b:'#3A2A1E', p:'#5A4632'}},
    {id:'granny2', place:'town', person:true, hair:'bun', x:21, y:14, facing:'left', name:{zh:'老奶奶', py:'lǎo nǎinai', en:'Granny'}, palette:{o:'#3A2A1E', h:'#E8E8E8', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#4A6E8A', b:'#3A2A1E', p:'#3A3446'}},
    {id:'caller', place:'town', person:true, wear:'apron', x:27, y:10, facing:'down', calls:'callFruit', name:{zh:'老板', py:'lǎobǎn', en:'Stallholder'}, palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#B5462E', b:'#3A2A1E', p:'#3A3446'}},
    // the harbour: a docker loading the big boat
    {id:'docker', place:'harbour', person:true, wear:'vest', x:11, y:6, facing:'down', name:{zh:'工人', py:'gōngrén', en:'Docker'}, palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E0B088', e:'#1E140C', m:'#C4826A', c:'#8A7A5A', b:'#3A2A1E', p:'#3A3446', a:'#D9B866', d:'#A88A3E'}},
    // the harbour: the boatman, by his big boat, and a goose on the sand
    {id:'boatman', place:'harbour', person:true, wear:'vest', x:17, y:16, facing:'right', name:{zh:'船夫', py:'chuánfū', en:'Boatman'},
      moves:[{if:{trip:2}, place:'shore', x:18, y:14, facing:'up'}],   // (the winter trip: waiting on the beach below the village, to sail you back)
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E0B088', e:'#1E140C', m:'#C4826A', c:'#4A5A7A', b:'#3A2A1E', p:'#2A303A', a:'#D9B866', d:'#A88A3E'}},
    {id:'harbourGoose', place:'harbour', look:'鹅', x:28, y:9, facing:'left'},
    // the far shore: the woodcutter, singing as he chops wood
    {id:'woodcutter', place:'farShore', person:true, beard:true, wear:'vest', x:9, y:10, facing:'left', name:{zh:'樵夫', py:'qiáofū', en:'Woodcutter'},
      moves:[{if:{song:1}, place:'mountainFoot', x:10, y:4, facing:'left'}],   // (home to his hut at the foot of the mountain, once he's sung you his song)
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E0B088', e:'#1E140C', m:'#C4826A', c:'#6E5B3A', b:'#3A2A1E', p:'#3A3226', a:'#D9B866', d:'#A88A3E'}},
    // the cave's door, among the stone pillars: a boy, the immortal's pupil, behind the stone doors till they open (in the hut)
    {id:'doorBoy', place:'pillars', person:true, small:true, hair:'topknot', wear:'robe', x:15, y:6, facing:'down', name:{zh:'仙童', py:'xiāntóng', en:'The immortal’s boy'},
      moves:[{if:{door:0}, place:'hut', x:1, y:0}, {if:{door:{atLeast:2}}, place:'cave', x:13, y:16, facing:'down'}],   // (then inside, by the way in)
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#E8E4D8', b:'#4F78A8', p:'#E8E4D8'}},
    // the cave: the master (in his room behind the back door, from his riddle till he's taught you to change), his pupils
    {id:'master', place:'cave', person:true, beard:true, hair:'topknot', wear:'robe', x:14, y:5, facing:'down', name:{zh:'师父', py:'shīfu', en:'The master'},
      moves:[{if:{riddle:{atLeast:1, below:3}}, place:'masterRoom', x:4, y:2, facing:'down'}],
      palette:{o:'#3A2A1E', h:'#F2F2EE', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#E8E4D8', b:'#6A5A8A', p:'#C8C2B0'}},
    {id:'spyPupil', place:'cave', person:true, hair:'bun', wear:'robe', x:9, y:9, facing:'right', name:{zh:'师姐', py:'shījiě', en:'A pupil'},
      moves:[{if:{season:3, fire:2, grown:0}, place:'cave', x:13, y:11, facing:'right'}],   // (winter: warming her hands at the fire)
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#8FA86E', b:'#3A2A1E', p:'#5A6A44'}},
    {id:'senior', place:'cave', person:true, hair:'topknot', wear:'robe', x:18, y:9, facing:'left', name:{zh:'大师兄', py:'dà shīxiōng', en:'The senior pupil'},
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#E0B088', e:'#1E140C', m:'#C4826A', c:'#6E8FA8', b:'#3A2A1E', p:'#44586A'}},
    {id:'darePupil', place:'cave', person:true, hair:'topknot', wear:'robe', x:12, y:13, facing:'up', name:{zh:'师兄', py:'shīxiōng', en:'A pupil'},
      moves:[{if:{season:3, fire:2, grown:0}, place:'cave', x:15, y:11, facing:'left'}],
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#A88F6E', b:'#3A2A1E', p:'#6A5A44'}},
    {id:'pupil4', place:'cave', person:true, hair:'scarf', wear:'robe', x:20, y:14, facing:'left', name:{zh:'师弟', py:'shīdì', en:'A pupil'},
      moves:[{if:{season:3, fire:2, grown:0}, place:'cave', x:14, y:12, facing:'up'}],
      palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#8F6EA8', b:'#3A2A1E', p:'#5A446A', k:'#6E8FA8'}},
    // summer in the master's year: two pupils cooling off in the pool, in up to their shoulders, as monkeys in a hot spring
    {id:'bather1', place:'cave', person:true, hair:'topknot', wear:'robe', x:22, y:5, facing:'down', plays:'bathe', name:{zh:'师弟', py:'shīdì', en:'A pupil'},
      moves:[{if:{any:[{season:{atLeast:2}}, {season:0}, {grown:1}, {chapter:{below:1}}, {chapter:{atLeast:2}}]}, place:'hut', x:2, y:0}], palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#6E9A8F', b:'#3A2A1E', p:'#44655E'}},
    {id:'bather2', place:'cave', person:true, hair:'bun', wear:'robe', x:25, y:6, facing:'left', plays:'bathe', name:{zh:'师妹', py:'shīmèi', en:'A pupil'},
      moves:[{if:{any:[{season:{atLeast:2}}, {season:0}, {grown:1}, {chapter:{below:1}}, {chapter:{atLeast:2}}]}, place:'hut', x:7, y:0}], palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#C98A6E', b:'#3A2A1E', p:'#7A5444'}},
    // after seven years: new little pupils, who call you 师兄 (senior brother)
    {id:'little1', place:'cave', person:true, small:true, hair:'topknot', x:7, y:11, facing:'right', name:{zh:'小师弟', py:'xiǎo shīdì', en:'A little pupil'},
      moves:[{if:{grown:0}, place:'hut', x:3, y:0}], palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#E8A33C', b:'#3A2A1E', p:'#5A4632'}},
    {id:'little2', place:'cave', person:true, small:true, hair:'pigtails', x:16, y:14, facing:'up', name:{zh:'小师妹', py:'xiǎo shīmèi', en:'A little pupil'},
      moves:[{if:{grown:0}, place:'hut', x:4, y:0}], palette:{o:'#3A2A1E', h:'#2A1E16', s:'#F2C9A0', e:'#1E140C', m:'#C4826A', c:'#D86A8A', b:'#3A2A1E', p:'#5A4632'}},
    // chapter 2: home, twenty years on. The troop, older and greyer (the old monkey white, with a walking stick), hiding
    // from the little demons (in the hut till you find them; the old monkey and two others in the Water Curtain Cave); the
    // little ones the little demons took, locked in cages on the demon's mountain till you set them free, then at home by
    // their mothers (small: drawn smaller); your old friend the little monkey, grown up, crying for hers in the meadow
    {id:'mother', place:'ffmMeadow', x:12, y:5, facing:'down', name:{zh:'小猴子', py:'xiǎo hóuzi', en:'Little monkey'},
      moves:[{if:{homeAgain:1}, place:'ffmHomeGround', x:10, y:11, facing:'right'}], palette:{o:'#4D3422', f:'#C1945E', s:'#F4D4AF', m:'#C69372', e:'#24160C'}},
    {id:'big', place:'ffmHomeGround', x:5, y:11, facing:'right', name:{zh:'大猴子', py:'dà hóuzi', en:'Big monkey'},
      moves:[{if:{foundBig:0}, place:'hut', x:5, y:0}, {if:{news:0}, place:'ffmMeadow', x:2, y:11, facing:'right'}], palette:{o:'#4F3929', f:'#B19473', s:'#F3DCC2', m:'#CA9E83', e:'#24160C'}},
    {id:'hungry', place:'ffmHomeGround', x:4, y:12, facing:'right', name:{zh:'饿猴子', py:'è hóuzi', en:'Hungry monkey'},
      moves:[{if:{foundHungry:0}, place:'hut', x:6, y:0}, {if:{homeAgain:1}, place:'ffmHomeGround', x:20, y:8, facing:'down'}], palette:{o:'#4F3929', f:'#B08C6B', s:'#F0CFAE', m:'#C29374', e:'#24160C'}},   // (by the cart and the feast's tables, once you're home with it)
    // the 老板, home again at his stall once the Demon of Havoc is beaten (js/trade.js: decided 9 November 2026, the trade plan)
    {id:'boss', place:'ffmHomeGround', x:7, y:8, facing:'down', name:{zh:'老板', py:'lǎobǎn', en:'Shop owner'},
      moves:[{if:{homeAgain:0}, place:'hut', x:12, y:0}], palette:{o:'#4F3929', f:'#B59069', s:'#F1D2B2', m:'#C49678', e:'#24160C'}},
    {id:'elder', place:'ffmCave', x:7, y:9, facing:'down', beard:true, holds:'棍子', name:{zh:'老猴子', py:'lǎo hóuzi', en:'Old monkey'},
      moves:[{if:{news:1, place:'ffmHomeGround'}, place:'ffmHomeGround', x:16, y:8, facing:'down'}],   // (out of the cave once he's told you the news, when you're at the home ground)
      palette:{o:'#6E6A62', f:'#E4E2DC', s:'#EADCC8', m:'#B89E86', e:'#222222', w:'#FAFAF5'}},
    {id:'troopA', place:'ffmCave', x:4, y:9, facing:'right', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      moves:[{if:{homeAgain:1}, place:'ffmHomeGround', x:12, y:12, facing:'right'}], palette:{o:'#4F3929', f:'#B59069', s:'#F1D2B2', m:'#C49678', e:'#24160C'}},
    {id:'troopB', place:'ffmCave', x:10, y:8, facing:'left', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      moves:[{if:{homeAgain:1}, place:'ffmHomeGround', x:9, y:11, facing:'left'}], palette:{o:'#483524', f:'#A88569', s:'#EDCEAB', m:'#BE8C71', e:'#24160C'}},
    {id:'trainee', place:'ffmHomeGround', x:2, y:11, facing:'right', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      moves:[{if:{stickGiven:1}, place:'hut', x:8, y:0}, {if:{homeAgain:0}, place:'ffmCave', x:12, y:10, facing:'left'}], palette:{o:'#4A2C17', f:'#C98A42', s:'#F6D2A8', m:'#C98E6A', e:'#24160C'}},
    {id:'traineeStick', place:'ffmHomeGround', x:2, y:12, facing:'right', holds:'棍子', practises:true, name:{zh:'猴子', py:'hóuzi', en:'Monkey'},   // (once you've given it your stick)
      moves:[{if:{stickGiven:0}, place:'hut', x:9, y:0}], palette:{o:'#4A2C17', f:'#C98A42', s:'#F6D2A8', m:'#C98E6A', e:'#24160C'}},
    {id:'baby1', place:'ffmHomeGround', x:11, y:11, facing:'left', small:true, name:{zh:'小猴子', py:'xiǎo hóuzi', en:'Little monkey'},
      moves:[{if:{freed1:0}, place:'hut', x:10, y:0}, {if:{homeAgain:0}, place:'lair', x:4, y:4, facing:'down'}], palette:{o:'#4A2C17', f:'#D9A050', s:'#F8DAB4', m:'#C98E6A', e:'#24160C'}},
    {id:'baby2', place:'ffmHomeGround', x:6, y:11, facing:'left', small:true, name:{zh:'小猴子', py:'xiǎo hóuzi', en:'Little monkey'},
      moves:[{if:{freed2:0}, place:'hut', x:11, y:0}, {if:{homeAgain:0}, place:'lair', x:6, y:4, facing:'down'}], palette:{o:'#4A2C17', f:'#CC8D45', s:'#F6D2A8', m:'#C98E6A', e:'#24160C'}},
    {id:'baby3', place:'ffmHomeGround', x:5, y:12, facing:'left', small:true, name:{zh:'小猴子', py:'xiǎo hóuzi', en:'Little monkey'},
      moves:[{if:{freed3:0}, place:'hut', x:12, y:0}, {if:{homeAgain:0}, place:'lair', x:8, y:4, facing:'down'}], palette:{o:'#40250F', f:'#B8743E', s:'#F2C9A0', m:'#C68A64', e:'#24160C'}},
    {id:'baby4', place:'ffmHomeGround', x:13, y:12, facing:'left', small:true, name:{zh:'小猴子', py:'xiǎo hóuzi', en:'Little monkey'},
      moves:[{if:{freed4:0}, place:'hut', x:13, y:0}, {if:{homeAgain:0}, place:'lair', x:4, y:7, facing:'right'}], palette:{o:'#4A2C17', f:'#E0A858', s:'#F8DAB4', m:'#C98E6A', e:'#24160C'}},
    {id:'baby5', place:'ffmHomeGround', x:8, y:11, facing:'right', small:true, name:{zh:'小猴子', py:'xiǎo hóuzi', en:'Little monkey'},
      moves:[{if:{freed5:0}, place:'hut', x:14, y:0}, {if:{homeAgain:0}, place:'lair', x:8, y:7, facing:'left'}], palette:{o:'#40250F', f:'#A8673A', s:'#EFC79C', m:'#C08060', e:'#24160C'}},
    {id:'cow', place:'ffmHomeGround', look:'牛', x:26, y:12, facing:'left'},   // (inside the pen, leaving its gateway clear: decided 6 November 2026)
    {id:'calf', place:'ffmHomeGround', look:'牛', small:true, x:25, y:13, facing:'up'},   // (born while you were away)
    // the little demons left on the home ground (till you've chased each off), and on the demon's mountain, the guards at his
    // cave's door and the Demon of Havoc himself (in the hut till he comes out, and once he's run off for good)
    {id:'d1', place:'ffmHomeGround', look:'妖怪', x:4, y:9, facing:'left', name:{zh:'小妖', py:'xiǎoyāo', en:'Little demon'}, moves:[{if:{news:0}, place:'hut', x:15, y:0}, {if:{d1:1}, place:'hut', x:15, y:0}]},
    {id:'d2', place:'ffmHomeGround', look:'妖怪', x:14, y:10, facing:'left', name:{zh:'小妖', py:'xiǎoyāo', en:'Little demon'}, moves:[{if:{news:0}, place:'hut', x:16, y:0}, {if:{d2:1}, place:'hut', x:16, y:0}]},
    {id:'d3', place:'ffmHomeGround', look:'妖怪', x:24, y:9, facing:'left', name:{zh:'小妖', py:'xiǎoyāo', en:'Little demon'}, moves:[{if:{news:0}, place:'hut', x:17, y:0}, {if:{d3:1}, place:'hut', x:17, y:0}]},
    {id:'guard', place:'lair', look:'妖怪', x:13, y:4, facing:'down', name:{zh:'小妖', py:'xiǎoyāo', en:'Little demon'}, moves:[{if:{loot:{atLeast:1}}, place:'hut', x:18, y:0}]},
    {id:'guard2', place:'lair', look:'妖怪', x:16, y:4, facing:'down', name:{zh:'小妖', py:'xiǎoyāo', en:'Little demon'}, moves:[{if:{loot:{atLeast:1}}, place:'hut', x:19, y:0}]},
    {id:'king', place:'lair', look:'混世魔王', x:14, y:5, facing:'down', name:{zh:'混世魔王', py:'Hùnshì Mówáng', en:'The Demon of Havoc'},
      moves:[{if:{king:0}, place:'hut', x:20, y:0}, {if:{king:2}, place:'hut', x:20, y:0}, {parked:true}]},   // (where he walked down to, out of his cave)
    // the cart of the troop's things, over on the right of the demon's mountain, and the little demon guarding it (in the hut
    // once it's run off); the cart wherever you pulled it to, by the little monkeys, then at home by the feast's tables
    {id:'cartGuard', place:'lair', look:'妖怪', x:24, y:6, facing:'down', name:{zh:'小妖', py:'xiǎoyāo', en:'Little demon'},
      moves:[{if:{cartWon:1}, place:'hut', x:21, y:0}, {if:{loot:{atLeast:1}}, place:'hut', x:21, y:0}]},
    {id:'cart', place:'lair', cart:true, label:'Look', x:24, y:5, facing:'left', name:{zh:'车', py:'chē', en:'Cart'},   // (A at it: Look, but where its talk says Pull or Take)
      moves:[{if:{homeAgain:1}, place:'ffmHomeGround', x:19, y:8, facing:'down'}, {parked:true, if:{cartWon:1}}, {if:{loot:{atLeast:1}}, place:'lair', x:10, y:6, facing:'left'}]}
  ],
  yourNames: [{if:{named:1}, zh:'孙悟空', py:'Sūn Wùkōng', en:'Sun Wukong (you)'}, {if:{}, zh:'美猴王', py:'Měi Hóuwáng', en:'Handsome Monkey King (you)'}],

  // (no sign of its own: the human world's signs are the stalls' and the teahouse's)
  sign: {name:{zh:'牌子', py:'páizi', en:'Sign'}, says:{zh:'海', en:'The sea'}, hint:''},
  spots: [],
  bigSparkles: {dressed:0},
  sparkles: [
    {word:'云', at:[16, 31, 'cliffRoad']}, {word:'月亮', at:[23, 7, 'caveNight']}, {word:'星星', at:[19, 3, 'caveNight']},
    {word:'衣服', at:[23, 10]}, {word:'帽子', at:[30, 13]},
    {word:'井', at:[22, 11, 'village'], if:{knows:'什么'}}, {word:'房子', at:[9, 2, 'village'], if:{knows:'什么'}},
    {word:'门', at:[31, 4, 'village'], if:{knows:'什么'}},
    {word:'网', at:[10, 8], if:{knows:'什么'}}, {word:'船', at:[26, 17], if:{knows:'什么'}},
    {word:'书', at:[16, 3, 'town'], if:{knows:'什么'}},
    // chapter 2: the troop's hiding places; the torches; the cages, and once you have the key, those still locked; the
    // boulder to hide behind
    {at:[2, 10, 'ffmMeadow'], if:{knows:'哭', foundBig:0}}, {at:[3, 12, 'ffmHomeGround'], if:{foundBig:1, foundHungry:0}},
    {word:'火', at:[12, 4, 'lair']}, {word:'笼子', at:[6, 5, 'lair'], if:{knows:'救命'}},
    {at:[4, 5, 'lair'], if:{key:1, freed1:0}}, {at:[6, 5, 'lair'], if:{key:1, freed2:0}}, {at:[8, 5, 'lair'], if:{key:1, freed3:0}},
    {at:[5, 7, 'lair'], if:{key:1, freed4:0}}, {at:[7, 7, 'lair'], if:{key:1, freed5:0}},
    {at:[12, 11, 'lair'], if:{knows:'钥匙', key:0, form:null}},
    {word:'车', at:[24, 5, 'lair'], if:{freed:5}}
  ],
  // Where you found each word, on its page in the Word Scroll.
  found: {
    '多少钱': 'You asked the fruit seller in the town how much her apples were.',
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
    '米饭': 'The granny’s lunch: 吃米饭吧！',
    '米': 'The docker’s sacks of rice, at the harbour.',
    '钱': 'The fisherman paid you for a fish.',
    '网': 'The fishermen’s nets, drying on the shore.',
    '船': 'The fishermen’s boats, on the shore.',
    '看': 'The farmer, showing you the birds in his rice: 你看！',
    '狗': 'Guarding the road through the fields.',
    '包子': 'The bun stall at the market.',
    '臭豆腐': 'The bun stall at the night market, after dark.',
    '鞋': 'The shoe stall at the market.',
    '茶': 'The teahouse in the town: 喝茶吧！',
    '说': 'The storyteller in front of the teahouse: 我说，你听。',
    '哪里': 'Asking people where the immortals are: 神仙在哪里？',
    '知道': 'Everyone you asked where the immortals are: 我不知道。 (I don’t know.)',
    '听': 'The teacher at the town’s school: 你听！',
    '孩子': 'The children at the town’s school.',
    '学': 'The children learning at the town’s school.',
    '书': 'The books on the table by the town’s school.',
    '猫': 'On the sacks at the market.',
    '飞蛾': 'Round a lamp at the night market, after dark.',
    '风': 'The boatman at the harbour, waiting for the wind.',
    '歌': 'The woodcutter’s song, on the far shore.',
    '云': 'The sea of clouds under the cliff road, on the teacher’s mountain.',
    '鹤': 'By the pool on the cliff road, on the teacher’s mountain.',
    '天': 'The open sky over the stone pillars, at the top of the teacher’s mountain.',
    '师父': 'The master, in the Cave of the Slanting Moon and Three Stars.',
    '名字': 'The master asked your name: 你叫什么名字？, and named you 孙悟空.',
    '叶子': 'The fallen leaves in the cave, from the senior pupil.',
    '扫': 'Sweeping the cave’s leaves, for the senior pupil.',
    '桶': 'The senior pupil’s bucket, to water your little tree in the spring.',
    '斧头': 'The senior pupil’s axe, to chop wood.',
    '头': 'The master’s riddle: three taps on your head.',
    '月亮': 'The slanting moon, shining in the cave’s pool at night.',
    '星星': 'The three stars over the master’s back door, at night.',
    '变': 'The master’s secret, at night in his room: changing into things.',
    '飞': 'The master’s cloud somersault.',
    '松树': 'Showing off to the pupils: you changed into a pine tree.',
    '回家': 'The master sent you home: 你回家吧。',
    '春天': 'Spring in the immortal’s cave, as you arrived: the peach trees in blossom.',
    '夏天': 'Waking up in your room in the cave: summer had come.',
    '秋天': 'Waking up in the cave: autumn, the leaves turning red and gold.',
    '冬天': 'Waking up in the cave: winter, and snow on the mountain.',
    // the master's year
    '十一': 'The master’s first class, in spring: a bundle of ten sticks, and one more.', '十二': 'The master’s first class, in spring: a bundle of ten sticks, and two more.',
    '十三': 'The master’s first class, in spring: a bundle of ten sticks, and three more.', '十四': 'The master’s first class, in spring: a bundle of ten sticks, and four more.',
    '十五': 'The master’s first class, in spring: a bundle of ten sticks, and five more.', '十六': 'The master’s first class, in spring: a bundle of ten sticks, and six more.',
    '十七': 'The master’s first class, in spring: a bundle of ten sticks, and seven more.', '十八': 'The master’s first class, in spring: a bundle of ten sticks, and eight more.',
    '十九': 'The master’s first class, in spring: a bundle of ten sticks, and nine more.', '二十': 'The master’s first class, in spring: two bundles of ten sticks.',
    '功夫': 'Morning training with the pupils, in the cave’s courtyard.',
    '热': 'A hot summer’s day in the cave, the pupils training in the sun.',
    '北边': 'The master’s summer class: the hall is to the north.',
    '南边': 'The master’s summer class: the way out is to the south.',
    '药': 'The master’s medicine, made from the lingzhi on the stone pillars.',
    '写': 'Writing your name with a brush, in the autumn.',
    '东边': 'The master’s autumn class: the waterfall is to the east.',
    '西边': 'The master’s autumn class: your tree is to the west.',
    '雪': 'The first snow, as autumn ended in the cave.',
    '冷': 'A cold winter’s day in the cave, everyone shivering.',
    '年': 'The master’s winter class: four seasons make a year.',
    '雪人': 'The snowman you built with the pupils, in the courtyard.',
    '哭': 'Your old friend the little monkey, crying in the meadow as you came home.',
    '回来': 'The big monkey, hiding in the meadow: 你回来了！',
    '好久不见': 'The hungry monkey, hiding at the home ground: 好久不见！',
    '老': 'The old monkey, twenty years on: 我老了。',
    '妖怪': 'The Demon of Havoc’s little demons, on the home ground.',
    '火': 'The fire in the cave’s courtyard, to keep everyone warm in the winter.',
    '新年快乐': 'New Year’s Eve in the cave, with the master and the pupils.',
    '救命': 'The troop’s little ones, locked in cages on the demon’s mountain: 救命！',
    '笼子': 'The cages on the demon’s mountain.',
    '钥匙': 'The key to the cages, on the belt of the guard at the demon’s cave.',
    '毛': 'The hair trick, fighting the Demon of Havoc: your hairs turned into little monkeys.',
    '刀': 'The Demon of Havoc’s broadsword, yours once you’d beaten him.',
    '车': 'The little demons’ cart, piled with the troop’s things, on the demon’s mountain.'
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
    {sentence:'我 不 知道', sentenceEn:'I don’t know.'},
    {sentence:'我们 在 学', sentenceEn:'We’re learning.'},
    {sentence:'你 叫 什么 名字', sentenceEn:'What’s your name?'},
    {sentence:'我 要 回家', sentenceEn:'I want to go home.'},
    {sentence:'我 要 回来', sentenceEn:'I want to come back.'}
  ],
  // Example sentences for words, on their Word Scroll pages.
  examples: {
    '鹅': {zh:'鹅 在 水 里 。', en:'The goose is in the water.'},
    '飞蛾': {zh:'晚上 有 飞蛾 。', en:'There are moths at night.'},   // (a draft, not checked yet)
    '鸡': {zh:'鸡 吃 草 。', en:'Chickens eat grass.'},
    '狗': {zh:'狗 是 我 的 朋友 。', en:'The dog is my friend.'},
    '猫': {zh:'猫 很 小 。', en:'The cat is very small.'},
    '鹤': {zh:'鹤 在 水 里 。', en:'The crane is in the water.'},
    '云': {zh:'山 上 有 云 。', en:'There are clouds on the mountain.'},
    '天': {zh:'天 上 有 鸟 。', en:'There are birds in the sky.'},
    '头': {zh:'这 是 猴子 的 头 。', en:'This is the monkey’s head.'},
    '十一': {zh:'我 有 十一 块 石头 。', en:'I have eleven stones.'},
    '十二': {zh:'树 上 有 十二 个 桃子 。', en:'There are twelve peaches on the tree.'},
    '十三': {zh:'这里 有 十三 个 孩子 。', en:'There are thirteen children here.'},
    '十四': {zh:'我 要 十四 块 木头 。', en:'I need fourteen pieces of wood.'},
    '十五': {zh:'我们 有 十五 个 碗 。', en:'We have fifteen bowls.'},
    '十六': {zh:'天 上 有 十六 只 鸟 。', en:'There are sixteen birds in the sky.'},
    '十七': {zh:'山 上 有 十七 只 羊 。', en:'There are seventeen sheep on the mountain.'},
    '十八': {zh:'我 要 十八 桶 水 。', en:'I need eighteen buckets of water.'},
    '十九': {zh:'这里 有 十九 只 猴子 。', en:'There are nineteen monkeys here.'},
    '二十': {zh:'我们 有 二十 个 桃子 。', en:'We have twenty peaches.'},
    '月亮': {zh:'天 上 有 月亮 。', en:'There’s a moon in the sky.'},
    '星星': {zh:'天 上 有 很多 星星 。', en:'There are lots of stars in the sky.'},
    '妖怪': {zh:'妖怪 来 了 ！', en:'The demons are coming!'},
    '火': {zh:'火 很 大 。', en:'The fire is very big.'},
    '笼子': {zh:'小 猴子 在 笼子 里 。', en:'The little monkey is in the cage.'},
    '毛': {zh:'猴子 有 很多 毛 。', en:'Monkeys have lots of fur.'},
    '刀': {zh:'这 是 我 的 刀 。', en:'This is my broadsword.'},
    '车': {zh:'车 上 有 桃子 。', en:'There are peaches on the cart.'}
  },
  // Chapter 2's battles (as Flower Fruit Mountain's: js/battle.js): the Demon of Havoc's little demons, in home's long grass
  // and the demon's mountain's dry grass; and the Demon of Havoc himself, at his cave's door (a name, not a word to catch:
  // name and pic), a boss fight as the bear's: angry at half his health, then the hair trick (毛) and his broadsword (刀),
  // yours from then on, as the book has it (his stages, each once, at so much of his health left).
  enemies: {
    // the master's year: a friendly match with a pupil, your stick against his staff, in the courtyard (summer)
    bigMatch: {name:{zh:'大师兄', py:'dà shīxiōng', en:'The senior pupil'}, person:'senior', health:60, hits:6, boss:true, bossFight:true, nameCard:true, attacks:['房子', '门', '松树', '天', '桶', '雪人'],
      meet:'The senior pupil bows, and raises his staff. The master is watching.', hide:'The senior pupil leaps out of sight…', attack:'The senior pupil’s staff comes swinging!',
      away:'The senior pupil bows to you. You’ve won the big match!', lost:'The senior pupil helps you up out of the snow. Try again!'},
    spar: {name:{zh:'师兄', py:'shīxiōng', en:'A pupil'}, person:'darePupil', health:30, hits:5, attacks:['房子', '门', '松树', '天', '桶'], meet:'The pupil bows, and raises his staff.',
      hide:'The pupil leaps out of sight…', attack:'The pupil swings his staff at you!', away:'The pupil bows to you, laughing: you win!', lost:'The pupil bows: he wins this time.', reward:0},
    // a little demon: never one you can run from (boss; decided 7 November 2026, after playing it)
    demon: {word:'妖怪', health:30, hits:8, boss:true, attacks:['火', '松树', '叶子', '云', '天'], meetNote:'A little demon jumps out at you, waving its spear!', meet:'A little {妖怪} jumps out at you!',
      hide:'The little {妖怪} ducks out of sight…', attack:'The little {妖怪} jabs at you with its spear!', away:'The little {妖怪} runs off, squealing.', sniff:'The little {妖怪} sniffs the air, holds its nose, and runs off!', reward:2},
    // the little demon guarding the cart of the troop's things: a little tougher than the others
    cartGuard: {word:'妖怪', health:40, hits:8, boss:true, attacks:['火', '松树', '叶子', '云', '天'], meet:'The little {妖怪} guarding the cart jumps at you!',
      hide:'The little {妖怪} ducks behind the cart…', attack:'The little {妖怪} jabs at you with its spear!', away:'The little {妖怪} lets go of the cart.', reward:3},
    king: {name:{zh:'混世魔王', py:'Hùnshì Mówáng', en:'Demon of Havoc'}, pic:'混世魔王', health:80, hits:10, boss:true, bossFight:true, big:true, nameCard:true, song:'boss', cry:'HA HA HA!',
      says:{meet:'notScared', angry:'goAway', beaten:'imGoing'},
      angry:{at:.5, twice:true, note:'The Demon of Havoc swings his great broadsword, angry!', then:'From now on he attacks twice in a row. Listen hard!'},
      stages:[
        {at:.45, do:[{scene:'hairTrick'}, {newWord:'毛', note:'毛 means hair, or fur. You pulled out a handful of your hairs, blew on them and said 变！: they turned into little monkeys!'}],
          note:'Little monkeys swarm all over the Demon of Havoc! He drops his broadsword…'},
        {at:.2, do:[{newWord:'刀', note:'刀 means a broadsword, or a knife. The Demon of Havoc’s own broadsword: you pick it up!'}, {weapon:'刀'}],
          note:'You swing the broadsword! It hits harder than your stick.'}
      ],
      attacks:['火', '松树', '叶子', '云', '天'], meet:'The Demon of Havoc laughs: HA HA HA!', hide:'The Demon of Havoc leaps out of sight…', attack:'The Demon of Havoc swings his broadsword!',
      away:'The Demon of Havoc runs off over the mountains, and never comes back!', lost:'The Demon of Havoc is too strong for you this time.', reward:10}
  },
  battles: {
    when: {knows:'妖怪'},   // (once you've met a little demon: your stick in your hand)
    weapon: '棍子', hits: 10, weapons: {'刀': 15},   // your stick, then the Demon of Havoc's broadsword
    restAt: [
      {if:{place:'lair'}, at:[14, 17, 'lair'], facing:'up', lost:'You’re worn out. You rest at the foot of the path until your health is full again.'},
      {at:[13, 9, 'ffmHomeGround'], facing:'down', lost:'You’re worn out. You crawl back to the home ground and rest under the big tree until your health is full again.'}
    ]
  },
  fish: [[6, 19], [24, 20], [31, 18], [5, 21, 'farShore'], [26, 22, 'farShore'], [30, 9, 'villageLane'], [12, 13, 'fields'], [4, 8, 'canalPath']],
  dragonflies: [{at:[5, 23, 'village'], to:[11, 24]}, {at:[26, 23, 'village'], to:[33, 24]}, {at:[24, 9, 'villageLane'], to:[32, 10]}, {at:[30, 13, 'fields'], to:[37, 14]}],

  // The area's animals, friends to make with their word games, as on Flower Fruit Mountain.
  animals: [
    // when each is about (decided 8 November 2026, the polish plan): the chickens, geese, dog and crane sleep at night (the
    // dog stays up guarding the road till you've made friends: awake), and the cat swaps round, asleep in the sun by day,
    // prowling at night
    {id:'goose', time:'day', word:'鹅', at:[8, 12], roams:['shorePath', 'villageLane'], home:'海', clue:'The shore, on the sand', meetNote:'A goose waddles up to you on the sand, honking. Answer its questions to make friends.'},
    {id:'chicken', time:'day', word:'鸡', at:[6, 16, 'village'], roams:['shorePath', 'villageLane'], home:'草', clue:'The village, in the yard', meetNote:'A chicken pecks about in the yard. Answer its questions to make friends.'},
    {id:'dog', time:'day', awake:{friends:{dog:false}}, word:'狗', at:[36, 9, 'fields'], roams:['villageLane', 'highRoad'], home:'草', clue:'The fields, by the road', meetNote:'A dog guards the road, barking at you! Answer its questions to make friends.'},
    {id:'crane', time:'day', word:'鹤', at:[14, 12, 'cliffRoad'], chapter:1, home:'山', clue:'The teacher’s mountain, by the pool on the cliff road', meetNote:'A crane stands by the pool on one leg. It looks at you, its head on one side. Answer its questions to make friends.'},
    {id:'cat', time:'night', word:'猫', at:[33, 8, 'town'], roams:['highRoad', 'canalPath'], perch:3, home:'房子', clue:'The town, at the market', meetNote:'A cat is curled up on the sacks at the market. Answer its questions to make friends.'},
    // a moth at the night market's lamp, after dark (decided 8 November 2026, the polish plan): it flutters round the bun
    // stall's lantern, lit at night (glows: 'lamp')
    {id:'moth', time:'night', word:'飞蛾', at:[5, 9, 'town'], home:'房子', flutters:true, glows:'lamp', clue:'The town’s market, round a lamp', meetNote:'A moth flutters round the stall’s lamp. Answer its questions to make friends.'}
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
    {id:'townSacks', at:[4, 16, 'town'], fruit:'桃子', note:'In a basket that nobody wants: a {桃子} for your bag!'},
    {id:'footRock', at:[29, 6, 'mountainFoot'], shells:2, note:'Tucked under a rock among the pines: 2 🐚!'},
    {id:'cliffPine', at:[21, 12, 'cliffRoad'], shells:3, note:'In a crack under the pine on the pillar: 3 🐚!'},
    {id:'pillarsPine', at:[26, 21, 'pillars'], fruit:'桃子', note:'Under the pine at the end of the bridge, someone has left a {桃子}!'}
  ],
  animalsAppear: {knows:'动物'},
  // Flower Fruit Mountain's animals at home in chapter 2, as they were there, those you missed to make friends with at last
  // (js/data.js: decided 9 November 2026, the trade plan)
  pastAnimals: {chapter:2},
  animalsPlay: {say:'play', hint:'It wants to play! Answer its questions to make friends.', friendHint:'Your {朋友} wants to play again! Answer its questions.'},
  tips: {},
  questions: ['listen', 'read', 'gap'],

  // Clothes: Flower Fruit Mountain's headbands, and the human world's coat, hat and shoes. on: where it goes, one thing
  // at a time there (the hat or a headband).
  // The old monkey's scroll (js/scrolls.js): in the human world, the master seals a full page; at home, the old monkey again
  scroll: {by:[{who:'master', if:{chapter:1}, say:'veryGood'}, {who:'elder', if:{chapter:2}, say:'veryGood'}], snacks:['包子', '蜂蜜', '桃子']},
  wardrobe: [
    ...FLOWER_FRUIT_MOUNTAIN.wardrobe,
    {item:'衣服', on:'body', sentence:'这 是 我 的 衣服', sentenceEn:'These are my clothes.'},
    {item:'帽子', on:'head', sentence:'我 戴 帽子', sentenceEn:'I wear my hat.', teach:'戴', note:'Use 戴 for things you wear on your head.'},
    {item:'鞋', on:'feet', sentence:'这 是 我 的 鞋', sentenceEn:'These are my shoes.'}
  ],

  lines: {
    hi: {zh:'你好 ！', en:'Hello!'},
    nightNow: {zh:'晚上 了 ， 睡觉 吧 ！', en:'It’s night: time to sleep!'},   // the first night, in a game that hasn't had one (js/daynight.js)
    tooSmelly: {zh:'太 臭 了 ！', en:'It’s so smelly!'},   // you, eating a durian you brought from home, in a game that never ate one there
    raining: {zh:'下 雨 了 ！', en:'It’s raining!'},   // the first rain, and anyone with nothing new to say while it rains
    pouring: {zh:'下 大雨 了 ！', en:'It’s raining hard!'},   // the first heavy rain, for a game that hasn't had one on Flower Fruit Mountain
    rainTooHeavy: {zh:'雨 太 大 了 ！', en:'The rain’s too heavy!'},   // anyone with nothing new to say while it pours
    goodEvening: {zh:'晚上 好 ！', en:'Good evening!'},   // and at night
    grownUp: {zh:'我 长大 了 ！', en:'I’ve grown up!'},
    thanks: {zh:'谢谢 ！', en:'Thank you!'},
    welcome: {zh:'不客气 ！', en:'You’re welcome!'},
    noProblem: {zh:'没关系 ！', en:'It doesn’t matter!'},
    play: {zh:'我们 玩 吧 ！', en:'Let’s play!'},
    whatWant: {zh:'你 要 什么 ？', en:'What do you want?'},   // the peddler on the high road
    // stallholders calling out what they sell, as you walk past (calls): just for listening
    callBuns: {zh:'包子 ！ 包子 ！', en:'Steamed buns! Steamed buns!'},
    callTofu: {zh:'臭豆腐 ！ 臭豆腐 ！', en:'Stinky tofu! Stinky tofu!'},   // (the bun stall at night: the night market)
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
    areYouHungry: {zh:'你 饿 吗 ？ 吃 米饭 吧 ！', en:'Are you hungry? Have some rice!'},
    haveFish: {zh:'你 有 鱼 吗 ？', en:'Do you have a fish?'},
    thisIsMoney: {zh:'这 是 钱 。', en:'Here’s some money.'},
    look: {zh:'你 看 ！ 鸟 ！', en:'Look! Birds!'},
    hungryFarmer: {zh:'我 饿 了 。 你 有 米饭 吗 ？', en:'I’m hungry. Do you have any rice?'},
    isThisCow: {zh:'这 是 牛 吗 ？', en:'Is this a cow?'},
    yes: {zh:'是 ！', en:'Yes!'},
    changeMoney: {zh:'你 要 换 钱 吗 ？', en:'Do you want to change money?'},
    hereMoney: {zh:'这 是 你 的 钱 。', en:'Here’s your money.'},
    whatBuy: {zh:'你 要 买 什么 ？', en:'What do you want to buy?'},
    twoWen: {zh:'两 文 钱 。', en:'Two coins.'},   // the fruit seller, when you ask how much (两 and 文 just for listening: drafts for the native speaker)
    whatSell: {zh:'你 要 卖 什么 ？', en:'What do you want to sell?'},   // whoever buys your treasures (js/trade.js)
    treasureSell: {zh:'宝贝 ！ 你 要 卖 吗 ？', en:'A treasure! Do you want to sell it?'},   // and seeing one for the first time (teaching 卖, to a game that doesn't know it)
    lovely: {zh:'好看 ！', en:'Lovely!'},   // you, at something new set up in the cave at home
    drinkTea: {zh:'喝 茶 吧 ！', en:'Have some tea!'},
    iTalk: {zh:'我 说 ， 你 听 。', en:'I talk, you listen.'},
    whereImmortals: {zh:'神仙 在 哪里 ？', en:'Where are the immortals?'},
    dontKnow: {zh:'我 不 知道 。', en:'I don’t know.'},
    acrossSea: {zh:'神仙 在 海 的 那边 。', en:'The immortals are across the sea.'},   // (the boatman: at last, someone who knows)
    listen: {zh:'你 听 ！', en:'Listen!'},
    theyAreChildren: {zh:'他们 是 孩子 。', en:'They’re children.'},
    childrenLearn: {zh:'孩子 们 在 学 。', en:'The children are learning.'},
    noWind: {zh:'今天 没有 风 。', en:'There’s no wind today.'},
    windCame: {zh:'有 风 了 ！', en:'The wind’s come!'},
    letsGo: {zh:'我们 走 吧 ！', en:'Let’s go!'},
    immortalSong: {zh:'这 是 神仙 的 歌 。', en:'It’s the immortal’s song.'},
    immortalOnMountain: {zh:'神仙 在 山 上 ！', en:'The immortal lives up on the mountain!'},
    // chapter 1: the woodcutter at his hut, who asks for things only in Chinese (fetch-by-word: you bring what he says)
    tired: {zh:'我 累 了 。', en:'I’m tired.'},
    wantWood: {zh:'我 要 三 块 木头 。', en:'I need three pieces of wood.'},
    wantWater: {zh:'我 要 水 。', en:'I need some water.'},
    wantStones: {zh:'我 要 四 块 石头 。', en:'I need four stones.'},
    rightThanks: {zh:'对 ！ 谢谢 ！', en:'That’s right! Thank you!'},
    notRight: {zh:'不 对 。', en:'That’s not right.'},
    goUp: {zh:'你 去 山 上 吧 ！', en:'Go on up the mountain!'},
    // the boy at the cave's door
    masterWaits: {zh:'师父 在 等 你 。', en:'The master is waiting for you.'},
    // the master
    youCame: {zh:'你 来 了 。', en:'You’ve come.'},
    iAmMaster: {zh:'我 是 你 的 师父 。', en:'I’m your master.'},
    whatName: {zh:'你 叫 什么 名字 ？', en:'What’s your name?'},
    noName: {zh:'我 没有 真正 的 名字 。 大家 都 叫 我 美猴王 。', en:'I don’t have a real name. Everyone calls me Handsome Monkey King.'},   // (you're called 美猴王, after all: decided 6 November 2026, after playing it)
    yourName: {zh:'你 叫 孙悟空 。', en:'Your name is Sun Wukong.'},
    oneTwoThree: {zh:'一 ， 二 ， 三 ！', en:'One, two, three!'},
    teachChange: {zh:'我 教 你 变 。', en:'I’ll teach you to change into things.'},
    change: {zh:'变 ！', en:'Change!'},
    knowName: {zh:'你 知道 名字 ， 就 能 变 ！', en:'Know its name, and you can change into it!'},   // the master's secret: what the game is about (a draft for the native speaker)
    teachFly: {zh:'我 教 你 飞 。', en:'I’ll teach you to fly.'},
    goAway: {zh:'你 走 吧 ！', en:'You must leave!'},
    goHome: {zh:'你 回家 吧 。', en:'Go home.'},
    // I spy, with a pupil: what she can see (each said only in Chinese)
    spyTree: {zh:'我 看见 树 ！', en:'I can see a tree!'},
    spyWater: {zh:'我 看见 水 ！', en:'I can see water!'},
    spyPeach: {zh:'我 看见 桃子 ！', en:'I can see peaches!'},
    spyStone: {zh:'我 看见 石头 ！', en:'I can see a stone!'},
    spyWood: {zh:'我 看见 木头 ！', en:'I can see wood!'},
    spyDoor: {zh:'我 看见 门 ！', en:'I can see a door!'},
    spyHouse: {zh:'我 看见 房子 ！', en:'I can see a house!'},
    // the senior pupil's chores
    manyLeaves: {zh:'很多 叶子 ！', en:'So many leaves!'},
    sweepLeaves: {zh:'你 扫 叶子 吧 。', en:'You sweep up the leaves.'},
    thisBucket: {zh:'这 是 桶 。', en:'This is a bucket.'},
    wantWater3: {zh:'我 要 三 桶 水 。', en:'I need three buckets of water.'},
    thisAxe: {zh:'这 是 斧头 。', en:'This is an axe.'},
    wantWood4: {zh:'我 要 四 块 木头 。', en:'I need four pieces of wood.'},
    veryGood: {zh:'很 好 ！', en:'Very good!'},
    // the master's year: his classes, and the pupils' training
    classStart: {zh:'上课 了 ！', en:'Class is starting!'},
    whatNumber: {zh:'这 是 几 ？', en:'What number is this?'},
    thisIsTen: {zh:'这 是 十 。', en:'This is ten.'},
    kungfu: {zh:'我们 学 功夫 。', en:'We’re learning kung fu.'},
    yourTree: {zh:'这 是 你 的 树 。', en:'This is your tree.'},
    treeDrink: {zh:'树 要 喝 水 。', en:'The tree needs a drink of water.'},
    letsTrain: {zh:'我们 练 功夫 吧 ！', en:'Let’s practise kung fu!'},
    springHere: {zh:'春天 来 了 ！', en:'Spring is here!'},
    hotToday: {zh:'今天 很 热 ！', en:'It’s very hot today!'},
    coldToday: {zh:'今天 很 冷 ！', en:'It’s very cold today!'},
    hallNorth: {zh:'房子 在 北边 。', en:'The hall is to the north.'},
    doorSouth: {zh:'门 在 南边 。', en:'The way out is to the south.'},
    lookNorth: {zh:'看 北边 ！', en:'Look north!'},
    lookSouth: {zh:'看 南边 ！', en:'Look south!'},
    northCold: {zh:'北边 很 冷 ， 南边 很 热 。', en:'It’s cold in the north, and hot in the south.'},
    spar: {zh:'我们 比武 吧 ！', en:'Let’s have a match!'},
    wantLingzhi: {zh:'我 要 灵芝 。', en:'I need lingzhi.'},
    writeName: {zh:'写 你 的 名字 。', en:'Write your name.'},
    fallsEast: {zh:'瀑布 在 东边 。', en:'The waterfall is to the east.'},
    treeWest: {zh:'你 的 树 在 西边 。', en:'Your tree is to the west.'},
    lookEast: {zh:'看 东边 ！', en:'Look east!'},
    lookWest: {zh:'看 西边 ！', en:'Look west!'},
    homeEast: {zh:'你 的 家 在 东边 。', en:'Your home is in the east.'},
    snowing: {zh:'下 雪 了 ！', en:'It’s snowing!'},
    treeCold: {zh:'你 的 树 很 冷 。', en:'Your tree is cold.'},
    fourSeasons: {zh:'春天 ， 夏天 ， 秋天 ， 冬天 。', en:'Spring, summer, autumn, winter.'},
    thisYear: {zh:'这 是 一 年 。', en:'This is one year.'},
    makeSnowman: {zh:'我们 做 雪人 吧 ！', en:'Let’s make a snowman!'},
    noPeaches: {zh:'冬天 没有 桃子 。', en:'In winter there are no peaches.'},
    wantRiceFish: {zh:'我们 要 米 和 鱼 。', en:'We need rice and fish.'},
    snowballFight: {zh:'我们 打雪仗 吧 ！', en:'Let’s have a snowball fight!'},
    youWon: {zh:'你 赢 了 ！', en:'You won!'},
    iWon: {zh:'我 赢 了 ！', en:'I won!'},
    happyNewYear: {zh:'新年快乐 ！', en:'Happy New Year!'},
    thisMedicine: {zh:'这 是 药 。', en:'This is medicine.'},
    // the pupils
    changePine: {zh:'你 变 松树 吧 ！', en:'Change into a pine tree!'},
    cheer: {zh:'好 ！ 好 ！', en:'Bravo! Bravo!'},
    littleHi: {zh:'师兄 好 ！', en:'Hello, senior brother!'},
    // chapter 2: home, twenty years on
    littleCrying: {zh:'小 猴子 在 哭 。', en:'The little monkey is crying.'},
    myChild: {zh:'我 的 孩子 ……', en:'My little one…'},
    youreBack: {zh:'你 回来 了 ！', en:'You’re back!'},
    longTime: {zh:'好久不见 ！', en:'Long time no see!'},
    iAmOld: {zh:'我 老 了 。', en:'I’ve grown old.'},
    demonNorth: {zh:'混世魔王 在 北边 。', en:'The Demon of Havoc lives in the north.'},
    veryHappy: {zh:'我们 很 快乐 ！', en:'We’re so happy!'},
    forYou: {zh:'给 你 ！', en:'Here you are!'},
    dragonKing: {zh:'海 下面 有 龙王 。', en:'Under the sea, there’s the Dragon King.'},
    // the little demons, and the Demon of Havoc
    ourHome: {zh:'这里 是 我们 的 家 ！', en:'This is our home!'},
    help: {zh:'救命 ！ 救命 ！', en:'Help! Help!'},
    keyHere: {zh:'钥匙 在 这里 。', en:'The key’s here.'},
    notForMonkey: {zh:'你 是 猴子 ！ 走 吧 ！', en:'You’re a monkey! Go away!'},
    notScared: {zh:'我 不 怕 你 ！', en:'I’m not scared of you!'},
    imGoing: {zh:'我 走 了 ！', en:'I’m going!'},
    letsGoHome: {zh:'我们 回家 吧 ！', en:'Let’s go home!'},
    ours: {zh:'这 是 我们 的 ！', en:'This is ours!'},   // the little demon guarding the cart of the troop's things
    // the hungry monkey, wanting each of the troop's things off the cart (with wantPeach and wantApple)
    wantBowls: {zh:'我 要 碗 。', en:'I want the bowls.'},
    wantHoney: {zh:'我 要 蜂蜜 。', en:'I want the honey.'},
    wantMilk: {zh:'我 要 牛奶 。', en:'I want the milk.'}
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
      {if:{child:0}, do:[{say:'whoAreYou'}, {gap:{sentence:'我 是 人', en:'I’m a person.', word:'人', others:['鱼', '鸟', '鹅']}},
        {say:'notPerson', teach:'不'}, {newWord:'不', note:'不 means not.'}, {set:{child:1}}, {message:'The child laughs. They don’t mind that you’re a monkey!'}, {goOn:true}]},
      {if:{child:1}, do:[{say:'play'}, {newWord:'是', note:'是 means is, or yes. 不是 means isn’t, or no.'},
        {isIt:4}, {set:{child:2}}, {message:'The child claps. You’re good at this game!'}, {goOn:true}]},
      {if:{child:2}, do:[{say:'whatsThis', teach:'什么'}, {newWord:'什么', note:'什么 means what. 这是什么？ means What’s this?'}, {set:{child:3}},
        {message:'Now you can ask what things are! Face something that sparkles ✨ with a person near, and press A.'}, {goOn:true}]},
      ...ASK('askChild', {child:3}, VILLAGE_NEXT),
      {do:[{say:'play'}, {isIt:4}]}
    ],
    granny: [
      {if:{season:3, trip:1, holding:{tripRice:false}}, do:[{shop:'rice'}]},
      {if:{child:{below:3}}, do:[{say:'hi'}, {reply:'你好'}]},
      {if:{new:'米饭'}, do:[{say:'areYouHungry', teach:'米饭'}, {newWord:'米饭', note:'米饭 is rice, cooked: a bowl of it makes a meal.'},
        {reply:'谢谢'}, {eat:'米饭', note:'You sit down by the well and eat the whole bowl of {米饭|rice}. Your health is full!'}]},
      // the farmer's lunch: she gives you a bowl for him (a meal: not a snack for your bag)
      {if:{lunch:'asked', holding:{lunch:false}}, do:[{say:'hi'}, {hold:'米饭', for:'lunch'}, {message:'The granny gives you a bowl of {米饭|rice} for the farmer. Take it to him, in the fields!'}]},
      {do:[{say:'areYouHungry'}, {reply:'谢谢'}, {eat:'米饭', note:'Another bowl of {米饭|rice}! You eat it all up. Your health is full!'}]},
    ],
    fisherman: [
      {if:{season:3, trip:1, holding:{tripFish:false}}, do:[{shop:'fish'}]},
      {if:{child:{below:3}}, do:[{say:'hi'}, {reply:'你好'}]},
      {if:{fish:'asked', holding:{fish:true}}, do:[{request:'fish'}]},   // (钱 comes as he pays you: practise first)
      {if:{fish:'not asked'}, do:[{request:'fish'}]},
      {if:{fish:'asked'}, do:[{request:'fish'}]},
      ...ASK('askFisher', {fish:'done'}, VILLAGE_NEXT),
      {do:[{say:'hi'}, {reply:'你好'}]}
    ],
    auntie: [{do:[{say:'littleMonkey'}]}],
    // the villager whose hens got out (all four back in their yard: the hens' event)
    villager: [...ASK('askVillager', {hensDone:1}, VILLAGE_NEXT), {do:[{say:'hi'}, {reply:'你好'}]}],
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
    kid2: [{if:{season:3, trip:{atLeast:1, below:5}}, do:[{say:'snowballFight'}, {snowball:'snowVillage', prize:2, win:[{say:'youWon'}], lose:[{say:'iWon'}]}]},
      {if:{child:{below:3}}, do:[{say:'hi'}, {reply:'你好'}]}, {do:[{say:'hideAsk'}, {hideSeek:true}]}],
    snowKid1: [{do:[{say:'snowballFight'}, {snowball:'snowTown', prize:2, win:[{say:'youWon'}], lose:[{say:'iWon'}]}]}],
    snowKid2: [{do:[{say:'snowballFight'}, {snowball:'snowFields', prize:2, win:[{say:'youWon'}], lose:[{say:'iWon'}]}]}],
    kid3: [{do:[{say:'hi'}, {reply:'你好'}]}],
    // the farmer: look, birds! (看); shoo them off his rice; then he's hungry (his lunch, from the granny)
    farmer: [
      {if:{farmer:0}, do:[{say:'look', teach:'看'}, {newWord:'看', note:'看 means to look.'}, {set:{farmer:1}},
        {message:'Birds are eating the farmer’s rice! Shoo them off: walk up to each one, and press A.'}]},
      {if:{farmer:1, birdsShooed:{below:5}}, do:[{say:'look'}, {message:'Shoo the birds off the rice ({birdsShooed}/5).'}]},
      {if:{lunch:'not asked'}, do:[{request:'lunch'}]},
      {if:{lunch:'asked'}, do:[{request:'lunch'}]},
      ...ASK('askFarmer', {lunch:'done'}, [{message:'The farmer doesn’t know, but is your friend now. Ask in the town, east along the high road: lots of people live there.'}]),
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
      // treasures from the mountain (js/trade.js: decided 9 November 2026, the trade plan): he buys them, for coins; the first
      // time, if you've never sold anything, teaching 卖
      {if:{new:'卖', treasures:true}, do:[{say:'treasureSell', teach:'卖'}, {newWord:'卖', if:{new:'卖'}, note:'To sell: the money changer buys your treasures from the mountain, for coins.'}, {sell:true, first:true}]},
      {if:{treasures:true}, do:[{say:'changeMoney'}, {exchange:true}, {sell:true}]},
      {do:[{say:'changeMoney'}, {exchange:true}]}
    ],
    // the 老板, home again once the Demon of Havoc is beaten, at his stall (js/trade.js): tools and things for the cave, in
    // coins, so the words you catch only by buying them can still be caught; and he buys treasures, as he always did
    boss: [
      {if:{new:'卖', treasures:true}, do:[{say:'treasureSell', teach:'卖'}, {newWord:'卖', if:{new:'卖'}, note:'To sell: the {老板} buys your treasures, for coins.'}, {sell:true, first:true}]},
      {do:[{shop:'home'}]}
    ],
    fruitSeller: [{if:{new:'买'}, do:[{shop:'fruit'}]},
      // how much? (decided 9 November 2026, the trade plan: 买 moved to Flower Fruit Mountain, and 多少钱 suits a market with coins)
      {if:{new:'多少钱'}, do:[{reply:'多少钱', about:'You point at her apples. You want to know how much they cost.', pic:'苹果'}, {say:'twoWen'}, {shop:'fruit'}]},
      {do:[{shop:'fruit'}]}],
    bunSeller: [{if:{new:'买'}, do:[{say:'hi'}, {message:'The bun seller is busy. Try the fruit stall first!'}]},
      {if:{new:'包子'}, do:[{shop:'buns'}]}, {do:[{shop:'buns'}]}],
    shoeSeller: [{if:{new:'买'}, do:[{say:'hi'}, {message:'The shoe seller is busy. Try the fruit stall first!'}]},
      {if:{new:'鞋'}, do:[{shop:'shoes'}]}, {do:[{shop:'shoes'}]}],
    teaKeeper: [
      {if:{new:'茶'}, do:[{say:'drinkTea', teach:'茶'}, {newWord:'茶', note:'A cup of hot green tea, in the teahouse.'}, {rest:true}, {reply:'谢谢'}, {goOn:true}]},
      ...ASK('askTea', {knows:'茶'}, TOWN_NEXT),
      {do:[{say:'drinkTea'}, {rest:true}, {message:'You sit down and drink a cup of tea.'}]}
    ],
    teller: [
      {if:{new:'说'}, do:[{say:'iTalk', teach:'说'}, {newWord:'说', note:'说 means to say, or to talk.'}, {message:'The storyteller tells stories in front of the teahouse. People stop to listen.'}, {goOn:true}]},
      ...ASK('askTeller', {knows:'说'}, [{message:'The storyteller knows lots of stories, but not where the immortals live.'}, ...TOWN_NEXT]),
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
      ...ASK('askGranny', {grannyPeach:'done'}, TOWN_NEXT),
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
      {if:{cargo:0}, do:[{say:'hi'}, {set:{cargo:1}}, {message:'The docker is loading the big boat. Help him: carry four sacks from the quay down the pier to it, one at a time. Face a sack, and press A!'}]},
      {if:{cargo:1, cargoCarried:4}, do:[{set:{cargo:2}}, {say:'thanks'}, {reply:'不客气'}, {coins:3, note:'The docker gives you 3 🪙 for your help.'}, {goOn:true}]},
      {if:{cargo:1}, do:[{message:'Four sacks, please! ({cargoCarried}/4)'}]},
      ...ASK('askDocker', {cargo:2}, [{message:'The docker doesn’t know, but is your friend now. The boatman on the pier has sailed all over the sea, though: ask the boatman!'}]),
      {do:[{say:'hi'}, {reply:'你好'}]}
    ],
    pupil1: [{do:[{say:'hi'}, {reply:'你好'}]}],
    grown1: [{do:[{say:'grownUp'}, {message:'It’s one of the children from the school, all grown up, selling kites at a stall of their own!'}]}],
    grown2: [{do:[{say:'grownUp'}, {message:'It’s one of the children from the school, all grown up!'}]}],
    newPupil1: [{do:[{say:'hi'}, {reply:'你好'}]}],
    newPupil2: [{do:[{say:'hi'}, {reply:'你好'}]}],
    // the teacher, years on: still teaching what you didn't learn from him before the years (as the teacher above does)
    teacherOld: [
      {if:{new:'听'}, waits:true, do:[{say:'listen', teach:'听'}, {newWord:'听', note:'听 means to listen.'}, {message:'The teacher’s hair has gone grey. New children are learning at the school now.'}]},
      {if:{new:'孩子'}, waits:true, do:[{say:'theyAreChildren', teach:'孩子'}, {newWord:'孩子', note:'孩子 means child, or children.'}]},
      {if:{new:'学'}, waits:true, do:[{say:'childrenLearn', teach:'学'}, {newWord:'学', note:'学 means to learn.'}]},
      {do:[{say:'listen'}, {message:'The teacher’s hair has gone grey. New children are learning at the school now.'}]}],
    pupil2: [{do:[{say:'hi'}, {reply:'你好'}]}],
    walker1: [{do:[{say:'hi'}, {reply:'你好'}]}],
    walker2: [{do:[{say:'hi'}, {reply:'你好'}]}],
    porter: [{do:[{say:'hi'}, {reply:'你好'}]}],
    // the harbour: no wind today (风); once you've practised a little, the wind comes, and he takes you across for your fare
    // he knows where the immortals are, once you've asked everyone else (the last on your list): across the sea
    boatman: [
      {if:{trip:2}, do:[{say:'hi'}, {say:'letsGo'}, {scene:'crossSea'}, {set:{trip:3}}, {goTo:'farShore', at:[16, 19], facing:'up'},
        {message:'Back across the sea! Take the rice and fish to the foot of the mountain: the pupils’ basket is waiting there, to haul you up.'}]},
      {if:{years:0}, do:[{say:'hi'}, {reply:'你好'}]},
      {if:{toldSea:0, asked:{below:8}}, do:[{say:'hi'}, {reply:'你好'}, {message:'The boatman has sailed all over the sea… But first, ask everyone else on your list ({asked} of 8 so far): tap the faces on your Tasks page to see who’s left.'}]},
      {if:{toldSea:0}, do:[{say:'whereImmortals', by:'player'}, {say:'acrossSea'}, {set:{toldSea:1}}, {befriend:true}, {sound:'chime'},
        {message:'At last, someone who knows! Far across the western sea, on a mountain, there lives an immortal. The boatman can take you there, once the wind comes.'}, {goOn:true}]},
      {if:{boat:0}, do:[{say:'noWind', teach:'风'}, {newWord:'风', note:'风 means wind. Without it, the boat can’t sail.'}, {set:{boat:1}},
        {message:'No wind today: the boat can’t sail. Practise a little, then come back.'}]},
      {if:{boat:1}, do:[{sound:'wind'}, {say:'windCame'}, {pay:5, note:'You give the boatman 5 🪙 for your fare.'}, {say:'letsGo'},
        {scene:'crossSea'}, {set:{boat:2}}, {goTo:'farShore', at:[16, 19], facing:'up'}]},
      {do:[{say:'hi'}, {reply:'你好'}]}
    ],
    harbourGoose: [{do:[{gap:{sentence:'这 是 鹅', en:'This is a goose.', word:'鹅', others:['鸡', '鱼', '狗'], pic:'鹅'}}]}],
    // the far shore: the woodcutter's song (歌), the immortal's; and where the immortal lives
    woodcutter: [
      {if:{song:0}, do:[{sound:'chime'}, {say:'immortalSong', teach:'歌'}, {newWord:'歌', note:'歌 means song. The woodcutter learned it from the immortal!'},
        {say:'immortalOnMountain'}, {set:{song:1}}, {chapter:1},
        {message:'The woodcutter picks up his axe and goes home, up the stone steps. Follow him: the way up the mountain starts there!'}]},
      // at his hut, at the foot of the mountain: he's tired, and asks for things one at a time, only in Chinese (fetch-by-word,
      // decided 4 November 2026: quiet practice, where what you bring is the answer)
      {if:{woodFetch:{below:4}}, do:[{say:'tired', if:{woodFetch:0}},
        {fetch:'woodFetch', asks:[{word:'木头', count:3, ask:'wantWood'}, {word:'水', ask:'wantWater'}, {word:'石头', count:4, ask:'wantStones'}],
          right:'rightThanks', wrong:'notRight', wrongNote:'That’s not what he asked for. Listen again!',
          listen:'He only says it in Chinese: what he wants, and how many. Listen, then find it by his hut (the woodpile, the stream, the pebbles), pick up as many as he asked for, and bring them to him.',
          done:[{coins:3, note:'The woodcutter gives you 3 🪙 for your help.'}, {say:'goUp'}]}]},
      {do:[{say:'goUp'}]}
    ],
    // the boy at the cave's door: who are you? (you're dressed as a person, but…) The master is waiting for you
    doorBoy: [
      {if:{door:1}, do:[{say:'whoAreYou'}, {gap:{sentence:'我 是 猴子', en:'I’m a monkey.', word:'猴子', others:['人', '鸟'], pic:'猴子'}},
        {say:'masterWaits'}, {set:{door:2}}, {message:'The boy goes back in through the open doors. Follow him: face the doors, and press A.'}]},
      {do:[{say:'masterWaits'}]}
    ],
    // the master: who he is (师父), your name (名字); the chores first; his lecture, and seven years; his riddle (头); at
    // night, in his room, his secret (变); his tests; the cloud somersault (飞); and, once you've shown off, home (回家)
    master: [
      {if:{teacher:0}, do:[{say:'youCame'}, {say:'iAmMaster', teach:'师父'}, {newWord:'师父', note:'师父 means master, or teacher: the one who teaches you, and looks after you.'}, {set:{teacher:1}}, {goOn:true}]},
      {if:{named:0}, do:[{say:'whatName', teach:'名字'}, {newWord:'名字', note:'名字 means name. 你叫什么名字？ What are you called?'},
        {say:'noName', by:'player'}, {say:'yourName'}, {set:{named:1}}, {sound:'chime'},
        {message:'From now on you’re 孙悟空, Sun Wukong: Monkey Awakened to Emptiness. You’re one of the master’s pupils now.'}, {goOn:true}]},
      // the master's year: his class each season (decided 7 November 2026: one a season, each beginning with a check that
      // you listened last time). Spring: counting on, from 十 to 二十, with bundles of sticks.
      {if:{named:1, class1:0}, do:[{message:'The pupils sit down in front of the hall. It’s the master’s first class!'}, {say:'classStart'},
        {class:'The master’s class · Counting on', taught:['十一', '二十'], end:'Next: morning training, with the senior pupil.', do:[
          {message:'The master holds up some sticks. Can you still count, as at school? Count them!'}, {recap:2, from:['三', '四', '五', '六', '七', '八', '九', '十'], count:'whatNumber'},
          {say:'thisIsTen'}, {countOn:true}, {numbers:3}]},
        {set:{class1:1}}, {goOn:true}]},
      // summer: north and south, turning to face each; and lingzhi for his medicine
      {if:{season:1, waterFetch:2, class2:0}, do:[{message:'The pupils sit down in front of the hall, for the master’s summer class.'}, {say:'classStart'},
        {class:'The master’s class · North and south', taught:['北边', '南边'], end:'Next: a pupil wants a match with you.', do:[
          {message:'Did you listen last time? The master holds up some sticks.'}, {recap:2, from:['十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十'], count:'whatNumber'},
          {say:'hallNorth', teach:'北边'}, {newWord:'北边', note:'北边 means the north: 北 north + 边 side. On a map, the north is at the top. The hall is to the north.'}, {face:'北边', line:'lookNorth'},
          {say:'doorSouth', teach:'南边'}, {newWord:'南边', note:'南边 means the south: 南 south + 边 side. On a map, the south is at the bottom. The way out is to the south.'}, {face:'南边', line:'lookSouth'},
          {say:'northCold'}, {recap:2, from:['北边', '南边'], lines:{'北边':'lookNorth', '南边':'lookSouth'}}]},
        {set:{class2:1}}]},
      // autumn: east and west, turning to face each
      {if:{season:2, wrote:1, class3:0}, do:[{message:'The pupils sit down in front of the hall, for the master’s autumn class.'}, {say:'classStart'},
        {class:'The master’s class · East and west', taught:['东边', '西边'], end:'Next: evening, and the first snow.', do:[
          {message:'Did you listen last time? Turn to face the way the master says.'}, {recap:2, from:['北边', '南边'], lines:{'北边':'lookNorth', '南边':'lookSouth'}},
          {say:'fallsEast', teach:'东边'}, {newWord:'东边', note:'东边 means the east: 东 east + 边 side. On a map, the east is on the right. The waterfall is to the east.'}, {face:'东边', line:'lookEast'},
          {say:'treeWest', teach:'西边'}, {newWord:'西边', note:'西边 means the west: 西 west + 边 side. On a map, the west is on the left. Your peach tree is to the west.'}, {face:'西边', line:'lookWest'},
          {say:'homeEast'}, {recap:2, from:['东边', '西边'], lines:{'东边':'lookEast', '西边':'lookWest'}}]},
        {set:{class3:1}}]},
      {if:{season:1, spar1:1, herbs:0}, do:[{say:'wantLingzhi'}, {set:{herbs:1}},
        {message:'The master makes medicines. He needs lingzhi, a mushroom of long life: it grows on the rocks among the stone pillars, outside the cave. Find three!'}]},
      {if:{herbs:1, herbsFound:{atLeast:3}}, do:[{say:'rightThanks'}, {message:'The master grinds the lingzhi in a stone bowl, and mixes it with honey and water from the spring…'},
        {say:'thisMedicine', teach:'药'}, {newWord:'药', note:'药 means medicine. The master’s medicine, made from the lingzhi you found.'}, {hold:null, for:'herbs'}, {set:{herbs:2}},
        {coins:3, note:'The master gives you 3 🪙 for your help.'}]},
      {if:{herbs:1, season:1}, do:[{say:'wantLingzhi'}]},
      // winter: the four sides again, then the four seasons, and together they make a year (年)
      {if:{season:3, wrapped:1, class4:0, grown:0}, do:[{message:'The pupils sit down round the fire, for the master’s winter class.'}, {say:'classStart'},
        {class:'The master’s class · The year', taught:['年'], end:'Next: a pupil wants to build something with you.', do:[
          {message:'Did you listen? Turn to face the way the master says.'}, {recap:4, from:['北边', '南边', '东边', '西边'], lines:{'北边':'lookNorth', '南边':'lookSouth', '东边':'lookEast', '西边':'lookWest'}},
          {say:'fourSeasons'}, {say:'thisYear', teach:'年'}, {newWord:'年', note:'年 means year: spring, summer, autumn and winter make one year. You’ve been here a whole year!'},
          {recap:2, from:['春天', '夏天', '秋天', '冬天'], label:'Listen. Which season is it?'}]},
        {set:{class4:1}}]},
      // the last night of the year: lanterns, the New Year's dinner, red envelopes
      {if:{season:3, bigMatch:1, newYear:0, grown:0}, do:[{message:'It’s the last night of the year. Red lanterns glow along the hall, and the pupils set out the New Year’s dinner…'},
        {setUp:{nyTable:1}}, {say:'happyNewYear', teach:'新年快乐'}, {newWord:'新年快乐', note:'新年快乐 means Happy New Year! 新 new + 年 year + 快乐 happy.'}, {reply:'新年快乐'},
        {coins:5, note:'The master gives each pupil a red envelope, with coins inside: 5 🪙 for you!'},
        {eat:'米饭', note:'You eat {米饭|rice} and fish with everyone, round the fire. Your health is full!'}, {set:{newYear:1}}]},
      {if:{grown:0}, do:[{say:'veryGood'}]},
      // after the seven years: his lecture (as in the book: the years first, then the lecture, then the riddle)
      {if:{lecture:0}, do:[{say:'listen'}, {practise:4, label:'The master’s lecture', pic:'师父'}, {set:{lecture:1}}, {sound:'chime'}, {goOn:true}]},
      {if:{riddle:0}, do:[{say:'oneTwoThree'}, {sound:'tock'}, {sound:'tock'}, {sound:'tock'}, {newWord:'头', note:'头 means head. The master tapped you on the head, three times!'},
        {set:{riddle:1}},
        {message:'The master puts his hands behind his back, goes into the hall and shuts the doors. The pupils are cross with you. But you understand: three taps… the third watch of the night… the back door!'}]},
      {if:{riddle:2}, do:[{say:'youCame'}, {say:'teachChange', teach:'变'}, {newWord:'变', note:'变 means to change: into something else. The master’s secret, for you alone.'},
        {say:'knowName'}, {message:'To change into something, you have to know its name. Every word you’ve caught is something you could change into: the more words you know, the more you can become!'},   // (what the whole game is about: decided 8 November 2026, the polish plan)
        {say:'change'}, {turnInto:1, label:'变！ Listen: what does the master say?'}, {set:{riddle:3}},
        {message:'Before dawn, you creep back to your room. Nobody saw you!'}, {goTo:'cave', at:[4, 4], facing:'down'}]},
      {if:{tests:0}, do:[{say:'change'}, {turnInto:3, label:'变！ Listen: what does the master say?'}, {set:{tests:1}}, {say:'veryGood'}, {goOn:true}]},
      {if:{fly:0}, do:[{say:'teachFly', teach:'飞'}, {newWord:'飞', note:'飞 means to fly. The master teaches you the cloud somersault: one leap, and you fly a long, long way.'},
        {scene:'somersault'}, {set:{fly:1}}, {message:'From now on you can fly by cloud: open your map (MAP), choose a place you’ve been, and press Fly here.'}]},
      {if:{pine:1, sentHome:0}, do:[{say:'goAway'}, {say:'goHome', teach:'回家'}, {newWord:'回家', note:'回家 means to go home. The master is sending you home, to Flower Fruit Mountain.'},
        {reply:'再见'}, {scene:'flyHome'}, {set:{sentHome:1}}, {chapter:2}, {goTo:'ffmMeadow', at:[9, 2], facing:'down'}]},
      {do:[{say:'change'}, {turnInto:2, label:'变！ Listen: what does the master say?'}]}
    ],
    // a pupil plays I spy with you (the spy step), again whenever you like; the first time, a present
    spyPupil: [
      {if:{named:0}, do:[{say:'hi'}, {reply:'你好'}]},
      {if:{season:3, class4:1, snowman:0, grown:0}, do:[{say:'makeSnowman', teach:'雪人'}, {setUp:{snowman:1}}, {newWord:'雪人', note:'雪人 means snowman: 雪 snow + 人 person.'},
        {message:'You roll the snow into balls, and the pupils help you stack them up. A snowman, in a red scarf!'}]},
      {do:[{say:'play'}, {spy:'spyGame', rounds:3, things:[{word:'树', say:'spyTree'}, {word:'水', say:'spyWater'}, {word:'桃子', say:'spyPeach'}, {word:'石头', say:'spyStone'},
        {word:'木头', say:'spyWood'}, {word:'门', say:'spyDoor'}, {word:'房子', say:'spyHouse'}],
        listen:'She says it only in Chinese. Find it, and press A at it.', found:'That’s it: {word}!', wrong:'Not that one. Listen again!',
        done:[{say:'veryGood'}, {coins:2, note:'The pupil laughs, and gives you 2 🪙.'}]}]}
    ],
    // the senior pupil's chores: the leaves (叶子), sweeping them (扫), the bucket (桶) and three buckets of water, the axe
    // (斧头) and four pieces of wood
    senior: [
      {if:{named:0}, do:[{say:'hi'}, {reply:'你好'}]},
      // spring: morning training (功夫), everyone striking together as many times as he calls out, counted aloud; then a
      // little peach tree of your own, and a bucket to water it with
      {if:{class1:1, drill:0}, do:[{say:'kungfu', teach:'功夫'}, {newWord:'功夫', note:'功夫 means kung fu. Every morning, the pupils train together in the courtyard.'},
        {message:'Listen for how many strikes the senior pupil calls out. Then everyone strikes together, and counts!'},
        {drill:3, label:'How many strikes?', facing:'right', at:{senior:[16, 9, 'left'], spyPupil:[12, 7], pupil4:[12, 11], darePupil:[10, 8], doorBoy:[10, 10], you:[12, 9]}}, {say:'veryGood'}, {set:{drill:1}}, {goOn:true}]},
      {if:{drill:1, myTree:0}, do:[{say:'yourTree'}, {say:'treeDrink'}, {say:'thisBucket', teach:'桶'}, {newWord:'桶', note:'桶 means bucket. It counts buckets of something too: 三桶水, three buckets of water.'},
        {set:{myTree:1}}, {message:'The senior pupil gives you a little peach tree of your own, and a bucket. Plant your tree in the garden, where the ground sparkles ✨.'}]},
      {if:{myTree:{atLeast:1, below:3}}, do:[{say:'treeDrink'}]},
      // summer: water
      {if:{season:1, waterFetch:0, evening:0}, do:[{say:'hotToday', teach:'热'}, {newWord:'热', note:'热 means hot. The pupils are training in the sun, and they’re thirsty.'}, FETCH_WATER]},
      {if:{waterFetch:1}, do:[FETCH_WATER]},
      // autumn: the leaves, then firewood for the winter
      {if:{season:2, sweep:0, evening:0, new:'叶子'}, do:[{say:'manyLeaves', teach:'叶子'}, {newWord:'叶子', note:'叶子 means leaves. In autumn they fall all over the cave.'}, {goOn:true}]},
      {if:{season:2, sweep:0, evening:0}, do:SWEEP_LEAVES},   // (叶子 you know from the first yellow leaf, at summer's end; and 很多叶子！ is what everyone says in autumn)
      {if:{sweep:1, leavesSwept:{below:5}}, do:[{say:'sweepLeaves'}, {message:'Sweep up the heaps of leaves in the courtyard ({leavesSwept}/5): face one, and press A.'}]},
      {if:{sweep:1}, do:[{say:'veryGood'}, {set:{sweep:2}}, {say:'thisAxe', teach:'斧头'}, {newWord:'斧头', note:'斧头 means axe. Chop logs at the chopping blocks: face one, and press A.'}, FETCH_WOOD]},
      {if:{sweep:2, axeFetch:0}, do:[{say:'thisAxe', teach:'斧头'}, FETCH_WOOD]},
      {if:{axeFetch:1}, do:[FETCH_WOOD]},
      // winter: it's cold (冷): a fire, with the wood you chopped in autumn
      {if:{season:3, fire:0, grown:0}, do:[{say:'coldToday', teach:'冷'}, {newWord:'冷', note:'冷 means cold. It’s summer’s sentence, 今天很热！, with the opposite word.'}, {set:{fire:1}},
        {message:'The pupils are shivering. Take wood from the woodpile, and light a fire in the brazier, in the middle of the courtyard.'}]},
      {if:{season:3, fire:1}, do:[{say:'coldToday'}]},
      {if:{season:3, fire:2, wrapped:0, grown:0}, do:[{say:'treeCold'}]},
      // the stores are low: down the mountain and across the sea, to the fishing village, for rice (米) and fish
      {if:{season:3, snowman:1, trip:0, grown:0}, do:[{say:'noPeaches'}, {say:'wantRiceFish'}, {coins:6, note:'The senior pupil gives you 6 🪙, to buy them.'}, {set:{trip:1}},
        {message:'The stores are nearly empty. Go down the mountain and across the sea, to the fishing village where you first landed, and buy rice and fish there.'}]},
      {if:{trip:{atLeast:1, below:4}}, do:[{say:'wantRiceFish'}]},
      {if:{trip:4}, do:[{say:'rightThanks'}, {hold:null, for:'tripRice'}, {hold:null, for:'tripFish'}, {set:{trip:5}}, {sound:'chime'},
        {message:'The senior pupil puts the rice and fish away in the store. There’s enough for the whole winter, and for New Year!'}, {goOn:true}]},
      // the year's last test: a match with the senior pupil himself, in the snow, the master watching
      {if:{season:3, trip:5, bigMatch:0, grown:0}, do:[{say:'spar'}, {battle:'bigMatch', retry:true, win:[{set:{bigMatch:1}}, {rest:true},
        {coins:5, note:'The senior pupil bows to you, and the master nods: you’ve learned well this year. +5 🪙'}]}]},
      // writing practice, as in the book: your name with a brush (写), and then over your door
      {if:{season:2, axeFetch:2, wrote:0}, do:[{say:'writeName', teach:'写'}, {newWord:'写', note:'写 means to write. The pupils practise writing with a brush, on paper with red lines.'},
        {writeName:'孙悟空', py:'sūn wù kōng'}, {set:{wrote:1}}, {sound:'chime'},
        {message:'The senior pupil hangs your name over the door of your room: 孙悟空. Now everyone knows whose room it is!'}, {goOn:true}]},
      {do:[{say:'veryGood'}]}
    ],
    // a pupil who dares you to show off, once you can fly: change into a pine tree (松树)! The noise brings the master out
    darePupil: [
      // summer: a friendly match, on the battle screen (your stick against his staff); lose, and you can try again at once
      {if:{season:1, class2:1, spar1:0}, do:[{say:'spar'}, {battle:'spar', retry:true, win:[{set:{spar1:1}}, {rest:true}, {coins:3, note:'The pupil bows, and gives you 3 🪙. You’re good at kung fu!'}]}]},
      {if:{fly:1, pine:0}, do:[{say:'changePine', teach:'松树'}, {newWord:'松树', note:'松树 means pine tree: 松 pine + 树 tree.'},
        {say:'change', by:'player'}, {turnInto:'松树', ms:2800}, {say:'cheer'}, {set:{pine:1}},
        {message:'The pupils clap and cheer. But the noise brings the master out of the hall, and he’s angry…'}]},
      {do:[{say:'hi'}, {reply:'你好'}]}
    ],
    // two pupils cooling off in the pool on a hot summer's day
    bather1: [{do:[{say:'hotToday'}]}],
    bather2: [{do:[{say:'hotToday'}]}],
    // a pupil to train with, any time this year: a word game, with a present the first time you win (as the little monkeys
    // in training at home)
    pupil4: [
      {if:{season:3, fire:2, grown:0}, do:[{say:'snowballFight'}, {snowball:'snowCave', prize:2, win:[{say:'youWon'}], lose:[{say:'iWon'}]}]},
      {if:{named:1, grown:0, trainGame:{below:2}}, do:[{say:'letsTrain'}, {wordGame:{ask:'Train with this pupil? A quick word game: win, and he gives you 2 🪙.', yes:'Train', word:'人', notYet:'Learn a few more words first, then come back to train.',
        win:[{say:'veryGood'}, {set:{trainGame:2}}, {coins:2, note:'The pupil bows, and gives you 2 🪙.'}], lost:[{set:{trainGame:1}}]}}]},
      {if:{named:1, grown:0}, do:[{say:'letsTrain'}, {wordGame:{ask:'Train with this pupil? A quick word game.', yes:'Train', word:'人', notYet:'Learn a few more words first, then come back to train.'}}]},
      {do:[{say:'hi'}, {reply:'你好'}]}],
    little1: [{do:[{say:'littleHi'}, {message:'A new little pupil. They call you 师兄, senior brother: you’ve been here longer than them!'}]}],
    little2: [{do:[{say:'littleHi'}, {reply:'你好'}]}],
    // chapter 2: home, twenty years on. Your old friend the little monkey, grown up, crying for her little one (哭); the big
    // monkey, hiding behind a bush in the meadow (回来); the hungry monkey, behind one at the home ground (好久不见); and
    // the old monkey, in the Water Curtain Cave (老), with the news
    mother: [
      {if:{new:'哭'}, do:[{say:'littleCrying', by:'player', teach:'哭'}, {newWord:'哭', note:'哭 means to cry. It’s your old friend the little monkey, all grown up. Why is she crying?'},
        {say:'myChild'}, {message:'Her little one has gone! And everyone else is hiding. Look for them: a bush that sparkles ✨.'}]},
      {if:{homeAgain:0}, do:[{say:'myChild'}]},
      {do:[{say:'veryHappy'}]}
    ],
    big: [
      {if:{new:'回来'}, do:[{say:'youreBack', teach:'回来'}, {newWord:'回来', note:'回来 means to come back. 你回来了！ You’re back!'},
        {message:'It’s the big monkey, grey now, hiding behind a bush. The others are hiding up at the home ground. Go and find them!'}]},
      {if:{homeAgain:0}, do:[{say:'youreBack'}]},
      {do:[{say:'veryHappy'}]}
    ],
    hungry: [
      {if:{new:'好久不见'}, do:[{say:'longTime', teach:'好久不见'}, {newWord:'好久不见', note:'好久不见 means long time no see: what you say to a friend you haven’t seen for a long time.'},
        {reply:'好久不见'}, {message:'The hungry monkey hugs you. The old monkey is hiding in the Water Curtain Cave, with some of the others. Go and find him!'}]},
      {if:{homeAgain:0}, do:[{say:'longTime'}, {reply:'好久不见'}]},
      // home with the little monkeys and the cart: she wants each of the troop's things off it, only in Chinese (the unload
      // step, the area's unloading), to go back on the feast's tables
      {if:{homeAgain:1, unload:0}, do:[{message:'The little monkeys run to their mothers! The troop crowds round the cart: all their things, home again. Help the hungry monkey put them back on the feast’s tables.'},
        {unload:'ask'}]},
      {if:{homeAgain:1, party:0}, do:[{unload:'ask'}]},
      {do:[{say:'veryHappy'}]}
    ],
    elder: [
      {if:{new:'好久不见'}, do:[{message:'The old monkey hides his face. Find the others first: up at the home ground.'}]},
      {if:{new:'老'}, do:[{say:'longTime'}, {reply:'好久不见'}, {say:'iAmOld', teach:'老'}, {newWord:'老', note:'老 means old. Twenty years have gone by: the old monkey’s fur is white now, and he leans on a stick.'},
        {message:'A demon came from far away: the Demon of Havoc (混世魔王 Hùnshì Mówáng). His little demons carried off the troop’s little ones, and everything on the feast’s tables!'},
        {set:{news:1}}, {message:'Some of his little demons are still on the home ground. Chase them off! The old monkey comes with you, leaning on his stick.'}, {follow:['elder']}]},
      {if:{d3:0}, do:[{say:'iAmOld'}, {message:'Chase the little demons off the home ground!'}]},
      // the little demons chased off: the Demon of Havoc lives in the north; fly there, on your cloud
      {if:{north:0}, do:[{follow:[]}, {say:'demonNorth'}, {message:'Far to the north, over the mountains, is the Demon of Havoc’s home. Call your cloud, and fly north to find the little ones!'},
        {set:{north:1}}, {scene:'flyNorth'}, {goTo:'lair', at:[14, 18], facing:'up'}]},
      {if:{king:{below:2}}, do:[{say:'demonNorth'}, {message:'Fly north on your cloud: it’s waiting on the grass, south of the path.'}]},
      // home with the little ones: a king needs a real weapon, and the Dragon King has the finest; the end of Area 2
      {if:{stickGiven:1, ch2:0}, do:[{message:'The old monkey looks at your broadsword. It will do for now… but a king needs a real weapon.'}, {say:'dragonKing'},
        {message:'The water under the iron bridge in the Water Curtain Cave goes all the way down to the sea, to the Dragon King’s palace. He has the finest weapons in the world…'},
        {set:{ch2:1}}, {areaEnd:true}]},
      {do:[{say:'veryHappy'}]}
    ],
    troopA: [{if:{homeAgain:0}, do:[{say:'myChild'}]}, {do:[{say:'veryHappy'}]}],
    troopB: [{if:{homeAgain:0}, do:[{say:'myChild'}]}, {do:[{say:'veryHappy'}]}],
    // your stick, for a little monkey in training, now you have the Demon of Havoc's broadsword
    trainee: [{if:{homeAgain:1, stickGiven:0}, do:[{say:'forYou', by:'player'}, {set:{stickGiven:1}}, {sound:'chime'}, {say:'thanks', by:'traineeStick'}, {reply:'不客气'},
        {message:'You give your stick to the little monkey in training. You carry the Demon of Havoc’s broadsword now.'}]},
      {do:[{say:'hi'}, {reply:'你好'}]}],
    traineeStick: [{do:[{say:'veryHappy'}]}],
    // the little ones, set free
    baby1: [{if:{freed:5, loot:0}, do:[{say:'thanks'}, {message:'The little monkey points: the troop’s things are on a cart, over on the right. A little demon is guarding it!'}]},
      {if:{homeAgain:0}, do:[{say:'thanks'}]}, {do:[{say:'veryHappy'}]}],
    baby2: [{if:{homeAgain:0}, do:[{say:'thanks'}]}, {do:[{say:'veryHappy'}]}],
    baby3: [{if:{homeAgain:0}, do:[{say:'thanks'}]}, {do:[{say:'veryHappy'}]}],
    baby4: [{if:{homeAgain:0}, do:[{say:'thanks'}]}, {do:[{say:'veryHappy'}]}],
    baby5: [{if:{homeAgain:0}, do:[{say:'thanks'}]}, {do:[{say:'veryHappy'}]}],
    cow: [{do:[{message:'The cow, with a calf of her own now!'}]}],
    calf: [{do:[{message:'The cow’s calf, born while you were away.'}]}],
    // the little demons on the home ground (妖怪, the first time one fights you): each a battle, till you've chased it off
    d1: [{if:{new:'妖怪'}, do:[{say:'ourHome'}, {newWord:'妖怪', met:true, note:'妖怪 means demon, or monster: the word for every demon on the journey west. This one is little, but it wants to fight!'},
      {battle:'demon', win:[{set:{d1:1}}]}]},
      {if:{d1:0}, do:[{say:'ourHome'}, {battle:'demon', win:[{set:{d1:1}}]}]}, {do:[{say:'ourHome'}]}],
    d2: [{if:{new:'妖怪'}, do:[{say:'ourHome'}, {newWord:'妖怪', met:true, note:'妖怪 means demon, or monster: the word for every demon on the journey west. This one is little, but it wants to fight!'},
      {battle:'demon', win:[{set:{d2:1}}]}]},
      {if:{d2:0}, do:[{say:'ourHome'}, {battle:'demon', win:[{set:{d2:1}}]}]}, {do:[{say:'ourHome'}]}],
    d3: [{if:{new:'妖怪'}, do:[{say:'ourHome'}, {newWord:'妖怪', met:true, note:'妖怪 means demon, or monster: the word for every demon on the journey west. This one is little, but it wants to fight!'},
      {battle:'demon', win:[{set:{d3:1}}, {message:'The last little demon runs off north, squealing! Tell the old monkey.'}]}]},
      {if:{d3:0}, do:[{say:'ourHome'}, {battle:'demon', win:[{set:{d3:1}}, {message:'The last little demon runs off north, squealing! Tell the old monkey.'}]}]}, {do:[{say:'ourHome'}]}],
    // the guard at the demon's cave, with the cages' key (钥匙) on his belt: he won't give it to a monkey, but he will to a
    // little demon (you, changed: 变)
    guard: [
      {if:{key:1}, do:[{say:'ourHome'}]},
      {if:{form:'妖怪'}, do:[{say:'keyHere'}, {set:{key:1}}, {sound:'blip'}, {message:'The guard thinks you’re one of his little demons, and gives you the key!'}, {form:null},
        {message:'Puff! You’re yourself again. Quick, open the cages!'}]},
      {if:{knows:'笼子', new:'钥匙'}, do:[{say:'keyHere', teach:'钥匙'}, {newWord:'钥匙', note:'钥匙 means key. The key to the cages, on the guard’s belt!'}, {say:'notForMonkey'},
        {message:'The guard won’t give the key to a monkey. If only you looked like a little demon… Hide behind a boulder, and change (变)!'}]},
      {if:{knows:'钥匙'}, do:[{say:'notForMonkey'}, {message:'He won’t give the key to a monkey. Hide behind a boulder, and change into a little demon (变)!'}]},
      {do:[{say:'notForMonkey'}]}
    ],
    guard2: [{do:[{say:'ourHome'}]}],
    // the little demon guarding the cart of the troop's things (decided 7 November 2026, after playing it: the heap of
    // things was just there for the taking): once the little monkeys are free, it fights you for it, a little tougher than
    // the others, and you can try again on the spot; beaten, it runs off into the cave
    cartGuard: [
      {if:{freed:5, cartWon:0}, do:[{say:'ours'}, {battle:'cartGuard', retry:true, back:{at:[24, 9, 'lair'], facing:'up'}, lost:'The little demon won’t let you near the cart. Try again when you’re ready!',
        win:[{walk:'cartGuard', to:[15, 4], ms:130}, {set:{cartWon:1}}, {message:'The little demon runs off into the cave, squealing! The cart is yours.'}]}]},
      {do:[{say:'ours'}, {message:'The little demon guards the cart. First, set the little monkeys free!'}]}
    ],
    // the cart of the troop's things (车, the first time you look at it): pulled back to the little monkeys once its guard
    // is beaten, rolling along behind you; at home, where the hungry monkey wants each thing off it (the unload step)
    cart: [
      {if:{following:{cart:true}}, do:[{message:'Pull the cart back to the little monkeys, by the cages.'}]},
      {if:{cartWon:0, loot:0}, label:'Look', do:[{newWord:'车', note:'车 means a cart, or anything on wheels. The little demons’ cart, piled with the troop’s things!'},
        {message:'The troop’s things, all piled on a cart! But a little demon is guarding it.'}]},
      {if:{loot:0}, label:'Pull', do:[{newWord:'车', note:'车 means a cart, or anything on wheels. The little demons’ cart, piled with the troop’s things!'},
        {message:'You take hold of the cart’s shafts, and pull. It rolls along behind you. Take it back to the little monkeys!'}, {follow:['cart']}]},
      {if:{homeAgain:1, party:0}, label:'Take', do:[{unload:'take'}]},
      {if:{homeAgain:0}, do:[{message:'The cart, with the troop’s things on it.'}]},
      {do:[{message:'The troop’s cart, empty now. Everything’s back on the feast’s tables.'}]}
    ],
    // the Demon of Havoc: who are you? I'm the king of Flower Fruit Mountain! Then the fight; beaten, he runs off for good,
    // and you fly the little ones home
    king: [{if:{king:1}, do:[{say:'whoAreYou'}, {gap:{sentence:'我 是 花果山 的 王', en:'I’m the king of Flower Fruit Mountain!', word:'王', others:['人', '鸟', '鱼'], pic:'猴子'}},
      {battle:'king', back:{at:[14, 9, 'lair'], facing:'up'}, lost:'The Demon of Havoc is too strong for you this time.',
        win:[{set:{king:2}}, {say:'letsGoHome', by:'player'}, {scene:'windHome'}, {set:{homeAgain:1}}, {goTo:'ffmHomeGround', at:[19, 9], facing:'up'}]}]}]
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
    // the nights between the seasons of the master's year: the cave turning, as you sleep (js/seasons.js)
    toSummer: {art:'seasonTurn', from:'spring', to:'summer', captions:[{at:0, zh:'孙悟空 睡觉 了 。', en:'Sun Wukong goes to sleep.'}, {at:4.6, zh:'夏天 来 了 ！', en:'Summer is here!'}]},
    toAutumn: {art:'seasonTurn', from:'summer', to:'autumn', captions:[{at:0, zh:'孙悟空 睡觉 了 。', en:'Sun Wukong goes to sleep.'}, {at:4.6, zh:'秋天 来 了 ！', en:'Autumn is here!'}]},
    toWinter: {art:'seasonTurn', from:'autumn', to:'winter', captions:[{at:0, zh:'孙悟空 睡觉 了 。', en:'Sun Wukong goes to sleep.'}, {at:4.6, zh:'冬天 来 了 ！', en:'Winter is here!'}]},
    // winter's trip: hauled back up the mountain in the pupils' supply basket, with the rice and the fish (js/year.js)
    basketUp: {captions:[{at:0, zh:'我 有 米 ， 也 有 鱼 ！', en:'I’ve got rice, and fish too!'}, {at:4, zh:'上 山 了 ！', en:'Up the mountain we go!'}]},
    // seven years in the cave, chapter 1: the seasons going round, faster and faster, your peach tree growing up, a peach
    // each summer (seven of them), and you sweeping the leaves
    caveYears: {captions: [
      {at:0, zh:'孙悟空 扫 叶子 。', en:'Sun Wukong sweeps up the leaves.'},
      {at:4, zh:'孙悟空 听 师父 说 。', en:'Sun Wukong listens to the master.'},
      {at:10.6, zh:'七 年 以后 ……', en:'Seven years later…'}
    ]},
    // the cloud somersault (飞), and the flight home at the end of the chapter (home: over the sea, Flower Fruit Mountain ahead)
    somersault: {art:'cloudFlight', watch:'Watch the cloud somersault', when:{fly:1}, captions: [
      {at:0, zh:'我 会 飞 了 ！', en:'I can fly!'},
      {at:4, zh:'孙悟空 在 天 上 飞 。', en:'Sun Wukong flies across the sky.'}
    ]},
    flyHome: {art:'cloudFlight', home:true, watch:'Watch the flight home', when:{sentHome:1}, captions: [
      {at:0, zh:'再见 ！', en:'Goodbye!'},
      {at:4, zh:'孙悟空 飞 回家 。', en:'Sun Wukong flies home.'},
      {at:8, zh:'花果山 ！', en:'Flower Fruit Mountain!'}
    ]},
    // chapter 2: flying north to the demon's mountain; the hair trick (毛), in the fight; the wind home with the little ones
    flyNorth: {captions: [
      {at:0, zh:'孙悟空 在 天 上 飞 。', en:'Sun Wukong flies across the sky.'},
      {at:5, zh:'有 山 ！', en:'Mountains!'}
    ]},
    hairTrick: {watch:'Watch the hair trick', when:{king:2}, captions: [
      {at:0, zh:'变 ！', en:'Change!'},
      {at:3.6, zh:'很多 小 猴子 ！', en:'Lots of little monkeys!'}
    ]},
    // a wind that carries you home with the little monkeys and the cart, as in the book (驾阵狂风)
    // the party, once everything's back on the feast's tables: the troop, and all your friends (the old monkey's scroll)
    party: {watch:'Watch the party', when:{party:1}, captions: [
      {at:0, zh:'我们 有 很多 朋友 ！', en:'We have lots of friends!'}
    ]},
    windHome: {watch:'Watch the wind carry everyone home', when:{homeAgain:1}, captions: [
      {at:0, zh:'有 风 了 ！', en:'The wind’s come!'},
      {at:4, zh:'小 猴子 们 很 快乐 。', en:'The little monkeys are so happy.'},
      {at:8, zh:'花果山 ！', en:'Flower Fruit Mountain!'}
    ]},
    // across the western sea, in the boatman's big boat
    crossSea: {watch:'Watch the crossing', when:{boat:2}, captions: [
      {at:0, zh:'有 风 了 ！', en:'The wind’s come!'},
      {at:4, zh:'船 在 海 上 走 。', en:'The boat sails over the sea.'},
      {at:8, zh:'有 山 ！', en:'Mountains!'}
    ]}
  }
};
