// Wiki do Loner: menu, topo e tabelas geradas direto dos dados do jogo (../js/01-base.js e ../js/02-modelos.js),
// então os números da wiki mudam sozinhos quando o jogo muda. Ícones em icones.js (WICON).
'use strict';

const PAGES = [
  {f:'index.html', n:'Início', ic:'rank'},
  {f:'classes.html', n:'Classes', ic:'cls'},
  {f:'builds.html', n:'Builds', ic:'build'},
  {f:'equipamentos.html', n:'Equipamentos', ic:'item'},
  {f:'atributos.html', n:'Prefixos, sufixos e tiers', ic:'affix'},
  {f:'orbes.html', n:'Orbes e Forja', ic:'orb'},
  {f:'mapas.html', n:'Mapas e criaturas', ic:'map'},
  {f:'masmorra.html', n:'A Fenda e as Pedras', ic:'dun'},
  {f:'combate.html', n:'Combate', ic:'fight'},
  {f:'progressao.html', n:'Níveis e Maestria', ic:'up'},
  {f:'vila.html', n:'A vila', ic:'town'},
];
const NAV_IC = {
  rank: () => WICON.rank,
  cls: () => WICON.cls.guerreiro,
  build: () => WICON.sk.potency || WICON.sk.brutality,
  item: () => WICON.item.helm,
  affix: () => WICON.item.gloves,
  orb: () => WICON.orb.lenda,
  map: () => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>',
  dun: () => WICON.dun,
  fight: () => WICON.sk.cleave,
  up: () => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5M6 11l6-6 6 6"/></svg>',
  town: () => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 20V10l5-4 5 4v10M13 20v-7h8v7M3 20h18"/><path d="M7 20v-4h2v4"/></svg>',
};

// APK do jogo para Android (a pasta APK fica dentro da wiki); o botão baixa direto (atributo download)
const APK = {href:'APK/Loner.apk', file:'Loner.apk', size:'1,8 MB'};
const ICON_DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v3h16v-3"/></svg>';
const ICON_ANDROID = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 9h12v8a1.5 1.5 0 0 1-1.5 1.5H16V21a1 1 0 0 1-2 0v-2.5h-4V21a1 1 0 0 1-2 0v-2.5h-.5A1.5 1.5 0 0 1 6 17zM3.5 9.5a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0zm15 0a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0zM6.2 8a5.8 5.8 0 0 1 3.1-4.6l-.9-1.5a.4.4 0 0 1 .7-.4l.9 1.6a6 6 0 0 1 4 0l.9-1.6a.4.4 0 0 1 .7.4l-.9 1.5A5.8 5.8 0 0 1 17.8 8zm3.3-2.4a.7.7 0 1 0 0 1.4.7.7 0 0 0 0-1.4zm5 0a.7.7 0 1 0 0 1.4.7.7 0 0 0 0-1.4z"/></svg>';
// Bloco grande de download (usado no Início)
const apkBox = () => `<div class="dl" id="apk"><div class="robot">${ICON_ANDROID}</div><div>
  <h2>Loner no seu celular</h2><p>Baixe o aplicativo para Android e jogue em tela cheia, deitado, sem barra de endereço. O app sempre abre a versão mais nova do jogo.</p>
  <a class="dlBtn" href="${APK.href}" download="${APK.file}" type="application/vnd.android.package-archive">${ICON_DL}<span><b>Download APK</b><small>Android · ${APK.size}</small></span></a>
  <p class="how">Depois de baixar, toque no arquivo <b>${APK.file}</b> para instalar. Se o celular pedir, permita "instalar apps desta fonte" para o navegador. Entre com a mesma conta Google para continuar o seu progresso.</p></div></div>`;

