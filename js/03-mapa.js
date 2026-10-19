// Mapa: canvas, câmera, listas do mundo (monstros, projéteis...), efeitos (log/txt/part/ring), chão, decoração, vila e entrada nos mapas.
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- RUNTIME ---------- */
const cv = $('#cv'), ctx = cv.getContext('2d');
let cw = 360, ch = 480, dpr = 1, zoom = 1;
function resize(){
  const r = cv.parentElement.getBoundingClientRect();
  dpr = Math.min(2, window.devicePixelRatio || 1);
  cw = Math.max(1, r.width); ch = Math.max(1, r.height);
  cv.width = Math.round(cw*dpr); cv.height = Math.round(ch*dpr);
  cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
  zoom = clamp(Math.min(cw/500, ch/520), .66, 1.3);
}
if(window.ResizeObserver) new ResizeObserver(resize).observe(cv.parentElement); else window.addEventListener('resize', resize);
resize();

let scene = 'map', mode = 'hunt', mapDef = MAPS[0], WORLD = {w:W_MAP, h:W_MAP};
// whirl = Giro de Lâmina em andamento, dash = Investida em andamento (Guerreiro)
const hero = {x:900,y:900,hp:ST.life,face:0,walkT:0,moving:false,hit:0,scale:1,alpha:1,atk:null,cast:null,kite:0,whirl:null,dash:null};
let mons = [], projs = [], clouds = [], drops = [], coins = [], parts = [], texts = [], later = [], decor = [], rings = [];
const cds = {}; for(const id in SKD) if(SKD[id].act) cds[id] = 0;
let portal = null, trans = null, fade = 0, townWait = 0, deadT = 0, T = 0, spawnT = 0, groundPat = null, townPat = null;
const cam = {x:900, y:900};
const FOUNT = {x:350,y:400}, TPORT = {x:350,y:600};

function log(msg, color){
  const el = $('#log'), d = document.createElement('div');
  d.textContent = msg; if(color) d.style.color = color;
  el.appendChild(d);
  while(el.children.length > 4) el.removeChild(el.firstChild);
  setTimeout(() => d.remove(), 5000);
}
function txt(x, y, s, c, size, vy){ if(texts.length > 70) texts.shift(); texts.push({x, y, s, c, size:size||13, t:0, vy:vy||-38}); }
function part(o){ if(parts.length > 420) parts.shift(); parts.push(Object.assign({vx:0,vy:0,life:.6,t:0,size:2,grav:0,kind:'dot'}, o)); }
function ring(x, y, r, c, life, w){ rings.push({x, y, r, c, life:life||.5, t:0, w:w||3}); }

