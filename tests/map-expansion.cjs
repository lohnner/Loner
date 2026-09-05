const assert=require('node:assert/strict');const {game}=require('./production.cjs');
(async()=>{
 const g=game();g.run("user={uid:'owner',displayName:'Rodrigo'};state=fresh();save=()=>{};publishPastaCall=()=>{};toast=()=>{};addLedger=()=>{};pastaFactoryPage=()=>{};let now=Date.now();Date.now=()=>now;");
 g.run("state.pastaFactory={owned:true,stock:[{id:'old',product:'pasta',origin:'Campinas',destination:'São Paulo',producedAt:now}],startedAt:now,readyAt:now+PASTA_GROW_MS};state.skills.pastaFactory=true;state.balance=30000");
 for(const city of ['Paraibuna','Mauá']){g.context.place=city;g.run("state.city=place;state.facility={product:'pasta',city:place};buyPastaFactory(place)");assert.equal(g.run('ensurePastaFactoryState(place).owned'),true);assert.ok(g.run('productionSite(\'pasta\',place).point'));}
 assert.equal(g.run('state.balance'),10000);assert.equal(g.run('state.pastaFactory.stock[0].id'),'old','Campinas save is preserved');
 g.run('now+=PASTA_GROW_MS;advancePastaFactory()');
 assert.equal(g.run("ensurePastaFactoryState('Paraibuna').stock[0].origin"),'Paraibuna');assert.equal(g.run("ensurePastaFactoryState('Mauá').stock[0].origin"),'Mauá');
 assert.notEqual(g.run("ensurePastaFactoryState('Mauá').stock[0].id"),g.run("ensurePastaFactoryState('Paraibuna').stock[0].id"));
 assert.equal(g.run('ownStockCalls().length'),3);g.run("playerCalls=[{id:ensurePastaFactoryState('Mauá').stock[0].id,status:'claimed',claimedAtMs:now}];reconcileOwnFarmCalls()");assert.equal(g.run("ensurePastaFactoryState('Mauá').stock.length"),0);assert.equal(g.run("ensurePastaFactoryState('Paraibuna').stock.length"),1);
 // Activity uses explicit action time even when the heartbeat is more recent.
 assert.equal(g.run('isMapPlayerActive({lastActionAt:now-172800000,lastSeen:now})'),false);
 assert.equal(g.run('isMapPlayerActive({lastActionAt:now-172799999})'),true);
 assert.equal(g.run('isMapPlayerActive({lastActionAt:0,lastSeen:now})'),false);
 assert.equal(g.run('isMapPlayerActive({lastSeen:{seconds:(now-172800001)/1000}})'),false);
 g.run("state.city='Campinas';state.facility=null;state.lastActionAt=now;onlinePlayers=[{uid:'b',name:'B',city:'Campinas',lastActionAt:now},{uid:'c',name:'C',city:'Campinas',facility:{product:'pasta',city:'Campinas'},lastActionAt:now},{uid:'idle',city:'Campinas',lastActionAt:now-172800000}]");
 assert.equal(g.run('mapPlayerGroups().length'),2,'City and factory yard are distinct places');assert.equal(g.run('mapPlayerGroups().find(group=>group.players.length===2).players.length'),2);
 g.run('state.lastActionAt=now-172800000;syncProgress=()=>{};syncPresence=()=>{};activeMap=null');
 g.run("recordPlayerActivity({isTrusted:false,type:'pointerdown',target:{closest:()=>true}})");assert.equal(g.run('isMapPlayerActive(state)'),false,'Synthetic input cannot restore presence');
 g.run("recordPlayerActivity({isTrusted:true,type:'pointerdown',target:{closest:()=>true}})");assert.equal(g.run('isMapPlayerActive(state)'),true,'Authenticated user action restores presence');
 g.run('now+=172800000');assert.equal(g.run('mapPlayers().length'),0,'All inactive images disappear without a snapshot refresh');
 console.log('PASS: independent factories, preserved Campinas stock, unique calls, grouping by location and 48-hour activity expiry.');
})().catch(e=>{console.error(e);process.exitCode=1});
