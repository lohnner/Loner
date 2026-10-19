// Início: liga tudo e começa o loop. O personagem só entra depois do login (09-conta.js).
// Carregado em ordem pelo index.html (ver CLAUDE.md).
'use strict';

/* ---------- INÍCIO ---------- */
buildSkillbar();
hero.hp = ST.life;
enterTown();
startAccount();
requestAnimationFrame(t => { last = t; requestAnimationFrame(frame); });
window.__game = {manualCast, step, tickTrans, updateHud, get S(){ return S; }, get mode(){ return mode; }, get scene(){ return scene; }, hero, ACT, get ST(){ return ST; }, render};
