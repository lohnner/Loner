// Modelos 3D em pixel art (voxels). x = frente do animal, y = lado, z = altura; pernas têm grupo 1 ou 2 para a animação de andar.
// Cada espécie vira uma imagem pequena por direção e passo (spriteDe), guardada para o desenho do terreno ser leve no celular.
'use strict';

function novoModelo(){
  const m = new Map();
  const put = (x, y, z, c, g = 0) => { m.set(x + ',' + y + ',' + z, {x, y, z, c, g}); };
  const box = (x0, x1, y0, y1, z0, z1, c, g = 0) => {
    for(let x = x0; x <= x1; x++) for(let y = y0; y <= y1; y++) for(let z = z0; z <= z1; z++) put(x, y, z, c, g);
  };
  return {m, put, box};
}
const hashV = (x, y, z) => { const h = Math.imul(x * 73856093 ^ y * 19349663 ^ z * 83492791, 2654435761) >>> 0; return (h >>> 7) % 16; };
function corPadrao(p, x, y, z){
  if(p.pat === 'listra') return x % 2 ? p.c3 : p.c;
  if(p.pat === 'pinta') return hashV(x, y, z) < 5 ? p.c3 : p.c;
  if(p.pat === 'mancha') return hashV(x >> 1, y >> 1, z >> 1) < 7 ? p.c3 : p.c;
  return p.c;
}
const OLHO = '#16120f';

