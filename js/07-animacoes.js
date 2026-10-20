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
/* ---------- HERÓIS (corpo em pé com volume: luz vindo de cima à esquerda) ---------- */
const hexRGB = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
// k > 0 clareia, k < 0 escurece (cores em #rrggbb)
function shade(h, k){ const [r, g, b] = hexRGB(h), t = k > 0 ? 255 : 0, a = Math.abs(k); return `rgb(${r + (t - r)*a | 0},${g + (t - g)*a | 0},${b + (t - b)*a | 0})`; }
// Esfera com brilho e sombra
function sphere(x, y, r, c){ const g = ctx.createRadialGradient(x - r*.35, y - r*.45, r*.08, x, y, r*1.05); g.addColorStop(0, shade(c, .5)); g.addColorStop(.5, c); g.addColorStop(1, shade(c, -.6)); ctx.fillStyle = g; circ(x, y, r); }
// Degradê de cilindro (claro à esquerda, escuro à direita)
function cyl(x0, x1, c){ const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, shade(c, .35)); g.addColorStop(.45, c); g.addColorStop(1, shade(c, -.55)); return g; }
function rrect(x, y, w, h, r){ ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); ctx.fill(); }
// Pose comum: espelha o corpo para o lado que olha; la = ângulo do braço já espelhado
function heroPose(h, ang){
  const a = ang === undefined ? h.face : ang;
  return {fx: Math.cos(a) >= 0 ? 1 : -1, la: Math.atan2(Math.sin(a), Math.abs(Math.cos(a))),
    walk: h.moving ? Math.sin(h.walkT*12) : 0, bob: h.moving ? Math.abs(Math.cos(h.walkT*12))*1.6 : Math.sin(T*2.2)*.5};
}
function heroLegs(walk, pants, boot){
  ctx.lineCap = 'round';
  for(const s of [-1, 1]){
    const fx = s*3 + walk*s*5, back = s < 0;
    ctx.strokeStyle = cyl(fx - 3, fx + 3, back ? shade(pants, -.25) : pants); ctx.lineWidth = 5.5; line(s*3, -14, fx, -1);
    ctx.fillStyle = back ? shade(boot, -.3) : boot; ell(fx + 1.5, 1, 4.2, 2.6);
  }
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
  } else if(h.invul > 0) ctx.globalAlpha *= .6 + .4*Math.sin(T*40);
  const war = isWar(), gc = war ? '224,87,74' : isMage() ? '255,150,50' : '155,216,74';
  if(h.cast){ const k = Math.sin(clamp(h.cast.t/h.cast.dur, 0, 1)*Math.PI); const g = ctx.createRadialGradient(0, -18, 4, 0, -18, 40); g.addColorStop(0, `rgba(${gc},${.45*k})`); g.addColorStop(1, `rgba(${gc},0)`); ctx.fillStyle = g; circ(0, -18, 40); }
  if(war) drawWarrior(h); else if(isMage()) drawMage(h); else drawArcher(h);
  ctx.restore();
}
function drawMage(h){
  const p = heroPose(h), hit = h.hit > 0, W = c => hit ? '#ffffff' : c;
  const CL = CLOAKS[(S.char && S.char.color) || 0] || CLOAKS[0];
  ctx.save(); ctx.scale(p.fx, 1);
  heroLegs(p.walk*.6, W('#3a2e26'), W('#2a1f18'));
  ctx.translate(0, -p.bob);
  // manto longo até os pés
  ctx.fillStyle = cyl(-12, 12, W(CL.a)); ctx.beginPath(); ctx.moveTo(-6.5, -31); ctx.lineTo(6.5, -31); ctx.lineTo(12, -1 + p.walk); ctx.quadraticCurveTo(0, 2, -12, -1 - p.walk); ctx.closePath(); ctx.fill();
  ctx.fillStyle = cyl(-5, 5, W(CL.b)); ctx.beginPath(); ctx.moveTo(-3.5, -30); ctx.lineTo(3.5, -30); ctx.lineTo(4.5, 0); ctx.lineTo(-4.5, 0); ctx.fill();
  ctx.fillStyle = W('#c9a24a'); rrect(-7.5, -18, 15, 2.4, 1); sphere(0, -16.8, 1.8, W('#ff8a2b'));
  // gola e rosto com barba
  sphere(-.3, -30.5, 6, W(CL.h));
  sphere(2.5, -35, 4.7, W('#d2a580'));
  ctx.fillStyle = W('#e8e2d8'); ctx.beginPath(); ctx.moveTo(.5, -33.5); ctx.quadraticCurveTo(5.5, -33, 6.5, -31); ctx.quadraticCurveTo(4, -26, 1.5, -28.5); ctx.fill();
  ctx.fillStyle = '#1b1410'; circ(5, -36, .9);
  // chapéu pontudo
  ctx.fillStyle = cyl(-11, 11, W(CL.h)); ell(0, -38.5, 10.5, 3);
  ctx.fillStyle = cyl(-7, 7, W(CL.h)); ctx.beginPath(); ctx.moveTo(-6.5, -39); ctx.quadraticCurveTo(-2, -52, 5 - p.walk, -56); ctx.quadraticCurveTo(2, -48, 6.5, -39); ctx.closePath(); ctx.fill();
  ctx.fillStyle = W('#c9a24a'); rrect(-6.5, -41.5, 13, 2.2, 1);
  // braço com cajado: ergue ao lançar
  let raise = 0;
  if(h.atk && !h.atk.rel) raise = .5*clamp(h.atk.t/(h.atk.dur*.55), 0, 1);
  if(h.cast && !h.cast.done) raise = clamp(h.cast.t/(h.cast.dur*.6), 0, 1);
  ctx.save(); ctx.translate(4, -26); ctx.rotate(p.la*.6 - .25 - raise*.9);
  ctx.lineCap = 'round'; ctx.strokeStyle = W(shade(CL.a, -.1)); ctx.lineWidth = 4; line(0, 0, 9, 0);
  sphere(10, 0, 2.2, W('#d2a580'));
  ctx.rotate(-1.35);
  const eq = S.eq.bow, wood = eq && eq.rar ? RAR[eq.rar].c : '#7a5232';
  ctx.strokeStyle = cyl(-2, 2, '#6b4a2b'); ctx.lineWidth = 3; line(-14, 10, 22, 10);
  ctx.strokeStyle = wood; ctx.lineWidth = 1.2; line(-12, 10, 20, 10);
  // orbe de fogo na ponta
  const glow = .65 + .35*Math.sin(T*6) + raise*.5, og = ctx.createRadialGradient(25, 10, 1, 25, 10, 12*glow + 4);
  og.addColorStop(0, 'rgba(255,245,200,1)'); og.addColorStop(.35, 'rgba(255,160,50,.9)'); og.addColorStop(1, 'rgba(255,70,20,0)');
  ctx.fillStyle = og; circ(25, 10, 12*glow + 4);
  ctx.restore();
  ctx.lineCap = 'butt';
  ctx.restore();
}
function drawArcher(h){
  const p = heroPose(h), hit = h.hit > 0, W = c => hit ? '#ffffff' : c;
  const CL = CLOAKS[(S.char && S.char.color) || 0] || CLOAKS[0];
  ctx.save(); ctx.scale(p.fx, 1);
  heroLegs(p.walk, W('#4a3826'), W('#2b2017'));
  ctx.translate(0, -p.bob);
  // aljava nas costas
  ctx.save(); ctx.translate(-7, -25); ctx.rotate(-.4);
  ctx.fillStyle = cyl(-4, 4, W('#6b4a2b')); rrect(-3.5, -8, 7, 17, 2.5);
  ctx.fillStyle = '#e4ddc9'; for(let i = 0; i < 3; i++) rrect(-3 + i*2.3, -13, 1.8, 6, .8);
  ctx.restore();
  // capa
  ctx.fillStyle = cyl(-10, 10, W(CL.a)); ctx.beginPath(); ctx.moveTo(-7, -31); ctx.lineTo(7, -31); ctx.lineTo(10.5, -8); ctx.quadraticCurveTo(0, -5 + p.walk, -10.5, -8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = cyl(-6, 6, W(CL.b)); ctx.beginPath(); ctx.moveTo(-6, -31); ctx.lineTo(6, -31); ctx.lineTo(3, -16); ctx.lineTo(-3, -16); ctx.fill();
  ctx.fillStyle = W('#5a3a22'); rrect(-8.5, -16, 17, 2.8, 1); ctx.fillStyle = '#c9a24a'; rrect(-1.5, -16.3, 3, 3.4, .8);
  // cabeça: capuz e rosto
  sphere(-.5, -37, 7.6, W(CL.h));
  sphere(3, -35.5, 4.6, W('#c99a78'));
  ctx.fillStyle = '#1b1410'; circ(5.4, -36.4, .9);
  ctx.fillStyle = shade(CL.h, -.35); ctx.beginPath(); ctx.arc(-.5, -37, 7.6, Math.PI*.95, Math.PI*1.65); ctx.lineTo(-.5, -37); ctx.fill();
  // braços e arco apontando para o alvo
  let pull = 0, raise = 0, kind = 'arrow';
  if(h.atk && !h.atk.rel) pull = clamp(h.atk.t/(h.atk.dur*.55), 0, 1);
  if(h.cast){ pull = h.cast.done ? 0 : clamp(h.cast.t/(h.cast.dur*.6), 0, 1); raise = h.cast.id === 'rain' ? 1 : 0; kind = h.cast.id; }
  const eq = S.eq.bow, bowCol = eq ? (eq.rar ? RAR[eq.rar].c : '#9a6a36') : '#7a5a3a';
  ctx.save(); ctx.translate(2, -27); ctx.rotate(p.la - raise*.9);
  const bx = 16, sx = bx - 3 - pull*10;
  ctx.lineCap = 'round'; ctx.strokeStyle = W(shade(CL.a, -.15)); ctx.lineWidth = 3.6;
  line(0, 1.5, sx, 0); line(0, -1, bx, 0);
  sphere(bx, 0, 2.3, W('#c99a78')); sphere(sx, 0, 2.1, W('#c99a78'));
  ctx.strokeStyle = bowCol; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(bx - 2, -15); ctx.quadraticCurveTo(bx + 10 - pull*2, 0, bx - 2, 15); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; ctx.stroke();
  if(eq && eq.rar >= 2){ ctx.strokeStyle = RAR[eq.rar].c + (eq.rar === LEG_R ? '5a' : '40'); ctx.lineWidth = 7; ctx.stroke(); }
  ctx.strokeStyle = '#e8e2d0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx - 2, -15); ctx.lineTo(sx, 0); ctx.lineTo(bx - 2, 15); ctx.stroke();
  if(pull > .05){
    const ac = kind === 'arrow' ? '#d9d4c7' : '#b8f070';
    ctx.strokeStyle = ac; ctx.lineWidth = 2; line(sx, 0, sx + 22, 0);
    ctx.fillStyle = ac; ctx.beginPath(); ctx.moveTo(sx + 26, 0); ctx.lineTo(sx + 20, -3); ctx.lineTo(sx + 20, 3); ctx.fill();
    if(kind !== 'arrow'){ ctx.fillStyle = 'rgba(184,240,112,.35)'; circ(sx + 24, 0, 6); }
  }
  ctx.restore();
  ctx.lineCap = 'butt';
  ctx.restore();
}
function drawWarrior(h){
  const w = h.whirl, p = heroPose(h, w ? w.ang : undefined), hit = h.hit > 0, W = c => hit ? '#ffffff' : c;
  const CL = CLOAKS[(S.char && S.char.color) || 0] || CLOAKS[0], steel = '#9aa3ad';
  if(w){ ctx.strokeStyle = 'rgba(235,190,150,.28)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(0, -16, 30, 14, 0, 0, TAU); ctx.stroke(); }
  ctx.save();
  if(h.dash) ctx.rotate(Math.cos(h.face) >= 0 ? .22 : -.22);
  ctx.scale(p.fx, 1);
  heroLegs(p.walk, W('#6b737c'), W('#3a3530'));
  ctx.translate(0, -p.bob);
  // braço livre (sem escudo): punho fechado ao lado do corpo
  ctx.lineCap = 'round'; ctx.strokeStyle = W('#7c858f'); ctx.lineWidth = 4.4; line(-7, -27, -9 - p.walk*1.5, -17);
  sphere(-9 - p.walk*1.5, -16, 2.6, W('#a7b0ba'));
  // tronco: couraça e tabardo
  ctx.fillStyle = cyl(-10, 10, W('#8a939d')); rrect(-9, -32, 18, 19, 5);
  ctx.fillStyle = cyl(-6, 6, W(CL.b)); ctx.beginPath(); ctx.moveTo(-5.5, -27); ctx.lineTo(5.5, -27); ctx.lineTo(6.5, -7 + p.walk*.8); ctx.lineTo(-6.5, -7 - p.walk*.8); ctx.fill();
  ctx.fillStyle = W('#4a3524'); rrect(-9.5, -15.5, 19, 3, 1); ctx.fillStyle = '#d8c27a'; rrect(-1.6, -16, 3.2, 4, .8);
  // ombreiras
  sphere(-8, -29.5, 5.2, W('#a7b0ba')); sphere(8, -29.5, 5.2, W('#a7b0ba'));
  // elmo com crista
  ctx.fillStyle = cyl(-6, 6, W(CL.b)); ctx.beginPath(); ctx.moveTo(-1, -45); ctx.quadraticCurveTo(-10, -50, -12, -39); ctx.quadraticCurveTo(-6, -44, -1, -41.5); ctx.fill();
  sphere(.5, -38.5, 7.4, W(steel));
  ctx.fillStyle = '#15181c'; rrect(1.5, -40, 6.2, 2.4, 1); rrect(4, -40, 1.4, 6, .6);
  // braço da espada: prepara, corta e gira
  let arm = p.la + .55;
  if(w) arm = p.la;
  else if(h.atk && !h.atk.rel) arm = p.la - 1.7*clamp(h.atk.t/(h.atk.dur*.55), 0, 1);
  else if(h.swing > 0) arm = p.la - 1.7 + 2.5*clamp(1 - h.swing/.25, 0, 1);
  else if(h.cast && !h.cast.done) arm = p.la - 1.9*clamp(h.cast.t/(h.cast.dur*.6), 0, 1);
  const eq = S.eq.bow, glow = eq && eq.rar >= 2 ? RAR[eq.rar].c + (eq.rar === LEG_R ? '73' : '59') : null;
  ctx.save(); ctx.translate(6, -27); ctx.rotate(arm);
  ctx.lineCap = 'round'; ctx.strokeStyle = W('#7c858f'); ctx.lineWidth = 4.6; line(0, 0, 10, 0);
  sphere(11, 0, 2.9, W('#a7b0ba'));
  ctx.fillStyle = '#d8c27a'; rrect(11.5, -4.5, 2.6, 9, 1);
  const L = 24, bg = ctx.createLinearGradient(0, -2.2, 0, 2.2); bg.addColorStop(0, '#f4f7fa'); bg.addColorStop(.5, hit ? '#fff' : '#b3bcc6'); bg.addColorStop(1, '#5f6770');
  if(glow){ ctx.strokeStyle = glow; ctx.lineWidth = 8; line(15, 0, 13 + L, 0); }
  ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(14, -2.2); ctx.lineTo(13 + L - 5, -2.2); ctx.lineTo(13 + L, 0); ctx.lineTo(13 + L - 5, 2.2); ctx.lineTo(14, 2.2); ctx.fill();
  if(h.swing > 0 && !w){ ctx.strokeStyle = `rgba(255,240,220,${.5*h.swing/.25})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 32, -.9, .4); ctx.stroke(); }
  ctx.restore();
  ctx.lineCap = 'butt';
  ctx.restore();
}
/* ---------- CRIATURAS (em pé, de lado, com o mesmo volume dos heróis) ---------- */
// Desenhadas em "unidades de herói" (herói ≈ 13 de raio, 44 de altura) e escaladas por r/13. Os pés ficam em m.y + r*.6 (onde ficam a sombra e a marca do alvo).
// Detalhe de cada criatura (chapéu, chifres, ossos...): MON_DECO[tipo]
const MON_DECO = {rato:'rat', espantalho:'straw', zumbi:'zombie', lobo:'wolf', ent:'tree', sapo:'frog', sanguessuga:'leech', bruxa:'witch', esqueleto:'bones', ossudo:'bones',
  carnical:'ghoul', diabrete:'imp', brutamonte:'horns', cao:'wolf', goblin:'goblin', golem:'rock', lobogelo:'wolf', yeti:'fur', espirito:'ghost', escorpiao:'scorp',
  mumia:'wrap', cultista:'hood', cavaleiro:'knight', gargula:'wings', feiticeiro:'hood'};
// Altura do desenho em múltiplos do raio (barra de vida e brilho dos efeitos)
const MON_H = {biped:3.5, quad:2.2, spider:1.6, blob:1.9, ghost:2.6, scorp:2.6, wings:2.6};
const monH = m => (MON_H[MON_DECO[m.type]] || MON_H[m.d.kind] || 2.2)*m.r;
// Elipse com brilho e sombra (como sphere, mas achatada)
function egg(x, y, rx, ry, c){ const R = Math.max(rx, ry), g = ctx.createRadialGradient(x - rx*.35, y - ry*.45, R*.08, x, y, R*1.05); g.addColorStop(0, shade(c, .45)); g.addColorStop(.5, c); g.addColorStop(1, shade(c, -.6)); ctx.fillStyle = g; ell(x, y, rx, ry); }
// Olho que brilha
function eyeDot(x, y, r, c){ const a = ctx.globalAlpha; ctx.globalAlpha = a*.35; ctx.fillStyle = c; circ(x, y, r*2.4); ctx.globalAlpha = a; circ(x, y, r); ctx.fillStyle = 'rgba(255,255,255,.8)'; circ(x - r*.3, y - r*.3, r*.35); }
function drawMon(m){
  const d = m.d, r = m.r, s = r/13, fx = Math.cos(m.face) >= 0 ? 1 : -1, H = monH(m), foot = r*.6;
  ctx.save(); ctx.translate(m.x, m.y + foot);
  if(m.dead) ctx.globalAlpha = Math.max(0, 1 - m.deadT/1.6);
  ctx.fillStyle = 'rgba(0,0,0,.38)'; ell(0, 0, r*1.25, r*.42);
  if(m.elite && !m.dead){ ctx.strokeStyle = `rgba(111,156,255,${.55 + .3*Math.sin(T*5)})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0, -1, r*1.45, r*.55, 0, 0, TAU); ctx.stroke(); }
  ctx.save();
  if(m.dead) ctx.rotate(fx*Math.min(1, m.deadT*4)*1.45); // cai para a frente
  const ap = m.atkT > 0 ? Math.sin((1 - m.atkT/.36)*Math.PI) : 0;
  ctx.scale(fx*s, s);
  if(!d.ranged) ctx.translate(ap*7, 0);
  const hit = m.hit > 0, W = c => hit ? '#ffffff' : c;
  const P = {d, m, k:MON_DECO[m.type], c1:W(d.c1), c2:W(d.c2), eye:d.eye || '#ffcf5a', ap, hit, W,
    w: m.moving ? Math.sin(m.anim*11) : 0, bob: m.moving ? Math.abs(Math.cos(m.anim*11))*1.4 : Math.sin(T*2 + m.x)*.5};
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  (d.kind === 'quad' ? monQuad : d.kind === 'spider' ? monSpider : d.kind === 'blob' ? monBlob : monBiped)(P);
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
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
// Humanoides: pernas, tronco, cabeça e um braço que ataca (ou lança a magia)
function monBiped(P){
  const {d, k, c1, c2, eye, w, bob, ap, W} = P, big = d.r >= 16, bony = k === 'bones';
  const lw = bony ? 2.6 : big ? 7 : 5.5;
  // pernas (a de trás mais escura)
  for(const sd of [-1, 1]){
    const back = sd < 0, fx = sd*3.2 + w*sd*5;
    ctx.strokeStyle = back ? shade(c1, -.35) : cyl(fx - 3, fx + 3, c1); ctx.lineWidth = lw;
    if(k === 'tree'){ ctx.lineWidth = 8; line(sd*3, -14, fx, 0); ctx.lineWidth = 2.5; line(fx, 0, fx + 4, 1); line(fx, 0, fx - 3, 1.5); continue; }
    line(sd*3.2, -14, fx, -1.5);
    ctx.fillStyle = back ? shade(c1, -.5) : shade(c1, -.3); ell(fx + 1.5, 0, bony ? 2.6 : 4.2, 2.4);
  }
  ctx.translate(0, -bob);
  const top = big ? -36 : -31, hy = big ? top - 6 : top - 5.5, hr = big ? 8 : 6.6, hx = 1.5;
  // asas do diabrete (atrás de tudo)
  if(k === 'imp'){ const f = Math.sin(T*10)*3; ctx.fillStyle = shade(c1, -.35); ctx.beginPath(); ctx.moveTo(-3, top + 4); ctx.lineTo(-17, top - 9 - f); ctx.lineTo(-14, top + 2); ctx.lineTo(-19, top + 6 - f*.5); ctx.lineTo(-4, top + 12); ctx.fill(); }
  // braço de trás
  ctx.strokeStyle = shade(c1, -.3); ctx.lineWidth = bony ? 2.4 : big ? 5.5 : 4.2;
  const bx = -7 - w*2, by = top + 15;
  line(-5, top + 4, bx, by); ctx.fillStyle = shade(c2, -.25); circ(bx, by + 1, bony ? 1.6 : 2.4);
  // tronco
  if(bony){
    ctx.strokeStyle = W(c2); ctx.lineWidth = 2.2; line(0, top, 0, -14);
    for(let i = 0; i < 4; i++){ const y = top + 3 + i*3.6; ctx.beginPath(); ctx.ellipse(0, y, 5.5 - i*.6, 1.6, 0, Math.PI*.05, Math.PI*.95); ctx.stroke(); }
    ctx.fillStyle = shade(c1, -.1); ell(0, -14, 5, 2.4);
  } else if(k === 'rock'){
    const g = cyl(-12, 12, c1); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-12, top + 4); ctx.lineTo(-8, top - 2); ctx.lineTo(8, top - 3); ctx.lineTo(13, top + 6); ctx.lineTo(10, -12); ctx.lineTo(-10, -12); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.2; line(-5, top + 2, -2, top + 10); line(-2, top + 10, -6, top + 16); line(6, top + 6, 3, top + 14);
    const gl = .6 + .4*Math.sin(T*3 + P.m.anim); ctx.globalAlpha *= gl; eyeDot(2, top + 12, 2.6, eye); ctx.globalAlpha /= gl;
  } else {
    const tw = big ? 11 : 8;
    ctx.fillStyle = cyl(-tw - 2, tw + 2, c1);
    if(k === 'witch' || k === 'hood'){ ctx.beginPath(); ctx.moveTo(-5, top); ctx.lineTo(5, top); ctx.lineTo(9 + w, -3); ctx.quadraticCurveTo(0, 0, -9 - w, -3); ctx.closePath(); ctx.fill(); }
    else rrect(-tw, top - 1, tw*2, -top - 12, big ? 7 : 5);
    if(k === 'knight'){ ctx.fillStyle = cyl(-8, 8, c2); rrect(-7, top + 1, 14, 12, 4); sphere(-tw + 1, top + 2, 5, c2); }
    else if(k === 'fur'){ ctx.fillStyle = shade(c2, .1); for(let i = 0; i < 5; i++) ell(-tw + 2 + i*(tw*.45), -12.5, 2.6, 3.4); egg(2, top + 10, tw*.6, 8, c2); }
    else if(k === 'wrap'){ ctx.strokeStyle = shade(c1, -.25); ctx.lineWidth = 1.2; for(let i = 0; i < 4; i++) line(-tw + 1, top + 3 + i*4.4, tw - 1, top + 1 + i*4.4 + 2); }
    else if(k === 'tree'){ ctx.strokeStyle = shade(c1, -.4); ctx.lineWidth = 1.4; line(-4, top + 2, -2, -14); line(4, top + 4, 3, -14); egg(3, top + 4, 6, 4, c2); }
    else if(k === 'straw'){ ctx.fillStyle = W('#5a3a22'); rrect(-tw - .5, -17, tw*2 + 1, 2.6, 1); ctx.strokeStyle = W('#e0c870'); ctx.lineWidth = 1.3; for(let i = -1; i <= 1; i++) line(i*3, -14, i*4, -9); }
    else if(k !== 'witch' && k !== 'hood') egg(2, top + 9, tw*.62, 6, c2);
    if(k === 'hood' || k === 'witch'){ ctx.fillStyle = W('#c9a24a'); rrect(-6.5, -18, 13, 2.2, 1); }
  }
  // cabeça
  if(k === 'hood'){
    sphere(hx - 1, hy, hr*1.15, c1);
    ctx.fillStyle = '#0c0910'; ell(hx + 2.4, hy + 1, hr*.55, hr*.7);
    eyeDot(hx + 3.6, hy, 1.2, eye); eyeDot(hx + 1.2, hy, 1, eye);
  } else if(k === 'knight'){
    sphere(hx, hy, hr, c2);
    ctx.fillStyle = '#100c14'; rrect(hx + 1, hy - 1.5, hr*.95, 2.4, 1);
    eyeDot(hx + hr*.6, hy - .3, 1, eye);
    ctx.strokeStyle = W(shade(eye, -.2)); ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(hx - 1, hy - hr); ctx.quadraticCurveTo(hx - 8, hy - hr - 6, hx - 12, hy - 2); ctx.stroke();
  } else if(k === 'rock'){
    egg(hx, hy + 2, hr*.9, hr*.75, c2);
    eyeDot(hx + 3.5, hy + 1.5, 1.4, eye);
  } else {
    sphere(hx, hy, hr, k === 'tree' ? c1 : c2);
    if(bony){ ctx.fillStyle = '#15100c'; circ(hx + 3, hy - .5, 1.9); circ(hx - .5, hy - .5, 1.6); ctx.fillRect(hx + 1, hy + 3.5, 4, 1.2); eyeDot(hx + 3, hy - .5, .9, eye); eyeDot(hx - .5, hy - .5, .8, eye); }
    else { eyeDot(hx + hr*.5, hy - 1, Math.max(1, hr*.17), eye); eyeDot(hx + hr*.05, hy - 1, Math.max(.9, hr*.14), eye); }
    if(k === 'zombie' || k === 'wrap'){ ctx.strokeStyle = shade(k === 'wrap' ? c2 : c1, -.25); ctx.lineWidth = 1.1; line(hx - hr*.8, hy - 2.5, hx + hr*.8, hy - 3.5); line(hx - hr*.9, hy + 2, hx + hr*.7, hy + 1); }
    if(k === 'goblin'){ ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(hx - 3, hy - 2); ctx.lineTo(hx - 13, hy - 6); ctx.lineTo(hx - 3, hy + 2.5); ctx.fill(); ctx.fillStyle = shade(c2, -.1); ell(hx + hr + .5, hy + 1, 2.6, 1.8); }
    if(k === 'fur' || k === 'ghoul'){ ctx.fillStyle = '#f2ead8'; ctx.beginPath(); ctx.moveTo(hx + 2, hy + hr*.6); ctx.lineTo(hx + 3, hy + hr*.6 + 2.4); ctx.lineTo(hx + 4.2, hy + hr*.55); ctx.fill(); }
  }
  // chapéus, chifres e galhos
  if(k === 'witch'){ ctx.fillStyle = cyl(-11, 11, c1); ell(hx, hy - hr*.55, 11, 2.8); ctx.beginPath(); ctx.moveTo(hx - 6, hy - hr*.6); ctx.quadraticCurveTo(hx - 2, hy - 20, hx - 8 - w, hy - 24); ctx.quadraticCurveTo(hx + 2, hy - 16, hx + 6, hy - hr*.6); ctx.closePath(); ctx.fill(); }
  else if(k === 'straw'){ ctx.fillStyle = W('#7a5a26'); ell(hx, hy - hr*.5, 12, 2.6); ctx.fillStyle = cyl(-6, 6, W('#9a7a36')); ctx.beginPath(); ctx.moveTo(hx - 6.5, hy - hr*.55); ctx.lineTo(hx + 1, hy - hr - 8); ctx.lineTo(hx + 6.5, hy - hr*.55); ctx.fill(); }
  else if(k === 'horns' || k === 'imp'){ ctx.fillStyle = W('#e8dcc0'); for(const sd of [-1, 1]){ const x0 = hx + sd*hr*.45; ctx.beginPath(); ctx.moveTo(x0 - 2, hy - hr*.7); ctx.quadraticCurveTo(x0 + sd*3, hy - hr - 4, x0 + sd*1.5, hy - hr - 8); ctx.quadraticCurveTo(x0 + sd*5, hy - hr - 2, x0 + 2.2, hy - hr*.6); ctx.fill(); } }
  else if(k === 'tree'){ ctx.strokeStyle = shade(d.c1, -.2); ctx.lineWidth = 2.4; line(hx - 2, hy - hr*.7, hx - 7, hy - hr - 9); line(hx + 2, hy - hr*.8, hx + 6, hy - hr - 7); ctx.lineWidth = 1.5; line(hx - 5, hy - hr - 5, hx - 10, hy - hr - 6); egg(hx - 7, hy - hr - 10, 5, 3.6, c2); egg(hx + 6.5, hy - hr - 8, 4.4, 3.2, c2); }
  // braço da frente: prepara e golpeia; quem ataca de longe ergue o braço com a magia (ou o arco)
  let a = 1.25 + w*.3;
  if(k === 'zombie' || k === 'wrap') a = .2 + w*.08 - ap*.5;
  else if(d.ranged) a = 1.25 - 1.15*ap;
  else if(ap > 0) a = 1.25 - 2.2*ap + (ap > .7 ? (ap - .7)*4 : 0);
  const L = big ? 13 : 10;
  ctx.save(); ctx.translate(5, top + 4); ctx.rotate(a);
  ctx.strokeStyle = cyl(-2, 2, c1); ctx.lineWidth = bony ? 2.6 : big ? 6 : 4.4; line(0, 0, L, 0);
  if(k === 'rock' || k === 'fur') sphere(L, 0, big ? 4.2 : 3, k === 'rock' ? c1 : c2); else sphere(L, 0, bony ? 1.8 : 2.5, c2);
  if(k === 'knight'){ ctx.fillStyle = W('#d8c27a'); rrect(L - 1, -4, 2.4, 8, 1); const g = ctx.createLinearGradient(0, -2, 0, 2); g.addColorStop(0, '#f4f7fa'); g.addColorStop(1, '#5f6770'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(L + 1.5, -2); ctx.lineTo(L + 21, -2); ctx.lineTo(L + 25, 0); ctx.lineTo(L + 21, 2); ctx.lineTo(L + 1.5, 2); ctx.fill(); }
  else if(k === 'goblin'){ ctx.strokeStyle = W('#6b4a2b'); ctx.lineWidth = 2; line(L, 0, L + 13, 0); ctx.strokeStyle = W('#9aa3ad'); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(L + 13, -6); ctx.quadraticCurveTo(L + 16, 0, L + 13, 6); ctx.stroke(); }
  else if(k === 'straw'){ ctx.strokeStyle = W('#e0c870'); ctx.lineWidth = 1.2; for(let i = -1; i <= 1; i++) line(L, 0, L + 5, i*2.5); }
  else if(P.m.type === 'ossudo'){ ctx.strokeStyle = W(c2); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L - 1, -12); ctx.quadraticCurveTo(L + 8 - ap*2, 0, L - 1, 12); ctx.stroke(); ctx.strokeStyle = 'rgba(230,225,210,.7)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(L - 1, -12); ctx.lineTo(L - 1 - ap*8, 0); ctx.lineTo(L - 1, 12); ctx.stroke(); }
  else if(d.ranged){
    const R = 3 + ap*5 + Math.sin(T*6 + P.m.anim)*.6, g = ctx.createRadialGradient(L + 3, 0, .5, L + 3, 0, R*2);
    g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.35, d.ranged + 'cc'); g.addColorStop(1, d.ranged + '00');
    ctx.fillStyle = g; circ(L + 3, 0, R*2);
  }
  ctx.restore();
}
// Quadrúpedes (rato, lobos, carniçal, cão, gárgula): de lado, cabeça para a frente
function monQuad(P){
  const {k, c1, c2, eye, w, ap, W} = P, ph = [1, -1, -1, 1];
  // patas do lado de lá (mais escuras)
  ctx.strokeStyle = shade(c1, -.4); ctx.lineWidth = 3.4;
  [[9.5, 0], [-7.5, 1]].forEach(([lx], i) => { const o = w*4*ph[i]; line(lx, -8, lx + o, -.5); });
  // cauda
  if(P.d.tail || k === 'rat'){ ctx.strokeStyle = k === 'rat' ? W('#c49a8a') : cyl(-24, -12, c1); ctx.lineWidth = k === 'rat' ? 1.6 : k === 'wings' ? 2 : 3.6; ctx.beginPath(); ctx.moveTo(-12, -12); ctx.quadraticCurveTo(-21, -16 + w*3, -26, k === 'rat' ? -6 : -18 + w*2); ctx.stroke(); }
  // asas da gárgula
  if(k === 'wings'){ const f = Math.sin(T*(P.m.moving ? 14 : 5))*5; ctx.fillStyle = shade(c1, -.25); ctx.beginPath(); ctx.moveTo(-6, -17); ctx.lineTo(-14, -33 - f); ctx.lineTo(-4, -28 - f*.6); ctx.lineTo(4, -34 - f); ctx.lineTo(4, -18); ctx.fill(); ctx.strokeStyle = shade(c1, -.5); ctx.lineWidth = 1; line(-6, -17, -14, -33 - f); line(0, -18, 4, -34 - f); }
  // corpo
  egg(0, -12, 13.5, 7.2, c1);
  const a0 = ctx.globalAlpha; ctx.globalAlpha = a0*.55; egg(-1, -8.5, 9, 3.4, c2); ctx.globalAlpha = a0;
  if(k === 'ghoul'){ ctx.strokeStyle = shade(c1, -.35); ctx.lineWidth = 1.2; for(let i = 0; i < 3; i++) line(-5 + i*4, -18, -6 + i*4, -13); }
  if(k === 'wolf'){ ctx.fillStyle = shade(c1, -.2); for(let i = 0; i < 4; i++){ ctx.beginPath(); ctx.moveTo(-8 + i*4, -18.5); ctx.lineTo(-6.5 + i*4, -21.5); ctx.lineTo(-5 + i*4, -18.5); ctx.fill(); } }
  // patas do lado de cá
  ctx.strokeStyle = cyl(-2, 2, c1); ctx.lineWidth = 3.8;
  [[8, 2], [-9, 3]].forEach(([lx], i) => { const o = w*4*ph[i + 2]; line(lx, -9, lx + o, -.5); ctx.fillStyle = shade(c1, -.35); ell(lx + o + 1, 0, 2.6, 1.4); });
  // cabeça: sobe um pouco ao morder
  const hy = -17 - ap*2, hx = 14;
  if(k === 'rat'){ ctx.fillStyle = W('#c49a8a'); circ(hx - 2, hy - 5.5, 3); }
  else { ctx.fillStyle = shade(c1, -.25); ctx.beginPath(); ctx.moveTo(hx - 4.5, hy - 3); ctx.lineTo(hx - 2.5, hy - 11.5); ctx.lineTo(hx + .5, hy - 4); ctx.fill(); }
  if(k === 'wings'){ ctx.fillStyle = W('#d8d0c0'); ctx.beginPath(); ctx.moveTo(hx, hy - 4); ctx.quadraticCurveTo(hx + 1, hy - 10, hx - 2, hy - 12); ctx.quadraticCurveTo(hx + 4, hy - 9, hx + 2.5, hy - 3.5); ctx.fill(); }
  sphere(hx, hy, 6.6, c1);
  egg(hx + 5.5, hy + 1.8 + ap*1.2, 4.6, 3, c2);
  ctx.fillStyle = '#120c0a'; circ(hx + 9.6, hy + 1, 1.1);
  if(ap > .25){ ctx.fillStyle = '#2a0c0a'; ell(hx + 6, hy + 4.6, 3.6, 1.6 + ap*1.4); ctx.fillStyle = '#f4ecd8'; ctx.beginPath(); ctx.moveTo(hx + 7.5, hy + 3.6); ctx.lineTo(hx + 8.3, hy + 6); ctx.lineTo(hx + 9, hy + 3.6); ctx.fill(); }
  eyeDot(hx + 2.8, hy - 2, 1.25, eye);
}
// Aranhas e escorpião
function monSpider(P){
  const {k, c1, c2, eye, w, ap, W} = P, scorp = k === 'scorp';
  const legs = (back) => {
    ctx.strokeStyle = back ? shade(c1, -.45) : cyl(-2, 2, c1); ctx.lineWidth = scorp ? 2 : 2.3;
    for(let i = 0; i < 4; i++){ const o = w*2.5*((i + (back ? 1 : 0)) % 2 ? 1 : -1), bx = 4 - i*3 + (back ? 1.5 : 0), sp = (i - 1.5);
      ctx.beginPath(); ctx.moveTo(bx, -9); ctx.lineTo(bx + sp*6 + o, scorp ? -14 : -20); ctx.lineTo(bx + sp*10 + o*1.5, 0); ctx.stroke(); }
  };
  legs(true);
  if(scorp){
    // cauda em segmentos subindo por cima das costas, com ferrão que pica ao atacar
    const st = ap*6; let x = -9, y = -9;
    const pts = [[-15, -14], [-17, -22], [-13, -29 - st*.4], [-6 + st, -32 - st*.3]];
    for(const [px, py] of pts){ egg((x + px)/2, (y + py)/2, 3.6, 3.2, c1); x = px; y = py; }
    ctx.fillStyle = W('#2a1a10'); ctx.beginPath(); ctx.moveTo(x, y - 2); ctx.lineTo(x + 6, y + 3); ctx.lineTo(x + 1, y + 2.5); ctx.fill();
    egg(0, -8.5, 12, 5.2, c1); ctx.globalAlpha *= .6; egg(-1, -10, 7, 2.2, c2); ctx.globalAlpha /= .6;
    // pinças
    for(const sd of [0, 1]){ const px = 13 + ap*4 - sd*1.5, py = -7 + sd*1.5; ctx.strokeStyle = sd ? shade(c1, -.4) : cyl(-2, 2, c1); ctx.lineWidth = 2.6; line(8, -8, px, py); egg(px + 2.5, py, 3.6, 2.4, c1);
      ctx.strokeStyle = shade(c1, -.5); ctx.lineWidth = 1.2; line(px + 3, py - 1, px + 6.5 - ap*2, py - 2.5); }
    eyeDot(10.5, -11, 1, eye);
  } else {
    egg(-8, -11.5, 10, 8.6, c1);
    egg(-9, -15, 4.6, 2.8, c2);
    egg(5.5, -9, 6.6, 5.4, c1);
    ctx.strokeStyle = W(c2); ctx.lineWidth = 1.6; line(10.5, -7, 12 + ap*1.5, -3.5); line(9, -6.5, 10, -3);
    eyeDot(10.4, -11, 1.2, eye); eyeDot(8.6, -12.8, .9, eye); eyeDot(11.2, -9.2, .8, eye);
  }
  legs(false);
}
// Sapo, sanguessuga e espírito
function monBlob(P){
  const {m, k, c1, c2, eye, ap, W} = P; // o sapo não usa eye (tem olhos de sapo)
  if(k === 'ghost'){
    // flutua, com a cauda em fiapos e um núcleo claro
    const fy = -10 + Math.sin(T*3 + m.anim)*2, a0 = ctx.globalAlpha; ctx.globalAlpha = a0*.85;
    const g = ctx.createLinearGradient(0, fy - 14, 0, fy + 14); g.addColorStop(0, c2); g.addColorStop(1, c1 + '00');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-10, fy - 2); ctx.quadraticCurveTo(-10, fy - 16, 1, fy - 16); ctx.quadraticCurveTo(12, fy - 16, 11, fy - 2);
    for(let i = 0; i < 4; i++){ const x0 = 11 - i*5.5, wv = Math.sin(T*6 + i + m.anim)*2; ctx.quadraticCurveTo(x0 - 1.5, fy + 12 + wv, x0 - 5.5, fy + 4); }
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = a0*(.5 + .2*Math.sin(T*5)); ctx.fillStyle = '#ffffff'; ell(2, fy - 7, 5, 4.5); ctx.globalAlpha = a0;
    eyeDot(6, fy - 8, 1.5, eye); eyeDot(1.5, fy - 8, 1.3, eye);
    if(ap > 0){ const R = 3 + ap*5, gg = ctx.createRadialGradient(13, fy - 4, .5, 13, fy - 4, R*2); gg.addColorStop(0, '#ffffff'); gg.addColorStop(1, (P.d.ranged || '#bfe6ff') + '00'); ctx.fillStyle = gg; circ(13, fy - 4, R*2); }
    return;
  }
  if(k === 'leech'){
    // corpo em gomos que ondulam
    for(let i = 0; i < 5; i++){ const x = -12 + i*5.4, y = -5.5 - Math.abs(Math.sin(m.anim*(m.moving ? 9 : 3) - i*.9))*(m.moving ? 3 : 1.2) - i*.4; egg(x, y, 4.6 + (i === 4 ? .8 : 0), 4.2, i % 2 ? c1 : c2); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(x, y, 4.2, -1.2, 1.2); ctx.stroke(); }
    const hx = 10.5, hy = -8.5 - ap*2;
    ctx.fillStyle = W('#2a0c0c'); ell(hx + 3.5, hy + 1, 1.8 + ap*1.2, 2.6 + ap); ctx.strokeStyle = c2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(hx + 3.5, hy + 1, 2.2 + ap*1.2, 3 + ap, 0, 0, TAU); ctx.stroke();
    eyeDot(hx, hy - 3, 1.1, eye);
    return;
  }
  // sapo: amassa e estica ao pular
  const sq = 1 + Math.sin(m.anim*(m.moving ? 9 : 4))*.1, rx = 12.5*sq, ry = 9.5/sq, cy = -ry;
  ctx.fillStyle = shade(c1, -.35); ell(-8, -2, 5.5, 2.6); // pata de trás
  egg(0, cy, rx, ry, c1);
  egg(3, cy + ry*.38, rx*.62, ry*.45, c2);
  ctx.fillStyle = shade(c1, -.2); ell(8, -1.2, 3.6, 1.8);
  for(const [ex, er] of [[2, 2.8], [6.8, 3.3]]){ sphere(ex, cy - ry*.78, er, c1); ctx.fillStyle = W('#f4f0d8'); circ(ex + .6, cy - ry*.82, er*.6); ctx.fillStyle = '#100c08'; circ(ex + 1.1, cy - ry*.82, er*.32); }
  ctx.strokeStyle = shade(c1, -.5); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(4, cy + 1.5); ctx.quadraticCurveTo(9, cy + 4 + ap*3, 12.3*sq, cy + .5); ctx.stroke();
  if(ap > .3){ ctx.strokeStyle = W('#e07a8a'); ctx.lineWidth = 2; line(12*sq, cy + 1, 12*sq + ap*9, cy - 1); }
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
    const w = m.elite ? 44 : 32, y = m.y + m.r*.6 - monH(m) - 8;
    const bl = bleedLeft(m), fl = burnLeft(m);
    bar(m.x, y, w, 4, m.hp/m.hpMax, '#d4473b', Math.min(1, (poisonLeft(m) + bl + fl)/m.hpMax), undefined, fl > 0 ? '#ffb040' : bl > 0 ? '#ff9a7a' : '#9bd84a');
    if(m.elite){ ctx.fillStyle = '#9fbaff'; ctx.fillText(m.name, m.x, y - 5); }
  }
  if(hero.scale > .3 && hero.alpha > .1){
    const p = hero.hp/ST.life;
    bar(hero.x, hero.y - 64*hero.scale, 44, 6, p, p > .5 ? '#4fbf5a' : p > .3 ? '#d9b23a' : '#d4473b', 0, scene === 'map' ? S.cfg.ret/100 : undefined);
  }
}
function drawTown(){
  // casas
  const houses = [[60,70,150,110,'#5a2a22'],[250,40,200,120,'#3f2f4a'],[490,70,150,110,'#5a2a22']];
  for(const [x, y, w, h, roof] of houses){
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x + 8, y + h, w, 14);
    ctx.fillStyle = '#4a3f33'; ctx.fillRect(x, y + h*.45, w, h*.55);
    ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(x - 10, y + h*.5); ctx.lineTo(x + w/2, y); ctx.lineTo(x + w + 10, y + h*.5); ctx.fill();
    const glow = .6 + .2*Math.sin(T*3 + x);
    ctx.fillStyle = `rgba(255,190,90,${glow})`; ctx.fillRect(x + w*.2, y + h*.62, 16, 14); ctx.fillRect(x + w*.7, y + h*.62, 16, 14);
    ctx.fillStyle = '#2a2018'; ctx.fillRect(x + w/2 - 10, y + h*.68, 20, h*.32);
  }
  // fonte
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ell(FOUNT.x + 6, FOUNT.y - 32, 70, 34);
  ctx.fillStyle = '#5b554c'; ell(FOUNT.x, FOUNT.y - 40, 66, 34);
  ctx.fillStyle = '#2f5a78'; ell(FOUNT.x, FOUNT.y - 42, 54, 26);
  ctx.strokeStyle = 'rgba(160,220,255,.5)'; ctx.lineWidth = 1.5;
  for(let i = 0; i < 3; i++){ const k = ((T*.5 + i/3) % 1); ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.ellipse(FOUNT.x, FOUNT.y - 42, 8 + k*44, 4 + k*20, 0, 0, TAU); ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.fillStyle = '#6e675c'; ell(FOUNT.x, FOUNT.y - 50, 9, 6); ctx.fillRect(FOUNT.x - 5, FOUNT.y - 72, 10, 22);
  ctx.fillStyle = '#9fe0ff'; ell(FOUNT.x, FOUNT.y - 74, 6, 4);
  // mercador
  const mx = 140, my = 330;
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ell(mx + 8, my + 30, 60, 16);
  ctx.fillStyle = '#5a4430'; ctx.fillRect(mx - 46, my - 6, 92, 34);
  for(let i = 0; i < 6; i++){ ctx.fillStyle = i % 2 ? '#8a2f2a' : '#d8c9a2'; ctx.beginPath(); ctx.moveTo(mx - 54 + i*18, my - 10); ctx.lineTo(mx - 36 + i*18, my - 10); ctx.lineTo(mx - 30 + i*18, my - 40); ctx.lineTo(mx - 48 + i*18, my - 40); ctx.fill(); }
  ctx.fillStyle = '#7a5a3a'; ctx.fillRect(mx + 54, my + 4, 18, 18); ctx.fillRect(mx + 60, my - 12, 14, 14);
  ctx.fillStyle = '#4a2f4a'; circ(mx, my + 44, 10); ctx.fillStyle = '#c99a78'; circ(mx, my + 38, 5);
  // baú
  const bx = 560, by = 340;
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ell(bx + 4, by + 16, 28, 8);
  ctx.fillStyle = '#6b4a2b'; ctx.fillRect(bx - 22, by - 6, 44, 22); ctx.fillStyle = '#7d5a35'; ctx.fillRect(bx - 22, by - 14, 44, 10);
  ctx.fillStyle = '#e2ae4a'; ctx.fillRect(bx - 3, by - 6, 6, 8);
  // forja: fornalha de pedra com fogo e bigorna
  const fx = 600, fy = 250, fl = .75 + .25*Math.sin(T*9) + .1*Math.sin(T*23);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ell(fx + 6, fy + 34, 52, 12);
  const fg = ctx.createRadialGradient(fx, fy + 6, 2, fx, fy + 6, 70); fg.addColorStop(0, `rgba(255,140,50,${.35*fl})`); fg.addColorStop(1, 'rgba(255,140,50,0)'); ctx.fillStyle = fg; circ(fx, fy + 6, 70);
  ctx.fillStyle = cyl(fx - 28, fx + 28, '#5b554c'); rrect(fx - 28, fy - 26, 56, 46, 6);
  ctx.fillStyle = '#3e3a34'; ctx.fillRect(fx - 9, fy - 50, 18, 26);
  ctx.fillStyle = '#1a0f0a'; rrect(fx - 15, fy - 4, 30, 20, 8);
  ctx.fillStyle = `rgba(255,${120 + 60*fl | 0},40,${.9*fl})`; ell(fx, fy + 10, 11, 6*fl); ctx.fillStyle = '#ffe9a0'; ell(fx, fy + 12, 5, 3*fl);
  for(let i = 0; i < 3; i++){ const k = (T*.6 + i/3) % 1; ctx.globalAlpha = .4*(1 - k); ctx.fillStyle = '#6a625a'; circ(fx + Math.sin(T + i)*4, fy - 52 - k*30, 5 + k*6); } ctx.globalAlpha = 1;
  // bigorna
  ctx.fillStyle = '#2a2a2e'; ctx.fillRect(fx - 40, fy + 30, 8, 10); ctx.fillStyle = cyl(fx - 54, fx - 18, '#5a5c64'); ctx.beginPath(); ctx.moveTo(fx - 56, fy + 22); ctx.lineTo(fx - 20, fy + 22); ctx.lineTo(fx - 26, fy + 30); ctx.lineTo(fx - 48, fy + 30); ctx.closePath(); ctx.fill();
  // tochas
  for(const [tx, ty] of [[230,500],[470,500],[230,640],[470,640]]){
    const f = .8 + .2*Math.sin(T*14 + tx);
    const g = ctx.createRadialGradient(tx, ty - 22, 2, tx, ty - 22, 60); g.addColorStop(0, `rgba(255,170,70,${.35*f})`); g.addColorStop(1, 'rgba(255,170,70,0)');
    ctx.fillStyle = g; circ(tx, ty - 22, 60);
    ctx.fillStyle = '#3a2a1c'; ctx.fillRect(tx - 2, ty - 18, 4, 22);
    ctx.fillStyle = '#ffb347'; ell(tx, ty - 24, 4*f, 7*f); ctx.fillStyle = '#fff1b0'; ell(tx, ty - 22, 2, 3);
  }
  drawPortal(TPORT.x, TPORT.y, 1);
}
function drawPortal(x, y, k){
  const g = ctx.createRadialGradient(x, y - 22, 2, x, y - 22, 34*k); g.addColorStop(0, 'rgba(170,200,255,.9)'); g.addColorStop(.5, 'rgba(90,110,220,.55)'); g.addColorStop(1, 'rgba(60,40,160,0)');
  ctx.fillStyle = g; ell(x, y - 22, 22*k, 34*k);
  ctx.strokeStyle = '#a9c4ff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(x, y - 22, 16*k, 28*k, 0, 0, TAU); ctx.stroke();
  for(let i = 0; i < 4; i++){ const a = T*3 + i*TAU/4; ctx.fillStyle = '#dfe8ff'; circ(x + Math.cos(a)*14*k, y - 22 + Math.sin(a)*24*k, 1.6); }
}
// Orbe no chão: esfera brilhante com coluna de luz e nome
function drawOrbDrop(d){
  const O = ORBS[d.orb], b = Math.sin(T*3 + d.x)*2, y = d.y - 8 + b;
  const g = ctx.createLinearGradient(0, d.y - 80, 0, d.y); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, O.c + '88'); ctx.fillStyle = g; ctx.fillRect(d.x - 4, d.y - 80, 8, 80);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ell(d.x, d.y + 3, 7, 3);
  const h = ctx.createRadialGradient(d.x, y, 1, d.x, y, 14); h.addColorStop(0, O.c + 'aa'); h.addColorStop(1, O.c + '00'); ctx.fillStyle = h; circ(d.x, y, 14);
  sphere(d.x, y, 5.5, O.c);
  ctx.font = '700 11px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center';
  const tw = ctx.measureText(O.n).width;
  ctx.fillStyle = 'rgba(6,8,7,.85)'; ctx.fillRect(d.x - tw/2 - 4, d.y - 32, tw + 8, 15);
  ctx.fillStyle = O.c; ctx.fillText(O.n, d.x, d.y - 21);
}
function drawItemDrop(d){
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
function render(){
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = scene === 'town' ? '#17140f' : '#060807'; ctx.fillRect(0, 0, cw, ch);
  const z = zoom, hw = cw/2/z, hh = ch/2/z;
  const vx0 = cam.x - hw - 80, vx1 = cam.x + hw + 80, vy0 = cam.y - hh - 80, vy1 = cam.y + hh + 80;
  const vis = o => o.x > vx0 && o.x < vx1 && o.y > vy0 && o.y < vy1;
  ctx.save(); ctx.translate(cw/2, ch/2); ctx.scale(z, z); ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
  const pat = scene === 'town' ? townPat : groundPat;
  if(pat){ ctx.fillStyle = pat; ctx.fillRect(0, 0, WORLD.w, WORLD.h); }
  ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 16; ctx.strokeRect(-8, -8, WORLD.w + 16, WORLD.h + 16);
  if(scene === 'town') drawTown();
  else for(const o of decor) if(vis(o)) drawDecor(o);
  for(const c of clouds){
    const k = Math.min(1, c.t*3) * Math.min(1, (c.dur - c.t)*2), pul = 1 + Math.sin(T*6)*.04;
    // Nuvem ácida (verde) ou chão em chamas do Meteoro (laranja)
    const C0 = c.fire ? '255,150,50' : '155,216,74', C1 = c.fire ? '200,60,20' : '110,170,50', C2 = c.fire ? '120,30,10' : '90,140,40';
    const g = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, c.r*pul); g.addColorStop(0, `rgba(${C0},${.42*k})`); g.addColorStop(.7, `rgba(${C1},${.28*k})`); g.addColorStop(1, `rgba(${C2},0)`);
    ctx.fillStyle = g; ell(c.x, c.y, c.r*pul, c.r*.8*pul);
    ctx.strokeStyle = c.fire ? `rgba(255,200,120,${.5*k})` : `rgba(190,240,120,${.5*k})`; ctx.lineWidth = 1.5; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.ellipse(c.x, c.y, c.r, c.r*.8, T*.3, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  }
  // Áreas marcadas pelas criaturas: contorno + miolo que cresce até a hora do golpe
  for(const z of zones){
    const k = clamp(z.t/z.dur, 0, 1), pul = .5 + .5*Math.sin(T*(8 + k*16));
    ctx.globalAlpha = .14 + .1*k; ctx.fillStyle = z.c; ell(z.x, z.y, z.r, z.r*.75);
    ctx.globalAlpha = .35 + .3*k; ell(z.x, z.y, z.r*k, z.r*.75*k);
    ctx.globalAlpha = .55 + .35*pul; ctx.strokeStyle = z.c; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(z.x, z.y, z.r, z.r*.75, 0, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  for(const d of drops) if(vis(d)) drawItemDrop(d);
  for(const c of coins){ ctx.fillStyle = '#8a6420'; circ(c.x, c.y + 1, 3.6); ctx.fillStyle = '#e2ae4a'; circ(c.x, c.y, 3.4); ctx.fillStyle = '#ffe39a'; circ(c.x - 1, c.y - 1, 1.2); }
  for(const m of mons) if(m.dead && vis(m)) drawMon(m);
  if(scene === 'map') drawFocus();
  if(portal) drawPortal(portal.x, portal.y, clamp(portal.t/.6, 0, 1));
  const ents = mons.filter(m => !m.dead && vis(m)); ents.push(hero); ents.sort((a, b) => a.y - b.y);
  for(const e of ents) e === hero ? drawHero() : drawMon(e);
  for(const p of projs){
    if(p.hostile){ ctx.fillStyle = p.c; circ(p.x, p.y, 4.5); ctx.globalAlpha = .35; circ(p.x, p.y, 8); ctx.globalAlpha = 1; continue; }
    if(p.kind === 'ember' || p.kind === 'fireball'){
      // Fogo do Mago: núcleo claro com halo laranja
      const R = p.kind === 'fireball' ? 9 : 5, g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, R*2.2);
      g.addColorStop(0, 'rgba(255,245,200,1)'); g.addColorStop(.35, 'rgba(255,170,60,.9)'); g.addColorStop(1, 'rgba(255,80,20,0)');
      ctx.fillStyle = g; circ(p.x, p.y, R*2.2);
      continue;
    }
    const c = p.kind === 'arrow' ? '#e8e2d0' : p.kind === 'farrow' ? '#d8f07a' : '#9bd84a';
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
    if(p.kind === 'plague'){ ctx.fillStyle = `rgba(155,216,74,${.45 + .2*Math.sin(T*20)})`; ell(-2, 0, 22, 9); ctx.fillStyle = 'rgba(216,240,122,.5)'; circ(6, 0, 6); }
    else if(p.kind !== 'arrow'){ ctx.fillStyle = 'rgba(155,216,74,.35)'; ell(0, 0, 14, 5); }
    ctx.strokeStyle = c; ctx.lineWidth = 2; line(-14, 0, 4, 0);
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(3, -3.5); ctx.lineTo(3, 3.5); ctx.fill();
    ctx.fillStyle = '#c94a3a'; ctx.fillRect(-15, -2.5, 4, 5);
    ctx.restore();
  }
  for(const p of parts){
    const k = 1 - p.t/p.life; ctx.globalAlpha = Math.max(0, k);
    if(p.kind === 'streak'){ ctx.strokeStyle = p.c; ctx.lineWidth = p.size; line(p.x, p.y, p.x - p.vx*.04, p.y - p.vy*.04); }
    else if(p.kind === 'bubble'){ ctx.strokeStyle = p.c; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.stroke(); }
    else { ctx.fillStyle = p.c; circ(p.x, p.y, p.size*(.5 + .5*k)); }
  }
  ctx.globalAlpha = 1;
  for(const r of rings){ const k = r.t/r.life; ctx.globalAlpha = 1 - k; ctx.strokeStyle = r.c; ctx.lineWidth = r.w; ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r*k + 4, (r.r*k + 4)*.75, 0, 0, TAU); ctx.stroke(); }
  ctx.globalAlpha = 1;
  drawAim();
  drawBars(vis);
  ctx.textAlign = 'center';
  for(const t of texts){ ctx.globalAlpha = Math.min(1, (1 - t.t/.9)*1.6); ctx.font = `800 ${t.size}px "Alegreya Sans", sans-serif`; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.strokeText(t.s, t.x, t.y); ctx.fillStyle = t.c; ctx.fillText(t.s, t.x, t.y); }
  ctx.globalAlpha = 1;
  ctx.restore();
  // vinheta
  const vg = ctx.createRadialGradient(cw/2, ch/2, Math.min(cw, ch)*.28, cw/2, ch/2, Math.max(cw, ch)*.72);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, scene === 'map' && mapDef.decor === 'hell' ? 'rgba(40,6,0,.75)' : 'rgba(0,0,0,.7)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, cw, ch);
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
function frame(now){
  let dt = Math.min(.05, (now - last)/1000); last = now;
  for(let i = 0; i < S.speed; i++) step(dt);
  tickTrans(dt);
  render();
  uiT -= dt; if(uiT <= 0){ uiT = .1; updateHud(); }
  saveT -= dt; if(saveT <= 0){ saveT = 5; save(); }
  accountTick(dt);
  requestAnimationFrame(frame);
}
