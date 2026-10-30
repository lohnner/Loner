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
const DINHEIRO_INICIAL = 500;
const ESPACOS_INICIAIS = 3, ESPACOS_MAX = 50;
const espacoPreco = k => 2500 * k * k; // k-ésimo espaço comprado: 2.500, 10.000, 22.500, 40.000...
const CICLO_MERCADO = 3600e3, ANIMAIS_NO_MERCADO = 20;
const MARGEM_COMPRA = 1.25, MARGEM_VENDA = .8; // sobre o valor do animal; com o índice de ±20% não dá lucro só comprando e vendendo
const GRAVIDEZ_MIN = 1 * 3600e3, GRAVIDEZ_MAX = 3 * 3600e3, PARTO = 1 * 3600e3;
const IDADE_FERTIL = 1;
const AJUDA_LIMITE = 50, AJUDA_VALOR = 500; // sem animais e sem dinheiro: ajuda para o jogo não travar
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
// Brasília é sempre UTC−3. Um "dia" do jogo vai da meia-noite à meia-noite de Brasília; cada virada = 1 ano para todos os animais.
const FUSO_BR = 3 * 3600e3, DIA = 864e5;
const diaBR = t => Math.floor((t - FUSO_BR) / DIA);
const inicioDiaBR = d => d * DIA + FUSO_BR;
const horaBR = t => { const d = new Date(t - FUSO_BR); return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0'); };
const tempo = ms => {
  const s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
  return h ? `${h}h ${String(m).padStart(2, '0')}min` : `${m}min ${String(s % 60).padStart(2, '0')}s`;
};

/* ---------- ESTADO SALVO ---------- */
const KEY = 'loner-criadouro-v1';
function defaults(){
  return {
    ver: 1, dinheiro: DINHEIRO_INICIAL, espacosExtras: 0, seq: 1,
    animais: [], casais: [], comprados: {ciclo: 0, lista: []}, diario: [],
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
