(() => {
const SIZE = 720, TOL = 3;
const $ = id => document.getElementById(id);

/* ---------- picture generators (seeded, so each scene looks the same every time) ---------- */
function rng(seed){ let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function grad(c, y0, y1, stops){ const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
function ridge(c, W, bottom, base, amp, color, seed, sharp){
  const r = rng(seed), f = [2 + r() * 3, 6 + r() * 5, 14 + r() * 8], p = [r() * 6.3, r() * 6.3, r() * 6.3];
  c.beginPath(); c.moveTo(0, bottom);
  for (let x = 0; x <= W; x += 3){
    const t = x / W * Math.PI;
    const h = sharp
      ? .55 * (1 - Math.abs(Math.sin(t * f[0] + p[0]))) + .3 * (1 - Math.abs(Math.sin(t * f[1] + p[1]))) + .15 * (.5 + .5 * Math.sin(t * f[2] + p[2]))
      : .5 + .3 * Math.sin(t * f[0] + p[0]) + .15 * Math.sin(t * f[1] + p[1]) + .05 * Math.sin(t * f[2] + p[2]);
    c.lineTo(x, base - amp * h);
  }
  c.lineTo(W, bottom); c.closePath(); c.fillStyle = color; c.fill();
}

function sceneDusk(c, W, H){
  const hz = Math.round(H * .6), r = rng(7);
  c.fillStyle = grad(c, 0, hz, [[0,'#1d2766'],[.35,'#5d3a8a'],[.62,'#c95b7d'],[.84,'#f39a5c'],[1,'#fcd48e']]); c.fillRect(0, 0, W, hz);
  c.fillStyle = 'rgba(255,255,255,.75)';
  for (let k = 0; k < 45; k++){ const s = r() < .2 ? 2.2 : 1.4; c.fillRect(r() * W, r() * hz * .32, s, s); }
  const sx = W * .64, sy = hz - H * .075;
  let g = c.createRadialGradient(sx, sy, 0, sx, sy, W * .42);
  g.addColorStop(0, 'rgba(255,236,190,.85)'); g.addColorStop(.18, 'rgba(255,190,130,.45)'); g.addColorStop(1, 'rgba(255,150,120,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, hz);
  c.fillStyle = '#fff3d2'; c.beginPath(); c.arc(sx, sy, W * .05, 0, 7); c.fill();
  ridge(c, W, hz, hz - H * .06, H * .24, '#9a6290', 11, true);
  c.fillStyle = grad(c, hz - H * .3, hz, [[0,'rgba(250,170,130,0)'],[1,'rgba(250,170,130,.35)']]); c.fillRect(0, hz - H * .3, W, H * .3);
  ridge(c, W, hz, hz - H * .02, H * .15, '#5e3f72', 23, true);
  ridge(c, W, hz, hz + 2, H * .06, '#2f2546', 5, false);
  c.fillStyle = '#211a33';
  for (let k = 0; k < 16; k++){ const x = r() * W * .34, h = H * (.04 + r() * .07), w = h * .36; c.beginPath(); c.moveTo(x, hz - h); c.lineTo(x + w, hz + 1); c.lineTo(x - w, hz + 1); c.closePath(); c.fill(); }
  // mirror the sky into the lake
  const d = H - hz, tmp = document.createElement('canvas'); tmp.width = W; tmp.height = d;
  tmp.getContext('2d').drawImage(c.canvas, 0, hz - d, W, d, 0, 0, W, d);
  c.save(); c.translate(0, hz + d); c.scale(1, -1); c.drawImage(tmp, 0, 0); c.restore();
  c.fillStyle = grad(c, hz, H, [[0,'rgba(18,20,58,.25)'],[1,'rgba(12,14,40,.7)']]); c.fillRect(0, hz, W, d);
  for (let k = 0; k < 240; k++){
    const y = hz + 3 + Math.pow(r(), 1.4) * (d - 3), depth = (y - hz) / d, near = r() < .45;
    const x = near ? sx + (r() - .5) * W * .16 * (1 + depth * 2) : r() * W;
    const len = 8 + r() * 50 * (.4 + depth);
    c.fillStyle = near ? 'rgba(255,225,170,.55)' : 'rgba(255,200,190,.16)';
    c.fillRect(x - len / 2, y, len, 1 + depth * 1.5);
  }
  c.fillStyle = '#1d1630'; c.fillRect(0, hz - 1, W, 3);
}

// The kallysoft logo on paper, between two dark diagonals (house palette only).
// The diagonals give every row and column an edge to line up, up to 6x6.
function sceneKallysoft(c, W, H){
  const k = W / 720;
  c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, H);
  c.fillStyle = '#232323';
  c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(W, 30 * k); c.lineTo(0, 236 * k); c.closePath(); c.fill();
  c.fillStyle = '#0e0e0e';
  c.beginPath(); c.moveTo(0, 690 * k); c.lineTo(W, 484 * k); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
  c.save(); c.translate(63.5 * k, 250.5 * k); c.scale(k, k);
  c.fillStyle = '#0a0a0a'; c.fill(new Path2D(self.KALLYSOFT_LOGO.d));
  c.restore();
}

function sceneBeach(c, W, H){
  const r = rng(3), sea = H * .5, shore = H * .66;
  c.fillStyle = grad(c, 0, sea, [[0,'#2a7fd4'],[1,'#a9dcf6']]); c.fillRect(0, 0, W, sea);
  [[.18,.16,1],[.62,.1,.8],[.86,.3,.6],[.42,.34,.5]].forEach(([x, y, s]) => {
    for (let k = 0; k < 7; k++){
      const cx = W * x + (k - 3) * W * .035 * s, cy = H * y + (r() - .5) * H * .03 * s - Math.sin(k / 6 * Math.PI) * H * .03 * s, rad = W * (.035 + r() * .025) * s;
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.7, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
    }
  });
  c.fillStyle = grad(c, sea, shore, [[0,'#0d5793'],[.6,'#1c93b5'],[1,'#3fc1c4']]); c.fillRect(0, sea, W, shore - sea);
  for (let k = 0; k < 80; k++){ const y = sea + r() * (shore - sea); c.fillStyle = `rgba(255,255,255,${.15 + r() * .3})`; c.fillRect(r() * W, y, 4 + 8 + r() * 36 * (y - sea) / (shore - sea), 1.5); }
  c.fillStyle = grad(c, shore, H, [[0,'#f4dfac'],[1,'#d9a964']]); c.fillRect(0, shore, W, H - shore);
  const wave = off => { c.beginPath(); c.moveTo(0, shore - 2); for (let x = 0; x <= W; x += 4) c.lineTo(x, shore + off + 6 * Math.sin(x / 37) + 3 * Math.sin(x / 11)); c.lineTo(W, shore - 2); c.closePath(); c.fill(); };
  c.fillStyle = 'rgba(150,110,60,.28)'; wave(20);
  c.fillStyle = 'rgba(255,255,255,.9)'; wave(8);
  for (let k = 0; k < 2600; k++){ c.fillStyle = r() < .5 ? 'rgba(120,80,30,.18)' : 'rgba(255,255,255,.25)'; c.fillRect(r() * W, shore + 22 + r() * (H - shore - 22), 1.5, 1.5); }
  c.fillStyle = 'rgba(110,70,20,.25)'; c.beginPath(); c.ellipse(W * .5, H * .87, W * .2, H * .035, 0, 0, 7); c.fill();
  // umbrella
  c.lineCap = 'round';
  c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 9; c.beginPath(); c.moveTo(W * .44, H * .5); c.lineTo(W * .475, H * .875); c.stroke();
  c.strokeStyle = '#f1ede4'; c.lineWidth = 6; c.stroke();
  c.save(); c.translate(W * .44, H * .5); c.rotate(-.12);
  const rx = W * .25, ry = H * .14, segs = 8;
  for (let k = 0; k < segs; k++){
    const x0 = -rx + k * 2 * rx / segs, x1 = x0 + 2 * rx / segs;
    c.beginPath(); c.moveTo(0, -ry);
    c.quadraticCurveTo(x0 * 1.05, -ry * .55, x0, 0);
    c.quadraticCurveTo((x0 + x1) / 2, ry * .2, x1, 0);
    c.quadraticCurveTo(x1 * 1.05, -ry * .55, 0, -ry);
    c.fillStyle = k % 2 ? '#fff6ea' : '#e5383b'; c.fill();
  }
  c.fillStyle = '#f1ede4'; c.beginPath(); c.arc(0, -ry, 5, 0, 7); c.fill();
  c.restore();
  // towel
  c.save(); c.translate(W * .73, H * .85); c.rotate(-.18);
  const tw = W * .26, th = H * .11, tc = ['#ffcc33','#17a398','#ffffff','#17a398','#ffcc33'];
  tc.forEach((col, s) => { c.fillStyle = col; c.fillRect(-tw / 2, -th / 2 + s * th / 5, tw, th / 5 + .5); });
  c.restore();
  // ball
  const bx = W * .2, by = H * .86, br = W * .055, bc = ['#e5383b','#ffffff','#2a7fd4','#ffffff','#ffcc33','#ffffff'];
  c.fillStyle = 'rgba(110,70,20,.25)'; c.beginPath(); c.ellipse(bx + br * .3, by + br * .9, br * 1.1, br * .3, 0, 0, 7); c.fill();
  bc.forEach((col, k) => { c.beginPath(); c.moveTo(bx, by); c.arc(bx, by, br, k * Math.PI / 3 - .4, (k + 1) * Math.PI / 3 - .4); c.closePath(); c.fillStyle = col; c.fill(); });
  const hg = c.createRadialGradient(bx - br * .35, by - br * .4, 1, bx, by, br);
  hg.addColorStop(0, 'rgba(255,255,255,.55)'); hg.addColorStop(.5, 'rgba(255,255,255,0)'); hg.addColorStop(1, 'rgba(0,0,0,.25)');
  c.fillStyle = hg; c.beginPath(); c.arc(bx, by, br, 0, 7); c.fill();
}

function balloon(c, cx, cy, R, cols){
  c.strokeStyle = 'rgba(60,40,30,.8)'; c.lineWidth = Math.max(1, R * .03);
  c.beginPath(); c.moveTo(cx - R * .28, cy + R * 1.15); c.lineTo(cx - R * .16, cy + R * 1.5); c.moveTo(cx + R * .28, cy + R * 1.15); c.lineTo(cx + R * .16, cy + R * 1.5); c.stroke();
  c.fillStyle = '#7a4a26'; c.fillRect(cx - R * .18, cy + R * 1.48, R * .36, R * .26);
  c.save();
  c.beginPath(); c.moveTo(cx - R * .3, cy + R * 1.15);
  c.bezierCurveTo(cx - R * 1.3, cy + R * .45, cx - R * 1.2, cy - R * 1.1, cx, cy - R * 1.1);
  c.bezierCurveTo(cx + R * 1.2, cy - R * 1.1, cx + R * 1.3, cy + R * .45, cx + R * .3, cy + R * 1.15);
  c.closePath(); c.clip();
  const bands = 6;
  for (let k = 0; k < bands; k++){ c.fillStyle = cols[k % cols.length]; c.beginPath(); c.ellipse(cx, cy + R * .1, Math.max(1, R * 1.3 * (1 - k / bands)), R * 1.5, 0, 0, 7); c.fill(); }
  const g = c.createRadialGradient(cx - R * .45, cy - R * .5, R * .05, cx, cy, R * 1.5);
  g.addColorStop(0, 'rgba(255,255,255,.4)'); g.addColorStop(.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
  c.fillStyle = g; c.fillRect(cx - R * 1.4, cy - R * 1.3, R * 2.8, R * 2.6);
  c.restore();
}
function sceneBalloons(c, W, H){
  const r = rng(19);
  c.fillStyle = grad(c, 0, H, [[0,'#6fa8e8'],[.55,'#bcd9f2'],[.8,'#f7e3c8'],[1,'#f7e3c8']]); c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(W * .82, H * .62, 0, W * .82, H * .62, W * .38);
  g.addColorStop(0, 'rgba(255,232,180,.75)'); g.addColorStop(1, 'rgba(255,232,180,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  ridge(c, W, H, H * .74, H * .12, '#a7c4a0', 31, false);
  ridge(c, W, H, H * .83, H * .12, '#77a868', 8, false);
  ridge(c, W, H, H * .94, H * .13, '#4b8a4a', 44, false);
  for (let k = 0; k < 46; k++){ c.fillStyle = r() < .5 ? '#2f6a36' : '#3b7a3f'; c.beginPath(); c.arc(r() * W, H * .87 + r() * H * .12, 4 + r() * 7, 0, 7); c.fill(); }
  balloon(c, W * .16, H * .58, W * .035, ['#ffd166','#ef476f']);
  balloon(c, W * .8, H * .48, W * .055, ['#06d6a0','#118ab2','#ffffff']);
  balloon(c, W * .63, H * .2, W * .09, ['#8338ec','#ffbe0b','#ff006e']);
  balloon(c, W * .3, H * .34, W * .14, ['#e63946','#f1faee','#e63946','#ffb703']);
}

function sceneCity(c, W, H){
  const r = rng(42), ground = H * .86;
  c.fillStyle = grad(c, 0, ground, [[0,'#060a22'],[.5,'#18275e'],[.8,'#4b3a77'],[1,'#d9775c']]); c.fillRect(0, 0, W, ground);
  for (let k = 0; k < 130; k++){ c.fillStyle = `rgba(255,255,255,${.3 + r() * .6})`; const s = r() < .1 ? 2.2 : 1.2; c.fillRect(r() * W, r() * H * .5, s, s); }
  const mx = W * .8, my = H * .17, mr = W * .055;
  const mg = c.createRadialGradient(mx, my, mr, mx, my, mr * 3.5); mg.addColorStop(0, 'rgba(240,235,210,.35)'); mg.addColorStop(1, 'rgba(240,235,210,0)');
  c.fillStyle = mg; c.fillRect(mx - mr * 4, my - mr * 4, mr * 8, mr * 8);
  c.fillStyle = '#f3eed8'; c.beginPath(); c.arc(mx, my, mr, 0, 7); c.fill();
  c.fillStyle = 'rgba(170,160,130,.35)'; [[-.3,-.2,.22],[.25,.15,.3],[-.1,.4,.15]].forEach(([dx, dy, s]) => { c.beginPath(); c.arc(mx + dx * mr, my + dy * mr, s * mr, 0, 7); c.fill(); });
  let x = -10;
  while (x < W){ const w = 26 + r() * 50, h = H * (.22 + r() * .3); c.fillStyle = '#262c5a'; c.fillRect(x, ground - h, w, h);
    c.fillStyle = 'rgba(255,214,140,.35)'; for (let wy = ground - h + 8; wy < ground - 8; wy += 12) for (let wx = x + 5; wx < x + w - 6; wx += 9) if (r() < .14) c.fillRect(wx, wy, 4, 5);
    x += w + 2; }
  x = -6;
  while (x < W){ const w = 40 + r() * 70, h = H * (.12 + r() * .42); c.fillStyle = r() < .5 ? '#121633' : '#171b3d'; c.fillRect(x, ground - h, w, h);
    if (r() < .3){ c.fillRect(x + w * .5, ground - h - H * .04, 2, H * .04); c.fillStyle = '#ff4d4d'; c.beginPath(); c.arc(x + w * .5 + 1, ground - h - H * .04, 2.5, 0, 7); c.fill(); }
    for (let wy = ground - h + 10; wy < ground - 14; wy += 18) for (let wx = x + 8; wx < x + w - 12; wx += 15) if (r() < .38){ c.fillStyle = r() < .8 ? '#ffd27a' : '#8fe3ff'; c.fillRect(wx, wy, 9, 12); }
    x += w + 4; }
  c.fillStyle = '#0b0d1f'; c.fillRect(0, ground, W, H - ground);
  c.save(); c.globalCompositeOperation = 'lighter';
  [[ground + H * .035, '255,70,60'], [ground + H * .085, '255,236,190']].forEach(([y, col]) => {
    [[10,.12],[5,.25],[2,.9]].forEach(([t, a]) => { c.fillStyle = `rgba(${col},${a})`; c.fillRect(0, y - t / 2, W, t); });
  });
  c.restore();
}

const SCENES = [
  { name:'kallysoft', draw:sceneKallysoft },
  { name:'Beach day', draw:sceneBeach },
  { name:'Lake at dusk', draw:sceneDusk },
  { name:'Balloon morning', draw:sceneBalloons },
  { name:'City at night', draw:sceneCity }
];
const cache = {};
let uploadCanvas = null;
function sceneCanvas(key){
  if (key === 'up') return uploadCanvas;
  if (!cache[key]){ const c = document.createElement('canvas'); c.width = c.height = SIZE; SCENES[key].draw(c.getContext('2d'), SIZE, SIZE); cache[key] = c; }
  return cache[key];
}
const nameOf = key => key === 'up' ? 'Your photo' : SCENES[key].name;

/* ---------- state ---------- */
const CHANNELS = { r:{ i:0, name:'red', color:'#e5484d' }, g:{ i:1, name:'green', color:'#2b9a48' }, b:{ i:2, name:'blue', color:'#3a6ee0' } };
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e){ return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e){} }
};
/* guide: what the dragged line turns into while it moves. min/max: how far lines slip at the start (px). snap: hint snapping distance.
   turn/tsnap: the same for rotate mode, in degrees. */
const DIFFS = {
  easy:   { min:24, max:60, snap:8, turn:[25, 90], tsnap:8, guide:'edges' },
  medium: { min:14, max:48, snap:6, turn:[12, 60], tsnap:5, guide:'boost' },
  hard:   { min:8,  max:30, snap:4, turn:[5, 30],  tsnap:3, guide:null }
};
const DEFAULTS = { scene:0, n:3, mode:'slide', channel:'b', turn:['r','b'], lines:'both', difficulty:'easy', numbers:true, hints:true };
function cleanSettings(s){
  s = Object.assign({}, DEFAULTS, s || {});
  if (!(Number.isInteger(s.scene) && SCENES[s.scene])) s.scene = 0;
  if (![3,4,5,6].includes(s.n)) s.n = 3;
  if (!['slide','rotate'].includes(s.mode)) s.mode = 'slide';
  if (!CHANNELS[s.channel]) s.channel = 'b';
  const turn = ['r','g','b'].filter(k => Array.isArray(s.turn) && s.turn.includes(k));
  s.turn = turn.length >= 1 && turn.length <= 2 ? turn : DEFAULTS.turn.slice();
  if (!['cols','both'].includes(s.lines)) s.lines = 'both';
  if (!DIFFS[s.difficulty]) s.difficulty = 'easy';
  s.numbers = !!s.numbers; s.hints = !!s.hints;
  return s;
}
/* Slide mode moves lines: S.scr.col[i], S.scr.row[i] in px. Rotate mode turns tiles: S.scr.c0[k] (and c1[k] with two colours) in degrees,
   one array per turning colour, k = row * n + column. S.lock marks tiles with nothing to line up in that colour; they stay put. */
const S = { set:cleanSettings(store.get('untint.settings')), scr:null, cor:null, lock:null, sel:{ t:'col', i:0 },
  moves:0, peeks:0, t0:0, elapsed:0, running:false, solved:false, peeking:false, initMean:1, guide:null };
const saveSettings = () => store.set('untint.settings', Object.assign({}, S.set, { scene:S.set.scene === 'up' ? 0 : S.set.scene }));
const rotating = () => S.set.mode === 'rotate';
const turnChs = () => S.set.turn.map(k => CHANNELS[k].i);
const colourOf = t => CHANNELS[S.set.turn[+t[1]]];

/* A line's slip wraps around the picture, so +700 and -20 are the same position; a turn wraps at 360°. err() is the signed distance from correct. */
const wrapSigned = v => { const m = ((v % SIZE) + SIZE) % SIZE; return m > SIZE / 2 ? m - SIZE : m; };
const wrapDeg = v => { const m = ((v % 360) + 360) % 360; return m > 180 ? m - 360 : m; };
const wrapFor = (t, v) => t[0] === 'c' ? wrapDeg(v) : wrapSigned(v);
const err = (t, i) => wrapFor(t, S.scr[t][i] + S.cor[t][i]);
/* a tile counts as right when its corners are within about TOL px, so smaller tiles allow a few more degrees */
const tolDeg = () => Math.max(1, TOL / (SIZE / S.set.n / 2) * 180 / Math.PI);
const lineOk = (t, i) => Math.abs(err(t, i)) <= (t[0] === 'c' ? tolDeg() : TOL);
function activeLines(){
  const L = [], n = S.set.n;
  if (rotating()){ S.set.turn.forEach((_, c) => { for (let k = 0; k < n * n; k++) if (!S.lock[c][k]) L.push(['c' + c, k]); }); return L; }
  for (let i = 0; i < n; i++) L.push(['col', i]);
  if (S.set.lines === 'both') for (let i = 0; i < n; i++) L.push(['row', i]);
  return L;
}
function meanErr(withCor){
  const L = activeLines(); let s = 0;
  L.forEach(([t, i]) => { s += Math.abs(withCor ? err(t, i) : wrapFor(t, S.scr[t][i])); });
  return L.length ? s / L.length : 0;
}
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
function makeScramble(n, lines, difficulty){
  const D = DIFFS[difficulty], gap = Math.max(6, D.min / 2);
  const line = on => {
    const L = [];
    while (L.length < n){
      if (!on){ L.push(0); continue; }
      const v = (Math.random() < .5 ? -1 : 1) * randInt(D.min, D.max);
      if (L.length && Math.abs(v - L[L.length - 1]) < gap) continue;
      L.push(v);
    }
    return L;
  };
  return { row:line(lines === 'both'), col:line(true) };
}
function makeTurns(n, colours, difficulty){
  const [lo, hi] = DIFFS[difficulty].turn, scr = {};
  for (let c = 0; c < colours; c++) scr['c' + c] = Array.from({ length:n * n }, () => (Math.random() < .5 ? -1 : 1) * randInt(lo, hi));
  return scr;
}

/* ---------- rendering ---------- */
const cv = $('cv'); cv.width = cv.height = SIZE;
const ctx = cv.getContext('2d');
const out = ctx.createImageData(SIZE, SIZE), dst = out.data;
const wrap = new Uint16Array(SIZE * 3); for (let k = 0; k < wrap.length; k++) wrap[k] = k % SIZE;
const tileOf = new Uint8Array(SIZE), bounds = new Uint16Array(7);
let src = null, edgeRef = null, edgeMovs = [];
function loadSource(){ src = sceneCanvas(S.set.scene).getContext('2d').getImageData(0, 0, SIZE, SIZE).data; }
/* Edge maps for the easy guide: one from the colours that stay put, one per colour that slips or turns. */
function edgeMap(I){
  const W = SIZE, T = new Float32Array(W * W), B = new Float32Array(W * W), E = new Uint8ClampedArray(W * W);
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++){ const k = y * W + x; T[k] = (I[k - (x > 0)] + I[k] + I[k + (x < W - 1)]) / 3; }
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++){ const k = y * W + x; B[k] = (T[k - (y > 0) * W] + T[k] + T[k + (y < W - 1) * W]) / 3; }
  for (let y = 1; y < W - 1; y++) for (let x = 1; x < W - 1; x++){
    const k = y * W + x, m = Math.abs(B[k + 1] - B[k - 1]) + Math.abs(B[k + W] - B[k - W]);
    E[k] = m < 6 ? 0 : m * 5;
  }
  return E;
}
function computeEdges(){
  const movs = rotating() ? turnChs() : [CHANNELS[S.set.channel].i], keep = [0, 1, 2].filter(c => !movs.includes(c));
  const ref = new Float32Array(SIZE * SIZE), mov = movs.map(() => new Float32Array(SIZE * SIZE));
  for (let k = 0, p = 0; k < ref.length; k++, p += 4){
    let s = 0; for (const c of keep) s += src[p + c];
    ref[k] = s / keep.length;
    movs.forEach((c, m) => { mov[m][k] = src[p + c]; });
  }
  edgeRef = edgeMap(ref); edgeMovs = mov.map(edgeMap);
}
/* Rotate mode leaves out tiles where the turning colour is plain (a sky, a dark band): turning them would change nothing you can see. */
function computeLock(){
  const n = S.set.n;
  return edgeMovs.map(E => Array.from({ length:n * n }, (_, k) => {
    const T = tileBox(k); let count = 0;
    for (let y = T.y0; y < T.y1; y++) for (let x = T.x0; x < T.x1; x++) if (E[y * SIZE + x]) count++;
    return count < T.x1 - T.x0;
  }));
}
/* Tile k in pixels, and the rotation for a turn of a degrees: a pixel at (x, y) shows the colour from (sx, sy) = centre + R(-a) * (x, y) - centre. */
function tileBox(k){
  const n = S.set.n, i = Math.floor(k / n), j = k % n, x0 = bounds[j], x1 = bounds[j + 1], y0 = bounds[i], y1 = bounds[i + 1];
  return { x0, x1, y0, y1, cx:(x0 + x1 - 1) / 2, cy:(y0 + y1 - 1) / 2 };
}
const M = SIZE - 1, clampPx = v => v < 0 ? 0 : v > M ? M : v;
function turnTile(T, a, ch){
  const th = a * Math.PI / 180, co = Math.cos(th), si = Math.sin(th);
  for (let y = T.y0; y < T.y1; y++){
    const dy = y - T.cy, bx = T.cx + dy * si, by = T.cy + dy * co;
    let p = (y * SIZE + T.x0) * 4 + ch;
    for (let x = T.x0; x < T.x1; x++, p += 4){
      const dx = x - T.cx, sx = clampPx(Math.round(bx + dx * co)), sy = clampPx(Math.round(by - dx * si));
      dst[p] = src[(sy * SIZE + sx) * 4 + ch];
    }
  }
}
function paintTurn(){
  const n = S.set.n, chs = turnChs();
  chs.forEach((ch, c) => { for (let k = 0; k < n * n; k++){ const a = err('c' + c, k); if (a) turnTile(tileBox(k), a, ch); } });
  const mode = DIFFS[S.set.difficulty].guide, g = S.guide;
  if (!g || !mode) return;
  const T = tileBox(g.i), E = edgeMovs[+g.t[1]], th = err(g.t, g.i) * Math.PI / 180, co = Math.cos(th), si = Math.sin(th);
  for (let y = T.y0; y < T.y1; y++){
    const dy = y - T.cy, bx = T.cx + dy * si, by = T.cy + dy * co;
    for (let x = T.x0; x < T.x1; x++){
      const k = y * SIZE + x, p = k * 4, r = dst[p], gr = dst[p + 1], b = dst[p + 2];
      if (mode === 'boost'){
        const L = (r + gr + b) / 3;
        dst[p] = L + (r - L) * 2.6; dst[p + 1] = L + (gr - L) * 2.6; dst[p + 2] = L + (b - L) * 2.6;
      } else {
        const dx = x - T.cx, er = edgeRef[k], em = E[clampPx(Math.round(by - dx * si)) * SIZE + clampPx(Math.round(bx + dx * co))], L = (r + gr + b) * .07;
        dst[p] = L + er; dst[p + 1] = L + er * .55 + em * .75; dst[p + 2] = L + em;
      }
    }
  }
}
/* Every channel stays put except one: inside row i it is read from dx[i] pixels to the left, inside column j from dy[j] pixels above. */
function paint(){
  dst.set(src);
  if (!S.peeking && rotating()) paintTurn();
  else if (!S.peeking){
    const n = S.set.n, ch = CHANNELS[S.set.channel].i, dx = new Int16Array(n), dy = new Int16Array(n);
    for (let i = 0; i < n; i++){ dx[i] = err('row', i); dy[i] = err('col', i); }
    for (let y = 0; y < SIZE; y++){
      const ox = SIZE - dx[tileOf[y]], oy = y + SIZE;
      let p = y * SIZE * 4 + ch;
      for (let x = 0; x < SIZE; x++, p += 4){
        const sx = wrap[x + ox], sy = wrap[oy - dy[tileOf[x]]];
        dst[p] = src[(sy * SIZE + sx) * 4 + ch];
      }
    }
    const mode = DIFFS[S.set.difficulty].guide, g = S.guide;
    if (g && mode){
      const lo = Math.ceil(g.i * SIZE / n), hi = Math.ceil((g.i + 1) * SIZE / n);
      const [x0, x1, y0, y1] = g.t === 'col' ? [lo, hi, 0, SIZE] : [0, SIZE, lo, hi];
      for (let y = y0; y < y1; y++){
        const ox = SIZE - dx[tileOf[y]], oy = y + SIZE;
        for (let x = x0; x < x1; x++){
          const k = y * SIZE + x, p = k * 4, r = dst[p], gr = dst[p + 1], b = dst[p + 2];
          if (mode === 'boost'){
            const L = (r + gr + b) / 3;
            dst[p] = L + (r - L) * 2.6; dst[p + 1] = L + (gr - L) * 2.6; dst[p + 2] = L + (b - L) * 2.6;
          } else {
            /* orange = edges of the colours that stay put, cyan = edges of the slipping colour; they turn white where they meet */
            const er = edgeRef[k], em = edgeMovs[0][wrap[oy - dy[tileOf[x]]] * SIZE + wrap[x + ox]], L = (r + gr + b) * .07;
            dst[p] = L + er; dst[p + 1] = L + er * .55 + em * .75; dst[p + 2] = L + em;
          }
        }
      }
    }
  }
  ctx.putImageData(out, 0, 0);
}
let guideTimer = 0;
function showGuide(t, i){ clearTimeout(guideTimer); S.guide = { t, i }; stage.classList.add('guiding'); }
function hideGuide(ms){
  clearTimeout(guideTimer);
  guideTimer = setTimeout(() => { S.guide = null; stage.classList.remove('guiding'); draw(); }, ms);
}
let raf = 0;
const draw = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); }); };

