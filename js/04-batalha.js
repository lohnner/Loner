// Batalha: dano, veneno e sangramento, morte, loot, XP/nível/Maestria, ataque básico e habilidades das classes (cast/doSkill).
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
function burn(m, total, dur){ if(!m.dead && total > 0) addDot(m.burns, total, dur); }
const poisonLeft = m => m.poisons.reduce((s, p) => s + p.dps*p.t, 0);
const bleedLeft = m => m.bleeds.reduce((s, p) => s + p.dps*p.t, 0);
const burnLeft = m => m.burns.reduce((s, p) => s + p.dps*p.t, 0);
// Aplica o dano ao longo do tempo da classe atual
const applyDot = (m, total, dur) => isWar() ? bleed(m, total, dur) : isMage() ? burn(m, total, dur) : poison(m, total, dur);
const dotLeft = m => isWar() ? bleedLeft(m) : isMage() ? burnLeft(m) : poisonLeft(m);
const hasDot = m => (isWar() ? m.bleeds : isMage() ? m.burns : m.poisons).length > 0;
const DOT_C = () => isWar() ? '#e0574a' : isMage() ? '#ff8a2b' : '#9bd84a';

/* ---------- COMBATE ---------- */
// Bônus temporário do herói (Fúria do Titã): hero.buff = {t, dmg, aps, ls}; heroBuff('dmg') = multiplicador (1 sem bônus)
const heroBuff = k => hero.buff && hero.buff.t > 0 ? (hero.buff[k] || 1) : 1;
function dealHit(m, dmg, crit, color){
  if(m.dead) return;
  dmg *= heroBuff('dmg');
  m.hp -= dmg; m.hit = .12; m.aggro = true;
  txt(m.x + rnd(-6,6), m.y - m.r - 8, fmt(dmg) + (crit ? '!' : ''), crit ? '#ffd24a' : (color || '#f3efe2'), crit ? 17 : 13);
  const ls = ST.ls + (hero.buff && hero.buff.t > 0 ? hero.buff.ls || 0 : 0);
  if(ls > 0 && scene === 'map'){ hero.hp = Math.min(ST.life, hero.hp + dmg*ls/100); }
  if(m.hp <= 0) kill(m);
}
function kill(m){
  if(m.dead) return;
  m.dead = true; m.deadT = 0; S.kills++;
  let xp = (8 + m.ml*6) * (m.elite ? 3.5 : 1); // ~35% a mais que antes (era 6 + nível × 4,5)
  xp *= xpMult(mapDef);
  if(inDun()){ xp *= dunMult(S.dun.phase) * (m.boss ? 6 : 1); if(m.boss) dunBossDown(m); else if(!m.minion) dunKill(); }
  else if(inRmap()){ xp *= dunMult(S.rmap.tier) * (m.boss ? 6 : 1); if(m.boss) rmapBossDown(m); else if(!m.minion) rmapKill(); }
  dropStone(m);
  gainXp(xp);
  for(let i = 0; i < 10; i++) part({x:m.x, y:m.y, vx:rnd(-90,90), vy:rnd(-110,40), grav:240, life:rnd(.4,.8), size:rnd(1.5,3.5), c:m.d.c1});
  const cr = ST.rk('contagion');
  if(cr && m.poisons.length){
    const rem = poisonLeft(m) * (.3 + .1*cr);
    for(const o of mons) if(!o.dead && o !== m && D(o, m) < 95){ poison(o, rem, 3*ST.pdur); for(let i = 0; i < 4; i++){ const k = i/4; part({x:m.x + (o.x-m.x)*k, y:m.y + (o.y-m.y)*k, life:.4, size:3, c:'#9bd84a'}); } }
    ring(m.x, m.y, 60, '#9bd84a', .45, 2);
  }
  const cb = ST.rk('combust');
  if(cb && m.burns.length){
    // Combustão: quem morre queimando explode
    const dmg = burnLeft(m) * (.4 + .12*cb);
    ring(m.x, m.y, 70, '#ff8a2b', .4, 3);
    for(let i = 0; i < 12; i++){ const an = Math.random()*TAU; part({x:m.x, y:m.y, vx:Math.cos(an)*rnd(60,180), vy:Math.sin(an)*rnd(60,180), life:.4, size:rnd(2,4), c:i % 2 ? '#ff8a2b' : '#ffd24a'}); }
    later.push({t:0, fn:() => { for(const o of mons) if(!o.dead && o !== m && D(o, m) < 80){ dealHit(o, dmg, false, '#ffb070'); burn(o, dmg*.5, 3*ST.pdur); } }});
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
  // Orbes: chance própria em qualquer criatura
  for(const k in ORBS) if(Math.random() < ORBS[k].chance){ drops.push({x:m.x + rnd(-16,16), y:m.y + rnd(-16,16), orb:k, t:0, gone:false}); log(`${ORBS[k].n} caiu!`, ORBS[k].c); ring(m.x, m.y, 50, ORBS[k].c, .6, 3); }
  if(Math.random() < (m.elite ? .75 : .12)) dropItem(m);
  if(m.elite && Math.random() < .35) dropItem(m);
  if(m.boss) for(let i = 0; i < 3; i++) dropItem(m); // Chefe: mais 3 itens (sorteio de elite)
}
// Pedras da Masmorra: só caem com a Fenda aberta (nível 40, depois da cena do Ezequiel). No Mapa Aleatório N, chance de uma Pedra
// de nível sorteado entre 1 e N (rmapStone); na corrida da Pedra N, chance de Pedra N (ou N−1, menos comum). Elite 3×.
const rmapStone = () => rint(1, S.rmap.tier);
function dropStone(m){
  const R = inRmap();
  if(m.boss || !dunOpen() || (!R && !inDun())) return;
  if(Math.random() >= (R ? STONE_MAP_CH : STONE_DUN_CH) * (m.elite ? 3 : 1)) return;
  if(R){ spawnStone(m.x, m.y, rmapStone()); return; }
  const N = S.dun.phase, lv = N > 1 && Math.random() < STONE_LOW_CH ? N - 1 : N;
  spawnStone(m.x, m.y, lv);
}
// Mapa Aleatório: conta os abates; com RMAP_KILLS aparece o Chefe (spawnBoss em 03)
function rmapKill(){
  const R0 = S.rmap; R0.kills++;
  if(R0.kills >= RMAP_KILLS && !R0.boss) spawnBoss();
  dirtyPanel();
}
// Chefe do Mapa Aleatório morto: Pedra garantida (1 a N), mapa limpo e, na 1ª vez no nível mais alto, libera o próximo e já o escolhe
function rmapBossDown(m){
  const R0 = S.rmap; R0.boss = 2; mapCleared = true;
  if(dunOpen()) spawnStone(m.x, m.y, rmapStone());
  let msg = `Chefe derrotado! ${rmapName(R0.tier)} concluído.`;
  if(R0.tier > R0.best){ R0.best = R0.tier; R0.tier = R0.best + 1; msg += ` ${rmapName(R0.tier)} liberado (criaturas ${Math.round((DUN_STEP - 1)*100)}% mais fortes).`; }
  ring(m.x, m.y, 160, STONE_C, 1.1, 6); ring(m.x, m.y, 100, '#f5cf3a', .9, 4);
  txt(hero.x, hero.y - 70, 'MAPA CONCLUÍDO!', '#f5cf3a', 20, -16);
  log(msg + ' Volte para a vila.', '#f5cf3a');
  save(); dirtyPanel();
}
function spawnStone(x, y, lv){
  drops.push({x:x + rnd(-16,16), y:y + rnd(-16,16), stone:lv, t:0, gone:false});
  log(`Pedra da Masmorra ${lv} caiu!`, STONE_C); ring(x, y, 70, STONE_C, .8, 4);
}
// Masmorra: conta os abates da corrida; com DUN_KILLS aparece o Chefe (spawnBoss em 03)
function dunKill(){
  const D0 = S.dun; D0.kills++;
  if(D0.kills >= DUN_KILLS && !D0.boss) spawnBoss();
  dirtyPanel();
}
// Chefe morto: Pedra concluída (ranking), Pedra do mesmo nível garantida e o mapa fica "limpo" (volte para a vila)
function dunBossDown(m){
  const D0 = S.dun; D0.boss = 2; mapCleared = true; tutStep(4, 5);
  if(D0.phase > D0.best){ D0.best = D0.phase; rankDirty = true; }
  spawnStone(m.x, m.y, D0.phase);
  ring(m.x, m.y, 160, STONE_C, 1.1, 6); ring(m.x, m.y, 100, '#f5cf3a', .9, 4);
  txt(hero.x, hero.y - 70, `PEDRA ${D0.phase} CONCLUÍDA!`, '#f5cf3a', 20, -16);
  log(`Chefe derrotado! Pedra ${D0.phase} concluída (melhor: ${D0.best}). Pegue a Pedra e volte para a vila.`, '#f5cf3a');
  save(); dirtyPanel();
}
function dropItem(m){
  const rar = rollRar(m.elite), it = genItem(m.ml + (m.elite ? 1 : 0), rar);
  drops.push({x:m.x + rnd(-16,16), y:m.y + rnd(-16,16), it, t:0, gone:false});
  if(rar >= 2) log(`${RAR[rar].n} caiu: ${it.name}`, RAR[rar].c);
  if(rar >= 3) ring(m.x, m.y, 90, RAR[rar].c, .9, 4);
}
function gainXp(x){
  if(S.lv >= MAX_LV){ gainParagon(x); return; }
  S.xp += x;
  while(S.lv < MAX_LV && S.xp >= xpNeed(S.lv)){
    S.xp -= xpNeed(S.lv); S.lv++; refreshStats(); hero.hp = ST.life;
    ring(hero.x, hero.y, 80, '#e2ae4a', .9, 4); ring(hero.x, hero.y, 50, '#ffe39a', .7, 2);
    txt(hero.x, hero.y - 46, 'NÍVEL ' + S.lv, '#e2ae4a', 20, -24);
    log(S.lv === MAX_LV ? `Nível máximo ${MAX_LV}! A XP agora vira níveis de Maestria.` : `Nível ${S.lv}! Ponto de habilidade para gastar no Herói.`, '#e2ae4a');
    if(S.lv === MAX_LV){ buildSkillbar(); log(`Habilidade suprema liberada: ${SKD[ULT[clsOf()]].n} (tecla 5)!`, '#ffd24a'); txt(hero.x, hero.y - 74, SKD[ULT[clsOf()]].n, '#ffd24a', 18, -18);
      if(!S.riftIntro) log('Alguém espera por você na vila…', '#c9a8ff'); }
    dirtyPanel(); rankDirty = true;
  }
  if(S.lv >= MAX_LV && S.xp > 0){ const rest = S.xp; S.xp = 0; gainParagon(rest); }
}
// Maestria (nome no jogo; no código continua par/gainParagon): depois do 40 cada nível dá 1 ponto em bônus pequenos; o nível 40 não muda
const parNeed = p => Math.floor(xpNeed(MAX_LV) * (1 + p*.02));
function gainParagon(x){
  S.pxp += x;
  while(S.pxp >= parNeed(S.par)){
    S.pxp -= parNeed(S.par); S.par++; refreshStats();
    ring(hero.x, hero.y, 80, '#b48cff', .9, 4); ring(hero.x, hero.y, 50, '#e2d4ff', .7, 2);
    txt(hero.x, hero.y - 46, 'MAESTRIA ' + S.par, '#c9a8ff', 20, -24);
    log(`Maestria ${S.par}! +1 de dano, +10 de vida e 1 ponto para gastar no Herói.`, '#c9a8ff');
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
// Esquiva (DODGE em 01): direção = para onde o jogador manda andar; no PC sem WASD, para o mouse; senão, para longe da criatura mais perto.
// ang (opcional) força a direção — o toque duplo no celular usa a direção para onde o herói está andando/olhando
function doDodge(fromKey, ang){
  const D0 = DODGE[clsOf()];
  if(scene !== 'map' || mode !== 'hunt' || cds.dodge > 0 || hero.dodge || hero.dash || hero.cast) return false;
  if(ang === undefined) ang = manualDir();
  if(ang === null && fromKey && mouse.on && mouse.x >= 0 && mouse.y >= 0 && mouse.x <= cw && mouse.y <= ch){ const w = toWorld(mouse.x, mouse.y); if(D(w, hero) > 10) ang = Math.atan2(w.y - hero.y, w.x - hero.x); }
  if(ang === null){ const n = nearestMon(hero); ang = n && D(n, hero) < 300 ? Math.atan2(hero.y - n.y, hero.x - n.x) : hero.face; }
  if(hero.atk && !hero.atk.rel){ hero.atk = null; cds.atk = 0; } // ataque que não saiu não gasta a recarga
  hero.whirl = null;
  const e = rayEnd(hero.x, hero.y, clamp(hero.x + Math.cos(ang)*D0.len, 20, WORLD.w - 20), clamp(hero.y + Math.sin(ang)*D0.len, 20, WORLD.h - 20));
  hero.dodge = {x0:hero.x, y0:hero.y, x1:e.x, y1:e.y, t:0, dur:D0.dur};
  hero.invul = D0.dur + .15; hero.face = ang;
  cds.dodge = D0.cd*(1 - ST.cdr/100);
  if(isMage()) for(let i = 0; i < 16; i++){ const an = Math.random()*TAU; part({x:hero.x + Math.cos(an)*10, y:hero.y - 18 + Math.sin(an)*14, vx:Math.cos(an)*80, vy:Math.sin(an)*80, life:.35, size:rnd(1.5,3), c:pick(['#ffb050','#ffe0a0'])}); }
  return true;
}
function hurtHero(dmg, src){
  if(scene !== 'map' || mode === 'dead' || hero.scale < .6) return;
  if(hero.invul > 0){ txt(hero.x, hero.y - 40, 'Esquivou', '#dfe8ff', 12); return; }
  // Todo dano é de um dos 4 tipos (Fogo, Raio, Gelo, Veneno): reduzido pela armadura e pela resistência do tipo.
  const el = (src && (src.el || src.d.el)) || 'poison', arm = ST.armor;
  const red = arm / (arm + 40 + 8*(src ? src.ml : 1)), res = (ST.res[el] || 0)/100;
  const d = dmg * (1 - red) * (1 - res) * (1 - (ST.dr || 0));
  hero.hp -= d; hero.hit = .14; hero.lastHit = T;
  txt(hero.x + rnd(-6,6), hero.y - 28, fmt(d), ELEM[el].c, 14);
  for(let i = 0; i < 5; i++) part({x:hero.x + rnd(-8,8), y:hero.y - rnd(8,30), vx:rnd(-50,50), vy:rnd(-70,-10), life:.4, size:rnd(1.5,3), c:ELEM[el].c});
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
// Ataque normal: só pelo botão de ataque (segurar repete) ou clicando/segurando o mouse no mapa. Sai no máximo a cada BASIC_CD s;
// o dano de cada golpe é × BASIC_CD × velocidade de ataque, então o dano por segundo fica o mesmo e a velocidade de ataque vira força do golpe.
const BASIC_CD = 2, BASIC_DUR = .3;
let atkHeld = null; // {pid, mouse}: botão (ou mouse) segurado — ataca de novo assim que a recarga acabar
const basicMult = () => BASIC_CD * ST.aps * heroBuff('aps');
const basicReach = m => isWar() ? MELEE + m.r + 14 : RANGE + 60;
// Alvo: o fixado (se ao alcance), senão o mais perto ao alcance; sem ninguém, golpeia/atira para onde está virado (ou para angHint)
function basicAttack(angHint){
  if(scene !== 'map' || mode !== 'hunt' || cds.atk > 0 || hero.atk || hero.cast || hero.dash || hero.dodge || hero.whirl) return false;
  const foc = getFocus();
  let t = foc && !foc.dead && D(foc, hero) <= basicReach(foc) ? foc : nearestMon(hero);
  if(t && D(t, hero) > basicReach(t)) t = null;
  hero.face = t ? Math.atan2(t.y - hero.y, t.x - hero.x) : angHint !== undefined ? angHint : hero.face;
  hero.atk = {t:0, dur:BASIC_DUR, rel:false, tgt:t, ang:hero.face};
  cds.atk = BASIC_CD;
  return true;
}
function fireBasic(tgt, ang0){
  const k = basicMult();
  if(isWar()){
    hero.swing = .22;
    if(!tgt || tgt.dead || D(tgt, hero) > basicReach(tgt)){ tgt = nearestMon(hero); if(tgt && D(tgt, hero) > basicReach(tgt)) tgt = null; }
    if(!tgt) return;
    const cm = rollCrit(), dmg = rnd(ST.min, ST.max) * k * cm, sr = ST.rk('serrated');
    dealHit(tgt, dmg, cm > 1);
    if(sr) bleed(tgt, dmg*(.4 + .2*sr)*ST.pois, 3*ST.pdur);
    return;
  }
  const ang = tgt && !tgt.dead ? Math.atan2(tgt.y - hero.y, tgt.x - hero.x) : ang0 !== undefined ? ang0 : hero.face, cm = rollCrit();
  if(isMage()){
    // Mago: brasa que sai do cajado; Brasa Viva faz queimar
    const dmg = rnd(ST.min, ST.max) * k * cm, kr = ST.rk('kindle');
    shoot(ang, {kind:'ember', dmg, crit:cm > 1, burn: kr ? dmg*(.4 + .2*kr)*ST.pois : 0, bdur:3*ST.pdur, spd:560, life:.75});
    return;
  }
  const dmg = rnd(ST.min, ST.max) * k * cm, tr = ST.rk('tip');
  shoot(ang, {kind:'arrow', dmg, crit:cm > 1, pois: tr ? dmg*(.4 + .2*tr)*ST.pois : 0, pdur:3*ST.pdur, spd:660});
}
function bestCluster(list){
  let best = {m:list[0], n:0};
  for(const m of list){ let n = 0; for(const o of mons) if(!o.dead && D(o, m) < 85) n++; if(n > best.n) best = {m, n}; }
  return best;
}
const BURST_R = 170, RUPT_R = 140, CLEAVE_REACH = 170, CHARGE_LEN = 260, INFERNO_R = 260, WAVE_LEN = 190, WAVE_SPREAD = 1.05;
const meteorR = () => 75 + 4*ST.rk('meteor');
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
  if(id === 'arrow' || id === 'cleave' || id === 'firebolt' || id === 'burst'){
    const reach = id === 'cleave' ? CLEAVE_REACH : ARROW_REACH;
    const f = aimAt && aimAt.tgt && !aimAt.tgt.dead ? aimAt.tgt : getFocus();
    if(f){ if(D(f, hero) > reach){ log('Alvo fora de alcance'); return; } return cast(id, {tgt:f}); }
    const near = live.filter(m => D(m, hero) < (id === 'cleave' ? CLEAVE_REACH : RANGE + 40)).sort(byDist);
    if(!near.length){ log('Nenhum inimigo ao alcance'); return; }
    let t = near[0];
    if(id === 'arrow') for(const m of near){ if(m.hp - poisonLeft(m) > t.hp - poisonLeft(t)) t = m; }
    if(id === 'firebolt' || id === 'burst') t = bestCluster(near).m; // explodem no alvo: mira onde tem mais gente
    return cast(id, {tgt:t});
  }
  if(SKD[id].ult){
    if(!live.some(m => D(m, hero) < ULT_R)){ log('Nenhum inimigo por perto'); return; }
    return cast(id, {});
  }
  if(id === 'inferno'){
    if(!live.some(m => D(m, hero) < INFERNO_R)){ log('Nenhum inimigo por perto'); return; }
    return cast(id, {});
  }
  if(id === 'rupture'){
    if(!live.some(m => D(m, hero) < RUPT_R + 40)){ log('Chegue mais perto dos inimigos'); return; }
    return cast('rupture', {});
  }
  if(id === 'whirl') return cast('whirl', {});
  const near = live.filter(m => D(m, hero) < RANGE + 40).sort(byDist);
  if(!near.length){ log('Nenhum inimigo ao alcance'); return; }
  if(id === 'rain' || id === 'charge' || id === 'meteor'){ const c = bestCluster(near); return cast(id, {x:c.m.x, y:c.m.y}); }
  if(id === 'fan' || id === 'flamewave') return cast(id, {x:near[0].x, y:near[0].y});
}
const CAST_DUR = {rain:.45, burst:.5, rupture:.5, charge:.12, whirl:.15, cleave:.28, meteor:.45, inferno:.55, flamewave:.3, storm:.5, titan:.5, cataclysm:.6};
// Supremas (nível 40): alcance para achar inimigos
const ULT_R = 420;
function cast(id, data){
  hero.atk = null;
  hero.cast = {id, t:0, dur: CAST_DUR[id] || .32, done:false, data};
  cds[id] = SKD[id].cd * (1 - ST.cdr/100);
  if(data && data.tgt) hero.face = Math.atan2(data.tgt.y - hero.y, data.tgt.x - hero.x);
  if(data && data.x !== undefined) hero.face = Math.atan2(data.y - hero.y, data.x - hero.x);
}
function doSkill(c){
  const r = ST.rk(c.id), a = ST.avg;
  if(SKD[c.id].ult) return doUlt(c.id);
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
    // Ultimate do Arqueiro: flecha de praga que explode na criatura atingida (ou no fim do voo)
    let t = c.data.tgt; if(!t || t.dead) t = nearestMon(hero, ARROW_REACH); if(!t) return;
    const ang = Math.atan2(t.y - hero.y, t.x - hero.x);
    shoot(ang, {kind:'plague', dmg:0, spd:620, life:.85, boom:{fn:(x, y) => plagueBurst(x, y, r)}});
    for(let i = 0; i < 10; i++) part({x:hero.x + Math.cos(ang)*16, y:hero.y + Math.sin(ang)*16, vx:Math.cos(ang + rnd(-.6,.6))*rnd(60,160), vy:Math.sin(ang + rnd(-.6,.6))*rnd(60,160), life:.4, size:3, c:'#d8f07a'});
  } else if(c.id === 'cleave'){
    let t = c.data.tgt; if(!t || t.dead) t = nearestMon(hero, CLEAVE_REACH); if(!t) return;
    // Avança até encostar no alvo
    const d = D(t, hero), stop = t.r + 14;
    if(d > stop){ const an = Math.atan2(t.y - hero.y, t.x - hero.x), mv = Math.min(d - stop, CLEAVE_REACH); for(let i = 0; i < 6; i++) part({x:hero.x + Math.cos(an)*mv*i/6, y:hero.y + Math.sin(an)*mv*i/6, life:.25, size:3, c:'rgba(220,220,230,.6)'}); const e = rayEnd(hero.x, hero.y, hero.x + Math.cos(an)*mv, hero.y + Math.sin(an)*mv); hero.x = e.x; hero.y = e.y; }
    hero.face = Math.atan2(t.y - hero.y, t.x - hero.x);
    meleeHit(t, 1.5 + .15*r, a*(1.5 + .4*r)*ST.pois);
    ring(t.x, t.y, t.r*1.7, '#e0574a', .3, 3); hero.swing = .28;
  } else if(c.id === 'charge'){
    const an = Math.atan2(c.data.y - hero.y, c.data.x - hero.x), len = Math.min(CHARGE_LEN, Math.max(60, D(c.data, hero)));
    hero.face = an;
    const e = rayEnd(hero.x, hero.y, clamp(hero.x + Math.cos(an)*len, 20, WORLD.w - 20), clamp(hero.y + Math.sin(an)*len, 20, WORLD.h - 20));
    hero.dash = {x0:hero.x, y0:hero.y, x1:e.x, y1:e.y, t:0, dur:.24, hit:new Set(), mult:1.1 + .12*r, dot:a*(.8 + .2*r)*ST.pois, endMult:.8 + .08*r};
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
  } else if(c.id === 'firebolt'){
    let t = c.data.tgt; if(!t || t.dead) t = nearestMon(hero, RANGE + 80); if(!t) return;
    const ang = Math.atan2(t.y - hero.y, t.x - hero.x);
    shoot(ang, {kind:'fireball', dmg:0, spd:520, life:.9, boom:{r:55, mult:1.45 + .15*r, burn:a*(1.15 + .3*r)*ST.pois}});
  } else if(c.id === 'flamewave'){
    // Cone de fogo curto: acerta todos dentro do ângulo
    const base = Math.atan2(c.data.y - hero.y, c.data.x - hero.x);
    for(const m of mons){
      if(m.dead || D(m, hero) > WAVE_LEN + m.r) continue;
      let da = Math.atan2(m.y - hero.y, m.x - hero.x) - base; da = Math.atan2(Math.sin(da), Math.cos(da));
      if(Math.abs(da) <= WAVE_SPREAD/2 + .15) spellHit(m, .9 + .1*r, a*(.6 + .15*r)*ST.pois, 3);
    }
    for(let i = 0; i < 34; i++){ const an = base + rnd(-WAVE_SPREAD/2, WAVE_SPREAD/2), sp = rnd(260, 520); part({x:hero.x + Math.cos(an)*12, y:hero.y + Math.sin(an)*12, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp, life:rnd(.25,.4), size:rnd(3,6), c:pick(['#ff8a2b','#ffd24a','#ff5a1f'])}); }
  } else if(c.id === 'meteor'){
    const x = c.data.x, y = c.data.y, R = meteorR();
    ring(x, y, R, 'rgba(255,138,43,.9)', .75, 2);
    for(let i = 0; i < 4; i++) part({x:x + rnd(-8,8), y:y - 320, vx:rnd(-10,10), vy:440, life:.72, size:7 - i, c:i ? '#ffb040' : '#fff0c0', kind:'streak'});
    later.push({t:.7, fn:() => {
      ring(x, y, R, '#ff8a2b', .5, 6); ring(x, y, R*.5, '#ffd24a', .35, 3);
      for(let i = 0; i < 30; i++){ const an = Math.random()*TAU, sp = rnd(80, 260); part({x, y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp - 80, grav:280, life:.6, size:rnd(2,5), c:pick(['#ff8a2b','#ffd24a','#5a2a18'])}); }
      for(const m of mons) if(!m.dead && D(m, {x, y}) < R + m.r*.5) spellHit(m, 2.2 + .25*r, 0);
      clouds.push({x, y, r:R*.85, t:0, dur:3, tick:0, dps:a*(.6 + .16*r)*ST.pois, fire:true});
    }});
  } else if(c.id === 'inferno'){
    // Ultimate do Mago: explosão de fogo, detona a queimadura e incendeia de novo
    const list = mons.filter(m => !m.dead && D(m, hero) < INFERNO_R), rems = list.map(m => burnLeft(m));
    ring(hero.x, hero.y, INFERNO_R, '#ff8a2b', .7, 7); ring(hero.x, hero.y, INFERNO_R*.6, '#ffd24a', .5, 3);
    for(let i = 0; i < 50; i++){ const an = Math.random()*TAU, sp = rnd(160, 420); part({x:hero.x, y:hero.y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp, life:.7, size:rnd(2.5,5), c:pick(['#ff8a2b','#ffd24a','#ff5a1f'])}); }
    list.forEach((m, i) => {
      spellHit(m, 1.5 + .2*r, 0);
      if(rems[i] > 0 && !m.dead){ dealHit(m, rems[i]*(1 + .15*r), false, '#ffb070'); ring(m.x, m.y, 40, '#ffb070', .4, 3); }
      burn(m, a*(3 + .5*r)*ST.pois, 4*ST.pdur);
    });
  }
}
/* ---------- SUPREMAS (nível 40) ---------- */
// Arqueiro · Tempestade de Flechas: por 4s, a cada 0,2s caem flechas em até 3 inimigos em volta (220% do dano da arma + muito veneno).
// Guerreiro · Fúria do Titã: esmaga o chão (raio 220, 600% + sangramento enorme) e por 8s: +60% de dano, +50% de velocidade de ataque, 25% de roubo de vida e 1,5s sem levar dano.
// Mago · Cataclismo: 10 meteoros em 2,5s nos inimigos em volta (raio 110 cada, 500% + queimadura e chão em chamas).
function doUlt(id){
  const a = ST.avg, P = ST.pois, live = () => mons.filter(m => !m.dead && D(m, hero) < ULT_R);
  if(id === 'storm'){
    ring(hero.x, hero.y, ULT_R, '#d8f07a', .8, 4); txt(hero.x, hero.y - 70, 'Tempestade de Flechas!', '#d8f07a', 18, -20);
    for(let i = 0; i < 20; i++) later.push({t:i*.2, fn:() => {
      if(scene !== 'map') return;
      for(const m of live().sort(() => Math.random() - .5).slice(0, 3)){
        for(let k = 0; k < 3; k++) part({x:m.x + rnd(-6, 6), y:m.y - 300, vx:rnd(-10, 10), vy:900, life:.32, size:2, c:fxLook() ? fxLook().c : '#e8f0b0', kind:'streak'});
        const cm = rollCrit(); dealHit(m, a*2.2*cm, cm > 1, '#d8f07a'); poison(m, a*2.5*P, 4*ST.pdur);
        ring(m.x, m.y, 24, '#9bd84a', .3, 2);
      }
    }});
  } else if(id === 'titan'){
    ring(hero.x, hero.y, 220, '#e0574a', .8, 9); ring(hero.x, hero.y, 120, '#ffb09a', .5, 4);
    for(let i = 0; i < 60; i++){ const an = Math.random()*TAU, sp = rnd(160, 420); part({x:hero.x, y:hero.y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp - 80, grav:320, life:.7, size:rnd(2.5,5), c:pick(['#e0574a','#7a5a40','#ffb09a'])}); }
    for(const m of mons) if(!m.dead && D(m, hero) < 220 + m.r){ meleeHit(m, 6, a*6*P); }
    hero.buff = {t:8, dmg:1.6, aps:1.5, ls:25, c:'#e0574a'}; hero.invul = Math.max(hero.invul, 1.5); hero.swing = .4;
    txt(hero.x, hero.y - 70, 'Fúria do Titã!', '#ff8a7a', 18, -20);
  } else if(id === 'cataclysm'){
    txt(hero.x, hero.y - 70, 'Cataclismo!', '#ffb040', 18, -20);
    for(let i = 0; i < 10; i++) later.push({t:i*.25, fn:() => {
      if(scene !== 'map') return;
      const L = live(), t = L.length ? pick(L) : null;
      const x = t ? t.x + rnd(-20, 20) : hero.x + rnd(-220, 220), y = t ? t.y + rnd(-20, 20) : hero.y + rnd(-160, 160), R = 110;
      ring(x, y, R, 'rgba(255,138,43,.9)', .45, 2);
      for(let k = 0; k < 4; k++) part({x:x + rnd(-8, 8), y:y - 340, vx:rnd(-10, 10), vy:700, life:.48, size:8 - k, c:k ? '#ffb040' : '#fff0c0', kind:'streak'});
      later.push({t:.45, fn:() => {
        if(scene !== 'map') return;
        ring(x, y, R, '#ff8a2b', .5, 7); ring(x, y, R*.5, '#ffd24a', .35, 3);
        for(let k = 0; k < 26; k++){ const an = Math.random()*TAU, sp = rnd(80, 280); part({x, y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp - 80, grav:280, life:.6, size:rnd(2,5), c:pick(['#ff8a2b','#ffd24a','#5a2a18'])}); }
        for(const m of mons) if(!m.dead && D(m, {x, y}) < R + m.r*.5) spellHit(m, 5, a*3*P, 4);
        clouds.push({x, y, r:R*.8, t:0, dur:3, tick:0, dps:a*1.2*P, fire:true});
      }});
    }});
  }
}
// Acerto de magia: dano da arma × mult (pode ser crítico) e queimadura opcional
function spellHit(m, mult, burnTotal, dur){
  const cm = rollCrit(), dmg = rnd(ST.min, ST.max) * mult * cm;
  dealHit(m, dmg, cm > 1, '#ffd0a0');
  if(burnTotal) burn(m, burnTotal, (dur || 4)*ST.pdur);
  return dmg;
}
// Bola de Fogo: explode ao acertar ou no fim do voo
// Explosão de Praga: em volta do ponto de impacto envenena todos, detona o veneno que já existia e espalha metade
function plagueBurst(x, y, r){
  const a = ST.avg, at = {x, y};
  const list = mons.filter(m => !m.dead && D(m, at) < BURST_R + m.r*.5), rems = list.map(m => poisonLeft(m));
  ring(x, y, BURST_R, '#9bd84a', .7, 6); ring(x, y, BURST_R*.55, '#d8f07a', .5, 3);
  for(let i = 0; i < 40; i++){ const an = Math.random()*TAU, sp = rnd(120, 320); part({x, y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp, life:.6, size:rnd(2,4), c:i % 3 ? '#9bd84a' : '#d8f07a'}); }
  list.forEach((m, i) => {
    const rem = rems[i];
    if(rem > 0){
      for(const o of mons) if(o !== m && !o.dead && D(o, m) < 110) poison(o, rem*.5, 3*ST.pdur);
      ring(m.x, m.y, 46, '#c8f080', .45, 3);
      dealHit(m, rem*(1 + .15*r), false, '#c8f080');
    }
    poison(m, a*(3 + .5*r)*ST.pois, 4*ST.pdur);
  });
}
function explode(p){
  if(!p.boom || p.boomed) return; p.boomed = true; p.life = 0;
  const b = p.boom;
  if(b.fn) return b.fn(p.x, p.y);
  ring(p.x, p.y, b.r, '#ff8a2b', .35, 4);
  for(let i = 0; i < 16; i++){ const an = Math.random()*TAU, sp = rnd(60, 200); part({x:p.x, y:p.y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp, life:.4, size:rnd(2,4.5), c:pick(['#ff8a2b','#ffd24a','#ff5a1f'])}); }
  for(const m of mons) if(!m.dead && Math.hypot(m.x - p.x, m.y - p.y) < b.r + m.r*.5) spellHit(m, b.mult, b.burn, 3);
}
