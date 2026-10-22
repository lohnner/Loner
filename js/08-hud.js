// HUD: ícones, barra de habilidades, painéis (mapas, herói, mochila, regras, ranking), diálogos, criação de personagem, ações (ACT) e eventos de teclado/mouse/toque.
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- ÍCONES ---------- */
const SVG = (inner, fill) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="${fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
const ICON_BOW = SVG('<path d="M7 3c8 3 8 15 0 18"/><path d="M7 3v18" stroke-width="1"/><path d="M5 12h14M16 9l3 3-3 3"/>');
const ICON_SWORD = SVG('<path d="M14.5 3H21v6.5L10 20.5 3.5 14z" fill="currentColor" fill-opacity=".25"/><path d="M8 13l3 3M4 17l3 3M6.5 15.5L3 19"/>');
const ICON_STAFF = SVG('<path d="M5 21L15 9"/><circle cx="17.5" cy="6.5" r="3.5" fill="currentColor" fill-opacity=".35"/><path d="M17.5 1.5v1.5M22.5 6.5H21M21 3l-1 1"/>');
const WEAPON_ICON = {arqueiro:ICON_BOW, guerreiro:ICON_SWORD, mago:ICON_STAFF};
const ICON_ITEM = {
  get bow(){ return WEAPON_ICON[clsOf()]; },
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
  // Mago
  firebolt: SVG('<path d="M4 20l7-7"/><path d="M15 3c1 3 6 3 6 8a6 6 0 0 1-12 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 2-7z" fill="currentColor" fill-opacity=".3"/>'),
  flamewave: SVG('<path d="M3 12l8-7v14z" fill="currentColor" fill-opacity=".2"/><path d="M13 7c2 1 2 3 0 5s-2 4 0 5M17 5c3 2 3 5 0 7s-3 5 0 7"/>'),
  meteor: SVG('<path d="M3 3l9 9M7 3l7 7M3 7l7 7"/><circle cx="16" cy="16" r="5" fill="currentColor" fill-opacity=".35"/>'),
  inferno: SVG('<path d="M12 22c5 0 8-3.5 8-8 0-5-4-6-5-11-2 2-3 4-3 6-1-1-2-2-2-4-3 3-6 6-6 9 0 4.5 3 8 8 8z" fill="currentColor" fill-opacity=".3"/><path d="M12 22c-2 0-3-1.5-3-3.5S12 14 12 14s3 2.5 3 4.5-1 3.5-3 3.5z" fill="currentColor"/>'),
  kindle: SVG('<path d="M12 3c-1 4-5 6-5 10a5 5 0 0 0 10 0c0-4-4-6-5-10z"/><circle cx="12" cy="14" r="2" fill="currentColor"/>'),
  pyro: SVG('<path d="M9 3h6M10 3v6L5 19a1.5 1.5 0 0 0 1.4 2h11.2A1.5 1.5 0 0 0 19 19l-5-10V3"/><path d="M12 13c-1 2-2 2.5-2 4a2 2 0 0 0 4 0c0-1.5-1-2-2-4z" fill="currentColor"/>'),
  channel: SVG('<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 3"/><path d="M4 4l2 2M20 4l-2 2" />'),
  ward: SVG('<circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity=".2"/><path d="M12 6l1.6 3.8 4 .4-3 2.7.9 4L12 14.8 8.5 16.9l.9-4-3-2.7 4-.4z"/>'),
  combust: SVG('<circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" stroke-width="2.2"/>'),
  // Supremas (nível 40)
  storm: SVG('<path d="M6 10a4 4 0 0 1 1-7.8A5 5 0 0 1 16.5 4 3.5 3.5 0 0 1 17 11z" fill="currentColor" fill-opacity=".3"/><path d="M7 13l-2 8M11 13l-2 8M15 13l-2 8M19 13l-2 8"/><path d="M5 21l-1-2M9 21l-1-2M13 21l-1-2M17 21l-1-2"/>'),
  titan: SVG('<path d="M12 2l3 6 6 1-4.5 4 1 6.5L12 16l-5.5 3.5 1-6.5L3 9l6-1z" fill="currentColor" fill-opacity=".3"/><path d="M12 7v6M9.5 10.5h5"/>'),
  cataclysm: SVG('<circle cx="8" cy="8" r="3.5" fill="currentColor" fill-opacity=".35"/><circle cx="17" cy="6" r="2.5" fill="currentColor" fill-opacity=".35"/><circle cx="15" cy="15" r="4" fill="currentColor" fill-opacity=".35"/><path d="M3 3l3 3M13 2l2 2M9 9l3 3M3 21h18"/>'),
  bloodlust: SVG('<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" fill="currentColor" fill-opacity=".3"/><path d="M12 9v6M9 12h6"/>'),
};

/* ---------- INTERFACE ---------- */
let tab = null, dlgItem = null, panelDirty = false, lastScene = '', respecArm = 0;
const uiOpen = () => !$('#sheet').hidden || !$('#dlg').hidden || !$('#create').hidden || !$('#login').hidden;
const inTown = () => scene === 'town';
function dirtyPanel(){ panelDirty = true; }

