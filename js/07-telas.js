// Telas: Mercado, Animais (inventário e terreno), Acasalar, Wikipédia e Conta; janelas de detalhe; todas as ações de botão (ACT).
// Botões chamam ações por data-act="nome" + data-v="valor" → ACT.nome(valor).
'use strict';

let aba = 'mercado', filtroMercado = 'todas', wikiBusca = '';
let parEscolhido = {M: '', F: ''}, armado = {id: '', ate: 0}, sheetAberta = null, toastT = 0;

const foto = (id, cls = '') => `<img class="foto ${cls}" src="${fotoEsp(id)}" alt="${esc(ESP[id].n)}" width="360" height="360" loading="lazy">`;
const selo = st => { const r = rankDe(st); return `<span class="rank r${r}">${r}</span>`; };
const sexo = sx => `<span class="sx ${sx === 'M' ? 'sxM' : 'sxF'}" aria-label="${sexoN(sx)}">${sexoS(sx)}</span>`;
const barrasStatus = st => `<div class="stats">${STATUS.map(([k, n]) => `<div class="st"><span>${n}</span><i><b style="width:${st[k]}%" class="${corStatus(st[k])}"></b></i><em>${st[k]}</em></div>`).join('')}</div>`;
const corStatus = v => 'b' + (RANKS.find(x => v >= x.de) || RANKS[5]).r;
function setaIndice(esp){
  const pc = Math.round((indice(esp) - 1) * 100);
  return `<span class="tend ${pc >= 0 ? 'sobe' : 'desce'}">${pc >= 0 ? '▲' : '▼'} ${pc > 0 ? '+' : ''}${pc}%</span>`;
}

function toast(txt, erro){
  const el = $('#toast');
  el.textContent = txt; el.className = erro ? 'erro' : ''; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, erro ? 3800 : 2600);
}

/* ---------- MERCADO ---------- */
function telaMercado(){
  const t = agora();
  let lista = mercado(t);
  if(filtroMercado === 'minhas') lista = lista.filter(l => especiesNoTerreno().includes(l.esp));
  if(filtroMercado === 'posso') lista = lista.filter(l => ['M', 'F'].some(sx => !jaComprado(l[sx].id) && precoCompra(l[sx], t) <= S.dinheiro));
  const chip = (id, n) => `<button class="chip ${filtroMercado === id ? 'on' : ''}" data-act="filtroMercado" data-v="${id}">${n}</button>`;
  return `<div class="faixa"><span>Novas ofertas em <b data-fim="${fimDoCiclo(t)}"></b></span><span class="dim">${especiesNoTerreno().length}/${espacosTotal()} espécies no terreno</span></div>
    <div class="chips">${chip('todas', 'Todas')}${chip('posso', 'Posso pagar')}${chip('minhas', 'Minhas espécies')}</div>
    ${lista.length ? lista.map(cartaoMercado).join('') : `<p class="vazio">Nenhuma oferta com esse filtro agora. O mercado muda em instantes.</p>`}`;
}
function cartaoMercado(l){
  const e = ESP[l.esp], t = agora();
  const lin = o => {
    const foi = jaComprado(o.id);
    return `<button class="oferta" data-act="verOferta" data-v="${o.id}" ${foi ? 'disabled' : ''}>
      ${sexo(o.sx)}${selo(o.st)}<span class="of-id">${anos(idadeDe(o, t))}</span>
      <span class="preco">${foi ? 'Comprado' : eur(precoCompra(o, t))}</span></button>`;
  };
  const podeCasal = !jaComprado(l.M.id) && !jaComprado(l.F.id);
  const total = cent(precoCompra(l.M, t) + precoCompra(l.F, t));
  return `<article class="card">
    <div class="card-top" data-act="verEspecie" data-v="${e.id}">${foto(e.id)}<div class="card-tit"><h3>${esc(e.n)}</h3>
      <small><span class="cat c-${categoria(e).id}">${categoria(e).n}</span> Vive ${anos(e.vida)} ${setaIndice(e.id)}</small></div></div>
    ${lin(l.M)}${lin(l.F)}
    ${podeCasal ? `<button class="btn par" data-act="comprarCasal" data-v="${l.M.id}|${l.F.id}">Comprar o casal · ${eur(total)}</button>` : ''}
  </article>`;
}

