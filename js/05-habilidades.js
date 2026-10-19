// Habilidades (mira): mira por arrasto/tecla, alvo fixo por clique e indicadores de mira.
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- MIRA ---------- */
// Celular: segurar o botão e arrastar como um joystick; soltar lança. Toque rápido = mira automática.
// PC: segurar a tecla e apontar com o mouse; soltar lança. Esc ou botão direito cancela.
const AIMABLE = {fan:1, rain:1}, AIM_RANGE = RANGE + 40, AIM_DRAG = 70, AIM_DEAD = 14, FAN_LEN = 360, FAN_SPREAD = .95, FAN_CLOSE = 38;
const fanCount = () => 5 + Math.floor(ST.rk('fan')/3);
const fanAng = (base, i, n) => base - FAN_SPREAD/2 + FAN_SPREAD*i/(n - 1);
// Criatura "colada" na frente do herói, que leva todas as flechas do leque
function fanPointBlank(base){
  let best = null, bd = 1e9;
  for(const m of mons){
    if(m.dead) continue;
    const d = D(m, hero); if(d > m.r + FAN_CLOSE || d >= bd) continue;
    let da = Math.atan2(m.y - hero.y, m.x - hero.x) - base; da = Math.atan2(Math.sin(da), Math.cos(da));
    if(Math.abs(da) <= FAN_SPREAD/2 + .4){ best = m; bd = d; }
  }
  return best;
}
let aim = null, skipClickT = 0;
const mouse = {x:0, y:0, on:false};
const toWorld = (sx, sy) => ({x: cam.x + (sx - cw/2)/zoom, y: cam.y + (sy - ch/2)/zoom});
const canAim = id => !!AIMABLE[id] && ST.rk(id) > 0 && scene === 'map' && mode === 'hunt' && cds[id] <= 0;
function aimPoint(){
  if(!aim) return null;
  let dx = Math.cos(hero.face), dy = Math.sin(hero.face), k = AIM_RANGE*.6;
  if(aim.src === 'key'){
    if(mouse.on){ const w = toWorld(mouse.x, mouse.y); const ex = w.x - hero.x, ey = w.y - hero.y; k = Math.hypot(ex, ey); if(k > 1){ dx = ex/k; dy = ey/k; } }
  } else {
    const L = Math.hypot(aim.dx, aim.dy);
    if(L > 1){ dx = aim.dx/L; dy = aim.dy/L; }
    k = Math.min(1, L/AIM_DRAG) * AIM_RANGE;
  }
  if(aim.id === 'fan') k = FAN_LEN; // o Leque só usa a direção
  k = Math.min(k, aim.id === 'fan' ? FAN_LEN : AIM_RANGE);
  return {x: clamp(hero.x + dx*k, 20, WORLD.w - 20), y: clamp(hero.y + dy*k, 20, WORLD.h - 20), ang: Math.atan2(dy, dx)};
}
function aimRelease(){
  const a = aim; if(!a) return;
  const p = aimPoint(); aim = null;
  if(a.src === 'touch'){
    if(!a.moved) return manualCast(a.id);
    if(Math.hypot(a.dx, a.dy) < AIM_DEAD) return; // voltou o dedo pro centro: cancela
  }
  manualCast(a.id, p);
}
// Alvo fixo: clicar/tocar numa criatura faz o herói focar nela; a Flecha Venenosa vai nela.
const ARROW_REACH = 480;
let focus = null, cursorCache = '';
function getFocus(){ if(focus && (focus.dead || !mons.includes(focus))) focus = null; return focus; }
function setFocus(m){
  focus = m || null;
  if(!m) return;
  if(hero.atk && !hero.atk.rel) hero.atk.tgt = m;
  ring(m.x, m.y + m.r*.55, m.r*1.6, '#ff8c5a', .35, 2);
}
function monAt(sx, sy, pad){
  const w = toWorld(sx, sy); let best = null, bd = 1e9;
  for(const m of mons){ if(m.dead) continue; const d = Math.hypot(m.x - w.x, m.y - w.y); if(d < m.r*1.4 + pad/zoom && d < bd){ bd = d; best = m; } }
  return best;
}
const hoverMon = () => mouse.on && mouse.x >= 0 && mouse.y >= 0 && mouse.x <= cw && mouse.y <= ch && scene === 'map' ? monAt(mouse.x, mouse.y, 6) : null;
function drawFocus(){
  const f = getFocus(), h = hoverMon();
  const cur = h ? 'crosshair' : ''; if(cur !== cursorCache){ cursorCache = cur; cv.style.cursor = cur; }
  const mark = (m, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash([7, 5]); ctx.lineDashOffset = -T*20; ctx.beginPath(); ctx.ellipse(m.x, m.y + m.r*.6, m.r*1.45, m.r*.65, 0, 0, TAU); ctx.stroke(); };
  ctx.save();
  if(h && h !== f) mark(h, 'rgba(255,220,160,.55)', 1.5);
  if(f) mark(f, `rgba(255,110,70,${.75 + .2*Math.sin(T*6)})`, 2.5);
  ctx.restore();
}
function drawAim(){
  if(!aim || (aim.src === 'touch' && (!aim.moved || Math.hypot(aim.dx, aim.dy) < AIM_DEAD))) return;
  const p = aimPoint(), bad = cds[aim.id] > 0;
  const c = bad ? '255,120,100' : '155,216,74';
  ctx.save();
  if(aim.id === 'rain'){
    ctx.strokeStyle = `rgba(${c},.22)`; ctx.lineWidth = 1.5; ctx.setLineDash([4, 7]);
    ctx.beginPath(); ctx.arc(hero.x, hero.y, AIM_RANGE, 0, TAU); ctx.stroke();
    ctx.strokeStyle = `rgba(${c},.55)`; line(hero.x, hero.y, p.x, p.y); ctx.setLineDash([]);
    const rad = 70 + 5*ST.rk('rain');
    ctx.fillStyle = `rgba(${c},.18)`; ell(p.x, p.y, rad, rad*.8);
    ctx.strokeStyle = `rgba(${c},.85)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(p.x, p.y, rad, rad*.8, 0, 0, TAU); ctx.stroke();
    ctx.fillStyle = `rgba(${c},.9)`; circ(p.x, p.y, 3);
  } else {
    // Caminho de cada flecha do leque
    const n = fanCount(), pb = fanPointBlank(p.ang);
    ctx.lineWidth = 2; ctx.setLineDash([10, 6]); ctx.lineDashOffset = -T*40;
    for(let i = 0; i < n; i++){
      const an = fanAng(p.ang, i, n), cs = Math.cos(an), sn = Math.sin(an);
      const x0 = hero.x + cs*14, y0 = hero.y + sn*14, x1 = hero.x + cs*FAN_LEN, y1 = hero.y + sn*FAN_LEN;
      const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, `rgba(${c},.85)`); g.addColorStop(1, `rgba(${c},.15)`);
      ctx.strokeStyle = g; line(x0, y0, x1, y1);
      ctx.fillStyle = `rgba(${c},.35)`; ctx.beginPath(); ctx.moveTo(x1 + cs*8, y1 + sn*8); ctx.lineTo(x1 - sn*5, y1 + cs*5); ctx.lineTo(x1 + sn*5, y1 - cs*5); ctx.fill();
    }
    ctx.setLineDash([]);
    if(pb){
      ctx.strokeStyle = `rgba(${c},.95)`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(pb.x, pb.y, pb.r*1.6, pb.r*1.3, 0, 0, TAU); ctx.stroke();
      ctx.font = '800 15px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.75)';
      ctx.strokeText('×' + n, pb.x, pb.y - pb.r - 16); ctx.fillStyle = `rgb(${c})`; ctx.fillText('×' + n, pb.x, pb.y - pb.r - 16);
    }
  }
  ctx.restore();
}