/* ---------- clock ---------- */
const elapsed = () => S.running ? performance.now() - S.t0 : S.elapsed;
function startClock(){ if (S.running || S.solved) return; S.t0 = performance.now() - S.elapsed; S.running = true; }
function stopClock(){ if (!S.running) return; S.elapsed = performance.now() - S.t0; S.running = false; }
const fmtTime = ms => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const fmt = v => v > 0 ? '+' + v : v < 0 ? '−' + (-v) : '0';
let pausedByHide = false;
document.addEventListener('visibilitychange', () => {
  if (document.hidden && S.running){ stopClock(); pausedByHide = true; }
  else if (!document.hidden && pausedByHide){ pausedByHide = false; startClock(); }
});
setInterval(() => { if (S.running) $('stTime').textContent = fmtTime(elapsed()); }, 250);

/* ---------- board ---------- */
function buildBoard(){
  const n = S.set.n, rot = rotating();
  $('board').style.setProperty('--n', n);
  $('board').classList.toggle('cols-only', !rot && S.set.lines === 'cols');
  document.body.classList.toggle('mode-rotate', rot);
  for (let p = 0; p < SIZE; p++) tileOf[p] = Math.min(n - 1, Math.floor(p * n / SIZE));
  for (let i = 0; i <= n; i++) bounds[i] = Math.ceil(i * SIZE / n);
  const tiles = $('tiles'); tiles.textContent = '';
  if (rot) for (let k = 0; k < n * n; k++) tiles.appendChild(document.createElement('span')).appendChild(document.createElement('b'));
  ['col','row'].forEach(t => {
    const box = $(t === 'col' ? 'colTabs' : 'rowTabs'), word = t === 'col' ? 'Column' : 'Row';
    box.textContent = '';
    if (rot || (t === 'row' && S.set.lines === 'cols')) return;
    for (let i = 0; i < n; i++){
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tab'; b.dataset.t = t; b.dataset.i = i;
      b.setAttribute('aria-label', word + ' ' + (i + 1));
      b.addEventListener('click', () => select(t, i));
      box.appendChild(b);
    }
  });
}

