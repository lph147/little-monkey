// The animals as they look walking about on the map: 16 × 16 pixels, the size of a square, one letter per
// pixel ('.' is see-through) and each letter's colour in its palette. Every animal and wild creature in an area
// needs one (the tests check). Their pictures everywhere else, bigger and sharper, are in content/pictures.js.
const MAP_SPRITES = {
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
  '鹿': {   // deer (chapter 1, in the pine wood; drawn with the shape kit in tools/draw-pictures.js, at 16 × 16)
    palette: {a:'#3E3122', b:'#9C7B55', c:'#302012', d:'#714724', e:'#DE9E62', f:'#1A130E', g:'#533C26', h:'#1E1A16', i:'#9A5A28', j:'#3E2614', k:'#2A1E16', l:'#D4A278', m:'#975F30', n:'#3D2816', o:'#C27A3E', p:'#FBF1DE', q:'#6F401E', r:'#301E10'},
    rows: [".aba..aba.......",".abbaaba........","abbbababa.......",".acdedca........",".fgehdij........","fklmidij.ggj....",".nmnjioigeeijj..","..n..geieoooeij.",".....jiiopopopij",".....jiooopopoij","......cdiooodij.","......cdqiiidqr.","......cdqrjcdqr.","......cdqr.cdqr.","......cdqr.cdqr.",".......cr...cr.."]
  },
  // wild creatures, which jump out of long grass to fight (drawn with the shape kit in tools/draw-pictures.js, at 16 × 16)
  '蛇': {   // snake
    palette: {a:'#414F29', b:'#233113', c:'#A6D86A', d:'#477A26', e:'#6CA83E', f:'#1E1A16', g:'#511C19', h:'#D83A3A', i:'#3F6124'},
    rows: ["................","................",".........aab....","......aaaccdb...",".....accceefdb..","....aceddeeedbg.","...acedbbdddghhg","..aceedb.bbb.gg.","..acedb.........","..bdedb.........","...acdbaaaaab...","..aciiccccccdb..",".aceiieeeeeeedb.",".bdeeeeeeeeeedb.","..bddddddddddb..","...bbbbbbbbbb..."]
  },
  '蜘蛛': {   // spider
    palette: {o:'#1F191E', l:'#3A2F48', b:'#4A3D5C', h:'#6E5E84', d:'#30263E', w:'#FFFFFF', s:'#E08A3C'},
    rows: ["................","................","................","...l...oo...l...","..l.l.ohdo.l.l..",".l..lowbbwol..l.","..l..ohbbdo..l..",".l.l.ohbbdo.l.l.",".l..ohbbbbdo..l.","l...ohbssbdo...l","..llohbssbdoll..",".l..odbbbbdo..l.",".l...oddddo...l.","l..ll.oooo.ll..l","..l..........l..","..l..........l.."]
  },
  '蜜蜂': {   // bee
    palette: {a:'#5E5B58', b:'#424A4D', c:'#FFFFFF', d:'#A9C9DA', e:'#DDEFF8', f:'#3A2E22', g:'#FFE58A', h:'#C99A2E', i:'#4D3B16', j:'#1B150F', k:'#2D241B', l:'#5E5333', m:'#F2C14E', n:'#322C27', o:'#756D64', p:'#1F1812'},
    rows: ["................","................","....aaaaaaab....","...acccccccdb...","..aceeeeeeedb...","..bdeeeeddddb...","...bdddfghii....","..jklggfmmfhi...",".nofkmmfmmfmhi..","jkfcfkmfmmfmhip.",".jkfkmmfmmfmhpfp","..jkhmmfmmfmhip.","...jihhfmmfhi...",".....ipfhhii....",".......pii......","................"]
  },
  '野猪': {   // wild boar
    palette: {a:'#201710', b:'#3E2A1C', c:'#A07250', d:'#3F2E20', e:'#7A5236', f:'#563826', g:'#281B13', h:'#47301F', i:'#1E1A16', j:'#D3AD97', k:'#966C53', l:'#C08A6A', m:'#3C2C21', n:'#5A5651', o:'#F4F0E8', p:'#352D27', q:'#806E64', r:'#3A251B', s:'#1F150F'},
    rows: ["................","................","................",".......aaaa.....","....aaabbbbaaa..","...abbbbcccbbba.","..dddceeeeeeefg.",".dccchheeeeeeefg","dceeieeheeeeeefg","jjkeeeeheeeeeefg","jlkeeeeheeeeeefg","kkkffhheeeeeefg.","mnonpqfffffffg..","..n.pqrsggpqrs..","....srrs..srrs..",".....ss....ss..."]
  },
  '狼': {   // wolf (chapter 1, in the pine wood's long grass)
    palette: {a:'#2A2A29', b:'#5E656C', c:'#454444', d:'#B0B7BE', e:'#505459', f:'#262423', g:'#2B2A2A', h:'#1A1716', i:'#2F2E2D', j:'#6C7177', k:'#8A9199', l:'#F2C14E', m:'#5F666E', n:'#2A2A2E', o:'#ADB2B8', p:'#4E5359', q:'#93979C', r:'#252423'},
    rows: ["................",".....a..........","....aba.........","....aba.........","...cabba........","..cddeef.gg.....","hijklkbagmmggg..","nojjkbemmmmmmmg.","jjiabcdkkkkkkbba","ii..acdkkkkkkbba",".....febbkkebbba",".....fepabbeqpdb",".....feprafeqpbb",".....fepr.feqpra",".....fepr.feppr.","......fr...frr.."]
  }
};
