const fs=require('fs');let s=fs.readFileSync('script.js','utf8');function rep(a,b){if(!s.includes(a))throw Error(a.slice(0,80));s=s.replace(a,b)}
rep("status:state.trip?'Em viagem':'Online',lastSeen:serverTimestamp()", "status:state.trip?'Em viagem':'Online',lastActionAt:Number(state.lastActionAt)||0,lastSeen:serverTimestamp()");
rep('onlinePlayers=allPlayers;', 'onlinePlayers=allPlayers.filter(player=>isMapPlayerActive(player));');
rep('facility:state.facility||null,trip:state.trip};', 'facility:state.facility||null,trip:state.trip,lastActionAt:Number(state.lastActionAt)||0};');
rep('return [...onlinePlayers.filter(p=>p.uid!==user.uid),own];', 'return [...onlinePlayers.filter(p=>p.uid!==user.uid),own].filter(player=>isMapPlayerActive(player));');
a=s.indexOf('function renderLiveDrivers(){');b=s.indexOf('function driverLiveCard(',a);
s=s.slice(0,a)+`function renderLiveDrivers(){
 if(!activeMap)return;const visible=new Set(),routeIds=new Set();
 for(const entry of mapPlayerGroups()){
  const key=entry.key;visible.add(key);let marker=liveDriverMarkers.get(key);
  const icon=entry.players.length>1?playerGroupIcon(entry.players.length):driverIcon(entry.players[0]);
  if(marker)marker.setLatLng(entry.position).setIcon(icon);
  else{marker=L.marker(entry.position,{icon,zIndexOffset:2000});if(playersVisible)marker.addTo(activeMap);liveDriverMarkers.set(key,marker)}
  marker._players=entry.players;
  const memberKey=entry.players.map(p=>p.uid+':'+p.name+':'+p.photo).join('|');
  if(entry.players.length>1){
   if(marker._memberKey!==memberKey){marker.unbindPopup();marker.bindPopup(playerGroupList(entry.players),{className:'driver-live-popup',minWidth:260,maxWidth:320});marker.off('popupopen');marker.on('popupopen',()=>bindPlayerGroupPopup(marker));marker._memberKey=memberKey}
  }else{
   const player=entry.players[0],content=driverLiveCard(player);if(marker.getPopup())marker.getPopup().setContent(content);else marker.bindPopup(content,{className:'driver-live-popup',minWidth:265,maxWidth:310});
   if(!marker._contextBound){marker.on('contextmenu',event=>openMapContext(player.uid,event.latlng));marker._contextBound=true}
  }
  for(const player of entry.players){
   if(!player.trip||player.trip.end<=Date.now())continue;
   const path=player.trip.path;if(!path?.length)continue;routeIds.add(player.uid);
   const road=liveDriverRoutes.get(player.uid);if(road)road.setLatLngs(path);else liveDriverRoutes.set(player.uid,L.polyline(path,{color:player.uid===user.uid?'#ff9d42':'#64c8ff',weight:3,opacity:.7,dashArray:player.uid===user.uid?null:'8 8'}).addTo(activeMap));
  }
 }
 for(const[key,marker]of liveDriverMarkers)if(!visible.has(key)){marker.remove();liveDriverMarkers.delete(key)}
 for(const[id,road]of liveDriverRoutes)if(!routeIds.has(id)){road.remove();liveDriverRoutes.delete(id)}
}
`+s.slice(b);
a=s.indexOf('const baseRenderLiveDrivers=');b=s.indexOf('\n',a);if(a<0)throw Error('wrapper');s=s.slice(0,a)+s.slice(b+1);
rep("const zoom=activeMap?.getZoom()||7,originalSize=Math.max(34,Math.min(82,34+(zoom-5)*8)),size=Math.round(originalSize*.4),status=", "const size=driverPhotoSize(),status=");
s+=`
const MAP_INACTIVITY_MS=2*24*60*60*1000;
let activityPublishedAt=0;
function mapActivityTime(player){
 if(Object.prototype.hasOwnProperty.call(player,'lastActionAt'))return Number(player.lastActionAt)||0;
 // Old profiles get one migration window based on their last known connection.
 const seen=player.lastSeen;return typeof seen?.toMillis==='function'?seen.toMillis():Number(seen?.seconds)?Number(seen.seconds)*1000:Number(seen)||0;
}
function isMapPlayerActive(player,now=Date.now()){const at=mapActivityTime(player);return at>0&&now-at<MAP_INACTIVITY_MS}
function recordPlayerActivity(event){
 if(!event?.isTrusted||!user||!state||productionBusy)return;
 if(event.type==='keydown'&&['Shift','Control','Alt','Meta','CapsLock'].includes(event.key))return;
 if(!event.target?.closest?.('#app'))return;
 const now=Date.now(),wasHidden=!isMapPlayerActive({lastActionAt:state.lastActionAt},now);state.lastActionAt=now;
 localStorage.setItem(key(),JSON.stringify(state));
 if(wasHidden||now-activityPublishedAt>=15000){activityPublishedAt=now;syncProgress();syncPresence()}
 if(activeMap)renderLiveDrivers();
}
addEventListener('pointerdown',recordPlayerActivity,{capture:true});
addEventListener('keydown',recordPlayerActivity,{capture:true});
function driverPhotoSize(){const zoom=activeMap?.getZoom()||7;return Math.round(Math.max(34,Math.min(82,34+(zoom-5)*8))*.4)}
function mapPlayerGroups(){
 const groups=new Map();
 for(const player of mapPlayers()){
  const moving=player.trip&&player.trip.end>Date.now(),path=player.trip?.path;
  const position=moving&&path?.length?pathPosition(path,remoteTripStatus(player.trip).pct):parkedPlayerPosition(player);
  if(!position)continue;
  const key=moving?'driver:'+player.uid:'place:'+position.map(n=>Number(n).toFixed(5)).join(',');
  if(!groups.has(key))groups.set(key,{key,position,players:[]});groups.get(key).players.push(player);
 }
 return [...groups.values()];
}
function playerGroupIcon(count){const size=driverPhotoSize();return L.divIcon({className:'player-count-wrap',html:'<button class="player-count-marker" style="--player-size:'+size+'px" aria-label="'+count+' jogadores neste local">'+count+'</button>',iconSize:[size,size],iconAnchor:[size/2,size/2]})}
function playerGroupList(players){return '<div class="map-player-list"><h3>'+players.length+' jogadores no local</h3>'+players.map(player=>'<button data-map-member="'+escapeHTML(player.uid)+'"><img src="'+escapeHTML(player.photo||avatar(player.name))+'" alt=""><span>'+escapeHTML(player.name)+'</span><b>→</b></button>').join('')+'</div>'}
function bindPlayerGroupPopup(marker){
 const root=marker.getPopup()?.getElement();root?.querySelectorAll('[data-map-member]').forEach(button=>button.onclick=()=>{
  const player=marker._players.find(p=>p.uid===button.dataset.mapMember);if(!player)return;
  marker.getPopup().setContent(driverLiveCard(player)+'<div class="map-player-selection"><a href="#jogador/'+encodeURIComponent(player.uid)+'">ABRIR PERFIL</a><button data-map-back>VOLTAR À LISTA</button></div>');
  marker.getPopup().getElement()?.querySelector('[data-map-back]')?.addEventListener('click',()=>{marker.getPopup().setContent(playerGroupList(marker._players));bindPlayerGroupPopup(marker)});
 });
}
`;
// A profile may disappear and later return at the same point; never retain stale popup mode.
s=s.replace("const memberKey=entry.players.map(p=>p.uid+':'+p.name+':'+p.photo).join('|');", "const memberKey=entry.players.map(p=>p.uid+':'+p.name+':'+p.photo).join('|');if(entry.players.length===1&&marker._memberKey){marker.unbindPopup();marker.off('popupopen');marker._memberKey=null}");
fs.writeFileSync('script.js',s);
