// Telas: Mercado, Animais (inventário e terreno), Acasalar, Wikipédia e Conta; janelas de detalhe; todas as ações de botão (ACT).
// Botões chamam ações por data-act="nome" + data-v="valor" → ACT.nome(valor).
'use strict';

let aba = 'mercado', filtroMercado = 'todas', sexoMercado = 'todos', buscaMercado = '', wikiBusca = '';
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
  const sx = (id, n) => `<button class="chip ${sexoMercado === id ? 'on' : ''}" data-act="sexoMercado" data-v="${id}">${n}</button>`;
  const ft = (id, n) => `<button class="chip ${filtroMercado === id ? 'on' : ''}" data-act="filtroMercado" data-v="${id}">${n}</button>`;
  const falta = faltaPar().map(f => `<button class="falta" data-act="buscarMercado" data-v="${f.esp}|${f.sx}">Procurar ${f.sx === 'M' ? 'macho' : 'fêmea'} de ${esc(ESP[f.esp].n)}</button>`).join('');
  return `<div class="faixa"><span>Novas ofertas em <b data-fim="${fimDoCiclo(t)}"></b></span><span class="dim">${especiesNoTerreno().length}/${espacosTotal()} espécies no terreno</span></div>
    <input class="busca" id="buscaMercado" type="search" placeholder="Pesquisar animal" aria-label="Pesquisar animal" value="${esc(buscaMercado)}">
    <div class="chips">${sx('M', '♂ Machos')}${sx('F', '♀ Fêmeas')}${ft('posso', 'Posso pagar')}${ft('minhas', 'Minhas espécies')}</div>
    ${falta}<div id="listaMercado">${listaMercadoHTML()}</div>`;
}
function listaMercadoHTML(){
  const t = agora(), q = semAcento(buscaMercado.trim()), nele = especiesNoTerreno();
  const lista = mercado(t).filter(o => (sexoMercado === 'todos' || o.sx === sexoMercado)
    && (!q || semAcento(ESP[o.esp].n).includes(q))
    && (filtroMercado !== 'minhas' || nele.includes(o.esp))
    && (filtroMercado !== 'posso' || (!jaComprado(o.id) && precoCompra(o, t) <= S.dinheiro)));
  if(!lista.length) return `<p class="vazio">Nenhum animal encontrado.</p><button class="btn cheio" data-act="limparBusca">Limpar a pesquisa</button>`;
  return lista.map(o => {
    const foi = jaComprado(o.id), e = ESP[o.esp];
    return `<button class="ofe" data-act="verOferta" data-v="${o.id}" ${foi ? 'disabled' : ''}>${foto(o.esp)}
      <span class="ofe-tx"><b>${esc(e.n)}</b><small>${sexo(o.sx)}${selo(o.st)} ${anos(idadeDe(o, t))} de ${e.vida}</small></span>
      <span class="ofe-pr"><span class="preco">${foi ? 'Comprado' : eur(precoCompra(o, t))}</span>${foi ? '' : setaIndice(o.esp)}</span></button>`;
  }).join('');
}
// Espécies do terreno que só têm um dos sexos: o mercado oferece um atalho para procurar o que falta.
function faltaPar(){
  const r = [], q = semAcento(buscaMercado.trim());
  for(const esp of especiesNoTerreno()){
    const tem = sx => S.animais.some(a => a.esp === esp && a.sx === sx);
    if(tem('M') === tem('F')) continue;
    const sx = tem('M') ? 'F' : 'M';
    if(sexoMercado !== sx || q !== semAcento(ESP[esp].n)) r.push({esp, sx});
  }
  return r.slice(0, 3);
}