function quad(p){
  const M = novoModelo(), {put, box} = M, L = p.L, W = p.W, leg = p.leg, top = leg + p.H - 1;
  const y0 = -(W >> 1), y1 = y0 + W - 1;
  for(let x = 0; x < L; x++) for(let y = y0; y <= y1; y++) for(let z = leg; z <= top; z++) put(x, y, z, corPadrao(p, x, y, z));
  if(p.c2) box(0, L - 1, y0, y1, leg, leg, p.c2);
  const lw = p.lw || 1, pata = p.pata || p.c;
  [0, L - lw].forEach((lx, i) => [y0, y1 - lw + 1].forEach((ly, j) => {
    box(lx, lx + lw - 1, ly, ly + lw - 1, 0, leg - 1, pata, (i + j) % 2 ? 2 : 1);
    if(p.casco) box(lx, lx + lw - 1, ly, ly + lw - 1, 0, 0, p.casco, (i + j) % 2 ? 2 : 1);
  }));
  const n = p.neck || 0, hl = p.hl || 2, hw = p.hw || Math.min(W, 3), hh = p.hh || 2, hx0 = n ? L - 1 : L, hx1 = hx0 + hl - 1;
  const hy0 = -(hw >> 1), hy1 = hy0 + hw - 1, hz1 = top + (p.hup == null ? 1 : p.hup) + n, hz0 = hz1 - hh + 1, ch = p.ch || p.c;
  if(n){
    const nw = p.nw || Math.min(W, 2), ny0 = -(nw >> 1);
    for(let z = top; z <= hz0; z++) box(L - 2, L - 1, ny0, ny0 + nw - 1, z, z, p.pat === 'mancha' ? corPadrao(p, 1, 1, z) : p.c);
  }
  box(hx0, hx1, hy0, hy1, hz0, hz1, ch);
  const fl = p.fl == null ? 1 : p.fl;
  if(fl){
    box(hx1 + 1, hx1 + fl, hy0 + (hw > 2 ? 1 : 0), hy1 - (hw > 2 ? 1 : 0), hz0, hz0 + (p.fh || 1) - 1, p.fc || p.c2 || ch);
    put(hx1 + fl, 0, hz0 + (p.fh || 1) - 1, p.nariz || '#2a1d18');
  }
  put(hx1, hy0, hz1 - (hh > 2 ? 1 : 0), OLHO); put(hx1, hy1, hz1 - (hh > 2 ? 1 : 0), OLHO);
  const oc = p.oc || ch;
  if(p.orelha === 'ponta'){ put(hx0, hy0, hz1 + 1, oc); put(hx0, hy1, hz1 + 1, oc); }
  if(p.orelha === 'redonda'){ box(hx0, hx0, hy0 - 1, hy0, hz1, hz1 + 1, oc); box(hx0, hx0, hy1, hy1 + 1, hz1, hz1 + 1, oc); }
  if(p.orelha === 'longa'){ box(hx0, hx0, hy0, hy0, hz1 + 1, hz1 + 3, oc); box(hx0, hx0, hy1, hy1, hz1 + 1, hz1 + 3, oc); }
  if(p.orelha === 'caida'){ box(hx0, hx0, hy0 - 1, hy0 - 1, hz0, hz1, oc); box(hx0, hx0, hy1 + 1, hy1 + 1, hz0, hz1, oc); }
  if(p.orelha === 'grande'){ box(hx0 - 1, hx0, hy0 - 3, hy0 - 1, hz0 - 1, hz1, oc); box(hx0 - 1, hx0, hy1 + 1, hy1 + 3, hz0 - 1, hz1, oc); }
  if(p.juba){ box(hx0 - 1, hx0, hy0 - 1, hy1 + 1, hz0 - 1, hz1 + 1, p.juba); box(hx0 - 1, hx0, hy0, hy1, hz0, hz1, p.juba); box(hx0, hx1, hy0, hy1, hz0, hz1, ch); put(hx1, hy0, hz1, OLHO); put(hx1, hy1, hz1, OLHO); }
  if(p.crina){ for(let x = Math.max(0, L - 4); x < L; x++) put(x, 0, top + 1, p.crina); for(let z = top; z <= hz1; z++) put(hx0 - 1, 0, z, p.crina); }
  if(p.chifre){ const c = p.chifre; box(hx0, hx0, hy0, hy0, hz1 + 1, hz1 + 2, c); box(hx0, hx0, hy1, hy1, hz1 + 1, hz1 + 2, c); }
  if(p.ossicone){ put(hx0, hy0, hz1 + 1, p.ossicone); put(hx0, hy1, hz1 + 1, p.ossicone); }
  if(p.corno){ box(hx1 + 1, hx1 + 1, 0, 0, hz0 + 1, hz0 + 3, p.corno); }
  if(p.tromba){ box(hx1 + 1, hx1 + 1, 0, 0, 1, hz0 + 1, p.c); box(hx1 + 2, hx1 + 2, 0, 0, 0, 1, p.c); }
  if(p.presa){ box(hx1 + 1, hx1 + 2, hy0, hy0, hz0 - 1, hz0 - 1, p.presa); box(hx1 + 1, hx1 + 2, hy1, hy1, hz0 - 1, hz0 - 1, p.presa); }
  if(p.corcova){ box(p.corcova[0], p.corcova[1], y0 + (W > 2 ? 1 : 0), y1 - (W > 2 ? 1 : 0), top + 1, top + 2, p.c); }
  if(p.escama){ for(let x = 0; x < L; x += 2) put(x, 0, top + 1, p.escama); }
  if(p.casco2){ box(1, L - 2, y0, y1, top, top + 1, p.casco2); box(2, L - 3, y0 + 1, y1 - 1, top + 2, top + 2, p.casco2); }
  const tl = p.caudaL || 0, tc = p.cauda || p.c;
  if(tl && p.caudaTipo === 'pend'){ box(-1, -1, 0, 0, top - tl + 1, top, tc); if(p.tufo) put(-1, 0, top - tl, p.tufo); }
  else if(tl && p.caudaTipo === 'sobe'){ box(-1, -1, 0, 0, top, top + tl, tc); }
  else if(tl){ box(-tl, -1, 0, 0, p.caudaBaixa ? leg : top, p.caudaBaixa ? leg : top, tc); if(p.tufo) put(-tl, 0, top, p.tufo); }
  M.tipo = 'quad'; M.p = p;
  return M;
}
function ave(p){
  const M = novoModelo(), {put, box} = M, L = p.L, W = p.W, leg = p.leg, top = leg + p.H - 1, y0 = -(W >> 1), y1 = y0 + W - 1;
  box(0, L - 1, y0, y1, leg, top, p.c);
  if(p.c2) box(1, L - 1, y0, y1, leg, leg, p.c2);
  const pc = p.pata || '#d8922b';
  box(1, 1, y0, y0, 0, leg - 1, pc, 1); box(1, 1, y1, y1, 0, leg - 1, pc, 2);
  const asa = p.asa || p.c;
  box(0, L - 2, y0 - 1, y0 - 1, leg + 1, top, asa); box(0, L - 2, y1 + 1, y1 + 1, leg + 1, top, asa);
  const n = p.neck || 0, hx = L - 1, hz0 = top + n + (p.hup == null ? 1 : p.hup), hw = p.hw || Math.min(W, 2), hy0 = -(hw >> 1), hy1 = hy0 + hw - 1;
  if(n) box(hx, hx, hy0, hy0 + hw - 1, top, hz0 - 1, p.cn || p.c);
  const hl = p.hl || 2, ch = p.ch || p.c;
  box(hx, hx + hl - 1, hy0, hy1, hz0, hz0 + 1, ch);
  put(hx + hl - 1, hy0, hz0 + 1, OLHO); put(hx + hl - 1, hy1, hz0 + 1, OLHO);
  const bl = p.bicoL || 1;
  box(hx + hl, hx + hl + bl - 1, hy0, hy1, hz0, hz0 + (p.bicoA || 0), p.bico || '#e39a24');
  if(p.bico2) box(hx + hl, hx + hl + bl - 1, hy0, hy1, hz0, hz0, p.bico2);
  if(p.crista){ for(let i = 0; i < (p.cristaN || 2); i++) box(hx - i, hx - i, hy0, hy0, hz0 + 2, hz0 + 2 + (p.cristaA || 1) - 1, p.crista); }
  const tl = p.caudaL || 1, tc = p.cauda || p.c;
  if(p.leque){
    for(let z = 0; z < p.leque; z++) for(let y = -z - 2; y <= z + 2; y++){
      put(-1 - (z >> 1), y, leg + z, hashV(y, z, 3) < 5 ? p.leqC : tc);
    }
  } else box(-tl, -1, 0, Math.max(0, hw - 1) ? 0 : 0, p.caudaBaixa ? leg : top - 1, p.caudaBaixa ? leg : top - 1, tc);
  M.tipo = 'ave'; M.p = p;
  return M;
}
function bipede(p){
  const M = novoModelo(), {put, box} = M, W = p.W, D = p.D || 2, leg = p.leg, top = leg + p.H - 1, y0 = -(W >> 1), y1 = y0 + W - 1;
  const lw = p.lw || 1, pata = p.pata || p.c;
  box(0, D - 1, y0, y0 + lw - 1, 0, leg - 1, pata, 1); box(0, D - 1, y1 - lw + 1, y1, 0, leg - 1, pata, 2);
  if(p.pe){ box(D, D + p.pe - 1, y0, y0 + lw - 1, 0, 0, pata, 1); box(D, D + p.pe - 1, y1 - lw + 1, y1, 0, 0, pata, 2); }
  box(0, D - 1, y0, y1, leg, top, p.c);
  if(p.c2) box(D - 1, D - 1, y0 + (W > 2 ? 1 : 0), y1 - (W > 2 ? 1 : 0), leg, top - 1, p.c2);
  const ab = p.braco || 1, bz = top - (p.bracoL || 2);
  box(0, D - 1, y0 - ab, y0 - 1, bz, top, p.c, 2); box(0, D - 1, y1 + 1, y1 + ab, bz, top, p.c, 1);
  const hw = p.hw || W, hh = p.hh || 2, hl = p.hl || D, hy0 = -(hw >> 1), hy1 = hy0 + hw - 1, hz0 = top + 1, hz1 = hz0 + hh - 1, ch = p.ch || p.c, hx1 = hl - 1 + (p.hxo || 0);
  box(p.hxo || 0, hx1, hy0, hy1, hz0, hz1, ch);
  if(p.rosto) box(hx1, hx1, hy0, hy1, hz0, hz1 - (hh > 2 ? 1 : 0), p.rosto);
  put(hx1, hy0, hz1 - (hh > 2 ? 1 : 0), OLHO); put(hx1, hy1, hz1 - (hh > 2 ? 1 : 0), OLHO);
  if(p.fl) box(hx1 + 1, hx1 + p.fl, Math.min(0, hy1), Math.min(0, hy1), hz0, hz0, p.fc || ch);
  if(p.orelha === 'longa'){ box(0, 0, hy0, hy0, hz1 + 1, hz1 + 2, ch); box(0, 0, hy1, hy1, hz1 + 1, hz1 + 2, ch); }
  if(p.orelha === 'ponta'){ put(0, hy0, hz1 + 1, ch); put(0, hy1, hz1 + 1, ch); }
  if(p.caudaL && p.caudaTipo === 'sobe'){
    for(let i = 0; i < p.caudaL; i++){ const c = p.caudaA && i % 2 ? p.caudaA : (p.cauda || p.c); put(-1, 0, leg + i, c); }
  } else if(p.caudaL){ box(-p.caudaL, -1, 0, 0, p.caudaZ || 1, p.caudaZ || 1, p.cauda || p.c); }
  M.tipo = 'bipede'; M.p = p;
  return M;
}
function cobra(p){
  const M = novoModelo(), {put, box} = M, r = p.r;
  for(let z = 0; z < 3; z++){
    const R = r - z;
    for(let x = -R; x <= R; x++) for(let y = -R; y <= R; y++){
      if(Math.abs(x) !== R && Math.abs(y) !== R) continue;
      put(x, y, z, hashV(x + y, z, 1) < (p.n || 5) ? p.c3 : p.c);
    }
  }
  const h = 3 + (p.alto || 1);
  box(0, 0, 0, 0, 2, h, p.c);
  if(p.capuz){ box(0, 0, -2, 2, h - 2, h, p.capuz); box(0, 0, -1, 1, h - 2, h, p.c); }
  box(0, 2, -1, 0, h + 1, h + 1, p.ch || p.c);
  put(2, -1, h + 1, OLHO); put(2, 0, h + 1, OLHO);
  put(3, -1, h + 1, '#d3364a');
  M.tipo = 'cobra'; M.p = p;
  return M;
}
function peixe(p){
  const M = novoModelo(), {put, box} = M;
  box(0, 3, -1, 0, 0, 1, p.c); box(1, 2, -1, 0, 2, 2, p.c);
  box(-2, -1, -1, 0, 0, 2, p.c3 || p.c); put(1, -1, 3, p.c3 || p.c);
  put(3, -1, 1, OLHO); put(3, 0, 1, OLHO);
  M.tipo = 'peixe'; M.p = p;
  return M;
}
function caracolVox(p){
  const M = novoModelo(), {put, box} = M;
  box(-2, 2, -1, 0, 0, 0, p.c); box(2, 3, -1, 0, 1, 1, p.c); put(3, -1, 2, OLHO); put(3, 0, 2, OLHO);
  box(-2, 1, -1, 0, 1, 3, p.c3); box(-1, 0, -1, 0, 2, 2, p.c); box(-1, 0, -1, 0, 4, 4, p.c3);
  M.tipo = 'caracol'; M.p = p;
  return M;
}
function arvore(c, c2, h){
  const M = novoModelo(), {box} = M;
  box(0, 1, 0, 1, 0, h, '#6d4a2c');
  box(-2, 3, -2, 3, h, h + 2, c); box(-1, 2, -1, 2, h + 3, h + 4, c2); box(0, 1, 0, 1, h + 5, h + 5, c2);
  return M;
}
function pedra(){
  const M = novoModelo(), {box} = M;
  box(0, 3, 0, 2, 0, 0, '#8f958c'); box(0, 2, 0, 1, 1, 1, '#a4aaa0'); box(1, 1, 0, 0, 2, 2, '#b6bbb1');
  return M;
}

