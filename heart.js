/* =====================================================================
   Love Heart for a web page (ported from the Python version)

   Add these two lines to Krishna.html, just before </body>:
       <p id="say-line">Wanna say Something to you</p>
       <script src="heart.js"></script>
   ===================================================================== */

// ---------- settings (same as the Python version) ----------
const BG = "#000000";
const BUILD_FROM = "#1c0b0e";   // words start as a dark tone, then warm up
const RED = "#b8243f";
const WHITE = "#f6e6dc";
const ZOOM = 1.5;
const SCALE = 16.5 * ZOOM;          // layout size, in design pixels (the screen is scaled to fit)
const FONT =
  'Arial, "Helvetica Neue", "Apple SD Gothic Neo", "Malgun Gothic", "Hiragino Sans", ' +
  '"Yu Gothic", "PingFang SC", Thonburi, "Kohinoor Devanagari", sans-serif';
const ROW_H = 14 * ZOOM;            // starting row height
const ROW_MIN = 11 * ZOOM;          // rows never get shorter than this
const WORD_GAP = 3 * ZOOM;          // smallest space between two words in a row
const EDGE = 1 * ZOOM;              // how close words may sit to the outline
const SIZE_MIN = Math.round(9 * ZOOM);    // 14
const SIZE_MAX = Math.round(12 * ZOOM);   // 18
const TAIL_WIDTH = 160 * ZOOM;      // narrow rows near the point use the widest words that fit
const TAIL_SIZE_MIN = Math.round(6 * ZOOM);   // 9
const TWINKLE_WORD = "Je t'aime";
const TWINKLE_RATIO = 0.10;         // about one "Je t'aime" in every ten words
const WORD_STEP_MS = 40 / 0.5;      // half speed: one new word every 80 ms
const FADE_MS = 500;                // time for one word to fade in and settle
const TWINKLE_MS = 700;             // time for one "Je t'aime" sparkle
const TWINKLE_COOLDOWN_MS = [150, 600];   // random pause between sparkles

const PHRASES = [
  "Seni seviyorum", "Te amo", "Je t'aime",
  "Ich liebe dich", "Ti amo", "Eu te amo", "Я тебя люблю",
  "사랑해", "愛してる", "我爱你",
  "Σ' αγαπώ", "Ik hou van jou", "Jag älskar dig", "Kocham cię",
  "ฉันรักเธอ", "Anh yêu em", "Aku cinta kamu", "Я тебе кохаю",
];
const WORD_POOL = PHRASES.filter((p) => p !== TWINKLE_WORD);

