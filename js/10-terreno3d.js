// O terreno em 3D: chão, lago, cerca e os animais andando juntos no canvas #terrenoCv da tela Animais.
// O canvas tem poucos pixels e é ampliado pelo CSS (image-rendering: pixelated). Tocar num animal abre a ficha dele.
'use strict';

const ANIMAIS_NA_TELA = 60;
const mundo = new Map(); // id do animal → {x, y, tx, ty, dir, passo, espera, tp, px, py}
let efeitos = [], terrenoN = 0, chaoCv = null, cercaCv = null, enfeites = [], humores = {}, humorT = 0, ultimoQuadro = 0;
const ladoTerreno = () => 56 + Math.min(24, S.espacosExtras * 2);
const margemTopo = () => 40;
const tamanhoCanvas = n => ({w: 4 * n + 12, h: 2 * n + margemTopo() + 16});
const projX = (x, y) => (x - y) * 2 + 2 * terrenoN + 6;
const projY = (x, y) => (x + y) + margemTopo();
const noLago = (x, y, f = 1) => {
  const a = (x - terrenoN * .76) / (terrenoN * .17 * f), b = (y - terrenoN * .24) / (terrenoN * .15 * f);
  return a * a + b * b < 1;
};
const AQUATICOS = {pato: 1, tartaruga: 1, jacare: 1, hipopotamo: 1, capivara: 1};

