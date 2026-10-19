// Cena principal: IA do herói e dos monstros, portal, morte e o passo de simulação step(dt).
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- ATUALIZAÇÃO ---------- */
function moveDir(ang, dt, mul){
  const s = ST.ms * (mul || 1) * dt;
  const nx = clamp(hero.x + Math.cos(ang)*s, 20, WORLD.w - 20), ny = clamp(hero.y + Math.sin(ang)*s, 20, WORLD.h - 20);
  const moved = Math.abs(nx - hero.x) + Math.abs(ny - hero.y) > s*.3;
  hero.x = nx; hero.y = ny; hero.moving = true; hero.walkT += dt;
  return moved;
}
function moveTo(p, dt, mul){
  const d = D(hero, p); if(d < 5){ hero.moving = false; return true; }
  hero.face = Math.atan2(p.y - hero.y, p.x - hero.x); moveDir(hero.face, dt, mul); return false;
}
// Dá para pegar? Orbe entra na pilha (se já existe ou se há espaço); item precisa de espaço e da raridade mínima das Regras.
const canPick = d => d.orb ? (S.orbs[d.orb] > 0 || !invFull()) : d.it.rar >= S.cfg.minPick && !invFull();
function heroAI(dt){
  const pct = hero.hp / ST.life * 100;
  if(pct <= S.cfg.ret){ startPortal('town', `Vida em ${Math.round(pct)}%. Voltando para a cidade.`); return; }
  if(S.cfg.retFull && invFull()){ startPortal('town', 'Mochila cheia. Voltando para a cidade.'); return; }
  if(hero.cast || hero.dash){ hero.moving = false; return; }
  const foc = getFocus(), near = foc || nearestMon(hero), nd = near ? D(near, hero) : 1e9;
  // Girando: anda até os inimigos sem atacar normalmente
  if(hero.whirl){ if(near && nd > 26 && nd < 400) moveDir(Math.atan2(near.y - hero.y, near.x - hero.x), dt, .75); else hero.moving = false; return; }
  if(hero.atk && !hero.atk.rel){ hero.moving = false; const t = hero.atk.tgt; if(t && !t.dead) hero.face = Math.atan2(t.y - hero.y, t.x - hero.x); return; }
  // Prioridade: pegar o que caiu das criaturas (itens e orbes) antes de lutar; só um alvo clicado passa na frente
  if(!foc){ const dr = nearestDrop(PICK_RANGE); if(dr){ moveTo(dr, dt); return; } }
  if(isWar() && near && (nd < 320 || foc)){
    // Guerreiro: vai para cima e bate de perto, sem recuar
    const ang = Math.atan2(near.y - hero.y, near.x - hero.x), reach = MELEE + near.r;
    hero.face = ang;
    if(nd > reach){ moveDir(ang, dt); return; }
    hero.moving = false;
    if(!hero.atk) hero.atk = {t:0, dur:1/ST.aps, rel:false, tgt:near};
    return;
  }
  if(near && (nd < 300 || foc)){
    const ang = Math.atan2(near.y - hero.y, near.x - hero.x);
    hero.face = ang;
    if(!near.d.ranged && nd < 46 && hero.kite < .7){
      const away = ang + Math.PI;
      if(moveDir(away, dt, .9)){ hero.kite += dt; hero.face = ang; return; }
      hero.kite = 1;
    }
    if(nd > RANGE){ moveDir(ang, dt); return; }
    hero.moving = false;
    if(!hero.atk) hero.atk = {t:0, dur:1/ST.aps, rel:false, tgt:near};
  } else {
    const dr = nearestDrop(700);
    if(dr) moveTo(dr, dt);
    else if(near) moveTo(near, dt);
    else hero.moving = false;
  }
}
const PICK_RANGE = 500;
function nearestDrop(maxD){
  let dr = null, dd = maxD;
  for(const d of drops) if(!d.gone && canPick(d)){ const x = D(d, hero); if(x < dd){ dd = x; dr = d; } }
  return dr;
}
// Fim da Investida: explosão pequena em volta de onde o Guerreiro parou
const DASH_BOOM_R = 65;
function dashBoom(d){
  ring(hero.x, hero.y, DASH_BOOM_R, '#ebaa78', .4, 5); ring(hero.x, hero.y, DASH_BOOM_R*.5, '#ffd0a0', .3, 2);
  for(let i = 0; i < 18; i++){ const an = Math.random()*TAU, sp = rnd(90, 220); part({x:hero.x, y:hero.y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp - 40, grav:260, life:.45, size:rnd(2,4), c:i % 3 ? '#8a6a4a' : '#ebaa78'}); }
  for(const m of mons) if(!m.dead && D(m, hero) < DASH_BOOM_R + m.r*.5) meleeHit(m, d.endMult, d.dot*.5);
}
function heroTimers(dt){
  hero.hit = Math.max(0, hero.hit - dt);
  hero.swing = Math.max(0, (hero.swing || 0) - dt);
  if(hero.dash){
    // Investida: corre em linha reta e acerta cada inimigo do caminho uma vez
    const d = hero.dash; d.t += dt; const k = clamp(d.t/d.dur, 0, 1);
    hero.x = d.x0 + (d.x1 - d.x0)*k; hero.y = d.y0 + (d.y1 - d.y0)*k; hero.moving = true; hero.walkT += dt*2;
    part({x:hero.x + rnd(-6,6), y:hero.y + rnd(-6,6), life:.3, size:rnd(2,4), c:'rgba(235,190,150,.7)'});
    for(const m of mons) if(!m.dead && !d.hit.has(m) && D(m, hero) < m.r + 26){ d.hit.add(m); meleeHit(m, d.mult, d.dot); m.x += Math.cos(hero.face + Math.PI/2*(Math.random() < .5 ? 1 : -1))*14; }
    if(k >= 1){ hero.dash = null; dashBoom(d); if(hero.queued){ const q = hero.queued, qa = hero.queuedAim; hero.queued = hero.queuedAim = null; manualCast(q, qa); } }
  }
  if(hero.whirl){
    // Giro de Lâmina: 8 golpes em 2s em todos em volta
    const w = hero.whirl; w.t += dt; w.tick -= dt; w.ang += dt*16;
    if(w.tick <= 0){ w.tick = .25; const R = whirlR(); for(const m of mons) if(!m.dead && D(m, hero) < R + m.r*.5) meleeHit(m, w.mult, w.dot); ring(hero.x, hero.y, R, 'rgba(235,190,150,.8)', .22, 2); }
    if(w.t >= w.dur) hero.whirl = null;
  }
  if(hero.atk){
    const a = hero.atk; a.t += dt;
    if(!a.rel && a.t >= a.dur*.55){ a.rel = true; hero.kite = 0; fireBasic(a.tgt); }
    if(a.t >= a.dur) hero.atk = null;
  }
  if(hero.cast){
    const c = hero.cast; c.t += dt;
    if(Math.random() < .5) { const an = Math.random()*TAU; part({x:hero.x + Math.cos(an)*18, y:hero.y - 16 + Math.sin(an)*18, vy:-30, life:.4, size:2, c:DOT_C()}); }
    if(!c.done && c.t >= c.dur*.6){ c.done = true; doSkill(c); }
    if(c.t >= c.dur){ hero.cast = null; if(hero.queued){ const q = hero.queued, qa = hero.queuedAim; hero.queued = hero.queuedAim = null; manualCast(q, qa); } }
  }
}
function monUpdate(m, dt){
  if(m.dead){ m.deadT += dt; return; }
  if(m.poisons.length || m.bleeds.length || m.burns.length){
    let dmg = 0;
    for(const p of m.poisons){ dmg += p.dps * Math.min(dt, p.t); p.t -= dt; }
    // Sangramento dói 50% mais enquanto o inimigo anda
    const bm = m.moving ? 1.5 : 1;
    for(const p of m.bleeds){ dmg += p.dps * bm * Math.min(dt, p.t); p.t -= dt; }
    for(const p of m.burns){ dmg += p.dps * Math.min(dt, p.t); p.t -= dt; }
    m.poisons = m.poisons.filter(p => p.t > 0); m.bleeds = m.bleeds.filter(p => p.t > 0); m.burns = m.burns.filter(p => p.t > 0);
    m.hp -= dmg; m.pAcc += dmg; m.pT -= dt;
    const bl = m.bleeds.length > 0, fi = m.burns.length > 0;
    if(m.pT <= 0){ m.pT = .6; if(m.pAcc >= 1){ txt(m.x + rnd(-10,10), m.y - m.r - 4, fmt(m.pAcc), fi ? '#ffb070' : bl ? '#ff7a6a' : '#9bd84a', 12, -26); m.pAcc = 0; } }
    if(Math.random() < dt*(fi ? 12 : 5)) part(fi ? {x:m.x + rnd(-m.r*.7, m.r*.7), y:m.y + rnd(-m.r*.6, m.r*.2), vy:rnd(-70,-30), life:.4, size:rnd(1.8,3.2), c:pick(['#ff8a2b','#ffd24a'])}
      : bl ? {x:m.x + rnd(-m.r*.7, m.r*.7), y:m.y + rnd(-m.r*.4, m.r*.2), vy:rnd(20,60), grav:200, life:.5, size:rnd(1.5,2.6), c:'#b3241c'}
      : {x:m.x + rnd(-m.r, m.r), y:m.y + rnd(-m.r*.5, m.r*.5), vy:rnd(-40,-20), life:.7, size:rnd(1.5,3), c:'#8fd14f', kind:'bubble'});
    if(m.hp <= 0){ kill(m); return; }
  }
  m.hit = Math.max(0, m.hit - dt); m.acd -= dt; m.anim += dt;
  const live = mode === 'hunt' || mode === 'portal';
  const d = D(m, hero);
  if(live && !m.aggro && d < 240) m.aggro = true;
  if(!live) m.aggro = false;
  if(m.atkT > 0){
    m.atkT -= dt; m.moving = false;
    if(!m.fired && m.atkT <= .18){
      m.fired = true;
      if(m.d.ranged){ const an = Math.atan2(hero.y - m.y, hero.x - m.x); projs.push({x:m.x, y:m.y, vx:Math.cos(an)*260, vy:Math.sin(an)*260, a:an, life:1.6, hostile:true, mon:m, dmg:m.dmg, c:m.d.ranged}); }
      else if(d < m.d.range + m.r + 18) hurtHero(m.dmg, m);
    }
    return;
  }
  if(m.aggro){
    m.face = Math.atan2(hero.y - m.y, hero.x - m.x);
    const reach = m.d.ranged ? m.d.range : m.d.range + m.r;
    if(d > reach){ m.x += Math.cos(m.face)*m.spd*dt; m.y += Math.sin(m.face)*m.spd*dt; m.moving = true; }
    else { m.moving = false; if(m.acd <= 0){ m.atkT = .36; m.fired = false; m.acd = m.d.acd; } }
  } else {
    m.wt -= dt;
    if(m.wt <= 0){ m.wx = m.x + rnd(-90,90); m.wy = m.y + rnd(-90,90); m.wt = rnd(2,5); }
    const wd = Math.hypot(m.wx - m.x, m.wy - m.y);
    if(wd > 6){ m.face = Math.atan2(m.wy - m.y, m.wx - m.x); m.x += Math.cos(m.face)*m.spd*.3*dt; m.y += Math.sin(m.face)*m.spd*.3*dt; m.moving = true; } else m.moving = false;
  }
  m.x = clamp(m.x, 20, W_MAP - 20); m.y = clamp(m.y, 20, W_MAP - 20);
}
function separate(){
  const L = mons.length;
  for(let i = 0; i < L; i++){
    const a = mons[i]; if(a.dead) continue;
    for(let j = i + 1; j < L; j++){
      const b = mons[j]; if(b.dead) continue;
      const dx = b.x - a.x, dy = b.y - a.y, min = (a.r + b.r)*.9, d2 = dx*dx + dy*dy;
      if(d2 < min*min && d2 > .01){ const d = Math.sqrt(d2), p = (min - d)/2, ux = dx/d, uy = dy/d; a.x -= ux*p; a.y -= uy*p; b.x += ux*p; b.y += uy*p; }
    }
    const dx = a.x - hero.x, dy = a.y - hero.y, min = a.r + 10, d = Math.hypot(dx, dy);
    if(d < min && d > .01){ a.x = hero.x + dx/d*min; a.y = hero.y + dy/d*min; }
  }
}
function updateField(dt){
  for(const k in cds) cds[k] = Math.max(0, cds[k] - dt);
  spawnT -= dt;
  if(spawnT <= 0 && mons.filter(m => !m.dead).length < 16 && mode === 'hunt'){ spawnPack(false); spawnT = 1.2; }
  heroTimers(dt);
  if(mode === 'hunt'){ if(T - (hero.lastHit || 0) > 3 && hero.hp < ST.life) hero.hp = Math.min(ST.life, hero.hp + ST.life*.02*dt); heroAI(dt); }
  else if(mode === 'portal'){
    portal.t += dt;
    if(portal.t > .9) moveTo(portal, dt, .7);
    if(portal.t > 1.2) hero.scale = Math.max(0, hero.scale - dt*2.5);
    if(portal.t > 1.5) transition(() => portal && portal.dest === 'map' ? enterMap(S.map) : enterTown());
  } else if(mode === 'dead'){
    deadT += dt; hero.alpha = Math.max(0, 1 - deadT*.8);
    if(deadT > 2.2) transition(() => { enterTown(); hero.hp = 1; });
  }
  for(const m of mons) monUpdate(m, dt);
  separate();
  mons = mons.filter(m => !m.dead || m.deadT < 1.6);
  for(const p of projs){
    p.x += p.vx*dt; p.y += p.vy*dt; p.life -= dt;
    if(p.hostile){
      if(hero.scale > .6 && mode !== 'dead' && Math.hypot(p.x - hero.x, p.y - hero.y) < 14){ hurtHero(p.dmg, p.mon); p.life = 0; }
    } else {
      const fire = p.kind === 'ember' || p.kind === 'fireball';
      if(p.kind !== 'arrow' && Math.random() < (fire ? .9 : .6)) part({x:p.x, y:p.y, vx:rnd(-20,20), vy:fire ? rnd(-50,-10) : 0, life:fire ? .35 : .3, size:fire ? rnd(2,4) : 2, c:fire ? pick(['#ff8a2b','#ffd24a']) : p.kind === 'farrow' ? '#d8f07a' : '#9bd84a'});
      for(const m of mons){
        if(m.dead) continue;
        if(Math.hypot(p.x - m.x, p.y - m.y) < m.r + 5){
          if(p.boom){ explode(p); break; }
          dealHit(m, p.dmg, p.crit);
          if(p.pois) poison(m, p.pois, p.pdur);
          if(p.burn) burn(m, p.burn, p.bdur);
          for(let i = 0; i < 4; i++) part({x:p.x, y:p.y, vx:rnd(-60,60), vy:rnd(-60,60), life:.25, size:2, c:fire ? '#ff8a2b' : p.pois ? '#9bd84a' : '#f3efe2'});
          p.life = 0; break;
        }
      }
      if(p.boom && p.life <= 0) explode(p);
    }
  }
  projs = projs.filter(p => p.life > 0);
  for(const c of clouds){
    c.t += dt; c.tick -= dt;
    if(c.tick <= 0){ c.tick = .5; for(const m of mons) if(!m.dead && D(m, c) < c.r){ (c.fire ? burn : poison)(m, c.dps*.5, 1*ST.pdur); m.aggro = true; } }
    if(c.fire){ if(Math.random() < dt*40){ const an = Math.random()*TAU, rr = Math.sqrt(Math.random())*c.r; part({x:c.x + Math.cos(an)*rr, y:c.y + Math.sin(an)*rr*.8, vy:rnd(-70,-30), life:.45, size:rnd(2,4), c:pick(['#ff8a2b','#ffd24a','#ff5a1f'])}); } }
    else if(Math.random() < dt*30){ const an = Math.random()*TAU, rr = Math.sqrt(Math.random())*c.r; part({x:c.x + Math.cos(an)*rr, y:c.y + Math.sin(an)*rr*.8 - 60, vy:300, life:.2, size:1.5, c:'#c8f080', kind:'streak'}); }
  }
  clouds = clouds.filter(c => c.t < c.dur);
  for(const l of later) l.t -= dt;
  const due = later.filter(l => l.t <= 0); later = later.filter(l => l.t > 0); due.forEach(l => l.fn());
  for(const d of drops){
    d.t += dt;
    if(!d.gone && D(d, hero) < 26 && canPick(d) && mode === 'hunt'){
      d.gone = true;
      if(d.orb){ S.orbs[d.orb]++; log(`Pegou ${ORBS[d.orb].n} (${S.orbs[d.orb]})`, ORBS[d.orb].c); }
      else { S.inv.push(d.it); if(d.it.rar >= 1) log(`Pegou ${d.it.name}`, RAR[d.it.rar].c); }
      dirtyPanel();
    }
  }
  drops = drops.filter(d => !d.gone && d.t < 90);
  for(const c of coins){
    c.t += dt;
    if(c.t > .5 && mode !== 'dead'){
      const d = D(c, hero), sp = 260 + c.t*500;
      if(d < 14){ S.gold += c.v; c.got = true; txt(hero.x + rnd(-8,8), hero.y - 40, '+' + c.v, '#e2ae4a', 12, -30); }
      else { c.x += (hero.x - c.x)/d*sp*dt; c.y += (hero.y - c.y)/d*sp*dt; }
    }
  }
  coins = coins.filter(c => !c.got);
}
function updateTown(dt){
  for(const k in cds) cds[k] = Math.max(0, cds[k] - dt);
  heroTimers(dt);
  if(mode === 'townWalk'){ if(moveTo(FOUNT, dt, .85)){ mode = 'town'; hero.face = -Math.PI/2; } }
  else if(mode === 'town'){
    hero.moving = false;
    if(hero.hp < ST.life){
      hero.hp = Math.min(ST.life, hero.hp + ST.life*.4*dt);
      if(Math.random() < dt*14){ const an = Math.random()*TAU; part({x:hero.x + Math.cos(an)*14, y:hero.y + Math.sin(an)*8, vy:-50, life:.7, size:2, c:'#9fe0ff'}); }
      townWait = 0;
    } else if(S.cfg.autoGo && !uiOpen()){ townWait += dt; if(townWait >= 3) depart(); }
    else townWait = 0;
  } else if(mode === 'townLeave'){
    if(moveTo(TPORT, dt, .9)){ hero.scale = Math.max(0, hero.scale - dt*2.5); if(hero.scale < .3) transition(() => enterMap(S.map)); }
  }
}
function step(dt){
  T += dt;
  if(scene === 'map') updateField(dt); else updateTown(dt);
  for(const p of parts){ p.t += dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vy += p.grav*dt; }
  parts = parts.filter(p => p.t < p.life);
  for(const t of texts){ t.t += dt; t.y += t.vy*dt; }
  texts = texts.filter(t => t.t < .9);
  for(const r of rings) r.t += dt;
  rings = rings.filter(r => r.t < r.life);
  const k = Math.min(1, dt*6), ty = scene === 'town' ? hero.y - 40 : hero.y;
  cam.x += (hero.x - cam.x)*k; cam.y += (ty - cam.y)*k;
}
