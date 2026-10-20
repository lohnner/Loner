// Base: atalhos ($, rnd, clamp, fmt...), constantes, dados do jogo (mapas, monstros, habilidades, itens) e o estado salvo S.
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

const $ = s => document.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const D = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const pick = a => a[Math.floor(Math.random() * a.length)];
const fmt = n => Math.round(n).toLocaleString('pt-BR');
const n1 = n => (Math.round(n * 10) / 10).toLocaleString('pt-BR');
const pc = n => Math.round(n * 100) + '%';
const TAU = Math.PI * 2;
const W_MAP = 1800, INV_MAX = 10, RANGE = 230, MAX_LV = 40, MELEE = 46;

/* ---------- DADOS ---------- */
// Raridades: cada uma tem um número fixo de atributos (AFF_N). O Lendário ainda ganha +habilidade da classe.
const RAR = [{n:'Comum',c:'#e6e2d8'},{n:'Incomum',c:'#5fd35f'},{n:'Raro',c:'#4f8dff'},{n:'Épico',c:'#b36bff'},{n:'Lendário',c:'#f5cf3a'}];
const AFF_N = [0, 1, 2, 3, 4];
const LEG_R = RAR.length - 1;
// Saves de antes das 5 raridades (ver < 3): Lendário 3 → 4; Mágico/Raro viram a raridade do número de atributos
function migrateItem(it){
  if(!it || typeof it.rar !== 'number') return;
  if(it.rar === 3){ it.rar = LEG_R; return; }
  if(it.rar > 0) it.rar = clamp(it.affix.filter(a => a.k !== 'skill').length, 1, 3);
}
const MAPS = [
  {id:'campos',name:'Campos de Trigo',lv:[1,5],req:1,seed:11,ground:['#3d4a27','#4b5a2e','#2f3b1e'],decor:'field',tuft:'#6c8a38',mons:['rato','espantalho','zumbi'],desc:'Plantação abandonada perto da vila. Bom lugar para a primeira caçada.'},
  {id:'floresta',name:'Floresta Sombria',lv:[5,11],req:4,seed:23,ground:['#1e3022','#273d2b','#152218'],decor:'forest',tuft:'#3f6a3a',mons:['lobo','aranha','ent'],desc:'Lobos em bando e aranhas que cospem teia de longe.'},
  {id:'pantano',name:'Pântano Pútrido',lv:[12,16],req:11,seed:37,ground:['#2a3322','#35402a','#1d2418'],decor:'swamp',tuft:'#6b7a3a',mons:['sapo','sanguessuga','bruxa'],desc:'Sanguessugas roubam vida a cada mordida. Bruxas atacam de longe.'},
  {id:'mina',name:'Mina Abandonada',lv:[16,20],req:15,seed:43,ground:['#2e2620','#3a3028','#221c17'],decor:'mine',tuft:'#4a3e30',mons:['goblin','aranhacav','golem'],desc:'Túneis escuros onde goblins mineradores cavam. Golens de pedra aguentam muito dano.'},
  {id:'catacumbas',name:'Catacumbas',lv:[20,24],req:19,seed:41,ground:['#2a292d','#343338','#1f1e22'],decor:'crypt',tuft:'#4a4850',mons:['esqueleto','ossudo','carnical'],desc:'Corredores de pedra cheios de mortos-vivos e arqueiros de osso.'},
  {id:'picos',name:'Picos Gélidos',lv:[24,28],req:23,seed:61,ground:['#a9b6c2','#c3ced8','#8e9caa'],decor:'ice',tuft:'#d8e4ee',mons:['lobogelo','yeti','espirito'],desc:'Neve e vento cortante. Espíritos de gelo atacam de longe e yetis batem forte.'},
  {id:'deserto',name:'Deserto de Cinzas',lv:[28,32],req:27,seed:67,ground:['#5a4a38','#6b5842','#47392a'],decor:'desert',tuft:'#8a7452',mons:['escorpiao','mumia','cultista'],desc:'Dunas cinzentas e ruínas. Cultistas lançam magias de longe, escorpiões são rápidos.'},
  {id:'cidadela',name:'Cidadela Profana',lv:[32,36],req:31,seed:71,ground:['#2a2233','#352b40','#1e1826'],decor:'citadel',tuft:'#4a3e58',mons:['cavaleiro','gargula','feiticeiro'],desc:'Fortaleza tomada pelas trevas. Cavaleiros negros resistem a tudo e gárgulas voam rápido.'},
  {id:'abismo',name:'Abismo Ardente',lv:[36,40],req:35,seed:53,ground:['#2c1611','#391c14','#200f0b'],decor:'hell',tuft:'#5a2a18',mons:['diabrete','brutamonte','cao'],desc:'Fendas de lava e demônios. Os melhores itens caem aqui.'},
];
const MONS = {
  rato:{n:'Rato Gigante',kind:'quad',c1:'#6e5238',c2:'#a07e62',r:10,hp:.7,dmg:.7,spd:95,range:20,acd:1.0,tail:1},
  espantalho:{n:'Espantalho Maldito',kind:'biped',c1:'#8a6d33',c2:'#d8c27a',r:13,hp:1,dmg:1,spd:60,range:24,acd:1.3,eye:'#ff7a2a'},
  zumbi:{n:'Zumbi',kind:'biped',c1:'#56634a',c2:'#8fa07a',r:13,hp:1.3,dmg:1.1,spd:45,range:24,acd:1.5},
  lobo:{n:'Lobo Sombrio',kind:'quad',c1:'#3a3e46',c2:'#6b707a',r:12,hp:.8,dmg:.9,spd:130,range:22,acd:.9,tail:1,eye:'#ffe14a'},
  aranha:{n:'Aranha Tecelã',kind:'spider',c1:'#36283b',c2:'#7c5a86',r:12,hp:.8,dmg:.8,spd:70,range:170,acd:1.8,ranged:'#e2dcf0',eye:'#ff4a6a'},
  ent:{n:'Ent Podre',kind:'biped',c1:'#4a3a24',c2:'#6d8a3a',r:18,hp:2.2,dmg:1.4,spd:38,range:28,acd:1.8,eye:'#c8ff5a'},
  sapo:{n:'Sapo Bolha',kind:'blob',c1:'#557426',c2:'#b7d36a',r:13,hp:1,dmg:1,spd:70,range:24,acd:1.2},
  sanguessuga:{n:'Sanguessuga',kind:'blob',c1:'#4a2a2c',c2:'#8a4a48',r:10,hp:.7,dmg:.8,spd:85,range:20,acd:.9,leech:1,eye:'#ff5a4a'},
  bruxa:{n:'Bruxa do Brejo',kind:'biped',c1:'#3a2e46',c2:'#a3c27a',r:13,hp:.9,dmg:1.2,spd:55,range:190,acd:2.0,ranged:'#b7f06a',eye:'#e0ff6a'},
  esqueleto:{n:'Esqueleto',kind:'biped',c1:'#bfb8a4',c2:'#ece6d4',r:13,hp:1,dmg:1,spd:65,range:24,acd:1.2,eye:'#6ab4ff'},
  ossudo:{n:'Arqueiro Ossudo',kind:'biped',c1:'#a8a08a',c2:'#e0d9c4',r:12,hp:.8,dmg:1.1,spd:55,range:210,acd:1.7,ranged:'#e0d9c4',eye:'#6ab4ff'},
  carnical:{n:'Carniçal',kind:'quad',c1:'#5a4650',c2:'#9a7c86',r:14,hp:1.5,dmg:1.3,spd:90,range:24,acd:1.1,eye:'#ff4a4a'},
  diabrete:{n:'Diabrete',kind:'biped',c1:'#9a3520',c2:'#e07040',r:10,hp:.7,dmg:1,spd:110,range:180,acd:1.5,ranged:'#ff9a3a',eye:'#ffe24a'},
  brutamonte:{n:'Brutamonte Infernal',kind:'biped',c1:'#561d16',c2:'#b5462c',r:20,hp:2.6,dmg:1.6,spd:42,range:30,acd:2.0,eye:'#ffcc33'},
  cao:{n:'Cão Infernal',kind:'quad',c1:'#38130f',c2:'#d0502a',r:13,hp:1,dmg:1.1,spd:140,range:22,acd:.9,tail:1,eye:'#ffcc33'},
  // Mina Abandonada
  goblin:{n:'Goblin Minerador',kind:'biped',c1:'#4f6b3a',c2:'#8fa860',r:10,hp:.75,dmg:.9,spd:105,range:20,acd:.9,eye:'#ffe14a'},
  aranhacav:{n:'Aranha das Cavernas',kind:'spider',c1:'#3a2f28',c2:'#8a6a4a',r:13,hp:1,dmg:1,spd:90,range:22,acd:1.1,eye:'#ff9a3a'},
  golem:{n:'Golem de Pedra',kind:'biped',c1:'#5e5a54',c2:'#8c877e',r:19,hp:2.6,dmg:1.5,spd:36,range:30,acd:2.1,eye:'#7fd8ff'},
  // Picos Gélidos
  lobogelo:{n:'Lobo do Gelo',kind:'quad',c1:'#a8bccb',c2:'#e8f1f7',r:12,hp:.9,dmg:1,spd:135,range:22,acd:.9,tail:1,eye:'#5ab8ff'},
  yeti:{n:'Yeti',kind:'biped',c1:'#d6dde3',c2:'#f5f8fa',r:19,hp:2.4,dmg:1.6,spd:48,range:30,acd:1.9,eye:'#3a6ad8'},
  espirito:{n:'Espírito Gélido',kind:'blob',c1:'#6aa8d8',c2:'#cfeaff',r:11,hp:.8,dmg:1.15,spd:70,range:190,acd:1.8,ranged:'#bfe6ff',eye:'#ffffff'},
  // Deserto de Cinzas
  escorpiao:{n:'Escorpião Gigante',kind:'spider',c1:'#6a4a24',c2:'#c49a52',r:13,hp:1.1,dmg:1.15,spd:115,range:24,acd:1,eye:'#ff4a2a'},
  mumia:{n:'Múmia',kind:'biped',c1:'#a8987a',c2:'#d8cba8',r:14,hp:1.7,dmg:1.25,spd:42,range:26,acd:1.5,eye:'#7cff9a'},
  cultista:{n:'Cultista das Cinzas',kind:'biped',c1:'#4a2a20',c2:'#a0603a',r:12,hp:.85,dmg:1.25,spd:58,range:200,acd:1.9,ranged:'#ffb050',eye:'#ffd24a'},
  // Cidadela Profana
  cavaleiro:{n:'Cavaleiro Negro',kind:'biped',c1:'#2a2833',c2:'#5a5868',r:16,hp:2.3,dmg:1.5,spd:52,range:28,acd:1.6,eye:'#d24aff'},
  gargula:{n:'Gárgula',kind:'quad',c1:'#4a4652',c2:'#7a7684',r:13,hp:1.1,dmg:1.15,spd:145,range:22,acd:.95,tail:1,eye:'#ff5a5a'},
  feiticeiro:{n:'Feiticeiro Sombrio',kind:'biped',c1:'#2a1f3a',c2:'#7a5aa8',r:12,hp:.9,dmg:1.35,spd:55,range:210,acd:1.9,ranged:'#c08aff',eye:'#e0b0ff'},
};
// Tipos de dano das criaturas. Físico é reduzido pela armadura; os outros pela resistência (st.res, máximo RES_MAX) e só pela metade da armadura.
const ELEM = {
  phys:{n:'Físico', c:'#ff6a5a'},
  fire:{n:'Fogo', c:'#ff8a2b'},
  cold:{n:'Gelo', c:'#8fd8ff'},
  light:{n:'Elétrico', c:'#f4e66a'},
  chaos:{n:'Caos', c:'#c08aff'},
  poison:{n:'Veneno', c:'#9bd84a'},
  necro:{n:'Necrótico', c:'#7fe0b0'},
  psy:{n:'Psíquico', c:'#ff7ae0'},
};
const RES_MAX = 75, RES_KEYS = ['fire','cold','light','chaos','poison','necro','psy'];
// Criaturas que causam dano não físico (as outras batem físico)
const MON_EL = {aranha:'poison', sapo:'poison', bruxa:'chaos', aranhacav:'poison', golem:'light', carnical:'necro', ossudo:'necro',
  lobogelo:'cold', yeti:'cold', espirito:'cold', escorpiao:'poison', mumia:'necro', cultista:'fire',
  cavaleiro:'chaos', gargula:'light', feiticeiro:'psy', diabrete:'fire', brutamonte:'fire', cao:'fire'};