const ICON_DODGE = SVG('<path d="M4 17c3-1 5-4 6-8M10 9l3 2 2-4"/><circle cx="16" cy="5" r="2" fill="currentColor"/><path d="M3 21h6M2 13h4M3 9h3" stroke-dasharray="2 2"/><path d="M13 11l4 3-2 6"/>');
/* ---------- MINIMAPA ---------- */
// Pequeno (canto de cima à direita): só o que já foi visto. Grande (toque nele): mostra também as áreas ainda não visitadas.
// As criaturas só aparecem quando faltam MM_SHOW ou menos.
const MM_SHOW = 10;
function drawMinimap(){
  const wrap = $('#mmWrap'), show = scene === 'map' && !!LV && mode !== 'dead';
  wrap.hidden = !show; if(!show) return;
  wrap.classList.toggle('big', minimapBig);
  const c = $('#mm'), px = Math.round((minimapBig ? Math.min(440, innerWidth*.86) : 96) * Math.min(2, devicePixelRatio || 1));
  if(c.width !== px){ c.width = px; c.height = px; }
  const g = c.getContext('2d'), N = LV_N, k = px/N;
  g.clearRect(0, 0, px, px);
  for(let y = 0; y < N; y++) for(let x = 0; x < N; x++){
    const t = LV.g[y*N + x]; if(!t) continue;
    const seen = LV.seen[y*N + x];
    if(seen) g.fillStyle = t === 2 ? '#6a6458' : '#b8b09a';
    else if(minimapBig) g.fillStyle = '#5a2a2a'; // não visitado
    else continue;
    g.fillRect(x*k, y*k, Math.ceil(k), Math.ceil(k));
  }
  // criaturas: só quando faltam poucas
  const left = monsLeft();
  if(left > 0 && left <= MM_SHOW){ g.fillStyle = '#ff4a3a'; for(const m of mons) if(!m.dead){ g.beginPath(); g.arc(m.x/TILE*k, m.y/TILE*k, Math.max(2.5, k*.45), 0, TAU); g.fill(); } }
  // herói
  g.fillStyle = '#9bd84a'; g.strokeStyle = '#0c0f0d'; g.lineWidth = Math.max(1, k*.15); g.beginPath(); g.arc(hero.x/TILE*k, hero.y/TILE*k, Math.max(3, k*.55), 0, TAU); g.fill(); g.stroke();
  if(minimapBig){ g.font = `700 ${Math.round(px/26)}px "Alegreya Sans", sans-serif`; g.fillStyle = '#e9e3d1'; g.fillText('■ visitado', 8, px - 30); g.fillStyle = '#c86a6a'; g.fillText('■ ainda não visitado', 8, px - 10); }
  const el = $('#mmLeft');
  const txt2 = inDun() ? `Fase ${S.dun.phase} · ${ELEM[dunElem(S.dun.phase)].n} · faltam ${left}` : left ? `Faltam ${left} criatura${left === 1 ? '' : 's'}` : 'Mapa limpo! Volte para a vila';
  if(el.textContent !== txt2) el.textContent = txt2;
  el.classList.toggle('done', !left && !inDun());
}
// Habilidades na barra: as 4 da classe e, no nível 40, a suprema (tecla 5)
const barSkills = () => ultOf() ? [...ACTIVE, ultOf()] : ACTIVE;
// Botões no canto de baixo à direita (celular deitado): ataque grande no canto, as 4 habilidades em arco em volta dele
// e, num arco de fora, a esquiva (à esquerda) e a suprema. Posição = ângulo (graus; 180 = esquerda, 90 = em cima) e raio a partir do centro do ataque.
const SB_ATK = 88, SB_SK = 60, SB_M = 14, SB_R = 112, SB_R2 = 190;
const SB_ARC = [192, 156, 120, 84], SB_DODGE = 180, SB_ULT = 136;
function sbPos(ang, r, size){
  const c = SB_M + SB_ATK/2, a = ang*Math.PI/180;
  return `right:${Math.round(c - Math.cos(a)*r - size/2)}px;bottom:${Math.round(c + Math.sin(a)*r - size/2)}px`;
}
function buildSkillbar(){
  const ult = ultOf();
  $('#skillbar').innerHTML =
    `<button class="sk atk" id="sb-atk" data-act="atk" style="${sbPos(0, 0, SB_ATK)}" aria-label="Atacar" title="Atacar (clique ou segure o mouse no mapa)">${WEAPON_ICON[clsOf()]}<span class="cdn"></span></button>` +
    `<button class="sk dodge" id="sb-dodge" data-act="dodge" style="${sbPos(SB_DODGE, SB_R2, SB_SK)}" aria-label="${DODGE[clsOf()].n} (esquiva)" title="${DODGE[clsOf()].n} — esquiva (barra de espaço)">${ICON_DODGE}<span class="cdn"></span><span class="rk">Espaço</span></button>` +
    barSkills().map(id => `<button class="sk${SKD[id].ult ? ' ult' : ''}" id="sb-${id}" data-act="useSk" data-v="${id}" style="${id === ult ? sbPos(SB_ULT, SB_R2, SB_SK) : sbPos(SB_ARC[ACTIVE.indexOf(id)], SB_R, SB_SK)}" aria-label="Usar ${SKD[id].n}"${AIMABLE[id] ? ` title="Segure (ou segure a tecla ${ACTIVE.indexOf(id) + 1}) e mire; solte para lançar"` : ''}>${ICON_SK[id]}<span class="cdn"></span><span class="rk"></span><span class="off"></span></button>`).join('');
}
// Menu de cima (abas): a seta esconde (fica só a seta para baixo) e mostra de novo; lembrado neste aparelho
function setNav(shut){
  $('#nav').classList.toggle('shut', shut);
  const b = $('#navTog'); b.setAttribute('aria-expanded', String(!shut)); b.setAttribute('aria-label', shut ? 'Mostrar menu' : 'Esconder menu');
  try{ localStorage.setItem('loner-nav', shut ? 'shut' : 'open'); }catch(e){}
}
try{ if(localStorage.getItem('loner-nav') === 'shut') setNav(true); }catch(e){}
const hudCache = {};
function setText(id, v){ if(hudCache[id] !== v){ hudCache[id] = v; $(id).textContent = v; } }
function updateHud(){
  setText('#heroName', heroName());
  const NC = lookOf('name'); $('#heroName').style.color = NC ? (NC.rainbow ? `hsl(${(T*90) % 360 | 0},90%,65%)` : NC.c) : '';
  const maxed = S.lv >= MAX_LV;
  setText('#lvText', 'Nv ' + S.lv + (maxed ? ' · P' + S.par : ''));
  setText('#goldText', fmt(S.gold));
  $('#xpBar').style.width = clamp((maxed ? S.pxp/parNeed(S.par) : S.xp/xpNeed(S.lv))*100, 0, 100) + '%';
  $('#xpBar').classList.toggle('para', maxed);
  const pct = Math.round(hero.hp/ST.life*100);
  let st = '', dot = '#9bd84a';
  if(mode === 'hunt' && inDun()){ st = `Masmorra · fase ${S.dun.phase} (${ELEM[dunElem(S.dun.phase)].n}) · ${S.dun.kills}/${DUN_KILLS} abates`; dot = ELEM[dunElem(S.dun.phase)].c; }
  else if(mode === 'hunt') st = mapCleared ? `${mapDef.name} limpo! Volte para a vila` : `${mapDef.name} · faltam ${monsLeft()} criaturas`;
  else if(mode === 'portal'){ st = 'Abrindo portal…'; dot = '#8ab4ff'; }
  else if(mode === 'dead'){ st = 'Caiu em combate. Voltando para a vila…'; dot = '#d4473b'; }
  else if(mode === 'townLeave'){ st = 'Saindo pelo portal…'; dot = '#8ab4ff'; }
  else {
    dot = '#e2ae4a';
    st = hero.hp < ST.life ? `Na vila, curando ${pct}%` : 'Na vila · ande até o Mercador ou a Forja';
  }
  setText('#stText', st); $('#stDot').style.background = dot;
  setText('#hpText', `Vida ${fmt(hero.hp)}/${fmt(ST.life)}`);
  $('#skillbar').hidden = scene !== 'map';
  const aEl = $('#sb-atk');
  if(aEl){
    aEl.classList.toggle('ready', cds.atk <= 0 && mode === 'hunt');
    aEl.style.setProperty('--cd', (cds.atk/BASIC_CD).toFixed(3));
  }
  const dEl = $('#sb-dodge');
  if(dEl){
    const cdMax = DODGE[clsOf()].cd*(1 - ST.cdr/100), cd = cds.dodge;
    dEl.classList.toggle('ready', cd <= 0 && mode === 'hunt' && scene === 'map');
    dEl.style.setProperty('--cd', (cd/cdMax).toFixed(3));
    dEl.querySelector('.cdn').textContent = cd > 0 ? Math.ceil(cd) : '';
  }
  for(const id of barSkills()){
    const el = $('#sb-' + id); if(!el) continue;
    const r = ST.rk(id), cdMax = SKD[id].cd*(1 - ST.cdr/100), cd = cds[id];
    el.classList.toggle('locked', r === 0);
    el.classList.toggle('ready', r > 0 && cd <= 0 && mode === 'hunt' && scene === 'map');
    el.classList.toggle('queued', hero.queued === id);
    el.classList.toggle('fire', !!(hero.cast && hero.cast.id === id));
    el.style.setProperty('--cd', r ? (cd/cdMax).toFixed(3) : 0);
    el.querySelector('.cdn').textContent = r && cd > 0 ? Math.ceil(cd) : '';
    el.querySelector('.rk').textContent = SKD[id].ult ? '5' : r ? r : 'Nv' + SKD[id].req;
    el.querySelector('.off').textContent = '';
  }
  const free = Math.max(0, ptsFree()) + (S.lv >= MAX_LV ? parFree() : 0);
  const pb = $('#ptsBadge'); pb.hidden = free <= 0; pb.textContent = free;
  const bb = $('#bagBadge'); bb.hidden = invUsed() === 0; bb.textContent = invUsed(); bb.style.background = invFull() ? 'var(--blood)' : '';
  $('#townBtn').hidden = !(scene === 'map' && mode === 'hunt');
  $('#townBtn').classList.toggle('done', mapCleared && scene === 'map');
  drawMinimap();
  // Vila: só o botão Partir (canto de cima, à direita)
  const gb = $('#goBtn'); gb.hidden = !(inTown() && mode === 'town');
  if(!gb.hidden) $('#goText').innerHTML = `Partir<small>${(MAPS.find(m => m.id === S.map) || MAPS[0]).name}</small>`;
  if(lastScene !== scene){ lastScene = scene; panelDirty = true; }
  if(panelDirty){ panelDirty = false; if(!$('#sheet').hidden) renderPanel(); if(!$('#dlg').hidden && dlgItem) renderDlg(); }
}

