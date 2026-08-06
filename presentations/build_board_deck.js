/* SigCompass Board Walk-Through deck — August 2026 */
const pptxgen = require('pptxgenjs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa');

// ---------- palette ----------
const NAVY  = '212B5F';   // dominant dark
const NAVY2 = '2B3778';   // card on navy
const NAVY3 = '2F3B74';   // flywheel nodes
const INK   = '1E2749';   // headings on light
const TEAL  = '1E808F';
const TEALD = '15616D';
const GOLD  = 'C9A22B';
const GOLDD = 'A8861F';
const GREEN = '2F7D4F';
const PURP  = '7B5EA7';
const BRNZ  = 'A76A37';
const GRAY  = '8A8F9C';
const BG    = 'F7F8FA';
const BODY  = '39415C';
const MUTED = '7A8296';
const ICE   = 'C9D4F2';
const ICE2  = 'A9B7E0';
const LINE  = 'E1E4EC';
const TINT  = 'EEF1F7';   // light navy tint
const TEALT = 'E4EFF1';   // light teal tint
const GOLDT = 'FBF3DC';   // light gold tint

const SERIF = 'Cambria';
const SANS  = 'Calibri';

const W = 11, H = 8.5, MX = 0.55, CW = W - 2 * MX;

// ---------- icons ----------
const ICONS = {};
async function makeIcon(key, name, color) {
  const el = React.createElement(fa[name], { size: 256 });
  let svg = ReactDOMServer.renderToStaticMarkup(el);
  svg = svg.replace(/currentColor/g, '#' + color);
  if (!svg.includes('xmlns')) svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  const png = await sharp(Buffer.from(svg), { density: 300 }).resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  ICONS[key] = 'image/png;base64,' + png.toString('base64');
}

// ---------- helpers ----------
let pres;
function slideBase(dark) {
  const s = pres.addSlide();
  s.background = { color: dark ? NAVY : BG };
  return s;
}
function kicker(s, txt, opts = {}) {
  s.addText(txt, {
    x: MX, y: opts.y ?? 0.48, w: opts.w ?? CW, h: 0.3, margin: 0,
    fontFace: SANS, fontSize: 10.5, bold: true, charSpacing: 2.4,
    color: opts.color ?? TEAL, align: 'left',
  });
}
function title(s, txt, opts = {}) {
  s.addText(txt, {
    x: MX, y: opts.y ?? 0.78, w: opts.w ?? CW, h: opts.h ?? 0.62, margin: 0,
    fontFace: SERIF, fontSize: opts.size ?? 30, bold: true,
    color: opts.color ?? INK, align: 'left',
  });
}
let pageNo = 0;
function footer(s, dark) {
  pageNo += 1;
  if (pageNo === 1) return; // no footer on title
  s.addText('Signature CDP  ·  SigCompass  ·  Board Walk-Through  ·  August 2026', {
    x: MX, y: H - 0.42, w: 6.5, h: 0.25, margin: 0,
    fontFace: SANS, fontSize: 8, color: dark ? '5B679E' : 'A9AFC2', align: 'left',
  });
  s.addText(String(pageNo), {
    x: W - MX - 0.6, y: H - 0.42, w: 0.6, h: 0.25, margin: 0,
    fontFace: SANS, fontSize: 8, color: dark ? '5B679E' : 'A9AFC2', align: 'right',
  });
}
function numCircle(s, n, x, y, d = 0.42, fill = TEAL) {
  s.addShape('ellipse', { x, y, w: d, h: d, fill: { color: fill } });
  s.addText(String(n), { x, y: y - 0.012, w: d, h: d, margin: 0, align: 'center', valign: 'middle', fontFace: SANS, fontSize: d > 0.4 ? 15 : 13, bold: true, color: 'FFFFFF' });
}
function iconCircle(s, key, x, y, d, fill) {
  s.addShape('ellipse', { x, y, w: d, h: d, fill: { color: fill } });
  const pad = d * 0.26;
  s.addImage({ data: ICONS[key], x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad });
}