for(const k in MON_EL) MONS[k].el = MON_EL[k];
MONS.aranha.ranged = '#b8e070'; MONS.bruxa.ranged = '#c890ff'; MONS.ossudo.ranged = '#9af0c8'; MONS.feiticeiro.ranged = '#ff8ae8';
// Ataques em área: a criatura marca o chão onde o herói está e, depois de AOE_T (1 s), causa m × o dano dela em quem estiver dentro (raio r).
// cd = recarga; o ataque normal continua. Elites marcam uma área 20% maior. Os Campos de Trigo (mapa inicial) não têm.
const AOE_T = 1;
const MON_AOE = {
  // à distância
  bruxa:{n:'Poça Maldita', r:55, m:1.5, cd:6},
  ossudo:{n:'Chuva de Ossos', r:60, m:1.5, cd:7},
  cultista:{n:'Coluna de Fogo', r:55, m:1.6, cd:6},
  feiticeiro:{n:'Colapso Mental', r:65, m:1.7, cd:6},
  // corpo a corpo
  lobo:{n:'Bote', r:50, m:1.3, cd:8},
  ent:{n:'Raízes', r:60, m:1.6, cd:7},
  sapo:{n:'Salto Pesado', r:55, m:1.4, cd:8},
  sanguessuga:{n:'Dreno', r:45, m:1.3, cd:8},
  goblin:{n:'Dinamite', r:55, m:1.5, cd:8},
  aranhacav:{n:'Ninho de Teia', r:55, m:1.4, cd:8},
  golem:{n:'Tremor', r:75, m:2, cd:8},
  esqueleto:{n:'Golpe de Osso', r:50, m:1.4, cd:7},
  carnical:{n:'Salto Voraz', r:55, m:1.5, cd:7},
  lobogelo:{n:'Rajada Gélida', r:55, m:1.4, cd:8},
  yeti:{n:'Bloco de Gelo', r:65, m:1.9, cd:7},
  escorpiao:{n:'Ferroada', r:50, m:1.5, cd:7},
  mumia:{n:'Praga Antiga', r:60, m:1.6, cd:7},
  cavaleiro:{n:'Golpe Sombrio', r:65, m:1.8, cd:7},
  gargula:{n:'Mergulho', r:55, m:1.5, cd:7},
  brutamonte:{n:'Meteoro Infernal', r:80, m:2.2, cd:8},
  cao:{n:'Baforada', r:55, m:1.5, cd:8},
};
for(const k in MON_AOE){ MON_AOE[k].t = AOE_T; MONS[k].aoe = MON_AOE[k]; }
// Esquiva de cada classe (botão à esquerda das habilidades ou barra de espaço): avanço rápido sem levar dano.
// len = distância, dur = duração (s), cd = recarga (s). O Mago se teletransporta.
const DODGE = {
  arqueiro:{n:'Rolamento', len:150, dur:.26, cd:3},
  guerreiro:{n:'Avanço', len:140, dur:.2, cd:3.5},
  mago:{n:'Teleporte', len:170, dur:.12, cd:4},
};
const ELITE_TAG =['Voraz','Colossal','Implacável','Feroz','Imortal'];