function select(t, i){ S.sel = { t, i }; syncSelection(); }
/* rotate mode: the colour to turn in tile k, keeping the current one unless that colour is plain there. null when the whole tile is plain. */
function colourFor(k, prefer){
  const order = [prefer, ...S.set.turn.map((_, c) => 'c' + c)];
  return order.find(t => !S.lock[+t[1]][k]) || null;
}
function syncSelection(){
  const n = S.set.n, { t, i } = S.sel, p = 100 / n, sel = $('sel'), o = sel.style, rot = rotating();
  if (rot){ o.left = (i % n) * p + '%'; o.top = Math.floor(i / n) * p + '%'; o.width = p + '%'; o.height = p + '%'; }
  else if (t === 'col'){ o.left = i * p + '%'; o.top = '0'; o.width = p + '%'; o.height = '100%'; }
  else { o.left = '0'; o.top = i * p + '%'; o.width = '100%'; o.height = p + '%'; }
  sel.classList.toggle('row', t === 'row');
  document.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-pressed', String(!S.solved && b.dataset.t === t && +b.dataset.i === i)));
  $('lineKind').textContent = rot ? 'Tile' : t === 'col' ? 'Column' : 'Row';
  $('lineNum').textContent = i + 1;
  $('phead').classList.toggle('axis-col', !rot && t === 'col');
  $('nudgeA').setAttribute('aria-label', rot ? 'Turn anticlockwise' : t === 'col' ? 'Move up' : 'Move left');
  $('nudgeB').setAttribute('aria-label', rot ? 'Turn clockwise' : t === 'col' ? 'Move down' : 'Move right');
  if (rot) $('legendMov').textContent = colourOf(t).name;
  refresh();
}
function refresh(){
  const { t, i } = S.sel, hints = S.set.hints, nums = S.set.numbers, rot = rotating();
  document.querySelectorAll('.tab').forEach(b => {
    const bt = b.dataset.t, bi = +b.dataset.i;
    b.textContent = nums ? fmt(wrapSigned(S.cor[bt][bi])) : String(bi + 1);
    b.classList.toggle('ok', hints && lineOk(bt, bi));
  });
  if (rot){
    const cs = S.set.turn.map((_, c) => 'c' + c);
    $('tiles').querySelectorAll('span').forEach((cell, k) => {
      const live = cs.filter(c => !S.lock[+c[1]][k]);
      cell.classList.toggle('flat', !live.length);
      cell.classList.toggle('ok', hints && live.length > 0 && live.every(c => lineOk(c, k)));
      const a = wrapDeg(S.cor[t][k]);
      cell.firstChild.textContent = live.includes(t) && a ? fmt(a) + '°' : '';
    });
    $('turnCh').querySelectorAll('button').forEach(b => {
      const c = b.dataset.t;
      b.setAttribute('aria-pressed', String(c === t));
      b.disabled = S.lock[+c[1]][i];
      b.classList.toggle('ok', hints && !b.disabled && lineOk(c, i));
    });
  }
  $('lineMoved').textContent = rot ? 'turned ' + fmt(wrapDeg(S.cor[t][i])) + '°' : 'moved ' + fmt(wrapSigned(S.cor[t][i])) + ' px';
  $('lineOk').textContent = hints && lineOk(t, i) ? 'Looks right' : '';
  const pct = S.solved ? 100 : Math.min(99, Math.max(0, Math.round(100 * (1 - meanErr(true) / S.initMean))));
  $('matchPct').textContent = pct + '%'; $('bar').style.width = pct + '%';
  $('stTime').textContent = fmtTime(elapsed());
  $('stMoves').textContent = S.moves + (S.moves === 1 ? ' move' : ' moves');
}
const swatchName = c => `<b><span class="swatch" style="background:${c.color}"></span>${c.name}</b>`;
function setTip(){
  const rot = rotating(), thing = rot ? 'tile' : 'line';
  const guide = {
    edges:` While you drag, the ${thing} shows outlines: <b>orange</b> for the picture, <b>cyan</b> for the ${rot ? 'turning' : 'slipping'} colour. Make them meet in white.`,
    boost:` While you drag, the ${thing}’s colours are boosted so the fringes stand out.`
  }[DIFFS[S.set.difficulty].guide] || '';
  if (rot){
    const cs = S.set.turn.map(k => CHANNELS[k]), two = cs.length === 2;
    $('tip').innerHTML = `Drag round a tile to turn it, until the ${cs.map(swatchName).join(' and ')} line${two ? '' : 's'} up with the rest of the picture.`
      + (two ? ' Tap the selected tile, or the buttons above, to switch colour.' : '') + guide;
    return;
  }
  const c = CHANNELS[S.set.channel];
  const what = S.set.lines === 'cols' ? 'Drag a column up or down' : 'Drag a column up or down, or a row sideways,';
  $('tip').innerHTML = `${what} until the ${swatchName(c)} lines up with the rest of the picture.${guide}`;
  $('legendMov').textContent = c.name;
}

