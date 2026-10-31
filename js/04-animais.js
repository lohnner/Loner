// Animais: idade, morte, nota, valor em euros e a fusão genética dos pais.
// Um animal = {id, esp, sx:'M'|'F', st:{for,agi,int,sau,bel}, nasc}: nasc = hora (ms) em que tinha 0 anos. dia0/idade0 são de saves antigos (ver normalize).
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
// Idade em anos com fração (1 ano = ANO; 1 mês = MES). Cada animal envelhece desde o próprio nascimento.
const idadeDe = (a, t = agora()) => Math.max(0, (t - a.nasc) / ANO);
// Morre quando completa a expectativa de vida da espécie.
const morreEm = a => a.nasc + ESP[a.esp].vida * ANO;
const fertil = a => idadeDe(a) >= IDADE_FERTIL;
const fertilEm = a => a.nasc + IDADE_FERTIL * ANO;
// "2 anos e 5 meses", "1 ano", "7 meses", "1 mês", "menos de 1 mês"
function fmtIdade(a, t = agora()){
  const meses = Math.floor(idadeDe(a, t) * 12 + 1e-9), y = Math.floor(meses / 12), m = meses % 12;
  const ms = m === 1 ? '1 mês' : m + ' meses';
  return y && m ? `${anos(y)} e ${ms}` : y ? anos(y) : m ? ms : 'menos de 1 mês';
}
// Tempo longo em texto: "4 dias e 3h", "5h 20min"
function tempoLongo(ms){
  const d = Math.floor(ms / DIA), h = Math.floor(ms % DIA / 3600e3);
  return d ? `${d} ${d === 1 ? 'dia' : 'dias'}${h ? ` e ${h}h` : ''}` : tempo(ms);
}
// Tempo de vida que falta, em texto de dias reais
function restaVida(a, t = agora()){
  const falta = morreEm(a) - t;
  return falta < DIA ? `morre em ${tempo(falta)}` : `vive mais ${tempoLongo(falta)} reais`;
}
// Tamanho no desenho 3D: o filhote nasce com 45% e cresce até virar adulto (ADULTO_FRACAO da vida).
function tamanhoIdade(a, t = agora()){
  const adulto = Math.max(IDADE_FERTIL, ESP[a.esp].vida * ADULTO_FRACAO);
  return .45 + .55 * Math.sqrt(Math.min(1, idadeDe(a, t) / adulto));
}
// Muito raro: nota nos 10% de cima da faixa da espécie. Ganha cor dourada no terreno.
const muitoRaro = a => posNota(a) >= 90;
// Conquista: guarda em S.conq[esp][sx] o animal de nota mais alta daquela espécie e sexo que o jogador já teve (comprado ou nascido).
// Fica guardado mesmo depois de vender ou morrer. Empate na nota: vale a maior média de status.
function registraConquista(a, s = S){
  if(!a || !ESP[a.esp] || (a.sx !== 'M' && a.sx !== 'F')) return false;
  const porEsp = s.conq[a.esp] || (s.conq[a.esp] = {}), velho = porEsp[a.sx];
  if(velho && ESP[a.esp] && (notaDe({esp: a.esp, st: velho.st}) > notaDe(a) || (notaDe({esp: a.esp, st: velho.st}) === notaDe(a) && mediaSt(velho.st) >= mediaSt(a.st)))) return false;
  porEsp[a.sx] = {st: Object.assign({}, a.st), t: agora()};
  return true;
}
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
