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
const RAR = [{n:'Comum',c:'#d9d4c7'},{n:'Mágico',c:'#6f9cff'},{n:'Raro',c:'#f0d34f'},{n:'Lendário',c:'#ff8a2b'}];
const MAPS = [
  {id:'campos',name:'Campos de Trigo',lv:[1,5],req:1,seed:11,ground:['#3d4a27','#4b5a2e','#2f3b1e'],decor:'field',tuft:'#6c8a38',mons:['rato','espantalho','zumbi'],desc:'Plantação abandonada perto da vila. Bom lugar para a primeira caçada.'},
  {id:'floresta',name:'Floresta Sombria',lv:[5,11],req:4,seed:23,ground:['#1e3022','#273d2b','#152218'],decor:'forest',tuft:'#3f6a3a',mons:['lobo','aranha','ent'],desc:'Lobos em bando e aranhas que cospem teia de longe.'},
  {id:'pantano',name:'Pântano Pútrido',lv:[11,18],req:10,seed:37,ground:['#2a3322','#35402a','#1d2418'],decor:'swamp',tuft:'#6b7a3a',mons:['sapo','sanguessuga','bruxa'],desc:'Sanguessugas roubam vida a cada mordida. Bruxas atacam de longe.'},
  {id:'catacumbas',name:'Catacumbas',lv:[18,27],req:17,seed:41,ground:['#2a292d','#343338','#1f1e22'],decor:'crypt',tuft:'#4a4850',mons:['esqueleto','ossudo','carnical'],desc:'Corredores de pedra cheios de mortos-vivos e arqueiros de osso.'},
  {id:'abismo',name:'Abismo Ardente',lv:[27,40],req:26,seed:53,ground:['#2c1611','#391c14','#200f0b'],decor:'hell',tuft:'#5a2a18',mons:['diabrete','brutamonte','cao'],desc:'Fendas de lava e demônios. Os melhores itens caem aqui.'},
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
};
const ELITE_TAG = ['Voraz','Colossal','Implacável','Feroz','Imortal'];

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
};
// Cada classe tem 4 ativas (teclas 1–4) e 5 passivas. ACTIVE/PASSIVE mudam com setClass() ao entrar com um personagem.
const CLASS_KIT = {
  arqueiro:{active:['arrow','fan','rain','burst'], passive:['tip','potency','agility','hide','contagion']},
  guerreiro:{active:['cleave','charge','whirl','rupture'], passive:['serrated','brutality','fury','iron','bloodlust']},
};
let ACTIVE = CLASS_KIT.arqueiro.active, PASSIVE = CLASS_KIT.arqueiro.passive;
function setClass(cls){ const k = CLASS_KIT[cls] || CLASS_KIT.arqueiro; ACTIVE = k.active; PASSIVE = k.passive; }
const clsOf = () => (S.char && S.char.cls) || 'arqueiro';
const isWar = () => clsOf() === 'guerreiro';
// Dano ao longo do tempo da classe: o Arqueiro envenena, o Guerreiro faz sangrar (mesmos atributos pois/pdur nos itens)
const dotN = () => isWar() ? 'sangramento' : 'veneno';
const dotT = () => isWar() ? 'Sangramento' : 'Veneno';

const SLOTS = ['bow','helm','chest','gloves','boots','ring','amulet'];
// O espaço da arma se chama 'bow' por compatibilidade com saves antigos; para o Guerreiro ele é uma lâmina
const SLOT_N = {get bow(){ return isWar() ? 'Arma' : 'Arco'; },helm:'Capuz',chest:'Peitoral',gloves:'Luvas',boots:'Botas',ring:'Anel',amulet:'Amuleto'};
const BOWS = [{lv:0,n:'Arco Curto',aps:1.3,m:1},{lv:8,n:'Arco de Caça',aps:1.2,m:1.12},{lv:16,n:'Arco Longo',aps:1.05,m:1.32},{lv:24,n:'Arco Composto',aps:1.15,m:1.3},{lv:32,n:'Arco de Guerra',aps:1.1,m:1.42}];
const BLADES = [{lv:0,n:'Espada Curta',aps:1.2,m:1},{lv:8,n:'Machado de Guerra',aps:1.05,m:1.2},{lv:16,n:'Espada Longa',aps:1.1,m:1.2},{lv:24,n:'Montante',aps:.9,m:1.42},{lv:32,n:'Lâmina Rúnica',aps:1.1,m:1.3}];
const weaponBases = () => isWar() ? BLADES : BOWS;
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
  pdur:{n:v=>`+${v}% de duração do ${dotN()}`,lo:()=>5,hi:()=>30,slots:['bow','chest','amulet']},
  gf:{n:v=>`+${v}% de ouro encontrado`,lo:()=>5,hi:()=>40,slots:['helm','ring','amulet','boots']},
};
const SUF = {life:'do Vigor',pois:'da Peçonha',ias:'da Pressa',crit:'da Precisão',critd:'do Abate',ms:'do Vento',armor:'da Muralha',ls:'do Vampiro',cdr:'do Fluxo',pdur:'da Agonia',gf:'da Fortuna'};
const RA = ['Presa','Sussurro','Agouro','Espinho','Mordida','Lamento','Véu','Garra','Sombra','Sopro','Ferrão','Prece'];
const RB = ['Fel','Cinzas','Musgo','Ossos','Víbora','Cripta','Névoa','Peste','Corvo','Brejo','Cicuta','Lodo'];
const LEG = {bow:['Sussurro da Víbora','Corda de Basilisco'],helm:['Coroa do Pântano','Capuz da Mamba'],chest:['Pele da Hidra','Manto da Cicuta'],gloves:['Toque Pestilento','Dedos de Áspide'],boots:['Passos do Charco','Botas da Naja'],ring:['Olho da Serpente','Aliança Verde'],amulet:['Coração de Peçonha','Lágrima de Cobra']};

