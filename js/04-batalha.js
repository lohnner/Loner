// Batalha: dano, veneno e sangramento, morte, loot, XP/nível/Paragon, ataque básico e habilidades das classes (cast/doSkill).
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- DANO AO LONGO DO TEMPO ---------- */
// Veneno (Arqueiro) e sangramento (Guerreiro) acumulam pilhas {dps, t}. O sangramento dói 50% mais enquanto o inimigo anda (06-cena.js).
function addDot(list, total, dur){
  list.push({dps: total/dur, t: dur});
  if(list.length > 14){ list.sort((a, b) => a.dps*a.t - b.dps*b.t); list.shift(); }
}
function poison(m, total, dur){ if(!m.dead && total > 0) addDot(m.poisons, total, dur); }
function bleed(m, total, dur){ if(!m.dead && total > 0) addDot(m.bleeds, total, dur); }
const poisonLeft = m => m.poisons.reduce((s, p) => s + p.dps*p.t, 0);
const bleedLeft = m => m.bleeds.reduce((s, p) => s + p.dps*p.t, 0);
// Aplica o dano ao longo do tempo da classe atual
const applyDot = (m, total, dur) => isWar() ? bleed(m, total, dur) : poison(m, total, dur);
const dotLeft = m => isWar() ? bleedLeft(m) : poisonLeft(m);
const hasDot = m => isWar() ? m.bleeds.length > 0 : m.poisons.length > 0;
const DOT_C = () => isWar() ? '#e0574a' : '#9bd84a';

