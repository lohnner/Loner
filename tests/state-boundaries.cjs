const assert=require('node:assert/strict');
const fs=require('node:fs');
const {game}=require('./production.cjs');
(async()=>{
 const data=JSON.parse(fs.readFileSync('assets/maps/brazil-states.geojson','utf8'));
 assert.equal(new Set(data.features.map(f=>f.properties.codarea)).size,27);
 for(const id of ['35','41']){
  const feature=data.features.find(f=>f.properties.codarea===id);
  assert.ok(feature);
  for(const polygon of feature.geometry.coordinates)for(const ring of polygon){
   assert.deepEqual(ring[0],ring.at(-1),'State contours must be closed');
  }
 }
 const g=game(),layers=[],events={},pane={style:{}};
 let zoom=7;
 const map={getPane:()=>null,createPane:()=>pane,getZoom:()=>zoom,on:(event,fn)=>events[event]=fn,once:(event,fn)=>events[event]=fn,off:event=>delete events[event]};
 g.context.fetch=async()=>({ok:true,json:async()=>data});
 g.context.L={geoJSON:(geo,options)=>{const layer={geo,options,addTo:()=>{layers.push(layer);return layer},setStyle:style=>layer.style=style};return layer}};
 g.context.map=map;g.context.signal={aborted:false};
 await g.run('addStateBoundaries(map,signal)');
 assert.equal(layers.length,2);assert.equal(layers[1].geo.features.length,27);
 assert.equal(pane.style.zIndex,'390');assert.equal(pane.style.pointerEvents,'none');
 assert.equal(layers[1].options.interactive,false);assert.equal(layers[1].options.fill,false);
 assert.equal(layers[1].options.smoothFactor,0);
 assert.ok(layers[0].style.weight>layers[1].style.weight);
 zoom=12;events.zoomend();assert.equal(layers[1].style.weight,2.6);
 events.unload();assert.equal(events.zoomend,undefined);
 layers.length=0;g.context.signal={aborted:true};
 await g.run('addStateBoundaries(map,signal)');assert.equal(layers.length,0);
 console.log('PASS: 27 state contours, closed SP/PR polygons, halo, zoom styling and map cleanup.');
})().catch(error=>{console.error(error);process.exitCode=1});