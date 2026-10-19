// Modelos: geração de itens, preços e cálculo de status do herói (calcStats/ST).
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- ITENS ---------- */
const skew = () => Math.pow(Math.random(), 2.6); // valores altos são raros
function genItem(ilvl, rar, slot){
  slot = slot || (Math.random() < .22 ? 'bow' : pick(SLOTS.slice(1)));
  const rf = [1,1,1.15,1.35][rar];
  const it = {id:S.uid++, slot, rar, ilvl, affix:[]};
  if(slot === 'bow'){
    const b = BOWS.slice().reverse().find(x => ilvl >= x.lv);
    const t = skew(), base = (3 + ilvl*1.5) * b.m * (1 + .45*t) * rf;
    it.min = Math.max(1, Math.round(base)); it.max = Math.max(it.min+1, Math.round(base*rnd(1.75,2.05)));
    it.aps = b.aps; it.base = b.n; it.bt = t;
  } else {
    it.base = BASES[slot][Math.min(3, Math.floor(ilvl/10))];
    if(ARMOR_M[slot]){ const t = skew(); it.armor = Math.round((3 + ilvl*1.3) * ARMOR_M[slot] * (1 + .5*t) * rf); it.bt = t; }
  }
  const n = [0, rint(1,2), rint(3,4), 4][rar];
  const pool = Object.keys(AFX).filter(k => AFX[k].slots.includes(slot));
  for(let i = 0; i < n && pool.length; i++){
    const k = pool.splice(Math.floor(Math.random()*pool.length), 1)[0], A = AFX[k], t = skew();
    const lo = A.lo(ilvl), hi = A.hi(ilvl) * rf;
    let v = lo + (hi - lo) * t; v = A.dec ? Math.round(v*10)/10 : Math.max(1, Math.round(v));
    it.affix.push({k, v, t});
  }
  if(rar === 3){ const s = pick([...ACTIVE, ...PASSIVE]); const v = Math.random() < .12 ? 2 : 1; it.affix.push({k:'skill', s, v, t:v===2?1:.5}); }
  it.name = nameItem(it);
  return it;
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
function rollShop(){ S.shop = [0,1,2].map(() => genItem(Math.max(1, S.lv), shopRar())); }
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
  const L = S.lv;
  const rk = id => S.sk[id] > 0 ? S.sk[id] + (bonus[id]||0) : 0;
  const pp = S.pp || {}, dm = (1 + L*.03) * (1 + .01*(pp.dmg || 0)), st = {rk, bonus};
  st.min = wmin*dm; st.max = wmax*dm; st.avg = (st.min + st.max)/2;
  st.aps = aps * (1 + a.ias/100) * (1 + .05*rk('agility')) * (1 + .005*(pp.ias || 0));
  st.crit = Math.min(75, 5 + a.crit); st.critd = 150 + a.critd;
  st.pois = 1 + a.pois/100 + .12*rk('potency') + .015*(pp.pois || 0);
  st.pdur = 1 + a.pdur/100;
  st.life = (70 + L*14 + a.life) * (1 + .07*rk('hide')) * (1 + .01*(pp.life || 0));
  st.armor = a.armor + 3*rk('hide');
  st.ms = 125 * (1 + a.ms/100);
  st.ls = a.ls; st.cdr = Math.min(40, a.cdr); st.gf = a.gf;
  const critF = 1 + st.crit/100 * (st.critd/100 - 1), cdm = 1 - st.cdr/100;
  const tip = rk('tip') ? (.4 + .2*rk('tip')) * st.pois : 0;
  let dps = st.avg * st.aps * critF * (1 + tip);
  const r1 = rk('arrow'); if(r1) dps += (st.avg*(1.2+.15*r1)*critF + st.avg*(1.5+.4*r1)*st.pois) / (4*cdm);
  const r2 = rk('fan'); if(r2) dps += 2.5*(st.avg*(.6+.08*r2)*critF + st.avg*(.6+.15*r2)*st.pois) / (7*cdm);
  const r3 = rk('rain'); if(r3) dps += 2.5*4*st.avg*(.6+.15*r3)*st.pois / (10*cdm);
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
    case 'burst': return `Detona o veneno dos inimigos próximos: causa ${pc(.5+.1*r)} do veneno restante na hora e espalha 30% para os vizinhos.`;
    case 'tip': return `Ataques normais envenenam ${pc(.4+.2*r)} do dano do golpe ao longo de 3s.`;
    case 'potency': return `+${12*r}% de dano de veneno.`;
    case 'agility': return `+${5*r}% de velocidade de ataque.`;
    case 'hide': return `+${7*r}% de vida e +${3*r} de armadura.`;
    case 'contagion': return `Quando um inimigo envenenado morre, ${pc(.3+.1*r)} do veneno dele salta para quem estiver perto.`;
  }
  return '';
}