const SKD = {
  // Arqueiro (veneno)
  arrow:{n:'Flecha Venenosa',act:1,req:1,max:10,cd:4},
  fan:{n:'Leque Tóxico',act:1,req:3,max:10,cd:7},
  rain:{n:'Chuva Ácida',act:1,req:6,max:10,cd:10},
  burst:{n:'Explosão de Praga',act:1,req:10,max:10,cd:12},
  tip:{n:'Ponta Envenenada',act:0,req:2,max:10},
  potency:{n:'Toxina Potente',act:0,req:4,max:10},
  agility:{n:'Dedos Ligeiros',act:0,req:5,max:10},
  hide:{n:'Couro Curtido',act:0,req:7,max:10},
  contagion:{n:'Contágio',act:0,req:12,max:5},
  // Guerreiro (sangramento)
  cleave:{n:'Golpe Dilacerante',act:1,req:1,max:10,cd:4},
  charge:{n:'Investida',act:1,req:3,max:10,cd:7},
  whirl:{n:'Giro de Lâmina',act:1,req:6,max:10,cd:10},
  rupture:{n:'Ruptura',act:1,req:10,max:10,cd:12},
  serrated:{n:'Lâmina Serrilhada',act:0,req:2,max:10},
  brutality:{n:'Brutalidade',act:0,req:4,max:10},
  fury:{n:'Fúria',act:0,req:5,max:10},
  iron:{n:'Pele de Ferro',act:0,req:7,max:10},
  bloodlust:{n:'Sede de Sangue',act:0,req:12,max:5},
  // Mago (fogo / queimadura)
  firebolt:{n:'Bola de Fogo',act:1,req:1,max:10,cd:4},
  flamewave:{n:'Onda de Chamas',act:1,req:3,max:10,cd:7},
  meteor:{n:'Meteoro',act:1,req:6,max:10,cd:10},
  inferno:{n:'Inferno',act:1,req:10,max:10,cd:12},
  kindle:{n:'Brasa Viva',act:0,req:2,max:10},
  pyro:{n:'Piromania',act:0,req:4,max:10},
  channel:{n:'Mente Ágil',act:0,req:5,max:10},
  ward:{n:'Escudo Arcano',act:0,req:7,max:10},
  combust:{n:'Combustão',act:0,req:12,max:5},
};
// Cada classe tem 4 ativas (teclas 1–4) e 5 passivas. ACTIVE/PASSIVE mudam com setClass() ao entrar com um personagem.
// Rank máximo das habilidades: 7 (as de máximo 5 continuam 5)
const SK_MAX = 7;
for(const id in SKD) SKD[id].max = Math.min(SKD[id].max, SK_MAX);
// Orbes de melhoria: caem de qualquer criatura e ficam empilhados num espaço da mochila
// Um orbe para cada melhoria de raridade (from → to) e o Orbe da Anulação (rm), que tira 1 atributo e baixa 1 raridade.
// ok(it) diz em quais itens o orbe serve.
const ORBS = {
  desp:{n:'Orbe do Despertar', from:0, to:1, chance:.05, c:'#5fd35f', d:'Desperta um item Comum: ele vira Incomum e ganha 1 atributo.'},
  asc:{n:'Orbe da Ascensão', from:1, to:2, chance:.025, c:'#4f8dff', d:'Eleva um item Incomum a Raro: ganha mais 1 atributo, base um pouco melhor e nome novo.'},
  exa:{n:'Orbe da Exaltação', from:2, to:3, chance:.01, c:'#b36bff', d:'Exalta um item Raro a Épico: ganha mais 1 atributo e base melhor.'},
  lenda:{n:'Orbe da Lenda', from:3, to:4, chance:.003, c:'#f5cf3a', d:'Transforma um item Épico em Lendário: ganha mais 1 atributo, +habilidade da sua classe, a melhor base e um nome lendário.'},
  anul:{n:'Orbe da Anulação', rm:1, chance:.015, c:'#e05a5a', d:'Remove 1 atributo aleatório do item, que cai 1 raridade. Use para trocar um atributo ruim: depois melhore de novo com outro orbe. Num Lendário, ele perde também a +habilidade.'},
};
for(const k in ORBS){ const O = ORBS[k]; O.ok = O.rm ? it => it.rar >= 1 : it => it.rar === O.from; }
const STASH_MAX = 10; // armazém da vila (só usa na vila), dividido entre os personagens da conta
const CLASS_KIT = {
  arqueiro:{active:['arrow','fan','rain','burst'], passive:['tip','potency','agility','hide','contagion']},
  guerreiro:{active:['cleave','charge','whirl','rupture'], passive:['serrated','brutality','fury','iron','bloodlust']},
  mago:{active:['firebolt','flamewave','meteor','inferno'], passive:['kindle','pyro','channel','ward','combust']},
};
let ACTIVE = CLASS_KIT.arqueiro.active, PASSIVE = CLASS_KIT.arqueiro.passive;
function setClass(cls){ const k = CLASS_KIT[cls] || CLASS_KIT.arqueiro; ACTIVE = k.active; PASSIVE = k.passive; }
const clsOf = () => (S.char && S.char.cls) || 'arqueiro';
const isWar = () => clsOf() === 'guerreiro';
const isMage = () => clsOf() === 'mago';
// Dano ao longo do tempo da classe: o Arqueiro envenena, o Guerreiro faz sangrar, o Mago queima (mesmos atributos pois/pdur nos itens)
const DOT_INFO = {arqueiro:{n:'veneno', t:'Veneno', de:'do veneno'}, guerreiro:{n:'sangramento', t:'Sangramento', de:'do sangramento'}, mago:{n:'queimadura', t:'Queimadura', de:'da queimadura'}};
const dotN = () => DOT_INFO[clsOf()].n;
const dotT = () => DOT_INFO[clsOf()].t;
const dotDe = () => DOT_INFO[clsOf()].de;