// Outline of the heart, traced from the reference image (width 32 units, centred on (0, 0), y up)
const HEART_OUTLINE = [
  [-8.04, 14.61], [-8.43, 14.50], [-8.84, 14.46], [-9.23, 14.34], [-9.63, 14.26], [-10.01, 14.13], [-10.40, 13.98], [-10.77, 13.83],
  [-11.15, 13.66], [-11.51, 13.47], [-11.87, 13.28], [-12.21, 13.05], [-12.55, 12.82], [-12.86, 12.56], [-13.19, 12.31], [-13.49, 12.03],
  [-13.76, 11.73], [-14.01, 11.41], [-14.28, 11.09], [-14.51, 10.75], [-14.74, 10.41], [-14.94, 10.06], [-15.12, 9.69], [-15.29, 9.32],
  [-15.44, 8.94], [-15.58, 8.56], [-15.71, 8.17], [-15.77, 7.77], [-15.90, 7.38], [-15.92, 6.97], [-15.95, 6.56], [-16.00, 6.15],
  [-16.00, 5.74], [-15.97, 5.34], [-15.92, 4.93], [-15.92, 4.52], [-15.82, 4.12], [-15.75, 3.72], [-15.63, 3.33], [-15.52, 2.94],
  [-15.39, 2.55], [-15.22, 2.18], [-15.05, 1.81], [-14.86, 1.44], [-14.66, 1.09], [-14.45, 0.74], [-14.22, 0.39], [-13.99, 0.06],
  [-13.74, -0.26], [-13.48, -0.58], [-13.24, -0.91], [-12.96, -1.21], [-12.67, -1.50], [-12.38, -1.79], [-12.09, -2.08], [-11.80, -2.37],
  [-11.51, -2.66], [-11.21, -2.93], [-10.88, -3.18], [-10.57, -3.44], [-10.27, -3.73], [-9.95, -3.98], [-9.62, -4.23], [-9.32, -4.50],
  [-8.99, -4.74], [-8.67, -5.00], [-8.35, -5.26], [-8.02, -5.50], [-7.72, -5.77], [-7.38, -6.00], [-7.07, -6.27], [-6.74, -6.52],
  [-6.42, -6.77], [-6.12, -7.04], [-5.79, -7.29], [-5.47, -7.55], [-5.18, -7.84], [-4.88, -8.11], [-4.58, -8.39], [-4.27, -8.66],
  [-3.98, -8.95], [-3.70, -9.25], [-3.43, -9.55], [-3.16, -9.86], [-2.87, -10.15], [-2.61, -10.47], [-2.37, -10.80], [-2.10, -11.11],
  [-1.87, -11.45], [-1.63, -11.78], [-1.41, -12.12], [-1.19, -12.47], [-0.98, -12.82], [-0.77, -13.17], [-0.57, -13.53], [-0.38, -13.89],
  [-0.20, -14.26], [-0.02, -14.63], [0.20, -14.45], [0.36, -14.07], [0.55, -13.70], [0.74, -13.34], [0.94, -12.99], [1.15, -12.63],
  [1.37, -12.29], [1.58, -11.94], [1.81, -11.60], [2.06, -11.28], [2.29, -10.94], [2.55, -10.62], [2.81, -10.30], [3.05, -9.98],
  [3.33, -9.68], [3.62, -9.39], [3.91, -9.09], [4.19, -8.80], [4.49, -8.51], [4.78, -8.23], [5.07, -7.94], [5.37, -7.66],
  [5.68, -7.40], [6.01, -7.15], [6.31, -6.87], [6.63, -6.62], [6.96, -6.37], [7.26, -6.10], [7.60, -5.86], [7.91, -5.60],
  [8.23, -5.34], [8.56, -5.10], [8.87, -4.83], [9.20, -4.60], [9.51, -4.33], [9.83, -4.07], [10.16, -3.83], [10.46, -3.55],
  [10.77, -3.28], [11.09, -3.03], [11.40, -2.76], [11.69, -2.47], [11.98, -2.18], [12.27, -1.89], [12.56, -1.60], [12.85, -1.31],
  [13.14, -1.02], [13.40, -0.71], [13.64, -0.37], [13.91, -0.07], [14.13, 0.28], [14.37, 0.61], [14.59, 0.95], [14.79, 1.31],
  [14.98, 1.67], [15.15, 2.04], [15.32, 2.42], [15.46, 2.80], [15.59, 3.19], [15.72, 3.58], [15.78, 3.98], [15.90, 4.37],
  [15.91, 4.78], [15.94, 5.19], [15.98, 5.59], [16.00, 6.00], [15.97, 6.41], [15.92, 6.82], [15.91, 7.23], [15.81, 7.62],
  [15.74, 8.02], [15.61, 8.41], [15.49, 8.80], [15.35, 9.18], [15.18, 9.56], [15.00, 9.93], [14.80, 10.28], [14.59, 10.63],
  [14.37, 10.98], [14.11, 11.29], [13.87, 11.62], [13.60, 11.93], [13.31, 12.22], [12.99, 12.48], [12.67, 12.73], [12.35, 12.99],
  [12.00, 13.21], [11.65, 13.41], [11.29, 13.61], [10.92, 13.78], [10.55, 13.95], [10.16, 14.09], [9.77, 14.21], [9.38, 14.31],
  [8.99, 14.43], [8.58, 14.47], [8.18, 14.56], [7.78, 14.62], [7.37, 14.63], [6.96, 14.63], [6.55, 14.62], [6.15, 14.53],
  [5.75, 14.46], [5.35, 14.38], [4.96, 14.28], [4.58, 14.13], [4.20, 13.99], [3.82, 13.82], [3.46, 13.64], [3.10, 13.44],
  [2.75, 13.22], [2.41, 12.99], [2.09, 12.74], [1.75, 12.51], [1.46, 12.23], [1.17, 11.94], [0.88, 11.65], [0.59, 11.36],
  [0.31, 11.06], [0.05, 10.74], [-0.29, 10.90], [-0.53, 11.23], [-0.79, 11.54], [-1.07, 11.84], [-1.36, 12.13], [-1.66, 12.41],
  [-1.97, 12.67], [-2.30, 12.92], [-2.62, 13.17], [-2.97, 13.39], [-3.32, 13.60], [-3.68, 13.79], [-4.05, 13.96], [-4.43, 14.13],
  [-4.81, 14.27], [-5.20, 14.38], [-5.60, 14.46], [-6.00, 14.54], [-6.40, 14.62], [-6.81, 14.63], [-7.22, 14.63], [-7.63, 14.63],
];
const OUTER = HEART_OUTLINE.map(([x, y]) => [x * SCALE, y * SCALE]);

