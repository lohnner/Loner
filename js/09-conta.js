// Conta: Firebase, login Google obrigatório, tela de personagens, save da conta na nuvem e ranking online.
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- FIREBASE ---------- */
// Configuração do app Web do Firebase (Console › Configurações do projeto › Seus apps). Esses valores são públicos.
// O projeto loner-hq é dividido com o jogo Loner: as regras do Firestore ficam em firestore.rules (nunca apague as do Loner).
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCfHLrtPMnLtfU-PvsVf5QCOXKmuZya51I',
  authDomain: 'loner-hq.firebaseapp.com',
  projectId: 'loner-hq',
  storageBucket: 'loner-hq.firebasestorage.app',
  messagingSenderId: '290842361996',
  appId: '1:290842361996:web:f1010f32a520a7148f7ba9',
};
const SAVES = 'viboraSaves', RANK = 'ranking', RANK_N = 50, CLOUD_EVERY = 20, MAX_CHARS = 5;
// acct = {chars:[personagem, ...], savedAt}: tudo que a conta tem, guardado como texto JSON em viboraSaves/{uid}.data
let fb = null, fbUser = null, acct = null, accountReady = false, loginState = 'wait', loginErr = '', delArm = '', delArmT = 0;
let cloudDirty = false, cloudT = 0, cloudBusy = false;
let rankDirty = false, rankList = null, rankErr = '', rankPushT = 0, rankLoading = false, lastScore = -1;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const authMsg = e => e && e.code === 'auth/unauthorized-domain' ? 'Este site ainda não foi autorizado no Firebase (Authentication › Configurações › Domínios autorizados).' : 'Não foi possível entrar (' + ((e && e.code) || 'erro desconhecido') + ').';
const newCid = () => 'c' + Date.now() + Math.floor(Math.random()*1000);
const rankId = cid => fbUser.uid + '_' + cid;

function fbInit(){
  if(fb) return fb;
  if(!window.firebase || !FIREBASE_CONFIG.apiKey) return null;
  try{
    firebase.initializeApp(FIREBASE_CONFIG);
    fb = {auth: firebase.auth(), db: firebase.firestore()};
    fb.auth.onAuthStateChanged(onAuth);
    fb.auth.getRedirectResult().catch(e => { loginErr = authMsg(e); renderLogin(); });
  }catch(e){ fb = null; }
  return fb;
}

