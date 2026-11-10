// The monkey, redrawn: the same 16 x 16 square and the same big-headed shape as today's, now lit from the top left
// (three furs and two skins), with eyes that catch the light, ears and a tail from every side, and a back you can read.
const {sprite, hex} = require('./core.js');

// o outline · H fur in the light · f fur · d fur in shade · s skin · k skin in shade · e eye · w glint · m mouth
// r headband · R its shade
const FRONT = [
  '................',
  '.....oooooo.....',
  '....oHHHHffo....',
  '...oHHfffffdo...',
  '.ooofffffffdooo.',
  'oskofssffssdosko',
  'oskofsessesdosko',
  '.ooofsessesdooo.',
  '...okssmmskdo...',
  '...oodkkkkdoo...',
  '..oHfosssskfdo..',
  '.oHffosssskfddo.',
  '.of.ofssskdo.do.',
  '...offfkkfddo...',
  '...offo..ofdo...',
  '...ooo....ooo...'];
const BACK = [
  '................',
  '.....oooooo.....',
  '....oHHHHffo....',
  '...oHHfffffdo...',
  '.ooofffffffdooo.',
  'ofdoHffffffdofdo',
  'ofdoffffffddofdo',
  '.ooofffffdddooo.',
  '...odffffdddo...',
  '...ooddddddoo...',
  '..oHffffffddo.o.',
  '.oHfffffffdddofo',
  '.of.ffffffdd.ofo',
  '...offfffdddooo.',
  '...offo..ofdo...',
  '...ooo....ooo...'];
const SIDE = [
  '................',
  '.....ooooo......',
  '....oHHHffo.....',
  '...oHHffffdo....',
  '..oskffssssso...',
  '..oskfssewssso..',
  '..oodfsssssmmo..',
  '...oddkssskoo...',
  '....oddkkdo.....',
  '...oHfffffdo....',
  '.o.oHfsssfdo....',
  'ofooffsssfddo...',
  'ofdfffsskfddo...',
  '.oo.offffddo....',
  '....offo.ofo....',
  '....ooo..oo.....'];
// the red headband over them (only the pixels it changes)
const BAND = {
  front: {3: '...orrrrrrrRo...'},
  back:  {3: '...orrrrrrrRo...', 4: '.oooffffrRfdooo.', 5: 'ofdoHfffrfRdofdo', 6: 'ofdoffffRffRofdo'},
  side:  {3: '...orrrrrrRo....', 4: '.rRskffssssso...', 5: '..rskfssewssso..'},
};
const lay = (rows, over) => rows.map((r, y) => over && over[y] ? [...r].map((c, x) => over[y][x] === '.' ? c : over[y][x] === c ? c : over[y][x]).join('') : r);
const withBand = (rows, over) => rows.map((r, y) => over[y] ? [...over[y]].map((c, x) => 'rR'.includes(c) ? c : r[x]).join('') : r);

// Each monkey's colours: outline, the three furs, two skins, eye, mouth.
const PALS = {
  player: {o: '#4B2A2A', H: '#F6D27A', f: '#E3A548', d: '#B97636', s: '#FCE4C2', k: '#EDBE96', e: '#2A1A22', w: '#FFFFFF', m: '#CF8A6C', r: '#DC4A34', R: '#A12A2E'},
  hungry: {o: '#44262A', H: '#D9A064', f: '#BC7C44', d: '#935A38', s: '#F8DDBC', k: '#E2B690', e: '#2A1A22', w: '#FFFFFF', m: '#A85E48'},
  little: {o: '#4B2A2A', H: '#F2BE72', f: '#DA964A', d: '#B06C38', s: '#FBE0BE', k: '#E8B992', e: '#2A1A22', w: '#FFFFFF', m: '#B4654C'},
  big:    {o: '#3A2028', H: '#B98558', f: '#98623E', d: '#744634', s: '#F2D0A8', k: '#D9AA86', e: '#2A1A22', w: '#FFFFFF', m: '#9C5644'},
  elder:  {o: '#3B3A46', H: '#E6E4DA', f: '#BFBFB8', d: '#93969A', s: '#F4E2CC', k: '#DCC0A6', e: '#2A1A22', w: '#FFFFFF', m: '#A8806C', b: '#FFFDF4', B: '#D9D8D2'},
};
// the old monkey's white beard and brows, over the front and the side
const BEARD = {
  front: {5: 'oskofbbffbbdosko', 8: '...okbbmmbbdo...', 9: '...oobbbbbBoo...', 10: '..oHfobbbBkfdo..', 11: '.oHffosbBskfddo.'},
  side:  {4: '..oskffbbssso...', 7: '...oddkbbbboo...', 8: '....oddbbBo.....', 9: '...oHffbBfdo....'},
};
const withBeard = (rows, over) => rows.map((r, y) => over[y] ? [...over[y]].map((c, x) => 'bB'.includes(c) ? c : r[x]).join('') : r);

// A monkey's picture: who ('player', 'hungry', ...), dir ('down', 'up', 'left', 'right'), band: wearing the headband.
function monkey(who, dir, {band = false} = {}){
  const view = dir === 'down' ? 'front' : dir === 'up' ? 'back' : 'side';
  let rows = {front: FRONT, back: BACK, side: SIDE}[view];
  if (who === 'elder' && BEARD[view]) rows = withBeard(rows, BEARD[view]);
  if (band) rows = withBand(rows, BAND[view]);
  if (dir === 'left') rows = rows.map(r => [...r].reverse().join(''));
  const pal = Object.fromEntries(Object.entries(PALS[who]).map(([k, v]) => [k, hex(v)]));
  return sprite(rows, pal);
}
module.exports = {monkey, PALS, FRONT, BACK, SIDE};
