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
  let x = r() * 100, faixa = FAIXAS[FAIXAS.length - 1];
  for(const k of FAIXAS){ if(x < k.p){ faixa = k; break; } x -= k.p; }
  const alvo = faixa.de + r() * (faixa.ate - faixa.de - .5);
  const vida = esp.vida, idade = Math.min(vida - 1, 1 + Math.floor(r() * r() * (vida - 1)));
  const a = {id: key, esp: esp.id, sx, st: statusDaFaixa(alvo, r), dia0: dia, idade0: idade};
  // A nota máxima da espécie (a mais rara) não aparece no mercado: só nasce no criadouro. Baixa o maior status até sair dela.
  while(notaDe(a) >= esp.nmax){
    const k = STATUS.map(([k]) => k).reduce((x, y) => a.st[y] > a.st[x] ? y : x);
    if(a.st[k] <= 0) break;
    a.st[k]--;
  }
  return a;
}
function sorteiaEspecie(r, usadas, pool){
  for(let tent = 0; tent < 16; tent++){
    let x = r() * 100, cat = CATEGORIAS[0];
    for(const c of CATEGORIAS){ if(x < c.peso){ cat = c; break; } x -= c.peso; }
    const l = pool.filter(e => categoria(e) === cat);
    if(!l.length) continue;
    const e = l[Math.floor(r() * l.length)];
    if(!usadas.has(e.id)) return e;
  }
  const resto = pool.filter(e => !usadas.has(e.id));
  if(!resto.length){ usadas.clear(); return pool[Math.floor(r() * pool.length)]; }
  return resto[Math.floor(r() * resto.length)];
}
// No mercado de gaiola são poucas espécies: a chance cai com o preço, para as mais caras (chinchila, ouriço) aparecerem bem menos.
function sorteiaPorPreco(r, pool){
  const peso = e => 1 / e.p;
  let x = r() * pool.reduce((t, e) => t + peso(e), 0);
  for(const e of pool){ if(x < peso(e)) return e; x -= peso(e); }
  return pool[0];
}
// São dois mercados: 'gaiola' (animais de gaiola) e 'outros' (os demais). Cada ciclo tem ANIMAIS_NO_MERCADO animais em cada um,
// em grupos de 1 a 3 da mesma espécie, e os raros aparecem menos. O de gaiola sempre começa com um casal barato, para ninguém travar no início.
let mercadoCache = {c: -1, gaiola: null, outros: null};
function mercado(t = agora(), tipo = mercadoTipo){
  const c = cicloDe(t);
  if(mercadoCache.c !== c) mercadoCache = {c, gaiola: null, outros: null};
  if(mercadoCache[tipo]) return mercadoCache[tipo];
  const r = rng(Math.imul(c, 2654435761) + (tipo === 'gaiola' ? 0 : 7919));
  const dia = diaBR(c * CICLO_MERCADO), lista = [], usadas = new Set(), pool = ESPECIES.filter(e => mercadoDe(e.id) === tipo);
  const novo = (e, sx) => lista.push(animalDoMercado(`${c}-${tipo}-${lista.length}`, e, sx, dia, r));
  if(tipo === 'gaiola'){
    const baratas = pool.filter(e => e.p <= 15), e = baratas[Math.floor(r() * baratas.length)];
    usadas.add(e.id); novo(e, 'M'); novo(e, 'F');
  }
  while(lista.length < ANIMAIS_NO_MERCADO){
    const e = tipo === 'gaiola' ? sorteiaPorPreco(r, pool) : sorteiaEspecie(r, usadas, pool); usadas.add(e.id);
    const grupo = Math.min(1 + Math.floor(r() * 3), ANIMAIS_NO_MERCADO - lista.length);
    for(let i = 0; i < grupo; i++) novo(e, r() < .5 ? 'M' : 'F');
  }
  lista.sort((a, b) => ESP[a.esp].p - ESP[b.esp].p);
  return mercadoCache[tipo] = lista;
}
const oferta = key => mercado(agora(), 'gaiola').concat(mercado(agora(), 'outros')).find(o => o.id === key) || null;
function jaComprado(key){
  return S.comprados.ciclo === cicloDe(agora()) && S.comprados.lista.includes(key);
}