/* ---------- ANIMAIS: TERRENO E INVENTÁRIO ---------- */
function terrenoHTML(){
  const nele = especiesNoTerreno(), tot = espacosTotal(), max = tot >= ESPACOS_MAX;
  const mostra = Math.max(tot, nele.length);
  let vagas = '';
  for(let i = 0; i < mostra; i++) vagas += nele[i] ? `<span class="vaga cheia">${foto(nele[i])}</span>` : `<span class="vaga"></span>`;
  return `<section class="terreno"><div class="ter-top"><h3>Seu terreno</h3><b>${nele.length}/${tot} espécies</b></div>
    <div class="vagas">${vagas}</div>
    ${max ? '' : `<button class="btn ${S.dinheiro >= precoProximoEspaco() ? 'pri' : ''}" data-act="comprarEspaco">Comprar mais 1 espaço · ${eur(precoProximoEspaco())}</button>`}
  </section>`;
}
function chipsAnimal(a){
  const c = casalDe(a.id), id = idadeDe(a), vida = ESP[a.esp].vida;
  let h = '';
  if(c) h += `<span class="tag ${c.fase === 'gravida' && a.id === c.f ? 'gra' : 'aca'}">${c.fase === 'gravida' ? (a.id === c.f ? 'Grávida' : 'Pai') : c.fase === 'tentando' ? 'Acasalando' : 'Em casal'}</span>`;
  if(id < IDADE_FERTIL) h += `<span class="tag fil">Filhote</span>`;
  if(vida - id <= 1) h += `<span class="tag mor">Morre à meia-noite</span>`;
  return h;
}
function linhaAnimal(a, acao = 'verAnimal'){
  return `<button class="ani" data-act="${acao}" data-v="${a.id}">${sexo(a.sx)}${selo(a.st)}
    <span class="ani-tx"><b>${anos(idadeDe(a))}<em> de ${ESP[a.esp].vida}</em></b><small>${chipsAnimal(a) || `Média ${Math.round(mediaSt(a.st))}`}</small></span>
    <span class="preco">${eur(precoVenda(a))}</span></button>`;
}
function telaAnimais(){
  let h = terrenoHTML();
  const nele = especiesNoTerreno();
  if(!nele.length) return h + `<p class="vazio">Seu terreno está vazio. Compre um macho e uma fêmea da mesma espécie no Mercado.</p><button class="btn pri cheio" data-act="aba" data-v="mercado">Ir ao Mercado</button>`;
  for(const id of nele.sort((a, b) => ESP[b].p - ESP[a].p)){
    const lista = S.animais.filter(a => a.esp === id).sort((a, b) => precoVenda(b) - precoVenda(a));
    h += `<article class="card"><div class="card-top" data-act="verEspecie" data-v="${id}">${foto(id)}<div class="card-tit"><h3>${esc(ESP[id].n)}</h3>
      <small>${lista.length} ${lista.length === 1 ? 'animal' : 'animais'} · vive ${anos(ESP[id].vida)} ${setaIndice(id)}</small></div></div>${lista.map(a => linhaAnimal(a)).join('')}</article>`;
  }
  return h;
}

