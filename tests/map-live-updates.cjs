const assert=require('node:assert/strict');
const {game}=require('./production.cjs');
const g=game();
g.run(`
 user={uid:'owner'};state=fresh();
 let now=100000;Date.now=()=>now;
 let icons=0,roads=0,positions=0,label={textContent:''};
 let player={uid:'owner',name:'Motorista',photo:'photo.png',city:'Jundiaí',trip:{start:now-1000,end:now+100000,totalKm:40,path:[[-23,-46],[-22,-47]]}};
 activeMap={getZoom:()=>8};playersVisible=true;
 mapPlayerGroups=()=>[{key:'driver:owner',position:[-23,-46+now/1000000],players:[player]}];
 L={divIcon:options=>({options}),marker:(position,options)=>({
  addTo(){return this},setLatLng(){positions++;return this},setIcon(){icons++;return this},
  getElement:()=>({querySelector:()=>label}),getPopup:()=>null,bindPopup(){return this},on(){return this}
 }),polyline:()=>({addTo(){roads++;return this},setLatLngs(){roads++;return this}})};
 renderLiveDrivers();
`);
const marker=g.run("liveDriverMarkers.get('driver:owner')");
g.run('now+=1000;renderLiveDrivers()');
assert.equal(g.run("liveDriverMarkers.get('driver:owner')"),marker,'Preserve existing marker');
assert.equal(g.run('icons'),0,'Do not recreate photo for countdown updates');
assert.equal(g.run('positions'),1,'Truck still moves');
assert.match(g.run('label.textContent'),/km/,'Telemetry still updates');
assert.equal(g.run('roads'),1,'Unchanged route is drawn only once');
g.run('player.trip.path=JSON.parse(JSON.stringify(player.trip.path));now+=1000;renderLiveDrivers()');
assert.equal(g.run('roads'),1,'Equivalent cloud snapshots do not redraw route');
g.run("player.photo='new-photo.png';renderLiveDrivers()");
assert.equal(g.run('icons'),1,'Changed profile photo refreshes icon');
g.run('player.trip.path.push([-21,-48]);renderLiveDrivers()');
assert.equal(g.run('roads'),2,'Changed route refreshes geometry');
console.log('PASS: stable driver markers, live telemetry, unchanged routes and real updates.');