/* ---------- ENTRADA: LOGIN E PERSONAGENS ---------- */
// A tela #login cobre o jogo até um personagem ser escolhido (accountReady).
function startAccount(){
  if(!fbInit()){ loginState = 'offline'; }
  renderLogin();
}
function renderLogin(){
  const el = $('#login'); if(!el) return;
  el.hidden = accountReady || !$('#create').hidden;
  if(el.hidden) return;
  if(loginState === 'select') return renderChars();
  let body;
  if(loginState === 'offline') body = `<p class="note" style="color:#ff8c80">Não foi possível conectar. O jogo precisa de internet para entrar na sua conta. Verifique a conexão e recarregue a página.</p>`;
  else if(loginState === 'wait') body = `<p class="note">Conectando…</p>`;
  else if(loginState === 'loading') body = `<p class="note">Carregando seus personagens…</p>`;
  else body = `<button class="btn primary" data-act="login" style="padding:14px;font-size:17px">Entrar com Google</button>`;
  $('#loginBody').innerHTML = `<h1>Caçada da Víbora</h1>
    <p class="lead">Entre com sua conta Google. Seus personagens ficam salvos na conta, continuam em qualquer aparelho e aparecem no ranking.</p>
    ${body}${loginErr ? `<p class="note" style="color:#ff8c80">${esc(loginErr)}</p>` : ''}
    <p class="note">Para os outros jogadores só aparece o nome do herói. Seu nome e seu e-mail do Google ficam privados.</p>`;
}
function renderChars(){
  const list = acct ? acct.chars : [];
  const card = c => {
    const cls = (CLASSES.find(x => x.id === c.char.cls) || CLASSES[0]).n, md = MAPS.find(m => m.id === c.map) || MAPS[0];
    const arm = delArm === c.cid && delArmT > performance.now();
    return `<div class="mapc"><span class="swatch" style="background:${(CLOAKS[c.char.color] || CLOAKS[0]).b}"></span>
      <div class="mh"><span class="mn">${esc(c.char.name)}</span><span class="ml">Nv ${c.lv}${c.par ? ` · <span style="color:#c9a8ff">P${c.par}</span>` : ''}</span></div>
      <div class="mm">${esc(cls)} · ${fmt(c.kills || 0)} abates · ${esc(md.name)}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" data-act="pickChar" data-v="${c.cid}">Jogar</button>
      <button class="btn ${arm ? 'warn' : ''}" data-act="delChar" data-v="${c.cid}">${arm ? 'Toque de novo para apagar' : 'Apagar'}</button></div></div>`;
  };
  $('#loginBody').innerHTML = `<h1>Personagens</h1>
    <p class="lead">${esc(fbUser ? (fbUser.email || fbUser.displayName || 'Conta Google') : '')} · ${list.length}/${MAX_CHARS} personagens</p>
    ${loginErr ? `<p class="note" style="color:#ff8c80">${esc(loginErr)}</p>` : ''}
    <div class="maps">${list.length ? list.map(card).join('') : '<p class="note">Você ainda não tem personagens. Crie o primeiro.</p>'}</div>
    ${list.length < MAX_CHARS ? `<button class="btn primary" data-act="newChar" style="padding:14px;font-size:17px">Criar novo personagem</button>` : `<p class="note">Limite de ${MAX_CHARS} personagens. Apague um para criar outro.</p>`}
    <button class="btn" data-act="logout">Sair da conta</button>`;
}
async function accountLogin(){
  if(!fbInit()) return;
  const prov = new firebase.auth.GoogleAuthProvider(); prov.setCustomParameters({prompt:'select_account'});
  loginErr = ''; renderLogin();
  try{ await fb.auth.signInWithPopup(prov); }
  catch(e){
    if(e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') return fb.auth.signInWithRedirect(prov);
    if(e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request'){ loginErr = authMsg(e); renderLogin(); }
  }
}
async function accountLogout(){
  if(!fb) return;
  save(); await cloudFlush();
  fb.auth.signOut();
}
// Para o jogo e limpa a tela (usado ao sair da conta e ao voltar para a lista de personagens)
function leaveGame(){
  accountReady = false;
  S = defaults(); refreshStats(); hero.hp = ST.life; for(const k in cds) cds[k] = 0;
  closeDlg(); closeSheet(); $('#create').hidden = true; enterTown();
}
function onAuth(u){
  fbUser = u; acct = null; rankList = null; lastScore = -1;
  leaveGame();
  if(!u){ loginState = 'out'; renderLogin(); return; }
  loginState = 'loading'; loginErr = ''; renderLogin();
  fb.db.collection(SAVES).doc(u.uid).get()
    .then(d => loadAccount(d.exists ? parseJSON(d.data().data) : null))
    .catch(e => {
      loginState = 'out';
      loginErr = e.code === 'permission-denied'
        ? 'O Firebase recusou o acesso ao save (permission-denied). As regras publicadas no Firestore precisam ter o bloco viboraSaves: publique o firestore.rules da pasta do jogo.'
        : 'Não foi possível carregar seus personagens (' + (e.code || 'erro') + '). Tente de novo.';
      fb.auth.signOut();
    });
}
const parseJSON = txt => { try{ return JSON.parse(txt); }catch(e){ return null; } };
// Aceita o formato novo {chars:[...]} e o antigo (um personagem só, sem lista)
function toAcct(o){
  if(!o) return null;
  if(Array.isArray(o.chars)) return {chars: o.chars.filter(c => c && c.char && typeof c.lv === 'number'), savedAt: o.savedAt || 0};
  if(typeof o.lv === 'number' && o.char) return {chars: [o], savedAt: o.savedAt || 0};
  return null;
}

/* ---------- SAVE DA CONTA ---------- */
// Usa o mais novo entre a nuvem e a cópia local; o save antigo sem conta (de antes do login) vira um personagem da conta.
function loadAccount(cloudRaw){
  const cloud = toAcct(cloudRaw), local = toAcct(readLocal(KEY + ':' + fbUser.uid)), legacy = toAcct(readLocal(KEY));
  acct = cloud || {chars: [], savedAt: 0};
  if(local && local.savedAt > acct.savedAt) acct = local;
  let changed = acct !== cloud;
  if(legacy && legacy.chars.length && acct.chars.length < MAX_CHARS){ acct.chars.push(legacy.chars[0]); changed = true; try{ localStorage.removeItem(KEY); }catch(e){} }
  for(const c of acct.chars) if(!c.cid || !/^c\d+$/.test(c.cid)){ c.cid = newCid(); changed = true; }
  if(changed){ acct.savedAt = Date.now(); storeLocal(); cloudDirty = true; cloudT = 0; cloudFlush(); }
  showChars();
}
function showChars(){ loginState = 'select'; loginErr = ''; delArm = ''; accountReady = false; renderLogin(); }
function playChar(c){
  S = normalize(c); if(!S.cid) S.cid = newCid();
  refreshStats(); hero.hp = ST.life; for(const k in cds) cds[k] = 0;
  accountReady = true; renderLogin();
  closeDlg(); closeSheet(); $('#create').hidden = true;
  enterMap(S.map); save(); rankDirty = true; lastScore = -1;
}
function newChar(){ $('#login').hidden = true; showCreate(); }
function switchChar(){ save(); cloudFlush(); leaveGame(); showChars(); }
function deleteChar(cid){
  if(delArm !== cid || delArmT < performance.now()){ delArm = cid; delArmT = performance.now() + 3000; renderChars(); setTimeout(() => { if(loginState === 'select') renderChars(); }, 3050); return; }
  delArm = '';
  acct.chars = acct.chars.filter(c => c.cid !== cid); acct.savedAt = Date.now();
  storeLocal(); cloudDirty = true; cloudFlush();
  fb.db.collection(RANK).doc(rankId(cid)).delete().catch(() => {});
  renderChars();
}
// Chamado por save() (01-base): coloca o personagem atual na lista da conta e marca para enviar
function accountStore(){
  if(!acct) return;
  const i = acct.chars.findIndex(c => c.cid === S.cid);
  if(i >= 0) acct.chars[i] = S; else acct.chars.push(S);
  acct.savedAt = Date.now(); storeLocal(); cloudDirty = true;
}
function storeLocal(){ try{ localStorage.setItem(KEY + ':' + fbUser.uid, JSON.stringify(acct)); }catch(e){} }
function cloudFlush(){
  if(!fb || !fbUser || !acct || cloudBusy || !cloudDirty) return Promise.resolve();
  cloudBusy = true; cloudDirty = false; cloudT = CLOUD_EVERY;
  return fb.db.collection(SAVES).doc(fbUser.uid).set({data: JSON.stringify(acct), updated: firebase.firestore.FieldValue.serverTimestamp()})
    .catch(() => { cloudDirty = true; })
    .finally(() => { cloudBusy = false; });
}
// Chamado todo frame por 07-animacoes.js: envia a conta no máximo a cada CLOUD_EVERY segundos e cuida do ranking.
function accountTick(dt){
  if(!fbUser || !acct) return;
  cloudT -= dt;
  if(cloudDirty && cloudT <= 0) cloudFlush();
  if(accountReady) rankTick(dt);
}

/* ---------- RANKING ---------- */
// Uma linha por personagem: ranking/{uid}_{cid}. Posição = nível + Paragon; a fração da barra de XP desempata.
const rankScore = () => S.lv + S.par + Math.min(.999, S.lv >= MAX_LV ? S.pxp/parNeed(S.par) : S.xp/xpNeed(S.lv));
function pushRank(){
  if(!fb || !fbUser || !accountReady || !S.char || !S.cid) return;
  rankDirty = false; rankPushT = 60; lastScore = rankScore();
  fb.db.collection(RANK).doc(rankId(S.cid)).set({
    name: heroName(), lv: S.lv, par: S.par, score: lastScore, cls: S.char.cls || 'arqueiro', kills: S.kills,
    updated: firebase.firestore.FieldValue.serverTimestamp(),
  }).then(() => { if(tab === 'rank') loadRank(); })
    .catch(e => { rankErr = 'Não foi possível enviar sua pontuação (' + (e.code || 'erro') + ').'; if(tab === 'rank') dirtyPanel(); });
}
function rankTick(dt){
  rankPushT -= dt;
  if(rankDirty || (rankPushT <= 0 && Math.abs(rankScore() - lastScore) > 1e-4)) pushRank();
  else if(rankPushT <= 0) rankPushT = 60;
}
function loadRank(){
  if(!fbInit() || rankLoading) return;
  rankLoading = true;
  fb.db.collection(RANK).orderBy('score', 'desc').limit(RANK_N).get()
    .then(q => { rankList = q.docs.map(d => Object.assign({id: d.id}, d.data())); rankErr = ''; })
    .catch(e => { rankErr = 'Não foi possível carregar o ranking (' + (e.code || 'erro') + ').'; })
    .finally(() => { rankLoading = false; if(tab === 'rank') dirtyPanel(); });
}
function panelRank(){
  let h = '';
  if(rankErr) h += `<p class="note" style="color:#ff8c80">${esc(rankErr)}</p>`;
  h += `<div class="sec"><h3>Top ${RANK_N} <span class="r"><button class="tog" data-act="rankRefresh">${rankLoading ? 'Carregando…' : 'Atualizar'}</button></span></h3>
    <p class="note">Ordem pelo nível. Depois do nível ${MAX_LV}, quem tem mais Paragon fica na frente. Só aparece o nome do herói.</p>`;
  const meId = fbUser && S.cid ? rankId(S.cid) : '', mine = id => fbUser && id.startsWith(fbUser.uid + '_');
  if(rankList === null){ if(!rankErr) h += `<p class="note">Carregando…</p>`; }
  else if(!rankList.length) h += `<p class="note">Ninguém no ranking ainda. Seja o primeiro.</p>`;
  else h += `<ol class="rk-list">` + rankList.map((r, i) => {
    const me = r.id === meId, cls = (CLASSES.find(c => c.id === r.cls) || CLASSES[0]).n;
    return `<li class="${me ? 'me' : ''}"><span class="pos">${i + 1}</span><span class="nm">${esc(r.name)}${me ? ' (você)' : mine(r.id) ? ' (sua conta)' : ''}<small>${esc(cls)} · ${fmt(r.kills || 0)} abates</small></span>
      <span class="lv">Nv ${+r.lv || 0}${r.par ? `<br><span class="p">Paragon ${+r.par}</span>` : ''}</span></li>`;
  }).join('') + `</ol>`;
  if(meId && rankList && rankList.length >= RANK_N && !rankList.some(r => r.id === meId)) h += `<p class="note">${esc(heroName())} ainda não está no top ${RANK_N}.</p>`;
  return h + `</div>`;
}
