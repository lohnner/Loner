// Acasalamento e o passar do tempo. Tudo é guardado com horários, então continua correndo com o jogo fechado.
// Casal = {id, m, f, fase, tGrav, tParto, filho}. fase: 'tentando' (sorteia de 1 a 3 h) → 'gravida' (1 h) → 'pronto' (nasceu; pode acasalar de novo).
'use strict';

const casalDe = id => S.casais.find(c => c.m === id || c.f === id);
const animal = id => S.animais.find(a => a.id === id);
// Filhotes que nasceram e ainda não foram mostrados na tela
let nascimentosNovos = [];

function iniciaTentativa(c, t = agora()){
  c.fase = 'tentando'; c.inicio = t; c.filho = null; c.tParto = 0;
  c.tGrav = t + GRAVIDEZ_MIN + Math.random() * (GRAVIDEZ_MAX - GRAVIDEZ_MIN);
}
function motivoCasal(m, f){
  if(!m || !f) return 'Escolha um macho e uma fêmea.';
  if(m.sx !== 'M' || f.sx !== 'F') return 'Precisa ser um macho e uma fêmea.';
  if(m.esp !== f.esp) return 'Os dois precisam ser da mesma espécie.';
  if(casalDe(m.id) || casalDe(f.id)) return 'Um deles já está acasalando.';
  if(!fertil(m) || !fertil(f)) return `Filhote só acasala a partir de ${anos(IDADE_FERTIL)} (1 dia real).`;
  return '';
}
function formaCasal(mid, fid){
  const m = animal(mid), f = animal(fid), erro = motivoCasal(m, f);
  if(erro) return erro;
  const c = {id: 'k' + S.seq++, m: mid, f: fid};
  iniciaTentativa(c);
  S.casais.push(c);
  diario(`${ESP[m.esp].n}: casal colocado para acasalar.`);
  return '';
}
function desfazCasal(c){ S.casais = S.casais.filter(x => x !== c); }
function repetir(c){
  if(c.fase !== 'pronto') return;
  const m = animal(c.m), f = animal(c.f);
  if(m && f) iniciaTentativa(c);
}
const pareados = () => S.casais.filter(c => c.fase === 'pronto' && animal(c.m) && animal(c.f));

// Coloca o jogo em dia até o horário t: gravidez, parto e mortes (por ordem de cada casal). Devolve true se algo mudou.
function processar(t = agora()){
  let mudou = false;
  for(const c of S.casais.slice()){
    const m = animal(c.m), f = animal(c.f), nome = ESP[(m || f || {esp:'gato'}).esp].n;
    if(c.fase === 'tentando' && t >= c.tGrav){
      if(!m || !f || morreEm(m) <= c.tGrav || morreEm(f) <= c.tGrav) continue; // a morte, abaixo, desfaz o casal
      c.fase = 'gravida'; c.tParto = c.tGrav + PARTO; c.filho = fundeStatus(m.st, f.st);
      diario(`${nome}: a fêmea está grávida! O filhote nasce em 1 hora.`);
      mudou = true;
    }
    if(c.fase === 'gravida' && t >= c.tParto){
      if(!f || morreEm(f) <= c.tParto) continue;
      const d = diaBR(c.tParto);
      const filho = {id: 'a' + S.seq++, esp: f.esp, sx: Math.random() < .5 ? 'M' : 'F', st: c.filho, dia0: d, idade0: 0};
      S.animais.push(filho); S.nascidos++;
      nascimentosNovos.push(filho.id);
      diario(`${nome}: nasceu ${filho.sx === 'M' ? 'um macho' : 'uma fêmea'}, classificação ${rankDe(filho.st)}.`);
      c.fase = 'pronto'; c.filho = null;
      if(!m) desfazCasal(c);
      mudou = true;
    }
  }
  for(const a of S.animais.slice()){
    if(morreEm(a) > t) continue;
    const c = casalDe(a.id);
    if(c && c.fase === 'gravida' && a.id === c.m){ c.m = ''; } // o pai morreu, mas a gestação continua
    else if(c){
      if(c.fase === 'gravida') diario(`${ESP[a.esp].n}: a fêmea morreu durante a gestação.`);
      desfazCasal(c);
    }
    S.animais = S.animais.filter(x => x !== a); S.mortos++;
    diario(`${ESP[a.esp].n} ${sexoS(a.sx)} morreu de velhice aos ${anos(ESP[a.esp].vida)}.`);
    mudou = true;
  }
  if(!S.animais.length && S.dinheiro < AJUDA_LIMITE){
    S.dinheiro = cent(S.dinheiro + AJUDA_VALOR);
    diario(`Ajuda para recomeçar: você recebeu ${eur(AJUDA_VALOR)}.`);
    mudou = true;
  }
  return mudou;
}
