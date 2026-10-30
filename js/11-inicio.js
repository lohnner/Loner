// Início: hora do servidor, aviso de atualização e o relógio do jogo. A conta entra depois do login (08-conta.js).
'use strict';

/* ---------- HORA DO SERVIDOR E ATUALIZAÇÃO ---------- */
// Versão deste jogo = o ?v= do próprio script (mesmo número de versao.json). Se saiu outra, a janela #upd obriga a atualizar.
const GAME_V = +new URL(document.currentScript.src).searchParams.get('v') || 0;
const UPD_EVERY = 5 * 60e3;
let updT = 0, relogioOk;
const relogioPronto = new Promise(r => { relogioOk = r; });
function checkUpdate(){
  if(Date.now() - updT < UPD_EVERY) return;
  updT = Date.now();
  fetch('versao.json?t=' + Date.now(), {cache:'no-store'})
    .then(r => {
      const h = Date.parse(r.headers.get('date') || '');
      if(h) relogioDif = h - Date.now();
      return r.ok ? r.json() : null;
    })
    .then(j => { if(GAME_V && j && +j.v > GAME_V){ $('#upd').hidden = false; $('#upd').dataset.v = +j.v; } })
    .catch(() => {}) // sem internet: segue com a hora do aparelho
    .finally(relogioOk);
}
ACT.update = () => {
  const b = $('#updBtn'); b.disabled = true; b.textContent = 'Atualizando…';
  save();
  // endereço novo (?u=) faz o navegador buscar o index.html novo, que já aponta para os scripts novos
  const go = () => location.replace(location.pathname + '?u=' + $('#upd').dataset.v);
  Promise.race([cloudFlush(), new Promise(r => setTimeout(r, 3000))]).then(go, go);
};
if(/[?&]u=/.test(location.search)) history.replaceState(null, '', location.pathname);
document.addEventListener('visibilitychange', () => {
  if(document.hidden){ save(); cloudFlush(); }
  else { checkUpdate(); tick(); }
});
if('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});

/* ---------- INÍCIO ---------- */
checkUpdate();
startAccount();
setInterval(() => { tick(); accountTick(1); }, 1000);
requestAnimationFrame(quadroTerreno);
window.__game = {get S(){ return S; }, ACT, tick, processar, renderAba, mercado, precoCompra, precoVenda, get dif(){ return relogioDif; }, set dif(v){ relogioDif = v; }};
