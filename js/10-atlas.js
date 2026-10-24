// Atlas de Mundos: fim de jogo do nível 40, no estilo do Path of Exile 2. Um mapa grande de nós ligados (por personagem); cada nó é um
// mapa com missão (matar as criaturas raras e, nos nós com Chefe, o Chefe). Para entrar coloca-se uma Pedra de Passagem (tier 1–16, com
// atributos que deixam o mapa mais difícil e dão mais itens). Concluir um nó libera os vizinhos. Torres revelam a região e recebem
// Tabuletas; Brecha e Ritual aparecem em alguns mapas; as 3 Cidadelas dão Fragmentos que acendem o Monólito Ardente (Árbitro das Cinzas).
// Carregado em ordem pelo index.html (ver CLAUDE.md): depois do 09 e antes do 11 (o 11 chama enterTown, que usa atlasLeave).
'use strict';

/* ---------- DADOS ---------- */
// Pedra tier t: criaturas no nível 40 com vida e dano × ATL_STEP^(t−1) (tier 16 ≈ 8×). ATL_MONS criaturas por mapa; ATL_PORTALS entradas.
const ATLAS_ID = 'atlas', ATL_TMAX = 16, ATL_STEP = 1.15, ATL_MONS = 90, ATL_PORTALS = 6, ATL_RARES = 5;
const atlMult = t => Math.pow(ATL_STEP, Math.max(0, t - 1));
// Desenho do Atlas: anéis de nós em volta do Esconderijo (ATL_GAP entre anéis). Torre: alcance das Tabuletas e o quanto revela.
const ATL_GAP = 100, ATL_RINGS = 8, ATL_TOWER_R = 270, ATL_TOWER_SEE = 400, ATL_SEE = 175, ATL_TAB_SLOTS = 3;
const WAY_CAP = 60, TAB_CAP = 20, TAB_USES = 10;
const WAY_CH = .01, TAB_CH = .004; // por criatura (rara × 4); o Chefe sempre deixa Pedra
const WAY_C = '#7fd0c8';
// Atributos das Pedras de Passagem: um item Comum não tem nenhum, Incomum 1 ... Lendário 4 (AFF_N). Cada um tem q = +% de itens no mapa
// (e +q × 1,5% de chance de Pedra). Os orbes de melhoria valem nas Pedras do mesmo jeito que nos itens (wayOrb).
const WAY_MODS = {
  mlife:{n:v => `Criaturas com +${v}% de vida`, lo:20, hi:45},
  mdmg:{n:v => `Criaturas causam +${v}% de dano`, lo:15, hi:35},
  mspd:{n:v => `Criaturas ${v}% mais rápidas`, lo:8, hi:20},
  mpack:{n:v => `+${v}% de criaturas no mapa`, lo:15, hi:40},
  mrare:{n:v => `+${v}% de criaturas raras`, lo:30, hi:80},
  mres:{n:v => `Você tem −${v}% de resistência a todos os elementos`, lo:10, hi:25},
  mregen:{n:() => 'Sua vida não se recupera sozinha', lo:1, hi:1},
};
// Tabuletas: colocadas numa Torre concluída (até ATL_TAB_SLOTS), valem para os mapas no alcance dela e gastam 1 uso por mapa concluído
const TABLETS = {
  brecha:{n:'Tabuleta da Brecha', d:'Os mapas no alcance têm uma Brecha', c:'#c08aff'},
  ritual:{n:'Tabuleta do Ritual', d:'Os mapas no alcance têm um Altar de Ritual', c:'#ff6a5a'},
  fortuna:{n:'Tabuleta da Fortuna', d:'+30% de itens nos mapas no alcance', c:'#f5cf3a'},
  passagem:{n:'Tabuleta do Viajante', d:'+50% de chance de Pedras de Passagem no alcance', c:WAY_C},
  elite:{n:'Tabuleta da Caçada', d:'+50% de criaturas raras nos mapas no alcance', c:'#9fbaff'},
  saber:{n:'Tabuleta do Saber', d:'+25% de experiência nos mapas no alcance', c:'#c9a8ff'},
};
// Cidadelas (bem longe, escondidas até uma Torre revelar): Chefe forte que deixa um Fragmento. Os 3 Fragmentos acendem o Monólito.
const CITADELS = {
  ferro:{n:'Cidadela de Ferro', boss:'cavaleiro', bn:'Senhor de Ferro', map:'cidadela', frag:'Fragmento de Ferro', c:'#b8c4d4'},
  cobre:{n:'Cidadela de Cobre', boss:'golem', bn:'Colosso de Cobre', map:'mina', frag:'Fragmento de Cobre', c:'#e0904a'},
  pedra:{n:'Cidadela de Pedra', boss:'mamute', bn:'Titã de Pedra', map:'picos', frag:'Fragmento de Pedra', c:'#c8bca0'},
};
const MONO = {n:'Monólito Ardente', boss:'brutamonte', bn:'Árbitro das Cinzas', map:'abismo', tier:10, c:'#ff7a3a'};
// Brecha: tocar abre por BREACH_T s; criaturas saem dela sem parar (BREACH_MONS) e, quando fecha, deixa um tesouro.
// Ritual: pisar no altar começa RITUAL_WAVES ondas dentro do círculo (RITUAL_R); vencidas todas, o altar dá o tributo.
const BREACH_MONS = ['diabrete','servo','aranhasombria','feiticeiro','gargula'], BREACH_T = 18, BREACH_R = 320, BREACH_C = '#b07cff';
const RITUAL_R = 150, RITUAL_WAVES = 3, RITUAL_C = '#ff5a4a';
const ATL_NAMES = {
  campos:['Celeiro Queimado','Moinho Velho','Colheita Maldita','Trigal Sombrio','Estrada dos Corvos'],
  floresta:['Bosque Uivante','Clareira Fria','Raízes Antigas','Toca dos Lobos','Mata Cinzenta'],
  pantano:['Charco Fétido','Brejo das Bruxas','Lodo Profundo','Ilha Podre','Poço Afogado'],
  mina:['Galeria Funda','Veio de Cobre','Forno Esquecido','Poço dos Goblins','Trilhos Partidos'],
  catacumbas:['Ossário','Cripta Gelada','Salão dos Mortos','Túmulos Rachados','Capela Profanada'],
  picos:['Passo Gelado','Geleira','Cume da Nevasca','Caverna do Yeti','Ponte de Gelo'],
  deserto:['Duna Ardente','Templo Soterrado','Oásis Seco','Ruínas de Cinza','Vale das Serpentes'],
  cidadela:['Muralha Negra','Ameias Partidas','Salão do Trono','Pátio dos Cavaleiros','Capela Sombria'],
  abismo:['Rio de Lava','Forja Infernal','Garganta de Fogo','Ponte de Brasa','Poço Ardente'],
};
const TOWER_NAMES = ['Torre do Vigia','Torre Partida','Torre dos Ventos','Torre Antiga','Torre do Eco','Torre Precursora'];
const ATL_TYPE = {home:'Esconderijo', map:'Mapa', boss:'Mapa com Chefe', tower:'Torre Precursora', cit:'Cidadela', mono:'Monólito Ardente'};

/* ---------- PEDRAS DE PASSAGEM ---------- */
function makeWay(tier, rar){ const w = {id:S.uid++, tier:clamp(Math.round(tier), 1, ATL_TMAX), rar:0, mods:[]}; wayRaise(w, rar || 0); return w; }
function wayAddMod(w){
  const free = Object.keys(WAY_MODS).filter(k => !w.mods.some(m => m.k === k)); if(!free.length) return;
  const k = pick(free), M = WAY_MODS[k]; w.mods.push({k, v:rint(M.lo, M.hi), q:rint(8, 16)});
}
function wayRaise(w, rar){ w.rar = clamp(rar, 0, LEG_R); while(w.mods.length < AFF_N[w.rar]) wayAddMod(w); }
const wayQ = w => w ? w.mods.reduce((a, m) => a + m.q, 0) : 0;
const wayMod = (w, k) => { const m = w && w.mods.find(x => x.k === k); return m ? m.v : 0; };
const wayName = w => `Pedra de Passagem ${w.tier}`;
const rollWayRar = () => { const r = Math.random(); return r < .005 ? 4 : r < .03 ? 3 : r < .12 ? 2 : r < .4 ? 1 : 0; };
// Orbe numa Pedra: Despertar/Ascensão/Exaltação/Lenda sobem 1 raridade (+1 atributo); Anulação tira 1 atributo e baixa 1
function wayOrb(w, k){
  const O = ORBS[k]; if(!O || !O.ok(w) || !(S.orbs[k] > 0)) return false;
  S.orbs[k]--;
  if(O.rm){ w.mods.splice(rint(0, w.mods.length - 1), 1); w.rar--; } else wayRaise(w, O.to);
  return true;
}

