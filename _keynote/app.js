(function () {
  'use strict';
  var DATA = window.KEYNOTE;
  var T = window.KeynoteText;
  var STOP = T.STOP, isDigits = T.isDigits, basicTokens = T.basicTokens, mergeNumbers = T.mergeNumbers, prepareSpoken = T.prepareSpoken,
      lev = T.lev, stem = T.stem, stemsMatch = T.stemsMatch, spokenBag = T.spokenBag, bagHas = T.bagHas, phraseIn = T.phraseIn;
  var sections = DATA.sections;
  var cards = DATA.cards;
  var STORE_KEY = 'keynote-practice-v1';

  // ---------- persistence ----------
  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      s.attempts = s.attempts || {};
      s.settings = Object.assign({ hide: false, drill: false, target: 90, mode: 'ideas' }, s.settings || {});
      if (s.settings.mode !== 'words' && s.settings.mode !== 'ideas') s.settings.mode = 'ideas';
      s.pos = Math.min(Math.max(s.pos | 0, 0), cards.length - 1);
      return s;
    } catch (e) { return { attempts: {}, settings: { hide: false, drill: false, target: 90, mode: 'ideas' }, pos: 0 }; }
  }
  function saveState() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {} }
  var state = loadState();
  var idx = state.pos;

  // Reference card -> display segments + normalized tokens (each token remembers its display word indexes)
  function prepareCard(card) {
    var display = []; // {text, note, para, sp}
    var tokens = [];
    card.paragraphs.forEach(function (p, pi) {
      var parts = p.split(/(\[[^\]]*\])/);
      parts.forEach(function (part) {
        if (!part) return;
        if (/^\[[^\]]*\]$/.test(part)) { display.push({ text: part, note: true, para: pi }); return; }
        part.split(/\s+/).forEach(function (word) {
          if (!word) return;
          var di = display.length;
          display.push({ text: word, note: false, para: pi });
          basicTokens(word).forEach(function (t) { tokens.push({ t: t, src: [di] }); });
        });
      });
    });
    return { display: display, tokens: mergeNumbers(tokens) };
  }
  // ---------- ideas mode: sentence beats + key-word coverage ----------
  var ABBREV = /^(dr|mr|mrs|ms|st|vs|jr|sr|[a-z])$/i;
  function splitSentences(paragraph) {
    var words = paragraph.replace(/\[[^\]]*\]/g, ' ').split(/\s+/).filter(Boolean);
    var out = [], buf = [];
    words.forEach(function (w, i) {
      buf.push(w);
      var core = w.replace(/[“”"’')\]]+$/, '');
      if (/[.?!]$/.test(core)) {
        var bare = core.replace(/[.?!]+$/, '').replace(/^[“"‘'(]+/, '');
        var next = words[i + 1];
        var abbrev = ABBREV.test(bare) && next && /^[A-Z0-9]/.test(next);
        if (!abbrev) { out.push(buf.join(' ')); buf = []; }
      }
    });
    if (buf.length) out.push(buf.join(' '));
    return out;
  }
  // Content words of a sentence: normalized, numbers merged, stopwords dropped, stemmed. Keeps the display word.
  function contentWords(sentence) {
    var toks = mergeNumbers(sentence.split(/\s+/).filter(Boolean).map(function (w, i) {
      return basicTokens(w).map(function (t) { return { t: t, src: [i] }; });
    }).reduce(function (acc, arr) { return acc.concat(arr); }, []));
    var disp = sentence.split(/\s+/).filter(Boolean);
    var perDisp = {}; toks.forEach(function (tok) { tok.src.forEach(function (i) { perDisp[i] = (perDisp[i] || 0) + 1; }); });
    var seen = {}, out = [];
    toks.forEach(function (tok) {
      if (STOP[tok.t] || tok.t.length < 2) return;
      var st = stem(tok.t);
      if (seen[st]) return; seen[st] = 1;
      var clean = function (i) { return disp[i].replace(/^[“"‘'(]+|[“”"’'),.;:?!]+$/g, ''); };
      // A number phrase spans several display words; a dash-joined display word yields several tokens.
      var word = tok.src.length > 1 ? tok.src.map(clean).join(' ') : (perDisp[tok.src[0]] > 1 ? tok.t : clean(tok.src[0]));
      out.push({ stem: st, word: word, src: tok.src });
    });
    return out;
  }
  // Auto beats: one per sentence; sentences with fewer than 3 content words are merged with a neighbor.
  function autoBeats(card) {
    if (card.beats && card.beats.length) return card.beats.map(function (b) { return { label: b.label, keys: b.keys, custom: true }; });
    var sents = [];
    card.paragraphs.forEach(function (p) { splitSentences(p).forEach(function (t) { sents.push({ text: t, words: contentWords(t) }); }); });
    var merged = [];
    sents.forEach(function (sn) {
      var prev = merged[merged.length - 1];
      if (prev && prev.words.length < 3) { prev.text += ' ' + sn.text; prev.words = contentWords(prev.text); }
      else merged.push({ text: sn.text, words: sn.words });
    });
    if (merged.length > 1 && merged[merged.length - 1].words.length < 3) {
      var last = merged.pop(); var p2 = merged[merged.length - 1];
      p2.text += ' ' + last.text; p2.words = contentWords(p2.text);
    }
    return merged.map(function (m) { return { label: m.text, words: m.words }; });
  }
  function scoreIdeas(card, spokenText) {
    var beats = autoBeats(card), bag = spokenBag(spokenText);
    var total = 0;
    var rows = beats.map(function (b) {
      var hit = [], missed = [], ratio;
      if (b.custom) {
        b.keys.forEach(function (alts) { (alts.some(function (p) { return phraseIn(bag, p); }) ? hit : missed).push(alts[0]); });
        ratio = b.keys.length ? hit.length / b.keys.length : 1;
      } else {
        b.words.forEach(function (w) { (bagHas(bag, w.stem) ? hit : missed).push(w.word); });
        ratio = b.words.length ? hit.length / b.words.length : 1;
      }
      var status = ratio >= 0.5 ? 'hit' : (hit.length && ratio >= 0.25) ? 'part' : 'miss';
      total += status === 'hit' ? 1 : status === 'part' ? 0.5 : 0;
      return { label: b.label, status: status, hit: hit, missed: missed, custom: !!b.custom, words: b.words };
    });
    var score = rows.length ? Math.round(100 * total / rows.length) : 100;
    return { rows: rows, score: score, covered: rows.filter(function (r) { return r.status === 'hit'; }).length, partial: rows.filter(function (r) { return r.status === 'part'; }).length, n: rows.length };
  }

  // ---------- alignment / scoring ----------
  function wordsEqual(a, b) {
    if (a === b) return 0;
    if (isDigits(a) || isDigits(b)) return -1;
    var L = Math.min(a.length, b.length);
    if (L >= 9 && lev(a, b) <= 2) return 1;
    if (L >= 4 && lev(a, b) <= 1) return 1;
    return -1;
  }
  function align(ref, hyp) {
    var n = ref.length, m = hyp.length, i, j;
    var dp = [], bt = [];
    for (i = 0; i <= n; i++) { dp.push(new Int32Array(m + 1)); bt.push(new Uint8Array(m + 1)); }
    for (i = 1; i <= n; i++) { dp[i][0] = i; bt[i][0] = 2; }
    for (j = 1; j <= m; j++) { dp[0][j] = j; bt[0][j] = 3; }
    // ops: 0 match, 4 close match, 1 substitution, 2 deletion (card word skipped), 3 insertion (extra spoken word).
    // On equal cost prefer deletion, then match, then substitution, then insertion: this anchors a partial or
    // truncated recitation to the earliest matching stretch of the card instead of drifting to a later repeat.
    for (i = 1; i <= n; i++) for (j = 1; j <= m; j++) {
      var eq = wordsEqual(ref[i - 1], hyp[j - 1]);
      var diag = dp[i - 1][j - 1] + (eq >= 0 ? 0 : 1), del = dp[i - 1][j] + 1, ins = dp[i][j - 1] + 1;
      var best = del, op = 2;
      if (eq >= 0 && diag <= best) { best = diag; op = eq === 0 ? 0 : 4; }
      else if (eq < 0 && diag < best) { best = diag; op = 1; }
      if (ins < best) { best = ins; op = 3; }
      dp[i][j] = best; bt[i][j] = op;
    }
    var status = new Array(n), heard = new Array(n), extras = [];
    i = n; j = m;
    while (i > 0 || j > 0) {
      var op = bt[i][j];
      if (i > 0 && j > 0 && (op === 0 || op === 4 || op === 1)) {
        status[i - 1] = op === 0 ? 'ok' : op === 4 ? 'close' : 'sub'; heard[i - 1] = hyp[j - 1]; i--; j--;
      } else if (i > 0 && (j === 0 || op === 2)) { status[i - 1] = 'miss'; i--; }
      else { extras.push({ word: hyp[j - 1], at: i }); j--; }
    }
    extras.reverse();
    var c = { ok: 0, close: 0, sub: 0, miss: 0 };
    status.forEach(function (s) { c[s]++; });
    var errors = c.sub + c.miss + extras.length;
    var score = n ? Math.max(0, Math.round(100 * (1 - errors / n))) : 100;
    return { status: status, heard: heard, extras: extras, counts: c, score: score, n: n, spoken: m };
  }

  // ---------- helpers ----------
  function $(id) { return document.getElementById(id); }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tier(score) { return score >= state.settings.target ? 'good' : score >= state.settings.target - 15 ? 'mid' : 'low'; }
  function gradeLabel(score) {
    if (score >= 98) return 'Word perfect';
    if (score >= 95) return 'Nailed it';
    if (score >= 90) return 'Nearly there';
    if (score >= 80) return 'Getting close';
    if (score >= 65) return 'Keep drilling';
    return 'Rough draft';
  }
  function attempt(id) { return state.attempts[id]; }
  function modeIdeas() { return state.settings.mode === 'ideas'; }
  function bestOf(a) { if (!a) return undefined; return modeIdeas() ? a.bestIdeas : a.best; }
  function isWeak(card) { var b = bestOf(attempt(card.id)); return b === undefined || b < state.settings.target; }
  function modeName() { return modeIdeas() ? 'ideas' : 'exact words'; }
  function weakIds() { return cards.filter(isWeak).map(function (c) { return c.id; }); }
  function cue(card) {
    if (card.title) return card.title;
    var words = card.paragraphs.join(' ').replace(/\[[^\]]*\]/g, ' ').split(/\s+/).filter(Boolean);
    return words.slice(0, 11).join(' ') + (words.length > 11 ? ' …' : '');
  }
  var toastT;
  function toast(msg) { var t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2200); }
  function fmtTime(ms) { var s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  // ---------- rendering: legend, map, card ----------
  function renderLegend() {
    var el = $('legend'); el.innerHTML = '';
    sections.forEach(function (s, si) {
      var done = cards.filter(function (c) { return c.section === si && !isWeak(c); }).length;
      var b = document.createElement('button');
      b.className = 'chip' + (cards[idx].section === si ? ' current' : '');
      b.style.setProperty('--c', s.color);
      b.innerHTML = '<span class="dot"></span><b>' + esc(s.short) + '</b> <span>' + done + '/' + s.cards + '</span>';
      b.title = s.title;
      b.onclick = function () { go(cards.findIndex(function (c) { return c.section === si; })); };
      el.appendChild(b);
    });
  }
  function renderMap() {
    var el = $('sectionMap'); el.innerHTML = '';
    cards.forEach(function (c, i) {
      var a = attempt(c.id), bs = bestOf(a);
      var b = document.createElement('button');
      b.className = 'seg' + (i === idx ? ' current' : '') + (bs !== undefined ? (bs >= state.settings.target ? ' mastered' : ' tried') : '');
      b.style.setProperty('--seg', sections[c.section].color);
      b.title = 'Card ' + c.id + (bs !== undefined ? ' · best ' + bs + '% (' + modeName() + ')' : ' · not yet attempted');
      b.onclick = function () { go(i); };
      el.appendChild(b);
    });
    var mastered = cards.length - weakIds().length;
    $('deckStat').textContent = mastered + ' of ' + cards.length + ' cards at target · ' + modeName();
  }
  function renderCardBody(card, graded) {
    var prep = prepareCard(card);
    var paras = card.paragraphs.map(function () { return []; });
    var wordStatus = null;
    if (graded) {
      wordStatus = {};
      prep.tokens.forEach(function (tok, ti) {
        var st = graded.status[ti];
        tok.src.forEach(function (di) {
          var cur = wordStatus[di] || { rank: 0, st: 'ok', heard: [] };
          var rank = st === 'miss' ? 4 : st === 'sub' ? 3 : st === 'close' ? 2 : 1;
          if (rank > cur.rank) { cur.rank = rank; cur.st = st; }
          if (st === 'sub' && graded.heard[ti]) cur.heard.push(graded.heard[ti]);
          wordStatus[di] = cur;
        });
      });
    }
    prep.display.forEach(function (d, di) {
      if (d.note) { paras[d.para].push('<span class="note">' + esc(d.text) + '</span>'); return; }
      if (!graded) { paras[d.para].push(esc(d.text)); return; }
      var ws = wordStatus[di];
      if (!ws) { paras[d.para].push('<span class="w">' + esc(d.text) + '</span>'); return; }
      var title = ws.st === 'sub' ? ' title="heard: ' + esc(ws.heard.join(' ')) + '"' : ws.st === 'miss' ? ' title="not heard"' : ws.st === 'close' ? ' title="close enough"' : '';
      paras[d.para].push('<span class="w ' + ws.st + '"' + title + '>' + esc(d.text) + '</span>');
    });
    return paras.map(function (p) { return '<p>' + p.join(' ') + '</p>'; }).join('');
  }
  function updateStatus() {
    var card = cards[idx], sec = sections[card.section];
    var el = $('cbStatus');
    if (recording) {
      var said = (committed + sessionFinal + ' ' + interim).trim().split(/\s+/).filter(Boolean);
      el.innerHTML = '<span class="live-dot"></span>' + esc(fmtTime(Date.now() - startedAt)) + (said.length ? ' · …' + esc(said.slice(-9).join(' ')) : ' · listening');
    } else {
      el.textContent = 'Card ' + card.id + ' of ' + cards.length + ' · ' + sec.short + (card.title ? ' · ' + card.title : '');
    }
  }
  function renderCard() {
    var card = cards[idx], sec = sections[card.section];
    var el = $('card');
    el.style.setProperty('--c', sec.color);
    $('cardSection').textContent = sec.short;
    var scene = $('cardScene');
    if (card.title) { scene.textContent = card.title; scene.hidden = false; } else scene.hidden = true;
    updateStatus();
    var inSec = cards.filter(function (c) { return c.section === card.section; });
    var posInSec = inSec.indexOf(card) + 1;
    $('cardPos').textContent = 'Card ' + card.id + ' of ' + cards.length + ' · ' + posInSec + '/' + inSec.length + ' in section · ' + card.words + ' words';
    renderBest(card);
    var title = $('cardTitle');
    if (posInSec === 1) { title.textContent = sec.title; title.hidden = false; } else { title.hidden = true; }
    $('cardBody').innerHTML = renderCardBody(card, null);
    $('cardBody').classList.remove('blur'); $('hiddenNote').hidden = true;
    $('resultPanel').hidden = true; $('livePanel').hidden = true;
    $('prevBtn').disabled = neighbor(-1) === null;
    $('nextBtn').disabled = neighbor(1) === null;
    state.pos = idx; saveState();
    renderLegend(); renderMap();
    document.title = 'Card ' + card.id + ' · Keynote Note Cards';
  }
  function renderBest(card) {
    var a = attempt(card.id), best = $('cardBest'), bs = bestOf(a);
    best.className = 'best' + (bs !== undefined ? ' ' + tier(bs) : '');
    if (!a) { best.textContent = 'Not attempted'; return; }
    var parts = [];
    if (a.bestIdeas !== undefined) parts.push('ideas ' + a.bestIdeas + '%');
    parts.push('words ' + a.best + '%');
    if (modeIdeas() && a.bestIdeas === undefined) parts.unshift('ideas —');
    best.textContent = 'Best: ' + parts.join(' · ') + ' · ' + a.count + (a.count === 1 ? ' try' : ' tries');
  }
  function neighbor(dir) {
    if (!state.settings.drill) { var j = idx + dir; return j >= 0 && j < cards.length ? j : null; }
    for (var k = idx + dir; k >= 0 && k < cards.length; k += dir) if (isWeak(cards[k])) return k;
    return null;
  }
  function go(i) {
    if (recording) cancelRecording();
    if (i === null || i < 0 || i >= cards.length) return;
    idx = i; showView('cards'); renderCard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- speech recognition ----------
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = null, recording = false, finalizing = false, committed = '', sessionFinal = '', interim = '';
  var startedAt = 0, timerId = null, finalizeTimer = null, peeking = false;

  function renderLive() {
    var el = $('liveText');
    el.innerHTML = esc((committed + sessionFinal).trim()) + (interim ? ' <span class="interim">' + esc(interim) + '</span>' : '');
    updateStatus();
  }
  function newRecognizer() {
    var r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = 'en-US'; r.maxAlternatives = 1;
    r.onresult = function (e) {
      sessionFinal = ''; interim = '';
      for (var i = 0; i < e.results.length; i++) {
        var t = e.results[i][0].transcript;
        if (e.results[i].isFinal) sessionFinal += t + ' '; else interim += t;
      }
      renderLive();
    };
    r.onerror = function (e) {
      var msg = $('liveMsg');
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        msg.textContent = 'Microphone access was blocked. Allow the microphone for this site and try again.'; msg.hidden = false; recording = false; stopTimer(); setRecUI(false);
      } else if (e.error === 'audio-capture') {
        msg.textContent = 'No microphone was found.'; msg.hidden = false; recording = false; stopTimer(); setRecUI(false);
      } else if (e.error === 'network') {
        msg.textContent = 'The speech service could not be reached (network). Check your connection and try again.'; msg.hidden = false;
      }
    };
    r.onend = function () {
      committed += sessionFinal; sessionFinal = ''; interim = '';
      if (recording) { try { recognition = newRecognizer(); recognition.start(); } catch (err) {} }
      else if (finalizing) finishGrading();
    };
    return r;
  }
  function setRecUI(on) {
    var b = $('recBtn'); b.classList.toggle('on', on); $('recLabel').textContent = on ? 'Stop & grade' : 'Record';
  }
  function startTimer() { startedAt = Date.now(); $('liveTime').textContent = '0:00'; timerId = setInterval(function () { $('liveTime').textContent = fmtTime(Date.now() - startedAt); updateStatus(); }, 500); }
  function stopTimer() { clearInterval(timerId); timerId = null; updateStatus(); }
  function startRecording() {
    if (!SR) { $('fallbackPanel').hidden = false; $('fallbackText').focus(); return; }
    committed = ''; sessionFinal = ''; interim = ''; finalizing = false; peeking = false;
    $('liveMsg').hidden = true; $('liveText').innerHTML = ''; $('resultPanel').hidden = true; $('livePanel').hidden = false;
    if (state.settings.hide) { $('cardBody').classList.add('blur'); $('hiddenNote').hidden = false; }
    try { recognition = newRecognizer(); recognition.start(); }
    catch (e) { $('liveMsg').textContent = 'Could not start the microphone: ' + e.message; $('liveMsg').hidden = false; return; }
    recording = true; setRecUI(true); startTimer(); updateStatus();
  }
  function stopRecording() {
    if (!recording) return;
    recording = false; finalizing = true; stopTimer(); setRecUI(false);
    try { recognition.stop(); } catch (e) {}
    finalizeTimer = setTimeout(function () { if (finalizing) finishGrading(); }, 1800);
  }
  function cancelRecording() {
    recording = false; finalizing = false; stopTimer(); setRecUI(false);
    clearTimeout(finalizeTimer);
    try { recognition && recognition.abort(); } catch (e) {}
    $('livePanel').hidden = true; $('cardBody').classList.remove('blur'); $('hiddenNote').hidden = true;
  }
  function finishGrading() {
    if (!finalizing) return;
    finalizing = false; clearTimeout(finalizeTimer);
    var elapsed = Date.now() - startedAt;
    grade((committed + sessionFinal + ' ' + interim).trim(), elapsed);
  }

  // ---------- grading ----------
  function grade(spokenText, elapsedMs) {
    var card = cards[idx];
    var prep = prepareCard(card);
    var ref = prep.tokens.map(function (t) { return t.t; });
    var hyp = prepareSpoken(spokenText);
    var res = align(ref, hyp);
    var ideas = scoreIdeas(card, spokenText);

    var a = state.attempts[card.id] || { best: 0, last: 0, count: 0 };
    a.count++; a.last = res.score; a.best = Math.max(a.best, res.score); a.at = Date.now();
    a.lastIdeas = ideas.score; a.bestIdeas = Math.max(a.bestIdeas === undefined ? 0 : a.bestIdeas, ideas.score);
    state.attempts[card.id] = a; saveState();
    var primary = modeIdeas() ? ideas.score : res.score, T = state.settings.target;

    $('livePanel').hidden = true; $('cardBody').classList.remove('blur'); $('hiddenNote').hidden = true;
    $('cardBody').innerHTML = renderCardBody(card, res);
    var ring = $('ring'); ring.style.setProperty('--p', primary);
    ring.style.setProperty('--rc', primary >= T ? 'var(--ok)' : primary >= T - 15 ? 'var(--close)' : 'var(--bad)');
    $('scoreNum').textContent = primary;
    var wpm = elapsedMs && elapsedMs > 3000 ? Math.round(res.spoken / (elapsedMs / 60000)) : 0;
    if (modeIdeas()) {
      $('scoreTitle').textContent = ideas.covered + ' of ' + ideas.n + ' ideas covered' + (ideas.partial ? ', ' + ideas.partial + ' partly' : '') + (primary >= T ? ' ✓' : '');
      $('scoreSub').textContent = (primary >= T ? 'At or above your ' + T + '% target. ' : 'Target is ' + T + '%. ') +
        'Best ideas score on this card: ' + a.bestIdeas + '% after ' + a.count + (a.count === 1 ? ' try.' : ' tries.') + (wpm ? ' Pace: ' + wpm + ' words/min.' : '');
      $('altScore').innerHTML = 'Exact words: <b>' + res.score + '%</b> · ' + gradeLabel(res.score);
    } else {
      $('scoreTitle').textContent = gradeLabel(res.score) + (primary >= T ? ' ✓' : '');
      $('scoreSub').textContent = (primary >= T ? 'At or above your ' + T + '% target. ' : 'Target is ' + T + '%. ') +
        'Best on this card: ' + a.best + '% after ' + a.count + (a.count === 1 ? ' try.' : ' tries.') + (wpm ? ' Pace: ' + wpm + ' words/min.' : '');
      $('altScore').innerHTML = 'Ideas: <b>' + ideas.score + '%</b> · ' + ideas.covered + ' of ' + ideas.n + ' covered';
    }
    renderBeats(ideas);
    showDetail(modeIdeas() ? 'ideas' : 'words');
    var c = res.counts;
    $('scoreStats').innerHTML =
      '<span><b>' + res.n + '</b> words on card</span>' +
      '<span><span class="k" style="background:var(--ok)"></span><b>' + c.ok + '</b> exact</span>' +
      '<span><span class="k" style="background:var(--close)"></span><b>' + c.close + '</b> close</span>' +
      '<span><span class="k" style="background:var(--bad)"></span><b>' + c.sub + '</b> wrong word</span>' +
      '<span><span class="k" style="background:var(--bad);opacity:.6"></span><b>' + c.miss + '</b> skipped</span>' +
      '<span><b>' + res.extras.length + '</b> extra</span>';
    $('graded').innerHTML = renderCardBody(card, res);
    var ex = $('extras');
    if (res.extras.length) {
      ex.hidden = false;
      ex.innerHTML = 'Extra words heard that are not on the card: ' + res.extras.map(function (x) { return '<span class="x">' + esc(x.word) + '</span>'; }).join('');
    } else ex.hidden = true;
    $('transcript').textContent = spokenText || '(nothing heard)';
    $('resultPanel').hidden = false;
    $('nextAfterBtn').disabled = neighbor(1) === null;
    renderCard_afterGrade(card, res);
    $('resultPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function renderBeats(ideas) {
    var ul = $('beats'); ul.innerHTML = '';
    ideas.rows.forEach(function (r) {
      var li = document.createElement('li'); li.className = r.status;
      var label;
      if (r.custom) label = esc(r.label);
      else {
        // bold the key words inside the sentence
        var keyWords = {}; r.words.forEach(function (w) { keyWords[w.word.toLowerCase()] = 1; });
        label = r.label.split(/(\s+)/).map(function (piece) {
          var bare = piece.replace(/^[“"‘'(]+|[“”"’'),.;:?!]+$/g, '');
          return keyWords[bare.toLowerCase()] ? esc(piece).replace(esc(bare), '<span class="kw">' + esc(bare) + '</span>') : esc(piece);
        }).join('');
      }
      var mark = r.status === 'hit' ? '✓' : r.status === 'part' ? '~' : '✗';
      var html = '<span class="mark">' + mark + '</span><span>' + label + '</span>';
      if (r.custom) {
        html += '<span class="said">Listens for: ' +
          r.hit.map(function (k) { return '<span class="k hit">' + esc(k) + '</span>'; }).concat(
          r.missed.map(function (k) { return '<span class="k miss">' + esc(k) + '</span>'; })).join(' ') + '</span>';
      } else if (r.status !== 'hit' && r.missed.length) html += '<span class="gap">Not heard: <b>' + r.missed.map(esc).join('</b>, <b>') + '</b></span>';
      li.innerHTML = html; ul.appendChild(li);
    });
  }
  function showDetail(which) {
    $('ideasDetail').hidden = which !== 'ideas'; $('wordsDetail').hidden = which !== 'words';
    $('tabIdeas').classList.toggle('active', which === 'ideas'); $('tabWords').classList.toggle('active', which === 'words');
  }
  function renderCard_afterGrade(card, res) {
    renderBest(card);
    renderLegend(); renderMap();
    if (idx === cards.length - 1 || (state.settings.drill && neighbor(1) === null)) {
      setTimeout(function () { toast('End of the deck — check Progress to see what to repeat.'); }, 600);
    }
  }

  // ---------- progress view ----------
  function renderProgress() {
    var T = state.settings.target;
    var sc = function (c) { var b = bestOf(attempt(c.id)); return b === undefined ? 0 : b; };
    var attempted = cards.filter(function (c) { return bestOf(attempt(c.id)) !== undefined; });
    var mastered = cards.filter(function (c) { return !isWeak(c); });
    var avgAtt = attempted.length ? Math.round(attempted.reduce(function (s, c) { return s + sc(c); }, 0) / attempted.length) : 0;
    var deck = Math.round(cards.reduce(function (s, c) { return s + sc(c); }, 0) / cards.length);
    var tries = cards.reduce(function (s, c) { return s + (attempt(c.id) ? attempt(c.id).count : 0); }, 0);
    $('modeNote').innerHTML = 'Grading by <b>' + modeName() + '</b>. ' + (modeIdeas() ? 'Scores below measure whether each sentence\u2019s key ideas were said, in any wording.' : 'Scores below measure word-for-word accuracy.') + ' Switch modes on the Cards tab.';
    $('summary').innerHTML =
      '<div class="tile"><div class="v">' + deck + '%</div><div class="l">Deck score (unattempted = 0)</div></div>' +
      '<div class="tile"><div class="v">' + mastered.length + '<span style="font-size:16px;color:var(--ink3)">/' + cards.length + '</span></div><div class="l">Cards at ' + T + '% target</div></div>' +
      '<div class="tile"><div class="v">' + attempted.length + '<span style="font-size:16px;color:var(--ink3)">/' + cards.length + '</span></div><div class="l">Cards attempted</div></div>' +
      '<div class="tile"><div class="v">' + avgAtt + '%</div><div class="l">Average best (attempted)</div></div>' +
      '<div class="tile"><div class="v">' + tries + '</div><div class="l">Total recordings</div></div>';

    var rows = $('sectionRows'); rows.innerHTML = '';
    var verdicts = [];
    sections.forEach(function (s, si) {
      var cs = cards.filter(function (c) { return c.section === si; });
      var att = cs.filter(function (c) { return bestOf(attempt(c.id)) !== undefined; });
      var done = cs.filter(function (c) { return !isWeak(c); }).length;
      var avg = Math.round(cs.reduce(function (sum, c) { return sum + sc(c); }, 0) / cs.length);
      var t = avg >= T ? 'good' : avg >= T - 15 ? 'mid' : 'low';
      var verdict;
      if (!att.length) verdict = 'Not started yet.';
      else if (done === cs.length) verdict = 'Every card in this section is at target. Keep it warm with an occasional pass.';
      else if (att.length < cs.length) verdict = (cs.length - att.length) + ' card' + (cs.length - att.length === 1 ? '' : 's') + ' not attempted yet; ' + (att.length - done) + ' attempted but below target.';
      else verdict = (cs.length - done) + ' card' + (cs.length - done === 1 ? '' : 's') + ' still below target — this section needs more repetitions.';
      verdicts.push({ si: si, avg: avg, done: done, total: cs.length });
      var row = document.createElement('div');
      row.className = 'secrow'; row.style.setProperty('--c', s.color);
      row.innerHTML = '<div class="top"><span class="name">' + esc(s.short) + '</span><span style="font-size:13px;color:var(--ink2)">' + done + '/' + cs.length + ' cards at target · ' + s.words + ' words</span><span class="pct ' + t + '">' + avg + '%</span><span class="full">' + esc(s.title) + '</span></div>' +
        '<div class="bar"><i style="width:' + avg + '%"></i></div><div class="minis"></div><div class="verdict">' + verdict + '</div>';
      var minis = row.querySelector('.minis');
      cs.forEach(function (c) {
        var b = bestOf(attempt(c.id));
        var m = document.createElement('button');
        m.className = 'mini' + (b !== undefined ? ' ' + tier(b) : '');
        m.innerHTML = '<b>' + (b !== undefined ? b + '%' : '—') + '</b>#' + c.id;
        m.title = cue(c); m.onclick = function () { go(cards.indexOf(c)); };
        minis.appendChild(m);
      });
      rows.appendChild(row);
    });

    var weak = cards.filter(isWeak).sort(function (a, b) {
      var aa = bestOf(attempt(a.id)), bb = bestOf(attempt(b.id));
      if (aa !== undefined && bb !== undefined) return aa - bb || a.id - b.id;
      if (aa !== undefined) return -1; if (bb !== undefined) return 1; return a.id - b.id;
    });
    var list = $('weakList'); list.innerHTML = '';
    if (!weak.length) {
      list.innerHTML = '<li class="empty" style="cursor:default">Every card is at or above your ' + T + '% target. Raise the target or keep polishing.</li>';
    } else {
      weak.forEach(function (c) {
        var b = bestOf(attempt(c.id));
        var li = document.createElement('li');
        li.style.setProperty('--c', sections[c.section].color);
        li.innerHTML = '<span class="dot"></span><span class="num">#' + c.id + '</span><span class="cue">' + esc(cue(c)) + '</span>' +
          '<span class="sc ' + (b !== undefined ? tier(b) : 'none') + '">' + (b !== undefined ? b + '%' : 'new') + '</span>';
        li.onclick = function () { go(cards.indexOf(c)); };
        list.appendChild(li);
      });
    }
    $('drillBtn').textContent = state.settings.drill ? 'Drilling weak cards (on)' : 'Drill weak cards';
  }

  // ---------- views & events ----------
  function showView(v) {
    $('viewCards').hidden = v !== 'cards'; $('viewProgress').hidden = v !== 'progress'; $('controlbar').hidden = v !== 'cards';
    document.querySelectorAll('.tabs button').forEach(function (b) { var on = b.dataset.view === v; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
    if (v === 'progress') { if (recording) cancelRecording(); renderProgress(); }
  }
  document.querySelectorAll('.tabs button').forEach(function (b) { b.onclick = function () { showView(b.dataset.view); }; });
  $('prevBtn').onclick = function () { go(neighbor(-1)); };
  $('nextBtn').onclick = function () { go(neighbor(1)); };
  $('nextAfterBtn').onclick = function () { go(neighbor(1)); };
  $('againBtn').onclick = function () { renderCard(); startRecording(); };
  $('toProgressBtn').onclick = function () { showView('progress'); window.scrollTo(0, 0); };
  $('recBtn').onclick = function () { recording ? stopRecording() : startRecording(); };
  $('hideToggle').checked = state.settings.hide;
  $('hideToggle').onchange = function () { state.settings.hide = this.checked; saveState(); if (recording) { $('cardBody').classList.toggle('blur', this.checked); $('hiddenNote').hidden = !this.checked; } };
  $('drillToggle').checked = state.settings.drill;
  function setDrill(on) {
    state.settings.drill = on; saveState(); $('drillToggle').checked = on;
    if (on && isWeak(cards[idx]) === false) { var w = weakIds(); if (w.length) idx = cards.findIndex(function (c) { return c.id === w[0]; }); }
    renderCard();
    if (on) toast(weakIds().length ? 'Drilling ' + weakIds().length + ' cards below target' : 'No weak cards — drill mode has nothing to show');
  }
  $('drillToggle').onchange = function () { setDrill(this.checked); };
  $('drillBtn').onclick = function () { setDrill(!state.settings.drill); showView('cards'); window.scrollTo(0, 0); };
  function renderModeToggle() {
    document.querySelectorAll('#modeToggle button').forEach(function (b) { b.classList.toggle('active', b.dataset.mode === state.settings.mode); });
  }
  document.querySelectorAll('#modeToggle button').forEach(function (b) {
    b.onclick = function () {
      state.settings.mode = b.dataset.mode; saveState(); renderModeToggle(); renderCard();
      toast(modeIdeas() ? 'Grading by ideas: key words of each sentence, any order' : 'Grading by exact words');
    };
  });
  renderModeToggle();
  $('tabIdeas').onclick = function () { showDetail('ideas'); };
  $('tabWords').onclick = function () { showDetail('words'); };
  $('targetSel').value = String(state.settings.target);
  $('targetSel').onchange = function () { state.settings.target = parseInt(this.value, 10); saveState(); renderCard(); };
  $('resetBtn').onclick = function () {
    if (confirm('Erase all scores and attempts for every card? This cannot be undone.')) { state.attempts = {}; saveState(); renderProgress(); renderMap(); renderLegend(); toast('Progress reset'); }
  };
  $('fallbackGrade').onclick = function () { var t = $('fallbackText').value.trim(); if (!t) return; $('fallbackPanel').hidden = true; startedAt = 0; grade(t, 0); $('fallbackText').value = ''; };
  function togglePeek() {
    if (!recording || !state.settings.hide) return;
    peeking = !peeking; $('cardBody').classList.toggle('blur', !peeking); $('hiddenNote').hidden = peeking;
  }
  $('card').onclick = function () { togglePeek(); };
  document.addEventListener('keydown', function (e) {
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(neighbor(1)); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(neighbor(-1)); }
    else if (e.key === ' ') { e.preventDefault(); if ($('viewCards').hidden) return; recording ? stopRecording() : startRecording(); }
    else if (e.key === 'h' || e.key === 'H') {
      if (recording) togglePeek();
      else { state.settings.hide = !state.settings.hide; $('hideToggle').checked = state.settings.hide; saveState(); toast(state.settings.hide ? 'Text will hide while recording' : 'Text stays visible while recording'); }
    }
    else if (e.key === 'Escape') { if (recording || finalizing) { cancelRecording(); toast('Recording cancelled'); } }
  });
  window.addEventListener('pagehide', function () { if (recording) cancelRecording(); });
  // Keep Space bound to record/stop even right after a button was clicked.
  document.addEventListener('click', function (e) { var b = e.target && e.target.closest && e.target.closest('button'); if (b) b.blur(); });

  if (!SR) { $('recLabel').textContent = 'Type & grade'; }
  renderCard();

  // exposed for testing
  window.KeynotePractice = { prepareCard: prepareCard, prepareSpoken: prepareSpoken, align: align, basicTokens: basicTokens, scoreIdeas: scoreIdeas, autoBeats: autoBeats, stem: stem, splitSentences: splitSentences };
})();