// ---------- random numbers (same seed every time, so the layout is always the same) ----------
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(11);
const uniform = (a, b) => a + (b - a) * rand();
const randint = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------- measuring words ----------
let measureCtx = null;
function measure(text, size) {
  if (!measureCtx) measureCtx = document.createElement("canvas").getContext("2d");
  measureCtx.font = `bold ${size}px ${FONT}`;
  return { w: measureCtx.measureText(text).width, h: size * 1.15 };
}

// ---------- outline helpers ----------
function crossings(poly, y) {
  const xs = [];
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = poly[i];
    const [x1, y1] = poly[(i + 1) % n];
    if ((y0 <= y && y < y1) || (y1 <= y && y < y0)) {
      xs.push(x0 + ((x1 - x0) * (y - y0)) / (y1 - y0));
    }
  }
  return xs.sort((a, b) => a - b);
}
function intervals(poly, y) {
  const xs = crossings(poly, y);
  const out = [];
  for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]]);
  return out;
}
function intersect(A, B) {
  const out = [];
  for (const [a0, a1] of A) {
    for (const [b0, b1] of B) {
      const lo = Math.max(a0, b0);
      const hi = Math.min(a1, b1);
      if (lo < hi) out.push([lo, hi]);
    }
  }
  return out;
}
// box = [left, bottom, right, top]
const boxOf = (cx, cy, w, h) => [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
const overlap = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
function rectDistance(px, py, b) {
  const dx = Math.max(b[0] - px, 0, px - b[2]);
  const dy = Math.max(b[1] - py, 0, py - b[3]);
  return Math.hypot(dx, dy);
}
function clockwiseAngle(x, y) {
  const TWO_PI = 2 * Math.PI;
  return (((Math.PI / 2 - Math.atan2(y, x)) % TWO_PI) + TWO_PI) % TWO_PI;
}

// ---------- layout: where every word goes ----------
function rowSpans(topY, rowH) {
  const up = topY - 1;
  const down = topY - rowH + 1;
  let spans = intersect(intervals(OUTER, up), intervals(OUTER, down));
  if (!spans.length) spans = intervals(OUTER, topY - rowH / 2);   // the heart is pointed here
  return spans;
}

// near the point: pick the widest words that still fit
function fillTail(width) {
  const chosen = [];
  const order = shuffle(WORD_POOL.slice());
  for (;;) {
    const used = chosen.reduce((s, c) => s + c.w, 0) + WORD_GAP * Math.max(chosen.length - 1, 0);
    const room = width - used;
    const needGap = chosen.length ? WORD_GAP : 0;
    let best = null;
    for (const phrase of order) {
      if (chosen.some((c) => c.phrase === phrase)) continue;
      for (let size = SIZE_MAX; size >= TAIL_SIZE_MIN; size--) {
        const m = measure(phrase, size);
        if (m.w + needGap <= room) {
          if (!best || m.w > best.w) best = { phrase, size, w: m.w, h: m.h };
          break;
        }
      }
    }
    if (!best) return chosen;
    chosen.push(best);
  }
}

// one row of words that reaches both ends of each piece of the heart
function fillRow(topY, rowH, nextPhrase) {
  const placed = [];
  for (const [a, b] of rowSpans(topY, rowH)) {
    const left = a + EDGE;
    const right = b - EDGE;
    const width = right - left;
    if (width <= 0) continue;

    let chosen;
    if (width < TAIL_WIDTH) {
      chosen = fillTail(width);
    } else {
      chosen = [];
      let misses = 0;
      while (misses < WORD_POOL.length) {
        const phrase = nextPhrase();
        const preferred = randint(SIZE_MIN, SIZE_MAX);
        let fit = null;
        for (let size = preferred; size >= SIZE_MIN; size--) {
          const m = measure(phrase, size);
          const used = chosen.reduce((s, c) => s + c.w, 0) + WORD_GAP * chosen.length;
          if (used + m.w <= width) {
            fit = { size, w: m.w, h: m.h };
            break;
          }
        }
        if (fit) {
          chosen.push({ phrase, ...fit });
          misses = 0;
        } else {
          misses++;
        }
      }
    }
    if (!chosen.length) continue;

    // first word on the left edge, last word on the right edge, gaps share the rest
    const wordsW = chosen.reduce((s, c) => s + c.w, 0);
    const gaps = chosen.length - 1;
    let gap;
    let x;
    if (gaps > 0) {
      gap = (width - wordsW) / gaps;
      x = left;
    } else {
      gap = 0;
      x = left + (width - wordsW) / 2;
    }
    for (const c of chosen) {
      placed.push({ cx: x + c.w / 2, phrase: c.phrase, size: c.size, w: c.w, h: c.h });
      x += c.w + gap;
    }
  }
  return placed;
}

// "Je t'aime" words, spread evenly over the heart
function spreadTwinkle(words) {
  const boxes = words.map((w) => boxOf(w.cx, w.cy, w.w, w.h));
  const count = Math.max(4, Math.round(words.length * TWINKLE_RATIO));
  const chosen = [];   // centres of the "Je t'aime" words

  for (let k = 0; k < count; k++) {
    const spacing = (i) => {
      const w = words[i];
      if (!chosen.length) return w.cy;               // the first one goes at the top
      return Math.min(...chosen.map(([x, y]) => Math.hypot(w.cx - x, w.cy - y)));
    };
    const order = words.map((_, i) => i).sort((a, b) => spacing(b) - spacing(a));
    for (const i of order) {
      const wd = words[i];
      if (wd.phrase === TWINKLE_WORD) continue;
      let newSize = wd.size;
      let m = measure(TWINKLE_WORD, newSize);
      while (m.w > wd.w + 4 * ZOOM && newSize > TAIL_SIZE_MIN) {
        newSize--;
        m = measure(TWINKLE_WORD, newSize);
      }
      if (m.w > wd.w + 4 * ZOOM) continue;
      const nb = boxOf(wd.cx, wd.cy, m.w, m.h);
      let clash = false;
      for (let j = 0; j < words.length; j++) {
        if (j !== i && overlap(nb, boxes[j])) {
          clash = true;
          break;
        }
      }
      if (clash) continue;
      words[i] = { cx: wd.cx, cy: wd.cy, phrase: TWINKLE_WORD, size: newSize, w: m.w, h: m.h };
      boxes[i] = nb;
      chosen.push([wd.cx, wd.cy]);
      break;
    }
  }
}

// the whole heart: rows from top to bottom, then ordered clockwise from the top
function layout() {
  const top = Math.max(...OUTER.map((p) => p[1]));
  const bottom = Math.min(...OUTER.map((p) => p[1]));

  let bag = [];
  const nextPhrase = () => {
    if (!bag.length) bag = shuffle(WORD_POOL.slice());
    return bag.pop();
  };

  const words = [];
  let cursor = top;
  while (cursor - ROW_H > bottom) {
    let rowH = ROW_H;
    let row = [];
    let need = 0;
    for (let i = 0; i < 4; i++) {
      row = fillRow(cursor, rowH, nextPhrase);
      need = row.reduce((mx, c) => Math.max(mx, c.h), 0);
      if (need > rowH) {
        rowH = need;
        continue;
      }
      break;
    }
    if (!row.length) {
      cursor -= ROW_H;
      continue;
    }
    rowH = Math.max(need + 0.5, ROW_MIN);   // half a pixel between rows, so words never touch
    const cy = cursor - rowH / 2;
    for (const c of row) words.push({ cx: c.cx, cy, phrase: c.phrase, size: c.size, w: c.w, h: c.h });
    cursor -= rowH;
  }

  spreadTwinkle(words);

  // the outline first (clockwise from the top), then the inner rings, also clockwise
  for (const wd of words) {
    const box = boxOf(wd.cx, wd.cy, wd.w, wd.h);
    let depth = Infinity;
    for (const [px, py] of OUTER) depth = Math.min(depth, rectDistance(px, py, box));
    wd.ring = Math.floor(depth / ROW_H);
    wd.angle = clockwiseAngle(wd.cx, wd.cy);
  }
  words.sort((a, b) => a.ring - b.ring || a.angle - b.angle);
  return words;
}

// ---------- colours and easing ----------
function blend(a, b, amount) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const mixed = pa.map((x, i) => Math.round(x + (pb[i] - x) * amount));
  return "#" + mixed.map((v) => v.toString(16).padStart(2, "0")).join("");
}
const smooth = (t) => t * t * (3 - 2 * t);
function buildColor(p) {
  // a word fading in: dark -> white -> red
  if (p < 0.4) return blend(BUILD_FROM, WHITE, smooth(p / 0.4));
  return blend(WHITE, RED, smooth((p - 0.4) / 0.6));
}
function twinkleColor(p) {
  // one sparkle: red -> white -> red
  return blend(RED, WHITE, 0.5 - 0.5 * Math.cos(2 * Math.PI * p));
}