function moveLine(t, i, v){
  if (S.solved) return;
  S.cor[t][i] = v;
  startClock(); refresh(); draw();
}
/* with hints on, a line within snap px (a tile within tsnap degrees) clicks into place when you let go */
function settle(t, i){
  if (S.set.hints){
    const e = err(t, i), D = DIFFS[S.set.difficulty];
    if (Math.abs(e) <= (t[0] === 'c' ? D.tsnap : D.snap)){
      if (e !== 0){ S.cor[t][i] -= e; refresh(); draw(); }
      const sel = $('sel'); sel.classList.add('snap'); setTimeout(() => sel.classList.remove('snap'), 350);
    }
  }
  checkWin();
}

/* ---------- dragging on the picture ---------- */
const stage = $('stage');
let drag = null;
function tileAt(e){
  const n = S.set.n, r = stage.getBoundingClientRect();
  return { r, j:Math.min(n - 1, Math.max(0, Math.floor((e.clientX - r.left) / r.width * n))), i:Math.min(n - 1, Math.max(0, Math.floor((e.clientY - r.top) / r.height * n))) };
}
stage.addEventListener('pointerdown', e => {
  if (S.solved || S.peeking || drag) return;
  const { r, i, j } = tileAt(e), n = S.set.n;
  drag = { id:e.pointerId, x0:e.clientX, y0:e.clientY, i, j, axis:null, base:0, scale:SIZE / r.width,
    k:i * n + j, cx:r.left + (j + .5) * r.width / n, cy:r.top + (i + .5) * r.height / n };
  try { stage.setPointerCapture(e.pointerId); } catch (x){}
});
/* rotate mode: the turn follows the finger's angle around the tile centre, summed up so it can go past a full circle */
function turnDrag(e){
  const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
  if (!drag.axis){
    if (Math.hypot(dx, dy) < 7) return;
    const t = colourFor(drag.k, S.sel.t);
    if (!t){ drag.axis = 'none'; return; }
    drag.axis = t; drag.idx = drag.k; drag.base = S.cor[t][drag.k]; drag.acc = 0;
    drag.last = Math.atan2(drag.y0 - drag.cy, drag.x0 - drag.cx);
    select(t, drag.k); S.moves++; showGuide(t, drag.k);
    stage.classList.add('dragging'); stage.classList.remove('fresh');
  }
  if (drag.axis === 'none' || Math.hypot(e.clientX - drag.cx, e.clientY - drag.cy) < 6) return;
  const a = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx);
  let d = a - drag.last; if (d > Math.PI) d -= 2 * Math.PI; else if (d < -Math.PI) d += 2 * Math.PI;
  drag.acc += d; drag.last = a;
  moveLine(drag.axis, drag.idx, Math.round(drag.base + drag.acc * 180 / Math.PI));
}
stage.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id) return;
  if (rotating()) return turnDrag(e);
  const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
  if (!drag.axis){
    if (Math.hypot(dx, dy) < 7) return;
    const axis = S.set.lines === 'both' && Math.abs(dx) > Math.abs(dy) ? 'row' : 'col';
    const idx = axis === 'row' ? drag.i : drag.j;
    drag.axis = axis; drag.idx = idx; drag.base = S.cor[axis][idx];
    select(axis, idx); S.moves++; showGuide(axis, idx);
    stage.classList.add('dragging'); stage.classList.remove('fresh');
  }
  const d = drag.axis === 'row' ? dx : dy;
  moveLine(drag.axis, drag.idx, Math.round(drag.base + d * drag.scale));
});
function endDrag(e, cancelled){
  if (!drag || e.pointerId !== drag.id) return;
  const d = drag; drag = null;
  stage.classList.remove('dragging');
  if (d.axis === 'none') return;
  if (d.axis){ hideGuide(350); settle(d.axis, d.idx); }
  else if (!cancelled && !S.solved && rotating()){
    /* a tap picks the tile; tapping the selected tile again switches to the other colour */
    const other = S.set.turn.length === 2 && S.sel.i === d.k ? (S.sel.t === 'c0' ? 'c1' : 'c0') : S.sel.t, t = colourFor(d.k, other);
    if (t) select(t, d.k);
  }
  else if (!cancelled && !S.solved){
    /* a tap picks the column; tapping inside the selected column picks the row instead */
    if (S.set.lines === 'both' && S.sel.t === 'col' && S.sel.i === d.j) select('row', d.i);
    else select('col', d.j);
  }
}
stage.addEventListener('pointerup', e => endDrag(e, false));
stage.addEventListener('pointercancel', e => endDrag(e, true));
stage.addEventListener('keydown', e => {
  const map = { ArrowUp:['col',-1], ArrowDown:['col',1], ArrowLeft:['row',-1], ArrowRight:['row',1] }, m = map[e.key];
  if (!m || S.solved) return;
  if (rotating()){ if (m[0] === 'row'){ e.preventDefault(); nudge(m[1]); } return; }
  if (m[0] !== S.sel.t) return;
  e.preventDefault(); nudge(m[1]);
});

