// The animals as they look walking about on the map: 16 × 16 pixels, the size of a square, one letter per
// pixel ('.' is see-through) and each letter's colour in its palette. Each is drawn at its size (decided 30 October
// 2026: a bee as big as a bear looked odd), at the bottom of its square: tiny, about half a square (a bee, a frog);
// small, about two-thirds (a rabbit, an owl); medium, the whole square (a fox, a sheep); and big, on a bigger canvas
// (22 × 22) that stands up out of its square, taller than you, as a tree does (a deer, a cow, a bear), still taking up
// just the one square: drawFigure() in js/draw.js. Their pictures, on cards and in questions, are all one size. Every animal and wild creature in an area
// needs one (the tests check). Their pictures everywhere else, bigger and sharper, are in content/pictures.js.
// faces: which way it looks, 'left' or 'right' (none if it looks at you), so it can be turned to face you when it jumps
// out or you meet it.
const MAP_SPRITES = {
  '兔子': {   // rabbit
    // small: 11 pixels, lifted 2 pixels into the middle of its square, drawn with the shape kit from its picture in tools/draw-pictures.js
    palette: {a:'#494541', b:'#BEBBB5', c:'#5B5853', d:'#F7F5EF', e:'#5A3F3F', f:'#F4A6B0', g:'#8E8B87', h:'#3A3632', i:'#F4F0E8', j:'#1E1A16', k:'#5C4A49', l:'#F8C8CE', m:'#B48A82', n:'#C7C7C7', o:'#4C4946', p:'#37332E', q:'#85817A'},
    rows: ["................", "................", "................", "....abaaba......", "....cdbefba.....", "....efbefba.....", "....efbgfba.....", "....hggigh......", "....cdjijba.....", "....klgmgh......", "....cdigiba.....", "....cdiiibno....", "....abbbbbno....", "....pqqpqqp.....", "................", "................"]
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
  '黄蜂': {   // wasp, side on (chapter 1, in the tall flowers of the bees' valley)
    faces: 'left',
    palette: {a:'#565857', b:'#424A4D', c:'#E7F4FA', d:'#A9C9DA', e:'#DDEFF8', f:'#4D3B0C', g:'#5C4E25', h:'#C99A10', i:'#2E2925', j:'#17120D', k:'#5E5127', l:'#1A140E', m:'#F8D65D', n:'#F5C518', o:'#6A635D', p:'#211913', q:'#FFE066', r:'#2A2018', s:'#111111'},
    rows: [
      "................",
      "................",
      ".....aaaaaab....",
      "....accccccdb...",
      "...bdeeeedddb...",
      "...fbddddbbb....",
      ".gfhffijkklkl...",
      "gmmnmhopqqrqrlf.",
      "gmsnnhrrqnrnrqhf",
      "fhhnhhrrqnrnrhhf",
      ".ffhjppphhrhrlf.",
      "...flrljfflfl...",
      "....lrl.........",
      ".....l..........",
      "................",
      "................"
    ]
  },
  '蝴蝶': {   // butterfly, its wings open, seen from above (it looks at nobody: no faces)
    // tiny: 9 pixels, lifted 3 pixels into the middle of its square, drawn with the shape kit from its picture in tools/draw-pictures.js
    palette: {a:'#5E5B58', b:'#17120D', c:'#241D16', d:'#FFFFFF', e:'#211913', f:'#4A3C30', g:'#FFB866', h:'#C8641A', i:'#4C2A0F', j:'#2A2018', k:'#5E492E', l:'#FFC67A', m:'#C8741A', n:'#4C2F0F'},
    rows: ["................", "................", "................", "................", "....ab...ca.....", "...adebbcfda....", "...dgheefghd....", "...ihhjejhhi....", "...beeeeeeeb....", "....klmelmn.....", "....nmmemmn.....", "...addeeedda....", "....aabbbaa.....", "................", "................", "................"]
  },
  '松鼠': {   // squirrel
    faces: 'left',
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
  '羊': {   // sheep: woolly, with a black face and legs
    palette: {o:'#3A342F', w:'#F6F2E8', g:'#D6CFBF', k:'#2B2622', e:'#FFFFFF', n:'#6A6058'},
    rows: [
      ".....oooooo.....",
      "....owwgwwwo....",
      "...owwwwwwgwo...",
      "..oowkkkkkkwoo..",
      ".okkokkkkkkokko.",
      "..ooookekkekooo.",
      "..owwkkkkkkwwo..",
      ".owwwwkkkkwwwwo.",
      ".owgwwknnkwwgwo.",
      ".owwwwwkkwwwwwo.",
      ".owgwwwwwwwwgwo.",
      ".owwwwgwwgwwwwo.",
      "..owwwwwwwwwwo..",
      "...owwwwwwwwo...",
      "...okko..okko...",
      "...oooo..oooo..."
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
  '鹿': {   // deer (chapter 1, in the pine wood)
    // big: 22 pixels, on a 22 × 22 canvas, standing up out of its square, drawn with the shape kit from its picture in tools/draw-pictures.js
    faces: 'left',
    palette: {a:'#33281C', b:'#7A6042', c:'#533C26', d:'#3E2614', e:'#302012', f:'#714724', g:'#DE9E62', h:'#9A5A28', i:'#FFFFFF', j:'#1E1A16', k:'#C27A3E', l:'#1A130E', m:'#2A1E16', n:'#5B5853', o:'#494541', p:'#FBF1DE', q:'#F7F5EF', r:'#BEBBB5', s:'#E9C79C', t:'#B08667', u:'#6F401E', v:'#301E10', w:'#574939', x:'#1F1710', y:'#3A2A1E'},
    rows: [".aba...aba............","..aba.aba.............",".abbbaabba............","..aababacd............","...efgfcghd...........",".ccgijkfhd............","cggfjjkfhd............","lmkkfhfkhd.cccd.......",".dhhddhkkhcggghddnno..","..dd..cgkhgpkpkphqqro.","......dhhkkkkkkkkhrro.","......cgkkkpkpkpkphd..","......dhkkkkkkkkkhd...",".......dhkkkkkkkhhd...",".......effsssssfftuv..",".......cgfuvwwcgftuv..",".......cgfuv..cgftuv..",".......cgfuv..cgftuv..",".......cgfuv..cgftuv..",".......cgfuv..cgfuuv..",".......xyyx...xyyxv...","........xx.....xx....."]
  },
  '乌龟': {   // turtle, side on, head to the left (chapter 1: on a warm rock in the hot spring valley)
    // small: 11 pixels, drawn with the shape kit from its own map drawing
    faces: 'left',
    palette: {a:'#3A3B21', b:'#252613', c:'#35361E', d:'#8E9C52', e:'#4E5826', f:'#7E8A48', g:'#6E7A3A', h:'#1E1A16'},
    rows: ["................", "................", "................", "................", "................", "................", "................", "................", ".....aaaab......", "...caddddeb.....", "..cfdgdgdgeb....", "..fhdggggdgeb...", "..cfeeeeeeeeb...", "...ccfcbbcfc....", "....cfc..cfc....", ".....c....c....."]
  },
  '海龟': {   // sea turtle, seen from above, its flippers out (chapter 1: on the shore's sand)
    // medium: 14 pixels, lifted 1 pixel into the middle of its square, drawn with the shape kit from its own map drawing, its eyes by hand
    palette: {a:'#444F45', b:'#2A3C2F', c:'#AFD8C2', d:'#5E9E7E', e:'#1E1A16', f:'#8CC7A8', h:'#264239', i:'#4FB09E', j:'#1E6A5C', k:'#162B24', l:'#2F8F7E', m:'#5FB8A6'},
    rows: ["................", "................", ".......ab.......", "......acdb......", "..b..beffeb..b..", ".bdb.hiiijk.bdb.", ".bddhilllljacdb.", "..bddillmljddb..", "...hilllllljk...", "...hilllllljk...", "...kjlmlllmjk...", "....hilllljk....", "...acjjlmjjk....", "...bddkjjbddb...", "....bb.kk.bb....", "................"]
  },
  '老鼠': {   // mouse, side on, head to the left, a long pink tail (chapter 1: hiding in the melon field's tall grass)
    // tiny: 9 pixels, lifted 3 pixels into the middle of its square, drawn with the shape kit from its own map drawing
    faces: 'left',
    palette: {a:'#322E2A', b:'#77736D', c:'#463231', d:'#4A4642', e:'#C2BEB8', f:'#F2B8C0', g:'#B57D83', h:'#4A282A', i:'#C2606E', j:'#1E1A16', k:'#9E9A94', l:'#5C5956', m:'#563D3D', n:'#E8A0A8'},
    rows: ["................", "................", "................", "................", "................", "......a.........", ".....aba...c....", "....defbaacg....", "...habfeebcg....", "...ijklkkkba....", "...abblkkkba....", "....aabbbba.....", "......aamnm.....", "................", "................", "................"]
  },
  '青蛙': {   // frog, facing you, on a lily pad (chapter 1: on the brook by the south slope's stepping stones)
    // tiny: 9 pixels, lifted 3 pixels into the middle of its square, drawn with the shape kit from its own map drawing, its eyes by hand
    palette: {a:'#384D29', b:'#203617', c:'#8AD46A', d:'#3F8A34', e:'#1E1A16', f:'#FFFFFF', h:'#5DB34A', i:'#D2EAA2', j:'#78B07E', k:'#1A2B17', l:'#2C6A34'},
    rows: ["................", "................", "................", "................", "................", ".....ab.ab......", "....acdacdb.....", "....bfecefb.....", "....achhhdb.....", "...acciiiddb....", "...dhdiiidhd....", "...bdjjijjdb....", "...klllllllk....", "................", "................", "................"]
  },
  '马': {   // horse, side on, head to the left (chapter 1: out on the pasture's grass)
    // big: 22 pixels, on a 22 × 22 canvas, standing up out of its square, drawn with the shape kit from its picture in tools/draw-pictures.js
    faces: 'left',
    palette: {a:'#352112', b:'#4D3623', c:'#5A544B', d:'#7E4A24', e:'#C98A58', f:'#F4E8D4', g:'#613C22', h:'#FFFFFF', i:'#1E1A16', j:'#A8683A', k:'#2D1C11', l:'#1B120C', m:'#75665C', n:'#3A2416', o:'#413227', p:'#A58066', q:'#5E3418', r:'#2A1A0E', s:'#2A1E16', t:'#322A24', u:'#2B1D12', v:'#623A1C', w:'#2C1C10', x:'#1A130E'},
    rows: ["........a.............", ".....bcada............", "....befgda............", "...behijgkl...........", "..bejiijgkl...........", "..bejfjgjmkl..........", ".bejfjgjjknklbbba..l..", ".bejfjgjjdkkeeeedalkl.", "oppqjdbejjdkjjjjjedkl.", "rqsdqraddddjjjjjjjjdkl", ".rqqr.bejjjjjjjjjjjdkl", "..rr..adjjjjjjjjjjjdmk", ".......adjjjjjjjjjddmk", "........adddjjjdddatmk", "........ugpvddduggpvmk", "........ugpvwaabegpvmk", "........ugpvw..begpvkl", "........ugpvw..begpvkl", "........ugpvw..begpvw.", "........ugssx..begssx.", "........xsxx...xssxx..", ".........x......xx...."]
  },
  '鸭子': {   // duck, side on, floating (chapter 1: swimming on the home ground's stream)
    // small: 11 pixels, lifted 3 pixels into the middle of its square, drawn with the shape kit from its own map drawing
    faces: 'left',
    palette: {a:'#524D46', b:'#D9D3C4', c:'#5E5B58', d:'#FFFFFF', e:'#1E1A16', f:'#4D2F0F', g:'#C9741A', h:'#F7F5EE', i:'#8F8E8A', j:'#4A4742', k:'#C1BFBA', l:'#87837B', m:'#424F55', n:'#A8D8F5'},
    rows: ["................", "................", "................", ".....a..........", "....aba.........", "...cdeba....a...", "..fgdhbaca.ab...", "...abiiddbcdb...", "....jkdhlllbb...", "....jkhllllba...", "....abhhhhhba...", "....mabbbbba....", "...mnnmaaaa.....", "................", "................", "................"]
  },
  '猫头鹰': {   // owl, facing you (chapter 1: perched on a dead pine in the dark pines)
    // small: 11 pixels, drawn with the shape kit from its picture in tools/draw-pictures.js, its eyes by hand
    palette: {a:'#2E2115', b:'#423323', c:'#6A4A2C', d:'#A88158', e:'#EFE0C2', f:'#8A6440', g:'#FFFFFF', h:'#C9741A', i:'#FFC24A', j:'#A8741E', k:'#382A1B', l:'#402B18', m:'#4E3420', n:'#251A11', o:'#A07A52', p:'#21170E', q:'#241A11', r:'#4A3220', s:'#D9A030', t:'#523D16', u:'#595145', v:'#1E1A16'},
    rows: ["................","................","................","................","................",".....abbaa......","....acddcca.....","...aceefeeca....","...bdivjvica....","...aceejeeca....","...kflcjclmn....","...kfleeolmn....","...kfleoelmn....","...plleeellpq...","..qrrrsesrrrr...","...qqqtutqqqq..."]
  },
  '牛': {   // cow (chapter 1: lost in the pasture, south of the home ground)
    // big: 22 pixels, on a 22 × 22 canvas, standing up out of its square, drawn with the shape kit from its picture in tools/draw-pictures.js
    faces: 'left',
    palette: {a:'#494234', b:'#BFAF8C', c:'#59534A', d:'#EFE7D3', e:'#5E5B58', f:'#FFFFFF', g:'#1E1A16', h:'#2B2724', i:'#1A1612', j:'#514D46', k:'#8F8E89', l:'#D8D2C4', m:'#F7F4EC', n:'#5C4946', o:'#F8C7C7', p:'#8C6161', q:'#9A4C50', r:'#F2A7A8', s:'#513433', t:'#D8858A', u:'#392926', v:'#ACA79C', w:'#433F39', x:'#3A3733', y:'#F6C1C2', z:'#E7E2D9', A:'#221E1C', B:'#171310', C:'#1F1A16', D:'#3A3430'},
    rows: ["..aa...a..............",".abba.aba.............","..abacdba.............",".effghhhij............",".efgghhkllj...........",".efmmmhhij............",".efmmmmljiiieeeeeei...","noppppmkhhhhffffffhi..","noqrqpklhhhhhmmmmmhhi.","sttttpllhhhhmmmhhhmlj.",".ssssuefmmmmmmhhhhhlvw","......efmmmmmmhhhhhlvw","......efmmmmmmmhhhhlvw","......jlmmmmmmmmhmmlvw",".......xkkllyyytkklvvw",".......efkzvttttkkzvAB",".......efkzvwssefkzAAB",".......efkzvw..efkzvAB",".......efkzvw..efkzvw.",".......efkvvw..efkvvw.",".......CDDDDC..CDDDDC.","........CCCC....CCCC.."]
  },
  // wild creatures, which jump out of long grass to fight (drawn with the shape kit in tools/draw-pictures.js, at 16 × 16)
  '螃蟹': {   // crab (chapter 1, on the shore's sand): facing you, its claws up, eyes on stalks; it walks sideways
    // tiny: 9 pixels, lifted 3 pixels into the middle of its square, drawn with the shape kit from its picture in tools/draw-pictures.js
    palette: {a:'#441C16', b:'#57322D', c:'#AF3A2F', d:'#5E5B58', e:'#E98077', f:'#361712', g:'#822B23', h:'#FFFFFF', i:'#4C1C16', j:'#C83A30', k:'#F47C66', l:'#471A15', m:'#E04A3C', n:'#B8332B', o:'#9E2A22', p:'#3F1712'},
    rows: ["................", "................", "................", "................", "................", "...aa.....ba....", "...ccad.dbec....", "...fgdhdhfgf....", "...ijiacaiji....", "....bekkeca.....", "...lbemmmcal....", "...naccoccln....", "...l.aapaa.l....", "................", "................", "................"]
  },
  '蛇': {   // snake
    faces: 'right',
    palette: {a:'#414F29', b:'#233113', c:'#A6D86A', d:'#477A26', e:'#6CA83E', f:'#1E1A16', g:'#511C19', h:'#D83A3A', i:'#3F6124'},
    rows: ["................","................",".........aab....","......aaaccdb...",".....accceefdb..","....aceddeeedbg.","...acedbbdddghhg","..aceedb.bbb.gg.","..acedb.........","..bdedb.........","...acdbaaaaab...","..aciiccccccdb..",".aceiieeeeeeedb.",".bdeeeeeeeeeedb.","..bddddddddddb..","...bbbbbbbbbb..."]
  },
  '蜘蛛': {   // spider
    // tiny: 9 pixels, lifted 3 pixels into the middle of its square, drawn with the shape kit from its picture in tools/draw-pictures.js
    palette: {a:'#1B1519', b:'#2F2831', c:'#16120E', d:'#2D2538', e:'#6E5E84', f:'#1E1A16', g:'#1A1518', h:'#2B2335', i:'#30263E', j:'#1C161B', k:'#4A3D5C', l:'#E08A3C'},
    rows: ["................", "................", "................", "................", "................", "....a.bcc.a.....", "...adbeffada....", "...ddghffadd....", "...aabehijaa....", "...ajiklkija....", "...dajiiijad....", "...adajjjada....", "....a.....a.....", "................", "................", "................"]
  },
  '蜂王': {   // queen bee, side on, with her little gold crown (chapter 1: out of her old tree in the bees' valley, and home with you)
    faces: 'left',
    palette: {a:'#5E5B58', b:'#424A4D', c:'#4D3B16', d:'#FFFFFF', e:'#A9C9DA', f:'#C99A2E', g:'#DDEFF8', h:'#511C19', i:'#D83A3A', j:'#FFE58A', k:'#1F1812', l:'#3A2E22', m:'#FFD866', n:'#2A231E', o:'#5E5048', p:'#2D241B', q:'#E8B22E', r:'#B5841A', s:'#46340F', t:'#1B150F'},
    rows: ["................","................",".......aaaaaab..","....c.addddddeb.","..ccfadgggggggeb",".cfcfcfgggggggeb",".cfhijfeeeeeeeb.",".cfffffklmmlkk..","..noopmmlqqlmlk.",".nolllpqlqqlqlrs",".nolllpqlqqlqlrp",".tplllpqlqqlqlrs","..tppprqlqqlqlk.","...tttsrlrrlrs..",".......skssks...","................"]
  },
  '蜜蜂': {   // bee
    // tiny: 8 pixels, lifted 3 pixels into the middle of its square, drawn with the shape kit from its picture in tools/draw-pictures.js
    faces: 'left',
    palette: {a:'#5E5B58', b:'#424A4D', c:'#FFFFFF', d:'#A9C9DA', e:'#1F1812', f:'#3A2E22', g:'#FFE58A', h:'#2D241B', i:'#F2C14E', j:'#C99A2E', k:'#4D3B16', l:'#1B150F'},
    rows: ["................", "................", "................", "................", "................", "......aaab......", ".....acccdb.....", ".....bddddb.....", ".....aefgfe.....", "....achfifjk....", "....lhhfifjk....", ".....lefjfe.....", ".......eke......", "................", "................", "................"]
  },
  '野猪': {   // wild boar
    // big: 20 pixels, on a 22 × 22 canvas, standing up out of its square, drawn with the shape kit from its picture in tools/draw-pictures.js
    faces: 'left',
    palette: {a:'#201710', b:'#3E2A1C', c:'#221810', d:'#432C1E', e:'#A07250', f:'#7A5236', g:'#3F2E20', h:'#231911', i:'#47301F', j:'#563826', k:'#281B13', l:'#FFFFFF', m:'#1E1A16', n:'#BEBBB5', o:'#966C53', p:'#3C2C21', q:'#494541', r:'#241911', s:'#352D27', t:'#806E64', u:'#3A251B', v:'#372417', w:'#49301F', x:'#1E150E', y:'#1F150F'},
    rows: ["......................","......................","......................","......................","......................","......................",".........aaaaa........","......aaabbbbbaaa.....",".....abbbbbbbbbbbaa...",".....cdeeffffffebbba..","....ghidfffffffffjka..","...geefiiiffffffffjba.","..geflmffiffffffffjk..","..gefmmfffifffffffjk..",".abnofffffifffffffjk..",".ponoffffiffffffffjk..","..pqnjjjiffffffffjk...","....qkkkjjjffjjjjkr...","......stuvkjjkstuvwr..","......stuvxkk.stuvwr..","......yurwr...yurwwr..",".......y.r.....y.rr..."]
  },
  '熊': {   // bear (chapter 1, at the pasture's big rocks): standing up on its hind legs, facing you, its front paws raised
    // big: 22 pixels, on a 22 × 22 canvas, standing up out of its square, drawn with the shape kit from its picture in tools/draw-pictures.js
    palette: {a:'#422F1E', b:'#2A1C11', c:'#A87448', d:'#5E3A20', e:'#50341E', f:'#5A564F', g:'#8A5A34', h:'#F4EEE2', i:'#261A10', j:'#FFFFFF', k:'#1E1A16', l:'#E6C29C', m:'#A8805A', n:'#D2A982', o:'#7A5034', p:'#9C6A40'},
    rows: [".....aab.....aab......","....accdbaaaaccdb.....","....acddecccecddb.....",".fffbddegggggeddb.fbf.","fhhhfiejkgggjkei.fhdhf","acgdbackkgggkkdbacgdb.","acggdacgglkmggdacggdb.","bdgggdeglnknmgecgggdb.",".bdggdegmnnnmgecggdb..","..acggeeemomeeeggdb...","..bdgggegeeegegggdb...","...bdgegggggggegdb....","....iegggpppgggei.....","...acgggpppppgggdb....","...acggpppppppggdb....","...bdggpppppppggdb....","....acgpppppppgdb.....","....bdggpppppggdb.....",".....bddgpppgddb......",".....acgdddddgdb......",".....bdddbbbdddb......","......bbb...bbb......."]
  },
  '狼': {   // wolf (chapter 1, in the pine wood's long grass)
    faces: 'left',
    palette: {a:'#2A2A29', b:'#5E656C', c:'#454444', d:'#B0B7BE', e:'#505459', f:'#262423', g:'#2B2A2A', h:'#1A1716', i:'#2F2E2D', j:'#6C7177', k:'#8A9199', l:'#F2C14E', m:'#5F666E', n:'#2A2A2E', o:'#ADB2B8', p:'#4E5359', q:'#93979C', r:'#252423'},
    rows: ["................",".....a..........","....aba.........","....aba.........","...cabba........","..cddeef.gg.....","hijklkbagmmggg..","nojjkbemmmmmmmg.","jjiabcdkkkkkkbba","ii..acdkkkkkkbba",".....febbkkebbba",".....fepabbeqpdb",".....feprafeqpbb",".....fepr.feqpra",".....fepr.feppr.","......fr...frr.."]
  }
};