// ============================================================
async function main() {
  // icons
  await makeIcon('database', 'FaDatabase', 'FFFFFF');
  await makeIcon('compass', 'FaCompass', 'FFFFFF');
  await makeIcon('compassGold', 'FaCompass', GOLD);
  await makeIcon('heart', 'FaHeart', 'FFFFFF');
  await makeIcon('ship', 'FaShip', 'FFFFFF');
  await makeIcon('shipGold', 'FaShip', GOLD);
  await makeIcon('chart', 'FaChartLine', 'FFFFFF');
  await makeIcon('check', 'FaCheckCircle', GREEN);
  await makeIcon('comments', 'FaComments', 'FFFFFF');
  await makeIcon('bug', 'FaBug', 'FFFFFF');
  await makeIcon('calendar', 'FaCalendarCheck', 'FFFFFF');
  await makeIcon('shield', 'FaShieldAlt', 'FFFFFF');
  await makeIcon('clipboard', 'FaClipboardCheck', 'FFFFFF');
  await makeIcon('lock', 'FaLock', 'FFFFFF');
  await makeIcon('csv', 'FaFileCsv', 'FFFFFF');
  await makeIcon('cogs', 'FaCogs', 'FFFFFF');
  await makeIcon('github', 'FaGithub', 'FFFFFF');
  await makeIcon('form', 'FaClipboardList', 'FFFFFF');
  await makeIcon('question', 'FaQuestionCircle', 'FFFFFF');
  await makeIcon('user', 'FaUserCheck', 'FFFFFF');
  await makeIcon('flag', 'FaFlagCheckered', 'FFFFFF');
  await makeIcon('gauge', 'FaTachometerAlt', 'FFFFFF');
  await makeIcon('book', 'FaBookOpen', 'FFFFFF');
  await makeIcon('anchor', 'FaAnchor', 'FFFFFF');
  await makeIcon('search', 'FaSearch', 'FFFFFF');
  await makeIcon('camera', 'FaCamera', 'FFFFFF');
  await makeIcon('wrench', 'FaWrench', 'FFFFFF');
  await makeIcon('balance', 'FaBalanceScale', 'FFFFFF');

  pres = new pptxgen();
  pres.defineLayout({ name: 'LETTER', width: W, height: H });
  pres.layout = 'LETTER';
  pres.author = 'Denise Gosnell';
  pres.title = 'SigCompass — Board Walk-Through & Final Non-Prod Status';

  // ==========================================================
  // S1 — TITLE
  // ==========================================================
  {
    const s = slideBase(true); footer(s, true);
    s.addText('SIGNATURE  ·  SIGCOMPASS  ·  PROJECT ARCTURUS', {
      x: 0.85, y: 2.05, w: 9.3, h: 0.35, margin: 0,
      fontFace: SANS, fontSize: 13, bold: true, charSpacing: 3, color: '8FB8E8',
    });
    s.addText('The engine is built.', {
      x: 0.85, y: 2.45, w: 9.3, h: 1.1, margin: 0,
      fontFace: SERIF, fontSize: 48, bold: true, color: 'FFFFFF',
    });
    s.addText('Final non-prod status: code complete. Every feature planned for this phase is built, tested, and deployed — today we walk through it together.', {
      x: 0.85, y: 3.75, w: 9.0, h: 0.75, margin: 0,
      fontFace: SANS, fontSize: 15.5, italic: true, color: ICE,
    });
    s.addText([
      { text: 'Non-prod code complete', options: { bold: true } },
      { text: '    ·    ' },
      { text: '3 data products in Toggle', options: { bold: true } },
      { text: '    ·    ' },
      { text: 'SSO end-to-end', options: { bold: true } },
      { text: '    ·    ' },
      { text: 'AI Studio ready', options: { bold: true } },
    ], {
      x: 0.85, y: 5.6, w: 9.3, h: 0.4, margin: 0,
      fontFace: SANS, fontSize: 11.5, color: 'FFFFFF',
    });
    s.addText('Denise Gosnell, Ph.D.    |    Board Walk-Through    |    August 2026', {
      x: 0.85, y: 6.6, w: 9.0, h: 0.3, margin: 0,
      fontFace: SANS, fontSize: 10.5, color: '8A94C8',
    });
    s.addNotes('Welcome. Frame: this is the final status update of the build phase — non-prod code complete — followed by the live demo, what we need from the board during testing, and the strategy discussion. Keep it celebratory but grounded: the engine is real and they will touch it today.');
  }

  // ==========================================================
  // S2 — AGENDA
  // ==========================================================
  {
    const s = slideBase(false); footer(s, false);
    kicker(s, "TODAY'S WALK-THROUGH");
    title(s, 'Agenda');
    const items = [
      ['The build', 'Final status: non-prod code complete — what shipped, what remains, the road ahead', '10 min'],
      ['Live demo', 'A guided tour of the engine — from SigNet sign-in to the AI Studio', '20 min'],
      ['Your part', 'The testing window: what to try, how to ask the AI questions, how to report bugs', '10 min'],
      ['The flywheel', "Connecting February's data strategy to what you just saw — then the floor is yours", '20 min'],
    ];
    let y = 1.95;
    items.forEach((it, i) => {
      numCircle(s, i + 1, MX + 0.1, y + 0.14, 0.5);
      s.addText([
        { text: it[0] + ':  ', options: { bold: true, color: INK } },
        { text: it[1], options: { color: BODY } },
      ], { x: MX + 0.85, y, w: 7.7, h: 0.78, margin: 0, fontFace: SANS, fontSize: 14.5, valign: 'middle' });
      s.addText(it[2], { x: 9.15, y, w: 1.25, h: 0.78, margin: 0, fontFace: SANS, fontSize: 11.5, bold: true, color: MUTED, align: 'right', valign: 'middle' });
      y += 1.18;
    });
    s.addText('One hour of walk-through, one goal: every board member leaves ready to test the engine themselves.', {
      x: MX, y: 7.0, w: CW, h: 0.35, margin: 0, fontFace: SANS, fontSize: 12, italic: true, color: MUTED,
    });
    s.addNotes('Four parts. Set the expectation up front that part 4 is a discussion, not a presentation — they should be collecting questions as we go.');
  }

  // ==========================================================
  // S3 — SCORECARD
  // ==========================================================
  {
    const s = slideBase(true); footer(s, true);
    kicker(s, 'STATUS SCORECARD', { color: '8FB8E8' });
    title(s, 'Where we landed', { color: 'FFFFFF' });
    const tiles = [
      ['141', 'production pipelines'],
      ['109', 'test pipelines'],
      ['605', 'verified assertions'],
      ['0', 'known bugs open'],
    ];
    const tw = 2.34, gap = 0.18; let x = MX;
    tiles.forEach(t => {
      s.addShape('roundRect', { x, y: 2.1, w: tw, h: 2.0, rectRadius: 0.09, fill: { color: NAVY2 }, line: { color: TEAL, width: 1 } });
      s.addText(t[0], { x, y: 2.42, w: tw, h: 0.85, margin: 0, align: 'center', fontFace: SERIF, fontSize: 44, bold: true, color: 'FFFFFF' });
      s.addText(t[1], { x: x + 0.1, y: 3.38, w: tw - 0.2, h: 0.5, margin: 0, align: 'center', fontFace: SANS, fontSize: 12.5, color: ICE });
      x += tw + gap;
    });
    s.addText('Non-prod code complete: the full bronze → silver → gold platform runs in Signature’s AWS, and Toggle renders three data products from it — data quality, revenue, and Storybook analytics.', {
      x: MX, y: 4.75, w: CW, h: 0.85, margin: 0, fontFace: SANS, fontSize: 15, italic: true, color: 'FFFFFF', align: 'center',
    });
    s.addText('Pipeline and assertion counts are from the July 10 verified build — the platform has only grown since, and every deployed test is green.', {
      x: MX, y: 6.4, w: CW, h: 0.4, margin: 0, fontFace: SANS, fontSize: 10.5, color: ICE2, align: 'center',
    });
    s.addNotes('Headline: code complete. The four tiles carry the rigor story from June and July. Counts are the July 10 hand-verified numbers; since then we added the Storybook analytics product and the finished revenue funnel, so the real totals are higher — refresh from the latest build if you want exact figures on the day.');
  }

  // ==========================================================
  // S4 — SINCE JULY 10
  // ==========================================================
  {
    const s = slideBase(false); footer(s, false);
    kicker(s, 'MOMENTUM');
    title(s, 'What closed since July 10');
    const rows = [
      ['Storybook analytics shipped', 'a third live data product — booking-journey metrics, with real hot-leads-by-family'],
      ['Revenue funnel completed', 'every trip staged Quoted → Confirmed → Travelled, organized by travel-start month'],
      ['Advisor & client metrics fixed and extended', 'distinct advisor counts by month; daily new-client trend with date ranges'],
      ['Data trust hardened', 'junk dates (1899–2079) filtered, supplier names joined in, every observed phone-format error normalized'],
      ['SSO live end-to-end', 'SigNet portal → Cognito → Toggle, with test users and a full SSO test design delivered'],
      ['Toggle’s full request list shipped', 'every item from the front-end team’s lists built, tested, deployed — all known bugs closed'],
    ];
    let y = 1.85;
    rows.forEach(r => {
      s.addImage({ data: ICONS.check, x: MX + 0.05, y: y + 0.05, w: 0.3, h: 0.3 });
      s.addText([
        { text: r[0] + ' — ', options: { bold: true, color: INK } },
        { text: r[1], options: { color: BODY } },
      ], { x: MX + 0.55, y, w: 6.35, h: 0.85, margin: 0, fontFace: SANS, fontSize: 12.5, valign: 'top' });
      y += 0.92;
    });
    // right card: 1 -> 3
    const cx = 7.85, cw = 2.6;
    s.addShape('roundRect', { x: cx, y: 1.85, w: cw, h: 5.3, rectRadius: 0.1, fill: { color: 'FFFFFF' }, line: { color: LINE, width: 1 }, shadow: { type: 'outer', color: 'D5D9E4', blur: 6, offset: 2, angle: 90, opacity: 0.5 } });
    s.addText('DATA PRODUCTS LIVE IN TOGGLE', { x: cx + 0.2, y: 2.05, w: cw - 0.4, h: 0.5, margin: 0, fontFace: SANS, fontSize: 10, bold: true, charSpacing: 1.5, color: TEAL, align: 'center' });
    s.addText('1 → 3', { x: cx + 0.2, y: 2.5, w: cw - 0.4, h: 0.9, margin: 0, fontFace: SERIF, fontSize: 44, bold: true, color: INK, align: 'center' });
    const steps = [['Jun 11', 'Data quality'], ['Jul 10', '+ Revenue'], ['Aug 7', '+ Storybook analytics']];
    let sy = 3.75;
    steps.forEach((st, i) => {
      s.addShape('ellipse', { x: cx + 0.35, y: sy + 0.06, w: 0.18, h: 0.18, fill: { color: i === 2 ? GOLD : TEAL } });
      if (i < 2) s.addShape('line', { x: cx + 0.44, y: sy + 0.26, w: 0, h: 0.82, line: { color: LINE, width: 1.5 } });
      s.addText([
        { text: st[0] + '\n', options: { bold: true, color: INK, fontSize: 12 } },
        { text: st[1], options: { color: MUTED, fontSize: 10.5 } },
      ], { x: cx + 0.7, y: sy - 0.12, w: cw - 0.9, h: 0.9, margin: 0, fontFace: SANS, valign: 'top' });
      sy += 1.08;
    });
    s.addNotes('The month since July 10 was about finishing: the third data product (Storybook analytics), the complete revenue funnel, metric corrections Toggle asked for, and SSO running end to end. As of July 30, every item on Toggle’s list was built, tested and deployed, and all known bugs were closed.');
  }

  // ==========================================================
  // S5 — MEDALLION FINAL STATUS
  // ==========================================================
  {
    const s = slideBase(false); footer(s, false);
    kicker(s, 'MEDALLION — FINAL STATUS');
    title(s, 'Every layer, built and deployed');
    const rows = [
      { tag: 'RAW', sub: 'sources', color: GRAY, boxes: [['Signet CDC — 20+ source tables', NAVY3], ['Storybook raw events — live', PURP]] },
      { tag: 'BRONZE', sub: 'clean / type', color: BRNZ, boxes: [['Signet — normalized & cleaned', TEAL], ['Storybook — normalized & cleaned', PURP]] },
      { tag: 'SILVER', sub: 'foundational APIs', color: GRAY, boxes: [['Identity APIs', NAVY3], ['Data-quality metrics', TEAL], ['Revenue APIs', TEAL], ['Storybook session metrics', PURP]] },
      { tag: 'GOLD', sub: 'cubes + serving', color: GOLDD, boxes: [['DQ cube + GraphQL serving', GOLD], ['Revenue cube + serving → Toggle', GOLD], ['Storybook analytics → Toggle', GOLD], ['C-360 write-backs', 'DASHED']] },
    ];
    let y = 1.8; const rowH = 1.02, labelW = 1.15, bx0 = MX + labelW + 0.15;
    rows.forEach(r => {
      s.addShape('rect', { x: MX, y, w: labelW, h: rowH, fill: { color: r.color } });
      s.addText([
        { text: r.tag + '\n', options: { bold: true, fontSize: 12.5, color: 'FFFFFF' } },
        { text: r.sub, options: { fontSize: 7.5, color: 'FFFFFF' } },
      ], { x: MX, y, w: labelW, h: rowH, margin: 0.04, align: 'center', valign: 'middle', fontFace: SANS });
      const n = r.boxes.length, gw = (W - MX - bx0), gap = 0.14, bw = (gw - gap * (n - 1)) / n;
      let bx = bx0;
      r.boxes.forEach(b => {
        if (b[1] === 'DASHED') {
          s.addShape('roundRect', { x: bx, y: y + 0.1, w: bw, h: rowH - 0.2, rectRadius: 0.07, fill: { color: 'FFFFFF' }, line: { color: PURP, width: 1.25, dashType: 'dash' } });
          s.addText(b[0] + '  ·  next phase', { x: bx + 0.06, y: y + 0.1, w: bw - 0.12, h: rowH - 0.2, margin: 0, align: 'center', valign: 'middle', fontFace: SANS, fontSize: 10, color: PURP });
        } else {
          s.addShape('roundRect', { x: bx, y: y + 0.1, w: bw, h: rowH - 0.2, rectRadius: 0.07, fill: { color: b[1] } });
          s.addText(b[0], { x: bx + 0.06, y: y + 0.1, w: bw - 0.12, h: rowH - 0.2, margin: 0, align: 'center', valign: 'middle', fontFace: SANS, fontSize: 10.5, bold: true, color: 'FFFFFF' });
        }
        bx += bw + gap;
      });
      y += rowH + 0.16;
    });
    // legend + totals
    s.addShape('roundRect', { x: MX, y: y + 0.08, w: 0.28, h: 0.18, rectRadius: 0.03, fill: { color: TEAL } });
    s.addText('Built & deployed', { x: MX + 0.36, y: y, w: 1.6, h: 0.34, margin: 0, fontFace: SANS, fontSize: 9.5, color: BODY, valign: 'middle' });
    s.addShape('roundRect', { x: MX + 2.0, y: y + 0.08, w: 0.28, h: 0.18, rectRadius: 0.03, fill: { color: 'FFFFFF' }, line: { color: PURP, width: 1, dashType: 'dash' } });
    s.addText('Next phase (dashed)', { x: MX + 2.36, y: y, w: 1.8, h: 0.34, margin: 0, fontFace: SANS, fontSize: 9.5, color: BODY, valign: 'middle' });
    s.addText([
      { text: 'TOTAL   ', options: { bold: true, color: INK } },
      { text: '141 pipelines  ·  109 test pipelines  ·  605 assertions  ·  all green', options: { color: BODY } },
      { text: '   (Jul 10 count — grown since)', options: { color: MUTED, fontSize: 9.5 } },
    ], { x: 4.7, y, w: 5.75, h: 0.34, margin: 0, fontFace: SANS, fontSize: 11, align: 'right', valign: 'middle' });
    s.addNotes('Same picture we have tracked since June — but now everything the non-prod phase called for is solid. The only dashed box left on this chart is next-phase work (C-360 write-backs into Storybook and marketing tools, on the 2027 roadmap from the February strategy).');
  }

  // ==========================================================
  // S6 — WHAT IS LIVE RIGHT NOW
  // ==========================================================
  {
    const s = slideBase(false); footer(s, false);
    kicker(s, 'DEPLOYED');
    title(s, 'What is live right now');
    const items = [
      ['Full medallion platform in Signature’s AWS', 'Flink, Kafka, Postgres and the serving APIs run as managed services — data never leaves Signature’s cloud'],
      ['Toggle UI on live non-prod data', 'data-quality, revenue, and Storybook tabs rendering from the platform'],
      ['AI Studio', 'plain-English questions over governed endpoints — PII filtered before the model, Bedrock in-AWS, nothing stored'],
      ['SSO end-to-end', 'one click from the SigNet portal; role-based access via Cognito'],
      ['CSV downloads', 'take any view with you, from every tab'],
      ['Blue-green deploys', 'the full assertion suite re-runs before any change is promoted — rollback is instant'],
    ];
    let y = 1.85;
    items.forEach(r => {
      s.addImage({ data: ICONS.check, x: MX + 0.05, y: y + 0.04, w: 0.3, h: 0.3 });
      s.addText([
        { text: r[0] + '\n', options: { bold: true, color: INK, fontSize: 13 } },
        { text: r[1], options: { color: BODY, fontSize: 11 } },
      ], { x: MX + 0.55, y, w: 6.1, h: 0.85, margin: 0, fontFace: SANS, valign: 'top' });
      y += 0.9;
    });
    // right endpoints card
    const cx = 7.6, cw = 2.85;
    s.addShape('roundRect', { x: cx, y: 1.85, w: cw, h: 5.15, rectRadius: 0.1, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
    s.addText('THREE GOVERNED SERVING ENDPOINTS', { x: cx + 0.25, y: 2.1, w: cw - 0.5, h: 0.55, margin: 0, fontFace: SANS, fontSize: 10.5, bold: true, charSpacing: 1.4, color: '8FB8E8' });
    const eps = [['Data quality', 'coverage & completeness'], ['Revenue', 'funnel · suppliers · advisors'], ['Storybook analytics', 'journeys & hot leads']];
    let ey = 2.75;
    eps.forEach(e => {
      s.addShape('roundRect', { x: cx + 0.25, y: ey, w: cw - 0.5, h: 1.02, rectRadius: 0.07, fill: { color: NAVY2 }, line: { color: TEAL, width: 0.75 } });
      s.addText([
        { text: e[0] + '\n', options: { bold: true, fontSize: 12.5, color: 'FFFFFF' } },
        { text: e[1] + '\n', options: { fontSize: 9.5, color: ICE } },
        { text: 'GraphQL + MCP', options: { fontSize: 8.5, bold: true, color: GOLD } },
      ], { x: cx + 0.42, y: ey + 0.08, w: cw - 0.84, h: 0.9, margin: 0, fontFace: SANS, valign: 'middle' });
      ey += 1.14;
    });
    s.addText('Consolidating to a single endpoint is on the optimization list — details in the appendix.', { x: cx + 0.25, y: ey + 0.02, w: cw - 0.5, h: 0.7, margin: 0, fontFace: SANS, fontSize: 9, italic: true, color: ICE2 });
    s.addNotes('Everything on this slide is running today and will be shown live in part 2. The AI Studio bullet is the safety story in one line — worth saying out loud before the demo so questions feel safe.');
  }

  // ==========================================================
  // S7 — KNOWN ENGINEERING WORK (task table)
  // ==========================================================
  {
    const s = slideBase(false); footer(s, false);
    kicker(s, 'ENGINEERING HONESTY');
    title(s, 'Known engineering work to complete');
    s.addText('Code complete means the features are in. These optimizations and hardening items run during the testing window — none of them block your testing.', {
      x: MX, y: 1.5, w: CW, h: 0.42, margin: 0, fontFace: SANS, fontSize: 12, italic: true, color: MUTED,
    });
    const header = [
      { text: 'Workstream', options: { bold: true, color: 'FFFFFF', fontFace: SANS, fontSize: 11.5 } },
      { text: 'What & why (the ROI)', options: { bold: true, color: 'FFFFFF', fontFace: SANS, fontSize: 11.5 } },
      { text: 'Size', options: { bold: true, color: 'FFFFFF', fontFace: SANS, fontSize: 11.5 } },
    ];
    const rows = [
      ['Data-catalog import re-architecture', 'Collapses non-prod data infrastructure from 3 platforms to 1 — lower cost, simpler operations', '2 days'],
      ['E.164 phone-pattern sweep', 'Hunt remaining phone-number patterns in the error logs to lift phone-coverage accuracy further', '2 days'],
      ['Non-prod Storybook event stream', 'Replaces mock data in the Storybook tab with live events — cross-team dependency on Cenora; coordination underway', 'External'],
      ['Auto-ticketing from AI Studio', 'Common questions the data can answer but the API doesn’t expose yet become GitHub tickets automatically', 'In design'],
      ['SSO test hardening', 'Broader automated test coverage across agency and owner roles', 'Scoped'],
      ['Prompt-injection attack testing', 'Adversarial security testing of the AI Studio before the alpha cohort touches production', 'Scoped'],
    ];
    const tableRows = [header.map(h => ({ text: h.text, options: { ...h.options, fill: { color: NAVY }, valign: 'middle' } }))];
    rows.forEach((r, i) => {
      const fill = i === 2 ? GOLDT : (i % 2 ? 'F1F3F8' : 'FFFFFF');
      tableRows.push([
        { text: r[0], options: { bold: true, color: INK, fontFace: SANS, fontSize: 11, fill: { color: fill }, valign: 'middle' } },
        { text: r[1], options: { color: BODY, fontFace: SANS, fontSize: 11, fill: { color: fill }, valign: 'middle' } },
        { text: r[2], options: { bold: true, color: i === 2 ? GOLDD : TEALD, fontFace: SANS, fontSize: 11, fill: { color: fill }, valign: 'middle', align: 'center' } },
      ]);
    });
    s.addTable(tableRows, {
      x: MX, y: 2.1, w: CW, colW: [2.75, 5.85, 1.3],
      border: { type: 'solid', color: LINE, pt: 0.75 },
      margin: 0.09, rowH: [0.42, 0.62, 0.62, 0.72, 0.72, 0.62, 0.62],
    });
    s.addText([
      { text: 'The one external dependency: ', options: { bold: true, color: GOLDD } },
      { text: 'the Storybook event stream (highlighted). Until it lands, the Storybook tab shows representative mock data — exactly as demoed on Friday.', options: { color: BODY } },
    ], { x: MX, y: 7.05, w: CW, h: 0.55, margin: 0, fontFace: SANS, fontSize: 11 });
    s.addNotes('This is the honest engineering list. First two have hard estimates (2 days each). The Storybook stream is the one item outside our control — a Cenora dependency; the working session is being scheduled now. The last three are hardening items that run during the testing window.');
  }

  // ==========================================================
  // S8 — TIMELINE
  // ==========================================================
  {
    const s = slideBase(false); footer(s, false);
    kicker(s, 'THE ROAD FROM HERE');
    title(s, 'From today to the Owners Meeting');
    const yLine = 4.35;
    const stops = [
      { x: 1.35, top: true,  gold: false, d1: 'Fri, Aug 7',        d2: 'Non-prod code complete — this walk-through; testing opens' },
      { x: 3.55, top: false, gold: false, d1: 'Fri, Aug 28',       d2: 'Production turned on; production testing begins' },
      { x: 5.45, top: true,  gold: false, d1: 'Fri, Sep 4',        d2: 'Production testing fully underway' },
      { x: 7.55, top: false, gold: true,  d1: 'Week of Sep 29',    d2: 'Owners Meeting, San Antonio — alpha cohort announced' },
      { x: 9.6,  top: true,  gold: false, d1: 'Oct 5 – Nov 13',    d2: 'Alpha: agency owners live on production' },
    ];
    s.addShape('line', { x: 0.8, y: yLine, w: 9.4, h: 0, line: { color: 'C4CADB', width: 2 } });
    // testing window band
    s.addShape('roundRect', { x: 1.35, y: yLine + 0.42, w: 6.2, h: 0.46, rectRadius: 0.06, fill: { color: TEAL, transparency: 82 } });
    s.addText('AUG 7 – SEP 29  ·  INTERNAL (NON-PROD) TESTING WINDOW — YOUR WINDOW', {
      x: 1.35, y: yLine + 0.42, w: 6.2, h: 0.46, margin: 0, align: 'center', valign: 'middle', fontFace: SANS, fontSize: 9.5, bold: true, charSpacing: 0.8, color: TEALD,
    });
    stops.forEach(st => {
      const d = st.gold ? 0.34 : 0.2;
      s.addShape('ellipse', { x: st.x - d / 2, y: yLine - d / 2, w: d, h: d, fill: { color: st.gold ? GOLD : NAVY } });
      const boxW = 2.0, bx = Math.min(Math.max(st.x - boxW / 2, 0.4), W - 0.4 - boxW);
      const by = st.top ? yLine - 1.72 : yLine + 1.06;
      s.addShape('line', { x: st.x, y: st.top ? yLine - 0.45 : yLine + (st.gold ? 0.95 : 0.45), w: 0, h: st.top ? 0.32 : 0.0, line: { color: 'C4CADB', width: 1 } });
      s.addText([
        { text: st.d1 + '\n', options: { bold: true, fontSize: st.gold ? 13.5 : 12, color: st.gold ? GOLDD : INK } },
        { text: st.d2, options: { fontSize: 9.5, color: st.gold ? GOLDD : MUTED } },
      ], { x: bx, y: by, w: boxW, h: 1.25, margin: 0, align: 'center', fontFace: SANS, valign: st.top ? 'bottom' : 'top' });
    });
    s.addText('The only technical difference between non-prod and production is the volume of data — the engine is the same.', {
      x: MX, y: 6.9, w: CW, h: 0.4, margin: 0, align: 'center', fontFace: SANS, fontSize: 12.5, italic: true, color: BODY,
    });
    s.addNotes('Walk left to right. The teal band is the board’s window. Production comes on Aug 28 and must be in full test by Sep 4 — that is what makes the Sep 29 Owners Meeting a full-data reveal. Alpha (Oct 5 – Nov 13) is a subset of agency owners on production, announced in San Antonio.');
  }

  // ==========================================================
  // S9 — POSITIONING (the moment)
  // ==========================================================
  {
    const s = slideBase(true); footer(s, true);
    kicker(s, 'THE MESSAGE  ·  HOW WE POSITION TODAY', { color: GOLD });
    title(s, 'What today is — and what it isn’t', { color: 'FFFFFF' });
    // left card
    s.addShape('roundRect', { x: MX, y: 1.85, w: 4.82, h: 4.15, rectRadius: 0.1, fill: { color: NAVY2 }, line: { color: TEAL, width: 1.25 } });
    s.addText('TODAY — SEE THE ENGINE, JUDGE THE DIRECTION', { x: MX + 0.3, y: 2.08, w: 4.2, h: 0.55, margin: 0, fontFace: SANS, fontSize: 11.5, bold: true, charSpacing: 1, color: '7FD1DE' });
    s.addText([
      { text: 'The real system — live in Signature’s cloud, not a prototype', options: { bullet: true, breakLine: true } },
      { text: 'The full UI you’ll put in owners’ hands', options: { bullet: true, breakLine: true } },
      { text: 'Ask it anything — the AI Studio answers from governed data', options: { bullet: true, breakLine: true } },
      { text: 'Non-prod = the same engine at reduced data volume', options: { bullet: true } },
    ], { x: MX + 0.3, y: 2.75, w: 4.25, h: 3.0, margin: 0, fontFace: SANS, fontSize: 12.5, color: 'FFFFFF', paraSpaceAfter: 10, valign: 'top' });
    // right card
    s.addShape('roundRect', { x: 5.62, y: 1.85, w: 4.82, h: 4.15, rectRadius: 0.1, fill: { color: NAVY2 }, line: { color: GOLD, width: 1.25 } });
    s.addText('NOT YET — AND BY DESIGN', { x: 5.92, y: 2.08, w: 4.2, h: 0.55, margin: 0, fontFace: SANS, fontSize: 11.5, bold: true, charSpacing: 1, color: GOLD });
    s.addText([
      { text: 'The numbers are not 100% current — the full-volume, current-data debut belongs to the Owners Meeting, Sept 29', options: { bullet: true, breakLine: true } },
      { text: 'The Storybook tab runs on representative mock data until the upstream non-prod stream lands (in motion with Cenora) — exactly as shown on Friday', options: { bullet: true, breakLine: true } },
      { text: 'So: don’t audit today’s figures — audit the engine, the experience, and the direction', options: { bullet: true } },
    ], { x: 5.92, y: 2.75, w: 4.25, h: 3.0, margin: 0, fontFace: SANS, fontSize: 12.5, color: 'FFFFFF', paraSpaceAfter: 10, valign: 'top' });
    s.addText('“Today is the beautiful tour of the ship before the sailing. The voyage itself — full, current data — departs from San Antonio on September 29.”', {
      x: 1.0, y: 6.45, w: 9.0, h: 0.85, margin: 0, align: 'center', fontFace: SERIF, fontSize: 16, italic: true, color: ICE,
    });
    s.addNotes('This is the repositioning moment (decision with Karen): we are demoing non-prod, so the board cannot check it for 100% currentness yet — that is the Owners Meeting. What they CAN do today is see the engine and understand the business and the direction. Storybook tab = mock data, exactly as seen Friday, because of the upstream stream dependency. Land this before anyone opens a laptop.');
  }

  // ==========================================================
  // S10 — DIVIDER: LIVE DEMO
  // ==========================================================
  {
    const s = slideBase(true); footer(s, true);
    s.addText('PART 2', { x: 0.85, y: 2.7, w: 9, h: 0.35, margin: 0, fontFace: SANS, fontSize: 13, bold: true, charSpacing: 3, color: '8FB8E8' });
    s.addText('Live demo: touring the engine', { x: 0.85, y: 3.1, w: 9.4, h: 0.85, margin: 0, fontFace: SERIF, fontSize: 34, bold: true, color: 'FFFFFF' });
    s.addText('From SigNet sign-in to the AI Studio. Interrupt freely — it’s your engine now.', {
      x: 0.85, y: 4.25, w: 9.0, h: 0.5, margin: 0, fontFace: SANS, fontSize: 15, italic: true, color: ICE,
    });
    iconCircle(s, 'ship', 9.0, 1.7, 1.15, NAVY2);
    s.addNotes('Switch to the live environment here. The next slide is the map of the six stops if you want it on screen while people find seats, or as the fallback if connectivity misbehaves.');
  }

  // ==========================================================
  // S11 — DEMO MAP
  // ==========================================================
  {
    const s = slideBase(false); footer(s, false);
    kicker(s, 'THE TOUR');
    title(s, 'Six stops');
    const stops = [
      ['lock', 'Sign in from SigNet', 'One click, single sign-on, role-based access', 'Watch for: no new passwords, no new portals'],
      ['gauge', 'Data-quality tab', 'Client-record coverage by agency and advisor', 'Watch for: where cleanup pays back fastest'],
      ['chart', 'Revenue tab', 'Quoted → Confirmed → Travelled by travel month; suppliers by name', 'Watch for: the shape of the funnel'],
      ['comments', 'AI Studio', 'Ask questions in plain English', 'Watch for: answers drawn from the same governed APIs as the charts'],
      ['book', 'Storybook tab', 'Booking-journey analytics and hot leads', 'Mock data today — flagged until the upstream stream lands'],
      ['csv', 'CSV downloads', 'Take any view with you', 'Watch for: what your team would do with this on Monday'],
    ];
    const colW = 4.9, colGap = 0.3, rowH = 1.62, rowGap = 0.16;
    stops.forEach((st, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = MX + col * (colW + colGap), y = 1.8 + row * (rowH + rowGap);
      s.addShape('roundRect', { x, y, w: colW, h: rowH, rectRadius: 0.09, fill: { color: 'FFFFFF' }, line: { color: LINE, width: 1 } });
      numCircle(s, i + 1, x + 0.22, y + 0.24, 0.4, i === 4 ? PURP : TEAL);
      iconCircle(s, st[0], x + 0.22, y + 0.82, 0.55, i === 4 ? PURP : NAVY);
      s.addText([
        { text: st[1] + '\n', options: { bold: true, fontSize: 13.5, color: INK } },
        { text: st[2] + '\n', options: { fontSize: 10.5, color: BODY } },
        { text: st[3], options: { fontSize: 9.5, italic: true, color: i === 4 ? PURP : TEALD } },
      ], { x: x + 1.0, y: y + 0.14, w: colW - 1.2, h: rowH - 0.26, margin: 0, fontFace: SANS, valign: 'top' });
    });
    s.addNotes('Six stops, ~3 minutes each. Stop 4 (AI Studio) is where you hand the keyboard to a board member and let them ask something real. Stop 5: say “mock data” out loud before showing the tab.');
  }

  // ==========================================================
  // S12 — DIVIDER: YOUR TURN
  // ==========================================================
  {
    const s = slideBase(true); footer(s, true);
    s.addText('PART 3', { x: 0.85, y: 2.7, w: 9, h: 0.35, margin: 0, fontFace: SANS, fontSize: 13, bold: true, charSpacing: 3, color: '8FB8E8' });
    s.addText('Now it’s your turn', { x: 0.85, y: 3.1, w: 9.4, h: 0.95, margin: 0, fontFace: SERIF, fontSize: 40, bold: true, color: 'FFFFFF' });
    s.addText('Non-prod testing runs from today through the Owners Meeting — here’s what to test, what to ask, and how to report what you find.', {
      x: 0.85, y: 4.25, w: 9.2, h: 0.6, margin: 0, fontFace: SANS, fontSize: 15, italic: true, color: ICE,
    });
    iconCircle(s, 'clipboard', 9.0, 1.7, 1.15, NAVY2);
    s.addNotes('Transition from “we built” to “you test.” Three slides: what testing is available, the #1 ask (AI Studio questions), and the bug loop — then the date we reconvene.');
  }

  // ==========================================================
  // S13 — WHAT YOU CAN TEST
  // ==========================================================
  {
    const s = slideBase(false); footer(s, false);
    kicker(s, 'THE TESTING WINDOW');
    title(s, 'What you can test — starting now');
    const cards = [
      ['gauge', 'Explore every dashboard', 'Filter, drill, and compare across the data-quality and revenue tabs — through your own agency lens.'],
      ['comments', 'Interrogate the AI Studio', 'Ask real business questions in plain English. This is the #1 ask — next slide.'],
      ['wrench', 'Stress the edges', 'Odd filters, big CSV exports, fast tab-switching, second sign-ins. Please try to break it.'],
      ['balance', 'Challenge the numbers', 'If a figure doesn’t match your intuition, that’s a finding — tell us, and we’ll show the lineage.'],
    ];
    const cw2 = 4.9, ch = 1.95;
    cards.forEach((c, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = MX + col * (cw2 + 0.3), y = 1.85 + row * (ch + 0.25);
      s.addShape('roundRect', { x, y, w: cw2, h: ch, rectRadius: 0.09, fill: { color: 'FFFFFF' }, line: { color: LINE, width: 1 } });
      iconCircle(s, c[0], x + 0.25, y + 0.28, 0.62, TEAL);
      s.addText([
        { text: c[1] + '\n', options: { bold: true, fontSize: 14.5, color: INK } },
        { text: c[2], options: { fontSize: 11.5, color: BODY } },
      ], { x: x + 1.1, y: y + 0.22, w: cw2 - 1.35, h: ch - 0.4, margin: 0, fontFace: SANS, valign: 'top' });
    });
    s.addShape('roundRect', { x: MX, y: 6.35, w: CW, h: 0.72, rectRadius: 0.09, fill: { color: TINT } });
    s.addText([
      { text: 'Environment: ', options: { bold: true, color: INK } }, { text: 'non-prod (same engine, reduced data volume)      ', options: { color: BODY } },
      { text: 'Access: ', options: { bold: true, color: INK } }, { text: 'SSO from SigNet — credentials & instructions arrive by email      ', options: { color: BODY } },
      { text: 'Window: ', options: { bold: true, color: INK } }, { text: 'Aug 7 → Sep 29', options: { color: BODY } },
    ], { x: MX + 0.3, y: 6.35, w: CW - 0.6, h: 0.72, margin: 0, fontFace: SANS, fontSize: 11.5, valign: 'middle' });
    s.addNotes('Four modes of testing — exploration, interrogation, stress, and challenge. The strip at the bottom is the logistics; the credentials email carries step-by-step instructions and the bug form link.');
  }

  // ==========================================================
  // S14 — THE #1 ASK: AI STUDIO
  // ==========================================================
  {
    const s = slideBase(false); footer(s, false);
    kicker(s, 'THE #1 ASK');
    title(s, 'Ask questions inside the AI Studio');
    const why = [
      ['Your questions are the roadmap', 'What you ask determines which views and APIs we expose next.'],
      ['Unanswered ≠ unanswerable', 'If the data can answer but the UI can’t yet, your question becomes an engineering ticket — we’re automating that flow.'],
      ['It’s safe to ask anything', 'PII is filtered before any model call; models run on Bedrock inside Signature’s AWS; nothing is stored or used for training.'],
    ];
    let y = 1.95;
    const whyIcons = ['question', 'github', 'shield'];
    why.forEach((wRow, i) => {
      iconCircle(s, whyIcons[i], MX, y, 0.58, i === 2 ? GREEN : TEAL);
      s.addText([
        { text: wRow[0] + '\n', options: { bold: true, fontSize: 14, color: INK } },
        { text: wRow[1], options: { fontSize: 11.5, color: BODY } },
      ], { x: MX + 0.85, y: y - 0.06, w: 4.55, h: 1.5, margin: 0, fontFace: SANS, valign: 'top' });
      y += 1.62;
    });
    // right: try-these card with chat bubbles
    const cx = 6.2, cw3 = 4.25;
    s.addShape('roundRect', { x: cx, y: 1.85, w: cw3, h: 5.2, rectRadius: 0.1, fill: { color: NAVY } });
    s.addText('TRY THESE ON DAY ONE', { x: cx + 0.3, y: 2.05, w: cw3 - 0.6, h: 0.4, margin: 0, fontFace: SANS, fontSize: 10.5, bold: true, charSpacing: 1.5, color: '8FB8E8' });
    const prompts = [
      'How did quoted vs. travelled revenue trend by month this year?',
      'Which suppliers drove the most travelled revenue for my agency?',
      'How many new clients did we add each day this month?',
      'What share of my clients have a valid email and phone on file?',
      'Which client families are flagged as hot leads right now?',
    ];
    let py = 2.55;
    prompts.forEach(p => {
      s.addShape('roundRect', { x: cx + 0.3, y: py, w: cw3 - 0.6, h: 0.74, rectRadius: 0.12, fill: { color: NAVY2 }, line: { color: TEAL, width: 0.75 } });
      s.addText('“' + p + '”', { x: cx + 0.48, y: py, w: cw3 - 0.96, h: 0.74, margin: 0, fontFace: SANS, fontSize: 10.5, italic: true, color: 'FFFFFF', valign: 'middle' });
      py += 0.86;
    });
    s.addNotes('The single most valuable thing a board member can do in August: open the AI Studio and ask it what they actually want to know. Every question is telemetry for the roadmap — and the safety line (PII filtered, in-AWS, nothing stored) removes the hesitation.');
  }

  // ==========================================================
  // S15 — BUG REPORTING LOOP
  // ==========================================================
  {
    const s = slideBase(false); footer(s, false);
    kicker(s, 'WHEN SOMETHING LOOKS WRONG');
    title(s, 'The bug-reporting loop');
    const steps = [
      ['camera', '1 · Capture', 'Screenshot, what you expected, and where you were (tab + filters).'],
      ['form', '2 · Submit', 'One form — the Monday board form. The link arrives with your credentials email.'],
      ['github', '3 · Auto-ticket', 'Your submission becomes an engineering ticket automatically. No chasing, no email threads.'],
      ['check2', '4 · Fix & confirm', 'Turnaround target of 4–24 hours during internal testing — and we confirm back to you when it’s fixed.'],
    ];
    const bw = 2.38, gap = 0.13; let x = MX;
    steps.forEach((st, i) => {
      s.addShape('roundRect', { x, y: 2.0, w: bw, h: 3.3, rectRadius: 0.1, fill: { color: 'FFFFFF' }, line: { color: LINE, width: 1 } });
      iconCircle(s, st[0] === 'check2' ? 'flag' : st[0], x + bw / 2 - 0.36, 2.3, 0.72, i === 3 ? GREEN : TEAL);
      s.addText(st[1], { x: x + 0.15, y: 3.2, w: bw - 0.3, h: 0.4, margin: 0, align: 'center', fontFace: SANS, fontSize: 14, bold: true, color: INK });
      s.addText(st[2], { x: x + 0.2, y: 3.62, w: bw - 0.4, h: 1.55, margin: 0, align: 'center', fontFace: SANS, fontSize: 10.5, color: BODY });
      x += bw + gap;
    });
    s.addShape('roundRect', { x: MX, y: 5.75, w: CW, h: 0.95, rectRadius: 0.09, fill: { color: TEALT } });
    s.addText([
      { text: 'Questions are feedback too.  ', options: { bold: true, color: TEALD } },
      { text: '“Why is this number X?” regularly uncovers real issues — send it through the same form, or just ask it in the AI Studio.', options: { color: BODY } },
    ], { x: MX + 0.3, y: 5.75, w: CW - 0.6, h: 0.95, margin: 0, fontFace: SANS, fontSize: 12, valign: 'middle' });
    s.addText('For the alpha cohort this fall, we’re finalizing a 1–3 business-day SLA; during internal testing you get the fast lane.', {
      x: MX, y: 6.95, w: CW, h: 0.35, margin: 0, fontFace: SANS, fontSize: 10.5, italic: true, color: MUTED,
    });
    s.addNotes('One intake path: the Monday board form, auto-converted to engineering tickets. 4–24h turnaround target during internal testing (the alpha SLA of 1–3 business days is being finalized). Emphasize: a confusing number is as valuable as a broken button.');
  }

  // ==========================================================
  // S16 — NEXT BIG LOOK
  // ==========================================================
  {
    const s = slideBase(true); footer(s, true);
    kicker(s, 'SAVE THE DATE', { color: GOLD });
    iconCircle(s, 'anchor', 0.85, 2.3, 1.0, NAVY2);
    s.addText('Week of September 29', { x: 2.15, y: 2.2, w: 8.3, h: 0.95, margin: 0, fontFace: SERIF, fontSize: 40, bold: true, color: 'FFFFFF' });
    s.addText('Owners Meeting  ·  San Antonio — the next time we look at this together.', {
      x: 2.15, y: 3.2, w: 8.2, h: 0.45, margin: 0, fontFace: SANS, fontSize: 16, italic: true, color: GOLD,
    });
    s.addText('Full production data on stage. The alpha cohort announced. The real thing.', {
      x: 2.15, y: 3.75, w: 8.2, h: 0.45, margin: 0, fontFace: SANS, fontSize: 14, color: ICE,
    });
    const mile = [['Aug 28', 'production turned on'], ['Sep 4', 'production testing fully underway'], ['Oct 5', 'alpha cohort goes live']];
    let mx2 = 0.85;
    mile.forEach(m => {
      s.addShape('roundRect', { x: mx2, y: 4.9, w: 3.05, h: 1.05, rectRadius: 0.09, fill: { color: NAVY2 }, line: { color: TEAL, width: 0.75 } });
      s.addText([
        { text: m[0] + '\n', options: { bold: true, fontSize: 15, color: 'FFFFFF' } },
        { text: m[1], options: { fontSize: 10.5, color: ICE } },
      ], { x: mx2 + 0.2, y: 4.98, w: 2.65, h: 0.9, margin: 0, fontFace: SANS, valign: 'middle' });
      mx2 += 3.25;
    });
    s.addText('Between now and then: you test, we harden.', {
      x: 0.85, y: 6.45, w: 9.3, h: 0.45, margin: 0, fontFace: SERIF, fontSize: 17, italic: true, color: 'FFFFFF',
    });
    s.addNotes('The commitment date: week of Sept 29, Owners Meeting, San Antonio — the full-data look. The three tiles are the run-up milestones so the board knows exactly what happens between now and then.');
  }

  // ==========================================================
  // S17 — DIVIDER: STRATEGY
  // ==========================================================
  {
    const s = slideBase(true); footer(s, true);
    s.addText('PART 4', { x: 0.85, y: 2.7, w: 9, h: 0.35, margin: 0, fontFace: SANS, fontSize: 13, bold: true, charSpacing: 3, color: '8FB8E8' });
    s.addText('From data strategy to flywheel', { x: 0.85, y: 3.1, w: 9.4, h: 0.85, margin: 0, fontFace: SERIF, fontSize: 34, bold: true, color: 'FFFFFF' });
    s.addText('Picking up where February’s “Closing the Loop” left off — and then opening the floor.', {
      x: 0.85, y: 4.25, w: 9.2, h: 0.5, margin: 0, fontFace: SANS, fontSize: 15, italic: true, color: ICE,
    });
    iconCircle(s, 'compass', 9.0, 1.7, 1.15, NAVY2);
    s.addNotes('Bridge back to the February board deck (“Closing the Loop: a revenue-focused data strategy”). The next three slides: promise vs. delivery, the flywheel, and today-vs-Sept-29 — then discussion.');
  }

  // ==========================================================
  // S18 — FEBRUARY PROMISED, AUGUST DELIVERED
  // ==========================================================
  {
    const s = slideBase(false); footer(s, false);
    kicker(s, 'CLOSING THE LOOP');
    title(s, 'February promised, August delivered');
    const rows = [
      ['Start with the revenue decision', 'Revenue is a live data product: the booking funnel, suppliers, and advisors — by travel month'],
      ['Build deep, not wide', 'Three deep data products — data quality, revenue, Storybook analytics — not dashboards-for-all'],
      ['Automate the infrastructure', 'AI-generated pipelines and APIs: 141 pipelines rebuilt and re-verified on every single change'],
      ['Secure · scalable · observable', 'One AWS environment, PII governed at the API layer, 605 self-verifying assertions'],
      ['“87% of data projects never reach production”', 'This one is deployed — and you’re about to test it yourselves'],
    ];
    let y = 1.9; const lh = 0.92, lw = 4.35, rw = 4.55, rx = 5.85;
    rows.forEach(r => {
      s.addShape('roundRect', { x: MX, y, w: lw, h: lh, rectRadius: 0.08, fill: { color: TINT } });
      s.addText(r[0], { x: MX + 0.22, y, w: lw - 0.44, h: lh, margin: 0, fontFace: SANS, fontSize: 12, italic: true, bold: true, color: NAVY, valign: 'middle' });
      s.addText('→', { x: 4.95, y, w: 0.85, h: lh, margin: 0, align: 'center', valign: 'middle', fontFace: SANS, fontSize: 19, bold: true, color: TEAL });
      s.addShape('roundRect', { x: rx, y, w: rw, h: lh, rectRadius: 0.08, fill: { color: 'FFFFFF' }, line: { color: LINE, width: 1 } });
      s.addText(r[1], { x: rx + 0.22, y, w: rw - 0.44, h: lh, margin: 0, fontFace: SANS, fontSize: 11.5, color: BODY, valign: 'middle' });
      y += lh + 0.14;
    });
    s.addText('The internal engine that kickstarts the cooperative’s data flywheel — shipped.', {
      x: MX, y: 7.25, w: CW, h: 0.4, margin: 0, align: 'center', fontFace: SERIF, fontSize: 15, italic: true, bold: true, color: INK,
    });
    s.addNotes('Left column is verbatim from the February strategy deck; right column is what stands deployed today. The Gartner stat lands the point: most data programs die before production — this one is live and testable.');
  }

  // ==========================================================
  // S19 — THE FLYWHEEL
  // ==========================================================
  {
    const s = slideBase(false); footer(s, false);
    kicker(s, 'HOW THIS GROWS REVENUE');
    title(s, 'The cooperative’s data flywheel');
    const cx = 5.5, cy = 4.62, a = 2.72, b = 1.86; // ellipse radii
    // ring
    s.addShape('ellipse', { x: cx - a, y: cy - b, w: 2 * a, h: 2 * b, fill: { type: 'none' }, line: { color: TEAL, width: 3 } });
    // arrowheads at 45,135,225,315 degrees
    [45, 135, 225, 315].forEach(deg => {
      const t = deg * Math.PI / 180;
      const px = cx + a * Math.cos(t), py2 = cy + b * Math.sin(t);
      const vx = -a * Math.sin(t), vy = b * Math.cos(t);
      const phi = (Math.atan2(vx, -vy) * 180 / Math.PI + 360) % 360;
      const sz = 0.34;
      s.addShape('triangle', { x: px - sz / 2, y: py2 - sz / 2, w: sz, h: sz, fill: { color: TEAL }, rotate: Math.round(phi) });
    });
    // center hub
    s.addShape('ellipse', { x: cx - 1.02, y: cy - 1.02, w: 2.04, h: 2.04, fill: { color: GOLD }, shadow: { type: 'outer', color: 'B99417', blur: 8, offset: 2, angle: 90, opacity: 0.35 } });
    s.addImage({ data: ICONS.chart, x: cx - 0.26, y: cy - 0.62, w: 0.52, h: 0.52 });
    s.addText('REVENUE\nGROWTH', { x: cx - 1.0, y: cy - 0.06, w: 2.0, h: 0.85, margin: 0, align: 'center', fontFace: SANS, fontSize: 14.5, bold: true, charSpacing: 1, color: 'FFFFFF' });
    // nodes N E S W
    const nodes = [
      { x: cx, y: cy - b, icon: 'database', t: 'MORE DATA', sub: 'every booking, client & session enriches the co-op’s shared asset' },
      { x: cx + a, y: cy, icon: 'compass', t: 'SMARTER CRUISE\nRECOMMENDATIONS', sub: 'the engine turns shared data into next-best-trip guidance' },
      { x: cx, y: cy + b, icon: 'heart', t: 'MORE PERSONAL\nEXPERIENCES', sub: 'advisors meet every client with full context' },
      { x: cx - a, y: cy, icon: 'ship', t: 'MORE BOOKINGS', sub: 'trust converts — booking rates rise' },
    ];
    nodes.forEach(n => {
      const nw = 2.56, nh = 1.32;
      s.addShape('roundRect', { x: n.x - nw / 2, y: n.y - nh / 2, w: nw, h: nh, rectRadius: 0.1, fill: { color: NAVY3 }, shadow: { type: 'outer', color: 'C6CBDA', blur: 6, offset: 2, angle: 90, opacity: 0.5 } });
      iconCircle(s, n.icon, n.x - nw / 2 + 0.14, n.y - nh / 2 + 0.14, 0.44, TEAL);
      s.addText(n.t, { x: n.x - nw / 2 + 0.66, y: n.y - nh / 2 + 0.1, w: nw - 0.76, h: 0.56, margin: 0, fontFace: SANS, fontSize: 10.5, bold: true, color: 'FFFFFF', valign: 'middle' });
      s.addText(n.sub, { x: n.x - nw / 2 + 0.16, y: n.y - nh / 2 + 0.7, w: nw - 0.32, h: 0.56, margin: 0, fontFace: SANS, fontSize: 8.5, color: ICE, valign: 'top' });
    });
    s.addText('Each turn compounds: richer data sharpens recommendations, sharper recommendations create more personal experiences, personal experiences win more bookings — and every booking feeds the data. Member-owned, and it never stops spinning.', {
      x: 0.75, y: 7.15, w: 9.5, h: 0.75, margin: 0, align: 'center', fontFace: SANS, fontSize: 11.5, italic: true, color: BODY,
    });
    s.addNotes('The executive flywheel — the one picture to remember. Walk it clockwise from MORE DATA. Revenue growth sits in the middle because it is the output of the loop, not a stop on it. Tie back to Amazon (~35% of revenue from recommendations) and McKinsey (personalization lifts conversions 10–15%) from the February deck if asked for evidence.');
  }

  // ==========================================================
  // S20 — TOUR VS VOYAGE
  // ==========================================================
  {
    const s = slideBase(true); footer(s, true);
    kicker(s, 'WHY TODAY MATTERS', { color: '8FB8E8' });
    title(s, 'You’ve now seen the engine', { color: 'FFFFFF' });
    // left card — today
    s.addShape('roundRect', { x: MX, y: 1.95, w: 4.82, h: 3.9, rectRadius: 0.1, fill: { color: NAVY2 }, line: { color: TEAL, width: 1.25 } });
    iconCircle(s, 'ship', MX + 0.3, 2.25, 0.66, TEAL);
    s.addText('TODAY — THE TOUR', { x: MX + 1.15, y: 2.32, w: 3.4, h: 0.5, margin: 0, fontFace: SANS, fontSize: 13, bold: true, charSpacing: 1.2, color: '7FD1DE', valign: 'middle' });
    s.addText([
      { text: 'The real engine, live in Signature’s cloud', options: { bullet: true, breakLine: true } },
      { text: 'The full UI and the AI Studio, in your hands', options: { bullet: true, breakLine: true } },
      { text: 'Non-prod data — reduced volume, same machinery', options: { bullet: true, breakLine: true } },
      { text: 'Your questions start steering the roadmap today', options: { bullet: true } },
    ], { x: MX + 0.32, y: 3.15, w: 4.2, h: 2.55, margin: 0, fontFace: SANS, fontSize: 12.5, color: 'FFFFFF', paraSpaceAfter: 9, valign: 'top' });
    // right card — voyage
    s.addShape('roundRect', { x: 5.62, y: 1.95, w: 4.82, h: 3.9, rectRadius: 0.1, fill: { color: NAVY2 }, line: { color: GOLD, width: 1.25 } });
    iconCircle(s, 'anchor', 5.92, 2.25, 0.66, GOLDD);
    s.addText('SEPT 29 — THE VOYAGE', { x: 6.77, y: 2.32, w: 3.4, h: 0.5, margin: 0, fontFace: SANS, fontSize: 13, bold: true, charSpacing: 1.2, color: GOLD, valign: 'middle' });
    s.addText([
      { text: 'Full production data on the Owners-Meeting stage', options: { bullet: true, breakLine: true } },
      { text: 'San Antonio: the cooperative’s owners see it current', options: { bullet: true, breakLine: true } },
      { text: 'The alpha cohort announced — owners go hands-on in October', options: { bullet: true, breakLine: true } },
      { text: 'You walk in already fluent — you’ve been using it since August', options: { bullet: true } },
    ], { x: 5.94, y: 3.15, w: 4.2, h: 2.55, margin: 0, fontFace: SANS, fontSize: 12.5, color: 'FFFFFF', paraSpaceAfter: 9, valign: 'top' });
    s.addText('“Like touring a beautiful ship before her maiden voyage — every deck is real, every system is running. The itinerary begins September 29.”', {
      x: 1.0, y: 6.25, w: 9.0, h: 0.85, margin: 0, align: 'center', fontFace: SERIF, fontSize: 16, italic: true, color: ICE,
    });
    s.addNotes('Land the metaphor and the asymmetry: the board gets the tour now precisely so the owners get a flawless voyage on Sept 29 — with board members as experienced guides rather than fellow first-time passengers.');
  }

  // ==========================================================
  // S21 — DISCUSSION: 3 STARTER QUESTIONS
  // ==========================================================
  {
    const s = slideBase(false); footer(s, false);
    kicker(s, 'OVER TO YOU');
    title(s, 'Three questions to start the discussion');
    const qs = [
      'Where would a trusted next-trip recommendation change a real client conversation first in your agency — and who makes that call today?',
      'What would these numbers have to show — or survive — before you’d run your agency on them?',
      'Which automated decision from February’s strategy should the flywheel power first: next-best-trip, personalized upsell, or lead routing?',
    ];
    let y = 1.95;
    qs.forEach((q, i) => {
      s.addShape('roundRect', { x: MX, y, w: CW, h: 1.42, rectRadius: 0.1, fill: { color: 'FFFFFF' }, line: { color: LINE, width: 1 }, shadow: { type: 'outer', color: 'D5D9E4', blur: 6, offset: 2, angle: 90, opacity: 0.45 } });
      numCircle(s, i + 1, MX + 0.28, y + 0.44, 0.54, i === 1 ? GOLD : TEAL);
      s.addText(q, { x: MX + 1.15, y: y + 0.12, w: CW - 1.5, h: 1.18, margin: 0, fontFace: SERIF, fontSize: 15.5, italic: true, color: INK, valign: 'middle' });
      y += 1.62;
    });
    s.addText('We’re here to listen: the roadmap after September 29 gets built from this conversation.', {
      x: MX, y: 7.0, w: CW, h: 0.4, margin: 0, align: 'center', fontFace: SANS, fontSize: 12.5, italic: true, color: MUTED,
    });
    s.addNotes('Open the floor with Q1 (concrete, personal to each owner’s agency). Q2 surfaces the trust threshold — capture the answers verbatim; they become acceptance criteria. Q3 forces a prioritization signal among the February automation candidates. Let silence do its work.');
  }

  // ==========================================================
  // S22 — NORTH STAR
  // ==========================================================
  {
    const s = slideBase(true); footer(s, true);
    kicker(s, 'THE NORTH STAR', { color: GOLD });
    title(s, 'Walk into San Antonio having used it —\nnot just heard about it', { color: 'FFFFFF', size: 27, h: 1.15 });
    const asks = [
      ['user', 'Test it yourself', 'Log in, click around, download. A few minutes a week between now and Sept 29 is enough.'],
      ['comments', 'Ask it questions', 'Every question trains the roadmap — and your hardest questions now become our credibility on stage later.'],
      ['compass', 'Champion the flywheel', 'Leave aligned that the cooperative’s shared data is how members grow revenue — and say so to the owners.'],
    ];
    const bw2 = 3.15, gap2 = 0.225; let x = MX;
    asks.forEach(a2 => {
      s.addShape('roundRect', { x, y: 2.55, w: bw2, h: 3.15, rectRadius: 0.1, fill: { color: NAVY2 }, line: { color: TEAL, width: 0.75 } });
      iconCircle(s, a2[0], x + bw2 / 2 - 0.42, 2.85, 0.84, TEAL);
      s.addText(a2[1], { x: x + 0.2, y: 3.9, w: bw2 - 0.4, h: 0.45, margin: 0, align: 'center', fontFace: SANS, fontSize: 15.5, bold: true, color: 'FFFFFF' });
      s.addText(a2[2], { x: x + 0.28, y: 4.4, w: bw2 - 0.56, h: 1.2, margin: 0, align: 'center', fontFace: SANS, fontSize: 11, color: ICE });
      x += bw2 + gap2;
    });
    s.addText('If this room leaves committed to those three things, today did its job — and September 29 takes care of itself.', {
      x: 1.0, y: 6.3, w: 9.0, h: 0.6, margin: 0, align: 'center', fontFace: SERIF, fontSize: 15.5, italic: true, color: 'FFFFFF',
    });
    s.addNotes('The North Star of this demo: convert the board from an audience into users and champions. Informed skeptics in August become credible advocates in front of the owners in September. This is the ask to leave ringing in the room.');
  }

  // ==========================================================
  // S23 — CLOSE
  // ==========================================================
  {
    const s = slideBase(true); footer(s, true);
    iconCircle(s, 'compassGold', 0.85, 2.0, 1.0, NAVY2);
    s.addText('SigCompass', { x: 0.85, y: 3.25, w: 9.3, h: 1.0, margin: 0, fontFace: SERIF, fontSize: 46, bold: true, color: 'FFFFFF' });
    s.addText('One cooperative. One direction.', { x: 0.85, y: 4.3, w: 9.0, h: 0.5, margin: 0, fontFace: SANS, fontSize: 17, italic: true, color: GOLD });
    s.addText('The engine is running. Testing opens now. The voyage departs September 29 from San Antonio.', {
      x: 0.85, y: 5.15, w: 9.2, h: 0.45, margin: 0, fontFace: SANS, fontSize: 14, color: ICE,
    });
    s.addText([
      { text: 'Access instructions and the bug form arrive with your credentials email.    ', options: {} },
      { text: 'Questions any time: denise@denisegosnell.ai', options: { bold: true } },
    ], { x: 0.85, y: 6.15, w: 9.2, h: 0.4, margin: 0, fontFace: SANS, fontSize: 11.5, color: '8A94C8' });
    s.addText('Thank you.', { x: 0.85, y: 6.9, w: 9.0, h: 0.4, margin: 0, fontFace: SANS, fontSize: 13, bold: true, color: 'FFFFFF' });
    s.addNotes('Close on the name and the promise. Logistics reminder: credentials email carries everything (access steps, bug form, example questions).');
  }

  // ==========================================================
  // S24 — APPENDIX: ENDPOINTS & ACCESS
  // ==========================================================
  {
    const s = slideBase(false); footer(s, false);
    kicker(s, 'APPENDIX — FOR YOUR TESTING');
    title(s, 'Non-prod access & governed endpoints');
    const info = [
      ['Access', 'Sign in through the SigNet portal (single sign-on). Credentials and step-by-step instructions arrive by email with your testing invitation.'],
      ['Bugs & requests', 'Submit through the Monday board form (link in the same email). Submissions become engineering tickets automatically.'],
      ['Governance', 'PII is annotated in the data catalog and filtered at the MCP layer; access is role-based via Cognito; LLM calls run on Bedrock inside Signature’s AWS with logging off.'],
    ];
    let y = 1.9;
    info.forEach(r => {
      s.addText([
        { text: r[0] + ' — ', options: { bold: true, color: INK } },
        { text: r[1], options: { color: BODY } },
      ], { x: MX, y, w: CW, h: 0.62, margin: 0, fontFace: SANS, fontSize: 12 });
      y += 0.72;
    });
    const eps = [
      ['Data quality', 'toggle-analytics-api-dq-non-prod-…​.api.signature.dev.sqrl.live', '/v1/graphql   ·   /v1/mcp'],
      ['Storybook analytics', 'toggle-analytics-api-sb-non-prod-…​.api.signature.dev.sqrl.live', '/v1/graphql   ·   /v1/mcp'],
      ['Revenue', 'prod-toggle-revenue-apis-…​.api.signature.dev.sqrl.live', '/v1/graphql   ·   /v1/mcp'],
    ];
    const th = [
      { text: 'Data product', options: { bold: true, color: 'FFFFFF', fontFace: SANS, fontSize: 11, fill: { color: NAVY }, valign: 'middle' } },
      { text: 'Endpoint host (non-prod)', options: { bold: true, color: 'FFFFFF', fontFace: SANS, fontSize: 11, fill: { color: NAVY }, valign: 'middle' } },
      { text: 'Interfaces', options: { bold: true, color: 'FFFFFF', fontFace: SANS, fontSize: 11, fill: { color: NAVY }, valign: 'middle' } },
    ];
    const tr = [th];
    eps.forEach((e, i) => {
      const fill = i % 2 ? 'F1F3F8' : 'FFFFFF';
      tr.push([
        { text: e[0], options: { bold: true, color: INK, fontFace: SANS, fontSize: 11, fill: { color: fill }, valign: 'middle' } },
        { text: e[1], options: { color: BODY, fontFace: 'Courier New', fontSize: 9.5, fill: { color: fill }, valign: 'middle' } },
        { text: e[2], options: { color: TEALD, bold: true, fontFace: 'Courier New', fontSize: 9.5, fill: { color: fill }, valign: 'middle' } },
      ]);
    });
    s.addTable(tr, { x: MX, y: 4.3, w: CW, colW: [2.2, 5.3, 2.4], border: { type: 'solid', color: LINE, pt: 0.75 }, margin: 0.09, rowH: [0.4, 0.55, 0.55, 0.55] });
    s.addText('Full URLs are in the credentials email; hosts abbreviated here for readability. Endpoint consolidation to a single host is on the optimization list.', {
      x: MX, y: 6.7, w: CW, h: 0.4, margin: 0, fontFace: SANS, fontSize: 10.5, italic: true, color: MUTED,
    });
    s.addNotes('Reference slide for the tech-curious — no need to present it. Hosts are abbreviated; the credentials email carries the exact links.');
  }

  await pres.writeFile({ fileName: '/tmp/claude-0/-home-user-website/dc1964c4-622e-5fee-ad64-79d8677e8cdc/scratchpad/SigCompass-Board-Walkthrough-2026-08.pptx' });
  console.log('WROTE deck with', pageNo, 'slides');
}

main().catch(e => { console.error(e); process.exit(1); });