/* ---------- ANIMAIS: TERRENO E INVENTÁRIO ---------- */
function terrenoHTML(){
  const nele = especiesNoTerreno(), tot = espacosTotal(), max = tot >= ESPACOS_MAX, perigos = [];
  for(const a of nele) for(const b of nele) if(come(a, b)) perigos.push(`${ESP[a].n} come ${ESP[b].n}`);
  return `<section class="terreno"><div class="ter-top"><h3>Seu terreno</h3><b>${nele.length}/${tot} espécies</b></div>
    <canvas id="terrenoCv" width="${tamanhoCanvas(ladoTerreno()).w}" height="${tamanhoCanvas(ladoTerreno()).h}" aria-label="Terreno em 3D com seus animais. Toque em um animal para ver a ficha."></canvas>
    ${S.animais.length > ANIMAIS_NA_TELA ? `<p class="ter-nota">Mostrando ${ANIMAIS_NA_TELA} de ${S.animais.length} animais.</p>` : ''}
    ${perigos.length ? `<p class="perigo">Perigo: ${esc(perigos.slice(0, 3).join(' · '))}${perigos.length > 3 ? ` e mais ${perigos.length - 3}` : ''}</p>` : ''}
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
function humorHTML(esp){
  const h = humor(esp), pen = penalidade(h.total), motivos = [];
  if(h.mistura) motivos.push('outras espécies juntas');
  if(h.deseq >= 5) motivos.push('uma espécie em maior número');
  if(h.medo) motivos.push(`medo de ${h.predadores.map(k => ESP[k].n).join(', ')}`);
  return `<p class="humor ${h.total >= 40 ? 'hum-t' : 'hum-f'}"><b>${nomeHumor(h.total)}</b>${pen ? ` · filhote sai ${pen} pontos mais fraco` : ' · filhote sem prejuízo'}${motivos.length ? `<small>${esc(motivos.join(', '))}</small>` : ''}</p>`;
}
function telaAnimais(){
  let h = terrenoHTML();
  const nele = especiesNoTerreno();
  if(!nele.length) return h + `<p class="vazio">Seu terreno está vazio. Compre um macho e uma fêmea da mesma espécie no Mercado.</p><button class="btn pri cheio" data-act="aba" data-v="mercado">Ir ao Mercado</button>`;
  for(const id of nele.sort((a, b) => ESP[b].p - ESP[a].p)){
    const lista = S.animais.filter(a => a.esp === id).sort((a, b) => precoVenda(b) - precoVenda(a));
    h += `<article class="card"><div class="card-top" data-act="verEspecie" data-v="${id}">${foto(id)}<div class="card-tit"><h3>${esc(ESP[id].n)}</h3>
      <small>${lista.length} ${lista.length === 1 ? 'animal' : 'animais'} · vive ${anos(ESP[id].vida)} ${setaIndice(id)}</small></div></div>${humorHTML(id)}${lista.map(a => linhaAnimal(a)).join('')}</article>`;
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
    <small>${m ? `${sexo('M')}${selo(m.st)} ${anos(idadeDe(m, t))}` : 'O pai morreu'} &nbsp; ${sexo('F')}${selo(f.st)} ${anos(idadeDe(f, t))}</small></div></div>${c.fase === 'tentando' ? humorHTML(e.id) : ''}${corpo}</article>`;
}

