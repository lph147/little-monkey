// Pixel sprites for collectible words, keyed by the word in the word bank (content/words.js).
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
  }
};
