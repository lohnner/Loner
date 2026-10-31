// Conta: Firebase, login Google obrigatório e save na nuvem. Só este arquivo fala com o Firebase.
// O save deste jogo fica em criadouroSaves/{uid}; as coleções dos jogos antigos no mesmo projeto não são tocadas.
'use strict';

/* ---------- FIREBASE ---------- */
// Configuração do app Web do Firebase (Console › Configurações do projeto › Seus apps). Esses valores são públicos.
// No site publicado o login usa o próprio lohnner.github.io (arquivos do Firebase em /__/auth/, pasta raiz-lohnner.github.io):
// assim o login por redirecionamento funciona no app (APK) e nos navegadores que separam o armazenamento de outros sites.
const SITE_HOST = 'lohnner.github.io';
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCfHLrtPMnLtfU-PvsVf5QCOXKmuZya51I',
  authDomain: location.hostname === SITE_HOST ? SITE_HOST : 'loner-hq.firebaseapp.com',
  projectId: 'loner-hq',
  storageBucket: 'loner-hq.firebasestorage.app',
  messagingSenderId: '290842361996',
  appId: '1:290842361996:web:f1010f32a520a7148f7ba9',
};
const SAVES = 'criadouroSaves', CLOUD_EVERY = 20;
let fb = null, fbUser = null, accountReady = false, loginState = 'wait', loginErr = '';
let cloudDirty = false, cloudT = 0, cloudBusy = false;
const authMsg = e => e && e.code === 'auth/unauthorized-domain' ? 'Este site ainda não foi autorizado no Firebase (Authentication › Configurações › Domínios autorizados).' : 'Não foi possível entrar (' + ((e && e.code) || 'erro desconhecido') + ').';
const contaEmail = () => fbUser ? (fbUser.email || fbUser.displayName || 'Conta Google') : '';

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

/* ---------- ENTRADA ---------- */
// A tela #login cobre o jogo até a conta carregar (accountReady).
function startAccount(){
  if(!fbInit()){ loginState = 'offline'; }
  renderLogin();
}
function renderLogin(){
  const el = $('#login'); if(!el) return;
  el.hidden = accountReady;
  if(el.hidden) return;
  let body;
  if(loginState === 'offline') body = `<p class="note erro">Não foi possível conectar. O jogo precisa de internet para entrar na sua conta. Verifique a conexão e recarregue a página.</p>`;
  else if(loginState === 'wait') body = `<p class="note">Conectando…</p>`;
  else if(loginState === 'loading') body = `<p class="note">Carregando seu criadouro…</p>`;
  else body = `<button class="btn pri cheio entrar" data-act="login">Entrar com Google</button>`;
  $('#loginBody').innerHTML = `<h1>Loner</h1>
    <p class="lead">Compre machos e fêmeas, crie filhotes, venda e faça dinheiro. Comece com uma gaiola e chegue até a savana.</p>
    ${body}${loginErr ? `<p class="note erro">${esc(loginErr)}</p>` : ''}
    <p class="note">Seu criadouro fica salvo na sua conta Google e continua em qualquer aparelho.</p>`;
}
// Dentro do app instalado (APK/TWA ou atalho na tela inicial) a janela do Google não consegue devolver o login para o jogo:
// lá o login sai por redirecionamento (a página vai para o Google e volta; getRedirectResult em fbInit).
try{ if(document.referrer.startsWith('android-app://')) sessionStorage.setItem('inApp', '1'); }catch(e){}
const inApp = () => { try{ if(sessionStorage.getItem('inApp')) return true; }catch(e){} return matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches && !document.fullscreenElement; };
async function accountLogin(){
  if(!fbInit()) return;
  const prov = new firebase.auth.GoogleAuthProvider(); prov.setCustomParameters({prompt:'select_account'});
  loginErr = ''; renderLogin();
  if(inApp() && location.hostname === SITE_HOST){ loginState = 'wait'; renderLogin(); return fb.auth.signInWithRedirect(prov); }
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
  fbUser = u; accountReady = false; S = defaults(); nascimentosNovos = []; parEscolhido = {M: '', F: ''};
  rankLista = null; rankErro = ''; rankEnviado = -1; rankT = 0;
  if(sheetAberta){ sheetAberta = null; $('#sheet').hidden = true; }
  if(!u){ loginState = 'out'; renderLogin(); return; }
  loginState = 'loading'; loginErr = ''; renderLogin();
  // espera a hora do servidor (no máximo 2,5 s) antes de colocar o jogo em dia
  const relogio = Promise.race([relogioPronto, new Promise(r => setTimeout(r, 2500))]);
  Promise.all([fb.db.collection(SAVES).doc(u.uid).get(), relogio])
    .then(([d]) => loadAccount(d.exists ? parseJSON(d.data().data) : null))
    .catch(e => {
      loginState = 'out';
      loginErr = e.code === 'permission-denied'
        ? 'O Firebase recusou o acesso ao save (permission-denied). As regras publicadas no Firestore precisam ter o bloco criadouroSaves: publique o firestore.rules da pasta do jogo.'
        : 'Não foi possível carregar seu criadouro (' + (e.code || 'erro') + '). Tente de novo.';
      fb.auth.signOut();
    });
}
const parseJSON = txt => { try{ return JSON.parse(txt); }catch(e){ return null; } };
const readLocal = k => { try{ return parseJSON(localStorage.getItem(k)); }catch(e){ return null; } };

