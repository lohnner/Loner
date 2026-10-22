// Modelos: geração de itens, preços e cálculo de status do herói (calcStats/ST).
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- ITENS ---------- */
const skew = () => Math.pow(Math.random(), 2.6); // valores altos são raros
// Itens de classe: armas e lendários com +habilidade são de uma classe (it.cls) e só ela equipa.
// 1 em 4 sai para a outra classe (o Arqueiro acha espadas, o Guerreiro acha arcos) — dá para vender.
const otherCls = () => pick(CLASSES.filter(c => c.ok && c.id !== clsOf())).id;
const canUse = it => !it.cls || it.cls === clsOf();
// Nível exigido a partir do ilvl: quanto mais rara, mais perto do ilvl (Comum −3, Incomum −2, Raro −2, Épico −1, Lendário = ilvl), até o nível máximo
const reqLv = it => clamp(it.ilvl - [3, 2, 2, 1, 0][it.rar], 1, MAX_LV);
const canEquip = it => canUse(it) && S.lv >= reqLv(it);
const clsName = id => (CLASSES.find(c => c.id === id) || CLASSES[0]).n;
// Força da base (dano da arma / armadura) e dos atributos por raridade
const RAR_F = [1, 1, 1.06, 1.12, 1.22];
// Antes do balanceamento de out/2026 era [1, 1, 1.08, 1.18, 1.35]: itens salvos antes disso são recalculados por rebalanceItem()
const RAR_F_OLD = [1, 1, 1.08, 1.18, 1.35];
// Refaz a força de um item salvo com a regra atual: base pela razão nova/antiga e cada atributo pela própria qualidade (t) já sorteada
function rebalanceItem(it){
  if(!it || typeof it.rar !== 'number') return;
  const f = RAR_F[it.rar] / RAR_F_OLD[it.rar];
  if(f !== 1){
    if(it.min){ it.min = Math.max(1, Math.round(it.min*f)); it.max = Math.max(it.min + 1, Math.round(it.max*f)); }
    if(it.armor) it.armor = Math.max(1, Math.round(it.armor*f));
  }
  for(const a of it.affix){
    const A = AFX[a.k]; if(!A || typeof a.t !== 'number') continue;
    const lo = A.lo(it.ilvl), hi = A.hi(it.ilvl)*RAR_F[it.rar];
    let v = lo + (hi - lo)*a.t; a.v = A.dec ? Math.round(v*10)/10 : Math.max(1, Math.round(v));
  }
}
// +habilidade do Lendário (uma ativa ou passiva da classe do item)
function addSkill(it, cls){
  const K = CLASS_KIT[cls] || CLASS_KIT.arqueiro, s = pick([...K.active, ...K.passive]), v = Math.random() < .12 ? 2 : 1;
  it.cls = cls; it.affix.push({k:'skill', s, v, t:v===2?1:.5});
}
const normalAffix = it => it.affix.filter(a => a.k !== 'skill');
function genItem(ilvl, rar, slot, cls){
  slot = slot || (Math.random() < .22 ? 'bow' : pick(SLOTS.slice(1)));
  cls = cls || (Math.random() < .25 ? otherCls() : clsOf());
  const rf = RAR_F[rar];
  const it = {id:S.uid++, slot, rar, ilvl, affix:[]};
  if(slot === 'bow' || rar === LEG_R) it.cls = cls;
  if(slot === 'bow'){
    const b = weaponBases(cls).slice().reverse().find(x => ilvl >= x.lv);
    const t = skew(), base = (3 + ilvl*1.5) * b.m * (1 + .45*t) * rf;
    it.min = Math.max(1, Math.round(base)); it.max = Math.max(it.min+1, Math.round(base*rnd(1.75,2.05)));
    it.aps = b.aps; it.base = b.n; it.bt = t;
  } else {
    it.base = BASES[slot][Math.min(3, Math.floor(ilvl/10))];
    if(ARMOR_M[slot]){ const t = skew(); it.armor = Math.round((3 + ilvl*1.3) * ARMOR_M[slot] * (1 + .5*t) * rf); it.bt = t; }
  }
  addAffixes(it, AFF_N[rar]);
  if(rar === LEG_R) addSkill(it, cls);
  it.name = nameItem(it);
  return it;
}
// Tiers dos atributos (estilo Path of Exile): a faixa de cada atributo vai do mínimo (lo no nível 1) ao máximo (hi no nível 40, o teto).
// T1 = 90–100% dessa faixa, T2 = 80–90%... T10 = 0–10%. O ilvl libera o melhor tier (bestTier: ilvl 37–40 → T1, 33–36 → T2... 1–4 → T10)
// e o sorteio cai nele ou alguns abaixo (TIER_W por raridade: quanto mais rara, mais perto do melhor). t = posição na faixa (0–1).
const TIERS = 10;
// peso (por raridade) do melhor tier liberado, 1 abaixo, 2 abaixo... até 9 abaixo. Só entram os tiers que o ilvl libera e os pesos
// são divididos entre eles: nível 1–4 só tem T10 (100%), 5–8 tem T9/T10 (T9 ~35–40%)... e no 37–40 o T1 é o mais difícil (2–9%).
const TIER_W = [[2,4,8,12,15,17,16,13,8,5], [2,4,8,12,15,17,16,13,8,5], [4,7,11,15,16,15,13,10,6,3], [5,9,13,16,16,14,11,8,5,3], [9,13,16,16,14,11,9,6,4,2]];
const affixRange = k => [AFX[k].lo(1), AFX[k].hi(MAX_LV)];
const bestTier = ilvl => clamp(TIERS + 1 - Math.ceil(ilvl/4), 1, TIERS);
const tierOf = t => clamp(TIERS - Math.floor(t*TIERS), 1, TIERS);
function rollTier(it){
  const best = bestTier(it.ilvl), w = (TIER_W[it.rar] || TIER_W[0]).slice(0, TIERS - best + 1);
  let r = Math.random()*w.reduce((a, b) => a + b, 0), o = 0;
  while(o < w.length - 1 && r >= w[o]){ r -= w[o]; o++; }
  return best + o;
}
// Atributo pela posição t na faixa (cortada no melhor tier que o ilvl permite)
function affixAt(it, k, t){
  const A = AFX[k], [lo, hi] = affixRange(k);
  t = clamp(t, 0, (TIERS - bestTier(it.ilvl) + 1)/TIERS);
  const v = lo + (hi - lo)*t;
  return {k, v:A.dec ? Math.round(v*10)/10 : Math.max(1, Math.round(v)), t, tier:tierOf(Math.min(t, .9999))};
}
// Sorteia o tier e um ponto dentro dele
const rollAffix = (it, k) => { const tier = rollTier(it); return affixAt(it, k, (TIERS - tier + Math.random())/TIERS); };
// Itens de antes dos tiers (ver < 7): cada atributo vira o tier do valor que já tinha (cortado pelo ilvl do item)
function retierItem(it){
  if(!it || !Array.isArray(it.affix)) return;
  it.affix = it.affix.map(a => {
    if(a.k === 'skill' || !AFX[a.k]) return a;
    const [lo, hi] = affixRange(a.k);
    return affixAt(it, a.k, (a.v - lo)/(hi - lo));
  });
}
// Quantos prefixos (p) e sufixos (s) o item já tem
const affixCount = it => { const c = {p:0, s:0}; for(const a of normalAffix(it)) if(AFX[a.k]) c[AFX[a.k].g]++; return c; };
// Grupo do próximo atributo: o que tiver menos (empate = sorteio), sem passar de AFX_G_MAX nem usar grupo sem opção no espaço
function nextGroup(it, c, pools){
  const ok = ['p', 's'].filter(g => c[g] < AFX_G_MAX && pools[g].length);
  if(!ok.length) return null;
  if(ok.length === 2 && c.p !== c.s) return c.p < c.s ? 'p' : 's';
  return pick(ok);
}
// Sorteia n atributos novos (sem repetir os que o item já tem), equilibrando prefixos e sufixos, cada um com seu tier.
// ts (opcional) = posições t a usar no lugar do sorteio (migração de itens antigos)
function addAffixes(it, n, ts){
  const have = new Set(it.affix.map(a => a.k)), c = affixCount(it);
  const pools = {p:[], s:[]};
  for(const k in AFX) if(AFX[k].slots.includes(it.slot) && !have.has(k)) pools[AFX[k].g].push(k);
  for(let i = 0; i < n; i++){
    const g = nextGroup(it, c, pools); if(!g) break;
    const k = pools[g].splice(Math.floor(Math.random()*pools[g].length), 1)[0];
    it.affix.push(ts && ts.length ? affixAt(it, k, ts.shift()) : rollAffix(it, k)); c[g]++;
  }
}
// Itens de antes dos prefixos/sufixos (ver < 6): tira os atributos que não servem mais no espaço (ex.: vida na arma) ou que passam
// do limite do grupo, e sorteia outros no lugar mantendo a qualidade (t) dos que saíram. O número de atributos não muda.
function fixAffixes(it){
  if(!it || !Array.isArray(it.affix)) return;
  const skill = it.affix.filter(a => a.k === 'skill'), keep = [], lost = [], c = {p:0, s:0};
  for(const a of normalAffix(it)){
    const A = AFX[a.k];
    if(A && A.slots.includes(it.slot) && c[A.g] < AFX_G_MAX && !keep.some(x => x.k === a.k)){ keep.push(a); c[A.g]++; }
    else lost.push(typeof a.t === 'number' ? a.t : .5);
  }
  // equilibra: com 2 ou mais atributos, o grupo maior não pode passar do menor + 1 (ex.: 2 prefixos e nenhum sufixo vira 1+1)
  const n = keep.length + lost.length;
  for(const g of ['p', 's']){
    const max = n === 1 ? 1 : Math.ceil(n/2);
    while(c[g] > max){ const i = keep.findIndex(a => AFX[a.k].g === g); lost.push(keep[i].t); keep.splice(i, 1); c[g]--; }
  }
  it.affix = keep;
  addAffixes(it, lost.length, lost);
  it.affix.push(...skill);
  if(it.rar === 1) it.name = nameItem(it);
}
// Usa um orbe no item. Orbes de melhoria sobem 1 raridade (+1 atributo, base melhor); a Anulação tira 1 atributo e baixa 1 raridade.
// Devolve true se usou.
function upgradeItem(it, k){
  const O = ORBS[k]; if(!O || !it || !O.ok(it) || !(S.orbs[k] > 0)) return false;
  S.orbs[k]--;
  const from = it.rar, to = O.rm ? from - 1 : O.to, f = RAR_F[to] / RAR_F[from];
  if(it.min){ it.min = Math.max(1, Math.round(it.min*f)); it.max = Math.max(it.min + 1, Math.round(it.max*f)); }
  if(it.armor) it.armor = Math.max(1, Math.round(it.armor*f));
  it.rar = to;
  if(O.rm){
    // tira 1 atributo do grupo maior (empate = qualquer um), para prefixos e sufixos continuarem equilibrados
    const rest = normalAffix(it), c = affixCount(it), big = c.p === c.s ? null : c.p > c.s ? 'p' : 's';
    const idx = rest.map((a, i) => i).filter(i => !big || (AFX[rest[i].k] && AFX[rest[i].k].g === big));
    rest.splice(pick(idx.length ? idx : rest.map((a, i) => i)), 1);
    it.affix = from === LEG_R ? rest : [...rest, ...it.affix.filter(a => a.k === 'skill')];
    if(from === LEG_R && it.slot !== 'bow') delete it.cls; // sem a +habilidade, qualquer classe usa
  } else {
    addAffixes(it, AFF_N[to] - normalAffix(it).length);
    if(to === LEG_R && !it.affix.some(a => a.k === 'skill')) addSkill(it, it.cls || clsOf());
  }
  it.name = nameItem(it);
  return true;
}
function nameItem(it){
  if(it.rar === 0) return it.base;
  if(it.rar === 1) return `${it.base} ${SUF[(normalAffix(it)[0] || {}).k] || ''}`.trim();
  if(it.rar < LEG_R) return `${pick(RA)} de ${pick(RB)}`;
  return pick(LEG[it.slot]);
}
// Forja da vila: 3 itens do mesmo tipo (mesmo espaço; arma também da mesma classe, ex.: 3 arcos) e da mesma raridade
// viram 1 item desse tipo na raridade acima (Comum → Incomum → Raro → Épico → Lendário), com status novos e o maior ilvl dos três.
const forgeMatch = (a, b) => a.slot === b.slot && a.rar === b.rar && (a.slot !== 'bow' || (a.cls || '') === (b.cls || ''));
// Motivo de não poder forjar (ou '' se pode)
function forgeWhy(list){
  if(list.length !== 3) return 'Escolha 3 itens';
  if(!list.every(i => forgeMatch(i, list[0]))) return 'Os 3 precisam ser do mesmo tipo e da mesma raridade';
  if(list[0].rar >= LEG_R) return 'Lendário já é a maior raridade';
  return '';
}
// Custo da forja: cresce com o maior ilvl e a raridade (ex.: 3 Raros ilvl 20 ≈ 2.200; 3 Épicos ilvl 40 ≈ 8.400)
const forgeCost = list => Math.round((50 + Math.max(...list.map(i => i.ilvl))*25) * [1,2,4,8,16][Math.max(...list.map(i => i.rar))]);
function forgeItems(list){
  const src = list[0], ilvl = Math.max(...list.map(i => i.ilvl));
  // arma ou item de classe sai para a mesma classe; o resto, para a sua
  return genItem(ilvl, src.rar + 1, src.slot, src.cls || clsOf());
}
function rollRar(elite){
  const r = Math.random(), m = elite ? 4 : 1;
  if(r < .003*m) return 4;
  if(r < .015*m) return 3;
  if(r < .055*m) return 2;
  if(r < .22*(elite?2:1)) return 1;
  return 0;
}
// Raridade dos itens do mercador: Comum 60% · Incomum 30% · Raro 7,5% · Épico 2% · Lendário 0,5%
function shopRar(){ const r = Math.random(); if(r < .005) return 4; if(r < .025) return 3; if(r < .1) return 2; if(r < .4) return 1; return 0; }
// O mercador vende para a sua classe
function rollShop(){ S.shop = [0,1,2].map(() => genItem(Math.max(1, S.lv), shopRar(), null, clsOf())); }
const buyPrice = it => Math.round(sellPrice(it) * 4);
const sellPrice = it => Math.round((4 + it.ilvl*2) * [1,3,6,14,40][it.rar]);

