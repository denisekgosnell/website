#!/usr/bin/env node
// Builds keynote-practice.html from _keynote/keynote.txt + _keynote/template.html.
// Source format:
//   "## Title"  -> starts a new section (and a new card)
//   "==="       -> card break
//   other lines -> one paragraph each (kept verbatim)
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcPath = path.join(__dirname, 'keynote.txt');
const tplPath = path.join(__dirname, 'template.html');
const outPath = path.join(root, 'keynote-practice.html');

const raw = fs.readFileSync(srcPath, 'utf8');
const lines = raw.split('\n');

const sections = [];
const cards = [];
let cur = null;
let sectionIdx = -1;

function flush() {
  if (cur && cur.paragraphs.length) cards.push(cur);
  cur = null;
}
function newCard() {
  cur = { section: sectionIdx, paragraphs: [] };
}

for (const rawLine of lines) {
  const line = rawLine.replace(/\s+$/, '');
  if (line === '') continue;
  if (line.startsWith('## ')) {
    flush();
    sectionIdx = sections.length;
    sections.push({ title: line.slice(3).trim() });
    newCard();
    continue;
  }
  if (line === '===') {
    flush();
    newCard();
    continue;
  }
  if (!cur) newCard();
  cur.paragraphs.push(line);
}
flush();

// Verification 1: reconstructed text must equal the source with markers removed.
const reconstructed = cards.map(c => c.paragraphs.join('\n')).join('\n');
const expected = lines
  .map(l => l.replace(/\s+$/, ''))
  .filter(l => l !== '' && l !== '===' && !l.startsWith('## '))
  .join('\n');
if (reconstructed !== expected) {
  console.error('MISMATCH between cards and source text');
  process.exit(1);
}

// Word counts (spoken words only: bracketed stage notes excluded)
function spokenWords(p) {
  return p.replace(/\[[^\]]*\]/g, ' ').split(/\s+/).filter(Boolean).length;
}
cards.forEach((c, i) => {
  c.id = i + 1;
  c.words = c.paragraphs.reduce((n, p) => n + spokenWords(p), 0);
});
sections.forEach((s, i) => {
  s.cards = cards.filter(c => c.section === i).length;
  s.words = cards.filter(c => c.section === i).reduce((n, c) => n + c.words, 0);
});

// Display metadata per section, in source order (colors drive the note-card color coding).
const SECTION_META = [
  { short: 'Part 1 · Micah',          color: '#d97706' },
  { short: 'Part 2 · Who I Am',       color: '#0d9488' },
  { short: 'Part 3 · Tensions',       color: '#64748b' },
  { short: 'Tension 1 · Jobs',        color: '#2563eb' },
  { short: 'Tension 2 · Prosperity',  color: '#16a34a' },
  { short: 'Tension 3 · Control',     color: '#e11d48' },
  { short: 'Part 4 · Door-Opener',    color: '#7c3aed' },
];
if (SECTION_META.length !== sections.length) { console.error(`expected ${SECTION_META.length} sections, found ${sections.length}`); process.exit(1); }
sections.forEach((s, i) => Object.assign(s, SECTION_META[i]));

const data = { sections, cards };
const json = JSON.stringify(data).replace(/<\//g, '<\\/');

if (fs.existsSync(tplPath)) {
  const tpl = fs.readFileSync(tplPath, 'utf8');
  if (!tpl.includes('__KEYNOTE_DATA__')) { console.error('template missing __KEYNOTE_DATA__'); process.exit(1); }
  const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
  if (!tpl.includes('__APP_JS__')) { console.error('template missing __APP_JS__'); process.exit(1); }
  const html = tpl.replace('__KEYNOTE_DATA__', () => json).replace('__APP_JS__', () => appJs);
  fs.writeFileSync(outPath, html);
  console.log('wrote', path.relative(root, outPath));
}

console.log(`${sections.length} sections, ${cards.length} cards, ${cards.reduce((n,c)=>n+c.words,0)} spoken words`);
sections.forEach((s, i) => console.log(`  [${i+1}] ${s.title} — ${s.cards} cards, ${s.words} words`));
const sizes = cards.map(c => c.words);
console.log(`card words: min ${Math.min(...sizes)}, max ${Math.max(...sizes)}, avg ${Math.round(sizes.reduce((a,b)=>a+b,0)/sizes.length)}`);
if (process.argv.includes('--dump')) {
  cards.forEach(c => console.log(`\n--- card ${c.id} (sec ${c.section+1}, ${c.words}w)\n${c.paragraphs.join('\n')}`));
}
