// Terreno com gráficos 3D de verdade (WebGL, biblioteca Three.js): luz do sol, sombras, grama, água e animais esculpidos.
// Os corpos são montados com partes arredondadas a partir dos números de MODELOS (09-voxel.js) e viram malha por Surface Nets.
// Mesma simulação e câmera do 10-terreno3d.js. Sem WebGL ou sem a biblioteca, o terreno em voxels continua funcionando.
'use strict';

let R3 = null; // null = ainda não tentou; false = não dá; objeto = pronto
const geoCache = {};
const escalaAnimal = () => TERRENO[instAtual().tipo].esc;

function linearDe(hex){ return new THREE.Color(hex).convertSRGBToLinear(); }
function ruido(x, y){
  const i = Math.floor(x), j = Math.floor(y), f = x - i, g = y - j;
  const h = (a, b) => hashV(a, b, 9) / 15, u = f * f * (3 - 2 * f), v = g * g * (3 - 2 * g);
  return (h(i, j) * (1 - u) + h(i + 1, j) * u) * (1 - v) + (h(i, j + 1) * (1 - u) + h(i + 1, j + 1) * u) * v;
}
const fbm = (x, y) => ruido(x, y) * .55 + ruido(x * 2.3 + 7, y * 2.3 + 3) * .3 + ruido(x * 5.1 + 2, y * 5.1 + 9) * .15;

