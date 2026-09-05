// Text normalization and matching shared by the practice page (browser) and the build/verification step (node).
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KeynoteText = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var UNITS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
  var TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
  var SCALES = { hundred: 100, thousand: 1000, million: 1000000, billion: 1000000000 };
  var ALIASES = {
    jay: 'j', barbecue: 'bbq', barbeque: 'bbq', doctor: 'dr', mister: 'mr', okay: 'ok',
    mica: 'micah', mika: 'micah', mikah: 'micah', myka: 'micah', micha: 'micah', barry: 'berry', berrys: 'berrys',
    twenties: '20s', thirties: '30s', forties: '40s', fifties: '50s', sixties: '60s', seventies: '70s', eighties: '80s', nineties: '90s',
    fourty: 'forty'
  };
  var FILLERS = { um: 1, uh: 1, umm: 1, uhh: 1, hmm: 1, mm: 1, er: 1, ah: 1, uhm: 1 };
  var STOP = {};
  ('a an the and or but so if then than that this these those there here it its i me my we our us you your he him his she her they them their ' +
   'is am are was were be been being do does did done have has had having will would can could should may might must shall ' +
   'of in on at to for from by with about into onto over under up down out off as through between after before again ' +
   'not no nor yes very really just also too even still only ever never always often sometimes somewhere else ' +
   'what which who whom whose when where why how all any both each few more most much some such own same other another ' +
   'because while until since though although whether like kind kinda sort get got gets getting go goes going went gone ' +
   'one thing things something someone somebody anything everything everyone everybody nothing nobody way ways well let lets ' +
   'now today back right little lot lots part parts bit make makes made making take takes took taking put say says said saying ' +
   'know knew think thought see saw seen come came coming want wanted look looked looking around theyre were dont im ive youre ' +
   'thats whats isnt wasnt arent werent didnt doesnt cant couldnt wont wouldnt shouldnt hasnt havent hadnt aint').split(/\s+/).forEach(function (w) { STOP[w] = 1; });

  function isDigits(w) { return /^\d+$/.test(w); }
  function isNumWord(w) { return (w in UNITS) || (w in TENS) || (w in SCALES); }

  function basicTokens(text) {
    var s = text.toLowerCase();
    s = s.replace(/[’‘`]/g, "'").replace(/[“”]/g, '"');
    s = s.replace(/c\+\+/g, ' c plus plus ');
    s = s.replace(/&/g, ' and ');
    s = s.replace(/%/g, ' percent ');
    s = s.replace(/(\d),(\d{3})/g, '$1$2').replace(/(\d),(\d{3})/g, '$1$2');
    s = s.replace(/\$\s*(\d[\d.]*)\s*(million|billion|thousand|m|b|k)\b/g, function (m, n, sc) {
      var full = { m: 'million', b: 'billion', k: 'thousand' }[sc] || sc; return n + ' ' + full + ' dollars';
    });
    s = s.replace(/\$\s*(\d[\d.]*)/g, '$1 dollars');
    s = s.replace(/#\s*(\d+)/g, 'number $1');
    s = s.replace(/(\d)\.(\d)/g, '$1 point $2');
    s = s.replace(/(\d)\s*(am|pm)\b/g, '$1 $2');
    s = s.replace(/\b([ap])\.m\b\.?/g, '$1m');
    s = s.replace(/\ba\.i\b\.?/g, 'ai');
    s = s.replace(/[—–\-]+/g, ' ');
    s = s.replace(/…/g, ' ');
    s = s.replace(/[^a-z0-9'\s]/g, ' ');
    s = s.replace(/'/g, '');
    return s.split(/\s+/).filter(Boolean).map(function (w) { return ALIASES[w] || w; });
  }

  // Merge spoken number words into digits so "twenty seven" == "27", "a hundred and twenty" == "120",
  // "nineteen fifty" == "1950", "twenty million" == "20 million". Tokens are {t, src}.
  function mergeNumbers(tokens) {
    var out = [], i = 0;
    while (i < tokens.length) {
      var w = tokens[i].t, run = [];
      var nextT = i + 1 < tokens.length ? tokens[i + 1].t : '';
      if (w === 'a' && (nextT in SCALES)) { run.push({ t: 'one', src: tokens[i].src }); i++; }
      else if (isDigits(w) && (nextT in SCALES) && nextT !== 'hundred') { run.push(tokens[i]); i++; }
      else if (!isNumWord(w)) { out.push(tokens[i]); i++; continue; }
      var andSrc = [];
      while (i < tokens.length) {
        var x = tokens[i].t;
        if (isNumWord(x)) { run.push(tokens[i]); i++; continue; }
        if (x === 'and' && run.length && (run[run.length - 1].t in SCALES) && i + 1 < tokens.length &&
            ((tokens[i + 1].t in UNITS) || (tokens[i + 1].t in TENS))) { andSrc = andSrc.concat(tokens[i].src); i++; continue; }
        break;
      }
      var res = numberRun(run);
      if (andSrc.length && res.length) res[res.length - 1].src = res[res.length - 1].src.concat(andSrc);
      // "eighteen" + "90s" -> "1890s"
      if (res.length === 1 && /^\d\d$/.test(res[0].t) && i < tokens.length && /^\d\ds$/.test(tokens[i].t)) {
        res[0] = { t: res[0].t + tokens[i].t, src: res[0].src.concat(tokens[i].src) }; i++;
      }
      out.push.apply(out, res);
    }
    return out;
  }
  function unionSrc(run) { var s = []; run.forEach(function (r) { r.src.forEach(function (v) { if (s.indexOf(v) < 0) s.push(v); }); }); return s; }
  function numberRun(run) {
    var words = run.map(function (r) { return r.t; });
    var hasScale = words.some(function (w) { return w in SCALES; });
    var src = unionSrc(run);
    if (!hasScale) {
      var groups = [], open = false;
      words.forEach(function (w) {
        if (w in TENS) { groups.push(TENS[w]); open = true; }
        else if (UNITS[w] !== undefined) {
          if (open && UNITS[w] > 0 && UNITS[w] < 10) { groups[groups.length - 1] += UNITS[w]; open = false; }
          else { groups.push(UNITS[w]); open = false; }
        } else if (isDigits(w)) { groups.push(parseInt(w, 10)); open = false; }
      });
      if (groups.length === 2 && groups[0] >= 10 && groups[0] <= 99 && groups[1] >= 10 && groups[1] <= 99) {
        return [{ t: String(groups[0] * 100 + groups[1]), src: src }];
      }
      return groups.map(function (g) { return { t: String(g), src: src }; });
    }
    var total = 0, cur = 0;
    words.forEach(function (w) {
      if (UNITS[w] !== undefined) cur += UNITS[w];
      else if (w in TENS) cur += TENS[w];
      else if (isDigits(w)) cur += parseInt(w, 10);
      else if (w === 'hundred') cur = (cur || 1) * 100;
      else { total += (cur || 1) * SCALES[w]; cur = 0; }
    });
    total += cur;
    if (total >= 1e9 && total % 1e9 === 0) return [{ t: String(total / 1e9), src: src }, { t: 'billion', src: src }];
    if (total >= 1e6 && total % 1e6 === 0) return [{ t: String(total / 1e6), src: src }, { t: 'million', src: src }];
    return [{ t: String(total), src: src }];
  }

  // Spoken text -> normalized tokens (fillers dropped, numbers merged).
  function prepareSpoken(text) {
    var toks = basicTokens(text).filter(function (w) { return !FILLERS[w]; }).map(function (t) { return { t: t, src: [] }; });
    return mergeNumbers(toks).map(function (x) { return x.t; });
  }

  function lev(a, b) {
    var m = a.length, n = b.length, prev = [], cur = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      for (j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur.slice();
    }
    return prev[n];
  }

  // Light stemmer so "students"/"student", "created"/"creating" compare equal. Applied to both sides.
  function stem(w) {
    if (isDigits(w) || w.length < 4) return w;
    var x = w;
    if (x.length > 4 && /ies$/.test(x)) x = x.slice(0, -3) + 'y';
    else if (x.length > 5 && /ing$/.test(x)) x = undouble(x.slice(0, -3));
    else if (x.length > 4 && /ed$/.test(x)) x = undouble(x.slice(0, -2));
    else if (x.length > 5 && /ly$/.test(x)) x = x.slice(0, -2);
    else if (x.length > 3 && /s$/.test(x) && !/(ss|us|is)$/.test(x)) x = x.slice(0, -1);
    if (x.length > 4 && /e$/.test(x)) x = x.slice(0, -1);
    return x;
  }
  function undouble(x) { return /([^aeiou])\1$/.test(x) && !/(ll|ss|ff|zz)$/.test(x) ? x.slice(0, -1) : x; }

  // Exact stem match, or a one-letter slip between two stems of 6+ letters sharing a first letter
  // (five-letter words stay exact: think/thank, worse/words, house/horse are different words).
  function stemsMatch(a, b) {
    if (a === b) return true;
    if (a.length < 6 || b.length < 6 || isDigits(a) || isDigits(b) || a[0] !== b[0]) return false;
    return lev(a, b) <= 1;
  }
  function spokenBag(text) {
    var toks = prepareSpoken(text).map(stem);
    var set = {}; toks.forEach(function (t) { set[t] = 1; });
    return { list: toks, set: set };
  }
  function bagHas(bag, st) {
    if (bag.set[st]) return true;
    for (var i = 0; i < bag.list.length; i++) if (stemsMatch(st, bag.list[i])) return true;
    return false;
  }
  // A key phrase matches when its stems appear in order, contiguously, in the spoken bag.
  function phraseIn(bag, phrase) {
    var ph = prepareSpoken(phrase).map(stem);
    if (!ph.length) return false;
    outer: for (var i = 0; i + ph.length <= bag.list.length; i++) {
      for (var k = 0; k < ph.length; k++) if (!stemsMatch(ph[k], bag.list[i + k])) continue outer;
      return true;
    }
    return false;
  }

  return { UNITS: UNITS, TENS: TENS, SCALES: SCALES, STOP: STOP, FILLERS: FILLERS, isDigits: isDigits, basicTokens: basicTokens,
    mergeNumbers: mergeNumbers, prepareSpoken: prepareSpoken, lev: lev, stem: stem, stemsMatch: stemsMatch, spokenBag: spokenBag,
    bagHas: bagHas, phraseIn: phraseIn };
});
