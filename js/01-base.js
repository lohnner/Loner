// Base: atalhos, relógio de Brasília, constantes do jogo (todo o balanceamento fica aqui) e o estado salvo S.
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const cent = v => Math.round(v * 100) / 100;
const EUR = new Intl.NumberFormat('pt-BR', {style:'currency', currency:'EUR'});
const eur = v => EUR.format(v);
const anos = n => n + (n === 1 ? ' ano' : ' anos');
const semAcento = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); // para a pesquisa achar "leao" em "Leão"

/* ---------- BALANCEAMENTO ---------- */
const DINHEIRO_INICIAL = 50;
const CICLO_MERCADO = 3600e3, ANIMAIS_NO_MERCADO = 20;
const MARGEM_COMPRA = 1.25, MARGEM_VENDA = .8; // sobre o valor do animal; com o índice de ±20% não dá lucro só comprando e vendendo
const GRAVIDEZ_MIN = 1 * 3600e3, GRAVIDEZ_MAX = 3 * 3600e3, PARTO = 1 * 3600e3;
const IDADE_FERTIL = 1;
const DIAS_POR_ANO = 3; // quantos dias reais dura 1 ano do jogo (a virada é sempre à meia-noite de Brasília)
const AJUDA_LIMITE = 15, AJUDA_VALOR = 50; // sem animais e sem dinheiro: ajuda para o jogo não travar
const IDADE_PISO = .12; // o animal mais velho ainda vale 12% do preço de um recém-nascido
// Caça: a cada CACA_PASSO cada predador adulto, sem fome saciada, pode pegar uma presa do terreno; depois fica FOME sem caçar.
const CACA_PASSO = 1 * 3600e3, FOME = 6 * 3600e3, CACA_MAX_PASSOS = 168;
// Tristeza (0 a 100): espécies juntas (menos pesado com terreno maior), desequilíbrio entre elas e medo de predador.
const TRISTE_MISTURA = 40, TRISTE_DESEQ = 40, TRISTE_DESEQ_POR = 10, TRISTE_MEDO = 20;
const TRISTE_POR_PONTO = 4; // a cada 4 de tristeza, o filhote nasce com 1 ponto a menos em cada status

/* ---------- OS 5 STATUS E A NOTA ---------- */
const STATUS = [['for', 'Força'], ['agi', 'Agilidade'], ['int', 'Inteligência'], ['sau', 'Saúde'], ['bel', 'Beleza']];
// Faixas de qualidade (0 a 100), da melhor para a pior: `de` = mínimo; `p` = chance no mercado (%). Também dão a cor da nota.
const FAIXAS = [
  {de:90, ate:100, p:.3},
  {de:80, ate:90, p:1.2},
  {de:68, ate:80, p:4.5},
  {de:55, ate:68, p:14},
  {de:40, ate:55, p:30},
  {de:0, ate:40, p:50},
];
// Posição da nota dentro da faixa da categoria (0 a 100) → multiplicador do preço (entre os pontos, em linha reta)
const CURVA_PRECO = [[0, .4], [40, .7], [55, 1], [68, 1.4], [80, 2.2], [90, 4], [100, 10]];

