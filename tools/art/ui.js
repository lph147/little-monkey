// The cards' frames and buttons, drawn on the game's own pixel grid (one game pixel = 3 on a mock-up): paper with an
// ink edge, jade and gold buttons with a little depth, and a few small icons. Each frame is cut in nine to stretch.
const path = require('path');
const {Img, hex, sprite} = require('./core.js');
const out = path.join(__dirname, 'out', 'ui');
require('fs').mkdirSync(out, {recursive: true});

// a frame from rows of letters; saved three times its size
const frame = (name, rows, pal) => { const img = sprite(rows, Object.fromEntries(Object.entries(pal).map(([k, v]) => [k, hex(v)]))); img.scale(3).save(path.join(out, name + '.png')); return img; };
const INK = '#3A2C2E';

// a page: paper, an ink edge with its corners cut, and a thin inner rule, as the frame printed round a page of an old
// Chinese book (15 x 15, a border of 6)
frame('page', [
  '..ooooooooooo..',
  '.ohhhhhhhhhhho.',
  'ohpppppppppppso',
  'ohpprrrrrrrppso',
  'ohprpppppppprso',
  'ohprpppppppprso',
  'ohprpppppppprso',
  'ohprpppppppprso',
  'ohprpppppppprso',
  'ohprpppppppprso',
  'ohprpppppppprso',
  'ohpprrrrrrrppso',
  'ohpppppppppppso',
  '.osssssssssssso'.slice(0, 14) + '.',
  '..ooooooooooo..'], {o: INK, h: '#FFFBEC', p: '#F6ECD4', s: '#E3D3AF', r: '#D2BE94'});
// a plain panel: the speech box, a message (11 x 11, a border of 4)
frame('panel', [
  '..ooooooo..',
  '.ohhhhhhho.',
  'ohpppppppso',
  'ohpppppppso',
  'ohpppppppso',
  'ohpppppppso',
  'ohpppppppso',
  'ohpppppppso',
  'ohpppppppso',
  '.osssssssso'.slice(0, 10) + '.',
  '..ooooooo..'], {o: INK, h: '#FFFBEC', p: '#F6ECD4', s: '#E3D3AF'});
// buttons: a face, a lit top edge and a darker foot, so they look pressable (11 x 12: border 4, 4, 5, 4)
const button = (name, pal) => frame(name, [
  '..ooooooo..',
  '.ohhhhhhho.',
  'ohfffffffdo',
  'offfffffffo',
  'offfffffffo',
  'offfffffffo',
  'offfffffffo',
  'ofdddddddDo',
  'oDDDDDDDDDo',
  'oDDDDDDDDDo',
  '.ooooooooo.',
  '...........'], pal);
button('btn-jade', {o: '#143A32', h: '#7CCFA4', f: '#35966F', d: '#267A5C', D: '#195444'});
button('btn-paper', {o: INK, h: '#FFFFFF', f: '#FFF8E6', d: '#EFE0BC', D: '#BFA77C'});
button('btn-gold', {o: '#5A3A1E', h: '#FFF2B8', f: '#F8CE62', d: '#E8AE42', D: '#B07A2C'});
button('btn-on', {o: '#8A5A14', h: '#FFFFFF', f: '#FFF4C8', d: '#F6DC8C', D: '#D9A036'});
// a tile for an answer or a word in the scroll: flatter, lighter than the page
frame('tile', [
  '..ooooooo..',
  '.ohhhhhhho.',
  'ohfffffffso',
  'ohfffffffso',
  'ohfffffffso',
  'ohfffffffso',
  'ohfffffffso',
  'ohfffffffso',
  'ohfffffffso',
  '.osssssssso'.slice(0, 10) + '.',
  '..ooooooo..'], {o: '#B49C72', h: '#FFFFFF', f: '#FFFAEC', s: '#EADBB8'});
frame('tile-shadow', [
  '..ooooooo..',
  '.offfffffo.',
  'offfffffffo',
  'offfffffffo',
  'offfffffffo',
  'offfffffffo',
  'offfffffffo',
  'offfffffffo',
  'offfffffffo',
  '.offfffffo.',
  '..ooooooo..'], {o: '#D9C9A4', f: '#EFE3C6'});
// a dark plate, for a name over a picture
frame('plate', [
  '..ooooooo..',
  '.offfffffo.',
  'offfffffffo',
  'offfffffffo',
  'offfffffffo',
  'offfffffffo',
  'offfffffffo',
  'offfffffffo',
  'offfffffffo',
  '.offfffffo.',
  '..ooooooo..'], {o: '#1E1826', f: '#3A2C3C'});

// ---- small icons (shown three times their size) ----
const icon = (name, rows, pal) => sprite(rows, Object.fromEntries(Object.entries(pal).map(([k, v]) => [k, hex(v)]))).scale(3).save(path.join(out, name + '.png'));
icon('speaker', ['....oo.....', '...oio..o..', 'ooooio...o.', 'oiiiio.o.o.', 'oiiiio.o.o.', 'ooooio...o.', '...oio..o..', '....oo.....'], {o: INK, i: '#FFF8E6'});
icon('turtle', ['.....oooo....', '...oogGGgoo..', '..ogGgGGgGgoo', 'oooGGGGGGGosko', 'oskoooooooosso', '.ooosso.osso..', '...ooo...oo...'].map(r => r.padEnd(14, '.')), {o: INK, g: '#5FA85E', G: '#3F7D5A', s: '#B8CC6E', k: INK});
icon('heart', ['.oo...oo.', 'orRo.orro', 'orrrorrro', 'orrrrrrDo', '.orrrrDo.', '..orrDo..', '...oDo...', '....o....'], {o: '#5E1930', r: '#DC4A34', R: '#FFB59A', D: '#B92F2C'});
icon('heart-empty', ['.oo...oo.', 'offo.offo', 'offfofffo', 'offfffffo', '.offfffo.', '..offfo..', '...ofo...', '....o....'], {o: '#B49C72', f: '#EFE3C6'});
icon('shell', ['...ooo...', '..oPpPo..', '.oPpPpPo.', 'oPpPpPpPo', 'opPpPpPpo', '.oppppoo.', '..oooo...'], {o: '#8C5634', P: '#FFE9D0', p: '#F6C6A0'});
icon('star', ['....o....', '...oyo...', '...oyo...', 'oooyYyooo', 'oyyYYYyyo', '.oyYYYyo.', '..oyyyo..', '.oyyoyyo.', '.oo...oo.'], {o: '#8A5A14', y: '#F8CE62', Y: '#FFF2B8'});
icon('arrow', ['ooooooo', '.ooooo.', '..ooo..', '...o...'], {o: '#FFF8E6'});
console.log('ui done');
