// Animações: desenho do herói, monstros, mundo e efeitos (render) e o loop frame().
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- DESENHO ---------- */
function ell(x, y, rx, ry){ ctx.beginPath(); ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, TAU); ctx.fill(); }
function circ(x, y, r){ ctx.beginPath(); ctx.arc(x, y, Math.max(.1, r), 0, TAU); ctx.fill(); }
function line(x1, y1, x2, y2){ ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
function drawDecor(o){
  const x = o.x, y = o.y, s = o.s;
  switch(o.t){
    case 'rock': ctx.fillStyle = 'rgba(0,0,0,.3)'; ell(x+3, y+4, 12*s, 6*s); ctx.fillStyle = mapDef.decor === 'hell' ? '#3a2420' : '#57564f'; ell(x, y, 11*s, 8*s); ctx.fillStyle = mapDef.decor === 'hell' ? '#4e302a' : '#727067'; ell(x - 3*s, y - 3*s, 5*s, 3*s); break;
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
function drawHero(){
  const h = hero; if(h.alpha <= 0 || h.scale <= 0) return;
  ctx.save(); ctx.translate(h.x, h.y); ctx.globalAlpha = h.alpha; ctx.scale(h.scale, h.scale);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ell(0, 9, 14, 6);
  if(h.cast){ const k = Math.sin(clamp(h.cast.t/h.cast.dur, 0, 1)*Math.PI); const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 34); g.addColorStop(0, `rgba(155,216,74,${.5*k})`); g.addColorStop(1, 'rgba(155,216,74,0)'); ctx.fillStyle = g; circ(0, 0, 34); }
  const bob = h.moving ? Math.sin(h.walkT*13)*1.2 : 0;
  ctx.translate(0, bob); ctx.rotate(h.face);
  const lp = h.moving ? Math.sin(h.walkT*13)*5 : 0;
  ctx.fillStyle = '#2b2017'; ell(lp, -5, 4.5, 3); ell(-lp, 5, 4.5, 3);
  // aljava
  ctx.fillStyle = '#6b4a2b'; ctx.save(); ctx.rotate(.5); ctx.fillRect(-15, -4, 9, 8); ctx.fillStyle = '#d9d4c7'; ctx.fillRect(-18, -3, 3, 2); ctx.fillRect(-18, 1, 3, 2); ctx.restore();
  // capa
  const hit = h.hit > 0, CL = CLOAKS[(S.char && S.char.color) || 0] || CLOAKS[0];
  ctx.fillStyle = hit ? '#ffffff' : CL.a; circ(0, 0, 11);
  ctx.fillStyle = hit ? '#ffffff' : CL.b; ctx.beginPath(); ctx.arc(0, 0, 11, -1.9, -.2); ctx.lineTo(0, 0); ctx.fill();
  // arco
  let pull = 0, raise = 0, kind = 'arrow';
  if(h.atk){ const p = h.atk.t / (h.atk.dur*.55); pull = h.atk.rel ? Math.max(0, 1 - (h.atk.t - h.atk.dur*.55)/(h.atk.dur*.15))*0 : clamp(p, 0, 1); }
  if(h.cast){ const p = h.cast.t / (h.cast.dur*.6); pull = h.cast.done ? 0 : clamp(p, 0, 1); raise = h.cast.id === 'rain' ? 1 : 0; kind = h.cast.id; }
  const bx = 15 - raise*3, sx = bx - 3 - pull*10;
  const eq = S.eq.bow, bowCol = eq ? (eq.rar ? RAR[eq.rar].c : '#9a6a36') : '#7a5a3a';
  // braços
  ctx.strokeStyle = CL.a; ctx.lineWidth = 4; ctx.lineCap = 'round';
  line(4, 5, bx, 0); line(3, -5, sx, 0);
  ctx.fillStyle = '#c99a78'; circ(bx, 0, 2.4); circ(sx, 0, 2.2);
  // madeira do arco
  ctx.strokeStyle = bowCol; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(bx - 2, -14); ctx.quadraticCurveTo(bx + 9 - pull*2, 0, bx - 2, 14); ctx.stroke();
  if(eq && eq.rar >= 2){ ctx.strokeStyle = eq.rar === 3 ? 'rgba(255,138,43,.35)' : 'rgba(240,211,79,.25)'; ctx.lineWidth = 7; ctx.stroke(); }
  // corda
  ctx.strokeStyle = '#e8e2d0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx - 2, -14); ctx.lineTo(sx, 0); ctx.lineTo(bx - 2, 14); ctx.stroke();
  // flecha encaixada
  if(pull > .05){
    const ac = kind === 'arrow' ? '#d9d4c7' : '#b8f070';
    ctx.strokeStyle = ac; ctx.lineWidth = 2; line(sx, 0, sx + 22, 0);
    ctx.fillStyle = ac; ctx.beginPath(); ctx.moveTo(sx + 26, 0); ctx.lineTo(sx + 20, -3); ctx.lineTo(sx + 20, 3); ctx.fill();
    if(kind !== 'arrow'){ ctx.fillStyle = 'rgba(184,240,112,.35)'; circ(sx + 24, 0, 6); }
  }
  ctx.lineCap = 'butt';
  // capuz
  ctx.fillStyle = hit ? '#ffffff' : CL.h; circ(1, 0, 7.2);
  ctx.fillStyle = '#0f1a12'; ell(4.5, 0, 2.6, 3.6);
  ctx.fillStyle = '#c99a78'; circ(5.5, 0, 1.6);
  ctx.restore();
}
function drawMon(m){
  const d = m.d, r = m.r;
  ctx.save(); ctx.translate(m.x, m.y);
  if(m.dead) ctx.globalAlpha = Math.max(0, 1 - m.deadT/1.6);
  ctx.fillStyle = 'rgba(0,0,0,.38)'; ell(0, r*.7, r*1.15, r*.45);
  if(m.elite && !m.dead){ ctx.strokeStyle = `rgba(111,156,255,${.55 + .3*Math.sin(T*5)})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0, r*.55, r*1.35, r*.6, 0, 0, TAU); ctx.stroke(); }
  ctx.rotate(m.face);
  if(m.dead) ctx.scale(1, .55);
  const ap = m.atkT > 0 ? Math.sin((1 - m.atkT/.36)*Math.PI) : 0;
  if(!d.ranged) ctx.translate(ap*r*.55, 0);
  const hit = m.hit > 0, c1 = hit ? '#ffffff' : d.c1, c2 = hit ? '#ffffff' : d.c2, w = m.moving ? Math.sin(m.anim*11) : 0, eye = d.eye || '#ffcf5a';
  ctx.lineCap = 'round';
  if(d.kind === 'quad'){
    ctx.strokeStyle = c1; ctx.lineWidth = Math.max(2, r*.25);
    [[r*.55,1],[r*.55,-1],[-r*.55,1],[-r*.55,-1]].forEach(([lx, sd], i) => { const o = w*r*.35*(i % 3 ? 1 : -1); line(lx, sd*r*.35, lx + o, sd*r*.85); });
    if(d.tail){ ctx.lineWidth = Math.max(1.5, r*.15); ctx.beginPath(); ctx.moveTo(-r*1.1, 0); ctx.quadraticCurveTo(-r*1.6, w*r*.6, -r*2, r*.3); ctx.stroke(); }
    ctx.fillStyle = c1; ell(0, 0, r*1.2, r*.68); ctx.fillStyle = c2; ell(-r*.15, 0, r*.7, r*.32);
    ctx.fillStyle = c1; circ(r*1.05, 0, r*.5); ctx.fillStyle = c2; ell(r*1.45, 0, r*.25, r*.2);
    ctx.fillStyle = eye; circ(r*1.25, -r*.22, Math.max(1.2, r*.11)); circ(r*1.25, r*.22, Math.max(1.2, r*.11));
  } else if(d.kind === 'spider'){
    ctx.strokeStyle = c1; ctx.lineWidth = 2;
    for(let i = 0; i < 4; i++) for(const sd of [1, -1]){ const a = (-.9 + i*.6)*sd, o = w*.25*(i % 2 ? 1 : -1); const kx = Math.cos(a + o)*r*1.1, ky = Math.sin(a + o)*r*1.1 + sd*r*.4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(kx, ky); ctx.lineTo(kx*1.4, ky*1.5); ctx.stroke(); }
    ctx.fillStyle = c1; circ(-r*.7, 0, r*.85); ctx.fillStyle = c2; ell(-r*.8, 0, r*.4, r*.28); ctx.fillStyle = c1; circ(r*.25, 0, r*.55);
    ctx.fillStyle = eye; for(const sd of [-1, 1]){ circ(r*.55, sd*r*.15, 1.5); circ(r*.45, sd*r*.32, 1.2); }
  } else if(d.kind === 'blob'){
    const sq = 1 + Math.sin(m.anim*(m.moving ? 9 : 4))*.09;
    ctx.fillStyle = c1; ell(0, 0, r*sq, r/sq); ctx.fillStyle = c2; ell(-r*.2, -r*.2, r*.45*sq, r*.3/sq);
    ctx.fillStyle = eye; circ(r*.6, -r*.3, Math.max(1.5, r*.14)); circ(r*.6, r*.3, Math.max(1.5, r*.14));
  } else {
    const ra = d.ranged ? ap : 0;
    ctx.fillStyle = c1; ell(r*.15 + w*r*.2 + (d.ranged ? 0 : ap*r*.5), r*.82, r*.3, r*.24); ell(r*.15 - w*r*.2 + ra*r*.4, -r*.82, r*.3, r*.24);
    ctx.fillStyle = c1; ell(0, 0, r*.6, r*.95);
    ctx.fillStyle = c2; circ(r*.12, 0, r*.5);
    ctx.fillStyle = eye; circ(r*.48, -r*.18, Math.max(1.2, r*.1)); circ(r*.48, r*.18, Math.max(1.2, r*.1));
    if(d.ranged && ap > 0){ ctx.fillStyle = d.ranged; ctx.globalAlpha *= .6; circ(r*1.1, -r*.6, 4 + ap*3); }
  }
  ctx.lineCap = 'butt';
  if(m.poisons.length && !m.dead){ ctx.globalAlpha = .22; ctx.fillStyle = '#8fd14f'; circ(0, 0, r*1.05); }
  ctx.restore();
}
function bar(x, y, w, h, p, col, pz, tick){
  ctx.fillStyle = 'rgba(6,8,7,.88)'; ctx.fillRect(x - w/2 - 1.5, y - 1.5, w + 3, h + 3);
  ctx.fillStyle = '#3a1512'; ctx.fillRect(x - w/2, y, w, h);
  const fw = w*clamp(p, 0, 1); ctx.fillStyle = col; ctx.fillRect(x - w/2, y, fw, h);
  if(pz > 0){ const pw = Math.min(fw, w*pz); ctx.fillStyle = '#9bd84a'; ctx.fillRect(x - w/2 + fw - pw, y, pw, h); }
  if(tick !== undefined){ ctx.fillStyle = '#f3efe2'; ctx.fillRect(x - w/2 + w*tick - .75, y - 2, 1.5, h + 4); }
}
function drawBars(vis){
  ctx.font = '700 10px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center';
  for(const m of mons){
    if(m.dead || !vis(m)) continue;
    const w = m.elite ? 44 : 32, y = m.y - m.r*1.3 - 12;
    bar(m.x, y, w, 4, m.hp/m.hpMax, '#d4473b', Math.min(1, poisonLeft(m)/m.hpMax));
    if(m.elite){ ctx.fillStyle = '#9fbaff'; ctx.fillText(m.name, m.x, y - 5); }
  }
  if(hero.scale > .3 && hero.alpha > .1){
    const p = hero.hp/ST.life;
    bar(hero.x, hero.y - 32*hero.scale, 44, 6, p, p > .5 ? '#4fbf5a' : p > .3 ? '#d9b23a' : '#d4473b', 0, scene === 'map' ? S.cfg.ret/100 : undefined);
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
function drawItemDrop(d){
  const it = d.it, col = RAR[it.rar].c, b = Math.sin(T*3 + d.x)*1.5;
  if(it.rar >= 2){ const g = ctx.createLinearGradient(0, d.y - 70, 0, d.y); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, it.rar === 3 ? 'rgba(255,138,43,.5)' : 'rgba(240,211,79,.4)'); ctx.fillStyle = g; ctx.fillRect(d.x - 5, d.y - 70, 10, 70); }
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
    const g = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, c.r*pul); g.addColorStop(0, `rgba(155,216,74,${.42*k})`); g.addColorStop(.7, `rgba(110,170,50,${.28*k})`); g.addColorStop(1, 'rgba(90,140,40,0)');
    ctx.fillStyle = g; ell(c.x, c.y, c.r*pul, c.r*.8*pul);
    ctx.strokeStyle = `rgba(190,240,120,${.5*k})`; ctx.lineWidth = 1.5; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.ellipse(c.x, c.y, c.r, c.r*.8, T*.3, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
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
    const c = p.kind === 'arrow' ? '#e8e2d0' : p.kind === 'farrow' ? '#d8f07a' : '#9bd84a';
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
    if(p.kind !== 'arrow'){ ctx.fillStyle = 'rgba(155,216,74,.35)'; ell(0, 0, 14, 5); }
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