// ---------- the animation ----------
class HeartAnimation {
  constructor(words) {
    this.order = words.map((w) => ({ x: w.cx, y: w.cy, text: w.phrase, size: w.size, color: BUILD_FROM, angle: w.angle }));
    this.twinkle = this.order.filter((it) => it.text === TWINKLE_WORD);
    this.start = null;
    this.last = null;
    this.started = 0;
    this.active = new Map();   // word -> { kind, t0 }
    this.cool = new Map();     // "Je t'aime" word -> time until its next sparkle
  }

  isBuilt() {
    return this.started === this.order.length && ![...this.active.values()].some((a) => a.kind === "build");
  }

  update(now) {
    if (this.start === null) {
      this.start = now;
      this.last = now;
    }
    const dt = Math.min(now - this.last, 50);
    this.last = now;

    // 1) start each word when its time comes
    while (this.started < this.order.length && this.start + this.started * WORD_STEP_MS <= now) {
      const t0 = this.start + this.started * WORD_STEP_MS;
      this.active.set(this.order[this.started], { kind: "build", t0 });
      this.started++;
    }

    // 2) move every running fade or sparkle forward
    for (const [item, a] of [...this.active]) {
      const length = a.kind === "build" ? FADE_MS : TWINKLE_MS;
      const p = (now - a.t0) / length;
      if (p >= 1) {
        item.color = RED;
        this.active.delete(item);
        if (a.kind === "twinkle") this.cool.set(item, uniform(TWINKLE_COOLDOWN_MS[0], TWINKLE_COOLDOWN_MS[1]));
      } else {
        item.color = a.kind === "build" ? buildColor(p) : twinkleColor(p);
      }
    }

    // 3) once every word is in place, only the "Je t'aime" words sparkle
    const building =
      this.started < this.order.length || [...this.active.values()].some((a) => a.kind === "build");
    if (!building) {
      for (const item of this.twinkle) {
        if (this.active.has(item)) continue;
        if (!this.cool.has(item)) this.cool.set(item, uniform(0, TWINKLE_COOLDOWN_MS[1]));
        this.cool.set(item, this.cool.get(item) - dt);
        if (this.cool.get(item) <= 0) {
          this.cool.delete(item);
          this.active.set(item, { kind: "twinkle", t0: now });
        }
      }
    }
  }
}

