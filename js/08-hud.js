// HUD: ícones, barra de habilidades, painéis (mapas, herói, mochila, regras, ranking), diálogos, criação de personagem, ações (ACT) e eventos de teclado/mouse/toque.
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- ÍCONES ---------- */
const SVG = (inner, fill) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="${fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
const ICON_BOW = SVG('<path d="M7 3c8 3 8 15 0 18"/><path d="M7 3v18" stroke-width="1"/><path d="M5 12h14M16 9l3 3-3 3"/>');
const ICON_SWORD = SVG('<path d="M14.5 3H21v6.5L10 20.5 3.5 14z" fill="currentColor" fill-opacity=".25"/><path d="M8 13l3 3M4 17l3 3M6.5 15.5L3 19"/>');
const ICON_ITEM = {
  get bow(){ return isWar() ? ICON_SWORD : ICON_BOW; },
  helm: SVG('<path d="M4 20c0-9 3.5-16 8-16s8 7 8 16c-2-2.5-5-3.5-8-3.5S6 17.5 4 20z" fill="currentColor" fill-opacity=".25"/><path d="M9 13c1 1 5 1 6 0"/>'),
  chest: SVG('<path d="M8 4l4 2 4-2 4 4-2 3v9H6v-9L4 8z" fill="currentColor" fill-opacity=".25"/><path d="M12 6v14"/>'),
  gloves: SVG('<path d="M8 21v-7l-2.5-4 1.5-1 2 2V5a1 1 0 0 1 2 0v6V4a1 1 0 0 1 2 0v7V5a1 1 0 0 1 2 0v7V7a1 1 0 0 1 2 0v8l-2 6z" fill="currentColor" fill-opacity=".25"/>'),
  boots: SVG('<path d="M8 3h5v11l6 3v4H6v-4l2-2z" fill="currentColor" fill-opacity=".25"/><path d="M6 18h13"/>'),
  ring: SVG('<circle cx="12" cy="14.5" r="6"/><path d="M9.5 6.5L12 4l2.5 2.5L12 9z" fill="currentColor"/>'),
  amulet: SVG('<path d="M6 3c0 6 3 9 6 9s6-3 6-9"/><path d="M12 11l4 5-4 5-4-5z" fill="currentColor" fill-opacity=".35"/>'),
};
const ICON_SK = {
  arrow: SVG('<path d="M5 19L18 6"/><path d="M13 5h6v6" /><path d="M5 19l-1 1M8 16l-3-1M8 16l1 3"/><circle cx="7" cy="8" r="1.6" fill="currentColor"/>'),
  fan: SVG('<path d="M4 20L12 4M4 20l12-10M4 20l16-4"/><path d="M10 4h3v3M14 8.5l3 .5-1 2.5M18 14l2 2-2 2"/>'),
  rain: SVG('<path d="M7 13a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1.5A3.5 3.5 0 0 1 17 13z" fill="currentColor" fill-opacity=".25"/><path d="M8 16l-1 3M12 16l-1 4M16 16l-1 3"/>'),
  burst: SVG('<circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/>'),
  tip: SVG('<path d="M12 3l5 9-5 3-5-3z" fill="currentColor" fill-opacity=".3"/><path d="M12 15v3"/><path d="M12 22c-1.5 0-2.5-1-2.5-2.2S12 17 12 17s2.5 1.6 2.5 2.8S13.5 22 12 22z" fill="currentColor"/>'),
  potency: SVG('<path d="M9 3h6M10 3v6L5 19a1.5 1.5 0 0 0 1.4 2h11.2A1.5 1.5 0 0 0 19 19l-5-10V3"/><path d="M7.5 15h9" /><circle cx="11" cy="18" r="1" fill="currentColor"/>'),
  agility: SVG('<path d="M5 6l6 6-6 6M12 6l6 6-6 6"/>'),
  hide: SVG('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" fill="currentColor" fill-opacity=".25"/>'),
  contagion: SVG('<circle cx="6" cy="17" r="2.5" fill="currentColor"/><circle cx="18" cy="17" r="2.5"/><circle cx="12" cy="6" r="2.5"/><path d="M7.5 15l3-7M16.5 15l-3-7M8.5 17h7"/>'),
  // Guerreiro
  cleave: SVG('<path d="M4 20L17 7l2-4 2 2-4 2L6 20z" fill="currentColor" fill-opacity=".25"/><path d="M8 4c3 1 5 3 6 6M5 9c2 0 4 1 5 3" stroke-dasharray="2 2"/><path d="M12 21c-1 0-1.8-.8-1.8-1.7S12 17 12 17s1.8 1.4 1.8 2.3S13 21 12 21z" fill="currentColor"/>'),
  charge: SVG('<path d="M3 12h9M3 8h6M3 16h6"/><path d="M13 6l8 6-8 6z" fill="currentColor" fill-opacity=".3"/>'),
  whirl: SVG('<path d="M12 4a8 8 0 1 1-7.4 5"/><path d="M4 4v5h5"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/>'),
  rupture: SVG('<path d="M12 3v9"/><path d="M8 7l4 5 4-5" fill="currentColor" fill-opacity=".3"/><path d="M3 17l4-2 2 3 3-3 3 3 2-3 4 2M2 21h20"/>'),
  serrated: SVG('<path d="M5 19L17 7"/><path d="M8 13l2 1-1 2M11 10l2 1-1 2M14 7l2 1-1 2"/><path d="M18 21c-1.2 0-2-.9-2-1.9S18 16 18 16s2 2.1 2 3.1-.8 1.9-2 1.9z" fill="currentColor"/>'),
  brutality: SVG('<path d="M12 3c-3 4-6 6-6 10a6 6 0 0 0 12 0c0-4-3-6-6-10z" fill="currentColor" fill-opacity=".3"/><path d="M9 14l2 2 4-4"/>'),
  fury: SVG('<path d="M13 2L5 14h6l-1 8 8-12h-6z" fill="currentColor" fill-opacity=".3"/>'),
  iron: SVG('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" fill="currentColor" fill-opacity=".25"/><path d="M8 10h8M8 14h8M12 6v12"/>'),
  bloodlust: SVG('<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" fill="currentColor" fill-opacity=".3"/><path d="M12 9v6M9 12h6"/>'),
};