/* ---------- TERRENO ---------- */
// S.terrenos = lista dos que o jogador tem, {id, tipo}; cada animal guarda em a.ter o id de onde mora.
// Só se compra animal com vaga: o terreno precisa aceitar a espécie, ter lugar e, na gaiola, não ter outra espécie.
const terrenoDe = esp => TERRENO[ESP[esp].terreno];
const instancia = id => S.terrenos.find(t => t.id === id);
const instAtual = () => instancia(S.terrenoAtual) || S.terrenos[0];
const animaisDoTerreno = id => S.animais.filter(a => a.ter === id);
const especiesDoTerreno = id => [...new Set(animaisDoTerreno(id).map(a => a.esp))];
const especiesNoTerreno = () => [...new Set(S.animais.map(a => a.esp))];
const qtdDoTipo = tipo => S.terrenos.filter(t => t.tipo === tipo).length;
const nomeInst = t => { const l = S.terrenos.filter(x => x.tipo === t.tipo); return TERRENO[t.tipo].n + (l.length > 1 ? ' ' + (l.indexOf(t) + 1) : ''); };
// Lugares já usados: animais + filhote a caminho de cada casal tentando ou grávido, para o filhote sempre ter onde nascer
const ocupados = id => animaisDoTerreno(id).length + S.casais.filter(c => c.fase !== 'pronto' && (animal(c.f) || {}).ter === id).length;
const livres = t => TERRENO[t.tipo].cap - ocupados(t.id);
function cabeEm(esp, t){
  const T = TERRENO[t.tipo];
  if(!moraEm(esp, t.tipo) || livres(t) <= 0) return false;
  return !T.unica || especiesDoTerreno(t.id).every(e => e === esp);
}
// Onde um animal novo desta espécie vai morar: primeiro onde já há outros iguais
function vagaPara(esp){
  const l = S.terrenos.filter(t => cabeEm(esp, t));
  return l.find(t => especiesDoTerreno(t.id).includes(esp)) || l[0] || null;
}
function motivoSemVaga(esp){
  const e = ESP[esp], meus = S.terrenos.filter(t => moraEm(esp, t.tipo));
  if(!meus.length) return `${e.n} não cabe nos seus terrenos. Precisa de: ${terrenoDe(esp).n}.`;
  if(meus.some(t => especiesDoTerreno(t.id).includes(esp))) return `${nomeInst(meus[0])} sem vaga. Venda um animal ou compre outro terreno.`;
  return `Sem vaga: ${nomeInst(meus[0])} já tem outra espécie. Compre outro terreno para ${e.n}.`;
}
const precoTerreno = tipo => TERRENO[tipo].preco * (tipo === 'gaiola' ? qtdDoTipo(tipo) : qtdDoTipo(tipo) + 1); // o primeiro é o preço base; a primeira gaiola é de graça
function comprarTerreno(tipo){
  const T = TERRENO[tipo];
  if(!T) return 'Terreno não encontrado.';
  const p = precoTerreno(tipo);
  if(S.dinheiro < p) return `Faltam ${eur(p - S.dinheiro)} para comprar ${T.n}.`;
  S.dinheiro = cent(S.dinheiro - p);
  const t = {id: 't' + S.seq++, tipo};
  S.terrenos.push(t);
  diario(`Comprou ${nomeInst(t)} por ${eur(p)}.`);
  return t.id;
}

/* ---------- COMPRA E VENDA ---------- */
// Devolve '' se deu certo, ou o motivo.
function comprar(key){
  const c = cicloDe(agora());
  if(S.comprados.ciclo !== c) S.comprados = {ciclo: c, lista: []};
  const o = oferta(key);
  if(!o) return 'Esta oferta já saiu do mercado.';
  if(jaComprado(key)) return 'Este animal já foi comprado.';
  const lugar = vagaPara(o.esp);
  if(!lugar) return motivoSemVaga(o.esp);
  const p = precoCompra(o);
  if(S.dinheiro < p) return `Faltam ${eur(p - S.dinheiro)}.`;
  S.dinheiro = cent(S.dinheiro - p);
  S.animais.push(Object.assign({}, o, {id: 'a' + S.seq++, ter: lugar.id, st: Object.assign({}, o.st)}));
  S.comprados.lista.push(key);
  registraConquista(S.animais[S.animais.length - 1]);
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
  diario(`Vendeu ${ESP[a.esp].n} ${sexoS(a.sx)} (nota ${fmtNota(notaDe(a))}, ${anos(idadeDe(a))}) por ${eur(v)}.`);
  return '';
}
const patrimonio = () => cent(S.dinheiro + S.animais.reduce((t, a) => t + precoVenda(a), 0));
