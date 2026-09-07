const assert=require('node:assert/strict'),fs=require('node:fs'),{game}=require('./production.cjs');
const g=game();
g.run("user={uid:'skills-test'};state=fresh();state.missionPoints=65;save=()=>{};toast=()=>{};skillsPage=()=>{};addLedger=()=>{};publishPastaCall=()=>{};let now=100000000;Date.now=()=>now;");
g.run("unlockSkill('pastaPalletSpace')");assert.equal(g.run('state.missionPoints'),65);
g.run("unlockSkill('pastaFactory')");assert.equal(g.run('state.missionPoints'),50);
g.run("state.city='Campinas';state.facility={product:'pasta',city:'Campinas'};state.balance=10000;pastaFactoryPage=()=>{};buyPastaFactory('Campinas')");
assert.equal(g.run('state.pastaFactory.readyAt-now'),21600000);
g.run("now+=600000;unlockSkill('fasterPastaProduction')");
assert.equal(g.run('state.missionPoints'),25);assert.equal(g.run('state.pastaFactory.readyAt-now'),1200000);
g.run("unlockSkill('pastaPalletSpace');unlockSkill('pastaPalletSpace')");
assert.equal(g.run('state.missionPoints'),0);assert.equal(g.run('pastaStockCapacity()'),2);
g.run("now+=7200000;advancePastaFactory()");
assert.equal(g.run('state.pastaFactory.stock.length'),2);
assert.notEqual(g.run('state.pastaFactory.stock[0].id'),g.run('state.pastaFactory.stock[1].id'));
g.run("ensurePastaFactoryState();now+=7200000;advancePastaFactory()");
assert.equal(g.run('state.pastaFactory.stock.length'),2);
g.run("state.pastaFactory.stock.shift();state.pastaFactory.slotFreedAt=now;advancePastaFactory()");
assert.equal(g.run('state.pastaFactory.stock.length'),2);assert.equal(g.run('state.pastaFactory.readyAt-now'),1800000);
g.run("state.city='Mauá';state.facility={product:'pasta',city:'Mauá'};state.balance=10000;buyPastaFactory('Mauá')");
assert.equal(g.run("ensurePastaFactoryState('Mauá').readyAt-now"),1800000);
g.run("now+=3600000;advancePastaFactory()");
assert.equal(g.run("ensurePastaFactoryState('Mauá').stock.length"),2);
for(const slug of ['pasta-pallet-space','faster-pasta-production']){const p=fs.readFileSync('assets/skills/'+slug+'.png');assert.equal(p.readUInt32BE(16),512);assert.equal(p.readUInt32BE(20),512)}
// Insufficient points cannot buy an upgrade.
const h=game();h.run("state=fresh();state.skills.pastaFactory=true;state.missionPoints=24;toast=()=>{};unlockSkill('pastaPalletSpace')");
assert.equal(h.run("hasSkill('pastaPalletSpace')"),false);assert.equal(h.run('state.missionPoints'),24);
console.log('PASS: prerequisites, 15/25/25 costs, duplicate purchase, active timer, offline production, two slots, restocking and all factories.');