/* ---------- COMBATE ---------- */
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
  const bl = ST.rk('bloodlust');
  if(bl && m.bleeds.length && scene === 'map' && mode === 'hunt'){
    const heal = ST.life * (1.5 + .5*bl) / 100;
    hero.hp = Math.min(ST.life, hero.hp + heal);
    txt(hero.x + rnd(-8,8), hero.y - 34, '+' + fmt(heal), '#7fe08a', 12, -30);
    for(let i = 0; i < 5; i++){ const k = i/5; part({x:m.x + (hero.x-m.x)*k, y:m.y + (hero.y-m.y)*k, life:.35, size:2.5, c:'#e0574a'}); }
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
    log(S.lv === MAX_LV ? `Nível máximo ${MAX_LV}! A XP agora vira níveis de Paragon.` : `Nível ${S.lv}! Ponto de habilidade para gastar no Herói.`, '#e2ae4a');
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
// O grupo "pois" vale para o dano ao longo do tempo da classe (veneno ou sangramento)
const PARA = {
  dmg:{n:'Ataque', d:v => `+${v}% de dano da arma`, max:0},
  pois:{get n(){ return dotT(); }, d:v => `+${n1(v*1.5)}% de dano de ${dotN()}`, max:50},
  life:{n:'Defesa', d:v => `+${v}% de vida`, max:50},
  ias:{n:'Agilidade', d:v => `+${n1(v*.5)}% de velocidade de ataque`, max:50},
};
const parFree = () => S.par - Object.values(S.pp).reduce((a, v) => a + v, 0);
function hurtHero(dmg, src){
  if(scene !== 'map' || mode === 'dead' || hero.scale < .6) return;
  const red = ST.armor / (ST.armor + 40 + 8*(src ? src.ml : 1)), d = dmg * (1 - red) * (1 - (ST.dr || 0));
  hero.hp -= d; hero.hit = .14; hero.lastHit = T;
  txt(hero.x + rnd(-6,6), hero.y - 28, fmt(d), '#ff6a5a', 14);
  if(src && src.d.leech) src.hp = Math.min(src.hpMax, src.hp + d*.6);
  if(hero.hp <= 0) die();
}
function die(){
  hero.hp = 0; mode = 'dead'; deadT = 0; hero.atk = hero.cast = hero.whirl = hero.dash = null; portal = null;
  const lost = Math.floor(S.gold * .1); S.gold -= lost;
  for(let i = 0; i < 24; i++) part({x:hero.x, y:hero.y, vx:rnd(-120,120), vy:rnd(-140,40), grav:260, life:rnd(.5,1.1), size:rnd(2,4), c:'#b32d22'});
  log(`${heroName()} caiu! Perdeu ${fmt(lost)} de ouro.`, '#ff8c80');
}
function shoot(ang, o){
  const spd = o.spd || 640;
  projs.push(Object.assign({x:hero.x + Math.cos(ang)*14, y:hero.y + Math.sin(ang)*14, vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd, a:ang, life:.6, hostile:false}, o));
}
function nearestMon(from, maxD){
  let best = null, bd = 1e9;
  for(const m of mons) if(!m.dead){ const d = D(m, from); if(d < bd){ bd = d; best = m; } }
  return best;
}
function rollCrit(){ return Math.random()*100 < ST.crit ? ST.critd/100 : 1; }
// Golpe de lâmina: acerta e, com Lâmina Serrilhada, faz sangrar
function meleeHit(m, mult, bleedTotal){
  const cm = rollCrit(), dmg = rnd(ST.min, ST.max) * mult * cm;
  dealHit(m, dmg, cm > 1);
  if(bleedTotal) bleed(m, bleedTotal, 4*ST.pdur);
  for(let i = 0; i < 5; i++){ const an = Math.atan2(m.y - hero.y, m.x - hero.x) + rnd(-.9, .9); part({x:m.x, y:m.y, vx:Math.cos(an)*rnd(50,140), vy:Math.sin(an)*rnd(50,140), life:.3, size:2.2, c:'#e0574a'}); }
  return dmg;
}
function fireBasic(tgt){
  if(isWar()){
    if(!tgt || tgt.dead || D(tgt, hero) > MELEE + tgt.r + 14) tgt = nearestMon(hero, MELEE + 30); if(!tgt) return;
    const cm = rollCrit(), dmg = rnd(ST.min, ST.max) * cm, sr = ST.rk('serrated');
    dealHit(tgt, dmg, cm > 1);
    if(sr) bleed(tgt, dmg*(.4 + .2*sr)*ST.pois, 3*ST.pdur);
    hero.swing = .22;
    return;
  }
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
const BURST_R = 300, RUPT_R = 140, CLEAVE_REACH = 170, CHARGE_LEN = 260;
const whirlR = () => 80 + 3*ST.rk('whirl');
// Usar habilidade (botão, tecla ou mira). aimAt = ponto mirado {x,y} ou alvo {tgt}.
function manualCast(id, aimAt){
  if(!ST.rk(id)){ openTab('hero'); return; }
  if(scene !== 'map' || mode !== 'hunt'){ log('As habilidades só funcionam durante a caçada'); return; }
  if(cds[id] > 0) return;
  if(hero.cast || hero.dash){ hero.queued = id; hero.queuedAim = aimAt || null; return; }
  if(aimAt && AIMABLE[id] && aimAt.x !== undefined) return cast(id, {x:aimAt.x, y:aimAt.y});
  const live = mons.filter(m => !m.dead), byDist = (a, b) => D(a, hero) - D(b, hero);
  // Alvo único (Flecha Venenosa / Golpe Dilacerante): alvo clicado, alvo sob o mouse ou o melhor perto
  if(id === 'arrow' || id === 'cleave'){
    const reach = id === 'arrow' ? ARROW_REACH : CLEAVE_REACH;
    const f = aimAt && aimAt.tgt && !aimAt.tgt.dead ? aimAt.tgt : getFocus();
    if(f){ if(D(f, hero) > reach){ log('Alvo fora de alcance'); return; } return cast(id, {tgt:f}); }
    const near = live.filter(m => D(m, hero) < (id === 'arrow' ? RANGE + 40 : CLEAVE_REACH)).sort(byDist);
    if(!near.length){ log('Nenhum inimigo ao alcance'); return; }
    let t = near[0]; if(id === 'arrow') for(const m of near){ if(m.hp - poisonLeft(m) > t.hp - poisonLeft(t)) t = m; }
    return cast(id, {tgt:t});
  }
  if(id === 'burst'){
    if(!live.some(m => D(m, hero) < BURST_R)){ log('Nenhum inimigo por perto'); return; }
    return cast('burst', {});
  }
  if(id === 'rupture'){
    if(!live.some(m => D(m, hero) < RUPT_R + 40)){ log('Chegue mais perto dos inimigos'); return; }
    return cast('rupture', {});
  }
  if(id === 'whirl') return cast('whirl', {});
  const near = live.filter(m => D(m, hero) < RANGE + 40).sort(byDist);
  if(!near.length){ log('Nenhum inimigo ao alcance'); return; }
  if(id === 'rain'){ const c = bestCluster(near); return cast('rain', {x:c.m.x, y:c.m.y}); }
  if(id === 'charge'){ const c = bestCluster(near); return cast('charge', {x:c.m.x, y:c.m.y}); }
  if(id === 'fan') return cast('fan', {x:near[0].x, y:near[0].y});
}
const CAST_DUR = {rain:.45, burst:.5, rupture:.5, charge:.12, whirl:.15, cleave:.28};
function cast(id, data){
  hero.atk = null;
  hero.cast = {id, t:0, dur: CAST_DUR[id] || .32, done:false, data};
  cds[id] = SKD[id].cd * (1 - ST.cdr/100);
  if(data && data.tgt) hero.face = Math.atan2(data.tgt.y - hero.y, data.tgt.x - hero.x);
  if(data && data.x !== undefined) hero.face = Math.atan2(data.y - hero.y, data.x - hero.x);
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
    // Ultimate do Arqueiro: onda de praga que envenena todos em volta e detona o veneno que já existia
    const list = mons.filter(m => !m.dead && D(m, hero) < BURST_R);
    const rems = list.map(m => poisonLeft(m));
    ring(hero.x, hero.y, BURST_R, '#9bd84a', .7, 6); ring(hero.x, hero.y, BURST_R*.6, '#d8f07a', .5, 3);
    for(let i = 0; i < 40; i++){ const an = Math.random()*TAU, sp = rnd(180, 420); part({x:hero.x, y:hero.y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp, life:.7, size:rnd(2,4), c:i % 3 ? '#9bd84a' : '#d8f07a'}); }
    list.forEach((m, i) => {
      const rem = rems[i];
      if(rem > 0){
        for(const o of mons) if(o !== m && !o.dead && D(o, m) < 110) poison(o, rem*.5, 3*ST.pdur);
        ring(m.x, m.y, 46, '#c8f080', .45, 3);
        dealHit(m, rem*(1 + .15*r), false, '#c8f080');
      }
      poison(m, a*(3 + .5*r)*ST.pois, 4*ST.pdur);
    });
  } else if(c.id === 'cleave'){
    let t = c.data.tgt; if(!t || t.dead) t = nearestMon(hero, CLEAVE_REACH); if(!t) return;
    // Avança até encostar no alvo
    const d = D(t, hero), stop = t.r + 14;
    if(d > stop){ const an = Math.atan2(t.y - hero.y, t.x - hero.x), mv = Math.min(d - stop, CLEAVE_REACH); for(let i = 0; i < 6; i++) part({x:hero.x + Math.cos(an)*mv*i/6, y:hero.y + Math.sin(an)*mv*i/6, life:.25, size:3, c:'rgba(220,220,230,.6)'}); hero.x += Math.cos(an)*mv; hero.y += Math.sin(an)*mv; }
    hero.face = Math.atan2(t.y - hero.y, t.x - hero.x);
    meleeHit(t, 1.5 + .15*r, a*(1.5 + .4*r)*ST.pois);
    ring(t.x, t.y, t.r*1.7, '#e0574a', .3, 3); hero.swing = .28;
  } else if(c.id === 'charge'){
    const an = Math.atan2(c.data.y - hero.y, c.data.x - hero.x), len = Math.min(CHARGE_LEN, Math.max(60, D(c.data, hero)));
    hero.face = an;
    hero.dash = {x0:hero.x, y0:hero.y, x1:clamp(hero.x + Math.cos(an)*len, 20, WORLD.w - 20), y1:clamp(hero.y + Math.sin(an)*len, 20, WORLD.h - 20), t:0, dur:.24, hit:new Set(), mult:.7 + .08*r, dot:a*(.55 + .13*r)*ST.pois};
  } else if(c.id === 'whirl'){
    hero.whirl = {t:0, dur:2, tick:0, ang:0, mult:.25 + .025*r, dot:a*(.17 + .04*r)*ST.pois};
  } else if(c.id === 'rupture'){
    // Ultimate do Guerreiro: esmaga o chão, detona o sangramento e abre um novo
    const list = mons.filter(m => !m.dead && D(m, hero) < RUPT_R + m.r);
    ring(hero.x, hero.y, RUPT_R, '#e0574a', .6, 7); ring(hero.x, hero.y, RUPT_R*.55, '#ffb09a', .4, 3);
    for(let i = 0; i < 36; i++){ const an = Math.random()*TAU, sp = rnd(120, 300); part({x:hero.x + Math.cos(an)*20, y:hero.y + Math.sin(an)*20, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp - 60, grav:300, life:.6, size:rnd(2,4.5), c:i % 3 ? '#7a5a40' : '#e0574a'}); }
    for(const m of list){
      const rem = bleedLeft(m);
      meleeHit(m, 1.7 + .2*r, 0);
      if(rem > 0 && !m.dead){ dealHit(m, rem*(1 + .15*r), false, '#ff8a7a'); ring(m.x, m.y, 40, '#ff8a7a', .4, 3); }
      bleed(m, a*(2 + .4*r)*ST.pois, 4*ST.pdur);
    }
    hero.swing = .35;
  }
}
