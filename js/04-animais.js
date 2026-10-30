// Animais: idade, morte, nota, valor em euros e a fusão genética dos pais.
// Um animal = {id, esp, sx:'M'|'F', st:{for,agi,int,sau,bel}, dia0, idade0}: tinha idade0 anos no dia dia0 (dia de Brasília).
'use strict';

const mediaSt = st => STATUS.reduce((t, [k]) => t + st[k], 0) / STATUS.length;
// Nota do animal: sai da média dos status, dentro da faixa da espécie (ex.: gato vai de 15 a 27).
function notaDe(a){
  const e = ESP[a.esp];
  return Math.round(e.nmin + (e.nmax - e.nmin) * mediaSt(a.st) / 100);
}
function posNota(a){
  const e = ESP[a.esp];
  return (notaDe(a) - e.nmin) / (e.nmax - e.nmin) * 100;
}
const fmtNota = n => n.toLocaleString('pt-BR');
const idadeDe = (a, t = agora()) => a.idade0 + diaBR(t) - a.dia0;
// Morre na meia-noite de Brasília em que completa a expectativa de vida da espécie.
const morreEm = a => inicioDiaBR(a.dia0 + ESP[a.esp].vida - a.idade0);
const fertil = a => idadeDe(a) >= IDADE_FERTIL;
const sexoN = sx => sx === 'M' ? 'Macho' : 'Fêmea';
const sexoS = sx => sx === 'M' ? '♂' : '♀';

// Quanto mais velho, mais barato: de 100% ao nascer até IDADE_PISO no fim da vida.
function fatorIdade(idade, vida){ return Math.max(IDADE_PISO, 1 - (1 - IDADE_PISO) * idade / vida); }
function multNota(pos){
  for(let i = 1; i < CURVA_PRECO.length; i++){
    const [a, va] = CURVA_PRECO[i - 1], [b, vb] = CURVA_PRECO[i];
    if(pos <= b) return va + (vb - va) * (pos - a) / (b - a);
  }
  return CURVA_PRECO[CURVA_PRECO.length - 1][1];
}
// Valor sem o índice do mercado
function valorDe(a, t = agora()){
  const e = ESP[a.esp];
  return e.p * multNota(posNota(a)) * fatorIdade(idadeDe(a, t), e.vida);
}
const precoCompra = (a, t = agora()) => Math.max(1, cent(valorDe(a, t) * indice(a.esp, t) * MARGEM_COMPRA));
const precoVenda = (a, t = agora()) => Math.max(.5, cent(valorDe(a, t) * indice(a.esp, t) * MARGEM_VENDA));

// Fusão dos dois: cada status sai sorteado entre o do pai e o da mãe, com uma variação; às vezes vem uma mutação boa.
const MUTA_MENOS = 5, MUTA_MAIS = 7, MUTA_RARA = .05;
function fundeStatus(pai, mae, r = Math.random){
  const st = {};
  for(const [k] of STATUS){
    let v = pai[k] + (mae[k] - pai[k]) * r() + (r() * (MUTA_MENOS + MUTA_MAIS) - MUTA_MENOS);
    if(r() < MUTA_RARA) v += 10 + r() * 10;
    st[k] = Math.round(clamp(v, 0, 100));
  }
  return st;
}
// Status de um animal do mercado com média dentro da faixa sorteada
function statusDaFaixa(alvo, r){
  const st = {};
  for(const [k] of STATUS) st[k] = clamp(alvo + (r() - .5) * 26, 0, 100);
  for(let i = 0; i < 6; i++){
    const dif = alvo - mediaSt(st);
    for(const [k] of STATUS) st[k] = clamp(st[k] + dif, 0, 100);
  }
  for(const [k] of STATUS) st[k] = Math.round(st[k]);
  return st;
}
