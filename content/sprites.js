// Pixel sprites for collectible words, keyed by the word in the word bank (content/words.js).
// Every word with a picture needs one (the tests check), and every sprite must look different.
// Each sprite is 16 × 16 pixels, one letter per pixel: '.' is see-through, and the palette
// gives each letter's colour.
const SPRITES = {
  '兔子': {   // rabbit
    palette: {o:'#4A3B33', w:'#F2EEE6', g:'#CFC7BA', p:'#F4A6B0', e:'#1E1E1E'},
    rows: [
      "...oo....oo.....",
      "..owpo..owpo....",
      "..owpo..owpo....",
      "..owpo..owpo....",
      "..owwoooowwo....",
      ".owwwwwwwwwwo...",
      ".owwewwwwewwo...",
      ".owwwwppwwwwo...",
      "..owwwwwwwwo....",
      "..owwwwwwwwwo...",
      ".owwwwwwwwwwwo..",
      ".owgwwwwwwgwwoo.",
      ".owgwwwwwwgwwwwo",
      "..owwwwwwwwwwwo.",
      "..oggo..ogggo...",
      "...oo....ooo...."
    ]
  },
  '狐狸': {   // fox
    palette: {o:'#3B2416', r:'#E07B39', d:'#B85A22', w:'#F7F1E8', e:'#1E1E1E', k:'#2B1A10'},
    rows: [
      ".oo........oo...",
      ".oko......oko...",
      ".orro....orro...",
      ".orrroooorrro...",
      ".orrrrrrrrrro...",
      ".orerrrrrrero...",
      "..orrwwwwrro....",
      "...owwkkwwo.....",
      "....owwwwo......",
      "...orrwwrro.....",
      "..orrrwwrrro.oo.",
      "..orrrwwrrrooddo",
      "..orrrrrrrrodwwo",
      "...orrrrrrro.oo.",
      "...okko.okko....",
      "................"
    ]
  },
  '松鼠': {   // squirrel
    palette: {o:'#3A2414', b:'#A0612E', l:'#C98A4E', c:'#F2DDBF', e:'#1E1E1E'},
    rows: [
      ".........oooo...",
      "........ollllo..",
      ".oo....ollllllo.",
      "obbo...olllbllo.",
      "obbbo..ollbbllo.",
      "obebbo.olbblllo.",
      "obbbbbo.ollllo..",
      ".occbbbo.olllo..",
      "..occbbbooolo...",
      "..occcbbbbllo...",
      "..occcbbbblo....",
      "..occcbbbbo.....",
      "..ocbbbbbbo.....",
      "...obbobbo......",
      "...ooo.ooo......",
      "................"
    ]
  },
  '山羊': {   // goat
    palette: {o:'#3E3A33', w:'#EDE8DD', g:'#C9C2B3', h:'#8C7A5B', e:'#1E1E1E', p:'#E8A7A0'},
    rows: [
      "..oo......oo....",
      "..oho....oho....",
      "...oho..oho.....",
      "..ooowwwwooo....",
      ".ogwwwwwwwwgo...",
      "..owewwwwewo....",
      "..owwwwwwwwo....",
      "...owwppwwo.....",
      "....owwwwo......",
      "....oggggo......",
      "..oowwwwwwoo....",
      ".owwwwwwwwwwo...",
      ".owwwwwwwwwwo...",
      ".owgwwwwwwgwo...",
      "..oho....oho....",
      "..oo......oo...."
    ]
  },
  '石头': {   // stone, rock
    palette: {o:'#4A463F', l:'#D6D2C5', m:'#A9A598', d:'#7C786D'},
    rows: [
      "................",
      "................",
      "................",
      ".....ooooo......",
      "...oolllmmoo....",
      "..ollllmmmmdo...",
      ".olllmmmmmmddo..",
      ".ollmmmmmmmddo..",
      "olmmmmmmmmmdddo.",
      "ommmmmmmmmddddo.",
      "ommmmmmmmdddddo.",
      ".ommmmmmdddddo..",
      "..ooddddddddo...",
      "....oooooooo....",
      "................",
      "................"
    ]
  },
  '路': {   // path, road: a dirt path through grass
    palette: {g:'#7CC46B', G:'#5DA651', p:'#D9BB8A', d:'#B89566', e:'#E8D2A6'},
    rows: [
      "ggggggppgggggGgg",
      "gGgggggppggggggg",
      "ggggggpppggggggg",
      "gggggpppdgggGggg",
      "ggggpppppggggggg",
      "gggppdpppggggggg",
      "gggpppppeggggGgg",
      "ggGpppppppgggggg",
      "gggppppdpppggggg",
      "ggggpppppppppggg",
      "gGgggppeppppppgg",
      "gggggppppppdpppg",
      "ggggppppppppppgg",
      "gggpppdpppppppgg",
      "ggpppppppppepppg",
      "gpppppppppppppGg"
    ]
  },
  '你好': {   // hello: a waving hand
    palette: {o:'#5A3A22', f:'#F2C9A0', s:'#D9A57E', b:'#7FB2E5'},
    rows: [
      "................",
      ".......oo.......",
      "....oo.ofo.oo...",
      "...ofo.ofo.ofo..",
      "...ofo.ofo.ofo.b",
      "...ofooofoooofo.",
      "...ofofofofofo.b",
      ".oo.offffffffo..",
      "ofso.offfffffo.b",
      ".ofso.offfffso..",
      "..ofsoffffffso..",
      "...offfffffso...",
      "....offfffso....",
      ".....offffo.....",
      "......oooo......",
      "................"
    ]
  },
  '猴子': {   // monkey
    palette: {o:'#4A2C17', f:'#C98A45', s:'#F6D2A8', m:'#C98E6A', e:'#24160C'},
    rows: [
      "................",
      ".....oooooo.....",
      "....offffffo....",
      "...offffffffo...",
      ".ooofssssssfooo.",
      "osssfsessesfssso",
      "osssfssssssfssso",
      ".ooofssmmssfooo.",
      "...offssssffo...",
      "...offffffffo...",
      "..offfssssfffo..",
      ".offffssssffffo.",
      ".of.ffssssff.fo.",
      "...offffffffo...",
      "...offo..offo...",
      "...ooo....ooo..."
    ]
  },
  '山': {   // mountain: two peaks with snow
    palette: {o:'#3B4A3E', w:'#F4F6F7', g:'#6F9A5C', G:'#4E7A42', r:'#8E8A7E'},
    rows: [
      "................",
      "................",
      "......oo........",
      ".....owwo.......",
      "....owwwwo......",
      "....owrwwo......",
      "...owrrrwro..oo.",
      "...orrrrrrro.owo",
      "..orrrgrrrrrowwo",
      "..orggggrrrrorro",
      ".ogggggggrrrorro",
      ".oggGgggggGrrrgo",
      "oggGGggggGGGgggo",
      "ogGGGGgggGGGGGgo",
      "oooooooooooooooo",
      "................"
    ]
  },
  '花': {   // flower
    palette: {o:'#7A2E4A', p:'#F48FB1', P:'#E06A93', y:'#FFE07A', Y:'#E8B83A', g:'#3E8A3E', G:'#2C6B2C'},
    rows: [
      "......ooo.......",
      ".....opppo......",
      "..ooopppPpooo...",
      ".opppoPpPopppo..",
      ".opPppoyyoppPo..",
      "..oPPpyYYypPo...",
      "..oppoyYYyoppo..",
      ".opppPoyyoPpppo.",
      ".oppPpooooppPpo.",
      "..oooPpo.oPooo..",
      ".....ooGgo......",
      "..gg....Gg..gg..",
      ".gGGg...Gg.gGGg.",
      "..gGGg..GggGGg..",
      "....gGg.GgGg....",
      "......gGGg......"
    ]
  },
  '草': {   // grass: tufts of grass
    palette: {d:'#2F6E38', g:'#4E9A45', l:'#94D883'},
    rows: [
      "................",
      "................",
      "...l........l...",
      "...g.....l..g...",
      "..lg..l..g..gl..",
      "..gg..g..gl.dg..",
      "l.gd.lg.lg..dg.l",
      "g.dd.gd.gd.ldg.g",
      "gldg.dd.dg.gdglg",
      "gdgglddgdgggddgd",
      "ddgdgddgddgdddgd",
      "dddddddddddddddd",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  '树': {   // tree (the same tree as on the map)
    palette: {o:'#1F4D2A', d:'#2F7A3E', l:'#3F9A4C', h:'#6CC066', t:'#8A5A32', k:'#5E3B1F'},
    rows: [
      "....oooooooo....",
      "..oolllhhhlloo..",
      ".olllhhhhlllldo.",
      "olllhhhllllllddo",
      "ollhhllllllllddo",
      "ollllllllllldddo",
      "odlllllllllddddo",
      "oddllllllldddddo",
      ".oddddlldddddo..",
      "..oodddddddoo...",
      "....ooottooo....",
      "......otko......",
      "......otko......",
      "......otko......",
      ".....ootkoo.....",
      "................"
    ]
  },
  '桃子': {   // peach
    palette: {o:'#8A3B2A', p:'#F7A08F', q:'#E8735F', r:'#FFD3BF', y:'#F7C28A', g:'#4E9A45', G:'#2F6E38', k:'#6B4A2A'},
    rows: [
      "................",
      "........k.......",
      ".......kGgg.....",
      "......okgGGgg...",
      "....oooo.ggg....",
      "...orrppqoppo...",
      "..orrpppqppppo..",
      ".orrppppqpppppo.",
      ".orpppppqppppqo.",
      ".oyppppppqppqqo.",
      ".oypppppqppqqqo.",
      ".oyyppppqppqqqo.",
      "..oyyppppqqqqo..",
      "...oyyyqqqqqo...",
      "....oooooooo....",
      "................"
    ]
  },
  '苹果': {   // apple
    palette: {o:'#5E1418', r:'#E8343C', R:'#A8161E', w:'#FFB3B3', k:'#6B4A2A', g:'#4E9A45', G:'#2F6E38'},
    rows: [
      "................",
      ".......k........",
      ".......kGgg.....",
      ".......kgGG.....",
      "...ooo.k.ooo....",
      "..orrrooorrro...",
      ".orwwrrrrrrrRo..",
      ".orwrrrrrrrrRo..",
      ".orrrrrrrrrrRo..",
      ".orrrrrrrrrRRo..",
      ".orrrrrrrrrRRo..",
      ".oRrrrrrrrRRRo..",
      "..oRrrrrrRRRo...",
      "..oRRRooRRRRo...",
      "...ooo..oooo....",
      "................"
    ]
  },
  '河': {   // river: water winding between green banks
    palette: {g:'#7CC46B', G:'#5DA651', b:'#3F8FCB', B:'#2C6B9E', l:'#8ACFF0'},
    rows: [
      "gggggGbbbggggggg",
      "gGggggbbbbgggGgg",
      "gggggGbblbgggggg",
      "gggggbbbbbbggggg",
      "ggggGbbbblbbgggg",
      "gGgggBbbbbbbgggg",
      "gggggGBbbbbbbggg",
      "gggggggBbblbbggg",
      "ggGggggGbbbbbbgg",
      "ggggggggBbbbbbgG",
      "gggggggGbbbblbgg",
      "gggGgggbbbbbbBgg",
      "ggggggbbblbbBggg",
      "gggggbbbbbbBgggg",
      "ggGgbbblbbBggGgg",
      "ggggbbbbbbgggggg"
    ]
  },
  '水': {   // water: a drop
    palette: {o:'#1F5A8A', b:'#4FA3DB', d:'#2F7FBF', l:'#BFE6FA', w:'#FFFFFF'},
    rows: [
      ".......oo.......",
      ".......oo.......",
      "......obbo......",
      "......obbo......",
      ".....obbbbo.....",
      ".....obbbbo.....",
      "....obbbbbbo....",
      "...obbbbbbbbo...",
      "...olbbbbbbbo...",
      "..owlbbbbbbbdo..",
      "..owlbbbbbbbdo..",
      "..olbbbbbbbbdo..",
      "..obbbbbbbbddo..",
      "...obbbbbbddo...",
      "....oddddddo....",
      ".....oooooo....."
    ]
  },
  '鱼': {   // fish
    palette: {o:'#7A2E10', f:'#F28C38', F:'#D96A1E', w:'#FFE1C2', e:'#1E1E1E'},
    rows: [
      "................",
      "................",
      "......ooo.......",
      ".....oFFFo......",
      "...ooffffoo...oo",
      "..offfffffffooFo",
      ".offewffffffoFFo",
      ".offffffFfffFFo.",
      "offwwffffFffFFo.",
      ".owwwffffFfffFFo",
      "..owwwfffffooFFo",
      "...oowwwwwo..ooo",
      ".....oFFo.......",
      "......oo........",
      "................",
      "................"
    ]
  },
  '鸟': {   // bird (the blue bird across the bridge)
    palette: {o:'#2B3F66', b:'#5AA0E6', B:'#3C7CC2', w:'#CDE6FA', e:'#111111', y:'#F2A33A', Y:'#C97A1A'},
    rows: [
      "................",
      "................",
      ".......oooo.....",
      "......obbbbo....",
      ".....obbbbbbo...",
      "...yyobebbbbo...",
      "..yYyobbbbbbo...",
      "....obbbwwwbbo..",
      "...obbbwwwwBBo..",
      "..obbbbwwwBBBBo.",
      "..obbBBBwBBBBBBo",
      "...obBBBBBBBoo.o",
      "....oooooooo....",
      "......o..o......",
      ".....oy.oy......",
      "................"
    ]
  },
  '动物': {   // animal: a paw print
    palette: {o:'#3B2416', p:'#8A5A32', l:'#B98A55'},
    rows: [
      "................",
      ".....oo...oo....",
      "....oppo.oppo...",
      "....oplo.oplo...",
      "..oo.oo...oo.oo.",
      ".oppo.......oppo",
      ".oplo.......oplo",
      "..oo..oooo...oo.",
      "....oopppppoo...",
      "...opplpppppo...",
      "..opplpppppppo..",
      "..opppppppppppo.",
      "..oppppppppppo..",
      "...oppppoopppo..",
      "....oooo..ooo...",
      "................"
    ]
  },
  '洞': {   // cave: a dark opening in the rock
    palette: {o:'#3A352E', r:'#A3A094', R:'#8E8A7E', d:'#6F6B61', k:'#15120F', K:'#2A2622', g:'#7CC46B', G:'#5DA651'},
    rows: [
      "................",
      "....oooooooo....",
      "..oorrrrrrRRoo..",
      ".orrrrRRRRRRRdo.",
      "orrrRRoooooRRddo",
      "orrRRoKKKKKoRddo",
      "orRRoKkkkkkKoddo",
      "orRoKkkkkkkkKodo",
      "oRRoKkkkkkkkKodo",
      "oRRoKkkkkkkkKodo",
      "oRdoKkkkkkkkKodo",
      "oRdoKkkkkkkkKodo",
      "oddoKkkkkkkkKodo",
      "gggoKkkkkkkkKoGg",
      "ggggggggggggggGg",
      "................"
    ]
  },
  '吃': {   // to eat: a bowl of rice with chopsticks
    palette: {o:'#3A2A1E', w:'#FFFFFF', W:'#E2E2DA', c:'#B98A55', C:'#8A5A32', b:'#4F8FCB', B:'#2F6EA8', k:'#2C2C2C'},
    rows: [
      "..........cC....",
      ".........cC.....",
      "........cC..cC..",
      ".......cC..cC...",
      "......cC..cC....",
      "....wwwwcCwW....",
      "..wwwwwcCwwwWW..",
      ".owwwwwwwwwwWWo.",
      ".obbbbbbbbbbbBo.",
      "..obbwbbbbbbBo..",
      "..obbbbbbbbBBo..",
      "...obbbbbbBBo...",
      "....oBBBBBBo....",
      ".....oooooo.....",
      "................",
      "................"
    ]
  },
  '喝': {   // to drink: a cup with a straw
    palette: {o:'#3A2A1E', w:'#F4F1EA', r:'#D9534F', y:'#F2C94C', Y:'#D9A21E', l:'#FFFFFF', s:'#E8343C'},
    rows: [
      "..........ss....",
      ".........ss.....",
      "........ss......",
      ".......ss.......",
      "...oooossooooo..",
      "...owwwssywwwo..",
      "...oyyyssyYYYo..",
      "....oyylyyyYo...",
      "....oyylyyyYo...",
      "....oryyyyyro...",
      "....orrrrrrro...",
      ".....oyyyyYo....",
      ".....oyyyyYo....",
      ".....oyyyyYo....",
      ".....oooooo.....",
      "................"
    ]
  },
  '朋友': {   // friend: a monkey and a rabbit holding hands, under a heart
    palette: {o:'#4A2C17', f:'#C98A45', s:'#F6D2A8', e:'#24160C', w:'#F2EEE6', g:'#CFC7BA', p:'#F4A6B0', r:'#E8343C'},
    rows: [
      ".....rr.rr..o.o.",
      ".....rrrrr.owowo",
      "..oooo.r...owowo",
      ".offffo....owowo",
      "osesseso..owwwwo",
      ".osssso..owewewo",
      "..offo...owwpwwo",
      ".offffo...owwwo.",
      "offssfffwwwwwwo.",
      "offssfoowwwwwo..",
      ".offffo.owwgwwo.",
      ".offffo.owwwwwo.",
      ".of..fo..owwwo..",
      ".oo..oo..oo.oo..",
      "................",
      "................"
    ]
  }
};
