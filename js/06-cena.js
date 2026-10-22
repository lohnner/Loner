// Cena principal: IA do herói e dos monstros, portal, morte e o passo de simulação step(dt).
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- ATUALIZAÇÃO ---------- */
// Anda na direção ang; paredes e obstáculos do mapa bloqueiam (escorrega pela parede)
function moveDir(ang, dt, mul){
  const s = ST.ms * (mul || 1) * dt;
  const nx = clamp(hero.x + Math.cos(ang)*s, 20, WORLD.w - 20), ny = clamp(hero.y + Math.sin(ang)*s, 20, WORLD.h - 20);
  hero.moving = true; hero.walkT += dt;
  if(walkable(nx, ny)){ hero.x = nx; hero.y = ny; return true; }
  if(walkable(nx, hero.y)){ hero.x = nx; return true; }
  if(walkable(hero.x, ny)){ hero.y = ny; return true; }
  return false;
}
function moveTo(p, dt, mul){
  const d = D(hero, p); if(d < 5){ hero.moving = false; return true; }
  hero.face = Math.atan2(p.y - hero.y, p.x - hero.x); moveDir(hero.face, dt, mul); return false;
}
// Dá para pegar? Orbe sempre (vai para a aba Orbes); item precisa de espaço na mochila e da raridade mínima das Regras.
const canPick = d => d.orb || d.stone ? true : d.it.rar >= S.cfg.minPick && !invFull(); // orbe e Pedra sempre cabem (aba Orbes sem limite)
function heroAI(dt){
  const pct = hero.hp / ST.life * 100;
  if(pct <= S.cfg.ret){ startPortal('town', `Vida em ${Math.round(pct)}%. Voltando para a cidade.`); return; }
  if(S.cfg.retFull && invFull()){ startPortal('town', 'Mochila cheia. Voltando para a cidade.'); return; }
  if(hero.dodge) return;
  if(hero.dash){ hero.moving = false; return; }
  // lançando uma habilidade: continua andando (mais devagar) se o jogador estiver mexendo o joystick — não trava o movimento
  if(hero.cast){ const md = manualDir(); if(md !== null) moveDir(md, dt, .7); else hero.moving = false; return; }
  manualAI(dt);
}
// Andar e atacar são manuais: o jogador move o herói (manualDir em 05) e ataca pelo botão (basicAttack em 04; segurar repete).
// Itens e orbes são pegos ao passar por cima.
function manualAI(dt){
  if(hero.dodge) return;
  if(atkHeld) basicAttack(atkHeld.mouse && mouse.on ? (w => Math.atan2(w.y - hero.y, w.x - hero.x))(toWorld(mouse.x, mouse.y)) : undefined);
  const md = manualDir();
  if(hero.whirl){ if(md !== null) moveDir(md, dt, .75); else hero.moving = false; return; }
  // golpe saindo: para um instante virado para o alvo
  if(hero.atk && !hero.atk.rel){ const t = hero.atk.tgt; if(t && !t.dead) hero.face = Math.atan2(t.y - hero.y, t.x - hero.x); hero.moving = false; return; }
  if(md !== null){ hero.face = md; moveDir(md, dt); return; }
  hero.moving = false;
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
  hero.invul = Math.max(0, (hero.invul || 0) - dt);
  if(hero.buff){ hero.buff.t -= dt; if(Math.random() < dt*20) part({x:hero.x + rnd(-12,12), y:hero.y - rnd(0,40), vy:-50, life:.5, size:rnd(2,3.5), c:hero.buff.c}); if(hero.buff.t <= 0) hero.buff = null; }
  // Visual de rastro (Baú de Visuais): partículas atrás do herói ao andar, mais fortes na esquiva
  const TR = lookOf('trail');
  if(TR && (hero.moving || hero.dodge) && hero.scale > .5 && Math.random() < dt*(hero.dodge ? 60 : 16)) part({x:hero.x + rnd(-6,6), y:hero.y - rnd(0,14), vx:rnd(-15,15), vy:rnd(-30,-5), life:rnd(.4,.7), size:rnd(1.5,3.2), c:pick(TR.c)});
  if(hero.dodge){
    // Esquiva: Arqueiro rola, Guerreiro avança, Mago some e reaparece (teleporte)
    const g = hero.dodge; g.t += dt; const k = clamp(g.t/g.dur, 0, 1), e = 1 - (1 - k)*(1 - k);
    hero.x = g.x0 + (g.x1 - g.x0)*e; hero.y = g.y0 + (g.y1 - g.y0)*e; hero.moving = true; hero.walkT += dt*2;
    if(!isMage()) part({x:hero.x + rnd(-5,5), y:hero.y + rnd(-3,3), vy:-15, life:.3, size:rnd(2,3.5), c:'rgba(200,190,170,.6)'});
    if(k >= 1){ hero.dodge = null; if(isMage()) for(let i = 0; i < 14; i++){ const an = Math.random()*TAU; part({x:hero.x + Math.cos(an)*24, y:hero.y - 18 + Math.sin(an)*24, vx:-Math.cos(an)*90, vy:-Math.sin(an)*90, life:.3, size:rnd(1.5,3), c:pick(['#ffb050','#ffe0a0'])}); } }
  }
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
    if(!a.rel && a.t >= a.dur*.55){ a.rel = true; hero.kite = 0; fireBasic(a.tgt, a.ang); }
    if(a.t >= a.dur) hero.atk = null;
  }
  if(hero.cast){
    const c = hero.cast; c.t += dt;
    if(Math.random() < .5) { const an = Math.random()*TAU; part({x:hero.x + Math.cos(an)*18, y:hero.y - 16 + Math.sin(an)*18, vy:-30, life:.4, size:2, c:DOT_C()}); }
    if(!c.done && c.t >= c.dur*.6){ c.done = true; doSkill(c); }
    if(c.t >= c.dur){ hero.cast = null; if(hero.queued){ const q = hero.queued, qa = hero.queuedAim; hero.queued = hero.queuedAim = null; manualCast(q, qa); } }
  }
}
// Velocidade dos tiros das criaturas de longe (px/s) — rápido para ser difícil de desviar
const MON_SHOT = 380;
// Começa o golpe em área da criatura (ver MON_AOE em 01)
function monAoe(m, A){
  const ec = ELEM[m.el || m.d.el || 'poison'].c, R = A.r*(m.elite ? 1.2 : 1), dmg = m.dmg*A.m*AOE_DMG;
  m.aoeT = A.cd; m.moving = false; m.fired = true;
  m.face = Math.atan2(hero.y - m.y, hero.x - m.x);
  const z = {x:hero.x, y:hero.y, r:R, t:0, dur:A.t, dmg, mon:m, c:ec, k:A.k};
  if(A.k === 'cone' || A.k === 'slam'){
    // golpe dela mesma: fica parada se preparando
    z.x = m.x; z.y = m.y; if(A.k === 'cone'){ z.ang = m.face; z.spread = A.spread; }
    m.wind = A.t;
  } else if(A.k === 'leap'){
    // pula: marca o chão, fica parada se preparando (LEAP_WIND) e só então pula, caindo na marca quando ela termina
    const e = rayEnd(m.x, m.y, hero.x, hero.y, Math.min(14, m.r*.7));
    z.x = e.x; z.y = e.y; z.dur = LEAP_WIND + LEAP_AIR;
    m.wind = LEAP_WIND; m.leapTo = {x:e.x, y:e.y};
  } else if(A.k === 'bomb'){
    // arremesso: o objeto voa em arco até a marca
    z.bomb = {x0:m.x, y0:m.y - m.r*2, type:m.type};
    m.atkT = .36;
  } else m.atkT = .36; // magia: gesto de lançar
  zones.push(z);
  txt(m.x, m.y - m.r*3 - 10, A.n, ec, 11, -20);
}
function monUpdate(m, dt){
  if(m.dead){ m.deadT += dt; return; }
  // no meio do pulo: voa até a marca e não faz mais nada
  if(m.leap){
    const L = m.leap; L.t += dt; const k = clamp(L.t/L.dur, 0, 1);
    m.x = L.x0 + (L.x1 - L.x0)*k; m.y = L.y0 + (L.y1 - L.y0)*k; m.leapH = Math.sin(k*Math.PI)*(70 + m.r*2); m.moving = false; m.anim += dt;
    if(k >= 1){ m.leap = null; m.leapH = 0; m.lx = m.x; m.ly = m.y; }
    return;
  }
  // preparando cone/pisão/pulo: fica parada, tremendo
  if(m.wind > 0){ m.wind -= dt; m.moving = false; }
  // fim do preparo do pulo: sai do chão rumo à marca (rayEnd de novo: pode ter sido empurrada enquanto esperava)
  if(m.leapTo && m.wind <= 0){
    const e = rayEnd(m.x, m.y, m.leapTo.x, m.leapTo.y, Math.min(14, m.r*.7));
    m.leap = {x0:m.x, y0:m.y, x1:e.x, y1:e.y, t:0, dur:LEAP_AIR}; m.leapTo = null;
  }
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
  // só nota o herói se ele estiver perto pelo caminho das salas (não através da parede)
  const fl = LV ? LV.flow[Math.floor(m.y/TILE)*LV_N + Math.floor(m.x/TILE)] : 0;
  if(live && !m.aggro && d < 260 && fl >= 0 && fl <= 9) m.aggro = true;
  if(!live){ m.aggro = false; m.called = false; }
  // grupo: quando uma nota o herói (ou leva dano), chama as outras do mesmo grupo uma vez
  if(m.aggro && m.pack && !m.called){ m.called = true; for(const o of mons) if(o.pack === m.pack && !o.dead && !o.aggro){ o.aggro = true; o.called = true; } }
  if(m.wind > 0) return;
  if(m.atkT > 0){
    m.atkT -= dt; m.moving = false;
    if(!m.fired && m.atkT <= .18){
      m.fired = true;
      if(m.d.ranged){ const an = Math.atan2(hero.y - m.y, hero.x - m.x); projs.push({x:m.x, y:m.y, vx:Math.cos(an)*MON_SHOT, vy:Math.sin(an)*MON_SHOT, a:an, life:1.1, hostile:true, mon:m, dmg:m.dmg, c:m.el ? ELEM[m.el].c : m.d.ranged}); }
      else if(d < m.d.range + m.r + 18) hurtHero(m.dmg, m);
    }
    return;
  }
  // Golpe em área (MON_AOE): marca o chão; o dano sai quando a marca termina (updateZones). O jeito depende da criatura (A.k).
  const A = m.d.aoe;
  if(A){
    m.aoeT = (m.aoeT === undefined ? rnd(1.5, A.cd) : m.aoeT) - dt;
    // cone e pisão são golpes de perto: só começam encostada no herói (senão ele escapa fácil); os outros usam o alcance do golpe
    const reach = A.k === 'cone' || A.k === 'slam' ? m.d.range + m.r + 6 : A.reach;
    if(m.aggro && mode === 'hunt' && m.aoeT <= 0 && d < reach && losClear(m, hero)){
      // pronto e ao alcance: 40% de chance de usar; se não usar, tenta de novo em 1 s
      if(Math.random() < AOE_CHANCE){ monAoe(m, A); return; }
      m.aoeT = A.cd; // falhou nos 40%: só tenta de novo depois da recarga inteira (5 s)
    }
  }
  if(m.aggro){
    m.face = Math.atan2(hero.y - m.y, hero.x - m.x);
    const reach = m.d.ranged ? m.d.range : m.d.range + m.r;
    const see = losClear(m, hero);
    if(d > reach || !see){ monChase(m, fl, dt); m.moving = true; }
    else { m.moving = false; if(m.acd <= 0){ m.atkT = .36; m.fired = false; m.acd = m.d.acd; } }
  } else {
    m.wt -= dt;
    if(m.wt <= 0){ m.wx = m.x + rnd(-90,90); m.wy = m.y + rnd(-90,90); m.wt = rnd(2,5); }
    const wd = Math.hypot(m.wx - m.x, m.wy - m.y);
    // passeando: se bater em parede/obstáculo, escolhe outro destino
    if(wd > 6){ m.face = Math.atan2(m.wy - m.y, m.wx - m.x); if(!monStep(m, m.face, m.spd*.3, dt)){ m.wx = m.x + rnd(-90,90); m.wy = m.y + rnd(-90,90); } m.moving = true; } else m.moving = false;
  }
  m.x = clamp(m.x, 20, WORLD.w - 20); m.y = clamp(m.y, 20, WORLD.h - 20);
}
// Visão livre entre a e b (nenhuma parede no meio; obstáculos não tapam a visão)
function losClear(a, b){
  if(!LV) return true;
  const d = D(a, b), n = Math.ceil(d/24);
  for(let i = 1; i < n; i++){ if(tileAt(a.x + (b.x - a.x)*i/n, a.y + (b.y - a.y)*i/n) === 0) return false; }
  return true;
}
// Criatura anda sem atravessar parede (escorrega nela); devolve false se ficou presa
function monStep(m, ang, sp, dt){
  const r = Math.min(14, m.r*.7), nx = m.x + Math.cos(ang)*sp*dt, ny = m.y + Math.sin(ang)*sp*dt;
  if(walkable(nx, ny, r)){ m.x = nx; m.y = ny; return true; }
  if(walkable(nx, m.y, r)){ m.x = nx; return true; }
  if(walkable(m.x, ny, r)){ m.y = ny; return true; }
  return false;
}
// Caminho reto livre para o corpo da criatura (sem parede nem obstáculo no meio)?
function bodyPathClear(m, to){
  const r = Math.min(14, m.r*.7), d = D(m, to), n = Math.ceil(d/12);
  for(let i = 1; i < n; i++) if(!walkable(m.x + (to.x - m.x)*i/n, m.y + (to.y - m.y)*i/n, r)) return false;
  return true;
}
// Direção pela rota até o herói: vai para o vizinho (8 direções) com caminho menor; diagonal só se não raspar em parede/obstáculo.
// Se o ladrilho depois desse também estiver livre em linha reta, já mira nele (anda mais suave, sem zigue-zague).
function monChaseAng(m, fl){
  if(!LV || fl < 0 || fl === 0) return Math.atan2(hero.y - m.y, hero.x - m.x);
  const N = LV_N, g = LV.g, f = LV.flow, step = (tx, ty, cur) => {
    let best = null, bv = cur;
    for(const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const nx = tx + dx, ny = ty + dy, v = f[ny*N + nx];
      if(nx < 0 || ny < 0 || nx >= N || ny >= N || !(v >= 0) || v >= bv) continue;
      if(dx && dy && (g[ty*N + nx] !== 1 || g[ny*N + tx] !== 1)) continue; // não corta quina
      bv = v; best = [nx, ny, v];
    }
    return best;
  };
  const tx = Math.floor(m.x/TILE), ty = Math.floor(m.y/TILE), a = step(tx, ty, fl);
  if(!a) return Math.atan2(hero.y - m.y, hero.x - m.x);
  let goal = {x:(a[0] + .5)*TILE, y:(a[1] + .5)*TILE};
  const b = step(a[0], a[1], a[2]); if(b){ const g2 = {x:(b[0] + .5)*TILE, y:(b[1] + .5)*TILE}; if(bodyPathClear(m, g2)) goal = g2; }
  return Math.atan2(goal.y - m.y, goal.x - m.x);
}
// Persegue o herói: reto se o caminho estiver livre; senão pela rota. Se travar (não andou), desvia para um lado por um instante.
function monChase(m, fl, dt){
  let ang = bodyPathClear(m, hero) ? m.face : monChaseAng(m, fl);
  if(m.detourT > 0){ m.detourT -= dt; ang = m.detourA; }
  const x0 = m.x, y0 = m.y;
  monStep(m, ang, m.spd, dt);
  const moved = Math.hypot(m.x - x0, m.y - y0), want = m.spd*dt;
  m.stuckT = moved < want*.35 ? (m.stuckT || 0) + dt : 0;
  if(m.stuckT > .3){
    // escolhe o lado que está livre (90° para a esquerda ou direita do caminho)
    const r = Math.min(14, m.r*.7), side = [1, -1].sort(() => Math.random() - .5).find(sd => walkable(m.x + Math.cos(ang + sd*Math.PI/2)*18, m.y + Math.sin(ang + sd*Math.PI/2)*18, r)) || 1;
    m.detourA = ang + side*Math.PI/2*.85; m.detourT = .45; m.stuckT = 0;
  }
}
// O herói está dentro da área? Círculo (raio) ou cone (raio + abertura a partir da criatura)
function zoneHits(z){
  const d = D(z, hero);
  if(z.k !== 'cone') return d < z.r + 8;
  if(d > z.r + 10) return false;
  let da = Math.atan2(hero.y - z.y, hero.x - z.x) - z.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
  return d < 22 || Math.abs(da) <= z.spread/2 + .12;
}
// Áreas marcadas no chão: quando o tempo acaba, explodem e acertam o herói se ele ainda estiver dentro
function updateZones(dt){
  for(const z of zones){
    z.t += dt;
    // pulo, cone e pisão são o corpo da criatura: se ela morreu antes, o golpe não sai
    if((z.k === 'leap' || z.k === 'cone' || z.k === 'slam') && z.mon.dead){ z.done = true; continue; }
    if(z.t >= z.dur && !z.done){
      z.done = true;
      ring(z.x, z.y, z.r, z.c, .4, 4);
      for(let i = 0; i < 18; i++){ const an = Math.random()*TAU, rr = Math.sqrt(Math.random())*z.r; part({x:z.x + Math.cos(an)*rr, y:z.y + Math.sin(an)*rr*.75, vy:rnd(-120,-40), life:.45, size:rnd(2,4), c:z.c}); }
      if(mode === 'hunt' && zoneHits(z)) hurtHero(z.dmg, z.mon);
      if(z.k === 'leap' || z.k === 'slam') for(let i = 0; i < 14; i++){ const an = Math.random()*TAU, sp = rnd(80, 200); part({x:z.x, y:z.y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp - 60, grav:300, life:.5, size:rnd(2,4), c:'#7a6a58'}); }
    }
  }
  zones = zones.filter(z => !z.done);
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
  // empurrões não podem jogar criatura para dentro da parede: volta para o último lugar livre
  for(const m of mons){ if(m.dead) continue; if(walkable(m.x, m.y, Math.min(14, m.r*.7))){ m.lx = m.x; m.ly = m.y; } else if(m.lx !== undefined){ m.x = m.lx; m.y = m.ly; } }
}
function updateField(dt){
  for(const k in cds) cds[k] = Math.max(0, cds[k] - dt);
  if(LV){ LV.flowT -= dt; if(LV.flowT <= 0){ LV.flowT = .2; updateFlow(); markSeen(); } }
  // Mapa limpo: matou todas as criaturas (Masmorra passa de fase em dunKill)
  if(!mapCleared && mapTotal && mode === 'hunt' && !inDun() && !inRmap() && monsLeft() === 0){ // Mapa Aleatório termina no Chefe (rmapBossDown)
    mapCleared = true; log(`${mapDef.name} limpo! Volte para a vila.`, '#f5cf3a'); ring(hero.x, hero.y, 140, '#f5cf3a', 1, 5);
    txt(hero.x, hero.y - 70, 'Mapa limpo!', '#f5cf3a', 24, -18);
  }
  // Masmorra: relógio de DUN_TIME até o Chefe morrer; acabou, a Masmorra fecha e o herói volta para a vila (a Pedra é perdida em enterTown)
  if(inDun() && mode === 'hunt' && S.dun.boss < 2 && dunTime > 0){
    dunTime -= dt;
    if(dunTime <= 0){
      dunTime = 0; log('O tempo acabou! A Masmorra se fechou e a Pedra foi perdida.', '#ff8c80');
      txt(hero.x, hero.y - 70, 'TEMPO ESGOTADO!', '#ff8c80', 22, -16);
      transition(() => enterTown());
    }
  }
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
  updateZones(dt);
  separate();
  mons = mons.filter(m => !m.dead || m.deadT < 1.6);
  for(const p of projs){
    p.x += p.vx*dt; p.y += p.vy*dt; p.life -= dt;
    // projéteis batem na parede (a bola de fogo e a flecha de praga explodem nela)
    if(LV && tileAt(p.x, p.y) === 0){ if(p.boom && !p.hostile) explode(p); p.life = 0; continue; }
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
      if(d.stone){ S.stones[d.stone] = (S.stones[d.stone] || 0) + 1; log(`Pegou Pedra da Masmorra ${d.stone} (${S.stones[d.stone]})`, STONE_C); save(); }
      else if(d.orb){ S.orbs[d.orb]++; log(`Pegou ${ORBS[d.orb].n} (${S.orbs[d.orb]})`, ORBS[d.orb].c); }
      else { S.inv.push(d.it); if(d.it.rar >= 1) log(`Pegou ${d.it.name}`, RAR[d.it.rar].c); }
      dirtyPanel();
    }
  }
  drops = drops.filter(d => !d.gone && (d.t < 90 || d.stone)); // Pedra não some do chão
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
// Vila: o herói anda só quando o jogador manda (joystick/WASD ou toque/clique num ponto). Prédios e fonte bloqueiam (townBlocked em 03).
function townMove(ang, dt){
  const s = ST.ms*dt, nx = hero.x + Math.cos(ang)*s, ny = hero.y + Math.sin(ang)*s;
  hero.face = ang; hero.moving = true; hero.walkT += dt;
  if(!townBlocked(nx, ny)){ hero.x = nx; hero.y = ny; return true; }
  // escorrega pela parede
  if(!townBlocked(nx, hero.y)){ hero.x = nx; return true; }
  if(!townBlocked(hero.x, ny)){ hero.y = ny; return true; }
  return false;
}
/* ---------- CENA DO NÍVEL 40: O GUARDIÃO DA FENDA ---------- */
// Etapas (cut.st): 0 espera · 1 Ezequiel vem da borda até o herói · 2 fala (CUT_A) · 3 anda até a Fenda com o herói atrás
// · 4 a Fenda desperta · 5 fala (CUT_B) · 6 ele vai para o lado da Mesa Rúnica e a cena acaba. Falas na caixa #talk (showTalk em 08).
const CUT_A = [
  'Então é você o caçador de quem a vila inteira fala… Chegou mais longe do que qualquer um lá fora.',
  'Meu nome é Ezequiel. Guardo a Fenda desde antes desta vila existir. Ela dormia — até hoje. Venha comigo.',
];
const CUT_B = [
  'Sentiu? A Fenda acordou com a sua força. Do outro lado ficam criaturas de todos os cantos do mundo.',
  'Cada Pedra da Masmorra abre a Fenda uma vez, e cada nível de Pedra deixa tudo lá dentro mais forte. No fim, um Chefe — e ele sempre guarda uma Pedra.',
  'Mais Pedras você encontra no Mapa Aleatório e lá dentro. Traga 3 iguais para a minha Mesa Rúnica e eu forjo uma mais poderosa.',
  'Tome, leve esta Pedra 1 para conhecer a Fenda. Ela está na sua mochila, na aba Pedras. Boa caçada.',
];
const CUT_START = {x:1065, y:900}, CUT_RIFT = {x:DPORT.x - 66, y:DPORT.y + 44};
function startCut(){ cut = {st:0, t:0}; riftNpc.x = CUT_START.x; riftNpc.y = CUT_START.y; townGoal = null; }
// Ezequiel anda até p; true quando chega
function npcWalk(p, dt, spd){
  const d = D(riftNpc, p); if(d < 5){ riftNpc.moving = false; return true; }
  const a = Math.atan2(p.y - riftNpc.y, p.x - riftNpc.x), s = Math.min(d, (spd || 105)*dt);
  riftNpc.face = a; riftNpc.x += Math.cos(a)*s; riftNpc.y += Math.sin(a)*s; riftNpc.moving = true; riftNpc.walkT += dt;
  return false;
}
function heroWalk(p, dt){ const d = D(hero, p); if(d < 8){ hero.moving = false; return true; } townMove(Math.atan2(p.y - hero.y, p.x - hero.x), dt*.8); return false; }
// Presente do Ezequiel no fim da cena: 1 Pedra 1 para testar (uma vez por personagem; pular a cena também dá)
function giftStone(){
  if(S.riftGift) return; S.riftGift = true;
  S.stones[1] = (S.stones[1] || 0) + 1;
  ring(hero.x, hero.y, 60, STONE_C, .8, 4); txt(hero.x, hero.y - 60, '+1 Pedra da Masmorra', STONE_C, 15, -20);
  log('Ezequiel te deu 1 Pedra da Masmorra 1 (Mochila › Pedras)', STONE_C);
}
function endCut(){
  giftStone(); S.riftIntro = true; cut = null; riftNpc.x = RIFT_NPC.x; riftNpc.y = RIFT_NPC.y; riftNpc.face = Math.PI; riftNpc.moving = false;
  hideTalk();
  const zin = townZones().find(z => D(hero, z) < z.r); townZone = zin ? zin.id : null; // não abre sozinho o painel de onde o herói já está
  if(!S.tut) S.tut = 1; // começa o tutorial da Fenda (tutStep)
  log('A Fenda está aberta! Ande até ela e encaixe a Pedra 1.', '#c9a8ff'); save(); dirtyPanel();
}
// Tutorial da 1ª Masmorra (S.tut): 1 ande até a Fenda · 2 encaixe a Pedra 1 · 3 mate as 50 · 4 mate o Chefe · 5 pegue a Pedra e volte
// · −1 concluído. Se a corrida acabar antes do Chefe, o Ezequiel dá outra Pedra 1 e volta para o passo 1.
const TUT_TXT = {1:'Ande até a Fenda (seta roxa) para abrir a Masmorra', 2:'Toque em "Encaixar a Pedra 1 e entrar"', 3:`Mate as ${DUN_KILLS} criaturas da Masmorra em ${DUN_TIME/60} minutos`, 4:'O Chefe apareceu! Derrote-o (e desvie das marcas no chão)', 5:'Pegue a Pedra que o Chefe deixou e volte para a vila'};
function tutStep(from, to){ if(S.tut === from){ S.tut = to; dirtyPanel(); } }
// chamado ao voltar para a vila: termina o tutorial ou, se a corrida falhou, dá outra Pedra 1 para tentar de novo
function tutTown(){
  if(S.tut === 5){ S.tut = -1; log('Tutorial concluído! Junte 3 Pedras iguais na Mesa Rúnica para subir de nível.', '#f5cf3a'); }
  else if(S.tut === 3 || S.tut === 4){ S.tut = 1; S.stones[1] = (S.stones[1] || 0) + 1; log('Ezequiel: "Não desanime. Tome outra Pedra 1 e tente de novo."', '#c9a8ff'); }
}
function updateCut(dt){
  const c = cut; c.t += dt; hero.moving = false;
  if(c.st === 0){ if(c.t > .8){ c.st = 1; log(`${RIFT_NPC.n} se aproxima…`, '#c9a8ff'); } }
  else if(c.st === 1){
    const side = riftNpc.x > hero.x ? 44 : -44;
    hero.face = Math.atan2(riftNpc.y - hero.y, riftNpc.x - hero.x);
    if(npcWalk({x:hero.x + side, y:hero.y + 4}, dt)){ riftNpc.face = Math.atan2(hero.y - riftNpc.y, hero.x - riftNpc.x); c.st = 2; showTalk(RIFT_NPC.n, CUT_A, () => { c.st = 3; }); }
  }
  else if(c.st === 3){
    const npcIn = npcWalk(CUT_RIFT, dt, 90), follow = {x:riftNpc.x - Math.cos(riftNpc.face)*46, y:riftNpc.y - Math.sin(riftNpc.face)*46 + 6};
    if(D(hero, riftNpc) > 40) heroWalk(follow, dt);
    if(npcIn && D(hero, riftNpc) < 70){ c.st = 4; c.t = 0; riftNpc.face = Math.atan2(DPORT.y - riftNpc.y, DPORT.x - riftNpc.x); hero.face = riftNpc.face;
      S.riftIntro = true; // a Fenda desperta (desenho muda em 07)
      for(let i = 0; i < 50; i++){ const an = Math.random()*TAU, sp = rnd(60, 220); part({x:DPORT.x, y:DPORT.y - 40, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp - 30, life:rnd(.6, 1.2), size:rnd(2, 4.5), c:pick(['#c08aff','#f0d8ff','#7a4ac8'])}); }
      ring(DPORT.x, DPORT.y, 150, '#c08aff', 1.2, 6); ring(DPORT.x, DPORT.y, 90, '#f0d8ff', .9, 3);
      txt(DPORT.x, DPORT.y - 120, 'A FENDA DESPERTOU', '#e0b0ff', 20, -12);
    }
  }
  else if(c.st === 4){ if(c.t > 1.6){ c.st = 5; riftNpc.face = Math.atan2(hero.y - riftNpc.y, hero.x - riftNpc.x); showTalk(RIFT_NPC.n, CUT_B, () => { c.st = 6; giftStone(); }); } }
  else if(c.st === 6){ if(npcWalk(RIFT_NPC, dt, 80)) endCut(); }
}
function updateTown(dt){
  for(const k in cds) cds[k] = Math.max(0, cds[k] - dt);
  heroTimers(dt);
  if(cut && mode === 'town'){ updateCut(dt); if(hero.hp < ST.life) hero.hp = Math.min(ST.life, hero.hp + ST.life*.4*dt); return; }
  if(mode === 'town'){
    // movimento: joystick/WASD tem prioridade; senão, anda até o ponto tocado
    let ang = manualDir();
    if(ang !== null) townGoal = null;
    else if(townGoal){ if(D(hero, townGoal) < 8) townGoal = null; else ang = Math.atan2(townGoal.y - hero.y, townGoal.x - hero.x); }
    if(ang !== null){ townIdle = false; if(!townMove(ang, dt) && townGoal) townGoal = null; } else hero.moving = false;
    // cura em qualquer lugar da vila
    if(hero.hp < ST.life){
      hero.hp = Math.min(ST.life, hero.hp + ST.life*.4*dt);
      if(Math.random() < dt*14){ const an = Math.random()*TAU; part({x:hero.x + Math.cos(an)*14, y:hero.y + Math.sin(an)*8, vy:-50, life:.7, size:2, c:'#9fe0ff'}); }
    }
    // portas: chegar na frente de um prédio abre o painel dele (uma vez por visita à porta)
    const z = townZones().find(z => D(hero, z) < z.r);
    if(z && townZone !== z.id){ townZone = z.id; townGoal = null; hero.moving = false; if(!uiOpen()) openTab(z.tab); }
    if(!z) townZone = null;
    // portal de saída: entrar nele (depois de ter saído de perto) parte para a caçada
    if(D(hero, TPORT) > 90) townArmed = true;
    if(townArmed && D(hero, TPORT) < 26) depart();
  } else if(mode === 'townLeave'){
    if(moveTo(townExit, dt, .9)){ hero.scale = Math.max(0, hero.scale - dt*2.5); if(hero.scale < .3) transition(() => enterMap(S.map)); }
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
  // vila: a câmera não mostra o vazio fora dela (tela deitada vê pouco na altura)
  if(scene === 'town'){
    const hw = cw/2/zoom, hh = ch/2/zoom;
    cam.x = TOWN_W > hw*2 ? clamp(cam.x, hw, TOWN_W - hw) : TOWN_W/2;
    cam.y = TOWN_H > hh*2 ? clamp(cam.y, hh, TOWN_H - hh) : TOWN_H/2;
  }
}