/* ---------- ACASALAR ---------- */
function telaAcasalar(){
  const m = animal(parEscolhido.M), f = animal(parEscolhido.F), espera = S.casais.filter(c => animal(c.f));
  const lado = (sx, a) => `<button class="lado ${a ? 'tem' : ''}" data-act="escolherLado" data-v="${sx}">
    ${a ? `${foto(a.esp)}<span>${sexo(sx)}${selo(a.st)}</span><small>${anos(idadeDe(a))}</small>` : `<span class="vazio-sx">${sexoS(sx)}</span><b>Escolher ${sexoN(sx).toLowerCase()}</b>`}</button>`;
  const erro = (m && f) ? motivoCasal(m, f) : '';
  const prontos = pareados().length;
  return `<section class="acasalar"><h3>Novo casal</h3><p class="dim">Coloque um macho e uma fêmea da mesma espécie. A gravidez vem entre 1 e 3 horas, e o filhote nasce 1 hora depois.</p>
    <div class="lados">${lado('M', m)}<span class="cruza">+</span>${lado('F', f)}</div>
    ${erro ? `<p class="aviso">${esc(erro)}</p>` : ''}
    <button class="btn pri cheio" data-act="acasalar" ${m && f && !erro ? '' : 'disabled'}>Colocar para acasalar</button></section>
    <div class="ter-top sec"><h3>Casais</h3>${prontos > 1 ? `<button class="chip on" data-act="repetirTodos">Acasalar os ${prontos} de novo</button>` : ''}</div>
    ${espera.length ? espera.map(cartaoCasal).join('') : `<p class="vazio">Nenhum casal ainda.</p>`}`;
}
function cartaoCasal(c){
  const m = animal(c.m), f = animal(c.f), e = ESP[f.esp], t = agora();
  let corpo;
  if(c.fase === 'tentando'){
    corpo = `<p class="fase"><b>Tentando engravidar</b> há <span data-desde="${c.inicio}"></span></p>
      <div class="prog ind"><i data-barra="${c.inicio}|${c.inicio + GRAVIDEZ_MAX}"></i></div>
      <button class="btn" data-act="separar" data-v="${c.id}">Separar o casal</button>`;
  } else if(c.fase === 'gravida'){
    corpo = `<p class="fase gra"><b>Ela está grávida!</b> Nasce em <span data-fim="${c.tParto}"></span></p>
      <div class="prog"><i data-barra="${c.tParto - PARTO}|${c.tParto}"></i></div>`;
  } else {
    corpo = `<p class="fase"><b>Filhote nasceu.</b> O casal está pronto de novo.</p>
      <div class="dois"><button class="btn pri" data-act="repetir" data-v="${c.id}">Acasalar de novo</button><button class="btn" data-act="separar" data-v="${c.id}">Separar</button></div>`;
  }
  return `<article class="card casal"><div class="card-top" data-act="verEspecie" data-v="${e.id}">${foto(e.id)}<div class="card-tit"><h3>${esc(e.n)}</h3>
    <small>${m ? `${sexo('M')}${selo(m.st)} ${anos(idadeDe(m, t))}` : 'O pai morreu'} &nbsp; ${sexo('F')}${selo(f.st)} ${anos(idadeDe(f, t))}</small></div></div>${corpo}</article>`;
}

/* ---------- WIKIPÉDIA ---------- */
function telaWiki(){
  const cats = CATEGORIAS.map(c => {
    const l = ESPECIES.filter(e => categoria(e).id === c.id);
    return `<h3 class="wk-cat" data-cat="${c.id}"><span class="cat c-${c.id}">${c.n}</span> <small>${l.length} espécies</small></h3>
      <div class="wk-grade" data-grade="${c.id}">${l.map(e => `<button class="wk" data-act="verEspecie" data-v="${e.id}" data-n="${esc((e.n + ' ' + e.c).toLowerCase())}">${foto(e.id)}<b>${esc(e.n)}</b><small>${eur(e.p)} · ${anos(e.vida)}</small></button>`).join('')}</div>`;
  }).join('');
  return `<input class="busca" id="wikiBusca" type="search" placeholder="Procurar espécie" aria-label="Procurar espécie" value="${esc(wikiBusca)}">${cats}`;
}
function filtraWiki(){
  const q = wikiBusca.trim().toLowerCase();
  document.querySelectorAll('.wk').forEach(b => { b.hidden = q && !b.dataset.n.includes(q); });
  document.querySelectorAll('.wk-grade').forEach(g => {
    const algum = [...g.children].some(b => !b.hidden);
    g.hidden = !algum; document.querySelector(`.wk-cat[data-cat="${g.dataset.grade}"]`).hidden = !algum;
  });
}
function sheetEspecie(id){
  const e = ESP[id], cr = CREDITOS[id] || {};
  const li = (k, v) => `<div class="wk-li"><span>${k}</span><b>${v}</b></div>`;
  return `<img class="sh-foto" src="${fotoEsp(id)}" alt="${esc(e.n)}" width="360" height="360">
    <h2>${esc(e.n)}</h2><p class="cient">${esc(e.c)}</p>
    <div class="wk-tab">
      ${li('Categoria', categoria(e).n)}
      ${li('Quanto vive', `${anos(e.vida)} (${e.vida} dias reais)`)}
      ${li('Preço de referência', `${eur(e.p)} ${setaIndice(id)}`)}
      ${li('Habitat', esc(e.hab))}
      ${li('Alimentação', esc(e.die))}
      ${li('Gestação real', esc(e.ges))}
    </div>
    <p class="nota">${esc(e.nota)}</p>
    <p class="cred">Foto: ${esc(cr.autor || 'Wikimedia Commons')} · ${esc(cr.licenca || '')} · <a href="${esc(cr.url || '#')}" target="_blank" rel="noopener">ver original</a></p>`;
}