/* ---------- fine-tune buttons (1 px per tap, repeats while held) ---------- */
function nudge(d){
  const { t, i } = S.sel;
  if (S.solved) return;
  showGuide(t, i); hideGuide(700);
  S.moves++; moveLine(t, i, S.cor[t][i] + d); checkWin();
}
[[$('nudgeA'), -1], [$('nudgeB'), 1]].forEach(([btn, d]) => {
  let hold = 0, iv = 0, repeated = false;
  const stop = () => { clearTimeout(hold); clearInterval(iv); };
  btn.addEventListener('pointerdown', () => { repeated = false; stop(); hold = setTimeout(() => { repeated = true; iv = setInterval(() => nudge(d), 60); }, 380); });
  ['pointerup','pointerleave','pointercancel'].forEach(ev => btn.addEventListener(ev, stop));
  btn.addEventListener('click', () => { if (repeated){ repeated = false; return; } nudge(d); });
  btn.addEventListener('contextmenu', e => e.preventDefault());
});

/* ---------- game flow ---------- */
function checkWin(){
  if (S.solved) return;
  if (!activeLines().every(([t, i]) => lineOk(t, i))) return;
  S.solved = true; stopClock();
  clearTimeout(guideTimer); S.guide = null; stage.classList.remove('guiding');
  for (const t in S.scr) S.cor[t] = S.scr[t].map(v => -v);
  paint(); syncSelection();
  stage.classList.remove('shine'); void stage.offsetWidth; stage.classList.add('solved', 'shine');
  setTimeout(showWin, 450);
}
function showWin(){
  const { scene, n, lines, difficulty } = S.set, name = nameOf(scene), rot = rotating();
  $('wTitle').textContent = name;
  $('wTime').textContent = fmtTime(S.elapsed);
  $('wMoves').textContent = S.moves;
  $('wPeeks').textContent = S.peeks;
  let msg;
  if (scene !== 'up'){
    const key = rot ? `turn|${name}|${n}|${S.set.turn.join('')}|${difficulty}` : `slip|${name}|${n}|${lines}|${difficulty}`;
    const all = store.get('untint.best', {}), prev = all[key], t = Math.round(S.elapsed);
    const where = `${name} at ${n}×${n}, ${difficulty}` + (rot ? `, turning ${S.set.turn.map(k => CHANNELS[k].name).join(' and ')}` : lines === 'cols' ? ', columns only' : '');
    if (!prev || t < prev.time){ all[key] = { time:t, moves:S.moves }; store.set('untint.best', all); }
    msg = !prev ? `First solve of ${where}.` : t < prev.time ? `New best for ${where}. Old best was ${fmtTime(prev.time)}.` : `Your best for ${where} is ${fmtTime(prev.time)}.`;
  } else msg = 'Your own photo, back in register.';
  $('wBest').textContent = msg;
  $('wBigger').hidden = n >= 6;
  $('wBigger').textContent = `Try ${n + 1}×${n + 1}`;
  $('play').hidden = true; $('win').hidden = false;
}
function newPuzzle(){
  if (S.set.scene === 'up' && !uploadCanvas) S.set.scene = 0;
  const n = S.set.n;
  S.scr = rotating() ? makeTurns(n, S.set.turn.length, S.set.difficulty) : makeScramble(n, S.set.lines, S.set.difficulty);
  S.cor = {}; for (const t in S.scr) S.cor[t] = new Array(S.scr[t].length).fill(0);
  S.sel = rotating() ? { t:'c0', i:0 } : { t:'col', i:0 }; S.moves = 0; S.peeks = 0; S.elapsed = 0; S.running = false; S.solved = false;
  startGame();
  stage.classList.add('fresh');
}
function startGame(){
  const { n, channel, lines, difficulty } = S.set, rot = rotating();
  loadSource(); computeEdges(); buildBoard();
  if (rot){
    S.lock = computeLock();
    S.lock.forEach((L, c) => L.forEach((flat, k) => { if (flat){ S.scr['c' + c][k] = 0; S.cor['c' + c][k] = 0; } }));
    if (!colourFor(S.sel.i, S.sel.t) || S.lock[+S.sel.t[1]][S.sel.i]){
      const first = activeLines()[0]; if (first) S.sel = { t:first[0], i:first[1] };
    }
    const box = $('turnCh'); box.textContent = '';
    box.hidden = S.set.turn.length < 2;
    S.set.turn.forEach((key, c) => {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.t = 'c' + c;
      b.innerHTML = `<span class="swatch" style="background:${CHANNELS[key].color}"></span>${CHANNELS[key].name[0].toUpperCase() + CHANNELS[key].name.slice(1)}`;
      b.addEventListener('click', () => { if (!S.solved) select('c' + c, S.sel.i); });
      box.appendChild(b);
    });
  } else $('turnCh').hidden = true;
  S.initMean = Math.max(1, meanErr(false));
  clearTimeout(guideTimer); S.guide = null;
  stage.classList.remove('solved', 'shine', 'guiding');
  stage.classList.toggle('g-edges', DIFFS[difficulty].guide === 'edges');
  $('win').hidden = true; $('play').hidden = false;
  const what = rot ? 'turn ' + S.set.turn.map(k => CHANNELS[k].name).join('+') : CHANNELS[channel].name + (lines === 'cols' ? ' · columns' : '');
  $('sceneBtn').textContent = `${nameOf(S.set.scene)} · ${n}×${n} · ${what} · ${difficulty}`;
  $('resetBtn').textContent = rot ? 'Reset tile' : 'Reset line';
  stage.setAttribute('aria-label', rot
    ? 'Puzzle picture. Drag round a tile to turn it. Left and right arrow keys turn the selected tile.'
    : 'Puzzle picture. Drag a column up or down, or a row sideways. Arrow keys move the selected line.');
  setTip(); applyPrefs();
  syncSelection(); paint();
  if (rot) checkWin();
}
function applyPrefs(){ document.body.classList.toggle('nonum', !S.set.numbers); $('meter').hidden = !S.set.hints; }