/* ---------- MUNDO ---------- */
function rng(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function makeGround(md){
  const N = 256, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'), R = rng(md.seed);
  g.fillStyle = md.ground[0]; g.fillRect(0, 0, N, N);
  const blob = (x, y, r, col, al) => { g.globalAlpha = al; g.fillStyle = col; for(const ox of [-N,0,N]) for(const oy of [-N,0,N]){ g.beginPath(); g.arc(x+ox, y+oy, r, 0, TAU); g.fill(); } };
  for(let i = 0; i < 80; i++) blob(R()*N, R()*N, 8 + R()*30, R() < .5 ? md.ground[1] : md.ground[2], .35);
  for(let i = 0; i < 240; i++) blob(R()*N, R()*N, .6 + R()*1.5, R() < .5 ? md.ground[1] : '#000', .45);
  g.globalAlpha = 1;
  if(md.decor === 'crypt' || md.decor === 'citadel'){
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 2;
    for(let row = 0; row < 4; row++){ const y = row*64; g.beginPath(); g.moveTo(0,y); g.lineTo(N,y); g.stroke(); for(let k = 0; k < 5; k++){ const x = (row%2)*32 + k*64; g.beginPath(); g.moveTo(x,y); g.lineTo(x,y+64); g.stroke(); } }
  } else if(md.decor === 'hell'){
    g.strokeStyle = 'rgba(120,40,18,.5)'; g.lineWidth = 1.5;
    for(let i = 0; i < 10; i++){ let x = R()*N, y = R()*N; g.beginPath(); g.moveTo(x,y); for(let j = 0; j < 4; j++){ x += rnd(-20,20); y += rnd(-20,20); g.lineTo(x,y); } g.stroke(); }
  } else {
    g.strokeStyle = md.tuft; g.globalAlpha = .5; g.lineWidth = 1;
    for(let i = 0; i < 120; i++){ const x = R()*N, y = R()*N; g.beginPath(); g.moveTo(x,y); g.lineTo(x + rnd(-2,2), y - 3 - R()*4); g.stroke(); }
    g.globalAlpha = 1;
  }
  return ctx.createPattern(c, 'repeat');
}
function makeDecor(md){
  const R = rng(md.seed*7), out = [];
  const add = (t, n) => { for(let i = 0; i < n; i++){ const o = {t, x:60 + R()*(W_MAP-120), y:60 + R()*(W_MAP-120), s:.7 + R()*.7, v:R()}; if(t === 'lava'){ o.pts = []; let x = 0, y = 0; for(let j = 0; j < 5; j++){ o.pts.push([x,y]); x += (R()-.5)*60; y += (R()-.5)*60; } } out.push(o); } };
  ({field:()=>{add('wheat',70);add('rock',22);add('tuft',80);add('fence',14);},
    forest:()=>{add('tree',60);add('bush',40);add('rock',15);add('tuft',60);},
    swamp:()=>{add('puddle',45);add('reed',60);add('deadtree',20);add('tuft',30);},
    mine:()=>{add('rock',40);add('crystal',30);add('fence',16);add('bones',20);},
    crypt:()=>{add('pillar',34);add('tomb',36);add('bones',40);},
    ice:()=>{add('pine',55);add('rock',30);add('tuft',40);},
    desert:()=>{add('rock',35);add('pillar',14);add('deadtree',18);add('skull',22);add('bones',25);},
    citadel:()=>{add('pillar',40);add('tomb',20);add('skull',26);add('crystal',14);},
    hell:()=>{add('lava',40);add('rock',30);add('skull',24);}})[md.decor]();
  out.sort((a, b) => a.y - b.y);
  return out;
}
function makeTown(){
  const N = 192, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'), R = rng(5);
  g.fillStyle = '#26221d'; g.fillRect(0,0,N,N);
  for(let y = 0; y < N; y += 24) for(let x = 0; x < N; x += 24){
    const ox = (y/24)%2 ? 12 : 0; g.fillStyle = R() < .5 ? '#3c362e' : '#433c33';
    g.beginPath(); g.roundRect ? g.roundRect(x+ox+1+R()*2, y+1+R()*2, 20, 19, 5) : g.rect(x+ox+1, y+1, 20, 19); g.fill();
    if(x + ox + 24 > N){ g.beginPath(); g.roundRect ? g.roundRect(x+ox-N+1, y+1, 20, 19, 5) : g.rect(x+ox-N+1, y+1, 20, 19); g.fill(); }
  }
  return ctx.createPattern(c, 'repeat');
}
function makeMon(type, x, y, ml, elite){
  const d = MONS[type], hpMax = d.hp * (14 + ml*9 + ml*ml*.7 + ml*ml*ml*.025) * (elite ? 3.2 : 1);
  return {type, d, x, y, ml, elite, hp:hpMax, hpMax, r:d.r*(elite?1.3:1), dmg:d.dmg*(3 + ml*1.5 + ml*ml*.02)*(elite?1.5:1), spd:d.spd*(elite?1.05:1),
    acd:rnd(0,1), atkT:0, fired:false, face:rnd(0,TAU), anim:rnd(0,9), hit:0, poisons:[], bleeds:[], burns:[], pAcc:0, pT:.6, aggro:false, moving:false, wx:x, wy:y, wt:0, dead:false, deadT:0,
    name: elite ? `${d.n} ${pick(ELITE_TAG)}` : d.n};
}
// Primeiro mapa: criaturas sozinhas e longe umas das outras (difícil pegar duas de uma vez).
// Demais mapas: sozinha (35%), dupla (30%) ou grupo de 3 a 5 (35%).
const SOLO_MAP = 'campos', SOLO_GAP = 260;
const packSize = () => { if(mapDef.id === SOLO_MAP) return 1; const r = Math.random(); return r < .35 ? 1 : r < .65 ? 2 : rint(3, 5); };
function spawnPack(initial){
  const solo = mapDef.id === SOLO_MAP;
  let x, y, tries = 0, ok;
  do{
    const a = Math.random()*TAU, dd = initial ? rnd(280, 800) : rnd(460, 850); x = hero.x + Math.cos(a)*dd; y = hero.y + Math.sin(a)*dd; tries++;
    ok = x >= 80 && y >= 80 && x <= W_MAP-80 && y <= W_MAP-80 && (!solo || !mons.some(m => !m.dead && D(m, {x, y}) < SOLO_GAP));
  } while(!ok && tries < 40);
  if(!ok && solo) return; // sem lugar longe o bastante: tenta de novo no próximo spawn
  x = clamp(x, 80, W_MAP-80); y = clamp(y, 80, W_MAP-80);
  const n = packSize(), eliteIdx = Math.random() < (n === 1 ? .04 : .1) ? 0 : -1, main = pick(mapDef.mons);
  for(let i = 0; i < n; i++){
    const t = Math.random() < .7 ? main : pick(mapDef.mons);
    mons.push(makeMon(t, x + rnd(-50,50), y + rnd(-50,50), rint(mapDef.lv[0], mapDef.lv[1]), i === eliteIdx));
  }
}
function clearWorld(){ mons = []; projs = []; clouds = []; drops = []; coins = []; parts = []; texts = []; later = []; rings = []; portal = null; }
function enterMap(id){
  mapDef = MAPS.find(m => m.id === id) || MAPS[0]; S.map = mapDef.id;
  scene = 'map'; mode = 'hunt'; WORLD = {w:W_MAP, h:W_MAP}; clearWorld();
  hero.x = W_MAP/2; hero.y = W_MAP/2; hero.scale = 1; hero.alpha = 1; hero.atk = hero.cast = hero.whirl = hero.dash = null; hero.kite = 0;
  cam.x = hero.x; cam.y = hero.y;
  groundPat = makeGround(mapDef); decor = makeDecor(mapDef);
  for(let i = 0; i < (mapDef.id === SOLO_MAP ? 9 : 7); i++) spawnPack(true);
  ring(hero.x, hero.y, 50, '#8ab4ff', .6, 4);
  log(`Caçando em ${mapDef.name}`, '#c9e6a0');
  const xm = xpMult(mapDef); if(xm < 1) log(`Mapa abaixo do seu nível: XP reduzida em ${Math.round((1 - xm)*100)}%`, '#ff8c80');
  dirtyPanel();
}
function enterTown(){
  scene = 'town'; mode = 'townWalk'; WORLD = {w:700, h:720}; clearWorld(); decor = [];
  hero.x = TPORT.x; hero.y = TPORT.y - 10; hero.scale = 1; hero.alpha = 1; hero.face = -Math.PI/2; hero.atk = hero.cast = hero.whirl = hero.dash = null;
  cam.x = hero.x; cam.y = hero.y - 60; townWait = 0;
  if(!townPat) townPat = makeTown();
  if(S.char){ rollShop(); log('O mercador trouxe 3 itens novos', '#e2ae4a'); }
  if(S.cfg.autoSell) sellWhere(it => it.rar === 0, true);
  dirtyPanel(); save();
}
function startPortal(dest, reason){
  if(mode === 'portal' || trans) return;
  mode = 'portal'; hero.atk = null; hero.cast = null; hero.whirl = hero.dash = null; hero.moving = false;
  const px = clamp(hero.x + 34, 30, WORLD.w - 30), py = clamp(hero.y - 14, 30, WORLD.h - 30);
  portal = {x:px, y:py, t:0, dest};
  if(reason) log(reason, '#9fc2ff');
}
function transition(fn){ if(trans) return; trans = {t:0, fn, did:false}; }
function depart(){ if(scene !== 'town' || mode === 'townLeave' || trans) return; mode = 'townLeave'; townWait = 0; }
