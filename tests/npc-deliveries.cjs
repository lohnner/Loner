const assert=require('node:assert/strict');
const {game}=require('./production.cjs');
const g=game();g.context.structuredClone=structuredClone;g.context.console={...console,warn:()=>{}};
g.run(`user={uid:'owner',displayName:'Maria'};state=fresh();let now=1000000;Date.now=()=>now;let records=new Map(),failCommit=false,routeFails=false;const db={};doc=(_,collection,id)=>({id,key:collection+'/'+id});serverTimestamp=()=>({seconds:now/1000});syncProgress=async()=>{records.set('progress/owner',structuredClone(stateForCloud()))};chrome=()=>{};syncPresence=()=>{};toast=()=>{};save=()=>{};refreshProductionPage=()=>{};advanceAllFarms=()=>{};advanceMedicineFactories=()=>{};advanceWineFactories=()=>{};advancePastaFactory=()=>{};key=()=> 'test';fetch=async()=>{if(routeFails)throw Error('offline');return{ok:true,json:async()=>({routes:[{distance:120000,geometry:{coordinates:[[-47,-23],[-46.5,-23.1],[-46,-23.2]]}}]})}};runTransaction=async(_,work)=>{const writes=[];const result=await work({get:async ref=>({exists:()=>records.has(ref.key),data:()=>structuredClone(records.get(ref.key))}),update:(ref,value)=>writes.push(()=>records.set(ref.key,{...records.get(ref.key),...value})),set:(ref,value)=>writes.push(()=>records.set(ref.key,value))});if(failCommit)throw Error('offline commit');writes.forEach(fn=>fn());return result};`);
(async()=>{
for(const [product,pay] of [['pasta',1000],['player-rice',1666.67],['paracetamol',2666.67],['wine',2333.33]]){
 g.context.product=product;
 g.run(`state=fresh();records.clear();playerCalls=[];npcRetryAt=0;var site=productionSites().find(s=>s.product===product),city=site.city,id='npc-'+product,pallet={id,product,origin:city,destination:'Santos',producedAt:now};if(product==='pasta')state.pastaFactory={owned:true,stock:[pallet]};if(product==='player-rice')state.agriculture={farms:{[city]:{owned:true,stock:[pallet]}}};if(product==='paracetamol')state.pharmaceutical={factories:{[city]:{owned:true,stock:[pallet]}}};if(product==='wine')state.wineries={[city]:{owned:true,stock:[pallet]}};var call=ownStockCalls()[0];playerCalls=[call];records.set('playerCalls/'+id,call);`);
 // Remote dispatch does not require the owner's truck or presence at the site.
 g.run("state.city='Jundiaí';state.tires.tia=0;state.trip={from:'Jundiaí',to:'São Paulo',start:now,end:now+1000,totalKm:10,path:[[-23,-47],[-24,-46]]};state.truckPallets=[{id:'unrelated'}];routeFails=true");
 await g.run('dispatchNpcDelivery(id)');assert.equal(g.run('npcStockFactory(state,product,city).stock.length'),1);
 g.run('routeFails=false;failCommit=true');await g.run('dispatchNpcDelivery(id)');assert.equal(g.run('npcStockFactory(state,product,city).stock.length'),1);assert.equal(g.run("records.get('playerCalls/'+id).status"),'available');
 g.run('failCommit=false');await g.run('dispatchNpcDelivery(id)');assert.equal(g.run('npcStockFactory(state,product,city).stock.length'),0);assert.equal(g.run('state.truckPallets.length'),1);assert.equal(g.run('state.trip.to'),'São Paulo');assert.equal(g.run('state.balance'),0);
 assert.equal(g.run("records.get('playerCalls/'+id).status"),'npc_transit');assert.equal(g.run("records.get('playerCalls/'+id).npcTrip.durationMs"),7200000);assert.equal(g.run('npcMapPlayers().length'),1);assert.equal(g.run('tripSpeedKmh(npcMapPlayers()[0].trip)'),60);
 await g.run('dispatchNpcDelivery(id)');assert.equal(g.run('npcMapPlayers().length'),1,'No second dispatch');
 await g.run('settleNpcDeliveries()');assert.equal(g.run('state.balance'),0,'No early payment');
 g.run('now+=3600000');assert.equal(g.run('remoteTripStatus(npcMapPlayers()[0].trip).pct'),.5,'Movement by elapsed time');
 // Reconnection reads the persisted call, including the server start timestamp.
 g.run("playerCalls=[structuredClone(records.get('playerCalls/'+id))];now+=3600000;failCommit=true");await g.run('settleNpcDeliveries()');assert.equal(g.run('state.balance'),0);assert.equal(g.run("records.get('playerCalls/'+id).status"),'npc_transit');
 g.run('failCommit=false;now+=15000');await g.run('settleNpcDeliveries()');assert.equal(g.run('state.balance'),pay);assert.equal(g.run("records.get('playerCalls/'+id).status"),'npc_delivered');assert.equal(g.run('npcMapPlayers().length'),0);assert.equal(g.run('state.ledger.length'),1);
 // Even a stale client snapshot cannot pay the same call again.
 g.run("playerCalls=[{...records.get('playerCalls/'+id),status:'npc_transit'}];npcRetryAt=0");await g.run('settleNpcDeliveries()');assert.equal(g.run('state.balance'),pay);assert.equal(g.run('state.ledger.length'),1);
}
// Someone else's available pallet never invokes the NPC dispatcher.
g.run("state=fresh();playerCalls=[{id:'foreign',status:'available',ownerId:'someone',product:'pasta'}]");await g.run("dispatchNpcDelivery('foreign')");assert.equal(g.run('productionBusy'),false);

// A courier taking a pallet after the local snapshot wins the reservation.
g.run("state=fresh();state.pastaFactory={owned:true,stock:[{id:'race',product:'pasta',origin:'Campinas',destination:'Santos',producedAt:now}]};playerCalls=[];var race=ownStockCalls()[0];playerCalls=[race];records.set('playerCalls/race',{...race,status:'claimed',claimedBy:'courier'})");await g.run("dispatchNpcDelivery('race')");assert.equal(g.run("records.get('playerCalls/race').status"),'claimed');assert.equal(g.run('state.balance'),0);
// Unpublished ready stock can be published and dispatched, with only one NPC on repeated clicks.
g.run("state=fresh();state.pastaFactory={owned:true,stock:[{id:'unpublished',product:'pasta',origin:'Campinas',destination:'Santos',producedAt:now}]};playerCalls=[]");await Promise.all([g.run("dispatchNpcDelivery('unpublished')"),g.run("dispatchNpcDelivery('unpublished')")]);assert.equal(g.run("records.get('playerCalls/unpublished').status"),'npc_transit');assert.equal(g.run('state.pastaFactory.stock.length'),0);
console.log('PASS: four production types, remote dispatch, fixed speed, persisted movement, failures preserve stock, atomic single payout, ownership.');
})().catch(error=>{console.error(error);process.exitCode=1});
