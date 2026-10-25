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
  //   schoolFlowers chapter 1: true once the big monkey has planted the flowers you brought him in front of the school
  //   homeName 1 once you know every part of your home's name (花, 果 in 水果, and 山): a message says so, and the sign by
  //           your stone sparkles; 2 once you've read it there, and seen how the name is made
  //   trainee1, trainee2  chapter 1: 1 once that little monkey in training on the hillside has stopped you for a word game
  //           (the first by the stepping stones, the second on the middle terrace), 2 once you've won its present
  //   tower   chapter 1: the little monkeys building a tower of stones at the home ground: 1 once they've said hello, 2 once
  //           you've counted its stones with them
  //   feast   chapter 1, the great feast: 0 not yet, 1 the old monkey has told you about it (teaching 有), 2 the troop has set
  //           up its big table under the big tree at the home ground, as you watched, 3 the hungry monkey has told you what
  //           the feast still needs: honey (teaching 没有)
  // The game adds each request below ('not asked', 'asked' or 'done'), what you're holding
  // for each request, and done: true once you've passed the area's word test (the troop's send-off, to come).
  progress: {chapter:0, elder:0, gate:false, climb:0, boar:0, story:false, cave:0, count:0, squirrelPlayed:0, goatPlayed:0, ledgeTip:0, lookTip:0, home:0, build:0, school:0, woodIn:0, schoolFlowers:false, homeName:0, trainee1:0, trainee2:0, tower:0, feast:0},

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
    flowersPicked: {count:'picked', request:'flowers'},   // flowers picked for the big monkey (one of each colour)
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
    numbersKnown: {count:'known', words:['四', '五', '六', '七', '八', '九', '十']},   // the numbers you've learned at school
    coloursKnown: {count:'known', words:['红色', '黄色', '白色', '黑色', '蓝色', '绿色', '棕色', '橙色', '粉色']}   // and the colours
  },

  // Lessons at school (the lesson step, with the teacher): each series teaches its words one at a time, one a lesson, in
  // order, the next once you've got the last one right twice; when two series have a word ready, they take turns, and
  // when none has, a lesson is practice, as at the practice post. kind: what its lessons are (count: the teacher counts
  // things onto his table, teaching the new number with his line for it, teach, then asks how many there are, with his
  // question about each of the things; paint: he opens a pot of the new colour, teaching it, then wants paints, and if
  // the colour is for a part of the school, paint, the class goes out and paints it, in its scene, scenes); by: who
  // teaches it; start: what the card asking you to start says; note: on the new word's card.
  lessons: [
    // The first lesson of each series teaches its first three words, one after another (first: decided 24 October 2026,
    // school lessons are the exception to one new word at a time): two lessons, and you can count six bees and know the
    // colours of the big monkey's flowers. After that, one a lesson.
    {id:'numbers', kind:'count', by:'elder', if:{school:{atLeast:2}}, words:['四', '五', '六', '七', '八', '九', '十'], first:3,
      startFirst:'Your first lesson: three new numbers, one at a time, then counting. Each right answer earns a 🐚 if that number needs practice.',
      start:'Today: a new number, then counting. Each right answer earns a 🐚 if that number needs practice.',
      note:'The teacher counts peaches onto his table, one by one.',
      teach:{'四':'count4', '五':'count5', '六':'count6', '七':'count7', '八':'count8', '九':'count9', '十':'count10'},
      things:[{word:'桃子', ask:'howManyPeaches', on:'table'}, {word:'苹果', ask:'howManyApples', on:'table'}, {word:'碗', ask:'howManyBowls', on:'table'},
        {word:'猴子', ask:'howManyMonkeys', on:'grass'}, {word:'兔子', ask:'howManyRabbits', on:'grass'}, {word:'鸟', ask:'howManyBirds', on:'grass'}]},
    // red, yellow and white come first (decided 22 October 2026: they were the prologue's, taught by the flowers the big
    // monkey wanted, which wait for the colour lessons now). Red paints the school's lanterns; the rest of the school
    // stays as it was built (decided 24 October 2026: each colour painted a part of it, the roof blue, the door black…)
    {id:'colours', kind:'paint', by:'elder', if:{school:{atLeast:2}}, words:['红色', '黄色', '白色', '黑色', '蓝色', '绿色', '棕色', '橙色', '粉色'], first:3,
      startFirst:'Your first colour lesson: three new colours, one at a time, then choosing paints. Each right answer earns a 🐚 if that colour needs practice.',
      start:'Today: a new colour, then choosing paints. Each right answer earns a 🐚 if that colour needs practice.',
      note:'The teacher opens a pot of paint.',
      teach:{'红色':'thisRed', '黄色':'thisYellow', '白色':'thisWhite', '黑色':'thisBlack', '蓝色':'thisBlue', '绿色':'thisGreen', '棕色':'thisBrown', '橙色':'thisOrange', '粉色':'thisPink'},
      paint:{'红色':'lanterns'}, scenes:{'红色':'paintLanterns'}}
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
    {id:'woodBack', if:{wood:'asked', holding:{wood:true}}, text:'Take the {木头} to the big monkey', arrow:'big'},
    {id:'stonesBack', if:{stones:'asked', holding:{stones:true}}, text:'Take the small {石头|stones} to the big monkey', arrow:'big'},
    {id:'build', if:{build:2, school:0}, text:'Talk to the big monkey: the troop is ready to build the {学校}', arrow:'big'},
    {id:'goIn', if:{school:1}, text:'Go into the {学校}, and talk to the old monkey at the front of the class', arrow:'elder'},
    {id:'classmates', if:{school:{atLeast:2}, new:'同学'}, text:'Talk to the little monkey in the {学校}', arrow:'playful'},
    // the feast: once the first two lessons have taught you 四 五 六 and 红色 黄色 白色, the old monkey has news
    {id:'news', if:{school:{atLeast:2}, feast:0, numbersKnown:{atLeast:3}, coloursKnown:{atLeast:3}}, text:'Talk to the old monkey at the {学校}: he has news', arrow:'elder'},
    {id:'feastTable', if:{feast:1}, text:'Go to the big {树} in the middle of the home ground', arrow:[17, 7, 'homeGround']},
    {id:'hungryTable', if:{feast:2}, text:'Talk to the hungry monkey by the big {桌子}', arrow:'hungry'},
    {id:'hideSeek', if:{hiding:true}, text:'Find where the little monkey is hiding', clue:true},   // (its clue under it, to hear again; no arrow: that's the game)
    {id:'flowers', if:{flowers:'asked', holding:{flowers:false}}, text:'Pick a red, a yellow and a white {花} for the big monkey to plant ({flowersPicked}/3)', arrow:[27, 2, 'homeGround']},
    {id:'flowersBack', if:{flowers:'asked', holding:{flowers:true}}, text:'Take the {花} to the big monkey', arrow:'big'},
    {id:'count', if:{cave:{atLeast:5}, count:{below:3}}, text:'Count the troop in with the old monkey ({troopIn}/3)', arrow:'elder'},
    {id:'king', if:{chapter:0, count:3}, text:'Talk to the old monkey: the whole troop is in the {洞}', arrow:'elder'},
  ],

  // What the task box says when there are no tasks: the first whose if matches.
  hints: [
    {if:{elder:{atLeast:1}, hungry:'not asked'}, text:'Monkeys with a ! need help. Go and talk to them.'},
    {if:{elder:{atLeast:1}, thirsty:'not asked'}, text:'Monkeys with a ! need help. Go and talk to them.'},
    {if:{school:{atLeast:2}, coloursKnown:{atLeast:3}, flowers:'not asked'}, text:'You know three colours now! The big monkey has something to ask you.'},
    {if:{feast:{atLeast:3}}, text:'There’s no {蜂蜜} for the feast yet. It comes from {蜜蜂|bees}, the next part of chapter 1, coming soon. Until then, the {老师} gives you a lesson whenever there’s a new number or colour to learn, or your words need practice.'},
    {if:{school:{atLeast:2}}, text:'The {老师} gives you a lesson whenever there’s a new number or colour to learn, or your words need practice: he has a ! then. The rest of chapter 1 is coming soon.'},
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
    {chapter:1, text:'Hear the old monkey’s news at the {学校}', show:{school:{atLeast:2}, numbersKnown:{atLeast:3}, coloursKnown:{atLeast:3}}, done:{feast:{atLeast:1}}},
    {chapter:1, text:'See the big {桌子} set up for the feast', show:{feast:{atLeast:1}}, done:{feast:{atLeast:2}}},
    {chapter:1, text:'Hear from the hungry monkey what the feast still needs', show:{feast:{atLeast:2}}, done:{feast:{atLeast:3}}},
    {chapter:1, text:'Play hide and seek with a little monkey', show:{feast:{atLeast:1}}, done:{hidesFound:{atLeast:1}}}
  ],

  // A ! or ? over a character's head: the first whose if matches.
  bubbles: {
    elder: [{if:{school:1}, show:'!'}, {if:{school:{atLeast:2}, feast:0, numbersKnown:{atLeast:3}, coloursKnown:{atLeast:3}}, show:'!'}, {if:{school:{atLeast:2}, lesson:true}, show:'!'}, {if:{school:{atLeast:2}, practice:true}, show:'!'}, {if:{chapter:1, home:0}, show:'!'}, {if:{elder:0}, show:'!'}, {if:{elder:1, newWords:{atLeast:4}}, show:'!'}, {if:{gate:true, climb:0}, show:'!'}, {if:{climb:2}, show:'!'}, {if:{story:true, cave:0}, show:'!'}, {if:{cave:2, caveThings:3}, show:'!'},
      {if:{cave:4}, show:'!'}, {if:{cave:{atLeast:5}, count:{below:3}}, show:'!'}, {if:{chapter:0, count:3}, show:'!'}],
    boss: [{if:{elder:{atLeast:1}, new:'老板'}, show:'!'}, {if:{elder:{atLeast:1}, new:'头带'}, show:'!'},
      {if:{bought:{'头带':false}, shells:{atLeast:10}}, show:'?'}],   // ? once you can afford the headband
    playful: [{if:{elder:{atLeast:1}, new:'猴子'}, show:'!'}, {if:{elder:{atLeast:1}, new:'朋友'}, show:'!'},   // until it has taught you both its words
      {if:{school:{atLeast:2}, new:'同学'}, show:'!'}],   // and at school, that you're classmates
    hungry: [{if:{elder:{atLeast:1}, hungry:'not asked'}, show:'!'}, {if:{elder:{atLeast:1}, hungry:'asked', holding:{hungry:true}}, show:'?'},
      {if:{hungry:'done', new:'没关系'}, show:'!'},   // once he's eaten, he wants to say sorry for being fussy
      {if:{hungry:'done', new:'水果'}, show:'!'},   // and a game that helped him before he taught 水果 (24 October 2026) learns it now
      {if:{feast:2}, show:'!'}],   // chapter 1: by the feast's big table, to tell you what it still needs
    thirsty: [{if:{elder:{atLeast:1}, thirsty:'not asked'}, show:'!'}, {if:{elder:{atLeast:1}, thirsty:'asked', holding:{thirsty:true}}, show:'?'}],
    squirrel: [{if:{squirrelPlayed:0}, show:'!'}], goat: [{if:{goatPlayed:0}, show:'!'}],   // they want to play (the once, till they have)
    ledgeGoat: [{if:{ledgeTip:0}, show:'!'}],   // until it has told you about the banks
    lookoutGoat: [{if:{lookTip:0}, show:'!'}],  // until it has told you about the view
    // the little monkeys in training on the hillside: until they've stopped you, and then whenever some of your words need
    // practice, for another word game
    trainee1: [{if:{trainee1:0}, show:'!'}], trainee2: [{if:{trainee2:0}, show:'!'}],   // (the once: they had one whenever your words needed practice till 24 October 2026)
    // the little monkeys building a tower of stones: once you know enough numbers to count its stones with them, till you have
    hider: [{if:{hidesFound:0}, show:'!'}],   // until you've found it once, playing hide and seek
    towerL: [{if:{tower:{below:2}, numbersKnown:{atLeast:1}}, show:'!'}], towerR: [{if:{tower:{below:2}, numbersKnown:{atLeast:1}}, show:'!'}],
    doorway: [{if:{new:'睡觉'}, show:'!'}],   // until it has told you about sleeping
    big: [{if:{elder:{atLeast:1}, gate:false, new:'我'}, show:'!'}, {if:{climb:1, new:'棍子'}, show:'!'},   // in the meadow, to say who he is
      {if:{home:2, build:0}, show:'!'}, {if:{wood:'asked', holding:{wood:true}}, show:'?'}, {if:{stones:'asked', holding:{stones:true}}, show:'?'},
      {if:{build:2, school:0}, show:'!'},   // chapter 1: the school
      {if:{school:{atLeast:2}, coloursKnown:{atLeast:3}, flowers:'not asked'}, show:'!'}, {if:{flowers:'asked', holding:{flowers:true}}, show:'?'}],   // and flowers for it, once you know their colours
    woodSquirrel: [{if:{new:'木头'}, show:'!'}]   // the squirrel in the pine wood, until you've found wood
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
      offer:'haveWood', sentence:'我们 要 木头', sentenceEn:'We need wood.', reward:3, thanks:'thanks'},
    stones: {from:'big', wants:'石头', ask:'wantStones', asked:'The big monkey wants three small {石头|stones}. Check your tasks.',
      offer:'haveStones', sentence:'我们 要 小 石头', sentenceEn:'We need small stones.', reward:3, thanks:'thanks'}
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
  shop: {
    who:'boss', ask:'whatWant', given:'The {老板} gives you the {item}.', reply:'谢谢', welcome:'welcome', no:'我不要',
    earnMore:'Earn more by helping the monkeys, making friends with the animals in the tall grass, and practising your words.',
    soldOut:'You have everything the {老板} sells. Come back another time.',
    items: [
      {item:'头带', price:10, sentence:'我 要 头带', sentenceEn:'I want the headband.',
        note:'A red cloth headband.', bought:'You tie on the red {头带}. It suits you!', wear:true},
      {item:'苹果', price:2, sentence:'我 要 苹果', sentenceEn:'I want an apple.',
        note:'A crunchy apple.', bought:'You put the {苹果} in your bag. In a battle or with an animal, eat it to take away a wrong answer.', eat:true}
    ]
  },

  // Food you carry in your bag (up to carry of each), and what eating it does. heal: how many hearts come back (in a battle,
  // 吃 eats it on your turn; outside one, tap it in your bag). helps: it takes away a wrong answer in a question, in a
  // battle or with an animal, without using your turn. does: what your bag says it does.
  food: {
    '桃子': {heal:1, carry:3, does:'Brings a heart back'},
    '苹果': {helps:true, carry:3, does:'Takes away a wrong answer'}
  },

  // Things that happen by themselves when the time comes (checked after anything you do, such as a step or a
  // request done). Besides what a task's if can check, an event's if can check near:'id' (you're right beside that
  // character) and at:[x, y, 'place'] (you're standing there). A word in {curly brackets} in a message is shown as 汉字 (English).
  events: [
    {if:{place:'pineWood', woodIn:0}, do:[{sound:'howl'}, {message:'It’s gloomy under the thick pines, and very still. Somewhere far off, a wolf howls…'}, {set:{woodIn:1}}]},   // into the pine wood for the first time
    {if:{place:'cave', cave:1}, do:[{card:'洞', note:'A big, dry cave, hidden behind the water!'}, {set:{cave:2}}]},   // inside for the first time
    // you lead the troop in: they come through the water curtain after you (they've followed you since you told the old
    // monkey about the cave), then go to their places (decided 22 October 2026: they had just been there already)
    {if:{place:'cave', cave:3}, do:[{sound:'splash'}, {set:{cave:4}}, {follow:[]}, {message:'Splash, splash! The troop follows you through the water curtain!'}]},
    // the rocks roll away once everything else in the prologue is done: the hungry and thirsty monkeys helped, every animal
    // found, and the words for the meadow learned (the big monkey's flowers wait for chapter 1, decided 22 October 2026)
    {if:{hungry:'done', thirsty:'done', animalsLeft:0, meadowWords:5, gate:false}, do:[
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
    // you've brought the big monkey the wood and the small stones: the troop builds the school at once (a scene, told like
    // the opening: on its plot, the frame goes up, then the walls, the roof and the sign), and you learn 学校 (decided 22
    // October 2026: the frame had just popped up on the map, and you had to talk to him again)
    {if:{build:1, wood:'done', stones:'done'}, do:[{say:'buildIt', by:'big'}, {scene:'buildingSchool'}, {newWord:'学校', note:'The troop has built its school!'},
      {set:{build:2, school:1}},
      {message:'The old monkey has gone in: he’s the teacher now. Walk in through the school’s door!'},
      {message:'The troop used the practice post from the meadow to build it: from now on, you practise your words in lessons at school.'}]},
    // chapter 1: once the old monkey has told you about the feast, as you come up to the big tree at the home ground, the troop
    // sets up the feast's big table under it, as you watch (the setUp step: its legs, its top with a red cloth, then a bowl
    // at a time, each with a knock; things that just appear look odd), and the hungry monkey is there to look after it
    {if:{feast:1, around:[17, 7, 'homeGround']}, do:[{setUp:{feast:2}},
      {message:'The troop sets up a big {桌子|table} under the big tree for the feast, with peaches, apples, and an empty bowl, waiting for something…'}]},
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
        {at:[16, 0], to:'path', arrive:[16, 18], facing:'up', if:{climb:{atLeast:1}}, closed:'The old monkey wants to talk to you first.'}
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
        "YYYYYYYYYYYYYYYYYYWWYYYY"
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
        "YYYggggYYYYYYYYgrgWW^^^^",
        "YYgPgggJYYYYYYYgrgWW^^^^",
        "YYggggJggrrrrrrrrgWW^^^^",
        "YYYggggwwYYYYYYgrgWW^^^^",
        "YYYYwwwYYYYYYYYgrgWW^^^^",
        "^^wwwwwwwwwwwwwgrwWW^^^^",
        "^^gggggnnnnnnggrrgWW^^^^",
        "^^grrrrnnnnnnrrrggWW^^^^",
        "^^rrggnnnnnnnggoggWW^^^^",
        "^^==MMMMMvvMMMMvvvWW^^^^",   // stone steps up the cliff (left), and short grassy banks to hop down
        "^^==MMMMMvvMMMMvvvWW^^^^",
        "^^rrggnnnnnnnnngggWW^^^^",
        "^^rrrrnnnnnnnnrrrgWW^^^^",
        "^^ggggnnnnnnnngrrgWW^^^^",
        "^^^gggnnnnnnnngrrgWW^^^^",
        "^^^^^^nnnnnnnngrrgWW^^^^",
        "^^^^^^^^^^^^^^^rr^WW^^^^",
        "^^^^^^^^^^^^^^^rr^WW^^^^"
      ]
    },
    // The river valley: the river turns, coming from the west. At the first bridge the way forks: over it, away from the
    // river, is a clearing with the goat and an apple tree (a dead end); along the river, through long grass, is the second
    // bridge and the way on up. A fallen tree hides a peach tree for later.
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
        "^^YWWnnnnnnnY^^YgJggggggY^",
        "^^wWWnnnnnnnwMMwggggggggw^",
        "^^wWWgrgggggwMMwwggrggwww^",
        "^^wWWWkWWWWWWWWWWWWkWWWww^",
        "^^wWWWkWWWWWWWWWWWWkWWWww^",
        "^^wgggrgnnnnnnnngggrgWWww^",
        "^^wwgrrrnnnnnnnnrrrrgWWww^",
        "^^wPlgggnnnnnnnngggrgWWww^",
        "^^wwwgTgnnnnnnnngTgrgWWww^",
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
        // troop sets it up as you watch (the setUp step, in events: its legs, its top with a red cloth, then stone bowls of
        // peaches and apples, and an empty one, waiting for honey). Under the big tree, not in the cave's entrance (decided
        // 23 October 2026: every quest comes back to the home ground; 桌子 and 碗 are the cave's words, heard again here)
        '%': {look:'grass', walk:true, becomes:[{if:{feast:{atLeast:2}}, to:'&'}]},
        '&': {look:'feastTable', word:'桌子', landmark:true, onLook:[{label:'Look', do:[{feastList:true}]}]}   // A at it: the feast's list
      },
      exits: [
        {at:[0, 9], to:'falls', arrive:[18, 2], facing:'left'}, {at:[0, 10], to:'falls', arrive:[18, 2], facing:'left'},   // back to the waterfall
        {at:[25, 0], to:'hillside', arrive:[12, 43], facing:'up', if:{build:{atLeast:1}}, closed:'Thick bushes block the way.'},   // up the hillside to the pine wood
        {at:[11, 4], to:'school', arrive:[7, 8], facing:'up', when:{school:{atLeast:1}}}   // the school's door, once it's built (when: not a way in till then)
      ],
      map: [
        "YMMMMMMMMMMMMMMMMMMMMMMMYbYYYYYY",   // the cliff behind the school, rising out of sight
        "YMMMMMMMMMMMMMMMMMMMMMMMg.gYYYYY",
        "Ygggggggsssssssgggggggggg.FEJFFY",
        "YgTggg1gsssssssgggggTgggg.3hhhgY",
        "YgggggggsssssssggggggPggg.ghhhEY",
        "Ygggggggg99899gggTTgggggg.JEFgJY",   // the beds in front of the school (9), where the big monkey plants your flowers
        "YggTggggggg8gggggTTgggggg.gggggY",
        "YgEFggggggg8gJgg%%%gFg@gg.gggTgY",   // the feast's big table (%), under the big tree; little monkeys building a tower of stones (@), beside the way up to the hillside
        "Ygggggggggg8ggggggggggggg.gggggY",
        "...............................u",
        "...............................Y",
        "Yggggggggggggggg.gggggggggggEggY",
        "Yggddd2ggEgggggg.ggggg5cccccgggY",
        "YggdddggTgggggTg.gJFgTgcccccgggY",
        "Yggggggggggggggg.ggggggcccccgggY",
        "Yggggeeeeeeee4gg.gOOOggggggggTgY",
        "YgTggeeeeeeeeggg.gOOOggTgggQgggY",
        "Yggggggggggggggg.ggggTgggggggggY",
        "WWWWWWWWWWWWWWWWkWWWWWWWWWWWWWWW",   // the stream, flowing in from the west and out through the trees to the east
        "YYYYYYYYYYYYYYYY.YYYYYYYYYYYYYYY",
        "YYYYYYYYYYYYYYYY.YYYYYYYYYYYYYYY",
        "YYYYYYYYYYYYYYYYuYYYYYYYYYYYYYYY"
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
        {at:[12, 0], to:'pineWood', arrive:[16, 26], facing:'up'}, {at:[13, 0], to:'pineWood', arrive:[17, 26], facing:'up'}   // into the pine wood
      ],
      legend: {
        'n': {look:'longGrass', walk:true, wild:['snake', 'snake', 'spider', 'spider', 'wolf']},   // long grass: snakes and spiders, and now and then a wolf
        'f': {look:'flowers', walk:true},                     // flowers on the slope (not for picking)
        'z': {look:'steppingStones', walk:true},              // stepping stones over the brook
        'm': {look:'mushrooms', walk:true, landmark:true, onLook:[{do:[{message:'Red mushrooms with white spots, under the pines. Pretty, but not for eating!'}]}]},   // mushrooms under the pines (just to look at)
        'A': {look:'archway', walk:true, says:'松林'},         // the way through the archway into the pine wood, with its name on the board over it
        'I': {look:'archPost'},                               // the archway's pillars
        'L': {look:'slabs', walk:true},                       // the lookout's stone platform
        'R': {look:'railing', landmark:true, onLook:[{do:[{scene:'lookout'}]}]}  // its railing, at the top of the cliff: A shows you the view
      },
      map: [
        "pppppppppppp..pppppppppppp",   // the way into the pine wood
        "ppppppppppii..iipppppppppp",
        "ppppppppppiIAAIipppppppppp",   // the archway, with 松林 on its board
        "pppppppppiii..iimipppppppp",
        "ppppppppmiii..iiiiippppppp",
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
        "YYgggg....nnn.......ggTgYY",
        "YYgTgg.gggnnnggggggnnnggYY",
        "YYggg..gognonTgggggnnnggYY",
        "YYgTg..gggnnoggggggggTggYY",
        "MMMMM==MMMvvvvvvvvMMMMMMMM",   // stone steps (left), a bank (middle)
        "MMMMM==MMMvvvvvvvvMMMMMMMM",
        "YYgfg..fgfgfggfgggfgfggfYY",   // a slope of flowers; a peach tree in the corner
        "YYgPg..gfgfgfggffggfgffgYY",
        "YYfgg...............ggfgYY",
        "YYgffggggfgggfgggfWzWWWWYY",   // the brook, winding, and its stepping stones
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
        'k': {look:'bridgeAcross', walk:true, word:'桥', learnOnStep:true, stepNote:'A wooden bridge over the stream.'}   // the only way over the stream (chapter 1's bridges teach 桥)
      },
      map: [
        "pppppppppppppppppppppppppppppppppp",
        "pppiiippppppppppppppppppppggggpppp",
        "ppqiiiippppppppppppppppppggggggqpp",
        "ppiiiiipppppppppppppppppggJgggggpp",
        "ppiipiippppppppppppppppogggggggggp",
        "ppiiiiippppppppppppppiixgggggggggp",
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
        "piiiiiiiinnpppiiiiippppiiiiiippppp",
        "ppiiiiiiinnpoipiiiippppnippppppppp",
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
        '=': {look:'wallFace'},
        '+': {look:'classWindow'},
        'b': {look:'blackboard', landmark:true, onLook:[{do:[{message:'The blackboard: the teacher has written the numbers on it, {一} to {十}.'}]}]},   // (the numbers in chalk: js/art.js)
        't': {look:'teacherTable', word:'桌子', landmark:true, note:'The teacher’s table, with books and a cup on it.'},
        'd': {look:'desk', word:'桌子', note:'A desk for two, with books on it.'},
        '_': {look:'classFloor', walk:true},
        'm': {look:'doorMat', walk:true}
      },
      map: [
        "#=+=bbbbbbb=+=#",
        "#=+=bbbbbbb=+=#",
        "#________tt___#",
        "#_____________#",
        "#_dd__dd__dd__#",
        "#_____________#",
        "#_dd__dd__dd__#",
        "#_____________#",
        "#_____________#",
        "#######m#######"
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
    // flowers: red, yellow and white, all over the meadow and the home ground. In chapter 1, you pick one of each for the big
    // monkey to plant in front of the school: each shows you what you've picked, such as 红色的花, a red flower, with its
    // picture (picked; decided 22 October 2026: the card just said 花, flower), and message under it
    'F': {look:'redFlowers', walk:true, word:'花', learnOnStep:true, gather:{item:'花', for:'flowers', kind:'红色', count:3, label:'Pick', note:'You pick a flower.',
      picked:{zh:'红色 的 花', en:'A red flower'}, message:'For the big monkey to plant ({flowersPicked}/3). Find the other colours.',
      full:'You have a red, a yellow and a white {花}. Take them to the big monkey.', again:'You have a red {花} already. Find another colour.'}},
    'E': {look:'yellowFlowers', walk:true, word:'花', learnOnStep:true, gather:{item:'花', for:'flowers', kind:'黄色', count:3, label:'Pick', note:'You pick a flower.',
      picked:{zh:'黄色 的 花', en:'A yellow flower'}, message:'For the big monkey to plant ({flowersPicked}/3). Find the other colours.',
      full:'You have a red, a yellow and a white {花}. Take them to the big monkey.', again:'You have a yellow {花} already. Find another colour.'}},
    'J': {look:'whiteFlowers', walk:true, word:'花', learnOnStep:true, gather:{item:'花', for:'flowers', kind:'白色', count:3, label:'Pick', note:'You pick a flower.',
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
    'H': {look:'stall'},   // the shop owner's stall: as wide as its row of H (three squares)
    'R': {look:'rocks', word:'石头', landmark:true, message:'Big rocks block the way up. Maybe they will move once the monkeys are happy.', becomes:[{if:{gate:true}, to:'.'}]},
    // the rock all round the mountain: its top, seen from above (^), and at its front a cliff two squares high (M), as
    // between the hillside's terraces; grassy banks as high, that you hop down (v); and stone steps up them (=)
    'M': {look:'cliffFace', word:'山'},
    '^': {look:'heights', word:'山'},
    '=': {look:'steps', walk:true},
    'W': {look:'water', word:'河', gather:{item:'水', for:'thirsty', label:'Collect', note:'You scoop up some water from the river.', message:'You collected some {水}. Take it to the thirsty monkey.'}},
    'O': {look:'water', word:'鱼', newNote:'Little fish dart about in the pond.', gather:{item:'水', for:'thirsty', label:'Collect', note:'You scoop up some water from the pond.', message:'You collected some {水}. Take it to the thirsty monkey.'}},
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
    'l': {look:'log', word:'树', landmark:true, message:'A fallen tree blocks the way. Maybe the troop can move it one day.'},
    // the Water Curtain Cave
    'Z': {look:'caveWall'},
    'z': {look:'caveFloor', walk:true},
    'C': {look:'curtain', walk:true},   // the water curtain: the way back out
    'U': {look:'water'},   // the stream through the cave
    'I': {look:'ironBridge', walk:true},   // (it taught 桥 until 21 October 2026: the word waits for chapter 1, so the cave has three new words)
    'D': {look:'stoneBed', word:'床', landmark:true, note:'Beds of smooth stone, enough for the whole troop.', onLook:[   // once you know 床, A sleeps in it
      {if:{knows:'床', new:'睡觉'}, label:'Sleep', do:[{card:'睡觉', note:'You lie down on the stone bed and go to sleep.'}, {sleep:'You wake up with all your hearts.'}]},
      {if:{knows:'床'}, label:'Sleep', do:[{sleep:'You wake up with all your hearts.'}]}]},
    'A': {look:'stoneTable', word:'桌子', landmark:true, note:'A big table of stone.'},
    'V': {look:'stoneBowls', word:'碗', landmark:true, note:'Bowls of stone, ready for the troop.'},
    // chapter 1: the way from the waterfall to the home ground, and the home ground's plots, their signs, and the ways out
    'f': {look:'bush', becomes:[{if:{home:{atLeast:1}}, to:'.'}]},   // bushes, until the troop clears a way through them
    'u': {look:'bush', landmark:true, onLook:[{do:[{message:'Thick bushes. The troop will clear a way through here when it’s needed.'}]}]},
    's': {look:'grass', walk:true, becomes:[{if:{school:{atLeast:1}}, to:'t'}, {if:{build:{atLeast:2}}, to:'a'}, {if:{build:{atLeast:1}}, to:'6'}]},   // the school's plot: open grass, until the big monkey marks it out
    '6': {look:'plot', walk:true},   // the school's plot, marked out with string and stakes (as you watch: the markOut step)
    'a': {look:'frame', landmark:true, onLook:[{do:[{message:'The frame of the school is up. The troop is busy building.'}]}]},   // (the school going up on it)
    't': {look:'school', word:'学校', landmark:true, note:'The troop’s school: the sign over its door says {学校}. Walk in through its door.'},   // (and then the school itself: its door is a way in)
    // where the other plots will be marked out, each when its story begins, with its sign (2 to 5): open grass till then
    'd': {look:'grass', walk:true},   // the new shop's (its sign: "The troop wants a new shop here.")
    'h': {look:'grass', walk:true},   // the hive's ("The troop wants a hive here, by the flowers, for bees.")
    'e': {look:'grass', walk:true},   // the garden's ("The troop wants to grow things here, in a garden by the stream.")
    'c': {look:'grass', walk:true},   // the cow pen's ("The troop wants a pen here, for a cow.")
    '2': {look:'grass', walk:true}, '3': {look:'grass', walk:true}, '4': {look:'grass', walk:true}, '5': {look:'grass', walk:true},
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
        note:'Dry wood from a dead pine, for building.', each:'Down comes the dry pine! You take a piece of {木头}.', full:'You have three pieces of {木头}. Take them to the big monkey.'}]},
      {do:[{message:'An old pine, long dead and dry.'}]}]},
    'j': {look:'stump'},   // what's left of a dead pine you've knocked down
    'm': {look:'pebble', word:'石头', onLook:[
      {if:{stones:'asked', holding:{stones:false}}, label:'Pick up', sparkle:true, do:[{change:'i'}, {collect:'石头', for:'stones', count:3,
        each:'You pick up a small {石头}.', full:'You have three small {石头|stones}. Take them to the big monkey.'}]}]},
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
    {id:'elder', x:7, y:1, facing:'down', beard:true, name:{zh:'老猴子', py:'lǎo hóuzi', en:'Old monkey'}, moves:[{if:{school:{atLeast:1}}, place:'school', x:7, y:2, facing:'down'}, {if:{home:{atLeast:2}}, place:'homeGround', x:10, y:6, facing:'down'}, {if:{cave:{atLeast:4}}, place:'cave', x:6, y:9, facing:'down'}, {if:{climb:{atLeast:4}}, place:'falls', x:9, y:1, facing:'left'},
      {if:{gate:true}, x:14, y:2, facing:'right'}],   // by the waterfall once the troop is up there; where the rocks were till then
      palette:{o:'#3A3A36', f:'#A9A79F', s:'#EADCC8', m:'#B89E86', e:'#222222', w:'#FAFAF5'}},
    {id:'big', x:5, y:10, facing:'down', name:{zh:'大猴子', py:'dà hóuzi', en:'Big monkey'}, moves:[{if:{home:{atLeast:1}}, place:'homeGround', x:15, y:4, facing:'down'}, {if:{cave:{atLeast:4}}, place:'cave', x:9, y:8, facing:'down'}, {if:{climb:{atLeast:4}}, place:'falls', x:10, y:2, facing:'left'},
      {if:{gate:true}, x:16, y:1, facing:'down'}],   // in the way up once the rocks have rolled away, where he stops you with a stick for you, and stays (he used to jump there and back)
      palette:{o:'#4A2C17', f:'#B9854E', s:'#F7DABA', m:'#D19A7A', e:'#24160C'}},
    {id:'hungry', x:13, y:5, facing:'down', name:{zh:'饿猴子', py:'è hóuzi', en:'Hungry monkey'},
      moves:[{if:{feast:{atLeast:1}}, place:'homeGround', x:19, y:7, facing:'left'}],   // chapter 1: he comes up from the meadow to look after the feast's big table
      palette:{o:'#4A2C17', f:'#B8743E', s:'#F2C9A0', m:'#C68A64', e:'#24160C'}},
    {id:'thirsty', x:2, y:12, facing:'right', name:{zh:'渴猴子', py:'kě hóuzi', en:'Thirsty monkey'},
      palette:{o:'#40250F', f:'#94592E', s:'#F0C59A', m:'#C08060', e:'#24160C'}},
    {id:'playful', x:15, y:20, facing:'up', name:{zh:'小猴子', py:'xiǎo hóuzi', en:'Little monkey'}, moves:[{if:{school:{atLeast:1}}, place:'school', x:3, y:5, facing:'up'}, {if:{home:{atLeast:1}}, place:'homeGround', x:5, y:8, facing:'right'}, {if:{cave:{atLeast:4}}, place:'cave', x:4, y:8, facing:'right'}, {if:{climb:{atLeast:4}}, place:'falls', x:5, y:2, facing:'up'},
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
    {id:'woodSquirrel', place:'pineWood', x:18, y:21, facing:'left', look:'松鼠'},   // chapter 1: a squirrel in the pine wood, in the clearing by the way in
    // chapter 1: two little monkeys in training on the hillside, practising with sticks like yours (in the book, chapter 3,
    // the Monkey King trains the troop): one by the stepping stones, one on the middle terrace. Each stops you as you pass,
    // the first time, for a word game (see events). holds: what's in its hand; practises: it swings it now and then,
    // facing its own way, while you're not beside it
    {id:'trainee1', place:'hillside', x:20, y:37, facing:'left', holds:'棍子', practises:true, name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      palette:{o:'#4A2C17', f:'#C8894A', s:'#F6D1A7', m:'#C98E6A', e:'#24160C'}},
    {id:'trainee2', place:'hillside', x:9, y:20, facing:'right', holds:'棍子', practises:true, name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      palette:{o:'#40250F', f:'#A56A3A', s:'#F0C89E', m:'#C08060', e:'#24160C'}},
    // chapter 1: two little monkeys at play at the home ground, beside the way up to the hillside, piling stones into a
    // tower between them (the @ square), taking turns, as high as it will go, till it falls and they start again (in the
    // book, chapter 1, the troop plays under the pines and by the stream on a hot day: 跑沙窝，砌宝塔, they run about in the
    // sand and build pagodas). plays: what a monkey is doing, all the time, except while you're talking to it
    {id:'towerL', place:'homeGround', x:21, y:7, facing:'right', plays:'tower', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},   // (by the hillside's stone steps till 24 October 2026: in the way there)
      palette:{o:'#45291A', f:'#B98A5E', s:'#F4D3AE', m:'#C99272', e:'#24160C'}},
    {id:'towerR', place:'homeGround', x:23, y:7, facing:'left', plays:'tower', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
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
    // chapter 1: at the home ground, south of the road, under the tree beside the way down to the bridge, two little monkeys
    // grooming each other, taking turns (in the book, chapter 1: 捉虱子…理毛衣, they pick out fleas and tidy their fur, in the
    // shade of the pines). Under the hillside's first pines till 24 October 2026: the home ground's south was empty
    {id:'groomA', place:'homeGround', x:12, y:13, facing:'right', plays:'groom', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      palette:{o:'#43260F', f:'#B07A48', s:'#F2CDA4', m:'#C48A64', e:'#24160C'}},
    {id:'groomB', place:'homeGround', x:13, y:13, facing:'down', plays:'groom', name:{zh:'猴子', py:'hóuzi', en:'Monkey'},
      palette:{o:'#4A2B13', f:'#C99558', s:'#F6D6B0', m:'#D09A76', e:'#24160C'}},
    {id:'boss', x:11, y:16, facing:'down', name:{zh:'老板', py:'lǎobǎn', en:'Shop owner'},
      palette:{o:'#3E2A14', f:'#9C6A3C', s:'#EFC9A0', m:'#B98260', e:'#24160C'}}
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
    {word:'床', at:[1, 1, 'cave']}, {word:'桌子', at:[3, 3, 'cave']}, {word:'碗', at:[9, 3, 'cave']}
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
    '蜜蜂': 'In the long grass on the mountain path.',   // (until 21 October 2026; the bees of chapter 1 will change this)
    '野猪': 'Blocking the narrow way at the top of the mountain path.',
    '鹿': 'In a sunny glade deep in the pine wood, behind a cracked rock.',
    '狼': 'In the long grass in the pine wood.',
    '狐狸': 'Hiding in the tall grass on the hillside.',
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
    '睡觉': 'The stone beds in the Water Curtain Cave: sleep there to get your hearts back.',
    '碗': 'The stone bowls in the Water Curtain Cave.',
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
    '蜂蜜': 'From the troop’s bees, for the feast.',   // (for later: the bees of chapter 1, to come)
  },

  // Sentences for practising a word without a picture in a lesson, as a gap to fill, for one that no sentence you complete
  // (in a request, the shop or the wardrobe) has: 有 (decided 24 October 2026: without them, the teacher would have a !
  // for it, with nothing to ask). Like those, each needs every word in it caught.
  practiceSentences: [
    {sentence:'我 有 桃子', sentenceEn:'I have peaches.'},
    {sentence:'我 有 朋友', sentenceEn:'I have friends.'},
    {sentence:'我 没有 苹果', sentenceEn:'I don’t have any apples.'}   // (没有)
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
      {word:'蜂蜜', show:{feast:{atLeast:3}}, no:{zh:'我们 没有 蜂蜜 。', en:'We don’t have any honey.'}}   // (the bees: to come)
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
      {id:'table', word:'桌子', say:'hideTable', where:'under the {桌子}', at:[[16, 7], [17, 7], [18, 7]], out:[16, 8], tail:[16, 7, 'left']},
      {id:'bridge', word:'桥', say:'hideBridge', where:'under the {桥}', at:[[15, 18], [16, 18], [17, 18]], out:[15, 17], tail:[16, 18, 'left']},
      {id:'water', word:'水', say:'hideWater', where:'in the {水}', at:[[18, 15], [19, 15], [20, 15], [18, 16], [19, 16], [20, 16]], out:[17, 15], tail:[19, 16, 'right']},
      {id:'flowers', word:'花', say:'hideFlowers', where:'in the {花|flowers}', at:[[26, 2], [27, 2], [28, 2], [29, 2], [30, 2], [27, 3], [28, 3], [29, 3], [30, 3],
        [26, 4], [27, 4], [28, 4], [29, 4], [30, 4], [26, 5], [27, 5], [28, 5], [29, 5], [30, 5]], out:[28, 3], tail:[28, 2, 'right']}
    ]
  },

  // Example sentences for words that no line or story sentence uses, shown on the word's page in
  // the Word Scroll. (A word that only appears in a sentence you complete, such as 头带, shows that.)
  // Checked by a native speaker on 16 October 2026.
  examples: {
    '狐狸': {zh:'狐狸 在 草 里 玩 。', en:'The fox is playing in the grass.'},
    '羊': {zh:'羊 吃 草 。', en:'Sheep eat grass.'},   // (a draft, not checked yet)
    '松鼠': {zh:'松鼠 在 树 上 。', en:'The squirrel is in the tree.'},
    '山羊': {zh:'山羊 在 山 上 吃 草 。', en:'The goat is eating grass on the mountain.'},
    '洞': {zh:'山 里 有 一个 洞 。', en:'There is a cave in the mountain.'},
    '路': {zh:'山 上 有 路 。', en:'There is a path up the mountain.'},   // (drafts, not checked yet)
    '蜘蛛': {zh:'树 上 有 蜘蛛 。', en:'There is a spider in the tree.'},   // (a draft, not checked yet)
    '蜜蜂': {zh:'花 上 有 蜜蜂 。', en:'There is a bee on the flower.'},
    '野猪': {zh:'山 上 有 野猪 。', en:'There is a wild boar on the mountain.'},
    // Chapter 1 (drafts, not checked yet: see CHINESE.md)
    '鹿': {zh:'鹿 在 吃 草 。', en:'The deer is eating grass.'},
    '狼': {zh:'草 里 有 狼 。', en:'There is a wolf in the grass.'}
    // (兔子, 碗, 桌子 and 二 had examples until 21 October 2026: the number lessons' lines use them now)
  },

  // Wild creatures you can fight, in battles (js/battle.js). Each: its word (taught on a card the first time you
  // meet it, with meetNote), its hearts (hits to chase it away), where it attacks from (attacks: you hear one and
  // pick it to jump aside; only words you've caught are used), what it does (meet; hide, then attack, on its turn), the message when it
  // runs off (away) with a reward in shells, and boss: true for a big enemy you can't run from.
  enemies: {
    snake: {word:'蛇', hearts:2, attacks:['草', '石头', '树', '花'], meetNote:'A snake hisses at you from the long grass!', meet:'A {蛇} hisses at you!',
      hide:'The {蛇} slides out of sight…', attack:'The {蛇} strikes!', away:'The {蛇} slithers away into the grass.', reward:1},
    spider: {word:'蜘蛛', hearts:2, attacks:['树', '草', '石头', '山'], meetNote:'A spider scuttles out of the long grass!', meet:'A {蜘蛛} scuttles at you!',
      hide:'The {蜘蛛} scurries out of sight…', attack:'The {蜘蛛} jumps at you!', away:'The {蜘蛛} scurries off into the grass.', reward:1},   // (in the bee's place since 21 October 2026)
    wolf: {word:'狼', hearts:3, attacks:['树', '草', '石头', '木头'], meetNote:'A wolf leaps out of the long grass, growling!', meet:'A {狼} growls at you!',
      hide:'The {狼} slinks out of sight…', attack:'The {狼} pounces!', away:'The {狼} runs off into the pines.', reward:2},   // (chapter 1: in the pine wood)
    boar: {word:'野猪', hearts:4, boss:true, attacks:['石头', '树', '草', '山', '河'], meetNote:'A wild boar blocks the narrow way to the top!',
      meet:'The {野猪} snorts and paws the ground!', hide:'The {野猪} crashes off into the trees…', attack:'The {野猪} charges!', away:'The {野猪} squeals and runs off into the trees.', reward:3}
  },
  // Battles: when you can fight (when), what you hit with (weapon), and what happens if you lose: you rest, with full
  // hearts, at the first restAt whose if matches (lost: the message then).
  battles: {
    when: {knows:'棍子'},   // once the big monkey has given you the stick
    weapon: '棍子',
    restAt: [
      {if:{home:{atLeast:2}}, at:[17, 8, 'homeGround'], facing:'up', lost:'You’re worn out. You crawl back down to the home ground and rest under the big tree until your hearts are full again.'},   // chapter 1: under the big tree (in front of the feast's table, which stands where you rested till 24 October 2026)
      {if:{cave:{atLeast:2}}, at:[3, 2, 'cave'], facing:'up', lost:'You’re worn out. You crawl back to the Water Curtain Cave and sleep until your hearts are full again.'},   // once you've found the cave: by a bed
      {at:[15, 2], facing:'left', lost:'You’re worn out. You crawl back down to the meadow and rest until your hearts are full again.'}
    ]
  },

  // Where fish jump out of the water now and then, one after another.
  fish: [[11, 9], [9, 10], [12, 11], [10, 12]],
  // Dragonflies darting about over the water, each in its own patch, from at to to (squares, in at's place): just to look at
  // (in the book, chapter 1, the troop chases them: 赶蜻蜓)
  dragonflies: [{at:[8, 36, 'hillside'], to:[16, 37]}, {at:[20, 35, 'hillside'], to:[23, 36]}],

  // The area's animals. The id is kept in saved games, so never change it. An animal with at lives
  // at that spot (x, y) on the map, such as up a tree, on a cliff or in a clearing (you can't walk
  // through it): face it and press A to meet it, and home is the word for where it lives. The others
  // hide in the tall grass, which rustles where one is hiding: step in to meet it. One with hides hides
  // only in that place's tall grass (such as the fox, on the hillside). meetNote is on its
  // new-word card the first time. chapter: the chapter it's found in (0, the prologue, if not given),
  // for the counters that count animals (a counter's place counts just those in one place).
  animals: [
    {id:'rabbit', word:'兔子'},
    {id:'sheep', word:'羊', at:[3, 4], home:'草', meetNote:'A sheep is eating grass at the foot of the {山}. Answer its questions to make friends.'},
    {id:'squirrel', word:'松鼠', at:[13, 18], home:'树', meetNote:'A squirrel peeks out of the big {树}! Answer its questions to make friends.'},
    {id:'goat', word:'山羊', at:[4, 16], home:'山', meetNote:'A goat stands on the cliff, chewing. Answer its questions to make friends.'},
    // chapter 1: a deer in the sunny glade deep in the pine wood, behind the cracked rock (counted on its own: the prologue's
    // animals are those above)
    {id:'deer', word:'鹿', at:[30, 3, 'pineWood'], home:'草', chapter:1, meetNote:'A deer looks up from the grass, its ears twitching. Answer its questions to make friends.'},
    // chapter 1: a fox hiding in the hillside's tall grass, only there (hides). It was the prologue's, in the meadow's tall grass, until
    // 23 October 2026, when the sheep took its place, for 羊 (sheep), then 山 + 羊 = 山羊 (goat).
    {id:'fox', word:'狐狸', hides:'hillside', chapter:1, meetNote:'A fox darts out of the {草}, its tail swishing! Answer its questions to make friends.'}
  ],
  // Little birds land near you now and then: face one and press A to see its word (word, with note on its card).
  birds: {word:'鸟', note:'A little bird hops about on the grass, singing.'},
  // Things hidden off the paths (decided 23 October 2026: paths have shells and fruit tucked away in nooks and behind
  // trees), each at something you can't walk through, such as a tree or a boulder, found by pressing A at it, once (the
  // save keeps which: here().finds). A tiny glint gives each away now and then, easy to miss. id: its name in the save;
  // shells: how many it gives you, or fruit: which, for your bag (with no room, it stays till you come back); note: what
  // you find.
  hidden: [
    // the hillside: shells at the foot, on the lowest terrace and on the middle one; apples on the top terrace and under the pines
    {id:'hillTree', at:[22, 39, 'hillside'], shells:2, note:'Tucked behind the tree: 2 🐚!'},
    {id:'hillBoulder', at:[8, 28, 'hillside'], shells:2, note:'Under the edge of the boulder: 2 🐚!'},
    {id:'hillHollow', at:[5, 22, 'hillside'], shells:2, note:'In a hollow in the tree: 2 🐚!'},
    {id:'hillSnack', at:[20, 14, 'hillside'], fruit:'苹果', note:'A little monkey’s hidden snack, behind the tree: a {苹果} for your bag!'},
    {id:'hillPine', at:[19, 4, 'hillside'], fruit:'苹果', note:'Tucked among the pine’s roots: a {苹果} for your bag!'}
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
    {item:'头带', sentence:'我 戴 头带', sentenceEn:'I wear my headband.', teach:'戴', note:'Use 戴 for things you wear on your head.'}
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
    noProblem: {zh:'没关系 ！', en:'That’s OK!'},
    welcome: {zh:'不客气 ！', en:'You’re welcome!'},   // the 老板, when you thank him for what you've bought
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
    needWood: {zh:'我们 要 木头 和 小 石头 ！', en:'We need wood and small stones!'},   // the big monkey, building the school
    wantWood: {zh:'我们 要 木头 。', en:'We need wood.'},
    wantStones: {zh:'我们 也 要 小 石头 。', en:'We need small stones too.'},
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
  //   rest      your hearts are full again
  //   sleep     you sleep (in a bed): the screen goes dark, and you wake with all your hearts (its text: the message then)
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
      {if:{hurt:true}, do:[{rest:true}, {message:'You rest with the old monkey. Your hearts are full again.'}]},
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
      {if:{cave:2, caveThings:3}, do:[
        {say:'inside'},
        {gap:{sentence:'里面 有 床', en:'There are beds inside.', word:'床'}},
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
      {if:{chapter:0, count:3}, do:[{scene:'becomingKing'}, {newWord:'王', note:'The troop names you 美猴王 (Měi Hóuwáng · Handsome Monkey King)!'}, {set:{cave:6}}, {chapter:1}]},
      // chapter 1: at school, he's the teacher. The first time you talk to him there, the class greets him the way children
      // in China do; after that, he gives you a lesson whenever you like (he has a ! when words need practice).
      {if:{school:1}, do:[
        {message:'The little monkeys are sitting at their desks. The old monkey stands at the front: he’s their teacher now!'},
        {say:'classStart'},
        {say:'teacherHi', by:'playful', teach:'老师'},
        {newWord:'老师', note:'The class greets the old monkey: he’s their teacher now.'},
        {say:'classHi'},
        {set:{school:2}},
        {message:'Lessons are where you practise your words now. Talk to the teacher when he has a ! and he’ll give you one.'}
      ]},
      // once the first two lessons have taught you 四 五 六 and 红色 黄色 白色, he has news, before any lesson: the troop has a
      // home, and a school too (teaching 有), so it's time for a great feast (decided 24 October 2026: after the first two
      // lessons, so chapter 1 opens up; it waited till the flowers were planted, after every lesson)
      {if:{school:{atLeast:2}, feast:0, numbersKnown:{atLeast:3}, coloursKnown:{atLeast:3}}, do:[
        {say:'weHave', teach:'有'},
        {newWord:'有', note:'Use 有 to say what you have. (要 is for what you want.)'},
        {set:{feast:1}},
        {message:'Time for a great feast, for the whole troop! It will be at a big {桌子|table} under the big {树|tree}, in the middle of the home ground.'}
      ]},
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
      {if:{school:{atLeast:2}, new:'同学'}, do:[{say:'classmates', teach:'同学'}, {newWord:'同学', note:'The little monkeys at school with you.'}]},
      {if:{school:{atLeast:2}}, do:[{say:'classmates'}]},
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      {if:{new:'猴子'}, do:[{say:'iam', teach:'猴子'}, {newWord:'猴子'}]},
      {if:{new:'朋友'}, do:[{say:'weFriends', teach:'朋友'}, {newWord:'朋友', note:'Come back and play a word game with me any time.'}]},
      {if:{climb:3}, do:[{say:'letsGo'}]},   // following you up to the waterfall
      {if:{story:true, cave:{below:3}}, do:[{say:'scared'}]},
      {do:[{say:'play'}, {wordGame:{ask:'Play a word game with this little monkey?', word:'猴子', notYet:'Learn a few more words first, then come back to play.'}}]}
    ],
    boss: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      {if:{new:'老板'}, do:[{say:'boss', teach:'老板'}, {newWord:'老板', note:'The {老板} owns the shop. Come back to see what they sell.'}, {reply:'你好'}]},
      {do:[{shop:true}]}
    ],
    hungry: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      {if:{hungry:'not asked'}, do:[{request:'hungry'}, {say:'fruitOnTrees'}]},
      {if:{hungry:'asked', holding:{hungry:false}, wanted:{hungry:false}}, do:[{request:'hungry'}, {say:'fruitOnTrees'}]},
      // once he's eaten, he says sorry for being so fussy, and you say that's OK: 没关系, heard when you said sorry, to say now
      {if:{hungry:'done', new:'没关系'}, do:[{message:'The hungry monkey looks a little embarrassed about being so fussy.'}, {say:'sorry'}, {reply:'没关系'}]},
      // a game that helped him before he taught 水果 as he asked (24 October 2026), and never learned it at a fruit tree
      {if:{hungry:'done', new:'水果'}, do:[{say:'fruitOnTrees', teach:'水果'}, {newWord:'水果', note:'Peaches and apples are both fruit.'}]},
      // chapter 1: by the feast's big table, once it's set up, he tells you what the troop has for the feast, and what it
      // hasn't: no honey (teaching 没有, don't have), which he'd love to eat
      {if:{feast:2}, do:[
        {say:'ourTable'},
        {say:'haveFruit'},
        {say:'noHoney', teach:'没有'},
        {newWord:'没有', note:'Use 没有 to say what you don’t have.'},   // (ending on it: 我要… straight after sounded too like it)
        {set:{feast:3}},
        {message:'There’s no honey for the feast! Honey comes from bees: finding them is the next part of chapter 1, coming soon.'}
      ]},
      {if:{feast:{atLeast:3}}, do:[{say:'wantHoney', hint:'Press A at the big {桌子} to see what there is for the feast, and what it still needs.'}]},
      {do:[{request:'hungry'}]}
    ],
    thirsty: [
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      {if:{thirsty:'not asked'}, do:[{request:'thirsty'}, {say:'waterInRiver'}]},
      {if:{thirsty:'asked', holding:{thirsty:false}}, do:[{request:'thirsty'}, {say:'waterInRiver'}]},
      {do:[{request:'thirsty'}]}
    ],
    boar: [{do:[{battle:'boar', win:[{set:{boar:1}}, {message:'The way to the top is clear.'}]}]}],
    // the monkey by the cave's entrance: sleep in a bed to get your hearts back
    doorway: [
      {if:{new:'睡觉'}, do:[{say:'tired', teach:'睡觉'}, {newWord:'睡觉', note:'Sleep in a {床} and all your hearts come back.'}]},
      {do:[{say:'tired', hint:'Face a {床} and press A to sleep. You wake up with all your hearts.'}]}
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
      {if:{new:'木头'}, do:[{say:'hi'}, {reply:'你好'}, {say:'squirrelWood'},
        {message:'The squirrel points its nose at the grey, dead pines. Their wood is dry: one hit with your stick, and down they come!'},
        {message:'Its tail twitches. Wolves live in the long grass, and every way through the wood goes through it. Eating a {桃子} in a fight brings a heart back: pick some at the home ground.'}]},
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
      {if:{elder:0}, do:[{say:'findElder', hint:'Talk to the old monkey by the stone first.'}]},
      {if:{climb:1, new:'棍子'}, do:[   // he stops you as you set off up the path
        {say:'stickHere', teach:'棍子'},
        {newWord:'棍子', note:'The big monkey gives you a stick, to chase wild animals off the path.'},
        {message:'The big monkey shows you how to fight. When something jumps out of the long grass, choose 打 (dǎ, hit) and answer to hit it. When it attacks, listen for where it’s coming from, and pick that to jump aside.'},
        {message:'A wrong answer when it attacks costs a heart, and you have 5. Eat something to get one back, or come back to the old monkey to rest.'}
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
    paintLanterns: {art:'paintingSchool', paints:'红色', captions: [
      {at:0, zh:'我们 去 刷 灯笼 吧 ！', en:'Let’s go and paint the lanterns!'},
      {at:4.4, zh:'灯笼 是 红色 的 ！', en:'The lanterns are red!'}
    ]}
  }
};
