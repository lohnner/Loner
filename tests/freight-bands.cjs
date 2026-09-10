const assert=require('node:assert/strict');
const fs=require('node:fs');
const {game}=require('./production.cjs');
const g=game();
const names=g.run('Object.keys(cities)');
for(const city of names){g.context.testCity=city;for(const day of ['2026-09-10','2026-09-11']){g.context.testDay=day;const selected=g.run('balancedOfferRoutes(testCity,INITIAL_OFFER_SLOTS,testDay)');const routes=selected.filter(Boolean);assert.equal(new Set(routes.map(r=>r.to)).size,routes.length,city);selected.forEach((r,i)=>{if(!r)return;const [min,max]=[[0,70],[50,100],[71,130],[90,180]][Math.floor(i/3)];assert.ok(r.km>=min&&r.km<=max,city+' slot '+i);assert.notEqual(r.to,city)});assert.equal(JSON.stringify(selected),g.run('JSON.stringify(balancedOfferRoutes(testCity,INITIAL_OFFER_SLOTS,testDay))'));}}
assert.notEqual(g.run('JSON.stringify(balancedOfferRoutes("Campinas",INITIAL_OFFER_SLOTS,"day1"))'),g.run('JSON.stringify(balancedOfferRoutes("Campinas",INITIAL_OFFER_SLOTS,"day2"))'));
const source=fs.readFileSync(require('node:path').join(__dirname,'../script.js'),'utf8');assert.ok(!/\.range\b|ALCANCE|alcance/.test(source),'No operational range checks or labels');
console.log('PASS: exact distance bands, unique destinations, deterministic shared randomization and no operational range.');

for(const city of names){g.context.testCity=city;for(let generation=0;generation<3;generation++){g.context.testGeneration=generation;const offers=g.run('dailyOffersForCity(testCity,INITIAL_OFFER_SLOTS.map((slot,i)=>slot+(i===4?testGeneration*OFFER_TOTAL:0)),testGeneration)');assert.ok(offers.length<=12);assert.equal(new Set(offers.map(o=>o.to)).size,offers.length,city);const counts=[0,0,0,0];offers.forEach((offer,index)=>{assert.equal(offer.index,index);const tier=Math.floor((offer.slot%12)/3);assert.equal(offer.distanceTier,tier);const [min,max]=[[0,70],[50,100],[71,130],[90,180]][tier];assert.ok(offer.km>=min&&offer.km<=max);counts[tier]++;});assert.ok(counts.every(n=>n<=3));}}
assert.ok(g.run('dailyOffersForCity("Paraty").length')<12);
assert.equal(g.run('dailyOffersForCity("Campinas").length'),12);
assert.equal(g.run('dailyOffersForCity("Unknown").length'),0);
// Matching must preserve scarce short destinations instead of consuming them in overlapping bands.
g.run('offerDestinationCache.set("fixture",[{to:"a",km:55},{to:"b",km:60},{to:"c",km:65},{to:"d",km:80},{to:"e",km:85},{to:"f",km:89},{to:"g",km:110},{to:"h",km:115},{to:"i",km:120},{to:"j",km:150},{to:"k",km:160},{to:"l",km:170}])');
assert.equal(g.run('balancedOfferRoutes("fixture",INITIAL_OFFER_SLOTS,"fixture").filter(Boolean).length'),12);
console.log('PASS: live offers, replacement generations, fewer offers, exact tier caps and overlapping-band matching.');
