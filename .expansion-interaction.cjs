const fs=require('fs');let s=fs.readFileSync('script.js','utf8');s=s.replace('if(activeMap)renderLiveDrivers();\n}', '}');
s=s.replace('if(marker)marker.setLatLng(entry.position).setIcon(icon);', "const iconKey=entry.players.length>1?entry.players.length+':'+driverPhotoSize():null;\n  if(marker){marker.setLatLng(entry.position);if(!iconKey||marker._iconKey!==iconKey)marker.setIcon(icon)}");
s=s.replace('marker._players=entry.players;', 'marker._iconKey=iconKey;marker._players=entry.players;');
fs.writeFileSync('script.js',s);