const MODELOS = {
  caracol: () => caracolVox({c:'#b89b7a', c3:'#7d4f2a'}),
  camundongo: () => quad({L:4, W:2, H:2, leg:1, hl:2, hw:2, hh:2, c:'#d8c3a0', c2:'#f3ece0', ch:'#d8c3a0', orelha:'redonda', oc:'#e8b4b4', fl:1, fc:'#efe4d2', nariz:'#e38b95', caudaL:2.2, cauda:'#e8b4b4', caudaBaixa:1}),
  twister: () => quad({L:6, W:3, H:3, leg:1, hl:2, hw:2, hh:2, c:'#f2efe8', pat:'mancha', c3:'#55555b', ch:'#55555b', orelha:'redonda', oc:'#d9a5a5', fl:1, fc:'#efece6', nariz:'#e38b95', caudaL:3, cauda:'#e0a9a9', caudaBaixa:1}),
  lagartixa: () => quad({L:6, W:3, H:2, leg:1, hl:3, hw:3, hh:2, hup:0, c:'#e8c45a', pat:'pinta', c3:'#3a2c1c', c2:'#f4e7c4', ch:'#e8c45a', fl:0, caudaL:3, cauda:'#d9b24e', caudaBaixa:1}),
  jabuti: () => quad({L:6, W:5, H:1, leg:1, lw:1, hl:2, hw:2, hh:2, hup:0, c:'#a58a5a', ch:'#a58a5a', casco2:'#6b5530', fl:0, caudaL:1, caudaBaixa:1}),
  ourico: () => quad({L:5, W:4, H:3, leg:1, hl:2, hw:2, hh:2, hup:0, c:'#c8ad8b', c3:'#f2ece2', c2:'#f0e5d3', ch:'#f0e5d3', espinhos:'#6e5a46', orelha:'redonda', oc:'#c49a8a', fl:1, fc:'#f0e5d3'}),
  hamster: () => quad({L:4, W:3, H:3, leg:1, hl:1.4, hw:3, hh:3, hup:0, c:'#d99a58', c2:'#f6e6cf', ch:'#d99a58', fc:'#f6e6cf', orelha:'redonda', oc:'#b87a41', fl:.3}),
  rato: () => quad({L:5, W:3, H:2, leg:1, hl:2, hw:2, hh:2, c:'#3b3b40', c2:'#efece6', ch:'#efece6', orelha:'redonda', oc:'#e8a9a9', fl:1, fc:'#efece6', nariz:'#e38b95', caudaL:4, cauda:'#e8a9a9', caudaBaixa:1}),
  peixe: () => peixe({c:'#f28c1c', c3:'#ffc45a'}),
  galinha: () => ave({L:4, W:3, H:3, leg:2, c:'#a8522a', c2:'#7a381c', asa:'#7f3c1e', neck:1, hl:2, ch:'#b85d30', bico:'#e8b53a', crista:'#d3232e', cristaN:2, caudaL:2, cauda:'#3f2a26'}),
  pato: () => ave({L:5, W:3, H:2, leg:1, c:'#b7a48a', asa:'#8d7a63', neck:1, ch:'#1f7a45', cn:'#f4f1e6', hl:2, bico:'#e9b12d', bicoL:2, pata:'#ea8a1c', caudaL:1, cauda:'#3f3a35'}),
  periquito: () => ave({L:3, W:2, H:3, leg:1, c:'#7bc950', asa:'#3f7a2e', hl:2, ch:'#f3d94e', bico:'#39618c', caudaL:3, cauda:'#2d6db5', pata:'#8b8f94'}),
  tartaruga: () => quad({L:6, W:5, H:1, leg:1, lw:1, hl:2, hw:2, hh:2, hup:0, c:'#4f7a38', ch:'#5e8f3c', casco2:'#3a5a2d', fl:0, caudaL:1, caudaBaixa:1}),
  porquinho: () => quad({L:5, W:4, H:3, leg:1, hl:2, hw:3, hh:2, c:'#f3efe6', pat:'mancha', c3:'#7a4a2a', ch:'#7a4a2a', orelha:'redonda', oc:'#5c3820', fc:'#f3efe6', fl:1}),
  coelho: () => quad({L:5, W:3, H:3, leg:1, hl:2, hw:3, hh:2, c:'#f1eee8', pat:'mancha', c3:'#b8afa2', ch:'#f1eee8', orelha:'longa', oc:'#e0b9b4', fl:0, caudaL:1, cauda:'#fff'}),
  canario: () => ave({L:3, W:2, H:3, leg:1, c:'#f4d622', asa:'#dcae12', hl:2, bico:'#ee9a2b', caudaL:2, cauda:'#dcae12', pata:'#c98f6b'}),
  iguana: () => quad({L:6, W:3, H:2, leg:1, hl:3, hw:2, hh:2, c:'#5faa3f', c2:'#a9d36a', escama:'#3e7a2a', fl:0, caudaL:6, cauda:'#4f9636', caudaBaixa:1}),
  calopsita: () => ave({L:3, W:2, H:3, leg:1, c:'#9a9a9d', asa:'#6d6d70', hl:2, ch:'#f3e070', bico:'#4d4d50', crista:'#f3e070', cristaN:1, cristaA:2, caudaL:3, cauda:'#6d6d70', pata:'#a98c78'}),
  piton: () => cobra({r:3, c:'#6c4a22', c3:'#d7b57a', n:7, ch:'#5a3c1a'}),
  gato: () => quad({L:6, W:3, H:3, leg:2, hl:2, hw:3, hh:3, c:'#e39a3e', pat:'listra', c3:'#b56f24', ch:'#e39a3e', orelha:'ponta', fl:0, caudaL:3, caudaTipo:'sobe'}),
  furao: () => quad({L:7, W:2, H:2, leg:1, hl:2, hw:2, hh:2, c:'#7d5d3e', c2:'#efdfc5', ch:'#efdfc5', orelha:'redonda', oc:'#5a4028', fl:1, fc:'#efdfc5', caudaL:3, cauda:'#4d3825'}),
  ovelha: () => quad({L:7, W:5, H:4, leg:2, hl:2, hw:2, hh:2, hup:0, c:'#f5f1e4', pata:'#2f2b28', ch:'#2f2b28', orelha:'caida', oc:'#2f2b28', fl:0, caudaL:1}),
  cabra: () => quad({L:7, W:3, H:3, leg:3, hl:2, hw:2, hh:2, c:'#9f6b3e', pat:'mancha', c3:'#efe6d3', ch:'#efe6d3', chifre:'#6b5c4c', orelha:'caida', oc:'#7c5430', fl:1, fc:'#efe6d3', caudaL:2, caudaTipo:'sobe', casco:'#322a22'}),
  chinchila: () => quad({L:5, W:4, H:3, leg:1, hl:2, hw:3, hh:2, c:'#a7abb0', c2:'#eef0f2', ch:'#b7bbc0', orelha:'redonda', oc:'#d9b6b6', fl:0, caudaL:3, cauda:'#7f8388', caudaTipo:'sobe'}),
  porco: () => quad({L:8, W:5, H:4, leg:2, hl:2, hw:3, hh:3, hup:0, c:'#eba8a4', ch:'#eba8a4', orelha:'ponta', fl:1, fc:'#d98a88', nariz:'#b86a6a', caudaL:1, caudaTipo:'sobe'}),
  pavao: () => ave({L:4, W:3, H:3, leg:3, c:'#1d5fa8', asa:'#2d7f5c', neck:3, cn:'#1d6fc0', ch:'#1d6fc0', hl:2, bico:'#b9a06a', crista:'#2db0a0', cristaN:1, leque:7, cauda:'#2a8c4e', leqC:'#2db0e0'}),
  jiboia: () => cobra({r:4, c:'#8b6b3f', c3:'#4a3018', n:6, ch:'#7a5c33', alto:1}),
  naja: () => cobra({r:3, c:'#b99a4a', c3:'#6e5721', n:4, capuz:'#8a7030', alto:2}),
  cao: () => quad({L:8, W:4, H:4, leg:3, hl:3, hw:3, hh:3, c:'#b9844a', c2:'#f0e0c6', ch:'#b9844a', orelha:'caida', oc:'#7c5730', fl:1, fc:'#f0e0c6', caudaL:3, caudaTipo:'sobe'}),
  burro: () => quad({L:9, W:4, H:4, leg:4, neck:2, nw:2, hl:3, hw:2, hh:3, c:'#7a7770', c2:'#c9c5bb', ch:'#7a7770', fc:'#d9d5cb', orelha:'longa', fl:1, caudaL:4, caudaTipo:'pend', tufo:'#3c3a36', casco:'#2f2d29', crina:'#3c3a36'}),
  suricata: () => bipede({W:3, H:4, leg:2, D:2, hl:2, hw:2, hxo:1, c:'#c8a877', c2:'#ecdcbc', ch:'#c8a877', rosto:'#ecdcbc', braco:1, bracoL:1, caudaL:3, cauda:'#6c5436'}),
  papagaio: () => ave({L:3, W:3, H:4, leg:1, c:'#3eb043', asa:'#237a30', hl:2, ch:'#f0d84b', bico:'#30302f', bicoA:1, caudaL:3, cauda:'#d3402f', pata:'#7a7a78'}),
  lhama: () => quad({L:8, W:4, H:4, leg:4, neck:5, nw:2, hl:2, hw:2, hh:2, c:'#efe2c6', pat:'mancha', c3:'#b58a5e', ch:'#efe2c6', orelha:'longa', oc:'#b58a5e', fl:1, caudaL:1, caudaTipo:'sobe', casco:'#3d3126'}),
  avestruz: () => ave({L:6, W:5, H:4, leg:6, c:'#2c2826', asa:'#f4efe6', neck:7, cn:'#e9c2ac', ch:'#e9c2ac', hw:1, hl:2, bico:'#d7a163', caudaL:2, cauda:'#f4efe6', pata:'#e9c2ac'}),
  capivara: () => quad({L:8, W:5, H:4, leg:2, hl:3, hw:3, hh:3, hup:0, c:'#8e5c33', ch:'#7f5029', fc:'#6a4220', orelha:'redonda', oc:'#5c3a1c', fl:1, fh:2}),
  vaca: () => quad({L:11, W:6, H:5, leg:4, hl:3, hw:4, hh:3, c:'#f4f1e8', pat:'mancha', c3:'#2f2a27', ch:'#f4f1e8', chifre:'#d9d1bd', orelha:'caida', oc:'#2f2a27', fl:1, fc:'#eab9b3', caudaL:5, caudaTipo:'pend', tufo:'#2f2a27', casco:'#39312b'}),
  arara: () => ave({L:3, W:3, H:4, leg:1, c:'#1f7cd1', c2:'#f7c733', asa:'#1560a8', hl:2, ch:'#37a35a', bico:'#242424', bicoA:1, caudaL:5, cauda:'#1f7cd1', pata:'#50504e'}),
  alpaca: () => quad({L:7, W:4, H:4, leg:3, neck:4, nw:2, hl:2, hw:2, hh:2, c:'#f3e7d2', ch:'#f8efe0', orelha:'longa', fl:1, fc:'#cdb898', caudaL:1, caudaTipo:'sobe', casco:'#4a3a2a'}),
  jacare: () => quad({L:10, W:5, H:2, leg:1, hl:4, hw:3, hh:2, hup:0, c:'#3a4a2d', c2:'#8a9a62', escama:'#26321c', fl:1, fc:'#4a5a38', caudaL:8, caudaBaixa:1}),
  lemure: () => bipede({W:3, H:4, leg:2, D:2, hl:2, hw:3, c:'#a0a2a6', c2:'#eeeeea', ch:'#eeeeea', rosto:'#26262a', orelha:'ponta', braco:1, bracoL:2, caudaL:8, caudaTipo:'sobe', cauda:'#26262a', caudaA:'#f2f2ee'}),
  canguru: () => bipede({W:4, H:6, leg:3, D:3, lw:2, pe:3, hl:3, hw:2, c:'#b9683a', c2:'#e6c7a0', ch:'#b9683a', orelha:'longa', braco:1, bracoL:2, caudaL:7, caudaZ:1, cauda:'#a55a30'}),
  tucano: () => ave({L:3, W:3, H:4, leg:1, c:'#1c1c1e', c2:'#f4f0e4', asa:'#0f0f11', hl:2, ch:'#f4f0e4', bico:'#f28a1a', bicoL:4, bicoA:1, bico2:'#d3402f', caudaL:3, cauda:'#141416', pata:'#3b5f7f'}),
  cavalo: () => quad({L:11, W:5, H:5, leg:6, neck:4, nw:2, hl:3, hw:2, hh:3, c:'#6e4426', ch:'#6e4426', fc:'#5a371e', orelha:'ponta', fl:1, caudaL:6, caudaTipo:'pend', cauda:'#1e1612', crina:'#1e1612', casco:'#1e1612'}),
  zebra: () => quad({L:10, W:4, H:5, leg:5, neck:3, nw:2, hl:3, hw:2, hh:3, c:'#f3f3ee', pat:'listra', c3:'#16161a', ch:'#f3f3ee', fc:'#16161a', orelha:'ponta', oc:'#16161a', fl:1, caudaL:5, caudaTipo:'pend', cauda:'#16161a', crina:'#16161a', casco:'#16161a'}),
  leopardo: () => quad({L:10, W:4, H:4, leg:3, hl:3, hw:3, hh:3, c:'#e0b45c', pat:'pinta', c3:'#3a2a18', c2:'#f4e3c0', ch:'#e0b45c', orelha:'redonda', fl:1, fc:'#f4e3c0', caudaL:7, caudaBaixa:0}),
  tigre: () => quad({L:12, W:5, H:5, leg:4, lw:2, hl:3, hw:4, hh:3, c:'#e88a24', pat:'listra', c3:'#1f1812', c2:'#f7ecd8', ch:'#e88a24', orelha:'redonda', oc:'#1f1812', fl:1, fc:'#f7ecd8', caudaL:8}),
  leao: () => quad({L:12, W:5, H:5, leg:4, lw:2, hl:3, hw:3, hh:3, c:'#d9a856', ch:'#e3b566', juba:'#7a4a1e', orelha:'redonda', oc:'#7a4a1e', fl:1, fc:'#f0dcae', caudaL:6, caudaTipo:'pend', tufo:'#5a3414'}),
  camelo: () => quad({L:11, W:5, H:4, leg:7, neck:5, nw:2, hl:3, hw:2, hh:2, c:'#c8a36a', ch:'#c8a36a', orelha:'ponta', fl:1, corcova:[3, 7], caudaL:3, caudaTipo:'pend', tufo:'#7a5c30'}),
  urso: () => quad({L:12, W:7, H:7, leg:3, lw:2, hl:3, hw:4, hh:4, c:'#6c4426', ch:'#6c4426', fc:'#b58a5e', orelha:'redonda', fl:1, fh:2}),
  macaco: () => bipede({W:3, H:4, leg:2, D:2, hl:2, hw:3, c:'#4a3524', c2:'#c9a97c', ch:'#3a2a1c', rosto:'#d9b98a', braco:1, bracoL:3, caudaL:7, caudaTipo:'sobe', cauda:'#4a3524'}),
  guepardo: () => quad({L:11, W:3, H:3, leg:5, hl:2, hw:3, hh:2, c:'#e6c068', pat:'pinta', c3:'#1a1612', c2:'#f6ebd0', ch:'#e6c068', orelha:'redonda', fl:1, fc:'#f6ebd0', caudaL:7}),
  hipopotamo: () => quad({L:13, W:8, H:6, leg:2, lw:3, hl:4, hw:6, hh:4, hup:-1, c:'#7f6f75', c2:'#c09a95', ch:'#8a7a7f', orelha:'ponta', fl:1, fh:2, fc:'#c09a95'}),
  girafa: () => quad({L:10, W:4, H:4, leg:8, neck:12, nw:2, hl:3, hw:2, hh:2, c:'#e6b94a', pat:'mancha', c3:'#8a5425', ch:'#e6b94a', orelha:'ponta', ossicone:'#5a3414', fl:1, caudaL:5, caudaTipo:'pend', tufo:'#3a2414', casco:'#3a2414'}),
  rinoceronte: () => quad({L:14, W:7, H:6, leg:4, lw:2, hl:4, hw:4, hh:4, hup:-1, c:'#8c8c86', ch:'#9a9a94', orelha:'ponta', fl:0, corno:'#d9d3c0', caudaL:3, caudaTipo:'pend'}),
  elefante: () => quad({L:14, W:8, H:8, leg:5, lw:3, hl:3, hw:5, hh:5, hup:0, c:'#8d9096', ch:'#979aa0', orelha:'grande', oc:'#7c7f85', fl:0, tromba:1, presa:'#f3efe0', caudaL:5, caudaTipo:'pend', tufo:'#44474c'}),
  gorila: () => bipede({W:6, D:4, H:6, leg:3, lw:2, hl:3, hw:4, hh:3, braco:2, bracoL:6, c:'#2a2a2e', c2:'#54545a', ch:'#2a2a2e', rosto:'#4c4c52'}),
  _arvore1: () => arvore('#3f8a3a', '#57a84a', 5),
  _arvore2: () => arvore('#2f7a45', '#459a58', 7),
  _pedra: pedra,
};