/* ---------- CONTA ---------- */
function telaConta(){
  const li = (k, v) => `<div class="wk-li"><span>${k}</span><b>${v}</b></div>`;
  return `<section class="pat"><small>Patrimônio (dinheiro + animais)</small><strong>${eur(patrimonio())}</strong></section>
    <div class="wk-tab">
      ${li('Filhotes nascidos', S.nascidos)}${li('Animais vendidos', S.vendidos)}${li('Total em vendas', eur(S.receita))}${li('Mortes por velhice', S.mortos)}
    </div>
    <details class="regras"><summary>Como jogar</summary><ul>
      <li>Compre um macho e uma fêmea da mesma espécie no Mercado. Ele muda a cada 5 minutos.</li>
      <li>Coloque os dois em Acasalar. A gravidez vem entre 1 e 3 horas, e o filhote nasce 1 hora depois.</li>
      <li>Os 5 status vão de 0 a 100, e a média dá a classificação, de E a S. O filhote é uma fusão sorteada dos pais.</li>
      <li>Cada meia-noite de Brasília vale 1 ano. Mais novo vale mais; ao chegar à idade máxima, o animal morre.</li>
      <li>Venda em Animais. Filhotes de pais fortes dão mais lucro.</li>
      <li>O terreno começa com 3 espécies. Compre mais espaço para criar outras.</li>
    </ul></details>
    <h3 class="sec-t">Diário</h3>
    <ol class="diario">${S.diario.length ? S.diario.map(d => `<li><time>${new Date(d.t - FUSO_BR).toISOString().slice(8, 10)}/${new Date(d.t - FUSO_BR).toISOString().slice(5, 7)} ${horaBR(d.t)}</time>${esc(d.txt)}</li>`).join('') : '<li class="dim">Nada ainda.</li>'}</ol>
    <p class="dim conta-mail">${esc(contaEmail())}</p>
    <button class="btn cheio" data-act="logout">Sair da conta</button>`;
}

