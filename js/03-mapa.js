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
const hero = {x:900,y:900,hp:ST.life,face:0,walkT:0,moving:false,hit:0,scale:1,alpha:1,atk:null,cast:null,kite:0,whirl:null,dash:null,dodge:null,invul:0};
let mons = [], projs = [], clouds = [], drops = [], coins = [], parts = [], texts = [], later = [], decor = [], rings = [];
const cds = {dodge:0}; for(const id in SKD) if(SKD[id].act) cds[id] = 0;
let zones = []; // áreas marcadas no chão pelas criaturas (MON_AOE)
// townGoal = ponto para onde o herói anda na vila (toque/clique); townZone = porta em que ele está; townIdle = ainda não mexeu desde que chegou
let townGoal = null, townZone = null, townIdle = true, townArmed = false;
let portal = null, trans = null, fade = 0, townWait = 0, deadT = 0, T = 0, spawnT = 0, groundPat = null, townPat = null;
const cam = {x:900, y:900};
/* ---------- VILA (andar sempre manual) ---------- */
// Prédios: (x, y) = meio da base da parede da frente; w/h = largura/altura da frente; dep = profundidade (lado direito e telhado vão para trás).
// tab = painel que abre ao chegar na porta (zona de raio 42 na frente da porta). Os prédios bloqueiam a passagem (townBlocked).
const TOWN_W = 1100, TOWN_H = 960;
const FOUNT = {x:550, y:500}, TPORT = {x:550, y:880}, DPORT = {x:900, y:830};
// Tobias, o colecionador: NPC da praça que vende o Baú de Visuais (aba 'chest')
const NPC_CHEST = {x:380, y:780, n:'Tobias'};
const TOWN_B = [
  {id:'casa1', x:190, y:250, w:150, h:88, dep:70, wall:'#b8a284', roof:'#7a3a2a'},
  {id:'prefeitura', x:550, y:215, w:210, h:118, dep:80, wall:'#c4b49a', roof:'#3e4a6a', tower:1},
  {id:'casa2', x:910, y:250, w:150, h:88, dep:70, wall:'#a99478', roof:'#5a6a3a'},
  {id:'shop', x:205, y:540, w:160, h:92, dep:72, wall:'#c2a27a', roof:'#8a2f2a', tab:'shop', n:'Mercador', stall:1},
  {id:'forge', x:890, y:540, w:170, h:96, dep:76, wall:'#7a7068', roof:'#3a3430', tab:'forge', n:'Forja', smithy:1},
  {id:'stash', x:205, y:830, w:150, h:80, dep:66, wall:'#8a6a48', roof:'#5a3a22', tab:'stash', n:'Armazém', barn:1},
];
// Zonas de entrada: porta de cada prédio com painel, mais o portal da Masmorra (nível 40)
const townZones = () => {
  const z = TOWN_B.filter(b => b.tab).map(b => ({id:b.id, tab:b.tab, n:b.n, x:b.x, y:b.y + 34, r:42}));
  z.push({id:'chest', tab:'chest', n:NPC_CHEST.n, x:NPC_CHEST.x, y:NPC_CHEST.y + 26, r:36});
  if(S.lv >= MAX_LV) z.push({id:'dun', tab:'dun', n:'Masmorra', x:DPORT.x, y:DPORT.y + 6, r:40});
  return z;
};
// Colisão: caixas dos prédios (frente + fundo) e a fonte
function townBlocked(x, y){
  if(x < 30 || y < 120 || x > TOWN_W - 30 || y > TOWN_H - 30) return true;
  for(const b of TOWN_B){ const back = b.dep*.45 + 30; if(x > b.x - b.w/2 - 8 && x < b.x + b.w/2 + b.dep*.6 + 4 && y > b.y - back && y < b.y + 8) return true; }
  if(Math.hypot((x - FOUNT.x)/1.25, y - FOUNT.y + 6) < 62) return true;
  return false;
}

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
    const m = makeMon(t, x + rnd(-50,50), y + rnd(-50,50), rint(mapDef.lv[0], mapDef.lv[1]), i === eliteIdx);
    if(inDun()){ const k = dunMult(S.dun.phase); m.hpMax *= k; m.hp = m.hpMax; m.dmg *= k; }
    mons.push(m);
  }
}
// Masmorra: entra numa fase (S.dun.phase) com 0 abates; inDun() diz se o herói está lá
const inDun = () => scene === 'map' && mapDef === DUN;
function enterDungeon(phase){
  if(S.lv < MAX_LV) return;
  S.dun.phase = clamp(phase || 1, 1, S.dun.best + 1); S.dun.kills = 0;
  enterMap(DUN.id);
}
function clearWorld(){ zones = []; hero.dodge = null; hero.invul = 0; mons = []; projs = []; clouds = []; drops = []; coins = []; parts = []; texts = []; later = []; rings = []; portal = null; }
function enterMap(id){
  // A Masmorra não muda S.map (o mapa de caça normal continua o mesmo para quando sair dela)
  if(id === DUN.id && S.dun.phase > 0) mapDef = DUN;
  else { mapDef = MAPS.find(m => m.id === id) || MAPS[0]; S.map = mapDef.id; S.dun.phase = 0; }
  scene = 'map'; mode = 'hunt'; WORLD = {w:W_MAP, h:W_MAP}; clearWorld();
  hero.x = W_MAP/2; hero.y = W_MAP/2; hero.scale = 1; hero.alpha = 1; hero.atk = hero.cast = hero.whirl = hero.dash = null; hero.kite = 0;
  cam.x = hero.x; cam.y = hero.y;
  groundPat = makeGround(mapDef); decor = makeDecor(mapDef);
  for(let i = 0; i < (mapDef.id === SOLO_MAP ? 9 : 7); i++) spawnPack(true);
  ring(hero.x, hero.y, 50, '#8ab4ff', .6, 4);
  if(mapDef === DUN){ log(`Masmorra · fase ${S.dun.phase}: mate ${DUN_KILLS} criaturas`, '#d9a0ff'); dirtyPanel(); return; }
  log(`Caçando em ${mapDef.name}`, '#c9e6a0');
  const xm = xpMult(mapDef); if(xm < 1) log(`Mapa abaixo do seu nível: XP reduzida em ${Math.round((1 - xm)*100)}%`, '#ff8c80');
  dirtyPanel();
}
function enterTown(){
  if(S.dun && S.dun.phase > 0){ log(`Corrida na Masmorra encerrada na fase ${S.dun.phase} (melhor: ${S.dun.best} concluídas)`, '#d9a0ff'); S.dun.phase = 0; S.dun.kills = 0; }
  scene = 'town'; mode = 'town'; WORLD = {w:TOWN_W, h:TOWN_H}; clearWorld(); decor = [];
  hero.x = TPORT.x; hero.y = TPORT.y - 40; hero.scale = 1; hero.alpha = 1; hero.face = -Math.PI/2; hero.atk = hero.cast = hero.whirl = hero.dash = null; hero.moving = false;
  cam.x = hero.x; cam.y = hero.y - 40; townWait = 0; townGoal = null; townZone = null; townIdle = true; townArmed = false;
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
// Partir: perto do portal da vila anda até ele; longe, abre um portal ao lado do herói (townExit)
let townExit = TPORT;
function depart(){
  if(scene !== 'town' || mode === 'townLeave' || trans) return;
  townExit = D(hero, TPORT) < 140 ? TPORT : {x:clamp(hero.x + 40, 40, TOWN_W - 40), y:clamp(hero.y - 6, 130, TOWN_H - 40), temp:1};
  mode = 'townLeave'; townWait = 0; townGoal = null;
}
