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

/* ---------- TRISTEZA ---------- */
// O que deixa uma espécie triste no terreno agora. Terreno maior pesa menos na mistura de espécies.
function humor(esp){
  const cont = {};
  for(const a of S.animais) cont[a.esp] = (cont[a.esp] || 0) + 1;
  const ids = Object.keys(cont);
  const r = {total: 0, mistura: 0, deseq: 0, medo: 0, predadores: []};
  if(ids.length > 1){
    const v = ids.map(k => cont[k]), maior = Math.max(...v), menor = Math.min(...v);
    r.mistura = TRISTE_MISTURA * (ids.length - 1) / Math.max(1, espacosTotal() - 1);
    r.deseq = Math.min(TRISTE_DESEQ, (maior / menor - 1) * TRISTE_DESEQ_POR);
    r.predadores = ids.filter(k => come(k, esp));
    if(r.predadores.length) r.medo = TRISTE_MEDO;
  }
  r.total = Math.round(Math.min(100, r.mistura + r.deseq + r.medo));
  return r;
}
const penalidade = t => Math.floor(t / TRISTE_POR_PONTO);
const nomeHumor = t => t < 15 ? 'Feliz' : t < 40 ? 'Tranquilo' : t < 70 ? 'Triste' : 'Muito triste';
function filhoteDoCasal(m, f){
  const st = fundeStatus(m.st, f.st), pen = penalidade(humor(f.esp).total);
  for(const [k] of STATUS) st[k] = Math.round(clamp(st[k] - pen * (.7 + Math.random() * .6), 0, 100));
  return {st, pen};
}

/* ---------- CAÇA ---------- */
let avisosCaca = []; // o que aconteceu desde o último tick, para avisar na tela
function devora(pred, presa){
  const c = casalDe(presa.id), nome = ESP[presa.esp].n;
  if(c && c.fase === 'gravida' && presa.id === c.m) c.m = '';
  else if(c){
    if(c.fase === 'gravida') diario(`${nome}: a gestação foi perdida.`);
    desfazCasal(c);
  }
  if(typeof efeitoDevorado === 'function') efeitoDevorado(presa.id);
  S.animais = S.animais.filter(x => x !== presa); S.devorados++;
  const txt = `${ESP[pred.esp].n} ${sexoS(pred.sx)} comeu ${nome} ${sexoS(presa.sx)}.`;
  diario(txt); avisosCaca.push(txt);
}
// Coloca a caça em dia, de CACA_PASSO em CACA_PASSO. Quanto mais forte o predador e menos ágil a presa, maior a chance.
function cacar(t){
  if(!S.tCaca){ S.tCaca = t; return false; }
  const passos = Math.floor((t - S.tCaca) / CACA_PASSO);
  if(passos <= 0) return false;
  S.tCaca += passos * CACA_PASSO;
  let mudou = false;
  for(let i = Math.max(0, passos - CACA_MAX_PASSOS); i < passos; i++){
    const h = S.tCaca - (passos - 1 - i) * CACA_PASSO;
    for(const a of S.animais.slice()){
      if(!ESP[a.esp].caca || !animal(a.id) || morreEm(a) <= h || idadeDe(a, h) < IDADE_FERTIL) continue;
      if(a.comeu && h - a.comeu < FOME) continue;
      const presas = S.animais.filter(b => come(a.esp, b.esp) && morreEm(b) > h);
      if(!presas.length) continue;
      const b = presas[Math.floor(Math.random() * presas.length)];
      if(Math.random() < clamp(.35 + (a.st.for - b.st.agi) / 200, .1, .9)){
        devora(a, b); a.comeu = h; mudou = true;
      }
    }
  }
  return mudou;
}

// Coloca o jogo em dia até o horário t: gravidez, parto, caça e mortes. Devolve true se algo mudou.
function processar(t = agora()){
  let mudou = false;
  for(const c of S.casais.slice()){
    const m = animal(c.m), f = animal(c.f), nome = ESP[(m || f || {esp:'gato'}).esp].n;
    if(c.fase === 'tentando' && t >= c.tGrav){
      if(!m || !f || morreEm(m) <= c.tGrav || morreEm(f) <= c.tGrav) continue; // a morte, abaixo, desfaz o casal
      const fi = filhoteDoCasal(m, f);
      c.fase = 'gravida'; c.tParto = c.tGrav + PARTO; c.filho = fi.st; c.pen = fi.pen;
      diario(`${nome}: a fêmea está grávida! O filhote nasce em 1 hora.${fi.pen ? ' Como o casal está triste, ele vai nascer mais fraco.' : ''}`);
      mudou = true;
    }
    if(c.fase === 'gravida' && t >= c.tParto){
      if(!f || morreEm(f) <= c.tParto) continue;
      const d = diaBR(c.tParto);
      const filho = {id: 'a' + S.seq++, esp: f.esp, sx: Math.random() < .5 ? 'M' : 'F', st: c.filho, dia0: d, idade0: 0, pen: c.pen || 0};
      S.animais.push(filho); S.nascidos++;
      nascimentosNovos.push(filho.id);
      diario(`${nome}: nasceu ${filho.sx === 'M' ? 'um macho' : 'uma fêmea'}, nota ${fmtNota(notaDe(filho))}.`);
      c.fase = 'pronto'; c.filho = null;
      if(!m) desfazCasal(c);
      mudou = true;
    }
  }
  if(cacar(t)) mudou = true;
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