/* ---------- JANELAS ---------- */
function abreSheet(tipo, v){
  sheetAberta = {tipo, v};
  renderSheet();
  $('#sheet').hidden = false;
}
function fechaSheet(){
  sheetAberta = null; armado = {id: '', ate: 0}; $('#sheet').hidden = true;
  mostraNascimento();
}
function renderSheet(){
  if(!sheetAberta) return;
  const {tipo, v} = sheetAberta;
  let h = '';
  if(tipo === 'especie') h = sheetEspecie(v);
  else if(tipo === 'oferta') h = sheetOferta(v);
  else if(tipo === 'animal' || tipo === 'nasceu') h = sheetAnimal(v, tipo === 'nasceu');
  else if(tipo === 'escolher') h = sheetEscolher(v);
  $('#sheetBody').innerHTML = h;
}
function sheetOferta(key){
  const o = oferta(key);
  if(!o) return `<p class="vazio">Esta oferta já saiu do mercado.</p>`;
  const e = ESP[o.esp], p = precoCompra(o), semEspaco = !temEspaco(o.esp);
  return `<img class="sh-foto" src="${fotoEsp(o.esp)}" alt="${esc(e.n)}" width="360" height="360">
    <h2>${esc(e.n)} ${sexo(o.sx)} ${selo(o.st)}</h2>
    <p class="cient">${anos(idadeDe(o))} de ${e.vida} · morre em ${e.vida - idadeDe(o)} ${e.vida - idadeDe(o) === 1 ? 'dia real' : 'dias reais'}</p>
    ${barrasStatus(o.st)}
    ${semEspaco ? `<p class="aviso">Seu terreno está cheio. Compre mais espaço em Animais ou venda uma espécie.</p>` : ''}
    <button class="btn pri cheio" data-act="comprar" data-v="${o.id}" ${semEspaco || S.dinheiro < p ? 'disabled' : ''}>${S.dinheiro < p ? `Faltam ${eur(p - S.dinheiro)}` : `Comprar por ${eur(p)}`}</button>
    <button class="btn cheio" data-act="verEspecie" data-v="${e.id}">Ver na Wikipédia</button>`;
}
function sheetAnimal(id, novo){
  const a = animal(id);
  if(!a) return `<p class="vazio">Este animal não está mais no seu terreno.</p>`;
  const e = ESP[a.esp], c = casalDe(id), idade = idadeDe(a), arm = armado.id === id && armado.ate > performance.now(), resta = e.vida - idade;
  const presa = c && c.fase === 'gravida';
  return `${novo ? `<p class="nasceu">Nasceu um filhote!</p>` : ''}<img class="sh-foto" src="${fotoEsp(a.esp)}" alt="${esc(e.n)}" width="360" height="360">
    <h2>${esc(e.n)} ${sexo(a.sx)} ${selo(a.st)}</h2>
    <p class="cient">${anos(idade)} de ${e.vida} · ${resta === 1 ? 'morre à meia-noite' : `vive mais ${resta} dias reais`}</p>
    ${barrasStatus(a.st)}
    <button class="btn cheio ${arm ? 'alerta' : 'pri'}" data-act="vender" data-v="${id}" ${presa ? 'disabled' : ''}>${presa ? 'Gestação em andamento' : arm ? `Toque de novo para vender por ${eur(precoVenda(a))}` : `Vender por ${eur(precoVenda(a))}`}</button>
    ${!c && fertil(a) ? `<button class="btn cheio" data-act="levarAcasalar" data-v="${id}">Colocar para acasalar</button>` : ''}
    ${!fertil(a) ? `<p class="dim centro">Filhote: acasala a partir de ${anos(IDADE_FERTIL)}, na próxima meia-noite de Brasília.</p>` : ''}
    ${novo ? `<button class="btn cheio" data-act="fechar">Ficar com ele</button>` : ''}`;
}
function sheetEscolher(sx){
  const outro = animal(parEscolhido[sx === 'M' ? 'F' : 'M']);
  const lista = S.animais.filter(a => a.sx === sx && !casalDe(a.id) && fertil(a) && (!outro || a.esp === outro.esp)).sort((a, b) => ESP[a.esp].n.localeCompare(ESP[b.esp].n) || mediaSt(b.st) - mediaSt(a.st));
  if(!lista.length) return `<h2>Escolher ${sexoN(sx).toLowerCase()}</h2><p class="vazio">${outro ? `Você não tem ${sx === 'M' ? 'macho' : 'fêmea'} livre e adulto de ${esc(ESP[outro.esp].n)}.` : `Você não tem ${sx === 'M' ? 'macho' : 'fêmea'} livre e adulto.`}</p>
    ${outro ? `<button class="btn cheio" data-act="limparPar">Trocar de espécie</button>` : ''}<button class="btn pri cheio" data-act="aba" data-v="mercado">Ir ao Mercado</button>`;
  return `<h2>Escolher ${sexoN(sx).toLowerCase()}</h2>${outro ? `<p class="cient">Só aparecem animais de ${esc(ESP[outro.esp].n)}. <button class="link" data-act="limparPar">Trocar de espécie</button></p>` : ''}
    <div class="escolha">${lista.map(a => `<div class="esc-li">${foto(a.esp)}<div class="esc-tx"><small>${esc(ESP[a.esp].n)}</small>${linhaAnimal(a, 'escolheAnimal')}</div></div>`).join('')}</div>`;
}
function mostraNascimento(){
  if(sheetAberta || !accountReady) return;
  while(nascimentosNovos.length){
    const id = nascimentosNovos.shift();
    if(animal(id)){ abreSheet('nasceu', id); return; }
  }
}

