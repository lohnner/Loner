// Batalha: spawn, dano, veneno, morte, loot, XP/nível/Paragon, ataque básico e habilidades (cast/doSkill).
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- COMBATE ---------- */
function poison(m, total, dur){
  if(m.dead || total <= 0) return;
  m.poisons.push({dps: total/dur, t: dur});
  if(m.poisons.length > 14){ m.poisons.sort((a, b) => a.dps*a.t - b.dps*b.t); m.poisons.shift(); }
}
const poisonLeft = m => m.poisons.reduce((s, p) => s + p.dps*p.t, 0);
function dealHit(m, dmg, crit, color){
  if(m.dead) return;
  m.hp -= dmg; m.hit = .12; m.aggro = true;
  txt(m.x + rnd(-6,6), m.y - m.r - 8, fmt(dmg) + (crit ? '!' : ''), crit ? '#ffd24a' : (color || '#f3efe2'), crit ? 17 : 13);
  if(ST.ls > 0 && scene === 'map'){ hero.hp = Math.min(ST.life, hero.hp + dmg*ST.ls/100); }
  if(m.hp <= 0) kill(m);
}
function kill(m){
  if(m.dead) return;
  m.dead = true; m.deadT = 0; S.kills++;
  let xp = (6 + m.ml*4.5) * (m.elite ? 3.5 : 1);
  xp *= xpMult(mapDef);
  gainXp(xp);
  for(let i = 0; i < 10; i++) part({x:m.x, y:m.y, vx:rnd(-90,90), vy:rnd(-110,40), grav:240, life:rnd(.4,.8), size:rnd(1.5,3.5), c:m.d.c1});
  const cr = ST.rk('contagion');
  if(cr && m.poisons.length){
    const rem = poisonLeft(m) * (.3 + .1*cr);
    for(const o of mons) if(!o.dead && o !== m && D(o, m) < 95){ poison(o, rem, 3*ST.pdur); for(let i = 0; i < 4; i++){ const k = i/4; part({x:m.x + (o.x-m.x)*k, y:m.y + (o.y-m.y)*k, life:.4, size:3, c:'#9bd84a'}); } }
    ring(m.x, m.y, 60, '#9bd84a', .45, 2);
  }
  if(m.elite || Math.random() < .55){
    const v = Math.max(1, Math.round((3 + m.ml*2) * rnd(.6, 1.4) * (m.elite ? 3 : 1) * (1 + ST.gf/100)));
    const n = m.elite ? 4 : 1;
    for(let i = 0; i < n; i++) coins.push({x:m.x + rnd(-14,14), y:m.y + rnd(-14,14), v:Math.ceil(v/n), t:rnd(0,.2)});
  }
  if(Math.random() < (m.elite ? .75 : .12)) dropItem(m);
  if(m.elite && Math.random() < .35) dropItem(m);
}
function dropItem(m){
  const rar = rollRar(m.elite), it = genItem(m.ml + (m.elite ? 1 : 0), rar);
  drops.push({x:m.x + rnd(-16,16), y:m.y + rnd(-16,16), it, t:0, gone:false});
  if(rar >= 2) log(`${RAR[rar].n} caiu: ${it.name}`, RAR[rar].c);
  if(rar === 3) ring(m.x, m.y, 90, '#ff8a2b', .9, 4);
}
function gainXp(x){
  if(S.lv >= MAX_LV){ gainParagon(x); return; }
  S.xp += x;
  while(S.lv < MAX_LV && S.xp >= xpNeed(S.lv)){
    S.xp -= xpNeed(S.lv); S.lv++; refreshStats(); hero.hp = ST.life;
    ring(hero.x, hero.y, 80, '#e2ae4a', .9, 4); ring(hero.x, hero.y, 50, '#ffe39a', .7, 2);
    txt(hero.x, hero.y - 46, 'NÍVEL ' + S.lv, '#e2ae4a', 20, -24);
    log(S.lv === MAX_LV ? `Nível máximo ${MAX_LV}! A XP agora vira níveis de Paragon.` : `Nível ${S.lv}! Ponto de habilidade para gastar na cidade.`, '#e2ae4a');
    dirtyPanel(); rankDirty = true;
  }
  if(S.lv >= MAX_LV && S.xp > 0){ const rest = S.xp; S.xp = 0; gainParagon(rest); }
}
// Paragon (estilo Diablo 3): depois do 40 cada nível dá 1 ponto em bônus pequenos; o nível 40 não muda
const parNeed = p => Math.floor(xpNeed(MAX_LV) * (1 + p*.02));
function gainParagon(x){
  S.pxp += x;
  while(S.pxp >= parNeed(S.par)){
    S.pxp -= parNeed(S.par); S.par++; refreshStats();
    ring(hero.x, hero.y, 80, '#b48cff', .9, 4); ring(hero.x, hero.y, 50, '#e2d4ff', .7, 2);
    txt(hero.x, hero.y - 46, 'PARAGON ' + S.par, '#c9a8ff', 20, -24);
    log(`Paragon ${S.par}! Ponto de Paragon para gastar no Herói.`, '#c9a8ff');
    dirtyPanel(); rankDirty = true;
  }
}
const PARA = {
  dmg:{n:'Ataque', d:v => `+${v}% de dano da arma`, max:0},
  pois:{n:'Veneno', d:v => `+${n1(v*1.5)}% de dano de veneno`, max:50},
  life:{n:'Defesa', d:v => `+${v}% de vida`, max:50},
  ias:{n:'Agilidade', d:v => `+${n1(v*.5)}% de velocidade de ataque`, max:50},
};
const parFree = () => S.par - Object.values(S.pp).reduce((a, v) => a + v, 0);
function hurtHero(dmg, src){
  if(scene !== 'map' || mode === 'dead' || hero.scale < .6) return;
  const red = ST.armor / (ST.armor + 40 + 8*(src ? src.ml : 1)), d = dmg * (1 - red);
  hero.hp -= d; hero.hit = .14; hero.lastHit = T;
  txt(hero.x + rnd(-6,6), hero.y - 28, fmt(d), '#ff6a5a', 14);
  if(src && src.d.leech) src.hp = Math.min(src.hpMax, src.hp + d*.6);
  if(hero.hp <= 0) die();
}
function die(){
  hero.hp = 0; mode = 'dead'; deadT = 0; hero.atk = hero.cast = null; portal = null;
  const lost = Math.floor(S.gold * .1); S.gold -= lost;
  for(let i = 0; i < 24; i++) part({x:hero.x, y:hero.y, vx:rnd(-120,120), vy:rnd(-140,40), grav:260, life:rnd(.5,1.1), size:rnd(2,4), c:'#b32d22'});
  log(`${heroName()} caiu! Perdeu ${fmt(lost)} de ouro.`, '#ff8c80');
}
function shoot(ang, o){
  const spd = o.spd || 640;
  projs.push(Object.assign({x:hero.x + Math.cos(ang)*14, y:hero.y + Math.sin(ang)*14, vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd, a:ang, life:.6, hostile:false}, o));
}
function nearestMon(from, maxD){
  let best = null, bd = maxD || 1e9;
  for(const m of mons) if(!m.dead){ const d = D(m, from); if(d < bd){ bd = d; best = m; } }
  return best;
}
function rollCrit(){ return Math.random()*100 < ST.crit ? ST.critd/100 : 1; }
function fireBasic(tgt){
  if(!tgt || tgt.dead) tgt = nearestMon(hero, RANGE + 60); if(!tgt) return;
  const ang = Math.atan2(tgt.y - hero.y, tgt.x - hero.x), cm = rollCrit();
  const dmg = rnd(ST.min, ST.max) * cm, tr = ST.rk('tip');
  shoot(ang, {kind:'arrow', dmg, crit:cm > 1, pois: tr ? dmg*(.4 + .2*tr)*ST.pois : 0, pdur:3*ST.pdur, spd:660});
}
function bestCluster(list){
  let best = {m:list[0], n:0};
  for(const m of list){ let n = 0; for(const o of mons) if(!o.dead && D(o, m) < 85) n++; if(n > best.n) best = {m, n}; }
  return best;
}
function manualCast(id, aimAt){
  if(!ST.rk(id)){ openTab('hero'); return; }
  if(scene !== 'map' || mode !== 'hunt'){ log('As habilidades só funcionam durante a caçada'); return; }
  if(cds[id] > 0) return;
  if(hero.cast){ hero.queued = id; hero.queuedAim = aimAt || null; return; }
  if(aimAt && AIMABLE[id]) return cast(id, {x:aimAt.x, y:aimAt.y});
  if(id === 'arrow'){
    const f = aimAt && aimAt.tgt && !aimAt.tgt.dead ? aimAt.tgt : getFocus();
    if(f){ if(D(f, hero) > ARROW_REACH){ log('Alvo fora de alcance'); return; } return cast('arrow', {tgt:f}); }
  }
  const near = mons.filter(m => !m.dead && D(m, hero) < RANGE + 40).sort((a, b) => D(a, hero) - D(b, hero));
  if(id === 'burst'){
    if(!mons.some(m => !m.dead && m.poisons.length && D(m, hero) < 280)){ log('Nenhum inimigo envenenado por perto'); return; }
    return cast('burst', {});
  }
  if(!near.length){ log('Nenhum inimigo ao alcance'); return; }
  if(id === 'rain'){ const c = bestCluster(near); return cast('rain', {x:c.m.x, y:c.m.y}); }
  if(id === 'fan') return cast('fan', {x:near[0].x, y:near[0].y});
  let t = near[0]; for(const m of near){ if(m.hp - poisonLeft(m) > t.hp - poisonLeft(t)) t = m; }
  return cast('arrow', {tgt:t});
}
function cast(id, data){
  hero.atk = null;
  hero.cast = {id, t:0, dur: id === 'rain' ? .45 : id === 'burst' ? .4 : .32, done:false, data};
  cds[id] = SKD[id].cd * (1 - ST.cdr/100);
  if(data && data.tgt) hero.face = Math.atan2(data.tgt.y - hero.y, data.tgt.x - hero.x);
  if(data && data.x !== undefined) hero.face = Math.atan2(data.y - hero.y, data.x - hero.x);
}
function trySkills(tgt){
  const near = mons.filter(m => !m.dead && D(m, hero) < RANGE + 20);
  if(!near.length) return;
  if(canCast('burst')){
    const pz = mons.filter(m => !m.dead && m.poisons.length && D(m, hero) < 280);
    if(pz.length >= 2 || pz.some(m => m.elite && poisonLeft(m) > m.hp*.25)) return cast('burst', {});
  }
  if(canCast('rain')){ const c = bestCluster(near); if(c.n >= 2 || c.m.elite) return cast('rain', {x:c.m.x, y:c.m.y}); }
  if(canCast('fan') && (near.length >= 2 || tgt.elite)) return cast('fan', {x:tgt.x, y:tgt.y});
  if(canCast('arrow')){
    let t = near[0]; for(const m of near){ const s = m.hp - poisonLeft(m), st = t.hp - poisonLeft(t); if(s > st) t = m; }
    return cast('arrow', {tgt:t});
  }
}
function doSkill(c){
  const r = ST.rk(c.id), a = ST.avg;
  if(c.id === 'arrow'){
    let t = c.data.tgt; if(!t || t.dead) t = nearestMon(hero, RANGE + 80); if(!t) return;
    const ang = Math.atan2(t.y - hero.y, t.x - hero.x), cm = rollCrit();
    shoot(ang, {kind:'parrow', dmg:a*(1.2 + .15*r)*cm, crit:cm > 1, pois:a*(1.5 + .4*r)*ST.pois, pdur:4*ST.pdur, spd:720, life:.7});
    for(let i = 0; i < 8; i++) part({x:hero.x + Math.cos(ang)*16, y:hero.y + Math.sin(ang)*16, vx:Math.cos(ang + rnd(-.7,.7))*rnd(40,120), vy:Math.sin(ang + rnd(-.7,.7))*rnd(40,120), life:.35, size:2.5, c:'#b8f070'});
  } else if(c.id === 'fan'){
    const base = Math.atan2(c.data.y - hero.y, c.data.x - hero.x), n = fanCount(), pb = fanPointBlank(base);
    if(pb){
      // Criatura colada no herói: todas as flechas do leque acertam ela
      for(let i = 0; i < n; i++){ const cm = rollCrit(); dealHit(pb, a*(.6 + .08*r)*cm, cm > 1); poison(pb, a*(.6 + .15*r)*ST.pois, 3*ST.pdur); }
      txt(pb.x, pb.y - pb.r - 22, '×' + n, '#d8f07a', 16);
      ring(pb.x, pb.y, pb.r*1.8, '#d8f07a', .35, 3);
      for(let i = 0; i < 12; i++){ const an = base + rnd(-.8, .8); part({x:pb.x, y:pb.y, vx:Math.cos(an)*rnd(60,160), vy:Math.sin(an)*rnd(60,160), life:.35, size:2.5, c:'#d8f07a'}); }
    } else {
      for(let i = 0; i < n; i++){ const ang = fanAng(base, i, n), cm = rollCrit(); shoot(ang, {kind:'farrow', dmg:a*(.6 + .08*r)*cm, crit:cm > 1, pois:a*(.6 + .15*r)*ST.pois, pdur:3*ST.pdur, spd:600, life:.6}); }
    }
    ring(hero.x + Math.cos(base)*14, hero.y + Math.sin(base)*14, 26, '#d8f07a', .25, 2);
  } else if(c.id === 'rain'){
    for(let i = 0; i < 3; i++) part({x:hero.x + rnd(-4,4), y:hero.y - 10, vx:rnd(-20,20), vy:-420, life:.35, size:2, c:'#c8f080', kind:'streak'});
    const x = c.data.x, y = c.data.y, rad = 70 + 5*r, dps = a*(.6 + .15*r)*ST.pois;
    later.push({t:.4, fn:() => { clouds.push({x, y, r:rad, t:0, dur:4, tick:0, dps}); ring(x, y, rad, '#9bd84a', .5, 3); }});
  } else if(c.id === 'burst'){
    const list = mons.filter(m => !m.dead && m.poisons.length && D(m, hero) < 280);
    ring(hero.x, hero.y, 120, '#9bd84a', .5, 4);
    for(const m of list){
      const rem = poisonLeft(m);
      for(const o of mons) if(o !== m && !o.dead && D(o, m) < 75) poison(o, rem*.3, 3*ST.pdur);
      ring(m.x, m.y, 46, '#c8f080', .45, 3);
      for(let i = 0; i < 10; i++){ const an = Math.random()*TAU; part({x:m.x, y:m.y, vx:Math.cos(an)*rnd(60,160), vy:Math.sin(an)*rnd(60,160), life:.5, size:3, c:'#9bd84a'}); }
      dealHit(m, rem*(.5 + .1*r), false, '#c8f080');
    }
  }
}
