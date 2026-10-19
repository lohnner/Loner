// Modelos: geração de itens, preços e cálculo de status do herói (calcStats/ST).
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- ITENS ---------- */
const skew = () => Math.pow(Math.random(), 2.6); // valores altos são raros
// Itens de classe: armas e lendários com +habilidade são de uma classe (it.cls) e só ela equipa.
// 1 em 4 sai para a outra classe (o Arqueiro acha espadas, o Guerreiro acha arcos) — dá para vender.
const otherCls = () => pick(CLASSES.filter(c => c.ok && c.id !== clsOf())).id;
const canUse = it => !it.cls || it.cls === clsOf();
// Nível exigido a partir do ilvl: quanto mais rara, mais perto do ilvl (Comum −3, Mágico −2, Raro −1, Lendário = ilvl), até o nível máximo
const reqLv = it => clamp(it.ilvl - [3, 2, 1, 0][it.rar], 1, MAX_LV);
const canEquip = it => canUse(it) && S.lv >= reqLv(it);
const clsName = id => (CLASSES.find(c => c.id === id) || CLASSES[0]).n;
function genItem(ilvl, rar, slot, cls){
  slot = slot || (Math.random() < .22 ? 'bow' : pick(SLOTS.slice(1)));
  cls = cls || (Math.random() < .25 ? otherCls() : clsOf());
  const rf = [1,1,1.15,1.35][rar];
  const it = {id:S.uid++, slot, rar, ilvl, affix:[]};
  if(slot === 'bow' || rar === 3) it.cls = cls;
  if(slot === 'bow'){
    const b = weaponBases(cls).slice().reverse().find(x => ilvl >= x.lv);
    const t = skew(), base = (3 + ilvl*1.5) * b.m * (1 + .45*t) * rf;
    it.min = Math.max(1, Math.round(base)); it.max = Math.max(it.min+1, Math.round(base*rnd(1.75,2.05)));
    it.aps = b.aps; it.base = b.n; it.bt = t;
  } else {
    it.base = BASES[slot][Math.min(3, Math.floor(ilvl/10))];
    if(ARMOR_M[slot]){ const t = skew(); it.armor = Math.round((3 + ilvl*1.3) * ARMOR_M[slot] * (1 + .5*t) * rf); it.bt = t; }
  }
  addAffixes(it, [0, rint(1,2), rint(3,4), 4][rar]);
  if(rar === 3){ const K = CLASS_KIT[cls] || CLASS_KIT.arqueiro, s = pick([...K.active, ...K.passive]); const v = Math.random() < .12 ? 2 : 1; it.affix.push({k:'skill', s, v, t:v===2?1:.5}); }
  it.name = nameItem(it);
  return it;
}
// Sorteia n atributos novos (sem repetir os que o item já tem), com força pela raridade atual
function addAffixes(it, n){
  const rf = [1,1,1.15,1.35][it.rar], have = new Set(it.affix.map(a => a.k));
  const pool = Object.keys(AFX).filter(k => AFX[k].slots.includes(it.slot) && !have.has(k));
  for(let i = 0; i < n && pool.length; i++){
    const k = pool.splice(Math.floor(Math.random()*pool.length), 1)[0], A = AFX[k], t = skew();
    const lo = A.lo(it.ilvl), hi = A.hi(it.ilvl) * rf;
    let v = lo + (hi - lo) * t; v = A.dec ? Math.round(v*10)/10 : Math.max(1, Math.round(v));
    it.affix.push({k, v, t});
  }
}
// Usa um orbe no item: Comum → Mágico (Despertar) ou Mágico → Raro (Ascensão). Devolve true se melhorou.
function upgradeItem(it, k){
  const O = ORBS[k]; if(!O || !it || it.rar !== O.from || !(S.orbs[k] > 0)) return false;
  S.orbs[k]--; it.rar = O.to;
  if(O.to === 2){
    // base melhor (raro tem +15%), e completa até 3 ou 4 atributos
    if(it.min){ it.min = Math.round(it.min*1.15); it.max = Math.round(it.max*1.15); }
    if(it.armor) it.armor = Math.round(it.armor*1.15);
    addAffixes(it, rint(3, 4) - it.affix.length);
  } else addAffixes(it, rint(1, 2));
  it.name = nameItem(it);
  return true;
}
function nameItem(it){
  if(it.rar === 0) return it.base;
  if(it.rar === 1) return `${it.base} ${SUF[it.affix[0].k] || ''}`.trim();
  if(it.rar === 2) return `${pick(RA)} de ${pick(RB)}`;
  return pick(LEG[it.slot]);
}
function rollRar(elite){
  const r = Math.random(), m = elite ? 4 : 1;
  if(r < .003*m) return 3;
  if(r < .035*m) return 2;
  if(r < .22*(elite?2:1)) return 1;
  return 0;
}
function shopRar(){ const r = Math.random(); if(r < .03) return 3; if(r < .25) return 2; if(r < .7) return 1; return 0; }
// O mercador vende para a sua classe
function rollShop(){ S.shop = [0,1,2].map(() => genItem(Math.max(1, S.lv), shopRar(), null, clsOf())); }
const buyPrice = it => Math.round(sellPrice(it) * 4);
const sellPrice = it => Math.round((4 + it.ilvl*2) * [1,3,9,40][it.rar]);