// ---------- the page: a quiet, refined opening, then the heart ----------
const T_OUTLINE_START = 900;      // a fine gold line starts to draw the heart...
const T_OUTLINE_END = 2600;       // ...clockwise from the top
const T_WORDS_START = 3200;       // the words start to build here (no text before this)
const INTRO_MS = T_WORDS_START;
const WAVE_MS = 6000;             // a soft wave of light travels clockwise round the heart
const BEAT_PERIOD_MS = 1600;      // a slow, subtle heartbeat
const BEAT_SIZE = 0.008;
const GOLD = "216, 181, 124";     // champagne gold, for the line and the dust

const CSS = `
.heart-screen { display: none; position: fixed; inset: 0; z-index: 1000; background: #050405;
  transition: clip-path 1.6s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.6s ease; }
.heart-screen.open { display: block; }
.heart-screen.closing { opacity: 0; }
.heart-screen canvas { width: 100%; height: 100%; display: block; }
.heart-screen .close-heart { position: absolute; top: 14px; right: 18px; background: none; border: none;
  color: rgba(216, 181, 124, 0.7); font-size: 30px; font-weight: 300; cursor: pointer; z-index: 1001; }
.heart-screen .close-heart:hover { color: #d8b57c; }
#say-line { cursor: pointer; color: #b8243f; text-decoration: underline; text-align: center; font-size: 22px; }
`;