/* ---------- DESENHO ---------- */
const TELAS = {mercado: telaMercado, animais: telaAnimais, acasalar: telaAcasalar, wiki: telaWiki, conta: telaConta};
function renderAba(){
  $('#tela').innerHTML = TELAS[aba]();
  if(aba === 'wiki') filtraWiki();
  document.querySelectorAll('#nav button').forEach(b => {
    const on = b.dataset.v === aba;
    b.classList.toggle('on', on);
    if(on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  atualizaBadge(); atualizaTimers();
}
function atualizaBadge(){
  const n = pareados().length, b = $('#acaBadge');
  b.hidden = !n; b.textContent = n;
}
function atualizaTimers(){
  const t = agora();
  $('#hdDin').textContent = eur(S.dinheiro);
  $('#hdHora').textContent = horaBR(t);
  document.querySelectorAll('[data-fim]').forEach(el => { el.textContent = tempo(+el.dataset.fim - t); });
  document.querySelectorAll('[data-desde]').forEach(el => { el.textContent = tempo(t - +el.dataset.desde); });
  document.querySelectorAll('[data-barra]').forEach(el => {
    const [a, b] = el.dataset.barra.split('|').map(Number);
    el.style.width = clamp((t - a) / (b - a) * 100, 0, 100) + '%';
  });
}
// Uma vez por segundo: coloca o jogo em dia e redesenha só se algo mudou.
let ultimoCiclo = 0, ultimoDia = 0;
function tick(){
  if(!accountReady) return;
  const t = agora(), mudou = processar(t), c = cicloDe(t), d = diaBR(t);
  const virou = c !== ultimoCiclo || d !== ultimoDia;
  ultimoCiclo = c; ultimoDia = d;
  if(mudou) save();
  if(mudou || virou){
    renderAba();
    if(sheetAberta && sheetAberta.tipo !== 'especie') renderSheet();
    mostraNascimento();
  } else atualizaTimers();
}

/* ---------- AÇÕES ---------- */
const ACT = {
  aba(v){ aba = v; if(sheetAberta){ sheetAberta = null; $('#sheet').hidden = true; } renderAba(); $('#tela').scrollTop = 0; },
  fechar(){ fechaSheet(); },
  filtroMercado(v){ filtroMercado = v; renderAba(); },
  verOferta(v){ abreSheet('oferta', v); },
  verEspecie(v){ abreSheet('especie', v); },
  verAnimal(v){ armado = {id: '', ate: 0}; abreSheet('animal', v); },
  comprar(v){
    const erro = comprar([v]);
    if(erro) return toast(erro, true);
    save(); fechaSheet(); renderAba(); toast('Comprado! Veja em Animais.');
  },
  comprarCasal(v){
    const erro = comprar(v.split('|'));
    if(erro) return toast(erro, true);
    const a = S.animais.slice(-2);
    save();
    if(fertil(a[0]) && fertil(a[1])) parEscolhido = {M: a.find(x => x.sx === 'M').id, F: a.find(x => x.sx === 'F').id};
    ACT.aba('acasalar'); toast('Casal comprado. Já está pronto para acasalar.');
  },
  comprarEspaco(){
    const erro = comprarEspaco();
    if(erro) return toast(erro, true);
    save(); renderAba(); toast(`Agora cabem ${espacosTotal()} espécies.`);
  },
  vender(v){
    if(armado.id !== v || armado.ate < performance.now()){ armado = {id: v, ate: performance.now() + 4000}; renderSheet(); return; }
    const a = animal(v), preco = a ? precoVenda(a) : 0, erro = vender(v);
    if(erro) return toast(erro, true);
    for(const sx of ['M', 'F']) if(parEscolhido[sx] === v) parEscolhido[sx] = '';
    save(); fechaSheet(); renderAba(); toast(`Vendido por ${eur(preco)}.`);
  },
  levarAcasalar(v){
    const a = animal(v); if(!a) return;
    const outro = animal(parEscolhido[a.sx === 'M' ? 'F' : 'M']);
    if(outro && outro.esp !== a.esp) parEscolhido = {M: '', F: ''};
    parEscolhido[a.sx] = v;
    ACT.aba('acasalar');
  },
  escolherLado(v){ abreSheet('escolher', v); },
  escolheAnimal(v){
    const a = animal(v); if(!a) return;
    parEscolhido[a.sx] = v;
    fechaSheet(); renderAba();
  },
  limparPar(){ parEscolhido = {M: '', F: ''}; fechaSheet(); renderAba(); },
  acasalar(){
    const erro = formaCasal(parEscolhido.M, parEscolhido.F);
    if(erro) return toast(erro, true);
    parEscolhido = {M: '', F: ''};
    save(); renderAba(); toast('O casal está tentando. A gravidez vem entre 1 e 3 horas.');
  },
  repetir(v){ const c = S.casais.find(x => x.id === v); if(c){ repetir(c); save(); renderAba(); } },
  repetirTodos(){ pareados().forEach(repetir); save(); renderAba(); },
  separar(v){
    const c = S.casais.find(x => x.id === v);
    if(!c || c.fase === 'gravida') return;
    desfazCasal(c); save(); renderAba(); toast('Casal separado.');
  },
  login(){ accountLogin(); },
  logout(){ accountLogout(); },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if(!el || el.disabled) return;
  const f = ACT[el.dataset.act];
  if(f) f(el.dataset.v);
});
document.addEventListener('input', e => {
  if(e.target.id === 'wikiBusca'){ wikiBusca = e.target.value; filtraWiki(); }
});