/* ---------- STATUS ---------- */
function calcStats(eq = S.eq){
  const a = {life:0,armor:0,pois:0,ias:0,crit:0,critd:0,ms:0,ls:0,cdr:0,pdur:0,gf:0}, bonus = {};
  let wmin = 1, wmax = 2, aps = 1.1;
  for(const slot of SLOTS){
    const it = eq[slot]; if(!it) continue;
    if(it.slot === 'bow'){ wmin = it.min; wmax = it.max; aps = it.aps; }
    if(it.armor) a.armor += it.armor;
    for(const af of it.affix){ if(af.k === 'skill') bonus[af.s] = (bonus[af.s]||0) + af.v; else a[af.k] += af.v; }
  }
  const L = S.lv, war = isWar();
  const rk = id => S.sk[id] > 0 ? S.sk[id] + (bonus[id]||0) : 0;
  const pp = S.pp || {}, dm = (1 + L*.03) * (1 + .01*(pp.dmg || 0)), st = {rk, bonus};
  st.min = wmin*dm; st.max = wmax*dm; st.avg = (st.min + st.max)/2;
  // As passivas de cada classe ocupam o mesmo papel: Dedos Ligeiros = Fúria, Toxina Potente = Brutalidade, Couro Curtido ~ Pele de Ferro
  st.aps = aps * (1 + a.ias/100) * (1 + .05*(rk('agility') + rk('fury') + rk('channel'))) * (1 + .005*(pp.ias || 0));
  st.crit = Math.min(75, 5 + a.crit); st.critd = 150 + a.critd;
  st.pois = 1 + a.pois/100 + .12*(rk('potency') + rk('brutality') + rk('pyro')) + .015*(pp.pois || 0);
  st.pdur = 1 + a.pdur/100;
  // O Guerreiro luta colado: nasce com mais vida e armadura. O Mago é o mais frágil.
  st.life = (70 + L*14 + a.life) * (war ? 1.4 : isMage() ? .92 : 1) * (1 + .07*(rk('hide') + rk('ward')) + .08*rk('iron')) * (1 + .01*(pp.life || 0));
  st.armor = a.armor + 3*(rk('hide') + rk('ward')) + 6*rk('iron') + (war ? 10 + L*2.2 : 0);
  st.dr = war ? .15 : 0; // Couraça: o Guerreiro recebe 15% menos dano
  st.ms = 125 * (1 + a.ms/100);
  st.ls = a.ls + (war ? 1.5 : 0); st.cdr = Math.min(40, a.cdr); st.gf = a.gf;
  const critF = 1 + st.crit/100 * (st.critd/100 - 1), cdm = 1 - st.cdr/100, A = st.avg, P = st.pois;
  // Dano por segundo estimado (só para comparar itens): ataque normal + cada ativa dividida pela recarga; 2,5 = alvos médios em área
  const oh = rk('tip') + rk('serrated') + rk('kindle'), onHit = oh ? (.4 + .2*oh) * P : 0;
  let dps = A * st.aps * critF * (1 + onHit);
  if(isMage()){
    const r1 = rk('firebolt'); if(r1) dps += 1.6*(A*(1.45+.15*r1)*critF + A*(1.15+.3*r1)*P) / (4*cdm);
    const r2 = rk('flamewave'); if(r2) dps += 2.5*(A*(.9+.1*r2)*critF + A*(.6+.15*r2)*P) / (7*cdm);
    const r3 = rk('meteor'); if(r3) dps += 2.5*(A*(2.2+.25*r3)*critF + 6*A*(.3+.08*r3)*P) / (10*cdm);
    const r4 = rk('inferno'); if(r4) dps += 2.5*(A*(1.5+.2*r4)*critF + A*(3+.5*r4)*P) / (12*cdm);
  } else if(war){
    const r1 = rk('cleave'); if(r1) dps += (A*(1.5+.15*r1)*critF + A*(1.5+.4*r1)*P) / (4*cdm);
    const r2 = rk('charge'); if(r2) dps += (2*(A*(1.1+.12*r2)*critF + A*(.8+.2*r2)*P) + 2*(A*(.8+.08*r2)*critF + A*(.4+.1*r2)*P)) / (7*cdm);
    const r3 = rk('whirl'); if(r3) dps += 2.5*(A*(2+.2*r3)*critF + A*(1.36+.32*r3)*P) / (10*cdm);
    const r4 = rk('rupture'); if(r4) dps += 2.5*(A*(1.7+.2*r4)*critF + A*(2+.4*r4)*P) / (12*cdm);
  } else {
    const r1 = rk('arrow'); if(r1) dps += (A*(1.2+.15*r1)*critF + A*(1.5+.4*r1)*P) / (4*cdm);
    const r2 = rk('fan'); if(r2) dps += 2.5*(A*(.6+.08*r2)*critF + A*(.6+.15*r2)*P) / (7*cdm);
    const r3 = rk('rain'); if(r3) dps += 2.5*4*A*(.6+.15*r3)*P / (10*cdm);
    const r4 = rk('burst'); if(r4) dps += 2.5*A*(3+.5*r4)*P / (12*cdm);
  }
  st.dps = dps;
  return st;
}
let ST = calcStats();
function refreshStats(){ ST = calcStats(); if(hero.hp > ST.life) hero.hp = ST.life; }
const xpNeed = L => Math.floor(35*L + 18*L*L);
const ptsFree = () => S.lv - Object.values(S.sk).reduce((s, v) => s + v, 0);

