// Início: liga tudo e começa o loop. O personagem só entra depois do login (09-conta.js).
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- ATUALIZAÇÃO ---------- */
// Versão deste jogo = o ?v= do próprio script (mesmo número de versao.json). Ao abrir e ao voltar para o app
// confere se saiu outra; se saiu, a janela #upd obriga a atualizar (versões misturadas podem estragar o save).
const GAME_V = +new URL(document.currentScript.src).searchParams.get('v') || 0;
const UPD_EVERY = 5 * 60e3;
let updT = 0;
function checkUpdate(){
  if(!GAME_V || Date.now() - updT < UPD_EVERY) return;
  updT = Date.now();
  fetch('versao.json?t=' + Date.now(), {cache:'no-store'})
    .then(r => r.ok ? r.json() : null)
    .then(j => { if(j && +j.v > GAME_V){ $('#upd').hidden = false; $('#upd').dataset.v = +j.v; } })
    .catch(() => {}); // sem internet: segue jogando
}
ACT.update = () => {
  const b = $('#updBtn'); b.disabled = true; b.textContent = 'Atualizando…';
  save();
  // endereço novo (?u=) faz o navegador buscar o index.html novo, que já aponta para os scripts novos
  const go = () => location.replace(location.pathname + '?u=' + $('#upd').dataset.v);
  Promise.race([cloudFlush(), new Promise(r => setTimeout(r, 3000))]).then(go, go);
};
if(/[?&]u=/.test(location.search)) history.replaceState(null, '', location.pathname);
document.addEventListener('visibilitychange', () => { if(!document.hidden) checkUpdate(); });
if('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});

// Celular no navegador: no primeiro toque entra em tela cheia e trava deitado (no app instalado o manifest já trava)
document.addEventListener('pointerdown', e => {
  if(e.pointerType === 'mouse' || document.fullscreenElement || !document.documentElement.requestFullscreen) return;
  document.documentElement.requestFullscreen().then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape')).catch(() => {});
}, {once:true});

/* ---------- INÍCIO ---------- */
buildSkillbar();
hero.hp = ST.life;
enterTown();
startAccount();
checkUpdate();
requestAnimationFrame(t => { last = t; requestAnimationFrame(frame); });
window.__game = {manualCast, step, tickTrans, updateHud, get S(){ return S; }, get mode(){ return mode; }, get scene(){ return scene; }, hero, ACT, get ST(){ return ST; }, render};