const SLOTS = ['bow','helm','chest','gloves','boots','ring','amulet'];
// Espaços usados na mochila: itens + uma pilha por tipo de orbe
const orbStacks = () => Object.keys(ORBS).filter(k => (S.orbs && S.orbs[k]) > 0).length;
const invUsed = () => S.inv.length + orbStacks();
const invFull = () => invUsed() >= INV_MAX;
// O espaço da arma se chama 'bow' por compatibilidade com saves antigos; o nome muda com a classe
const WEAPON_N = {arqueiro:'Arco', guerreiro:'Arma', mago:'Cajado'};
const SLOT_N = {get bow(){ return WEAPON_N[clsOf()]; },helm:'Capuz',chest:'Peitoral',gloves:'Luvas',boots:'Botas',ring:'Anel',amulet:'Amuleto'};
const BOWS = [{lv:0,n:'Arco Curto',aps:1.3,m:1},{lv:8,n:'Arco de Caça',aps:1.2,m:1.12},{lv:16,n:'Arco Longo',aps:1.05,m:1.32},{lv:24,n:'Arco Composto',aps:1.15,m:1.3},{lv:32,n:'Arco de Guerra',aps:1.1,m:1.42}];
const BLADES = [{lv:0,n:'Espada Curta',aps:1.2,m:1},{lv:8,n:'Machado de Guerra',aps:1.05,m:1.2},{lv:16,n:'Espada Longa',aps:1.1,m:1.2},{lv:24,n:'Montante',aps:.9,m:1.42},{lv:32,n:'Lâmina Rúnica',aps:1.1,m:1.3}];
const STAVES = [{lv:0,n:'Cajado de Carvalho',aps:1.2,m:1},{lv:8,n:'Varinha de Brasa',aps:1.3,m:1.05},{lv:16,n:'Cajado Rúnico',aps:1.05,m:1.3},{lv:24,n:'Cetro Ardente',aps:1.15,m:1.28},{lv:32,n:'Cajado do Abismo',aps:1.05,m:1.45}];
const WEAPONS = {arqueiro:BOWS, guerreiro:BLADES, mago:STAVES};
const weaponBases = cls => WEAPONS[cls || clsOf()] || BOWS;
const BASES = {
  helm:['Capuz de Linho','Capuz de Couro','Elmo de Escamas','Capuz Sombrio'],
  chest:['Gibão Acolchoado','Couraça de Couro','Brigantina','Manto de Escamas'],
  gloves:['Luvas de Pano','Braçadeiras','Manoplas de Couro','Garras de Arqueiro'],
  boots:['Sapatos Gastos','Botas de Couro','Botas de Patrulha','Grevas Leves'],
  ring:['Anel de Cobre','Anel de Prata','Anel de Ouro','Anel de Ônix'],
  amulet:['Pingente de Osso','Amuleto de Prata','Talismã Verde','Medalhão Antigo'],
};
const ARMOR_M = {helm:1,chest:1.8,gloves:.7,boots:.8};
const AFX = {
  life:{n:v=>`+${v} de vida`,lo:l=>4+l*1.5,hi:l=>12+l*4.2,slots:SLOTS},
  pois:{n:v=>`+${v}% de dano de ${dotN()}`,lo:()=>5,hi:l=>16+l*.9,slots:['bow','amulet','gloves','ring','helm']},
  ias:{n:v=>`+${v}% de velocidade de ataque`,lo:()=>3,hi:()=>15,slots:['bow','gloves','ring','amulet']},
  crit:{n:v=>`+${n1(v)}% de chance de crítico`,lo:()=>1,hi:()=>8,dec:1,slots:['gloves','ring','amulet','helm']},
  critd:{n:v=>`+${v}% de dano crítico`,lo:()=>8,hi:()=>45,slots:['bow','gloves','amulet','ring']},
  ms:{n:v=>`+${v}% de velocidade de movimento`,lo:()=>3,hi:()=>15,slots:['boots']},
  armor:{n:v=>`+${v} de armadura`,lo:l=>2+l*.6,hi:l=>6+l*2,slots:['helm','chest','gloves','boots']},
  ls:{n:v=>`${n1(v)}% do dano vira vida`,lo:()=>.5,hi:()=>4,dec:1,slots:['bow','ring','amulet']},
  cdr:{n:v=>`-${v}% de recarga das habilidades`,lo:()=>2,hi:()=>10,slots:['helm','amulet','ring']},
  pdur:{n:v=>`+${v}% de duração ${dotDe()}`,lo:()=>5,hi:()=>30,slots:['bow','chest','amulet']},
  gf:{n:v=>`+${v}% de ouro encontrado`,lo:()=>5,hi:()=>40,slots:['helm','ring','amulet','boots']},
  // Resistências (fogo, gelo e elétrico também vêm de "todas as elementais")
  rf:{n:v=>`+${v}% de resistência a fogo`,lo:()=>5,hi:l=>12+l*.6,slots:['helm','chest','gloves','boots','ring','amulet']},
  rc:{n:v=>`+${v}% de resistência a gelo`,lo:()=>5,hi:l=>12+l*.6,slots:['helm','chest','gloves','boots','ring','amulet']},
  rl:{n:v=>`+${v}% de resistência elétrica`,lo:()=>5,hi:l=>12+l*.6,slots:['helm','chest','gloves','boots','ring','amulet']},
  rx:{n:v=>`+${v}% de resistência a caos`,lo:()=>4,hi:l=>9+l*.45,slots:['chest','boots','ring','amulet']},
  rp:{n:v=>`+${v}% de resistência a veneno`,lo:()=>5,hi:l=>12+l*.6,slots:['helm','chest','gloves','boots','ring','amulet']},
  rn:{n:v=>`+${v}% de resistência necrótica`,lo:()=>4,hi:l=>9+l*.45,slots:['helm','chest','ring','amulet']},
  rs:{n:v=>`+${v}% de resistência psíquica`,lo:()=>4,hi:l=>9+l*.45,slots:['helm','ring','amulet']},
  rall:{n:v=>`+${v}% de resistência a fogo, gelo e elétrico`,lo:()=>3,hi:l=>6+l*.3,slots:['chest','ring','amulet']},
};
const SUF = {rf:'da Brasa',rc:'do Inverno',rl:'da Tempestade',rx:'do Vazio',rp:'do Antídoto',rn:'da Cripta',rs:'da Mente',rall:'dos Elementos',life:'do Vigor',pois:'da Peçonha',ias:'da Pressa',crit:'da Precisão',critd:'do Abate',ms:'do Vento',armor:'da Muralha',ls:'do Vampiro',cdr:'do Fluxo',pdur:'da Agonia',gf:'da Fortuna'};
const RA = ['Presa','Sussurro','Agouro','Espinho','Mordida','Lamento','Véu','Garra','Sombra','Sopro','Ferrão','Prece'];
const RB = ['Fel','Cinzas','Musgo','Ossos','Víbora','Cripta','Névoa','Peste','Corvo','Brejo','Cicuta','Lodo'];
const LEG = {bow:['Sussurro da Víbora','Corda de Basilisco'],helm:['Coroa do Pântano','Capuz da Mamba'],chest:['Pele da Hidra','Manto da Cicuta'],gloves:['Toque Pestilento','Dedos de Áspide'],boots:['Passos do Charco','Botas da Naja'],ring:['Olho da Serpente','Aliança Verde'],amulet:['Coração de Peçonha','Lágrima de Cobra']};