/* ---------- ESCULTURA DOS ANIMAIS ---------- */
// Cada parte é um cone arredondado de a até b (x = frente, y = altura, z = lado). e = achatamento [y, z]; k = quanto se funde;
// cor = função (x, y, z) → cor; g = grupo da perna; topo = pinta por cima das vizinhas (olhos, nariz).
function Escultor(){
  const partes = [];
  const add = (a, b, r1, r2, cor, o = {}) => { partes.push(Object.assign({a, b, r1, r2, cor, k: .55, g: 0, e: null, topo: false}, o)); };
  return {partes, add};
}
const fixa = hex => { const c = linearDe(hex); return () => c; };
function padrao(p){
  const c = linearDe(p.c), c3 = p.c3 ? linearDe(p.c3) : c, c2 = p.c2 ? linearDe(p.c2) : null, t = new THREE.Color();
  const bar = p.leg + (p.H || 2) * .34;
  return (x, y, z) => {
    let base = c;
    if(p.pat === 'listra'){ if(Math.sin(x * 1.55 + Math.sin(y * .8) * 1.1 + Math.abs(z) * .25) > .2) base = c3; }
    else if(p.pat === 'pinta'){ if(ruido(x * 1.5 + 3, y * 1.5 + Math.abs(z) * 1.1) > .64) base = c3; }
    else if(p.pat === 'mancha'){ if(fbm(x * .42 + 1, y * .42 + Math.abs(z) * .3 + 5) > .52) base = c3; }
    if(c2 && y < bar) return t.copy(base).lerp(c2, clamp((bar - y) / 1.2, 0, 1));
    return base;
  };
}
function orelhas(S, p, hx, hy, hw, hh, cor){
  const z = hw * .42, t = hy + hh * .42;
  for(const s of [-1, 1]){
    if(p.orelha === 'ponta') S.add([hx - .2, t, s * z], [hx - .35, t + 1.1, s * (z + .15)], .42, .1, cor, {k: .25, e: [1, .55]});
    if(p.orelha === 'redonda') S.add([hx - .2, t + .15, s * z], [hx - .25, t + .45, s * z], .5, .42, cor, {k: .2, e: [1, .55]});
    if(p.orelha === 'longa') S.add([hx - .2, t, s * z * .8], [hx - .75, t + 2.5, s * (z + .15)], .42, .24, cor, {k: .2, e: [1, .5]});
    if(p.orelha === 'caida') S.add([hx - .1, t, s * (z + .15)], [hx - .25, t - 1.25, s * (z + .4)], .42, .3, cor, {k: .2, e: [1, .45]});
    if(p.orelha === 'grande') S.add([hx - .9, hy + .3, s * (z + .7)], [hx - 1.5, hy - .4, s * (z + 2.5)], 1.7, 1.25, cor, {k: .3, e: [1, .28]});
  }
}
function esculpeQuad(S, p){
  const L = p.L, W = p.W, H = p.H, leg = p.leg, top = leg + H - 1, n = p.neck || 0, lw = p.lw || 1;
  const corpo = padrao(p), cy = leg + H / 2 - .1, raio = Math.min(H, W) / 2 + .2, ez = W > H ? W / H : 1;
  const trasX = raio * .7, freX = Math.max(trasX + .5, L - 1 - raio * .35);
  S.add([trasX, cy, 0], [freX, cy + .1, 0], raio * .93, raio, corpo, {e: [1, ez], k: .4});
  if(L > 7) S.add([(trasX + freX) / 2, cy, 0], [(trasX + freX) / 2 + .1, cy, 0], raio * 1.02, raio * 1.02, corpo, {e: [1, ez]});
  const pc = fixa(p.pata || p.c), pernaR = lw * .42 + .22;
  [[freX, 1], [trasX, 2]].forEach(([x, i], ii) => [-1, 1].forEach(s => {
    const zp = s * Math.max(.45, W / 2 - lw * .4), g = (ii + (s > 0 ? 1 : 0)) % 2 ? 2 : 1, corP = p.pat && !p.pata ? corpo : pc;
    S.add([x, cy - raio * .25, zp], [x + (ii ? -.15 : .1), leg * .45, zp], pernaR * 1.35, pernaR * .85, corP, {g, k: .55});
    S.add([x + (ii ? -.15 : .1), leg * .45, zp], [x + .05, .24, zp], pernaR * .85, pernaR * .62, corP, {g, k: .2});
    if(p.casco) S.add([x + .05, .24, zp], [x + .15, .08, zp], pernaR * .72, pernaR * .78, fixa(p.casco), {g, k: .08, topo: true});
  }));
  const hl = p.hl || 2, hw = p.hw || Math.min(W, 3), hh = p.hh || 2, hx = (n ? L - .4 : L + .1) + hl * .1;
  const hy = top + (p.hup == null ? 1 : p.hup) + n - hh * .35, ch = p.pat ? corpo : fixa(p.ch || p.c), hr = Math.max(hw, hh) * .46;
  const nw = p.nw || Math.min(W, 2);
  S.add([freX, cy + raio * .25, 0], [hx - .1, hy - hh * .1, 0], Math.max(nw * .62, raio * (n ? .55 : .8)), nw * .42 + hr * .25, corpo, {k: .7});
  S.add([hx, hy, 0], [hx + hl * .55, hy - hh * .1, 0], hr, hr * .78, ch, {e: [1, hw >= hh ? 1 : .85], k: .4});
  const fl = p.fl == null ? .5 : p.fl, frente = hx + hl * .55;
  const corF = fixa(p.fc || p.c2 || p.ch || p.c);
  let ponta = frente + hr * .55;
  if(fl){
    ponta = frente + hr * .3 + fl + .25;
    S.add([frente, hy - hh * .16, 0], [ponta, hy - hh * .24, 0], hr * .68, hr * .46, corF, {k: .3});
  }
  if(!p.tromba) S.add([ponta + hr * .28, hy - hh * .2, 0], [ponta + hr * .3, hy - hh * .2, 0], Math.max(.16, hr * .2), Math.max(.16, hr * .2), fixa(p.nariz || '#241915'), {k: .05, topo: true});
  for(const s of [-1, 1]) S.add([frente - hl * .08, hy + hh * .14, s * hw * .39], [frente - hl * .08, hy + hh * .14, s * hw * .41], .13 + hh * .045, .13 + hh * .045, fixa('#120d0a'), {k: .03, topo: true});
  orelhas(S, p, hx, hy, hw, hh, fixa(p.oc || p.ch || p.c));
  if(p.juba) S.add([hx - .6, hy - .15, 0], [hx - .9, hy - .4, 0], hr * 1.55, hr * 1.4, fixa(p.juba), {k: .35});
  if(p.crina) S.add([L - 3.5, top + .4, 0], [hx - .4, hy + hh * .35, 0], .28, .22, fixa(p.crina), {k: .15, e: [1.5, .45]});
  if(p.chifre) for(const s of [-1, 1]) S.add([hx - .2, hy + hh * .35, s * hw * .28], [hx - .7, hy + hh * .35 + 1.8, s * hw * .42], .26, .08, fixa(p.chifre), {k: .1});
  if(p.ossicone) for(const s of [-1, 1]) S.add([hx - .1, hy + hh * .35, s * hw * .22], [hx - .15, hy + hh * .35 + .8, s * hw * .26], .16, .19, fixa(p.ossicone), {k: .08});
  if(p.corno){ S.add([ponta - .5, hy, 0], [ponta + .6, hy + 2.2, 0], .62, .08, fixa(p.corno), {k: .15}); S.add([ponta - 1.8, hy + .7, 0], [ponta - 1.9, hy + 1.8, 0], .42, .08, fixa(p.corno), {k: .12}); }
  if(p.tromba){
    S.add([frente + .3, hy - .3, 0], [frente + 1.3, hy - 2.2, 0], hr * .42, hr * .32, ch, {k: .35});
    S.add([frente + 1.3, hy - 2.2, 0], [frente + 1.7, .8, 0], hr * .32, hr * .22, ch, {k: .2});
    S.add([frente + 1.7, .8, 0], [frente + 2.3, .45, 0], hr * .22, hr * .16, ch, {k: .15});
  }
  if(p.presa) for(const s of [-1, 1]) S.add([frente + .3, hy - hh * .4, s * hw * .28], [frente + 2.1, hy - hh * .85, s * hw * .36], .27, .08, fixa(p.presa), {k: .08, topo: true});
  if(p.corcova) S.add([(p.corcova[0] + p.corcova[1]) / 2 - .6, top + .7, 0], [(p.corcova[0] + p.corcova[1]) / 2 + .6, top + .7, 0], 1.55, 1.45, corpo, {k: .9});
  if(p.espinhos){
    const ce = linearDe(p.espinhos), cc = linearDe(p.c3 || p.c), ce2 = (x, y, z) => (hashV(Math.round(x * 3), Math.round(y * 3), Math.round(z * 3)) < 7 ? cc : ce);
    for(let i = 0; i < 46; i++){
      const a = i * 2.399, u = (i + .5) / 46, nx = -.1 + u * 1.2, ry = Math.sqrt(Math.max(0, 1 - (nx - .5) * (nx - .5) * 4)), sx = trasX - .4 + nx * (freX - trasX + .8);
      const py = Math.cos(a), pz = Math.sin(a) * ez;
      if(py < -.25) continue;
      S.add([sx, cy + py * raio * ry * .85, pz * raio * ry * .85], [sx - .35, cy + py * (raio * ry + .55), pz * (raio * ry + .55)], .17, .03, ce2, {k: .04, topo: true});
    }
  }
  if(p.escama) for(let x = 0; x < L; x += 1.4) S.add([x, top + .55, 0], [x + .2, top + .95, 0], .24, .06, fixa(p.escama), {k: .1});
  if(p.casco2) S.add([trasX, top + .55, 0], [freX, top + .55, 0], Math.max(W, L) * .36, Math.max(W, L) * .34, fixa(p.casco2), {e: [.55, 1], k: .25});
  const tl = p.caudaL || 0, tc = fixa(p.cauda || p.c), ty = cy + raio * .55;
  if(tl && p.caudaTipo === 'pend'){
    S.add([.1, ty, 0], [-.6, ty - tl * .55, 0], .3, .16, tc, {k: .25}); S.add([-.6, ty - tl * .55, 0], [-.65, ty - tl, 0], .16, .12, tc, {k: .1});
    if(p.tufo) S.add([-.65, ty - tl, 0], [-.65, ty - tl - .7, 0], .34, .1, fixa(p.tufo), {k: .12});
  } else if(tl && p.caudaTipo === 'sobe'){
    S.add([0, ty, 0], [-.8, ty + tl * .55, 0], .3, .18, tc, {k: .25}); S.add([-.8, ty + tl * .55, 0], [-.5, ty + tl, 0], .18, .1, tc, {k: .1});
  } else if(tl){
    const ybx = p.caudaBaixa ? leg + .2 : ty;
    S.add([0, ybx, 0], [-tl * .5, ybx - (p.caudaBaixa ? .1 : .5), 0], .45, .26, tc, {k: .35});
    S.add([-tl * .5, ybx - (p.caudaBaixa ? .1 : .5), 0], [-tl, ybx - (p.caudaBaixa ? .2 : .3), 0], .26, .08, tc, {k: .1});
    if(p.tufo) S.add([-tl, ty - .3, 0], [-tl - .5, ty - .2, 0], .3, .1, fixa(p.tufo), {k: .1});
  }
}
function esculpeAve(S, p){
  const L = p.L, W = p.W, H = p.H, leg = p.leg, top = leg + H - 1, n = p.neck || 0, corpo = padrao(p);
  const cy = leg + H / 2, r = Math.min(H, W) / 2 + .15, asa = fixa(p.asa || p.c), pc = fixa(p.pata || '#d8922b');
  S.add([.3, cy, 0], [L - 1, cy + .35, 0], r * .85, r * 1.05, corpo, {k: .4});
  for(const s of [-1, 1]){
    S.add([1.1, leg + .2, s * W * .22], [1.15, .4, s * W * .22], .2, .13, pc, {g: s > 0 ? 1 : 2, k: .15});
    S.add([1.15, .22, s * W * .22], [1.8, .1, s * W * .22], .17, .12, pc, {g: s > 0 ? 1 : 2, k: .08});
    S.add([L - 1.2, cy + .4, s * (r * .85)], [-.2, cy - .05, s * (r * .75)], r * .62, .15, asa, {k: .2, e: [1, .32]});
  }
  const hw = p.hw || Math.min(W, 2), hl = p.hl || 2, hx = L - .7 + hl * .2, hy = top + n + (p.hup == null ? 1 : p.hup) + .1, hr = Math.max(.5, hw * .55), ch = fixa(p.ch || p.c);
  S.add([L - 1, cy + .5, 0], [hx - .1, hy - .1, 0], Math.max(.32, r * (n ? .42 : .65)), hr * .62, fixa(p.cn || p.c), {k: .5});
  S.add([hx, hy, 0], [hx + hl * .3, hy, 0], hr, hr * .9, ch, {k: .3});
  const bl = p.bicoL || 1, fr = hx + hl * .3 + hr * .55, ba = (p.bicoA || 0) * .25;
  S.add([fr, hy - .02 + ba, 0], [fr + bl + .45, hy - .3 - ba * .3, 0], hr * .55 + ba, .08, fixa(p.bico || '#e39a24'), {k: .08, topo: true});
  for(const s of [-1, 1]) S.add([hx + hl * .25, hy + hr * .28, s * hr * .78], [hx + hl * .25, hy + hr * .28, s * hr * .8], .16, .16, fixa('#0f0b09'), {k: .02, topo: true});
  if(p.crista){ const N = p.cristaN || 2, A = p.cristaA || 1; for(let i = 0; i < N + 1; i++) S.add([hx + .3 - i * .45, hy + hr * .7, 0], [hx + .15 - i * .5, hy + hr * .75 + A * .75, 0], .24, .1, fixa(p.crista), {k: .1, e: [1, .5]}); }
  const tc = fixa(p.cauda || p.c);
  if(p.leque){
    const cf = linearDe(p.cauda), ol = linearDe(p.leqC), cor = (x, y, z) => (Math.sin(y * 1.7) + Math.sin(z * 1.7) > 1 ? ol : cf);
    for(let i = -5; i <= 5; i++){
      const a = i / 5 * 1.15, len = p.leque * 1.05;
      S.add([.3, cy + .1, 0], [-1.2, cy + Math.cos(a) * len, Math.sin(a) * len], .3, .55, cor, {k: .15, e: [1, 1]});
    }
  } else {
    const tl = p.caudaL || 1;
    S.add([.3, p.caudaBaixa ? leg + .4 : cy, 0], [-tl - .2, p.caudaBaixa ? leg + .2 : cy - tl * .3, 0], r * .55, .12, tc, {k: .2, e: [.45, 1]});
  }
}
function esculpeBipede(S, p){
  const W = p.W, D = p.D || 2, leg = p.leg, top = leg + p.H - 1, lw = p.lw || 1, c = fixa(p.c), r = W * .46 + .1, x = D / 2 - .2;
  S.add([x - .1, leg + r * .5, 0], [x + .1, top - r * .25, 0], r * 1.02, r * .86, c, {k: .4});
  if(p.c2) S.add([x + r * .55, leg + r * .45, 0], [x + r * .5, top - r * .55, 0], r * .62, r * .5, fixa(p.c2), {k: .25});
  for(const s of [-1, 1]){
    const g = s > 0 ? 2 : 1, z = s * (W / 2 - lw * .2 - .1), lr = lw * .45 + .15;
    S.add([x, leg + .3, z], [x + .05, .25, z], lr * 1.25, lr * .8, fixa(p.pata || p.c), {g, k: .4});
    S.add([x, .2, z], [x + (p.pe ? p.pe + .3 : .7), .14, z], lr * .72, lr * .58, fixa(p.pata || p.c), {g, k: .15});
    const al = p.bracoL || 2, ar = (p.braco || 1) * .36 + .12;
    S.add([x, top - .2, s * (r + ar * .3)], [x + .25, top - al - .2, s * (r + ar * .55)], ar * 1.2, ar * .8, c, {g: g === 1 ? 2 : 1, k: .3});
  }
  const hw = p.hw || W, hh = p.hh || 2, hl = p.hl || D, ch = fixa(p.ch || p.c), hx = (p.hxo || 0) + x, hy = top + hh * .55, hr = Math.max(hw, hh) * .46;
  S.add([hx, hy, 0], [hx + hl * .25, hy, 0], hr, hr * .9, ch, {k: .35});
  if(p.rosto) S.add([hx + hr * .55, hy - hr * .12, 0], [hx + hr * .7, hy - hr * .2, 0], hr * .62, hr * .55, fixa(p.rosto), {k: .15});
  if(p.fl) S.add([hx + hr * .6, hy - hr * .25, 0], [hx + hr + p.fl, hy - hr * .35, 0], hr * .45, hr * .3, fixa(p.fc || p.ch || p.c), {k: .2});
  for(const s of [-1, 1]) S.add([hx + hr * .78, hy + hr * .15, s * hr * .42], [hx + hr * .8, hy + hr * .15, s * hr * .42], .13 + hh * .04, .13 + hh * .04, fixa('#0f0b09'), {k: .02, topo: true});
  orelhas(S, p, hx, hy, hw, hh, ch);
  if(p.caudaL && p.caudaTipo === 'sobe'){
    const cc = linearDe(p.cauda || p.c), ca = p.caudaA ? linearDe(p.caudaA) : cc, cor = (cx, cy2) => (Math.sin(cy2 * 2.4) > 0 ? cc : ca);
    S.add([-r * .6, leg + .2, 0], [-1.6, leg + p.caudaL * .55, 0], .36, .3, cor, {k: .25});
    S.add([-1.6, leg + p.caudaL * .55, 0], [-1.2, leg + p.caudaL, 0], .3, .2, cor, {k: .12});
  } else if(p.caudaL){
    S.add([-r * .55, leg + .2, 0], [-p.caudaL * .55, .75, 0], .62, .36, fixa(p.cauda || p.c), {k: .35});
    S.add([-p.caudaL * .55, .75, 0], [-p.caudaL, .35, 0], .36, .12, fixa(p.cauda || p.c), {k: .1});
  }
}
function esculpeCobra(S, p){
  const c = linearDe(p.c), c3 = linearDe(p.c3), cor = (x, y, z) => (Math.sin(Math.atan2(z, x) * 7 + y * 2.3) > .35 ? c3 : c), voltas = 3.2, passos = 44;
  let ant = null;
  for(let i = 0; i <= passos; i++){
    const t = i / passos, a = t * voltas * 6.283, R = p.r + .4 - t * (p.r - .7), P = [Math.cos(a) * R, .42 + t * 1.5, Math.sin(a) * R];
    if(ant) S.add(ant, P, .52 - t * .08, .5 - t * .08, cor, {k: .12});
    ant = P;
  }
  const h = 3.4 + (p.alto || 1);
  S.add(ant, [.25, h, 0], .42, .32, cor, {k: .3});
  if(p.capuz) S.add([.2, h - 1.4, 0], [.25, h - .15, 0], 1.25, .9, fixa(p.capuz), {k: .25, e: [1, 1.05]});
  S.add([.25, h + .05, 0], [1.35, h + .1, 0], .42, .28, fixa(p.ch || p.c), {k: .2, e: [.75, 1]});
  for(const s of [-1, 1]) S.add([.8, h + .28, s * .26], [.82, h + .28, s * .26], .1, .1, fixa('#0d0907'), {k: .02, topo: true});
  S.add([1.5, h + .05, 0], [2.05, h, 0], .05, .03, fixa('#c9304a'), {k: .02, topo: true});
}
function esculpePeixe(S, p){
  const c = fixa(p.c), c3 = fixa(p.c3 || p.c);
  S.add([-.4, 1, 0], [1.5, 1, 0], .95, .7, c, {e: [1, .6], k: .3});
  S.add([-1.2, 1, 0], [-2.5, 1.7, 0], .35, .5, c3, {k: .15, e: [1, .2]});
  S.add([-1.2, 1, 0], [-2.5, .3, 0], .35, .5, c3, {k: .15, e: [1, .2]});
  S.add([.6, 1.6, 0], [-.2, 2.3, 0], .4, .14, c3, {k: .15, e: [1, .22]});
  for(const s of [-1, 1]) S.add([1.5, 1.2, s * .4], [1.52, 1.2, s * .4], .16, .16, fixa('#0d0907'), {k: .02, topo: true});
}
function esculpeCaracol(S, p){
  const corpo = fixa(p.c), casca = linearDe(p.c3), risca = linearDe(p.c), cor = (x, y, z) => (Math.sin(Math.atan2(y - 2.2, x + .4) * 5 + Math.hypot(x + .4, y - 2.2) * 4) > .25 ? risca : casca);
  S.add([-1.6, .42, 0], [2, .36, 0], .62, .4, corpo, {k: .3, e: [.7, 1.1]});
  S.add([2, .4, 0], [2.7, 1.25, 0], .4, .34, corpo, {k: .3});
  for(const s of [-1, 1]){
    S.add([2.7, 1.45, s * .17], [3.2, 2.35, s * .42], .1, .06, corpo, {k: .05});
    S.add([3.2, 2.42, s * .42], [3.22, 2.44, s * .42], .13, .13, fixa('#0f0b09'), {k: .02, topo: true});
  }
  let ant = null;
  for(let i = 0; i <= 26; i++){
    const t = i / 26, a = t * 9.5, R = 1.65 * (1 - t * .86), P = [-.4 + Math.cos(a) * R, 2.2 + Math.sin(a) * R, -.05 + t * .15];
    if(ant) S.add(ant, P, .78 - t * .55, .76 - t * .55, cor, {k: .1, e: [1, .9]});
    ant = P;
  }
}
const ESCULPE = {quad: esculpeQuad, ave: esculpeAve, bipede: esculpeBipede, cobra: esculpeCobra, peixe: esculpePeixe, caracol: esculpeCaracol};
function distParte(p, x, y, z){
  let dx = x - p.a[0], dy = y - p.a[1], dz = z - p.a[2], ex = p.b[0] - p.a[0], ey = p.b[1] - p.a[1], ez = p.b[2] - p.a[2];
  if(p.e){ dy /= p.e[0]; ey /= p.e[0]; dz /= p.e[1]; ez /= p.e[1]; }
  const l = ex * ex + ey * ey + ez * ez, t = l > 1e-6 ? clamp((dx * ex + dy * ey + dz * ez) / l, 0, 1) : 0;
  dx -= ex * t; dy -= ey * t; dz -= ez * t;
  const d = Math.sqrt(dx * dx + dy * dy + dz * dz) - (p.r1 + (p.r2 - p.r1) * t);
  return p.e ? d * Math.min(p.e[0], p.e[1], 1) : d;
}
function geometriaDe(id){
  if(geoCache[id]) return geoCache[id];
  const modelo = MODELOS[id](), S = Escultor();
  ESCULPE[modelo.tipo](S, modelo.p);
  const partes = S.partes;
  let x0 = 1e9, x1 = -1e9, y1 = 0, z1 = 0, topoPerna = 0;
  for(const p of partes){
    const r = Math.max(p.r1, p.r2) * (p.e ? Math.max(p.e[0], p.e[1], 1) : 1) + .6;
    for(const q of [p.a, p.b]){
      x0 = Math.min(x0, q[0] - r); x1 = Math.max(x1, q[0] + r);
      y1 = Math.max(y1, q[1] + r); z1 = Math.max(z1, Math.abs(q[2]) + r);
    }
    if(p.g) topoPerna = Math.max(topoPerna, Math.max(p.a[1], p.b[1]));
  }
  const y0 = -.3, maior = Math.max(x1 - x0, y1 - y0, z1 * 2), RES = Math.min(7, 58 / maior);
  const nx = Math.ceil((x1 - x0) * RES) + 2, ny = Math.ceil((y1 - y0) * RES) + 2, nz = Math.ceil(z1 * 2 * RES) + 2, n = nx * ny * nz;
  const I = (a, b, c) => a + b * nx + c * nx * ny, GX = a => x0 + a / RES, GY = b => y0 + b / RES, GZ = c => -z1 + c / RES;
  const d = new Float32Array(n);
  // campo de distância com as partes fundidas (o sinal fica positivo dentro, para o Surface Nets)
  for(let c = 0; c < nz; c++) for(let b = 0; b < ny; b++) for(let a = 0; a < nx; a++){
    const X = GX(a), Y = GY(b), Z = GZ(c);
    let m = 1e9;
    for(const p of partes){
      const q = distParte(p, X, Y, Z), h = clamp(.5 + .5 * (m - q) / p.k, 0, 1);
      m = m === 1e9 ? q : m * (1 - h) + q * h - p.k * h * (1 - h);
    }
    d[I(a, b, c)] = Y < 0 ? Math.min(-m, Y * 3) : -m;
  }
  const idx = new Int32Array(n).fill(-1), pos = [], cor = [], mor = [], ISO = 0;
  const CANTOS = [[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]];
  const ARESTAS = [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
  const v = new Float32Array(8), T = new THREE.Color();
  for(let c = 0; c < nz - 1; c++) for(let b = 0; b < ny - 1; b++) for(let a = 0; a < nx - 1; a++){
    let tem = 0;
    for(let q = 0; q < 8; q++){ v[q] = d[I(a + CANTOS[q][0], b + CANTOS[q][1], c + CANTOS[q][2])]; if(v[q] > ISO) tem |= 1 << q; }
    if(tem === 0 || tem === 255) continue;
    let sx = 0, sy = 0, sz = 0, m = 0;
    for(const [p, q] of ARESTAS){
      if((v[p] > ISO) === (v[q] > ISO)) continue;
      const t = (ISO - v[p]) / (v[q] - v[p]), A = CANTOS[p], B = CANTOS[q];
      sx += A[0] + (B[0] - A[0]) * t; sy += A[1] + (B[1] - A[1]) * t; sz += A[2] + (B[2] - A[2]) * t; m++;
    }
    const X = GX(a + sx / m), Y = GY(b + sy / m), Z = GZ(c + sz / m);
    idx[I(a, b, c)] = pos.length / 3;
    pos.push(X, Y, Z);
    // cor: mistura as partes mais próximas para a transição parecer natural
    let tr = 0, tg = 0, tb = 0, tp = 0, gp = 0, gd = 1e9, topo = null;
    for(const p of partes){
      const q = Math.max(0, distParte(p, X, Y, Z));
      if(p.topo && q < .06) topo = p;
      if(q < gd){ gd = q; gp = p.g; }
      const w = Math.exp(-q * 7);
      if(w < .004) continue;
      const k = p.cor(X, Y, Z);
      tr += k.r * w; tg += k.g * w; tb += k.b * w; tp += w;
    }
    if(topo){ const k = topo.cor(X, Y, Z); tr = k.r; tg = k.g; tb = k.b; tp = 1; }
    tp = Math.max(tp, 1e-4);
    const pelo = topo ? 1 : .88 + (ruido(X * 5 + Z * 3, Y * 5) * .6 + hashV(a, b, c) / 15 * .4) * .26;
    T.setRGB(tr / tp * pelo, tg / tp * pelo, tb / tp * pelo);
    cor.push(T.r, T.g, T.b);
    // morph: a perna balança para a frente e para trás (grupo 1 e 2 em oposição)
    const f = gp && topoPerna ? clamp(1 - Y / topoPerna, 0, 1) : 0, am = Math.min(1.1, topoPerna * .34) * f * (gp === 1 ? 1 : -1);
    mor.push(am, f * .14, 0);
  }
  const tri = [];
  const quad = (a, b, c, e, para) => {
    if(a < 0 || b < 0 || c < 0 || e < 0) return;
    const pa = a * 3, pb = b * 3, pc = c * 3;
    const ux = pos[pb] - pos[pa], uy = pos[pb + 1] - pos[pa + 1], uz = pos[pb + 2] - pos[pa + 2];
    const wx = pos[pc] - pos[pa], wy = pos[pc + 1] - pos[pa + 1], wz = pos[pc + 2] - pos[pa + 2];
    const nX = uy * wz - uz * wy, nY = uz * wx - ux * wz, nZ = ux * wy - uy * wx;
    if(nX * para[0] + nY * para[1] + nZ * para[2] > 0) tri.push(a, b, c, a, c, e);
    else tri.push(a, c, b, a, e, c);
  };
  for(let c = 1; c < nz - 1; c++) for(let b = 1; b < ny - 1; b++) for(let a = 1; a < nx - 1; a++){
    const k = I(a, b, c), den = d[k] > ISO;
    if(den !== (d[k + 1] > ISO)) quad(idx[I(a, b - 1, c - 1)], idx[I(a, b, c - 1)], idx[k], idx[I(a, b - 1, c)], [den ? 1 : -1, 0, 0]);
    if(den !== (d[k + nx] > ISO)) quad(idx[I(a - 1, b, c - 1)], idx[I(a, b, c - 1)], idx[k], idx[I(a - 1, b, c)], [0, den ? 1 : -1, 0]);
    if(den !== (d[k + nx * ny] > ISO)) quad(idx[I(a - 1, b - 1, c)], idx[I(a, b - 1, c)], idx[k], idx[I(a - 1, b, c)], [0, 0, den ? 1 : -1]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(cor, 3));
  g.setIndex(tri);
  g.computeVertexNormals();
  // centraliza no meio do corpo, para o animal girar em torno de si; raio = até onde qualquer parte alcança, em qualquer direção
  g.computeBoundingBox();
  g.translate(-(g.boundingBox.min.x + g.boundingBox.max.x) / 2, 0, 0);
  const pf = g.attributes.position;
  let raio = 0;
  for(let i = 0; i < pf.count; i++) raio = Math.max(raio, Math.hypot(pf.getX(i), pf.getZ(i)));
  g.userData.raio = raio;
  if(topoPerna){ g.morphAttributes.position = [new THREE.Float32BufferAttribute(mor, 3)]; g.morphTargetsRelative = true; }
  g.userData.altura = y1 - .6;
  return geoCache[id] = g;
}

/* ---------- CENÁRIOS ---------- */
function alturaChao(x, y){
  const T = terrenoT, base = (fbm(x * .09, y * .09) - .5) * (T.relevo || 0);
  if(!noLago(x, y, 1.3)) return base;
  const a = (x - terrenoN * .76) / (terrenoN * .17), b = (y - terrenoN * .24) / (terrenoN * .15), r = Math.sqrt(a * a + b * b);
  return base * clamp(r - 1, 0, 1) - clamp(1.3 - r, 0, 1) * 2.2;
}
function texturaChao(T, n){
  const S2 = 768, cv = document.createElement('canvas'); cv.width = cv.height = S2;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(S2, S2), D = img.data, [b0, v0, p0] = T.solo;
  for(let py = 0; py < S2; py++) for(let px = 0; px < S2; px++){
    const x = px / S2 * n, y = py / S2 * n, k = (px + py * S2) * 4;
    const t = fbm(x * .2 * 56 / n, y * .2 * 56 / n), m = fbm(x * .55 * 56 / n + 40, y * .55 * 56 / n), f = ruido(x * T.grao, y * T.grao * .7);
    let r = b0[0] + t * v0[0] + f * v0[0] * .55, g = b0[1] + t * v0[1] + f * v0[1] * .55, bl = b0[2] + t * v0[2] + f * v0[2] * .55;
    if(m > .6){ const u = clamp((m - .6) * 4, 0, 1); r += (p0[0] - r) * u; g += (p0[1] - g) * u; bl += (p0[2] - bl) * u; }
    const h = alturaChao(x, y);
    if(h < -.05){ const u = clamp(-h / .5, 0, 1); r += (176 - r) * u; g += (154 - g) * u; bl += (106 - bl) * u; }
    if(h < -.7){ const u = clamp((-h - .7) / .8, 0, 1); r *= 1 - u * .55; g *= 1 - u * .4; bl *= 1 - u * .3; }
    D[k] = r; D[k + 1] = g; D[k + 2] = bl; D[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  return t;
}
function texturaOndas(){
  const S2 = 128, cv = document.createElement('canvas'); cv.width = cv.height = S2;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(S2, S2), D = img.data;
  const h = (x, y) => Math.sin(x / S2 * 6.283 * 3 + 2 * Math.sin(y / S2 * 6.283)) + Math.sin(y / S2 * 6.283 * 4 + 1.5 * Math.sin(x / S2 * 6.283 * 2)) * .7 + Math.sin((x + y) / S2 * 6.283 * 7) * .3;
  for(let y = 0; y < S2; y++) for(let x = 0; x < S2; x++){
    const k = (x + y * S2) * 4, nx = h(x + 1, y) - h(x - 1, y), ny = h(x, y + 1) - h(x, y - 1);
    D[k] = 128 + nx * 90; D[k + 1] = 128 + ny * 90; D[k + 2] = 255; D[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function ceuEnv(renderer){
  const cena = new THREE.Scene(), g = new THREE.SphereGeometry(50, 24, 12), p = g.attributes.position, cor = new Float32Array(p.count * 3);
  const alto = linearDe('#6fb2ea'), hor = linearDe('#f3eadb'), chao = linearDe('#6d7a4f'), c = new THREE.Color();
  for(let i = 0; i < p.count; i++){
    const y = p.getY(i) / 50;
    if(y > 0) c.copy(hor).lerp(alto, Math.pow(y, .6)); else c.copy(hor).lerp(chao, Math.min(1, -y * 3));
    cor.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(cor, 3));
  cena.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({vertexColors: true, side: THREE.BackSide})));
  const pm = new THREE.PMREMGenerator(renderer), env = pm.fromScene(cena, .02).texture;
  pm.dispose();
  return env;
}
function bolhaIrregular(raio, semente, cor){
  const g = new THREE.SphereGeometry(raio, 20, 14), p = g.attributes.position, c = new Float32Array(p.count * 3), base = linearDe(cor), t = new THREE.Color();
  for(let i = 0; i < p.count; i++){
    const e = 1 / raio, x = p.getX(i) * e, y = p.getY(i) * e, z = p.getZ(i) * e, f = 1 + (fbm(x * 1.6 + semente, y * 1.6 + z * 1.1) - .5) * .55;
    p.setXYZ(i, p.getX(i) * f, p.getY(i) * f, p.getZ(i) * f);
    t.copy(base).multiplyScalar(.55 + fbm(x * 3 + z * 2, y * 3 + semente) * .9);
    c.set([t.r, t.g, t.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  g.computeVertexNormals();
  return g;
}
// Peças de cenário. Cada função recebe a posição já no sistema do terreno (x, y de 0 até o lado).
function pecas(G, n){
  const mat = (cor, o = {}) => new THREE.MeshStandardMaterial(Object.assign({color: linearDe(cor), roughness: .85, envMapIntensity: .5}, o));
  const folha = new THREE.MeshStandardMaterial({vertexColors: true, roughness: .92, envMapIntensity: .5});
  const X = x => x - n / 2, Z = y => y - n / 2;
  const add = (geo, m, x, y, z, o = {}) => {
    const k = new THREE.Mesh(geo, m);
    k.position.set(X(x), z, Z(y)); k.castShadow = o.sombra !== false; k.receiveShadow = true;
    if(o.ry) k.rotation.y = o.ry;
    if(o.rx) k.rotation.x = o.rx;
    if(o.rz) k.rotation.z = o.rz;
    if(o.esc) k.scale.set(...o.esc);
    G.add(k);
    return k;
  };
  const caixa = (x, y, z, w, h, d, m, o) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z + h / 2, o);
  const cil = (x, y, z, r1, r2, h, m, o) => add(new THREE.CylinderGeometry(r1, r2, h, 14), m, x, y, z + h / 2, o);
  const casinha = (x, y, w, d, h, parede, telhado, ry = 0) => {
    const p = mat(parede), t = mat(telhado), base = alturaChao(x, y);
    caixa(x, y, base, w, h, d, p, {ry});
    const teto = add(new THREE.CylinderGeometry(.01, Math.hypot(w, d) / 2 * 1.12, h * .6, 4), t, x, y, base + h + h * .3, {ry: ry + Math.PI / 4});
    const c = Math.cos(ry), s = Math.sin(ry), fx = x + c * (w / 2 + .03), fy = y - s * (w / 2 + .03);
    caixa(fx, fy, base, .1, h * .62, d * .34, mat('#2a2018'), {ry, sombra: false});
    return teto;
  };
  const pedra = (x, y, r, sem) => add(bolhaIrregular(r, sem, '#85877f'), folha, x, y, alturaChao(x, y) + r * .25, {esc: [1.2, .65, 1]});
  const arbusto = (x, y, r, sem, cor = '#3f6f2a') => add(bolhaIrregular(r, sem, cor), folha, x, y, alturaChao(x, y) + r * .6);
  const arvore = (x, y, h, cor, sem) => {
    const base = alturaChao(x, y);
    cil(x, y, base, .3, .55, h, mat('#4c3522'));
    [[0, h + 1, 0, 2.5], [1.5, h, .4, 1.8], [-1.3, h + .2, -.7, 1.9], [.2, h + 2.4, -.3, 1.7], [-.4, h - .3, 1.4, 1.7], [.9, h + 1.3, -1.2, 1.5]].forEach(([a, b, c, r], i) => add(bolhaIrregular(r, sem + i * 3, cor), folha, x + a, y + c, base + b));
  };
  const acacia = (x, y, h, sem) => {
    const base = alturaChao(x, y);
    cil(x, y, base, .28, .5, h, mat('#54402a'));
    add(new THREE.CylinderGeometry(.12, .24, 2.6, 6), mat('#54402a'), x + .8, y, base + h + .6, {rz: -.7});
    add(new THREE.CylinderGeometry(.12, .24, 2.6, 6), mat('#54402a'), x - .8, y + .2, base + h + .6, {rz: .7});
    [[0, 0, 4.4], [2.2, .6, 2.6], [-2.2, -.4, 2.8]].forEach(([a, c, r], i) => add(bolhaIrregular(r, sem + i, '#6e7d2e'), folha, x + a, y + c, base + h + 1.6, {esc: [1, .3, 1]}));
  };
  const cerca = (cor, alt, passo, ripas, raio = .15) => {
    const m = mat(cor), g = new THREE.CylinderGeometry(raio * .9, raio, alt, 8); g.translate(0, alt / 2, 0);
    const lado = n - 1, cada = Math.floor(lado / passo) + 1, im = new THREE.InstancedMesh(g, m, cada * 4), M = new THREE.Object3D();
    let i = 0;
    const poe = (x, y) => { M.position.set(X(x), alturaChao(x, y), Z(y)); M.updateMatrix(); im.setMatrixAt(i++, M.matrix); };
    for(let q = 0; q < cada; q++){ const t = .5 + q * passo; poe(t, .5); poe(t, n - .5); poe(.5, t); poe(n - .5, t); }
    im.castShadow = true; G.add(im);
    [[n / 2, .5, n - 1, .08], [n / 2, n - .5, n - 1, .08], [.5, n / 2, .08, n - 1], [n - .5, n / 2, .08, n - 1]].forEach(([x, y, w, d]) => {
      for(const h of ripas) caixa(x, y, h * alt, w, .1, d, m);
    });
  };
  // grade de arame: varetas nas 4 paredes e no teto
  const grade = (alt, passo, cor) => {
    const m = mat(cor, {metalness: .7, roughness: .35}), r = .07, g = new THREE.CylinderGeometry(r, r, 1, 6);
    const lista = [];
    const barra = (x1, y1, z1, x2, y2, z2) => lista.push([x1, y1, z1, x2, y2, z2]);
    for(let t = .4; t <= n - .4; t += passo){
      barra(t, .4, 0, t, .4, alt); barra(t, n - .4, 0, t, n - .4, alt); barra(.4, t, 0, .4, t, alt); barra(n - .4, t, 0, n - .4, t, alt);
      barra(t, .4, alt, t, n - .4, alt);
    }
    for(let z = 1.5; z <= alt; z += 3){ barra(.4, .4, z, n - .4, .4, z); barra(.4, n - .4, z, n - .4, n - .4, z); barra(.4, .4, z, .4, n - .4, z); barra(n - .4, .4, z, n - .4, n - .4, z); }
    const im = new THREE.InstancedMesh(g, m, lista.length), M = new THREE.Object3D(), A = new THREE.Vector3(), B = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    lista.forEach(([x1, y1, z1, x2, y2, z2], i) => {
      A.set(X(x1), z1, Z(y1)); B.set(X(x2), z2, Z(y2));
      M.position.copy(A).add(B).multiplyScalar(.5);
      M.quaternion.setFromUnitVectors(up, B.clone().sub(A).normalize());
      M.scale.set(1, A.distanceTo(B), 1); M.updateMatrix(); im.setMatrixAt(i, M.matrix);
    });
    im.castShadow = true; G.add(im);
  };
  return {mat, add, caixa, cil, casinha, pedra, arbusto, arvore, acacia, cerca, grade, folha, X, Z};
}
const CENARIOS = {
  gaiola(P, n, T){
    const [a, b, c] = T.obst;
    const plast = P.mat('#3d6fa8', {roughness: .35, envMapIntensity: .8});
    [[n / 2, 0, n + .8, .4], [n / 2, n, n + .8, .4], [0, n / 2, .4, n + .8], [n, n / 2, .4, n + .8]].forEach(([x, y, w, d]) => P.caixa(x, y, -.4, w, 1.7, d, plast));
    P.grade(n * .58, 1.1, '#c8ccd0');
    // roda de exercício
    const ax = a[0] * n, ay = a[1] * n, r = 2.6, roda = P.mat('#d9534f', {roughness: .4});
    P.add(new THREE.TorusGeometry(r, .18, 10, 30), roda, ax, ay, r + .55, {ry: Math.PI / 4});
    P.add(new THREE.CylinderGeometry(r * .96, r * .96, 1.4, 30, 1, true), P.mat('#e87a72', {roughness: .5, side: THREE.DoubleSide}), ax, ay, r + .55, {ry: Math.PI / 4, rx: Math.PI / 2});
    P.cil(ax - .9, ay + .9, 0, .13, .18, r + .6, P.mat('#b8bcc0', {metalness: .6, roughness: .4}));
    // casinha de plástico
    const hx = b[0] * n, hy = b[1] * n;
    P.caixa(hx, hy, 0, 5, 2.4, 4.2, P.mat('#f0a53a', {roughness: .4}));
    P.add(new THREE.SphereGeometry(3, 18, 10, 0, 6.283, 0, 1.57), P.mat('#d9534f', {roughness: .4}), hx, hy, 2.4, {esc: [.95, .5, .8]});
    P.caixa(hx + 2.53, hy + .1, 0, .08, 1.6, 1.9, P.mat('#2a2018'), {sombra: false});
    // comedouro e bebedouro
    P.cil(c[0] * n, c[1] * n, 0, 1.3, 1, .7, P.mat('#7a4fa8', {roughness: .35}));
    P.add(new THREE.SphereGeometry(.95, 14, 8), P.mat('#b98a4a'), c[0] * n, c[1] * n, .55, {esc: [1, .3, 1]});
    P.cil(n - 1.2, n * .5, 3, .55, .55, 3.4, P.mat('#7fc0e8', {transparent: true, opacity: .6, roughness: .1}));
    P.cil(n - 1.2, n * .5, 2, .12, .12, 1, P.mat('#c8ccd0', {metalness: .7}));
  },
  galinheiro(P, n, T){
    const [a, b, c] = T.obst;
    P.grade(n * .42, 1.5, '#9aa0a0');
    P.cerca('#7a5531', n * .42, 7, []);
    P.casinha(a[0] * n, a[1] * n, 8, 7, 5, '#a8623a', '#5d3a24');
    P.add(new THREE.BoxGeometry(5, .15, 1.2), P.mat('#8a6239'), a[0] * n + 5.6, a[1] * n + .4, .95, {rz: -.38, ry: 0});
    // poleiro
    const px = n * .68, py = n * .55, m = P.mat('#7a5531');
    P.cil(px - 3, py, 0, .17, .2, 3, m); P.cil(px + 3, py, 0, .17, .2, 3, m);
    P.add(new THREE.CylinderGeometry(.14, .14, 6.6, 8), m, px, py, 3, {rz: Math.PI / 2});
    // ninho com ovos
    const nx = b[0] * n, ny = b[1] * n;
    P.add(new THREE.TorusGeometry(1.6, .65, 8, 18), P.mat('#c9ab62', {roughness: 1}), nx, ny, .5, {rx: Math.PI / 2});
    [[-.4, 0], [.45, .3], [.1, -.5]].forEach(([u, w]) => P.add(new THREE.SphereGeometry(.42, 12, 10), P.mat('#f2e6d0', {roughness: .5}), nx + u, ny + w, .55, {esc: [1, 1.25, 1]}));
    // comedouro
    P.caixa(c[0] * n, c[1] * n, 0, 4, .7, 1.5, P.mat('#6d6f70', {metalness: .5, roughness: .5}));
    P.caixa(c[0] * n, c[1] * n, .68, 3.6, .1, 1.1, P.mat('#c7a24d'), {sombra: false});
  },
  coelheira(P, n, T){
    const [a, b] = T.obst;
    P.cerca('#efe9dc', 2.2, 2.2, [.35, .85]);
    P.casinha(a[0] * n, a[1] * n, 6.5, 5.5, 3.6, '#c9975a', '#7a4f2c');
    P.add(new THREE.CylinderGeometry(1.5, 1.5, 3.4, 16, 1, true), P.mat('#6d4a2e', {side: THREE.DoubleSide}), n * .72, n * .3, 1.4, {rz: Math.PI / 2, ry: .6});
    P.cil(b[0] * n, b[1] * n, 0, 1.5, 1.2, .7, P.mat('#b8bcc0', {metalness: .5, roughness: .4}));
    for(const [u, w] of [[-.5, .1], [.3, .5], [.5, -.4]]) P.add(new THREE.ConeGeometry(.2, 1.4, 8), P.mat('#e8842a'), b[0] * n + u, b[1] * n + w, 1.05, {rz: Math.PI / 2.2, ry: u * 3});
    P.arbusto(n * .24, n * .8, 1.8, 3); P.arbusto(n * .82, n * .22, 1.5, 7);
    P.caixa(n * .55, n * .76, 0, 3, 1.3, 2, P.mat('#d3b45e', {roughness: 1}));
  },
  aquario(P, n, T){
    const [a, b, c] = T.obst, alt = n * .55, preto = P.mat('#1b1d1f', {roughness: .4});
    const vidro = new THREE.MeshStandardMaterial({color: linearDe('#d9eef0'), roughness: .04, metalness: .05, transparent: true, opacity: .16, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide});
    [[n / 2, 0, n, .12], [n / 2, n, n, .12], [0, n / 2, .12, n], [n, n / 2, .12, n]].forEach(([x, y, w, d]) => P.caixa(x, y, 0, w, alt, d, vidro, {sombra: false}));
    [[n / 2, 0, n + .5, .5], [n / 2, n, n + .5, .5], [0, n / 2, .5, n + .5], [n, n / 2, .5, n + .5]].forEach(([x, y, w, d]) => {
      P.caixa(x, y, -.2, w, .9, d, preto); P.caixa(x, y, alt - .3, w, .5, d, preto);
    });
    for(const [x, y] of [[0, 0], [n, 0], [0, n], [n, n]]) P.caixa(x, y, 0, .5, alt, .5, preto);
    P.pedra(a[0] * n, a[1] * n, 3.3, 4); P.pedra(a[0] * n + 2.6, a[1] * n + 1.8, 1.7, 9); P.pedra(n * .5, n * .86, 1.5, 12);
    P.add(new THREE.CylinderGeometry(.5, .75, 10, 10), P.mat('#5a4029', {roughness: 1}), b[0] * n, b[1] * n, 1.5, {rz: Math.PI / 2.3, ry: .8});
    P.cil(c[0] * n, c[1] * n, 0, 2, 1.7, .55, P.mat('#70757a', {roughness: .5}));
    P.add(new THREE.CircleGeometry(1.75, 24), P.mat('#4e9cc8', {roughness: .1, metalness: .3}), c[0] * n, c[1] * n, .56, {rx: -Math.PI / 2, sombra: false});
    P.arbusto(n * .86, n * .55, 1.6, 2, '#5f7f34');
    P.cil(n * .12, n * .82, 0, .35, .5, 2.8, P.mat('#4d7a35'));
    P.cil(n * .12 + .8, n * .82, .9, .24, .3, 1.5, P.mat('#4d7a35'));
  },
  quintal(P, n, T){
    const [a, b, c] = T.obst;
    P.cerca('#f2eee4', 2.6, 1.6, [.3, .8], .14);
    P.casinha(a[0] * n, a[1] * n, 6.5, 6, 4.4, '#b9733f', '#a33a2e');
    P.add(new THREE.SphereGeometry(.85, 18, 14), P.mat('#d9483f', {roughness: .35}), n * .55, n * .42, .85);
    P.cil(b[0] * n, b[1] * n, 0, 1.5, 1.2, .7, P.mat('#3d6fa8', {roughness: .4}));
    P.arvore(c[0] * n, c[1] * n, 4.5, '#3f6f2a', 11);
    P.arbusto(n * .86, n * .78, 2.2, 3); P.arbusto(n * .6, n * .88, 1.8, 6, '#4f7f35'); P.arbusto(n * .1, n * .5, 1.7, 8);
  },
  fazenda(P, n, T){
    const [a, b, c] = T.obst;
    P.cerca('#7a5531', 2, 5, [.45, .85]);
    P.casinha(a[0] * n, a[1] * n, 14, 11, 8, '#9a3a2c', '#4a4a4c');
    const feno = P.mat('#d3b45e', {roughness: 1});
    for(const [x, y] of [[b[0] * n, b[1] * n], [c[0] * n, c[1] * n], [c[0] * n + 3.5, c[1] * n + .8]]) P.add(new THREE.CylinderGeometry(1.5, 1.5, 2.6, 16), feno, x, y, alturaChao(x, y) + 1.5, {rz: Math.PI / 2});
    P.arvore(n * .9, n * .55, 6, '#3f6f2a', 13); P.arvore(n * .55, n * .08, 5.5, '#2d5f2e', 16); P.arvore(n * .07, n * .45, 6, '#3f6f2a', 19);
    P.pedra(n * .62, n * .9, 1.6, 22);
  },
  mata(P, n){
    P.cerca('#5a4029', 1.8, 6, [.5]);
    const r = rng(n * 53);
    for(let i = 0; i < 26; i++){
      const borda = i < 16, t = r() * n, lado = i % 4;
      let x = borda ? (lado === 0 ? 3 + r() * 5 : lado === 1 ? n - 3 - r() * 5 : t) : 8 + r() * (n - 16);
      let y = borda ? (lado === 2 ? 3 + r() * 5 : lado === 3 ? n - 3 - r() * 5 : t) : 8 + r() * (n - 16);
      x = clamp(x, 3, n - 3); y = clamp(y, 3, n - 3);
      if(noLago(x, y, 1.5)) continue;
      P.arvore(x, y, 6 + r() * 4, r() < .5 ? '#2d5f2e' : '#235024', 30 + i);
    }
    for(let i = 0; i < 9; i++){ const x = 5 + r() * (n - 10), y = 5 + r() * (n - 10); if(!noLago(x, y, 1.4)) P.arbusto(x, y, 1.2 + r(), 60 + i, '#35662c'); }
    P.pedra(n * .4, n * .3, 2, 5); P.pedra(n * .6, n * .7, 1.6, 8);
  },
  savana(P, n){
    P.cerca('#6e5233', 2, 7, [.5, .85]);
    const r = rng(n * 71);
    for(let i = 0; i < 8; i++){
      const x = 8 + r() * (n - 16), y = 8 + r() * (n - 16);
      if(!noLago(x, y, 1.6)) P.acacia(x, y, 5 + r() * 2.5, 80 + i);
    }
    for(let i = 0; i < 6; i++){ const x = 5 + r() * (n - 10), y = 5 + r() * (n - 10); if(!noLago(x, y, 1.4)) P.pedra(x, y, 1.1 + r() * 1.5, 40 + i); }
    P.add(new THREE.ConeGeometry(1.7, 5, 10), P.mat('#a5794a', {roughness: 1}), n * .2, n * .72, alturaChao(n * .2, n * .72) + 2.4);
    for(let i = 0; i < 7; i++){ const x = 5 + r() * (n - 10), y = 5 + r() * (n - 10); if(!noLago(x, y, 1.4)) P.arbusto(x, y, .9 + r() * .7, 50 + i, '#7d7f35'); }
  },
};
function montaCenario(){
  const r3 = R3, n = terrenoN, T = terrenoT;
  if(r3.cenario){
    r3.scene.remove(r3.cenario);
    r3.cenario.traverse(o => { if(o.geometry) o.geometry.dispose(); if(o.material){ if(o.material.map) o.material.map.dispose(); o.material.dispose(); } });
  }
  const G = new THREE.Group(); r3.cenario = G; r3.scene.add(G); r3.cenarioId = T.id;
  // chão
  const pl = new THREE.PlaneGeometry(n, n, 96, 96); pl.rotateX(-Math.PI / 2);
  const pp = pl.attributes.position;
  for(let i = 0; i < pp.count; i++) pp.setY(i, alturaChao(pp.getX(i) + n / 2, pp.getZ(i) + n / 2));
  pl.computeVertexNormals();
  const chao = new THREE.Mesh(pl, new THREE.MeshStandardMaterial({map: texturaChao(T, n), roughness: .95, envMapIntensity: .55}));
  chao.receiveShadow = true; G.add(chao);
  const terra = new THREE.MeshStandardMaterial({color: linearDe('#5d4029'), roughness: 1, envMapIntensity: .4});
  [[0, -n / 2, n, .6], [0, n / 2, n, .6], [-n / 2, 0, .6, n], [n / 2, 0, .6, n]].forEach(([x, z, w, d]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, 4, d), terra);
    b.position.set(x, -2.05, z); G.add(b);
  });
  // água
  if(T.lago){
    r3.ondas = r3.ondas || texturaOndas();
    r3.ondas.repeat.set(3, 3);
    const agua = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshStandardMaterial({
      color: linearDe('#1f6a97'), roughness: .1, metalness: .3, normalMap: r3.ondas, normalScale: new THREE.Vector2(.3, .3), transparent: true, opacity: .86,
    }));
    agua.rotation.x = -Math.PI / 2; agua.scale.set(n * .17 * 1.04, n * .15 * 1.04, 1);
    agua.position.set(n * .76 - n / 2, -.22, n * .24 - n / 2); G.add(agua);
  }
  // grama
  if(T.grama){
    const [dens, alt] = T.grama, lam = new THREE.PlaneGeometry(.2, alt, 1, 2); lam.translate(0, alt / 2, 0);
    const lp = lam.attributes.position;
    for(let i = 0; i < lp.count; i++){ const y = lp.getY(i) / alt; lp.setX(i, lp.getX(i) * (1 - y * .85)); lp.setZ(i, y * y * alt * .28); }
    const nrm = lam.attributes.normal; for(let i = 0; i < nrm.count; i++) nrm.setXYZ(i, 0, 1, 0);
    const qt = Math.floor(n * n * dens * (r3.fraco ? .5 : 1));
    const grama = new THREE.InstancedMesh(lam, new THREE.MeshStandardMaterial({side: THREE.DoubleSide, roughness: 1, envMapIntensity: .35}), qt);
    const M = new THREE.Object3D(), C = new THREE.Color(), rn = rng(n * 131);
    const verdes = (T.id === 'savana' ? ['#b09a4f', '#9f8a42', '#c2a95c', '#8f8a42', '#a89048'] : T.id === 'mata' ? ['#2f5a24', '#3a6a2a', '#285020', '#47722e', '#35602a'] : ['#4a7a2a', '#567f2e', '#3f6c28', '#6a8c38', '#7a8f3f']).map(linearDe);
    let u = 0;
    for(let i = 0; i < qt * 2 && u < qt; i++){
      const x = rn() * (n - 1) + .5, y = rn() * (n - 1) + .5;
      if(noLago(x, y, 1.25) || fbm(x * .55 * 56 / n + 40, y * .55 * 56 / n) > .66) continue;
      const e = .7 + rn() * .8;
      M.position.set(x - n / 2, alturaChao(x, y) - .02, y - n / 2); M.rotation.set(0, rn() * 6.28, 0); M.scale.set(e, e, e); M.updateMatrix();
      grama.setMatrixAt(u, M.matrix);
      C.copy(verdes[Math.floor(rn() * verdes.length)]).multiplyScalar(.85 + rn() * .3);
      grama.setColorAt(u, C);
      u++;
    }
    grama.count = u; grama.receiveShadow = true; G.add(grama);
  }
  CENARIOS[T.id](pecas(G, n), n, T);
  // sol e câmera acompanham o tamanho do terreno
  const s = r3.sol, q = n * .95;
  s.position.set(-n * .55, n * 1.15, n * .2);
  s.shadow.camera.left = -q; s.shadow.camera.right = q; s.shadow.camera.top = q; s.shadow.camera.bottom = -q; s.shadow.camera.far = n * 3.2; s.shadow.camera.near = 1;
  s.shadow.camera.updateProjectionMatrix();
  const fechado = T.id === 'gaiola' || T.id === 'aquario', dist = n * (fechado ? 3.75 : 3.3);
  r3.camera.near = Math.max(1, n * .5); r3.camera.far = n * 8; r3.camera.updateProjectionMatrix();
  r3.camera.position.set(dist * .62, dist * .55, dist * .62);
  r3.camera.lookAt(0, fechado ? n * .08 : -1.5, 0);
}
const EMOJI = {coracao: '❤️', chuva: '🌧️', alerta: '❗', caveira: '💀'};
function materialIcone(nome){
  const r3 = R3;
  if(r3.icones[nome]) return r3.icones[nome];
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const c = cv.getContext('2d'); c.font = '48px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(EMOJI[nome], 32, 36);
  return r3.icones[nome] = new THREE.SpriteMaterial({map: new THREE.CanvasTexture(cv), depthTest: false, transparent: true});
}

/* ---------- INÍCIO E QUADRO ---------- */
function iniciaRealista(){
  if(R3 !== null) return R3;
  R3 = false;
  if(!window.THREE) return false;
  try{
    const cv = document.createElement('canvas'); cv.id = 'terrenoGL';
    cv.setAttribute('aria-label', 'Terreno em 3D com seus animais. Toque em um animal para ver a ficha.');
    const renderer = new THREE.WebGLRenderer({canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance'});
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const fraco = (navigator.hardwareConcurrency || 4) <= 4;
    const scene = new THREE.Scene(); scene.environment = ceuEnv(renderer);
    const camera = new THREE.PerspectiveCamera(17, 236 / 168, 1, 800);
    const sol = new THREE.DirectionalLight(new THREE.Color('#fff0d4'), 1.5);
    sol.castShadow = true; sol.shadow.mapSize.set(fraco ? 1024 : 2048, fraco ? 1024 : 2048); sol.shadow.bias = -.0006; sol.shadow.normalBias = .05;
    scene.add(sol, sol.target, new THREE.HemisphereLight(new THREE.Color('#cfe6ff'), new THREE.Color('#4d5a33'), .18));
    R3 = {renderer, scene, camera, sol, fraco, cv, ondas: null, cenario: null, cenarioN: 0, cenarioId: '', malhas: new Map(), efeitos: [], icones: {},
      material: new THREE.MeshStandardMaterial({vertexColors: true, roughness: .82, metalness: 0, envMapIntensity: .55}),
      // muito raro: dourado brilhante por cima das cores do animal
      materialRaro: new THREE.MeshStandardMaterial({vertexColors: true, color: linearDe('#ffd25c'), emissive: linearDe('#7a5200'), emissiveIntensity: .45, roughness: .4, metalness: .35, envMapIntensity: 1.1}), pr: Math.min(devicePixelRatio || 1, fraco ? 1.5 : 2), custo: 0, nQuadros: 0};
    cv.addEventListener('click', cliqueRealista);
  }catch(e){ R3 = false; }
  return R3;
}
// Alcance do animal no terreno atual, para a cabeça e a cauda não passarem de grades, cercas e obstáculos
function raioAnimal(esp){
  if(!iniciaRealista()) return 3;
  return geometriaDe(esp).userData.raio * escalaAnimal();
}
function posDoAnimal(a, m){
  const n = terrenoN;
  if(a.esp === 'peixe') return [m.x - n / 2, -1.3, m.y - n / 2];
  return [m.x - n / 2, Math.max(alturaChao(m.x, m.y), AQUATICOS[a.esp] ? -.7 : -1), m.y - n / 2];
}
function cliqueRealista(e){
  const r3 = R3, r = r3.cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, v = new THREE.Vector3();
  let melhor = null, dist = 1e9;
  for(const [id, o] of r3.malhas){
    v.copy(o.mesh.position); v.y += o.alt * (o.tam || escalaAnimal()) * .45; v.project(r3.camera);
    const sx = (v.x + 1) / 2 * r.width, sy = (1 - v.y) / 2 * r.height, q = Math.hypot(sx - mx, sy - my);
    if(q < dist && q < Math.max(22, o.alt * 2.4)){ dist = q; melhor = id; }
  }
  if(melhor) ACT.verAnimal(melhor);
}
function desenhaRealista(tempoMs, dt){
  const r3 = iniciaRealista();
  if(!r3) return false;
  const base = $('#terrenoCv');
  if(!base) return true;
  if(!r3.cv.isConnected) base.parentNode.insertBefore(r3.cv, base);
  base.style.display = 'none';
  if(r3.cenarioId !== terrenoT.id) montaCenario();
  const w = r3.cv.clientWidth, h = r3.cv.clientHeight;
  if(w && (r3.w !== w || r3.h !== h || r3.prUsado !== r3.pr)){
    r3.w = w; r3.h = h; r3.prUsado = r3.pr;
    r3.renderer.setPixelRatio(r3.pr); r3.renderer.setSize(w, h, false);
    r3.camera.aspect = w / h; r3.camera.updateProjectionMatrix();
  }
  const lista = animaisAtuais(), vivos = new Set();
  const pisca = Math.floor(tempoMs / 500) % 2;
  for(const a of lista){
    const m = mundo.get(a.id);
    if(!m) continue;
    vivos.add(a.id);
    let o = r3.malhas.get(a.id);
    if(!o){
      const g = geometriaDe(a.esp), mesh = new THREE.Mesh(g, muitoRaro(a) ? r3.materialRaro : r3.material);
      mesh.castShadow = true; mesh.receiveShadow = true;
      const ic = new THREE.Sprite(materialIcone('coracao')); ic.visible = false; ic.scale.set(2.6, 2.6, 1);
      r3.scene.add(mesh, ic);
      o = {mesh, ic, alt: g.userData.altura, yaw: -m.dir * Math.PI / 2, fase: Math.random() * 6, ax: m.x, ay: m.y};
      r3.malhas.set(a.id, o);
    }
    const [X, Y, Z] = posDoAnimal(a, m), ddx = m.x - o.ax, ddy = m.y - o.ay, anda = Math.hypot(ddx, ddy) > 1e-3;
    o.ax = m.x; o.ay = m.y;
    if(anda){
      const alvo = m.ang != null ? -m.ang : -Math.atan2(ddy, ddx);
      let dif = alvo - o.yaw;
      while(dif > Math.PI) dif -= Math.PI * 2;
      while(dif < -Math.PI) dif += Math.PI * 2;
      o.yaw += dif * Math.min(1, dt * (m.ang != null ? 18 : 8));
      o.fase += Math.hypot(ddx, ddy) * clamp(12 / o.alt, .9, 5); // o passo acompanha a distância, para a pata não deslizar no chão
    }
    const tam = escalaAnimal() * tamanhoIdade(a), resp = 1 + Math.sin(tempoMs / 700 + o.fase) * .012;
    o.mesh.position.set(X, Y + (anda ? Math.abs(Math.sin(o.fase)) * (m.ang != null ? .03 : .07) : 0), Z);
    o.mesh.rotation.y = o.yaw;
    o.mesh.rotation.z = 0;
    if(m.fareja){ // parado, cheirando: olha para os lados e abaixa o focinho, tremendo de leve
      o.mesh.rotation.y = o.yaw + Math.sin(tempoMs / 420 + o.fase) * .3;
      o.mesh.rotation.z = -.05 + Math.sin(tempoMs / 55) * .014;
    }
    o.mesh.scale.set(tam, tam * resp, tam); o.tam = tam;
    if(o.mesh.morphTargetInfluences) o.mesh.morphTargetInfluences[0] = anda ? Math.sin(o.fase) : 0;
    const c = casalDe(a.id);
    let nome = '';
    if(c && a.id === c.f && c.fase !== 'pronto') nome = 'coracao';
    else if(ESP[a.esp].caca && m.alvo) nome = 'alerta';
    else if(humores[a.esp] >= 40) nome = 'chuva';
    o.ic.visible = !!nome && !!pisca;
    if(o.ic.visible){ o.ic.material = materialIcone(nome); o.ic.position.set(X, Y + o.alt * tam + 1.6, Z); }
  }
  for(const [id, o] of r3.malhas) if(!vivos.has(id)){ r3.scene.remove(o.mesh, o.ic); r3.malhas.delete(id); }
  // caveiras dos que foram comidos
  for(const e of efeitos) if(!e.spr){
    e.spr = new THREE.Sprite(materialIcone('caveira')); e.spr.scale.set(2.8, 2.8, 1);
    r3.scene.add(e.spr);
  }
  for(const e of r3.efeitos) if(e.t <= 0) r3.scene.remove(e.spr);
  r3.efeitos = efeitos.filter(e => e.spr);
  for(const e of r3.efeitos) e.spr.position.set(e.x - terrenoN / 2, 2 + (3 - e.t) * 1.2, e.y - terrenoN / 2);
  if(r3.ondas){ r3.ondas.offset.x = tempoMs * .00002; r3.ondas.offset.y = tempoMs * .000013; }
  r3.renderer.render(r3.scene, r3.camera);
  // aparelho lento: baixa a resolução, sem nunca passar de 1 pixel por ponto da tela
  r3.custo += dt; r3.nQuadros++;
  if(r3.nQuadros >= 45){
    if(r3.custo / r3.nQuadros > .05 && r3.pr > 1) r3.pr = Math.max(1, r3.pr - .25);
    r3.custo = 0; r3.nQuadros = 0;
  }
  return true;
}