/* ---------- DESENHO DOS VOXELS ---------- */
function clarear(hex, f){
  const n = parseInt(hex.slice(1), 16), c = s => clamp(Math.round(((n >> s) & 255) * f), 0, 255);
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}
const tonsCache = {};
const tons = hex => tonsCache[hex] || (tonsCache[hex] = [clarear(hex, 1.12), clarear(hex, .86), clarear(hex, .66)]);
// Projeção: 1 voxel = 4 px de largura. topo 4×2, faces de 2×2.
function pintaVoxel(ctx, sx, sy, c){
  const t = tons(c);
  ctx.fillStyle = t[0]; ctx.fillRect(sx - 2, sy, 4, 2);
  ctx.fillStyle = t[1]; ctx.fillRect(sx - 2, sy + 2, 2, 2);
  ctx.fillStyle = t[2]; ctx.fillRect(sx, sy + 2, 2, 2);
}
const ROT = [(x, y) => [x, y], (x, y) => [-y, x], (x, y) => [-x, -y], (x, y) => [y, -x]];
const modelosCache = {}, spritesCache = {};
function listaDe(id){
  if(modelosCache[id]) return modelosCache[id];
  const l = [...MODELOS[id]().m.values()];
  const xs = l.filter(v => v.z <= 8).map(v => v.x), cx = Math.round((Math.min(...xs) + Math.max(...xs)) / 2);
  for(const v of l) v.x -= cx;
  return modelosCache[id] = l;
}
// Imagem da espécie em uma direção (0 a 3) e passo (0 parado, 1 ou 2 andando); ax/ay = onde fica o chão.
// Animal muito raro: cada voxel vira dourado, mantendo o claro e o escuro do desenho original (manchas e listras continuam aparecendo).
const douradoCache = {};
function dourado(hex){
  if(douradoCache[hex]) return douradoCache[hex];
  const n = parseInt(hex.slice(1), 16), L = ((n >> 16 & 255) * .3 + (n >> 8 & 255) * .59 + (n & 255) * .11) / 255, f = .45 + L * .75;
  const c = [255, 196, 48].map(x => Math.round(clamp(x * f + (L > .8 ? 40 : 0), 0, 255)));
  return douradoCache[hex] = '#' + c.map(x => x.toString(16).padStart(2, '0')).join('');
}
function spriteDe(id, dir, passo, raro){
  const k = id + dir + passo + (raro ? 'R' : '');
  if(spritesCache[k]) return spritesCache[k];
  const r = ROT[dir], pts = [];
  for(const v of listaDe(id)){
    if(passo && v.g === passo && v.z === 0) continue;
    const [x, y] = r(v.x, v.y);
    pts.push({x, y, z: v.z, c: raro ? dourado(v.c) : v.c});
  }
  pts.sort((a, b) => (a.x + a.y + a.z) - (b.x + b.y + b.z));
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for(const p of pts){
    p.sx = (p.x - p.y) * 2; p.sy = (p.x + p.y) - p.z * 2;
    x0 = Math.min(x0, p.sx - 2); x1 = Math.max(x1, p.sx + 2); y0 = Math.min(y0, p.sy); y1 = Math.max(y1, p.sy + 4);
  }
  const cv = document.createElement('canvas');
  cv.width = x1 - x0; cv.height = y1 - y0;
  const ctx = cv.getContext('2d');
  for(const p of pts) pintaVoxel(ctx, p.sx - x0, p.sy - y0, p.c);
  return spritesCache[k] = {cv, ax: -x0, ay: -y0, w: cv.width, h: cv.height};
}
