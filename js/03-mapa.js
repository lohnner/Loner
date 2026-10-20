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
/* ---------- MAPA EM SALAS (sempre aleatório) ---------- */
// Grade de LV_N×LV_N ladrilhos de TILE px. A cada entrada: 4×4 células, uma sala em cada, ligadas por um labirinto
// (árvore aleatória + 2 voltas extras) com corredores de 2 ladrilhos; 2–4 salas da ponta somem para variar o formato.
// LV.g: 0 = parede/vazio, 1 = chão, 2 = chão com obstáculo (bloqueia). LV.seen = ladrilhos já vistos (minimapa).
const TILE = 60, LV_N = 40, LV_CELL = 10;
let LV = null;
// Obstáculos (bloqueiam) e enfeites do chão (não bloqueiam) por tipo de mapa — desenhados por drawDecor (07)
const LV_SOLID = {field:['rock','tree'], forest:['tree','tree','rock'], swamp:['deadtree','rock'], mine:['crystal','rock'], crypt:['pillar','tomb'], ice:['pine','rock'], desert:['rock','pillar','deadtree'], citadel:['pillar','crystal'], hell:['rock','pillar']};
const LV_DECO = {field:['wheat','tuft','wheat'], forest:['bush','tuft'], swamp:['puddle','reed','tuft'], mine:['bones','tuft'], crypt:['bones','skull'], ice:['tuft'], desert:['skull','bones'], citadel:['skull','bones'], hell:['lava','skull']};
const tileAt = (x, y) => { const tx = Math.floor(x/TILE), ty = Math.floor(y/TILE); return tx < 0 || ty < 0 || tx >= LV_N || ty >= LV_N ? 0 : LV.g[ty*LV_N + tx]; };
// Dá para ficar em (x, y)? Confere uma caixinha em volta dos pés (r = meia largura)
function walkable(x, y, r){
  if(!LV || scene !== 'map') return true;
  r = r || 10;
  return tileAt(x - r, y - r*.6) === 1 && tileAt(x + r, y - r*.6) === 1 && tileAt(x - r, y + r*.4) === 1 && tileAt(x + r, y + r*.4) === 1;
}
// Último ponto livre andando em linha reta de (x0,y0) até (x1,y1) — usado em esquiva, Investida e avanços
function rayEnd(x0, y0, x1, y1, r){
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d/8)); let lx = x0, ly = y0;
  for(let i = 1; i <= n; i++){ const x = x0 + (x1 - x0)*i/n, y = y0 + (y1 - y0)*i/n; if(!walkable(x, y, r)) break; lx = x; ly = y; }
  return {x:lx, y:ly};
}
function genLevel(md){
  const N = LV_N, C = N/LV_CELL, g = new Uint8Array(N*N), rooms = [];
  const carve = (x0, y0, x1, y1) => { for(let y = Math.max(1, Math.min(y0, y1)); y <= Math.min(N - 2, Math.max(y0, y1)); y++) for(let x = Math.max(1, Math.min(x0, x1)); x <= Math.min(N - 2, Math.max(x0, x1)); x++) g[y*N + x] = 1; };
  // salas
  for(let cy = 0; cy < C; cy++) for(let cx = 0; cx < C; cx++){
    const w = rint(5, 8), h = rint(4, 7), x0 = cx*LV_CELL + rint(1, LV_CELL - w - 1), y0 = cy*LV_CELL + rint(1, LV_CELL - h - 1);
    rooms.push({cx, cy, x0, y0, x1:x0 + w - 1, y1:y0 + h - 1, links:[], on:true});
  }
  const R = (cx, cy) => rooms[cy*C + cx];
  // labirinto entre as células (busca em profundidade aleatória)
  const seen = new Set(), stack = [R(rint(0, C - 1), rint(0, C - 1))], edges = [];
  seen.add(stack[0]);
  while(stack.length){
    const r = stack[stack.length - 1], nb = [[1,0],[-1,0],[0,1],[0,-1]].map(([dx, dy]) => R(r.cx + dx, r.cy + dy)).filter(o => o && !seen.has(o));
    if(!nb.length){ stack.pop(); continue; }
    const o = pick(nb); seen.add(o); edges.push([r, o]); r.links.push(o); o.links.push(r); stack.push(o);
  }
  for(let i = 0; i < 2; i++){ const r = pick(rooms), o = pick([[1,0],[0,1]].map(([dx, dy]) => R(r.cx + dx, r.cy + dy)).filter(Boolean)); if(o && !r.links.includes(o)){ edges.push([r, o]); r.links.push(o); o.links.push(r); } }
  // tira 2–4 salas da ponta (só uma ligação) para cada mapa ter um formato diferente
  let cut = rint(2, 4);
  for(const r of rooms.slice().sort(() => Math.random() - .5)){ if(cut <= 0) break; const live = r.links.filter(o => o.on); if(r.on && live.length === 1){ r.on = false; cut--; } }
  const on = rooms.filter(r => r.on);
  for(const r of on) carve(r.x0, r.y0, r.x1, r.y1);
  // corredores (em L, largura 2)
  for(const [a, b] of edges){
    if(!a.on || !b.on) continue;
    const ax = (a.x0 + a.x1) >> 1, ay = (a.y0 + a.y1) >> 1, bx = (b.x0 + b.x1) >> 1, by = (b.y0 + b.y1) >> 1;
    if(Math.random() < .5){ carve(ax, ay, bx, ay + 1); carve(bx, ay, bx + 1, by); } else { carve(ax, ay, ax + 1, by); carve(ax, by, bx, by + 1); }
  }
  // sala de início: uma da ponta; obstáculos e enfeites nas outras
  const ends = on.filter(r => r.links.filter(o => o.on).length === 1), start = pick(ends.length ? ends : on);
  const solids = [], deco = [], ST2 = LV_SOLID[md.decor] || ['rock'], DE = LV_DECO[md.decor] || ['tuft'];
  const inner = (r, x, y) => x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1;
  for(const r of on){
    if(r !== start){
      const n = rint(1, Math.max(2, Math.floor((r.x1 - r.x0)*(r.y1 - r.y0)/7)));
      for(let i = 0; i < n; i++){
        const x = rint(r.x0 + 1, r.x1 - 1), y = rint(r.y0 + 1, r.y1 - 1);
        if(!inner(r, x, y) || g[y*N + x] !== 1) continue;
        g[y*N + x] = 2; solids.push({t:pick(ST2), x:x*TILE + TILE/2, y:y*TILE + TILE*.75, s:rnd(.9, 1.25), v:Math.random()});
      }
    }
    for(let i = 0; i < 4 + (r.x1 - r.x0); i++){ const o = {t:pick(DE), x:rnd(r.x0, r.x1 + 1)*TILE, y:rnd(r.y0, r.y1 + 1)*TILE, s:rnd(.7, 1.2), v:Math.random()}; if(o.t === 'lava'){ o.pts = []; let px = 0, py = 0; for(let j = 0; j < 5; j++){ o.pts.push([px, py]); px += rnd(-30, 30); py += rnd(-30, 30); } } deco.push(o); }
  }
  return {N, g, seen:new Uint8Array(N*N), rooms:on, start, solids, deco, flow:new Int16Array(N*N).fill(-1), flowFrom:-1, flowT:0};
}
// Caminho até o herói (busca em largura na grade, refeita quando ele troca de ladrilho): as criaturas seguem o número menor
function updateFlow(){
  const N = LV_N, tx = clamp(Math.floor(hero.x/TILE), 0, N - 1), ty = clamp(Math.floor(hero.y/TILE), 0, N - 1), k = ty*N + tx;
  if(k === LV.flowFrom) return;
  LV.flowFrom = k; const f = LV.flow; f.fill(-1); f[k] = 0;
  const q = [k];
  for(let qi = 0; qi < q.length; qi++){
    const c = q[qi], cx = c % N, cy = (c / N) | 0, d = f[c];
    if(d > 24) continue;
    for(const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx = cx + dx, ny = cy + dy; if(nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const n = ny*N + nx; if(f[n] < 0 && LV.g[n] === 1){ f[n] = d + 1; q.push(n); } }
  }
}
// Marca como visto tudo num raio de ~5 ladrilhos do herói (minimapa)
function markSeen(){
  const N = LV_N, tx = Math.floor(hero.x/TILE), ty = Math.floor(hero.y/TILE);
  for(let y = ty - 5; y <= ty + 5; y++) for(let x = tx - 6; x <= tx + 6; x++) if(x >= 0 && y >= 0 && x < N && y < N && (x - tx)*(x - tx) + (y - ty)*(y - ty) <= 34) LV.seen[y*N + x] = 1;
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
// Criaturas do mapa: MAP_MONS por mapa (Masmorra: DUN_KILLS), espalhadas pelas salas (menos a de início). Não nascem mais:
// matou todas, o mapa está limpo e o jogador volta para a vila.
// Primeiro mapa: criaturas sozinhas. Demais: sozinha (35%), dupla (30%) ou grupo de 3 a 5 (35%).
const SOLO_MAP = 'campos', MAP_MONS = 60;
const packSize = () => { if(mapDef.id === SOLO_MAP) return 1; const r = Math.random(); return r < .35 ? 1 : r < .65 ? 2 : rint(3, 5); };
let mapTotal = 0, mapCleared = false;
function spawnLevel(){
  const total = mapDef === DUN ? DUN_KILLS : MAP_MONS, rooms = LV.rooms.filter(r => r !== LV.start);
  const freeTile = r => { for(let k = 0; k < 20; k++){ const x = rint(r.x0, r.x1), y = rint(r.y0, r.y1); if(LV.g[y*LV_N + x] === 1) return {x:(x + .5)*TILE, y:(y + .5)*TILE}; } return {x:(r.x0 + .5)*TILE, y:(r.y0 + .5)*TILE}; };
  let left = total, guard = 0;
  while(left > 0 && guard++ < 500){
    const r = pick(rooms), p = freeTile(r), n = Math.min(left, packSize()), eliteIdx = Math.random() < (n === 1 ? .04 : .1) ? 0 : -1, main = pick(mapDef.mons);
    for(let i = 0; i < n; i++){
      const t = Math.random() < .7 ? main : pick(mapDef.mons);
      let x = p.x + rnd(-40, 40), y = p.y + rnd(-40, 40); if(!walkable(x, y, 8)){ x = p.x; y = p.y; }
      const m = makeMon(t, x, y, rint(mapDef.lv[0], mapDef.lv[1]), i === eliteIdx);
      if(inDun()){ const k = dunMult(S.dun.phase); m.hpMax *= k; m.hp = m.hpMax; m.dmg *= k; m.el = dunElem(S.dun.phase); }
      m.lx = m.x; m.ly = m.y;
      mons.push(m); left--;
    }
  }
  mapTotal = total; mapCleared = false;
}
const monsLeft = () => mons.filter(m => !m.dead).length;
// Masmorra: entra numa fase (S.dun.phase) com 0 abates; inDun() diz se o herói está lá
const inDun = () => scene === 'map' && mapDef === DUN;
function enterDungeon(phase){
  if(S.lv < MAX_LV) return;
  S.dun.phase = clamp(phase || 1, 1, S.dun.best + 1); S.dun.kills = 0;
  enterMap(DUN.id);
}
let minimapBig = false; // minimapa grande (aberto ao tocar nele)
function clearWorld(){ zones = []; hero.dodge = null; hero.buff = null; hero.invul = 0; mons = []; projs = []; clouds = []; drops = []; coins = []; parts = []; texts = []; later = []; rings = []; portal = null; }
function enterMap(id){
  // A Masmorra não muda S.map (o mapa de caça normal continua o mesmo para quando sair dela)
  if(id === DUN.id && S.dun.phase > 0) mapDef = DUN;
  else { mapDef = MAPS.find(m => m.id === id) || MAPS[0]; S.map = mapDef.id; S.dun.phase = 0; }
  scene = 'map'; mode = 'hunt'; WORLD = {w:LV_N*TILE, h:LV_N*TILE}; clearWorld();
  LV = genLevel(mapDef); decor = LV.deco; minimapBig = false;
  hero.x = ((LV.start.x0 + LV.start.x1 + 1)/2)*TILE; hero.y = ((LV.start.y0 + LV.start.y1 + 1)/2)*TILE;
  hero.scale = 1; hero.alpha = 1; hero.atk = hero.cast = hero.whirl = hero.dash = null;
  cam.x = hero.x; cam.y = hero.y;
  groundPat = makeGround(mapDef);
  spawnLevel(); markSeen();
  ring(hero.x, hero.y, 50, '#8ab4ff', .6, 4);
  if(mapDef === DUN){ log(`Masmorra · fase ${S.dun.phase} (${ELEM[dunElem(S.dun.phase)].n}): mate as ${DUN_KILLS} criaturas`, ELEM[dunElem(S.dun.phase)].c); dirtyPanel(); return; }
  log(`${mapDef.name}: ${mapTotal} criaturas para caçar`, '#c9e6a0');
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
