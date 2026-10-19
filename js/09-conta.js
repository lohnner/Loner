// Conta: Firebase, login Google obrigatório, save do personagem na nuvem e ranking online.
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
const SAVES = 'viboraSaves', RANK = 'ranking', RANK_N = 50, CLOUD_EVERY = 20;
let fb = null, fbUser = null, accountReady = false, loginState = 'wait', loginErr = '';
let cloudDirty = false, cloudT = 0, cloudBusy = false;
let rankDirty = false, rankList = null, rankErr = '', rankPushT = 0, rankLoading = false, lastScore = -1;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const authMsg = e => e && e.code === 'auth/unauthorized-domain' ? 'Este site ainda não foi autorizado no Firebase (Authentication › Configurações › Domínios autorizados).' : 'Não foi possível entrar (' + ((e && e.code) || 'erro desconhecido') + ').';

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

/* ---------- LOGIN ---------- */
// Tela de entrada: cobre o jogo até a conta Google carregar o personagem.
function startAccount(){
  if(!fbInit()){ loginState = 'offline'; }
  renderLogin();
}
function renderLogin(){
  const el = $('#login'); if(!el) return;
  el.hidden = accountReady;
  if(accountReady) return;
  let body;
  if(loginState === 'offline') body = `<p class="note" style="color:#ff8c80">Não foi possível conectar. O jogo precisa de internet para entrar na sua conta. Verifique a conexão e recarregue a página.</p>`;
  else if(loginState === 'wait') body = `<p class="note">Conectando…</p>`;
  else if(loginState === 'loading') body = `<p class="note">Carregando seu herói…</p>`;
  else body = `<button class="btn primary" data-act="login" style="padding:14px;font-size:17px">Entrar com Google</button>`;
  $('#loginBody').innerHTML = `<h1>Caçada da Víbora</h1>
    <p class="lead">Entre com sua conta Google. Seu herói fica salvo na conta, continua em qualquer aparelho e aparece no ranking.</p>
    ${body}${loginErr ? `<p class="note" style="color:#ff8c80">${esc(loginErr)}</p>` : ''}
    <p class="note">Para os outros jogadores só aparece o nome do herói. Seu nome e seu e-mail do Google ficam privados.</p>`;
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
function onAuth(u){
  fbUser = u; rankList = null; lastScore = -1;
  if(!u){
    // Saiu: limpa o jogo e volta para a tela de entrada
    accountReady = false; loginState = 'out';
    S = defaults(); refreshStats(); hero.hp = ST.life; for(const k in cds) cds[k] = 0;
    closeDlg(); closeSheet(); $('#create').hidden = true; enterTown();
    renderLogin(); return;
  }
  loginState = 'loading'; loginErr = ''; renderLogin();
  fb.db.collection(SAVES).doc(u.uid).get()
    .then(d => applyAccount(d.exists ? parseSave(d.data().data) : null))
    .catch(e => { loginState = 'out'; loginErr = 'Não foi possível carregar seu herói (' + (e.code || 'erro') + '). Tente de novo.'; fb.auth.signOut(); });
}
const parseSave = txt => { try{ const o = JSON.parse(txt); return o && typeof o.lv === 'number' ? o : null; }catch(e){ return null; } };

/* ---------- SAVE NA NUVEM ---------- */
// Escolhe o save mais novo entre a nuvem e a cópia local da conta. Sem nenhum dos dois, aproveita o save antigo do navegador (de antes do login).
function applyAccount(cloud){
  const mine = readLocal(KEY + ':' + fbUser.uid), legacy = cloud || mine ? null : readLocal(KEY);
  let o = cloud;
  if(mine && (!o || (mine.savedAt || 0) > (o.savedAt || 0))) o = mine;
  if(!o && legacy && legacy.char) o = legacy;
  S = o ? normalize(o) : defaults();
  refreshStats(); hero.hp = ST.life; for(const k in cds) cds[k] = 0;
  accountReady = true; renderLogin();
  closeDlg(); closeSheet();
  if(S.char){ $('#create').hidden = true; enterMap(S.map); log(`${heroName()} entrou na caçada`, '#9bd84a'); }
  else { enterTown(); showCreate(); }
  if(legacy && o === legacy){ save(); cloudFlush(); try{ localStorage.removeItem(KEY); }catch(e){} log('Seu herói deste aparelho foi salvo na sua conta.', '#9bd84a'); }
  else if(o !== cloud){ cloudDirty = true; }
  rankDirty = true;
}
function cloudSaveSoon(){ cloudDirty = true; }
function cloudFlush(){
  if(!fb || !fbUser || !accountReady || cloudBusy) return Promise.resolve();
  cloudBusy = true; cloudDirty = false; cloudT = CLOUD_EVERY;
  return fb.db.collection(SAVES).doc(fbUser.uid).set({data: JSON.stringify(S), updated: firebase.firestore.FieldValue.serverTimestamp()})
    .catch(() => { cloudDirty = true; })
    .finally(() => { cloudBusy = false; });
}
// Chamado todo frame por 07-animacoes.js: envia o save no máximo a cada CLOUD_EVERY segundos e cuida do ranking.
function accountTick(dt){
  if(!fbUser || !accountReady) return;
  cloudT -= dt;
  if(cloudDirty && cloudT <= 0) cloudFlush();
  rankTick(dt);
}

/* ---------- RANKING ---------- */
// Posição = nível + Paragon; a fração da barra de XP desempata
const rankScore = () => S.lv + S.par + Math.min(.999, S.lv >= MAX_LV ? S.pxp/parNeed(S.par) : S.xp/xpNeed(S.lv));
function pushRank(){
  if(!fb || !fbUser || !accountReady || !S.char) return;
  rankDirty = false; rankPushT = 60; lastScore = rankScore();
  fb.db.collection(RANK).doc(fbUser.uid).set({
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
  if(rankList === null){ if(!rankErr) h += `<p class="note">Carregando…</p>`; }
  else if(!rankList.length) h += `<p class="note">Ninguém no ranking ainda. Seja o primeiro.</p>`;
  else h += `<ol class="rk-list">` + rankList.map((r, i) => {
    const me = fbUser && r.id === fbUser.uid, cls = (CLASSES.find(c => c.id === r.cls) || CLASSES[0]).n;
    return `<li class="${me ? 'me' : ''}"><span class="pos">${i + 1}</span><span class="nm">${esc(r.name)}${me ? ' (você)' : ''}<small>${esc(cls)} · ${fmt(r.kills || 0)} abates</small></span>
      <span class="lv">Nv ${+r.lv || 0}${r.par ? `<br><span class="p">Paragon ${+r.par}</span>` : ''}</span></li>`;
  }).join('') + `</ol>`;
  if(fbUser && rankList && rankList.length >= RANK_N && !rankList.some(r => r.id === fbUser.uid)) h += `<p class="note">Você ainda não está no top ${RANK_N}.</p>`;
  return h + `</div>`;
}