/* ---------- ESTADO SALVO ---------- */
const KEY = 'cacada-vibora-v1';
const startWeapon = cls => cls === 'guerreiro'
  ? {id:0,slot:'bow',rar:0,ilvl:1,base:'Espada Enferrujada',name:'Espada Enferrujada',min:3,max:6,aps:1.15,affix:[],bt:0}
  : cls === 'mago'
  ? {id:0,slot:'bow',rar:0,ilvl:1,base:'Cajado de Aprendiz',name:'Cajado de Aprendiz',min:3,max:6,aps:1.15,affix:[],bt:0}
  : {id:0,slot:'bow',rar:0,ilvl:1,base:'Arco Simples',name:'Arco Simples',min:3,max:6,aps:1.2,affix:[],bt:0};
const defaults = cls => {
  const sk = {}; for(const id in SKD) sk[id] = 0;
  sk[(CLASS_KIT[cls] || CLASS_KIT.arqueiro).active[0]] = 1; // começa com a 1ª habilidade da classe
  return {lv:1,xp:0,par:0,pp:{dmg:0,pois:0,life:0,ias:0},pxp:0,gold:0,inv:[],orbs:{desp:0,asc:0,exa:0,lenda:0,anul:0},eq:{bow:startWeapon(cls)},sk,auto:{},cfg:{ret:35,retFull:true,autoGo:true,autoSell:false,minPick:0,manual:false},map:'campos',speed:1,kills:0,uid:1,legs:0,char:null,ver:3,shop:[]};
};
// O save usa sempre a mesma chave: versões novas do jogo leem o progresso antigo.
function normalize(s){
  const cls = (s.char && s.char.cls) || 'arqueiro', d = defaults(cls);
  Object.assign(d, s, {sk:{...d.sk,...(s.sk||{})},auto:{...d.auto,...(s.auto||{})},cfg:{...d.cfg,...(s.cfg||{})},pp:{...d.pp,...(s.pp||{})}});
  // Saves antigos sem limite de nível: o que passou de 40 vira Paragon
  if(d.lv > MAX_LV){ d.par += d.lv - MAX_LV; d.lv = MAX_LV; d.xp = 0; }
  d.orbs = {...defaults(cls).orbs, ...(s.orbs || {})};
  for(const id in d.sk) if(SKD[id]) d.sk[id] = Math.min(d.sk[id], SKD[id].max); // rank acima do novo máximo vira ponto livre
  if(Object.values(d.sk).reduce((a, v) => a + v, 0) > d.lv) d.sk = defaults(cls).sk;
  if(!d.eq) d.eq = {};
  if(!Array.isArray(d.inv)) d.inv = [];
  if(!Array.isArray(d.shop)) d.shop = [];
  if(!d.char && (d.lv > 1 || d.kills > 0)) d.char = {name:'Víbora',cls:'arqueiro',build:'veneno',color:0};
  if((s.ver || 0) < 3){ d.inv.forEach(migrateItem); d.shop.forEach(migrateItem); for(const k in d.eq) migrateItem(d.eq[k]); }
  d.ver = 3;
  return d;
}
// Cópia local da conta (todos os personagens) em KEY + ':' + uid; KEY puro é o save antigo (antes do login), migrado no primeiro login.
function readLocal(key){
  try{ const raw = localStorage.getItem(key); if(raw) return JSON.parse(raw); }catch(e){}
  return null;
}
const heroName = () => S.char ? S.char.name : 'Herói';
const CLOAKS = [{n:'Musgo',a:'#2b4d30',b:'#3f6b3b',h:'#1f3a25'},{n:'Couro',a:'#5a3f26',b:'#7a5a38',h:'#3e2a19'},{n:'Noite',a:'#28344f',b:'#3c4c70',h:'#1b2438'},{n:'Sangue',a:'#5a2224',b:'#7d3336',h:'#3d1618'}];
const CLASSES = [{id:'arqueiro',n:'Arqueiro',d:'Ataca de longe com arco',ok:1},{id:'guerreiro',n:'Guerreiro',d:'Corpo a corpo com lâminas',ok:1},{id:'mago',n:'Mago',d:'Magias de fogo à distância',ok:1}];
// Builds liberadas por classe (cls); as sem cls ainda não existem
const BUILDS = [{id:'veneno',n:'Veneno',d:'Dano ao longo do tempo',ok:1,cls:'arqueiro'},{id:'sangramento',n:'Sangramento',d:'Cortes que sangram',ok:1,cls:'guerreiro'},{id:'fogo',n:'Fogo',d:'Explosões e queimaduras',ok:1,cls:'mago'},{id:'gelo',n:'Gelo',d:'Em breve'}];
const buildsFor = cls => BUILDS.filter(b => !b.cls || b.cls === cls);
const xpMult = md => { const over = S.lv - md.lv[1]; return over > 0 ? Math.max(.05, 1 - over*.12) : 1; };
const avgIlvl = () => Math.round(SLOTS.reduce((t, k) => t + (S.eq[k] ? S.eq[k].ilvl : 0), 0) / SLOTS.length);
const mapRec = md => Math.max(0, md.lv[0] - 2);
// S é o personagem em jogo. Só vale depois do login e da escolha na tela de personagens (09-conta.js liga accountReady).
let S = defaults();
function save(){
  if(!accountReady || !fbUser || !S.char) return;
  S.savedAt = Date.now();
  accountStore();
}
