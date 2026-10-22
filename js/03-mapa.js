// Mapa: canvas, câmera, listas do mundo (monstros, projéteis...), efeitos (log/txt/part/ring), chão, decoração, vila e entrada nos mapas.
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- RUNTIME ---------- */
// Canvas opaco (alpha:false): o render pinta a tela inteira todo quadro, e o navegador não precisa misturar com a página atrás
const cv = $('#cv'), ctx = cv.getContext('2d', {alpha:false});
let cw = 360, ch = 480, dpr = 1, zoom = 1;
// Resolução interna: no máximo MAX_PX pixels (telas 2K/4K ou Windows em 125–150% desenhariam 4–8 milhões por quadro) e
// renderScale (0,7–1), que o frame() (07) baixa sozinho se os quadros ficarem pesados e sobe de volta quando sobra tempo.
const MAX_PX = 3e6;
let renderScale = 1;
function resize(){
  const r = cv.parentElement.getBoundingClientRect();
  cw = Math.max(1, r.width); ch = Math.max(1, r.height);
  dpr = Math.min(2, window.devicePixelRatio || 1, Math.sqrt(MAX_PX/(cw*ch))) * renderScale;
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
const cds = {dodge:0, atk:0}; for(const id in SKD) if(SKD[id].act) cds[id] = 0;
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
  {id:'celeiro', x:205, y:830, w:150, h:80, dep:66, wall:'#8a6a48', roof:'#5a3a22', barn:1}, // só enfeite (o armazém não existe mais)
];
// A Fenda (DPORT): antes do nível 40 fica selada (pedras caídas, rachadura apagada). No 40, na 1ª volta à vila, a cena (cut, em 06)
// traz o Ezequiel, o Guardião da Fenda, até o herói e leva os dois até ela; a Fenda desperta (pedras em pé em volta, portal aceso)
// e S.riftIntro fica true. Daí em diante o Ezequiel fica ao lado dela com a Mesa Rúnica (aba 'runes': juntar/voltar Pedras).
const RIFT_NPC = {x:800, y:872, n:'Ezequiel'}, RUNE_TABLE = {x:748, y:878};
const riftNpc = {x:RIFT_NPC.x, y:RIFT_NPC.y, face:Math.PI, moving:false, walkT:0}; // onde ele está agora (anda na cena)
let cut = null; // cena do nível 40 em andamento (06)
// Zonas de entrada: porta de cada prédio com painel, o Tobias e, com a Fenda aberta, ela e a Mesa Rúnica (lx/ly = onde fica a placa)
const townZones = () => {
  const z = TOWN_B.filter(b => b.tab).map(b => ({id:b.id, tab:b.tab, n:b.n, x:b.x, y:b.y + 34, r:42}));
  z.push({id:'chest', tab:'chest', n:NPC_CHEST.n, x:NPC_CHEST.x, y:NPC_CHEST.y + 26, r:36, lx:NPC_CHEST.x, ly:NPC_CHEST.y - 58});
  if(dunOpen() && !cut){
    z.push({id:'dun', tab:'dun', n:'A Fenda', x:DPORT.x, y:DPORT.y + 6, r:40, lx:DPORT.x, ly:DPORT.y - 104});
    z.push({id:'runes', tab:'runes', n:`${RIFT_NPC.n} · Mesa Rúnica`, x:RUNE_TABLE.x + 22, y:RUNE_TABLE.y + 26, r:34, lx:RUNE_TABLE.x + 22, ly:RUNE_TABLE.y - 58});
  }
  return z;
};
// Colisão: caixas dos prédios (frente + fundo), a fonte e a Mesa Rúnica (quando existe)
function townBlocked(x, y){
  if(x < 30 || y < 120 || x > TOWN_W - 30 || y > TOWN_H - 30) return true;
  for(const b of TOWN_B){ const back = b.dep*.45 + 30; if(x > b.x - b.w/2 - 8 && x < b.x + b.w/2 + b.dep*.6 + 4 && y > b.y - back && y < b.y + 8) return true; }
  if(Math.hypot((x - FOUNT.x)/1.25, y - FOUNT.y + 6) < 62) return true;
  if(dunOpen() && Math.hypot((x - RUNE_TABLE.x)/1.4, y - RUNE_TABLE.y + 4) < 18) return true;
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
// Grade de LV_N×LV_N ladrilhos de TILE px (paredes finas de 1 ladrilho). A cada entrada genLevel() sorteia tudo de novo:
// áreas de formatos variados (retângulo, círculo, oval, caverna, anel com ilha no meio para dar a volta, arena grande, cruz),
// ligadas por uma árvore pelo caminho mais curto + 2–4 ligações extras (voltas); corredores curvos de largura 2 a 5.
// Depois as bordas são suavizadas e tudo que ficou sem acesso vira parede.
// LV.g: 0 = parede/vazio, 1 = chão, 2 = chão com obstáculo (bloqueia). LV.seen = ladrilhos já vistos (minimapa).
const TILE = 40, LV_N = 76, RING_W = 4.2; // RING_W = largura do caminho em volta da ilha dos anéis
let LV = null;
// Obstáculos (bloqueiam) e enfeites do chão (não bloqueiam) por tipo de mapa — desenhados por drawDecor (07)
const LV_SOLID = {field:['rock','tree'], forest:['tree','tree','rock'], swamp:['deadtree','rock'], mine:['crystal','rock'], crypt:['pillar','tomb'], ice:['pine','rock'], desert:['rock','pillar','deadtree'], citadel:['pillar','crystal'], hell:['rock','pillar']};
const LV_DECO = {field:['wheat','tuft','wheat'], forest:['bush','tuft'], swamp:['puddle','reed','tuft'], mine:['bones','tuft'], crypt:['bones','skull'], ice:['tuft'], desert:['skull','bones'], citadel:['skull','bones'], hell:['lava','skull']};
const tileAt = (x, y) => { const tx = Math.floor(x/TILE), ty = Math.floor(y/TILE); return tx < 0 || ty < 0 || tx >= LV_N || ty >= LV_N ? 0 : LV.g[ty*LV_N + tx]; };
// Dá para ficar em (x, y)? Paredes: confere uma caixinha em volta dos pés (r = meia largura).
// Obstáculos: só a base deles bloqueia (círculo de raio o.cr no pé do objeto) — dá para passar atrás e ele fica desenhado por cima.
const SOLID_R = {rock:13, tree:9, pine:9, deadtree:7, pillar:15, tomb:11, crystal:12};
function walkable(x, y, r){
  if(!LV || scene !== 'map') return true;
  r = r || 10;
  if(!tileAt(x - r, y - r*.6) || !tileAt(x + r, y - r*.6) || !tileAt(x - r, y + r*.4) || !tileAt(x + r, y + r*.4)) return false;
  const tx = Math.floor(x/TILE), ty = Math.floor(y/TILE);
  for(let j = -1; j <= 1; j++) for(let i = -1; i <= 1; i++){
    const o = LV.sol[(ty + j)*LV_N + tx + i]; if(!o) continue;
    const dx = x - o.x, dy = (y - (o.y - 3))*1.5; // base achatada (vista de cima em 3/4)
    if(dx*dx + dy*dy < (o.cr + r*.6)*(o.cr + r*.6)) return false;
  }
  return true;
}
// Último ponto livre andando em linha reta de (x0,y0) até (x1,y1) — usado em esquiva, Investida e avanços
function rayEnd(x0, y0, x1, y1, r){
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d/8)); let lx = x0, ly = y0;
  for(let i = 1; i <= n; i++){ const x = x0 + (x1 - x0)*i/n, y = y0 + (y1 - y0)*i/n; if(!walkable(x, y, r)) break; lx = x; ly = y; }
  return {x:lx, y:ly};
}
function genLevel(md){
  const N = LV_N, g = new Uint8Array(N*N), M = 3; // M = margem de parede/vazio na borda
  const inb = (x, y) => x >= M && y >= M && x < N - M && y < N - M;
  const set = (x, y) => { x = Math.round(x); y = Math.round(y); if(inb(x, y)) g[y*N + x] = 1; };
  const disc = (cx, cy, r, ry) => { ry = ry || r; for(let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for(let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++){ const dx = (x - cx)/r, dy = (y - cy)/ry; if(dx*dx + dy*dy <= 1) set(x, y); } };
  const box = (x0, y0, x1, y1) => { for(let y = y0; y <= y1; y++) for(let x = x0; x <= x1; x++) set(x, y); };
  const wall = (cx, cy, r) => { for(let y = Math.floor(cy - r); y <= cy + r; y++) for(let x = Math.floor(cx - r); x <= cx + r; x++) if((x - cx)*(x - cx) + (y - cy)*(y - cy) <= r*r && inb(x, y)) g[y*N + x] = 0; };
  // 1) áreas espalhadas com distância mínima entre elas
  const nodes = [], want = rint(11, 15);
  for(let tries = 0; nodes.length < want && tries < 800; tries++){
    const x = rnd(M + 9, N - M - 10), y = rnd(M + 9, N - M - 10);
    if(nodes.every(n => Math.hypot(n.x - x, n.y - y) > 13)) nodes.push({x, y});
  }
  // 2) formato de cada área (sorteado)
  const SHAPES = ['rect','rect','circle','oval','cave','cave','ring','arena','cross'];
  let arenas = 0;
  for(const n of nodes){
    let s = pick(SHAPES); if(s === 'arena' && arenas++) s = 'circle';
    n.shape = s;
    if(s === 'rect'){ const w = rint(5, 8), h = rint(4, 7); box(Math.round(n.x - w), Math.round(n.y - h), Math.round(n.x + w), Math.round(n.y + h)); }
    else if(s === 'circle') disc(n.x, n.y, rnd(5, 7.5));
    else if(s === 'oval') Math.random() < .5 ? disc(n.x, n.y, rnd(8, 10.5), rnd(4.5, 6)) : disc(n.x, n.y, rnd(4.5, 6), rnd(7.5, 9.5));
    else if(s === 'cave'){ for(let i = 0; i < rint(5, 8); i++) disc(n.x + rnd(-5.5, 5.5), n.y + rnd(-4.5, 4.5), rnd(3, 4.8)); }
    else if(s === 'ring'){ const r = rnd(8.5, 10.5); disc(n.x, n.y, r); wall(n.x, n.y, r - RING_W); n.ring = r; } // anel: ilha no meio para dar a volta
    else if(s === 'arena') disc(n.x, n.y, rnd(11, 13), rnd(9, 10.5));
    else { const a = rint(6, 9), b = rint(2, 3); box(Math.round(n.x - a), Math.round(n.y - b), Math.round(n.x + a), Math.round(n.y + b)); box(Math.round(n.x - b), Math.round(n.y - a), Math.round(n.x + b), Math.round(n.y + a)); }
  }
  // 3) ligações: árvore pelo menor caminho (Prim) + algumas voltas extras
  const edges = [], inT = [nodes[0]];
  while(inT.length < nodes.length){
    let best = null, bd = 1e9;
    for(const a of inT) for(const b of nodes) if(!inT.includes(b)){ const d = Math.hypot(a.x - b.x, a.y - b.y); if(d < bd){ bd = d; best = [a, b]; } }
    edges.push(best); inT.push(best[1]);
  }
  for(let i = 0, extra = rint(2, 4); i < 40 && extra > 0; i++){
    const a = pick(nodes), b = pick(nodes); if(a === b || Math.hypot(a.x - b.x, a.y - b.y) > 34 || edges.some(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))) continue;
    edges.push([a, b]); extra--;
  }
  // 4) corredores curvos: pincel redondo andando numa curva entre as áreas (largura 2 a 5)
  for(const [a, b] of edges){
    const w = pick([3, 3.5, 4, 4, 4.5, 5, 6]) / 2, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const bend = rnd(-.35, .35)*len, mx = (a.x + b.x)/2 - dy/len*bend, my = (a.y + b.y)/2 + dx/len*bend;
    // começa na borda do anel (não atravessa a ilha)
    for(let t = 0; t <= 1; t += .5/len){
      const x = (1 - t)*(1 - t)*a.x + 2*(1 - t)*t*mx + t*t*b.x, y = (1 - t)*(1 - t)*a.y + 2*(1 - t)*t*my + t*t*b.y;
      const insideRing = [a, b].some(n => n.ring && Math.hypot(x - n.x, y - n.y) < n.ring - RING_W);
      if(!insideRing) disc(x, y, w);
    }
  }
  // 5) suaviza as bordas (tira pontas e buraquinhos)
  const cnt = (x, y) => { let c = 0; for(let j = -1; j <= 1; j++) for(let i = -1; i <= 1; i++) if((i || j) && g[(y + j)*N + x + i]) c++; return c; };
  const g2 = g.slice();
  for(let y = M; y < N - M; y++) for(let x = M; x < N - M; x++){ const c = cnt(x, y); if(!g[y*N + x] && c >= 6) g2[y*N + x] = 1; else if(g[y*N + x] && c <= 1) g2[y*N + x] = 0; }
  g.set(g2);
  // 6) início: área mais afastada do meio; tudo sem acesso a partir dela vira parede
  const start = nodes.slice().sort((p, q) => Math.hypot(q.x - N/2, q.y - N/2) - Math.hypot(p.x - N/2, p.y - N/2))[0];
  let sx = Math.round(start.x), sy = Math.round(start.y);
  if(!g[sy*N + sx]){ let bd = 1e9; for(let y = 0; y < N; y++) for(let x = 0; x < N; x++) if(g[y*N + x]){ const d = Math.hypot(x - start.x, y - start.y); if(d < bd){ bd = d; sx = x; sy = y; } } }
  const bfs = () => { const dist = new Int16Array(N*N).fill(-1), q = [sy*N + sx]; dist[q[0]] = 0; for(let i = 0; i < q.length; i++){ const c = q[i], x = c % N, y = (c/N) | 0; for(const [ox, oy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const n = (y + oy)*N + x + ox; if(dist[n] < 0 && g[n] === 1){ dist[n] = dist[c] + 1; q.push(n); } } } return {dist, n:q.length}; };
  let {dist} = bfs();
  for(let i = 0; i < N*N; i++) if(g[i] && dist[i] < 0) g[i] = 0;
  // 7) obstáculos só em ladrilho cercado de chão, longe do início, sem fechar passagem nenhuma
  const solids = [], deco = [], ST2 = LV_SOLID[md.decor] || ['rock'], DE = LV_DECO[md.decor] || ['tuft'];
  let floorN = 0; for(let i = 0; i < N*N; i++) if(g[i] === 1) floorN++;
  const wantSolid = Math.floor(floorN/40);
  for(let tries = 0; solids.length < wantSolid && tries < wantSolid*12; tries++){
    const x = rint(M, N - M - 1), y = rint(M, N - M - 1), k = y*N + x;
    if(g[k] !== 1 || cnt(x, y) < 8 || dist[k] < 6) continue;
    g[k] = 2;
    const r = bfs(); if(r.n < floorN - solids.length - 1){ g[k] = 1; continue; } // fecharia algum lugar: desiste
    const t = pick(ST2), s = rnd(.75, 1.05);
    solids.push({t, x:x*TILE + TILE/2, y:y*TILE + TILE*.8, s, v:Math.random(), cr:(SOLID_R[t] || 12)*s, k});
  }
  const sol = {}; for(const o of solids) sol[o.k] = o; // obstáculo por ladrilho (colisão em walkable)
  ({dist} = bfs());
  // 8) enfeites no chão
  for(let i = 0; i < floorN/9; i++){
    const x = rint(M, N - M - 1), y = rint(M, N - M - 1); if(g[y*N + x] !== 1) continue;
    const o = {t:pick(DE), x:(x + Math.random())*TILE, y:(y + Math.random())*TILE, s:rnd(.6, 1), v:Math.random()};
    if(o.t === 'lava'){ o.pts = []; let px = 0, py = 0; for(let j = 0; j < 5; j++){ o.pts.push([px, py]); px += rnd(-25, 25); py += rnd(-25, 25); } }
    deco.push(o);
  }
  return {N, g, seen:new Uint8Array(N*N), dist, startPos:{x:(sx + .5)*TILE, y:(sy + .5)*TILE}, solids, sol, deco, flow:new Int16Array(N*N).fill(-1), flowFrom:-1, flowT:0};
}
// Caminho até o herói (busca em largura na grade, refeita quando ele troca de ladrilho): as criaturas seguem o número menor
function updateFlow(){
  const N = LV_N, tx = clamp(Math.floor(hero.x/TILE), 0, N - 1), ty = clamp(Math.floor(hero.y/TILE), 0, N - 1), k = ty*N + tx;
  if(k === LV.flowFrom) return;
  LV.flowFrom = k; const f = LV.flow; f.fill(-1); f[k] = 0;
  const q = [k];
  for(let qi = 0; qi < q.length; qi++){
    const c = q[qi], cx = c % N, cy = (c / N) | 0, d = f[c];
    if(d > 44) continue;
    for(const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx = cx + dx, ny = cy + dy; if(nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const n = ny*N + nx; if(f[n] < 0 && LV.g[n] === 1){ f[n] = d + 1; q.push(n); } }
  }
}
// Marca como visto tudo num raio de ~8 ladrilhos (320 px) do herói (minimapa)
function markSeen(){
  const N = LV_N, tx = Math.floor(hero.x/TILE), ty = Math.floor(hero.y/TILE), R = 8;
  for(let y = ty - R; y <= ty + R; y++) for(let x = tx - R; x <= tx + R; x++) if(x >= 0 && y >= 0 && x < N && y < N && (x - tx)*(x - tx) + (y - ty)*(y - ty) <= R*R) LV.seen[y*N + x] = 1;
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
// Primeiro mapa: criaturas sozinhas. Demais: PACK_SOLO das vezes sozinha, senão um grupo de 2 até packMax() — o máximo cresce
// com o mapa (2º mapa 2–3, 3º até 4... último até PACK_MAX = 10; Masmorra até 10). Atacou/viu uma do grupo, o grupo todo vem (m.pack, 06).
// Grupo grande: cada criatura um pouco mais fraca (vida e dano × packF; 4 = 95% ... 7 = 80%, 10 = 70%), senão 10 juntas matam na hora
const SOLO_MAP = 'campos', MAP_MONS = 80, PACK_MAX = 10, PACK_SOLO = .35;
const packF = n => n <= 3 ? 1 : Math.max(.7, 1 - .05*(n - 3));
const packMax = () => mapDef === DUN || mapDef === RMAP ? PACK_MAX : Math.min(PACK_MAX, 2 + MAPS.indexOf(mapDef));
const packSize = () => { if(mapDef.id === SOLO_MAP) return 1; return Math.random() < PACK_SOLO ? 1 : rint(2, packMax()); };
let mapTotal = 0, mapCleared = false, packId = 0;
function spawnLevel(){
  const total = mapDef === DUN ? DUN_KILLS : mapDef === RMAP ? RMAP_KILLS : MAP_MONS;
  // lugares possíveis: chão a pelo menos 9 ladrilhos (pelo caminho) do início
  const spots = []; for(let i = 0; i < LV_N*LV_N; i++) if(LV.g[i] === 1 && LV.dist[i] >= 12) spots.push(i);
  let left = total, guard = 0;
  while(left > 0 && guard++ < 500 && spots.length){
    const s = pick(spots), p = {x:(s % LV_N + .5)*TILE, y:(((s / LV_N) | 0) + .5)*TILE}, n = Math.min(left, packSize()), eliteIdx = Math.random() < (n === 1 ? .04 : .1) ? 0 : -1, main = pick(mapDef.mons);
    const pk = n > 1 ? ++packId : 0, spread = 30 + n*9; // grupo maior se espalha um pouco mais
    for(let i = 0; i < n; i++){
      const t = Math.random() < .7 ? main : pick(mapDef.mons);
      let x = p.x + rnd(-spread, spread), y = p.y + rnd(-spread, spread); if(!walkable(x, y, 8)){ x = p.x + rnd(-12, 12); y = p.y + rnd(-12, 12); if(!walkable(x, y, 8)){ x = p.x; y = p.y; } }
      const m = makeMon(t, x, y, rint(mapDef.lv[0], mapDef.lv[1]), i === eliteIdx);
      m.pack = pk;
      if(n > 3){ const f = packF(n); m.hpMax *= f; m.hp = m.hpMax; m.dmg *= f; }
      if(inDun()) dunScale(m); else if(inRmap()) rmapScale(m);
      m.lx = m.x; m.ly = m.y;
      mons.push(m); left--;
    }
  }
  mapTotal = total; mapCleared = false;
}
const monsLeft = () => mons.filter(m => !m.dead).length;
// Masmorra: gasta 1 Pedra do nível escolhido, sorteia o elemento e entra com 0 abates; inDun() diz se o herói está lá
const inDun = () => scene === 'map' && mapDef === DUN;
// Tempo que falta na corrida (s): começa em DUN_TIME e só corre caçando (updateField em 06); não fica salvo
let dunTime = 0;
const dunClock = () => { const s = Math.max(0, Math.ceil(dunTime)); return `${Math.floor(s/60)}:${String(s % 60).padStart(2, '0')}`; };
function enterDungeon(level){
  if(!(S.stones[level] > 0)) return false;
  S.stones[level]--; if(!S.stones[level]) delete S.stones[level];
  S.dun.phase = level; S.dun.kills = 0; S.dun.boss = 0; S.dun.el = pick(DUN_ELEMS); dunTime = DUN_TIME;
  if(S.tut === 1 || S.tut === 2) S.tut = 3;
  enterMap(DUN.id); save();
  return true;
}
// Criatura da Masmorra: vida e dano × 1,25^(Pedra−1) e o elemento da corrida
function dunScale(m){ const k = dunMult(S.dun.phase); m.hpMax *= k; m.hp = m.hpMax; m.dmg *= k; m.el = dunEl(); }
// Mapa Aleatório (nível 40, ver RMAP_ID em 01): RMAP é o mapa da entrada atual, com visual e criaturas de um dos MAPS sorteado
let RMAP = null;
const inRmap = () => scene === 'map' && !!RMAP && mapDef === RMAP;
const rmapName = n => `Mapa Aleatório ${n}`;
function rmapScale(m){ const k = dunMult(S.rmap.tier); m.hpMax *= k; m.hp = m.hpMax; m.dmg *= k; }
function makeRmap(){
  const base = pick(MAPS);
  RMAP = {...base, id:RMAP_ID, name:rmapName(S.rmap.tier), tier:S.rmap.tier, theme:base.name, lv:[MAX_LV, MAX_LV], req:MAX_LV};
  return RMAP;
}
// Matou todas as criaturas (Masmorra: DUN_KILLS; Mapa Aleatório: RMAP_KILLS): o Chefe aparece perto do herói (num chão livre, a uns 260 px)
// com BOSS_MINIONS ajudantes. Na Masmorra ele vem das criaturas de todos os mapas; no Mapa Aleatório, das criaturas do mapa sorteado.
function spawnBoss(){
  const R = inRmap(), pool = R ? mapDef.mons : DUN.mons, scale = R ? rmapScale : dunScale;
  const withAoe = pool.filter(k => MONS[k].aoe), t = pick(withAoe.length ? withAoe : pool);
  let p = null;
  for(let i = 0; i < 40 && !p; i++){ const a = Math.random()*TAU, r = rnd(200, 320), x = hero.x + Math.cos(a)*r, y = hero.y + Math.sin(a)*r; if(walkable(x, y, 26) && losClear(hero, {x, y})) p = {x, y}; }
  if(!p) p = {x:hero.x + 120, y:hero.y};
  const pk = ++packId, b = makeMon(t, p.x, p.y, MAX_LV, true);
  b.boss = true; b.pack = pk; b.name = `${MONS[t].n} Ancestral`; b.r *= BOSS_R; b.spd *= .9;
  b.hpMax *= BOSS_HP; b.dmg *= BOSS_DMG; scale(b); b.lx = b.x; b.ly = b.y; mons.push(b);
  if(R) b.el = MONS[t].el; // anel do Chefe na cor do elemento dele
  for(let i = 0; i < BOSS_MINIONS; i++){
    const a = i/BOSS_MINIONS*TAU, x = p.x + Math.cos(a)*55, y = p.y + Math.sin(a)*55;
    const m = makeMon(pick(pool), walkable(x, y, 8) ? x : p.x, walkable(x, y, 8) ? y : p.y, MAX_LV, false);
    m.minion = true; m.pack = pk; scale(m); m.lx = m.x; m.ly = m.y; mons.push(m);
  }
  if(R) S.rmap.boss = 1; else { S.dun.boss = 1; tutStep(3, 4); }
  const ec = ELEM[b.el || dunEl()].c;
  for(let i = 0; i < 30; i++){ const an = Math.random()*TAU, sp = rnd(60, 200); part({x:p.x, y:p.y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp, life:.7, size:rnd(2, 4.5), c:ec}); }
  ring(p.x, p.y, 140, ec, 1, 6); ring(p.x, p.y, 90, STONE_C, .8, 3);
  txt(hero.x, hero.y - 70, 'O CHEFE APARECEU!', '#ff8c80', 20, -16);
  log(`O Chefe apareceu: ${b.name}, com ${BOSS_MINIONS} ajudantes!`, '#ff8c80');
}
let minimapBig = false; // minimapa grande (aberto ao tocar nele)
function clearWorld(){ zones = []; hero.dodge = null; hero.buff = null; hero.invul = 0; mons = []; projs = []; clouds = []; drops = []; coins = []; parts = []; texts = []; later = []; rings = []; portal = null; }
function enterMap(id){
  // A Masmorra não muda S.map (o mapa de caça normal continua o mesmo para quando sair dela)
  // No nível 40 os mapas normais somem: qualquer caçada vira o Mapa Aleatório (sorteado de novo a cada entrada)
  if(id === DUN.id && S.dun.phase > 0) mapDef = DUN;
  else if(S.lv >= MAX_LV){ mapDef = makeRmap(); S.map = RMAP_ID; S.dun.phase = 0; S.rmap.kills = 0; S.rmap.boss = 0; }
  else { mapDef = MAPS.find(m => m.id === id) || MAPS[0]; S.map = mapDef.id; S.dun.phase = 0; }
  scene = 'map'; mode = 'hunt'; WORLD = {w:LV_N*TILE, h:LV_N*TILE}; clearWorld();
  LV = genLevel(mapDef); decor = LV.deco; minimapBig = false;
  hero.x = LV.startPos.x; hero.y = LV.startPos.y;
  hero.scale = 1; hero.alpha = 1; hero.atk = hero.cast = hero.whirl = hero.dash = null;
  cam.x = hero.x; cam.y = hero.y;
  groundPat = makeGround(mapDef);
  spawnLevel(); markSeen();
  ring(hero.x, hero.y, 50, '#8ab4ff', .6, 4);
  if(mapDef === DUN){ log(`Masmorra · Pedra ${S.dun.phase} · ${ELEM[dunEl()].n}: mate as ${DUN_KILLS} criaturas e o Chefe em ${DUN_TIME/60} minutos`, ELEM[dunEl()].c); dirtyPanel(); return; }
  if(mapDef === RMAP){ log(`${RMAP.name} (${RMAP.theme}): mate as ${RMAP_KILLS} criaturas e o Chefe · Pedras 1–${S.rmap.tier}`, STONE_C); dirtyPanel(); return; }
  log(`${mapDef.name}: ${mapTotal} criaturas para caçar`, '#c9e6a0');
  const xm = xpMult(mapDef); if(xm < 1) log(`Mapa abaixo do seu nível: XP reduzida em ${Math.round((1 - xm)*100)}%`, '#ff8c80');
  dirtyPanel();
}
function enterTown(){
  if(S.dun && S.dun.phase > 0){ if(S.dun.boss < 2) log(`Masmorra da Pedra ${S.dun.phase} encerrada sem matar o Chefe (a Pedra foi gasta)`, '#d9a0ff'); S.dun.phase = 0; S.dun.kills = 0; S.dun.boss = 0; }
  S.rmap.kills = 0; S.rmap.boss = 0;
  scene = 'town'; mode = 'town'; WORLD = {w:TOWN_W, h:TOWN_H}; clearWorld(); decor = [];
  hero.x = TPORT.x; hero.y = TPORT.y - 40; hero.scale = 1; hero.alpha = 1; hero.face = -Math.PI/2; hero.atk = hero.cast = hero.whirl = hero.dash = null; hero.moving = false;
  cam.x = hero.x; cam.y = hero.y - 40; townWait = 0; townGoal = null; townZone = null; townIdle = true; townArmed = false;
  if(!townPat) townPat = makeTown();
  if(S.char){ rollShop(); log('O mercador trouxe 3 itens novos', '#e2ae4a'); }
  if(S.cfg.autoSell) sellWhere(it => it.rar === 0, true);
  riftNpc.x = RIFT_NPC.x; riftNpc.y = RIFT_NPC.y; riftNpc.face = Math.PI; riftNpc.moving = false; cut = null;
  if(S.char) tutTown();
  if(S.char && S.lv >= MAX_LV && !S.riftIntro) startCut(); // 1ª volta à vila no nível 40: cena do Ezequiel (06)
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
