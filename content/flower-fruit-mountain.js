// Area 1: 花果山 Flower Fruit Mountain.
// The little monkey is born from a stone and meets the monkey troop.
//
// This file is only data: the engine in js/ reads it. Chinese sentences are written with a space
// between words, like '我 饿 了 。', because each word is coloured and can be tapped on its own.
// Every word must be in the word bank (content/words.js); the tests check.
// The thirsty monkey's word game (the prologue), once you've brought him water: a present the first time you win.
const THIRSTY_GAME = {wordGame:{ask:'Play a word game with the thirsty monkey? If you win, he gives you 2 🐚.', word:'猴子', notYet:'Learn a few more words first, then come back to play.',
  win:[{say:'great'}, {set:{thirstyGame:2}}, {shells:2, note:'The thirsty monkey gives you 2 🐚.'}], lost:[{set:{thirstyGame:1}}]}};
// What A at a crab on the shore does (chapter 1), each crab the same: pick it up, with a question on a word you know (the
// grab step: get it wrong, and it pinches you and scuttles off). The first is the hungry monkey's, for the feast, teaching
// 螃蟹; after that, you say which it is (这是螃蟹), and let it go.
const CRAB_TALK = [
  {if:{crab:'asked', holding:{crab:false}}, do:[{grab:'螃蟹', label:'Pick it up!', missed:'Ouch! The crab pinched you, and scuttled off. Try another: come at it from the front or behind.'},
    {newWord:'螃蟹', met:true, note:'A crab! It can only walk sideways.'}, {hold:'螃蟹', for:'crab'}, {scuttle:true},
    {message:'You caught a {螃蟹}! Take it to the hungry monkey, at the feast’s tables.'}]},
  {if:{new:'螃蟹'}, do:[{grab:'螃蟹', label:'Pick it up!', missed:'Ouch! The crab pinched you, and scuttled off.'},
    {newWord:'螃蟹', met:true, note:'A crab! It can only walk sideways.'}, {scuttle:true}, {message:'You let the {螃蟹|crab} go, and it scuttles off.'}]},
  {do:[{grab:'螃蟹', label:'Pick it up!', missed:'Ouch! The crab pinched you, and scuttled off.'},
    {gap:{sentence:'这 是 螃蟹', en:'This is a crab.', word:'螃蟹', others:['虾', '鱼'], pic:'螃蟹'}}, {scuttle:true}, {message:'You let the {螃蟹|crab} go, and it scuttles off.'}]}
];
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
  // chapter step), and its own items on the checklist below. The prologue is everything from being born to
  // becoming king and counting the troop in; chapter 1 is the troop's new home and the feast, then leaving.
  chapters: [
    {name:'Prologue', title:'The Water Curtain Cave'},
    {name:'Chapter 1', title:'The Great Feast'}
  ],

  // What this area remembers in your save, and the values a new game starts with.
  //   chapter the chapter you're in, counting from 0 (the prologue), so 1 is chapter 1
  //   elder   0 not spoken to yet, 1 said hello, 2 told you about the animals
  //   gate    true once the rocks have rolled away
  //   climb   up the stream: 0 not yet, 1 setting off alone up the mountain path, 2 found the waterfall,
  //           3 leading the troop up to it (they follow you), 4 brought the troop up to it
  //   boar    1 once you've chased the wild boar off the path
  //   story   true once you've read the story at the waterfall
  //   cave    after the story: 0 not dared yet, 1 dared to jump, 2 been inside the cave, 3 told the old monkey,
  //           4 led the troop in, 5 heard it's home, 6 made king
  //   count   how many of the troop you've counted into the cave
  //   squirrelPlayed, goatPlayed  1 once that friend on the way up the stream has played a word game with you, 2 once
  //           you've won its present (a peach from the squirrel, an apple from the goat)
  //   ledgeTip 1 once the goat below the waterfall has told you that you can hop down the banks
  //   home    chapter 1, the troop's home ground beside the waterfall: 0 not yet, 1 the old monkey is going there with you,
  //           2 you've been there with him
  //   build   chapter 1, building the school: 0 not yet, 1 the big monkey has marked out its plot and wants wood and small
  //           stones (the way up to the pine wood is open), 2 you've brought them (and the troop builds it at once; a game
  //           saved before 22 October 2026 can be at 2 with just the school's frame up, until you talk to the big monkey)
  //   school  chapter 1: 0 not built yet, 1 the troop has built it (the scene), 2 you've been in, and the class has greeted
  //           its teacher, the old monkey
  //   woodIn  chapter 1: 1 once you've been into the pine wood (the first time, a wolf howls far off)
  //   woodSquirrel chapter 1: 1 once the squirrel in the pine wood has shown you the dry pines (its ! goes then)
  //   schoolFlowers chapter 1: true once the big monkey has planted the flowers you brought him in front of the school
  //   homeName 1 once you know every part of your home's name (花, 果 in 水果, and 山): a message says so, and the sign by
  //           your stone sparkles; 2 once you've read it there, and seen how the name is made
  //   trainee1, trainee2  chapter 1: 1 once that little monkey in training on the hillside has stopped you for a word game
  //           (the first by the stepping stones, the second on the middle terrace), 2 once you've won its present
  //   tower   chapter 1: the little monkeys building a tower of stones at the home ground: 1 once they've said hello, 2 once
  //           you've counted its stones with them
  //   feast   chapter 1, the great feast: 0 not yet, 1 the old monkey has told you about it (teaching 有), 2 the troop has set
  //           up its tables under the big tree at the home ground, as you watched (with no bowls yet: tableware), 3 the hungry
  //           monkey has told you what the feast still needs: honey (teaching 没有)
  //   bees    chapter 1, the bees: 0 not yet, 1 the hungry monkey wants honey, and the troop has cleared the way east along the
  //           stream (the riverside) to find the bees, 2 you've found the bees' valley (百花谷), where the bees and the wasps
  //           hide in the tall flowers, 3 all six bees there are your friends, and the swarm in front of the queen's old tree
  //           has flown aside, 4 you've met the queen bee (蜂王), who wants you to win her word game, 5 you've won her over, and
  //           she and her swarm are following you home, 6 they're home, by the wildflowers, 7 the hungry monkey has seen them,
  //           8 the troop has marked out a hive for them by the wildflowers, 9 it's built, 10 the queen and her swarm live in it
  //           (and the hungry monkey's honey request is asked), 11 the honey you brought is in the bowl on the feast's table
  //   beeFriends chapter 1: how many of the bees in their valley you've made friends with, up to six
  //   queenOut chapter 1: the queen bee is out of her old tree (she goes back in if you don't win her word game)
  //   cow     chapter 1, the cow: 0 not yet, 1 the thirsty monkey has told you there's a cow on the mountain, and the troop
  //           has cleared the way south, past the bridge at the bottom of the home ground, 2 you've been into the pasture
  //           (牧场; a moo, from beyond the pines), 3 you've found the cow by its spring (teaching 牛), scared of the wolves,
  //           4 you've won its trust with its word game, and it follows you home (lose a battle on the way, and it runs back
  //           to its spring, till you fetch it: following), 5 it's home, standing by the thirsty monkey near the road,
  //           6 the troop has marked out a plot for its home, by the road, 7 they've built it a pen there (the fences, a
  //           shelter with hay, a trough of fresh water), and it follows you to its gate, 8 it's in its pen, its home, and it's
  //           given you some of its milk, its thank-you (teaching 牛奶; the thirsty monkey's milk request is asked), 9 he's
  //           drunk some, and the rest is for the feast
  //   tableware chapter 1: the feast's tables, set out bare (feast 2), till you bring the bowls the hungry monkey wants from
  //           the cave (the bowls request): 1 the bowls are on them, 2 the big monkey's chopsticks too (teaching 筷子; in a game
  //           whose tables were out before 27 October 2026, 2 at once, and A at the big table teaches it)
  //   spoons  chapter 1: 1 once the yoghurt's on the feast's second table, a spoon in it, which the big monkey made, 2 once he's
  //           told you so (teaching 勺子)
  //   milkTable chapter 1: the feast's second table, beside the first (set out with the first, bare): 1 the cow's
  //           milk is on it, 2 yoghurt too, 3 and a round cheese, from the little dairy
  //   dairy   chapter 1, the little dairy by the cow's pen: 0 not yet, 1 the thirsty monkey is making something from the milk
  //           (8 questions: dairyWait), 2 it's ready, 3 you've seen it: yoghurt (teaching 酸奶), and he's making something
  //           else, 4 that's ready, 5 you've seen it: cheese (teaching 奶酪)
  //   dairyTurn chapter 1: your question count when he started making something (the countFrom step)
  //   cowWolf chapter 1: 1 once you've beaten the bear (a wolf till 27 October 2026) that rears up at the big rocks in the
  //           pasture as you lead the cow home
  //   cowSeen chapter 1: 1 once you've seen the lost cow, far below, from the lookout on the south slope
  //   logSeen chapter 1: 1 once you've come to the hollow pine fallen along the gully in the dark pines
  //   cowWaits chapter 1: where the cow you're leading home has stopped, waiting for you: 'grass' by the long grass in the
  //          dark pines (scared of the wolves in it), 'slope' on the south slope (hungry); 0 while it follows you
  //   pinesWolf chapter 1: 1 once you've gone first into the long grass in the dark pines, and chased off its wolf
  //   garden   chapter 1: 1 once the big monkey has asked for seeds for a garden by the stream, and marked it out
  //   melonPlanted chapter 1: 1 once the troop has planted the wild watermelon seeds you brought, in the garden, 2 once
  //           they're ripe (8 questions later: melonWait), 3 once the big monkey has picked them, for the feast, 4 once
  //           they're on the feast's table for the garden's fruit (and the same for the grapes and the bananas)
  //   grapePlanted chapter 1: 1 once the troop has set up a trellis in the garden and planted the wild grape seeds by it
  //   cliffsSeen chapter 1: 1 once you've been to the cliffs (山崖), where the wild grapes grow
  //   bananaPlanted chapter 1: 1 once the troop has planted the wild banana seeds you brought: two banana plants in the garden
  //   springsSeen chapter 1: 1 once you've been to the hot spring valley (温泉谷), where the wild bananas grow
  //   melonTurn, grapeTurn, bananaTurn chapter 1: your question count when each was planted (the countFrom step)
  //   fruitTable chapter 1: 1 once the troop has set out the feast's table for the garden's fruit, beside the big one
  //   pastureTracks, streamSeen, pastureLog, rabbitTold  chapter 1, the way through the dark pines (the pasture's, till 27 October 2026): 1 once you've seen the
  //           cow's hoofprints; once you've come to the stream they go into; once you've knocked the dead pine down across it,
  //           a bridge; once the rabbit by the way has told you where the cow went (its word game won)
  //   littleGame the prologue: the little monkey's word game, once it's your friend: 0 not played yet (it has a !), 1 played,
  //           2 won (its present: once)
  //   hungryGame the prologue: the hungry monkey's word game, once he's eaten: as littleGame
  //   thirstyGame the prologue: the thirsty monkey's word game, once you've brought him water: as littleGame
  //   meadowCheck the prologue: 1 once you've shown the old monkey the meadow's five words (a match), which the rocks wait for
  //   lessonWait chapter 1: 1 while the teacher's next new word waits for you to practise (lessonGap), till you're told it's ready
  // The game adds each request below ('not asked', 'asked' or 'done'), what you're holding
  // for each request, and done: true once you've passed the area's word test (the troop's send-off, to come).
  progress: {chapter:0, elder:0, gate:false, climb:0, boar:0, story:false, cave:0, count:0, squirrelPlayed:0, goatPlayed:0, ledgeTip:0, lookTip:0, home:0, build:0, school:0, woodIn:0, woodSquirrel:0, littleGame:0, hungryGame:0, thirstyGame:0, meadowCheck:0, lessonWait:0, schoolFlowers:false, homeName:0, trainee1:0, trainee2:0, tower:0, feast:0, bees:0, beeFriends:0, queenOut:false, cow:0, cowWolf:0, tableware:0, spoons:0, milkTable:0, dairy:0, dairyTurn:0, cowSeen:0, logSeen:0, pastureTracks:0, streamSeen:0, pastureLog:0, rabbitTold:0, cowWaits:0, pinesWolf:0, mushroomGame:0, garden:0, melonPlanted:0, grapePlanted:0, cliffsSeen:0, bananaPlanted:0, springsSeen:0, melonTurn:0, grapeTurn:0, bananaTurn:0, fruitTable:0, shop:0, fishing:0, fishTable:0, shrimpTable:0, crabTable:0, seaSeen:0, exam:0, feastHeld:0, raft:0},

  // Numbers that text can show as {name}, and that an if can check. count is one of:
  // wordsLearned, animalsFound, animals (how many there are to find), animalsLeft, shells, or picked
  // (how many you've picked for a request, given as request). The animals are the prologue's, or a
  // chapter's (chapter), or just those of one place in it (place).
  // minus takes some away; max is the most it can be.
  counters: {
    newWords: {count:'wordsLearned', minus:1, max:4},   // words learned apart from one (you're born knowing 石头), up to 4
    animals: {count:'animals'},
    found: {count:'animalsFound'},
    animalsLeft: {count:'animalsLeft'},
    hillAnimalsLeft: {count:'animalsLeft', chapter:1, place:'hillside'},   // chapter 1's animals: the fox hiding on the hillside, not met yet,
    woodAnimalsLeft: {count:'animalsLeft', chapter:1, place:'pineWood'},   // and the deer in the pine wood
    riverAnimalsLeft: {count:'animalsLeft', chapter:1, place:'riverside'},   // and the butterfly on the riverside, the way east to the bees
    pinesAnimalsLeft: {count:'animalsLeft', chapter:1, place:'darkPines'},   // and the owl in the dark pines, the way south to the cow
    beeCount: {count:'progress', key:'beeFriends'},   // the bees in their valley you've made friends with (of six)
    flowersPicked: {count:'picked', request:'flowers'},
    shrimpCaught: {count:'picked', request:'shrimp'},   // shrimp caught for the hungry monkey (three)   // flowers picked for the big monkey (one of each colour)
    shells: {count:'shells', max:10},   // your shells, up to the headband's price (the 老板 shows ? once you can afford it)
    caveThings: {count:'known', words:['床', '碗', '桌子']},   // things you've found in the Water Curtain Cave (桥, bridge, is chapter 1's, on its bridges)
    // the words for the meadow the old monkey wants you to learn, which nothing else makes you learn, each as the task
    // calls it till you've found it ({left:meadowWords}) (decided 22 October 2026: you could leave without them)
    meadowWords: {count:'known', words:['山', '河', '树', '鱼', '鸟'],
      called:{'山':'the mountain', '河':'the river', '树':'a tree', '鱼':'the fish in the pond', '鸟':'a bird'}},
    troopIn: {count:'known', words:['一', '二', '三']},   // the troop counted in (each count teaches its number)
    nameParts: {count:'known', words:['花', '山', '水果']},   // the parts of your home's name you know: 花, 山, and the 果 of 水果
    woodGot: {count:'picked', request:'wood'},       // pieces of wood you've got for the school, from the dry pines
    stonesGot: {count:'picked', request:'stones'},   // and small stones
    bowlsGot: {count:'picked', request:'bowls'},   // the bowls for the feast, from the cave
    cowGrass: {count:'picked', request:'cowFood'},   // the handfuls of grass for the hungry cow
    birdsShooed: {count:'shooed'},   // the birds you've shooed off the wild melons, in the melon field
    numbersKnown: {count:'known', words:['四', '五', '六', '七', '八', '九', '十']},   // the numbers you've learned at school
    coloursKnown: {count:'known', words:['红色', '黄色', '白色', '黑色', '蓝色', '绿色', '棕色', '橙色', '粉色']},   // and the colours
    firstLessons: {count:'known', words:['四', '五', '六', '红色', '黄色', '白色']},   // the words of the first two lessons, Maths and Art (all six: PE opens)
    practised: {count:'practised'},   // questions you've answered since your last lesson that taught a new word (up to its lessonGap)
    dairyWait: {count:'since', key:'dairyTurn', max:8},   // and since the thirsty monkey started making something at the little dairy (8 to make it)
    melonWait: {count:'since', key:'melonTurn', max:8}, grapeWait: {count:'since', key:'grapeTurn', max:8}, bananaWait: {count:'since', key:'bananaTurn', max:8}   // and since each fruit was planted in the garden (8 to ripen)
  },

  // Lessons at school: each series is a subject on the timetable (js/timetable.js), its name (subject), its little picture
  // on the chart on the classroom wall (icon), and what a lesson is (about: its first, and one of the rest), teaching its
  // words in lessons, in order: its first few in the first (first), then one a lesson, the next once you've got the last
  // one right twice. You choose the lesson (decided 28 October 2026; the teacher took turns between them till then), or
  // practice, as at the practice post. kind: what its lessons are (count: the teacher counts
  // things onto his table, teaching the new number with his line for it, teach, then asks how many there are, with his
  // question about each of the things; paint: he opens a pot of the new colour, teaching it, then wants paints, and if
  // the colour is for a part of the school, paint, the class goes out and paints it, in its scene, scenes); by: who
  // teaches it; note: on the new word's card.
  // After a lesson that teaches new words, the next new word waits till you've answered this many more questions anywhere:
  // a practice lesson (8 words to match and a sentence), a few animals' games, a battle or two (decided 26 October 2026, after
  // measuring the game's pacing: the school's sixteen words could all come in one sitting, each practised only in its own
  // lesson). Till then, the timetable and your tasks say how far you are; doing a lesson again or practising never waits.
  lessonGap: {questions:8},
  // After any new word, the next one a character gives you waits till you've answered this many more questions, anywhere
  // (decided 30 October 2026, after measuring the game's pacing: after the first colour lesson, 有, 不客气, 筷子 and 没有
  // came with one question between them). A talk part that teaches one says so (waits:true); talk to them sooner, and
  // they offer a quick word game first (ask), just for practice, then carry on. Words you find yourself never wait.
  wordGap: {questions:4, word:'猴子', ask:'Something new is coming! But first, a few words to practise. Play a quick word game?', notYet:'Learn a few more words first, then come back.'},
  // When you can run, holding B as you walk (decided 28 October 2026): once PE has taught you 跑.
  running: {knows:'跑'},
  lessons: [
    // The first lesson of each series teaches its first three words, one after another (first: decided 24 October 2026,
    // school lessons are the exception to one new word at a time): two lessons, and you can count six bees and know the
    // colours of the big monkey's flowers. After that, one a lesson.
    {id:'numbers', kind:'count', by:'elder', if:{school:{atLeast:2}}, words:['四', '五', '六', '七', '八', '九', '十'], first:3,
      subject:{zh:'数学', py:'shùxué', en:'Maths'}, icon:'dots', about:{first:'Three new numbers, then counting', one:'A new number, then counting'},
      note:'The teacher counts peaches onto his table, one by one.',
      teach:{'四':'count4', '五':'count5', '六':'count6', '七':'count7', '八':'count8', '九':'count9', '十':'count10'},
      things:[{word:'桃子', ask:'howManyPeaches', on:'table'}, {word:'苹果', ask:'howManyApples', on:'table'}, {word:'碗', ask:'howManyBowls', on:'table'},
        {word:'猴子', ask:'howManyMonkeys', on:'grass'}, {word:'兔子', ask:'howManyRabbits', on:'grass'}, {word:'鸟', ask:'howManyBirds', on:'grass'}]},
    // red, yellow and white come first (decided 22 October 2026: they were the prologue's, taught by the flowers the big
    // monkey wanted, which wait for the colour lessons now). Red paints the school's lanterns; the rest of the school
    // stays as it was built (decided 24 October 2026: each colour painted a part of it, the roof blue, the door black…)
    {id:'colours', kind:'paint', by:'elder', if:{school:{atLeast:2}}, words:['红色', '黄色', '白色', '黑色', '蓝色', '绿色', '棕色', '橙色', '粉色'], first:3,
      subject:{zh:'美术', py:'měishù', en:'Art'}, icon:'paint', about:{first:'Three new colours, then choosing paints', one:'A new colour, then choosing paints'},
      note:'The teacher opens a pot of paint.',
      teach:{'红色':'thisRed', '黄色':'thisYellow', '白色':'thisWhite', '黑色':'thisBlack', '蓝色':'thisBlue', '绿色':'thisGreen', '棕色':'thisBrown', '橙色':'thisOrange', '粉色':'thisPink'},
      paint:{'红色':'lanterns'}, scenes:{'红色':'paintLanterns'}},
    // PE (体育, decided 28 October 2026), once the first two lessons are done: out on the sports ground (操场, at), through
    // a gap in the trees at the home ground's back left (out: what you're told as the class goes out, and back, as it comes
    // back in; class: where the teacher and the troop stand to watch, each [x, y, facing]). Its first lesson is a race
    // (race): you and two classmates (racers, each at the start of its lane; you, yours and the way you face) to the finish
    // (to: its column). The teacher starts it (start, teaching 跑: you know 一 二 三), and they run a step every ms, faster
    // than you walk and slower than you run (setting off when you do, so you can't lose for being slow to start); at the
    // finish he says end, however you did, and the first time you win, there's a prize of shells (go, won and lost: what
    // you're told). Its second is a jog round the track (jog): he says start (teaching 跑步) and leads the class round it
    // (loop: its corners), a step every ms, you behind him and your classmates behind you. Then questions on the new word,
    // as in every lesson.
    {id:'pe', kind:'pe', by:'elder', if:{firstLessons:6}, words:['跑', '跑步'],
      subject:{zh:'体育', py:'tǐyù', en:'PE'}, icon:'runner', about:{'跑':'A race, out on the sports ground', '跑步':'Going running round the sports ground'},
      note:{'跑':'The teacher starts a race on the sports ground.', '跑步':'The class goes running round the sports ground.'},
      at:'sportsGround', out:'The class goes out to the sports ground.', back:'The class goes back in.',
      class:{elder:[1, 4, 'right'], troop1:[5, 2, 'down'], troop3:[9, 2, 'down'], hungry:[12, 2, 'down']},
      race:{word:'跑', you:[2, 4, 'right'], racers:{playful:[2, 3], troop2:[2, 5]}, to:12, ms:235, start:'readyRun', end:'veryGood',
        go:'Race to the red ribbon: hold B as you walk, to run!', won:'You won the race!', lost:'Your classmates won this time. Hold B as you walk, to run!', prize:3},
      jog:{word:'跑步', start:'letsGoRunning', end:'veryGood', loop:[[2, 3], [12, 3], [12, 5], [2, 5]], ms:300}}
  ],

  // Counting games with characters (the countGame step), as in a number lesson: what you count (thing: its word, where
  // they are, on, and the question, ask), what the card asking you to play says (start), a message while you know too few
  // numbers to count with (notYet), and what happens if you get them all right (win).
  countGames: {
    // the little monkeys' tower of stones at the home ground
    tower: {thing:{word:'石头', ask:'howManyStones', on:'tower'}, start:'Count the stones in their tower? Each right answer earns a 🐚 if that number needs practice.',
      notYet:'They count the stones as they put them on. Learn more numbers, then come back and count with them!', win:[{say:'great'}]}
  },

  // Where you practise your words now (the title screen and the Word Scroll say so): the first whose if matches.
  practiseAt: [{if:{school:{atLeast:1}}, text:'in a lesson at school'}, {text:'at the practice post'}],

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
    {id:'elder', if:{elder:0}, text:'Say {你好} to the old monkey, by your {石头}', arrow:'elder'},
    {id:'elder2', if:{elder:1, newWords:{atLeast:4}}, text:'Talk to the old monkey again', arrow:'elder'},
    {id:'learn4', if:{elder:1, newWords:{below:4}}, text:'Learn 4 words: walk up to things that sparkle ✨ and press A ({newWords}/4)', arrow:{sparkle:true}},   // (the arrow over the nearest thing that sparkles)
    // (the prologue's animals: a game already in chapter 1 when the sheep came, 23 October 2026, can still meet it in the meadow)
    {id:'animals', if:{chapter:0, elder:{atLeast:2}, animalsLeft:{atLeast:1}}, text:'Find the {动物|animals}: in rustling grass, out in the open, up a tree, on a cliff ({found}/{animals})'},
    {id:'meadowCheck', if:{elder:{atLeast:2}, chapter:0, gate:false, meadowWords:5, meadowCheck:0}, text:'Show the old monkey the words for the meadow', arrow:'elder'},
    {id:'meadow', if:{elder:{atLeast:2}, chapter:0, meadowWords:{below:5}}, text:'Learn the words for the meadow ({meadowWords}/5). Still to find: {left:meadowWords}. Things that sparkle ✨ have words.'},
    {id:'h1', if:{hungry:'asked', holding:{hungry:false}, wanted:{hungry:false}}, text:'Find some {水果|fruit} for the hungry monkey'},
    {id:'h1b', if:{hungry:'asked', holding:{hungry:false}, wanted:{hungry:true}}, text:'Find the {wanted:hungry} the hungry monkey wants'},
    {id:'h2{holding:hungry}', if:{hungry:'asked', holding:{hungry:true}}, text:'Give the {holding:hungry} to the hungry monkey', arrow:'hungry'},
    {id:'t1', if:{thirsty:'asked', holding:{thirsty:false}}, text:'Collect {水} from the {河} or the pond', arrow:[11, 9]},
    {id:'t2', if:{thirsty:'asked', holding:{thirsty:true}}, text:'Give the {水} to the thirsty monkey', arrow:'thirsty'},
    {id:'climb0', if:{gate:true, climb:0}, text:'Talk to the old monkey, where the {石头|rocks} were', arrow:'elder'},
    {id:'climb1', if:{climb:1}, text:'Follow the path up beside the {河}, and find where the water comes from', arrow:[5, 1, 'falls']},
    {id:'climb2', if:{climb:2}, text:'Go back down and tell the old monkey what you found', arrow:'elder'},
    {id:'climb3', if:{climb:3}, text:'Lead the troop up the path beside the river, to the {瀑布}', arrow:[7, 2, 'falls']},
    {id:'fall', if:{climb:4, story:false}, text:'Read the story at the {瀑布}', arrow:[5, 1, 'falls']},
    {id:'shop1', if:{knows:'老板', new:'头带'}, text:'See what the {老板} sells', arrow:'boss'},
    {id:'fishRod', if:{fish:'asked', fishing:0}, text:'Ask the fishing monkey by the stream how to catch a big {鱼}', arrow:'fisher'},
    {id:'fishCatch', if:{fish:'asked', fishing:{atLeast:1}, holding:{fish:false}}, text:'Catch a big {鱼} for the feast: face the stream and press A', arrow:[22, 18, 'homeGround']},   // (its arrow on the stream, by the fishing monkey: not over you as you fish)
    {id:'fishBack', if:{fish:'asked', holding:{fish:true}}, text:'Take the big {鱼} to the hungry monkey', arrow:'hungry'},
    {id:'shrimpCatch', if:{shrimp:'asked', holding:{shrimp:false}}, text:'Catch three {虾} in the clear brook on the riverside, above the bridge ({shrimpCaught}/3)', arrow:[27, 4, 'riverside']},
    {id:'shrimpBack', if:{shrimp:'asked', holding:{shrimp:true}}, text:'Take the {虾} to the hungry monkey', arrow:'hungry'},
    {id:'crabCatch', if:{crab:'asked', holding:{crab:false}}, text:'Catch a {螃蟹} on the shore, below the meadow: come at one from the front or behind', arrow:{place:'shore'}},
    {id:'crabBack', if:{crab:'asked', holding:{crab:true}}, text:'Take the {螃蟹} to the hungry monkey', arrow:'hungry'},
    {id:'exam', if:{crabTable:{atLeast:1}, exam:0}, text:'Every food is on the feast’s {桌子|tables}! Your {老师} has an exam for you at school', arrow:'elder'},
    {id:'feastGo', if:{exam:1, feastHeld:0}, text:'The troop is ready for the feast: go to the big {树} in the middle of the home ground', arrow:[17, 8, 'homeGround']},
    {id:'raftWalk', if:{raft:1}, text:'Lead the troop down to the shore, below the meadow, to the edge of the {海}', arrow:[11, 12, 'shore']},
    {id:'raftBoard', if:{raft:2}, text:'Your {木筏} is ready at the edge of the {海|sea}: press A at it when you’re ready to go', arrow:[11, 13, 'shore']},
    {id:'shopMoved', if:{shop:1}, text:'The {老板} has come up to the home ground: go and see him, by the way in from the {瀑布}', arrow:'boss'},
    {id:'dare', if:{story:true, cave:0}, text:'Talk to the old monkey: what could be behind the {瀑布}?', arrow:'elder'},
    {id:'jump', if:{cave:1}, text:'{跳} through the {瀑布}', arrow:[4, 1, 'falls']},
    {id:'explore', if:{cave:2, caveThings:{below:3}}, text:'Look around the {洞} ({caveThings}/3)'},
    {id:'tell', if:{cave:2, caveThings:3}, text:'Tell the old monkey about the {洞}', arrow:'elder'},
    {id:'lead', if:{cave:3}, text:'Lead the troop into the {洞}: jump through the waterfall', arrow:[4, 1, 'falls']},
    {id:'home', if:{cave:4}, text:'Talk to the old monkey in the {洞}', arrow:'elder'},
    {id:'home0', if:{chapter:1, home:0}, text:'Talk to the old monkey in the {洞}', arrow:'elder'},
    {id:'home1', if:{home:1}, text:'Lead the old monkey to the troop’s new home ground, along beside the {瀑布}', arrow:[19, 2, 'falls']},
    {id:'wood', if:{wood:'asked', holding:{wood:false}}, text:'Find three pieces of {木头} in the pine wood ({woodGot}/3)', arrow:{place:'pineWood'}},
    {id:'stones', if:{stones:'asked', holding:{stones:false}}, text:'Find three small {石头|stones} in the pine wood ({stonesGot}/3)', arrow:{place:'pineWood'}},
    // back to the big monkey once you have both, or the other's done (decided 26 October 2026: with just one, it sent you
    // back, and you made two trips)
    {id:'woodBack', if:{wood:'asked', holding:{wood:true}, stones:'done'}, text:'Take the {木头} to the big monkey', arrow:'big'},
    {id:'stonesBack', if:{stones:'asked', holding:{stones:true}, wood:'done'}, text:'Take the small {石头|stones} to the big monkey', arrow:'big'},
    {id:'buildBack', if:{wood:'asked', stones:'asked', holding:{wood:true, stones:true}}, text:'Take the {木头} and the small {石头|stones} to the big monkey', arrow:'big'},
    {id:'build', if:{build:2, school:0}, text:'Talk to the big monkey: the troop is ready to build the {学校}', arrow:'big'},
    {id:'goIn', if:{school:1}, text:'Go into the {学校}, and talk to the old monkey at the front of the class', arrow:'elder'},
    {id:'classmates', if:{school:{atLeast:2}, new:'同学'}, text:'Talk to the little monkey in the {学校}', arrow:'playful'},
    // the feast: once the first two lessons have taught you 四 五 六 and 红色 黄色 白色, the old monkey has news
    {id:'news', if:{school:{atLeast:2}, feast:0, numbersKnown:{atLeast:3}, coloursKnown:{atLeast:3}}, text:'Talk to the old monkey at the {学校}: he has news', arrow:'elder'},
    {id:'feastTable', if:{feast:1}, text:'Go to the big {树} in the middle of the home ground', arrow:[17, 7, 'homeGround']},
    {id:'hungryTable', if:{feast:2, bowls:'not asked'}, text:'Talk to the hungry monkey by the big {桌子}', arrow:'hungry'},
    {id:'bowls', if:{bowls:'asked', holding:{bowls:false}}, text:'Fetch six {碗|bowls} from the Water Curtain Cave ({bowlsGot}/6)', arrow:[9, 3, 'cave']},
    {id:'bowlsBack', if:{bowls:'asked', holding:{bowls:true}}, text:'Take the {碗|bowls} to the hungry monkey, at the feast’s tables', arrow:'hungry'},
    {id:'chopsticks', if:{tableware:1}, text:'The big monkey has made something for the feast: go and see him', arrow:'big'},
    {id:'feastNeeds', if:{feast:2, tableware:{atLeast:2}}, text:'Ask the hungry monkey what the feast still needs', arrow:'hungry'},
    {id:'bees1', if:{bees:1}, text:'Follow the stream east, along the riverside, to find where {蜜蜂|bees} live', arrow:{place:'flowerValley'}},
    {id:'bees2', if:{bees:2}, text:'Make friends with the six {蜜蜂|bees} hiding in the tall flowers ({beeCount}/6)', arrow:{place:'flowerValley'}},   // (no arrow in the valley: that's the game)
    {id:'bees3', if:{bees:3}, text:'Find out who lives in the old hollow {树}, up in the bees’ valley', arrow:[25, 5, 'flowerValley']},
    {id:'bees4', if:{bees:4}, text:'Win over the {蜂王|queen bee} with her word game, at her old tree', arrow:[25, 5, 'flowerValley']},
    {id:'bees5', if:{bees:5}, text:'Lead the {蜂王|queen bee} and her bees home, back along the riverside', arrow:{place:'homeGround'}},
    {id:'bees6', if:{bees:6}, text:'Tell the hungry monkey the {蜜蜂|bees} are home', arrow:'hungry'},
    {id:'bees7', if:{bees:7}, text:'Talk to the {蜂王|queen bee} by the wildflowers', arrow:'queen'},
    {id:'honey1', if:{honey:'asked', holding:{honey:false}}, text:'Take some {蜂蜜|honey} from the bees’ hive, for the hungry monkey', arrow:[28, 4, 'homeGround']},
    {id:'honey2', if:{honey:'asked', holding:{honey:true}}, text:'Take the {蜂蜜} to the hungry monkey', arrow:'hungry'},
    // the cow: find it, lost in the pasture south of the home ground (no arrow in the pasture: finding it is the game)
    {id:'cowLook', if:{cow:{atLeast:1, below:3}, cowSeen:0}, text:'Find the lost {牛|cow}: south over the bridge, and down the slope. On the way, look for it from the lookout!', arrow:[6, 17, 'southSlope']},
    {id:'cow1', if:{cow:{atLeast:1, below:3}, cowSeen:1}, text:'Find the lost {牛|cow}: you saw it far below, by a spring beyond the dark pines', arrow:{place:'pasture'}},
    {id:'cowStream', if:{streamSeen:1, pastureLog:0, cow:{below:3}}, text:'Get over the stream in the pines: knock the dead pine on its bank down with your {棍子}, so it falls across', arrow:[24, 17, 'darkPines']},
    {id:'cow3', if:{cow:3}, text:'Win the {牛}’s trust with its word game, by its spring in the pasture', arrow:'cow'},
    {id:'cow4', if:{cow:4, following:{cow:true}}, text:'Lead the {牛} home to the thirsty monkey, back through the pines. Watch out for wolves!', arrow:'thirsty'},
    {id:'cowWolf', if:{cow:4, cowWaits:'grass'}, text:'The {牛} won’t go into the long grass in the dark pines: go first, and chase the wolves off', arrow:[16, 25, 'darkPines']},
    {id:'cowFood', if:{cow:4, cowWaits:'slope', holding:{cowFood:false}}, text:'The {牛} is hungry: pick it some fresh {草} by the brook, on the south slope ({cowGrass}/3)', arrow:[11, 25, 'southSlope']},
    {id:'cowFed', if:{cow:4, cowWaits:'slope', holding:{cowFood:true}}, text:'Give the {草} to the {牛}', arrow:'cow'},
    {id:'cowRan', if:{cow:4, following:{cow:false}, cowWaits:0}, text:'The {牛} ran back to its spring, frightened: go and fetch it', arrow:'cow'},
    // its safe home: the troop builds it a pen by the road, and you lead it in; then its thank-you, milk
    {id:'cow5', if:{cow:5}, text:'Talk to the thirsty monkey: the troop is ready to build the {牛} a home', arrow:'thirsty'},
    {id:'cow7', if:{cow:7, following:{cow:true}}, text:'Lead the {牛} in through the gate of its new home', arrow:[24, 11, 'homeGround']},
    {id:'cow7b', if:{cow:7, following:{cow:false}}, text:'Talk to the {牛}, and lead it in through the gate of its new home', arrow:'cow'},
    // chapter 1: the garden: seeds from wild fruit, for the big monkey to plant (melons first, birds pecking at them)
    {id:'melonSeeds', if:{melonSeeds:'asked', holding:{melonSeeds:false}, birdsShooed:{below:5}}, text:'Wild melons grow in a sunny field east off the south slope, but {鸟|birds} keep pecking at them: shoo them away ({birdsShooed}/5)', arrow:{place:'melonField'}},
    {id:'melonSeeds2', if:{melonSeeds:'asked', holding:{melonSeeds:false}, birdsShooed:{atLeast:5}}, text:'The {鸟|birds} are gone, and the melons are safe: take some {种子|seeds} from one, for the garden', arrow:[13, 11, 'melonField']},
    {id:'melonSeedsBack', if:{melonSeeds:'asked', holding:{melonSeeds:true}}, text:'Take the {种子} to the big monkey, at the garden by the stream', arrow:'big'},
    {id:'grapeSeeds', if:{grapeSeeds:'asked', holding:{grapeSeeds:false}}, text:'Wild {葡萄|grapes} grow on the cliffs west off the hillside, halfway up: find a way down to them', arrow:{place:'cliffs'}},
    {id:'grapeSeedsBack', if:{grapeSeeds:'asked', holding:{grapeSeeds:true}}, text:'Take the {种子} from the wild {葡萄} to the big monkey, at the garden by the stream', arrow:'big'},
    {id:'bananaSeeds', if:{bananaSeeds:'asked', holding:{bananaSeeds:false}}, text:'Wild {香蕉|bananas} grow in a valley of hot springs, up the brook from the riverside', arrow:{place:'hotSprings'}},
    {id:'bananaSeedsBack', if:{bananaSeeds:'asked', holding:{bananaSeeds:true}}, text:'Take the {种子} from the wild {香蕉} to the big monkey, at the garden by the stream', arrow:'big'},
    // each fruit in the garden, growing (8 questions, anywhere), ripe, and going on the feast's table
    {id:'melonGrow', if:{melonPlanted:1}, text:'The {西瓜} in the garden are growing: practise your words, and they’ll soon be ripe ({melonWait}/8)'},
    {id:'melonRipe', if:{melonPlanted:2}, text:'The {西瓜} in the garden are ripe: go and see the big monkey', arrow:'big'},
    {id:'melonTable', if:{melonPlanted:3}, text:'Go and see the {西瓜} go on the feast’s {桌子}, by the big tree', arrow:[13, 8, 'homeGround']},
    {id:'grapeGrow', if:{grapePlanted:1}, text:'The {葡萄} on the trellis are growing: practise your words, and they’ll soon be ripe ({grapeWait}/8)'},
    {id:'grapeRipe', if:{grapePlanted:2}, text:'The {葡萄} on the trellis are ripe: go and see the big monkey', arrow:'big'},
    {id:'grapeTable', if:{grapePlanted:3}, text:'Go and see the {葡萄} go on the feast’s {桌子}, by the big tree', arrow:[13, 8, 'homeGround']},
    {id:'bananaGrow', if:{bananaPlanted:1}, text:'The {香蕉} in the garden are growing: practise your words, and they’ll soon be ripe ({bananaWait}/8)'},
    {id:'bananaRipe', if:{bananaPlanted:2}, text:'The {香蕉} in the garden are ripe: go and see the big monkey', arrow:'big'},
    {id:'bananaTable', if:{bananaPlanted:3}, text:'Go and see the {香蕉} go on the feast’s {桌子}, by the big tree', arrow:[13, 8, 'homeGround']},
    {id:'milk', if:{milk:'asked', holding:{milk:true}}, text:'Give the {牛奶} to the thirsty monkey', arrow:'thirsty'},
    {id:'milkTable', if:{cow:9, milkTable:0}, text:'Go and see the {牛奶} go on the feast’s second {桌子}', arrow:[22, 8, 'homeGround']},
    // the little dairy by the pen: the thirsty monkey makes something from the milk, ready once you've answered 8 more
    // questions anywhere (a chime, a message and a ! say so), then something else
    {id:'dairy', if:{milkTable:{atLeast:1}, dairy:0}, text:'Talk to the thirsty monkey: he wants to make something with the {牛奶}', arrow:'thirsty'},
    {id:'dairyWait', if:{dairy:1}, text:'The thirsty monkey is making something from the {牛奶}: practise, then come back and see what it is ({dairyWait}/8)'},
    {id:'dairyReady', if:{dairy:2}, text:'The thirsty monkey has made something from the {牛奶}: go and see what it is!', arrow:'thirsty'},
    {id:'dairyWait2', if:{dairy:3}, text:'The thirsty monkey is making something else from the {牛奶}: practise, then come back and see what it is ({dairyWait}/8)'},
    {id:'dairyReady2', if:{dairy:4}, text:'The thirsty monkey has made something else from the {牛奶}: go and see what it is!', arrow:'thirsty'},
    {id:'yogTable', if:{dairy:{atLeast:3}, milkTable:1}, text:'Go and see the {酸奶} go on the feast’s second {桌子}', arrow:[22, 8, 'homeGround']},
    {id:'spoons', if:{spoons:1}, text:'The big monkey has made something for the {酸奶}: go and see him', arrow:'big'},
    {id:'cheeseTable', if:{dairy:{atLeast:5}, milkTable:2}, text:'Go and see the {奶酪} go on the feast’s second {桌子}', arrow:[22, 8, 'homeGround']},
    {id:'hideSeek', if:{hiding:true}, text:'Find where the little monkey is hiding', clue:true},   // (its clue under it, to hear again; no arrow: that's the game)
    {id:'flowers', if:{flowers:'asked', holding:{flowers:false}}, text:'Pick a red, a yellow and a white {花} for the big monkey to plant ({flowersPicked}/3)', arrow:[27, 2, 'homeGround']},
    {id:'flowersBack', if:{flowers:'asked', holding:{flowers:true}}, text:'Take the {花} to the big monkey', arrow:'big'},
    {id:'count', if:{cave:{atLeast:5}, count:{below:3}}, text:'Count the troop in with the old monkey ({troopIn}/3)', arrow:'elder'},
    {id:'king', if:{chapter:0, count:3}, text:'Talk to the old monkey: the whole troop is in the {洞}', arrow:'elder'},
    // lessons at school: once one has taught you a new word, practise before the next (lessonGap; when you have, a message
    // says so: see events)
    {id:'practise', if:{school:{atLeast:2}, lessonWaits:true}, text:'Practise before your next lesson, {lessons:waiting}: answer questions anywhere ({practised}/8)', arrow:'elder'}
  ],

  // What the task box says when there are no tasks: the first whose if matches.
  hints: [
    {if:{raft:{atLeast:3}}, text:'Chapter 1 is complete! The next part of the journey is still to come. Until then, practise your words at the {学校}, or visit your {朋友|friends}.'},   // (after you sail away)
    {if:{elder:{atLeast:1}, hungry:'not asked'}, text:'Monkeys with a ! need help. Go and talk to them.'},
    {if:{elder:{atLeast:1}, thirsty:'not asked'}, text:'Monkeys with a ! need help. Go and talk to them.'},
    {if:{school:{atLeast:2}, coloursKnown:{atLeast:3}, flowers:'not asked'}, text:'You know three colours now! The big monkey has something to ask you.'},
    {if:{feast:{atLeast:3}, bees:0}, text:'The hungry monkey has something to ask you.'},
    {if:{feast:{atLeast:3}, cow:0}, text:'The thirsty monkey has news for you: look for his ! at the home ground.'},
    {if:{tableware:{atLeast:2}, feast:{atLeast:3}, garden:0}, text:'The big monkey has an idea for the feast: look for his ! at the home ground.'},   // (decided 28 October 2026: once the cow was home, nothing said so)
    {if:{bees:{atLeast:11}, fish:'not asked'}, text:'The hungry monkey has something to ask you: look for his ! by the feast’s {桌子|tables}.'},   // (a big fish)
    {if:{fishTable:{atLeast:1}, shrimp:'not asked'}, text:'The hungry monkey has something to ask you: look for his ! by the feast’s {桌子|tables}.'},   // (shrimp)
    {if:{shrimpTable:{atLeast:1}, crab:'not asked'}, text:'The hungry monkey has something to ask you: look for his ! by the feast’s {桌子|tables}.'},   // (a crab)
    {if:{bees:{atLeast:11}, milkTable:{atLeast:3}, melonPlanted:4, grapePlanted:4, bananaPlanted:4}, text:'The feast has {蜂蜜|honey}, milk, yoghurt and cheese, and fruit from the garden now! Take more honey from the hive for your bag, and {吃|eat} it to walk faster for a while. The rest of the feast’s food is coming soon. Until then, the {老师} gives you a lesson whenever there’s a new number or colour to learn, or your words need practice: after each new word, practise a little before the next.'},   // (once the garden's fruit is on the table too)
    {if:{bees:{atLeast:11}, milkTable:{atLeast:3}}, text:'The feast has {蜂蜜|honey}, milk, yoghurt and cheese now! Take more honey from the hive for your bag, and {吃|eat} it to walk faster for a while. The rest of the feast’s food is coming soon. Until then, the {老师} gives you a lesson whenever there’s a new number or colour to learn, or your words need practice: after each new word, practise a little before the next.'},   // (once the bees, the cow and its dairy are done: till then, they have tasks)
    {if:{school:{atLeast:2}, lesson:true}, text:'A new lesson is ready at the {学校}: {lessons:ready}. Talk to the {老师}, or look at the timetable on the classroom wall.'},   // (decided 28 October 2026: it said the rest of chapter 1 was coming soon)
    {if:{school:{atLeast:2}}, text:'The {老师} gives you a lesson whenever there’s a new number or colour to learn, or your words need practice: he has a ! then (after each new word, practise a little before the next). The rest of chapter 1 is coming soon.'},
    {if:{build:2}, text:'The troop is ready to build the {学校}: talk to the big monkey.'},
    {if:{home:2}, text:'The troop wants to build a {学校} first. The big monkey has something to ask you.'},
    {if:{done:true}, text:'Flower Fruit Mountain is complete. Practise in the {草} or visit your {朋友|friends}.'}
  ],

  // The area's checklist, shown in your tasks (Select): the chapter you're in (chapter, 0 if not given). Once
  // everything in a chapter is done, it's ready (ready:true in an if), and the next chapter can begin.
  // An item with show only appears once you've found it (show matches, such as the character having asked
  // you), or it's done; until then the list says there's more to find. exitTest marks the area's word test,
  // which comes last.
  checklist: [
    {text:'Say {你好} to the old monkey', done:{elder:{atLeast:1}}},
    {text:'Learn about {动物|animals} from the old monkey', show:{elder:{atLeast:1}}, done:{elder:{atLeast:2}}},
    {text:'Find the {动物|animals} ({found}/{animals})', show:{elder:{atLeast:2}}, done:{animalsLeft:0}},
    {text:'Learn the words for the meadow ({meadowWords}/5)', show:{elder:{atLeast:2}}, done:{meadowWords:5}},
    {text:'Bring the hungry monkey the {水果|fruit} it wants', show:{hungry:'asked'}, done:{hungry:'done'}},
    {text:'Bring {水} to the thirsty monkey', show:{thirsty:'asked'}, done:{thirsty:'done'}},
    {text:'Find where the {河} comes from', show:{gate:true}, done:{climb:{atLeast:2}}},
    {text:'Bring the troop up to the {瀑布}', show:{climb:{atLeast:2}}, done:{climb:{atLeast:4}}},
    {text:'Read the story at the {瀑布}', show:{climb:{atLeast:4}}, done:{story:true}},
    {text:'{跳} through the {瀑布}', show:{cave:{atLeast:1}}, done:{cave:{atLeast:2}}},
    {text:'Look around the {洞}', show:{cave:{atLeast:2}}, done:{caveThings:3}},
    {text:'Tell the old monkey what’s inside', show:{caveThings:3}, done:{cave:{atLeast:3}}},
    {text:'Lead the troop into the {洞}', show:{cave:{atLeast:3}}, done:{cave:{atLeast:4}}},
    {text:'Hear what the old monkey calls the {洞}', show:{cave:{atLeast:4}}, done:{cave:{atLeast:5}}},
    {text:'Count the troop into the {洞} ({troopIn}/3)', show:{cave:{atLeast:5}}, done:{count:3}},
    {text:'Become the troop’s {王}', show:{count:3}, done:{cave:{atLeast:6}}},
    // chapter 1: the great feast
    {chapter:1, text:'Go with the old monkey to the troop’s new home ground', done:{home:{atLeast:2}}},
    {chapter:1, text:'Bring {木头} and small {石头|stones} for the school', show:{build:{atLeast:1}}, done:{build:{atLeast:2}}},
    {chapter:1, text:'Find the {动物} hiding on the hillside', show:{build:{atLeast:1}}, done:{hillAnimalsLeft:0}},
    {chapter:1, text:'Find the {动物} that lives in the pine wood', show:{build:{atLeast:1}}, done:{woodAnimalsLeft:0}},
    {chapter:1, text:'Build the {学校} with the troop', show:{build:{atLeast:1}}, done:{school:{atLeast:1}}},
    {chapter:1, text:'Go to {学校}, and meet your {老师}', show:{school:{atLeast:1}}, done:{school:{atLeast:2}}},
    {chapter:1, text:'Meet your {同学}', show:{school:{atLeast:2}}, done:{knows:'同学'}},
    {chapter:1, text:'Learn to count to ten at {学校} ({numbersKnown}/7)', show:{school:{atLeast:2}}, done:{numbersKnown:7}},
    {chapter:1, text:'Learn nine colours at the {学校} ({coloursKnown}/9)', show:{school:{atLeast:2}}, done:{coloursKnown:9}},
    {chapter:1, text:'Plant {花|flowers} in front of the {学校}', show:{flowers:'asked'}, done:{schoolFlowers:true}},
    {chapter:1, text:'Help the {老板} open his new shop at the home ground', show:{shop:{atLeast:1}}, done:{shop:{atLeast:3}}},
    {chapter:1, text:'Catch a big {鱼} for the feast', show:{fish:'asked'}, done:{fish:'done'}},
    {chapter:1, text:'Catch three {虾|shrimp} for the feast', show:{shrimp:'asked'}, done:{shrimp:'done'}},
    {chapter:1, text:'Catch a {螃蟹|crab} for the feast', show:{crab:'asked'}, done:{crab:'done'}},
    {chapter:1, text:'Pass your {老师}’s exam at the {学校}', show:{crabTable:{atLeast:1}}, done:{exam:1}},
    {chapter:1, text:'Sit down to the great feast with the troop', show:{exam:1}, done:{feastHeld:1}},
    {chapter:1, text:'Sail away on your {木筏|raft}', show:{feastHeld:1}, done:{raft:{atLeast:3}}},
    {chapter:1, text:'Hear the old monkey’s news at the {学校}', show:{school:{atLeast:2}, numbersKnown:{atLeast:3}, coloursKnown:{atLeast:3}}, done:{feast:{atLeast:1}}},
    {chapter:1, text:'See the big {桌子} set up for the feast', show:{feast:{atLeast:1}}, done:{feast:{atLeast:2}}},
    {chapter:1, text:'Fetch {碗|bowls} for the feast from the Water Curtain Cave', show:{feast:{atLeast:2}}, done:{bowls:'done'}},
    {chapter:1, text:'Hear from the hungry monkey what the feast still needs', show:{feast:{atLeast:2}}, done:{feast:{atLeast:3}}},
    {chapter:1, text:'Play hide and seek with a little monkey', show:{feast:{atLeast:1}}, done:{hidesFound:{atLeast:1}}},
    {chapter:1, text:'Follow the stream east to find where {蜜蜂|bees} live', show:{bees:{atLeast:1}}, done:{bees:{atLeast:2}}},
    {chapter:1, text:'Find the {动物} on the riverside', show:{bees:{atLeast:1}}, done:{riverAnimalsLeft:0}},
    {chapter:1, text:'Make friends with the six {蜜蜂|bees} in their valley ({beeCount}/6)', show:{bees:{atLeast:2}}, done:{beeFriends:6}},
    {chapter:1, text:'Win over the {蜂王|queen bee} with her word game', show:{bees:{atLeast:4}}, done:{bees:{atLeast:5}}},
    {chapter:1, text:'Lead the {蜂王|queen bee} and her bees home', show:{bees:{atLeast:5}}, done:{bees:{atLeast:6}}},
    {chapter:1, text:'Bring {蜂蜜|honey} to the feast’s big {桌子}', show:{bees:{atLeast:10}}, done:{bees:{atLeast:11}}},
    {chapter:1, text:'Find the lost {牛|cow} on the mountain', show:{cow:{atLeast:1}}, done:{cow:{atLeast:3}}},
    {chapter:1, text:'Win the {牛}’s trust with its word game', show:{cow:{atLeast:3}}, done:{cow:{atLeast:4}}},
    {chapter:1, text:'Lead the {牛} home, past the wolves', show:{cow:{atLeast:4}}, done:{cow:{atLeast:5}}},
    {chapter:1, text:'Find the {动物} in the dark pines', show:{cow:{atLeast:2}}, done:{pinesAnimalsLeft:0}},
    {chapter:1, text:'Bring the big monkey {种子|seeds} from wild melons, for the garden', show:{garden:{atLeast:1}}, done:{melonSeeds:'done'}},
    {chapter:1, text:'Bring the big monkey {种子|seeds} from wild grapes, for the garden', show:{garden:{atLeast:1}}, done:{grapeSeeds:'done'}},
    {chapter:1, text:'Bring the big monkey {种子|seeds} from wild bananas, for the garden', show:{garden:{atLeast:1}}, done:{bananaSeeds:'done'}},
    {chapter:1, text:'See the garden’s {西瓜|watermelons} go on the feast’s table, once they’re ripe', show:{melonPlanted:{atLeast:1}}, done:{melonPlanted:{atLeast:4}}},
    {chapter:1, text:'See the garden’s {葡萄|grapes} go on the feast’s table, once they’re ripe', show:{grapePlanted:{atLeast:1}}, done:{grapePlanted:{atLeast:4}}},
    {chapter:1, text:'See the garden’s {香蕉|bananas} go on the feast’s table, once they’re ripe', show:{bananaPlanted:{atLeast:1}}, done:{bananaPlanted:{atLeast:4}}},
    {chapter:1, text:'Lead the {牛} into its new home', show:{cow:{atLeast:5}}, done:{cow:{atLeast:8}}},
    {chapter:1, text:'Give the thirsty monkey some {牛奶|milk}', show:{cow:{atLeast:8}}, done:{milk:'done'}},
    {chapter:1, text:'See the {牛奶|milk} go on the feast’s second {桌子}', show:{milk:'done'}, done:{milkTable:{atLeast:1}}},
    {chapter:1, text:'Find out what the thirsty monkey makes from the {牛奶}', show:{dairy:{atLeast:1}}, done:{dairy:{atLeast:3}}},
    {chapter:1, text:'Find out what else he makes from the {牛奶}', show:{dairy:{atLeast:3}}, done:{dairy:{atLeast:5}}}
  ],

  // A ! or ? over a character's head: the first whose if matches.
  bubbles: {
    // (the old monkey's lessons and practice: only while he's at school, not at the feast's tables or seeing you off on the shore)
    elder: [{if:{crabTable:{atLeast:1}, exam:0}, show:'!'}, {if:{elder:2, chapter:0, gate:false, meadowWords:5, meadowCheck:0}, show:'!'}, {if:{school:1}, show:'!'}, {if:{school:{atLeast:2}, feast:0, numbersKnown:{atLeast:3}, coloursKnown:{atLeast:3}}, show:'!'}, {if:{school:{atLeast:2}, lesson:true, any:[{exam:0}, {raft:{atLeast:3}}]}, show:'!'}, {if:{school:{atLeast:2}, practice:true, any:[{exam:0}, {raft:{atLeast:3}}]}, show:'!'}, {if:{chapter:1, home:0}, show:'!'}, {if:{elder:0}, show:'!'}, {if:{elder:1, newWords:{atLeast:4}}, show:'!'}, {if:{gate:true, climb:0}, show:'!'}, {if:{climb:2}, show:'!'}, {if:{story:true, cave:0}, show:'!'}, {if:{cave:2, caveThings:3}, show:'!'},
      {if:{cave:4}, show:'!'}, {if:{cave:{atLeast:5}, count:{below:3}}, show:'!'}, {if:{chapter:0, count:3}, show:'!'}],
    boss: [{if:{elder:{atLeast:1}, new:'老板'}, show:'!'}, {if:{shop:1}, show:'!'}, {if:{elder:{atLeast:1}, new:'头带'}, show:'!'},
      {if:{canBuy:true}, show:'?'}],   // up at the home ground, to have his shop built; ? once you can afford something new, such as a headband
    playful: [{if:{elder:{atLeast:1}, new:'猴子'}, show:'!'}, {if:{elder:{atLeast:1}, new:'朋友'}, show:'!'},   // until it has taught you both its words,
      {if:{littleGame:0, knows:'朋友', gate:false}, show:'!'},   // then, in the meadow, till you've played its word game (once: win or lose)
      {if:{school:{atLeast:2}, new:'同学'}, show:'!'}],   // and at school, that you're classmates
    hungry: [{if:{elder:{atLeast:1}, hungry:'not asked'}, show:'!'}, {if:{elder:{atLeast:1}, hungry:'asked', holding:{hungry:true}}, show:'?'},
      {if:{hungry:'done', new:'没关系'}, show:'!'},   // once he's eaten, he wants to say sorry for being fussy,
      {if:{hungry:'done', hungryGame:0, knows:'没关系', gate:false}, show:'!'},   // then, in the meadow, to play his word game (once: win or lose)
      {if:{hungry:'done', new:'水果'}, show:'!'},   // and a game that helped him before he taught 水果 (24 October 2026) learns it now
      {if:{feast:2, bowls:'not asked'}, show:'!'}, {if:{bowls:'asked', holding:{bowls:true}}, show:'?'},   // chapter 1: by the feast's tables, for bowls,
      {if:{feast:2, tableware:{atLeast:2}}, show:'!'},   // then to tell you what the feast still needs,
      {if:{feast:{atLeast:3}, bees:0}, show:'!'},   // and (a game that heard it before the bees, 25 October 2026) to send you to find them,
      {if:{bees:6}, show:'!'},   // and once you've brought the bees home, to see them,
      {if:{honey:'asked', holding:{honey:true}}, show:'?'},   // and honey from their hive;
      {if:{bees:{atLeast:11}, fish:'not asked'}, show:'!'}, {if:{fish:'asked', holding:{fish:true}}, show:'?'},   // and then, with honey on the table, a big fish,
      {if:{fishTable:{atLeast:1}, shrimp:'not asked'}, show:'!'}, {if:{shrimp:'asked', holding:{shrimp:true}}, show:'?'},   // and with the fish on its table, three shrimp,
      {if:{shrimpTable:{atLeast:1}, crab:'not asked'}, show:'!'}, {if:{crab:'asked', holding:{crab:true}}, show:'?'}],   // and then a crab, from the shore
    fisher: [{if:{fish:'asked', fishing:0}, show:'!'}],   // the fishing monkey by the stream, once the hungry monkey wants a big fish: a rod for you
    queen: [{if:{bees:4}, show:'!'}, {if:{bees:7}, show:'!'}],   // the queen bee, out of her old tree: she wants you to play her word game; and at home, for the hive
    thirsty: [{if:{elder:{atLeast:1}, thirsty:'not asked'}, show:'!'}, {if:{elder:{atLeast:1}, thirsty:'asked', holding:{thirsty:true}}, show:'?'}, {if:{thirsty:'done', thirstyGame:0, gate:false}, show:'!'},
      {if:{feast:{atLeast:3}, cow:0}, show:'!'}, {if:{cow:4, following:{cow:true}}, show:'!'}, {if:{cow:5}, show:'!'}, {if:{milk:'asked', holding:{milk:true}}, show:'?'},
      {if:{milkTable:{atLeast:1}, dairy:0}, show:'!'}, {if:{dairy:2}, show:'!'}, {if:{dairy:4}, show:'!'}],   // chapter 1: by the road at the home ground, with news of a cow on the mountain; then the troop's ready to build it a home; and he'd love some of its milk
    pastureRabbit: [{if:{cow:{below:3}, rabbitTold:0}, show:'!'}],   // until it has told you where the cow went
    cow: [{if:{cow:{below:4}}, show:'!'}, {if:{cowFood:'asked', holding:{cowFood:true}}, show:'?'}, {if:{cow:4, following:{cow:false}}, show:'!'}, {if:{cow:7, following:{cow:false}}, show:'!'}],   // the cow, lost and alone in the pasture, till you've won its trust; and if it ran back to its spring, or isn't following you to its new home
    squirrel: [{if:{squirrelPlayed:0}, show:'!'}], goat: [{if:{goatPlayed:0}, show:'!'}],   // they want to play (the once, till they have)
    ledgeGoat: [{if:{ledgeTip:0}, show:'!'}],   // until it has told you about the banks
    lookoutGoat: [{if:{lookTip:0}, show:'!'}],  // until it has told you about the view
    // the little monkeys in training on the hillside: until they've stopped you, and then whenever some of your words need
    // practice, for another word game
    trainee1: [{if:{trainee1:0}, show:'!'}], trainee2: [{if:{trainee2:0}, show:'!'}], mushroomer: [{if:{mushroomGame:0}, show:'!'}],   // (the once: they had one whenever your words needed practice till 24 October 2026)
    // the little monkeys building a tower of stones: once you know enough numbers to count its stones with them, till you have
    hider: [{if:{hidesFound:0}, show:'!'}],   // until you've found it once, playing hide and seek
    towerL: [{if:{tower:{below:2}, numbersKnown:{atLeast:1}}, show:'!'}], towerR: [{if:{tower:{below:2}, numbersKnown:{atLeast:1}}, show:'!'}],
    doorway: [{if:{new:'睡觉'}, show:'!'}],   // until it has told you about sleeping
    big: [{if:{elder:{atLeast:1}, gate:false, new:'我'}, show:'!'}, {if:{climb:1, new:'棍子'}, show:'!'},   // in the meadow, to say who he is
      {if:{tableware:1}, show:'!'}, {if:{spoons:1}, show:'!'},   // chapter 1: what he's made for the feast
      {if:{home:2, build:0}, show:'!'}, {if:{wood:'asked', stones:'asked', holding:{wood:true, stones:true}}, show:'?'},
      {if:{wood:'asked', stones:'done', holding:{wood:true}}, show:'?'}, {if:{stones:'asked', wood:'done', holding:{stones:true}}, show:'?'},
      {if:{build:2, school:0}, show:'!'},   // chapter 1: the school
      {if:{school:{atLeast:2}, coloursKnown:{atLeast:3}, flowers:'not asked'}, show:'!'}, {if:{flowers:'asked', holding:{flowers:true}}, show:'?'},   // and flowers for it, once you know their colours
      {if:{tableware:{atLeast:2}, feast:{atLeast:3}, garden:0}, show:'!'}, {if:{melonSeeds:'asked', holding:{melonSeeds:true}}, show:'?'}, {if:{grapeSeeds:'asked', holding:{grapeSeeds:true}}, show:'?'}, {if:{bananaSeeds:'asked', holding:{bananaSeeds:true}}, show:'?'},
      {if:{any:[{melonPlanted:2}, {grapePlanted:2}, {bananaPlanted:2}]}, show:'!'}],   // and then a garden: he wants seeds
    woodSquirrel: [{if:{new:'木头', woodSquirrel:0}, show:'!'}]   // the squirrel in the pine wood, until it's shown you the dry pines (decided 26 October 2026: it kept its ! after, just to say it again)
  },

  // Characters who ask you to bring them something. The game handles each one the same way:
  // they ask (teaching a word), you find the thing (see gather in the legend), then you
  // fill the gap in a sentence to give it to them, and get the reward.
  //   from         the character who asks
  //   wants        the word for what they want (or choices: see the hungry monkey)
  //   verb         a word taught when they ask (if it's new), and used in the sentence, such as 喝 or 花
  //   teach        or what they want, taught when they ask instead (if it's new), such as the hungry monkey's 水果
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
    // lines and sentence, for when you bring it). He teaches 水果 as he asks, and 吃 when you give him the one he wants,
    // just before you say 我要吃… (decided 24 October 2026: he taught 吃 as he asked, and the fruit trees taught 水果; now each
    // tree teaches its own fruit, as you pick it).
    hungry: {from:'hungry', teach:'水果', ask:'hungry', asked:'The hungry monkey wants some fruit. Check your tasks.',
      choices: {
        '桃子': {wrong:'notPeach', offer:'havePeach', sentence:'我 要 吃 桃子', sentenceEn:'I want to eat a peach.'},
        '苹果': {wrong:'notApple', offer:'haveApple', sentence:'我 要 吃 苹果', sentenceEn:'I want to eat an apple.'}
      },
      wrongReply:'对不起', wrongAnswer:'noProblem', wrongMessage:'The monkey gives the fruit back. It wants the {wanted:hungry}.',
      firstTeach:[{word:'吃', note:'吃 means to eat.'}, {word:'要', note:'Use 要 to say what you want.'}, {word:'我', note:'我 means I or me.'}],
      reward:3, thanks:'thanks', thanksReply:'不客气'},
    thirsty: {from:'thirsty', wants:'水', verb:'喝', ask:'thirsty', asked:'The thirsty monkey wants something to drink. Check your tasks.',
      offer:'haveWater', firstTeach:[{word:'要', note:'Use 要 to say what you want.'}, {word:'我', note:'我 means I or me.'}],
      sentence:'我 要 喝 水', sentenceEn:'I want to drink water.', reward:3, thanks:'thanks', thanksReply:'不客气'},
    // chapter 1, a side quest: once the school's first colour lesson has taught you red, yellow and white, the big monkey
    // wants flowers to plant in front of it, one of each of those colours, picked at the home ground (see gather in the legend). (They were the
    // prologue's until 22 October 2026, wanted for no reason: the colours are taught at school now.)
    flowers: {from:'big', wants:'花', verb:'花', ask:'wantFlowers', asked:'The big monkey wants to plant {花|flowers} in front of the {学校}: a red, a yellow and a white one. Check your tasks.',
      offer:'haveFlowers', sentence:'我 要 红色 的 花', sentenceEn:'I want a red flower.', gap:'红色', reward:3, thanks:'thanks', thanksReply:'不客气'},
    // chapter 1: the big monkey wants wood and small stones to build the school. He asks for both at once (his talk), and
    // you find them in the pine wood: the dry, dead pines you knock down with your stick, and the stones by the stream
    // (collect, in the legend). No reply to his thanks: once he has both, the troop builds the school at once, teaching
    // 学校, so 不客气 would come in the same go (decided 22 October 2026: it waits for his thanks for the flowers).
    wood: {from:'big', wants:'木头', ask:'wantWood', asked:'The big monkey wants three pieces of {木头}. Check your tasks.',
      offer:'haveWood', sentence:'我们 要 木头', sentenceEn:'We want wood.', reward:3, thanks:'thanks'},
    stones: {from:'big', wants:'石头', ask:'wantStones', asked:'The big monkey wants three small {石头|stones}. Check your tasks.',
      offer:'haveStones', sentence:'我们 要 小 石头', sentenceEn:'We want small stones.', reward:3, thanks:'thanks'},
    // chapter 1: bowls for the feast's tables, which the troop sets out bare (decided 27 October 2026: they were set out with
    // their bowls): the troop's bowls are in the cave, where they lived (collect, at their stacks in the legend), six of them
    bowls: {from:'hungry', wants:'碗', ask:'wantBowls', asked:'The hungry monkey wants six {碗|bowls} for the feast. They’re in the Water Curtain Cave!',
      offer:'haveBowls', sentence:'我们 要 碗', sentenceEn:'We want bowls.', reward:3, thanks:'thanks', thanksReply:'不客气'},
    // chapter 1: honey for the feast, from the bees' hive at the home ground, asked as the bees move in (he's wanted it since
    // the feast's list said 我们没有蜂蜜。). You learn 蜂蜜 as you take it from the hive; he pours it into the table's bowl.
    honey: {from:'hungry', wants:'蜂蜜', ask:'wantHoney', asked:'The hungry monkey wants honey for the feast. Take some from the bees’ hive!',
      offer:'haveHoney', sentence:'我 要 吃 蜂蜜', sentenceEn:'I want to eat honey.', reward:3, thanks:'thanks', thanksReply:'不客气'},
    // chapter 1: the cow's milk, its thank-you for its new home: it gives you some, and the thirsty monkey wants to drink it
    // (asked as he says so: the cow's events); the rest is for the feast
    milk: {from:'thirsty', wants:'牛奶', ask:'wantMilk', asked:'The thirsty monkey wants to drink some {牛奶}!',
      offer:'haveMilk', sentence:'我 要 喝 牛奶', sentenceEn:'I want to drink milk.', reward:3, thanks:'thanks', thanksReply:'不客气'},
    // chapter 1: leading the cow home, it stops on the south slope, tired and hungry (asked as it says so: an event); you
    // pick it three handfuls of fresh grass by the brook
    // chapter 1: seeds from wild fruit for the big monkey's garden by the stream, asked as he marks it out (his talk). As you
    // give them, you say what they are: 这是西瓜的种子 (These are watermelon seeds), the fruit's word missing
    melonSeeds: {from:'big', wants:'种子', ask:'wantSeeds', asked:'The big monkey wants seeds from wild fruit, to grow in the garden!', offer:'haveSeeds',
      sentence:'这 是 西瓜 的 种子', sentenceEn:'These are watermelon seeds.', gap:'西瓜', reward:2, thanks:'thanks', thanksReply:'不客气'},
    grapeSeeds: {from:'big', wants:'种子', ask:'wantSeeds', asked:'The big monkey wants seeds from wild fruit, to grow in the garden!', offer:'haveSeeds',
      sentence:'这 是 葡萄 的 种子', sentenceEn:'These are grape seeds.', gap:'葡萄', reward:2, thanks:'thanks', thanksReply:'不客气'},
    bananaSeeds: {from:'big', wants:'种子', ask:'wantSeeds', asked:'The big monkey wants seeds from wild fruit, to grow in the garden!', offer:'haveSeeds',
      sentence:'这 是 香蕉 的 种子', sentenceEn:'These are banana seeds.', gap:'香蕉', reward:2, thanks:'thanks', thanksReply:'不客气'},
    // a big fish for the feast (chapter 1): the fishing monkey gives you a rod, and you catch one in the stream (fishing, below)
    fish: {from:'hungry', wants:'鱼', ask:'wantFish', asked:'The hungry monkey wants a big {鱼} for the feast! The fishing monkey by the stream can help.',
      offer:'haveFish', sentence:'这 是 大 鱼', sentenceEn:'This is a big fish.', gap:'大', others:['小'], reward:3, thanks:'thanks', thanksReply:'不客气'},
    // chapter 1: three shrimp for the feast (decided 29 October 2026), once the big fish is on its table: they live in the
    // clear shallows of the riverside's brook, and you catch them with your rod (a shrimp nibbles first: AREA.fishing.shrimp),
    // counted as you catch them (the collect step); 虾 just for listening till you catch one
    shrimp: {from:'hungry', wants:'虾', ask:'wantShrimp', asked:'The hungry monkey wants three {虾|shrimp} for the feast! Shrimp live in the clear shallows of the brook on the riverside, above the bridge. Catch them with your {鱼竿}.',
      offer:'haveShrimp', sentence:'这 是 虾', sentenceEn:'This is a shrimp.', gap:'虾', others:['鱼'], reward:3, thanks:'thanks', thanksReply:'不客气'},
    // chapter 1: last, so it's fresh for the feast, a crab (decided 29 October 2026), once the shrimp are on the table: crabs
    // live on the shore, below the meadow, where the river meets the sea; the troop clears the way down (the meadow's ч)
    crab: {from:'hungry', wants:'螃蟹', ask:'wantCrab', asked:'The hungry monkey wants a {螃蟹|crab} for the feast! Crabs live on the shore, below the meadow, where the river meets the sea. The troop has cleared a way down.',
      offer:'haveCrab', sentence:'这 是 螃蟹', sentenceEn:'This is a crab.', gap:'螃蟹', others:['虾', '鱼'], reward:3, thanks:'thanks', thanksReply:'不客气'},
    cowFood: {from:'cow', wants:'草', ask:'cowHungry', asked:'The {牛} is hungry. Pick it some fresh {草} by the brook!',
      offer:'haveGrass', sentence:'我 要 吃 草', sentenceEn:'I want to eat grass.', reward:2, thanks:'thanks', thanksReply:'不客气'}
  },

  // The shop. who runs it, their line when you visit (ask); when you buy something, they give it to you (given, what's
  // happening, with {item} for what you bought), reply is the phrase that fits as your reply, and welcome their line after
  // it (decided 22 October 2026: they used to thank you, and you thanked them back, which made it a puzzle why a monkey's
  // thanks wanted 不客气); the phrase you say when you don't want anything (no), what they say
  // if you can't afford something yet (earnMore, after how many shells you need), and when you've
  // bought everything (soldOut). Each item: its word and price in shells, the sentence you complete
  // to ask for it (sentence, with sentenceEn; the item is the missing word), a line on its new-word card (note), a message
  // after you buy it (bought), and wear: true if your monkey wears it from then on (bought once), or
  // eat: true for food you can buy again and eat in an animal encounter to take away a wrong answer,
  // with carry: the most you can carry.
  // An item can be sold only while its if matches (such as the peaches, once his shop is at the home ground); bag: true for
  // something you can buy again that goes in your bag but isn't food, such as bait (carry: the most you can carry). And
  // one that comes in colours (colours: its colour words; colour: its own, the colour of its word's picture) is sold in each
  // colour you know, as a thing of its own (colourSentence, colourSentenceEn, colourNote and colourBought, {colour} where the
  // colour goes: in the sentence its word, the missing one; in English its English), and as it is till you know its own.
  shop: {
    who:'boss', ask:'whatWant', given:'The {老板} gives you the {item}.', reply:'谢谢', welcome:'welcome', no:'我不要',
    earnMore:'Earn more by helping the monkeys, making friends with the animals in the tall grass, and practising your words.',
    // asking for something you didn't point at (the wrong word in the gap): he's puzzled, and asks again (ask)
    puzzled:'The {老板} looks puzzled: you pointed at the {item}, but asked for something else! Ask him again.',
    soldOut:'You have everything the {老板} sells. Come back another time.',
    items: [
      {item:'苹果', price:2, sentence:'我 要 苹果', sentenceEn:'I want an apple.',
        note:'A crunchy apple.', bought:'You put the {苹果} in your bag. In a battle or with an animal, eat it to take away a wrong answer.', eat:true},
      {item:'桃子', price:2, if:{shop:{atLeast:3}}, sentence:'我 要 桃子', sentenceEn:'I want a peach.',
        note:'A ripe peach.', bought:'You put the {桃子} in your bag. Eat it to get 10 health back.', eat:true},
      {item:'蜂蜜', price:4, if:{shop:{atLeast:3}, bees:{atLeast:11}}, sentence:'我 要 蜂蜜', sentenceEn:'I want some honey.',   // (once the bees make honey at the home ground)
        note:'Golden honey from the bees’ hive.', bought:'You put the {蜂蜜} in your bag. Eat it to walk faster for a minute.', eat:true},
      {item:'鱼饵', price:2, if:{shop:{atLeast:3}, fishing:{atLeast:1}}, sentence:'我 要 鱼饵', sentenceEn:'I want some bait.',   // (once you can fish)
        note:'Wriggly worms in a little clay pot. Big fish love them!', bought:'You put the {鱼饵} in your bag. The next time you fish, a big fish bites!', bag:true, carry:3},
      // headbands in every colour you know (decided 29 October 2026: things monkeys could make on the mountain, cloth dyed
      // with what grows there; never people's clothes): which one you wear shows on your monkey (the wardrobe, below)
      {item:'头带', price:10, colour:'红色', colours:['红色', '黄色', '白色', '黑色', '蓝色', '绿色', '棕色', '橙色', '粉色'],
        sentence:'我 要 头带', sentenceEn:'I want the headband.', colourSentence:'我 要 {colour} 的 头带', colourSentenceEn:'I want the {colour} headband.',
        note:'A red cloth headband.', colourNote:'A headband of {colour} cloth.', bought:'You tie on the red {头带}. It suits you!', colourBought:'You tie on the {colour} {头带}. It suits you!', wear:true}
    ]
  },

  // Fishing (js/fishing.js), once you have a rod (rod; has: when you have it): A at water where fish live (a legend's
  // fishing) casts your line; you wait for a bite, press A, and reel it in by answering questions on words you know (each
  // size's questions, in a row). A little fish bites till bigIf matches (you know 小, from your first catch); then a big one
  // gets likelier each bite, sure by the bigWithin-th, or bites straight away with bait (in your bag: one goes on your
  // hook). What you catch: a card with its picture (pic) and caught, then its steps, the first part whose if matches.
  // What you're told: cast, bite, missed (too slow), slipped (a wrong answer), stop (B), baited, and reel (over a question).
  // The exam (the exam step, js/world.js), the area's word test, from the teacher before the feast (decided 29 October
  // 2026): words from the whole area, the ones you know least well first (words), pass right first time to pass.
  exam: {words:30, pass:24, title:'The exam', start:'Start the exam', passed:'You passed the exam!', notYet:'Not quite yet',
    ask:'The exam: match 30 words from all over Flower Fruit Mountain to their pictures, the ones you know least well first. Get 24 right first time to pass.',
    tryAgain:'Practise the words you missed, at school or with your friends, then come back and try again. Your teacher is ready whenever you are.'},
  // The end of the area's story (the areaEnd step): its card, after you sail away
  areaEnd: {title:'Chapter 1 complete!', text:['You sailed away from Flower Fruit Mountain on your {木筏}, to find the immortals across the sea.',
    'The next part of the journey is still to come. Until then, you’re back on the shore: keep practising your words, and visit your friends.']},

  fishing: {
    rod:'鱼竿', has:{fishing:{atLeast:1}}, bait:'鱼饵', bigIf:{knows:'小'}, bigWithin:4,
    cast:'You cast your line. Wait for the float to go under, then press A!', bite:'A bite! Press A!',
    missed:'Too slow: it got away! Cast again.', slipped:'It slipped off the hook! Cast again.', stop:'You reel in your line.',
    baited:'You put some {鱼饵} on your hook: a big one bites!', reel:'Reel it in!',
    small:{questions:1, pic:'小 鱼', caught:'You caught a fish! It’s tiny.', steps:[
      // the first: too small to keep! You say so (teaching 小), and let it go
      {if:{new:'小'}, do:[{say:'tooSmall', by:'player', teach:'小'}, {newWord:'小', note:'A little fish: too small to keep. You let it go back into the water.'},
        {message:'You let the little fish go. Cast again, for a bigger one!'}]},
      // once you know 大 too: which is it? (and let it go)
      {if:{knows:'大'}, do:[{gap:{sentence:'这 是 小 鱼', en:'This is a little fish.', word:'小', others:['大'], pic:'小 鱼'}}, {message:'You let the little fish go.'}]},
      {do:[{say:'tooSmall', by:'player'}, {message:'You let the little fish go. Cast again, for a bigger one!'}]}]},
    big:{questions:3, pic:'大 鱼', caught:'You caught a fish! It’s huge!', steps:[
      // the first: a big one (teaching 大), for the feast: take it to the hungry monkey
      {if:{new:'大'}, do:[{say:'bigFish', by:'player', teach:'大'}, {newWord:'大', note:'A big fish, just right for the feast!'}, {hold:'鱼', for:'fish'},
        {message:'Take the big {鱼} to the hungry monkey, at the feast’s tables!'}]},
      // after that, which is it? And the troop has it for supper
      {do:[{gap:{sentence:'这 是 大 鱼', en:'This is a big fish.', word:'大', others:['小'], pic:'大 鱼'}}, {shells:2, note:'The troop has a big {鱼} for supper! +2 🐚'}]}]},
    // shrimp, in clear shallow water (a legend's fishing:'shrimp', such as the riverside's brook): each nibbles first, the
    // float twitching once or twice (nibbles), before it bites; pull on a twitch, and it lets go
    shrimp:{questions:1, pic:'虾', nibbles:[1, 2], nibble:'A nibble! Wait for the float to go right under…', tooSoon:'Too soon! The shrimp let go. Wait for the float to go right under.',
      caught:'You caught a shrimp! It’s tiny, and you can see right through it.', steps:[
      // for the hungry monkey: counted as you catch them, three (the first teaches 虾)
      {if:{shrimp:'asked', holding:{shrimp:false}}, do:[{collect:'虾', for:'shrimp', count:3, note:'A shrimp, from the clear shallows of the brook.',
        each:'A {虾|shrimp} for the feast ({shrimpCaught}/3). Cast again!', full:'Three {虾|shrimp}! Take them to the hungry monkey.'}]},
      // one you find before he asks
      {if:{new:'虾'}, do:[{newWord:'虾', note:'A shrimp, from the clear shallows of the brook.'}, {message:'You let the {虾|shrimp} go back into the water.'}]},
      // after that: which is it? And you let it go
      {do:[{gap:{sentence:'这 是 虾', en:'This is a shrimp.', word:'虾', others:['鱼'], pic:'虾'}}, {message:'You let the {虾|shrimp} go back into the water.'}]}]}
  },

  // Food you carry in your bag (up to carry of each), and what eating it does. heal: how much health comes back (in a battle,
  // 吃 eats it on your turn; outside one, tap it in your bag). helps: it takes away a wrong answer in a question, in a
  // battle or with an animal, without using your turn. does: what your bag says it does.
  food: {
    '桃子': {heal:10, carry:3, does:'Brings back 10 health'},
    '苹果': {helps:true, carry:3, does:'Takes away a wrong answer'},
    '蜂蜜': {fast:60, carry:2, does:'Walk faster for a minute'}   // fast: you walk faster for so many seconds (tap it in your bag)
  },

  // Things that happen by themselves when the time comes (checked after anything you do, such as a step or a
  // request done). Besides what a task's if can check, an event's if can check near:'id' (you're right beside that
  // character) and at:[x, y, 'place'] (you're standing there). A word in {curly brackets} in a message is shown as 汉字 (English).
  events: [
    {if:{place:'pineWood', woodIn:0}, do:[{sound:'howl'}, {message:'It’s gloomy under the thick pines, and very still. Somewhere far off, a wolf howls…'}, {set:{woodIn:1}}]},   // into the pine wood for the first time
    // chapter 1: into the bees' valley for the first time, at the end of the riverside: the butterfly from the riverside's
    // wildflowers flutters in after you (teaching 蝴蝶, if you passed it by), and tells you who lives in the tall flowers;
    // what to do there; and it flutters back the way you came (decided 26 October 2026: what to do there wasn't clear)
    {if:{place:'flowerValley', bees:1}, do:[{leap:'guide', to:[3, 10]},
      {newWord:'蝴蝶', note:'A butterfly has fluttered after you, from the wildflowers on the riverside!'},
      {say:'beesInFlowers', by:'guide'}, {sound:'buzz'},
      {message:'A valley full of flowers! Six bees are hiding in the tall flowers, and wasps too. Where the tall flowers shake, a bee is hiding: walk in to meet it.'},
      {message:'Make friends with all six bees! Each one stays out over the flowers once you’ve met it. Watch out for the wasps: they zoom out to fight.'},
      {leap:'guide', to:[-1, 10]}, {set:{bees:2}}]},
    // all six bees are your friends: the sixth sends you to find the queen (蜂王, just for listening till you meet her), and
    // the swarm in front of her old tree flies aside
    {if:{bees:2, beeFriends:6}, do:[{say:'findQueen', by:'bee'}, {fly:'bee', to:[26, 7]}, {set:{bees:3}}, {sound:'buzz'},
      {message:'Your six {蜜蜂|bee} friends fly off to join the swarm by the old tree, and the swarm flies aside: the way to it is open!'}]},
    // you've brought the queen bee and her swarm home: they fly to the wildflowers by the cliff, where their hive will be
    {if:{place:'homeGround', bees:5}, do:[{set:{bees:6}}, {follow:[]}, {sound:'buzz'}, {sound:'fanfare'},
      {message:'The queen bee and her swarm fly over to the wildflowers by the cliff. The bees are home! Go and tell the hungry monkey.'}]},
    // the honey you brought him: he pours it into the empty bowl on the feast's big table
    // (and he gives you a little for your bag, saying what it does: decided 26 October 2026, when nothing said so)
    {if:{bees:10, honey:'done'}, do:[{set:{bees:11}}, {sound:'chime'}, {say:'haveHoneyNow', by:'hungry'},
      {bag:'蜂蜜', note:'The hungry monkey pours the honey into the empty bowl on the big table: now the feast has honey! He gives you a little {蜂蜜} for your bag too: eat it, and you walk faster for a minute.'}]},
    // chapter 1: into the dark pines (黑松林) for the first time, down the south slope: somewhere beyond them, the lost cow
    // moos
    {if:{place:'darkPines', cow:1}, do:[{sound:'moo'}, {message:'Dark pines, and long grass where wolves hide. Somewhere beyond them, a cow moos, long and sad…'}, {set:{cow:2}}]},
    // the way through the pines (decided 27 October 2026, after playing it: it was easy and dull): as you come to the cow's
    // hoofprints, where the way forks, they show you which way it went; where they go down into a stream, too deep to wade,
    // a dead pine leans over it from the bank (its legend: knock it down, and it falls across)
    {if:{place:'darkPines', pastureTracks:0, cow:{below:3}, around:[21, 5, 'darkPines', 1]}, do:[{set:{pastureTracks:1}},
      {message:'Hoofprints in the soft earth, going east: the cow came this way! Follow them.'}]},
    // as you come to the hollow pine, along the gully: crawl through!
    {if:{place:'darkPines', logSeen:0, cow:{below:3}, around:[28, 6, 'darkPines', 1]}, do:[{set:{logSeen:1}},
      {message:'A great pine has fallen along the gully, hollow inside. The cow stepped over it, but a little monkey can crawl right through!'}]},
    {if:{place:'darkPines', streamSeen:0, pastureLog:0, cow:{below:3}, around:[23, 17, 'darkPines', 1]}, do:[{set:{streamSeen:1}},
      {message:'The hoofprints go right down into a stream, deep and fast. A big cow can wade across, but a little monkey can’t! A dead pine leans out over the water…'}]},
    // the way home with the cow (27 October 2026: the way there was an adventure, the way back just a walk): as you come up
    // to the long grass in the dark pines, it stops, scared of the wolves in it (我怕狼！); go first, and a wolf leaps out
    // at you; chase it off, and the cow follows you through. (Lose, and you rest at home, the cow still waiting.)
    {if:{place:'darkPines', cow:4, following:{cow:true}, pinesWolf:0, around:[16, 26, 'darkPines', 1]}, do:[{set:{cowWaits:'grass'}}, {follow:[]},
      {say:'cowScared', by:'cow'}, {message:'The {牛} won’t go into the long grass: wolves hide in it! Go first, and chase them off.'}]},
    {if:{place:'darkPines', cow:4, cowWaits:'grass', around:[16, 25, 'darkPines', 1]}, do:[
      {battle:'wolf', out:true, meet:'A {狼} leaps out of the long grass at you!', win:[{set:{pinesWolf:1, cowWaits:0}}, {follow:['cow']}, {sound:'moo'},
        {message:'The {狼} runs off into the pines. The {牛} isn’t scared now: it follows you through the long grass!'}]}]},
    // and up the south slope, at the top of the steps from the pines, it stops again, tired and hungry (我饿了。): pick it
    // some fresh grass by the brook, give it it (我要吃草), and it follows you on, up the steps (the banks are too steep)
    {if:{place:'southSlope', cow:4, following:{cow:true}, cowFood:'not asked', around:[3, 26, 'southSlope', 1]}, do:[{set:{cowWaits:'slope', cowFood:'asked'}}, {follow:[]},
      {sound:'moo'}, {say:'cowHungry', by:'cow'}, {message:'The {牛} is tired and hungry after the long walk. Pick it some fresh {草} by the brook!'}]},
    {if:{cow:4, cowWaits:'slope', cowFood:'done'}, do:[{set:{cowWaits:0}}, {follow:['cow']},
      {message:'The {牛} munches the {草|grass} happily, and follows you again. On up the slope, by its steps, and home!'}]},
    // chapter 1: the garden: once you've given the big monkey seeds, the troop plants them as you watch, in their own part of it
    {if:{place:'homeGround', melonSeeds:'done', melonPlanted:0}, do:[{plant:{melonPlanted:1}}, {countFrom:'melonTurn'},
      {message:'The troop plants the {西瓜} seeds in the garden, and waters them from the stream. Little vines come up at once: on Flower Fruit Mountain, everything grows fast!'}]},
    // the grapes: the troop sets up a trellis for them as you watch (its posts, its wires, then the vines growing up it)
    {if:{place:'homeGround', grapeSeeds:'done', grapePlanted:0}, do:[{setUp:{grapePlanted:1}}, {countFrom:'grapeTurn'},
      {message:'The troop plants the {葡萄} seeds in the garden, with a trellis for them to climb. Vines come up at once, and climb all over it!'}]},
    // each fruit in the garden is ripe once you've answered 8 more questions since it was planted (as the little dairy's
    // yoghurt is: a chime, a message, and a ! over the big monkey); he picks it for the feast, and as you come up to the
    // big tree, it goes on the feast's table for the garden's fruit (set out with the first, beside the big one), each in
    // its own bowl, whatever order they ripen in, and the hungry monkey is thrilled
    {if:{melonPlanted:1, melonWait:{atLeast:8}}, do:[{set:{melonPlanted:2}}, {sound:'chime'}, {message:'The {西瓜} in the garden are ripe! Go and see the big monkey.'}]},
    {if:{grapePlanted:1, grapeWait:{atLeast:8}}, do:[{set:{grapePlanted:2}}, {sound:'chime'}, {message:'The {葡萄} on the trellis are ripe! Go and see the big monkey.'}]},
    {if:{bananaPlanted:1, bananaWait:{atLeast:8}}, do:[{set:{bananaPlanted:2}}, {sound:'chime'}, {message:'The {香蕉} in the garden are ripe! Go and see the big monkey.'}]},
    {if:{melonPlanted:3, around:[13, 7, 'homeGround']}, do:[{message:'The troop sets out a new stone {桌子} for the garden’s fruit, beside the big one.', if:{fruitTable:0}},
      {setUp:{fruitTable:1}, if:{fruitTable:0}}, {setUp:{melonPlanted:4}}, {say:'haveMelonNow', by:'hungry'}, {message:'Slices of {西瓜} in a bowl, for the feast!'}]},
    {if:{grapePlanted:3, around:[13, 7, 'homeGround']}, do:[{message:'The troop sets out a new stone {桌子} for the garden’s fruit, beside the big one.', if:{fruitTable:0}},
      {setUp:{fruitTable:1}, if:{fruitTable:0}}, {setUp:{grapePlanted:4}}, {say:'haveGrapesNow', by:'hungry'}, {message:'Bunches of {葡萄} in a bowl, for the feast!'}]},
    {if:{bananaPlanted:3, around:[13, 7, 'homeGround']}, do:[{message:'The troop sets out a new stone {桌子} for the garden’s fruit, beside the big one.', if:{fruitTable:0}},
      {setUp:{fruitTable:1}, if:{fruitTable:0}}, {setUp:{bananaPlanted:4}}, {say:'haveBananasNow', by:'hungry'}, {message:'{香蕉} in a bowl, for the feast!'}]},
    {if:{place:'cliffs', cliffsSeen:0}, do:[{set:{cliffsSeen:1}}, {message:'Steep cliffs, one ledge below another. Somewhere down here, wild grapes grow!'}]},
    // the bananas: two banana plants come up in the garden as you watch (a shoot, its stem and lower leaves, then the rest)
    {if:{place:'homeGround', bananaSeeds:'done', bananaPlanted:0}, do:[{setUp:{bananaPlanted:1}}, {countFrom:'bananaTurn'},
      {message:'The troop plants the {香蕉} seeds in the garden. Two banana plants shoot up at once, their big leaves unfolding!'}]},
    {if:{place:'hotSprings', springsSeen:0}, do:[{set:{springsSeen:1}}, {message:'A warm, sheltered valley, full of steaming hot springs! Wild bananas grow at the top, past the steam.'}]},
    // leading the cow home, as you come into the gap between the big rocks, a bear rears up out of its long grass at you
    // (just the once: a boss, with no running away; win, and it lumbers off into the pines for good; lose, and the cow runs
    // back to its spring: battles' afterLoss). A wolf until 27 October 2026 (cowWolf), which you could run from
    {if:{place:'pasture', cow:4, following:{cow:true}, cowWolf:0, around:[20, 13, 'pasture', 1]}, do:[
      {battle:'bear', out:true, meet:'A {熊} rears up out of the long grass between the rocks! It wants the {牛}!',
        win:[{set:{cowWolf:1}}, {message:'The {熊} is gone. The {牛} is safe, and the way home is clear. Lead it on, back through the pines!'}]}]},
    // home with the cow: as you come up to the thirsty monkey by the road, it stops following you, and stands by him (its
    // own home, a pen, comes next)
    {if:{place:'homeGround', cow:4, following:{cow:true}, around:[21, 11, 'homeGround', 2]}, do:[
      {set:{cow:5}}, {follow:[]}, {sound:'moo'}, {say:'great', by:'thirsty'},
      {message:'You’ve brought the {牛} home, safe from the wolves! Now it needs a safe place to live: the troop is going to build it a home of its own, by the road.'}]},
    // its new home: as you come into its pen with it, through the gate, it goes in, and you tell it this is its home. It
    // thanks you, and gives you some of its milk (teaching 牛奶): its thank-you. The thirsty monkey would love some
    {if:{place:'homeGround', cow:7, following:{cow:true}, around:[25, 13, 'homeGround', 1]}, do:[
      {set:{cow:8}}, {follow:[]}, {sound:'moo'},
      {say:'yourHome', by:'player'}, {say:'thanks', by:'cow'}, {reply:'不客气'},
      {newWord:'牛奶', note:'Safe and happy in its new home, the {牛} gives you some milk: its thank-you!'},
      {hold:'牛奶', for:'milk'}, {set:{milk:'asked'}}, {say:'wantMilk', by:'thirsty'},
      {message:'The thirsty monkey wants to drink some {牛奶}! Take it to him.'}]},
    // the milk you gave him: he drinks some, and the rest is for the feast, on a new table (next)
    {if:{milk:'done', cow:8}, do:[{set:{cow:9}},
      {message:'The thirsty monkey drinks some of the {牛奶}. The rest is for the feast, in a bowl on its second {桌子}.'}]},   // (put there as you come up to it: at once, if you're on the road)
    // the cow's milk goes on the feast's second table, as you come up to it: a bowl full, with a white jug of it (a knock as
    // it goes on: the setUp step), and the hungry monkey, who looks after the feast, is thrilled
    {if:{cow:{atLeast:9}, milkTable:0, around:[22, 7, 'homeGround']}, do:[
      {setUp:{milkTable:1}}, {say:'haveMilkNow', by:'hungry'},
      {message:'The {牛}’s milk goes on the feast’s second {桌子}: a bowl full, and a jug of it!'}]},
    // and what the thirsty monkey makes from the milk at his little dairy goes in its bowls too, as you come up to it:
    // yoghurt, a wooden spoon in it, then cheese
    {if:{dairy:{atLeast:3}, milkTable:1, around:[22, 7, 'homeGround']}, do:[{setUp:{milkTable:2}},
      {message:'The thirsty monkey’s {酸奶} goes in a bowl on the feast’s second table, with a wooden spoon in it!'},
      // the big monkey made it (his talk, teaching 勺子; decided 27 October 2026: you found it in the yoghurt)
      {set:{spoons:1}}, {message:'The big monkey made the spoon, for the {酸奶}: go and see him!'}]},
    {if:{dairy:{atLeast:5}, milkTable:2, around:[22, 7, 'homeGround']}, do:[{setUp:{milkTable:3}},
      {message:'And a round {奶酪} for the feast, in the last bowl!'}]},
    // the little dairy: what the thirsty monkey is making is ready once you've answered 8 more questions anywhere (as the
    // teacher's next new word waits for you to: lessonGap), a chime and a message say so, and he has a !
    {if:{dairy:1, dairyWait:{atLeast:8}}, do:[{set:{dairy:2}}, {sound:'chime'},
      {message:'The thirsty monkey has finished making something from the {牛奶}. Go and see what it is!'}]},
    {if:{dairy:3, dairyWait:{atLeast:8}}, do:[{set:{dairy:4}}, {sound:'chime'},
      {message:'The thirsty monkey has made something else from the {牛奶}. Go and see what it is!'}]},
    {if:{place:'cave', cave:1}, do:[{card:'洞', note:'A big, dry cave, hidden behind the water!'}, {set:{cave:2}}]},   // inside for the first time
    // you lead the troop in: they come through the water curtain after you (they've followed you since you told the old
    // monkey about the cave), then go to their places (decided 22 October 2026: they had just been there already)
    {if:{place:'cave', cave:3}, do:[{sound:'splash'}, {set:{cave:4}}, {follow:[]}, {message:'Splash, splash! The troop follows you through the water curtain!'}]},
    // chapter 1: the teacher's next new word waits for you to practise (lessonGap): as it starts waiting, the game remembers
    // (quietly), and once you've practised, a message says the teacher has a new word for you
    {if:{lessonWaits:true, lessonWait:0}, do:[{set:{lessonWait:1}}]},
    {if:{lessonWait:1, lesson:true}, do:[{set:{lessonWait:0}}, {sound:'chime'}, {message:'You’ve practised enough: a new lesson is ready at the {学校}, {lessons:ready}!'}]},
    // the rocks roll away once everything else in the prologue is done: the hungry and thirsty monkeys helped, every animal
    // found, and the words for the meadow learned (the big monkey's flowers wait for chapter 1, decided 22 October 2026)
    {if:{hungry:'done', thirsty:'done', animalsLeft:0, meadowWords:5, meadowCheck:1, gate:false}, do:[
      {set:{gate:true}},
      {rumble:true},   // the ground shakes and the map is redrawn
      {message:'A rumble from the {山}! The rocks north of the meadow have rolled away, and the troop gathers there.'}
    ]},
    // once you know every part of your home's name, you can read it: the sign by your stone sparkles, and shows how the name
    // is made (decided 23 October 2026: Chinese is logical; a game past the meadow without 水果 learns it from the hungry
    // monkey, and the sign is there when it goes back)
    {if:{nameParts:3, homeName:0}, do:[{set:{homeName:1}}, {message:'You know every part of your home’s name now! Read the sign by your stone, in the meadow.'}]},
    // the goat below the waterfall stops you as you walk past, to tell you the way down is quicker: once, on your way
    // down to tell the troop, or any time later (not on the way up with them)
    {if:{climb:2, ledgeTip:0, near:'ledgeGoat'}, do:[{stopsYou:'ledgeGoat'}]},
    {if:{climb:{atLeast:4}, ledgeTip:0, near:'ledgeGoat'}, do:[{stopsYou:'ledgeGoat'}]},
    // the goat on the hillside's lookout stops you as you pass, the first time, to tell you about the view: beside it, or
    // up the steps' other side
    {if:{lookTip:0, near:'lookoutGoat'}, do:[{stopsYou:'lookoutGoat'}]},
    {if:{lookTip:0, at:[18, 21, 'hillside']}, do:[{stopsYou:'lookoutGoat'}]},
    // each little monkey in training on the hillside stops you as you pass, the first time, for a word game, like a trainer
    // in Pokémon (decided 23 October 2026); after that, talk to it to play again
    {if:{trainee1:0, near:'trainee1'}, do:[{stopsYou:'trainee1'}]},
    {if:{trainee2:0, near:'trainee2'}, do:[{stopsYou:'trainee2'}]},
    // the big monkey waits by the way up and stops you as you set off, to give you a stick
    {if:{climb:1, new:'棍子', near:'big'}, do:[{stopsYou:'big'}]},
    // and before that, once the rocks have rolled away, the old monkey stops you if you walk past him: he has something to
    // say before you go up (the way up is shut till then)
    {if:{gate:true, climb:0, near:'elder'}, do:[{stopsYou:'elder'}]},
    // the troop has followed you up: as you come out of the narrow way by the waterfall, they leap past you to their places
    {if:{climb:3, at:[7, 2, 'falls']}, do:[{set:{climb:4}}, {follow:[]}, {message:'The troop has followed you all the way up to the {瀑布}!'}]},
    // chapter 1: you arrive at the home ground with the old monkey, who goes to his place there and tells you about it
    {if:{home:1, place:'homeGround'}, do:[{set:{home:2}}, {follow:[]}, {say:'bigHere', by:'elder'},
      {message:'A wide, open valley, all their own! The troop dreams of building a school here, and a new shop, a hive, a garden and a pen. First, a school!'}]},
    // chapter 1: you've brought the hungry monkey a big fish: the troop sets it out at the end of the feast's second table, on a
    // stone table of its own, as you watch (its stone, then a big leaf with the fish on it)
    {if:{place:'homeGround', fish:'done', fishTable:0}, do:[{setUp:{fishTable:1}}, {say:'haveFishNow', by:'hungry'}, {message:'A big {鱼} on a leaf, for the feast!'}]},
    // and the shrimp, in a white bowl in front of it
    {if:{place:'homeGround', shrimp:'done', shrimpTable:0}, do:[{setUp:{shrimpTable:1}}, {say:'haveShrimpNow', by:'hungry'}, {message:'A bowl of {虾|shrimp} for the feast, beside the big fish!'}]},
    // and the crab, on a stone table of its own, between the garden's fruit and the big table
    {if:{place:'homeGround', crab:'done', crabTable:0}, do:[{setUp:{crabTable:1}}, {say:'haveCrabNow', by:'hungry'}, {message:'A big red {螃蟹} on a plate, for the feast!'}]},
    // chapter 1's end: once you've passed the exam, the troop sits down to the feast, round its tables, and it's told like
    // the opening (the feast scene): the old monkey tells the story of your first days, you're happy (快乐), then sad, as
    // you'll grow old; he tells you of the immortals across the sea, who never grow old, and you'll go and find them. The
    // big monkey: let's make you a raft! The old, big and little monkeys go down to the shore with you
    {if:{exam:1, feastHeld:0, around:[17, 7, 'homeGround']}, do:[{scene:'feast'}, {newWord:'快乐', note:'Happy: how you felt as a little monkey, with all your friends.'},
      {set:{feastHeld:1, raft:1}}, {say:'makeRaft', by:'big'}, {follow:['elder', 'big', 'playful']},
      {message:'The troop will build you a raft, down on the shore. Lead the old monkey, the big monkey and the little monkey down there, past the waterfall and through the meadow!'}]},
    // and at the water's edge, the troop builds your raft as you watch, and says goodbye
    {if:{place:'shore', raft:1, around:[11, 12, 'shore']}, do:[{follow:[]}, {setUp:{raft:2}},
      {newWord:'木筏', note:'Your raft, from dead pines tied together with rope, and a long pole to push it along.'},
      {say:'bye', by:'hungry'}, {say:'bye', by:'thirsty'}, {say:'bye', by:'playful'}, {say:'bye', by:'big'}, {say:'waitForYou', by:'elder'}, {reply:'再见'},
      {message:'Your {木筏} is ready at the water’s edge. When you’re ready to go, press A at it.'}]},
    // chapter 1: down on the shore for the first time, you see the sea (海, said straight away, as you found it)
    {if:{place:'shore', seaSeen:0}, do:[{set:{seaSeen:1}}, {newWord:'海', note:'The sea! Water as far as you can see. The river from the waterfall runs into it here.'}, {say:'seaBig', by:'player'},
      {message:'Crabs scuttle about on the sand. A crab can only walk sideways: come at one from the front or behind to catch it!'}]},
    // chapter 1: once you know three colours (the first Art lesson), and the flowers you picked with them are planted, the
    // 老板 comes up from the meadow to the home ground, to open a new shop by the way in, with headbands in every colour you
    // know (decided 29 October 2026: by the time his shop had anything worth buying, you'd left the meadow for good). Talk
    // to him, and the troop builds it as you watch.
    {if:{shop:0, schoolFlowers:true, place:'homeGround'}, do:[{set:{shop:1}},
      {message:'The {老板} has come up from the meadow! He wants a new shop at the home ground. Go and see him, by the way in from the {瀑布}.'}]},
    // you've brought the big monkey the wood and the small stones: the troop builds the school at once (a scene, told like
    // the opening: on its plot, the frame goes up, then the walls, the roof and the sign), and you learn 学校 (decided 22
    // October 2026: the frame had just popped up on the map, and you had to talk to him again)
    {if:{build:1, wood:'done', stones:'done'}, do:[{say:'buildIt', by:'big'}, {scene:'buildingSchool'}, {newWord:'学校', note:'The troop has built its school!'},
      {set:{build:2, school:1}},
      {message:'The old monkey has gone in: he’s the teacher now. Walk in through the school’s door!'},
      {message:'The troop used the practice post from the meadow to build it: from now on, you practise your words in lessons at school.'}]},
    // chapter 1: once the old monkey has told you about the feast, as you come up to the big tree at the home ground, the troop
    // sets out the feast's two tables under it, as you watch (the setUp step: their stone legs, their stone slabs, then the
    // peaches and apples, then their stone stools, each with a knock; things that just appear look odd), and the hungry
    // monkey is there to look after them. No bowls yet: the hungry monkey wants you to fetch them from the cave
    {if:{feast:1, around:[17, 7, 'homeGround']}, do:[{setUp:{feast:2}},
      {message:'The troop sets out two {桌子|tables} under the big tree for the feast, with peaches and apples piled up on one. But there are no bowls!'}]},
    // the bowls you brought from the cave: they go on the tables, one at a time; and the big monkey, who makes things for the
    // troop, has made chopsticks for the feast out of wood (his talk, teaching 筷子; decided 27 October 2026: you found them
    // on the table)
    {if:{place:'homeGround', bowls:'done', tableware:0}, do:[{setUp:{tableware:1}}, {say:'haveBowlsNow', by:'hungry'},
      {message:'The bowls go on the feast’s tables. And the big monkey has made something for the feast: go and see him!'}]},   // (a conversation of its own: 不客气 was new just now, in a game that hadn't said it before)
    // you've brought the big monkey his flowers: he plants them in front of the school, as you watch (the plant step: each
    // square of the beds grows up out of the ground, one after another)
    {if:{place:'homeGround', flowers:'done', schoolFlowers:false}, do:[{plant:{schoolFlowers:true}},
      {message:'The big monkey plants your flowers in front of the {学校}: red, yellow and white. It looks lovely!'}]}
  ],

  // The area's places: small maps you move between. The first is where the game starts. Each has
  //   name    Chinese, pinyin and English, shown when you arrive (names aren't vocabulary)
  //   exits   ways to other places: step onto at and you go to the place to, arriving at arrive and
  //           facing facing. An exit with an if stays shut until it matches, and says closed instead. by:'A'
  //           goes when you face it and press A (label: what A says). how: 'water' goes through falling water
  //           (a rush of water instead of a fade), and 'jump' leaps into it first, with a splash
  //   glimpse what's just visible behind a waterfall: a cave's dark mouth, over [x, y, how wide, how tall]
  //   map     one letter per tile; the legend below says what each letter is
  //   music   its own song (one of SONGS in js/sound.js), instead of the area's
  //   gloom   gloomy, as under thick trees (but always in the daytime: never night): shade, darkest deep in the trees
  //           (deep) and lightest where it's open (open), with sunshine on grass and sunbeams slanting into the open
  //           places; mist: true for mist drifting low, and eyes: true for eyes glinting now and then in the deepest shade
  //   sounds  its own sounds, one now and then (some of SFX in js/sound.js), such as crows and a far-off howl; or sounds that
  //           change from one part of it to another, as you go (each part: its rows, from and to, from the top, and its
  //           sounds), such as the hillside's as you climb
  //   battleMusic  its own battle song (one of SONGS), and backdrop: how a battle or an animal's questions look here
  //           (one of BACKDROPS in js/art.js, such as 'pines'), instead of a meadow
  // Positions elsewhere in this file ([x, y], or x and y) are in the first place. Something in another
  // place says which: [x, y, 'place'], or place:'id'.
  places: {
    meadow: {
      name: {zh:'草地', py:'cǎodì', en:'The meadow'},
      exits: [
        // up the mountain path (in the same column: the two maps line up), once the old monkey has sent you off up it
        {at:[15, 0], to:'path', arrive:[15, 18], facing:'up', if:{climb:{atLeast:1}}, closed:'The old monkey wants to talk to you first.'},
        {at:[16, 0], to:'path', arrive:[16, 18], facing:'up', if:{climb:{atLeast:1}}, closed:'The old monkey wants to talk to you first.'},
        // chapter 1: down beside the river to the shore, once the troop has cleared the bushes (for the crab)
        {at:[17, 21], to:'shore', arrive:[18, 1], facing:'down', if:{any:[{crab:'asked'}, {crab:'done'}]}, closed:'Thick bushes block the way.'}
      ],
      map: [
        "^^^^^^^MMMMM^^M..MWWMMMM",
        "^^^^^^^ggSgg^^g..gWWYYYY",
        "^^MMM^^gg.gN^^g..JWWYYYY",
        "MMMMMMMgg.ggMMg..gWWYYYY",
        "MMgggMMgg.ggMMoRRoWWYYYY",
        "YTggggggg.ggggg..gWWYYYY",
        "YPg.............ggWWYYYY",
        "YTggGGGGgggFggg.ggWWgggY",
        "YPggGGGGggggTgg.ggWWgGgY",
        "YTggGGGgggOOOKg.gJWWGGgY",
        "YJgggggggOOOOgg.ggWWGGgY",
        "YTgggGGGgOOOOOg.ggWWgggY",
        "YggJgGGGggOOOgg...BBgggY",
        "YgggggggggggggggggWWgGgY",
        "YTgGGGggggggggFgggWWGGgY",
        "YTggggg.ggggggTgggWWgggY",
        "Y^^^^gg.HHHgggggggWWgggY",
        "Y^^^Mgg.gggEggggggWWgQgY",
        "Y^^MMgg.GGGGgTggggWWgggY",
        "YMMMggg...........BBgEgY",
        "YMMgEggGGGggggggggWWgggY",
        "YYYYYYYYYYYYYYYYYчWWYYYY"
      ]
    },
    // The way up the stream, from the meadow to the waterfall (the end of the prologue), in three places that follow the
    // river. Bushes, boulders and cliffs send you through long grass (there's no way round), where snakes and spiders jump
    // out; on the way back down, short grassy banks in the cliffs let you hop down (decided 23 October 2026, after playing
    // it: a bank right across was too much grass). The mountain path: up beside the river, but a cliff sends you west, up
    // stone steps, and back east through long grass along a terrace.
    // A clearing on the left has a peach tree and the squirrel.
    path: {
      name: {zh:'山路', py:'shānlù', en:'The mountain path'},
      exits: [
        {at:[15, 19], to:'meadow', arrive:[15, 1], facing:'down'}, {at:[16, 19], to:'meadow', arrive:[16, 1], facing:'down'},   // back down to the meadow
        {at:[16, 0], to:'valley', arrive:[19, 11], facing:'up'}, {at:[17, 0], to:'valley', arrive:[19, 11], facing:'up'}       // on up to the river valley
      ],
      map: [
        "YYYYYYYYYYYYYYYYrrWW^^^^",
        "YYYYYYYYYYYYYYYgrrWW^^^^",
        "YYYGGGGYYYYYYYYgrgWW^^^^",
        "YYgPgggJYYYYYYYgrgWW^^^^",
        "YYggggJggrrrrrrrrgWW^^^^",
        "YYYGGGGwwYYYYYYgrgWW^^^^",
        "YYYYwwwYYYYYYYYgrgWW^^^^",
        "^^wwwwwwwwwwwwwgrwWW^^^^",
        "^^gggggnnnnnnggrrgWW^^^^",
        "^^grrrrnnnnnnrrrggWW^^^^",
        "^^rrggnnnnnnnggoggWW^^^^",
        "^^==MMMMMvvMMMMvvvWW^^^^",   // stone steps up the cliff (left), and short grassy banks to hop down
        "^^==MMMMMvvMMMMvvvWW^^^^",
        "^^rrggnnnnnnnnngggWW^^^^",
        "^^rrrrnnnnnnnnrrrgWW^^^^",
        "^^GGGgnnnnnnnngrrgWW^^^^",
        "^^^GGgnnnnnnnngrrgWW^^^^",
        "^^^^^^nnnnnnnngrrgWW^^^^",
        "^^^^^^^^^^^^^^^rr^WW^^^^",
        "^^^^^^^^^^^^^^^rr^WW^^^^"
      ]
    },
    // The river valley: the river turns, coming from the west. At the first bridge the way forks: over it, away from the
    // river, is a clearing with the goat and an apple tree (a dead end); along the river, through long grass, is the second
    // bridge and the way on up. Beside the long grass, a peach tree (a fallen tree blocked it till 30 October 2026, with no
    // way for the troop to move it: taken out).
    valley: {
      name: {zh:'河谷', py:'hégǔ', en:'The river valley'},
      exits: [
        {at:[19, 12], to:'path', arrive:[16, 1], facing:'down'}, {at:[20, 12], to:'path', arrive:[16, 1], facing:'down'},   // back down the mountain path
        {at:[5, 0], to:'falls', arrive:[5, 11], facing:'up'}, {at:[6, 0], to:'falls', arrive:[5, 11], facing:'up'}           // on up, deep into the mountains
      ],
      map: [
        "^^MWWrrMMMMMM^^MMMMMMMMMM^",
        "^^YWWrrgYYYYY^^YYYYYYYYYM^",
        "^^YWWnnnnnnYY^^YggggJgQgY^",
        "^^YWWnnnnnnnY^^YgJgGGGGGY^",
        "^^wWWnnnnnnnwMMwggggGGGgw^",
        "^^wWWgrgggggwMMwwggrggwww^",
        "^^wWWWkWWWWWWWWWWWWkWWWww^",
        "^^wWWWkWWWWWWWWWWWWkWWWww^",
        "^^wgggrgnnnnnnnngggrgWWww^",
        "^^wwgrrrnnnnnnnnrrrrgWWww^",
        "^^wPGGGgnnnnnnnngggrgWWww^",
        "^^wwwGTgnnnnnnnngTgrgWWww^",
        "^^^^^^^^^^^^^^^^^^^rrWW^^^"
      ]
    },
    // Deep in the mountains: beside the river, east along the bottom and up stone steps in a cliff, then back west across
    // long grass, past the wild boar in the narrow way, to the waterfall where the river begins, pouring down the cliff.
    // Jump through it into the Water Curtain Cave.
    falls: {
      name: {zh:'深山', py:'shēnshān', en:'Deep in the mountains'},
      exits: [
        {at:[5, 12], to:'valley', arrive:[5, 1], facing:'down'}, {at:[6, 12], to:'valley', arrive:[5, 1], facing:'down'},   // back down to the river valley
        {at:[4, 1], by:'A', label:'Jump', how:'jump', to:'cave', arrive:[7, 12], facing:'up', if:{cave:{atLeast:1}}},   // jumping through the waterfall
        {at:[19, 2], to:'homeGround', arrive:[1, 9], facing:'right', if:{home:{atLeast:1}}, closed:'Thick bushes block the way.'}   // chapter 1: along beside the waterfall to the troop's home ground
      ],
      glimpse: [3, 0, 2, 2],   // the cave, just visible behind the falling water (x, y, how wide, how tall)
      map: [
        "^^MXXMMMMMMMMMMMMMMM",
        "^^MXXgggJgMMMMMMMMMM",
        "^^YWWggrgggfffffffff",
        "^^YWWwwrwwwYYYYYYY^^",
        "^^YWWggrnnnnnngggY^^",
        "^^YWWggrnnnnnngPgY^^",
        "^^wWWrrrnnnnnnrrrw^^",
        "^^wWWgggnnnnnnrrgw^^",
        "^^wWWvvvMMMMMM==Mw^^",   // a short grassy bank to hop down (left), and stone steps up the cliff (right)
        "^^wWWvvvMMMMMM==Mw^^",
        "^^wWWrrrrrrrrrrrgw^^",
        "^^wWWrgggTggggggTw^^",
        "^^^WWrr^^^^^^^^^^^^^"
      ]
    },
    // Behind the waterfall. You jump in through the water curtain at the bottom, and walk out
    // through it again.
    cave: {
      name: {zh:'水帘洞', py:'Shuǐlián Dòng', en:'Water Curtain Cave'},
      music: 'cave',   // slower, echoing, with drips of water
      exits: [
        {at:[6, 13], how:'water', to:'falls', arrive:[5, 1], facing:'right'},
        {at:[7, 13], how:'water', to:'falls', arrive:[5, 1], facing:'right'},
        {at:[8, 13], how:'water', to:'falls', arrive:[5, 1], facing:'right'}
      ],
      map: [
        "ZZZZZZZZZZZZZZZZ",
        "ZDzDzDZZZZDzDzDZ",
        "ZzzzzzzzzzzzzzzZ",
        "ZzzAAzzzzVVzzzzZ",
        "ZzzAAzzzzzzzzzzZ",
        "ZzzzzzzzzzzzzzzZ",
        "ZUUUUUUIUUUUUUUZ",
        "ZzzzzzzzzzzzzzzZ",
        "ZzzzzzzzzzzzzzzZ",
        "ZzzzzzzzzzzzzzzZ",
        "ZzzzzzzzzzzzzzzZ",
        "ZzzzzLzzzzzzzzzZ",
        "ZzzzzLzzzzzzzzzZ",   // the stone tablet, two squares tall, with 水帘洞 carved down it
        "ZZZZZZCCCZZZZZZZ"
      ]
    },
    // Chapter 1: the troop's home ground, beside the waterfall (the way there opens once the old monkey has told you about
    // it): a wide valley (made bigger on 21 October 2026, with room between its plots), a road through it from the
    // waterfall in the west, and a square in the middle with a big old tree, where the troop meets. It's open ground when
    // you first come: each thing the troop wants to build gets its plot marked out (with string and stakes, and a sign)
    // when its story begins, as you watch (decided 22 October 2026: the plots were there before anyone had planned them):
    // the school on its terrace under the cliff, then, to come, the new shop by the way in, the hive among the flowers,
    // the cow's pen, and the garden by the stream. A peach tree and an apple tree
    // to pick from, and a little pond with fish. The ways out are shut by thick bushes until the troop needs them: north up
    // the hillside to the pine wood (once the big monkey wants wood), east to the bees, south over the stream.
    homeGround: {
      name: {zh:'家园', py:'jiāyuán', en:'Home ground'},
      legend: {
        'k': {look:'bridgeAcross', walk:true, word:'桥', learnOnStep:true, stepNote:'A wooden bridge over the stream.'},   // the bridge over the stream (chapter 1's bridges teach 桥)
        'O': {look:'water', word:'水', note:'A little pool of clear water.'},   // its pool: just water, with no fish in it (decided 24 October 2026: it showed 鱼, fish, as the meadow's pond does)
        '@': {look:'stoneTower', landmark:true, onLook:[{do:[{talkTo:'towerL'}]}]},   // the little monkeys' tower of stones: A talks to them
        // chapter 1: the big table for the feast, under the big tree in the middle, where the troop meets: open grass, until the
        // troop sets it up as you watch (the setUp step, in events: its stone legs, its stone slab, then stone bowls of
        // peaches and apples, and an empty one, waiting for honey; then its two stone stools). Under the big tree, not in the
        // cave's entrance (decided 23 October 2026: every quest comes back to the home ground; 桌子 and 碗 are the cave's words,
        // heard again here). Stone, with stone stools, as in the book (摆开石凳石桌: decided 25 October 2026; it was wood with a
        // red cloth); the square round the big tree is left open for the tables to come as the feast's quests are done
        '%': {look:'grass', walk:true, becomes:[{if:{bees:{atLeast:11}}, to:'*'}, {if:{tableware:{atLeast:2}}, to:'&'}, {if:{tableware:1}, to:','}, {if:{feast:{atLeast:2}}, to:'c'}]},
        // set out bare, peaches and apples piled on it (c); then the bowls from the cave on it (,); then the big monkey's
        // chopsticks (&). A at it: the feast's list
        'c': {look:'feastTableBare', word:'桌子', landmark:true, onLook:[{label:'Look', do:[{feastList:true}]}]},
        ',': {look:'feastTableBowls', word:'桌子', landmark:true, onLook:[{label:'Look', do:[{feastList:true}]}]},
        '&': {look:'feastTable', word:'桌子', landmark:true, onLook:[{if:{new:'筷子'}, label:'Look', do:[{newWord:'筷子', note:'A bamboo cup of chopsticks for the feast, one pair for every monkey.'}]}, {label:'Look', do:[{feastList:true}]}]},
        '*': {look:'feastTableHoney', word:'桌子', landmark:true, onLook:[{if:{new:'筷子'}, label:'Look', do:[{newWord:'筷子', note:'A bamboo cup of chopsticks for the feast, one pair for every monkey.'}]}, {label:'Look', do:[{feastList:true}]}]},   // (and honey in its third bowl, once you've brought it)
        '!': {look:'grass', walk:true, becomes:[{if:{feast:{atLeast:2}}, to:';'}]},
        // chapter 1: the troop's garden by the stream (planned 27 October 2026; Greek letters, as the home ground had used up
        // the others): open grass till the big monkey wants seeds for it, then dug into beds as you watch (ε: the markOut
        // step), with its sign (4); each wild fruit's seeds you bring him are planted in their own part of it as you watch
        // (the plant step): the melons (δ and μ: their vines, ψ). The banana plants (α, β) and the grapes' trellis (γ) come
        // with their places
        'ζ': {look:'grass', walk:true, becomes:[{if:{garden:{atLeast:1}}, to:'ε'}]},
        'α': {look:'grass', walk:true, becomes:[{if:{bananaPlanted:{atLeast:2}}, to:'φ'}, {if:{bananaPlanted:{atLeast:1}}, to:'ρ'}, {if:{garden:{atLeast:1}}, to:'ε'}]},
        'β': {look:'grass', walk:true, becomes:[{if:{bananaPlanted:{atLeast:2}}, to:'χ'}, {if:{bananaPlanted:{atLeast:1}}, to:'σ'}, {if:{garden:{atLeast:1}}, to:'ε'}]},
        'γ': {look:'grass', walk:true, becomes:[{if:{grapePlanted:{atLeast:2}}, to:'υ'}, {if:{grapePlanted:{atLeast:1}}, to:'τ'}, {if:{garden:{atLeast:1}}, to:'ε'}]},
        'δ': {look:'grass', walk:true, becomes:[{if:{melonPlanted:{atLeast:1}}, to:'ψ'}, {if:{garden:{atLeast:1}}, to:'ε'}]},
        'μ': {look:'grass', walk:true, becomes:[{if:{melonPlanted:{atLeast:2}}, to:'ξ'}, {if:{melonPlanted:{atLeast:1}}, to:'ψ'}, {if:{garden:{atLeast:1}}, to:'ε'}]},   // (a ripe melon, once they're ripe)
        'ε': {look:'gardenBed', walk:true},   // the garden's beds, dug
        'ψ': {look:'gardenVines', walk:true, word:'西瓜', note:'Watermelon vines, growing in the garden.'},   // the melons' vines
        '4': {look:'grass', walk:true, becomes:[{if:{garden:{atLeast:1}}, to:'ω'}]},
        'τ': {look:'trellis', word:'葡萄', onLook:[{do:[{message:'The {葡萄} vines climb all over the trellis, green and leafy.'}]}]},   // the grapes' trellis
        'ρ': {look:'bananaHome', word:'香蕉', onLook:[{do:[{message:'A banana plant, its big leaves rustling. No {香蕉} on it yet!'}]}]},   // the troop's two banana plants
        'σ': {look:'bananaHome', word:'香蕉', onLook:[{do:[{message:'A banana plant, its big leaves rustling. No {香蕉} on it yet!'}]}]},
        // ripe in the garden (8 questions after they're planted): melons on the vines, grapes on the trellis, bananas on the plants
        'ξ': {look:'gardenMelon', word:'西瓜', onLook:[{do:[{message:'A big ripe {西瓜}, growing in the garden.'}]}]},
        'υ': {look:'trellisRipe', word:'葡萄', onLook:[{do:[{message:'Bunches of ripe {葡萄} hang from the trellis.'}]}]},
        'φ': {look:'bananaHomeRipe', word:'香蕉', onLook:[{do:[{message:'A banana plant, a bunch of ripe {香蕉} hanging under its leaves.'}]}]},
        'χ': {look:'bananaHomeRipe', word:'香蕉', onLook:[{do:[{message:'A banana plant, a bunch of ripe {香蕉} hanging under its leaves.'}]}]},
        // the feast's table for the garden's fruit, left of the big one, set out with the first fruit to go on it (fruitTable),
        // a square at a time, each with its own bowl, filled as each fruit goes on, in any order: watermelon (η), grapes (θ),
        // bananas (ι); and its stools (κ), either side of the little monkey who plays hide and seek. A at it: the feast's list
        'η': {look:'grass', walk:true, becomes:[{if:{melonPlanted:{atLeast:4}}, to:'λ'}, {if:{fruitTable:{atLeast:1}}, to:'ν'}]},
        'θ': {look:'whiteFlowers', walk:true, word:'花', learnOnStep:true, colour:'白色', becomes:[{if:{grapePlanted:{atLeast:4}}, to:'π'}, {if:{fruitTable:{atLeast:1}}, to:'ο'}]},
        'ι': {look:'grass', walk:true, becomes:[{if:{bananaPlanted:{atLeast:4}}, to:'Φ'}, {if:{fruitTable:{atLeast:1}}, to:'Σ'}]},
        'κ': {look:'grass', walk:true, becomes:[{if:{fruitTable:{atLeast:1}}, to:';'}]},
        'ν': {look:'fruitTableL', word:'桌子', landmark:true, onLook:[{label:'Look', do:[{feastList:true}]}]},
        'ο': {look:'fruitTableM', word:'桌子', landmark:true, onLook:[{label:'Look', do:[{feastList:true}]}]},
        'Σ': {look:'fruitTableR', word:'桌子', landmark:true, onLook:[{label:'Look', do:[{feastList:true}]}]},
        'λ': {look:'fruitTableMelon', word:'桌子', landmark:true, onLook:[{label:'Look', do:[{feastList:true}]}]},
        'π': {look:'fruitTableGrapes', word:'桌子', landmark:true, onLook:[{label:'Look', do:[{feastList:true}]}]},
        'Φ': {look:'fruitTableBananas', word:'桌子', landmark:true, onLook:[{label:'Look', do:[{feastList:true}]}]},
        'ω': {look:'sign', landmark:true, label:'Read', onLook:[{do:[{message:'The troop’s garden. The big monkey grows fruit here for the feast.'}]}]},
        ';': {look:'stoneStool'},   // a stone stool at the table
        // chapter 1: the bushes at the east end of the road, until the troop clears the way east along the stream, to the bees
        'q': {look:'bush', landmark:true, becomes:[{if:{bees:{atLeast:1}}, to:'.'}], onLook:[{do:[{message:'Thick bushes. The troop will clear a way through here when it’s needed.'}]}]},
        // chapter 1: the bushes past the bridge, at the south end of the path, until the troop clears the way south to the
        // pasture, where the cow is lost (the thirsty monkey's news)
        'u': {look:'bush', landmark:true, becomes:[{if:{cow:{atLeast:1}}, to:'.'}, {if:{garden:{atLeast:1}}, to:'.'}], onLook:[{do:[{message:'Thick bushes. The troop will clear a way through here when it’s needed.'}]}]},
        // chapter 1: the cow's pen, south of the road, seven squares by four: open grass, until the troop marks out its plot
        // (cow 6: the markOut step) and builds it as you watch (cow 7: setUp): its fences round its edge (-), and inside,
        // where you can walk (_), in at its gate, facing the road; a shelter with hay at the back, and a trough of fresh
        // water at the front, fed by a bamboo pipe (bigger than the plot first planned, 5 by 3: decided 26 October 2026,
        // when the cow came as a rescue). A at it, once the cow lives there, talks to the cow
        '-': {look:'grass', walk:true, becomes:[{if:{cow:{atLeast:7}}, to:'#'}, {if:{cow:6}, to:'<'}]},
        '_': {look:'grass', walk:true, becomes:[{if:{cow:{atLeast:7}}, to:'+'}, {if:{cow:6}, to:'<'}]},
        '<': {look:'grassPlot', walk:true},   // its plot, marked out on the grass, which stays: grass for the cow to graze
        '#': {look:'pen', word:'牛', landmark:true, onLook:[{if:{cow:{atLeast:8}}, do:[{talkTo:'cow'}]},
          {do:[{message:'The {牛}’s new home: a shelter with hay, and fresh water from a bamboo pipe. Lead it in through the gate!'}]}]},
        '+': {look:'penGround', walk:true, partOf:'pen'},
        // chapter 1: the feast's second table, beside the first: open grass, until the troop sets out both tables as you
        // watch, bare (decided 27 October 2026: it appeared once the milk came, and the feast got a new table each time);
        // then three bowls from the cave go on it, empty; then the cow's milk goes in a bowl, with a jug of it (milkTable 1),
        // then yoghurt, the big monkey's spoon in it (2), and cheese (3), from the little dairy; its stools (~)
        '(': {look:'grass', walk:true, becomes:[{if:{milkTable:{atLeast:3}}, to:']'}, {if:{milkTable:2}, to:'['}, {if:{milkTable:1}, to:')'}, {if:{tableware:{atLeast:1}}, to:'{'}, {if:{feast:{atLeast:2}}, to:'`'}]},
        '`': {look:'milkTableBare', word:'桌子', landmark:true, onLook:[{label:'Look', do:[{feastList:true}]}]},   // set out bare, till the bowls from the cave
        '{': {look:'milkTableEmpty', word:'桌子', landmark:true, onLook:[{label:'Look', do:[{feastList:true}]}]},   // A at it: the feast's list
        ')': {look:'milkTable', word:'桌子', landmark:true, onLook:[{label:'Look', do:[{feastList:true}]}]},
        '[': {look:'milkTableYog', word:'桌子', landmark:true, onLook:[{if:{new:'勺子', milkTable:{atLeast:2}}, label:'Look', do:[{newWord:'勺子', note:'A wooden spoon in the yoghurt, to eat it with.'}]}, {label:'Look', do:[{feastList:true}]}]},   // (and the spoon in the yoghurt, 勺子, sparkling till you know it)
        ']': {look:'milkTableCheese', word:'桌子', landmark:true, onLook:[{if:{new:'勺子', milkTable:{atLeast:2}}, label:'Look', do:[{newWord:'勺子', note:'A wooden spoon in the yoghurt, to eat it with.'}]}, {label:'Look', do:[{feastList:true}]}]},
        '~': {look:'grass', walk:true, becomes:[{if:{feast:{atLeast:2}}, to:';'}]},
        // chapter 1: the little dairy (the game's owner's idea, 26 October 2026), between the road and the cow's pen's sign:
        // open grass, until the thirsty monkey takes some of the cow's milk there, and the troop sets up a table under a
        // thatched roof as you watch (dairy 1: a pail of milk on it, and a pot with a cloth tied over it, something being
        // made), with jars of yoghurt on its shelf once he's made them (3), and cheese (5)
        '?': {look:'grass', walk:true, becomes:[{if:{dairy:{atLeast:5}}, to:'}'}, {if:{dairy:{atLeast:3}}, to:'/'}, {if:{dairy:{atLeast:1}}, to:'>'}]},
        '>': {look:'dairy', landmark:true, onLook:[{do:[{message:'The thirsty monkey’s little dairy: a pail of the {牛}’s milk, and a pot with a cloth tied over it. He’s making something!'}]}]},
        '/': {look:'dairyYog', landmark:true, onLook:[{if:{dairy:4}, do:[{message:'Jars of {酸奶} on the shelf, and a pot with a cloth tied over it: something else is ready!'}]},
          {do:[{message:'Jars of {酸奶} on the shelf, and a pot with a cloth tied over it: he’s making something else!'}]}]},
        '}': {look:'dairyCheese', landmark:true, onLook:[{do:[{message:'Jars of {酸奶} and a round {奶酪} on the shelf, all made from the cow’s milk.'}]}]},
        // chapter 1: the feast's fish, on a stone table of its own at the end of the second one: open grass, till you bring the
        // hungry monkey a big fish (fishTable 1: the setUp step, its stone, then a big leaf with the fish on it). A at it: the
        // feast's list
        'Γ': {look:'grass', walk:true, becomes:[{if:{shrimpTable:{atLeast:1}}, to:'Ш'}, {if:{fishTable:{atLeast:1}}, to:'Λ'}]},
        'Λ': {look:'fishTable', word:'桌子', landmark:true, onLook:[{label:'Look', do:[{feastList:true}]}]},
        'Ш': {look:'fishTableShrimp', word:'桌子', landmark:true, onLook:[{label:'Look', do:[{feastList:true}]}]},   // (and a bowl of shrimp on it)
        // chapter 1: the feast's crab, on a stone table of its own, between the garden's fruit and the big table: open grass, till
        // you bring the hungry monkey a crab (crabTable 1: its stone, then the crab on a plate). A at it: the feast's list
        'Ж': {look:'grass', walk:true, becomes:[{if:{crabTable:{atLeast:1}}, to:'Щ'}]},
        'Щ': {look:'crabTable', word:'桌子', landmark:true, onLook:[{label:'Look', do:[{feastList:true}]}]},
        // chapter 1: the 老板's new shop, by the way in from the waterfall, three squares by two: open grass till he comes up from
        // the meadow (shop 1); its plot marked out as you watch (2: the markOut step), with its sign (Θ), and then his shop
        // built on it (3: setUp), posts, counter, striped roof and what he sells (Δ). A at it talks to him
        'd': {look:'grass', walk:true, becomes:[{if:{shop:{atLeast:3}}, to:'Δ'}, {if:{shop:2}, to:'6'}]},
        'Δ': {look:'shop', landmark:true, onLook:[{do:[{talkTo:'boss'}]}]},
        '2': {look:'grass', walk:true, becomes:[{if:{shop:{atLeast:2}}, to:'Θ'}]},
        'Θ': {look:'sign', landmark:true, label:'Read', onLook:[{if:{shop:{atLeast:3}}, do:[{message:'The {老板}’s shop: {头带|headbands} in every colour you know, and food for your bag.'}]},
          {do:[{message:'The troop is building the {老板} a new shop here, by the way in.'}]}]},
        // a gap in the trees at the back left, under the cliff: the way to the sports ground, once PE is on the timetable
        'Ω': {look:'tree', becomes:[{if:{firstLessons:6}, to:'g'}]}
      },
      exits: [
        {at:[0, 9], to:'falls', arrive:[18, 2], facing:'left'}, {at:[0, 10], to:'falls', arrive:[18, 2], facing:'left'},   // back to the waterfall
        {at:[25, 0], to:'hillside', arrive:[12, 43], facing:'up', if:{build:{atLeast:1}}, closed:'Thick bushes block the way.'},   // up the hillside to the pine wood
        {at:[11, 4], to:'school', arrive:[7, 8], facing:'up', when:{school:{atLeast:1}}},   // the school's door, once it's built (when: not a way in till then)
        {at:[31, 9], to:'riverside', arrive:[1, 7], facing:'right', if:{bees:{atLeast:1}}, closed:'Thick bushes block the way.'},   // east along the stream, to the bees
        {at:[16, 21], to:'southSlope', arrive:[12, 1], facing:'down', if:{any:[{cow:{atLeast:1}}, {garden:{atLeast:1}}]}, closed:'Thick bushes block the way.'},   // south, over the bridge, down the south slope to the pasture (the cow) and the melon field (the garden)
        {at:[0, 2], to:'sportsGround', arrive:[13, 2], facing:'left', when:{firstLessons:6}},   // through the gap in the trees at the back left, to the sports ground (PE)
      ],
      map: [
        "YMMMMMMMMMMMMMMMMMMMMMMMYbYYYYYY",   // the cliff behind the school, rising out of sight
        "YMMMMMMMMMMMMMMMMMMMMMMMg.gYYYYY",
        "Ωgggggggsssssssgggggggggg.FEJFFY",
        "YgTggg1gsssssssgggggTgggg.3hhhgY",
        "YgggggggsssssssggggggPggg.ghhhEY",
        "Ygggggggg99899gggTTgggggg.JEFgJY",   // the beds in front of the school (9), where the big monkey plants your flowers
        "YggTggggggg8gggggTTgggggg.gggggY",
        "YgEFddd2ggg8ηθιЖ%%%gF(((Γ.gggTgY",   // the 老板's shop (d), by the way in from the waterfall, with its sign (2); the feast's big table (%), under the big tree; and its second, beside it ((), with the fish's at its end (Γ)
        "Ygggdddgggg8κgκg!g!gg~g~g.g@gggY",   // their stone stools (! and ~); little monkeys building a tower of stones (@), just past the way up to the hillside
        "...............................q",   // the road: east to the riverside, once the bushes are cleared (q)
        "...............................Y",
        "Yggggggggggggggg.gg??gg-_-----EY",   // the little dairy (?); the cow's pen: its fences round its edge (-), inside it (_), in at its gate
        "YggggggggEgggggg.gg??g5-___---gY",   // (5: its sign)
        "YgggggggTgggggTg.gJFgTg--____-gY",
        "Yggααββγγγγδδggg.gggggg-------gY",   // the garden by the stream (α to μ): banana plants, a trellis of grapes, melons, and beds; its sign (4)
        "Yggααββγγγγμδ4gg.gOOOggggggggTgY",
        "YgTζζζζζζζζδμggg.gOOOggTgggQgggY",
        "Yggζζζζζζζζμδggg.ggggTgggggggggY",
        "WWWWWWWWWWWWWWWWkWWWWWWWWWWWWWWW",   // the stream, flowing in from the west and out through the trees to the east
        "YYYYYYYYYYYYYYYY.YYYYYYYYYYYYYYY",
        "YYYYYYYYYYYYYYYY.YYYYYYYYYYYYYYY",
        "YYYYYYYYYYYYYYYYuYYYYYYYYYYYYYYY"    // the way south to the pasture, once the bushes are cleared (u)
      ]
    },
    // Chapter 1: the shore (海边), below the meadow, where the river from the waterfall runs into the sea (decided 29 October
    // 2026: last of the feast's quests, a crab, so it's fresh; and where you leave from, on a raft, at the end of chapter 1).
    // A path down from the meadow beside the river, through a little grass, then sand, with rocks and rock pools, a bridge
    // over the river, and the sea along the bottom, its waves washing up the sand. Crabs scuttle about on the sand: only
    // sideways, so come at one from the front or behind to catch it.
    shore: {
      name: {zh:'海边', py:'hǎibiān', en:'The shore'},
      sounds: ['wind', 'birds'],
      legend: {
        'с': {look:'sand', walk:true},
        'м': {look:'sea', word:'海', note:'The sea, as far as you can see. Waves wash up the sand.'},
        'л': {look:'rockPool', word:'水', note:'A rock pool: clear water left by the sea, with a little red starfish in it.'},
        'к': {look:'shoreRock', word:'石头'},
        // where the troop builds your raft, at the water's edge, at the end of chapter 1 (raft 2: the setUp step)
        'ф': {look:'sea', word:'海', becomes:[{if:{raft:{atLeast:2}}, to:'Ф'}]},
        'Ф': {look:'raft', word:'木筏', landmark:true, label:'Board', onLook:[{if:{raft:2}, do:[{scene:'sailAway'}, {set:{raft:3, done:true}}, {areaEnd:true}]},
          {do:[{scene:'sailAway'}, {message:'Your {木筏}, waiting at the water’s edge. The next part of the journey is still to come!'}]}]}
      },
      exits: [
        {at:[18, 0], to:'meadow', arrive:[17, 20], facing:'up'}   // back up to the meadow
      ],
      map: [
        "YYYYYYYYYYYYYYYYYY.WWYYYYYYY",   // the path down from the meadow, beside the river
        "YYYgggTgggYYYYYggg.WWggggYYY",
        "YYggggggEggggFgggg.WWgTgggYY",
        "YgggTggggggJgggggg.WWggggggY",
        "Ygggggggggggggg....WWggggTgY",
        "YYсссссссссссссссссWWссссссY",   // the sand begins
        "YксссссссссссккссссWWсссссYY",
        "YссссссссссссссссссBBссссскY",   // a little bridge over the river
        "YссслссссссссссссссWWссссссY",   // rock pools (л) on the sand, and rocks (к), shells hidden by some
        "YссссссссссссксссссWWссслссY",
        "YссссссссссссссссссWWссссссY",
        "YксссссссксссссссссWWссксссY",
        "кссссссссссссссссссWWсссссск",   // the water’s edge
        "ммммммммммффмммммммммммммммм",   // the sea (м), where the troop builds your raft (ф), at the end of chapter 1
        "мммммммммммммммммммммммммммм",
        "мммммммммммммммммммммммммммм",
        "мммммммммммммммммммммммммммм",
        "мммммммммммммммммммммммммммм"
      ]
    },
    // Chapter 1: the hillside, the way from the home ground up to the pine wood (decided 23 October 2026: the wood was
    // straight through the bushes at the top of the home ground, a different world a step away, and chapter 1 had few
    // places to practise the words you know; laid out again the same day, after playing the first, which was short, dull
    // and all big blocks of long grass). About 90 steps up, winding, in three parts that each look different: at the foot,
    // a slope of flowers, a winding brook you cross on stepping stones, and a hedge; in the middle, three terraces, each a
    // level higher, with an edge between them that's one drop, as high all along (rock cliffs, stone steps up them, and
    // grassy banks you hop down, the quicker way back), and a lookout, a flat rock at the top of a cliff with a railing;
    // at the top, under the first pines, mushrooms, and a stone archway with 松林 on it, the way into the wood. Long grass
    // in patches, most of which you can go round; where it has grown over the way (the gap in the hedge, across the lowest
    // terrace, under the pines), you can't, so you meet what lives in it: snakes and spiders, and now and then a wolf from
    // the pines, practising words you know. A peach tree in a corner, and tall grass where your friends hide.
    hillside: {
      name: {zh:'山坡', py:'shānpō', en:'The hillside'},
      // sounds that change as you climb (decided 23 October 2026): crows under the pines at the top, the wind on the terraces,
      // and birdsong at the foot, by the flowers and the brook
      sounds: [{rows:[0, 15], sounds:['crow', 'crow', 'wind']}, {rows:[16, 31], sounds:['wind']}, {rows:[32, 45], sounds:['birds']}],
      exits: [
        {at:[12, 45], to:'homeGround', arrive:[25, 1], facing:'down'}, {at:[13, 45], to:'homeGround', arrive:[25, 1], facing:'down'},   // down to the home ground
        {at:[12, 0], to:'pineWood', arrive:[16, 26], facing:'up'}, {at:[13, 0], to:'pineWood', arrive:[17, 26], facing:'up'},   // into the pine wood
        {at:[0, 26], to:'cliffs', arrive:[24, 5], facing:'left', if:{garden:{atLeast:1}}, closed:'Thick bushes block the way.'},   // west to the cliffs, once the garden begins
        {at:[0, 27], to:'cliffs', arrive:[24, 6], facing:'left', if:{garden:{atLeast:1}}, closed:'Thick bushes block the way.'}
      ],
      legend: {
        'n': {look:'longGrass', walk:true, wild:['snake', 'snake', 'spider', 'spider', 'wolf']},   // long grass: snakes and spiders, and now and then a wolf
        // flowers on the slope, each square all one colour (F red, E yellow and J white, as in the meadow, and these): A shows its
        // colour, such as 粉色的花 (a pink flower), once you know it
        'k': {look:'pinkFlowers', walk:true, word:'花', learnOnStep:true, colour:'粉色'},
        'u': {look:'blueFlowers', walk:true, word:'花', learnOnStep:true, colour:'蓝色'},
        'e': {look:'orangeFlowers', walk:true, word:'花', learnOnStep:true, colour:'橙色'},
        'z': {look:'steppingStones', walk:true},              // stepping stones over the brook
        'm': {look:'mushrooms', walk:true, landmark:true, word:'蘑菇', note:'Red mushrooms with white spots, under the pines. Pretty, but not for eating!'},   // mushrooms under the pines: A teaches 蘑菇 (decided 28 October 2026: they were just to look at)
        'A': {look:'archway', walk:true, says:'松林'},         // the way through the archway into the pine wood, with its name on the board over it
        'I': {look:'archPost'},                               // the archway's pillars
        'L': {look:'slabs', walk:true},                       // the lookout's stone platform
        'R': {look:'railing', landmark:true, onLook:[{do:[{scene:'lookout'}]}]},  // its railing, at the top of the cliff: A shows you the view
        // thick bushes at the west end of the second terrace, till the garden begins: the way west to the cliffs
        'q': {look:'bush', landmark:true, becomes:[{if:{garden:{atLeast:1}}, to:'.'}], onLook:[{do:[{message:'Thick bushes. The troop will clear a way through here when it’s needed.'}]}]}
      },
      map: [
        "pppppppppppp..pppppppppppp",   // the way into the pine wood
        "ppppppppppii..iipppppppppp",
        "ppppppppppiIAAIipppppppppp",   // the archway, with 松林 on its board
        "pppppppppiii..iimipppppppp",
        "ppppppppmimi..iiiiippppppp",
        "pppppppiiimi..iiiipppppppp",
        "ppppppp......iiiimpppppppp",
        "pppppppnnnnppppppppppppppp",   // long grass grown over the way under the pines
        "pppppnnnnpnnnppppppppppppp",
        "ppppppnnnnnnnppppppppppppp",
        "ppppppnniiiiiiiiiipppppppp",
        "pppppii.iiiiiiiimipiippppp",   // out of the pines, straight down to the steps
        "YYppiTg.ggggggggggTippipYY",   // the edge of the pines
        "YYpgggg.ggogggggnnnggggpYY",
        "YYgggg..ggggggggnnnnTgpgYY",
        "YYgTgg..gggggggggggggTggYY",
        "MMMMMM==MMvvvvvvvMMMMMMMMM",   // stone steps up the cliff (left), a grassy bank to hop down (middle): right across, off the map at both sides
        "MMMMMM==MMvvvvvvvMMMMMMMMM",
        "YYgggg..ggggggggggggggggYY",
        "YYGGGg..............ggggYY",   // along the terrace to the lookout
        "YYGGGogggggggnnngg..LLLLYY",   // the lookout: a stone platform at the top of the cliff
        "YYGGGgggggggTgnngo..LLLLYY",
        "YYgggTggggggggggTg..RRRRYY",   // its railing
        "MMMMMMMMvvvvvvvMMM==MMMMMM",   // stone steps (right), a bank (middle)
        "MMMMMMMMvvvvvvvMMM==MMMMMM",
        "YYggggggggonnggggg..ggggYY",   // long grass right across, among boulders
        "qq........nnn.......ggTgYY",   // west, through the bushes: the cliffs
        "qq.Tgg.gggnnnggggggnnnggYY",
        "YYggg..gognonTgggggnnnggYY",
        "YYgTg..gggnnoggggggggTggYY",
        "MMMMM==MMMvvvvvvvvMMMMMMMM",   // stone steps (left), a bank (middle)
        "MMMMM==MMMvvvvvvvvMMMMMMMM",
        "YYgEg..egugkggEgggeguggkYY",   // a slope of flowers; a peach tree in the corner
        "YYgPg..gugkgJggEFggegukgYY",
        "YYkgg...............ggegYY",
        "YYgkJggggFgggugggJWzWWWWYY",   // the brook, winding, and its stepping stones
        "YYgggggWWWWWWWWWWWWzWWWWYY",
        "YYWWWWWWWWWWWWWWWWg.ggggYY",
        "YYWWWWWgggTgggg.....ggggYY",
        "YYggTggggggggggnngggggTgYY",
        "YYggggggggwTwwnnnnggggggYY",   // a hedge, and the gap grown over with long grass
        "YYwwTwwwTwgggnnnnwwwTwwTYY",
        "YYggggggggggggnnggggggggYY",
        "YYgGGGGggggg....ggnnnnggYY",   // tall grass, where the fox hides (chapter 1's), and your friends
        "YYgGGGGgTggg..ggggnnnnggYY",
        "YYYYYYYYYYYY..YYYYYYYYYYYY"    // down to the home ground
      ]
    },
    // Chapter 1: the riverside, the way east from the home ground along the stream, to the valley where the bees live (built 25
    // October 2026, the bees' step 1, from a mock-up: the troop clears the bushes at the east end of the road once the hungry
    // monkey wants honey). About 55 steps, in three parts that each look different: along the bank through a little wood,
    // where long grass has grown over the way between the trees (you can't go round); up through a slope of wildflowers,
    // where a butterfly flutters, and back down to a wooden bridge over a brook; then under the valley's rocks, where the
    // stream comes close and long grass has grown over the way again. Tall grass where your friends hide, fish jumping in the
    // stream, and shells and an apple tucked away. At its end, under the rocks, the way into the bees' valley.
    riverside: {
      name: {zh:'河边', py:'hébiān', en:'The riverside'},
      sounds: ['birds'],
      exits: [
        {at:[0, 7], to:'homeGround', arrive:[30, 9], facing:'left'}, {at:[0, 8], to:'homeGround', arrive:[30, 9], facing:'left'},   // back to the home ground
        {at:[47, 7], to:'flowerValley', arrive:[1, 10], facing:'right'}, {at:[47, 8], to:'flowerValley', arrive:[1, 11], facing:'right'},   // on into the bees' valley
        {at:[25, 0], to:'hotSprings', arrive:[13, 22], facing:'up', if:{garden:{atLeast:1}}, closed:'Thick bushes block the way.'},   // up the brook to the hot spring valley, once the garden begins
        {at:[26, 0], to:'hotSprings', arrive:[14, 22], facing:'up', if:{garden:{atLeast:1}}, closed:'Thick bushes block the way.'}
      ],
      legend: {
        // wildflowers on the slope, each square all one colour (F red, E yellow and J white, as in the meadow, and these): A shows
        // its colour, such as 蓝色的花 (a blue flower), once you know it (they were of all colours till 26 October 2026)
        'k': {look:'pinkFlowers', walk:true, word:'花', learnOnStep:true, colour:'粉色'},
        'u': {look:'blueFlowers', walk:true, word:'花', learnOnStep:true, colour:'蓝色'},
        'e': {look:'orangeFlowers', walk:true, word:'花', learnOnStep:true, colour:'橙色'},
        'ш': {look:'shallows', word:'水', fishing:'shrimp', note:'Clear, shallow water over pebbles. Little shrimp dart about in it!'},   // the brook above the bridge, where shrimp live (chapter 1)
        'B': {look:'bridge', walk:true, word:'桥', learnOnStep:true, stepNote:'A wooden bridge over the brook.'},   // over the brook (chapter 1's bridges teach 桥)
        // thick bushes beside the brook, at the top, till the garden begins: the way up it to the hot spring valley
        'q': {look:'bush', landmark:true, becomes:[{if:{garden:{atLeast:1}}, to:'.'}], onLook:[{do:[{message:'Thick bushes. The troop will clear a way through here when it’s needed.'}]}]}
      },
      map: [
        "YYYYYYYYYYYYYYYYYYYYYYYYYqqWWYYYY^^^^^^^^^^^^^^^",   // the brook comes down through the trees, under the bridge (B), into the stream; beside it, the way up it (q)
        "YYYYYYYYYYYYYYYYYYYYYYYYYqqWWYYYY^^^^^^^^^^^^^^^",
        "YgggggTggYYYYggggggTgukkg..шшgggg^^^^^^^^^^^^^^^",
        "YggGGGgggYYYYggEFFeguukkJ..шшgeeuMMMMMM^^^^^^^^^",   // the valley’s rocks: a cliff, two squares high, coming forward over the way
        "YgGGGGGggYYYYggkJJEEFFeeu..шшgEEFMMMMMM^^^^^^^^^",
        "YggGGGgggYYYY..........eu..шшgEEFgggoggMMMMMMMMM",   // the way up through the wildflowers, where the butterfly is
        "YggggggggYYYY..........EF..шшgggggnnngoMMMMMMMMM",
        "........nnnnn..gggggg......BB............nnnn...",   // in from the home ground; long grass grown over the way in the little wood, and under the rocks;
        ".........nnnnn.ggTeeg......BB...........nnnn....",   // out into the bees' valley
        "YggTgFeegYYYYgggTggnnngggggWWggTggoggogWWWWWWWWW",
        "YggggJEEgYYYYggggggnnngTgggWWgggggggogWWWWWWWWWW",
        "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",   // the stream, and its far bank
        "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
        "gggggggggggggggggggggggggggggggggggggggggggggggg",
        "YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY",
        "YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY"
      ]
    },
    // Chapter 1: the bees' valley, 百花谷 (the Valley of a Hundred Flowers), at the end of the riverside (built 25 October 2026,
    // the bees' step 2, from a mock-up). Rock all round, cliffs at the back, and flowers everywhere: beds of low flowers,
    // each its own colour, just to look at, and tall flowers in patches all over, where the bees and the wasps both hide, so
    // you never see either till it comes out (decided 25 October 2026 by the game's owner): wasps jump out to fight, by
    // chance, as snakes do from long grass, and the bees (next) hide as the meadow's animals do, the flowers shaking where
    // one is. Tall flowers have grown across the way in, between the rocks: no way round, so you meet a wasp or two. A pond
    // under the cliff. In a nook of the cliff, top right, the queen's old hollow tree, a swarm of bees across the way to it.
    flowerValley: {
      name: {zh:'百花谷', py:'Bǎihuā Gǔ', en:'Valley of a Hundred Flowers'},
      sounds: ['birds', 'buzz', 'buzz'],   // birdsong, and bees buzzing in the flowers
      backdrop: 'flowers',   // a battle here: among the flowers, the valley's cliffs behind
      exits: [
        {at:[0, 10], to:'riverside', arrive:[46, 7], facing:'left'}, {at:[0, 11], to:'riverside', arrive:[46, 8], facing:'left'}   // back along the riverside
      ],
      legend: {
        'n': {look:'tallFlowers', walk:true, wild:['wasp'], animals:['bee']},   // tall flowers: wasps jump out to fight, and only the bees hide here
        // beds of flowers, each its own colour: A shows it, such as 粉色的花 (a pink flower), once you know the colour (they were just
        // to look at till 26 October 2026)
        'r': {look:'redBed', walk:true, word:'花', colour:'红色'}, 'y': {look:'yellowBed', walk:true, word:'花', colour:'黄色'}, 'w': {look:'whiteBed', walk:true, word:'花', colour:'白色'},
        'p': {look:'pinkBed', walk:true, word:'花', colour:'粉色'}, 'b': {look:'blueBed', walk:true, word:'花', colour:'蓝色'}, 'o': {look:'orangeBed', walk:true, word:'花', colour:'橙色'},
        'O': {look:'water', word:'水', note:'A clear pond under the cliff.'},
        // the queen's old hollow tree: once the swarm has flown aside, A brings the queen bee out to talk to you (and again, if
        // she went back in when you didn't win her word game)
        'h': {look:'hollowTree', landmark:true, onLook:[
          {if:{bees:{atLeast:3, below:5}, queenOut:false}, do:[{sound:'buzz'}, {set:{bees:4, queenOut:true}}, {leap:'queen', from:[25, 4]}, {talkTo:'queen'}]},
          {if:{bees:4, queenOut:true}, do:[{talkTo:'queen'}]},   // (she's out, hovering in front of it)
          {if:{bees:{atLeast:5}}, do:[{message:'The old hollow tree is quiet now: the queen bee and her bees have gone with you.'}]},
          {do:[{sound:'buzz'}, {message:'An old, hollow tree, humming with bees. Honeycomb glints inside, and deep in it, something big is buzzing…'}]}]},
        's': {look:'swarm', landmark:true, becomes:[{if:{bees:{atLeast:3}}, to:'.'}],   // the swarm, till all six bees are your friends
          onLook:[{do:[{sound:'buzz'}, {message:'A swarm of bees hangs in front of the old tree, buzzing. They won’t let you by till the six bees hiding in the tall flowers are your friends ({beeCount} of 6).'}]}]}
      },
      map: [
        "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
        "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
        "^^^^^^MMMMMMMMMMMMMMM^^^MMMM^^^^",   // the cliff all round, two squares high at the back; top right, a nook in it, where the queen’s old hollow tree (h) stands
        "^^^^^^MMMMMMMMMMMMMMM^^^MMMM^^^^",
        "^^^^^^ggggggOOOOggggg^^^ghhg^^^^",
        "^^^^^^gTgrrOOOOOOgggg^^^ghhg^^^^",   // a pond under the cliff
        "^^^^^^ggrrrrggggnyyyyMMMggggMM^^",
        "^^^^^^ggrrrrggggngyyyMMMssssMM^^",   // the swarm (s), across the nook’s mouth
        "MMMMMMggggg..........gggg..ggg^^",
        "MMMMMMnnggg..........gggg..gTg^^",
        ".....nnnn....gggggg..gggg..oog^^",   // in from the riverside: tall flowers grown across the way, between the rocks (no way round)
        ".....nnnnn...gnnnng........oog^^",
        "^^^^^^nnngggggnnnng........oog^^",
        "^^^^^^gggggggggggTgggggggggggg^^",
        "^^^^^^ggnnnngwwwggggggggnnnngg^^",   // tall flowers in patches all over, where the bees and the wasps hide; beds of flowers, each its own colour, just to look at
        "^^^^^^ggnnnggwwwggnnnnggnnnngg^^",
        "^^^^^^ppppgggggggnnnnnnggnnngg^^",
        "^^^^^^ppppggngggggnnnbbbbbgggg^^",
        "^^^^^^ppppnnnnnggggggbbbbbgnnT^^",
        "^^^^^^gggggnnngggggggggggggggg^^",
        "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
        "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"
      ]
    },
    // Chapter 1: the south slope (南坡 nánpō, a name for the native speaker to check), the way down from the home ground's
    // bridge to the pines and the pasture, where the cow is lost (decided 27 October 2026, after playing the cow's story: the
    // way there was short, easy and boring). Four terraces, a cliff between each, the hillside's way: stone steps at one
    // end, the long way, and a grassy bank in the middle to hop down, the quick way, which you can't climb, so the way back
    // up, with the cow, is the long way round. On the second terrace, a lookout at the top of the cliff: from its railing
    // you see the cow far below, by its spring beyond the dark pines (the cowView scene). A goat; a brook with stepping
    // stones; long grass with snakes and spiders; a wild apple tree and a peach tree for your bag; then the pines begin.
    southSlope: {
      name: {zh:'南坡', py:'nánpō', en:'The south slope'},
      sounds: [{rows:[0, 30], sounds:['birds', 'wind']}, {rows:[31, 39], sounds:['crow', 'wind']}],
      exits: [
        {at:[12, 0], to:'homeGround', arrive:[16, 20], facing:'up'}, {at:[13, 0], to:'homeGround', arrive:[16, 20], facing:'up'},   // up to the home ground
        {at:[12, 39], to:'darkPines', arrive:[16, 1], facing:'down'}, {at:[13, 39], to:'darkPines', arrive:[17, 1], facing:'down'},   // down into the dark pines
        {at:[25, 13], to:'melonField', arrive:[1, 9], facing:'right', if:{garden:{atLeast:1}}, closed:'Thick bushes block the way.'},   // east to the melon field, once the garden begins
        {at:[25, 14], to:'melonField', arrive:[1, 10], facing:'right', if:{garden:{atLeast:1}}, closed:'Thick bushes block the way.'}
      ],
      legend: {
        'n': {look:'longGrass', walk:true, wild:['snake', 'snake', 'spider']},   // long grass: snakes and spiders
        // flowers on the slope, each square all one colour, as on the hillside
        'k': {look:'pinkFlowers', walk:true, word:'花', learnOnStep:true, colour:'粉色'},
        'u': {look:'blueFlowers', walk:true, word:'花', learnOnStep:true, colour:'蓝色'},
        'e': {look:'orangeFlowers', walk:true, word:'花', learnOnStep:true, colour:'橙色'},
        // stepping stones over the brook, one to a square, to hop onto: hear a word, and hop onto the stone with its picture
        'z': {look:'hopStone', hop:{label:'Stepping stones', ask:'Listen, and hop onto the stone with its picture.',
          splash:'Splash! The stone tips, and in you go. You climb back out onto the bank. Try again!'}},
        'm': {look:'mushrooms', walk:true, landmark:true, word:'蘑菇', note:'Red mushrooms with white spots, under the pines. Pretty, but not for eating!'},
        'L': {look:'slabs', walk:true},                       // the lookout's stone platform
        // thick bushes at the east end of the second terrace, till the garden begins: the way east to the melon field
        'q': {look:'bush', landmark:true, becomes:[{if:{garden:{atLeast:1}}, to:'.'}], onLook:[{do:[{message:'Thick bushes. The troop will clear a way through here when it’s needed.'}]}]},
        // fresh, juicy grass by the brook: leading the cow home, it's hungry, and you pick it three handfuls here
        'c': {look:'tallGrass', walk:true, word:'草', note:'Fresh, juicy grass by the brook.', onLook:[{if:{cowFood:'asked', holding:{cowFood:false}}, label:'Pick', sparkle:true,
          do:[{collect:'草', for:'cowFood', count:3, each:'You pick a handful of fresh {草}.', full:'You have three handfuls of fresh {草}. Take them to the {牛}!'}]}]},
        // its railing, at the top of the cliff: A shows you the view, and the first time, the lost cow, far below
        'R': {look:'railing', landmark:true, onLook:[
          {if:{cow:{atLeast:1, below:3}, cowSeen:0}, label:'Look', sparkle:true, do:[{scene:'cowView'}, {set:{cowSeen:1}}, {sound:'mooFar'},
            {message:'There’s the cow, far below, by a spring beyond the dark pines! Go on down the slope to find it.'}]},
          {if:{cow:{below:4}}, label:'Look', do:[{scene:'cowView'}]},
          {label:'Look', do:[{scene:'southView'}]}]}
      },
      map: [
        "YYYYYYYYYYYY..YYYYYYYYYYYY",   // up to the home ground, over the bridge
        "YYggwwgGGGGG..gggggwwgggYY",
        "YYgggQgGGGGg..gggogggTggYY",
        "YYgTgggg......ggggggggggYY",   // a wild apple tree (Q); the way winds west to the steps
        "YYggggggnnnnnnnnnnnnngggYY",   // long grass across the path (28 October 2026: snakes and spiders on the way)
        "YYggggggnnnnnnnnnnnnngogYY",
        "YYg.....nnnnnnnnnnnnngggYY",
        "YYT......ggg..ggggggggTgYY",
        "YYg..goggggg..gGGGGGGgggYY",
        "MMM==MMMMMMvvvvvMMMMMMMMMM",   // a cliff: stone steps (left), the long way, and a bank to hop down (middle), the quick way
        "MMM==MMMMMMvvvvvMMMMMMMMMM",
        "YYg..gggggggnnnnnngoggTgYY",
        "YYg..gggggggnnnnnnggggggYY",
        "YYg....................qqq",   // along the terrace, past the lookout (east, through the bushes: the melon field)
        "YYg....................qqq",
        "YYggLLLLLLokggguggkgg..gYY",   // the lookout: a stone platform at the top of the cliff (L), its railing (R)
        "YYogLLLLLLggggTgggggg..oYY",
        "YYggRRRRRRguggggggkgg..gYY",
        "MMMMMMMMMMMMvvvvvMMMM==MMM",   // steps (right), a bank (middle)
        "MMMMMMMMMMMMvvvvvMMMM==MMM",
        "YYggggggoGGGgggggTnnn..gYY",
        "YYggPggGGGGGg.....nnn..gYY",   // a peach tree in the corner; long grass between the steps and the brook
        "YYgggggggWWgg.....nnn.ogYY",
        "YYWWWWWWWWWWzzzWWWWWWWWWYY",   // the brook, and its stepping stones, a row of three, and another
        "YYWWWWWWWWWWzzzWWWWWWWWWYY",
        "YYggnnnnnngcg..WgggoggggYY",   // fresh grass by the brook (c), for the hungry cow
        "YYggnnnnnnnnnnngnnnnnnggYY",
        "YYg....nnnnnnnngnnnnnnggYY",   // west to the steps, through long grass
        "YYg...TnnnnnnnngnnnnnnggYY",
        "MMM==MMMMMMMMvvvvvvMMMMMMM",   // steps (left), a bank (middle)
        "MMM==MMMMMMMMvvvvvvMMMMMMM",
        "YYgiigpppggpgggggggggggpYY",   // the pines begin
        "YYgiigpgpgpppgggggggpgpgYY",
        "YYpiiiiiiiiiiippppgpggppYY",
        "YYpiiiiiimiiiigpppgpppppYY",
        "YYppppppppppiippppppppppYY",
        "YYppppppppppiipmppppppppYY",
        "YYppppppppppiippppppppppYY",
        "YYppppppppppiippppppppppYY",
        "YYppppppppppiippppppppppYY"    // down into the pines, to the pasture
      ]
    },
    // Chapter 1: the cliffs (山崖 shānyá, a name for the native speaker), west off the hillside's second terrace, through bushes
    // the troop clears once the garden begins. Ledge below ledge: wild grapes hang down the cliff below the top, over the
    // middle ledge, out of reach from above. Two banks to hop down (banks can't be climbed): the one by the grapes lands you
    // under them, to pick them (teaching 葡萄) for the big monkey's garden; the other, on a ledge with shells under a boulder;
    // and from either, hop on down to the bottom and walk back up the stone steps. A goat at the top, and an apple tree.
    cliffs: {
      name: {zh:'山崖', py:'shānyá', en:'The cliffs'},
      sounds: [{rows:[0, 10], sounds:['wind', 'wind', 'birds']}, {rows:[11, 27], sounds:['birds', 'wind']}],
      exits: [
        {at:[25, 5], to:'hillside', arrive:[1, 26], facing:'right'}, {at:[25, 6], to:'hillside', arrive:[1, 27], facing:'right'}   // back east to the hillside
      ],
      legend: {
        'n': {look:'longGrass', walk:true, wild:['snake', 'spider']},   // long grass: snakes and spiders
        // the wild grapes, a vine hanging down the cliff: from the top, out of reach (V); from the ledge below, picked (U)
        'V': {look:'grapeCliff', word:'葡萄', onLook:[
          {if:{grapeSeeds:'asked', holding:{grapeSeeds:false}}, label:'Look', do:[{message:'Grapes! They hang down the cliff below you, out of reach. Find a way down to them.'}]},
          {label:'Look', do:[{message:'Wild {葡萄|grapes} hang down the cliff below you.'}]}]},
        'U': {look:'grapeCliff', word:'葡萄', onLook:[
          {if:{grapeSeeds:'asked', holding:{grapeSeeds:false}}, label:'Pick', sparkle:true, do:[{newWord:'葡萄', note:'Wild grapes, purple and sweet, hanging down the cliff.'}, {hold:'种子', for:'grapeSeeds'},
            {message:'You pick a bunch of {葡萄} and eat some: sweet! You keep their little {种子} for the big monkey’s garden.'}]},
          {label:'Look', do:[{message:'Wild {葡萄}, hanging down the cliff.'}]}]}
      },
      map: [
        "^^^^^^^^^^^^^^^^^^^^^^^^^^",
        "^^^^^^^^^^^^^^^^^^^^^^^^^^",
        "MMMMMMMMMMMMMMMMMMMMMMMMMM",
        "MMMMMMMMMMMMMMMMMMMMMMMMMM",
        "YggggggggggggggggggggggggY",
        "YggTggggEgggggg...........",   // in from the hillside
        "YggggEggggTgggQ.g.........",   // an apple tree (Q)
        "YgggggTggJggEggggggggg..gY",
        "Yggggggggggggggggggggg..gY",
        "MMMvvvMMMMMvvMVVVMMMMM==MM",   // a cliff: two banks to hop down, the grape vine (V, its foot U), and stone steps
        "MMMvvvMMMMMvvMUUUMMMMM==MM",
        "Yggggggg^^^gggggg^^^gg..gY",   // three ledges, between rocks: the left one, the grapes’ one, and the steps’ one
        "Yggggggg^^^ggggJg^^^gg..gY",
        "YgogggJg^^^gggEgg^^^gT..gY",   // shells under the boulder
        "YgggEggg^^^gggggg^^^Eg..gY",
        "Yggggggg^^^gggggg^^^gg..gY",
        "Yggggggg^^^gggggg^^^gg..gY",
        "MMMMvvvMMMMMvvMMMMMMMM==MM",   // a cliff: a bank from each of the first two ledges, and stone steps
        "MMMMvvvMMMMMvvMMMMMMMM==MM",
        "Yggggggggggggggggggggg..gY",
        "Yggggggggggggggggggggg..gY",
        "Ygg.....................gY",   // along the bottom, back to the steps
        "Ygg.....................gY",
        "YgTgggggggggggggggnnnnnggY",   // tall grass and long grass
        "YggGGGGgTggEggggggnnnnnggY",
        "YggGGGGgggggEgggTgnnnnnggY",
        "YggggggggggggggggggggggggY",
        "YYYYYYYYYYYYYYYYYYYYYYYYYY"
      ]
    },
    // Chapter 1: the hot spring valley (温泉谷 wēnquán gǔ, a name for the native speaker), up the brook from the riverside,
    // through bushes the troop clears once the garden begins: a warm, sheltered valley of steaming blue-green pools (too hot
    // to touch), ferns, and two monkeys of the troop bathing in a warm one, as monkeys do in hot springs. Wild bananas grow in
    // the warm corner at the top, past a narrow way between two big pools where steam puffs out of the ground now and then:
    // wait for it to stop, then go (the vents: puffing, js/world.js). A at one picks a banana (teaching 香蕉): its seeds are
    // for the big monkey's garden.
    hotSprings: {
      name: {zh:'温泉谷', py:'wēnquán gǔ', en:'The hot spring valley'},
      sounds: ['birds', 'birds', 'wind'],
      exits: [
        {at:[13, 23], to:'riverside', arrive:[25, 1], facing:'down'}, {at:[14, 23], to:'riverside', arrive:[26, 1], facing:'down'}   // back down to the riverside
      ],
      legend: {
        'H': {look:'hotPool', landmark:true, onLook:[{do:[{message:'A hot spring, steaming. Too hot to touch!'}]}]},
        'h': {look:'hotPool', landmark:true, onLook:[{do:[{message:'A warm pool, just right for a bath. The monkeys love it!'}]}]},
        'f': {look:'fern', walk:true},
        // steam vents on the narrow way: each row puffs in turn (every 3 seconds, for a second and a bit)
        's': {look:'vent', walk:true, vent:{every:3000, puff:1300, at:0, hot:'Too hot! Wait for the steam to stop.', pushed:'Too hot! The steam pushes you back.'}},
        'z': {look:'vent', walk:true, vent:{every:3000, puff:1300, at:1500, hot:'Too hot! Wait for the steam to stop.', pushed:'Too hot! The steam pushes you back.'}},
        // wild banana plants: A takes a banana's seeds for the garden
        'B': {look:'bananaPlant', word:'香蕉', onLook:[
          {if:{bananaSeeds:'asked', holding:{bananaSeeds:false}}, label:'Pick', sparkle:true, do:[{newWord:'香蕉', note:'Wild bananas, growing in the warm valley.'}, {hold:'种子', for:'bananaSeeds'},
            {message:'You climb up and pick a {香蕉}. Wild ones are full of hard black {种子|seeds}: you eat round them, and keep them for the big monkey’s garden.'}]},
          {label:'Look', do:[{message:'Wild {香蕉}, in a bunch under the big leaves.'}]}]}
      },
      map: [
        "^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
        "MMMMMMMMMMMMMMMMMMMMMMMMMMMM",
        "MMMMMMMMMMMMMMMMMMMMMMMMMMMM",
        "^^gBBggggBBgggggfggggBBggg^^",   // wild banana plants (B, each two squares by two) in the warm corner at the top
        "^^gBBgg..BB..........BBggg^^",
        "^^ggggg..............ggggf^^",
        "^^gggBBgggggg..gBBgggggBBg^^",
        "^^fggBBggggfg..gBBgggggBBg^^",
        "^^gfggggggggg..gggggggggfg^^",
        "^^HHHHHHHHHHHssHHHHHHHHHHH^^",   // the narrow way between the hot pools (H), steam puffing out of it (s, then z)
        "^^HHHHHHHHHHH..HHHHHHHHHHH^^",
        "^^HHHHHHHHHHHzzHHHHHHHHHHH^^",
        "^^ggggggggggg..WWggggggggg^^",   // the warm brook, out of the pool
        "^^gfggogggfgg..WWgggggoggg^^",
        "^^ggggggggggg..WWgggggggfg^^",
        "^^gghhhhhgggg..WWggggggggg^^",   // a warm pool (h), where two monkeys of the troop bathe
        "^^gghhhhhgggg..WWgggHHHHgg^^",
        "^^gghhhhhgggg..WWgggHHHHgg^^",
        "^^ggggggggggg..WWgggHHHHgg^^",
        "^^ggggggEgogg..WWggggggggg^^",
        "MMgEgfggggggg..WWgggfgggggMM",
        "MMgggggggfggg..WWgggggggEgMM",
        "YYYYYYYYYYYYY..WWYYYYYYYYYYY",   // in from the riverside, beside the brook
        "YYYYYYYYYYYYY..WWYYYYYYYYYYY"
      ]
    },
    // Chapter 1: the dark pines (黑松林 hēi sōnglín, a name for the native speaker to check; there's a 黑松林 in the book, chapter
    // 80), between the south slope and the pasture, where the cow is lost: the pasture's pines till 27 October 2026, made a
    // place of their own, bigger and gloomy, as the pine wood is (after playing it: the way to the cow was short, easy and
    // boring). The way forks; the cow's hoofprints show which way it went, and its moo is louder that way; down a narrow
    // gully a great hollow pine lies along it, to crawl through (drawn over you: you vanish inside it); the hoofprints go into
    // a stream too deep for a little monkey, where a dead pine on the bank, knocked down with your stick, falls across, a
    // bridge; over it, a rabbit saw the cow go by; then south, through long grass (wolves), out to the pasture. The ways the
    // cow didn't go end at boulders, with shells under them.
    // Chapter 1: the melon field (瓜田 guātián, a draft for the native speaker), east off the south slope's second terrace
    // (planned 27 October 2026, the garden's first place): a sunny field on the mountainside, rock above it, wild watermelons
    // sprawling across it in patches, and birds pecking at them (characters: shoo them away, each saying its colour, 红色的鸟,
    // as it flies off); then take a melon's seeds for the big monkey's garden (teaching 西瓜). Tall grass where your friends
    // hide, flowers, and shells under a boulder.
    melonField: {
      name: {zh:'瓜田', py:'guātián', en:'The melon field'},
      sounds: ['birds', 'birds', 'wind'],
      exits: [
        {at:[0, 9], to:'southSlope', arrive:[24, 13], facing:'left'}, {at:[0, 10], to:'southSlope', arrive:[24, 14], facing:'left'}   // back west to the south slope
      ],
      legend: {
        'l': {look:'melonVines', walk:true},   // wild watermelons' vines, sprawling over the ground
        // the melons on them: birds peck at them till you shoo them all away; then A takes one's seeds for the garden
        'x': {look:'melon', word:'西瓜', onLook:[
          {if:{melonSeeds:'asked', holding:{melonSeeds:false}, birdsShooed:{below:5}}, label:'Look', do:[{message:'Birds keep pecking at the melons! Shoo them all away first.'}]},
          {if:{melonSeeds:'asked', holding:{melonSeeds:false}}, label:'Pick', sparkle:true, do:[{newWord:'西瓜', note:'A wild watermelon, big and striped, warm from the sun.'}, {hold:'种子', for:'melonSeeds'},
            {message:'You crack open a {西瓜} and eat some: sweet and juicy! You keep its black {种子} for the big monkey’s garden.'}]},
          {label:'Look', do:[{message:'Wild {西瓜}, ripening in the sun.'}]}]}
      },
      map: [
        "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
        "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
        "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
        "YggggggggggglllllggggglllllggY",
        "YgEgEgggggglllxlllggglllllllgY",
        "YggEgJgggggglllllgggglllxlllgY",
        "YJggggggg..............llllTgY",
        "YgTgggggg..............llllggY",
        "Ygggggggg..gggggg..gglllgggggY",
        "...........glllll..glllllggogY",   // in from the south slope
        "...........lllllx..lllllllgggY",
        "Yggoggggg..llxlll..llxllllgggY",
        "Ygggggggg..llllll..lllllllgTgY",
        "YGGGGgggg..glllll..glllxlggggY",
        "YGGGGgggg..lllggg..gglllgggggY",
        "YGGGGgggggllxllgg..glllllgggEY",
        "YGGGGFggggglllggggglllxlllgEgY",
        "YgggFggggggggggggggglllllggggY",
        "YYYYYYYYYYYYYYYYYYYYYYYYYYYYYY",
        "YYYYYYYYYYYYYYYYYYYYYYYYYYYYYY"
      ]
    },
    darkPines: {
      name: {zh:'黑松林', py:'hēi sōnglín', en:'The dark pines'},
      gloom: {deep:.62, open:.2, mist:true, eyes:true},
      music: 'pineWood',   // the pine wood's song: the same gloomy pines (decided 28 October 2026: it had the home ground's)
      // till you find the cow, it moos now and then, louder the right way and faint up the ways that go nowhere
      sounds: [{rows:[3, 10], cols:[0, 12], if:{cow:{below:3}}, sounds:['crow', 'wind', 'mooFar']}, {rows:[20, 26], cols:[0, 9], if:{cow:{below:3}}, sounds:['crow', 'mooFar']},
        {rows:[20, 29], cols:[29, 35], if:{cow:{below:3}}, sounds:['crow', 'mooFar']}, {rows:[0, 29], if:{cow:{below:3}}, sounds:['crow', 'wind', 'moo']},
        {rows:[0, 29], sounds:['crow', 'crow', 'wind']}],
      battleMusic: 'pineBattle', backdrop: 'pines',
      exits: [
        {at:[16, 0], to:'southSlope', arrive:[12, 38], facing:'up'}, {at:[17, 0], to:'southSlope', arrive:[13, 38], facing:'up'},   // back up the south slope
        {at:[16, 29], to:'pasture', arrive:[16, 1], facing:'down'}, {at:[17, 29], to:'pasture', arrive:[17, 1], facing:'down'}   // out to the pasture
      ],
      legend: {
        'n': {look:'longGrass', walk:true, wild:['wolf', 'wolf', 'snake', 'spider']},   // long grass under the pines: wolves too, as in the pine wood
        'm': {look:'mushrooms', walk:true, landmark:true, word:'蘑菇', note:'Red mushrooms with white spots, under the pines. Pretty, but not for eating!'},
        // the cow's hoofprints in the needles, the right way (the way forks, and the other ways go nowhere)
        'h': {look:'hoofprints', walk:true, landmark:true, onLook:[{do:[{message:'Hoofprints in the soft earth, two marks to each: the cow came this way!'}]}]},
        // a great pine, fallen along the gully, hollow inside: you crawl through it (it's drawn over you)
        'O': {look:'hollowLog', walk:true, landmark:true, onLook:[{do:[{message:'A great hollow pine, fallen along the gully. The cow stepped over it, but a little monkey can crawl right through!'}]}]},
        // a stream across the pines, too deep for a little monkey (the cow waded it), and where its hoofprints go in: water,
        // till you knock the dead pine on its bank down with your stick, and it falls across (pastureLog), a bridge (in a game
        // that found the cow before 27 October 2026, it's down already)
        'c': {look:'water', word:'水'},
        '4': {look:'water', word:'水', becomes:[{if:{pastureLog:1}, to:'5'}, {if:{cow:{atLeast:3}}, to:'5'}],
          onLook:[{do:[{message:'The stream is deep and fast. The cow’s hoofprints go right into it: a big cow can wade across, but not a little monkey!'}]}]},
        '5': {look:'logBridge', walk:true, word:'桥'},   // the dead pine, fallen across it
        '&': {look:'deadPine'},   // an old dead pine just west of the way in, where an owl (猫头鹰) perches (the area's animals)
        'q': {look:'deadPine', landmark:true, becomes:[{if:{pastureLog:1}, to:'j'}, {if:{cow:{atLeast:3}}, to:'j'}],
          onLook:[{label:'Hit', sparkle:true, do:[{hit:'wood'}, {set:{pastureLog:1}}, {sound:'rumble'}, {sound:'splash'},
            {message:'Crack! The dead pine topples over, right across the stream: a bridge! Over you go.'}]}]}
      },
      map: [
        "ppppppppppppppppiipppppppppppppppppp",   // in from the south slope
        "ppppppppppppppppiipppppppppppppppppp",
        "ppppppppppp&ppppiipppppppppppppppppp",
        "ppppiiiiiiiiiiiiiiiiiiiiiiiiiipppppp",   // the first fork (a row taller: a pine’s top hides the square above it): west, a hollow that goes nowhere (shells under its boulder); east, hoofprints
        "ppppiiiiiiiiiiiiiiiiiiiiihiiiipppppp",
        "ppppiiiiiiiiiiiiiiiiihiiiiiiiipppppp",
        "ppppiiipppppppppppppppppppppiipppppp",   // down a narrow gully...
        "ppppiiipppppppppppppppppppppiipppppp",
        "pppiiiiimpppppppppppppppppppOOpppppp",   // ...where a great hollow pine lies along it (O): crawl through
        "pppiimiiipppppppppppppppppppOOpppppp",
        "pppoppppppppppppppppppppppppOOpppppp",
        "ppppppppppppppppppppppppppppOOpppppp",
        "ppppppppppppppppppppppppppppiipppppp",
        "ppppppppppppppppppppppppppppiipppppp",
        "ppppppppppppppppppppppppppppihpppppp",
        "pppppppppppppppppppppiiiiimiiipppppp",   // west along the stream’s bank, to a dead pine (q): knock it down, and it falls across
        "pppppppppppppppppppppihiiiiiiipppppp",
        "pppppppppppppppppppppiiiqppppppppppp",
        "ccccccccccccccccccccccc4cccccccccccc",   // the stream, too deep to wade, where the hoofprints go in (4)
        "ccccccccccccccccccccccc4cccccccccccc",
        "ppppppiiiiiiiiiiiiiiiiihiiiiiiiipppp",   // over it, the way forks three ways (the rabbit, in its nook below, saw the cow go by)
        "ppGGGGGGiiiiiiiiiiiiiiiiiiiiiiiipppp",   // west: a clearing of tall grass, where your friends hide
        "ppGGGGGGiiiimiiiiiiiiiiiiiiiiiiipppp",
        "ppGGGGGGppppppppihppipppppppppiipppp",
        "ppGGGGGGppppppppnnppipppppppppnnpppp",   // south, the cow’s way, long grass grown over it (wolves); east, long grass to nowhere (shells); the rabbit’s nook goes in a square further, so no pine’s top hides it (decided 28 October 2026)
        "ppGGGGGGppppppppnnppppppppppppnnpppp",
        "ppppppppppppppppnnppppppppppppiipppp",
        "ppppppppppppppppiippppppppppppoopppp",
        "ppppppppppppppppiipppppppppppppppppp",
        "ppppppppppppppppiipppppppppppppppppp"    // out to the pasture
      ]
    },
    // Chapter 1: the pasture (牧场 mùchǎng, a draft for the native speaker), where the cow is lost: south from the home ground,
    // over the bridge at the bottom of its path, once the troop has cleared the bushes there (built 26 October 2026, the cow's
    // version 1, from a mock-up). About 45 steps from the way in to the cow, in two parts that look different: first a way
    // winding down through dark pines, two squares wide, where long grass has grown over it three times (you can't go round:
    // wolves come down from the pines, as in the pine wood), with a clearing off to one side, tall grass where your friends
    // hide; then out through a gap between two big rocks into an open, sunny pasture, with flowers, big trees, boulders, and
    // a spring with a little stream out of it, where the cow drinks. No gloom: the pines' part has the crows and wind of the
    // pines, the pasture birdsong; battles are among the pines, as in the pine wood (all the long grass is under them).
    pasture: {
      name: {zh:'牧场', py:'mùchǎng', en:'The pasture'},
      // the edge of the pines: till you find the cow, it moos now and then, close now; then birds in the pasture
      sounds: [{rows:[0, 12], if:{cow:{below:3}}, sounds:['crow', 'wind', 'moo']}, {rows:[0, 12], sounds:['crow', 'crow', 'wind']}, {rows:[13, 25], sounds:['birds']}],
      battleMusic: 'pineBattle', backdrop: 'pines',
      exits: [
        {at:[16, 0], to:'darkPines', arrive:[16, 28], facing:'up'}, {at:[17, 0], to:'darkPines', arrive:[17, 28], facing:'up'}   // back into the dark pines
      ],
      legend: {
        'n': {look:'longGrass', walk:true, wild:['wolf', 'wolf', 'snake', 'spider']},   // long grass under the pines: wolves too, as in the pine wood
        'm': {look:'mushrooms', walk:true, landmark:true, word:'蘑菇', note:'Red mushrooms with white spots, under the pines. Pretty, but not for eating!'},   // mushrooms under the pines: A teaches 蘑菇 (decided 28 October 2026: they were just to look at)
        // the cow's hoofprints in the needles
        'h': {look:'hoofprints', walk:true, landmark:true, onLook:[{do:[{message:'Hoofprints in the soft earth, two marks to each: the cow came this way!'}]}]},
        // flowers in the pasture, each square all one colour (F red, E yellow and J white, as in the meadow, and these): A shows
        // its colour, such as 粉色的花 (a pink flower), once you know it
        'k': {look:'pinkFlowers', walk:true, word:'花', learnOnStep:true, colour:'粉色'},
        'u': {look:'blueFlowers', walk:true, word:'花', learnOnStep:true, colour:'蓝色'},
        'O': {look:'water', word:'水', note:'A spring of clear, fresh water, bubbling up out of the ground.'}   // the cow's spring (just water: no fish in it)
      },
      map: [
        "ppppppppppppppppiippppppp^^^^^^^^^^^",   // in from the dark pines
        "ppppppppppppppppiippppppp^^^^^^^^^^^",
        "pppppppppppppppmiippppppp^^^^^^^^^^^",
        "ppppppppppppppppiiiiiipppMMMMMMMMMMM",   // the edge of the pines: a short way down to the big rocks
        "ppppppppppppppppiiiihipppMMMMMMMMMMM",
        "ppppppppppppppppiiiiiipppppppppppppp",
        "ppppppppppppppppppppiipppppppppppppp",
        "ppppppppppppppppppppnnpppppppppppppp",   // long grass grown over it (wolves)
        "ppppppppppppppppppppnnpppppppppppppp",
        "ppppppppppppppppppppihmppppppppppppp",
        "ppppppppppppppppppppiipppppppppppppp",
        "pppppppppppppppppppphipppTTpggggggYY",   // down to the gap between two big rocks
        "ppppppppppgggppgppppnnpggTTpggggggYY",   // long grass in the gap, where wolves come down from the pines
        "YYpppppppgggggggppgonnogggggggogggYY",   // out into the pasture: sunny, open grass, with flowers, big trees and boulders
        "YYppppgppggggggggggoiioggggJJgggggYY",
        "YYpGGGGkkJggTTgggggg..gggJuJJJggogYY",   // a trail the cow has worn from the rocks to its spring
        "YYgGGGkJJkJgTTggggggg....guJJgggggYY",
        "YYgggggkJJgggggggggggggg...OOOOgggYY",
        "YYggoggggggggggggggggggggg.OOOOgggYY",   // the spring, where the cow drinks, and a little stream out of it
        "YYggggTTgggggJJJgggggggggggOOOOOOOYY",
        "YYgggkTTggggJJJJJgggggggggggggggggYY",
        "YYggJJkggggggJJJggggggJJJJJgggggggYY",
        "YYgggggggggggggggoggggJJJugggggoggYY",
        "YYgggggYggggYYgggYYgYgggYYgYggYggYYY",
        "YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY",
        "YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY"
      ]
    },
    // Chapter 1: the pine wood, up the hillside from the home ground (the big monkey clears the way when he wants wood): thick, gloomy
    // pines, and wolves in the long grass. In at the bottom, to the squirrel's clearing, where the ways part: west to a
    // hollow, east to a pool, north through a meadow of long grass to the only bridge over the stream; over it, west along
    // the stream and up into the oldest pines, or north-east up to a cracked rock, the only way into a sunny glade, where
    // the deer lives. Three dry, dead pines and three small stones, one here and one there: you need every one, and every
    // way to them goes through long grass, so you meet what lives in it (laid out again on 21 October 2026, after playing
    // the first wood on a phone: you could walk in, pick everything up and never meet a thing).
    pineWood: {
      name: {zh:'松林', py:'sōnglín', en:'Pine wood'},
      music: 'pineWood',   // slow, quiet and gloomy
      battleMusic: 'pineBattle', backdrop: 'pines',   // a battle here: in the wood's minor key, among the pines
      gloom: {deep:.7, open:.24, mist:true, eyes:true},
      sounds: ['crow', 'crow', 'wind', 'howl'],
      exits: [
        {at:[16, 29], to:'hillside', arrive:[12, 1], facing:'down'},   // back down the hillside to the home ground
        {at:[17, 29], to:'hillside', arrive:[13, 1], facing:'down'}
      ],
      legend: {
        'n': {look:'longGrass', walk:true, wild:['wolf', 'wolf', 'snake', 'spider']},   // long grass: here, wolves too
        'k': {look:'bridgeAcross', walk:true, word:'桥', learnOnStep:true, stepNote:'A wooden bridge over the stream.'},   // the only way over the stream (chapter 1's bridges teach 桥)
        'ĝ': {look:'woodGrass', walk:true, word:'草', animals:true}   // tall grass on the wood's floor, in the clearings by the stumps (friends hide in it, 30 October 2026)
      },
      map: [
        "pppppppppppppppppppppppppppppppppp",
        "pppiiippppppppppppppppppppGGGgpppp",
        "ppqiĝĝĝppppppppppppppppppgGGGggqpp",
        "ppiiĝĝĝpppppppppppppppppggJgggggpp",
        "ppiipiippppppppppppppppogggggGGGgp",
        "ppiiiiippppppppppppppiixggggGGGGgp",
        "pppppiippppppppppppppniopggJggmgpp",
        "pppppnnppppppppppnnnnnippppggggppp",
        "pppppnnppppppppppnnnnnippppppppppp",
        "ppiiiiippppppiiiiiippppppppppppppp",
        "piiiiiippppppiiiiipppppppppppppppp",
        "ppiiiiiiinnnniiiiiippppppppppppppp",
        "pppmppiiinnnniiiippppppppppppppppp",
        "WWWWWWWWWWWWWWWkkWWWWWWWWWOOOOOppp",
        "pppppppppppppppiippppppppOOOOOOOpp",
        "pppppppppppppiiiiiippppppOOOOOOOpp",
        "ppppppppppppnnnnnnnpppppppOOOOOOpp",
        "ppppiipppppnnnnnnnnnpppppppOOOOppp",
        "ppqiiiipppppnnnnnnnppppppoiiimpppp",
        "piiiiipppppppppnnnpppppiiiiiiipppp",
        "piĝĝĝiiiinnpppiiiiippppiiiiiippppp",
        "ppiĝĝĝiiinnpoipiiiippppnippppppppp",
        "ppppiipppnnpniiiiiiipppnippppppppp",
        "pppppppppnnnniiiiiiinnnnippppppppp",
        "pppppppppnnnniiiippinnnnippppppppp",
        "pppppppppppppppiiipppppppppppppppp",
        "pppppppppppppppiiipppppppppppppppp",
        "ppppppppppppppppiipppppppppppppppp",
        "ppppppppppppppppiipppppppppppppppp",
        "ppppppppppppppppiipppppppppppppppp"
      ]
    },
    // Chapter 1: inside the school, once the troop has built it: a classroom. The old monkey teaches at the front, by the
    // blackboard; the little monkey and the rest of the troop sit at their double desks. Its own legend: letters that only
    // mean this here.
    school: {
      name: {zh:'学校', py:'xuéxiào', en:'School'},
      exits: [
        {at:[7, 9], to:'homeGround', arrive:[11, 5], facing:'down'}   // back out through the door
      ],
      legend: {
        '#': {look:'classWall'},
        // chapter 1: your certificate, on the wall beside the window, once you've passed the exam (no writing on it)
        'Ц': {look:'wallFace', becomes:[{if:{exam:{atLeast:1}}, to:'Ч'}]},
        'Ч': {look:'certificate', landmark:true, label:'Look', onLook:[{do:[{message:'Your certificate, on the classroom wall: you passed the exam!'}]}]},
        '=': {look:'wallFace'},
        '+': {look:'classWindow'},
        'b': {look:'blackboard', landmark:true, onLook:[{do:[{message:'The blackboard: the teacher has written the numbers on it, {一} to {十}.'}]}]},   // (the numbers in chalk: js/art.js)
        't': {look:'teacherTable', word:'桌子', landmark:true, note:'The teacher’s table, with books and a cup on it.'},
        'd': {look:'desk', word:'桌子', note:'A desk for two, with books on it.'},
        '_': {look:'classFloor', walk:true},
        'm': {look:'doorMat', walk:true},
        // the timetable (课程表), where the right-hand window was (decided 28 October 2026): a chart, a row a subject, a star for
        // each lesson done (js/art.js); A at it opens the timetable, as the teacher does, to choose a lesson
        'k': {look:'timetable', landmark:true, onLook:[{if:{school:{atLeast:2}}, label:'Look', do:[{lesson:true, by:'elder'}]},
          {do:[{message:'The timetable, for lessons. Say hello to the {老师} first!'}]}]}
      },
      map: [
        "#=+=bbbbbbbkkk#",
        "#=+Цbbbbbbbkkk#",
        "#________tt___#",
        "#_____________#",
        "#_dd__dd__dd__#",
        "#_____________#",
        "#_dd__dd__dd__#",
        "#_____________#",
        "#_____________#",
        "#######m#######"
      ]
    },
    // the sports ground (操场, decided 28 October 2026), for PE: through a gap in the trees at the home ground's back left,
    // under the cliff, a yard exactly one screen big, so you see the whole race. A sandy track with three lanes, numbered
    // 一 二 三 at the start, and a red ribbon at the finish (raked sand: the book's troop runs about in the sand hollows); a
    // big war drum the teacher beats to start a race; red army banners (in chapter 3 of the book, Sun Wukong drills the
    // troop like an army); a rack of practice staffs and a spear; stone padlocks to lift; and plum-blossom poles for kung
    // fu footwork, a little monkey balancing on the tallest. A at each says what it is.
    sportsGround: {
      name: {zh:'操场', py:'cāochǎng', en:'Sports ground'},
      exits: [
        {at:[14, 2], to:'homeGround', arrive:[1, 2], facing:'right'}   // back through the gap in the trees
      ],
      legend: {
        '_': {look:'sandTrack', walk:true},
        'D': {look:'bigDrum', landmark:true, onLook:[{do:[{message:'A big war drum. The {老师} beats it to start a race.'}]}]},
        'f': {look:'banner', onLook:[{do:[{message:'A red banner, like an army’s, flying over the sports ground.'}]}]},
        'p': {look:'plumPoles', landmark:true, onLook:[{do:[{message:'Plum-blossom poles, for kung fu: you step from one to another. A little monkey is balancing on the tallest.'}]}]},
        'S': {look:'stoneLock', onLook:[{do:[{message:'A stone padlock, lifted to make you strong.'}]}]},
        'W': {look:'weaponRack', landmark:true, onLook:[{do:[{message:'A rack of wooden staffs for practice, one banded with gold, and a spear with a red tassel.'}]}]}
      },
      map: [
        "MMMMMMMMMMMMMMM",
        "MMMMMMMMMMMMMMM",
        "Yggfgggfgggfgg8",
        "YD___________gY",
        "Yg___________gY",
        "Yg___________gY",
        "YgggggggggggppY",
        "YgSSgWWgggggppY",
        "YgggggggggggggY",
        "YYYYYYYYYYYYYYY"
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
  //   becomes        what it turns into once the story says: [{if, to}], to being another letter of the legend (the first
  //                  whose if matches), such as the rocks once they've rolled away
  //   ledge          true for a bank (a ledge): you can hop down it from above (landing just below it, however high it
  //                  is), never climb it
  //   wild           the enemies that jump out to fight as you walk through it (see enemies)
  //   onLook         steps for pressing A at it, as in talk below: the first part whose if matches runs,
  //                  instead of its action or card (when none matches, it's looked at as usual); a part's
  //                  label is what the A button says while it matches
  //   pick           a fruit tree you can pick from for your bag (item, one of the food below) once its if matches:
  //                  one fruit each time you come to the place, up to as many as you can carry
  legend: {
    'g': {look:'grass', walk:true},
    'G': {look:'tallGrass', walk:true, word:'草', learnOnStep:true, stepNote:'Tall grass. Animals hide in here.', animals:true},
    // flowers: red, yellow and white, all over the meadow and the home ground, and on the slopes of flowers on the hillside and
    // the riverside. In chapter 1, you pick one of each for the big monkey to plant in front of the school: each shows you
    // what you've picked, such as 红色的花, a red flower, with its picture (picked; decided 22 October 2026: the card just said
    // 花, flower), and message under it. colour: each is all one colour, so A at it, once you know that colour, shows it, such
    // as 红色的花; till then, the 花 card, with that colour's picture (decided 26 October 2026: they all went back to being 花)
    'F': {look:'redFlowers', walk:true, word:'花', learnOnStep:true, colour:'红色', gather:{item:'花', for:'flowers', kind:'红色', count:3, label:'Pick', note:'You pick a flower.',
      picked:{zh:'红色 的 花', en:'A red flower'}, message:'For the big monkey to plant ({flowersPicked}/3). Find the other colours.',
      full:'You have a red, a yellow and a white {花}. Take them to the big monkey.', again:'You have a red {花} already. Find another colour.'}},
    'E': {look:'yellowFlowers', walk:true, word:'花', learnOnStep:true, colour:'黄色', gather:{item:'花', for:'flowers', kind:'黄色', count:3, label:'Pick', note:'You pick a flower.',
      picked:{zh:'黄色 的 花', en:'A yellow flower'}, message:'For the big monkey to plant ({flowersPicked}/3). Find the other colours.',
      full:'You have a red, a yellow and a white {花}. Take them to the big monkey.', again:'You have a yellow {花} already. Find another colour.'}},
    'J': {look:'whiteFlowers', walk:true, word:'花', learnOnStep:true, colour:'白色', gather:{item:'花', for:'flowers', kind:'白色', count:3, label:'Pick', note:'You pick a flower.',
      picked:{zh:'白色 的 花', en:'A white flower'}, message:'For the big monkey to plant ({flowersPicked}/3). Find the other colours.',
      full:'You have a red, a yellow and a white {花}. Take them to the big monkey.', again:'You have a white {花} already. Find another colour.'}},
    '.': {look:'path', walk:true},   // (路 path waits for the mountain path: stepping off the stone was straight into a word)
    'B': {look:'bridge', walk:true},
    'T': {look:'tree', word:'树'},
    'Y': {look:'tree', word:'树'},   // the forest round the edge of the map
    // each fruit tree teaches its own fruit (decided 24 October 2026: they taught 水果, fruit, first, which the hungry monkey
    // teaches now, as he asks for some): looking at it, or as you pick one for him
    'P': {look:'peachTree', word:'桃子', note:'Ripe peaches hang from its branches.', landmark:true, gather:{item:'桃子', for:'hungry', label:'Pick', note:'You pick one from the tree.', message:'You picked a {桃子}. Take it to the hungry monkey.'},
      pick:{item:'桃子', if:{hungry:'done'}}},   // once the hungry monkey has eaten, its fruit is for your bag
    'Q': {look:'appleTree', word:'苹果', note:'Ripe apples hang from its branches.', landmark:true, gather:{item:'苹果', for:'hungry', label:'Pick', note:'You pick one from the tree.', message:'You picked a {苹果}. Take it to the hungry monkey.'},
      pick:{item:'苹果', if:{hungry:'done'}}},
    'S': {look:'stone', word:'石头', note:'You were born from this stone.', landmark:true},
    'N': {look:'sign', landmark:true, action:'sign'},
    'K': {look:'post', landmark:true, label:'Train', action:'training', becomes:[{if:{school:{atLeast:1}}, to:'g'}]},   // the training ground (the troop uses the post to build the school: lessons take its place)
    'H': {look:'stall', becomes:[{if:{shop:{atLeast:1}}, to:'Ħ'}]},   // the shop owner's stall: as wide as its row of H (three squares)
    'Ħ': {look:'stallEmpty', landmark:true, onLook:[{do:[{message:'The {老板}’s old stall, empty now. He has moved his shop up to the troop’s home ground.'}]}]},   // (once he's moved)
    'R': {look:'rocks', word:'石头', landmark:true, message:'Big rocks block the way up. Maybe they will move once the monkeys are happy.', becomes:[{if:{gate:true}, to:'.'}]},
    // the rock all round the mountain: its top, seen from above (^), and at its front a cliff two squares high (M), as
    // between the hillside's terraces; grassy banks as high, that you hop down (v); and stone steps up them (=)
    'M': {look:'cliffFace', word:'山'},
    '^': {look:'heights', word:'山'},
    '=': {look:'steps', walk:true},
    'W': {look:'water', word:'河', fishing:true, gather:{item:'水', for:'thirsty', label:'Collect', note:'You scoop up some water from the river.', message:'You collected some {水}. Take it to the thirsty monkey.'}},
    'O': {look:'water', word:'鱼', fishing:true, newNote:'Little fish dart about in the pond.', gather:{item:'水', for:'thirsty', label:'Collect', note:'You scoop up some water from the pond.', message:'You collected some {水}. Take it to the thirsty monkey.'}},
    'X': {look:'waterfall', word:'瀑布', note:'Water crashes down the 山 (mountain). What could be behind it?', landmark:true, action:'story', onLook:[
      {if:{climb:1}, do:[{card:'瀑布', note:'Water crashes down from high on the 山 (mountain). This is where the river comes from!'}, {set:{climb:2}},
        {message:'You found where the water comes from! Go back down the path and tell the troop.'}]},
      {if:{climb:{below:4}}, do:[{card:'瀑布'}]}   // the story is read here once the troop has come up
    ]},
    // the mountain path
    'r': {look:'path', walk:true, word:'路', learnOnStep:true, stepNote:'A path up the mountain, beside the river.'},
    'n': {look:'longGrass', walk:true, wild:['snake', 'spider']},   // long grass: snakes and spiders jump out to fight
    'w': {look:'bush'},   // bushes along the path
    'o': {look:'boulder', word:'石头'},   // a boulder by the path
    'k': {look:'bridgeAcross', walk:true},   // a bridge over the river in the valley, to walk across it up or down
    'v': {look:'bank', ledge:true},
    // the Water Curtain Cave
    'Z': {look:'caveWall'},
    'z': {look:'caveFloor', walk:true},
    'C': {look:'curtain', walk:true},   // the water curtain: the way back out
    'U': {look:'water'},   // the stream through the cave
    'I': {look:'ironBridge', walk:true},   // (it taught 桥 until 21 October 2026: the word waits for chapter 1, so the cave has three new words)
    'D': {look:'stoneBed', word:'床', landmark:true, note:'Beds of smooth stone, enough for the whole troop.', onLook:[   // once you know 床, A sleeps in it
      {if:{knows:'床', new:'睡觉'}, label:'Sleep', do:[{card:'睡觉', note:'You lie down on the stone bed and go to sleep.'}, {sleep:'You wake up with your health full.'}]},
      {if:{knows:'床'}, label:'Sleep', do:[{sleep:'You wake up with your health full.'}]}]},
    'A': {look:'stoneTable', word:'桌子', landmark:true, note:'A big table of stone.'},
    // the troop's bowls in the cave, stacked up; in chapter 1, the hungry monkey wants six for the feast's tables (bowls): A
    // takes them one at a time, counting
    'V': {look:'bowlStack', word:'碗', landmark:true, note:'Stacks of bowls, ready for the troop.',
      onLook:[{if:{bowls:'asked', holding:{bowls:false}}, label:'Take', sparkle:true, do:[{collect:'碗', for:'bowls', count:6,
        each:'You take a {碗} from the stack.', full:'You have six {碗|bowls}. Take them to the hungry monkey, at the feast’s tables!'}]}]},
    // chapter 1: the way from the waterfall to the home ground, and the home ground's plots, their signs, and the ways out
    // chapter 1: the bushes at the bottom of the meadow, beside the river, till the troop clears the way down to the shore (for
    // the hungry monkey's crab)
    'ч': {look:'bush', landmark:true, becomes:[{if:{any:[{crab:'asked'}, {crab:'done'}]}, to:'.'}], onLook:[{do:[{message:'Thick bushes. The river runs on down past them, towards the sea.'}]}]},
    'f': {look:'bush', becomes:[{if:{home:{atLeast:1}}, to:'.'}]},   // bushes, until the troop clears a way through them
    'u': {look:'bush', landmark:true, onLook:[{do:[{message:'Thick bushes. The troop will clear a way through here when it’s needed.'}]}]},
    's': {look:'grass', walk:true, becomes:[{if:{school:{atLeast:1}}, to:'t'}, {if:{build:{atLeast:2}}, to:'a'}, {if:{build:{atLeast:1}}, to:'6'}]},   // the school's plot: open grass, until the big monkey marks it out
    '6': {look:'plot', walk:true},   // the school's plot, marked out with string and stakes (as you watch: the markOut step)
    'a': {look:'frame', landmark:true, onLook:[{do:[{message:'The frame of the school is up. The troop is busy building.'}]}]},   // (the school going up on it)
    't': {look:'school', word:'学校', landmark:true, note:'The troop’s school: the sign over its door says {学校}. Walk in through its door.'},   // (and then the school itself: its door is a way in)
    // where the other plots will be marked out, each when its story begins, with its sign (2 to 5): open grass till then
    'd': {look:'grass', walk:true},   // the new shop's (the home ground's legend has what it becomes)
    // the hive's, by the flowers (its sign: 3): open grass, until the troop builds the bees a hive there as you watch (the
    // markOut step, then setUp: its stone base, then a log hive at a time, each with its straw cap)
    'h': {look:'grass', walk:true, becomes:[{if:{bees:{atLeast:9}}, to:'$'}, {if:{bees:8}, to:'6'}]},
    // chapter 1: the bees' hive (three log hives with straw caps, on a stone base), where the queen bee and her swarm live:
    // A at it takes honey (蜂蜜, taught as you take it the first time) for the hungry monkey; after that, honey for your bag,
    // once each time you come to the home ground, 2 at most
    '$': {look:'hive', landmark:true, word:'蜂蜜', note:'Bees buzz in and out of the hive, and golden honey drips inside.',
      gather:{item:'蜂蜜', for:'honey', label:'Take', note:'Golden honey from the bees’ hive! 蜂蜜 is 蜜蜂 (bee) the other way round.', message:'You took some {蜂蜜}. Take it to the hungry monkey.'},
      pick:{item:'蜂蜜', if:{bees:{atLeast:11}}, label:'Take', took:'You take some {蜂蜜}', none:'The bees are still making more honey. Come back another time.'}},
    // chapter 1: the cow's pen's sign, put up when its plot is marked out
    '|': {look:'sign', landmark:true, label:'Read', onLook:[{if:{cow:{atLeast:8}}, do:[{message:'The {牛}’s home. Your friend the cow lives here, safe from the wolves.'}]},
      {do:[{message:'The {牛}’s new home, by the road, safe from the wolves.'}]}]},
    ':': {look:'sign', landmark:true, label:'Read', onLook:[{if:{bees:{atLeast:10}}, do:[{message:'The bees’ hive. The queen bee and her swarm live here, and make honey for the troop.'}]},
      {do:[{message:'The troop is building the bees a hive here, by the flowers.'}]}]},
    'e': {look:'grass', walk:true},   // the garden's ("The troop wants to grow things here, in a garden by the stream.")
    '2': {look:'grass', walk:true}, '3': {look:'grass', walk:true, becomes:[{if:{bees:{atLeast:8}}, to:':'}]}, '4': {look:'grass', walk:true}, '5': {look:'grass', walk:true, becomes:[{if:{cow:{atLeast:6}}, to:'|'}]},
    '1': {look:'grass', walk:true, becomes:[{if:{build:{atLeast:1}}, to:'7'}]},   // the school's sign, put up when its plot is marked out
    '8': {look:'grass', walk:true, becomes:[{if:{build:{atLeast:1}}, to:'.'}]},   // the little path up to the school, trodden in then too
    // the beds either side of that path, in front of the school: grass, until the big monkey plants the flowers you've brought
    // him there (as you watch: the plant step)
    '9': {look:'grass', walk:true, becomes:[{if:{schoolFlowers:true}, to:'0'}]},
    '0': {look:'flowerBed', landmark:true, onLook:[{do:[{message:'Red, yellow and white flowers: the ones you picked, planted in front of the {学校}.'}]}]},
    '7': {look:'sign', landmark:true, label:'Read', onLook:[{if:{school:{atLeast:1}}, do:[{message:'The troop’s {学校}, where the little monkeys learn. The {老师} gives lessons inside.'}]},
      {if:{build:{atLeast:2}}, do:[{message:'The troop is building a school here, where the little monkeys can learn.'}]},
      {do:[{message:'The troop wants to build a school here, where the little monkeys can learn.'}]}]},
    'b': {look:'bush', landmark:true, becomes:[{if:{build:{atLeast:1}}, to:'.'}],   // thick bushes, until the big monkey clears the way up to the pine wood
      onLook:[{do:[{message:'Thick bushes. The troop will clear a way through here when it’s needed.'}]}]},
    // chapter 1: the pine wood. Its floor, its pines, and the dry, dead pines: one hit with your stick knocks one down (it
    // becomes a stump), and you take a piece of wood. Small stones by the stream, to pick up. A cracked rock: one hit
    // breaks it (any time, once the way up to the pine wood is open), opening the way into the glade behind it.
    'i': {look:'needles', walk:true},
    'p': {look:'pine', word:'树'},
    'q': {look:'deadPine', landmark:true, onLook:[
      {if:{wood:'asked', holding:{wood:false}}, label:'Hit', sparkle:true, do:[{hit:'wood'}, {change:'j'}, {collect:'木头', for:'wood', count:3,
        note:'Dry wood from a dead pine, for building.', each:'Down comes the dry pine! You take a piece of {木头}.', full:[{if:{stones:'done'}, text:'You have three pieces of {木头}. Take them to the big monkey.'},
          {if:{holding:{stones:true}}, text:'You have three pieces of {木头}, and the small {石头|stones} too. Take them all to the big monkey.'},
          {text:'You have three pieces of {木头}. Now find three small {石头|stones}.'}]}]},   // (decided 26 October 2026: it said to take them back, so you made two trips)
      {do:[{message:'An old pine, long dead and dry.'}]}]},
    'j': {look:'stump'},   // what's left of a dead pine you've knocked down
    'm': {look:'pebble', word:'石头', onLook:[
      {if:{stones:'asked', holding:{stones:false}}, label:'Pick up', sparkle:true, do:[{change:'i'}, {collect:'石头', for:'stones', count:3,
        each:'You pick up a small {石头}.', full:[{if:{wood:'done'}, text:'You have three small {石头|stones}. Take them to the big monkey.'},
          {if:{holding:{wood:true}}, text:'You have three small {石头|stones}, and the {木头} too. Take them all to the big monkey.'},
          {text:'You have three small {石头|stones}. Now find three pieces of {木头}.'}]}]}]},
    'x': {look:'crackedRock', landmark:true, onLook:[
      {if:{build:{atLeast:1}}, label:'Hit', sparkle:true, do:[{hit:'stone'}, {change:'y'}, {message:'Crack! The rock breaks apart, and the way into the glade is open.'}]},
      {do:[{message:'A big rock with a deep crack down it. Behind it, between the pines, the sun shines into a glade.'}]}]},
    'y': {look:'rubble', walk:true},   // what's left of the cracked rock
    'L': {look:'tablet', landmark:true, action:'sign', sign:{name:{zh:'石碑', py:'shíbēi', en:'Stone tablet'}, says:{zh:'水帘洞', en:'Water Curtain Cave'}, hint:'The name of the cave.'}}
  },

  // The voices that say the Chinese (Azure's, made into clips by npm run voices, chosen in the voice tests):
  // words, a word said on its own (a new-word card, tapping a word, a listening question); everyone, the lines;
  // and a character listed here by id, their own lines. style: one of the voice's speaking styles. provider: 'google'
  // for one of Google's voices (made on GitHub, which has the key: .github/workflows/voices.yml), Azure's otherwise.
  voices: {words:{provider:'google', name:'cmn-CN-Standard-A'}, everyone:{name:'zh-CN-YunxiNeural', style:'chat'}, elder:{name:'zh-CN-YunzeNeural'}},

  // Characters standing on the map. A character's name shows Chinese, pinyin and English
  // together, because names aren't vocabulary.
  // palette: a monkey's colours. o outline, f fur, s face and tummy, m mouth, e eyes, w beard.
  // label: what the A button says beside them (Talk if not given).
  // look: 'bird' draws a little bird instead of a monkey. word: it sparkles until you know this word.
  // beard: draws a white beard. moves: where they go as the story goes on: the first whose if matches
  // (with x, y, facing, and place if it's another place), instead of where they start. Someone following you
  // (the follow step) is wherever you've been instead, until they stop.
  characters: [
    // (at the feast's tables once you've passed the exam: seated as you come to the home ground, so the teacher you're
    // talking to doesn't vanish from the classroom as you pass, decided 30 October 2026)
    {id:'elder', x:7, y:1, facing:'down', beard:true, name:{zh:'老猴子', py:'lǎo hóuzi', en:'Old monkey'}, moves:[{if:{exam:1, feastHeld:0, place:'homeGround'}, place:'homeGround', x:16, y:8, facing:'up'}, {if:{raft:{atLeast:1, below:3}}, place:'shore', x:12, y:12, facing:'left'},   // (chapter 1's end: at the feast's table, then on the shore by your raft)
      {if:{school:{atLeast:1}}, place:'school', x:7, y:2, facing:'down'}, {if:{home:{atLeast:2}}, place:'homeGround', x:10, y:6, facing:'down'}, {if:{cave:{atLeast:4}}, place:'cave', x:6, y:9, facing:'down'}, {if:{climb:{atLeast:4}}, place:'falls', x:9, y:1, facing:'left'},
      {if:{gate:true}, x:14, y:2, facing:'right'}],   // by the waterfall once the troop is up there; where the rocks were till then
      palette:{o:'#3A3A36', f:'#A9A79F', s:'#EADCC8', m:'#B89E86', e:'#222222', w:'#FAFAF5'}},
    {id:'big', x:5, y:10, facing:'down', name:{zh:'大猴子', py:'dà hóuzi', en:'Big monkey'}, moves:[{if:{exam:1, feastHeld:0, place:'homeGround'}, place:'homeGround', x:18, y:8, facing:'up'}, {if:{raft:{atLeast:1, below:3}}, place:'shore', x:8, y:12, facing:'right'},
      {if:{garden:{atLeast:1}}, place:'homeGround', x:9, y:13, facing:'down'},   // (chapter 1: by his garden)
      {if:{home:{atLeast:1}}, place:'homeGround', x:15, y:4, facing:'down'}, {if:{cave:{atLeast:4}}, place:'cave', x:9, y:8, facing:'down'}, {if:{climb:{atLeast:4}}, place:'falls', x:10, y:2, facing:'left'},
      {if:{gate:true}, x:16, y:1, facing:'down'}],   // in the way up once the rocks have rolled away, where he stops you with a stick for you, and stays (he used to jump there and back)
      palette:{o:'#4A2C17', f:'#B9854E', s:'#F7DABA', m:'#D19A7A', e:'#24160C'}},
    {id:'hungry', x:13, y:5, facing:'down', name:{zh:'饿猴子', py:'è hóuzi', en:'Hungry monkey'},
      moves:[{if:{raft:{atLeast:1, below:3}}, place:'shore', x:13, y:11, facing:'down'},   // (seeing you off, on the shore)
        {if:{feast:{atLeast:1}}, place:'homeGround', x:19, y:7, facing:'left'}],   // chapter 1: he comes up from the meadow to look after the feast's big table
      palette:{o:'#4A2C17', f:'#B8743E', s:'#F2C9A0', m:'#C68A64', e:'#24160C'}},
    {id:'thirsty', x:2, y:12, facing:'right', name:{zh:'渴猴子', py:'kě hóuzi', en:'Thirsty monkey'},
      moves:[{if:{raft:{atLeast:1, below:3}}, place:'shore', x:7, y:11, facing:'down'},   // (seeing you off, on the shore)
        {if:{dairy:{atLeast:1}}, place:'homeGround', x:21, y:11, facing:'left'},   // (at his little dairy, beside him)
        {if:{cow:4, following:{cow:true}}, place:'homeGround', x:21, y:11, facing:'left'},   // watching for you to come up the path from the bridge with the cow
        {if:{feast:{atLeast:3}}, place:'homeGround', x:21, y:11, facing:'right'}],   // chapter 1: he comes up from the meadow with news of a cow, by the road near its pen's plot
      palette:{o:'#40250F', f:'#94592E', s:'#F0C59A', m:'#C08060', e:'#24160C'}},
    {id:'playful', x:15, y:20, facing:'up', name:{zh:'小猴子', py:'xiǎo hóuzi', en:'Little monkey'}, moves:[{if:{exam:1, feastHeld:0, place:'homeGround'}, place:'homeGround', x:14, y:8, facing:'up'}, {if:{raft:{atLeast:1, below:3}}, place:'shore', x:9, y:11, facing:'down'}, {if:{school:{atLeast:1}}, place:'school', x:3, y:5, facing:'up'}, {if:{home:{atLeast:1}}, place:'homeGround', x:5, y:8, facing:'right'}, {if:{cave:{atLeast:4}}, place:'cave', x:4, y:8, facing:'right'}, {if:{climb:{atLeast:4}}, place:'falls', x:5, y:2, facing:'up'},
      {if:{gate:true}, x:14, y:3, facing:'right'}],
      palette:{o:'#4A2C17', f:'#CC8D45', s:'#F6D2A8', m:'#C98E6A', e:'#24160C'}},
    // the rest of the troop, in the meadow until they're counted into the cave
    {id:'troop1', x:21, y:7, facing:'left', name:{zh:'猴子', py:'hóuzi', en:'Monkey'}, moves:[{if:{school:{atLeast:1}}, place:'school', x:6, y:5, facing:'up'}, {if:{count:{atLeast:1}}, place:'cave', x:10, y:11, facing:'up'}],
      palette:{o:'#4A2C17', f:'#C27C3A', s:'#F4CDA5', m:'#C98E6A', e:'#24160C'}},
    {id:'troop2', x:21, y:11, facing:'down', name:{zh:'猴子', py:'hóuzi', en:'Monkey'}, moves:[{if:{school:{atLeast:1}}, place:'school', x:2, y:7, facing:'up'}, {if:{count:{atLeast:2}}, place:'cave', x:4, y:11, facing:'up'}],
      palette:{o:'#40250F', f:'#A8673A', s:'#EFC79C', m:'#C08060', e:'#24160C'}},
    {id:'troop3', x:20, y:13, facing:'right', name:{zh:'猴子', py:'hóuzi', en:'Monkey'}, moves:[{if:{school:{atLeast:1}}, place:'school', x:11, y:7, facing:'up'}, {if:{count:{atLeast:3}}, place:'cave', x:12, y:8, facing:'left'}],
      palette:{o:'#4A2C17', f:'#D9A050', s:'#F8DAB4', m:'#C98E6A', e:'#24160C'}},
    // a monkey just inside the cave's entrance, once the troop has moved in: it tells you to sleep in the beds
    {id:'doorway', place:'cave', x:9, y:12, facing:'left', name:{zh:'猴子', py:'hóuzi', en:'Monkey'}, moves:[{if:{cave:{below:4}}, place:'gone', x:0, y:0}],
      palette:{o:'#40250F', f:'#B5793F', s:'#F3CDA2', m:'#C68A64', e:'#24160C'}},
    // the wild boar, blocking the narrow way to the waterfall until you chase it off
    {id:'boar', place:'falls', x:7, y:3, facing:'down', look:'野猪', label:'Fight', name:{zh:'野猪', py:'yězhū', en:'Wild boar'},
      moves:[{if:{boar:1}, place:'gone', x:0, y:0}, {if:{climb:{atLeast:2}}, place:'gone', x:0, y:0}]},
    // animal friends from the meadow, met again on the way up the stream: the rabbit and the sheep give advice, the
    // squirrel and the goat want to play. They look like the animals (look), and have no names: they're words you know.
    {id:'rabbit', place:'path', x:14, y:15, facing:'left', look:'兔子'},      // by the first long grass
    {id:'squirrel', place:'path', x:5, y:3, facing:'down', look:'松鼠'},      // in the clearing, by the peach tree
    {id:'sheep', place:'valley', x:18, y:8, facing:'down', look:'羊'},        // at the fork
    {id:'goat', place:'valley', x:19, y:3, facing:'down', look:'山羊'},       // in the clearing over the first bridge
    // a goat on the rocks beside the narrow way below the waterfall, once you've found it: going down is quicker, hopping
    // down the banks (it stops you if you walk past: see events)
    {id:'ledgeGoat', place:'falls', x:6, y:4, facing:'right', look:'山羊', moves:[{if:{climb:{below:2}}, place:'gone', x:0, y:0}]},
    // chapter 1: a goat on the hillside's lookout, by its railing, looking out (it stops you as you pass, the first time,
    // and walks you to the railing to show you the view: see events). Wherever there's something you might miss, a goat is
    // there to tell you. It stays where it showed you the view, a step along the railing.
    {id:'lookoutGoat', place:'hillside', x:20, y:21, facing:'down', look:'山羊', moves:[{if:{lookTip:{atLeast:1}}, place:'hillside', x:22, y:21, facing:'down'}]},
    {id:'slopeGoat', place:'southSlope', x:11, y:16, facing:'left', look:'山羊'},
    {id:'cliffGoat', place:'cliffs', x:16, y:6, facing:'left', look:'山羊'},   // chapter 1: a goat at the top of the cliffs
    // chapter 1: two monkeys of the troop bathing in a warm pool in the hot spring valley, as monkeys do in hot springs
    {id:'bather1', place:'hotSprings', x:5, y:17, facing:'down', plays:'bathe', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      palette:{o:'#43260F', f:'#B5804C', s:'#F2CDA4', m:'#C48C68', e:'#24160C'}},
    {id:'bather2', place:'hotSprings', x:7, y:17, facing:'down', plays:'bathe', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      palette:{o:'#4A2A14', f:'#C8884E', s:'#F5D3AC', m:'#CC9070', e:'#24160C'}},   // chapter 1: a goat on the south slope, by its lookout
    {id:'woodSquirrel', place:'pineWood', x:18, y:21, facing:'left', look:'松鼠'},   // chapter 1: a squirrel in the pine wood, in the clearing by the way in
    // chapter 1: two little monkeys in training on the hillside, practising with sticks like yours (in the book, chapter 3,
    // the Monkey King trains the troop): one by the stepping stones, one on the middle terrace. Each stops you as you pass,
    // the first time, for a word game (see events). holds: what's in its hand; practises: it swings it now and then,
    // facing its own way, while you're not beside it
    {id:'trainee1', place:'hillside', x:20, y:37, facing:'left', holds:'棍子', practises:true, name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      palette:{o:'#4A2C17', f:'#C8894A', s:'#F6D1A7', m:'#C98E6A', e:'#24160C'}},
    {id:'trainee2', place:'hillside', x:9, y:20, facing:'right', holds:'棍子', practises:true, name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      palette:{o:'#40250F', f:'#A56A3A', s:'#F0C89E', m:'#C08060', e:'#24160C'}},
    // chapter 1: a little monkey looking for mushrooms under the first pines, at the top of the hillside, beside the way up to
    // the pine wood (28 October 2026: something to practise on the way, as you go for wood and small stones): facing them,
    // crouching down to look closely now and then (plays: 'peer')
    {id:'mushroomer', place:'hillside', x:11, y:4, facing:'left', plays:'peer', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      palette:{o:'#4A2C17', f:'#BD8046', s:'#F4CFA6', m:'#C78C66', e:'#24160C'}},
    // chapter 1: two little monkeys at play at the home ground, beside the way up to the hillside, piling stones into a
    // tower between them (the @ square), taking turns, as high as it will go, till it falls and they start again (in the
    // book, chapter 1, the troop plays under the pines and by the stream on a hot day: 跑沙窝，砌宝塔, they run about in the
    // sand and build pagodas). plays: what a monkey is doing, all the time, except while you're talking to it
    {id:'towerL', place:'homeGround', x:26, y:8, facing:'right', plays:'tower', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},   // (by the hillside's stone steps till 24 October 2026: in the way there; west of the way up till 25 October 2026, where the feast's tables will go)
      palette:{o:'#45291A', f:'#B98A5E', s:'#F4D3AE', m:'#C99272', e:'#24160C'}},
    {id:'towerR', place:'homeGround', x:28, y:8, facing:'left', plays:'tower', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      palette:{o:'#46240F', f:'#B4693A', s:'#F2CA9F', m:'#C2805E', e:'#24160C'}},
    // chapter 1: a little monkey who plays hide and seek with you (the area's hideSeek), once the feast is announced, by the
    // path in the middle of the home ground
    {id:'hider', place:'homeGround', x:13, y:8, facing:'down', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      moves:[{if:{feast:0}, place:'gone', x:0, y:0}],
      palette:{o:'#43260F', f:'#C98B4F', s:'#F6D4AC', m:'#CC9070', e:'#24160C'}},
    // chapter 1: by the hillside's brook, a little monkey on the bank chasing a dragonfly, leaping at it, and two in the water
    // at the brook's end, splashing each other (in the book, chapter 1: 赶蜻蜓, they chase dragonflies, and 绿水涧边随洗濯, by
    // the green stream they wash)
    {id:'chaser', place:'hillside', x:11, y:35, facing:'down', plays:'dragonflies', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      palette:{o:'#47280F', f:'#C08850', s:'#F5D2AA', m:'#CC9070', e:'#24160C'}},
    {id:'splash1', place:'hillside', x:3, y:37, facing:'right', plays:'splash', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      palette:{o:'#3F2614', f:'#A9784C', s:'#F0CBA2', m:'#BE8A66', e:'#24160C'}},
    {id:'splash2', place:'hillside', x:5, y:37, facing:'left', plays:'splash', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      palette:{o:'#4B2A12', f:'#C27A45', s:'#F3CFA8', m:'#C98C68', e:'#24160C'}},
    // chapter 1: at the home ground, east of the way down to the bridge, under the tree below the pool, two little monkeys
    // grooming each other, taking turns (in the book, chapter 1: 捉虱子…理毛衣, they pick out fleas and tidy their fur, in the
    // shade of the pines). Under the hillside's first pines till 24 October 2026: the home ground's south was empty; then
    // under the tree west of the way down, till 30 October 2026, when they were moved away from the garden's fruit
    // chapter 1: a monkey fishing in the stream at the home ground, its rod out over the water (plays: 'fish'); it gives you a
    // rod once the hungry monkey wants a big fish for the feast (decided 29 October 2026)
    {id:'fisher', place:'homeGround', x:24, y:17, facing:'down', plays:'fish', name:{zh:'钓鱼猴子', py:'diàoyú hóuzi', en:'Fishing monkey'},
      palette:{o:'#3E2814', f:'#A86E3A', s:'#EFC7A0', m:'#BC8460', e:'#24160C'}},
    {id:'groomA', place:'homeGround', x:19, y:17, facing:'right', plays:'groom', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      palette:{o:'#43260F', f:'#B07A48', s:'#F2CDA4', m:'#C48A64', e:'#24160C'}},
    {id:'groomB', place:'homeGround', x:20, y:17, facing:'down', plays:'groom', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      palette:{o:'#4A2B13', f:'#C99558', s:'#F6D6B0', m:'#D09A76', e:'#24160C'}},
    {id:'boss', x:11, y:16, facing:'down', name:{zh:'老板', py:'lǎobǎn', en:'Shop owner'},
      moves:[{if:{raft:{atLeast:1, below:3}}, place:'shore', x:14, y:12, facing:'left'},   // (seeing you off, on the shore)
        {if:{shop:{atLeast:1}}, place:'homeGround', x:7, y:8, facing:'down'}],   // (chapter 1: up at the home ground, by his new shop, once the school's flowers are planted)
      palette:{o:'#3E2A14', f:'#9C6A3C', s:'#EFC9A0', m:'#B98260', e:'#24160C'}},
    // chapter 1: the queen bee (蜂王), called by her word, as an animal is: in her old hollow tree in the bees' valley till
    // she comes out, hovering in front of it while she's out; then home with you, with her swarm, by the wildflowers below
    // the cliff (where their hive will be: step 5), their home here. They fly (flies), so they hover and the flowers never
    // hide them; the swarm is a cloud of tiny bees (look: swarm).
    {id:'queen', place:'homeGround', x:27, y:6, facing:'down', look:'蜂王', flies:true,
      moves:[{if:{bees:{atLeast:10}}, place:'gone', x:0, y:0}, {if:{bees:{below:6}, queenOut:true}, place:'flowerValley', x:25, y:5, facing:'down'}, {if:{bees:{below:6}}, place:'gone', x:0, y:0}]},   // (in the hive, once it's built)
    {id:'beeSwarm', place:'homeGround', x:28, y:6, facing:'down', look:'swarm', flies:true, moves:[{if:{bees:{atLeast:10}}, place:'gone', x:0, y:0}, {if:{bees:{below:6}}, place:'gone', x:0, y:0}]},
    // chapter 1: the butterfly from the riverside's wildflowers (called 蝴蝶, by its word, as it looks like one), fluttering in
    // after you the first time you come into the bees' valley, at its way in, to tell you about it (an event), then back to
    // its flowers: only here till then (bees: 1)
    // chapter 1: crabs on the shore's sand, scuttling sideways (scuttles); A at one, from in front or behind, catches it
    {id:'crab1', place:'shore', x:7, y:10, facing:'down', look:'螃蟹', scuttles:true, label:'Catch'},
    {id:'crab2', place:'shore', x:16, y:8, facing:'down', look:'螃蟹', scuttles:true, label:'Catch'},
    {id:'crab3', place:'shore', x:24, y:10, facing:'down', look:'螃蟹', scuttles:true, label:'Catch'},
    {id:'guide', place:'flowerValley', x:0, y:10, facing:'right', look:'蝴蝶', flies:true,
      moves:[{if:{bees:{below:1}}, place:'gone', x:0, y:0}, {if:{bees:{atLeast:2}}, place:'gone', x:0, y:0}]},
    // chapter 1: the cow (牛), called by its word, as an animal is: lost and all alone in the pasture, by its spring, scared
    // of the wolves in the pines
    {id:'cow', place:'pasture', x:31, y:18, facing:'left', look:'牛',
      moves:[{if:{cow:{atLeast:8}}, place:'homeGround', x:28, y:13, facing:'left'},   // in its pen, in front of its shelter
        {if:{cow:{atLeast:5}}, place:'homeGround', x:22, y:11, facing:'left'},   // home with you, by the thirsty monkey near the road
        // leading it home, it stops, waiting for you: by the long grass in the dark pines, scared of the wolves in it; and
        // on the south slope, hungry, at the top of the steps up from the pines
        {if:{cow:4, cowWaits:'grass'}, place:'darkPines', x:16, y:28, facing:'up'}, {if:{cow:4, cowWaits:'slope'}, place:'southSlope', x:2, y:27, facing:'right'}]},
    // a rabbit in a nook by the way through the pasture's pines, over the stream, where the way forks three ways: it saw the
    // cow go by (decided 27 October 2026, with the forks; 兔子 you know from the prologue, so it's a word game, not a new word)
    {id:'pastureRabbit', place:'darkPines', x:20, y:23, facing:'up', look:'兔子'},
    // chapter 1: birds pecking at the wild melons in the melon field, each one colour: shoo them away (shoo: what you're told
    // as it flies off, for good) before you take the melons' seeds for the garden
    {id:'melonBird1', place:'melonField', x:14, y:4, look:'bird', facing:'left', colour:'红色', pecks:true, label:'Shoo', shoo:'Shoo! It flies off. ({birdsShooed}/5)'},
    {id:'melonBird2', place:'melonField', x:24, y:5, look:'bird', facing:'left', colour:'黄色', pecks:true, label:'Shoo', shoo:'Shoo! It flies off. ({birdsShooed}/5)'},
    {id:'melonBird3', place:'melonField', x:16, y:10, look:'bird', facing:'left', colour:'蓝色', pecks:true, label:'Shoo', shoo:'Shoo! It flies off. ({birdsShooed}/5)'},
    {id:'melonBird4', place:'melonField', x:21, y:11, look:'bird', facing:'left', colour:'白色', pecks:true, label:'Shoo', shoo:'Shoo! It flies off. ({birdsShooed}/5)'},
    {id:'melonBird5', place:'melonField', x:12, y:15, look:'bird', facing:'left', colour:'黑色', pecks:true, label:'Shoo', shoo:'Shoo! It flies off. ({birdsShooed}/5)'}
  ],

  // Your name in the speech box when you reply: the first whose if matches (otherwise 小猴子, Little monkey). Its English
  // says what the name means, and that it's you.
  yourNames: [
    {if:{cave:{atLeast:6}}, zh:'美猴王', py:'Měi Hóuwáng', en:'Handsome Monkey King (you)'}
  ],

  // The sign by the stone: its name, what it says, and a hint underneath.
  sign: {
    name: {zh:'牌子', py:'páizi', en:'Sign'},
    says: {zh:'花果山', en:'Flower Fruit Mountain'},
    hint: 'The name of your home.',
    // once you know every part of the name (if), reading it shows how it's made, on a card like a word's (title, and the parts
    // with what they add up to), then set (decided 23 October 2026: Chinese is logical)
    made: {if:{nameParts:3}, title:'Your home’s name', parts:[['花', 'huā', 'flower'], ['果', 'guǒ', 'fruit'], ['山', 'shān', 'mountain']],
      why:'a mountain of flowers and fruit', set:{homeName:2}}
  },

  // Parts of something bigger that A looks at on their own: where they are (at), and what A does there (onLook, as in the
  // legend). The school's lanterns, at its front corners: paper, then red once the class has painted them, showing you
  // 红色 again (decided 24 October 2026, when the class stopped painting the rest of the school)
  spots: [
    {at:[[8, 3, 'homeGround'], [8, 4, 'homeGround'], [14, 3, 'homeGround'], [14, 4, 'homeGround']], onLook:[
      {if:{school:{atLeast:1}, knows:'红色'}, do:[{card:'红色', note:'The lanterns on the {学校} are red: the class painted them.'}]},
      {if:{school:{atLeast:1}}, do:[{message:'Paper lanterns hang from the eaves of the {学校}.'}]}
    ]}
  ],

  // While you learn your first words, the sparkles twinkle bigger, so you can see what to look for.
  bigSparkles: {elder:1, newWords:{below:4}},
  // Things that sparkle until you learn their word: the word, where it is on the map, and
  // (optionally) an if that must match before it starts sparkling.
  sparkles: [
    {word:'石头', at:[9, 1]}, {word:'山', at:[12, 3]}, {word:'花', at:[11, 7]},
    {word:'草', at:[5, 7]}, {word:'树', at:[12, 8]},
    {word:'桃子', at:[1, 6]}, {word:'苹果', at:[21, 17]},   // the fruit trees: a peach tree and an apple tree
    {word:'河', at:[18, 7]}, {word:'鱼', at:[11, 9]},
    {word:'瀑布', at:[4, 1, 'falls']},   // where the river begins, deep in the mountains
    {at:[11, 2], if:{homeName:1}},        // the sign by your stone, once you can read your home's name, till you have
    {word:'床', at:[1, 1, 'cave']}, {word:'桌子', at:[3, 3, 'cave']}, {word:'碗', at:[9, 3, 'cave']},
    // a game whose feast tables were out before 27 October 2026 (the big monkey teaches these now): the chopsticks in their cup
    // at the end of the big table, and the spoon in the yoghurt on the second
    {word:'筷子', at:[19, 7, 'homeGround'], if:{tableware:2}},
    {word:'勺子', at:[22, 7, 'homeGround'], if:{milkTable:{atLeast:2}, spoons:0}}
  ],

  // Where you found each word, shown on its page in the Word Scroll. Every word you can collect
  // here needs one (the tests check). A word in {curly brackets} is shown as 汉字 (English).
  found: {
    '石头': 'The stone you were born from, at the top of the path.',
    '你好': 'The old monkey said it when you first met.',
    '猴子': 'The little monkey, playing in the south meadow.',
    '山': 'The cliffs all around the mountain.',
    '花': 'The flowers growing in the grass.',
    '红色': 'A colour lesson at school: the class painted the lanterns with it.',
    '黄色': 'A colour lesson at school: the teacher opened a pot of it.',
    '白色': 'A colour lesson at school: the teacher opened a pot of it.',
    '草': 'The tall grass, where animals hide.',
    '蘑菇': 'Under the pines: at the top of the hillside, and on the way south to the pasture.',
    '树': 'The trees on the mountain.',
    '桃子': 'The peach trees at the far left end of the long path.',
    '苹果': 'The apple tree in the south-east, across the river.',
    '河': 'The river that runs down the right of the mountain.',
    '水': 'You collected it for the thirsty monkey.',
    '水果': 'The hungry monkey wanted some, from the fruit trees.',
    '鱼': 'Little fish in the pond in the middle of the meadow.',
    '鸟': 'Little birds that land on the grass near you.',
    '动物': 'The old monkey told you about the hidden animals.',
    '兔子': 'It jumped out of the tall grass.',
    '羊': 'Eating grass at the foot of the cliffs, near your stone.',
    '松鼠': 'It lives in the big tree to the south.',
    '山羊': 'It lives on the cliffs to the south.',
    '洞': 'The Water Curtain Cave, behind the waterfall.',
    '吃': 'The hungry monkey wanted something to eat.',
    '喝': 'The thirsty monkey wanted something to drink.',
    '朋友': 'The little monkey became your friend.',
    '我': 'The big monkey said it, telling you who he is.',
    '要': 'You learned it to say what a monkey wanted.',
    '瀑布': 'The waterfall at the top of the mountain path, where the river comes from.',
    '路': 'The mountain path, up beside the river from the meadow.',
    '棍子': 'The big monkey gave it to you, before you set off up the mountain path.',
    '蛇': 'In the long grass on the mountain path.',
    '蜘蛛': 'In the long grass on the mountain path.',
    '蜜蜂': 'Hiding in the tall flowers of the bees’ valley.',   // (in the long grass on the mountain path until 21 October 2026)
    '野猪': 'Blocking the narrow way at the top of the mountain path.',
    '鹿': 'In a sunny glade deep in the pine wood, behind a cracked rock.',
    '猫头鹰': 'Up on a dead pine in the dark pines, just inside the way in from the south slope.',
    '鸭子': 'Swimming on the home ground’s stream, east of the fishing monkey.',
    '马': 'Out on the pasture’s grass, west of the way in from the dark pines.',
    '青蛙': 'On a lily pad on the south slope’s brook, just west of the stepping stones.',
    '老鼠': 'Hiding in the tall grass at the melon field’s south-west corner.',
    '乌龟': 'Warming itself on the boulder by the hot spring pools.',
    '海龟': 'On the shore’s sand, at the water’s edge by the cliff.',
    '狼': 'In the long grass in the pine wood.',
    '熊': 'Rearing up out of the long grass between the big rocks in the pasture, as you led the cow home.',
    '狐狸': 'Hiding in the tall grass on the hillside.',
    '蝴蝶': 'Fluttering over the wildflowers on the riverside, the way east to the bees.',
    '黄蜂': 'Zooming out of the tall flowers in the bees’ valley.',
    '蜂王': 'Out of her old hollow tree, in the bees’ valley.',   // (heard first as the sixth bee sends you to find her)
    '牛': 'Lost and all alone by its spring, in the pasture south of the home ground.',   // (heard first in the thirsty monkey's news)
    '蜂蜜': 'From the bees’ hive, by the wildflowers at the home ground.',
    '牛奶': 'The cow’s thank-you, in its new home by the road.',
    '酸奶': 'The thirsty monkey made it from the cow’s milk, at the little dairy by its pen.',
    '奶酪': 'The thirsty monkey made it from the cow’s milk too, at the little dairy.',
    '筷子': 'The big monkey made them for the feast, out of wood: in a bamboo cup at the end of its big table.',
    '勺子': 'The big monkey made them, for the yoghurt on the feast’s second table.',
    '种子': 'The big monkey wants them for his garden by the stream: seeds from wild fruit.',
    '西瓜': 'Wild in the melon field, east off the south slope, where birds peck at them.',
    '葡萄': 'Wild on the cliffs west off the hillside, hanging down a cliff over a ledge.',
    '香蕉': 'Wild in the hot spring valley, up the brook from the riverside, past the steam.',
    '老板': 'The shop owner at the market stall in the south meadow.',
    '头带': 'You bought it from the {老板} at the market stall in the south meadow.',
    '谢谢': 'You said it to the {老板} after buying from the stall.',
    '不客气': 'You said it when a monkey thanked you for your help.',
    '对不起': 'You said it when you brought the hungry monkey the wrong fruit.',
    '没关系': 'You said it when the hungry monkey said sorry for being so fussy.',
    '再见': 'You said it to the old monkey as you set off up the mountain path.',
    '我不要': 'You said it at the {老板}’s stall when you didn’t want anything.',
    '戴': 'You said it when you put something on from your wardrobe.',
    '跳': 'The big monkey dared the troop to jump through the waterfall.',
    '桥': 'A bridge over the stream, at the home ground or in the pine wood.',   // (the iron bridge in the Water Curtain Cave until 21 October 2026)
    '床': 'The stone beds in the Water Curtain Cave.',
    '睡觉': 'The stone beds in the Water Curtain Cave: sleep there to get your health back.',
    '碗': 'The troop’s bowls, stacked up in the Water Curtain Cave.',
    '桌子': 'The stone table in the Water Curtain Cave.',
    '家': 'The old monkey, when the troop moved into the Water Curtain Cave.',
    '王': 'The troop, when they made you their king.',
    '一': 'Counting the troop into the Water Curtain Cave.',
    '二': 'Counting the troop into the Water Curtain Cave.',
    '三': 'Counting the troop into the Water Curtain Cave.',
    '木头': 'A dry, dead pine in the pine wood, knocked down with your stick.',
    '学校': 'The troop built it at the home ground, with the wood and stones you brought.',
    '老师': 'The little monkeys greeting the old monkey, their teacher, at school.',
    '同学': 'The little monkey, at school: you’re classmates.',
    '四': 'A number lesson at school: the teacher counting peaches onto his table.',
    '五': 'A number lesson at school: the teacher counting peaches onto his table.',
    '六': 'A number lesson at school: the teacher counting peaches onto his table.',
    '七': 'A number lesson at school: the teacher counting peaches onto his table.',
    '八': 'A number lesson at school: the teacher counting peaches onto his table.',
    '九': 'A number lesson at school: the teacher counting peaches onto his table.',
    '十': 'A number lesson at school: the teacher counting peaches onto his table.',
    '黑色': 'A colour lesson at school: the teacher opened a pot of it.',
    '蓝色': 'A colour lesson at school: the teacher opened a pot of it.',
    '绿色': 'A colour lesson at school: the teacher opened a pot of it.',
    '棕色': 'A colour lesson at school: the teacher opened a pot of it.',
    '橙色': 'A colour lesson at school: the teacher opened a pot of it.',
    '粉色': 'A colour lesson at school: the teacher opened a pot of it.',
    '有': 'The old monkey’s news at school: the troop has a home, and a school too.',
    '没有': 'The hungry monkey, at the feast’s big table: there’s no honey.',
    '跑': 'PE at school: the teacher started a race with it, on the sports ground.',
    '跑步': 'PE at school: the class went running round the sports ground.',
    '鱼竿': 'The fishing monkey gave it to you, by the stream at the home ground.',
    '鱼饵': 'You bought it at the {老板}’s shop, at the home ground.',
    '小': 'You said it as you let your first fish go: too small!',
    '大': 'You said it when you caught a big fish for the feast.',
    '虾': 'You caught it in the clear shallows of the brook on the riverside.',
    '海': 'You saw it from the shore, below the meadow, where the river runs into it.',
    '螃蟹': 'You caught one on the shore’s sand, for the feast.',
    '快乐': 'You heard it at the great feast: the little monkey was very happy.',
    '木筏': 'The troop built it on the shore, for you to sail away on.',
  },

  // Sentences for practising a word without a picture in a lesson, as a gap to fill, for one that no sentence you complete
  // (in a request, the shop or the wardrobe) has: 有 (decided 24 October 2026: without them, the teacher would have a !
  // for it, with nothing to ask). Like those, each needs every word in it caught.
  practiceSentences: [
    {sentence:'我 有 桃子', sentenceEn:'I have peaches.'},
    {sentence:'我 有 朋友', sentenceEn:'I have friends.'},
    {sentence:'我 没有 苹果', sentenceEn:'I don’t have any apples.'},   // (没有)
    {sentence:'我 要 大 桃子', sentenceEn:'I want a big peach.'},   // (大 and 小: drafts, not checked yet)
    {sentence:'我 有 小 鱼', sentenceEn:'I have a little fish.'}
  ],

  // The feast's list, shown by A at its big table (the feastList step): what the troop has for the feast and what it still
  // needs, each food with its picture and a sentence in Chinese, yes once the troop has it (have: an if, {} for a food it
  // has from the start; left out, not yet, till its part of the story gives it one), no till then. A food joins the list
  // once its part of the story begins (show), so the list never gives away what's coming.
  feastList: {
    label:'For the feast, at the big {桌子}',
    note:'More food goes on the list as the story goes on.',
    foods: [
      {word:'桃子', have:{}, yes:{zh:'我们 有 桃子 。', en:'We have peaches.'}},
      {word:'苹果', have:{}, yes:{zh:'我们 有 苹果 。', en:'We have apples.'}},
      {word:'蜂蜜', show:{feast:{atLeast:3}}, have:{bees:{atLeast:11}}, no:{zh:'我们 没有 蜂蜜 。', en:'We don’t have any honey.'},
        yes:{zh:'我们 有 蜂蜜 。', en:'We have honey.'}},   // (from the bees' hive)
      {word:'牛奶', show:{milkTable:{atLeast:1}}, have:{milkTable:{atLeast:1}}, yes:{zh:'我们 有 牛奶 。', en:'We have milk.'}},   // (the cow's thank-you; on the list once it's on the table, so the list never gives it away)
      {word:'酸奶', show:{milkTable:{atLeast:2}}, have:{milkTable:{atLeast:2}}, yes:{zh:'我们 有 酸奶 。', en:'We have yoghurt.'}},   // (from the little dairy)
      {word:'奶酪', show:{milkTable:{atLeast:3}}, have:{milkTable:{atLeast:3}}, yes:{zh:'我们 有 奶酪 。', en:'We have cheese.'}},
      {word:'鱼', show:{any:[{fish:'asked'}, {fish:'done'}]}, have:{fish:'done'}, no:{zh:'我们 没有 鱼 。', en:'We don’t have any fish.'}, yes:{zh:'我们 有 鱼 。', en:'We have fish.'}},   // (a big one, from the stream)
      {word:'螃蟹', show:{any:[{crab:'asked'}, {crab:'done'}]}, have:{crab:'done'}, no:{zh:'我们 没有 螃蟹 。', en:'We don’t have any crab.'}, yes:{zh:'我们 有 螃蟹 。', en:'We have crab.'}},   // (from the shore)
      {word:'虾', show:{any:[{shrimp:'asked'}, {shrimp:'done'}]}, have:{shrimp:'done'}, no:{zh:'我们 没有 虾 。', en:'We don’t have any shrimp.'}, yes:{zh:'我们 有 虾 。', en:'We have shrimp.'}},   // (three, from the riverside's brook)
      // the garden's fruit: on the list once it's planted (you know its word by then), had once it's on the table
      {word:'西瓜', show:{melonPlanted:{atLeast:1}}, have:{melonPlanted:{atLeast:4}}, no:{zh:'我们 没有 西瓜 。', en:'We don’t have any watermelon.'}, yes:{zh:'我们 有 西瓜 。', en:'We have watermelon.'}},
      {word:'葡萄', show:{grapePlanted:{atLeast:1}}, have:{grapePlanted:{atLeast:4}}, no:{zh:'我们 没有 葡萄 。', en:'We don’t have any grapes.'}, yes:{zh:'我们 有 葡萄 。', en:'We have grapes.'}},
      {word:'香蕉', show:{bananaPlanted:{atLeast:1}}, have:{bananaPlanted:{atLeast:4}}, no:{zh:'我们 没有 香蕉 。', en:'We don’t have any bananas.'}, yes:{zh:'我们 有 香蕉 。', en:'We have bananas.'}}
    ]
  },

  // Hide and seek with a little monkey at the home ground (a side quest in chapter 1; the hideSeek step, js/hide.js): Play
  // or Not now, then you count to ten with your eyes covered (count, your line: numbers you know green), say you're
  // coming, and it calls out where it's hiding (each spot's say), its English every time with the place's word in Chinese
  // ({word} in it), so finding it tests that word and never 下面 or 里. It only hides where you know the word (each spot's
  // word), somewhere new each time. A at a spot (at: its squares) looks there: not there (notHere), and it calls out again;
  // after two wrong guesses, its tail (tail) too. Found: it jumps out (to out, or the nearest free square), you say
  // 找到你了！ (found), shells the first time (shells), and it goes back to where it stands.
  hideSeek: {
    by:'hider', place:'homeGround', shells:3,
    ask:'Hide and seek! Cover your eyes and count to ten, then find where the little monkey is hiding. Listen to where it says it is.',
    notYet:'The little monkey wants to play hide and seek, but you don’t know the words for enough places yet. Come back when you know more!',
    count:'hideCount', coming:'hideComing', found:'hideFound',
    notHere:'🐾 Not here! Listen again: where did it say it is?',
    tail:'🐾 Not here! Listen again, and look out for a tail…',
    result:'You found the little monkey! It was {where}.',
    again:'Talk to it again to play another game: it hides somewhere new each time.',
    spots: [
      {id:'tree', word:'树', say:'hideTree', where:'behind the big {树}', at:[[17, 4], [18, 4], [17, 5], [18, 5], [17, 6], [18, 6]], out:[19, 4], tail:[18, 4, 'right']},
      {id:'table', word:'桌子', say:'hideTable', where:'under the {桌子}', at:[[16, 7], [17, 7], [18, 7]], out:[17, 8], tail:[16, 7, 'left']},
      {id:'bridge', word:'桥', say:'hideBridge', where:'under the {桥}', at:[[15, 18], [16, 18], [17, 18]], out:[15, 17], tail:[16, 18, 'left']},
      {id:'water', word:'水', say:'hideWater', where:'in the {水}', at:[[18, 15], [19, 15], [20, 15], [18, 16], [19, 16], [20, 16]], out:[17, 15], tail:[19, 16, 'right']},
      {id:'flowers', word:'花', say:'hideFlowers', where:'in the {花|flowers}', at:[[26, 2], [27, 2], [28, 2], [29, 2], [30, 2], [30, 3],
        [26, 4], [30, 4], [26, 5], [27, 5], [28, 5], [29, 5], [30, 5]], out:[30, 3], tail:[28, 2, 'right']}   // (round the bees' hive and its sign, in the middle: chapter 1's bees)
    ]
  },

  // Example sentences for words that no line or story sentence uses, shown on the word's page in
  // the Word Scroll. (A word that only appears in a sentence you complete, such as 头带, shows that.)
  // Checked by a native speaker on 16 October 2026.
  examples: {
    '快乐': {zh:'小 猴子 很 快乐 。', en:'The little monkey is very happy.'},   // (a draft, not checked yet)
    '狐狸': {zh:'狐狸 在 草 里 玩 。', en:'The fox is playing in the grass.'},
    '羊': {zh:'羊 吃 草 。', en:'Sheep eat grass.'},   // (a draft, not checked yet)
    '松鼠': {zh:'松鼠 在 树 上 。', en:'The squirrel is in the tree.'},
    '山羊': {zh:'山羊 在 山 上 吃 草 。', en:'The goat is eating grass on the mountain.'},
    '洞': {zh:'山 里 有 一个 洞 。', en:'There is a cave in the mountain.'},
    '路': {zh:'山 上 有 路 。', en:'There is a path up the mountain.'},   // (drafts, not checked yet)
    '蜘蛛': {zh:'树 上 有 蜘蛛 。', en:'There is a spider in the tree.'},   // (a draft, not checked yet)
    '酸奶': {zh:'酸奶 是 白色 的 。', en:'Yoghurt is white.'},   // (drafts, not checked yet)
    '奶酪': {zh:'奶酪 是 黄色 的 。', en:'Cheese is yellow.'},
    '野猪': {zh:'山 上 有 野猪 。', en:'There is a wild boar on the mountain.'},
    // Chapter 1 (drafts, not checked yet: see CHINESE.md)
    '鹿': {zh:'鹿 在 吃 草 。', en:'The deer is eating grass.'},
    '猫头鹰': {zh:'猫头鹰 在 树 上 。', en:'The owl is in the tree.'},
    '鸭子': {zh:'鸭子 在 水 里 。', en:'The duck is in the water.'},
    '马': {zh:'马 在 吃 草 。', en:'The horse is eating grass.'},
    '青蛙': {zh:'青蛙 很 小 。', en:'The frog is very small.'},
    '老鼠': {zh:'老鼠 在 草 里 。', en:'The mouse is in the grass.'},
    '乌龟': {zh:'乌龟 在 石头 上 。', en:'The turtle is on the stone.'},
    '海龟': {zh:'海龟 很 大 。', en:'The sea turtle is very big.'},
    '蝴蝶': {zh:'蝴蝶 在 花 上 。', en:'The butterfly is on the flower.'},
    '熊': {zh:'山 上 有 熊 。', en:'There are bears on the mountain.'}
    // (兔子, 碗, 桌子 and 二 had examples until 21 October 2026: the number lessons' lines use them now; 蜜蜂, 花上有蜜蜂。,
    // until 25 October 2026: the hungry monkey's 我们有蜜蜂了！ uses it now; 黄蜂, 花里有黄蜂！, until 26 October 2026: the
    // butterfly's 花里有蜜蜂，也有黄蜂！ uses it now; and 狼, 草里有狼。, until 26 October 2026: the cow's 我怕狼！ uses it now)
  },

  // Wild creatures you can fight, in battles (js/battle.js). Each: its word (taught on a card the first time you
  // meet it, with meetNote), its health (chase it away by hitting it till there's none left: battles.hits each time),
  // how much health it takes when it hits you (hits), where it attacks from (attacks: you hear one and
  // pick it to jump aside; only words you've caught are used), what it does (meet; hide, then attack, on its turn), the message when it
  // runs off (away) with a reward in shells, and boss: true for a big enemy you can't run from.
  enemies: {
    snake: {word:'蛇', health:20, hits:10, attacks:['草', '石头', '树', '花'], meetNote:'A snake hisses at you from the long grass!', meet:'A {蛇} hisses at you!',
      hide:'The {蛇} slides out of sight…', attack:'The {蛇} strikes!', away:'The {蛇} slithers away into the grass.', reward:1},
    spider: {word:'蜘蛛', health:20, hits:10, attacks:['树', '草', '石头', '山'], meetNote:'A spider scuttles out of the long grass!', meet:'A {蜘蛛} scuttles at you!',
      hide:'The {蜘蛛} scurries out of sight…', attack:'The {蜘蛛} jumps at you!', away:'The {蜘蛛} scurries off into the grass.', reward:1},   // (in the bee's place since 21 October 2026)
    wolf: {word:'狼', health:30, hits:10, attacks:['树', '草', '石头', '木头'], meetNote:'A wolf leaps out of the long grass, growling!', meet:'A {狼} growls at you!',
      hide:'The {狼} slinks out of sight…', attack:'The {狼} pounces!', away:'The {狼} runs off into the pines.', reward:2},   // (chapter 1: in the pine wood)
    wasp: {word:'黄蜂', health:20, hits:10, attacks:['花', '草', '树', '石头'], meetNote:'A wasp zooms out of the tall flowers!', meet:'A {黄蜂} buzzes at you!',
      hide:'The {黄蜂} zips out of sight…', attack:'The {黄蜂} stings!', away:'The {黄蜂} buzzes off over the flowers.', reward:1},   // (chapter 1: in the tall flowers of the bees' valley)
    bear: {word:'熊', health:50, hits:10, boss:true, attacks:['石头', '树', '草', '山', '河'], meetNote:'A bear rears up out of the long grass between the big rocks, roaring!',
      meet:'The {熊} roars!', hide:'The {熊} drops down out of sight…', attack:'The {熊} swipes at you!', away:'The {熊} lumbers off into the pines, and doesn’t come back.', reward:3},   // (chapter 1: at the pasture's rocks, as you lead the cow home: in the wolf's place since 27 October 2026)
    boar: {word:'野猪', health:40, hits:10, boss:true, attacks:['石头', '树', '草', '山', '河'], meetNote:'A wild boar blocks the narrow way to the top!',
      meet:'The {野猪} snorts and paws the ground!', hide:'The {野猪} crashes off into the trees…', attack:'The {野猪} charges!', away:'The {野猪} squeals and runs off into the trees.', reward:3}
  },
  // Battles: when you can fight (when), what you hit with (weapon) and how much health a hit takes (hits), and what
  // happens if you lose: you rest, till your health is full, at the first restAt whose if matches (lost: the message then).
  // Your health starts at 50 (HEALTH in js/state.js); a fight is set by how many right answers it takes, the numbers
  // chosen to match (decided 27 October 2026: about 2 to 5 for a wild creature, more for a boss).
  battles: {
    when: {knows:'棍子'},   // once the big monkey has given you the stick
    weapon: '棍子', hits: 10,
    restAt: [
      {if:{home:{atLeast:2}}, at:[17, 8, 'homeGround'], facing:'up', lost:'You’re worn out. You crawl back down to the home ground and rest under the big tree until your health is full again.'},   // chapter 1: under the big tree (in front of the feast's table, which stands where you rested till 24 October 2026)
      {if:{cave:{atLeast:2}}, at:[3, 2, 'cave'], facing:'up', lost:'You’re worn out. You crawl back to the Water Curtain Cave and sleep until your health is full again.'},   // once you've found the cave: by a bed
      {at:[15, 2], facing:'left', lost:'You’re worn out. You crawl back down to the meadow and rest until your health is full again.'}
    ],
    // What happens after you lose a battle and come round where you rest: the first whose if matches. (Chapter 1: the cow
    // you were leading home takes fright, and runs back to its spring in the pasture; fetch it again. Losing isn't
    // punished: it trusts you still.)
    afterLoss: [{if:{cow:4, following:{cow:true}}, do:[{follow:[]}, {message:'Frightened, the {牛} ran back to its spring in the pasture. Go and fetch it again!'}]},
      // (and if it's waiting for you, it still is)
      {if:{cow:4, cowWaits:'grass'}, do:[{message:'The {牛} is still waiting for you by the long grass in the dark pines. Go first, and chase the wolves off!'}]},
      {if:{cow:4, cowWaits:'slope'}, do:[{message:'The {牛} is still waiting for you on the south slope, hungry.'}]}]
  },

  // Where fish jump out of the water now and then, one after another.
  fish: [[11, 9], [9, 10], [12, 11], [10, 12], [6, 12, 'riverside'], [21, 11, 'riverside'], [35, 12, 'riverside'], [43, 10, 'riverside']],
  // Dragonflies darting about over the water, each in its own patch, from at to to (squares, in at's place): just to look at
  // (in the book, chapter 1, the troop chases them: 赶蜻蜓)
  dragonflies: [{at:[8, 36, 'hillside'], to:[16, 37]}, {at:[20, 35, 'hillside'], to:[23, 36]}, {at:[27, 18, 'pasture'], to:[32, 19]}],

  // The area's animals. The id is kept in saved games, so never change it. An animal with at lives
  // at that spot (x, y) on the map, such as up a tree, on a cliff or in a clearing (you can't walk
  // through it): face it and press A to meet it, and home is the word for where it lives. The others
  // hide in the tall grass, which rustles where one is hiding: step in to meet it. One with hides hides
  // only in that place's tall grass (such as the fox, on the hillside). meetNote is on its
  // new-word card the first time. chapter: the chapter it's found in (0, the prologue, if not given),
  // for the counters that count animals (a counter's place counts just those in one place).
  animals: [
    // roams: once it's your friend, where else it hides in the tall grass, never where it lives (decided 30 October 2026, after
    // playing it: outside the hillside and the bees' valley, every rustle in the grass was the rabbit). clue: where to look for
    // it, under its shadow on the Friends page until you've met it (decided 30 October 2026), plain English, never its name
    {id:'rabbit', word:'兔子', clue:'In tall grass, almost anywhere'},
    {id:'sheep', word:'羊', at:[3, 4], home:'草', roams:['valley', 'pasture'], clue:'The meadow, by the cliffs near your stone', meetNote:'A sheep is eating grass at the foot of the {山}. Answer its questions to make friends.'},
    {id:'squirrel', word:'松鼠', at:[13, 18], home:'树', roams:['path', 'hillside', 'pineWood'], clue:'The meadow, up a big tree', meetNote:'A squirrel peeks out of the big {树}! Answer its questions to make friends.'},
    {id:'goat', word:'山羊', at:[4, 16], home:'山', roams:['path', 'valley', 'hillside', 'southSlope', 'cliffs'], clue:'The meadow, on a cliff', meetNote:'A goat stands on the cliff, chewing. Answer its questions to make friends.'},
    // chapter 1: a deer in the sunny glade deep in the pine wood, behind the cracked rock (counted on its own: the prologue's
    // animals are those above)
    {id:'deer', word:'鹿', at:[30, 3, 'pineWood'], home:'草', chapter:1, roams:['southSlope', 'darkPines', 'pasture'], clue:'The pine wood, in a sunny glade deep inside', meetNote:'A deer looks up from the grass, its ears twitching. Answer its questions to make friends.'},
    // chapter 1: an owl in the dark pines, up on an old dead pine just west of the way in (perch: how high it sits, in
    // pixels), its eyes glinting in the gloom (glints: where they are in its map sprite); 28 October 2026, after playtesting,
    // for something to practise on the long way south
    {id:'owl', word:'猫头鹰', at:[11, 2, 'darkPines'], home:'树', chapter:1, clue:'The dark pines, up an old dead pine', perch:9, glints:[[5, 8, 2], [8, 8, 2]],
      meetNote:'Two big round eyes blink at you from the dead pine: an owl! Answer its questions to make friends.'},
    // chapter 1: a fox hiding in the hillside's tall grass, only there (hides). It was the prologue's, in the meadow's tall grass, until
    // 23 October 2026, when the sheep took its place, for 羊 (sheep), then 山 + 羊 = 山羊 (goat).
    {id:'fox', word:'狐狸', hides:'hillside', chapter:1, roams:['pineWood', 'riverside', 'southSlope', 'darkPines'], clue:'The hillside’s tall grass', meetNote:'A fox darts out of the {草}, its tail swishing! Answer its questions to make friends.'},
    // chapter 1: a butterfly over the wildflowers on the riverside, beside the way east to the bees (it was to be the hillside's,
    // until the fox took its place, 23 October 2026). flutters: it hovers over its spot, its wings beating
    {id:'butterfly', word:'蝴蝶', at:[18, 4, 'riverside'], home:'花', chapter:1, flutters:true, roams:['melonField'], clue:'By the riverside, over the wildflowers', meetNote:'A butterfly flutters over the flowers beside you. Answer its questions to make friends.'},
    // chapter 1: bees hiding in the tall flowers of their valley, only there (the flowers shake where one is hiding), six to make
    // friends with (many: decided 25 October 2026 by the game's owner, hidden like the wasps; they were each over their own
    // flower). counts: how many so far, in the area's progress; counted: what happens as each becomes your friend, you
    // counting them aloud (the sixth: see events). stays: each one you meet stays out, hovering where it came out, so you can
    // see it's six different bees (decided 26 October 2026: the second said your friend wanted to play again, as if it were
    // the first); one you don't win over waits there, with a !, till you play again (A); and once all six are your friends,
    // they fly off to join the swarm. another: the hint before a new one's questions, after the first; again, before playing
    // again with one that's waiting; lost, if you don't win it over.
    {id:'bee', word:'蜜蜂', hides:'flowerValley', home:'花', chapter:1, clue:'A valley of flowers, in the tall flowers', meetNote:'A bee buzzes out of the tall flowers! Answer its questions to make friends.',
      many:6, counts:'beeFriends', counted:[
        [{say:'count1', by:'player'}, {message:'Your first {蜜蜂|bee} friend! It stays out over the flowers now. Five more bees to make friends with!'}],
        [{say:'count2', by:'player'}, {message:'Two {蜜蜂|bee} friends! Four more to make friends with.'}],
        [{say:'count3', by:'player'}, {message:'Three {蜜蜂|bee} friends! Three more to make friends with.'}],
        [{say:'count4', by:'player'}, {message:'Four {蜜蜂|bee} friends! Two more to make friends with.'}],
        [{say:'count5', by:'player'}, {message:'Five {蜜蜂|bee} friends! Just one more to make friends with.'}],
        [{say:'count6', by:'player'}]
      ],
      stays:{another:'Another {蜜蜂|bee}, a new one! Answer its questions to make friends with it too ({beeCount} of 6 so far).',
        again:'This {蜜蜂|bee} still wants to play! Answer its questions to make friends ({beeCount} of 6 so far).',
        lost:'The {蜜蜂|bee} hovers over the flowers: it still wants to play. Press A at it to try again.'}},
    // chapter 1: a duck swimming on the home ground's stream, east of the fishing monkey (swims: it floats there, bobbing,
    // and you meet it from the bank); 30 October 2026, the first of more friends where there were none
    {id:'duck', word:'鸭子', at:[27, 18, 'homeGround'], home:'水', chapter:1, swims:true, clue:'The home ground, on the stream',
      meetNote:'A duck paddles along the stream, quacking. Answer its questions to make friends.'},
    // chapter 1: a horse grazing out on the pasture's grass, west of the way in from the dark pines (big: it stands up out
    // of its square, taller than you, as the cow does)
    {id:'horse', word:'马', at:[9, 18, 'pasture'], home:'草', chapter:1, clue:'The pasture, out on the grass',
      meetNote:'A horse looks up from the grass and swishes its tail. Answer its questions to make friends.'},
    // chapter 1: a frog on a lily pad on the south slope's brook, just west of the stepping stones (swims: it floats there,
    // bobbing, and you meet it from the bank beside it, or from the tall grass above it)
    {id:'frog', word:'青蛙', at:[10, 22, 'southSlope'], home:'水', chapter:1, swims:true, clue:'The south slope, by the stepping stones',
      meetNote:'A frog sits on a lily pad on the brook, croaking. Answer its questions to make friends.'},
    // chapter 1: a mouse hiding in the melon field's tall grass, only there (hides), as the fox does on the hillside
    {id:'mouse', word:'老鼠', hides:'melonField', chapter:1, clue:'The melon field’s tall grass',
      meetNote:'A mouse pops out of the {草}, its whiskers twitching! Answer its questions to make friends.'},
    // chapter 1: a turtle warming itself up on the boulder by the hot spring pools (perch: how high it sits, in pixels)
    {id:'turtle', word:'乌龟', at:[6, 13, 'hotSprings'], home:'石头', chapter:1, perch:5, clue:'The hot springs, on a warm rock',
      meetNote:'A turtle is warming itself on a rock by the pools. Answer its questions to make friends.'},
    // chapter 1: a sea turtle on the shore's sand, at the water's edge on its west side, away from the crabs and the raft
    {id:'seaTurtle', word:'海龟', at:[4, 12, 'shore'], home:'海', chapter:1, clue:'The shore, on the sand by the sea',
      meetNote:'A sea turtle crawls slowly up the sand from the sea. Answer its questions to make friends.'}
  ],
  // Little birds land near you now and then: face one and press A to see its word (word, with note on its card). Once you
  // know the word, each is one of these colours (colours), and A shows it, such as 黄色的鸟 (a yellow bird), once you know
  // its colour too (decided 27 October 2026, as the flowers are); till then, its word's card with a picture of that colour
  birds: {word:'鸟', note:'A little bird hops about on the grass, singing.', colours:['红色', '黄色', '蓝色', '白色', '黑色', '绿色', '棕色', '橙色', '粉色']},
  // Things hidden off the paths (decided 23 October 2026: paths have shells and fruit tucked away in nooks and behind
  // trees), each at something you can't walk through, such as a tree or a boulder, found by pressing A at it, once (the
  // save keeps which: here().finds). A tiny glint gives each away now and then, easy to miss. id: its name in the save;
  // shells: how many it gives you, or fruit: which, for your bag (with no room, it stays till you come back); note: what
  // you find.
  hidden: [
    // the south slope: shells under a boulder by the brook
    {id:'slopeBoulder', at:[22, 22, 'southSlope'], shells:2, note:'Under the edge of the boulder: 2 🐚!'},
    // the hillside: shells at the foot, on the lowest terrace and on the middle one; apples on the top terrace and under the pines
    {id:'hillTree', at:[22, 39, 'hillside'], shells:2, note:'Tucked behind the tree: 2 🐚!'},
    {id:'hillBoulder', at:[8, 28, 'hillside'], shells:2, note:'Under the edge of the boulder: 2 🐚!'},
    {id:'hillHollow', at:[5, 22, 'hillside'], shells:2, note:'In a hollow in the tree: 2 🐚!'},
    {id:'hillSnack', at:[20, 14, 'hillside'], fruit:'苹果', note:'A little monkey’s hidden snack, behind the tree: a {苹果} for your bag!'},
    {id:'hillPine', at:[19, 4, 'hillside'], fruit:'苹果', note:'Tucked among the pine’s roots: a {苹果} for your bag!'},
    // the riverside: shells under a boulder below the rocks, and an apple behind a tree by the stream
    {id:'riverBoulder', at:[38, 6, 'riverside'], shells:2, note:'Under the edge of the boulder: 2 🐚!'},
    {id:'riverTree', at:[23, 10, 'riverside'], fruit:'苹果', note:'Tucked behind the tree by the stream: a {苹果} for your bag!'},
    // the pasture: shells under a boulder, and a peach behind a tree at its edge (for some health back, after the wolves)
    {id:'pastureBoulder', at:[4, 18, 'pasture'], shells:2, note:'Under the edge of the boulder: 2 🐚!'},
    {id:'pastureTree', at:[20, 23, 'pasture'], fruit:'桃子', note:'Tucked behind the tree at the edge of the pasture: a {桃子} for your bag!'},
    // at the ends of the ways through the pasture's pines that go nowhere (the cow didn't go that way, but they're worth it)
    {id:'pastureWestEnd', at:[3, 10, 'darkPines'], shells:2, note:'The way goes nowhere, but under the boulder at its end: 2 🐚!'},
    {id:'pastureEastEnd', at:[30, 27, 'darkPines'], shells:2, note:'The cow didn’t come this way, but tucked under the boulder: 2 🐚!'},
    {id:'melonBoulder', at:[3, 11, 'melonField'], shells:2, note:'Under the boulder by the way in: 2 🐚!'},
    {id:'shoreRock', at:[13, 9, 'shore'], shells:3, note:'Washed up by the sea, behind a rock on the sand: 3 🐚!'},   // (where the troop's shells come from)
    {id:'shoreBridge', at:[26, 7, 'shore'], shells:2, note:'Tucked in by a rock, over the little bridge: 2 🐚!'},
    {id:'cliffsBoulder', at:[2, 13, 'cliffs'], shells:2, note:'Under the boulder on the ledge: 2 🐚!'},
    {id:'springsBoulder', at:[22, 13, 'hotSprings'], shells:2, note:'Under the warm boulder by the pools: 2 🐚!'}
  ],
  // Animals only start jumping out of the tall grass once this matches.
  animalsAppear: {knows:'动物'},
  // What an animal says as it comes out to play, before its questions (one of the lines), with what's happening in plain
  // English under it (the first time you meet one, its card says that instead): for an animal you're making friends
  // with, and for a friend (decided 23 October 2026, after playing it: the questions just started, with nothing to say why).
  animalsPlay: {say:'play', hint:'It wants to play! Answer its questions to make friends.', friendHint:'Your {朋友} wants to play again! Answer its questions.'},
  // Tips about Chinese itself, each shown once, on a card, just before the questions the first time an animal of that word
  // plays with you (word), so you can try it straight away: its title, and an example, a word's characters each with its
  // pinyin, which you hear one at a time on a drum (ask: what to do), then what that shows (heard) and the tip (text).
  // (Decided 23 October 2026: a goat gives the tips you might otherwise miss; a game that met the goat before gets it the
  // next time a goat plays with it. The drum since 24 October 2026: the tip was a paragraph to read.)
  tips: {
    syllables: {word:'山羊', title:'Tip: one character, one syllable', example:[['山', 'shān'], ['羊', 'yáng']],
      ask:'Tap the drum to hear {山羊}, one beat at a time.', heard:'2 beats you hear = 2 characters you see',
      text:'When you hear a new word, count its beats: that’s how many characters to look for.'}
  },
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
    {item:'头带', colour:'红色', colours:['红色', '黄色', '白色', '黑色', '蓝色', '绿色', '棕色', '橙色', '粉色'],   // (in each colour the 老板 sells: one at a time)
      sentence:'我 戴 头带', sentenceEn:'I wear my headband.', colourSentence:'我 戴 {colour} 的 头带', colourSentenceEn:'I wear my {colour} headband.', teach:'戴', note:'Use 戴 for things you wear on your head.'}
  ],

  // What the characters say. The English shows under a sentence the first time you see it.
  lines: {
    hi: {zh:'你好 ！', en:'Hello!'},
    iam: {zh:'我 是 猴子 。 你 也 是 猴子 ！', en:'I am a monkey. You are a monkey too!'},
    go: {zh:'去 看看 ！', en:'Go and take a look!'},
    comeLook: {zh:'来 看看 ！', en:'Come and take a look!'},   // the lookout's goat, walking you to its railing
    hungry: {zh:'我 饿 了 。 我 要 吃 水果 ！', en:"I'm hungry. I want to eat some fruit!"},
    thirsty: {zh:'我 渴 了 。 我 要 喝 水 ！', en:"I'm thirsty. I want to drink some water!"},
    // what a monkey says when you bring what it asked for, before you give it (not 你有…吗？, do you have…?: 有 yǒu, in the
    // same place just before 我要… yào, sounded too like it; decided 24 October 2026)
    havePeach: {zh:'桃子 ！ 太 好 了 ！', en:'A peach! Wonderful!'},
    haveWater: {zh:'水 ！ 太 好 了 ！', en:'Water! Wonderful!'},
    haveApple: {zh:'苹果 ！ 太 好 了 ！', en:'An apple! Wonderful!'},
    thanks: {zh:'谢谢 你 ！', en:'Thank you!'},
    play: {zh:'我们 玩 吧 ！', en:"Let's play!"},
    lookingMushrooms: {zh:'我 在 找 蘑菇 。', en:'I’m looking for mushrooms.'},   // the little monkey at the top of the hillside
    weFriends: {zh:'我们 是 朋友 ！', en:'We are friends!'},
    animals: {zh:'草 里 有 动物 。 去 找 动物 吧 ！', en:'There are animals in the grass. Go and find them!'},
    findElder: {zh:'你好 ！ 去 找 老 猴子 吧 ！', en:'Hello! Go and find the old monkey!'},
    notApple: {zh:'这 是 苹果 。 我 要 吃 桃子 ！', en:'This is an apple. I want to eat a peach!'},
    notPeach: {zh:'这 是 桃子 。 我 要 吃 苹果 ！', en:'This is a peach. I want to eat an apple!'},
    boss: {zh:'你好 ！ 我 是 老板 。', en:"Hello! I'm the shop owner."},
    whatWant: {zh:'你 要 什么 ？', en:'What do you want?'},
    bye: {zh:'再见 ！', en:'Goodbye!'},
    wantFlowers: {zh:'我 要 红色 、 黄色 和 白色 的 花 ！', en:'I want red, yellow and white flowers!'},
    haveFlowers: {zh:'花 ！ 太 好 了 ！', en:'Flowers! Wonderful!'},
    noProblem: {zh:'没关系 ！', en:'It doesn’t matter!'},
    welcome: {zh:'不客气 ！', en:'You’re welcome!'},   // the 老板, when you thank him for what you've bought
    bossCame: {zh:'我 来 了 ！', en:'Here I am!'},
    wantFish: {zh:'我 要 吃 大 鱼 ！', en:'I want to eat a big fish!'},   // the hungry monkey, for the feast (chapter 1; 大 just for listening, till you catch one)
    haveFish: {zh:'鱼 ！ 太 好 了 ！', en:'A fish! Wonderful!'}, haveFishNow: {zh:'我们 有 鱼 了 ！', en:'We have fish now!'},
    wantShrimp: {zh:'我 要 吃 虾 ！', en:'I want to eat shrimp!'},   // and then shrimp (虾 just for listening, till you catch one)
    haveShrimp: {zh:'虾 ！ 太 好 了 ！', en:'Shrimp! Wonderful!'}, haveShrimpNow: {zh:'我们 有 虾 了 ！', en:'We have shrimp now!'},
    wantCrab: {zh:'我 要 吃 螃蟹 ！', en:'I want to eat crab!'},   // and last, a crab (螃蟹 just for listening, till you catch one)
    haveCrab: {zh:'螃蟹 ！ 太 好 了 ！', en:'A crab! Wonderful!'}, haveCrabNow: {zh:'我们 有 螃蟹 了 ！', en:'We have crab now!'},
    seaBig: {zh:'海 很 大 ！', en:'The sea is so big!'},   // you, seeing the sea from the shore
    examTime: {zh:'我们 考试 吧 ！', en:'Let’s have an exam!'},   // the teacher, before the feast (考试 just for listening)
    makeRaft: {zh:'我们 来 做 木筏 吧 ！', en:'Let’s make a raft!'},   // the big monkey, after the feast (木筏 just for listening, till it's built)
    waitForYou: {zh:'我们 等 你 ！', en:'We’ll wait for you!'},   // the old monkey, seeing you off
    fishInRiver: {zh:'河 里 有 鱼 ！', en:'There are fish in the river!'},   // the fishing monkey by the stream
    thisRod: {zh:'这 是 鱼竿 。', en:'This is a fishing rod.'},
    tooSmall: {zh:'太 小 了 ！', en:'It’s too small!'},   // you, as you catch a little fish, and let it go
    bigFish: {zh:'鱼 很 大 ！', en:'The fish is so big!'},   // and a big one   // the 老板, come up to the home ground (chapter 1), to open a new shop there
    bossLikesHere: {zh:'这里 很 好 ！', en:'It’s nice here!'},
    sorry: {zh:'对不起 ！', en:'Sorry!'},   // the hungry monkey, sorry for being fussy (draft, not checked yet: see CHINESE.md)
    // The prologue's guide (drafts, not checked yet: see CHINESE.md)
    iamOld: {zh:'我 是 老 猴子 。 这 是 花果山 。', en:'I’m the old monkey. This is Flower Fruit Mountain.'},
    iamBig: {zh:'你好 ！ 我 是 大 猴子 。', en:'Hello! I’m the big monkey.'},   // the big monkey in the meadow, teaching 我
    findMonkeys: {zh:'去 找 猴子 吧 ！', en:'Go and find the monkeys!'},
    hungryWants: {zh:'饿 猴子 要 吃 水果 。', en:'The hungry monkey wants to eat some fruit.'},
    thirstyWants: {zh:'渴 猴子 要 喝 水 。', en:'The thirsty monkey wants to drink some water.'},
    fruitOnTrees: {zh:'水果 在 树 上 。', en:'Fruit grows on the trees.'},
    waterInRiver: {zh:'河 里 有 水 。', en:'There’s water in the river.'},
    findAnimals: {zh:'去 找 动物 吧 ！', en:'Go and find the animals!'},
    bossHasApples: {zh:'老板 有 苹果 。', en:'The shop owner has apples.'},
    birdsInTrees: {zh:'树 上 有 鸟 。', en:'There are birds in the trees.'},
    // Up the stream (drafts, not checked yet: see CHINESE.md)
    whereFrom: {zh:'水 从 哪里 来 ？', en:'Where does the water come from?'},
    snakes: {zh:'山 上 有 蛇 。', en:'There are snakes up the mountain.'},
    snakesInGrass: {zh:'草 里 有 蛇 。', en:'There are snakes in the grass.'},
    waterFromMountain: {zh:'水 从 山 上 来 。', en:'The water comes from up the mountain.'},
    foundFall: {zh:'山 上 有 瀑布 ！', en:'There’s a waterfall up the mountain!'},
    stickHere: {zh:'这 是 棍子 。', en:'This is a stick.'},
    // Chapter 1 (drafts, not checked yet: see CHINESE.md)
    whatBehind: {zh:'瀑布 后面 有 什么 ？', en:'What’s behind the waterfall?'},
    dare: {zh:'谁 跳 进去 ， 谁 就 是 王 ！', en:'Whoever jumps in will be king!'},
    scared: {zh:'我 怕 ！', en:'I’m scared!'},
    inside: {zh:'里面 有 什么 ？', en:'What’s inside?'},
    letsGo: {zh:'太 好 了 ！ 我们 去 看看 ！', en:'Wonderful! Let’s go and see!'},
    haveHome: {zh:'我们 有 家 了 ！', en:'We have a home now!'},   // chapter 1 (drafts, not checked yet: see CHINESE.md)
    bigHere: {zh:'这里 很 大 ！', en:'It’s so big here!'},
    needWood: {zh:'我们 要 木头 和 小 石头 ！', en:'We want wood and small stones!'},   // the big monkey, building the school
    wantWood: {zh:'我们 要 木头 。', en:'We want wood.'},
    wantStones: {zh:'我们 也 要 小 石头 。', en:'We want small stones too.'},
    haveWood: {zh:'木头 ！ 太 好 了 ！', en:'Wood! Wonderful!'},
    haveStones: {zh:'石头 ！ 太 好 了 ！', en:'Stones! Wonderful!'},
    squirrelWood: {zh:'你 要 木头 吗 ？', en:'Do you want wood?'},   // the squirrel in the pine wood
    buildIt: {zh:'我们 来 盖 学校 吧 ！', en:'Let’s build the school!'},   // the big monkey, once the frame is up
    schoolLovely: {zh:'学校 很 好看 ！', en:'The school looks lovely!'},   // and once you know red, yellow and white from its lessons,
    plantFlowers: {zh:'我们 来 种花 吧 ！', en:'Let’s plant some flowers!'},   // he wants flowers in front of it (种花 in one piece: 种 has two readings)
    classStart: {zh:'上课 ！', en:'Class is starting!'},   // at school: the teacher starts a lesson, and the class greets him
    teacherHi: {zh:'老师 好 ！', en:'Hello, teacher!'},
    classHi: {zh:'同学 们 好 ！', en:'Hello, class!'},
    classEnd: {zh:'下课 ！', en:'Class is over!'},
    classmates: {zh:'我们 是 同学 ！', en:'We’re classmates!'},
    weHave: {zh:'我们 有 家 ， 也 有 学校 ！', en:'We have a home, and a school too!'},   // the old monkey's news: time for a feast (teaching 有)
    ourTable: {zh:'这 是 我们 的 大 桌子 ！', en:'This is our big table!'},   // the hungry monkey at the feast's table: what the troop has,
    haveFruit: {zh:'我们 有 桃子 ， 也 有 苹果 ！', en:'We have peaches, and apples too!'},
    noHoney: {zh:'我们 没有 蜂蜜 ！', en:'We don’t have any honey!'},   // and hasn't (teaching 没有; 蜂蜜 just for listening, till the bees)
    wantHoney: {zh:'我 要 吃 蜂蜜 ！', en:'I want to eat honey!'},
    beesInFlowers: {zh:'花 里 有 蜜蜂 ， 也 有 黄蜂 ！', en:'There are bees in the flowers, and wasps too!'},   // the butterfly, as you come into the bees' valley (蜜蜂 and 黄蜂 just for listening)
    findQueen: {zh:'去 找 蜂王 吧 ！', en:'Go and find the queen bee!'},   // the sixth bee you make friends with in their valley (蜂王 just for listening, till you meet her)
    queenAsk: {zh:'你 要 什么 ？', en:'What do you want?'},   // the queen bee, out of her old tree
    wantHoneyUs: {zh:'我们 要 蜂蜜 ！', en:'We want honey!'},   // you, to the queen bee (蜂蜜 just for listening, till the first honey)
    queenYes: {zh:'好 ！ 我们 去 你 家 吧 ！', en:'OK! Let’s go to your home!'},   // the queen bee, won over by her word game (and the cow, won over by its)
    queenHere: {zh:'这里 有 花 ！', en:'There are flowers here!'},   // the queen bee, home by the wildflowers
    haveBees: {zh:'我们 有 蜜蜂 了 ！', en:'We have bees now!'},   // the hungry monkey, once you've brought the bees home
    ourHome: {zh:'这 是 我们 的 家 ！', en:'This is our home!'},   // the queen bee, as the troop finishes her bees' hive
    haveHoney: {zh:'蜂蜜 ！ 太 好 了 ！', en:'Honey! Wonderful!'},   // the hungry monkey, when you bring him honey
    haveHoneyNow: {zh:'我们 有 蜂蜜 了 ！', en:'We have honey now!'},   // and once it's in the bowl on the feast's table
    cowNews: {zh:'山 上 有 牛 ！', en:'There’s a cow on the mountain!'},   // the thirsty monkey's news (牛 just for listening, till you find it)
    cowScared: {zh:'我 怕 狼 ！', en:'I’m scared of wolves!'},   // the cow, lost in the pasture (and at the long grass in the dark pines)
    cowHungry: {zh:'我 饿 了 。', en:'I’m hungry.'},   // the cow, on the south slope, on the way home
    haveGrass: {zh:'草 ！ 太 好 了 ！', en:'Grass! Wonderful!'},   // and as you bring it some
    wantSeeds: {zh:'我们 要 种子 ！', en:'We want seeds!'},   // the big monkey, wanting to grow fruit in a garden
    haveSeeds: {zh:'种子 ！ 太 好 了 ！', en:'Seeds! Wonderful!'},   // and as you bring some
    lookForCow: {zh:'你 找 牛 吗 ？', en:'Are you looking for the cow?'},   // the rabbit by the way through the pasture's pines (drafts, 27 October 2026)
    cowThere: {zh:'牛 在 那里 ！', en:'The cow is over there!'},   // (and it points its ears that way: 那里 just for listening)
    yourHome: {zh:'这 是 你 的 家 ！', en:'This is your home!'},   // you, to the cow, as you lead it into its pen
    cowHasHome: {zh:'我 有 家 了 ！', en:'I have a home now!'},   // the cow, in its pen
    wantMilk: {zh:'我 要 喝 牛奶 ！', en:'I want to drink milk!'},   // the thirsty monkey, as the cow gives you some
    haveMilk: {zh:'牛奶 ！ 太 好 了 ！', en:'Milk! Wonderful!'},   // and when you bring it to him
    haveMilkNow: {zh:'我们 有 牛奶 了 ！', en:'We have milk now!'},
    haveMelonNow: {zh:'我们 有 西瓜 了 ！', en:'We have watermelon now!'},   // the hungry monkey, as the garden's fruit goes on the feast's table
    haveGrapesNow: {zh:'我们 有 葡萄 了 ！', en:'We have grapes now!'},
    haveBananasNow: {zh:'我们 有 香蕉 了 ！', en:'We have bananas now!'},
    // the feast's bowls (27 October 2026): the hungry monkey wants them from the cave, and when you bring them; the big monkey's
    // chopsticks and spoons
    wantBowls: {zh:'我们 要 碗 ！ 碗 在 水帘洞 里 。', en:'We need bowls! The bowls are in the Water Curtain Cave.'},
    haveBowls: {zh:'碗 ！ 太 好 了 ！', en:'Bowls! Wonderful!'},
    haveBowlsNow: {zh:'我们 有 碗 了 ！', en:'We have bowls now!'},
    madeChopsticks: {zh:'我 做 了 筷子 ！', en:'I made chopsticks!'},
    madeSpoons: {zh:'我 做 了 勺子 ！', en:'I made spoons!'},
    cowBelow: {zh:'牛 在 下面 ！', en:'The cow is down below!'},
    fruitBelow: {zh:'水果 在 下面 ！', en:'The fruit is down below!'},   // the goat at the top of the cliffs   // the goat on the south slope, while the cow is lost   // the hungry monkey, at the feast's new table
    makeFood: {zh:'我 要 做 吃 的 ！', en:'I’m going to make something to eat!'},   // the thirsty monkey, at his little dairy (做 just for listening)
    foodReady: {zh:'好 了 ！', en:'It’s ready!'},   // and when what he's made is ready
    // hide and seek with a little monkey (the area's hideSeek): its clues' English leaves the place's word in Chinese ({桌子})
    hideAsk: {zh:'我们 来 捉迷藏 吧 ！', en:'Let’s play hide and seek!'},
    hideCount: {zh:'一 ， 二 ， 三 ， 四 ， 五 ， 六 ， 七 ， 八 ， 九 ， 十 ！', en:'One, two, three, four, five, six, seven, eight, nine, ten!'},   // you, with your eyes covered
    hideComing: {zh:'我 来 了 ！', en:'Here I come!'},
    hideTree: {zh:'我 在 大 树 后面 ！', en:'I’m behind the big {树}!'},
    hideTable: {zh:'我 在 桌子 下面 ！', en:'I’m under the {桌子}!'},
    hideBridge: {zh:'我 在 桥 下面 ！', en:'I’m under the {桥}!'},
    hideWater: {zh:'我 在 水 里 ！', en:'I’m in the {水}!'},
    hideFlowers: {zh:'我 在 花 里 ！', en:'I’m in the {花|flowers}!'},   // (花丛里, in the flowerbed, would be more natural; 花丛 isn't a word in the game)
    hideFound: {zh:'找到 你 了 ！', en:'Found you!'},
    readyRun: {zh:'一 ， 二 ， 三 ， 跑 ！', en:'One, two, three, run!'},   // the teacher, starting a race (PE), with a beat of the big drum
    veryGood: {zh:'很 好 ！', en:'Very good!'},   // and at the finish, however you did (and after the jog)
    letsGoRunning: {zh:'我们 去 跑步 吧 ！', en:'Let’s go running!'},   // his second PE lesson: the class jogs round the track
    count4: {zh:'一 ， 二 ， 三 ， 四 ！', en:'One, two, three, four!'},   // the teacher, counting peaches onto his table (number lessons)
    count5: {zh:'一 ， 二 ， 三 ， 四 ， 五 ！', en:'One, two, three, four, five!'},
    count6: {zh:'一 ， 二 ， 三 ， 四 ， 五 ， 六 ！', en:'One, two, three, four, five, six!'},
    count7: {zh:'一 ， 二 ， 三 ， 四 ， 五 ， 六 ， 七 ！', en:'One, two, three, four, five, six, seven!'},
    count8: {zh:'一 ， 二 ， 三 ， 四 ， 五 ， 六 ， 七 ， 八 ！', en:'One, two, three, four, five, six, seven, eight!'},
    count9: {zh:'一 ， 二 ， 三 ， 四 ， 五 ， 六 ， 七 ， 八 ， 九 ！', en:'One, two, three, four, five, six, seven, eight, nine!'},
    count10: {zh:'一 ， 二 ， 三 ， 四 ， 五 ， 六 ， 七 ， 八 ， 九 ， 十 ！', en:'One, two, three, four, five, six, seven, eight, nine, ten!'},
    howManyPeaches: {zh:'桌子 上 有 几 个 桃子 ？', en:'How many peaches are on the table?'},   // and asking how many there are
    howManyApples: {zh:'桌子 上 有 几 个 苹果 ？', en:'How many apples are on the table?'},
    howManyBowls: {zh:'桌子 上 有 几 个 碗 ？', en:'How many bowls are on the table?'},
    howManyMonkeys: {zh:'这里 有 几 只 猴子 ？', en:'How many monkeys are there?'},
    howManyRabbits: {zh:'这里 有 几 只 兔子 ？', en:'How many rabbits are there?'},
    howManyBirds: {zh:'这里 有 几 只 鸟 ？', en:'How many birds are there?'},
    howManyStones: {zh:'这里 有 几 个 石头 ？', en:'How many stones are there?'},   // the little monkeys at the home ground, counting the stones in their tower with you
    playWater: {zh:'我们 在 玩 水 ！', en:'We’re playing in the water!'},   // the little monkeys splashing in the hillside's brook
    thisBlack: {zh:'这 是 黑色 。', en:'This is black.'},   // the teacher, opening a pot of paint (colour lessons)
    thisBlue: {zh:'这 是 蓝色 。', en:'This is blue.'},
    thisGreen: {zh:'这 是 绿色 。', en:'This is green.'},
    thisBrown: {zh:'这 是 棕色 。', en:'This is brown.'},
    thisOrange: {zh:'这 是 橙色 。', en:'This is orange.'},
    thisPink: {zh:'这 是 粉色 。', en:'This is pink.'},
    thisRed: {zh:'这 是 红色 。', en:'This is red.'},
    thisYellow: {zh:'这 是 黄色 。', en:'This is yellow.'},
    thisWhite: {zh:'这 是 白色 。', en:'This is white.'},
    letsLook: {zh:'我们 看看 ！', en:'Let’s have a look!'},
    great: {zh:'太 好 了 ！', en:'Great!'},
    home: {zh:'这 是 我们 的 家 ！', en:'This is our home!'},
    king: {zh:'你 是 我们 的 王 ！', en:'You are our king!'},
    // counting the troop in, as each monkey comes in: counting, which is where 二 is said (decided 21 October 2026: it
    // was 两只猴子, two monkeys, while the card taught 二; 两, for two of something, is a word of its own, for later)
    count1: {zh:'一 ！', en:'One!'},
    count2: {zh:'一 ， 二 ！', en:'One, two!'},
    count3: {zh:'一 ， 二 ， 三 ！', en:'One, two, three!'},
    tired: {zh:'累 了 吗 ？ 去 床 上 睡觉 吧 ！', en:'Tired? Go and sleep in a bed!'}
  },

  // What happens when you press A beside each character. The game goes down their list and
  // does the first part whose if matches your progress (a part with no if always matches).
  // Steps in a do list:
  //   say       one of the lines above, said by the one you're talking to (or by, another character
  //             nearby). teach makes that word bold; hint, what to do, is a message after it (its first
  //             sentence in bold; an emoji it starts with, such as ✨, big beside it);
  //             showTasks puts your current tasks in the message instead (the hint if there are none)
  //   newWord   a word's new-word card, only if you don't know the word yet (note: a line on it)
  //   card      a word's card, every time (note: a line on it)
  //   set       change what the area remembers, such as {elder:1}
  //   request   the character's request (see requests)
  //   shop      open the area's shop (see shop below)
  //   give      put something in your wardrobe, such as {give:'花'}, with a message afterwards (note)
  //   reply     your reply: you choose what to say from phrases you know, and this is the one that fits
  //             (taught on its own card the first time). What you're answering stays in sight: the line just
  //             said, put in plain English (the phrase's cue in content/words.js: someone says hello, thanks
  //             you…), or else about (what's happening), with pic (a picture), such as a gift. One that doesn't
  //             fit shows why, with the one that does, and your monkey says that one.
  //   bag       put food in your bag (if there's room), with a note saying so
  //   rest      your health is full again
  //   sleep     you sleep (in a bed): the screen goes dark, and you wake with your health full (its text: the message then)
  //   match     match the words you've learned to their pictures (its heading), as at the practice post; stop
  //             is its button to stop, which ends the conversation there (notYet: the message then)
  //   wordGame  offer a word game. ask: the question; word: who you're playing with; win: steps if you win;
  //             notYet: the message if you don't know enough words yet
  //   gap       a sentence to finish by filling the gap: {sentence, en, word}, word being the missing one
  //   stopsYou  a character stops you as you walk past (in an event): a ! pops up over them, you turn to face
  //             them, and they talk to you (their talk here)
  //   scene     one of the area's scenes (scenes, below) plays, told like the opening, then the steps carry on
  //   chapter   a new chapter begins: its title card, and its part of the checklist from then on
  //   follow    characters follow you, in line, like Pikachu in Pokémon Yellow, such as {follow:['playful', 'big']}
  //             (the first right behind you); {follow:[]} and they stop, going to their places (see moves)
  //   message   a line of English, such as what's happening: in a conversation it waits in the speech
  //             box until you press A; anywhere else it's a message at the bottom of the screen
  // In an if: elder:0 checks what the area remembers; new:'猴子' is true while you don't know
  // a word yet, knows:'朋友' once you do; a counter, such as newWords:{below:4} or {atLeast:4}.
  talk: {
    crab1: CRAB_TALK, crab2: CRAB_TALK, crab3: CRAB_TALK,   // the crabs on the shore (CRAB_TALK, above)
    // the fishing monkey by the stream (chapter 1): once the hungry monkey wants a big fish, a rod for you
    fisher: [
      {if:{fish:'asked', fishing:0}, do:[{say:'fishInRiver'}, {say:'thisRod', teach:'鱼竿'}, {newWord:'鱼竿', note:'A bamboo fishing rod, with a line, a float and a hook.'},
        {set:{fishing:1}}, {message:'The fishing monkey gives you a {鱼竿}! Stand by the stream, face the water, and press A to fish.'}]},
      {if:{fishing:{atLeast:1}}, do:[{say:'fishInRiver', hint:'Face the water and press A to fish. The {老板} sells {鱼饵|bait}: with some in your bag, a big fish bites next.'}]},
      {do:[{say:'fishInRiver'}]}
    ],
    elder: [
      {if:{elder:0}, do:[
        {say:'hi', teach:'你好'},
        {newWord:'你好'},
        {reply:'你好'},
        {say:'iamOld'},
        {message:'Every baby monkey explores the mountain to find out what things are called. Today it’s your turn!'},
        {say:'go', hint:'✨ Things that sparkle have words. Walk up to one and press A. Learn 4, then come back to the old monkey.'},
        {set:{elder:1}}
      ]},
      {if:{elder:1, newWords:{below:4}}, do:[
        {say:'go', hint:'✨ Learn 4 words first, then come back ({newWords}/4). Things that sparkle have words: walk up to one and press A.'}
      ]},
      {if:{elder:1}, do:[
        {message:'You’re back! The old monkey wants to hear which words you’ve learned.'},   // (decided 25 October 2026: 我们看看！ on its own said nothing of why)
        {say:'letsLook'},   // he checks your first words: you match them to their pictures
        {match:'Show the old monkey your words', stop:'Not now', notYet:'Come back to the old monkey when you’re ready to show him your words.'},
        {say:'great'},
        {say:'animals', teach:'动物', hint:'Animals live in rustling grass, out in the open, up a tree and on the cliffs to the south.'},
        {newWord:'动物', note:'There are {animals} different animals on the mountain. Can you find them all?'},
        {message:'The old monkey wants you to learn the words for the meadow too: {left:meadowWords}. Things that sparkle ✨ have words.', if:{meadowWords:{below:5}}},
        {say:'findMonkeys'},
        {message:'Some of the troop need help too. A ! over a monkey means it wants something. If you forget what to do, press TASKS. MENU shows the words you’ve learned.'},
        {set:{elder:2}}
      ]},
      // the prologue: once you've learned the five words for the meadow he asked for, he checks them, as he did your first
      // words (decided 30 October 2026, after measuring the game's pacing: the meadow's words came with no questions between)
      {if:{elder:2, chapter:0, gate:false, meadowWords:5, meadowCheck:0}, do:[
        {message:'You know all the words for the meadow! The old monkey wants to hear them.'},
        {say:'letsLook'},
        {match:'Show the old monkey the meadow’s words', words:['山', '河', '树', '鱼', '鸟'], stop:'Not now', notYet:'Come back to the old monkey when you’re ready to show him the meadow’s words.'},
        {say:'great'}, {set:{meadowCheck:1}}
      ]},
      // up the stream. Where does the water come from? You go alone, find the waterfall,
      // and come back to tell the troop, who follow you up.
      {if:{story:false, gate:true, climb:0}, do:[
        {say:'whereFrom', by:'playful'},
        {say:'snakes'},
        {message:'The path up beside the river is wild, and nobody has been to the top. Someone brave should go and see where the water comes from.'},
        {set:{climb:1}},
        {say:'bye'},
        {reply:'再见'},   // goodbye, as you set off (taught here, 19 October 2026: it means more now you're leaving)
        {message:'You set off for the path, on your own.'}   // (the big monkey stops you on the way, with a stick: its own new word)
      ]},
      {if:{hurt:true}, do:[{rest:true}, {message:'You rest with the old monkey. Your health is full again.'}]},
      {if:{story:false, climb:1}, do:[{say:'go', hint:'Follow the path up beside the river, and find where the water comes from.'}]},
      {if:{story:false, climb:2}, do:[
        {say:'foundFall', by:'player'},
        {say:'letsGo'},
        {set:{climb:3}},
        {follow:['playful', 'big', 'elder']},   // the little monkey keenest, right behind you; the old monkey at the back
        {message:'The troop follows you. Lead them up the mountain path to the waterfall!'}
      ]},
      {if:{climb:3}, do:[{say:'letsGo', hint:'Lead the way up the mountain path to the waterfall.'}]},   // following you up
      // before the story at the waterfall: he checks in on what the troop has asked you for, or sends you off to find who needs help
      {if:{story:false, hungry:'asked'}, do:[{say:'hungryWants'}]},
      {if:{story:false, thirsty:'asked'}, do:[{say:'thirstyWants'}]},
      {if:{story:false, hungry:'not asked'}, do:[{say:'findMonkeys', hint:'Look for a monkey with a ! over its head.'}]},
      {if:{story:false, thirsty:'not asked'}, do:[{say:'findMonkeys', hint:'Look for a monkey with a ! over its head.'}]},
      // after the story: the dare at the waterfall, then telling him what's inside
      {if:{story:true, cave:0}, do:[
        {say:'whatBehind'},
        {say:'dare', by:'big', teach:'跳'},
        {newWord:'跳'},
        {say:'scared', by:'playful'},
        {message:'Everyone looks at you.'},
        {set:{cave:1}}
      ]},
      {if:{cave:1}, do:[{say:'dare', by:'big', hint:'Jump through the waterfall!'}]},
      // you tell him what's inside, a sentence for each of the three things you found there (decided 26 October 2026, after
      // measuring the game's pacing: from the dare to becoming king, 10 new words came with just 7 questions)
      {if:{cave:2, caveThings:3}, do:[
        {say:'inside'},
        {gap:{sentence:'里面 有 床', en:'There are beds inside.', word:'床'}},
        {gap:{sentence:'里面 有 桌子', en:'There is a table inside.', word:'桌子'}},
        {gap:{sentence:'里面 有 碗', en:'There are bowls inside.', word:'碗'}},
        {say:'letsGo'},
        {set:{cave:3}},
        {follow:['elder', 'big', 'playful', 'doorway']}   // the troop follows you, to jump in after you
      ]},
      {if:{cave:2}, do:[{say:'go', hint:'Look around the cave first.'}]},
      {if:{cave:3}, do:[{say:'letsGo', hint:'Lead the way: jump through the waterfall.'}]},
      // the troop moves in. One new word each time you talk to him.
      {if:{cave:4}, do:[{say:'home', teach:'家'}, {newWord:'家'}, {set:{cave:5}}]},
      {if:{cave:{atLeast:5}, count:0}, do:[{message:'A monkey comes in through the water curtain.'}, {say:'count1', teach:'一'}, {newWord:'一'}, {set:{count:1}}]},
      {if:{cave:{atLeast:5}, count:1}, do:[{message:'Another monkey comes in.'}, {say:'count2', teach:'二'}, {newWord:'二'}, {set:{count:2}}]},
      {if:{cave:{atLeast:5}, count:2}, do:[{message:'And another!'}, {say:'count3', teach:'三'}, {newWord:'三'}, {set:{count:3}}, {message:'The whole troop is home.'}]},
      // the whole troop is home: the next time you talk to him, the prologue ends with the troop making you king (a scene,
      // told like the opening; as in the book, they move in, then make him king), and chapter 1 begins (its title card).
      // (It came straight after the third monkey until 22 October 2026: 三 and 王 in one go.)
      // (waits: 4 questions after the last new word, 三, so it isn't straight after counting the troop in: a quick word game
      // with him first, decided 30 October 2026)
      {if:{chapter:0, count:3}, waits:true, do:[{scene:'becomingKing'}, {newWord:'王', note:'The troop names you 美猴王 (Měi Hóuwáng · Handsome Monkey King)!'}, {set:{cave:6}}, {chapter:1}]},
      // chapter 1: at school, he's the teacher. The first time you talk to him there, the class greets him the way children
      // in China do; after that, he gives you a lesson whenever you like (he has a ! when words need practice).
      {if:{school:1}, waits:true, do:[
        {message:'The little monkeys are sitting at their desks. The old monkey stands at the front: he’s their teacher now!'},
        {say:'classStart'},
        {say:'teacherHi', by:'playful', teach:'老师'},
        {newWord:'老师', note:'The class greets the old monkey: he’s their teacher now.'},
        {say:'classHi'},
        {set:{school:2}},
        {message:'Lessons are where you practise your words now. Talk to the teacher, or look at the timetable on the wall, to choose one.'}
      ]},
      // once the first two lessons have taught you 四 五 六 and 红色 黄色 白色, he has news, before any lesson: the troop has a
      // home, and a school too (teaching 有), so it's time for a great feast (decided 24 October 2026: after the first two
      // lessons, so chapter 1 opens up; it waited till the flowers were planted, after every lesson)
      // chapter 1's end: seeing you off on the shore; at the feast's table, ready for it
      {if:{raft:{atLeast:1, below:3}}, do:[{say:'waitForYou'}]},
      {if:{exam:1, feastHeld:0}, do:[{say:'great'}]},
      {if:{school:{atLeast:2}, feast:0, numbersKnown:{atLeast:3}, coloursKnown:{atLeast:3}}, waits:true, do:[
        {say:'weHave', teach:'有'},
        {newWord:'有', note:'Use 有 to say what you have. (要 is for what you want.)'},
        {set:{feast:1}},
        {message:'Time for a great feast, for the whole troop! It will be at a big {桌子|table} under the big {树|tree}, in the middle of the home ground.'}
      ]},
      // chapter 1: once every food is on the feast's tables, the exam (the area's word test), before the feast
      {if:{crabTable:{atLeast:1}, exam:0}, do:[{say:'examTime'}, {exam:true}, {set:{exam:1}}, {say:'veryGood'}, {shells:10, note:'Your certificate goes up on the classroom wall! +10 🐚'},
        {message:'The troop is getting ready for the feast! Go to the big {树} in the middle of the home ground.'}]},
      {if:{school:{atLeast:2}}, do:[{say:'classStart'}, {lesson:true}, {say:'classEnd'}]},
      // chapter 1: the troop's new home ground, beside the waterfall. He tells you about it, then follows you there.
      {if:{chapter:1, home:0}, do:[
        {say:'haveHome'},
        {message:'The troop loves the cave. Now they dream of more: somewhere to learn, to trade and to grow things.'},
        {message:'The big monkey and the little monkey have cleared a way beside the waterfall, to a wide open space. The old monkey wants to see it with you!'},
        {set:{home:1}},
        {follow:['elder']}
      ]},
      {if:{home:1}, do:[{say:'letsGo', hint:'Lead the way: out of the cave, then along beside the waterfall.'}]},   // following you there
      {if:{home:2}, do:[{say:'bigHere', hint:'First, the troop wants to build a school.'}]},
      {do:[{say:'hi', showTasks:true, hint:'Keep exploring, little monkey.'}, {reply:'你好'}]}
    ],
    playful: [
      {if:{raft:{atLeast:1, below:3}}, do:[{say:'bye'}]},   // (seeing you off, on the shore, at the end of chapter 1)
      {if:{school:{atLeast:2}, new:'同学'}, waits:true, do:[{say:'classmates', teach:'同学'}, {newWord:'同学', note:'The little monkeys at school with you.'}]},
      {if:{school:{atLeast:2}}, do:[{say:'classmates'}]},
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      {if:{new:'猴子'}, do:[{say:'iam', teach:'猴子'}, {newWord:'猴子'}]},
      // your friend now, it wants to play a word game straight away (decided 26 October 2026, after measuring the game's
      // pacing: the meadow taught 22 words with just two questions between them), with a present the first time you win; say
      // Not now, and it has a ! till you've played (bubbles)
      {if:{new:'朋友'}, do:[{say:'weFriends', teach:'朋友'}, {newWord:'朋友', note:'The little monkey is your friend now.'}, {say:'play'},
        {wordGame:{ask:'Play a word game with this little monkey? If you win, it gives you 2 🐚.', word:'猴子', notYet:'Learn a few more words first, then come back to play.',
          win:[{say:'great'}, {set:{littleGame:2}}, {shells:2, note:'The little monkey gives you 2 🐚.'}], lost:[{set:{littleGame:1}}]}}]},
      {if:{climb:3}, do:[{say:'letsGo'}]},   // following you up to the waterfall
      {if:{story:true, cave:{below:3}}, do:[{say:'scared'}]},
      {if:{littleGame:{below:2}}, do:[{say:'play'},   // its word game again, till you've won its present
        {wordGame:{ask:'Play a word game with this little monkey? If you win, it gives you 2 🐚.', word:'猴子', notYet:'Learn a few more words first, then come back to play.',
          win:[{say:'great'}, {set:{littleGame:2}}, {shells:2, note:'The little monkey gives you 2 🐚.'}], lost:[{set:{littleGame:1}}]}}]},
      {do:[{say:'play'}, {wordGame:{ask:'Play a word game with this little monkey?', word:'猴子', notYet:'Learn a few more words first, then come back to play.'}}]}
    ],
    boss: [
      {if:{raft:{atLeast:1, below:3}}, do:[{say:'bye'}]},   // (seeing you off, on the shore, at the end of chapter 1)
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      {if:{new:'老板'}, do:[{say:'boss', teach:'老板'}, {newWord:'老板', note:'The {老板} owns the shop. Come back to see what they sell.'}, {reply:'你好'}]},
      // chapter 1: come up to the home ground, he likes it there, and the troop builds him a new shop, as you watch: its plot
      // marked out by the way in, then its posts, counter, striped roof, and what he sells (decided 29 October 2026)
      {if:{shop:1}, do:[{say:'bossCame'}, {say:'bossLikesHere'},
        {message:'The {老板} wants his new shop here, by the way in, where every monkey goes past. The troop comes to build it!'},
        {markOut:{shop:2}}, {setUp:{shop:3}}, {say:'great'},
        {message:'The {老板}’s new shop! He sells {头带|headbands} in every colour you know, and food for your bag. Talk to him to buy something.'}]},
      {do:[{shop:true}]}
    ],
    hungry: [
      {if:{raft:{atLeast:1, below:3}}, do:[{say:'bye'}]},   // (seeing you off, on the shore, at the end of chapter 1)
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      {if:{hungry:'not asked'}, do:[{request:'hungry'}, {say:'fruitOnTrees'}]},
      {if:{hungry:'asked', holding:{hungry:false}, wanted:{hungry:false}}, do:[{request:'hungry'}, {say:'fruitOnTrees'}]},
      // once he's eaten, he says sorry for being so fussy, and you say it doesn't matter: 没关系, heard when you said sorry, to say now;
      // then he wants to play a word game (decided 26 October 2026, after measuring the game's pacing: the meadow taught 22
      // words with just two questions between them), with a present the first time you win; say Not now, and he has a ! till
      // you've played (bubbles)
      {if:{hungry:'done', new:'没关系'}, do:[{message:'The hungry monkey looks a little embarrassed about being so fussy.'}, {say:'sorry'}, {reply:'没关系'}, {say:'play'},
        {wordGame:{ask:'Play a word game with the hungry monkey? If you win, you get a {桃子} for your bag.', word:'猴子', notYet:'Learn a few more words first, then come back to play.',
          win:[{say:'great'}, {set:{hungryGame:2}}, {bag:'桃子', note:'The hungry monkey gives you a {桃子} for your bag.'}], lost:[{set:{hungryGame:1}}]}}]},
      // a game that helped him before he taught 水果 as he asked (24 October 2026), and never learned it at a fruit tree
      {if:{hungry:'done', new:'水果'}, do:[{say:'fruitOnTrees', teach:'水果'}, {newWord:'水果', note:'Peaches and apples are both fruit.'}]},
      // chapter 1: by the feast's tables, set out bare: they need bowls, and the troop's are in the cave (the bowls request);
      // you bring them, and they go on the tables (events)
      {if:{feast:2, bowls:'not asked'}, do:[{say:'ourTable'}, {request:'bowls'}]},
      {if:{feast:2, bowls:'asked'}, do:[{request:'bowls'}]},
      // then, once the bowls and the big monkey's chopsticks are on them, he tells you what the troop has for the feast, and
      // what it hasn't: no honey (teaching 没有, don't have), which he'd love to eat
      {if:{feast:2, tableware:{atLeast:2}}, waits:true, do:[
        {say:'ourTable'},
        {say:'haveFruit'},
        {say:'noHoney', teach:'没有'},
        {newWord:'没有', note:'Use 没有 to say what you don’t have.'},   // (ending on it: 我要… straight after sounded too like it)
        {set:{feast:3, bees:1}},   // and the bees begin: the troop clears the way east (the bushes at the end of the road)
        {message:'There’s no honey for the feast! Honey comes from bees: the troop has cleared a way east, along the stream, to find them. Follow the road east!'}
      ]},
      {if:{fish:'asked', holding:{fish:true}}, do:[{request:'fish'}]},   // you've caught him a big fish
      // you've brought the bees home: he's thrilled (the hive, and honey for the feast, are step 5)
      {if:{bees:6}, do:[{say:'haveBees'}, {set:{bees:7}}, {message:'The bees need a home: the troop is going to build them a hive, by the wildflowers. Go and see!'}]},
      {if:{bees:10}, do:[{request:'honey'}]},   // honey for the feast, from the hive: asked as the bees move in
      // a big fish for the feast (decided 29 October 2026), once the honey's on its table: the fishing monkey by the stream
      // has a rod for you
      {if:{bees:{atLeast:11}, fish:'not asked'}, do:[{say:'haveHoneyNow'}, {request:'fish'}]},
      {if:{fish:'asked'}, do:[{request:'fish'}]},
      // then, with the fish on its table, three shrimp, from the clear shallows of the riverside's brook
      {if:{fishTable:{atLeast:1}, shrimp:'not asked'}, do:[{request:'shrimp'}]},
      {if:{shrimp:'asked'}, do:[{request:'shrimp'}]},
      // and last, with the shrimp on the table, a crab, from the shore below the meadow
      {if:{shrimpTable:{atLeast:1}, crab:'not asked'}, do:[{request:'crab'}]},
      {if:{crab:'asked'}, do:[{request:'crab'}]},
      {if:{bees:{atLeast:11}}, do:[{say:'haveHoneyNow'}]},
      // a game that heard what the feast needs before the bees came (25 October 2026): he sends you to find them now
      {if:{feast:{atLeast:3}, bees:0}, do:[{say:'wantHoney'}, {set:{bees:1}},
        {message:'Honey comes from bees: the troop has cleared a way east, along the stream, to find them. Follow the road east!'}]},
      {if:{bees:{atLeast:7}}, do:[{say:'haveBees'}]},
      {if:{feast:{atLeast:3}}, do:[{say:'wantHoney', hint:'Honey comes from bees: follow the road east, along the stream, to find them. Press A at the big {桌子} to see what the feast still needs.'}]},
      {if:{hungry:'done', hungryGame:{below:2}}, do:[{say:'play'},   // his word game again, till you've won its present (after the feast's story, which comes first)
        {wordGame:{ask:'Play a word game with the hungry monkey? If you win, you get a {桃子} for your bag.', word:'猴子', notYet:'Learn a few more words first, then come back to play.',
          win:[{say:'great'}, {set:{hungryGame:2}}, {bag:'桃子', note:'The hungry monkey gives you a {桃子} for your bag.'}], lost:[{set:{hungryGame:1}}]}}]},
      {do:[{request:'hungry'}]}
    ],
    thirsty: [
      {if:{raft:{atLeast:1, below:3}}, do:[{say:'bye'}]},   // (seeing you off, on the shore, at the end of chapter 1)
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      {if:{thirsty:'not asked'}, do:[{request:'thirsty'}, {say:'waterInRiver'}]},
      {if:{thirsty:'asked', holding:{thirsty:false}}, do:[{request:'thirsty'}, {say:'waterInRiver'}]},
      // you bring him water, and then he wants to play a word game, as the hungry monkey does (decided 30 October 2026, after
      // measuring the game's pacing: 喝, 鱼, 水 and 要 came with one question between them), with a present the first time you win
      {if:{thirsty:'asked', holding:{thirsty:true}}, do:[{request:'thirsty'}, {say:'play'}, THIRSTY_GAME]},
      // chapter 1: once the feast's quests begin, he's by the road at the home ground (moves), with news: there's a cow on the
      // mountain (牛, just for listening till you find it), lost and all alone in a pasture beyond the pines, where wolves
      // live; the troop clears the bushes at the south end of the path, past the bridge, so you can go and find it
      {if:{feast:{atLeast:3}, cow:0}, do:[{say:'cowNews'}, {set:{cow:1}},
        {message:'He heard a cow mooing beyond the pines, while he was looking for fresh water. It’s lost and all alone, and wolves live in those pines!'},
        {message:'The troop has cleared a way south, over the bridge at the bottom of the home ground. Go and find the cow!'}]},
      {if:{cow:{atLeast:1, below:3}}, do:[{say:'cowNews', hint:'Go south, over the bridge at the bottom of the home ground, and through the pines, to find the lost cow.'}]},
      {if:{cow:3}, do:[{say:'cowNews', hint:'You found the cow by its spring, in the pasture. Win its trust with its word game, and it will follow you home.'}]},
      {if:{cow:4, cowWaits:'grass'}, do:[{say:'cowNews', hint:'The cow is waiting for you by the long grass in the dark pines: go first, and chase the wolves off!'}]},
      {if:{cow:4, cowWaits:'slope'}, do:[{say:'cowNews', hint:'The cow is waiting for you on the south slope, hungry: pick it some fresh grass by the brook.'}]},
      {if:{cow:4}, do:[{say:'cowNews', hint:'The cow ran back to its spring in the pasture: go and fetch it, then lead it home past the wolves.'}]},   // (it ran back: leading it home, you'd meet him first, by the road)
      // home with the cow: the troop builds it a home as you watch, by the road: its plot marked out, then its pen, a piece at
      // a time (the fences, with the gate facing the road, a shelter with hay, and a trough of fresh water fed by a bamboo
      // pipe, his idea), and it follows you to its gate
      {if:{cow:5}, do:[
        {message:'The troop is ready to build the {牛} a safe home of its own, here by the road. Watch!'},
        {markOut:{cow:6}}, {follow:['cow']}, {setUp:{cow:7}},   // (it follows you from now: once you walk, it's behind you)
        {message:'A safe home for the {牛}: a fence with a gate, a shelter with hay, and a trough of fresh water, fed by a bamboo pipe (the thirsty monkey’s idea). Lead the {牛} in through its gate!'}]},
      {if:{cow:7}, do:[{say:'great', hint:'Lead the cow in through the gate of its new home!'}]},
      {if:{cow:8}, do:[{request:'milk'}]},   // the cow's milk, its thank-you: he'd love to drink some
      // the little dairy (the game's owner's idea, 26 October 2026): once the milk is on the feast's table, he takes some to a
      // little table under a thatched roof, beside the pen, set up as you watch, to make something from it: ready once
      // you've answered 8 more questions (dairyWait), yoghurt (酸奶), then the same again for cheese (奶酪)
      {if:{milkTable:{atLeast:1}, dairy:0}, do:[
        {message:'The thirsty monkey takes some of the {牛奶} to a little table by the pen. The troop sets it up for him, under a thatched roof.'},
        {countFrom:'dairyTurn'}, {setUp:{dairy:1}}, {say:'makeFood'},
        {message:'He’s making something from the {牛奶}! Practise your words (8 questions, anywhere), then come back and see what it is.'}]},
      {if:{dairy:1}, do:[{say:'makeFood', hint:'Practise your words, then come back and see what he’s making: {dairyWait} of 8 questions done.'}]},
      {if:{dairy:2}, do:[{say:'foodReady'}, {setUp:{dairy:3}},
        {newWord:'酸奶', met:true, note:'The milk has gone thick and sour: the thirsty monkey has made yoghurt!'},
        {countFrom:'dairyTurn'}, {say:'makeFood'},
        {message:'Some of the {酸奶} is for the feast. Now he’s making something else from the {牛奶}: practise, then come back and see what it is!'}]},
      {if:{dairy:3}, do:[{say:'makeFood', hint:'Practise your words, then come back and see what he’s making now: {dairyWait} of 8 questions done.'}]},
      {if:{dairy:4}, do:[{say:'foodReady'}, {setUp:{dairy:5}},
        {newWord:'奶酪', met:true, note:'Cheese! The thirsty monkey has made it from the cow’s milk too.'},
        {message:'Some of the {奶酪} is for the feast too.'}]},
      {if:{dairy:{atLeast:5}}, do:[{say:'great', hint:'The feast has milk, yoghurt and cheese now, from your friend the cow!'}]},
      {if:{cow:{atLeast:9}}, do:[{say:'great', hint:'The cow is safe and happy in its new home, and the feast has its milk!'}]},
      {if:{thirsty:'done', thirstyGame:{below:2}}, do:[{say:'play'}, THIRSTY_GAME]},   // his word game again, till you've won its present
      {do:[{request:'thirsty'}]}
    ],
    // chapter 1: the cow, lost and all alone in the pasture, by its spring. You find it (its word, said straight away as you
    // meet it, as an animal's is: met), and it tells you it's scared of the wolves in the pines
    // Then, to win its trust, its word game (a heart for each right answer, three questions, as an animal's): win, and it
    // says 好！我们去你家吧！ (the queen bee's line), and follows you home, back through the pines (Not now, or lose, and it
    // has a ! till you've won it). Lose a battle on the way, and it runs back to its spring (battles' afterLoss): talk to it,
    // and it follows you again. Home, it stays by the thirsty monkey (events), till the troop has built it a home by the road
    // (his talk) and you lead it in (events); there, it says 我有家了！ (I have a home now!).
    // the rabbit by the way through the pasture's pines: it saw the cow go by; win its word game, and it tells you which way
    pastureRabbit: [
      {if:{cow:{below:3}, rabbitTold:0}, do:[{say:'lookForCow'},
        {wordGame:{ask:'The {兔子} saw which way the cow went! Play a word game with it, and it will show you?', word:'兔子', notYet:'Learn a few more words first, then come back to play.',
          win:[{set:{rabbitTold:1}}, {say:'cowThere'}, {message:'The {兔子} points its long ears south, past the long grass, towards the big rocks: that’s the way the cow went!'}]}}]},
      {if:{cow:{below:3}}, do:[{say:'cowThere', hint:'The {兔子} points its long ears south, past the long grass, towards the big rocks.'}]},
      {do:[{say:'hi'}]}
    ],
    cow: [
      {if:{cow:{below:3}}, do:[
        {newWord:'牛', met:true, note:'A cow, lost and all alone, by the spring. It looks up at you, trembling.'}, {set:{cow:3}},
        {say:'cowScared'},
        {wordGame:{ask:'The {牛} is too scared of the wolves to go anywhere. Play a word game with it, to win its trust? Win, and it follows you home.',
          word:'牛', notYet:'Learn a few more words first, then come back to play.',
          win:[{say:'queenYes'}, {set:{cow:4}}, {follow:['cow']}, {message:'The {牛} trusts you, and follows you! Lead it home to the thirsty monkey, back through the pines. Watch out for wolves!'}]}}
      ]},
      {if:{cow:3}, do:[
        {say:'cowScared'},
        {wordGame:{ask:'The {牛} is too scared of the wolves to go anywhere. Play a word game with it, to win its trust? Win, and it follows you home.',
          word:'牛', notYet:'Learn a few more words first, then come back to play.',
          win:[{say:'queenYes'}, {set:{cow:4}}, {follow:['cow']}, {message:'The {牛} trusts you, and follows you! Lead it home to the thirsty monkey, back through the pines. Watch out for wolves!'}]}}
      ]},
      {if:{cow:4, cowWaits:'grass'}, do:[{say:'cowScared'}, {message:'The {牛} won’t go into the long grass: wolves hide in it! Go first, and chase them off.'}]},   // (waiting by the long grass)
      {if:{cow:4, cowWaits:'slope'}, do:[{request:'cowFood'}]},   // (hungry, on the south slope: give it the grass you've picked)
      {if:{cow:4, following:{cow:false}}, do:[{say:'queenYes'}, {follow:['cow']}, {message:'The {牛} follows you again. Lead it home to the thirsty monkey!'}]},   // (after it ran back to its spring)
      {if:{cow:4}, do:[{say:'queenYes'}]},   // following you home
      {if:{cow:7, following:{cow:false}}, do:[{sound:'moo'}, {follow:['cow']}, {message:'The {牛} follows you. Lead it in through the gate of its new home!'}]},   // (its home is built)
      {if:{cow:{atLeast:8}}, do:[{sound:'moo'}, {say:'cowHasHome'}]},   // in its home, safe and happy
      {do:[{sound:'moo'}, {message:'The {牛} munches the grass by the road, safe from the wolves, waiting for a home of its own.'}]}   // home, waiting for its own
    ],
    boar: [{do:[{battle:'boar', win:[{set:{boar:1}}, {message:'The way to the top is clear.'}]}]}],
    // chapter 1: the queen bee, out of her old tree. You meet her (her word, said straight away as she's met, as an animal's
    // is: met), she asks what you want, you say honey, and to win her over you play her big word game: six questions, two
    // of them sentences; three wrong, and she buzzes back into her tree, to try again. Win, and she and her swarm follow
    // you home (the swarm out of the tree), where they fly to the wildflowers (events).
    queen: [
      {if:{bees:4}, do:[
        {newWord:'蜂王', met:true, note:'The queen bee buzzes out of her old tree, her little crown glinting!'},
        {say:'queenAsk'},
        {say:'wantHoneyUs', by:'player'},
        {wordGame:{ask:'Play a word game with the {蜂王} to win her over? Six questions: three wrong, and she flies back into her tree.', word:'蜂王', questions:6, misses:3, gaps:2,
          lose:'The {蜂王} buzzes back into her old tree. Press A at the tree to try again!', notYet:'Learn a few more words first, then come back to play.',
          win:[{say:'queenYes'}, {set:{bees:5}}, {follow:['queen', 'beeSwarm']}, {leap:'beeSwarm', from:[26, 4]}, {sound:'buzz'},
            {message:'The queen bee and her swarm follow you! Lead them home, back along the riverside.'}],
          lost:[{leap:'queen', to:[25, 4]}, {set:{queenOut:false}}]}}
      ]},
      {if:{bees:5}, do:[{say:'queenYes'}, {follow:['queen', 'beeSwarm']}]},   // (on the way home with you)
      // home, once you've told the hungry monkey: the troop builds the bees a hive, right by the wildflowers, as you watch (its
      // plot marked out, with its sign, then the hive set up a piece at a time; decided 25 October 2026 to start as you talk to
      // her, not as you come near, so the plot is in sight); she says it's their home, and she and her swarm fly in. The hungry
      // monkey has wanted honey for the feast since its list said 我们没有蜂蜜。: his request is asked (take some from the hive)
      {if:{bees:7}, do:[{say:'queenHere'}, {message:'The troop comes over to build the bees a hive, right here by the wildflowers!'},
        {markOut:{bees:8}}, {setUp:{bees:9}}, {say:'ourHome'}, {sound:'buzz'},
        {leap:'queen', to:[28, 4]}, {leap:'beeSwarm', to:[28, 4]}, {set:{bees:10, honey:'asked'}},
        {message:'The queen bee and her swarm fly into their new hive. Take some honey from it, for the hungry monkey’s feast!'}]},
      {do:[{say:'queenHere'}]}   // home, by the wildflowers
    ],
    beeSwarm: [{do:[{sound:'buzz'}, {message:'A swarm of bees, buzzing round their queen.'}]}],
    guide: [{do:[{say:'beesInFlowers'}]}],   // (the butterfly at the bees' valley's way in, only there as it tells you about it)
    // the monkey by the cave's entrance: sleep in a bed to get your health back
    doorway: [
      {if:{new:'睡觉'}, do:[{say:'tired', teach:'睡觉'}, {newWord:'睡觉', note:'Sleep in a {床} and your health is full again.'}]},
      {do:[{say:'tired', hint:'Face a {床} and press A to sleep. You wake up with your health full.'}]}
    ],
    rabbit: [{do:[{say:'snakesInGrass'}, {message:'When something attacks, listen for where it comes from, and pick it to jump aside.'}]}],
    sheep: [{do:[{say:'waterFromMountain'}]}],   // at the fork: follow the river up
    // the squirrel and the goat on the way up the stream want to play: a word game, with a present if you win (fruit for your
    // bag), till you've won it; then their games are just for practice, earning nothing, as the little monkeys in training's
    // (decided 24 October 2026: they gave their fruit every time you won)
    squirrel: [
      {if:{squirrelPlayed:{below:2}}, do:[{say:'play'}, {set:{squirrelPlayed:1}}, {wordGame:{ask:'Play a word game with the {松鼠}? If you win, it gives you a {桃子}.', word:'松鼠',
        notYet:'Learn a few more words first, then come back to play.', win:[{set:{squirrelPlayed:2}}, {bag:'桃子', note:'The {松鼠} gives you a {桃子} for your bag.'}, {reply:'谢谢', about:'The {松鼠} gives you a {桃子}.', pic:'桃子'}]}}]},
      {do:[{say:'play'}, {wordGame:{ask:'Play a word game with the {松鼠}, just for practice?', word:'松鼠', practice:true, notYet:'Learn a few more words first, then come back to play.'}}]}
    ],
    // the squirrel in the pine wood (chapter 1) shows you the dry pines; it loves the pines, as its name says
    woodSquirrel: [
      {if:{new:'木头'}, do:[{say:'hi'}, {reply:'你好'}, {say:'squirrelWood'}, {set:{woodSquirrel:1}},
        {message:'The squirrel points its nose at the grey, dead pines. Their wood is dry: one hit with your stick, and down they come!'},
        {message:'Its tail twitches. Wolves live in the long grass, and every way through the wood goes through it. Eating a {桃子} in a fight brings back some health: pick some at the home ground.'}]},
      {do:[{say:'hi'}, {reply:'你好'}, {message:'The squirrel loves the pine wood. Its name, {松鼠}, means pine mouse!'}]}
    ],
    goat: [
      {if:{goatPlayed:{below:2}}, do:[{say:'play'}, {set:{goatPlayed:1}}, {wordGame:{ask:'Play a word game with the {山羊}? If you win, it gives you a {苹果}.', word:'山羊',
        notYet:'Learn a few more words first, then come back to play.', win:[{set:{goatPlayed:2}}, {bag:'苹果', note:'The {山羊} gives you a {苹果} for your bag.'}, {reply:'谢谢', about:'The {山羊} gives you a {苹果}.', pic:'苹果'}]}}]},
      {do:[{say:'play'}, {wordGame:{ask:'Play a word game with the {山羊}, just for practice?', word:'山羊', practice:true, notYet:'Learn a few more words first, then come back to play.'}}]}
    ],
    // the goat below the waterfall: the way down is quicker, hopping down the banks that sent you round on the way up
    ledgeGoat: [
      {if:{ledgeTip:0}, do:[{say:'hi'}, {reply:'你好'},
        {message:'Going down is quicker! You can hop down the grassy banks in the cliffs: just walk off the edge. You can’t climb back up them, though.'},
        {set:{ledgeTip:1}}]},
      {do:[{say:'hi'}, {reply:'你好'}, {message:'Going down the mountain? Hop down the grassy banks: it’s quicker.'}]}
    ],
    // the little monkeys in training on the hillside: a word game, the first time when they stop you, with a present if you
    // win (shells, or a peach for your bag, handy against the pine wood's wolves), till you've won it; then their games are
    // just for practice, earning nothing (decided 24 October 2026: they gave it every time you won, and a ! stayed over them
    // whenever your words needed practice, so you could play again and again for shells and peaches)
    trainee1: [
      {if:{trainee1:0}, do:[{set:{trainee1:1}}, {say:'hi'}, {reply:'你好'},
        {message:'This little monkey is practising with a stick, just like yours. It wants to be like you, its king!'}, {say:'play'},
        {wordGame:{ask:'Play a word game with the monkey? If you win, it gives you 3 🐚.', word:'猴子', notYet:'Learn a few more words first, then come back to play.',
          win:[{say:'great'}, {set:{trainee1:2}}, {shells:3, note:'The monkey gives you 3 🐚.'}, {reply:'谢谢', about:'The monkey gives you 3 🐚.'}]}}]},
      {if:{trainee1:1}, do:[{say:'play'}, {wordGame:{ask:'Play a word game with the monkey? If you win, it gives you 3 🐚.', word:'猴子', notYet:'Learn a few more words first, then come back to play.',
        win:[{say:'great'}, {set:{trainee1:2}}, {shells:3, note:'The monkey gives you 3 🐚.'}, {reply:'谢谢', about:'The monkey gives you 3 🐚.'}]}}]},
      {do:[{say:'play'}, {wordGame:{ask:'Play a word game with the monkey, just for practice?', word:'猴子', practice:true, notYet:'Learn a few more words first, then come back to play.'}}]}
    ],
    trainee2: [
      {if:{trainee2:0}, do:[{set:{trainee2:1}}, {say:'hi'}, {reply:'你好'},
        {message:'This little monkey is practising too, swinging its stick at the air. It wants to be like you, its king!'}, {say:'play'},
        {wordGame:{ask:'Play a word game with the monkey? If you win, it gives you a {桃子}.', word:'猴子', notYet:'Learn a few more words first, then come back to play.',
          win:[{say:'great'}, {set:{trainee2:2}}, {bag:'桃子', note:'The monkey gives you a {桃子} for your bag.'}, {reply:'谢谢', about:'The monkey gives you a {桃子}.', pic:'桃子'}]}}]},
      {if:{trainee2:1}, do:[{say:'play'}, {wordGame:{ask:'Play a word game with the monkey? If you win, it gives you a {桃子}.', word:'猴子', notYet:'Learn a few more words first, then come back to play.',
        win:[{say:'great'}, {set:{trainee2:2}}, {bag:'桃子', note:'The monkey gives you a {桃子} for your bag.'}, {reply:'谢谢', about:'The monkey gives you a {桃子}.', pic:'桃子'}]}}]},
      {do:[{say:'play'}, {wordGame:{ask:'Play a word game with the monkey, just for practice?', word:'猴子', practice:true, notYet:'Learn a few more words first, then come back to play.'}}]}
    ],
    // the little monkey looking for mushrooms at the top of the hillside: hello, and it shows you the mushrooms, teaching 蘑菇
    // if you haven't looked at them yet; then a word game, with 蘑菇 among its questions (asks), and its present the first time
    // you win; after that, just for practice
    mushroomer: [
      {if:{mushroomGame:0}, do:[{set:{mushroomGame:1}}, {say:'hi'}, {reply:'你好'},
        {if:{new:'蘑菇'}, say:'lookingMushrooms', teach:'蘑菇'}, {if:{knows:'蘑菇'}, say:'lookingMushrooms'},
        {newWord:'蘑菇', note:'Red mushrooms with white spots, under the pines. Pretty, but not for eating!'},
        {message:'This little monkey loves finding {蘑菇|mushrooms} under the pines, just to look at. They’re not for eating!'}, {say:'play'},
        {wordGame:{ask:'Play a word game with the monkey? If you win, it gives you 3 🐚.', word:'猴子', asks:'蘑菇', notYet:'Learn a few more words first, then come back to play.',
          win:[{say:'great'}, {set:{mushroomGame:2}}, {shells:3, note:'The monkey gives you 3 🐚.'}, {reply:'谢谢', about:'The monkey gives you 3 🐚.'}]}}]},
      {if:{mushroomGame:1}, do:[{say:'play'}, {wordGame:{ask:'Play a word game with the monkey? If you win, it gives you 3 🐚.', word:'猴子', asks:'蘑菇', notYet:'Learn a few more words first, then come back to play.',
        win:[{say:'great'}, {set:{mushroomGame:2}}, {shells:3, note:'The monkey gives you 3 🐚.'}, {reply:'谢谢', about:'The monkey gives you 3 🐚.'}]}}]},
      {do:[{say:'lookingMushrooms'}, {say:'play'}, {wordGame:{ask:'Play a word game with the monkey, just for practice?', word:'猴子', asks:'蘑菇', practice:true, notYet:'Learn a few more words first, then come back to play.'}}]}
    ],
    // the little monkeys building a tower of stones at the home ground: hello, the first time; then they count its stones with
    // you (countGames, above), once you know enough numbers (四, at school); till then, they count as they put them on
    towerL: [
      {if:{tower:0}, do:[{set:{tower:1}}, {say:'hi'}, {reply:'你好'}, {message:'The little monkeys are building a tower of stones, as high as it will go, before it falls!'},
        {if:{numbersKnown:0}, say:'count3'}, {if:{numbersKnown:{atLeast:1}}, say:'play'}, {countGame:'tower'}, {if:{numbersKnown:{atLeast:1}}, set:{tower:2}}]},
      {if:{numbersKnown:0}, do:[{say:'count3'}, {countGame:'tower'}]},
      {do:[{say:'play'}, {countGame:'tower'}, {set:{tower:2}}]}
    ],
    // the little monkey who plays hide and seek (the area's hideSeek)
    hider: [
      {do:[{say:'hideAsk'}, {hideSeek:true}]}
    ],
    towerR: [
      {if:{tower:0}, do:[{set:{tower:1}}, {say:'hi'}, {reply:'你好'}, {message:'The little monkeys are building a tower of stones, as high as it will go, before it falls!'},
        {if:{numbersKnown:0}, say:'count3'}, {if:{numbersKnown:{atLeast:1}}, say:'play'}, {countGame:'tower'}, {if:{numbersKnown:{atLeast:1}}, set:{tower:2}}]},
      {if:{numbersKnown:0}, do:[{say:'count3'}, {countGame:'tower'}]},
      {do:[{say:'play'}, {countGame:'tower'}, {set:{tower:2}}]}
    ],
    // the little monkeys at play by the hillside's brook
    chaser: [{do:[{say:'hi'}, {reply:'你好'}, {message:'It’s chasing a dragonfly, but the dragonfly is far too quick for it!'}]}],
    splash1: [{do:[{say:'hi'}, {reply:'你好'}, {say:'playWater'}]}],
    splash2: [{do:[{say:'hi'}, {reply:'你好'}, {say:'playWater'}]}],
    // the little monkeys grooming each other under a tree at the home ground: friends
    groomA: [{do:[{say:'hi'}, {reply:'你好'}, {say:'weFriends'}, {message:'They take turns to groom each other, picking through each other’s fur, as monkeys do with their friends.'}]}],
    groomB: [{do:[{say:'hi'}, {reply:'你好'}, {say:'weFriends'}, {message:'They take turns to groom each other, picking through each other’s fur, as monkeys do with their friends.'}]}],
    // the goat on the hillside's lookout: have a look at the view. The first time, it walks you to its railing and shows
    // you (decided 24 October 2026: a player it told about the view walked on without seeing it), so you know what a
    // lookout is when you find others
    // the goat on the south slope, while the cow is lost: it's down there (and the lookout shows you where)
    bather1: [{do:[{say:'hi'}, {reply:'你好'}, {message:'It’s soaking in the warm water up to its shoulders, eyes shut. Bliss!'}]}],   // chapter 1: in a warm pool in the hot spring valley
    bather2: [{do:[{say:'hi'}, {reply:'你好'}, {message:'It’s soaking in the warm water up to its shoulders, eyes shut. Bliss!'}]}],
    cliffGoat: [   // chapter 1: a goat at the top of the cliffs, while you look for the grapes
      {if:{grapeSeeds:'asked', holding:{grapeSeeds:false}}, do:[{say:'hi'}, {reply:'你好'}, {say:'fruitBelow'},
        {message:'The goat looks down over the edge. The banks can’t be climbed back up: look before you hop!'}]},
      {do:[{say:'hi'}, {reply:'你好'}]}
    ],
    slopeGoat: [
      {if:{cow:{atLeast:1, below:3}}, do:[{say:'hi'}, {reply:'你好'}, {say:'cowBelow'},
        {message:'The goat nods down the mountain. From the lookout’s railing, you can see a long way.', if:{cowSeen:0}}]},
      {do:[{say:'hi'}, {reply:'你好'}]}
    ],
    lookoutGoat: [
      {if:{lookTip:0}, do:[{say:'hi'}, {reply:'你好'}, {say:'comeLook'},
        {leadTo:[22, 21], you:[21, 21, 'down']}, {set:{lookTip:1}},   // along the railing, you after it, to look out
        {scene:'lookout'},
        {message:'You can see a long way from a lookout like this! Wherever you find one, face its railing and press A to see the view.'}]},
      {do:[{say:'hi'}, {reply:'你好'}, {say:'go'}, {message:'Face the railing and press A to see the view.'}]}
    ],
    // two of the troop, across the river, give advice
    troop1: [{if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      {if:{chapter:0, animalsLeft:{atLeast:1}}, do:[{say:'hi'}, {reply:'你好'}, {say:'findAnimals'}, {message:'Some animals hide in the tall grass. Walk through it to find them, and answer their questions to make friends.'}]},
      {if:{school:{atLeast:1}}, do:[{say:'hi'}, {reply:'你好'}, {message:'When the {老师} has a !, some of your words need practice: he’ll give you a lesson.'}]},
      {do:[{say:'hi'}, {reply:'你好'}, {message:'When the practice post by the pond has a !, some of your words are due: practise them there, so you don’t forget them.'}]}],
    troop2: [{if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      {do:[{say:'hi'}, {reply:'你好'}, {say:'bossHasApples'}, {message:'Earn shells by helping the troop, making friends and practising. The {老板} sells {苹果}: in a question, one takes away a wrong answer.'}]}],
    troop3: [{if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]}, {do:[{say:'hi'}, {reply:'你好'}, {say:'birdsInTrees'}]}],
    big: [
      {if:{raft:{atLeast:1, below:3}}, do:[{say:'bye'}]},   // (seeing you off, on the shore, at the end of chapter 1)
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      // chapter 1: he makes things for the troop (decided 27 October 2026): chopsticks out of wood, once the bowls are on the
      // feast's tables (teaching 筷子), and a cup of them goes on the big one; and spoons, once the yoghurt's on the second
      // (teaching 勺子). One new word at a time, so not both at once
      {if:{tableware:1}, waits:true, do:[{say:'madeChopsticks', teach:'筷子'}, {newWord:'筷子', note:'The big monkey has made chopsticks out of {木头}, a pair for every monkey.', if:{new:'筷子'}},
        {setUp:{tableware:2}}, {message:'A bamboo cup of the big monkey’s chopsticks goes on the feast’s big table. Now ask the hungry monkey what else the feast needs!', if:{feast:2}}]},
      {if:{spoons:1}, do:[{say:'madeSpoons', teach:'勺子'}, {newWord:'勺子', note:'The big monkey has made wooden spoons, for eating the {酸奶}.', if:{new:'勺子'}}, {set:{spoons:2}}]},
      {if:{climb:1, new:'棍子'}, do:[   // he stops you as you set off up the path
        {say:'stickHere', teach:'棍子'},
        {newWord:'棍子', note:'The big monkey gives you a stick, to chase wild animals off the path.'},
        {message:'The big monkey shows you how to fight. When something jumps out of the long grass, choose 打 (dǎ, hit) and answer to hit it. When it attacks, listen for where it’s coming from, and pick that to jump aside.'},
        {message:'A wrong answer when it attacks costs you 10 health, and you have 50. Eat something to get some back, or come back to the old monkey to rest.'}
      ]},
      // chapter 1: he wants wood and small stones to build the school (both at once), and has cleared the way to the pine wood
      {if:{home:2, build:0}, do:[
        {say:'needWood'},
        {message:'First, he marks out the ground for the school, right here beside him.'},
        {markOut:{build:1, wood:'asked', stones:'asked'}},   // as you watch: stakes, string, the plot, its sign and path (and the way up to the pine wood opens)
        {message:'To build it, the troop needs wood and small stones. The big monkey has cleared a way through the bushes at the top of the home ground, up to the pine wood.'},
        {message:'Look there for dead, dry pines: one hit with your stick knocks them down. Small stones lie by the water.'}
      ]},
      {if:{build:1, wood:'asked', stones:'asked'}, do:[{request:'wood'}, {request:'stones'}]},   // you bring them (or he asks again)
      {if:{build:1, wood:'asked'}, do:[{request:'wood'}]},
      {if:{build:1, stones:'asked'}, do:[{request:'stones'}]},
      // a game saved with just the frame up (before 22 October 2026): the troop builds the school when you talk to him
      {if:{build:2, school:0}, do:[
        {say:'buildIt'},
        {scene:'buildingSchool'},
        {newWord:'学校', note:'The troop has built its school!'},
        {set:{school:1}},
        {message:'The old monkey has gone in: he’s the teacher now. Walk in through the school’s door!'},
        {message:'The troop used the practice post from the meadow to build it: from now on, you practise your words in lessons at school.'}
      ]},
      // chapter 1: once you know red, yellow and white from the school's first colour lesson, he wants flowers of those colours
      // to plant in front of it (decided 22 October 2026: he wanted them in the prologue, for no reason; and 24 October 2026:
      // not once you know all nine colours, so it's a side quest you can do any time after), then you bring them (or he asks
      // again). Only once the school is built: a game saved before version 30 knew those colours in the prologue.
      {if:{school:{atLeast:2}, coloursKnown:{atLeast:3}, flowers:'not asked'}, do:[{say:'schoolLovely'}, {say:'plantFlowers'}, {request:'flowers'}]},
      {if:{flowers:'asked'}, do:[{request:'flowers'}]},
      // chapter 1: a garden by the stream (planned 27 October 2026), once he's made the chopsticks and the hungry monkey has said
      // what the feast still needs (so they don't both have a ! at once), and after the flowers for the school: he wants seeds
      // (teaching 种子), walks you down to the garden's place by the stream, and marks it out as you watch; wild fruit grows on
      // the mountain, and you bring him its seeds (each with its own request), which the troop plants there (events)
      {if:{holding:{melonSeeds:true}}, do:[{request:'melonSeeds'}]},
      {if:{holding:{grapeSeeds:true}}, do:[{request:'grapeSeeds'}]},
      {if:{holding:{bananaSeeds:true}}, do:[{request:'bananaSeeds'}]},
      {if:{melonPlanted:2}, do:[{say:'foodReady'}, {set:{melonPlanted:3}}, {message:'The big monkey picks the ripe {西瓜}: they’re for the feast! Go and see them go on its {桌子}, by the big tree.'}]},
      {if:{grapePlanted:2}, do:[{say:'foodReady'}, {set:{grapePlanted:3}}, {message:'The big monkey picks the ripe {葡萄}: they’re for the feast! Go and see them go on its {桌子}, by the big tree.'}]},
      {if:{bananaPlanted:2}, do:[{say:'foodReady'}, {set:{bananaPlanted:3}}, {message:'The big monkey picks the ripe {香蕉}: they’re for the feast! Go and see them go on its {桌子}, by the big tree.'}]},
      {if:{tableware:{atLeast:2}, feast:{atLeast:3}, garden:0}, do:[{say:'wantSeeds', teach:'种子'}, {newWord:'种子', note:'The big monkey wants to grow fruit for the feast, in a garden.'},
        {message:'He wants to make a garden by the stream. Come and see!'}, {leadTo:[9, 13], you:[10, 13, 'left']},
        {markOut:{garden:1, melonSeeds:'asked', grapeSeeds:'asked', bananaSeeds:'asked'}},   // as you watch: stakes, string, the beds dug, its sign
        {message:'Wild fruit grows on the mountain, in places the troop has found. Bring the big monkey its {种子}, and the troop will plant them here!'}]},
      {if:{melonSeeds:'asked'}, do:[{request:'melonSeeds'}]},   // (he asks again)
      {if:{grapeSeeds:'asked'}, do:[{request:'grapeSeeds'}]},
      {if:{bananaSeeds:'asked'}, do:[{request:'bananaSeeds'}]},
      {if:{cave:{atLeast:6}}, do:[{say:'king'}]},   // once you're king (the troop makes you king at the end of the prologue: the crowning scene)
      {if:{climb:3}, do:[{say:'letsGo'}]},   // following you up to the waterfall
      {if:{story:true, cave:{below:3}}, do:[{say:'dare'}]},
      // in the meadow: the troop's builder, with nothing to ask of you yet. He says who he is, teaching 我 (decided 24 October
      // 2026: it was taught as you gave the hungry or thirsty monkey what they wanted, until 吃 took the hungry monkey's turn)
      {if:{new:'我'}, do:[{say:'iamBig', teach:'我'}, {newWord:'我', note:'我 means I or me.'}, {reply:'你好'}]},
      {do:[{say:'hi'}, {reply:'你好'}]}
    ]
  },

  // The Story Scroll at the waterfall: your story so far, told in short sentences made of words you've met.
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
      'You read a whole story in Chinese: your story on Flower Fruit Mountain.',
      'The troop stares at the roaring waterfall. What could be behind it?',
      'Talk to the old monkey: he has something to ask you.'
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

  // The opening scene: the story in Chinese, read aloud, as subtitles with pinyin over each word, and English (en).
  // Each caption appears this many seconds in (at), then waits for Next. The pictures (night, dawn, the stone cracking)
  // are drawn by js/draw.js to match these times. Like every sentence, its words are in the word bank (most of them
  // just to listen to), with a space between them.
  intro: [
    {at:0, zh:'很久 很久 以前 ……', en:'Long, long ago…'},
    {at:2.8, zh:'海 里 有 一座 山 ， 叫 花果山 。', en:'In the sea stood a mountain called Flower Fruit Mountain.'},
    {at:5.4, zh:'山 上 有 一个 大 石头 。', en:'On top of the mountain sat a big stone.'},
    {at:7.2, zh:'石头 动 了 ！', en:'The stone moved!'},
    {at:9, zh:'一只 小 猴子 ！', en:'A little monkey!'},
    {at:10.6, zh:'它 的 眼睛 里 有 光 。', en:'Light shone from its eyes.'},
    {at:16.4, zh:'你好 ， 小 猴子 ！', en:'Hello, little monkey!'}
  ],

  // Other scenes told like the opening, played by the scene step: their captions, as the opening's (teach: the word
  // being taught, in bold green), and watch: a button in Settings to watch it again, once its when matches. Their
  // pictures are drawn by js/draw.js (SCENE_ART), to match the times.
  scenes: {
    // the end of the prologue: in the cave, the troop makes you king; then, outside, the sun sets on Flower Fruit Mountain
    becomingKing: {watch:'Watch becoming king', when:{cave:{atLeast:6}}, captions: [
      {at:0, zh:'水帘洞 是 我们 的 家 。', en:'The Water Curtain Cave is our home.'},
      {at:3, zh:'你 很 勇敢 ！', en:'You are very brave!'},
      {at:5.5, zh:'你 是 我们 的 王 ！', en:'You are our king!', teach:'王'},
      {at:8, zh:'美猴王 ！', en:'Handsome Monkey King!'},
      {at:11, zh:'从此 ， 花果山 的 猴子 很 快乐 。', en:'From then on, the monkeys of Flower Fruit Mountain were very happy.'}
    ]},
    // chapter 1: the view from the lookout on the hillside, the sea far off (A at its railing): nothing new, just words
    // you've heard (这里 and 好看 at the home ground, 海 in the opening)
    lookout: {captions: [
      {at:0, zh:'这里 很 好看 ！', en:'It’s lovely up here!'},
      {at:3, zh:'海 很 大 ！', en:'The sea is so big!'}
    ]},
    // chapter 1: the view from the south slope's lookout, south over the dark pines to the pasture, where the lost cow is,
    // far below by its spring (decided 27 October 2026: you see where you're going); once it's home, just the view
    cowView: {captions: [
      {at:0, zh:'那里 有 一只 牛 ！', en:'There’s a cow over there!'},
      {at:3, zh:'我 要 去 找 牛 ！', en:'I’m going to find the cow!'}
    ]},
    southView: {art:'cowView', home:true, captions: [
      {at:0, zh:'这里 很 好看 ！', en:'It’s lovely up here!'}
    ]},
    // chapter 1: the troop builds the school, at the home ground: the walls go up, then the roof, then its sign
    buildingSchool: {watch:'Watch the school being built', when:{school:{atLeast:1}}, captions: [
      {at:0, zh:'我们 有 木头 ， 也 有 石头 。', en:'We have wood, and stones too.'},
      {at:3.2, zh:'一 ， 二 ， 三 ！', en:'One, two, three!'},
      {at:6.2, zh:'太 好 了 ！', en:'Wonderful!'},
      {at:9, zh:'这 是 我们 的 学校 ！', en:'This is our school!', teach:'学校'}
    ]},
    // chapter 1: after the red lesson, the class goes out and paints the school's paper lanterns red (the colours lesson
    // series says which part, and which scene; until 24 October 2026 every colour painted a part of the school, each scene
    // with the same pictures, art, in its colour, paints)
    // chapter 1's end: the great feast, round the tables at the home ground (art: the feast, js/draw.js); the old monkey tells
    // the story of your first days (from the book's opening, checked by the native speaker, saved for chapter 1), you're
    // happy (快乐), then sad: you'll grow old; across the sea are immortals, who never do, and you'll go and find them
    feast: {watch:'Watch the feast', when:{feastHeld:1}, captions: [
      {at:0, zh:'我们 有 桃子 ， 有 蜂蜜 ， 有 鱼 ！', en:'We have peaches, honey and fish!'},
      {at:3, zh:'山 上 有 一个 大 石头 。', en:'On the mountain there was a big stone.'},
      {at:6, zh:'石头 里 有 一只 小 猴子 。', en:'In the stone there was a little monkey.'},
      {at:9, zh:'小 猴子 有 很多 朋友 。', en:'The little monkey had lots of friends.'},
      {at:12, zh:'猴子 吃 桃子 ， 喝 水 。', en:'The monkeys ate peaches and drank water.'},
      {at:15, zh:'鸟 在 树 上 玩 。', en:'The birds played in the trees.'},
      {at:18, zh:'河 里 有 鱼 ， 山 上 有 瀑布 。', en:'There were fish in the river, and a waterfall on the mountain.'},
      {at:21, zh:'小 猴子 很 快乐 ！', en:'The little monkey was very happy!', teach:'快乐'},
      {at:24, zh:'可是 美猴王 不 快乐 。', en:'But the Monkey King isn’t happy.'},
      {at:27, zh:'我们 会 老 ……', en:'We’ll all grow old…'},
      {at:30, zh:'海 那边 有 神仙 。', en:'Across the sea, there are immortals.'},
      {at:33, zh:'神仙 不会 老 ！', en:'Immortals never grow old!'},
      {at:36, zh:'我 要 去 找 神仙 ！', en:'I’m going to find them!'}
    ]},
    // and sailing away on your raft, the troop waving from the shore
    sailAway: {captions: [   // (A at your raft afterwards plays it again)
      {at:0, zh:'再见 ！', en:'Goodbye!'},
      {at:3, zh:'我们 等 你 ！', en:'We’ll wait for you!'},
      {at:6, zh:'美猴王 坐 木筏 走 了 。', en:'The Monkey King sailed away on his raft.'}
    ]},
    paintLanterns: {art:'paintingSchool', paints:'红色', captions: [
      {at:0, zh:'我们 去 刷 灯笼 吧 ！', en:'Let’s go and paint the lanterns!'},
      {at:4.4, zh:'灯笼 是 红色 的 ！', en:'The lanterns are red!'}
    ]}
  }
};
