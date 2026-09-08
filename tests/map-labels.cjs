const assert=require('node:assert/strict');
const fs=require('node:fs');
const {game}=require('./production.cjs');
const g=game();
const style=JSON.parse(fs.readFileSync('assets/maps/liberty.json','utf8'));
g.context.style=style;
const result=JSON.parse(g.run('JSON.stringify(gameBasemapStyle(style))'));
assert.equal(result.layers.length,style.layers.length);
for(let i=0;i<style.layers.length;i++){
 const before=style.layers[i],after=result.layers[i];
 if(before.type==='symbol'&&before['source-layer']==='place'&&before.layout?.['text-field']){
  assert.equal(after.filter[0],'all');
  assert.deepEqual(after.filter[1],before.filter);
  assert.equal(after.filter.at(-1)[0],'!');
  assert.deepEqual(after.layout,before.layout);
 }else assert.deepEqual(after,before,'Non-place layers must remain unchanged');
}
// Evaluate the generated predicate against real registration coordinates and negative cases.
const predicate=JSON.parse(g.run('JSON.stringify(gameCityLabelMatch())'));
function evaluate(expr,properties,point){
 if(!Array.isArray(expr))return expr;
 const [op,...args]=expr,e=value=>evaluate(value,properties,point);
 if(op==='literal')return args[0];
 if(op==='get')return properties[args[0]];
 if(op==='all')return args.every(e);
 if(op==='any')return args.some(e);
 if(op==='==')return e(args[0])===e(args[1]);
 if(op==='in')return e(args[1]).includes(e(args[0]));
 if(op==='within'){const ring=args[0].coordinates[0];return point[0]>ring[0][0]&&point[0]<ring[2][0]&&point[1]>ring[0][1]&&point[1]<ring[2][1]}
 throw Error(op);
}
const cities=JSON.parse(g.run('JSON.stringify(cities)'));
for(const [name,city] of Object.entries(cities))assert.ok(evaluate(predicate,{name,class:'city'},[city.lng,city.lat]),name);
assert.ok(!evaluate(predicate,{name:'Araraquara',class:'city'},[-48.18,-21.79]));
assert.ok(!evaluate(predicate,{name:'São Paulo',class:'state'},[-46.6333,-23.5505]));
assert.ok(!evaluate(predicate,{name:'Santo André',class:'city'},[-36.62,-7.22]),'Homonym outside the registered location');
assert.ok(!evaluate(predicate,{name:'Mauá',class:'suburb'},[-46.46,-23.66]),'Neighborhood names are retained');
const morro=cities['Morro do Índio'];
for(const name of ['Morro do Índio','Morro do índio','Morro do Indio','Morro do indio']){
 for(const kind of ['village','suburb','neighbourhood'])
  assert.ok(evaluate(predicate,{name,class:kind},[morro.lng,morro.lat]),name+' '+kind);
 assert.ok(!evaluate(predicate,{name,class:'village'},[-46,-22]),'Distant homonyms remain visible');
}
assert.ok(!evaluate(predicate,{name:'Jardim Ângela',class:'suburb'},[morro.lng,morro.lat]),'Other neighborhoods remain visible');
console.log('PASS: registered city names hidden by name AND location; other cities, states, neighborhoods and road labels preserved.');

for(const name of ['Jardim Copacabana','Jardim Idemori','Jardim idemori']){
 for(const kind of ['village','suburb','quarter','neighbourhood'])
  assert.ok(evaluate(predicate,{name,class:kind},[-46.79567,-23.70385]),name+' '+kind);
 assert.ok(!evaluate(predicate,{name,class:'quarter'},[-46,-22]),'Distant neighborhood homonyms remain visible');
}
const ipava=cities['Cidade Ipava'];
for(const kind of ['village','suburb','quarter'])assert.ok(evaluate(predicate,{name:'Cidade Ipava',class:kind},[ipava.lng,ipava.lat]));

for(const name of ['Betel','Nova Aparecida','Arcadas','Três Pontes']){
 const city=cities[name];
 for(const kind of ['village','suburb','quarter'])assert.ok(evaluate(predicate,{name,class:kind},[city.lng,city.lat]));
 assert.ok(!evaluate(predicate,{name,class:'village'},[-40,-10]),'Distant homonym preserved');
}