/* ---------- STATUS ---------- */
function calcStats(eq = S.eq){
  const a = {wdp:0,fdmg:0,dmg:0,life:0,armor:0,pois:0,ias:0,crit:0,critd:0,ms:0,ls:0,cdr:0,pdur:0,gf:0,rf:0,rc:0,rl:0,rp:0,rall:0}, bonus = {};
  let wmin = 1, wmax = 2, aps = 1.1;
  for(const slot of SLOTS){
    const it = eq[slot]; if(!it) continue;
    if(it.slot === 'bow'){ wmin = it.min; wmax = it.max; aps = it.aps; }
    if(it.armor) a.armor += it.armor;
    for(const af of it.affix){ if(af.k === 'skill') bonus[af.s] = (bonus[af.s]||0) + af.v; else a[af.k] += af.v; }
  }
  const L = S.lv, war = isWar();
  const rk = id => SKD[id] && SKD[id].ult ? (ULT[clsOf()] === id && S.lv >= MAX_LV ? 1 : 0) : S.sk[id] > 0 ? S.sk[id] + (bonus[id]||0) : 0;
  const pp = S.pp || {}, dm = (1 + L*.03) * (1 + .01*(pp.dmg || 0)), st = {rk, bonus};
  // Maestria (S.par): cada nível dá +1 de dano (na arma) e +10 de vida, para todas as classes
  const par = S.par || 0;
  // Prefixos de dano: % da arma (só nela), dano adicionado (v a 2v) e % de dano geral
  const wm = (1 + a.wdp/100), gm = dm * (1 + a.dmg/100);
  st.min = (wmin*wm + a.fdmg)*gm + par; st.max = (wmax*wm + a.fdmg*2)*gm + par; st.avg = (st.min + st.max)/2;
  // As passivas de cada classe ocupam o mesmo papel: Dedos Ligeiros = Fúria, Toxina Potente = Brutalidade, Couro Curtido ~ Pele de Ferro
  st.aps = aps * (1 + a.ias/100) * (1 + .05*(rk('agility') + rk('fury') + rk('channel'))) * (1 + .005*(pp.ias || 0));
  st.crit = Math.min(75, 5 + a.crit); st.critd = 150 + a.critd;
  st.pois = 1 + a.pois/100 + .12*(rk('potency') + rk('brutality') + rk('pyro')) + .015*(pp.pois || 0);
  st.pdur = 1 + a.pdur/100;
  // O Guerreiro luta colado: nasce com mais vida e armadura. O Mago é o mais frágil.
  st.life = (70 + L*14 + a.life) * (war ? 1.4 : isMage() ? .92 : 1) * (1 + .07*(rk('hide') + rk('ward')) + .08*rk('iron')) * (1 + .01*(pp.life || 0)) + 10*par;
  st.armor = a.armor + 3*(rk('hide') + rk('ward')) + 6*rk('iron') + (war ? 10 + L*2.2 : 0);
  st.dr = war ? .15 : 0; // Couraça: o Guerreiro recebe 15% menos dano
  st.ms = 125 * (1 + a.ms/100);
  st.ls = a.ls + (war ? 1.5 : 0); st.cdr = Math.min(40, a.cdr); st.gf = a.gf;
  // Resistências (máx. RES_MAX). Inatas: o Arqueiro resiste a veneno, o Mago a fogo.
  const cls = clsOf();
  st.res = {fire:a.rf + a.rall + (cls === 'mago' ? 20 : 0), light:a.rl + a.rall, cold:a.rc + a.rall, poison:a.rp + a.rall + (cls === 'arqueiro' ? 20 : 0)};
  for(const k in st.res) st.res[k] = Math.min(RES_MAX, Math.round(st.res[k]));
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
    case 'storm': return `Suprema (nível 40). Por 4s chovem flechas em até 3 inimigos em volta a cada 0,2s: cada uma causa ${pc(2.2)} do dano da arma e envenena ${fmt(a*2.5*p)} em ${n1(4*d)}s.`;
    case 'titan': return `Suprema (nível 40). Esmaga o chão (raio 220): ${pc(6)} do dano da arma e ${fmt(a*6*p)} de sangramento em todos. Depois, por 8s: +60% de dano, +50% de velocidade de ataque e 25% do dano vira vida. 1,5s sem levar dano.`;
    case 'cataclysm': return `Suprema (nível 40). 10 meteoros caem em 2,5s nos inimigos em volta (raio 110 cada): ${pc(5)} do dano da arma, queimadura de ${fmt(a*3*p)} e chão em chamas.`;
    case 'contagion': return `Quando um inimigo envenenado morre, ${pc(.3+.1*r)} do veneno dele salta para quem estiver perto.`;
  }
  return '';
}