const STARS = Array.from({ length: 90 }, () => ({
  x: Math.random(), y: Math.random(), r: 0.35 + Math.random() * 0.9,
  ph: Math.random() * Math.PI * 2, sp: 0.3 + Math.random() * 0.6,
}));
const DUST = Array.from({ length: 70 }, () => ({
  x: Math.random(), y: Math.random(), r: 0.5 + Math.random() * 0.9,
  vy: 0.004 + Math.random() * 0.01, ph: Math.random() * Math.PI * 2,
}));

let overlay = null;
let canvas = null;
let ctx = null;
let anim = null;
let frameId = null;
let view = null;
let layoutWords = null;
let builtAt = null;
let isOpen = false;
let isClosing = false;
let openedAt = null;
let lastNow = null;
let clipTimer = null;

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const angDiff = (a, b) => {
  const d = Math.abs(a - b) % (2 * Math.PI);
  return Math.min(d, 2 * Math.PI - d);
};

// fit the drawing into the window, keeping the heart's shape
function fitCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const k = Math.min((W * 0.9) / (32 * SCALE), (H * 0.9) / (29.3 * SCALE));   // screen px per design px
  view = { W, H, dpr, k, scale: dpr * k, ox: canvas.width / 2, oy: canvas.height / 2 };
}