/* ---------- WIKIPÉDIA ---------- */
function telaWiki(){
  const cats = CATEGORIAS.map(c => {
    const l = ESPECIES.filter(e => categoria(e).id === c.id);
    return `<h3 class="wk-cat" data-cat="${c.id}"><span class="cat c-${c.id}">${c.n}</span> <small>${l.length} espécies</small></h3>
      <div class="wk-grade" data-grade="${c.id}">${l.map(e => `<button class="wk" data-act="verEspecie" data-v="${e.id}" data-n="${esc(semAcento(e.n + ' ' + e.c))}">${foto(e.id)}<b>${esc(e.n)}</b><small>${eur(e.p)} · ${anos(e.vida)}</small></button>`).join('')}</div>`;
  }).join('');
  return `<input class="busca" id="wikiBusca" type="search" placeholder="Procurar espécie" aria-label="Procurar espécie" value="${esc(wikiBusca)}">${cats}`;
}
function filtraWiki(){
  const q = semAcento(wikiBusca.trim());
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
      ${li('Porte', PORTES[e.po])}
      ${li('Caça', e.caca ? `Sim, até porte ${PORTES[e.caca].toLowerCase()}` : 'Não')}
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
      ${li('Filhotes nascidos', S.nascidos)}${li('Animais vendidos', S.vendidos)}${li('Total em vendas', eur(S.receita))}${li('Mortes por velhice', S.mortos)}${li('Devorados', S.devorados)}
    </div>
    <details class="regras"><summary>Como jogar</summary><ul>
      <li>Compre um macho e uma fêmea da mesma espécie no Mercado. Ele muda a cada 5 minutos.</li>
      <li>Coloque os dois em Acasalar. A gravidez vem entre 1 e 3 horas, e o filhote nasce 1 hora depois.</li>
      <li>Os 5 status vão de 0 a 100, e a média dá a classificação, de E a S. O filhote é uma fusão sorteada dos pais.</li>
      <li>Cada meia-noite de Brasília vale 1 ano. Mais novo vale mais; ao chegar à idade máxima, o animal morre.</li>
      <li>Venda em Animais. Filhotes de pais fortes dão mais lucro.</li>
      <li>O terreno começa com 3 espécies. Compre mais espaço para criar outras.</li>
      <li>Todos ficam juntos no terreno: predador adulto caça e mata os mais fracos.</li>
      <li>Espécies misturadas, ou uma com muito mais animais que outra, ficam tristes e o filhote nasce mais fraco. Terreno maior diminui a tristeza da mistura.</li>
    </ul></details>
    <h3 class="sec-t">Diário</h3>
    <ol class="diario">${S.diario.length ? S.diario.map(d => `<li><time>${new Date(d.t - FUSO_BR).toISOString().slice(8, 10)}/${new Date(d.t - FUSO_BR).toISOString().slice(5, 7)} ${horaBR(d.t)}</time>${esc(d.txt)}</li>`).join('') : '<li class="dim">Nada ainda.</li>'}</ol>
    <p class="dim conta-mail">${esc(contaEmail())}</p>
    <button class="btn cheio" data-act="logout">Sair da conta</button>
    <button class="btn cheio perigoso" data-act="pedirReset">Resetar conta</button>`;
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
  else if(tipo === 'resetar') h = `<h2>Resetar a conta?</h2>
    <p class="aviso">Tem certeza? Isso vai zerar tudo e não dá para desfazer.</p>
    <ul class="perdas"><li>Você vai perder todo o dinheiro (${eur(S.dinheiro)}).</li><li>Vai perder todos os animais (${S.animais.length}) e os casais.</li><li>Vai perder os espaços comprados no terreno.</li><li>Vai perder o diário e as estatísticas.</li></ul>
    <p class="cient">Você recomeça do zero, com ${eur(DINHEIRO_INICIAL)}.</p>
    <button class="btn cheio alerta" data-act="resetarConta">Sim, zerar tudo</button>
    <button class="btn cheio" data-act="fechar">Não, manter minha conta</button>`;
  $('#sheetBody').innerHTML = h;
}
// Antes de comprar: quem esta espécie vai comer no terreno, e quem pode comê-la
function avisoCaca(esp){
  const nele = especiesNoTerreno().filter(k => k !== esp), presas = nele.filter(k => come(esp, k)), preds = nele.filter(k => come(k, esp));
  let h = '';
  if(presas.length) h += `<p class="aviso">Cuidado: vai comer ${esc(presas.map(k => ESP[k].n).join(', '))} do seu terreno.</p>`;
  if(preds.length) h += `<p class="aviso">Cuidado: pode ser comido por ${esc(preds.map(k => ESP[k].n).join(', '))} do seu terreno.</p>`;
  return h;
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
    ${avisoCaca(o.esp)}
    <button class="btn pri cheio" data-act="comprar" data-v="${o.id}" ${semEspaco || S.dinheiro < p ? 'disabled' : ''}>${S.dinheiro < p ? `Faltam ${eur(p - S.dinheiro)}` : `Comprar por ${eur(p)}`}</button>
    <button class="btn cheio" data-act="verEspecie" data-v="${e.id}">Ver na Wikipédia</button>`;
}
function sheetAnimal(id, novo){
  const a = animal(id);
  if(!a) return `<p class="vazio">Este animal não está mais no seu terreno.</p>`;
  const e = ESP[a.esp], c = casalDe(id), idade = idadeDe(a), arm = armado.id === id && armado.ate > performance.now(), resta = e.vida - idade;
  const presa = c && c.fase === 'gravida';
  return `${novo ? `<p class="nasceu">Nasceu um filhote!</p>${a.pen ? `<p class="aviso">Os pais estavam tristes: ele nasceu cerca de ${a.pen} pontos mais fraco.</p>` : ''}` : ''}<img class="sh-foto" src="${fotoEsp(a.esp)}" alt="${esc(e.n)}" width="360" height="360">
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
    ${outro ? `<button class="btn cheio" data-act="limparPar">Trocar de espécie</button>` : ''}<button class="btn pri cheio" data-act="buscarMercado" data-v="${outro ? outro.esp : ''}|${sx}">Procurar no Mercado</button>`;
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
  if(avisosCaca.length){ toast(avisosCaca.join(' '), true); avisosCaca = []; }
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
  filtroMercado(v){ filtroMercado = filtroMercado === v ? 'todas' : v; renderAba(); },
  sexoMercado(v){ sexoMercado = sexoMercado === v ? 'todos' : v; renderAba(); },
  limparBusca(){ buscaMercado = ''; sexoMercado = 'todos'; filtroMercado = 'todas'; renderAba(); },
  buscarMercado(v){
    const [esp, sx] = v.split('|');
    buscaMercado = esp ? ESP[esp].n : ''; sexoMercado = sx; filtroMercado = 'todas';
    ACT.aba('mercado');
  },
  verOferta(v){ abreSheet('oferta', v); },
  verEspecie(v){ abreSheet('especie', v); },
  verAnimal(v){ armado = {id: '', ate: 0}; abreSheet('animal', v); },
  comprar(v){
    const o = oferta(v), erro = comprar(v);
    if(erro) return toast(erro, true);
    save(); fechaSheet();
    const outro = o.sx === 'M' ? 'F' : 'M', nome = ESP[o.esp].n;
    if(S.animais.some(a => a.esp === o.esp && a.sx === outro)){
      renderAba(); toast(`Você tem macho e fêmea de ${nome}. Agora é só ir em Acasalar.`);
    } else {
      // comprou só um dos sexos: já deixa a pesquisa pronta para achar o outro
      ACT.buscarMercado(`${o.esp}|${outro}`); toast(`Comprado! Agora escolha ${outro === 'F' ? 'uma fêmea' : 'um macho'} de ${nome}.`);
    }
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
  pedirReset(){ abreSheet('resetar'); },
  resetarConta(){
    S = defaults(); nascimentosNovos = []; avisosCaca = []; parEscolhido = {M: '', F: ''};
    mundo.clear(); efeitos = []; buscaMercado = ''; sexoMercado = 'todos'; filtroMercado = 'todas';
    diario(`Conta resetada. Recomeçou com ${eur(DINHEIRO_INICIAL)}.`);
    save(); cloudFlush();
    sheetAberta = null; $('#sheet').hidden = true;
    ACT.aba('mercado'); toast('Conta resetada. Boa sorte!');
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
  if(e.target.id === 'buscaMercado'){ buscaMercado = e.target.value; $('#listaMercado').innerHTML = listaMercadoHTML(); }
});