/* ---------- O ATLAS (nós e ligações) ---------- */
// Sorteio com semente (o mesmo Atlas em qualquer aparelho): só a semente e o que foi feito ficam no save (S.atlas)
function atlRand(seed){ let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const angDist = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
function segX(a, b, c, d){ // os segmentos ab e cd se cruzam (ponta em comum não conta)
  if(a === c || a === d || b === c || b === d) return false;
  const o = (p, q, r) => Math.sign((q.x - p.x)*(r.y - p.y) - (q.y - p.y)*(r.x - p.x));
  return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b);
}
let ATLAS = null; // {seed, nodes, adj, edges}: refeito da semente, não fica salvo
function atlasGen(seed){
  const R = atlRand(seed), rp = a => a[Math.floor(R()*a.length)];
  const shuffle = a => { for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(R()*(i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const nodes = [{id:0, x:0, y:0, ring:0, a:0, t:'home', b:'campos', name:'Esconderijo'}];
  for(let r = 1; r <= ATL_RINGS; r++){
    const n = 6*r, off = R()*TAU;
    for(let i = 0; i < n; i++){
      const a = off + (i + (R() - .5)*.5)/n*TAU, d = r*ATL_GAP + (R() - .5)*ATL_GAP*.4;
      nodes.push({id:nodes.length, x:Math.cos(a)*d*1.3, y:Math.sin(a)*d, ring:r, a});
    }
  }
  // ligações: as mais curtas que não cruzam nenhuma outra; depois tira algumas (sem deixar ninguém isolado)
  const cand = [];
  for(let i = 0; i < nodes.length; i++) for(let j = i + 1; j < nodes.length; j++){ const d = D(nodes[i], nodes[j]); if(d < ATL_GAP*1.9) cand.push([i, j, d]); }
  cand.sort((p, q) => p[2] - q[2] || p[0] - q[0] || p[1] - q[1]);
  const E = [];
  for(const c of cand){ const A = nodes[c[0]], B = nodes[c[1]]; if(!E.some(e => segX(A, B, nodes[e[0]], nodes[e[1]]))) E.push(c); }
  const adj = nodes.map(() => new Set()); for(const [i, j] of E){ adj[i].add(j); adj[j].add(i); }
  const reach = () => { const seen = new Set([0]), q = [0]; while(q.length){ const i = q.pop(); for(const j of adj[i]) if(!seen.has(j)){ seen.add(j); q.push(j); } } return seen; };
  for(const [i, j] of shuffle(E.slice())){
    if(R() > .45 || adj[i].size <= 2 || adj[j].size <= 2) continue;
    adj[i].delete(j); adj[j].delete(i);
    if(reach().size < nodes.length){ adj[i].add(j); adj[j].add(i); }
  }
  for(let seen = reach(); seen.size < nodes.length; seen = reach()){ // garante que tudo se liga ao Esconderijo
    const n = nodes.find(o => !seen.has(o.id)), to = nodes.filter(o => seen.has(o.id)).reduce((b, o) => D(o, n) < D(b, n) ? o : b);
    adj[n.id].add(to.id); adj[to.id].add(n.id);
  }
  // regiões: cada nó fica com o visual (e as criaturas) do centro de região mais perto
  const cents = []; for(let i = 0; i < 16; i++){ const a = R()*TAU, d = Math.sqrt(R())*(ATL_RINGS + .5)*ATL_GAP; cents.push({x:Math.cos(a)*d*1.3, y:Math.sin(a)*d, b:MAPS[i % MAPS.length].id}); }
  for(const n of nodes) if(n.id) n.b = cents.reduce((b, c) => D(c, n) < D(b, n) ? c : b).b;
  // especiais: 3 Cidadelas no anel de fora, o Monólito no meio do caminho, Torres espalhadas
  const a0 = R()*TAU;
  Object.keys(CITADELS).forEach((k, i) => {
    const want = a0 + i*TAU/3, C = CITADELS[k];
    const n = nodes.filter(o => o.ring === ATL_RINGS && !o.t).reduce((b, o) => angDist(o.a, want) < angDist(b.a, want) ? o : b);
    Object.assign(n, {t:'cit', cit:k, b:C.map, name:C.n});
  });
  const mono = nodes.filter(o => o.ring === 5 && !o.t).reduce((b, o) => angDist(o.a, a0 + TAU/6) < angDist(b.a, a0 + TAU/6) ? o : b);
  Object.assign(mono, {t:'mono', b:MONO.map, name:MONO.n});
  const towers = [];
  for(const n of shuffle(nodes.filter(o => o.ring >= 2 && !o.t))) if(towers.every(t => D(t, n) > 360)){ n.t = 'tower'; n.name = rp(TOWER_NAMES); towers.push(n); }
  for(const n of nodes){
    if(n.t === 'cit' || n.t === 'mono' || n.t === 'home') continue;
    if(!n.t) n.t = R() < .2 ? 'boss' : 'map';
    if(!n.name) n.name = rp(ATL_NAMES[n.b]);
    const c = R(); n.c = c < .12 ? 'brecha' : c < .24 ? 'ritual' : '';
    n.cor = R() < .08;
  }
  const edges = []; adj.forEach((s, i) => s.forEach(j => { if(i < j) edges.push([i, j]); }));
  return {seed, nodes, adj:adj.map(s => [...s]), edges, cents};
}
// Estado do Atlas do personagem (cria no 1º uso, no nível 40): S.atlas = {seed, done, fail, tow, top, arb, cur}
//   done/fail = nós concluídos/que falharam · tow = Tabuletas em cada Torre · top = maior Pedra concluída · arb = vezes que o Árbitro caiu
//   cur = nó com mapa aberto (o mapa aberto só vive na memória: recarregar o jogo fecha o mapa e a Pedra se perde)
let atlRun = null, atlDef = null; // mapa do Atlas aberto: atlRun = {cid, node, way, tier, ...}; atlDef = o mapDef dele
const inAtlas = () => scene === 'map' && !!atlRun && !!atlDef && mapDef === atlDef; // depois de morrer (atlRun = null) o mapa já não conta
const atlOpenRun = () => atlRun && atlRun.cid === S.cid ? atlRun : null;
function atl(){
  if(!Array.isArray(S.ways)) S.ways = [];
  if(!Array.isArray(S.tabs)) S.tabs = [];
  S.frags = {ferro:0, cobre:0, pedra:0, ...(S.frags || {})};
  if(!S.atlas || typeof S.atlas !== 'object'){
    S.atlas = {seed:Math.floor(Math.random()*2147483647), done:{0:1}, fail:{}, tow:{}, top:0, arb:0, cur:null};
    // Atlas novo: 3 Pedras tier 1; quem já tinha avançado no antigo Mapa Aleatório ganha mais 2 do nível dele (até 16)
    for(let i = 0; i < 3; i++) S.ways.push(makeWay(1, i === 2 ? 1 : 0));
    const old = (S.rmap && S.rmap.best) || 0;
    if(old >= 2) for(let i = 0; i < 2; i++) S.ways.push(makeWay(Math.min(ATL_TMAX, old), 1));
    log('O Atlas de Mundos se abriu! Coloque uma Pedra de Passagem num mapa ligado ao seu Esconderijo (aba Mapas).', WAY_C);
  }
  const A = S.atlas;
  for(const k of ['done', 'fail', 'tow']) if(!A[k] || typeof A[k] !== 'object') A[k] = {};
  A.done[0] = 1;
  if(!ATLAS || ATLAS.seed !== A.seed) ATLAS = atlasGen(A.seed);
  if(A.cur != null && !atlOpenRun()){ log('O mapa que estava aberto no Atlas se fechou (a Pedra de Passagem foi gasta).', '#ff8c80'); A.cur = null; }
  return A;
}
const atlNode = id => ATLAS && ATLAS.nodes[id];
const atlAdjDone = (A, n) => ATLAS.adj[n.id].some(j => A.done[j]);
// Cidadelas e Monólito podem ser feitos de novo (mais Fragmentos, mais Árbitro); os outros nós só uma vez
const atlRepeat = n => n.t === 'cit' || n.t === 'mono';
const atlAvail = (A, n) => n.t !== 'home' && (atlRepeat(n) || !A.done[n.id]) && atlAdjDone(A, n);
const atlTowersDone = A => ATLAS.nodes.filter(n => n.t === 'tower' && A.done[n.id]);
// O que se vê: o concluído, os vizinhos dele, o que está perto e o que as Torres revelam (Cidadelas só pela Torre ou de vizinho)
function atlSeenSet(A){
  const done = ATLAS.nodes.filter(n => A.done[n.id]), tw = done.filter(n => n.t === 'tower'), seen = new Set();
  for(const n of ATLAS.nodes)
    if(A.done[n.id] || n.t === 'mono' || atlAdjDone(A, n) || tw.some(t => D(t, n) < ATL_TOWER_SEE) || (n.t !== 'cit' && done.some(d => D(d, n) < ATL_SEE))) seen.add(n.id);
  return seen;
}
function atlTabsAt(A, n){ const out = []; for(const t of atlTowersDone(A)) if(D(t, n) < ATL_TOWER_R) for(const tb of (A.tow[t.id] || [])) out.push(tb); return out; }
const atlHasFrags = () => Object.keys(CITADELS).every(k => (S.frags[k] || 0) > 0);

/* ---------- ENTRAR, SAIR, CONCLUIR ---------- */
// Colocar a Pedra (na vila): gasta a Pedra (o Monólito gasta os 3 Fragmentos) e abre o mapa do nó com ATL_PORTALS entradas
function atlasOpen(id){
  const A = atl(), n = atlNode(id);
  if(!inTown() || trans || cut || atlOpenRun() || !n || !atlAvail(A, n)) return; // não durante a cena do Ezequiel
  let w = null, tier;
  if(n.t === 'mono'){ if(!atlHasFrags()) return; for(const k in CITADELS) S.frags[k]--; tier = MONO.tier; }
  else { w = S.ways.find(x => x.id === atlWaySel); if(!w) return; S.ways = S.ways.filter(x => x !== w); tier = w.tier; }
  const tabs = atlTabsAt(A, n), has = k => tabs.some(t => t.k === k), base = MAPS.find(m => m.id === n.b) || MAPS[0];
  atlRun = {cid:S.cid, node:id, way:w, tier, portals:ATL_PORTALS, snap:null, objs:[], done:false, bossDown:false, rares:0, monoT:10,
    q:wayQ(w) + (has('fortuna') ? 30 : 0) + (n.cor ? 50 : 0), wayCh:1 + wayQ(w)*1.5/100 + (has('passagem') ? .5 : 0),
    xp:1 + (has('saber') ? .25 : 0) + (n.cor ? .2 : 0), rareX:wayMod(w, 'mrare')/100 + (has('elite') ? .5 : 0),
    brecha:n.c === 'brecha' || has('brecha'), ritual:n.c === 'ritual' || has('ritual'), boss:n.t !== 'map'};
  atlDef = {...base, id:ATLAS_ID, name:n.name, theme:base.name, lv:[MAX_LV, MAX_LV], req:MAX_LV};
  A.cur = id; S.map = ATLAS_ID;
  closeSheet(); log(`${w ? wayName(w) + ' colocada' : 'Os 3 Fragmentos acenderam o Monólito'}: ${n.name} abriu (${ATL_PORTALS} portais).`, WAY_C); save();
  transition(() => enterMap(ATLAS_ID));
}
// enterMap (03) no nível 40: só entra se houver mapa aberto; cada entrada gasta 1 portal
function atlasEnter(){
  if(!atlOpenRun() || !atlDef) return false;
  mapDef = atlDef; S.map = ATLAS_ID; S.dun.phase = 0; atlRun.portals--;
  return true;
}
function atlScale(m){
  const R0 = atlRun, w = R0.way, k = atlMult(R0.tier) * (atlNode(R0.node).cor ? 1.3 : 1);
  m.hpMax *= k*(1 + wayMod(w, 'mlife')/100); m.hp = m.hpMax; m.dmg *= k*(1 + wayMod(w, 'mdmg')/100); m.spd *= 1 + wayMod(w, 'mspd')/100;
}
const atlTotal = () => Math.round(ATL_MONS * (atlNode(atlRun.node).t === 'mono' ? .5 : 1) * (1 + wayMod(atlRun.way, 'mpack')/100));
const atlLoot = () => inAtlas() && atlRun ? 1 + atlRun.q/100 : 1;
const atlResPen = () => inAtlas() && atlRun ? wayMod(atlRun.way, 'mres') : 0;
const atlNoRegen = () => inAtlas() && !!atlRun && wayMod(atlRun.way, 'mregen') > 0;
function atlElite(m){ m.elite = true; m.hpMax *= 3.2; m.hp = m.hpMax; m.r *= 1.3; m.dmg *= 1.5; m.spd *= 1.05; m.name = `${m.d.n} ${pick(ELITE_TAG)}`; m.rare = true; }
const tileXY = i => ({x:(i % LV_N + .5)*TILE, y:(((i / LV_N) | 0) + .5)*TILE});
function atlFar(){ let best = -1, bi = 0; for(let i = 0; i < LV_N*LV_N; i++) if(LV.g[i] === 1 && isFinite(LV.dist[i]) && LV.dist[i] > best){ best = LV.dist[i]; bi = i; } return tileXY(bi); }
function atlSpot(){
  const s = []; for(let i = 0; i < LV_N*LV_N; i++) if(LV.g[i] === 1 && isFinite(LV.dist[i]) && LV.dist[i] >= 16) s.push(i);
  for(let k = 0; k < 80 && s.length; k++){ const p = tileXY(pick(s)); if(walkable(p.x, p.y, 40) && !atlRun.objs.some(o => D(o, p) < 450)) return p; }
  return s.length ? tileXY(pick(s)) : {x:hero.x + 200, y:hero.y};
}
// Depois de spawnLevel: marca as criaturas raras (missão), põe o Chefe na sala mais longe, a Brecha e o Ritual
function atlasSetup(){
  const R0 = atlRun, n = atlNode(R0.node);
  const want = n.t === 'cit' || n.t === 'mono' ? 0 : Math.round((ATL_RARES + Math.floor(R0.tier/3)) * (1 + R0.rareX));
  if(want){
    for(const m of mons) if(m.elite) m.rare = true;
    const pool = mons.filter(m => !m.elite);
    while(mons.filter(m => m.rare).length < want && pool.length) atlElite(pool.splice(rint(0, pool.length - 1), 1)[0]);
  }
  R0.rares = mons.filter(m => m.rare).length;
  if(R0.boss) atlasBoss(atlFar(), n);
  if(R0.brecha) R0.objs.push({k:'brecha', ...atlSpot(), st:0, t:0, r:26, sp:0, kills:0});
  if(R0.ritual) R0.objs.push({k:'ritual', ...atlSpot(), st:0, t:0, wave:0, id:++packId});
  const goal = [R0.rares ? `mate as ${R0.rares} criaturas raras` : '', R0.boss ? `derrote ${R0.bossMon ? R0.bossMon.name : 'o Chefe'}` : ''].filter(Boolean).join(' e ');
  log(`${atlDef.name} (Pedra ${R0.tier}${n.cor ? ', corrompido' : ''}): ${goal}.${R0.brecha ? ' Há uma Brecha.' : ''}${R0.ritual ? ' Há um Altar de Ritual.' : ''}`, WAY_C);
}
function atlasBoss(p, n){
  const C = n.t === 'cit' ? CITADELS[n.cit] : n.t === 'mono' ? MONO : null;
  const pool = atlDef.mons, withAoe = pool.filter(k => MONS[k].aoe), t = C ? C.boss : pick(withAoe.length ? withAoe : pool);
  const hpK = n.t === 'mono' ? 2 : n.t === 'cit' ? 2 : n.t === 'tower' ? 1.4 : 1, pk = ++packId;
  const b = makeMon(t, p.x, p.y, MAX_LV, true);
  b.boss = true; b.pack = pk; b.name = C ? C.bn : n.t === 'tower' ? `Guardião da ${n.name}` : `${MONS[t].n} Ancestral`;
  b.r *= BOSS_R*(C ? 1.25 : 1); b.spd *= .9; b.hpMax *= BOSS_HP*hpK; b.dmg *= BOSS_DMG*(C ? 1.15 : 1);
  atlScale(b); b.el = MONS[t].el; b.lx = b.x; b.ly = b.y; mons.push(b);
  for(let i = 0; i < BOSS_MINIONS; i++){
    const a = i/BOSS_MINIONS*TAU, x = p.x + Math.cos(a)*60, y = p.y + Math.sin(a)*60, ok = walkable(x, y, 8);
    const m = makeMon(pick(pool), ok ? x : p.x, ok ? y : p.y, MAX_LV, false);
    m.minion = true; m.pack = pk; atlScale(m); m.lx = m.x; m.ly = m.y; mons.push(m);
  }
  atlRun.bossMon = b;
}
// Voltou de um mapa (enterTown): concluído fecha; senão guarda o mapa como está para voltar pelo portal (se ainda houver portais)
function atlasLeave(){
  if(!atlRun) return;
  if(atlRun.cid !== S.cid){ atlRun = null; return; }
  if(!inAtlas()) return;
  const A = atl();
  if(atlRun.done){ atlRun = null; A.cur = null; return; }
  if(atlRun.portals <= 0){ A.fail[atlRun.node] = 1; A.cur = null; log(`Os portais de ${atlDef.name} acabaram e o mapa se fechou sem ser concluído.`, '#ff8c80'); atlRun = null; return; }
  atlRun.snap = {LV, decor, mons:mons.filter(m => !m.dead), drops:drops.filter(d => !d.gone), total:mapTotal, gp:groundPat, hx:hero.x, hy:hero.y};
  log(`${atlDef.name} continua aberto (${atlRun.portals} ${atlRun.portals === 1 ? 'portal' : 'portais'}). Toque em Partir para voltar.`, WAY_C);
}
function atlasRestore(){
  const s = atlRun.snap; atlRun.snap = null;
  LV = s.LV; decor = s.decor; mons = s.mons; drops = s.drops; mapTotal = s.total; mapCleared = atlRun.done; groundPat = s.gp; minimapBig = false;
  hero.x = s.hx; hero.y = s.hy; hero.scale = 1; hero.alpha = 1; hero.atk = hero.cast = hero.whirl = hero.dash = null;
  cam.x = hero.x; cam.y = hero.y;
  ring(hero.x, hero.y, 50, '#8ab4ff', .6, 4);
  log(`De volta a ${atlDef.name} (${atlRun.portals} ${atlRun.portals === 1 ? 'portal restante' : 'portais restantes'}).`, WAY_C);
}
function atlasDie(){
  if(!atlRun || !inAtlas()) return;
  const A = atl();
  if(!atlRun.done){ A.fail[atlRun.node] = 1; log(`${atlDef.name} falhou: você caiu e o mapa se fechou. A Pedra foi perdida.`, '#ff8c80'); }
  A.cur = null; atlRun = null;
}
function atlDropWay(x, y, tier, rar){
  const r = Math.random(), t = tier || clamp(atlRun.tier + (r < .25 ? 1 : r < .4 ? -1 : 0), 1, ATL_TMAX);
  const w = makeWay(t, rar == null ? rollWayRar() : rar);
  drops.push({x:x + rnd(-16,16), y:y + rnd(-16,16), atl:'way', way:w, t:0, gone:false});
  log(`${wayName(w)} (${RAR[w.rar].n}) caiu!`, WAY_C); ring(x, y, 60, WAY_C, .7, 3);
}
function atlDropTab(x, y){
  const k = pick(Object.keys(TABLETS));
  drops.push({x:x + rnd(-16,16), y:y + rnd(-16,16), atl:'tab', tab:{id:S.uid++, k, uses:TAB_USES}, t:0, gone:false});
  log(`${TABLETS[k].n} caiu!`, TABLETS[k].c); ring(x, y, 60, TABLETS[k].c, .7, 3);
}
// Tesouro (Brecha, Ritual): itens com sorte de elite, orbes e talvez Pedra/Tabuleta
function atlChest(x, y, nIt, nOrb, wayP){
  for(let i = 0; i < nIt; i++){ const rar = Math.max(1, rollRar(true)), it = genItem(MAX_LV + 1, rar); drops.push({x:x + rnd(-30,30), y:y + rnd(-30,30), it, t:0, gone:false}); }
  const ks = Object.keys(ORBS), tot = ks.reduce((a, k) => a + ORBS[k].chance, 0);
  for(let i = 0; i < nOrb; i++){ let r = Math.random()*tot, k = ks[0]; for(const o of ks){ r -= ORBS[o].chance; if(r <= 0){ k = o; break; } } drops.push({x:x + rnd(-30,30), y:y + rnd(-30,30), orb:k, t:0, gone:false}); }
  if(Math.random() < wayP) atlDropWay(x, y);
  if(Math.random() < .25) atlDropTab(x, y);
  for(let i = 0; i < 30; i++){ const an = Math.random()*TAU, sp = rnd(60, 200); part({x, y:y - 10, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp - 60, grav:200, life:.8, size:rnd(2,4), c:pick(['#f5cf3a','#fff4c0','#ffffff'])}); }
}
// kill (04) num mapa do Atlas: Pedras de Passagem, Tabuletas, Pedra da Masmorra do Chefe e a missão
function atlasKill(m){
  const R0 = atlRun; if(!R0) return;
  const br = R0.objs.find(o => o.k === 'brecha'); if(m.breach && br) br.kills++;
  if(m.boss){
    R0.bossDown = true;
    atlDropWay(m.x, m.y); if(Math.random() < .5) atlDropWay(m.x, m.y);
    if(atlNode(R0.node).t === 'tower') atlDropTab(m.x, m.y);
    if(dunOpen()) spawnStone(m.x, m.y, rint(1, Math.min(R0.tier, 10)));
  } else {
    const k = m.elite ? 4 : 1;
    if(Math.random() < WAY_CH*k*R0.wayCh) atlDropWay(m.x, m.y);
    if(Math.random() < TAB_CH*k) atlDropTab(m.x, m.y);
  }
  atlasCheck(); dirtyPanel();
}
const atlRaresLeft = () => mons.filter(m => m.rare && !m.dead).length;
function atlasCheck(){ const R0 = atlRun; if(R0 && !R0.done && inAtlas() && atlRaresLeft() === 0 && (!R0.boss || R0.bossDown)) atlasComplete(); }
function atlasComplete(){
  const R0 = atlRun, A = atl(), n = atlNode(R0.node);
  R0.done = true; mapCleared = true; A.done[n.id] = 1; delete A.fail[n.id]; A.cur = null;
  if(n.t !== 'mono') A.top = Math.max(A.top || 0, R0.tier);
  for(const t of atlTowersDone(A)) if(t.id !== n.id && D(t, n) < ATL_TOWER_R && A.tow[t.id]){ A.tow[t.id].forEach(tb => tb.uses--); A.tow[t.id] = A.tow[t.id].filter(tb => tb.uses > 0); }
  atlDropWay(hero.x, hero.y, clamp(R0.tier + (Math.random() < .35 ? 1 : 0), 1, ATL_TMAX)); // recompensa do mapa: 1 Pedra garantida
  let msg = `${n.name} concluído!`;
  if(n.t === 'tower') msg += ` A Torre revelou a região: coloque até ${ATL_TAB_SLOTS} Tabuletas nela no Atlas.`;
  if(n.t === 'cit'){ drops.push({x:hero.x + rnd(-16,16), y:hero.y + rnd(-16,16), atl:'frag', frag:n.cit, t:0, gone:false}); msg += ` Caiu o ${CITADELS[n.cit].frag}!`; }
  if(n.t === 'mono'){
    A.arb = (A.arb || 0) + 1; msg += ` O ${MONO.bn} foi derrotado (${A.arb}×)!`;
    for(let i = 0; i < 2; i++) drops.push({x:hero.x + rnd(-30,30), y:hero.y + rnd(-30,30), it:genItem(MAX_LV + 1, LEG_R), t:0, gone:false});
    for(const k of ['lenda', 'exa', 'exa']) drops.push({x:hero.x + rnd(-30,30), y:hero.y + rnd(-30,30), orb:k, t:0, gone:false});
    atlDropWay(hero.x, hero.y, ATL_TMAX, 2);
  }
  ring(hero.x, hero.y, 160, WAY_C, 1.1, 6); ring(hero.x, hero.y, 100, '#f5cf3a', .9, 4);
  txt(hero.x, hero.y - 70, 'MAPA CONCLUÍDO!', '#f5cf3a', 22, -16);
  log(msg + ' Os mapas ligados a ele foram liberados.', '#f5cf3a');
  save(); dirtyPanel();
}
// updateField (06) num mapa do Atlas: Brecha, Ritual e as ondas do Árbitro
function atlMon(type, x, y, elite){
  const m = makeMon(type, x, y, MAX_LV, elite); atlScale(m); m.aggro = true; m.lx = m.x; m.ly = m.y; mons.push(m); return m;
}
function atlNear(o, r){ for(let i = 0; i < 12; i++){ const a = Math.random()*TAU, d = Math.sqrt(Math.random())*r, x = o.x + Math.cos(a)*d, y = o.y + Math.sin(a)*d; if(walkable(x, y, 10)) return {x, y}; } return {x:o.x, y:o.y}; }
function atlasUpdate(dt){
  const R0 = atlRun; if(!R0 || mode !== 'hunt') return;
  for(const o of R0.objs){
    if(o.k === 'brecha'){
      if(o.st === 0 && D(hero, o) < 70){ o.st = 1; o.t = 0; txt(o.x, o.y - 60, 'A BRECHA SE ABRIU!', BREACH_C, 20, -14); log(`A Brecha se abriu! Mate o que sair dela: ela fecha em ${BREACH_T} segundos.`, BREACH_C); ring(o.x, o.y, 120, BREACH_C, 1, 5); }
      else if(o.st === 1){
        o.t += dt; o.r = 26 + (BREACH_R - 26)*Math.min(1, o.t/4); o.sp -= dt;
        if(o.sp <= 0 && o.t < BREACH_T - 1){
          o.sp = .55;
          for(let i = 0; i < 2; i++){ const p = atlNear(o, o.r), m = atlMon(pick(BREACH_MONS), p.x, p.y, Math.random() < .05); m.breach = true; for(let j = 0; j < 6; j++) part({x:p.x, y:p.y - 10, vx:rnd(-60,60), vy:rnd(-90,-20), life:.5, size:rnd(2,4), c:BREACH_C}); }
        }
        if(o.t >= BREACH_T){
          o.st = 2;
          for(const m of mons) if(m.breach && !m.dead){ m.dead = true; m.deadT = 1.6; for(let j = 0; j < 5; j++) part({x:m.x, y:m.y - 10, vx:rnd(-50,50), vy:rnd(-80,-20), life:.5, size:3, c:BREACH_C}); }
          atlChest(o.x, o.y, 2 + Math.floor(o.kills/12), 2 + Math.floor(o.kills/8), .5);
          txt(o.x, o.y - 60, 'A Brecha se fechou', BREACH_C, 18, -14); log(`A Brecha se fechou (${o.kills} abates) e deixou um tesouro.`, BREACH_C);
          atlasCheck(); dirtyPanel();
        }
      }
    } else if(o.k === 'ritual'){
      if(o.st === 0 && D(hero, o) < 55){ o.st = 1; o.wave = 0; o.t = 1.5; log(`O Ritual começou: vença ${RITUAL_WAVES} ondas dentro do círculo.`, RITUAL_C); ring(o.x, o.y, RITUAL_R, RITUAL_C, 1, 5); }
      else if(o.st === 1 && !mons.some(m => m.ritual === o.id && !m.dead)){
        o.t -= dt;
        if(o.t <= 0){
          if(o.wave >= RITUAL_WAVES){ o.st = 2; atlChest(o.x, o.y, 2 + R0.tier/8 | 0, 3, .6); txt(o.x, o.y - 70, 'TRIBUTO DO RITUAL', RITUAL_C, 18, -14); log('O Ritual foi vencido: o altar deixou o tributo.', RITUAL_C); dirtyPanel(); }
          else {
            o.wave++; o.t = 2.5; const n = 5 + o.wave*2;
            for(let i = 0; i < n; i++){ const a = i/n*TAU, x = o.x + Math.cos(a)*RITUAL_R*.85, y = o.y + Math.sin(a)*RITUAL_R*.85, ok = walkable(x, y, 8);
              const m = atlMon(pick(atlDef.mons), ok ? x : o.x, ok ? y : o.y, i === 0); m.ritual = o.id; part({x:m.x, y:m.y - 10, vy:-80, life:.6, size:4, c:RITUAL_C}); }
            txt(o.x, o.y - 60, `Onda ${o.wave}/${RITUAL_WAVES}`, RITUAL_C, 18, -14);
          }
        }
      }
    }
  }
  // Árbitro das Cinzas: chama criaturas de fogo a cada 12 s enquanto luta
  const b = R0.bossMon;
  if(atlNode(R0.node).t === 'mono' && b && !b.dead && b.aggro){
    R0.monoT -= dt;
    if(R0.monoT <= 0){ R0.monoT = 12; for(let i = 0; i < 4; i++){ const p = atlNear(b, 120); atlMon(pick(['elemental','diabrete','cao']), p.x, p.y, false); } ring(b.x, b.y, 130, MONO.c, .9, 5); txt(b.x, b.y - 90, 'Ergam-se, cinzas!', MONO.c, 16, -14); }
  }
}

/* ---------- CHÃO, OBJETOS E ITENS DO ATLAS (desenho; chamado pelo render do 07) ---------- */
// No chão (canvas deitado): mapa corrompido avermelhado, círculo do Ritual e a área aberta da Brecha
function atlasGround(){
  const R0 = atlRun; if(!R0 || !inAtlas()) return;
  if(atlNode(R0.node).cor && LV.prep){ ctx.globalAlpha = .08; ctx.fillStyle = '#ff2a2a'; ctx.fill(LV.prep.floor); ctx.globalAlpha = 1; }
  for(const o of R0.objs){
    if(o.k === 'ritual' && o.st < 2){
      const on = o.st === 1, pul = .5 + .5*Math.sin(T*3);
      ctx.strokeStyle = RITUAL_C; ctx.globalAlpha = on ? .6 + .3*pul : .35; ctx.lineWidth = 3; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.ellipse(o.x, o.y, RITUAL_R, RITUAL_R*.75, T*.2, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      if(on){ ctx.globalAlpha = .1; ctx.fillStyle = RITUAL_C; ell(o.x, o.y, RITUAL_R, RITUAL_R*.75); }
      ctx.globalAlpha = .5; ctx.lineWidth = 2; for(let i = 0; i < 6; i++){ const a = i/6*TAU + T*.2; ctx.beginPath(); ctx.arc(o.x + Math.cos(a)*RITUAL_R*.92, o.y + Math.sin(a)*RITUAL_R*.69, 7, 0, TAU); ctx.stroke(); }
      ctx.globalAlpha = 1;
    } else if(o.k === 'brecha' && o.st === 1){
      ctx.globalAlpha = .13 + .05*Math.sin(T*5); ctx.fillStyle = BREACH_C; ell(o.x, o.y, o.r, o.r*.75);
      ctx.globalAlpha = .7; ctx.strokeStyle = BREACH_C; ctx.lineWidth = 2.5; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.ellipse(o.x, o.y, o.r, o.r*.75, -T*.3, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
  }
}
// Em pé (entram na ordem por y): a fenda da Brecha e o altar do Ritual
function atlasProps(vis, out){
  const R0 = atlRun; if(!R0 || !inAtlas()) return;
  for(const o of R0.objs) if(vis(o)) out.push({y:o.y, draw:o.k === 'brecha' ? () => drawBreach(o) : () => drawAltar(o)});
}
function drawBreach(o){
  if(o.st === 2){ ctx.fillStyle = 'rgba(60,30,90,.5)'; ell(o.x, o.y, 16, 5); return; }
  const k = o.st === 1 ? 1.4 : 1, pul = .5 + .5*Math.sin(T*6);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ell(o.x, o.y + 2, 20*k, 6*k);
  ctx.fillStyle = BREACH_C; ctx.globalAlpha = .25 + .15*pul; circ(o.x, o.y - 28*k, 30*k); ctx.globalAlpha = 1;
  ctx.fillStyle = '#1a0a2a'; ell(o.x, o.y - 28*k, 9*k, 26*k);
  ctx.strokeStyle = '#e0c0ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(o.x, o.y - 28*k, 9*k, 26*k, 0, 0, TAU); ctx.stroke();
  ctx.strokeStyle = BREACH_C; ctx.lineWidth = 1.5;
  for(let i = 0; i < 5; i++){ const a = i/5*TAU + T*1.5, r1 = 12*k, r2 = (22 + 6*pul)*k; line(o.x + Math.cos(a)*r1, o.y - 28*k + Math.sin(a)*r1*1.8, o.x + Math.cos(a)*r2, o.y - 28*k + Math.sin(a)*r2*1.4); }
  if(o.st === 0){ ctx.font = '700 11px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = BREACH_C; ctx.fillText('Brecha', o.x, o.y - 66); }
}
function drawAltar(o){
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ell(o.x, o.y + 2, 22, 7);
  ctx.fillStyle = vgrad(o.y - 30, o.y, '#5a4a48', '#2a2020'); ctx.fillRect(o.x - 14, o.y - 30, 28, 30);
  ctx.fillStyle = '#6a5856'; ctx.fillRect(o.x - 18, o.y - 34, 36, 7);
  ctx.strokeStyle = RITUAL_C; ctx.globalAlpha = .7; ctx.lineWidth = 1.5; line(o.x - 6, o.y - 22, o.x + 6, o.y - 10); line(o.x + 6, o.y - 22, o.x - 6, o.y - 10); ctx.globalAlpha = 1;
  if(o.st < 2){ const f = .8 + .2*Math.sin(T*9 + o.x); ctx.fillStyle = `rgba(255,${90 + 60*f | 0},60,.9)`; ell(o.x, o.y - 42*f, 8, 12*f); ctx.fillStyle = '#ffe0a0'; ell(o.x, o.y - 39, 3.5, 6); }
  if(o.st === 0){ ctx.font = '700 11px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = RITUAL_C; ctx.fillText('Altar de Ritual', o.x, o.y - 62); }
}
// No chão: Pedra de Passagem (obelisco na cor da raridade), Tabuleta (placa) e Fragmento (cristal)
function drawAtlasDrop(d){
  const b = Math.sin(T*2.5 + d.x)*2, y = d.y - 10 + b;
  const c = d.atl === 'way' ? RAR[d.way.rar].c : d.atl === 'tab' ? TABLETS[d.tab.k].c : CITADELS[d.frag].c;
  const g = ctx.createLinearGradient(0, d.y - 90, 0, d.y); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, c + 'aa'); ctx.fillStyle = g; ctx.fillRect(d.x - 5, d.y - 90, 10, 90);
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ell(d.x, d.y + 3, 9, 3.5);
  if(d.atl === 'way'){
    ctx.beginPath(); ctx.moveTo(d.x - 5, y - 11); ctx.lineTo(d.x + 5, y - 11); ctx.lineTo(d.x + 8, y - 5); ctx.lineTo(d.x + 6, y + 9); ctx.lineTo(d.x - 6, y + 9); ctx.lineTo(d.x - 8, y - 5); ctx.closePath();
    ctx.fillStyle = '#20343a'; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.font = '800 9px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#e8fff8'; ctx.fillText(d.way.tier, d.x, y + 4);
  } else if(d.atl === 'tab'){
    ctx.fillStyle = '#2a2430'; rrect(d.x - 8, y - 9, 16, 18, 3); ctx.strokeStyle = c; ctx.lineWidth = 1.6; ctx.strokeRect(d.x - 8, y - 9, 16, 18);
    ctx.strokeStyle = c; ctx.lineWidth = 1.2; line(d.x - 4, y - 4, d.x + 4, y + 4); line(d.x + 4, y - 4, d.x - 4, y + 4);
  } else {
    ctx.beginPath(); ctx.moveTo(d.x, y - 13); ctx.lineTo(d.x + 7, y); ctx.lineTo(d.x, y + 11); ctx.lineTo(d.x - 7, y); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(d.x - 2, y - 7, 2, 8);
  }
  const n = d.atl === 'way' ? wayName(d.way) : d.atl === 'tab' ? TABLETS[d.tab.k].n : CITADELS[d.frag].frag;
  ctx.font = '700 11px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center';
  const tw = ctx.measureText(n).width; ctx.fillStyle = 'rgba(6,8,7,.85)'; ctx.fillRect(d.x - tw/2 - 4, d.y - 38, tw + 8, 15);
  ctx.fillStyle = c; ctx.fillText(n, d.x, d.y - 27);
}
// Pegar do chão (06): Pedras até WAY_CAP, Tabuletas até TAB_CAP; Fragmentos sempre
const atlCanPick = d => d.atl === 'way' ? (S.ways || []).length < WAY_CAP : d.atl === 'tab' ? (S.tabs || []).length < TAB_CAP : true;
function atlasPick(d){
  atl();
  if(d.atl === 'way'){ S.ways.push(d.way); log(`Pegou ${wayName(d.way)} (${RAR[d.way.rar].n})`, WAY_C); }
  else if(d.atl === 'tab'){ S.tabs.push(d.tab); log(`Pegou ${TABLETS[d.tab.k].n}`, TABLETS[d.tab.k].c); }
  else { S.frags[d.frag] = (S.frags[d.frag] || 0) + 1; log(`Pegou ${CITADELS[d.frag].frag}${atlHasFrags() ? ' — os 3 Fragmentos acendem o Monólito Ardente!' : ''}`, CITADELS[d.frag].c); }
  save();
}
// Minimapa (08): criaturas raras, Chefe, Brecha e Ritual
function atlasMinimap(g, k){
  const R0 = atlRun; if(!R0 || !inAtlas()) return;
  const dot = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(x/TILE*k, y/TILE*k, r, 0, TAU); g.fill(); };
  for(const o of R0.objs) if(o.st < 2) dot(o.x, o.y, Math.max(3, k*.8), o.k === 'brecha' ? BREACH_C : RITUAL_C);
  for(const m of mons) if(!m.dead && (m.rare || m.boss) && LV.seen[((m.y/TILE) | 0)*LV_N + ((m.x/TILE) | 0)]) dot(m.x, m.y, Math.max(2.5, k*(m.boss ? .9 : .55)), m.boss ? '#ff9a4a' : '#9fbaff');
}
// Textos da HUD (08)
function atlasHudText(){
  const R0 = atlRun; if(!R0) return '';
  if(R0.done) return `${atlDef.name} concluído! Volte para a vila`;
  const left = atlRaresLeft(), p = [];
  if(R0.rares) p.push(`raras ${R0.rares - left}/${R0.rares}`);
  if(R0.boss) p.push(R0.bossDown ? 'Chefe ✓' : 'Chefe');
  return `${atlDef.name} · ${p.join(' · ')}`;
}
const atlasGoText = () => atlOpenRun() ? `Voltar: ${atlDef.name}` : 'Atlas de Mundos';

/* ---------- PINTURA DO ATLAS (terreno de fundo do painel) ---------- */
// Pintada uma vez por semente num canvas (ART_K px por unidade do Atlas) e virada imagem (atlArt.url) que fica embaixo dos nós no SVG:
// chão de cada região na cor do bioma (fronteiras onduladas, atlBiomeAt), detalhes por bioma (árvores, plantações, montanhas com neve,
// dunas, poças do pântano, lápides, torres, rachaduras de lava...), rios e lagos, sombra nas bordas. A névoa das áreas não exploradas é
// outra imagem pequena (atlFogUrl), refeita só quando muda o que se vê.
const ART_X0 = -1300, ART_Y0 = -1040, ART_W = 2600, ART_H = 2080, ART_K = .7;
const BIOME_ART = {
  campos:{g:'#8a9a42', d:'#5e6e2a'}, floresta:{g:'#33602e', d:'#1e3e1c'}, pantano:{g:'#4e5c36', d:'#2c3820'},
  mina:{g:'#75604a', d:'#4a3a2c'}, catacumbas:{g:'#5c5c62', d:'#38383e'}, picos:{g:'#9aa8b6', d:'#6a7888'},
  deserto:{g:'#b8925e', d:'#8a6a40'}, cidadela:{g:'#4c4060', d:'#2c243a'}, abismo:{g:'#4e1e14', d:'#2a0e08'},
};
let atlArt = null, atlFog = null; // {seed, url} · {key, url}
function atlBiomeAt(x, y){
  const wx = x + Math.sin(y*.012 + 1.3)*42 + Math.sin(y*.031 + x*.004)*15, wy = y + Math.sin(x*.011 + .7)*42 + Math.sin(x*.027)*15;
  let b = 'campos', bd = 1e18; for(const c of ATLAS.cents){ const d = (c.x - wx)*(c.x - wx) + (c.y - wy)*(c.y - wy); if(d < bd){ bd = d; b = c.b; } } return b;
}
const artNoise = (x, y) => Math.sin(x*.013 + 2.1)*Math.sin(y*.011 + .4) + .5*Math.sin(x*.037 + y*.021 + 1.7) + .25*Math.sin(x*.091 - y*.083);
function atlasPaint(){
  const R = atlRand(ATLAS.seed + 7), rp = a => a[Math.floor(R()*a.length)], W = Math.round(ART_W*ART_K), H = Math.round(ART_H*ART_K);
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d', {alpha:false});
  // 1) chão: grade grossa com a cor do bioma + manchas, esticada com suavização (fronteiras macias)
  const CELL = 8, gw = Math.ceil(ART_W/CELL), gh = Math.ceil(ART_H/CELL), lo = document.createElement('canvas'); lo.width = gw; lo.height = gh;
  const lg = lo.getContext('2d'), img = lg.createImageData(gw, gh), bio = new Array(gw*gh);
  for(let j = 0; j < gh; j++) for(let i = 0; i < gw; i++){
    const x = ART_X0 + (i + .5)*CELL, y = ART_Y0 + (j + .5)*CELL, b = atlBiomeAt(x, y), A = BIOME_ART[b], n = artNoise(x, y)*.5 + .5;
    bio[j*gw + i] = b;
    const [r1, g1, b1] = hexRGB(A.g), [r2, g2, b2] = hexRGB(A.d), t = clamp(n*.9, 0, 1), o = (j*gw + i)*4;
    img.data[o] = r2 + (r1 - r2)*t; img.data[o + 1] = g2 + (g1 - g2)*t; img.data[o + 2] = b2 + (b1 - b2)*t; img.data[o + 3] = 255;
  }
  lg.putImageData(img, 0, 0);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(lo, 0, 0, W, H);
  g.setTransform(ART_K, 0, 0, ART_K, -ART_X0*ART_K, -ART_Y0*ART_K); g.lineCap = 'round'; g.lineJoin = 'round';
  const bAt = (x, y) => { const i = clamp(((x - ART_X0)/CELL) | 0, 0, gw - 1), j = clamp(((y - ART_Y0)/CELL) | 0, 0, gh - 1); return bio[j*gw + i]; };
  // 2) água: lagos nas regiões verdes e rios que saem do meio para a borda (nada é desenhado em cima depois)
  const water = [];
  for(let i = 0, tries = 0; i < 7 && tries < 200; tries++){
    const x = ART_X0 + 150 + R()*(ART_W - 300), y = ART_Y0 + 150 + R()*(ART_H - 300), b = bAt(x, y);
    if(b !== 'campos' && b !== 'floresta' && b !== 'pantano' && b !== 'picos') continue;
    if(water.some(w => Math.hypot(w.x - x, w.y - y) < 320)) continue;
    const r = 45 + R()*55, pts = []; for(let k = 0; k < 14; k++){ const a = k/14*TAU, rr = r*(.75 + R()*.4); pts.push([x + Math.cos(a)*rr*1.3, y + Math.sin(a)*rr]); }
    water.push({x, y, r:r*1.35, pts, ice:b === 'picos'}); i++;
  }
  const rivers = [];
  for(let i = 0; i < 3; i++){
    let a = R()*TAU, x = Math.cos(a)*120*1.3, y = Math.sin(a)*120; const pts = [[x, y]];
    for(let s = 0; s < 120 && Math.abs(x) < ART_W/2 && Math.abs(y) < ART_H/2; s++){ a += (R() - .5)*.55 + Math.sin(s*.3 + i)*.08; x += Math.cos(a)*22*1.2; y += Math.sin(a)*22; pts.push([x, y]); }
    rivers.push(pts);
  }
  const nearWater = (x, y, m) => water.some(w => Math.hypot(w.x - x, w.y - y) < w.r + m) || rivers.some(p => p.some(([px, py]) => Math.abs(px - x) < 26 + m && Math.abs(py - y) < 26 + m));
  const path = pts => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for(let k = 1; k < pts.length - 1; k++){ const mx = (pts[k][0] + pts[k + 1][0])/2, my = (pts[k][1] + pts[k + 1][1])/2; g.quadraticCurveTo(pts[k][0], pts[k][1], mx, my); } };
  for(const p of rivers){
    for(const [w, col] of [[26, 'rgba(40,50,30,.35)'], [18, '#2a5878'], [11, '#3f7fa8'], [3, 'rgba(200,235,255,.5)']]){ path(p); g.strokeStyle = col; g.lineWidth = w; g.stroke(); }
  }
  for(const w of water){
    const blob = () => { g.beginPath(); w.pts.forEach(([x, y], k) => k ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
    g.save(); g.translate(w.x, w.y); g.scale(1.12, 1.12); g.translate(-w.x, -w.y); blob(); g.fillStyle = w.ice ? 'rgba(230,240,248,.7)' : 'rgba(60,80,40,.45)'; g.fill(); g.restore(); // margem
    blob(); const gr = g.createRadialGradient(w.x - w.r*.2, w.y - w.r*.2, 4, w.x, w.y, w.r); gr.addColorStop(0, w.ice ? '#cfe6f4' : '#5aa0c8'); gr.addColorStop(1, w.ice ? '#8ab8d4' : '#1f4c6c'); g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1.5; for(let k = 0; k < 3; k++){ const yy = w.y - w.r*.3 + k*w.r*.25; g.beginPath(); g.moveTo(w.x - w.r*.4, yy); g.quadraticCurveTo(w.x - w.r*.2, yy - 4, w.x, yy); g.stroke(); }
  }
  // 3) detalhes por bioma em pontos espalhados (de cima para baixo: o de baixo fica na frente)
  const pts = []; const STEP = 30;
  for(let y = ART_Y0 + 20; y < ART_Y0 + ART_H - 10; y += STEP) for(let x = ART_X0 + 20; x < ART_X0 + ART_W - 10; x += STEP) pts.push([x + (R() - .5)*STEP, y + (R() - .5)*STEP, R()]);
  pts.sort((a, b) => a[1] - b[1]);
  const tri = (x, y, w, h, c1, c2) => { g.fillStyle = c1; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x, y - h); g.lineTo(x, y); g.fill(); g.fillStyle = c2; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + w, y); g.lineTo(x, y); g.fill(); };
  const shadow = (x, y, rx, ry) => { g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(x + rx*.25, y, rx, ry, 0, 0, TAU); g.fill(); };
  const tree = (x, y, s, c) => { shadow(x, y + 2, 9*s, 3.5*s); g.fillStyle = '#3a2614'; g.fillRect(x - 1.2*s, y - 6*s, 2.4*s, 7*s);
    for(const [dx, dy, r, k] of [[-4, -9, 6, -.25], [4, -9, 6, -.15], [0, -14, 7, 0], [-1.5, -16, 3.5, .25]]){ g.fillStyle = shade(c, k); g.beginPath(); g.arc(x + dx*s, y + dy*s, r*s, 0, TAU); g.fill(); } };
  const pine = (x, y, s, c, snow) => { shadow(x, y + 1, 7*s, 2.8*s); g.fillStyle = '#3a2a1a'; g.fillRect(x - 1*s, y - 4*s, 2*s, 5*s); for(let k = 0; k < 3; k++) tri(x, y - 3*s - k*5*s, (7 - k*1.8)*s, 9*s, shade(c, .1), shade(c, -.35)); if(snow){ g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.moveTo(x - 2.5*s, y - 19*s); g.lineTo(x, y - 23*s); g.lineTo(x + 2.5*s, y - 19*s); g.fill(); } };
  for(const [x, y, r] of pts){
    const b = bAt(x, y); if(nearWater(x, y, 8)) { if(b === 'campos' || b === 'floresta' || b === 'pantano'){ if(r < .25){ g.strokeStyle = '#6a8a3a'; g.lineWidth = 1.2; for(let k = -2; k <= 2; k++){ g.beginPath(); g.moveTo(x + k*2, y); g.lineTo(x + k*2.6, y - 8 - (k & 1)*3); g.stroke(); } } } continue; }
    if(b === 'floresta'){ // mata fechada: 2 árvores por ponto
      if(r < .9) tree(x - 7, y - 6, .75 + r*.4, rp(['#2e6a2a', '#3a7a30', '#24521f']));
      (r < .35 ? pine(x + 6, y + 4, .9 + r, '#2e5a2a') : tree(x + 6, y + 5, .8 + r*.5, rp(['#2e6a2a', '#3a7a30', '#24521f'])));
    }
    else if(b === 'campos'){
      if(r < .45){ g.save(); g.translate(x, y); g.rotate((r - .2)*.8); const fc = rp(['#c8b048', '#b4a03c', '#9aa846', '#d0bc5a']); g.fillStyle = fc; g.fillRect(-16, -9, 32, 18); g.strokeStyle = shade(fc, -.25); g.lineWidth = 1; for(let k = -7; k <= 7; k += 3.5){ g.beginPath(); g.moveTo(-16, k); g.lineTo(16, k); g.stroke(); } g.strokeStyle = 'rgba(60,50,20,.5)'; g.strokeRect(-16, -9, 32, 18); g.restore(); }
      else if(r < .55) tree(x, y, .8, '#4a7a30');
      else if(r < .565){ shadow(x, y + 1, 8, 3); g.fillStyle = '#c8b090'; g.fillRect(x - 6, y - 7, 12, 8); g.fillStyle = '#8a3a22'; g.beginPath(); g.moveTo(x - 8, y - 7); g.lineTo(x, y - 13); g.lineTo(x + 8, y - 7); g.fill(); } // casinha
    }
    else if(b === 'pantano'){
      if(r < .3){ g.fillStyle = 'rgba(40,60,50,.75)'; g.beginPath(); g.ellipse(x, y, 14 + r*20, 7 + r*8, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(120,160,90,.35)'; g.beginPath(); g.ellipse(x - 3, y - 2, 6, 2, 0, 0, TAU); g.fill(); }
      else if(r < .55){ shadow(x, y, 6, 2.4); g.strokeStyle = '#3a2a1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 14); g.lineTo(x - 5, y - 19); g.moveTo(x, y - 10); g.lineTo(x + 5, y - 15); g.stroke(); } // árvore morta
      else if(r < .75){ g.strokeStyle = '#7a8a40'; g.lineWidth = 1.2; for(let k = -2; k <= 2; k++){ g.beginPath(); g.moveTo(x + k*2, y); g.lineTo(x + k*2.5, y - 9); g.stroke(); } }
    }
    else if(b === 'picos'){ if(r < .55){ const s = 22 + r*40; tri(x, y, s*.9, s*1.15, '#c8d2dc', '#6a7a8c'); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x - s*.32, y - s*.75); g.lineTo(x, y - s*1.15); g.lineTo(x + s*.3, y - s*.78); g.lineTo(x + s*.1, y - s*.7); g.lineTo(x - s*.08, y - s*.8); g.closePath(); g.fill(); } else if(r < .75) pine(x, y, .8, '#2a4a3a', true); }
    else if(b === 'mina'){ if(r < .4){ const s = 16 + r*28; tri(x, y, s, s*.75, '#8a7258', '#4a3a2a'); } else if(r < .5){ shadow(x, y, 5, 2); g.fillStyle = '#6a6a6a'; g.beginPath(); g.arc(x, y - 3, 4, 0, TAU); g.fill(); } else if(r < .52){ g.fillStyle = '#1a120c'; g.beginPath(); g.arc(x, y, 7, Math.PI, 0); g.fill(); g.strokeStyle = '#6a4a2a'; g.lineWidth = 2; g.strokeRect(x - 8, y - 8, 16, 8); } }
    else if(b === 'deserto'){ if(r < .5){ g.strokeStyle = 'rgba(255,230,180,.45)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, 22, 8, 0, Math.PI*1.1, Math.PI*1.9); g.stroke(); g.strokeStyle = 'rgba(90,60,30,.35)'; g.beginPath(); g.ellipse(x + 2, y + 3, 22, 8, 0, Math.PI*.1, Math.PI*.9); g.stroke(); } else if(r < .56){ shadow(x, y, 6, 2); g.fillStyle = '#8a6a4a'; g.beginPath(); g.arc(x, y - 3, 5, 0, TAU); g.fill(); } else if(r < .6){ g.strokeStyle = '#4a6a2a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 14); g.moveTo(x, y - 8); g.lineTo(x - 5, y - 10); g.lineTo(x - 5, y - 14); g.stroke(); } }
    else if(b === 'catacumbas'){ if(r < .3){ shadow(x, y, 5, 2); g.fillStyle = '#9a9aa0'; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x - 4, y - 8); g.arc(x, y - 8, 4, Math.PI, 0); g.lineTo(x + 4, y); g.fill(); g.fillStyle = '#5a5a60'; g.fillRect(x + 1, y - 10, 3, 10); } else if(r < .4){ g.strokeStyle = '#2a2a2e'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 13); g.lineTo(x - 4, y - 17); g.moveTo(x, y - 9); g.lineTo(x + 4, y - 13); g.stroke(); } else if(r < .46){ g.fillStyle = '#6a6a70'; g.fillRect(x - 12, y - 6, 24, 6); g.fillStyle = '#4a4a50'; g.fillRect(x - 12, y - 9, 6, 3); g.fillRect(x + 4, y - 11, 6, 5); } }
    else if(b === 'cidadela'){ if(r < .2){ shadow(x, y, 9, 3); g.fillStyle = '#2a2236'; g.fillRect(x - 5, y - 20, 10, 20); g.fillStyle = '#4a3e5e'; g.fillRect(x - 5, y - 20, 4, 20); g.fillStyle = '#1a1424'; g.beginPath(); g.moveTo(x - 7, y - 20); g.lineTo(x, y - 30); g.lineTo(x + 7, y - 20); g.fill(); g.fillStyle = 'rgba(200,150,255,.8)'; g.fillRect(x - 1, y - 14, 2, 3); } else if(r < .5){ const s = 12 + r*16; tri(x, y, s, s*.7, '#5a4c70', '#2c2438'); } }
    else if(b === 'abismo'){ if(r < .35){ g.strokeStyle = '#2a0804'; g.lineWidth = 5; const k0 = R()*TAU; g.beginPath(); g.moveTo(x, y); for(let k = 0; k < 4; k++) g.lineTo(x + Math.cos(k0 + k*.7)*k*8, y + Math.sin(k0 + k*.4)*k*5); g.stroke(); g.strokeStyle = '#ff7a20'; g.lineWidth = 1.8; g.stroke(); } else if(r < .45){ const s = 16 + r*20; tri(x, y, s, s*.9, '#5a2a1c', '#2a0e08'); g.fillStyle = '#ff8a2b'; g.beginPath(); g.ellipse(x, y - s*.88, 3, 1.5, 0, 0, TAU); g.fill(); } }
  }
  // 4) luz geral: brilho no meio e sombra nas bordas (como um mapa antigo)
  g.setTransform(1, 0, 0, 1, 0, 0);
  const vg = g.createRadialGradient(W/2, H/2, Math.min(W, H)*.25, W/2, H/2, Math.max(W, H)*.62); vg.addColorStop(0, 'rgba(255,240,200,.06)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return c;
}
// Imagem do terreno: pinta na 1ª vez (síncrono, ~0,1–0,3 s) e guarda como JPEG; enquanto o arquivo não fica pronto, o painel mostra sem fundo
function atlArtUrl(){
  if(atlArt && atlArt.seed === ATLAS.seed) return atlArt.url;
  const c = atlasPaint(); atlArt = {seed:ATLAS.seed, url:''};
  const done = u => { if(atlArt && atlArt.seed === ATLAS.seed){ atlArt.url = u; dirtyPanel(); } };
  if(c.toBlob) c.toBlob(b => done(b ? URL.createObjectURL(b) : c.toDataURL('image/jpeg', .85)), 'image/jpeg', .86); else done(c.toDataURL('image/jpeg', .85));
  return '';
}
// Névoa: escuro em tudo, menos em volta do que se vê (círculos com borda macia); refeita só quando o conjunto visível muda
function atlFogUrl(seen){
  const key = ATLAS.seed + ':' + [...seen].sort((a, b) => a - b).join(',');
  if(atlFog && atlFog.key === key) return atlFog.url;
  const K = .12, c = document.createElement('canvas'); c.width = Math.round(ART_W*K); c.height = Math.round(ART_H*K); const g = c.getContext('2d');
  g.fillStyle = 'rgba(6,8,12,.94)'; g.fillRect(0, 0, c.width, c.height); g.globalCompositeOperation = 'destination-out';
  for(const id of seen){ const n = ATLAS.nodes[id], x = (n.x - ART_X0)*K, y = (n.y - ART_Y0)*K, r = 175*K, gr = g.createRadialGradient(x, y, r*.35, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r*2, r*2); }
  if(atlFog && atlFog.url && atlFog.url.startsWith('blob:')) URL.revokeObjectURL(atlFog.url);
  atlFog = {key, url:c.toDataURL('image/png')};
  return atlFog.url;
}
/* ---------- PAINEL DO ATLAS (aba atlas; a aba Mapas abre ele no nível 40) ---------- */
// Mapa em SVG (arrastar move, roda/botões aproximam) e, ao lado, a ficha do nó tocado com as Pedras para colocar
let atlSel = 0, atlWaySel = 0, atlView = {x:0, y:0, s:1.7}, atlDrag = null, atlDragT = 0, bagWaySel = 0;
const ATL_VB = [-600, -360, 1200, 720];
const atlTf = () => `scale(${atlView.s}) translate(${-atlView.x},${-atlView.y})`;
function atlApply(){ const g = document.getElementById('atlG'); if(g) g.setAttribute('transform', atlTf()); }
function atlZoom(f){ atlView.s = clamp(atlView.s*f, .35, 2.5); atlApply(); }
const wayIcon = t => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h8l3 5-2 13H7L5 8z" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M5 8h14" stroke="currentColor" stroke-width="1" opacity=".55"/><text x="12" y="17.5" text-anchor="middle" font-size="${t >= 10 ? 8 : 9.5}" font-weight="800" fill="currentColor" font-family="Alegreya Sans, sans-serif">${t}</text></svg>`;
const tabIcon = () => `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2" fill="currentColor" fill-opacity=".2" stroke="currentColor" stroke-width="1.6"/><path d="M9 8l6 8M15 8l-6 8M12 5v2M12 17v2" stroke="currentColor" stroke-width="1.3"/></svg>`;
const fragIcon = () => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l6 9-6 11-6-11z" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M6 11h12" stroke="currentColor" stroke-width="1" opacity=".6"/></svg>`;
const wayTile = (w, act, sel) => `<button class="tile r${w.rar}${sel ? ' sel' : ''}" style="--rc:${RAR[w.rar].c}" data-act="${act}" data-v="${w.id}" aria-label="${wayName(w)}, ${RAR[w.rar].n}">${wayIcon(w.tier)}</button>`;
function wayCardHTML(w){
  const q = wayQ(w), k = atlMult(w.tier);
  return `<div class="atl-way"><div class="sn" style="color:${RAR[w.rar].c}">${wayName(w)} · ${RAR[w.rar].n}</div>
    ${w.mods.length ? `<ul class="atl-mods">${w.mods.map(m => `<li>${WAY_MODS[m.k].n(m.v)} <em>+${m.q}% itens</em></li>`).join('')}</ul>` : `<div class="mm">Sem atributos: use orbes para deixar o mapa mais difícil e com mais itens.</div>`}
    <div class="mm">Criaturas com ${fmt(k*100)}% de vida e dano · XP ${fmt(k*100)}%${q ? ` · <b style="color:var(--gold)">itens +${q}%</b> · Pedras +${Math.round(q*1.5)}%` : ''}</div></div>`;
}
function panelAtlas(){
  if(S.lv < MAX_LV) return `<p class="note">O Atlas de Mundos abre no nível ${MAX_LV}.</p>`;
  const A = atl(), seen = atlSeenSet(A), N = ATLAS.nodes, sel = atlNode(atlSel) && seen.has(atlSel) ? atlNode(atlSel) : N[0];
  atlSel = sel.id;
  const st = n => A.done[n.id] && !atlRepeat(n) ? 'done' : atlAvail(A, n) ? 'av' : A.done[n.id] ? 'done' : 'lock';
  let svg = '';
  // terreno pintado (imagem) e névoa por cima do que ainda não se vê
  const art = atlArtUrl(), box = `x="${ART_X0}" y="${ART_Y0}" width="${ART_W}" height="${ART_H}" preserveAspectRatio="none"`;
  if(art) svg += `<image href="${art}" ${box}/>`;
  svg += `<image href="${atlFogUrl(seen)}" ${box}/>`;
  // alcance das Torres concluídas com Tabuletas (e da Torre selecionada)
  for(const t of atlTowersDone(A)) if((A.tow[t.id] || []).length || t === sel) svg += `<circle class="atl-range" cx="${t.x}" cy="${t.y}" r="${ATL_TOWER_R}"/>`;
  // névoa: o que ainda não se vê, perto do que se vê, aparece só como um pontinho apagado
  for(const n of N) if(!seen.has(n.id) && N.some(o => seen.has(o.id) && D(o, n) < ATL_GAP*2.6)) svg += `<circle class="atl-fog" cx="${n.x}" cy="${n.y}" r="5"/>`;
  // ligações como estradas: borda escura + caminho de terra tracejado (dourado entre lugares concluídos)
  let roads = '', tops = '';
  for(const [i, j] of ATLAS.edges) if(seen.has(i) && seen.has(j)){ const a = N[i], b = N[j], xy = `x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"`; roads += `<line class="atl-e" ${xy}/>`; tops += `<line class="atl-r${A.done[i] && A.done[j] ? ' d' : ''}" ${xy}/>`; }
  svg += roads + tops;
  for(const n of N){
    if(!seen.has(n.id)) continue;
    const s = st(n), B = MAPS.find(m => m.id === n.b) || MAPS[0], fail = A.fail[n.id] && !A.done[n.id];
    let shape;
    if(n.t === 'cit') shape = `<path class="b" d="M0-22L19-11V11L0 22-19 11V-11Z" fill="${CITADELS[n.cit].c}" fill-opacity=".45" stroke="${CITADELS[n.cit].c}"/>`;
    else if(n.t === 'mono') shape = `<path class="b" d="M0-24L20 16H-20Z" fill="${MONO.c}" fill-opacity=".45" stroke="${MONO.c}"/>`;
    else if(n.t === 'tower') shape = `<rect class="b" x="-9" y="-22" width="18" height="36" rx="3" fill="${B.ground[1]}"/><path d="M-12-22h24" stroke="#e9e3d1" stroke-width="2"/>`;
    else if(n.t === 'home') shape = `<path class="b" d="M-16 4L0-14 16 4V16H-16Z" fill="#3a4a3e"/>`;
    else shape = `<circle class="b" r="${n.t === 'boss' ? 16 : 13}" fill="${B.ground[1]}"/>${n.t === 'boss' ? `<path d="M-7-4l3 4 4-6 4 6 3-4v8h-14z" fill="#ffb070"/>` : ''}`;
    let deco = '';
    if(n.cor) deco += `<circle r="21" fill="none" stroke="#ff3a3a" stroke-width="2" stroke-dasharray="4 4"/>`;
    if(n.c && !A.done[n.id]) deco += `<circle cx="13" cy="-13" r="5" fill="${n.c === 'brecha' ? BREACH_C : RITUAL_C}" stroke="#000" stroke-width="1"/>`;
    if(A.done[n.id] && n.t !== 'home') deco += `<path d="M-6 0l4 4 8-9" fill="none" stroke="#f5cf3a" stroke-width="3" stroke-linecap="round"/>`;
    if(fail) deco += `<path d="M-6-6l12 12M6-6l-12 12" stroke="#ff5a4a" stroke-width="3" stroke-linecap="round"/>`;
    if(A.cur === n.id) deco += `<circle r="26" fill="none" stroke="${WAY_C}" stroke-width="3"/>`;
    if(n === sel) deco += `<circle r="29" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 4"/>`;
    const label = n === sel || s === 'av' || n.t === 'cit' || n.t === 'mono' || n.t === 'tower' ? `<text y="${n.t === 'cit' || n.t === 'mono' ? 38 : 32}">${n.name}</text>` : '';
    svg += `<g class="atl-n ${s}${fail ? ' fail' : ''}" transform="translate(${n.x},${n.y})" data-act="atNode" data-v="${n.id}">${shape}${deco}${label}</g>`;
  }
  const nDone = Object.keys(A.done).length - 1, fr = Object.keys(CITADELS).map(k => `<span style="color:${CITADELS[k].c}">${fragIcon()}${S.frags[k] || 0}</span>`).join('');
  return `<div class="atlas"><div class="atl-map">
      <svg id="atlSvg" viewBox="${ATL_VB.join(' ')}" preserveAspectRatio="xMidYMid meet"><g id="atlG" transform="${atlTf()}">${svg}</g></svg>
      <div class="atl-top"><span>Concluídos <b>${nDone}</b></span><span>Maior Pedra <b>${A.top || '—'}</b></span><span class="atl-fr">${fr}</span>${A.arb ? `<span>Árbitro <b>${A.arb}×</b></span>` : ''}</div>
      <div class="atl-zoom"><button data-act="atZoom" data-v="1" aria-label="Aproximar">+</button><button data-act="atZoom" data-v="-1" aria-label="Afastar">−</button><button data-act="atCenter" aria-label="Centralizar no nó escolhido">◎</button></div>
    </div><div class="atl-side">${atlSideHTML(A, sel)}</div></div>`;
}
function atlSideHTML(A, n){
  const B = MAPS.find(m => m.id === n.b) || MAPS[0], town = inTown(), run = atlOpenRun();
  const status = A.done[n.id] && !atlRepeat(n) ? '<span class="chip">Concluído</span>' : A.cur === n.id ? '<span class="chip" style="color:' + WAY_C + '">Aberto</span>' : atlAvail(A, n) ? '<span class="chip" style="color:var(--fg)">Disponível</span>' : '<span class="chip bad">Bloqueado</span>';
  const tags = [];
  if(n.t !== 'home' && n.t !== 'map') tags.push(`<span class="chip" style="color:#ffb070">${ATL_TYPE[n.t]}</span>`);
  if(n.c === 'brecha') tags.push(`<span class="chip" style="color:${BREACH_C}">Brecha</span>`);
  if(n.c === 'ritual') tags.push(`<span class="chip" style="color:${RITUAL_C}">Ritual</span>`);
  if(n.cor) tags.push(`<span class="chip bad">Corrompido</span>`);
  if(A.fail[n.id] && !A.done[n.id]) tags.push(`<span class="chip bad">Falhou</span>`);
  let h = `<div class="atl-card"><h3>${n.name}</h3><div class="mm">${ATL_TYPE[n.t]}${n.t !== 'home' ? ' · ' + B.name : ''} ${status}</div>${tags.length ? `<div class="atl-tags">${tags.join('')}</div>` : ''}`;
  if(n.t === 'home'){ h += `<p class="note">Seu Esconderijo: o Atlas começa aqui. Toque num mapa ligado a ele (com contorno claro), escolha uma Pedra de Passagem e abra o mapa.</p></div>`; return h + (run ? atlRunHTML(run) : '') + atlHelpHTML(); }
  const els = [...new Set(B.mons.map(k => MONS[k].el))];
  h += `<div class="mm">Dano: ${els.map(e => `<b style="color:${ELEM[e].c}">${ELEM[e].n}</b> (${ST.res[e]}%)`).join(' · ')}</div>`;
  const goal = n.t === 'cit' ? `derrote o ${CITADELS[n.cit].bn} (deixa o ${CITADELS[n.cit].frag})` : n.t === 'mono' ? `derrote o ${MONO.bn}` : `mate as criaturas raras${n.t !== 'map' ? ' e o Chefe' : ''}`;
  h += `<div class="mm">Missão: <b style="color:var(--fg)">${goal}</b>.${n.t === 'tower' ? ' Concluída, a Torre revela a região e recebe Tabuletas.' : ''}${n.cor ? ' Corrompido: criaturas 30% mais fortes, +50% de itens, +20% de XP.' : ''}</div>`;
  const tabs = n.t !== 'tower' && !A.done[n.id] ? atlTabsAt(A, n) : [];
  if(tabs.length) h += `<div class="mm">Tabuletas das Torres: ${tabs.map(t => `<b style="color:${TABLETS[t.k].c}">${TABLETS[t.k].n}</b>`).join(', ')}</div>`;
  h += `</div>`;
  if(run) return h + atlRunHTML(run) + atlHelpHTML();
  if(n.t === 'tower' && A.done[n.id]) return h + atlTowerHTML(A, n) + atlHelpHTML();
  if(A.done[n.id] && !atlRepeat(n)) return h + `<p class="note">Mapa concluído. Os mapas ligados a ele estão liberados.</p>` + atlHelpHTML();
  if(!atlAvail(A, n)) return h + `<p class="note">Conclua um mapa ligado a este para liberar.</p>` + atlHelpHTML();
  if(n.t === 'mono'){
    const ok = atlHasFrags();
    return h + `<div class="sec"><h3>Fragmentos</h3><div class="atl-fr big-fr">${Object.keys(CITADELS).map(k => `<span style="color:${CITADELS[k].c}">${fragIcon()}${CITADELS[k].frag}: <b>${S.frags[k] || 0}</b></span>`).join('')}</div>
      <p class="note">Cada Cidadela deixa um Fragmento. Com os 3, o Monólito se acende: Pedra ${MONO.tier}, o ${MONO.bn} chama criaturas de fogo. Recompensa: 2 Lendários, orbes e uma Pedra ${ATL_TMAX} Rara.</p></div>
      <button class="btn primary full" data-act="atOpen" data-v="${n.id}" ${ok && town ? '' : 'disabled'}>Acender o Monólito<small>${!ok ? 'Faltam Fragmentos' : town ? 'Gasta os 3 Fragmentos' : 'Só pela vila'}</small></button>` + atlHelpHTML();
  }
  const ws = (S.ways || []).slice().sort((a, b) => b.tier - a.tier || b.rar - a.rar);
  if(!ws.some(w => w.id === atlWaySel)) atlWaySel = ws.length ? ws[0].id : 0;
  const w = ws.find(x => x.id === atlWaySel);
  h += `<div class="sec"><h3>Pedras de Passagem <span class="r">${ws.length}</span></h3>${ws.length ? `<div class="atl-ways">${ws.map(x => wayTile(x, 'atWay', x === w)).join('')}</div>${wayCardHTML(w)}` : `<p class="note">Você não tem Pedras de Passagem. Elas caem das criaturas e de todo mapa concluído do Atlas.</p>`}</div>`;
  h += `<button class="btn primary full" data-act="atOpen" data-v="${n.id}" ${w && town ? '' : 'disabled'}>Colocar a Pedra e abrir o mapa<small>${!w ? 'Sem Pedra' : town ? `Gasta a ${wayName(w)} · ${ATL_PORTALS} portais · morrer fecha o mapa` : 'Só pela vila (Dispositivo no portal)'}</small></button>`;
  return h + atlHelpHTML();
}
function atlRunHTML(run){
  return `<div class="sec"><h3>Mapa aberto</h3><p class="note"><b style="color:${WAY_C}">${atlDef.name}</b> (Pedra ${run.tier}) · ${run.portals} ${run.portals === 1 ? 'portal' : 'portais'} · ${run.done ? 'concluído' : 'em andamento'}. Feche ou conclua este mapa antes de abrir outro.</p>
    ${inTown() ? `<button class="btn primary full" data-act="go">Voltar para o mapa</button>` : ''}</div>`;
}
function atlTowerHTML(A, n){
  const put = A.tow[n.id] || [], town = inTown();
  const slots = []; for(let i = 0; i < ATL_TAB_SLOTS; i++){ const t = put[i]; slots.push(t ? `<div class="atl-tab"><span class="ico" style="color:${TABLETS[t.k].c}">${tabIcon()}</span><div><b style="color:${TABLETS[t.k].c}">${TABLETS[t.k].n}</b><div class="mm">${TABLETS[t.k].d} · ${t.uses} usos</div></div></div>` : `<div class="atl-tab empty"><span class="ico">${tabIcon()}</span><div class="mm">Espaço vazio</div></div>`); }
  const free = put.length < ATL_TAB_SLOTS;
  const list = (S.tabs || []).map(t => `<div class="atl-tab"><span class="ico" style="color:${TABLETS[t.k].c}">${tabIcon()}</span><div><b style="color:${TABLETS[t.k].c}">${TABLETS[t.k].n}</b><div class="mm">${TABLETS[t.k].d} · ${t.uses} usos</div></div><button class="btn" data-act="tabPut" data-v="${n.id}:${t.id}" ${free && town ? '' : 'disabled'}>Colocar</button></div>`).join('');
  return `<div class="sec"><h3>Tabuletas da Torre <span class="r">${put.length}/${ATL_TAB_SLOTS}</span></h3>${slots.join('')}
    <p class="note">Valem para os mapas dentro do círculo da Torre (ainda não concluídos). Cada mapa concluído no alcance gasta 1 uso de cada uma. Uma Tabuleta colocada não sai mais.${town ? '' : ' Só dá para colocar na vila.'}</p></div>
    <div class="sec"><h3>Suas Tabuletas <span class="r">${(S.tabs || []).length}/${TAB_CAP}</span></h3>${list || '<p class="note">Nenhuma. Caem das criaturas do Atlas e do Guardião de cada Torre.</p>'}</div>`;
}
const atlHelpHTML = () => `<details class="sec atl-help"><summary>Como funciona o Atlas</summary><p class="note">No nível ${MAX_LV} os ${MAPS.length} mapas viram o <b>Atlas de Mundos</b>. Cada nó é um mapa: coloque uma <b>Pedra de Passagem</b> (tier 1–${ATL_TMAX}) para abrir. Pedra tier N = criaturas com ${Math.round((ATL_STEP - 1)*100)}% a mais de vida e dano a cada tier. Missão: matar as <b>criaturas raras</b> (azul no minimapa) e, nos mapas com coroa, o <b>Chefe</b> (laranja). Concluído, os mapas ligados a ele liberam e cai uma Pedra de Passagem. Você tem ${ATL_PORTALS} portais: pode voltar para a vila e entrar de novo, mas <b>morrer fecha o mapa</b> e a Pedra se perde.</p>
  <p class="note">Os orbes servem nas Pedras como nos itens: cada raridade dá 1 atributo que deixa o mapa mais difícil e dá mais itens e Pedras. <b>Torres</b> revelam a região e recebem até ${ATL_TAB_SLOTS} <b>Tabuletas</b> (Brecha, Ritual, Fortuna...). Bolinha roxa = <b>Brecha</b> (toque nela: criaturas saem por ${BREACH_T} s e no fim cai um tesouro); vermelha = <b>Ritual</b> (pise no altar e vença ${RITUAL_WAVES} ondas). Contorno vermelho = <b>corrompido</b>. Longe, três <b>Cidadelas</b> escondidas (uma Torre perto revela) deixam Fragmentos; com os 3, acenda o <b>Monólito Ardente</b> e enfrente o ${MONO.bn}.</p></details>`;
// Aba Atlas da mochila (nível 40): Pedras de Passagem (orbes nelas, fundir 3 em 1), Tabuletas e Fragmentos
function bagAtlasHTML(){
  atl();
  const ws = S.ways.slice().sort((a, b) => b.tier - a.tier || b.rar - a.rar), town = inTown();
  if(!ws.some(w => w.id === bagWaySel)) bagWaySel = ws.length ? ws[0].id : 0;
  const w = ws.find(x => x.id === bagWaySel);
  let h = `<div class="sec"><h3>Pedras de Passagem <span class="r">${ws.length}/${WAY_CAP}</span></h3>`;
  if(!ws.length) h += `<p class="note">Nenhuma. Caem das criaturas do Atlas e de todo mapa concluído.</p></div>`;
  else {
    h += `<div class="inv-grid">${ws.map(x => `<div class="slot">${wayTile(x, 'bagWay', x === w)}</div>`).join('')}</div>${wayCardHTML(w)}`;
    const orbs = Object.keys(ORBS).filter(k => ORBS[k].ok(w));
    h += `<div class="bulk">${orbs.map(k => `<button class="btn" data-act="wayOrb" data-v="${k}:${w.id}" ${S.orbs[k] > 0 ? '' : 'disabled'} style="color:${ORBS[k].c}">${ORBS[k].n}<small>você tem ${S.orbs[k] || 0}</small></button>`).join('')}
      <button class="btn" data-act="wayDrop" data-v="${w.id}">Jogar fora<small>${wayName(w)}</small></button></div>`;
    const tiers = [...new Set(ws.map(x => x.tier))].filter(t => t < ATL_TMAX && ws.filter(x => x.tier === t).length >= 3);
    h += `<p class="legend">Toque numa Pedra para ver. Orbes de melhoria somam atributos (mais difícil, mais itens); a Anulação tira um.</p>`;
    if(tiers.length) h += `<div class="bulk">${tiers.map(t => `<button class="btn" data-act="wayFuse" data-v="${t}" ${town ? '' : 'disabled'}>Fundir 3 Pedras ${t}<small>viram 1 Pedra ${t + 1}${town ? '' : ' · só na vila'}</small></button>`).join('')}</div>`;
    h += `</div>`;
  }
  h += `<div class="sec"><h3>Tabuletas <span class="r">${S.tabs.length}/${TAB_CAP}</span></h3>${S.tabs.length ? S.tabs.map(t => `<div class="atl-tab"><span class="ico" style="color:${TABLETS[t.k].c}">${tabIcon()}</span><div><b style="color:${TABLETS[t.k].c}">${TABLETS[t.k].n}</b><div class="mm">${TABLETS[t.k].d} · ${t.uses} usos</div></div></div>`).join('') : ''}<p class="legend">Coloque numa Torre concluída, no Atlas (aba Mapas).</p></div>`;
  h += `<div class="sec"><h3>Fragmentos</h3><div class="atl-fr big-fr">${Object.keys(CITADELS).map(k => `<span style="color:${CITADELS[k].c}">${fragIcon()}${CITADELS[k].frag}: <b>${S.frags[k] || 0}</b></span>`).join('')}</div></div>`;
  return h;
}

/* ---------- AÇÕES E ARRASTAR O MAPA ---------- */
Object.assign(ACT, {
  atNode: v => { if(performance.now() - atlDragT < 250) return; atlSel = +v; dirtyPanel(); },
  atWay: v => { atlWaySel = +v; dirtyPanel(); },
  atOpen: v => atlasOpen(+v),
  atZoom: v => atlZoom(+v > 0 ? 1.25 : .8),
  atCenter: () => { const n = atlNode(atlSel) || {x:0, y:0}; atlView.x = n.x; atlView.y = n.y; atlApply(); },
  bagWay: v => { bagWaySel = +v; dirtyPanel(); },
  wayOrb: v => {
    const [k, id] = v.split(':'), w = (S.ways || []).find(x => x.id === +id); if(!w) return;
    const from = RAR[w.rar].n; if(!wayOrb(w, k)) return;
    log(`${ORBS[k].n}: ${wayName(w)} ${from} → ${RAR[w.rar].n}`, ORBS[k].rm ? ORBS[k].c : RAR[w.rar].c); save(); dirtyPanel();
  },
  wayDrop: v => { const w = (S.ways || []).find(x => x.id === +v); if(!w) return; S.ways = S.ways.filter(x => x !== w); log(`Jogou fora a ${wayName(w)}`, '#8e998f'); save(); dirtyPanel(); },
  // 3 Pedras do mesmo tier (as de menor raridade primeiro) viram 1 do tier de cima, Comum
  wayFuse: v => {
    const t = +v; if(!inTown() || t >= ATL_TMAX) return;
    const same = S.ways.filter(w => w.tier === t).sort((a, b) => a.rar - b.rar).slice(0, 3); if(same.length < 3) return;
    S.ways = S.ways.filter(w => !same.includes(w)); const nw = makeWay(t + 1, 0); S.ways.push(nw); bagWaySel = nw.id;
    log(`3 Pedras de Passagem ${t} viraram 1 Pedra ${t + 1}`, WAY_C); save(); dirtyPanel();
  },
  tabPut: v => {
    const [nid, tid] = v.split(':').map(Number), A = atl(), n = atlNode(nid), tb = S.tabs.find(t => t.id === tid);
    if(!inTown() || !n || n.t !== 'tower' || !A.done[nid] || !tb) return;
    const put = A.tow[nid] || (A.tow[nid] = []); if(put.length >= ATL_TAB_SLOTS) return;
    put.push(tb); S.tabs = S.tabs.filter(t => t !== tb);
    log(`${TABLETS[tb.k].n} colocada na ${n.name}`, TABLETS[tb.k].c); save(); dirtyPanel();
  },
});
// Arrastar o Atlas com o dedo/mouse (sem redesenhar o painel: só muda o transform do grupo #atlG)
const atlK = sv => { const r = sv.getBoundingClientRect(); return Math.max(ATL_VB[2]/Math.max(1, r.width), ATL_VB[3]/Math.max(1, r.height)); };
document.addEventListener('pointerdown', e => { const sv = e.target.closest && e.target.closest('#atlSvg'); if(!sv) return; atlDrag = {pid:e.pointerId, x:e.clientX, y:e.clientY, vx:atlView.x, vy:atlView.y, moved:false, k:atlK(sv)}; });
document.addEventListener('pointermove', e => {
  if(!atlDrag || e.pointerId !== atlDrag.pid) return;
  const dx = e.clientX - atlDrag.x, dy = e.clientY - atlDrag.y;
  if(Math.hypot(dx, dy) > 6) atlDrag.moved = true;
  if(atlDrag.moved){ atlView.x = atlDrag.vx - dx*atlDrag.k/atlView.s; atlView.y = atlDrag.vy - dy*atlDrag.k/atlView.s; atlApply(); }
});
const atlDragEnd = e => { if(atlDrag && e.pointerId === atlDrag.pid){ if(atlDrag.moved) atlDragT = performance.now(); atlDrag = null; } };
document.addEventListener('pointerup', atlDragEnd);
document.addEventListener('pointercancel', atlDragEnd);
document.addEventListener('wheel', e => { if(!e.target.closest || !e.target.closest('#atlSvg')) return; e.preventDefault(); atlZoom(e.deltaY < 0 ? 1.15 : 1/1.15); }, {passive:false});