// a dark, warm background with faint stars and slowly rising dust
function drawBackground(now, dt, t) {
  const { W, H, dpr } = view;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;

  const base = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
  base.addColorStop(0, "#17110f");
  base.addColorStop(0.6, "#070607");
  base.addColorStop(1, "#020102");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // a faint warm light that breathes slowly behind the heart
  const breathe = 0.5 + 0.5 * Math.sin(now / 3000);
  const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, H * 0.5);
  glow.addColorStop(0, `rgba(184, 36, 63, ${0.07 + 0.03 * breathe})`);
  glow.addColorStop(1, "rgba(184, 36, 63, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const fadeIn = clamp01((t - 300) / 1500);

  ctx.fillStyle = "#f6e6dc";
  for (const s of STARS) {
    ctx.globalAlpha = fadeIn * (0.15 + 0.35 * (0.5 + 0.5 * Math.sin((now / 1000) * s.sp + s.ph)));
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = `rgb(${GOLD})`;
  for (const d of DUST) {
    d.y -= d.vy * dt;
    d.x += Math.sin(now / 2000 + d.ph) * 0.002 * dt;
    if (d.y < -0.02) {
      d.y = 1.02;
      d.x = Math.random();
    }
    ctx.globalAlpha = fadeIn * (0.1 + 0.25 * (0.5 + 0.5 * Math.sin(now / 900 + d.ph)));
    ctx.beginPath();
    ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // soft dark edges
  const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  vig.addColorStop(0, "rgba(0, 0, 0, 0)");
  vig.addColorStop(1, "rgba(0, 0, 0, 0.8)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

// a heartbeat that is barely there
function heartScale(now) {
  const ph = (now % BEAT_PERIOD_MS) / BEAT_PERIOD_MS;
  return 1 + BEAT_SIZE * (Math.exp(-40 * (ph - 0.1) ** 2) + 0.5 * Math.exp(-40 * (ph - 0.3) ** 2));
}

function setHeartTransform(now) {
  const s = view.scale * heartScale(now);
  ctx.setTransform(s, 0, 0, s, view.ox, view.oy);
}

// a fine gold line draws the heart, clockwise from the top
function drawOutline(now, t) {
  const f = easeInOut(clamp01((t - T_OUTLINE_START) / (T_OUTLINE_END - T_OUTLINE_START)));
  if (f <= 0) return;
  const last = Math.min(Math.floor(f * (OUTER.length - 1)), OUTER.length - 1);
  // once the words arrive, the line becomes a faint guide
  const alpha = 0.85 - 0.6 * clamp01((t - T_WORDS_START) / 1000);
  setHeartTransform(now);
  ctx.beginPath();
  ctx.moveTo(OUTER[0][0], -OUTER[0][1]);
  for (let i = 1; i <= last; i++) ctx.lineTo(OUTER[i][0], -OUTER[i][1]);
  if (f >= 1) ctx.closePath();
  ctx.lineJoin = "round";
  ctx.shadowColor = `rgba(${GOLD}, 0.35)`;
  ctx.shadowBlur = 6 * view.dpr;
  ctx.strokeStyle = `rgba(${GOLD}, ${alpha})`;
  ctx.lineWidth = 1.2 / view.k;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// the words, with a soft wave of light that travels clockwise round the heart
function drawWords(now) {
  const built = builtAt !== null;
  const waveAngle = built ? ((now - builtAt) / WAVE_MS) * 2 * Math.PI : 0;
  setHeartTransform(now);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const item of anim.order) {
    ctx.font = `bold ${item.size}px ${FONT}`;
    let color = item.color;
    if (built && color === RED) {
      const inten = Math.exp(-(angDiff(item.angle, waveAngle) ** 2) / (2 * 0.25 * 0.25));
      color = blend(RED, "#e9c9bd", 0.45 * inten);
    }
    const glowing = item.text === TWINKLE_WORD && item.color !== RED && item.color !== BUILD_FROM;
    ctx.fillStyle = color;
    if (glowing) {
      ctx.shadowColor = `rgba(${GOLD}, 0.7)`;
      ctx.shadowBlur = 10 * view.dpr;
    }
    ctx.fillText(item.text, item.x, -item.y);      // the screen's y points down, so flip y
    if (glowing) ctx.shadowBlur = 0;
  }
}

function frame(now) {
  if (openedAt === null) {
    openedAt = now;
    lastNow = now;
  }
  const dt = Math.min(now - lastNow, 50) / 1000;
  lastNow = now;
  const t = now - openedAt;

  drawBackground(now, dt, t);
  drawOutline(now, t);
  if (t >= INTRO_MS) {
    anim.update(now);
    if (builtAt === null && anim.isBuilt()) builtAt = now;
    drawWords(now);
  }
  frameId = requestAnimationFrame(frame);
}

function openHeart(e) {
  if (isOpen) return;
  isOpen = true;
  isClosing = false;
  if (!layoutWords) layoutWords = layout();
  anim = new HeartAnimation(layoutWords);
  builtAt = null;
  openedAt = null;
  lastNow = null;

  // the opening: a circle of light opens slowly from where you clicked
  const x = e && e.clientX !== undefined ? e.clientX : window.innerWidth / 2;
  const y = e && e.clientY !== undefined ? e.clientY : window.innerHeight / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 20;
  overlay.classList.remove("closing");
  overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
  overlay.classList.add("open");
  void overlay.offsetWidth;                                  // let the small circle show first
  overlay.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;
  clearTimeout(clipTimer);
  clipTimer = setTimeout(() => {
    overlay.style.clipPath = "none";
  }, 1700);

  fitCanvas();
  cancelAnimationFrame(frameId);
  frameId = requestAnimationFrame(frame);
  try {
    const p = overlay.requestFullscreen();   // full screen (this works because of the click)
    if (p && p.catch) p.catch(() => {});
  } catch (err) {
    // full screen not allowed: the box still covers the window
  }
}

function closeHeart() {
  if (!isOpen || isClosing) return;
  isClosing = true;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  overlay.classList.add("closing");        // fade out
  setTimeout(() => {
    cancelAnimationFrame(frameId);
    clearTimeout(clipTimer);
    overlay.classList.remove("open", "closing");
    overlay.style.clipPath = "";
    isOpen = false;
    isClosing = false;
  }, 600);
}

function setupPage() {
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  overlay = document.createElement("div");
  overlay.className = "heart-screen";
  overlay.innerHTML = '<canvas></canvas><button class="close-heart" aria-label="Close">&times;</button>';
  document.body.appendChild(overlay);
  canvas = overlay.querySelector("canvas");
  ctx = canvas.getContext("2d");

  document.getElementById("say-line").addEventListener("click", openHeart);
  overlay.querySelector(".close-heart").addEventListener("click", closeHeart);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeHeart();
  });
  window.addEventListener("resize", () => {
    if (isOpen) fitCanvas();
  });
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) closeHeart();
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setupPage);
  else setupPage();
}