/* ---------- RELÓGIO ---------- */
// Tudo usa agora(): a hora do servidor (cabeçalho Date do versao.json, em 09), para adiantar o relógio do celular não apressar o jogo.
let relogioDif = 0;
const agora = () => Date.now() + relogioDif;
// Brasília é sempre UTC−3. Um "ano" do jogo dura DIAS_POR_ANO dias reais e vira à meia-noite de Brasília: cada virada = 1 ano para todos os animais.
// diaBR(t) devolve o número desse ano do jogo (o nome ficou de quando 1 ano era 1 dia); inicioDiaBR(d) é a meia-noite em que ele começa.
const FUSO_BR = 3 * 3600e3, DIA = 864e5, ANO = DIAS_POR_ANO * DIA;
const diaBR = t => Math.floor((t - FUSO_BR) / ANO);
const inicioDiaBR = d => d * ANO + FUSO_BR;
const dataBR = t => { const d = new Date(t - FUSO_BR); return String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0'); };
const horaBR = t => { const d = new Date(t - FUSO_BR); return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0'); };
const tempo = ms => {
  const s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
  return h ? `${h}h ${String(m).padStart(2, '0')}min` : `${m}min ${String(s % 60).padStart(2, '0')}s`;
};

/* ---------- ESTADO SALVO ---------- */
const KEY = 'loner-criadouro-v1';
function defaults(){
  return {
    ver: 2, nome: '', dinheiro: DINHEIRO_INICIAL, espacosExtras: 0, terrenos: [{id: 't1', tipo: 'gaiola'}], terrenoAtual: 't1', seq: 2,
    animais: [], casais: [], conq: {}, comprados: {ciclo: 0, lista: []}, diario: [],
    nascidos: 0, mortos: 0, devorados: 0, vendidos: 0, receita: 0, tCaca: 0, savedAt: 0,
  };
}
// Mistura um save com os padrões: campo novo em defaults() já vale para saves antigos.
function normalize(o){
  const d = defaults();
  if(!o || typeof o !== 'object') return d;
  const s = Object.assign(d, o);
  s.animais = Array.isArray(s.animais) ? s.animais.filter(a => a && ESP[a.esp]) : [];
  s.casais = Array.isArray(s.casais) ? s.casais : [];
  s.diario = Array.isArray(s.diario) ? s.diario.slice(0, 80) : [];
  // Saves de antes dos terrenos: cada animal recebe um lugar (ganhando o terreno se preciso), e os "espaços" comprados voltam em dinheiro.
  s.terrenos = Array.isArray(s.terrenos) ? s.terrenos.filter(t => t && TERRENO[t.tipo]) : [];
  const novo = tipo => { const t = {id: 't' + s.seq++, tipo}; s.terrenos.push(t); return t; };
  if(!s.terrenos.length) novo('gaiola');
  for(const a of s.animais){
    if(s.terrenos.some(t => t.id === a.ter)) continue;
    const cabe = t => { const ali = s.animais.filter(b => b.ter === t.id), T = TERRENO[t.tipo]; return moraEm(a.esp, t.tipo) && ali.length < T.cap && (!T.unica || ali.every(b => b.esp === a.esp)); };
    a.ter = (s.terrenos.find(cabe) || novo(ESP[a.esp].terreno)).id;
  }
  // casal de save antigo com os dois em lugares diferentes é desfeito
  s.casais = s.casais.filter(c => { const f = s.animais.find(a => a.id === c.f), m = s.animais.find(a => a.id === c.m); return f && (!m || m.ter === f.ter); });
  if(!s.terrenos.some(t => t.id === s.terrenoAtual)) s.terrenoAtual = s.terrenos[0].id;
  for(let k = 1; k <= (s.espacosExtras || 0); k++) s.dinheiro = cent(s.dinheiro + 2500 * k * k);
  s.espacosExtras = 0;
  // Saves de antes da versão 2 (1 ano = 1 dia real): dia0 contava dias. Cada animal fica com a idade que tinha e passa a contar anos de DIAS_POR_ANO dias.
  if(!(o.ver >= 2)){
    const t = agora(), diaVelho = Math.floor((t - FUSO_BR) / DIA), anoNovo = diaBR(t);
    for(const a of s.animais){ a.idade0 = Math.max(0, (a.idade0 || 0) + diaVelho - (a.dia0 || diaVelho)); a.dia0 = anoNovo; }
  }
  s.ver = 2;
  // Conquistas: o melhor macho e a melhor fêmea de cada espécie que o jogador já teve. Quem já joga ganha os animais que tem agora.
  if(!s.conq || typeof s.conq !== 'object') s.conq = {};
  for(const a of s.animais) registraConquista(a, s);
  return s;
}
let S = defaults();
function diario(txt){
  S.diario.unshift({t: agora(), txt});
  if(S.diario.length > 80) S.diario.length = 80;
}
// accountReady só é true com a conta carregada: antes disso nada é gravado (evita salvar estado vazio por cima da conta).
function save(){
  if(!accountReady) return;
  accountStore();
}