/* ---------- INTERFACE ---------- */
let tab = null, dlgItem = null, panelDirty = false, lastScene = '', respecArm = 0;
const uiOpen = () => !$('#sheet').hidden || !$('#dlg').hidden || !$('#create').hidden || !$('#login').hidden;
const inTown = () => scene === 'town';
function dirtyPanel(){ panelDirty = true; }

function buildSkillbar(){
  $('#skillbar').innerHTML = ACTIVE.map(id => `<button class="sk" id="sb-${id}" data-act="useSk" data-v="${id}" aria-label="Usar ${SKD[id].n}"${AIMABLE[id] ? ` title="Segure (ou segure a tecla ${ACTIVE.indexOf(id) + 1}) e mire; solte para lançar"` : ''}>${ICON_SK[id]}<span class="cdn"></span><span class="rk"></span><span class="off"></span></button>`).join('');
}
const hudCache = {};
function setText(id, v){ if(hudCache[id] !== v){ hudCache[id] = v; $(id).textContent = v; } }
function updateHud(){
  setText('#heroName', heroName());
  const maxed = S.lv >= MAX_LV;
  setText('#lvText', 'Nv ' + S.lv + (maxed ? ' · P' + S.par : ''));
  setText('#goldText', fmt(S.gold));
  $('#xpBar').style.width = clamp((maxed ? S.pxp/parNeed(S.par) : S.xp/xpNeed(S.lv))*100, 0, 100) + '%';
  $('#xpBar').classList.toggle('para', maxed);
  setText('#speedBtn', 'x' + S.speed);
  const pct = Math.round(hero.hp/ST.life*100);
  let st = '', dot = '#9bd84a';
  if(mode === 'hunt') st = `Caçando em ${mapDef.name}`;
  else if(mode === 'portal'){ st = 'Abrindo portal…'; dot = '#8ab4ff'; }
  else if(mode === 'dead'){ st = 'Caiu em combate. Voltando para a vila…'; dot = '#d4473b'; }
  else if(mode === 'townLeave'){ st = 'Saindo pelo portal…'; dot = '#8ab4ff'; }
  else { st = hero.hp < ST.life ? 'Na vila, curando na fonte' : 'Na vila, vida cheia'; dot = '#e2ae4a'; }
  setText('#stText', st); $('#stDot').style.background = dot;
  setText('#hpText', `Vida ${fmt(hero.hp)}/${fmt(ST.life)}`);
  for(const id of ACTIVE){
    const el = $('#sb-' + id); if(!el) continue;
    const r = ST.rk(id), cdMax = SKD[id].cd*(1 - ST.cdr/100), cd = cds[id];
    el.classList.toggle('locked', r === 0);
    el.classList.toggle('ready', r > 0 && cd <= 0 && mode === 'hunt' && scene === 'map');
    el.classList.toggle('queued', hero.queued === id);
    el.classList.toggle('fire', !!(hero.cast && hero.cast.id === id));
    el.style.setProperty('--cd', r ? (cd/cdMax).toFixed(3) : 0);
    el.querySelector('.cdn').textContent = r && cd > 0 ? Math.ceil(cd) : '';
    el.querySelector('.rk').textContent = r ? r : 'Nv' + SKD[id].req;
    el.querySelector('.off').textContent = '';
  }
  const free = Math.max(0, ptsFree()) + (S.lv >= MAX_LV ? parFree() : 0);
  const pb = $('#ptsBadge'); pb.hidden = free <= 0; pb.textContent = free;
  const bb = $('#bagBadge'); bb.hidden = S.inv.length === 0; bb.textContent = S.inv.length; bb.style.background = S.inv.length >= INV_MAX ? 'var(--blood)' : '';
  $('#townBtn').hidden = !(scene === 'map' && mode === 'hunt');
  const tc = $('#townCard'); tc.hidden = !inTown() || mode === 'townLeave';
  if(!tc.hidden){
    const commons = S.inv.filter(i => i.rar === 0);
    $('#tcSell').disabled = !commons.length;
    $('#tcSell').innerHTML = `Vender comuns<small>${commons.length} itens · ${fmt(commons.reduce((s, i) => s + sellPrice(i), 0))} ouro</small>`;
    $('#tcShop').innerHTML = `Mercador<small>${S.shop.length} ${S.shop.length === 1 ? 'oferta' : 'ofertas'}</small>`;
    $('#tcGo').innerHTML = `Partir<small>${mapDef.name}</small>`;
    let info = '';
    if(hero.hp < ST.life) info = `Curando ${pct}%`;
    else if(!S.cfg.autoGo) info = 'Saída automática desligada';
    else if(uiOpen()) info = 'Esperando você fechar o menu';
    else info = `Partindo em ${Math.max(0, Math.ceil(3 - townWait))}s`;
    setText('#tcInfo', info);
  }
  if(lastScene !== scene){ lastScene = scene; panelDirty = true; }
  if(panelDirty){ panelDirty = false; if(!$('#sheet').hidden) renderPanel(); if(!$('#dlg').hidden && dlgItem) renderDlg(); }
}