function preparaTerreno(){
  const n = ladoTerreno();
  if(n === terrenoN && chaoCv) return;
  terrenoN = n;
  const {w, h} = tamanhoCanvas(n);
  chaoCv = document.createElement('canvas'); chaoCv.width = w; chaoCv.height = h;
  cercaCv = document.createElement('canvas'); cercaCv.width = w; cercaCv.height = h;
  const c = chaoCv.getContext('2d'), f = cercaCv.getContext('2d');
  const VERDES = ['#6fae4b', '#79b853', '#649f44', '#73b24d'];
  for(let s = 0; s < 2 * n; s++) for(let x = 0; x < n; x++){
    const y = s - x;
    if(y < 0 || y >= n) continue;
    let cor = VERDES[hashV(x, y, 0) % 4];
    if(hashV(x, y, 2) === 0 && hashV(y, x, 5) < 3) cor = hashV(x, y, 7) < 8 ? '#f3e27a' : '#f2a6c4';
    if(noLago(x, y, 1.2)) cor = '#d9c98d';
    if(noLago(x, y)) cor = hashV(x, y, 4) < 3 ? '#6dbde8' : '#4c9fd6';
    c.fillStyle = cor; c.fillRect(projX(x, y) - 2, projY(x, y), 4, 2);
    if(x === n - 1 || y === n - 1){
      for(let z = 0; z < 4; z++){
        const sx = projX(x, y), sy = projY(x, y) + 2 + z * 2, m = z === 0 ? '#8a5e38' : '#6f4a2c';
        c.fillStyle = m; c.fillRect(sx - 2, sy, 2, 2);
        c.fillStyle = clarear(m, .7); c.fillRect(sx, sy, 2, 2);
      }
    }
  }
  const poste = (g, x, y) => { for(let z = 1; z <= 3; z++) pintaVoxel(g, projX(x, y), projY(x, y) - z * 2, '#a9764a'); };
  const tabua = (g, x, y) => pintaVoxel(g, projX(x, y), projY(x, y) - 4, '#c0905e');
  for(let i = 0; i < n; i++){
    tabua(c, i, 0); tabua(c, 0, i);
    if(i % 6 === 0){ poste(c, i, 0); poste(c, 0, i); }
  }
  for(let i = 0; i < n; i++){
    tabua(f, i, n - 1); tabua(f, n - 1, i);
    if(i % 6 === 0 || i === n - 1){ poste(f, i, n - 1); poste(f, n - 1, i); }
  }
  // enfeites fixos: entram na ordenação por profundidade junto com os animais
  const r = rng(n * 977), lista = [];
  for(let i = 0; i < 9; i++){
    const x = 3 + r() * (n - 8), y = 3 + r() * (n - 8);
    if(noLago(x, y, 1.5)) continue;
    lista.push({id: i % 3 === 2 ? '_pedra' : i % 3 === 1 ? '_arvore2' : '_arvore1', x: Math.floor(x), y: Math.floor(y)});
  }
  enfeites = lista;
}
const andaEm = (esp, x, y) => {
  if(esp === 'peixe') return noLago(x, y, .8);
  if(AQUATICOS[esp]) return true;
  return !noLago(x, y, 1.1);
};
function pontoLivre(esp){
  const n = terrenoN;
  for(let i = 0; i < 30; i++){
    const x = 4 + Math.random() * (n - 9), y = 4 + Math.random() * (n - 9);
    if(andaEm(esp, x, y)) return {x, y};
  }
  return {x: n * .76, y: n * .24};
}
function sincronizaMundo(){
  const vivos = new Set(S.animais.map(a => a.id));
  for(const id of mundo.keys()) if(!vivos.has(id)) mundo.delete(id);
  for(const a of S.animais){
    if(mundo.has(a.id)) continue;
    const p = pontoLivre(a.esp);
    mundo.set(a.id, {x: p.x, y: p.y, tx: p.x, ty: p.y, dir: Math.floor(Math.random() * 4), passo: 0, espera: Math.random() * 2, tp: 0});
  }
}
// Chamado pela caça: deixa uma caveirinha no lugar da presa
function efeitoDevorado(id){
  const m = mundo.get(id);
  if(m) efeitos.push({x: m.x, y: m.y, t: 3});
}
function atualizaHumores(agoraMs){
  if(agoraMs - humorT < 1000) return;
  humorT = agoraMs; humores = {};
  for(const e of especiesNoTerreno()) humores[e] = humor(e).total;
}
function move(a, m, dt, presaDe){
  const e = ESP[a.esp], triste = humores[a.esp] >= 40;
  const vel = (e.po <= 2 ? 7 : e.po <= 4 ? 5.5 : 4.5) * (triste ? .6 : 1);
  const c = casalDe(a.id);
  if(presaDe){ m.tx = presaDe.x; m.ty = presaDe.y; m.espera = 0; }
  else if(c && a.id === c.m && c.fase !== 'pronto' && mundo.get(c.f)){ const f = mundo.get(c.f); m.tx = f.x - 3; m.ty = f.y + 2; }
  if(m.espera > 0){ m.espera -= dt; m.passo = 0; return; }
  const dx = m.tx - m.x, dy = m.ty - m.y, d = Math.hypot(dx, dy);
  if(d < 1){
    const p = pontoLivre(a.esp);
    m.tx = p.x; m.ty = p.y; m.espera = (triste ? 2 : .7) + Math.random() * 3; m.passo = 0;
    return;
  }
  const nx = m.x + dx / d * vel * dt, ny = m.y + dy / d * vel * dt;
  if(!andaEm(a.esp, nx, ny)){ const p = pontoLivre(a.esp); m.tx = p.x; m.ty = p.y; m.espera = .3; m.passo = 0; return; }
  m.x = nx; m.y = ny;
  m.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 0 : 2) : (dy > 0 ? 1 : 3);
  m.tp += dt * 7;
  m.passo = Math.floor(m.tp) % 2 + 1;
}
/* Ícones em cima dos animais */
const ICONES = {
  coracao: {c: '#e8415f', p: ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...']},
  chuva: {c: '#6f8ea8', p: ['..###..', '.#####.', '#######', '.......', '.#..#..', '...#..#']},
  alerta: {c: '#d3232e', p: ['##', '##', '##', '##', '..', '##']},
  caveira: {c: '#f4f1e6', p: ['.#####.', '#######', '#..#..#', '#######', '.#.#.#.']},
};
function icone(ctx, nome, x, y){
  const ic = ICONES[nome];
  ctx.fillStyle = ic.c;
  ic.p.forEach((l, j) => { for(let i = 0; i < l.length; i++) if(l[i] === '#') ctx.fillRect(x + i - (l.length >> 1), y + j, 1, 1); });
}
function desenhaTerreno(tempoMs){
  const cv = $('#terrenoCv');
  if(!cv || !chaoCv) return;
  const {w, h} = tamanhoCanvas(terrenoN);
  if(cv.width !== w || cv.height !== h){ cv.width = w; cv.height = h; }
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(chaoCv, 0, 0);
  const itens = enfeites.map(e => ({e, x: e.x, y: e.y}));
  const lista = S.animais.slice(0, ANIMAIS_NA_TELA);
  for(const a of lista){ const m = mundo.get(a.id); if(m) itens.push({a, m, x: m.x, y: m.y}); }
  itens.sort((p, q) => (p.x + p.y) - (q.x + q.y));
  cv._clicaveis = [];
  const pisca = Math.floor(tempoMs / 500) % 2;
  for(const it of itens){
    if(it.e){
      const s = spriteDe(it.e.id, 0, 0);
      ctx.drawImage(s.cv, Math.round(projX(it.x, it.y) - s.ax), Math.round(projY(it.x, it.y) - s.ay));
      continue;
    }
    const {a, m} = it, s = spriteDe(a.esp, m.dir, m.passo), px = Math.round(projX(m.x, m.y)), py = Math.round(projY(m.x, m.y));
    const salto = m.passo === 1 ? 1 : 0, dx = px - s.ax, dy = py - s.ay - salto;
    if(a.esp !== 'peixe'){ ctx.fillStyle = 'rgba(30,50,25,.28)'; ctx.fillRect(px - (s.w >> 2), py + 1, s.w >> 1, 2); }
    ctx.drawImage(s.cv, dx, dy);
    cv._clicaveis.push({id: a.id, x: dx, y: dy, w: s.w, h: s.h});
    const c = casalDe(a.id), top = dy - 8;
    if(c && a.id === c.f && c.fase !== 'pronto' && pisca) icone(ctx, 'coracao', px, top);
    else if(ESP[a.esp].caca && m.alvo && pisca) icone(ctx, 'alerta', px, top);
    else if(humores[a.esp] >= 40 && pisca) icone(ctx, 'chuva', px, top);
  }
  ctx.drawImage(cercaCv, 0, 0);
  for(const e of efeitos) if(e.t > 0) icone(ctx, 'caveira', Math.round(projX(e.x, e.y)), Math.round(projY(e.x, e.y)) - 8 - Math.round((3 - e.t) * 2));
}
function quadroTerreno(tempoMs){
  requestAnimationFrame(quadroTerreno);
  if(tempoMs - ultimoQuadro < 33 || !accountReady || aba !== 'animais' || !$('#terrenoCv')) return;
  const dt = Math.min(.25, (tempoMs - ultimoQuadro) / 1000);
  ultimoQuadro = tempoMs;
  preparaTerreno();
  sincronizaMundo();
  atualizaHumores(tempoMs);
  const parado = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const presasNoTerreno = S.animais.filter(a => ESP[a.esp].po <= 4 && mundo.has(a.id));
  for(const a of S.animais.slice(0, ANIMAIS_NA_TELA)){
    const m = mundo.get(a.id);
    if(!m) continue;
    let alvo = null;
    if(ESP[a.esp].caca && idadeDe(a) >= IDADE_FERTIL && !(a.comeu && agora() - a.comeu < FOME)){
      const p = presasNoTerreno.find(b => come(a.esp, b.esp));
      if(p) alvo = mundo.get(p.id);
    }
    m.alvo = !!alvo;
    if(!parado) move(a, m, dt, alvo);
  }
  for(const e of efeitos) e.t -= dt;
  if(!desenhaRealista(tempoMs, dt)) desenhaTerreno(tempoMs);
  efeitos = efeitos.filter(e => e.t > 0);
}
document.addEventListener('click', e => {
  if(e.target.id !== 'terrenoCv' || !e.target._clicaveis) return;
  const cv = e.target, r = cv.getBoundingClientRect();
  const x = (e.clientX - r.left) * cv.width / r.width, y = (e.clientY - r.top) * cv.height / r.height;
  const lista = cv._clicaveis;
  for(let i = lista.length - 1; i >= 0; i--){
    const a = lista[i];
    if(x >= a.x - 2 && x <= a.x + a.w + 2 && y >= a.y - 2 && y <= a.y + a.h + 2) return ACT.verAnimal(a.id);
  }
});