$('resetBtn').addEventListener('click', () => {
  const { t, i } = S.sel;
  if (S.solved) return;
  if (rotating()){
    /* puts back every colour of the tile, not only the selected one */
    const turned = Object.keys(S.cor).filter(c => S.cor[c][i] !== 0);
    if (!turned.length) return;
    turned.forEach(c => { S.cor[c][i] = 0; });
    S.moves++; startClock(); refresh(); draw();
    return;
  }
  if (S.cor[t][i] === 0) return;
  S.moves++; moveLine(t, i, 0);
});

const peek = $('peekBtn');
function startPeek(){ if (S.solved || S.peeking) return; S.peeking = true; S.peeks++; stage.classList.add('peeking'); peek.classList.add('on'); draw(); }
function endPeek(){ if (!S.peeking) return; S.peeking = false; stage.classList.remove('peeking'); peek.classList.remove('on'); draw(); }
peek.addEventListener('pointerdown', e => { e.preventDefault(); try { peek.setPointerCapture(e.pointerId); } catch (x){} startPeek(); });
['pointerup','pointercancel','lostpointercapture'].forEach(ev => peek.addEventListener(ev, endPeek));
peek.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat){ e.preventDefault(); startPeek(); } });
peek.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') endPeek(); });
peek.addEventListener('blur', endPeek);
peek.addEventListener('contextmenu', e => e.preventDefault());