/* ---------- ESTADO SALVO ---------- */
const KEY = 'cacada-vibora-v1';
const startWeapon = cls => cls === 'guerreiro'
  ? {id:0,slot:'bow',rar:0,ilvl:1,base:'Espada Enferrujada',name:'Espada Enferrujada',min:3,max:6,aps:1.15,affix:[],bt:0}
  : {id:0,slot:'bow',rar:0,ilvl:1,base:'Arco Simples',name:'Arco Simples',min:3,max:6,aps:1.2,affix:[],bt:0};
const defaults = cls => {
  const sk = {}; for(const id in SKD) sk[id] = 0;
  sk[(CLASS_KIT[cls] || CLASS_KIT.arqueiro).active[0]] = 1; // começa com a 1ª habilidade da classe
  return {lv:1,xp:0,par:0,pp:{dmg:0,pois:0,life:0,ias:0},pxp:0,gold:0,inv:[],eq:{bow:startWeapon(cls)},sk,auto:{},cfg:{ret:35,retFull:true,autoGo:true,autoSell:false,minPick:0},map:'campos',speed:1,kills:0,uid:1,legs:0,char:null,ver:2,shop:[]};
};
// O save usa sempre a mesma chave: versões novas do jogo leem o progresso antigo.
function normalize(s){
  const cls = (s.char && s.char.cls) || 'arqueiro', d = defaults(cls);
  Object.assign(d, s, {sk:{...d.sk,...(s.sk||{})},auto:{...d.auto,...(s.auto||{})},cfg:{...d.cfg,...(s.cfg||{})},pp:{...d.pp,...(s.pp||{})}});
  // Saves antigos sem limite de nível: o que passou de 40 vira Paragon
  if(d.lv > MAX_LV){ d.par += d.lv - MAX_LV; d.lv = MAX_LV; d.xp = 0; }
  if(Object.values(d.sk).reduce((a, v) => a + v, 0) > d.lv) d.sk = defaults(cls).sk;
  if(!d.eq) d.eq = {};
  if(!Array.isArray(d.inv)) d.inv = [];
  if(!Array.isArray(d.shop)) d.shop = [];
  if(!d.char && (d.lv > 1 || d.kills > 0)) d.char = {name:'Víbora',cls:'arqueiro',build:'veneno',color:0};
  d.ver = 2;
  return d;
}
// Cópia local da conta (todos os personagens) em KEY + ':' + uid; KEY puro é o save antigo (antes do login), migrado no primeiro login.
function readLocal(key){
  try{ const raw = localStorage.getItem(key); if(raw) return JSON.parse(raw); }catch(e){}
  return null;
}
const heroName = () => S.char ? S.char.name : 'Víbora';
const CLOAKS = [{n:'Musgo',a:'#2b4d30',b:'#3f6b3b',h:'#1f3a25'},{n:'Couro',a:'#5a3f26',b:'#7a5a38',h:'#3e2a19'},{n:'Noite',a:'#28344f',b:'#3c4c70',h:'#1b2438'},{n:'Sangue',a:'#5a2224',b:'#7d3336',h:'#3d1618'}];
const CLASSES = [{id:'arqueiro',n:'Arqueiro',d:'Ataca de longe com arco',ok:1},{id:'guerreiro',n:'Guerreiro',d:'Corpo a corpo com lâminas',ok:1},{id:'feiticeira',n:'Feiticeira',d:'Em breve'}];
// Builds liberadas por classe (cls); as sem cls ainda não existem
const BUILDS = [{id:'veneno',n:'Veneno',d:'Dano ao longo do tempo',ok:1,cls:'arqueiro'},{id:'sangramento',n:'Sangramento',d:'Cortes que sangram',ok:1,cls:'guerreiro'},{id:'gelo',n:'Gelo',d:'Em breve'},{id:'fogo',n:'Fogo',d:'Em breve'}];
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
