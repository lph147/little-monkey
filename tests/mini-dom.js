// A small working copy of part of a web page, for tests that play the game: it reads the HTML the
// game puts on a card into elements, so a test can find the card's buttons and press them, as a
// player would. It covers what the game's cards use: classes, data- attributes, hidden and disabled,
// clicking, focus, and simple selectors such as '.opt[data-i="2"]', '[data-a=ok]' or '.word .en'.
'use strict';

const VOID = new Set(['area', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'wbr']);
const decode = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const kebab = k => String(k).replace(/[A-Z]/g, c => '-' + c.toLowerCase());

class Text {
  constructor(text){ this.text = text; this.parent = null; }
  get textContent(){ return this.text; }
  html(){ return this.text.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
}

class El {
  constructor(tag, attrs, doc){
    this.tag = tag; this.attrs = attrs || {}; this.children = []; this.parent = null; this.doc = doc;
    this.onclick = null; this.scrollTop = 0; this.style = {setProperty(k, v){ this[k] = String(v); }};
  }
  // attributes
  getAttribute(k){ return k in this.attrs ? this.attrs[k] : null; }
  setAttribute(k, v){ this.attrs[k] = String(v); }
  removeAttribute(k){ delete this.attrs[k]; }
  hasAttribute(k){ return k in this.attrs; }
  get id(){ return this.attrs.id || ''; }
  get className(){ return this.attrs.class || ''; }
  get hidden(){ return 'hidden' in this.attrs; }
  set hidden(v){ if (v) this.attrs.hidden = ''; else delete this.attrs.hidden; }
  get disabled(){ return 'disabled' in this.attrs; }
  set disabled(v){ if (v) this.attrs.disabled = ''; else delete this.attrs.disabled; }
  get dataset(){
    const el = this;
    return new Proxy({}, {
      get: (t, k) => el.attrs['data-' + kebab(k)],
      set: (t, k, v) => { el.attrs['data-' + kebab(k)] = String(v); return true; },
      has: (t, k) => ('data-' + kebab(k)) in el.attrs
    });
  }
  get classList(){
    const el = this, list = () => (el.attrs.class || '').split(/\s+/).filter(Boolean), put = l => { el.attrs.class = l.join(' '); };
    return {
      contains: c => list().includes(c),
      add: (...cs) => put([...new Set([...list(), ...cs])]),
      remove: (...cs) => put(list().filter(c => !cs.includes(c))),
      toggle(c, force){ const has = list().includes(c), want = force === undefined ? !has : !!force; if (want !== has) put(want ? [...list(), c] : list().filter(x => x !== c)); return want; }
    };
  }
  // the tree
  get parentNode(){ return this.parent; }
  get parentElement(){ return this.parent; }
  get firstChild(){ return this.children[0] || null; }
  get textContent(){ return this.children.map(c => c.textContent).join(''); }
  set textContent(v){ this.setChildren([new Text(String(v))]); }
  get innerText(){ return this.textContent; }
  get innerHTML(){ return this.children.map(c => c.html()).join(''); }
  set innerHTML(v){ this.setChildren(parse(String(v), this.doc)); }
  get outerHTML(){ return this.html(); }
  set outerHTML(v){
    if (!this.parent) return;
    const nodes = parse(String(v), this.doc), sibs = this.parent.children;
    sibs.splice(sibs.indexOf(this), 1, ...nodes);
    nodes.forEach(n => { n.parent = this.parent; });
    this.parent = null;
  }
  html(){
    const a = Object.entries(this.attrs).map(([k, v]) => (v === '' ? ` ${k}` : ` ${k}="${v.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)).join('');
    return VOID.has(this.tag) ? `<${this.tag}${a}>` : `<${this.tag}${a}>${this.innerHTML}</${this.tag}>`;
  }
  setChildren(nodes){ this.children.forEach(c => { c.parent = null; }); this.children = nodes; nodes.forEach(n => { n.parent = this; }); }
  remove(){ if (this.parent){ const s = this.parent.children; s.splice(s.indexOf(this), 1); this.parent = null; } }
  contains(el){ for (let e = el; e; e = e.parent) if (e === this) return true; return false; }
  get offsetParent(){ for (let e = this; e; e = e.parent) if (e.hidden) return null; return this.parent || {}; }   // null when hidden
  // finding
  elements(){ const out = [], walk = e => { for (const c of e.children) if (c instanceof El){ out.push(c); walk(c); } }; walk(this); return out; }
  querySelectorAll(sel){ const groups = parseSelector(sel); return this.elements().filter(e => groups.some(g => matchComplex(e, g))); }
  querySelector(sel){ return this.querySelectorAll(sel)[0] || null; }
  matches(sel){ return parseSelector(sel).some(g => matchComplex(this, g)); }
  // doing
  click(){ if (!this.disabled && typeof this.onclick === 'function') this.onclick({currentTarget: this, target: this, preventDefault(){}, stopPropagation(){}}); }
  focus(){ if (this.doc) this.doc.activeElement = this; }
  blur(){ if (this.doc && this.doc.activeElement === this) this.doc.activeElement = null; }
  scrollIntoView(){}
  addEventListener(){}
  removeEventListener(){}
  getBoundingClientRect(){ return this.rect || {left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0}; }   // a test can set rect to place it on the screen
}

// HTML into a list of nodes.
function parse(html, doc){
  const root = new El('#root', {}, doc), stack = [root];
  const re = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+)|</g;
  let m;
  while ((m = re.exec(html))){
    const top = stack[stack.length - 1];
    if (m[1]){   // a closing tag: close up to the matching open one
      const tag = m[1].toLowerCase();
      for (let i = stack.length - 1; i > 0; i--) if (stack[i].tag === tag){ stack.length = i; break; }
    } else if (m[2]){   // an opening tag
      const tag = m[2].toLowerCase(), attrs = {};
      for (const a of m[3].matchAll(/([^\s=>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? a[4] ?? '');
      const el = new El(tag, attrs, doc);
      el.parent = top; top.children.push(el);
      if (!m[4] && !VOID.has(tag)) stack.push(el);
    } else if (m[0].startsWith('<!--')){
      // a comment: left out
    } else {   // text (or a lone <)
      const t = new Text(decode(m[5] !== undefined ? m[5] : m[0]));
      t.parent = top; top.children.push(t);
    }
  }
  const nodes = root.children;
  nodes.forEach(n => { n.parent = null; });
  return nodes;
}

// Selectors: a comma-separated list of compounds such as button.opt[data-i="2"], joined by spaces.
function parseSelector(sel){
  return sel.split(',').map(s => s.trim()).filter(Boolean).map(s => s.split(/\s+/).map(parseCompound));
}
function parseCompound(c){
  const out = {tag: null, id: null, classes: [], attrs: []};
  const re = /^[a-zA-Z][\w-]*|\.[\w-]+|#[\w-]+|\[\s*([\w-]+)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]*)))?\s*\]/g;
  let m, at = 0;
  while ((m = re.exec(c))){
    if (m.index !== at) break;
    at = re.lastIndex;
    const t = m[0];
    if (t[0] === '.') out.classes.push(t.slice(1));
    else if (t[0] === '#') out.id = t.slice(1);
    else if (t[0] === '[') out.attrs.push([m[1].toLowerCase(), m[2] ?? m[3] ?? m[4]]);   // no value: just has to be there
    else out.tag = t.toLowerCase();
  }
  if (at !== c.length) throw new Error(`the mini page can't read the selector "${c}"`);
  return out;
}
function matchCompound(e, c){
  if (c.tag && e.tag !== c.tag) return false;
  if (c.id && e.attrs.id !== c.id) return false;
  const classes = (e.attrs.class || '').split(/\s+/);
  if (!c.classes.every(x => classes.includes(x))) return false;
  return c.attrs.every(([k, v]) => k in e.attrs && (v === undefined || e.attrs[k] === v));
}
function matchComplex(e, parts){
  if (!matchCompound(e, parts[parts.length - 1])) return false;
  let i = parts.length - 2;
  for (let a = e.parent; a && i >= 0; a = a.parent) if (matchCompound(a, parts.at(i))) i--;
  return i < 0;
}

// An element to stand in for one on the page, such as the card: makeElement('div', {id: 'sheet'}, document).
const makeElement = (tag, attrs, doc) => new El(tag, attrs, doc);

module.exports = {makeElement, parse};