$('wNext').addEventListener('click', () => { S.set.scene = S.set.scene === 'up' ? 0 : (S.set.scene + 1) % SCENES.length; saveSettings(); newPuzzle(); });
$('wBigger').addEventListener('click', () => { S.set.n = Math.min(6, S.set.n + 1); saveSettings(); newPuzzle(); });

/* ---------- settings sheet ---------- */
let pending = null, lastFocus = null;
function openSheet(){
  lastFocus = document.activeElement;
  pending = { scene:S.set.scene, n:S.set.n, mode:S.set.mode, channel:S.set.channel, turn:S.set.turn.slice(), lines:S.set.lines, difficulty:S.set.difficulty };
  $('upErr').hidden = true;
  renderPics(); syncSeg();
  $('optNumbers').checked = S.set.numbers; $('optHints').checked = S.set.hints;
  $('sheet').hidden = false; $('startBtn').focus();
}
function closeSheet(){ $('sheet').hidden = true; if (lastFocus) lastFocus.focus(); }
function renderPics(){
  const box = $('pics'); box.textContent = '';
  const keys = SCENES.map((_, k) => k); if (uploadCanvas) keys.push('up');
  keys.forEach(k => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pic'; b.dataset.k = k;
    b.setAttribute('aria-pressed', String(pending.scene === k));
    const c = document.createElement('canvas'); c.width = c.height = 160; c.getContext('2d').drawImage(sceneCanvas(k), 0, 0, 160, 160);
    const s = document.createElement('span'); s.textContent = nameOf(k);
    b.append(c, s);
    b.addEventListener('click', () => { pending.scene = k; box.querySelectorAll('.pic[data-k]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
    box.appendChild(b);
  });
  const up = document.createElement('button'); up.type = 'button'; up.className = 'pic';
  up.innerHTML = '<span class="up" aria-hidden="true">+</span><span>' + (uploadCanvas ? 'Another photo' : 'Add your photo') + '</span>';
  up.addEventListener('click', () => $('file').click());
  box.appendChild(up);
}
const DIFF_NOTES = {
  slide:  { easy:'Outline guide, big slips', medium:'Colour boost', hard:'No guide, small slips' },
  rotate: { easy:'Outline guide, big turns', medium:'Colour boost', hard:'No guide, small turns' }
};
function syncSeg(){
  const rot = pending.mode === 'rotate';
  $('segMode').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === pending.mode)));
  $('segGrid').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.n === pending.n)));
  $('segCh').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(rot ? pending.turn.includes(b.dataset.ch) : b.dataset.ch === pending.channel)));
  $('segLines').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lines === pending.lines)));
  $('segDiff').querySelectorAll('button').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.diff === pending.difficulty));
    b.querySelector('small').textContent = DIFF_NOTES[pending.mode][b.dataset.diff];
  });
  $('chLabel').textContent = rot ? 'Colours that turn' : 'Colour that slips';
  $('chNote').hidden = !rot;
  $('linesField').hidden = rot;
}
$('segMode').addEventListener('click', e => { const b = e.target.closest('button'); if (b){ pending.mode = b.dataset.mode; syncSeg(); } });
$('segDiff').addEventListener('click', e => { const b = e.target.closest('button'); if (b){ pending.difficulty = b.dataset.diff; syncSeg(); } });
$('segGrid').addEventListener('click', e => { const b = e.target.closest('button'); if (b){ pending.n = +b.dataset.n; syncSeg(); } });
/* rotate mode takes one or two colours: tapping a colour adds or removes it, and a third one replaces the earliest pick */
$('segCh').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const ch = b.dataset.ch;
  if (pending.mode !== 'rotate') pending.channel = ch;
  else if (pending.turn.includes(ch)){ if (pending.turn.length > 1) pending.turn = pending.turn.filter(k => k !== ch); }
  else pending.turn = [...pending.turn, ch].slice(-2);
  syncSeg();
});
$('segLines').addEventListener('click', e => { const b = e.target.closest('button'); if (b){ pending.lines = b.dataset.lines; syncSeg(); } });
$('file').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0]; e.target.value = '';
  if (!f) return;
  const fail = () => { $('upErr').textContent = 'That file could not be opened as a picture. Try a JPG or PNG.'; $('upErr').hidden = false; };
  const fr = new FileReader();
  fr.onerror = fail;
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = SIZE;
      const s = Math.min(img.naturalWidth, img.naturalHeight);
      c.getContext('2d').drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, SIZE, SIZE);
      uploadCanvas = c; pending.scene = 'up'; $('upErr').hidden = true; renderPics();
    };
    img.onerror = fail;
    img.src = fr.result;
  };
  fr.readAsDataURL(f);
});
$('optNumbers').addEventListener('change', e => { S.set.numbers = e.target.checked; saveSettings(); applyPrefs(); refresh(); });
$('optHints').addEventListener('change', e => { S.set.hints = e.target.checked; saveSettings(); applyPrefs(); refresh(); });
$('startBtn').addEventListener('click', () => {
  Object.assign(S.set, pending, { turn:['r','g','b'].filter(k => pending.turn.includes(k)) });
  saveSettings(); closeSheet(); newPuzzle();
});
$('closeSheet').addEventListener('click', closeSheet);
$('sheet').addEventListener('click', e => { if (e.target === $('sheet')) closeSheet(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('sheet').hidden) closeSheet(); });
$('setBtn').addEventListener('click', openSheet);
$('newBtn').addEventListener('click', openSheet);
$('sceneBtn').addEventListener('click', openSheet);

