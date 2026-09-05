const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../script.js'),'utf8');
function game(){
 const start=source.indexOf('async function logout('),end=source.indexOf('// Production sites are distinct destinations',start);
 const code=source.slice(0,start).split('\n').slice(3).join('\n')+source.slice(end);
 const context=vm.createContext({console,Date,Math,JSON,Map,Set,Promise,Number,String,Boolean,Array,Object,Infinity,crypto:require('node:crypto').webcrypto,window:{},document:{querySelector:()=>({}),querySelectorAll:()=>[]},location:{hash:''},localStorage:{setItem(){}},setInterval:()=>1,clearInterval(){},setTimeout(){},addEventListener(){},sessionStorage:{},AbortSignal});
 vm.runInContext(code,context);return{context,run:code=>vm.runInContext(code,context)};
}
(async()=>{
 const g=game();
 g.run(`user={uid:'owner',displayName:'Dona Maria'};state=fresh();state.city='Campinas';let now=1000000;Date.now=()=>now;save=()=>{};publishPastaCall=p=>published.push(p);let published=[];`);
 g.run(`state.pastaFactory={owned:true,stock:[],startedAt:now,readyAt:now+PASTA_GROW_MS};now+=PASTA_GROW_MS;advancePastaFactory()`);
 assert.equal(g.run('state.pastaFactory.stock.length'),1);
 assert.equal(g.run('state.pastaFactory.readyAt-now'),21600000,'Next six-hour cycle starts immediately');
 g.run('now+=PASTA_GROW_MS;advancePastaFactory()');assert.equal(g.run('state.pastaFactory.stock.length'),1);
 const ready=g.run('state.pastaFactory.readyAt');g.run('now+=3600000;advancePastaFactory()');assert.equal(g.run('state.pastaFactory.readyAt'),ready,'Finished production waits without restarting');
 g.run('state.pastaFactory.stock=[];state.pastaFactory.slotFreedAt=now;advancePastaFactory()');assert.equal(g.run('state.pastaFactory.stock.length'),1);assert.equal(g.run('state.pastaFactory.readyAt-now'),21600000);
 g.run('state.pastaFactory.startedAt=0;state.pastaFactory.readyAt=0;now+=1000;advancePastaFactory()');assert.ok(g.run('state.pastaFactory.startedAt>0'),'Legacy full stock resumes production');
 g.run(`ensureAgricultureState=()=>({farms:{}});ensurePharmaceuticalState=()=>({factories:{}});ensureWineState=()=>({});playerCalls=[];let oldId=state.pastaFactory.stock[0].id;reconcileOwnFarmCalls()`);assert.equal(g.run('state.pastaFactory.stock[0].id'),g.run('oldId'),'Missing publication does not erase stock');
 assert.equal(g.run("atProductionSite('pasta','Campinas')"),false);g.run("state.facility={product:'pasta',city:'Campinas'}");assert.equal(g.run("atProductionSite('pasta','Campinas')"),true);
 // Mock Firestore with atomic commits; failed commits discard every write.
 g.run(`let records=new Map(),failCommit=false;const db={};doc=(_,collection,id)=>({id,key:collection+'/'+id});serverTimestamp=()=>now;syncProgress=async()=>{};chrome=()=>{};syncPresence=()=>{};toast=()=>{};cityPage=()=>{};key=()=> 'test';fuelCostFor=()=>50;runTransaction=async(_,work)=>{const writes=[];const result=await work({get:async ref=>({exists:()=>records.has(ref.key),data:()=>structuredClone(records.get(ref.key))}),update:(ref,value)=>writes.push(()=>records.set(ref.key,{...records.get(ref.key),...value})),set:(ref,value)=>writes.push(()=>records.set(ref.key,value))});if(failCommit)throw Error('offline');writes.forEach(write=>write());return result};`);
 g.context.structuredClone=structuredClone;
 g.run(`user={uid:'courier',displayName:'João'};state=fresh();state.city='Campinas';state.facility={product:'pasta',city:'Campinas'};const call={id:'p1',status:'available',ownerId:'owner',ownerName:'Maria',ownerCompany:'Massas Maria',origin:'Campinas',destination:'Santos',km:100,product:'pasta',gross:1500};records.set('playerCalls/p1',call);records.set('progress/courier',structuredClone(state));playerCalls=[call];`);
 g.run("state.facility=null");await g.run("claimPlayerCall('p1')");assert.equal(g.run('state.truckPallets.length'),0,'City access alone cannot pick up');g.run("state.facility={product:'pasta',city:'Campinas'}");await g.run("claimPlayerCall('p1')");assert.equal(g.run('state.truckPallets.length'),1);assert.equal(g.run("records.get('playerCalls/p1').status"),'claimed');
 await g.run("claimPlayerCall('p1')");assert.equal(g.run('state.truckPallets.length'),1,'Duplicate pickup rejected');
 g.run("state.city='Santos';state.facility=null;records.get('progress/courier').city='Santos';records.get('progress/courier').facility=null;failCommit=true");await g.run('completeProductionContracts()');assert.equal(g.run('state.truckPallets.length'),1,'Offline delivery preserves cargo');assert.equal(g.run('state.balance'),0);
 g.run('failCommit=false');await g.run('completeProductionContracts()');assert.equal(g.run('state.truckPallets.length'),0);assert.equal(g.run('state.balance'),550);assert.equal(g.run("records.get('farmEarnings/p1-owner').amount"),950);assert.equal(g.run("records.get('playerCalls/p1').status"),'delivered');
 await g.run('completeProductionContracts()');assert.equal(g.run('state.balance'),550,'Repeated delivery cannot pay twice');
 g.run("user={uid:'owner',displayName:'Maria'};state=fresh();records.set('progress/owner',structuredClone(state))");await g.run("creditProductionEarning(doc(db,'farmEarnings','p1-owner'))");assert.equal(g.run('state.balance'),950);await g.run("creditProductionEarning(doc(db,'farmEarnings','p1-owner'))");assert.equal(g.run('state.balance'),950,'Owner receipt cannot credit twice');
 assert.ok(!source.includes('const productionReward=completeProductionContracts()'),'Arrival does not automatically deliver');
 console.log('PASS: continuous production, full-stock waiting, migration, stock reconciliation, facility access, single pickup, atomic failure, delivery and payouts.');
})().catch(error=>{console.error(error);process.exitCode=1});
