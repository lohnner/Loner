// Animações: desenho do herói, monstros, mundo e efeitos (render) e o loop frame().
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- DESENHO ---------- */
function ell(x, y, rx, ry){ ctx.beginPath(); ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, TAU); ctx.fill(); }
function circ(x, y, r){ ctx.beginPath(); ctx.arc(x, y, Math.max(.1, r), 0, TAU); ctx.fill(); }
function line(x1, y1, x2, y2){ ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
// Cor das pedras por tipo de mapa
const ROCK_C = {hell:['#3a2420', '#4e302a'], ice:['#9aa6b2', '#d6e0e8'], desert:['#6a5640', '#8a7456'], mine:['#4a3e34', '#6a5a4a'], citadel:['#3a3344', '#554c62']};
function drawDecor(o){
  const x = o.x, y = o.y, s = o.s;
  switch(o.t){
    case 'rock': { const rc = ROCK_C[mapDef.decor] || ['#57564f', '#727067']; ctx.fillStyle = 'rgba(0,0,0,.3)'; ell(x+3, y+4, 12*s, 6*s); ctx.fillStyle = rc[0]; ell(x, y, 11*s, 8*s); ctx.fillStyle = rc[1]; ell(x - 3*s, y - 3*s, 5*s, 3*s); break; }
    case 'crystal': { const cc = mapDef.decor === 'citadel' ? ['#5a2a8a', '#c08aff'] : ['#2a6a8a', '#7fd8ff']; ctx.fillStyle = 'rgba(0,0,0,.3)'; ell(x+2, y+3, 9*s, 4*s); for(const [dx, h, w] of [[-4, 14, 3.5], [1, 20, 4.5], [6, 11, 3]]){ ctx.fillStyle = cc[0]; ctx.beginPath(); ctx.moveTo(x + dx*s - w*s, y); ctx.lineTo(x + dx*s, y - h*s); ctx.lineTo(x + dx*s + w*s, y); ctx.fill(); ctx.fillStyle = cc[1]; ctx.beginPath(); ctx.moveTo(x + dx*s - w*s*.3, y - 2); ctx.lineTo(x + dx*s, y - h*s); ctx.lineTo(x + dx*s + w*s*.6, y - 2); ctx.fill(); } ctx.globalAlpha = .18 + .1*Math.sin(T*2 + o.v*9); ctx.fillStyle = cc[1]; circ(x, y - 8*s, 16*s); ctx.globalAlpha = 1; break; }
    case 'pine': ctx.fillStyle = 'rgba(0,0,0,.25)'; ell(x + 5, y + 6, 22*s, 9*s); ctx.fillStyle = '#4a3a2c'; ctx.fillRect(x - 2.5, y - 4, 5, 10); for(let i = 0; i < 3; i++){ const yy = y - 6*s - i*10*s, w = (18 - i*4.5)*s; ctx.fillStyle = '#2e4a3c'; ctx.beginPath(); ctx.moveTo(x - w, yy); ctx.lineTo(x, yy - 16*s); ctx.lineTo(x + w, yy); ctx.fill(); ctx.fillStyle = '#eef4f8'; ctx.beginPath(); ctx.moveTo(x - w*.55, yy - 7*s); ctx.lineTo(x, yy - 16*s); ctx.lineTo(x + w*.55, yy - 7*s); ctx.fill(); } break;
    case 'tuft': ctx.strokeStyle = mapDef.tuft; ctx.lineWidth = 1.5; ctx.beginPath(); for(let i = -2; i <= 2; i++){ ctx.moveTo(x + i*2*s, y); ctx.lineTo(x + i*3.5*s, y - 8*s); } ctx.stroke(); break;
    case 'wheat': ctx.strokeStyle = '#8f7a36'; ctx.lineWidth = 1.6; ctx.beginPath(); for(let i = 0; i < 6; i++){ const bx = x + (i - 2.5)*3.2*s; ctx.moveTo(bx, y); ctx.lineTo(bx + (i - 2.5)*1.2*s, y - 15*s); } ctx.stroke(); ctx.fillStyle = '#d2b358'; for(let i = 0; i < 6; i++) ell(x + (i - 2.5)*3.2*s + (i - 2.5)*1.2*s, y - 16*s, 1.6*s, 3.4*s); break;
    case 'fence': ctx.fillStyle = 'rgba(0,0,0,.3)'; ell(x+20*s, y+4, 30*s, 4); ctx.strokeStyle = '#6b4e30'; ctx.lineWidth = 3; line(x - 8*s, y - 6, x + 48*s, y - 6); ctx.fillStyle = '#7d5c38'; for(let i = 0; i < 4; i++) ctx.fillRect(x - 8*s + i*18*s, y - 14, 4, 16); break;
    case 'tree': ctx.fillStyle = 'rgba(0,0,0,.35)'; ell(x + 6, y + 10, 30*s, 14*s); ctx.fillStyle = '#3a2a1c'; ctx.fillRect(x - 3, y - 4, 6, 14); ctx.fillStyle = '#132619'; circ(x, y - 10*s, 26*s); ctx.fillStyle = '#1b3422'; circ(x - 8*s, y - 16*s, 18*s); ctx.fillStyle = '#25462d'; circ(x - 11*s, y - 20*s, 9*s); break;
    case 'bush': ctx.fillStyle = 'rgba(0,0,0,.3)'; ell(x + 3, y + 5, 14*s, 6*s); ctx.fillStyle = '#1d3a24'; circ(x, y, 10*s); circ(x + 9*s, y + 2, 8*s); ctx.fillStyle = '#2d5233'; circ(x - 2*s, y - 3*s, 5*s); break;
    case 'puddle': ctx.fillStyle = '#18221a'; ell(x, y, 34*s, 16*s); ctx.strokeStyle = 'rgba(120,160,110,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x - 6*s, y - 3*s, 16*s, 5*s, 0, Math.PI*1.1, Math.PI*1.8); ctx.stroke(); break;
    case 'reed': ctx.strokeStyle = '#5f6b33'; ctx.lineWidth = 1.6; ctx.beginPath(); for(let i = 0; i < 4; i++){ ctx.moveTo(x + i*3*s, y); ctx.lineTo(x + i*3*s + (i - 1.5)*2*s, y - 20*s); } ctx.stroke(); ctx.fillStyle = '#5a3a22'; for(let i = 0; i < 4; i += 2) ell(x + i*3*s + (i - 1.5)*2*s, y - 21*s, 1.8*s, 4.5*s); break;
    case 'deadtree': ctx.fillStyle = 'rgba(0,0,0,.3)'; ell(x + 4, y + 4, 16*s, 6*s); ctx.strokeStyle = '#2f261c'; ctx.lineWidth = 5*s; ctx.lineCap = 'round'; line(x, y, x, y - 30*s); ctx.lineWidth = 3*s; line(x, y - 18*s, x - 14*s, y - 30*s); line(x, y - 24*s, x + 12*s, y - 38*s); ctx.lineCap = 'butt'; break;
    case 'pillar': ctx.fillStyle = 'rgba(0,0,0,.4)'; ell(x + 6, y + 10, 22*s, 8*s); ctx.fillStyle = '#3e3c44'; ctx.fillRect(x - 14*s, y - 30*s, 28*s, 38*s); ctx.fillStyle = '#56545e'; ctx.fillRect(x - 16*s, y - 34*s, 32*s, 8*s); ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1; line(x - 4*s, y - 20*s, x + 3*s, y - 6*s); break;
    case 'tomb': ctx.fillStyle = 'rgba(0,0,0,.35)'; ell(x + 3, y + 6, 14*s, 5*s); ctx.fillStyle = '#4c4a52'; ctx.beginPath(); ctx.moveTo(x - 9*s, y + 4); ctx.lineTo(x - 9*s, y - 12*s); ctx.arc(x, y - 12*s, 9*s, Math.PI, 0); ctx.lineTo(x + 9*s, y + 4); ctx.fill(); ctx.strokeStyle = '#2c2a30'; ctx.lineWidth = 2; line(x, y - 16*s, x, y - 4*s); line(x - 4*s, y - 12*s, x + 4*s, y - 12*s); break;
    case 'bones': ctx.strokeStyle = '#bdb6a2'; ctx.lineWidth = 2; ctx.lineCap = 'round'; line(x - 7*s, y - 2, x + 7*s, y + 2); line(x - 4*s, y + 4, x + 5*s, y - 5); ctx.lineCap = 'butt'; break;
    case 'lava': { const a = .55 + .35*Math.sin(T*2 + o.v*9); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = `rgba(255,90,20,${a*.35})`; ctx.lineWidth = 9; ctx.beginPath(); o.pts.forEach((p, i) => i ? ctx.lineTo(x + p[0], y + p[1]) : ctx.moveTo(x + p[0], y + p[1])); ctx.stroke(); ctx.strokeStyle = `rgba(255,${150 + 60*a|0},60,${a})`; ctx.lineWidth = 2.5; ctx.stroke(); ctx.lineCap = 'butt'; break; }
    case 'skull': ctx.fillStyle = '#cfc6b0'; circ(x, y, 5*s); ctx.fillRect(x - 3*s, y + 2*s, 6*s, 4*s); ctx.fillStyle = '#1a0d0a'; circ(x - 2*s, y, 1.4*s); circ(x + 2*s, y, 1.4*s); break;
  }
}
/* ---------- MAPA EM SALAS (3D) ---------- */
// Paredes com altura WALL_H: o topo fica deslocado para cima e a face de baixo (sul) aparece quando tem chão embaixo.
// Cores por tipo de mapa: [topo, face]; mapas abertos (campos/floresta/pântano) usam cerca viva/mata no lugar de pedra.
const WALL_H = 34;
const WALL_C = {field:['#4a6a2e','#2e4420'], forest:['#2a4a2a','#18301a'], swamp:['#3e4a2c','#262e1c'], mine:['#6a5a48','#43382c'], crypt:['#5c5a64','#3a3842'], ice:['#dfe9f2','#9aaebe'], desert:['#9a8262','#6a5840'], citadel:['#524864','#342c44'], hell:['#5a2a22','#331612']};
const WALL_LEAF = {field:1, forest:1, swamp:1};
// Bordas do mapa (para não ficar tudo quadrado):
//  - BORDER_TOP: enfeites em cima das paredes (árvores, pinheiros, pedras, cristais...) com chance `p` por parede de borda
//  - BORDER_TORCH: chance de tocha acesa na face da parede virada para o chão (masmorras)
//  - BORDER_FRINGE: cor do contorno irregular no pé da parede (mato, pedregulho, neve, areia...); `glow` = brilho de lava
const BORDER_TOP = {field:{t:['tree','bush','bush'], p:.3}, forest:{t:['tree','tree','bush'], p:.45}, swamp:{t:['deadtree','reed','bush'], p:.35},
  mine:{t:['rock','crystal'], p:.18}, crypt:{t:['tomb','skull'], p:.12}, ice:{t:['pine','pine','rock'], p:.35}, desert:{t:['rock','deadtree','skull'], p:.18},
  citadel:{t:['crystal','skull'], p:.12}, hell:{t:['rock','skull'], p:.18}};
const BORDER_TORCH = {mine:.16, crypt:.2, citadel:.22, hell:.12, desert:.06};
const BORDER_FRINGE = {field:'#4f6e30', forest:'#2f5a2c', swamp:'#4a5a2a', mine:'#4e4236', crypt:'#4a4852', ice:'#e6eef5', desert:'#8a7454', citadel:'#3e3448', hell:{c:'#3a1a12', glow:1}};
// Prepara (uma vez por mapa) o desenho do chão, a lista de paredes, o contorno irregular e os enfeites das bordas
function prepLevel(){
  if(LV.prep) return;
  const N = LV_N, g = LV.g, floor = new Path2D(), walls = [], aoN = [], fringe = [], props = [];
  const at = (x, y) => x < 0 || y < 0 || x >= N || y >= N ? 0 : g[y*N + x];
  const R = rng(N*7 + LV.solids.length*13 + Math.floor(LV.startPos.x)); // sorteio fixo por mapa
  const top = BORDER_TOP[mapDef.decor], torch = BORDER_TORCH[mapDef.decor] || 0;
  for(let y = 0; y < N; y++) for(let x = 0; x < N; x++){
    if(at(x, y)){
      floor.rect(x*TILE, y*TILE, TILE, TILE);
      if(!at(x, y - 1)) aoN.push([x, y]);
      // contorno: bolinhas no pé da parede (em cima, esquerda e direita do chão), quebrando a linha reta
      const add = (bx, by, horiz) => { for(let i = 0; i < 3; i++){ const t = (i + R()*.8)/3; fringe.push({x:horiz ? bx + t*TILE : bx + (R() - .5)*6, y:horiz ? by + (R() - .2)*5 : by + t*TILE, r:3 + R()*5}); } };
      if(!at(x, y - 1)) add(x*TILE, y*TILE, true);
      if(!at(x - 1, y)) add(x*TILE, y*TILE, false);
      if(!at(x + 1, y)) add((x + 1)*TILE, y*TILE, false);
      continue;
    }
    let near = false; for(let dy = -1; dy <= 1 && !near; dy++) for(let dx = -1; dx <= 1; dx++) if(at(x + dx, y + dy)){ near = true; break; }
    if(!near) continue;
    const w = {x:x*TILE, y:(y + 1)*TILE, tx:x, ty:y, south:!!at(x, y + 1), h:(x*73856093 ^ y*19349663) >>> 0};
    walls.push(w);
    // enfeite em cima da parede (fica por cima dela na ordem de desenho)
    if(top && R() < top.p){ const t = top.t[Math.floor(R()*top.t.length)]; props.push({ys:w.y + .5, o:{t, x:x*TILE + TILE*(.3 + R()*.4), y:y*TILE + TILE*(.45 + R()*.3) - WALL_H, s:.75 + R()*.45, v:R()}}); }
    // tocha na face da parede que dá para o chão
    if(w.south && R() < torch) props.push({ys:w.y + .6, torch:{x:x*TILE + TILE/2, y:(y + 1)*TILE - WALL_H*.6, v:R()*9}});
  }
  LV.prep = {floor, walls, aoN, fringe, props};
}
// Tocha presa na parede: suporte de ferro, chama que tremula e luz quente em volta
function drawWallTorch(t){
  const f = .8 + .2*Math.sin(T*11 + t.v) + .08*Math.sin(T*23 + t.v);
  // luz: 3 círculos transparentes (mais leve que degradê no celular)
  ctx.fillStyle = '#ffaa46'; for(const [r, a] of [[62, .07], [40, .08], [22, .1]]){ ctx.globalAlpha = a*f; circ(t.x, t.y - 4, r); } ctx.globalAlpha = 1;
  ctx.fillStyle = '#2a2420'; ctx.fillRect(t.x - 1.5, t.y - 2, 3, 9); ctx.fillRect(t.x - 4, t.y - 3, 8, 2.5);
  ctx.fillStyle = `rgba(255,${150 + 60*f | 0},50,.95)`; ell(t.x, t.y - 7*f, 3.6*f, 6.5*f);
  ctx.fillStyle = '#fff1b0'; ell(t.x, t.y - 5, 1.6, 3);
}
// Câmera 3D (03): parede como bloco de verdade (topo, face de baixo e o lado virado para o meio da tela), em px de tela via camP.
// WALL_H3 = altura no mundo (mais alta que WALL_H porque a câmera inclinada achata a altura).
const WALL_H3 = 50;
function drawWall3d(w){
  const C = WALL_C[mapDef.decor] || WALL_C.crypt, leaf = WALL_LEAF[mapDef.decor], N = LV_N, g = LV.g, H = WALL_H3;
  const at = (x, y) => x < 0 || y < 0 || x >= N || y >= N ? 0 : g[y*N + x];
  const X0 = w.x, X1 = w.x + TILE, Y0 = w.y - TILE, Y1 = w.y;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineWidth = .8; ctx.lineJoin = 'round';
  // parede na frente do herói (entre ele e a câmera) fica meio transparente, como no Diablo
  const front = w.y > hero.y && w.y - hero.y < TILE*2.2 && X0 < hero.x + TILE && X1 > hero.x - TILE;
  if(front) ctx.globalAlpha = .4;
  // contorno da mesma cor: fecha a fresta clara entre blocos vizinhos
  const q = (pts, c) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fillStyle = ctx.strokeStyle = c; ctx.fill(); ctx.stroke(); };
  if(X1 < cam.x && at(w.tx + 1, w.ty)) q([camP(X1, Y0, 0), camP(X1, Y1, 0), camP(X1, Y1, H), camP(X1, Y0, H)], shade(C[1], -.35));
  if(X0 > cam.x && at(w.tx - 1, w.ty)) q([camP(X0, Y0, 0), camP(X0, Y1, 0), camP(X0, Y1, H), camP(X0, Y0, H)], shade(C[1], -.1));
  if(w.south){
    const a = camP(X0, Y1, 0), b = camP(X1, Y1, 0), c = camP(X1, Y1, H), d = camP(X0, Y1, H);
    q([a, b, c, d], C[1]);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(b[0], b[1] - (b[1] - c[1])*.35); ctx.lineTo(a[0], a[1] - (a[1] - d[1])*.35); ctx.fill(); // pé da parede mais escuro
    if(!leaf){ ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1; for(const k of [.33, .66]) line(a[0], a[1] + (d[1] - a[1])*k, b[0], b[1] + (c[1] - b[1])*k); }
  }
  const t = [camP(X0, Y0, H), camP(X1, Y0, H), camP(X1, Y1, H), camP(X0, Y1, H)];
  q(t, shade(C[0], (leaf ? 0 : -.22) + ((w.h & 7) - 3.5)*.012));
  // quinas de cima viradas para o chão, iluminadas (mostram a altura mesmo quando só o topo aparece)
  ctx.strokeStyle = shade(C[0], .25); ctx.lineWidth = 1.4;
  if(w.south) line(t[3][0], t[3][1], t[2][0], t[2][1]);
  if(at(w.tx, w.ty - 1)) line(t[0][0], t[0][1], t[1][0], t[1][1]);
  if(at(w.tx - 1, w.ty)) line(t[0][0], t[0][1], t[3][0], t[3][1]);
  if(at(w.tx + 1, w.ty)) line(t[1][0], t[1][1], t[2][0], t[2][1]);
  if(leaf){ const r = (t[2][0] - t[3][0])*.24; for(let i = 0; i < 3; i++){ const p = camP(X0 + TILE*(.22 + i*.28), Y0 + TILE*(.3 + ((w.h >> (i*2)) & 3)*.13), H + 3); sphere(p[0], p[1], r*(.8 + ((w.h >> i) & 1)*.3), i % 2 ? C[0] : shade(C[0], .1)); } }
  ctx.globalAlpha = 1;
}
// Câmera 3D: enfeites em pé (árvores, pedras, trigo...) saem do chão esticado e são desenhados em pé (atY); estes ficam no chão
const FLAT_DECOR = {puddle:1, lava:1, bones:1};
// Chão (padrão do mapa só onde tem sala/corredor), sombra das paredes no chão e enfeites
function drawLevelFloor(vis){
  prepLevel();
  const C = WALL_C[mapDef.decor] || WALL_C.crypt;
  ctx.fillStyle = shade(C[1], -.55); ctx.fillRect(-200, -200, WORLD.w + 400, WORLD.h + 400);
  if(groundPat){ ctx.fillStyle = groundPat; ctx.fill(LV.prep.floor); }
  // sombra que a parede joga no chão logo abaixo dela
  for(const [x, y] of LV.prep.aoN){ const X = x*TILE, Y = y*TILE; if(!vis({x:X, y:Y})) continue; ctx.fillStyle = vgrad(Y, Y + 26, 'rgba(0,0,0,.45)', 'rgba(0,0,0,0)'); ctx.fillRect(X, Y, TILE, 26); }
  // contorno irregular no pé das paredes (mato, pedregulho, neve, areia...), com brilho de lava no Abismo
  // (tudo num caminho só por camada: um fill para todas as bolinhas visíveis — leve no celular)
  const FR = BORDER_FRINGE[mapDef.decor] || '#4a4852', frc = FR.c || FR, vf = LV.prep.fringe.filter(vis);
  const blobs = (k, dx, dy, min) => { ctx.beginPath(); for(const b of vf) if(b.r > min){ ctx.moveTo(b.x + dx*b.r + b.r*k, b.y + dy*b.r); ctx.arc(b.x + dx*b.r, b.y + dy*b.r, b.r*k, 0, TAU); } ctx.fill(); };
  ctx.fillStyle = frc; ctx.globalAlpha = .9; blobs(1, 0, 0, 0);
  ctx.globalAlpha = .45; ctx.fillStyle = shade(frc, .25); blobs(.45, -.3, -.35, 6);
  if(FR.glow){ ctx.fillStyle = '#ff5a1a'; ctx.globalAlpha = .28 + .15*Math.sin(T*3); blobs(.55, 0, 0, 6.5); }
  ctx.globalAlpha = 1;
  for(const o of decor) if(vis(o) && FLAT_DECOR[o.t]) drawDecor(o);
  // Masmorra: o chão fica com a cor do elemento da fase
  if(inDun()){ ctx.globalAlpha = .1; ctx.fillStyle = ELEM[dunEl()].c; ctx.fill(LV.prep.floor); ctx.globalAlpha = 1; }
}
// Paredes e obstáculos visíveis entram na ordenação por y junto com o herói e as criaturas
// Cada parede/obstáculo/enfeite ganha UMA vez um objeto de ordenação (o._e = {y, k, o}; k: ENT_WALL/ENT_DECOR/ENT_TORCH) e ele é
// reaproveitado todo quadro — antes eram centenas de objetos com função novos por quadro, e o coletor de lixo dava trancos.
const ENT_WALL = 1, ENT_DECOR = 2, ENT_TORCH = 3;
const entOf = (o, y, k) => o._e || (o._e = {y, k, o});
function drawEnt(e){ if(e.k === ENT_WALL) drawWall3d(e.o); else if(e.k === ENT_DECOR) drawDecor(e.o); else drawWallTorch(e.o); }
function levelProps(inb, out){
  for(const w of LV.prep.walls) if(inb(w.x + TILE/2, w.y - TILE/2)) out.push(entOf(w, w.y, ENT_WALL));
  for(const o of LV.solids) if(inb(o.x, o.y)) out.push(entOf(o, o.y, ENT_DECOR));
  // enfeites das bordas: em cima das paredes e tochas na face (logo depois da parede deles)
  for(const p of LV.prep.props){ const at = p.o || p.torch; if(inb(at.x, at.y)) out.push(p._e || (p._e = {y:p.ys, k:p.o ? ENT_DECOR : ENT_TORCH, o:at})); }
}
/* ---------- HERÓIS (corpo em pé com volume: luz vindo de cima à esquerda) ---------- */
const hexRGB = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
// k > 0 clareia, k < 0 escurece (cores em #rrggbb)
function shade(h, k){ const [r, g, b] = hexRGB(h), t = k > 0 ? 255 : 0, a = Math.abs(k); return `rgb(${r + (t - r)*a | 0},${g + (t - g)*a | 0},${b + (t - b)*a | 0})`; }
// Esfera com brilho e sombra
function sphere(x, y, r, c){ const g = ctx.createRadialGradient(x - r*.35, y - r*.45, r*.08, x, y, r*1.05); g.addColorStop(0, shade(c, .5)); g.addColorStop(.5, c); g.addColorStop(1, shade(c, -.6)); ctx.fillStyle = g; circ(x, y, r); }
// Degradê de cilindro (claro à esquerda, escuro à direita)
function cyl(x0, x1, c){ const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, shade(c, .35)); g.addColorStop(.45, c); g.addColorStop(1, shade(c, -.55)); return g; }
function rrect(x, y, w, h, r){ ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); ctx.fill(); }
// Cores da roupa: visual do Baú (skin) ou a cor escolhida na criação
const heroCloak = () => lookOf('skin') || CLOAKS[(S.char && S.char.color) || 0] || CLOAKS[0];
// Cor dos ataques do herói com o visual "Efeito dos ataques" (ou null)
const fxLook = () => lookOf('fx');
// Pose comum: espelha o corpo para o lado que olha; la = ângulo do braço já espelhado
function heroPose(h, ang){
  const a = ang === undefined ? h.face : ang;
  return {fx: Math.cos(a) >= 0 ? 1 : -1, la: Math.atan2(Math.sin(a), Math.abs(Math.cos(a))),
    walk: h.moving ? Math.sin(h.walkT*12) : 0, bob: h.moving ? Math.abs(Math.cos(h.walkT*12))*1.6 : Math.sin(T*2.2)*.5};
}
// Pernas com joelho, bota com cano e sola. o.knee = joelheira (Guerreiro), o.cuff = dobra da bota, o.thick = grossura.
// A perna de trás fica mais escura (cores em #rrggbb; a de trás usa cor sólida).
function heroLegs(walk, pants, boot, o){
  o = o || {};
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for(const s of [-1, 1]){
    const back = s < 0, fx = s*3 + walk*s*5, kx = s*3 + walk*s*2.6 + 1.2;
    ctx.strokeStyle = back ? shade(pants, -.3) : cyl(kx - 3, kx + 3, pants); ctx.lineWidth = o.thick || 5.6;
    ctx.beginPath(); ctx.moveTo(s*3, -15); ctx.lineTo(kx, -8); ctx.lineTo(fx, -3); ctx.stroke();
    if(o.knee){ if(back){ ctx.fillStyle = shade(o.knee, -.35); circ(kx, -8, 2.4); } else sphere(kx, -8, 2.6, o.knee); }
    ctx.fillStyle = back ? shade(boot, -.35) : cyl(fx - 3, fx + 4, boot); rrect(fx - 3, -6.5, 6.2, 6, 2);
    ctx.fillStyle = back ? shade(boot, -.4) : shade(boot, -.1); ell(fx + 1.8, -.4, 4.6, 2.3);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(fx - 2.8, .9, 9, 1.1);
    if(o.cuff){ ctx.fillStyle = back ? shade(o.cuff, -.3) : o.cuff; rrect(fx - 3.6, -7.6, 7.4, 2.4, 1); }
  }
  ctx.lineJoin = 'miter';
}
function drawHero(){
  const h = hero; if(h.alpha <= 0 || h.scale <= 0) return;
  ctx.save(); ctx.translate(h.x, h.y); ctx.globalAlpha = h.alpha; ctx.scale(h.scale, h.scale);
  ctx.fillStyle = 'rgba(0,0,0,.42)'; ell(0, 3, 15, 5.5);
  // Esquiva: o Mago some no meio do teleporte; o Arqueiro rola; o Guerreiro inclina para a frente
  const dg = h.dodge;
  if(dg){
    const k = clamp(dg.t/dg.dur, 0, 1), fx = Math.cos(h.face) >= 0 ? 1 : -1;
    if(isMage()) ctx.globalAlpha *= Math.abs(1 - 2*k)*.8 + .05;
    else if(isWar()) ctx.rotate(fx*.3);
    else { ctx.translate(0, -12); ctx.rotate(fx*k*TAU); ctx.translate(0, 12); }
  } else if(h.invul > 0 && !h.frenzy) ctx.globalAlpha *= .82 + .18*Math.sin(T*14); // sem levar dano: pulsa de leve (piscar forte incomodava)
  const war = isWar(), gc = war ? '224,87,74' : isMage() ? '255,150,50' : '155,216,74';
  if(h.cast){ const k = Math.sin(clamp(h.cast.t/h.cast.dur, 0, 1)*Math.PI); const g = ctx.createRadialGradient(0, -18, 4, 0, -18, 40); g.addColorStop(0, `rgba(${gc},${.45*k})`); g.addColorStop(1, `rgba(${gc},0)`); ctx.fillStyle = g; circ(0, -18, 40); }
  if(war) drawWarrior(h); else if(isMage()) drawMage(h); else drawArcher(h);
  ctx.restore();
}
// Frenesi Sangrento (suprema do Guerreiro): sombra de sangue que fica onde ele saltou (o próprio Guerreiro no meio do corte, todo
// tingido de sangue: desenhado normal e pintado por cima com 'source-atop' meio transparente; 1 desenho por lado, guardado) e o corte em meia-lua no alvo
const BG_BOX = [-44, -70, 96, 84], bgSpr = {};
function bloodGhostSprite(fx){
  if(bgSpr[fx]) return bgSpr[fx];
  const px = 2.5, c = document.createElement('canvas'); c.width = BG_BOX[2]*px; c.height = BG_BOX[3]*px;
  const g = c.getContext('2d'), keep = ctx; ctx = g;
  try{
    g.setTransform(px, 0, 0, px, -BG_BOX[0]*px, -BG_BOX[1]*px); g.lineCap = 'round'; g.lineJoin = 'round';
    drawWarrior({...hero, face:fx > 0 ? 0 : Math.PI, hit:0, swing:.25, moving:true, walkT:.15, atk:null, cast:null, dodge:null, whirl:null, dash:null, buff:null});
  } finally { ctx = keep; }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop';
  const gr = g.createLinearGradient(0, 0, 0, c.height); gr.addColorStop(0, '#ff5040'); gr.addColorStop(.55, '#b0101a'); gr.addColorStop(1, '#3a0306');
  g.globalAlpha = .78; g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  return bgSpr[fx] = {c};
}
function drawBloodFx(g){
  const k = g.t/g.life;
  if(g.k === 'ghost'){
    const e = bloodGhostSprite(g.fx);
    ctx.save(); ctx.globalAlpha = (1 - k)*.7; ctx.fillStyle = '#5a0408'; ell(g.x, g.y + 2, 14*(1 - k*.4), 4.5); // poça de sangue
    ctx.translate(g.x, g.y - k*6); ctx.drawImage(e.c, BG_BOX[0], BG_BOX[1], BG_BOX[2], BG_BOX[3]);
    ctx.fillStyle = '#9a0c14'; for(let i = 0; i < 4; i++){ const x = -8 + i*5.5, y = -30 + i*7 + k*30; ell(x, y, 1.3, 2.4); } // gotas escorrendo
    ctx.restore();
    return;
  }
  // corte: meia-lua grossa escura + fio claro, abrindo na direção do salto
  const R = g.r + 16 + k*10, cy = g.y - g.r*.9, a0 = g.ang - 1.3 + k*.5, a1 = g.ang + 1.1 + k*.5;
  ctx.save(); ctx.globalAlpha = 1 - k;
  ctx.strokeStyle = '#8a0f14'; ctx.lineWidth = 7*(1 - k*.5); ctx.beginPath(); ctx.ellipse(g.x, cy, R, R*.75, 0, a0, a1); ctx.stroke();
  ctx.strokeStyle = '#ff6a5a'; ctx.lineWidth = 3*(1 - k*.5); ctx.beginPath(); ctx.ellipse(g.x, cy, R*.94, R*.7, 0, a0 + .2, a1 - .1); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,240,230,.9)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(g.x, cy, R*.9, R*.67, 0, a0 + .4, a1 - .3); ctx.stroke();
  ctx.restore();
}
// Mago (fogo): manto em camadas com bainha dourada e runas acesas, faixa com gema, barba longa,
// chapéu de aba larga com ponta torta, e cajado retorcido com um cristal em chamas.
function drawMage(h){
  const p = heroPose(h), hit = h.hit > 0, W = c => hit ? '#ffffff' : c;
  const CL = heroCloak(), gold = W('#d8b04a'), skin = W('#d8aa86');
  const sway = Math.sin(T*2)*1.1 + (h.moving ? -1.6 : 0), rune = .45 + .3*Math.sin(T*3);
  ctx.save(); ctx.scale(p.fx, 1);
  // capa de trás
  ctx.fillStyle = cyl(-14, 4, W(CL.h)); ctx.beginPath(); ctx.moveTo(-5.5, -31); ctx.quadraticCurveTo(-13 + sway, -16, -13 + sway*1.4, -1); ctx.lineTo(-3, 0); ctx.closePath(); ctx.fill();
  heroLegs(p.walk*.6, W('#3a2e26'), W('#2a1f18'));
  ctx.translate(0, -p.bob);
  // braço de trás dentro da manga larga
  ctx.fillStyle = W(shade(CL.a, -.35)); ctx.beginPath(); ctx.moveTo(-4, -29); ctx.lineTo(-10 - p.walk, -16); ctx.lineTo(-6 - p.walk, -14.5); ctx.lineTo(-1, -26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = W(shade('#d8aa86', -.2)); circ(-8.5 - p.walk, -15, 2);
  // manto até os pés, com a barra ondulando
  ctx.fillStyle = cyl(-12, 12, W(CL.a)); ctx.beginPath(); ctx.moveTo(-6.5, -30.5); ctx.lineTo(6.5, -30.5); ctx.lineTo(11.5, -1 + p.walk);
  ctx.quadraticCurveTo(6.5, 1.8, 2, -.4); ctx.quadraticCurveTo(-3, 1.8, -11.5, -1 - p.walk); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = gold; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(11.5, -1 + p.walk); ctx.quadraticCurveTo(6.5, 1.8, 2, -.4); ctx.quadraticCurveTo(-3, 1.8, -11.5, -1 - p.walk); ctx.stroke();
  // painel da frente com runas de fogo
  ctx.fillStyle = cyl(-5, 5, W(CL.b)); ctx.beginPath(); ctx.moveTo(-3.4, -29); ctx.lineTo(3.4, -29); ctx.lineTo(5, -.8); ctx.lineTo(-5, -.8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = gold; ctx.lineWidth = .8; ctx.stroke();
  ctx.strokeStyle = `rgba(255,170,60,${rune})`; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-1.6, -9); ctx.lineTo(0, -12); ctx.lineTo(1.6, -9); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -7.5); ctx.lineTo(0, -4); ctx.moveTo(-1.5, -5.7); ctx.lineTo(1.5, -5.7); ctx.stroke();
  // faixa com gema de fogo
  ctx.fillStyle = W('#7a2a1a'); rrect(-7.5, -19, 15, 2.8, 1);
  ctx.beginPath(); ctx.moveTo(-5.5, -16.5); ctx.lineTo(-7.5 + sway*.6, -10); ctx.lineTo(-4.5 + sway*.6, -10.5); ctx.lineTo(-3.5, -16.5); ctx.fill();
  sphere(0, -17.6, 1.9, W('#ff8a2b'));
  // gola (mantelete) com borda dourada
  ctx.fillStyle = cyl(-8, 8, W(CL.h)); ell(-.3, -30.2, 8, 3.3);
  ctx.strokeStyle = gold; ctx.lineWidth = .9; ctx.beginPath(); ctx.ellipse(-.3, -30.2, 8, 3.3, 0, .2, Math.PI - .2); ctx.stroke();
  // rosto, sobrancelha e barba longa que balança
  sphere(2.4, -35, 4.7, skin);
  ctx.fillStyle = W('#ece6dc'); ctx.beginPath(); ctx.moveTo(.4, -33.4); ctx.quadraticCurveTo(6, -33.2, 7.2, -30.6);
  ctx.quadraticCurveTo(5.8, -24.5 + sway*.3, 2.4 + sway*.5, -20.5); ctx.quadraticCurveTo(1.4, -25.5, .3, -29.5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = .7; line(3.6, -31, 3.2 + sway*.3, -23);
  ctx.fillStyle = W('#e8e2d8'); rrect(3.4, -37.6, 3.4, 1.1, .5);
  ctx.fillStyle = '#1b1410'; circ(5, -35.9, .85);
  // chapéu: aba larga e ponta torta com faixa dourada e broche de chama
  ctx.fillStyle = W(shade(CL.h, -.45)); ell(.4, -37.8, 11.5, 2.6);
  ctx.fillStyle = cyl(-12, 12, W(CL.h)); ell(0, -38.8, 11.6, 3.1);
  ctx.fillStyle = cyl(-7, 8, W(CL.h)); ctx.beginPath(); ctx.moveTo(-6.5, -39.4); ctx.quadraticCurveTo(-2.5, -51, 5 + sway - p.walk*.6, -56.5);
  ctx.quadraticCurveTo(9 + sway, -56, 8.5 + sway, -52.5); ctx.quadraticCurveTo(2.5, -48, 6.6, -39.4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = gold; rrect(-6.6, -42.3, 13.2, 2.4, 1);
  sphere(3.6, -41.1, 1.4, W('#ff8a2b'));
  // braço do cajado: ergue ao lançar
  let raise = 0;
  if(h.atk && !h.atk.rel) raise = .5*clamp(h.atk.t/(h.atk.dur*.55), 0, 1);
  if(h.cast && !h.cast.done) raise = clamp(h.cast.t/(h.cast.dur*.6), 0, 1);
  const a1 = p.la*.6 - .25 - raise*.9;
  ctx.save(); ctx.translate(4, -26); ctx.rotate(a1);
  ctx.fillStyle = cyl(-4, 4, W(CL.a)); ctx.beginPath(); ctx.moveTo(0, -3.2); ctx.lineTo(8.5, -4.2); ctx.lineTo(10, 4); ctx.lineTo(0, 3.2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = gold; ctx.lineWidth = 1.2; line(8.8, -4, 10, 3.6);
  sphere(10.6, 0, 2.3, skin);
  ctx.rotate(-1.35);
  const eq = S.eq.bow, wood = eq && eq.rar ? RAR[eq.rar].c : '#a07a4a';
  ctx.lineCap = 'round'; ctx.strokeStyle = cyl(-2, 2, W('#6b4a2b')); ctx.lineWidth = 3.2; line(-14, 10, 21, 10);
  ctx.strokeStyle = wood; ctx.lineWidth = 1; for(let i = -12; i < 18; i += 5) line(i, 8.6, i + 2.5, 11.4); // faixa em espiral
  ctx.strokeStyle = W('#5a3a20'); ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(25, 10, 4.6, Math.PI*.7, Math.PI*1.3); ctx.stroke(); ctx.beginPath(); ctx.arc(25, 10, 4.6, -Math.PI*.3, Math.PI*.3); ctx.stroke(); // garras
  // cristal e chamas (as chamas sobem para cima do mundo, qualquer que seja o ângulo do braço)
  const glow = .65 + .35*Math.sin(T*6) + raise*.5, og = ctx.createRadialGradient(25, 10, 1, 25, 10, 11*glow + 4);
  og.addColorStop(0, 'rgba(255,240,190,.95)'); og.addColorStop(.4, 'rgba(255,150,50,.6)'); og.addColorStop(1, 'rgba(255,70,20,0)');
  ctx.fillStyle = og; circ(25, 10, 11*glow + 4);
  ctx.save(); ctx.translate(25, 10); ctx.rotate(-(a1 - 1.35));
  ctx.fillStyle = W('#ffcf6a'); ctx.beginPath(); ctx.moveTo(0, -4.5); ctx.lineTo(2.8, 0); ctx.lineTo(0, 4); ctx.lineTo(-2.8, 0); ctx.closePath(); ctx.fill();
  for(let i = 0; i < 3; i++){ const ox = (i - 1)*2.2, hgt = (6 + 3*Math.sin(T*9 + i*2))*(1 + raise*.6);
    ctx.fillStyle = i === 1 ? 'rgba(255,230,140,.9)' : 'rgba(255,120,40,.75)'; ctx.beginPath(); ctx.moveTo(ox - 1.6, -2); ctx.quadraticCurveTo(ox + Math.sin(T*7 + i)*1.5, -2 - hgt, ox + 1.6, -2); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  ctx.restore();
  ctx.lineCap = 'butt';
  ctx.restore();
}
// Arqueiro (veneno): capa que balança, aljava com flechas de ponta verde, túnica com colete de couro e alça no peito,
// capuz com bico, rosto na sombra com lenço, braçadeiras e arco recurvo com empunhadura enrolada.
function drawArcher(h){
  const p = heroPose(h), hit = h.hit > 0, W = c => hit ? '#ffffff' : c;
  const CL = heroCloak(), leather = W('#6a4a2e'), dark = W('#3e2a1a'), skin = W('#d2a07a');
  const sway = Math.sin(T*2.4)*1.2 + (h.moving ? -2.2 : 0);
  ctx.save(); ctx.scale(p.fx, 1);
  // capa atrás (balança com o vento e ao andar)
  ctx.fillStyle = cyl(-15, 5, W(CL.a)); ctx.beginPath(); ctx.moveTo(-5, -31); ctx.quadraticCurveTo(-13 + sway, -18, -12.5 + sway*1.6, -5 - p.walk);
  ctx.lineTo(-8 + sway*1.3, -6.5); ctx.lineTo(-4 + sway, -5); ctx.quadraticCurveTo(-2, -18, 3, -30); ctx.closePath(); ctx.fill();
  heroLegs(p.walk, W('#4a3a28'), W('#2e2218'), {cuff: W('#5a4230')});
  ctx.translate(0, -p.bob);
  // aljava nas costas, flechas com ponta verde
  ctx.save(); ctx.translate(-6.5, -25); ctx.rotate(-.38);
  ctx.fillStyle = cyl(-4, 4, leather); rrect(-3.6, -9, 7.2, 18, 2.6);
  ctx.fillStyle = dark; ctx.fillRect(-3.6, -4.5, 7.2, 1.3); ctx.fillRect(-3.6, 4, 7.2, 1.3);
  for(let i = 0; i < 4; i++){ const ax = -2.7 + i*1.8; ctx.fillStyle = W('#e4ddc9'); ctx.fillRect(ax, -14.5, 1.2, 6);
    ctx.fillStyle = i % 2 ? W('#7ac04a') : W('#a8e070'); ctx.beginPath(); ctx.moveTo(ax - .7, -14.5); ctx.lineTo(ax + .6, -18); ctx.lineTo(ax + 1.9, -14.5); ctx.fill(); }
  ctx.restore();
  // túnica (cor da roupa) e colete de couro
  ctx.fillStyle = cyl(-9, 9, W(CL.b)); ctx.beginPath(); ctx.moveTo(-6.5, -31); ctx.lineTo(6.5, -31); ctx.lineTo(8.5, -11 + p.walk*.6); ctx.lineTo(-8.5, -11 - p.walk*.6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = cyl(-7, 7, leather); ctx.beginPath(); ctx.moveTo(-6, -30); ctx.lineTo(5.6, -30); ctx.lineTo(6.6, -16.5); ctx.lineTo(-6.6, -16.5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = .8; line(-.4, -29, -.4, -17.5);
  ctx.strokeStyle = dark; ctx.lineWidth = 2; line(-6, -30, 5.4, -17.5); // alça da aljava
  ctx.fillStyle = W('#c9a24a'); circ(-.4, -23.6, 1.1);
  // cinto, fivela e bolsinha
  ctx.fillStyle = dark; rrect(-7.6, -17.3, 15.2, 2.8, 1); ctx.fillStyle = W('#c9a24a'); rrect(-1.6, -17.6, 3.2, 3.4, .8);
  ctx.fillStyle = cyl(3, 8, leather); rrect(3.6, -16, 4.4, 5, 1.5);
  // gola da capa com broche de folha
  ctx.fillStyle = cyl(-8, 8, W(CL.h)); ell(-.5, -30.6, 7.6, 3);
  ctx.fillStyle = W('#9bd84a'); ctx.beginPath(); ctx.ellipse(4.2, -30.2, 1.9, 1.1, -.6, 0, TAU); ctx.fill();
  // cabeça: capuz com bico, rosto na sombra e lenço
  sphere(-.6, -37.5, 7.8, W(CL.h));
  ctx.fillStyle = cyl(-3, 9, W(CL.h)); ctx.beginPath(); ctx.moveTo(-2, -45.2); ctx.quadraticCurveTo(6.5, -46, 8.8, -39.2); ctx.lineTo(4, -40.2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = W('#22180f'); ell(3.7, -36.2, 4.5, 4.7);
  ctx.fillStyle = skin; ell(4.5, -35.6, 3.3, 3.6);
  ctx.fillStyle = '#1b1410'; circ(6, -36.7, .85);
  ctx.fillStyle = cyl(0, 9, W(CL.b)); ctx.beginPath(); ctx.moveTo(1, -34.1); ctx.quadraticCurveTo(5, -33, 8.4, -33.6); ctx.quadraticCurveTo(7.6, -30, 2.4, -30.6); ctx.closePath(); ctx.fill();
  // braços e arco apontando para o alvo
  let pull = 0, raise = 0, kind = 'arrow';
  if(h.atk && !h.atk.rel) pull = clamp(h.atk.t/(h.atk.dur*.55), 0, 1);
  if(h.cast){ pull = h.cast.done ? 0 : clamp(h.cast.t/(h.cast.dur*.6), 0, 1); raise = h.cast.id === 'rain' ? 1 : 0; kind = h.cast.id; }
  const eq = S.eq.bow, bowCol = eq ? (eq.rar ? RAR[eq.rar].c : '#9a6a36') : '#7a5a3a';
  ctx.save(); ctx.translate(2, -27); ctx.rotate(p.la - raise*.9);
  const bx = 16, sx = bx - 3 - pull*10;
  ctx.lineCap = 'round'; ctx.strokeStyle = W(shade(CL.b, -.15)); ctx.lineWidth = 3.6;
  line(0, 1.5, sx, 0); line(0, -1, bx, 0);
  ctx.strokeStyle = leather; ctx.lineWidth = 4.2; line(bx - 5.5, -.3, bx - 2, -.1); // braçadeira
  sphere(bx, 0, 2.3, skin); sphere(sx, 0, 2.1, skin);
  // arco recurvo (as pontas viram para fora)
  const bend = 9 - pull*2.5;
  ctx.beginPath(); ctx.moveTo(bx - 5, -17.5); ctx.quadraticCurveTo(bx - 1, -16, bx + bend*.55, -9); ctx.quadraticCurveTo(bx + bend*.75, -3, bx + 1.5, 0);
  ctx.quadraticCurveTo(bx + bend*.75, 3, bx + bend*.55, 9); ctx.quadraticCurveTo(bx - 1, 16, bx - 5, 17.5);
  ctx.strokeStyle = W(bowCol); ctx.lineWidth = 3.2; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; ctx.stroke();
  if(eq && eq.rar >= 2){ ctx.strokeStyle = RAR[eq.rar].c + (eq.rar === LEG_R ? '5a' : '40'); ctx.lineWidth = 7; ctx.stroke(); }
  ctx.fillStyle = dark; rrect(bx - .3, -2.6, 3.4, 5.2, 1); // empunhadura
  ctx.strokeStyle = '#e8e2d0'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(bx - 5, -17.5); ctx.lineTo(sx, 0); ctx.lineTo(bx - 5, 17.5); ctx.stroke();
  if(pull > .05){
    const FX = fxLook(), tip = FX ? FX.c : kind === 'arrow' ? '#9bd84a' : '#c8ff6a';
    ctx.strokeStyle = W('#d9cfb4'); ctx.lineWidth = 1.8; line(sx, 0, sx + 22, 0);
    ctx.fillStyle = W('#e8e2d0'); ctx.beginPath(); ctx.moveTo(sx - 1, 0); ctx.lineTo(sx + 4, -2.6); ctx.lineTo(sx + 4, 2.6); ctx.fill(); // penas
    ctx.fillStyle = tip; ctx.beginPath(); ctx.moveTo(sx + 27, 0); ctx.lineTo(sx + 21, -3.2); ctx.lineTo(sx + 21, 3.2); ctx.fill();
    // gota de veneno pingando da ponta
    const dr = (T*1.6) % 1; ctx.save(); ctx.globalAlpha *= 1 - dr; circ(sx + 23, 2 + dr*7, 1.1); ctx.restore();
    if(kind !== 'arrow'){ ctx.fillStyle = 'rgba(184,240,112,.35)'; circ(sx + 24, 0, 6); }
  }
  ctx.restore();
  ctx.lineCap = 'butt';
  ctx.restore();
}
function drawWarrior(h){
  const w = h.whirl, p = heroPose(h, w ? w.ang : undefined), hit = h.hit > 0, W = c => hit ? '#ffffff' : c;
  const CL = heroCloak(), steel = '#9aa3ad';
  if(w){ const FX = fxLook(); ctx.strokeStyle = FX ? FX.c + '55' : 'rgba(235,190,150,.28)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(0, -16, 30, 14, 0, 0, TAU); ctx.stroke(); }
  const plate = W('#a3acb6'), plateD = W('#6e7780'), gold = W('#d8b85a');
  const sway = Math.sin(T*2.2)*1 + (h.moving ? -2.5 : 0) + (w ? -4 : 0);
  ctx.save();
  if(h.dash) ctx.rotate(Math.cos(h.face) >= 0 ? .22 : -.22);
  ctx.scale(p.fx, 1);
  // capa atrás
  ctx.fillStyle = cyl(-15, 4, W(CL.a)); ctx.beginPath(); ctx.moveTo(-6, -31); ctx.quadraticCurveTo(-14 + sway, -17, -12.5 + sway*1.5, -3 - p.walk);
  ctx.lineTo(-8 + sway*1.2, -5); ctx.lineTo(-3.5 + sway, -3.5); ctx.quadraticCurveTo(-1, -18, 4, -30); ctx.closePath(); ctx.fill();
  heroLegs(p.walk, W('#6b737c'), W('#4a4448'), {knee:plate, thick:6.2});
  ctx.translate(0, -p.bob);
  // braço livre com manopla
  ctx.lineCap = 'round'; ctx.strokeStyle = plateD; ctx.lineWidth = 4.8; line(-7, -27, -9 - p.walk*1.5, -17);
  sphere(-9 - p.walk*1.5, -16, 2.9, plate);
  // saia de cota de malha
  ctx.fillStyle = W('#5a626a'); rrect(-8.5, -17.5, 17, 7.5, 2);
  ctx.fillStyle = 'rgba(255,255,255,.18)'; for(let r = 0; r < 2; r++) for(let i = 0; i < 6; i++) circ(-6.8 + i*2.8 + (r ? 1.4 : 0), -15.6 + r*2.8, .7);
  // couraça com reflexo
  ctx.fillStyle = cyl(-10, 10, plate); rrect(-9, -32, 18, 17, 5);
  ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(-2.5, -26, 6, Math.PI*1.1, Math.PI*1.55); ctx.stroke();
  // tabardo (cor da roupa) com borda dourada e emblema de gota de sangue
  ctx.fillStyle = cyl(-6, 6, W(CL.b)); ctx.beginPath(); ctx.moveTo(-5, -27.5); ctx.lineTo(5, -27.5); ctx.lineTo(6.2, -7 + p.walk*.8); ctx.lineTo(0, -4.5); ctx.lineTo(-6.2, -7 - p.walk*.8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = gold; ctx.lineWidth = .9; ctx.stroke();
  ctx.fillStyle = W('#c0281e'); ctx.beginPath(); ctx.moveTo(0, -23.5); ctx.quadraticCurveTo(2.6, -20, 0, -18.2); ctx.quadraticCurveTo(-2.6, -20, 0, -23.5); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; circ(-.6, -19.8, .6);
  // cinto
  ctx.fillStyle = W('#3e2a1a'); rrect(-9.5, -16.8, 19, 3, 1); ctx.fillStyle = gold; rrect(-1.6, -17.2, 3.2, 3.8, .8);
  // gorjal e ombreiras em camadas
  sphere(0, -31, 4.4, plate);
  for(const sd of [-1, 1]){ sphere(sd*8, -29.6, 5.4, plate); ctx.fillStyle = plateD; ell(sd*8.4, -26.8, 5, 1.5); ctx.fillStyle = gold; circ(sd*8 - 1.5, -31.2, .8); }
  // pluma (cor da roupa) atrás do elmo
  ctx.fillStyle = cyl(-14, 0, W(CL.b)); ctx.beginPath(); ctx.moveTo(-.5, -45.5); ctx.quadraticCurveTo(-8, -52, -15 + sway, -43); ctx.quadraticCurveTo(-11 + sway*.6, -42, -8, -44); ctx.quadraticCurveTo(-5, -43, -.5, -42); ctx.closePath(); ctx.fill();
  // elmo com crista, viseira e respiros
  sphere(.5, -38.5, 7.6, plate);
  ctx.strokeStyle = plateD; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(.5, -38.5, 7.6, Math.PI*1.2, Math.PI*1.75); ctx.stroke();
  ctx.fillStyle = '#15181c'; rrect(2, -40.4, 6.4, 2.3, 1);
  for(let i = 0; i < 3; i++) circ(5 + i*1.3, -35.4, .55);
  ctx.fillStyle = gold; rrect(-.4, -46.2, 1.8, 3, .6);
  // braço da espada: prepara, corta e gira
  let arm = p.la + .55;
  if(w) arm = p.la;
  else if(h.atk && !h.atk.rel) arm = p.la - 1.7*clamp(h.atk.t/(h.atk.dur*.55), 0, 1);
  else if(h.swing > 0) arm = p.la - 1.7 + 2.5*clamp(1 - h.swing/.25, 0, 1);
  else if(h.cast && !h.cast.done) arm = p.la - 1.9*clamp(h.cast.t/(h.cast.dur*.6), 0, 1);
  const eq = S.eq.bow, glow = eq && eq.rar >= 2 ? RAR[eq.rar].c + (eq.rar === LEG_R ? '73' : '59') : null;
  ctx.save(); ctx.translate(6, -27); ctx.rotate(arm);
  ctx.lineCap = 'round'; ctx.strokeStyle = plateD; ctx.lineWidth = 4.8; line(0, 0, 10, 0);
  sphere(11, 0, 3, plate);
  // espada longa: pomo, cabo de couro, guarda dourada com pontas, lâmina com sulco e runas de sangue
  sphere(7.4, 0, 1.6, gold);
  ctx.fillStyle = W('#4a3020'); rrect(8.5, -1.3, 4.6, 2.6, 1);
  ctx.fillStyle = gold; rrect(12.6, -5.2, 2.6, 10.4, 1); circ(13.9, -5.4, 1.3); circ(13.9, 5.4, 1.3);
  const L = 27, bg = ctx.createLinearGradient(0, -2.4, 0, 2.4); bg.addColorStop(0, '#f4f7fa'); bg.addColorStop(.5, hit ? '#fff' : '#b3bcc6'); bg.addColorStop(1, '#5f6770');
  if(glow){ ctx.strokeStyle = glow; ctx.lineWidth = 8; line(15, 0, 13 + L, 0); }
  ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(15, -2.4); ctx.lineTo(13 + L - 6, -2.2); ctx.lineTo(13 + L, 0); ctx.lineTo(13 + L - 6, 2.2); ctx.lineTo(15, 2.4); ctx.fill();
  ctx.strokeStyle = 'rgba(60,66,74,.6)'; ctx.lineWidth = .8; line(16, 0, 13 + L - 7, 0); // sulco
  ctx.fillStyle = `rgba(230,40,30,${.45 + .3*Math.sin(T*4)})`; for(let i = 0; i < 3; i++) circ(19 + i*5.5, 0, .9); // runas
  if(h.swing > 0 && !w){ const FX = fxLook(); ctx.save(); ctx.strokeStyle = FX ? FX.c : 'rgb(255,240,220)'; ctx.globalAlpha *= Math.min(1, .5*h.swing/.25 + (FX ? .3 : 0)); ctx.lineWidth = FX ? 4 : 3; ctx.beginPath(); ctx.arc(0, 0, 32, -.9, .4); ctx.stroke(); ctx.restore(); }
  ctx.restore();
  ctx.lineCap = 'butt';
  ctx.restore();
}
/* ---------- CRIATURAS (em pé, de lado, com o mesmo volume dos heróis) ---------- */
// Desenhadas em "unidades de herói" (herói ≈ 13 de raio, 44 de altura) e escaladas por r/13. Os pés ficam em m.y + r*.6 (onde ficam a sombra e a marca do alvo).
// Detalhe de cada criatura (chapéu, chifres, ossos...): MON_DECO[tipo]
const MON_DECO = {rato:'rat', espantalho:'straw', zumbi:'zombie', lobo:'wolf', ent:'tree', sapo:'frog', sanguessuga:'leech', bruxa:'witch', esqueleto:'bones', ossudo:'bones',
  carnical:'ghoul', diabrete:'imp', brutamonte:'horns', cao:'wolf', goblin:'goblin', golem:'rock', lobogelo:'wolf', yeti:'fur', espirito:'ghost', escorpiao:'scorp',
  mumia:'wrap', cultista:'hood', cavaleiro:'knight', gargula:'wings', feiticeiro:'hood',
  javali:'ghoul', lavrador:'straw', urso:'wolf', fada:'ghost', crocodilo:'ghoul', afogado:'zombie', morcego:'wings', escavador:'goblin',
  fantasma:'ghost', harpia:'wings', mamute:'wolf', chacal:'wolf', serpente:'leech', servo:'hood', elemental:'ghost', carrasco:'horns'};
// Altura do desenho em múltiplos do raio (barra de vida e brilho dos efeitos)
const MON_H = {biped:3.5, quad:2.2, spider:1.6, blob:1.9, ghost:2.6, scorp:2.6, wings:2.6};
const monH = m => (MON_H[MON_DECO[m.type]] || MON_H[m.d.kind] || 2.2)*m.r;
// Volume das criaturas: luz de cima à esquerda (lado claro), sombra própria embaixo, brilho especular e contorno escuro.
// tone() devolve #rrggbb (dá para passar de novo para shade/vol); vol() = elipse "3D"; seg()/limb() = membros afinando com joelho.
const hx6 = n => (n < 16 ? '0' : '') + n.toString(16);
function tone(h, k){ const [r, g, b] = hexRGB(h), t = k > 0 ? 255 : 0, a = Math.abs(k); return '#' + hx6(r + (t - r)*a | 0) + hx6(g + (t - g)*a | 0) + hx6(b + (t - b)*a | 0); }
const M_OUT = 'rgba(14,9,6,.55)';
function vol(x, y, rx, ry, c, spec, noLine, rot){
  rx = Math.max(.1, rx); ry = Math.max(.1, ry);
  const R = Math.max(rx, ry), g = ctx.createRadialGradient(x - rx*.42, y - ry*.52, R*.05, x - rx*.08, y - ry*.1, R*1.15);
  g.addColorStop(0, shade(c, .5)); g.addColorStop(.32, shade(c, .14)); g.addColorStop(.68, c); g.addColorStop(1, shade(c, -.7));
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU); ctx.fill();
  if(!noLine){ ctx.strokeStyle = M_OUT; ctx.lineWidth = .9; ctx.stroke(); }
  if(spec){ const a = ctx.globalAlpha; ctx.globalAlpha = a*spec; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x - rx*.4, y - ry*.5, rx*.24, ry*.14, -.6, 0, TAU); ctx.fill(); ctx.globalAlpha = a; }
}
// Pedaço de membro (de w0 a w1 de largura), redondo nas pontas; o lado virado para a luz fica claro (cilindro)
function seg(x0, y0, x1, y1, w0, w1, c){
  const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a), h0 = w0/2, h1 = w1/2, l = nx + ny < 0 ? 1 : -1;
  const g = ctx.createLinearGradient(x0 + nx*h0*l, y0 + ny*h0*l, x0 - nx*h0*l, y0 - ny*h0*l);
  g.addColorStop(0, shade(c, .38)); g.addColorStop(.42, c); g.addColorStop(1, shade(c, -.58));
  ctx.fillStyle = g; ctx.beginPath();
  ctx.moveTo(x0 + nx*h0, y0 + ny*h0); ctx.lineTo(x1 + nx*h1, y1 + ny*h1);
  ctx.arc(x1, y1, h1, a + Math.PI/2, a - Math.PI/2, true);
  ctx.lineTo(x0 - nx*h0, y0 - ny*h0);
  ctx.arc(x0, y0, h0, a - Math.PI/2, a + Math.PI/2, true);
  ctx.closePath(); ctx.fill(); ctx.strokeStyle = M_OUT; ctx.lineWidth = .8; ctx.stroke();
}
function limb(x0, y0, x1, y1, x2, y2, w0, w1, w2, c){ seg(x0, y0, x1, y1, w0, w1, c); seg(x1, y1, x2, y2, w1, w2, c); }
// Sobrancelha brava (risco escuro em cima do olho) e olho que brilha
function brow(x0, y0, x1, y1){ ctx.strokeStyle = 'rgba(10,6,4,.6)'; ctx.lineWidth = 1.3; line(x0, y0, x1, y1); }
function eyeDot(x, y, r, c){ const a = ctx.globalAlpha; ctx.globalAlpha = a*.3; ctx.fillStyle = c; circ(x, y, r*2.6); ctx.globalAlpha = a; ctx.fillStyle = c; circ(x, y, r); ctx.fillStyle = 'rgba(255,255,255,.85)'; circ(x - r*.3, y - r*.3, r*.38); }
// Caminho preenchido com degradê de volume (luz em cima à esquerda) + contorno + oclusão escura embaixo (y0..y1 = alto e pé da forma)
function volPath(p, c, cx, y0, y1, half){
  const g = ctx.createRadialGradient(cx - half*.55, y0 + (y1 - y0)*.22, 1, cx, (y0 + y1)/2, Math.max(half*1.9, (y1 - y0)*.9));
  g.addColorStop(0, shade(c, .42)); g.addColorStop(.45, c); g.addColorStop(1, shade(c, -.62));
  ctx.fillStyle = g; ctx.fill(p);
  const ao = ctx.createLinearGradient(0, y1 - (y1 - y0)*.4, 0, y1); ao.addColorStop(0, 'rgba(0,0,0,0)'); ao.addColorStop(1, 'rgba(0,0,0,.38)');
  ctx.fillStyle = ao; ctx.fill(p);
  ctx.strokeStyle = M_OUT; ctx.lineWidth = .9; ctx.stroke(p);
}
// Cache de poses (sprites): o corpo de cada criatura é desenhado uma vez por pose — tipo, passo da caminhada (12 por passada), golpe
// (0, ¼, ½, ¾, 1), piscar de dano e, só para quem tem detalhe que mexe com o tempo (olhos acesos, asas, fogo, magia), 16 quadros a cada 2 s —
// num canvas pequeno, e depois só copiado com drawImage. Os volumes com degradê custam caro para refazer a cada quadro.
// SPR_BOX = área do desenho em unidades de herói por tipo de corpo [x, y, largura, altura]; SPR_MAX poses guardadas (as mais antigas saem).
const SPR_BOX = {biped:[-38, -66, 82, 78], quad:[-36, -50, 74, 58], spider:[-30, -44, 62, 50], blob:[-24, -44, 54, 52]};
const SPR_MAX = 200, SPR_T = {ghost:1, rock:1, wings:1, imp:1, frog:1, leech:1, scorp:1};
const sprCache = new Map(), sprPool = [];
function monSprite(m, ap, hit, s){
  const d = m.d, k = MON_DECO[m.type], blobIdle = !m.moving && d.kind === 'blob';
  const ph = m.moving ? Math.round(((m.anim*11) % TAU)/TAU*12) % 12 : blobIdle ? 12 + Math.round((m.anim % 1.6)/1.6*12) % 12 : -1;
  // detalhes com o tempo (asas, olhos acesos, fogo...): parada, 8 quadros a cada 2 s; andando, seguem o próprio passo (sem poses a mais)
  const tq = SPR_T[k] && !m.moving ? Math.floor((T % 2)*4) : 0;
  const sc = Math.round(clamp(dprBase*zoom*s*1.25, 1, 8)*2)/2; // pixels por unidade no sprite (passos de 0,5)
  const key = m.type + '|' + ph + '|' + ap + '|' + tq + '|' + (hit ? 1 : 0) + '|' + sc;
  let e = sprCache.get(key);
  if(e){ sprCache.delete(key); sprCache.set(key, e); return e; } // usado agora: vai para o fim da fila
  const B = SPR_BOX[d.kind] || SPR_BOX.biped, px = sc/s, c = sprPool.pop() || document.createElement('canvas');
  c.width = Math.ceil(B[2]*px); c.height = Math.ceil(B[3]*px);
  const g = c.getContext('2d'), keepCtx = ctx, keepT = T;
  ctx = g; T = !SPR_T[k] ? 0 : m.moving ? (ph/12)*1.8 : tq/4;
  try{
    g.setTransform(px, 0, 0, px, -B[0]*px, -B[1]*px); g.lineCap = 'round'; g.lineJoin = 'round';
    const anim = ph < 0 ? 0 : ph < 12 ? ph/12*TAU/11 : (ph - 12)/12*1.6, W = c => hit ? '#ffffff' : c;
    const fm = {type:m.type, d, anim, moving:m.moving};
    const P = {d, m:fm, k, c1:W(d.c1), c2:W(d.c2), eye:d.eye || '#ffcf5a', ap, hit, W,
      w: m.moving ? Math.sin(anim*11) : 0, bob: m.moving ? Math.abs(Math.cos(anim*11))*1.4 : 0};
    (d.kind === 'quad' ? monQuad : d.kind === 'spider' ? monSpider : d.kind === 'blob' ? monBlob : monBiped)(P);
  } finally { ctx = keepCtx; T = keepT; }
  e = {c, B}; sprCache.set(key, e);
  if(sprCache.size > SPR_MAX){ const old = sprCache.keys().next().value; sprPool.push(sprCache.get(old).c); sprCache.delete(old); }
  return e;
}
// Ao entrar num mapa: já desenha as poses de caminhada (e parada) das criaturas dele, para não desenhar no meio da luta (trancos)
function warmSprites(types){
  for(const t of types){
    const d = MONS[t]; if(!d) continue;
    const fm = {type:t, d, anim:0, moving:true}, s = d.r/13;
    for(let i = 0; i < 12; i++){ fm.anim = (i/12*TAU)/11 + 1e-6; monSprite(fm, 0, false, s); }
    fm.moving = false; fm.anim = 0; monSprite(fm, 0, false, s);
  }
}
function drawMon(m){
  const d = m.d, r = m.r, s = r/13, fx = Math.cos(m.face) >= 0 ? 1 : -1, H = monH(m), foot = r*.6;
  ctx.save(); ctx.translate(m.x, m.y + foot);
  if(m.dead) ctx.globalAlpha = Math.max(0, 1 - m.deadT/1.6);
  const lh = m.dead ? 0 : (m.leapH || 0), sk = 1 - lh/260; // altura do pulo: a sombra fica no chão e encolhe
  // sombra no chão: borda suave + miolo mais escuro (contato)
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ell(0, 0, r*1.5*sk, r*.52*sk);
  ctx.fillStyle = 'rgba(0,0,0,.32)'; ell(0, 0, r*1.02*sk, r*.32*sk);
  if(lh) ctx.translate(0, -lh);
  if(m.wind > 0 && !m.dead) ctx.translate(rnd(-1.5, 1.5), rnd(-1, 1)); // tremendo ao preparar o golpe
  // Masmorra: aura no chão com a cor do elemento que a criatura causa
  if(m.el && !m.dead){ ctx.globalAlpha = .3 + .1*Math.sin(T*4 + m.anim); ctx.fillStyle = ELEM[m.el].c; ell(0, 0, r*1.5, r*.6); ctx.globalAlpha = 1; }
  if(m.elite && !m.dead){ ctx.strokeStyle = `rgba(111,156,255,${.55 + .3*Math.sin(T*5)})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0, -1, r*1.45, r*.55, 0, 0, TAU); ctx.stroke(); }
  ctx.save();
  if(m.dead) ctx.rotate(fx*Math.min(1, m.deadT*4)*1.45); // cai para a frente
  const ap = m.atkT > 0 ? Math.sin((1 - m.atkT/.36)*Math.PI) : 0, aq = Math.round(ap*4)/4;
  ctx.scale(fx*s, s);
  if(!d.ranged) ctx.translate(aq*7, 0);
  if(!m.moving && d.kind !== 'blob') ctx.translate(0, -Math.sin(T*2 + m.x)*.5); // respirando parada
  const e = monSprite(m, aq, false, s);
  ctx.drawImage(e.c, e.B[0], e.B[1], e.B[2], e.B[3]);
  // levou dano: a mesma pose somada por cima ('lighter') clareia na hora — sem criar outra pose branca no cache
  if(m.hit > 0 && !m.dead){ const op = ctx.globalCompositeOperation, a = ctx.globalAlpha; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a*.75; ctx.drawImage(e.c, e.B[0], e.B[1], e.B[2], e.B[3]); ctx.globalCompositeOperation = op; ctx.globalAlpha = a; }
  ctx.restore();
  // dano ao longo do tempo: brilho por cima do corpo
  if(!m.dead){
    const tint = (a, c) => { ctx.globalAlpha = a; ctx.fillStyle = c; ell(0, -H*.45, r*1.05, H*.5); };
    if(m.poisons.length) tint(.2, '#8fd14f');
    if(m.bleeds.length) tint(.22, '#c0281e');
    if(m.burns.length) tint(.18 + .08*Math.sin(T*14 + m.anim), '#ff7a20');
  }
  ctx.restore();
}
// Humanoides: pernas com joelho, tronco com ombros, pescoço, cabeça com volume e um braço que ataca (ou lança a magia)
function monBiped(P){
  const {d, m, k, c1, c2, eye, w, bob, ap, W} = P, big = d.r >= 16, bony = k === 'bones', robe = k === 'witch' || k === 'hood';
  const dk = tone(c1, -.38), lw = bony ? 2.8 : big ? 7.6 : 6, hip = big ? -16 : -14;
  const top = big ? -37 : -31, hr = big ? 8 : 6.6, hx = 1.5, hy = top - (big ? 6 : 5.5), tw = big ? 11.5 : 8.5;
  const skin = k === 'tree' || k === 'rock' ? c1 : c2;
  // pernas: coxa e canela com joelho, a de trás mais escura; pé/bota com volume
  for(const sd of [-1, 1]){
    const c = sd < 0 ? dk : c1, fxp = sd*3.4 + w*sd*5.5, kx = sd*3 + w*sd*2.6 + 2, ky = hip*.5 - Math.abs(w)*1.2;
    if(k === 'tree'){ seg(sd*3.5, hip, fxp, -1.2, 9, 6.5, c); for(const o of [-4.5, 3, 6.5]) seg(fxp, -1.5, fxp + o, .6, 2.8, 1, c); continue; }
    limb(sd*3.2, hip, kx, ky, fxp, -2, lw, lw*.8, lw*.6, bony ? (sd < 0 ? tone(c2, -.3) : c2) : c);
    if(!robe) vol(fxp + 1.8, -1, bony ? 2.8 : lw*.75, bony ? 1.4 : 2.3, bony ? tone(c2, -.2) : tone(c, -.45), .2);
  }
  ctx.translate(0, -bob);
  // asas do diabrete (membrana com dedos, atrás de tudo)
  if(k === 'imp'){
    const f = Math.sin(T*10)*3, wc = tone(c1, -.3);
    ctx.fillStyle = vgrad(top - 12, top + 12, tone(wc, .25), tone(wc, -.4)); ctx.beginPath(); ctx.moveTo(-3, top + 4); ctx.lineTo(-18, top - 10 - f); ctx.quadraticCurveTo(-15, top - 1, -20, top + 5 - f*.5); ctx.quadraticCurveTo(-11, top + 6, -4, top + 12); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = M_OUT; ctx.lineWidth = .9; ctx.stroke(); ctx.strokeStyle = tone(c1, -.55); ctx.lineWidth = 1.2; line(-3, top + 4, -18, top - 10 - f); line(-6, top + 5, -15, top - 1); line(-6, top + 6, -20, top + 5 - f*.5);
  }
  // braço de trás (mais escuro)
  const aw = bony ? 2.5 : big ? 6 : 4.6, bx = -7 - w*2, by = top + 16;
  limb(-tw*.55, top + 3, -tw*.7 - w, top + 10, bx, by, aw, aw*.85, aw*.7, bony ? tone(c2, -.3) : dk);
  vol(bx, by + 1, bony ? 1.6 : aw*.55, bony ? 1.6 : aw*.55, tone(skin, -.3));
  // tronco
  if(bony){
    seg(0, top - 1, 0, hip, 2.4, 2, c2); // espinha
    ctx.strokeStyle = tone(c2, -.15); ctx.lineWidth = 1.8;
    for(let i = 0; i < 4; i++){ const y = top + 3 + i*3.6; ctx.beginPath(); ctx.ellipse(0, y, 6 - i*.6, 1.8, 0, Math.PI*.05, Math.PI*.95); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = .6; for(let i = 0; i < 4; i++){ ctx.beginPath(); ctx.ellipse(0, top + 2.6 + i*3.6, 6 - i*.6, 1.8, 0, Math.PI*.6, Math.PI*.95); ctx.stroke(); }
    vol(0, hip, 5.4, 2.6, c2, .25); // bacia
    vol(-tw*.5 + 1, top + 1, 2.4, 2, c2); vol(tw*.5 - 1, top + 1, 2.4, 2, c2); // ombros
  } else if(k === 'rock'){
    // golem: faces lapidadas (de frente mais clara, de lado escura, topo claro) e rachaduras que brilham
    const x0 = -12.5, x1 = 13, yT = top - 3, yB = hip + 2;
    poly([[x0, top + 4], [-8, yT], [9, yT - 1], [x1, top + 6], [10, yB], [-10, yB]], cyl(-12, 12, c1));
    poly([[-8, yT], [9, yT - 1], [6, top + 2], [-6, top + 3]], tone(c1, .28));
    poly([[x1, top + 6], [10, yB], [5, yB - 1], [7, top + 4]], tone(c1, -.4));
    ctx.strokeStyle = M_OUT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, top + 4); ctx.lineTo(-8, yT); ctx.lineTo(9, yT - 1); ctx.lineTo(x1, top + 6); ctx.lineTo(10, yB); ctx.lineTo(-10, yB); ctx.closePath(); ctx.stroke();
    const gl = .55 + .45*Math.sin(T*3 + m.anim); ctx.strokeStyle = eye; ctx.globalAlpha *= gl; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(-5, top + 2); ctx.lineTo(-2, top + 9); ctx.lineTo(-6, top + 15); ctx.moveTo(6, top + 5); ctx.lineTo(3, top + 12); ctx.stroke(); eyeDot(1, top + 12, 2.6, eye); ctx.globalAlpha /= gl;
  } else if(robe){
    // manto que abre embaixo, com dobras
    const p = new Path2D(), hw = tw*1.35;
    p.moveTo(-tw*.7, top - 1); p.lineTo(tw*.7, top - 1); p.quadraticCurveTo(tw + 2, top + 8, hw + w, -1.5);
    for(let i = 0; i < 4; i++){ const x = hw - (i + 1)*hw*.5; p.quadraticCurveTo(x + hw*.25, 1.5, x + w*.5, -1 - (i % 2)*1.5); }
    p.quadraticCurveTo(-tw - 2, top + 8, -tw*.7, top - 1); p.closePath();
    volPath(p, c1, 0, top - 1, 0, tw);
    ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 1.2; line(-3, top + 8, -5 - w, -2); line(3, top + 9, 4 + w, -2); ctx.strokeStyle = 'rgba(255,255,255,.12)'; line(-1, top + 8, -2 - w, -2);
    ctx.fillStyle = vgrad(-19, -16, W('#e8c860'), W('#8a6a22')); rrect(-tw*.75, -19, tw*1.5, 2.6, 1); // cordão dourado
  } else {
    const waist = tw*.74, p = new Path2D(), mid = (top + hip)/2;
    p.moveTo(-tw, top + 3); p.quadraticCurveTo(-tw - .5, top - 1.5, -tw + 4, top - 1.5); p.lineTo(tw - 4, top - 1.5); p.quadraticCurveTo(tw + .5, top - 1.5, tw, top + 3);
    p.quadraticCurveTo(tw*.98, mid, waist, hip + 1.5); p.lineTo(-waist, hip + 1.5); p.quadraticCurveTo(-tw*.98, mid, -tw, top + 3); p.closePath();
    volPath(p, k === 'goblin' ? c2 : c1, 0, top - 1.5, hip + 1.5, tw);
    if(k === 'knight'){
      vol(1, top + 7, tw*.72, 7.5, c2, .55); // peitoral de metal
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; line(1, top + 1, 1, top + 13);
      vol(-tw + 1.5, top + 1.5, 5.4, 4.2, c2, .6); // ombreira
      ctx.fillStyle = vgrad(hip - 4, hip, W('#5a4a3a'), W('#2a2018')); rrect(-waist, hip - 4, waist*2, 3.4, 1); ctx.fillStyle = W('#d8c27a'); rrect(-1.6, hip - 4.4, 3.2, 4.2, 1);
    } else if(k === 'fur'){
      vol(2, top + 11, tw*.62, 9, c2, .15, true); // barriga
      ctx.fillStyle = tone(c1, .12); for(let i = 0; i < 6; i++){ const x = -tw + 1 + i*tw*.38; ctx.beginPath(); ctx.moveTo(x - 2.4, hip); ctx.lineTo(x, hip + 4 + (i % 2)*1.5); ctx.lineTo(x + 2.4, hip); ctx.fill(); }
      ctx.strokeStyle = tone(c1, -.25); ctx.lineWidth = .9; for(let i = 0; i < 6; i++){ const y = top + 3 + i*3.2; line(-tw + 1.5, y, -tw + 4, y + 2); line(tw - 1.5, y, tw - 4, y + 2); }
    } else if(k === 'wrap'){
      for(let i = 0; i < 5; i++){ const y = top + 2 + i*4.2; ctx.fillStyle = i % 2 ? tone(c1, .14) : tone(c1, -.12); ctx.beginPath(); ctx.moveTo(-tw + .5, y); ctx.lineTo(tw - .5, y - 1.3); ctx.lineTo(tw - .8, y + 1.5); ctx.lineTo(-tw + .8, y + 2.6); ctx.fill(); }
      ctx.fillStyle = tone(c1, .05); ctx.beginPath(); ctx.moveTo(waist - 1, hip); ctx.lineTo(waist + 2, hip + 6 + w); ctx.lineTo(waist - 3, hip + 1); ctx.fill(); // tira solta
    } else if(k === 'tree'){
      ctx.strokeStyle = tone(c1, -.45); ctx.lineWidth = 1.4; line(-4, top + 2, -3, hip); line(3, top + 4, 4, hip); line(-1, top + 6, 0, top + 14); ctx.strokeStyle = 'rgba(255,255,255,.13)'; line(-5.5, top + 3, -4.5, hip);
      vol(3, top + 4, 6.5, 4.2, c2, .1); vol(-5, top + 13, 3.6, 2.6, c2, 0, true); // musgo
    } else if(k === 'straw'){
      ctx.fillStyle = vgrad(-18, -15, W('#6a4a2a'), W('#3a2614')); rrect(-waist - 1, -18.5, waist*2 + 2, 3, 1); // corda
      ctx.strokeStyle = W('#e8d07a'); ctx.lineWidth = 1.2; for(let i = -2; i <= 2; i++) line(i*2.4, -15.5, i*3.2 + w, -9.5);
      ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = .9; line(-tw + 2, top + 5, tw - 3, top + 4); line(-2, top + 1, -1, hip); // remendos
      ctx.fillStyle = W(tone(c1, -.25)); rrect(2, top + 6, 5, 5, 1);
    } else if(k === 'zombie'){
      ctx.fillStyle = tone(c2, -.1); ctx.beginPath(); ctx.moveTo(-1, top + 4); ctx.lineTo(6, top + 3); ctx.lineTo(5, top + 13); ctx.lineTo(0, top + 12); ctx.fill(); // pele aparecendo
      ctx.strokeStyle = tone(c2, -.45); ctx.lineWidth = 1; for(let i = 0; i < 3; i++) line(0, top + 6 + i*2.4, 5, top + 5.5 + i*2.4);
      ctx.fillStyle = tone(c1, -.2); ctx.beginPath(); ctx.moveTo(-waist, hip); ctx.lineTo(-waist + 2, hip + 3.5); ctx.lineTo(-1, hip + 1); ctx.lineTo(2, hip + 4); ctx.lineTo(waist, hip); ctx.fill(); // trapo rasgado
    } else if(k === 'goblin'){
      const v = new Path2D(); v.moveTo(-tw + 1, top + 1); v.lineTo(-1, top + 1); v.lineTo(-2, hip + 1); v.lineTo(-waist, hip + 1); v.closePath(); v.moveTo(tw - 1, top + 1); v.lineTo(3, top + 1); v.lineTo(3, hip + 1); v.lineTo(waist, hip + 1); v.closePath();
      volPath(v, c1, 0, top, hip + 1, tw); // colete de couro
    } else if(k === 'horns' || k === 'imp'){
      const mc = tone(c1, .12); vol(-1.5, top + 5, tw*.45, 4, mc, .25, true); vol(4, top + 5, tw*.45, 4, mc, .25, true); // peitoral
      ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; for(let i = 0; i < 3; i++) line(-2.5, top + 11 + i*2.8, 4.5, top + 11 + i*2.8); line(1, top + 10, 1, hip - 1);
      ctx.fillStyle = vgrad(hip - 2, hip + 6, W('#3a2a1a'), W('#1a120a')); ctx.beginPath(); ctx.moveTo(-waist, hip - 1); ctx.lineTo(waist, hip - 1); ctx.lineTo(3 + w, hip + 6); ctx.lineTo(-2 + w, hip + 6); ctx.fill(); // tanga
    } else {
      vol(2, top + 9, tw*.62, 6.4, c2, .25); // peito/colete
      ctx.fillStyle = vgrad(hip - 3.5, hip, W('#4a3622'), W('#22180e')); rrect(-waist, hip - 3.5, waist*2, 3, 1);
    }
  }
  // pescoço e cabeça
  if(!robe && k !== 'knight' && k !== 'rock' && k !== 'tree') seg(0, top, hx, hy + hr*.55, bony ? 2 : hr*.9, bony ? 1.8 : hr*.75, bony ? c2 : tone(skin, -.15));
  if(k === 'hood'){
    vol(hx - 1, hy, hr*1.2, hr*1.15, c1, .2);
    ctx.fillStyle = W('#0c0910'); ell(hx + 2.6, hy + 1, hr*.58, hr*.75);
    ctx.fillStyle = vgrad(hy - hr, hy + hr, tone(c1, .2), tone(c1, -.4)); ctx.beginPath(); ctx.moveTo(hx - hr, hy - hr*.6); ctx.quadraticCurveTo(hx - hr*1.6, hy - hr*1.5, hx - hr*2.1, hy - hr*.2 + w); ctx.quadraticCurveTo(hx - hr*1.3, hy - hr*.6, hx - hr*.9, hy); ctx.fill(); // ponta do capuz
    eyeDot(hx + 3.8, hy, 1.2, eye); eyeDot(hx + 1.4, hy, 1, eye);
  } else if(k === 'knight'){
    vol(hx, hy, hr*1.02, hr*1.05, c2, .6);
    ctx.fillStyle = '#100c14'; rrect(hx + 1, hy - 1.6, hr*.98, 2.6, 1);
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = .8; for(let i = 0; i < 3; i++) line(hx + 2.5 + i*1.6, hy + 2, hx + 2.5 + i*1.6, hy + 4.5);
    eyeDot(hx + hr*.62, hy - .3, 1, eye);
    const pc = W(tone(eye, -.25)); ctx.strokeStyle = pc; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx - 1, hy - hr); ctx.quadraticCurveTo(hx - 8, hy - hr - 6, hx - 13, hy - 1 + w); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx - 1, hy - hr - .8); ctx.quadraticCurveTo(hx - 7, hy - hr - 6, hx - 11, hy - 3); ctx.stroke();
  } else if(k === 'rock'){
    poly([[hx - hr*.9, hy + 4], [hx - hr*.6, hy - hr*.6], [hx + hr*.7, hy - hr*.7], [hx + hr, hy + 3], [hx + hr*.4, hy + hr*.8], [hx - hr*.6, hy + hr*.7]], cyl(hx - hr, hx + hr, c2));
    poly([[hx - hr*.6, hy - hr*.6], [hx + hr*.7, hy - hr*.7], [hx + hr*.3, hy - 1], [hx - hr*.3, hy - .5]], tone(c2, .25));
    eyeDot(hx + 3.5, hy + 1.5, 1.5, eye);
  } else {
    const hc = k === 'tree' ? c1 : c2;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ell(hx + .5, hy + hr*.75, hr*.7, hr*.28); // sombra do queixo
    vol(hx, hy, hr, hr*1.02, hc, bony ? .45 : .3);
    if(bony){
      ctx.fillStyle = '#15100c'; ell(hx + 3, hy - .5, 2, 2.3); ell(hx - .6, hy - .5, 1.7, 2.1); ctx.beginPath(); ctx.moveTo(hx + 4.5, hy + 2); ctx.lineTo(hx + 5.5, hy + 3.5); ctx.lineTo(hx + 3.8, hy + 3.5); ctx.fill();
      ctx.fillStyle = tone(c2, -.2); rrect(hx - 1, hy + 4, 6.5, 2.4, 1); ctx.strokeStyle = '#15100c'; ctx.lineWidth = .6; for(let i = 0; i < 4; i++) line(hx + i*1.6, hy + 4, hx + i*1.6, hy + 6.3);
      eyeDot(hx + 3, hy - .5, .9, eye); eyeDot(hx - .6, hy - .5, .8, eye);
    } else {
      brow(hx - .3, hy - hr*.42, hx + hr*.85, hy - hr*.2);
      eyeDot(hx + hr*.52, hy - .8, Math.max(1, hr*.17), eye); eyeDot(hx + hr*.06, hy - .8, Math.max(.9, hr*.14), eye);
      ctx.strokeStyle = 'rgba(10,6,4,.55)'; ctx.lineWidth = .9; line(hx + hr*.3, hy + hr*.5, hx + hr*.85, hy + hr*.42); // boca
    }
    if(k === 'zombie' || k === 'wrap'){ ctx.strokeStyle = tone(k === 'wrap' ? c2 : c1, -.3); ctx.lineWidth = 1.1; line(hx - hr*.8, hy - 2.5, hx + hr*.8, hy - 3.5); line(hx - hr*.9, hy + 2, hx + hr*.7, hy + 1); }
    if(k === 'goblin'){
      ctx.fillStyle = vgrad(hy - 6, hy + 3, tone(c2, .2), tone(c2, -.3)); ctx.beginPath(); ctx.moveTo(hx - 3, hy - 2); ctx.lineTo(hx - 14, hy - 7); ctx.lineTo(hx - 3, hy + 2.5); ctx.fill(); ctx.strokeStyle = M_OUT; ctx.lineWidth = .8; ctx.stroke();
      ctx.fillStyle = 'rgba(160,60,60,.45)'; ctx.beginPath(); ctx.moveTo(hx - 4, hy - 1); ctx.lineTo(hx - 11, hy - 5); ctx.lineTo(hx - 4, hy + 1.5); ctx.fill(); // dentro da orelha
      vol(hx + hr + .6, hy + 1, 2.8, 2, tone(c2, -.05), .3); // nariz
    }
    if(k === 'fur' || k === 'ghoul'){ ctx.fillStyle = W('#f2ead8'); for(const o of [0, 2.2]){ ctx.beginPath(); ctx.moveTo(hx + 1.5 + o, hy + hr*.6); ctx.lineTo(hx + 2.4 + o, hy + hr*.6 + 2.6); ctx.lineTo(hx + 3.4 + o, hy + hr*.55); ctx.fill(); } }
    if(k === 'straw'){ ctx.strokeStyle = 'rgba(30,18,8,.7)'; ctx.lineWidth = .8; for(let i = 0; i < 4; i++) line(hx + 1 + i*1.6, hy + 3, hx + 1.4 + i*1.6, hy + 4.6); line(hx + .5, hy + 3.8, hx + 7, hy + 3.6); }
  }
  // chapéus, chifres e galhos
  if(k === 'witch'){
    vol(hx, hy - hr*.55, 11.5, 2.8, c1, .15);
    ctx.fillStyle = cyl(hx - 7, hx + 6, c1); ctx.beginPath(); ctx.moveTo(hx - 6, hy - hr*.6); ctx.quadraticCurveTo(hx - 2, hy - 20, hx - 9 - w, hy - 25); ctx.quadraticCurveTo(hx + 2, hy - 16, hx + 6, hy - hr*.6); ctx.closePath(); ctx.fill(); ctx.strokeStyle = M_OUT; ctx.lineWidth = .9; ctx.stroke();
    ctx.fillStyle = W('#c9a24a'); ctx.beginPath(); ctx.moveTo(hx - 5.6, hy - hr*.6 - 1); ctx.lineTo(hx + 5.6, hy - hr*.6 - 1); ctx.lineTo(hx + 5, hy - hr*.6 - 3); ctx.lineTo(hx - 5, hy - hr*.6 - 3); ctx.fill();
  } else if(k === 'straw'){
    vol(hx, hy - hr*.5, 12.5, 2.6, W('#8a6a2e'), .1);
    ctx.fillStyle = cyl(hx - 6, hx + 6, W('#a88a40')); ctx.beginPath(); ctx.moveTo(hx - 6.5, hy - hr*.55); ctx.lineTo(hx + 1, hy - hr - 8); ctx.lineTo(hx + 6.5, hy - hr*.55); ctx.fill(); ctx.strokeStyle = M_OUT; ctx.lineWidth = .8; ctx.stroke();
  } else if(k === 'horns' || k === 'imp'){
    for(const sd of [-1, 1]){
      const x0 = hx + sd*hr*.45, g = ctx.createLinearGradient(x0, hy - hr - 8, x0, hy - hr*.6); g.addColorStop(0, W('#3a3028')); g.addColorStop(.5, W('#c8bca0')); g.addColorStop(1, W('#f2ead8'));
      ctx.fillStyle = sd < 0 ? W('#a89c84') : g; ctx.beginPath(); ctx.moveTo(x0 - 2, hy - hr*.7); ctx.quadraticCurveTo(x0 + sd*3, hy - hr - 4, x0 + sd*1.5, hy - hr - 8.5); ctx.quadraticCurveTo(x0 + sd*5.5, hy - hr - 2, x0 + 2.2, hy - hr*.6); ctx.fill(); ctx.strokeStyle = M_OUT; ctx.lineWidth = .7; ctx.stroke();
    }
  } else if(k === 'tree'){
    ctx.strokeStyle = cyl(hx - 9, hx + 7, tone(d.c1, -.15)); ctx.lineWidth = 2.6; line(hx - 2, hy - hr*.7, hx - 7, hy - hr - 9); line(hx + 2, hy - hr*.8, hx + 6, hy - hr - 7); ctx.lineWidth = 1.5; line(hx - 5, hy - hr - 5, hx - 10, hy - hr - 6);
    vol(hx - 7, hy - hr - 10, 5.6, 4, c2, .15); vol(hx + 6.5, hy - hr - 8, 4.8, 3.5, c2, .15); vol(hx - 1, hy - hr - 12, 4, 3, tone(c2, .1), .15);
  }
  // braço da frente: braço e antebraço com cotovelo; prepara e golpeia; quem ataca de longe ergue a magia (ou o arco)
  let a = 1.25 + w*.3;
  if(k === 'zombie' || k === 'wrap') a = .2 + w*.08 - ap*.5;
  else if(d.ranged) a = 1.25 - 1.15*ap;
  else if(ap > 0) a = 1.25 - 2.2*ap + (ap > .7 ? (ap - .7)*4 : 0);
  const L = big ? 13 : 10, faw = bony ? 2.6 : big ? 6.4 : 4.8, ac = bony ? c2 : k === 'knight' ? tone(c2, -.15) : c1;
  ctx.save(); ctx.translate(tw*.55, top + 4); ctx.rotate(a);
  limb(0, 0, L*.52, 1.4, L, 0, faw, faw*.85, faw*.72, ac);
  if(k === 'rock' || k === 'fur') vol(L, 0, big ? 4.4 : 3.2, big ? 4.4 : 3.2, k === 'rock' ? c1 : c2, .3); else vol(L, 0, bony ? 1.8 : 2.6, bony ? 1.8 : 2.4, tone(skin, -.1), .3);
  if(k === 'knight'){
    ctx.fillStyle = vgrad(-4, 4, W('#f0dc90'), W('#8a6a22')); rrect(L - 1.2, -4.5, 2.6, 9, 1); vol(L - 3, 0, 1.6, 1.6, W('#d8c27a'), .5);
    const g = ctx.createLinearGradient(0, -2.2, 0, 2.2); g.addColorStop(0, '#ffffff'); g.addColorStop(.45, '#c8d0da'); g.addColorStop(1, '#4a525c');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(L + 1.5, -2.2); ctx.lineTo(L + 22, -2.2); ctx.lineTo(L + 26, 0); ctx.lineTo(L + 22, 2.2); ctx.lineTo(L + 1.5, 2.2); ctx.fill(); ctx.strokeStyle = M_OUT; ctx.lineWidth = .7; ctx.stroke();
    ctx.strokeStyle = 'rgba(80,40,120,.5)'; ctx.lineWidth = .8; line(L + 3, 0, L + 21, 0);
  } else if(k === 'goblin'){
    seg(L, 0, L + 13, 0, 2.2, 2, W('#7a5432'));
    ctx.fillStyle = vgrad(-7, 7, W('#d8dee6'), W('#5a626c')); ctx.beginPath(); ctx.moveTo(L + 12, -7); ctx.quadraticCurveTo(L + 17.5, 0, L + 12, 7); ctx.lineTo(L + 14, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = M_OUT; ctx.lineWidth = .7; ctx.stroke();
  } else if(k === 'straw'){ ctx.strokeStyle = W('#e8d07a'); ctx.lineWidth = 1.2; for(let i = -1; i <= 1; i++) line(L, 0, L + 5, i*2.5); }
  else if(m.type === 'ossudo'){
    ctx.strokeStyle = cyl(L - 3, L + 8, W(tone(c2, -.1))); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(L - 1, -12); ctx.quadraticCurveTo(L + 8 - ap*2, 0, L - 1, 12); ctx.stroke();
    ctx.strokeStyle = 'rgba(230,225,210,.7)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(L - 1, -12); ctx.lineTo(L - 1 - ap*8, 0); ctx.lineTo(L - 1, 12); ctx.stroke();
  } else if(d.ranged){
    const R = 3 + ap*5 + Math.sin(T*6 + m.anim)*.6, g = ctx.createRadialGradient(L + 3, 0, .5, L + 3, 0, R*2);
    g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.35, d.ranged + 'cc'); g.addColorStop(1, d.ranged + '00');
    ctx.fillStyle = g; circ(L + 3, 0, R*2);
  }
  ctx.restore();
}
// Quadrúpedes (rato, lobos, urso, mamute, javali, crocodilo, carniçal, gárgula, morcego, harpia): de lado, cabeça para a frente
function monQuad(P){
  const {m, k, c1, c2, eye, w, ap, W} = P, t = m.type, ph = [1, -1, -1, 1];
  const heavy = t === 'urso' || t === 'mamute', rat = k === 'rat', croc = t === 'crocodilo', winged = k === 'wings';
  const dk = tone(c1, -.38), lw = heavy ? 5.6 : rat ? 2.8 : 4.2, bodyY = croc ? -9.5 : -12.5;
  // patas: dianteira reta (joelho) e traseira com o jarrete para trás
  const legs = far => {
    const c = far ? dk : c1, dx = far ? 1.5 : 0;
    for(const [i, x0, back] of [[far ? 0 : 2, 8.5 + dx, 0], [far ? 1 : 3, -8 + dx, 1]]){
      const o = w*4*ph[i], y0 = bodyY + 1.5, px = x0 + o, kx = back ? x0 - 3 + o*.4 : x0 + .8 + o*.5, ky = croc ? -4 : back ? -6 : -5.5;
      limb(x0, y0, kx, ky, px, -1.6, lw*1.3, lw*.82, lw*.66, c);
      vol(px + 1.4, -1, lw*.62, 1.7, tone(c, -.3), 0, true);
    }
  };
  legs(true);
  // cauda
  if(P.d.tail || rat || croc){
    if(rat){ seg(-12, -11, -20, -15 + w*2, 1.8, 1.3, W('#c49a8a')); seg(-20, -15 + w*2, -27, -6, 1.3, .6, W('#c49a8a')); }
    else if(croc){ seg(-11, -10, -22, -7 + w*2, 7, 4, c1); seg(-22, -7 + w*2, -31, -4, 4, 1.4, c1); }
    else if(t === 'lobo' || t === 'lobogelo' || t === 'chacal' || t === 'cao'){ vol(-15, -16 + w*2, 6, 3.2, c1, .15, false, -.5 + w*.15); vol(-20, -19 + w*2.5, 3.6, 2.2, tone(c1, .2), 0, false, -.7); }
    else { seg(-12, -12, -19, -16 + w*3, 3.6, 2.4, c1); seg(-19, -16 + w*3, -25, -14 + w*2, 2.4, 1, c1); }
  }
  // asas (gárgula, morcego, harpia): membrana com dedos ou penas, batendo
  if(winged){
    const f = Math.sin(T*(m.moving ? 14 : 5) + m.anim)*6, feath = t === 'harpia';
    ctx.fillStyle = vgrad(-36 - f, -14, tone(c1, feath ? .2 : .05), tone(c1, -.45)); ctx.beginPath(); ctx.moveTo(-6, -17); ctx.lineTo(-17, -35 - f); ctx.quadraticCurveTo(-11, -27 - f*.6, -6, -30 - f*.8); ctx.quadraticCurveTo(-1, -26 - f*.5, 5, -36 - f); ctx.lineTo(5, -18); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = M_OUT; ctx.lineWidth = .9; ctx.stroke();
    ctx.strokeStyle = feath ? 'rgba(255,255,255,.35)' : tone(c1, -.55); ctx.lineWidth = feath ? .8 : 1.2; line(-6, -17, -17, -35 - f); line(-2, -18, -6, -30 - f*.8); line(1, -18, 5, -36 - f);
  }
  // corpo: uma silhueta só (garupa, costas, cernelha, peito e barriga recolhida) com volume; ombro e quadril marcados por luz
  const hh = croc ? 5 : heavy ? 8.4 : 7.2, by = bodyY, B = new Path2D();
  B.moveTo(-15, by); B.bezierCurveTo(-15, by - hh*1.15, -6, by - hh*1.05, 1, by - hh*.9);
  B.bezierCurveTo(8, by - hh*1.25 - (heavy ? 2 : 0), 14, by - hh*1.1, 15.5, by - 1);
  B.bezierCurveTo(16, by + hh*.9, 9, by + hh*1.05, 4, by + hh*.75);
  B.bezierCurveTo(0, by + hh*(croc ? .9 : .55), -5, by + hh*(croc ? .9 : .6), -9, by + hh*.95);
  B.bezierCurveTo(-14, by + hh*1.1, -16, by + hh*.6, -15, by); B.closePath();
  volPath(B, c1, 0, by - hh*1.2, by + hh, 15);
  const a0 = ctx.globalAlpha; ctx.globalAlpha = a0*.45;
  vol(8, by - hh*.25, 5.5, hh*.7, tone(c1, .12), 0, true); vol(-9, by - hh*.3, 5, hh*.65, tone(c1, .1), 0, true); // ombro e quadril
  ctx.globalAlpha = a0*.5; vol(1, by + hh*.6, 9, croc ? 1.6 : 2.4, c2, 0, true); ctx.globalAlpha = a0; // barriga clara
  if(!croc && !winged){ ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = .8; for(let i = 0; i < 6; i++){ const x = -11 + i*4.4; line(x, by - hh*.5, x - 1.6, by - hh*.1); } } // pelo
  if(t === 'urso'){ vol(5, bodyY - 7, 6, 4, tone(c1, .06), .15, true); } // corcunda
  if(t === 'mamute'){ ctx.fillStyle = tone(c1, -.2); for(let i = 0; i < 9; i++){ const x = -12 + i*3.2; ctx.beginPath(); ctx.moveTo(x - 1.6, bodyY + 3); ctx.lineTo(x + Math.sin(T*2 + i)*.6, bodyY + 9 + (i % 3)); ctx.lineTo(x + 1.6, bodyY + 3); ctx.fill(); } }
  // pelo/espinhos nas costas
  if(t === 'lobo' || t === 'lobogelo' || t === 'chacal' || t === 'cao' || t === 'javali' || k === 'ghoul'){
    const sp = t === 'javali' ? 3 : k === 'ghoul' ? 0 : 2.6;
    if(k === 'ghoul' && !croc){ ctx.fillStyle = tone(c1, .15); for(let i = 0; i < 5; i++) vol(-8 + i*3.6, bodyY - 7.2 + Math.abs(i - 2)*.6, 1.4, 1.2, tone(c1, .2), 0, true); ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; for(let i = 0; i < 3; i++) line(1 + i*3, bodyY - 3, i*3, bodyY + 3); }
    else if(sp){ ctx.fillStyle = vgrad(bodyY - 12, bodyY - 5, tone(c1, .25), tone(c1, -.2)); ctx.beginPath(); ctx.moveTo(-11, bodyY - 5); for(let i = 0; i < 7; i++){ const x = -9 + i*3.2; ctx.lineTo(x, bodyY - 8.5 - sp - (i % 2)*1.2 - Math.sin(i*1.3)*.6); ctx.lineTo(x + 1.6, bodyY - 7); } ctx.lineTo(13, bodyY - 6); ctx.closePath(); ctx.fill(); }
  }
  if(croc){ ctx.fillStyle = tone(c1, -.2); for(let i = 0; i < 7; i++) vol(-9 + i*3.4, bodyY - 5, 1.5, 1.2, tone(c1, -.15), .2, true); }
  legs(false);
  // pescoço e cabeça: sobe um pouco ao morder
  const hx = croc ? 16 : 14, hy = (croc ? -9 : -17) - ap*2;
  if(!croc) seg(9, bodyY - 2, hx - 3, hy + 1.5, heavy ? 9 : 7.5, 6, c1);
  // orelhas
  if(rat){ vol(hx - 2, hy - 5.5, 3.2, 3.2, W('#c49a8a'), .2); ctx.fillStyle = W('#e8b0a8'); circ(hx - 1.6, hy - 5.2, 1.6); }
  else if(t === 'urso' || t === 'mamute'){ vol(hx - 3, hy - 5.5, 2.8, 2.6, tone(c1, -.15), .2); }
  else if(!croc && !winged){ for(const o of [0, 2.2]){ ctx.fillStyle = vgrad(hy - 12, hy - 3, tone(c1, o ? .1 : -.15), tone(c1, -.4)); ctx.beginPath(); ctx.moveTo(hx - 4.5 + o, hy - 3); ctx.lineTo(hx - 2.5 + o, hy - 12); ctx.lineTo(hx + .5 + o, hy - 4); ctx.fill(); ctx.strokeStyle = M_OUT; ctx.lineWidth = .7; ctx.stroke(); } ctx.fillStyle = 'rgba(150,70,70,.5)'; ctx.beginPath(); ctx.moveTo(hx - 1.6, hy - 4); ctx.lineTo(hx - .4, hy - 9.5); ctx.lineTo(hx + 1.6, hy - 4.5); ctx.fill(); }
  if(t === 'gargula'){ ctx.fillStyle = W('#d8d0c0'); ctx.beginPath(); ctx.moveTo(hx, hy - 4); ctx.quadraticCurveTo(hx + 1, hy - 10, hx - 2, hy - 12.5); ctx.quadraticCurveTo(hx + 4.5, hy - 9, hx + 2.5, hy - 3.5); ctx.fill(); ctx.strokeStyle = M_OUT; ctx.lineWidth = .7; ctx.stroke(); }
  if(croc){
    // cabeça baixa e longa, com a boca cheia de dentes
    vol(hx - 2, hy, 6, 4.2, c1, .25);
    vol(hx + 7, hy + 1.2, 8, 2.6, c1, .2);
    vol(hx + 6.5, hy + 3.6 + ap*2.5, 7.5, 1.8, tone(c2, -.1), 0);
    ctx.fillStyle = '#f4ecd8'; for(let i = 0; i < 5; i++){ const x = hx + 2 + i*2.6; ctx.beginPath(); ctx.moveTo(x, hy + 2.6); ctx.lineTo(x + .6, hy + 4.2); ctx.lineTo(x + 1.2, hy + 2.6); ctx.fill(); }
    eyeDot(hx - 1, hy - 3.6, 1.2, eye); brow(hx - 3, hy - 5, hx + 1, hy - 4.6);
    return;
  }
  vol(hx, hy, heavy ? 7.4 : 6.5, heavy ? 6.8 : 5.9, c1, .3);
  if(t === 'mamute'){
    // presas e tromba
    ctx.strokeStyle = W('#f2ead8'); ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(hx + 4, hy + 4); ctx.quadraticCurveTo(hx + 14, hy + 10, hx + 18, hy + 1); ctx.stroke();
    seg(hx + 5, hy + 1, hx + 8 + ap*3, hy + 9, 4.4, 3.4, c1); seg(hx + 8 + ap*3, hy + 9, hx + 10 + ap*5, hy + 15 - ap*4, 3.4, 2.2, c1);
    eyeDot(hx + 2.5, hy - 1.5, 1.1, eye); brow(hx + .5, hy - 3.4, hx + 4.6, hy - 2.6);
    return;
  }
  // focinho com mandíbula que abre ao morder, nariz brilhante e dentes
  const snx = hx + (rat ? 5 : 5.6), sny = hy + 1.6;
  if(ap > .2){ ctx.fillStyle = '#2a0c0a'; ell(snx + .5, sny + 3, 4, 1.4 + ap*1.6); }
  vol(snx, sny + 2.6 + ap*2.2, rat ? 3.4 : 4.2, 1.6, tone(c2, -.2), 0); // mandíbula
  vol(snx, sny, rat ? 4 : 4.8, rat ? 2.6 : 3, c2, .3);
  vol(snx + (rat ? 3.8 : 4.6), sny - .8, 1.3, 1, W('#120c0a'), .7, true); // nariz
  if(ap > .25){ ctx.fillStyle = '#f4ecd8'; for(const o of [0, 2.4]){ ctx.beginPath(); ctx.moveTo(snx + 1 + o, sny + 1.6); ctx.lineTo(snx + 1.7 + o, sny + 4); ctx.lineTo(snx + 2.4 + o, sny + 1.6); ctx.fill(); } }
  if(t === 'javali'){ ctx.strokeStyle = W('#f2ead8'); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(snx + 1, sny + 2); ctx.quadraticCurveTo(snx + 4, sny + 1, snx + 4.5, sny - 3); ctx.stroke(); }
  if(rat){ ctx.strokeStyle = 'rgba(240,230,220,.55)'; ctx.lineWidth = .5; for(const o of [-1, 0, 1]) line(snx + 3, sny, snx + 8, sny + o*1.8); }
  eyeDot(hx + 2.8, hy - 2, 1.25, eye); brow(hx + .8, hy - 3.8, hx + 4.8, hy - 2.8);
}
// Aranhas (patas em 3 partes com juntas, abdome com desenho, presas e olhos acesos) e escorpião (carapaça, cauda em gomos, pinças)
function monSpider(P){
  const {m, k, c1, c2, eye, w, ap, W} = P, scorp = k === 'scorp', dk = tone(c1, -.42);
  const legs = back => {
    const c = back ? dk : c1;
    for(let i = 0; i < 4; i++){
      const o = w*2.5*((i + (back ? 1 : 0)) % 2 ? 1 : -1), bx = 4 - i*3 + (back ? 1.5 : 0), sp = i - 1.5;
      const kx = bx + sp*6.5 + o, ky = scorp ? -14 : -18, ax = bx + sp*9.5 + o*1.3, ay = scorp ? -6 : -8, tx = bx + sp*11 + o*1.5;
      seg(bx, -9, kx, ky, scorp ? 2.4 : 2.8, 2.1, c); seg(kx, ky, ax, ay, 2.1, 1.5, c); seg(ax, ay, tx, 0, 1.5, .7, c);
      if(!back){ ctx.fillStyle = tone(c2, -.1); circ(kx, ky, 1); }
    }
  };
  legs(true);
  if(scorp){
    // cauda em gomos subindo por cima das costas; o ferrão pica ao atacar
    const st = ap*6; let x = -9, y = -9;
    const pts = [[-14.5, -13.5], [-17, -20], [-15.5, -26.5 - st*.3], [-10.5, -31 - st*.4], [-4.5 + st, -32.5 - st*.3]];
    pts.forEach(([px, py], i) => { vol((x + px)/2, (y + py)/2, 3.9 - i*.3, 3.3 - i*.2, c1, .35); x = px; y = py; });
    const g = ctx.createLinearGradient(x, y - 3, x + 7, y + 3); g.addColorStop(0, W('#3a2414')); g.addColorStop(1, W('#0e0804'));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 1, y - 2.4); ctx.quadraticCurveTo(x + 6, y - 2, x + 7, y + 4); ctx.quadraticCurveTo(x + 3, y + 1, x - 1, y + 2.4); ctx.fill();
    const gl = .5 + .5*Math.sin(T*5 + m.anim); ctx.globalAlpha *= gl; eyeDot(x + 6.8, y + 4.6, .9, eye); ctx.globalAlpha /= gl;
    vol(-5, -8.5, 8, 5, c1, .3); // abdome em placas
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = .9; for(let i = 0; i < 3; i++){ ctx.beginPath(); ctx.ellipse(-8 + i*3.4, -8.5, 1.2, 4.6, 0, -Math.PI/2, Math.PI/2); ctx.stroke(); }
    vol(4, -8.5, 8, 5.2, c1, .45); // carapaça
    ctx.globalAlpha *= .55; vol(3, -10.5, 5, 1.8, c2, 0, true); ctx.globalAlpha /= .55;
    // pinças: braço + dedo de cima fixo e de baixo que abre
    for(const sd of [0, 1]){
      const c = sd ? dk : c1, px = 13 + ap*4 - sd*1.5, py = -7 + sd*1.5;
      limb(8, -8, 10.5, -10 + sd, px, py, 2.6, 2.2, 2, c);
      vol(px + 2.8, py, 4, 2.6, c, .35);
      ctx.fillStyle = tone(c, -.15); ctx.beginPath(); ctx.moveTo(px + 5, py - 1.5); ctx.quadraticCurveTo(px + 9, py - 2.5, px + 9.5 - ap*1.5, py - .4); ctx.lineTo(px + 6, py); ctx.fill(); ctx.strokeStyle = M_OUT; ctx.lineWidth = .7; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px + 5, py + 1); ctx.quadraticCurveTo(px + 8.5, py + 1.5 + ap*2.5, px + 9, py + .8 + ap*2); ctx.lineTo(px + 6, py + .5); ctx.fill(); ctx.stroke();
    }
    eyeDot(10.5, -11, 1, eye); eyeDot(9, -11.6, .8, eye);
    legs(false);
    return;
  }
  // aranha: abdome grande com desenho, cefalotórax, presas e 4 olhos
  vol(-8.5, -12, 10.5, 9, c1, .5);
  const a0 = ctx.globalAlpha; ctx.globalAlpha = a0*.75; ctx.fillStyle = c2;
  ctx.beginPath(); ctx.moveTo(-12, -18.5); ctx.lineTo(-6, -18.5); ctx.lineTo(-8, -14.5); ctx.lineTo(-5.5, -10.5); ctx.lineTo(-12.5, -10.5); ctx.lineTo(-10, -14.5); ctx.closePath(); ctx.fill(); // ampulheta
  ctx.globalAlpha = a0*.35; for(let i = 0; i < 3; i++){ ctx.beginPath(); ctx.ellipse(-8.5, -12, 9.5 - i*2.2, 8 - i*2, 0, Math.PI*.15, Math.PI*.6); ctx.strokeStyle = c2; ctx.lineWidth = .8; ctx.stroke(); }
  ctx.globalAlpha = a0;
  ctx.strokeStyle = tone(c1, -.3); ctx.lineWidth = .7; for(let i = 0; i < 8; i++){ const an = -2.4 + i*.3; line(-8.5 + Math.cos(an)*10.4, -12 + Math.sin(an)*8.9, -8.5 + Math.cos(an)*12, -12 + Math.sin(an)*10.2); } // pelos
  seg(-1, -10, 2.5, -9.5, 4, 3.5, c1); // cintura
  vol(5, -9.5, 7, 5.6, c1, .4);
  // presas (quelíceras) que fecham ao morder
  for(const sd of [0, 1]){ const c = sd ? tone(c2, -.3) : c2; seg(10, -7.5 + sd, 12 + ap*1.5, -4.5 + sd*.5, 2, 1.6, c); ctx.fillStyle = W('#1a0e0a'); ctx.beginPath(); ctx.moveTo(12 + ap*1.5, -5 + sd*.5); ctx.quadraticCurveTo(13.5 + ap, -2.5, 11.5 + ap*2, -1.5 + sd*.5); ctx.lineTo(11.3 + ap*1.5, -4 + sd*.5); ctx.fill(); }
  eyeDot(10.4, -11.4, 1.25, eye); eyeDot(8.4, -13, 1, eye); eyeDot(11.4, -9.6, .85, eye); eyeDot(7, -12, .75, eye);
  legs(false);
}
// Espíritos (fantasma, fada, espírito gélido, elemental de fogo), sanguessuga/serpente e sapo
function monBlob(P){
  const {m, k, c1, c2, eye, ap, W} = P, t = m.type;
  if(k === 'ghost'){
    const fy = -10 + Math.sin(T*3 + m.anim)*2, a0 = ctx.globalAlpha;
    if(t === 'fada'){ // asas translúcidas que vibram
      const f = Math.sin(T*30)*.35; ctx.globalAlpha = a0*.45; ctx.fillStyle = W('#e8fff0');
      ctx.beginPath(); ctx.ellipse(-4, fy - 13, 4, 9, -.5 + f, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-7, fy - 6, 3, 6, -1.2 - f, 0, TAU); ctx.fill();
      ctx.globalAlpha = a0*.7; ctx.strokeStyle = W('#ffffff'); ctx.lineWidth = .6; ctx.beginPath(); ctx.ellipse(-4, fy - 13, 4, 9, -.5 + f, 0, TAU); ctx.stroke(); ctx.globalAlpha = a0;
    }
    // halo de luz em volta
    const hg = ctx.createRadialGradient(1, fy - 6, 2, 1, fy - 6, 20); hg.addColorStop(0, c2 + '55'); hg.addColorStop(1, c2 + '00'); ctx.fillStyle = hg; circ(1, fy - 6, 20);
    // corpo: brilho no meio (como luz por dentro), borda e fiapos que somem
    ctx.globalAlpha = a0*.9;
    const g = ctx.createRadialGradient(0, fy - 9, 1, 1, fy - 4, 17); g.addColorStop(0, '#ffffff'); g.addColorStop(.3, c2); g.addColorStop(.75, c1 + 'cc'); g.addColorStop(1, c1 + '00');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-10, fy - 2); ctx.quadraticCurveTo(-10, fy - 17, 1, fy - 17); ctx.quadraticCurveTo(12, fy - 17, 11, fy - 2);
    for(let i = 0; i < 4; i++){ const x0 = 11 - i*5.5, wv = Math.sin(T*6 + i + m.anim)*2; ctx.quadraticCurveTo(x0 - 1.5, fy + 13 + wv, x0 - 5.5, fy + 4); }
    ctx.closePath(); ctx.fill();
    if(t === 'elemental'){ // línguas de fogo subindo
      for(let i = 0; i < 5; i++){ const x = -7 + i*3.6, h = 7 + Math.sin(T*9 + i*1.7 + m.anim)*3, fg = ctx.createLinearGradient(0, fy - 16 - h, 0, fy - 12);
        fg.addColorStop(0, 'rgba(255,240,160,0)'); fg.addColorStop(.4, 'rgba(255,200,80,.9)'); fg.addColorStop(1, 'rgba(255,90,20,.9)');
        ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(x - 2.4, fy - 12); ctx.quadraticCurveTo(x - 1, fy - 15 - h*.5, x + Math.sin(T*7 + i)*1.5, fy - 16 - h); ctx.quadraticCurveTo(x + 1.2, fy - 15 - h*.5, x + 2.4, fy - 12); ctx.fill(); }
    }
    ctx.globalAlpha = a0;
    eyeDot(6, fy - 8, 1.6, eye); eyeDot(1.5, fy - 8, 1.35, eye);
    if(ap > 0){ const R = 3 + ap*5, gg = ctx.createRadialGradient(13, fy - 4, .5, 13, fy - 4, R*2); gg.addColorStop(0, '#ffffff'); gg.addColorStop(1, (P.d.ranged || '#bfe6ff') + '00'); ctx.fillStyle = gg; circ(13, fy - 4, R*2); }
    return;
  }
  if(k === 'leech'){
    // corpo em gomos brilhantes que ondulam (a serpente tem cabeça e língua)
    const sn = t === 'serpente', n = sn ? 7 : 5;
    for(let i = 0; i < n; i++){
      const x = -12 + i*(sn ? 4 : 5.4) - (sn ? 3 : 0), y = -5.5 - Math.abs(Math.sin(m.anim*(m.moving ? 9 : 3) - i*.9))*(m.moving ? 3 : 1.2) - i*.4, rr = sn ? 2.6 + i*.35 : 4.6 + (i === 4 ? .8 : 0);
      vol(x, y, rr*1.05, rr*.92, sn ? c1 : i % 2 ? c1 : c2, .45);
      if(sn){ ctx.fillStyle = tone(c1, -.5); ctx.beginPath(); ctx.moveTo(x - rr*.5, y - rr*.35); ctx.lineTo(x, y - rr*.8); ctx.lineTo(x + rr*.5, y - rr*.35); ctx.lineTo(x, y + rr*.05); ctx.fill(); ctx.fillStyle = c2; ell(x, y + rr*.55, rr*.7, rr*.25); } // losangos nas costas, barriga clara
    }
    const hx = sn ? 13.5 : 10.5, hy = (sn ? -9.5 : -8.5) - ap*2;
    if(sn){
      vol(hx, hy, 5.4, 3.8, c1, .35); ctx.fillStyle = tone(c2, .1); ell(hx + 1, hy + 1.6, 3.6, 1.2);
      if(Math.sin(T*6 + m.anim) > .3 || ap > .2){ ctx.strokeStyle = W('#d03a4a'); ctx.lineWidth = .8; line(hx + 5, hy + 1, hx + 9, hy + 1.2); line(hx + 9, hy + 1.2, hx + 10.5, hy); line(hx + 9, hy + 1.2, hx + 10.5, hy + 2.4); }
      eyeDot(hx + 2, hy - 1.6, 1.1, eye); brow(hx, hy - 3, hx + 3.6, hy - 2.4);
      return;
    }
    vol(hx + 3.5, hy + 1, 2.4 + ap*1.2, 3.2 + ap, W('#3a0c0c'), 0);
    ctx.fillStyle = W('#f0e0d0'); for(let i = 0; i < 5; i++){ const an = i/5*TAU; circ(hx + 3.5 + Math.cos(an)*(1.7 + ap), hy + 1 + Math.sin(an)*(2.3 + ap), .45); }
    eyeDot(hx, hy - 3, 1.1, eye);
    return;
  }
  // sapo: pele brilhante com manchas, amassa e estica ao pular; papo que infla
  const sq = 1 + Math.sin(m.anim*(m.moving ? 9 : 4))*.1, rx = 12.5*sq, ry = 9.5/sq, cy = -ry;
  vol(-8, -2.2, 5.8, 2.8, tone(c1, -.35), 0); // pata de trás
  vol(0, cy, rx, ry, c1, .55);
  const a0 = ctx.globalAlpha; ctx.globalAlpha = a0*.5; ctx.fillStyle = tone(c1, -.45); for(const [x, y, r] of [[-5, -3, 1.8], [-1, -6, 1.3], [-7, -1, 1.1], [3, -4.5, 1]]) circ(x, cy + y*sq, r); ctx.globalAlpha = a0;
  vol(3, cy + ry*.42, rx*.62, ry*.42, c2, .2);
  const puff = 1 + Math.max(0, Math.sin(T*3 + m.anim))*.35; vol(8, cy + ry*.55, 3.2*puff, 2.4*puff, tone(c2, .15), .4); // papo
  vol(8, -1.4, 3.8, 1.8, tone(c1, -.2), 0, true);
  for(const [ex, er] of [[2, 2.9], [6.8, 3.4]]){ vol(ex, cy - ry*.78, er, er, c1, .2); ctx.fillStyle = W('#f4f0d8'); circ(ex + .6, cy - ry*.82, er*.62); ctx.fillStyle = '#100c08'; ell(ex + 1.1, cy - ry*.82, er*.36, er*.2); ctx.fillStyle = '#ffffff'; circ(ex + .2, cy - ry*.92, er*.16); }
  ctx.strokeStyle = tone(c1, -.55); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(4, cy + 1.5); ctx.quadraticCurveTo(9, cy + 4 + ap*3, 12.3*sq, cy + .5); ctx.stroke();
  if(ap > .3){ ctx.strokeStyle = W('#e07a8a'); ctx.lineWidth = 2.2; line(12*sq, cy + 1, 12*sq + ap*9, cy - 1); ctx.fillStyle = W('#e07a8a'); circ(12*sq + ap*9, cy - 1, 1.6); }
}
// pz = parte da vida que o veneno/sangramento ainda vai tirar (pintada na cor pzc)
function bar(x, y, w, h, p, col, pz, tick, pzc){
  ctx.fillStyle = 'rgba(6,8,7,.88)'; ctx.fillRect(x - w/2 - 1.5, y - 1.5, w + 3, h + 3);
  ctx.fillStyle = '#3a1512'; ctx.fillRect(x - w/2, y, w, h);
  const fw = w*clamp(p, 0, 1); ctx.fillStyle = col; ctx.fillRect(x - w/2, y, fw, h);
  if(pz > 0){ const pw = Math.min(fw, w*pz); ctx.fillStyle = pzc || '#9bd84a'; ctx.fillRect(x - w/2 + fw - pw, y, pw, h); }
  if(tick !== undefined){ ctx.fillStyle = '#f3efe2'; ctx.fillRect(x - w/2 + w*tick - .75, y - 2, 1.5, h + 4); }
}
function drawBars(vis){
  ctx.font = '700 10px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center';
  for(const m of mons){
    if(m.dead || !vis(m)) continue;
    atY(m.y);
    const w = m.boss ? 84 : m.elite ? 44 : 32, y = m.y + m.r*.6 - monH(m) - 8;
    const bl = bleedLeft(m), fl = burnLeft(m);
    // Chefe da Masmorra: anel do elemento no chão, barra maior e nome em laranja
    if(m.boss){ ctx.strokeStyle = ELEM[m.el || 'fire'].c; ctx.globalAlpha = .5 + .3*Math.sin(T*4); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(m.x, m.y + m.r*.6, m.r*1.5, m.r*.6, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
    bar(m.x, y, w, m.boss ? 6 : 4, m.hp/m.hpMax, '#d4473b', Math.min(1, (poisonLeft(m) + bl + fl)/m.hpMax), undefined, fl > 0 ? '#ffb040' : bl > 0 ? '#ff9a7a' : '#9bd84a');
    if(m.boss){ ctx.font = '800 12px "Alegreya Sans", sans-serif'; ctx.fillStyle = '#ffb070'; ctx.fillText(m.name, m.x, y - 6); ctx.font = '700 10px "Alegreya Sans", sans-serif'; }
    else if(m.elite){ ctx.fillStyle = '#9fbaff'; ctx.fillText(m.name, m.x, y - 5); }
  }
  if(hero.scale > .3 && hero.alpha > .1){
    const p = hero.hp/ST.life; atY(hero.y);
    bar(hero.x, hero.y - 64*hero.scale, 44, 6, p, p > .5 ? '#4fbf5a' : p > .3 ? '#d9b23a' : '#d4473b', 0, scene === 'map' ? S.cfg.ret/100 : undefined);
    // Cor do nome (Baú de Visuais): o nome aparece em cima da barra
    const NC = lookOf('name');
    if(NC){ ctx.font = '800 11px "Alegreya Sans", sans-serif'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.strokeText(heroName(), hero.x, hero.y - 64*hero.scale - 5); ctx.fillStyle = NC.rainbow ? `hsl(${(T*90) % 360 | 0},90%,65%)` : NC.c; ctx.fillText(heroName(), hero.x, hero.y - 64*hero.scale - 5); }
  }
}
/* ---------- VILA EM 3D ---------- */
// Visão de cima em 3/4: cada prédio tem frente, lado direito e telhado de duas águas com o fundo indo para cima/direita.
// Tudo que tem altura entra na ordenação por y junto com o herói (townProps), para ele passar atrás/na frente certinho.
function poly(pts, fill){ ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); if(fill) ctx.fillStyle = fill; ctx.fill(); }
function vgrad(y0, y1, c0, c1){ const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; }
function smoke(x, y, seed){ for(let i = 0; i < 4; i++){ const k = (T*.35 + i/4 + seed) % 1; ctx.globalAlpha = .35*(1 - k); ctx.fillStyle = '#8a8580'; circ(x + Math.sin(T*.8 + i + seed*9)*6 + k*14, y - k*60, 5 + k*10); } ctx.globalAlpha = 1; }
function lampGlow(x, y, r, a){ const g = ctx.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, `rgba(255,190,100,${a})`); g.addColorStop(1, 'rgba(255,190,100,0)'); ctx.fillStyle = g; circ(x, y, r); }
// Janela com luz quente, moldura e venezianas
function townWindow(x, y, w, h, seed){
  ctx.fillStyle = '#3a2a1c'; ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  const f = .75 + .2*Math.sin(T*2 + seed*7);
  ctx.fillStyle = vgrad(y, y + h, `rgba(255,214,140,${f})`, `rgba(230,140,60,${f})`); ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#3a2a1c'; ctx.fillRect(x + w/2 - 1, y, 2, h); ctx.fillRect(x, y + h/2 - 1, w, 2);
  ctx.fillStyle = '#5a3a24'; ctx.fillRect(x - 7, y - 1, 5, h + 2); ctx.fillRect(x + w + 2, y - 1, 5, h + 2);
  ctx.fillStyle = '#2a1a10'; ctx.fillRect(x - 3, y + h + 2, w + 6, 3);
}
function drawBuilding(b){
  const {x, y, w, h, dep} = b, dx = dep*.6, dy = dep*.45, L = x - w/2, R = x + w/2, o = 12, rh = b.barn ? h*.62 : h*.72, top = y - h;
  const wall = b.wall, dark = shade(wall, -.38);
  // sombra no chão (para baixo/direita)
  ctx.fillStyle = 'rgba(0,0,0,.32)'; poly([[L + 4, y + 2], [R + dx + 10, y + 2 - dy*.2], [R + dx + 34, y - dy + 16], [R + 30, y + 14], [L + 22, y + 16]]);
  // lado direito
  poly([[R, y], [R + dx, y - dy], [R + dx, top - dy], [R, top]], vgrad(top, y, dark, shade(wall, -.5)));
  // base de pedra
  ctx.fillStyle = vgrad(y - 12, y, '#7a746a', '#55504a'); ctx.fillRect(L - 2, y - 12, w + 4, 12);
  poly([[R + 2, y], [R + dx + 2, y - dy], [R + dx + 2, y - dy - 12], [R + 2, y - 12]], '#47423c');
  // frente
  ctx.fillStyle = vgrad(top, y - 12, shade(wall, .12), shade(wall, -.12)); ctx.fillRect(L, top, w, h - 12);
  if(b.barn){ ctx.strokeStyle = 'rgba(40,24,12,.45)'; ctx.lineWidth = 1.2; for(let px = L + 10; px < R; px += 12) line(px, top + 2, px, y - 12); }
  else if(b.smithy){ ctx.strokeStyle = 'rgba(30,26,24,.35)'; ctx.lineWidth = 1; for(let r = 0; r < 6; r++){ const yy = top + 8 + r*14; line(L, yy, R, yy); for(let k = 0; k < 7; k++){ const xx = L + ((k + (r % 2)*.5) * w/6.5); line(xx, yy, xx, yy + 14); } } }
  else {
    // enxaimel: vigas escuras
    ctx.fillStyle = '#4a2e1c';
    ctx.fillRect(L, top, w, 5); ctx.fillRect(L, top + (h - 12)*.48, w, 4); ctx.fillRect(L, top, 5, h - 12); ctx.fillRect(R - 5, top, 5, h - 12);
    ctx.strokeStyle = '#4a2e1c'; ctx.lineWidth = 4; line(L + 5, top + (h - 12)*.48, L + w*.22, top + 5); line(R - 5, top + (h - 12)*.48, R - w*.22, top + 5);
    poly([[R, top + 5], [R + dx, top - dy + 5], [R + dx, top - dy + 9], [R, top + 9]], '#3a2416');
  }
  // portas e janelas
  if(b.smithy){
    // boca da forja aberta com fogo
    const fl = .75 + .25*Math.sin(T*9) + .1*Math.sin(T*23);
    ctx.fillStyle = '#1a100a'; ctx.beginPath(); ctx.moveTo(x - 30, y - 12); ctx.lineTo(x - 30, y - 50); ctx.arc(x, y - 50, 30, Math.PI, 0); ctx.lineTo(x + 30, y - 12); ctx.closePath(); ctx.fill();
    const fg = ctx.createRadialGradient(x, y - 24, 2, x, y - 24, 34); fg.addColorStop(0, `rgba(255,240,170,${fl})`); fg.addColorStop(.4, `rgba(255,140,40,${.85*fl})`); fg.addColorStop(1, 'rgba(120,30,10,0)'); ctx.fillStyle = fg; ell(x, y - 26, 30, 24);
    ctx.strokeStyle = '#3a342e'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y - 50, 32, Math.PI, 0); ctx.stroke();
    lampGlow(x, y - 20, 110, .28*fl);
    townWindow(L + 16, top + 22, 20, 18, 3);
  } else if(b.barn){
    // portão duplo com X
    const dw = 56, dh = h - 22, dxL = x - dw/2;
    ctx.fillStyle = vgrad(y - 12 - dh, y - 12, '#6a4a2a', '#4a321c'); ctx.fillRect(dxL, y - 12 - dh, dw, dh);
    ctx.strokeStyle = '#2e1e10'; ctx.lineWidth = 3; ctx.strokeRect(dxL, y - 12 - dh, dw, dh); line(x, y - 12 - dh, x, y - 12);
    ctx.lineWidth = 2.5; line(dxL, y - 12 - dh, x, y - 12); line(x, y - 12 - dh, dxL, y - 12); line(x, y - 12 - dh, x + dw/2, y - 12); line(x + dw/2, y - 12 - dh, x, y - 12);
    ctx.fillStyle = '#c9a24a'; circ(x - 4, y - 12 - dh/2, 2); circ(x + 4, y - 12 - dh/2, 2);
  } else {
    // porta em arco
    const dw = b.w > 180 ? 34 : 26, dh = b.w > 180 ? 52 : 42;
    ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.moveTo(x - dw/2 - 3, y - 12); ctx.lineTo(x - dw/2 - 3, y - 12 - dh + dw/2); ctx.arc(x, y - 12 - dh + dw/2, dw/2 + 3, Math.PI, 0); ctx.lineTo(x + dw/2 + 3, y - 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = vgrad(y - 12 - dh, y - 12, '#7a4e2c', '#4e301a'); ctx.beginPath(); ctx.moveTo(x - dw/2, y - 12); ctx.lineTo(x - dw/2, y - 12 - dh + dw/2); ctx.arc(x, y - 12 - dh + dw/2, dw/2, Math.PI, 0); ctx.lineTo(x + dw/2, y - 12); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(30,18,8,.6)'; ctx.lineWidth = 1; line(x, y - 12 - dh + 4, x, y - 12);
    ctx.fillStyle = '#e2ae4a'; circ(x + dw/2 - 6, y - 12 - dh*.45, 1.8);
    townWindow(L + w*.13, top + 14, 20, 18, b.x); townWindow(R - w*.13 - 20, top + 14, 20, 18, b.x + 1);
    if(h > 100){ townWindow(L + w*.13, top + 60, 20, 18, b.x + 2); townWindow(R - w*.13 - 20, top + 60, 20, 18, b.x + 3); }
  }
  // sombra do beiral na parede
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(L, top, w, 8);
  // telhado: água da frente + empena do lado direito
  const rx = dx/2, ry = dy/2;
  const fr = [[L - o, top + 4], [R + o, top + 4], [R + o + rx, top - ry - rh], [L - o + rx, top - ry - rh]];
  poly(fr, vgrad(top - ry - rh, top + 4, shade(b.roof, .25), shade(b.roof, -.25)));
  ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1.2;
  for(let i = 1; i < 6; i++){ const k = i/6, yy = top + 4 - (ry + rh + 4)*k, xa = L - o + rx*k, xb = R + o + rx*k; line(xa, yy, xb, yy); }
  poly([[R + o, top + 4], [R + o + dx, top - dy + 4], [R + o + rx, top - ry - rh]], vgrad(top - ry - rh, top + 4, shade(wall, -.25), shade(wall, -.55)));
  ctx.strokeStyle = shade(b.roof, -.45); ctx.lineWidth = 3; line(L - o + rx, top - ry - rh, R + o + rx, top - ry - rh);
  ctx.lineWidth = 2; line(L - o, top + 4, R + o, top + 4);
  // chaminé (com fumaça) ou torre
  if(!b.barn && !b.tower){
    const cx = R - w*.18 + rx*.6, cyT = top - ry*.6 - rh*.75;
    poly([[cx - 9, cyT + 26], [cx + 9, cyT + 26], [cx + 9, cyT - 6], [cx - 9, cyT - 6]], '#6a5a4c');
    poly([[cx + 9, cyT + 22], [cx + 15, cyT + 18], [cx + 15, cyT - 10], [cx + 9, cyT - 6]], '#4a3e34');
    ctx.fillStyle = '#2a2420'; poly([[cx - 10, cyT - 6], [cx + 9, cyT - 6], [cx + 15, cyT - 10], [cx - 4, cyT - 10]]);
    smoke(cx, cyT - 12, b.x/97);
  }
  if(b.tower){
    // torre do relógio no meio do telhado, com bandeira
    const tx = x + rx*.5, tb = top - ry*.5 - rh*.55, tw2 = 34, th = 54;
    poly([[tx - tw2/2, tb], [tx + tw2/2, tb], [tx + tw2/2, tb - th], [tx - tw2/2, tb - th]], vgrad(tb - th, tb, shade(wall, .1), shade(wall, -.15)));
    poly([[tx + tw2/2, tb], [tx + tw2/2 + 12, tb - 9], [tx + tw2/2 + 12, tb - th - 9], [tx + tw2/2, tb - th]], dark);
    ctx.fillStyle = '#f2ead6'; circ(tx, tb - th*.55, 11); ctx.strokeStyle = '#2a2420'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(tx, tb - th*.55, 11, 0, TAU); ctx.stroke();
    const hA = T*.05, mA = T*.6; line(tx, tb - th*.55, tx + Math.cos(hA)*6, tb - th*.55 + Math.sin(hA)*6); line(tx, tb - th*.55, tx + Math.cos(mA)*9, tb - th*.55 + Math.sin(mA)*9);
    poly([[tx - tw2/2 - 5, tb - th], [tx + tw2/2 + 12, tb - th - 9], [tx + 4, tb - th - 42]], vgrad(tb - th - 42, tb - th, shade(b.roof, .3), shade(b.roof, -.2)));
    ctx.strokeStyle = '#2a2420'; ctx.lineWidth = 1.5; line(tx + 4, tb - th - 42, tx + 4, tb - th - 62);
    ctx.fillStyle = '#c8283a'; poly([[tx + 5, tb - th - 62], [tx + 22 + Math.sin(T*4)*3, tb - th - 57], [tx + 5, tb - th - 52]]);
  }
  // detalhes de cada prédio
  if(b.stall){
    // toldo listrado sobre a porta, caixotes e o mercador
    const aw = 96, ax = x - aw/2, ay = y - 12 - 46;
    for(let i = 0; i < 8; i++){ ctx.fillStyle = i % 2 ? '#c8283a' : '#f0e2c0'; poly([[ax + i*aw/8, ay], [ax + (i + 1)*aw/8, ay], [ax + (i + 1)*aw/8 + 3, ay + 22], [ax + i*aw/8 + 3, ay + 22]]); }
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(ax + 3, ay + 22, aw, 4);
    for(let i = 0; i < 8; i++){ ctx.fillStyle = i % 2 ? '#c8283a' : '#f0e2c0'; ctx.beginPath(); ctx.arc(ax + 3 + (i + .5)*aw/8, ay + 22, aw/16, 0, Math.PI); ctx.fill(); }
  }
  if(b.smithy){
    // placa da forja
    ctx.fillStyle = '#4a2e1c'; ctx.fillRect(L + 6, top + 50, 34, 22); ctx.fillStyle = '#9aa3ad'; poly([[L + 11, top + 58], [L + 35, top + 58], [L + 31, top + 64], [L + 15, top + 64]]); ctx.fillRect(L + 20, top + 64, 6, 4);
  }
}
// Fonte de pedra em três níveis com água
function drawFountain(){
  const {x, y} = FOUNT;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ell(x + 8, y + 6, 84, 30);
  // bacia de baixo (cilindro)
  ctx.fillStyle = cyl(x - 78, x + 78, '#8a8378'); ctx.beginPath(); ctx.ellipse(x, y - 4, 78, 30, 0, 0, Math.PI); ctx.lineTo(x - 78, y - 22); ctx.ellipse(x, y - 22, 78, 30, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#a49c90'; ell(x, y - 22, 78, 30); ctx.fillStyle = '#6a6358'; ell(x, y - 22, 70, 25);
  const wg = ctx.createRadialGradient(x - 20, y - 30, 4, x, y - 22, 70); wg.addColorStop(0, '#6ab0d8'); wg.addColorStop(1, '#22506e'); ctx.fillStyle = wg; ell(x, y - 21, 68, 24);
  ctx.strokeStyle = 'rgba(200,240,255,.45)'; ctx.lineWidth = 1.3;
  for(let i = 0; i < 3; i++){ const k = (T*.45 + i/3) % 1; ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.ellipse(x, y - 21, 10 + k*56, 4 + k*20, 0, 0, TAU); ctx.stroke(); } ctx.globalAlpha = 1;
  // coluna e bacia de cima
  ctx.fillStyle = cyl(x - 9, x + 9, '#9a9286'); ctx.fillRect(x - 9, y - 66, 18, 46);
  ctx.fillStyle = cyl(x - 32, x + 32, '#8a8378'); ctx.beginPath(); ctx.ellipse(x, y - 62, 32, 11, 0, 0, Math.PI); ctx.lineTo(x - 26, y - 70); ctx.ellipse(x, y - 70, 32, 11, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#a49c90'; ell(x, y - 70, 32, 11); ctx.fillStyle = '#3a7aa0'; ell(x, y - 70, 27, 8);
  ctx.fillStyle = cyl(x - 5, x + 5, '#a49c90'); ctx.fillRect(x - 5, y - 92, 10, 22); sphere(x, y - 94, 6, '#b8b0a4');
  // jatos de água
  ctx.strokeStyle = 'rgba(190,235,255,.7)'; ctx.lineWidth = 2;
  for(let i = 0; i < 6; i++){ const a = i*TAU/6 + T*.3, ex = x + Math.cos(a)*30, ey = y - 66 + Math.sin(a)*10; ctx.beginPath(); ctx.moveTo(x, y - 96); ctx.quadraticCurveTo((x + ex)/2 + Math.cos(a)*10, y - 112, ex, ey); ctx.stroke(); }
  if(Math.random() < .5) part({x:x + rnd(-26, 26), y:y - 68 + rnd(-6, 6), vy:rnd(-30, -10), life:.5, size:1.6, c:'#cfeeff'});
}
// Árvore com copa em camadas
function drawTree(x, y, s){
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ell(x + 14*s, y + 4, 34*s, 11*s);
  ctx.fillStyle = cyl(x - 6*s, x + 6*s, '#5a3e26'); ctx.fillRect(x - 5*s, y - 30*s, 10*s, 32*s);
  sphere(x - 12*s, y - 40*s, 22*s, '#2e5a2a'); sphere(x + 14*s, y - 44*s, 20*s, '#2a5226'); sphere(x, y - 62*s, 24*s, '#3a6e32'); sphere(x - 4*s, y - 78*s, 14*s, '#4a8040');
}
// Poste com lanterna
function drawLamp(x, y){
  const f = .8 + .2*Math.sin(T*11 + x);
  lampGlow(x, y - 50, 70, .32*f);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ell(x + 5, y + 2, 9, 3);
  ctx.fillStyle = cyl(x - 3, x + 3, '#3a3a40'); ctx.fillRect(x - 2.5, y - 46, 5, 48); ctx.fillRect(x - 6, y - 2, 12, 4);
  ctx.fillStyle = '#2a2a30'; poly([[x - 8, y - 46], [x + 8, y - 46], [x + 5, y - 62], [x - 5, y - 62]]);
  ctx.fillStyle = `rgba(255,${200 + 30*f | 0},120,${.9*f})`; poly([[x - 6, y - 48], [x + 6, y - 48], [x + 4, y - 60], [x - 4, y - 60]]);
  ctx.fillStyle = '#2a2a30'; poly([[x - 9, y - 62], [x + 9, y - 62], [x, y - 70]]);
}
function drawBarrel(x, y){ ctx.fillStyle = 'rgba(0,0,0,.3)'; ell(x + 4, y + 2, 12, 4); ctx.fillStyle = cyl(x - 10, x + 10, '#7a5230'); rrect(x - 10, y - 24, 20, 25, 6); ctx.fillStyle = '#3a3a40'; ctx.fillRect(x - 10, y - 19, 20, 2.5); ctx.fillRect(x - 10, y - 6, 20, 2.5); ctx.fillStyle = '#8a6038'; ell(x, y - 24, 10, 4); }
function drawCrate(x, y, s){ s = s || 1; const w = 22*s; ctx.fillStyle = 'rgba(0,0,0,.3)'; ell(x + 6, y + 2, w*.7, 5); poly([[x - w/2, y], [x + w/2, y], [x + w/2, y - w], [x - w/2, y - w]], vgrad(y - w, y, '#a07a48', '#7a5a34')); poly([[x + w/2, y], [x + w/2 + 8*s, y - 6*s], [x + w/2 + 8*s, y - w - 6*s], [x + w/2, y - w]], '#5a4026'); poly([[x - w/2, y - w], [x + w/2, y - w], [x + w/2 + 8*s, y - w - 6*s], [x - w/2 + 8*s, y - w - 6*s]], '#b8925a'); ctx.strokeStyle = '#4a321c'; ctx.lineWidth = 1.5; line(x - w/2, y - w, x + w/2, y); line(x - w/2, y, x + w/2, y - w); }
function drawChest(x, y){ ctx.fillStyle = 'rgba(0,0,0,.3)'; ell(x + 5, y + 2, 20, 5); poly([[x - 18, y], [x + 18, y], [x + 18, y - 16], [x - 18, y - 16]], vgrad(y - 16, y, '#8a5a30', '#5a3a1e')); ctx.fillStyle = vgrad(y - 28, y - 16, '#a06a3a', '#7a5028'); ctx.beginPath(); ctx.moveTo(x - 18, y - 16); ctx.quadraticCurveTo(x, y - 34, x + 18, y - 16); ctx.fill(); ctx.fillStyle = '#c9a24a'; ctx.fillRect(x - 18, y - 17, 36, 3); ctx.fillRect(x - 3, y - 14, 6, 7); }
// Gente da vila: mercador na porta e ferreiro martelando
function drawNPC(x, y, body, head, hat, hammer){
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ell(x, y + 1, 10, 3.5);
  ctx.fillStyle = cyl(x - 8, x + 8, body); rrect(x - 8, y - 26, 16, 26, 6);
  sphere(x, y - 32, 6.5, '#d2a580');
  ctx.fillStyle = '#1b1410'; circ(x + 2.5, y - 33, .9);
  if(hat){ ctx.fillStyle = hat; ell(x, y - 37, 9, 3); rrect(x - 5.5, y - 44, 11, 8, 3); }
  if(hammer){ const a = -1.2 + Math.abs(Math.sin(T*3))*1.6; ctx.save(); ctx.translate(x + 6, y - 20); ctx.rotate(a); ctx.strokeStyle = '#5a3e26'; ctx.lineWidth = 2.5; line(0, 0, 14, 0); ctx.fillStyle = '#6a6e76'; ctx.fillRect(12, -4, 6, 8); ctx.restore(); }
}
function drawAnvil(x, y){ ctx.fillStyle = 'rgba(0,0,0,.3)'; ell(x + 4, y + 2, 20, 5); ctx.fillStyle = '#2a2a2e'; ctx.fillRect(x - 6, y - 12, 12, 12); ctx.fillStyle = cyl(x - 20, x + 20, '#5a5c64'); poly([[x - 20, y - 20], [x + 16, y - 20], [x + 22, y - 16], [x + 10, y - 12], [x - 12, y - 12], [x - 20, y - 16]]); ctx.fillStyle = '#8a8c94'; ctx.fillRect(x - 18, y - 21, 34, 2); }
// Portal da Masmorra (nível 40): arco de pedra com redemoinho roxo
function drawDunPortal(){
  const px = DPORT.x, py = DPORT.y;
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ell(px + 6, py + 4, 44, 12);
  ctx.fillStyle = '#4a4452'; ell(px, py, 40, 12);
  ctx.fillStyle = cyl(px - 36, px + 36, '#5a5462'); ctx.beginPath(); ctx.moveTo(px - 36, py); ctx.lineTo(px - 36, py - 54); ctx.arc(px, py - 54, 36, Math.PI, 0); ctx.lineTo(px + 36, py); ctx.lineTo(px + 24, py); ctx.lineTo(px + 24, py - 54); ctx.arc(px, py - 54, 24, 0, Math.PI, true); ctx.lineTo(px - 24, py); ctx.closePath(); ctx.fill();
  const g = ctx.createRadialGradient(px, py - 44, 2, px, py - 44, 38); g.addColorStop(0, 'rgba(240,200,255,.95)'); g.addColorStop(.5, 'rgba(150,70,220,.8)'); g.addColorStop(1, 'rgba(60,10,90,.25)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(px - 23, py); ctx.lineTo(px - 23, py - 54); ctx.arc(px, py - 54, 23, Math.PI, 0); ctx.lineTo(px + 23, py); ctx.closePath(); ctx.fill();
  for(let i = 0; i < 6; i++){ const a = T*2.5 + i*TAU/6; ctx.fillStyle = '#f0d8ff'; circ(px + Math.cos(a)*14, py - 38 + Math.sin(a)*22, 1.8); }
  lampGlow(px, py - 40, 90, .25);
  ctx.fillStyle = '#c08aff'; circ(px - 30, py - 86 + Math.sin(T*3)*2, 3); circ(px + 30, py - 86 + Math.cos(T*3)*2, 3);
}
// Fenda selada (antes do nível 40): rachadura escura no chão, brilho roxo fraco e uma laje rachada por cima
function drawRiftSealed(){
  const px = DPORT.x, py = DPORT.y, f = .5 + .5*Math.sin(T*1.2);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ell(px, py, 46, 14);
  ctx.globalAlpha = .18 + .12*f; ctx.fillStyle = '#7a4ac8'; ell(px, py - 2, 40, 11); ctx.globalAlpha = 1;
  ctx.strokeStyle = '#120c18'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px - 34, py - 2); ctx.lineTo(px - 14, py + 3); ctx.lineTo(px - 4, py - 4); ctx.lineTo(px + 12, py + 2); ctx.lineTo(px + 32, py - 3); ctx.stroke();
  ctx.strokeStyle = `rgba(150,90,220,${.25 + .25*f})`; ctx.lineWidth = 1.2; ctx.stroke();
  poly([[px - 22, py - 6], [px + 20, py - 9], [px + 26, py + 1], [px - 18, py + 5]], vgrad(py - 9, py + 5, '#6a6470', '#4a4452'));
  ctx.strokeStyle = '#2a2430'; ctx.lineWidth = 1; line(px - 4, py - 7, px + 2, py + 3);
}
// Pedras em volta da Fenda: em pé e com runas acesas quando aberta; quebradas e caídas quando selada. front = as da frente (desenhadas depois do herói)
const RIFT_STONES = [0, 1, 2, 3, 4, 5, 6].map(i => { const a = i/7*TAU + .25; return {x:DPORT.x + Math.cos(a)*84, y:DPORT.y + Math.sin(a)*32, h:40 + (i % 3)*7, front:Math.sin(a) > 0}; });
function drawRiftStones(front){
  const open = dunOpen();
  for(const s of RIFT_STONES){
    if(s.front !== front) continue;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ell(s.x + 3, s.y + 2, 10, 4);
    if(!open){ // tocos caídos
      poly([[s.x - 7, s.y], [s.x + 7, s.y], [s.x + 6, s.y - 12], [s.x - 5, s.y - 15]], vgrad(s.y - 15, s.y, '#6a6470', '#3e3846'));
      poly([[s.x + 6, s.y + 3], [s.x + 22, s.y + 1], [s.x + 22, s.y - 5], [s.x + 7, s.y - 4]], vgrad(s.y - 5, s.y + 3, '#5a5462', '#3a3442'));
      continue;
    }
    poly([[s.x - 8, s.y], [s.x + 8, s.y], [s.x + 6, s.y - s.h], [s.x, s.y - s.h - 6], [s.x - 6, s.y - s.h]], cyl(s.x - 8, s.x + 8, '#6e6878'));
    const g = .55 + .45*Math.sin(T*3 + s.x);
    ctx.strokeStyle = `rgba(200,150,255,${g})`; ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.moveTo(s.x - 3, s.y - s.h*.7); ctx.lineTo(s.x + 3, s.y - s.h*.55); ctx.lineTo(s.x - 2, s.y - s.h*.4); ctx.lineTo(s.x + 2, s.y - s.h*.28); ctx.stroke();
    lampGlow(s.x, s.y - s.h*.5, 22, .12*g);
  }
}
// Mesa Rúnica do Ezequiel: mesa de pedra com runas acesas e Pedras em cima
function drawRuneTable(){
  const {x, y} = RUNE_TABLE, f = .6 + .4*Math.sin(T*2.4);
  ctx.fillStyle = 'rgba(0,0,0,.32)'; ell(x + 4, y + 2, 26, 6);
  poly([[x - 16, y], [x - 10, y], [x - 10, y - 14], [x - 16, y - 14]], '#3e3846'); poly([[x + 10, y], [x + 16, y], [x + 16, y - 14], [x + 10, y - 14]], '#3e3846');
  poly([[x - 26, y - 14], [x + 26, y - 14], [x + 30, y - 20], [x - 22, y - 20]], vgrad(y - 20, y - 14, '#7a7484', '#55505e'));
  ctx.fillStyle = '#4a4452'; ctx.fillRect(x - 26, y - 14, 52, 4);
  ctx.strokeStyle = `rgba(200,150,255,${.5 + .4*f})`; ctx.lineWidth = 1; for(let i = 0; i < 4; i++) line(x - 18 + i*12, y - 12, x - 14 + i*12, y - 11);
  for(const [dx, c] of [[-10, '#b07cff'], [6, '#d0a8ff']]){ const sx = x + dx, sy = y - 24; ctx.beginPath(); for(let i = 0; i < 6; i++){ const a = i/6*TAU - Math.PI/2; ctx.lineTo(sx + Math.cos(a)*5, sy + Math.sin(a)*5.5); } ctx.closePath(); ctx.fillStyle = '#3a2260'; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 1.2; ctx.stroke(); }
  lampGlow(x, y - 22, 34, .2*f);
}
// Ezequiel, o Guardião da Fenda: manto azul-escuro com capuz e cajado com cristal roxo (balança ao andar)
function drawEzequiel(){
  const {x, y} = riftNpc, bob = riftNpc.moving ? Math.abs(Math.sin(riftNpc.walkT*9))*2 : 0;
  ctx.save(); ctx.translate(0, -bob);
  ctx.strokeStyle = '#5a3e26'; ctx.lineWidth = 2.4; line(x + 11, y + bob, x + 13, y - 46);
  drawNPC(x, y, '#26324e', 0, '#18203a');
  ctx.fillStyle = '#18203a'; poly([[x - 9, y - 30], [x + 9, y - 30], [x + 6, y - 44], [x, y - 49], [x - 6, y - 44]]); // capuz
  ctx.fillStyle = '#d2a580'; circ(x + 1, y - 33, 3.5);
  const g = .6 + .4*Math.sin(T*4); lampGlow(x + 13, y - 50, 20, .25*g);
  ctx.fillStyle = '#c08aff'; ctx.beginPath(); ctx.moveTo(x + 13, y - 57); ctx.lineTo(x + 17, y - 50); ctx.lineTo(x + 13, y - 44); ctx.lineTo(x + 9, y - 50); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// Lista de tudo que tem altura na vila (montada uma vez; a Fenda muda de cara sozinha conforme dunOpen())
let TOWN_PROPS = null;
function townProps(){
  if(TOWN_PROPS) return TOWN_PROPS;
  const P = [], add = (y, draw) => P.push({y, draw});
  for(const b of TOWN_B) add(b.y, () => drawBuilding(b));
  add(FOUNT.y, drawFountain);
  for(const [x, y, s] of [[60,170,1],[350,160,.9],[760,165,.95],[1045,175,1],[45,420,1.05],[1060,430,1],[40,690,.95],[1065,690,1],[420,935,.9],[690,940,.95],[60,935,1],[1050,935,.95]]) add(y, () => drawTree(x, y, s));
  for(const [x, y] of [[400,420],[700,420],[400,640],[700,640],[440,850],[660,850]]) add(y, () => drawLamp(x, y));
  const sh = TOWN_B.find(b => b.id === 'shop'), fo = TOWN_B.find(b => b.id === 'forge'), st = TOWN_B.find(b => b.id === 'celeiro');
  add(sh.y + 18, () => drawNPC(sh.x + 52, sh.y + 18, '#4a2f4a', 0, '#6a3a22'));
  add(sh.y + 14, () => drawCrate(sh.x - 88, sh.y + 14)); add(sh.y + 24, () => drawBarrel(sh.x - 64, sh.y + 24));
  add(fo.y + 26, () => drawAnvil(fo.x - 62, fo.y + 26)); add(fo.y + 24, () => drawNPC(fo.x - 88, fo.y + 24, '#3a3430', 0, 0, 1));
  add(fo.y + 18, () => drawBarrel(fo.x + 70, fo.y + 18));
  add(st.y + 20, () => drawBarrel(st.x + 58, st.y + 20)); add(st.y + 16, () => drawCrate(st.x - 78, st.y + 16)); add(st.y + 26, () => drawCrate(st.x - 60, st.y + 26, .8)); add(st.y + 22, () => drawBarrel(st.x + 92, st.y + 22));
  add(DPORT.y - 30, () => drawRiftStones(false));
  add(DPORT.y, () => { if(dunOpen()) drawDunPortal(); else drawRiftSealed(); });
  add(DPORT.y + 34, () => drawRiftStones(true));
  add(RUNE_TABLE.y, () => { if(dunOpen()) drawRuneTable(); });
  // Tobias (Baú de Visuais): manto roxo com bordas douradas, ao lado de um baú brilhante
  add(NPC_CHEST.y, () => {
    const {x, y} = NPC_CHEST, f = .6 + .4*Math.sin(T*3);
    lampGlow(x + 30, y - 10, 46, .22*f); drawChest(x + 30, y + 4);
    ctx.fillStyle = `rgba(255,230,140,${.7*f})`; for(let i = 0; i < 3; i++){ const a = T*2 + i*2.1; circ(x + 30 + Math.cos(a)*16, y - 24 + Math.sin(a*1.3)*6, 1.6); }
    drawNPC(x, y, '#5a2a7a', 0, '#c9a24a'); ctx.fillStyle = '#c9a24a'; ctx.fillRect(x - 8, y - 6, 16, 2.5);
  });
  return TOWN_PROPS = P;
}
// Chão da vila: grama nas bordas, praça em volta da fonte, caminhos e canteiros
function drawTownGround(){
  ctx.fillStyle = '#2c3a22'; ctx.fillRect(0, 0, TOWN_W, 130); ctx.fillRect(0, 0, 30, TOWN_H); ctx.fillRect(TOWN_W - 30, 0, 30, TOWN_H); ctx.fillRect(0, TOWN_H - 30, TOWN_W, 30);
  ctx.fillStyle = 'rgba(80,110,50,.35)'; for(let i = 0; i < 60; i++){ const x = (i*137) % TOWN_W, y = (i*53) % 120; ell(x, y + 6, 14, 5); }
  // praça
  ctx.fillStyle = 'rgba(160,150,130,.14)'; ell(FOUNT.x, FOUNT.y - 10, 190, 120);
  ctx.strokeStyle = 'rgba(30,26,20,.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(FOUNT.x, FOUNT.y - 10, 190, 120, 0, 0, TAU); ctx.stroke();
  // canteiros de flores
  for(const [x, y] of [[360,330],[740,330],[360,690],[740,690]]){
    ctx.fillStyle = '#4a3a28'; ell(x, y, 34, 13); ctx.fillStyle = '#2e5a2a'; ell(x, y - 2, 30, 10);
    for(let i = 0; i < 9; i++){ ctx.fillStyle = ['#e04a5a','#f5cf3a','#c08aff','#ffffff'][i % 4]; circ(x - 24 + i*6, y - 3 + Math.sin(i*2)*4, 2.4); }
  }
  // plataforma do portal de saída
  ctx.fillStyle = '#5a5462'; ell(TPORT.x, TPORT.y, 46, 16); ctx.fillStyle = '#6e6878'; ell(TPORT.x, TPORT.y - 3, 40, 13);
  ctx.strokeStyle = 'rgba(169,196,255,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(TPORT.x, TPORT.y - 3, 34 + Math.sin(T*3)*2, 11, 0, 0, TAU); ctx.stroke();
}
function drawTown(){
  drawTownGround(); // os portais ficam em pé: render desenha depois do chão (drawTownPortals)
}
function drawTownPortals(){
  atY(TPORT.y); drawPortal(TPORT.x, TPORT.y, 1);
  if(mode === 'townLeave' && townExit.temp){ atY(townExit.y); drawPortal(townExit.x, townExit.y, 1); }
}
// Placas com o nome dos lugares (por cima de tudo); a de perto do herói fica mais forte
function drawTownLabels(){
  ctx.font = '800 13px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center';
  // ay = y do chão embaixo da placa (câmera 3D: a placa fica no tamanho da distância dela)
  const tag = (x, y, s, c, near, ay) => {
    atY(ay);
    const w = ctx.measureText(s).width + 16;
    ctx.globalAlpha = near ? 1 : .82; ctx.fillStyle = 'rgba(10,12,10,.78)'; rrect(x - w/2, y - 15, w, 21, 8);
    ctx.strokeStyle = c; ctx.lineWidth = near ? 2 : 1; ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(x - w/2, y - 15, w, 21, 8); ctx.stroke();
    ctx.fillStyle = c; ctx.fillText(s, x, y); ctx.globalAlpha = 1;
  };
  for(const z of townZones()){
    const b = TOWN_B.find(b => b.id === z.id), near = D(hero, z) < 110;
    const y = b ? b.y - b.h - b.h*.72 - b.dep*.22 - 16 : z.ly;
    tag(b ? b.x + b.dep*.3 : z.lx, y, z.n, {dun:'#e0b0ff', forge:'#ffb070', shop:'#f5cf3a', chest:'#ffd27a', runes:'#c9a8ff'}[z.id] || '#c9a8ff', near, b ? b.y : z.y);
  }
  if(!dunOpen() && !cut) tag(DPORT.x, DPORT.y - 44, 'Fenda selada · nível ' + MAX_LV, '#8a8098', D(hero, DPORT) < 110, DPORT.y);
  // tutorial: seta roxa pulando em cima da Fenda
  if(S.tut === 1 && !cut){ atY(DPORT.y); const ay = DPORT.y - 136 + Math.sin(T*5)*6; ctx.fillStyle = '#c08aff'; poly([[DPORT.x - 10, ay], [DPORT.x + 10, ay], [DPORT.x, ay + 14]]); }
  tag(TPORT.x, TPORT.y + 30, 'Portal · Partir', '#a9c4ff', D(hero, TPORT) < 110, TPORT.y + 30);
  // destino do toque
  if(townGoal){ atY(townGoal.y); ctx.strokeStyle = 'rgba(220,240,180,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(townGoal.x, townGoal.y, 10 + Math.sin(T*8)*2, 4, 0, 0, TAU); ctx.stroke(); }
}
function drawPortal(x, y, k){
  const g = ctx.createRadialGradient(x, y - 22, 2, x, y - 22, 34*k); g.addColorStop(0, 'rgba(170,200,255,.9)'); g.addColorStop(.5, 'rgba(90,110,220,.55)'); g.addColorStop(1, 'rgba(60,40,160,0)');
  ctx.fillStyle = g; ell(x, y - 22, 22*k, 34*k);
  ctx.strokeStyle = '#a9c4ff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(x, y - 22, 16*k, 28*k, 0, 0, TAU); ctx.stroke();
  for(let i = 0; i < 4; i++){ const a = T*3 + i*TAU/4; ctx.fillStyle = '#dfe8ff'; circ(x + Math.cos(a)*14*k, y - 22 + Math.sin(a)*24*k, 1.6); }
}
// Orbe da Anulação no chão: cristal partido em duas metades que se afastam e voltam devagar, com faísca na rachadura
function drawAnulShard(x, y, c){
  const gap = 1.6 + Math.sin(T*3)*1.1, tilt = Math.sin(T*1.7)*.12;
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(.78, .78); // mesma altura dos orbes redondos
  for(const sd of [-1, 1]){
    const ox = sd*gap, g = ctx.createLinearGradient(ox - 6*sd, -8, ox + 6*sd, 8); g.addColorStop(0, shade(c, .45)); g.addColorStop(1, shade(c, -.45));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ox, -9); ctx.lineTo(ox + sd*7, 0); ctx.lineTo(ox, 9); ctx.lineTo(ox + sd*1.4, 4); ctx.lineTo(ox - sd*.6, 0); ctx.lineTo(ox + sd*1.4, -4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = shade(c, .6); ctx.lineWidth = .8; ctx.stroke();
  }
  ctx.globalAlpha *= .5 + .5*Math.sin(T*8); ctx.fillStyle = '#ffffff'; circ(0, Math.sin(T*5)*5, 1.3);
  ctx.restore();
}
// Orbe no chão: esfera brilhante com coluna de luz e nome
function drawOrbDrop(d){
  const O = ORBS[d.orb], b = Math.sin(T*3 + d.x)*2, y = d.y - 8 + b;
  const g = ctx.createLinearGradient(0, d.y - 80, 0, d.y); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, O.c + '88'); ctx.fillStyle = g; ctx.fillRect(d.x - 4, d.y - 80, 8, 80);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ell(d.x, d.y + 3, 7, 3);
  const h = ctx.createRadialGradient(d.x, y, 1, d.x, y, 14); h.addColorStop(0, O.c + 'aa'); h.addColorStop(1, O.c + '00'); ctx.fillStyle = h; circ(d.x, y, 14);
  if(d.orb === 'anul') drawAnulShard(d.x, y, O.c);
  else {
    // orbe redondo: esfera um pouco maior com redemoinho de energia girando dentro
    sphere(d.x, y, 7, O.c);
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.1;
    for(let i = 0; i < 2; i++){ const a = T*4 + i*Math.PI; ctx.beginPath(); ctx.arc(d.x, y, 3.8, a, a + 1.9); ctx.stroke(); }
    ctx.fillStyle = '#ffffff'; ctx.globalAlpha *= .7 + .3*Math.sin(T*6); circ(d.x, y, 1.4); ctx.globalAlpha = 1;
  }
  ctx.font = '700 11px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center';
  const tw = ctx.measureText(O.n).width;
  ctx.fillStyle = 'rgba(6,8,7,.85)'; ctx.fillRect(d.x - tw/2 - 4, d.y - 32, tw + 8, 15);
  ctx.fillStyle = O.c; ctx.fillText(O.n, d.x, d.y - 21);
}
// Pedra da Masmorra no chão: pedra rúnica de 6 lados (roxa) com o nível escrito, coluna de luz e nome
function drawStoneDrop(d){
  const b = Math.sin(T*2.5 + d.x)*2, y = d.y - 10 + b, c = STONE_C;
  const g = ctx.createLinearGradient(0, d.y - 90, 0, d.y); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, c + 'aa'); ctx.fillStyle = g; ctx.fillRect(d.x - 5, d.y - 90, 10, 90);
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ell(d.x, d.y + 3, 9, 3.5);
  const h = ctx.createRadialGradient(d.x, y, 1, d.x, y, 18); h.addColorStop(0, c + 'aa'); h.addColorStop(1, c + '00'); ctx.fillStyle = h; circ(d.x, y, 18);
  ctx.beginPath(); for(let i = 0; i < 6; i++){ const a = i/6*TAU - Math.PI/2; ctx.lineTo(d.x + Math.cos(a)*9, y + Math.sin(a)*10); } ctx.closePath();
  ctx.fillStyle = '#3a2260'; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.font = '800 10px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#f0e2ff'; ctx.fillText(d.stone, d.x, y + 3.5);
  const n = 'Pedra da Masmorra ' + d.stone; ctx.font = '700 11px "Alegreya Sans", sans-serif';
  const tw = ctx.measureText(n).width; ctx.fillStyle = 'rgba(6,8,7,.85)'; ctx.fillRect(d.x - tw/2 - 4, d.y - 38, tw + 8, 15);
  ctx.fillStyle = c; ctx.fillText(n, d.x, d.y - 27);
}
function drawItemDrop(d){
  if(d.atl) return drawAtlasDrop(d); // Pedra de Passagem, Tabuleta, Fragmento (10)
  if(d.stone) return drawStoneDrop(d);
  if(d.orb) return drawOrbDrop(d);
  const it = d.it, col = RAR[it.rar].c, b = Math.sin(T*3 + d.x)*1.5;
  if(it.rar >= 2){ const g = ctx.createLinearGradient(0, d.y - 70, 0, d.y); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, col + (it.rar === LEG_R ? '88' : '66')); ctx.fillStyle = g; ctx.fillRect(d.x - 5, d.y - 70, 10, 70); }
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ell(d.x, d.y + 3, 8, 3);
  ctx.save(); ctx.translate(d.x, d.y - 4 + b); ctx.rotate(.6); ctx.fillStyle = col; ctx.fillRect(-5, -3, 10, 6); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(-5, 1, 10, 2); ctx.restore();
  if(it.rar >= 1){
    ctx.font = '700 11px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center';
    const tw = ctx.measureText(it.name).width;
    ctx.fillStyle = 'rgba(6,8,7,.8)'; ctx.fillRect(d.x - tw/2 - 4, d.y - 26, tw + 8, 15);
    ctx.fillStyle = col; ctx.fillText(it.name, d.x, d.y - 15);
  }
}
// Câmera 3D (03): o chão e o que fica deitado nele (nuvens, marcas, mira) são desenhados retos em gcv e depois esticados
// na tela em faixas de poucos pixels, cada uma na escala da sua distância (groundBlit). O resto é desenhado com atY(y).
let gcv = null, gctx = null;
function groundBegin(x0, y0, w, h, bg){
  const g = dpr*zoom, W = Math.ceil(w*g), H = Math.ceil(h*g);
  if(!gcv){ gcv = document.createElement('canvas'); gctx = gcv.getContext('2d', {alpha:false}); }
  if(gcv.width !== W || gcv.height !== H){ gcv.width = W; gcv.height = H; }
  gctx.setTransform(g, 0, 0, g, -x0*g, -y0*g);
  gctx.fillStyle = bg; gctx.fillRect(x0, y0, w, h);
}
function groundBlit(x0, y0){
  const g = dpr*zoom, GW = gcv.width, GH = gcv.height, H = cv.height, band = Math.max(3, Math.round(5*dpr)); // faixas de ~5 px: metade das cópias de antes, sem degrau visível
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for(let Y = 0; Y < H; Y += band){
    const Y1 = Math.min(H, Y + band), v0 = (Y/dpr - ch/2)/zoom, v1 = (Y1/dpr - ch/2)/zoom;
    const sy0 = clamp((cam.y + camDy(v0) - y0)*g, 0, GH), sy1 = clamp((cam.y + camDy(v1) - y0)*g, 0, GH);
    if(sy1 - sy0 < .01) continue;
    const s = camS(camDy((v0 + v1)/2));
    ctx.drawImage(gcv, 0, sy0, GW, sy1 - sy0, dpr*(cw/2 + zoom*s*(x0 - cam.x)), Y, zoom*s*GW/g*dpr, Y1 - Y);
  }
}
// Partículas em lote: posição e tamanho calculados direto na tela (mesma conta do atY, sem trocar a transformação a cada uma) e
// agrupadas por cor + transparência (5 níveis): um fill/stroke por grupo em vez de um por partícula.
const PART_A = [.2, .4, .6, .8, 1];
let vigKey = '', vigGrad = null; // vinheta da tela (render)
function drawParts(){
  if(!parts.length) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const groups = new Map(), W = cv.width, H = cv.height, zd = zoom*dpr;
  for(const p of parts){
    const k = 1 - p.t/p.life; if(k <= 0) continue;
    const dy = p.y - cam.y, s = camS(dy), sx = dpr*cw/2 + zd*s*(p.x - cam.x), sy = dpr*(ch/2 + zoom*camV(dy)), z = zd*s;
    if(sx < -40 || sx > W + 40 || sy < -40 || sy > H + 40) continue;
    const ai = Math.min(4, k*5 | 0), key = p.kind + (p.kind === 'streak' ? Math.round(p.size*2) : '') + '|' + p.c + '|' + ai;
    let g = groups.get(key); if(!g){ g = {kind:p.kind, c:p.c, a:PART_A[ai], w:p.size*z, pts:[]}; groups.set(key, g); }
    if(p.kind === 'streak') g.pts.push(sx, sy, sx - p.vx*.04*z, sy - p.vy*.04*z);
    else g.pts.push(sx, sy, Math.max(.6, (p.kind === 'bubble' ? p.size : p.size*(.5 + .5*k))*z));
  }
  for(const g of groups.values()){
    ctx.globalAlpha = g.a; const P = g.pts; ctx.beginPath();
    if(g.kind === 'streak'){ for(let i = 0; i < P.length; i += 4){ ctx.moveTo(P[i], P[i + 1]); ctx.lineTo(P[i + 2], P[i + 3]); } ctx.strokeStyle = g.c; ctx.lineWidth = Math.max(.8, g.w); ctx.stroke(); }
    else { for(let i = 0; i < P.length; i += 3){ ctx.moveTo(P[i] + P[i + 2], P[i + 1]); ctx.arc(P[i], P[i + 1], P[i + 2], 0, TAU); } if(g.kind === 'bubble'){ ctx.strokeStyle = g.c; ctx.lineWidth = dpr; ctx.stroke(); } else { ctx.fillStyle = g.c; ctx.fill(); } }
  }
  ctx.globalAlpha = 1;
}
// Brilhos prontos (canvas com o degradê desenhado uma vez) para bola de fogo/brasa e nuvens: desenhar uma imagem é bem mais barato
// que criar e pintar um degradê novo para cada um a cada quadro. glowImg(stops) guarda por cores.
const glowCache = new Map();
function glowImg(stops){
  const key = stops.join('|'); let c = glowCache.get(key); if(c) return c;
  c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  for(let i = 0; i < stops.length; i += 2) gr.addColorStop(stops[i], stops[i + 1]);
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); glowCache.set(key, c); return c;
}
const GLOW_FIRE = [0, 'rgba(255,245,200,1)', .35, 'rgba(255,170,60,.9)', 1, 'rgba(255,80,20,0)'];
const CLOUD_FIRE = [0, 'rgba(255,150,50,.42)', .06, 'rgba(255,150,50,.42)', .7, 'rgba(200,60,20,.28)', 1, 'rgba(120,30,10,0)'];
const CLOUD_ACID = [0, 'rgba(155,216,74,.42)', .06, 'rgba(155,216,74,.42)', .7, 'rgba(110,170,50,.28)', 1, 'rgba(90,140,40,0)'];
function render(){
  ctx = CTX; // se um quadro anterior quebrou no meio do chão, volta para o canvas da tela
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const bg = scene === 'town' ? '#17140f' : '#060807';
  ctx.fillStyle = bg; ctx.fillRect(0, 0, cw, ch);
  // área do mundo que aparece (na câmera 3D o alto da tela vê mais longe e mais largo)
  const z = zoom, hw = cw/2/z/camSTop;
  const vx0 = cam.x - hw - 80, vx1 = cam.x + hw + 80, vy0 = cam.y + camTop - 80, vy1 = cam.y + camBot + 80;
  const inb = (x, y) => x > vx0 && x < vx1 && y > vy0 && y < vy1, vis = o => inb(o.x, o.y);
  ctx.save();
  const main = ctx, gx0 = cam.x - hw - 4, gy0 = cam.y + camTop - 4;
  groundBegin(gx0, gy0, hw*2 + 8, camBot - camTop + 8, bg); ctx = gctx;
  if(scene === 'town'){
    if(townPat){ ctx.fillStyle = townPat; ctx.fillRect(0, 0, WORLD.w, WORLD.h); }
    ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 16; ctx.strokeRect(-8, -8, WORLD.w + 16, WORLD.h + 16);
    drawTown();
  } else if(LV) drawLevelFloor(vis);
  for(const c of clouds){
    const k = Math.min(1, c.t*3) * Math.min(1, (c.dur - c.t)*2), pul = 1 + Math.sin(T*6)*.04;
    // Nuvem ácida (verde) ou chão em chamas do Meteoro (laranja): brilho pronto (glowImg) esticado na elipse + borda tracejada
    ctx.globalAlpha = k; ctx.drawImage(glowImg(c.fire ? CLOUD_FIRE : CLOUD_ACID), c.x - c.r*pul, c.y - c.r*.8*pul, c.r*2*pul, c.r*1.6*pul);
    ctx.globalAlpha = .5*k; ctx.strokeStyle = c.fire ? 'rgb(255,200,120)' : 'rgb(190,240,120)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.ellipse(c.x, c.y, c.r, c.r*.8, T*.3, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }
  // Áreas marcadas pelas criaturas: contorno + miolo que cresce até a hora do golpe (cone para golpes à frente)
  for(const z of zones){
    const k = clamp(z.t/z.dur, 0, 1), pul = .5 + .5*Math.sin(T*(8 + k*16));
    ctx.fillStyle = z.c; ctx.strokeStyle = z.c;
    if(z.k === 'cone'){
      const wedge = rr => { ctx.beginPath(); ctx.moveTo(z.x, z.y); ctx.ellipse(z.x, z.y, rr, rr*.75, 0, z.ang - z.spread/2, z.ang + z.spread/2); ctx.closePath(); };
      ctx.globalAlpha = .14 + .1*k; wedge(z.r); ctx.fill();
      ctx.globalAlpha = .35 + .3*k; wedge(z.r*k); ctx.fill();
      ctx.globalAlpha = .55 + .35*pul; ctx.lineWidth = 2.5; wedge(z.r); ctx.stroke();
    } else {
      ctx.globalAlpha = .14 + .1*k; ell(z.x, z.y, z.r, z.r*.75);
      ctx.globalAlpha = .35 + .3*k; ell(z.x, z.y, z.r*k, z.r*.75*k);
      ctx.globalAlpha = .55 + .35*pul; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(z.x, z.y, z.r, z.r*.75, 0, 0, TAU); ctx.stroke();
      if(z.k === 'leap' && z.mon.leapTo){ ctx.globalAlpha = .5 + .3*pul; ctx.lineWidth = 2; ctx.setLineDash([8, 7]); line(z.mon.x, z.mon.y, z.x, z.y); ctx.setLineDash([]); } // preparando o pulo: linha até a marca
      if(z.k === 'spell'){ ctx.globalAlpha = .4*k; ctx.lineWidth = 1.5; for(let i = 0; i < 3; i++){ const a = T*2 + i*TAU/3; line(z.x + Math.cos(a)*z.r*.6, z.y + Math.sin(a)*z.r*.45, z.x + Math.cos(a + 2)*z.r*.6, z.y + Math.sin(a + 2)*z.r*.45); } }
    }
    ctx.globalAlpha = 1;
  }
  if(scene === 'map'){ atlasGround(); drawFocus(); } // Atlas: círculo do Ritual, área da Brecha (10)
  drawAim();
  ctx = main; groundBlit(gx0, gy0);
  if(scene === 'town') drawTownPortals();
  for(const d of drops) if(vis(d)){ atY(d.y); drawItemDrop(d); }
  for(const c of coins){ atY(c.y); ctx.fillStyle = '#8a6420'; circ(c.x, c.y + 1, 3.6); ctx.fillStyle = '#e2ae4a'; circ(c.x, c.y, 3.4); ctx.fillStyle = '#ffe39a'; circ(c.x - 1, c.y - 1, 1.2); }
  for(const m of mons) if(m.dead && vis(m)){ atY(m.y); drawMon(m); }
  if(portal){ atY(portal.y); drawPortal(portal.x, portal.y, clamp(portal.t/.6, 0, 1)); }
  const ents = mons.filter(m => !m.dead && vis(m)); ents.push(hero);
  if(scene === 'town'){
    // prédios, árvores e postes entram na ordem por y (os muito abaixo da tela cresceriam demais: ficam de fora)
    const far = cam.y + Math.min(camBot + 200, camD*.75);
    for(const p of townProps()) if(p.y < far) ents.push(p);
    if(dunOpen() || cut) ents.push({y:riftNpc.y, draw:drawEzequiel}); // Ezequiel anda na cena: entra com o y de agora
  }
  else if(LV){
    levelProps(inb, ents); // paredes e obstáculos do mapa
    atlasProps(vis, ents); // Brecha e altar do Ritual (10)
    for(const g of bloodFx) ents.push({y:g.y + (g.k === 'slash' ? 2 : -1), draw:() => drawBloodFx(g)}); // Frenesi Sangrento
    for(const o of decor) if(vis(o) && !FLAT_DECOR[o.t]) ents.push(entOf(o, o.y, ENT_DECOR)); // enfeites em pé
  }
  ents.sort((a, b) => a.y - b.y);
  for(const e of ents){ atY(e.y); e === hero ? drawHero() : e.k ? drawEnt(e) : e.draw ? e.draw() : drawMon(e); }
  if(scene === 'town') drawTownLabels();
  // Arremessos das criaturas (bomba, poção, bloco de gelo, teia) voando em arco até a marca
  for(const z of zones){
    if(!z.bomb) continue;
    const k = clamp(z.t/z.dur, 0, 1), b = z.bomb, x = b.x0 + (z.x - b.x0)*k, y = b.y0 + (z.y - b.y0)*k - Math.sin(k*Math.PI)*110;
    atY(b.y0 + (z.y - b.y0)*k);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ell(b.x0 + (z.x - b.x0)*k, (b.y0 + 30) + (z.y - b.y0 - 30)*k, 7, 3);
    if(b.type === 'goblin'){ sphere(x, y, 6, '#3a3a40'); ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 1.5; line(x + 3, y - 4, x + 7, y - 9); ctx.fillStyle = `rgba(255,${200 + 55*Math.random() | 0},80,1)`; circ(x + 7, y - 10, 2.5); }
    else if(b.type === 'yeti'){ ctx.save(); ctx.translate(x, y); ctx.rotate(T*6); ctx.fillStyle = vgrad(-10, 10, '#f0f8ff', '#8fc8e8'); rrect(-10, -10, 20, 20, 4); ctx.restore(); }
    else if(b.type === 'aranhacav'){ ctx.fillStyle = '#e8e2f0'; circ(x, y, 7); ctx.strokeStyle = 'rgba(230,226,240,.6)'; ctx.lineWidth = 1; for(let i = 0; i < 4; i++){ const a = i*Math.PI/4; line(x - Math.cos(a)*9, y - Math.sin(a)*9, x + Math.cos(a)*9, y + Math.sin(a)*9); } }
    else if(b.type === 'lavrador'){ sphere(x, y, 7, '#e07a20'); ctx.strokeStyle = '#8a4a10'; ctx.lineWidth = 1; line(x - 3, y - 6, x - 3, y + 6); line(x + 3, y - 6, x + 3, y + 6); ctx.fillStyle = '#3a6a20'; ctx.fillRect(x - 1, y - 10, 2, 4); } // abóbora
    else { sphere(x, y, 6, '#6a3a8a'); ctx.fillStyle = z.c; circ(x, y - 7, 2.5); } // poção
  }
  const FX = fxLook();
  for(const p of projs){
    atY(p.y);
    if(p.hostile){ ctx.fillStyle = p.c; circ(p.x, p.y, 4.5); ctx.globalAlpha = .35; circ(p.x, p.y, 8); ctx.globalAlpha = 1; continue; }
    if(p.kind === 'ember' || p.kind === 'fireball'){
      // Fogo do Mago: núcleo claro com halo laranja (ou na cor do visual de efeito)
      const R = (p.kind === 'fireball' ? 9 : 5)*2.2;
      ctx.drawImage(glowImg(FX ? [0, FX.c2, .35, FX.c + 'e6', 1, FX.c + '00'] : GLOW_FIRE), p.x - R, p.y - R, R*2, R*2);
      continue;
    }
    const c = FX ? (p.kind === 'arrow' ? FX.c2 : FX.c) : p.kind === 'arrow' ? '#e8e2d0' : p.kind === 'farrow' ? '#d8f07a' : '#9bd84a';
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
    if(p.kind === 'plague'){ ctx.fillStyle = `rgba(155,216,74,${.45 + .2*Math.sin(T*20)})`; ell(-2, 0, 22, 9); ctx.fillStyle = 'rgba(216,240,122,.5)'; circ(6, 0, 6); }
    else if(p.kind !== 'arrow'){ ctx.fillStyle = 'rgba(155,216,74,.35)'; ell(0, 0, 14, 5); }
    ctx.strokeStyle = c; ctx.lineWidth = 2; line(-14, 0, 4, 0);
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(3, -3.5); ctx.lineTo(3, 3.5); ctx.fill();
    ctx.fillStyle = '#c94a3a'; ctx.fillRect(-15, -2.5, 4, 5);
    ctx.restore();
  }
  drawParts();
  for(const r of rings){ const k = r.t/r.life; atY(r.y); ctx.globalAlpha = 1 - k; ctx.strokeStyle = r.c; ctx.lineWidth = r.w; ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r*k + 4, (r.r*k + 4)*.75, 0, 0, TAU); ctx.stroke(); }
  ctx.globalAlpha = 1;
  drawBars(vis);
  ctx.textAlign = 'center';
  // números/textos: sombra escura deslocada (fillText) em vez de contorno (strokeText custa bem mais com dezenas de números na tela)
  let font = '';
  for(const t of texts){
    atY(t.y); ctx.globalAlpha = Math.min(1, (1 - t.t/.9)*1.6);
    const f = `800 ${t.size}px "Alegreya Sans", sans-serif`; if(f !== font){ ctx.font = f; font = f; }
    ctx.fillStyle = 'rgba(0,0,0,.8)'; ctx.fillText(t.s, t.x + 1.2, t.y + 1.4); ctx.fillText(t.s, t.x - .8, t.y + .6);
    ctx.fillStyle = t.c; ctx.fillText(t.s, t.x, t.y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  // vinheta
  const hell = scene === 'map' && mapDef.decor === 'hell', vk = cw + 'x' + ch + (hell ? 'h' : '');
  if(vigKey !== vk){ // o degradê só é refeito quando a tela muda de tamanho (ou entra/sai do Abismo)
    vigKey = vk; vigGrad = ctx.createRadialGradient(cw/2, ch/2, Math.min(cw, ch)*.28, cw/2, ch/2, Math.max(cw, ch)*.72);
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)'); vigGrad.addColorStop(1, hell ? 'rgba(40,6,0,.75)' : 'rgba(0,0,0,.7)');
  }
  ctx.fillStyle = vigGrad; ctx.fillRect(0, 0, cw, ch);
  drawJoy();
  if(mode === 'dead'){ ctx.fillStyle = `rgba(90,0,0,${Math.min(.45, deadT*.3)})`; ctx.fillRect(0, 0, cw, ch); }
  if(fade > 0){ ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, cw, ch); }
}

/* ---------- LOOP ---------- */
let last = performance.now(), uiT = 0, saveT = 0;
function tickTrans(dt){
  if(!trans) return;
  trans.t += dt; const t = trans.t;
  fade = t < .35 ? t/.35 : t < .45 ? 1 : Math.max(0, 1 - (t - .45)/.35);
  if(!trans.did && t >= .35){ trans.did = true; trans.fn(); }
  if(t >= .8){ trans = null; fade = 0; }
}
// Qualidade automática: médias do trabalho por quadro (simular + desenhar, em ms) e do intervalo real entre quadros (pega também
// o trabalho da placa de vídeo, que não aparece no tempo do JS). Pesado (trabalho > FRAME_HEAVY ou intervalo > FRAME_SLOW) por
// ~1,5 s baixa renderScale (03) em 0,1 até RS_MIN; leve por ~3 s sobe de volta. Assim o PC fraco segura 60 FPS e o forte fica nítido.
const FRAME_HEAVY = 11, FRAME_LIGHT = 5.5, FRAME_SLOW = 19.5, FRAME_OK = 17.5, RS_MIN = .7, RS_UP_WAIT = 8;
let frameCost = 0, frameGap = 16.7, heavyT = 0, lightT = 0;
function frame(now){
  const gap = now - last;
  let dt = Math.min(.05, gap/1000); last = now;
  // qualidade: muda ANTES de desenhar (resize apaga o canvas; mudar depois do render mostrava um quadro vazio = piscada).
  // Depois de baixar, só sobe de novo com RS_UP_WAIT s seguidos de folga (antes subia e descia sem parar e piscava a cada troca)
  const heavy = frameCost > FRAME_HEAVY || frameGap > FRAME_SLOW, light = frameCost < FRAME_LIGHT && frameGap < FRAME_OK;
  heavyT = heavy ? heavyT + dt : 0; lightT = light ? lightT + dt : 0;
  if(heavyT > 1.5 && renderScale > RS_MIN){ renderScale = Math.round((renderScale - .1)*10)/10; heavyT = 0; lightT = 0; resize(); }
  else if(lightT > RS_UP_WAIT && renderScale < 1){ renderScale = Math.round((renderScale + .1)*10)/10; lightT = 0; resize(); }
  const w0 = performance.now();
  if(S.speed !== 0) step(dt); // jogo sempre em 1x (S.speed = 0 só para pausar em testes)
  tickTrans(dt);
  render();
  frameCost += (performance.now() - w0 - frameCost)*.05;
  if(gap < 250) frameGap += (gap - frameGap)*.05; // ignora a volta de aba escondida
  uiT -= dt; if(uiT <= 0){ uiT = .1; updateHud(); }
  saveT -= dt; if(saveT <= 0){ saveT = 5; save(); }
  accountTick(dt);
  requestAnimationFrame(frame);
}