// Topo + menu lateral em volta do <main> da página
function wikiLayout(){
  const here = location.pathname.split('/').pop() || 'index.html';
  const main = document.querySelector('main');
  const wrap = document.createElement('div'); wrap.className = 'wrap';
  const nav = document.createElement('nav'); nav.className = 'side'; nav.setAttribute('aria-label', 'Páginas da wiki');
  nav.innerHTML = PAGES.map(p => `<a href="${p.f}"${p.f === here ? ' class="on" aria-current="page"' : ''}>${NAV_IC[p.ic]()}${p.n}</a>`).join('');
  main.parentNode.insertBefore(wrap, main); wrap.append(nav, main);
  const top = document.createElement('header'); top.className = 'top';
  top.innerHTML = `<button class="menuBtn" aria-expanded="false">Menu</button><a class="logo" href="index.html">Loner</a><span class="sub">Wiki do jogo</span><span class="sp"></span><a class="apk" href="${APK.href}" download="${APK.file}" aria-label="Baixar o APK para Android">${ICON_DL}<span>Baixar APK</span></a><a class="play" href="../index.html">Jogar</a>`;
  document.body.prepend(top);
  const btn = top.querySelector('.menuBtn');
  btn.addEventListener('click', () => { const o = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', String(o)); });
  const f = document.createElement('footer');
  f.textContent = 'Os números desta wiki são lidos do próprio jogo: quando o jogo muda, a wiki muda junto.';
  main.append(f);
}

/* ---------- utilidades ---------- */
const $w = s => document.querySelector(s);
const put = (sel, html) => { const el = $w(sel); if(el) el.innerHTML = html; };
const table = (head, rows, cls = '') => `<div class="tbl"><table class="${cls}"><thead><tr>${head.map(h => typeof h === 'string' ? `<th>${h}</th>` : `<th class="${h.c || ''}">${h.t}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => typeof c === 'object' && c !== null ? `<td class="${c.c || ''}">${c.t}</td>` : `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const num = t => ({t, c:'num'});
const pct = v => n1(v*100) + '%';
const clsN = id => CLASSES.find(c => c.id === id).n;
const ELN = el => `<b class="c-${el}">${ELEM[el].n}</b>`;
const SLOT_LIST = ['bow', 'helm', 'chest', 'gloves', 'boots'];
const slotName = s => s === 'bow' ? 'Arma' : SLOT_N[s];
// Troca a classe "atual" só para os textos que dependem dela (veneno / sangramento / queimadura)
const asClass = (cls, fn) => { const old = S.char; S.char = {name:'', cls, build:'', color:0}; setClass(cls); try{ return fn(); } finally { S.char = old; } };

/* ---------- atributos (prefixos e sufixos) ---------- */
// Atributos que podem sair hoje (o +% de dano geral só saía no anel/amuleto e não sai mais)
const AFX_KEYS = () => Object.keys(AFX).filter(k => AFX[k].slots.length);
function afxName(k){
  if(k === 'fdmg') return 'Adiciona X a 2X de dano';
  if(k === 'pois') return '+X% de dano ao longo do tempo (veneno / sangramento / queimadura)';
  if(k === 'pdur') return '+X% de duração do dano ao longo do tempo';
  return AFX[k].n(777).replace(/777([.,]0)?/, 'X'); // os de casa decimal passam o número por n1()
}
const fmtA = (k, v) => AFX[k].dec ? n1(Math.round(v*10)/10) : String(Math.max(1, Math.round(v)));
// valor do atributo na posição t (0–1) da faixa toda (nível 1 até o teto do nível 40)
const afxAt = (k, t) => { const [lo, hi] = affixRange(k); return lo + (hi - lo)*t; };
const tierRange = (k, tier) => { const a = fmtA(k, afxAt(k, (TIERS - tier)/TIERS)), b = fmtA(k, afxAt(k, (TIERS - tier + 1)/TIERS)); return a === b ? a : `${a}–${b}`; };
function affixTable(){
  return table(['Atributo', 'Grupo', ...SLOT_LIST.map(s => ({t:slotName(s), c:'num'})), {t:'Mínimo', c:'num'}, {t:'Máximo (T1)', c:'num'}],
    AFX_KEYS().map(k => { const A = AFX[k], [lo, hi] = affixRange(k); return [
      {t:afxName(k), c:'wrap'}, `<span class="chip ${A.g}">${AFX_G_N[A.g]}</span>`,
      ...SLOT_LIST.map(s => A.slots.includes(s) ? {t:'✓', c:'yes'} : {t:'—', c:'no'}),
      num(fmtA(k, lo)), num(fmtA(k, hi))]; }));
}
function tierValueTable(){
  const tiers = Array.from({length:TIERS}, (_, i) => i + 1);
  return table(['Atributo', ...tiers.map(t => ({t:'T' + t, c:'num' + (t === 1 ? ' t1' : t <= 3 ? ' t2' : '')}))],
    AFX_KEYS().map(k => [{t:afxName(k).replace(/ \(.*\)/, ''), c:'wrap'}, ...tiers.map(t => ({t:tierRange(k, t), c:'num' + (t === 1 ? ' t1' : t <= 3 ? ' t2' : '')}))]));
}
// Chance de cada tier por faixa de ilvl e raridade (mesma conta do rollTier no 02)
function tierChances(rar, ilvl){
  const best = bestTier(ilvl), w = (TIER_W[rar] || TIER_W[0]).slice(0, TIERS - best + 1), s = w.reduce((a, b) => a + b, 0);
  const out = {}; w.forEach((x, o) => out[best + o] = x/s); return out;
}
function tierChanceTable(rar){
  const tiers = Array.from({length:TIERS}, (_, i) => i + 1), bands = [];
  for(let l = 1; l <= MAX_LV; l += 4) bands.push([l, l + 3]);
  return table(['ilvl do item', 'Melhor tier', ...tiers.map(t => ({t:'T' + t, c:'num'}))],
    bands.map(([a, b]) => { const ch = tierChances(rar, b); return [`${a}–${b}`, `T${bestTier(b)}`, ...tiers.map(t => ch[t] ? num((ch[t]*100).toFixed(ch[t] < .1 ? 1 : 0) + '%') : {t:'—', c:'no'})]; }));
}

/* ---------- habilidades ---------- */
// Descrição de uma habilidade num rank, com uma arma de 100 de dano médio (os % não dependem da arma)
const skAt = (id, r) => skDesc(id, {rk:() => r, avg:100, pois:1, pdur:1, bonus:{}});
function skillList(cls, ids, opts = {}){
  return asClass(cls, () => ids.map(id => {
    const D = SKD[id], ult = D.ult, r1 = skAt(id, 1), rM = skAt(id, D.max);
    const meta = ult ? `Suprema · libera sozinha no nível ${MAX_LV} · recarga ${D.cd} s · tecla 5`
      : D.act ? `Ativa · nível ${D.req} · recarga ${D.cd} s · rank máximo ${D.max} · tecla ${CLASS_KIT[cls].active.indexOf(id) + 1}` : `Passiva · nível ${D.req} · rank máximo ${D.max}`;
    return `<div class="skill"><span class="ic${ult ? ' gold' : ''}">${WICON.sk[id] || ''}</span><div><h4>${D.n}</h4><div class="meta">${meta}</div>
      <div>${ult ? rM : `<b>Rank 1:</b> ${r1}`}</div>${!ult && D.max > 1 ? `<div class="r7"><b>Rank ${D.max}:</b> ${rM}</div>` : ''}</div></div>`;
  }).join(''));
}

/* ---------- mapas e criaturas ---------- */
const KIND_N = {biped:'Humanoide', quad:'Quadrúpede', spider:'Aracnídeo', blob:'Espírito / gosma'};
const AOE_N = {leap:'Pulo', cone:'Golpe em cone', slam:'Pisão em volta', bomb:'Arremesso', spell:'Magia no chão'};
function monTable(ids){
  return table(['Criatura', 'Tipo', 'Dano', {t:'Vida', c:'num'}, {t:'Dano', c:'num'}, {t:'Velocidade', c:'num'}, 'Ataque', 'Golpe em área'],
    ids.map(k => { const M = MONS[k], A = MON_AOE[k];
      return [`<b>${M.n}</b>`, KIND_N[M.kind] || M.kind, ELN(M.el), num(pct(M.hp)), num(pct(M.dmg)), num(M.spd), M.ranged ? 'De longe' : 'Corpo a corpo',
        A ? `${A.n} <small>(${AOE_N[A.k]})</small>` : '<span class="muted">—</span>']; }));
}
const mapEls = m => [...new Set(m.mons.map(k => MONS[k].el))];
