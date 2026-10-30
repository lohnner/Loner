// Mercado: atualiza a cada CICLO_MERCADO. É sorteado a partir do número do ciclo, então é o mesmo para todos e não dá para "resortear".
'use strict';

function rng(seed){ // mulberry32
  let a = seed >>> 0;
  return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const cicloDe = t => Math.floor(t / CICLO_MERCADO);
const fimDoCiclo = t => (cicloDe(t) + 1) * CICLO_MERCADO;

// Índice de preço da espécie (0,8 a 1,2), parado durante o ciclo: duas ondas lentas, de horas, diferentes para cada espécie.
function indice(esp, t = agora()){
  const i = ESP[esp].i, h = cicloDe(t) * CICLO_MERCADO / 3600e3;
  return 1 + .12 * Math.sin(h / 2.7 + i * 1.7) + .08 * Math.sin(h / 7.3 + i * 4.1);
}

function animalDoMercado(key, esp, sx, dia, r){
  let x = r() * 100, faixa = RANKS[RANKS.length - 1];
  for(const k of RANKS){ if(x < k.p){ faixa = k; break; } x -= k.p; }
  const alvo = faixa.de + r() * (faixa.ate - faixa.de - .5);
  const vida = esp.vida, idade = Math.min(vida - 1, 1 + Math.floor(r() * r() * (vida - 1)));
  return {id: key, esp: esp.id, sx, st: statusDaFaixa(alvo, r), dia0: dia, idade0: idade};
}
// Cada ciclo tem 1 macho e 1 fêmea de cada uma das espécies, vendidos separados: quem comprou um sempre acha o outro sexo.
let mercadoCache = null;
function mercado(t = agora()){
  const c = cicloDe(t);
  if(mercadoCache && mercadoCache.c === c) return mercadoCache.lista;
  const r = rng(Math.imul(c, 2654435761));
  const dia = diaBR(c * CICLO_MERCADO);
  const lista = [];
  for(const e of ESPECIES.slice().sort((a, b) => a.p - b.p)){
    for(const sx of ['M', 'F']) lista.push(animalDoMercado(`${c}-${e.id}-${sx}`, e, sx, dia, r));
  }
  mercadoCache = {c, lista};
  return lista;
}
const oferta = key => mercado().find(o => o.id === key) || null;
function jaComprado(key){
  return S.comprados.ciclo === cicloDe(agora()) && S.comprados.lista.includes(key);
}

/* ---------- TERRENO ---------- */
// O terreno guarda um número de ESPÉCIES (quantos animais de cada uma não tem limite).
const espacosTotal = () => ESPACOS_INICIAIS + S.espacosExtras;
const especiesNoTerreno = () => [...new Set(S.animais.map(a => a.esp))];
const temEspaco = esp => especiesNoTerreno().includes(esp) || especiesNoTerreno().length < espacosTotal();
const precoProximoEspaco = () => espacoPreco(S.espacosExtras + 1);
function comprarEspaco(){
  if(espacosTotal() >= ESPACOS_MAX) return 'O terreno já está no tamanho máximo.';
  const p = precoProximoEspaco();
  if(S.dinheiro < p) return `Faltam ${eur(p - S.dinheiro)} para o próximo espaço.`;
  S.dinheiro = cent(S.dinheiro - p); S.espacosExtras++;
  diario(`Terreno ampliado: agora cabem ${espacosTotal()} espécies (${eur(p)}).`);
  return '';
}

/* ---------- COMPRA E VENDA ---------- */
// Devolve '' se deu certo, ou o motivo.
function comprar(key){
  const c = cicloDe(agora());
  if(S.comprados.ciclo !== c) S.comprados = {ciclo: c, lista: []};
  const o = oferta(key);
  if(!o) return 'Esta oferta já saiu do mercado.';
  if(jaComprado(key)) return 'Este animal já foi comprado.';
  if(!temEspaco(o.esp)) return `O terreno está cheio (${espacosTotal()} espécies). Compre mais espaço ou venda uma espécie.`;
  const p = precoCompra(o);
  if(S.dinheiro < p) return `Faltam ${eur(p - S.dinheiro)}.`;
  S.dinheiro = cent(S.dinheiro - p);
  S.animais.push(Object.assign({}, o, {id: 'a' + S.seq++, st: Object.assign({}, o.st)}));
  S.comprados.lista.push(key);
  diario(`Comprou ${o.sx === 'M' ? 'um macho' : 'uma fêmea'} de ${ESP[o.esp].n} por ${eur(p)}.`);
  return '';
}
function vender(id){
  const a = S.animais.find(x => x.id === id);
  if(!a) return 'Animal não encontrado.';
  const c = casalDe(id);
  if(c && c.fase !== 'pronto' && c.fase !== 'tentando') return 'Ela está grávida: espere o filhote nascer para vender este casal.';
  if(c) desfazCasal(c);
  const v = precoVenda(a);
  S.dinheiro = cent(S.dinheiro + v); S.receita = cent(S.receita + v); S.vendidos++;
  S.animais = S.animais.filter(x => x !== a);
  diario(`Vendeu ${ESP[a.esp].n} ${sexoS(a.sx)} (${rankDe(a.st)}, ${anos(idadeDe(a))}) por ${eur(v)}.`);
  return '';
}
const patrimonio = () => cent(S.dinheiro + S.animais.reduce((t, a) => t + precoVenda(a), 0));