function openTab(t){
  tab = t; $('#sheet').hidden = false;
  $('#sheet').classList.toggle('center', t === 'bag'); // a mochila abre no meio da tela
  $('#sheet').classList.toggle('full', t === 'rank'); // o ranking ocupa a tela toda
  if(t === 'rank') loadRank();
  document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('on', b.dataset.v === t));
  renderPanel(true);
}
function closeSheet(){ $('#sheet').hidden = true; tab = null; document.querySelectorAll('.nav button').forEach(b => b.classList.remove('on')); }
function renderPanel(top){
  const body = $('#sheetBody'), sc = body.scrollTop;
  const T2 = {shop:'Mercador', maps:'Mapas', hero:'Herói e build', bag:'Mochila', rules:'Regras da caçada', rank:'Ranking'};
  $('#sheetTitle').textContent = T2[tab];
  body.innerHTML = ({shop:panelShop, maps:panelMaps, hero:panelHero, bag:panelBag, rules:panelRules, rank:panelRank})[tab]();
  body.scrollTop = top ? 0 : sc;
}
function panelShop(){
  const town = inTown();
  let h = `<p class="note">O mercador traz 3 itens do seu nível (ilvl ${Math.max(1, S.lv)}) toda vez que você volta para a vila. Itens melhores são mais raros.</p>`;
  if(!town) h += `<p class="note" style="color:#ff8c80">O mercador fica na vila. Volte para comprar.</p>`;
  if(!S.shop.length) return h + `<p class="note">Nada à venda agora. Volte da caçada para ver ofertas novas.</p>`;
  h += `<div class="shop">` + S.shop.map(it => {
    const pr = buyPrice(it), s2 = calcStats({...S.eq, [it.slot]:it});
    const dd = s2.dps - ST.dps, dl = s2.life - ST.life;
    const cmp = `<span class="${dd > .05 ? 'g-ok' : dd < -.05 ? 'g-bad' : ''}">Dano/s ${dd > 0 ? '+' : ''}${n1(dd)}</span> · <span class="${dl > .05 ? 'g-ok' : dl < -.05 ? 'g-bad' : ''}">Vida ${dl > 0 ? '+' : ''}${n1(dl)}</span>`;
    const can = town && S.gold >= pr && S.inv.length < INV_MAX;
    const why = !town ? 'Só na vila' : S.inv.length >= INV_MAX ? 'Mochila cheia' : S.gold < pr ? 'Ouro insuficiente' : '';
    return `<div class="offer">${tileHTML(it, 'shop')}<div><div class="on" style="color:${RAR[it.rar].c}">${it.name}</div>
      <div class="om">${RAR[it.rar].n} · ${itemSlotN(it)} · ilvl ${it.ilvl}</div><div class="om">${cmp}</div>
      <div class="oa"><button class="btn primary" data-act="buy" data-v="${it.id}" ${can ? '' : 'disabled'}>Comprar <span class="price">${fmt(pr)}</span></button>${why ? `<span class="om">${why}</span>` : ''}</div></div></div>`;
  }).join('') + `</div>`;
  return h;
}
function panelMaps(){
  const my = avgIlvl();
  return `<p class="note">Escolha onde ${heroName()} caça. A ida e a volta seguem as suas regras. Acima do nível máximo de um mapa, cada nível a mais tira 12% da XP.</p><div class="maps">` + MAPS.map(m => {
    const lock = S.lv < m.req, here = S.map === m.id;
    const xm = xpMult(m), rec = mapRec(m), gq = my >= rec ? 'ok' : my >= rec - 5 ? 'mid' : 'bad';
    const xpChip = xm < 1 ? `<span class="chip bad">XP −${Math.round((1 - xm)*100)}%</span>` : `<span class="chip">XP 100%</span>`;
    const mons = m.mons.map(k => MONS[k].n).join(', ');
    let btn;
    if(lock) btn = `<button class="btn" disabled>Requer nível ${m.req}</button>`;
    else if(here && scene === 'map') btn = `<span class="chip">Caçando aqui</span>`;
    else btn = `<button class="btn primary" data-act="map" data-v="${m.id}">${here ? 'Partir para cá' : 'Caçar aqui'}</button>`;
    return `<div class="mapc${here ? ' here' : ''}${lock ? ' lock' : ''}"><span class="swatch" style="background:${m.ground[1]}"></span>
      <div class="mh"><span class="mn">${m.name}</span><span class="ml">Nv ${m.lv[0]}–${m.lv[1]}</span></div>
      <div class="mm">${m.desc}</div><div class="mm">Criaturas: ${mons}</div>
      <div class="mi"><span>Itens que caem: ilvl ${m.lv[0]}–${m.lv[1] + 1}</span><span>Recomendado: ${rec ? `ilvl ${rec}+` : 'qualquer item'}</span><span class="g-${gq}">Seu equipamento: ilvl ${my}</span></div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">${btn}${xpChip}</div></div>`;
  }).join('') + `</div>`;
}
// Ícone e nome do espaço de um item: a arma mostra espada ou arco conforme a classe do item
const itemIcon = it => it.slot === 'bow' && it.cls ? (it.cls === 'guerreiro' ? ICON_SWORD : ICON_BOW) : ICON_ITEM[it.slot];
const itemSlotN = it => it.slot === 'bow' && it.cls ? (it.cls === 'guerreiro' ? 'Arma' : 'Arco') : SLOT_N[it.slot];
function tileHTML(it, act, label){
  if(!it) return `<div class="tile empty">${ICON_ITEM[label] || ''}<span class="lbl">${SLOT_N[label] || ''}</span></div>`;
  let up = '';
  const ok = canUse(it);
  if(ok && (act === 'inv' || act === 'shop')){ const s2 = calcStats({...S.eq, [it.slot]:it}); if(s2.dps > ST.dps*1.01 || s2.life > ST.life*1.02) up = '<span class="up">▲</span>'; }
  const tag = ok ? '' : `<span class="cls-tag">${clsName(it.cls).slice(0, 3)}</span>`;
  return `<button class="tile r${it.rar}${ok ? '' : ' nouse'}" style="--rc:${RAR[it.rar].c}" data-act="item" data-v="${act}:${it.id}" aria-label="${it.name}, ilvl ${it.ilvl}${ok ? '' : ', só para ' + clsName(it.cls)}">${itemIcon(it)}<span class="il">${it.ilvl}</span>${up}${tag}${label ? `<span class="lbl">${itemSlotN(it)}</span>` : ''}</button>`;
}
function panelHero(){
  const st = ST, free = ptsFree(), town = inTown(), cost = respecCost();
  const stat = (l, v, cls) => `<div class="stat${cls ? ' ' + cls : ''}"><span>${l}</span><b>${v}</b></div>`;
  const C = S.char || {cls:'arqueiro',build:'veneno'};
  let h = `<div class="sec"><h3>${heroName()} <span class="r">${(CLASSES.find(c => c.id === C.cls) || CLASSES[0]).n} · build ${(BUILDS.find(b => b.id === C.build) || BUILDS[0]).n}</span></h3></div>
  <div class="sec"><h3>Status</h3><div class="stats">
    ${stat('Dano por segundo (estimado)', fmt(st.dps), 'big')}
    ${stat('Vida', fmt(st.life))}${stat('Armadura', fmt(st.armor))}
    ${stat('Dano da arma', `${fmt(st.min)}–${fmt(st.max)}`)}${stat('Ataques/s', n1(st.aps))}
    ${stat('Crítico', `${n1(st.crit)}% · ${fmt(st.critd)}%`)}${stat('Dano de ' + dotN(), '+' + Math.round((st.pois - 1)*100) + '%')}
    ${stat('Duração do ' + dotN(), '+' + Math.round((st.pdur - 1)*100) + '%')}${stat('Recarga', '-' + st.cdr + '%')}
    ${stat('Roubo de vida', n1(st.ls) + '%')}${stat('Movimento', fmt(st.ms))}
    ${stat('ilvl médio do equipamento', avgIlvl())}${stat('Itens equipados', SLOTS.filter(k => S.eq[k]).length + '/7')}
  </div></div>`;
  if(S.lv >= MAX_LV){
    const pf = parFree();
    h += `<div class="sec"><h3>Paragon ${S.par} <span class="r">${pf} ${pf === 1 ? 'ponto livre' : 'pontos livres'}</span></h3>
      <p class="note">Depois do nível ${MAX_LV}, a XP vira níveis de Paragon. Cada um dá 1 ponto para gastar aqui, em qualquer lugar. O nível de Paragon conta no ranking.</p>`;
    h += Object.keys(PARA).map(k => {
      const P = PARA[k], v = S.pp[k], can = pf > 0 && (!P.max || v < P.max);
      const ic = isWar() ? {dmg:'cleave', pois:'brutality', life:'iron', ias:'fury'} : {dmg:'arrow', pois:'potency', life:'hide', ias:'agility'};
      return `<div class="skill"><div class="ico" style="color:#c9a8ff">${ICON_SK[ic[k]]}</div>
        <div><div class="sn">${P.n} <em>${P.max ? `máx. ${P.max}` : 'sem limite'}</em></div><div class="sd">${P.d(v)} agora</div></div>
        <div class="ctl"><span class="rank">${v}${P.max ? '/' + P.max : ''}</span><button class="plus" data-act="parUp" data-v="${k}" ${can ? '' : 'disabled'} aria-label="Adicionar ponto de Paragon em ${P.n}">+</button></div></div>`;
    }).join('');
    h += `<button class="btn" data-act="parReset" ${S.par - pf > 0 ? '' : 'disabled'}>Redistribuir pontos de Paragon<small>Grátis</small></button></div>`;
  }
  h += `<div class="sec"><h3>Equipamento</h3><div class="eqgrid">${SLOTS.map(s => tileHTML(S.eq[s], 'eq', s)).join('')}</div></div>`;
  h += `<div class="sec"><h3>Habilidades <span class="r">${free} ${free === 1 ? 'ponto livre' : 'pontos livres'}</span></h3>`;
  h += `<p class="note">Pode gastar pontos a qualquer hora, até no meio da caçada. Redistribuir todos os pontos só na vila.</p>`;
  const row = id => {
    const k = SKD[id], base = S.sk[id], bonus = base ? (st.bonus[id] || 0) : 0, lockLv = S.lv < k.req;
    const canUp = free > 0 && !lockLv && base < k.max;
    const type = k.act ? `Ativa · ${n1(k.cd*(1 - st.cdr/100))}s` : 'Passiva';
    const tog = '';
    return `<div class="skill${lockLv ? ' locked' : ''}"><div class="ico">${ICON_SK[id]}</div>
      <div><div class="sn">${k.n} <em>${lockLv ? 'Libera no nível ' + k.req : type}</em></div><div class="sd">${skDesc(id, st)}</div></div>
      <div class="ctl"><span class="rank">${base}${bonus ? ` <span style="color:var(--r3)">+${bonus}</span>` : ''}/${k.max}</span>
      <button class="plus" data-act="skUp" data-v="${id}" ${canUp ? '' : 'disabled'} aria-label="Adicionar ponto em ${k.n}">+</button>${tog}</div></div>`;
  };
  h += `<p class="note">As habilidades ativas são manuais: toque nelas na barra embaixo do mapa para usar. O ataque normal continua automático.</p>` + ACTIVE.map(row).join('') + `<h3 style="margin-top:6px">Passivas</h3>` + PASSIVE.map(row).join('');
  h += `<button class="btn ${respecArm > performance.now() ? 'warn' : ''}" data-act="respec" ${town && S.gold >= cost ? '' : 'disabled'}>${respecArm > performance.now() ? 'Toque de novo para confirmar' : 'Redistribuir todos os pontos'}<small>Custa ${fmt(cost)} ouro${town ? '' : ' · só na vila'}</small></button></div>`;
  return h;
}
const respecCost = () => 25*S.lv;
// Mochila: janela no meio da tela com INV_MAX quadrados. Itens além do limite (saves antigos) aparecem em quadrados vermelhos.
function panelBag(){
  const town = inTown(), n = S.inv.length, over = n > INV_MAX;
  const count = r => S.inv.filter(i => i.rar === r).length;
  const slots = [];
  for(let i = 0; i < Math.max(INV_MAX, n); i++){
    const it = S.inv[i];
    slots.push(`<div class="slot${i >= INV_MAX ? ' over' : ''}">${it ? tileHTML(it, 'inv') : ''}</div>`);
  }
  let h = `<div class="sec"><h3>Itens <span class="r" style="${over || n === INV_MAX ? 'color:#ff8c80' : ''}">${n}/${INV_MAX}</span></h3>
    <div class="inv-grid">${slots.join('')}</div>`;
  if(over) h += `<p class="note" style="color:#ff8c80">A mochila agora tem ${INV_MAX} espaços. Venda ou jogue fora ${n - INV_MAX} ${n - INV_MAX === 1 ? 'item' : 'itens'} para voltar a recolher do chão.</p>`;
  else if(!n) h += `<p class="note">A mochila está vazia. Os itens do chão são recolhidos sozinhos durante a caçada.</p>`;
  h += `<p class="legend">Toque num item para ver e comparar. O número no canto é o ilvl. ▲ melhora seu dano ou sua vida. ◆ atributo perto do máximo.</p></div>`;
  h += `<div class="sec"><h3>Vender em lote</h3>${town ? '' : '<p class="note">O mercador fica na vila. Volte para vender.</p>'}<div class="bulk">
    ${[0,1,2].map(r => `<button class="btn" data-act="sellR" data-v="${r}" ${town && count(r) ? '' : 'disabled'} style="color:${RAR[r].c}">${RAR[r].n}s<small>${count(r)} itens</small></button>`).join('')}</div></div>`;
  return h;
}
function panelRules(){
  const c = S.cfg;
  const sw = (key, label, small) => `<div class="row"><label for="cfg-${key}">${label}${small ? `<small>${small}</small>` : ''}</label><input type="checkbox" class="switch" id="cfg-${key}" data-cfg="${key}" ${c[key] ? 'checked' : ''}></div>`;
  return `<div class="retbox"><label for="cfg-ret" style="font-size:15px">Voltar para a vila quando a vida chegar em</label>
    <div class="big" id="retVal">${c.ret}%</div>
    <input type="range" id="cfg-ret" min="10" max="90" step="5" value="${c.ret}">
    <p class="note">A marca branca na barra de vida da Víbora mostra esse limite.</p></div>
    <div class="sec">${sw('retFull', 'Voltar quando a mochila encher', `${INV_MAX} espaços`)}
    ${sw('autoGo', 'Voltar a caçar depois de curar', 'Espera 3s na vila. Pausa enquanto um menu está aberto.')}
    ${sw('autoSell', 'Vender itens comuns ao chegar na vila')}
    <div class="row"><label for="cfg-minPick">Pegar itens do chão a partir de</label><select id="cfg-minPick" data-cfg="minPick">${RAR.map((r, i) => `<option value="${i}" ${c.minPick === i ? 'selected' : ''}>${r.n}</option>`).join('')}</select></div></div>
    <div class="sec"><h3>Conta</h3>
      <div class="row"><label>${esc(fbUser ? (fbUser.email || fbUser.displayName || 'Conta Google') : 'Sem conta')}<small>${esc(heroName())} fica salvo na sua conta Google e aparece no ranking. Entre com a mesma conta em qualquer aparelho para continuar.</small></label><button class="btn" data-act="logout">Sair</button></div>
    </div>
    <div class="sec"><h3>Registro</h3><div class="stats"><div class="stat"><span>Criaturas abatidas</span><b>${fmt(S.kills)}</b></div><div class="stat"><span>Velocidade</span><b>x${S.speed}</b></div></div></div>
    <button class="btn" data-act="switchChar">Trocar de personagem<small>Volta para a lista de personagens da conta</small></button>`;
}
function findItem(where, id){ id = +id; if(where === 'shop') return S.shop.find(i => i.id === id); if(where === 'eq') return SLOTS.map(s => S.eq[s]).find(i => i && i.id === id); return S.inv.find(i => i.id === id); }
function openItem(v){ const [where, id] = v.split(':'); const it = findItem(where, id); if(!it) return; dlgItem = {where, id:+id}; $('#dlg').hidden = false; renderDlg(); }
// Comparação atributo por atributo entre o item clicado e o equipado no mesmo espaço
const DIFF_L = {wdmg:'de dano médio da arma', aps:'ataques/s', barmor:'de armadura base', life:'de vida', get pois(){ return '% de dano de ' + dotN(); }, ias:'% de velocidade de ataque', crit:'% de chance de crítico', critd:'% de dano crítico', ms:'% de velocidade de movimento', armor:'de armadura', ls:'% do dano vira vida', cdr:'% de redução de recarga', get pdur(){ return '% de duração do ' + dotN(); }, gf:'% de ouro encontrado'};
const DIFF_DEC = {aps:1, crit:1, ls:1};
function itemVals(it){
  const v = {}; if(!it) return v;
  if(it.slot === 'bow'){ v.wdmg = (it.min + it.max)/2; v.aps = it.aps; }
  if(it.armor) v.barmor = it.armor;
  for(const a of it.affix){ const k = a.k === 'skill' ? 'sk:' + a.s : a.k; v[k] = (v[k] || 0) + a.v; }
  return v;
}
function itemDiff(it, cur){
  const a = itemVals(it), b = itemVals(cur), gain = [], lose = [];
  const keys = [...Object.keys(DIFF_L), ...ACTIVE.concat(PASSIVE).map(s => 'sk:' + s)].filter(k => k in a || k in b);
  for(const k of keys){
    const d = (a[k] || 0) - (b[k] || 0); if(Math.abs(d) < .05) continue;
    const num = DIFF_DEC[k] ? n1(Math.abs(d)) : fmt(Math.abs(d));
    const lab = k.startsWith('sk:') ? `${num} em ${SKD[k.slice(3)].n}` : DIFF_L[k].startsWith('%') ? num + DIFF_L[k] : `${num} ${DIFF_L[k]}`;
    (d > 0 ? gain : lose).push(lab);
  }
  const li = (arr, s) => arr.length ? arr.map(x => `<li>${s}${x}</li>`).join('') : '<li class="none">Nada</li>';
  return `<div class="diff"><div class="dg"><h4>Vai ganhar</h4><ul>${li(gain, '+')}</ul></div><div class="dl"><h4>Vai perder</h4><ul>${li(lose, '−')}</ul></div></div>`;
}
function renderDlg(){
  const it = findItem(dlgItem.where, dlgItem.id); if(!it){ closeDlg(); return; }
  const isEq = dlgItem.where === 'eq', isShop = dlgItem.where === 'shop', town = inTown(), col = RAR[it.rar].c;
  const card = $('#dcard'); card.style.setProperty('--rc', col);
  let base = '';
  if(it.slot === 'bow') base = `${fmt(it.min)}–${fmt(it.max)} de dano · ${n1(it.aps)} ataques/s${it.bt >= .9 ? ' <span style="color:var(--r3)">◆</span>' : ''}`;
  else if(it.armor) base = `${fmt(it.armor)} de armadura${it.bt >= .9 ? ' <span style="color:var(--r3)">◆</span>' : ''}`;
  const aff = it.affix.map(a => a.k === 'skill' ? `<li class="sk2">+${a.v} em ${SKD[a.s].n}${a.v === 2 ? ' ◆' : ''}</li>` : `<li class="${a.t >= .9 ? 'perf' : ''}">${AFX[a.k].n(a.v)}${a.t >= .9 ? ' ◆' : ''}</li>`).join('');
  const other = isEq ? calcStats({...S.eq, [it.slot]:null}) : calcStats({...S.eq, [it.slot]:it});
  const dd = isEq ? ST.dps - other.dps : other.dps - ST.dps, dl = isEq ? ST.life - other.life : other.life - ST.life;
  const sg = (v, lab) => `<span class="${v > .05 ? 'p' : v < -.05 ? 'n' : ''}">${lab} ${v > 0 ? '+' : ''}${n1(v)} ${v > .05 ? '▲' : v < -.05 ? '▼' : ''}</span>`;
  const cur = S.eq[it.slot];
  card.innerHTML = `<h2 class="dname">${it.name}</h2>
    <div class="dtype">${RAR[it.rar].n} · ${itemSlotN(it)} · ilvl ${it.ilvl}${isEq ? ' · equipado' : ''}${it.cls ? ` · <span style="color:${canUse(it) ? 'var(--muted)' : '#ff8c80'}">só ${clsName(it.cls)}</span>` : ''}</div>
    ${base ? `<div class="dbase">${base}</div>` : ''}
    ${aff ? `<ul class="daff">${aff}</ul>` : ''}
    <div class="cmp"><span style="color:var(--muted)">${isEq ? 'Este item te dá' : cur ? 'Trocando por ' + cur.name : 'Equipando'}:</span>${sg(dd, 'Dano/s')}${sg(dl, 'Vida')}</div>
    ${isEq ? '' : itemDiff(it, cur)}
    ${isShop ? `<div class="dact"><button class="btn primary full" data-act="buy" data-v="${it.id}" ${town && S.gold >= buyPrice(it) && S.inv.length < INV_MAX ? '' : 'disabled'}>Comprar<small>${fmt(buyPrice(it))} ouro · você tem ${fmt(S.gold)}</small></button><button class="btn full" data-act="dlgClose">Fechar</button></div>` : `<div class="dact">
      ${isEq ? `<button class="btn" data-act="unequip" ${S.inv.length < INV_MAX ? '' : 'disabled'}>Guardar na mochila</button>` : canUse(it) ? `<button class="btn primary" data-act="equip">Equipar</button>` : `<button class="btn" disabled>Só ${clsName(it.cls)} usa</button>`}
      ${isEq ? '' : `<button class="btn gold" data-act="sell" ${town ? '' : 'disabled'}>${town ? 'Vender' : 'Vender na vila'}<small>${fmt(sellPrice(it))} ouro</small></button>`}
      ${isEq ? '' : `<button class="btn warn" data-act="drop">Jogar fora</button>`}
      <button class="btn" data-act="dlgClose">Fechar</button>
    </div>`}`;
}
function closeDlg(){ $('#dlg').hidden = true; dlgItem = null; }
let crSel = {cls:'arqueiro', build:'veneno', color:0};
const CLS_ICON = {arqueiro:ICON_BOW, guerreiro:ICON_SWORD, feiticeira:SVG('<path d="M6 21L16 5"/><circle cx="17" cy="4" r="2" fill="currentColor"/><path d="M19 9l1 2M13 2l1 1"/>')};
const BLD_ICON = {veneno:ICON_SK.tip, sangramento:ICON_SK.serrated, gelo:SVG('<path d="M12 2v20M3 7l18 10M21 7L3 17"/>'), fogo:SVG('<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-4 5-4 7-1-1-2-2-2-4-2 2-3 5-3 9 0 4 3 7 7 7z"/>')};
function showCreate(){ crSel = {cls:'arqueiro', build:'veneno', color:0}; $('#create').hidden = false; renderCreate(''); }
function renderCreate(name){
  const nm = name !== undefined ? name : ($('#crName') ? $('#crName').value : '');
  const opt = (list, icons, key) => list.map(o => `<button class="opt${crSel[key] === o.id ? ' on' : ''}" data-act="crPick" data-v="${key}:${o.id}" ${o.ok ? '' : 'disabled'}>${icons[o.id]}${o.n}<small>${o.d}</small></button>`).join('');
  const war = crSel.cls === 'guerreiro';
  const intro = war
    ? 'Começa com uma Espada Enferrujada e o Golpe Dilacerante. A Investida, o Giro de Lâmina e a Ruptura liberam com o nível. Luta colado nos inimigos, com mais vida e armadura, e faz eles sangrarem.'
    : 'Começa com um Arco Simples e a Flecha Venenosa. O Leque Tóxico, a Chuva Ácida e a Explosão de Praga liberam com o nível. Ataca de longe e envenena.';
  $('#crBody').innerHTML = `<h1>Novo personagem</h1><p class="lead">Escolha quem vai caçar por você: o Arqueiro de Veneno ou o Guerreiro de Sangramento.</p>
    <label class="field"><span>Nome</span><input class="txtin" id="crName" type="text" maxlength="14" autocomplete="off" placeholder="${war ? 'Carniceiro' : 'Víbora'}" value="${nm.replace(/"/g, '&quot;')}"></label>
    <div class="field"><h3>Classe</h3><div class="opts">${opt(CLASSES, CLS_ICON, 'cls')}</div></div>
    <div class="field"><h3>Build</h3><div class="opts">${opt(buildsFor(crSel.cls), BLD_ICON, 'build')}</div></div>
    <div class="field"><h3>Cor da ${war ? 'armadura' : 'capa'}</h3><div class="sw">${CLOAKS.map((c, i) => `<button class="${crSel.color === i ? 'on' : ''}" style="background:${c.b}" data-act="crColor" data-v="${i}" aria-label="Cor ${c.n}"></button>`).join('')}</div></div>
    <p class="note">${intro} Você usa as habilidades tocando nelas ou nas teclas 1 a 4.</p>
    <button class="btn primary" data-act="create" style="padding:14px;font-size:17px">Começar a caçada</button>
    <button class="btn" data-act="crBack">Voltar para os personagens</button>`;
}
function sellWhere(fn, quiet){
  const sold = S.inv.filter(fn); if(!sold.length) return;
  const g = sold.reduce((s, i) => s + sellPrice(i), 0);
  S.inv = S.inv.filter(i => !fn(i)); S.gold += g;
  log(`Vendeu ${sold.length} ${sold.length === 1 ? 'item' : 'itens'} por ${fmt(g)} ouro`, '#e2ae4a');
  dirtyPanel(); save();
}