function openTab(t){
  tab = t; $('#sheet').hidden = false;
  if(inTown()) townIdle = false; // mexeu em algo na vila: não parte sozinho
  $('#sheet').classList.toggle('center', t === 'bag' || t === 'forge' || t === 'dun' || t === 'chest'); // mochila, forja, masmorra e Tobias abrem no meio da tela
  $('#sheet').classList.toggle('full', t === 'rank'); // o ranking ocupa a tela toda
  if(t === 'rank') loadRank();
  document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('on', b.dataset.v === t));
  renderPanel(true);
}
function closeSheet(){ $('#sheet').hidden = true; tab = null; document.querySelectorAll('.nav button').forEach(b => b.classList.remove('on')); }
function renderPanel(top){
  const body = $('#sheetBody'), sc = body.scrollTop;
  const T2 = {shop:'Mercador', maps:'Mapas', hero:'Herói e build', bag:'Mochila', rules:'Regras da caçada', rank:'Ranking', forge:'Forja', dun:'Masmorra', chest:NPC_CHEST.n + ', o colecionador'};
  $('#sheetTitle').textContent = T2[tab];
  body.innerHTML = ({shop:panelShop, maps:panelMaps, hero:panelHero, bag:panelBag, rules:panelRules, rank:panelRank, forge:panelForge, dun:panelDun, chest:panelChest})[tab]();
  body.scrollTop = top ? 0 : sc;
}
// Baú de Visuais (vendido pelo mercador): mostra o preço e quantos visuais a conta já tem
function chestHTML(){
  const own = cosOwned().length, all = Object.keys(COS).length, town = inTown(), left = all - own;
  const why = !town ? 'Só na vila' : !left ? 'Você já tem todos os visuais' : S.gold < COS_CHEST ? 'Ouro insuficiente' : '';
  return `<div class="sec"><h3>Baú de Visuais <span class="r">${own}/${all} visuais</span></h3>
    <p class="note">Cada baú traz <b>um</b> visual que sua conta ainda não tem: roupa, rastro, efeito dos ataques ou cor do nome. Vale para todos os seus personagens. Troque o visual no painel do Herói.</p>
    <button class="btn gold full" data-act="buyChest" ${why ? 'disabled' : ''}>Abrir baú<small>${fmt(COS_CHEST)} ouro${why ? ' · ' + why : ' · você tem ' + fmt(S.gold)}</small></button></div>`;
}
// Painel do Tobias (NPC da praça): só o Baú de Visuais
const panelChest = () => `<p class="note">"Junto relíquias de todos os cantos do reino. Por ${fmt(COS_CHEST)} de ouro, um baú lacrado — e o que estiver dentro é seu."</p>` + chestHTML();
const applyLook = () => updateHud();
// Seção "Visual" do painel do Herói: um seletor por tipo com os visuais que a conta tem
function lookHTML(){
  const own = cosOwned();
  const rows = Object.keys(COS_T).map(t => {
    const mine = own.filter(id => COS[id].t === t);
    const opts = [`<option value="${t}:" ${!S.look[t] ? 'selected' : ''}>Padrão</option>`, ...mine.map(id => `<option value="${t}:${id}" ${S.look[t] === id ? 'selected' : ''}>${COS[id].n}</option>`)].join('');
    return `<div class="row"><label for="look-${t}">${COS_T[t]}<small>${mine.length ? mine.length + ' na conta' : 'Nenhum ainda'}</small></label><select id="look-${t}" data-look="1" ${mine.length ? '' : 'disabled'}>${opts}</select></div>`;
  }).join('');
  return `<div class="sec"><h3>Visual <span class="r">${own.length}/${Object.keys(COS).length}</span></h3>${rows}
    <p class="note">Visuais saem do Baú de Visuais, vendido pelo ${NPC_CHEST.n} na praça da vila (${fmt(COS_CHEST)} ouro cada).</p></div>`;
}
function panelShop(){
  const town = inTown();
  let h = bulkSellHTML() + `<p class="note">O mercador traz 3 itens do seu nível (ilvl ${Math.max(1, S.lv)}) toda vez que você volta para a vila. Itens melhores são mais raros.</p>`;
  if(!town) h += `<p class="note" style="color:#ff8c80">O mercador fica na vila. Volte para comprar.</p>`;
  if(!S.shop.length) return h + `<p class="note">Nada à venda agora. Volte da caçada para ver ofertas novas.</p>`;
  h += `<div class="shop">` + S.shop.map(it => {
    const pr = buyPrice(it), s2 = calcStats({...S.eq, [it.slot]:it});
    const dd = s2.dps - ST.dps, dl = s2.life - ST.life;
    const cmp = `<span class="${dd > .05 ? 'g-ok' : dd < -.05 ? 'g-bad' : ''}">Dano/s ${dd > 0 ? '+' : ''}${n1(dd)}</span> · <span class="${dl > .05 ? 'g-ok' : dl < -.05 ? 'g-bad' : ''}">Vida ${dl > 0 ? '+' : ''}${n1(dl)}</span>`;
    const can = town && S.gold >= pr && !invFull();
    const why = !town ? 'Só na vila' : invFull() ? 'Mochila cheia' : S.gold < pr ? 'Ouro insuficiente' : '';
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
    const mons = m.mons.map(k => { const E = ELEM[MONS[k].el || 'poison']; return `${MONS[k].n} <span style="color:${E.c}">(${E.n.toLowerCase()})</span>`; }).join(', ');
    let btn;
    if(lock) btn = `<button class="btn" disabled>Requer nível ${m.req}</button>`;
    else if(here && scene === 'map' && !inDun()) btn = `<span class="chip">Caçando aqui</span>`;
    else btn = `<button class="btn primary" data-act="map" data-v="${m.id}">${here ? 'Partir para cá' : 'Caçar aqui'}</button>`;
    return `<div class="mapc${here ? ' here' : ''}${lock ? ' lock' : ''}"><span class="swatch" style="background:${m.ground[1]}"></span>
      <div class="mh"><span class="mn">${m.name}</span><span class="ml">Nv ${m.lv[0]}–${m.lv[1]}</span></div>
      <div class="mm">${m.desc}</div>
      <div class="mm">Dano: ${[...new Set(m.mons.map(k => MONS[k].el))].map(e => `<b style="color:${ELEM[e].c}">${ELEM[e].n}</b> <span style="color:var(--muted)">(sua resistência ${ST.res[e]}%)</span>`).join(' · ')}</div>
      <div class="mm">Criaturas: ${mons}</div>
      <div class="mi"><span>Itens que caem: ilvl ${m.lv[0]}–${m.lv[1] + 1}</span><span>Recomendado: ${rec ? `ilvl ${rec}+` : 'qualquer item'}</span><span class="g-${gq}">Seu equipamento: ilvl ${my}</span></div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">${btn}${xpChip}</div></div>`;
  }).join('') + `</div>`;
}
// Ícone e nome do espaço de um item: a arma mostra espada ou arco conforme a classe do item
const itemIcon = it => it.slot === 'bow' && it.cls ? WEAPON_ICON[it.cls] : ICON_ITEM[it.slot];
const itemSlotN = it => it.slot === 'bow' && it.cls ? WEAPON_N[it.cls] : SLOT_N[it.slot];
function tileHTML(it, act, label){
  if(!it) return `<div class="tile empty">${ICON_ITEM[label] || ''}<span class="lbl">${SLOT_N[label] || ''}</span></div>`;
  let up = '';
  // Equipado já está em uso; nos outros lugares, classe errada ou nível baixo apagam o item
  const clsOk = canUse(it), lvOk = act === 'eq' || S.lv >= reqLv(it), ok = clsOk && lvOk;
  if(ok && (act === 'inv' || act === 'shop')){ const s2 = calcStats({...S.eq, [it.slot]:it}); if(s2.dps > ST.dps*1.01 || s2.life > ST.life*1.02) up = '<span class="up">▲</span>'; }
  const tag = !clsOk ? `<span class="cls-tag">${clsName(it.cls).slice(0, 3)}</span>` : !lvOk ? `<span class="cls-tag">Nv${reqLv(it)}</span>` : '';
  const why = !clsOk ? ', só para ' + clsName(it.cls) : !lvOk ? ', requer nível ' + reqLv(it) : '';
  return `<button class="tile r${it.rar}${ok ? '' : ' nouse'}" style="--rc:${RAR[it.rar].c}" data-act="item" data-v="${act}:${it.id}" aria-label="${it.name}, ilvl ${it.ilvl}${why}">${itemIcon(it)}<span class="il">${it.ilvl}</span>${up}${tag}${label ? `<span class="lbl">${itemSlotN(it)}</span>` : ''}</button>`;
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
    ${stat('Duração ' + dotDe(), '+' + Math.round((st.pdur - 1)*100) + '%')}${stat('Recarga', '-' + st.cdr + '%')}
    ${stat('Roubo de vida', n1(st.ls) + '%')}${stat('Movimento', fmt(st.ms))}
    ${stat('ilvl médio do equipamento', avgIlvl())}${stat('Itens equipados', SLOTS.filter(k => S.eq[k]).length + '/7')}
  </div></div>
  <div class="sec"><h3>Resistências <span class="r">máx. ${RES_MAX}%</span></h3><div class="stats">
    ${RES_KEYS.map(k => `<div class="stat"><span style="color:${ELEM[k].c}">${ELEM[k].n}</span><b>${st.res[k]}%</b></div>`).join('')}
  </div><p class="note">As criaturas causam 4 tipos de dano: Fogo, Raio, Gelo e Veneno. Todo dano é reduzido pela armadura e pela resistência do tipo. Veja no painel de Mapas o que cada criatura causa.</p></div>`;
  if(S.lv >= MAX_LV){
    const pf = parFree();
    h += `<div class="sec"><h3>Paragon ${S.par} <span class="r">${pf} ${pf === 1 ? 'ponto livre' : 'pontos livres'}</span></h3>
      <p class="note">Depois do nível ${MAX_LV}, a XP vira níveis de Paragon. Cada um dá 1 ponto para gastar aqui, em qualquer lugar. O nível de Paragon conta no ranking.</p>`;
    h += Object.keys(PARA).map(k => {
      const P = PARA[k], v = S.pp[k], can = pf > 0 && (!P.max || v < P.max);
      const ic = isWar() ? {dmg:'cleave', pois:'brutality', life:'iron', ias:'fury'} : isMage() ? {dmg:'firebolt', pois:'pyro', life:'ward', ias:'channel'} : {dmg:'arrow', pois:'potency', life:'hide', ias:'agility'};
      return `<div class="skill"><div class="ico" style="color:#c9a8ff">${ICON_SK[ic[k]]}</div>
        <div><div class="sn">${P.n} <em>${P.max ? `máx. ${P.max}` : 'sem limite'}</em></div><div class="sd">${P.d(v)} agora</div></div>
        <div class="ctl"><span class="rank">${v}${P.max ? '/' + P.max : ''}</span><button class="plus" data-act="parUp" data-v="${k}" ${can ? '' : 'disabled'} aria-label="Adicionar ponto de Paragon em ${P.n}">+</button></div></div>`;
    }).join('');
    h += `<button class="btn" data-act="parReset" ${S.par - pf > 0 ? '' : 'disabled'}>Redistribuir pontos de Paragon<small>Grátis</small></button></div>`;
  }
  h += `<div class="sec"><h3>Equipamento</h3><div class="eqgrid">${SLOTS.map(s => tileHTML(S.eq[s], 'eq', s)).join('')}</div></div>`;
  h += lookHTML();
  h += `<div class="sec"><h3>Habilidades <span class="r">${free} ${free === 1 ? 'ponto livre' : 'pontos livres'}</span></h3>`;
  h += `<p class="note">Pode gastar pontos a qualquer hora, até no meio da caçada. Redistribuir todos os pontos só na vila.</p>`;
  const row = id => {
    const k = SKD[id], base = S.sk[id], bonus = base ? (st.bonus[id] || 0) : 0, lockLv = S.lv < k.req;
    const canUp = free > 0 && !lockLv && base < k.max;
    const type = k.act ? `Ativa · ${n1(k.cd*(1 - st.cdr/100))}s` : 'Passiva';
    const tog = '';
    return `<div class="skill${lockLv ? ' locked' : ''}"><div class="ico">${ICON_SK[id]}</div>
      <div><div class="sn">${k.n} <em>${lockLv ? 'Libera no nível ' + k.req : type}</em></div><div class="sd">${skDesc(id, st)}</div></div>
      <div class="ctl"><span class="rank">${base}${bonus ? ` <span style="color:var(--perf)">+${bonus}</span>` : ''}/${k.max}</span>
      <button class="plus" data-act="skUp" data-v="${id}" ${canUp ? '' : 'disabled'} aria-label="Adicionar ponto em ${k.n}">+</button>${tog}</div></div>`;
  };
  h += `<p class="note">As habilidades ficam em volta do botão de ataque, no canto de baixo à direita. O ataque normal sai pelo botão grande (segure para repetir), no máximo a cada ${BASIC_CD} segundos; a velocidade de ataque deixa cada golpe mais forte.</p>` + ACTIVE.map(row).join('') + `<h3 style="margin-top:6px">Passivas</h3>` + PASSIVE.map(row).join('');
  const U = ultOf();
  if(U) h += `<h3 style="margin-top:6px;color:#ffd24a">Habilidade suprema</h3><div class="skill"><div class="ico" style="color:#ffd24a">${ICON_SK[U]}</div>
    <div><div class="sn">${SKD[U].n} <em>Suprema · ${n1(SKD[U].cd*(1 - st.cdr/100))}s · tecla 5</em></div><div class="sd">${skDesc(U, st)}</div></div><div class="ctl"><span class="rank">✦</span></div></div>`;
  h += `<button class="btn ${respecArm > performance.now() ? 'warn' : ''}" data-act="respec" ${town && S.gold >= cost ? '' : 'disabled'}>${respecArm > performance.now() ? 'Toque de novo para confirmar' : 'Redistribuir todos os pontos'}<small>Custa ${fmt(cost)} ouro${town ? '' : ' · só na vila'}</small></button></div>`;
  return h;
}
const respecCost = () => 25*S.lv;
// Mochila: janela no meio da tela com invMax() quadrados. Itens além do limite (saves antigos) aparecem em quadrados vermelhos.
// Pilha de orbes: um espaço da mochila com a quantidade no canto
const ICON_DUN = SVG('<path d="M5 21V10a7 7 0 0 1 14 0v11"/><path d="M9 21v-9a3 3 0 0 1 6 0v9" fill="currentColor" fill-opacity=".3"/><path d="M3 21h18"/>'); // portal (aba Masmorra do ranking)
const ICON_RANK = SVG('<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8M9 18h6"/>'); // troféu (aba Geral do ranking)
// Orbes de melhoria: esfera com um redemoinho de energia dentro e um brilho. A Anulação (cristal partido) tem a mesma altura (16 de 24).
const ICON_ORB = SVG('<circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity=".28"/><path d="M8 12.6a4 4 0 0 1 6.6-3.3M16 11.4a4 4 0 0 1-6.6 3.3" stroke-width="1.4"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="9" cy="8.5" r="1.3" fill="#fff" fill-opacity=".75" stroke="none"/>');
// Orbe da Anulação: cristal partido ao meio (duas metades separadas por uma rachadura) — diferente dos orbes redondos
const ICON_ANUL = SVG('<path d="M10.6 4L5 12l5.6 8-1.3-4 1.6-4-1.6-4z" fill="currentColor" fill-opacity=".4"/><path d="M13.4 4L19 12l-5.6 8 1.3-4-1.6-4 1.6-4z" fill="currentColor" fill-opacity=".4"/><circle cx="12" cy="6.5" r=".7" fill="currentColor"/><circle cx="12" cy="17.5" r=".7" fill="currentColor"/>');
const orbIcon = k => k === 'anul' ? ICON_ANUL : ICON_ORB;
const orbTile = k => `<button class="tile orb" style="--rc:${ORBS[k].c};color:${ORBS[k].c}" data-act="orb" data-v="${k}" aria-label="${ORBS[k].n}, ${S.orbs[k]}">${orbIcon(k)}<span class="qty">${S.orbs[k]}</span></button>`;
// Botão de comprar +1 espaço (só na vila; preço sobe a cada compra)
function slotBuyBtn(act, cur, cap, price, what){
  if(cur >= cap) return `<p class="note">Espaços no máximo (${cap}).</p>`;
  const town = inTown(), can = town && S.gold >= price;
  return `<button class="btn gold full" data-act="${act}" ${can ? '' : 'disabled'}>Comprar +1 espaço ${what}<small>${fmt(price)} ouro · ${cur}/${cap}${town ? '' : ' · só na vila'}${town && S.gold < price ? ' · ouro insuficiente' : ''}</small></button>`;
}
// Mochila com duas abas: Itens (invMax() espaços) e Orbes (um espaço fixo para cada tipo, sem limite de quantidade)
let bagTab = 'items';
function panelBag(){
  const nOrbs = Object.keys(ORBS).reduce((t, k) => t + (S.orbs[k] || 0), 0);
  const tabs = `<div class="rk-tabs rk-main"><button class="${bagTab === 'items' ? 'on' : ''}" data-act="bagTab" data-v="items">${ICON_ITEM.chest}Itens <small style="font-weight:600;color:var(--muted)">${invUsed()}/${invMax()}</small></button><button class="${bagTab === 'orbs' ? 'on' : ''}" data-act="bagTab" data-v="orbs">${ICON_ORB}Orbes <small style="font-weight:600;color:var(--muted)">${fmt(nOrbs)}</small></button></div>`;
  if(bagTab === 'orbs'){
    // um espaço para cada tipo de orbe, sempre na mesma ordem (mesmo vazio)
    const cells = Object.keys(ORBS).map(k => { const n = S.orbs[k] || 0;
      return `<div class="slot">${n ? orbTile(k) : `<div class="tile orb empty-orb" style="--rc:${ORBS[k].c};color:${ORBS[k].c}" aria-label="${ORBS[k].n}, nenhum">${orbIcon(k)}<span class="qty">0</span></div>`}</div>`; }).join('');
    return tabs + `<div class="sec"><h3>Orbes <span class="r">sem limite</span></h3><div class="inv-grid">${cells}</div>
      <div class="orb-names">${Object.keys(ORBS).map(k => `<span style="color:${ORBS[k].c}">${ORBS[k].n}: <b>${fmt(S.orbs[k] || 0)}</b></span>`).join('')}</div>
      <p class="legend">Cada tipo de orbe tem o seu espaço e cabe quantos você quiser — não ocupam os espaços de itens. Toque num orbe para usar.</p></div>`;
  }
  const n = invUsed(), over = n > invMax(), slots = [];
  for(let i = 0; i < Math.max(invMax(), n); i++) slots.push(`<div class="slot${i >= invMax() ? ' over' : ''}">${S.inv[i] ? tileHTML(S.inv[i], 'inv') : ''}</div>`);
  let h = tabs + `<div class="sec"><h3>Itens <span class="r" style="${over || n === invMax() ? 'color:#ff8c80' : ''}">${n}/${invMax()}</span></h3>
    <div class="inv-grid">${slots.join('')}</div>`;
  if(over) h += `<p class="note" style="color:#ff8c80">A mochila tem ${invMax()} espaços. Venda ou jogue fora ${n - invMax()} ${n - invMax() === 1 ? 'item' : 'itens'} para voltar a recolher do chão.</p>`;
  else if(!n) h += `<p class="note">A mochila está vazia. Ande por cima dos itens no chão para pegar.</p>`;
  h += `<p class="legend">Toque num item para ver e comparar. O número no canto é o ilvl. ▲ melhora seu dano ou sua vida. ◆ atributo perto do máximo.</p>`;
  h += slotBuyBtn('buyInvSlot', invMax(), INV_CAP, invSlotPrice(), 'na mochila') + `</div>`;
  return h + bulkSellHTML();
}
// Vender em lote por raridade (na Mochila e no Mercador; só na vila)
function bulkSellHTML(){
  const town = inTown(), list = r => S.inv.filter(i => i.rar === r);
  return `<div class="sec"><h3>Vender em lote</h3>${town ? '' : '<p class="note">O mercador fica na vila. Volte para vender.</p>'}<div class="bulk">
    ${[0,1,2,3].map(r => `<button class="btn" data-act="sellR" data-v="${r}" ${town && list(r).length ? '' : 'disabled'} style="color:${RAR[r].c}">${RAR[r].n.endsWith('m') ? RAR[r].n.slice(0, -1) + 'ns' : RAR[r].n + 's'}<small>${list(r).length} itens · ${fmt(list(r).reduce((s, i) => s + sellPrice(i), 0))} ouro</small></button>`).join('')}</div></div>`;
}
function panelRules(){
  const c = S.cfg;
  const sw = (key, label, small) => `<div class="row"><label for="cfg-${key}">${label}${small ? `<small>${small}</small>` : ''}</label><input type="checkbox" class="switch" id="cfg-${key}" data-cfg="${key}" ${c[key] ? 'checked' : ''}></div>`;
  return `<div class="retbox"><label for="cfg-ret" style="font-size:15px">Voltar para a vila quando a vida chegar em</label>
    <div class="big" id="retVal">${c.ret}%</div>
    <input type="range" id="cfg-ret" min="10" max="90" step="5" value="${c.ret}">
    <p class="note">A marca branca na barra de vida do herói mostra esse limite.</p></div>
    <div class="sec">${sw('retFull', 'Voltar quando a mochila encher', `${invMax()} espaços`)}
    ${sw('autoSell', 'Vender itens comuns ao chegar na vila')}
    <p class="note">Andar é sempre manual. Celular: toque em qualquer lugar da tela, segure e arraste para o lado que quer andar; dois toques rápidos = esquiva. PC: WASD ou setas, espaço = esquiva. Atacar: botão grande embaixo à direita (segure para repetir) ou, no PC, clique/segure o mouse no mapa — a cada ${BASIC_CD} segundos.</p>
    <div class="row"><label for="cfg-minPick">Pegar itens do chão a partir de</label><select id="cfg-minPick" data-cfg="minPick">${RAR.map((r, i) => `<option value="${i}" ${c.minPick === i ? 'selected' : ''}>${r.n}</option>`).join('')}</select></div></div>
    <div class="sec"><h3>Conta</h3>
      <div class="row"><label>${esc(fbUser ? (fbUser.email || fbUser.displayName || 'Conta Google') : 'Sem conta')}<small>${esc(heroName())} fica salvo na sua conta Google e aparece no ranking. Entre com a mesma conta em qualquer aparelho para continuar.</small></label><button class="btn" data-act="logout">Sair</button></div>
    </div>
    <div class="sec"><h3>Registro</h3><div class="stats"><div class="stat"><span>Criaturas abatidas</span><b>${fmt(S.kills)}</b></div><div class="stat"><span>Masmorra (melhor fase)</span><b>${S.dun.best}</b></div></div></div>
    <button class="btn" data-act="switchChar">Trocar de personagem<small>Volta para a lista de personagens da conta</small></button>`;
}
function findItem(where, id){ id = +id; if(where === 'shop') return S.shop.find(i => i.id === id); if(where === 'eq') return SLOTS.map(s => S.eq[s]).find(i => i && i.id === id); return S.inv.find(i => i.id === id); }
// Masmorra (nível 40): escolhe a fase inicial (1 até a melhor concluída + 1) e entra pelo portal da vila
function panelDun(){
  const D0 = S.dun, max = D0.best + 1; D0.start = clamp(D0.start || 1, 1, max);
  if(S.lv < MAX_LV) return `<p class="note">O portal da Masmorra abre no nível ${MAX_LV}.</p>`;
  const k = dunMult(D0.start);
  return `<p class="note">Criaturas de todos os mapas no nível ${MAX_LV}. Cada fase tem ${DUN_KILLS} abates; ao completar, começa a próxima com criaturas ${Math.round((DUN_STEP - 1)*100)}% mais fortes (vida e dano). XP também sobe a cada fase. Morrer ou voltar para a vila encerra a corrida. Sua melhor fase concluída vai para o ranking da Masmorra.</p>
    <div class="sec"><h3>Melhor fase concluída <span class="r">${D0.best}</span></h3>
    <div class="retbox"><label style="font-size:15px">Começar na fase</label>
    <div style="display:flex;align-items:center;justify-content:center;gap:14px">
      <button class="plus" data-act="dunPhase" data-v="-1" ${D0.start > 1 ? '' : 'disabled'} aria-label="Fase anterior">−</button>
      <div class="big">${D0.start}</div>
      <button class="plus" data-act="dunPhase" data-v="1" ${D0.start < max ? '' : 'disabled'} aria-label="Próxima fase">+</button></div>
    <p class="note">Criaturas com ${fmt(k*100)}% de vida e dano, causando dano de <b style="color:${ELEM[dunElem(D0.start)].c}">${ELEM[dunElem(D0.start)].n}</b>. Pode começar até a fase ${max}.</p></div>
    <div class="sec"><h3>Elemento das fases</h3><p class="note">A cada ${DUN_ELEM_SPAN} fases o elemento muda (e depois recomeça). Todas as criaturas da fase causam esse dano: prepare a resistência certa.</p>
    <div class="stats">${DUN_ELEMS.map((e, i) => `<div class="stat"><span style="color:${ELEM[e].c}">${ELEM[e].n}</span><b>${i*DUN_ELEM_SPAN + 1}–${(i + 1)*DUN_ELEM_SPAN}</b></div>`).join('')}</div></div>
    <button class="btn primary full" data-act="dunGo" ${inTown() ? '' : 'disabled'}>Entrar no portal<small>${inTown() ? 'Fase ' + D0.start : 'Só pela vila'}</small></button></div>`;
}
// Forja da vila: escolhe 3 itens da mochila (forgeSel = ids) e eles viram 1 (forgeItems em 02)
let forgeSel = [];
const forgeTile = (it, act) => tileHTML(it, 'inv').replace('data-act="item" data-v="inv:', `data-act="${act}" data-v="`);
// Forja com duas abas: Itens (3 itens viram 1) e Orbes (10 orbes viram 1 da raridade acima, ORB_UP em 01)
let forgeTab = 'items';
function panelForge(){
  const tabs = `<div class="rk-tabs rk-main"><button class="${forgeTab === 'items' ? 'on' : ''}" data-act="forgeTab" data-v="items">${ICON_ITEM.chest}Itens</button><button class="${forgeTab === 'orbs' ? 'on' : ''}" data-act="forgeTab" data-v="orbs">${ICON_ORB}Orbes</button></div>`;
  return tabs + (forgeTab === 'orbs' ? forgeOrbsHTML() : forgeItemsHTML());
}
function forgeOrbsHTML(){
  const town = inTown();
  const rows = Object.keys(ORB_UP).map(k => {
    const to = ORB_UP[k], n = S.orbs[k] || 0, can = Math.floor(n / ORB_UP_N), why = orbUpBlock(k, 1);
    return `<div class="skill"><div class="ico" style="color:${ORBS[k].c}">${orbIcon(k)}</div>
      <div><div class="sn" style="color:${ORBS[k].c}">${ORBS[k].n} <em>você tem ${n}</em></div><div class="sd">${ORB_UP_N} viram 1 <span style="color:${ORBS[to].c}">${ORBS[to].n}</span> (você tem ${S.orbs[to] || 0})</div></div>
      <div class="ctl" style="flex-direction:column;gap:6px"><button class="btn" data-act="orbUp" data-v="${k}:1" ${why ? 'disabled' : ''}>Juntar ${ORB_UP_N}</button>
      <button class="btn" data-act="orbUp" data-v="${k}:all" ${why || can < 2 ? 'disabled' : ''}>Todos (${can})</button></div></div>`;
  }).join('');
  return `<p class="note">Junte ${ORB_UP_N} orbes iguais para criar 1 orbe da raridade acima: Despertar → Ascensão → Exaltação → Lenda.${town ? '' : ' <span style="color:#ff8c80">A forja fica na vila.</span>'}</p>
    <div class="sec"><h3>Orbes na mochila</h3>${rows}</div>`;
}
// Motivo de não poder juntar n vezes o orbe k (ou '' se pode)
function orbUpBlock(k, times){
  if(!inTown()) return 'Só na vila';
  if((S.orbs[k] || 0) < ORB_UP_N*times) return 'Orbes insuficientes';
  return ''; // orbes não ocupam espaço da mochila
}
function forgeItemsHTML(){
  forgeSel = forgeSel.filter(id => S.inv.some(i => i.id === id));
  const sel = forgeSel.map(id => S.inv.find(i => i.id === id)), town = inTown();
  const slots = [0, 1, 2].map(i => `<div class="slot">${sel[i] ? forgeTile(sel[i], 'forgeDel') : ''}</div>`).join('');
  // Depois do 1º item, a mochila só mostra os que combinam com ele (mesmo tipo e raridade); Lendários não entram
  const bag = S.inv.filter(i => !forgeSel.includes(i.id) && i.rar < LEG_R && (!sel[0] || forgeMatch(i, sel[0]))).map(it => `<div class="slot">${forgeTile(it, 'forgeAdd')}</div>`).join('');
  const why = forgeWhy(sel);
  let what = sel.length ? `Falta${3 - sel.length === 1 ? '' : 'm'} ${3 - sel.length}: ${itemSlotN(sel[0])} <span style="color:${RAR[sel[0].rar].c}">${RAR[sel[0].rar].n}</span>.` : 'Escolha 3 itens do mesmo tipo e da mesma raridade.';
  if(sel.length === 3) what = why ? `<span style="color:#ff8c80">${why}</span>`
    : `Sai 1 ${itemSlotN(sel[0])} <b style="color:${RAR[sel[0].rar + 1].c}">${RAR[sel[0].rar + 1].n}</b> com status novos, ilvl ${Math.max(...sel.map(i => i.ilvl))}.`;
  return `<p class="note">Coloque na bigorna 3 itens do mesmo tipo e da mesma raridade (ex.: 3 arcos Comuns) e eles viram 1 desse tipo na raridade acima: Comum → Incomum → Raro → Épico → Lendário. Os 3 itens são gastos e o ferreiro cobra pelo serviço.</p>
    ${town ? '' : '<p class="note" style="color:#ff8c80">A forja fica na vila.</p>'}
    <div class="sec"><h3>Bigorna <span class="r">${sel.length}/3</span></h3><div class="inv-grid forge-grid">${slots}</div>
    <p class="note" style="color:var(--fg)">${what}</p>
    ${(() => { const cost = sel.length === 3 ? forgeCost(sel) : 0; return `<button class="btn primary full" data-act="forge" ${town && !why && S.gold >= cost ? '' : 'disabled'}>Forjar${sel.length === 3 ? `<small>Custa ${fmt(cost)} ouro · você tem ${fmt(S.gold)}</small>` : ''}</button>`; })()}</div>
    <div class="sec"><h3>Mochila <span class="r">toque para colocar</span></h3>${bag ? `<div class="inv-grid">${bag}</div>` : '<p class="note">Nenhum item na mochila.</p>'}</div>`;
}
// Janela do orbe: explica e mostra os itens que ele pode melhorar
function renderOrbDlg(k){
  const O = ORBS[k], card = $('#dcard'); dlgItem = null; $('#dlg').hidden = false; card.style.setProperty('--rc', O.c);
  const list = [...S.inv.map(it => ({it, w:'inv'})), ...SLOTS.filter(s => S.eq[s]).map(s => ({it:S.eq[s], w:'eq'}))].filter(x => O.ok(x.it));
  const which = O.rm ? 'com atributos' : RAR[O.from].n.toLowerCase();
  card.innerHTML = `<h2 class="dname">${O.n}</h2><div class="dtype">Você tem ${S.orbs[k]}</div><p class="note" style="color:var(--fg)">${O.d}</p>
    ${list.length ? `<div class="sec"><h3>Toque num item ${which} para ${O.rm ? 'anular 1 atributo' : 'melhorar'}</h3><div class="inv-grid">${list.map(x => `<div class="slot"><button class="tile r${x.it.rar}" style="--rc:${RAR[x.it.rar].c}" data-act="useOrb" data-v="${k}:${x.w}:${x.it.id}" aria-label="${x.it.name}">${itemIcon(x.it)}<span class="il">${x.it.ilvl}</span>${x.w === 'eq' ? '<span class="cls-tag" style="color:var(--poison)">Eq</span>' : ''}</button></div>`).join('')}</div></div>` : `<p class="note">Nenhum item ${which} na mochila ou equipado.</p>`}
    <div class="dact"><button class="btn full" data-act="dlgClose">Fechar</button></div>`;
}
function openItem(v){ const [where, id] = v.split(':'); const it = findItem(where, id); if(!it) return; dlgItem = {where, id:+id}; $('#dlg').hidden = false; renderDlg(); }
// Janela do item: comparação status a status entre o item clicado e o equipado no mesmo espaço (chaves de itemVals; DIFF_DEC = mostra com 1 casa)
const DIFF_DEC = {aps:1, crit:1, ls:1};
function itemVals(it){
  const v = {}; if(!it) return v;
  if(it.slot === 'bow'){ v.wdmg = (it.min + it.max)/2; v.aps = it.aps; }
  if(it.armor) v.barmor = it.armor;
  for(const a of it.affix){ const k = a.k === 'skill' ? 'sk:' + a.s : a.k; v[k] = (v[k] || 0) + a.v; }
  return v;
}
// Todos os status de um item (base + atributos), cada um com a chave usada para comparar (a mesma de itemVals)
function itemRows(it){
  const r = [];
  if(it.slot === 'bow'){ r.push({k:'wdmg', v:(it.min + it.max)/2, txt:`${fmt(it.min)}–${fmt(it.max)} de dano`, perf:it.bt >= .9}); r.push({k:'aps', v:it.aps, txt:`${n1(it.aps)} ataques/s`}); }
  else if(it.armor) r.push({k:'barmor', v:it.armor, txt:`${fmt(it.armor)} de armadura`, perf:it.bt >= .9});
  for(const a of it.affix) r.push(a.k === 'skill' ? {k:'sk:' + a.s, v:a.v, txt:`+${a.v} em ${SKD[a.s].n}`, sk:1, perf:a.v === 2} : {k:a.k, v:a.v, txt:AFX[a.k].n(a.v), perf:a.t >= .9});
  return r;
}
// Ficha de um item com todos os status. vs = valores do outro item para comparar:
//  mode 'new' (item clicado): verde ▲ = melhor que o equipado (quanto a mais), vermelho ▼ = pior; '=' igual
//  mode 'cur' (equipado): vermelho = o que você perde trocando (o item novo não tem ou tem menos)
function statCard(it, title, vs, mode, extra){
  const rows = itemRows(it).map(r => {
    let cls = '', tag = '';
    if(vs){
      const d = r.v - (vs[r.k] || 0), num = DIFF_DEC[r.k] ? n1(Math.abs(d)) : fmt(Math.abs(d));
      if(Math.abs(d) < .05) tag = mode === 'new' ? '=' : '';
      else if(mode === 'new'){ cls = d > 0 ? 'up' : 'down'; tag = (d > 0 ? '▲ +' : '▼ −') + num; }
      else if(d > 0){ cls = 'down'; tag = '−' + num + ' ao trocar'; }
    }
    return `<li class="${cls}${r.sk ? ' sk' : ''}"><span>${r.txt}${r.perf ? ' <b class="pf">◆</b>' : ''}</span>${tag ? `<em>${tag}</em>` : ''}</li>`;
  }).join('');
  return `<div class="scard" style="--rc:${RAR[it.rar].c}"><div class="sh">${title}</div><div class="sn">${it.name}</div>
    <div class="st">${RAR[it.rar].n} · ${itemSlotN(it)} · ilvl ${it.ilvl}${extra || ''}</div>
    <ul class="slist">${rows || '<li class="none">Sem atributos</li>'}</ul></div>`;
}
// Resumo da troca: quantos status melhoram e pioram (contando tudo dos dois itens)
function cmpSummary(it, cur){
  const a = itemVals(it), b = itemVals(cur); let up = 0, down = 0;
  for(const k of new Set([...Object.keys(a), ...Object.keys(b)])){ const d = (a[k] || 0) - (b[k] || 0); if(d > .05) up++; else if(d < -.05) down++; }
  return `<div class="ssum"><span class="up">▲ ${up} melhor${up === 1 ? '' : 'es'}</span><span class="down">▼ ${down} pior${down === 1 ? '' : 'es'}</span></div>`;
}
function renderDlg(){
  const it = findItem(dlgItem.where, dlgItem.id); if(!it){ closeDlg(); return; }
  const isEq = dlgItem.where === 'eq', isShop = dlgItem.where === 'shop', town = inTown(), col = RAR[it.rar].c;
  // Orbes que servem neste item: o de melhoria da raridade dele e a Anulação (só aparece se tiver)
  const oks = Object.keys(ORBS).filter(k => ORBS[k].ok(it) && (!ORBS[k].rm || S.orbs[k] > 0));
  const orbBtn = isShop ? '' : oks.map(k => `<button class="btn full" data-act="useOrb" data-v="${k}:${dlgItem.where}:${it.id}" ${S.orbs[k] > 0 ? '' : 'disabled'} style="border-color:${ORBS[k].c};color:${ORBS[k].c}">Usar ${ORBS[k].n}<small>${ORBS[k].rm ? 'Tira 1 atributo, vira ' + RAR[it.rar - 1].n : 'Vira ' + RAR[ORBS[k].to].n} · você tem ${S.orbs[k]}</small></button>`).join('');
  const card = $('#dcard'); card.style.setProperty('--rc', col);
  const cur = S.eq[it.slot];
  const req = `${it.cls ? ` · <span style="color:${canUse(it) ? 'var(--muted)' : '#ff8c80'}">só ${clsName(it.cls)}</span>` : ''} · <span style="color:${S.lv >= reqLv(it) ? 'var(--muted)' : '#ff8c80'}">requer nível ${reqLv(it)}</span>`;
  // Item equipado: só a ficha dele. Mochila/mercador: ficha do item clicado comparada com a do equipado embaixo (todos os status)
  const cards = isEq ? statCard(it, 'Equipado', null, '', req)
    : cmpSummary(it, cur) + `<div class="scards">${statCard(it, isShop ? 'À venda' : 'Na mochila', itemVals(cur), 'new', req)
      + (cur ? statCard(cur, 'Equipado agora', itemVals(it), 'cur') : `<div class="scard none-eq">Nada equipado em ${itemSlotN(it)} — todos os status são ganho.</div>`)}</div>`;
  card.innerHTML = `${cards}
    ${isShop ? `<div class="dact"><button class="btn primary full" data-act="buy" data-v="${it.id}" ${town && S.gold >= buyPrice(it) && !invFull() ? '' : 'disabled'}>Comprar<small>${fmt(buyPrice(it))} ouro · você tem ${fmt(S.gold)}</small></button><button class="btn full" data-act="dlgClose">Fechar</button></div>` : `<div class="dact">
      ${isEq ? `<button class="btn" data-act="unequip" ${!invFull() ? '' : 'disabled'}>Guardar na mochila</button>` : !canUse(it) ? `<button class="btn" disabled>Só ${clsName(it.cls)} usa</button>` : S.lv < reqLv(it) ? `<button class="btn" disabled>Requer nível ${reqLv(it)}</button>` : `<button class="btn primary" data-act="equip">Equipar</button>`}
      ${isEq ? '' : `<button class="btn gold" data-act="sell" ${town ? '' : 'disabled'}>${town ? 'Vender' : 'Vender na vila'}<small>${fmt(sellPrice(it))} ouro</small></button>`}
      ${isEq ? '' : `<button class="btn warn" data-act="drop">Jogar fora</button>`}
      ${orbBtn}
      <button class="btn" data-act="dlgClose">Fechar</button>
    </div>`}`;
}
function closeDlg(){ $('#dlg').hidden = true; dlgItem = null; }
let crSel = {cls:'arqueiro', build:'veneno', color:0};
const CLS_ICON = {arqueiro:ICON_BOW, guerreiro:ICON_SWORD, mago:ICON_STAFF};
const DEF_NAME = {arqueiro:'Sombra', guerreiro:'Carniceiro', mago:'Brasa'};
const BLD_ICON = {veneno:ICON_SK.tip, sangramento:ICON_SK.serrated, gelo:SVG('<path d="M12 2v20M3 7l18 10M21 7L3 17"/>'), fogo:SVG('<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-4 5-4 7-1-1-2-2-2-4-2 2-3 5-3 9 0 4 3 7 7 7z"/>')};
function showCreate(){ crSel = {cls:'arqueiro', build:'veneno', color:0}; $('#create').hidden = false; renderCreate(''); }
function renderCreate(name){
  const nm = name !== undefined ? name : ($('#crName') ? $('#crName').value : '');
  const opt = (list, icons, key) => list.map(o => `<button class="opt${crSel[key] === o.id ? ' on' : ''}" data-act="crPick" data-v="${key}:${o.id}" ${o.ok ? '' : 'disabled'}>${icons[o.id]}${o.n}<small>${o.d}</small></button>`).join('');
  const war = crSel.cls === 'guerreiro', mage = crSel.cls === 'mago';
  const intro = war
    ? 'Começa com uma Espada Enferrujada e o Golpe Dilacerante. A Investida, o Giro de Lâmina e a Ruptura liberam com o nível. Luta colado nos inimigos, com mais vida e armadura, e faz eles sangrarem.'
    : mage
    ? 'Começa com um Cajado de Aprendiz e a Bola de Fogo. A Onda de Chamas, o Meteoro e o Inferno liberam com o nível. Ataca de longe com explosões que queimam em área, mas tem menos vida.'
    : 'Começa com um Arco Simples e a Flecha Venenosa. O Leque Tóxico, a Chuva Ácida e a Explosão de Praga liberam com o nível. Ataca de longe e envenena.';
  $('#crBody').innerHTML = `<h1>Novo personagem</h1><p class="lead">Escolha quem vai caçar por você: o Arqueiro de Veneno, o Guerreiro de Sangramento ou o Mago de Fogo.</p>
    <label class="field"><span>Nome</span><input class="txtin" id="crName" type="text" maxlength="14" autocomplete="off" placeholder="${DEF_NAME[crSel.cls]}" value="${nm.replace(/"/g, '&quot;')}"></label>
    <div class="field"><h3>Classe</h3><div class="opts">${opt(CLASSES, CLS_ICON, 'cls')}</div></div>
    <div class="field"><h3>Build</h3><div class="opts">${opt(buildsFor(crSel.cls), BLD_ICON, 'build')}</div></div>
    <div class="field"><h3>Cor da ${war ? 'armadura' : mage ? 'túnica' : 'capa'}</h3><div class="sw">${CLOAKS.map((c, i) => `<button class="${crSel.color === i ? 'on' : ''}" style="background:${c.b}" data-act="crColor" data-v="${i}" aria-label="Cor ${c.n}"></button>`).join('')}</div></div>
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
  map: v => {
    const m = MAPS.find(x => x.id === v); if(!m || S.lv < m.req) return;
    S.map = v; mapDef = m;
    if(scene === 'town'){ closeSheet(); depart(); }
    else if(mode === 'hunt'){ closeSheet(); startPortal('map', `Indo para ${m.name}`); }
    dirtyPanel();
  },
  go: () => depart(),
  useSk: v => { if(performance.now() < skipClickT) return; manualCast(v); },
  dodge: () => { if(performance.now() < skipClickT) return; doDodge(false); },
  atk: () => { if(performance.now() < skipClickT) return; basicAttack(); },
  navTog: () => setNav(!$('#nav').classList.contains('shut')),
  mmToggle: () => { minimapBig = !minimapBig; drawMinimap(); },
  buy: v => {
    const it = S.shop.find(i => i.id === +v); if(!it || !inTown()) return;
    const pr = buyPrice(it); if(S.gold < pr || invFull()) return;
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
  // Orbes
  orb: v => renderOrbDlg(v),
  useOrb: v => {
    const [k, where, id] = v.split(':'), it = findItem(where, id); if(!it) return;
    const from = RAR[it.rar].n;
    if(!upgradeItem(it, k)) return;
    refreshStats(); save(); dirtyPanel();
    log(`${ORBS[k].n}: ${from} → ${RAR[it.rar].n} (${it.name})`, ORBS[k].rm ? ORBS[k].c : RAR[it.rar].c);
    ring(hero.x, hero.y, 40, ORBS[k].c, .5, 3);
    dlgItem = {where, id:it.id}; $('#dlg').hidden = false; renderDlg(); // mostra o item já melhorado
  },
  dlgClose: () => closeDlg(),
  bagTab: v => { bagTab = v === 'orbs' ? 'orbs' : 'items'; dirtyPanel(); },
  // Comprar espaços (só na vila)
  buyInvSlot: () => {
    const p = invSlotPrice(); if(!inTown() || invMax() >= INV_CAP || S.gold < p) return;
    S.gold -= p; S.invX = (S.invX || 0) + 1; log(`Mochila agora tem ${invMax()} espaços (−${fmt(p)} ouro)`, '#e2ae4a'); save(); dirtyPanel();
  },
  // Baú de Visuais (no mercador) e trocar visual (painel do Herói)
  buyChest: () => {
    const left = Object.keys(COS).filter(id => !cosOwned().includes(id));
    if(!inTown() || !acct || !left.length || S.gold < COS_CHEST) return;
    S.gold -= COS_CHEST; const id = pick(left), C = COS[id]; cosOwned().push(id);
    S.look[C.t] = id; // já veste o que saiu
    log(`Baú aberto: ${C.n} (${COS_T[C.t]})!`, '#f5cf3a'); ring(hero.x, hero.y, 60, '#f5cf3a', .7, 4);
    for(let i = 0; i < 30; i++){ const an = Math.random()*TAU, sp = rnd(60, 200); part({x:hero.x, y:hero.y - 20, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp - 60, grav:200, life:.8, size:rnd(2,4), c:pick(['#f5cf3a','#fff4c0','#ffffff'])}); }
    applyLook(); save(); dirtyPanel();
  },
  look: v => { const [t, id] = v.split(':'); if(id && (!COS[id] || !cosOwned().includes(id))) return; S.look[t] = id || ''; applyLook(); save(); dirtyPanel(); },
  // Masmorra
  dunPhase: v => { S.dun.start = clamp((S.dun.start || 1) + +v, 1, S.dun.best + 1); dirtyPanel(); },
  dunGo: () => { if(!inTown() || S.lv < MAX_LV || trans) return; closeSheet(); const p = S.dun.start || 1; transition(() => enterDungeon(p)); },
  // Forja (só na vila)
  forgeTab: v => { forgeTab = v === 'orbs' ? 'orbs' : 'items'; dirtyPanel(); },
  orbUp: v => {
    const [k, q] = v.split(':'), to = ORB_UP[k]; if(!to) return;
    const times = q === 'all' ? Math.floor((S.orbs[k] || 0) / ORB_UP_N) : 1;
    if(times < 1 || orbUpBlock(k, times)) return;
    S.orbs[k] -= ORB_UP_N*times; S.orbs[to] = (S.orbs[to] || 0) + times;
    log(`Forja: ${ORB_UP_N*times} ${ORBS[k].n} → ${times} ${ORBS[to].n}`, ORBS[to].c); ring(hero.x, hero.y, 50, ORBS[to].c, .6, 3);
    save(); dirtyPanel();
  },
  forgeAdd: v => { const id = +v; if(forgeSel.length < 3 && !forgeSel.includes(id)) forgeSel.push(id); dirtyPanel(); },
  forgeDel: v => { forgeSel = forgeSel.filter(id => id !== +v); dirtyPanel(); },
  forge: () => {
    if(!inTown()) return;
    const sel = forgeSel.map(id => S.inv.find(i => i.id === id)).filter(Boolean); if(sel.length !== 3) return;
    if(forgeWhy(sel)) return;
    const cost = forgeCost(sel); if(S.gold < cost) return;
    S.gold -= cost;
    const it = forgeItems(sel);
    S.inv = S.inv.filter(i => !sel.includes(i)); S.inv.push(it); forgeSel = [];
    log(`Forjou ${it.name}`, RAR[it.rar].c);
    save(); dirtyPanel(); if(tab && !$('#sheet').hidden) renderPanel();
    dlgItem = {where:'inv', id:it.id}; $('#dlg').hidden = false; renderDlg(); // mostra o item novo
  },
  equip: () => {
    const it = findItem('inv', dlgItem.id); if(!it || !canEquip(it)) return;
    const old = S.eq[it.slot]; S.eq[it.slot] = it; S.inv = S.inv.filter(i => i !== it); if(old) S.inv.push(old);
    refreshStats(); log(`Equipou ${it.name}`, RAR[it.rar].c); closeDlg(); dirtyPanel(); save();
  },
  unequip: () => { const it = findItem('eq', dlgItem.id); if(!it || invFull()) return; S.eq[it.slot] = null; S.inv.push(it); refreshStats(); closeDlg(); dirtyPanel(); save(); },
  sell: () => { if(!inTown()) return; const id = dlgItem.id; sellWhere(i => i.id === id); closeDlg(); },
  drop: () => { const id = dlgItem.id; S.inv = S.inv.filter(i => i.id !== id); closeDlg(); dirtyPanel(); },
  sellR: v => { if(!inTown()) return; const r = +v; sellWhere(i => i.rar === r); },
  crPick: v => { const [k, id] = v.split(':'); crSel[k] = id; if(k === 'cls') crSel.build = buildsFor(id).find(b => b.ok).id; renderCreate(); },
  crColor: v => { crSel.color = +v; renderCreate(); },
  create: () => {
    const name = ($('#crName').value || '').trim().slice(0, 14) || DEF_NAME[crSel.cls];
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
  if(el.dataset && el.dataset.look){ ACT.look(el.value); return; }
  if(k){ S.cfg[k] = el.type === 'checkbox' ? el.checked : +el.value; save(); }
});
document.addEventListener('input', e => { if(e.target.id === 'cfg-ret'){ S.cfg.ret = +e.target.value; $('#retVal').textContent = S.cfg.ret + '%'; } });
document.addEventListener('keydown', e => {
  if(e.target.closest('input,textarea')) return;
  const i = '12345'.indexOf(e.key);
  if(i >= 0 && barSkills()[i]){
    const id = barSkills()[i];
    if(AIMABLE[id]){ if(e.repeat || aim) return; if(canAim(id)){ aim = {id, src:'key', key:e.key}; return; } }
    // Habilidades de alvo: com o mouse em cima de uma criatura, vão nela
    if(id === 'arrow' || id === 'burst' || id === 'firebolt'){ const h = hoverMon(); if(h){ if(!e.repeat) setFocus(h); manualCast(id, {tgt:h}); return; } }
    manualCast(id);
  }
  if(e.key === 'Escape' && aim){ aim = null; return; }
  if(e.code === 'Space'){ e.preventDefault(); if(!e.repeat) doDodge(true); return; }
  if(MOVE_KEY[e.key.toLowerCase()]){ moveKeys[e.key.toLowerCase()] = true; if(e.key.startsWith('Arrow')) e.preventDefault(); return; }
  if(e.key.toLowerCase() === 't') ACT.goTown();
});
document.addEventListener('keyup', e => { moveKeys[e.key.toLowerCase()] = false; if(aim && aim.src === 'key' && e.key === aim.key) aimRelease(); });
window.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true; });
window.addEventListener('contextmenu', e => { if(aim){ e.preventDefault(); aim = null; } });
window.addEventListener('blur', () => { aim = null; joy = null; atkHeld = null; for(const k in moveKeys) moveKeys[k] = false; });
// Mapa: clicar/tocar numa criatura troca o alvo; tocar no chão vazio volta ao alvo automático
let tapT = 0, tapX = 0, tapY = 0; // último toque no mapa (para o toque duplo da esquiva)
// Andar manual no celular: o toque vira joystick; se soltar sem arrastar, conta como toque normal (troca o alvo)
// Vila: tocar/clicar num ponto anda até lá; num prédio, anda até a porta dele (e abre ao chegar)
function townTap(sx, sy){
  const w = toWorld(sx, sy);
  for(const b of TOWN_B) if(b.tab && w.x > b.x - b.w/2 - 10 && w.x < b.x + b.w/2 + b.dep*.6 && w.y > b.y - b.h - b.dep*.45 - 50 && w.y < b.y + 40){ townGoal = {x:b.x, y:b.y + 34}; townZone = null; return; }
  if(D(w, NPC_CHEST) < 50 || D(w, {x:NPC_CHEST.x, y:NPC_CHEST.y - 30}) < 40){ townGoal = {x:NPC_CHEST.x, y:NPC_CHEST.y + 26}; townZone = null; return; }
  if(S.lv >= MAX_LV && D(w, DPORT) < 70){ townGoal = {x:DPORT.x, y:DPORT.y + 6}; townZone = null; return; }
  townGoal = {x:clamp(w.x, 40, TOWN_W - 40), y:clamp(w.y, 130, TOWN_H - 40)};
}
cv.addEventListener('pointerdown', e => {
  if(e.button > 0) return;
  const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  if(scene === 'town' && mode === 'town'){
    // celular: o toque vira joystick (soltar sem arrastar = andar até o ponto); mouse: clique = andar até o ponto
    if(e.pointerType === 'mouse') townTap(x, y);
    else if(!joy){ joy = {pid:e.pointerId, ox:x, oy:y, dx:0, dy:0, moved:false}; try{ cv.setPointerCapture(e.pointerId); }catch(_){} }
    return;
  }
  if(scene !== 'map' || mode !== 'hunt') return;
  // Celular: dois toques rápidos na tela = esquiva para onde o herói está andando
  if(e.pointerType !== 'mouse'){
    const now = performance.now();
    if(now - tapT < 320 && Math.hypot(x - tapX, y - tapY) < 70){ tapT = 0; const md = manualDir(); doDodge(false, md !== null ? md : hero.face); return; }
    tapT = now; tapX = x; tapY = y;
  }
  if(e.pointerType !== 'mouse' && !joy){ // um dedo anda, outro pode estar mirando uma habilidade ao mesmo tempo
    joy = {pid:e.pointerId, ox:x, oy:y, dx:0, dy:0, moved:false};
    try{ cv.setPointerCapture(e.pointerId); }catch(_){}
    return;
  }
  // PC: clicar numa criatura fixa o alvo e ataca; segurar o botão do mouse continua atacando (na direção do mouse se não houver ninguém)
  setFocus(monAt(x, y, e.pointerType === 'mouse' ? 6 : 22));
  if(e.pointerType === 'mouse'){ const w = toWorld(x, y); atkHeld = {pid:e.pointerId, mouse:true}; basicAttack(Math.atan2(w.y - hero.y, w.x - hero.x)); }
});
window.addEventListener('pointermove', e => {
  if(!joy || e.pointerId !== joy.pid) return;
  const r = cv.getBoundingClientRect();
  joy.dx = e.clientX - r.left - joy.ox; joy.dy = e.clientY - r.top - joy.oy;
  if(Math.hypot(joy.dx, joy.dy) > JOY_DEAD) joy.moved = true;
  e.preventDefault();
}, {passive:false});
const joyEnd = e => {
  if(!joy || e.pointerId !== joy.pid) return;
  if(!joy.moved && e.type === 'pointerup' && scene === 'map') setFocus(monAt(joy.ox, joy.oy, 22));
  if(!joy.moved && e.type === 'pointerup' && scene === 'town') townTap(joy.ox, joy.oy);
  joy = null;
};
window.addEventListener('pointerup', joyEnd);
window.addEventListener('pointercancel', joyEnd);
// Mira por toque: segura no botão, arrasta e solta
// Celular (multitoque): cada dedo é independente — um no joystick, outro na barra. Habilidade com mira: segura, arrasta e solta.
// As outras (e a esquiva) saem no próprio toque, sem esperar o "click" (que o navegador às vezes não manda com outro dedo na tela).
$('#skillbar').addEventListener('pointerdown', e => {
  const b = e.target.closest('.sk'); if(!b) return;
  // Ataque: segurar o botão continua atacando a cada recarga (até soltar)
  if(b.dataset.act === 'atk'){
    e.preventDefault(); skipClickT = performance.now() + 600;
    atkHeld = {pid:e.pointerId, mouse:false}; basicAttack();
    try{ b.setPointerCapture(e.pointerId); }catch(_){}
    return;
  }
  if(e.pointerType === 'mouse') return;
  e.preventDefault();
  skipClickT = performance.now() + 600; // o click que viria depois não repete a ação
  if(b.dataset.act === 'dodge'){ doDodge(false); return; }
  const id = b.dataset.v;
  if(!aim && canAim(id)){
    aim = {id, src:'touch', pid:e.pointerId, ox:e.clientX, oy:e.clientY, dx:0, dy:0, moved:false};
    try{ b.setPointerCapture(e.pointerId); }catch(_){}
    return;
  }
  manualCast(id);
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
const atkEnd = e => { if(atkHeld && e.pointerId === atkHeld.pid) atkHeld = null; };
window.addEventListener('pointerup', atkEnd);
window.addEventListener('pointercancel', atkEnd);
$('#skillbar').addEventListener('contextmenu', e => e.preventDefault());
// Ao sair ou esconder a aba, salva e manda para a nuvem na hora
document.addEventListener('visibilitychange', () => { if(document.hidden){ save(); cloudFlush(); } });
window.addEventListener('pagehide', () => { save(); cloudFlush(); });