function skDesc(id, st){
  const r = Math.max(1, st.rk(id)), a = st.avg, p = st.pois, d = st.pdur;
  switch(id){
    case 'arrow': return `Causa ${pc(1.2+.15*r)} do dano da arma e envenena: ${fmt(a*(1.5+.4*r)*p)} de dano em ${n1(4*d)}s.`;
    case 'fan': return `Dispara ${5+Math.floor(r/3)} flechas em leque. Cada uma causa ${pc(.6+.08*r)} e envenena ${fmt(a*(.6+.15*r)*p)} em ${n1(3*d)}s. Um inimigo colado em você leva todas as flechas.`;
    case 'rain': return `Nuvem ácida de raio ${70+5*r} por 4s. Quem fica dentro sofre cerca de ${fmt(a*(.6+.15*r)*p)} de veneno por segundo.`;
    case 'burst': return `Ultimate. Atira uma flecha de praga que explode na criatura atingida (raio 170 em volta dela): envenena todos com ${fmt(a*(3+.5*r)*p)} em ${n1(4*d)}s, detona na hora ${pc(1+.15*r)} do veneno que já estava neles e espalha metade para os vizinhos.`;
    case 'cleave': return `Avança até o alvo e causa ${pc(1.5+.15*r)} do dano da arma, abrindo um corte que sangra ${fmt(a*(1.5+.4*r)*p)} em ${n1(4*d)}s.`;
    case 'charge': return `Corre até o ponto mirado (até 260) atropelando tudo no caminho: ${pc(1.1+.12*r)} do dano da arma e ${fmt(a*(.8+.2*r)*p)} de sangramento em cada um. Ao chegar, explode em volta (raio 65): ${pc(.8+.08*r)} do dano da arma e mais sangramento.`;
    case 'whirl': return `Gira por 2s acertando todos em volta (raio ${80+3*r}) 8 vezes: cada giro causa ${pc(.25+.025*r)} do dano da arma e ${fmt(a*(.17+.04*r)*p)} de sangramento. Dá para andar girando.`;
    case 'rupture': return `Ultimate. Salta e esmaga o chão (raio 140): causa ${pc(1.7+.2*r)} do dano da arma em todos, detona na hora ${pc(1+.15*r)} do sangramento que já estava neles e abre um novo de ${fmt(a*(2+.4*r)*p)} em ${n1(4*d)}s.`;
    case 'serrated': return `Ataques normais fazem sangrar ${pc(.4+.2*r)} do dano do golpe ao longo de 3s.`;
    case 'brutality': return `+${12*r}% de dano de sangramento.`;
    case 'fury': return `+${5*r}% de velocidade de ataque.`;
    case 'iron': return `+${8*r}% de vida e +${6*r} de armadura.`;
    case 'firebolt': return `Lança uma bola de fogo que explode no alvo (raio 55): ${pc(1.45+.15*r)} do dano da arma em todos e queimadura de ${fmt(a*(1.15+.3*r)*p)} em ${n1(3*d)}s.`;
    case 'flamewave': return `Onda de chamas em cone na direção mirada (alcance 190): ${pc(.9+.1*r)} do dano da arma e queimadura de ${fmt(a*(.6+.15*r)*p)} em cada inimigo.`;
    case 'meteor': return `Um meteoro cai no ponto mirado (raio ${75+4*r}) depois de 0,7s: ${pc(2.2+.25*r)} do dano da arma e o chão queima por 3s (${fmt(a*(.3+.08*r)*p*2)} por segundo).`;
    case 'inferno': return `Ultimate. Explosão de fogo em volta de você (raio 260): ${pc(1.5+.2*r)} do dano da arma em todos, detona na hora ${pc(1+.15*r)} da queimadura que já estava neles e incendeia com ${fmt(a*(3+.5*r)*p)} em ${n1(4*d)}s.`;
    case 'kindle': return `Ataques normais queimam ${pc(.4+.2*r)} do dano do golpe ao longo de 3s.`;
    case 'pyro': return `+${12*r}% de dano de queimadura.`;
    case 'channel': return `+${5*r}% de velocidade de ataque.`;
    case 'ward': return `+${7*r}% de vida e +${3*r} de armadura.`;
    case 'combust': return `Quando um inimigo que está queimando morre, ele explode: ${pc(.4+.12*r)} da queimadura restante vira dano em quem estiver perto.`;
    case 'bloodlust': return `Quando um inimigo que está sangrando morre, você recupera ${n1(1.5+.5*r)}% da vida máxima.`;
    case 'tip': return `Ataques normais envenenam ${pc(.4+.2*r)} do dano do golpe ao longo de 3s.`;
    case 'potency': return `+${12*r}% de dano de veneno.`;
    case 'agility': return `+${5*r}% de velocidade de ataque.`;
    case 'hide': return `+${7*r}% de vida e +${3*r} de armadura.`;
    case 'contagion': return `Quando um inimigo envenenado morre, ${pc(.3+.1*r)} do veneno dele salta para quem estiver perto.`;
  }
  return '';
}