/* ---------- SAVE ---------- */
// Vale o mais novo entre a nuvem e a cópia local deste aparelho.
function loadAccount(cloud){
  const local = readLocal(KEY + ':' + fbUser.uid);
  let base = cloud;
  if(local && (!cloud || (local.savedAt || 0) > (cloud.savedAt || 0))) base = local;
  const novo = !base;
  S = normalize(base);
  if(novo) diario(`Criadouro aberto com ${eur(DINHEIRO_INICIAL)}. Boa sorte!`);
  accountReady = true; renderLogin();
  ultimoCiclo = cicloDe(agora()); ultimoDia = chaveIdades();
  processar(); save(); cloudFlush();
  aba = S.animais.length ? 'animais' : 'mercado';
  renderAba(); mostraNascimento();
}
// Chamado por save(): grava a cópia local e marca para enviar
function accountStore(){
  S.savedAt = Date.now();
  try{ localStorage.setItem(KEY + ':' + fbUser.uid, JSON.stringify(S)); }catch(e){}
  cloudDirty = true;
}
function cloudFlush(){
  if(!fb || !fbUser || !accountReady || cloudBusy || !cloudDirty) return Promise.resolve();
  cloudBusy = true; cloudDirty = false; cloudT = CLOUD_EVERY;
  return fb.db.collection(SAVES).doc(fbUser.uid).set({data: JSON.stringify(S), updated: firebase.firestore.FieldValue.serverTimestamp()})
    .catch(() => { cloudDirty = true; })
    .finally(() => { cloudBusy = false; });
}
// Chamado uma vez por segundo: envia no máximo a cada CLOUD_EVERY segundos.
function accountTick(dt){
  if(!fbUser || !accountReady) return;
  cloudT -= dt;
  if(cloudDirty && cloudT <= 0) cloudFlush();
  rankT -= dt;
  if(rankT <= 0 && S.dinheiro !== rankEnviado) pushRank();
}

/* ---------- RANKING ---------- */
// Uma linha por conta em criadouroRank/{uid}: só o apelido e o dinheiro em caixa. Nome e e-mail do Google nunca vão para lá.
const RANK = 'criadouroRank', RANK_N = 50, RANK_EVERY = 60, NOME_MAX = 16;
let rankLista = null, rankErro = '', rankCarregando = false, rankT = 0, rankEnviado = -1;
const nomePublico = () => S.nome || 'Criador ' + fbUser.uid.slice(-4);
function pushRank(){
  if(!fb || !fbUser || !accountReady) return;
  rankT = RANK_EVERY; rankEnviado = S.dinheiro;
  fb.db.collection(RANK).doc(fbUser.uid).set({nome: nomePublico(), dinheiro: S.dinheiro, updated: firebase.firestore.FieldValue.serverTimestamp()}).catch(() => {});
}
function loadRank(){
  if(!fb || rankCarregando) return;
  rankCarregando = true;
  fb.db.collection(RANK).orderBy('dinheiro', 'desc').limit(RANK_N).get()
    .then(q => { rankLista = q.docs.map(d => Object.assign({id: d.id}, d.data())); rankErro = ''; })
    .catch(e => {
      rankErro = e.code === 'permission-denied'
        ? 'O ranking ainda não foi liberado: as regras do Firebase precisam ser publicadas.'
        : 'Não foi possível carregar o ranking (' + (e.code || 'erro') + ').';
    })
    .finally(() => { rankCarregando = false; if(aba === 'rank') renderAba(); });
}
// Sua linha sempre mostra o dinheiro de agora, mesmo antes do próximo envio.
function rankParaTela(){
  if(!rankLista || !fbUser) return null;
  const eu = {id: fbUser.uid, nome: nomePublico(), dinheiro: S.dinheiro};
  const l = rankLista.filter(r => r.id !== fbUser.uid).concat(eu).sort((a, b) => (b.dinheiro || 0) - (a.dinheiro || 0));
  return l.slice(0, RANK_N);
}