/* ---------- install (Android/desktop prompt, or the iPhone Share-menu hint) ---------- */
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let installPrompt = null;
function syncInstall(){
  const row = $('installRow');
  if (standalone()){ row.hidden = true; return; }
  if (installPrompt){ row.hidden = false; $('installBtn').hidden = false; $('installHint').textContent = 'Play full-screen and offline, from your home screen.'; }
  else if (isIOS){ row.hidden = false; $('installBtn').hidden = true; $('installHint').textContent = 'In Safari, tap Share, then Add to Home Screen.'; }
  else row.hidden = true;
}
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; syncInstall(); });
window.addEventListener('appinstalled', () => { installPrompt = null; syncInstall(); });
$('installBtn').addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  try { await installPrompt.userChoice; } catch (e){}
  installPrompt = null; syncInstall();
});
syncInstall();

if ('serviceWorker' in navigator && location.protocol !== 'file:'){
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}

/* ---------- boot (a game in progress is saved when the app goes to the background) ---------- */
function snapshot(){
  const keep = S.set.scene !== 'up' && !S.solved;
  return { set:Object.assign({}, S.set, { scene:S.set.scene === 'up' ? 0 : S.set.scene }),
    game:keep ? { kind:rotating() ? 'turn' : 'slip', scr:S.scr, cor:S.cor, sel:S.sel, moves:S.moves, peeks:S.peeks, elapsed:Math.round(elapsed()) } : null };
}
/* a saved game only resumes when it matches the saved settings: same mode, grid and number of turning colours */
function fits(g){
  if (!g || !g.scr || !g.cor || !g.sel) return false;
  const n = S.set.n, keys = rotating() ? S.set.turn.map((_, c) => 'c' + c) : ['row', 'col'], len = rotating() ? n * n : n;
  return g.kind === (rotating() ? 'turn' : 'slip') && Object.keys(g.scr).length === keys.length
    && keys.every(t => Array.isArray(g.scr[t]) && g.scr[t].length === len && Array.isArray(g.cor[t]) && g.cor[t].length === len)
    && keys.includes(g.sel.t) && g.sel.i >= 0 && g.sel.i < len;
}
function start(data){
  data = data || {};
  if (data.set) S.set = cleanSettings(data.set);
  const g = data.game;
  if (fits(g)){
    Object.assign(S, { scr:g.scr, cor:g.cor, sel:g.sel, moves:g.moves | 0, peeks:g.peeks | 0, elapsed:g.elapsed || 0, running:false, solved:false });
    startGame();
    if (S.moves > 0) stage.classList.remove('fresh');
  } else newPuzzle();
}
const saveGame = () => store.set('untint.game', snapshot());
document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); });
window.addEventListener('pagehide', saveGame);
start(store.get('untint.game', {}));
})();