const ACT = {
  tab: v => tab === v && !$('#sheet').hidden ? closeSheet() : openTab(v),
  close: () => closeSheet(),
  speed: () => { S.speed = S.speed >= 3 ? 1 : S.speed + 1; dirtyPanel(); },
  map: v => {
    const m = MAPS.find(x => x.id === v); if(!m || S.lv < m.req) return;
    S.map = v; mapDef = m;
    if(scene === 'town'){ closeSheet(); depart(); }
    else if(mode === 'hunt'){ closeSheet(); startPortal('map', `Indo para ${m.name}`); }
    dirtyPanel();
  },
  go: () => depart(),
  useSk: v => { if(performance.now() < skipClickT) return; manualCast(v); },
  buy: v => {
    const it = S.shop.find(i => i.id === +v); if(!it || !inTown()) return;
    const pr = buyPrice(it); if(S.gold < pr || S.inv.length >= INV_MAX) return;
    S.gold -= pr; S.shop = S.shop.filter(i => i !== it); S.inv.push(it);
    log(`Comprou ${it.name} por ${fmt(pr)} ouro`, RAR[it.rar].c);
    if(dlgItem && dlgItem.where === 'shop') closeDlg();
    dirtyPanel(); save();
  },
  goTown: () => { if(scene === 'map' && mode === 'hunt') startPortal('town', 'Voltando para a vila'); },
  autoT: v => { if(!ST.rk(v)){ openTab('hero'); return; } S.auto[v] = !S.auto[v]; log(`${SKD[v].n}: ${S.auto[v] ? 'uso automático ligado' : 'desligada'}`); dirtyPanel(); },
  login: () => accountLogin(),
  logout: () => accountLogout(),
  rankRefresh: () => { loadRank(); dirtyPanel(); },
  rankCls: v => { if(rankCls === v) return; rankCls = v; rankList = null; rankLoading = false; loadRank(); dirtyPanel(); },
  parUp: v => { const P = PARA[v]; if(!P || parFree() <= 0 || (P.max && S.pp[v] >= P.max)) return; S.pp[v]++; refreshStats(); dirtyPanel(); save(); },
  parReset: () => { for(const k in S.pp) S.pp[k] = 0; refreshStats(); dirtyPanel(); save(); },
  skUp: v => { if(ptsFree() <= 0 || S.lv < SKD[v].req || S.sk[v] >= SKD[v].max) return; S.sk[v]++; refreshStats(); dirtyPanel(); save(); },
  respec: () => {
    if(!inTown() || S.gold < respecCost()) return;
    if(respecArm < performance.now()){ respecArm = performance.now() + 3000; dirtyPanel(); setTimeout(dirtyPanel, 3050); return; }
    respecArm = 0; S.gold -= respecCost(); for(const k in S.sk) S.sk[k] = 0; refreshStats(); log('Pontos devolvidos. Distribua de novo.', '#e2ae4a'); dirtyPanel(); save();
  },
  item: v => openItem(v),
  dlgClose: () => closeDlg(),
  equip: () => {
    const it = findItem('inv', dlgItem.id); if(!it || !canUse(it)) return;
    const old = S.eq[it.slot]; S.eq[it.slot] = it; S.inv = S.inv.filter(i => i !== it); if(old) S.inv.push(old);
    refreshStats(); log(`Equipou ${it.name}`, RAR[it.rar].c); closeDlg(); dirtyPanel(); save();
  },
  unequip: () => { const it = findItem('eq', dlgItem.id); if(!it || S.inv.length >= INV_MAX) return; S.eq[it.slot] = null; S.inv.push(it); refreshStats(); closeDlg(); dirtyPanel(); save(); },
  sell: () => { if(!inTown()) return; const id = dlgItem.id; sellWhere(i => i.id === id); closeDlg(); },
  drop: () => { const id = dlgItem.id; S.inv = S.inv.filter(i => i.id !== id); closeDlg(); dirtyPanel(); },
  sellR: v => { if(!inTown()) return; const r = +v; sellWhere(i => i.rar === r); },
  crPick: v => { const [k, id] = v.split(':'); crSel[k] = id; if(k === 'cls') crSel.build = buildsFor(id).find(b => b.ok).id; renderCreate(); },
  crColor: v => { crSel.color = +v; renderCreate(); },
  create: () => {
    const name = ($('#crName').value || '').trim().slice(0, 14) || (crSel.cls === 'guerreiro' ? 'Carniceiro' : 'Víbora');
    const s = defaults(crSel.cls); s.char = {name, cls:crSel.cls, build:crSel.build, color:crSel.color}; s.cid = newCid();
    $('#create').hidden = true; playChar(s);
    log(`${name} parte para a primeira caçada`, '#9bd84a');
  },
  // Tela de personagens (09-conta.js)
  crBack: () => { $('#create').hidden = true; showChars(); },
  pickChar: v => { const c = acct && acct.chars.find(x => x.cid === v); if(c) playChar(c); },
  delChar: v => deleteChar(v),
  newChar: () => newChar(),
  switchChar: () => switchChar(),
};
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if(!b || b.disabled) return; const f = ACT[b.dataset.act]; if(f) f(b.dataset.v, b); });
document.addEventListener('change', e => {
  const el = e.target; const k = el.dataset && el.dataset.cfg;
  if(k){ S.cfg[k] = el.type === 'checkbox' ? el.checked : +el.value; save(); }
});
document.addEventListener('input', e => { if(e.target.id === 'cfg-ret'){ S.cfg.ret = +e.target.value; $('#retVal').textContent = S.cfg.ret + '%'; } });
document.addEventListener('keydown', e => {
  if(e.target.closest('input,textarea')) return;
  const i = '1234'.indexOf(e.key);
  if(i >= 0){
    const id = ACTIVE[i];
    if(AIMABLE[id]){ if(e.repeat || aim) return; if(canAim(id)){ aim = {id, src:'key', key:e.key}; return; } }
    if(id === 'arrow'){ const h = hoverMon(); if(h){ if(!e.repeat) setFocus(h); manualCast(id, {tgt:h}); return; } }
    manualCast(id);
  }
  if(e.key === 'Escape' && aim){ aim = null; return; }
  if(e.key.toLowerCase() === 't') ACT.goTown();
});
document.addEventListener('keyup', e => { if(aim && aim.src === 'key' && e.key === aim.key) aimRelease(); });
window.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true; });
window.addEventListener('contextmenu', e => { if(aim){ e.preventDefault(); aim = null; } });
window.addEventListener('blur', () => { aim = null; });
// Clicar/tocar numa criatura troca o alvo; tocar no chão vazio volta ao alvo automático
cv.addEventListener('pointerdown', e => {
  if(e.button > 0 || scene !== 'map' || mode !== 'hunt') return;
  const r = cv.getBoundingClientRect();
  setFocus(monAt(e.clientX - r.left, e.clientY - r.top, e.pointerType === 'mouse' ? 6 : 22));
});
// Mira por toque: segura no botão, arrasta e solta
$('#skillbar').addEventListener('pointerdown', e => {
  if(e.pointerType === 'mouse' || aim) return;
  const b = e.target.closest('.sk'); if(!b || !canAim(b.dataset.v)) return;
  aim = {id:b.dataset.v, src:'touch', pid:e.pointerId, ox:e.clientX, oy:e.clientY, dx:0, dy:0, moved:false};
  try{ b.setPointerCapture(e.pointerId); }catch(_){}
});
window.addEventListener('pointermove', e => {
  if(!aim || aim.src !== 'touch' || e.pointerId !== aim.pid) return;
  aim.dx = e.clientX - aim.ox; aim.dy = e.clientY - aim.oy;
  if(Math.hypot(aim.dx, aim.dy) > AIM_DEAD) aim.moved = true;
  e.preventDefault();
}, {passive:false});
const touchEnd = cancel => e => {
  if(!aim || aim.src !== 'touch' || e.pointerId !== aim.pid) return;
  skipClickT = performance.now() + 500;
  if(cancel) aim = null; else aimRelease();
};
window.addEventListener('pointerup', touchEnd(false));
window.addEventListener('pointercancel', touchEnd(true));
$('#skillbar').addEventListener('contextmenu', e => e.preventDefault());
// Ao sair ou esconder a aba, salva e manda para a nuvem na hora
document.addEventListener('visibilitychange', () => { if(document.hidden){ save(); cloudFlush(); } });
window.addEventListener('pagehide', () => { save(); cloudFlush(); });
