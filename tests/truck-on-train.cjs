const assert=require('node:assert/strict');
const {game}=require('./production.cjs');
(async()=>{
 const g=game();g.context.fetch=async()=>{throw Error('offline')};
 g.run("user={uid:'driver'};state=fresh();state.city='São José dos Campos';state.balance=500;state.truckPallets=[{id:'cargo',product:'pasta'}];save=()=>{};route=()=>{};toast=()=>{};updateTopFuel=()=>{};");
 assert.ok(g.run("truckOnTrainDestinations(state.city).includes('Guaratinguetá')"));
 assert.ok(g.run("truckOnTrainDestinations('Guaratinguetá').includes('São José dos Campos')"));
 g.run("startTruckOnTrain(state.city,'Guaratinguetá')");
 assert.equal(g.run('state.trip'),null,'City presence cannot board');
 assert.equal(g.run('state.balance'),500);
 assert.match(g.run('truckOnTrainPopup(state.city)'),/IR ATÉ A ESTAÇÃO/);
 assert.match(g.run('truckOnTrainPopup(state.city)'),/data-truck-train-to="Guaratinguetá" disabled/);
 const fuel=g.run('fuelLevel()'),tires=g.run('tireCondition()');
 await g.run("startProductionAccess('truck-on-train',state.city)");
 assert.equal(g.run('state.trip.localAccess'),true);
 assert.equal(g.run('state.facility'),null,'Station is not reached when clicking access');
 assert.equal(g.run('state.trip.path[0][0]'),g.run('cities[state.city].lat'));
 assert.equal(g.run('state.trip.path.at(-1)[0]'),g.run('TRUCK_ON_TRAIN_TERMINALS[state.city].lat'));
 g.run("startTruckOnTrain(state.city,'Guaratinguetá')");assert.equal(g.run('state.trip.localAccess'),true);
 g.run('finishTrip()');
 assert.equal(g.run('atTrainStation(state.city)'),true);
 assert.ok(g.run('fuelLevel()')<fuel,'Road access consumes diesel');
 assert.ok(g.run('tireCondition()')<tires,'Road access wears tires');
 assert.equal(g.run('state.balance'),500);
 assert.equal(g.run('parkedPlayerPosition({city:state.city,facility:state.facility})[0]'),g.run('TRUCK_ON_TRAIN_TERMINALS[state.city].lat'));
 assert.match(g.run('truckOnTrainPopup(state.city)'),/data-truck-train-to="Guaratinguetá" >/);
 const railFuel=g.run('fuelLevel()'),railTires=g.run('tireCondition()');
 g.run("startTruckOnTrain(state.city,'Guaratinguetá')");
 assert.equal(g.run('state.trip.truckOnTrain'),true);assert.equal(g.run('state.balance'),450);
 g.run('finishTrip()');
 assert.equal(g.run('state.city'),'Guaratinguetá');assert.equal(g.run('atTrainStation(state.city)'),true);
 assert.equal(g.run('fuelLevel()'),railFuel);assert.equal(g.run('tireCondition()'),railTires);
 assert.equal(g.run('state.truckPallets[0].id'),'cargo');
 assert.ok(g.run('location.hash').startsWith('estacao/'));
 await g.run("startLocalAccess({city:state.city,point:cities[state.city],product:null,name:'Centro'})");
 assert.equal(g.run('state.trip.path[0][0]'),g.run('TRUCK_ON_TRAIN_TERMINALS[state.city].lat'));
 g.run('finishTrip()');assert.equal(g.run('state.facility'),null);assert.ok(g.run('location.hash').startsWith('cidade/'));
 // An in-flight road request cannot replace a newer trip.
 g.context.fetch=()=>new Promise(resolve=>{g.context.resolveRoad=resolve});
 const pending=g.run("startProductionAccess('truck-on-train',state.city)");
 g.run("state.trip={id:'newer'}");g.context.resolveRoad({json:async()=>({routes:[]})});await pending;
 assert.equal(g.run('state.trip.id'),'newer');
 // Every railway segment uses the shared 200 km/h speed, in either direction.
 assert.equal(g.run('TRUCK_ON_TRAIN_SPEED'),200);
 assert.ok(g.run("truckOnTrainDestinations('Piracicaba').includes('Itapetininga')"));
 assert.ok(g.run("truckOnTrainDestinations('Itapetininga').includes('Piracicaba')"));
 const segments=JSON.parse(g.run('JSON.stringify(TRUCK_ON_TRAIN_SEGMENTS)'));
 for(const segment of segments){
  for(const [from,to] of [[segment.from,segment.to],[segment.to,segment.from]]){
   g.context.from=from;g.context.to=to;
   g.run("state.trip=null;state.city=from;state.facility={product:'truck-on-train',city:from};state.balance=500;startTruckOnTrain(from,to)");
   assert.equal(g.run('state.trip.railSpeed'),200);
   assert.equal(g.run('state.trip.durationMs'),Math.round(segment.km/200*60)*60000);
   assert.equal(g.run('state.balance'),450);
   assert.equal(g.run('state.trip.fuelPlanned'),0);
   assert.equal(g.run('state.truckPallets[0].id'),'cargo');
   assert.equal(g.run('state.trip.path[0][0]'),g.run('TRUCK_ON_TRAIN_TERMINALS[from].lat'));
   assert.equal(g.run('state.trip.path.at(-1)[0]'),g.run('TRUCK_ON_TRAIN_TERMINALS[to].lat'));
   assert.match(g.run('truckOnTrainPopup(from)'),/200 km\/h/);
   g.run('finishTrip()');
   assert.equal(g.run('state.city'),to);
   assert.equal(g.run('atTrainStation(to)'),true);
  }
 }
 // Rendering the map starts directly with its controls, without the removed heading.
 g.run("state.trip=null;activeMap=null;const mapView={innerHTML:''};document.querySelector=selector=>selector==='#view'?mapView:{innerHTML:''};baseMapPage()");
 assert.ok(g.run("mapView.innerHTML.startsWith('<section class=\"map-shell\">')"));
 assert.ok(g.run("!mapView.innerHTML.includes('CENTRAL GEOGRÁFICA')&&!mapView.innerHTML.includes('class=\"heading\"')"));
 console.log('PASS: station access, blocked early boarding, road consumption, rail fee, cargo preservation, destination station, city exit and stale request guard.');
})().catch(error=>{console.error(error);process.exitCode=1});
