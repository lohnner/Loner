const assert=require('node:assert/strict'),{game}=require('./production.cjs');const g=game();g.context.console={...console,warn:()=>{}};
g.run("user={uid:'owner'};state=fresh();save=()=>{};toast=()=>{};fuelLevel=()=>100;fuelLitersFor=()=>1;effectiveTruckSpeed=()=>60;fetch=async()=>{throw Error('offline')}");
(async()=>{
const names=g.run('Object.keys(cities)');for(const city of names){g.context.destination=city;g.run("state.city=destination==='Jundiaí'?'Campinas':'Jundiaí';state.trip=null;state.facility=null;state.truckPallets=[]");await g.run('startFreeTrip(destination)');assert.equal(g.run('state.trip.to'),city);assert.equal(g.run('state.trip.freeTrip'),true);assert.ok(Math.abs(g.run('(state.trip.end-state.trip.start)-state.trip.totalKm/75*3600000'))<=1);}
g.run("state.city='Jundiaí';state.trip=null;state.truckPallets=[{id:'cargo'}]");await g.run("startFreeTrip('Campinas')");assert.ok(Math.abs(g.run('(state.trip.end-state.trip.start)-state.trip.totalKm/60*3600000'))<=1);
g.run("state.trip=null;state.city='Jundiaí';state.truckPallets=[];fetch=async()=>({json:async()=>({routes:[{distance:1000,geometry:{coordinates:[[-46,-23],[-46.01,-23.01]]}}]})})");await g.run("startFreeTrip('Campinas')");assert.equal(g.run('state.trip.end-state.trip.start'),48000,'Short trip receives full speed bonus without 15-minute minimum');
g.run("state.trip=null;state.city='Jundiaí';fuelLevel=()=>0");await g.run("startFreeTrip('Campinas')");assert.equal(g.run('state.trip'),null);
console.log('PASS: every city reachable without distance cap, 25% speed bonus, loaded speed, short trips and fuel guard.');
})().catch(e=>{console.error(e);process.exitCode=1});
