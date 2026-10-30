// Telas: Mercado, Animais (inventário e terreno), Acasalar, Wikipédia e Conta; janelas de detalhe; todas as ações de botão (ACT).
// Botões chamam ações por data-act="nome" + data-v="valor" → ACT.nome(valor).
'use strict';

let aba = 'mercado', mercadoTipo = 'gaiola', filtroMercado = 'todas', sexoMercado = 'todos', buscaMercado = '', wikiBusca = '';
let herdaNovo = {M: '', F: ''}, parEscolhido = {M: '', F: ''}, armado = {id: '', ate: 0}, sheetAberta = null, toastT = 0;

const foto = (id, cls = '') => `<img class="foto ${cls}" src="${fotoEsp(id)}" alt="${esc(ESP[id].n)}" width="360" height="360" loading="lazy">`;
const indFaixa = v => Math.max(0, FAIXAS.findIndex(x => v >= x.de));
const selo = a => `<span class="selo n${indFaixa(posNota(a))}" aria-label="Nota ${fmtNota(notaDe(a))}">${fmtNota(notaDe(a))}</span>`;
const sexo = sx => `<span class="sx ${sx === 'M' ? 'sxM' : 'sxF'}" aria-label="${sexoN(sx)}">${sexoS(sx)}</span>`;
const barrasStatus = st => `<div class="stats">${STATUS.map(([k, n]) => `<div class="st"><span>${n}</span><i><b style="width:${st[k]}%" class="${corStatus(st[k])}"></b></i><em>${st[k]}</em></div>`).join('')}</div>`;
const corStatus = v => 'b' + indFaixa(v);
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
  const mt = (id, n) => `<button class="${mercadoTipo === id ? 'on' : ''}" data-act="mercadoTipo" data-v="${id}">${n}</button>`;
  return `<div class="merc-abas">${mt('gaiola', '🐹 Mercado de gaiola')}${mt('outros', '🦁 Outros animais')}</div>
    <div class="faixa"><span>Novas ofertas em <b data-fim="${fimDoCiclo(t)}"></b></span><button class="link" data-act="verTerrenos">${S.terrenos.length}/${TERRENOS.length} terrenos</button></div>
    <input class="busca" id="buscaMercado" type="search" placeholder="Pesquisar animal" aria-label="Pesquisar animal" value="${esc(buscaMercado)}">
    <div class="chips">${sx('M', '♂ Machos')}${sx('F', '♀ Fêmeas')}${ft('posso', 'Posso comprar')}${ft('minhas', 'Com vaga')}</div>
    ${falta}<div id="listaMercado">${listaMercadoHTML()}</div>`;
}
function listaMercadoHTML(){
  const t = agora(), q = semAcento(buscaMercado.trim());
  const lista = mercado(t).filter(o => (sexoMercado === 'todos' || o.sx === sexoMercado)
    && (!q || semAcento(ESP[o.esp].n).includes(q))
    && (filtroMercado !== 'minhas' || vagaPara(o.esp))
    && (filtroMercado !== 'posso' || (vagaPara(o.esp) && !jaComprado(o.id) && precoCompra(o, t) <= S.dinheiro)));
  if(!lista.length) return `<p class="vazio">Nenhum animal assim no mercado agora. Novas ofertas chegam a cada hora.</p><button class="btn cheio" data-act="limparBusca">Limpar a pesquisa</button>`;
  return lista.map(o => {
    const foi = jaComprado(o.id), e = ESP[o.esp], tem = !!vagaPara(o.esp);
    return `<button class="ofe ${tem ? '' : 'trancado'}" data-act="verOferta" data-v="${o.id}" ${foi ? 'disabled' : ''}>${foto(o.esp)}
      <span class="ofe-tx"><b>${esc(e.n)}</b><small>${sexo(o.sx)}${selo(o)} ${fmtIdade(o, t)} de ${anos(e.vida)}</small>${tem ? '' : `<small class="tranca">🔒 ${S.terrenos.some(x => moraEm(o.esp, x.tipo)) ? 'Sem vaga' : `Precisa de ${esc(terrenoDe(o.esp).n)}`}</small>`}</span>
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
    const noMercado = mercado(agora(), mercadoDe(esp)).some(o => o.esp === esp && o.sx === sx && !jaComprado(o.id)) && vagaPara(esp);
    if(noMercado && (sexoMercado !== sx || q !== semAcento(ESP[esp].n))) r.push({esp, sx});
  }
  return r.slice(0, 3);
}

/* ---------- ANIMAIS: TERRENO E INVENTÁRIO ---------- */
function terrenoHTML(){
  const I = instAtual(), T = TERRENO[I.tipo], nele = especiesDoTerreno(I.id), qt = animaisDoTerreno(I.id).length, perigos = [];
  for(const a of nele) for(const b of nele) if(come(a, b)) perigos.push(`${ESP[a].n} come ${ESP[b].n}`);
  const abas = S.terrenos.map(t => `<button class="chip ${t.id === I.id ? 'on' : ''}" data-act="terreno" data-v="${t.id}">${TERRENO[t.tipo].ic} ${esc(nomeInst(t))} <small>${animaisDoTerreno(t.id).length}/${TERRENO[t.tipo].cap}</small></button>`).join('');
  return `<div class="chips ter-abas">${abas}<button class="chip chip-mais" data-act="verTerrenos">+ Terrenos</button></div>
    <section class="terreno"><div class="ter-top"><h3>${T.ic} ${esc(nomeInst(I))}</h3><b>${qt}/${T.cap} animais</b></div>
    <canvas id="terrenoCv" width="${tamanhoCanvas(ladoTerreno()).w}" height="${tamanhoCanvas(ladoTerreno()).h}" aria-label="${esc(T.n)} em 3D com seus animais. Toque em um animal para ver a ficha."></canvas>
    ${qt > ANIMAIS_NA_TELA ? `<p class="ter-nota">Mostrando ${ANIMAIS_NA_TELA} de ${qt} animais.</p>` : ''}
    ${perigos.length ? `<p class="perigo">Perigo: ${esc(perigos.slice(0, 3).join(' · '))}${perigos.length > 3 ? ` e mais ${perigos.length - 3}` : ''}</p>` : ''}
    ${qt >= T.cap ? `<p class="perigo">Sem vaga. Venda um animal ou compre outro terreno.</p>` : ''}
    <p class="ter-vivem">${T.unica ? (nele.length ? `Aqui só pode ${esc(ESP[nele[0]].n)}.` : `Uma espécie só. Pode ser: ${esc(T.especies.map(id => ESP[id].n).join(', '))}.`) : `Vivem aqui: ${esc(T.especies.map(id => ESP[id].n).join(', '))}.`}</p>
  </section>`;
}
function chipsAnimal(a){
  const c = casalDe(a.id), id = idadeDe(a), vida = ESP[a.esp].vida;
  let h = '';
  if(c) h += `<span class="tag ${c.fase === 'gravida' && a.id === c.f ? 'gra' : 'aca'}">${c.fase === 'gravida' ? (a.id === c.f ? 'Grávida' : 'Pai') : c.fase === 'tentando' ? 'Acasalando' : 'Em casal'}</span>`;
  if(id < IDADE_FERTIL) h += `<span class="tag fil">Filhote</span>`;
  if(muitoRaro(a)) h += `<span class="tag raro">✨ Muito raro</span>`;
  if(morreEm(a) - agora() <= DIA) h += `<span class="tag mor">Morre hoje</span>`;
  return h;
}
function linhaAnimal(a, acao = 'verAnimal'){
  return `<button class="ani" data-act="${acao}" data-v="${a.id}">${sexo(a.sx)}${selo(a)}
    <span class="ani-tx"><b>${fmtIdade(a)}<em> de ${anos(ESP[a.esp].vida)}</em></b>${chipsAnimal(a) ? `<small>${chipsAnimal(a)}</small>` : ''}</span>
    <span class="preco">${eur(precoVenda(a))}</span></button>`;
}
function humorHTML(esp, ter = S.terrenoAtual){
  const h = humor(esp, ter), pen = penalidade(h.total), motivos = [];
  if(h.mistura) motivos.push('outras espécies juntas');
  if(h.deseq >= 5) motivos.push('uma espécie em maior número');
  if(h.medo) motivos.push(`medo de ${h.predadores.map(k => ESP[k].n).join(', ')}`);
  return `<p class="humor ${h.total >= 40 ? 'hum-t' : 'hum-f'}"><b>${nomeHumor(h.total)}</b>${pen ? ` · filhote sai ${pen} pontos mais fraco` : ' · filhote sem prejuízo'}${motivos.length ? `<small>${esc(motivos.join(', '))}</small>` : ''}</p>`;
}
function telaAnimais(){
  let h = terrenoHTML();
  const nele = especiesDoTerreno(instAtual().id);
  if(!nele.length) return h + `<p class="vazio">Este terreno está vazio. Compre um macho e uma fêmea de uma das espécies que vivem aqui.</p><button class="btn pri cheio" data-act="irMercado">Ir ao Mercado</button>`;
  for(const id of nele.sort((a, b) => ESP[b].p - ESP[a].p)){
    const lista = animaisDoTerreno(instAtual().id).filter(a => a.esp === id).sort((a, b) => precoVenda(b) - precoVenda(a));
    h += `<article class="card"><div class="card-top" data-act="verEspecie" data-v="${id}">${foto(id)}<div class="card-tit"><h3>${esc(ESP[id].n)}</h3>
      <small>${lista.length} ${lista.length === 1 ? 'animal' : 'animais'} · vive ${anos(ESP[id].vida)} ${setaIndice(id)}</small></div></div>${humorHTML(id)}${lista.map(a => linhaAnimal(a)).join('')}</article>`;
  }
  return h;
}

/* ---------- ACASALAR ---------- */
function telaAcasalar(){
  const m = animal(parEscolhido.M), f = animal(parEscolhido.F), espera = S.casais.filter(c => animal(c.f));
  const lado = (sx, a) => `<button class="lado ${a ? 'tem' : ''}" data-act="escolherLado" data-v="${sx}">
    ${a ? `${foto(a.esp)}<span>${sexo(sx)}${selo(a)}</span><small>${fmtIdade(a)}</small>` : `<span class="vazio-sx">${sexoS(sx)}</span><b>Escolher ${sexoN(sx).toLowerCase()}</b>`}</button>`;
  const erro = (m && f) ? motivoCasal(m, f) : '';
  const prontos = pareados().length;
  return `<section class="acasalar"><h3>Novo casal</h3><p class="dim">Coloque um macho e uma fêmea da mesma espécie. A gravidez vem entre 1 e 3 horas, e o filhote nasce 1 hora depois. Dá para escolher 1 status do pai e 1 da mãe para o filhote herdar igual.</p>
    <div class="lados">${lado('M', m)}<span class="cruza">+</span>${lado('F', f)}</div>
    ${m && f && m.esp === f.esp ? herdaHTML('novo', m, f, herdaNovo) : ''}
    ${erro ? `<p class="aviso">${esc(erro)}</p>` : ''}
    <button class="btn pri cheio" data-act="acasalar" ${m && f && !erro ? '' : 'disabled'}>Colocar para acasalar</button></section>
    <div class="ter-top sec"><h3>Casais</h3>${prontos > 1 ? `<button class="chip on" data-act="repetirTodos">Acasalar os ${prontos} de novo</button>` : ''}</div>
    ${espera.length ? espera.map(cartaoCasal).join('') : `<p class="vazio">Nenhum casal ainda.</p>`}`;
}
// Escolher o que o filhote herda igual: 1 status do pai e 1 da mãe. alvo = 'novo' (casal sendo montado) ou o id do casal.
function herdaHTML(alvo, m, f, herda, trava){
  const h = herda || {}, linha = (sx, a) => `<div class="hd-lin"><span class="hd-quem">${sexo(sx)} ${sx === 'M' ? 'Do pai' : 'Da mãe'}</span><div class="hd-ops">${STATUS.map(([k, n]) =>
    `<button class="hd ${h[sx] === k ? 'on' : ''}" data-act="herda" data-v="${alvo}|${sx}|${k}" ${trava || !a ? 'disabled' : ''}><small>${n}</small><b>${a ? a.st[k] : '–'}</b></button>`).join('')}</div></div>`;
  return `<div class="herda"><p class="hd-tit"><b>O filhote herda igual</b> <small>escolha 1 do pai e 1 da mãe; os outros saem da mistura dos dois, podendo vir melhores ou piores</small></p>${linha('M', m)}${linha('F', f)}</div>`;
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
      ${livres(instancia(f.ter)) <= 0 ? `<p class="aviso">${esc(nomeInst(instancia(f.ter)))} sem vaga: venda um animal para o próximo filhote ter lugar.</p>` : ''}
      <div class="dois"><button class="btn pri" data-act="repetir" data-v="${c.id}" ${livres(instancia(f.ter)) <= 0 ? 'disabled' : ''}>Acasalar de novo</button><button class="btn" data-act="separar" data-v="${c.id}">Separar</button></div>`;
  }
  corpo = herdaHTML(c.id, m, f, c.herda, c.fase === 'gravida') + corpo;
  return `<article class="card casal"><div class="card-top" data-act="verEspecie" data-v="${e.id}">${foto(e.id)}<div class="card-tit"><h3>${esc(e.n)}</h3>
    <small>${m ? `${sexo('M')}${selo(m)} ${fmtIdade(m, t)}` : 'O pai morreu'} &nbsp; ${sexo('F')}${selo(f)} ${fmtIdade(f, t)}</small></div></div>${c.fase === 'tentando' ? humorHTML(e.id, f.ter) : ''}${corpo}</article>`;
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
      ${li('Terreno', `${terrenoDe(id).ic} ${esc(terrenoDe(id).n)}`)}
      ${li('Nota', `${fmtNota(e.nmin)} a ${fmtNota(e.nmax)}`)}
      ${li('Quanto vive', `${anos(e.vida)} (${e.vida * DIAS_POR_ANO} dias reais)`)}
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

/* ---------- CONQUISTAS ---------- */
// Todas as espécies do jogo, com o melhor macho e a melhor fêmea que o jogador já teve (S.conq, ver registraConquista em 04).
const conqDe = (id, sx) => { const c = S.conq[id] && S.conq[id][sx]; return c ? {esp: id, sx, st: c.st, t: c.t} : null; };
function especiesConquista(){
  const l = ESPECIES.slice();
  for(const id of Object.keys(S.conq)) if(ESP[id] && !l.includes(ESP[id])) l.push(ESP[id]); // espécie que saiu do jogo, mas o jogador teve
  return l;
}
function telaConquistas(){
  const todas = especiesConquista(), temAlgum = e => conqDe(e.id, 'M') || conqDe(e.id, 'F');
  const completas = todas.filter(e => conqDe(e.id, 'M') && conqDe(e.id, 'F')).length, achadas = todas.filter(temAlgum).length;
  const maximas = todas.reduce((n, e) => n + ['M', 'F'].filter(sx => { const a = conqDe(e.id, sx); return a && notaDe(a) >= e.nmax; }).length, 0);
  const lado = (e, sx) => { const a = conqDe(e.id, sx); return `<span class="cq-sx">${sexo(sx)}${a ? `${selo(a)}${notaDe(a) >= e.nmax ? '<i class="cq-max" aria-label="Nota máxima">👑</i>' : ''}` : '<span class="cq-nada">—</span>'}</span>`; };
  const cats = CATEGORIAS.map(c => {
    const l = todas.filter(e => categoria(e).id === c.id);
    if(!l.length) return '';
    return `<h3 class="wk-cat"><span class="cat c-${c.id}">${c.n}</span> <small>${l.filter(temAlgum).length} de ${l.length}</small></h3>
      <div class="wk-grade">${l.map(e => `<button class="wk cq ${temAlgum(e) ? '' : 'off'}" data-act="verConquista" data-v="${e.id}">${foto(e.id)}<b>${esc(e.n)}</b><span class="cq-par">${lado(e, 'M')}${lado(e, 'F')}</span></button>`).join('')}</div>`;
  }).join('');
  return `<section class="acasalar rk-top"><h3>Conquistas</h3>
    <p class="dim">O animal mais raro (nota mais alta) de cada espécie que você já teve, macho e fêmea. Vale comprado ou nascido, e fica guardado mesmo depois de vender. 👑 = nota máxima da espécie, que só nasce no criadouro.</p>
    <div class="cq-tot"><div><b>${achadas}/${todas.length}</b><small>espécies</small></div><div><b>${completas}</b><small>com casal</small></div><div><b>${maximas}</b><small>👑 nota máxima</small></div></div></section>
    ${cats}`;
}
function sheetConquista(id){
  const e = ESP[id];
  const bloco = sx => {
    const a = conqDe(id, sx);
    if(!a) return `<h3 class="sec-t">${sexo(sx)} ${sexoN(sx)}</h3><p class="dim">Você ainda não teve ${sx === 'M' ? 'um macho' : 'uma fêmea'} desta espécie.</p>`;
    return `<h3 class="sec-t">${sexo(sx)} ${sexoN(sx)} ${selo(a)}${notaDe(a) >= e.nmax ? ' 👑' : ''}</h3>
      <p class="cient">Nota ${fmtNota(notaDe(a))} · nesta espécie vai de ${fmtNota(e.nmin)} a ${fmtNota(e.nmax)} · desde ${dataBR(a.t)}</p>${barrasStatus(a.st)}`;
  };
  return `<img class="sh-foto" src="${fotoEsp(id)}" alt="${esc(e.n)}" width="360" height="360">
    <h2>${esc(e.n)}</h2><p class="cient">${esc(e.c)}</p>
    ${bloco('M')}${bloco('F')}
    <button class="btn cheio" data-act="verEspecie" data-v="${id}">Ver na Wikipédia</button>`;
}

/* ---------- RANKING ---------- */
let rankNomeTxt = null;
function telaRank(){
  const lista = rankParaTela(), meuId = fbUser ? fbUser.uid : '';
  const nome = rankNomeTxt == null ? (fbUser ? nomePublico() : '') : rankNomeTxt;
  let corpo;
  if(rankErro) corpo = `<p class="aviso">${esc(rankErro)}</p>`;
  else if(!lista) corpo = `<p class="vazio">Carregando…</p>`;
  else corpo = `<ol class="rk">${lista.map((r, i) => `<li class="${r.id === meuId ? 'eu' : ''}"><span class="rk-pos p${i + 1}">${i + 1}</span><span class="rk-nome">${esc(r.nome)}${r.id === meuId ? ' <small>(você)</small>' : ''}</span><b class="preco">${eur(+r.dinheiro || 0)}</b></li>`).join('')}</ol>`;
  return `<section class="acasalar rk-top"><h3>Ranking</h3><p class="dim">Quem tem mais dinheiro em caixa. O valor dos animais não conta. Top ${RANK_N}.</p>
    <label class="rk-lab" for="rankNome">Seu apelido no ranking</label>
    <div class="rk-form"><input class="busca" id="rankNome" maxlength="${NOME_MAX}" value="${esc(nome)}" autocomplete="off"><button class="btn" data-act="rankSalvarNome">Salvar</button></div>
    <p class="dim rk-priv">Só o apelido aparece. Seu nome e seu e-mail do Google ficam privados.</p></section>
    <button class="btn cheio" data-act="rankAtualizar" ${rankCarregando ? 'disabled' : ''}>${rankCarregando ? 'Atualizando…' : 'Atualizar'}</button>
    ${corpo}`;
}

/* ---------- CONTA ---------- */
function telaConta(){
  const li = (k, v) => `<div class="wk-li"><span>${k}</span><b>${v}</b></div>`;
  return `<section class="pat"><small>Patrimônio (dinheiro + animais)</small><strong>${eur(patrimonio())}</strong></section>
    <div class="wk-tab">
      ${li('Filhotes nascidos', S.nascidos)}${li('Animais vendidos', S.vendidos)}${li('Total em vendas', eur(S.receita))}${li('Mortes por velhice', S.mortos)}${li('Devorados', S.devorados)}
    </div>
    <details class="regras"><summary>Como jogar</summary><ul>
      <li>Compre um macho e uma fêmea da mesma espécie no Mercado. Há um mercado de gaiola e outro para os demais animais. Eles mudam a cada hora, com 20 animais cada, e os raros aparecem menos.</li>
      <li>Coloque os dois em Acasalar. A gravidez vem entre 1 e 3 horas, e o filhote nasce 1 hora depois.</li>
      <li>Cada animal tem uma nota, que define quanto ele vale. Cada espécie tem sua faixa: bicho simples fica perto de 1 a 10, o um pouco melhor perto de 15 a 27, e os raros passam de 2.000.</li>
      <li>A nota sai dos 5 status, que vão de 0 a 100. No Acasalar, escolha 1 status do pai e 1 da mãe para o filhote herdar igual; os outros 3 saem de uma fusão sorteada dos dois e podem vir melhores ou piores.</li>
      <li>Cada ${DIAS_POR_ANO} dias reais valem 1 ano, e cada ${MES / 3600e3} horas, 1 mês. Cada animal envelhece desde que nasceu e cresce até virar adulto. Mais novo vale mais; ao chegar à idade máxima, o animal morre.</li>
      <li>Animal muito raro (nota no topo da espécie) fica dourado no terreno.</li>
      <li>Venda em Animais. Filhotes de pais fortes dão mais lucro.</li>
      <li>Você começa com 1 Gaiola: cabem 5 animais, de uma espécie só. Só dá para comprar animal se tiver vaga em um terreno certo para ele. Compre mais terrenos para criar mais.</li>
      <li>No mesmo terreno, predador adulto caça e mata os mais fracos. Em terrenos diferentes, um não alcança o outro.</li>
      <li>Espécies misturadas no mesmo terreno, ou uma com muito mais animais que outra, ficam tristes e o filhote nasce mais fraco.</li>
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
  else if(tipo === 'conquista') h = sheetConquista(v);
  else if(tipo === 'animal' || tipo === 'nasceu') h = sheetAnimal(v, tipo === 'nasceu');
  else if(tipo === 'escolher') h = sheetEscolher(v);
  else if(tipo === 'terrenos') h = sheetTerrenos();
  else if(tipo === 'resetar') h = `<h2>Resetar a conta?</h2>
    <p class="aviso">Tem certeza? Isso vai zerar tudo e não dá para desfazer.</p>
    <ul class="perdas"><li>Você vai perder todo o dinheiro (${eur(S.dinheiro)}).</li><li>Vai perder todos os animais (${S.animais.length}) e os casais.</li><li>Vai perder os terrenos comprados e voltar para a Gaiola.</li><li>Vai perder o diário, as estatísticas e as conquistas.</li></ul>
    <p class="cient">Você recomeça do zero, com ${eur(DINHEIRO_INICIAL)}.</p>
    <button class="btn cheio alerta" data-act="resetarConta">Sim, zerar tudo</button>
    <button class="btn cheio" data-act="fechar">Não, manter minha conta</button>`;
  $('#sheetBody').innerHTML = h;
}
// Antes de comprar: quem esta espécie vai comer no terreno, e quem pode comê-la
function sheetTerrenos(){
  return `<h2>Terrenos</h2><p class="cient">Cada animal vive em um terreno certo. Só dá para comprar animal se houver vaga para ele.</p>
    ${TERRENOS.map(t => {
      const qtd = qtdDoTipo(t.id), p = precoTerreno(t.id), pode = S.dinheiro >= p;
      return `<article class="ter-card ${qtd ? 'tem' : ''}"><div class="ter-card-top"><span class="ter-ic">${t.ic}</span><div><h3>${esc(t.n)}${qtd ? ` <small class="ter-qtd">você tem ${qtd}</small>` : ''}</h3><small>${esc(t.desc)} Cabem ${t.cap} animais${t.unica ? ', de 1 espécie' : ''}.</small></div></div>
        <div class="ter-especies">${t.especies.filter(id => !FORA_DO_JOGO.has(id)).map(id => `<button class="ter-esp" data-act="verEspecie" data-v="${id}">${foto(id)}<small>${esc(ESP[id].n)}</small></button>`).join('')}</div>
        <button class="btn cheio ${pode ? 'pri' : ''}" data-act="comprarTerreno" data-v="${t.id}" ${pode ? '' : 'disabled'}>${pode ? `Comprar ${qtd ? 'mais um ' : ''}por ${eur(p)}` : `${eur(p)} · faltam ${eur(p - S.dinheiro)}`}</button>
      </article>`;
    }).join('')}`;
}
function avisoCaca(esp){
  const lugar = vagaPara(esp), nele = lugar ? especiesDoTerreno(lugar.id).filter(k => k !== esp) : [], presas = nele.filter(k => come(esp, k)), preds = nele.filter(k => come(k, esp));
  let h = '';
  if(presas.length) h += `<p class="aviso">Cuidado: vai comer ${esc(presas.map(k => ESP[k].n).join(', '))} do mesmo terreno.</p>`;
  if(preds.length) h += `<p class="aviso">Cuidado: pode ser comido por ${esc(preds.map(k => ESP[k].n).join(', '))} do mesmo terreno.</p>`;
  return h;
}
function sheetOferta(key){
  const o = oferta(key);
  if(!o) return `<p class="vazio">Esta oferta já saiu do mercado.</p>`;
  const e = ESP[o.esp], p = precoCompra(o), lugar = vagaPara(o.esp), semTerreno = !lugar;
  return `<img class="sh-foto" src="${fotoEsp(o.esp)}" alt="${esc(e.n)}" width="360" height="360">
    <h2>${esc(e.n)} ${sexo(o.sx)} ${selo(o)}</h2>
    <p class="cient">Nota ${fmtNota(notaDe(o))} · nesta espécie vai de ${fmtNota(e.nmin)} a ${fmtNota(e.nmax)}</p>
    <p class="cient">${fmtIdade(o)} de ${anos(e.vida)} · ${restaVida(o)}</p>
    ${barrasStatus(o.st)}
    ${semTerreno ? `<p class="aviso">🔒 ${esc(motivoSemVaga(o.esp))}</p><button class="btn cheio" data-act="verTerrenos">Ver terrenos</button>` : `<p class="cient">Vai para: ${TERRENO[lugar.tipo].ic} ${esc(nomeInst(lugar))} (${animaisDoTerreno(lugar.id).length}/${TERRENO[lugar.tipo].cap})</p>`}
    ${avisoCaca(o.esp)}
    <button class="btn pri cheio" data-act="comprar" data-v="${o.id}" ${semTerreno || S.dinheiro < p ? 'disabled' : ''}>${S.dinheiro < p ? `Faltam ${eur(p - S.dinheiro)}` : `Comprar por ${eur(p)}`}</button>
    <button class="btn cheio" data-act="verEspecie" data-v="${e.id}">Ver na Wikipédia</button>`;
}
function sheetAnimal(id, novo){
  const a = animal(id);
  if(!a) return `<p class="vazio">Este animal não está mais no seu terreno.</p>`;
  const e = ESP[a.esp], c = casalDe(id), idade = idadeDe(a), arm = armado.id === id && armado.ate > performance.now(), resta = e.vida - idade;
  const presa = c && c.fase === 'gravida';
  return `${novo ? `<p class="nasceu">Nasceu um filhote!</p>${a.pen ? `<p class="aviso">Os pais estavam tristes: ele nasceu cerca de ${a.pen} pontos mais fraco.</p>` : ''}` : ''}<img class="sh-foto" src="${fotoEsp(a.esp)}" alt="${esc(e.n)}" width="360" height="360">
    <h2>${esc(e.n)} ${sexo(a.sx)} ${selo(a)}</h2>
    <p class="cient">Nota ${fmtNota(notaDe(a))} · nesta espécie vai de ${fmtNota(e.nmin)} a ${fmtNota(e.nmax)}</p>
    <p class="cient">${fmtIdade(a)} de ${anos(e.vida)} · ${restaVida(a)}${muitoRaro(a) ? ' · ✨ muito raro' : ''}</p>
    ${barrasStatus(a.st)}
    <button class="btn cheio ${arm ? 'alerta' : 'pri'}" data-act="vender" data-v="${id}" ${presa ? 'disabled' : ''}>${presa ? 'Gestação em andamento' : arm ? `Toque de novo para vender por ${eur(precoVenda(a))}` : `Vender por ${eur(precoVenda(a))}`}</button>
    ${!c && fertil(a) ? `<button class="btn cheio" data-act="levarAcasalar" data-v="${id}">Colocar para acasalar</button>` : ''}
    ${!fertil(a) ? `<p class="dim centro">Filhote: acasala a partir de ${anos(IDADE_FERTIL)}, daqui a ${tempoLongo(fertilEm(a) - agora())}.</p>` : ''}
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
const TELAS = {mercado: telaMercado, animais: telaAnimais, acasalar: telaAcasalar, wiki: telaWiki, rank: telaRank, conq: telaConquistas, conta: telaConta};
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
// Muda sempre que algum animal (seu ou do mercado aberto) faz mais um mês: aí a tela é redesenhada.
function chaveIdades(t = agora()){
  let k = 0;
  for(const a of S.animais) k += Math.floor(idadeDe(a, t) * 12);
  if(aba === 'mercado') for(const o of mercado(t)) k += Math.floor(idadeDe(o, t) * 12) * 3;
  return k;
}
function tick(){
  if(!accountReady) return;
  const t = agora(), mudou = processar(t), c = cicloDe(t), d = chaveIdades(t);
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
  aba(v){
    aba = v; if(sheetAberta){ sheetAberta = null; $('#sheet').hidden = true; }
    if(v === 'rank'){ rankNomeTxt = null; pushRank(); loadRank(); }
    renderAba(); $('#tela').scrollTop = 0;
  },
  rankAtualizar(){ pushRank(); loadRank(); renderAba(); },
  rankSalvarNome(){
    const nome = (rankNomeTxt == null ? nomePublico() : rankNomeTxt).trim().slice(0, NOME_MAX);
    if(!nome) return toast('Escolha um apelido.', true);
    S.nome = nome; rankNomeTxt = null;
    save(); pushRank(); renderAba(); toast('Apelido salvo.');
  },
  fechar(){ fechaSheet(); },
  filtroMercado(v){ filtroMercado = filtroMercado === v ? 'todas' : v; renderAba(); },
  sexoMercado(v){ sexoMercado = sexoMercado === v ? 'todos' : v; renderAba(); },
  limparBusca(){ buscaMercado = ''; sexoMercado = 'todos'; filtroMercado = 'todas'; renderAba(); },
  buscarMercado(v){
    const [esp, sx] = v.split('|');
    buscaMercado = esp ? ESP[esp].n : ''; sexoMercado = sx; filtroMercado = 'todas';
    if(esp) mercadoTipo = mercadoDe(esp);
    ACT.aba('mercado');
  },
  mercadoTipo(v){ mercadoTipo = v; buscaMercado = ''; renderAba(); $('#tela').scrollTop = 0; },
  irMercado(){ mercadoTipo = instAtual().tipo === 'gaiola' ? 'gaiola' : 'outros'; ACT.aba('mercado'); },
  verOferta(v){ abreSheet('oferta', v); },
  verEspecie(v){ abreSheet('especie', v); },
  verConquista(v){ abreSheet('conquista', v); },
  verAnimal(v){ armado = {id: '', ate: 0}; abreSheet('animal', v); },
  comprar(v){
    const o = oferta(v), erro = comprar(v);
    if(erro) return toast(erro, true);
    save(); fechaSheet();
    const outro = o.sx === 'M' ? 'F' : 'M', nome = ESP[o.esp].n;
    if(S.animais.some(a => a.esp === o.esp && a.sx === outro)){
      renderAba(); toast(`Você tem macho e fêmea de ${nome}. Agora é só ir em Acasalar.`);
    } else if(mercado(agora(), mercadoDe(o.esp)).some(x => x.esp === o.esp && x.sx === outro && !jaComprado(x.id))){
      // comprou só um dos sexos e o outro está à venda: já deixa a pesquisa pronta
      ACT.buscarMercado(`${o.esp}|${outro}`); toast(`Comprado! Agora escolha ${outro === 'F' ? 'uma fêmea' : 'um macho'} de ${nome}.`);
    } else {
      renderAba(); toast(`Comprado! Não há ${outro === 'F' ? 'fêmea' : 'macho'} de ${nome} agora. O mercado muda a cada hora.`);
    }
  },
  verTerrenos(){ abreSheet('terrenos'); },
  terreno(v){
    if(!instancia(v)) return;
    S.terrenoAtual = v; save();
    if(sheetAberta){ sheetAberta = null; $('#sheet').hidden = true; }
    aba = 'animais'; renderAba(); $('#tela').scrollTop = 0;
  },
  comprarTerreno(v){
    const id = comprarTerreno(v);
    if(!instancia(id)) return toast(id, true);
    ACT.terreno(id); toast(`${nomeInst(instancia(id))} comprado!`);
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
  limparPar(){ parEscolhido = {M: '', F: ''}; herdaNovo = {M: '', F: ''}; fechaSheet(); renderAba(); },
  acasalar(){
    const erro = formaCasal(parEscolhido.M, parEscolhido.F, herdaNovo);
    if(erro) return toast(erro, true);
    parEscolhido = {M: '', F: ''}; herdaNovo = {M: '', F: ''};
    save(); renderAba(); toast('O casal está tentando. A gravidez vem entre 1 e 3 horas.');
  },
  herda(v){
    const [alvo, sx, k] = String(v).split('|'), c = alvo === 'novo' ? null : S.casais.find(x => x.id === alvo);
    if(alvo !== 'novo' && (!c || c.fase === 'gravida')) return;
    const h = alvo === 'novo' ? herdaNovo : (c.herda = c.herda || {M: '', F: ''}), outro = sx === 'M' ? 'F' : 'M';
    h[sx] = h[sx] === k ? '' : k;
    if(h[sx] && h[outro] === k) h[outro] = ''; // o mesmo status não vem dos dois
    if(c) save();
    renderAba();
  },
  repetir(v){
    const c = S.casais.find(x => x.id === v);
    if(!c) return;
    if(!repetir(c)) toast('Sem vaga para o próximo filhote. Venda um animal primeiro.', true);
    save(); renderAba();
  },
  repetirTodos(){ pareados().forEach(c => repetir(c)); save(); renderAba(); },
  separar(v){
    const c = S.casais.find(x => x.id === v);
    if(!c || c.fase === 'gravida') return;
    desfazCasal(c); save(); renderAba(); toast('Casal separado.');
  },
  pedirReset(){ abreSheet('resetar'); },
  resetarConta(){
    const nome = S.nome;
    S = defaults(); S.nome = nome; nascimentosNovos = []; avisosCaca = []; parEscolhido = {M: '', F: ''}; herdaNovo = {M: '', F: ''};
    mundo.clear(); efeitos = []; buscaMercado = ''; sexoMercado = 'todos'; filtroMercado = 'todas';
    diario(`Conta resetada. Recomeçou com ${eur(DINHEIRO_INICIAL)}.`);
    save(); cloudFlush(); pushRank();
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
  if(e.target.id === 'rankNome') rankNomeTxt = e.target.value;
  if(e.target.id === 'buscaMercado'){ buscaMercado = e.target.value; $('#listaMercado').innerHTML = listaMercadoHTML(); }
});
